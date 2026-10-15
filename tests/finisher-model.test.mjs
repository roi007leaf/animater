import test from "node:test";
import assert from "node:assert/strict";
import { validateRecipe, normalizeFinisher } from "../scripts/model.mjs";
import { matchFinishers, killFinisher, passesSuccess, usePasses, finisherMoment, checkFinisherEvent, linkFinisher, linkedFinisher, mayDisplace, finisherTravelPath, finisherChipText, addFinisherName, removeFinisherName, linkFinisherItem, unlinkFinisherItem, finisherItemLink, finisherAvailableTo, playerFinisherChoices, pickedFinisher, finisherFires, createFinishedMemory } from "../scripts/finisher-model.mjs";

const fin = (id, match, finisher = {}, extra = {}) => ({ id, name: id, trigger: "manual", match, finisher: normalizeFinisher(finisher), stages: [{ kind: "motion", motion: "shake", assets: [] }], ...extra });

test("the finisher block is normalized, kept, and makes the recipe a manual Finisher", () => {
  assert.deepEqual(normalizeFinisher({}), { on: "kill", mover: "targets", knockback: 0, ending: "body", success: "success", wall: "fit", players: [] });
  assert.deepEqual(normalizeFinisher({ on: "use", mover: "source", knockback: 9, ending: "vanish", success: "critical", wall: "slam" }), { on: "use", mover: "source", knockback: 6, ending: "vanish", success: "critical", wall: "slam", players: [] });
  assert.equal(normalizeFinisher({ wall: "bounce" }).wall, "fit", "an unknown wall mode stops short");
  const r = validateRecipe({ id: "f", name: "F", trigger: "attack", category: "Custom", finisher: { on: "use" }, stages: [{ kind: "motion", motion: "shake", assets: [] }] });
  assert.equal(r.trigger, "manual", "normal dispatch never matches a finisher");
  assert.equal(r.category, "Finisher");
  assert.equal(r.finisher.on, "use");
  assert.equal(validateRecipe({ id: "n", name: "N", trigger: "manual", stages: [{ kind: "motion", motion: "shake", assets: [] }] }).finisher, undefined);
});

test("finishers match their items by name, slug or exact item, and by trigger", () => {
  const list = [fin("a", "Shove, Whirlwind Toss", { on: "use" }), fin("b", "greataxe"), fin("c", "", {}, { itemUuid: "Actor.x.Item.y" }), fin("d", "Shove", { on: "use" }, { enabled: false })];
  assert.deepEqual(matchFinishers(list, { itemName: "Shove" }, "use").map((r) => r.id), ["a"]);
  assert.deepEqual(matchFinishers(list, { itemSlug: "whirlwind-toss" }, "use").map((r) => r.id), ["a"]);
  assert.deepEqual(matchFinishers(list, { itemName: "Greataxe" }, "kill").map((r) => r.id), ["b"]);
  assert.deepEqual(matchFinishers(list, { itemUuid: "Actor.x.Item.y" }, "kill").map((r) => r.id), ["c"]);
  assert.deepEqual(matchFinishers(list, { itemName: "Greataxe" }, "use"), []);
  assert.deepEqual(matchFinishers([fin("x", "Shove", { on: "use" }), fin("y", "shove", { on: "use" })], { itemName: "Shove" }, "use").map((r) => r.id), ["x", "y"], "use plays every match");
});

test("a kill picks the killing item's first kill finisher, else the default, else none", () => {
  const list = [fin("a", "Greataxe"), fin("b", "Greataxe"), fin("def", "")];
  assert.equal(killFinisher(list, { itemName: "Greataxe" }, "def").id, "a");
  assert.equal(killFinisher(list, { itemName: "Dagger" }, "def").id, "def");
  assert.equal(killFinisher(list, { itemName: "Dagger" }, ""), null);
  assert.equal(killFinisher(list, {}, "missing"), null);
  assert.equal(killFinisher(list, { itemName: "Greataxe" }, "def", { crit: true }).id, "a");
  assert.equal(killFinisher([{ id: "plain", name: "P", match: "Dagger", stages: [] }], { itemName: "Dagger" }, "plain"), null, "a non-finisher is never a default");
});

