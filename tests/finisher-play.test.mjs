import test from "node:test";
import assert from "node:assert/strict";
import { composeFinisher, travelEnd, planEnd, motionEnd, finisherDirection, playFinisher } from "../scripts/finisher-play.mjs";
import { normalizeFinisher } from "../scripts/model.mjs";

const travel = { stageId: "fly", kind: "motion", motion: "leap", subject: "targets", motionEnd: "hold", duration: 1000, assets: [] };
const recipe = (finisher = {}, stages = [travel, { stageId: "landing", kind: "impact", assets: ["jb2a.impact.003.white"] }]) =>
  ({ id: "f", name: "Fling", trigger: "manual", finisher: normalizeFinisher({ knockback: 2, ...finisher }), stages });

test("compose puts the landing square on the mover's held travel and landing stage", () => {
  const { recipe: r, moves } = composeFinisher(recipe(), { offset: { x: 2, y: 0 } });
  assert.equal(moves, true);
  assert.deepEqual(r.stages[0].motionOffset, { x: 2, y: 0 });
  assert.equal(r.stages[1].offsetX, 2);
  assert.equal(r.stages[1].offsetY, 0);
});

test("compose without a landing square strips the hold so travel comes back", () => {
  const { recipe: r, moves } = composeFinisher(recipe(), { offset: null });
  assert.equal(moves, false);
  assert.equal(r.stages[0].motionEnd, undefined);
});

test("compose leaves other movers' stages alone", () => {
  const { recipe: r, moves } = composeFinisher(recipe({ mover: "source" }), { offset: { x: 1, y: 0 } });
  assert.equal(moves, false);
  assert.equal(r.stages[0].motionOffset, undefined);
  assert.equal(r.stages[0].motionEnd, undefined, "a held stage that is not the mover's returns");
});

test("travel end is when the last landing travel finishes; plan end is when everything does", () => {
  const plan = [{ kind: "motion", motionOffset: { x: 1, y: 0 }, delay: 200, duration: 1000 }, { kind: "impact", delay: 0, duration: 1800 }, { kind: "motion", delay: 0, duration: 400 }];
  assert.equal(travelEnd(plan), 1200);
  assert.equal(planEnd(plan), 1800);
  assert.equal(travelEnd([]), 0);
});

test("the ending starts when the mover's last motion ends, else when the plan ends", () => {
  const plan = [{ kind: "motion", delay: 300, duration: 1400 }, { kind: "impact", delay: 1500, duration: 1500 }, { kind: "sound", delay: 0, duration: 4000 }];
  assert.equal(motionEnd(plan), 1700, "a vanish fades before a motion-less tail lets it reappear");
  assert.equal(motionEnd([{ kind: "impact", delay: 0, duration: 1500 }]), 1500);
});

test("targets are flung away from the attacker; the user travels toward the target", () => {
  const at = (x, y) => ({ center: { x, y } });
  assert.deepEqual(finisherDirection(normalizeFinisher({}), { mover: at(100, 0), attacker: at(0, 0) }), { x: 1, y: 0 });
  assert.deepEqual(finisherDirection(normalizeFinisher({ mover: "source" }), { mover: at(0, 0), target: at(0, 100) }), { x: 0, y: 1 });
  assert.equal(finisherDirection(normalizeFinisher({}), { mover: at(1, 1), attacker: null }), null);
});

const token = (name = "Orc") => ({ name, center: { x: 150, y: 150 }, document: { x: 100, y: 100 } });
const fakeHost = ({ plan = [{ kind: "motion", motionOffset: { x: 2, y: 0 }, delay: 0, duration: 1000 }, { kind: "impact", delay: 0, duration: 1500 }], fail = false, landingThrows = false } = {}) => {
  const log = [];
  return { log,
    gridSize: () => 100,
    landing: (_m, _d, squares) => { if (landingThrows) throw Error("no walls"); return { x: 100 + squares * 100, y: 100 }; },
    play: async (r, context) => { log.push(["play", r.stages[0].motionOffset ?? null, context.source.name, context.targets[0].name]); return plan; },
    wait: async (ms) => log.push(["wait", ms]),
    fade: async (t) => log.push(["fade", t.name]),
    commit: async (_t, data) => { log.push(["commit", data]); if (fail) throw Error("refused"); },
    trace: (status, detail) => log.push([status, detail]) };
};

