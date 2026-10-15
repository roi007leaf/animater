import test from "node:test";
import assert from "node:assert/strict";
import { finishersPageHTML, finisherSettingsHTML, finisherLinkHTML } from "../scripts/finisher-ui.mjs";
import { normalizeFinisher } from "../scripts/model.mjs";

const fin = (id, match, finisher = {}) => ({ id, name: `Fin ${id}`, color: "#c0392b", match, category: "Finisher", trigger: "manual", enabled: true, finisher: normalizeFinisher(finisher), stages: [] });
const w = (recipes, def = "") => ({ studio: false, listedRecipes: () => recipes, host: { recipes: () => recipes, defaultFinisher: () => def } });

test("the Finishers page lists only finishers, with presets and the default choice", () => {
  const html = finishersPageHTML(w([fin("a", "Shove", { on: "use" }), { id: "plain", name: "Plain recipe", category: "Custom", match: "Fireball", stages: [] }], "a"));
  assert.match(html, /Fin a/);
  assert.doesNotMatch(html, /Plain recipe/);
  assert.match(html, /data-action="new-finisher" data-preset="launch"/);
  assert.match(html, /<option value="a" selected>Fin a<\/option>/);
  assert.match(html, /data-finisher-default/);
});

test("the studio Finisher panel edits every finisher field", () => {
  const html = finisherSettingsHTML(fin("a", "Shove, greataxe", { on: "use", knockback: 2, ending: "vanish" }));
  for (const field of ["finisher.on", "finisher.knockback", "finisher.ending", "finisher.success"]) assert.match(html, new RegExp(`data-field="${field.replace(".", "\.")}"`), field);
  assert.doesNotMatch(html, /data-field="finisher\.mover"|>Moves</, "finishers move only their targets: no Moves choice");
  assert.match(html, /<option value="vanish" selected>/);
});

test("the catalog dropdown shows the entry's finisher, or nothing when there are none", () => {
  const html = finisherLinkHTML(w([fin("a", "Greataxe"), fin("b", "")]), "Greataxe");
  assert.match(html, /data-finisher-link="Greataxe"/);
  assert.match(html, /<option value="a" selected>Fin a<\/option>/);
  assert.equal(finisherLinkHTML(w([]), "Greataxe"), "");
});

test("a path finisher hides knockback and says the path decides the landing", () => {
  const r = fin("a", "Shove", { knockback: 4 });
  r.stages = [{ kind: "motion", motion: "path", subject: "targets", motionEnd: "hold", keyframes: [{ at: 0, x: 0, y: 0 }, { at: 1, x: 2, y: 0 }] }];
  const html = finisherSettingsHTML(r);
  assert.doesNotMatch(html, /data-field="finisher\.knockback"/);
  assert.match(html, /keyframed path ends \(2 sq\), away from the attacker/);
  assert.doesNotMatch(html, /aimed away/);
  assert.doesNotMatch(html, /knockback replaces its distance/, "the legacy hint does not apply to a path");
  assert.match(finisherSettingsHTML({ ...r, finisher: { ...r.finisher, mover: "source" } }), /away from the attacker/, "an old source mover still says attacker");
  assert.match(finisherSettingsHTML(fin("b", "Shove")), /knockback replaces its distance/, "legacy travel keeps its hint");
  assert.match(finisherSettingsHTML(fin("b", "Shove", { knockback: 4 })), /data-field="finisher\.knockback"/, "legacy travel keeps knockback");
});

test("a path finisher chooses what happens at walls; legacy travel does not", () => {
  const r = fin("a", "Shove", { wall: "slam" });
  r.stages = [{ kind: "motion", motion: "path", subject: "targets", motionEnd: "hold", keyframes: [{ at: 0, x: 0, y: 0 }, { at: 1, x: 2, y: 0 }] }];
  const html = finisherSettingsHTML(r);
  assert.match(html, /<label>At walls<select data-field="finisher\.wall">/);
  assert.match(html, /<option value="slam" selected>Slam into it<\/option>/);
  assert.match(html, /<option value="fit" >Stop short smoothly<\/option>/);
  assert.doesNotMatch(finisherSettingsHTML(fin("b", "Shove")), /finisher\.wall/);
});

