import test from "node:test";
import assert from "node:assert/strict";
import { LASTING_CHOICES, lastingChoice, nextLastingChange } from "../scripts/lasting-choice.mjs";
import { normalizeStateCatalogState } from "../scripts/state-catalog.mjs";
import { normalizeSfCatalogState } from "../scripts/sf2e-catalog.mjs";
import { normalizeDndCatalogState } from "../scripts/dnd5e-catalog.mjs";
import { normalizeDhCatalogState } from "../scripts/daggerheart-catalog.mjs";

test("the catalog Lasting animation switch steps through stay, play once, and play once and at turn start", () => {
  assert.deepEqual(Object.values(LASTING_CHOICES), ["Stay while active", "Play once, then fade", "Play once and at turn start"]);
  let state = {};
  const seen = [];
  for (let i = 0; i < 4; i++) { seen.push(lastingChoice(state)); state = { ...state, ...nextLastingChange(state) }; }
  assert.deepEqual(seen, ["lasting", "once", "turn", "lasting"]);
  assert.equal(lastingChoice({ fade: false, turn: true }), "lasting", "turn alone means nothing without play once");
});

test("every system's condition and effect catalog keeps the turn-start choice when it saves", () => {
  for (const normalize of [normalizeStateCatalogState, normalizeSfCatalogState, normalizeDndCatalogState, normalizeDhCatalogState]) {
    assert.equal(normalize({ fade: true, turn: true }).turn, true, normalize.name);
    assert.equal(normalize({}).turn, false, normalize.name);
  }
});
