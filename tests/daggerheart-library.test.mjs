import test from "node:test";
import assert from "node:assert/strict";
import { catalogNavigation, catalogPageAllowed, catalogPageTitle, worldCatalogSystem } from "../scripts/catalog-system.mjs";
import { DndCatalogWorkspace } from "../scripts/dnd5e-catalog-ui.mjs";
import { dhCatalogProfile, dhEntries, useDhEntry, normalizeDhCatalogState } from "../scripts/daggerheart-catalog.mjs";
import { dhActorStates, dhStateVisible, resolveDhStateRecipe, dhDefeatedStates, dhStateHost, DH_DEFEATED_STATUSES } from "../scripts/daggerheart-states.mjs";
import { dualityAccentRecipe, dualityAccent, HOPE_ASSETS, FEAR_ASSETS } from "../scripts/daggerheart.mjs";
import { catalogStoreFor } from "../scripts/activity-actions.mjs";
import { validateRecipe } from "../scripts/model.mjs";
import { rollMessage, dualityRoll, adversaryRoll } from "./fixtures/daggerheart-messages.mjs";

test("the Daggerheart LIBRARY group: domain cards, weapons, conditions", () => {
  const env = { systemId: "daggerheart" };
  assert.equal(worldCatalogSystem(env), "daggerheart");
  assert.deepEqual(catalogNavigation(env), [["spells", "✧", "Daggerheart domain cards"], ["weapons", "➶", "Daggerheart weapons"], ["conditions", "◎", "Daggerheart conditions"]]);
  for (const page of ["feats", "actions", "features", "items", "effects"]) assert.equal(catalogPageAllowed(page, env), false, page);
  assert.equal(catalogPageAllowed("recipes", env), true);
  assert.equal(catalogPageTitle("spells", env), "Daggerheart domain card catalog");
  assert.equal(catalogPageTitle("conditions", env), "Daggerheart condition catalog");
  assert.equal(catalogPageTitle("activity", env), "Playback activity");
  assert.equal(catalogNavigation({ systemId: "dnd5e" })[0][2], "D&D 5e spells", "other systems unchanged");
});

function workspace(page = "spells") {
  const states = {}, opened = [];
  const w = { page, stageIndex: 0, host: { environment: () => ({ systemId: "daggerheart", ready: true }), dhCatalogState: (k) => states[k], setDhCatalogState: async (k, v) => { states[k] = { ...states[k], ...v }; },
    recipes: () => [], soundCatalog: () => null, resolveItem: async (uuid) => ({ sheet: { render: async () => opened.push(uuid) } }) }, recipePreviewHTML: () => "", render() {}, recipe() { return ui.recipe(); } };
  const ui = new DndCatalogWorkspace(w, dhCatalogProfile);
  return { ui, w, states, opened };
}

test("the domain card page: Daggerheart labels, levels 1-10, domain chips that filter, Use and details", async () => {
  const { ui, states, opened } = workspace();
  const html = ui.html();
  assert.ok(html.includes("DAGGERHEART · NATIVE CATALOG"));
  assert.ok(html.includes("210 domain cards"));
  assert.ok(html.includes("Level 10"));
  for (const absent of ["Cantrip", "2014", "D&D", "SF2e", "PF2e"]) assert.ok(!html.includes(absent), absent);
  assert.ok(html.includes('data-action="dnd-chip" data-value="Midnight"'));
  await ui.action("dnd-chip", { dataset: { value: "Midnight" } });
  const midnight = ui.matches();
  assert.equal(midnight.length, 21);
  assert.ok(midnight.every((e) => e.theme === "Midnight"));
  assert.ok(ui.html().includes('aria-pressed="true">Midnight'));
  await ui.action("dnd-details", {});
  assert.equal(opened[0], ui.entry().uuid);
  await ui.action("dnd-use", {});
  assert.ok(states.card.selected.includes(ui.entry().id));
  await ui.action("dnd-chip", { dataset: { value: "all" } });
  assert.equal(ui.matches().length, 210);
});

test("the weapon and condition pages", () => {
  const weapons = workspace("weapons").ui.html();
  assert.ok(weapons.includes("Weapon family"));
  assert.ok(weapons.includes("326 weapons"));
  const conditions = workspace("conditions").ui.html();
  assert.ok(conditions.includes("Lasting animation"), "persistent controls");
  assert.ok(conditions.includes("Death move"));
});

