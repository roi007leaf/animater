import test from "node:test";
import assert from "node:assert/strict";
import { composeFinisher, travelEnd, planEnd, motionEnd, finisherDirection, playFinisher, fadedAtEnd, pathAim } from "../scripts/finisher-play.mjs";
import { normalizeFinisher, validateRecipe } from "../scripts/model.mjs";
import { timedStages } from "../scripts/composition.mjs";

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
  assert.equal(fadedAtEnd(pathRecipe([kf(0), kf(1, 0.3, 0, { alpha: 0 })]), false), true);
  assert.equal(fadedAtEnd({ ...pathRecipe([]), stages: [pathTravel([kf(0), kf(1, 1, 0)], { motionEnd: undefined })] }, false), false, "nothing held in place");
  assert.equal(fadedAtEnd(pathRecipe([kf(0), kf(1, 1, 0, { alpha: 0 })]), true), false, "a path that moved the token lands visible: it still fades");
});

test("a travelling path that ends invisible still fades after it lands (the landing snaps it visible)", async () => {
  const host = gridHost();
  await playFinisher({ recipe: pathRecipe([kf(0), kf(1, 3, 0, { alpha: 0 })], { ending: "vanish" }), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: true }, host);
  assert.ok(host.log.some((e) => e[0] === "commit" && e[1].x === 400), "it moved");
  assert.ok(host.log.some((e) => e[0] === "fade"), "the separate fade runs");
  assert.deepEqual(host.log.at(-1), ["commit", { hidden: true, finisher: "p" }]);
});

test("a framed path keeps its exact landing after remote validation, even when the pinned end exceeds 12", async () => {
  const host = gridHost();
  const c = Math.cos(Math.PI / 6) * 100, s = Math.sin(Math.PI / 6) * 100;
  const mover = at("Orc", 1000, 1000), attacker = { name: "Hero", center: { x: mover.center.x - c, y: mover.center.y - s }, document: { x: 0, y: 0 } };
  await playFinisher({ recipe: pathRecipe([kf(0), kf(1, 12, 12)]), mover, attacker, dead: false }, host);
  const played = host.log.find((e) => e[0] === "play");
  const [, frame, last] = played;
  assert.ok(Math.abs(last.x) > 12 || Math.abs(last.y) > 12, "the pinned end really is outside the authored limit");
  const stage = { ...pathTravel([kf(0), last]), motionFrame: frame };
  const valid = validateRecipe({ id: "p", name: "Path", trigger: "manual", stages: [stage] }).stages[0];
  const end = valid.keyframes.at(-1), commit = host.log.find((e) => e[0] === "commit")[1];
  const fx = (end.x * frame.cos - end.y * frame.sin) * frame.k, fy = (end.x * frame.sin + end.y * frame.cos) * frame.k;
  assert.ok(Math.abs(fx * 100 - (commit.x - commit.fromX)) < 1e-6 && Math.abs(fy * 100 - (commit.y - commit.fromY)) < 1e-6);
});

test("a duplicated travelling path is not flown twice: only the travel path is framed", () => {
  const a = pathTravel([kf(0), kf(1, 2, 0)]), b = { ...pathTravel([kf(0), kf(1, 2, 0)]), stageId: "fly-copy" };
  const spin = { ...pathTravel([kf(0), kf(1, 0, 0, { rotation: 360 })]), stageId: "spin" };
  const { recipe: r, moves } = composeFinisher({ ...pathRecipe([]), stages: [a, b, spin] }, { offset: { x: 2, y: 0 }, frame: { aim: { x: 1, y: 0 }, length: 2 } });
  assert.equal(moves, true);
  assert.equal(r.stages.filter((s) => s.motionFrame).length, 1);
  assert.ok(r.stages[0].motionFrame, "the travel path (the first) is the framed one");
  assert.equal(r.stages[1].motionEnd, undefined, "the copy comes back");
  assert.equal(r.stages[2].motionEnd, "hold", "an in-place held path keeps its hold");
});

