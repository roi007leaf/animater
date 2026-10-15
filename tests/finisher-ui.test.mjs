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

test("the knockback field says it shoves the target before the rest plays; a path hides it", () => {
  const hint = /Shoves the target this far away from the attacker before the rest plays \(stops at walls\)\./;
  assert.match(finisherSettingsHTML(fin("b", "Slice", { knockback: 2 })), hint);
  const r = fin("a", "Fly", { knockback: 4 });
  r.stages = [{ kind: "motion", motion: "path", subject: "targets", motionEnd: "hold", keyframes: [{ at: 0, x: 0, y: 0 }, { at: 1, x: 2, y: 0 }] }];
  assert.doesNotMatch(finisherSettingsHTML(r), hint);
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

// ---- Finishers page polish ----
import { finisherGlyphSVG, FINISHER_PRESET_GROUPS } from "../scripts/finisher-ui.mjs";
import { FINISHER_PRESETS, presetFinisher } from "../scripts/finisher-presets.mjs";

const pathStage = (keyframes, extra = {}) => ({ stageId: "fly", kind: "motion", motion: "path", subject: "targets", motionEnd: "hold", keyframes, ...extra });
const kf = (at, x = 0, y = 0, extra = {}) => ({ at, x, y, rotation: 0, scale: 1, alpha: 1, stretch: 0, ease: "linear", sharp: false, ...extra });
const withStages = (r, stages) => ({ ...r, stages });
const kindOf = (svg) => /^<svg[^>]*data-kind="([^"]+)"/.exec(svg)?.[1];

