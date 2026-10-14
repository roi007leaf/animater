// Plays a finisher on the real token: travel lands on a square (motionOffset + hold), the
// document is moved there, then the ending runs. Foundry is reached only through `host`.
import { awayFrom } from "./displacement.mjs";

const TRAVEL = new Set(["rush", "leap", "roll"]);
const mine = (s, mover) => (s.subject ?? "source") === mover;

export function composeFinisher(recipe, { offset = null } = {}) {
  const mover = recipe.finisher?.mover ?? "targets";
  let moves = false;
  const stages = recipe.stages.map((s) => {
    if (s.kind === "motion" && TRAVEL.has(s.motion) && s.motionEnd === "hold") {
      // Only the mover's travel can land; anything else, or no landing square, comes back.
      if (!offset || !mine(s, mover)) { const { motionEnd, motionOffset, ...back } = s; return back; }
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
export const travelEnd = (plan) => ends(plan.filter((s) => s.kind === "motion" && s.motionOffset));
export const planEnd = (plan) => ends(plan);
// A vanish fades when the mover's last motion ends: waiting for trailing effects would let
// a non-held motion (a sink) spring back to full opacity first.
export const motionEnd = (plan) => plan.some((s) => s.kind === "motion") ? ends(plan.filter((s) => s.kind === "motion")) : planEnd(plan);

export function finisherDirection(finisher, { mover, attacker, target }) {
  return finisher.mover === "source" ? awayFrom(mover?.center, target?.center) : awayFrom(attacker?.center, mover?.center);
}

export async function playFinisher({ recipe, mover, attacker = null, target = null, dead = false }, host) {
  const f = recipe.finisher, grid = host.gridSize();
  const from = { x: mover.document.x, y: mover.document.y };
  const direction = f.knockback > 0 ? finisherDirection(f, { mover, attacker, target }) : null;
  let to = null;
  // A landing that cannot be worked out plays the finisher in place rather than not at all.
  try { to = direction ? host.landing(mover, direction, f.knockback) : null; }
  catch (error) { host.trace("Blocked", `Finisher ${recipe.name} landing: ${error.message}`); }
  const offset = to && (to.x !== from.x || to.y !== from.y) ? { x: (to.x - from.x) / grid, y: (to.y - from.y) / grid } : null;
  const { recipe: composed, moves } = composeFinisher(recipe, { offset });
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
    if (ending === "vanish") { await host.fade(mover); await commit({ hidden: true }); }
    else await commit({ defeated: true });
    return true;
  } catch (error) {
    host.trace("Blocked", `Finisher ${recipe.name}: ${error.message}`);
    return false;
  }
}
