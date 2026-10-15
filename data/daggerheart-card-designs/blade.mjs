// Blade domain card designs: card id → design record, each designed from the card's own text.
// Authoring guide: docs/daggerheart-designs/README.md. Card text: data/daggerheart-card-text.mjs.
// Palette: cold steel (#c9d4e0), slashes and white sparks. Each layer lists Patreon keys first and ends
// with a key JB2A Free has; a Free fallback in another hue is recoloured to the first choice's hue at play time.
const STEEL = "#c9d4e0";

export default {
  // Get Back Up (1): on Severe damage, mark a Stress to drop the severity one threshold.
  BFWN2cObMdlk9uVz: {
    shape: "ward", motif: "a heavy blow lands, the fighter buckles, a heartbeat, and they stand back up",
    notes: 'You take Severe damage and "reduce the severity by one threshold": a steel impact hits the fighter, they sink under it, a heartbeat pulses and they brace upright again.',
    cast: false,
    impact: { assets: ["impact.002.blue"], tint: STEEL, scale: 0.8, at: 0 },
    aura: { assets: ["ui.heartbeat.01.blue", "ui.heartbeat.01.green"], tint: STEEL, scale: 0.6, offsetY: -0.7, offsetUnits: "token", at: 600, duration: 1400 },
    motion: [{ motion: "sink", subject: "source", at: 100, duration: 600, intensity: 0.5 }, { motion: "brace", subject: "source", at: 900, duration: 800 }],
  },
  // Not Good Enough (1): reroll any 1s or 2s on damage dice.
  xheQZOIYp0ERQhT9: {
    shape: "utility", motif: "a steel die tumbles above the fighter, and tumbles again",
    notes: 'When you roll your damage dice you "reroll any 1s or 2s": a steel die rolls over the fighter, then rolls a second time as they shake off the bad result.',
    cast: false,
    impact: { assets: ["icosahedron.roll.blue"], tint: STEEL, scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 0, duration: 900, repeats: 2, repeatInterval: 800 },
    motion: { motion: "squash", subject: "source", at: 750, duration: 500, intensity: 0.4 },
  },
  // Whirlwind (1): spend a Hope to carry a successful attack to every other target in Very Close range at half damage.
  anO0arioUy7I5zBg: {
    shape: "burst", motif: "the fighter spins and a steel whirlwind of slashes clips everyone nearby",
    notes: 'You "use the attack against all other targets within Very Close range": the fighter spins in a ring of steel slashes and each nearby foe takes a lighter hit.',
    cast: false,
    impact: { assets: ["melee_generic.whirlwind.01.bluepurple", "melee_generic.whirlwind.01.orange"], tint: STEEL, scale: 1.1, at: 0 },
    extra: [{ role: "impact", on: "targets", assets: ["impact.003.blue"], tint: STEEL, scale: 0.5, at: 450 }],
    motion: [{ motion: "spin", subject: "source", at: 0, duration: 900 }, { motion: "stagger", subject: "targets", at: 500, intensity: 0.4 }],
  },
  // A Soldier's Bond (2): compliment someone or ask about their skill; you both gain 3 Hope.
  Y08dLFuPXsgeRrHi: {
    shape: "buff", motif: "golden Hope sparks on the fighter and three glints on the comrade",
    notes: 'Colour exception, gold for Hope: when you "compliment someone" you "both gain 3 Hope", so Hope stars burst from the fighter and gold glints shine on the comrade as both stand a little taller.',
    cast: { assets: ["particle_burst.01.star.yellow", "particle_burst.01.star.bluepurple"], scale: 0.6 },
    impact: { assets: ["glint.yellow.few"], scale: 0.7, at: 500, duration: 1500 },
    motion: [{ motion: "pulse", subject: "source", at: 200 }, { motion: "pulse", subject: "targets", at: 600 }],
  },
  // Reckless (2): mark a Stress to gain advantage on an attack.
  "2ooUo2yoilGifY81": {
    shape: "utility", motif: "steel chevrons point up as the fighter throws themselves forward",
    notes: 'You "mark a Stress to gain advantage on an attack": a strain of static crackles over the fighter, advantage chevrons rise and they lunge in heedlessly.',
    cast: { assets: ["static_electricity.02.blue"], tint: STEEL, scale: 0.6, duration: 800 },
    impact: { assets: ["ui.chevrons3.yellow"], tint: STEEL, scale: 0.5, offsetY: -0.7, offsetUnits: "token", at: 300, duration: 1200 },
    motion: { motion: "lunge", subject: "source", at: 500, duration: 700 },
  },
  // Scramble (3): avoid a melee creature's damage and move safely out of Melee range.
  "5bBU9jWHOuOY12lR": {
    shape: "utility", motif: "a MISS flashes, dust kicks up and the fighter rolls clear",
    notes: 'You "avoid the attack and safely move out of Melee range": the blow whiffs (a miss flashes over the fighter), a puff of dust kicks up and they roll away.',
    cast: false,
    impact: { assets: ["ui.miss.white"], scale: 0.5, offsetY: -0.7, offsetUnits: "token", at: 0, duration: 1100 },
    extra: [{ role: "impact", on: "self", assets: ["smoke.puff.side.grey"], scale: 0.7, opacity: 0.8, at: 250, duration: 1000 }],
    motion: { motion: "roll", subject: "source", at: 250, duration: 900 },
  },
  // Versatile Fighter (3): use another trait for a weapon; mark a Stress to take a damage die's maximum.
  wQ53ImDswEHv5SGQ: {
    shape: "utility", motif: "steel shards orbit the fighter and a starred die lands on its top face",
    notes: 'You can "use the maximum result of one of your damage dice": steel shards orbit as the fighter turns their weapon over, and a die marked with a star settles on its highest face.',
    cast: { assets: ["aura_themed.01.orbit.complete.metal.01.grey"], scale: 0.8, duration: 1200 },
    impact: { assets: ["icosahedron.star.above.blueyellow"], tint: STEEL, scale: 0.4, offsetY: -0.8, offsetUnits: "token", at: 600, duration: 1300 },
    motion: { motion: "spin", subject: "source", at: 200, duration: 700, intensity: 0.4 },
  },
  // Deadly Focus (4): focus on one target for +1 Proficiency until you attack another, defeat it or the battle ends.
  xxZOXC4tiZQ6kg1e: {
    shape: "utility", motif: "a still ring settles round the fighter and a hunter's mark locks on the target",
    notes: 'You "apply all your focus toward a target of your choice": a steady steel ring closes on the fighter as they brace, and a mark locks onto the chosen foe.',
    cast: false,
    aura: { assets: ["token_border.circle.static.blue"], tint: STEEL, scale: 1, opacity: 0.8, at: 0, duration: 1800 },
    impact: { assets: ["hunters_mark.pulse.01.blue", "hunters_mark.pulse.01.green"], on: "targets", tint: STEEL, scale: 0.6, at: 500, duration: 1600 },
    motion: { motion: "brace", subject: "source", at: 200, duration: 900, intensity: 0.4 },
  },
  // Fortified Armor (4): +2 to damage thresholds while wearing armor.
  oVa49lI107eZILZr: {
    shape: "ward", motif: "a steel rampart rises round the fighter and a shield shell hardens",
    notes: 'While you are "wearing armor", your thresholds rise: a steel rampart builds up around the fighter and a pale shield shell settles as they brace.',
    cast: false,
    impact: { assets: ["markers.shield_rampart.complete.01.white", "markers.shield_rampart.complete.01.orange"], scale: 0.8, at: 0, duration: 1600 },
    aura: { assets: ["shield.01.complete.01.white", "shield.01.complete.01.blue"], scale: 0.9, opacity: 0.7, at: 700, duration: 1400 },
    motion: { motion: "brace", subject: "source", at: 700 },
  },
  // Champion's Edge (5): on a critical, spend up to 3 Hope to clear HP, clear Armor or deal an extra Hit Point.
  rnejRbUQsNGX1GMC: {
    shape: "utility", motif: "CRITICAL flashes, a steel slash bites the target and the fighter's wounds glow closed",
    notes: 'When you "critically succeed on an attack" you choose: "clear a Hit Point", "clear an Armor Slot" or make the target mark another. A critical banner flashes, a second slash bites the target and a pale mend washes over the fighter.',
    cast: { assets: ["ui.critical.yellow", "ui.critical.red"], tint: STEEL, scale: 0.5, offsetY: -0.7, offsetUnits: "token", duration: 1000 },
    impact: { assets: ["melee_generic.slash.02.002.blue"], on: "targets", tint: STEEL, scale: 0.7, at: 500 },
    extra: [{ role: "impact", on: "self", assets: ["healing_generic.burst.bluewhite", "healing_generic.03.burst.bluegreen"], tint: STEEL, scale: 0.6, at: 800 }],
    motion: { motion: "stagger", subject: "targets", at: 600 },
  },
  // Vitality (5): permanently gain two of a Stress slot, a Hit Point slot or +2 thresholds; then vault the card.
  sWUlSPOJEaXyQLCj: {
    shape: "utility", motif: "steel motes flow into the fighter and their body glows tougher",
    notes: 'You "permanently gain two of the following benefits", more Stress, Hit Points or thresholds: steel motes stream into the fighter and a pale vigour glows over their whole body.',
    cast: { assets: ["aura_themed.01.inward.complete.metal.01.grey"], scale: 0.9, duration: 1200 },
    impact: { assets: ["on_token_buff.001.001.white"], scale: 0.9, at: 800, duration: 1600 },
    motion: { motion: "pulse", subject: "source", at: 900, intensity: 0.7 },
  },
  // Battle-Hardened (6): instead of a Death Move, spend a Hope to clear a Hit Point.
  NeEOghgfyDUBTwBG: {
    shape: "heal", motif: "a skull flickers over the fallen fighter, then fades as they mend",
    notes: 'When you "would make a Death Move" you "clear a Hit Point instead": a pale skull hangs over the fighter as they collapse, then a steel mend washes it away and they rise.',
    cast: false,
    impact: { assets: ["markers.skull.dark_red", "markers.skull.purple"], on: "self", tint: STEEL, scale: 0.5, offsetY: -0.6, offsetUnits: "token", at: 0, duration: 1100, fadeOut: 400 },
    aura: { assets: ["healing_generic.400px.blue"], on: "self", tint: STEEL, scale: 0.8, at: 900, duration: 1500 },
    motion: [{ motion: "collapse", subject: "source", at: 0, duration: 700, intensity: 0.4 }, { motion: "levitate", subject: "source", at: 1000, duration: 900, intensity: 0.3 }],
  },
  // Rage Up (6): mark a Stress before an attack for +2× Strength damage, twice per attack.
  GRL0cvs96vrTDckZ: {
    shape: "utility", motif: "red static and seething strands wrap the trembling fighter",
    notes: 'Colour exception, rage red: you "mark a Stress to gain a bonus to your damage roll", twice per attack, so red static crackles over the fighter, red strands seethe around them and they shake with fury.',
    cast: { assets: ["static_electricity.03.dark_red", "static_electricity.03.blue"], scale: 0.7, duration: 900 },
    aura: { assets: ["energy_strands.overlay.dark_red", "energy_strands.overlay.blue"], scale: 0.9, opacity: 0.8, at: 400, duration: 1800 },
    motion: { motion: "shake", subject: "source", at: 300, duration: 1200, intensity: 0.5 },
  },
  // Blade-Touched (7): with 4+ Blade cards, +2 attack rolls and +4 Severe threshold.
  Gb5bqpFSBiuBxUix: {
    shape: "aura", motif: "a ring of steel daggers circles the fighter",
    notes: 'When "4 or more of the domain cards" are Blade you gain attack and Severe threshold: a whirling ring of steel blades circles the fighter and glints settle on them.',
    cast: false,
    aura: { assets: ["cloud_of_daggers.daggers.blue"], tint: STEEL, scale: 0.7, at: 0, duration: 2200 },
    impact: { assets: ["twinkling_stars.points04.white"], scale: 0.6, at: 500, duration: 1400 },
    motion: { motion: "pulse", subject: "source", at: 600, intensity: 0.4 },
  },
  // Glancing Blow (7): on a failed attack, mark a Stress to deal weapon damage at half Proficiency.
  nCNCqSH7UgW4O3To: {
    shape: "debuff", motif: "a small slash skims the target and a spark skips off sideways",
    notes: 'When you "fail an attack" you still deal damage at "half your Proficiency": a short, small steel slash grazes the target and a spark skids off it as it flinches.',
    cast: false,
    impact: { assets: ["melee_generic.slash.02.001.blue"], tint: STEEL, scale: 0.5, at: 0 },
    extra: [{ role: "impact", on: "targets", assets: ["side_impact.part.shockwave.blue"], tint: STEEL, scale: 0.5, at: 300 }],
    motion: { motion: "recoil", subject: "targets", at: 300, intensity: 0.3 },
  },
  // Battle Cry (8): a rousing call; allies who hear clear a Stress, gain a Hope and gain advantage on attacks.
  Ef1JsUG50LIoKx2F: {
    shape: "buff", motif: "a shout rings out from the fighter, advantage chevrons and Hope glints on every ally",
    notes: 'Colour exception, gold Hope glints on the allies: you "muster a rousing call that inspires your allies", so a soundwave rings out as the fighter charges, steel chevrons rise over each ally and gold Hope glints on them.',
    cast: { assets: ["soundwave.02.blue"], tint: STEEL, scale: 1.2, duration: 1000 },
    impact: { assets: ["ui.chevrons3.yellow"], tint: STEEL, scale: 0.45, offsetY: -0.7, offsetUnits: "token", at: 600, duration: 1200 },
    aura: { assets: ["glint.yellow.many"], scale: 0.6, at: 900, duration: 1400 },
    motion: [{ motion: "lunge", subject: "source", at: 0, duration: 700 }, { motion: "levitate", subject: "targets", at: 700, duration: 700, intensity: 0.3 }],
  },
  // Frenzy (8): no Armor Slots, +10 damage and +8 Severe threshold until no adversaries are in sight.
  MMl7abdGRLl7TJLO: {
    shape: "aura", motif: "the fighter's shield bursts apart and a red storm of steel whirls around them",
    notes: 'Colour exception, frenzy red: "you can\'t use Armor Slots" but deal far more damage, so a red shield shell bursts off the fighter, they slam down and a red storm of metal whirls around them.',
    cast: false,
    impact: { assets: ["shield.01.outro_explode.red", "shield.01.outro_explode.blue"], scale: 0.8, at: 0 },
    aura: { assets: ["aura_themed.01.outward.loop.metal.01.red", "aura_themed.01.outward.loop.metal.01.grey"], scale: 1, opacity: 0.85, at: 500, duration: 2200 },
    motion: { motion: "slam", subject: "source", at: 300, duration: 800 },
  },
  // Gore and Glory (9): a critical or a kill grants a Hope or clears a Stress.
  "3zvjgZ5Od343wHzx": {
    shape: "utility", motif: "blood sprays from the felled foe and gold glory glints on the fighter",
    notes: 'Colour exception, red gore and gold glory: when you "deal enough damage to defeat an enemy" you gain Hope, so blood splashes on the foe and gold glints shower the fighter.',
    cast: false,
    impact: { assets: ["liquid.splash.red", "liquid.splash02.red"], on: "targets", scale: 0.7, at: 0 },
    aura: { assets: ["glint.yellow.many"], on: "self", scale: 0.8, at: 400, duration: 1600 },
    motion: { motion: "levitate", subject: "source", at: 500, duration: 900, intensity: 0.25 },
  },
  // Reaper's Strike (9): spend a Hope for an attack roll; one target it would hit marks 5 Hit Points.
  MCgNRlh0s5XUPCfl: {
    shape: "bolt", motif: "a reaper's scythe sweeps the target, a skull hangs over it and it reels",
    notes: 'Choose one target and "force them to mark 5 Hit Points": a reaper\'s scythe sweeps across, a heavy steel impact lands and a pale death skull hangs over the victim.',
    cast: { assets: ["particles.inward.white", "particles.inward.greenyellow"], tint: STEEL, scale: 0.6, duration: 700 },
    travel: ["melee_attack.05.scythe.01"],
    impact: { assets: ["impact.011.blue"], tint: STEEL, scale: 0.9 },
    aura: { assets: ["markers.skull.dark_red", "markers.skull.purple"], tint: STEEL, scale: 0.5, offsetY: -0.6, offsetUnits: "token", duration: 1500 },
    motion: { motion: "recoil", subject: "targets", intensity: 0.85 },
  },
  // Battle Monster (10): mark 4 Stress; the target marks as many HP as you have marked.
  P0ezScyQ5t8ruByf: {
    shape: "debuff", motif: "blood drips from the wounded fighter, a greatsword crashes down and the ground cracks under the target",
    notes: 'Colour exception, the fighter\'s blood: the target marks "Hit Points equal to the number of Hit Points you currently have marked", so blood drips from the fighter, a greatsword crashes into the target and the ground splits under it.',
    cast: { assets: ["markers.drop.red"], scale: 0.5, offsetY: -0.6, offsetUnits: "token", duration: 900 },
    travel: ["melee_attack.03.greatsword.01"],
    impact: { assets: ["impact.ground_crack.01.white", "impact.ground_crack.01.orange"], below: true, scale: 1 },
    motion: [{ motion: "lunge", subject: "source", at: 500, duration: 700 }, { motion: "squash", subject: "targets", intensity: 0.8 }],
  },
  // Onslaught (10): hits always mark at least 2 HP; mark a Stress to punish a creature that hits an ally.
  I7pNsQ9Yx6mRJX4V: {
    shape: "debuff", motif: "a blade flies at the foe who struck an ally and a flurry of blows hammers it",
    notes: 'When a creature "deals damage to an ally with an attack that doesn\'t include you", you punish it: a steel blade flies to it and a relentless flurry of blows lands as it staggers.',
    cast: false,
    travel: ["sword.throw.white", "dagger.throw.01.white"],
    impact: { assets: ["flurry_of_blows.physical.blue"], tint: STEEL, scale: 0.8 },
    motion: { motion: "stagger", subject: "targets", intensity: 0.7 },
  },
};
