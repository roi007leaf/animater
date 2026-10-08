import { OPTIONAL_FX_KINDS, fxAvailability } from './optional-fx.mjs';
import {
  EVENTS,
  KINDS,
  clone,
  validateRecipe,
  parseImport,
  resolveAsset,
  MOTIONS,
  MAX_STAGES,
} from "./model.mjs";
import { motionPose, motionDirection, poseTransform } from "./motion.mjs";
import { isPathMotion } from "./motion-path.mjs";
import { catalogSoundOptions, previewRecipeSounds } from "./spell-sounds.mjs";
import { starterRecipes } from "./presets.mjs";
import { reorderStages, recipeDuration, RecipeClock, linkStartModes, moveRow, snapStart, timelineLayout, packLanes } from "./choreography.mjs";
import { RecipePreview } from "./recipe-preview.mjs";
import { trackOf, studioHTML, studioAfterRender, studioAction, studioFrame, studioInput, studioKey, studioPointer, studioWheel, studioContextMenu } from "./studio.mjs";
import { previewMediaFailed, markPreviewMediaFailure, clearPreviewMediaFailure } from "./preview-media-status.mjs";
import { chainPreview, hasChain } from "./chain-preview.mjs";
import { patchDOM } from "./dom-patch.mjs";
import { MediaLibrary } from './media-library.mjs';
import { mediaForReference, mediaType } from './media-library-model.mjs';
import {
  catalogSpell,
  spellRecipe,
  PF2E_SPELLS,
  normalizeCatalogState,
  useCatalogSpell,
} from "./spell-catalog.mjs";
import { spellCatalogHTML, motionSyncNoticeHTML } from "./spell-catalog-ui.mjs";
import {
  PF2E_FEATS,
} from "./feat-catalog.mjs";
import { featCatalogHTML, ABILITY_PAGE_PROFILES, abilityProfileForPage, abilityProfileForKey, defaultAbilityFilters } from "./feat-catalog-ui.mjs";
import { PF2E_WEAPONS, catalogWeapon, weaponRecipe, normalizeWeaponCatalogState, useCatalogWeapon, weaponCustomizationKey } from "./weapon-catalog.mjs";
import { weaponCatalogHTML } from "./weapon-catalog-ui.mjs";
import { openCatalogDetails } from "./catalog-details.mjs";
import { PF2E_CONDITIONS, PF2E_EFFECTS, catalogStateEntry, stateRecipe } from "./state-catalog.mjs";
import { stateCatalogHTML } from "./state-catalog-ui.mjs";
import { handleStateCatalogAction } from "./state-catalog-actions.mjs";
import {catalogNavigation,catalogPageAllowed,catalogPageTitle,worldCatalogSystem} from './catalog-system.mjs';
import {DndCatalogWorkspace} from './dnd5e-catalog-ui.mjs';
import {sfCatalogProfile} from './sf2e-catalog.mjs';
import { ORB_ELEMENTS, orbRecipe } from "./orb-builder.mjs";
import { sampleRecipe, timedStages } from "./composition.mjs";
import {
  OPTION_GROUPS,
  normalizeOptions,
  EASES,
  TRACK_PROPERTIES,
} from "./stage-options.mjs";
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icons = {
  Fire: "✦",
  Ice: "❄",
  Lightning: "ϟ",
  Arcane: "◇",
  Healing: "✧",
  Weapons: "⚔",
  Custom: "◎",
  Motion: "↝",
};
const options = (items, value) =>
  Object.entries(items)
    .map(
      ([k, v]) =>
        `<option value="${esc(k)}" ${k === value ? "selected" : ""}>${esc(v)}</option>`,
    )
    .join("");
