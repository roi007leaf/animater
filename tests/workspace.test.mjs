import test from "node:test";
import assert from "node:assert/strict";
import { Workspace } from "../scripts/workspace.mjs";
import { studioHTML } from "../scripts/studio.mjs";
import { PF2E_SPELLS, spellRecipe } from "../scripts/spell-catalog.mjs";
import { PF2E_FEATS, featRecipe } from "../scripts/feat-catalog.mjs";
import { PF2E_WEAPONS, weaponRecipe } from "../scripts/weapon-catalog.mjs";
import {withUnconfiguredSpell} from './helpers/catalog-fixtures.mjs';

test("large rectangular preview tokens retain footprint, mirrored texture and chain centers", () => {
  const w = Object.create(Workspace.prototype);
  const token = {
    width: 2,
    height: 1,
    spriteWidth: 3,
    spriteHeight: 1.5,
    textureScaleX: -1,
    rotation: 30,
    img: "token.webp",
  };
  const normal = w.previewActorHTML({
    subject: "source",
    token,
    name: "Caster",
  });
  assert.match(
    normal,
    /width:110px;margin-left:-55px;top:calc\(45% \+ 27px - 27.5px\)/,
  );
  assert.match(normal, /width:165px;height:82.5px/);
  assert.match(normal, /rotate\(30deg\) scale\(-1,1\)/);
  const chain = w.previewActorHTML({
    subject: "targets",
    token,
    name: "Target",
    x: 70,
    y: 45,
    id: "t1",
    targetIndex: 0,
  });
  assert.match(chain, /top:calc\(45% - 27.5px\);left:70%/);
  assert.match(chain, /data-preview-actor="t1"/);
});

function workspace() {
  const w = Object.create(Workspace.prototype);
  Object.assign(w, {
    page: "recipes",
    selected: "frost",
    stageIndex: 0,
    previewMode: "recipe",
    category: "All",
    busy: false,
    message: "",
    drafts: new Map(),
    dirty: new Set(),
    root: { querySelectorAll: () => [], querySelector: () => null },
  });
  let renders = 0;
  w.render = () => {
    renders++;
  };
  const click = async (dataset) =>
    w.onClick({
      target: { closest: () => ({ dataset, disabled: false }) },
      preventDefault() {},
    });
  return { w, click, renders: () => renders };
}

test('unconfigured spell opens a local blank draft and never saves generic placeholder art',async()=>{
 await withUnconfiguredSpell('500 Toads',async spell=>{
 const f=workspace();
 let state={enabled:true,selected:[spell.id]},saves=0;
 Object.assign(f.w,{page:'spells',selectedSpell:spell.id});
 f.w.host={recipes:()=>[],save:async()=>{saves++;},catalogState:()=>state,setCatalogState:async c=>{state={...state,...c};}};
 await f.click({action:'copy-spell'});
 assert.equal(saves,0);
 assert.equal(f.w.page,'recipes');
 assert.equal(f.w.selected,`pf2e-${spell.id}`);
 assert.ok(f.w.dirty.has(f.w.selected));
 const draft=f.w.drafts.get(f.w.selected);
 assert.deepEqual(draft.stages[0].assets,[]);
 assert.equal(draft.stages[0].kind,'template');
 assert.equal(draft.enabled,false);
 assert.equal(draft.itemUuid,`Compendium.pf2e.spells-srd.Item.${spell.id}`);
 assert.ok(state.customized.includes(spell.id));
 });
});

test("catalog names open the correct native item sheet without rerendering or changing selection", async () => {
  const f = workspace(), calls = [];
  f.w.host = { resolveItem: async uuid => {
    calls.push(uuid);
    return { sheet: { render: async options => calls.push(options) } };
  } };
  const entries = [
    ["spell", "spells-srd", PF2E_SPELLS.find(s => s.name === "Fireball")],
    ["feat", "feats-srd", PF2E_FEATS.find(f => f.slug === "twin-takedown")],
    ["weapon", "equipment-srd", PF2E_WEAPONS.find(w => w.slug === "acid-flask-lesser")],
  ];
  for (const [kind, pack, item] of entries) {
    await f.click({ action: "item-details", kind, id: item.id });
    assert.equal(calls.at(-2), `Compendium.pf2e.${pack}.Item.${item.id}`);
    assert.deepEqual(calls.at(-1), { force: true });
  }
  assert.equal(f.renders(), 0);
  assert.equal(f.w.selected, "frost");
  assert.equal(f.w.page, "recipes");
});

