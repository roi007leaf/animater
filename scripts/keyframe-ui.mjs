// Keyframed path editing: diamonds on the timeline bar, the grid path canvas and the inspector.
import { EASES } from "./stage-options.mjs";
import { samplePath, DEFAULT_KEYFRAMES, snapSquares } from "./keyframe-path.mjs";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const keyframesOf = (s) => (Array.isArray(s?.keyframes) && s.keyframes.length >= 2 ? s.keyframes : DEFAULT_KEYFRAMES);
const n2 = (v) => Math.round(v * 1000) / 1000;

export function keyframeDiamondsHTML(s, stageIndex, selected) {
  const kfs = keyframesOf(s);
  return `<span class="an-kf-diamonds">${kfs.map((k, i) => `<span class="an-kf-diamond${i === selected ? " is-on" : ""}${i === 0 || i === kfs.length - 1 ? " is-fixed" : ""}" data-kf-diamond="${i}" data-kf-stage="${stageIndex}" style="left:${(k.at * 100).toFixed(2)}%" data-tooltip="Keyframe ${i + 1}${i === 0 || i === kfs.length - 1 ? " (fixed)" : " · drag to retime"}"></span>`).join("")}</span>`;
}

// A square view (in squares) holding the whole curve, the token and a margin.
export function canvasView(keyframes) {
  const pts = [...Array.from({ length: 41 }, (_, n) => samplePath(keyframes, n / 40)), ...keyframes];
  const minX = Math.min(-1, ...pts.map((p) => p.x)) - 1, maxX = Math.max(1, ...pts.map((p) => p.x)) + 1;
  const minY = Math.min(-1, ...pts.map((p) => p.y)) - 1, maxY = Math.max(1, ...pts.map((p) => p.y)) + 1;
  const size = Math.max(4, maxX - minX, maxY - minY);
  return { x: n2(minX - (size - (maxX - minX)) / 2), y: n2(minY - (size - (maxY - minY)) / 2), w: n2(size), h: n2(size) };
}
// Pointer → squares through an SVG drawn with preserveAspectRatio="xMidYMid meet".
export function canvasToSquares({ clientX, clientY }, rect, view) {
  const scale = Math.min(rect.width / view.w, rect.height / view.h);
  const offX = (rect.width - view.w * scale) / 2, offY = (rect.height - view.h * scale) / 2;
  return { x: n2(view.x + (clientX - rect.left - offX) / scale), y: n2(view.y + (clientY - rect.top - offY) / scale) };
}

export function pathCanvasHTML(s, { selected = -1, finisher = null } = {}) {
  const kfs = keyframesOf(s), v = canvasView(kfs), curve = Array.from({ length: 61 }, (_, n) => samplePath(kfs, n / 60));
  const grid = [];
  for (let x = Math.ceil(v.x); x <= v.x + v.w; x++) grid.push(`<line x1="${x}" y1="${v.y}" x2="${x}" y2="${v.y + v.h}"/>`);
  for (let y = Math.ceil(v.y); y <= v.y + v.h; y++) grid.push(`<line x1="${v.x}" y1="${y}" x2="${v.x + v.w}" y2="${y}"/>`);
  const ghost = (k, i) => `<g class="an-kf-ghost${i === selected ? " is-on" : ""}" transform="translate(${k.x} ${k.y}) rotate(${k.rotation}) scale(${k.scale})" opacity="${Math.max(0.12, k.alpha)}"><rect x="-0.4" y="-0.4" width="0.8" height="0.8" rx="0.12"/></g>`;
  const end = kfs.at(-1), landing = finisher && s.motionEnd === "hold" ? `<rect class="an-kf-landing" data-kf-landing x="${snapSquares(end.x, true) - 0.5}" y="${snapSquares(end.y, true) - 0.5}" width="1" height="1"/>` : "";
  const away = finisher ? (finisher.mover === "source" ? "away from the target" : "away from the attacker") : "away from the other token";
  return `<div class="an-kf-canvas" data-kf-canvas data-kf-view="${v.x} ${v.y} ${v.w} ${v.h}" aria-label="Keyframed path: drag the dots to move keyframes">
    <svg viewBox="${v.x} ${v.y} ${v.w} ${v.h}" preserveAspectRatio="xMidYMid meet">
      <g class="an-kf-grid">${grid.join("")}</g>${landing}
      <line class="an-kf-axis" x1="0" y1="0" x2="1.2" y2="0"/>
      <polyline class="an-kf-curve" points="${curve.map((p) => `${n2(p.x)},${n2(p.y)}`).join(" ")}"/>
      ${kfs.map(ghost).join("")}
      <circle class="an-kf-origin" cx="0" cy="0" r="0.42"/>
      ${kfs.map((k, i) => (i === 0 ? "" : `<circle class="an-kf-dot${i === selected ? " is-on" : ""}" data-kf-dot="${i}" cx="${k.x}" cy="${k.y}" r="0.16"/>`)).join("")}
      <circle class="an-kf-scrub" data-kf-scrub cx="0" cy="0" r="0.22"/>
    </svg><small>+x = ${away} →${finisher && s.motionEnd === "hold" ? " · dashed square: where it lands" : ""}</small></div>`;
}

