// Midnight domain card designs: card id → design record, each designed from the card's own text.
// Authoring guide: docs/daggerheart-designs/README.md. Card text: data/daggerheart-card-text.mjs.
// Palette: shadow smoke, dark purple (#5b2a86). Each layer lists Patreon keys first and ends with a key
// JB2A Free has; a Free fallback in another hue is recoloured to the first choice's hue at play time.
const MIDNIGHT = "#5b2a86";

export default {
  // Pick and Pull (1): advantage to pick locks, disarm traps or steal items from a target.
  HdgZUfWd7Hyj7nBW: {
    shape: "utility", motif: "a glint of picks at the caster's hands, a blade flicks out and back",
    notes: 'Advantage to "pick nonmagical locks, disarm nonmagical traps, or steal items from a target": tools glint in the caster\'s hands, and a dark knife darts to a targeted mark and returns with the prize.',
    cast: false,
    impact: { assets: ["glint.purple.few", "glint.yellow.few"], scale: 0.5, at: 0, duration: 1400 },
    travel: { assets: ["dagger.return.01.dark_purple", "dagger.return.01.white"], on: "targets", at: 300 },
    motion: { motion: "dodge", subject: "source", at: 200, duration: 700, intensity: 0.4 },
  },
  // Rain of Blades (1): conjured throwing blades strike every target within Very Close range.
  Ucenef6JpjQxwXni: {
    shape: "burst", motif: "a cloud of shadow daggers spins up and flies at everyone close by",
    notes: 'You "conjure throwing blades that strike out at all targets within Very Close range": dark daggers whirl around the caster, then a dagger flies to every target and cuts in.',
    cast: { assets: ["cloud_of_daggers.daggers.dark_purple", "cloud_of_daggers.daggers.purple"], scale: 0.6, duration: 1000 },
    travel: ["dagger.throw.01.dark_purple", "dagger.throw.01.white"],
    impact: { assets: ["impact.003.dark_purple", "impact.003.blue"], on: "targets", scale: 0.6 },
    motion: { motion: "stagger", subject: "targets" },
  },
  // Uncanny Disguise (1): mark a Stress to don the facade of any humanoid you can picture.
  TV56wSysbU5xAlOa: {
    shape: "aura", motif: "an illusion rune, a puff of shadow smoke, and a mask settles over the caster",
    notes: 'You "don the facade of any humanoid": an illusion rune glows above the caster, dark smoke swallows them and a mask closes over their face as their shape shifts.',
    cast: { assets: ["magic_signs.rune.illusion.complete.purple", "magic_signs.rune.illusion"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["smoke.puff.centered.dark_purple", "smoke.puff.centered.grey"], scale: 0.9, at: 500 },
    aura: { assets: ["markers.on_token_mask.complete.01.purple", "markers.on_token_mask.complete.01.orange"], scale: 0.8, at: 900, duration: 1800 },
    motion: { motion: "squash", subject: "source", at: 600 },
  },
  // Midnight Spirit (2): summon a humanoid-sized spirit; send it to attack for d6s of magic damage, then it dissipates.
  FXLsB3QbQvTtqX5B: {
    shape: "bolt", motif: "the spirit streaks to the target, strikes, and dissolves into smoke",
    notes: 'You "send it to attack an adversary": the spirit moves into melee, deals magic damage and "then dissipates", so a spectral skull streaks out, a shadow fist strikes and the spirit melts away in smoke.',
    cast: ["cast_generic.02.dark_purple", "cast_generic.02.blue"],
    travel: ["spell_projectile.skull.pinkpurple", "magic_missile.purple"],
    impact: { assets: ["unarmed_strike.magical.01.dark_purple", "unarmed_strike.magical.01.blue"], scale: 0.8 },
    extra: [{ role: "impact", on: "targets", assets: ["smoke.puff.side.dark_purple", "smoke.puff.side.grey"], scale: 0.7, at: 1500, label: "The spirit dissipates" }],
    motion: { motion: "recoil", subject: "targets", intensity: 0.5 },
    use: {
      shape: "summon", motif: "a necromantic circle and a shadowy humanoid rises beside the caster",
      notes: "Summon a humanoid-sized spirit: a dark circle turns, smoke rises and a shadowy double stands up.",
      cast: false,
      impact: { assets: ["magic_signs.circle.02.necromancy.complete.dark_purple", "magic_signs.circle.02.necromancy.complete"], below: true, scale: 0.9, at: 0, duration: 2000 },
      extra: [{ role: "impact", on: "self", assets: ["smoke.plumes.01.purple", "smoke.plumes.01.grey"], scale: 0.7, at: 500, duration: 1600 }],
      copies: { count: 1, spread: 0.6, opacity: 0.35, at: 800, duration: 1800 },
    },
  },
  // Shadowbind (2): adversaries within Very Close range are Restrained by their own shadows.
  kguhWlidhxe2GbT0: {
    shape: "burst", motif: "dark tendrils spill from the caster and shadows chain every target in place",
    notes: 'Targets are Restrained "as their shadow binds them in place": shadow arms spill from the caster, tentacles of shadow grip each target from below and chains lock them down.',
    cast: { assets: ["arms_of_hadar.dark_purple"], scale: 0.6, duration: 1200 },
    impact: { assets: ["black_tentacles.dark_purple"], on: "targets", below: true, scale: 0.4, at: 600, duration: 2000 },
    aura: { assets: ["markers.chain.standard.loop.02.purple", "markers.chain.standard.loop.02.red"], on: "targets", scale: 0.7, at: 1000, duration: 1800 },
    motion: { motion: "press", subject: "targets", at: 800, duration: 1200, intensity: 0.5 },
  },
  // Chokehold (3): from behind, mark a Stress to pull a creature into a chokehold; it is Vulnerable.
  R5GYUalYXLLFRlNl: {
    shape: "debuff", motif: "the caster lunges, a shadow grip clamps on and a cracked shield marks the throat",
    notes: 'You "pull them into a chokehold, making them temporarily Vulnerable": the caster lunges in, a dark grip clamps on the target, who is squeezed, and a cracked shield marks them Vulnerable.',
    cast: false,
    impact: { assets: ["unarmed_strike.physical.02.dark_purple", "unarmed_strike.physical.02.blue"], scale: 0.7, at: 400 },
    aura: { assets: ["markers.shield_cracked.purple"], on: "targets", scale: 0.6, opacity: 0.8, at: 900, duration: 1800 },
    motion: [{ motion: "lunge", subject: "source", at: 0, duration: 700 }, { motion: "squash", subject: "targets", at: 500 }],
  },
  // Veil of Night (3): a curtain of darkness only you see through; you're Hidden behind it.
  gV4L5ZZmfPrEbIDh: {
    shape: "wall", motif: "a long curtain of black smoke unrolls and the caster fades behind it",
    notes: 'You "create a temporary curtain of darkness between two points": a line of dark smoke draws out beside the caster, a shadow pools under them and they fade from view.',
    cast: ["cast_generic.01.dark_purple", "cast_generic.02.blue"],
    impact: { assets: ["smoke_line.25x05ft.lightblue"], tint: MIDNIGHT, scale: 1, at: 500, duration: 2400 },
    aura: { assets: ["drop_shadow.dark_black"], scale: 1, opacity: 0.8, at: 900, duration: 2000 },
    motion: { motion: "fade", subject: "source", at: 1100, duration: 1000 },
  },
  // Glyph of Nightfall (4): a dark glyph on the target's body lowers its Difficulty.
  B5HXqYRJiL3xMNKT: {
    shape: "debuff", motif: "a dark glyph burns onto the target and its weak points pulse",
    notes: 'You "conjure a dark glyph upon their body that exposes their weak points": a dark rune burns onto the target, then a hunter\'s mark pulses over the exposed spot and they flinch.',
    cast: ["cast_generic.01.dark_purple", "cast_generic.02.blue"],
    impact: { assets: ["magic_signs.rune.necromancy.complete.purple", "magic_signs.rune.necromancy"], scale: 0.45 },
    aura: { assets: ["hunters_mark.pulse.01.purple", "hunters_mark.pulse.01.green"], on: "targets", scale: 0.6, at: 1100, duration: 1600 },
    motion: { motion: "cower", subject: "targets", at: 900, intensity: 0.4 },
  },
  // Stealth Expertise (4): mark a Stress to turn a Fear roll into Hope while sneaking, also for an ally.
  NIUhmuQGwbb3UClZ: {
    shape: "buff", motif: "dark footprints creep, the caster crouches and a die turns over",
    notes: 'While you "move unnoticed through a dangerous area" a Fear roll becomes Hope: quiet dark footprints at the caster, a crouch low, a die turning above them and a soft puff on the sneaking ally.',
    cast: false,
    impact: { assets: ["footprints.shoe.black"], on: "self", scale: 0.7, opacity: 0.8, at: 0, duration: 1800 },
    extra: [
      { role: "impact", on: "self", assets: ["icosahedron.rune.above.dark_greenpurple", "icosahedron.rune.above.blueyellow"], scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 500, duration: 1400 },
      { role: "impact", on: "targets", assets: ["smoke.puff.ring.01.dark_black", "smoke.puff.ring.01.white"], scale: 0.6, at: 700, label: "The ally's roll turns" },
    ],
    motion: { motion: "sink", subject: "source", at: 100, duration: 1000, intensity: 0.4 },
  },
  // Hush (5): suppressive magic around the target and everything Very Close to it: Silenced.
  gwmYasmfgXZ7tFS6: {
    shape: "debuff", motif: "a dark dome closes over the target and a mute sign hangs over it",
    notes: 'You "conjure suppressive magic around the target" so they "can\'t make noise and can\'t cast spells": sound is pulled in at the caster, a dark force dome closes over the target and a mute sign settles above it.',
    cast: { assets: ["particles.inward.purple", "particles.inward.greenyellow"], scale: 0.6, duration: 900 },
    impact: { assets: ["wall_of_force.sphere.purple", "wall_of_force.sphere.grey"], tint: MIDNIGHT, scale: 0.9, duration: 1800 },
    aura: { assets: ["markers.mute.purple", "markers.mute.dark_red"], on: "targets", scale: 0.6, at: 1100, duration: 1600 },
    motion: { motion: "cower", subject: "targets", at: 800, intensity: 0.3 },
  },
  // Phantom Retreat (5): anchor where you stand; later vanish and reappear there.
  "0vdpIn06ifF3xxqZ": {
    shape: "teleport", motif: "a dark ring anchors the spot, the caster dissolves in black mist and reforms on it",
    notes: 'You "disappear from where you are and reappear where you were standing": a dark portal ring marks the anchor under the caster, a phantom double lingers on it, and black mist takes and returns them.',
    cast: { assets: ["portals.horizontal.ring.dark_purple", "portals.horizontal.ring"], below: true, scale: 0.7, duration: 1800 },
    impact: { assets: ["misty_step.01.dark_black", "misty_step.01.blue"], scale: 0.8, at: 600 },
    extra: [{ role: "impact", on: "self", assets: ["misty_step.02.dark_black", "misty_step.02.blue"], scale: 0.8, at: 1500, label: "Reappear on the anchor" }],
    copies: { count: 1, spread: 0.15, opacity: 0.3, at: 300, duration: 1600 },
    motion: { motion: "flicker", subject: "source", at: 700, duration: 900 },
    actions: {
      // Activate
      SE2C9Andtlw3OQLL: {
        shape: "utility", motif: "a dark ring anchors the spot and a faint phantom of the caster stays on it",
        notes: 'You "activate Phantom Retreat where you\'re currently standing": a dark portal ring marks the anchor under the caster and a faint phantom double settles on it.',
        cast: { assets: ["portals.horizontal.ring.dark_purple", "portals.horizontal.ring"], below: true, scale: 0.7, duration: 2200 },
        copies: { count: 1, spread: 0.1, opacity: 0.3, at: 400, duration: 2000 },
      },
      // Retreat
      "1AJRAbFtDx8Pm26q": {
        shape: "teleport", motif: "the caster dissolves in black mist and reforms on the anchor",
        notes: 'You "disappear from where you are and reappear where you were standing when you activated Phantom Retreat": black mist swallows the caster and they flicker back out of a second plume on the anchor.',
        cast: false,
        impact: { assets: ["misty_step.01.dark_black", "misty_step.01.blue"], scale: 0.8, at: 0 },
        extra: [{ role: "impact", on: "self", assets: ["misty_step.02.dark_black", "misty_step.02.blue"], scale: 0.8, at: 900, label: "Reappear on the anchor" }],
        motion: { motion: "flicker", subject: "source", at: 200, duration: 900 },
      },
    },
  },
  // Dark Whispers (6): speak into a touched person's mind; mark a Stress to ask the GM a question about them.
  yL2qrSWmTwXVOySH: {
    shape: "beam", motif: "a whisper ripples out, a dark thread links minds and an eye opens over the target",
    notes: 'You "speak into the mind" of someone you have touched and ask "What are they afraid of?": a whisper ripples from the caster, a thin dark strand links their minds and an eye opens over the target.',
    cast: { assets: ["soundwave.01.purple", "cast_generic.sound.01.pinkteal"], scale: 0.5, duration: 900 },
    travel: ["energy_strands.range.standard.dark_purple", "energy_strands.range.standard.purple"],
    impact: { assets: ["eyes.01.dark_purple.single", "eyes.01.dark_green.single"], scale: 0.35, offsetY: -0.8, offsetUnits: "token", duration: 1600 },
    motion: { motion: "pulse", subject: "source", at: 300 },
  },
  // Mass Disguise (6): mark a Stress to change the appearance of all willing creatures within Close range.
  dT95m0Jam8sWbeuC: {
    shape: "buff", motif: "a wide illusion circle under the caster, and every ally shimmers into a new shape",
    notes: 'You "change the appearance of all willing creatures within Close range": a broad illusion circle turns beneath the caster, dark smoke rings each ally and a shimmer reshapes them.',
    cast: { assets: ["magic_signs.circle.02.illusion.complete.dark_purple", "magic_signs.circle.02.illusion"], below: true, scale: 1.1, duration: 2000 },
    impact: { assets: ["smoke.puff.ring.02.dark_black", "smoke.puff.ring.01.white"], scale: 0.7, at: 600 },
    aura: { assets: ["shimmer.01.purple", "shimmer.01.blue"], opacity: 0.6, at: 900, duration: 1800 },
    motion: { motion: "squash", subject: "targets", at: 700 },
  },
  // Midnight-Touched (7): with 4+ Midnight cards, gain a Hope instead of the GM's Fear; add the Fear Die to damage.
  uSyGKVxOJcnp28po: {
    shape: "utility", motif: "a Fear sigil drains into the caster and a skull die spins above them",
    notes: 'Colour exception, the die keeps its green-purple: "when you have 0 Hope and the GM would gain a Fear, you can gain a Hope instead", so a Fear sigil sinks into the caster, dark strands run over them and a skull die spins overhead.',
    cast: false,
    impact: { assets: ["markers.fear.dark_purple"], scale: 0.5, offsetY: -0.6, offsetUnits: "token", at: 0, duration: 1200 },
    aura: { assets: ["energy_strands.overlay.dark_purple", "energy_strands.overlay.blue"], opacity: 0.7, at: 600, duration: 1600 },
    extra: [{ role: "impact", on: "self", assets: ["icosahedron.skull.above.dark_greenpurple", "icosahedron.star.above.blueyellow"], tint: false, scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 900, duration: 1400, label: "The Fear Die" }],
    motion: { motion: "pulse", subject: "source", at: 600 },
  },
  // Vanishing Dodge (7): when a physical attack misses, spend Hope to vanish in shadow and reappear near the attacker, Hidden.
  GBMIElIpk4cvk1Bd: {
    shape: "teleport", motif: "the caster sidesteps into a burst of black smoke and fades, a smoke ring marks the new spot",
    notes: 'You "envelop yourself in shadow, becoming Hidden and teleporting": the caster slips aside into a burst of black smoke, fades out, and a ring of smoke puffs where they reappear.',
    cast: false,
    impact: { assets: ["smoke.puff.centered.dark_black", "smoke.puff.centered.grey"], scale: 0.9, at: 200 },
    extra: [{ role: "impact", on: "self", assets: ["smoke.puff.ring.01.dark_black", "smoke.puff.ring.01.white"], scale: 0.7, at: 1200, label: "Reappear, hidden" }],
    motion: [{ motion: "dodge", subject: "source", at: 0, duration: 500 }, { motion: "fade", subject: "source", at: 400, duration: 900 }],
  },
  // Shadowhunter (8): in low light or darkness, +1 Evasion and advantage on attacks.
  A0XzD6MmBXYdk7Ps: {
    shape: "aura", motif: "darkness pools around the caster and hunting eyes open in it",
    notes: 'Your prowess grows "under the cover of shadow": darkness gathers around the caster, eyes open in the gloom and the caster sets into a guarded crouch.',
    cast: false,
    aura: { assets: ["darkness.black"], scale: 0.5, opacity: 0.6, at: 0, duration: 2400 },
    impact: { assets: ["eyes.01.dark_purple.few", "eyes.01.dark_green.few"], scale: 0.6, at: 500, duration: 1600 },
    motion: { motion: "brace", subject: "source", at: 600 },
  },
  // Spellcharge (8): absorbed magic damage becomes tokens; spend them to add d6s to a hit.
  ewhIzXQ2h9fS9I8c: {
    shape: "utility", motif: "stored charges orbit the caster, crackle, and slam into the target",
    notes: 'You "spend any number of tokens to add a d6 for each token spent": absorbed charges orbit the caster as dark stones, static crackles as they are spent and a dark blast lands on the target.',
    cast: { assets: ["static_electricity.02.dark_purple", "static_electricity.02.blue"], scale: 0.6, duration: 900 },
    aura: { assets: ["ioun_stones.01.purple.absorption"], scale: 0.8, at: 0, duration: 1400 },
    impact: { assets: ["impact.012.dark_purple", "impact.012.blue"], on: "targets", scale: 0.7, at: 900 },
    motion: { motion: "throw", subject: "source", at: 400, duration: 700 },
  },
  // Night Terror (9): targets within Very Close range see a nightmarish horror, become Horrified, and you steal Fear to hurt them.
  zcldCuqOg3dphUVI: {
    shape: "burst", motif: "screaming spirits swirl around the caster, horror marks the targets, skulls strike",
    notes: 'Targets "perceive you as a nightmarish horror": dark spirits whirl around the caster, a horror sign flashes over each target, they cower and screaming skulls hit them for the stolen Fear.',
    cast: false,
    impact: { assets: ["spirit_guardians.dark_purple.spirits", "spirit_guardians.blueyellow.ring"], scale: 0.6, at: 0, duration: 2000 },
    aura: { assets: ["markers.horror.purple"], on: "targets", scale: 0.6, at: 600, duration: 1600 },
    extra: [{ role: "impact", on: "targets", assets: ["impact_themed.skull.pinkpurple", "impact.003.blue"], scale: 0.7, at: 1400, label: "Stolen Fear strikes" }],
    motion: { motion: "cower", subject: "targets", at: 700, duration: 1200 },
  },
  // Twilight Toll (9): mark one target, bank tokens on non-damage successes, spend them for d12s of damage.
  SDjjV61TC1NceV1m: {
    shape: "debuff", motif: "a dark bell tolls over the target, again and again",
    notes: 'You "spend any number of tokens to add a d12 for each token spent": a dark bell tolls over the marked creature, once for each gathered toll, pressing it down.',
    cast: ["cast_generic.02.dark_purple", "cast_generic.02.blue"],
    impact: { assets: ["toll_the_dead.purple.complete", "thunderwave.center.blue"], scale: 0.6, repeats: 2, repeatInterval: 700 },
    motion: { motion: "press", subject: "targets", at: 800, duration: 1200, intensity: 0.5 },
  },
  // Eclipse (10): plunge everything within Far range into darkness only you and your allies see through.
  "62Sj67PdPFzwWVe3": {
    shape: "burst", motif: "a black eclipse disc swells over the caster and darkness floods the whole area",
    notes: 'You "plunge the entire area within Far range into complete darkness": a dark eclipse disc swells over the caster, then darkness pours out across the field and the caster rises within it.',
    cast: { assets: ["celestial_bodies.black_hole.001.8x8.outward.complete.bluepurple", "celestial_bodies.black_hole.001.8x8.outward.complete.blue"], tint: MIDNIGHT, scale: 0.5, duration: 1800 },
    impact: { assets: ["darkness.black"], below: true, scale: 1.6, opacity: 0.85, at: 900, duration: 2600 },
    motion: { motion: "levitate", subject: "source", at: 800, duration: 1600, intensity: 0.4 },
    use: {
      shape: "debuff", motif: "a creature caught in the eclipse is struck by shadow and reels",
      notes: "An adversary in the shadow marks a Stress when you or an ally succeed with Hope: a burst of shadow and a stagger.",
      cast: false,
      impact: { assets: ["impact.002.dark_purple", "impact.002.blue"], scale: 0.6 },
      motion: { motion: "stagger", subject: "targets", at: 200 },
    },
  },
  // Specter of the Dark (10): mark a Stress to become Spectral: immune to physical damage, floating, passing through walls.
  iQhgqmLwhcSTYnvr: {
    shape: "aura", motif: "a necromancy rune, rising wisps, and the caster floats as a translucent specter",
    notes: 'You "can float and pass through solid objects": a necromantic rune glows, dark wisps rise off the caster, a ghostly sheen wraps them, afterimages trail and they lift off the ground.',
    cast: { assets: ["magic_signs.rune.necromancy.complete.purple", "magic_signs.rune.necromancy"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["smoke.plumes.01.purple", "smoke.plumes.01.grey"], scale: 0.7, at: 500, duration: 1600 },
    aura: { assets: ["shimmer.01.purple", "shimmer.01.blue"], tint: MIDNIGHT, opacity: 0.5, at: 800, duration: 2200 },
    copies: { count: 2, spread: 0.25, opacity: 0.3, at: 900, duration: 2000 },
    motion: { motion: "levitate", subject: "source", at: 800, duration: 1800, intensity: 0.6 },
  },
};
