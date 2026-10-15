import test from "node:test";
import assert from "node:assert/strict";
import { finishersPageHTML, finisherSettingsHTML, finisherLinkHTML, finisherPinHTML } from "../scripts/finisher-ui.mjs";
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
  for (const field of ["finisher.on", "finisher.mover", "finisher.knockback", "finisher.ending", "finisher.success", "match"]) assert.match(html, new RegExp(`data-field="${field.replace(".", "\.")}"`), field);
  assert.match(html, /value="Shove, greataxe"/);
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
  assert.match(html, /keyframed path ends \(2 sq\)/);
  assert.match(finisherSettingsHTML(fin("b", "Shove", { knockback: 4 })), /data-field="finisher\.knockback"/, "legacy travel keeps knockback");
});

test("the pinned Finisher section shows only for finishers, and not while the settings dialog is open", () => {
  assert.match(finisherPinHTML(fin("a", "Shove"), false), /an-finisher-pin/);
  assert.equal(finisherPinHTML(fin("a", "Shove"), true), "");
  assert.equal(finisherPinHTML({ id: "p", name: "Plain", stages: [] }, false), "");
});
