import {
  PF2E_FEATS,
  PF2E_FEAT_SOURCE,
  catalogFeat,
  catalogFeatEnabled,
  featRecipe,
  filterFeats,
  normalizeFeatCatalogState,
} from "./feat-catalog.mjs";
import { SPELL_THEMES } from "./spell-choreography.mjs";
import { EVENTS } from "./model.mjs";
import { sampleRecipe } from "./composition.mjs";
import { motionSyncNoticeHTML } from "./spell-catalog-ui.mjs";
import { abilitySoundSettingsHTML, abilitySoundDetailHTML } from "./ability-sounds-ui.mjs";
import { catalogNameHTML } from "./catalog-details.mjs";

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const title = (value) => String(value ?? "").replaceAll("-", " ")
  .replace(/\b\w/g, (c) => c.toUpperCase());
const qualities = { signature: "Curated", themed: "Themed", symbolic: "Symbolic" };
const theme = (feat) => SPELL_THEMES[feat.theme] ?? { label: "Ability", color: "#bf9dff" };
const activity = (feat) => feat.actionType === "reaction" ? "Reaction"
  : feat.actionType === "free" ? "Free action"
  : feat.actionType === "action" ? `${feat.actions ?? "?"} action${feat.actions === 1 ? "" : "s"}`
  : "Manual activity";
const select = (field, label, values, current) => `<label>${label}<select data-feat-filter="${field}">${Object.entries(values)
  .sort(([a], [b]) => a === "all" ? -1 : b === "all" ? 1 : 0)
  .map(([value, text]) => `<option value="${esc(value)}" ${value === String(current) ? "selected" : ""}>${esc(text)}</option>`)
  .join("")}</select></label>`;

