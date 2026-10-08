import { ID, validateRecipe, clone, matchRecipe } from "./model.mjs";
import { starterRecipes } from "./presets.mjs";
import { pf2eEvent, sf2eEvent, dnd5eEvent, twoeEvent } from "./adapters.mjs";
import { applyEventElement } from "./element-choice.mjs";
import { AA_ID, AA_TAKEOVER, aaCustomized, registerAATakeover } from "./integrations/automated-animations.mjs";
import { registerSpellArsenal } from "./integrations/spell-arsenal.mjs";
import { registerTriggerEngine } from "./integrations/trigger-engine.mjs";
import { AnimaterRuntime } from "./runtime.mjs";
import { installedSoundCatalog, catalogSoundOptions } from "./spell-sounds.mjs";
import { Workspace, JB2A_MISSING } from "./workspace.mjs";
import { MediaLibraryLoader } from './media-library-sources.mjs';
import { libraryPreferences } from './media-library.mjs';
import {TokenFxPreview} from './token-fx-preview.mjs';
import { SceneFxPreview } from "./scene-fx-preview.mjs";
import {
  createCanvasPreviewArea,
  templateArea,
} from "./canvas-preview-area.mjs";
import { TokenMotionPlayer, motionDirection } from "./motion.mjs";
import { installedFxCatalog, OptionalFxPlayer, fxAvailability, startTokenFxPreview } from './optional-fx.mjs';
import {catalogFxSettings} from './catalog-fx.mjs';
import {
  resolveAutomaticRecipe,
  normalizeCatalogState,
  catalogSpell,
  spellRecipe,
  PF2E_SOURCE,
  PF2E_SPELLS,
} from "./spell-catalog.mjs";
import {
  PF2E_FEATS,
  PF2E_FEAT_SOURCE,
  catalogFeat,
  featRecipe,
  normalizeFeatCatalogState,
  resolveAutomaticFeatRecipe,
} from "./feat-catalog.mjs";
import { PF2E_ACTION_CATALOG, PF2E_FEATURE_CATALOG, isFeatureItem, riderRecipes } from "./ability-catalog.mjs";
// PF2e ability catalogs beside feats: setting key → catalog.
const ABILITY_CATALOGS = { actionCatalog: PF2E_ACTION_CATALOG, featureCatalog: PF2E_FEATURE_CATALOG };
const abilitySettingKey = item => item?.type === "action" ? "actionCatalog" : isFeatureItem(item) ? "featureCatalog" : null;
import { PF2E_WEAPONS, PF2E_WEAPON_SOURCE, catalogWeapon, weaponRecipe, normalizeWeaponCatalogState, resolveAutomaticWeaponRecipe } from "./weapon-catalog.mjs";
import { PF2E_CONDITIONS, PF2E_EFFECTS, PF2E_STATE_SOURCE, normalizeStateCatalogState, catalogStateEntry, stateRecipe } from "./state-catalog.mjs";
import { PersistentStates } from "./persistent-states.mjs";
import { DND_KINDS,DND5E_SOURCE,dndEntries,dndEntry,dndRecipe,normalizeDndCatalogState,resolveDndAutomaticRecipe } from './dnd5e-catalog.mjs';
import { dndSettingKey,sfSettingKey } from './catalog-system.mjs';
import { dndStateHost } from './dnd5e-states.mjs';
import {SF_KINDS,SF2E_SOURCE,sfEntries,sfEntry,sfRecipe,normalizeSfCatalogState,resolveSfAutomaticRecipe} from './sf2e-catalog.mjs';
import {sfStateHost} from './sf2e-states.mjs';
import {QUALITY_CHOICES,allowsMotion,allowsTokenFx,stateBudget,usersForTier} from './quality.mjs';
import {ConditionBody,bodyTreatment} from './condition-body.mjs';
let conditionBody;
const localQuality=()=>{try{return game.settings.get('animater','quality');}catch{return 'full';}};
// Mirror this client's choice so the client that starts an animation can route optional layers.
const syncQuality=()=>{const value=localQuality(),user=game.user;if(typeof user?.getFlag==='function'&&typeof user.setFlag==='function'&&user.getFlag('animater','quality')!==value)void Promise.resolve(user.setFlag('animater','quality',value)).catch(()=>{});};
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
let runtime, app;
registerTriggerEngine();
const mediaLibraryLoader=new MediaLibraryLoader(()=>({modules:game.modules,database:globalThis.Sequencer?.Database,
  folderSources:libraryPreferences(game.settings.get(ID,'mediaLibrary')).sources,
  browse:path=>foundry.applications.apps.FilePicker.implementation.browse('data',path)}));
let motions;
let optionalFx;
let persistentStates;
const clientId = crypto.randomUUID();
const fxCatalog = () => installedFxCatalog({
  modules:game.modules, tokenMagic:globalThis.TokenMagic, fxmaster:globalThis.FXMASTER?.api,
  config:globalThis.CONFIG?.fxmaster, localize:key=>game.i18n.localize(key), isGM:game.user.isGM,
});
async function receiveOptionalFx(data) {
  if(!data || !optionalFx)return;
  const user=game.users.get(data.userId);
  if(!user)return;
  if(data.type==='fx-stop' || data.type==='stop')return optionalFx.stop({userId:user.id,session:data.type==='stop'?undefined:data.session});
  if(data.type!=='tokenfx' || !canvas.ready || data.sceneId!==canvas.scene?.id)return;
  if(!allowsTokenFx(localQuality()))return;
  const source=canvas.tokens.get(data.sourceId);
  if(!source || !(user.isGM || source.document.testUserPermission(user,'OWNER')))return;
  try {
    const stage=validateRecipe({id:'socket-tokenfx',name:'Token Magic FX',trigger:'manual',stages:[{...data.stage,kind:'tokenfx',assets:[],afterStage:''}]}).stages[0];
    const token=stage.subject==='targets'?canvas.tokens.get(data.tokenId):source;
    if(token)await optionalFx.play({...stage,destination:token},{session:data.session,userId:user.id});
  } catch(error){console.warn('Animater Token Magic FX:',error.message);}
}
async function receiveMotion(data, { strict = false } = {}) {
  if (!data || !canvas.ready) return;
  const user = game.users.get(data.userId);
  if (!user) return;
  if (data.type === "stop") {
    motions.stop(data.userId, { prefix: true });
    return;
  }
  if (data.type !== "motion") return;
  if (data.sceneId !== canvas.scene?.id) return;
  if (!allowsMotion(localQuality())) return;
  const source = canvas.tokens.get(data.sourceId);
  if (
    !source ||
    !(user.isGM || source.document.testUserPermission(user, "OWNER"))
  )
    return;
  try {
    const stage = validateRecipe({
      id: "socket-motion",
      name: "Motion",
      trigger: "manual",
      stages: [{ ...data.stage, kind: "motion" }],
    }).stages[0];
    const token =
      stage.subject === "targets" ? canvas.tokens.get(data.tokenId) : source;
    if (!token) return;
    const target = canvas.tokens.get(data.targetId);
    await motions.play(
      token,
      stage,
      motionDirection(token, source, target, stage.motion, canvas.grid?.size ?? 100),
      data.session ? `${data.userId}:${data.session}` : data.userId,
      { target: token === source ? target : source },
    );
  } catch (error) {
    if (strict) throw error;
    console.warn("Animater token motion:", error.message);
  }
}
const recipes = () =>
  clone(game.settings.get(ID, "recipes")?.recipes ?? starterRecipes());
