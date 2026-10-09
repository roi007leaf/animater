// Draws a flash screen as DOM: a backdrop plus positioned layers, each driven by
// one Web Animation spanning the whole screen, so the editor can scrub any moment
// (seek) and the live overlay plays the same frames. Sizes use container units, so
// a small editor frame and the full window look alike.
import { fillText } from "./flash-model.mjs";

const VIDEO = /\.(webm|mp4)$/i;
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Off-stage state for an entrance (or, mirrored, the exit continuing the same way).
function offstage(motion, exit) {
  const flip = exit ? -1 : 1;
  switch (motion) {
    case "fade": return { opacity: 0 };
    case "slide-left": return { dx: `${-70 * flip}cqw` };
    case "slide-right": return { dx: `${70 * flip}cqw` };
    case "slide-up": return { dy: `${60 * flip}cqh` };
    case "slide-down": return { dy: `${-60 * flip}cqh` };
    case "zoom": return { scale: exit ? 1.6 : 0.2, opacity: 0 };
    case "slam": return { scale: exit ? 0.4 : 3, opacity: 0 };
    case "type": case "wipe": return {};
    default: return {};
  }
}
// Type on / wipe reveal the content itself (it never moves inside its own box, so keyframes can't push it out of the clip).
const OPEN = "inset(-25% -25% -25% -25%)";
const CLIP = { type: { from: "inset(-25% 100% -25% -25%)", to: "inset(-25% -25% -25% 100%)" }, wipe: { from: "inset(100% -25% -25% -25%)", to: "inset(-25% -25% 100% -25%)" } };
const frame = (layer, state = {}, offset, easing) => ({
  offset,
  ...(easing ? { easing } : {}),
  opacity: state.opacity ?? layer.opacity,
  transform: `translate(-50%, -50%) translate(${state.dx ?? "0px"}, ${state.dy ?? "0px"}) rotate(${layer.rotate}deg) scale(${state.scale ?? 1})`,
});

// Keyframes for one layer over the whole screen (offsets are fractions of it).
export function layerKeyframes(layer, total) {
  const o = (ms) => Math.min(1, Math.max(0, ms / total));
  const start = layer.start, end = layer.duration > 0 ? Math.min(total, start + layer.duration) : total;
  const shown = Math.min(end, start + layer.enterMs), leave = Math.max(shown, end - layer.exitMs);
  const hidden = { ...offstage(layer.enter, false), opacity: 0 };
  if (CLIP[layer.enter]) hidden.opacity = layer.opacity;
  const frames = [frame(layer, hidden, 0), frame(layer, { ...offstage(layer.enter, false), opacity: layer.enter === "none" ? layer.opacity : offstage(layer.enter, false).opacity ?? layer.opacity }, o(start), "cubic-bezier(.2,.8,.2,1)")];
  if (layer.enter === "slam") frames.push(frame(layer, { scale: 0.92 }, o(start + layer.enterMs * 0.7)));
  frames.push(frame(layer, {}, o(shown)));
  if (layer.shake) for (const [i, d] of [[1, 1], [2, -1], [3, 1], [4, -0.5]]) frames.push(frame(layer, { dx: `${d * 0.8}cqw`, dy: `${-d * 0.5}cqh` }, o(Math.min(leave, shown + i * 60))));
  frames.push(frame(layer, {}, o(leave), "cubic-bezier(.6,0,.8,.2)"));
  const gone = offstage(layer.exit, true);
  frames.push(frame(layer, { ...gone, opacity: layer.exit === "none" ? 0 : gone.opacity ?? layer.opacity }, o(end)));
  frames.push(frame(layer, { ...gone, opacity: CLIP[layer.exit] ? layer.opacity : 0 }, 1));
  // Offsets must never go backwards.
  for (let i = 1; i < frames.length; i++) frames[i].offset = Math.max(frames[i].offset, frames[i - 1].offset);
  return frames;
}

export function revealKeyframes(layer, total) {
  if (!CLIP[layer.enter] && !CLIP[layer.exit]) return null;
  const o = (ms) => Math.min(1, Math.max(0, ms / total));
  const start = layer.start, end = layer.duration > 0 ? Math.min(total, layer.start + layer.duration) : total;
  const shown = Math.min(end, start + layer.enterMs), leave = Math.max(shown, end - layer.exitMs);
  const from = CLIP[layer.enter]?.from ?? OPEN, to = CLIP[layer.exit]?.to ?? OPEN;
  return [{ offset: 0, clipPath: from }, { offset: o(start), clipPath: from }, { offset: o(shown), clipPath: OPEN }, { offset: o(leave), clipPath: OPEN }, { offset: o(end), clipPath: to }, { offset: 1, clipPath: to }];
}
// Keyframed motion, relative to the layer's own place: position, scale, rotation, opacity.
export function motionKeyframes(layer, total) {
  const keys = layer.keys ?? [];
  if (!keys.length) return null;
  const easing = layer.keyEase === "linear" ? "linear" : "ease-in-out";
  const at = (k, offset) => ({ offset, easing, opacity: k.opacity, transform: `translate(${(k.x - layer.x).toFixed(2)}cqw, ${(k.y - layer.y).toFixed(2)}cqh) rotate(${k.rotate}deg) scale(${k.scale})` });
  return [at(keys[0], 0), ...keys.map((k) => at(k, Math.min(1, k.at / total))), at(keys.at(-1), 1)];
}
// A repeating effect while the layer is on screen.
const LOOPS = {
  pulse: [{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }],
  flicker: [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }, { opacity: 0.8 }, { opacity: 1 }],
  wobble: [{ transform: "rotate(0deg)" }, { transform: "rotate(-3deg)" }, { transform: "rotate(3deg)" }, { transform: "rotate(0deg)" }],
  float: [{ transform: "translateY(0)" }, { transform: "translateY(-1.2cqh)" }, { transform: "translateY(0)" }],
  spin: [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
};
export function loopTiming(layer, total) {
  if (!LOOPS[layer.loop]) return null;
  const end = layer.duration > 0 ? Math.min(total, layer.start + layer.duration) : total;
  return { keyframes: LOOPS[layer.loop], options: { delay: layer.start, duration: layer.loopMs, iterations: Math.max(1, (end - layer.start) / layer.loopMs), easing: "ease-in-out", fill: "none" } };
}

