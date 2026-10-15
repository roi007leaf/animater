import test from "node:test";
import assert from "node:assert/strict";
import { normalizeFragments, prepareFragments, polygonArea, pointInPolygon, fragmentPieces, fragmentCount, FRAGMENT_COUNTS, FRAGMENT_PATTERNS, FRAGMENT_BEHAVIORS, FRAGMENT_TINTS } from "../scripts/fragments.mjs";
import { validateRecipe } from "../scripts/model.mjs";

const stage = (extra = {}) => ({ kind: "motion", motion: "fragments", duration: 1400, ...normalizeFragments({ seed: 7, ...extra }) });
const NEW = ["cross", "claw", "diced", "starburst", "rings", "pixelate", "ribbons"];
const area = (pieces) => pieces.reduce((a, p) => a + polygonArea(p.polygon), 0);
const convex = (pts) => {
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], c = pts[(i + 2) % pts.length];
    const z = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(z) < 1e-12) continue;
    if (sign && Math.sign(z) !== sign) return false;
    sign = Math.sign(z);
  }
  return true;
};
// Samples offset so none lies on a 45-degree diagonal or an axis, where two pieces share an edge.
const coversOnce = (pieces) => {
  for (let i = 0; i < 20; i++) for (let j = 0; j < 20; j++) {
    const pt = { x: -0.5 + (i + 0.513) / 20, y: -0.5 + (j + 0.529) / 20 };
    if (pieces.filter((p) => pointInPolygon(pt, p.polygon)).length !== 1) return false;
  }
  return true;
};
const grid = (n) => { const cols = Math.ceil(Math.sqrt(n)); return cols * Math.round(n / cols); };
const expected = (pattern, n) => ({ cross: 4, claw: 4, diced: n * n, starburst: n, rings: 8 * n, pixelate: grid(n), ribbons: n })[pattern];

test("the new patterns are registered with their labels and piece ranges", () => {
  assert.deepEqual(Object.fromEntries(NEW.map((k) => [k, FRAGMENT_PATTERNS[k]])),
    { cross: "Cross cut", claw: "Claw marks", diced: "Diced", starburst: "Starburst", rings: "Rings", pixelate: "Pixelate", ribbons: "Ribbons" });
  assert.deepEqual(Object.fromEntries(NEW.map((k) => [k, FRAGMENT_COUNTS[k]])),
    { cross: [4, 4, 4], claw: [4, 4, 4], diced: [2, 6, 4], starburst: [6, 16, 10], rings: [2, 4, 3], pixelate: [16, 64, 36], ribbons: [6, 16, 10] });
  assert.deepEqual(FRAGMENT_BEHAVIORS, { burst: "Burst apart", implode: "Implode", absorb: "Drawn to the attacker", rise: "Rise away", bounce: "Fall and bounce", drip: "Melt down" });
  assert.deepEqual(FRAGMENT_TINTS, { none: "None", frozen: "Frozen", charred: "Charred", stone: "Stone", ghost: "Ghostly" });
});

test("piece counts follow the pattern: defaults, clamps, and a count left over from another pattern", () => {
  for (const pattern of NEW) {
    const [lo, hi, def] = FRAGMENT_COUNTS[pattern];
    assert.equal(normalizeFragments({ pattern }).pieces, def, pattern);
    assert.equal(normalizeFragments({ pattern, pieces: 999 }).pieces, hi, pattern);
    assert.equal(normalizeFragments({ pattern, pieces: 0 }).pieces, lo, pattern);
  }
  // A dust count of 48 left on a stage switched to diced is 6 per side, not 48.
  const diced = stage({ pattern: "diced", pieces: 48 });
  assert.equal(diced.pieces, 6);
  assert.equal(fragmentPieces(diced, 0).length, 36);
});

