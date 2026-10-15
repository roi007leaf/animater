import test from "node:test";
import assert from "node:assert/strict";
import { keyframeDiamondsHTML, pathCanvasHTML, keyframeInspectorHTML, canvasToSquares, canvasView, scrubPoint, keyframeDeleteApplies } from "../scripts/keyframe-ui.mjs";
import { normalizeKeyframes } from "../scripts/keyframe-path.mjs";

const stage = { kind: "motion", motion: "path", subject: "targets", motionEnd: "hold", duration: 1000, keyframes: normalizeKeyframes([{ at: 0 }, { at: 0.4, x: 1, y: 0.5 }, { at: 1, x: 2.6, y: 0 }]) };

test("diamonds mark each keyframe's time on the bar; the ends are fixed", () => {
  const html = keyframeDiamondsHTML(stage, 3, 1);
  assert.equal((html.match(/data-kf-diamond=/g) ?? []).length, 3);
  assert.match(html, /data-kf-diamond="1" data-kf-stage="3" style="left:40\.00%"/);
  assert.match(html, /an-kf-diamond is-on/);
  assert.equal((html.match(/is-fixed/g) ?? []).length, 2);
});

test("the canvas draws the path, a draggable dot per keyframe, and a finisher's landing square", () => {
  const plain = pathCanvasHTML(stage, { selected: 2 });
  assert.equal((plain.match(/data-kf-dot=/g) ?? []).length, 2, "the start is fixed: no dot");
  assert.match(plain, /data-kf-view="/);
  assert.match(plain, /data-kf-scrub/);
  assert.doesNotMatch(plain, /data-kf-landing/);
  assert.match(plain, /away from the other token/);
  const fin = pathCanvasHTML(stage, { selected: 2, finisher: { mover: "targets", ending: "body" } });
  assert.match(fin, /data-kf-landing/);
  assert.match(fin, /away from the attacker/);
});

test("pointer positions convert to squares through the letterboxed view", () => {
  const view = { x: -2, y: -2, w: 8, h: 8 };
  const rect = { left: 0, top: 0, width: 400, height: 200 };   // wide box: 200px square, centred
  assert.deepEqual(canvasToSquares({ clientX: 200, clientY: 100 }, rect, view), { x: 2, y: 2 });
  assert.deepEqual(canvasToSquares({ clientX: 100, clientY: 0 }, rect, view), { x: -2, y: -2 });
  const v = canvasView(stage.keyframes);
  assert.equal(v.w, v.h, "square view");
  assert.ok(v.x <= -1 && v.x + v.w >= 3.6 - 1e-9, "the path and a margin fit");
});

test("the inspector edits the selected keyframe and offers add, delete, flip, reset", () => {
  const html = keyframeInspectorHTML(stage, 3, 1);
  for (const key of ["at", "x", "y", "rotation", "scale", "alpha", "ease", "sharp"]) assert.match(html, new RegExp(`data-kf-field="${key}" data-kf-index="1" data-index="3"`), key);
  assert.match(html, /value="400"/, "time shown in ms");
  for (const action of ["kf-add", "kf-delete", "kf-flip", "kf-reset"]) assert.match(html, new RegExp(`data-action="${action}"`));
  const first = keyframeInspectorHTML(stage, 3, 0);
  assert.match(first, /data-kf-field="x"[^>]*disabled/, "the start point is where the token stands");
  assert.match(first, /data-action="kf-delete"[^>]*disabled/);
});

test("the inspector warns when a held path travels and its end is not upright", () => {
  const warn = /This path travels: when the token lands it snaps back to upright/;
  const tilted = { ...stage, keyframes: normalizeKeyframes([{ at: 0 }, { at: 1, x: 3, y: 0, rotation: 45 }]) };
  assert.match(keyframeInspectorHTML(tilted, 0, 1), warn);
  assert.match(keyframeInspectorHTML({ ...stage, keyframes: normalizeKeyframes([{ at: 0 }, { at: 1, x: 3, y: 0, alpha: 0.5 }]) }, 0, 1), warn, "faded counts");
  assert.doesNotMatch(keyframeInspectorHTML(stage, 0, 1), warn, "an upright end");
  assert.doesNotMatch(keyframeInspectorHTML({ ...stage, keyframes: normalizeKeyframes([{ at: 0 }, { at: 1, x: 0.3, y: 0, rotation: 45, scale: 0.05 }]) }, 0, 1), warn, "in place");
  assert.doesNotMatch(keyframeInspectorHTML({ ...tilted, motionEnd: "return" }, 0, 1), warn, "a returning path never lands");
});

test("the scrub token follows the path in time with the playhead", () => {
  assert.deepEqual(scrubPoint(stage, 500, 0), { x: 0, y: 0 }, "before the stage starts: at the token");
  const mid = scrubPoint(stage, 500, 900);
  assert.ok(Math.abs(mid.x - 1) < 1e-6 && Math.abs(mid.y - 0.5) < 1e-6, "400 ms into the stage: keyframe 2");
  assert.deepEqual(scrubPoint(stage, 500, 9999), { x: 2.6, y: 0 }, "after: at the end");
});

test("Delete removes a keyframe only for the focused path stage", () => {
  const base = { keyframeFocus: true, isPath: true, onBar: false, barIndex: 0, stageIndex: 0 };
  assert.equal(keyframeDeleteApplies(base), true);
  assert.equal(keyframeDeleteApplies({ ...base, onBar: true, barIndex: 0 }), true);
  assert.equal(keyframeDeleteApplies({ ...base, onBar: true, barIndex: 1 }), false, "another stage's bar deletes that stage");
  assert.equal(keyframeDeleteApplies({ ...base, keyframeFocus: false }), false);
  assert.equal(keyframeDeleteApplies({ ...base, isPath: false }), false);
});
