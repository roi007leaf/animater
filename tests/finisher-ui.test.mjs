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
  for (const field of ["finisher.on", "finisher.mover", "finisher.knockback", "finisher.ending", "finisher.success"]) assert.match(html, new RegExp(`data-field="${field.replace(".", "\.")}"`), field);
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
  const source = { ...fin("c", "Charge", { mover: "source" }), stages: [{ ...r.stages[0], subject: "source" }] };
  assert.match(finisherSettingsHTML(source), /away from the target/);
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

test("Applies to is a chip list with remove buttons, a drop zone and an add-name input", () => {
  const html = finisherSettingsHTML(fin("a", "Shove, greataxe ,", { on: "use" }));
  assert.doesNotMatch(html, /data-field="match"/, "no plain match text input");
  assert.match(html, /class="an-finisher-chip"[^]*?Shove[^]*?data-action="finisher-unlink" data-name="Shove"/);
  assert.match(html, /data-action="finisher-unlink" data-name="greataxe"/);
  assert.equal(html.match(/data-action="finisher-unlink"/g).length, 2, "one chip per trimmed name");
  assert.match(html, /data-finisher-drop[^>]*>[^]*Drop spells, feats, actions, weapons or items here/);
  assert.match(html, /<input[^>]*data-finisher-add[^>]*placeholder="Add a name…"/);
  assert.match(finisherSettingsHTML(fin("b", "")), /an-finisher-chips is-empty/, "no names: an empty list, still with the drop zone");
});

test("a chip shows the bound item's icon when the host can name it", () => {
  const r = { ...fin("a", "Greataxe, Shove"), itemUuid: "Item.axe" };
  const html = finisherSettingsHTML(r, { itemSummary: (uuid) => (uuid === "Item.axe" ? { name: "greataxe", img: "axe.webp" } : null) });
  assert.match(html, /<img src="axe\.webp" alt="">Greataxe/);
  assert.equal(html.match(/<img /g).length, 1, "names without a known item have no icon");
  assert.doesNotMatch(finisherSettingsHTML(r), /<img /, "no lookup, no icons");
});