test("weapon mode buttons update preview; use and customize retain separate modes", async () => {
 const f=workspace(),weapon=PF2E_WEAPONS.find(w=>w.slug==='dagger');
 let state={enabled:false},saved=[];
 Object.assign(f.w,{page:'weapons',selectedWeapon:weapon.id,weaponMode:'melee',weaponFilters:{search:'',group:'all',mode:'all',category:'all',edition:'all'}});
 f.w.host={weaponCatalogState:()=>state,setWeaponCatalogState:async c=>{state={...state,...c};},recipes:()=>saved,save:async r=>{saved=r;},environment:()=>({systemId:'pf2e',ready:true}),enabled:()=>false};
 await f.click({action:'weapon-mode',mode:'thrown'});assert.equal(f.w.recipe().weaponMode,'thrown');assert.equal(f.w.weaponMode,'thrown');
 await f.click({action:'use-weapon'});assert.ok(state.selected.includes(weapon.id));assert.equal(saved.length,0);
 await f.click({action:'copy-weapon'});assert.equal(saved.length,1);assert.equal(saved[0].weaponMode,'thrown');assert.ok(state.customized.includes(`${weapon.id}:thrown`));assert.equal(f.w.page,'recipes');
 f.w.page='weapons';f.w.weaponMode='thrown';await f.click({action:'copy-weapon'});assert.equal(saved.length,1);
 f.w.page='weapons';f.w.weaponMode='melee';await f.click({action:'copy-weapon'});assert.equal(saved.length,2);assert.equal(saved[1].weaponMode,'melee');
});

test("feat sound toggle and volume affect preview recipes without modifying saved stages", async () => {
 const f=workspace(),feat=PF2E_FEATS.find(f=>f.slug==='double-slice');let state={sound:true,soundVolume:.35};
 Object.assign(f.w,{page:'feats',selectedFeat:feat.id});
 f.w.host={featCatalogState:()=>state,setFeatCatalogState:async c=>{state={...state,...c};},soundCatalog:()=>({resolve:c=>c})};
 assert.ok(f.w.recipe().stages.some(s=>s.kind==='sound'));
 await f.click({action:'feat-sound'});assert.ok(!f.w.recipe().stages.some(s=>s.kind==='sound'));
 await f.click({action:'feat-sound'});state.soundVolume=.15;assert.ok(f.w.recipe().stages.filter(s=>s.kind==='sound').every(s=>Math.abs(s.volume-.15*(s.optionalSound?.gain??1))<1e-10));
});

test("active feats use catalog data without saved slots and do not change spell settings", async () => {
  const f = workspace(), feat = PF2E_FEATS.find((v) => v.slug === "sudden-charge");
  let state = { enabled: false, excluded: [feat.id], motion: false };
  const spellState = { enabled: true, selected: ["spell-choice"] };
  f.w.page = "feats";
  f.w.selectedFeat = feat.id;
  f.w.host = {
    recipes: () => Array.from({ length: 200 }, (_, i) => ({ id: `custom-${i}` })),
    featCatalogState: () => state,
    setFeatCatalogState: async (change) => { state = { ...state, ...change }; },
    catalogState: () => spellState,
    setCatalogState: () => assert.fail("Feat controls must not alter spells"),
    save: () => assert.fail("Catalog use consumes no saved slots"),
    enabled: () => false,
    environment: () => ({ systemId: "pf2e", ready: true }),
  };
  await f.click({ action: "use-feat" });
  assert.equal(state.independent, true);
  assert.equal(state.scope, "selected");
  assert.deepEqual(state.selected, [feat.id]);
  assert.deepEqual(state.excluded, []);
  assert.equal(state.motion, false);
  await f.click({ action: "feat-auto" });
  assert.equal(state.scope, "all");
  assert.equal(state.preferCatalog, true);
  await f.click({ action: "feat-auto" });
  assert.equal(state.enabled, false);
  assert.deepEqual(spellState, { enabled: true, selected: ["spell-choice"] });
});

