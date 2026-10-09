// The Flash screens page: a library of combat title cards and an editor with a
// live 16:9 stage (drag layers to place them), a scrub bar, a layer timeline and
// an inspector for the selected layer.
import { FLASH_EVENTS, FLASH_MOTIONS, FLASH_KINDS, LAYER_LIMIT, FLASH_LIMIT, validateFlash, validateLayer } from "./flash-model.mjs";
import { createFlash } from "./flash-render.mjs";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const options = (choices, value) => Object.entries(choices).map(([k, v]) => `<option value="${esc(k)}" ${k === value ? "selected" : ""}>${esc(v)}</option>`).join("");
const clone = (v) => JSON.parse(JSON.stringify(v));
const newId = () => crypto.randomUUID().slice(0, 12);
const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;

export class FlashEditor {
  constructor(w) { this.w = w; this.host = w.host; this.selectedId = null; this.draft = null; this.dirty = false; this.layerIndex = 0; this.time = 0; this.preview = null; }
  screens() { return this.host.flashScreens(); }
  current() {
    if (!this.draft || this.draft.id !== this.selectedId) {
      const saved = this.screens().find((s) => s.id === this.selectedId) ?? this.screens()[0];
      this.selectedId = saved?.id ?? null;
      this.draft = saved ? clone(saved) : null;
      this.dirty = false; this.layerIndex = 0; this.time = saved ? this.restTime(saved, 0) : 0;
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
  edit() { this.dirty = true; return this.draft; }

  html() {
    const list = this.screens(), s = this.current(), defaults = this.host.flashDefaults();
    const card = (f) => `<button class="an-flash-card ${f.id === this.selectedId ? "is-selected" : ""}" data-action="flash-select" data-id="${esc(f.id)}"><b>${esc(f.name)}${f.id === this.selectedId && this.dirty ? " •" : ""}</b><small>${esc(FLASH_EVENTS[f.event])}${defaults.start === f.id ? " · default opening" : ""}${defaults.end === f.id ? " · default ending" : ""}</small></button>`;
    const listHTML = `<aside class="an-flash-list"><div class="an-section-title"><b>Flash screens</b><button class="an-primary" data-action="flash-new" ${list.length >= FLASH_LIMIT ? "disabled" : ""}>+ New</button></div>${list.map(card).join("") || `<p class="an-hint">No flash screens yet.</p>`}<p class="an-hint">Played to everyone when combat starts or ends. Pick one per combat from the Combat Tracker, or set defaults here.</p></aside>`;
    if (!s) return `<section class="an-flash-page">${listHTML}<div class="an-flash-main an-preview-empty">Create a flash screen to begin.</div></section>`;
    const layer = s.layers[this.layerIndex];
    const isDefault = (ev) => defaults[ev] === s.id;
    const head = `<div class="an-flash-head"><input class="an-st-name" aria-label="Flash screen name" data-flash-field="name" value="${esc(s.name)}"><label>Plays at<select data-flash-field="event">${options(FLASH_EVENTS, s.event)}</select></label><label>Length (s)<input type="number" min="1" max="12" step="0.1" data-flash-field="duration" value="${(s.duration / 1000).toFixed(1)}"></label><div class="an-flash-actions"><button class="an-icon" data-action="flash-duplicate" data-tooltip="Duplicate" aria-label="Duplicate">⧉</button><button class="an-icon is-danger" data-action="flash-delete" data-tooltip="Delete" aria-label="Delete"><i class="fas fa-trash" aria-hidden="true"></i></button><button data-action="flash-revert" ${this.dirty ? "" : "disabled"}>Revert</button><button class="an-primary" data-action="flash-save" ${this.dirty ? "" : "disabled"}>${this.dirty ? "Save" : "Saved ✓"}</button></div></div>`;
    const stage = `<div class="an-flash-stage-wrap"><div class="an-flash-frame" data-flash-stage aria-label="Flash screen preview: drag a layer to move it"></div></div>
      <div class="an-flash-transport"><button class="an-primary" data-action="flash-preview">▶ Preview</button><button data-action="flash-play-all" data-tooltip="Play it now on every player's screen">Play for everyone</button><input type="range" min="0" max="${s.duration}" step="10" value="${this.time}" data-flash-time aria-label="Scrub"><span data-flash-clock>${seconds(this.time)} / ${seconds(s.duration)}</span></div>`;
    const pct = (ms) => ((ms / s.duration) * 100).toFixed(2);
    const rows = s.layers.map((l, i) => {
      const end = l.duration > 0 ? Math.min(s.duration, l.start + l.duration) : s.duration;
      return `<div class="an-flash-row ${i === this.layerIndex ? "is-selected" : ""}"><button class="an-flash-row-name" data-action="flash-layer" data-index="${i}">${esc(l.name || FLASH_KINDS[l.kind])}</button><div class="an-flash-row-track" data-action="flash-layer" data-index="${i}"><span class="an-flash-row-bar kind-${l.kind}" style="left:${pct(l.start)}%;width:${pct(end - l.start)}%"></span><span class="an-flash-row-head" style="left:${pct(this.time)}%"></span></div><span class="an-flash-row-tools"><button data-action="flash-layer-up" data-index="${i}" aria-label="Bring forward" ${i === s.layers.length - 1 ? "disabled" : ""}>▲</button><button data-action="flash-layer-down" data-index="${i}" aria-label="Send back" ${i === 0 ? "disabled" : ""}>▼</button><button data-action="flash-layer-remove" data-index="${i}" aria-label="Remove layer">×</button></span></div>`;
    }).reverse().join("");
    const full = s.layers.length >= LAYER_LIMIT ? "disabled" : "";
    const layersHTML = `<div class="an-flash-layers"><div class="an-section-title"><b>Layers</b><span><button data-action="flash-add" data-kind="text" ${full}>+ Text</button><button data-action="flash-add" data-kind="image" ${full}>+ Image</button><button data-action="flash-add" data-kind="band" ${full}>+ Band</button></span></div>${rows || `<p class="an-hint">Add a text, image or band layer.</p>`}<p class="an-hint">Top of the list draws on top. Click a row to edit that layer; drag it on the stage to move it.</p></div>`;
    const scene = `<div class="an-editor-section"><b>Screen</b><div class="an-field-row"><label>Backdrop<input type="color" data-flash-field="backdrop.color" value="${s.backdrop.color}"></label><label>Darkness<input type="number" min="0" max="1" step="0.05" data-flash-field="backdrop.opacity" value="${s.backdrop.opacity}"></label></div><label class="an-check"><input type="checkbox" data-flash-field="backdrop.vignette" ${s.backdrop.vignette ? "checked" : ""}> Dark edges</label><label>Sound<span class="an-flash-sound"><input data-flash-field="sound.file" placeholder="sounds/drums.ogg" value="${esc(s.sound.file)}"><button data-action="flash-browse" data-target="sound" aria-label="Browse sounds">…</button></span></label><label>Volume<input type="number" min="0" max="1" step="0.05" data-flash-field="sound.volume" value="${s.sound.volume}"></label><div class="an-flash-defaults">${["start", "end"].filter((ev) => s.event === ev || s.event === "any").map((ev) => `<button class="${isDefault(ev) ? "an-primary" : ""}" data-action="flash-default" data-event="${ev}">${isDefault(ev) ? "✓ " : ""}Default ${ev === "start" ? "opening" : "ending"}</button>`).join("")}</div><p class="an-hint">The default plays for every combat unless the Combat Tracker picks another. Text can use {scene} and {round}.</p></div>`;
    return `<section class="an-flash-page">${listHTML}<div class="an-flash-main">${head}${stage}${layersHTML}</div><aside class="an-flash-inspector">${layer ? this.layerHTML(layer) : ""}${scene}</aside></section>`;
  }
  layerHTML(l) {
    const f = (key, label, value, attrs = "") => `<label>${label}<input data-flash-layer-field="${key}" value="${esc(value)}" ${attrs}></label>`;
    const n = (key, label, value, min, max, step) => f(key, label, value, `type="number" min="${min}" max="${max}" step="${step}"`);
    const c = (key, label, value) => `<label>${label}<input type="color" data-flash-layer-field="${key}" value="${value}"></label>`;
    const sel = (key, label, choices, value) => `<label>${label}<select data-flash-layer-field="${key}">${options(choices, value)}</select></label>`;
    const fonts = Object.fromEntries(this.host.flashFonts().map((name) => [name, name]));
    const kind = l.kind === "text"
      ? `<label>Text<textarea rows="2" data-flash-layer-field="text">${esc(l.text)}</textarea></label>${sel("font", "Font", fonts, l.font)}<div class="an-field-row">${n("size", "Size", l.size, 1, 40, 0.5)}${n("spacing", "Spacing", l.spacing, -0.1, 1, 0.01)}</div><div class="an-field-row">${c("color", "Color", l.color)}${c("outline", "Outline", l.outline)}${c("glow", "Glow", l.glow)}</div>${n("glowSize", "Glow size", l.glowSize, 0, 10, 0.5)}<div class="an-field-row"><label class="an-check"><input type="checkbox" data-flash-layer-field="bold" ${l.bold ? "checked" : ""}> Bold</label><label class="an-check"><input type="checkbox" data-flash-layer-field="italic" ${l.italic ? "checked" : ""}> Italic</label></div>`
      : l.kind === "image"
      ? `<label>Image or video<span class="an-flash-sound"><input data-flash-layer-field="src" placeholder="Choose a file or a JB2A key" value="${esc(l.src)}"><button data-action="flash-browse" data-target="image" aria-label="Browse images">…</button></span></label>${n("width", "Width (% of screen)", l.width, 1, 150, 1)}`
      : `<div class="an-field-row">${c("color", "Color", l.color)}${n("skew", "Slant", l.skew, -45, 45, 1)}</div><div class="an-field-row">${n("width", "Width %", l.width, 1, 150, 1)}${n("height", "Height %", l.height, 1, 100, 1)}</div>`;
    return `<div class="an-editor-section"><span class="an-eyebrow">${esc(FLASH_KINDS[l.kind]).toUpperCase()} LAYER</span>${f("name", "Layer name", l.name, `placeholder="${esc(FLASH_KINDS[l.kind])}"`)}${kind}
      <div class="an-field-row">${n("x", "X %", Math.round(l.x * 10) / 10, -20, 120, 0.5)}${n("y", "Y %", Math.round(l.y * 10) / 10, -20, 120, 0.5)}${n("rotate", "Rotate", l.rotate, -180, 180, 1)}</div>
      <div class="an-field-row">${n("start", "Starts (ms)", l.start, 0, 12000, 50)}${n("duration", "Lasts (ms, 0 = to end)", l.duration, 0, 12000, 50)}</div>
      <div class="an-field-row">${sel("enter", "Enters", FLASH_MOTIONS, l.enter)}${n("enterMs", "ms", l.enterMs, 0, 4000, 50)}</div>
      <div class="an-field-row">${sel("exit", "Leaves", FLASH_MOTIONS, l.exit)}${n("exitMs", "ms", l.exitMs, 0, 4000, 50)}</div>
      <div class="an-field-row">${n("opacity", "Opacity", l.opacity, 0, 1, 0.05)}<label class="an-check"><input type="checkbox" data-flash-layer-field="shake" ${l.shake ? "checked" : ""}> Shake on arrival</label></div></div>`;
  }

  // Redraw the stage at the current time (after every render or edit).
  mount() {
    const frame = this.w.root.querySelector("[data-flash-stage]");
    this.preview?.stop();
    this.preview = null;
    const s = this.current();
    if (!frame || !s) return;
    frame.replaceChildren();
    this.preview = createFlash(frame, validateFlash(s), { resolveMedia: (src) => this.host.resolveFlashMedia(src), vars: this.host.flashVars(), editing: true });
    this.preview.el.querySelector(`[data-flash-layer="${this.layerIndex}"]`)?.classList.add("is-selected");
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
    const field = t.dataset?.flashField, layerField = t.dataset?.flashLayerField;
    if (!field && !layerField) return false;
    const value = t.type === "checkbox" ? t.checked : t.type === "number" ? Number(t.value) : t.value;
    const s = this.edit();
    if (field === "duration") s.duration = Math.round(Number(t.value) * 1000);
    else if (field) { const [a, b] = field.split("."); if (b) s[a][b] = value; else s[a] = value; }
    else if (s.layers[this.layerIndex]) s.layers[this.layerIndex][layerField] = value;
    Object.assign(this.draft, validateFlash(s));
    this.mount();
    const save = this.w.root.querySelector('[data-action="flash-save"]');
    if (save) { save.disabled = false; save.textContent = "Save"; }
    const revert = this.w.root.querySelector('[data-action="flash-revert"]');
    if (revert) revert.disabled = false;
    return true;
  }
  change(t) {
    if (!t.dataset?.flashField && !t.dataset?.flashLayerField) return false;
    this.w.render();
    return true;
  }

  // Drag a layer on the stage to move it.
  pointer(e) {
    const el = e.target.closest?.("[data-flash-stage] [data-flash-layer]"), frame = el?.closest("[data-flash-stage]");
    if (!el || e.button !== 0) return false;
    e.preventDefault();
    const i = Number(el.dataset.flashLayer);
    if (i !== this.layerIndex) { this.layerIndex = i; this.w.render(); }
    const box = frame.getBoundingClientRect(), s = this.edit(), layer = s.layers[i];
    const move = (ev) => {
      layer.x = Math.round(((ev.clientX - box.left) / box.width) * 1000) / 10;
      layer.y = Math.round(((ev.clientY - box.top) / box.height) * 1000) / 10;
      const live = frame.querySelector(`[data-flash-layer="${i}"]`);
      if (live) { live.style.left = `${layer.x}%`; live.style.top = `${layer.y}%`; }
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); this.w.render(); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return true;
  }

  async action(action, b) {
    if (!action.startsWith("flash-")) return false;
    const list = this.screens();
    const s = this.current();
    const commit = async (next, message) => { await this.host.saveFlashScreens(next); this.dirty = false; this.w.message = message; };
    switch (action) {
      case "flash-select":
        if (this.dirty && b.dataset.id !== this.selectedId) throw Error("Save or revert this flash screen first.");
        this.selectedId = b.dataset.id; this.draft = null; break;
      case "flash-new": case "flash-duplicate": {
        if (this.dirty) throw Error("Save or revert this flash screen first.");
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
        this.preview?.stop();
        const frame = this.w.root.querySelector("[data-flash-stage]");
        frame.replaceChildren();
        this.preview = createFlash(frame, validateFlash(s), { resolveMedia: (src) => this.host.resolveFlashMedia(src), vars: this.host.flashVars(), editing: true });
        this.host.flashSound(s);
        await this.preview.play();
        this.mount();
        return true;
      }
      case "flash-play-all": this.host.playFlash(validateFlash(s), { everyone: true }); this.w.message = `Playing “${s.name}” for everyone.`; break;
      case "flash-layer": this.layerIndex = Number(b.dataset.index); this.time = this.restTime(s, this.layerIndex); break;
      case "flash-add": {
        const layer = validateLayer({ kind: b.dataset.kind, name: FLASH_KINDS[b.dataset.kind], ...(b.dataset.kind === "text" ? { text: "New text" } : {}) }, s.duration);
        this.edit().layers.push(layer); this.layerIndex = s.layers.length - 1; this.time = this.restTime(s, this.layerIndex); break;
      }
      case "flash-layer-up": case "flash-layer-down": {
        const i = Number(b.dataset.index), j = action === "flash-layer-up" ? i + 1 : i - 1, layers = this.edit().layers;
        [layers[i], layers[j]] = [layers[j], layers[i]]; this.layerIndex = j; break;
      }
      case "flash-layer-remove": this.edit().layers.splice(Number(b.dataset.index), 1); this.layerIndex = Math.max(0, Math.min(this.layerIndex, s.layers.length - 1)); break;
      case "flash-browse": {
        const sound = b.dataset.target === "sound", layer = s.layers[this.layerIndex];
        this.host.pickMedia(sound ? "audio" : "imagevideo", sound ? s.sound.file : layer?.src, (path) => {
          if (sound) this.edit().sound.file = path; else if (layer) this.edit().layers[this.layerIndex].src = path;
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
