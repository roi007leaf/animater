// The Finishers page, the studio's Finisher settings and the catalog entries' Finisher dropdown.
import { normalize, FINISHER_ON, FINISHER_ENDINGS, FINISHER_SUCCESS, FINISHER_WALLS } from "./model.mjs";
import { linkedFinisher, finisherTravelPath, finisherNames, finisherItemLink } from "./finisher-model.mjs";
import { pathSquares, samplePath, normalizeKeyframes } from "./keyframe-path.mjs";
import { fragmentPieces, fragmentFlight, normalizeFragments } from "./fragments.mjs";
import { FINISHER_PRESETS, presetFinisher } from "./finisher-presets.mjs";
import { studioHTML } from "./studio.mjs";
import { finisherToursHTML } from "./finisher-tour.mjs";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const choices = (table, current) => Object.entries(table).map(([k, v]) => `<option value="${esc(k)}" ${String(current) === k ? "selected" : ""}>${esc(v)}</option>`).join("");
const hex = (v, fallback) => (/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(String(v ?? "")) ? String(v) : fallback);

// ---- Finisher glyph: a small looping picture of what a finisher does, as inline SVG ----
// Viewbox 100x50. The animated group loops with SMIL; CSS swaps in the static twin when the
// viewer prefers reduced motion. No ids, so many glyphs can share one page.
const W = 100, H = 50, LOOP = 'dur="2.4s" repeatCount="indefinite"';
const num = (v, d = 1) => { const f = 10 ** d; return Number.isFinite(v) ? Math.round(v * f) / f + 0 : 0; };
const pt = (p) => `${num(p.x)} ${num(p.y)}`;
const wrap = (kind, color, size, body, extra = "") =>
  `<svg class="an-glyph" data-kind="${kind}"${extra} viewBox="0 0 ${W} ${H}" width="${num(size * 2)}" height="${num(size)}" style="--glyph:${esc(color)}" aria-hidden="true" focusable="false">${body}</svg>`;

function travelGlyph(r, keyframes) {
  const samples = Array.from({ length: 24 }, (_, i) => samplePath(keyframes, i / 23));
  const xs = samples.map((p) => p.x), ys = samples.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min(80 / Math.max(x1 - x0, 1e-6), 30 / Math.max(y1 - y0, 1e-6), 24);
  const at = (p) => ({ x: W / 2 + (p.x - (x0 + x1) / 2) * scale, y: H / 2 + (p.y - (y0 + y1) / 2) * scale });
  const pts = samples.map(at), d = `M${pts.map(pt).join(" L")}`, end = pts.at(-1);
  const fades = keyframes.at(-1).alpha <= 0.01;
  let wall = "";
  if (r.finisher?.wall === "slam") {
    const prev = pts.at(-2), dx = end.x - prev.x, dy = end.y - prev.y, len = Math.hypot(dx, dy);
    const u = len > 1e-6 ? { x: dx / len, y: dy / len } : { x: 1, y: 0 }, c = { x: end.x + u.x * 5, y: end.y + u.y * 5 };
    wall = `<line class="an-glyph-wall" x1="${num(c.x - u.y * 10)}" y1="${num(c.y + u.x * 10)}" x2="${num(c.x + u.y * 10)}" y2="${num(c.y - u.x * 10)}"/>`;
  }
  const fade = fades ? `<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.55;0.7;1" ${LOOP}/>` : "";
  return `<path class="an-glyph-trail" d="${d}"/><circle class="an-glyph-start" cx="${num(pts[0].x)}" cy="${num(pts[0].y)}" r="2"/>${wall}`
    + `<g class="an-glyph-anim"><circle class="an-glyph-dot" r="5"><animateMotion ${LOOP} path="${d}" keyPoints="0;1;1" keyTimes="0;0.7;1" calcMode="linear"/>${fade}</circle></g>`
    + `<g class="an-glyph-still"><circle class="an-glyph-dot" cx="${num(end.x)}" cy="${num(end.y)}" r="5"${fades ? ' opacity="0.4"' : ""}/></g>`;
}

