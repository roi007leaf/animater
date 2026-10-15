import test from "node:test";
import assert from "node:assert/strict";
import {
  PF2E_SPELLS,
  spellRecipe,
  useCatalogSpell,
} from "../scripts/spell-catalog.mjs";
import { SOUND_PROFILES } from "../scripts/spell-sounds.mjs";
import {
  PF2E_FEATS,
  featRecipe,
  useCatalogFeat,
} from "../scripts/feat-catalog.mjs";
import { PF2E_WEAPONS, weaponRecipe, useCatalogWeapon } from "../scripts/weapon-catalog.mjs";
import { ABILITY_SOUND_PROFILES } from "../data/ability-sounds.mjs";
import { PF2E_CONDITIONS, PF2E_EFFECTS, useStateEntry, stateRecipe } from "../scripts/state-catalog.mjs";
import {dndEntries,dndRecipe,useDndEntry} from '../scripts/dnd5e-catalog.mjs';
import {sfEntries,sfRecipe,useSfEntry} from '../scripts/sf2e-catalog.mjs';
import {Workspace} from '../scripts/workspace.mjs';
import {previewFilters} from '../scripts/token-fx-preview.mjs';
import {MediaLibrary} from '../scripts/media-library.mjs';
globalThis.requestAnimationFrame = (fn) =>
  setTimeout(() => fn(performance.now()), 5);
globalThis.cancelAnimationFrame = clearTimeout;
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
function assertAttenuatedAudio(calls,profiles,userVolume){
 const candidates=Object.values(profiles).flatMap(cues=>cues.flatMap(cue=>cue.candidates));
 let file,checked=0;
 for(const call of calls){
  if(call[0]==='file')file=call[1];
  if(call[0]!=='volume')continue;
  const candidate=candidates.find(c=>c.file===file);assert.ok(candidate,`Installed candidate ${file}`);
  assert.ok(Math.abs(call[1]-userVolume*(candidate.gain??1))<1e-8,`${file}: user volume times measured gain`);checked++;
 }
 assert.ok(checked>0,'Audible optional cues were compiled');
}
async function boot(system, extraKeys = []) {
  let renderedApp;
  const hooks = new Map(),
    settings = new Map(),
    menus = [],
    bindings = [],
    calls = [],
    sockets = new Map();
  const register = (name, fn) => {
    hooks.set(name, [...(hooks.get(name) ?? []), fn]);
  };
  globalThis.Hooks = { on: register, once: register };
  class App {
    async _onRender() {}
    async close() {
      calls.push("close");
    }
    render() {
      calls.push("open");
      renderedApp = this;
      return this;
    }
  }
  globalThis.foundry = {
    applications: {
      api: {
        ApplicationV2: App,
        HandlebarsApplicationMixin: (base) => class extends base {},
        DialogV2: { confirm: async () => true },
      },
    },
    utils: { saveDataToFile: () => {}, randomID: () => "previewtemplate1" },
  };
  const actor = { id: "a", documentName: "Actor" };
  const source = { id: "t", actor, isOwner: true, controlled: true };
  const target = { id: "target" };
  const point = (x, y) => ({
    x,
    y,
    set(x, y) {
      this.x = x;
      this.y = y;
    },
  });
  for (const [i, token] of [source, target].entries()) {
    token.visible = true;
    token.center = { x: 100 + i * 200, y: 100 };
    token.document = { x: 50 + i * 200, y: 50, testUserPermission: () => true };
    token.mesh = {
      position: point(100 + i * 200, 100),
      rotation: 0,
      scale: point(1, 1),
    };
  }
  globalThis.game = {
    system: {
      id: system,
      title: system,
      version: system === "sf2e" ? "1.5.1" : system === "pf2e" ? "8.5.1" : "6.0.5",
    },
    user: { id: "u", isGM: true, targets: new Set([target]) },
    modules: new Map([
      ["animater", { socket: true }],
      ["sequencer", { active: true, version: "4.2.3" }],
      ["jb2a_patreon", { active: true }],
    ]),
    settings: {
      register: (_id, k, d) => settings.set(k, d.default),
      registerMenu: (_id, _k, m) => menus.push(m),
      get: (_id, k) => settings.get(k),
      set: async (_id, k, v) => settings.set(k, v),
    },
    keybindings: { register: (_id, _k, d) => bindings.push(d) },
    users: new Map([["u", { id: "u", isGM: true }]]),
    socket: {
      on: (channel, fn) => sockets.set(channel, fn),
      emit: (channel, data) => calls.push(["socket", channel, data]),
    },
  };
  globalThis.canvas = {
    ready: true,
    scene: { id: "s", grid: { distance: 5 } },
    grid: { size: 100 },
    templates: {
      addChild(object) {
        calls.push(["preview-template", object.document]);
        object.parent = this;
      },
      removeChild() {
        calls.push(["remove-preview-template"]);
      },
    },
    tokens: {
      placeables: [source],
      controlled: [source],
      get: (id) => (id === "t" ? source : id === "target" ? target : null),
    },
  };
  globalThis.CONFIG = {
    MeasuredTemplate: {
      documentClass: class {
        constructor(data, options) {
          Object.assign(this, data);
          this.parent = options.parent;
        }
      },
      objectClass: class {
        constructor(document) {
          this.document = document;
        }
        async draw() {}
        destroy() {
          this.destroyed = true;
          calls.push(["destroy-preview-template"]);
        }
      },
    },
  };
  const keys = [
    "jb2a.impact.001.orange",
    "jb2a.fire_bolt.orange",
    "jb2a.fireball.explosion.orange",
    ...extraKeys,
  ];
  globalThis.Sequencer = {
    Preloader: {
      preload: async (files,showProgress)=>calls.push(['preload',files,showProgress]),
      preloadForClients: async (files,showProgress)=>calls.push(['preloadForClients',files,showProgress]),
    },
    SoundManager: { endSounds: async () => calls.push("stopSounds") },
    Database: {
      entryExists: () => true,
      getPathsUnder: () => keys,
      getAllFileEntries: (key) => [key + ".webm"],
    },
    EffectManager: {
      endEffects: async () => {
        calls.push("stop");
      },
    },
  };
  globalThis.Sequence = class {
    sound() {
      calls.push(["sound"]);
      return this.effect();
    }
    effect() {
      const e = new Proxy(
        {},
        {
          get:
            (_, k) =>
            (...args) => {
              calls.push([k, ...args]);
              return e;
            },
        },
      );
      return e;
    }
    async play(options) {
      calls.push(["play", options]);
    }
  };
  globalThis.ui = {
    notifications: { warn: (message) => calls.push(["warning", message]) },
    controls: { render: () => calls.push("controls") },
  };
  const item = {
    uuid: "Actor.a.Item.i",
    documentName: "Item",
    name: "Ignition",
    actor,
  };
  globalThis.fromUuid = async (uuid) =>
    uuid === item.uuid
      ? item
      : uuid === "Scene.s.Token.target"
        ? { object: target }
        : null;
  await import(`../scripts/main.mjs?system=${system}&test=${Date.now()}`);
  const fire = async (name, ...args) => {
    for (const fn of hooks.get(name) ?? []) await fn(...args);
  };
  await fire("init");
  await fire("ready");
  return {
    fire,
    hooks,
    settings,
    menus,
    bindings,
    calls,
    source,
    target,
    actor,
    item,
    api: game.modules.get("animater").api,
    sockets,
    app: () => renderedApp,
  };
}

