import test from "node:test";
import assert from "node:assert/strict";
import { trackOf, studioTracks, rulerStep, rulerHTML } from "../scripts/studio.mjs";
import { RecipeClock } from "../scripts/choreography.mjs";

const stage = (stageId, kind, extra = {}) => ({ stageId, kind, delay: 0, duration: 1000, assets: ["jb2a.x"], ...extra });

test("studio sorts stages into role tracks", () => {
  assert.equal(trackOf({ kind: "cast" }), "caster");
  assert.equal(trackOf({ kind: "aura", subject: "source" }), "caster");
  assert.equal(trackOf({ kind: "aura", subject: "targets" }), "target");
  assert.equal(trackOf({ kind: "projectile" }), "flight");
  assert.equal(trackOf({ kind: "travel" }), "flight");
  assert.equal(trackOf({ kind: "impact" }), "target");
  assert.equal(trackOf({ kind: "template" }), "target");
  assert.equal(trackOf({ kind: "motion" }), "motion");
  assert.equal(trackOf({ kind: "sprite" }), "motion");
  assert.equal(trackOf({ kind: "sound" }), "sound");
  assert.equal(trackOf({ kind: "tokenfx" }), "fx");
  assert.equal(trackOf({ kind: "scenefx" }), "fx");
});

test("studio tracks pack sequential clips into one lane and keep empty tracks", () => {
  const recipe = { stages: [
    stage("a", "impact"),
    stage("b", "impact", { startMode: "after", afterStage: "a", timingAnchor: "end" }),
    stage("c", "impact", { delay: 200 }),
  ] };
  const { tracks, total, end } = studioTracks(recipe);
  assert.deepEqual(tracks.map((t) => t.id), ["caster", "flight", "target", "motion", "sound", "fx"]);
  const target = tracks.find((t) => t.id === "target");
  assert.equal(target.lanes.length, 2, "a→b share a lane; c overlaps a");
  assert.deepEqual(target.lanes[0].map((r) => r.stageId), ["a", "b"]);
  assert.deepEqual(tracks.find((t) => t.id === "caster").lanes, [[]]);
  assert.equal(end, 2000);
  assert.ok(total > end, "room to drag past the end");
});

test("document-linked recipes only offer attached-layer tracks", () => {
  const recipe = { lifecycle: "document", stages: [stage("a", "aura", { subject: "source", persist: true })] };
  assert.deepEqual(studioTracks(recipe).tracks.map((t) => t.id), ["caster", "fx"]);
});

test("ruler labels stay readable as zoom changes", () => {
  assert.equal(rulerStep(4000, 1), 500);
  assert.ok(rulerStep(4000, 8) < rulerStep(4000, 1));
  assert.match(rulerHTML(2000, 1), /is-major[^>]*left:0\.000%/);
});

test("recipe clock can start part-way through", async () => {
  let now = 1000;
  const frames = [];
  const queue = [];
  const clock = new RecipeClock({ frame: (cb) => { queue.push(cb); return queue.length; }, cancel: () => {}, now: () => now });
  const recipe = { stages: [stage("a", "impact")] };
  const done = clock.play(recipe, (f) => frames.push(Math.round(f.time)), { from: 600 });
  assert.equal(frames[0], 600);
  now = 1500;
  queue.shift()(now);
  assert.ok(await done);
  assert.equal(frames.at(-1), 1000);
});
