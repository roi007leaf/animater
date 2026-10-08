// Condition body treatments: the creature itself reacts while a lasting condition
// is active (trembling in fear, swaying with nausea, turned to grey stone…).
// Applied locally to the token's sprite every frame and fully restored on removal;
// the token document never moves. One-off token motions (attacks, recoils) take
// priority: the treatment steps aside while they play.

// Condition names (D&D 5e, PF2e, SF2e) → treatment.
const BY_NAME = {
  frightened: 'tremble', fleeing: 'tremble',
  poisoned: 'sway', diseased: 'sway', sickened: 'sway', charmed: 'sway', fascinated: 'sway',
  stunned: 'wobble', incapacitated: 'wobble', confused: 'wobble', stupefied: 'wobble',
  exhaustion: 'sag', fatigued: 'sag', encumbered: 'sag', 'heavily encumbered': 'sag', 'exceeding carrying capacity': 'sag', drained: 'sag', enfeebled: 'sag',
  grappled: 'struggle', grabbed: 'struggle', restrained: 'struggle', immobilized: 'struggle',
  blinded: 'search',
  unconscious: 'breathe', sleeping: 'breathe', dying: 'breathe',
  petrified: 'stone',
  paralyzed: 'still',
};
export function bodyTreatment(name = '') {
  const key = String(name).toLowerCase().replace(/^(?:condition|effect)\s*:\s*/, '').replace(/\s+\d+$/, '').trim();
  return BY_NAME[key] ?? null;
}
const TAU = Math.PI * 2, wave = (t, period) => Math.sin((TAU * t) / period);
// Pose deltas: x/y in token widths, rotation in degrees, sy as a scale factor.
export function bodyPose(kind, t, strength = 1) {
  const k = strength;
  switch (kind) {
    case 'tremble': return { x: 0.012 * k * wave(t, 0.11), y: 0.006 * k * wave(t, 0.17), r: 0.8 * k * wave(t, 0.13) };
    case 'sway': return { x: 0.02 * k * wave(t, 2.6), r: 4 * k * wave(t, 2.6) };
    case 'wobble': return { y: 0.012 * k * wave(t, 0.7), r: 6 * k * wave(t, 1.4) };
    case 'sag': { const s = 0.5 + 0.5 * wave(t, 3.6); return { y: 0.02 * k * s, sy: 1 - 0.04 * k * s }; }
    case 'struggle': { const burst = wave(t, 1.7) > 0.3 ? 1 : 0.2; return { x: 0.008 * k * burst * wave(t, 0.23), r: 3 * k * burst * wave(t, 0.33) }; }
    case 'search': return { r: 9 * k * wave(t, 3.2) };
    case 'breathe': return { sy: 1 - 0.025 * k * (0.5 + 0.5 * wave(t, 4)) };
    default: return {};
  }
}

export class ConditionBody {
  constructor({ tokenMagic = () => globalThis.TokenMagic, now = () => performance.now(), frame = cb => requestAnimationFrame(cb), cancel = h => cancelAnimationFrame(h), busy = () => false, enabled = () => true } = {}) {
    Object.assign(this, { tokenMagic, now, frame, cancel, busy, enabled });
    this.records = new Map();
    this.handle = null;
  }
  add(name, token, kind, { strength = 1 } = {}) {
    if (!kind || !token?.mesh) return;
    this.remove(name);
    const record = { token, kind, strength, start: this.now(), applied: null };
    if (kind === 'stone') {
      // Turned to stone: drain the colour, no overlay at all. A raw PIXI filter on
      // a v14 token mesh renders black with streaks, so Token Magic's transient
      // (this screen only, nothing saved) adjustment filter does it; without
      // Token Magic the sprite is tinted stone grey.
      const api = this.tokenMagic?.();
      if (api?.togglePreset) {
        const id = `animater-stone-${name}`;
        record.stone = { api, preset: { name: id, library: 'animater', params: [{ filterType: 'adjustment', filterId: id, saturation: 0.08, brightness: 0.95, contrast: 1.1, gamma: 1, red: 1, green: 1, blue: 1, alpha: 1, enabled: true }] } };
        void Promise.resolve(api.togglePreset(token, record.stone.preset, { action: 'add', transient: true })).catch(() => {});
      } else {
        record.tint = token.mesh.tint;
        token.mesh.tint = 0xa39e94;
      }
    }
    this.records.set(name, record);
    if (!this.handle) this.handle = this.frame(() => this.tick());
  }
  remove(name) {
    const r = this.records.get(name);
    if (!r) return;
    this.records.delete(name);
    this.restore(r);
    if (r.stone) void Promise.resolve(r.stone.api.togglePreset(r.token, r.stone.preset, { action: 'remove', transient: true })).catch(() => {});
    if (r.tint !== undefined && r.token.mesh && !r.token.mesh.destroyed) r.token.mesh.tint = r.tint;
    if (!this.records.size && this.handle) { this.cancel(this.handle); this.handle = null; }
  }
  clear() { for (const name of [...this.records.keys()]) this.remove(name); }
  // Undo only what this treatment set; if the token refreshed in between, its
  // pose is already natural and there is nothing to undo.
  restore(r) {
    const mesh = r.token.mesh, a = r.applied;
    if (!a || !mesh || mesh.destroyed) { r.applied = null; return; }
    if (mesh.position.x === a.setX) mesh.position.x = a.baseX;
    if (mesh.position.y === a.setY) mesh.position.y = a.baseY;
    if (mesh.rotation === a.setR) mesh.rotation = a.baseR;
    if (mesh.scale.y === a.setSY) mesh.scale.y = a.baseSY;
    r.applied = null;
  }
  tick() {
    this.handle = null;
    if (!this.records.size) return;
    const time = this.now(), on = this.enabled();
    for (const r of this.records.values()) {
      const token = r.token, mesh = token?.mesh;
      if (!mesh || mesh.destroyed || token.destroyed) continue;
      if (!on || this.busy(token) || ['stone', 'still'].includes(r.kind)) { this.restore(r); continue; }
      const a = r.applied;
      // Natural pose: what Foundry last set, minus our own delta if still in place.
      const baseX = a && mesh.position.x === a.setX ? a.baseX : mesh.position.x;
      const baseY = a && mesh.position.y === a.setY ? a.baseY : mesh.position.y;
      const baseR = a && mesh.rotation === a.setR ? a.baseR : mesh.rotation;
      const baseSY = a && mesh.scale.y === a.setSY ? a.baseSY : mesh.scale.y;
      const pose = bodyPose(r.kind, (time - r.start) / 1000, r.strength), w = token.w ?? 100;
      mesh.position.x = baseX + (pose.x ?? 0) * w;
      mesh.position.y = baseY + (pose.y ?? 0) * w;
      mesh.rotation = baseR + ((pose.r ?? 0) * Math.PI) / 180;
      mesh.scale.y = baseSY * (pose.sy ?? 1);
      r.applied = { baseX, baseY, baseR, baseSY, setX: mesh.position.x, setY: mesh.position.y, setR: mesh.rotation, setSY: mesh.scale.y };
    }
    if (this.records.size) this.handle = this.frame(() => this.tick());
  }
}
