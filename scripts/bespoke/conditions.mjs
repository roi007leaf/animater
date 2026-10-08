// Bespoke compositions (conditions). Keys: '<system>:<entryId>'.
// D&D 5e afflictions redrawn in the same debuff language as the PF2e/SF2e condition
// plans (tools/pf2e-condition-designs.mjs): compact, dim orbit markers or low, heavy
// overlays in desaturated colour with drooping, lurching or faltering motion. The
// generated D&D markers floated bright icons over the head or drew plain blue rings.
// Neutral or helpful states (cover, hiding, concentrating, flying...) keep their looks.
import { aura, tint, design } from './helpers.mjs';

const T = 'token';
const D = id => `dnd5e:dnd5e-${id}`;
const out = {};
const put = (ids, d) => { for (const id of [].concat(ids)) out[D(id)] = d; };
const st = (label, assets, o = {}) => aura(label, assets, { persist: true, duration: 6000, fadeIn: 400, fadeOut: 400, bindAlpha: true, bindRotation: false, offsetUnits: T, ...o });
const state = (why, layers) => design(why, () => layers.map(([label, assets, o]) => st(label, assets, o)));
const track = (property, from, to, duration, pingPong = true) => ({ property, from, to, duration, loop: true, pingPong, ease: 'easeInOutQuad' });
const flatten = value => [{ property: 'scale.y', from: value, to: value, duration: 6000 }];

// Shared layers.
const shadow = (o = {}) => ['Heavy shadow', ['drop_shadow.dark_black'], { scale: 0.8, offsetY: 0.15, below: true, opacity: 0.85, playbackRate: 0.5, ...o }];
const dust = o => ['Dust', ['ambient_fog.001.loop.small.white', 'fog_cloud.01.white'], { scale: 1.2, offsetY: 0.3, opacity: 0.75, below: true, playbackRate: 0.5, ...tint('#e3a338'), tracks: flatten(0.35), ...o }];
const breath = o => ['Laboured breath', ['smoke.plumes_loop.01.grey'], { scale: 0.6, offsetY: -0.28, opacity: 0.7, playbackRate: 0.45, ...tint('#8d9099'), ...o }];
// Visible-alpha center of the dark pink sleep symbol (see tools/pf2e-condition-designs.mjs).
const sleepAnchor = { customAnchor: true, anchorX: 0.6796875, anchorY: 0.31640625 };

