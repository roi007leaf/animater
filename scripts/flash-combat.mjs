// Flash screens at the table: world settings, the full-screen overlay on every
// client, and the combat hooks. The active GM decides which screen plays (the
// combat's own pick from the Combat Tracker, else the world default) and sends it
// to everyone, so all clients show the same screen once.
import { STARTER_FLASHES, validateFlashes, validateFlash, chooseFlash, FLASH_EVENTS } from "./flash-model.mjs";
import { createFlash } from "./flash-render.mjs";

export const FLASH_SETTING = "flashScreens", FLASH_DEFAULTS = "flashDefaults";
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function registerFlashSettings(ID) {
  game.settings.register(ID, FLASH_SETTING, { scope: "world", config: false, type: Object, default: { schema: 1, screens: STARTER_FLASHES },
    onChange: () => ui.combat?.render() });
  game.settings.register(ID, FLASH_DEFAULTS, { scope: "world", config: false, type: Object, default: { start: "start-initiative", end: "end-victory" },
    onChange: () => ui.combat?.render() });
}

// host: { ID, clientId, quietHere(), resolveMedia(src), trace(status, detail) }
export function flashScreens(host) {
  const { ID } = host;
  const screens = () => validateFlashes(game.settings.get(ID, FLASH_SETTING)?.screens);
  const defaults = () => ({ start: "none", end: "none", ...game.settings.get(ID, FLASH_DEFAULTS) });
  const vars = (combat = game.combat) => ({ scene: canvas.scene?.name ?? "", round: String(combat?.round ?? "") });
  let showing = null;
  const playSound = (src, volume) => { if (src && !host.quietHere()) void foundry.audio.AudioHelper.play({ src, volume, loop: false }, false); };
  function sound(screen) { playSound(screen.sound.file, screen.sound.volume); }
  // Draw it full screen on this client.
  async function show(screen, v = vars()) {
    if (host.quietHere()) return;
    showing?.stop();
    const layer = document.createElement("div");
    layer.className = "an-flash-overlay";
    document.body.append(layer);
    const run = createFlash(layer, validateFlash(screen), { resolveMedia: host.resolveMedia, vars: v, playSound });
    showing = run;
    sound(screen);
    try { await run.play(); } finally { run.stop(); layer.remove(); if (showing === run) showing = null; }
  }
  function play(screen, { everyone = false, combat } = {}) {
    if (!screen) return;
    const v = vars(combat);
    if (everyone) game.socket.emit(`module.${ID}`, { type: "flash", sender: host.clientId, screen, vars: v });
    void show(screen, v).catch((error) => host.trace("Blocked", `Flash screen: ${error.message}`));
  }
  function receive(data) {
    if (data?.type === "flash" && data.screen) void show(data.screen, data.vars ?? {}).catch(() => {});
  }
  const activeGM = () => game.user.isGM && (game.users.activeGM ? game.users.activeGM.isSelf : true);
  const flagKey = (event) => (event === "start" ? "flashStart" : "flashEnd");
  function forCombat(combat, event) {
    return chooseFlash(screens(), event, combat?.getFlag?.(ID, flagKey(event)), defaults()[event]);
  }
  Hooks.on("combatStart", (combat) => { if (activeGM()) play(forCombat(combat, "start"), { everyone: true, combat }); });
  Hooks.on("deleteCombat", (combat) => { if (activeGM() && combat.started) play(forCombat(combat, "end"), { everyone: true, combat }); });

  // Combat Tracker: the GM picks this combat's opening and ending screens in two small menus.
  Hooks.on("renderCombatTracker", (app, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    const combat = app.viewed ?? game.combat;
    if (!game.user.isGM || !root || !combat) return;
    root.querySelector(".animater-flash-pick")?.remove();
    const all = screens(), d = defaults();
    const menu = (event) => {
      const fits = all.filter((s) => s.event === event || s.event === "any");
      const fallback = d[event] === "random" ? "Random" : all.find((s) => s.id === d[event])?.name ?? "None";
      const value = combat.getFlag(ID, flagKey(event)) ?? "";
      const opts = [["", `Default (${fallback})`], ["random", "Random"], ["none", "None"], ...fits.map((s) => [s.id, s.name])];
      return `<label title="${event === "start" ? "Flash screen when this combat starts" : "Flash screen when this combat ends"}">${event === "start" ? "Opening" : "Ending"}<select data-animater-flash="${event}">${opts.map(([k, v]) => `<option value="${esc(k)}" ${k === value ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`;
    };
    const bar = document.createElement("div");
    bar.className = "animater-flash-pick";
    bar.innerHTML = `<span aria-hidden="true">⚡</span>${menu("start")}${menu("end")}<button type="button" data-animater-flash-test title="Preview this combat's opening on your screen" aria-label="Preview opening flash screen">▶</button>`;
    bar.addEventListener("change", (e) => {
      const event = e.target.dataset.animaterFlash;
      if (event) void (e.target.value ? combat.setFlag(ID, flagKey(event), e.target.value) : combat.unsetFlag(ID, flagKey(event)));
    });
    bar.querySelector("[data-animater-flash-test]").addEventListener("click", () => play(forCombat(combat, "start"), { combat }));
    const header = root.querySelector(".combat-tracker-header, header");
    if (header) header.append(bar); else root.prepend(bar);
  });

  return {
    screens, defaults, vars, play, receive, sound, playSound,
    save: (list) => game.settings.set(ID, FLASH_SETTING, { schema: 1, screens: validateFlashes(list) }),
    setDefault: (event, id) => game.settings.set(ID, FLASH_DEFAULTS, { ...defaults(), [event]: id }),
    events: FLASH_EVENTS,
  };
}
