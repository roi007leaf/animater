import test from "node:test";
import assert from "node:assert/strict";
import { FINISHER_PRESETS, presetFinisher } from "../scripts/finisher-presets.mjs";
import { installedAssets } from "../scripts/model.mjs";
import { finisherTravelPath } from "../scripts/finisher-model.mjs";
import { assetDatabases } from "../tools/asset-databases.mjs";

const IDS = ["launch", "cleave", "skewer", "struck-down", "ash", "shatter", "jolt", "blast", "wall-slam", "unmade", "melt", "ascend", "shaken-apart", "soul-departs", "fall"];

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

test("flinging presets travel on a held keyframed path that lands upright", () => {
  for (const id of ["launch", "skewer", "struck-down", "jolt", "blast", "wall-slam"]) {
    const r = presetFinisher(id, id), path = finisherTravelPath(r);
    assert.ok(path, `${id} has a held travel path`);
    const end = path.keyframes.at(-1);
    assert.ok(Math.round(Math.max(Math.abs(end.x), Math.abs(end.y))) > 0, `${id} travels`);
    assert.equal(((end.rotation % 360) + 360) % 360, 0, `${id} lands upright`);
    assert.deepEqual([end.scale, end.alpha], [1, 1], `${id} lands at full size, visible`);
  }
});

test("vanishing presets shrink or fade in place and stay gone until hidden", () => {
  for (const id of ["ash", "shatter", "unmade", "melt", "ascend", "shaken-apart"]) {
    const r = presetFinisher(id, id), path = finisherTravelPath(r);
    assert.equal(r.finisher.ending, "vanish", id);
    assert.ok(path, `${id} has a held path`);
    assert.equal(Math.round(Math.max(Math.abs(path.keyframes.at(-1).x), Math.abs(path.keyframes.at(-1).y))), 0, `${id} stays in place`);
    assert.equal(path.keyframes.at(-1).alpha, 0, `${id} ends invisible`);
  }
});

test("every preset effect resolves in JB2A Patreon", async () => {
  const db = await assetDatabases();
  for (const id of IDS)
    for (const s of presetFinisher(id, id).stages.filter((s) => !["motion", "sound"].includes(s.kind)))
      assert.ok(installedAssets(s, db.patreon).length, `${id}/${s.stageId}: ${s.assets.join(", ")}`);
});

test("Wall slam flies 6 squares, slams into a wall that stops it, and crashes there", () => {
  const r = presetFinisher("wall-slam", "ws"), path = finisherTravelPath(r);
  assert.equal(r.finisher.wall, "slam");
  assert.equal(r.finisher.ending, "body");
  assert.equal(path.keyframes.at(-1).x, 6);
  assert.deepEqual(r.stages.filter((s) => s.stageId.startsWith("wall")).map((s) => s.stageId), ["wall-crack", "wall-shake", "wall-dust"]);
  assert.ok(r.stages.some((s) => s.stageId === "landing"), "lands hard when nothing stops it");
});
