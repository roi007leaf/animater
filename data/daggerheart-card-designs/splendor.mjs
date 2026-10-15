// Splendor domain card designs: card id → design record, each designed from the card's own text.
// Authoring guide: docs/daggerheart-designs/README.md. Card text: data/daggerheart-card-text.mjs.
// Palette: radiant gold and white (#ffd966). Each layer lists Patreon keys first and ends with a key
// JB2A Free has; a Free fallback in another hue is recoloured to the first choice's hue at play time.
const GOLD = "#ffd966";

export default {
  // Bolt Beacon (1): a spellcast bolt of shimmering light; the target is Vulnerable and glows.
  BNevJyGk7hmN7XOY: {
    shape: "bolt", motif: "light gathers, a shimmering bolt flies and the target is left glowing",
    notes: 'You "send a bolt of shimmering light" and the target "glows brightly" while Vulnerable: golden strands gather on the caster, a guiding bolt streaks to the target, bursts, and a beacon of light stays on it.',
    cast: { assets: ["energy_strands.in.yellow.01", "energy_strands.in"], scale: 0.6, duration: 900 },
    travel: ["guiding_bolt.01.yellow", "guiding_bolt.01.blueyellow"],
    impact: { assets: ["impact.005.yellow", "impact.yellow"], scale: 0.7 },
    aura: { assets: ["markers.light.complete.yellow", "markers.light"], on: "targets", scale: 0.8, opacity: 0.8, duration: 2200 },
    motion: { motion: "stagger", subject: "targets" },
  },
  // Mending Touch (1): lay hands on a creature over a few minutes to clear Hit Points or Stress.
  TGjR4vJVNbQRV8zr: {
    shape: "heal", motif: "a gentle touch, warm healing light and a heart that glows",
    notes: 'You "lay your hands upon a creature" and "close their wounds", sometimes "revealing something about yourself": the caster leans in, soft cure-wounds light rises on the creature and a golden heart blooms over them.',
    cast: false,
    impact: { assets: ["cure_wounds.200px.yellow", "cure_wounds.200px.blue"], scale: 0.8, at: 400 },
    extra: [{ role: "impact", on: "targets", assets: ["impact_themed.heart.pinkyellow", "ui.heartbeat"], tint: GOLD, scale: 0.5, offsetY: -0.6, offsetUnits: "token", at: 1200 }],
    motion: [{ motion: "lunge", subject: "source", at: 0, duration: 900, intensity: 0.3 }, { motion: "pulse", subject: "targets", at: 1300 }],
  },
  // Reassurance (1): once per rest, words of support let an ally reroll.
  iYNVTB7uAD1FTCZu: {
    shape: "buff", motif: "an inspiring word lights the ally and a die rolls over again",
    notes: 'You "offer assistance or words of support" and "your ally can reroll their dice": a burst of inspiration sparks on the ally and a golden die tumbles over their head.',
    cast: { assets: ["bardic_inspiration.blueyellow", "bardic_inspiration.greenorange"], scale: 0.5 },
    impact: { assets: ["condition.boon.01.001.yellow", "condition.boon"], scale: 0.6, at: 500 },
    extra: [{ role: "impact", on: "targets", assets: ["icosahedron.star.above.blueyellow"], tint: false, scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 800, duration: 1400, label: "The ally rerolls" }],
    motion: { motion: "squash", subject: "targets", at: 600, intensity: 0.4 },
  },
  // Final Words (2): infuse a corpse with a moment of life to answer questions; then it turns to dust.
  Nbw6Jnh1vRZzwHQI: {
    shape: "heal", motif: "a necromantic rune, a golden skull speaks over the body, then it crumbles to dust",
    notes: 'Colour exception, grey dust at the end: you "infuse a corpse with a moment of life to speak with it" and afterwards "the body turns to dust", so a necromancy rune glows, a golden skull rises over the corpse, then grey dust puffs and the body fades.',
    cast: { assets: ["magic_signs.rune.necromancy.complete.yellow", "magic_signs.rune.necromancy"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["toll_the_dead.yellow.skull_smoke", "toll_the_dead"], scale: 0.7, at: 700, duration: 1600 },
    extra: [{ role: "impact", on: "targets", assets: ["smoke.puff.centered.grey"], tint: false, scale: 0.8, at: 2300, label: "Turns to dust" }],
    motion: { motion: "fade", subject: "targets", at: 2400, duration: 900 },
  },
  // Healing Hands (2): a melee spellcast that clears 2 Hit Points or 2 Stress on another creature.
  WTlhnQMajc1r8i50: {
    shape: "heal", motif: "a golden circle, a reaching touch and a wave of healing light",
    notes: 'You "target a creature other than yourself within Melee range" to "clear 2 Hit Points or 2 Stress": a conjuration circle glows under the caster, they reach out, and a big wave of golden healing light rises on the creature.',
    cast: { assets: ["magic_signs.circle.02.conjuration.complete.yellow"], below: true, scale: 0.8, duration: 1400 },
    impact: { assets: ["healing_generic.400px.yellow"], scale: 0.7, at: 700 },
    motion: [{ motion: "lunge", subject: "source", at: 300, duration: 800, intensity: 0.5 }, { motion: "levitate", subject: "targets", at: 800, duration: 1000, intensity: 0.3 }],
    use: {
      shape: "heal", motif: "a quick burst of golden mending",
      notes: "Clear the Hit Points or Stress the roll earned: a burst of golden healing on the creature.",
      cast: false,
      impact: { assets: ["healing_generic.burst.yellowwhite", "healing_generic.burst.greenorange"], scale: 0.7 },
      motion: { motion: "pulse", subject: "targets", at: 200 },
    },
  },
  // Second Wind (3): after a successful attack, clear 3 Stress or a Hit Point; on Hope, an ally too.
  ffPbSEvLuFrFsMxl: {
    shape: "burst", motif: "a rush of wind and light fills the caster, and an ally nearby",
    notes: 'A literal second wind: "you can clear 3 Stress or a Hit Point" and "also clear 3 Stress or a Hit Point on an ally", so gusts of wind swirl round the caster, golden healing bursts on them and a smaller glow reaches the ally.',
    cast: { assets: ["wind_lines.01.01.white"], tint: GOLD, scale: 0.8, duration: 1000 },
    impact: { assets: ["healing_generic.03.burst.yellow", "healing_generic.03"], scale: 0.7, at: 500 },
    extra: [{ role: "impact", on: "targets", assets: ["healing_generic.200px.yellow02", "healing_generic.200px.yellow"], scale: 0.6, at: 900, label: "Ally catches their breath" }],
    motion: { motion: "brace", subject: "source", at: 300, duration: 900 },
  },
  // Voice of Reason (3): speak with authority; advantage to de-escalate; +1 Proficiency when Stress is full.
  t3RRGH6mMYYJJCcF: {
    shape: "aura", motif: "a commanding voice rolls out in golden waves",
    notes: 'You "speak with an unmatched power and authority": golden soundwaves roll out from the caster, a calm pulse spreads across the ground and the caster stands firm.',
    cast: { assets: ["soundwave.02.orangeyellow", "soundwave"], scale: 0.7, duration: 1200 },
    impact: { assets: ["template_circle.out_pulse.02.burst.yellowwhite", "template_circle.out_pulse.01.burst.bluewhite"], below: true, scale: 1, at: 500 },
    motion: { motion: "slam", subject: "source", at: 200, duration: 700, intensity: 0.3 },
  },
  // Divination (4): ask the forces beyond one yes-or-no question; the present falls away.
  K8oFepK24UVsAX8B: {
    shape: "utility", motif: "a divination circle, an eye opens and the caster drifts out of the present",
    notes: 'You "reach out to the forces beyond" and "the present falls away and you see the answer": a golden divination circle turns beneath the caster, a single eye opens above them and they drift as if elsewhere.',
    cast: { assets: ["magic_signs.circle.02.divination.complete.yellow", "magic_signs.circle.02.divination"], below: true, scale: 0.9, duration: 2200 },
    impact: { assets: ["eyes.01.orangeyellow.single", "eyes.01.dark_green.single"], scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 600, duration: 1600 },
    motion: { motion: "drift", subject: "source", at: 700, duration: 1400 },
  },
  // Life Ward (4): an ally is marked with a glowing sigil; a death move clears a Hit Point instead.
  OszbCj0jTqq2ADx9: {
    shape: "buff", motif: "a protective rune, a star sigil on the ally and a steady heartbeat",
    notes: 'The ally is "marked with a glowing sigil of protection" that saves them from a death move: an abjuration rune flares at the caster, a golden star ward settles on the ally and a heartbeat glows over them.',
    cast: { assets: ["magic_signs.rune.abjuration.complete.yellow", "magic_signs.rune.abjuration"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["ward.star.yellow.01"], scale: 0.8, at: 500 },
    aura: { assets: ["ui.heartbeat.01.yellow", "ui.heartbeat"], scale: 0.5, offsetY: -0.8, offsetUnits: "token", duration: 1800, at: 1000 },
  },
  // Shape Material (5): shape stone, ice or wood you touch into a tool or a door.
  db4xV3YErHRslbVE: {
    shape: "utility", motif: "a transmutation rune and circle, and the ground cracks into a new shape",
    notes: 'Colour exception, pale stone: you "shape a section of natural material you\'re touching (such as stone, ice, or wood)", so a golden transmutation rune and circle glow as the caster presses down and the stone beneath splits and reforms.',
    cast: { assets: ["magic_signs.rune.transmutation.complete.yellow"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["magic_signs.circle.02.transmutation.complete.yellow"], below: true, scale: 0.8, at: 300, duration: 1800 },
    extra: [{ role: "impact", on: "self", assets: ["impact.ground_crack.white.01", "impact.ground_crack.frost.01.white"], tint: false, below: true, scale: 0.7, at: 900, label: "The stone reshapes" }],
    motion: { motion: "press", subject: "source", at: 700, duration: 1000, intensity: 0.5 },
  },
  // Smite (5): charge a smite; the next weapon hit deals double damage as magic.
  U1uWJE94HZVudujz: {
    shape: "aura", motif: "divine light surges up the caster and a radiant mace hangs ready",
    notes: 'You "charge your powerful smite": divine smite light surges up around the caster, a flaming golden mace appears above them and static crackles with stored power.',
    cast: { assets: ["divine_smite.caster.yellowwhite", "divine_smite.caster.blueyellow"], scale: 0.7 },
    impact: { assets: ["spiritual_weapon.mace.flaming.yellow"], scale: 0.5, offsetY: -0.8, offsetUnits: "token", at: 600, duration: 1600 },
    aura: { assets: ["static_electricity.02.yellow", "static_electricity.02"], scale: 0.7, opacity: 0.7, duration: 1800, at: 700 },
    motion: { motion: "pulse", subject: "source", at: 600 },
  },
  // Restoration (6): spend tokens on a touched creature to clear Hit Points, Stress or ailments.
  wUQFsRtww18naYaq: {
    shape: "heal", motif: "orbiting light stones are spent into a creature, which glows and sparkles clean",
    notes: 'You "place a number of tokens" on the card and "spend any number of tokens" to heal or clear ailments: white light stones orbit the caster, golden healing rises on the creature and sparkles wash away the ailment.',
    cast: { assets: ["ioun_stones.01.white.regeneration"], tint: GOLD, scale: 0.7, duration: 1400 },
    impact: { assets: ["healing_generic.200px.yellow"], scale: 0.7, at: 800 },
    aura: { assets: ["swirling_sparkles.01.yellow", "swirling_sparkles"], scale: 0.7, duration: 1600 },
    motion: { motion: "levitate", subject: "targets", at: 900, duration: 1200, intensity: 0.25 },
  },
  // Zone of Protection (6): a visible zone at a point; allies inside reduce damage by a rising d6.
  lOZaRb4fCVgQsWB5: {
    shape: "ward", motif: "an abjuration circle, then golden domes and a glowing zone over the allies",
    notes: 'You "create a visible zone of protection" for nearby allies: an abjuration circle turns under the caster, golden force domes close over each ally and a glowing zone settles under them.',
    cast: { assets: ["magic_signs.circle.02.abjuration.complete.yellow", "magic_signs.circle.02.abjuration"], below: true, scale: 0.9, duration: 1600 },
    impact: { assets: ["wall_of_force.sphere.yellow", "wall_of_force.sphere"], on: "targets", scale: 0.7, at: 800, duration: 1400 },
    aura: { assets: ["template_circle.aura.01.complete.small.yellow", "template_circle.aura"], on: "targets", below: true, scale: 0.8, opacity: 0.7, duration: 2000 },
  },
  // Healing Strike (7): when you deal damage, spend 2 Hope to clear a Hit Point on a nearby ally.
  XtSc0jIJLOoMTMYS: {
    shape: "heal", motif: "the blow flashes gold and a spark of light leaps to heal an ally",
    notes: 'When "you deal damage to an adversary" you "clear a Hit Point on an ally": a golden flash bursts at the caster, a spark of light leaps to the ally and mends them.',
    cast: { assets: ["impact.011.yellow", "impact.011"], scale: 0.6 },
    travel: { assets: ["ranged.02.projectile.01.yellow"], at: 300 },
    impact: { assets: ["healing_generic.burst.tealyellow", "healing_generic.burst.greenorange"], tint: GOLD, scale: 0.6 },
    motion: { motion: "pulse", subject: "targets" },
  },
  // Splendor-Touched (7): +3 Severe threshold; once per long rest, pay damage in Stress or Hope instead.
  JT5dM3gVL6chDBYU: {
    shape: "ward", motif: "a golden ring spins and a radiant shield turns the blow into light",
    notes: 'You can "mark that much Stress or spend that much Hope instead" of Hit Points: a golden ring spins around the caster, a radiant shield flashes and the blow dissolves into glints.',
    cast: false,
    aura: { assets: ["token_border.circle.spinning.orange.001", "token_border.circle.spinning"], tint: GOLD, scale: 1, opacity: 0.8, duration: 1800 },
    impact: { assets: ["shield.03.complete.01.yellow", "shield.01.complete.01"], scale: 0.8, at: 300 },
    extra: [{ role: "impact", on: "self", assets: ["glint.yellow.many"], scale: 0.7, at: 900 }],
    motion: { motion: "recoil", subject: "source", at: 400, intensity: 0.3 },
  },
  // Shield Aura (8): a protective aura on one creature that lowers an attack's severity by a threshold.
  rfIv6lln40Fh6EIl: {
    shape: "buff", motif: "a golden shield bubble and a soft field settle on the creature",
    notes: 'You "cast a protective aura on a target": a golden shield bubble shimmers into place around them, a soft energy field lingers and they brace.',
    cast: { assets: ["markers.shield.yellow.01", "markers.shield"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["shield.01.complete.01.yellow", "shield.01.complete.01"], scale: 0.8, at: 500 },
    aura: { assets: ["energy_field.01.yellow", "energy_field.01"], opacity: 0.5, duration: 2200 },
    motion: { motion: "brace", subject: "targets", at: 700 },
  },
  // Stunning Sunlight (8): rays of burning sunlight on everyone in front; failures are Stunned.
  lRHo6ZkK1zybeEoG: {
    shape: "cone", motif: "a blaze of holy sunlight sweeps forward, searing and stunning the targets",
    notes: 'You "unleash powerful rays of burning sunlight against all adversaries in front of you" and those who fail are Stunned: the caster flares, a cone of holy light sweeps forward, each target is seared and dizzy stars circle them.',
    cast: ["sacred_flame.source.white", "sacred_flame.source.yellow"],
    travel: ["breath_weapons02.burst.cone.holy.yellow.01", "breath_weapons02.burst.cone.fire.orange.01"],
    impact: { assets: ["explosion.05.yellowwhite", "explosion.01"], scale: 0.6 },
    aura: { assets: ["dizzy_stars.200px.yellow", "dizzy_stars"], scale: 0.6, offsetY: -0.5, offsetUnits: "token", duration: 2000 },
    motion: { motion: "stagger", subject: "targets", intensity: 0.7 },
    use: {
      shape: "debuff", motif: "sunlight sears a target that shielded its eyes",
      notes: "A target that succeeded on its reaction roll still takes the searing light.",
      cast: false,
      impact: { assets: ["sacred_flame.target.white", "sacred_flame.target.yellow"], scale: 0.7 },
      motion: { motion: "cower", subject: "targets", at: 300 },
    },
  },
  // Overwhelming Aura (9): empower your aura; adversaries mark Stress to attack you.
  iEBLySZD9z8CLdz7: {
    shape: "aura", motif: "a blessing blooms and radiant spirits wheel around the caster",
    notes: 'You "magically empower your aura": a golden blessing blooms on the caster and radiant guardian spirits wheel around them as they rise to full presence.',
    cast: { assets: ["bless.400px.intro.yellow"], scale: 0.6 },
    aura: { assets: ["spirit_guardians.blueyellow.ring"], tint: GOLD, scale: 0.9, opacity: 0.85, duration: 2400, at: 500 },
    motion: { motion: "levitate", subject: "source", at: 600, duration: 1400, intensity: 0.3 },
  },
  // Salvation Beam (9): mark Stress to heal a line of allies within Far range.
  "4uAFGp3LxiC07woC": {
    shape: "beam", motif: "an evocation circle, then a golden beam pours healing down a line of allies",
    notes: 'You "target a line of allies within Far range" and "clear Hit Points on the targets": an evocation circle blazes under the caster, a golden beam reaches along the line and healing light rises on each ally.',
    cast: { assets: ["magic_signs.circle.02.evocation.complete.yellow", "magic_signs.circle.02.evocation"], below: true, scale: 0.9, duration: 1800 },
    travel: { assets: ["energy_beam.normal.yellow.01", "energy_beam.normal"], at: 500, duration: 1300 },
    impact: { assets: ["healing_generic.400px.yellow02", "healing_generic.400px.yellow"], scale: 0.6 },
    motion: { motion: "levitate", subject: "targets", at: 1300, duration: 1000, intensity: 0.3 },
  },
  // Invigoration (10): roll Hope d6s; on any 6, a spent feature can be used again.
  X8OfkEoI5gLTRf1B: {
    shape: "buff", motif: "a die tumbles over the caster, then fresh power surges into the ally",
    notes: 'You "roll that many d6s" and on a 6 "the feature can be used again": a golden die tumbles above the caster, then a surge of renewed power wraps the ally and stars burst over them.',
    cast: { assets: ["icosahedron.rune.above.blueyellow"], tint: false, scale: 0.45, offsetY: -0.8, offsetUnits: "token", duration: 1400 },
    impact: { assets: ["on_token_buff.002.001.orangeyellow", "on_token_buff.001.001.orangeyellow"], scale: 0.8, at: 900 },
    extra: [{ role: "impact", on: "targets", assets: ["particle_burst.01.star.yellow", "particle_burst"], scale: 0.6, at: 1100 }],
    motion: { motion: "leap", subject: "targets", at: 1100, intensity: 0.4 },
  },
  // Resurrection (10): restore a creature dead up to 100 years to full strength; then roll a d6.
  z30ciOwQI7g3tHla: {
    shape: "heal", motif: "a holy circle, a pillar of light and the body rises in a shower of feathers",
    notes: 'You "restore one creature who has been dead no longer than 100 years to full strength": a necromancy circle burns gold under the caster, a pillar of holy light falls on the body, white feathers burst outward and the creature rises.',
    cast: { assets: ["magic_signs.circle.02.necromancy.complete.yellow", "magic_signs.circle.02.necromancy"], below: true, scale: 1, duration: 2200 },
    impact: { assets: ["divine_smite.target.yellowwhite", "divine_smite.target.blueyellow"], scale: 0.9, at: 900 },
    aura: { assets: ["swirling_feathers.outburst.01"], tint: GOLD, scale: 0.8, at: 1400 },
    motion: { motion: "levitate", subject: "targets", at: 1300, duration: 1600, intensity: 0.6 },
    use: {
      shape: "utility", motif: "a die turns over the caster to see if the card is kept",
      notes: "Roll a d6: on 5 or lower the card goes to the vault for good.",
      cast: false,
      impact: { assets: ["dodecahedron.star.above.blueyellow", "icosahedron.star.below.blueyellow"], tint: false, scale: 0.45, offsetY: -0.8, offsetUnits: "token", duration: 1500 },
      motion: { motion: "sink", subject: "source", at: 600, intensity: 0.3 },
    },
  },
};
