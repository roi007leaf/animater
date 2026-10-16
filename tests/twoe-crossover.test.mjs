import test from "node:test";
import assert from "node:assert/strict";
import { crossoverSystem, crossoverState, crossoverResolve, twoeCatalogRecipe, twoeSettingKey } from "../scripts/twoe-crossover.mjs";

const on = { enabled: true, scope: "all", motion: false, sound: true, soundVolume: 0.6 };
const stateFor = (state) => () => crossoverState(state);
const laserRifle = { type: "weapon", name: "Aeon Rifle", slug: "aeon-rifle", system: { slug: "aeon-rifle" } };
const toads = { type: "spell", name: "500 Toads", slug: "500-toads", system: { slug: "500-toads" } };

test("PF2e and SF2e cross over to each other only", () => {
  assert.equal(crossoverSystem("pf2e"), "sf2e");
  assert.equal(crossoverSystem("sf2e"), "pf2e");
  assert.equal(crossoverSystem("dnd5e"), null);
  assert.equal(twoeSettingKey("pf2e", "weapon"), "weaponCatalog");
  assert.equal(twoeSettingKey("sf2e", "weapon"), "sf2eWeaponCatalog");
});

test("a borrowed catalog follows this world's catalog of the same kind", () => {
  assert.deepEqual(crossoverState(on), { enabled: true, independent: true, scope: "all", selected: [], excluded: [], customized: [], preferCatalog: false, motion: false, sound: true, soundVolume: 0.6 });
  assert.equal(crossoverState({ enabled: true, scope: "selected" }).enabled, false);
  assert.equal(crossoverState(null).enabled, false);
});

test("an SF2e-only weapon resolves from the SF2e catalog with this world's motion choice", () => {
  const event = { type: "attack", systemId: "sf2e", weaponMode: "ranged", item: laserRifle };
  const recipe = twoeCatalogRecipe("sf2e", event, [], { stateFor: stateFor(on), customEnabled: false });
  assert.equal(recipe?.systemId, "sf2e");
  assert.equal(recipe.name, "Aeon Rifle");
  assert.equal(twoeCatalogRecipe("sf2e", event, [], { stateFor: stateFor({ ...on, enabled: false }), customEnabled: false }), null);
});

test("a PF2e-only spell resolves from the PF2e catalog in an SF2e world", () => {
  const recipe = ["use", "template", "attack"].map((type) => twoeCatalogRecipe("pf2e", { type, systemId: "pf2e", item: toads }, [], { stateFor: stateFor(on), customEnabled: false })).find(Boolean);
  assert.equal(recipe?.name, "500 Toads");
});

test("crossover runs only when on and only for items this world does not know", () => {
  const calls = [];
  const resolve = (sys, event) => (calls.push([sys, event.systemId]), sys === "sf2e" ? { id: "sf" } : null);
  const event = { type: "attack", systemId: "pf2e", item: laserRifle };
  assert.equal(crossoverResolve(event, { systemId: "pf2e", on: false, resolve, knows: () => false }), null);
  assert.deepEqual(calls, [["pf2e", "pf2e"]]);
  calls.length = 0;
  assert.deepEqual(crossoverResolve(event, { systemId: "pf2e", on: true, resolve, knows: () => false }), { id: "sf" });
  assert.deepEqual(calls, [["pf2e", "pf2e"], ["sf2e", "sf2e"]]);
  // Excluded or disabled in this world: stays silent, never swapped for the other system's look.
  assert.equal(crossoverResolve(event, { systemId: "pf2e", on: true, resolve, knows: () => true }), null);
  // This world's own recipe always wins.
  assert.deepEqual(crossoverResolve(event, { systemId: "sf2e", on: true, resolve, knows: () => false }), { id: "sf" });
  assert.equal(crossoverResolve(event, { systemId: "dnd5e", on: true, resolve: () => null, knows: () => false }), null);
});
