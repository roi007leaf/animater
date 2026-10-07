// JB2A 0.9.4 footage, reviewed against complete native descriptions.
// Each priority applies only when that edition contains compatible footage.
// Existing selection remains the Free fallback; figurative spell names do not
// opt into literal rain, webs, arrows or lava.
const pf2e = {
  mist: {area:'ambient_fog.001.complete.large.white',aura:'ambient_fog.001.loop.large.white'},
  'fog-cloud': {area:'ambient_fog.001.complete.large.white',aura:'ambient_fog.001.loop.large.white'},
  'frozen-fog': {area:'ambient_fog.001.complete.large.blue',aura:'ambient_fog.001.loop.large.blue'},
  'sanguine-mist': {area:'ambient_fog.001.complete.large.purplered',aura:'ambient_fog.001.loop.large.purplered'},
  'solid-fog': {area:'template_circle.smoke.001.complete.800px.001.white',aura:'template_circle.smoke.001.loop.800px.001.white'},
  'halcyon-mists': {hit:'ambient_fog.001.complete.small.white'},
  'soothing-mist': {aura:'ambient_fog.001.complete.small.greenyellow'},
  'misty-memory': {hit:'ambient_fog.001.complete.small.white'},
  'personal-rain-cloud': {aura:'template_square.raindrops.001.5x5.instant.combined.blue'},
  web: {area:'web.complete.002.white',hit:'web.complete.002.white',aura:'web.loop.002.white'},
  'volcanic-eruption': {area:'lava_spout.001.001.complete.orangeyellow'},
  'lava-leap': {hit:'lava_spout.001.001.complete.orangeyellow'},
  'volcanic-escape': {cast:'lava_spout.001.001.complete.orangeyellow',hit:'lava_spout.001.001.complete.orangeyellow'},
  'arrow-salvo': {hit:'volley_of_projectiles_Circle.arrow.001.001.white'},
};
const dnd5e = {
  'fog cloud': {area:'ambient_fog.001.complete.large.white',aura:'ambient_fog.001.loop.large.white'},
  web: {area:'web.complete.002.white',hit:'web.complete.002.white',aura:'web.loop.002.white'},
};
export function reviewedUpgradeRoots(context, slot) {
  const value=context.system==='dnd5e'
    ? dnd5e[String(context.name??'').toLowerCase()]?.[slot]
    : pf2e[context.slug]?.[slot];
  return value ? value.split(',') : [];
}
