export const AA_ID = 'autoanimations';
export const AA_TAKEOVER = 'aaTakeover';
export const AA_FILL_GAPS = 'aaFillGaps';
// Customized AA entries belong to AA; animater leaves those items alone.
const customized = flags => Boolean(flags && !flags.killAnim && flags.isEnabled !== false && flags.isCustomized === true);
export const aaCustomized = (item, activity) => customized(item?.flags?.autoanimations) || customized(activity?.flags?.autoanimations);
// Would AA animate this event? Mirrors AA's handleItem: an item or activity turned off in AA plays
// nothing there, a customized one is AA's, else its Automatic Recognition menus decide (areas from
// the template menu, effects from the active effect menu). Unreadable AA settings never block.
const rinse = name => String(name ?? '').replace(/\s+/g, '').toLowerCase();
const width = entry => rinse(entry.label).length;
function menuSearch(entries, name) {
  const sorted = (Array.isArray(entries) ? entries : []).filter(e => e?.label).sort((a, b) => width(b) - width(a)), rinsed = rinse(name);
  return sorted.find(e => e.advanced?.exactMatch && e.label === name) ?? sorted.find(e => !e.advanced?.exactMatch && rinsed.includes(rinse(e.label))
    && !(e.advanced?.excludedTerms ?? []).some(term => rinsed.includes(rinse(term)))) ?? null;
}
const MENUS = ['melee', 'range', 'ontoken', 'templatefx', 'aura', 'preset'];
export function aaAnimates(event, setting) {
  const item = event?.item;
  if (!item) return false;
  try {
    const off = flags => Boolean(flags?.killAnim) || flags?.isEnabled === false;
    const own = item.flags?.autoanimations, activity = event.activity?.flags?.autoanimations, name = item.name ?? item.label;
    if (off(own) || (event.type !== 'effect' && off(activity))) return false;
    if (own?.isCustomized === true || (event.type !== 'effect' && activity?.isCustomized === true)) return true;
    if (setting('disableAutoRec')) return false;
    const menu = key => setting(`aaAutorec-${key}`) ?? [];
    if (event.type === 'effect') return Boolean(menuSearch(menu('aefx'), name));
    const found = menuSearch(MENUS.flatMap(menu), name);
    if (found && event.type === 'template' && ['melee', 'range', 'ontoken'].includes(found.menu)) return Boolean(menuSearch(menu('templatefx'), name));
    return Boolean(found);
  } catch {
    return false;
  }
}
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
    return event && !event.skipped ? { ...base, ...event, item: event.item ?? item } : null;
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