function inPlaceGlyph(keyframes) {
  const poses = [0, 0.25, 0.5, 0.75, 1].map((q) => samplePath(keyframes, q));
  const values = (key, d) => [...poses.map((p) => num(p[key], d)), num(poses.at(-1)[key], d)].join(";");
  const times = 'keyTimes="0;0.175;0.35;0.525;0.7;1"';
  const token = `<circle class="an-glyph-dot" r="10"/><line class="an-glyph-notch" x1="0" y1="0" x2="0" y2="-10"/>`;
  return `<g class="an-glyph-anim"><g transform="translate(${W / 2} ${H / 2})"><g><animateTransform attributeName="transform" type="rotate" values="${values("rotation", 0)}" ${times} ${LOOP}/>`
    + `<g><animateTransform attributeName="transform" type="scale" values="${values("scale", 2)}" ${times} ${LOOP}/><animate attributeName="opacity" values="${values("alpha", 2)}" ${times} ${LOOP}/>${token}</g></g></g></g>`
    + `<g class="an-glyph-still"><g transform="translate(${W / 2} ${H / 2})">${token}</g></g>`;
}

// A convex piece of the token's unit square, cut to the token's circle (both convex).
const CIRCLE = Array.from({ length: 24 }, (_, i) => ({ x: 0.5 * Math.cos((i * Math.PI) / 12), y: 0.5 * Math.sin((i * Math.PI) / 12) }));
function clipConvex(pts, clipper) {
  let out = pts;
  for (let i = 0; i < clipper.length && out.length; i++) {
    const a = clipper[i], b = clipper[(i + 1) % clipper.length], side = (p) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    const input = out; out = [];
    input.forEach((p, j) => {
      const q = input[(j + 1) % input.length], sp = side(p), sq = side(q);
      if (sp >= 0) out.push(p);
      if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }); }
    });
  }
  return out;
}