export function featCatalogHTML(w) {
  const filter = w.featFilters;
  const matches = filterFeats(filter);
  const pages = Math.max(1, Math.ceil(matches.length / 36));
  w.featPage = Math.max(0, Math.min(w.featPage, pages - 1));
  if (!matches.some((f) => f.id === w.selectedFeat)) w.selectedFeat = matches[0]?.id;
  const chosen = catalogFeat(w.selectedFeat);
  const current = matches.slice(w.featPage * 36, (w.featPage + 1) * 36);
  const state = normalizeFeatCatalogState(w.host.featCatalogState?.());
  const env = w.host.environment();
  const running = state.enabled && (state.independent || w.host.enabled());
  const allRunning = running && state.scope === "all";
  const selectedCount = [...new Set([...state.selected, ...state.customized])]
    .filter((id) => !state.excluded.includes(id)).length;
  const canConfigure = !env.demo && env.systemId === "pf2e" && env.ready && !w.busy;
  const categories = [...new Set(PF2E_FEATS.map((f) => f.category).filter(Boolean))].sort();
  const classes = [...new Set(PF2E_FEATS.flatMap((f) => f.classTraits ?? []))].sort();
  return `<div class="an-work an-spell-work an-feat-work"><section class="an-library an-spell-library an-feat-library">
    <div class="an-catalog-intro"><div><span class="an-eyebrow">PF2E ACTIVE FEATS</span><h2>${PF2E_FEATS.length.toLocaleString()} abilities. Ready for action.</h2><p>Actions, reactions and free actions. Passive bonuses and granted spell parents excluded. Use catalog animations directly; Customize opens every stage.</p></div></div>
    <div class="an-search"><span>⌕</span><input data-search="feats" aria-label="Search PF2e feats" placeholder="Feat name, class, trait or sourcebook…" value="${esc(filter.search)}"><kbd>/</kbd></div>
    <div class="an-spell-filters">${select("level", "Level", { all: "All levels", ...Object.fromEntries(Array.from({ length: 21 }, (_, i) => [i, `Level ${i}`])) }, filter.level)}${select("activity", "Activity", { all: "All activities", action: "Actions", reaction: "Reactions", free: "Free actions", manual: "Manual activities" }, filter.activity)}${select("category", "Feat category", { all: "All categories", ...Object.fromEntries(categories.map((c) => [c, title(c)])) }, filter.category)}${select("classTrait", "Class", { all: "All classes", ...Object.fromEntries(classes.map((c) => [c, title(c)])) }, filter.classTrait)}${select("theme", "Animation family", { all: "All families", ...Object.fromEntries(Object.entries(SPELL_THEMES).map(([k, v]) => [k, v.label]).sort((a, b) => a[1].localeCompare(b[1]))) }, filter.theme)}${select("quality", "Treatment", { all: "All treatments", ...qualities }, filter.quality)}</div>
    <div class="an-catalog-automation"><div><b>Plug &amp; play</b><small>${env.demo ? "Enable inside a PF2e world." : env.systemId !== "pf2e" ? "Automatic feats require PF2e." : allRunning ? `${state.excluded.length} excluded · manual entries stay manual` : running ? `${selectedCount} selected feats enabled` : "Send an active feat to chat · no recipe setup"}</small></div><button class="${allRunning ? "an-quiet" : "an-primary"}" data-action="feat-auto" ${!canConfigure ? "disabled" : ""}>${allRunning ? "Pause feat catalog" : "Use feat catalog"}</button>${running && !allRunning ? `<button class="an-quiet" data-action="feat-pause" ${!canConfigure ? "disabled" : ""}>Pause</button>` : ""}</div>
    <div class="an-catalog-automation"><div><b>Token motion</b><small>Readable gestures and reactions. Game positions stay intact.</small></div><button role="switch" aria-checked="${state.motion !== false}" aria-label="Feat catalog token motion" class="${state.motion !== false ? "an-primary" : "an-quiet"}" data-action="feat-motion" ${!canConfigure ? "disabled" : ""}>${state.motion !== false ? "On" : "Effects only"}</button></div>
    ${state.motion !== false ? motionSyncNoticeHTML(env) : ""}${abilitySoundSettingsHTML(w, state, "feat")}
    <div class="an-section-title"><span>${matches.length.toLocaleString()} result${matches.length === 1 ? "" : "s"}</span><button class="an-text-button" data-action="feat-reset">Reset filters</button></div>
    <div class="an-spell-grid">${current.map((feat) => `<button class="an-spell-card ${feat.id === chosen?.id ? "is-selected" : ""}" style="--effect:${theme(feat).color}" data-action="select-feat" data-id="${esc(feat.id)}" aria-pressed="${feat.id === chosen?.id}"><img loading="lazy" src="${esc(w.host.imageURL?.(feat.img) ?? feat.img)}" alt=""><div><b>${esc(feat.name)}</b><small>Level ${feat.level} · ${esc(activity(feat))} · ${esc(theme(feat).label)}</small><span class="an-treatment is-${feat.quality}">${qualities[feat.quality] ?? "Symbolic"}</span></div></button>`).join("") || `<div class="an-empty">No active feats match.<small>Try fewer filters.</small></div>`}</div>
    <div class="an-catalog-pagination"><button data-action="feat-page" data-index="${w.featPage - 1}" ${w.featPage === 0 ? "disabled" : ""}>← Previous</button><span>Page ${w.featPage + 1} of ${pages}</span><button data-action="feat-page" data-index="${w.featPage + 1}" ${w.featPage === pages - 1 ? "disabled" : ""}>Next →</button></div>
    <p class="an-hint an-catalog-source">PF2e ${esc(PF2E_FEAT_SOURCE.version)}. Description-based visual cues; gameplay, prerequisites and action costs stay with PF2e. Feat chat cards identify activation; generic Strike rolls cannot identify which feat you used.</p>
  </section><aside class="an-inspector an-spell-detail">${chosen ? featDetailHTML(w, chosen, state, env) : `<div class="an-empty">Choose an active feat.</div>`}</aside></div>`;
}

