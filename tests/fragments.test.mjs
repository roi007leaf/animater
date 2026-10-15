import test from "node:test";
import assert from "node:assert/strict";
import { normalizeFragments, seededRandom, polygonArea, pointInPolygon, fragmentPieces, fragmentFlight, fragmentPose } from "../scripts/fragments.mjs";

const stage = (extra = {}) => ({ kind: "motion", motion: "fragments", duration: 1400, ...normalizeFragments({ seed: 7, ...extra }) });
const sum = (pieces) => pieces.reduce((a, p) => a + polygonArea(p.polygon), 0);
const samplesInOne = (pieces) => {
  for (let i = 0; i < 20; i++) for (let j = 0; j < 20; j++) {
    const pt = { x: -0.5 + (i + 0.5) / 20, y: -0.5 + (j + 0.5) / 20 };
    const hits = pieces.filter((p) => pointInPolygon(pt, p.polygon)).length;
    if (hits !== 1) return false;
  }
  return true;
};

test("fragment fields are clamped with pattern-aware piece counts", () => {
  assert.deepEqual(normalizeFragments({}), { pattern: "halves", cut: "attack", angle: 0, pieces: 2, spread: 0.6, spin: 30, fall: 0.3, drift: 0, fade: 600 });
  assert.equal(normalizeFragments({ pattern: "shards" }).pieces, 7);
  assert.equal(normalizeFragments({ pattern: "shards", pieces: 40 }).pieces, 10);
  assert.equal(normalizeFragments({ pattern: "dust" }).pieces, 48);
  assert.equal(normalizeFragments({ pattern: "dust", pieces: 3 }).pieces, 16);
  assert.equal(normalizeFragments({ pattern: "topBottom", pieces: 9 }).pieces, 2);
  assert.equal(normalizeFragments({ pattern: "bogus", spread: 9, spin: -5, fade: 50, seed: 12.7 }).pattern, "halves");
  const n = normalizeFragments({ spread: 9, spin: -5, fade: 50, seed: 12 });
  assert.deepEqual([n.spread, n.spin, n.fade, n.seed], [3, 0, 100, 12]);
  assert.equal(normalizeFragments({ seed: -1 }).seed, undefined);
});

test("a seed always gives the same randoms", () => {
  const a = seededRandom(42), b = seededRandom(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
  assert.notEqual(seededRandom(1)(), seededRandom(2)());
});

test("every pattern covers the token exactly once", () => {
  for (const pattern of ["halves", "topBottom", "shards", "dust"])
    for (const seed of [1, 7, 99, 1234])
      for (const angle of [0, 0.7, Math.PI / 2, 2.4]) {
        const pieces = fragmentPieces(stage({ pattern, seed }), angle);
        assert.ok(Math.abs(sum(pieces) - 1) < 1e-9, `${pattern} seed ${seed} angle ${angle}: area ${sum(pieces)}`);
        assert.ok(samplesInOne(pieces), `${pattern} seed ${seed} angle ${angle}: overlap or gap`);
        assert.ok(pieces.every((p) => polygonArea(p.polygon) > 1e-4), `${pattern}: no empty piece`);
      }
});

test("halves are cut along the cut angle; top/bottom is cut on the screen horizontal", () => {
  const [a, b] = fragmentPieces(stage(), 0);
  assert.ok(Math.abs(polygonArea(a.polygon) - 0.5) < 1e-9);
  assert.ok(a.centroid.y * b.centroid.y < 0, "a horizontal cut puts one half above, one below");
  const [c, d] = fragmentPieces(stage(), Math.PI / 2);
  assert.ok(c.centroid.x * d.centroid.x < 0, "a vertical cut puts one half left, one right");
  const [t, u] = fragmentPieces(stage({ pattern: "topBottom" }), 1.1);
  assert.ok(t.centroid.y * u.centroid.y < 0 && Math.abs(t.centroid.x) < 1e-9, "top/bottom ignores the attack angle");
});

test("shards and dust have the asked number of pieces; dust pieces carry their rectangle", () => {
  assert.equal(fragmentPieces(stage({ pattern: "shards", pieces: 7 }), 0).length, 7);
  const dust = fragmentPieces(stage({ pattern: "dust", pieces: 48 }), 0);
  assert.ok(dust.length >= 42 && dust.length <= 56);
  assert.ok(dust.every((p) => p.rect && p.rect.w > 0 && p.rect.h > 0));
});

test("flights are deterministic, separate halves along the cut normal, and fade to nothing", () => {
  const s = stage({ spread: 0.6 }), pieces = fragmentPieces(s, 0);
  const f0 = fragmentFlight(s, pieces[0], 0, 0), again = fragmentFlight(s, pieces[0], 0, 0);
  assert.deepEqual(f0, again);
  const top = pieces.find((p) => p.centroid.y < 0), bottom = pieces.find((p) => p.centroid.y > 0);
  const endTop = fragmentPose(s, top, fragmentFlight(s, top, 0, 0), 1), endBottom = fragmentPose(s, bottom, fragmentFlight(s, bottom, 1, 0), 1);
  assert.ok(endTop.y < endBottom.y, "halves move apart across a horizontal cut");
  assert.equal(endTop.alpha, 0);
  assert.equal(fragmentPose(s, top, fragmentFlight(s, top, 0, 0), 0).alpha, 1);
  assert.deepEqual([fragmentPose(s, top, fragmentFlight(s, top, 0, 0), 0).x, fragmentPose(s, top, fragmentFlight(s, top, 0, 0), 0).y], [0, 0]);
});

test("dust peels away edge first along the wind", () => {
  const s = stage({ pattern: "dust", drift: 0.8 }), pieces = fragmentPieces(s, 0);
  const lead = pieces.reduce((a, p) => (p.centroid.x > a.centroid.x ? p : a)), tail = pieces.reduce((a, p) => (p.centroid.x < a.centroid.x ? p : a));
  assert.ok(fragmentFlight(s, lead, 0, 0).start < fragmentFlight(s, tail, 1, 0).start, "the edge facing the wind goes first");
  const end = fragmentPose(s, lead, fragmentFlight(s, lead, 0, 0), 1);
  assert.equal(end.alpha, 0);
  assert.ok(end.x > 0, "drifts with the wind (+x here)");
});