export class Workspace {
  constructor(root, host) {
    this.root = root;
    this.host = host;
    this.dndCatalog = ['dnd5e','sf2e'].includes(worldCatalogSystem(host.environment?.()??{}))?new DndCatalogWorkspace(this,worldCatalogSystem(host.environment?.()??{})==='sf2e'?sfCatalogProfile:{}):null;
    this.page = "recipes";
    this.search = "";
    this.category = "All";
    this.spellFilters = {
      search: "",
      rank: "all",
      kind: "all",
      tradition: "all",
      edition: "all",
      theme: "all",
      quality: "all",
    };
    this.selectedSpell = PF2E_SPELLS.find(
      (s) => s.name === "Fireball" && s.edition === "remaster",
    )?.id;
    this.spellPage = 0;
    this.featFilters = {
      search: "",
      level: "all",
      activity: "all",
      category: "all",
      classTrait: "all",
      theme: "all",
      quality: "all",
    };
    this.selectedFeat = PF2E_FEATS.find((f) => f.slug === "sudden-charge")?.id;
    this.featPage = 0;
    // Actions and Features pages share the feat page UI (see ABILITY_PAGE_PROFILES).
    for (const profile of [ABILITY_PAGE_PROFILES.actions, ABILITY_PAGE_PROFILES.features]) {
      this[profile.filtersKey] = defaultAbilityFilters();
      this[profile.selectedKey] = profile.catalog.entries.find((f) => f.slug === profile.defaultSlug)?.id;
      this[profile.pageKey] = 0;
    }
    this.weaponFilters = { search: "", group: "all", mode: "all", category: "all", edition: "all" };
    this.weaponPage = 0;
    this.selectedWeapon = PF2E_WEAPONS.find(w => w.slug === "dagger")?.id;
    this.weaponMode = "melee";
    this.stateFilters = Object.fromEntries(["condition", "effect"].map(k => [k, {search:"",group:"all",theme:"all",quality:"all"}]));
    this.statePages = {condition:0,effect:0};
    this.stateDamageType = "bleed";
    this.stateAuraVariant = "default";
    this.selectedState = {condition:PF2E_CONDITIONS.find(e => e.slug === "frightened")?.id, effect:PF2E_EFFECTS.find(e => e.name === "Spell Effect: Bless")?.id};
    this.selected = host.recipes()[0]?.id;
    this.drafts = new Map();
    this.dirty = new Set();
    this.stageIndex = 0;
    this.assetSearch = "";
    this.selectedAssetKey = null;
    this.message = "";
    this.busy = false;
    this.previewMode = "recipe";
    this.previewRun = null;
    this.previewSerial = 0;
    this.stageDrag = null;
    this.pendingImport = null;
    this.abort = new AbortController();
    root.addEventListener("click", (e) => this.onClick(e), {
      signal: this.abort.signal,
    });
    root.addEventListener("input", (e) => this.onInput(e), {
      signal: this.abort.signal,
    });
    root.addEventListener("change", (e) => this.onChange(e), {
      signal: this.abort.signal,
    });
    root.addEventListener(
      "play",
      (e) => {
        if (e.target.tagName !== "AUDIO" || !e.target.hasAttribute("controls"))
          return;
        // Audition one cue at a time, separate from full recipe playback.
        this.previewRun?.stop();
        const button = e.target
          .closest(".an-sound-cue")
          ?.querySelector('[data-action="audition-sound"]');
        if (button) button.textContent = "■ Stop sound";
        this.root.querySelectorAll("audio").forEach((a) => {
          if (a !== e.target) a.pause();
        });
      },
      { capture: true, signal: this.abort.signal },
    );
    root.addEventListener(
      "pause",
      (e) => {
        if (e.target.tagName !== "AUDIO") return;
        const button = e.target
          .closest(".an-sound-cue")
          ?.querySelector('[data-action="audition-sound"]');
        if (button) button.textContent = "▶ Listen";
      },
      { capture: true, signal: this.abort.signal },
    );
    root.addEventListener(
      "error",
      (event) => {
        const video = event.target;
        const mediaPreview = video.closest?.('.an-media-preview');
        if (mediaPreview) { mediaPreview.querySelector('.an-media-preview-error').hidden = false; return; }
        if (video.tagName !== "VIDEO" || !previewMediaFailed(video)) return;
        const layer = video.closest(".an-recipe-layer");
        if (layer) {
          markPreviewMediaFailure(video);
          return;
        }
        const thumb = video.closest(".an-asset-thumb");
        if (thumb) {
          thumb.querySelector("span").textContent = "No preview";
          return;
        }
        const preview = video.closest(".an-preview");
        if (preview && !preview.querySelector(".an-media-error")) {
          const message = document.createElement("div");
          message.className = "an-media-error";
          message.textContent =
            "Video unavailable. Check JB2A files, then refresh library.";
          preview.append(message);
        }
      },
      { capture: true, signal: this.abort.signal },
    );
    root.addEventListener("loadeddata", (event) => {
      const video = event.target;
      if (video.tagName !== "VIDEO") return;
      clearPreviewMediaFailure(video);
      video.closest(".an-preview")?.querySelector(".an-media-error")?.remove();
    }, { capture: true, signal: this.abort.signal });
    root.addEventListener('loadedmetadata', event => {
      const box=event.target.closest?.('.an-media-preview');
      if(box)box.querySelector('.an-media-preview-error').hidden=true;
      const video=event.target;
      if(video.tagName==='VIDEO'&&video.closest('.an-asset-thumb')&&Number.isFinite(video.duration)&&video.duration>0)video.currentTime=Math.min(2,video.duration*.35);
    }, {capture:true,signal:this.abort.signal});
    root.addEventListener('load',event=>{
      if(event.target.tagName==='IMG')event.target.closest?.('.an-media-preview')?.querySelector('.an-media-preview-error')?.setAttribute('hidden','');
    }, {capture:true,signal:this.abort.signal});
    root.addEventListener('pointerover', event => {
      const video=event.target.closest?.('.an-asset-thumb')?.querySelector('video');
      if(video)void video.play().catch(()=>{});
    }, {signal:this.abort.signal});
    root.addEventListener('pointerout', event => {
      const thumb=event.target.closest?.('.an-asset-thumb');
      if(thumb&&!thumb.contains(event.relatedTarget))thumb.querySelector('video')?.pause();
    }, {signal:this.abort.signal});
    root.addEventListener(
      "keydown",
      (e) => {
        const dialog = this.root.querySelector('[role="dialog"]');
        if (dialog) {
          if (e.key === "Escape") {
            e.preventDefault();
            this.pendingImport = null;
            this.render();
            return;
          }
          if (e.key === "Tab") {
            const controls = [
              ...dialog.querySelectorAll("button:not(:disabled),textarea"),
            ];
            const first = controls[0],
              last = controls.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        } else if (
          e.key === "/" &&
          !e.target.matches("input,textarea,select")
        ) {
          e.preventDefault();
          this.root.querySelector("[data-search]")?.focus();
        }
      },
      { signal: this.abort.signal },
    );
    root.addEventListener("drop", (e) => this.onDrop(e), {
      signal: this.abort.signal,
    });
    root.addEventListener("pointerdown", (e) => { if (studioPointer(this, e)) return; this.onSplitterPointer(e); this.onTimelinePointer(e); }, { signal: this.abort.signal });
    root.addEventListener("wheel", (e) => studioWheel(this, e), { passive: false, signal: this.abort.signal });
    root.addEventListener("contextmenu", (e) => studioContextMenu(this, e), { signal: this.abort.signal });
    root.addEventListener("dblclick", (e) => {
      const h = e.target.closest?.("[data-splitter]"); if (h) this.setInspectorWidth(380, h.closest(".an-work, .an-studio"));
      if (e.target.closest?.("[data-st-hsplit]")) { this.studioTimelineHeight = 280; try { globalThis.localStorage?.removeItem("animater.timelineHeight"); } catch {} this.render(); }
    }, { signal: this.abort.signal });
    root.addEventListener("keydown", (e) => {
      if (this.isStudio() && studioKey(this, e)) return;
      const bar = e.target.closest?.("[data-tl-bar]"); if (bar) { this.nudgeTimeline(bar, e); return; }
      const split = e.target.closest?.("[data-splitter]");
      if (split && ["ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault(); this.setInspectorWidth(this.inspectorWidth() + (e.key === "ArrowLeft" ? 20 : -20), split.closest(".an-work, .an-studio")); }
    }, { signal: this.abort.signal });
    root.addEventListener(
      "dragstart",
      (e) => {
        const stage = e.target.closest("[data-stage-drag]");
        if (!stage || this.busy || ["builder", "spells", "feats", "actions", "features", "weapons", "items", "conditions", "effects"].includes(this.page))
          return;
        this.stopEditorPreview();
        this.stageDrag = Number(stage.dataset.stageDrag);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "application/x-animater-stage",
          String(this.stageDrag),
        );
        stage.classList.add("is-dragging");
      },
      { signal: this.abort.signal },
    );
    root.addEventListener("dragend", () => this.clearStageDrag(), {
      signal: this.abort.signal,
    });
    root.addEventListener(
      "dragover",
      (e) => {
        const stage = e.target.closest("[data-stage-drag]");
        if (stage && this.stageDrag !== null && !this.busy) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          this.root
            .querySelectorAll(".is-drop-target")
            .forEach((el) => el.classList.remove("is-drop-target"));
          stage.classList.add("is-drop-target");
        }
        if (e.target.closest(".an-binding")) e.preventDefault();
      },
      { signal: this.abort.signal },
    );
    this.render();
  }
  destroy() {
    void this.mediaLibrary?.stopTokenPreview();
    this.stopEditorPreview();
    this.abort.abort();
    cancelAnimationFrame(this.motionFrame);
    this.thumbnails?.disconnect();
    this.releaseMedia();
  }
  releaseMedia() {
    this.root.querySelectorAll("video,audio").forEach((v) => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    });
  }
  recipe() {
    if(this.dndCatalog?.isCatalogPage())return this.dndCatalog.recipe();
    if (["conditions", "effects"].includes(this.page)) {
      const entry = catalogStateEntry(this.selectedState[this.page === "conditions" ? "condition" : "effect"]);
      return entry && stateRecipe(entry, {damageType:this.stateDamageType,auraVariant:this.stateAuraVariant,catalog:this.host.catalog?.()});
    }
    if (this.page === "weapons") {
      const weapon = catalogWeapon(this.selectedWeapon), state = normalizeWeaponCatalogState(this.host.weaponCatalogState?.());
      const mode = weapon?.modes.some(m => m.mode === this.weaponMode) ? this.weaponMode : weapon?.modes[0]?.mode;
      return weapon && weaponRecipe(weapon, mode, { motion: state.motion, soundCatalog: state.sound ? this.host.soundCatalog?.() : null, soundVolume: state.soundVolume });
    }
    if (abilityProfileForPage(this.page)) {
      const profile = abilityProfileForPage(this.page), feat = profile.catalog.entry(this[profile.selectedKey]);
      const state = profile.catalog.normalizeState(this.host[profile.stateKey]?.());
      return feat && profile.catalog.recipe(feat, state, this.host.soundCatalog?.());
    }
    if (this.page === "spells") {
      const spell = catalogSpell(this.selectedSpell);
      return (
        spell && spellRecipe(spell, undefined, catalogSoundOptions(this.host))
      );
    }
    if (this.page === "builder" && this.builder)
      return {
        ...orbRecipe(this.builder, "orb-preview", this.host.catalog()),
        previewDistance: this.builder.previewDistance ?? 3,
      };
    return this.drafts.get(this.selected) ?? this.savedRecipe();
  }
  savedRecipe() {
    const saved = this.host.recipes().find((r) => r.id === this.selected);
    return saved && validateRecipe(saved);
  }
  listedRecipes() {
    const saved = this.host.recipes();
    return [
      ...saved.map((r) => this.drafts.get(r.id) ?? r),
      ...[...this.drafts.values()].filter(
        (r) => !saved.some((old) => old.id === r.id),
      ),
    ];
  }
  edit() {
    const r = this.recipe();
    if (!r) return null;
    if (!this.drafts.has(r.id)) this.drafts.set(r.id, clone(r));
    this.dirty.add(r.id);
    return this.drafts.get(r.id);
  }
  motionBlocked(recipe) {
    const env = this.host.environment();
    return (
      !env.demo &&
      env.motionReady === false &&
      recipe.stages.some((s) => s.kind === "motion" || s.kind === "tokenfx" && !s.catalogFx && this.host.fxCatalog?.().tokenReady)
    );
  }
  status(recipe) {
    if (this.motionBlocked(recipe)) return "Token motion channel unavailable";
    if (
      recipe.stages.some(
        (s) =>
          !["motion", "sprite", "sound"].includes(s.kind) && !OPTIONAL_FX_KINDS.has(s.kind) && !s.assets.length,
      )
    )
      return "Choose an asset";
    for(const stage of recipe.stages.filter(s=>OPTIONAL_FX_KINDS.has(s.kind))) {
      const issue=fxAvailability(stage,this.host.fxCatalog?.());
      if(issue&&!stage.catalogFx)return issue;
    }
    if (recipe.stages.some((s) => s.kind === "sound" && !s.soundFile?.trim()))
      return "Choose an audio file";
    const missing = recipe.stages.filter(
      (s) =>
        !["motion", "sprite", "sound"].includes(s.kind) && !OPTIONAL_FX_KINDS.has(s.kind) &&
        !resolveAsset(s, this.host.catalog()),
    );
    return missing.length
      ? `${missing.length} missing asset${missing.length > 1 ? "s" : ""}`
      : "Ready to play";
  }
  isStudio() { return this.page === "recipes" && !!this.studio && !!this.recipe(); }
  render() {
    if(this.page!=='assets'||this.mediaLibrary?.fxScene)void this.mediaLibrary?.stopTokenPreview();
    if(!catalogPageAllowed(this.page,this.host.environment()))this.page='recipes';
    if (abilityProfileForPage(this.page)&&!this.dndCatalog) {
      const profile = abilityProfileForPage(this.page), matches = profile.catalog.filter(this[profile.filtersKey] ?? defaultAbilityFilters());
      if (!matches.some((feat) => feat.id === this[profile.selectedKey]))
        this[profile.selectedKey] = matches[0]?.id;
    }
    const openGroups = [
      ...this.root.querySelectorAll("details[data-options-group][open]"),
    ].map((e) => e.dataset.optionsGroup);
    this.stopEditorPreview();
    this.stageDrag = null;
    cancelAnimationFrame(this.motionFrame);
    this.thumbnails?.disconnect();
    const scrollKeys = {
      ".an-inspector": `${this.page}:${this.dndCatalog?.isCatalogPage()?this.dndCatalog.entry()?.id:this.page === "spells" ? this.selectedSpell : abilityProfileForPage(this.page) ? this[abilityProfileForPage(this.page).selectedKey] : this.selected}`,
      ".an-library": `${this.page}:${this.search}:${this.category}`,
      ".an-asset-list": `${this.page}:${JSON.stringify(this.mediaLibrary?.filters)}:${this.mediaLibrary?.page}`,
      ".an-media-detail-body": `${this.page}:${this.mediaLibrary?.selectedId}`,
      ".an-builder": this.page,
      ".an-spell-library": this.dndCatalog?.isCatalogPage()?`${this.page}:${JSON.stringify(this.dndCatalog.filters)}:${this.dndCatalog.pages[this.dndCatalog.kind]}`:`${this.page}:${JSON.stringify(this.spellFilters)}:${this.spellPage}`,
      ".an-feat-library": `${this.page}:${JSON.stringify(this[abilityProfileForPage(this.page)?.filtersKey])}:${this[abilityProfileForPage(this.page)?.pageKey]}`,
    };
    const scroll = Object.fromEntries(
      Object.entries(scrollKeys).map(([selector, key]) => [
        selector,
        this.renderedScrollKeys?.[selector] === key
          ? (this.root.querySelector(selector)?.scrollTop ?? 0)
          : 0,
      ]),
    );
    const active = document.activeElement;
    const focus =
      active &&
      this.root.contains(active) &&
      (active.dataset.field || active.dataset.search || active.dataset.builder)
        ? {
            field: active.dataset.field,
            builder: active.dataset.builder,
            search: active.dataset.search,
            index: active.dataset.index,
            track: active.dataset.track,
            start: active.selectionStart,
            end: active.selectionEnd,
          }
        : null;
    const recipe = this.recipe();
    const env = this.host.environment();
    patchDOM(
      this.root,
      `<div class="an-shell${this.isStudio() ? " is-studio" : ""}">
      <aside class="an-nav"><div class="an-brand"><span class="an-logo">A</span><div>Animater<small>MAKE EVERY ACTION FELT</small></div></div>
        <div class="an-nav-caption">WORKSPACE</div>
        ${[
          ["recipes", "✦", "Recipes"],
          ...catalogNavigation(env),
          ["assets", "▦", "Assets"],
          ["activity", "◷", "Activity"],
          ["setup", "⚙", "Setup"],
        ]
          .map(
            ([page, icon, name]) =>
              `<button class="an-nav-item ${this.page === page ? "is-active" : ""}" data-action="page" data-page="${page}"><span>${icon}</span>${name}${page === "recipes" ? `<small>${this.listedRecipes().length}</small>` : ""}</button>`,
          )
          .join("")}
        <div class="an-nav-bottom"><div class="an-pack"><span class="an-dot ${env.ready ? "is-ready" : ""}"></span><div>${esc(env.pack)}<small>${this.host.catalog().length.toLocaleString()} asset variants</small></div></div><button data-action="stop" class="an-stop">■ Stop my effects</button><small class="an-version">v0.2 · ${esc(env.system)}${env.demo ? " · PREVIEW" : ""}</small></div>
      </aside>
      <main class="an-main">${this.isStudio() ? "" : `<header class="an-header"><div><div class="an-eyebrow">${this.page === "recipes" ? "YOUR EFFECTS, YOUR STYLE" : "ANIMATER WORKSPACE"}</div><h1>${esc(catalogPageTitle(this.page,env))}</h1></div><div class="an-header-actions">${this.page === "recipes" ? `<button data-action="export" class="an-quiet">↗ Export</button><button data-action="import" class="an-quiet">↙ Import</button><button data-action="new" class="an-primary">+ New recipe</button>` : this.page === "builder" ? `<button data-action="cancel-builder">Back to recipes</button>` : ""}</div></header>`}
        <div role="status" aria-live="polite" class="an-toast ${this.message ? "is-visible" : ""}">${esc(this.message)}</div>
        ${env.demo ? `<div class="an-demo">DESIGN PREVIEW <span>Real installed JB2A videos. Canvas playback and game triggers require Foundry.</span></div>` : ""}
        ${!env.ready ? `<div class="an-warning">${esc(env.problem)} <button data-action="page" data-page="setup">Open setup →</button></div>` : ""}
        ${this.dndCatalog?.isCatalogPage()?this.dndCatalog.html():this.page === "builder" ? this.builderHTML() : this.page === "spells" ? spellCatalogHTML(this) : abilityProfileForPage(this.page) ? featCatalogHTML(this, abilityProfileForPage(this.page)) : this.page === "weapons" ? weaponCatalogHTML(this) : ["conditions", "effects"].includes(this.page) ? stateCatalogHTML(this) : this.page === "recipes" ? this.recipesHTML(recipe) : this.page === "assets" ? this.assetsHTML(recipe) : this.page === "activity" ? this.activityHTML() : this.setupHTML(env)}
      </main>${this.pendingImport !== null ? this.importHTML() : ""}</div>`,
    );
    this.root.querySelectorAll("details[data-options-group]").forEach((e) => {
      e.open = openGroups.includes(e.dataset.optionsGroup);
    });
    this.root.querySelectorAll("audio[data-cue-volume]").forEach((audio) => {
      audio.volume = Number(audio.dataset.cueVolume);
    });
    if (focus) {
      const el = [...this.root.querySelectorAll("input,select,textarea")].find(
        (e) =>
          focus.builder
            ? e.dataset.builder === focus.builder
            : focus.search
              ? e.dataset.search === focus.search
              : e.dataset.field === focus.field &&
                e.dataset.index === focus.index &&
                e.dataset.track === focus.track,
      );
      if (el) {
        el.focus({ preventScroll: true });
        if (
          typeof focus.start === "number" &&
          el.setSelectionRange &&
          !["number", "color", "checkbox"].includes(el.type)
        )
          el.setSelectionRange(focus.start, focus.end);
      }
    }
    if (this.previewMode === "stage") this.startMotionPreview(recipe);
    for (const [selector, top] of Object.entries(scroll)) {
      const element = this.root.querySelector(selector);
      if (element) element.scrollTop = top;
    }
    this.renderedScrollKeys = scrollKeys;
    if (this.busy)
      this.root
        .querySelectorAll(
          ".an-inspector input,.an-inspector textarea,.an-inspector select,.an-builder input,.an-builder-controls button",
        )
        .forEach((el) => {
          el.disabled = true;
        });
    this.observeThumbnails();
    if (this.isStudio()) studioAfterRender(this);
    if(this.page==='assets') { this.mediaLibrary?.syncPreview(); void this.mediaLibrary?.load(); }
  }
  observeThumbnails() {
    this.thumbnails?.disconnect();
    const videos = this.root.querySelectorAll(".an-asset-thumb video");
    if (videos.length) {
      this.thumbnails = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) {
              const video = entry.target;
              video.preload = "metadata";
              this.loadedThumbnails ??= new WeakSet();
              if(!this.loadedThumbnails.has(video)){video.load();this.loadedThumbnails.add(video);}
              this.thumbnails.unobserve(video);
            }
        },
        { root: this.root.querySelector(".an-asset-list") },
      );
      videos.forEach((v) => this.thumbnails.observe(v));
    }
  }
  stageLabel(stage) {
    if (stage.label) return stage.label;
    return stage.kind === "motion"
      ? `${stage.subject === "targets" ? "Target" : "Caster"} · ${{ lunge: "Lunge", recoil: "Recoil", shake: "Shake", spin: "Spin", levitate: "Rise", pulse: "Pulse", rush: "Rush", leap: "Leap", roll: "Roll", dodge: "Dodge" }[stage.motion] ?? "Motion"}`
      : KINDS[stage.kind];
  }
  updateInspector() {
    if (this.isStudio()) return this.render();
    const inspector = this.root.querySelector(".an-inspector");
    if (!inspector) return this.render();
    this.stopEditorPreview();
    cancelAnimationFrame(this.motionFrame);
    const top = inspector.scrollTop;
    const groups = [...inspector.querySelectorAll("details[open]")].map(
      (e) => e.dataset.optionsGroup,
    );
    patchDOM(inspector, this.inspectorHTML(this.recipe()));
    for (const details of inspector.querySelectorAll("details"))
      details.open = groups.includes(details.dataset.optionsGroup);
    inspector.scrollTop = top;
    if (this.previewMode === "stage") this.startMotionPreview(this.recipe());
  }
  inspectorWidth() {
    if (this.panelWidth === undefined) {
      let stored = NaN;
      try { stored = Number(globalThis.localStorage?.getItem("animater.inspectorWidth")); } catch {}
      this.panelWidth = Number.isFinite(stored) && stored >= 300 ? stored : 380;
    }
    return this.panelWidth;
  }
  setInspectorWidth(px, work) {
    const max = Math.max(320, (work?.getBoundingClientRect().width ?? 1200) - 260);
    this.panelWidth = Math.round(Math.min(max, Math.max(300, px)));
    work?.style.setProperty("--an-inspector-width", `${this.panelWidth}px`);
    try { globalThis.localStorage?.setItem("animater.inspectorWidth", String(this.panelWidth)); } catch {}
  }
  onSplitterPointer(e) {
    const handle = e.target.closest?.("[data-splitter]");
    if (!handle || e.button !== 0) return;
    e.preventDefault();
    const work = handle.closest(".an-work, .an-studio"), right = work.getBoundingClientRect().right;
    handle.setPointerCapture?.(e.pointerId);
    handle.classList.add("is-active");
    const move = ev => this.setInspectorWidth(right - ev.clientX, work);
    const up = () => { handle.classList.remove("is-active"); handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", up); handle.removeEventListener("pointercancel", up); };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  }
  timelineWhen(s, r) {
    if (s.startMode) {
      const ref = r.stages.find(o => o.stageId === s.afterStage);
      const name = ref ? this.stageLabel(ref) : "previous stage";
      return s.startMode === "with" ? `with ${name}` : `after ${name}${s.startOffset > 0 ? ` +${(s.startOffset / 1000).toFixed(2)}s` : ""}`;
    }
    return s.afterStage ? "linked" : `at ${(s.delay / 1000).toFixed(2)}s`;
  }
  timelineBarHTML(r, row, index, total) {
    const pct = ms => ((ms / total) * 100).toFixed(3);
    const i = row.index, s = r.stages[i], name = this.stageLabel(s), when = this.timelineWhen(s, r), length = ((row.end - row.start) / 1000).toFixed(2);
    return `<div class="an-tl-bar kind-${esc(s.kind)}${i === index ? " is-selected" : ""}" data-tl-bar="${i}" data-stage-drag="${i}" tabindex="0" role="slider" aria-label="${esc(name)}: start time" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${row.start}" aria-valuetext="${esc(when)}, ${length} seconds" title="${esc(name)} · ${esc(when)} · ${length}s" style="left:${pct(row.start)}%;width:${pct(row.end - row.start)}%"><span class="an-tl-bar-label">${esc(name)}</span><small class="an-tl-bar-when">${esc(when)}</small><span class="an-tl-resize" data-tl-resize="${i}" title="Drag to change length"></span></div>`;
  }
  timelineX(total, ms) { return `calc(var(--tl-label) + (100% - var(--tl-label)) * ${Math.max(0, Math.min(1, ms / total))})`; }
  onTimelinePointer(e) {
    const bar = e.target.closest?.("[data-tl-bar]");
    if (!bar || this.busy || e.button !== 0) return;
    e.preventDefault();
    const i = Number(bar.dataset.tlBar), resize = !!e.target.closest("[data-tl-resize]");
    const r = this.recipe(), tl = bar.closest(".an-tl"), total = Number(tl.dataset.tlTotal);
    const msPerPx = total / Math.max(1, bar.parentElement.getBoundingClientRect().width);
    const layout = timelineLayout(r), row = layout.rows[i];
    const others = layout.rows.filter(o => o.index !== i).map(o => ({ stageId: o.stageId, start: o.start, end: o.end, name: this.stageLabel(r.stages[o.index]) }));
    if (this.isStudio()) others.push({ stageId: "__playhead", start: this.studioTime ?? 0, end: this.studioTime ?? 0, name: "playhead" });
    const playheadSnap = (ms) => this.isStudio() && Math.abs(ms - (this.studioTime ?? 0)) <= 10 * msPerPx ? this.studioTime ?? 0 : null;
    const guide = tl.querySelector("[data-tl-guide]"), x0 = e.clientX;
    let result = null;
    bar.setPointerCapture?.(e.pointerId);
    bar.classList.add("is-moving");
    const show = (ms, text) => { guide.hidden = false; guide.style.left = this.timelineX(total, ms); guide.querySelector("span").textContent = text; };
    const move = ev => {
      const dms = (ev.clientX - x0) * msPerPx;
      if (Math.abs(ev.clientX - x0) < 3 && !result) return;
      if (resize) {
        const end = ev.altKey ? null : playheadSnap(row.end + dms);
        const duration = Math.max(100, end !== null && end > row.start ? end - row.start : Math.round((row.end - row.start + dms) / 50) * 50);
        bar.style.width = `${(duration / total) * 100}%`;
        result = { duration };
        show(row.start + duration, `${(duration / 1000).toFixed(2)}s long`);
        return;
      }
      let ms = Math.max(0, row.start + dms);
      let snap = ev.altKey ? null : snapStart(ms, others, 10 * msPerPx);
      ms = snap ? snap.at : Math.round(ms / 50) * 50;
      const onPlayhead = snap?.ref === "__playhead";
      if (onPlayhead) snap = null;
      bar.style.left = `${(ms / total) * 100}%`;
      result = { ms, snap };
      const ref = snap && others.find(o => o.stageId === snap.ref);
      show(ms, snap ? `${snap.mode === "with" ? "Starts with" : "Starts after"} ${ref.name}` : onPlayhead ? `Starts at playhead ${(ms / 1000).toFixed(2)}s` : `Starts at ${(ms / 1000).toFixed(2)}s`);
    };
    const up = ev => {
      bar.releasePointerCapture?.(ev.pointerId);
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
      guide.hidden = true;
      this.stageIndex = i;
      if (result && ev.type === "pointerup") this.applyTimelineEdit(i, result);
      else this.render();
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
  }
  applyTimelineEdit(i, result) {
    this.stopEditorPreview();
    const r = this.edit();
    if (!r) return;
    const s = r.stages[i], snapshot = clone(r.stages);
    if (result.duration) s.duration = result.duration;
    else if (result.snap) { s.startMode = result.snap.mode; s.startRef = result.snap.ref; s.startOffset = 0; }
    else { delete s.startMode; delete s.startRef; s.afterStage = ""; s.delay = Math.round(result.ms); }
    linkStartModes(r.stages);
    try { timedStages(r, 0); this.message = "Timeline updated. Save recipe to apply."; }
    catch { r.stages = snapshot; this.message = "Those stages would wait on each other. Choose a stage that starts earlier."; }
    this.render();
  }
  nudgeTimeline(bar, e) {
    if ((e.key === "Enter" || e.key === " ") && !this.busy) { e.preventDefault(); this.stageIndex = Number(bar.dataset.tlBar); this.render(); this.root.querySelector(`[data-tl-bar="${this.stageIndex}"]`)?.focus(); return true; }
    if (!["ArrowLeft", "ArrowRight"].includes(e.key) || this.busy) return false;
    e.preventDefault();
    const i = Number(bar.dataset.tlBar), row = timelineLayout(this.recipe()).rows[i];
    const step = (e.shiftKey ? 500 : 50) * (e.key === "ArrowLeft" ? -1 : 1);
    if (e.altKey) this.applyTimelineEdit(i, { duration: Math.max(100, row.end - row.start + step) });
    else this.applyTimelineEdit(i, { ms: Math.max(0, row.start + step) });
    this.root.querySelector(`[data-tl-bar="${i}"]`)?.focus();
    return true;
  }
  stageStartLabel(stage, recipe) {
    if (stage.startMode) {
      const ref = stage.startRef ? recipe.stages.findIndex(o => o.stageId === stage.startRef) + 1 : 0;
      const target = ref ? String(ref) : "↑";
      const gap = stage.startMode === "after" && stage.startOffset > 0 ? ` +${stage.startOffset}ms` : "";
      return `${stage.startMode} ${target}${gap}`;
    }
    if (!stage.afterStage) return `${stage.delay}ms`;
    const resolved = sampleRecipe(recipe).stages.find(
      (s) => s.stageId === stage.stageId,
    );
    return `↳ ${resolved.delay}ms`;
  }
  syncPreviewTokens({ clear = false } = {}) {
    if (this.busy || !["recipes", "builder", "spells", "feats", "actions", "features", "weapons", "items", "conditions", "effects"].includes(this.page))
      return;
    const scene = this.root.querySelector("[data-recipe-scene]");
    if (!scene) return;
    const tokens = clear ? {} : (this.host.previewTokens?.() ?? {});
    if (scene.dataset.previewTokens === JSON.stringify(tokens)) return;
    const recipe = this.recipe();
    if (!recipe) return;
    this.stopEditorPreview();
    patchDOM(scene.parentElement, this.recipePreviewHTML(recipe, tokens));
    const progress = this.root.querySelector("[data-recipe-progress]");
    if (progress) progress.value = 0;
    const time = this.root.querySelector("[data-preview-time]");
    if (time)
      time.textContent = `0.0 / ${(this.previewDuration(recipe) / 1000).toFixed(1)}s`;
    const status = this.root.querySelector("[data-preview-status]");
    if (status) status.textContent = "Ready · canvas tokens updated";
  }
  recipePreviewHTML(recipe, tokens = this.host.previewTokens?.() ?? {}) {
    recipe = previewRecipeSounds(recipe, this.host.soundCatalog?.());
    if (
      recipe.stages.every(
        (s) =>
          !["motion", "sprite", "sound"].includes(s.kind) && !OPTIONAL_FX_KINDS.has(s.kind) && !s.assets.length,
      )
    )
      return `<div class="an-preview-empty" data-recipe-scene data-preview-tokens="${esc(JSON.stringify(tokens))}" data-preview-grid-distance="${Number(tokens.gridDistance) || 5}" aria-label="Unconfigured recipe preview">◇<small>Choose an asset or token motion to begin</small></div>`;
    const chain = chainPreview(recipe, tokens);
    if (chain) return this.chainPreviewHTML(chain, tokens);
    const filterPrefix = `an-tint-${crypto.randomUUID()}`;
    const tokenHTML = (subject, fallback, icon) => {
      const token = tokens[subject];
      return this.previewActorHTML({ subject, token, name: fallback, icon });
    };
    const catalog = this.host.catalog();
    return `<div class="an-recipe-scene ${recipe.lifecycle === "document" ? "is-state-preview" : ""}" data-recipe-scene data-preview-tokens="${esc(JSON.stringify(tokens))}" data-preview-grid-distance="${Number(tokens.gridDistance) || 5}" aria-label="Full recipe composition preview">${recipe.stages
      .map((s, index) => {
        s = { ...s, ...normalizeOptions(s) };
        const filterId = `${filterPrefix}-${index}`;
        const rgb = [1, 3, 5].map(
          (offset) => parseInt(s.tint.slice(offset, offset + 2), 16) / 255,
        );
        const tintFilter = s.tintEnabled
          ? `<svg class="an-tint-filter" aria-hidden="true"><defs><filter id="${filterId}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${rgb[0]} 0 0 0 0 0 ${rgb[1]} 0 0 0 0 0 ${rgb[2]} 0 0 0 0 0 1 0"/></filter></defs></svg>`
          : "";
        if (s.kind === "motion") return "";
        if(OPTIONAL_FX_KINDS.has(s.kind))return this.optionalFxPreviewHTML(s, s.index ?? index);
        if (s.kind === "sound")
          return s.skipSound
            ? ""
            : `<audio preload="auto" src="${esc(this.host.mediaURL?.(s.soundFile) ?? s.soundFile)}" data-preview-stage="${index}"></audio>`;
        const key = resolveAsset(s, catalog);
        const media = mediaForReference(catalog, key);
        const file = media?.file;
        const placement =
          s.kind === "travel"
            ? "travel"
            : s.kind === "impact" ||
                s.kind === "template" ||
                s.subject === "targets"
              ? "targets"
              : s.kind === "overlay"
                ? "overlay"
                : "source";
        if (s.kind === "sprite") {
          const token = tokens[s.subject ?? "source"];
          return Array.from(
            { length: s.copies ?? 1 },
            (_, copy) =>
              `<div hidden class="an-recipe-layer an-copy-layer is-${placement}" data-layer-stage="${index}" data-copy="${copy}" data-tint-filter="${filterId}">${copy === 0 ? tintFilter : ""}<div class="an-copy-art">${token?.img ? `<img src="${esc(token.img)}" alt="Token copy">` : "✦"}</div></div>`,
          ).join("");
        }
        return `<div hidden class="an-recipe-layer is-${placement} ${file ? "" : "is-unavailable"}" data-layer-stage="${index}" data-tint-filter="${filterId}" data-preview-template="${esc(JSON.stringify(media?.template ?? null))}" data-media-width="${media?.width ?? 0}" data-media-height="${media?.height ?? 0}" style="--stage-scale:${s.kind === "travel" ? 1 : s.scale};opacity:${s.opacity};z-index:${s.below ? 1 : 3}" ${file ? "" : 'aria-label="Missing asset"'}>${tintFilter}${file ? this.visualMediaHTML(file,`data-preview-stage="${index}" aria-label="Stage ${index + 1}: ${esc(this.stageLabel(s))}"`) : "Missing asset"}</div>`;
      })
      .join(
        "",
      )}${tokenHTML("source", recipe.lifecycle === "document" ? "Affected token" : "Caster", "✦")}${recipe.lifecycle === "document" ? "" : tokenHTML("targets", "Target", "◇")}<span class="an-preview-label">${recipe.lifecycle === "document" ? "SUSTAINED LOOP · SAMPLE" : "FULL RECIPE · COMPOSITION"}</span><span class="an-preview-idle" data-preview-idle>${recipe.lifecycle === "document" ? "Preview on affected token" : "Play every stage together"}</span></div>`;
  }
  previewDuration(recipe) {
    recipe = previewRecipeSounds(recipe, this.host.soundCatalog?.());
    return recipeDuration(
      chainPreview(recipe, this.host.previewTokens?.() ?? {})?.recipe ?? recipe,
    );
  }
  visualMediaHTML(file, attributes='') {
    const url=esc(this.host.mediaURL?.(file)??file);
    return mediaType(file)==='image'?`<img src="${url}" alt="Effect artwork" ${attributes}>`:`<video muted playsinline loop preload="auto" src="${url}" ${attributes}></video>`;
  }
  previewActorHTML({ subject, token, name, icon, x, y, id, targetIndex }) {
    const dimension = (value, fallback = 1) =>
      Number.isFinite(Number(value)) && Number(value) > 0
        ? Number(value)
        : fallback;
    const width = dimension(token?.width) * 55;
    const height = dimension(token?.height) * 55;
    const spriteWidth = dimension(token?.spriteWidth, width / 55) * 55;
    const spriteHeight = dimension(token?.spriteHeight, height / 55) * 55;
    const sx = token?.textureScaleX < 0 ? -1 : 1;
    const sy = token?.textureScaleY < 0 ? -1 : 1;
    const rotation = Number(token?.rotation) || 0;
    const top =
      y === undefined
        ? `calc(45% + 27px - ${height / 2}px)`
        : `calc(${y}% - ${height / 2}px)`;
    const style = `width:${width}px;margin-left:${-width / 2}px;top:${top}${x === undefined ? "" : `;left:${x}%`}`;
    const art = token?.img
      ? `<img src="${esc(token.img)}" alt="${esc(token.name ?? name)}" style="position:absolute;left:50%;top:50%;width:${spriteWidth}px;height:${spriteHeight}px;max-width:none;max-height:none;transform:translate(-50%,-50%) rotate(${rotation}deg) scale(${sx},${sy})">`
      : icon;
    return `<div class="an-recipe-actor is-${subject}" style="${style}"><div class="an-recipe-token" style="position:relative;width:${width}px;height:${height}px" data-preview-token="${subject}" ${id ? `data-preview-actor="${esc(id)}"` : ""} ${targetIndex === undefined ? "" : `data-target-index="${targetIndex}"`}><span class="an-preview-token-art">${art}</span></div><small>${esc(token?.name ?? name)}</small></div>`;
  }
  chainPreviewHTML(chain, tokens) {
    const catalog = this.host.catalog();
    const filterPrefix = `an-chain-${Math.random().toString(36).slice(2, 9)}`;
    const actors = chain.actors
      .map((a) =>
        this.previewActorHTML({
          ...a,
          icon: a.subject === "source" ? "✦" : "◇",
        }),
      )
      .join("");
    const layers = chain.recipe.playbackPlan
      .map((s, planIndex) => {
        s = { ...s, ...normalizeOptions(s) };
        if (s.kind === "motion") return "";
        if(OPTIONAL_FX_KINDS.has(s.kind))return this.optionalFxPreviewHTML(s, s.index);
        if (s.kind === "sound")
          return s.skipSound
            ? ""
            : `<audio preload="auto" src="${esc(this.host.mediaURL?.(s.soundFile) ?? s.soundFile)}" data-preview-stage="${s.index}" data-preview-plan="${planIndex}"></audio>`;
        const key = resolveAsset(s, catalog),
          media = mediaForReference(catalog,key),
          file = media?.file;
        const destination =
          chain.actors.find((a) => a.id === s.destination?.id) ??
          chain.actors[s.kind === "template" ? 1 : 0];
        const from = ["travel", "projectile"].includes(s.kind)
            ? s.origin.id
            : "source",
          to = ["travel", "projectile"].includes(s.kind)
            ? s.endpoint.id
            : destination.id;
        const filterId = `${filterPrefix}-${planIndex}`;
        const rgb = [1, 3, 5].map(
          (offset) => parseInt(s.tint.slice(offset, offset + 2), 16) / 255,
        );
        const tintFilter = s.tintEnabled
          ? `<svg class="an-tint-filter" aria-hidden="true"><defs><filter id="${filterId}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${rgb[0]} 0 0 0 0 0 ${rgb[1]} 0 0 0 0 0 ${rgb[2]} 0 0 0 0 0 1 0"/></filter></defs></svg>`
          : "";
        return `<div hidden class="an-recipe-layer ${s.kind === "travel" ? "is-travel" : ""} ${s.kind === "sprite" ? "an-copy-layer" : ""} ${file || s.kind === "sprite" ? "" : "is-unavailable"}" data-layer-stage="${s.index}" data-preview-plan="${planIndex}" data-target-index="${s.targetIndex}" data-preview-from="${from}" data-preview-to="${to}" data-copy="0" data-tint-filter="${filterId}" data-preview-template="${esc(JSON.stringify(media?.template ?? null))}" data-media-width="${media?.width ?? 0}" data-media-height="${media?.height ?? 0}" style="left:${destination.x}%;top:${destination.y}%">${tintFilter}${s.kind === "sprite" ? `<div class="an-copy-art">${destination.token?.img ? `<img src="${esc(destination.token.img)}" alt="Token copy">` : "✦"}</div>` : file ? this.visualMediaHTML(file,`data-preview-stage="${s.index}" data-preview-plan="${planIndex}" aria-label="Stage ${s.index + 1}: ${esc(s.label || this.stageLabel(s))}, target ${s.targetIndex + 1}"`) : "Missing asset"}</div>`;
      })
      .join("");
    return `<div class="an-recipe-scene an-chain-scene" data-recipe-scene data-chain-preview data-preview-width="${chain.width}" data-preview-height="${chain.height}" data-preview-tokens="${esc(JSON.stringify(tokens))}" data-preview-grid-distance="${Number(tokens.gridDistance) || 5}" aria-label="Full recipe composition preview">${layers}${actors}<span class="an-preview-label">FULL RECIPE · ${hasChain(chain.recipe) ? "CHAIN" : chain.recipe.previewArea?.type === "line" ? "LINE" : chain.recipe.previewArea?.type === "cone" ? "CONE" : chain.recipe.stages.some(isPathMotion) ? "MOTION" : "VOLLEY"}</span><span class="an-preview-idle" data-preview-idle>${esc(chain.note)}</span></div>`;
  }
  updatePlayback(frame) {
    if (this.isStudio()) studioFrame(this, frame);
    this.root.querySelectorAll("[data-stage-drag]").forEach((el) => {
      const state = frame.stages[Number(el.dataset.stageDrag)].state;
      el.classList.toggle("is-playing", state === "playing");
      el.classList.toggle("is-done", state === "done");
      el.dataset.playback = state;
      const button = el.querySelector('[data-action="stage"]');
      button?.setAttribute(
        "aria-label",
        `Stage ${Number(el.dataset.stageDrag) + 1}: ${this.stageLabel(this.recipe().stages[Number(el.dataset.stageDrag)])}, ${state}`,
      );
    });
    const progress = this.root.querySelector("[data-recipe-progress]");
    if (progress) {
      progress.max = frame.duration || 1;
      progress.value = frame.time;
    }
    const head = this.root.querySelector("[data-tl-playhead]"), tl = this.root.querySelector(".an-tl");
    if (head && tl) { head.hidden = false; head.style.left = this.timelineX(Number(tl.dataset.tlTotal), frame.time); }
    const time = this.root.querySelector("[data-preview-time]");
    if (time)
      time.textContent = `${(frame.time / 1000).toFixed(1)} / ${(frame.duration / 1000).toFixed(1)}s`;
    const active = frame.stages
      .filter((s) => s.state === "playing")
      .map((s) => s.index + 1);
    const signature = active.join(",");
    if (signature !== this.playingStages) {
      this.playingStages = signature;
      const timeline = this.root.querySelector(".an-timeline");
      const step = this.root.querySelector(
        `[data-stage-drag="${active.at(-1) - 1}"]`,
      );
      if (timeline && step) {
        const bounds = timeline.getBoundingClientRect();
        const rect = step.getBoundingClientRect();
        if (rect.right > bounds.right)
          timeline.scrollLeft += rect.right - bounds.right;
        else if (rect.left < bounds.left)
          timeline.scrollLeft -= bounds.left - rect.left;
      }
    }
    let label = this.isStudio() && !this.studioPlaying
      ? active.length
        ? `At playhead: stage${active.length > 1 ? "s" : ""} ${active.join(" + ")}`
        : "Nothing plays at the playhead"
      : frame.complete
      ? "Recipe complete"
      : active.length
        ? `Playing stage${active.length > 1 ? "s" : ""} ${active.join(" + ")}`
        : "Waiting for next stage";
    if (this.root.querySelector("[data-recipe-scene]")?.dataset.mediaError)
      label += " · media unavailable";
    if(this.root.querySelector('[data-recipe-scene]')?.dataset.fxError)label+=' · token filter preview unavailable; use Local preview';
    const status = this.root.querySelector("[data-preview-status]");
    if (status && status.textContent !== label) status.textContent = label;
    this.root.querySelectorAll("[data-layer-stage]").forEach((el) => {
      // Per-target layers belong to RecipePreview's native instance clock.
      if (el.dataset.previewPlan !== undefined) return;
      el.hidden =
        frame.stages[Number(el.dataset.layerStage)].state !== "playing";
    });
  }
  stopEditorPreview() {
    this.root.querySelectorAll("audio").forEach((audio) => audio.pause());
    this.previewSerial++;
    this.playingStages = "";
    this.previewRun?.stop();
    this.previewRun = null;
    const button = this.root.querySelector('[data-action="recipe-preview"]');
    if (button) button.textContent = "▶ Preview recipe";
    const idle = this.root.querySelector("[data-preview-idle]");
    if (idle) idle.hidden = false;
    this.root.querySelectorAll("[data-stage-drag]").forEach((el) => {
      el.classList.remove("is-playing", "is-done");
      delete el.dataset.playback;
      el.querySelector('[data-action="stage"]')?.removeAttribute("aria-label");
    });
    this.studioPlaying = false;
    const play = this.root.querySelector('[data-action="studio-play"]');
    if (play) { play.textContent = "▶"; play.classList.remove("is-active"); play.setAttribute("aria-label", "Play"); }
    const head = this.root.querySelector("[data-tl-playhead]");
    if (head && !this.isStudio()) head.hidden = true;
  }
  async playEditorPreview() {
    if (this.previewRun) {
      this.stopEditorPreview();
      const status = this.root.querySelector("[data-preview-status]");
      if (status) status.textContent = "Preview stopped";
      return;
    }
    const recipe = previewRecipeSounds(
      {
        ...validateRecipe(this.recipe()),
        previewDistance:
          this.page === "builder" ? (this.builder.previewDistance ?? 3) : 3,
      },
      this.host.soundCatalog?.(),
    );
    this.previewMode = "recipe";
    this.render();
    const serial = this.previewSerial;
    const button = this.root.querySelector('[data-action="recipe-preview"]');
    button.textContent = "■ Stop preview";
    this.root.querySelector("[data-preview-idle]").hidden = true;
    this.root.querySelector("[data-preview-status]").textContent =
      "Loading recipe assets…";
    const run = new RecipePreview(
      this.root.querySelector("[data-recipe-scene]"),
      recipe,
      (frame) => this.updatePlayback(frame),
      {tokenFx:this.host.createTokenFxPreview,sceneFx:this.host.createSceneFxPreview},
    );
    this.previewRun = run;
    const complete = await run.play();
    if (serial !== this.previewSerial) return;
    this.previewRun = null;
    run.stop();
    button.textContent = "↻ Replay recipe";
    if (!complete)
      this.root.querySelector("[data-preview-status]").textContent =
        "Preview stopped";
  }
  clearStageDrag() {
    this.stageDrag = null;
    this.root
      .querySelectorAll(".is-dragging,.is-drop-target")
      .forEach((el) => el.classList.remove("is-dragging", "is-drop-target"));
  }
  moveStage(from, to) {
    const current = this.recipe();
    if (from === to || from < 0 || to < 0 || to >= current.stages.length)
      return;
    const r = this.edit();
    r.stages = moveRow(r.stages, from, to);
    this.stageIndex = to;
    this.message =
      "Stage moved in the list. Timing is unchanged. Save recipe to apply.";
    this.clearStageDrag();
    this.render();
    this.root
      .querySelector(`[data-action="stage"][data-index="${to}"]`)
      ?.focus();
  }
  startMotionPreview(recipe) {
    const demo = this.root.querySelector("[data-motion-demo]");
    if (
      !demo ||
      !recipe ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const stage =
      recipe.stages[Math.min(this.stageIndex, recipe.stages.length - 1)];
    const target = this.root.querySelector(".an-demo-target");
    demo.style.transform = "";
    const a = demo.getBoundingClientRect(), b = target.getBoundingClientRect();
    const source = { center: { x: a.x + a.width / 2, y: a.y + a.height / 2 }, w: a.width, h: a.height };
    const foe = { center: { x: b.x + b.width / 2, y: b.y + b.height / 2 }, w: b.width, h: b.height };
    const direction = motionDirection(source, source, foe, stage.motion, 55);
    const previewStage = isPathMotion(stage) && stage.motionRange === "distance" ? { ...stage, distance: Math.min(stage.distance, 1.2) } : stage;
    const start = performance.now();
    const tick = (time) => {
      if (!demo.isConnected) return;
      const pose = motionPose(
        previewStage,
        ((time - start) % (stage.duration + 650)) / stage.duration,
        direction,
        isPathMotion(stage) ? 55 : 85,
      );
      demo.style.transform = poseTransform(pose);
      demo.style.opacity = pose.alpha ?? "";
      this.motionFrame = requestAnimationFrame(tick);
    };
    this.motionFrame = requestAnimationFrame(tick);
  }
  recipesHTML(recipe) {
    const all = this.listedRecipes();
    const categories = ["All", ...new Set(all.map((r) => r.category))];
    const filtered = all.filter(
      (r) =>
        (this.category === "All" || r.category === this.category) &&
        `${r.name} ${r.match} ${r.category}`
          .toLowerCase()
          .includes(this.search.toLowerCase()),
    );
    if (this.studio && recipe) return studioHTML(this, recipe);
    return `<div class="an-work is-library"><section class="an-library"><div class="an-search"><span>⌕</span><input aria-label="Search recipes" data-search="recipes" placeholder="Search spells, weapons, or recipes…" value="${esc(this.search)}"><kbd>/</kbd></div>
      <div class="an-chips" role="group" aria-label="Recipe categories">${categories.map((c) => `<button data-action="category" data-category="${esc(c)}" class="${c === this.category ? "is-active" : ""}">${esc(c)}</button>`).join("")}</div>
      <div class="an-section-title"><span>${filtered.length} recipe${filtered.length === 1 ? "" : "s"}</span><small>Open a recipe to edit it in the studio</small></div>
      <div class="an-grid">${
        filtered
          .map(
            (
              r,
            ) => `<button data-action="select" data-id="${esc(r.id)}" class="an-card ${r.id === this.selected ? "is-selected" : ""}" style="--effect:${esc(r.color)}" aria-pressed="${r.id === this.selected}">
        <div class="an-art"><div class="an-orbit"></div><span>${icons[r.category] ?? "◎"}</span><small>${esc(r.category)}</small></div><div class="an-card-body"><h2>${esc(r.name)}${this.dirty.has(r.id) ? " <sup>•</sup>" : ""}</h2><p>${esc(r.description)}</p><div class="an-card-meta"><span>${r.stages.length} stage${r.stages.length === 1 ? "" : "s"}</span><span>${r.enabled ? esc(EVENTS[r.trigger]) : "Disabled"}</span></div><div class="an-readiness ${this.status(r) !== "Ready to play" ? "is-missing" : ""}"><span>●</span> ${this.status(r)}</div></div></button>`,
          )
          .join("") ||
        `<div class="an-empty">No recipes found.<small>Try another search or create your own.</small></div>`
      }</div>
      <div class="an-tip"><span>✧</span><div><b>A little choreography goes a long way.</b><p>Start with a caster cue. Add travel. Finish with impact.</p></div></div></section>
      </div>`;
  }
  optionalFxPreviewHTML(stage,index) {
    if(stage.kind==='tokenfx')return '';
    return `<div hidden class="an-provider-cue" data-layer-stage="${index}"><b>${esc(KINDS[stage.kind])}</b><small>${esc(stage.fxPreset || stage.fxType || 'Choose effect')}</small><small>${stage.kind==='scenefx'?'Play at table · shared scene':'Local canvas preview · token filter'}</small></div>`;
  }
  optionalFxControlsHTML(stage,index) {
    const catalog=this.host.fxCatalog?.() ?? {presets:[],effects:[]};
    const attrs=field=>`data-field="${field}" data-index="${index}"`;
    if(stage.kind==='tokenfx') {
      const presets=catalog.presets.filter(p=>p.library===(stage.fxLibrary ?? 'tmfx-main'));
      return `<label>Preset library<select ${attrs('fxLibrary')}>${options({'tmfx-main':'Token presets','tmfx-region':'Region presets'},stage.fxLibrary ?? 'tmfx-main')}</select></label><label>Token Magic preset<select ${attrs('fxPreset')} ${catalog.tokenReady?'':'disabled'}>${options({'':'Choose preset',...Object.fromEntries(presets.map(p=>[p.name,p.name]))},stage.fxPreset ?? '')}</select></label><button data-action="browse-tokenfx">Browse token filters</button><label class="an-check"><input type="checkbox" ${attrs('fxTint')} ${stage.fxTint?'checked':''}>Override preset color</label><label>Filter color<input type="color" ${attrs('fxTint')} value="${esc(stage.fxTint||'#ffffff')}" ${stage.fxTint?'':'disabled'}></label><p class="an-hint">${catalog.tokenReady?stage.persist?'Filter stays until its native document ends.':'Temporary token filter. Removed when this stage ends.':'Enable Token Magic FX 0.8.4 or newer.'}</p>`;
    }
    const category=stage.fxCategory ?? 'particle';
    const effects=catalog.effects.filter(e=>e.category===category);
    const effect=effects.find(e=>e.type===stage.fxType);
    const fields=(effect?.fields ?? []).map(field=>{
      const value=stage.fxOptions?.[field.key] ?? field.value;
      const attr=`${attrs('fxOptions')} data-fx-option="${esc(field.key)}"`;
      if(field.type==='checkbox')return `<label class="an-check"><input type="checkbox" ${attr} ${value?'checked':''}>${esc(field.label)}</label>`;
      if(field.type==='color')return `<div><label>${esc(field.label)}<input type="color" ${attr} data-fx-color-part="value" value="${esc(value.value)}"></label><label class="an-check"><input type="checkbox" ${attr} data-fx-color-part="apply" ${value.apply?'checked':''}>Apply color</label></div>`;
      if(field.type==='select')return `<label>${esc(field.label)}<select ${attr}>${options(field.choices,value)}</select></label>`;
      return `<label>${esc(field.label)}<input type="number" ${attr} min="${field.min}" max="${field.max}" step="${field.step}" value="${esc(value)}"></label>`;
    }).join('');
    return `<label>FXMaster category<select ${attrs('fxCategory')}>${options({particle:'Scene particles',filter:'Scene filter'},category)}</select></label><label>FXMaster effect<select ${attrs('fxType')} ${catalog.sceneReady?'':'disabled'}>${options({'':'Choose effect',...Object.fromEntries(effects.map(e=>[e.type,e.label]))},stage.fxType ?? '')}</select></label><p class="an-hint">${catalog.sceneReady?'Whole scene · GM playback. Skipped in private preview.':'Enable FXMaster with Effects API support.'}</p>${fields?`<div class="an-options-grid">${fields}</div>`:''}`;
  }
  boundItemHTML(uuid) {
    const info = this.host.itemSummary?.(uuid);
    const name = info?.name ?? "Unavailable item";
    const meta = info ? [info.type && info.type[0].toUpperCase() + info.type.slice(1), info.source].filter(Boolean).join(" · ") : "Item not found";
    return `<div class="an-bound"><button type="button" class="an-bound-item" data-action="open-bound" title="Open ${esc(name)}\n${esc(uuid)}" ${info ? "" : "disabled"}><img src="${esc(info?.img || "icons/svg/item-bag.svg")}" alt=""><span><b>${esc(name)}</b><small>Bound · ${esc(meta)}</small></span></button><button type="button" class="an-bound-unbind" data-action="unbind" title="Unbind this item">Unbind</button></div>`;
  }
  monitorHTML(r) {
    const canvasUnavailable = Boolean(this.host.environment().demo);
    const linked = r.lifecycle === "document";
    const motionBlocked = this.motionBlocked(r);
    const unconfigured = this.status(r) === "Choose an asset";
    const index = Math.min(this.stageIndex, r.stages.length - 1);
    const s = r.stages[index];
    const audioPreview = previewRecipeSounds(r, this.host.soundCatalog?.())
      .stages[index];
    const key = resolveAsset(s, this.host.catalog());
    const file = mediaForReference(this.host.catalog(),key)?.file;
    const assetFree = ["motion", "sprite", "sound"].includes(s.kind) || OPTIONAL_FX_KINDS.has(s.kind);
    return `<div class="an-preview ${this.previewMode === "recipe" ? "an-full-preview" : ""}" style="--effect:${esc(r.color)}">${this.previewMode === "recipe" ? this.recipePreviewHTML(r) : `${OPTIONAL_FX_KINDS.has(s.kind) ? `<div class="an-preview-empty"><b>${esc(KINDS[s.kind])}</b><small>${s.kind==='scenefx'?'Play at table · shared scene':'Local canvas preview · token filter'}</small></div>` : s.kind === "motion" ? `<div class="an-motion-scene" aria-label="Token motion schematic preview"><div class="an-demo-token" data-motion-demo>✦</div><div class="an-demo-target">◇</div><small>Token motion · schematic</small></div>` : s.kind === "sound" ? (audioPreview.skipSound ? `<div class="an-preview-empty"><small>Optional sound pack unavailable. Visual stages still play.</small></div>` : `<audio controls src="${esc(this.host.mediaURL?.(audioPreview.soundFile) ?? audioPreview.soundFile)}" aria-label="Selected sound preview" data-cue-volume="${audioPreview.volume}"></audio>`) : s.kind === "sprite" ? `<div class="an-preview-empty">✦<small>Token copies appear in Full recipe preview</small></div>` : file ? this.visualMediaHTML(file,'controls autoplay aria-label="Selected stage asset preview"') : `<div class="an-preview-empty">◇<small>Choose an installed asset</small></div>`}<span class="an-preview-label">STAGE ${index + 1} · ${s.kind === "motion" ? "TOKEN MOTION" : "ASSET PREVIEW"}</span>`}</div>`;
  }
  motionSyncNoticeHTML() { return motionSyncNoticeHTML(this.host.environment()); }
  recipeSettingsHTML(r) {
    const linked = r.lifecycle === "document";
    return `<div class="an-editor-section an-binding"><div class="an-section-title"><b>When it plays</b><label class="an-check"><input type="checkbox" data-field="enabled" ${r.enabled ? "checked" : ""}>Enabled</label></div><label>Description<textarea aria-label="Description" data-field="description" rows="2" class="an-description">${esc(r.description)}</textarea></label><label>Trigger<select data-field="trigger">${options(linked ? {effect: "Native document active"} : EVENTS, r.trigger)}</select></label><label>Item names / slugs<input data-field="match" placeholder="fire bolt, ignition" value="${esc(r.match)}"></label><p class="an-hint">Exact matches. Commas separate alternatives. Drop an item here to bind only that item.</p>${r.itemUuid ? this.boundItemHTML(r.itemUuid) : ""}
      ${r.weaponMode || r.category === "Weapons" ? `<label>PF2e weapon use<select data-field="weaponMode">${options({ "": "Any usage", melee: "Melee Strike", ranged: "Ranged Strike", thrown: "Thrown Strike" }, r.weaponMode ?? "")}</select></label><p class="an-hint">PF2e's rolled usage selects this customization. Other uses keep their own animation.</p>` : ""}<div class="an-field-row"><label>Category<input data-field="category" value="${esc(r.category)}"></label><label>Accent<input type="color" aria-label="Recipe accent color" data-field="color" value="${esc(r.color)}"></label></div></div>`;
  }
  inspectorHTML(r) {
    const canvasUnavailable = Boolean(this.host.environment().demo);
    const linked = r.lifecycle === "document";
    const motionBlocked = this.motionBlocked(r);
    const unconfigured = this.status(r) === "Choose an asset";
    const index = Math.min(this.stageIndex, r.stages.length - 1);
    const s = r.stages[index];
    const audioPreview = previewRecipeSounds(r, this.host.soundCatalog?.())
      .stages[index];
    const key = resolveAsset(s, this.host.catalog());
    const file = mediaForReference(this.host.catalog(),key)?.file;
    const assetFree = ["motion", "sprite", "sound"].includes(s.kind) || OPTIONAL_FX_KINDS.has(s.kind);
    return `<div class="an-inspector-head"><span class="an-eyebrow">STAGE ${index + 1} OF ${r.stages.length}</span><span class="an-st-kind kind-${esc(s.kind)}">${esc(KINDS[s.kind])}</span></div>
      <div class="an-editor-section an-stage-fields">
        <label>Stage name<input data-field="label" data-index="${index}" value="${esc(s.label ?? "")}" placeholder="${esc(KINDS[s.kind])}"></label>${this.stageVariantHTML(s, index, linked)}
        ${OPTIONAL_FX_KINDS.has(s.kind) ? this.optionalFxControlsHTML(s,index) : s.kind === "motion" ? this.motionControlsHTML(s, index) : s.kind === "sound" ? `<label>Audio file<input data-field="soundFile" data-index="${index}" placeholder="sounds/spell.ogg" value="${esc(s.soundFile)}"></label>${this.host.soundCatalog || this.host.pickMedia ? `<button data-action="browse-sound">Browse sounds</button>` : ""}${this.soundVolumeHTML(s, index, audioPreview)}<p class="an-hint">Relative Foundry audio path. Sound plays with recipe; Stop ends it too.</p>` : s.kind === "sprite" ? `<p class="an-hint">Copies token artwork into Sequencer. Configure copies, shadows and tracks below.</p>` : `<label>Visual asset<button class="an-asset-picker" data-action="browse">${esc(key ?? s.assets[0] ?? "Choose an asset")}<span>Browse ↗</span></button></label>${key && key !== s.assets[0] ? `<p class="an-hint">Using installed fallback variant. Choose another in Assets anytime.</p>` : ""}`}
        ${["sprite", "aura", "tokenfx"].includes(s.kind) ? `<label>Subject<select data-field="subject" data-index="${index}">${options(linked ? {source: "Affected token"} : { source: "Caster token", targets: "Target tokens" }, s.subject ?? "source")}</select></label>` : ""}
        ${r.stages.length > 1 && !linked ? `<div class="an-field-row an-start-row"><label>Start<select data-field="startMode" data-index="${index}">${options({ with: "With", after: "After", time: "At a set time", ...(s.afterStage && !s.startMode ? { link: "Linked (custom)" } : {}) }, s.startMode ?? (s.afterStage ? "link" : "time"))}</select></label>${s.startMode ? `<label>Stage<select data-field="startRef" data-index="${index}">${options(Object.fromEntries(r.stages.filter((o, j) => j !== index).map(o => [o.stageId, this.stageLabel(o)])), s.startRef ?? s.afterStage)}</select></label>` : ""}${s.startMode === "after" ? `<label>Gap (ms)<input type="number" min="0" max="30000" step="50" data-field="startOffset" data-index="${index}" value="${s.startOffset ?? 0}"></label>` : ""}</div>` : ""}
        <div class="an-field-row"><label>${s.afterStage ? "Linked start (sample ms)" : "Start (ms)"}<input type="number" min="0" max="30000" step="50" data-field="delay" data-index="${index}" value="${s.afterStage ? sampleRecipe(r).stages[index].delay : s.delay}" ${s.afterStage ? "disabled" : ""}></label><label>${linked ? "Preview sample (ms)" : s.kind === "projectile" || isPathMotion(s) && s.motionRange === "target" ? "Base duration (ms)" : "Duration (ms)"}<input type="number" min="100" max="30000" step="100" data-field="duration" data-index="${index}" value="${s.duration}"></label>${["motion", "sound"].includes(s.kind) || OPTIONAL_FX_KINDS.has(s.kind) ? "" : `<label>Scale<input type="number" min="0.1" max="5" step="0.1" data-field="scale" data-index="${index}" value="${s.scale}"></label>`}</div>
        ${this.compositionHTML(r, s, index)}
        ${this.stageOptionsHTML(s, index, linked)}
        <details class="an-advanced" data-options-group="basic"><summary>Asset & visibility</summary>${assetFree ? "" : `<label>Fallback keys (comma separated)<textarea rows="2" data-field="assets" data-index="${index}">${esc(s.assets.join(","))}</textarea></label>`}${["motion", "sound"].includes(s.kind) || OPTIONAL_FX_KINDS.has(s.kind) ? "" : `<label>Opacity<input type="number" min="0.1" max="1" step="0.1" data-field="opacity" data-index="${index}" value="${s.opacity}"></label><label class="an-check"><input type="checkbox" data-field="below" data-index="${index}" ${s.below ? "checked" : ""}> Below tokens</label>`}${(s.kind === "aura" || linked && s.kind === "tokenfx") ? `<label class="an-check"><input type="checkbox" data-field="persist" data-index="${index}" ${s.persist ? "checked" : ""}> ${linked ? "Keep this layer while document active" : "Persist until stopped"}</label>` : ""}<button data-action="remove-stage" ${r.stages.length === 1 || this.busy ? "disabled" : ""}>Remove stage</button></details></div>
`;
  }
  builderHTML() {
    const r = {
        ...orbRecipe(this.builder, "orb-preview", this.host.catalog()),
        previewDistance: this.builder.previewDistance ?? 3,
      },
      timed = sampleRecipe(r);
    const config = this.builder;
    const field = (key, title, value, min, max, step = 50) =>
      `<label>${title}<input type="number" data-builder="${key}" value="${config[key] ?? value}" min="${min}" max="${max}" step="${step}"></label>`;
    return `<section class="an-builder"><div class="an-builder-showcase"><span class="an-eyebrow">CINEMATIC STARTER</span><h2>Chromatic orb</h2><p>Charge → release → layered flight → elemental impact.</p><div class="an-preview an-full-preview" style="--effect:${r.color}">${this.recipePreviewHTML(r)}</div><div class="an-preview-transport"><button class="an-primary" data-action="recipe-preview">▶ Preview recipe</button><span data-preview-time>0.0 / ${(recipeDuration(r) / 1000).toFixed(1)}s</span></div><progress data-recipe-progress aria-label="Recipe playback progress" max="${recipeDuration(r)}" value="0"></progress><small data-preview-status role="status" class="an-preview-status">Ready · sample distance: ${config.previewDistance ?? 3} squares</small><div class="an-builder-layers">${r.stages.map((s, i) => `<div class="an-stage" data-stage-drag="${i}"><span class="an-layer-number">${i + 1}</span><div><b>${esc(s.label)}</b><small>${s.kind === "projectile" ? "Moves with orb" : s.afterStage ? "100ms before orb finishes" : `${timed.stages[i].delay}ms · ${s.kind === "cast" ? "Caster" : "Target"}`}</small></div></div>`).join("")}</div><p class="an-hint">Six editable layers. Free and Patreon assets resolve automatically. Final burst uses JB2A artwork; sample preview centers the landing point.</p></div><div class="an-builder-controls"><span class="an-eyebrow">MAKE IT YOURS</span><h3>Choose its element</h3><div class="an-element-grid" role="group" aria-label="Orb element">${Object.entries(
      ORB_ELEMENTS,
    )
      .map(
        ([key, name]) =>
          `<button data-action="orb-element" data-element="${key}" aria-pressed="${(config.element ?? "fire") === key}" class="${(config.element ?? "fire") === key ? "is-active" : ""}">${name}</button>`,
      )
      .join(
        "",
      )}</div><p class="an-hint">Updates shell color, hue, release flash and impact together.</p><label>Recipe name<input data-builder="name" value="${esc(config.name ?? r.name)}"></label><div class="an-options-grid">${field("charge", "Charge up (ms)", 1500, 500, 5000)}${field("pause", "Pause before flight (ms)", 500, 0, 4000)}${field("flight", "Base flight duration (ms)", 800, 600, 5000)}${field("perSquare", "Extra flight time / square (ms)", 100, 0, 1000)}${field("scatter", "Landing scatter (squares)", 0.25, 0, 1, 0.05)}${field("previewDistance", "Sample distance for timing (squares)", 3, 1, 20, 1)}</div><p class="an-hint">Flight = base + distance × extra time. Both orb layers share one landing point per target; impact follows that target’s arrival. Launch pause is capped below base duration.</p><div class="an-builder-summary"><b>${this.status(r)}</b><span>Manual trigger · safe to customize before automation</span></div><button data-action="preview" ${this.host.environment().demo || this.busy ? "disabled" : ""}>▷ Local canvas preview</button><button data-action="create-orb" class="an-primary" ${this.status(r) !== "Ready to play" ? "disabled" : ""}>Create editable recipe</button><button data-action="new-basic" class="an-quiet">Start a blank recipe instead</button></div></section>`;
  }
  motionControlsHTML(s, index) {
    const path = isPathMotion(s), target = path && s.motionRange !== "distance" && s.motion !== "dodge";
    const toward = (s.motionHeading ?? "toward") === "toward";
    const field = (key, label, value, min, max, step = 1) => `<label>${label}<input type="number" min="${min}" max="${max}" step="${step}" data-field="${key}" data-index="${index}" value="${s[key] ?? value}"></label>`;
    const select = (key, label, values, value) => `<label>${label}<select data-field="${key}" data-index="${index}">${options(values, s[key] ?? value)}</select></label>`;
    return `${select("motion", "Motion", MOTIONS, "lunge")}${select("subject", "Animate", { source: "Caster token", targets: "Target tokens" }, "source")}
      ${path && s.motion !== "dodge" ? select("motionRange", "Path", { target: toward ? s.subject === "targets" ? "Approach caster" : "Approach selected target" : "Use token separation for distance", distance: "Fixed-distance gesture" }, "target") : ""}
      ${path ? select("motionHeading", "Path heading", { toward: "Toward selected token", away: "Away from selected token", up: "Upward on map", down: "Downward on map", left: "Leftward on map", right: "Rightward on map" }, "toward") : ""}
      ${target && s.subject !== "targets" ? select("targetSelection", "Approach which target", { first: "First selected target", second: "Second selected target", last: "Last selected target" }, "first") : ""}
      ${s.subject === "targets" ? select("targetSelection", "Animate which targets", { all: "All selected targets", first: "First selected target", second: "Second selected target", last: "Last selected target" }, "all") : ""}
      ${target && toward ? select("motionEndpoint", "Finish beside", { near: "Near side of target", past: "Far side — pass through" }, "near") : ""}
      <div class="an-field-row">${field("distance", target ? "Maximum path (squares)" : "Distance (grid squares)", path ? 8 : .35, .05, path ? 20 : 2, .05)}${field("intensity", "Flourish intensity", 1, .1, 3, .1)}</div>
      ${path ? `<details class="an-advanced an-options" data-options-group="motion-path"><summary>Path &amp; pacing</summary><div class="an-options-grid">${field("motionArrival", "Reach destination (% of duration)", 45, 15, 70)}${field("motionHold", "Hold at destination (%)", 25, 5, 90 - (s.motionArrival ?? 45))}${target ? field("perSquare", "Extra duration / square (ms)", 0, 0, 2000, 50) + field("stopGap", "Gap beside target (squares)", .1, 0, 2, .05) : ""}${s.motion === "leap" ? field("jumpHeight", "Arc height (squares)", .8, 0, 3, .05) + field("arrivalLift", "Height at Strike (squares)", 0, 0, 2, .05) : ""}</div>${["roll", "dodge"].includes(s.motion) ? select("motionSide", s.motion === "dodge" ? "Dodge direction" : "Roll direction", { 1: "Right / clockwise", "-1": "Left / counterclockwise" }, 1) : ""}<p class="an-hint">Approach → hold → return. Link a Strike or cue to “Destination reached” to keep contact synchronized. Total includes distance pacing; remaining time restores the pose.</p></details>` : ""}
      <p class="an-hint">Moves token artwork, then restores its pose. Game position and rotation stay unchanged.</p>`;
  }
  compositionHTML(recipe, stage, index) {
    const refs = Object.fromEntries(
      recipe.stages
        .filter((s) => s.stageId !== stage.stageId)
        .map((s, i) => [s.stageId, s.label || KINDS[s.kind]]),
    );
    return `<details class="an-advanced an-options" data-options-group="composition"><summary>Linked timing & flight ${stage.afterStage || stage.kind === "projectile" ? "· configured" : ""}</summary><label>Start relative to<select data-field="afterStage" data-index="${index}">${options({ "": "Absolute start time", ...refs }, stage.afterStage ?? "")}</select></label>${stage.afterStage ? `<label>Anchor<select data-field="timingAnchor" data-index="${index}">${options({ start: "Stage starts", ...(isPathMotion(recipe.stages.find(s => s.stageId === stage.afterStage)) ? { arrival: "Destination reached" } : {}), end: "Stage finishes" }, stage.timingAnchor ?? "end")}</select></label><label>Offset from stage ${stage.timingAnchor === "start" ? "start" : stage.timingAnchor === "arrival" ? "arrival" : "end"} (ms)<input type="number" data-field="startOffset" data-index="${index}" min="-30000" max="30000" step="50" value="${stage.startOffset}"></label><p class="an-hint">Offset adjusts chosen anchor. Link survives reordering; absolute Start is ignored.</p>` : ""}${stage.kind === "projectile" ? `<div class="an-options-grid"><label>Extra duration / square (ms)<input type="number" min="0" max="2000" data-field="perSquare" data-index="${index}" value="${stage.perSquare ?? 0}"></label><label>Launch pause (ms)<input type="number" min="0" max="10000" data-field="moveDelay" data-index="${index}" value="${stage.moveDelay ?? 0}"></label><label>Flight easing<select data-field="moveEase" data-index="${index}">${options(EASES, stage.moveEase ?? "linear")}</select></label></div><p class="an-hint">Moves the artwork along its travel path. Duration adds actual grid distance.</p>` : ""}${["projectile", "impact"].includes(stage.kind) ? `<label>Shared landing group<input data-field="landingGroup" data-index="${index}" value="${esc(stage.landingGroup ?? "")}" placeholder="e.g. orb-hit"></label><label>Landing scatter (squares)<input type="number" min="0" max="2" step="0.05" data-field="scatter" data-index="${index}" value="${stage.scatter ?? 0}"></label><p class="an-hint">Matching groups share one point. First layer’s scatter controls the group.</p>` : ""}</details>`;
  }
  // The track decides what a stage is; only same-track variants are offered.
  stageVariantHTML(s, index, linked) {
    const pool = linked ? { aura: "Sustained attached layer", tokenfx: "Token Magic FX" } : KINDS;
    const track = trackOf(s);
    const variants = Object.fromEntries(Object.entries(pool).filter(([kind]) => trackOf({ ...s, kind }) === track));
    if (Object.keys(variants).length < 2) return "";
    return `<label>Type<select data-field="kind" data-index="${index}">${options(variants, s.kind)}</select></label>`;
  }
  soundVolumeHTML(s, index, audioPreview) {
    const volume = Math.min(1, Math.max(0, Number(s.volume ?? 0.5)));
    const listen = s.soundFile && !audioPreview?.skipSound ? `<audio class="an-sound-listen" controls preload="none" src="${esc(this.host.mediaURL?.(audioPreview.soundFile) ?? audioPreview.soundFile)}" aria-label="Listen to this sound" data-cue-volume="${volume}"></audio>` : "";
    return `<label class="an-volume-field">Volume <span data-volume-readout>${Math.round(volume * 100)}%</span><input type="range" min="0" max="1" step="0.05" data-field="volume" data-index="${index}" value="${volume}" aria-label="Sound volume"></label>${listen}`;
  }
  stageOptionsHTML(stage, index, linked = false) {
    if(OPTIONAL_FX_KINDS.has(stage.kind))return '';
    // Sound path can remain blank while drafting; validation occurs on save/play.
    const s = {
      ...stage,
      ...normalizeOptions({
        ...stage,
        kind: stage.kind === "sound" ? "cast" : stage.kind,
      }),
    };
    const input = ([key, label, fallback, min, max, step], track) => {
      const value = track === undefined ? s[key] : s.tracks[track][key];
      const attrs = `data-field="${key}" data-index="${index}" ${track === undefined ? "" : `data-track="${track}"`}`;
      if (typeof fallback === "boolean")
        return `<label class="an-check"><input type="checkbox" ${attrs} ${value ? "checked" : ""}>${esc(label)}</label>`;
      return `<label>${esc(label)}${min && typeof min === "object" ? `<select ${attrs}>${options(min, value)}</select>` : `<input ${attrs} type="${typeof fallback === "number" ? "number" : "color"}" ${typeof fallback === "number" ? `min="${min}" max="${max}" step="${step ?? 1}"` : ""} value="${esc(value)}">`}</label>`;
    };
    let html = ["travel", "projectile"].includes(stage.kind)
      ? `<label>Travel path<select data-field="travelOrigin" data-index="${index}">${options(stage.kind === "projectile" ? { source: "Caster → each target", target: "Target → caster (return)" } : { source: "Caster → each target", previousTarget: "Chain through targets", firstTarget: "First target → selected endpoints", target: "Target → caster (return)" }, stage.travelOrigin ?? "source")}</select></label><p class="an-hint">Chains follow targeting order. Return paths end at caster; projectile returns ignore landing scatter.</p>`
      : "";
    if (["travel", "projectile"].includes(stage.kind))
      html += `<label>Flight destination<select data-field="travelDestination" data-index="${index}">${options({ targets: "Selected creatures", area: "Selected area center" }, stage.travelDestination ?? "targets")}</select></label>`;
    if (["travel", "projectile"].includes(stage.kind) && stage.travelDestination === "area")
      html += `<label>Area flight layout<select data-field="areaLayout" data-index="${index}">${options({ fit: "One flight to area center", fan: "Spread through cone" }, s.areaLayout)}</select></label>${s.areaLayout === "fan" ? `<label>Flights in fan<input type="number" min="3" max="9" step="1" data-field="fanCount" data-index="${index}" value="${s.fanCount}"></label><p class="an-hint">Starts at the placed cone vertex. Flights spread inside its direction and reach; creature hits remain rules.</p>` : ""}`;
    for (const [group, fields] of Object.entries(OPTION_GROUPS)) {
      if (
        (group === "Token copies" && s.kind !== "sprite") ||
        group === "Sound"
      )
        continue;
      if (group === "Media playback" && s.kind === "sprite") continue;
      if (
        ["motion", "sound"].includes(s.kind) &&
        ![
          "Timing & repetition",
          "Sound",
          ...(s.kind === "sound" ? ["Entrance & exit", "Media playback"] : []),
        ].includes(group)
      )
        continue;
      const visible = fields.filter(
        ([key]) =>
          !(linked && ["repeats", "repeatGap", "repeatMode", "stagger", "oneShot", "targetPick", "attach", "bindAlpha"].includes(key)) &&
          !(key === "areaLayout" && s.kind !== "template") &&
          !(
            key === "playbackRate" &&
            ["motion", "sound", "sprite"].includes(s.kind)
          ) &&
          !(
            s.kind === "sound" &&
            ![
              "repeats",
              "repeatGap",
              "ease",
              "fadeIn",
              "fadeOut",
              "volume",
              "clipStart",
              "clipEnd",
            ].includes(key)
          ) &&
          !(key === "overlayFit" && s.kind !== "overlay") &&
          !(
            ["travel", "projectile", "template", "overlay"].includes(s.kind) &&
            ["attach", "bindRotation", "bindAlpha", "maskToken"].includes(key)
          ),
      );
      if (!visible.length) continue;
      html += `<details class="an-advanced an-options" data-options-group="${esc(group)}"><summary>${esc(group)}</summary><div class="an-options-grid">${visible.map((f) => input(f)).join("")}</div></details>`;
    }
    if (!["motion", "sound"].includes(s.kind))
      html += `<details class="an-advanced an-options" data-options-group="tracks"><summary>Property tracks <small>${s.tracks.length}/6</small></summary><p class="an-hint">Animate artwork position, rotation, size or opacity. Tracks stay inside this stage. Positions use grid squares.</p>${s.tracks
        .map(
          (t, i) =>
            `<div class="an-track"><div class="an-section-title"><b>Track ${i + 1}</b><button data-action="remove-track" data-track="${i}" aria-label="Remove track ${i + 1}">Remove</button></div><div class="an-options-grid">${[
              ["property", "Property", "position.x", TRACK_PROPERTIES],
              [
                "from",
                "From",
                0,
                t.property === "alpha"
                  ? 0
                  : t.property.startsWith("scale")
                    ? 0.01
                    : t.property.startsWith("position") ||
                        ["width", "height"].includes(t.property)
                      ? -10
                      : -720,
                t.property === "alpha"
                  ? 1
                  : t.property.startsWith("scale")
                    ? 5
                    : t.property.startsWith("position") ||
                        ["width", "height"].includes(t.property)
                      ? 10
                      : 720,
                0.1,
              ],
              [
                "to",
                "To",
                1,
                t.property === "alpha"
                  ? 0
                  : t.property.startsWith("scale")
                    ? 0.01
                    : t.property.startsWith("position") ||
                        ["width", "height"].includes(t.property)
                      ? -10
                      : -720,
                t.property === "alpha"
                  ? 1
                  : t.property.startsWith("scale")
                    ? 5
                    : t.property.startsWith("position") ||
                        ["width", "height"].includes(t.property)
                      ? 10
                      : 720,
                0.1,
              ],
              ["duration", "Track duration (ms)", 1000, 100, s.duration, 50],
              [
                "delay",
                t.fromEnd
                  ? "End offset (ms; negative = earlier)"
                  : "Track delay (ms)",
                0,
                t.fromEnd ? -s.duration : 0,
                t.fromEnd ? 0 : s.duration,
                50,
              ],
              ["ease", "Track easing", "linear", EASES],
              ["loop", "Loop track", false],
              ["pingPong", "Ping-pong loop", false],
              ...(t.loop ? [] : [["fromEnd", "Time from stage end", false]]),
            ]
              .map((f) => input(f, i))
              .join("")}</div></div>`,
        )
        .join(
          "",
        )}<button data-action="add-track" ${s.tracks.length >= 6 ? "disabled" : ""}>+ Property track</button></details>`;
    return html;
  }
  assetsHTML(recipe) {
    this.mediaLibrary ??= new MediaLibrary(this);
    return this.mediaLibrary.html(recipe);
  }
  activityHTML() {
    const logs = this.host.logs();
    return `<div class="an-activity"><div class="an-info">Playback explained<p>Automatic events appear here with matching recipe, played effect count, or reason playback was blocked.</p></div>${logs.map((l) => `<div class="an-log"><time>${esc(l.time)}</time><span class="an-badge ${l.status === "Blocked" ? "is-missing" : ""}">${esc(l.status)}</span><div><b>${esc(l.recipe)}</b><p>${esc(l.detail)}</p></div></div>`).join("") || `<div class="an-empty">No activity yet.<small>Preview a recipe or enable automatic playback.</small></div>`}</div>`;
  }
  setupHTML(env) {
    return `<div class="an-setup"><section class="an-setup-hero"><span>✧</span><h2>From dice roll to spectacle.</h2><p>Install your assets. Pick a recipe. Let your table do the rest.</p></section><div class="an-setup-grid">${env.dependencies.map((d) => `<div class="an-dependency"><span class="${d.ok ? "an-ok" : "an-missing"}">${d.ok ? "✓" : "!"}</span><div><h3>${esc(d.name)}</h3><p>${esc(d.detail)}</p></div></div>`).join("")}</div><section class="an-settings-card"><div><h3>Automatic playback</h3><p>${env.conflicts.length ? `Other animation engines active: ${esc(env.conflicts.join(", "))}. Overlapping triggers may play twice.` : "Your saved recipes respond to supported game events."}</p></div><button data-action="automation" class="an-toggle ${this.host.enabled() ? "is-on" : ""}" role="switch" aria-checked="${this.host.enabled()}" ${env.demo || !env.ready ? "disabled" : ""}>${this.host.enabled() ? "On" : "Off"}</button></section>${this.catalogFxControlsHTML(env)}<div class="an-guide"><h3>First animation in three steps</h3><ol><li><b>Choose a recipe.</b> Open Recipes, pick an effect, check its asset preview.</li><li><b>Try it locally.</b> Select a caster token, target a token, then Local preview.</li><li><b>Make it yours.</b> Set trigger and item names, save, then enable automatic playback.</li></ol><p>Area previews create a temporary template automatically and remove it afterward. Select a native area to override placement and size. Rerolls and private PF2e messages are skipped. D&D 5e hit/miss resolution is not inferred from target AC.</p><button data-action="restore-starters">Add missing starter recipes</button></div></div>`;
  }
  catalogFxControlsHTML(env) {
    const state=this.host.catalogFxSettings?.()??{token:true,scene:true},fx=this.host.fxCatalog?.()??{};
    return [['token','catalogTokenFx','Token Magic FX','Token filters',fx.tokenReady],['scene','catalogSceneFx','FXMaster','Scene effects · GM playback',fx.sceneReady]].map(([kind,key,name,detail,ready])=>`<section class="an-settings-card"><div><h3>Catalog: ${name}</h3><p>${detail} · ${ready?'Available':'Provider unavailable'}</p></div><button data-action="catalog-fx-toggle" data-setting="${key}" data-fx-kind="${kind}" class="an-toggle ${state[kind]?'is-on':''}" role="switch" aria-label="Catalog: ${name}" aria-checked="${state[kind]}" ${env.demo||!this.host.setCatalogFxSetting?'disabled':''}>${state[kind]?'On':'Off'}</button></section>`).join('');
  }
  importHTML() {
    return `<div class="an-modal-scrim"><section class="an-modal" role="dialog" aria-modal="true" aria-label="Import Animater recipes"><h2>Import recipes</h2><p>Paste an Animater export. Existing IDs are replaced only after review.</p><textarea aria-label="Recipe import JSON" data-import rows="10" placeholder='{"schema":1,"recipes":[…]}'></textarea><div data-import-review role="status"></div><footer><button data-action="cancel-import">Cancel</button><button data-action="review-import">Review import</button><button data-action="confirm-import" class="an-primary" disabled>Import reviewed recipes</button></footer></section></div>`;
  }
  onInput(e) {
    const t = e.target;
    if (studioInput(this, t)) return;
    if(this.mediaLibrary?.input(t))return;
    if(this.dndCatalog?.input(t))return;
    if (t.dataset.builder) {
      this.stopEditorPreview();
      this.builder[t.dataset.builder] =
        t.type === "number" ? Number(t.value) : t.value;
      return;
    }
    if (t.dataset.search) {
      if (t.dataset.search === "recipes") this.search = t.value;
      else if (t.dataset.search === "spells") {
        this.spellFilters.search = t.value;
        this.spellPage = 0;
      } else if (abilityProfileForPage(t.dataset.search)) {
        const profile = abilityProfileForPage(t.dataset.search);
        this[profile.filtersKey].search = t.value;
        this[profile.pageKey] = 0;
      } else if (t.dataset.search === "weapons") {
        this.weaponFilters.search = t.value;
        this.weaponPage = 0;
      } else if (["conditions", "effects"].includes(t.dataset.search)) {
        const kind = t.dataset.search === "conditions" ? "condition" : "effect";
        this.stateFilters[kind].search = t.value; this.statePages[kind] = 0;
      } else this.assetSearch = t.value;
      this.render();
      return;
    }
    if (t.matches("[data-import]")) {
      this.pendingImport = [];
      this.root.querySelector('[data-action="confirm-import"]').disabled = true;
      this.root.querySelector("[data-import-review]").textContent = "";
      return;
    }
    if (t.dataset.field) this.updateField(t);
  }
  onChange(e) {
    if(this.mediaLibrary?.change(e.target))return;
    if(e.target.hasAttribute('data-dnd-variant')||e.target.dataset.dndFilter||e.target.dataset.dndOption){void this.dndCatalog?.change(e.target).catch(error=>{this.message=error.message;this.render();});return;}
    if (e.target.hasAttribute("data-state-damage")) { this.stateDamageType = e.target.value; this.render(); return; }
    if (e.target.hasAttribute("data-state-aura-variant")) { this.stateAuraVariant = e.target.value; this.render(); return; }
    if (e.target.dataset.stateFilter) {
      const kind = this.page === "conditions" ? "condition" : "effect";
      this.stateFilters[kind][e.target.dataset.stateFilter] = e.target.value; this.statePages[kind] = 0; this.render(); return;
    }
    if (e.target.dataset.weaponFilter) {
      this.weaponFilters[e.target.dataset.weaponFilter] = e.target.value;
      this.weaponPage = 0;
      if (e.target.dataset.weaponFilter === "mode" && e.target.value !== "all") this.weaponMode = e.target.value;
      this.render(); return;
    }
    if (e.target.dataset.abilityVolume) {
      this.stopEditorPreview();
      const profile = abilityProfileForKey(e.target.dataset.abilityVolume), set = profile ? this.host[profile.setStateKey] : this.host.setWeaponCatalogState;
      void set({ soundVolume: Math.max(0, Math.min(1, Number(e.target.value) / 100)) }).then(() => this.render()).catch(error => { this.message = error.message; this.render(); });
      return;
    }
    const abilityFilter = ["feat", "action", "feature"].map((key) => [abilityProfileForKey(key), e.target.dataset[key + "Filter"]]).find(([, field]) => field);
    if (abilityFilter) {
      const [profile, field] = abilityFilter;
      this[profile.filtersKey][field] = e.target.value;
      this[profile.pageKey] = 0;
      this.render();
      return;
    }
    if (e.target.hasAttribute("data-catalog-volume")) {
      this.stopEditorPreview();
      void this.host
        .setCatalogState({
          soundVolume: Math.max(0, Math.min(1, Number(e.target.value) / 100)),
        })
        .then(() => this.render())
        .catch((error) => {
          this.message = error.message;
          this.render();
        });
      return;
    }
    if (e.target.dataset.catalogFilter) {
      this.spellFilters[e.target.dataset.catalogFilter] = e.target.value;
      this.spellPage = 0;
      this.render();
      return;
    }
    if (e.target.dataset.builder) {
      this.builder[e.target.dataset.builder] =
        e.target.type === "number" ? Number(e.target.value) : e.target.value;
      this.render();
      return;
    }
    if (e.target.dataset.field) {
      this.updateField(e.target);
      this.render();
    }
  }
  updateField(t) {
    if (this.busy) return;
    this.stopEditorPreview();
    const r = this.edit();
    if (!r) return;
    let s =
      t.dataset.index !== undefined ? r.stages[Number(t.dataset.index)] : r;
    if (t.dataset.track !== undefined) s = s.tracks[Number(t.dataset.track)];
    const key = t.dataset.field,
      previous = s[key];
    const before = { ...s };
    if ((key === "startMode" || key === "startRef") && t.dataset.index !== undefined) {
      const i = Number(t.dataset.index);
      const snapshot = clone(r.stages);
      if (key === "startRef") {
        s.startRef = t.value;
      } else if (t.value === "after" || t.value === "with") {
        s.startMode = t.value;
        // Always name the stage it follows, so moving rows never changes timing.
        if (!s.startRef) s.startRef = (i > 0 ? r.stages[i - 1] : r.stages[1])?.stageId;
      } else if (t.value === "time") {
        // Freeze the current resolved start as a plain time.
        const at = sampleRecipe(r).stages[i]?.delay ?? s.delay ?? 0;
        delete s.startMode; delete s.startRef; s.afterStage = ""; s.delay = Math.round(at);
      }
      linkStartModes(r.stages);
      try { timedStages(r, 0); this.message = "Start updated. Save recipe to apply."; }
      catch {
        r.stages = snapshot;
        this.message = "Those stages would wait on each other. Choose a stage that starts earlier.";
      }
      return;
    }
    s[key] =
      t.type === "checkbox"
        ? t.checked
        : t.type === "number" || t.type === "range" ||
            [
              "delay",
              "duration",
              "scale",
              "opacity",
              "distance",
              "intensity",
            ].includes(key)
          ? Number(t.value)
          : key === "assets"
            ? t.value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
            : t.value;
    if (key === "volume" && t.type === "range") {
      const field = t.closest(".an-volume-field");
      const readout = field?.querySelector("[data-volume-readout]");
      if (readout) readout.textContent = `${Math.round(Number(t.value) * 100)}%`;
      const audio = field?.parentElement?.querySelector(".an-sound-listen");
      if (audio) { audio.volume = Number(t.value); audio.dataset.cueVolume = t.value; }
    }
    if (t.dataset.fxOption) {
      const option=t.dataset.fxOption;
      s.fxOptions={...(before.fxOptions ?? {})};
      if(t.dataset.fxColorPart) {
        const current=s.fxOptions[option] ?? this.host.fxCatalog?.().effects.find(e=>e.category===s.fxCategory && e.type===s.fxType)?.fields.find(f=>f.key===option)?.value ?? {value:'#ffffff',apply:false};
        s.fxOptions[option]={...current,[t.dataset.fxColorPart]:t.type==='checkbox'?t.checked:t.value};
      } else s.fxOptions[option]=t.type==='checkbox'?t.checked:t.type==='number'?Number(t.value):t.value;
    }
    if(key==='fxTint'&&t.type==='checkbox') {
      s.fxTint=t.checked?before.fxTint||'#ffffff':'';
      const color=this.root.querySelector(`input[type="color"][data-field="fxTint"][data-index="${t.dataset.index}"]`);
      if(color){color.disabled=!t.checked;color.value=s.fxTint||'#ffffff';}
    }
    if(key==='fxCategory'){s.fxType='';s.fxOptions={};}
    if(key==='fxType')s.fxOptions={};
    if(key==='fxLibrary')s.fxPreset='';
    if(key==='kind' && OPTIONAL_FX_KINDS.has(s.kind)) {
      s.assets=[];
      if(s.kind==='tokenfx'){s.subject='source';s.fxLibrary??='tmfx-main';s.fxPreset??='';}
      else {s.fxCategory??='particle';s.fxType??='';s.fxOptions??={};}
    }
    if (key === "kind" && s.kind === "motion") {
      s.motion ??= "lunge";
      s.subject ??= "source";
      s.distance ??= 0.35;
      s.intensity ??= 1;
    }
    if (key === "motion" && isPathMotion(s)) {
      if (!isPathMotion({ ...s, motion: previous })) {
        s.distance = s.motion === "dodge" ? .55 : 8;
        s.duration = Math.max(s.duration, s.motion === "dodge" ? 1600 : 2200);
        s.intensity = .6;
        s.motionArrival = 45;
        s.motionHold = 25;
        s.motionEndpoint = "near";
        s.motionHeading = "toward";
        s.jumpHeight = .8;
        s.arrivalLift = 0;
        s.stopGap = .1;
      }
      s.motionRange = s.motion === "dodge" ? "distance" : s.motionRange ?? "target";
    }
    if (key === "motionArrival") s.motionHold = Math.min(s.motionHold ?? 25, 90 - s.motionArrival);
    if (key === "motionRange" && previous !== s.motionRange) {
      s.distance = s.motionRange === "distance" ? Math.min(s.distance ?? 1.4, 1.4) : s.distance <= 2 ? 8 : s.distance ?? 8;
    }
    if (
      [
        "afterStage",
        "timingAnchor",
        "startOffset",
        "moveDelay",
        "duration",
        "motion",
        "kind",
      ].includes(key)
    ) {
      try {
        timedStages(r, 0);
      } catch (error) {
        Object.assign(s, before);
        this.message = error.message;
        return;
      }
    }
    if (key === "soundFile") delete s.optionalSound;
    if (
      key === "kind" &&
      !["motion", "sprite", "aura", "sound", "tokenfx"].includes(s.kind)
    )
      delete s.subject;
    if (["anchorX", "anchorY"].includes(key)) s.customAnchor = true;
    if (t.dataset.track !== undefined) {
      if (key === "loop" && s.loop) s.fromEnd = false;
      if (key === "fromEnd") s.delay = 0;
      if (key === "property") {
        s.from = ["alpha", "scale.x", "scale.y"].includes(s.property) ? 1 : 0;
        s.to =
          s.property === "alpha"
            ? 0
            : s.property.startsWith("scale")
              ? 1.2
              : s.property === "rotation"
                ? 90
                : -0.5;
      }
    }
    if (["delay", "duration"].includes(key)) {
      const label = this.root.querySelector(
        `[data-action="stage"][data-index="${t.dataset.index}"] small`,
      );
      if (label) label.textContent = this.stageStartLabel(s, r);
      const duration = recipeDuration(r);
      const time = this.root.querySelector("[data-preview-time]");
      if (time) time.textContent = `0.0 / ${(duration / 1000).toFixed(1)}s`;
      const progress = this.root.querySelector("[data-recipe-progress]");
      if (progress) {
        progress.max = duration || 1;
        progress.value = 0;
      }
    }
    const status = this.root.querySelector("[data-preview-status]");
    if (status) status.textContent = "Ready · preview current draft";
    const save = this.root.querySelector('[data-action="save"]');
    if (save) {
      save.disabled = false;
      save.textContent = "Save recipe";
    }
  }
  async onDrop(e) {
    const stage = e.target.closest("[data-stage-drag]");
    if (this.stageDrag !== null && stage) {
      e.preventDefault();
      if (!this.busy)
        this.moveStage(this.stageDrag, Number(stage.dataset.stageDrag));
      return;
    }
    if (this.busy) return;
    if (!e.target.closest(".an-binding")) return;
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.type !== "Item" || !data.uuid)
        throw Error("Drop a Foundry item here.");
      const item = await this.host.resolveItem(data.uuid);
      if (!item) throw Error("Item could not be resolved.");
      const r = this.edit();
      r.itemUuid = item.uuid;
      if (r.lifecycle === "document") r.stateEntry = "";
      r.match = item.name;
      this.message = `Bound to ${item.name}. Save recipe to apply.`;
      this.render();
    } catch (error) {
      this.message = error.message;
      this.render();
    }
  }
  // Feats, Actions and Features pages: data-action "<key>-auto", "select-<key>"…
  async abilityAction(action, b) {
    const match = /^(?:(select|use|copy)-(feat|action|feature)|(feat|action|feature)-(sound|page|reset|auto|exclude|motion|pause))$/.exec(action);
    if (!match) return false;
    const profile = abilityProfileForKey(match[2] ?? match[3]), verb = match[1] ?? match[4], catalog = profile.catalog, noun = profile.noun;
    const getState = () => catalog.normalizeState(this.host[profile.stateKey]?.()), setState = (change) => this.host[profile.setStateKey](change);
    const selected = this[profile.selectedKey];
    if (verb === "sound") { await setState({ sound: !getState().sound }); this.render(); return true; }
    if (verb === "select") {
      if (selected === b.dataset.id) return true;
      this[profile.selectedKey] = b.dataset.id; this.stageIndex = 0; this.render(); return true;
    }
    if (verb === "page") { this[profile.pageKey] = Math.max(0, Number(b.dataset.index)); this.render(); return true; }
    if (verb === "reset") {
      for (const field of Object.keys(this[profile.filtersKey])) this[profile.filtersKey][field] = field === "search" ? "" : "all";
      this[profile.pageKey] = 0; this.render(); return true;
    }
    if (["auto", "exclude", "motion"].includes(verb)) {
      const env = this.host.environment();
      if (env.demo || env.systemId !== "pf2e" || !env.ready)
        throw Error(`Configure ${noun} animations inside a PF2e world with Sequencer and JB2A active.`);
      const state = catalog.normalizeState(this.host[profile.stateKey]());
      if (verb === "auto") {
        const enabled = !(state.enabled && state.scope === "all" && (state.independent || this.host.enabled()));
        await setState({ enabled, scope: "all", independent: true, preferCatalog: true });
        this.message = enabled
          ? `Active ${noun} catalog enabled. Send an active ${noun} to chat to play; manual entries stay manual.`
          : `${profile.label} catalog paused. Spell settings preserved.`;
      } else await setState(verb === "motion"
        ? { motion: state.motion === false }
        : { excluded: state.excluded.includes(selected) ? state.excluded.filter((id) => id !== selected) : [...state.excluded, selected] });
      this.render(); return true;
    }
    if (verb === "use") {
      const env = this.host.environment();
      if (env.demo || env.systemId !== "pf2e" || !env.ready)
        throw Error(`Use ${noun} animations inside a PF2e world with Sequencer and JB2A active.`);
      const feat = catalog.entry(selected);
      if (!feat || feat.trigger === "manual") throw Error(`This ${noun} uses manual playback.`);
      await setState(catalog.use(this.host[profile.stateKey](), feat.id));
      this.message = feat.rider ? `${feat.name} uses its catalog animation. Roll Strike damage that includes it to play.` : `${feat.name} uses its catalog animation. Send the ${noun} to chat to play.`;
      this.render(); return true;
    }
    if (verb === "pause") {
      await setState({ enabled: false });
      this.message = `${profile.label} catalog paused. Spell settings preserved.`;
      this.render(); return true;
    }
    if (verb === "copy") {
      const recipe = this.recipe();
      const saved = this.host.recipes().find((r) => r.id === recipe.id || r.itemUuid === recipe.itemUuid);
      if (!saved) await this.host.save([...this.host.recipes(), recipe]);
      const state = this.host[profile.stateKey]?.();
      if (state) await setState({
        selected: (state.selected ?? []).filter((id) => id !== selected),
        customized: [...new Set([...(state.customized ?? []), selected])],
      });
      this.selected = saved?.id ?? recipe.id; this.page = "recipes"; this.studio = true; this.studioTime = 0; this.stageIndex = 0; this.search = ""; this.category = "All";
      this.render(); return true;
    }
    return false;
  }
  async onClick(e) {
    const b = e.target.closest("[data-action]");
    if (!b || b.disabled) return;
    e.preventDefault();
    const action = b.dataset.action;
    if (this.busy && action !== "stop") return;
    try {
      if(await this.mediaLibrary?.action(action,b))return;
      if(await this.dndCatalog?.action(action,b))return;
      if (await handleStateCatalogAction(this, action, b)) return;
      if (action === "item-details") {
        await openCatalogDetails(this, b.dataset.kind, b.dataset.id);
        return;
      }
      if (action === "select-weapon") {
        if (this.selectedWeapon === b.dataset.id) return;
        this.selectedWeapon = b.dataset.id;
        const weapon = catalogWeapon(this.selectedWeapon);
        this.weaponMode = weapon.modes.find(m => m.mode === this.weaponFilters.mode)?.mode ?? weapon.modes[0].mode;
        this.stageIndex = 0; this.render(); return;
      }
      if (action === "weapon-mode") { if (this.weaponMode === b.dataset.mode) return; this.weaponMode = b.dataset.mode; this.stageIndex = 0; this.render(); return; }
      if (action === "weapon-page") { this.weaponPage = Math.max(0, Number(b.dataset.index)); this.render(); return; }
      if (action === "weapon-reset") { for (const key of Object.keys(this.weaponFilters)) this.weaponFilters[key] = key === "search" ? "" : "all"; this.weaponPage = 0; this.render(); return; }
      if (["weapon-auto", "weapon-pause", "weapon-exclude", "weapon-motion", "weapon-sound", "use-weapon"].includes(action)) {
        const env = this.host.environment(), state = normalizeWeaponCatalogState(this.host.weaponCatalogState?.());
        if (!["weapon-sound", "weapon-motion"].includes(action) && (env.demo || env.systemId !== "pf2e" || !env.ready)) throw Error("Configure automatic weapon animations inside a PF2e world.");
        const change = action === "weapon-auto" ? { enabled: !(state.enabled && state.scope === "all" && (state.independent || this.host.enabled())), independent: true, scope: "all", preferCatalog: true }
          : action === "weapon-pause" ? { enabled: false }
          : action === "weapon-motion" ? { motion: !state.motion }
          : action === "weapon-sound" ? { sound: !state.sound }
          : action === "use-weapon" ? useCatalogWeapon(state, this.selectedWeapon)
          : { excluded: state.excluded.includes(this.selectedWeapon) ? state.excluded.filter(id => id !== this.selectedWeapon) : [...state.excluded, this.selectedWeapon] };
        await this.host.setWeaponCatalogState(change);
        this.message = action === "use-weapon" ? "Weapon enabled. The rolled usage selects melee, ranged or thrown automatically." : "Weapon catalog settings updated.";
        this.render(); return;
      }
      if (action === "copy-weapon") {
        const recipe = this.recipe(), saved = this.host.recipes().find(r => r.id === recipe.id || r.itemUuid === recipe.itemUuid && r.weaponMode === recipe.weaponMode);
        if (!saved) await this.host.save([...this.host.recipes(), recipe]);
        const state = normalizeWeaponCatalogState(this.host.weaponCatalogState?.()), key = weaponCustomizationKey(this.selectedWeapon, recipe.weaponMode);
        await this.host.setWeaponCatalogState({ customized: [...new Set([...state.customized, key])] });
        this.selected = saved?.id ?? recipe.id; this.page = "recipes"; this.studio = true; this.studioTime = 0; this.search = ""; this.category = "All"; this.stageIndex = 0;
        this.render(); return;
      }
      if (await this.abilityAction(action, b)) return;
      if (action === "select-spell") {
        if (this.selectedSpell === b.dataset.id) return;
        this.selectedSpell = b.dataset.id;
        this.stageIndex = 0;
        this.render();
        return;
      }
      if (action === "catalog-page") {
        this.spellPage = Math.max(0, Number(b.dataset.index));
        this.render();
        return;
      }
      if (action === "catalog-reset") {
        for (const field of Object.keys(this.spellFilters))
          this.spellFilters[field] = field === "search" ? "" : "all";
        this.spellPage = 0;
        this.render();
        return;
      }
      if (action === "audition-sound") {
        const audio = b.closest(".an-sound-cue")?.querySelector("audio");
        if (!audio) return;
        if (!audio.paused) {
          audio.pause();
          return;
        }
        this.stopEditorPreview();
        audio.volume = Number(audio.dataset.cueVolume);
        audio.currentTime = 0;
        await audio.play();
        return;
      }
      if (
        [
          "catalog-auto",
          "catalog-exclude",
          "catalog-motion",
          "catalog-sound",
        ].includes(action)
      ) {
        const state = normalizeCatalogState(this.host.catalogState());
        if (action === "catalog-auto") {
          const enabled = !(
            state.enabled &&
            state.scope === "all" &&
            (state.independent || this.host.enabled())
          );
          await this.host.setCatalogState({
            enabled,
            scope: "all",
            independent: true,
            preferCatalog: true,
          });
          this.message = enabled
            ? "Entire catalog enabled. Cast normally; use Customize for your own versions."
            : "Catalog paused. Custom recipe automation stays available.";
          this.render();
          return;
        }
        await this.host.setCatalogState(
          action === "catalog-motion"
            ? { motion: state.motion === false }
            : action === "catalog-sound"
              ? { sound: state.sound === false }
              : {
                  excluded: state.excluded.includes(this.selectedSpell)
                    ? state.excluded.filter((id) => id !== this.selectedSpell)
                    : [...state.excluded, this.selectedSpell],
                },
        );
        this.render();
        return;
      }
      if (action === "use-spell") {
        const env = this.host.environment();
        if (env.demo || env.systemId !== "pf2e" || !env.ready)
          throw Error(
            "Use catalog animations inside a PF2e world with Sequencer and JB2A active.",
          );
        const spell = catalogSpell(this.selectedSpell);
        if (!spell || spell.trigger === "manual")
          throw Error("This animation uses manual playback.");
        await this.host.setCatalogState(
          useCatalogSpell(this.host.catalogState(), spell.id),
        );
        this.message = `${spell.name} uses the catalog animation. Cast normally; no recipe configuration needed.`;
        this.render();
        return;
      }
      if (action === "catalog-pause") {
        await this.host.setCatalogState({ enabled: false });
        this.message = "Catalog paused. Saved recipes keep their settings.";
        this.render();
        return;
      }
      if (action === "copy-spell") {
        const recipe = this.recipe();
        const saved = this.host
          .recipes()
          .find((r) => r.id === recipe.id || r.itemUuid === recipe.itemUuid);
        if(!saved && !recipe.stages[0].assets.length){
          this.drafts.set(recipe.id,recipe);
          this.dirty.add(recipe.id);
        }else if (!saved) await this.host.save([...this.host.recipes(), recipe]);
        const state = this.host.catalogState?.();
        if (state)
          await this.host.setCatalogState({
            selected: (state.selected ?? []).filter(
              (id) => id !== this.selectedSpell,
            ),
            customized: [
              ...new Set([...(state.customized ?? []), this.selectedSpell]),
            ],
          });
        this.selected = saved?.id ?? recipe.id;
        this.page = "recipes";
        this.studio = true;
        this.studioTime = 0;
        this.stageIndex = 0;
        this.search = "";
        this.category = "All";
        this.render();
        return;
      }
      if (action === "recipe-preview") {
        await this.playEditorPreview();
        return;
      }
      if (action === "browse-sound" || action === "browse-tokenfx") {
        this.mediaLibrary ??= new MediaLibrary(this);
        this.mediaLibrary.open(action==='browse-sound'?'audio':'tokenfx');
        return;
      }
      if (action === "add-track" || action === "remove-track") {
        const s = this.edit().stages[this.stageIndex];
        s.tracks ??= [];
        if (action === "remove-track")
          s.tracks.splice(Number(b.dataset.track), 1);
        else if (s.tracks.length < 6)
          s.tracks.push({
            property: "position.y",
            from: 0,
            to: -0.5,
            duration: Math.min(1000, s.duration),
            delay: 0,
            ease: "easeInOutQuad",
            loop: false,
            pingPong: false,
            fromEnd: false,
          });
        this.render();
        this.root.querySelector('[data-options-group="tracks"]').open = true;
        return;
      }
      if (action === "preview-mode") {
        if (this.previewMode === b.dataset.mode) return;
        this.previewMode = b.dataset.mode;
        this.render();
        return;
      }
      if (action === "page") {
        if(!catalogPageAllowed(b.dataset.page,this.host.environment()))return;
        if (this.page === b.dataset.page) {
          if (this.page === "recipes" && this.studio) { this.studio = false; this.render(); }
          return;
        }
        this.page = b.dataset.page;
        this.message = "";
        this.render();
        return;
      }
      if (action === "category") {
        if (this.category === b.dataset.category) return;
        this.category = b.dataset.category;
        this.render();
        return;
      }
      if (await studioAction(this, action, b)) return;
      if (action === "select") {
        if (this.selected === b.dataset.id && this.studio) return;
        if (this.selected !== b.dataset.id) { this.stageIndex = 0; this.studioTime = 0; }
        this.selected = b.dataset.id;
        this.studio = true;
        this.render();
        this.root.querySelector(".an-studio")?.focus({ preventScroll: true });
        return;
      }
      if (action === "stage") {
        if (this.stageIndex === Number(b.dataset.index)) return;
        this.stageIndex = Number(b.dataset.index);
        this.updateInspector();
        return;
      }
      if (action === "browse") {
        this.mediaLibrary ??= new MediaLibrary(this);
        this.mediaLibrary.open('animation');
        return;
      }
      if (action === "inspect-asset") {
        this.selectedAssetKey = b.dataset.key;
        this.render();
        return;
      }
      if (action === "choose-asset") {
        const r = this.edit();
        r.stages[Math.min(this.stageIndex, r.stages.length - 1)].assets = [
          b.dataset.key,
        ];
        this.page = "recipes";
        this.render();
        return;
      }
      if (action === "orb-builder") {
        this.builder = { element: "fire" };
        this.page = "builder";
        this.message = "";
        this.render();
        return;
      }
      if (action === "cancel-builder") {
        this.builder = null;
        this.page = "recipes";
        this.render();
        return;
      }
      if (action === "orb-element") {
        this.builder.element = b.dataset.element;
        this.render();
        return;
      }
      if (action === "create-orb") {
        const base = orbRecipe(
          this.builder,
          crypto.randomUUID(),
          this.host.catalog(),
        );
        base.name = this.builder.name?.trim() || base.name;
        await this.host.save([...this.host.recipes(), validateRecipe(base)]);
        this.selected = base.id;
        this.page = "recipes";
        this.studio = true;
        this.studioTime = 0;
        this.builder = null;
        this.stageIndex = 0;
        this.category = "All";
        this.search = "";
        this.message =
          "Chromatic orb created. Every layer is editable; choose a trigger when ready.";
        this.render();
        return;
      }
      if (action === "new" || action === "new-basic") {
        // Normalize neutral stage defaults, then leave asset selection to author.
        // Incomplete drafts stay local; Save uses strict recipe validation.
        const base = validateRecipe({
          id: crypto.randomUUID(),
          name: "Untitled recipe",
          description: "",
          trigger: "manual",
          category: "Custom",
          color: "#9e8aff",
          stages: [
            {
              kind: "cast",
              assets: ["jb2a.cast_generic"],
              delay: 0,
              duration: 1000,
              scale: 1,
            },
          ],
        });
        base.stages[0].assets = [];
        this.drafts.set(base.id, base);
        this.dirty.add(base.id);
        this.selected = base.id;
        this.page = "recipes";
        this.studio = true;
        this.studioTime = 0;
        this.builder = null;
        this.previewMode = "recipe";
        this.category = "All";
        this.search = "";
        this.stageIndex = 0;
        this.message =
          "Choose an asset or token motion, then add stages. Save when ready.";
        this.render();
        return;
      }
      if (action === "duplicate") {
        const base = clone(this.recipe());
        base.id = crypto.randomUUID();
        base.name = `${base.name} copy`;
        base.trigger = "manual";
        base.itemUuid = "";
        base.match = "";
        base.category = "Custom";
        await this.host.save([...this.host.recipes(), validateRecipe(base)]);
        this.selected = base.id;
        this.page = "recipes";
        this.studio = true;
        this.studioTime = 0;
        this.category = "All";
        this.search = "";
        this.stageIndex = 0;
        this.render();
        return;
      }
      if (action === "revert") {
        const unsaved = !this.host
          .recipes()
          .some((r) => r.id === this.selected);
        this.drafts.delete(this.selected);
        this.dirty.delete(this.selected);
        if (unsaved) { this.selected = this.listedRecipes()[0]?.id; this.studio = false; }
        this.message = "";
        this.render();
        return;
      }
      if (action === "save") {
        const r = validateRecipe(this.recipe());
        const saved = this.host.recipes();
        await this.host.save(
          saved.some((old) => old.id === r.id)
            ? saved.map((old) => (old.id === r.id ? r : old))
            : [...saved, r],
        );
        this.drafts.delete(r.id);
        this.dirty.delete(r.id);
        this.message = "Recipe saved.";
      }
      if (action === "add-motion" && this.recipe()?.lifecycle !== "document") {
        const r = this.edit();
        if (r.stages.length < MAX_STAGES) {
          r.stages.push({
            stageId: crypto.randomUUID(),
            kind: "motion",
            startMode: "with",
            startRef: r.stages.at(-1)?.stageId,
            motion: "lunge",
            subject: "source",
            assets: [],
            delay: 0,
            duration: 800,
            distance: 0.35,
            intensity: 1,
            scale: 1,
            opacity: 1,
            below: false,
            persist: false,
          });
          linkStartModes(r.stages);
          this.stageIndex = r.stages.length - 1;
        }
      }
      if (action === "add-stage") {
        const r = this.edit();
        if (r.stages.length < MAX_STAGES) {
          r.stages.push({
            ...clone(r.stages.at(-1)),
            stageId: crypto.randomUUID(),
            label: "",
            afterStage: "",
            ...(r.lifecycle === "document" ? {} : { startMode: "after", startRef: r.stages.at(-1).stageId, startOffset: 0 }),
            kind: r.lifecycle === "document" ? "aura" : "impact",
            assets: r.lifecycle === "document" ? [...r.stages.at(-1).assets] : ["jb2a.impact"],
            subject: r.lifecycle === "document" ? "source" : r.stages.at(-1).subject,
            persist: r.lifecycle === "document",
            delay: r.lifecycle === "document" ? 0 : Math.min(30000, r.stages.at(-1).delay + 800),
          });
          linkStartModes(r.stages);
          this.stageIndex = r.stages.length - 1;
        }
      }
      if (action === "remove-stage") {
        const r = this.edit();
        if (r.stages.length > 1) {
          const resolved = sampleRecipe(r).stages;
          const removedId = r.stages[this.stageIndex].stageId;
          r.stages.forEach((stage, i) => {
            if (stage.afterStage === removedId && !stage.startMode) {
              stage.delay = resolved[i].delay;
              stage.afterStage = "";
            }
          });
          r.stages.splice(this.stageIndex, 1);
          linkStartModes(r.stages);
          this.stageIndex = Math.max(0, this.stageIndex - 1);
        }
      }
      if (action === "move-stage") {
        this.moveStage(
          this.stageIndex,
          this.stageIndex + Number(b.dataset.dir),
        );
        return;
      }
      if (action === "open-bound") {
        const item = await this.host.resolveItem?.(this.recipe().itemUuid);
        if (!item?.sheet) throw Error("The bound item is unavailable.");
        await item.sheet.render({ force: true });
        return;
      }
      if (action === "unbind") {
        this.edit().itemUuid = "";
        if (this.edit().lifecycle === "document") this.edit().stateEntry = "";
      }
      if (action === "preview" || action === "play") {
        // Check selection before the window tucks away, so the reason stays visible.
        const tokens = this.host.previewTokens?.() ?? {};
        const needsCaster = this.recipe()?.stages.some((s) => !["template", "sound", "overlay", "scenefx"].includes(s.kind));
        if ("source" in tokens && !tokens.source && needsCaster) {
          this.message = "Select your caster token on the canvas first (and target any creatures), then try again.";
          globalThis.ui?.notifications?.warn(`Animater: ${this.message}`);
          this.render();
          return;
        }
        this.busy = true;
        this.message = "Preparing animation…";
        this.render();
        let restore = null;
        try {
          restore = await this.host.tuckWindow?.().catch(() => null);
          const result = await this.host.play(
            validateRecipe(this.recipe()),
            action === "preview",
            {
              onStart: (compiled) => {
                const clock = new RecipeClock();
                const scene = this.root.querySelector("[data-recipe-scene]");
                const recipe = compiled ?? {
                  ...validateRecipe(this.recipe()),
                  targetCount: this.host.previewTokens?.().targetCount ?? 1,
                };
                const visual =
                  scene &&
                  new RecipePreview(scene, recipe, (frame) =>
                    this.updatePlayback(frame),
                  {tokenFx:this.host.createTokenFxPreview,sceneFx:this.host.createSceneFxPreview});
                void visual?.prepareTokenFx();
                this.previewRun = {
                  stop: () => {
                    clock.stop();
                    visual?.stop();
                  },
                };
                const idle = this.root.querySelector("[data-preview-idle]");
                if (idle) idle.hidden = true;
                void clock.play(recipe, (frame) =>
                  visual ? visual.draw(frame) : this.updatePlayback(frame),
                );
              },
            },
          );
          this.message =
            result === null
              ? "Animation stopped."
              : action === "preview"
                ? "Local preview complete."
                : "Animation played at table.";
        } finally {
          this.stopEditorPreview();
          this.busy = false;
          await restore?.().catch(() => {});
        }
      }
      if (action === "stop") {
        this.stopEditorPreview();
        await this.host.stop();
        this.message = "Your Animater effects stopped.";
      }
      if (action === "refresh") {
        this.host.refreshCatalog();
        this.message = "Asset library refreshed.";
      }
      if (action === "automation") {
        await this.host.setEnabled(!this.host.enabled());
        this.message = `Automatic playback ${this.host.enabled() ? "enabled" : "disabled"}.`;
      }
      if(action==='catalog-fx-toggle') {
        if(!['catalogTokenFx','catalogSceneFx'].includes(b.dataset.setting))return;
        const state=this.host.catalogFxSettings?.()??{token:true,scene:true};
        await this.host.setCatalogFxSetting?.(b.dataset.setting,!state[b.dataset.fxKind]);
        this.render();return;
      }
      if (action === "export") {
        await this.host.export(
          JSON.stringify({ schema: 1, recipes: this.host.recipes() }, null, 2),
        );
        this.message = "Saved recipes exported. Unsaved edits excluded.";
      }
      if (action === "import") {
        this.pendingImport = [];
        this.render();
        this.root.querySelector("[data-import]").focus();
        return;
      }
      if (action === "cancel-import") {
        this.pendingImport = null;
        this.message = "";
      }
      if (action === "review-import") {
        this.pendingImport = parseImport(
          this.root.querySelector("[data-import]").value,
        );
        const replaced = this.pendingImport.filter((r) =>
          this.host.recipes().some((old) => old.id === r.id),
        ).length;
        this.root.querySelector("[data-import-review]").textContent =
          `${this.pendingImport.length} recipes: ${this.pendingImport.length - replaced} new, ${replaced} existing replaced.`;
        this.root.querySelector('[data-action="confirm-import"]').disabled =
          false;
        return;
      }
      if (action === "confirm-import") {
        const replacements = new Map(this.pendingImport.map((r) => [r.id, r]));
        const merged = this.host
          .recipes()
          .map((r) => replacements.get(r.id) ?? r)
          .concat(
            this.pendingImport.filter(
              (r) => !this.host.recipes().some((old) => old.id === r.id),
            ),
          );
        if (merged.length > 200) throw Error("Maximum 200 recipes.");
        await this.host.save(merged);
        this.pendingImport = null;
        this.drafts.clear();
        this.dirty.clear();
        this.selected = merged[0]?.id;
        this.message =
          "Recipes imported. Automatic playback setting unchanged.";
      }
      if (action === "delete") {
        const r = this.recipe();
        if (!this.host.recipes().some((old) => old.id === r.id)) {
          this.drafts.delete(r.id);
          this.dirty.delete(r.id);
          this.selected = this.listedRecipes()[0]?.id;
          this.studio = false;
          this.stageIndex = 0;
          this.message = "Draft discarded.";
          this.render();
          return;
        }
        if (
          !(await this.host.confirm(
            `Delete “${r.name}”? Export recipes first if you want a backup.`,
          ))
        )
          return;
        await this.host.save(
          this.host.recipes().filter((old) => old.id !== r.id),
        );
        this.drafts.delete(r.id);
        this.dirty.delete(r.id);
        this.selected = this.host.recipes()[0]?.id;
        this.studio = false;
        this.stageIndex = 0;
      }
      if (action === "restore-starters") {
        const old = this.host.recipes();
        const added = starterRecipes().filter(
          (r) => !old.some((o) => o.id === r.id),
        );
        await this.host.save([...old, ...added]);
        this.message = `Added ${added.length} starter recipes. Existing edits preserved.`;
      }
      this.render();
    } catch (error) {
      this.busy = false;
      this.message = error.message;
      if (action === "review-import") {
        this.root.querySelector("[data-import-review]").textContent =
          error.message;
        this.root.querySelector('[data-action="confirm-import"]').disabled =
          true;
      } else this.render();
    }
  }
}
