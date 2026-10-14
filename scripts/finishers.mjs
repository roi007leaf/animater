// Finishers: an NPC killed by an attack goes out in style. The real token steps out of
// sight (the "vanish" motion) while copies of its artwork fly, split, melt or rise; the
// caller then moves the real token to where the copy landed and hides it (displacement.mjs).
import { damageLook, normalizeDamageType } from "./damage-moments.mjs";
import { CRIT_IMPACT_SCALE } from "./outcome.mjs";

const VANISH_TAIL = 600;
const fx = (stageId, assets, extra = {}) => ({ stageId, kind: "cast", assets, duration: 1200, ...extra });
const copy = (stageId, duration, tracks, extra = {}) => ({ stageId, kind: "sprite", subject: "source", assets: [], duration, tracks, ...extra });
const track = (property, from, to, duration, extra = {}) => ({ property, from, to, duration, ...extra });
const fadeOut = (duration) => track("alpha", 1, 0, duration, { fromEnd: true });
const fly = (dx, dy, duration, ease = "easeOutQuad", delay = 0) => [track("position.x", 0, dx, duration, { ease, delay }), track("position.y", 0, dy, duration, { ease, delay })];
const look = (type) => damageLook(type) ?? { death: [], after: [], hit: [] };
const HIT = ["jb2a.impact.003.white", "jb2a.impact.005.white"];
const DUST = ["jb2a.smoke.puff.side.grey", "jb2a.smoke.puff.centered.grey"];

// squares: [min, max] landing distance from the attacker; flight: ms until the copies are gone.
export const FINISHERS = {
  launch: { label: "Launched", squares: [2, 3], flight: 1800, stages: ({ dx, dy, hit }) => [
    fx("hit", HIT, { duration: 900, scale: hit }),
    copy("body", 1800, [...fly(dx, dy, 1300), track("rotation", 0, 540, 1300, { ease: "easeOutQuad" }), fadeOut(500)]),
    fx("landing", DUST, { delay: 1200, offsetX: dx, offsetY: dy }),
  ] },
  cleave: { label: "Cleaved", squares: [0, 0], flight: 1600, stages: ({ hit }) => [
    fx("slash", ["jb2a.melee_generic.slashing.one_handed", "jb2a.melee_generic.slash"], { duration: 900, scale: hit }),
    copy("half-left", 1600, [track("position.x", 0, -0.35, 1100, { ease: "easeOutCubic", delay: 300 }), track("rotation", 0, -25, 1100, { ease: "easeOutCubic", delay: 300 }), fadeOut(600)], { opacity: 0.85 }),
    copy("half-right", 1600, [track("position.x", 0, 0.35, 1100, { ease: "easeOutCubic", delay: 300 }), track("rotation", 0, 25, 1100, { ease: "easeOutCubic", delay: 300 }), fadeOut(600)], { opacity: 0.85 }),
  ] },
  skewer: { label: "Skewered", squares: [1, 1], flight: 1600, stages: ({ dx, dy, hit }) => [
    fx("hit", HIT, { duration: 800, scale: hit }),
    copy("body", 1600, [...fly(dx, dy, 350, "easeOutCubic"), track("scale.y", 1, 0.7, 700, { fromEnd: true, ease: "easeInQuad" }), fadeOut(700)]),
  ] },
  "struck-down": { label: "Struck down", squares: [1, 1], flight: 1600, stages: ({ dx, dy, hit }) => [
    fx("hit", HIT, { duration: 800, scale: hit }),
    copy("body", 1600, [...fly(dx, dy, 350, "easeOutCubic"), track("rotation", 0, 85, 600, { delay: 300, ease: "easeOutQuad" }), fadeOut(600)]),
  ] },
  ash: { label: "Burned to ash", squares: [0, 0], flight: 2000, stages: () => [
    fx("burn", look("fire").death, { duration: 1800, scale: 1.1 }),
    copy("body", 2000, [track("scale.x", 1, 0.15, 1400, { delay: 400, ease: "easeInQuad" }), track("scale.y", 1, 0.15, 1400, { delay: 400, ease: "easeInQuad" }), fadeOut(400)]),
    fx("ash", look("fire").after, { delay: 1500, duration: 1500 }),
  ] },
  shatter: { label: "Shattered", squares: [0, 0], flight: 2000, stages: () => [
    fx("freeze", look("cold").death, { duration: 1400 }),
    copy("body", 1000, [fadeOut(150)]),
    ...[[-0.7, -0.5, -120], [0.75, -0.3, 140], [0, 0.8, 90]].map(([x, y, r], i) =>
      copy(`shard-${i + 1}`, 1000, [track("position.x", 0, x, 900, { ease: "easeOutCubic" }), track("position.y", 0, y, 900, { ease: "easeOutCubic" }), track("rotation", 0, r, 900), fadeOut(600)], { delay: 900, scale: 0.45 })),
    fx("burst", look("cold").after, { delay: 900 }),
  ] },
  jolt: { label: "Jolted", squares: [1, 2], flight: 1800, stages: ({ dx, dy }) => [
    fx("shock", look("electricity").death, { duration: 1600 }),
    copy("body", 1800, [...fly(dx, dy, 700, "easeOutQuad", 500), track("rotation", 0, -200, 700, { delay: 500 }), fadeOut(500)]),
    fx("landing", look("electricity").after, { delay: 1200, offsetX: dx, offsetY: dy }),
  ] },
  blast: { label: "Blasted away", squares: [3, 3], flight: 1600, stages: ({ dx, dy, hit }) => [
    fx("blast", look("force").death, { scale: hit }),
    copy("body", 1600, [...fly(dx, dy, 700, "easeOutCubic"), track("rotation", 0, 360, 700), fadeOut(500)]),
    fx("landing", look("force").after, { delay: 700, offsetX: dx, offsetY: dy }),
  ] },
  unmade: { label: "Unmade", squares: [0, 0], flight: 2000, stages: () => [
    fx("vortex", look("void").death, { duration: 2000 }),
    copy("body", 2000, [track("rotation", 0, 720, 1600, { delay: 200, ease: "easeInQuad" }), track("scale.x", 1, 0.05, 1600, { delay: 200, ease: "easeInQuad" }), track("scale.y", 1, 0.05, 1600, { delay: 200, ease: "easeInQuad" }), fadeOut(300)]),
  ] },
  melt: { label: "Melted", squares: [0, 0], flight: 2000, stages: () => [
    fx("dissolve", look("acid").death, { duration: 1800 }),
    copy("body", 2000, [track("scale.y", 1, 0.1, 1500, { delay: 300, ease: "easeInQuad" }), track("scale.x", 1, 1.3, 1500, { delay: 300 }), fadeOut(400)]),
    fx("puddle", look("acid").after, { delay: 1400, duration: 1600 }),
  ] },
  ascend: { label: "Ascended", squares: [0, 0], flight: 2200, stages: () => [
    fx("light", look("vitality").death, { duration: 2000 }),
    copy("body", 2200, [track("position.y", 0, -1.2, 1800, { delay: 200, ease: "easeInQuad" }), fadeOut(1200)]),
    fx("stars", look("vitality").after, { delay: 1600 }),
  ] },
  "shaken-apart": { label: "Shaken apart", squares: [0, 0], flight: 1800, stages: () => [
    copy("body", 1800, [track("position.x", -0.06, 0.06, 100, { loop: true, pingPong: true }), fadeOut(400)]),
    fx("burst", look("sonic").death, { delay: 1100 }),
    fx("cracks", look("sonic").after, { delay: 1200, duration: 1500 }),
  ] },
  "soul-leaves": { label: "Soul departs", squares: [0, 0], flight: 2200, stages: ({ type }) => [
    copy("body", 1400, [track("rotation", 0, 80, 900, { ease: "easeOutQuad" }), track("scale.y", 1, 0.8, 900), fadeOut(500)]),
    copy("soul", 1600, [track("position.y", 0, -1, 1400, { ease: "easeOutQuad" }), track("alpha", 0.6, 0, 800, { fromEnd: true })], { delay: 500, opacity: 0.6 }),
    fx("depart", look(type === "mental" ? "mental" : "spirit").death, { delay: 400, duration: 1600 }),
  ] },
  fall: { label: "Falls", squares: [0, 0], flight: 1600, stages: () => [
    copy("body", 1600, [track("rotation", 0, 80, 900, { ease: "easeOutQuad" }), track("scale.y", 1, 0.85, 900), fadeOut(600)]),
  ] },
};

