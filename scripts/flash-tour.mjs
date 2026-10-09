// "Show me": a guided walkthrough in the Flash screens editor, at the GM's pace. Each step shows
// its caption, then a virtual mouse demonstrates it once on the real interface; Next moves on,
// Back returns to the step before (restoring the screen as it was) and Replay shows it again.
// Everything happens on a practice screen that is never saved. Stop, Esc or a click elsewhere
// ends it and puts the editor back as it was.
import { validateFlash } from "./flash-model.mjs";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const center = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
class Interrupted extends Error {}

export async function runFlashTour(editor) {
  const w = editor.w, root = w.root;
  if (editor.touring) return;
  editor.touring = true;
  const saved = { selectedId: editor.selectedId, draft: editor.draft, dirty: editor.dirty, layerIndex: editor.layerIndex, time: editor.time, undo: editor.undoStack, redo: editor.redoStack };
  editor.selectedId = "tour-practice";
  editor.draft = validateFlash({ id: "tour-practice", name: "Practice: a sliding title", duration: 3200, backdrop: { color: "#05040c", opacity: 0.7 }, layers: [] });
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
    return { pause, moveTo, press, click, at, drag, scrubTo };
  };
  const text = () => root.querySelector('[data-flash-stage] [data-flash-layer="0"] .an-flash-text');

  // ---- the steps: what the caption says, and what the hand shows
  const steps = [
    { say: "Let's make a title slide across the screen. We'll practise on a scratch screen that is never saved. Press <b>Next</b> when you're ready.", show: async () => {} },
    { say: "First, add a text layer with <b>+ Text</b>.", show: async (h) => { await h.click('[data-action="flash-add"][data-kind="text"]'); } },
    { say: "Type your words in the inspector's <b>Text</b> box.", show: async (h) => {
      const field = root.querySelector('textarea[data-flash-layer-field="text"]');
      if (!field) throw new Interrupted();
      field.scrollIntoView({ block: "nearest" }); await h.pause(200);
      await h.moveTo(center(field)); await h.press();
      field.value = "";
      for (const ch of "CHARGE!") { field.value += ch; field.dispatchEvent(new Event("input", { bubbles: true })); await h.pause(180); }
      field.dispatchEvent(new Event("change", { bubbles: true })); await h.pause(400);
    } },
    { say: "Move the playhead (the slider under the stage) to where the motion should <b>start</b>, then drag the text to its starting spot on the left.", show: async (h) => { await h.scrubTo(400); await h.drag(text(), h.at(20, 50)); } },
    { say: "Click <b>◆ Add keyframe</b> (or press <b>K</b>). It pins the text here, at this moment.", show: async (h) => { await h.click('[data-action="flash-key-add"]'); } },
    { say: "Move the playhead to where the motion should <b>end</b>, and drag the text to the right. The layer already has a keyframe, so this adds a second one here.", show: async (h) => { await h.scrubTo(2400); await h.drag(text(), h.at(80, 50)); } },
    { say: "The two <b>◆</b> on the layer's row are the keyframes. The text glides between them. Drag a ◆ along the row to change its timing.", show: async (h) => {
      for (const k of root.querySelectorAll(".an-flash-row.is-selected .an-flash-key")) { k.scrollIntoView({ block: "nearest" }); await h.moveTo(center(k), 900); await h.pause(500); }
    } },
    { say: "Press <b>▶ Preview</b> (or Space) to watch it. Keyframes can also scale (corner handle), turn (round handle) and fade (mouse wheel).", show: async (h) => { await h.click('[data-action="flash-preview"]'); } },
    { say: "That's it! Use <b>+ New flash screen</b> to make your own. Press <b>Finish</b> and the practice screen goes away.", show: async () => {} },
  ];
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
    caption.innerHTML = `<span class="an-tour-step">Step ${i + 1} of ${steps.length}</span><span class="an-tour-text">${steps[i].say}</span><span class="an-tour-nav"><button type="button" data-tour="back" ${i === 0 ? "disabled" : ""}>‹ Back</button><button type="button" data-tour="replay" title="Show this step again">↺</button><button type="button" data-tour="next" class="is-primary">${i === steps.length - 1 ? "Finish" : "Next ›"}</button><button type="button" data-tour="stop" title="Stop the guide">✕</button></span>`;
    caption.querySelector('[data-tour="back"]').onclick = () => void go(index - 1, { replay: true });
    caption.querySelector('[data-tour="replay"]').onclick = () => void go(index, { replay: true });
    caption.querySelector('[data-tour="next"]').onclick = () => {
      if (index === steps.length - 1) return end();
      run++; // stop any demonstration still running, keep its result
      void go(index + 1);
    };
    caption.querySelector('[data-tour="stop"]').onclick = end;
    try { await wait(700); if (id === run) await steps[i].show(make(id)); } catch (error) { if (!(error instanceof Interrupted)) end(); }
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
