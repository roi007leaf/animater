import { dnd5eAttackOutcome } from './outcome.mjs';
import { twoeEventElement, dnd5eEventElement } from "./element-choice.mjs";
// Normalize system events without changing rolls, items, HP, or system state.
export const pf2eEvent=(message,userId)=>twoeEvent(message,userId,'pf2e');
export const sf2eEvent=(message,userId)=>twoeEvent(message,userId,'sf2e');
export function twoeEvent(message, userId, systemId='pf2e') {
  const flags=message.flags?.[systemId], author=message.author ?? message.user;
  // A GM's private roll (Private GM Roll mode, secret NPC rolls) still happens on the table: it animates
  // for everyone, without the outcome that would give the hidden result away. Blind rolls and a
  // player's own private rolls stay hidden.
  const gmPrivate = Boolean(message.whisper?.length) && author?.isGM === true && !message.blind;
  if (
    author?.id !== userId ||
    message.blind ||
    (message.whisper?.length && !gmPrivate) ||
    flags?.context?.isReroll
  )
    return null;
  const context = flags?.context;
  if (
    [
      "damage-taken",
      "saving-throw",
      "skill-check",
      "perception-check",
      "flat-check",
    ].includes(context?.type)
  )
    return null;
  const type = context?.type?.includes("attack")
    ? "attack"
    : message.isDamageRoll
      ? "damage"
      : !message.isRoll
        ? "use"
        : null;
  if (!type || (!message.item && !flags?.origin?.uuid))
    return null;
  const item = message.item ?? originSpell(message.actor, flags?.origin);
  const options = context?.options ?? [];
  // Enabled damage dice/modifiers identify riders such as Sneak Attack (flags.<system>.dice/.modifiers).
  const live = rows => (Array.isArray(rows) ? rows : []).filter(r => r?.slug && r.enabled !== false && r.ignored !== true);
  const damageSlugs = type === "damage" ? [...live(flags?.dice).map(d => `dice:${d.slug}`), ...live(flags?.modifiers).map(m => `modifier:${m.slug}`)] : [];
  const altUsage = context?.altUsage ?? flags?.strike?.altUsage ?? item?.altUsageType;
  const weaponMode = ['weapon', 'melee'].includes(item?.type ?? flags?.origin?.type) ? altUsage === "thrown"
    ? "thrown" : altUsage === "melee" ? "melee"
      : options.includes("item:thrown") || options.includes("item:thrown-melee") ? "thrown"
        : options.includes('item:melee') ? 'melee'
          : item?.isThrown === true || (item?.system?.traits?.value?.includes("thrown") || ['bomb','grenade'].includes(item?.system?.group)) && item?.system?.range ? "thrown"
        : item?.isRanged === true || options.includes("item:ranged") || item?.system?.range
          ? "ranged" : "melee"
    // An action rolled as a Strike says which (PF2e's Elemental Blast: self:action:melee / item:ranged…).
    : item?.type === "action" ? options.includes("self:action:melee") || options.includes("item:melee") ? "melee"
      : options.includes("self:action:ranged") || options.includes("item:ranged") ? "ranged" : undefined
    : undefined;
  return {
    type,
    systemId,
    id: `chat:${message.id}`,
    messageId: message.id,
    item,
    ...(weaponMode ? { weaponMode } : {}),
    ...(damageSlugs.length ? { damageSlugs } : {}),
    itemUuid: flags?.origin?.uuid,
    ...(item?.type === 'spell' ? { castRank: Number(flags?.origin?.castRank ?? item.rank ?? item.system?.location?.heightenedLevel ?? item.system?.level?.value) || undefined } : {}),
    tokenId: message.speaker?.token,
    sceneId: message.speaker?.scene,
    actor: message.actor,
    targetUuid: context?.target?.token ?? flags?.target?.token,
    ...(twoeEventElement(message, systemId) ? { element: twoeEventElement(message, systemId) } : {}),
    outcome: gmPrivate ? undefined : context?.outcome,
    ...(gmPrivate ? { private: true } : {}),
  };
}
// A spell cast from a staff (PF2e Dailies), wand or scroll is no item on the actor, and its attack and
// damage messages carry no embedded spell, so message.item is null. Find it in the actor's spellcasting
// collections or a consumable's embedded spell by id, else stand in from the origin's roll options.
function originSpell(actor, origin) {
  if (origin?.type !== "spell") return null;
  const id = /Item\.([^.]+)$/.exec(String(origin.uuid ?? ""))?.[1];
  const tryGet = (fn) => { try { return fn() ?? null; } catch { return null; } };
  if (id) {
    for (const collection of tryGet(() => actor?.spellcasting?.collections?.values()) ?? []) {
      const spell = tryGet(() => collection?.get?.(id));
      if (spell?.type === "spell") return spell;
    }
    for (const item of tryGet(() => Array.from(actor?.items ?? [])) ?? []) {
      if (item?.type !== "consumable") continue;
      const spell = tryGet(() => item.embeddedSpell);
      if (spell?.id === id) return spell;
    }
  }
  const options = (Array.isArray(origin.rollOptions) ? origin.rollOptions : []).map(String);
  const slug = options.find((o) => o.startsWith("origin:item:slug:"))?.slice(17);
  if (!slug) return null;
  const name = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const traits = options.filter((o) => o.startsWith("origin:item:trait:")).map((o) => o.slice(18));
  return { type: "spell", name, slug, rank: Number(origin.castRank) || undefined, system: { slug, traits: { value: traits } }, actor };
}
export function dnd5eEvent(type, subject, { rolls = [], results = {} } = {}) {
  const message=results.message??rolls.find(r=>r.parent?.system?.targets)?.parent??rolls[0]?.parent;
  if (
    !subject?.item ||
    message?.blind || message?.data?.blind ||
    message?.whisper?.length || message?.data?.whisper?.length ||
    rolls.some(
      (r) => r.options?.rollMode && r.options.rollMode !== "publicroll",
    )
  )
    return null;
  return {
    type,
    systemId: 'dnd5e',
    id: message?.id ? `activity:${message.id}:${type}` : null,
    messageId: message?.id,
    item: subject.item,
    actor: subject.actor ?? subject.item.actor,
    activityId: subject.id ?? subject._id,
    activity: subject,
    activityName: subject.name,
    ...(dnd5eEventElement(subject, rolls) ? { element: dnd5eEventElement(subject, rolls) } : {}),
    tokenId: subject.getUsageToken?.()?.id,
    sceneId: subject.getUsageToken?.()?.parent?.id,
    targetUuids: Array.from(message?.system?.targets ?? message?.data?.system?.targets ?? rolls[0]?.options?.targets ?? []).map(t=>typeof t==='string'?t:t.token).filter(Boolean),
    ...(subject.item.type==='weapon'?{weaponMode:String(rolls[0]?.options?.attackMode??'').startsWith('thrown')?'thrown':rolls[0]?.options?.attackMode==='ranged'||subject.attack?.type?.value==='ranged'?'ranged':'melee'}:{}),
    spellLevel: subject.item.type==='spell' ? Number(message?.system?.level??message?.data?.system?.level??subject.getRollData?.()?.item?.level??rolls[0]?.data?.item?.level??subject.item.getRollData?.()?.item?.level??subject.item.system?.level) : undefined,
    // Attack rolls: natural 20/1, or the total against a single target's AC.
    outcome: type === "attack" ? dnd5eAttackOutcome(rolls, Array.from(message?.system?.targets ?? [])) : null,
    rolls,
  };
}
