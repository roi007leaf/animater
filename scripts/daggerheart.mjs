// Daggerheart adapter (the Foundryborne `daggerheart` system): pure functions that turn its chat
// messages and action hooks into Animater events and damage-log entries. Shapes verified against
// daggerheart 2.10.12 (build/daggerheart.js): roll messages are type "dualityRoll" (players) or
// "adversaryRoll" (adversaries); their system is DHActorRoll (source { actor uuid, item id, action },
// targets [{ id: token id, actorId: actor uuid, difficulty, evasion }], damage { main, resources }),
// and system.roll / item / action / actionActor are getters. The roll's own options.roll.type is
// "action" or "reaction" (D20Roll.buildEvaluate overwrites it with the actionType), so the attack or
// spellcast type is read from system.action.roll.type (CONFIG.DH.GENERAL.rollTypes). A hit is the system's own rule
// (DHActorRoll._getCurrentTargets): a critical, or the total reaching difficulty || evasion.
// Every read is optional-chained: a shape that moves in a later version skips the event
// ({ skipped } for the caller to trace) and never throws.
export const DAGGERHEART_VERIFIED = "2.10.12";
export const DH_ROLL_TYPES = new Set(["attack", "spellcast"]);
export const DH_MESSAGE_TYPES = new Set(["dualityRoll", "adversaryRoll"]);
// Weapon and action ranges (CONFIG.DH.GENERAL.range ids) that strike in melee.
export const MELEE_RANGES = new Set(["melee", "veryClose"]);
// The domains of 2.10.11's domain cards (the spec's nine, plus Dread).
export const DH_DOMAINS = Object.freeze(["arcana", "blade", "bone", "codex", "dread", "grace", "midnight", "sage", "splendor", "valor"]);
// Foundry v14 message modes (and their legacy roll-mode names) that hide a roll from the table.
const PRIVATE_MODES = new Set(["gm", "blind", "self", "gmroll", "blindroll", "selfroll"]);

export function versionBelow(version, floor = DAGGERHEART_VERIFIED) {
  const parts = (v) => String(v ?? "").split(".").map((n) => Number.parseInt(n, 10) || 0);
  const a = parts(version), b = parts(floor);
  for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) < (b[i] ?? 0);
  return false;
}

const list = (value) => (Array.isArray(value) ? value : value instanceof Set ? [...value] : []);
const authorOf = (message) => message?.author?.id ?? message?.user?.id;
const isPrivate = (message) => Boolean(message?.blind) || Array.from(message?.whisper ?? []).length > 0;
// A D20 or Duality roll only: a direct-damage message's rolls[0] is a DamageRoll.
const isD20Roll = (r) => Boolean(r?.dHope || r?.d20 || /Duality|D20/.test(r?.constructor?.name ?? ""));
const rollOf = (message) => message?.system?.roll ?? Array.from(message?.rolls ?? []).find(isD20Roll) ?? null;
// options.roll.type is "action" / "reaction" on a real roll: the action's own type comes first.
const rollTypeOf = (message) => {
  const fromAction = message?.system?.action?.roll?.type;
  if (DH_ROLL_TYPES.has(fromAction)) return fromAction;
  const fromRoll = rollOf(message)?.options?.roll?.type;
  return DH_ROLL_TYPES.has(fromRoll) ? fromRoll : fromAction ?? null;
};
const tokenUuids = (ids, sceneId) => (sceneId ? ids.map((id) => `Scene.${sceneId}.Token.${id}`) : []);
const actorIdOf = (uuid) => String(uuid ?? "").match(/Actor\.([^.]+)/)?.[1] ?? null;
export const domainOf = (item) => String(item?.system?.domain ?? "").toLowerCase() || null;

// The item, action and acting actor behind a roll message. An adversary's standard attack has no
// Item (its action lives on the actor): it is named by its action.
function sourceOf(message) {
  const system = message?.system;
  const item = system?.item ?? null, action = system?.action ?? null;
  const actor = system?.actionActor ?? item?.actor ?? message?.speakerActor ?? null;
  return { item, action, actor, name: item?.name ?? action?.name ?? null };
}