test('workspace Token Magic preview uses loaded filters without importing loose vendor modules',async t=>{
 const f=await boot('pf2e');
 class Point {set(){}}
 class Filter {
  constructor(params){assert.equal(params.dummy,true);Object.assign(this,params);}
  apply(){}
  normalizeTMParams(){for(const spec of Object.values(this.animated)){assert.equal(typeof this.anime[spec.animType],'function');spec.active=true;}}
 }
 const native={togglePreset(){},getPresets:()=>[],filterTypes:{fire:Filter}};
 t.mock.method(Workspace.prototype,'render',()=>{});
 t.mock.method(Workspace.prototype,'syncPreviewTokens',()=>{});
 const previous={TokenMagic:globalThis.TokenMagic,PIXI:globalThis.PIXI};
 Object.assign(globalThis,{TokenMagic:native,PIXI:{Point,Matrix:class {}}});
 t.after(()=>{for(const [key,value] of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
 game.modules.set('tokenmagic',{active:true,version:'0.8.4'});
 const root={addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[]};
 f.api.open();f.app().element={querySelector:()=>root};await f.app()._onRender({},{});
 const scene={dataset:{},querySelectorAll:()=>[]};
 const preview=await f.app().workspace.host.createTokenFxPreview(scene,{stages:[]});
 assert.equal(preview.tokenMagic,native);
 const [filter]=previewFilters({params:[{filterType:'fire',time:0,animated:{time:{animType:'move',speed:.002}}}]},{},{...preview,sprite:{}});
 filter.previewAnime.animate(500);assert.equal(filter.time,1);
 assert.equal(Object.hasOwn(filter,'placeableId'),false);
 preview.stop();await f.app().close();
});

test('actual workspace host reuses discovery after closing and reopening; explicit Refresh still rescans',async t=>{
 const f=await boot('pf2e');let browses=0;
 game.modules.set('soundfxlibrary',{active:true,version:'1'});
 foundry.applications.apps={FilePicker:{implementation:{browse:async()=>{browses++;return {dirs:[],files:['modules/soundfxlibrary/new-audio.ogg']};}}}};
 t.mock.method(Workspace.prototype,'render',()=>{});t.mock.method(Workspace.prototype,'syncPreviewTokens',()=>{});
 const root={addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[]};
 f.api.open();f.app().element={querySelector:()=>root};await f.app()._onRender({},{});
 const first=new MediaLibrary(f.app().workspace);await first.load();assert.equal(browses,1);
 assert.ok(first.items.some(e=>e.file.endsWith('/new-audio.ogg')));await f.app().close();
 f.api.open();f.app().element={querySelector:()=>root};await f.app()._onRender({},{});
 const second=new MediaLibrary(f.app().workspace);assert.equal(second.loaded,true);await second.load();assert.equal(browses,1);
 await second.load(true);assert.equal(browses,2);
 game.modules.get('soundfxlibrary').active=false;assert.equal(f.app().workspace.host.mediaCatalog(),null);
 await f.app().close();
});

test('native SF2e bootstrap routes native chat, area placement, isolated API and optional sounds',async()=>{
 const laser=sfEntries('weapon').find(e=>e.name==='Laser Pistol'),plasma=sfEntries('weapon').find(e=>e.name==='Plasma Cannon');
 const keys=[laser,plasma].flatMap(e=>e.variants.flatMap(v=>sfRecipe(e,v.id,{motion:false,sounds:null}).stages.flatMap(s=>s.assets))),f=await boot('sf2e',keys);
 f.settings.set('recipes',{schema:1,recipes:[]});f.settings.set('sf2eWeaponCatalog',{...useSfEntry(useSfEntry({},laser.id),plasma.id),motion:false,sound:true});
 for(const kind of ['spells','feats','weapons','conditions','effects'])assert.ok(f.api[kind]()[kind].every(e=>e.systemId==='sf2e'));
 assert.equal(f.api.spells().spells.length,432);assert.equal(f.api.weapons().weapons.length,192);assert.equal(f.api.items().items.length,0);assert.ok(!f.hooks.has('dnd5e.rollAttackV2'));
 await assert.rejects(f.api.play(dndRecipe(dndEntries('spell')[0]).id),/Unknown/);
 game.modules.set('psfx',{active:true});Object.assign(f.item,{type:'weapon',name:laser.name,system:{range:40,group:'laser'},_stats:{compendiumSource:laser.uuid}});
 await f.fire('createChatMessage',{id:'sf-laser',author:{id:'u'},item:f.item,actor:f.actor,isRoll:true,flags:{sf2e:{context:{type:'attack-roll',target:{token:'Scene.s.Token.target'}},origin:{uuid:f.item.uuid}}},speaker:{scene:'s',token:'t'}});await new Promise(resolve=>setTimeout(resolve,600));
 assert.equal(f.api.activity().filter(c=>c.status==='Played').length,1,JSON.stringify(f.api.activity()));assert.ok(f.calls.some(c=>c[0]==='file'&&c[1].startsWith('jb2a.lasershot.')));assert.ok(f.calls.some(c=>c[0]==='sound'));
 Object.assign(f.item,{name:plasma.name,system:{range:40,group:'plasma'},_stats:{compendiumSource:plasma.uuid}});
 await f.fire('createChatMessage',{id:'sf-area-card',author:{id:'u'},item:f.item,actor:f.actor,isRoll:false,flags:{sf2e:{context:{type:'area-fire'},origin:{uuid:f.item.uuid}}},speaker:{scene:'s',token:'t'}});await settle();assert.equal(f.api.activity().filter(c=>c.status==='Played').length,1);
 await f.fire('createRegion',{uuid:'Scene.s.Region.sf-area',documentName:'Region',parent:{id:'s'},flags:{sf2e:{origin:{uuid:f.item.uuid}}},shapes:[{type:'circle',x:300,y:100,radius:200}]},{},'u');await new Promise(resolve=>setTimeout(resolve,650));
 assert.equal(f.api.activity().filter(c=>c.status==='Played').length,2,JSON.stringify(f.api.activity()));assert.ok(f.calls.some(c=>c[0]==='size'&&c[1].width>=400));
 await f.fire('canvasTearDown');
});
test('SF effect-backed conditions remain local, use condition settings and stop after native expiry',async()=>{
 const entry=sfEntries('condition').find(e=>e.name==='Suppressed'),f=await boot('sf2e',sfRecipe(entry).stages.flatMap(s=>s.assets));
 f.settings.set('recipes',{schema:1,recipes:[]});f.settings.set('sf2eConditionCatalog',useSfEntry({},entry.id));
 const effect={id:'suppressed',uuid:'Actor.a.Item.suppressed',type:'effect',name:entry.name,sourceId:entry.uuid,actor:f.actor,system:{expired:false}};
 f.actor.items=[effect];f.source.document.uuid='Scene.s.Token.t';await f.fire('createItem',effect,{},'remote');await f.api.refreshPersistent();await settle();
 assert.equal(f.calls.filter(c=>c[0]==='play').length,1);assert.ok(f.calls.find(c=>c[0]==='play')[1].local);assert.ok(f.calls.some(c=>c[0]==='persist'));assert.equal(f.settings.get('automatic'),false);
 effect.isExpired=true;await f.fire('updateWorldTime',200);await f.api.refreshPersistent();assert.ok(f.calls.some(c=>c==='stop'));await f.fire('canvasTearDown');
});
test('native D&D catalog API and roll hooks isolate systems and avoid use/attack double playback',async()=>{
 const entry=dndEntries('spell').find(e=>e.name==='Eldritch Blast'&&e.edition==='2024'),r=dndRecipe(entry,undefined,{motion:false}),f=await boot('dnd5e',r.stages.flatMap(s=>s.assets));
 f.settings.set('recipes',{schema:1,recipes:[]});f.settings.set('dnd5eSpellCatalog',{...useDndEntry({},entry.id),motion:false,sound:false});
 Object.assign(f.item,{type:'spell',name:entry.name,_stats:{compendiumSource:entry.uuid}});
 const subject={id:entry.variants[0].activityId,name:entry.variants[0].activityName,item:f.item,actor:f.actor,getUsageToken:()=>({id:'t',parent:{id:'s'}})};
 assert.equal(f.api.spells().spells.length,659);assert.ok(f.api.feats().feats.every(e=>e.id.startsWith('dnd5e-')));assert.equal(f.api.items().items.length,566);
 await assert.rejects(f.api.play('animater-spell-'+PF2E_SPELLS[0].id),/Unknown/);
 await f.fire('dnd5e.postUseActivity',subject,{},{});await settle();assert.equal(f.calls.filter(c=>c[0]==='play').length,0);
 await f.fire('dnd5e.rollAttackV2',[{options:{}}],{subject});await settle();assert.equal(f.calls.filter(c=>c[0]==='play').length,1);
 await f.fire('dnd5e.rollDamageV2',[{options:{}}],{subject});await settle();assert.equal(f.calls.filter(c=>c[0]==='play').length,1);
 assert.equal(f.settings.get('automatic'),false);await f.fire('canvasTearDown');
 const pf=await boot('pf2e');assert.equal(pf.api.items().items.length,0);assert.ok(pf.api.spells().spells.every(e=>!e.id.startsWith('dnd5e-')));await pf.fire('canvasTearDown');
});

test('native D&D healing uses the damage hook, and region placement uses activity/source provenance',async()=>{
 const heal=dndEntries('spell').find(e=>e.name==='Cure Wounds'&&e.edition==='2024'),fire=dndEntries('spell').find(e=>e.name==='Fireball'&&e.edition==='2024');
 const f=await boot('dnd5e',[heal,fire].flatMap(e=>dndRecipe(e,undefined,{motion:false}).stages.flatMap(s=>s.assets)));
 f.settings.set('recipes',{schema:1,recipes:[]});f.settings.set('dnd5eSpellCatalog',{...useDndEntry(useDndEntry({},heal.id),fire.id),motion:false,sound:false});
 const item={...f.item,type:'spell',name:heal.name,_stats:{compendiumSource:heal.uuid}},activity={id:heal.variants[0].activityId,name:heal.variants[0].activityName,type:'heal',item,actor:f.actor,getUsageToken:()=>({id:'t',parent:{id:'s'}})};
 await f.fire('dnd5e.postUseActivity',activity,{},{});await settle();assert.equal(f.calls.filter(c=>c[0]==='play').length,0);
 await f.fire('dnd5e.rollDamageV2',[{options:{}}],{subject:activity});await settle();assert.equal(f.calls.filter(c=>c[0]==='play').length,1);
 const areaItem={...item,name:fire.name,_stats:{compendiumSource:fire.uuid}},areaActivity={id:fire.variants[0].activityId,name:fire.variants[0].activityName,item:areaItem,actor:f.actor,target:{template:{type:'sphere',size:20}}};
 globalThis.fromUuid=async uuid=>uuid==='Actor.a.Item.fire.Activity.cast'?areaActivity:uuid==='Scene.s.Token.t'?{documentName:'Token',object:f.source}:null;
 await f.fire('createRegion',{uuid:'Scene.s.Region.fire',documentName:'Region',parent:{id:'s'},flags:{dnd5e:{activity:'Actor.a.Item.fire.Activity.cast',origin:'Scene.s.Token.t'}},shapes:[{type:'circle',x:300,y:100,radius:400}]},{},'u');await settle();
 assert.equal(f.calls.filter(c=>c[0]==='play').length,2);assert.ok(f.calls.some(c=>c[0]==='size'&&c[1].width>=800));await f.fire('canvasTearDown');
});

test('native D&D transferred conditions reconcile suppression/removal with one-shot automation off',async()=>{
 const entry=dndEntries('condition').find(e=>e.statusId==='poisoned'),f=await boot('dnd5e',dndRecipe(entry).stages.flatMap(s=>s.assets));
 f.settings.set('recipes',{schema:1,recipes:[]});f.settings.set('dnd5eConditionCatalog',useDndEntry({},entry.id));f.source.document.uuid='Scene.s.Token.t';
 const effect={uuid:'Actor.a.Item.i.ActiveEffect.e',active:true,statuses:new Set(['poisoned']),target:f.actor,parent:{documentName:'Item',actor:f.actor}};
 f.actor.appliedEffects=[effect];await f.fire('createActiveEffect',effect,{},'remote');await f.api.refreshPersistent();await settle();
 assert.equal(f.calls.filter(c=>c[0]==='play').length,1);assert.ok(f.calls.some(c=>c[0]==='persist'));assert.ok(f.calls.find(c=>c[0]==='play')[1].local);
 effect.isSuppressed=true;await f.fire('updateActiveEffect',effect,{}, {},'remote');await f.api.refreshPersistent();assert.ok(f.calls.some(c=>c==='stop'));
 effect.isSuppressed=false;await f.api.refreshPersistent();await settle();assert.equal(f.calls.filter(c=>c[0]==='play').length,2);
 f.actor.appliedEffects=[];await f.fire('deleteActiveEffect',effect,{},'remote');await f.api.refreshPersistent();assert.ok(f.calls.filter(c=>c==='stop').length>=2);await f.fire('canvasTearDown');
});

test("native persistent catalogs respond to remote condition changes and time expiry while one-shot automation is off", async () => {
  const fear=PF2E_CONDITIONS.find(e=>e.slug==="frightened"),bless=PF2E_EFFECTS.find(e=>e.name==="Spell Effect: Bless"),f=await boot("pf2e",[...fear.assets,...bless.assets]);
  f.settings.set("recipes",{schema:1,recipes:[]});f.settings.set("conditionCatalog",useStateEntry({},fear.id));f.settings.set("effectCatalog",useStateEntry({},bless.id));
  const condition={id:"fear",uuid:"Actor.a.Item.fear",type:"condition",name:fear.name,slug:fear.slug,active:true,actor:f.actor,system:{value:{isValued:true,value:1}}};
  const effect={id:"bless",uuid:"Actor.a.Item.bless",sourceId:bless.uuid,type:"effect",name:bless.name,actor:f.actor,system:{expired:false}};
  f.actor.items=[condition,effect];f.source.document.uuid="Scene.s.Token.t";
  await f.fire("createItem",condition,{},"another-user");await f.api.refreshPersistent();await settle();
  assert.equal(f.calls.filter(c=>c[0]==="play").length,2);assert.ok(f.calls.filter(c=>c[0]==="play").every(c=>c[1].local));
  assert.equal(f.settings.get("automatic"),false);assert.equal(f.api.conditions().conditions.length,43);assert.equal(f.api.effects().effects.length,2962);
  const count=f.calls.filter(c=>c[0]==="play").length;await f.fire("updateItem",condition,{}, {},"another-user");await f.api.refreshPersistent();assert.equal(f.calls.filter(c=>c[0]==="play").length,count);
  const originIndex=f.calls.findIndex(c=>c[0]==="origin"&&c[1]===condition.uuid),name=f.calls[originIndex-1][1];f.actor.items=[effect];await f.fire("deleteItem",condition,{},"another-user");await f.api.refreshPersistent();
  assert.equal(f.hooks.get("preCreateSequencerEffect")[0]({name}),false);
  effect.isExpired=true;await f.fire("updateWorldTime",200);await f.api.refreshPersistent();
  assert.ok(f.calls.filter(c=>c==="stop").length>=2);await f.fire("canvasTearDown");
});

test("document-linked API previews are finite and table playback cannot orphan a condition animation", async()=>{
  const fear=PF2E_CONDITIONS.find(e=>e.slug==="frightened"),recipe=stateRecipe(fear),f=await boot("pf2e",fear.assets);
  await assert.rejects(f.api.play(recipe.id),/Native documents control/);
  const preview=f.api.preview(recipe.id);await settle();assert.ok(!f.calls.some(c=>c[0]==="persist"));await f.api.stop();await preview;
});

test("active feat cards play independently of spell and saved automation; passive and generic attacks do not", async () => {
  const feat = PF2E_FEATS.find((f) => f.slug === "sudden-charge"),
    recipe = featRecipe(feat, { motion: false });
  const f = await boot("pf2e", recipe.stages.flatMap((s) => s.assets));
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("featCatalog", { ...useCatalogFeat({}, feat.id), motion: false });
  Object.assign(f.item, {
    type: "feat", name: feat.name,
    _stats: { compendiumSource: recipe.itemUuid },
  });
  const card = {
    id: "feat-card", author: { id: "u" }, item: f.item,
    isRoll: false, speaker: { token: "t", scene: "s" }, flags: {},
  };
  await f.fire("createChatMessage", card);
  await settle();
  assert.ok(f.calls.some((c) => c[0] === "play"));
  assert.ok(f.calls.some((c) => c[0] === "file" && recipe.stages.some((s) => s.assets.includes(c[1]))));
  assert.equal(f.settings.get("automatic"), false);
  assert.equal(f.settings.get("spellCatalog").enabled, false);
  assert.equal(f.api.recipes().length, 0);
  await f.api.stop();
  const count = f.calls.filter((c) => c[0] === "play").length;
  for (const message of [
    { ...card, id: "feat-other-author", author: { id: "remote" } },
    { ...card, id: "feat-blind", blind: true },
    { ...card, id: "passive", item: { ...f.item, name: "Toughness", _stats: {} } },
    { ...card, id: "unrelated-strike", item: { ...f.item, type: "weapon", name: "Sudden Charge", _stats: {} },
      isRoll: true, flags: { pf2e: { context: { type: "attack-roll" } } } },
    { ...card, id: "feat-roll", isRoll: true, flags: { pf2e: { context: { type: "attack-roll" } } } },
  ]) {
    await f.fire("createChatMessage", message);
    await settle();
  }
  assert.equal(f.calls.filter((c) => c[0] === "play").length, count);
  await f.fire("createChatMessage", card);
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, count, "same chat card is deduplicated");
  f.settings.set("featCatalog", { ...f.settings.get("featCatalog"), enabled: false });
  await f.fire("createChatMessage", { ...card, id: "feat-paused" });
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, count);
});

test("PF2e action cards play through the Actions catalog and Sneak Attack damage plays its Features rider", async () => {
  const { PF2E_ACTION_CATALOG, PF2E_FEATURE_CATALOG } = await import("../scripts/ability-catalog.mjs");
  const rage = PF2E_ACTION_CATALOG.entries.find((e) => e.slug === "rage"), sneak = PF2E_FEATURE_CATALOG.entries.find((e) => e.slug === "sneak-attack");
  const keys = [rage, sneak].flatMap((e) => PF2E_ACTION_CATALOG.recipe(e, { motion: false }).stages.flatMap((s) => s.assets));
  const f = await boot("pf2e", keys);
  assert.deepEqual(f.settings.get("actionCatalog"), PF2E_ACTION_CATALOG.normalizeState());
  assert.deepEqual(f.settings.get("featureCatalog"), PF2E_FEATURE_CATALOG.normalizeState());
  assert.equal(f.api.actions().actions.length, PF2E_ACTION_CATALOG.entries.length);
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("featCatalog", { ...useCatalogFeat({}, PF2E_FEATS[0].id), motion: false });
  Object.assign(f.item, { type: "action", name: "Rage", system: { slug: "rage" }, _stats: { compendiumSource: rage.uuid } });
  const card = { id: "rage-card", author: { id: "u" }, item: f.item, isRoll: false, speaker: { token: "t", scene: "s" }, flags: {} };
  await f.fire("createChatMessage", card);
  await settle();
  assert.ok(!f.calls.some((c) => c[0] === "play"), "an enabled feat catalog does not play actions");
  f.settings.set("actionCatalog", { ...PF2E_ACTION_CATALOG.use({}, rage.id), motion: false });
  await f.fire("createChatMessage", { ...card, id: "rage-card-2" });
  await settle();
  assert.ok(f.calls.some((c) => c[0] === "play"));
  assert.ok(f.calls.some((c) => c[0] === "file" && PF2E_ACTION_CATALOG.recipe(rage, { motion: false }).stages.some((s) => s.assets.includes(c[1]))));
  await f.api.stop();
  const before = f.calls.filter((c) => c[0] === "play").length;
  f.settings.set("featureCatalog", { ...PF2E_FEATURE_CATALOG.use({}, sneak.id), motion: false });
  Object.assign(f.item, { type: "weapon", name: "Dagger", system: { traits: { value: ["agile", "finesse"] } }, _stats: {} });
  await f.fire("createChatMessage", { id: "sneak-damage", author: { id: "u" }, item: f.item, isRoll: true, isDamageRoll: true, speaker: { token: "t", scene: "s" },
    flags: { pf2e: { context: { type: "damage-roll", options: [] }, origin: { uuid: f.item.uuid }, dice: [{ slug: "sneak-attack", enabled: true, ignored: false }], modifiers: [] } } });
  await settle();
  assert.ok(f.calls.filter((c) => c[0] === "play").length > before, "Sneak Attack rider played on the damage roll");
  assert.ok(f.calls.some((c) => c[0] === "file" && PF2E_FEATURE_CATALOG.recipe(sneak, { motion: false }).stages.some((s) => s.assets.includes(c[1]))));
  await f.api.stop();
});

test("feat API exposes active data and respects effects-only table and local preview settings", async () => {
  const feat = PF2E_FEATS.find((f) => f.slug === "sudden-charge"),
    recipe = featRecipe(feat, { motion: false });
  const f = await boot("pf2e", recipe.stages.flatMap((s) => s.assets));
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("featCatalog", { enabled: false, motion: false });
  game.modules.get("animater").socket = false;
  const data = f.api.feats();
  assert.equal(data.feats.length, PF2E_FEATS.length);
  data.feats[0].name = "mutated API copy";
  assert.notEqual(f.api.feats().feats[0].name, "mutated API copy");
  await f.api.play(recipe.id);
  const preview = f.api.preview(recipe.id);
  await settle();
  assert.ok(f.calls.some((c) => c[0] === "play" && c[1].local));
  assert.ok(f.calls.some((c) => c[0] === "play" && !c[1].local));
  assert.ok(!f.calls.some((c) => c[0] === "socket" && c[2].type === "motion"));
  await f.api.stop();
  await preview;
  assert.equal(f.api.recipes().length, 0);
});

test("reaction and free-action feat cards activate only their own catalog recipes", async () => {
  const feats = ["reaction", "free"].map((type) => PF2E_FEATS.find((f) => f.actionType === type));
  const recipes = feats.map((feat) => featRecipe(feat, { motion: false }));
  const f = await boot("pf2e", recipes.flatMap((r) => r.stages.flatMap((s) => s.assets)));
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("featCatalog", { enabled: true, independent: true, motion: false, scope: "all" });
  for (const [i, feat] of feats.entries()) {
    f.calls.length = 0;
    await f.fire("createChatMessage", {
      id: `native-${feat.actionType}`, author: { id: "u" }, isRoll: false,
      item: { ...f.item, type: "feat", name: feat.name, _stats: { compendiumSource: recipes[i].itemUuid } },
      speaker: { token: "t", scene: "s" }, flags: {},
    });
    await settle();
    assert.ok(f.calls.some((c) => c[0] === "play"), `${feat.actionType} own card plays`);
    const keys = recipes[i].stages.flatMap((s) => s.assets);
    assert.ok(f.calls.some((c) => c[0] === "file" && keys.includes(c[1])));
    await f.api.stop();
  }
});

test("PF2e native rolls use opt-in built-ins while saved and disabled overrides retain priority", async () => {
  const record = PF2E_SPELLS.find((s) => s.name === "Frostbite");
  const builtIn = spellRecipe(record);
  const f = await boot(
    "pf2e",
    builtIn.stages.flatMap((s) => s.assets),
  );
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [] });
  Object.assign(f.item, {
    type: "spell",
    name: record.name,
    _stats: { compendiumSource: builtIn.itemUuid },
  });
  const message = {
    id: "catalog-off",
    author: { id: "u" },
    item: f.item,
    isRoll: true,
    isDamageRoll: true,
    speaker: { token: "t", scene: "s" },
    flags: { pf2e: { context: { type: "damage-roll" } } },
  };
  await f.fire("createChatMessage", message);
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 0);
  f.settings.set("spellCatalog", { enabled: true, excluded: [] });
  await f.fire("createChatMessage", { ...message, id: "catalog-on" });
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 1);
  assert.ok(
    f.calls.some(
      (c) => c[0] === "file" && c[1] === builtIn.stages[0].assets[0],
    ),
  );
  await f.api.stop();
  const custom = {
    ...builtIn,
    stages: [
      { ...builtIn.stages[0], assets: ["jb2a.impact.001.orange"], delay: 0 },
    ],
  };
  f.settings.set("recipes", { schema: 1, recipes: [custom] });
  await f.fire("createChatMessage", { ...message, id: "custom-on" });
  await settle();
  assert.equal(
    f.calls.filter((c) => c[0] === "file").at(-1)[1],
    "jb2a.impact.001.orange",
  );
  const before = f.calls.filter((c) => c[0] === "play").length;
  f.settings.set("recipes", {
    schema: 1,
    recipes: [{ ...custom, enabled: false }],
  });
  await f.fire("createChatMessage", { ...message, id: "custom-disabled" });
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, before);
});

