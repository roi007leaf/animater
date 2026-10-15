// Token fragments: the real token's artwork cut into pieces that fly apart (halves, top/bottom,
// shards, dust, cross, claw, diced, starburst, rings, pixelate, ribbons). Pure geometry in the
// token's unit square (-0.5..0.5); every client derives the same pieces and flights from the shared seed.
import { samplePath, normalizeKeyframes } from "./keyframe-path.mjs";

export const FRAGMENT_PATTERNS = {
  halves: "Slice in half", topBottom: "Top / bottom", shards: "Shards", dust: "Dust",
  cross: "Cross cut", claw: "Claw marks", diced: "Diced", starburst: "Starburst", rings: "Rings", pixelate: "Pixelate", ribbons: "Ribbons",
};
// [lo, hi, default] for the stored `pieces`. Diced counts per side (4 is 4x4); rings counts rings of 8 segments.
export const FRAGMENT_COUNTS = {
  halves: [2, 2, 2], topBottom: [2, 2, 2], shards: [4, 10, 7], dust: [16, 64, 48],
  cross: [4, 4, 4], claw: [4, 4, 4], diced: [2, 6, 4], starburst: [6, 16, 10], rings: [2, 4, 3], pixelate: [16, 64, 36], ribbons: [6, 16, 10],
};
export const FRAGMENT_BEHAVIORS = { burst: "Burst apart", implode: "Implode", absorb: "Drawn to the attacker", rise: "Rise away", bounce: "Fall and bounce", drip: "Melt down" };
export const FRAGMENT_TINTS = { none: "None", frozen: "Frozen", charred: "Charred", stone: "Stone", ghost: "Ghostly" };
// How a tint draws: a PIXI tint on the table (stone adds one shared greyscale filter), a CSS filter
// in the studio, and an alpha factor for both.
export const FRAGMENT_TINT_LOOKS = {
  none: { alpha: 1 },
  frozen: { tint: 0xa8d8ff, alpha: 0.9, css: "saturate(.6) hue-rotate(170deg) brightness(1.1)" },
  charred: { tint: 0x3a2a22, alpha: 1, css: "brightness(.35) sepia(.4)" },
  stone: { tint: 0xb0aca4, alpha: 1, greyscale: 0.55, css: "grayscale(.85) brightness(.9)" },
  ghost: { tint: 0xd8f0ff, alpha: 0.5, css: "brightness(1.3) saturate(.3)" },
};
const clamp = (v, min, max, fallback) => (v !== null && v !== "" && Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Number(v))) : fallback);
const TOWARDS_LIMIT = 40;

export function normalizeFragments(s = {}) {
  const pattern = Object.hasOwn(FRAGMENT_PATTERNS, s.pattern) ? s.pattern : "halves", [lo, hi, def] = FRAGMENT_COUNTS[pattern];
  const seed = Number(s.seed), cutAngle = s.cutAngle === null || s.cutAngle === "" ? NaN : Number(s.cutAngle);
  const behavior = Object.hasOwn(FRAGMENT_BEHAVIORS, s.behavior) ? s.behavior : "burst", tint = Object.hasOwn(FRAGMENT_TINTS, s.tint) ? s.tint : "none";
  const tx = s.towards?.x, ty = s.towards?.y, limit = (v) => Math.min(TOWARDS_LIMIT, Math.max(-TOWARDS_LIMIT, v));
  return {
    pattern, cut: s.cut === "fixed" ? "fixed" : "attack", angle: clamp(s.angle, 0, 180, 0),
    pieces: Math.round(clamp(s.pieces, lo, hi, def)), spread: clamp(s.spread, 0, 3, 0.6), spin: clamp(s.spin, 0, 720, 30),
    fall: clamp(s.fall, 0, 1, 0.3), drift: clamp(s.drift, 0, 1, 0), fade: clamp(s.fade, 100, 3000, 600),
    ...(Number.isInteger(seed) && seed >= 0 ? { seed } : {}),
    // The sender's cut angle (radians, on screen), so every client cuts the same way.
    ...(Number.isFinite(cutAngle) ? { cutAngle: Math.atan2(Math.sin(cutAngle), Math.cos(cutAngle)) } : {}),
    // Burst and no tint stay unstored, so stages saved before them read back unchanged.
    ...(behavior !== "burst" ? { behavior } : {}),
    ...(tint !== "none" ? { tint } : {}),
    // The sender's attacker centre less the target's, in screen squares: where "absorb" flies.
    ...(Number.isFinite(tx) && Number.isFinite(ty) ? { towards: { x: limit(tx), y: limit(ty) } } : {}),
  };
}
// A stage normalized once (per renderer start); the geometry below takes it as is. Behaviour, tint
// and towards are always set, so junk the raw stage carries under those keys (the generic effect
// colour `tint: "#ffffff"`, say) never survives the spread.
const PREPARED = new WeakSet();
export function prepareFragments(stage) {
  if (stage && PREPARED.has(stage)) return stage;
  const n = normalizeFragments(stage);
  const s = { ...stage, ...n, behavior: n.behavior ?? "burst", tint: n.tint ?? "none", towards: n.towards };
  PREPARED.add(s);
  return s;
}