export function dhDamageKind(types) {
  const values = (Array.isArray(types) ? types : types instanceof Set ? [...types] : types ? [types] : []).map(String);
  return values.includes("magical") ? "magical" : values.includes("physical") ? "physical" : null;
}

// Strike families by weapon name (Daggerheart has no weapon groups). First match wins, so a Rune
// Shield is a shield, a Gunblade a firearm and a Hand Crossbow a bow.
const FAMILIES = [
  ["shield", /shield|buckler/i],
  ["firearm", /gun|pistol|rifle|revolver|musket|arquebus|blunderbuss|cannon|serpentine/i],
  ["bow", /bow|arbalest|sling/i],
  ["spear", /spear|\blance\b|halberd|\bpike\b|polearm|javelin|\bdarts?\b|needle|trident|glaive|corbin/i],
  ["hammer", /hammer|mace|maul|flail|club|baton|knuckle|shillelagh|\bpick\b|gauntlet/i],
  ["blade", /blade|sword|dagger|knife|knives|axe|hatchet|labrys|katana|rapier|scimitar|cutlass|falchion|saber|scythe|razor|scalpel|anlace|estoc|edge|claw|talon|chakram|zweih|\bfan\b|\bstar\b/i],
  ["magic", /staff|wand|\borb\b|\btome\b|runes?\b|scepter|\brings?\b|\bgem\b|shard|focus|pendant|bangle|\blute\b/i],
];
export function weaponFamily(name, damageTypes = []) {
  const text = String(name ?? "");
  for (const [family, pattern] of FAMILIES) if (pattern.test(text)) return family;
  return dhDamageKind(damageTypes) === "magical" ? "magic" : null;
}

// The killing blow's damage type in Animater's names (damage reactions, "By damage type" finishers):
// physical by the weapon family, magical by the card's domain. Unknown physical is slashing
// (Carved), unknown or no domain is force (Blown apart).
const PHYSICAL_TYPES = { blade: "slashing", bow: "piercing", spear: "piercing", firearm: "piercing", hammer: "bludgeoning", shield: "bludgeoning" };
const MAGICAL_TYPES = { arcana: "force", midnight: "void", dread: "void", splendor: "vitality", grace: "vitality", sage: "poison", codex: "mental", bone: "bleed", blade: "slashing", valor: "slashing" };
export function daggerheartDamageType({ type, item = null, itemName = null } = {}) {
  const kind = dhDamageKind(type);
  if (kind === "physical") return PHYSICAL_TYPES[weaponFamily(item?.name ?? itemName)] ?? "slashing";
  if (kind === "magical") return MAGICAL_TYPES[domainOf(item)] ?? "force";
  return null;
}

export function rollIsCritical(roll) {
  if (!roll) return false;
  if (roll?.isCritical === true || roll?.options?.roll?.isCritical === true || roll?.options?.roll?.result?.duality === 0) return true;
  const hope = roll?.dHope?.total, fear = roll?.dFear?.total;
  return Number.isFinite(hope) && hope === fear;
}

export function dualityOf(roll) {
  if (!roll) return null;
  if (rollIsCritical(roll)) return "critical";
  if (roll?.withHope === true) return "hope";
  if (roll?.withFear === true) return "fear";
  const coded = roll?.options?.roll?.result?.duality;
  if (coded === 1) return "hope";
  if (coded === -1) return "fear";
  const hope = roll?.dHope?.total, fear = roll?.dFear?.total;
  return Number.isFinite(hope) && Number.isFinite(fear) ? (hope > fear ? "hope" : "fear") : null;
}

