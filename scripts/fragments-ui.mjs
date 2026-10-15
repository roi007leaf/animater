// The Token fragments editor: pattern and knobs, plus a preview of the cut pieces.
import { FRAGMENT_PATTERNS, normalizeFragments, fragmentPieces, fragmentFlight, fragmentPose } from "./fragments.mjs";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function fragmentsPreviewSVG(stage, at) {
  const s = { duration: 1400, ...stage, ...normalizeFragments(stage) }, angle = s.cut === "fixed" ? (s.angle * Math.PI) / 180 : 0;
  const shapes = fragmentPieces(s, angle).map((p, i) => {
    const pose = fragmentPose(s, p, fragmentFlight(s, p, i, angle), at), cx = p.centroid.x, cy = p.centroid.y;
    const pts = p.polygon.map((q) => `${(q.x - cx).toFixed(3)},${(q.y - cy).toFixed(3)}`).join(" ");
    return `<polygon data-fragment="${i}" points="${pts}" transform="translate(${(cx + pose.x).toFixed(3)} ${(cy + pose.y).toFixed(3)}) rotate(${pose.rotation.toFixed(1)})" opacity="${Math.max(0.15, pose.alpha).toFixed(2)}"/>`;
  }).join("");
  return `<svg class="an-fragments-preview" viewBox="-2 -2 4 4" aria-label="Cut pieces preview"><rect x="-0.5" y="-0.5" width="1" height="1" class="an-fragments-outline"/>${shapes}</svg>`;
}

export function fragmentsControlsHTML(stage, index, previewAt = 0.6) {
  const s = { ...stage, ...normalizeFragments(stage) }, field = (key, label, min, max, step) => `<label>${label}<input type="number" min="${min}" max="${max}" step="${step}" data-field="${key}" data-index="${index}" value="${s[key]}"></label>`;
  const select = (key, label, table) => `<label>${label}<select data-field="${key}" data-index="${index}">${Object.entries(table).map(([k, v]) => `<option value="${esc(k)}" ${s[key] === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`;
  return `<div class="an-editor-section an-fragments"><div class="an-section-title"><b>Token fragments</b><small>The real token disappears as the pieces fly</small></div>
    <div class="an-field-row">${select("pattern", "Pattern", FRAGMENT_PATTERNS)}${select("cut", "Cut", { attack: "Follow the attack", fixed: "Fixed angle" })}${field("angle", "Angle°", 0, 180, 5)}</div>
    <div class="an-field-row">${field("pieces", "Pieces", 2, 64, 1)}${field("spread", "Spread (sq)", 0, 3, 0.1)}${field("spin", "Spin°", 0, 720, 5)}</div>
    <div class="an-field-row">${field("fall", "Fall", 0, 1, 0.05)}${field("drift", "Drift", 0, 1, 0.05)}${field("fade", "Fade (ms)", 100, 3000, 50)}</div>
    ${fragmentsPreviewSVG(stage, previewAt)}<label>Preview<input type="range" min="0" max="1" step="0.01" value="${previewAt}" data-fragments-scrub data-index="${index}"></label>
    <p class="an-hint">Use End: hold in a finisher so the token stays hidden until it is hidden for good. "Follow the attack" cuts along the swing.</p></div>`;
}