test("in place is decided from the aimed end: (0.6, 0) at 45° rounds to no square", async () => {
  const host = gridHost();
  const mover = at("Orc", 1000, 1000), d = 100 / Math.SQRT2, attacker = { name: "Hero", center: { x: mover.center.x - d, y: mover.center.y - d }, document: { x: 0, y: 0 } };
  await playFinisher({ recipe: pathRecipe([kf(0), kf(1, 0.6, 0)]), mover, attacker, dead: false }, host);
  assert.ok(!host.log.some((e) => e[0] === "landing"), "no landing asked for");
  assert.equal(host.log.find((e) => e[0] === "play")[1], null, "not framed");
  assert.ok(!host.log.some((e) => e[0] === "commit" && e[1].x !== undefined), "no move");
  const kept = composeFinisher(pathRecipe([kf(0), kf(1, 0.6, 0)]), { inPlace: true });
  assert.equal(kept.recipe.stages[0].motionEnd, "hold", "an in-place travel path keeps its hold");
  assert.equal(kept.moves, false);
});

test("a source-mover path lands away from the target", async () => {
  const host = gridHost();
  const recipe = { ...pathRecipe([], { mover: "source" }), stages: [pathTravel([kf(0), kf(1, 2, 0)], { subject: "source" })] };
  await playFinisher({ recipe, mover: at("Hero", 100, 100), attacker: at("Hero", 100, 100), target: at("Orc", 200, 100), dead: false }, host);
  const [, dx, dy, squares] = host.log.find((e) => e[0] === "landing");
  assert.deepEqual([dx + 0, dy + 0, squares], [-1, 0, 2], "mover left of the target is pushed further left");
  assert.deepEqual(host.log.find((e) => e[0] === "commit")[1], { x: -100, y: 100, fromX: 100, fromY: 100, finisher: "p" });
});

test("an in-place held path skips the separate fade even when it ends visible", async () => {
  const host = gridHost();
  await playFinisher({ recipe: pathRecipe([kf(0), kf(1, 0, 0, { scale: 0.5 })], { ending: "vanish" }), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: true }, host);
  assert.ok(!host.log.some((e) => e[0] === "fade"), "a fade would pop it back to full size");
  assert.deepEqual(host.log.at(-1), ["commit", { hidden: true, finisher: "p" }]);
});

test("a survivor does not sit shrunk: an in-place held path loses its hold", async () => {
  const host = gridHost();
  await playFinisher({ recipe: pathRecipe([kf(0), kf(1, 0, 0, { scale: 0.3, alpha: 0.2 })], { on: "use" }), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: false }, host);
  assert.equal(host.log.find((e) => e[0] === "play")[3], null, "hold stripped");
  const dead = gridHost();
  await playFinisher({ recipe: pathRecipe([kf(0), kf(1, 0, 0, { scale: 0.3, alpha: 0.2 })], { ending: "body" }), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: true }, dead);
  assert.equal(dead.log.find((e) => e[0] === "play")[3], "hold", "a killed mover keeps it");
});

// Wall slam: a path stopped by a wall is cut where it hits, not shrunk, and the wall-* stages play there.
const slamRecipe = (keyframes, wall = "slam") => ({ ...pathRecipe(keyframes, { wall }), stages: [
  pathTravel(keyframes, { delay: 100 }),
  { stageId: "wall-crack", kind: "impact", assets: ["jb2a.impact.005.white"], delay: 1100, duration: 1500 },
  { stageId: "wall-shake", kind: "motion", motion: "shake", subject: "targets", assets: [], delay: 1100, duration: 500 },
  { stageId: "landing", kind: "impact", assets: ["jb2a.impact.003.white"], delay: 1100, duration: 1200 },
] });
const slamHost = (blockAfter) => {
  const host = gridHost(blockAfter);
  host.play = async (r) => { host.log.push(["stages", r.stages]); return r.stages.map((s) => ({ ...s, delay: s.delay ?? 0 })); };
  return host;
};
const played = (host) => host.log.find((e) => e[0] === "stages")[1];
const byId = (stages, id) => stages.find((s) => s.stageId === id);
// When each stage really starts: links win over numeric delays.
const starts = (stages) => Object.fromEntries(timedStages({ stages }).map((s) => [s.stageId, s.delay]));

