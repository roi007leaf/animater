// Keyframed path: the real token's own movement, authored as points over time. Positions are
// squares in the stage's frame (+x away from the other token, +y to its right).
import { easeValue, EASES } from "./stage-options.mjs";

export const MAX_KEYFRAMES = 12;
const base = { rotation: 0, scale: 1, alpha: 1, ease: "easeInOutQuad", sharp: false };
export const DEFAULT_KEYFRAMES = Object.freeze([Object.freeze({ at: 0, x: 0, y: 0, ...base }), Object.freeze({ at: 1, x: 1, y: 0, ...base })]);
const clamp = (v, min, max, fallback) => (v !== null && v !== "" && Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Number(v))) : fallback);
const keyframe = (k, limit = 12) => ({ at: clamp(k.at, 0, 1, 0), x: clamp(k.x, -limit, limit, 0), y: clamp(k.y, -limit, limit, 0), rotation: clamp(k.rotation, -1440, 1440, 0),
  scale: clamp(k.scale, 0.05, 5, 1), alpha: clamp(k.alpha, 0, 1, 1), ease: Object.hasOwn(EASES, k.ease) ? k.ease : "easeInOutQuad", sharp: k.sharp === true });

// `limit` is the x/y clamp in squares: authored paths use 12; a finisher's rotated, fitted end needs more room.
export function normalizeKeyframes(input, { limit = 12 } = {}) {
  const list = (Array.isArray(input) ? input : []).filter((k) => k && typeof k === "object").map((k) => keyframe(k, limit)).sort((a, b) => a.at - b.at).slice(0, MAX_KEYFRAMES);
  if (list.length < 2) return DEFAULT_KEYFRAMES.map((k) => ({ ...k }));
  list[0] = { ...list[0], at: 0, x: 0, y: 0, rotation: 0, scale: 1, alpha: 1 };
  list[list.length - 1] = { ...list[list.length - 1], at: 1 };
  return list;
}

// Centripetal Catmull-Rom (Barry–Goldman): no loops or cusps, and it passes through p1 and p2.
function centripetal(p0, p1, p2, p3, u) {
  const knot = (a, b) => Math.max(1e-6, Math.hypot(b.x - a.x, b.y - a.y) ** 0.5);
  const t1 = knot(p0, p1), t2 = t1 + knot(p1, p2), t3 = t2 + knot(p2, p3), t = t1 + (t2 - t1) * u;
  const lerp = (a, b, ta, tb) => { const w = tb === ta ? 0 : (t - ta) / (tb - ta); return { x: a.x + (b.x - a.x) * w, y: a.y + (b.y - a.y) * w }; };
  const a1 = lerp(p0, p1, 0, t1), a2 = lerp(p1, p2, t1, t2), a3 = lerp(p2, p3, t2, t3);
  return lerp(lerp(a1, a2, 0, t2), lerp(a2, a3, t1, t3), t1, t2);
}

export function samplePath(keyframes, q) {
  const k = keyframes, t = Math.min(1, Math.max(0, q));
  let i = k.length - 2;
  for (let j = k.length - 2; j >= 0; j--) if (t >= k[j].at) { i = j; break; }
  const a = k[i], b = k[i + 1], span = b.at - a.at;
  const u = easeValue(span > 0 ? (t - a.at) / span : 1, b.ease);
  // Past either end, a mirrored phantom point keeps the end segments straight-ish; duplicating
  // the end point instead would turn even a straight two-point path into an S-curve.
  const mirror = (p, about) => ({ x: 2 * about.x - p.x, y: 2 * about.y - p.y });
  const point = a.sharp || b.sharp ? { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u } : centripetal(k[i - 1] ?? mirror(b, a), a, b, k[i + 2] ?? mirror(a, b), u);
  const mix = (key) => a[key] + (b[key] - a[key]) * u;
  return { x: point.x, y: point.y, rotation: mix("rotation"), scale: mix("scale"), alpha: mix("alpha") };
}

export const pathEnd = (keyframes) => ({ x: keyframes.at(-1).x, y: keyframes.at(-1).y });
// Whole squares the path travels, counted like grid movement (the longer axis).
export const pathSquares = (keyframes) => { const e = pathEnd(keyframes); return Math.round(Math.max(Math.abs(e.x), Math.abs(e.y))); };
// A travelling held path lands the real token, which snaps back upright, full size and visible.
const upright = (k) => (k.rotation ?? 0) % 360 === 0 && (k.scale ?? 1) === 1 && (k.alpha ?? 1) === 1;
export const landsTilted = (keyframes) => pathSquares(keyframes) >= 1 && !upright(keyframes.at(-1));
export const rotateBy = (v, dir) => ({ x: v.x * dir.x - v.y * dir.y, y: v.x * dir.y + v.y * dir.x });
export const unrotateBy = (v, dir) => ({ x: v.x * dir.x + v.y * dir.y, y: -v.x * dir.y + v.y * dir.x });

// Editor helpers. The first keyframe is where the token stands and the last ends the motion.
export const snapSquares = (v, whole = false) => (whole ? Math.round(v) : Math.round(v * 4) / 4) + 0;
export function insertKeyframe(keyframes, at) {
  const t = clamp(at, 0.01, 0.99, 0.5);
  if (keyframes.length >= MAX_KEYFRAMES || keyframes.some((k) => Math.abs(k.at - t) < 0.005)) return keyframes;
  return normalizeKeyframes([...keyframes, { ...samplePath(keyframes, t), at: t, ease: "easeInOutQuad" }]);
}
export function moveKeyframeTime(keyframes, index, at) {
  if (index <= 0 || index >= keyframes.length - 1) return keyframes;
  const lo = keyframes[index - 1].at + 0.01, hi = keyframes[index + 1].at - 0.01;
  return keyframes.map((k, i) => (i === index ? { ...k, at: Math.round(Math.min(hi, Math.max(lo, at)) * 1000) / 1000 } : k));
}
export function moveKeyframePoint(keyframes, index, x, y, whole = false) {
  if (index <= 0) return keyframes;
  return normalizeKeyframes(keyframes.map((k, i) => (i === index ? { ...k, x: snapSquares(x, whole), y: snapSquares(y, whole) } : k)));
}
export const deleteKeyframe = (keyframes, index) => (index <= 0 || index >= keyframes.length - 1 ? keyframes : keyframes.filter((_, i) => i !== index));
export const flipKeyframes = (keyframes) => keyframes.map((k) => ({ ...k, y: k.y ? -k.y : 0 }));
export const resetKeyframes = () => DEFAULT_KEYFRAMES.map((k) => ({ ...k }));
