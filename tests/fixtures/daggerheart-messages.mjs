// Daggerheart 2.10.11 shapes as live documents expose them to hooks: a dualityRoll / adversaryRoll
// ChatMessage whose system is DHActorRoll (system.roll, .item, .action and .actionActor are getters
// there, plain values here), the DualityRoll / D20Roll it carries, the DamageRoll written to
// system.damage.main, and the (action, config) pair of the daggerheart.postUseAction hook.
const slug = (name) => String(name).replace(/\W/g, "");
export const hero = { id: "hero", uuid: "Actor.hero", documentName: "Actor", name: "Hero", type: "character" };
export const orc = { id: "orc", uuid: "Actor.orc", documentName: "Actor", name: "Orc", type: "adversary" };
export const weapon = (name, range = "melee", types = ["physical"]) => ({ id: `w${slug(name)}`, uuid: `Actor.hero.Item.w${slug(name)}`, documentName: "Item", type: "weapon", name, actor: hero,
  system: { attack: { range, damage: { main: { type: new Set(types) } } } } });
export const card = (name, domain, { level = 1, cardType = "spell" } = {}) => ({ id: `c${slug(name)}`, uuid: `Actor.hero.Item.c${slug(name)}`, documentName: "Item", type: "domainCard", name, actor: hero,
  system: { domain, level, type: cardType } });
export function dualityRoll({ hope = 8, fear = 5, modifier = 2, type = "attack" } = {}) {
  const critical = hope === fear;
  return { total: hope + fear + modifier, isCritical: critical, withHope: !critical && hope > fear, withFear: !critical && hope < fear,
    dHope: { total: hope }, dFear: { total: fear }, actionType: type, options: { roll: { type: "action" } } };
}
export function adversaryRoll({ d20 = 12, modifier = 3, type = "attack", criticalThreshold = 20 } = {}) {
  return { total: d20 + modifier, isCritical: d20 >= criticalThreshold, d20: { total: d20 }, actionType: type, options: { roll: { type: "action" } } };
}
// isCritical is only set when given: unset, the card's own roll decides (ChatDamageData._prepareRolls).
export const damageRoll = ({ types = ["physical"], total = 9, critical } = {}) => ({ total, options: { damageTypes: types, ...(critical === undefined ? {} : { isCritical: critical }) } });
export const target = (id = "target", { evasion = 10, difficulty = null, actorId = `Actor.${id}` } = {}) => ({ id, actorId, name: id, difficulty, evasion });
export function rollMessage({ id = "roll1", type = "dualityRoll", roll = dualityRoll(), item = null, action, actor = hero,
  targets = [target()], author = "u", speaker = { scene: "s", token: "t" }, whisper = [], blind = false, damage = null, hasRoll = true, hasHealing = false } = {}) {
  action = action === undefined ? { name: "Attack", roll: { type: roll?.actionType ?? "attack" } } : action;
  return { id, type, author: { id: author }, speaker, whisper, blind, rolls: roll ? [roll] : [],
    system: { title: item?.name ?? action?.name ?? "Roll", roll, item, action, actionActor: actor,
      source: { actor: actor?.uuid ?? null, item: item?.id ?? actor?.id ?? null, action: "act" },
      targets, hasRoll, hasDamage: Boolean(damage), hasHealing, damage: { main: damage, resources: {} } } };
}
// daggerheart.postUseAction(action, config): an Item's action has action.item = the Item; an
// adversary's or companion's standard attack has action.item = the Actor itself.
export const useHook = ({ action = { name: "Gain 3 Hope", roll: { type: null } }, item = null, actor = hero, config = {} } = {}) =>
  [{ ...action, item: item ?? actor, actor }, { hasRoll: false, targets: [], selectedMessageMode: "public", ...config }];
