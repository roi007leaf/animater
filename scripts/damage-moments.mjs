// Damage moments: a token that takes energy damage flashes in that damage's look,
// and one that drops to 0 HP goes down in it (burned to ash, shattered in ice...).
// The damage type comes from the latest damage roll aimed at that creature.

// Every system's names folded onto one set of looks.
const ALIASES = {
  lightning: "electricity", thunder: "sonic", necrotic: "void", negative: "void", unholy: "void",
  radiant: "vitality", positive: "vitality", holy: "vitality", psychic: "mental",
};
export const normalizeDamageType = (type) => {
  const t = String(type ?? "").trim().toLowerCase();
  return ALIASES[t] ?? t;
};

// hit: a short flash on the token. death: what finishes the collapse. Physical
// damage (bludgeoning, piercing, slashing, bleed) keeps the plain collapse; weapon
// hits already animate on their own.
const LOOKS = {
  fire: { color: "#ff8a3d", hit: ["jb2a.flames.01.orange", "jb2a.impact.003.orange"], death: ["jb2a.flames.04.complete.orange", "jb2a.explosion.01.orange"], after: ["jb2a.smoke.puff.centered.dark_black", "jb2a.smoke.puff.centered.grey"], label: "burns to ash" },
  cold: { color: "#8fd0ff", hit: ["jb2a.impact_themed.ice_shard.blue", "jb2a.impact.003.blue"], death: ["jb2a.ice_spikes.radial.burst.blue", "jb2a.impact.005.blue"], after: ["jb2a.shatter.blue", "jb2a.impact.003.blue"], label: "freezes and shatters" },
  electricity: { color: "#9fd8ff", hit: ["jb2a.static_electricity.01.blue", "jb2a.impact.004.blue"], death: ["jb2a.static_electricity.03.blue", "jb2a.static_electricity.01.blue"], after: ["jb2a.smoke.puff.centered.grey"], label: "is fried by lightning" },
  acid: { color: "#a6e05a", hit: ["jb2a.liquid.splash.bright_green", "jb2a.impact.003.green"], death: ["jb2a.liquid.blob.green", "jb2a.liquid.splash.green"], after: ["jb2a.fumes.04.complete.green", "jb2a.smoke.puff.centered.green"], label: "dissolves in acid" },
  poison: { color: "#9ac885", hit: ["jb2a.impact_themed.poison.greenyellow", "jb2a.impact.003.green"], death: ["jb2a.fumes.toxic.green", "jb2a.smoke.puff.centered.dark_green"], after: [], label: "succumbs to poison" },
  void: { color: "#6b4a8f", hit: ["jb2a.impact.004.dark_purple", "jb2a.impact.003.dark_purple"], death: ["jb2a.toll_the_dead.grey.skull_smoke", "jb2a.smoke.puff.centered.dark_purple"], after: [], label: "withers into shadow" },
  vitality: { color: "#ffe9a3", hit: ["jb2a.sacred_flame.target.yellow", "jb2a.impact.003.yellow"], death: ["jb2a.sacred_flame.target.white", "jb2a.sacred_flame.target.yellow"], after: ["jb2a.particle_burst.01.star.yellow"], label: "is burned away by light" },
  force: { color: "#b58cff", hit: ["jb2a.impact.005.purple", "jb2a.impact.003.pinkpurple"], death: ["jb2a.explosion.04.dark_purple", "jb2a.explosion.01.purple"], after: ["jb2a.smoke.puff.ring.01.white"], label: "is blasted apart" },
  mental: { color: "#b07cff", hit: ["jb2a.particle_burst.01.rune.bluepurple", "jb2a.impact.009.purple"], death: ["jb2a.smoke.puff.centered.dark_purple", "jb2a.impact.009.purple"], after: [], label: "collapses, mind broken" },
  sonic: { color: "#c8d0e0", hit: ["jb2a.soundwave.01.blue", "jb2a.impact.005.white"], death: ["jb2a.soundwave.02.blue", "jb2a.soundwave.01.blue"], after: ["jb2a.ground_cracks.01.white"], label: "is shaken apart" },
  spirit: { color: "#dfe6f2", hit: ["jb2a.impact.005.white", "jb2a.impact.003.yellow"], death: ["jb2a.smoke.puff.ring.01.white", "jb2a.impact.005.white"], after: [], label: "loses its spirit" },
};
export const damageLook = (type) => LOOKS[normalizeDamageType(type)] ?? null;

