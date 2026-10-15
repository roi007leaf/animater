// Sage domain card designs: card id → design record, each designed from the card's own text.
// Authoring guide: docs/daggerheart-designs/README.md. Card text: data/daggerheart-card-text.mjs.
// Palette: green nature, vines and leaves (#5fae5a). Each layer lists Patreon keys first and ends with a key
// JB2A Free has; a Free fallback in another hue is recoloured to the first choice's hue at play time.
const GREEN = "#5fae5a";

export default {
  // Gifted Tracker (1): read a quarry's trail, ask the GM questions, +1 Evasion against them.
  VZ2b4zfRzV73XTuT: {
    shape: "utility", motif: "eyes open over a trail of footprints and the quarry is marked",
    notes: 'Tracking creatures "based on signs of their passage": green footprints trail around the tracker, keen eyes open above them and a hunter\'s mark settles on any targeted quarry.',
    cast: { assets: ["eyes.01.dark_green.few"], scale: 0.55, offsetY: -0.7, offsetUnits: "token", duration: 1400 },
    impact: { assets: ["footprints.human.teal", "footprints.shoe.grey"], tint: GREEN, scale: 0.9, below: true, duration: 2200, at: 300 },
    aura: { assets: ["hunters_mark.pulse.01.green"], on: "targets", scale: 0.6, at: 1100, duration: 1600 },
  },
  // Nature's Tongue (1): speak with plants and animals; +2 to a Spellcast Roll in nature for a Hope.
  atWLorlCOxcrq8WB: {
    shape: "utility", motif: "butterflies gather to the speaker as leaves swirl round them",
    notes: 'You "speak the language of the natural world": butterflies flutter in to the caster and leaves swirl around them as the plants answer.',
    cast: false,
    impact: { assets: ["butterflies.inward.01.greenyellow", "butterflies.inward.01.bluepurple"], scale: 0.8, duration: 1800 },
    aura: { assets: ["swirling_leaves.loop.01.green"], scale: 0.8, opacity: 0.7, at: 600, duration: 2200 },
  },
  // Vicious Entangle (1): roots and vines burst from the ground, damage and Restrain the target.
  qvpvTnkAoRn9vYO4: {
    shape: "bolt", motif: "vines erupt under the target and bind it fast",
    notes: 'On a success "roots and vines reach out from the ground": an earthen cast, vines burst up beneath the target and an entangling tangle holds it Restrained.',
    impact: { assets: ["vine.complete.nature.single.01.green"], scale: 0.9, at: 600 },
    aura: { assets: ["entangle.02.loop.02.green"], below: true, scale: 0.8, duration: 2200, at: 1000 },
    motion: { motion: "press", subject: "targets", at: 800, duration: 1000, intensity: 0.5 },
    use: {
      shape: "debuff", motif: "an entangle of roots grabs a second adversary",
      notes: "Spend a Hope to Restrain another adversary near the target: roots coil round it.",
      cast: false,
      impact: { assets: ["entangle.green02", "entangle.green"], below: true, scale: 0.8, duration: 1800 },
      motion: { motion: "shake", subject: "targets", at: 300, intensity: 0.4 },
    },
  },
  // Conjure Swarm (2): Fire Flies swarm every adversary in Close range; or armored beetles encircle you.
  rZPH0BY8Sznc9sFG: {
    shape: "burst", motif: "a cloud of fireflies swells around the caster and stings every target",
    notes: 'Fire Flies: a spellcast "against all adversaries within Close range", so a swarm of green fireflies bursts out around the caster and swarms each target, which staggers.',
    cast: { assets: ["fireflies.many.01.green"], scale: 0.9, duration: 1600 },
    impact: { assets: ["fireflies.few.02.green"], on: "targets", scale: 0.6, at: 800, duration: 1400 },
    extra: [{ role: "impact", on: "targets", assets: ["impact.004.green", "impact.004.blue"], scale: 0.5, at: 1100 }],
    motion: { motion: "stagger", subject: "targets", at: 1100 },
    use: {
      shape: "ward", motif: "armored beetle shells circle the caster",
      notes: "Tekaira armored beetles encircle you and soften the next blow: hard shells orbit the caster, who braces.",
      cast: false,
      aura: { assets: ["aura_themed.01.orbit.complete.metal.01.green", "aura_themed.01.orbit.complete.metal.01.grey"], scale: 0.9, duration: 2400, at: 0 },
      motion: { motion: "brace", subject: "source", at: 400 },
    },
  },
  // Natural Familiar (2): command a summoned spirit with a Spellcast Roll; or summon it with Hope.
  Tag303LoRNC5zGgl: {
    shape: "buff", motif: "an enchantment rune, a green tether to the familiar and it bounds off",
    notes: 'You "make a Spellcast Roll to command them to perform simple tasks": an enchantment rune glows over the caster, a green strand of will reaches the familiar and it springs into action.',
    cast: { assets: ["magic_signs.rune.enchantment.complete.green", "magic_signs.rune.enchantment"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
    travel: ["energy_strands.range.standard.dark_green", "energy_strands.range.standard.purple.01"],
    impact: { assets: ["hunters_mark.loop.01.green"], scale: 0.5, duration: 1200 },
    motion: { motion: "leap", subject: "targets", at: 1200, duration: 900, intensity: 0.5 },
    use: {
      shape: "summon", motif: "fairy lights burst at the caster and a little spirit wisp settles beside them",
      notes: "Summon a small nature spirit or forest critter to your side: fairy motes burst and a green wisp hovers by the caster.",
      cast: false,
      impact: { assets: ["fairies.inward_burst.01.greenyellow", "fairies.inward_burst.01.bluepurple"], scale: 0.7 },
      aura: { assets: ["dancing_light.green"], scale: 0.35, offsetY: -0.8, offsetUnits: "token", duration: 2400, at: 800 },
    },
    actions: {
      // See Through Eyes
      "8Y03LcPgXF30DfzZ": {
        shape: "utility", motif: "green eyes open over the caster and over the familiar as their sight is shared",
        notes: 'You "mark a Stress to see through their eyes": a green eye opens above the caster and another over the targeted familiar.',
        cast: false,
        impact: { assets: ["eyes.01.dark_green.single"], scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 0, duration: 1800 },
        extra: [{ role: "impact", on: "targets", assets: ["eyes.01.dark_green.single"], scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 400, duration: 1800, label: "Familiar's eyes" }],
      },
    },
  },
  // Corrosive Projectile (3): an acid shot for d6+4 magic damage; Stress makes the target Corroded.
  qJaSNTuDfbPVr8Lb: {
    shape: "bolt", motif: "a glob of acid streaks out, splashes and smokes on the target",
    notes: 'A projectile that can leave the target "permanently Corroded": a green-yellow acid shot flies, splashes over the target and corrosive fumes rise from it.',
    cast: false,
    travel: ["spell_projectile.poison.greenyellow", "spell_projectile.ice_shard.blue"],
    impact: { assets: ["liquid.splash.bright_green", "liquid.splash.blue"], scale: 0.7 },
    aura: { assets: ["fumes.04.complete.green", "fumes.04.complete.grey"], scale: 0.6, opacity: 0.75, duration: 1800 },
    motion: { motion: "stagger", subject: "targets" },
    use: {
      shape: "debuff", motif: "acid eats into the target, which sags",
      notes: "Corroded: acid keeps eating at the target, lowering its Difficulty.",
      cast: false,
      impact: { assets: ["liquid.blob.green", "liquid.blob.blue"], scale: 0.6 },
      aura: { assets: ["fumes.toxic.green", "fumes.04.loop.grey"], opacity: 0.6, scale: 0.6, duration: 1600 },
      motion: { motion: "squash", subject: "targets", at: 300 },
    },
  },
  // Towering Stalk (3): as an attack, an erupting stalk lifts targets into the air and drops them.
  n0P3VS1WfxvmXbB6: {
    shape: "burst", motif: "a stalk erupts under each target, hoists it high and drops it",
    notes: 'The erupting stalk "lifts targets you succeed against into the air and drops them": ground plants burst at the caster, a stalk of vines shoots up under each target, which rises and slams down.',
    impact: { assets: ["plant_growth.03.round.2x2.complete.greenyellow"], below: true, scale: 0.8, at: 300, duration: 1400 },
    extra: [{ role: "impact", on: "targets", assets: ["vine.complete.nature.group.01.green"], scale: 0.9, at: 600, duration: 1600, label: "The stalk erupts" }],
    motion: [{ motion: "levitate", subject: "targets", at: 700, duration: 900, intensity: 0.9 }, { motion: "collapse", subject: "targets", at: 1600, duration: 700 }],
    use: {
      shape: "summon", motif: "a thick twisting stalk grows up beside the caster",
      notes: "Conjure a thick, climbable stalk: green growth spreads and twisting vines rise tall.",
      cast: { assets: ["magic_signs.circle.02.conjuration.complete.green", "magic_signs.circle.02.conjuration"], below: true, scale: 0.8, duration: 1600 },
      impact: { assets: ["vine.complete.nature.group.02.green"], scale: 1.3, offsetY: -0.4, offsetUnits: "token", duration: 2200, at: 500 },
    },
  },
  // Death Grip (4): vines from your hands pull, constrict or lash, and Restrain the target.
  x0FVGE1YbfXalJiw: {
    shape: "beam", motif: "vines lash from the caster's hands, coil the target and drag it close",
    notes: 'On a success "vines reach out from your hands": dark green tendrils lash from the caster to the target, wrap it in vines, bind it and drag it in.',
    cast: { assets: ["energy_strands.in.green.01"], scale: 0.6, duration: 800 },
    travel: { assets: ["energy_strands.range.multiple.dark_green", "energy_strands.range.multiple.purple.01"], duration: 1200 },
    impact: { assets: ["vine.complete.nature.single.02.green"], scale: 0.9 },
    aura: { assets: ["entangle.green"], below: true, scale: 0.7, duration: 1800 },
    motion: { motion: "rush", subject: "targets", at: 1300, duration: 900, intensity: 0.5 },
  },
  // Healing Field (4): a field of healing plants bursts to life; you and allies in Close range clear HP.
  GlRm1Dxlc0Z1b04o: {
    shape: "burst", motif: "a ring of flowering plants spreads around the caster and allies glow green",
    notes: 'Everything within Close range "bursts to life with vibrant nature": a wide ring of plants blooms around the caster, and each ally in it is washed with green healing.',
    cast: false,
    impact: { assets: ["plant_growth.03.ring.4x4.complete.greenyellow"], below: true, scale: 1.4, at: 0, duration: 2400 },
    extra: [{ role: "impact", on: "targets", assets: ["healing_generic.200px.green"], scale: 0.7, at: 700, label: "Allies mend" }],
    motion: { motion: "pulse", subject: "source", at: 300, duration: 1000, intensity: 0.4 },
  },
  // Thorn Skin (5): thorns sprout over your body; spend tokens to soak damage and hurt a melee attacker.
  oUipGK84E2KjoKqh: {
    shape: "ward", motif: "thorns spike out all over the caster and vines wrap their body",
    notes: 'You "sprout thorns all over your body": a ring of green thorns spikes out from the caster and a coil of thorny vines wraps around them as they brace.',
    cast: false,
    impact: { assets: ["ice_spikes.radial.burst.grey", "ice_spikes.radial.burst.white"], tint: GREEN, scale: 0.7, at: 0, duration: 1200 },
    aura: { assets: ["vine.loop.nature.single.03.green"], scale: 0.8, opacity: 0.8, at: 600, duration: 2000 },
    motion: { motion: "brace", subject: "source", at: 200 },
  },
  // Wild Fortress (5): a dome-shaped natural barricade that you and one ally take cover within.
  "9dFvcM1i3bxG3BSA": {
    shape: "wall", motif: "a dome of woven vines closes over the caster",
    notes: 'You "grow a natural barricade in the shape of a dome": an abjuration circle under the caster, vines heave up around them and a green dome closes overhead.',
    cast: { assets: ["magic_signs.circle.02.abjuration.complete.green", "magic_signs.circle.02.abjuration.complete.blue"], below: true, scale: 1, duration: 1600 },
    impact: { assets: ["vine.complete.nature.group.03.green"], scale: 1.2, at: 500, duration: 1600 },
    aura: { assets: ["wall_of_force.sphere.green", "wall_of_force.sphere.grey"], scale: 0.8, opacity: 0.55, at: 1000, duration: 2200 },
    motion: { motion: "cower", subject: "source", at: 900, duration: 900, intensity: 0.3 },
  },
  // Conjured Steeds (6): conjure magical steeds that you and your allies ride.
  Jkp6cMDiHHaBZQRS: {
    shape: "buff", motif: "a conjuring circle, then spectral beasts bound to each rider",
    notes: 'You "conjure that many magical steeds" for you and your allies: a conjuration circle glows, spectral green beasts bound out to each ally and the riders surge forward on leafy wind.',
    cast: { assets: ["magic_signs.circle.02.conjuration.complete.dark_green", "magic_signs.circle.02.conjuration"], below: true, scale: 0.9, duration: 1400 },
    travel: ["pack_hound_missile.green", "pack_hound_missile.blue"],
    impact: { assets: ["wind_lines.01.leaves.01.green"], scale: 0.8, duration: 1400 },
    motion: { motion: "rush", subject: "targets", duration: 900, intensity: 0.4 },
  },
  // Forager (6): a downtime move that turns up a food, relic, rune, vial or charm.
  "06UapZuaA5S6fAKl": {
    shape: "utility", motif: "the forager rummages through swirling leaves and a find glints",
    notes: 'Roll "to see what you forage": the caster stoops into a swirl of leaves and something precious sparkles into hand.',
    cast: false,
    impact: { assets: ["swirling_leaves.complete.02.green"], scale: 0.8, duration: 1600 },
    extra: [{ role: "impact", on: "self", assets: ["swirling_sparkles.01.greenorange", "swirling_sparkles.01.blue"], scale: 0.4, offsetY: -0.5, offsetUnits: "token", at: 900, duration: 1400, label: "A find glints" }],
    motion: { motion: "sink", subject: "source", at: 100, duration: 900, intensity: 0.3 },
  },
  // Sage-Touched (7): +2 Spellcast in nature; once per rest, double your Agility or Instinct.
  VOSFaQHZbmhMyXwi: {
    shape: "utility", motif: "leaves orbit the caster and a twin of them steps out beside",
    notes: 'You "double your Agility or Instinct": a ring of nature orbits the caster, a transmutation rune glows and a second image of them appears at their side.',
    cast: { assets: ["magic_signs.rune.transmutation.complete.green", "magic_signs.rune.transmutation"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
    aura: { assets: ["aura_themed.01.orbit.complete.nature.01.green"], scale: 0.9, duration: 2200 },
    copies: { count: 1, spread: 0.35, opacity: 0.5, at: 700, duration: 1600 },
  },
  // Wild Surge (7): channel the natural world to enhance yourself; a growing die adds to every roll.
  DjnKlZQYaWdQGKcK: {
    shape: "aura", motif: "nature streams into the caster, who swells with green power",
    notes: 'You "channel the natural world around you and enhance yourself": leaves and green light pour inward to the caster, an empowering glow wraps them and they surge.',
    cast: false,
    impact: { assets: ["aura_themed.01.inward.complete.nature.01.green"], scale: 1, at: 0, duration: 1400 },
    aura: { assets: ["on_token_buff.001.001.greenyellow"], scale: 0.9, at: 1000, duration: 2000 },
    motion: { motion: "pulse", subject: "source", at: 1000, duration: 1000, intensity: 0.9 },
  },
  // Forest Sprites (8): small sprites appear at points within Far range to aid allies.
  JrkUMTzaFmQNBHVm: {
    shape: "summon", motif: "fairies burst from the caster and sprites dance by each target",
    notes: 'You "create an equal number of small forest sprites" at points within Far range: a burst of fairy lights spreads from the caster and sprite motes settle beside each target.',
    cast: { assets: ["particles.outward.greenyellow.01"], scale: 0.6 },
    impact: { assets: ["fairies.outward_burst.01.greenyellow", "fairies.outward_burst.01.bluepurple"], scale: 0.9, at: 300 },
    extra: [{ role: "aura", on: "targets", assets: ["fairies.loop.01.greenyellow", "fairies.loop.01.bluepurple"], scale: 0.5, at: 1000, duration: 2000, label: "Sprites linger" }],
  },
  // Rejuvenation Barrier (8): a barrier of protective energy that heals 1d4 HP and resists outside harm.
  HtWx5IIemCoorMj2: {
    shape: "ward", motif: "green healing wells up and a protective shell rises around the caster",
    notes: 'You "create a temporary barrier of protective energy around you" and all within clear Hit Points: healing light rises from the caster, a green shield bubble forms and allies inside glow.',
    impact: { assets: ["healing_generic.burst.greenorange"], scale: 0.9 },
    aura: { assets: ["shield.01.complete.01.green", "shield.01.complete.01.blue"], scale: 1.1, opacity: 0.8, duration: 2200 },
    extra: [{ role: "impact", on: "targets", assets: ["healing_generic.400px.green"], scale: 0.5, at: 900, label: "Allies within mend" }],
  },
  // Fane of the Wilds (9): tokens per Sage card after a long rest, each +1 to a Spellcast Roll.
  F2m9wvZ3v5c3yCtv: {
    shape: "utility", motif: "a small grove grows at the caster's feet and stones of power orbit them",
    notes: 'A fane holding "a number of tokens equal to the number of Sage domain cards": a square shrine garden grows under the caster and green stones circle them, one per token.',
    cast: false,
    impact: { assets: ["plant_growth.03.square.2x2.complete.greenyellow"], below: true, scale: 1, at: 0, duration: 1800 },
    aura: { assets: ["ioun_stones.01.green.mastery"], scale: 0.8, at: 600, duration: 2200 },
  },
  // Plant Dominion (9): reshape plant life anywhere within Far range: trees, paths, walls of roots.
  "9a6xP5pxhVvdugk9": {
    shape: "burst", motif: "a transmutation circle and a wave of growth that rolls out to the targets",
    notes: 'You "reshape the natural world, changing the surrounding plant life": a great transmutation circle turns under the caster, plant growth rolls outward and trees and roots rise wherever they point.',
    cast: { assets: ["magic_signs.circle.02.transmutation.complete.green", "magic_signs.circle.02.transmutation.complete.yellow"], below: true, scale: 1.1, duration: 2000 },
    impact: { assets: ["plant_growth.03.ring.4x4.pulse.greenyellow"], below: true, scale: 1.8, at: 700, duration: 2000 },
    extra: [{ role: "impact", on: "targets", assets: ["plant_growth.03.round.4x4.complete.greenyellow"], below: true, scale: 0.8, at: 1200, duration: 1800, label: "Plants reshape" }],
    motion: { motion: "slam", subject: "source", at: 300, duration: 900 },
  },
  // Force of Nature (10): transform into a hulking nature spirit: +10 damage, absorb the defeated.
  LzVpMkD5I4QeaIHf: {
    shape: "aura", motif: "a storm of leaves and wood engulfs the caster, who grows huge",
    notes: 'You "transform into a hulking nature spirit": the earth cast, a gale of leaves bursts out, a woody aura of bark and branches orbits the caster and they swell.',
    scale: 1.2,
    cast: { assets: ["cast_generic.earth.01.browngreen"], scale: 1 },
    impact: { assets: ["swirling_leaves.outburst.01.greenorange", "swirling_leaves.complete.01.green"], scale: 1.1 },
    aura: { assets: ["aura_themed.01.orbit.loop.wood.01.green"], scale: 1.1, duration: 2400 },
    motion: { motion: "slam", subject: "source", at: 500, duration: 1000, intensity: 0.9 },
  },
  // Tempest (10): a blizzard, hurricane or sandstorm hits all targets within Far range.
  X7YaZgFieBlqaPdZ: {
    shape: "burst", motif: "a whirlwind rises off the caster and a raging storm engulfs every target",
    notes: 'Colour exception, storm grey: you choose a "Blizzard", "Hurricane" or "Sandstorm" against all targets within Far range, so a grey whirlwind spins up around the caster and driving sleet and wind batter each target.',
    cast: { assets: ["whirlwind.bluegrey"], scale: 0.9, duration: 1400 },
    impact: { assets: ["sleet_storm.01.grey", "sleet_storm.01.blue"], on: "targets", scale: 0.7, at: 800, duration: 2000 },
    extra: [{ role: "impact", on: "targets", assets: ["wind_lines.01.leaves.02.green"], tint: "#9aa3a8", scale: 0.7, at: 1000, duration: 1400, label: "Winds lash" }],
    motion: { motion: "stagger", subject: "targets", at: 1100, intensity: 0.8 },
    actions: {
      // Blizzard
      ZqnziDBlh5Re7SKs: {
        shape: "burst", motif: "freezing cold whirls off the caster and driving sleet leaves every target brittle",
        notes: 'Colour exception, icy blue: "Blizzard: Deal 2d20+8 magic damage and targets are temporarily Vulnerable", so cold gathers at the caster, sleet engulfs each target and a cracked shield marks it.',
        cast: { assets: ["cast_generic.ice.01.blue", "cast_generic.02.blue"], scale: 0.7 },
        impact: { assets: ["sleet_storm.01.blue", "sleet_storm.blue"], on: "targets", scale: 0.7, at: 600, duration: 2000 },
        aura: { assets: ["markers.shield_cracked.purple"], tint: "#9fd3ff", on: "targets", scale: 0.5, at: 1300, duration: 1600 },
        motion: { motion: "shake", subject: "targets", at: 900, intensity: 0.6 },
      },
      // Hurricane
      FEPhujGa5lvu5fXr: {
        shape: "burst", motif: "a howling whirlwind and a gale that hurls every target back",
        notes: 'Colour exception, storm white: "Hurricane: Deal 3d10+10 magic damage and choose a direction the wind is blowing", so a white whirlwind spins up, a gale blasts out and wind lines batter each target back.',
        cast: { assets: ["whirlwind.bluewhite", "whirlwind.bluegrey"], scale: 1, duration: 1600 },
        travel: { assets: ["gust_of_wind.veryfast", "gust_of_wind.default"], at: 500 },
        impact: { assets: ["wind_lines.01.01.white"], on: "targets", scale: 0.7, at: 900 },
        motion: { motion: "recoil", subject: "targets", at: 1000, intensity: 0.9 },
      },
      // Sandstorm
      CzMlqo91kuTgg1As: {
        shape: "burst", motif: "a sand-coloured whirlwind and grit that scours every target",
        notes: 'Colour exception, sand: "Sandstorm: Deal 5d6+9 magic damage", so a whirlwind of sand rises off the caster and stinging grit and tumbling stone scour each target.',
        cast: { assets: ["whirlwind.bluegrey"], tint: "#c8a46a", scale: 0.9, duration: 1400 },
        impact: { assets: ["falling_rocks.side.1x1.sandstone", "falling_rocks.side.1x1.grey"], tint: false, on: "targets", scale: 0.6, at: 800 },
        extra: [{ role: "impact", on: "targets", assets: ["wind_lines.01.02.white"], tint: "#c8a46a", scale: 0.7, at: 900, duration: 1400, label: "Grit" }],
        motion: { motion: "cower", subject: "targets", at: 1000, intensity: 0.6 },
      },
    },
  },
};
