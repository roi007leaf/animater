import test from "node:test";
import assert from "node:assert/strict";
import { composeFinisher, travelEnd, planEnd, motionEnd, finisherDirection, playFinisher, fadedAtEnd, pathAim } from "../scripts/finisher-play.mjs";
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

const pathTravel = (keyframes, extra = {}) => ({ stageId: "fly", kind: "motion", motion: "path", subject: "targets", motionEnd: "hold", duration: 1000, keyframes, ...extra });
const kf = (at, x = 0, y = 0, extra = {}) => ({ at, x, y, rotation: 0, scale: 1, alpha: 1, ease: "linear", sharp: false, ...extra });
const pathRecipe = (keyframes, finisher = {}) => ({ id: "p", name: "Path", trigger: "manual", finisher: normalizeFinisher({ knockback: 5, ...finisher }), stages: [pathTravel(keyframes)] });
const at = (name, x, y) => ({ name, center: { x: x + 50, y: y + 50 }, document: { x, y } });
// A landing that walks the grid like landingSpot: the longer axis advances one square per step.
const gridHost = (blockAfter = Infinity) => {
  const log = [];
  return { log, gridSize: () => 100,
    landing: (m, d, squares) => { const steps = Math.min(squares, blockAfter), lead = Math.max(Math.abs(d.x), Math.abs(d.y)); log.push(["landing", Math.round(d.x * 1000) / 1000, Math.round(d.y * 1000) / 1000, squares]);
      return { x: m.document.x + Math.round((d.x / lead) * steps) * 100, y: m.document.y + Math.round((d.y / lead) * steps) * 100 }; },
    play: async (r) => { log.push(["play", r.stages[0].motionFrame ?? null, r.stages[0].keyframes?.at(-1) ?? null, r.stages[0].motionEnd ?? null]); return [{ ...r.stages[0], delay: 0 }]; },
    wait: async (ms) => log.push(["wait", ms]), fade: async () => log.push(["fade"]),
    commit: async (_t, data) => log.push(["commit", data]), trace: (s, d) => log.push([s, d]) };
};

test("a path is aimed away from the attacker, lands where it ends, and is not stretched to knockback", async () => {
  const host = gridHost();
  await playFinisher({ recipe: pathRecipe([kf(0), kf(0.5, 1, 0.5), kf(1, 2, 0)]), mover: at("Orc", 100, 100), attacker: at("Hero", 100, 0), dead: false }, host);
  assert.deepEqual(host.log.find((e) => e[0] === "landing"), ["landing", 0, 1, 2], "aimed down (away from an attacker above), 2 squares, not knockback 5");
  const [, frame, last] = host.log.find((e) => e[0] === "play");
  assert.deepEqual(frame, { cos: 0, sin: 1, k: 1 });
  assert.deepEqual([last.x, last.y], [2, 0]);
  assert.deepEqual(host.log.find((e) => e[0] === "commit")[1], { x: 100, y: 300, fromX: 100, fromY: 100, finisher: "p" });
});

test("a wall shrinks the whole path to the last free square and pins its end exactly there", async () => {
  const host = gridHost(1);
  await playFinisher({ recipe: pathRecipe([kf(0), kf(1, 2, 0)]), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: false }, host);
  const [, frame, last] = host.log.find((e) => e[0] === "play");
  assert.equal(frame.k, 0.5);
  assert.ok(Math.abs(last.x * frame.k - 1) < 1e-9 && Math.abs(last.y) < 1e-9, "final pose equals the one-square landing");
  assert.deepEqual(host.log.find((e) => e[0] === "commit")[1], { x: 200, y: 100, fromX: 100, fromY: 100, finisher: "p" });
});

test("a diagonal end off the grid lands on the snapped square with no jump", async () => {
  const host = gridHost();
  await playFinisher({ recipe: pathRecipe([kf(0), kf(1, 2.6, 1.2)]), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: false }, host);
  const [, frame, last] = host.log.find((e) => e[0] === "play");
  const commit = host.log.find((e) => e[0] === "commit")[1];
  const finalX = (last.x * frame.cos - last.y * frame.sin) * frame.k, finalY = (last.x * frame.sin + last.y * frame.cos) * frame.k;
  assert.ok(Math.abs(finalX * 100 - (commit.x - 100)) < 1e-6 && Math.abs(finalY * 100 - (commit.y - 100)) < 1e-6, "pose end == document landing");
});

test("a fully blocked path, or no attacker, does not move the token and the travel comes back", async () => {
  for (const [host, attacker] of [[gridHost(0), at("Hero", 0, 100)], [gridHost(), null]]) {
    await playFinisher({ recipe: pathRecipe([kf(0), kf(1, 2, 0)]), mover: at("Orc", 100, 100), attacker, dead: false }, host);
    assert.ok(!host.log.some((e) => e[0] === "commit"));
    assert.equal(host.log.find((e) => e[0] === "play")[3], null, "hold stripped");
  }
});

test("an in-place path keeps its hold and never moves the document", async () => {
  const host = gridHost();
  await playFinisher({ recipe: pathRecipe([kf(0), kf(1, 0.3, 0, { scale: 0.05, alpha: 0 })], { ending: "vanish" }), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: true }, host);
  assert.equal(host.log.find((e) => e[0] === "play")[3], "hold");
  assert.ok(!host.log.some((e) => e[0] === "landing"));
  assert.ok(!host.log.some((e) => e[0] === "fade"), "already faded by the path: no separate fade that would pop it back");
  assert.deepEqual(host.log.at(-1), ["commit", { hidden: true, finisher: "p" }]);
});

test("pathAim points away from the other token for either mover", () => {
  assert.deepEqual(pathAim(normalizeFinisher({}), { mover: at("Orc", 100, 0), attacker: at("Hero", 0, 0) }), { x: 1, y: 0 });
  assert.deepEqual(pathAim(normalizeFinisher({ mover: "source" }), { mover: at("Hero", 0, 0), target: at("Orc", 100, 0) }), { x: -1, y: 0 });
  assert.equal(fadedAtEnd(pathRecipe([kf(0), kf(1, 1, 0, { alpha: 0 })])), true);
  assert.equal(fadedAtEnd(pathRecipe([kf(0), kf(1, 1, 0)])), false);
});
