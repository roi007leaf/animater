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
    default: return {};
  }
}
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
  const frames = [frame(layer, hidden, 0), frame(layer, { ...offstage(layer.enter, false), opacity: layer.enter === "none" ? layer.opacity : offstage(layer.enter, false).opacity ?? layer.opacity }, o(start), "cubic-bezier(.2,.8,.2,1)")];
  if (layer.enter === "slam") frames.push(frame(layer, { scale: 0.92 }, o(start + layer.enterMs * 0.7)));
  frames.push(frame(layer, {}, o(shown)));
  if (layer.shake) for (const [i, d] of [[1, 1], [2, -1], [3, 1], [4, -0.5]]) frames.push(frame(layer, { dx: `${d * 0.8}cqw`, dy: `${-d * 0.5}cqh` }, o(Math.min(leave, shown + i * 60))));
  frames.push(frame(layer, {}, o(leave), "cubic-bezier(.6,0,.8,.2)"));
  const gone = offstage(layer.exit, true);
  frames.push(frame(layer, { ...gone, opacity: layer.exit === "none" ? 0 : gone.opacity ?? layer.opacity }, o(end)));
  frames.push(frame(layer, { ...gone, opacity: 0 }, 1));
  // Offsets must never go backwards.
  for (let i = 1; i < frames.length; i++) frames[i].offset = Math.max(frames[i].offset, frames[i - 1].offset);
  return frames;
}

function layerHTML(layer, { resolveMedia, vars }) {
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
export function createFlash(container, screen, { resolveMedia, vars = {}, editing = false } = {}) {
  const el = document.createElement("div");
  el.className = `an-flash${editing ? " is-editing" : ""}`;
  el.innerHTML = `<div class="an-flash-backdrop" style="background:${screen.backdrop.color}"></div>${screen.backdrop.vignette ? `<div class="an-flash-vignette"></div>` : ""}${screen.layers.map((l, i) => `<div class="an-flash-layer" data-flash-layer="${i}" style="left:${l.x}%;top:${l.y}%">${layerHTML(l, { resolveMedia, vars })}</div>`).join("")}`;
  container.append(el);
  const total = screen.duration, timing = { duration: total, fill: "both" };
  const fadeIn = Math.min(300, total / 4), fadeOut = Math.min(400, total / 4);
  const animations = [
    ...[el.querySelector(".an-flash-backdrop"), el.querySelector(".an-flash-vignette")].filter(Boolean).map((b, i) => b.animate([
      { offset: 0, opacity: 0 }, { offset: fadeIn / total, opacity: i ? 1 : screen.backdrop.opacity },
      { offset: 1 - fadeOut / total, opacity: i ? 1 : screen.backdrop.opacity }, { offset: 1, opacity: 0 }], timing)),
    ...screen.layers.map((l, i) => el.querySelector(`[data-flash-layer="${i}"]`).animate(layerKeyframes(l, total), timing)),
  ];
  for (const a of animations) a.pause();
  return {
    el,
    seek(ms) { for (const a of animations) { a.pause(); a.currentTime = Math.max(0, Math.min(total, ms)); } },
    play() {
      for (const a of animations) { a.currentTime = 0; a.play(); }
      return animations[0] ? animations[0].finished.catch(() => {}) : Promise.resolve();
    },
    stop() { for (const a of animations) a.cancel(); el.remove(); },
  };
}