// The main damage type of a damage roll message, and who it was aimed at.
export function damageFromMessage(message, systemId) {
  const rolls = Array.from(message?.rolls ?? []);
  const pf = message?.flags?.[systemId]?.context, dnd = message?.flags?.dnd5e;
  const isDamage = pf?.type === "damage-roll" || dnd?.roll?.type === "damage" || rolls.some((r) => /DamageRoll/.test(r?.constructor?.name ?? ""));
  if (!isDamage) return null;
  const parts = rolls.flatMap((r) =>
    Array.isArray(r?.instances) && r.instances.length
      ? r.instances.map((i) => ({ type: i.type, total: Number(i.total) || 0 }))
      : [{ type: r?.options?.type ?? r?.options?.types?.[0], total: Number(r?.total) || 0 }]);
  const best = parts.filter((p) => p.type).sort((a, b) => b.total - a.total)[0];
  if (!best) return null;
  const idOf = (uuid, kind) => String(uuid ?? "").match(new RegExp(`${kind}\\.([^.]+)`))?.[1];
  const tokenIds = new Set(), actorIds = new Set();
  if (pf?.target) { const t = idOf(pf.target.token, "Token"), a = idOf(pf.target.actor, "Actor"); if (t) tokenIds.add(t); if (a) actorIds.add(a); }
  for (const target of Array.isArray(dnd?.targets) ? dnd.targets : []) {
    const t = idOf(target?.uuid, "Token"), a = idOf(target?.uuid, "Actor");
    if (t) tokenIds.add(t); if (a) actorIds.add(a);
  }
  return { type: normalizeDamageType(best.type), tokenIds, actorIds };
}

// D&D 5e: the damage parts it is about to apply to this actor (dnd5e.calculateDamage).
export function damageFromParts(parts, actorId) {
  const best = Array.from(parts ?? []).filter((p) => p?.type && Number(p.value) > 0).sort((a, b) => Number(b.value) - Number(a.value))[0];
  return best ? { type: normalizeDamageType(best.type), tokenIds: new Set(), actorIds: new Set([actorId]) } : null;
}
// The damage a creature most likely just took: the newest roll aimed at it, else
// the newest roll aimed at nobody in particular, within the last half minute.
export const DAMAGE_MEMORY_MS = 30000;
export function recallDamage(log, { actorId, tokenId }, now = Date.now()) {
  const fresh = log.filter((d) => now - d.at <= DAMAGE_MEMORY_MS).sort((a, b) => b.at - a.at);
  return fresh.find((d) => d.tokenIds.has(tokenId) || d.actorIds.has(actorId))
    ?? fresh.find((d) => !d.tokenIds.size && !d.actorIds.size) ?? null;
}

// Cast stages play on the source token: here, the creature that took the damage.
const stage = (stageId, assets, extra) => ({ stageId, kind: "cast", assets, ...extra });
// A short flash on the damaged token.
export function hitRecipe(type) {
  const look = damageLook(type);
  if (!look) return null;
  return { id: `animater-hit-${normalizeDamageType(type)}`, name: `Took ${normalizeDamageType(type)} damage`, trigger: "manual", color: look.color, stages: [stage("hit", look.hit, { duration: 1200, scale: 0.9, opacity: 0.9 })] };
}
// The 0 HP collapse, finished in the damage's look (or plain for physical damage).
export function deathRecipe(type, collapse) {
  const look = damageLook(type);
  if (!look) return collapse;
  return {
    ...collapse, id: `animater-death-${normalizeDamageType(type)}`, name: `Dropped to 0 HP: ${look.label}`, color: look.color,
    stages: [...collapse.stages,
      stage("death", look.death, { delay: 150, duration: 2000, scale: 1.2 }),
      ...(look.after.length ? [stage("after", look.after, { delay: 1400, duration: 1800, scale: 1, opacity: 0.85 })] : [])],
  };
}