test("each new pattern tiles the token with convex pieces, for any seed, cut and turn", () => {
  for (const pattern of NEW) {
    const [lo, hi] = FRAGMENT_COUNTS[pattern];
    for (const n of [lo, hi]) for (const seed of [1, 99]) for (const angle of [0.3, 2.2]) for (const turn of [0, 0.9]) {
      const s = stage({ pattern, pieces: n, seed }), pieces = fragmentPieces(s, angle, turn), label = `${pattern} n${n} seed${seed} a${angle} t${turn}`;
      assert.equal(pieces.length, expected(pattern, n), label);
      assert.equal(fragmentCount(s), pieces.length, label);
      assert.ok(Math.abs(area(pieces) - 1) < 1e-6, `${label}: area ${area(pieces)}`);
      assert.ok(pieces.every((p) => convex(p.polygon)), `${label}: convex`);
      assert.ok(pieces.every((p) => polygonArea(p.polygon) > 1e-9), `${label}: no empty piece`);
      assert.ok(coversOnce(pieces), `${label}: overlap or gap`);
    }
  }
});

test("fragmentCount matches the pieces for the classic patterns too", () => {
  for (const pattern of ["halves", "topBottom", "shards", "dust"]) {
    const s = stage({ pattern });
    assert.equal(fragmentCount(s), fragmentPieces(s, 0.4).length, pattern);
  }
});

test("a seed always gives the same pieces; starburst turns with the seed", () => {
  for (const pattern of NEW) assert.deepEqual(fragmentPieces(stage({ pattern, seed: 5 }), 0.7, 0.2), fragmentPieces(stage({ pattern, seed: 5 }), 0.7, 0.2), pattern);
  assert.notDeepEqual(fragmentPieces(stage({ pattern: "starburst", seed: 1 }), 0), fragmentPieces(stage({ pattern: "starburst", seed: 2 }), 0));
});

test("the cut angle turns the cross and the claw cuts", () => {
  const cross0 = fragmentPieces(stage({ pattern: "cross" }), 0);
  assert.ok(cross0.some((p) => Math.abs(p.centroid.y) < 1e-9 && p.centroid.x > 0.1), "a wedge faces a swing along +x");
  const cross45 = fragmentPieces(stage({ pattern: "cross" }), Math.PI / 4);
  assert.ok(cross45.every((p) => Math.abs(Math.abs(p.centroid.x) - Math.abs(p.centroid.y)) < 1e-9), "turned 45 degrees, the wedges face the diagonals");
  // Swing -30 degrees + the 30 degree tilt: horizontal rakes, four bands down the token.
  const flat = fragmentPieces(stage({ pattern: "claw" }), -Math.PI / 6);
  assert.ok(flat.every((p) => Math.abs(p.centroid.x) < 1e-9));
  flat.map((p) => p.centroid.y).forEach((y, i) => assert.ok(Math.abs(y - [-0.375, -0.125, 0.125, 0.375][i]) < 1e-9, `band ${i}: ${y}`));
  const upright = fragmentPieces(stage({ pattern: "claw" }), Math.PI / 3);
  assert.ok(upright.every((p) => Math.abs(p.centroid.y) < 1e-9), "swing 60 degrees: vertical rakes");
});

test("ribbons stay upright on screen when the token is turned", () => {
  for (const turn of [0, 0.5, 1.2, -2]) {
    const pieces = fragmentPieces(stage({ pattern: "ribbons", pieces: 8 }), 0.3, turn);
    const span = pieces.map((p) => { const xs = p.polygon.map((q) => Math.cos(turn) * q.x - Math.sin(turn) * q.y); return [Math.min(...xs), Math.max(...xs)]; });
    for (let i = 1; i < span.length; i++) assert.ok(span[i - 1][1] <= span[i][0] + 1e-9, `turn ${turn}: strip ${i - 1} ends before strip ${i} starts on screen x`);
  }
  const level = fragmentPieces(stage({ pattern: "ribbons", pieces: 10 }), 0, 0);
  const width = (p) => Math.max(...p.polygon.map((q) => q.x)) - Math.min(...p.polygon.map((q) => q.x));
  assert.ok(level.every((p) => Math.abs(width(p) - 0.1) < 1e-9), "upright token: ten strips a tenth wide");
});

