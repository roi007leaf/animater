import test from "node:test";
import assert from "node:assert/strict";
import { RecipePreview, fragmentPreviewParts } from "../scripts/recipe-preview.mjs";
import { recipeFrame } from "../scripts/choreography.mjs";
import { fragmentPieces } from "../scripts/fragments.mjs";

// A tiny DOM: enough elements for the preview to build, update and remove fragment pieces.
const element = (tag) => ({
  tagName: tag.toUpperCase(), style: {}, dataset: {}, children: [], parentNode: null, attrs: {},
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
  remove() { const p = this.parentNode; if (p) p.children.splice(p.children.indexOf(this), 1); this.parentNode = null; },
  setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return this.attrs[k] ?? null; },
});
const all = (node) => node.children.flatMap((c) => [c, ...all(c)]);

function fixture(stage, { info = {} } = {}) {
  const recipe = { stages: [{ kind: "motion", motion: "fragments", subject: "targets", delay: 0, duration: 1000, seed: 3, ...stage }] };
  const img = element("img");
  img.attrs.src = "goblin.webp";
  img.style.width = "55px"; img.style.height = "55px";
  const token = element("div");
  token.dataset.previewToken = "targets";
  token.classes = new Set();
  token.classList = { toggle: (c, on) => (on ? token.classes.add(c) : token.classes.delete(c)), remove: (c) => token.classes.delete(c) };
  token.ownerDocument = { createElement: element };
  token.querySelector = (selector) => (selector === "img" ? img : null);
  const scene = {
    dataset: { previewTokens: JSON.stringify({ targets: info }) },
    clientWidth: 400, clientHeight: 300,
    querySelectorAll: (selector) => (selector === "[data-preview-token]" ? [token] : []),
  };
  const player = new RecipePreview(scene, recipe, () => {});
  return { player, token, img, recipe, draw: (ms) => player.draw(recipeFrame(player.recipe, ms)) };
}
const pieces = (token) => all(token).filter((e) => e.dataset.fragmentPiece !== undefined);
const cuts = (token) => all(token).filter((e) => e.style.clipPath);

test("fragmentPreviewParts turns each piece into a clip-path polygon and a centroid origin in percent", () => {
  const stage = { kind: "motion", motion: "fragments", pattern: "halves", seed: 1 };
  const parts = fragmentPreviewParts(stage, 0);
  assert.equal(parts.length, 2);
  assert.equal(parts[0].clip, "polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)");
  assert.equal(parts[0].origin, "50% 25%");
  assert.equal(parts[1].origin, "50% 75%");
  const shards = fragmentPreviewParts({ ...stage, pattern: "shards", pieces: 6 }, 0.3);
  assert.equal(shards.length, fragmentPieces({ ...stage, pattern: "shards", pieces: 6 }, 0.3).length);
  for (const part of shards) {
    assert.match(part.clip, /^polygon\((-?[\d.]+% -?[\d.]+%)(, -?[\d.]+% -?[\d.]+%)+\)$/);
    assert.match(part.origin, /^-?[\d.]+% -?[\d.]+%$/);
    assert.ok(part.flight.keyframes.length, "each part carries its flight");
  }
});

test("a fragments stage at mid-progress draws its pieces as clipped copies and hides the token image", () => {
  const { token, img, draw } = fixture({ pattern: "shards", pieces: 5 });
  draw(500);
  const built = pieces(token);
  assert.equal(built.length, 5);
  assert.equal(cuts(token).length, 5, "every piece is clipped");
  assert.equal(img.style.visibility, "hidden");
  assert.ok(token.classes.has("is-fragmented"), "the token disc goes too");
  assert.notEqual(token.style.opacity, 0, "the token box stays visible so its pieces show");
  const copies = all(token).filter((e) => e.tagName === "IMG");
  assert.equal(copies.length, 5);
  assert.ok(copies.every((c) => c.getAttribute("src") === "goblin.webp"));
  assert.match(built[0].style.transform, /translate\(-?[\d.e-]+px,-?[\d.e-]+px\)/);
  assert.ok(Number(built[0].style.opacity) > 0);
  draw(600);
  assert.deepEqual(pieces(token), built, "pieces are built once per activation, then only moved");
});

