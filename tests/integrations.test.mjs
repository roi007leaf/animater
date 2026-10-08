import test from "node:test";
import assert from "node:assert/strict";
import { AnimaterRuntime } from "../scripts/runtime.mjs";
import { PF2E_FEATS, featRecipe, useCatalogFeat } from "../scripts/feat-catalog.mjs";
import { aaCustomized, aaEvent } from "../scripts/integrations/automated-animations.mjs";
import { spellArsenalClaims } from "../scripts/integrations/spell-arsenal.mjs";
import { createAnimaterPlayNode } from "../scripts/integrations/trigger-engine.mjs";
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
function stubHooks() {
  const hooks = new Map();
  const on = (name, fn) => hooks.set(name, [...(hooks.get(name) ?? []), fn]);
  return {
    hooks,
    Hooks: {
      on, once: on,
      call: (name, ...args) => (hooks.get(name) ?? []).every((fn) => fn(...args) !== false),
      callAll: (name, ...args) => { for (const fn of hooks.get(name) ?? []) fn(...args); return true; },
    },
  };
}
const feat = PF2E_FEATS.find((f) => f.slug === "sudden-charge");
const recipe = featRecipe(feat, { motion: false });
async function boot() {
  const { hooks, Hooks } = stubHooks();
  const settings = new Map(), calls = [];
  globalThis.Hooks = Hooks;
  globalThis.foundry = {
    applications: { api: { ApplicationV2: class {}, HandlebarsApplicationMixin: (base) => class extends base {}, DialogV2: {} } },
    utils: { randomID: () => "id" },
  };
  const actor = { id: "a", documentName: "Actor" };
  const source = { id: "t", actor, isOwner: true, controlled: true, center: { x: 100, y: 100 } };
  globalThis.game = {
    system: { id: "pf2e", title: "pf2e", version: "8.5.1" },
    user: { id: "u", isGM: true, targets: new Set() },
    modules: new Map([["animater", { socket: true }], ["sequencer", { active: true, version: "4.2.3" }], ["jb2a_patreon", { active: true }]]),
    settings: {
      register: (_id, k, d) => settings.set(k, d.default),
      registerMenu: () => {},
      get: (_id, k) => settings.get(k),
      set: async (_id, k, v) => settings.set(k, v),
    },
    keybindings: { register: () => {} },
    users: new Map([["u", { id: "u", isGM: true }]]),
    socket: { on: () => {}, emit: () => {} },
  };
  globalThis.canvas = {
    ready: true, scene: { id: "s", grid: { distance: 5 } }, grid: { size: 100 },
    tokens: { placeables: [source], controlled: [source], get: (id) => (id === "t" ? source : null) },
  };
  const keys = recipe.stages.flatMap((s) => s.assets);
  globalThis.Sequencer = {
    Preloader: { preload: async () => {}, preloadForClients: async () => {} },
    SoundManager: { endSounds: async () => {} },
    Database: { entryExists: () => true, getPathsUnder: () => keys, getAllFileEntries: (key) => [key + ".webm"] },
    EffectManager: { endEffects: async () => {} },
  };
  globalThis.Sequence = class {
    sound() { return this.effect(); }
    effect() {
      const e = new Proxy({}, { get: (_, k) => (...args) => { calls.push([k, ...args]); return e; } });
      return e;
    }
    async play(options) { calls.push(["play", options]); }
  };
  globalThis.ui = { notifications: { warn: () => {} }, controls: { render: () => {} } };
  globalThis.fromUuid = async () => null;
  await import(`../scripts/main.mjs?integrations=${Date.now()}`);
  for (const name of ["init", "ready"]) for (const fn of hooks.get(name) ?? []) await fn();
  settings.set("recipes", { schema: 1, recipes: [] });
  settings.set("featCatalog", { ...useCatalogFeat({}, feat.id), motion: false });
  const item = { uuid: "Actor.a.Item.i", documentName: "Item", type: "feat", name: feat.name, actor, flags: {}, _stats: { compendiumSource: recipe.itemUuid } };
  const card = { id: "card", documentName: "ChatMessage", author: { id: "u" }, item, isRoll: false, speaker: { token: "t", scene: "s" }, flags: {} };
  const fire = async (name, ...args) => { for (const fn of hooks.get(name) ?? []) await fn(...args); };
  return { hooks, fire, settings, calls, item, card, source, api: game.modules.get("animater").api };
}

test("preDispatch listeners can claim an event; played fires after playback", async () => {
  const played = [];
  const host = {
    enabled: () => true, recipes: () => [], resolveRecipe: () => ({ id: "r", name: "R" }),
    onTrace: () => {},
  };
  const runtime = new AnimaterRuntime(host);
  runtime.play = async (r) => played.push(r.id);
  const previous = globalThis.Hooks;
  const { Hooks } = stubHooks();
  globalThis.Hooks = Hooks;
  try {
    const events = [];
    Hooks.on("animater.played", (event, r) => events.push([event.id, r.id]));
    Hooks.on("animater.preDispatch", (event) => (event.id === "claimed" ? false : undefined));
    await runtime.dispatch({ id: "claimed", type: "use", item: { name: "Fireball" } });
    assert.deepEqual(played, []);
    assert.match(runtime.log[0].detail, /claimed by another module/);
    await runtime.dispatch({ id: "free", type: "use", item: { name: "Fireball" } });
    assert.deepEqual(played, ["r"]);
    assert.deepEqual(events, [["free", "r"]]);
    delete globalThis.Hooks;
    await runtime.dispatch({ id: "no-hooks", type: "use", item: { name: "Fireball" } });
    assert.deepEqual(played, ["r", "r"], "missing Hooks global still plays");
  } finally {
    globalThis.Hooks = previous;
  }
});