export function keyframeInspectorHTML(s, stageIndex, selected) {
  const kfs = keyframesOf(s), i = Math.max(0, Math.min(kfs.length - 1, selected)), k = kfs[i];
  const first = i === 0, last = i === kfs.length - 1, attrs = (key) => `data-field="keyframe" data-kf-field="${key}" data-kf-index="${i}" data-index="${stageIndex}"`;
  const num = (key, label, value, min, max, step, off = false) => `<label>${label}<input type="number" ${attrs(key)} min="${min}" max="${max}" step="${step}" value="${value}" ${off ? "disabled" : ""}></label>`;
  return `<div class="an-editor-section an-kf-inspector"><div class="an-section-title"><b>Keyframes</b><small>${kfs.length}/12 · drag dots in the preview</small></div>
    <div class="an-kf-list" role="group" aria-label="Keyframes">${kfs.map((kk, j) => `<button data-action="kf-select" data-kf="${j}" class="${j === i ? "is-active" : ""}" aria-pressed="${j === i}">${j + 1}</button>`).join("")}</div>
    <div class="an-field-row">${num("at", "At (ms)", Math.round(k.at * s.duration), 0, s.duration, 10, first || last)}${num("x", "X (squares)", k.x, -12, 12, 0.25, first)}${num("y", "Y (squares)", k.y, -12, 12, 0.25, first)}</div>
    <div class="an-field-row">${num("rotation", "Rotation°", k.rotation, -1440, 1440, 5, first)}${num("scale", "Size ×", k.scale, 0.05, 5, 0.05, first)}${num("alpha", "Opacity", k.alpha, 0, 1, 0.05, first)}</div>
    <div class="an-field-row"><label>Easing<select ${attrs("ease")}>${Object.entries(EASES).map(([key, label]) => `<option value="${esc(key)}" ${k.ease === key ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></label><label class="an-check"><input type="checkbox" ${attrs("sharp")} ${k.sharp ? "checked" : ""}> Sharp corner</label></div>
    <div class="an-play-actions"><button data-action="kf-add" ${kfs.length >= 12 || last ? "disabled" : ""}>+ Keyframe after</button><button data-action="kf-delete" class="an-quiet" ${first || last ? "disabled" : ""}>Delete keyframe</button><button data-action="kf-flip" class="an-quiet">Flip path</button><button data-action="kf-reset" class="an-quiet">Reset to straight shove</button></div>
    <p class="an-hint">+x is away from the other token. Easing shapes the speed into each keyframe. In a finisher with End: hold, the token is moved to where the path ends.</p></div>`;
}
