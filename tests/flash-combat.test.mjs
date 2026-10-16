import test from "node:test";
import assert from "node:assert/strict";
import { flashScreens } from "../scripts/flash-combat.mjs";
import { FLASH_EVENTS, MOMENT_EVENTS, validateFlash } from "../scripts/flash-model.mjs";

const ID = "animater";
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// A world with one GM client: hooks are captured, flash screens go out over the socket.
function world({ defaults = {}, gm = true } = {}) {
  const hooks = {}, sent = [];
  const screens = [validateFlash({ id: "roll", name: "Roll for Initiative", event: "initiated" }), validateFlash({ id: "go", name: "Combat Started", event: "start" })];
  const settings = { flashScreens: { schema: 1, screens }, flashDefaults: { start: "none", end: "none", ...defaults } };
  globalThis.Hooks = { on: (name, fn) => (hooks[name] ??= []).push(fn) };
  globalThis.canvas = { scene: { name: "Crypt" } };
  globalThis.ui = {};
  globalThis.game = {
    system: { id: "pf2e" },
    user: { id: "gm", isGM: gm },
    users: { activeGM: { isSelf: gm } },
    combats: [],
    settings: { get: (_, key) => settings[key], set: async (_, key, value) => { settings[key] = value; } },
    socket: { emit: (_, data) => sent.push(data) },
  };
  flashScreens({ ID, clientId: "gm", quietHere: () => true, resolveMedia: (s) => s, trace: () => {} });
  const fire = (name, ...args) => (hooks[name] ?? []).forEach((fn) => fn(...args));
  return { fire, played: () => sent.filter((d) => d.type === "flash").map((d) => d.screen.id) };
}
function encounter({ started = false } = {}) {
  const flags = {}, combatants = [];
  const combat = { id: "c1", started, round: started ? 1 : 0, combatants, getFlag: (_, k) => flags[k], setFlag: async (_, k, v) => { flags[k] = v; } };
  const add = (name = "Goblin") => { const c = { name, combat, token: { disposition: -1, texture: { src: "" } }, actor: { name } }; combatants.push(c); return c; };
  return { combat, add };
}

test("combat initiated is its own moment, off by default", () => {
  assert.equal(FLASH_EVENTS.initiated, "Combat initiated");
  assert.ok(MOMENT_EVENTS.includes("initiated"));
});

test("combat initiated plays once when combatants are added, before Begin Combat", async () => {
  const w = world({ defaults: { initiated: "roll", start: "go" } }), { combat, add } = encounter();
  for (const name of ["Goblin", "Orc", "Ogre"]) w.fire("createCombatant", add(name));
  await wait();
  assert.deepEqual(w.played(), ["roll"], "one screen for the burst of adds");
  w.fire("createCombatant", add("Late"));
  await wait();
  assert.deepEqual(w.played(), ["roll"], "not again on a later add");
  combat.started = true;
  w.fire("combatStart", combat);
  assert.deepEqual(w.played(), ["roll", "go"], "Begin Combat still plays the opening");
});

test("combat initiated stays quiet when off, when the combat is already started, and for players", async () => {
  const off = world({ defaults: { start: "go" } });
  off.fire("createCombatant", encounter().add());
  await wait();
  assert.deepEqual(off.played(), []);
  const started = world({ defaults: { initiated: "roll" } });
  started.fire("createCombatant", encounter({ started: true }).add());
  await wait();
  assert.deepEqual(started.played(), []);
  const player = world({ defaults: { initiated: "roll" }, gm: false });
  player.fire("createCombatant", encounter().add());
  await wait();
  assert.deepEqual(player.played(), []);
});

test("the opening no longer plays on add; it waits for Begin Combat", async () => {
  const w = world({ defaults: { start: "go", startWhen: "add" } }), { combat, add } = encounter();
  w.fire("createCombatant", add());
  await wait();
  assert.deepEqual(w.played(), [], "an old world's startWhen is ignored");
  combat.started = true;
  w.fire("combatStart", combat);
  assert.deepEqual(w.played(), ["go"]);
});