test("feat customization reuses saved edits and retained catalog state; current selection does not rerender", async () => {
  const f = workspace(), feat = PF2E_FEATS.find((v) => v.slug === "sudden-charge");
  let state = { enabled: true, scope: "all", selected: [feat.id], customized: [] };
  const recipe = { ...featRecipe(feat), name: "Edited charge", enabled: false };
  f.w.page = "feats";
  f.w.selectedFeat = feat.id;
  f.w.host = {
    recipes: () => [recipe], featCatalogState: () => state,
    setFeatCatalogState: async (change) => { state = { ...state, ...change }; },
    save: () => assert.fail("Do not duplicate existing feat edits"),
  };
  await f.click({ action: "select-feat", id: feat.id });
  assert.equal(f.renders(), 0);
  await f.click({ action: "copy-feat" });
  assert.equal(f.w.page, "recipes");
  assert.equal(f.w.selected, recipe.id);
  assert.deepEqual(state.selected, []);
  assert.deepEqual(state.customized, [feat.id]);
  assert.equal(recipe.name, "Edited charge");
  assert.equal(recipe.enabled, false);
});
test("Use animation activates only its catalog choice even when custom recipe storage is full", async () => {
  const f = workspace(),
    spell = PF2E_SPELLS.find((s) => s.name === "Frostbite");
  let state = { enabled: false, excluded: [spell.id], motion: false },
    saves = 0,
    customAutomation = 0;
  const saved = Array.from({ length: 200 }, (_, i) => ({ id: `custom-${i}` }));
  f.w.page = "spells";
  f.w.selectedSpell = spell.id;
  f.w.host = {
    recipes: () => saved,
    catalogState: () => state,
    setCatalogState: async (change) => {
      state = { ...state, ...change };
    },
    enabled: () => false,
    setEnabled: async () => {
      customAutomation++;
    },
    save: async () => {
      saves++;
    },
    environment: () => ({ systemId: "pf2e", ready: true }),
  };
  await f.click({ action: "use-spell" });
  assert.equal(state.enabled, true);
  assert.equal(state.independent, true);
  assert.equal(state.scope, "selected");
  assert.deepEqual(state.selected, [spell.id]);
  assert.deepEqual(state.excluded, []);
  assert.equal(state.motion, false);
  assert.equal(saves, 0);
  assert.equal(customAutomation, 0);
  assert.equal(saved.length, 200);
  assert.equal(f.w.page, "spells");
});
test("Use entire catalog enables defaults in one action without activating unrelated saved recipes", async () => {
  const f = workspace();
  let state = { enabled: false, excluded: [], motion: false };
  f.w.host = {
    catalogState: () => state,
    setCatalogState: async (change) => {
      state = { ...state, ...change };
    },
    enabled: () => false,
    setEnabled: async () => assert.fail("Must not activate custom automation"),
  };
  await f.click({ action: "catalog-auto" });
  assert.equal(state.enabled, true);
  assert.equal(state.scope, "all");
  assert.equal(state.independent, true);
  assert.equal(state.preferCatalog, true);
  await f.click({ action: "catalog-auto" });
  assert.equal(state.enabled, false);
});
test("Customize switches to saved edits without deleting a prior catalog choice or duplicating recipes", async () => {
  const f = workspace(),
    spell = PF2E_SPELLS.find((s) => s.name === "Shield");
  let state = {
    enabled: true,
    independent: true,
    scope: "all",
    preferCatalog: true,
    selected: [spell.id],
    customized: [],
  };
  const recipe = {
    ...spellRecipe(spell),
    name: "Custom Shield",
    enabled: false,
  };
  f.w.page = "spells";
  f.w.selectedSpell = spell.id;
  f.w.host = {
    recipes: () => [recipe],
    save: async () => assert.fail("Must reuse existing edits"),
    catalogState: () => state,
    setCatalogState: async (change) => {
      state = { ...state, ...change };
    },
  };
  await f.click({ action: "copy-spell" });
  assert.equal(f.w.page, "recipes");
  assert.equal(f.w.selected, recipe.id);
  assert.deepEqual(state.selected, []);
  assert.deepEqual(state.customized, [spell.id]);
  assert.equal(recipe.name, "Custom Shield");
  assert.equal(recipe.enabled, false);
});
test("clicking current recipe, stage or preview tab does not redraw", async () => {
  const f = workspace();
  f.w.studio = true;
  await f.click({ action: "stage", index: "0" });
  await f.click({ action: "select", id: "frost" });
  await f.click({ action: "preview-mode", mode: "recipe" });
  assert.equal(f.renders(), 0);
  f.w.studio = false;
  await f.click({ action: "select", id: "frost" });
  assert.equal(f.w.studio, true, "picking a recipe opens it in the studio");
});

