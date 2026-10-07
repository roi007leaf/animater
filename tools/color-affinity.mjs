// Perceptual color affinity for JB2A key color tokens. Selection code used to
// break ties alphabetically, which silently preferred `.blue` whenever the
// requested color was missing (earth cracks, fire rings, mundane bullets).
// Ties now go to the closest hue instead; exact matches still win outright.
const HUES = {
  red: 0, crimson: 350, orange: 30, brown: 28, gold: 45, yellow: 55,
  green: 120, teal: 175, cyan: 185, blue: 220, purple: 275, violet: 275,
  pink: 320, magenta: 300,
};
const NEUTRAL = { white: 0.95, silver: 0.8, grey: 0.55, gray: 0.55, black: 0.05 };
const BASES = [...Object.keys(HUES), ...Object.keys(NEUTRAL)].sort((a, b) => b.length - a.length);
const MULTI = /^(?:rainbow|multicolou?red|textured)$/;

// "dark_bluepurple" -> ["blue","purple"]; "lightgreen" -> ["green"].
function bases(token) {
  let rest = String(token).toLowerCase().replace(/^(?:dark|bright|light)_?/, "");
  const found = [];
  while (rest) {
    const base = BASES.find(b => rest.startsWith(b));
    if (!base) return [];
    found.push(base);
    rest = rest.slice(base.length);
  }
  return found;
}
// Last color-like token of a key, e.g. jb2a.impact.001.dark_purple -> dark_purple.
export function keyColor(key) {
  const parts = String(key).toLowerCase().split(".");
  for (let i = parts.length - 1; i >= 0; i--) {
    if (MULTI.test(parts[i]) || bases(parts[i]).length) return parts[i];
  }
  return null;
}
const hueDistance = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
function describe(token) {
  if (!token) return null;
  if (MULTI.test(token)) return { multi: true };
  const list = bases(token);
  if (!list.length) return null;
  const hues = list.filter(b => b in HUES).map(b => HUES[b]);
  const neutral = list.filter(b => b in NEUTRAL).map(b => NEUTRAL[b]);
  return { hues, neutral };
}
// 0..1, 1 = same color family. Unknown/uncolored keys score a neutral 0.5.
export function colorAffinity(key, wanted) {
  if (!wanted) return 0.5;
  const have = describe(keyColor(key)), want = describe(String(wanted).toLowerCase());
  if (!have || !want) return 0.5;
  if (have.multi || want.multi) return 0.4;
  if (want.hues.length && have.hues.length) {
    const best = Math.min(...want.hues.flatMap(w => have.hues.map(h => hueDistance(w, h))));
    // A secondary off-hue component (e.g. "bluepurple" when red is wanted) costs a little.
    const spread = have.hues.length > 1 ? 0.05 : 0;
    return Math.max(0, 1 - best / 180 - spread);
  }
  if (want.neutral.length && have.neutral.length)
    return 1 - Math.min(...want.neutral.flatMap(w => have.neutral.map(h => Math.abs(w - h))));
  // Neutral vs hue: plausible but never preferred over a near hue. When a
  // neutral (mundane) look is wanted but only hued films exist, warm sparks
  // read as physical impact while blue/purple reads as magic.
  if (want.neutral.length && have.hues.length)
    return 0.35 + (have.hues.every(h => h >= 15 && h <= 60) ? 0.05 : 0);
  return 0.35;
}
// Comparator helper: higher affinity first.
export const byColorAffinity = (wanted, keyOf = r => r.key) => (a, b) => colorAffinity(keyOf(b), wanted) - colorAffinity(keyOf(a), wanted);
