export const AA_ID = 'autoanimations';
export const AA_TAKEOVER = 'aaTakeover';
// Customized AA entries belong to AA; animater leaves those items alone.
const customized = flags => Boolean(flags && !flags.killAnim && flags.isEnabled !== false && flags.isCustomized === true);
export const aaCustomized = (item, activity) => customized(item?.flags?.autoanimations) || customized(activity?.flags?.autoanimations);
export function aaEvent(data, { systemId, userId, twoe } = {}) {
  const item = data?.item;
  if (!item) return null;
  const message = data.workflow?.documentName === 'ChatMessage' ? data.workflow : null;
  const token = data.token?.object ?? data.token;
  const base = {
    systemId, item, actor: data.actor ?? item.actor, activity: data.activity, activityId: data.activity?.id,
    source: token ?? undefined, tokenId: token?.id, targets: Array.from(data.targets ?? []),
    ...(data.spellLevel ? { spellLevel: data.spellLevel } : {}),
  };
  if (data.templateData) return { ...base, type: 'template', id: `area:${data.templateData.uuid}`, template: data.templateData, sceneId: data.templateData.parent?.id };
  if (data.activeEffect) return { ...base, type: 'effect' };
  if (message && twoe) {
    const event = twoe(message, message.author?.id ?? userId, systemId);
    return event ? { ...base, ...event, item: event.item ?? item } : null;
  }
  const type = data.rollAttackHook ? 'attack' : data.rollDamageHook ? 'damage' : 'use';
  return { ...base, type };
}
// Synchronous on purpose: AA reads stopWorkflow right after its deferrals.
export function registerAATakeover({ hooks = globalThis.Hooks, enabled, resolve, context }) {
  return hooks?.on?.('AutomatedAnimations-WorkflowStart', data => {
    if (!data || data.stopWorkflow || !enabled()) return;
    try {
      const event = aaEvent(data, context());
      if (event && resolve(event)) data.stopWorkflow = true;
    } catch (error) {
      console.warn('Animater: Automated Animations takeover', error);
    }
  });
}
