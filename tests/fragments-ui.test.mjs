import test from "node:test";
import assert from "node:assert/strict";
import { fragmentsControlsHTML, fragmentsPreviewSVG, resetPiecesOnPattern } from "../scripts/fragments-ui.mjs";

const s = { kind: "motion", motion: "fragments", duration: 1400, pattern: "shards", pieces: 7, seed: 3 };

test("the fragments editor has every control and a scrubbable preview", () => {
  const html = fragmentsControlsHTML(s, 2);
  for (const key of ["pattern", "cut", "angle", "pieces", "spread", "spin", "fall", "drift", "fade"]) assert.match(html, new RegExp(`data-field="${key}" data-index="2"`), key);
  assert.match(html, /data-fragments-scrub/);
  assert.equal((fragmentsPreviewSVG(s, 0.6).match(/data-fragment=/g) ?? []).length, 7);
  assert.equal((fragmentsPreviewSVG({ ...s, pattern: "halves" }, 0).match(/data-fragment=/g) ?? []).length, 2);
});

test("switching pattern clears the stored piece count; other edits keep it", () => {
  const a = { motion: "fragments", pattern: "halves", pieces: 2 };
  resetPiecesOnPattern(a, "pattern");
  assert.equal("pieces" in a, false);
  const b = { motion: "fragments", pieces: 5 }; resetPiecesOnPattern(b, "spin"); assert.equal(b.pieces, 5);
  const c = { motion: "lunge", pieces: 5 }; resetPiecesOnPattern(c, "pattern"); assert.equal(c.pieces, 5);
});