test("a critical-only kill finisher plays only on a crit; the default obeys the same rule", () => {
  const list = [fin("crit", "Greataxe", { success: "critical" }), fin("def", "", { success: "critical" }), fin("plain", "")];
  assert.equal(killFinisher(list, { itemName: "Greataxe" }, "def", { crit: true }).id, "crit");
  assert.equal(killFinisher(list, { itemName: "Greataxe" }, "def", { crit: false }), null, "no crit: neither the item's nor the default plays");
  assert.equal(killFinisher(list, { itemName: "Greataxe" }, "def"), null, "unknown crit is not a crit");
  assert.equal(killFinisher(list, { itemName: "Greataxe" }, "plain").id, "plain", "falls through to a default that needs no crit");
  assert.equal(killFinisher([fin("both", "Greataxe", { success: "critical" }), fin("any", "Greataxe")], { itemName: "Greataxe" }, "").id, "any");
});

test("a use finisher on a roll needs a known outcome; a plain use needs none", () => {
  const plain = normalizeFinisher({ on: "use" });
  assert.equal(usePasses(plain, { type: "attack", outcome: null }), false, "D&D with several targets or hidden AC");
  assert.equal(usePasses(plain, { type: "check" }), false);
  assert.equal(usePasses(plain, { type: "attack", outcome: "success" }), true);
  assert.equal(usePasses(plain, { type: "attack", outcome: "failure" }), false);
  assert.equal(usePasses(plain, { type: "use", item: { type: "spell" } }), true);
  assert.equal(usePasses(plain, { type: "damage" }), false);
});

test("success rule: success or critical by default, critical only when chosen, no roll always passes", () => {
  const plain = normalizeFinisher({}), crit = normalizeFinisher({ success: "critical" });
  assert.equal(passesSuccess(plain, "success"), true);
  assert.equal(passesSuccess(plain, "criticalSuccess"), true);
  assert.equal(passesSuccess(plain, "failure"), false);
  assert.equal(passesSuccess(crit, "success"), false);
  assert.equal(passesSuccess(crit, "criticalSuccess"), true);
  assert.equal(passesSuccess(plain, undefined), true);
});

test("a use finisher rides the roll when there is one, else the use", () => {
  assert.equal(finisherMoment({ type: "attack" }), "roll");
  assert.equal(finisherMoment({ type: "check" }), "roll");
  assert.equal(finisherMoment({ type: "damage" }), null);
  assert.equal(finisherMoment({ type: "use", item: { type: "spell", system: { traits: { value: [] } } } }), "use");
  assert.equal(finisherMoment({ type: "use", item: { type: "weapon" } }), null, "a Strike's roll carries it");
  assert.equal(finisherMoment({ type: "use", item: { type: "action", system: { traits: { value: ["attack"] } } } }), null, "Shove's check carries it");
  assert.equal(finisherMoment({ type: "use", item: { type: "spell" }, activity: { type: "attack" } }), null);
});

test("a PF2e Shove check becomes a finisher event with its outcome and target", () => {
  const message = (author, options) => ({ id: "m1", author: { id: author }, speaker: { token: "t", scene: "s" }, flags: { pf2e: { context: { type: "skill-check", outcome: "criticalSuccess", options, target: { token: "Scene.s.Token.x" } } } } });
  const e = checkFinisherEvent(message("u", ["action:shove", "self:x"]), "pf2e", "u");
  assert.deepEqual(e, { type: "check", systemId: "pf2e", id: "finisher-check:m1", messageId: "m1", itemName: "shove", tokenId: "t", sceneId: "s", targetUuid: "Scene.s.Token.x", outcome: "criticalSuccess" });
  assert.equal(checkFinisherEvent(message("other", ["action:shove"]), "pf2e", "u"), null, "only the roller's client");
  assert.equal(checkFinisherEvent(message("u", ["self:x"]), "pf2e", "u"), null, "a check that names no action");
  assert.equal(checkFinisherEvent({ ...message("u", ["action:shove"]), blind: true }, "pf2e", "u"), null, "blind");
  assert.equal(checkFinisherEvent({ ...message("u", ["action:shove"]), whisper: ["gm"] }, "pf2e", "u"), null, "whispered");
  assert.notEqual(checkFinisherEvent({ ...message("u", ["action:shove"]), whisper: [] }, "pf2e", "u"), null, "an empty whisper list is public");
  const reroll = message("u", ["action:shove"]); reroll.flags.pf2e.context.isReroll = true;
  assert.equal(checkFinisherEvent(reroll, "pf2e", "u"), null, "reroll");
});