// How many pieces a stage cuts (absorb staggers by it; pixelate orders by it).
export function fragmentCount(stage) {
  const s = prepareFragments(stage);
  switch (s.pattern) {
    case "halves": case "topBottom": return 2;
    case "cross": case "claw": return 4;
    case "diced": return s.pieces * s.pieces;
    case "rings": return s.pieces * 8;
    case "dust": case "pixelate": { const cols = Math.ceil(Math.sqrt(s.pieces)); return cols * Math.round(s.pieces / cols); }
    default: return s.pieces;
  }
}

// mulberry32: tiny, fast and identical on every client.
export function seededRandom(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export const polygonArea = (pts) => Math.abs(pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p.x * q.y - q.x * p.y; }, 0)) / 2;
export function pointInPolygon(p, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
const centroidOf = (pts) => {
  let a = 0, x = 0, y = 0;
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length], c = p.x * q.y - q.x * p.y; a += c; x += (p.x + q.x) * c; y += (p.y + q.y) * c; });
  return a ? { x: x / (3 * a), y: y / (3 * a) } : { x: 0, y: 0 };
};
const SQUARE = [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }];
// Sutherland–Hodgman: keep the part of a convex polygon where n·p >= d.
function clip(pts, n, d) {
  const out = [], side = (p) => n.x * p.x + n.y * p.y - d;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length], sp = side(p), sq = side(q);
    if (sp >= 0) out.push(p);
    if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }); }
  });
  return out;
}
const piece = (polygon) => ({ polygon, centroid: centroidOf(polygon) });
const normal = (a) => ({ x: -Math.sin(a), y: Math.cos(a) });
const flip = (n) => ({ x: -n.x, y: -n.y });
// A wedge from angle t0 to t1 (under a half-turn) around c: two half-plane clips cut it exactly.
function wedge(t0, t1, c = { x: 0, y: 0 }) {
  const n0 = { x: -Math.sin(t0), y: Math.cos(t0) }, n1 = { x: Math.sin(t1), y: -Math.cos(t1) };
  return clip(clip(SQUARE, n0, n0.x * c.x + n0.y * c.y), n1, n1.x * c.x + n1.y * c.y);
}
// The part of a convex polygon where lo <= n·p <= hi; an infinite bound is not cut.
function band(pts, n, lo, hi) {
  let out = pts;
  if (lo > -Infinity) out = clip(out, n, lo);
  if (hi < Infinity) out = clip(out, flip(n), -hi);
  return out;
}
// A cols x rows grid of rects (dust, diced, pixelate), row by row; `ordered` numbers the cells.
function gridPieces(cols, rows, ordered = false) {
  const w = 1 / cols, h = 1 / rows, out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = -0.5 + c * w, y = -0.5 + r * h;
    out.push({ ...piece([{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }]), rect: { x, y, w, h }, ...(ordered ? { order: r * cols + c } : {}) });
  }
  return out;
}

