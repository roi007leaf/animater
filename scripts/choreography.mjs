import { clone } from "./model.mjs";
import { stageSpan, stageFrame } from "./stage-options.mjs";
import { sampleRecipe } from "./composition.mjs";

// Ordering moves content between chronological timing slots. Durations and all
// effect settings stay with their stage; simultaneous slots remain simultaneous.
export function reorderStages(stages, from, to) {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= stages.length ||
    to >= stages.length
  )
    throw Error("Choose a valid stage position.");
  const result = clone(stages);
  if (from === to) return result;
  const slots = result.map((s) => s.delay).sort((a, b) => a - b);
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  result.forEach((s, i) => {
    s.delay = slots[i];
  });
  return result;
}

export const recipeDuration = (recipe) =>
  Math.max(
    0,
    ...(recipe.playbackPlan ?? sampleRecipe(recipe).stages).map(
      (s) =>
        s.delay +
        (recipe.playbackPlan
          ? s.duration
          : stageSpan(s, recipe.targetCount ?? 1)),
    ),
  );

export function recipeFrame(recipe, elapsed) {
  const duration = recipeDuration(recipe);
  const time = Math.max(0, Math.min(duration, elapsed));
  return {
    time,
    duration,
    complete: time >= duration,
    stages: sampleRecipe(recipe).stages.map((s, index) => ({
      index,
      ...(recipe.playbackPlan
        ? planFrame(
            recipe.playbackPlan.filter((p) => p.index === index),
            time,
          )
        : stageFrame(s, time, recipe.targetCount ?? 1)),
    })),
  };
}
function planFrame(plan, time) {
  const states = plan.map((p) => ({
    ...stageFrame({ ...p, repeats: 1, targetStagger: 0 }, time),
    targetIndex: p.targetIndex,
    iteration: p.iteration,
    stage: p,
  }));
  return (
    states.find((s) => s.state === "playing") ??
    states.find((s) => s.state === "pending") ??
    states.at(-1)
  );
}

// Explicitly played once; background time counts, cancellation emits no late ticks.
export class RecipeClock {
  constructor({
    frame = (cb) => globalThis.requestAnimationFrame(cb),
    cancel = (id) => globalThis.cancelAnimationFrame(id),
    now = () => performance.now(),
  } = {}) {
    this.frame = frame;
    this.cancel = cancel;
    this.now = now;
  }
  play(recipe, onFrame) {
    this.stop();
    const start = this.now();
    return new Promise((resolve) => {
      const run = { resolve, handle: null };
      this.run = run;
      const tick = (time) => {
        if (this.run !== run) return;
        const snapshot = recipeFrame(recipe, time - start);
        onFrame(snapshot);
        if (snapshot.complete) {
          this.run = null;
          resolve(true);
        } else run.handle = this.frame(tick);
      };
      onFrame(recipeFrame(recipe, 0));
      run.handle = this.frame(tick);
    });
  }
  stop() {
    if (!this.run) return;
    this.cancel(this.run.handle);
    this.run.resolve(false);
    this.run = null;
  }
}
