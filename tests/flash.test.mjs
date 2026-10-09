import test from "node:test";
import assert from "node:assert/strict";
import { validateFlash, validateFlashes, chooseFlash, fillText, STARTER_FLASHES, FLASH_LIMIT } from "../scripts/flash-model.mjs";
import { layerKeyframes } from "../scripts/flash-render.mjs";

test("flash screens are cleaned: limits, kinds, safe media only", () => {
  const s = validateFlash({ name: "  ", duration: 99999, layers: [
    { kind: "text", text: "Hi", size: 500, x: 999 },
    { kind: "image", src: "https://evil.example/x.png" },
    { kind: "image", src: "modules/my-art/title.webm" },
    { kind: "image", src: "jb2a.impact.001.orange" },
    { kind: "bogus" },
  ] });
  assert.equal(s.name, "Untitled flash");
  assert.equal(s.duration, 12000);
  assert.deepEqual([s.layers[0].size, s.layers[0].x], [40, 120]);
  assert.equal(s.layers[1].src, "", "no outside URLs");
  assert.equal(s.layers[2].src, "modules/my-art/title.webm");
  assert.equal(s.layers[3].src, "jb2a.impact.001.orange", "Sequencer keys are allowed");
  assert.equal(s.layers[4].kind, "text");
  assert.equal(validateFlashes(Array(FLASH_LIMIT + 5).fill({})).length, FLASH_LIMIT);
  assert.ok(STARTER_FLASHES.some((f) => f.event === "start") && STARTER_FLASHES.some((f) => f.event === "end"));
});

test("a combat's pick wins, then the default; random and none work; event must fit", () => {
  const screens = [validateFlash({ id: "a", event: "start" }), validateFlash({ id: "b", event: "end" }), validateFlash({ id: "c", event: "any" })];
  assert.equal(chooseFlash(screens, "start", "c", "a").id, "c");
  assert.equal(chooseFlash(screens, "start", undefined, "a").id, "a");
  assert.equal(chooseFlash(screens, "start", "none", "a"), null);
  assert.equal(chooseFlash(screens, "start", undefined, "none"), null);
  assert.equal(chooseFlash(screens, "start", "random", "a", () => 0.99).id, "c");
  assert.equal(chooseFlash(screens, "end", "random", null, () => 0).id, "b");
  assert.equal(chooseFlash(screens, "start", "deleted-id", "a").id, "a", "a deleted pick falls back to the default");
});

test("text placeholders and layer keyframes", () => {
  assert.equal(fillText("Battle at {scene}, round {round}", { scene: "Landing", round: "1" }), "Battle at Landing, round 1");
  const layer = validateFlash({ duration: 4000, layers: [{ kind: "text", start: 1000, duration: 2000, enter: "slam", enterMs: 400, exit: "fade", exitMs: 400, shake: true }] }).layers[0];
  const frames = layerKeyframes(layer, 4000);
  assert.ok(frames.every((f, i) => i === 0 || f.offset >= frames[i - 1].offset), "offsets never go backwards");
  assert.equal(frames[0].opacity, 0, "hidden before it starts");
  assert.equal(frames.at(-1).opacity, 0, "hidden after it ends");
  assert.ok(frames.some((f) => f.offset === 0.25), "starts at 1s of 4s");
});