test("slam, blocked after 3 of 6 squares: the path is cut at the wall at full speed and the crash plays there", async () => {
  const host = slamHost(3);
  await playFinisher({ recipe: slamRecipe([kf(0), kf(1, 6, 0)]), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: false }, host);
  const stages = played(host), fly = byId(stages, "fly"), last = fly.keyframes.at(-1), { k, cos, sin } = fly.motionFrame;
  assert.ok(Math.abs(last.x * k - 3) < 0.01 && Math.abs(last.y) < 1e-9, "ends about 3 squares out");
  const commit = host.log.find((e) => e[0] === "commit")[1];
  assert.deepEqual(commit, { x: 400, y: 100, fromX: 100, fromY: 100, finisher: "p" });
  const fx = (last.x * cos - last.y * sin) * k, fy = (last.x * sin + last.y * cos) * k;
  assert.ok(Math.abs(fx * 100 - 300) < 1e-6 && Math.abs(fy * 100) < 1e-6, "pose end == commit landing");
  assert.ok(Math.abs(fly.duration - 500) <= 2, `about half the time: ${fly.duration}`);
  const crack = byId(stages, "wall-crack"), shake = byId(stages, "wall-shake"), start = starts(stages);
  assert.equal(start["wall-crack"], 100 + fly.duration);
  assert.equal(start["wall-shake"], 100 + fly.duration);
  assert.deepEqual([crack.offsetX, crack.offsetY], [3.5, 0], "half a square past the landing, toward the wall");
  assert.equal(shake.offsetX, undefined, "a motion stage is not offset");
  assert.equal(byId(stages, "landing"), undefined, "no landing: it hit the wall");
});

test("slam, not blocked: flies the full path and lands hard", async () => {
  const host = slamHost();
  const keyframes = [kf(0), kf(1, 6, 0)];
  await playFinisher({ recipe: slamRecipe(keyframes), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: false }, host);
  const stages = played(host), fly = byId(stages, "fly");
  assert.deepEqual(fly.keyframes, keyframes);
  assert.equal(fly.duration, 1000);
  assert.ok(!stages.some((s) => s.stageId.startsWith("wall")), "no wall, no crash");
  assert.equal(byId(stages, "landing").offsetX, 6);
  assert.equal(host.log.find((e) => e[0] === "commit")[1].x, 700);
});

test("fit mode, blocked: the path still shrinks to the free square and the wall stages are dropped", async () => {
  const host = slamHost(3);
  await playFinisher({ recipe: slamRecipe([kf(0), kf(1, 6, 0)], "fit"), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: false }, host);
  const stages = played(host), fly = byId(stages, "fly");
  assert.equal(fly.motionFrame.k, 0.5);
  assert.equal(fly.duration, 1000);
  assert.deepEqual(fly.keyframes.at(-1).x, 6);
  assert.ok(!stages.some((s) => s.stageId.startsWith("wall")));
  assert.equal(byId(stages, "landing").offsetX, 3);
  assert.equal(host.log.find((e) => e[0] === "commit")[1].x, 400);
});

test("slam against a wall right there: a short bump that comes back, the crash still plays", async () => {
  const host = slamHost(0);
  await playFinisher({ recipe: slamRecipe([kf(0), kf(1, 2, 0)]), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: false }, host);
  const stages = played(host), fly = byId(stages, "fly");
  assert.ok(!host.log.some((e) => e[0] === "commit"), "nothing moves");
  assert.equal(fly.motionEnd, undefined, "the bump returns");
  assert.equal(fly.motionFrame, undefined);
  assert.ok(Math.abs(Math.hypot(fly.keyframes.at(-1).x, fly.keyframes.at(-1).y) - 0.4) < 0.01, "bumps 0.4 square");
  assert.ok(Math.abs(fly.duration - 200) <= 2, `about 1000 * 0.2: ${fly.duration}`);
  const crack = byId(stages, "wall-crack"), start = starts(stages);
  assert.ok(Math.abs(start["wall-crack"] - (100 + 0.85 * fly.duration)) <= 1, "the crash plays at contact: a returning path reaches its end at 85%");
  assert.deepEqual([crack.offsetX, crack.offsetY], [0.5, 0]);
  assert.ok(byId(stages, "wall-shake"));
  assert.equal(byId(stages, "landing"), undefined);
});

test("a recipe without a slam never plays wall stages", () => {
  const r = { ...recipe(), stages: [travel, { stageId: "wall-dust", kind: "impact", assets: [] }, { stageId: "landing", kind: "impact", assets: [] }] };
  const { recipe: out } = composeFinisher(r, { offset: { x: 2, y: 0 } });
  assert.deepEqual(out.stages.map((s) => s.stageId), ["fly", "landing"]);
});