test("Applies to is a card list with Unbind buttons, a drop zone and an add-name input", () => {
  const html = finisherSettingsHTML(fin("a", "Shove, greataxe ,", { on: "use" }));
  assert.doesNotMatch(html, /data-field="match"/, "no plain match text input");
  assert.doesNotMatch(html, /an-finisher-chip/, "no chips any more");
  assert.match(html, /class="an-bound[^"]*"[^]*?<b>Shove<\/b>[^]*?data-action="finisher-unlink" data-name="Shove"/);
  assert.match(html, /data-action="finisher-unlink" data-name="greataxe"/);
  assert.equal(html.match(/data-action="finisher-unlink"/g).length, 2, "one card per trimmed name");
  assert.match(html, /data-finisher-drop[^>]*>[^]*Drop spells, feats, actions, weapons or items here/);
  assert.match(html, /<input[^>]*data-finisher-add[^>]*placeholder="Add a name…"/);
  assert.match(finisherSettingsHTML(fin("b", "")), /an-finisher-cards is-empty/, "no names: an empty list, still with the drop zone");
});

test("a linked name renders the bound-item card: image, type and source, opens its uuid, Unbind", () => {
  const r = fin("a", "Greataxe", { links: { greataxe: "Compendium.pf2e.equipment-srd.Item.axe" } });
  const summary = (uuid) => (uuid === "Compendium.pf2e.equipment-srd.Item.axe" ? { name: "Greataxe", img: "axe.webp", type: "weapon", source: "Equipment" } : null);
  const html = finisherSettingsHTML(r, { itemSummary: summary });
  assert.match(html, /<button type="button" class="an-bound-item" data-action="open-bound" data-uuid="Compendium\.pf2e\.equipment-srd\.Item\.axe" data-tooltip="Open Greataxe<br><small>[^"]*<\/small>" ><img src="axe\.webp" alt=""><span><b>Greataxe<\/b><small>Weapon · Equipment<\/small>/);
  assert.match(html, /<button type="button" class="an-bound-unbind" data-action="finisher-unlink" data-name="Greataxe"[^>]*>Unbind<\/button>/);
  const missing = finisherSettingsHTML(r, { itemSummary: () => null });
  assert.match(missing, /data-action="open-bound" data-uuid="[^"]+" data-tooltip="[^"]*" disabled>[^]*<b>Greataxe<\/b><small>Item not found<\/small>/, "a lost item keeps its name, disabled");
  assert.match(finisherSettingsHTML(r), /Item not found/, "no lookup at all: not found");
});

test("an unlinked name renders the generic By-name card, not clickable", () => {
  const html = finisherSettingsHTML(fin("a", "Shove"), { itemSummary: () => ({ name: "x", img: "x.webp" }) });
  assert.match(html, /<img src="icons\/svg\/item-bag\.svg" alt=""><span><b>Shove<\/b><small>By name<\/small>/);
  assert.doesNotMatch(html, /data-action="open-bound"/);
  assert.match(html, /data-action="finisher-unlink" data-name="Shove"[^>]*>Unbind</);
});

test("a legacy bound item still shows as its name's card", () => {
  const r = { ...fin("a", "Greataxe, Shove"), itemUuid: "Item.axe" };
  const html = finisherSettingsHTML(r, { itemSummary: (uuid) => (uuid === "Item.axe" ? { name: "greataxe", img: "axe.webp", type: "weapon", source: "World" } : null) });
  assert.match(html, /data-uuid="Item\.axe"[^]*?<img src="axe\.webp" alt=""><span><b>Greataxe<\/b>/);
  assert.equal(html.match(/data-action="open-bound"/g).length, 1, "only the matching name is linked");
});

test("Applies-to cards escape names, uuids and summaries", () => {
  const r = fin("a", `<b>"x"</b>`, { links: { [`<b>"x"</b>`]: `Item."><script>` } });
  const html = finisherSettingsHTML(r, { itemSummary: () => ({ name: "<i>", img: `"><img onerror=1>`, type: "<t>", source: "<s>" }) });
  assert.doesNotMatch(html, /<script>|<b>"x"|<img onerror|<i>|<t>|<s>/);
  assert.match(html, /&lt;b&gt;&quot;x&quot;&lt;\/b&gt;/);
});