test("New recipe opens an unconfigured manual draft and saves only after choosing an asset", async () => {
  const f = workspace();
  let saved = [spellRecipe(PF2E_SPELLS.find((s) => s.name === "Shield"))],
    saves = 0;
  const original = saved[0];
  f.w.host = {
    recipes: () => saved,
    save: async (recipes) => {
      saved = recipes;
      saves++;
    },
    catalog: () => [],
  };
  f.w.search = "shield";
  f.w.previewMode = "stage";
  await f.click({ action: "new" });
  assert.equal(f.w.page, "recipes");
  assert.equal(saves, 0);
  const draft = f.w.recipe();
  assert.equal(draft.name, "Untitled recipe");
  assert.equal(draft.description, "");
  assert.equal(draft.trigger, "manual");
  assert.equal(draft.category, "Custom");
  assert.equal(draft.stages.length, 1);
  assert.deepEqual(draft.stages[0].assets, []);
  assert.equal(draft.match, "");
  assert.equal(draft.itemUuid, "");
  await f.click({ action: "save" });
  assert.equal(saves, 0);
  assert.ok(f.w.dirty.has(draft.id));
  assert.ok(f.w.dirty.has(draft.id));
  assert.equal(f.w.previewMode, "recipe");
  assert.equal(f.w.search, "");
  assert.ok(f.w.listedRecipes().some((r) => r.id === draft.id));
  await f.click({ action: "select", id: original.id });
  await f.click({ action: "select", id: draft.id });
  assert.equal(f.w.recipe(), draft);
  await f.click({ action: "choose-asset", key: "jb2a.impact.001.blue" });
  await f.click({ action: "save" });
  assert.equal(saved.length, 2);
  assert.equal(saved[0], original);
  assert.deepEqual(saved[1].stages[0].assets, ["jb2a.impact.001.blue"]);
  assert.equal(saves, 1);
  assert.equal(f.w.dirty.has(draft.id), false);
});

test("new draft deletion never writes saved recipes or asks to delete world data", async () => {
  const f = workspace();
  f.w.host = {
    recipes: () => [],
    save: () => assert.fail("Unsaved draft must not write world settings"),
    confirm: () => assert.fail("Draft discard needs no deletion prompt"),
  };
  await f.click({ action: "new" });
  await f.click({ action: "delete" });
  assert.equal(f.w.listedRecipes().length, 0);
  assert.equal(f.w.dirty.size, 0);
});

test("Chromatic Orb starter requires explicit selection; reverting a new draft discards it", async () => {
  const f = workspace();
  f.w.host = { recipes: () => [], catalog: () => [] };
  await f.click({ action: "orb-builder" });
  assert.equal(f.w.page, "builder");
  assert.equal(f.w.builder.element, "fire");
  await f.click({ action: "new-basic" });
  assert.equal(f.w.page, "recipes");
  assert.equal(f.w.builder, null);
  assert.equal(f.w.recipe().stages.length, 1);
  await f.click({ action: "revert" });
  assert.equal(f.w.listedRecipes().length, 0);
  assert.equal(f.w.recipe(), undefined);
});
test("stage navigation updates selected stage without replacing library", async () => {
  const f = workspace();
  let updates = 0;
  f.w.updateInspector = () => {
    updates++;
  };
  await f.click({ action: "stage", index: "1" });
  assert.equal(f.w.stageIndex, 1);
  assert.equal(f.renders(), 0);
  assert.equal(updates, 1);
});