test("native PF2e attack hooks and API previews include optional pack audio and stop it", async () => {
  const record = PF2E_SPELLS.find((s) => s.name === "Ray of Frost"),
    base = spellRecipe(record);
  const f = await boot(
    "pf2e",
    base.stages.flatMap((s) => s.assets),
  );
  game.modules.set("psfx", { active: true });
  const paths = new Map();
  for (const cues of Object.values(SOUND_PROFILES))
    for (const c of cues)
      for (const e of c.candidates)
        if (e.module === "psfx")
          paths.set(e.key, [...(paths.get(e.key) ?? []), e.file]);
  const original = Sequencer.Database.getAllFileEntries;
  Sequencer.Database.getAllFileEntries = (k) => paths.get(k) ?? original(k);
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("automatic", false);
  f.settings.set("spellCatalog", {
    ...useCatalogSpell({}, record.id),
    motion: false,
    sound: true,
    soundVolume: 0.25,
  });
  Object.assign(f.item, {
    type: "spell",
    name: record.name,
    _stats: { compendiumSource: base.itemUuid },
  });
  const message = {
    id: "sound-attack",
    author: { id: "u" },
    item: f.item,
    isRoll: true,
    isCheckRoll: true,
    speaker: { token: "t", scene: "s" },
    flags: {
      pf2e: {
        context: {
          type: "attack-roll",
          target: { token: "Scene.s.Token.target" },
        },
      },
    },
  };
  await f.fire("createChatMessage", message);
  await new Promise((r) => setTimeout(r, 650));
  assert.ok(f.calls.some((c) => c[0] === "sound"));
  assert.ok(
    f.calls.some((c) => c[0] === "file" && /ray-of-frost.*ogg/.test(c[1])),
  );
  assertAttenuatedAudio(f.calls,SOUND_PROFILES,.25);
  assert.ok(f.calls.filter((c) => c[0] === "play").every((c) => !c[1].local));
  await f.api.stop();
  assert.ok(f.calls.includes("stopSounds"));
  f.calls.length = 0;
  const preview = f.api.preview(base.id);
  await new Promise((r) => setTimeout(r, 650));
  assert.ok(f.calls.some((c) => c[0] === "sound"));
  assert.ok(f.calls.filter((c) => c[0] === "play").every((c) => c[1].local));
  await f.api.stop();
  await preview;
  f.calls.length = 0;
  game.modules.get("psfx").active = false;
  await f.fire("createChatMessage", { ...message, id: "no-pack-attack" });
  await settle();
  assert.ok(f.calls.some((c) => c[0] === "play"));
  assert.ok(!f.calls.some((c) => c[0] === "sound"));
  await f.api.stop();
});
test("weapon effect size setting reaches native attacks and local canvas previews immediately", async () => {
  const f = await boot("pf2e");
  const recipe = { id: "weapon-size-setting", name: "Weapon size", enabled: true, trigger: "attack", match: "Dagger", weaponMode: "melee",
    stages: [{ kind: "impact", assets: ["jb2a.impact.001.orange"], scale: .8, duration: 100 },
      { kind: "aura", subject: "targets", assets: ["jb2a.impact.001.orange"], scale: 1, duration: 100 }] };
  f.settings.set("recipes", { schema: 1, recipes: [recipe] });
  f.settings.set("automatic", true);
  Object.assign(f.item, { type: "weapon", name: "Dagger", system: { range: null } });
  const assertSizes = factor => {
    const sizes = f.calls.filter(c => c[0] === "size").map(c => c[1].width);
    assert.equal(sizes.length, 2, JSON.stringify(f.api.activity()));
    for (const [i, scale] of [.8, 1].entries())
      assert.ok(Math.abs(sizes[i] - 100 * scale * factor) < 1e-8, `weapon scale ${factor}: stage ${i} has width ${sizes[i]}`);
  };
  for (const factor of [1, 3, .5]) {
    f.settings.set("weaponScale", factor);
    f.calls.length = 0;
    await f.fire("createChatMessage", { id: `size-${factor}`, author: { id: "u" }, item: f.item, isRoll: true,
      speaker: { token: "t", scene: "s" }, flags: { pf2e: { context: { type: "attack-roll" } } } });
    await settle();
    assertSizes(factor);
  }
  f.calls.length = 0;
  f.settings.set("weaponScale", 3);
  await f.api.preview(recipe.id);
  assertSizes(3);
  assert.ok(f.calls.filter(c => c[0] === "play").every(c => c[1].local));
  assert.deepEqual(recipe.stages.map(s => s.scale), [.8, 1], "saved recipe scales remain authored values");
});

test("Apotheosis Knife native melee and thrown Strike rolls dispatch their catalog animations", async () => {
  const weapon = PF2E_WEAPONS.find(w => w.slug === "apotheosis-knife");
  const variants = weapon.modes.map(m => weaponRecipe(weapon, m.mode));
  const f = await boot("pf2e", variants.flatMap(r => r.stages.flatMap(s => s.assets)));
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("weaponCatalog", { enabled: true, independent: true, scope: "all", preferCatalog: true, motion: true, sound: false });
  Object.assign(f.item, { type: "weapon", name: weapon.name, system: { slug: weapon.slug, baseItem: "dagger", range: null, traits: { value: weapon.traits } },
    _stats: { compendiumSource: variants[0].itemUuid } });
  game.user.targets.clear();
  for (const mode of ["melee", "thrown"]) {
    f.calls.length = 0;
    const context = { type: "attack-roll", altUsage: null, identifier: `i.apotheosis-knife.${mode === "melee" ? "melee" : "ranged"}`,
      options: mode === "melee" ? ["item:melee"] : ["item:ranged", "item:thrown", "item:thrown-melee"],
      target: { token: "Scene.s.Token.target" }, outcome: "criticalSuccess" };
    // Native Strike item lookup can be unavailable when the create hook runs.
    // The origin UUID resolves the owned base weapon, so roll options must
    // preserve the usage independently of that base item's melee range.
    await f.fire("createChatMessage", { id: `apotheosis-${mode}`, author: { id: "u" }, item: null, isRoll: true,
      speaker: { token: "t", scene: "s" }, flags: { pf2e: { context, origin: { uuid: f.item.uuid, type: "weapon" } } } });
    await new Promise(resolve => setTimeout(resolve, 650));
    assert.ok(f.calls.some(c => c[0] === "play"), JSON.stringify(f.api.activity()));
    const primary = variants.find(r => r.weaponMode === mode).stages.find(s => !["motion", "sound"].includes(s.kind));
    assert.ok(f.calls.some(c => c[0] === "file" && primary.assets.includes(c[1])), `${mode} footage from native roll options`);
    assert.ok(f.calls.some(c => c[0] === "socket" && c[2].type === "motion"), `${mode} gesture`);
    await f.api.stop();
  }
});

test("native PF2e weapon rolls choose actual usage and play audio without waiting for remote preloads", async t => {
  const weapon = PF2E_WEAPONS.find(w => w.slug === "dagger-pistol");
  const recipes = weapon.modes.map(m => weaponRecipe(weapon, m.mode, { motion: false }));
  const f = await boot("pf2e", recipes.flatMap(r => r.stages.flatMap(s => s.assets)));
  t.after(() => f.api.stop());
  // One connected client's preload can stall indefinitely. Sequencer's native
  // playback handles remote loading; it must not gate the rolling user's Strike.
  Sequencer.Preloader.preloadForClients = () => new Promise(() => {});
  game.modules.set("ggg", { active: true });
  const paths = new Map();
  for (const cues of Object.values(ABILITY_SOUND_PROFILES)) for (const cue of cues) for (const c of cue.candidates)
    if (c.module === "ggg") paths.set(c.key, [...(paths.get(c.key) ?? []), c.file]);
  const original = Sequencer.Database.getAllFileEntries;
  Sequencer.Database.getAllFileEntries = k => paths.get(k) ?? original(k);
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("weaponCatalog", { ...useCatalogWeapon({}, weapon.id), motion: false, soundVolume: .2 });
  Object.assign(f.item, { type: "weapon", name: "Renamed combination weapon", system: { range: 30 }, _stats: { compendiumSource: recipes[0].itemUuid } });
  game.user.targets.clear();
  for (const [i, mode] of ["ranged", "melee", "thrown"].entries()) {
    f.calls.length = 0;
    const context = { type: "attack-roll", target: { token: "Scene.s.Token.target" }, ...(mode !== "ranged" ? { altUsage: mode } : {}) };
    const message = { id: `weapon-${mode}`, author: { id: "u" }, item: f.item, isRoll: true, speaker: { token: "t", scene: "s" }, flags: { pf2e: { context } } };
    await f.fire("createChatMessage", message);
    await new Promise(r => setTimeout(r, 650));
    const recipe = recipes.find(r => r.weaponMode === mode), primary = recipe.stages.find(s => s.kind !== "motion");
    assert.ok(f.calls.some(c => c[0] === "file" && primary.assets.includes(c[1])), `${mode} native footage`);
    assert.ok(f.calls.some(c => c[0] === "play"), `${mode} playback starts with sound enabled`);
    assert.ok(f.calls.some(c => c[0] === "sound"), `${mode} active audio pack`);
    assert.ok(f.calls.some(c => c[0] === "preload"), `${mode} local sound preparation`);
    assertAttenuatedAudio(f.calls,ABILITY_SOUND_PROFILES,.2);
    assert.ok(f.calls.filter(c => c[0] === "play").every(c => !c[1].local));
    await f.api.stop();
    f.calls.length = 0;
    await f.fire("createChatMessage", message); await settle();
    assert.equal(f.calls.filter(c => c[0] === "play").length, 0, "duplicate roll ignored");
  }
  assert.equal(f.settings.get("automatic"), false);
  assert.equal(f.api.recipes().length, 0);
  assert.equal(f.api.weapons().weapons.length, PF2E_WEAPONS.length);
  f.calls.length = 0;
  await f.fire("createChatMessage", { id: "weapon-damage", author: { id: "u" }, item: f.item, isRoll: true, isDamageRoll: true, flags: {}, speaker: { token: "t", scene: "s" } });
  await settle(); assert.equal(f.calls.filter(c => c[0] === "play").length, 0);
  game.modules.get("ggg").active = false;
  game.user.targets.add(f.target);
  const preview = f.api.preview(recipes[1].id);
  await new Promise(r => setTimeout(r, 650));
  assert.ok(f.calls.some(c => c[0] === "play" && c[1].local));
  assert.ok(!f.calls.some(c => c[0] === "sound"));
  await f.api.stop(); await preview;
});

test("native PF2e Fist roll uses worn invested Handwraps with independent catalog automation", async () => {
  const weapon=PF2E_WEAPONS.find(w=>w.slug==='handwraps-of-mighty-blows');
  const recipe=weaponRecipe(weapon,'melee',{motion:false});
  const f=await boot('pf2e',recipe.stages.flatMap(s=>s.assets));
  const actor=f.source.actor;
  actor.itemTypes={weapon:[{type:'weapon',name:'My wraps',isEquipped:true,isInvested:true,system:{category:'unarmed',traits:{otherTags:['handwraps-of-mighty-blows']}},_stats:{compendiumSource:recipe.itemUuid}}]};
  Object.assign(f.item,{type:'weapon',name:'Fist',actor,system:{slug:'basic-unarmed',category:'unarmed',group:'brawling',damage:{damageType:'bludgeoning'},traits:{value:['unarmed']}}});
  delete f.item._stats;delete f.item.flags;
  f.settings.set('recipes',{schema:1,recipes:[]});
  f.settings.set('weaponCatalog',{...useCatalogWeapon({},weapon.id),motion:false,sound:false});
  const message={id:'wrapped-fist',author:{id:'u'},actor,item:f.item,isRoll:true,speaker:{token:'t',scene:'s'},flags:{pf2e:{context:{type:'attack-roll',target:{token:'Scene.s.Token.target'}}}}};
  await f.fire('createChatMessage',message);await new Promise(r=>setTimeout(r,650));
  assert.ok(f.calls.some(c=>c[0]==='file'&&/^jb2a\.unarmed_strike\./.test(c[1])));
  assert.equal(f.calls.filter(c=>c[0]==='play').length,1);
  await f.api.stop();f.calls.length=0;
  await f.fire('createChatMessage',message);await settle();
  assert.equal(f.calls.filter(c=>c[0]==='play').length,0,'Duplicate roll suppressed');
  actor.itemTypes.weapon[0].isInvested=false;
  await f.fire('createChatMessage',{...message,id:'uninvested-fist'});await settle();
  assert.equal(f.calls.filter(c=>c[0]==='play').length,0,'Uninvested wraps do not supply the binding');
});

