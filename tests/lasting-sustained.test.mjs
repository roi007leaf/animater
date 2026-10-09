import test from "node:test";
import assert from "node:assert/strict";
import { isLastingArea } from "../scripts/lasting-area.mjs";
import { applyMediaOptions } from "../scripts/stage-options.mjs";

const spell = (name, duration, description = "", extra = {}) => ({ type: "spell", name, system: { duration: { value: duration, ...extra }, description: { value: description }, area: { type: "burst" } } });

test("sustained area spells and areas that keep acting stay on the map, whatever their name", () => {
  assert.ok(isLastingArea(spell("Pernicious Poltergeist", "sustained up to 1 minute", "", { sustained: true })));
  assert.ok(isLastingArea(spell("Odd Name", "1 minute", "<p>A creature that enters or starts its turn in the area takes 2d6 damage.</p>")));
  assert.ok(!isLastingArea(spell("Slow", "1 minute", "<p>The targets are slowed.</p>")), "affects creatures once");
  assert.ok(!isLastingArea(spell("Fireball", "", "")), "instant");
  assert.ok(isLastingArea(spell("Darkness", "1 minute")), "standing areas by name still stay");
});

test("a lasting Darkness loops only its solid middle; other footage plays whole", () => {
  const calls = [], section = new Proxy({}, { get: (_, m) => (...a) => { calls.push([m, ...a]); return section; } });
  applyMediaOptions(section, { persist: true, asset: "jb2a.darkness.black", clipStart: 0 });
  assert.deepEqual(calls, [["startTimePerc", 0.2], ["endTimePerc", 0.2]]);
  calls.length = 0;
  applyMediaOptions(section, { persist: true, asset: "jb2a.fog_cloud.01.white", clipStart: 0 });
  applyMediaOptions(section, { persist: false, asset: "jb2a.darkness.black", clipStart: 0 });
  assert.deepEqual(calls, []);
});

import { withLastingArea } from "../scripts/lasting-area.mjs";
const darknessRecipe = () => ({ id: "d", stages: [
  { stageId: "cast", kind: "cast", assets: ["jb2a.smoke.puff.centered.dark_purple"] },
  { stageId: "area", kind: "template", assets: ["jb2a.darkness.black"], delay: 200 },
  { stageId: "puff", kind: "template", assets: ["jb2a.smoke.puff.centered.dark_purple"] },
] });
const darkness = spell("Darkness", "1 minute");

test("a lasting Darkness grows in once, then holds as a seamless dark fog loop", () => {
  const r = withLastingArea(darknessRecipe(), { template: {}, item: darkness }, { exists: () => true });
  const area = r.stages.filter((s) => s.kind === "template");
  assert.deepEqual(area.map((s) => [s.stageId, s.assets[0], !!s.persist]), [
    ["area", "jb2a.darkness.black", false],
    ["area-hold", "jb2a.ambient_fog.001.loop.large.white", true],
    ["puff", "jb2a.smoke.puff.centered.dark_purple", false],
  ]);
  assert.equal(area[1].tintEnabled, true);
  assert.equal(area[1].delay, 1400);
});

test("with PF2e Visioner drawing Darkness, Animater keeps only its flourishes", () => {
  const r = withLastingArea(darknessRecipe(), { template: {}, item: darkness }, { exists: () => true, yieldDarkness: true });
  assert.deepEqual(r.stages.map((s) => s.stageId), ["cast", "puff"]);
});

test("a D&D Darkness already marked lasting gets the same grow-in and dark loop", () => {
  const recipe = { ...darknessRecipe(), systemId: "dnd5e" };
  recipe.stages[1] = { ...recipe.stages[1], persist: true };
  const r = withLastingArea(recipe, { template: {}, item: { type: "spell", name: "Darkness" } }, { exists: () => true });
  assert.deepEqual(r.stages.filter((s) => s.persist).map((s) => s.assets[0]), ["jb2a.ambient_fog.001.loop.large.white"]);
});
