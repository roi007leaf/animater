// The Flash screens page: a library of combat title cards and an editor with a
// live 16:9 stage (drag layers to place them), a scrub bar, a layer timeline and
// an inspector for the selected layer.
import { FLASH_BACKGROUNDS, MOMENT_EVENTS, validateFlashes, PORTRAIT_SIDES, PORTRAIT_SHAPES, FLASH_EVENTS, FLASH_MOTIONS, FLASH_KINDS, FLASH_LOOPS, LAYER_LIMIT, FLASH_LIMIT, KEY_LIMIT, validateFlash, validateLayer, keyValueAt } from "./flash-model.mjs";
import { createFlash } from "./flash-render.mjs";
import { runFlashTour } from "./flash-tour.mjs";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const options = (choices, value) => Object.entries(choices).map(([k, v]) => `<option value="${esc(k)}" ${k === value ? "selected" : ""}>${esc(v)}</option>`).join("");
const clone = (v) => JSON.parse(JSON.stringify(v));
const newId = () => crypto.randomUUID().slice(0, 12);
const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;

export class FlashEditor {
  constructor(w) {
    this.w = w; this.host = w.host; this.selectedId = null; this.draft = null; this.dirty = false; this.layerIndex = 0; this.time = 0; this.preview = null;
    // Shortcuts work while you are working in the editor (your last click was inside it), and are
    // caught before Foundry so arrows and Delete never pan the map or delete tokens.
    const signal = w.abort?.signal;
    if (typeof window === "undefined") return;
    window.addEventListener("pointerdown", (e) => { this.engaged = w.page === "flash" && !!w.root?.contains(e.target); }, { capture: true, signal });
    window.addEventListener("keydown", (e) => { if (this.engaged && w.page === "flash" && w.root?.isConnected && this.key(e)) e.stopPropagation(); }, { capture: true, signal });
  }
  screens() { return this.host.flashScreens(); }
  current() {
    if (!this.draft || this.draft.id !== this.selectedId) {
      const saved = this.screens().find((s) => s.id === this.selectedId) ?? this.screens()[0];
      this.selectedId = saved?.id ?? null;
      this.draft = saved ? clone(saved) : null;
      this.dirty = false; this.layerIndex = 0; this.time = saved ? Math.round(saved.duration * 0.55) : 0; this.undoStack = []; this.redoStack = [];
    }
    return this.draft;
  }
  // A moment when this layer is fully on screen, so editing it shows it.
  restTime(screen, i) {
    const l = screen.layers[i];
    if (!l) return Math.round(screen.duration * 0.4);
    const end = l.duration > 0 ? l.start + l.duration : screen.duration;
    return Math.round(Math.min(end - l.exitMs - 1, l.start + l.enterMs + 150));
  }
  // Every change first records the screen as it was (quick successive edits, like typing, share one step).
  edit() {
    const snap = JSON.stringify(this.draft), now = Date.now();
    this.undoStack ??= []; this.redoStack ??= [];
    if (snap !== this.undoStack.at(-1) && now - (this.lastEditAt ?? 0) > 600) { this.undoStack.push(snap); if (this.undoStack.length > 60) this.undoStack.shift(); this.redoStack = []; }
    this.lastEditAt = now;
    this.dirty = true;
    return this.draft;
  }
  history(dir) {
    const from = dir === "undo" ? this.undoStack : this.redoStack, to = dir === "undo" ? this.redoStack : this.undoStack;
    if (!from?.length) return false;
    to.push(JSON.stringify(this.draft));
    this.draft = JSON.parse(from.pop());
    this.dirty = true; this.lastEditAt = 0;
    this.layerIndex = Math.min(this.layerIndex, Math.max(0, this.draft.layers.length - 1));
    return true;
  }
  // Editor shortcuts (outside text fields): undo/redo, nudge, rotate, resize, keyframe, play,
  // step, next layer, duplicate, delete, and ? for the list.
  key(e) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName ?? "") || e.target?.isContentEditable) return false;
    const s = this.current();
    if (!s) return false;
    const k = e.key, mod = e.ctrlKey || e.metaKey, layer = s.layers[this.layerIndex], visual = layer && !["sound", "flash", "shake"].includes(layer.kind);
    const done = (render = true) => { e.preventDefault(); if (render) this.w.render(); return true; };
    if (mod) {
      const low = k.toLowerCase(), dir = low === "z" ? (e.shiftKey ? "redo" : "undo") : low === "y" ? "redo" : null;
      if (dir) { this.history(dir); return done(); }
      if (low === "d" && layer && s.layers.length < LAYER_LIMIT) { void this.action("flash-layer-copy", { dataset: { index: String(this.layerIndex) } }); e.preventDefault(); return true; }
      return false;
    }
    const step = e.shiftKey ? 5 : 0.5, round = (v) => Math.round(v * 10) / 10;
    switch (k) {
      case "ArrowLeft": case "ArrowRight": case "ArrowUp": case "ArrowDown": {
        if (!visual) return false;
        const t = this.target(this.edit().layers[this.layerIndex]);
        if (k === "ArrowLeft") t.x = round(Math.max(-20, t.x - step)); if (k === "ArrowRight") t.x = round(Math.min(120, t.x + step));
        if (k === "ArrowUp") t.y = round(Math.max(-20, t.y - step)); if (k === "ArrowDown") t.y = round(Math.min(120, t.y + step));
        this.mount(); this.later(); return done(false);
      }
      case "[": case "]": {
        if (!visual) return false;
        const t = this.target(this.edit().layers[this.layerIndex]), d = (k === "]" ? 1 : -1) * (e.shiftKey ? 15 : 5);
        t.rotate = Math.max(t === layer ? -180 : -720, Math.min(t === layer ? 180 : 720, t.rotate + d));
        this.mount(); this.later(); return done(false);
      }
      case "-": case "_": case "=": case "+":
        if (!visual) return false;
        this.grow(this.edit().layers[this.layerIndex], k === "-" || k === "_" ? 1 / 1.08 : 1.08); this.mount(); this.later(); return done(false);
      case "k": case "K":
        if (!visual) return false;
        this.keyForEdit(this.edit().layers[this.layerIndex]); return done();
      case " ": void this.togglePlay(); return done(false);
      case ",": case "<": case ".": case ">": this.setTime(this.time + (k === "," || k === "<" ? -1 : 1) * (e.shiftKey ? 1000 : 100)); return done(false);
      case "Home": this.setTime(0); return done(false);
      case "End": this.setTime(s.duration); return done(false);
      case "Tab":
        if (!s.layers.length) return false;
        this.layerIndex = (this.layerIndex + (e.shiftKey ? s.layers.length - 1 : 1)) % s.layers.length; return done();
      case "Delete": case "Backspace":
        if (!layer) return false;
        this.edit().layers.splice(this.layerIndex, 1); this.layerIndex = Math.max(0, Math.min(this.layerIndex, s.layers.length - 1)); return done();
      case "?": this.showHelp = !this.showHelp; return done();
      default: return false;
    }
  }
  // What a gesture changes: the layer itself, or (once it has keyframes) its keyframe at the playhead.
  target(layer) { return layer.keys?.length ? this.keyForEdit(layer) ?? layer : layer; }
  // Grow or shrink: keyframed layers scale; others change their own size (text size, image width, band both ways).
  grow(layer, f) {
    const r = (v, lo, hi) => Math.round(Math.min(hi, Math.max(lo, v)) * 10) / 10;
    if (layer.keys?.length) { const k = this.keyForEdit(layer); if (k) k.scale = Math.round(Math.min(10, Math.max(0.05, k.scale * f)) * 100) / 100; return; }
    if (layer.kind === "text") layer.size = r(layer.size * f, 1, 40);
    else if (layer.kind === "portraits") layer.size = r(layer.size * f, 3, 60);
    else if (layer.kind === "image") layer.width = r(layer.width * f, 1, 150);
    else if (layer.kind === "band") { layer.width = r(layer.width * f, 1, 150); layer.height = r(layer.height * f, 1, 100); }
  }
  // A timeline bar: its entrance and exit shaded at the ends, with grips to drag the start, end,
  // entrance and exit; the body moves the whole layer in time.
  barHTML(l, total) {
    const pct = (ms) => ((ms / total) * 100).toFixed(2);
    const end = l.duration > 0 ? Math.min(total, l.start + l.duration) : total, len = Math.max(1, end - l.start);
    const share = (ms) => ((Math.min(ms, len) / len) * 100).toFixed(1);
    const visual = !["sound", "flash", "shake"].includes(l.kind);
    const segs = visual ? `<span class="an-flash-seg is-enter" style="width:${share(l.enterMs)}%"></span><span class="an-flash-seg is-exit" style="width:${share(l.exitMs)}%"></span><span class="an-flash-grip is-mid" data-flash-part="enter" style="left:${share(l.enterMs)}%" title="Drag: entrance length"></span><span class="an-flash-grip is-mid" data-flash-part="exit" style="left:${(100 - share(l.exitMs)).toFixed(1)}%" title="Drag: exit length"></span>` : "";
    const edges = l.kind === "sound" ? "" : `${l.kind === "flash" || l.kind === "shake" ? "" : `<span class="an-flash-grip is-start" data-flash-part="start" title="Drag: when it starts"></span>`}<span class="an-flash-grip is-end" data-flash-part="end" title="Drag: when it ends"></span>`;
    return `<span class="an-flash-row-bar kind-${l.kind}" data-flash-part="move" style="left:${pct(l.start)}%;width:${pct(len)}%" title="Drag to move in time">${segs}${edges}</span>`;
  }
  trackHTML(l, i, total) {
    const pct = (ms) => ((ms / total) * 100).toFixed(2);
    return `${this.barHTML(l, total)}${(l.keys ?? []).map((k) => `<button class="an-flash-key${i === this.layerIndex && Math.abs(k.at - this.time) <= 40 ? " is-on" : ""}" style="left:${pct(k.at)}%" data-action="flash-key-go" data-index="${i}" data-at="${k.at}" aria-label="Keyframe at ${seconds(k.at)}" title="Click to go there; drag to retime"></button>`).join("")}<span class="an-flash-row-head" style="left:${pct(this.time)}%"></span>`;
  }
  // The inspector catches up after wheel and key tweaks, without redrawing on every notch.
  later() { clearTimeout(this.laterTimer); this.laterTimer = setTimeout(() => this.w.render(), 250); }
  // Space: play the preview from the start, or stop it.
  async togglePlay() {
    const s = this.current(), frame = this.w.root.querySelector("[data-flash-stage]");
    if (!s || !frame) return;
    if (this.playing) { this.playing = false; this.mount(); return; }
    this.preview?.stop();
    frame.replaceChildren();
    const run = createFlash(frame, validateFlash(s), { resolveMedia: (src) => this.host.resolveFlashMedia(src), vars: this.host.flashVars(), editing: true, skip: this.skipped(), playSound: (src, volume) => this.host.flashPlaySound(src, volume) });
    this.preview = run; this.playing = true;
    this.host.flashSound(s);
    await run.play();
    if (this.preview === run) { this.playing = false; this.mount(); }
  }
  // The selected layer's keyframe at the playhead (within a frame or two), if any.
  keyAtPlayhead(layer = this.draft?.layers[this.layerIndex]) { return layer?.keys?.find((k) => Math.abs(k.at - this.time) <= 40) ?? null; }
  // Dragging a keyframed layer edits (or adds) the keyframe at the playhead.
  keyForEdit(layer) {
    let key = this.keyAtPlayhead(layer);
    if (!key && layer.keys?.length < KEY_LIMIT) { key = { ...keyValueAt(layer, this.time), at: this.time }; layer.keys.push(key); layer.keys.sort((a, b) => a.at - b.at); }
    return key;
  }

  html() {
    const list = this.screens(), s = this.current(), defaults = this.host.flashDefaults();
    // The library, grouped by when screens play; a default shows as a badge.
    const group = (f) => (f.event === "start" || f.event === "any" ? "start" : f.event === "end" ? "end" : "moment");
    const card = (f) => {
      const isDefault = Object.keys(FLASH_EVENTS).some((ev) => defaults[ev] === f.id);
      const detail = f.event === "any" ? "Start or end" : group(f) === "moment" ? FLASH_EVENTS[f.event] : "";
      return `<button class="an-flash-card is-${group(f)} ${f.id === this.selectedId ? "is-selected" : ""}" data-action="flash-select" data-id="${esc(f.id)}"><span class="an-flash-card-name">${esc(f.name)}${f.id === this.selectedId && this.dirty ? " •" : ""}</span>${isDefault ? `<span class="an-flash-badge">Default</span>` : ""}${detail ? `<small>${esc(detail)}</small>` : ""}</button>`;
    };
    const section = (key, title) => { const items = list.filter((x) => group(x) === key); return items.length ? `<div class="an-flash-libgroup"><span class="an-flash-sub">${title}</span>${items.map(card).join("")}</div>` : ""; };
    const listHTML = `<aside class="an-flash-list"><div class="an-flash-libhead"><span class="an-eyebrow">FLASH SCREENS</span><span class="an-flash-libtools"><button class="an-icon" data-action="flash-import" data-tooltip="Import screens from a file" aria-label="Import">↙</button><button class="an-icon" data-action="flash-export" ${list.length ? "" : "disabled"} data-tooltip="Export all screens to a file" aria-label="Export">↗</button></span></div><button class="an-primary an-flash-new" data-action="flash-new" ${list.length >= FLASH_LIMIT ? "disabled" : ""}>+ New flash screen</button>${list.length ? section("start", "Combat start") + section("moment", "During combat") + section("end", "Combat end") : `<p class="an-hint">No flash screens yet.</p>`}<p class="an-hint">Pick each combat's opening and ending in the Combat Tracker; defaults play otherwise.</p></aside>`;
    if (!s) return `<section class="an-flash-page">${listHTML}<div class="an-flash-main an-preview-empty">Create a flash screen to begin.</div></section>`;
    const layer = s.layers[this.layerIndex];
    const isDefault = (ev) => defaults[ev] === s.id;
    const head = `<div class="an-flash-head"><input class="an-st-name" aria-label="Flash screen name" data-flash-field="name" value="${esc(s.name)}"><label>Plays at<select data-flash-field="event">${options(FLASH_EVENTS, s.event)}</select></label><label>Length (s)<input type="number" min="1" max="12" step="0.1" data-flash-field="duration" value="${(s.duration / 1000).toFixed(1)}"></label><div class="an-flash-actions"><button class="an-icon" data-action="flash-undo" ${this.undoStack?.length ? "" : "disabled"} data-tooltip="Undo (Ctrl+Z)" aria-label="Undo">↶</button><button class="an-icon" data-action="flash-redo" ${this.redoStack?.length ? "" : "disabled"} data-tooltip="Redo (Ctrl+Shift+Z)" aria-label="Redo">↷</button><button class="an-icon" data-action="flash-duplicate" data-tooltip="Duplicate" aria-label="Duplicate">⧉</button><button class="an-icon is-danger" data-action="flash-delete" data-tooltip="Delete" aria-label="Delete"><i class="fas fa-trash" aria-hidden="true"></i></button><button data-action="flash-revert" ${this.dirty ? "" : "disabled"}>Revert</button><button class="an-primary" data-action="flash-save" ${this.dirty ? "" : "disabled"}>${this.dirty ? "Save" : "Saved ✓"}</button></div></div>`;
    const canAlign = layer && !["sound", "flash", "shake"].includes(layer.kind) ? "" : "disabled";
    const align = (attr, v, label, tip) => `<button data-action="flash-align" ${attr}="${v}" ${canAlign} data-tooltip="${tip}">${label}</button>`;
    const help = this.showHelp ? `<div class="an-flash-help"><b>Shortcuts</b><span><kbd>Drag</kbd> move · corner handle: size · round handle: rotate · band edges: stretch</span><span><kbd>Wheel</kbd> opacity · <kbd>Shift</kbd>+wheel: size</span><span><kbd>←↑→↓</kbd> nudge (<kbd>Shift</kbd> ×10) · <kbd>[</kbd> <kbd>]</kbd> rotate · <kbd>-</kbd> <kbd>=</kbd> smaller / bigger</span><span><kbd>K</kbd> keyframe · <kbd>Space</kbd> play · <kbd>,</kbd> <kbd>.</kbd> step (<kbd>Shift</kbd> 1s) · <kbd>Home</kbd> <kbd>End</kbd></span><span><kbd>Tab</kbd> next layer · <kbd>Ctrl+D</kbd> duplicate · <kbd>Delete</kbd> remove · <kbd>Ctrl+Z</kbd> undo</span><span>Drag any field's label to change its value (<kbd>Shift</kbd> faster, <kbd>Alt</kbd> finer). On the timeline, drag bars, their ends and the shaded entrance/exit; drag ◆ to retime. <kbd>Alt</kbd> turns snapping off.</span></div>` : "";
    const stage = `<div class="an-flash-tools"><span class="an-flash-align">${align("data-x", 20, "⇤", "Left third")}${align("data-x", 50, "↔", "Centre horizontally")}${align("data-x", 80, "⇥", "Right third")}<i></i>${align("data-y", 20, "⤒", "Top third")}${align("data-y", 50, "↕", "Centre vertically")}${align("data-y", 80, "⤓", "Bottom third")}</span><button class="an-flash-guide" data-action="flash-tour" data-tooltip="Watch a short guide: making a title slide across with keyframes">🎓 Show me</button><button class="an-icon${this.showHelp ? " is-on" : ""}" data-action="flash-help" data-tooltip="Shortcuts (?)" aria-label="Shortcuts">?</button></div>${help}<div class="an-flash-stage-wrap"><div class="an-flash-frame" data-flash-stage aria-label="Flash screen preview: drag a layer to move it"></div></div>
      <div class="an-flash-transport"><button class="an-primary" data-action="flash-preview">${this.playing ? "■ Stop" : "▶ Preview"}</button><button data-action="flash-play-all" data-tooltip="Play it now on every player's screen">Play for everyone</button><input type="range" min="0" max="${s.duration}" step="10" value="${this.time}" data-flash-time aria-label="Scrub"><span data-flash-clock>${seconds(this.time)} / ${seconds(s.duration)}</span></div>`;
    const pct = (ms) => ((ms / s.duration) * 100).toFixed(2);
    const rows = s.layers.map((l, i) => {
      const end = l.duration > 0 ? Math.min(s.duration, l.start + l.duration) : s.duration;
      return `<div class="an-flash-row ${i === this.layerIndex ? "is-selected" : ""}"><button class="an-flash-row-name" data-action="flash-layer" data-index="${i}">${esc(l.name || FLASH_KINDS[l.kind])}</button><span class="an-flash-row-ms"><button class="${this.muted?.has(l.id) ? "is-on" : ""}" data-action="flash-mute" data-index="${i}" aria-pressed="${!!this.muted?.has(l.id)}" data-tooltip="Mute: leave this layer out of the editor preview">M</button><button class="is-solo ${this.soloed?.has(l.id) ? "is-on" : ""}" data-action="flash-solo" data-index="${i}" aria-pressed="${!!this.soloed?.has(l.id)}" data-tooltip="Solo: preview only soloed layers">S</button></span><div class="an-flash-row-track" data-action="flash-layer" data-index="${i}">${this.trackHTML(l, i, s.duration)}</div><span class="an-flash-row-tools"><button data-action="flash-layer-up" data-index="${i}" aria-label="Bring forward" ${i === s.layers.length - 1 ? "disabled" : ""}>▲</button><button data-action="flash-layer-down" data-index="${i}" aria-label="Send back" ${i === 0 ? "disabled" : ""}>▼</button><button data-action="flash-layer-copy" data-index="${i}" aria-label="Duplicate layer" ${s.layers.length >= LAYER_LIMIT ? "disabled" : ""}>⧉</button><button data-action="flash-layer-remove" data-index="${i}" aria-label="Remove layer">×</button></span></div>`;
    }).reverse().join("");
    const full = s.layers.length >= LAYER_LIMIT ? "disabled" : "";
    const layersHTML = `<div class="an-flash-layers"><div class="an-flash-layers-head"><b>Layers</b><span class="an-flash-adds"><button data-action="flash-add" data-kind="text" ${full}>+ Text</button><button data-action="flash-add" data-kind="image" ${full}>+ Image</button><button data-action="flash-add" data-kind="portraits" ${full} data-tooltip="The party's or enemies' pictures, from the encounter">+ Portraits</button><button data-action="flash-add" data-kind="band" ${full}>+ Band</button><button data-action="flash-add" data-kind="sound" ${full}>+ Sound</button><button data-action="flash-add" data-kind="flash" ${full} data-tooltip="A full-screen flash at one moment">+ Flash</button><button data-action="flash-add" data-kind="shake" ${full} data-tooltip="Shake the whole screen at one moment">+ Shake</button></span></div>${rows || `<p class="an-hint">Add a text, image or band layer.</p>`}<p class="an-hint">M mutes and S solos a layer in this editor only; saved screens always play every layer. Top of the list draws on top. Drag a bar to move it in time, its ends to trim it, the shaded ends to set its entrance and exit, and ◆ to retime a keyframe. Press ? for all shortcuts.</p></div>`;
    const scene = `<div class="an-editor-section an-flash-card-box"><span class="an-eyebrow">SCREEN</span><div class="an-field-row"><label>Backdrop<input type="color" data-flash-field="backdrop.color" value="${s.backdrop.color}"></label><label>Darkness<input type="number" min="0" max="1" step="0.05" data-flash-field="backdrop.opacity" value="${s.backdrop.opacity}"></label></div><label class="an-check"><input type="checkbox" data-flash-field="backdrop.vignette" ${s.backdrop.vignette ? "checked" : ""}> Dark edges</label><div class="an-field-row"><label class="an-check"><input type="checkbox" data-flash-field="backdrop.bars" ${s.backdrop.bars ? "checked" : ""}> Cinematic bars</label>${s.backdrop.bars ? `<label>Bar size<input type="number" min="2" max="25" step="1" data-flash-field="backdrop.barSize" value="${s.backdrop.barSize}"></label>` : ""}</div><label>Animated background<select data-flash-field="backdrop.media">${options(Object.hasOwn(FLASH_BACKGROUNDS, s.backdrop.media) ? FLASH_BACKGROUNDS : { ...FLASH_BACKGROUNDS, [s.backdrop.media]: "Custom file" }, s.backdrop.media)}</select></label><div class="an-field-row"><label>Or a file<span class="an-flash-sound"><input data-flash-field="backdrop.media" placeholder="JB2A key or video" value="${esc(s.backdrop.media)}"><button data-action="flash-browse" data-target="background" aria-label="Browse backgrounds">…</button></span></label>${s.backdrop.media ? `<label>Strength<input type="number" min="0" max="1" step="0.05" data-flash-field="backdrop.mediaOpacity" value="${s.backdrop.mediaOpacity}"></label>` : ""}</div><label class="an-check"><input type="checkbox" data-flash-field="duck" ${s.duck ? "checked" : ""}> Lower the music while it plays</label><label>Sound<span class="an-flash-sound"><input data-flash-field="sound.file" placeholder="sounds/drums.ogg" value="${esc(s.sound.file)}"><button data-action="flash-browse" data-target="sound" aria-label="Browse sounds">…</button></span></label><label>Volume<input type="number" min="0" max="1" step="0.05" data-flash-field="sound.volume" value="${s.sound.volume}"></label><div class="an-flash-defaults">${(s.event === "any" ? ["start", "end"] : [s.event]).map((ev) => `<button class="${isDefault(ev) ? "an-primary" : ""}" data-action="flash-default" data-event="${ev}">${isDefault(ev) ? "✓ " : ""}Use for: ${esc(FLASH_EVENTS[ev])}</button>`).join("")}</div><p class="an-hint">${MOMENT_EVENTS.includes(s.event) ? "Plays during combat whenever this happens. Turn it on with the button above." : "The default plays for every combat unless the Combat Tracker picks another."} Text can use {scene}, {round}, {boss} (strongest enemy) and {name} (who crit or fell).</p></div>`;
    return `<section class="an-flash-page">${listHTML}<div class="an-flash-main">${head}${stage}${layersHTML}</div><aside class="an-flash-inspector">${layer ? this.layerHTML(layer) : ""}${scene}</aside></section>`;
  }
  layerHTML(l) {
    const f = (key, label, value, attrs = "") => `<label>${label}<input data-flash-layer-field="${key}" value="${esc(value)}" ${attrs}></label>`;
    const n = (key, label, value, min, max, step) => f(key, label, value, `type="number" min="${min}" max="${max}" step="${step}"`);
    const c = (key, label, value) => `<label>${label}<input type="color" data-flash-layer-field="${key}" value="${value}"></label>`;
    const sel = (key, label, choices, value) => `<label>${label}<select data-flash-layer-field="${key}">${options(choices, value)}</select></label>`;
    const fonts = Object.fromEntries(this.host.flashFonts().map((name) => [name, name]));
    const kind = l.kind === "text"
      ? `<label>Text<textarea rows="2" data-flash-layer-field="text">${esc(l.text)}</textarea></label>${sel("font", "Font", fonts, l.font)}<div class="an-field-row">${n("size", "Size", l.size, 1, 40, 0.5)}${n("spacing", "Spacing", l.spacing, -0.1, 1, 0.01)}</div><div class="an-field-row">${c("color", "Color", l.color)}${c("outline", "Outline", l.outline)}${c("glow", "Glow", l.glow)}</div>${n("glowSize", "Glow size", l.glowSize, 0, 10, 0.5)}<div class="an-field-row"><label class="an-check"><input type="checkbox" data-flash-layer-field="bold" ${l.bold ? "checked" : ""}> Bold</label><label class="an-check"><input type="checkbox" data-flash-layer-field="italic" ${l.italic ? "checked" : ""}> Italic</label></div><div class="an-field-row"><label class="an-check"><input type="checkbox" data-flash-layer-field="gradient" ${l.gradient ? "checked" : ""}> Gradient to</label>${l.gradient ? c("gradientTo", "Bottom color", l.gradientTo) : ""}</div>${n("letters", "Letters one by one (ms apart, 0 = all at once)", l.letters, 0, 400, 10)}`
      : l.kind === "sound" || l.kind === "flash" || l.kind === "shake"
      ? l.kind !== "sound" ? "" : `<label>Sound file<span class="an-flash-sound"><input data-flash-layer-field="file" placeholder="sounds/drums.ogg" value="${esc(l.file)}"><button data-action="flash-browse" data-target="layer-sound" aria-label="Browse sounds">…</button></span></label>${n("volume", "Volume", l.volume, 0, 1, 0.05)}${n("start", "Plays at (ms)", l.start, 0, 12000, 50)}<p class="an-hint">Plays once at that moment of the screen. Add more sound layers for more cues.</p>`
      : l.kind === "portraits"
      ? `${sel("side", "Show", PORTRAIT_SIDES, l.side)}<div class="an-field-row">${sel("art", "Picture", { token: "Token image", portrait: "Actor portrait" }, l.art)}${sel("shape", "Frame", PORTRAIT_SHAPES, l.shape)}</div><div class="an-field-row">${n("size", "Size", l.size, 3, 60, 0.5)}${n("gap", "Spacing", l.gap, 0, 20, 0.5)}${n("max", "Up to", l.max, 1, 12, 1)}</div><div class="an-field-row">${n("perRow", "Per row (0 = one line)", l.perRow, 0, 12, 1)}</div><div class="an-field-row">${c("ring", "Frame color", l.ring)}${n("stagger", "One after another (ms)", l.stagger, 0, 1000, 10)}</div><label class="an-check"><input type="checkbox" data-flash-layer-field="names" ${l.names ? "checked" : ""}> Show names</label><p class="an-hint">Filled in from the encounter when the screen plays: the party is player-owned or friendly tokens, the enemies hostile ones. Hidden combatants never appear. With no encounter, stand-ins show here.</p>`
      : l.kind === "image"
      ? `<label>Image or video<span class="an-flash-sound"><input data-flash-layer-field="src" placeholder="Choose a file or a JB2A key" value="${esc(l.src)}"><button data-action="flash-browse" data-target="image" aria-label="Browse images">…</button></span></label>${n("width", "Width (% of screen)", l.width, 1, 150, 1)}`
      : `<div class="an-field-row">${c("color", "Color", l.color)}${n("skew", "Slant", l.skew, -45, 45, 1)}</div><div class="an-field-row">${n("width", "Width %", l.width, 1, 150, 1)}${n("height", "Height %", l.height, 1, 100, 1)}</div>`;
    if (l.kind === "sound") return `<div class="an-editor-section"><span class="an-eyebrow">SOUND LAYER</span>${f("name", "Layer name", l.name, `placeholder="Sound"`)}${kind}</div>`;
    if (l.kind === "flash" || l.kind === "shake") return `<div class="an-editor-section"><span class="an-eyebrow">${l.kind === "flash" ? "SCREEN FLASH" : "SCREEN SHAKE"}</span>${f("name", "Layer name", l.name, `placeholder="${esc(FLASH_KINDS[l.kind])}"`)}
      ${l.kind === "flash" ? `<div class="an-field-row">${c("color", "Color", l.color)}${n("strength", "Brightness", l.strength, 0.05, 1, 0.05)}</div>` : n("strength", "Strength", l.strength, 0.2, 5, 0.1)}
      <div class="an-field-row">${n("start", "At (ms)", l.start, 0, 12000, 50)}${n("duration", "Lasts (ms)", l.duration, 50, 4000, 50)}</div><p class="an-hint">${l.kind === "flash" ? "Lights up the whole screen for a moment: put it where a title lands." : "Jolts every layer together, fading out. Pair it with a flash for an impact."}</p></div>`;
    const key = this.keyAtPlayhead(l), kn = (p, label, min, max, step) => `<label>${label}<input type="number" min="${min}" max="${max}" step="${step}" data-flash-key-field="${p}" value="${Math.round(key[p] * 100) / 100}"></label>`;
    const motion = `<div class="an-editor-section an-flash-card-box an-flash-motion-box"><span class="an-eyebrow">MOTION & EFFECTS</span>
      ${key ? `<div class="an-flash-keybox"><span>◆ Keyframe at ${seconds(key.at)}</span><div class="an-field-row">${kn("x", "X %", -20, 120, 0.5)}${kn("y", "Y %", -20, 120, 0.5)}</div><div class="an-field-row">${kn("scale", "Scale", 0.05, 10, 0.05)}${kn("rotate", "Rotate", -720, 720, 1)}${kn("opacity", "Opacity", 0, 1, 0.05)}</div><button class="an-quiet is-danger" data-action="flash-key-remove">Remove this keyframe</button></div>`
        : `<button class="an-flash-keyadd" data-action="flash-key-add" ${(l.keys?.length ?? 0) >= KEY_LIMIT ? "disabled" : ""}>◆ Add keyframe at ${seconds(this.time)}</button>`}
      ${l.keys?.length ? `${sel("keyEase", "Between keyframes", { smooth: "Smooth", linear: "Steady" }, l.keyEase)}<p class="an-hint">${l.keys.length} keyframe${l.keys.length === 1 ? "" : "s"}. Move the playhead and drag or resize the layer on the stage: it edits the keyframe there, or adds one.</p>` : `<p class="an-hint">Keyframes move, scale, turn or fade the layer over time. Add one, move the playhead, then drag the layer to where it should go.</p>`}
      <div class="an-flash-keycopy">${l.keys?.length ? `<button class="an-quiet" data-action="flash-keys-copy">Copy keyframes</button>` : ""}${this.keyClipboard ? `<button class="an-quiet" data-action="flash-keys-paste">Paste keyframes</button>` : ""}</div>
      <div class="an-field-row">${sel("loop", "Loop effect", FLASH_LOOPS, l.loop)}${l.loop !== "none" ? n("loopMs", "Every (ms)", l.loopMs, 150, 5000, 50) : ""}</div></div>`;
    const group = (title, body) => `<div class="an-flash-group"><span class="an-flash-sub">${title}</span>${body}</div>`;
    return `<div class="an-editor-section an-flash-card-box"><span class="an-eyebrow">${esc(FLASH_KINDS[l.kind]).toUpperCase()} LAYER</span>${f("name", "Layer name", l.name, `placeholder="${esc(FLASH_KINDS[l.kind])}"`)}
      ${group("Look", kind)}
      ${group("Position", `<div class="an-field-row is-3">${n("x", "X %", Math.round(l.x * 10) / 10, -20, 120, 0.5)}${n("y", "Y %", Math.round(l.y * 10) / 10, -20, 120, 0.5)}${n("rotate", "Rotate°", l.rotate, -180, 180, 1)}</div><div class="an-field-row">${n("opacity", "Opacity", l.opacity, 0, 1, 0.05)}<label class="an-check"><input type="checkbox" data-flash-layer-field="shake" ${l.shake ? "checked" : ""}> Shake on arrival</label></div>`)}
      ${group("Timing", `<div class="an-field-row">${n("start", "Starts (ms)", l.start, 0, 12000, 50)}${n("duration", "Lasts (ms, 0 = to end)", l.duration, 0, 12000, 50)}</div>`)}
      ${group("Entrance & exit", `<div class="an-field-row is-wide">${sel("enter", "Enters", FLASH_MOTIONS, l.enter)}${n("enterMs", "ms", l.enterMs, 0, 4000, 50)}</div><div class="an-field-row is-wide">${sel("exit", "Leaves", FLASH_MOTIONS, l.exit)}${n("exitMs", "ms", l.exitMs, 0, 4000, 50)}</div>`)}
    </div>${motion}`;
  }

  // Editor-only mute/solo (by layer id, never saved): the layers the stage leaves out.
  skipped() {
    const mute = (this.muted ??= new Set()), solo = (this.soloed ??= new Set()), layers = this.draft?.layers ?? [];
    const soloing = layers.some((l) => solo.has(l.id));
    return new Set(layers.flatMap((l, i) => ((soloing ? !solo.has(l.id) : mute.has(l.id)) ? [i] : [])));
  }
  // Redraw the stage at the current time (after every render or edit).
  mount() {
    const frame = this.w.root.querySelector("[data-flash-stage]");
    // A redraw while the preview plays keeps it playing (put back if the redraw emptied the stage).
    if (this.playing && this.preview?.el) { if (frame && !frame.contains(this.preview.el)) frame.append(this.preview.el); return; }
    this.preview?.stop();
    this.preview = null;
    const s = this.current();
    if (!frame || !s) return;
    frame.replaceChildren();
    this.preview = createFlash(frame, validateFlash(s), { resolveMedia: (src) => this.host.resolveFlashMedia(src), vars: this.host.flashVars(), editing: true, skip: this.skipped() });
    const picked = this.preview.el.querySelector(`[data-flash-layer="${this.layerIndex}"]`);
    // The outline and resize handle ride on the moving part, so keyframed layers show them where they are.
    const kind = s.layers[this.layerIndex]?.kind, keyed = (s.layers[this.layerIndex]?.keys?.length ?? 0) > 0;
    if (picked) { picked.classList.add("is-selected"); picked.querySelector(".an-flash-motion")?.insertAdjacentHTML("beforeend", `<span class="an-flash-handle" data-flash-resize title="Drag to resize"></span><span class="an-flash-rotate" data-flash-rotate title="Drag to rotate (Shift snaps to 15°)"></span>${kind === "band" && !keyed ? `<span class="an-flash-edge is-x" data-flash-edge="x" title="Drag: width"></span><span class="an-flash-edge is-y" data-flash-edge="y" title="Drag: height"></span>` : ""}`); }
    // Wheel over the selected layer: opacity; Shift+wheel: size.
    if (!frame.dataset.wheel) {
      frame.dataset.wheel = "1";
      frame.addEventListener("wheel", (e) => {
        if (!e.target.closest?.(`[data-flash-layer="${this.layerIndex}"]`)) return;
        e.preventDefault();
        const layer = this.edit().layers[this.layerIndex], up = e.deltaY < 0;
        if (e.shiftKey) this.grow(layer, up ? 1.05 : 1 / 1.05);
        else { const t = this.target(layer); t.opacity = Math.round(Math.min(1, Math.max(0, t.opacity + (up ? 0.05 : -0.05))) * 100) / 100; }
        this.mount(); this.later();
      }, { passive: false });
    }
    this.preview.seek(this.time);
  }
  setTime(ms) {
    const s = this.current();
    this.time = Math.max(0, Math.min(s.duration, Math.round(ms)));
    this.preview?.seek(this.time);
    const clock = this.w.root.querySelector("[data-flash-clock]"), range = this.w.root.querySelector("[data-flash-time]");
    if (clock) clock.textContent = `${seconds(this.time)} / ${seconds(s.duration)}`;
    if (range && Number(range.value) !== this.time) range.value = this.time;
    for (const head of this.w.root.querySelectorAll(".an-flash-row-head")) head.style.left = `${((this.time / s.duration) * 100).toFixed(2)}%`;
  }

  // Inputs update the draft and the stage live; structural changes re-render on change.
  input(t) {
    if (t.hasAttribute?.("data-flash-time")) { this.setTime(Number(t.value)); return true; }
    const field = t.dataset?.flashField, layerField = t.dataset?.flashLayerField, keyField = t.dataset?.flashKeyField;
    if (!field && !layerField && !keyField) return false;
    if (keyField) {
      const key = this.keyAtPlayhead(this.edit().layers[this.layerIndex]);
      if (key) key[keyField] = Number(t.value);
    }
    const value = t.type === "checkbox" ? t.checked : t.type === "number" ? Number(t.value) : t.value;
    const s = this.edit();
    if (field === "duration") s.duration = Math.round(Number(t.value) * 1000);
    else if (field) { const [a, b] = field.split("."); if (b) s[a][b] = value; else s[a] = value; }
    else if (layerField && s.layers[this.layerIndex]) s.layers[this.layerIndex][layerField] = value;
    Object.assign(this.draft, validateFlash(s));
    this.mount();
    const save = this.w.root.querySelector('[data-action="flash-save"]');
    if (save) { save.disabled = false; save.textContent = "Save"; }
    const revert = this.w.root.querySelector('[data-action="flash-revert"]');
    if (revert) revert.disabled = false;
    return true;
  }
  change(t) {
    if (!t.dataset?.flashField && !t.dataset?.flashLayerField && !t.dataset?.flashKeyField) return false;
    this.w.render();
    return true;
  }

  // Where a dragged layer lands: snapped to the centre lines and other layers' positions
  // (within a small reach), with guide lines showing the snap. Alt places freely.
  snap(frame, index, ev, box) {
    let x = Math.round(((ev.clientX - box.left) / box.width) * 1000) / 10, y = Math.round(((ev.clientY - box.top) / box.height) * 1000) / 10;
    frame.querySelectorAll(".an-flash-guide").forEach((g) => g.remove());
    if (ev.altKey) return { x, y };
    const others = this.draft.layers.filter((l, j) => j !== index && !["sound", "flash", "shake"].includes(l.kind));
    const xs = [50, ...others.map((l) => l.x)], ys = [50, ...others.map((l) => l.y)], reach = 1.2;
    const sx = xs.find((c) => Math.abs(c - x) <= reach), sy = ys.find((c) => Math.abs(c - y) <= reach);
    if (sx !== undefined) { x = sx; frame.insertAdjacentHTML("beforeend", `<span class="an-flash-guide is-v" style="left:${x}%"></span>`); }
    if (sy !== undefined) { y = sy; frame.insertAdjacentHTML("beforeend", `<span class="an-flash-guide is-h" style="top:${y}%"></span>`); }
    return { x, y };
  }
  pointer(e) {
    if (e.button !== 0) return false;
    const handled = this.scrubLabel(e) || this.timelineDrag(e) || this.stageDrag(e);
    // Working on the stage or timeline leaves any text field, so shortcuts apply.
    if (handled && e.target.closest?.("[data-flash-stage], .an-flash-row-track")) document.activeElement?.blur?.();
    return handled;
  }
  // Drag a number field's label sideways to change it (Shift ×10, Alt finer); release commits.
  scrubLabel(e) {
    const label = e.target.closest?.(".an-flash-page label");
    if (!label || e.target.closest("input, select, textarea, button")) return false;
    const input = label.querySelector('input[type="number"]');
    if (!input || input.disabled) return false;
    e.preventDefault();
    const step = Number(input.step) || 1, min = input.min === "" ? -Infinity : Number(input.min), max = input.max === "" ? Infinity : Number(input.max);
    const places = (String(input.step).split(".")[1] ?? "").length, from = Number(input.value) || 0, x0 = e.clientX;
    let moved = false;
    const move = (ev) => {
      const dx = ev.clientX - x0;
      if (!moved && Math.abs(dx) < 2) return;
      if (!moved) { moved = true; document.body.classList.add("an-scrubbing"); }
      const mult = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1, digits = places + (ev.altKey ? 1 : 0);
      const v = Math.min(max, Math.max(min, from + (dx / 4) * step * mult));
      input.value = v.toFixed(digits);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
      document.body.classList.remove("an-scrubbing");
      if (moved) input.dispatchEvent(new Event("change", { bubbles: true })); else input.focus();
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return true;
  }
  // Timeline: drag a bar to move it in time, its ends to trim, its shaded ends to set the entrance
  // and exit, and ◆ to retime. Snaps to the playhead and other layers' starts and ends (Alt: free).
  timelineDrag(e) {
    const track = e.target.closest?.(".an-flash-row-track"), keyEl = e.target.closest?.(".an-flash-key"), bar = e.target.closest?.(".an-flash-row-bar");
    if (!track || (!keyEl && !bar)) return false;
    e.preventDefault();
    const s = this.draft, i = Number(track.dataset.index), layer = s.layers[i], total = s.duration;
    const rect = track.getBoundingClientRect(), msPer = total / Math.max(1, rect.width), x0 = e.clientX;
    const part = e.target.closest("[data-flash-part]")?.dataset.flashPart ?? "move";
    const from = { start: layer.start, end: layer.duration > 0 ? Math.min(total, layer.start + layer.duration) : total, enter: layer.enterMs, exit: layer.exitMs, toEnd: !(layer.duration > 0) };
    const key = keyEl ? layer.keys.find((k) => k.at === Number(keyEl.dataset.at)) : null, at0 = key?.at;
    const marks = [this.time, 0, total, ...s.layers.flatMap((l, j) => (j === i ? [] : [l.start, l.duration > 0 ? l.start + l.duration : total]))];
    const snapT = (t, ev) => (ev.altKey ? t : marks.find((c) => Math.abs(c - t) <= 6 * msPer) ?? t);
    const clamp = (v, lo, hi) => Math.round(Math.min(hi, Math.max(lo, v)));
    let moved = false;
    const move = (ev) => {
      const dt = (ev.clientX - x0) * msPer;
      if (!moved && Math.abs(ev.clientX - x0) < 3) return;
      if (!moved) { moved = true; this.edit(); this.layerIndex = i; }
      if (key) { key.at = clamp(snapT(at0 + dt, ev), 0, total); layer.keys.sort((a, b) => a.at - b.at); }
      else if (part === "move") {
        const len = from.end - from.start, start = clamp(snapT(from.start + dt, ev), 0, total - (from.toEnd ? 50 : len));
        layer.start = start;
      } else if (part === "start") {
        const start = clamp(snapT(from.start + dt, ev), 0, from.end - 50);
        layer.start = start; if (!from.toEnd) layer.duration = from.end - start;
      } else if (part === "end") {
        const end = clamp(snapT(from.end + dt, ev), from.start + 50, total);
        layer.duration = end >= total - 5 && !["flash", "shake"].includes(layer.kind) ? 0 : end - from.start;
      } else if (part === "enter") layer.enterMs = clamp(from.enter + dt, 0, Math.min(4000, from.end - from.start - layer.exitMs));
      else if (part === "exit") layer.exitMs = clamp(from.exit - dt, 0, Math.min(4000, from.end - from.start - layer.enterMs));
      track.innerHTML = this.trackHTML(layer, i, total);
      this.mount();
    };
    const up = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
      if (moved) { this.suppressClick = true; setTimeout(() => { this.suppressClick = false; }, 60); this.w.render(); }
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return true;
  }
  // Stage: drag a layer to move it, the corner to resize, the round handle to rotate, band edges to stretch.
  stageDrag(e) {
    const el = e.target.closest?.("[data-flash-stage] [data-flash-layer]"), frame = el?.closest("[data-flash-stage]");
    if (!el) return false;
    e.preventDefault();
    const i = Number(el.dataset.flashLayer), resize = !!e.target.closest("[data-flash-resize]"), rotate = !!e.target.closest("[data-flash-rotate]"), edge = e.target.closest("[data-flash-edge]")?.dataset.flashEdge;
    if (i !== this.layerIndex) { this.layerIndex = i; this.w.render(); }
    const box = frame.getBoundingClientRect(), layer = this.draft.layers[i];
    const cx = box.left + (layer.x / 100) * box.width, cy = box.top + (layer.y / 100) * box.height;
    const now = keyValueAt(layer, this.time), keyed = (layer.keys?.length ?? 0) > 0;
    const px = keyed ? box.left + (now.x / 100) * box.width : cx, py = keyed ? box.top + (now.y / 100) * box.height : cy;
    const start = { x: e.clientX, y: e.clientY, dx: Math.max(4, Math.abs(e.clientX - px)), dy: Math.max(4, Math.abs(e.clientY - py)), size: layer.size, width: layer.width, height: layer.height, scale: now.scale };
    let moved = false, key = null;
    const angle = (x, y) => (Math.atan2(y - py, x - px) * 180) / Math.PI, a0 = angle(e.clientX, e.clientY), rot0 = keyed ? now.rotate : layer.rotate;
    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 3) return;
      if (!moved) { moved = true; this.edit(); if (keyed) key = this.keyForEdit(layer); }
      if (rotate) {
        // Round handle: turn around the layer's centre; Shift snaps to 15°.
        let r = rot0 + angle(ev.clientX, ev.clientY) - a0;
        if (ev.shiftKey) r = Math.round(r / 15) * 15;
        const t = key ?? layer, lim = key ? 720 : 180;
        t.rotate = Math.round(((((r + lim) % (2 * lim)) + 2 * lim) % (2 * lim)) - lim);
        this.mount();
        return;
      }
      if (edge && !key) {
        // Band edges stretch one way.
        const round = (v) => Math.round(v * 10) / 10;
        if (edge === "x") layer.width = round(Math.min(150, Math.max(1, start.width * (Math.abs(ev.clientX - cx) / start.dx))));
        else layer.height = round(Math.min(100, Math.max(1, start.height * (Math.abs(ev.clientY - cy) / start.dy))));
        this.mount();
        return;
      }
      if (key) {
        // A keyframed layer: drag sets this keyframe's position, the handle its scale.
        if (resize) key.scale = Math.round(Math.min(10, Math.max(0.05, start.scale * Math.max(Math.abs(ev.clientX - px) / start.dx, Math.abs(ev.clientY - py) / start.dy))) * 100) / 100;
        else Object.assign(key, this.snap(frame, i, ev, box));
        this.mount();
        return;
      }
      if (resize) {
        // Corner handle: text grows in size, images in width, bands in width and height.
        const fx = Math.abs(ev.clientX - cx) / start.dx, fy = Math.abs(ev.clientY - cy) / start.dy, f = Math.max(fx, fy);
        const round = (v) => Math.round(v * 10) / 10;
        if (layer.kind === "text") layer.size = round(Math.min(40, Math.max(1, start.size * f)));
        else if (layer.kind === "portraits") layer.size = round(Math.min(60, Math.max(3, start.size * f)));
        else if (layer.kind === "image") layer.width = round(Math.min(150, Math.max(1, start.width * f)));
        else { layer.width = round(Math.min(150, Math.max(1, start.width * fx))); layer.height = round(Math.min(100, Math.max(1, start.height * fy))); }
        this.mount();
        return;
      }
      Object.assign(layer, this.snap(frame, i, ev, box));
      const live = frame.querySelector(`[data-flash-layer="${i}"]`);
      if (live) { live.style.left = `${layer.x}%`; live.style.top = `${layer.y}%`; }
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); frame.querySelectorAll(".an-flash-guide").forEach((g) => g.remove()); if (moved) this.w.render(); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return true;
  }

  async action(action, b) {
    if (!action.startsWith("flash-")) return false;
    // A timeline drag ends with a click on the same row; that click should not also jump the playhead.
    if (this.suppressClick && ["flash-layer", "flash-key-go"].includes(action)) return true;
    const list = this.screens();
    const s = this.current();
    const commit = async (next, message) => { await this.host.saveFlashScreens(next); this.dirty = false; this.w.message = message; };
    switch (action) {
      case "flash-select":
        if (b.dataset.id === this.selectedId) return true;
        if (this.dirty && !(await this.host.confirm(`Discard your unsaved changes to “${s.name}”?`))) return true;
        this.selectedId = b.dataset.id; this.draft = null; this.dirty = false; break;
      case "flash-new": case "flash-duplicate": {
        if (this.dirty && !(await this.host.confirm(`Discard your unsaved changes to “${s.name}”?`))) return true;
        this.dirty = false;
        const base = action === "flash-new"
          ? validateFlash({ name: "New flash screen", event: "start", layers: [{ kind: "text", name: "Title", text: "TO BATTLE!", enter: "slam", shake: true }] })
          : { ...clone(s), id: newId(), name: `${s.name} copy` };
        base.id = newId();
        await commit([...list, validateFlash(base)], `${base.name} created.`);
        this.selectedId = base.id; this.draft = null; break;
      }
      case "flash-delete": {
        if (!(await this.host.confirm(`Delete the flash screen “${s.name}”?`))) return true;
        await commit(list.filter((f) => f.id !== s.id), `${s.name} deleted.`);
        this.selectedId = null; this.draft = null; break;
      }
      case "flash-save":
        await commit(list.map((f) => (f.id === s.id ? validateFlash(s) : f)), `${s.name} saved.`); break;
      case "flash-revert": this.draft = null; this.dirty = false; break;
      case "flash-default": await this.host.setFlashDefault(b.dataset.event, this.host.flashDefaults()[b.dataset.event] === s.id ? "none" : s.id); break;
      case "flash-preview": {
        // No redraw while it plays: the label changes in place, and the page catches up after.
        b.textContent = this.playing ? "▶ Preview" : "■ Stop";
        await this.togglePlay();
        this.w.render();
        return true;
      }
      case "flash-play-all": this.host.playFlash(validateFlash(s), { everyone: true }); this.w.message = `Playing “${s.name}” for everyone.`; break;
      case "flash-layer": this.layerIndex = Number(b.dataset.index); this.time = this.restTime(s, this.layerIndex); break;
      case "flash-mute": case "flash-solo": {
        const set = action === "flash-mute" ? (this.muted ??= new Set()) : (this.soloed ??= new Set()), id = s.layers[Number(b.dataset.index)]?.id;
        if (id) { if (set.has(id)) set.delete(id); else set.add(id); }
        break;
      }
      case "flash-align": {
        const layer = this.edit().layers[this.layerIndex];
        if (!layer || !!["sound", "flash", "shake"].includes(layer.kind)) return true;
        const t = this.target(layer);
        if (b.dataset.x) t.x = Number(b.dataset.x);
        if (b.dataset.y) t.y = Number(b.dataset.y);
        break;
      }
      case "flash-help": this.showHelp = !this.showHelp; break;
      case "flash-tour": void runFlashTour(this); return true;
      case "flash-undo": case "flash-redo": this.history(action === "flash-undo" ? "undo" : "redo"); break;
      case "flash-layer-copy": {
        const i = Number(b.dataset.index), layers = this.edit().layers, copy = { ...clone(layers[i]), id: newId(), name: `${layers[i].name || FLASH_KINDS[layers[i].kind]} copy`, x: layers[i].x + 3, y: layers[i].y + 3, keys: (layers[i].keys ?? []).map((k) => ({ ...k, x: k.x + 3, y: k.y + 3 })) };
        layers.splice(i + 1, 0, copy); this.layerIndex = i + 1; break;
      }
      // Keyframes copy relative to their layer, so pasting onto another layer moves it the same way from its own place.
      case "flash-keys-copy": { const l = s.layers[this.layerIndex]; this.keyClipboard = l.keys.map((k) => ({ ...k, x: k.x - l.x, y: k.y - l.y })); this.w.message = `Copied ${l.keys.length} keyframe${l.keys.length === 1 ? "" : "s"}.`; break; }
      case "flash-keys-paste": { const l = this.edit().layers[this.layerIndex]; l.keys = this.keyClipboard.map((k) => ({ ...k, x: k.x + l.x, y: k.y + l.y })); break; }
      case "flash-export": {
        this.host.downloadJSON({ schema: 1, type: "animater-flash-screens", screens: list }, "animater-flash-screens.json");
        this.w.message = `Exported ${list.length} flash screen${list.length === 1 ? "" : "s"}.`; break;
      }
      case "flash-import": {
        if (this.dirty && !(await this.host.confirm(`Discard your unsaved changes to “${s?.name}”?`))) return true;
        const text = await this.host.pickTextFile(".json,application/json");
        if (!text) return true;
        let data; try { data = JSON.parse(text); } catch { throw Error("That file is not an Animater flash screens export."); }
        const incoming = validateFlashes(Array.isArray(data) ? data : data?.screens);
        if (!incoming.length) throw Error("No flash screens found in that file.");
        const ids = new Set(list.map((x) => x.id)), room = FLASH_LIMIT - list.length;
        if (room <= 0) throw Error(`You already have the most flash screens (${FLASH_LIMIT}).`);
        const added = incoming.slice(0, room).map((x) => (ids.has(x.id) ? { ...x, id: newId() } : x));
        await commit([...list, ...added], `Imported ${added.length} flash screen${added.length === 1 ? "" : "s"}${added.length < incoming.length ? ` (${incoming.length - added.length} over the limit were skipped)` : ""}.`);
        this.selectedId = added[0].id; this.draft = null; break;
      }
      case "flash-key-go": this.layerIndex = Number(b.dataset.index); this.time = Number(b.dataset.at); break;
      case "flash-key-add": { const layer = this.edit().layers[this.layerIndex]; layer.keys ??= []; this.keyForEdit(layer); break; }
      case "flash-key-remove": { const layer = this.edit().layers[this.layerIndex], key = this.keyAtPlayhead(layer); layer.keys = layer.keys.filter((k) => k !== key); break; }
      case "flash-add": {
        const layer = validateLayer({ kind: b.dataset.kind, name: FLASH_KINDS[b.dataset.kind], ...(b.dataset.kind === "text" ? { text: "New text" } : {}), ...(["sound", "flash", "shake"].includes(b.dataset.kind) ? { start: this.time, enter: "none", exit: "none" } : {}) }, s.duration);
        this.edit().layers.push(layer); this.layerIndex = s.layers.length - 1; this.time = this.restTime(s, this.layerIndex); break;
      }
      case "flash-layer-up": case "flash-layer-down": {
        const i = Number(b.dataset.index), j = action === "flash-layer-up" ? i + 1 : i - 1, layers = this.edit().layers;
        [layers[i], layers[j]] = [layers[j], layers[i]]; this.layerIndex = j; break;
      }
      case "flash-layer-remove": this.edit().layers.splice(Number(b.dataset.index), 1); this.layerIndex = Math.max(0, Math.min(this.layerIndex, s.layers.length - 1)); break;
      case "flash-browse": {
        const sound = b.dataset.target === "sound", layerSound = b.dataset.target === "layer-sound", background = b.dataset.target === "background", layer = s.layers[this.layerIndex];
        this.host.pickMedia(sound || layerSound ? "audio" : "imagevideo", sound ? s.sound.file : layerSound ? layer?.file : background ? s.backdrop.media : layer?.src, (path) => {
          if (sound) this.edit().sound.file = path; else if (background) this.edit().backdrop.media = path; else if (layerSound && layer) this.edit().layers[this.layerIndex].file = path; else if (layer) this.edit().layers[this.layerIndex].src = path;
          this.w.render();
        });
        return true;
      }
      default: return false;
    }
    this.w.render();
    return true;
  }
}
