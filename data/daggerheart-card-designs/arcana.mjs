// Arcana domain card designs: card id → design record, each designed from the card's own text.
// Authoring guide: docs/daggerheart-designs/README.md. Card text: data/daggerheart-card-text.mjs.
// Palette: violet arcane light (#a070ff). Each layer lists Patreon keys first and ends with a key
// JB2A Free has; a Free fallback in another hue is recoloured to the first choice's hue at play time.
const VIOLET = "#a070ff";

export default {
  // Rune Ward (1): the holder spends Hope to reduce incoming damage by 1d8.
  GEhBUmv9Bj7oJfHk: {
    shape: "ward", motif: "a rune flares, a warding sigil settles, a shield takes the blow",
    notes: 'A trinket "infused with protective magic" that reduces incoming damage: an abjuration rune, a rune ward on the holder and a shield that soaks the hit.',
    cast: { assets: ["magic_signs.rune.abjuration.complete.purple", "magic_signs.rune.abjuration"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["ward.rune.dark_purple", "ward.rune.yellow"], scale: 0.8, at: 500 },
    aura: { assets: ["shield.01.complete.01.purple", "shield.01.complete.01.blue"], scale: 0.9, at: 900, duration: 1600 },
    motion: { motion: "brace", subject: "source", at: 900 },
  },
  // Unleash Chaos (1): tokens of raw energy hurled at one target for d10s of magic damage; Mark a Stress to refill.
  o62i0QdbUDIiAhSq: {
    shape: "bolt", motif: "raw energy drawn inward, then flung as a crackling tangle that bursts",
    notes: 'Channels "raw energy from within yourself": strands gather into the caster, a chaotic tangle of strands lashes the target and bursts in a violet-pink blast.',
    cast: { assets: ["energy_strands.in.purple", "energy_strands.in.green"], scale: 0.7, duration: 900 },
    travel: ["energy_strands.range.multiple.purple", "energy_strands.range.multiple.purple.01"],
    impact: { assets: ["explosion.03.purplepink", "explosion.02.blue"], scale: 0.7 },
    motion: { motion: "stagger", subject: "targets" },
    use: {
      shape: "utility", motif: "loose motes stream back into the caster",
      notes: "Mark a Stress to replenish the tokens: motes swirl back in.",
      cast: false,
      impact: { assets: ["particles.inward.purple", "particles.inward.greenyellow"], scale: 0.8, duration: 1600 },
      motion: { motion: "pulse", subject: "source", at: 300 },
    },
  },
  // Wall Walk (1): a touched creature climbs walls and ceilings until the scene ends.
  "1ROT08E1UVBwHLAS": {
    shape: "buff", motif: "a square glyph, then glowing footprints and a lift off the floor",
    notes: 'Lets a touched creature "climb on walls and ceilings": a flat square glyph like a wall face, violet footprints on the ally and a lift off the ground.',
    cast: { assets: ["cast_shape.square.single01.purple", "cast_shape.square.single01.blue"], scale: 0.6 },
    aura: { assets: ["footprints.shoe.teal", "footprints.shoe.grey"], tint: VIOLET, scale: 0.7, duration: 2200, at: 600 },
    motion: { motion: "levitate", subject: "targets", at: 800, duration: 1400, intensity: 0.4 },
  },
  // Cinder Grasp (2): a melee spellcast; the target bursts into flames and is On Fire.
  "5EP2Lgf7ojfrc0Is": {
    shape: "bolt", motif: "a burning palm strike, the target bursts into flames and keeps burning",
    notes: 'Colour exception, orange fire: on a success "the target instantly bursts into flames" and is lit On Fire, so the caster lunges with a fiery hand and the target erupts and keeps burning.',
    cast: { assets: ["cast_generic.fire.01.orange"], scale: 0.6, duration: 800 },
    impact: { assets: ["flames.04.complete.orange"], scale: 0.9, at: 650 },
    aura: { assets: ["flames.01.orange"], scale: 0.7, opacity: 0.8, duration: 2400, at: 1100 },
    motion: [{ motion: "lunge", subject: "source", at: 250, duration: 800 }, { motion: "shake", subject: "targets", at: 700 }],
    use: {
      shape: "debuff", motif: "the burning creature flinches as fire flares",
      notes: "On Fire: the burning creature takes 2d6 magic damage after acting.",
      cast: false,
      impact: { assets: ["impact.fire.01.orange"], scale: 0.6 },
      motion: { motion: "shake", subject: "targets", at: 100 },
    },
  },
  // Floating Eye (2): a small orb the caster sees through, anywhere within Very Far range.
  wOQLu7nLMQ7v6Ogw: {
    shape: "summon", motif: "a small light orb rises above the caster and an eye opens in it",
    notes: 'Creates "a single, small floating orb" the caster sees through: a violet orb rises over the caster and an eye opens inside it.',
    cast: ["cast_generic.02.dark_purple", "cast_generic.02.blue"],
    impact: { assets: ["markers.light_orb.complete.blue"], tint: VIOLET, scale: 0.45, offsetY: -0.9, offsetUnits: "token", duration: 2400, at: 500 },
    extra: [{ role: "impact", on: "self", assets: ["eyes.01.purple.single", "eyes.01.dark_green.single"], scale: 0.35, offsetY: -0.9, offsetUnits: "token", at: 1000, duration: 1600 }],
  },
  // Counterspell (3): a reaction that stops a magical effect.
  "6dhqo1kzGxejCjHa": {
    shape: "ward", motif: "an abjuration circle snaps open and the spell shatters",
    notes: 'You "interrupt a magical effect taking place": an abjuration circle flashes under the caster and the incoming magic shatters in front of them.',
    cast: { assets: ["magic_signs.circle.02.abjuration.complete.dark_purple", "magic_signs.circle.02.abjuration.complete.blue"], below: true, scale: 0.9, duration: 1400 },
    impact: { assets: ["shatter.purple", "shatter.blue"], scale: 0.8, at: 400 },
    motion: { motion: "recoil", subject: "source", at: 450, duration: 800, intensity: 0.4 },
  },
  // Flight (3): the caster flies, spending a token per action roll.
  "54GUjNuBEy7xdzMz": {
    shape: "buff", motif: "feathers burst outward and the caster rises into the air",
    notes: 'The caster takes flight and descends "to the ground directly below" when the tokens run out: a burst of violet feathers and a slow rise.',
    cast: ["cast_generic.03.bluepurple", "cast_generic.03.blue"],
    impact: { assets: ["swirling_feathers.outburst.01.purple", "swirling_feathers.outburst.01"], on: "self", scale: 0.8, at: 500 },
    motion: { motion: "levitate", subject: "source", at: 600, duration: 1600, intensity: 0.7 },
    use: {
      shape: "utility", motif: "a gust swirls under the flier",
      notes: "Spend a token while flying: a gust keeps the caster aloft.",
      cast: false,
      impact: { assets: ["whirlwind.purple", "whirlwind.bluegrey"], on: "self", scale: 0.6, opacity: 0.7, duration: 1400 },
      motion: { motion: "drift", subject: "source", at: 100, duration: 1200 },
    },
  },
  // Blink Out (4): teleport to a point within Far range, bringing willing creatures close by.
  Qu0iA4s3Xov10Erd: {
    shape: "teleport", motif: "a misty blink out, a flicker, and a misty blink back in",
    notes: 'You "teleport to another point you can see": violet mist swallows the caster, the token flickers, and mist marks the arrival; willing companions blink with them.',
    cast: { assets: ["misty_step.01.purple", "misty_step.01.blue"], scale: 0.9, duration: 1200 },
    impact: { assets: ["misty_step.02.purple", "misty_step.02.blue"], scale: 0.9, at: 1300 },
    extra: [{ role: "impact", on: "targets", assets: ["misty_step.01.dark_purple", "misty_step.01.blue"], scale: 0.7, at: 300, label: "Companions blink along" }],
    motion: { motion: "flicker", subject: "source", at: 300, duration: 1200 },
  },
  // Preservation Blast (4): all targets in Melee range are forced back to Far range and take magic damage.
  "1p1cOmbnRd5CoKBp": {
    shape: "burst", motif: "a ring shockwave bursts from the caster and hurls everyone back",
    notes: 'Targets "are forced back to Far range": a dark violet thunderwave rings out from the caster and each target is struck and knocked away.',
    cast: false,
    impact: { assets: ["thunderwave.center.dark_purple", "thunderwave.center.blue"], scale: 1.1, at: 100 },
    extra: [{ role: "impact", on: "targets", assets: ["impact.011.purple", "impact.011.blue"], scale: 0.7, at: 450 }],
    motion: [{ motion: "pulse", subject: "source", at: 0, duration: 800 }, { motion: "recoil", subject: "targets", at: 450, intensity: 0.65 }],
  },
  // Chain Lightning (5): lightning on all targets in Close range that keeps leaping to more adversaries.
  "0kAVO6rordCfZqYP": {
    shape: "bolt", motif: "violet lightning strikes the first target and forks on to the rest",
    notes: 'Unleashes "lightning on all targets" and "this chain continues": a primary bolt to the first target, then forks leap from it to every other target.',
    cast: { assets: ["static_electricity.03.purple", "static_electricity.03.blue"], scale: 0.6, duration: 900 },
    travel: { assets: ["chain_lightning.primary.purple", "chain_lightning.primary.blue"], targetSelection: "first" },
    impact: ["static_electricity.01.purple", "static_electricity.01.blue"],
    extra: [{ role: "travel", assets: ["chain_lightning.secondary.purple", "chain_lightning.secondary.blue"], travelOrigin: "firstTarget", targetSelection: "secondary", at: 1100, label: "Chain leaps on" }],
    motion: { motion: "shake", subject: "targets" },
    use: {
      shape: "debuff", motif: "lightning cracks down on a creature the chain reaches",
      notes: "Chain damage on an adversary the lightning reaches.",
      cast: false,
      impact: { assets: ["lightning_strike.purple", "lightning_strike.blue"], scale: 0.8 },
      motion: { motion: "shake", subject: "targets", at: 300 },
    },
  },
  // Premonition (5): rescind a move and its consequences, once per long rest.
  aC43NiFQLpOADyjO: {
    shape: "utility", motif: "a divination rune opens and time swirls back around the caster",
    notes: 'Visions of the future let you "rescind the move and consequences": a divination rune glows and a violet vortex turns backwards beneath the caster.',
    cast: { assets: ["magic_signs.rune.divination.complete.purple", "magic_signs.rune.divination"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    aura: { assets: ["template_circle.vortex.loop.purple", "template_circle.vortex.loop.blue"], below: true, scale: 0.7, opacity: 0.7, duration: 2200 },
    motion: { motion: "spin", subject: "source", at: 600, duration: 1200, intensity: 0.4 },
  },
  // Rift Walker (6): mark the ground; the next cast opens a rift back to the mark.
  vd5STqX29RpYbGxa: {
    shape: "summon", motif: "a conjuration mark burns into the ground and a rift portal opens",
    notes: 'You "place an arcane marking on the ground" and later "a rift in space opens up": a conjuration circle under the caster, then a violet portal swirls open.',
    cast: false,
    impact: { assets: ["magic_signs.circle.02.conjuration.complete.dark_purple", "magic_signs.circle.02.conjuration.complete.dark_yellow"], below: true, scale: 1, at: 0, duration: 2200 },
    extra: [{ role: "impact", on: "self", assets: ["portals.vertical.vortex.purple", "portals.vertical.ring"], scale: 0.9, at: 900, duration: 2000, label: "Rift opens" }],
  },
  // Telekinesis (6): move a target anywhere within Far range, or throw it at a second target.
  FgzBppvLjXr0UbUI: {
    shape: "debuff", motif: "a mental tether lifts the target on a field of force",
    notes: 'You "use your mind to move them": a violet tether reaches the target, a force field gathers under it and it is lifted off the ground.',
    cast: { assets: ["particles.swirl.purple", "particles.swirl.greenyellow"], scale: 0.6 },
    travel: ["energy_strands.range.standard.purple", "energy_strands.range.standard.purple.01"],
    aura: { assets: ["energy_field.02.below.purple", "energy_field.02.below.blue"], on: "targets", below: true, scale: 0.8, duration: 2000 },
    motion: { motion: "levitate", subject: "targets", duration: 1600, intensity: 0.8 },
  },
  // Arcana-Touched (7): +1 to Spellcast Rolls; once per rest, switch the Hope and Fear Dice.
  "5PvMQKCjrgSxzstn": {
    shape: "utility", motif: "an arcane ring spins and a gold-and-blue die turns over",
    notes: 'Colour exception, the die is gold and blue for Hope and Fear: you "switch the results of your Hope and Fear Dice", so an arcane ring spins and a die tumbles above the caster.',
    cast: false,
    aura: { assets: ["token_border.circle.spinning.purple", "token_border.circle.spinning.blue"], scale: 1, opacity: 0.8, duration: 1800 },
    impact: { assets: ["icosahedron.rune.above.blueyellow"], tint: false, scale: 0.45, offsetY: -0.8, offsetUnits: "token", at: 300, duration: 1500 },
    motion: { motion: "pulse", subject: "source", at: 400 },
  },
  // Cloaking Blast (7): after a successful spell, become Cloaked while stationary.
  Zhw7PtK8nMPlsOqD: {
    shape: "aura", motif: "a puff of violet smoke and a shimmer that hides the caster",
    notes: 'You "become Cloaked" and "remain unseen": violet smoke puffs, a shimmer wraps the caster and the token flickers out of sight.',
    cast: false,
    impact: { assets: ["smoke.puff.centered.dark_purple", "smoke.puff.centered.grey"], scale: 0.9, at: 0 },
    aura: { assets: ["shimmer.01.purple", "shimmer.01.blue"], opacity: 0.6, duration: 2400, at: 300 },
    motion: { motion: "flicker", subject: "source", at: 300, duration: 1100 },
  },
  // Arcane Reflection (8): spend Hope, roll d6s; a 6 reflects the magic attack back at its caster.
  JzSvxy9Mu3RJp1jV: {
    shape: "ward", motif: "a force sphere catches the spell and fires it back",
    notes: 'The attack "is reflected back to the caster": a violet force sphere catches the magic and a beam lances back at the attacker.',
    cast: false,
    impact: { assets: ["wall_of_force.sphere.purple", "wall_of_force.sphere.grey"], scale: 0.6, duration: 1300, at: 0 },
    travel: { assets: ["energy_beam.normal.purple", "energy_beam.normal.bluepink"], at: 700, duration: 900 },
    extra: [{ role: "impact", on: "targets", assets: ["impact.013.001.bluepurple", "impact.013.001.orangeyellow"], scale: 0.7, at: 1300 }],
  },
  // Confusing Aura (8): layers of illusion over the body; each layer can make an attack fail.
  R8NDiJXJWmC48WSr: {
    shape: "aura", motif: "an illusion rune and shimmering afterimages around the caster",
    notes: 'You "create a layer of illusion over your body": an illusion rune glows, a faint field settles and afterimages of the caster split away.',
    cast: { assets: ["magic_signs.rune.illusion.complete.purple", "magic_signs.rune.illusion"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    aura: { assets: ["energy_field.02.above.purple", "energy_field.02.above.blue"], opacity: 0.35, duration: 2400 },
    copies: { count: 3, spread: 0.3, opacity: 0.4, duration: 2200 },
    use: {
      shape: "aura", motif: "one more afterimage peels away",
      notes: "Mark Stress for an additional layer: one more afterimage.",
      cast: false,
      impact: { assets: ["particles.outward.purple", "particles.outward.greenyellow"], scale: 0.6, duration: 1200 },
      copies: { count: 1, spread: 0.35, opacity: 0.45, at: 200, duration: 1800 },
    },
  },
  // Earthquake (9): everything within Very Far range takes physical damage and is Vulnerable; terrain cracks.
  C0qLOwSSvZ6PG3Ws: {
    shape: "burst", motif: "the caster strikes the earth, the ground cracks and every target shakes",
    notes: 'Colour exception, earth tones: "all terrain within Very Far range becomes difficult" and targets are temporarily Vulnerable, so the ground splits around the caster, cracks open under each target and they shake, marked cracked-shield Vulnerable.',
    cast: { assets: ["cast_generic.earth.01.browngreen"], scale: 0.8 },
    impact: { assets: ["impact.ground_crack.03.orange"], below: true, scale: 1.6, at: 500, duration: 1600 },
    extra: [{ role: "impact", on: "targets", assets: ["ground_cracks.01.orange"], below: true, scale: 0.9, at: 800, duration: 2000 }],
    aura: { assets: ["markers.shield_cracked.purple"], on: "targets", scale: 0.6, opacity: 0.75, at: 1300, duration: 1800 },
    motion: [{ motion: "slam", subject: "source", at: 0, duration: 900 }, { motion: "shake", subject: "targets", at: 800, intensity: 0.8 }],
  },
  // Sensory Projection (9): drop into a vision of any place you have been before.
  gZOMzskSOfeiXn54: {
    shape: "utility", motif: "many eyes open, senses radiate and an astral double drifts away",
    notes: 'You "drop into a vision" and "can move freely in this vision": eyes open around the caster, a sensing ring radiates and a faint astral double drifts free.',
    cast: { assets: ["eyes.01.purple.many", "eyes.01.dark_green.many"], scale: 0.6, duration: 1400 },
    impact: { assets: ["detect_magic.circle.purple", "detect_magic.circle.blue"], below: true, scale: 0.8, at: 500, duration: 1800 },
    copies: { count: 1, spread: 0.5, opacity: 0.3, at: 900, duration: 2000 },
  },
  // Adjust Reality (10): spend 5 Hope to change a roll's result to any plausible number.
  Zp2S2EnLS5Iv3XuT: {
    shape: "utility", motif: "a transmutation circle and a die that turns to the chosen face",
    notes: 'Colour exception, the gold-and-blue die: you "change the numerical result of that roll", so a transmutation circle turns under the caster and a die flips over them, and over the ally whose roll it was.',
    cast: { assets: ["magic_signs.circle.02.transmutation.complete.purple", "magic_signs.circle.02.transmutation.complete.yellow"], below: true, scale: 0.9, duration: 1800 },
    impact: { assets: ["icosahedron.star.above.blueyellow"], tint: false, scale: 0.45, offsetY: -0.8, offsetUnits: "token", at: 500, duration: 1500 },
    extra: [{ role: "impact", on: "targets", assets: ["icosahedron.roll.blue"], tint: VIOLET, scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 700, duration: 1400, label: "The ally's die turns" }],
  },
  // Falling Sky (10): shards of arcana rain on every adversary within Far range, a d20 per Stress.
  hZJp9mdkMnqKDROe: {
    shape: "burst", motif: "an evocation circle flares and violet shards rain down on every target",
    notes: 'You "make shards of arcana rain down from above": an evocation circle blazes under the caster and violet shards strike each target again and again.',
    cast: { assets: ["magic_signs.circle.02.evocation.complete.purple", "magic_signs.circle.02.evocation"], below: true, scale: 1.1, duration: 2200 },
    impact: { assets: ["impact_themed.ice_shard.01.blue", "impact_themed.ice_shard.blue"], on: "targets", tint: VIOLET, scale: 0.7, at: 800, duration: 900, repeats: 3, repeatInterval: 300 },
    motion: { motion: "press", subject: "targets", at: 900, duration: 1100, intensity: 0.6 },
  },
};
