import test from "node:test";
import assert from "node:assert/strict";
import { Workspace } from "../scripts/workspace.mjs";
import { cardExcludeHTML } from "../scripts/catalog-details.mjs";
import { PF2E_SPELLS } from "../scripts/spell-catalog.mjs";
const [card, selectedSpell] = PF2E_SPELLS.slice(0, 2).map((s) => s.id);

function spellsWorkspace(excluded = []) {
  const w = Object.create(Workspace.prototype);
  let state = { enabled: true, scope: "all", excluded, selected: [], customized: [] };
  Object.assign(w, {
    page: "spells", selectedSpell, busy: false, message: "", drafts: new Map(), dirty: new Set(),
    root: { querySelectorAll: () => [], querySelector: () => null },
    host: {
      environment: () => ({ ready: true, systemId: "pf2e" }),
      catalogState: () => state,
      setCatalogState: async (change) => { state = { ...state, ...change }; },
      recipes: () => [],
    },
  });
  w.render = () => {};
  const click = (dataset) => w.onClick({ target: { closest: () => ({ dataset, disabled: false }) }, preventDefault() {} });
  return { w, click, state: () => state };
}

test("a card's exclude toggle excludes that card, not the selected entry", async () => {
  const f = spellsWorkspace();
  await f.click({ action: "catalog-exclude", id: card });
  assert.deepEqual(f.state().excluded, [card]);
  await f.click({ action: "catalog-exclude", id: card });
  assert.deepEqual(f.state().excluded, [], "clicking again includes it");
  await f.click({ action: "catalog-exclude" });
  assert.deepEqual(f.state().excluded, [selectedSpell], "the detail-panel button still toggles the selection");
});

test("card toggle markup reflects the excluded state", () => {
  const off = cardExcludeHTML("weapon-exclude", { id: "longsword", name: "Longsword" }, false);
  assert.match(off, /data-action="weapon-exclude" data-id="longsword" aria-pressed="false"/);
  assert.match(off, /aria-label="Exclude Longsword from plug &amp; play"/);
  const on = cardExcludeHTML("weapon-exclude", { id: "longsword", name: "Longsword" }, true);
  assert.match(on, /class="an-card-exclude is-on"/);
  assert.match(on, /aria-label="Include Longsword in plug &amp; play"/);
});
