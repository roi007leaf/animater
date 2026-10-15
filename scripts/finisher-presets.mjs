// Built-in finishers to copy and make your own. Each moves the real target token; flinging
// ones travel on a held keyframed path so the token is moved to where it lands (finisher-play.mjs).
import { validateRecipe } from "./model.mjs";
import { damageLook } from "./damage-moments.mjs";

const HIT = ["jb2a.impact.003.white", "jb2a.impact.005.white"];
const DUST = ["jb2a.smoke.puff.side.grey", "jb2a.smoke.puff.centered.grey"];
const look = (type) => damageLook(type);
const fx = (stageId, assets, extra = {}) => ({ stageId, kind: "impact", assets, duration: 1200, ...extra });
const move = (stageId, motion, extra = {}) => ({ stageId, kind: "motion", motion, subject: "targets", assets: [], ...extra });
const kf = (at, x = 0, y = 0, extra = {}) => ({ at, x, y, ...extra });
// A held keyframed path on the target: travel ends upright on its square; in-place ones fade out.
const path = (keyframes, extra = {}) => move("fly", "path", { motionEnd: "hold", duration: 1300, keyframes, ...extra });
const preset = (name, description, finisher, stages) => ({ name, description, build: () => ({ name, description, trigger: "manual", color: "#c0392b", finisher, stages }) });

export const FINISHER_PRESETS = {
  launch: preset("Launch", "Sent flying, crashes down in a cloud of dust.", { knockback: 3, ending: "body" },
    [fx("hit", HIT, { duration: 900 }), path([kf(0), kf(0.35, 1.1, 0, { rotation: 250, scale: 1.3 }), kf(0.75, 2.6, 0, { rotation: 600, scale: 1.1 }), kf(1, 3, 0, { rotation: 720, ease: "easeOutQuad" })], { delay: 150 }), fx("landing", DUST, { delay: 1450 })]),
  cleave: preset("Cleave", "A clean cut drops it where it stands.", { knockback: 0, ending: "body" },
    [fx("slash", ["jb2a.melee_generic.slashing.one_handed", "jb2a.melee_generic.slash"], { duration: 900 }), move("stagger", "stagger", { delay: 200, duration: 900 }), move("fall", "collapse", { delay: 900, duration: 1400 })]),
  skewer: preset("Skewer", "Driven back a step and pinned.", { knockback: 1, ending: "body" },
    [fx("hit", HIT, { duration: 800 }), path([kf(0), kf(1, 1, 0, { ease: "easeOutCubic" })], { duration: 450 }), move("fall", "collapse", { delay: 700, duration: 1400 })]),
  "struck-down": preset("Struck down", "Snapped back by the shot and dropped.", { knockback: 1, ending: "body" },
    [fx("hit", HIT, { duration: 800 }), path([kf(0), kf(1, 1, 0, { ease: "easeOutCubic" })], { duration: 350 }), move("fall", "collapse", { delay: 500, duration: 1400 })]),
  ash: preset("Burn to ash", "Flames consume it until nothing is left.", { knockback: 0, ending: "vanish" },
    [fx("burn", look("fire").death, { duration: 1800 }), path([kf(0), kf(0.4, 0, 0, { scale: 1.05 }), kf(1, 0, 0, { scale: 0.2, alpha: 0 })], { delay: 300, duration: 1800 }), fx("ash", look("fire").after, { delay: 1500, duration: 1500 })]),
  shatter: preset("Shatter", "Frozen solid, then broken apart.", { knockback: 0, ending: "vanish" },
    [fx("freeze", look("cold").death, { duration: 1400 }), path([kf(0), kf(0.5, 0, 0, { scale: 1.02 }), kf(0.6, 0.05, 0, { sharp: true }), kf(0.7, -0.05, 0, { sharp: true }), kf(1, 0, 0, { scale: 1.3, alpha: 0 })], { delay: 200, duration: 1600 }), fx("burst", look("cold").after, { delay: 1200 })]),
  jolt: preset("Jolt", "Lightning hurls it aside.", { knockback: 2, ending: "body" },
    [fx("shock", look("electricity").death, { duration: 1600 }), path([kf(0), kf(0.3, 0, 0.2), kf(0.7, 1.4, -0.2, { rotation: -180, scale: 1.15 }), kf(1, 2, 0, { rotation: -360 })], { delay: 400, duration: 1100 }), fx("landing", look("electricity").after, { delay: 1500 })]),
  blast: preset("Blast", "Thrown hard by raw force.", { knockback: 3, ending: "body" },
    [fx("blast", look("force").death), path([kf(0), kf(0.6, 2.6, 0, { rotation: 300, ease: "easeOutCubic" }), kf(1, 3, 0, { rotation: 360 })], { delay: 100, duration: 900 }), fx("landing", look("force").after, { delay: 1000 })]),
  unmade: preset("Unmade", "Twists into the dark and is gone.", { knockback: 0, ending: "vanish" },
    [fx("vortex", look("void").death, { duration: 2000 }), path([kf(0), kf(0.5, 0, 0, { rotation: 360, scale: 0.6 }), kf(1, 0, 0, { rotation: 720, scale: 0.05, alpha: 0, ease: "easeInQuad" })], { delay: 200, duration: 1600 })]),
  melt: preset("Melt", "Dissolves into a puddle.", { knockback: 0, ending: "vanish" },
    [fx("dissolve", look("acid").death, { duration: 1800 }), path([kf(0), kf(0.6, 0, 0, { scale: 0.8 }), kf(1, 0, 0, { scale: 0.3, alpha: 0 })], { delay: 300, duration: 1600 }), fx("puddle", look("acid").after, { delay: 1400, duration: 1600 })]),
  ascend: preset("Ascend", "Rises into the light.", { knockback: 0, ending: "vanish" },
    [fx("light", look("vitality").death, { duration: 2000 }), path([kf(0), kf(0.7, 0, 0, { scale: 1.15 }), kf(1, 0, 0, { scale: 1.3, alpha: 0 })], { delay: 200, duration: 1800 }), fx("stars", look("vitality").after, { delay: 1600 })]),
  "shaken-apart": preset("Shaken apart", "Vibrates until it bursts.", { knockback: 0, ending: "vanish" },
    [path([kf(0), kf(0.15, 0.08, 0, { sharp: true }), kf(0.3, -0.08, 0, { sharp: true }), kf(0.45, 0.08, 0, { sharp: true }), kf(0.6, -0.08, 0, { sharp: true }), kf(0.8, 0, 0, { scale: 1.1 }), kf(1, 0, 0, { scale: 1.4, alpha: 0 })], { duration: 1400 }), fx("burst", look("sonic").death, { delay: 1000 }), fx("cracks", look("sonic").after, { delay: 1100, duration: 1500 })]),
  "soul-departs": preset("Soul departs", "The body crumples as the spirit leaves.", { knockback: 0, ending: "body" },
    [move("fall", "collapse", { duration: 1400 }), fx("depart", look("spirit").death, { delay: 400, duration: 1600 })]),
  fall: preset("Fall", "Simply drops.", { knockback: 0, ending: "body" },
    [move("fall", "collapse", { duration: 1400 })]),
};

export function presetFinisher(id, newId) {
  const p = FINISHER_PRESETS[id] ?? FINISHER_PRESETS.fall;
  return validateRecipe({ ...p.build(), id: newId });
}