test("diced and pixelate pieces carry their rectangle; pixelate numbers its cells in scanline order; rings number their ring", () => {
  const diced = fragmentPieces(stage({ pattern: "diced", pieces: 3 }), 0);
  assert.ok(diced.every((p) => p.rect && Math.abs(p.rect.w - 1 / 3) < 1e-12 && Math.abs(p.rect.h - 1 / 3) < 1e-12));
  const pixels = fragmentPieces(stage({ pattern: "pixelate", pieces: 36 }), 0);
  assert.deepEqual(pixels.map((p) => p.order), Array.from({ length: 36 }, (_, i) => i));
  assert.ok(pixels.every((p) => p.rect));
  const rings = fragmentPieces(stage({ pattern: "rings", pieces: 3 }), 0);
  assert.deepEqual([0, 1, 2].map((k) => rings.filter((p) => p.ring === k).length), [8, 8, 8]);
  const mean = (k) => rings.filter((p) => p.ring === k).reduce((a, p) => a + Math.hypot(p.centroid.x, p.centroid.y), 0) / 8;
  assert.ok(mean(0) < mean(1) && mean(1) < mean(2), "rings grow outward");
});

test("behaviour, tint and towards are validated; defaults stay unstored", () => {
  const n = normalizeFragments({ behavior: "implode", tint: "stone", towards: { x: 1.5, y: -2 } });
  assert.deepEqual([n.behavior, n.tint, n.towards], ["implode", "stone", { x: 1.5, y: -2 }]);
  for (const bad of ["burst", "bogus", "", null, 3, "__proto__", undefined]) assert.equal("behavior" in normalizeFragments({ behavior: bad }), false, String(bad));
  for (const bad of ["none", "#ffffff", "", null, "toString", undefined]) assert.equal("tint" in normalizeFragments({ tint: bad }), false, String(bad));
  assert.deepEqual(normalizeFragments({ towards: { x: 100, y: -100 } }).towards, { x: 40, y: -40 });
  for (const bad of [null, "x", {}, { x: 1 }, { x: "1", y: 2 }, { x: NaN, y: 0 }, { x: Infinity, y: 0 }, { x: 0, y: null }])
    assert.equal("towards" in normalizeFragments({ towards: bad }), false, JSON.stringify(bad));
  const p = prepareFragments({ pattern: "cross", behavior: "nope", tint: "#ffffff", towards: { x: "a" } });
  assert.deepEqual([p.behavior, p.tint, p.towards], ["burst", "none", undefined], "junk on the raw stage does not survive");
  const q = prepareFragments({ pattern: "cross", behavior: "rise", tint: "ghost", towards: { x: 2, y: 3 } });
  assert.deepEqual([q.behavior, q.tint, q.towards], ["rise", "ghost", { x: 2, y: 3 }]);
});

test("the recipe model keeps behaviour, tint and towards; a saved stage's colour tint reads as none", () => {
  const v = (extra) => validateRecipe({ id: "x", name: "X", trigger: "manual", stages: [{ kind: "motion", motion: "fragments", pattern: "rings", ...extra }] }).stages[0];
  const kept = v({ behavior: "absorb", tint: "frozen", towards: { x: -3, y: 1 } });
  assert.deepEqual([kept.behavior, kept.tint, kept.towards], ["absorb", "frozen", { x: -3, y: 1 }]);
  const plain = v({});
  assert.equal("behavior" in plain, false);
  assert.equal("towards" in plain, false);
  const prepared = prepareFragments(plain);
  assert.deepEqual([prepared.behavior, prepared.tint], ["burst", "none"], "the generic #ffffff effect colour is not a fragments tint");
});
