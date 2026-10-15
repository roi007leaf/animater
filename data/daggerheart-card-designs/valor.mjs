// Valor domain card designs: card id → design record, each designed from the card's own text.
// Authoring guide: docs/daggerheart-designs/README.md. Card text: data/daggerheart-card-text.mjs.
// Palette: golden shields and impacts (#e8a33d). Each layer lists Patreon keys first and ends with a key
// JB2A Free has; a Free fallback in another hue is recoloured to the first choice's hue at play time.
const GOLD = "#e8a33d";
const ABOVE = { offsetY: -0.8, offsetUnits: "token" };

export default {
  // Bare Bones (1): no armor; a base Armor Score of 3 + Strength and fixed thresholds.
  l5D9kq901JDESaXw: {
    shape: "ward", motif: "bare skin hardens into a stony golden hide",
    notes: 'When you "choose not to equip armor" your own body is the armor: a molten-earth plate forms under the caster and a stony hide settles over them as they brace.',
    cast: false,
    impact: { assets: ["shield_themed.below.molten_earth.01.orange"], below: true, scale: 0.9, at: 0, duration: 1600 },
    aura: { assets: ["shield_themed.above.molten_earth.01.orange"], scale: 0.85, opacity: 0.85, at: 500, duration: 1800 },
    motion: { motion: "brace", subject: "source", at: 600 },
  },
  // Forceful Push (1): a Melee weapon attack that knocks the target back; spend Hope to make it Vulnerable.
  z8FFPhDh2SdFkFfS: {
    shape: "debuff", motif: "a shove, a golden shockwave throws the target back, its guard cracks",
    notes: 'Colour exception, the Vulnerable mark is a dark red cracked shield: you "knock them back to Close range", so the caster lunges, a golden shockwave hits the target side-on and hurls it back, and a cracked shield marks it Vulnerable.',
    cast: false,
    impact: { assets: ["side_impact.part.shockwave.yellow", "side_impact.part.shockwave.blue"], scale: 0.8, at: 400 },
    aura: { assets: ["icon.shield_cracked.dark_red", "icon.shield_cracked.purple"], scale: 0.5, ...ABOVE, at: 900, duration: 1600 },
    motion: [{ motion: "lunge", subject: "source", at: 0, duration: 700 }, { motion: "recoil", subject: "targets", at: 450, intensity: 0.8 }],
  },
  // I Am Your Shield (1): mark a Stress to take an attack meant for an ally within Very Close range.
  KOf6LLpMRNwjezDx: {
    shape: "ward", motif: "the caster dashes in front of the ally and a golden shield takes the hit",
    notes: 'You "stand in the way and make yourself the target": the caster rushes to the ally, a golden shield bubble flares around the caster and they brace to take the blow.',
    cast: false,
    impact: { assets: ["shield.02.complete.01.yellow", "shield.01.complete.01.blue"], scale: 0.9, at: 600, duration: 1600 },
    motion: [{ motion: "rush", subject: "source", at: 0, duration: 600 }, { motion: "brace", subject: "source", at: 750 }],
  },
  // Body Basher (2): melee hits add Strength to damage.
  aQz8jKkCd8M9aKMA: {
    shape: "bolt", motif: "a golden fist of sheer bodily force slams the target",
    notes: 'You "use the full force of your body in a fight": the caster throws their weight forward, a golden fist of force smashes into the target and it squashes under the blow.',
    cast: false,
    travel: { assets: ["melee_generic.creature_attack.fist.001.yellow", "melee_generic.creature_attack.fist.001.red"], at: 150 },
    impact: { assets: ["impact.010.orange"], scale: 0.8 },
    motion: [{ motion: "lunge", subject: "source", at: 0, duration: 800 }, { motion: "squash", subject: "targets", at: 800 }],
  },
  // Bold Presence (2): spend Hope to add Strength to a Presence Roll; once per rest shrug off a condition.
  tdsL00yTSLNgZWs6: {
    shape: "aura", motif: "an enchantment rune, a blessing flare and a commanding golden field",
    notes: 'You "describe how your bold presence aids you": a golden enchantment rune glows above the caster, a blessing flares and a commanding field of gold settles over them.',
    cast: { assets: ["magic_signs.rune.enchantment.complete.yellow", "magic_signs.rune.enchantment.complete.pink"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["bless.200px.intro.yellow"], scale: 0.9, at: 500 },
    aura: { assets: ["energy_field.02.above.yellow", "energy_field.02.above.blue"], opacity: 0.5, at: 900, duration: 2000 },
    motion: { motion: "pulse", subject: "source", at: 600 },
  },
  // Critical Inspiration (3): on a critical attack, allies within Very Close range clear a Stress or gain a Hope.
  ABp9pUfBS69NomTD: {
    shape: "heal", motif: "a critical flash, a golden ring rolls out and inspiration lands on each ally",
    notes: 'When you "critically succeed on an attack" your allies are inspired: a golden CRITICAL flashes over the caster, a ring rolls out from them and inspiration sparkles over each ally.',
    cast: { assets: ["ui.critical.yellow", "ui.critical.red"], scale: 0.6, ...ABOVE, duration: 1200 },
    impact: { assets: ["bardic_inspiration.blueyellow", "bardic_inspiration.greenorange"], scale: 0.7, at: 800 },
    extra: [{ role: "impact", on: "self", assets: ["zoning.outward.circle.once.redyellow.01.01", "zoning.outward.circle.once.bluegreen.01.01"], below: true, scale: 0.9, at: 400, label: "Inspiration rings out" }],
  },
  // Lean on Me (3): console an ally who failed; you both clear 2 Stress.
  BdePs1ZWpZTZvY1Z: {
    shape: "heal", motif: "a golden heart rises over the caster, then soothing light on both of them",
    notes: 'When you "console or inspire an ally" you both clear Stress: a golden heart rises over the caster, then the same soothing glow washes over the ally and the caster.',
    cast: { assets: ["markers.heart.pink.01"], tint: GOLD, scale: 0.45, ...ABOVE, duration: 1400 },
    impact: { assets: ["healing_generic.200px.yellow"], scale: 0.8, at: 800 },
    extra: [{ role: "impact", on: "self", assets: ["healing_generic.200px.yellow02", "healing_generic.200px.yellow"], scale: 0.8, at: 900, label: "Both clear Stress" }],
    motion: { motion: "pulse", subject: "targets", at: 900 },
  },
  // Goad Them On (4): taunt a target in Close range; it marks a Stress and must attack you with disadvantage.
  HufF5KzuNfEb9RTi: {
    shape: "debuff", motif: "a bellowed taunt, a tether to the target and an angry red mark on it",
    notes: 'Colour exception, the provoked mark is red: you "taunt a target" and it "must target you", so a golden shout ripples from the caster, a tether lashes the target to them and a red quarry mark pulses on it.',
    cast: { assets: ["soundwave.02.orangeyellow", "soundwave.02.blue"], scale: 0.7, duration: 1000 },
    travel: { assets: ["energy_strands.range.standard.orange.01", "energy_strands.range.standard.purple.01"], at: 500 },
    impact: { assets: ["impact.008.orange"], scale: 0.6 },
    aura: { assets: ["hunters_mark.loop.01.red", "hunters_mark.loop.01.green"], scale: 0.6, duration: 1800 },
    motion: { motion: "stagger", subject: "targets" },
  },
  // Support Tank (4): spend 2 Hope so an ally in Close range rerolls their Hope or Fear Die.
  stId5syX7YpP2JGz: {
    shape: "buff", motif: "a golden circle at the caster, a field around the ally and their die rolls again",
    notes: 'You "allow them to reroll either their Hope or Fear Die": a golden circle flashes at the caster, a protective field wraps the ally and a golden die tumbles over their head.',
    cast: { assets: ["cast_shape.circle.single01.yellow", "cast_shape.circle.single01.blue"], scale: 0.6 },
    impact: { assets: ["icosahedron.roll.blue"], tint: GOLD, scale: 0.4, ...ABOVE, at: 700, duration: 1400 },
    aura: { assets: ["energy_field.01.yellow", "energy_field.01.blue"], scale: 0.8, opacity: 0.6, at: 600, duration: 1800 },
  },
  // Armorer (5): +1 Armor Score; repairing armor in a rest also clears an Armor Slot for each ally.
  cy8GjBPGc9w9RaGO: {
    shape: "heal", motif: "a golden hammer rings out sparks, then each ally's shield gleams anew",
    notes: 'When you "repair your armor" your allies benefit too: a golden smith\'s hammer swings at the caster, sparks fly, and a fresh golden shield mark appears on each ally.',
    cast: { assets: ["hammer.melee.01.yellow", "hammer.melee.01.white"], scale: 0.6, duration: 900 },
    impact: { assets: ["markers.shield.yellow.01", "markers.shield.green.01"], scale: 0.6, at: 900, duration: 1600 },
    extra: [{ role: "impact", on: "self", assets: ["impact.007.yellow"], scale: 0.5, at: 450, label: "Sparks from the hammer" }],
  },
  // Rousing Strike (5): on a critical attack, you and allies who see or hear you clear a Hit Point or 1d4 Stress.
  pcbYD33rBBdAo5f9: {
    shape: "heal", motif: "a golden smite, then a healing burst and a strong heartbeat on every ally",
    notes: 'Your strike rouses "you and all allies who can see or hear you": a golden smite flares at the caster, healing light bursts on each ally and a steady heartbeat glows over them while the caster mends too.',
    cast: { assets: ["divine_smite.caster.yellowwhite", "divine_smite.caster.blueyellow"], scale: 0.8 },
    impact: { assets: ["healing_generic.burst.yellowwhite", "healing_generic.burst.greenorange"], scale: 0.7, at: 800 },
    aura: { assets: ["ui.heartbeat.01.yellow", "ui.heartbeat.01.green"], scale: 0.45, ...ABOVE, at: 1100, duration: 1600 },
    extra: [{ role: "impact", on: "self", assets: ["healing_generic.loop.yellowwhite", "healing_generic.loop.greenorange"], scale: 0.7, at: 800, duration: 1400, label: "The striker mends too" }],
  },
  // Inevitable (6): a failed action roll gives the next action roll advantage.
  XTT8c8uJ4D7fvtbL: {
    shape: "utility", motif: "a red MISS, a stumble, then golden chevrons climbing upward",
    notes: 'Colour exception, the miss is red: "when you fail an action roll" the next has advantage, so a red MISS pops over the caster, they stagger, then golden chevrons climb upward.',
    cast: { assets: ["ui.miss.red", "ui.miss.white"], tint: false, scale: 0.5, ...ABOVE, duration: 1000 },
    impact: { assets: ["ui.chevrons3.yellow"], scale: 0.6, offsetY: -0.5, offsetUnits: "token", at: 900, duration: 1400 },
    motion: [{ motion: "stagger", subject: "source", at: 150 }, { motion: "pulse", subject: "source", at: 1000 }],
  },
  // Rise Up (6): bonus to the Severe threshold; marking Hit Points clears a Stress.
  oDIZoC4l19Nli0Fj: {
    shape: "ward", motif: "knocked low, the caster rises again in golden healing light",
    notes: 'When "you mark 1 or more Hit Points from an attack, clear a Stress": the caster sinks under the blow, then rises again as golden healing light and motes lift off them.',
    cast: false,
    impact: { assets: ["cure_wounds.400px.yellow", "cure_wounds.400px.blue"], scale: 0.7, at: 600 },
    aura: { assets: ["particles.outward.orange.01.01", "particles.outward.greenyellow.01.01"], scale: 0.7, at: 900, duration: 1400 },
    motion: [{ motion: "sink", subject: "source", at: 0, duration: 700 }, { motion: "levitate", subject: "source", at: 800, duration: 1000, intensity: 0.4 }],
  },
  // Shrug It Off (7): mark a Stress to lower incoming damage one threshold; roll a d6, 3 or lower vaults the card.
  JwfhtgmmuRxg4zhI: {
    shape: "ward", motif: "a blow lands, a golden shell bursts away with the damage, a die tumbles",
    notes: 'You "reduce the severity of the damage by one threshold" and then roll a d6: a blow lands on the caster, a golden shield bursts away taking part of the hit, and a golden die tumbles above them.',
    cast: { assets: ["impact.006.yellow"], scale: 0.6 },
    impact: { assets: ["shield.01.outro_explode.yellow", "shield.01.outro_explode.blue"], scale: 0.85, at: 300 },
    extra: [{ role: "impact", on: "self", assets: ["icosahedron.simple.blue"], tint: GOLD, scale: 0.4, ...ABOVE, at: 900, duration: 1300, label: "The d6 roll" }],
    motion: { motion: "recoil", subject: "source", at: 100, duration: 700, intensity: 0.3 },
  },
  // Valor-Touched (7): with 4+ Valor cards, +1 Armor Score and clear an Armor Slot when you mark HP without one.
  k1AtYd3lSchIymBr: {
    shape: "aura", motif: "an abjuration rune, a spinning golden ring and a shield rampart",
    notes: 'Valor runs deep: you "clear an Armor Slot" as your armor mends itself, so a golden abjuration rune flares above the caster, a golden ring spins around them and a shield rampart rises.',
    cast: { assets: ["magic_signs.rune.abjuration.complete.yellow", "magic_signs.rune.abjuration.complete.blue"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["token_border.circle.spinning.orange.001", "token_border.circle.spinning.blue.001"], scale: 1, at: 400, duration: 1800 },
    aura: { assets: ["markers.shield_rampart.complete.03.yellow", "markers.shield_rampart.complete.01.orange"], scale: 0.8, at: 800, duration: 1800 },
  },
  // Full Surge (8): mark 3 Stress for +2 to every trait until the next rest.
  SgvjJfMyubZowPxS: {
    shape: "aura", motif: "power floods in, golden static crackles and the body glows with strength",
    notes: 'You "push your body to its limits": golden energy strands pour into the caster, static crackles over them, a lasting golden glow wraps the body and the token shudders with power.',
    cast: { assets: ["energy_strands.in.yellow.01", "energy_strands.in.green.01"], scale: 0.8, duration: 900 },
    impact: { assets: ["static_electricity.03.yellow", "static_electricity.03.blue"], scale: 0.7, at: 700 },
    aura: { assets: ["on_token_buff.002.001.orangeyellow", "on_token_buff.001.001.orangeyellow"], scale: 0.9, at: 1000, duration: 2000 },
    motion: [{ motion: "shake", subject: "source", at: 700, intensity: 0.4 }, { motion: "pulse", subject: "source", at: 1100 }],
  },
  // Ground Pound (8): strike the ground; everyone in Very Close range is thrown to Far range and takes 4d10+8.
  WnGldYhJPDhx8v9X: {
    shape: "burst", motif: "the caster slams the ground, a crater cracks open and a shockwave hurls everyone away",
    notes: 'You "strike the ground where you stand" and targets "are thrown back to Far range": the caster leaps and slams down, a golden-orange crater cracks open, a shockwave rings out and each target is blasted away.',
    cast: false,
    impact: { assets: ["impact.ground_crack.03.orange"], below: true, scale: 1.4, at: 400, duration: 1600 },
    extra: [
      { role: "impact", on: "self", assets: ["thunderwave.center.orange", "thunderwave.center.blue"], scale: 1, at: 450, label: "Shockwave" },
      { role: "impact", on: "targets", assets: ["impact.009.orange"], scale: 0.7, at: 650 },
    ],
    motion: [{ motion: "slam", subject: "source", at: 0, duration: 800 }, { motion: "recoil", subject: "targets", at: 650, intensity: 0.9 }],
  },
  // Hold the Line (9): a defensive stance; adversaries who come Very Close are pulled into Melee and Restrained.
  kdFoLo3KXwn4LqTG: {
    shape: "wall", motif: "a warding circle plants the caster, a pull drags foes in and chains bind them",
    notes: 'Adversaries are "pulled into Melee range and Restrained": a golden abjuration circle locks under the caster, a ring of force draws inward and golden chains bind every targeted adversary.',
    cast: { assets: ["magic_signs.circle.02.abjuration.complete.yellow", "magic_signs.circle.02.abjuration.complete.blue"], below: true, scale: 0.9, duration: 2000 },
    impact: { assets: ["zoning.inward.circle.once.redyellow.01.01", "zoning.inward.circle.once.bluegreen.01.01"], scale: 1.1, at: 500 },
    aura: { assets: ["markers.chain.standard.complete.02.yellow", "markers.chain.standard.complete.02.red"], on: "targets", scale: 0.7, at: 900, duration: 2000 },
    motion: [{ motion: "brace", subject: "source", at: 200 }, { motion: "press", subject: "targets", at: 1000, intensity: 0.5 }],
    actions: {
      // Spend Hope
      hxupFx3czFHz3xfG: {
        shape: "ward", motif: "a warding circle plants the caster in a defensive stance behind a golden rampart",
        notes: 'You "describe the defensive stance you take and spend a Hope": a golden abjuration circle locks under the caster and a rampart rises as they brace.',
        cast: { assets: ["magic_signs.circle.02.abjuration.complete.yellow", "magic_signs.circle.02.abjuration.complete.blue"], below: true, scale: 0.9, duration: 2000 },
        impact: { assets: ["markers.shield_rampart.complete.03.yellow", "markers.shield_rampart.complete.01.orange"], scale: 0.8, at: 500, duration: 1800 },
        motion: { motion: "brace", subject: "source", at: 200 },
      },
      // Restrain
      SKG6Gu0uJZxtYTnz: {
        shape: "debuff", motif: "a ring of force drags the adversary in and golden chains bind it",
        notes: 'An adversary that comes close is "pulled into Melee range and Restrained": a ring of force draws inward and golden chains bind it.',
        cast: false,
        impact: { assets: ["zoning.inward.circle.once.redyellow.01.01", "zoning.inward.circle.once.bluegreen.01.01"], on: "self", scale: 1.1, at: 0 },
        aura: { assets: ["markers.chain.standard.complete.02.yellow", "markers.chain.standard.complete.02.red"], scale: 0.7, at: 500, duration: 2000 },
        motion: { motion: "press", subject: "targets", at: 600, intensity: 0.5 },
      },
    },
  },
  // Lead by Example (9): after dealing damage, mark a Stress; the next PC to attack that adversary clears Stress or gains Hope.
  YWCRplmtwpCjpq5i: {
    shape: "debuff", motif: "a raised golden beacon, a beam points the way and the foe glints as a mark",
    notes: 'You "describe how you encourage your allies" against that adversary: a golden beacon lights over the caster, a golden beam points at the foe and glints mark it for the next ally to strike.',
    cast: { assets: ["markers.light.complete.yellow", "markers.light.complete.blue"], scale: 0.5, ...ABOVE, duration: 1400 },
    travel: { assets: ["energy_beam.normal.yellow.01", "energy_beam.normal.blue.01"], at: 500, duration: 900 },
    aura: { assets: ["glint.yellow.many"], scale: 0.8, at: 1100, duration: 1800 },
  },
  // Unbreakable (10): at your last Hit Point, roll a d6 and clear that many Hit Points instead of a death move.
  CUIQmrPjf9VCHmwJ: {
    shape: "ward", motif: "the caster falls, a die turns, a pillar of light and they stand healed",
    notes: 'Colour exception, the die is gold and blue like the Hope Die: "instead of making a death move" you roll a d6 and heal, so the caster collapses, a die turns above them, a pillar of golden light strikes and healing wraps them.',
    cast: false,
    impact: { assets: ["sacred_flame.target.yellow"], scale: 0.9, at: 800 },
    aura: { assets: ["healing_generic.400px.yellow"], scale: 0.8, at: 1200, duration: 1600 },
    extra: [{ role: "impact", on: "self", assets: ["icosahedron.star.above.blueyellow"], tint: false, scale: 0.45, ...ABOVE, at: 200, duration: 1400, label: "The d6 roll" }],
    motion: [{ motion: "collapse", subject: "source", at: 0, duration: 800 }, { motion: "pulse", subject: "source", at: 1300 }],
  },
  // Unyielding Armor (10): before marking an Armor Slot, roll Proficiency d6s; any 6 lowers severity for free.
  s3zRsOMeUkuDwgd8: {
    shape: "ward", motif: "a gleaming golden shield turns the blow and a star flashes for the 6",
    notes: 'If "any roll a 6, reduce the severity" without marking armor: a golden shield gleams around the caster and turns the blow, and a golden star ward flashes for the lucky 6.',
    cast: false,
    impact: { assets: ["shield.03.complete.01.yellow", "shield.01.complete.01.blue"], scale: 0.9, at: 0, duration: 1600 },
    aura: { assets: ["ward.star.yellow.01"], scale: 0.7, at: 700, duration: 1400 },
    motion: { motion: "brace", subject: "source", at: 300 },
  },
};
