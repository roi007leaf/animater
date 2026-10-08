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
  assert.equal(f.settings.get("automatic"),false);assert.equal(f.api.conditions().conditions.length,43);assert.equal(f.api.effects().effects.length,2929);
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
  assert.equal(f.bindings[0].restricted, true);
  const controls = { tokens: { tools: {} } };
  await f.fire("getSceneControlButtons", controls);
  assert.equal(controls.tokens.tools.animater.visible, true);
  game.user.isGM = false;
  const playerControls = { tokens: { tools: {} } };
  await f.fire("getSceneControlButtons", playerControls);
  assert.equal(playerControls.tokens.tools.animater.visible, false);
  f.api.open();
  assert.ok(f.calls.some((c) => Array.isArray(c) && c[0] === "warning"));
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
  await f.fire("updateUser", game.user);
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
  assert.ok(!f.hooks.has("createChatMessage"));
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
