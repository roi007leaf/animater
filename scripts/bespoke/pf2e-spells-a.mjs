// Bespoke compositions (pf2e-spells-a). Keys: '<system>:<entryId>' or '<system>:<entryId>:<variant|mode>'.
// See scripts/bespoke/helpers.mjs and scripts/bespoke.mjs.
import { cast, travel, projectile, impact, area, aura, sprite, motion, tint, spin, breathe, design } from './helpers.mjs';
export default {
  // Entropic Wheel: thermal energy stockpiled in a wheel-like construct that
  // burns with cold and freezes with heat. Heat and cold gather on opposite
  // sides, then a burning rim and an orbit of icy motes form and counter-rotate;
  // the first thermal mote kindles above the caster. Spell Effect: Entropic
  // Wheel keeps the same dual wheel turning for the duration.
  'pf2e:X4T5RlQBrdpmA35n': design('Heat and cold gather on opposite sides and form a counter-rotating wheel of flame and icy motes; the first thermal mote kindles.', () => [
    cast('Heat gathers', ['cast_generic.fire.01.orange'], { stageId: 'ew-heat', scale: 0.8, offsetX: -0.35, offsetUnits: 'token', duration: 900 }),
    cast('Cold gathers', ['cast_generic.ice.01.blue', 'cast_generic.fire.01.orange'], { stageId: 'ew-cold', scale: 0.8, offsetX: 0.35, offsetUnits: 'token', mirrorX: true, duration: 900, ...tint('#8cdcff') }),
    aura('Burning rim', ['fire_ring.500px.yellow', 'fire_ring.500px.red'], { stageId: 'ew-rim', after: 'ew-heat', anchor: 'start', offset: 650, duration: 2800, scale: 1.2, opacity: 0.75, below: true, fadeIn: 300, fadeOut: 500, ...tint('#ff8a3d'), ...spin(3500, 1) }),
    aura('Icy motes orbit', ['aura_themed.01.orbit.complete.cold.01.blue'], { stageId: 'ew-ice', after: 'ew-heat', anchor: 'start', offset: 650, duration: 2800, scale: 1.35, opacity: 0.85, fadeIn: 300, fadeOut: 500, ...spin(3500, -1) }),
    cast('First thermal mote', ['dancing_light.blueyellow', 'dancing_light.yellow'], { stageId: 'ew-mote', after: 'ew-rim', anchor: 'start', offset: 800, duration: 1600, scale: 0.3, offsetY: -0.6, offsetUnits: 'token', fadeIn: 200, fadeOut: 400 }),
    motion('pulse', 'source', { after: 'ew-rim', anchor: 'start', duration: 900, intensity: 0.5 }),
  ]),
};
