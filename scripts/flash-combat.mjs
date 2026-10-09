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
  return standing.length === 1 ? "lastEnemy" : standing.length ? "enemyDown" : null;
}
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
    const unduck = valid.duck ? duck() : () => {};
    sound(valid);
    try { await run.play(); } finally { run.stop(); layer.remove(); unduck(); if (showing === run) showing = null; }
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
  function moment(event, extra = {}, combat = runningCombat()) {
    if (!combat?.started) return;
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
  // A critical hit: told by the client that rolled it.
  if (["pf2e", "sf2e"].includes(game.system.id)) Hooks.on("createChatMessage", (message) => {
    const context = message.flags?.[game.system.id]?.context;
    if ((message.author?.id ?? message.user?.id) === game.user.id && /attack-roll/.test(context?.type ?? "") && context?.outcome === "criticalSuccess")
      moment("crit", { name: message.speaker?.alias ?? message.actor?.name ?? "" });
  });
  if (game.system.id === "dnd5e") Hooks.on("dnd5e.rollAttackV2", (rolls, data) => {
    if (rolls?.[0]?.isCritical) moment("crit", { name: data?.subject?.actor?.name ?? data?.subject?.item?.actor?.name ?? "" });
  });

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