test("motion recipes expose unavailable channel before automatic playback", () => {
  const { w } = workspace();
  w.host = { environment: () => ({ motionReady: false }), catalog: () => [] };
  const recipe = { stages: [{ kind: "motion" }] };
  assert.equal(w.status(recipe), "Token motion channel unavailable");
  w.host.environment = () => ({ motionReady: true });
  assert.equal(w.status(recipe), "Ready to play");
  w.host.environment = () => ({ motionReady: false });
  w.host.environment = () => ({ motionReady: false, demo: true });
  assert.equal(w.status(recipe), "Ready to play");
});

test("recipe editor shows loaded server version and keeps table playback blocked until manifest reload", () => {
  const { w } = workspace();
  const recipe = spellRecipe(PF2E_SPELLS.find((s) => s.name === "Frostbite"));
  w.host = {
    environment: () => ({ motionReady: false, motionServerVersion: "0.1.0" }),
    catalog: () => [],
  };
  w.recipePreviewHTML = () => "<div data-recipe-scene></div>";
  const blocked = studioHTML(w, recipe);
  assert.match(blocked, /Server loaded Animater 0\.1\.0/);
  assert.match(blocked, /data-action="play"[^>]*disabled/);
  assert.doesNotMatch(blocked, /Server restart required/);
  w.host.environment = () => ({
    motionReady: true,
    motionServerVersion: "0.2.0",
  });
  assert.doesNotMatch(w.inspectorHTML(recipe), /an-sync-notice/);
});

test("catalog customization preserves saved recipes and reopens bound overrides without duplicating", async () => {
  const f = workspace();
  const spell = PF2E_SPELLS.find((s) => s.name === "Shield");
  const untouched = { id: "mine", name: "User recipe", stages: [] };
  let saved = [untouched];
  let saves = 0;
  f.w.host = {
    recipes: () => saved,
    save: async (recipes) => {
      saves++;
      saved = recipes;
    },
  };
  f.w.page = "spells";
  f.w.selectedSpell = spell.id;
  await f.click({ action: "copy-spell" });
  assert.equal(f.w.page, "recipes");
  assert.equal(saved.length, 2);
  assert.equal(saved[0], untouched);
  assert.equal(
    saved[1].itemUuid,
    `Compendium.pf2e.spells-srd.Item.${spell.id}`,
  );
  saved[1] = {
    ...saved[1],
    id: "renamed-id",
    name: "Customized shield",
    enabled: false,
  };
  f.w.page = "spells";
  await f.click({ action: "copy-spell" });
  assert.equal(f.w.selected, "renamed-id");
  assert.equal(saved[1].name, "Customized shield");
  assert.equal(saved[1].enabled, false);
  assert.equal(saved.length, 2);
  assert.equal(saves, 1);
});

