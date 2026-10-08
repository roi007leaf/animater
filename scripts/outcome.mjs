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
    let stages = recipe.stages.filter((s) => !dropped.has(s.stageId) && !(s.kind === "sound" && dropped.has(s.afterStage)));
    // A critical failure is a fumble: the attacker stumbles as the attack goes astray.
    if (outcome === "criticalFailure" && !stages.some((s) => s.kind === "motion" && s.motion === "stagger" && s.subject === "source"))
      stages = [...stages.filter((s) => !(s.kind === "motion" && s.subject === "source")), { stageId: "fumble", kind: "motion", motion: "stagger", subject: "source", delay: 450, duration: 900, distance: 0.16, intensity: 0.6, assets: [], label: "Fumble" }];
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

// A creature's reaction to its own saving throw against a spell or effect, one per
// degree of success (D&D 5e saves only pass or fail).
const SAVE_REACTIONS = {
  criticalSuccess: { motion: "brace", duration: 900, distance: 0.1, intensity: 0.45, label: "Shrugs it off" },
  success: { motion: "shake", duration: 700, distance: 0.08, intensity: 0.35, label: "Resists" },
  failure: { motion: "stagger", duration: 900, distance: 0.16, intensity: 0.6, label: "Takes the brunt" },
  criticalFailure: { motion: "stagger", duration: 1100, distance: 0.26, intensity: 0.9, label: "Overwhelmed" },
};
export function saveReaction(outcome) {
  const r = SAVE_REACTIONS[outcome];
  if (!r) return null;
  return { id: `animater-save-${outcome}`, name: `Saving throw: ${r.label}`, trigger: "manual", stages: [{ stageId: "save", kind: "motion", subject: "source", assets: [], ...r }] };
}
// PF2e/SF2e: a saving-throw message against a spell or effect (not a plain roll).
export function twoeSaveOutcome(message, systemId = "pf2e") {
  const context = message?.flags?.[systemId]?.context;
  if (context?.type !== "saving-throw" || !SAVE_REACTIONS[context.outcome] || !context.origin) return null;
  if (message.blind || message.whisper?.length) return null;
  return context.outcome;
}
// D&D 5e: pass or fail against the save DC, when the roll knows it.
export function dnd5eSaveOutcome(rolls = []) {
  const roll = rolls[0], dc = Number(roll?.options?.target);
  if (!roll || !Number.isFinite(dc) || !Number.isFinite(Number(roll.total))) return null;
  if (roll.options?.rollMode && roll.options.rollMode !== "publicroll") return null;
  return Number(roll.total) >= dc ? "success" : "failure";
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
