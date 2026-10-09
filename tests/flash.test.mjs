import test from "node:test";
import assert from "node:assert/strict";
import { validateFlash, validateFlashes, chooseFlash, fillText, STARTER_FLASHES, FLASH_LIMIT } from "../scripts/flash-model.mjs";
import { layerKeyframes } from "../scripts/flash-render.mjs";

test("flash screens are cleaned: limits, kinds, safe media only", () => {
  const s = validateFlash({ name: "  ", duration: 99999, layers: [
    { kind: "text", text: "Hi", size: 500, x: 999 },
    { kind: "image", src: "https://evil.example/x.png" },
    { kind: "image", src: "modules/my-art/title.webm" },
    { kind: "image", src: "jb2a.impact.001.orange" },
    { kind: "bogus" },
  ] });
  assert.equal(s.name, "Untitled flash");
  assert.equal(s.duration, 12000);
  assert.deepEqual([s.layers[0].size, s.layers[0].x], [40, 120]);
  assert.equal(s.layers[1].src, "", "no outside URLs");
  assert.equal(s.layers[2].src, "modules/my-art/title.webm");
  assert.equal(s.layers[3].src, "jb2a.impact.001.orange", "Sequencer keys are allowed");
  assert.equal(s.layers[4].kind, "text");
  assert.equal(validateFlashes(Array(FLASH_LIMIT + 5).fill({})).length, FLASH_LIMIT);
  assert.ok(STARTER_FLASHES.some((f) => f.event === "start") && STARTER_FLASHES.some((f) => f.event === "end"));
});

test("a combat's pick wins, then the default; random and none work; event must fit", () => {
  const screens = [validateFlash({ id: "a", event: "start" }), validateFlash({ id: "b", event: "end" }), validateFlash({ id: "c", event: "any" })];
  assert.equal(chooseFlash(screens, "start", "c", "a").id, "c");
  assert.equal(chooseFlash(screens, "start", undefined, "a").id, "a");
  assert.equal(chooseFlash(screens, "start", "none", "a"), null);
  assert.equal(chooseFlash(screens, "start", undefined, "none"), null);
  assert.equal(chooseFlash(screens, "start", "random", "a", () => 0.99).id, "c");
  assert.equal(chooseFlash(screens, "end", "random", null, () => 0).id, "b");
  assert.equal(chooseFlash(screens, "start", "deleted-id", "a").id, "a", "a deleted pick falls back to the default");
});

test("text placeholders and layer keyframes", () => {
  assert.equal(fillText("Battle at {scene}, round {round}", { scene: "Landing", round: "1" }), "Battle at Landing, round 1");
  const layer = validateFlash({ duration: 4000, layers: [{ kind: "text", start: 1000, duration: 2000, enter: "slam", enterMs: 400, exit: "fade", exitMs: 400, shake: true }] }).layers[0];
  const frames = layerKeyframes(layer, 4000);
  assert.ok(frames.every((f, i) => i === 0 || f.offset >= frames[i - 1].offset), "offsets never go backwards");
  assert.equal(frames[0].opacity, 0, "hidden before it starts");
  assert.equal(frames.at(-1).opacity, 0, "hidden after it ends");
  assert.ok(frames.some((f) => f.offset === 0.25), "starts at 1s of 4s");
});

test("keyframes: held outside, eased between, and drawn relative to the layer's place", async () => {
  const { keyValueAt } = await import("../scripts/flash-model.mjs");
  const { motionKeyframes, loopTiming } = await import("../scripts/flash-render.mjs");
  const layer = validateFlash({ duration: 4000, layers: [{ kind: "text", x: 50, y: 50, keyEase: "linear", loop: "pulse", loopMs: 500, start: 1000, duration: 2000,
    keys: [{ at: 2000, x: 80, y: 50, scale: 2 }, { at: 0, x: 20, y: 50 }] }] }).layers[0];
  assert.deepEqual(layer.keys.map((k) => k.at), [0, 2000], "sorted by time");
  assert.equal(keyValueAt(layer, 1000).x, 50, "halfway, linear");
  assert.equal(keyValueAt(layer, 3500).x, 80, "held after the last keyframe");
  assert.equal(keyValueAt({ ...layer, keyEase: "smooth" }, 500).x < 35, true, "smooth starts slow");
  const frames = motionKeyframes(layer, 4000);
  assert.match(frames[1].transform, /translate\(-30\.00cqw, 0\.00cqh\)/);
  assert.match(frames.at(-1).transform, /scale\(2\)/);
  assert.equal(motionKeyframes({ ...layer, keys: [] }, 4000), null);
  const loop = loopTiming(layer, 4000);
  assert.deepEqual([loop.options.delay, loop.options.duration, loop.options.iterations], [1000, 500, 4]);
});

