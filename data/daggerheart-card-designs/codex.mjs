// Codex domain card designs: card id → design record, each designed from the card's own text.
// Authoring guide: docs/daggerheart-designs/README.md. Card text: data/daggerheart-card-text.mjs.
// Palette: blue runes and magic circles (#5b8def). Each layer lists Patreon keys first and ends with a key
// JB2A Free has; a Free fallback in another hue is recoloured to the first choice's hue at play time.
// The "Book of" grimoires hold several spells: the attack variant shows the rolled spell(s), the `use`
// variant the spell cast without a roll; notes name which spell each shows. `actions` gives a spell its
// own design, keyed by the action's id (data/daggerheart-card-text.mjs), so each spell plays itself; a
// spell without one plays the card's attack or use design, which is already that spell alone.
const BLUE = "#5b8def";

export default {
  // Book of Ava (1): Power Push knocks a melee target back to Far range; Ice Spike summons a spike; Tava's Armor gives +1 Armor.
  YtZzYBtR0yLPPA93: {
    shape: "bolt", motif: "a blue glyph, a force blow that throws the target back, and an ice spike bursting up under it",
    notes: 'Power Push: the target is "knocked back to Far range", so a force burst slams it and it reels away; Ice Spike lets you "summon a large ice spike", which erupts beneath it.',
    cast: { assets: ["cast_shape.circle.01.blue"], scale: 0.6, duration: 800 },
    impact: { assets: ["impact.011.blue"], scale: 0.8 },
    extra: [{ role: "impact", on: "targets", assets: ["ice_spikes.radial.burst.blue", "ice_spikes.radial.burst.white"], below: true, scale: 0.6, at: 1000, label: "Ice spike" }],
    motion: [{ motion: "lunge", subject: "source", at: 300, duration: 700 }, { motion: "recoil", subject: "targets", at: 750, intensity: 0.85 }],
    use: {
      shape: "buff", motif: "an abjuration rune, then a blue rampart of armour on the ally",
      notes: "Tava's Armor: +1 to a touched creature's Armor Score, shown as an armour rampart settling over them.",
      cast: { assets: ["magic_signs.rune.abjuration.complete.blue", "magic_signs.rune.abjuration"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
      impact: { assets: ["markers.shield_rampart.complete.03.blue", "markers.shield_rampart.complete.01.orange"], scale: 0.8, at: 500, duration: 1600 },
      motion: { motion: "brace", subject: "targets", at: 700 },
    },
    actions: {
      // Power Push
      jX4wg2HR2xkdtbIU: {
        shape: "bolt", motif: "a blue glyph, a lunge and a force blow that hurls the target away",
        notes: 'Power Push: on a success the target is "knocked back to Far range", so a force burst slams it and it is thrown back.',
        cast: { assets: ["cast_shape.circle.01.blue"], scale: 0.6, duration: 800 },
        impact: { assets: ["impact.011.blue"], scale: 0.9 },
        motion: [{ motion: "lunge", subject: "source", at: 300, duration: 700 }, { motion: "recoil", subject: "targets", at: 750, intensity: 1 }],
      },
      // Ice Spike
      XU1joyIDFZrQiToF: {
        shape: "summon", motif: "frost gathers in the caster's hand and a large ice spike erupts from the ground",
        notes: 'Ice Spike: you "summon a large ice spike within Far range", so frost gathers at the caster and a spike of ice bursts up from the ground.',
        cast: { assets: ["cast_generic.ice.01.blue", "cast_generic.02.blue"], scale: 0.6 },
        impact: { assets: ["ice_spikes.radial.burst.blue", "ice_spikes.radial.burst.white"], below: true, scale: 0.8, at: 600, duration: 1800 },
        motion: { motion: "brace", subject: "source", at: 500 },
      },
      // Ice Spike (Attack)
      enit3ZkPp0nY5lN1: {
        shape: "bolt", motif: "a shard of ice flies from the spike and shatters on the target",
        notes: 'Ice Spike used "as a weapon": the spike is driven into the target, so a shard of ice streaks to it, shatters and the target staggers.',
        cast: { assets: ["cast_generic.ice.01.blue", "cast_generic.02.blue"], scale: 0.5 },
        travel: { assets: ["spell_projectile.ice_shard.blue"] },
        impact: { assets: ["impact_themed.ice_shard.blue"], scale: 0.8 },
        motion: { motion: "stagger", subject: "targets" },
      },
    },
  },
  // Book of Illiat (1): Slumber puts a target Asleep; Arcane Barrage fires d6 projectiles per Hope; Telepathy links minds.
  df4iRqQzRntrF6Qw: {
    shape: "debuff", motif: "an enchantment rune, a drowsy cloud and floating sleep symbols over the target",
    notes: 'Slumber: on a success the target is "Asleep until they take damage", so a blue sleep cloud wraps it, sleep symbols drift above it and it sinks down.',
    cast: { assets: ["magic_signs.rune.enchantment.complete.blue", "magic_signs.rune.enchantment"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["sleep.cloud.01.blue", "sleep.cloud.01.pink"], scale: 0.8 },
    aura: { assets: ["sleep.symbol.blue", "sleep.symbol.pink"], scale: 0.5, offsetY: -0.6, offsetUnits: "token", duration: 2200 },
    motion: { motion: "sink", subject: "targets", at: 900, duration: 1400, intensity: 0.4 },
    use: {
      shape: "bolt", motif: "a volley of blue missiles streams into one target",
      notes: "Arcane Barrage: magical projectiles, one per Hope spent, strike a single target in quick succession.",
      cast: { assets: ["ranged_missile.cast.001.blue"], scale: 0.6 },
      travel: { assets: ["magic_missile.blue", "magic_missile.purple"], repeats: 3, repeatInterval: 200 },
      impact: { assets: ["impact.012.blue"], scale: 0.6, repeats: 3, repeatInterval: 200 },
      motion: { motion: "stagger", subject: "targets", at: 1200 },
    },
    actions: {
      // Telepathy
      Ya1vttriJRLbuyhk: {
        shape: "buff", motif: "a thin thread of thought links the caster's mind to the target's; a soft light glows over both",
        notes: 'Telepathy: you "open a line of mental communication with one target you can see", so a fine blue strand links the two and a gentle light rises over each head.',
        cast: false,
        travel: { assets: ["energy_strands.range.standard.blue", "energy_strands.range.standard.purple"], at: 0, duration: 1600 },
        aura: { assets: ["markers.light_orb.loop.blue"], scale: 0.35, offsetY: -0.7, offsetUnits: "token", at: 700, duration: 1800 },
        extra: [{ role: "aura", on: "self", assets: ["markers.light_orb.loop.blue"], scale: 0.35, offsetY: -0.7, offsetUnits: "token", at: 300, duration: 2200, label: "Caster's mind" }],
      },
    },
  },
  // Book of Tyfar (1): Wild Flame burns up to three melee adversaries; Magic Hand conjures a hand; Mysterious Mist makes fog.
  "1VXzwRbvbBj5bd5V": {
    shape: "cone", motif: "fire gathers in the palm and a fan of flame sweeps over up to three foes",
    notes: 'Colour exception, orange fire: Wild Flame strikes up to three adversaries "as flames erupt from your hand", so a fan of flame sweeps from the caster and each target burns and flinches.',
    cast: { assets: ["cast_generic.fire.01.orange"], scale: 0.5, duration: 800 },
    travel: { assets: ["burning_hands.01.orange"], duration: 1100 },
    impact: { assets: ["flames.02.orange"], scale: 0.5, duration: 1400 },
    motion: { motion: "shake", subject: "targets" },
    use: {
      shape: "summon", motif: "a conjuration rune, then a spectral blue hand rises beside the caster",
      notes: "Magic Hand: you conjure a magical hand the size and strength of your own.",
      cast: { assets: ["magic_signs.rune.conjuration.complete.blue", "magic_signs.rune.conjuration"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
      impact: { assets: ["arcane_hand.blue"], scale: 0.6, at: 600, duration: 1800 },
    },
    actions: {
      // Mysterious Mist
      WQ9XzpbtXl4SmVet: {
        shape: "aura", motif: "a thick bank of fog rolls out and hangs around the caster",
        notes: 'Colour exception, white fog: Mysterious Mist casts "a temporary thick fog that gathers in a stationary area", so a dense cloud of fog rolls in and lingers.',
        impact: { assets: ["fog_cloud.01.white"], tint: false, scale: 1.4, at: 500, duration: 3200, opacity: 0.85 },
      },
    },
  },
  // Book of Sitil (2): Illusion creates a visual illusion; Adjust Appearance disguises; Parallela adds a second target.
  eq8VNqYMRHhF9xw9: {
    shape: "summon", motif: "an illusion circle and a convincing double of the caster beside them",
    notes: 'Illusion: you "create a temporary visual illusion no larger than you", so an illusion circle turns under the caster and a solid-looking double appears beside them.',
    cast: false,
    impact: { assets: ["magic_signs.circle.02.illusion.complete.blue", "magic_signs.circle.02.illusion.complete.purple"], below: true, scale: 0.8, at: 0, duration: 2200 },
    copies: { count: 1, spread: 0.7, opacity: 0.75, at: 500, duration: 2400 },
    use: {
      shape: "utility", motif: "a smoke ring and a shimmer change the caster's look; strands mark an ally for Parallela",
      notes: "Adjust Appearance: the caster shimmers into a new look. Parallela: a targeted ally is wrapped in strands for the extra hit.",
      cast: false,
      impact: { assets: ["smoke.puff.ring.01.white"], tint: BLUE, scale: 0.7, at: 0 },
      aura: { assets: ["shimmer.01.blue"], opacity: 0.6, at: 300, duration: 1800 },
      extra: [{ role: "impact", on: "targets", assets: ["energy_strands.overlay.blue"], scale: 0.7, at: 400, label: "Parallela on an ally" }],
      motion: { motion: "flicker", subject: "source", at: 300, duration: 900 },
    },
    actions: {
      // Adjust Appearance
      cc1ahwawL16OEu2r: {
        shape: "utility", motif: "a smoke ring puffs and the caster shimmers into a new look",
        notes: 'Adjust Appearance: you "magically shift your appearance and clothing to avoid recognition", so a puff of smoke rings the caster and they flicker into a new look.',
        cast: false,
        impact: { assets: ["smoke.puff.ring.01.white"], tint: BLUE, scale: 0.7, at: 0 },
        aura: { assets: ["shimmer.01.blue"], opacity: 0.6, at: 300, duration: 1800 },
        motion: { motion: "flicker", subject: "source", at: 300, duration: 900 },
      },
      // Parallela
      wBQkw3P4Esj6kOx2: {
        shape: "buff", motif: "a strand of power reaches the ally and splits around them, readying a second strike",
        notes: 'Parallela: the ally "can hit an additional target", so a blue strand reaches them, energy wraps their body and they pulse, ready to strike twice.',
        travel: { assets: ["energy_strands.range.standard.blue", "energy_strands.range.standard.purple"], duration: 900 },
        impact: { assets: ["energy_strands.overlay.blue"], scale: 0.7 },
        motion: { motion: "pulse", subject: "targets" },
      },
    },
  },
  // Book of Vagras (2): Runic Lock seals an object; Arcane Door opens a portal; Reveal uncovers the magically hidden.
  aknDDYtN7EObv94t: {
    shape: "utility", motif: "runes glow, a revealing ring ripples out and spectral chains lock what is targeted",
    notes: 'Reveal: "anything magically hidden within Close range" is revealed, so a detect-magic ring ripples out from the caster; Runic Lock seals the touched object with spectral blue chains.',
    cast: { assets: ["markers.runes.blue", "markers.runes.orange"], scale: 0.5, offsetY: -0.5, offsetUnits: "token" },
    impact: { assets: ["detect_magic.circle.blue"], below: true, scale: 1.1, duration: 1800 },
    extra: [{ role: "impact", on: "targets", assets: ["markers.chain.spectral_standard.complete.02.blue"], scale: 0.6, at: 900, label: "Runic Lock" }],
    actions: {
      // Runic Lock
      kfJZdT3F4SH1h1dc: {
        shape: "utility", motif: "runes flare in the caster's hand, an abjuration seal glows and spectral chains lock the object",
        notes: 'Runic Lock: you "lock the object so it can only be opened by creatures of your choice", so runes flare, an abjuration seal glows and spectral chains wrap whatever is targeted.',
        cast: { assets: ["markers.runes.blue", "markers.runes.orange"], scale: 0.5, offsetY: -0.5, offsetUnits: "token" },
        impact: { assets: ["magic_signs.rune.abjuration.complete.blue", "magic_signs.rune.abjuration"], scale: 0.45, at: 500 },
        extra: [{ role: "impact", on: "targets", assets: ["markers.chain.spectral_standard.complete.02.blue"], scale: 0.6, at: 700, label: "Locked" }],
      },
      // Arcane Door
      Da3zkKkOljZfu5Xb: {
        shape: "summon", motif: "a conjuration rune, then a blue portal opens beside the caster and its twin at the far end",
        notes: 'Arcane Door: you "create a portal from where you are to a point within Far range you can see", so a blue ring portal opens by the caster and another where it leads.',
        cast: { assets: ["magic_signs.rune.conjuration.complete.blue", "magic_signs.rune.conjuration"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
        impact: { assets: ["portals.vertical.ring.blue", "portals.vertical.ring"], scale: 0.8, at: 500, duration: 2200 },
        extra: [{ role: "impact", on: "targets", assets: ["portals.vertical.ring.blue", "portals.vertical.ring"], scale: 0.8, at: 800, duration: 2000, label: "Far end" }],
      },
      // Reveal
      VOOND5icbz1WxUUD: {
        shape: "utility", motif: "runes glow and a revealing ring ripples out across the floor",
        notes: 'Reveal: "anything magically hidden within Close range" is revealed, so runes glow over the caster and a detect-magic ring ripples out.',
        cast: { assets: ["markers.runes.blue", "markers.runes.orange"], scale: 0.5, offsetY: -0.5, offsetUnits: "token" },
        impact: { assets: ["detect_magic.circle.blue"], below: true, scale: 1.1, duration: 1800 },
      },
    },
  },
  // Book of Korvax (3): Levitation lifts a target; Rune Circle blasts adversaries in Melee range; Recant erases a minute of memory.
  cWRFHJdxEZ0M1dAg: {
    shape: "debuff", motif: "blue motes swirl at the caster and a field of force lifts the target into the air",
    notes: 'Levitation: you "lift a target you can see up into the air", so a blue force field gathers under it and it floats up.',
    cast: { assets: ["particles.swirl.blue", "particles.swirl.greenyellow"], scale: 0.6 },
    aura: { assets: ["energy_field.02.below.blue"], below: true, scale: 0.8, at: 500, duration: 2000 },
    motion: { motion: "levitate", subject: "targets", at: 600, duration: 1800, intensity: 0.9 },
    use: {
      shape: "burst", motif: "a rune circle burns into the ground and blasts nearby foes back",
      notes: "Rune Circle: a magical circle on the ground damages adversaries in Melee range and knocks them to Very Close.",
      cast: false,
      impact: { assets: ["magic_signs.circle.02.evocation.complete.blue", "magic_signs.circle.02.evocation"], below: true, scale: 1.3, at: 0, duration: 2000 },
      extra: [{ role: "impact", on: "targets", assets: ["explosion.04.blue"], scale: 0.6, at: 700 }],
      motion: [{ motion: "pulse", subject: "source", at: 200 }, { motion: "recoil", subject: "targets", at: 800, intensity: 0.5 }],
    },
    actions: {
      // Recant
      m4y7KXhjVNT30wUT: {
        shape: "debuff", motif: "an enchantment rune, and the target's last minute swims away in a daze",
        notes: 'Recant: on a failure "they forget the last minute of your conversation", so an enchantment rune glows over the caster and dizzy stars circle the target\'s head as it shakes off the lost memory.',
        cast: { assets: ["magic_signs.rune.enchantment.complete.blue", "magic_signs.rune.enchantment"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
        aura: { assets: ["dizzy_stars.200px.blueorange"], scale: 0.6, offsetY: -0.5, offsetUnits: "token", duration: 2000 },
        motion: { motion: "shake", subject: "targets", intensity: 0.3 },
      },
    },
  },
  // Book of Norai (3): Mystic Tether restrains a target; Fireball explodes on a target and everyone Very Close.
  WtwSWXTRZa7QVvmo: {
    shape: "debuff", motif: "a crackling tether binds the target in spectral chains and drags it down",
    notes: 'Mystic Tether: the target is "temporarily Restrained", and a flier is grounded, so a blue tether lashes out, spectral chains wrap the target and it is pulled down.',
    cast: false,
    travel: { assets: ["witch_bolt.blue"], at: 0, duration: 1200 },
    aura: { assets: ["markers.chain.spectral_standard.loop.02.blue"], scale: 0.7, at: 700, duration: 2200 },
    motion: { motion: "sink", subject: "targets", at: 800, duration: 1200, intensity: 0.7 },
    use: {
      shape: "bolt", motif: "a sphere of fire streaks to the target and explodes",
      notes: "Colour exception, orange fire: Fireball hurls a sphere of fire that explodes on the target and everyone Very Close.",
      cast: { assets: ["cast_generic.fire.01.orange"], scale: 0.6 },
      travel: ["fireball.beam.orange"],
      impact: { assets: ["fireball.explosion.orange"], scale: 1.1 },
      motion: { motion: "recoil", subject: "targets", intensity: 0.6 },
    },
    actions: {
      // Fireball - Cast
      GI2VkIcGDOjFRxpT: {
        shape: "bolt", motif: "fire gathers, a fireball streaks to the target and explodes, scorching the ground",
        notes: 'Colour exception, orange fire: you "hurl a sphere of fire toward them that explodes on impact", so fire gathers at the caster, a fireball streaks out, bursts on the target and scorches the ground.',
        cast: { assets: ["cast_generic.fire.01.orange"], scale: 0.6 },
        travel: ["fireball.beam.orange"],
        impact: { assets: ["fireball.explosion.orange"], scale: 1.1 },
        extra: [{ role: "impact", on: "targets", assets: ["impact.ground_crack.orange.02", "impact.ground_crack.01.orange"], below: true, scale: 0.9, at: 1300, label: "Scorched ground" }],
        motion: { motion: "recoil", subject: "targets", intensity: 0.7 },
      },
      // Fireball - Explosion
      HJ749c2a8WTjkSHY: {
        shape: "burst", motif: "a great explosion of fire engulfs the target and everyone around it",
        notes: 'Colour exception, orange fire: "the target and all creatures within Very Close range of them" are caught, so a wide fireball explosion engulfs them and flames lick at each.',
        cast: false,
        impact: { assets: ["fireball.explosion.orange"], on: "targets", scale: 1.5, at: 0, duration: 1400 },
        extra: [{ role: "impact", on: "targets", assets: ["flames.02.orange"], scale: 0.5, at: 600, duration: 1400, label: "Burning" }],
        motion: { motion: "shake", subject: "targets", at: 300, intensity: 0.8 },
      },
    },
  },
  // Book of Exota (4): Create Construct animates objects whose attacks deal physical damage; Repudiate stops a magical effect.
  oVs2MSC6Uf5GbgEG: {
    shape: "bolt", motif: "power pulls into the caster and the construct's stone fist slams the target",
    notes: 'Construct (take action): the construct\'s "attacks deal 2d10+3 physical damage", so the caster draws power in and a heavy fist pounds the target as debris flies.',
    cast: { assets: ["particles.inward.blue", "particles.inward.greenyellow"], scale: 0.6, duration: 900 },
    impact: { assets: ["melee_generic.creature_attack.fist.002.blue"], scale: 0.8 },
    extra: [{ role: "impact", on: "targets", assets: ["falling_rocks.side.1x1.grey"], tint: false, scale: 0.6, at: 800, label: "Debris" }],
    motion: { motion: "shake", subject: "targets", at: 800 },
    use: {
      shape: "summon", motif: "a transmutation circle draws rubble together and a stone hand rises from it",
      notes: "Colour exception, grey stone: Create Construct animates a group of nearby objects into a construct.",
      cast: { assets: ["magic_signs.circle.02.transmutation.complete.blue", "magic_signs.circle.02.transmutation"], below: true, scale: 0.9, duration: 2000 },
      impact: { assets: ["falling_rocks.top.1x1.grey"], tint: false, scale: 0.7, at: 400 },
      extra: [{ role: "impact", on: "self", assets: ["arcane_hand.rock", "arcane_hand.blue"], scale: 0.6, at: 1100, duration: 1600, label: "Construct rises" }],
    },
    actions: {
      // Repudiate
      "6eioK8CoAPfObBP2": {
        shape: "ward", motif: "an abjuration seal flares and the magic around the caster shatters",
        notes: 'Repudiate: you "interrupt a magical effect taking place" and "the effect stops", so an abjuration seal flares over the caster and the spell breaks apart in blue shards.',
        cast: false,
        impact: { assets: ["magic_signs.rune.abjuration.complete.blue", "magic_signs.rune.abjuration"], scale: 0.5, offsetY: -0.6, offsetUnits: "token", at: 0 },
        extra: [{ role: "impact", on: "self", assets: ["shatter.blue"], scale: 0.8, at: 500, label: "Spell broken" }],
        motion: { motion: "brace", subject: "source", at: 400 },
      },
    },
  },
  // Book of Grynn (4): Wall of Flame between two points; Arcane Deflection negates an attack's damage; Time Lock freezes an object.
  R0LNheiZycZlZzV3: {
    shape: "wall", motif: "a wall of blue magical flame rises and scorches those who cross it",
    notes: 'Wall of Flame: you "create a temporary wall of magical flame", so a wall of blue arcane fire rises from the caster\'s cast and anything crossing it is burned.',
    impact: { assets: ["wall_of_fire.300x100.blue"], scale: 1, at: 400, duration: 2400 },
    extra: [{ role: "impact", on: "targets", assets: ["impact.fire.01.orange"], tint: BLUE, scale: 0.6, at: 1300, label: "Crossing burns" }],
    motion: { motion: "shake", subject: "targets", at: 1300 },
    use: {
      shape: "ward", motif: "a force sphere snaps around the caster and a shield flashes on the threatened ally",
      notes: "Arcane Deflection: negate the damage of an attack on you or a Very Close ally.",
      cast: false,
      impact: { assets: ["wall_of_force.sphere.blue", "wall_of_force.sphere.grey"], scale: 0.6, at: 0, duration: 1300 },
      extra: [{ role: "impact", on: "targets", assets: ["shield.01.complete.01.blue"], scale: 0.7, at: 300, label: "Ally protected" }],
      motion: { motion: "brace", subject: "source", at: 200 },
    },
    actions: {
      // Time Lock
      "0vUkyQiGHTFS3Api": {
        shape: "utility", motif: "a divination rune turns over the caster and the target is sealed in a still bubble of time",
        notes: 'Time Lock: the object "stops in time and space exactly where it is", so a divination rune turns over the caster and whatever is targeted is held in a frozen blue bubble.',
        cast: { assets: ["magic_signs.rune.divination.complete.blue", "magic_signs.rune.divination"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
        aura: { assets: ["markers.bubble.complete.blue"], on: "targets", scale: 0.7, at: 600, duration: 2400 },
      },
    },
  },
  // Manifest Wall (5): a magical wall up to 50 feet high between two points, shunting creatures aside.
  TtGOtWkbr23VhHfH: {
    shape: "wall", motif: "an abjuration circle, then a towering wall of blue force; anyone in its path is shoved aside",
    notes: 'You "create a temporary magical wall" and "creatures or objects in its path are shunted to a side", so an abjuration circle glows, a tall wall of force rises and targets are pushed clear.',
    cast: { assets: ["magic_signs.circle.02.abjuration.complete.blue", "magic_signs.circle.02.abjuration"], below: true, scale: 0.9, duration: 1600 },
    impact: { assets: ["wall_of_force.vertical.blue", "wall_of_force.vertical.grey"], scale: 1.2, at: 600, duration: 2600 },
    motion: { motion: "recoil", subject: "targets", at: 800, intensity: 0.4 },
  },
  // Teleport (5): teleport yourself and willing creatures within Close range to a place you've been.
  HnPwVrWblYa9hwSt: {
    shape: "teleport", motif: "a flash of teleport light, the caster fades out, and blue mist marks the arrival",
    notes: 'You "instantly teleport yourself and any number of willing targets": a blue teleport flash takes the caster, who fades away, the targeted travellers vanish in mist and mist marks the arrival.',
    cast: { assets: ["teleport.01.blue"], scale: 0.9, duration: 1200 },
    impact: { assets: ["misty_step.02.blue"], scale: 0.9, at: 1400 },
    extra: [{ role: "impact", on: "targets", assets: ["misty_step.01.blue"], scale: 0.7, at: 400, label: "Willing travellers" }],
    motion: { motion: "fade", subject: "source", at: 300, duration: 1100 },
  },
  // Banish (6): roll d20s; a target that fails is banished from this realm.
  AIbHfryMA2Rvs1ut: {
    shape: "debuff", motif: "a d20 tumbles above the caster, a vortex opens under the target and it sinks out of the world",
    notes: 'Colour exception, the die is blue-gold: you "roll a number of d20 s" and on a failure the target is "banished from this realm", so a d20 tumbles, a vortex portal opens beneath the target and it sinks and fades.',
    cast: { assets: ["icosahedron.rune.above.blueyellow"], tint: false, scale: 0.4, offsetY: -0.8, offsetUnits: "token", duration: 1300 },
    impact: { assets: ["portals.horizontal.vortex.blue", "portals.horizontal.ring"], below: true, scale: 0.9, at: 700, duration: 2200 },
    motion: [{ motion: "sink", subject: "targets", at: 1000, duration: 1300, intensity: 0.9 }, { motion: "fade", subject: "targets", at: 1500, duration: 900 }],
  },
  // Sigil of Retribution (6): mark an adversary; damage it deals stores d8s for your next hit on it.
  RiuN0lMlfoTAhLJz: {
    shape: "debuff", motif: "a strand of power reaches the adversary and a burning sigil hangs over it",
    notes: 'You "mark an adversary within Close range with a sigil of retribution": a strand reaches the adversary, a hunter\'s-mark pulse lands and an evocation sigil glows over its head.',
    cast: false,
    travel: { assets: ["energy_strands.range.standard.blue", "energy_strands.range.standard.purple"], at: 0, duration: 900 },
    impact: { assets: ["hunters_mark.pulse.01.blue", "hunters_mark.pulse.01.green"], scale: 0.6 },
    aura: { assets: ["magic_signs.rune.evocation.complete.blue", "magic_signs.rune.evocation"], scale: 0.45, offsetY: -0.7, offsetUnits: "token", duration: 2200 },
  },
  // Book of Homet (7): Pass Through walls with those touching you; Plane Gate opens a gateway to another plane.
  gFMx08ogQ8hS2Obi: {
    shape: "summon", motif: "a conjuration rune, then a swirling gateway opens and the caster drifts through, ghostly",
    notes: 'Plane Gate opens "a gateway to a location in another dimension"; Pass Through lets you "pass through a wall or door": a blue vortex gate opens, the caster drifts and shimmers as if passing through, and touching allies shimmer too.',
    cast: { assets: ["magic_signs.rune.conjuration.complete.blue", "magic_signs.rune.conjuration"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["portals.vertical.vortex.blue", "portals.vertical.ring"], scale: 0.9, at: 600, duration: 2200 },
    aura: { assets: ["shimmer.01.blue"], opacity: 0.5, at: 900, duration: 1800 },
    extra: [{ role: "aura", on: "targets", assets: ["shimmer.01.blue"], opacity: 0.5, at: 900, duration: 1800, label: "Companions phase" }],
    motion: { motion: "drift", subject: "source", at: 1000, duration: 1200 },
    actions: {
      // Pass Through
      "4cKqwH2jWsYylzI7": {
        shape: "utility", motif: "the caster and those touching them turn ghostly and drift through",
        notes: 'Pass Through: "you and all creatures touching you can pass through a wall or door", so the caster shimmers and drifts as if through stone, and touching companions shimmer too.',
        cast: false,
        aura: { assets: ["shimmer.01.blue"], opacity: 0.6, at: 0, duration: 1800 },
        extra: [{ role: "aura", on: "targets", assets: ["shimmer.01.blue"], opacity: 0.5, at: 200, duration: 1800, label: "Companions phase" }],
        motion: [{ motion: "drift", subject: "source", at: 400, duration: 1200 }, { motion: "fade", subject: "source", at: 900, duration: 700 }],
      },
      // Plane Gate
      RTUxVXUyRM6mNwUX: {
        shape: "summon", motif: "a conjuration rune, then a great swirling gateway to another plane opens",
        notes: 'Plane Gate: you "open a gateway to a location in another dimension or plane of existence", so a conjuration rune glows and a large blue vortex gate swirls open.',
        cast: { assets: ["magic_signs.rune.conjuration.complete.blue", "magic_signs.rune.conjuration"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
        impact: { assets: ["portals.vertical.vortex.blue", "portals.vertical.ring"], scale: 1.2, at: 600, duration: 2600 },
        motion: { motion: "pulse", subject: "source", at: 500 },
      },
    },
  },
  // Codex-Touched (7): with 4+ Codex cards, mark Stress to add Proficiency to a Spellcast Roll; swap a card from the vault.
  "7Pu83ABdMukTxu3e": {
    shape: "utility", motif: "a divination rune opens over the caster and stones of insight orbit them",
    notes: 'You "add your Proficiency to a Spellcast Roll" from deep study: a blue divination rune opens above the caster and ioun stones of insight orbit them as they pulse.',
    cast: { assets: ["magic_signs.rune.divination.complete.blue", "magic_signs.rune.divination"], scale: 0.45, offsetY: -0.6, offsetUnits: "token" },
    aura: { assets: ["ioun_stones.01.blue.insight"], scale: 0.9, duration: 2200 },
    motion: { motion: "pulse", subject: "source", at: 500 },
  },
  // Book of Vyola (8): Memory Delve peers into a target's mind; Shared Clarity lets two creatures share Stress.
  VOIgm2j2Ijszwc5m: {
    shape: "beam", motif: "an eye opens over the caster and a beam of sight pierces the target's mind",
    notes: 'Memory Delve: you "peer into the target\'s mind", so an eye opens above the caster, a beam reaches the target and a divination rune lights over its head.',
    cast: { assets: ["eyes.01.bluegreen.single", "eyes.01.dark_green.single"], scale: 0.4, offsetY: -0.8, offsetUnits: "token", duration: 1400 },
    travel: { assets: ["energy_beam.normal.blue.01"], at: 500, duration: 1400 },
    impact: { assets: ["magic_signs.rune.divination.complete.blue", "magic_signs.rune.divination"], scale: 0.45, offsetY: -0.6, offsetUnits: "token", at: 1000 },
    motion: { motion: "shake", subject: "targets", at: 1100, intensity: 0.3 },
    use: {
      shape: "buff", motif: "strands link the caster to two willing creatures and a calm light settles on them",
      notes: "Shared Clarity: two willing creatures share who marks Stress, joined by strands and a calm light.",
      cast: false,
      travel: { assets: ["energy_strands.range.multiple.blue", "energy_strands.range.multiple.purple"], at: 0 },
      impact: { assets: ["markers.light.complete.blue"], scale: 0.6 },
    },
  },
  // Safe Haven (8): summon a door within Close range to an interdimensional home.
  lmBLMPuR8qLbuzNf: {
    shape: "summon", motif: "a ring-shaped door opens beside the caster, glows, then fades from sight",
    notes: 'A "magical door appears somewhere within Close range" and "you can make the entrance invisible": a blue portal ring opens like a door, a soft light glows within, and it vanishes in a puff.',
    cast: false,
    impact: { assets: ["portals.vertical.ring.blue", "portals.vertical.ring"], scale: 0.9, at: 0, duration: 2600 },
    aura: { assets: ["markers.light.complete.blue"], scale: 0.7, opacity: 0.6, at: 600, duration: 1800 },
    extra: [{ role: "impact", on: "self", assets: ["smoke.puff.ring.01.white"], tint: BLUE, scale: 0.8, at: 2400, label: "Entrance hidden" }],
  },
  // Book of Ronin (9): Transform into an inanimate object; Eternal Enervation makes a target permanently Vulnerable.
  SZMNR3uGNinJcN4N: {
    shape: "utility", motif: "a transmutation circle, a puff, the caster shrinks into an object; a cracked shield brands any target",
    notes: 'Transform: you "transform into an inanimate object", so a transmutation circle turns, smoke puffs and the caster squashes down; Eternal Enervation makes a targeted foe "permanently Vulnerable", marked with a cracked shield.',
    cast: { assets: ["magic_signs.circle.02.transmutation.complete.dark_blue", "magic_signs.circle.02.transmutation"], below: true, scale: 0.9, duration: 1800 },
    impact: { assets: ["smoke.puff.centered.grey"], tint: BLUE, scale: 0.8, at: 600 },
    extra: [{ role: "aura", on: "targets", assets: ["markers.shield_cracked.purple"], tint: BLUE, scale: 0.6, at: 900, duration: 2000, label: "Eternal Enervation" }],
    motion: { motion: "squash", subject: "source", at: 650, duration: 1000 },
    actions: {
      // Transform
      etnR1OKzpLWrx2os: {
        shape: "utility", motif: "a transmutation circle, a puff of smoke, and the caster squashes down into an object",
        notes: 'Transform: you "transform into an inanimate object", so a transmutation circle turns, smoke puffs and the caster squashes down.',
        cast: { assets: ["magic_signs.circle.02.transmutation.complete.dark_blue", "magic_signs.circle.02.transmutation"], below: true, scale: 0.9, duration: 1800 },
        impact: { assets: ["smoke.puff.centered.grey"], tint: BLUE, scale: 0.8, at: 600 },
        motion: { motion: "squash", subject: "source", at: 650, duration: 1000 },
      },
      // Eternal Enervation
      h7i4ZuDYuYLnjze6: {
        shape: "debuff", motif: "a draining strand reaches the target and a cracked shield brands it for good",
        notes: 'Eternal Enervation: the target becomes "permanently Vulnerable", so a blue strand drains it, a cracked shield brands it and it sags.',
        travel: { assets: ["energy_strands.range.standard.blue", "energy_strands.range.standard.purple"], duration: 900 },
        impact: { assets: ["markers.shield_cracked.purple"], tint: BLUE, scale: 0.6 },
        aura: { assets: ["energy_strands.overlay.blue"], opacity: 0.5, scale: 0.7, duration: 2000 },
        motion: { motion: "sink", subject: "targets", intensity: 0.4 },
      },
    },
  },
  // Disintegration Wave (9): adversaries within Far range of Difficulty 18 or lower are killed outright.
  kja5qvh4rdeDBB96: {
    shape: "burst", motif: "a wave pulses out, disintegrating rays strike each foe and they crumble away",
    notes: 'The chosen adversaries "are killed and can\'t come back to life by any means": a blue wave pulses out from the caster, disintegrating rays strike each target and they collapse and fade to nothing.',
    cast: false,
    impact: { assets: ["template_circle.out_pulse.02.burst.bluewhite"], scale: 1.6, at: 0, duration: 1400 },
    travel: { assets: ["disintegrate.purpleblue", "disintegrate.green"], at: 400, duration: 1200 },
    extra: [{ role: "impact", on: "targets", assets: ["smoke.puff.centered.grey"], scale: 0.7, at: 1300, label: "Dust" }],
    motion: [{ motion: "collapse", subject: "targets", at: 1100, duration: 900 }, { motion: "fade", subject: "targets", at: 1500, duration: 900 }],
  },
  // Book of Yarrow (10): Timejammer halts time for everyone within Far range but you; Magic Immunity for 5 Hope.
  J1ovx2FpNDvPq1o6: {
    shape: "burst", motif: "a vast time whirl spreads from the caster and every other creature is caught in a stasis bubble",
    notes: 'Timejammer: "time temporarily slows to a halt for everyone within Far range except for you", so a great blue whirl spreads under the caster and each target is frozen inside a stasis bubble.',
    cast: { assets: ["magic_signs.circle.02.divination.complete.dark_blue", "magic_signs.circle.02.divination"], below: true, scale: 1, duration: 1600 },
    impact: { assets: ["template_circle.whirl.loop.blue"], below: true, scale: 2, at: 500, duration: 2600 },
    extra: [{ role: "aura", on: "targets", assets: ["markers.bubble.02.complete.blue"], scale: 0.8, at: 900, duration: 2200, label: "Frozen in time" }],
    motion: { motion: "pulse", subject: "source", at: 500 },
    use: {
      shape: "ward", motif: "a protective shell closes over the caster and a ring settles around them",
      notes: "Magic Immunity: immune to magic damage until the next rest.",
      cast: false,
      impact: { assets: ["antilife_shell.blue_with_circle"], scale: 0.8, at: 0, duration: 1800 },
      aura: { assets: ["token_border.circle.static.blue.001"], scale: 1, opacity: 0.8, at: 800, duration: 1800 },
      motion: { motion: "pulse", subject: "source", at: 300 },
    },
  },
  // Transcendent Union (10): two or more willing creatures choose among them who marks Stress or Hit Points.
  kVkoCLBXLAIifqpz: {
    shape: "buff", motif: "an enchantment circle, then beams join the caster to each willing creature and a blessing settles on them",
    notes: 'Cast on "two or more willing creatures" so the "connected creatures can choose who marks it": an enchantment circle turns under the caster, beams connect them to each ally and a blessing lights every linked creature.',
    cast: { assets: ["magic_signs.circle.02.enchantment.complete.blue", "magic_signs.circle.02.enchantment"], below: true, scale: 1, duration: 2000 },
    travel: { assets: ["energy_beam.normal.bluepink.03", "energy_beam.normal.blue.01"], duration: 1600 },
    impact: { assets: ["bless.200px.intro.blue", "bless.200px.intro.yellow"], scale: 0.8 },
    extra: [{ role: "impact", on: "self", assets: ["bless.200px.intro.blue", "bless.200px.intro.yellow"], scale: 0.8, at: 1100, label: "Caster joined" }],
  },
};
