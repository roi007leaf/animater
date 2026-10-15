// Grace domain card designs: card id → design record, each designed from the card's own text.
// Authoring guide: docs/daggerheart-designs/README.md. Card text: data/daggerheart-card-text.mjs.
// Palette: warm pink charm, hearts and sparkles (#ff9ec4). Each layer lists Patreon keys first and ends
// with a key JB2A Free has; a Free fallback in another hue is recoloured to the first choice's hue at
// play time. Layers whose first key is not pink carry an explicit pink tint.
const PINK = "#ff9ec4";

export default {
  // Deft Deceiver (1): spend Hope for advantage on a roll to deceive.
  "38znCh6kHTkaPwYi": {
    shape: "utility", motif: "a pink mask slips over the caster's face with a sly glint",
    notes: 'Advantage to "deceive or trick someone into believing a lie": a pink mask settles over the liar\'s face and a knowing glint sparkles beside it.',
    cast: false,
    impact: { assets: ["markers.on_token_mask.complete.01.purple", "markers.on_token_mask.complete.01.orange"], tint: PINK, scale: 0.7, duration: 1600 },
    extra: [{ role: "impact", on: "self", assets: ["glint.purple.few", "glint.yellow.few"], tint: PINK, scale: 0.6, at: 700, duration: 1000 }],
  },
  // Enrapture (1): spellcast vs one target in Close range; their attention is fixed on the caster.
  a8lFiKX1o8T924ze: {
    shape: "debuff", motif: "an enchantment rune, a heart flies to the target and hearts circle its head",
    notes: 'The target\'s "attention is fixed on you": an enchantment rune glows over the caster, a heart flies to the target, a heart marker settles on it and it drifts toward the caster.',
    cast: { assets: ["magic_signs.rune.enchantment.complete.pink"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    travel: ["spell_projectile.heart.pink", "magic_missile.purple"],
    impact: { assets: ["markers.heart.pink"], scale: 0.7, duration: 2000 },
    motion: { motion: "drift", subject: "targets", duration: 1200, intensity: 0.4 },
    use: {
      shape: "debuff", motif: "a heart bursts on the enraptured target and it cowers",
      notes: "Mark a Stress to force the Enraptured target to mark a Stress: a heart bursts on it.",
      cast: false,
      impact: { assets: ["impact_themed.heart.02.pink", "markers.heart.pink"], scale: 0.6 },
      motion: { motion: "cower", subject: "targets", at: 200 },
    },
  },
  // Inspirational Words (1): spend a token while speaking with an ally to clear Stress or HP, or give Hope.
  cWu1o82ZF7GvnbXc: {
    shape: "heal", motif: "a ripple of voice, music notes rise on the ally and a bardic glow lifts them",
    notes: 'Your "speech is imbued with power": a pink-teal ripple of voice leaves the caster, music notes rise over the ally and a bardic inspiration glow settles on them.',
    cast: { assets: ["cast_generic.sound.01.pinkteal"], scale: 0.6 },
    impact: { assets: ["impact_themed.music_note.pink", "markers.music_note.blue"], scale: 0.6 },
    aura: { assets: ["bardic_inspiration.pink", "bardic_inspiration.greenorange"], scale: 0.7, duration: 1800 },
    motion: { motion: "pulse", subject: "targets" },
  },
  // Tell No Lies (2): spellcast vs a target in Very Close range; they can't lie to the caster.
  HTv9QEPS466WsstP: {
    shape: "debuff", motif: "a divination rune glows and a faint spectral chain binds the target's tongue",
    notes: 'The target "can\'t lie to you" and is "typically unaware": a divination rune glows over the caster and a faint, ghostly pink chain settles on the target, with no flinch.',
    cast: { assets: ["magic_signs.rune.divination.complete.pink", "magic_signs.rune.divination"], scale: 0.5, offsetY: -0.6, offsetUnits: "token" },
    impact: { assets: ["markers.chain.spectral_standard.complete.02.purple", "markers.chain.spectral_standard.complete.02.blue"], tint: PINK, scale: 0.6, opacity: 0.55, duration: 1800 },
  },
  // Troublemaker (2): taunt a target within Far range; it marks Stress from d4s.
  JrdZedm1BFKeV7Yb: {
    shape: "debuff", motif: "a jeering shout rings out, the caster steps in and the target is jolted",
    notes: 'When you "taunt or provoke a target": a pink soundwave of jeers bursts from the caster as they step forward, and a stinging flash rattles the target.',
    cast: { assets: ["soundwave.02.purple", "soundwave.02.blue"], tint: PINK, scale: 0.7, duration: 900 },
    impact: { assets: ["impact.009.pink", "impact.009.orange"], scale: 0.6 },
    motion: [{ motion: "lunge", subject: "source", at: 100, duration: 700, intensity: 0.4 }, { motion: "shake", subject: "targets" }],
  },
  // Hypnotic Shimmer (3): spellcast vs all adversaries in front within Close range; Stunned and Stress.
  "2ZeuCGVatQdPOVC6": {
    shape: "cone", motif: "a cone of flashing lights sprays forward, stunned stars spin over each target",
    notes: 'An "illusion of flashing colors and lights" that Stuns: a pink-gold cone of light sprays out in front of the caster, stun marks flash on each target and dizzy stars circle them.',
    cast: { assets: ["magic_signs.rune.illusion.complete.pink", "magic_signs.rune.illusion"], scale: 0.4, offsetY: -0.6, offsetUnits: "token", duration: 800 },
    travel: ["template_cone_5e.001.001.pinkyellow", "template_cone_5e.001.001.purplered"],
    impact: { assets: ["markers.stun.purple"], tint: PINK, scale: 0.6 },
    aura: { assets: ["dizzy_stars.200px.pink", "dizzy_stars.200px.blueorange"], scale: 0.6, duration: 1800 },
    motion: { motion: "stagger", subject: "targets" },
  },
  // Invisibility (3): spellcast; the caster or an ally in Melee range becomes Invisible.
  KHkzA4Zrw8EWN1CH: {
    shape: "buff", motif: "an illusion circle, a pink shimmer washes over the ally and they fade from view",
    notes: 'The creature "can\'t be seen except through magical means": an illusion circle turns under the caster, a pink shimmer washes over the chosen creature and it fades out.',
    cast: { assets: ["magic_signs.circle.02.illusion.complete.pink", "magic_signs.circle.02.illusion"], below: true, scale: 0.8, duration: 1400 },
    impact: { assets: ["shimmer.01.purple", "shimmer.01.blue"], tint: PINK, opacity: 0.7, duration: 1600 },
    motion: { motion: "fade", subject: "targets", duration: 1400 },
  },
  // Soothing Speech (4): while tending an ally's wounds, clear an extra Hit Point, and 2 on yourself.
  QED2PDYePOSTbLtC: {
    shape: "heal", motif: "a heart circle under the caster, pink healing on the ally, then on the caster",
    notes: 'When you "take the time to comfort another character": a circle of hearts glows beneath the caster, pink healing light washes over the ally and then over the caster too.',
    cast: { assets: ["template_circle.symbol.normal.heart.pink"], below: true, scale: 0.7, duration: 1600 },
    impact: { assets: ["cure_wounds.200px.pink", "cure_wounds.200px.blue"], scale: 0.7 },
    extra: [{ role: "impact", on: "self", assets: ["healing_generic.burst.purplepink", "healing_generic.burst.greenorange"], scale: 0.6, at: 1100, label: "The comforter heals too" }],
  },
  // Through Your Eyes (4): see and hear through a target within Very Far range.
  "7b0mzV5QMPjVPT4o": {
    shape: "debuff", motif: "an eye opens over the caster, a thread of sight reaches the target and an eye opens over it",
    notes: 'You "see through their eyes and hear through their ears": an eye opens over the caster, a pink thread runs to the target and a matching eye opens above them.',
    cast: { assets: ["eyes.01.purple.single", "eyes.01.dark_green.single"], tint: PINK, scale: 0.35, offsetY: -0.9, offsetUnits: "token", duration: 1400 },
    travel: { assets: ["energy_strands.range.standard.purple", "energy_strands.range.standard.purple.01"], tint: PINK, opacity: 0.7 },
    impact: { assets: ["eyes.01.purple.few", "eyes.01.dark_green.few"], tint: PINK, scale: 0.35, offsetY: -0.9, offsetUnits: "token", duration: 1600 },
  },
  // Thought Delver (5): spend Hope to read surface thoughts; spellcast to delve deeper.
  B4choj481tqajWb9: {
    shape: "debuff", motif: "a divination circle under the caster and a vortex spirals into the target's mind",
    notes: 'You "delve for deeper, more hidden thoughts": a pink divination circle turns under the caster and a spiralling vortex sinks into the target\'s head.',
    cast: { assets: ["magic_signs.circle.02.divination.complete.pink", "magic_signs.circle.02.divination.complete"], below: true, scale: 0.8, duration: 1600 },
    impact: { assets: ["template_circle.vortex.loop.purple", "template_circle.vortex.loop.blue"], tint: PINK, scale: 0.45, opacity: 0.8, offsetY: -0.4, offsetUnits: "token", duration: 1600 },
    motion: { motion: "press", subject: "targets", duration: 1100, intensity: 0.3 },
    use: {
      shape: "debuff", motif: "faint motes of thought drift up off the target",
      notes: "Read the vague surface thoughts: pink motes drift up from the target's head.",
      cast: false,
      impact: { assets: ["particles.outward.purple", "particles.outward.greenyellow"], tint: PINK, scale: 0.5, offsetY: -0.5, offsetUnits: "token", duration: 1600 },
    },
  },
  // Words of Discord (5): whisper to a Melee adversary; it marks Stress and attacks another adversary.
  ZjAdi1FSNCDDHI3X: {
    shape: "debuff", motif: "a whisper ripples from the caster, a curse mark flares and the target turns around",
    notes: 'You "whisper words of discord" and the target attacks "another adversary": a soft sound ripple at the caster\'s side, a pink curse mark flares on the target and it spins to face its allies.',
    cast: { assets: ["cast_generic.sound.side01.pinkteal", "cast_generic.sound.01.pinkteal"], scale: 0.5, duration: 800 },
    impact: { assets: ["condition.curse.01.001.purple", "condition.curse.01.001.red"], tint: PINK, scale: 0.6, duration: 1500 },
    motion: { motion: "spin", subject: "targets", at: 900, duration: 900, intensity: 0.5 },
  },
  // Never Upstaged (6): after marking HP, mark Stress for tokens; +5 damage per token on the next hit.
  McdncxmO9K1YNP7Y: {
    shape: "aura", motif: "the caster rocks from the blow, flares pink and a stone of tokens orbits them",
    notes: 'You take the hit and "place a number of tokens" for the comeback: the caster rocks back, a pink-gold flare rises off them and a pink stone of stored power orbits overhead.',
    cast: false,
    impact: { assets: ["on_token_buff.001.001.pinkyellow"], scale: 0.9, at: 300 },
    aura: { assets: ["ioun_stones.01.pink.leadership"], scale: 0.8, duration: 2200 },
    motion: { motion: "recoil", subject: "source", at: 0, duration: 600, intensity: 0.4 },
  },
  // Share the Burden (6): take on a willing creature's Stress; gain Hope for each.
  "8nRle10pw1HO8QVu": {
    shape: "heal", motif: "a heart flows out of the ally, a link joins the two, and the burden sinks into the caster",
    notes: 'You "take on the Stress from a willing creature" while emotions "telepathically leak": hearts flow out from the ally, a pink link joins the pair, and motes gather into the caster as they sag under the weight.',
    cast: false,
    impact: { assets: ["template_circle.symbol.out_flow.heart.pink", "template_circle.symbol.normal.heart.pink"], scale: 0.6, at: 0, duration: 1600 },
    travel: { assets: ["energy_beam.normal.bluepink", "energy_beam.normal.bluepink.02"], at: 400, duration: 1200, opacity: 0.8 },
    extra: [{ role: "impact", on: "self", assets: ["particles.inward.purple", "particles.inward.greenyellow"], tint: PINK, scale: 0.7, at: 900, duration: 1400, label: "The burden flows in" }],
    motion: { motion: "sink", subject: "source", at: 1200, duration: 900, intensity: 0.4 },
  },
  // Endless Charisma (7): after a social roll, spend Hope to reroll the Hope or Fear Die.
  tNzFNlVHghloKsFi: {
    shape: "utility", motif: "pink sparkles swirl, the caster twirls and a gold-and-blue die rolls again",
    notes: 'Colour exception, the die is gold and blue for Hope and Fear: you "reroll the Hope or Fear Die", so charming sparkles swirl, the caster twirls and the die tumbles anew above them.',
    cast: { assets: ["swirling_sparkles.01.bluepink", "swirling_sparkles.01.blue"], scale: 0.7, duration: 1200 },
    impact: { assets: ["icosahedron.rune.above.blueyellow"], tint: false, scale: 0.45, offsetY: -0.8, offsetUnits: "token", at: 500, duration: 1500 },
    motion: { motion: "spin", subject: "source", at: 300, duration: 800, intensity: 0.4 },
  },
  // Grace-Touched (7): mark an Armor Slot instead of Stress; force Stress instead of Hit Points.
  KAuNb51AwhD8KEXk: {
    shape: "ward", motif: "a ring of grace spins round the caster and a pink rampart shield takes the strain",
    notes: 'You "mark an Armor Slot instead of marking a Stress": a pink ring of grace spins around the caster and a rampart shield rises to take the strain as they brace.',
    cast: false,
    aura: { assets: ["token_border.circle.spinning.purple", "token_border.circle.spinning.blue"], tint: PINK, scale: 1, opacity: 0.8, at: 0, duration: 1800 },
    impact: { assets: ["markers.shield_rampart.complete.02.purple", "markers.shield_rampart.complete.01.orange"], tint: PINK, scale: 0.7, at: 400 },
    motion: { motion: "brace", subject: "source", at: 500 },
  },
  // Astral Projection (8): mark a Stress to project a copy of yourself anywhere you've been.
  YNOCNmZ96sCp9NEr: {
    shape: "summon", motif: "a conjuration circle, pink mist, and a translucent double steps away",
    notes: 'You "create a projected copy of yourself": a pink conjuration circle opens under the caster, pink mist billows and a translucent double of the caster drifts away.',
    cast: { assets: ["magic_signs.circle.02.conjuration.complete.pink", "magic_signs.circle.02.conjuration.complete.yellow"], below: true, scale: 0.9, duration: 1800 },
    impact: { assets: ["misty_step.02.pink", "misty_step.02.blue"], scale: 0.8, at: 700 },
    copies: { count: 1, spread: 0.6, opacity: 0.45, at: 900, duration: 2200 },
  },
  // Mass Enrapture (8): spellcast vs all targets within Far range; they are Enraptured.
  ubpixIgZrJXKyM3b: {
    shape: "burst", motif: "hearts pour out in a wide ring and a heart settles over every target",
    notes: 'All targets "become temporarily Enraptured", their "attention is fixed on you": a ring of hearts flows out from the caster, a heart marker settles over each target and they all drift toward the caster.',
    cast: { assets: ["template_circle.symbol.out_flow.heart.pink", "template_circle.symbol.normal.heart.pink"], below: true, scale: 1.4, duration: 1800 },
    impact: { assets: ["markers.heart.pink"], on: "targets", scale: 0.6, at: 800, duration: 2000 },
    motion: { motion: "drift", subject: "targets", at: 1000, duration: 1200, intensity: 0.5 },
    use: {
      shape: "burst", motif: "a pink pulse rolls out and hearts burst on every enraptured target",
      notes: "Mark a Stress to force all Enraptured targets to mark a Stress, ending the spell: a pulse rolls out and hearts burst on each.",
      cast: false,
      impact: { assets: ["template_circle.out_pulse.02.burst.purplepink", "template_circle.out_pulse.02.burst.bluewhite"], scale: 1.1, at: 0 },
      extra: [{ role: "impact", on: "targets", assets: ["impact_themed.heart.pinkyellow", "markers.heart.pink"], scale: 0.6, at: 450 }],
      motion: { motion: "cower", subject: "targets", at: 500 },
    },
  },
  // Copycat (9): mimic a domain card of level 8 or lower in another player's loadout.
  "3A7LZ1xmDEMGa165": {
    shape: "buff", motif: "a transmutation circle, strands reach the ally's power and a mirrored double flickers beside the caster",
    notes: 'The card can "mimic the features of another domain card": a pink transmutation circle turns, strands reach to the ally whose card is copied, power flares on the caster and a mirror image flickers beside them.',
    cast: { assets: ["magic_signs.circle.02.transmutation.complete.pink", "magic_signs.circle.02.transmutation.complete.yellow"], below: true, scale: 0.8, duration: 1600 },
    travel: ["energy_strands.range.multiple.bluepink", "energy_strands.range.multiple.bluepink.02"],
    extra: [{ role: "impact", on: "self", assets: ["on_token_cast.initiate.002.instant.combined.pinkyellow", "on_token_cast.initiate.002.instant.combined.blue"], scale: 0.8, at: 1100, label: "The copied power flares" }],
    copies: { count: 1, spread: 0.25, opacity: 0.5, at: 1200, duration: 1400 },
  },
  // Master of the Craft (9): a permanent +2/+3 to Experiences, then the card goes to the vault.
  yAGTwXHUC3qxpTeK: {
    shape: "utility", motif: "a pillar of pink light rises and twinkling stars crown the master",
    notes: 'A "permanent +3 bonus" to an Experience: a pillar of pink light rises around the caster, twinkling stars crown their head and they lift slightly with mastery.',
    cast: false,
    impact: { assets: ["markers.light.complete.pink", "markers.light.complete.blue"], scale: 0.9, at: 0, duration: 1800 },
    aura: { assets: ["twinkling_stars.points07.white"], tint: PINK, scale: 0.5, offsetY: -0.8, offsetUnits: "token", at: 500, duration: 1800 },
    motion: { motion: "levitate", subject: "source", at: 400, duration: 1400, intensity: 0.25 },
  },
  // Encore (10): when an ally hits an adversary, spellcast to deal the same damage again.
  klahWDFwihqqEhXP: {
    shape: "bolt", motif: "a flourish, a music note streaks to the target and the hit lands twice",
    notes: 'You "deal the same damage to the target that your ally dealt": a pink-gold flourish, a music note streaks to the target and the blow lands again, twice over, as an echo of the ally\'s hit.',
    cast: { assets: ["cast_generic.03.pinkyellow", "cast_generic.03.blue"], scale: 0.6 },
    travel: ["spell_projectile.music_note.pink", "magic_missile.purple"],
    impact: { assets: ["impact.007.pink", "impact.007.yellow"], scale: 0.7, repeats: 2, repeatInterval: 350 },
    motion: { motion: "stagger", subject: "targets" },
  },
  // Notorious (10): mark a Stress to add +10 when leveraging notoriety; free food and drink.
  IqxzvvjZiYbgx21A: {
    shape: "aura", motif: "fireworks burst overhead and a pink stage glows under the famous caster",
    notes: 'People "know who you are and what you\'ve done": pink fireworks burst above the caster, a glowing pink stage spreads beneath them and they swell with renown.',
    cast: false,
    impact: { assets: ["firework.02.bluepink", "firework.02.orangeyellow"], scale: 0.6, offsetY: -1, offsetUnits: "token", at: 0, duration: 1400 },
    aura: { assets: ["template_circle.aura.02.complete.small.pinkpurple", "template_circle.aura.02.complete.small.bluepink"], below: true, scale: 0.8, opacity: 0.8, at: 300, duration: 2000 },
    motion: { motion: "pulse", subject: "source", at: 400 },
  },
};