test("native active-feat cards and previews now honor sound toggle and volume", async () => {
  const feat = PF2E_FEATS.find(f => f.slug === "double-slice"), recipe = featRecipe(feat, { motion: false });
  const f = await boot("pf2e", recipe.stages.flatMap(s => s.assets));
  game.modules.set("psfx", { active: true });
  const paths = new Map();
  for (const cues of Object.values(ABILITY_SOUND_PROFILES)) for (const cue of cues) for (const c of cue.candidates)
    if (c.module === "psfx") paths.set(c.key, [...(paths.get(c.key) ?? []), c.file]);
  const original = Sequencer.Database.getAllFileEntries;
  Sequencer.Database.getAllFileEntries = k => paths.get(k) ?? original(k);
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("featCatalog", { ...useCatalogFeat({}, feat.id), motion: false, sound: true, soundVolume: .15 });
  Object.assign(f.item, { type: "feat", name: feat.name, _stats: { compendiumSource: recipe.itemUuid } });
  await f.fire("createChatMessage", { id: "feat-audio", author: { id: "u" }, item: f.item, isRoll: false, flags: {}, speaker: { token: "t", scene: "s" } });
  await new Promise(r => setTimeout(r, 650));
  assert.equal(f.calls.filter(c => c[0] === "sound").length, 2);
  assertAttenuatedAudio(f.calls,ABILITY_SOUND_PROFILES,.15);
  await f.api.stop(); f.calls.length = 0;
  f.settings.set("featCatalog", { ...f.settings.get("featCatalog"), sound: false });
  const preview = f.api.preview(recipe.id); await new Promise(r => setTimeout(r, 650));
  assert.ok(f.calls.some(c => c[0] === "play" && c[1].local));
  assert.ok(!f.calls.some(c => c[0] === "sound"));
  await f.api.stop(); await preview;
});

test("canvas selection refreshes preview for the local user without triggering playback", async () => {
  const f = await boot("pf2e");
  f.api.open();
  const updates = [];
  f.app().workspace = { syncPreviewTokens: (options) => updates.push(options) };
  await f.fire("controlToken", f.source, true);
  await f.fire("targetToken", { id: "u" }, f.target, true);
  assert.equal(updates.length, 2);
  await f.fire("targetToken", { id: "remote" }, f.target, false);
  assert.equal(updates.length, 2);
  await f.fire("updateToken", f.source.document, {
    texture: { src: "new.webp" },
  });
  await f.fire("canvasTearDown");
  assert.deepEqual(updates.at(-1), { clear: true });
  await f.fire("canvasReady");
  assert.equal(updates.length, 5);
  assert.equal(
    f.calls.filter(
      (c) => c[0] === "play" || (c[0] === "socket" && c[2].type === "motion"),
    ).length,
    0,
  );
});

test("plug-and-play catalog receives native rolls with custom automation off and routes only selected spells", async () => {
  const frost = PF2E_SPELLS.find((s) => s.name === "Frostbite"),
    shield = PF2E_SPELLS.find((s) => s.name === "Shield");
  const native = spellRecipe(frost);
  const f = await boot(
    "pf2e",
    native.stages.flatMap((s) => s.assets),
  );
  const custom = {
    ...native,
    name: "Custom frost",
    stages: [
      { ...native.stages[0], assets: ["jb2a.impact.001.orange"], delay: 0 },
    ],
  };
  f.settings.set("recipes", {
    schema: 1,
    recipes: [custom, spellRecipe(shield)],
  });
  Object.assign(f.item, {
    type: "spell",
    name: frost.name,
    _stats: { compendiumSource: native.itemUuid },
  });
  const message = {
    id: "legacy-paused",
    author: { id: "u" },
    item: f.item,
    isRoll: true,
    isDamageRoll: true,
    speaker: { token: "t", scene: "s" },
    flags: { pf2e: { context: { type: "damage-roll" } } },
  };
  f.settings.set("spellCatalog", {
    enabled: true,
    motion: false,
    excluded: [],
  });
  await f.fire("createChatMessage", message);
  await settle();
  assert.equal(
    f.calls.filter((c) => c[0] === "play").length,
    0,
    "legacy global Off remains Off",
  );
  const state = { ...useCatalogSpell({}, frost.id), motion: false };
  f.settings.set("spellCatalog", state);
  await f.fire("createChatMessage", { ...message, id: "ready-frost" });
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 1);
  assert.equal(
    f.calls.find((c) => c[0] === "file")[1],
    native.stages[0].assets[0],
  );
  assert.equal(f.settings.get("automatic"), false);
  await f.api.stop();
  const count = f.calls.filter((c) => c[0] === "play").length;
  await f.fire("createChatMessage", {
    ...message,
    id: "other-spell",
    item: {
      ...f.item,
      name: shield.name,
      _stats: { compendiumSource: spellRecipe(shield).itemUuid },
    },
    isRoll: false,
    isDamageRoll: false,
    flags: {},
  });
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, count);
  f.settings.set("spellCatalog", {
    ...state,
    selected: [],
    customized: [frost.id],
  });
  await f.fire("createChatMessage", { ...message, id: "chosen-custom" });
  await settle();
  assert.equal(
    f.calls.filter((c) => c[0] === "file").at(-1)[1],
    "jb2a.impact.001.orange",
  );
  assert.equal(f.settings.get("recipes").recipes[0], custom);
  await f.api.stop();
});
test("catalog API honors effects-only setting for table and private preview without requiring motion socket", async () => {
  const record = PF2E_SPELLS.find((s) => s.name === "Frostbite"),
    r = spellRecipe(record);
  const f = await boot(
    "pf2e",
    r.stages.flatMap((s) => s.assets),
  );
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("spellCatalog", {
    enabled: false,
    excluded: [],
    motion: false,
  });
  game.modules.get("animater").socket = false;
  await f.api.play(r.id);
  await f.api.preview(r.id);
  assert.ok(f.calls.some((c) => c[0] === "play" && c[1].local === true));
  assert.ok(f.calls.some((c) => c[0] === "play" && c[1].local !== true));
  assert.ok(!f.calls.some((c) => c[0] === "socket" && c[2].type === "motion"));
  assert.equal(f.target.mesh.position.x, 300);
  assert.equal(f.target.mesh.position.y, 100);
});
test("PF2e area preview API places native spell-sized local template and removes it after full playback", async () => {
  const r = spellRecipe(PF2E_SPELLS.find((s) => s.name === "Fireball"));
  r.stages = r.stages
    .filter((s) => s.kind === "template")
    .map((s) => ({ ...s, delay: 0, duration: 100 }));
  const f = await boot(
    "pf2e",
    r.stages.flatMap((s) => s.assets),
  );
  f.settings.set("recipes", { schema: 1, recipes: [r] });
  await f.api.preview(r.id);
  const doc = f.calls.find((c) => c[0] === "preview-template")[1];
  assert.deepEqual(
    [doc.t, doc.x, doc.y, doc.distance],
    ["circle", 300, 100, 20],
  );
  assert.equal(
    f.calls.filter((c) => c[0] === "destroy-preview-template").length,
    1,
  );
  assert.ok(f.calls.filter((c) => c[0] === "play").every((c) => c[1].local));
  assert.equal(f.calls.filter((c) => c[0] === "socket").length, 0);
});
test("token motion preview stays local; table sends portable scene-scoped payload and stop", async () => {
  const f = await boot("pf2e");
  const r = f.api.recipes().find((r) => r.id === "casting-flourish");
  r.stages = [{ ...r.stages[0], duration: 100, delay: 0 }];
  f.settings.set("recipes", { schema: 1, recipes: [r] });
  await f.api.preview(r.id);
  assert.equal(f.calls.filter((c) => c[0] === "socket").length, 0);
  await f.api.play(r.id, { source: f.source, targets: [] });
  const payload = f.calls.find((c) => c[0] === "socket")[2];
  assert.equal(payload.sceneId, "s");
  assert.equal(payload.tokenId, "t");
  assert.equal(payload.stage.destination, undefined);
  assert.ok(payload.sender);
  assert.doesNotThrow(() => JSON.stringify(payload));
  const receive = f.sockets.get("module.animater");
  receive({ ...payload, sender: "remote", sceneId: "other" });
  await settle();
  assert.equal(f.source.mesh.position.y, 100);
  game.users.set("denied", { id: "denied", isGM: false });
  f.source.document.testUserPermission = () => false;
  receive({ ...payload, sender: "remote", userId: "denied" });
  await settle();
  assert.equal(f.source.mesh.position.y, 100);
  await f.api.stop();
  assert.equal(f.calls.filter((c) => c[0] === "socket").at(-1)[2].type, "stop");
});

test('optional provider bootstrap previews token filters locally and transports only authorized token stages',async()=>{
  const f=await boot('pf2e'),events=[];
  try {
    f.source.document.object=f.source;f.target.document.object=f.target;
    game.i18n={localize:key=>key};
    game.modules.set('tokenmagic',{active:true,version:'0.8.4'});
    game.modules.set('fxmaster',{active:true,version:'8.4.1'});
    const preset={name:'Glow',library:'tmfx-main',params:[{filterId:'Glow',filterType:'glow'}]};
    globalThis.TokenMagic={getPresets:library=>library==='tmfx-main'?[preset]:[],
      togglePreset:async(token,p,opts)=>events.push(['token',token.id,p.params[0].filterId,opts.action,opts.transient])};
    globalThis.FXMASTER={api:{effects:{play:async data=>events.push(['scene','add',data]),stop:async data=>events.push(['scene','remove',data])}}};
    CONFIG.fxmaster={particleEffects:{embers:{label:'Embers',parameters:{density:{type:'range',min:0,max:1,value:.2}}}},filterEffects:{}};
    canvas.scene.getFlag=()=>({});
    const r=f.api.recipes()[0];r.stages=[{kind:'tokenfx',fxPreset:'Glow',subject:'targets',duration:100},
      {kind:'scenefx',fxType:'embers',duration:100}, {kind:'cast',duration:100,assets:['jb2a.impact.001.orange']}];
    f.settings.set('recipes',{schema:1,recipes:[r]});
    await f.api.preview(r.id);
    assert.equal(f.calls.filter(c=>c[0]==='socket').length,0);
    assert.deepEqual(events.filter(e=>e[0]==='token').map(e=>[e[1],e[3],e[4]]),[['target','add',true],['target','remove',true]]);
    assert.equal(events.filter(e=>e[0]==='scene').length,0);
    events.length=0;
    await f.api.play(r.id,{source:f.source,targets:[f.target]});
    const payload=f.calls.find(c=>c[0]==='socket'&&c[2].type==='tokenfx')[2];
    assert.equal(payload.sceneId,'s');assert.equal(payload.tokenId,'target');
    assert.equal(payload.stage.destination,undefined);assert.doesNotThrow(()=>JSON.stringify(payload));
    assert.equal(events.filter(e=>e[0]==='scene'&&e[1]==='add').length,1);
    assert.equal(events.filter(e=>e[0]==='scene'&&e[1]==='remove').length,1);
    const receive=f.sockets.get('module.animater'),before=events.length;
    receive({...payload,sender:'remote',sceneId:'other'});
    game.users.set('denied',{id:'denied',isGM:false});f.source.document.testUserPermission=()=>false;
    receive({...payload,sender:'remote',userId:'denied'});await settle();
    assert.equal(events.length,before);
    receive({...payload,sender:'remote'});await settle();
    assert.equal(events.at(-1)[3],'add');
    receive({type:'stop',userId:'u',sender:'remote'});await settle();
    assert.equal(events.at(-1)[3],'remove');
    game.modules.get('tokenmagic').active=false;game.modules.get('fxmaster').active=false;
    const plays=f.calls.filter(c=>c[0]==='play').length;
    await f.api.play(r.id,{source:f.source,targets:[f.target]});
    assert.ok(f.calls.filter(c=>c[0]==='play').length>plays);
    assert.ok(f.api.activity().some(e=>e.status==='Skipped' && /unavailable/.test(e.detail)));
    await f.api.stop();
  } finally {delete globalThis.TokenMagic;delete globalThis.FXMASTER;}
});

test("compiled path motion resolves links before transport and preserves selected target", async () => {
  const f = await boot("pf2e");
  const recipe = { id: "linked-path", name: "Linked path", trigger: "manual", stages: [
    { kind: "motion", stageId: "ready", motion: "pulse", subject: "source", duration: 100, delay: 0 },
    { kind: "motion", stageId: "rush", motion: "rush", subject: "source", afterStage: "ready", timingAnchor: "end", startOffset: 20, duration: 100, distance: 8, perSquare: 50, targetSelection: "last" },
  ] };
  f.settings.set("recipes", { schema: 1, recipes: [recipe] });
  await f.api.play(recipe.id, { source: f.source, targets: [f.target] });
  const payload = f.calls.filter(c => c[0] === "socket" && c[2].type === "motion").at(-1)[2];
  assert.equal(payload.targetId, f.target.id);
  assert.equal(payload.stage.afterStage, "");
  assert.equal(payload.stage.delay, 120);
  assert.equal(payload.stage.duration, 200);
  assert.equal(payload.stage.motionTarget, undefined);
  assert.doesNotThrow(() => JSON.stringify(payload));
  assert.equal(f.source.mesh.position.x, 100);
});

