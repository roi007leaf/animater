// Roll outcomes shape the animation: a miss flies wide and never lands on the target,
// a critical hit lands harder and knocks the target back further. Outcomes use PF2e's
// degrees of success; D&D 5e attack rolls are mapped onto them (see dnd5eAttackOutcome).
export const MISS = new Set(["failure", "criticalFailure"]);
export const CRIT_IMPACT_SCALE = 1.35;

const onTargets = (s) => s.subject === "targets" || ["impact"].includes(s.kind);

export function withOutcome(recipe, { outcome, type } = {}) {
  if (!outcome || !recipe?.stages?.length) return recipe;
  if (MISS.has(outcome) && type === "attack") {
    // The flight still plays (bent wide by the runtime); nothing reaches the target.
    const dropped = new Set(recipe.stages.filter((s) => s.kind !== "sound" && onTargets(s)).map((s) => s.stageId));
    if (!dropped.size) return recipe;
    const stages = recipe.stages.filter((s) => !dropped.has(s.stageId) && !(s.kind === "sound" && dropped.has(s.afterStage)));
    return stages.some((s) => s.kind !== "sound") ? { ...recipe, stages } : recipe;
  }
  if (outcome === "criticalSuccess") {
    const stages = recipe.stages.map((s) => {
      if (s.kind === "impact") return { ...s, scale: (s.scale ?? 1) * CRIT_IMPACT_SCALE };
      if (s.kind === "motion" && s.subject === "targets") return { ...s, intensity: Math.min(1, (s.intensity ?? 0.6) * 1.4), distance: Math.min(0.5, (s.distance ?? 0.16) * 1.4) };
      return s;
    });
    // A critical hit always rocks the target, even when the design had no reaction.
    const impact = stages.find((s) => s.kind === "impact");
    if (impact && !stages.some((s) => s.kind === "motion" && s.subject === "targets"))
      stages.push({ stageId: `${impact.stageId}-crit`, kind: "motion", motion: "stagger", subject: "targets", afterStage: impact.stageId, timingAnchor: "start", startOffset: 80, duration: 900, distance: 0.2, intensity: 0.8, assets: [], optionalTargets: true });
    return { ...recipe, stages };
  }
  return recipe;
}

// D&D 5e: a natural 20 is a critical hit, a natural 1 a miss; otherwise the total
// against the single target's AC decides (unknown with several targets or no AC).
export function dnd5eAttackOutcome(rolls = [], targets = []) {
  const roll = rolls[0];
  if (!roll) return null;
  if (roll.isCritical) return "criticalSuccess";
  if (roll.isFumble) return "criticalFailure";
  const ac = targets.length === 1 ? Number(targets[0]?.ac) : NaN;
  if (!Number.isFinite(ac) || !Number.isFinite(Number(roll.total))) return null;
  return Number(roll.total) >= ac ? "success" : "failure";
}
