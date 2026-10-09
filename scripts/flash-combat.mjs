// Flash screens at the table: world settings, the full-screen overlay on every
// client, and the combat hooks. The active GM decides which screen plays (the
// combat's own pick from the Combat Tracker, else the world default) and sends it
// to everyone, so all clients show the same screen once. Any client may notice a
// moment (a crit it rolled, a creature it dropped) and ask the active GM to play it.
import { STARTER_FLASHES, MOMENT_EVENTS, validateFlashes, validateFlash, chooseFlash, FLASH_EVENTS } from "./flash-model.mjs";
import { createFlash } from "./flash-render.mjs";

export const FLASH_SETTING = "flashScreens", FLASH_DEFAULTS = "flashDefaults";
const FRIENDLY = 1, HOSTILE = -1;
const sideOf = (actor, token) => (actor?.hasPlayerOwner || token?.disposition === FRIENDLY ? "party" : token?.disposition === HOSTILE ? "enemies" : "other");
const levelOf = (actor) => Number(actor?.level ?? actor?.system?.details?.level?.value ?? actor?.system?.details?.cr ?? 0) || 0;
const hpOf = (actor) => Number(actor?.system?.attributes?.hp?.value);
// The encounter's visible combatants, as the portraits layer shows them: player-owned or
// friendly tokens are the party, hostile ones the enemies. Hidden combatants never appear.
export function encounterPeople(combat) {
  return Array.from(combat?.combatants ?? []).flatMap((c) => {
    const token = c.token, actor = c.actor;
    if (c.hidden || token?.hidden) return [];
    return [{ name: c.name ?? token?.name ?? actor?.name ?? "", img: token?.texture?.src ?? "", portrait: actor?.img ?? "", side: sideOf(actor, token), level: levelOf(actor) }];
  });
}
// A creature dropping to 0 HP in combat: which moment it is (or none).
export function downMoment(combat, actor) {
  const combatant = Array.from(combat?.combatants ?? []).find((c) => c.actor?.id === actor?.id);
  if (!combatant || !combat?.started) return null;
  const side = sideOf(actor, combatant.token);
  if (side === "party") return "partyDown";
  if (side !== "enemies") return null;
  const standing = Array.from(combat.combatants).filter((c) => sideOf(c.actor, c.token) === "enemies" && !c.defeated && hpOf(c.actor) > 0);
  // The last one dropping is its own moment (Finish Him!); the combat's ending plays later, when it is closed.
  return standing.length === 1 ? "lastEnemy" : standing.length ? "enemyDown" : "finalEnemy";
}
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function registerFlashSettings(ID) {
  game.settings.register(ID, FLASH_SETTING, { scope: "world", config: false, type: Object, default: { schema: 1, screens: STARTER_FLASHES },
    onChange: () => ui.combat?.render() });
  game.settings.register(ID, FLASH_DEFAULTS, { scope: "world", config: false, type: Object, default: { start: "none", end: "none" },
    onChange: () => ui.combat?.render() });
}

