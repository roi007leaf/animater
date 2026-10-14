import test from "node:test";
import assert from "node:assert/strict";
import { FINISHER_PRESETS, presetFinisher } from "../scripts/finisher-presets.mjs";
import { installedAssets } from "../scripts/model.mjs";
import { assetDatabases } from "../tools/asset-databases.mjs";

const IDS = ["launch", "cleave", "skewer", "struck-down", "ash", "shatter", "jolt", "blast", "unmade", "melt", "ascend", "shaken-apart", "soul-departs", "fall"];

test("every preset is a valid kill finisher the GM can save as their own", () => {
  assert.deepEqual(Object.keys(FINISHER_PRESETS), IDS);
  for (const id of IDS) {
    const r = presetFinisher(id, `mine-${id}`);
    assert.equal(r.id, `mine-${id}`);
    assert.equal(r.category, "Finisher");
    assert.equal(r.trigger, "manual");
    assert.equal(r.finisher.on, "kill");
    assert.ok(r.stages.some((s) => s.kind === "motion" && s.subject === "targets"), `${id} moves the real target token`);
    assert.ok(r.stages.length <= 16, id);
  }
});

test("flinging presets hold their travel so the token stays where it lands", () => {
  for (const id of ["launch", "skewer", "struck-down", "jolt", "blast"]) {
    const r = presetFinisher(id, id);
    assert.ok(r.finisher.knockback > 0, id);
    assert.ok(r.stages.some((s) => s.kind === "motion" && s.motionEnd === "hold" && ["leap", "rush", "roll"].includes(s.motion)), id);
  }
});

test("every preset effect resolves in JB2A Patreon", async () => {
  const db = await assetDatabases();
  for (const id of IDS)
    for (const s of presetFinisher(id, id).stages.filter((s) => !["motion", "sound"].includes(s.kind)))
      assert.ok(installedAssets(s, db.patreon).length, `${id}/${s.stageId}: ${s.assets.join(", ")}`);
});
