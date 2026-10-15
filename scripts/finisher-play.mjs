// Plays a finisher on the real token: travel lands on a square (motionOffset + hold), the
// document is moved there, then the ending runs. Foundry is reached only through `host`.
import { awayFrom } from "./displacement.mjs";
import { cutPath, pathEnd, pathSquares, rotateBy, unrotateBy } from "./keyframe-path.mjs";
import { finisherTravelPath } from "./finisher-model.mjs";
import { timedStages } from "./composition.mjs";

const TRAVEL = new Set(["rush", "leap", "roll"]);
const mine = (s, mover) => (s.subject ?? "source") === mover;

// `inPlace` is decided by playFinisher from the aimed end; `survives` strips in-place holds,
// which would otherwise leave a survivor shrunk or faded until the hold runs out.
// `slam` ({ keyframes, t, aim }) is a travel path cut at a wall: it plays the cut part at the same
// speed, the "wall*" stages play where it hits (they are dropped otherwise) and "landing" is dropped.
// `vanishing` ({ aim }) is a travel path that ends invisible: it is aimed and held, never moved.
// `at` is the mover's centre before it moves (canvas px): the crash and landing are offset from
// it, not from the token, which is somewhere else once its move is written.
export function composeFinisher(recipe, { offset = null, frame = null, inPlace, survives = false, slam = null, vanishing = null, at = null } = {}) {
  const mover = recipe.finisher?.mover ?? "targets", travel = finisherTravelPath(recipe);
  let moves = false;
  const back = (s) => { const { motionEnd, motionOffset, motionFrame, ...rest } = s; return rest; };
  const pinned = (s) => (at ? { ...s, atPoint: { x: at.x, y: at.y } } : s);
  // Impacts play on the targets; anything else on its own subject.
  const onMover = (s) => mine(s.kind === "impact" ? { subject: "targets" } : s, mover);
  // The cut keyframes are already resampled from the eased motion: they play linear.
  const cut = slam && travel ? { ...travel, keyframes: slam.keyframes, pathEase: "linear", duration: Math.max(100, Math.round((travel.duration ?? 0) * slam.t)) } : null;
  // A held cut hits the wall as it ends; the bump (no landing) returns, reaching the wall at 85%.
  const early = cut && !offset ? Math.round(cut.duration * 0.15) : 0;
  // The crash sits 0.6 square past the landing (or the origin), on the wall side.
  const wall = { x: (offset?.x ?? 0) + (slam?.aim.x ?? 0) * 0.6, y: (offset?.y ?? 0) + (slam?.aim.y ?? 0) * 0.6 };
  // Linked to the travel's end, so the crash follows it wherever the travel itself is timed from.
  const atWall = (s) => {
    const { startMode, startRef, ...rest } = s, delay = Math.max(0, (cut.delay ?? 0) + cut.duration - early);
    return cut.stageId ? { ...rest, afterStage: cut.stageId, timingAnchor: "end", startOffset: -early, delay } : { ...rest, afterStage: "", delay };
  };
  const stages = recipe.stages.flatMap((original) => {
    const s = cut && original === travel ? cut : original;
    if (String(s.stageId ?? "").startsWith("wall")) {
      if (!cut) return [];
      if (!onMover(s)) return s.kind === "motion" ? [] : atWall(s);
      return s.kind === "motion" ? atWall(s) : pinned({ ...atWall(s), offsetX: wall.x, offsetY: wall.y });
    }
    if (cut && s.stageId === "landing") return [];
    if (s.kind === "motion" && s.motion === "path" && s.motionEnd === "hold") {
      if (!mine(s, mover)) return back(s);
      // In place (a spin, a shrink): it keeps its hold, nothing moves.
      const isTravel = original === travel;
      if (isTravel && vanishing && mine(s, mover)) return { ...s, motionFrame: { cos: vanishing.aim.x, sin: vanishing.aim.y, k: 1 } };
      const still = isTravel ? (inPlace ?? pathSquares(s.keyframes) === 0) : pathSquares(s.keyframes) === 0;
      if (still) return survives ? back(s) : s;
      // Only the travel path lands: a second travelling copy would fly the token twice.
      if (!isTravel || !offset || !frame) return back(s);
      moves = true;
      // Shrink the whole path to the reachable square, then pin its end exactly on it so the
      // pose and the document agree to the pixel.
      const k = Math.min(1, Math.hypot(offset.x, offset.y) / frame.length);
      const last = unrotateBy({ x: offset.x / k, y: offset.y / k }, frame.aim);
      const keyframes = s.keyframes.map((kf, i, all) => (i === all.length - 1 ? { ...kf, x: last.x, y: last.y } : kf));
      return { ...s, keyframes, motionFrame: { cos: frame.aim.x, sin: frame.aim.y, k } };
    }
    // Fragments hold the real token hidden; a survivor must reappear once the pieces fade.
    if (survives && s.kind === "motion" && s.motion === "fragments" && s.motionEnd === "hold" && mine(s, mover)) return back(s);
    if (s.kind === "motion" && TRAVEL.has(s.motion) && s.motionEnd === "hold") {
      // Only the mover's travel can land; anything else, or no landing square, comes back.
      if (!offset || frame || !mine(s, mover)) return back(s);
      moves = true;
      return { ...s, motionOffset: offset };
    }
    if (offset && s.stageId === "landing" && mine(s.kind === "impact" ? { subject: "targets" } : s, mover))
      return pinned({ ...s, offsetX: offset.x, offsetY: offset.y });
    // A vanishing path is drawn with +x away from the attacker: the mover's effects authored in
    // that frame (Sky launch's twinkle) turn with it, as the wall stages do.
    if (vanishing && s.kind !== "motion" && onMover(s) && (Number(s.offsetX) || Number(s.offsetY))) {
      const at = rotateBy({ x: Number(s.offsetX) || 0, y: Number(s.offsetY) || 0 }, vanishing.aim);
      return { ...s, offsetX: at.x, offsetY: at.y };
    }
    return s;
  });
  return { recipe: { ...recipe, stages: unlinkDropped(recipe.stages, stages) }, moves };
}