test("a kill flings the body, moves the token where it landed, then vanishes it", async () => {
  const host = fakeHost();
  assert.equal(await playFinisher({ recipe: recipe({ ending: "vanish" }), mover: token(), attacker: { ...token("Hero"), center: { x: 50, y: 150 } }, dead: true }, host), true);
  assert.deepEqual(host.log, [
    ["Finisher", "Fling: Orc"],
    ["play", { x: 2, y: 0 }, "Hero", "Orc"],
    ["wait", 1000],
    ["commit", { x: 300, y: 100, fromX: 100, fromY: 100, finisher: "f" }],
    ["wait", 0],
    ["fade", "Orc"],
    ["commit", { hidden: true, finisher: "f" }],
  ]);
});

test("a body ending marks the creature Defeated where it lands", async () => {
  const host = fakeHost();
  await playFinisher({ recipe: recipe({ ending: "body" }), mover: token(), attacker: { ...token("Hero"), center: { x: 50, y: 150 } }, dead: true }, host);
  assert.deepEqual(host.log.at(-1), ["commit", { defeated: true, finisher: "f" }]);
});

test("a survivor of a use finisher is moved but never hidden or marked dead", async () => {
  const host = fakeHost();
  await playFinisher({ recipe: recipe({ on: "use", ending: "vanish" }), mover: token(), attacker: { ...token("Hero"), center: { x: 50, y: 150 } }, dead: false }, host);
  assert.ok(!host.log.some(([kind, data]) => kind === "fade" || (kind === "commit" && (data.hidden || data.defeated))));
  assert.ok(host.log.some(([kind, data]) => kind === "commit" && data.x === 300));
});

test("without an attacker nothing moves the document, and the ending waits for the whole finisher", async () => {
  const host = fakeHost({ plan: [{ kind: "impact", delay: 0, duration: 1500 }] });
  await playFinisher({ recipe: recipe({ ending: "body" }), mover: token(), attacker: null, dead: true }, host);
  assert.deepEqual(host.log.slice(1), [["play", null, "Orc", "Orc"], ["wait", 1500], ["commit", { defeated: true, finisher: "f" }]]);
});

test("a finisher that never starts writes nothing and says so (null), so the caller can fall back", async () => {
  const host = fakeHost({ plan: null });
  assert.equal(await playFinisher({ recipe: recipe(), mover: token(), attacker: null, dead: true }, host), null);
  assert.ok(!host.log.some(([kind]) => kind === "commit"));
});

test("a landing that throws is traced and the finisher plays without knockback", async () => {
  const host = fakeHost({ landingThrows: true, plan: [{ kind: "impact", delay: 0, duration: 1500 }] });
  assert.equal(await playFinisher({ recipe: recipe({ ending: "body" }), mover: token(), attacker: { ...token("Hero"), center: { x: 50, y: 150 } }, dead: true }, host), true);
  assert.deepEqual(host.log.find(([kind]) => kind === "Blocked"), ["Blocked", "Finisher Fling landing: no walls"]);
  assert.ok(host.log.some(([kind, offset]) => kind === "play" && offset === null), "travel comes back");
  assert.ok(!host.log.some(([kind, data]) => kind === "commit" && data.x !== undefined));
  assert.deepEqual(host.log.at(-1), ["commit", { defeated: true, finisher: "f" }]);
});

test("a refused move is traced and skips the ending", async () => {
  const host = fakeHost({ fail: true });
  assert.equal(await playFinisher({ recipe: recipe({ ending: "vanish" }), mover: token(), attacker: { ...token("Hero"), center: { x: 50, y: 150 } }, dead: true }, host), false);
  assert.deepEqual(host.log.at(-1), ["Blocked", "Finisher Fling: refused"]);
  assert.ok(!host.log.some(([kind]) => kind === "fade"));
});

test("a source-mover finisher plays from the user and aims its effects at the target", async () => {
  const host = fakeHost();
  await playFinisher({ recipe: recipe({ mover: "source", knockback: 0, ending: "stay" }), mover: token("Hero"), target: token("Orc"), attacker: token("Hero"), dead: false }, host);
  assert.deepEqual(host.log[1], ["play", null, "Hero", "Orc"]);
});
