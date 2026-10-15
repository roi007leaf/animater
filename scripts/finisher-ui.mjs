// The Finishers page, the studio's Finisher settings and the catalog entries' Finisher dropdown.
import { normalize, FINISHER_ON, FINISHER_ENDINGS, FINISHER_SUCCESS, FINISHER_WALLS } from "./model.mjs";
import { linkedFinisher, finisherTravelPath, finisherNames, finisherItemLink } from "./finisher-model.mjs";
import { pathSquares } from "./keyframe-path.mjs";
import { FINISHER_PRESETS } from "./finisher-presets.mjs";
import { studioHTML } from "./studio.mjs";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const choices = (table, current) => Object.entries(table).map(([k, v]) => `<option value="${esc(k)}" ${String(current) === k ? "selected" : ""}>${esc(v)}</option>`).join("");

export function finishersPageHTML(w, recipe) {
  if (w.studio && recipe) return studioHTML(w, recipe);
  const all = w.listedRecipes().filter((r) => r.finisher), def = w.host.defaultFinisher?.() ?? "";
  const names = w.host.players?.() ?? [];
  const whoHas = (f) => (f.players ?? []).includes("*") ? "All players" : names.filter((p) => (f.players ?? []).includes(p.id)).map((p) => p.name).join(", ") || "GM only";
  const cards = all.map((r) => `<button data-action="select" data-id="${esc(r.id)}" class="an-card" style="--effect:${esc(r.color)}"><div class="an-art"><span>✸</span><small>${esc(FINISHER_ON[r.finisher.on])}</small></div><div class="an-card-body"><h2>${esc(r.name)}</h2><p>${esc(r.match || r.itemUuid ? r.match || "One bound item" : "Not assigned yet")}</p><div class="an-card-meta"><span>${esc(FINISHER_ENDINGS[r.finisher.ending])}</span><span>${r.finisher.knockback ? `${r.finisher.knockback} sq knockback` : "No knockback"}</span><span>${esc(whoHas(r.finisher))}</span></div></div></button>`).join("");
  return `<div class="an-work is-library"><section class="an-library">
    <div class="an-section-title"><span>${all.length} finisher${all.length === 1 ? "" : "s"}</span><small>Assign them to spells, feats, actions and weapons. They play on the real token.</small></div>
    <label>Default finisher for other kills<select data-finisher-default><option value="">None (plain collapse)</option>${all.map((r) => `<option value="${esc(r.id)}" ${r.id === def ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select></label>
    <div class="an-grid">${cards || `<div class="an-empty">No finishers yet.<small>Start from a preset below, then assign it.</small></div>`}</div>
    <div class="an-section-title"><span>Presets</span><small>Copy one to make it yours</small></div>
    <div class="an-chips">${Object.entries(FINISHER_PRESETS).map(([id, p]) => `<button data-action="new-finisher" data-preset="${esc(id)}" data-tooltip="${esc(p.description)}">${esc(p.name)}</button>`).join("")}<button data-action="new-finisher" class="an-primary">+ Blank finisher</button></div>
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
    ${path ? `<p class="an-hint">Lands where its keyframed path ends (${pathSquares(path.keyframes)} sq), away from the attacker and stopping at walls.</p>${select("wall", "At walls", FINISHER_WALLS)}` : `<label>Knockback (squares)<input type="number" min="0" max="6" step="1" data-field="finisher.knockback" value="${f.knockback}"></label>`}
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