test("the catalog dropdown moves an entry to exactly one finisher, case-insensitively", () => {
  const list = [fin("a", "Shove, greataxe"), fin("b", "Fireball"), { id: "plain", name: "P", match: "Greataxe", stages: [] }];
  const moved = linkFinisher(list, "Greataxe", "b");
  assert.equal(moved[0].match, "Shove");
  assert.equal(moved[1].match, "Fireball, Greataxe");
  assert.equal(moved[2].match, "Greataxe", "normal recipes are untouched");
  assert.equal(linkedFinisher(moved, "greataxe").id, "b");
  const none = linkFinisher(moved, "GREATAXE", "");
  assert.equal(linkedFinisher(none, "Greataxe"), null);
  assert.equal(none[0], moved[0], "unchanged recipes keep their identity");
});

test("a player may move a token they own, or one their own token struck", () => {
  assert.equal(mayDisplace({ ownsToken: true, ownsAttacker: false }), true);
  assert.equal(mayDisplace({ ownsToken: false, ownsAttacker: true }), true);
  assert.equal(mayDisplace({ ownsToken: false, ownsAttacker: false }), false);
});

test("a finisher's travel path is the mover's held keyframed path", () => {
  const path = { kind: "motion", motion: "path", subject: "targets", motionEnd: "hold", keyframes: [] };
  assert.equal(finisherTravelPath({ finisher: normalizeFinisher({}), stages: [{ kind: "impact" }, path] }), path);
  assert.equal(finisherTravelPath({ finisher: normalizeFinisher({ mover: "source" }), stages: [path] }), null, "another mover's path is not the travel");
  assert.equal(finisherTravelPath({ finisher: normalizeFinisher({}), stages: [{ ...path, motionEnd: undefined }] }), null, "a returning path does not travel");
});

test("the studio chip says how a finisher plays, where it lands, and how it ends", () => {
  const path = { kind: "motion", motion: "path", subject: "targets", motionEnd: "hold", keyframes: [{ at: 0, x: 0, y: 0 }, { at: 1, x: 2.6, y: 0 }] };
  assert.equal(finisherChipText({ finisher: normalizeFinisher({ ending: "body" }), stages: [path] }), "Killing blow · lands 3 sq · Body");
  assert.equal(finisherChipText({ finisher: normalizeFinisher({ on: "use", ending: "vanish" }), stages: [{ ...path, keyframes: [{ at: 0, x: 0, y: 0 }, { at: 1, x: 0, y: 0 }] }] }), "Every successful use · in place · Vanish");
  assert.equal(finisherChipText({ finisher: normalizeFinisher({ knockback: 2, ending: "stay" }), stages: [] }), "Killing blow · lands 2 sq · Stay", "legacy travel uses knockback");
});

test("the chip warns when a travelling path lands tilted, shrunk or faded (the landing snaps it upright)", () => {
  const path = { kind: "motion", motion: "path", subject: "targets", motionEnd: "hold", keyframes: [{ at: 0, x: 0, y: 0 }, { at: 1, x: 3, y: 0, rotation: 90 }] };
  assert.equal(finisherChipText({ finisher: normalizeFinisher({ ending: "body" }), stages: [path] }), "Killing blow · lands 3 sq · Body · ⚠ lands tilted");
  const upright = { ...path, keyframes: [path.keyframes[0], { ...path.keyframes[1], rotation: 720 }] };
  assert.doesNotMatch(finisherChipText({ finisher: normalizeFinisher({}), stages: [upright] }), /tilted/);
  const inPlace = { ...path, keyframes: [path.keyframes[0], { at: 1, x: 0.2, y: 0, scale: 0.05, alpha: 0 }] };
  assert.doesNotMatch(finisherChipText({ finisher: normalizeFinisher({}), stages: [inPlace] }), /tilted/, "shrinking in place is fine");
});

