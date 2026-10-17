import test from "node:test";
import assert from "node:assert/strict";
import { resolveAutomaticWeaponRecipe, standardWeapon } from "../scripts/weapon-catalog.mjs";
import { PF2E_ACTION_CATALOG, PF2E_ACTIONS } from "../scripts/ability-catalog.mjs";
import { applyEventElement } from "../scripts/element-choice.mjs";

const on = { enabled: true, scope: "all", independent: true };
const attack = (item, weaponMode) => resolveAutomaticWeaponRecipe({ type: "attack", systemId: "pf2e", item, weaponMode }, on, [], { customEnabled: false });

test("a weapon the catalog does not know plays its group's standard weapon, named as itself", () => {
  const fist = { type: "weapon", name: "Fist", slug: "basic-unarmed", category: "unarmed", system: { slug: "basic-unarmed", category: "unarmed", group: "brawling" } };
  const r = attack(fist, "melee");
  assert.ok(r, "a plain fist animates");
  assert.equal(r.name, "Fist · melee", "the Activity row names the attacker's own weapon");
  assert.match(r.id, /^pf2e-weapon-group-brawling-melee$/);
  assert.equal(standardWeapon({ system: { group: "sword" } }, "melee").slug, "longsword");
  assert.equal(standardWeapon({ system: { group: "bow" } }, "ranged").slug, "longbow");
  assert.equal(attack({ type: "weapon", name: "Moonblade of Ys", system: { slug: "moonblade-of-ys", group: "sword" } }, "melee")?.name, "Moonblade of Ys · melee", "homebrew swords swing like a longsword");
  assert.equal(standardWeapon({ system: { group: "spear" } }, "thrown").slug, "spear", "a group's standard in the mode used");
  assert.equal(attack({ type: "weapon", name: "Mystery", system: {} }, "melee"), null, "no group, no guess");
  assert.equal(resolveAutomaticWeaponRecipe({ type: "attack", systemId: "pf2e", item: fist, weaponMode: "melee" }, { enabled: false }, [], { customEnabled: false }), null, "the weapon catalog switch governs it");
});

test("a thrown weapon reported as ranged (or the reverse) still plays its throw", () => {
  const javelin = { type: "weapon", name: "Javelin", slug: "javelin", system: { slug: "javelin", group: "dart" } };
  assert.equal(attack(javelin, "ranged")?.name, "Javelin · thrown");
  assert.equal(attack(javelin, "thrown")?.name, "Javelin · thrown");
  assert.equal(attack({ type: "weapon", name: "Greatsword", slug: "greatsword", system: { slug: "greatsword" } }, "melee")?.name, "Greatsword · melee", "known weapons are unchanged");
});

test("Elemental Blast plays on its attack roll, in the blast's element", () => {
  const blast = PF2E_ACTIONS.find((e) => e.slug === "elemental-blast");
  assert.equal(blast.trigger, "attack");
  const item = { type: "action", name: "Elemental Blast", slug: "elemental-blast", system: { slug: "elemental-blast" } };
  const r = PF2E_ACTION_CATALOG.resolveAutomaticRecipe({ type: "attack", systemId: "pf2e", item }, on, [], { customEnabled: false });
  assert.equal(r?.trigger, "attack");
  assert.equal(r.elementChoice, true);
  const fire = applyEventElement(r, "fire");
  assert.ok(fire.stages.some((s) => s.tint === "#ff9a4d"), "fire blasts burn orange");
  assert.ok(applyEventElement(r, "water").stages.some((s) => s.tint === "#87d6ee"), "water blasts run blue");
});