function layerHTML(layer, { resolveMedia, vars }) {
  if (layer.kind === "sound") return "";
  if (layer.kind === "text") {
    const shadow = layer.glowSize > 0 ? [1, 2, 3].map((k) => `0 0 ${(layer.glowSize * 0.5 * k).toFixed(2)}cqh ${layer.glow}`).join(",") : "none";
    return `<span class="an-flash-text" style="font-family:'${esc(layer.font)}',Signika,sans-serif;font-size:${layer.size}cqh;color:${layer.color};-webkit-text-stroke:${(layer.size * 0.035).toFixed(2)}cqh ${layer.outline};text-shadow:${shadow};font-weight:${layer.bold ? 800 : 400};font-style:${layer.italic ? "italic" : "normal"};letter-spacing:${layer.spacing}em">${esc(fillText(layer.text, vars))}</span>`;
  }
  if (layer.kind === "image") {
    const src = resolveMedia?.(layer.src) ?? layer.src;
    if (!src) return `<span class="an-flash-missing" style="width:${layer.width}cqw">Choose an image</span>`;
    return VIDEO.test(src) ? `<video src="${esc(src)}" muted autoplay loop playsinline style="width:${layer.width}cqw"></video>` : `<img src="${esc(src)}" alt="" style="width:${layer.width}cqw">`;
  }
  return `<span class="an-flash-band" style="width:${layer.width}cqw;height:${layer.height}cqh;background:${layer.color};transform:skewX(${layer.skew}deg)"></span>`;
}

// container: the element to draw into. Returns { el, seek(ms), play(), stop() }.
export function createFlash(container, screen, { resolveMedia, vars = {}, editing = false, playSound } = {}) {
  const el = document.createElement("div");
  el.className = `an-flash${editing ? " is-editing" : ""}`;
  el.innerHTML = `<div class="an-flash-backdrop" style="background:${screen.backdrop.color}"></div>${screen.backdrop.vignette ? `<div class="an-flash-vignette"></div>` : ""}${screen.layers.map((l, i) => `<div class="an-flash-layer" data-flash-layer="${i}" style="left:${l.x}%;top:${l.y}%"><div class="an-flash-motion"><div class="an-flash-fx">${layerHTML(l, { resolveMedia, vars })}</div></div></div>`).join("")}`;
  container.append(el);
  const total = screen.duration, timing = { duration: total, fill: "both" };
  const fadeIn = Math.min(300, total / 4), fadeOut = Math.min(400, total / 4);
  const animations = [
    ...[el.querySelector(".an-flash-backdrop"), el.querySelector(".an-flash-vignette")].filter(Boolean).map((b, i) => b.animate([
      { offset: 0, opacity: 0 }, { offset: fadeIn / total, opacity: i ? 1 : screen.backdrop.opacity },
      { offset: 1 - fadeOut / total, opacity: i ? 1 : screen.backdrop.opacity }, { offset: 1, opacity: 0 }], timing)),
    ...screen.layers.flatMap((l, i) => {
      if (l.kind === "sound") return [];
      const node = el.querySelector(`[data-flash-layer="${i}"]`), motion = motionKeyframes(l, total), loop = loopTiming(l, total);
      return [
        node.animate(layerKeyframes(l, total), timing),
        ...(motion ? [node.querySelector(".an-flash-motion").animate(motion, timing)] : []),
        ...(loop ? [node.querySelector(".an-flash-fx").animate(loop.keyframes, loop.options)] : []),
        ...(revealKeyframes(l, total) && node.querySelector(".an-flash-fx > *") ? [node.querySelector(".an-flash-fx > *").animate(revealKeyframes(l, total), timing)] : []),
      ];
    }),
  ];
  for (const a of animations) a.pause();
  const timers = [];
  return {
    el,
    seek(ms) { for (const a of animations) { a.pause(); a.currentTime = Math.max(0, Math.min(total, ms)); } },
    play() {
      for (const a of animations) { a.currentTime = 0; a.play(); }
      // Sound layers fire at their start times.
      for (const l of screen.layers) if (l.kind === "sound" && l.file && playSound) timers.push(setTimeout(() => playSound(l.file, l.volume), l.start));
      return animations[0] ? animations[0].finished.catch(() => {}) : Promise.resolve();
    },
    stop() { for (const t of timers) clearTimeout(t); timers.length = 0; for (const a of animations) a.cancel(); el.remove(); },
  };
}
