import test from "node:test";
import assert from "node:assert/strict";
import { validateRecipe, normalizeFinisher } from "../scripts/model.mjs";
import { matchFinishers, killFinisher, passesSuccess, usePasses, finisherMoment, checkFinisherEvent, linkFinisher, linkedFinisher, mayDisplace } from "../scripts/finisher-model.mjs";

const fin = (id, match, finisher = {}, extra = {}) => ({ id, name: id, trigger: "manual", match, finisher: normalizeFinisher(finisher), stages: [{ kind: "motion", motion: "shake", assets: [] }], ...extra });

test("the finisher block is normalized, kept, and makes the recipe a manual Finisher", () => {
  assert.deepEqual(normalizeFinisher({}), { on: "kill", mover: "targets", knockback: 0, ending: "body", success: "success" });
  assert.deepEqual(normalizeFinisher({ on: "use", mover: "source", knockback: 9, ending: "vanish", success: "critical" }), { on: "use", mover: "source", knockback: 6, ending: "vanish", success: "critical" });
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