test("cached pre-socket server manifest explains blocked PF2e attacks while private motion preview works", async () => {
  const f = await boot("pf2e");
  Object.assign(game.modules.get("animater"), {
    socket: false,
    version: "0.1.0",
  });
  const r = f.api.recipes().find((r) => r.id === "casting-flourish");
  Object.assign(r, { trigger: "attack", match: "ignition", enabled: true });
  r.stages = [{ ...r.stages[0], duration: 100, delay: 0 }];
  f.settings.set("recipes", { schema: 1, recipes: [r] });
  f.settings.set("automatic", true);
  await f.fire("createChatMessage", {
    id: "stale-manifest-attack",
    author: { id: "u" },
    item: f.item,
    speaker: { token: "t", scene: "s" },
    flags: { pf2e: { context: { type: "attack-roll" } } },
  });
  await settle();
  assert.equal(f.api.activity()[0].status, "Blocked");
  assert.match(
    f.api.activity()[0].detail,
    /Stop and start the Foundry server instance/,
  );
  assert.equal(
    f.calls.filter((c) => c[0] === "play" || c[0] === "socket").length,
    0,
  );
  await f.api.preview(r.id);
  assert.equal(f.calls.filter((c) => c[0] === "socket").length, 0);
  assert.equal(f.source.mesh.position.y, 100);
  // A newly launched server sends its new manifest to reloaded clients.
  Object.assign(game.modules.get("animater"), {
    socket: true,
    version: "0.2.0",
  });
  await f.api.play(r.id, { source: f.source, targets: [] });
  assert.equal(f.calls.find((c) => c[0] === "socket")[2].type, "motion");
  assert.equal(f.source.mesh.position.y, 100);
});
test("PF2e bootstrap: GM-only settings, source-token safety, effect/region hooks", async () => {
  const f = await boot("pf2e");
  assert.equal(f.settings.get("automatic"), false);
  assert.equal(f.menus[0].restricted, true);
  // Players open their own Studio (recipes pending GM approval); configuration stays GM-only.
  assert.equal(f.bindings[0].restricted, false);
  const controls = { tokens: { tools: {} } };
  await f.fire("getSceneControlButtons", controls);
  assert.equal(controls.tokens.tools.animater.visible, true);
  game.user.isGM = false;
  const playerControls = { tokens: { tools: {} } };
  await f.fire("getSceneControlButtons", playerControls);
  assert.equal(playerControls.tokens.tools.animater.visible, true);
  game.user.isGM = true;
  const ember = f.api.recipes()[0];
  ember.stages.forEach((s) => (s.delay = 0));
  f.settings.set("recipes", { schema: 1, recipes: [ember] });
  const message = {
    id: "m",
    author: { id: "u" },
    item: f.item,
    speaker: { token: "t", scene: "s" },
    flags: { pf2e: { context: { type: "attack-roll" } } },
  };
  await f.fire("createChatMessage", message);
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 0);
  f.settings.set("automatic", true);
  // Native PF2e records the roll target in context; current targeting may have
  // been cleared by the time createChatMessage fires.
  game.user.targets.clear();
  message.flags.pf2e.context.target = { token: "Scene.s.Token.target" };
  await f.fire("createChatMessage", message);
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 1);
  await f.fire("createChatMessage", message);
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 1);
  await f.fire("createChatMessage", {
    ...message,
    id: "wrong-scene",
    speaker: { token: "t", scene: "other" },
  });
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 1);
  assert.ok(f.hooks.has("createItem"));
  assert.ok(f.hooks.has("createRegion"));
  f.api.open();
  game.user.isGM = false;
  // A player saving their own recipes updates their user: the Studio stays open.
  await f.fire("updateUser", game.user, { flags: { animater: { playerRecipes: { schema: 1, recipes: [] } } } });
  assert.ok(!f.calls.includes("close"));
  // Losing the GM role re-renders the window for its new permissions.
  await f.fire("updateUser", game.user, { role: 1 });
  assert.ok(f.calls.includes("close"));
});
test("PF2e 8.5 placed circle Region triggers the saved area recipe at its native size", async () => {
  const f = await boot("pf2e");
  f.item.name = "Fireball";
  f.item.type = "spell";
  f.item.system = { area: { type: "burst", value: 20 } };
  const recipe = f.api.recipes().find((r) => r.id === "nova");
  f.settings.set("recipes", { schema: 1, recipes: [recipe] });
  f.settings.set("automatic", true);
  // shapeDataFromEffectArea / placeRegionFromItem in installed PF2e 8.5.1.
  const region = {
    uuid: "Scene.s.Region.fireball",
    documentName: "Region",
    parent: { id: "s" },
    flags: { pf2e: { areaShape: "burst", origin: { uuid: f.item.uuid } } },
    shapes: [{ type: "circle", x: 600, y: 300, radius: 400 }],
  };
  await f.fire("createRegion", region, {}, "other");
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 0);
  await f.fire("createRegion", region, {}, "u");
  await settle();
  assert.equal(
    f.calls.filter((c) => c[0] === "play").length,
    1,
    JSON.stringify(f.api.activity()),
  );
  assert.deepEqual(f.calls.find((c) => c[0] === "atLocation")[1], {
    x: 600,
    y: 300,
  });
  assert.deepEqual(f.calls.find((c) => c[0] === "size")[1], {
    width: 800,
    height: "auto",
  });
  await f.fire("createRegion", region, {}, "u");
  await f.fire(
    "createRegion",
    { ...region, uuid: "Scene.other.Region.fireball", parent: { id: "other" } },
    {},
    "u",
  );
  await f.fire(
    "createRegion",
    { ...region, uuid: "Scene.s.Region.manual", flags: {} },
    {},
    "u",
  );
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 1);
});

test("PF2e 8.5 placed line Region triggers plug-and-play without saved automation", async () => {
  const record = PF2E_SPELLS.find((s) => s.name === "Lightning Bolt");
  const recipe = spellRecipe(record);
  const f = await boot("pf2e", recipe.stages.flatMap((s) => s.assets));
  Object.assign(f.item, {
    type: "spell",
    name: record.name,
    system: { area: record.area },
    _stats: { compendiumSource: recipe.itemUuid },
  });
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("spellCatalog", useCatalogSpell({}, record.id));
  assert.equal(f.settings.get("automatic"), false);
  const region = {
    uuid: "Scene.s.Region.lightning",
    documentName: "Region",
    parent: { id: "s" },
    flags: { pf2e: { areaShape: "line", origin: { uuid: f.item.uuid } } },
    shapes: [
      { type: "line", x: 150, y: 200, length: 2400, width: 100, rotation: 90 },
    ],
  };
  await f.fire("createRegion", region, {}, "u");
  await settle();
  assert.ok(
    f.calls.some((c) => c[0] === "play"),
    JSON.stringify(f.api.activity()),
  );
  const endpoint = f.calls.find((c) => c[0] === "stretchTo")[1];
  assert.ok(Math.abs(endpoint.x - 150) < 1e-8);
  assert.equal(endpoint.y, 2600);
  await f.api.stop();
});
async function grimTendrilsPlacement() {
  const record = PF2E_SPELLS.find((spell) => spell.name === "Grim Tendrils");
  const recipe = spellRecipe(record);
  const f = await boot("pf2e", recipe.stages.flatMap((stage) => stage.assets));
  Object.assign(f.item, {
    type: "spell", name: record.name, rank: 3,
    system: { area: record.area },
    _stats: { compendiumSource: recipe.itemUuid },
  });
  f.settings.set("recipes", { schema: 1, recipes: [] });
  f.settings.set("spellCatalog", useCatalogSpell({}, record.id));
  const region = {
    uuid: "Scene.s.Region.grim", documentName: "Region", parent: { id: "s" },
    flags: { pf2e: { messageId: "grim-card", areaShape: "line", origin: {
      uuid: f.item.uuid, actor: "Actor.a", castRank: 3,
    } } },
    shapes: [{ type: "line", x: 100, y: 100, length: 600, width: 100, rotation: 45 }],
  };
  return { ...f, region };
}

function assertGrimTendrilsPlayed(f, source = f.source) {
  assert.equal(f.calls.filter((call) => call[0] === "play").length, 1,
    JSON.stringify(f.api.activity()));
  assert.equal(f.calls.find((call) => call[0] === "atLocation")[1], source);
  const endpoint = f.calls.find((call) => call[0] === "stretchTo")[1];
  assert.ok(Math.abs(endpoint.x - (100 + 600 / Math.SQRT2)) < 1e-8);
  assert.ok(Math.abs(endpoint.y - (100 + 600 / Math.SQRT2)) < 1e-8);
  assert.ok(f.calls.some((call) => call[0] === "file" &&
    call[1] === "jb2a.energy_strands.range.multiple.dark_purple02.01"));
  assert.ok(f.calls.some((call) => call[0] === "file" &&
    call[1] === "jb2a.energy_strands.range.standard.dark_purple02.01"));
  assert.equal(f.calls.filter((call) => call[0] === "stretchTo").length, 2);
  // Sequencer duration uses media time; slowed wall-clock time is longer.
  assert.ok(f.calls.some((call) => call[0] === "duration" && call[1] >= 3333));
}

test("Grim Tendrils native line placement plays the complete catalog recipe without targets", async () => {
  const f = await grimTendrilsPlacement();
  game.user.targets.clear();
  await f.fire("createRegion", f.region, {}, "u");
  await settle();
  assertGrimTendrilsPlayed(f);
  await f.api.stop();
});

test("Grim Tendrils chat-card placement recovers an embedded spell absent from actor items", async () => {
  const f = await grimTendrilsPlacement();
  // Native scroll/wand cards reconstruct casting.embeddedSpell. Its temporary
  // Actor Item UUID need not resolve after the consumable has been used.
  globalThis.fromUuid = async () => null;
  game.messages = new Map([["grim-card", {
    item: f.item, speakerActor: f.actor, speaker: { token: "t", scene: "s" },
  }]]);
  await f.fire("createRegion", f.region, {}, "u");
  await settle();
  assertGrimTendrilsPlayed(f);
  await f.fire("createRegion", f.region, {}, "u");
  await settle();
  assert.equal(f.calls.filter((call) => call[0] === "play").length, 1);
  await f.api.stop();
});

test("Grim Tendrils chat-card placement uses the recorded caster among unselected actor tokens", async () => {
  const f = await grimTendrilsPlacement();
  f.source.controlled = false;
  canvas.tokens.controlled = [];
  canvas.tokens.placeables.push({ ...f.source, id: "another-caster", center: { x: 900, y: 900 } });
  game.messages = new Map([["grim-card", {
    item: f.item, speakerActor: f.actor, speaker: { token: "t", scene: "s" },
  }]]);
  await f.fire("createRegion", f.region, {}, "u");
  await settle();
  assertGrimTendrilsPlayed(f);
  await f.api.stop();
});

test("Grim Tendrils placement ignores a chat card's token from a different scene", async () => {
  const f = await grimTendrilsPlacement();
  f.source.controlled = false;
  const wrongSource = { ...f.source, actor: { id: "wrong-actor" } };
  canvas.tokens.get = () => wrongSource;
  game.messages = new Map([["grim-card", {
    item: f.item, speakerActor: f.actor, speaker: { token: "other-token", scene: "other-scene" },
  }]]);
  await f.fire("createRegion", f.region, {}, "u");
  await settle();
  assertGrimTendrilsPlayed(f);
  await f.api.stop();
});

test("Grim Tendrils placement resolves the native origin actor for an unowned source spell", async () => {
  const f = await grimTendrilsPlacement();
  delete f.item.actor;
  const resolve = globalThis.fromUuid;
  globalThis.fromUuid = async (uuid) => uuid === "Actor.a" ? f.actor : resolve(uuid);
  await f.fire("createRegion", f.region, {}, "u");
  await settle();
  assertGrimTendrilsPlayed(f);
  await f.api.stop();
});

test("a native spell area with an unresolved source reports the failure in Activity", async () => {
  const f = await grimTendrilsPlacement();
  f.region.name = "Grim Tendrils";
  globalThis.fromUuid = async () => null;
  await f.fire("createRegion", { ...f.region, parent: { id: "other-scene" } }, {}, "u");
  await settle();
  assert.equal(f.api.activity().length, 0);
  await f.fire("createRegion", f.region, {}, "u");
  await settle();
  assert.equal(f.calls.filter((call) => call[0] === "play").length, 0);
  assert.ok(f.api.activity().some((entry) => entry.status === "Skipped" &&
    entry.detail === "Grim Tendrils: source item could not be resolved."));
});

test("PF2e placed cone Region triggers directional footage with portable native clipping", async () => {
  const key = "jb2a.breath_weapons.fire.cone.orange.01", f = await boot("pf2e", [key]);
  Object.assign(f.item, { type: "spell", name: "Cone QA", system: { area: { type: "cone", value: 30 } } });
  f.settings.set("recipes", { schema: 1, recipes: [{ id: "cone-qa", name: "Cone QA", trigger: "template", enabled: true, match: "Cone QA", stages: [{ kind: "template", assets: [key], duration: 100 }] }] });
  f.settings.set("automatic", true);
  const polygons = [{ points: [300, 400, 300, 1000, 100, 800] }];
  globalThis.PIXI = { Polygon: class { constructor(points) { this.points = points; } } };
  const region = { uuid: "Scene.s.Region.cone-qa", documentName: "Region", parent: { id: "s" }, flags: { pf2e: { origin: { uuid: f.item.uuid } } }, shapes: [{ type: "cone", x: 300, y: 400, radius: 600, angle: 90, rotation: 90, polygons }] };
  await f.fire("createRegion", region, {}, "u");
  await settle();
  assert.ok(f.calls.some(c => c[0] === "play"), JSON.stringify(f.api.activity()));
  assert.ok(Math.abs(f.calls.find(c => c[0] === "stretchTo")[1].x - 300) < 1e-8);
  assert.equal(f.calls.find(c => c[0] === "stretchTo")[1].y, 1000);
  assert.deepEqual(f.calls.find(c => c[0] === "mask")[1][0].points, polygons[0].points);
  await f.api.stop();
});

test("D&D 5e bootstrap: native V2 activity hooks, no chat duplication, circular area geometry", async () => {
  const f = await boot("dnd5e");
  assert.ok(f.hooks.has("dnd5e.rollAttackV2"));
  // createChatMessage is hooked only to log the attacker for finishers; it plays nothing (no chat duplication).
  assert.ok(f.hooks.has("createChatMessage"));
  assert.ok(f.hooks.has("createActiveEffect"));
  const ember = f.api.recipes()[0];
  ember.stages.forEach((s) => (s.delay = 0));
  const nova = f.api.recipes().find((r) => r.id === "nova");
  f.settings.set("recipes", { schema: 1, recipes: [ember, nova] });
  f.settings.set("automatic", true);
  await f.fire("dnd5e.rollAttackV2", [{ total: 12 }], {
    subject: { item: f.item, actor: f.actor, name: "Attack" },
  });
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 1);
  await f.fire("dnd5e.rollAttackV2", [{ total: 12 }], { subject: null });
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 1);
  const activity = { item: { ...f.item, name: "Fireball" }, actor: f.actor };
  globalThis.fromUuid = async () => activity;
  const region = {
    uuid: "Scene.s.Region.r",
    documentName: "Region",
    parent: { id: "s" },
    flags: { dnd5e: { activity: "Actor.a.Item.i.Activity.nova" } },
    shapes: [{ type: "ellipse", x: 200, y: 300, radiusX: 100, radiusY: 100 }],
  };
  await f.fire("createRegion", region, {}, "other");
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 1);
  await f.fire("createRegion", region, {}, "u");
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 2);
  assert.deepEqual(f.calls.filter((c) => c[0] === "size").at(-1)[1], {
    width: 200,
    height: "auto",
  });
  await f.fire(
    "createRegion",
    {
      ...region,
      uuid: "Scene.s.Region.oval",
      shapes: [{ type: "ellipse", radiusX: 100, radiusY: 200 }],
    },
    {},
    "u",
  );
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 2);
  assert.match(f.api.activity()[0].detail, /circular/);
});