// The cut angle is on screen; `turn` is the token art's rotation, so pieces are cut in the art's
// own frame at the screen angle minus the turn (top/bottom stays level on screen).
const screenCut = (s, cutAngle) => (s.pattern === "topBottom" ? 0 : s.cut === "fixed" ? (s.angle * Math.PI) / 180 : cutAngle);
export function fragmentPieces(stage, cutAngle, turn = 0) {
  const s = prepareFragments(stage), rand = seededRandom(s.seed ?? 1);
  if (s.pattern === "halves" || s.pattern === "topBottom") {
    const a = screenCut(s, cutAngle) - turn;
    const n = { x: -Math.sin(a), y: Math.cos(a) };
    return [piece(clip(SQUARE, { x: -n.x, y: -n.y }, 0)), piece(clip(SQUARE, n, 0))];
  }
  if (s.pattern === "dust" || s.pattern === "pixelate") {
    const cols = Math.ceil(Math.sqrt(s.pieces));
    return gridPieces(cols, Math.round(s.pieces / cols), s.pattern === "pixelate");
  }
  if (s.pattern === "diced") return gridPieces(s.pieces, s.pieces);
  if (s.pattern === "cross") {
    // Two perpendicular cuts through the centre at the swing +-45 degrees: one wedge faces the swing.
    const a = screenCut(s, cutAngle) - turn, n1 = normal(a + Math.PI / 4), n2 = normal(a - Math.PI / 4);
    return [[n1, n2], [n1, flip(n2)], [flip(n1), flip(n2)], [flip(n1), n2]].map(([u, v]) => piece(clip(clip(SQUARE, u, 0), v, 0)));
  }
  if (s.pattern === "claw") {
    // Three parallel rakes along the swing tilted 30 degrees, a quarter apart: four strips.
    const n = normal(screenCut(s, cutAngle) + Math.PI / 6 - turn), cuts = [-Infinity, -0.25, 0, 0.25, Infinity];
    return cuts.slice(0, 4).map((lo, i) => piece(band(SQUARE, n, lo, cuts[i + 1])));
  }
  if (s.pattern === "starburst") {
    // Even wedges around the exact centre, no jitter; only the base angle is seeded.
    const base = rand() * Math.PI * 2, step = (Math.PI * 2) / s.pieces;
    return Array.from({ length: s.pieces }, (_, i) => piece(wedge(base + i * step, base + (i + 1) * step)));
  }
  if (s.pattern === "rings") {
    // Eight 45-degree wedges, each banded by straight lines square to its bisector at k/N of the
    // half-diagonal: each segment stays convex, neighbours share edges exactly, the last ring takes the corners.
    const step = Math.SQRT1_2 / s.pieces, out = [];
    for (let k = 0; k < s.pieces; k++) for (let j = 0; j < 8; j++) {
      const t0 = (j * Math.PI) / 4, mid = t0 + Math.PI / 8, b = { x: Math.cos(mid), y: Math.sin(mid) };
      const poly = band(wedge(t0, t0 + Math.PI / 4), b, k ? k * step : -Infinity, k < s.pieces - 1 ? (k + 1) * step : Infinity);
      if (poly.length >= 3 && polygonArea(poly) > 1e-9) out.push({ ...piece(poly), ring: k });
    }
    return out;
  }
  if (s.pattern === "ribbons") {
    // Screen x in the art's own frame: the strips stay upright on screen however the token is turned.
    const u = { x: Math.cos(turn), y: -Math.sin(turn) }, e = (Math.abs(u.x) + Math.abs(u.y)) / 2, w = (2 * e) / s.pieces;
    return Array.from({ length: s.pieces }, (_, i) => piece(band(SQUARE, u, i ? -e + i * w : -Infinity, i < s.pieces - 1 ? -e + (i + 1) * w : Infinity)));
  }
  // Shards: wedges around a jittered centre; each wedge stays under a half-turn so two
  // half-plane clips cut it exactly.
  const c = { x: (rand() - 0.5) * 0.3, y: (rand() - 0.5) * 0.3 }, base = rand() * Math.PI * 2, step = (Math.PI * 2) / s.pieces;
  const angles = Array.from({ length: s.pieces }, (_, i) => base + i * step + (rand() - 0.5) * step * 0.4);
  return angles.map((t0, i) => piece(wedge(t0, i === angles.length - 1 ? angles[0] + Math.PI * 2 : angles[i + 1], c)));
}

