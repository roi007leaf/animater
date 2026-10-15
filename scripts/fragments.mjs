// Token fragments: the real token's artwork cut into pieces that fly apart (halves, top/bottom,
// shards, dust). Pure geometry in the token's unit square (-0.5..0.5); every client derives the
// same pieces and flights from the shared seed.
import { samplePath, normalizeKeyframes } from "./keyframe-path.mjs";

export const FRAGMENT_PATTERNS = { halves: "Slice in half", topBottom: "Top / bottom", shards: "Shards", dust: "Dust" };
const COUNTS = { halves: [2, 2, 2], topBottom: [2, 2, 2], shards: [4, 10, 7], dust: [16, 64, 48] };
const clamp = (v, min, max, fallback) => (v !== null && v !== "" && Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Number(v))) : fallback);

export function normalizeFragments(s = {}) {
  const pattern = Object.hasOwn(FRAGMENT_PATTERNS, s.pattern) ? s.pattern : "halves", [lo, hi, def] = COUNTS[pattern];
  const seed = Number(s.seed), cutAngle = s.cutAngle === null || s.cutAngle === "" ? NaN : Number(s.cutAngle);
  return {
    pattern, cut: s.cut === "fixed" ? "fixed" : "attack", angle: clamp(s.angle, 0, 180, 0),
    pieces: Math.round(clamp(s.pieces, lo, hi, def)), spread: clamp(s.spread, 0, 3, 0.6), spin: clamp(s.spin, 0, 720, 30),
    fall: clamp(s.fall, 0, 1, 0.3), drift: clamp(s.drift, 0, 1, 0), fade: clamp(s.fade, 100, 3000, 600),
    ...(Number.isInteger(seed) && seed >= 0 ? { seed } : {}),
    // The sender's cut angle (radians, on screen), so every client cuts the same way.
    ...(Number.isFinite(cutAngle) ? { cutAngle: Math.atan2(Math.sin(cutAngle), Math.cos(cutAngle)) } : {}),
  };
}
// A stage normalized once (per renderer start); the geometry below takes it as is.
const PREPARED = new WeakSet();
export function prepareFragments(stage) {
  if (stage && PREPARED.has(stage)) return stage;
  const s = { ...stage, ...normalizeFragments(stage) };
  PREPARED.add(s);
  return s;
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
  if (s.pattern === "dust") {
    const cols = Math.ceil(Math.sqrt(s.pieces)), rows = Math.round(s.pieces / cols), w = 1 / cols, h = 1 / rows, out = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = -0.5 + c * w, y = -0.5 + r * h;
      out.push({ ...piece([{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }]), rect: { x, y, w, h } });
    }
    return out;
  }
  // Shards: wedges around a jittered centre; each wedge stays under a half-turn so two
  // half-plane clips cut it exactly.
  const c = { x: (rand() - 0.5) * 0.3, y: (rand() - 0.5) * 0.3 }, base = rand() * Math.PI * 2, step = (Math.PI * 2) / s.pieces;
  const angles = Array.from({ length: s.pieces }, (_, i) => base + i * step + (rand() - 0.5) * step * 0.4);
  return angles.map((t0, i) => {
    const t1 = i === angles.length - 1 ? angles[0] + Math.PI * 2 : angles[i + 1];
    const n0 = { x: -Math.sin(t0), y: Math.cos(t0) }, n1 = { x: Math.sin(t1), y: -Math.cos(t1) };
    return piece(clip(clip(SQUARE, n0, n0.x * c.x + n0.y * c.y), n1, n1.x * c.x + n1.y * c.y));
  });
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
