import test from "node:test";
import assert from "node:assert/strict";
import { dhEntries, dhEntry, dhRecipe, normalizeDhCatalogState, resolveDaggerheartAutomaticRecipe, weaponStages } from "../scripts/daggerheart-catalog.mjs";
import { weaponSoundDesign, cardSoundDesign, featureSoundDesign, utilitySoundDesign } from "../scripts/daggerheart-polish.mjs";
import { ABILITY_SOUND_PROFILES } from "../data/ability-sounds.mjs";
import { SOUND_PROFILES } from "../data/spell-sounds.mjs";
import { bodyTreatment } from "../scripts/condition-body.mjs";

// A sound catalog where every candidate is installed (as installedSoundCatalog gives it).
const sounds = { resolve: (c) => ({ module: c.module, file: c.file ?? `${c.key}.ogg`, duration: c.duration ?? 800, gain: 1 }) };
const named = (kind, name) => dhEntries(kind).find((e) => e.name === name);
const kinds = (recipe) => recipe.stages.map((s) => s.kind);

test("every Daggerheart attack, card, feature and ability variant has a registered sound design", () => {
  for (const entry of dhEntries()) for (const v of entry.variants) {
    if (entry.kind === "condition" && !entry.state?.moment) { assert.equal(v.sound, undefined, entry.name); continue; }
    assert.ok(v.sound?.profile, `${entry.name} ${v.id}`);
    const registry = v.sound.namespace === "ability" ? ABILITY_SOUND_PROFILES : SOUND_PROFILES;
    assert.ok(registry[v.sound.profile], `${entry.name}: ${v.sound.namespace} profile ${v.sound.profile}`);
  }
});

test("weapons sound like their family; magic shots and cards like their element or domain", () => {
  const design = (name) => named("weapon", name).variants[0].sound;
  assert.deepEqual(design("Longsword"), { namespace: "ability", profile: "sword", mode: "melee" });
  assert.equal(design("Longbow").profile, "longbow");
  assert.equal(weaponSoundDesign({ family: "firearm", melee: false }, "Runelock Pistol").profile, "pistol");
  assert.equal(weaponSoundDesign({ family: "magic", melee: false }, "Wand").profile, "force");
  assert.equal(named("weapon", "Any melee attack").variants[0].sound.profile, "claw", "adversary bites and claws");
  assert.equal(cardSoundDesign({ name: "Cinder Grasp", domain: "arcana" }, "bolt").profile, "fire");
  assert.equal(cardSoundDesign({ name: "Untouchable", domain: "midnight" }, "aura").profile, "shadow");
  assert.equal(cardSoundDesign({ name: "Not Good Enough", domain: "blade" }, "aura").profile, "slash");
  assert.equal(cardSoundDesign({ name: "Anything", domain: "splendor" }, "mend").profile, "healing");
  assert.equal(featureSoundDesign("cold", "breath").profile, "coldCone");
  assert.equal(utilitySoundDesign("heal").profile, "healing");
});

test("sounds join the recipe only with an audio pack and the Sounds switch on", () => {
  const sword = named("weapon", "Longsword"), id = sword.variants[0].id;
  assert.ok(!kinds(dhRecipe(sword, id)).includes("sound"));
  const loud = dhRecipe(sword, id, { sounds, soundVolume: 0.5 });
  assert.ok(kinds(loud).includes("sound"), "the strike's contact cue");
  const event = { type: "attack", systemId: "daggerheart", rollType: "attack", item: { type: "weapon", name: "Longsword" }, weaponMode: "melee" };
  const on = (kind) => ({ ...normalizeDhCatalogState(), enabled: true, scope: "all", ...(kind === "weapon" ? {} : {}) });
  assert.ok(kinds(resolveDaggerheartAutomaticRecipe(event, on, [], { sounds })).includes("sound"));
  assert.ok(!kinds(resolveDaggerheartAutomaticRecipe(event, (k) => ({ ...on(k), sound: false }), [], { sounds })).includes("sound"));
  for (const name of ["Whirlwind", "Book of Ava"]) {
    const card = named("card", name);
    assert.ok(card.variants.some((v) => kinds(dhRecipe(card, v.id, { sounds })).includes("sound")), name);
  }
  assert.ok(kinds(dhRecipe(dhEntry("daggerheart-weapon-feature-cold"), "daggerheart-weapon-feature-cold-breath", { sounds })).includes("sound"));
  assert.ok(kinds(dhRecipe(dhEntry("daggerheart-weapon-utility-heal"), "daggerheart-weapon-utility-heal-use", { sounds })).includes("sound"));
});

test("weapon strikes move the token: melee lunges, bows draw, guns kick, struck targets shake", () => {
  const motions = (name) => dhRecipe(named("weapon", name), named("weapon", name).variants[0].id).stages.filter((s) => s.kind === "motion").map((s) => `${s.subject}:${s.motion}`);
  assert.deepEqual(motions("Longsword"), ["source:lunge", "targets:shake"]);
  assert.deepEqual(motions("Longbow"), ["source:brace", "targets:shake"]);
  assert.deepEqual(motions("Any melee attack"), ["source:lunge", "targets:shake"]);
  const sword = dhRecipe(named("weapon", "Longsword"), named("weapon", "Longsword").variants[0].id);
  const lunge = sword.stages.find((s) => s.motion === "lunge"), contact = sword.stages.find((s) => s.stageId === "strike-contact");
  assert.ok(contact.delay > lunge.delay && contact.delay < lunge.delay + lunge.duration, "the blade lands during the lunge");
  assert.ok(!dhRecipe(named("weapon", "Longsword"), named("weapon", "Longsword").variants[0].id, { motion: false }).stages.some((s) => s.kind === "motion"), "Token motion off");
  // The visual stages stay as authored.
  assert.deepEqual(weaponStages({ name: "Longsword", range: "melee", damageTypes: ["physical"] }).map((s) => s.stageId), ["strike-contact", "hit-accent"]);
  for (const id of ["daggerheart-weapon-feature-physical-burst", "daggerheart-weapon-utility-heal-use"])
    assert.ok(dhRecipe(dhEntry(id.replace(/-(burst|use)$/, "")), id).stages.some((s) => s.kind === "motion"), id);
});

test("richer conditions: Vulnerable wobbles, Hidden has a second veil, Death move sounds", () => {
  assert.equal(bodyTreatment("Vulnerable"), "wobble");
  assert.ok(named("condition", "Hidden").variants[0].recipe.stages.length >= 2);
  const death = named("condition", "Death move");
  assert.ok(kinds(dhRecipe(death, death.variants[0].id, { sounds })).includes("sound"));
});