test("PF2e: a use finisher plays on a successful attack with its item, not on a miss", async () => {
  const f = await boot("pf2e");
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [{ id: "fling", name: "Fling", trigger: "manual", match: "Ignition", finisher: { on: "use" }, stages: [{ kind: "motion", motion: "shake", subject: "targets", duration: 600, assets: [] }] }] });
  const message = (id, outcome) => ({ id, author: { id: "u" }, item: f.item, actor: f.actor, isRoll: true, flags: { pf2e: { context: { type: "attack-roll", outcome, target: { token: "Scene.s.Token.target" } }, origin: { uuid: f.item.uuid } } }, speaker: { scene: "s", token: "t" } });
  await f.fire("createChatMessage", message("miss", "failure"));
  await settle();
  assert.equal(f.api.activity().filter((e) => e.status === "Finisher").length, 0);
  await f.fire("createChatMessage", message("hit", "success"));
  await settle();
  assert.equal(f.api.activity().filter((e) => e.status === "Finisher").length, 1);
});

test("finishers off: an assigned use finisher does not play", async () => {
  const f = await boot("pf2e");
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [{ id: "fling", name: "Fling", trigger: "manual", match: "Ignition", finisher: { on: "use" }, stages: [{ kind: "motion", motion: "shake", subject: "targets", duration: 600, assets: [] }] }] });
  await f.fire("createChatMessage", { id: "hit", author: { id: "u" }, item: f.item, actor: f.actor, isRoll: true, flags: { pf2e: { context: { type: "attack-roll", outcome: "success", target: { token: "Scene.s.Token.target" } }, origin: { uuid: f.item.uuid } } }, speaker: { scene: "s", token: "t" } });
  await settle();
  assert.equal(f.api.activity().filter((e) => e.status === "Finisher").length, 0);
});

// A killing blow on an NPC: a damage roll from "Ignition" aimed at the target token, then the
// actor's HP drops to 0 through preUpdateActor/updateActor as Foundry fires them.
async function killTarget(f, { finishers = [], defaultFinisher = "", crit = false, damage = {} } = {}) {
  foundry.utils.hasProperty ??= (object, path) => path.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), object) !== undefined;
  const npc = { id: "npc", type: "npc", system: { attributes: { hp: { value: 5 } } }, getActiveTokens: () => [f.target] };
  Object.assign(f.target, { name: "Orc", actor: npc, w: 100, h: 100 });
  Object.assign(f.target.document, { parent: { id: "s" }, hidden: false, width: 1, height: 1, rotation: 0, texture: {} });
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("defaultFinisher", defaultFinisher);
  f.settings.set("recipes", { schema: 1, recipes: finishers });
  await f.fire("createChatMessage", { id: "dmg", author: { id: "u" }, item: f.item, actor: f.actor, isRoll: true, rolls: [{ instances: [{ type: "fire", total: 9 }] }],
    flags: { pf2e: { context: { type: "damage-roll", ...(crit ? { outcome: "criticalSuccess" } : {}), target: { token: "Scene.s.Token.target", actor: "Actor.npc" } }, origin: { uuid: f.item.uuid } } }, speaker: { scene: "s", token: "t" } , ...damage });
  const changes = { system: { attributes: { hp: { value: 0 } } } }, options = {};
  await f.fire("preUpdateActor", npc, changes, options);
  npc.system.attributes.hp.value = 0;
  await f.fire("updateActor", npc, changes, options, "u");
  await settle();
  return f.api.activity().filter((e) => e.status === "Finisher");
}
const killFin = (id, name, match) => ({ id, name, trigger: "manual", match, finisher: { on: "kill", knockback: 0, ending: "body" }, stages: [{ kind: "motion", motion: "shake", subject: "targets", duration: 100, assets: [] }] });

test("kill path: the killing item's kill finisher plays on the NPC", async () => {
  const f = await boot("pf2e");
  const entries = await killTarget(f, { finishers: [killFin("burn", "Burn up", "Ignition")] });
  assert.equal(entries.length, 1, JSON.stringify(f.api.activity()));
  assert.match(entries[0].detail, /Burn up: Orc/);
  await f.api.stop();
});

test("kill path: with no assigned finisher the default finisher plays", async () => {
  const f = await boot("pf2e");
  const entries = await killTarget(f, { finishers: [killFin("other", "Other", "Dagger"), killFin("def", "Default drop", "")], defaultFinisher: "def" });
  assert.equal(entries.length, 1, JSON.stringify(f.api.activity()));
  assert.match(entries[0].detail, /Default drop/);
  await f.api.stop();
});

test("kill path: neither an assigned nor a default finisher keeps the old collapse", async () => {
  const f = await boot("pf2e");
  const entries = await killTarget(f, { finishers: [killFin("other", "Other", "Dagger")] });
  assert.equal(entries.length, 0, JSON.stringify(f.api.activity()));
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.notEqual(f.target.mesh.rotation, 0, "the old collapse tips the token");
  await f.api.stop();
});

test("kill path: a knockback finisher with no travel of its own shoves the NPC away and writes it where it lands", async (t) => {
  const f = await boot("pf2e");
  const writes = [];
  f.target.document.update = async (data) => { writes.push(data); Object.assign(f.target.document, { x: data.x ?? f.target.document.x, y: data.y ?? f.target.document.y }); };
  const wallAt = 520;
  stubGlobal(t, "CONFIG", { ...CONFIG, Canvas: { polygonBackends: { move: { testCollision: (a, b) => Math.max(a.x, b.x) >= wallAt } } } });
  canvas.dimensions = { sceneRect: { x: 0, y: 0, width: 3000, height: 3000 } };
  const shove = { ...killFin("shove", "Shove", "Ignition"), finisher: { on: "kill", knockback: 3, ending: "body" } };
  const entries = await killTarget(f, { finishers: [shove] });
  assert.equal(entries.length, 1, JSON.stringify(f.api.activity()));
  await new Promise((resolve) => setTimeout(resolve, 600));
  const moved = writes.find((w) => w.x !== undefined);
  assert.ok(moved, JSON.stringify(f.api.activity()));
  assert.deepEqual([moved.x, moved.y], [450, 50], "two squares away from the attacker, stopped short of the wall");
  assert.deepEqual(moved["flags.animater.displaced"], { fromX: 250, fromY: 50, finisher: "shove" });
  await f.api.stop();
});

test("displace-commit: the GM writes for the sender who owns the attacker, never for a forged or unrelated user", async () => {
  const f = await boot("pf2e");
  const updates = [], scene = { id: "s" };
  const orc = { uuid: "Scene.s.Token.orc", documentName: "Token", parent: scene, x: 100, y: 100, width: 1, height: 1, hidden: false,
    actor: { system: { attributes: { hp: { value: 5 } } } }, testUserPermission: () => false, update: async (data) => updates.push(data) };
  const hero = { uuid: "Scene.s.Token.hero", documentName: "Token", parent: scene, testUserPermission: (user) => user.id === "p1" };
  globalThis.fromUuid = async (uuid) => ({ [orc.uuid]: orc, [hero.uuid]: hero })[uuid] ?? null;
  game.users.set("p1", { id: "p1", isGM: false });
  game.users.set("p2", { id: "p2", isGM: false });
  game.users.activeGM = { isSelf: true };
  canvas.dimensions = { sceneRect: { x: 0, y: 0, width: 3000, height: 3000 } };
  const receive = f.sockets.get("module.animater");
  const request = { type: "displace-commit", sender: "remote", uuid: orc.uuid, attackerUuid: hero.uuid, x: 300, y: 100, fromX: 100, fromY: 100, finisher: "fling" };
  receive({ ...request, userId: "p1" }, "p2");
  receive({ ...request, userId: "u" }, "p2");
  receive({ ...request, userId: "p1" });
  receive({ ...request, x: 2000 }, "p1");   // 19 squares: past the longest landing (17 + size)
  await settle();
  assert.equal(updates.length, 0, "unrelated sender (even claiming the GM), no sender, and an out-of-reach move are ignored");
  receive({ ...request, fromX: "evil", finisher: "x".repeat(200) }, "p1");
  await settle();
  assert.equal(updates.length, 1);
  assert.equal(updates[0].x, 300);
  assert.deepEqual(updates[0]["flags.animater.displaced"], { finisher: "x".repeat(80) }, "the flag keeps only finite origins and a short name");
});

// Players' picks: user u1 (not a GM) owns the actor; the item's animater.finisher flag names the pick.
// Stubbed globals are put back when the test ends.
function stubGlobal(t, name, value) {
  const had = Object.hasOwn(globalThis, name), before = globalThis[name];
  globalThis[name] = value;
  t.after(() => { if (had) globalThis[name] = before; else delete globalThis[name]; });
}
function playerOwns(t, f, { choice = "pick" } = {}) {
  game.users.set("u1", { id: "u1", isGM: false });
  f.actor.testUserPermission = (user, level) => user?.id === "u1" && level === "OWNER";
  const flags = choice ? { finisher: choice } : {};
  Object.assign(f.item, {
    isOwner: true,
    getFlag: (scope, key) => (scope === "animater" ? flags[key] : undefined),
    setFlag: async (scope, key, value) => { flags[key] = value; },
    unsetFlag: async (scope, key) => { delete flags[key]; },
  });
  stubGlobal(t, "fromUuidSync", (uuid) => (uuid === f.item.uuid ? f.item : null));
  return flags;
}
const pickFin = (on, players = ["u1"], extra = {}) => ({ id: "pick", name: "Pick", trigger: "manual", match: "Ignition", finisher: { on, players, knockback: 0, ending: "body", ...extra }, stages: [{ kind: "motion", motion: "shake", subject: "targets", duration: 100, assets: [] }] });
const strikeMessage = (f, id, outcome) => ({ id, author: { id: "u" }, item: f.item, actor: f.actor, isRoll: true, flags: { pf2e: { context: { type: "attack-roll", outcome, target: { token: "Scene.s.Token.target" } }, origin: { uuid: f.item.uuid } } }, speaker: { scene: "s", token: "t" } });
// The surviving target records every write a finisher would make on it.
function watchTarget(f) {
  const writes = [];
  f.target.name = "Orc";
  f.target.actor = { id: "npc", type: "npc", system: { attributes: { hp: { value: 5 } } } };
  f.target.document.update = async (data) => writes.push(["update", data]);
  f.target.document.actor = { toggleStatusEffect: async (...args) => writes.push(["status", ...args]) };
  return writes;
}

test("player pick: a crit plays the player's critical finisher on the surviving target, writing nothing", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  const writes = watchTarget(f);
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [pickFin("critical")] });
  await f.fire("createChatMessage", strikeMessage(f, "crit", "criticalSuccess"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  const entries = f.api.activity().filter((e) => e.status === "Finisher");
  assert.equal(entries.length, 1, JSON.stringify(f.api.activity()));
  assert.match(entries[0].detail, /Pick: Orc/);
  assert.deepEqual(writes, [], "a survivor is neither hidden nor Defeated");
  await f.api.stop();
});

test("player pick: a plain hit does not play a critical pick", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  watchTarget(f);
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [pickFin("critical")] });
  await f.fire("createChatMessage", strikeMessage(f, "hit", "success"));
  await settle();
  assert.equal(f.api.activity().filter((e) => e.status === "Finisher").length, 0);
});

test("GM crit finisher: an NPC's item (no player owners) plays its name-matched critical finisher", async () => {
  const f = await boot("pf2e");
  watchTarget(f);
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [{ ...pickFin("criticalOrKill", []), id: "gmcrit", name: "GM crit" }] });
  await f.fire("createChatMessage", strikeMessage(f, "crit", "criticalSuccess"));
  await settle();
  const entries = f.api.activity().filter((e) => e.status === "Finisher");
  assert.equal(entries.length, 1, JSON.stringify(f.api.activity()));
  assert.match(entries[0].detail, /GM crit: Orc/);
  await f.api.stop();
});

test("player pick: a kill pick beats the GM's name-matched kill finisher", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  const entries = await killTarget(f, { finishers: [killFin("gm", "GM drop", "Ignition"), pickFin("kill")] });
  assert.equal(entries.length, 1, JSON.stringify(f.api.activity()));
  assert.match(entries[0].detail, /Pick: Orc/);
  await f.api.stop();
});

test("player pick: a pick whose player was removed from Available to plays nothing, and the old collapse stands in", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  const entries = await killTarget(f, { finishers: [killFin("gm", "GM drop", "Ignition"), pickFin("kill", ["u2"])], defaultFinisher: "gm" });
  assert.equal(entries.length, 0, JSON.stringify(f.api.activity()));
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.notEqual(f.target.mesh.rotation, 0, "the old collapse tips the token");
  await f.api.stop();
});

for (const [label, choice] of [["no pick", null], ["\"None\"", ""]]) {
  test(`player item with ${label}: a finisher matching it by name does not play, nor the default; the old collapse stands in`, async (t) => {
    const f = await boot("pf2e");
    playerOwns(t, f, { choice });
    const entries = await killTarget(f, { finishers: [killFin("gm", "GM drop", "Ignition"), pickFin("kill")], defaultFinisher: "gm" });
    assert.equal(entries.length, 0, JSON.stringify(f.api.activity()));
    await new Promise((resolve) => setTimeout(resolve, 200));
    assert.notEqual(f.target.mesh.rotation, 0, "the old collapse tips the token");
    await f.api.stop();
  });
}

test("player item with no pick: a crit plays no GM critical finisher", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f, { choice: null });
  watchTarget(f);
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [{ ...pickFin("criticalOrKill", []), id: "gmcrit", name: "GM crit" }] });
  await f.fire("createChatMessage", strikeMessage(f, "crit", "criticalSuccess"));
  await settle();
  assert.equal(f.api.activity().filter((e) => e.status === "Finisher").length, 0, JSON.stringify(f.api.activity()));
});

test("player pick: a crit with a kill pick plays no GM critical finisher", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  watchTarget(f);
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [pickFin("kill"), { ...pickFin("critical", []), id: "gmcrit", name: "GM crit" }] });
  await f.fire("createChatMessage", strikeMessage(f, "crit", "criticalSuccess"));
  await settle();
  assert.equal(f.api.activity().filter((e) => e.status === "Finisher").length, 0, JSON.stringify(f.api.activity()));
});

