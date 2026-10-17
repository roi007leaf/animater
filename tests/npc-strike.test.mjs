import test from "node:test";
import assert from "node:assert/strict";
import { twoeCatalogRecipe } from "../scripts/twoe-crossover.mjs";
import { findCatalogWeapon } from "../scripts/weapon-catalog.mjs";

const on = { enabled: true, scope: "all", independent: true };
const resolve = (item, weaponMode = "melee") =>
  twoeCatalogRecipe("pf2e", { type: "attack", systemId: "pf2e", item, weaponMode }, [], { customEnabled: false, stateFor: () => on });

test("an NPC Strike (a melee item) plays its weapon's catalog animation", () => {
  const mace = { type: "melee", name: "Light Mace", system: { slug: null, traits: { value: ["agile", "finesse", "shove"] } } };
  assert.equal(findCatalogWeapon({ type: "attack", item: mace })?.slug, "light-mace");
  const r = resolve(mace);
  assert.ok(r, "the NPC's light mace animates");
  assert.equal(r.trigger, "attack");
});

test("an NPC Strike linked to a carried weapon plays that weapon", () => {
  const sword = { type: "weapon", name: "Longsword", system: { slug: "longsword", group: "sword" } };
  const strike = { type: "melee", name: "Ancestral Blade", linkedWeapon: sword, system: { traits: { value: [] } } };
  assert.equal(findCatalogWeapon({ type: "attack", item: strike })?.slug, "longsword");
});

test("an NPC natural attack the catalog does not know is not guessed", () => {
  assert.equal(findCatalogWeapon({ type: "attack", item: { type: "melee", name: "Jaws", system: { traits: { value: ["unarmed"] } } } }), null);
});

test("an NPC Fist punches like a PC's fist, named as itself", () => {
  const fist = { type: "melee", name: "Fist", system: { slug: "fist", traits: { value: ["agile", "nonlethal", "unarmed"] } } };
  const r = resolve(fist);
  assert.ok(r, "the NPC's fist animates");
  assert.equal(r.name, "Fist · melee");
  assert.match(r.id, /^pf2e-weapon-group-brawling-melee$/);
});

test("an NPC Strike linked to a homebrew weapon plays that weapon's group", () => {
  const blade = { type: "weapon", name: "Moonblade of Ys", system: { slug: "moonblade-of-ys", group: "sword" } };
  assert.equal(resolve({ type: "melee", name: "Moonblade of Ys", linkedWeapon: blade, system: { traits: { value: [] } } })?.name, "Moonblade of Ys · melee");
  assert.equal(resolve({ type: "melee", name: "Jaws", system: { traits: { value: ["unarmed"] } } }), null, "natural attacks are not guessed");
});
