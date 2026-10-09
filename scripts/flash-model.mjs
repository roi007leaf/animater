// Flash screens: full-screen title cards played to everyone when combat starts
// or ends ("Roll for Initiative!", "Victory"). The GM builds them from text,
// image and band layers, each with a position, timing, entrance and exit.
export const FLASH_EVENTS = Object.freeze({ start: "Combat start", end: "Combat end", any: "Start or end" });
export const FLASH_MOTIONS = Object.freeze({
  none: "None", fade: "Fade", "slide-left": "Slide from left", "slide-right": "Slide from right",
  "slide-up": "Rise from below", "slide-down": "Drop from above", zoom: "Zoom", slam: "Slam",
  type: "Type on / wipe off", wipe: "Wipe", blur: "Blur in / out",
});
// Effects that repeat while a layer is on screen.
export const FLASH_LOOPS = Object.freeze({ none: "None", pulse: "Pulse", glow: "Glow pulse", heartbeat: "Heartbeat", glitch: "Glitch", flicker: "Flicker", wobble: "Wobble", float: "Float", spin: "Spin" });
export const KEY_LIMIT = 12;
export const FLASH_KINDS = Object.freeze({ text: "Text", image: "Image or video", portraits: "Portraits", band: "Color band", sound: "Sound", flash: "Screen flash", shake: "Screen shake" });
// Portraits fill in from the encounter when the screen plays.
export const PORTRAIT_SIDES = Object.freeze({ party: "The party", enemies: "The enemies", all: "Everyone in the encounter" });
export const PORTRAIT_SHAPES = Object.freeze({ circle: "Circle", square: "Rounded square", none: "No frame" });
// Screen-wide moments (a flash, a shake) are short by default.
const MOMENT = { flash: 300, shake: 450 };
const safeAudio = (v) => { const s = text(v, 300).trim(); return s && !/^[a-z]+:/i.test(s) && !s.includes("..") && /\.(ogg|mp3|wav|flac|webm|m4a)$/i.test(s) ? s : ""; };
export const FLASH_LIMIT = 40, LAYER_LIMIT = 12;
const num = (v, min, max, fallback) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback; };
const text = (v, max, fallback = "") => (typeof v === "string" ? v.slice(0, max) : fallback);
const color = (v, fallback) => (/^#[\da-f]{6}$/i.test(v ?? "") ? v : fallback);
const pick = (v, choices, fallback) => (Object.hasOwn(choices, v) ? v : fallback);
// Media must be a relative Foundry path to an image/video, or a Sequencer database key.
const safeMedia = (v) => {
  const s = text(v, 300).trim();
  if (!s) return "";
  if (/^[a-z0-9_]+(\.[A-Za-z0-9_-]+)+$/i.test(s) && !/\.(webm|mp4|png|jpe?g|webp|gif|svg)$/i.test(s)) return s;
  return !/^[a-z]+:/i.test(s) && !s.includes("..") && /\.(webm|mp4|png|jpe?g|webp|gif|svg)$/i.test(s) ? s : "";
};
const id = (v) => (/^[A-Za-z0-9-]{1,40}$/.test(v ?? "") ? v : (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 12));

export function validateLayer(l = {}, duration = 4000) {
  const kind = pick(l.kind, FLASH_KINDS, "text");
  const start = num(l.start, 0, duration, 0);
  return {
    id: id(l.id), kind, name: text(l.name, 60),
    x: num(l.x, -20, 120, 50), y: num(l.y, -20, 120, 50),
    start, duration: num(l.duration, 0, duration, MOMENT[kind] ?? 0),
    enter: pick(l.enter, FLASH_MOTIONS, "fade"), enterMs: num(l.enterMs, 0, 4000, 400),
    exit: pick(l.exit, FLASH_MOTIONS, "fade"), exitMs: num(l.exitMs, 0, 4000, 400),
    opacity: num(l.opacity, 0, 1, 1), rotate: num(l.rotate, -180, 180, 0), shake: l.shake === true,
    // Keyframes: where the layer is (position, scale, rotation, opacity) at moments of the screen.
    keys: (Array.isArray(l.keys) ? l.keys : []).slice(0, KEY_LIMIT).map((k) => ({
      at: Math.round(num(k?.at, 0, duration, 0)), x: num(k?.x, -20, 120, 50), y: num(k?.y, -20, 120, 50),
      scale: num(k?.scale, 0.05, 10, 1), rotate: num(k?.rotate, -720, 720, 0), opacity: num(k?.opacity, 0, 1, 1),
    })).sort((a, b) => a.at - b.at),
    keyEase: pick(l.keyEase, { smooth: 1, linear: 1 }, "smooth"),
    loop: pick(l.loop, FLASH_LOOPS, "none"), loopMs: num(l.loopMs, 150, 5000, 900),
    ...(kind === "text" ? {
      text: text(l.text, 200, "Roll for Initiative!"), font: text(l.font, 60, "Signika"), size: num(l.size, 1, 40, 9),
      color: color(l.color, "#ffffff"), outline: color(l.outline, "#000000"), glow: color(l.glow, "#ff7a1a"),
      glowSize: num(l.glowSize, 0, 10, 2), bold: l.bold !== false, italic: l.italic === true, spacing: num(l.spacing, -0.1, 1, 0.04),
      // A second colour fades the letters top to bottom; letters can arrive one after another.
      gradient: l.gradient === true, gradientTo: color(l.gradientTo, "#ffd34d"), letters: num(l.letters, 0, 400, 0),
    } : kind === "image" ? {
      src: safeMedia(l.src), width: num(l.width, 1, 150, 40),
    } : kind === "sound" ? {
      file: safeAudio(l.file), volume: num(l.volume, 0, 1, 0.7),
    } : kind === "portraits" ? {
      side: pick(l.side, PORTRAIT_SIDES, "party"), art: pick(l.art, { token: 1, portrait: 1 }, "token"), shape: pick(l.shape, PORTRAIT_SHAPES, "circle"),
      size: num(l.size, 3, 60, 18), gap: num(l.gap, 0, 20, 2), max: Math.round(num(l.max, 1, 12, 6)), stagger: num(l.stagger, 0, 1000, 120),
      names: l.names !== false, ring: color(l.ring, "#ffffff"),
    } : kind === "flash" ? {
      color: color(l.color, "#ffffff"), strength: num(l.strength, 0.05, 1, 0.85),
    } : kind === "shake" ? {
      strength: num(l.strength, 0.2, 5, 1.5),
    } : {
      color: color(l.color, "#7a1010"), width: num(l.width, 1, 150, 120), height: num(l.height, 1, 100, 22), skew: num(l.skew, -45, 45, -8),
    }),
  };
}
export function validateFlash(s = {}) {
  const duration = num(s.duration, 1000, 12000, 3500);
  return {
    id: id(s.id), name: text(s.name, 80, "Untitled flash").trim() || "Untitled flash",
    event: pick(s.event, FLASH_EVENTS, "start"), duration,
    backdrop: { color: color(s.backdrop?.color, "#000000"), opacity: num(s.backdrop?.opacity, 0, 1, 0.55), vignette: s.backdrop?.vignette !== false,
      // Cinematic letterbox bars.
      bars: s.backdrop?.bars === true, barSize: num(s.backdrop?.barSize, 2, 25, 11) },
    sound: { file: text(s.sound?.file, 300).trim(), volume: num(s.sound?.volume, 0, 1, 0.6) },
    layers: (Array.isArray(s.layers) ? s.layers : []).slice(0, LAYER_LIMIT).map((l) => validateLayer(l, duration)),
  };
}
export const validateFlashes = (list) => (Array.isArray(list) ? list : []).slice(0, FLASH_LIMIT).map(validateFlash);

// A layer's keyframed values at a moment (between keyframes, eased; outside them, held).
export function keyValueAt(layer, t) {
  const keys = layer.keys ?? [];
  const base = { x: layer.x, y: layer.y, scale: 1, rotate: 0, opacity: 1 };
  if (!keys.length) return base;
  if (t <= keys[0].at) return { ...keys[0] };
  if (t >= keys.at(-1).at) return { ...keys.at(-1) };
  const i = keys.findIndex((k) => k.at > t), a = keys[i - 1], b = keys[i];
  let f = (t - a.at) / Math.max(1, b.at - a.at);
  if (layer.keyEase !== "linear") f = f < 0.5 ? 2 * f * f : 1 - (-2 * f + 2) ** 2 / 2;
  const mix = (p) => a[p] + (b[p] - a[p]) * f;
  return { at: Math.round(t), x: mix("x"), y: mix("y"), scale: mix("scale"), rotate: mix("rotate"), opacity: mix("opacity") };
}
// Who appears in a portraits layer: the encounter's visible combatants on that side.
export function portraitPeople(layer, combatants = []) {
  return combatants.filter((c) => layer.side === "all" || c.side === layer.side).slice(0, layer.max);
}
// {scene} in text becomes the scene's name, {round} the combat round.
export const fillText = (value, vars = {}) => String(value ?? "").replace(/\{(scene|round)\}/g, (_, k) => vars[k] ?? "");

// The screen to play: the combat's own choice, else the world default, for this event.
// A choice is a screen id, "random" (any screen for the event) or "none".
export function chooseFlash(screens, event, choice, fallback, random = Math.random) {
  const fits = screens.filter((s) => s.event === event || s.event === "any");
  const resolve = (c) => (c === "none" ? null : c === "random" ? fits[Math.floor(random() * fits.length)] ?? null : screens.find((s) => s.id === c) ?? undefined);
  const picked = choice ? resolve(choice) : undefined;
  return picked !== undefined ? picked : fallback ? resolve(fallback) ?? null : null;
}

export const STARTER_FLASHES = [
  { id: "start-initiative", name: "Roll for Initiative!", event: "start", duration: 3400, backdrop: { color: "#140303", opacity: 0.65, bars: true, barSize: 11 },
    layers: [
      { kind: "band", name: "Band", y: 50, height: 24, color: "#7a0d0d", enter: "slide-left", enterMs: 320, exit: "slide-right", exitMs: 320 },
      { kind: "text", name: "Title", text: "ROLL FOR INITIATIVE!", y: 48, size: 10, gradient: true, color: "#ffffff", gradientTo: "#ffb13b", glow: "#ff4a12", glowSize: 3, enter: "none", letters: 40, start: 150, loop: "glow", loopMs: 900 },
      { kind: "flash", name: "Impact flash", start: 950, duration: 260, strength: 0.8 },
      { kind: "shake", name: "Impact shake", start: 950, duration: 450, strength: 1.8 },
      { kind: "text", name: "Scene", text: "{scene}", y: 62, size: 3.5, bold: false, italic: true, glow: "#000000", glowSize: 0, start: 1150, enter: "blur", enterMs: 500 },
    ] },
  { id: "start-boss", name: "Boss Battle", event: "start", duration: 4200, backdrop: { color: "#05000d", opacity: 0.8, bars: true, barSize: 14 },
    layers: [
      { kind: "text", name: "Warning", text: "WARNING", y: 34, size: 4, color: "#ff3b3b", glow: "#ff0000", glowSize: 2, spacing: 0.6, enter: "fade", enterMs: 200, loop: "flicker", loopMs: 350 },
      { kind: "text", name: "Title", text: "BOSS BATTLE", y: 50, size: 15, gradient: true, color: "#f2f6ff", gradientTo: "#7a8cff", glow: "#4b2bff", glowSize: 4, enter: "slam", enterMs: 420, start: 700, loop: "heartbeat", loopMs: 1100,
        keys: [{ at: 1100, x: 50, y: 50, scale: 1 }, { at: 3600, x: 50, y: 50, scale: 1.12 }] },
      { kind: "flash", name: "Impact flash", start: 950, duration: 300, color: "#d9d4ff", strength: 0.9 },
      { kind: "shake", name: "Impact shake", start: 950, duration: 600, strength: 2.6 },
      { kind: "text", name: "Subtitle", text: "{scene}", y: 64, size: 3.2, italic: true, bold: false, color: "#c9c3ff", glowSize: 0, start: 1500, enter: "type", enterMs: 700, loop: "glitch", loopMs: 1600 },
    ] },
  { id: "start-faceoff", name: "Face Off", event: "start", duration: 4200, backdrop: { color: "#06030c", opacity: 0.78, bars: true, barSize: 10 },
    layers: [
      { kind: "band", name: "Party side", x: 22, y: 50, width: 60, height: 52, color: "#123a6b", skew: -10, enter: "slide-left", enterMs: 350, exit: "slide-left", exitMs: 300 },
      { kind: "band", name: "Enemy side", x: 78, y: 50, width: 60, height: 52, color: "#6b1212", skew: -10, enter: "slide-right", enterMs: 350, exit: "slide-right", exitMs: 300 },
      { kind: "portraits", name: "Party", side: "party", x: 24, y: 50, size: 14, gap: 1.2, max: 4, start: 300, stagger: 130, ring: "#9fd0ff", enter: "none" },
      { kind: "portraits", name: "Enemies", side: "enemies", x: 76, y: 50, size: 14, gap: 1.2, max: 4, start: 450, stagger: 130, ring: "#ff9a9a", enter: "none" },
      { kind: "text", name: "VS", text: "VS", x: 50, y: 50, size: 16, gradient: true, color: "#ffffff", gradientTo: "#ffcf4a", glow: "#ff6a00", glowSize: 4, enter: "slam", enterMs: 380, start: 1200, loop: "heartbeat", loopMs: 1000 },
      { kind: "flash", name: "Impact flash", start: 1450, duration: 260, strength: 0.75 },
      { kind: "shake", name: "Impact shake", start: 1450, duration: 450, strength: 2 },
    ] },
  { id: "start-ambush", name: "Ambush!", event: "start", duration: 2600, backdrop: { color: "#000000", opacity: 0.7 },
    layers: [
      { kind: "text", name: "Title", text: "AMBUSH!", y: 50, size: 16, color: "#ffe1c2", glow: "#d10000", glowSize: 4, enter: "zoom", enterMs: 300, exit: "zoom", shake: true },
      { kind: "flash", name: "Red flash", start: 250, duration: 260, color: "#ff2a2a", strength: 0.55 },
    ] },
  { id: "end-victory", name: "Victory", event: "end", duration: 3600, backdrop: { color: "#1a1404", opacity: 0.5, bars: true, barSize: 9 },
    layers: [
      { kind: "band", name: "Band", y: 50, height: 20, color: "#a7801c", skew: 0, enter: "fade", exit: "fade" },
      { kind: "text", name: "Title", text: "VICTORY", y: 49, size: 12, gradient: true, color: "#fffbe8", gradientTo: "#ffcc33", glow: "#ffd34d", glowSize: 3, enter: "blur", enterMs: 600, start: 200, letters: 70, loop: "glow", loopMs: 1400 },
    ] },
  { id: "end-over", name: "Battle Over", event: "end", duration: 2800, backdrop: { color: "#000000", opacity: 0.45 },
    layers: [
      { kind: "text", name: "Title", text: "The battle is over", y: 50, size: 7, italic: true, bold: false, glow: "#7aa7ff", glowSize: 2, enter: "blur", enterMs: 800, exit: "blur", exitMs: 700 },
    ] },
].map(validateFlash);