test("player pick: a use pick plays on a successful use, and the GM's name-matched use finisher does not", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  watchTarget(f);
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [{ ...pickFin("use", []), id: "gmuse", name: "GM use" }, pickFin("use")] });
  await f.fire("createChatMessage", strikeMessage(f, "miss", "failure"));
  await settle();
  assert.equal(f.api.activity().filter((e) => e.status === "Finisher").length, 0, "a miss plays nothing");
  await f.fire("createChatMessage", strikeMessage(f, "hit", "success"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.deepEqual(f.api.activity().filter((e) => e.status === "Finisher").map((e) => e.detail), ["Pick: Orc"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("NPC item: a kill keeps GM name matching, and a stray pick flag is ignored", async (t) => {
  const f = await boot("pf2e");
  Object.assign(f.item, { getFlag: (scope, key) => (scope === "animater" && key === "finisher" ? "pick" : undefined) });
  stubGlobal(t, "fromUuidSync", (uuid) => (uuid === f.item.uuid ? f.item : null));
  const entries = await killTarget(f, { finishers: [killFin("gm", "GM drop", "Ignition"), pickFin("kill", ["*"])] });
  assert.deepEqual(entries.map((e) => e.detail), ["GM drop: Orc"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("player pick: a crit that then kills with critical damage plays the travel once and only adds the ending", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  const writes = watchTarget(f);
  f.target.actor.getActiveTokens = () => [f.target];
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [pickFin("criticalOrKill")] });
  await f.fire("createChatMessage", strikeMessage(f, "crit", "criticalSuccess"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.deepEqual(writes, []);
  const entries = await killTarget(f, { finishers: [pickFin("criticalOrKill")], crit: true });
  assert.equal(entries.filter((e) => /^Pick: Orc$/.test(e.detail)).length, 1, JSON.stringify(f.api.activity()));
  assert.equal(entries.filter((e) => /^Pick: Orc \(ending\)$/.test(e.detail)).length, 1);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(writes.filter((w) => w[0] === "status").length, 1, "the body ending marks it Defeated");
  await f.api.stop();
});

test("api.finishers: a player's choices, and setting or clearing an item's pick", async (t) => {
  const f = await boot("pf2e");
  const flags = playerOwns(t, f);
  const changed = [];
  stubGlobal(t, "Hooks", { ...globalThis.Hooks, callAll: (name, ...args) => changed.push([name, ...args]) });
  f.settings.set("recipes", { schema: 1, recipes: [pickFin("critical"), { ...pickFin("kill", ["u2"]), id: "theirs", name: "Theirs" }] });
  assert.deepEqual(f.api.finishers.choices(f.item, { id: "u1" }), [{ id: "pick", name: "Pick", description: "", on: "critical" }]);
  assert.equal(f.api.finishers.getChoice(f.item), "pick");
  await assert.rejects(f.api.finishers.setChoice(f.item, "other-not-allowed"));
  assert.equal(flags.finisher, "pick");
  await f.api.finishers.setChoice(f.item, null);
  assert.equal(f.api.finishers.getChoice(f.item), null);
  assert.deepEqual(changed, [["animater.finisherChoiceChanged", f.item, null]]);
});

const finishedEmits = (f) => f.calls.filter((c) => c[0] === "socket" && c[2]?.type === "finisher-played").map((c) => c[2]);
const pickRuns = (f) => f.api.activity().filter((e) => e.status === "Finisher" && /^Pick: Orc/.test(e.detail)).map((e) => e.detail);
// Client A strikes the crit; client B applies the killing damage.
async function critOnClientA(t) {
  const a = await boot("pf2e");
  playerOwns(t, a);
  watchTarget(a);
  a.settings.set("finishers", true);
  a.settings.set("automatic", true);
  a.settings.set("recipes", { schema: 1, recipes: [pickFin("criticalOrKill")] });
  await a.fire("createChatMessage", strikeMessage(a, "crit", "criticalSuccess"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  await a.api.stop();
  return finishedEmits(a);
}
async function killOnClientB(t, emits, { crit }) {
  const b = await boot("pf2e");
  playerOwns(t, b);
  watchTarget(b);
  b.target.actor.getActiveTokens = () => [b.target];
  const receive = b.sockets.get("module.animater");
  for (const data of emits) receive(data, "u1");
  await killTarget(b, { finishers: [pickFin("criticalOrKill")], crit });
  await new Promise((resolve) => setTimeout(resolve, 100));
  await b.api.stop();
  return b;
}

test("two clients: the crit's mark reaches the killing client, whose critical blow plays only the ending", async (t) => {
  const emits = await critOnClientA(t);
  assert.deepEqual(emits.map((e) => [e.key, e.played]), [["t:target:Actor.a.Item.i:pick", true]], "the attacker's client broadcasts the mark");
  const b = await killOnClientB(t, emits, { crit: true });
  assert.deepEqual(pickRuns(b), ["Pick: Orc (ending)"], JSON.stringify(b.api.activity()));
});

test("two clients: a non-critical killing blow inside the window plays the full travel", async (t) => {
  const emits = await critOnClientA(t);
  const b = await killOnClientB(t, emits, { crit: false });
  assert.deepEqual(pickRuns(b), ["Pick: Orc"], JSON.stringify(b.api.activity()));
});

test("finished marks: a malformed broadcast is ignored, and a mark is used once", async (t) => {
  const key = "t:target:Actor.a.Item.i:pick";
  const b = await killOnClientB(t, [{ type: "finisher-played", sender: "x", key: 42 }, { type: "finisher-played", sender: "x", key: "x".repeat(500) }], { crit: true });
  assert.deepEqual(pickRuns(b), ["Pick: Orc"], "no valid mark: full travel");
  const c = await killOnClientB(t, [{ type: "finisher-played", sender: "x", key, played: true }], { crit: true });
  assert.deepEqual(pickRuns(c), ["Pick: Orc (ending)"]);
  // The same client's next critical kill with that item: the mark is spent.
  c.target.actor.system.attributes.hp.value = 5;
  const again = await killTarget(c, { finishers: [pickFin("criticalOrKill")], crit: true });
  assert.deepEqual(again.filter((e) => /^Pick: Orc/.test(e.detail)).map((e) => e.detail).sort(), ["Pick: Orc", "Pick: Orc (ending)"]);
  await c.api.stop();
});

test("finished marks: a crit whose play never starts takes its mark back", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  watchTarget(f);
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  // No stage can play (its artwork is not installed), so nothing starts.
  f.settings.set("recipes", { schema: 1, recipes: [{ ...pickFin("critical"), stages: [{ kind: "cast", assets: [] }] }] });
  await f.fire("createChatMessage", strikeMessage(f, "crit", "criticalSuccess"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.deepEqual(finishedEmits(f).map((e) => e.played), [true, false], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("crit finisher and GM use finisher on the same target: only the crit finisher moves it", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  watchTarget(f);
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [pickFin("critical"), { ...pickFin("use", []), id: "gmuse", name: "GM use" }] });
  await f.fire("createChatMessage", strikeMessage(f, "crit", "criticalSuccess"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  const entries = f.api.activity().filter((e) => e.status === "Finisher").map((e) => e.detail);
  assert.deepEqual(entries, ["Pick: Orc"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

// A saving throw against Ignition, rolled by the saver (as PF2e's Check.roll writes it): the caster's
// token in context.origin, the saver in context.target and the speaker, the spell in flags.pf2e.origin.
const saveMessage = (f, id, outcome, saver = "target") => ({ id, author: { id: "u" }, isRoll: true, speaker: { scene: "s", token: saver },
  flags: { pf2e: { context: { type: "saving-throw", outcome, origin: { actor: "Actor.a", token: "Scene.s.Token.t" }, target: { actor: `Actor.${saver}`, token: `Scene.s.Token.${saver}` } }, origin: { actor: "Actor.a", uuid: f.item.uuid, type: "spell" } } } });
const gmCrit = () => ({ ...pickFin("criticalOrKill", []), id: "gmcrit", name: "GM crit" });
function saveSetup(f, finishers) {
  watchTarget(f);
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: finishers });
}

test("save: a critically failed save plays the caster's crit finisher on the saver, the caster as attacker", async () => {
  const f = await boot("pf2e");
  saveSetup(f, [gmCrit()]);
  await f.fire("createChatMessage", saveMessage(f, "sv", "criticalFailure"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.deepEqual(f.api.activity().filter((e) => e.status === "Finisher").map((e) => e.detail), ["GM crit: Orc"], JSON.stringify(f.api.activity()));
  assert.deepEqual(finishedEmits(f).map((e) => [e.key, e.played]), [["t:target:Actor.a.Item.i:gmcrit:save", true]], "marked as struck by the caster's token");
  await f.api.stop();
});

for (const outcome of ["criticalSuccess", "success", "failure"]) {
  test(`save: a ${outcome} save plays no crit finisher`, async () => {
    const f = await boot("pf2e");
    saveSetup(f, [gmCrit()]);
    await f.fire("createChatMessage", saveMessage(f, "sv", outcome));
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(f.api.activity().filter((e) => e.status === "Finisher").length, 0, JSON.stringify(f.api.activity()));
  });
}

test("save: the pick on the caster's (player-owned) spell plays, the GM's crit finisher does not", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  saveSetup(f, [gmCrit(), pickFin("critical")]);
  await f.fire("createChatMessage", saveMessage(f, "sv", "criticalFailure"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.deepEqual(f.api.activity().filter((e) => e.status === "Finisher").map((e) => e.detail), ["Pick: Orc"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

// A second creature in the area: a goblin token beside the orc.
function addGoblin(t, f) {
  const gob = { id: "gob", name: "Gob", visible: true, center: { x: 500, y: 100 }, w: 100, h: 100,
    actor: { id: "gob", type: "npc", system: { attributes: { hp: { value: 5 } } } },
    document: { x: 450, y: 50, parent: { id: "s" }, hidden: false, width: 1, height: 1, rotation: 0, texture: {}, testUserPermission: () => true, update: async () => {} },
    mesh: { position: { x: 500, y: 100, set() {} }, rotation: 0, scale: { x: 1, y: 1, set() {} } } };
  gob.actor.getActiveTokens = () => [gob];
  const get = canvas.tokens.get, from = globalThis.fromUuid;
  canvas.tokens.get = (id) => (id === "gob" ? gob : get(id));
  stubGlobal(t, "fromUuid", async (uuid) => (uuid === "Scene.s.Token.gob" ? { object: gob } : from(uuid)));
  return gob;
}

test("save: an area spell's saves play the crit finisher only on the creatures that critically failed", async (t) => {
  const f = await boot("pf2e");
  addGoblin(t, f);
  saveSetup(f, [gmCrit()]);
  game.user.targets = new Set([f.target, canvas.tokens.get("gob")]);
  await f.fire("createChatMessage", saveMessage(f, "sv-orc", "criticalFailure", "target"));
  await f.fire("createChatMessage", saveMessage(f, "sv-gob", "failure", "gob"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.deepEqual(f.api.activity().filter((e) => e.status === "Finisher").map((e) => e.detail), ["GM crit: Orc"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("kill path: one area spell that kills two creatures plays a finisher on each", async (t) => {
  const f = await boot("pf2e");
  const gob = addGoblin(t, f);
  foundry.utils.hasProperty ??= (object, path) => path.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), object) !== undefined;
  const npc = { id: "npc", type: "npc", system: { attributes: { hp: { value: 5 } } }, getActiveTokens: () => [f.target] };
  Object.assign(f.target, { name: "Orc", actor: npc, w: 100, h: 100 });
  Object.assign(f.target.document, { parent: { id: "s" }, hidden: false, width: 1, height: 1, rotation: 0, texture: {} });
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [killFin("burn", "Burn up", "Ignition")] });
  // An area's damage roll is aimed at nobody in particular.
  await f.fire("createChatMessage", { id: "dmg", author: { id: "u" }, item: f.item, actor: f.actor, isRoll: true, rolls: [{ instances: [{ type: "fire", total: 9 }] }],
    flags: { pf2e: { context: { type: "damage-roll" }, origin: { uuid: f.item.uuid } } }, speaker: { scene: "s", token: "t" } });
  for (const actor of [npc, gob.actor]) {
    const changes = { system: { attributes: { hp: { value: 0 } } } }, options = {};
    await f.fire("preUpdateActor", actor, changes, options);
    actor.system.attributes.hp.value = 0;
    await f.fire("updateActor", actor, changes, options, "u");
  }
  await settle();
  assert.deepEqual(f.api.activity().filter((e) => e.status === "Finisher").map((e) => e.detail).sort(), ["Burn up: Gob", "Burn up: Orc"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("save: a crit-failed save that the spell's (non-critical) damage then kills plays only the ending", async () => {
  const f = await boot("pf2e");
  saveSetup(f, [gmCrit()]);
  await f.fire("createChatMessage", saveMessage(f, "sv", "criticalFailure"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  const entries = await killTarget(f, { finishers: [gmCrit()] });
  assert.deepEqual(entries.map((e) => e.detail).sort(), ["GM crit: Orc", "GM crit: Orc (ending)"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

// A save reaction is logged once its motion (up to 1.1 s) has played out.
const saveReactions = (f) => f.api.activity().filter((e) => /^Saving throw/.test(e.recipe ?? ""));
const reactionWindow = () => new Promise((resolve) => setTimeout(resolve, 1500));
test("save: a crit finisher on the saver skips its save reaction (one animation per token)", async () => {
  const f = await boot("pf2e");
  saveSetup(f, [gmCrit()]);
  await f.fire("createChatMessage", saveMessage(f, "sv", "criticalFailure"));
  await reactionWindow();
  assert.deepEqual(f.api.activity().filter((e) => e.status === "Finisher").map((e) => e.detail), ["GM crit: Orc"], JSON.stringify(f.api.activity()));
  assert.deepEqual(saveReactions(f), [], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("save: a crit-failed save with no crit finisher still plays its save reaction", async () => {
  const f = await boot("pf2e");
  saveSetup(f, [killFin("burn", "Burn up", "Ignition")]);
  await f.fire("createChatMessage", saveMessage(f, "sv", "criticalFailure"));
  await reactionWindow();
  assert.equal(saveReactions(f).length, 1, JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("save: a player's crit-or-kill pick that needs a critical ends the crit-failed saver on the spell's plain damage", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  const pick = pickFin("criticalOrKill", ["u1"], { success: "critical" });
  saveSetup(f, [pick]);
  f.target.actor.getActiveTokens = () => [f.target];
  await f.fire("createChatMessage", saveMessage(f, "sv", "criticalFailure"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  const entries = await killTarget(f, { finishers: [pick] });
  assert.deepEqual(entries.map((e) => e.detail).sort(), ["Pick: Orc", "Pick: Orc (ending)"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("save: an NPC's crit finisher that needs a critical ends the saver on plain damage, and the default does not replay a travel", async () => {
  const f = await boot("pf2e");
  const crit = { ...gmCrit(), finisher: { ...gmCrit().finisher, success: "critical" } };
  saveSetup(f, [crit]);
  await f.fire("createChatMessage", saveMessage(f, "sv", "criticalFailure"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  const entries = await killTarget(f, { finishers: [crit, killFin("def", "Default drop", "")], defaultFinisher: "def" });
  assert.deepEqual(entries.map((e) => e.detail).sort(), ["GM crit: Orc", "GM crit: Orc (ending)"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("save: a GM critical-only finisher's travel is not replayed by the default finisher on the kill", async () => {
  const f = await boot("pf2e");
  const crit = { ...gmCrit(), finisher: { ...gmCrit().finisher, on: "critical" } };
  saveSetup(f, [crit]);
  await f.fire("createChatMessage", saveMessage(f, "sv", "criticalFailure"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  const entries = await killTarget(f, { finishers: [crit, killFin("def", "Default drop", "")], defaultFinisher: "def" });
  assert.deepEqual(entries.map((e) => e.detail).sort(), ["Default drop: Orc (ending)", "GM crit: Orc"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("save: a player caster's spell that cannot be found plays no GM crit finisher", async (t) => {
  const f = await boot("pf2e");
  game.users.set("u1", { id: "u1", isGM: false });
  f.actor.testUserPermission = (user, level) => user?.id === "u1" && level === "OWNER";
  stubGlobal(t, "fromUuid", async (uuid) => (uuid === "Scene.s.Token.target" ? { object: f.target } : null));
  saveSetup(f, [{ ...gmCrit(), itemUuid: f.item.uuid }]);
  await f.fire("createChatMessage", saveMessage(f, "sv", "criticalFailure"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(f.api.activity().filter((e) => e.status === "Finisher").length, 0, JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("kill path: an unknown killing item from a player's token plays no finisher, not even the default", async (t) => {
  const f = await boot("pf2e");
  game.users.set("u1", { id: "u1", isGM: false });
  f.actor.testUserPermission = (user, level) => user?.id === "u1" && level === "OWNER";
  stubGlobal(t, "fromUuidSync", () => null);
  const entries = await killTarget(f, { finishers: [killFin("gm", "GM drop", "Ignition")], defaultFinisher: "gm", damage: { item: null, flags: { pf2e: { context: { type: "damage-roll", target: { token: "Scene.s.Token.target", actor: "Actor.npc" } }, origin: { uuid: "Actor.a.Item.gone" } } } } });
  assert.equal(entries.length, 0, JSON.stringify(f.api.activity()));
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.notEqual(f.target.mesh.rotation, 0, "the old collapse tips the token");
  await f.api.stop();
});

test("kill path: an unknown killing item and an unknown attacker keep the default finisher", async () => {
  const f = await boot("pf2e");
  const entries = await killTarget(f, { finishers: [killFin("gm", "GM drop", "Ignition")], defaultFinisher: "gm", damage: { item: null, speaker: { scene: "s" }, flags: { pf2e: { context: { type: "damage-roll", target: { token: "Scene.s.Token.target", actor: "Actor.npc" } } } } } });
  assert.deepEqual(entries.map((e) => e.detail), ["GM drop: Orc"], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("player pick: a kill pick that needs a critical does not play on a plain kill", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f);
  const entries = await killTarget(f, { finishers: [killFin("gm", "GM drop", "Ignition"), pickFin("kill", ["u1"], { success: "critical" })] });
  assert.deepEqual(entries.map((e) => e.detail), [], JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("api.finishers: even a GM cannot pick a finisher that does not apply to the item", async (t) => {
  const f = await boot("pf2e");
  const flags = playerOwns(t, f);
  stubGlobal(t, "Hooks", { ...globalThis.Hooks, callAll: () => {} });
  f.settings.set("recipes", { schema: 1, recipes: [pickFin("critical"), { ...pickFin("kill", []), id: "dagger", name: "Dagger only", match: "Dagger" }, { ...pickFin("kill", []), id: "gmonly", name: "GM only" }, { ...pickFin("kill", ["u1"]), id: "theirs", name: "Theirs" }] });
  assert.equal(game.user.isGM, true);
  await assert.rejects(f.api.finishers.setChoice(f.item, "dagger"), /isn't available/);
  assert.equal(flags.finisher, "pick");
  await f.api.finishers.setChoice(f.item, "theirs");
  assert.equal(flags.finisher, "theirs", "a GM may pick any finisher given to an owner");
});

test("api.finishers: a GM cannot pick, on a player-owned item, a finisher no owner has", async (t) => {
  const f = await boot("pf2e");
  const flags = playerOwns(t, f);
  stubGlobal(t, "Hooks", { ...globalThis.Hooks, callAll: () => {} });
  f.settings.set("recipes", { schema: 1, recipes: [pickFin("critical"), { ...pickFin("kill", []), id: "gmonly", name: "GM only" }, { ...pickFin("kill", ["u", "u2"]), id: "others", name: "Others" }] });
  assert.equal(game.user.isGM, true);
  await assert.rejects(f.api.finishers.setChoice(f.item, "gmonly"), (error) => error instanceof Error && /isn't available/.test(error.message));
  await assert.rejects(f.api.finishers.setChoice(f.item, "others"), /isn't available/);
  assert.equal(flags.finisher, "pick");
});

// Synthetic strikes (PF2e's basic unarmed, Fist): no Item document; the pick lives on the actor.
function strikeOwner(t, f, { pick = "pick" } = {}) {
  game.users.set("u1", { id: "u1", isGM: false });
  const flags = { strikeFinishers: pick ? { fist: pick } : {} };
  Object.assign(f.actor, {
    isOwner: true,
    items: { get: () => undefined },
    testUserPermission: (user, level) => user?.id === "u1" && level === "OWNER",
    getFlag: (scope, key) => (scope === "animater" ? flags[key] : undefined),
    setFlag: async (scope, key, value) => { flags[key] = { ...flags[key], ...value }; },
    unsetFlag: async (scope, path) => { const [key, sub] = path.split("."); delete flags[key]?.[sub]; },
  });
  const fist = { id: "xxxxxxFISTxxxxxx", uuid: "Actor.a.Item.xxxxxxFISTxxxxxx", documentName: "Item", name: "Fist", slug: "fist", actor: f.actor, getFlag: () => undefined };
  stubGlobal(t, "fromUuidSync", () => null);
  return { flags, fist };
}
const fistPick = (on, extra = {}) => ({ ...pickFin(on, ["u1"], extra), match: "Fist" });

test("api.finishers: a strike descriptor's choices, and its pick set and cleared on the actor", async (t) => {
  const f = await boot("pf2e");
  const { flags, fist } = strikeOwner(t, f, { pick: null });
  const changed = [];
  stubGlobal(t, "Hooks", { ...globalThis.Hooks, callAll: (name, ...args) => changed.push([name, ...args]) });
  f.settings.set("recipes", { schema: 1, recipes: [fistPick("critical"), { ...fistPick("kill"), id: "sword", name: "Sword", match: "Longsword" }, { ...pickFin("kill", ["u2"]), id: "theirs", name: "Theirs", match: "Fist" }] });
  const strike = { actor: f.actor, name: "Fist", slug: "fist" };
  assert.deepEqual(f.api.finishers.choices(strike, { id: "u1" }).map((c) => c.id), ["pick"]);
  assert.equal(f.api.finishers.getChoice(strike), null);
  await f.api.finishers.setChoice(strike, "pick");
  assert.deepEqual(flags.strikeFinishers, { fist: "pick" }, "stored on the actor by strike slug");
  assert.equal(f.api.finishers.getChoice(strike), "pick");
  assert.equal(f.api.finishers.getChoice(fist), "pick", "the synthetic Fist item reads the same pick");
  await assert.rejects(f.api.finishers.setChoice(strike, "sword"), /isn't available/, "a finisher for another strike");
  await assert.rejects(f.api.finishers.setChoice(strike, "theirs"), /isn't available/, "a finisher no owner has");
  await f.api.finishers.setChoice(fist, null);
  assert.equal(f.api.finishers.getChoice(strike), null);
  assert.deepEqual(changed.map((c) => c.slice(0, 1).concat(c.slice(2))), [["animater.finisherChoiceChanged", "pick"], ["animater.finisherChoiceChanged", null]]);
  const before = game.user;
  game.user = { id: "u2", isGM: false };
  f.actor.isOwner = false;
  await assert.rejects(f.api.finishers.setChoice(strike, "pick"), /owner or a GM/);
  game.user = before;
});

test("synthetic strike: a Fist crit plays the actor's pick", async (t) => {
  const f = await boot("pf2e");
  const { fist } = strikeOwner(t, f);
  watchTarget(f);
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [fistPick("critical")] });
  await f.fire("createChatMessage", { ...strikeMessage(f, "crit", "criticalSuccess"), item: fist, flags: { pf2e: { context: { type: "attack-roll", outcome: "criticalSuccess", target: { token: "Scene.s.Token.target" } }, origin: { uuid: fist.uuid, actor: "Actor.a" } } } });
  await new Promise((resolve) => setTimeout(resolve, 250));
  const entries = f.api.activity().filter((e) => e.status === "Finisher");
  assert.equal(entries.length, 1, JSON.stringify(f.api.activity()));
  assert.match(entries[0].detail, /Pick: Orc/);
  await f.api.stop();
});

test("synthetic strike: a Fist kill plays the actor's pick, even when the message's item is gone", async (t) => {
  for (const item of ["fist", null]) {
    const f = await boot("pf2e");
    const { fist } = strikeOwner(t, f);
    const entries = await killTarget(f, { finishers: [killFin("gm", "GM drop", "Fist"), fistPick("kill")], defaultFinisher: "gm",
      damage: { item: item && fist, flags: { pf2e: { context: { type: "damage-roll", options: ["item:slug:fist"], target: { token: "Scene.s.Token.target", actor: "Actor.npc" } }, origin: { uuid: fist.uuid, actor: "Actor.a" } } } } });
    assert.deepEqual(entries.map((e) => e.detail), ["Pick: Orc"], JSON.stringify(f.api.activity()));
    await f.api.stop();
  }
});

test("synthetic strike: a player's Fist with no pick plays no finisher on a crit or a kill, not even the default", async (t) => {
  const f = await boot("pf2e");
  const { fist } = strikeOwner(t, f, { pick: null });
  watchTarget(f);
  const gm = { ...pickFin("criticalOrKill", []), id: "gmcrit", name: "GM crit", match: "Fist" };
  f.settings.set("finishers", true);
  f.settings.set("automatic", true);
  f.settings.set("recipes", { schema: 1, recipes: [gm] });
  await f.fire("createChatMessage", { ...strikeMessage(f, "crit", "criticalSuccess"), item: fist });
  await settle();
  assert.equal(f.api.activity().filter((e) => e.status === "Finisher").length, 0, JSON.stringify(f.api.activity()));
  const entries = await killTarget(f, { finishers: [gm, killFin("gm", "GM drop", "Fist")], defaultFinisher: "gm",
    damage: { id: "dmg2", item: fist, flags: { pf2e: { context: { type: "damage-roll", target: { token: "Scene.s.Token.target", actor: "Actor.npc" } }, origin: { uuid: fist.uuid, actor: "Actor.a" } } } } });
  assert.equal(entries.length, 0, JSON.stringify(f.api.activity()));
  await f.api.stop();
});

test("Defeated look: the finisher body ending marks Defeated without the overlay unless the look is Foundry's", async () => {
  for (const [look, overlay] of [["overlay", true], ["icon", false], ["effect", false]]) {
    const f = await boot("pf2e");
    assert.equal(f.settings.get("defeatedLook"), "overlay", "registered with Foundry's look as the default");
    f.settings.set("defeatedLook", look);
    const writes = watchTarget(f);
    await killTarget(f, { finishers: [killFin("burn", "Burn up", "Ignition")] });
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.deepEqual(writes.filter((w) => w[0] === "status").map((w) => w.slice(1)), [["dead", { active: true, overlay }]], look);
    // Any other source (combat tracker, system) creating the status goes through the same rule.
    const effect = { statuses: new Set(["dead"]), flags: { core: { overlay: true } }, updateSource(c) { this.flags.core.overlay = c["flags.core.overlay"]; } };
    await f.fire("preCreateActiveEffect", effect, { statuses: ["dead"], flags: { core: { overlay: true } } }, {}, "u");
    assert.equal(effect.flags.core.overlay, overlay, `${look}: tracker toggle`);
    await f.api.stop();
  }
});

// The "By damage type" default: the killing blow's damage type picks a built-in finisher.
const damageOf = (type) => ({ rolls: [{ instances: [{ type, total: 9 }] }] });
test("kill path, by damage type: a piercing kill plays Perforated, a fire kill Cinders", async () => {
  for (const [type, name] of [["piercing", "Perforated"], ["fire", "Cinders"]]) {
    const f = await boot("pf2e");
    const entries = await killTarget(f, { finishers: [killFin("other", "Other", "Dagger")], defaultFinisher: "by-damage-type", damage: damageOf(type) });
    assert.equal(entries.length, 1, JSON.stringify(f.api.activity()));
    assert.match(entries[0].detail, new RegExp(`^${name}: Orc`));
    await f.api.stop();
  }
});

test("kill path, by damage type: an unknown type keeps the old collapse", async () => {
  const f = await boot("pf2e");
  const entries = await killTarget(f, { defaultFinisher: "by-damage-type", damage: damageOf("untyped") });
  assert.equal(entries.length, 0, JSON.stringify(f.api.activity()));
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.notEqual(f.target.mesh.rotation, 0, "the old collapse tips the token");
  await f.api.stop();
});

// Review focus: HP set to 0 by hand, or a roll with no typed damage, leaves nothing in the damage log.
test("kill path, by damage type: no damage type remembered keeps the old collapse", async () => {
  const f = await boot("pf2e");
  const entries = await killTarget(f, { defaultFinisher: "by-damage-type", damage: { rolls: [] } });
  assert.equal(entries.length, 0, JSON.stringify(f.api.activity()));
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.notEqual(f.target.mesh.rotation, 0, "the old collapse tips the token");
  await f.api.stop();
});

test("kill path, by damage type: the killing item's own kill finisher still wins", async () => {
  const f = await boot("pf2e");
  const entries = await killTarget(f, { finishers: [killFin("burn", "Burn up", "Ignition")], defaultFinisher: "by-damage-type" });
  assert.equal(entries.length, 1, JSON.stringify(f.api.activity()));
  assert.match(entries[0].detail, /Burn up: Orc/);
  await f.api.stop();
});

test("kill path, by damage type: a player's item plays only its pick, never the built-in", async (t) => {
  const f = await boot("pf2e");
  playerOwns(t, f, { choice: null });
  const entries = await killTarget(f, { defaultFinisher: "by-damage-type" });
  assert.equal(entries.length, 0, JSON.stringify(f.api.activity()));
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.notEqual(f.target.mesh.rotation, 0, "the old collapse tips the token");
  await f.api.stop();
});