const enabled = () => game.settings.get(ID, "automatic");
const acceptsEvents = () =>
  enabled() ||
  (game.system.id === "sf2e" && SF_KINDS.some(kind=>{const state=game.settings.get(ID,sfSettingKey(kind));return state?.enabled&&state.independent;})) ||
  (game.system.id === 'dnd5e' && DND_KINDS.some(kind=>{const state=game.settings.get(ID,dndSettingKey(kind));return state?.enabled&&state.independent;})) ||
  (game.system.id === "pf2e" &&
    ["spellCatalog", "featCatalog", "actionCatalog", "featureCatalog", "weaponCatalog"].some((key) => {
      const state = game.settings.get(ID, key);
      return state?.enabled && state.independent;
    }));
function environment() {
  const seq = game.modules.get("sequencer");
  const patreon = game.modules.get("jb2a_patreon");
  const free = game.modules.get("JB2A_DnD5e");
  const databaseReady = Boolean(
    globalThis.Sequencer?.Database?.entryExists?.("jb2a"),
  );
  const pack = patreon?.active
    ? "JB2A Patreon"
    : free?.active
      ? "JB2A Free"
      : "Sequencer media";
  const system =
    { pf2e: "Pathfinder 2e", sf2e: "Starfinder 2e", dnd5e: "D&D 5e" }[game.system.id] ??
    game.system.title;
  const supported = ["pf2e", "sf2e", "dnd5e"].includes(game.system.id);
  const ready = Boolean(seq?.active && globalThis.Sequencer);
  return {
    ready,
    // Built-in animations draw on JB2A artwork: one of the two packs must be active.
    jb2a: Boolean(patreon?.active || free?.active),
    motionReady: game.modules.get(ID)?.socket === true,
    motionServerVersion: game.modules.get(ID)?.version,
    systemId: game.system.id,
    pack,
    system,
    conflicts: ["autoanimations", "trigger-animations"]
      .filter((id) => game.modules.get(id)?.active && !(id === AA_ID && aaTakeover()))
      .map((id) => game.modules.get(id).title),
    problem: !seq?.active
      ? "Activate Sequencer, then reload Foundry."
      : !databaseReady
        ? "Activate JB2A Free or Patreon, then reload Foundry."
        : "Activate one JB2A pack, then reload Foundry.",
    dependencies: [
      {
        name: "Sequencer",
        ok: seq?.active,
        detail: seq?.active
          ? `Playback engine · ${seq.version}`
          : "Required · install and activate",
      },
      {
        name: pack,
        ok: databaseReady,
        detail: databaseReady
          ? "Installed variants available · no assets bundled"
          : "Optional for custom media · required for built-in animations",
      },
      {
        name: system,
        ok: supported,
        detail: supported
          ? `${game.system.version} · automatic adapter available`
          : "Manual playback available; automatic adapter unavailable",
      },
    ],
  };
}
function sourceFor(event) {
  if (event.source) return event.source.object ?? event.source;
  if (event.sceneId && event.sceneId !== canvas.scene?.id) return null;
  if (event.tokenId) return canvas.tokens?.get(event.tokenId) ?? null;
  const actorId = event.actor?.id ?? event.item?.actor?.id;
  if (!actorId) return null;
  const tokens = (canvas.tokens?.placeables ?? []).filter(
    (t) => t.actor?.id === actorId,
  );
  const selected = tokens.filter((t) => t.controlled);
  return selected.length === 1
    ? selected[0]
    : tokens.length === 1
      ? tokens[0]
      : null;
}
function circleArea(template, source, spec) {
  const doc = template?.document ?? template;
  if (!doc) return null;
  return templateArea(template, {
    source,
    spec,
    gridSize: canvas.grid?.size ?? 100,
    gridDistance: canvas.scene?.grid.distance ?? 5,
  });
}
function manualContext() {
  const source = canvas.tokens?.controlled?.[0];
  const template =
    canvas.regions?.controlled?.[0] ?? canvas.templates?.controlled?.[0];
  return {
    source,
    targets: Array.from(game.user.targets ?? []),
    template,
    area: circleArea(
      template,
      source,
      (template?.item ?? template?.document?.item)?.system?.area,
    ),
  };
}
async function enrich(event) {
  if (!event.item && event.itemUuid)
    event.item = await fromUuid(event.itemUuid);
  event.source = sourceFor(event);
  if (event.sceneId && event.sceneId !== canvas.scene?.id) return null;
  if(event.targetUuids?.length){
    event.targets=(await Promise.all(event.targetUuids.map(uuid=>fromUuid(uuid)))).map(doc=>doc?.object).filter(token=>token?.document?.parent?.id===canvas.scene?.id);
  }else if (event.targetUuid) {
    const doc =
      typeof event.targetUuid === "string"
        ? await fromUuid(event.targetUuid)
        : null;
    event.targets = doc?.object ? [doc.object] : [];
  } else event.targets = Array.from(game.user.targets ?? []);
  event.area = eventArea(event);
  return event;
}
function eventArea(event) {
  return circleArea(
    event.template,
    event.source,
    (event.systemId ?? game.system.id)==='dnd5e' ? {...event.activity?.target?.template,type:event.activity?.target?.template?.type==='wall'?'line':event.activity?.target?.template?.type} : event.item?.system?.area,
  );
}
function findRecipe(id) {
  if (id && typeof id === "object") return id;
  const saved = recipes();
  return saved.find(r=>r.id===id) ?? builtinRecipe(id) ??
    saved.find(r=>typeof id === "string" && r.name?.trim().toLowerCase() === id.trim().toLowerCase());
}
async function dispatch(event) {
  if (!event || !acceptsEvents()) return;
  if (yieldsToAA(event)) return runtime.trace("Skipped", `${event.item?.name ?? "Unknown item"}: customized in Automated Animations.`);
  try {
    await runtime.dispatch(await enrich(event));
  } catch (error) {
    runtime.trace("Blocked", error.message);
  }
}
export class AnimaterApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "animater-workspace",
    classes: ["animater"],
    tag: "div",
    window: { title: "Animater", resizable: true },
    position: { width: 1240, height: 880 },
  };
  static PARTS = {
    workspace: { template: "modules/animater/templates/workspace.hbs" },
  };
  async _prepareContext() {
    return {};
  }
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!game.user.isGM) {
      this.close();
      return;
    }
    const root = this.element.querySelector(".an-root");
    if (this.workspace?.root !== root) {
      this.workspace?.destroy();
      this.workspace = new Workspace(root, workspaceHost());
    }
  }
  async close(options) {
    this.workspace?.destroy();
    this.workspace = null;
    return super.close(options);
  }
}
function open() {
  if (!game.user.isGM) {
    ui.notifications.warn("Animater configuration is GM-only.");
    return;
  }
  app ??= new AnimaterApp();
  return app.render({ force: true });
}
function builtinRecipe(id) {
 if(game.system.id==='sf2e'){
  const entry=sfEntry(id);if(!entry)return null;
  const state=normalizeSfCatalogState(game.settings.get(ID,sfSettingKey(entry.kind))),variant=entry.variants.find(v=>v.recipe.id===id);
  return sfRecipe(entry,variant?.id,{motion:state.motion,sounds:state.sound?installedSoundCatalog(game.modules,globalThis.Sequencer?.Database):null,soundVolume:state.soundVolume,catalog:runtime.getCatalog()});
 }
 if(game.system.id==='dnd5e') {
  const entry=dndEntry(id)??dndEntries().find(e=>e.variants.some(v=>v.recipe.id===id));
  if(!entry)return null;
  const variant=entry.variants.find(v=>v.recipe.id===id),state=normalizeDndCatalogState(game.settings.get(ID,dndSettingKey(entry.kind)));
  return dndRecipe(entry,variant?.id,{motion:state.motion,sounds:state.sound?installedSoundCatalog(game.modules,globalThis.Sequencer?.Database):null,soundVolume:state.soundVolume});
 }
 if(game.system.id!=='pf2e')return null;
 return (catalogStateEntry(id) && stateRecipe(catalogStateEntry(id),{catalog:runtime.getCatalog()})) ??
        (catalogSpell(id) &&
          spellRecipe(
            catalogSpell(id),
            undefined,
            catalogSoundOptions(workspaceHost()),
          )) ??
        (catalogWeapon(id) && weaponRecipe(catalogWeapon(id), /-(melee|ranged|thrown)$/.exec(id)?.[1], { motion: game.settings.get(ID, "weaponCatalog")?.motion !== false, soundCatalog: game.settings.get(ID, "weaponCatalog")?.sound === false ? null : installedSoundCatalog(game.modules, globalThis.Sequencer?.Database), soundVolume: game.settings.get(ID, "weaponCatalog")?.soundVolume })) ??
        Object.entries(ABILITY_CATALOGS).map(([key,catalog])=>catalog.entry(id)&&catalog.recipe(catalog.entry(id),game.settings.get(ID,key)??{},installedSoundCatalog(game.modules,globalThis.Sequencer?.Database))).find(Boolean) ??
        (catalogFeat(id) &&
          featRecipe(catalogFeat(id), {
            motion: game.settings.get(ID, "featCatalog")?.motion !== false,
            soundVolume: game.settings.get(ID, "featCatalog")?.soundVolume,
            soundCatalog: game.settings.get(ID, "featCatalog")?.sound === false ? null : installedSoundCatalog(
              game.modules,
              globalThis.Sequencer?.Database,
            ),
          }));
}
function workspaceHost() {
  return {
    // Tuck the window away while a canvas preview or table playback runs, then restore it.
    tuckWindow: async () => {
      let on = true; try { on = game.settings.get(ID, 'tuckDuringPlayback') !== false; } catch {}
      if (!on || !app?.rendered || app.minimized) return null;
      await app.minimize();
      return async () => { if (app?.rendered && app.minimized) await app.maximize(); };
    },
    mediaPreferences:()=>libraryPreferences(game.settings.get(ID,'mediaLibrary')),
    setMediaPreferences:value=>game.settings.set(ID,'mediaLibrary',libraryPreferences(value)),
    mediaCatalog:()=>mediaLibraryLoader.peek(),
    loadMediaCatalog:(refresh,onProgress)=>mediaLibraryLoader.load(refresh,onProgress),
    sfCatalogState:kind=>normalizeSfCatalogState(game.settings.get(ID,sfSettingKey(kind))),
    setSfCatalogState:async(kind,change)=>{
      if(!game.user.isGM||game.system.id!=="sf2e"||!SF_KINDS.includes(kind))throw Error("SF2e catalog configuration requires a GM in an SF2e world.");
      const key=sfSettingKey(kind);
      await game.settings.set(ID,key,normalizeSfCatalogState({...game.settings.get(ID,key),...change}));
      persistentStates?.schedule();
    },
    dndCatalogState:kind=>normalizeDndCatalogState(game.settings.get(ID,dndSettingKey(kind))),
    setDndCatalogState:async(kind,change)=>{
      if(!game.user.isGM||game.system.id!=='dnd5e'||!DND_KINDS.includes(kind))throw Error('D&D catalog configuration requires a GM in a D&D world.');
      const key=dndSettingKey(kind);
      await game.settings.set(ID,key,normalizeDndCatalogState({...game.settings.get(ID,key),...change}));
      persistentStates?.schedule();
    },
    soundCatalog: () =>
      installedSoundCatalog(game.modules, globalThis.Sequencer?.Database),
    weaponScale: () => Number(game.settings.get(ID, "weaponScale")) || 1,
    recipes,
    catalog: () => runtime.getCatalog(),
    fxCatalog,
    createSceneFxPreview:(scene,recipe,grid)=>{
      const catalog=fxCatalog();
      if(!catalog.sceneReady||!CONFIG.fxmaster?.particleEffects)return null;
      return new SceneFxPreview({scene,recipe,grid,PIXI:globalThis.PIXI,fxmaster:CONFIG.fxmaster,catalog});
    },
    createTokenFxPreview:async(scene,recipe)=>{
      if(!fxCatalog().tokenReady)return null;
      return new TokenFxPreview({scene,recipe,PIXI:globalThis.PIXI,tokenMagic:globalThis.TokenMagic});
    },
    previewTokenFx:stage=>{
      if(!canvas.ready)throw Error('Open a scene first.');
      const unavailable=fxAvailability({...stage,kind:'tokenfx'},fxCatalog(),{preview:true});
      if(unavailable)throw Error(unavailable);
      const context=manualContext();
      return startTokenFxPreview(optionalFx,stage,{tokens:stage.subject==='targets'?context.targets:[context.source],userId:game.user.id});
    },
    catalogFxSettings:()=>catalogFxSettings(),
    setCatalogFxSetting:async(key,value)=>{
      if(!game.user.isGM||!['catalogTokenFx','catalogSceneFx'].includes(key))return;
      await game.settings.set(ID,key,value===true);
    },
    logs: () => runtime.log,
    environment,
    enabled,
    catalogState: () =>
      normalizeCatalogState(game.settings.get(ID, "spellCatalog")),
    setCatalogState: async (change) => {
      if (!game.user.isGM)
        throw Error("Only a GM can configure the spell catalog.");
      const current = game.settings.get(ID, "spellCatalog");
      await game.settings.set(
        ID,
        "spellCatalog",
        normalizeCatalogState({ ...current, ...change }),
      );
    },
    featCatalogState: () =>
      normalizeFeatCatalogState(game.settings.get(ID, "featCatalog")),
    setFeatCatalogState: async (change) => {
      if (!game.user.isGM)
        throw Error("Only a GM can configure the feat catalog.");
      const current = game.settings.get(ID, "featCatalog");
      await game.settings.set(
        ID,
        "featCatalog",
        normalizeFeatCatalogState({ ...current, ...change }),
      );
    },
    actionCatalogState: () => PF2E_ACTION_CATALOG.normalizeState(game.settings.get(ID, "actionCatalog")),
    setActionCatalogState: async (change) => {
      if (!game.user.isGM) throw Error("Only a GM can configure the action catalog.");
      return game.settings.set(ID, "actionCatalog", PF2E_ACTION_CATALOG.normalizeState({ ...game.settings.get(ID, "actionCatalog"), ...change }));
    },
    featureCatalogState: () => PF2E_FEATURE_CATALOG.normalizeState(game.settings.get(ID, "featureCatalog")),
    setFeatureCatalogState: async (change) => {
      if (!game.user.isGM) throw Error("Only a GM can configure the feature catalog.");
      return game.settings.set(ID, "featureCatalog", PF2E_FEATURE_CATALOG.normalizeState({ ...game.settings.get(ID, "featureCatalog"), ...change }));
    },
    weaponCatalogState: () => normalizeWeaponCatalogState(game.settings.get(ID, "weaponCatalog")),
    setWeaponCatalogState: async (change) => {
      if (!game.user.isGM) throw Error("Only a GM can configure weapon animations.");
      return game.settings.set(ID, "weaponCatalog", normalizeWeaponCatalogState({ ...game.settings.get(ID, "weaponCatalog"), ...change }));
    },
    stateCatalogState: (kind) => normalizeStateCatalogState(game.settings.get(ID, kind === "condition" ? "conditionCatalog" : "effectCatalog")),
    setStateCatalogState: async (kind, change) => {
      if (!game.user.isGM) throw Error("Only a GM can configure persistent animations.");
      const key = kind === "condition" ? "conditionCatalog" : "effectCatalog";
      await game.settings.set(ID, key, normalizeStateCatalogState({ ...game.settings.get(ID, key), ...change }));
      persistentStates?.schedule();
    },
    async save(data) {
      if (!game.user.isGM) throw Error("Only a GM can save recipes.");
      if (data.length > 200) throw Error("Maximum 200 recipes.");
      const valid = data.map(validateRecipe);
      if (new Set(valid.map((r) => r.id)).size !== valid.length)
        throw Error("Recipe IDs must be unique.");
      await game.settings.set(ID, "recipes", { schema: 1, recipes: valid });
      persistentStates?.schedule();
    },
    setEnabled: async (value) => {
      if (!game.user.isGM) throw Error("Only a GM can enable automation.");
      await game.settings.set(ID, "automatic", value);
    },
    play: (recipe, preview, options = {}) =>
      runtime.play(recipe, manualContext(), { ...options, preview }),
    previewTokens: () => {
      if (!canvas.ready) return {};
      const context = manualContext();
      const info = (token) =>
        token
          ? {
              id: token.id,
              name: token.name,
              img: token.document?.texture?.src,
              width: (token.w ?? canvas.grid.size) / canvas.grid.size,
              height: (token.h ?? canvas.grid.size) / canvas.grid.size,
              mechanicalWidth: (token.mechanicalBounds?.width ?? token.w ?? canvas.grid.size) / canvas.grid.size,
              textureScaleX: token.document?.texture?.scaleX ?? 1,
              textureScaleY: token.document?.texture?.scaleY ?? 1,
              spriteWidth:
                Math.abs(token.mesh?.width ?? token.w ?? canvas.grid.size) /
                canvas.grid.size,
              spriteHeight:
                Math.abs(token.mesh?.height ?? token.h ?? canvas.grid.size) /
                canvas.grid.size,
              rotation: token.document?.rotation ?? 0,
              auraRadii: Object.fromEntries(Array.from(token.actor?.auras?.values?.()??[],a=>[a.slug,a.radius])),
            }
          : null;
      return {
        source: info(context.source),
        targets: info(context.targets?.[0]),
        targetList: context.targets.map(info),
        targetCount: context.targets?.length ?? 0,
        gridDistance: canvas.scene?.grid?.distance ?? 5,
      };
    },
    stop: () => runtime.stop(),
    pickSound: (current, callback) =>
      new foundry.applications.apps.FilePicker.implementation({
        type: "audio",
        current,
        callback,
      }).browse(),
    pickMedia: (type,current,callback)=>new foundry.applications.apps.FilePicker.implementation({type,current,callback}).browse(),
    pickMediaFolder:callback=>new foundry.applications.apps.FilePicker.implementation({type:'folder',activeSource:'data',callback:(path,picker)=>{
      if(picker.activeSource!=='data'){ui.notifications.warn('Choose a folder in User Data.');return;}
      void Promise.resolve(callback(path)).catch(error=>ui.notifications.error(error.message));
    }}).browse(),
    refreshCatalog: () => runtime.refreshCatalog(),
    resolveItem: (uuid) => fromUuid(uuid),
    // Name/icon for a bound item without loading it (compendium index or world doc).
    itemSummary: (uuid) => {
      try {
        const doc = fromUuidSync(uuid);
        if (!doc) return null;
        const pack = uuid.startsWith("Compendium.") ? game.packs.get(uuid.split(".").slice(1, 3).join("."))?.title : "";
        return { name: doc.name, img: doc.img, type: doc.type, source: pack || (doc.parent?.name ?? "World") };
      } catch { return null; }
    },
    confirm: (content) => {
      const p = document.createElement("p");
      p.textContent = content;
      return foundry.applications.api.DialogV2.confirm({
        window: { title: "Animater" },
        content: p.outerHTML,
      });
    },
    export: (text) =>
      foundry.utils.saveDataToFile(
        text,
        "application/json",
        "animater-recipes.json",
      ),
  };
}
Hooks.once("init", () => {
  game.settings.register(ID,'mediaLibrary',{scope:'client',config:false,type:Object,default:libraryPreferences()});
  for(const [key,name,hint] of [
    ['catalogTokenFx','Add Token Magic FX filters to catalog animations','When Token Magic FX is active, catalog animations add matching token filters (glows, frost, shimmer). Skipped automatically when the module is missing.'],
    ['catalogSceneFx','Add FXMaster scene effects to catalog animations','When FXMaster is active, weather-like catalog spells add brief scene effects (rain, fog, embers). Skipped automatically when the module is missing.']])
    game.settings.register(ID,key,{name,hint,scope:'world',config:true,type:Boolean,default:true,
      onChange:()=>{persistentStates?.schedule();app?.workspace?.render();}});
  game.settings.register(ID,'weaponScale',{name:'Weapon effect size',hint:'Multiplies the size of weapon hit and residue effects (1 = the target token\'s footprint).',
    scope:'world',config:true,type:Number,range:{min:0.5,max:3,step:0.1},default:1.5});
  game.settings.register(ID,'tuckDuringPlayback',{name:'Minimize Animater during canvas playback',
    hint:'Local preview and Play at table minimize the Animater window while the animation runs, then restore it.',
    scope:'client',config:true,type:Boolean,default:true});
  game.settings.register(ID,'quality',{name:'Animation quality (this device)',
    hint:'Lower this on slower computers. Applies only to what you see; other players keep their own setting.',
    scope:'client',config:true,type:String,choices:{...QUALITY_CHOICES},default:'full',
    onChange:()=>{syncQuality();persistentStates?.schedule();}});
  for(const kind of SF_KINDS)game.settings.register(ID,sfSettingKey(kind),{scope:"world",config:false,type:Object,default:normalizeSfCatalogState(),onChange:()=>persistentStates?.schedule()});
  for(const kind of DND_KINDS)game.settings.register(ID,dndSettingKey(kind),{scope:'world',config:false,type:Object,default:normalizeDndCatalogState(),onChange:()=>persistentStates?.schedule()});
  for (const key of ["conditionCatalog", "effectCatalog"])
    game.settings.register(ID, key, { scope: "world", config: false, type: Object, default: normalizeStateCatalogState(), onChange: () => persistentStates?.schedule() });
  game.settings.register(ID, "weaponCatalog", { scope: "world", config: false, type: Object, default: normalizeWeaponCatalogState() });
  for (const [key, catalog] of Object.entries(ABILITY_CATALOGS))
    game.settings.register(ID, key, { scope: "world", config: false, type: Object, default: catalog.normalizeState() });
  game.settings.register(ID, "featCatalog", {
    scope: "world",
    config: false,
    type: Object,
    default: normalizeFeatCatalogState(),
  });
  game.settings.register(ID, "spellCatalog", {
    scope: "world",
    config: false,
    type: Object,
    default: normalizeCatalogState(),
  });
  game.settings.register(ID, "recipes", {
    scope: "world",
    config: false,
    type: Object,
    default: { schema: 1, recipes: starterRecipes() },
  });
  game.settings.register(ID, AA_TAKEOVER, {
    name: "Take over from Automated Animations when Animater has an animation",
    hint: "Automated Animations skips items Animater animates. Items customized in Automated Animations stay with it.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
  game.settings.register(ID, "automatic", {
    name: "Automatic playback",
    hint: "Play saved Animater recipes on system events. Disable overlapping animations in other modules to avoid duplicate playback.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });
  game.settings.registerMenu(ID, "workspace", {
    name: "Animater workspace",
    label: "Open Animater",
    hint: "Browse assets, build recipes, preview, and configure automatic triggers.",
    icon: "fas fa-wand-magic-sparkles",
    type: AnimaterApp,
    restricted: true,
  });
  game.keybindings.register(ID, "open", {
    name: "Open Animater",
    editable: [{ key: "KeyA", modifiers: ["Alt", "Shift"] }],
    restricted: true,
    onDown: () => {
      open();
      return true;
    },
  });
});
function systemRecipe(event, saved) {
  return game.system.id === "pf2e" && abilitySettingKey(event.item)
        ? ABILITY_CATALOGS[abilitySettingKey(event.item)].resolveAutomaticRecipe(event, game.settings.get(ID, abilitySettingKey(event.item)), saved,
            { customEnabled: enabled(), soundCatalog: installedSoundCatalog(game.modules, globalThis.Sequencer?.Database) })
        : game.system.id === "pf2e"
        ? (event.item?.type === "weapon" ? resolveAutomaticWeaponRecipe : event.item?.type === "feat"
            ? resolveAutomaticFeatRecipe
            : resolveAutomaticRecipe)(
            event,
            game.settings.get(
              ID,
              event.item?.type === "weapon" ? "weaponCatalog" : event.item?.type === "feat" ? "featCatalog" : "spellCatalog",
            ),
            saved,
            {
              customEnabled: enabled(),
              soundCatalog: installedSoundCatalog(
                game.modules,
                globalThis.Sequencer?.Database,
              ),
            },
          )
        : game.system.id==='sf2e'?resolveSfAutomaticRecipe(event,kind=>game.settings.get(ID,sfSettingKey(kind)),saved,{customEnabled:enabled(),sounds:installedSoundCatalog(game.modules,globalThis.Sequencer?.Database)}):game.system.id==='dnd5e'?resolveDndAutomaticRecipe(event,kind=>game.settings.get(ID,dndSettingKey(kind)),saved,{customEnabled:enabled(),sounds:installedSoundCatalog(game.modules,globalThis.Sequencer?.Database)}):matchRecipe(saved,event);
}
// The recipe dispatch would play, or null. AA-customized items stay with AA.
function resolveEvent(event) {
  if (!event || yieldsToAA(event)) return null;
  return applyEventElement(systemRecipe({ systemId: game.system.id, ...event }, recipes()), event.element) ?? null;
}
const yieldsToAA = event => Boolean(game.modules.get(AA_ID)?.active && aaCustomized(event.item, event.activity));
const aaTakeover = () => Boolean(game.modules.get(AA_ID)?.active && game.settings.get(ID, AA_TAKEOVER));
function eventFrom(input) {
  if (input?.documentName === "ChatMessage") {
    if (["pf2e", "sf2e"].includes(game.system.id)) return twoeEvent(input, input.author?.id ?? game.user.id, game.system.id);
    const roll = input.flags?.dnd5e?.roll?.type;
    return { type: roll === "attack" ? "attack" : roll === "damage" ? "damage" : "use", systemId: game.system.id, id: input.id,
      item: input.getAssociatedItem?.() ?? input.item, actor: input.getAssociatedActor?.() ?? input.actor,
      tokenId: input.speaker?.token, sceneId: input.speaker?.scene };
  }
  return input;
}
Hooks.once("ready", () => {
  syncQuality();
  const env = environment();
  if (game.user.isGM && env.ready && !env.jb2a) ui.notifications.warn(`Animater: ${JB2A_MISSING}`, { permanent: true });
  motions = new TokenMotionPlayer({ grid: () => canvas.grid?.size ?? 100 });
  // Lasting conditions move the creature itself; one-off motions take priority.
  conditionBody = new ConditionBody({ busy: (token) => motions.active.has(token), enabled: () => allowsMotion(localQuality()) });
  optionalFx = new OptionalFxPlayer({catalog:fxCatalog,tokenMagic:()=>globalThis.TokenMagic,
    fxmaster:()=>globalThis.FXMASTER?.api,scene:()=>canvas.scene,
    trace:(status,detail)=>runtime?.trace(status,detail)});
  game.socket?.on(`module.${ID}`, (data) => {
    if (data?.sender !== clientId) { void receiveMotion(data); void receiveOptionalFx(data); }
  });
  Hooks.on("canvasTearDown", () => {
    void persistentStates?.clear();
    conditionBody?.clear();
    motions.stop();
    void optionalFx.stop();
    void runtime?.stop();
    app?.workspace?.syncPreviewTokens({ clear: true });
  });
  const syncPreviewTokens = () => app?.workspace?.syncPreviewTokens();
  Hooks.on("controlToken", syncPreviewTokens);
  Hooks.on("targetToken", (user) => {
    if (user.id === game.user.id) syncPreviewTokens();
  });
  Hooks.on("updateToken", syncPreviewTokens);
  Hooks.on("canvasReady", syncPreviewTokens);
  const pruneFx=()=>void optionalFx.pruneExpired().catch(error=>console.warn('Animater FXMaster cleanup:',error.message));
  Hooks.on('canvasReady',pruneFx);
  setInterval(pruneFx,30000).unref?.();
  pruneFx();
  runtime = new AnimaterRuntime({
    soundCatalog: () =>
      installedSoundCatalog(game.modules, globalThis.Sequencer?.Database),
    get database() {
      return globalThis.Sequencer?.Database;
    },
    enabled: acceptsEvents,
    weaponScale: () => Number(game.settings.get(ID, "weaponScale")) || 1,
    usersFor: (tier) => usersForTier(Array.from(game.users?.contents ?? game.users?.values?.() ?? []), tier),
    recipes,
    riderRecipes: (event, saved) => game.system.id === "pf2e" ? riderRecipes(event, game.settings.get(ID, "featureCatalog"), saved, { customEnabled: enabled(), soundCatalog: installedSoundCatalog(game.modules, globalThis.Sequencer?.Database) }) : [],
    resolveRecipe: systemRecipe,
    ready: () => Boolean(canvas.ready && environment().ready),
    canPlay: (context) => Boolean(game.user.isGM || context.source?.isOwner),
    canSyncMotion: () => game.modules.get(ID)?.socket === true,
    // Preview of a lasting condition: show its body treatment for the preview's span.
    previewBody: (recipe, token) => {
      const kind = bodyTreatment(recipe.name);
      if (!kind || !token) return;
      const name = `preview-${crypto.randomUUID()}`;
      conditionBody?.add(name, token, kind);
      setTimeout(() => conditionBody?.remove(name), Math.max(3000, ...recipe.stages.map((s) => (s.delay ?? 0) + (s.duration ?? 0))));
    },
    fxCatalog,
    optionalFx: async (stage,context,{preview,session}) => {
      const unavailable=fxAvailability(stage,fxCatalog(),{preview});
      if(unavailable){runtime.trace('Skipped',unavailable);return;}
      if(stage.kind==='tokenfx' && !preview) {
        const portable={...stage,afterStage:''};
        for(const key of ['destination','origin','endpoint','motionTarget','landing'])delete portable[key];
        game.socket.emit(`module.${ID}`,{type:'tokenfx',sender:clientId,userId:game.user.id,
          sceneId:canvas.scene?.id,sourceId:context.source.id,tokenId:stage.destination.id,session,stage:portable});
      }
      return optionalFx.play(stage,{session,userId:game.user.id,preview});
    },
    stopOptionalFx: async ({session} = {}) => {
      if(session)game.socket.emit(`module.${ID}`,{type:'fx-stop',sender:clientId,userId:game.user.id,session});
      await optionalFx.stop({userId:game.user.id,session});
    },
    userId: () => game.user.id,
    gridSize: () => canvas.grid.size,
    gridDistance: () => canvas.scene?.grid?.distance ?? 5,
    areaMask: (template) => {
      const doc = template?.document ?? template;
      if (doc?.documentName === "Region") {
        const polygons = Array.from(doc.shapes ?? []).flatMap(s => s.polygons ?? []);
        return polygons.length ? polygons.map(p => new PIXI.Polygon(p.points)) : null;
      }
      // Preview documents are deliberately not registered in the Scene. Raw
      // shapes serialize across Sequencer without resolving their temporary UUID.
      const points = template?.shape?.points;
      return points?.length ? new PIXI.Polygon(Array.from(points, (n, i) => n + (i % 2 ? doc.y : doc.x))) : null;
    },
    previewArea: (recipe, context) => {
      const prepared = {
        ...recipe,
        previewArea:
          recipe.previewArea ??
          (game.system.id==='pf2e'?catalogSpell(recipe.id)?.area:null) ??
          (recipe.itemUuid?.startsWith("Compendium.pf2e.spells-srd.")
            ? catalogSpell(recipe.itemUuid.split(".").at(-1))?.area
            : null),
      };
      if (
        !prepared.previewArea &&
        !recipe.stages.some((s) => s.kind === "template")
      )
        return null;
      return createCanvasPreviewArea(prepared, context, {
        canvas,
        DocumentClass: CONFIG.MeasuredTemplate.documentClass,
        TemplateClass: CONFIG.MeasuredTemplate.objectClass,
        userId: game.user.id,
        randomId: foundry.utils.randomID,
      });
    },
    sequence: () => new Sequence({ moduleName: ID }),
    endEffects: (filters) => Sequencer.EffectManager.endEffects(filters),
    endSounds: (filters) => Sequencer.SoundManager.endSounds(filters),
    // Sequencer synchronizes playback and loads media on each receiving client.
    // Waiting for every client here can stall the rolling user's animation.
    preloadSounds: files => Sequencer.Preloader.preload(files,false),
    motion: async (stage, context, { preview, session }) => {
      const data = {
        type: "motion",
        sceneId: canvas.scene?.id,
        userId: game.user.id,
        session,
        sender: clientId,
        sourceId: context.source.id,
        tokenId: stage.destination.id,
        targetId: stage.motionTarget?.id ?? context.targets?.[0]?.id,
        stage,
      };
      // Send only portable stage settings; placeables contain cyclic references.
      data.stage = { ...stage };
      delete data.stage.destination;
      delete data.stage.origin;
      delete data.stage.endpoint;
      delete data.stage.motionTarget;
      // A standalone remote stage already has resolved delay and duration.
      data.stage.afterStage = "";
      if (!preview) game.socket.emit(`module.${ID}`, data);
      return receiveMotion(data, { strict: true });
    },
    stopMotion: async () => {
      motions.stop(game.user.id, { prefix: true });
      game.socket.emit(`module.${ID}`, {
        type: "stop",
        userId: game.user.id,
        sender: clientId,
      });
    },
    onTrace: () => {
      if (app?.workspace?.page === "activity") app.workspace.render();
    },
  });
  runtime.refreshCatalog();
  if (['pf2e','sf2e','dnd5e'].includes(game.system.id)) {
    persistentStates = new PersistentStates({
      ...(game.system.id==='sf2e'?sfStateHost:game.system.id==='dnd5e'?dndStateHost:{}),
      clientId,
      ready: () => Boolean(canvas.ready && environment().ready),
      sceneId: () => canvas.scene?.id,
      tokens: () => canvas.tokens?.placeables ?? [],
      recipes,
      catalog: () => runtime.getCatalog(),
      state: (kind) => game.settings.get(ID, game.system.id==='sf2e'?sfSettingKey(kind):game.system.id==='dnd5e'?dndSettingKey(kind):kind === "condition" ? "conditionCatalog" : "effectCatalog"),
      visibility: () => ({ isGM: game.user.isGM, secretConditions: ['pf2e','sf2e'].includes(game.system.id)&&game.settings.get(game.system.id, "metagame_secretCondition") === true }),
      gridSize: () => canvas.grid?.size ?? 100,
      gridDistance: () => canvas.scene?.grid?.distance ?? 5,
      sequence: () => new Sequence({ moduleName: ID }),
      end: (name) => Sequencer.EffectManager.endEffects({ name }, false),
      retainFx:(stage,{session})=>allowsTokenFx(localQuality())?optionalFx.retain(stage,{session,userId:`state:${clientId}`}):undefined,
      budget:()=>stateBudget(localQuality()),
      stopFx:session=>optionalFx.stop({session}),
      body:{add:(...a)=>conditionBody?.add(...a),remove:(...a)=>conditionBody?.remove(...a)},
      trace: (status, detail) => runtime.trace(status, detail),
    });
    for (const hook of ["createActiveEffect","updateActiveEffect","deleteActiveEffect","createItem", "updateItem", "deleteItem", "updateActor", "createToken", "updateToken", "deleteToken", "refreshToken", "canvasReady", "updateWorldTime", "updateCombat", "deleteCombat", "updateUser"])
      Hooks.on(hook, () => persistentStates.schedule());
    Hooks.on("preCreateSequencerEffect", (data) => persistentStates.accepts(data.name) ? undefined : false);
    Hooks.on("createSequencerEffect", (effect) => {
      queueMicrotask(() => {
        if (!persistentStates.accepts(effect.data?.name))
          void Sequencer.EffectManager.endEffects({ effects: [effect] }, false);
      });
    });
    Hooks.on("updateSetting", (setting) => {
      if (String(setting.key ?? setting.id ?? "").startsWith(`${game.system.id}.`) || String(setting.key ?? setting.id ?? "").startsWith(`${ID}.`)) persistentStates.schedule();
    });
    persistentStates.schedule();
  }
  game.modules.get(ID).api = {
    open,
    recipes,
    catalog: () => clone(runtime.getCatalog()),
    activity: () => clone(runtime.log),
    spells: () => ({ source: clone(game.system.id==='sf2e'?SF2E_SOURCE:game.system.id==='dnd5e'?DND5E_SOURCE:PF2E_SOURCE), spells: clone(game.system.id==='sf2e'?sfEntries('spell'):game.system.id==='dnd5e'?dndEntries('spell'):game.system.id==='pf2e'?PF2E_SPELLS:[]) }),
    feats: () => ({ source: clone(game.system.id==='sf2e'?SF2E_SOURCE:game.system.id==='dnd5e'?DND5E_SOURCE:PF2E_FEAT_SOURCE), feats: clone(game.system.id==='sf2e'?sfEntries('feat'):game.system.id==='dnd5e'?dndEntries('feat'):game.system.id==='pf2e'?PF2E_FEATS:[]) }),
    actions: () => ({ source: clone(game.system.id==='sf2e'?SF2E_SOURCE:PF2E_ACTION_CATALOG.source), actions: clone(game.system.id==='sf2e'?sfEntries('action'):game.system.id==='pf2e'?PF2E_ACTION_CATALOG.entries:[]) }),
    features: () => ({ source: clone(game.system.id==='sf2e'?SF2E_SOURCE:PF2E_FEATURE_CATALOG.source), features: clone(game.system.id==='sf2e'?sfEntries('feature'):game.system.id==='pf2e'?PF2E_FEATURE_CATALOG.entries:[]) }),
    weapons: () => ({ source: clone(game.system.id==='sf2e'?SF2E_SOURCE:game.system.id==='dnd5e'?DND5E_SOURCE:PF2E_WEAPON_SOURCE), weapons: clone(game.system.id==='sf2e'?sfEntries('weapon'):game.system.id==='dnd5e'?dndEntries('weapon'):game.system.id==='pf2e'?PF2E_WEAPONS:[]) }),
    items:()=>({source:clone(DND5E_SOURCE),items:clone(game.system.id==='dnd5e'?dndEntries('item'):[])}),
    conditions: () => ({ source: clone(game.system.id==='sf2e'?SF2E_SOURCE:game.system.id==='dnd5e'?DND5E_SOURCE:PF2E_STATE_SOURCE), conditions: clone(game.system.id==='sf2e'?sfEntries('condition'):game.system.id==='dnd5e'?dndEntries('condition'):game.system.id==='pf2e'?PF2E_CONDITIONS:[]) }),
    effects: () => ({ source: clone(game.system.id==='sf2e'?SF2E_SOURCE:game.system.id==='dnd5e'?DND5E_SOURCE:PF2E_STATE_SOURCE), effects: clone(game.system.id==='sf2e'?sfEntries('effect'):game.system.id==='dnd5e'?dndEntries('effect'):game.system.id==='pf2e'?PF2E_EFFECTS:[]) }),
    refreshPersistent: () => persistentStates?.reconcile(),
    // id, saved recipe name, or a recipe object (e.g. from resolve()).
    async play(id, context = manualContext()) {
      const recipe = findRecipe(id);
      if (!recipe) throw Error(`Unknown Animater recipe: ${id?.id ?? id}`);
      const source = sourceFor(context);
      return runtime.play(recipe, {
        ...context,
        source,
        targets: context.targets ?? [],
        area: context.area ?? (context.template ? eventArea({ ...context, source }) : undefined),
      });
    },
    resolve: (input) => clone(resolveEvent(eventFrom(input))) ?? null,
    handles(input) {
      if (input?.documentName !== "Item") return Boolean(resolveEvent(eventFrom(input)));
      return ["use", "attack", "damage", "template"].some(type => resolveEvent({ type, item: input, actor: input.actor }));
    },
    preview: async (id) => {
      const r = findRecipe(id);
      if (!r) throw Error("Unknown recipe.");
      return runtime.play(r, manualContext(), { preview: true });
    },
    stop: () => runtime.stop(),
  };
  registerAATakeover({
    enabled: () => acceptsEvents() && aaTakeover(),
    resolve: resolveEvent,
    context: () => ({ systemId: game.system.id, userId: game.user.id, twoe: ["pf2e", "sf2e"].includes(game.system.id) ? twoeEvent : null }),
  });
  registerSpellArsenal();
  if (["pf2e","sf2e"].includes(game.system.id)) {
    Hooks.on("createChatMessage", (message) => {
      void dispatch((game.system.id==="sf2e"?sf2eEvent:pf2eEvent)(message, game.user.id));
    });
    Hooks.on("createItem", (item, _options, userId) => {
      if (
        userId !== game.user.id ||
        !["effect", "condition"].includes(item.type) ||
        !item.actor
      )
        return;
      // Document-linked custom layers belong to the lifecycle reconciler.
      if (matchRecipe(recipes().filter(r => r.lifecycle === "document"), { type: "effect", systemId:game.system.id, item })) return;
      void dispatch({
        id: `effect:${item.uuid}`,
        type: "effect",
        systemId:game.system.id,
        item,
        actor: item.actor,
      });
    });
  }
  if (game.system.id === "dnd5e") {
    Hooks.on("dnd5e.rollAttackV2", (rolls, data) => {
      void dispatch(dnd5eEvent("attack", data?.subject, { rolls }));
    });
    Hooks.on("dnd5e.rollDamageV2", (rolls, data) => {
      void dispatch(dnd5eEvent("damage", data?.subject, { rolls }));
    });
    Hooks.on("dnd5e.postUseActivity", (activity, _config, results) => {
      void dispatch(dnd5eEvent("use", activity, { results }));
    });
    Hooks.on("createActiveEffect", (effect, _options, userId) => {
      if (userId !== game.user.id || effect.disabled || effect.isSuppressed) return;
      if(matchRecipe(recipes().filter(r=>r.lifecycle==='document'),{type:'effect',systemId:'dnd5e',item:effect}))return;
      const actor =
        effect.parent?.documentName === "Actor"
          ? effect.parent
          : effect.parent?.actor;
      if (actor)
        void dispatch({
          id: `effect:${effect.uuid}`,
          type: "effect",
          item: effect,
          actor,
        });
    });
  }
  for (const hook of ["createMeasuredTemplate", "createRegion"])
    Hooks.on(hook, (template, _options, userId) => {
      if (userId !== game.user.id) return;
      if (template.parent?.id && template.parent.id !== canvas.scene?.id) return;
      const run = async () => {
        let item, actor, activity, source, tokenId, castRank;
        if (["pf2e","sf2e"].includes(game.system.id)) {
          const flags = template.flags?.[game.system.id];
          const origin = flags?.origin;
          // Native Regions retain the card that placed them. Its item getter
          // reconstructs embedded/heightened spells; a temporary UUID alone
          // can no longer resolve after a scroll or wand has been used.
          const message = template.message ?? game.messages?.get(flags?.messageId);
          item = template.item ?? message?.item ??
            (origin?.uuid ? await fromUuid(origin.uuid) : null);
          if (item?.type === "consumable" && item.actor)
            item = item.embeddedSpell ?? item;
          actor = item?.actor ?? message?.speakerActor ?? message?.actor;
          if (!actor && origin?.actor) {
            const document = await fromUuid(origin.actor);
            if (document?.documentName === "Actor") actor = document;
          }
          if (message?.speaker?.scene === template.parent?.id)
            tokenId = message.speaker.token;
          castRank = Number(origin?.castRank ?? item?.rank) || undefined;
          if (!item && (origin?.uuid || flags?.messageId))
            runtime.trace("Skipped", `${template.name ?? "Placed area"}: source item could not be resolved.`);
        }
        if (game.system.id === "dnd5e") {
          const uuid =
            template.flags?.dnd5e?.activity ?? template.flags?.dnd5e?.origin;
          const origin = typeof uuid === "string" ? await fromUuid(uuid) : null;
          item =
            origin?.item ?? (origin?.documentName === "Item" ? origin : null);
          actor = origin?.actor;
          activity=origin?.item?origin:null;
          const tokenUuid=template.flags?.dnd5e?.origin;
          const token=typeof tokenUuid==='string'?await fromUuid(tokenUuid):null;
          if(token?.documentName==='Token')source=token;
        }
        if (item)
          await dispatch({
            id: `area:${template.uuid}`,
            type: "template",
            systemId:game.system.id,
            activity,
            activityId:activity?.id??activity?._id,
            activityName:activity?.name,
            spellLevel:template.flags?.dnd5e?.spellLevel,
            source,
            tokenId,
            castRank,
            item,
            actor: actor ?? item.actor,
            template,
            sceneId: template.parent?.id,
          });
      };
      if (acceptsEvents())
        void run().catch((error) => runtime.trace("Blocked", error.message));
    });
});
Hooks.on("sequencer.ready", () => {
  // JB2A registers in this hook; wait until all synchronous listeners finish.
  queueMicrotask(() => {
    runtime?.refreshCatalog();
    persistentStates?.schedule();
    app?.workspace?.render();
  });
});
Hooks.on("getSceneControlButtons", (controls) => {
  if (controls.tokens?.tools)
    controls.tokens.tools.animater = {
      name: "animater",
      title: "Animater",
      icon: "fas fa-wand-magic-sparkles",
      button: true,
      visible: game.user.isGM,
      onChange: () => open(),
    };
});
Hooks.on("updateUser", (user) => {
  if (user.id === game.user.id && !user.isGM) {
    void app?.close();
    ui.controls?.render();
  }
});