// host: { ID, clientId, quietHere(), resolveMedia(src), trace(status, detail) }
export function flashScreens(host) {
  const { ID } = host;
  const screens = () => validateFlashes(game.settings.get(ID, FLASH_SETTING)?.screens);
  const defaults = () => ({ start: "none", end: "none", ...Object.fromEntries(MOMENT_EVENTS.map((e) => [e, "none"])), ...game.settings.get(ID, FLASH_DEFAULTS) });
  const vars = (combat = game.combat, extra = {}) => ({ scene: canvas.scene?.name ?? "", round: String(combat?.round ?? ""), combatants: encounterPeople(combat), ...extra });
  let showing = null;
  const playSound = (src, volume) => { if (src && !host.quietHere()) void foundry.audio.AudioHelper.play({ src, volume, loop: false }, false); };
  function sound(screen) { playSound(screen.sound.file, screen.sound.volume); }
  // Playing music dips while a screen shows, then comes back.
  function duck() {
    const restore = [];
    for (const playlist of game.playlists?.playing ?? []) for (const ps of playlist.sounds ?? []) {
      const snd = ps.playing ? ps.sound : null, volume = snd?.volume;
      if (!snd?.fade || !(volume > 0)) continue;
      void snd.fade(volume * 0.3, { duration: 250 });
      restore.push(() => void snd.fade(volume, { duration: 700 }));
    }
    return () => restore.forEach((r) => r());
  }
  // The scene behind the card: frozen (Foundry's canvas stops drawing) and tinted, until the card is gone.
  const LOOKS = { grey: "grayscale(1) brightness(0.8) contrast(1.1)", dark: "brightness(0.45)", sepia: "sepia(0.9) brightness(0.75)" };
  function freeze(look) {
    if (!LOOKS[look]) return () => {};
    const board = document.getElementById("board"), ticker = canvas?.app?.ticker, was = board?.style.filter ?? "";
    const running = ticker?.started;
    if (board) { board.style.transition = "filter 0.25s"; board.style.filter = LOOKS[look]; }
    if (running) ticker.stop();
    return () => { if (board) board.style.filter = was; if (running) ticker.start(); };
  }
  // Draw it full screen on this client.
  async function show(screen, v = vars()) {
    if (host.quietHere()) return;
    showing?.stop();
    const layer = document.createElement("div");
    layer.className = "an-flash-overlay";
    document.body.append(layer);
    const valid = validateFlash(screen);
    const run = createFlash(layer, valid, { resolveMedia: host.resolveMedia, vars: v, playSound });
    showing = run;
    const unduck = valid.duck ? duck() : () => {}, thaw = freeze(valid.backdrop.freeze);
    sound(valid);
    try { await run.play(); } finally { run.stop(); layer.remove(); unduck(); thaw(); if (showing === run) showing = null; }
  }
  function play(screen, { everyone = false, combat, extra } = {}) {
    if (!screen) return;
    const v = vars(combat, extra);
    if (everyone) game.socket.emit(`module.${ID}`, { type: "flash", sender: host.clientId, screen, vars: v });
    void show(screen, v).catch((error) => host.trace("Blocked", `Flash screen: ${error.message}`));
  }
  const activeGM = () => game.user.isGM && (game.users.activeGM ? game.users.activeGM.isSelf : true);
  const flagKey = (event) => (event === "start" ? "flashStart" : "flashEnd");
  function forCombat(combat, event) {
    const pick = ["start", "end"].includes(event) ? combat?.getFlag?.(ID, flagKey(event)) : undefined;
    return chooseFlash(screens(), event, pick, defaults()[event]);
  }
  // A moment during combat: the active GM plays it; anyone else asks the active GM to.
  // Moments never interrupt a screen that is already showing.
  // The combat a moment belongs to: the one given, else a started combat on this scene (an
  // unstarted encounter may be the "current" one), else the current one.
  const runningCombat = (actor) => game.combats?.find((c) => c.started && (actor ? Array.from(c.combatants).some((cb) => cb.actor?.id === actor.id) : c.scene?.id === canvas.scene?.id)) ?? game.combat;
  // The last enemy falls once per combat (dropping to 0 HP, then being marked defeated, is one fall).
  const finales = new Set();
  function moment(event, extra = {}, combat = runningCombat()) {
    if (!combat?.started) return;
    if (event === "finalEnemy" && activeGM()) { if (finales.has(combat.id)) return; finales.add(combat.id); }
    if (!activeGM()) return void game.socket.emit(`module.${ID}`, { type: "flash-moment", sender: host.clientId, event, extra, combatId: combat.id });
    if (showing) return;
    play(forCombat(combat, event), { everyone: true, combat, extra });
  }
  function receive(data) {
    if (data?.type === "flash" && data.screen) void show(data.screen, data.vars ?? {}).catch(() => {});
    if (data?.type === "flash-moment" && MOMENT_EVENTS.includes(data.event) && activeGM()) moment(data.event, { name: String(data.extra?.name ?? "").slice(0, 80) }, game.combats?.get(data.combatId) ?? runningCombat());
  }
  Hooks.on("combatStart", (combat) => { if (activeGM()) play(forCombat(combat, "start"), { everyone: true, combat }); });
  Hooks.on("deleteCombat", (combat) => { if (activeGM() && combat.started) play(forCombat(combat, "end"), { everyone: true, combat }); });
  // A new round (round 1 is the opening).
  Hooks.on("updateCombat", (combat, changes) => { if (activeGM() && "round" in changes && combat.round > 1 && combat.started) moment("round", {}, combat); });
  // A creature dropping to 0 HP: told by the client that changed its HP.
  Hooks.on("updateActor", (actor, changes, options, userId) => {
    if (userId !== game.user.id || !(options.animaterHpBefore > 0) || !(hpOf(actor) <= 0)) return;
    const combat = runningCombat(actor), event = downMoment(combat, actor);
    if (event) moment(event, { name: actor.name }, combat);
  });
  // A creature marked defeated (dead) without dropping to 0 HP first: told by the client that marked it.
  Hooks.on("updateCombatant", (combatant, changes, options, userId) => {
    if (userId !== game.user.id || changes.defeated !== true || !(hpOf(combatant.actor) > 0)) return;
    const event = downMoment(combatant.combat, combatant.actor);
    if (event) moment(event, { name: combatant.name ?? combatant.actor?.name ?? "" }, combatant.combat);
  });
  // A critical hit: told by the client that rolled it.
  if (["pf2e", "sf2e"].includes(game.system.id)) Hooks.on("createChatMessage", (message) => {
    const context = message.flags?.[game.system.id]?.context;
    if ((message.author?.id ?? message.user?.id) === game.user.id && /attack-roll/.test(context?.type ?? "") && context?.outcome === "criticalSuccess")
      moment("crit", { name: message.speaker?.alias ?? message.actor?.name ?? "" });
  });
  if (game.system.id === "dnd5e") Hooks.on("dnd5e.rollAttackV2", (rolls, data) => {
    if (rolls?.[0]?.isCritical) moment("crit", { name: data?.subject?.actor?.name ?? data?.subject?.item?.actor?.name ?? "" });
  });

  // The GM picks a combat's opening and ending screens in two small menus, plus a preview.
  let showDefaults = false;
  function picker(combat) {
    const all = screens(), d = defaults();
    const fitting = (event) => all.filter((s) => s.event === event || s.event === "any");
    const menu = (event) => {
      const fits = all.filter((s) => s.event === event || s.event === "any");
      const fallback = d[event] === "random" ? "Random" : all.find((s) => s.id === d[event])?.name ?? "None";
      const value = combat.getFlag(ID, flagKey(event)) ?? "";
      const opts = [["", `Default (${fallback})`], ["random", "Random"], ["none", "None"], ...fits.map((s) => [s.id, s.name])];
      return `<label title="${event === "start" ? "Flash screen when this combat starts" : "Flash screen when this combat ends"}">${event === "start" ? "Opening" : "Ending"}<select data-animater-flash="${event}">${opts.map(([k, v]) => `<option value="${esc(k)}" ${k === value ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`;
    };
    const bar = document.createElement("div");
    bar.className = "animater-flash-pick";
    // The world defaults (used when a combat picks nothing), behind the ⚙.
    const defaultMenu = (event) => `<label>${event === "start" ? "Default opening" : "Default ending"}<select data-animater-flash-default="${event}">${[["none", "None"], ["random", "Random"], ...fitting(event).map((s) => [s.id, s.name])].map(([k, v]) => `<option value="${esc(k)}" ${k === (d[event] ?? "none") ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`;
    bar.innerHTML = `<span aria-hidden="true">⚡</span>${menu("start")}${menu("end")}<span class="animater-flash-tools"><button type="button" data-animater-flash-defaults class="${showDefaults ? "active" : ""}" title="Defaults for every combat" aria-label="Defaults for every combat" aria-expanded="${showDefaults}"><i class="fa-solid fa-gear"></i></button><button type="button" data-animater-flash-test title="Preview this combat's opening on your screen" aria-label="Preview opening flash screen">▶</button></span>${showDefaults ? `<span class="animater-flash-defaults">${defaultMenu("start")}${defaultMenu("end")}<span class="animater-flash-moments-title">During combat</span>${MOMENT_EVENTS.map((ev) => `<label>${esc(FLASH_EVENTS[ev])}<select data-animater-flash-default="${ev}">${[["none", "Off"], ...fitting(ev).filter((s) => s.event === ev).map((s) => [s.id, s.name])].map(([k, v]) => `<option value="${esc(k)}" ${k === (d[ev] ?? "none") ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`).join("")}</span>` : ""}`;
    bar.querySelector("[data-animater-flash-defaults]").addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); showDefaults = !showDefaults; bar.replaceWith(Object.assign(picker(combat), { className: bar.className })); });
    bar.addEventListener("change", (e) => {
      const world = e.target.dataset.animaterFlashDefault;
      if (world) return void game.settings.set(ID, FLASH_DEFAULTS, { ...defaults(), [world]: e.target.value });
      const event = e.target.dataset.animaterFlash;
      if (event) void (e.target.value ? combat.setFlag(ID, flagKey(event), e.target.value) : combat.unsetFlag(ID, flagKey(event)));
    });
    bar.querySelector("[data-animater-flash-test]").addEventListener("click", () => play(forCombat(combat, "start"), { combat }));
    return bar;
  }
  // Foundry's Combat Tracker: the menus sit in its header.
  Hooks.on("renderCombatTracker", (app, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    const combat = app.viewed ?? game.combat;
    if (!game.user.isGM || !root || !combat) return;
    root.querySelector(".animater-flash-pick")?.remove();
    const bar = picker(combat), header = root.querySelector(".combat-tracker-header, header");
    if (header) header.append(bar); else root.prepend(bar);
  });
  // PF2e HUD's tracker: a ⚡ button in its header (its footer has no room) opens the same menus.
  let hudOpen = false;
  Hooks.on("renderApplicationV2", (app, element) => {
    if (app.id !== "pf2e-hud-tracker" || !game.user.isGM) return;
    const root = element instanceof HTMLElement ? element : app.element, combat = app.viewed ?? app.combat ?? game.combat;
    const header = root?.querySelector(":scope > header, header"), footer = root?.querySelector("footer");
    if (!(header || footer) || !combat) return;
    root.querySelector(".animater-flash-hud")?.remove();
    root.querySelector(".animater-flash-pick")?.remove();
    const toggle = document.createElement("a");
    toggle.className = `combat-control animater-flash-hud${hudOpen ? " active" : ""}`;
    toggle.dataset.tooltip = "Flash screens: this combat's opening and ending";
    toggle.setAttribute("aria-label", "Flash screens");
    toggle.innerHTML = `<i class="fa-solid fa-bolt"></i>`;
    const place = () => {
      root.querySelector(".animater-flash-pick")?.remove();
      const panel = Object.assign(picker(combat), { className: "animater-flash-pick is-hud" });
      if (hudOpen) { if (header) header.after(panel); else footer.before(panel); }
    };
    toggle.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); hudOpen = !hudOpen; toggle.classList.toggle("active", hudOpen); place(); });
    if (header) header.append(toggle);
    else { const settings = footer.querySelector(".settings"); if (settings) settings.before(toggle); else footer.append(toggle); }
    place();
  });

  // Before an animation: the recipe's screen plays for everyone, and the animation waits until it starts fading.
  async function before(recipe, context = {}) {
    const screen = screens().find((s) => s.id === recipe.flash);
    if (!screen) return;
    const actor = context.actor ?? context.source?.actor ?? context.source?.document?.actor;
    const token = context.source?.document ?? context.source;
    // Who is acting, for a cut-in portrait.
    const who = actor || token ? { name: context.source?.name ?? actor?.name ?? "", img: token?.texture?.src ?? actor?.prototypeToken?.texture?.src ?? "", portrait: actor?.img ?? "" } : null;
    play(screen, { everyone: true, extra: { name: context.source?.name ?? actor?.name ?? "", action: context.item?.name ?? recipe.name, ...(who ? { actor: who } : {}) } });
    await new Promise((r) => setTimeout(r, Math.max(0, screen.duration - 400)));
  }
  return {
    screens, defaults, vars, play, receive, sound, playSound, before,
    save: (list) => game.settings.set(ID, FLASH_SETTING, { schema: 1, screens: validateFlashes(list) }),
    setDefault: (event, id) => game.settings.set(ID, FLASH_DEFAULTS, { ...defaults(), [event]: id }),
    events: FLASH_EVENTS,
  };
}
