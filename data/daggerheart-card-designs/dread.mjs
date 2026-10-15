// Dread domain card designs: card id → design record, each designed from the card's own text.
// Authoring guide: docs/daggerheart-designs/README.md. Card text: data/daggerheart-card-text.mjs.
// Palette: blood-red dread and black smoke (#a8323c). Each layer lists Patreon keys first and ends with a
// key JB2A Free has; a Free fallback in another hue is recoloured to the first choice's hue at play time.
const RED = "#a8323c";
const PALE = "#c8a2a6";

export default {
  // Blighting Strike (1): a spellcast blast at Far range; the target's next successful attack deals half damage.
  CEOM585jIX8V9PHz: {
    shape: "bolt", motif: "a blood-red eldritch bolt, a blighted burst and a curse mark that saps the target",
    notes: 'Blights the target so "the target\'s next successful attack deals half damage": a dark red eldritch bolt strikes, bursts, and a red curse mark settles on the target.',
    travel: ["eldritch_blast.dark_red", "eldritch_blast.purple"],
    impact: { assets: ["impact.004.dark_red", "impact.004.blue"], scale: 0.7 },
    aura: { assets: ["condition.curse.01.001.red"], on: "targets", scale: 0.6, opacity: 0.85, duration: 2000 },
    motion: { motion: "stagger", subject: "targets" },
    use: {
      shape: "debuff", motif: "the blight erupts on the target",
      notes: "Damage with Hope or with Fear: a dark red blast on the blighted target.",
      cast: false,
      impact: { assets: ["explosion.04.dark_red", "explosion.04.blue"], scale: 0.6 },
      motion: { motion: "shake", subject: "targets", at: 200 },
    },
  },
  // Umbral Veil (1): mark a Stress to wrap yourself in shadow; tokens lower attack rolls against you.
  SZS0WYAdFBPuzOrh: {
    shape: "ward", motif: "a knot of darkness swallows the caster and hardens into a blood-red shell",
    notes: 'You "encase yourself in shadowy energy": a knot of darkness closes over the caster, then a dim blood-red shell holds around them.',
    cast: false,
    impact: { assets: ["darkness.black"], scale: 0.5, opacity: 0.85, at: 0, duration: 1200 },
    aura: { assets: ["shield.01.complete.01.red", "shield.01.complete.01.blue"], opacity: 0.6, scale: 0.9, at: 800, duration: 1800 },
    motion: { motion: "brace", subject: "source", at: 800 },
  },
  // Voice of Dread (1): tormenting words; the target marks Stress and is Restrained with terror.
  IK56Jod0jLrpHu0V: {
    shape: "debuff", motif: "a blood-red wave of words, a fear sigil over the target, and it cowers in place",
    notes: 'You speak "tormenting them with your words" and they are "frozen with terror": a red soundwave rolls from the caster, a fear sigil flares over the target and dread binds it as it cowers.',
    cast: { assets: ["soundwave.02.red", "soundwave.02.blue"], scale: 0.7, duration: 900 },
    impact: { assets: ["icon.fear.dark_red", "icon.fear.dark_purple"], scale: 0.45, offsetY: -0.8, offsetUnits: "token", duration: 1400 },
    aura: { assets: ["energy_strands.overlay.dark_red", "energy_strands.overlay.blue.01"], scale: 0.8, opacity: 0.7, duration: 2000 },
    motion: { motion: "cower", subject: "targets", at: 800, duration: 1400 },
  },
  // Hideous Retribution (2): a reaction when an ally is hurt; strike back at the attacker for magic damage.
  PM0kAvB1lRMiZujr: {
    shape: "bolt", motif: "a red eye opens over the caster and spectral claws rake the attacker",
    notes: 'Triggers when an ally "takes damage from a target you can see": a blood-red eye snaps open over the caster, then hideous claws rake the attacker and it reels.',
    cast: { assets: ["eyes.01.dark_red.single", "eyes.01.dark_green.single"], scale: 0.4, offsetY: -0.8, offsetUnits: "token", duration: 900 },
    impact: { assets: ["claws.400px.dark_red", "claws.400px.red"], scale: 0.7, at: 700 },
    extra: [{ role: "impact", on: "targets", assets: ["impact.005.dark_red", "impact.005.orange"], scale: 0.5, at: 950 }],
    motion: { motion: "recoil", subject: "targets", at: 900 },
  },
  // Siphon Essence (2): a Very Close spellcast; heavy magic damage, and you clear HP equal to what they mark.
  "21mofokzGa4yryRZ": {
    shape: "bolt", motif: "red strands latch onto the target, it bleeds light, and the caster is mended",
    notes: 'You "clear a number of Hit Points equal to the number of Hit Points the target marked": red strands tether the target, it is struck, and a red mending glow wells up on the caster.',
    cast: ["cast_generic.01.dark_red", "cast_generic.01.yellow"],
    travel: ["energy_strands.range.standard.dark_red", "energy_strands.range.standard.purple.01"],
    impact: { assets: ["impact.003.dark_red", "impact.003.blue"], scale: 0.6 },
    extra: [{ role: "impact", on: "self", assets: ["healing_generic.200px.red", "healing_generic.200px.purple"], scale: 0.8, at: 1300, label: "The caster drinks the essence" }],
    motion: [{ motion: "stagger", subject: "targets" }, { motion: "pulse", subject: "source", at: 1300 }],
    use: {
      shape: "debuff", motif: "the target's essence tears loose and the caster drinks deeper",
      notes: "On a success with Fear: the target's essence is torn away and the caster is mended.",
      cast: false,
      impact: { assets: ["disintegrate.dark_red", "disintegrate.green"], scale: 0.6 },
      extra: [{ role: "impact", on: "self", assets: ["cure_wounds.200px.red", "cure_wounds.200px.blue"], scale: 0.7, at: 800 }],
      motion: { motion: "sink", subject: "targets", at: 200 },
    },
  },
  // Shared Trauma (3): mark HP on one willing creature to clear the same on another.
  "9ccH1Hwjvpz3iYpb": {
    shape: "heal", motif: "blood spills from one ally, a red thread carries it across, and the other is mended",
    notes: 'You "transfer suffering from one creature to another": blood splashes from the first ally, a red strand carries the wound across to the second, who glows as they heal.',
    cast: false,
    impact: { assets: ["liquid.splash02.red"], scale: 0.5, at: 0, targetSelection: "first" },
    travel: { assets: ["energy_strands.range.standard.dark_red", "energy_strands.range.standard.purple.01"], travelOrigin: "firstTarget", targetSelection: "second", at: 400 },
    extra: [{ role: "impact", on: "targets", assets: ["healing_generic.400px.red", "healing_generic.400px.purple"], scale: 0.6, at: 1200, targetSelection: "second", label: "The wound is taken away" }],
    motion: { motion: "pulse", subject: "source", at: 200 },
  },
  // Terrify (3): the target marks 1d4 Stress and flees one range away; Vulnerable on a success with Fear.
  eoC2NFqLs9llBdxC: {
    shape: "debuff", motif: "a shrieking skull bursts in the target's face and it flees in fear",
    notes: 'The target is terrified and you "make the target flee one range away": a red skull of smoke howls at the target, fear marks it and it is driven back, cracked and Vulnerable.',
    cast: false,
    impact: { assets: ["toll_the_dead.red.skull_smoke", "toll_the_dead.green.skull_smoke"], scale: 0.7, at: 100 },
    aura: { assets: ["markers.fear.dark_red", "markers.fear.dark_purple"], on: "targets", scale: 0.6, at: 700, duration: 1800 },
    extra: [{ role: "aura", on: "targets", assets: ["markers.shield_cracked.dark_red", "markers.shield_cracked"], scale: 0.5, opacity: 0.8, at: 1300, duration: 1400, label: "Vulnerable on Fear" }],
    motion: { motion: "recoil", subject: "targets", at: 600, intensity: 1, duration: 1000 },
  },
  // Chains of Affliction (4): mark 2 Stress to Chain a target; its damage is reduced by one HP.
  "2hIpGAAbwDZ9MA95": {
    shape: "debuff", motif: "a red tether lashes out and blood-red chains bind the target",
    notes: 'You "temporarily Chain a target within Close range": a crackling red tether hits the target and heavy red chains wrap it, pressing it down.',
    cast: ["cast_generic.02.dark_red", "cast_generic.02.blue"],
    travel: ["witch_bolt.dark_red", "witch_bolt.blue"],
    impact: { assets: ["impact.002.dark_red", "impact.002.blue"], scale: 0.5 },
    aura: { assets: ["markers.chain.standard.loop.02.red"], scale: 0.8, duration: 2400 },
    motion: { motion: "press", subject: "targets", at: 900, duration: 1200, intensity: 0.6 },
  },
  // Summon Horror (4): an otherworldly creature attacks a target at Far range, frightens it, then dissipates.
  UHL661KR49EgSKHR: {
    shape: "summon", motif: "a rift opens, tentacles rise, a horror bites the target, and it all dissolves into smoke",
    notes: 'You "summon an otherworldly creature" that strikes, the target must steel itself "against the horror", and then "the creature dissipates": a red rift, rising tentacles, a savage bite, a horror mark and a puff of black smoke.',
    cast: { assets: ["portals.horizontal.ring.dark_red", "portals.horizontal.ring"], below: true, scale: 0.8, duration: 1400 },
    impact: { assets: ["black_tentacles.dark_red", "black_tentacles.dark_purple"], scale: 0.5, at: 500, duration: 1600 },
    extra: [
      { role: "impact", on: "targets", assets: ["bite.400px.red"], scale: 0.6, at: 1200, label: "The horror strikes" },
      { role: "impact", on: "self", assets: ["smoke.puff.centered.dark_black", "smoke.puff.centered.grey"], scale: 0.7, at: 2000, label: "The creature dissipates" },
    ],
    aura: { assets: ["markers.horror.purple"], on: "targets", tint: RED, scale: 0.5, at: 1500, duration: 1600 },
    motion: { motion: "cower", subject: "targets", at: 1300 },
  },
  // Dire Strike (5): after a hit, spend Hope to drain power from the target; the GM loses a Fear.
  tTExFWUt2DoImpat: {
    shape: "debuff", motif: "red motes are wrung out of the target and pulled back into the caster",
    notes: 'You "drain power from them": red motes burst from the wounded target, a red beam pulls the power back and it swirls into the caster as the target sags.',
    cast: false,
    impact: { assets: ["particles.outward.red", "particles.outward.greenyellow"], scale: 0.6, at: 0 },
    travel: { assets: ["energy_beam.reverse.dark_red", "energy_beam.normal.blue.01"], at: 300, duration: 900 },
    extra: [{ role: "impact", on: "self", assets: ["particles.swirl.red", "particles.swirl.greenyellow"], scale: 0.6, at: 1000, duration: 1200 }],
    motion: { motion: "sink", subject: "targets", at: 300, duration: 1000 },
  },
  // Spectral Mist (5): an eerie mist makes you and chosen allies incorporeal.
  h2AmRjGVtVGOMsB4: {
    shape: "buff", motif: "a pale eerie mist rolls out and the caster and allies fade to ghostly shimmers",
    notes: 'Colour exception, pale ghostly grey-red: you "conjure an eerie mist" that turns you and allies "momentarily incorporeal", so a pale mist rolls out, shimmers wrap each body and they fade half out of sight.',
    cast: { assets: ["fog_cloud.02.white", "fog_cloud.01.white"], tint: PALE, below: true, scale: 1.2, opacity: 0.7, duration: 2200 },
    impact: { assets: ["shimmer.01.purple", "shimmer.01.blue"], tint: PALE, opacity: 0.7, at: 700, duration: 1800 },
    extra: [{ role: "impact", on: "self", assets: ["shimmer.01.purple", "shimmer.01.blue"], tint: PALE, opacity: 0.7, at: 600, duration: 1800 }],
    motion: [{ motion: "fade", subject: "source", at: 700, duration: 1400 }, { motion: "fade", subject: "targets", at: 800, duration: 1400 }],
  },
  // Darkfire (6): adversaries in Close range are engulfed in dark fire (Reaction Roll for half).
  CfxaFKF0ISwzSYsu: {
    shape: "burst", motif: "a ring of red fire flares round the caster and dark flame engulfs each target",
    notes: 'Targets are "engulfed in dark fire": a ring of blood-red fire flares around the caster, dark red fireballs burst on every target and they keep burning in dark flame.',
    cast: { assets: ["fire_ring.500px.red"], below: true, scale: 0.8, duration: 1200 },
    impact: { assets: ["fireball.explosion.dark_red", "fireball.explosion.orange"], on: "targets", scale: 0.6, at: 600 },
    aura: { assets: ["flames.02.purple", "flames.02"], on: "targets", tint: RED, scale: 0.6, opacity: 0.85, at: 1100, duration: 1800 },
    motion: { motion: "shake", subject: "targets", at: 700 },
  },
  // Jump Scare (6): after magic damage, teleport into Melee with the target; it is Vulnerable.
  lG0OJTYWZGsCcKVw: {
    shape: "teleport", motif: "the caster vanishes in black mist, bursts out of red mist and the target jolts, cracked open",
    notes: 'You "teleport into Melee range with them" and they are Vulnerable: black mist swallows the caster, red mist marks the arrival and a cracked shield marks the startled target.',
    cast: { assets: ["misty_step.01.dark_black", "misty_step.01.blue"], scale: 0.8, duration: 1000 },
    impact: { assets: ["misty_step.02.dark_red", "misty_step.02.blue"], scale: 0.8, at: 900 },
    extra: [{ role: "aura", on: "targets", assets: ["markers.shield_cracked.dark_red", "markers.shield_cracked"], scale: 0.6, at: 1200, duration: 1600, label: "Vulnerable" }],
    motion: [{ motion: "flicker", subject: "source", at: 200, duration: 900 }, { motion: "shake", subject: "targets", at: 1100, intensity: 0.9 }],
  },
  // Dread-Touched (7): with 4+ Dread cards, stop the GM gaining a Fear, or add the Fear pool to a roll.
  umRWvKMoyzLPL64a: {
    shape: "utility", motif: "a red ring closes round the caster and a fear sigil above them shatters",
    notes: 'You "prevent the GM from gaining a Fear": a blood-red ring locks around the caster, a fear sigil rises over them and shatters.',
    cast: false,
    aura: { assets: ["token_border.circle.static.dark_red", "token_border.circle.static.blue.001"], scale: 1, opacity: 0.8, duration: 1800 },
    impact: { assets: ["icon.fear.dark_red", "icon.fear.dark_purple"], scale: 0.45, offsetY: -0.8, offsetUnits: "token", at: 200, duration: 900 },
    extra: [{ role: "impact", on: "self", assets: ["shatter.dark_red", "shatter.blue"], scale: 0.5, offsetY: -0.8, offsetUnits: "token", at: 1000, label: "The Fear is denied" }],
    motion: { motion: "pulse", subject: "source", at: 1000 },
  },
  // Wall of Hunger (7): a wall of writhing necrotic energy; anyone inside or passing through marks 2 Stress.
  "297LR0Ww7QiUwRyL": {
    shape: "wall", motif: "a necromantic rune, a blood-red wall rising, and arms writhing out of it",
    notes: 'You create "a visible wall of writhing necrotic energy": a necromancy rune burns over the caster, a red energy wall rises and dark arms writhe along it; anyone caught in it shudders.',
    cast: { assets: ["magic_signs.rune.necromancy.complete.red", "magic_signs.rune.necromancy"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["energy_wall.01.25x05ft.01.complete.red", "energy_wall.01.25x05ft.01.complete.orange"], scale: 0.9, at: 600, duration: 2600 },
    extra: [
      { role: "aura", on: "self", assets: ["arms_of_hadar.dark_red", "arms_of_hadar.dark_purple"], scale: 0.7, opacity: 0.7, at: 900, duration: 2000 },
      { role: "impact", on: "targets", assets: ["energy_strands.complete.dark_red", "energy_strands.complete.blue.01"], scale: 0.5, at: 1100 },
    ],
    motion: { motion: "shake", subject: "targets", at: 1200 },
    use: {
      shape: "debuff", motif: "the wall's hungry arms grab a creature passing through",
      notes: "Wall damage: a creature crossing the wall is grabbed by writhing arms.",
      cast: false,
      impact: { assets: ["arms_of_hadar.dark_red", "arms_of_hadar.dark_purple"], scale: 0.5, duration: 1400 },
      motion: { motion: "shake", subject: "targets", at: 200 },
    },
  },
  // Dark Army (8): summon fiends that surround you; spend them to add damage or soak damage.
  MxgSUsmCxZkMp37U: {
    shape: "summon", motif: "a necromancy circle opens and a host of red spirits swarms around the caster",
    notes: 'You "summon fiends that surround and move with you": a blood-red necromancy circle opens beneath the caster and a ring of red spirits circles them.',
    cast: { assets: ["magic_signs.circle.02.necromancy.complete.dark_red", "magic_signs.circle.02.necromancy.complete.dark_green"], below: true, scale: 1, duration: 1800 },
    impact: { assets: ["spirit_guardians.dark_red.spirits", "bats.loop.01.red"], scale: 1.1, opacity: 0.85, at: 700, duration: 2400 },
    aura: { assets: ["spirit_guardians.dark_red.ring", "spirit_guardians.blueyellow.ring"], below: true, scale: 1.1, opacity: 0.7, at: 900, duration: 2200 },
    motion: { motion: "pulse", subject: "source", at: 700 },
    use: {
      shape: "debuff", motif: "a fiend lashes the target in a flurry, then fades from the caster's side",
      notes: "Spend a token: a fiend strikes on your behalf, then disappears.",
      cast: false,
      impact: { assets: ["flurry_of_blows.physical.dark_red", "flurry_of_blows.physical"], scale: 0.6 },
      extra: [{ role: "impact", on: "self", assets: ["spirit_guardians.dark_red.particles", "bats.complete.01.red"], scale: 0.6, opacity: 0.8, at: 600, duration: 1200, label: "The fiend disappears" }],
      motion: { motion: "stagger", subject: "targets", at: 200 },
    },
  },
  // Eldritch Flesh (8): +1 damage thresholds per Stress; on Fear, spend 2 Hope to clear an Armor Slot.
  T4rScs8WlliDzuzV: {
    shape: "ward", motif: "red strands knit into the caster and their flesh hardens into an eldritch web",
    notes: 'You "clear an Armor Slot" and harden with each Stress: red strands draw into the caster, an eldritch web knits over their body and a red shield sigil glows.',
    cast: { assets: ["energy_strands.in.red", "energy_strands.in.green"], scale: 0.7, duration: 900 },
    impact: { assets: ["shield_themed.above.eldritch_web.01.dark_purple"], tint: RED, scale: 0.7, opacity: 0.8, at: 600, duration: 1600 },
    aura: { assets: ["markers.shield.dark_red", "markers.shield"], scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 1100, duration: 1300 },
    motion: { motion: "squash", subject: "source", at: 600, intensity: 0.5 },
  },
  // Damnation (9): mark Stress for d20s of magic damage; if it kills, all adversaries near the target mark a Stress.
  "3QxwpPmDsD5vPKbH": {
    shape: "bolt", motif: "a dark red fire beam, an abyss that swallows the target and the ground cracking beneath",
    notes: 'You roll "an equal number of d20 s" of damnation: a dark red fire beam hits the target, a blood-red void of annihilation swallows it and the earth splits red beneath it.',
    cast: ["cast_generic.dark.01.red", "cast_generic.01.yellow"],
    travel: ["fireball.beam.dark_red", "fireball.beam.orange"],
    impact: { assets: ["sphere_of_annihilation.200px.dark_red", "sphere_of_annihilation.200px.purple"], scale: 0.6, duration: 1600 },
    extra: [{ role: "impact", on: "targets", assets: ["ground_cracks.dark_red.01", "ground_cracks.01"], below: true, scale: 0.8, at: 900, duration: 1800 }],
    motion: { motion: "press", subject: "targets", at: 800, duration: 1200, intensity: 0.8 },
    use: {
      shape: "debuff", motif: "fear marks every adversary near the damned target and they cower",
      notes: "If the attack defeats the target, every adversary within Far range of it marks a Stress.",
      cast: false,
      impact: { assets: ["markers.fear.dark_red", "markers.fear.dark_purple"], scale: 0.5, duration: 1400 },
      motion: { motion: "cower", subject: "targets", at: 200 },
    },
  },
  // Savor the Anguish (9): when an adversary in Close range takes Severe damage, clear a Stress.
  ZPTdjTT7JAq6R4qw: {
    shape: "utility", motif: "blood drips from the suffering adversary, red motes stream into the caster, a dark heart beats",
    notes: 'When an adversary "takes Severe damage" you clear a Stress: blood drips from the wounded adversary, red motes stream into the caster and a dark red heart beats above them.',
    cast: false,
    extra: [{ role: "impact", on: "targets", assets: ["markers.drop.red"], scale: 0.5, at: 0, duration: 1200, label: "The adversary's anguish" }],
    impact: { assets: ["particles.inward.red", "particles.inward.greenyellow"], scale: 0.7, at: 400, duration: 1400 },
    aura: { assets: ["markers.heart.dark_red", "markers.heart.pink"], scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 1200, duration: 1300 },
    motion: { motion: "drift", subject: "source", at: 600, duration: 1200 },
  },
  // Avatar of Terror (10): mark a Stress to transform into a creature fueled by fear.
  r6NekgZkMcHz2OUq: {
    shape: "aura", motif: "black smoke engulfs the caster, who swells into a writhing red shape full of eyes",
    notes: 'You "transform into a creature fueled by fear": black smoke engulfs the caster, the token swells, red strands writhe over them and many red eyes open around them.',
    cast: false,
    impact: { assets: ["smoke.puff.centered.dark_black", "smoke.puff.centered.grey"], scale: 1.1, at: 0 },
    aura: { assets: ["energy_strands.overlay.dark_red", "energy_strands.overlay.blue.01"], scale: 1.1, opacity: 0.85, at: 500, duration: 2400 },
    extra: [{ role: "aura", on: "self", assets: ["eyes.01.dark_red.many", "eyes.01.dark_green.many"], scale: 0.8, at: 900, duration: 2000 }],
    motion: [{ motion: "squash", subject: "source", at: 400, intensity: 0.8 }, { motion: "pulse", subject: "source", at: 1000, duration: 1200 }],
    scale: 1.2,
  },
  // Invoke Torment (10): double damage against fully Stressed targets; gain Hope when one is defeated.
  "6r2TrUgJAXLSbmCO": {
    shape: "debuff", motif: "a double red strike, a skull over the tormented target, and a spark of Hope for the caster",
    notes: 'Colour exception, Hope is gold: you "deal double damage to targets that have all their Stress marked" and gain a Hope when they fall, so two red hits land, a skull marks the target, it collapses and a golden light rises over the caster.',
    cast: false,
    impact: { assets: ["impact.011.dark_red", "impact.011.blue"], scale: 0.6, repeats: 2, repeatInterval: 350 },
    aura: { assets: ["markers.skull.dark_red", "markers.skull.dark_orange"], scale: 0.5, at: 900, duration: 1400 },
    extra: [{ role: "impact", on: "self", assets: ["markers.light.complete.yellow", "markers.light.complete.blue"], tint: false, scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 1500, duration: 1400, label: "A Hope gained" }],
    motion: { motion: "collapse", subject: "targets", at: 1000, duration: 1000 },
  },
};
