import test from "node:test";
import assert from "node:assert/strict";
import { FINISHER_TOURS, TOUR_PRACTICE_ID, practiceFinisher, finisherSteps, studioSurface, SEL } from "../scripts/finisher-tour.mjs";
import { canvasToSquares, squaresToCanvas } from "../scripts/keyframe-ui.mjs";
import { validateRecipe } from "../scripts/model.mjs";
import { pathSquares } from "../scripts/keyframe-path.mjs";
import { finisherTravelPath } from "../scripts/finisher-model.mjs";
import { studioHTML } from "../scripts/studio.mjs";
import { Workspace } from "../scripts/workspace.mjs";
import { headlessHand, findInHTML } from "./helpers/studio-hand.mjs";

// The studio on the practice finisher, as runFinisherTour opens it (no canvas: demo environment).
function practiceStudio(tour) {
  const w = Object.create(Workspace.prototype);
  Object.assign(w, {
    page: "finishers", studio: true, selected: TOUR_PRACTICE_ID, stageIndex: 0, keyframeIndex: 0, keyframeFocus: false,
    studioTime: 0, studioSettings: false, previewMode: "recipe", category: "All", busy: false, message: "",
    drafts: new Map([[TOUR_PRACTICE_ID, practiceFinisher(tour)]]), dirty: new Set(),
    root: { querySelectorAll: () => [], querySelector: () => null },
  });
  w.host = { environment: () => ({ demo: true }), catalog: () => [], recipes: () => [], players: () => [], itemSummary: () => null };
  w.render = () => {};
  w.recipePreviewHTML = () => "<div data-recipe-scene></div>";
  return w;
}
const sorted = (list) => [...new Set(list)].sort();

test("two finisher tours, named as in the spec", () => {
  assert.ok(Object.isFrozen(FINISHER_TOURS));
  assert.deepEqual({ ...FINISHER_TOURS }, {
    flying: { label: "A flying finisher", detail: "Keyframes: fling the target along a path, stretch it, slam it into a wall." },
    shattering: { label: "A shattering finisher", detail: "Fragments: cut the target into pieces that fly apart." },
  });
});

test("practice finishers are valid, never-saved finisher drafts", () => {
  for (const [tour, name] of [["flying", "Practice: Thunder shove"], ["shattering", "Practice: Shattered"]]) {
    const p = practiceFinisher(tour);
    assert.equal(p.id, TOUR_PRACTICE_ID);
    assert.equal(p.name, name);
    assert.equal(p.trigger, "manual");
    assert.equal(p.category, "Finisher");
    assert.equal(typeof p.finisher, "object");
    assert.doesNotThrow(() => validateRecipe(p));
    assert.deepEqual(p.stages.map((s) => [s.kind, s.label]), [["impact", ""]], "one unnamed Target stage: a recipe needs a stage");
    p.stages.push({}); assert.equal(practiceFinisher(tour).stages.length, 1, "a fresh copy each time");
  }
  assert.equal(practiceFinisher("nope").name, "Practice: Thunder shove");
});

test("squaresToCanvas is the inverse of canvasToSquares", () => {
  const rect = { left: 100, top: 50, width: 400, height: 300 }, view = { x: -2, y: -3.5, w: 7, h: 7 };
  // Non-zero points: canvasToSquares rounds, and a rounded tiny negative would be -0.
  for (const p of [{ x: 0.5, y: 0.25 }, { x: 4, y: 1 }, { x: 2, y: -1.5 }]) {
    const c = squaresToCanvas(p, rect, view);
    assert.deepEqual(canvasToSquares({ clientX: c.x, clientY: c.y }, rect, view), p);
  }
});