function fragmentsGlyph(stage, color) {
  const cut = Math.PI / 5, R = 30, pieces = fragmentPieces(stage, cut);
  // Dust keeps every few specks so a glyph stays small; the flight still comes from the real index.
  const stride = Math.max(1, Math.ceil(pieces.length / 20));
  const shapes = pieces.map((p, i) => {
    if (i % stride) return null;
    const poly = clipConvex(p.polygon, CIRCLE).filter((q, j, all) => j === 0 || Math.hypot(q.x - all[j - 1].x, q.y - all[j - 1].y) > 1e-3);
    if (poly.length < 3) return null;
    const end = fragmentFlight(stage, p, i, cut).keyframes.at(-1);
    const dx = Math.max(-30, Math.min(30, end.x * R * 1.4)), dy = Math.max(-16, Math.min(16, end.y * R * 1.4));
    const points = poly.map((q) => `${num(W / 2 + q.x * R)},${num(H / 2 + q.y * R)}`).join(" ");
    return { points, dx, dy };
  }).filter(Boolean);
  // Explicit fill and outline so a piece never falls back to an invisible default if the stylesheet misses.
  const polygon = (s) => `<polygon class="an-glyph-piece" fill="${esc(color)}" stroke="#e8eaf2" stroke-width="1.2" stroke-linejoin="round" points="${s.points}"/>`;
  const ghost = `<circle class="an-glyph-ghost" cx="${W / 2}" cy="${H / 2}" r="${R}" fill="none" stroke="${esc(color)}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.45"/>`;
  const anim = shapes.map((s) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;${num(s.dx)} ${num(s.dy)};${num(s.dx)} ${num(s.dy)}" keyTimes="0;0.2;0.75;1" ${LOOP}/><animate attributeName="opacity" values="1;1;0.3;0.3" keyTimes="0;0.5;0.8;1" ${LOOP}/>${polygon(s)}</g>`).join("");
  const still = shapes.map((s) => `<g transform="translate(${num(s.dx * 0.35)} ${num(s.dy * 0.35)})">${polygon(s)}</g>`).join("");
  return `${ghost}<g class="an-glyph-anim">${anim}</g><g class="an-glyph-still">${still}</g>`;
}

function knockbackGlyph(knockback) {
  const len = 10 + Math.min(6, Math.max(0, knockback)) * 6, from = 40, tip = from + 9 + len;
  const arrow = `<path class="an-glyph-arrow" d="M${from + 9} 25 L${tip - 5} 25"/><polygon class="an-glyph-arrow" points="${tip},25 ${tip - 6},21 ${tip - 6},29"/>`;
  return `<circle class="an-glyph-attacker" cx="20" cy="25" r="4"/>${arrow}`
    + `<g class="an-glyph-anim"><circle class="an-glyph-dot" cx="${from}" cy="25" r="7"><animateTransform attributeName="transform" type="translate" values="0 0;${num(len * 0.8)} 0;${num(len * 0.8)} 0" keyTimes="0;0.6;1" ${LOOP}/></circle></g>`
    + `<g class="an-glyph-still"><circle class="an-glyph-dot" cx="${from}" cy="25" r="7"/></g>`;
}

export function finisherGlyphSVG(recipe, { size = 80 } = {}) {
  const color = hex(recipe?.color, "#9e8aff"), stages = Array.isArray(recipe?.stages) ? recipe.stages : [];
  const path = finisherTravelPath(recipe), keyframes = path ? normalizeKeyframes(path.keyframes, { limit: 24 }) : null;
  const fragments = stages.find((s) => s?.kind === "motion" && s.motion === "fragments");
  if (keyframes && pathSquares(keyframes) >= 1) return wrap("travel", color, size, travelGlyph(recipe, keyframes));
  if (fragments) return wrap("fragments", color, size, fragmentsGlyph(fragments, color), ` data-pattern="${esc(normalizeFragments(fragments).pattern)}"`);
  if (keyframes) return wrap("inplace", color, size, inPlaceGlyph(keyframes));
  return wrap("knockback", color, size, knockbackGlyph(Number(recipe?.finisher?.knockback) || 0));
}

// ---- The Finishers page ----
export const FINISHER_PRESET_GROUPS = {
  Flung: ["launch", "wall-slam", "sky-launch", "ragdoll-tumble", "jolt", "blast", "skewer", "struck-down"],
  "In place": ["ash", "melt", "ascend", "unmade", "soul-departs", "fall", "shaken-apart", "pancake", "cleave"],
  Pieces: ["slice-in-half", "bisect", "shatter-shards", "disintegrate", "shatter", "vortex-spiral"],
};
const ENDING_PILL = { vanish: "Vanish", body: "Body", stay: "Stay" };
const PRESET_GLYPHS = new Map();
function presetGlyph(id) {
  if (!PRESET_GLYPHS.has(id)) {
    let r;
    try { r = presetFinisher(id, `preset-${id}`); } catch { r = FINISHER_PRESETS[id].build(); }
    PRESET_GLYPHS.set(id, finisherGlyphSVG(r, { size: 22 }));
  }
  return PRESET_GLYPHS.get(id);
}

function cardChipsHTML(r, itemSummary) {
  const list = finisherNames(r.match), legacy = r.itemUuid ? itemSummary?.(r.itemUuid) : null;
  const linkOf = (n) => finisherItemLink(r.finisher, n) ?? (r.itemUuid && (!legacy || normalize(legacy.name) === normalize(n)) ? r.itemUuid : null);
  const chip = (n) => { const uuid = linkOf(n), info = uuid ? itemSummary?.(uuid) : null; return `<span class="an-fcard-chip"><img src="${esc(info?.img || "icons/svg/item-bag.svg")}" alt="">${esc(n)}</span>`; };
  if (!list.length) return r.itemUuid ? chip(legacy?.name || "One bound item") : `<small>Not assigned yet</small>`;
  return list.slice(0, 3).map(chip).join("") + (list.length > 3 ? `<span class="an-fcard-chip is-more">+${list.length - 3}</span>` : "");
}

function playersPill(f, players) {
  const has = f.players ?? [];
  const who = has.includes("*") ? "All players" : players.filter((p) => has.includes(p.id)).map((p) => `<i class="an-player-dot" style="background:${esc(hex(p.color, "#a6aec2"))}"></i>${esc(p.name)}`).join(", ");
  return `<span class="an-pill an-pill-players">${who === "All players" ? who : who ? `Players: ${who}` : "GM only"}</span>`;
}

function finisherCardHTML(r, players, itemSummary) {
  const f = r.finisher, path = finisherTravelPath(r), squares = path ? pathSquares(normalizeKeyframes(path.keyframes, { limit: 24 })) : 0;
  const reach = path ? (squares ? `Travels ${squares} sq` : "In place") : f.knockback ? `Knockback: ${f.knockback} sq` : "Knockback: none";
  const id = esc(r.id), off = r.enabled === false;
  return `<article class="an-card an-fcard${off ? " is-off" : ""}" data-action="select" data-id="${id}" style="--effect:${esc(hex(r.color, "#9e8aff"))}">`
    + `<button type="button" data-action="select" data-id="${id}" class="an-fcard-open" aria-label="Open ${esc(r.name)}">`
    + `<div class="an-art an-fcard-art">${finisherGlyphSVG(r)}<span class="an-fcard-badges"><span class="an-fcard-badge">${esc(FINISHER_ON[f.on])}</span>${off ? `<span class="an-fcard-badge is-off">Off</span>` : ""}</span></div>`
    + `<div class="an-card-body"><h2>${esc(r.name)}</h2><div class="an-fcard-chips">${cardChipsHTML(r, itemSummary)}</div>`
    + `<div class="an-fcard-pills"><span class="an-pill">Ending: ${esc(ENDING_PILL[f.ending] ?? FINISHER_ENDINGS[f.ending] ?? f.ending)}</span><span class="an-pill">${esc(reach)}</span>${playersPill(f, players)}</div></div></button>`
    + `<span class="an-fcard-actions"><button type="button" data-action="select" data-id="${id}" class="an-fcard-quick">Edit</button><button type="button" data-action="recipe-menu-duplicate" data-id="${id}" class="an-fcard-quick">Duplicate</button></span></article>`;
}

export function finishersPageHTML(w, recipe) {
  if (w.studio && recipe) return studioHTML(w, recipe);
  const all = w.listedRecipes().filter((r) => r.finisher), def = w.host.defaultFinisher?.() ?? "";
  const players = w.host.players?.() ?? [], itemSummary = w.host.itemSummary ? (uuid) => w.host.itemSummary(uuid) : null;
  const cards = all.map((r) => finisherCardHTML(r, players, itemSummary)).join("");
  const tile = (id) => { const p = FINISHER_PRESETS[id]; return `<button type="button" data-action="new-finisher" data-preset="${esc(id)}" data-tooltip="${esc(p.description)}" class="an-preset-tile">${presetGlyph(id)}<span>${esc(p.name)}</span></button>`; };
  const groups = Object.entries(FINISHER_PRESET_GROUPS).map(([name, ids]) => `<div class="an-preset-group"><h3 class="an-preset-heading">${esc(name)}</h3><div class="an-preset-tiles">${ids.filter((id) => FINISHER_PRESETS[id]).map(tile).join("")}</div></div>`).join("");
  return `<div class="an-work is-library"><section class="an-library an-finishers">
    <div class="an-finishers-sub"><span>${all.length} finisher${all.length === 1 ? "" : "s"}</span><small>Assign them to spells, feats, actions and weapons. They play on the real token.</small></div>
    <label class="an-finisher-default"><span>Default finisher for other kills</span><select data-finisher-default><option value="">None (plain collapse)</option>${all.map((r) => `<option value="${esc(r.id)}" ${r.id === def ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select></label>
    <p class="an-hint">Plays for NPC kills when no finisher matches the item.</p>
    ${cards ? `<div class="an-grid an-fcard-grid">${cards}</div>` : `<div class="an-empty an-finishers-empty">No finishers yet. Pick a preset below or start blank.</div>`}
    <div class="an-section-title"><span>Presets</span><small>Copy one to make it yours</small>${finisherToursHTML(w.showFinisherTours)}</div>
    <div class="an-preset-groups">${groups}<div class="an-preset-tiles"><button type="button" data-action="new-finisher" class="an-preset-tile is-blank">+ Blank finisher</button></div></div>
  </section></div>`;
}

// Applies to: one card per name in `match`, shaped like a recipe's bound item. A name dropped
// from an item (or the legacy bound item's name) opens that item; a typed name is matched by name only.
const capital = (v) => (v ? v[0].toUpperCase() + v.slice(1) : "");
const unbindHTML = (n) => `<button type="button" class="an-bound-unbind" data-action="finisher-unlink" data-name="${esc(n)}" aria-label="Remove ${esc(n)}" data-tooltip="Remove ${esc(n)}">Unbind</button>`;
function appliesCardHTML(n, uuid, itemSummary) {
  if (!uuid) return `<div class="an-bound is-by-name"><div class="an-bound-item"><img src="icons/svg/item-bag.svg" alt=""><span><b>${esc(n)}</b><small>By name</small></span></div>${unbindHTML(n)}</div>`;
  const info = itemSummary?.(uuid) ?? null;
  const meta = info ? [capital(info.type), info.source].filter(Boolean).join(" · ") : "Item not found";
  return `<div class="an-bound"><button type="button" class="an-bound-item" data-action="open-bound" data-uuid="${esc(uuid)}" data-tooltip="Open ${esc(n)}<br><small>${esc(uuid)}</small>" ${info ? "" : "disabled"}><img src="${esc(info?.img || "icons/svg/item-bag.svg")}" alt=""><span><b>${esc(n)}</b><small>${esc(meta)}</small></span></button>${unbindHTML(n)}</div>`;
}
function appliesToHTML(r, itemSummary) {
  const list = finisherNames(r.match), legacy = r.itemUuid ? itemSummary?.(r.itemUuid) : null;
  const linkOf = (n) => finisherItemLink(r.finisher, n) ?? (legacy && normalize(legacy.name) === normalize(n) ? r.itemUuid : null);
  const cards = list.map((n) => appliesCardHTML(n, linkOf(n), itemSummary)).join("");
  return `<div class="an-finisher-applies"><span class="an-label">Applies to</span>
    <div class="an-finisher-cards${list.length ? "" : " is-empty"}">${cards || `<small>No items yet. Drop one below or add a name.</small>`}</div>
    <div class="an-finisher-drop" data-finisher-drop>Drop spells, feats, actions, weapons or items here</div>
    <input data-finisher-add aria-label="Add a name" placeholder="Add a name…"></div><p class="an-hint">Matched by item name. The Finisher dropdown on catalog entries edits this list too.</p>`;
}

function availableToHTML(f, players) {
  const has = f.players ?? [], everyone = has.includes("*");
  const boxes = players.map((p) => `<label class="an-check"><input type="checkbox" data-finisher-player="${esc(p.id)}" ${has.includes(p.id) ? "checked" : ""} ${everyone ? "disabled" : ""}><i class="an-player-dot" style="background:${esc(p.color)}"></i>${esc(p.name)}</label>`).join("");
  return `<div class="an-finisher-players"><span class="an-label">Available to</span><label class="an-check"><input type="checkbox" data-finisher-player="*" ${everyone ? "checked" : ""}>All players</label>${boxes}</div><p class="an-hint">Chosen players can pick this finisher for their own items in Combater; only a player's pick plays for their items. NPCs and GM creatures use Applies-to automatically.</p>`;
}

// "Needs" only means something for a use or a killing blow (a critical is always critical):
// it shows for those two, with what it decides there. The stored value stays as it is.
const NEEDS_HINTS = { use: "Which results count as a successful use.", kill: "Critical only: the killing blow must itself be a critical." };
const needsHTML = (f, select) => (NEEDS_HINTS[f.on] ? `${select("success", "Needs", FINISHER_SUCCESS)}<p class="an-hint">${esc(NEEDS_HINTS[f.on])}</p>` : "");

export function finisherSettingsHTML(r, { itemSummary, players = [] } = {}) {
  const f = r.finisher, path = finisherTravelPath(r), select = (key, label, table) => `<label>${label}<select data-field="finisher.${key}">${choices(table, f[key])}</select></label>`;
  return `<div class="an-editor-section an-binding an-finisher"><div class="an-section-title"><b>Finisher</b><label class="an-check"><input type="checkbox" data-field="enabled" ${r.enabled ? "checked" : ""}>Enabled</label></div>
    <label>Description<textarea aria-label="Description" data-field="description" rows="2" class="an-description">${esc(r.description)}</textarea></label>
    ${appliesToHTML(r, itemSummary)}
    ${select("on", "Plays on", FINISHER_ON)}${availableToHTML(f, players)}${needsHTML(f, select)}
    ${path ? `<p class="an-hint">Lands where its keyframed path ends (${pathSquares(path.keyframes)} sq), away from the attacker and stopping at walls.</p>${select("wall", "At walls", FINISHER_WALLS)}` : `<label>Knockback (squares)<input type="number" min="0" max="6" step="1" data-field="finisher.knockback" value="${f.knockback}"></label><p class="an-hint">Shoves the target this far away from the attacker before the rest plays (stops at walls).</p>`}
    ${select("ending", "Ending", FINISHER_ENDINGS)}
    <p class="an-hint">${path ? "A stage named “landing” plays where it lands." : "Set a travel motion's End to “Hold at the end”: knockback replaces its distance and the token is moved to where it lands, stopping at walls. A stage named “landing” plays there."} Vanish and Body apply only to a creature at 0 HP.</p></div>`;
}

// `uuid`: the catalog entry's item, remembered for its Applies-to card when given.
export function finisherLinkHTML(w, entryName, uuid) {
  const finishers = w.host.recipes().filter((r) => r.finisher);
  if (!finishers.length || !entryName) return "";
  const current = linkedFinisher(finishers, entryName)?.id ?? "";
  return `<label class="an-finisher-link">Finisher<select data-finisher-link="${esc(entryName)}"${uuid ? ` data-finisher-uuid="${esc(uuid)}"` : ""}><option value="">None</option>${finishers.map((r) => `<option value="${esc(r.id)}" ${r.id === current ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select></label>`;
}
