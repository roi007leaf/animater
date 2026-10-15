// The Finishers page, the studio's Finisher settings and the catalog entries' Finisher dropdown.
import { normalize, FINISHER_ON, FINISHER_MOVERS, FINISHER_ENDINGS, FINISHER_SUCCESS, FINISHER_WALLS } from "./model.mjs";
import { linkedFinisher, finisherTravelPath, finisherNames } from "./finisher-model.mjs";
import { pathSquares } from "./keyframe-path.mjs";
import { FINISHER_PRESETS } from "./finisher-presets.mjs";
import { studioHTML } from "./studio.mjs";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const choices = (table, current) => Object.entries(table).map(([k, v]) => `<option value="${esc(k)}" ${String(current) === k ? "selected" : ""}>${esc(v)}</option>`).join("");

export function finishersPageHTML(w, recipe) {
  if (w.studio && recipe) return studioHTML(w, recipe);
  const all = w.listedRecipes().filter((r) => r.finisher), def = w.host.defaultFinisher?.() ?? "";
  const cards = all.map((r) => `<button data-action="select" data-id="${esc(r.id)}" class="an-card" style="--effect:${esc(r.color)}"><div class="an-art"><span>✸</span><small>${esc(FINISHER_ON[r.finisher.on])}</small></div><div class="an-card-body"><h2>${esc(r.name)}</h2><p>${esc(r.match || r.itemUuid ? r.match || "One bound item" : "Not assigned yet")}</p><div class="an-card-meta"><span>${esc(FINISHER_ENDINGS[r.finisher.ending])}</span><span>${r.finisher.knockback ? `${r.finisher.knockback} sq knockback` : "No knockback"}</span></div></div></button>`).join("");
  return `<div class="an-work is-library"><section class="an-library">
    <div class="an-section-title"><span>${all.length} finisher${all.length === 1 ? "" : "s"}</span><small>Assign them to spells, feats, actions and weapons. They play on the real token.</small></div>
    <label>Default finisher for other kills<select data-finisher-default><option value="">None (plain collapse)</option>${all.map((r) => `<option value="${esc(r.id)}" ${r.id === def ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select></label>
    <div class="an-grid">${cards || `<div class="an-empty">No finishers yet.<small>Start from a preset below, then assign it.</small></div>`}</div>
    <div class="an-section-title"><span>Presets</span><small>Copy one to make it yours</small></div>
    <div class="an-chips">${Object.entries(FINISHER_PRESETS).map(([id, p]) => `<button data-action="new-finisher" data-preset="${esc(id)}" data-tooltip="${esc(p.description)}">${esc(p.name)}</button>`).join("")}<button data-action="new-finisher" class="an-primary">+ Blank finisher</button></div>
  </section></div>`;
}

// Applies to: one chip per name in `match`. A name that is the bound item's shows its icon.
function appliesToHTML(r, itemSummary) {
  const bound = r.itemUuid ? itemSummary?.(r.itemUuid) : null, list = finisherNames(r.match);
  const chips = list.map((n) => {
    const icon = bound?.img && normalize(bound.name) === normalize(n) ? `<img src="${esc(bound.img)}" alt="">` : "";
    return `<span class="an-finisher-chip">${icon}${esc(n)}<button type="button" class="an-icon" data-action="finisher-unlink" data-name="${esc(n)}" aria-label="Remove ${esc(n)}" data-tooltip="Remove ${esc(n)}">✕</button></span>`;
  }).join("");
  return `<div class="an-finisher-applies"><span class="an-label">Applies to</span>
    <div class="an-finisher-chips${list.length ? "" : " is-empty"}">${chips || `<small>No items yet. Drop one below or add a name.</small>`}</div>
    <div class="an-finisher-drop" data-finisher-drop>Drop spells, feats, actions, weapons or items here</div>
    <input data-finisher-add aria-label="Add a name" placeholder="Add a name…"></div><p class="an-hint">Matched by item name. The Finisher dropdown on catalog entries edits this list too.</p>`;
}

export function finisherSettingsHTML(r, { itemSummary } = {}) {
  const f = r.finisher, path = finisherTravelPath(r), select = (key, label, table) => `<label>${label}<select data-field="finisher.${key}">${choices(table, f[key])}</select></label>`;
  return `<div class="an-editor-section an-binding an-finisher"><div class="an-section-title"><b>Finisher</b><label class="an-check"><input type="checkbox" data-field="enabled" ${r.enabled ? "checked" : ""}>Enabled</label></div>
    <label>Description<textarea aria-label="Description" data-field="description" rows="2" class="an-description">${esc(r.description)}</textarea></label>
    ${appliesToHTML(r, itemSummary)}
    ${select("on", "Plays on", FINISHER_ON)}${select("success", "Needs", FINISHER_SUCCESS)}${select("mover", "Moves", FINISHER_MOVERS)}
    ${path ? `<p class="an-hint">Lands where its keyframed path ends (${pathSquares(path.keyframes)} sq), away from the ${f.mover === "source" ? "target" : "attacker"} and stopping at walls.</p>${select("wall", "At walls", FINISHER_WALLS)}` : `<label>Knockback (squares)<input type="number" min="0" max="6" step="1" data-field="finisher.knockback" value="${f.knockback}"></label>`}
    ${select("ending", "Ending", FINISHER_ENDINGS)}
    <p class="an-hint">${path ? "A stage named “landing” plays where it lands." : "Set a travel motion's End to “Hold at the end”: knockback replaces its distance and the token is moved to where it lands, stopping at walls. A stage named “landing” plays there."} Vanish and Body apply only to a creature at 0 HP.</p></div>`;
}

export function finisherLinkHTML(w, entryName) {
  const finishers = w.host.recipes().filter((r) => r.finisher);
  if (!finishers.length || !entryName) return "";
  const current = linkedFinisher(finishers, entryName)?.id ?? "";
  return `<label class="an-finisher-link">Finisher<select data-finisher-link="${esc(entryName)}"><option value="">None</option>${finishers.map((r) => `<option value="${esc(r.id)}" ${r.id === current ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select></label>`;
}