test("conditions as persistent states: Vulnerable, Hidden, Restrained; the defeated set follows the Defeated look", () => {
  const effect = (id, statuses, extra = {}) => ({ id, uuid: `Actor.a.ActiveEffect.${id}`, name: id, statuses: new Set(statuses), active: true, ...extra });
  const actor = { uuid: "Actor.a", appliedEffects: [effect("v", ["vulnerable"]), effect("d", ["dead"]), effect("buff", []), effect("off", ["hidden"], { disabled: true })], statuses: new Set(["vulnerable", "restrained", "dead"]) };
  const states = dhActorStates(actor);
  assert.deepEqual(states.map((s) => s.statusId ?? s.type), ["vulnerable", "effect", "restrained"]);
  assert.equal(states[0].document.id, "v");
  const on = { ...normalizeDhCatalogState(), enabled: true, scope: "all" };
  assert.equal(resolveDhStateRecipe(states[0], on).name, "Vulnerable");
  assert.equal(resolveDhStateRecipe(states[0], normalizeDhCatalogState()), null, "catalog off");
  assert.equal(dhStateHost.stateKind(states[0]), "condition");
  assert.equal(dhStateHost.documentKey(states[0]), "condition:vulnerable");
  assert.deepEqual([...DH_DEFEATED_STATUSES], ["defeated", "unconscious", "dead"]);
  const defeated = { effects: [effect("x", ["unconscious"]), effect("y", ["dead"])] };
  assert.equal(dhDefeatedStates(defeated, "effect").length, 2);
  assert.equal(dhDefeatedStates(defeated, "overlay").length, 0);
  const hidden = { type: "condition", statusId: "hidden" }, token = { visible: true, document: { hidden: false } };
  assert.equal(dhStateVisible(hidden, token, { isGM: true }), true);
  assert.equal(dhStateVisible(hidden, token, { isGM: false }), false, "only owners and the GM see Hidden");
  assert.equal(dhStateVisible(hidden, { ...token, isOwner: true }, { isGM: false }), true);
  assert.equal(dhStateVisible({ type: "condition", statusId: "vulnerable" }, token), true);
});

test("Hope and Fear accents: gold or purple on the roller, none for a critical or a d20 roll", () => {
  const hope = validateRecipe(dualityAccentRecipe("hope")), fear = validateRecipe(dualityAccentRecipe("fear"));
  assert.deepEqual(hope.stages[0].assets, [...HOPE_ASSETS]);
  assert.deepEqual(fear.stages[0].assets, [...FEAR_ASSETS]);
  assert.ok(hope.stages[0].duration <= 700);
  assert.equal(dualityAccentRecipe("critical"), null);
  assert.equal(dualityAccent(rollMessage({ roll: dualityRoll({ hope: 9, fear: 2 }) }), "u").recipe.name, "Hope");
  assert.equal(dualityAccent(rollMessage({ roll: dualityRoll({ hope: 2, fear: 9 }) }), "u").tokenId, "t");
  assert.equal(dualityAccent(rollMessage({ roll: dualityRoll({ hope: 4, fear: 4 }) }), "u"), null);
  assert.equal(dualityAccent(rollMessage({ type: "adversaryRoll", roll: adversaryRoll() }), "u"), null);
  assert.equal(dualityAccent(rollMessage({ roll: dualityRoll({ hope: 9, fear: 2 }), whisper: ["gm"] }), "u"), null);
  assert.equal(dualityAccent(rollMessage({ roll: dualityRoll({ hope: 9, fear: 2 }), author: "other" }), "u"), null);
  assert.ok(dualityAccent(rollMessage({ roll: dualityRoll({ hope: 9, fear: 2, type: "trait" }) }), "u"), "any duality roll, not only attacks");
});

test("Activity Exclude reaches the Daggerheart catalog settings", async () => {
  const states = {}, host = { dhCatalogState: (k) => states[k] ?? {}, setDhCatalogState: async (k, c) => { states[k] = c; } };
  const store = catalogStoreFor(host, { type: "catalog", system: "daggerheart", kind: "card", id: dhEntries("card")[0].id });
  await store.set(useDhEntry(store.get(), dhEntries("card")[0].id));
  assert.ok(states.card.selected.includes(dhEntries("card")[0].id));
});