test("pieces fly by the shared pose: moving away over the stage and in squares of the preview grid", () => {
  const { token, draw } = fixture({ pattern: "halves", spread: 1, fall: 0, spin: 0 });
  draw(50);
  const early = pieces(token).map((p) => p.style.transform);
  draw(700);
  const late = pieces(token).map((p) => p.style.transform);
  assert.notDeepEqual(late, early);
});

test("after a non-held stage the pieces are gone and the image shows again", () => {
  const { token, img, draw } = fixture({ pattern: "halves", delay: 100 });
  draw(600);
  assert.equal(pieces(token).length, 2);
  draw(1100);
  assert.equal(pieces(token).length, 0);
  assert.equal(img.style.visibility, "");
  assert.ok(!token.classes.has("is-fragmented"));
});

test("a held stage keeps the token image hidden after it ends, until stop", () => {
  const { player, token, img, draw } = fixture({ pattern: "halves", motionEnd: "hold" });
  draw(500);
  draw(1000);
  assert.equal(pieces(token).length, 0, "the faded pieces are removed");
  assert.equal(img.style.visibility, "hidden");
  player.stop();
  assert.equal(img.style.visibility, "");
});

test("rewinding before the stage removes the pieces and shows the image", () => {
  const { token, img, draw } = fixture({ pattern: "halves", delay: 200, duration: 800 });
  draw(600);
  assert.equal(pieces(token).length, 2);
  draw(0);
  assert.equal(pieces(token).length, 0);
  assert.equal(img.style.visibility, "");
});

test("the preview cut follows the stage's cutAngle, a fixed angle, or the attacker-to-target direction", () => {
  const { player } = fixture({ pattern: "halves" });
  const stage = player.recipe.stages[0];
  assert.equal(player.fragmentCutAngle(stage, "targets", 0), 0, "away from the attacker on the left");
  assert.equal(player.fragmentCutAngle({ ...stage, cutAngle: 1.2 }, "targets", 0), 1.2);
  assert.equal(player.fragmentCutAngle({ ...stage, cut: "fixed", angle: 90 }, "targets", 0), Math.PI / 2);
});

test("a mirrored, rotated token's pieces keep its mirroring and turn", () => {
  const { token, draw } = fixture({ pattern: "halves" }, { info: { textureScaleX: -1, rotation: 90 } });
  draw(500);
  const copy = all(token).find((e) => e.tagName === "IMG");
  assert.match(copy.style.transform, /scale\(-1,1\)/);
  assert.match(pieces(token)[0].style.transform, /rotate\(1\.5707963\d*rad\)/);
});

test("the chain preview cuts each target's own token, posed in its grid", () => {
  const recipe = { stages: [{ kind: "motion", motion: "fragments", subject: "targets", delay: 0, duration: 1000, seed: 3, pattern: "halves" }] };
  const tokens = ["source", "targets"].map((subject) => {
    const img = element("img"), token = element("div");
    img.attrs.src = `${subject}.webp`; img.style.width = "55px"; img.style.height = "55px";
    token.dataset.previewToken = subject;
    if (subject === "targets") token.dataset.targetIndex = "0";
    token.ownerDocument = { createElement: element };
    token.querySelector = (selector) => (selector === "img" ? img : null);
    return { token, img };
  });
  const scene = {
    dataset: { chainPreview: "", previewTokens: JSON.stringify({ source: {}, targets: {} }), previewWidth: "400", previewHeight: "300" },
    clientWidth: 400, clientHeight: 300, style: { setProperty() {} },
    querySelectorAll: (selector) => (selector === "[data-preview-token]" ? tokens.map((t) => t.token) : []),
  };
  const player = new RecipePreview(scene, recipe, () => {});
  player.draw(recipeFrame(player.recipe, 500));
  assert.equal(pieces(tokens[1].token).length, 2);
  assert.equal(tokens[1].img.style.visibility, "hidden");
  assert.equal(pieces(tokens[0].token).length, 0, "the caster stays whole");
  assert.equal(tokens[0].img.style.visibility, "");
});