test("every step says something, declares its selectors and has a demonstration", () => {
  assert.equal(finisherSteps("flying").length, 10);
  assert.equal(finisherSteps("shattering").length, 7);
  for (const tour of ["flying", "shattering"]) {
    const steps = finisherSteps(tour);
    for (const s of steps) {
      assert.equal(typeof s.say, "string"); assert.ok(s.say.length > 20);
      assert.ok(Array.isArray(s.targets)); assert.equal(typeof s.show, "function");
      for (const sel of s.targets) assert.doesNotThrow(() => findInHTML("", sel), `${sel} is a compound selector`);
    }
    assert.match(steps.at(-1).say, /Finish/);
  }
});

test("the studio surface offers the helpers the steps use", () => {
  const surface = studioSurface({ root: { querySelector: () => null }, stageIndex: 0 }, {});
  for (const key of ["openSettings", "closeSettings", "pathPoint", "keyframeHandle", "diamond", "dragKeyframe", "pointAt", "scrubTo", "find"]) assert.equal(typeof surface[key], "function", key);
});

test("a stage switched to Keyframed path gets its keyframes at once, so a held path renders", () => {
  const w = practiceStudio("flying");
  w.edit().stages.push({ stageId: "m", kind: "motion", motion: "lunge", subject: "targets", assets: [], duration: 800 });
  w.stageIndex = 1;
  w.onChange({ target: { dataset: { field: "motion", index: "1" }, type: "select-one", value: "path", hasAttribute: () => false } });
  assert.equal(findInHTML(studioHTML(w, w.recipe()), SEL.motionEnd).length, 1, "a finisher's keyframed path offers End");
  assert.equal(findInHTML(w.motionControlsHTML(w.recipe().stages[1], 1, { name: "plain recipe" }), SEL.motionEnd).length, 0, "only finishers hold");
  w.onChange({ target: { dataset: { field: "motionEnd", index: "1" }, type: "select-one", value: "hold", hasAttribute: () => false } });
  assert.equal(w.recipe().stages[1].keyframes.length, 2);
  assert.doesNotThrow(() => studioHTML(w, w.recipe()), "the chip reads the path's length");
  assert.equal(pathSquares(finisherTravelPath(w.recipe()).keyframes), 1);
});

// For every step: each selector the hand uses matches exactly one element in the studio HTML for
// the draft as it stands at that moment, and it is one of the step's declared targets.
for (const tour of ["flying", "shattering"]) {
  test(`${tour}: every step's selectors resolve in the studio as the tour builds it`, async () => {
    const w = practiceStudio(tour);
    for (const [n, step] of finisherSteps(tour).entries()) {
      const hand = headlessHand(w);
      await step.show(hand);
      assert.deepEqual(sorted(hand.used), sorted(step.targets), `step ${n + 1} declares the selectors it uses`);
      assert.doesNotMatch(w.message ?? "", /would wait on each other/, `step ${n + 1}`);
    }
    const r = w.recipe();
    assert.doesNotThrow(() => validateRecipe(r));
    if (tour === "flying") {
      assert.deepEqual(r.stages.map((s) => s.label), ["hit", "", "landing", "wall-crack"]);
      assert.equal(r.finisher.on, "kill");
      assert.equal(r.finisher.wall, "slam");
      const path = finisherTravelPath(r);
      assert.ok(path, "a held keyframed path on the target");
      assert.equal(pathSquares(path.keyframes), 4);
      assert.equal(path.pathEase, "easeOutCubic");
      assert.equal(path.keyframes.length, 3);
      assert.ok(path.keyframes[1].y < 0, "the middle keyframe arcs up");
      assert.equal(path.keyframes[1].stretch, 0.2);
      assert.equal(path.keyframes[1].scale, 1.15);
    } else {
      assert.deepEqual(r.stages.map((s) => s.label), ["slash", ""]);
      assert.equal(r.finisher.on, "criticalOrKill");
      assert.equal(r.finisher.ending, "vanish");
      const cut = r.stages[1];
      assert.deepEqual([cut.motion, cut.subject, cut.motionEnd, cut.pattern, cut.cut], ["fragments", "targets", "hold", "dust", "attack"]);
      assert.deepEqual([cut.spread, cut.spin, cut.fall], [0.8, 60, 0.5]);
    }
  });
}
