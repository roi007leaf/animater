// Combat moments (optional): a pulse on every combatant when combat starts, and a
// ring under whoever's turn it is. Only the active GM draws them, so they appear
// once; the ring is one shared Sequencer effect that moves as turns change.
export const COMBAT_MOMENTS = "combatMoments";
export const COMBAT_CHOICES = Object.freeze({
  off: "Off",
  turn: "Turn marker only",
  all: "Combat start pulse and turn marker",
});
export const TURN_MARKER = "animater-turn-marker";
export const MARKER_ASSETS = ["jb2a.token_border.circle.spinning.blue", "jb2a.extras.tmfx.border.circle.simple"];
export const START_ASSETS = ["jb2a.zoning.outward.circle.once.redyellow", "jb2a.extras.tmfx.outpulse.circle.02.normal"];

// host: { mode(), isActiveGM(), sceneId(), tokenOf(combatant), firstInstalled(keys),
//         users(), sequence(), end(name) }
export function combatMoments(host) {
  const active = () => host.isActiveGM() && host.mode() !== "off";
  const onScene = (combat) => !combat?.scene || combat.scene.id === host.sceneId();
  // Only the active GM touches the shared ring.
  async function clearMarker() { if (host.isActiveGM()) await host.end(TURN_MARKER); }
  async function markTurn(combat) {
    if (!host.isActiveGM()) return;
    await clearMarker();
    if (!active() || !combat?.started || !onScene(combat)) return;
    const token = host.tokenOf(combat.combatant), file = host.firstInstalled(MARKER_ASSETS);
    if (!token || !file) return;
    const users = host.users();
    const s = host.sequence().effect().file(file).name(TURN_MARKER).attachTo(token, { bindVisibility: true, bindAlpha: false })
      .scaleToObject(1.5).belowTokens().persist().fadeIn(300).fadeOut(300).opacity(0.85);
    if (users) s.forUsers(users);
    await s.play();
  }
  async function pulseStart(combat) {
    if (!active() || host.mode() !== "all" || !onScene(combat)) return;
    const file = host.firstInstalled(START_ASSETS);
    if (!file) return;
    const users = host.users(), seq = host.sequence();
    let pulses = 0;
    for (const combatant of combat.combatants ?? []) {
      const token = host.tokenOf(combatant);
      if (!token || combatant.hidden) continue;
      const e = seq.effect().file(file).atLocation(token).scaleToObject(2).belowTokens().fadeOut(400);
      if (users) e.forUsers(users);
      pulses++;
    }
    if (pulses) await seq.play();
  }
  return { markTurn, pulseStart, clearMarker };
}
