import test from "node:test";
import assert from "node:assert/strict";
import { withOutcome, dnd5eAttackOutcome, CRIT_IMPACT_SCALE } from "../scripts/outcome.mjs";
import { validateRecipe } from "../scripts/model.mjs";
import { motionPose } from "../scripts/motion.mjs";

const bolt = () => validateRecipe({ id: "bolt", name: "Bolt", trigger: "attack", stages: [
  { stageId: "c", kind: "cast", assets: ["jb2a.a"] },
  { stageId: "t", kind: "travel", assets: ["jb2a.b"] },
  { stageId: "i", kind: "impact", assets: ["jb2a.c"], afterStage: "t", timingAnchor: "end", scale: 1.5 },
  { stageId: "m", kind: "motion", motion: "recoil", subject: "targets", afterStage: "i", assets: [] },
  { stageId: "s", kind: "sound", soundFile: "hit.ogg", afterStage: "i", assets: [] },
  { stageId: "r", kind: "sound", soundFile: "release.ogg", afterStage: "t", assets: [] },
] });

test("a miss flies but never lands: no impact, flinch or impact sound on the target", () => {
  const out = withOutcome(bolt(), { outcome: "failure", type: "attack" });
  assert.deepEqual(out.stages.map((s) => s.stageId), ["c", "t", "r"]);
  assert.equal(withOutcome(bolt(), { outcome: "criticalFailure", type: "attack" }).stages.length, 3);
  // Damage and use events are never treated as misses.
  assert.equal(withOutcome(bolt(), { outcome: "failure", type: "damage" }).stages.length, 6);
});

test("a critical hit lands harder and always rocks the target", () => {
  const out = withOutcome(bolt(), { outcome: "criticalSuccess", type: "attack" });
  assert.equal(out.stages.find((s) => s.stageId === "i").scale, 1.5 * CRIT_IMPACT_SCALE);
  assert.ok(out.stages.find((s) => s.stageId === "m").intensity > 0.6);
  const bare = validateRecipe({ id: "b", name: "B", trigger: "attack", stages: [{ stageId: "i", kind: "impact", assets: ["jb2a.c"] }] });
  const rocked = withOutcome(bare, { outcome: "criticalSuccess", type: "attack" });
  assert.equal(rocked.stages.find((s) => s.kind === "motion")?.motion, "stagger");
  assert.doesNotThrow(() => validateRecipe(rocked));
  assert.equal(withOutcome(bolt(), { outcome: "success", type: "attack" }).stages.length, 6);
});

test("D&D 5e attack rolls map to degrees of success", () => {
  assert.equal(dnd5eAttackOutcome([{ isCritical: true, total: 5 }], [{ ac: 30 }]), "criticalSuccess");
  assert.equal(dnd5eAttackOutcome([{ isFumble: true, total: 30 }], [{ ac: 5 }]), "criticalFailure");
  assert.equal(dnd5eAttackOutcome([{ total: 15 }], [{ ac: 15 }]), "success");
  assert.equal(dnd5eAttackOutcome([{ total: 14 }], [{ ac: 15 }]), "failure");
  assert.equal(dnd5eAttackOutcome([{ total: 14 }], [{ ac: 15 }, { ac: 10 }]), null, "several targets: unknown");
  assert.equal(dnd5eAttackOutcome([{ total: 14 }], []), null);
  assert.equal(dnd5eAttackOutcome([], []), null);
});

test("collapse tips the creature over and returns it to its pose", () => {
  const stage = { motion: "collapse", duration: 1800, distance: 0.25, intensity: 0.8 };
  const mid = motionPose(stage, 0.5, { x: 1, y: 0 }, 100);
  assert.ok(Math.abs(mid.rotation) > 0.2 && mid.y > 0 && mid.scaleY < 1);
  const end = motionPose(stage, 1, { x: 1, y: 0 }, 100);
  assert.ok(Math.abs(end.rotation ?? 0) < 1e-6 && Math.abs(end.y ?? 0) < 1e-6);
});
