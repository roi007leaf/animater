import test from "node:test";
import assert from "node:assert/strict";
import { teleportPlan, itemRangeFeet, withinReach } from "../scripts/teleport.mjs";
import { validateRecipe } from "../scripts/model.mjs";

test("known teleport spells teleport by default; a recipe can turn it off or change it", () => {
  assert.deepEqual(teleportPlan({ match: "Misty Step,misty-step" }), { who: "source", range: 30, adjacent: false });
  assert.deepEqual(teleportPlan({ match: "Friendfetch" }), { who: "target", range: 0, adjacent: true });
  assert.equal(teleportPlan({ match: "Fireball,fireball" }), null);
  assert.equal(teleportPlan({ match: "Translocate", teleport: "none" }), null, "off wins");
  assert.deepEqual(teleportPlan({ match: "Fireball", teleport: "source", teleportRange: 60 }), { who: "source", range: 60, adjacent: false });
});

test("ranges come from the spell: PF2e text, D&D value and units", () => {
  assert.equal(itemRangeFeet({ system: { range: { value: "120 feet" } } }), 120);
  assert.equal(itemRangeFeet({ system: { range: { value: "touch" } } }), 5);
  assert.equal(itemRangeFeet({ system: { range: { value: 30, units: "ft" } } }), 30);
  assert.equal(itemRangeFeet({ system: { range: { value: 1, units: "mi" } } }), 5280);
  assert.equal(itemRangeFeet({ system: { range: { units: "self" } } }), null);
});

test("reach counts from the caster's edge to the mover's edge", () => {
  const base = { from: { x: 0, y: 0 }, fromSize: 100, toSize: 100, gridSize: 100, gridDistance: 5 };
  assert.ok(withinReach({ ...base, to: { x: 700, y: 0 }, feet: 30 }), "6 squares away plus both halves");
  assert.ok(!withinReach({ ...base, to: { x: 800, y: 0 }, feet: 30 }));
  assert.ok(withinReach({ ...base, to: { x: 100, y: 100 }, feet: 5 }), "adjacent diagonally");
  assert.ok(withinReach({ ...base, to: { x: 99999, y: 0 }, feet: Infinity }));
});

test("recipes keep their teleport settings", () => {
  const r = validateRecipe({ id: "t", name: "T", trigger: "use", stages: [{ kind: "cast", assets: ["jb2a.misty_step.01.blue"] }], teleport: "target", teleportRange: 45, teleportAdjacent: true });
  assert.deepEqual([r.teleport, r.teleportRange, r.teleportAdjacent], ["target", 45, true]);
  assert.equal(validateRecipe({ id: "t", name: "T", trigger: "use", stages: [{ kind: "cast", assets: ["jb2a.misty_step.01.blue"] }], teleport: "everyone" }).teleport, undefined);
});
