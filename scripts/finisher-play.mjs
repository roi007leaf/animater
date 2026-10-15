// Plays a finisher on the real token: travel lands on a square (motionOffset + hold), the
// document is moved there, then the ending runs. Foundry is reached only through `host`.
import { awayFrom } from "./displacement.mjs";
import { pathEnd, pathSquares, rotateBy, unrotateBy } from "./keyframe-path.mjs";
import { finisherTravelPath } from "./finisher-model.mjs";

const TRAVEL = new Set(["rush", "leap", "roll"]);
const mine = (s, mover) => (s.subject ?? "source") === mover;

export function composeFinisher(recipe, { offset = null, frame = null } = {}) {
  const mover = recipe.finisher?.mover ?? "targets";
  let moves = false;
  const back = (s) => { const { motionEnd, motionOffset, motionFrame, ...rest } = s; return rest; };
  const stages = recipe.stages.map((s) => {
    if (s.kind === "motion" && s.motion === "path" && s.motionEnd === "hold") {
      if (!mine(s, mover)) return back(s);
      // In place (a spin, a shrink): it keeps its hold, nothing moves.
      if (pathSquares(s.keyframes) === 0) return s;
      if (!offset || !frame) return back(s);
      moves = true;
      // Shrink the whole path to the reachable square, then pin its end exactly on it so the
      // pose and the document agree to the pixel.
      const k = Math.min(1, Math.hypot(offset.x, offset.y) / frame.length);
      const last = unrotateBy({ x: offset.x / k, y: offset.y / k }, frame.aim);
      const keyframes = s.keyframes.map((kf, i, all) => (i === all.length - 1 ? { ...kf, x: last.x, y: last.y } : kf));
      return { ...s, keyframes, motionFrame: { cos: frame.aim.x, sin: frame.aim.y, k } };
    }
    if (s.kind === "motion" && TRAVEL.has(s.motion) && s.motionEnd === "hold") {
      // Only the mover's travel can land; anything else, or no landing square, comes back.
      if (!offset || frame || !mine(s, mover)) return back(s);
      moves = true;
      return { ...s, motionOffset: offset };
    }
    if (offset && s.stageId === "landing" && mine(s.kind === "impact" ? { subject: "targets" } : s, mover))
      return { ...s, offsetX: offset.x, offsetY: offset.y };
    return s;
  });
  return { recipe: { ...recipe, stages }, moves };
}

const ends = (stages) => Math.max(0, ...stages.map((s) => (s.delay ?? 0) + (s.duration ?? 0)));
export const travelEnd = (plan) => ends(plan.filter((s) => s.kind === "motion" && (s.motionOffset || s.motionFrame)));
export const planEnd = (plan) => ends(plan);
// A vanish fades when the mover's last motion ends: waiting for trailing effects would let
// a non-held motion (a sink) spring back to full opacity first.
export const motionEnd = (plan) => plan.some((s) => s.kind === "motion") ? ends(plan.filter((s) => s.kind === "motion")) : planEnd(plan);

export function finisherDirection(finisher, { mover, attacker, target }) {
  return finisher.mover === "source" ? awayFrom(mover?.center, target?.center) : awayFrom(attacker?.center, mover?.center);
}

// Keyframed paths are drawn with +x away from the other token, for either mover.
export function pathAim(finisher, { mover, attacker, target }) {
  return finisher.mover === "source" ? awayFrom(target?.center, mover?.center) : awayFrom(attacker?.center, mover?.center);
}
// An in-place held path that already ends invisible needs no separate fade (a new fade would
// pop it back). A path that moved the token lands upright and visible, so that one still fades.
export const fadedAtEnd = (recipe, moves) => !moves && finisherTravelPath(recipe)?.keyframes?.at(-1)?.alpha === 0;

export async function playFinisher({ recipe, mover, attacker = null, target = null, dead = false }, host) {
  const f = recipe.finisher, grid = host.gridSize();
  const from = { x: mover.document.x, y: mover.document.y };
  const path = finisherTravelPath(recipe);
  let to = null, frame = null;
  // A landing that cannot be worked out plays the finisher in place rather than not at all.
  try {
    if (path) {
      const aim = pathAim(f, { mover, attacker, target });
      const end = aim && rotateBy(pathEnd(path.keyframes), aim), length = end ? Math.hypot(end.x, end.y) : 0;
      if (aim && pathSquares(path.keyframes) > 0 && length > 0) {
        to = host.landing(mover, { x: end.x / length, y: end.y / length }, Math.round(Math.max(Math.abs(end.x), Math.abs(end.y))));
        frame = { aim, length };
      }
    } else {
      const direction = f.knockback > 0 ? finisherDirection(f, { mover, attacker, target }) : null;
      to = direction ? host.landing(mover, direction, f.knockback) : null;
    }
  } catch (error) { host.trace("Blocked", `Finisher ${recipe.name} landing: ${error.message}`); }
  const offset = to && (to.x !== from.x || to.y !== from.y) ? { x: (to.x - from.x) / grid, y: (to.y - from.y) / grid } : null;
  const { recipe: composed, moves } = composeFinisher(recipe, { offset, frame });
  const commit = async (data) => host.commit(mover, { ...data, finisher: recipe.id });
  host.trace("Finisher", `${recipe.name}: ${mover.name ?? "token"}`);
  // The stages' source/targets roles follow who travels: a source-mover finisher plays from
  // the user and aims its target-subject effects at the target, not at the user.
  const context = f.mover === "source" ? { source: mover, targets: target ? [target] : [] } : { source: attacker ?? mover, targets: [mover] };
  const plan = await host.play(composed, context);
  // null: nothing played and nothing was written, so the caller may play its own fallback.
  // false: it played but a write failed.
  if (!plan) return null;
  try {
    const landed = moves ? travelEnd(plan) : 0;
    if (moves) {
      await host.wait(landed);
      await commit({ x: to.x, y: to.y, fromX: from.x, fromY: from.y });
    }
    // A survivor (a use finisher's target) only ever stays.
    const ending = dead ? f.ending : "stay";
    if (ending === "stay") return true;
    await host.wait(Math.max(0, motionEnd(plan) - landed));
    if (ending === "vanish") { if (!fadedAtEnd(composed, moves)) await host.fade(mover); await commit({ hidden: true }); }
    else await commit({ defeated: true });
    return true;
  } catch (error) {
    host.trace("Blocked", `Finisher ${recipe.name}: ${error.message}`);
    return false;
  }
}
