import test from "node:test";
import assert from "node:assert/strict";
import { FINISHERS, pickFinisher, finisherRecipe } from "../scripts/finishers.mjs";
import { validateRecipe, installedAssets } from "../scripts/model.mjs";
import { CRIT_IMPACT_SCALE } from "../scripts/outcome.mjs";
import { assetDatabases } from "../tools/asset-databases.mjs";

const pick = (attackKind, damageType, crit = false) => pickFinisher({ attackKind, damageType, crit }, () => 0).id;

test("the killing blow's kind and damage pick the finisher", () => {
  assert.equal(pick("melee", "bludgeoning"), "launch");
  assert.equal(pick("melee", "slashing"), "cleave");
  assert.equal(pick("melee", "piercing"), "skewer");
  assert.equal(pick("ranged", "piercing"), "struck-down");
  assert.equal(pick("spell", "bludgeoning"), "launch");
  assert.equal(pick("other", "slashing"), "cleave", "unknown kind falls back to the melee look");
  assert.equal(pick("melee", "fire"), "ash", "energy damage wins over attack kind");
  assert.equal(pick("ranged", "cold"), "shatter");
  assert.equal(pick("spell", "lightning"), "jolt", "system names fold onto one look");
  assert.equal(pick("spell", "force"), "blast");
  assert.equal(pick("melee", "necrotic"), "unmade");
  assert.equal(pick("melee", "acid"), "melt");
  assert.equal(pick("spell", "radiant"), "ascend");
  assert.equal(pick("spell", "sonic"), "shaken-apart");
  assert.equal(pick("spell", "psychic"), "soul-leaves");
  assert.equal(pick("spell", "spirit"), "soul-leaves");
  assert.equal(pick("melee", "poison"), "fall");
  assert.equal(pick("ranged", "bleed"), "fall");
  assert.equal(pick(undefined, undefined), "fall");
});

test("knockback distance comes from the finisher's range, and a critical adds a square", () => {
  assert.equal(pickFinisher({ attackKind: "melee", damageType: "bludgeoning" }, () => 0).squares, 2);
  assert.equal(pickFinisher({ attackKind: "melee", damageType: "bludgeoning" }, () => 0.99).squares, 3);
  assert.equal(pickFinisher({ attackKind: "melee", damageType: "bludgeoning", crit: true }, () => 0).squares, 3);
  assert.equal(pickFinisher({ damageType: "force" }, () => 0).squares, 3);
  assert.equal(pickFinisher({ attackKind: "melee", damageType: "slashing", crit: true }, () => 0).squares, 0, "in-place finishers stay in place");
});

test("every finisher builds a valid recipe that hides the real token first", () => {
  for (const id of Object.keys(FINISHERS)) {
    const recipe = validateRecipe(finisherRecipe(id, { dx: 2, dy: -1, damageType: "spirit" }));
    assert.equal(recipe.stages[0].motion, "vanish", id);
    assert.equal(recipe.stages[0].duration, FINISHERS[id].flight + 600, id);
    assert.ok(recipe.stages.some((s) => s.kind === "sprite"), `${id} has a visible copy`);
    assert.ok(recipe.stages.length <= 16, id);
  }
});

test("flying finishers land their copy and their landing dust at the landing square", () => {
  const recipe = validateRecipe(finisherRecipe("launch", { dx: 3, dy: -1 }));
  const body = recipe.stages.find((s) => s.stageId === "body");
  assert.equal(body.tracks.find((t) => t.property === "position.x").to, 3);
  assert.equal(body.tracks.find((t) => t.property === "position.y").to, -1);
  const landing = recipe.stages.find((s) => s.stageId === "landing");
  assert.equal(landing.offsetX, 3);
  assert.equal(landing.offsetY, -1);
});

test("a critical finisher hits harder", () => {
  const plain = finisherRecipe("launch", {}).stages.find((s) => s.stageId === "hit");
  const crit = finisherRecipe("launch", { crit: true }).stages.find((s) => s.stageId === "hit");
  assert.equal(crit.scale, plain.scale * CRIT_IMPACT_SCALE);
});

test("an unknown id plays the plain fall", () => {
  assert.equal(finisherRecipe("nope").id, "animater-finisher-fall");
});

test("every finisher effect resolves in JB2A Patreon, and Free keeps at least the copies", async () => {
  const db = await assetDatabases();
  for (const id of Object.keys(FINISHERS)) {
    const recipe = validateRecipe(finisherRecipe(id, { dx: 1, dy: 0, damageType: "spirit" }));
    for (const s of recipe.stages.filter((s) => s.kind === "cast"))
      assert.ok(installedAssets(s, db.patreon).length, `${id}/${s.stageId}: ${s.assets.join(", ")}`);
    assert.ok(recipe.stages.some((s) => s.kind === "sprite"));
  }
});