test("sound layers keep a safe audio file and volume", () => {
  const [ok, bad] = validateFlash({ layers: [{ kind: "sound", file: "sounds/drums.ogg", volume: 3, start: 500 }, { kind: "sound", file: "http://x/y.ogg" }] }).layers;
  assert.deepEqual([ok.file, ok.volume, ok.start], ["sounds/drums.ogg", 1, 500]);
  assert.equal(bad.file, "");
});

test("impacts: shakes fade out, flashes peak fast, letters arrive one after another", async () => {
  const { shakeKeyframes, screenFlashKeyframes, letterKeyframes } = await import("../scripts/flash-render.mjs");
  const s = validateFlash({ duration: 4000, layers: [{ kind: "shake", start: 1000, strength: 2 }, { kind: "flash", start: 1000 }, { kind: "text", text: "GO", start: 500, letters: 100 }] });
  assert.deepEqual([s.layers[0].duration, s.layers[1].duration], [450, 300], "short by default");
  const shake = shakeKeyframes(s.layers, 4000);
  assert.ok(shake.every((f, i) => i === 0 || f.offset >= shake[i - 1].offset));
  assert.equal(shake.at(-1).transform, "none");
  const amp = (f) => Math.abs(Number(/translate\(([-\d.]+)/.exec(f.transform)?.[1] ?? 0));
  const moves = shake.filter((f) => f.transform !== "none");
  assert.ok(amp(moves[0]) > amp(moves.at(-1)), "the jolt dies down");
  const flash = screenFlashKeyframes(s.layers[1], 4000);
  assert.equal(Math.max(...flash.map((f) => f.opacity)), 0.85);
  const second = letterKeyframes(s.layers[2], 1, 4000);
  assert.equal(second[1].offset, 0.15, "the second letter starts 100ms after the first");
  assert.equal(shakeKeyframes([], 4000), null);
});

test("starters show off the impacts", () => {
  const boss = STARTER_FLASHES.find((f) => f.id === "start-boss");
  assert.ok(boss && boss.backdrop.bars);
  assert.ok(["flash", "shake"].every((k) => boss.layers.some((l) => l.kind === k)));
  assert.ok(STARTER_FLASHES.find((f) => f.id === "start-initiative").layers.some((l) => l.letters > 0 && l.gradient));
});

test("portraits come from the encounter: party, enemies, never the hidden", async () => {
  const { portraitPeople } = await import("../scripts/flash-model.mjs");
  const { encounterPeople } = await import("../scripts/flash-combat.mjs");
  const c = (name, disposition, extra = {}) => ({ name, hidden: false, token: { disposition, hidden: false, texture: { src: `${name}.webp` } }, actor: { img: `${name}-art.webp`, hasPlayerOwner: false }, ...extra });
  const people = encounterPeople({ combatants: [
    c("Ed", 1), c("Silva", 0, { actor: { img: "s.webp", hasPlayerOwner: true } }), c("Orc", -1), c("Spy", -1, { hidden: true }), c("Bystander", 0),
  ] });
  assert.deepEqual(people.map((p) => `${p.name}:${p.side}`), ["Ed:party", "Silva:party", "Orc:enemies", "Bystander:other"]);
  const layer = validateFlash({ layers: [{ kind: "portraits", side: "enemies", max: 5 }] }).layers[0];
  assert.deepEqual(portraitPeople(layer, people).map((p) => p.name), ["Orc"]);
  assert.equal(portraitPeople({ ...layer, side: "all", max: 2 }, people).length, 2);
  assert.ok(STARTER_FLASHES.find((f) => f.id === "start-faceoff").layers.filter((l) => l.kind === "portraits").length === 2);
});

test("moments: who fell decides enemy defeated, last enemy standing or party member down", async () => {
  const { downMoment } = await import("../scripts/flash-combat.mjs");
  const who = (id, disposition, hp, owner = false) => ({ actor: { id, hasPlayerOwner: owner, system: { attributes: { hp: { value: hp } } } }, token: { disposition }, defeated: false });
  const orcA = who("a", -1, 0), orcB = who("b", -1, 5), orcC = who("c", -1, 7), hero = who("h", 1, 0, true);
  const combat = (list) => ({ started: true, combatants: list });
  assert.equal(downMoment(combat([orcA, orcB, orcC, hero]), orcA.actor), "enemyDown");
  assert.equal(downMoment(combat([orcA, orcB, hero]), orcA.actor), "lastEnemy");
  assert.equal(downMoment(combat([orcA, hero]), orcA.actor), null, "the last enemy falling is the combat's ending, not a moment");
  assert.equal(downMoment(combat([orcA, hero]), hero.actor), "partyDown");
  assert.equal(downMoment({ started: false, combatants: [orcA, orcB] }, orcA.actor), null);
});

test("boss spotlight, {boss} and {name}, backgrounds, and moment screens never stand in for start or end", async () => {
  const { portraitPeople, bossOf, chooseFlash } = await import("../scripts/flash-model.mjs");
  const people = [{ name: "Goblin", side: "enemies", level: 1 }, { name: "Dragon", side: "enemies", level: 9 }, { name: "Hero", side: "party", level: 12 }];
  assert.equal(bossOf(people).name, "Dragon", "the party never counts as the boss");
  const boss = validateFlash({ layers: [{ kind: "portraits", side: "boss" }] }).layers[0];
  assert.deepEqual(portraitPeople(boss, people).map((p) => p.name), ["Dragon"]);
  assert.equal(fillText("{boss} vs {name}", { combatants: people, name: "Ed" }), "Dragon vs Ed");
  const s = validateFlash({ duck: false, backdrop: { media: "jb2a.darkness.black", mediaOpacity: 2 } });
  assert.deepEqual([s.backdrop.media, s.backdrop.mediaOpacity, s.duck], ["jb2a.darkness.black", 1, false]);
  assert.equal(validateFlash({ backdrop: { media: "https://x.com/a.webm" } }).backdrop.media, "");
  const screens = [validateFlash({ id: "any", event: "any" }), validateFlash({ id: "r", event: "round" })];
  assert.equal(chooseFlash(screens, "round", undefined, "random", () => 0).id, "r", "start-or-end screens don't play on new rounds");
  assert.equal(chooseFlash(screens, "start", undefined, "random", () => 0).id, "any");
  assert.ok(["round", "crit", "lastEnemy"].every((e) => STARTER_FLASHES.some((f) => f.event === e)));
});

test("portraits can be arranged in rows: 2 per row makes 2 above 2", () => {
  const layer = validateFlash({ layers: [{ kind: "portraits", side: "all", perRow: 2, max: 6 }] }).layers[0];
  assert.equal(layer.perRow, 2);
  assert.equal(validateFlash({ layers: [{ kind: "portraits", perRow: 99 }] }).layers[0].perRow, 12);
  assert.equal(validateFlash({ layers: [{ kind: "portraits" }] }).layers[0].perRow, 0, "one line by default");
});

test("the flash editor page renders a screen with layers, keyframes and the timeline grips", async () => {
  const { FlashEditor } = await import("../scripts/flash-editor.mjs");
  const screens = [validateFlash({ id: "s", name: "Test", layers: [
    { kind: "text", text: "HI", keys: [{ at: 500, x: 40, y: 50 }] }, { kind: "band" }, { kind: "sound", file: "a.ogg" }, { kind: "shake", start: 300 },
  ] })];
  const host = { flashScreens: () => screens, flashDefaults: () => ({}), flashFonts: () => ["Signika"], flashVars: () => ({}) };
  const ed = new FlashEditor({ host, page: "recipes", root: null });
  const html = ed.html();
  assert.match(html, /an-flash-row-bar kind-text/);
  assert.match(html, /data-flash-part="enter"/, "entrance grip on visual layers");
  assert.match(html, /data-flash-part="start"/);
  assert.match(html, /an-flash-key/, "keyframe diamonds");
  assert.match(html, /data-action="flash-align"/);
  assert.ok(!/kind-sound[^>]*>[^<]*<span class="an-flash-grip is-start"/.test(html), "sound bars only move");
});

test("{action} names the attack, spell or ability a screen plays before", () => {
  assert.equal(fillText("{name} uses {action}!", { name: "Ed", action: "Fireball" }), "Ed uses Fireball!");
  assert.equal(validateFlash({ event: "action" }).event, "action");
});

test("a Signature Move starter is ready to put before an animation", () => {
  const sig = STARTER_FLASHES.find((f) => f.id === "action-signature");
  assert.equal(sig.event, "action");
  assert.ok(sig.layers.some((l) => l.kind === "text" && l.text === "{action}"));
});

test("new layer kinds: speed lines, burst, slash, particles and a camera punch are cleaned", async () => {
  const s = validateFlash({ layers: [
    { kind: "lines", density: 999, clear: -5 }, { kind: "burst" }, { kind: "slash", height: 99 },
    { kind: "particles", ptype: "snow", count: 9999 }, { kind: "particles", ptype: "nope", direction: "sideways" },
    { kind: "punch", strength: 9 }, { kind: "image", blend: "add" }, { kind: "image", blend: "weird" },
  ] });
  const [lines, burst, slash, snow, odd, punch, glow, plain] = s.layers;
  assert.equal(lines.density, 90); assert.equal(lines.clear, 0);
  assert.equal(burst.kind, "burst"); assert.equal(slash.height, 30);
  assert.deepEqual([snow.count, snow.direction, snow.color], [150, "down", "#ffffff"], "snow falls by default");
  assert.deepEqual([odd.ptype, odd.direction], ["embers", "up"], "embers rise");
  assert.deepEqual([punch.strength, punch.duration], [1.6, 350]);
  assert.equal(glow.blend, "add"); assert.equal(plain.blend, "normal");
  const { punchKeyframes, particleSpecs, particleKeyframes } = await import("../scripts/flash-render.mjs");
  const frames = punchKeyframes(s.layers, s.duration);
  assert.ok(frames.some((f) => f.transform === "scale(1.6)"), "the punch zooms in");
  const specs = particleSpecs(snow, s.duration);
  assert.equal(specs.length, 150);
  assert.deepEqual(particleSpecs(snow, s.duration)[3], specs[3], "the same layer always looks the same");
  const path = particleKeyframes(snow, specs[0]);
  assert.match(path[0].transform, /-6\.00cqh/); assert.match(path.at(-1).transform, /106\.00cqh/, "snow travels top to bottom");
});

test("text: words one by one, keyframed colour and glow, outline entrance", async () => {
  const { colorKeyframes, outlineKeyframes, wordKeyframes } = await import("../scripts/flash-render.mjs");
  const s = validateFlash({ layers: [{ kind: "text", text: "Burn them all", words: 120, enter: "outline", glowSize: 2, keys: [{ at: 0, color: "#ff0000" }, { at: 1000, glow: "#00ff00" }, { at: 1500, color: "bad" }] }] });
  const t = s.layers[0];
  assert.equal(t.words, 120); assert.equal(t.enter, "outline");
  assert.equal(t.keys[0].color, "#ff0000"); assert.equal(t.keys[2].color, undefined, "bad colours are dropped");
  const colors = colorKeyframes(t, s.duration);
  assert.equal(colors[1].color, "#ff0000"); assert.equal(colors[2].color, t.color, "keys without a colour keep the layer colour");
  assert.match(colors[2].textShadow, /#00ff00/);
  assert.ok(outlineKeyframes(t, s.duration).line.length > 2);
  assert.equal(wordKeyframes(t, 2, s.duration)[1].offset, (t.start + 240) / s.duration);
  assert.equal(colorKeyframes(validateFlash({ layers: [{ kind: "text" }] }).layers[0], 3000), null);
});

test("cut-in: an actor portrait shows the one using the action; scenes can freeze", async () => {
  const { portraitPeople } = await import("../scripts/flash-model.mjs");
  const layer = validateFlash({ layers: [{ kind: "portraits", side: "actor", shape: "slash" }] }).layers[0];
  assert.deepEqual([layer.side, layer.shape], ["actor", "slash"]);
  assert.deepEqual(portraitPeople(layer, [{ name: "X", side: "party" }], { name: "Ed" }).map((p) => p.name), ["Ed"]);
  assert.deepEqual(portraitPeople(layer, [{ name: "X", side: "party" }]), []);
  assert.equal(validateFlash({ backdrop: { freeze: "grey" } }).backdrop.freeze, "grey");
  assert.equal(validateFlash({ backdrop: { freeze: "melt" } }).backdrop.freeze, "normal");
});

test("editor: inspector tabs, slim library, row icons and hide, effects menu, template gallery", async () => {
  const { FlashEditor } = await import("../scripts/flash-editor.mjs");
  const screens = [validateFlash({ id: "s", name: "Test", layers: [{ kind: "text", text: "HI" }, { kind: "particles" }, { kind: "punch" }] })];
  const host = { flashScreens: () => screens, flashDefaults: () => ({}), flashFonts: () => ["Signika"], flashVars: () => ({}) };
  const ed = new FlashEditor({ host, page: "recipes", root: null, render() {} });
  let html = ed.html();
  assert.match(html, /data-action="flash-tab" data-tab="layer"[^>]*aria-selected="true"/);
  assert.doesNotMatch(html, /backdrop\.freeze/, "screen settings wait on their tab");
  assert.match(html, /an-flash-row-icon kind-particles/);
  assert.match(html, /data-action="flash-eye"/);
  assert.match(html, /data-action="flash-effects"/);
  await ed.action("flash-tab", { dataset: { tab: "screen" } });
  assert.match(ed.html(), /data-flash-field="backdrop.freeze"/);
  await ed.action("flash-lib", { dataset: {} });
  assert.match(ed.html(), /an-flash-list is-slim/);
  await ed.action("flash-full", { dataset: {} });
  assert.match(ed.html(), /an-flash-page is-slim is-full/);
  await ed.action("flash-new", { dataset: {} });
  html = ed.html();
  assert.match(html, /data-action="flash-new-from" data-id="blank"/);
  assert.match(html, /data-flash-thumb="start-boss"/);
  ed.layerIndex = 0; ed.tab = "layer"; ed.showGallery = false;
  html = ed.html();
  assert.match(html, /data-flash-layer-field="words"/);
  assert.match(html, /data-flash-layer-field="blend"/);
});
