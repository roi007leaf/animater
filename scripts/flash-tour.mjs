// "Show me": a guided walkthrough in the Flash screens editor, at the GM's pace. Each step shows
// its caption, then a virtual mouse demonstrates it once on the real interface; Next moves on,
// Back returns to the step before (restoring the screen as it was) and Replay shows it again.
// Everything happens on a practice screen that is never saved. Stop, Esc or a click elsewhere
// ends it and puts the editor back as it was.
import { validateFlash } from "./flash-model.mjs";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const center = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
class Interrupted extends Error {}
export const FLASH_TOURS = Object.freeze({
  slide: { label: "A sliding title", detail: "Keyframes: move text across the screen." },
  signature: { label: "A signature move", detail: "An attack's big moment: background, band, letters, impact, linked to a recipe." },
});

export async function runFlashTour(editor, tour = "slide") {
  const w = editor.w, root = w.root;
  if (editor.touring) return;
  editor.touring = true;
  const saved = { selectedId: editor.selectedId, draft: editor.draft, dirty: editor.dirty, layerIndex: editor.layerIndex, time: editor.time, undo: editor.undoStack, redo: editor.redoStack };
  editor.selectedId = "tour-practice";
  editor.draft = validateFlash(tour === "signature"
    ? { id: "tour-practice", name: "Practice: Dragon's Fury", event: "start", duration: 3800, backdrop: { color: "#0a0303", opacity: 0.75, vignette: true }, layers: [] }
    : { id: "tour-practice", name: "Practice: a sliding title", duration: 3200, backdrop: { color: "#05040c", opacity: 0.7 }, layers: [] });
  editor.dirty = false; editor.layerIndex = 0; editor.time = 0; editor.undoStack = []; editor.redoStack = [];
  w.render();

  const cursor = document.createElement("div"), caption = document.createElement("div");
  cursor.className = "an-tour-cursor";
  cursor.innerHTML = `<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l15 11-6.5 1.2 3.8 6.8-2.6 1.4-3.8-6.9L5 20z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  caption.className = "an-tour-caption";
  document.body.append(cursor, caption);

  let run = 0, ended = false, finish;
  const done = new Promise((r) => { finish = r; });
  const end = () => { if (ended) return; ended = true; run++; finish(); };
  const onPointer = (e) => { if (e.isTrusted && !caption.contains(e.target)) end(); };
  const onKey = (e) => { if (e.key === "Escape") end(); };
  window.addEventListener("pointerdown", onPointer, { capture: true });
  window.addEventListener("keydown", onKey, { capture: true });

  // ---- the virtual hand (each demonstration has a run number; Back/Next/Replay/Stop interrupt it)
  let pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const place = (p, ms) => { cursor.style.transition = `transform ${ms}ms cubic-bezier(.4,.1,.2,1)`; cursor.style.transform = `translate(${p.x}px, ${p.y}px)`; pos = p; };
  place(pos, 0);
  const make = (id) => {
    const check = () => { if (id !== run) throw new Interrupted(); };
    const pause = async (ms) => { await wait(ms); check(); };
    const moveTo = async (p, ms = 1100) => { check(); place(p, ms); await pause(ms + 120); };
    const press = async () => { cursor.classList.add("is-down"); await pause(220); cursor.classList.remove("is-down"); };
    const click = async (selector) => {
      const el = root.querySelector(selector); if (!el) throw new Interrupted();
      el.scrollIntoView({ block: "nearest" }); await pause(150);
      await moveTo(center(el)); await press(); el.click(); await pause(500);
    };
    const frame = () => root.querySelector("[data-flash-stage]").getBoundingClientRect();
    const at = (x, y) => { const f = frame(); return { x: f.left + (x / 100) * f.width, y: f.top + (y / 100) * f.height }; };
    const drag = async (target, to, ms = 1600) => {
      if (!target) throw new Interrupted();
      const from = center(target);
      await moveTo(from);
      cursor.classList.add("is-down");
      target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: from.x, clientY: from.y, button: 0, pointerId: 1 }));
      const steps = 30;
      try {
        for (let i = 1; i <= steps; i++) {
          check();
          const p = { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps };
          place(p, ms / steps); await wait(ms / steps);
          window.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: p.x, clientY: p.y, button: 0, pointerId: 1 }));
        }
      } finally {
        window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: pos.x, clientY: pos.y, button: 0, pointerId: 1 }));
        cursor.classList.remove("is-down");
      }
      await pause(500);
    };
    const scrubTo = async (ms) => {
      const range = root.querySelector("[data-flash-time]"), r = range.getBoundingClientRect(), max = Number(range.max) || 1;
      const x = (t) => r.left + 8 + ((r.width - 16) * t) / max, y = r.top + r.height / 2;
      await moveTo({ x: x(editor.time), y }); cursor.classList.add("is-down");
      const from = editor.time, steps = 20;
      for (let i = 1; i <= steps; i++) {
        check();
        const t = from + ((ms - from) * i) / steps;
        place({ x: x(t), y }, 60); await wait(60);
        range.value = String(Math.round(t)); range.dispatchEvent(new Event("input", { bubbles: true }));
      }
      cursor.classList.remove("is-down"); await pause(400);
    };
    // A field on the inspector's other tab: click that tab first.
    const find = async (selector) => {
      let el = root.querySelector(selector);
      const tab = el ? null : /data-flash-field="(backdrop|duck|sound)/.test(selector) ? "screen" : /data-flash-(layer|key)-field/.test(selector) ? "layer" : null;
      if (tab) { await click(`[data-action="flash-tab"][data-tab="${tab}"]`); el = root.querySelector(selector); }
      if (!el) throw new Interrupted();
      return el;
    };
    const reach = async (selector) => {
      const el = await find(selector);
      el.scrollIntoView({ block: "nearest" }); await pause(150); await moveTo(center(el)); await press(); return el;
    };
    const choose = async (selector, value) => {
      const el = await reach(selector);
      el.value = value; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); await pause(600);
    };
    const tick = async (selector) => { const el = await reach(selector); el.click(); await pause(600); };
    const type = async (selector, words) => {
      const el = await reach(selector);
      el.value = "";
      for (const ch of words) { el.value += ch; el.dispatchEvent(new Event("input", { bubbles: true })); await pause(150); }
      el.dispatchEvent(new Event("change", { bubbles: true })); await pause(450);
    };
    // Drag a number field's label sideways, the way a hand scrubs a value.
    const scrubLabel = async (selector, dx) => {
      const input = await find(selector), label = input?.closest("label"); if (!label) throw new Interrupted();
      label.scrollIntoView({ block: "nearest" }); await pause(150);
      const r = label.getBoundingClientRect(), from = { x: r.left + 12, y: r.top + 6 };
      await moveTo(from); cursor.classList.add("is-down");
      label.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: from.x, clientY: from.y, button: 0, pointerId: 1 }));
      try {
        for (let i = 1; i <= 24; i++) { check(); const p = { x: from.x + (dx * i) / 24, y: from.y }; place(p, 45); await wait(45); window.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: p.x, clientY: p.y, button: 0, pointerId: 1 })); }
      } finally { window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: pos.x, clientY: pos.y, button: 0, pointerId: 1 })); cursor.classList.remove("is-down"); }
      await pause(500);
    };
    return { pause, moveTo, press, click, at, drag, scrubTo, choose, tick, type, scrubLabel };
  };
  const text = () => root.querySelector('[data-flash-stage] [data-flash-layer="0"] .an-flash-text');

  // ---- the steps: what the caption says, and what the hand shows
  const layerText = (index) => root.querySelector(`[data-flash-stage] [data-flash-layer="${index}"] .an-flash-text`);
  const slide = [
    { say: "Let's make a title slide across the screen. We'll practise on a scratch screen that is never saved. Press <b>Next</b> when you're ready.", show: async () => {} },
    { say: "First, add a text layer with <b>+ Text</b>.", show: async (h) => { await h.click('[data-action="flash-add"][data-kind="text"]'); } },
    { say: "Type your words in the inspector's <b>Text</b> box.", show: async (h) => { await h.type('textarea[data-flash-layer-field="text"]', "CHARGE!"); } },
    { say: "Move the playhead (the slider under the stage) to where the motion should <b>start</b>, then drag the text to its starting spot on the left.", show: async (h) => { await h.scrubTo(400); await h.drag(text(), h.at(20, 50)); } },
    { say: "Click <b>◆ Add keyframe</b> (or press <b>K</b>). It pins the text here, at this moment.", show: async (h) => { await h.click('[data-action="flash-key-add"]'); } },
    { say: "Move the playhead to where the motion should <b>end</b>, and drag the text to the right. The layer already has a keyframe, so this adds a second one here.", show: async (h) => { await h.scrubTo(2400); await h.drag(text(), h.at(80, 50)); } },
    { say: "The two <b>◆</b> on the layer's row are the keyframes. The text glides between them. Drag a ◆ along the row to change its timing.", show: async (h) => {
      for (const k of root.querySelectorAll(".an-flash-row.is-selected .an-flash-key")) { k.scrollIntoView({ block: "nearest" }); await h.moveTo(center(k), 900); await h.pause(500); }
    } },
    { say: "Press <b>▶ Preview</b> (or Space) to watch it. Keyframes can also scale (corner handle), turn (round handle) and fade (mouse wheel).", show: async (h) => { await h.click('[data-action="flash-preview"]'); } },
    { say: "That's it! Use <b>+ New flash screen</b> to make your own. Press <b>Finish</b> and the practice screen goes away.", show: async () => {} },
  ];
  const signature = [
    { say: "Let's build a <b>signature move</b>: a card that plays right before an attack, spell or ability animation, with its name filled in. Practice screen, never saved. Press <b>Next</b>.", show: async () => {} },
    { say: "Set <b>Plays at</b> to <b>Before an animation</b>, so recipes can use it.", show: async (h) => { await h.choose('select[data-flash-field="event"]', "action"); } },
    { say: "In <b>Screen</b>, pick an animated background (<b>Ember fog</b>) and turn on <b>Cinematic bars</b>.", show: async (h) => {
      await h.choose('select[data-flash-field="backdrop.media"]', "jb2a.ambient_fog.001.loop.large.orangeyellow");
      await h.tick('input[data-flash-field="backdrop.bars"]');
    } },
    { say: "Add a <b>+ Band</b>: the slanted stripe the title sits on. Give it a deep red.", show: async (h) => {
      await h.click('[data-action="flash-add"][data-kind="band"]');
      await h.choose('input[data-flash-layer-field="color"]', "#7a1400");
    } },
    { say: "Add <b>+ Text</b> and type <b>{action}</b>. When the card plays it becomes the attack's name: here it shows a sample, “Dragon's Fury”.", show: async (h) => {
      await h.click('[data-action="flash-add"][data-kind="text"]');
      await h.type('textarea[data-flash-layer-field="text"]', "{action}");
    } },
    { say: "Make it big: <b>drag the Size label</b> to the right (any number label can be dragged like this).", show: async (h) => { await h.scrubLabel('input[data-flash-layer-field="size"]', 110); } },
    { say: "Tick <b>Gradient to</b> for a hot fill, and set <b>Letters one by one</b> so each letter slams in.", show: async (h) => {
      await h.tick('input[data-flash-layer-field="gradient"]');
      await h.type('input[data-flash-layer-field="letters"]', "45");
    } },
    { say: "Move the playhead to where the last letter lands and add <b>+ Flash</b> and <b>+ Shake</b>: they hit at the playhead.", show: async (h) => {
      await h.scrubTo(1100);
      await h.click('[data-action="flash-add"][data-kind="flash"]');
      await h.click('[data-action="flash-add"][data-kind="shake"]');
    } },
    { say: "Add one more <b>+ Text</b> with <b>{name}</b> (who uses the move), and drag it under the title.", show: async (h) => {
      await h.click('[data-action="flash-add"][data-kind="text"]');
      await h.type('textarea[data-flash-layer-field="text"]', "{name}");
      await h.scrubTo(2400);
      await h.drag(layerText(editor.layerIndex), h.at(50, 66));
    } },
    { say: "Press <b>▶ Preview</b> to watch it.", show: async (h) => { await h.click('[data-action="flash-preview"]'); } },
    { say: "To use it: open a recipe in the Studio, click its trigger (⚙ <b>Recipe settings</b>) and pick it under <b>Flash screen first</b>. It plays for everyone right before that animation.", show: async (h) => {
      const recipes = root.querySelector('[data-action="page"][data-page="recipes"]'); if (recipes) { await h.moveTo(center(recipes)); await h.pause(900); }
    } },
    { say: "Done! Press <b>Finish</b> and the practice screen goes away.", show: async () => {} },
  ];
  const steps = tour === "signature" ? signature : slide;
  const snapshots = [];
  const snap = () => ({ draft: JSON.stringify(editor.draft), time: editor.time, layerIndex: editor.layerIndex });
  const restore = (s) => {
    editor.preview?.stop(); editor.playing = false;
    Object.assign(editor, { draft: JSON.parse(s.draft), time: s.time, layerIndex: s.layerIndex, dirty: false });
    w.render();
  };
  let index = 0;
  const go = async (i, { replay = false } = {}) => {
    const id = ++run;
    index = i;
    if (replay || snapshots[i]) restore(snapshots[i]); else snapshots[i] = snap();
    caption.innerHTML = `<span class="an-tour-step">Step ${i + 1} of ${steps.length}</span><span class="an-tour-text">${steps[i].say}</span><span class="an-tour-nav"><button type="button" data-tour="back" ${i === 0 ? "disabled" : ""}>‹ Back</button><button type="button" data-tour="replay" title="Show this step again">↺</button><button type="button" data-tour="next" class="is-primary" disabled title="Available once this step has been shown">${i === steps.length - 1 ? "Finish" : "Next ›"}</button><button type="button" data-tour="stop" title="Stop the guide">✕</button></span>`;
    caption.querySelector('[data-tour="back"]').onclick = () => void go(index - 1, { replay: true });
    caption.querySelector('[data-tour="replay"]').onclick = () => void go(index, { replay: true });
    caption.querySelector('[data-tour="next"]').onclick = () => { if (index === steps.length - 1) return end(); void go(index + 1); };
    caption.querySelector('[data-tour="stop"]').onclick = end;
    // Next waits until the step has been shown, so a step is never left half done.
    try { await wait(700); if (id === run) await steps[i].show(make(id)); } catch (error) { if (!(error instanceof Interrupted)) end(); }
    if (id === run) { const next = caption.querySelector('[data-tour="next"]'); if (next) { next.disabled = false; next.removeAttribute("title"); } }
  };
  void go(0);
  await done;

  window.removeEventListener("pointerdown", onPointer, { capture: true });
  window.removeEventListener("keydown", onKey, { capture: true });
  cursor.remove(); caption.remove();
  editor.preview?.stop(); editor.playing = false;
  Object.assign(editor, { selectedId: saved.selectedId, draft: saved.draft, dirty: saved.dirty, layerIndex: saved.layerIndex, time: saved.time, undoStack: saved.undo, redoStack: saved.redo });
  editor.touring = false;
  w.render();
}
