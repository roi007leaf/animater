import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDamageType, damageFromMessage, damageFromParts, recallDamage, hitRecipe, deathRecipe, DAMAGE_MEMORY_MS } from "../scripts/damage-moments.mjs";
import { validateRecipe } from "../scripts/model.mjs";

test("every system's damage names share one look", () => {
  assert.equal(normalizeDamageType("Lightning"), "electricity");
  assert.equal(normalizeDamageType("necrotic"), "void");
  assert.equal(normalizeDamageType("radiant"), "vitality");
  assert.equal(normalizeDamageType("psychic"), "mental");
  assert.equal(normalizeDamageType("fire"), "fire");
});

test("a PF2e damage roll gives its biggest damage type and its target", () => {
  class DamageRoll { constructor(instances) { this.instances = instances; } }
  const message = { rolls: [new DamageRoll([{ type: "slashing", total: 4 }, { type: "fire", total: 9 }])], flags: { pf2e: { context: { type: "damage-roll", target: { actor: "Actor.abc", token: "Scene.s.Token.tok" } } } } };
  const d = damageFromMessage(message, "pf2e");
  assert.equal(d.type, "fire");
  assert.ok(d.tokenIds.has("tok") && d.actorIds.has("abc"));
  assert.equal(damageFromMessage({ rolls: [], flags: { pf2e: { context: { type: "attack-roll" } } } }, "pf2e"), null);
});

test("a D&D damage roll reads its roll type and targets", () => {
  const message = { rolls: [{ options: { type: "cold" }, total: 7 }], flags: { dnd5e: { roll: { type: "damage" }, targets: [{ uuid: "Actor.orc" }] } } };
  const d = damageFromMessage(message, "dnd5e");
  assert.equal(d.type, "cold");
  assert.ok(d.actorIds.has("orc"));
});

test("D&D applied damage parts give the biggest type for that actor", () => {
  const d = damageFromParts([{ type: "slashing", value: 3 }, { type: "necrotic", value: 8 }, { type: "fire", value: 0 }], "orc");
  assert.equal(d.type, "void");
  assert.ok(d.actorIds.has("orc"));
  assert.equal(damageFromParts([], "orc"), null);
});

test("the damage a creature took is the newest roll aimed at it, else an untargeted one, while fresh", () => {
  const now = 100000;
  const log = [
    { type: "fire", tokenIds: new Set(["a"]), actorIds: new Set(), at: now - 5000 },
    { type: "cold", tokenIds: new Set(), actorIds: new Set(), at: now - 1000 },
    { type: "acid", tokenIds: new Set(["a"]), actorIds: new Set(), at: now - DAMAGE_MEMORY_MS - 1 },
  ];
  assert.equal(recallDamage(log, { tokenId: "a" }, now).type, "fire");
  assert.equal(recallDamage(log, { tokenId: "b" }, now).type, "cold");
  assert.equal(recallDamage(log.slice(2), { tokenId: "a" }, now), null);
});

test("energy damage flashes on the token; physical damage does not; knockouts finish the collapse", () => {
  const collapse = { id: "c", name: "Collapse", trigger: "manual", stages: [{ stageId: "collapse", kind: "motion", motion: "collapse", subject: "source", duration: 1800, assets: [] }] };
  assert.equal(hitRecipe("slashing"), null);
  assert.equal(hitRecipe(undefined), null);
  const hit = validateRecipe(hitRecipe("fire"));
  assert.equal(hit.stages[0].kind, "cast", "plays on the damaged token");
  assert.equal(deathRecipe("piercing", collapse), collapse, "physical keeps the plain collapse");
  const death = validateRecipe(deathRecipe("cold", collapse));
  assert.deepEqual(death.stages.map((s) => s.kind), ["motion", "cast", "cast"]);
  assert.match(death.name, /freezes and shatters/);
});