// Each piece's own flight, in screen squares relative to where it started: the piece's centroid
// is turned onto the screen first, so falls go down and wind blows away on screen.
export function fragmentFlight(stage, p, index, cutAngle, turn = 0) {
  const s = prepareFragments(stage), rand = seededRandom(((s.seed ?? 1) + index * 7919) >>> 0);
  const c = { x: Math.cos(turn) * p.centroid.x - Math.sin(turn) * p.centroid.y, y: Math.sin(turn) * p.centroid.x + Math.cos(turn) * p.centroid.y };
  const len = Math.hypot(c.x, c.y) || 1, out = { x: c.x / len, y: c.y / len };
  if (s.pattern === "dust") {
    const wind = { x: Math.cos(cutAngle), y: Math.sin(cutAngle) }, lead = 0.5 - (c.x * wind.x + c.y * wind.y);
    const start = Math.min(0.4, Math.max(0, lead * 0.4)), end = Math.min(1, start + 0.6), reach = s.spread * (0.5 + rand() * 0.5);
    const dx = out.x * reach * 0.4 + wind.x * (reach * 0.6 + s.drift), dy = out.y * reach * 0.4 + wind.y * (reach * 0.6 + s.drift) - 0.2;
    return { start, end, keyframes: normalizeKeyframes([{ at: 0 }, { at: start }, { at: end, x: dx, y: dy, rotation: s.spin * (rand() * 2 - 1), ease: "easeOutQuad" }, { at: 1, x: dx, y: dy, rotation: s.spin * (rand() * 2 - 1), ease: "easeInOutQuad" }]) };
  }
  if (s.pattern === "shards") {
    const dist = s.spread * (0.7 + rand() * 0.6);
    return { start: 0, end: 1, keyframes: normalizeKeyframes([{ at: 0 }, { at: 1, x: out.x * dist, y: out.y * dist + s.fall * 0.3, rotation: s.spin * (rand() * 2 - 1), ease: "easeOutCubic" }]) };
  }
  // Halves: apart along the cut's normal; top/bottom lets the top half slide off and topple.
  const a = screenCut(s, cutAngle);
  const n = { x: -Math.sin(a), y: Math.cos(a) }, side = Math.sign(c.x * n.x + c.y * n.y) || 1;
  if (s.pattern === "topBottom" && side > 0) return { start: 0, end: 1, keyframes: normalizeKeyframes([{ at: 0 }, { at: 0.4 }, { at: 1, x: 0, y: s.fall * 0.1, ease: "easeInQuad" }]) };
  const along = s.pattern === "topBottom" ? s.spread * 0.3 : 0;
  const mx = n.x * side * s.spread * 0.5 + Math.cos(a) * along, my = n.y * side * s.spread * 0.5 + Math.sin(a) * along + s.fall * 0.3;
  return { start: 0, end: 1, keyframes: normalizeKeyframes([{ at: 0 }, { at: 0.15, x: mx * 0.15, y: my * 0.15, ease: "easeInOutQuad" }, { at: 1, x: mx, y: my, rotation: side * s.spin * (s.pattern === "topBottom" ? 3 : 1), ease: "easeOutQuad" }]) };
}

export function fragmentPose(stage, p, flight, t) {
  const s = prepareFragments(stage), q = Math.min(1, Math.max(0, t)), at = samplePath(flight.keyframes, q);
  // Pieces fade over the stage's last `fade` ms; a dust speck fades over its own window.
  const fadeFrom = s.pattern === "dust" ? flight.start + (flight.end - flight.start) * 0.3 : Math.max(0, 1 - s.fade / Math.max(1, stage.duration ?? 1400));
  const fadeTo = s.pattern === "dust" ? flight.end : 1;
  const alpha = q <= fadeFrom ? 1 : q >= fadeTo ? 0 : 1 - (q - fadeFrom) / (fadeTo - fadeFrom);
  return { x: at.x, y: at.y, rotation: at.rotation, alpha };
}
