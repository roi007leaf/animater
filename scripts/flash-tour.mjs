// "Show me": a narrated walkthrough in the Flash screens editor. A virtual mouse moves over the
// real interface and does each step (add text, place it, keyframe, move, keyframe, preview) on a
// scratch screen that is never saved. Any real click or Esc stops it and puts the editor back.
import { validateFlash } from "./flash-model.mjs";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const center = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

export async function runFlashTour(editor) {
  const w = editor.w, root = w.root;
  if (editor.touring) return;
  editor.touring = true;
  const saved = { selectedId: editor.selectedId, draft: editor.draft, dirty: editor.dirty, layerIndex: editor.layerIndex, time: editor.time, undo: editor.undoStack, redo: editor.redoStack };
  // The scratch screen: not in the library, so Save can't add it.
  editor.selectedId = "tour-practice";
  editor.draft = validateFlash({ id: "tour-practice", name: "Practice: a sliding title", duration: 3200, backdrop: { color: "#05040c", opacity: 0.7 }, layers: [] });
  editor.dirty = false; editor.layerIndex = 0; editor.time = 0; editor.undoStack = []; editor.redoStack = [];
  w.render();

  const cursor = document.createElement("div"), caption = document.createElement("div");
  cursor.className = "an-tour-cursor";
  cursor.innerHTML = `<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l15 11-6.5 1.2 3.8 6.8-2.6 1.4-3.8-6.9L5 20z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  caption.className = "an-tour-caption";
  document.body.append(cursor, caption);
  let stopped = false;
  const stop = () => { stopped = true; };
  const onPointer = (e) => { if (e.isTrusted && !caption.contains(e.target)) stop(); };
  const onKey = (e) => { if (e.key === "Escape") stop(); };
  window.addEventListener("pointerdown", onPointer, { capture: true });
  window.addEventListener("keydown", onKey, { capture: true });
  const check = () => { if (stopped) throw new Error("stopped"); };
  let pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const place = (p, ms) => { cursor.style.transition = `transform ${ms}ms cubic-bezier(.4,.1,.2,1)`; cursor.style.transform = `translate(${p.x}px, ${p.y}px)`; pos = p; };
  place(pos, 0);
  const say = (step, total, text) => { caption.innerHTML = `<span class="an-tour-step">Step ${step} of ${total}</span><span>${text}</span><button type="button" data-tour-stop>Stop</button>`; caption.querySelector("[data-tour-stop]").onclick = stop; };
  const moveTo = async (p, ms = 700) => { check(); place(p, ms); await wait(ms + 80); check(); };
  const press = async () => { cursor.classList.add("is-down"); await wait(140); cursor.classList.remove("is-down"); };
  const click = async (selector) => {
    const el = root.querySelector(selector); if (!el) throw new Error(`missing ${selector}`);
    el.scrollIntoView({ block: "nearest" }); await wait(120);
    await moveTo(center(el)); await press(); el.click(); await wait(350); check();
  };
  const frame = () => root.querySelector("[data-flash-stage]").getBoundingClientRect();
  const at = (x, y) => { const f = frame(); return { x: f.left + (x / 100) * f.width, y: f.top + (y / 100) * f.height }; };
  // Drag the way a hand would: press, glide, release (the editor's own drag code does the work).
  const drag = async (target, to, ms = 900) => {
    const from = center(target);
    await moveTo(from);
    cursor.classList.add("is-down");
    target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: from.x, clientY: from.y, button: 0, pointerId: 1 }));
    const steps = 18;
    for (let i = 1; i <= steps; i++) {
      check();
      const p = { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps };
      place(p, ms / steps); await wait(ms / steps);
      window.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: p.x, clientY: p.y, button: 0, pointerId: 1 }));
    }
    window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: to.x, clientY: to.y, button: 0, pointerId: 1 }));
    cursor.classList.remove("is-down"); await wait(400); check();
  };
  // Slide the playhead to a time.
  const scrubTo = async (ms) => {
    const range = root.querySelector("[data-flash-time]"), r = range.getBoundingClientRect(), max = Number(range.max) || 1;
    const x = (t) => r.left + 8 + ((r.width - 16) * t) / max, y = r.top + r.height / 2;
    await moveTo({ x: x(editor.time), y }); cursor.classList.add("is-down");
    const from = editor.time, steps = 12;
    for (let i = 1; i <= steps; i++) {
      check();
      const t = from + ((ms - from) * i) / steps;
      place({ x: x(t), y }, 45); await wait(45);
      range.value = String(Math.round(t)); range.dispatchEvent(new Event("input", { bubbles: true }));
    }
    cursor.classList.remove("is-down"); await wait(300); check();
  };
  const text = () => root.querySelector('[data-flash-stage] [data-flash-layer="0"] .an-flash-text');
  const N = 8;
  try {
    say(1, N, "Let's make a title slide across the screen. We'll practise on a scratch screen that is never saved.");
    await wait(2600);
    say(2, N, "Add a text layer.");
    await click('[data-action="flash-add"][data-kind="text"]');
    say(3, N, "Give it words in the inspector.");
    const field = root.querySelector('textarea[data-flash-layer-field="text"]');
    field.scrollIntoView({ block: "nearest" }); await wait(150);
    await moveTo(center(field)); await press();
    for (const ch of "CHARGE!") { check(); field.value = field.value === "New text" ? ch : field.value + ch; field.dispatchEvent(new Event("input", { bubbles: true })); await wait(110); }
    field.dispatchEvent(new Event("change", { bubbles: true })); await wait(500);
    say(4, N, "Move the playhead to where the motion should <b>start</b>, then drag the text to its starting spot on the left.");
    await scrubTo(400);
    await drag(text(), at(20, 50));
    say(5, N, "Click <b>◆ Add keyframe</b> (or press <b>K</b>). It pins the text here at this moment.");
    await click('[data-action="flash-key-add"]');
    say(6, N, "Move the playhead to where the motion should <b>end</b>, and drag the text to the right. With a keyframe on the layer, this adds a second one here.");
    await scrubTo(2400);
    await drag(text(), at(80, 50));
    say(7, N, "The two ◆ on the layer's row are the keyframes: the text glides between them. Drag a ◆ to change its timing.");
    const keys = root.querySelectorAll(".an-flash-row.is-selected .an-flash-key");
    for (const k of keys) { k.scrollIntoView({ block: "nearest" }); await moveTo(center(k), 600); await wait(500); }
    say(8, N, "Press <b>▶ Preview</b> (or Space) to watch it. Keyframes can also scale (corner handle), turn (round handle) and fade (mouse wheel).");
    await click('[data-action="flash-preview"]');
    await wait(3600);
    say(N, N, "That's it! Use <b>+ New flash screen</b> to make your own. The practice screen goes away now.");
    await wait(3000);
  } catch { /* stopped, or the editor changed under the guide */ }
  finally {
    window.removeEventListener("pointerdown", onPointer, { capture: true });
    window.removeEventListener("keydown", onKey, { capture: true });
    cursor.remove(); caption.remove();
    editor.preview?.stop(); editor.playing = false;
    Object.assign(editor, { selectedId: saved.selectedId, draft: saved.draft, dirty: saved.dirty, layerIndex: saved.layerIndex, time: saved.time, undoStack: saved.undo, redoStack: saved.redo });
    editor.touring = false;
    w.render();
  }
}