test("finisherGlyphSVG draws a travel path with a moving dot, fading when the path ends invisible", () => {
  const r = withStages(fin("a", "X"), [pathStage([kf(0), kf(0.5, 1.5, 0.5), kf(1, 3, 0, { alpha: 0 })])]);
  const svg = finisherGlyphSVG(r, { size: 40 });
  assert.match(svg, /^<svg [^>]*viewBox="0 0 100 50"/);
  assert.equal(kindOf(svg), "travel");
  assert.match(svg, /width="80" height="40"/);
  const trail = svg.match(/<path class="an-glyph-trail" d="M[^"]+"/);
  assert.ok(trail, "a glowing trail");
  assert.equal((trail[0].match(/L/g) ?? []).length, 23, "24 samples");
  assert.match(svg, /<animateMotion [^>]*path="M/);
  assert.match(svg, /attributeName="opacity" values="1;1;0/, "fades out at the end");
  assert.doesNotMatch(finisherGlyphSVG(withStages(fin("b", "X"), [pathStage([kf(0), kf(1, 3, 0)])])), /attributeName="opacity"/, "a visible end does not fade");
  assert.doesNotMatch(svg, /an-glyph-wall/);
  assert.doesNotMatch(svg, /NaN|undefined/);
});

test("finisherGlyphSVG adds a wall bar when the finisher slams into walls", () => {
  const r = withStages(fin("a", "X", { wall: "slam" }), [pathStage([kf(0), kf(1, 6, 0)])]);
  const svg = finisherGlyphSVG(r);
  assert.equal(kindOf(svg), "travel");
  assert.match(svg, /<line class="an-glyph-wall" /);
  assert.doesNotMatch(svg, /NaN/);
});

test("finisherGlyphSVG splits the token for every fragment pattern", () => {
  for (const pattern of ["halves", "topBottom", "shards", "dust"]) {
    const r = withStages(fin("a", "X"), [{ stageId: "cut", kind: "motion", motion: "fragments", subject: "targets", pattern, pieces: pattern === "dust" ? 16 : pattern === "shards" ? 5 : 2 }]);
    const svg = finisherGlyphSVG(r);
    assert.equal(kindOf(svg), "fragments", pattern);
    assert.match(svg, new RegExp(`data-pattern="${pattern}"`), pattern);
    const pieces = svg.match(/<polygon class="an-glyph-piece"/g) ?? [];
    assert.ok(pieces.length >= (pattern === "dust" ? 8 : 2), `${pattern}: ${pieces.length} pieces`);
    assert.match(svg, /<animateTransform [^>]*type="translate"/, pattern);
    assert.doesNotMatch(svg, /NaN|undefined/, pattern);
  }
});

test("finisherGlyphSVG pulses an in-place path by its scale, rotation and alpha", () => {
  const r = withStages(fin("a", "X"), [pathStage([kf(0), kf(0.5, 0, 0, { rotation: 360, scale: 0.6 }), kf(1, 0, 0, { rotation: 720, scale: 0.05, alpha: 0 })])]);
  const svg = finisherGlyphSVG(r);
  assert.equal(kindOf(svg), "inplace");
  assert.match(svg, /type="scale" values="1;[^"]*0\.05"/);
  assert.match(svg, /type="rotate" values="0;[^"]*720"/);
  assert.match(svg, /attributeName="opacity" values="1;[^"]*;0"/);
  assert.doesNotMatch(svg, /NaN|undefined/);
});

test("finisherGlyphSVG draws an arrow away from the attacker for knockback-only finishers", () => {
  const r = withStages(fin("a", "X", { knockback: 2 }), [{ stageId: "fall", kind: "motion", motion: "collapse", subject: "targets" }]);
  const svg = finisherGlyphSVG(r);
  assert.equal(kindOf(svg), "knockback");
  assert.match(svg, /class="an-glyph-attacker"/);
  assert.match(svg, /class="an-glyph-arrow"/);
  assert.doesNotMatch(svg, /NaN|undefined/);
});

test("finisherGlyphSVG is deterministic, static under reduced motion, and tinted with a validated colour", () => {
  for (const id of Object.keys(FINISHER_PRESETS)) {
    const a = finisherGlyphSVG(presetFinisher(id, "p")), b = finisherGlyphSVG(presetFinisher(id, "p"));
    assert.equal(a, b, id);
    assert.doesNotMatch(a, /NaN|undefined|Infinity/, id);
    assert.match(a, /<g class="an-glyph-anim">[^]*<g class="an-glyph-still">/, `${id}: a static twin for reduced motion`);
  }
  assert.match(finisherGlyphSVG({ ...fin("a", "X"), color: "#12abef" }), /style="--glyph:#12abef"/);
  const bad = finisherGlyphSVG({ ...fin("a", "X"), color: `red"><script>alert(1)</script>` });
  assert.doesNotMatch(bad, /<script>|red"/);
  assert.match(bad, /style="--glyph:#9e8aff"/, "an invalid colour falls back");
});

const pageOf = (recipes, { players = [], itemSummary, def = "" } = {}) => finishersPageHTML({ studio: false, listedRecipes: () => recipes, host: { recipes: () => recipes, defaultFinisher: () => def, players: () => players, itemSummary } });

test("finisher cards show the Plays on badge, an Off badge when disabled, and a glyph", () => {
  const html = pageOf([fin("a", "X", { on: "critical" }), { ...fin("b", "Y"), enabled: false }]);
  assert.match(html, /<span class="an-fcard-badge">Critical hit<\/span>/);
  assert.equal(html.match(/an-fcard-badge is-off">Off</g).length, 1);
  assert.match(html, /<div class="an-art an-fcard-art"><svg /);
  assert.doesNotMatch(html, /✸/);
});

test("finisher cards show labelled Ending, Knockback or Travels, and Players pills", () => {
  const travel = withStages(fin("t", "X", { ending: "stay" }), [pathStage([kf(0), kf(1, 3, 0)])]);
  const players = [{ id: "u1", name: "Oded", color: "#ff0000" }, { id: "u2", name: "Guy", color: "#00ff00" }];
  const html = pageOf([fin("a", "X", { ending: "vanish", knockback: 2, players: ["u1", "u2"] }), fin("b", "Y", { ending: "body" }), travel], { players });
  assert.match(html, /<span class="an-pill">Ending: Vanish<\/span>/);
  assert.match(html, /<span class="an-pill">Ending: Body<\/span>/);
  assert.match(html, /<span class="an-pill">Ending: Stay<\/span>/);
  assert.match(html, /<span class="an-pill">Knockback: 2 sq<\/span>/);
  assert.match(html, /<span class="an-pill">Knockback: none<\/span>/);
  assert.match(html, /<span class="an-pill">Travels 3 sq<\/span>/);
  assert.match(html, /<span class="an-pill an-pill-players">Players: <i class="an-player-dot" style="background:#ff0000"><\/i>Oded, <i class="an-player-dot" style="background:#00ff00"><\/i>Guy<\/span>/);
  assert.match(pageOf([fin("a", "X", { players: ["*"] })], { players }), /<span class="an-pill an-pill-players">All players<\/span>/);
  assert.match(pageOf([fin("a", "X")], { players }), /<span class="an-pill an-pill-players">GM only<\/span>/);
});

test("finisher cards show at most three Applies-to chips, then +N, with linked icons", () => {
  const r = fin("a", "Greataxe, Shove, Trip, Grapple, Disarm", { links: { greataxe: "Item.axe" } });
  const html = pageOf([r], { itemSummary: (uuid) => (uuid === "Item.axe" ? { name: "Greataxe", img: "axe.webp" } : null) });
  assert.equal(html.match(/class="an-fcard-chip"/g).length, 3);
  assert.match(html, /<span class="an-fcard-chip"><img src="axe\.webp" alt="">Greataxe<\/span>/);
  assert.match(html, /<span class="an-fcard-chip"><img src="icons\/svg\/item-bag\.svg" alt="">Shove<\/span>/);
  assert.match(html, /<span class="an-fcard-chip is-more">\+2<\/span>/);
  assert.doesNotMatch(html, /Grapple/);
  assert.doesNotMatch(pageOf([fin("a", "A, B")]), /is-more/);
  assert.match(pageOf([fin("a", "")]), /Not assigned yet/);
});

test("finisher cards keep the open action and add Edit and Duplicate quick actions", () => {
  const html = pageOf([fin("a", "X")]);
  assert.match(html, /<button type="button" data-action="select" data-id="a" class="an-fcard-open"/);
  assert.match(html, /<button type="button" data-action="select" data-id="a" class="an-fcard-quick">Edit<\/button>/);
  assert.match(html, /<button type="button" data-action="recipe-menu-duplicate" data-id="a" class="an-fcard-quick">Duplicate<\/button>/);
  assert.doesNotMatch(html, /<button[^>]*>(?:(?!<\/button>)[^])*<button/, "no button inside a button");
  assert.match(html, /<div class="an-grid an-fcard-grid">/);
});

test("presets are grouped Flung, In place and Pieces, covering every preset key exactly once", () => {
  assert.deepEqual(Object.keys(FINISHER_PRESET_GROUPS), ["Flung", "In place", "Pieces"]);
  const keys = Object.values(FINISHER_PRESET_GROUPS).flat();
  assert.deepEqual([...keys].sort(), Object.keys(FINISHER_PRESETS).sort());
  assert.equal(new Set(keys).size, keys.length);
  const html = pageOf([]);
  for (const [group, ids] of Object.entries(FINISHER_PRESET_GROUPS)) {
    assert.match(html, new RegExp(`<h3 class="an-preset-heading">${group}</h3>`));
    for (const id of ids) assert.equal(html.match(new RegExp(`data-preset="${id}"`, "g")).length, 1, id);
  }
  assert.match(html, /<button type="button" data-action="new-finisher" data-preset="launch" data-tooltip="Sent flying, crashes down in a cloud of dust\." class="an-preset-tile"><svg [^]*?<span>Launch<\/span><\/button>/);
  assert.match(html, /<button type="button" data-action="new-finisher" class="an-preset-tile is-blank">\+ Blank finisher<\/button>/);
});

test("the Finishers page has a sub-header, a compact default row with its hint, and a friendly empty state", () => {
  const html = pageOf([fin("a", "X")], { def: "a" });
  assert.match(html, /<div class="an-finishers-sub"><span>1 finisher<\/span><small>/);
  assert.match(html, /<label class="an-finisher-default"><span>Default finisher for other kills<\/span><select data-finisher-default>/);
  assert.match(html, /<p class="an-hint">Plays for NPC kills when no finisher matches the item\.<\/p>/);
  assert.match(pageOf([]), /<div class="an-empty an-finishers-empty">No finishers yet\. Pick a preset below or start blank\.<\/div>/);
  assert.doesNotMatch(html, /an-finishers-empty/);
});

test("the Finishers page escapes names, colours, players and items", () => {
  const r = { ...fin("a\"x", `<b>Shove</b>`, { players: ["u1"], links: { "<b>shove</b>": "Item.x" } }), name: "<img src=x onerror=1>", color: `#fff"><script>` };
  const html = pageOf([r], { players: [{ id: "u1", name: "<i>Ana</i>", color: `red"><script>` }], itemSummary: () => ({ name: "x", img: `"><script>` }) });
  assert.doesNotMatch(html, /<script>|<img src=x|<i>Ana|<b>Shove/);
  assert.match(html, /&lt;img src=x onerror=1&gt;/);
  assert.match(html, /data-id="a&quot;x"/);
});
