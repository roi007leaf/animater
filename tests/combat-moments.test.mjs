import test from "node:test";
import assert from "node:assert/strict";
import { combatMoments, TURN_MARKER, MARKER_ASSETS } from "../scripts/combat-moments.mjs";

function fixture({ mode = "all", gm = true } = {}) {
  const calls = [];
  const chain = (tag) => new Proxy({}, { get: (_, k) => (k === "play" ? async () => calls.push([tag, "play"]) : (...a) => { calls.push([tag, k, ...a]); return chain(tag); }) });
  const host = {
    mode: () => mode, isActiveGM: () => gm, sceneId: () => "s",
    tokenOf: (c) => (c ? { id: c.tokenId } : null),
    firstInstalled: (keys) => keys[0], users: () => null,
    sequence: () => ({ effect: () => chain("effect"), play: async () => calls.push(["seq", "play"]) }),
    end: async (name) => calls.push(["end", name]),
  };
  return { m: combatMoments(host), calls };
}
const combat = { started: true, scene: { id: "s" }, combatant: { tokenId: "t2" }, combatants: [{ tokenId: "t1" }, { tokenId: "t2" }, { tokenId: "t3", hidden: true }] };

test("the turn ring moves to the current combatant: old one ended, new one persisted on its token", async () => {
  const { m, calls } = fixture();
  await m.markTurn(combat);
  assert.deepEqual(calls[0], ["end", TURN_MARKER]);
  assert.ok(calls.some((c) => c[1] === "file" && c[2] === MARKER_ASSETS[0]));
  assert.ok(calls.some((c) => c[1] === "attachTo" && c[2].id === "t2"));
  assert.ok(calls.some((c) => c[1] === "persist"));
});

test("combat start pulses every visible combatant once", async () => {
  const { m, calls } = fixture();
  await m.pulseStart(combat);
  assert.deepEqual(calls.filter((c) => c[1] === "atLocation").map((c) => c[2].id), ["t1", "t2"]);
  assert.equal(calls.filter((c) => c[0] === "seq").length, 1);
});

test("off, turn-only and non-GM clients draw nothing extra", async () => {
  const off = fixture({ mode: "off" });
  await off.m.markTurn(combat); await off.m.pulseStart(combat);
  assert.deepEqual(off.calls, [["end", TURN_MARKER]], "switching off clears the ring");
  const turnOnly = fixture({ mode: "turn" });
  await turnOnly.m.pulseStart(combat);
  assert.equal(turnOnly.calls.length, 0);
  const player = fixture({ gm: false });
  await player.m.markTurn(combat); await player.m.clearMarker();
  assert.equal(player.calls.length, 0, "players never touch the shared ring");
});