// One outcome per target, by the system's own hit rule.
export function targetOutcomes(system, roll) {
  const crit = rollIsCritical(roll), total = Number(roll?.total);
  return list(system?.targets).filter((t) => t?.id).map((t) => {
    const toHit = t?.difficulty || t?.evasion;
    const hit = typeof t?.hitResult?.success === "boolean" ? t.hitResult.success : toHit === null || !roll ? false : crit || total >= toHit;
    return { id: t.id, actorUuid: t?.actorId ?? null, outcome: hit ? (crit ? "criticalSuccess" : "success") : "failure" };
  });
}
const RANK = { criticalSuccess: 3, success: 2, failure: 1 };
export const bestOutcome = (outcomes) => list(outcomes).reduce((best, o) => ((RANK[o?.outcome] ?? 0) > (RANK[best] ?? 0) ? o.outcome : best), null);

function weaponModeOf(item, action) {
  if (item && item?.type !== "weapon") return {};
  const range = item ? item?.system?.attack?.range : action?.range;
  return range ? { weaponMode: MELEE_RANGES.has(range) ? "melee" : "ranged" } : {};
}
const cardFields = (item) => (item?.type === "domainCard" ? { domain: domainOf(item), cardLevel: Number(item?.system?.level) || undefined } : {});
const named = (item, name) => (item ? {} : { itemName: name, activityName: name });

export function daggerheartAttackKind(message) {
  const { item, action } = sourceOf(message);
  if (rollTypeOf(message) === "spellcast") return "spell";
  const range = item?.type === "weapon" ? item?.system?.attack?.range : !item ? action?.range : null;
  if (range) return MELEE_RANGES.has(range) ? "melee" : "ranged";
  return "other";
}

// An attack or spellcast roll message by this user: one event, outcome per target.
export function daggerheartRollEvent(message, userId, { sceneId = null } = {}) {
  if (!DH_MESSAGE_TYPES.has(message?.type)) return null;
  if (authorOf(message) !== userId || isPrivate(message)) return null;
  const rollType = rollTypeOf(message);
  if (!DH_ROLL_TYPES.has(rollType)) return null;
  const roll = rollOf(message), { item, action, actor, name } = sourceOf(message);
  if (!name) return { skipped: `${message?.system?.title || "Daggerheart roll"}: its item or action could not be found.` };
  if (!roll) return { skipped: `${name}: its roll could not be read.` };
  const scene = message?.speaker?.scene ?? sceneId, outcomes = targetOutcomes(message?.system, roll);
  return {
    type: "attack", systemId: "daggerheart", id: `chat:${message?.id}`, messageId: message?.id,
    item, itemUuid: item?.uuid, ...named(item, name), actor,
    tokenId: message?.speaker?.token, sceneId: scene,
    targetUuids: tokenUuids(outcomes.map((o) => o.id), scene),
    ...(outcomes.length ? { targetOutcomes: Object.fromEntries(outcomes.map((o) => [o.id, o.outcome])) } : {}),
    outcome: outcomes.length ? bestOutcome(outcomes) : rollIsCritical(roll) ? "criticalSuccess" : null,
    rollType, duality: message?.type === "dualityRoll" ? dualityOf(roll) : null,
    ...weaponModeOf(item, action), ...cardFields(item),
  };
}

// daggerheart.postUseAction: an action used without an attack or spellcast roll (a buff, a heal, a
// feature). A rolled one is skipped: its roll message is the event, so it never plays twice.
export function daggerheartUseEvent(action, config, { sceneId = null, tokenId = null } = {}) {
  if (!action || (config?.hasRoll && DH_ROLL_TYPES.has(action?.roll?.type))) return null;
  if (PRIVATE_MODES.has(config?.selectedMessageMode)) return null;
  const item = action?.item?.documentName === "Item" ? action.item : null;
  const actor = action?.actor ?? item?.actor ?? null, name = item?.name ?? action?.name ?? null;
  if (!name) return { skipped: "Daggerheart action: its item could not be found." };
  const ids = list(config?.targets).map((t) => t?.id).filter(Boolean);
  return {
    type: "use", systemId: "daggerheart", ...(config?.message?.id ? { id: `use:${config.message.id}` } : {}),
    item, itemUuid: item?.uuid, ...named(item, name), actor, sceneId,
    tokenId: tokenId ?? config?.message?.speaker?.token ?? config?.speaker?.token,
    targetUuids: tokenUuids(ids, sceneId), outcome: null, rollType: action?.roll?.type ?? null, duality: null,
    ...weaponModeOf(item, action), ...cardFields(item),
  };
}