test("the catalog dropdown carries the entry's uuid when it has one", () => {
  const list = w([fin("a", "Greataxe")]);
  assert.match(finisherLinkHTML(list, "Greataxe", "Compendium.x.Item.1"), /data-finisher-link="Greataxe" data-finisher-uuid="Compendium\.x\.Item\.1"/);
  assert.doesNotMatch(finisherLinkHTML(list, "Greataxe"), /data-finisher-uuid/);
});

test("finisher settings let the GM give it to players", () => {
  const r = fin("a", "Longsword", { players: ["u1"] });
  const html = finisherSettingsHTML(r, { players: [{ id: "u1", name: "Ana", color: "#f00" }, { id: "u2", name: "Bo", color: "#0f0" }] });
  assert.match(html, /data-finisher-player="\*"/);
  assert.match(html, /data-finisher-player="u1"[^>]*checked/);
  assert.doesNotMatch(html, /data-finisher-player="u2"[^>]*checked/);
  assert.match(html, /Critical hit or killing blow/);
});

test("finisher cards say who has it", () => {
  const players = [{ id: "u1", name: "Ana" }];
  const page = (p) => finishersPageHTML({ studio: false, listedRecipes: () => [fin("a", "X", { players: p })], host: { recipes: () => [], defaultFinisher: () => "", players: () => players } });
  assert.match(page(["*"]), /All players/);
  assert.match(page(["u1"]), /Ana/);
  assert.match(page([]), /GM only/);
});

test("All players disables the per-player boxes", () => {
  const html = finisherSettingsHTML(fin("a", "X", { players: ["*"] }), { players: [{ id: "u1", name: "Ana", color: "#f00" }] });
  assert.match(html, /data-finisher-player="\*"[^>]*checked/);
  assert.match(html, /data-finisher-player="u1"[^>]*disabled/);
});

test("Needs shows only for Every successful use and Killing blow, each with its hint", () => {
  const html = (on) => finisherSettingsHTML(fin("a", "Shove", { on, success: "critical" }));
  for (const on of ["use", "kill"]) assert.match(html(on), /<label>Needs<select data-field="finisher\.success">/, on);
  for (const on of ["critical", "criticalOrKill"]) assert.doesNotMatch(html(on), /data-field="finisher\.success"/, on);
  assert.match(html("use"), /<p class="an-hint">Which results count as a successful use\.<\/p>/);
  assert.match(html("kill"), /<p class="an-hint">Critical only: the killing blow must itself be a critical\.<\/p>/);
  assert.doesNotMatch(html("use"), /killing blow must itself/);
  assert.match(html("use"), /<option value="success" >Any success<\/option><option value="critical" selected>Only on a critical<\/option>/);
});

test("Available to says only a player's pick plays for their items", () => {
  const html = finisherSettingsHTML(fin("a", "X"), { players: [{ id: "u1", name: "Ana", color: "#f00" }] });
  assert.match(html, /<p class="an-hint">Chosen players can pick this finisher for their own items in Combater; only a player's pick plays for their items\. NPCs and GM creatures use Applies-to automatically\.<\/p>/);
  assert.doesNotMatch(html, /The GM always can/);
});

import { Workspace } from "../scripts/workspace.mjs";
test("changing Plays on re-renders the settings, so Needs shows or hides", () => {
  const r = fin("a", "Shove", { on: "use", success: "critical" });
  let renders = 0;
  const ws = Object.assign(Object.create(Workspace.prototype), { busy: false, stopEditorPreview() {}, edit: () => r, render: () => { renders += 1; } });
  const target = { value: "critical", type: "select-one", dataset: { field: "finisher.on" }, hasAttribute: () => false };
  ws.onChange({ target });
  assert.equal(r.finisher.on, "critical");
  assert.equal(r.finisher.success, "critical", "the stored Needs value is untouched");
  assert.equal(renders, 1);
  assert.doesNotMatch(finisherSettingsHTML(r), /data-field="finisher\.success"/);
});