put('conditions-dnd5eblinded0000', state('Blinded: a darkness clouds the eyes.', [
  ['Darkened sight', ['darkness.black'], { scale: 0.85, offsetY: -0.12, opacity: 0.78, ...tint('#555765') }],
]));
put('conditions-dnd5echarmed0000', state('Charmed: a dull mauve heart circles a creature whose will is not its own.', [
  ['Enthralled', ['markers.heart.pink.03'], { scale: 0.75, opacity: 0.9, ...tint('#c04aa8') }],
]));
put('conditions-dnd5edeafened000', state('Deafened: an ashen mute marker circles the creature.', [
  ['Deafened', ['markers.mute.dark_red.03', 'markers.mute.blue.03'], { scale: 0.8, opacity: 0.92, ...tint('#8d9099') }],
]));
put('conditions-dnd5eexhaustion0', state('Exhaustion: a slate sleep cue fades in and out over a sagging shadow.', [
  ['Weariness', ['sleep.symbol.dark_pink', 'sleep.symbol.pink'], { scale: 0.55, offsetY: -0.2, opacity: 0.7, playbackRate: 0.45, ...sleepAnchor, ...tint('#3f6fe0'), tracks: [track('alpha', 0.6, 0.7, 3500)] }],
  shadow({ tracks: [track('scale.y', 0.8, 0.95, 4200)] }),
]));
put('conditions-dnd5efrightened0', state('Frightened: a dark fear wisp circles the creature.', [
  ['Fear', ['markers.fear.dark_purple.03'], { scale: 1, opacity: 0.92 }],
]));
put('conditions-dnd5eincapacitat', state('Incapacitated: a dim stun marker circles a creature that cannot act.', [
  ['Incapacitated', ['markers.stun.dark_teal.03', 'markers.stun.purple.03'], { scale: 0.85, opacity: 0.8, ...tint('#8d9099') }],
]));
put('conditions-dnd5estunned0000', state('Stunned: a dark teal stun marker circles the reeling creature.', [
  ['Stunned', ['markers.stun.dark_teal.03', 'markers.stun.purple.03'], { scale: 0.95, opacity: 0.92, ...tint('#2fb8b0') }],
]));
// Invisible is a neutral stealth state: a faint refraction, never a skull mask.
put('conditions-dnd5einvisible00', state('Invisible: a faint refraction where the creature stands.', [
  ['Refraction', ['condition.boon.02.001.refraction'], { scale: 1.35, opacity: 0.8 }],
]));
put('conditions-dnd5eparalyzed00', state('Paralyzed: numb, barely-moving nerve crackle over a still shadow.', [
  ['Locked nerves', ['static_electricity.01.yellow', 'static_electricity.01.blue'], { scale: 0.95, opacity: 0.85, playbackRate: 0.2, ...tint('#e0c83a') }],
  shadow({ opacity: 0.8 }),
]));
put('conditions-dnd5epetrified00', state('Petrified: grey mineral settles inward over the body with a faint dust haze.', [
  ['Stone shell', ['aura_themed.01.inward.loop.metal.01.grey'], { scale: 1.3, opacity: 0.9, playbackRate: 0.4, ...tint('#8d9099') }],
  ['Settling dust', ['ambient_fog.001.loop.small.white', 'fog_cloud.01.white'], { scale: 1.1, opacity: 0.65, below: true, playbackRate: 0.4, ...tint('#8d9099') }],
]));
put('conditions-dnd5epoisoned000', state('Poisoned: a dark green poison marker circles the creature.', [
  ['Poisoned', ['markers.poison.dark_green.03'], { scale: 0.95, opacity: 0.92 }],
]));
put('conditions-dnd5eprone000000', state('Prone: a flattened shadow and low dust on the ground plane.', [
  shadow({ scale: 0.8, offsetY: 0.28, opacity: 0.9, tracks: flatten(0.4) }),
  dust(),
]));
put('conditions-dnd5edead0000000', state('Dead: a grave-violet skull over a pool of shadow.', [
  ['Death', ['markers.skull.purple.03'], { scale: 0.85, opacity: 0.92, ...tint('#7a3fc0') }],
  ['Grave shadow', ['darkness.black'], { scale: 1.15, offsetY: 0.1, below: true, opacity: 0.8, ...tint('#555765') }],
]));
put('conditions-dnd5ebloodied000', state('Bloodied: a blood drop circles the wounded creature.', [
  ['Bloodied', ['markers.drop.red.03'], { scale: 0.8, opacity: 0.92, ...tint('#d03040') }],
]));
put('conditions-dnd5ediseased000', state('Diseased: a bilious haze sways queasily around the sick creature.', [
  ['Fever haze', ['fumes.04.loop.green', 'fumes.04.loop.grey'], { scale: 1.05, offsetY: 0.1, opacity: 0.7, playbackRate: 0.5, ...tint('#8fc23a'), tracks: [track('rotation', -8, 8, 1800), track('scale.y', 0.9, 1.02, 1800)] }],
]));
put('conditions-dnd5eburning0000', state('Burning: flames cling to the body under a trail of smoke.', [
  ['Burning', ['flames.04.loop.orange'], { scale: 1.15, opacity: 0.85 }],
  ['Smoke', ['smoke.plumes_loop.01.grey'], { scale: 0.7, offsetY: -0.3, opacity: 0.7, playbackRate: 0.6 }],
]));
put('conditions-dnd5emalnutritio', state('Malnutrition: an ashen heart that keeps fading.', [
  ['Wasting', ['markers.heart.dark_red.03', 'markers.heart.pink.03'], { scale: 0.8, opacity: 0.92, ...tint('#8d9099'), tracks: [track('alpha', 0.6, 0.85, 2600)] }],
]));
put(['conditions-dnd5edehydration', 'effects-c5CkG3XDA5xfxpDM'], state('Dehydration: a dusty heat shimmer over a wilting shadow.', [
  ['Parched shimmer', ['shimmer.01.orange', 'shimmer.01.blue'], { scale: 0.8, opacity: 0.7, ...tint('#9a6a3c') }],
  shadow({ opacity: 0.75, tracks: [track('scale.y', 0.8, 0.95, 4200)] }),
]));
put('conditions-dnd5eencumbered0', state('Encumbered: a heavy shadow pressed flat at the feet.', [
  shadow({ scale: 0.8, offsetY: 0.26, opacity: 0.85, tracks: flatten(0.6) }),
]));
put('conditions-dnd5eheavilyEncu', state('Heavily Encumbered: a heavier shadow pressed flat and laboured breath.', [
  shadow({ scale: 0.8, offsetY: 0.28, opacity: 0.7, tracks: flatten(0.55) }),
  breath(),
]));
put('conditions-dnd5eexceedingCa', state('Exceeding Carrying Capacity: the load pins the creature in a dark pool and it gasps for breath.', [
  shadow({ scale: 1.35, offsetY: 0.28, opacity: 0.8, tracks: flatten(0.5) }),
  breath({ opacity: 0.8 }),
]));

// Starfinder 2e afflictions whose sf2e-c designs (bright static, drifting sparkles)
// read as power-ups; these match the CONDITION_PLANS used by the SF2e builder.
out['sf2e:6A2QDy8wRGCVQsSd'] = state('Glitching: steel-blue static that sputters on and off as the tech seizes up.', [
  ['Sputtering static', ['static_electricity.02.blue'], { scale: 1, opacity: 0.9, playbackRate: 0.6, ...tint('#3f6fe0'), tracks: [track('alpha', 0.6, 0.8, 350)] }],
]);
out['sf2e:z1ucw4CLwLqHoAp3'] = state('Untethered: the shadow detaches and wavers below a body that cannot push off.', [
  shadow({ scale: 0.8, offsetY: 0.35, opacity: 0.7, tracks: [track('scale.x', 0.75, 0.95, 3600), track('scale.y', 0.75, 0.95, 3600)] }),
  ['Drifting haze', ['fumes.04.loop.grey'], { scale: 0.85, opacity: 0.6, playbackRate: 0.3, ...tint('#8d9099'), tracks: [track('position.y', -0.06, 0.06, 3600)] }],
]);

export default out;