test("full catalog stays browsable when editable recipe storage is full", async () => {
  const f = workspace();
  const spell = PF2E_SPELLS.find((s) => s.name === "Shield");
  const saved = Array.from({ length: 200 }, (_, i) => ({ id: `custom-${i}` }));
  f.w.page = "spells";
  f.w.selectedSpell = spell.id;
  f.w.host = {
    recipes: () => saved,
    save: async (recipes) => {
      assert.equal(recipes.length, 201);
      throw Error("Maximum 200 saved recipes.");
    },
  };
  await f.click({ action: "copy-spell" });
  assert.equal(saved.length, 200);
  assert.equal(f.w.page, "spells");
  assert.equal(f.w.message, "Maximum 200 saved recipes.");
  assert.deepEqual(f.w.recipe(), spellRecipe(spell));
});
test("catalog motion switch changes built-in preview and customization without saving over existing recipes", async () => {
  const f = workspace(),
    s = PF2E_SPELLS.find((s) => s.name === "Frostbite");
  let state = { enabled: false, excluded: [] };
  f.w.page = "spells";
  f.w.selectedSpell = s.id;
  f.w.host = {
    catalogState: () => state,
    setCatalogState: async (change) => {
      state = { ...state, ...change };
    },
    recipes: () => [],
  };
  assert.ok(f.w.recipe().stages.some((s) => s.kind === "motion"));
  await f.click({ action: "catalog-motion" });
  assert.equal(state.motion, false);
  assert.ok(f.w.recipe().stages.every((s) => s.kind !== "motion"));
  await f.click({ action: "catalog-motion" });
  assert.equal(state.motion, true);
  assert.ok(f.w.recipe().stages.some((s) => s.kind === "motion"));
});

test("workspace warns when neither JB2A module is active", async () => {
  const { JB2A_MISSING } = await import("../scripts/workspace.mjs");
  const w = Object.create(Workspace.prototype);
  assert.match(w.envBannerHTML({ ready: true, jb2a: false }), /Neither JB2A module is active/);
  assert.ok(w.envBannerHTML({ ready: true, jb2a: false }).includes('data-page="setup"'));
  assert.equal(w.envBannerHTML({ ready: true, jb2a: true }), "");
  assert.match(w.envBannerHTML({ ready: false, jb2a: false, problem: "Activate Sequencer, then reload Foundry." }), /Activate Sequencer/, "Sequencer problems come first");
  assert.equal(w.envBannerHTML({ ready: true, demo: true }), "", "design preview without the flag shows nothing");
  assert.match(JB2A_MISSING, /JB2A Free.*JB2A Patreon/);
});

test("the GM opens a player's animation in the Studio, edits it for them and approves that version", async () => {
  const f = workspace();
  const mine = [{ id: "frost", name: "Frost", trigger: "manual", stages: [{ kind: "impact", assets: ["jb2a.impact.001.orange"] }] }];
  let theirs = [{ id: "p1", name: "Untitled recipe", trigger: "attack", stages: [{ kind: "impact", assets: ["jb2a.impact.001.orange"] }] }];
  let reviewing = null;
  const decisions = [];
  f.w.host = {
    recipes: () => (reviewing ? theirs : mine),
    review: (id) => { reviewing = id; },
    reviewing: () => (reviewing ? { userId: reviewing, userName: "Oded" } : null),
    approvalState: (r) => (reviewing ? (decisions.some((d) => d.recipe.name === r.name) ? "approved" : "pending") : null),
    decidePlayerRecipe: async (userId, recipe, status) => decisions.push({ userId, recipe, status }),
    save: async (data) => { if (reviewing) theirs = data; else throw Error("saved the GM's recipes"); },
  };
  await f.click({ action: "player-open", user: "oded", id: "p1" });
  assert.equal(f.w.selected, "p1");
  assert.ok(f.w.studio);
  assert.match(f.w.reviewBannerHTML(), /Reviewing Oded's animations[\s\S]*review-approve/);
  assert.equal(f.w.playerReviewHTML(), "", "no review list while reviewing");
  f.w.edit().name = "Oded's strike";
  assert.match(f.w.reviewBannerHTML(), /save your edits before approving/);
  await f.click({ action: "review-approve" });
  assert.equal(decisions.length, 0, "unsaved edits are never approved");
  await f.click({ action: "review-done" });
  assert.equal(reviewing, "oded", "unsaved edits keep the review open");
  await f.w.host.save([f.w.recipe()]);
  f.w.drafts.clear(); f.w.dirty.clear();
  await f.click({ action: "review-approve" });
  assert.deepEqual(decisions.map((d) => [d.userId, d.recipe.name, d.status]), [["oded", "Oded's strike", "approved"]]);
  await f.click({ action: "review-done" });
  assert.equal(reviewing, null);
  assert.equal(f.w.selected, "frost");
  assert.equal(f.w.studio, false);
});