test("a killed mover's slam bump still comes back, and a short cut still lands", async () => {
  const bump = slamHost(0);
  await playFinisher({ recipe: slamRecipe([kf(0), kf(1, 2, 0)]), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: true }, bump);
  assert.equal(byId(played(bump), "fly").motionEnd, undefined, "no hold at 0.4 square");
  const short = slamHost(1);
  await playFinisher({ recipe: slamRecipe([kf(0), kf(1, 6, 0)]), mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: true }, short);
  assert.ok(byId(played(short), "fly").motionFrame, "the cut travel is framed");
  assert.equal(short.log.find((e) => e[0] === "commit")[1].x, 200);
});

test("wall stages follow the cut travel's end even when the travel is linked after another stage", async () => {
  const base = slamRecipe([kf(0), kf(1, 6, 0)]);
  const hit = { stageId: "hit", kind: "impact", assets: ["jb2a.impact.005.white"], delay: 0, duration: 800 };
  const r = { ...base, stages: [hit, { ...base.stages[0], delay: 0, afterStage: "hit", timingAnchor: "start", startOffset: 250 }, ...base.stages.slice(1)] };
  const host = slamHost(3);
  await playFinisher({ recipe: r, mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: false }, host);
  const stages = played(host), start = starts(stages), fly = byId(stages, "fly");
  assert.equal(start.fly, 250);
  assert.equal(start["wall-crack"], 250 + fly.duration);
  assert.equal(start["wall-shake"], 250 + fly.duration);
});

test("a stage linked to a dropped stage keeps its time and loses the link", async () => {
  const base = slamRecipe([kf(0), kf(1, 6, 0)]);
  const sound = { stageId: "boom", kind: "sound", assets: [], soundFile: "sounds/boom.ogg", delay: 0, duration: 1000, afterStage: "wall-crack", timingAnchor: "end", startOffset: 0, startMode: "after", startRef: "wall-crack" };
  const r = { ...base, stages: [...base.stages, sound] };
  const before = starts(r.stages).boom;
  for (const [blockAfter, gone] of [[Infinity, "wall-crack"], [3, "landing"]]) {
    const linked = { ...r, stages: r.stages.map((s) => (s.stageId === "boom" ? { ...s, afterStage: gone, startRef: gone } : s)) };
    const was = starts(linked.stages).boom;
    const host = slamHost(blockAfter);
    await playFinisher({ recipe: linked, mover: at("Orc", 100, 100), attacker: at("Hero", 0, 100), dead: false }, host);
    const stages = played(host), boom = byId(stages, "boom");
    assert.equal(byId(stages, gone), undefined, `${gone} is dropped`);
    assert.ok(!boom.afterStage && boom.startMode === undefined && boom.startRef === undefined, "unlinked");
    assert.equal(boom.delay, was, "plays when it did");
    assert.doesNotThrow(() => timedStages(validateRecipe({ ...linked, stages })));
  }
  assert.equal(before, 2600);
});

test("a source mover's slam leaves the target's crash where it is and does not shake the target", async () => {
  const keyframes = [kf(0), kf(1, 6, 0)];
  const base = slamRecipe(keyframes);
  const r = { ...base, finisher: normalizeFinisher({ knockback: 5, wall: "slam", mover: "source" }), stages: [pathTravel(keyframes, { subject: "source", delay: 100 }), ...base.stages.slice(1)] };
  const host = slamHost(1);
  await playFinisher({ recipe: r, mover: at("Hero", 100, 100), attacker: at("Hero", 100, 100), target: at("Orc", 200, 100), dead: false }, host);
  const stages = played(host), crack = byId(stages, "wall-crack");
  assert.equal(host.log.find((e) => e[0] === "commit")[1].x, 0, "the user did move one square");
  assert.equal(crack.offsetX, undefined, "an impact plays on the target: not offset by the user's landing");
  assert.equal(starts(stages)["wall-crack"], 100 + byId(stages, "fly").duration, "still timed to the hit");
  assert.equal(byId(stages, "wall-shake"), undefined, "a targets shake would shake the wrong token");
});
