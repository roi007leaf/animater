import test from "node:test";
import assert from "node:assert/strict";
import { FINISHER_PRESETS, presetFinisher } from "../scripts/finisher-presets.mjs";
import { motionPose } from "../scripts/motion.mjs";
import { installedAssets } from "../scripts/model.mjs";
import { finisherTravelPath } from "../scripts/finisher-model.mjs";
import { assetDatabases } from "../tools/asset-databases.mjs";

const IDS = ["launch", "cleave", "skewer", "struck-down", "ash", "shatter", "jolt", "blast", "wall-slam", "unmade", "melt", "ascend", "shaken-apart", "soul-departs", "fall", "slice-in-half", "bisect", "shatter-shards", "disintegrate", "sky-launch", "ragdoll-tumble", "vortex-spiral", "pancake"];

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
  assert.deepEqual(r.stages.filter((s) => s.stageId.startsWith("wall")).map((s) => s.stageId), ["wall-crack", "wall-squash", "wall-dust"]);
  assert.ok(r.stages.some((s) => s.stageId === "landing"), "lands hard when nothing stops it");
});

test("Wall slam stretches mid-flight, lands unstretched and squashes on the wall", () => {
  const r = presetFinisher("wall-slam", "ws"), path = finisherTravelPath(r);
  assert.ok(path.keyframes.some((k) => k.stretch > 0), "stretched in flight");
  assert.equal(path.keyframes.find((k) => k.at === 0.6).stretch, 0.22);
  assert.equal(path.keyframes.at(-1).stretch, 0, "lands unstretched");
  const squash = r.stages.find((s) => s.stageId === "wall-squash");
  assert.deepEqual([squash.kind, squash.motion, squash.duration, squash.intensity, squash.subject], ["motion", "squash", 450, 1.2, "targets"]);
  assert.equal(r.stages.find((s) => s.stageId === "wall-crack").scale, 0.8);
  assert.equal(r.stages.some((s) => s.stageId === "wall-shake"), false);
});

test("the creative presets use fragments or keyframed paths as designed", () => {
  for (const id of ["slice-in-half", "bisect", "shatter-shards", "disintegrate"]) {
    const r = presetFinisher(id, id), cut = r.stages.find((s) => s.motion === "fragments");
    assert.ok(cut && cut.motionEnd === "hold" && cut.subject === "targets", id);
    assert.equal(r.finisher.ending, "vanish", id);
  }
  assert.deepEqual(["slice-in-half", "bisect", "shatter-shards", "disintegrate"].map((id) => presetFinisher(id, id).stages.find((s) => s.motion === "fragments").pattern), ["halves", "topBottom", "shards", "dust"]);
  const sky = finisherTravelPath(presetFinisher("sky-launch", "s"));
  assert.equal(sky.keyframes.at(-1).alpha, 0);
  const rag = finisherTravelPath(presetFinisher("ragdoll-tumble", "r"));
  assert.ok(rag.keyframes.filter((k) => k.sharp).length >= 3, "three bounces");
  assert.deepEqual([rag.keyframes.at(-1).rotation % 360, rag.keyframes.at(-1).scale, rag.keyframes.at(-1).stretch], [0, 1, 0], "lands upright");
  const vortex = finisherTravelPath(presetFinisher("vortex-spiral", "v")).keyframes;
  assert.deepEqual([vortex.at(-1).x, vortex.at(-1).y, vortex.at(-1).alpha], [0, 0, 0]);
  assert.ok(vortex.length >= 8);
  const pancake = finisherTravelPath(presetFinisher("pancake", "p")).keyframes.at(-1);
  assert.equal(pancake.stretch, -0.6);
  assert.equal(presetFinisher("pancake", "p").finisher.ending, "body");
});

// One fluid motion per preset: the stage's pathEase shapes the speed, the keyframes are linear.
const PATH_EASES = { launch: "easeOutQuad", skewer: "easeOutCubic", "struck-down": "easeOutCubic", ash: "easeInQuad", shatter: "linear", jolt: "easeOutQuad", blast: "easeOutCubic",
  "wall-slam": "easeOutCubic", unmade: "easeInQuad", melt: "easeInQuad", ascend: "easeInOutQuad", "shaken-apart": "linear", "sky-launch": "easeInQuad", "ragdoll-tumble": "linear", "vortex-spiral": "easeInQuad", pancake: "linear" };
test("every preset path is one fluid motion: a whole-path ease over linear keyframes", () => {
  assert.deepEqual(IDS.filter((id) => finisherTravelPath(presetFinisher(id, id))), Object.keys(PATH_EASES), "every path preset is listed");
  for (const [id, ease] of Object.entries(PATH_EASES)) {
    const path = finisherTravelPath(presetFinisher(id, id));
    assert.equal(path.pathEase, ease, id);
    if (id === "ragdoll-tumble") continue;
    // Pancake's squash keeps its overshoot into the floor.
    const eases = path.keyframes.map((k) => k.ease), expected = eases.map((_, i) => (id === "pancake" && i === eases.length - 1 ? "easeOutBack" : "linear"));
    assert.deepEqual(eases, expected, id);
  }
});

test("Ragdoll tumble slows deliberately at each bounce: easing out into each apex, in to each landing", () => {
  const k = finisherTravelPath(presetFinisher("ragdoll-tumble", "r")).keyframes;
  const inner = k.slice(1, -1);
  assert.deepEqual(inner.map((kf) => [kf.sharp, kf.ease]), inner.map((kf) => (kf.sharp ? [true, "easeInQuad"] : [false, "easeOutQuad"])));
  assert.equal(inner.filter((kf) => kf.sharp).length, 3, "three landings");
  assert.equal(inner.filter((kf) => !kf.sharp).length, 3, "three apexes");
});

test("Pancake squashes over its whole stage: linear path, overshoot only on the last keyframe", () => {
  const path = finisherTravelPath(presetFinisher("pancake", "p"));
  assert.equal(path.pathEase, "linear");
  assert.equal(path.keyframes.at(-1).ease, "easeOutBack");
  const mid = motionPose(path, 0.5), late = motionPose(path, 0.99);
  assert.notDeepEqual(mid, late, "the squash is still progressing mid-stage");
});
