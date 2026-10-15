import test from "node:test";
import assert from "node:assert/strict";
import { fragmentsControlsHTML, fragmentsPreviewSVG, resetPiecesOnPattern } from "../scripts/fragments-ui.mjs";

const s = { kind: "motion", motion: "fragments", duration: 1400, pattern: "shards", pieces: 7, seed: 3 };

test("the fragments editor has every control and a scrubbable preview", () => {
  const html = fragmentsControlsHTML({ ...s, cut: "fixed" }, 2);
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

const has = (html, key) => new RegExp(`data-field="${key}"`).test(html);
test("fields that do nothing for the pattern or cut are hidden", () => {
  assert.equal(has(fragmentsControlsHTML({ ...s, cut: "attack" }, 0), "angle"), false, "angle hidden while following the attack");
  assert.equal(has(fragmentsControlsHTML({ ...s, cut: "fixed" }, 0), "angle"), true);
  for (const pattern of ["halves", "topBottom"]) assert.equal(has(fragmentsControlsHTML({ ...s, pattern }, 0), "pieces"), false, pattern);
  for (const pattern of ["shards", "dust"]) assert.equal(has(fragmentsControlsHTML({ ...s, pattern }, 0), "pieces"), true, pattern);
  assert.equal(has(fragmentsControlsHTML({ ...s, pattern: "dust" }, 0), "fade"), false, "dust fades per speck");
  assert.equal(has(fragmentsControlsHTML({ ...s, pattern: "shards" }, 0), "fade"), true);
});
test("the preview says which way the sample attack comes from; the hold hint is for finishers only", () => {
  assert.match(fragmentsControlsHTML({ ...s, cut: "attack" }, 0), /Preview: attack from the left/);
  assert.doesNotMatch(fragmentsControlsHTML({ ...s, cut: "fixed" }, 0), /attack from the left/);
  assert.doesNotMatch(fragmentsControlsHTML(s, 0), /End: hold/);
  assert.match(fragmentsControlsHTML(s, 0, 0.6, { finisher: true }), /Use End: hold in a finisher/);
});

import { Workspace } from "../scripts/workspace.mjs";
test("the motion controls hide Distance and Intensity for fragments and pass the finisher hint on", () => {
  const frag = { kind: "motion", motion: "fragments", duration: 1400, pattern: "halves" };
  const html = Workspace.prototype.motionControlsHTML(frag, 0);
  assert.equal(has(html, "distance"), false);
  assert.equal(has(html, "intensity"), false);
  assert.doesNotMatch(html, /End: hold/);
  assert.match(Workspace.prototype.motionControlsHTML(frag, 0, { finisher: { on: "kill" } }), /Use End: hold in a finisher/);
  const lunge = Workspace.prototype.motionControlsHTML({ kind: "motion", motion: "lunge", duration: 600 }, 0);
  assert.ok(has(lunge, "distance") && has(lunge, "intensity"));
});