test("Automated Animations stops for items Animater animates and keeps customized items", async () => {
  const f = await boot();
  game.modules.set("autoanimations", { active: true, title: "Automated Animations" });
  const workflow = (item) => ({ item, token: f.source, targets: [], workflow: { ...f.card, item } });
  const data = workflow(f.item);
  await f.fire("AutomatedAnimations-WorkflowStart", data, {});
  assert.equal(data.stopWorkflow, true);
  const other = workflow({ ...f.item, name: "Toughness", _stats: {} });
  await f.fire("AutomatedAnimations-WorkflowStart", other, {});
  assert.equal(other.stopWorkflow, undefined, "no Animater recipe: AA plays");
  const customized = { ...f.item, flags: { autoanimations: { isEnabled: true, isCustomized: true } } };
  const kept = workflow(customized);
  await f.fire("AutomatedAnimations-WorkflowStart", kept, {});
  assert.equal(kept.stopWorkflow, undefined, "customized AA item stays with AA");
  await f.fire("createChatMessage", { ...f.card, id: "custom-card", item: customized });
  await settle();
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 0);
  assert.match(f.api.activity()[0].detail, /customized in Automated Animations/);
  f.settings.set("aaTakeover", false);
  const off = workflow(f.item);
  await f.fire("AutomatedAnimations-WorkflowStart", off, {});
  assert.equal(off.stopWorkflow, undefined, "setting disabled");
  assert.equal(aaCustomized({ flags: { autoanimations: { isEnabled: false, isCustomized: true } } }), false);
  assert.equal(aaEvent({ item: f.item, templateData: { uuid: "Scene.s.Region.r", parent: { id: "s" } } }, { systemId: "pf2e" }).type, "template");
});

test("api.handles and api.resolve report without playing", async () => {
  const f = await boot();
  assert.equal(f.api.handles(f.item), true);
  assert.equal(f.api.handles({ ...f.item, name: "Toughness", _stats: {} }), false);
  assert.equal(f.api.handles(f.card), true);
  assert.equal(f.api.resolve(f.card).itemUuid, recipe.itemUuid);
  assert.equal(f.api.resolve({ ...f.card, item: { ...f.item, name: "Toughness", _stats: {} } }), null);
  assert.equal(f.calls.filter((c) => c[0] === "play").length, 0);
});

test("Spell Arsenal claims mapped areas and opted-in damage rules", () => {
  const rules = [
    { enabled: true, kind: "area", spell: "Fireball", effect: "Fire" },
    { enabled: true, kind: "damage", spell: "Ignition", effect: "Fire", animater: true },
    { enabled: true, kind: "damage", spell: "Frostbite", effect: "Frost" },
  ];
  const g = {
    system: { id: "pf2e" },
    modules: new Map([["spell-arsenal", { active: true }], ["tile-arsenal", { active: true }]]),
    users: { activeGM: { id: "gm" } },
    settings: { get: (_id, key) => (key === "enabled" ? true : rules) },
  };
  const spell = (name) => ({ type: "spell", name });
  assert.equal(spellArsenalClaims({ type: "template", item: spell("Fireball") }, g), true);
  assert.equal(spellArsenalClaims({ type: "template", item: spell("x"), template: { flags: { pf2e: { origin: { name: "fireball" } } } } }, g), true);
  assert.equal(spellArsenalClaims({ type: "damage", item: spell("Ignition") }, g), true);
  assert.equal(spellArsenalClaims({ type: "damage", item: spell("Frostbite") }, g), false, "tiles only: Animater keeps its own damage animation");
  assert.equal(spellArsenalClaims({ type: "template", item: spell("Lightning Bolt") }, g), false);
  g.users.activeGM = null;
  assert.equal(spellArsenalClaims({ type: "template", item: spell("Fireball") }, g), false, "no GM to run Spell Arsenal");
});

test("Trigger Engine node plays the recipe with source and target tokens on the active GM", async () => {
  const played = [];
  const previous = globalThis.game;
  const source = { id: "s" }, target = { id: "t" };
  globalThis.game = {
    user: { id: "gm", isGM: true }, users: { activeGM: { id: "gm" } },
    modules: new Map([["animater", { api: { play: async (id, context) => played.push([id, context]) } }]]),
  };
  try {
    class Base { executeNext(out) { return out; } }
    const Node = createAnimaterPlayNode(Base);
    const node = new Node();
    const inputs = { recipe: "ember", source: { token: { object: source } }, targets: [{ token: { object: target } }] };
    node.getInputValue = async (key) => inputs[key];
    assert.equal(Node.type, "animater-play");
    assert.equal(await node._execute(), "out");
    assert.deepEqual(played, [["ember", { source, targets: [target] }]]);
    game.users.activeGM = { id: "other" };
    assert.equal(await node._execute(), false);
    assert.equal(played.length, 1);
  } finally {
    globalThis.game = previous;
  }
});

test('weapon effect size scales weapon hits and residue only', async () => {
  const { withWeaponScale } = await import('../scripts/runtime.mjs');
  const recipe = { weaponMode: 'melee', stages: [{ kind: 'motion', scale: 1 }, { kind: 'impact', scale: 0.8 }, { kind: 'travel', scale: 1 }, { kind: 'aura', scale: 1 }] };
  assert.deepEqual(withWeaponScale(recipe, 1.5).stages.map(s => s.scale), [1, 1.2000000000000002, 1, 1.5]);
  assert.equal(withWeaponScale({ ...recipe, weaponMode: 'area' }, 1.5).stages[1].scale, 0.8);
  assert.equal(withWeaponScale({ ...recipe, weaponMode: undefined }, 1.5).stages[1].scale, 0.8);
});