test("addFinisherName appends a trimmed name once, ignoring case and blanks", () => {
  assert.equal(addFinisherName("", "Shove"), "Shove");
  assert.equal(addFinisherName(undefined, "  Shove "), "Shove");
  assert.equal(addFinisherName("Shove", "Greataxe"), "Shove, Greataxe");
  assert.equal(addFinisherName("Shove, Greataxe", "greataxe"), "Shove, Greataxe", "no duplicate, whatever the case");
  assert.equal(addFinisherName("Shove,greataxe ,", "Fireball"), "Shove, greataxe, Fireball", "keeps the comma format");
  assert.equal(addFinisherName("Shove", "   "), "Shove");
  assert.equal(addFinisherName("Shove", null), "Shove");
});

test("removeFinisherName drops a name whatever its case and keeps the rest", () => {
  assert.equal(removeFinisherName("Shove, Greataxe, Fireball", "greataxe"), "Shove, Fireball");
  assert.equal(removeFinisherName("Shove", " SHOVE "), "");
  assert.equal(removeFinisherName("Shove,Greataxe", "Missing"), "Shove, Greataxe");
  assert.equal(removeFinisherName("", "Shove"), "");
  assert.equal(removeFinisherName(undefined, ""), "");
});

test("normalizeFinisher keeps valid item links by normalized name and drops junk", () => {
  assert.equal(normalizeFinisher({}).links, undefined, "no links: the defaults are unchanged");
  assert.equal(normalizeFinisher({ links: "Item.a" }).links, undefined);
  assert.equal(normalizeFinisher({ links: [] }).links, undefined, "an array is not a link map");
  assert.deepEqual(normalizeFinisher({ links: { greataxe: "Item.axe", " ": "Item.x", shove: 5, fire: "", ok: null, "Big_Axe": "Item.big" } }).links, { greataxe: "Item.axe", "big axe": "Item.big" });
  assert.equal(normalizeFinisher({ links: { a: "x".repeat(400) } }).links.a.length, 300, "uuids are capped");
  const many = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`n${i}`, `Item.${i}`]));
  assert.equal(Object.keys(normalizeFinisher({ links: many }).links).length, 50, "at most 50 links");
  const kept = { on: "use", links: { shove: "Item.s" } };
  assert.deepEqual(normalizeFinisher(normalizeFinisher(kept)), normalizeFinisher(kept), "idempotent");
});

test("finisher item links are set, read and removed by name without mutating", () => {
  const f = normalizeFinisher({});
  const linked = linkFinisherItem(f, " Greataxe ", "Item.axe");
  assert.notEqual(linked, f);
  assert.equal(f.links, undefined, "the input is untouched");
  assert.deepEqual(linked.links, { greataxe: "Item.axe" });
  assert.equal(finisherItemLink(linked, "GREATAXE"), "Item.axe");
  assert.equal(finisherItemLink(linked, "Shove"), null);
  assert.equal(finisherItemLink(f, "Greataxe"), null);
  assert.equal(finisherItemLink(undefined, "Greataxe"), null);
  const both = linkFinisherItem(linked, "Shove", "Item.s");
  const unlinked = unlinkFinisherItem(both, "greataxe");
  assert.deepEqual(unlinked.links, { shove: "Item.s" });
  assert.deepEqual(both.links, { greataxe: "Item.axe", shove: "Item.s" }, "unlinking copies");
  assert.equal(unlinkFinisherItem(f, "Greataxe"), f, "nothing to remove: the same object");
});

