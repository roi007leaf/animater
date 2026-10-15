// Bone domain card designs: card id → design record, each designed from the card's own text.
// Authoring guide: docs/daggerheart-designs/README.md. Card text: data/daggerheart-card-text.mjs.
// Palette: pale bone white (#e8e2d0). Bone is the martial domain of speed, footwork and tactics, so
// most cards show motion, afterimages, parries and blows rather than spell light. Each layer lists
// Patreon keys first and ends with a key JB2A Free has; a Free fallback in another hue is recoloured
// to the first choice's hue at play time, and BONE tints coloured art to the pale bone shade.
const BONE = "#e8e2d0";

export default {
  // Deft Maneuvers (1): mark a Stress to sprint anywhere within Far range; +1 to an attack on arrival.
  dc4rAXlv95srZUct: {
    shape: "utility", motif: "a kick of dust, a streak of wind and a sprint forward",
    notes: 'You "sprint anywhere within Far range" with no Agility Roll: dust kicks up at the start, pale wind lines streak past the caster as they rush forward, and an adversary they close on is marked for the +1 attack.',
    cast: { assets: ["smoke.puff.side.02.white"], tint: BONE, scale: 0.7, duration: 900 },
    impact: { assets: ["wind_lines.01.01.white"], tint: BONE, scale: 0.9, at: 250, duration: 1200 },
    extra: [{ role: "impact", on: "targets", assets: ["on_token_target.001.001.white", "on_token_target.001.001.blueteal"], tint: BONE, scale: 0.6, at: 1000, duration: 1200, label: "Closing on the adversary" }],
    motion: { motion: "rush", subject: "source", at: 200, duration: 900 },
  },
  // I See It Coming (1): when targeted from beyond Melee range, mark a Stress to add a d4 to Evasion.
  Kp6RejHGimnuoBom: {
    shape: "ward", motif: "a watchful eye opens and the caster sidesteps, leaving an afterimage",
    notes: 'When "targeted by an attack made from beyond Melee range" you see it coming: a pale eye opens over the caster, then they sidestep and a faint afterimage holds where they stood.',
    cast: false,
    impact: { assets: ["eyes.01.purple.single", "eyes.01.dark_green.single"], tint: BONE, scale: 0.35, offsetY: -0.9, offsetUnits: "token", at: 0, duration: 1300 },
    copies: { count: 1, spread: 0.35, opacity: 0.35, at: 700, duration: 1300 },
    motion: { motion: "dodge", subject: "source", at: 700, duration: 700 },
  },
  // Untouchable (1): a passive bonus to Evasion equal to half your Agility.
  "9QElncQUDSakuSdR": {
    shape: "aura", motif: "pale air whirls around a caster who sways between afterimages",
    notes: 'Gain "a bonus to your Evasion" from Agility: pale air swirls around the caster, two afterimages blur at their sides and they sway out of reach.',
    cast: false,
    aura: { assets: ["whirlwind.bluewhite", "whirlwind.bluegrey"], tint: BONE, scale: 0.7, opacity: 0.6, at: 0, duration: 2200 },
    copies: { count: 2, spread: 0.3, opacity: 0.35, at: 300, duration: 1900 },
    motion: { motion: "drift", subject: "source", at: 300, duration: 1600, intensity: 0.5 },
  },
  // Ferocity (2): when an adversary marks Hit Points from you, spend 2 Hope to raise Evasion by that many.
  jSQsSP61CX4MhSN7: {
    shape: "utility", motif: "claw marks flare on the wounded foe and a savage surge rises in the caster",
    notes: 'When "you cause an adversary to mark 1 or more Hit Points" the wound feeds you: bone-pale claw marks flare on the adversary, then a surge wells up around the caster.',
    cast: false,
    extra: [{ role: "impact", on: "targets", assets: ["claws.200px.brown", "claws.200px.red"], tint: BONE, scale: 0.7, at: 0, label: "The wound you dealt" }],
    impact: { assets: ["on_token_buff.002.001.white", "on_token_buff.001.001.white"], tint: BONE, scale: 0.9, at: 500, duration: 1600 },
    motion: [{ motion: "shake", subject: "targets", at: 100 }, { motion: "squash", subject: "source", at: 600, duration: 700 }],
  },
  // Strategic Approach (2): tokens spent when you close on an adversary: advantage, clear an ally's Stress, or +d8 damage.
  "5b1awkgTmMp3FVrm": {
    shape: "utility", motif: "a radar ping sweeps the foe, then chevrons point the caster in",
    notes: 'The first time "you move within Close range of an adversary" you cash in the plan: a ping sweeps the adversary, pale chevrons flash over the caster and they lunge in.',
    cast: false,
    extra: [{ role: "impact", on: "targets", assets: ["template_circle.radar.loop.ping.001.300px.round.white", "template_circle.radar.loop.ping.001.300px.round.greenpurple"], tint: BONE, scale: 0.5, at: 0, duration: 1300, label: "Read the adversary" }],
    impact: { assets: ["ui.chevrons3.yellow"], tint: BONE, scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 600, duration: 1000 },
    motion: { motion: "lunge", subject: "source", at: 900, duration: 700 },
  },
  // Brace (3): when marking an Armor Slot, mark a Stress to mark an additional one.
  QXs4vssSqNGQu5b8: {
    shape: "ward", motif: "a rampart shield slams up, then a second one locks over it",
    notes: 'You "mark an additional Armor Slot": a pale rampart shield rises over the caster, then a second shield locks in on top as they dig in.',
    cast: false,
    impact: { assets: ["markers.shield_rampart.complete.01.white", "markers.shield_rampart.complete.01.orange"], tint: BONE, scale: 0.8, at: 0, duration: 1200 },
    extra: [{ role: "impact", on: "self", assets: ["shield.02.complete.01.white", "shield.01.complete.01.blue"], tint: BONE, scale: 0.8, at: 600, duration: 1300, label: "The additional Armor Slot" }],
    motion: { motion: "brace", subject: "source", at: 300, duration: 1100 },
  },
  // Tactician (3): Help an Ally lends them an Experience; Tag Team Rolls use a d20 as the Hope Die.
  WChWEH36lUpXAC0K: {
    shape: "buff", motif: "a pale tether links caster and ally, and a d20 turns over them",
    notes: 'Colour exception, the gold-and-blue Hope die: you "Help an Ally" and can "roll a d20 as your Hope Die", so a pale tether links you to the ally, a buff settles on them and a d20 tumbles over the caster.',
    travel: { assets: ["energy_strands.range.standard.grey", "energy_strands.range.standard.purple"], tint: BONE },
    impact: { assets: ["on_token_buff.003.001.white", "on_token_buff.001.001.white"], tint: BONE, scale: 0.8 },
    extra: [{ role: "impact", on: "self", assets: ["icosahedron.rune.above.blueyellow"], tint: false, scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 300, duration: 1400, label: "d20 Hope Die" }],
  },
  // Boost (4): boost off an ally, fling into the air and make an aerial attack, landing in Melee range.
  VKAHS6eWz28ukcDs: {
    shape: "bolt", motif: "a dust ring pops at take-off, the caster leaps and crashes onto the target",
    notes: 'You "fling yourself into the air, and perform an aerial attack": a ring of dust pops at take-off, the caster leaps and comes down on the target, cracking the ground under it.',
    cast: { assets: ["smoke.puff.ring.02.white", "smoke.puff.ring.01.white"], tint: BONE, scale: 0.8, duration: 900 },
    impact: { assets: ["impact.ground_crack.01.white", "impact.ground_crack.01.orange"], tint: BONE, below: true, scale: 0.9, at: 1000, duration: 1500 },
    extra: [{ role: "impact", on: "targets", assets: ["impact.013.001.white", "impact.013.001.orangeyellow"], tint: BONE, scale: 0.6, at: 1000 }],
    motion: [{ motion: "leap", subject: "source", at: 200, duration: 900 }, { motion: "stagger", subject: "targets", at: 1050 }],
  },
  // Redirect (4): a failed ranged attack against you is turned onto an adversary within Very Close range.
  faU0XkJCbar69PiN: {
    shape: "debuff", motif: "a miss flashes, the caster twists and the arrow is turned into a nearby foe",
    notes: 'When the ranged attack "fails" you "redirect the attack to damage an adversary": a miss flashes over the caster, they spin and the missile is batted into the nearby adversary.',
    cast: { assets: ["ui.miss.white"], tint: BONE, scale: 0.4, offsetY: -0.8, offsetUnits: "token", duration: 900 },
    travel: { assets: ["arrow.physical.white.02", "arrow.physical.white.01"], tint: BONE, at: 600 },
    impact: { assets: ["impact.005.white", "impact.005.orange"], tint: BONE, scale: 0.6 },
    motion: [{ motion: "spin", subject: "source", at: 350, duration: 500, intensity: 0.5 }, { motion: "recoil", subject: "targets" }],
  },
  // Know Thy Enemy (5): an Instinct Roll against an observed creature reveals its secrets; mark Stress to remove a Fear.
  O38MQMhJWdZnXi6b: {
    shape: "debuff", motif: "a scanning ring and a hunter's mark settle on the studied creature",
    notes: '"When observing a creature" you size it up: a pale scanning ring sweeps beneath it and a hunter\'s mark pulses over it as its numbers, thresholds and tactics are read.',
    cast: false,
    impact: { assets: ["detect_magic.circle.grey", "detect_magic.circle.blue"], tint: BONE, below: true, scale: 0.7, duration: 1600 },
    aura: { assets: ["hunters_mark.pulse.01.purple", "hunters_mark.pulse.01.green"], tint: BONE, scale: 0.5, at: 900, duration: 1400 },
  },
  // Signature Move (5): your named signature move rolls a d20 as the Hope Die; on a success, clear a Stress.
  LWRkhNY968Cu2Zl5: {
    shape: "utility", motif: "a spinning flourish of blades and a d20 bursting with stars",
    notes: 'Colour exception, the gold-and-blue Hope die: "your signature combat move" is shown off with a spinning bone-pale flourish, then a starry d20 flips over the caster for the Hope Die.',
    cast: false,
    impact: { assets: ["melee_generic.whirlwind.01.bluepurple", "melee_generic.whirlwind.01.orange"], tint: BONE, scale: 0.9, at: 0, duration: 1100 },
    extra: [{ role: "impact", on: "self", assets: ["icosahedron.star.above.blueyellow"], tint: false, scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 900, duration: 1400, label: "d20 Hope Die" }],
    motion: { motion: "spin", subject: "source", at: 0, duration: 900 },
  },
  // Rapid Riposte (6): when a melee attack against you fails, mark a Stress to hit back with weapon damage.
  tceJDcCUefrMS2Ov: {
    shape: "debuff", motif: "a parry spark, then a bone blade lashes back at the attacker",
    notes: 'You "seize the opportunity to deal the weapon damage": a parry spark flashes at the caster, a bone sword lashes back at the attacker and bites.',
    cast: { assets: ["impact.009.white", "impact.009.orange"], tint: BONE, scale: 0.5, duration: 600 },
    travel: { assets: ["melee_attack.01.bonesword", "melee_attack.01.shortsword"], tint: BONE, at: 300 },
    impact: { assets: ["impact.014.001.white", "impact.014.001.orangeyellow"], tint: BONE, scale: 0.5 },
    motion: [{ motion: "lunge", subject: "source", at: 300, duration: 600 }, { motion: "recoil", subject: "targets" }],
  },
  // Recovery (6): take a long rest downtime move during a short rest; spend Hope to let an ally do the same.
  gsiQFT6q3WOgqerJ: {
    shape: "utility", motif: "a campfire crackles and a pale restoring glow settles on the ally",
    notes: 'Colour exception, firelight orange: "During a short rest" you get a long rest\'s worth, so a campfire burns before the caster, who settles, and a pale restoring glow rises over an ally who shares it.',
    cast: false,
    impact: { assets: ["campfire.03.01.complete.orange", "campfire.01.orange"], tint: false, scale: 0.6, offsetY: 0.6, offsetUnits: "token", at: 0, duration: 2400 },
    extra: [{ role: "impact", on: "targets", assets: ["healing_generic.loop.bluewhite", "healing_generic.loop.greenorange"], tint: BONE, scale: 0.7, at: 700, duration: 1800, label: "The ally rests too" }],
    motion: { motion: "sink", subject: "source", at: 300, duration: 1200, intensity: 0.4 },
  },
  // Bone-Touched (7): +1 Agility; once per rest spend 3 Hope to make a successful attack against you fail.
  ON5bvnoQBy0SYc9Y: {
    shape: "ward", motif: "a necromantic rune, a ward of skulls and a miss over the caster",
    notes: 'With the domain in your bones you "cause an attack that succeeded against you to fail instead": a pale necromancy rune flares, a skull ward snaps around the caster and the hit turns into a miss as they twist away.',
    cast: { assets: ["magic_signs.rune.necromancy.complete.grey", "magic_signs.rune.necromancy.complete.green"], tint: BONE, scale: 0.5, offsetY: -0.6, offsetUnits: "token", duration: 1000 },
    impact: { assets: ["ward.skull.dark_purple", "ward.rune.yellow"], tint: BONE, scale: 0.8, at: 500, duration: 1300 },
    aura: { assets: ["ui.miss.white"], tint: BONE, scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 1000, duration: 900 },
    motion: { motion: "dodge", subject: "source", at: 600, duration: 700 },
  },
  // Cruel Precision (7): successful weapon attacks add your Finesse or Agility to damage.
  bap1eCWryPNowbyo: {
    shape: "debuff", motif: "a thin exact slash across the target, then a sharp bloom of pain",
    notes: 'You "gain a bonus to your damage roll" from Finesse or Agility: a thin, exact pale slash cuts across the target and a sharp impact blooms where it landed.',
    cast: false,
    impact: { assets: ["ranged_slash.instant.001.white", "ranged_slash.instant.001.blue"], tint: BONE, scale: 0.7, duration: 700 },
    extra: [{ role: "impact", on: "targets", assets: ["sneak_attack.yellow", "sneak_attack.dark_green"], tint: BONE, scale: 0.5, at: 1000, label: "Precision bonus" }],
    motion: { motion: "shake", subject: "targets", at: 1000, intensity: 0.5 },
  },
  // Breaking Blow (8): mark a Stress so the next successful attack on the same target deals an extra 2d12.
  "8UANBgSdhMZ0sqfO": {
    shape: "debuff", motif: "the target's guard shatters and a cracked shield stays on it",
    notes: 'The blow sets up "the next successful attack against that same target": the target\'s guard shatters into bone-pale shards and a cracked shield hangs over it, waiting for the 2d12.',
    cast: false,
    impact: { assets: ["shatter.orange", "shatter.blue"], tint: BONE, scale: 0.7 },
    aura: { assets: ["markers.shield_cracked.dark_red", "markers.shield_cracked.purple"], tint: BONE, scale: 0.55, opacity: 0.8, at: 800, duration: 1800 },
    motion: { motion: "stagger", subject: "targets", at: 100 },
  },
  // Wrangle (8): an Agility Roll against everything in Close range; move them and willing allies to another point.
  "9DwSxHoUwl8Kxj3n": {
    shape: "burst", motif: "the caster whirls, a pulling ring sweeps in and chains herd everyone along",
    notes: 'You "move targets you succeed against, and any willing allies" across the field: the caster whirls, a ring sweeps inward around them and pale chains snag each target as they are hauled.',
    cast: false,
    impact: { assets: ["zoning.inward.circle.once.bluegreen.01.01"], tint: BONE, scale: 1.4, at: 0, duration: 1400 },
    extra: [{ role: "impact", on: "targets", assets: ["markers.chain.standard.complete.02.grey", "markers.chain.standard.complete.02.red"], tint: BONE, scale: 0.6, at: 400, duration: 1400, label: "Wrangled" }],
    motion: [{ motion: "spin", subject: "source", at: 0, duration: 1000, intensity: 0.6 }, { motion: "drift", subject: "targets", at: 600, duration: 1100 }],
  },
  // On the Brink (9): with 2 or fewer Hit Points unmarked, you don't take Minor damage.
  zbxPl81kbWEegKQN: {
    shape: "ward", motif: "a faint heartbeat, a skull in smoke, and the caster sways but stays up",
    notes: 'Near death, "you don\'t take Minor damage": a faint heartbeat line pulses over the caster, a skull of smoke rises behind them and they teeter but keep their feet.',
    cast: false,
    impact: { assets: ["ui.heartbeat.01.red", "ui.heartbeat.01.green"], tint: BONE, scale: 0.45, offsetY: -0.8, offsetUnits: "token", at: 0, duration: 1500 },
    aura: { assets: ["toll_the_dead.grey.skull_smoke", "toll_the_dead.green.skull_smoke"], tint: BONE, scale: 0.6, opacity: 0.7, at: 400, duration: 1600 },
    motion: { motion: "stagger", subject: "source", at: 600, duration: 900 },
  },
  // Splintering Strike (9): attack every adversary in weapon range, splitting the damage, plus an extra die each.
  TYKfM3H9vBXyWiH4: {
    shape: "bolt", motif: "splinters of bone fly to every foe and burst into shrapnel",
    notes: 'You "make an attack against all adversaries within your weapon\'s range" and distribute the damage: the caster slams down, bone splinters fly to every target and burst into shrapnel one after another.',
    cast: false,
    travel: { assets: ["bone.throw", "dagger.throw.01.white"], tint: BONE, at: 300, targetStagger: 150 },
    impact: { assets: ["explosion.shrapnel.bomb.01.grey", "explosion.shrapnel.bomb.01.black"], tint: BONE, scale: 0.5, targetStagger: 150 },
    motion: [{ motion: "slam", subject: "source", at: 0, duration: 600 }, { motion: "shake", subject: "targets" }],
  },
  // Deathrun (10): run a straight path within Far range, attacking every adversary along it with shrinking damage.
  xFOSn8IVVNizgHFq: {
    shape: "bolt", motif: "a streak of wind down a straight path, afterimages behind, slashes on each foe in turn",
    notes: 'You "run a straight path through the battlefield": the caster rushes off, afterimages trail behind, a pale wind streak runs the line and a slash cuts each adversary in turn, one after another.',
    cast: false,
    travel: { assets: ["wind_stream.white"], tint: BONE, at: 100, targetSelection: "first" },
    impact: { assets: ["melee_generic.slash.02.001.orange", "melee_generic.slash.02.001.blue"], tint: BONE, scale: 0.7, targetStagger: 250 },
    copies: { count: 4, spread: 0.6, opacity: 0.3, at: 100, duration: 1200 },
    motion: [{ motion: "rush", subject: "source", at: 100, duration: 900, intensity: 1 }, { motion: "recoil", subject: "targets" }],
  },
  // Swift Step (10): when an attack against you fails, clear a Stress, or gain a Hope if you can't.
  H6TqCJBaa1eWEQ1z: {
    shape: "utility", motif: "a sidestep out of the blow and the strain falling away as pale motes",
    notes: 'When "an attack made against you fails" you "clear a Stress": the caster steps aside from an afterimage, and pale motes stream off them as the strain falls away.',
    cast: false,
    impact: { assets: ["particles.outward.white", "particles.outward.greenyellow"], tint: BONE, scale: 0.7, at: 500, duration: 1300 },
    aura: { assets: ["healing_generic.burst.bluewhite", "healing_generic.burst.greenorange"], tint: BONE, scale: 0.6, opacity: 0.7, at: 900, duration: 1200 },
    copies: { count: 1, spread: 0.45, opacity: 0.4, at: 0, duration: 900 },
    motion: { motion: "dodge", subject: "source", at: 0, duration: 600, intensity: 0.8 },
  },
};
