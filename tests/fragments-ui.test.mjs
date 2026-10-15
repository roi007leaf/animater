import test from "node:test";
import assert from "node:assert/strict";
import { fragmentsControlsHTML, fragmentsPreviewSVG } from "../scripts/fragments-ui.mjs";

const s = { kind: "motion", motion: "fragments", duration: 1400, pattern: "shards", pieces: 7, seed: 3 };

test("the fragments editor has every control and a scrubbable preview", () => {
  const html = fragmentsControlsHTML(s, 2);
  for (const key of ["pattern", "cut", "angle", "pieces", "spread", "spin", "fall", "drift", "fade"]) assert.match(html, new RegExp(`data-field="${key}" data-index="2"`), key);
  assert.match(html, /data-fragments-scrub/);
  assert.equal((fragmentsPreviewSVG(s, 0.6).match(/data-fragment=/g) ?? []).length, 7);
  assert.equal((fragmentsPreviewSVG({ ...s, pattern: "halves" }, 0).match(/data-fragment=/g) ?? []).length, 2);
});
