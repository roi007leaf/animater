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