function featDetailHTML(w, feat, state, env) {
  const recipe = featRecipe(feat, { motion: state.motion !== false, soundCatalog: state.sound ? w.host.soundCatalog?.() : null, soundVolume: state.soundVolume });
  const saved = w.host.recipes().find((r) => r.id === recipe.id || r.itemUuid === recipe.itemUuid);
  const roleNotice=recipe.playbackRoles?.reason;
  const automatic = recipe.trigger !== "manual" && !roleNotice;
  const usingCatalog = automatic && (state.independent || w.host.enabled()) && catalogFeatEnabled(feat.id, state) &&
    (!saved || state.selected.includes(feat.id) || (state.preferCatalog && !state.customized.includes(feat.id)));
  const canUse = !env.demo && env.systemId === "pf2e" && env.ready;
  const duration = w.previewDuration(recipe);
  const status = roleNotice ? "Manual token selection needed" : !automatic ? "Manual animation" : usingCatalog ? "Using catalog animation"
    : saved && (w.host.enabled() || state.enabled && state.customized.includes(feat.id))
      ? saved.enabled === false ? "Customization paused" : "Customized recipe takes priority" : "Ready to use";
  const notes = feat.notes ?? [];
  return `<div class="an-eyebrow">BUILT-IN FEAT · ${(qualities[feat.quality] ?? "Symbolic").toUpperCase()}</div>
    <div class="an-spell-detail-title"><img src="${esc(w.host.imageURL?.(feat.img) ?? feat.img)}" alt=""><div><h2>${catalogNameHTML(feat, "feat", env)}</h2><small>Level ${feat.level} · ${esc(activity(feat))} · ${esc(feat.rarity)}</small></div></div>
    <div class="an-spell-badges">${[feat.category, ...(feat.classTraits ?? []), ...(feat.traits ?? []).slice(0, 6)].filter(Boolean).filter((v, i, values) => values.indexOf(v) === i).map((v) => `<span>${esc(title(v))}</span>`).join("")}</div>
    ${roleNotice?`<div class="an-catalog-notes" role="note"><b>Native performer required</b><p>${esc(roleNotice)}</p><small>Automatic playback skips this entry until native roles can be identified. Preview shows a manual illustration.</small></div>`:''}
    <div class="an-preview an-full-preview" style="--effect:${recipe.color}">${w.recipePreviewHTML(recipe)}</div>
    <div class="an-preview-transport"><button class="an-primary" data-action="recipe-preview" ${w.busy ? "disabled" : ""}>▶ Preview recipe</button><span data-preview-time>0.0 / ${(duration / 1000).toFixed(1)}s</span></div><progress data-recipe-progress aria-label="Recipe playback progress" max="${duration}" value="0"></progress><small class="an-preview-status" data-preview-status role="status">Ready · full choreography, original timing</small>
    <div class="an-catalog-use-status ${usingCatalog ? "is-using" : ""}" role="status"><b>${status}</b><small>${!automatic ? "Play manually when this ability activates." : usingCatalog ? "Send this feat to chat · no saved recipe slot" : "Use animation enables this feat directly from catalog data."}</small></div>
    <div class="an-play-actions an-catalog-choice"><button data-action="${automatic ? "use-feat" : "play"}" class="an-primary" ${w.busy || (automatic ? !canUse || usingCatalog : env.demo || !env.ready) ? "disabled" : ""}>${automatic ? usingCatalog ? "Using catalog ✓" : "Use animation" : "Play animation"}</button><button data-action="copy-feat" class="an-quiet" ${w.busy ? "disabled" : ""}>${saved ? "Edit customization" : "Customize"}</button></div><button class="an-catalog-canvas-preview" data-action="preview" ${env.demo || !env.ready || w.busy ? "disabled" : ""}>▷ Local canvas preview</button>
    ${abilitySoundDetailHTML(w, feat, recipe, state)}<div class="an-catalog-steps">${sampleRecipe(recipe).stages.map((s, i) => `<div class="an-stage" data-stage-drag="${i}"><span>${i + 1}</span><div><b>${esc(s.label || s.kind)}</b><small>${s.delay}ms · ${s.duration}ms · ${esc(s.kind)}</small></div></div>`).join("")}</div>
    <div class="an-editor-section"><b>When it plays</b><p class="an-hint">${esc(EVENTS[recipe.trigger])}. ${automatic ? "Only this feat's own card activates its catalog animation. Weapon attacks are not inferred as feat use." : "Native activation cannot be attributed reliably; use manual playback."}</p><button class="an-quiet" data-action="feat-exclude" ${env.demo || env.systemId !== "pf2e" || w.busy ? "disabled" : ""}>${state.excluded.includes(feat.id) ? "Include in automatic feat catalog" : "Exclude from automatic feat catalog"}</button></div>
    ${notes.length ? `<div class="an-catalog-notes"><b>Placement &amp; treatment</b>${notes.map((n) => `<p>${esc(n)}</p>`).join("")}</div>` : ""}
    <details class="an-advanced" data-options-group="feat-source"><summary>Media &amp; source</summary>${recipe.stages.map((s) => `<p class="an-hint"><b>${esc(s.label || s.kind)}</b><br>${esc(s.assets.join(" → ") || s.soundFile || s.fxPreset || s.fxType || "Native token artwork")}</p>`).join("")}<p class="an-hint">${esc(feat.publication)}. Free and Patreon fallbacks select installed assets.</p><a href="https://github.com/foundryvtt/pf2e/blob/${PF2E_FEAT_SOURCE.sha}/${esc(feat.path)}" target="_blank" rel="noopener noreferrer">PF2e source feat ↗</a></details>`;
}
