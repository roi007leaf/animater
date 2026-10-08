import { twoeEventElement, dnd5eEventElement } from "./element-choice.mjs";
// Normalize system events without changing rolls, items, HP, or system state.
export const pf2eEvent=(message,userId)=>twoeEvent(message,userId,'pf2e');
export const sf2eEvent=(message,userId)=>twoeEvent(message,userId,'sf2e');
export function twoeEvent(message, userId, systemId='pf2e') {
  const flags=message.flags?.[systemId];
  if (
    (message.author?.id ?? message.user?.id) !== userId ||
    message.blind ||
    message.whisper?.length ||
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
  const item = message.item;
  const options = context?.options ?? [];
  const altUsage = context?.altUsage ?? flags?.strike?.altUsage ?? item?.altUsageType;
  const weaponMode = item?.type === "weapon" ? altUsage === "thrown"
    ? "thrown" : altUsage === "melee" ? "melee"
      : options.includes("item:thrown") || options.includes("item:thrown-melee") || item.isThrown === true || (item.system?.traits?.value?.includes("thrown") || ['bomb','grenade'].includes(item.system?.group)) && item.system?.range ? "thrown"
        : item.isRanged === true || options.includes("item:ranged") || item.system?.range
          ? "ranged" : "melee" : undefined;
  return {
    type,
    systemId,
    id: `chat:${message.id}`,
    item,
    ...(weaponMode ? { weaponMode } : {}),
    itemUuid: flags?.origin?.uuid,
    ...(item?.type === 'spell' ? { castRank: Number(flags?.origin?.castRank ?? item.rank ?? item.system?.location?.heightenedLevel ?? item.system?.level?.value) || undefined } : {}),
    tokenId: message.speaker?.token,
    sceneId: message.speaker?.scene,
    actor: message.actor,
    targetUuid: context?.target?.token ?? flags?.target?.token,
    ...(twoeEventElement(message, systemId) ? { element: twoeEventElement(message, systemId) } : {}),
    outcome: context?.outcome,
  };
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
    // Core 5e does not provide a reliable per-target hit outcome in every roll.
    outcome: null,
    rolls,
  };
}