// system.damage.main: a DamageRoll on a live message, its JSON in raw source data.
function damageMain(system) {
  const main = system?.damage?.main;
  if (typeof main !== "string") return main ?? null;
  try { return JSON.parse(main); } catch { return null; }
}
function damageKindOf(message) {
  const main = damageMain(message?.system), { item, action } = sourceOf(message);
  if (!main) return null;
  const rolled = list(main?.options?.damageTypes);
  if (rolled.length) return dhDamageKind(rolled);
  // action.damage.main.type is a SetField: a Set.
  return dhDamageKind(action?.damage?.main?.type) ?? dhDamageKind(item?.system?.attack?.damage?.main?.type);
}
function damageCrit(message) {
  const flag = damageMain(message?.system)?.options?.isCritical;
  return flag === true || (flag !== false && rollIsCritical(rollOf(message)));
}
// The targets the damage reached: the hit ones when the card rolled, all of them for direct damage.
function damagedTargets(message) {
  const all = targetOutcomes(message?.system, rollOf(message));
  return { all, hit: message?.system?.hasRoll ? all.filter((o) => o.outcome !== "failure") : all };
}

// The damage-log entry damageFromMessage answers for a Daggerheart message (see damage-moments.mjs).
export function daggerheartDamage(message) {
  const system = message?.system;
  if (!damageMain(system) || system?.hasHealing) return null;
  const kind = damageKindOf(message), { item, action, actor, name } = sourceOf(message), { hit } = damagedTargets(message);
  return {
    type: daggerheartDamageType({ type: kind, item, itemName: name }), dhType: kind,
    tokenIds: new Set(hit.map((o) => o.id)), actorIds: new Set(hit.map((o) => actorIdOf(o.actorUuid)).filter(Boolean)),
    sourceTokenId: message?.speaker?.token ?? null, attackKind: daggerheartAttackKind(message), crit: damageCrit(message),
    itemUuid: item?.uuid ?? null, itemName: name, itemSlug: null,
    actorUuid: system?.source?.actor ?? actor?.uuid ?? null, synthetic: !item && Boolean(name),
    itemKind: item?.type ?? (action ? "action" : null), domain: domainOf(item), weaponFamily: weaponFamily(item?.name ?? name, kind ? [kind] : []),
  };
}

// A damage (or healing) roll by this user: created with its own message, or written onto the
// attack/spellcast card it was rolled from.
export function daggerheartDamageEvent(message, userId, { sceneId = null } = {}) {
  const system = message?.system;
  if (!damageMain(system) && !Object.keys(system?.damage?.resources ?? {}).length) return null;
  if (authorOf(message) !== userId || isPrivate(message)) return null;
  const { item, action, actor, name } = sourceOf(message);
  // Resource-only damage (stress, fear...) has no hit-point type: nothing to play.
  if (!system?.hasHealing && !damageKindOf(message)) return null;
  if (!name) return { skipped: `${system?.title || "Daggerheart damage"}: its item or action could not be found.` };
  const { all, hit } = damagedTargets(message);
  if (all.length && !hit.length) return null;
  const scene = message?.speaker?.scene ?? sceneId;
  return {
    type: "damage", systemId: "daggerheart", id: `damage:${message?.id}`, messageId: message?.id,
    item, itemUuid: item?.uuid, ...named(item, name), actor,
    tokenId: message?.speaker?.token, sceneId: scene, targetUuids: tokenUuids(hit.map((o) => o.id), scene),
    damageType: damageKindOf(message), healing: Boolean(system?.hasHealing), crit: damageCrit(message),
    ...weaponModeOf(item, action), ...cardFields(item),
  };
}