const ENERGY = { fire: "ash", cold: "shatter", electricity: "jolt", force: "blast", void: "unmade", acid: "melt", vitality: "ascend", sonic: "shaken-apart", mental: "soul-leaves", spirit: "soul-leaves" };
const PHYSICAL = { bludgeoning: "launch", slashing: "cleave", piercing: "skewer" };

// Energy damage decides on its own; physical damage by how the blow was struck.
export function pickFinisher({ attackKind, damageType, crit = false } = {}, rng = Math.random) {
  const type = normalizeDamageType(damageType);
  const physical = PHYSICAL[type];
  const id = ENERGY[type] ?? (physical && attackKind === "ranged" ? "struck-down" : physical && attackKind === "spell" ? "launch" : physical) ?? "fall";
  const { label, squares: [min, max], flight } = FINISHERS[id];
  const squares = min + Math.floor(rng() * (max - min + 1));
  return { id, label, flight, squares: squares > 0 && crit ? squares + 1 : squares };
}

// dx/dy: where the copy lands, in grid squares from where the token stood.
export function finisherRecipe(id, { dx = 0, dy = 0, crit = false, damageType } = {}) {
  const key = Object.hasOwn(FINISHERS, id) ? id : "fall", f = FINISHERS[key];
  return {
    id: `animater-finisher-${key}`, name: `Finisher: ${f.label}`, trigger: "manual", color: "#c0392b",
    stages: [
      { stageId: "vanish", kind: "motion", motion: "vanish", subject: "source", duration: f.flight + VANISH_TAIL, assets: [] },
      ...f.stages({ dx, dy, hit: crit ? CRIT_IMPACT_SCALE : 1, type: normalizeDamageType(damageType) }),
    ],
  };
}
