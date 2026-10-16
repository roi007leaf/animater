// Adversary data from the daggerheart 2.10.12 `adversaries` pack (read offline with classic-level, as
// tools/build-daggerheart.mjs readLevelDb does), trimmed to what Animater reads: the Young Ice
// Dragon's standard attack and features, and features of other adversaries that roll to attack.
// Damage types are Sets, as SetField gives them on a live action.
const action = ({ damage = null, resources = [], ...a }) => ({ areas: [], ...a, damage: { main: damage ? { type: new Set(damage) } : null, resources: Object.fromEntries(resources.map((r) => [r, { applyTo: r }])) } });
const feature = (actor, id, name, description, actions) => ({ id, uuid: `${actor.uuid}.Item.${id}`, documentName: "Item", type: "feature", name, actor,
  system: { description, actions: new Map(actions.map((a) => [a._id, a])) } });

export const iceDragon = { id: "UGPiPLJsPvMTSKEF", uuid: "Actor.UGPiPLJsPvMTSKEF", documentName: "Actor", name: "Young Ice Dragon", type: "adversary" };
iceDragon.system = { attack: action({ _id: "lxXAo7dnBRVu6AwZ", type: "attack", name: "Bite and Claws", range: "close", roll: { type: "attack" }, save: { trait: null }, damage: ["physical"] }) };
iceDragon.features = Object.fromEntries([
  feature(iceDragon, "lsHoXHZ452axhyEr", "Relentless (3)", "<p>The @Lookup[@name] can be spotlighted up to three times per GM turn. Spend Fear as usual to spotlight them.</p>",
    [action({ _id: "cmZsrUJa9FJ8gZKP", type: "effect", name: "Spotlight: Relentless", range: "" })]),
  feature(iceDragon, "UHptE40G4tLBvKTN", "Rend and Crush", "<p>If a target damaged by the @Lookup[@name] doesn't mark an Armor Slot to reduce the damage, they must mark a Stress.</p>",
    [action({ _id: "dHoMdLfAl6UKjXRP", type: "damage", name: "Mark Stress", range: "", resources: ["stress"] })]),
  feature(iceDragon, "QV2ytK4b1VWF71OS", "Blizzard Breath", "<p><strong>Spend 2 Fear</strong> to release an icy whorl in front of the @Lookup[@name] within Close range. All targets in this area must make an Agility Reaction Roll. Targets who fail take <strong>4d6+5</strong> magic damage and are Restrained by ice until they break free with a successful Strength Roll. Targets who succeed must mark 2 Stress or take half damage.</p>",
    [action({ _id: "CBecTlgyUBFxgoi5", type: "attack", name: "Roll Save", range: "close", roll: { type: null }, save: { trait: "agility" }, areas: [{ shape: "inFront", size: "close" }], damage: ["magical"] })]),
  feature(iceDragon, "CcRTxCDCJskiu3fI", "Avalanche", "<p><strong>Spend a Fear</strong> to have the @Lookup[@name] unleash a huge downfall of snow and ice, covering all other creatures within Far range. All targets within this area must succeed on an Instinct Reaction Roll or be buried in snow and rocks, becoming <em>Vulnerable</em> until they dig themselves out from the debris. For each PC that fails the reaction roll, you gain a Fear.</p>",
    [action({ _id: "G9LjoXShkCcgx8EC", type: "attack", name: "Attack", range: "far", roll: { type: null }, save: { trait: "instinct" }, areas: [{ shape: "emanation", size: "far" }] })]),
  feature(iceDragon, "nXZHOfcYvjg3YMNU", "Frozen Scales", "<p>When a creature makes a successful attack against the @Lookup[@name] from within Very Close range, they must mark a Stress and become Chilled until their next rest or they clear a Stress. While they are Chilled, they have disadvantage on attack rolls.</p>",
    [action({ _id: "QZMpj1qEWI6Er7q2", type: "damage", name: "Damage", range: "", resources: ["stress"] })]),
  feature(iceDragon, "QHdJgT2fvwqquyf7", "Momentum", "<p>When the @Lookup[@name] makes a successful attack against a PC, you gain a Fear.</p>",
    [action({ _id: "5V5SDnUBg9dQOkLW", type: "healing", name: "Gain Fear", range: "", roll: { type: null }, resources: ["fear"] })]),
].map((f) => [f.name, f]));

const adversary = (id, name) => ({ id, uuid: `Actor.${id}`, documentName: "Actor", name, type: "adversary" });
export const rolledFeatures = {
  "Tail Swipe": feature(adversary("mitera", "Dragon Mother Mitera"), "OCDeXZ8K5EbT8ywA", "Tail Swipe", "",
    [action({ _id: "aZSQVMaQiOkrLPHB", type: "attack", name: "Spend Fear", range: "", roll: { type: "attack" }, areas: [{ shape: "emanation", size: "close" }], damage: ["physical"] })]),
  "Dive-Bomb": feature(adversary("obsidian", "Volcanic Dragon: Obsidian Predator"), "5wLxyaWJuUhkx1EX", "Dive-Bomb", "",
    [action({ _id: "OpAT9nxlbgvnhdBg", type: "attack", name: "Attack", range: "far", roll: { type: "attack" }, areas: [{ shape: "emanation", size: "veryClose" }], damage: ["physical"], resources: ["stress", "hope"] })]),
  "Leaping Strike": feature(adversary("knight", "Dragon Knight"), "qDQbsNq0Rq4OcXoI", "Leaping Strike", "",
    [action({ _id: "fdN6EmdKTopL54yz", type: "attack", name: "Mark Stress", range: "far", roll: { type: "attack" }, damage: ["physical"], resources: ["armor"] })]),
};
export const firstAction = (item) => [...item.system.actions.values()][0];