test("the catalog dropdown stores the entry's uuid on its finisher and moves the link with the name", () => {
  const list = [fin("a", "Shove, greataxe", { links: { greataxe: "Item.old" } }), fin("b", "Fireball")];
  const moved = linkFinisher(list, "Greataxe", "b", "Compendium.pf2e.equipment-srd.Item.axe");
  assert.equal(finisherItemLink(moved[1].finisher, "greataxe"), "Compendium.pf2e.equipment-srd.Item.axe");
  assert.equal(finisherItemLink(moved[0].finisher, "greataxe"), null, "the old finisher forgets the link");
  const plain = linkFinisher(list, "Fireball", "b");
  assert.equal(plain[1], list[1], "no uuid and no change: same recipe");
  const none = linkFinisher(moved, "Greataxe", "");
  assert.equal(finisherItemLink(none[1].finisher, "Greataxe"), null, "unlinking drops the link");
});

test("players and the new Plays-on values are validated", () => {
  const f = normalizeFinisher({ players: ["u1", "u1", 7, "", "*"], on: "criticalOrKill" });
  assert.deepEqual(f.players, ["u1", "*"]);
  assert.equal(f.on, "criticalOrKill");
  assert.equal(normalizeFinisher({ on: "critical" }).on, "critical");
  assert.deepEqual(normalizeFinisher({}).players, []);
});

const owned = (id, match, finisher = {}) => fin(id, match, { players: ["u1"], ...finisher });

test("a player's choices are finishers given to them whose Applies-to matches the item", () => {
  const list = [owned("a", "Longsword"), owned("b", "Fireball"), fin("c", "Longsword", { players: ["*"] }), fin("d", "Longsword", { players: ["u2"] }), owned("e", "Longsword", {}), { ...owned("f", "Longsword"), enabled: false }];
  assert.deepEqual(playerFinisherChoices(list, { userId: "u1", itemName: "Longsword" }).map((r) => r.id), ["a", "c", "e"]);
  assert.deepEqual(playerFinisherChoices(list, { userId: "u3", itemName: "Longsword" }).map((r) => r.id), ["c"]);
  assert.equal(finisherAvailableTo(fin("g", "", { players: [] }), "u1"), false);
});

test("a pick only plays while it is still valid", () => {
  const list = [owned("a", "Longsword"), fin("b", "Longsword", { players: ["u2"] })];
  const item = { itemName: "Longsword" };
  assert.equal(pickedFinisher(list, { choiceId: "a", ownerUserIds: ["u1"], ...item }).id, "a");
  assert.equal(pickedFinisher(list, { choiceId: "b", ownerUserIds: ["u1"], ...item }), null, "not given to this owner");
  assert.equal(pickedFinisher(list, { choiceId: "zz", ownerUserIds: ["u1"], ...item }), null, "deleted");
  assert.equal(pickedFinisher(list, { choiceId: "a", ownerUserIds: ["u1"], itemName: "Dagger" }), null, "item no longer in Applies-to");
  assert.equal(pickedFinisher(list, { choiceId: null, ownerUserIds: ["u1"], ...item }), null);
  assert.equal(pickedFinisher(list, { choiceId: "b", ownerUserIds: [], ...item }).id, "b", "a GM-run creature keeps the GM's pick");
});

test("each Plays-on fires on its own outcomes", () => {
  const f = (on) => normalizeFinisher({ on });
  const cases = [
    ["kill", "success", true, true], ["kill", "criticalSuccess", false, false],
    ["critical", "criticalSuccess", false, true], ["critical", "success", true, false],
    ["criticalOrKill", "criticalSuccess", false, true], ["criticalOrKill", "success", true, true], ["criticalOrKill", "success", false, false],
    ["use", "success", false, true], ["use", "failure", false, false],
  ];
  for (const [on, outcome, killed, expected] of cases) assert.equal(finisherFires(f(on), { outcome, killed }), expected, `${on}/${outcome}/${killed}`);
});

test("a finisher plays once per target per action", () => {
  let now = 0;
  const memory = createFinishedMemory(30000, () => now);
  assert.equal(memory.has("msg1:t1"), false);
  memory.mark("msg1:t1");
  assert.equal(memory.has("msg1:t1"), true);
  now = 30001;
  assert.equal(memory.has("msg1:t1"), false, "forgotten after 30 s");
});