// A stage linked to a dropped stage would stop the finisher ("linked stage was removed"): it keeps
// the time it had and loses the link, as deleting a stage in the studio does.
function unlinkDropped(before, after) {
  const kept = new Set(after.map((s) => s.stageId));
  const gone = new Set(before.map((s) => s.stageId).filter((id) => id && !kept.has(id)));
  if (!gone.size) return after;
  let resolved = [];
  try { resolved = timedStages({ stages: before }); } catch { /* keep the numeric delay */ }
  return after.map((s) => {
    if (!gone.has(s.afterStage) && !gone.has(s.startRef)) return s;
    const { startMode, startRef, timingAnchor, startOffset, ...rest } = s, was = resolved.find((r) => r.stageId === s.stageId)?.delay;
    return { ...rest, afterStage: "", delay: Number.isFinite(was) ? Math.round(was) : (s.delay ?? 0) };
  });
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
// A path that moved the token lands upright and visible, so a vanish still fades it. A mover
// still held in place (shrunk, faded, turned) needs no separate fade: one would pop it back.
// Fragments hide the real token while the pieces fly, so they need no fade either.
export const fadedAtEnd = (recipe, moves) => !moves && recipe.stages.some((s) => s.kind === "motion" && (s.motion === "path" || s.motion === "fragments")
  && s.motionEnd === "hold" && mine(s, recipe.finisher?.mover ?? "targets"));

export async function playFinisher({ recipe, mover, attacker = null, target = null, dead = false }, host) {
  const f = recipe.finisher, grid = host.gridSize();
  const from = { x: mover.document.x, y: mover.document.y };
  const path = finisherTravelPath(recipe);
  let to = null, frame = null, inPlace, slam = null, vanishing = null;
  // A landing that cannot be worked out plays the finisher in place rather than not at all.
  try {
    if (path) {
      // In place or not is counted on the aimed end, the way the landing walks the grid.
      const aim = pathAim(f, { mover, attacker, target });
      const end = aim ? rotateBy(pathEnd(path.keyframes), aim) : pathEnd(path.keyframes), length = Math.hypot(end.x, end.y);
      const squares = Math.round(Math.max(Math.abs(end.x), Math.abs(end.y)));
      inPlace = squares === 0;
      // Gone in flight (ends invisible): aimed, held until hidden, never moved — moving an
      // invisible token would only show it again at the landing.
      // A survivor (not dead) never vanishes, nor does a non-vanish ending (it lands as before),
      // and an in-place path already stays put.
      const vanishes = dead && f.ending === "vanish" && !inPlace && path.keyframes.at(-1).alpha === 0;
      if (vanishes) vanishing = { aim: aim ?? { x: 1, y: 0 } };
      else if (aim && !inPlace) {
        to = host.landing(mover, { x: end.x / length, y: end.y / length }, squares);
        frame = { aim, length };
        // Slam: a wall cuts the path where it hits, at full speed, instead of shrinking it to fit.
        const landed = to && Math.round(Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)) / grid);
        if (to && f.wall === "slam" && landed < squares) {
          // Rotation keeps lengths, so the world offset's length is the reach in the path's frame.
          const cut = cutPath(path.keyframes, landed > 0 ? Math.hypot(to.x - from.x, to.y - from.y) / grid : 0.3, path.pathEase ?? "linear");
          slam = { ...cut, aim };
          const cutEnd = pathEnd(cut.keyframes);
          if (landed > 0) frame = { aim, length: Math.hypot(cutEnd.x, cutEnd.y) };
        }
      }
    } else {
      const direction = f.knockback > 0 ? finisherDirection(f, { mover, attacker, target }) : null;
      to = direction ? host.landing(mover, direction, f.knockback) : null;
    }
  } catch (error) { host.trace("Blocked", `Finisher ${recipe.name} landing: ${error.message}`); }
  const offset = to && (to.x !== from.x || to.y !== from.y) ? { x: (to.x - from.x) / grid, y: (to.y - from.y) / grid } : null;
  // Where Sequencer centres an effect on the mover, taken before anything moves.
  const at = { x: from.x + (mover.w ?? (mover.document.width ?? 1) * grid) / 2, y: from.y + (mover.h ?? (mover.document.height ?? 1) * grid) / 2 };
  const { recipe: composed, moves } = composeFinisher(recipe, { offset, frame, inPlace, survives: !dead, slam, vanishing, at });
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
