import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_KEYFRAMES, normalizeKeyframes, samplePath, pathEnd, pathSquares, rotateBy, unrotateBy, snapSquares, insertKeyframe, moveKeyframeTime, moveKeyframePoint, deleteKeyframe, flipKeyframes, resetKeyframes, cutPath } from "../scripts/keyframe-path.mjs";

const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} vs ${b}`);
const kfs = normalizeKeyframes([{ at: 0 }, { at: 0.5, x: 1, y: 1, rotation: 90, ease: "linear" }, { at: 1, x: 2, y: 0, scale: 0.5, alpha: 0.2, ease: "linear" }]);

test("keyframes are clamped, sorted, pinned at the start and repaired when unusable", () => {
  const n = normalizeKeyframes([{ at: 1, x: 40, rotation: 9999, scale: 0, alpha: 3, ease: "bogus" }, { at: 0.3, x: 5, y: 2 }, { at: 0.1, x: 9, y: 9, rotation: 45 }]);
  assert.deepEqual(n.map((k) => k.at), [0, 0.3, 1]);
  assert.deepEqual([n[0].x, n[0].y, n[0].rotation, n[0].scale, n[0].alpha], [0, 0, 0, 1, 1], "first keyframe is where the token stands");
  assert.deepEqual([n[2].x, n[2].rotation, n[2].scale, n[2].alpha, n[2].ease], [12, 1440, 0.05, 1, "easeInOutQuad"]);
  assert.deepEqual(normalizeKeyframes(null), DEFAULT_KEYFRAMES.map((k) => ({ ...k })));
  assert.deepEqual(normalizeKeyframes([{ at: 0.5, x: 3 }]).map((k) => [k.at, k.x]), [[0, 0], [1, 1]], "one keyframe is not a path");
  assert.equal(normalizeKeyframes(Array.from({ length: 20 }, (_, i) => ({ at: i / 19, x: i / 4 }))).length, 12);
  assert.equal(normalizeKeyframes([{ at: 0 }, { at: 0.4, x: 1 }]).at(-1).at, 1, "the last keyframe always ends the motion");
});

test("the path passes exactly through every keyframe, with every channel", () => {
  for (const [q, k] of [[0, kfs[0]], [0.5, kfs[1]], [1, kfs[2]]]) {
    const s = samplePath(kfs, q);
    for (const key of ["x", "y", "rotation", "scale", "alpha"]) near(s[key], k[key], `${key} at ${q}`);
  }
});

test("between keyframes the curve is smooth, and a sharp corner makes it straight", () => {
  const smooth = samplePath(kfs, 0.25);
  assert.ok(Math.abs(smooth.y - 0.5) > 1e-3, "a smooth curve bows away from the straight line");
  const sharp = normalizeKeyframes(kfs.map((k, i) => (i === 1 ? { ...k, sharp: true } : k)));
  const s = samplePath(sharp, 0.25);
  near(s.x, 0.5, "straight x"); near(s.y, 0.5, "straight y");
});

test("duplicate times: the path still ends on its true last point", () => {
  const dup = normalizeKeyframes([{ at: 0 }, { at: 1, x: 3 }, { at: 1, x: 5 }]);
  assert.equal(samplePath(dup, 1).x, 5);
  assert.equal(samplePath(dup, 1).x, pathEnd(dup).x);
});

test("each segment's easing shapes the speed into its keyframe", () => {
  const eased = normalizeKeyframes([{ at: 0 }, { at: 1, x: 1, ease: "easeInQuad" }]);
  near(samplePath(eased, 0.5).x, 0.25, "ease-in covers a quarter by half time");
});

test("end, squares and frame rotation", () => {
  assert.deepEqual(pathEnd(kfs), { x: 2, y: 0 });
  assert.equal(pathSquares(normalizeKeyframes([{ at: 0 }, { at: 1, x: 2.6, y: -1 }])), 3);
  assert.equal(pathSquares(normalizeKeyframes([{ at: 0 }, { at: 1, x: 0.3 }])), 0, "a small wobble stays in place");
  const down = { x: 0, y: 1 };
  assert.deepEqual(rotateBy({ x: 2, y: 0 }, down), { x: 0, y: 2 });
  const back = unrotateBy(rotateBy({ x: 1.5, y: -0.5 }, { x: 0.6, y: 0.8 }), { x: 0.6, y: 0.8 });
  near(back.x, 1.5, "x"); near(back.y, -0.5, "y");
});

test("editor helpers: insert from the curve, move time within neighbours, snap points, keep the ends", () => {
  const added = insertKeyframe(kfs, 0.25);
  assert.equal(added.length, 4);
  const s = samplePath(kfs, 0.25);
  near(added[1].x, s.x, "inserted on the curve");
  assert.equal(insertKeyframe(kfs, 0.5), kfs, "no duplicate keyframe at the same time");
  assert.equal(moveKeyframeTime(kfs, 1, 0.9)[1].at, 0.9);
  assert.equal(moveKeyframeTime(kfs, 1, 1.5)[1].at, 0.99, "clamped below the next keyframe");
  assert.equal(moveKeyframeTime(kfs, 1, -1)[1].at, 0.01);
  assert.equal(moveKeyframeTime(kfs, 0, 0.5), kfs, "the start is fixed");
  assert.equal(moveKeyframeTime(kfs, 2, 0.5), kfs, "the end is fixed");
  assert.deepEqual([snapSquares(1.13), snapSquares(1.13, true), snapSquares(-0.4)], [1.25, 1, -0.5]);
  const moved = moveKeyframePoint(kfs, 2, 2.9, 0.1);
  assert.deepEqual([moved[2].x, moved[2].y], [3, 0]);
  assert.equal(moveKeyframePoint(kfs, 0, 5, 5), kfs, "the start point is where the token stands");
  assert.equal(deleteKeyframe(kfs, 1).length, 2);
  assert.equal(deleteKeyframe(kfs, 0), kfs);
  assert.equal(deleteKeyframe(kfs, 2), kfs);
  assert.deepEqual(flipKeyframes(kfs).map((k) => k.y), [0, -1, 0]);
  assert.deepEqual(resetKeyframes(), DEFAULT_KEYFRAMES.map((k) => ({ ...k })));
});

test("the x/y clamp can be widened for a rotated finisher end, and defaults to 12", () => {
  assert.equal(normalizeKeyframes([{ at: 0 }, { at: 1, x: 16 }], { limit: 17 }).at(-1).x, 16);
  assert.equal(normalizeKeyframes([{ at: 0 }, { at: 1, x: 16 }]).at(-1).x, 12);
});

const line = (extra = {}) => normalizeKeyframes([{ at: 0, x: 0, y: 0 }, { at: 1, x: 6, y: 0, ease: "linear", ...extra }]);
test("cutPath ends a path where it first reaches the wall, at full speed", () => {
  const { keyframes, t } = cutPath(line(), 3);
  assert.ok(Math.abs(t - 0.5) < 1e-3, `t=${t}`);
  assert.ok(Math.abs(keyframes.at(-1).x - 3) < 1e-3);
  assert.equal(keyframes.at(-1).at, 1);
  assert.equal(keyframes.at(-1).ease, "linear", "the ease of the segment it was cut in");
  assert.equal(keyframes.at(-1).sharp, false);
});

test("cutPath lands the cut end upright: rotation to the nearest whole turn, full size and visible", () => {
  const { keyframes, t } = cutPath(line({ rotation: 720, scale: 1.5, alpha: 0.5 }), 1.8);
  assert.ok(Math.abs(samplePath(line({ rotation: 720 }), t).rotation - 216) < 1, "cut where it has turned about 216");
  assert.equal(keyframes.at(-1).rotation, 360);
  assert.deepEqual([keyframes.at(-1).scale, keyframes.at(-1).alpha], [1, 1]);
});

test("cutPath keeps earlier keyframes, rescaled to the cut time", () => {
  const k = normalizeKeyframes([{ at: 0, x: 0, y: 0 }, { at: 0.2, x: 1, y: 0, scale: 1.2 }, { at: 1, x: 6, y: 0, ease: "easeOutCubic" }]);
  const { keyframes, t } = cutPath(k, 3);
  assert.equal(keyframes.length, 3);
  assert.ok(Math.abs(keyframes[1].at - 0.2 / t) < 1e-9);
  assert.equal(keyframes[1].scale, 1.2);
  assert.equal(keyframes.at(-1).ease, "easeOutCubic");
  assert.ok(Math.abs(Math.hypot(keyframes.at(-1).x, keyframes.at(-1).y) - 3) < 1e-3);
});

test("cutPath leaves a path that never reaches the wall untouched", () => {
  for (const reach of [6, 7]) {
    const k = line(), cut = cutPath(k, reach);
    assert.equal(cut.t, 1, `reach ${reach}`);
    assert.deepEqual(cut.keyframes, k);
  }
});
