import { writeFile } from "node:fs/promises";
import { PF2E_FEATS } from "../data/pf2e-feats.mjs";

// Individually read complete descriptions, nonmartial source order 0–129.
// Rows describe THIS activation; later granted uses are deliberately excluded.
const rows = `
a-hush-falls-over-the-world|concealment|shadow|source|silence expanding veil|Sound is absorbed|Quiet field spreads from source, muffling sound; no weapon attack.
a-little-bird-told-me|form|wind|source|small feather spiral|transform into a small bird|Feathers close into a small aerial silhouette; transformation cue, no Strike.
a-tale-to-believe-in|targetSupport|mind|targets|story rising mental release|counteract check against a mental effect|Source tale cue precedes an ally's loosening mental veil.
abscission-shards|elementTarget|blood|targets|claw splinter low bleed|twist your claw|Small claw-splinter accent at target, then blood curl; does not repeat the previous Strike.
absolve-sins|elementAura|mind|source|reflective outward judgment|reflect upon their sins|Source mental wave with reflective accents; punishment depends on the save.
absorb-spell|absorb|arcane|source|inward spell spiral|absorb a spell|Spiral contracts into source and settles as stored energy; no later spell cast.
absorb-strength|absorb|blood|source|corpse vitality inward curl|consume a piece|Vitality curls inward from a chosen corpse; temporary-strength cue, no healing beam.
absorb-toxin|absorb|poison|source|poison inward filter|draw toxins|Poison mist contracts into source; does not guarantee others' counteract results.
accompany|command|sonic|targets|musical ally rising harmony|performance|Source notes lead into an ally's magic; support rather than attack.
acknowledge-fan|taunt|mind|targets|glance precise attention glint|gesture|Small speaking/glance cue focuses attention at selected observer; outcome conditional.
acquired-tolerance|fortune|poison|source|toxin reroll closing ring|Reroll|Poison rim folds inward into a second-chance ripple.
adamantine-body|guard|metal|source|metal compact brace|shrug off|Brief metal hardening and source brace, not a magical projectile.
adaptive-stratagem|focus|divination|source|three branch planning diagram|tactic|Planning facets rearrange around source; 'on the fly' does not mean flight.
additional-recollection|focus|divination|targets|two sequential knowledge scans|Recall Knowledge|Knowledge focus passes between chosen foes, without physical contacts.
aegis-for-the-innocent|targetSupport|light|targets|transferred light shelter|divine spark|Source gleam transfers into protective light at ally; no unconditional enemy push.
aegis-of-arnisant|rune|ward|source|shield inscribed ward|shield|Shield receives a runic ward now; its later reaction is separate.
aerial-boomerang|boomerang|wind|targets|outward wind terminal spiral|boomerang whirls in place|Wind blade travels outward and spins at its endpoint; return requires a later action.
aether-beam|ray|force|targets|continuous straight force beam|beam|Source gather leads to directed force beam and contact; line endpoint remains an approximation.
aether-blast|elementTarget|force|targets|direct force shock flare|direct the blast|Source focus then force shock at chosen foe; distinguish continuous Aether Beam.
after-you|resolve|weapon|source|measured confident settling|last|Slow confident glint and grounded settle; no attack or time freeze.
afterimage|concealment|illusion|source|stationary departing echo|afterimage|Finite source echo represents previous-square afterimage; no extra teleport or relocation.
agile-shield-grip|preparation|metal|source|angled shield grip glint|grip|Metal glint follows a grip adjustment; future shield Strikes remain separate.
air-cushion|targetSupport|wind|targets|updraft soft landing|slow the target's fall|Air rises below affected creature then settles gently; no forced movement.
air-shroud|elementAura|wind|source|breathing turbulent rim|Turbulent air|Finite turbulent air halo around source; breathing and terrain remain rules effects.
airy-step|concealment|wind|source|fog expanding side echo|fog|Fog spreads around source with a sidelong echo; later Step remains player movement.
aldori-parry|guard|weapon|source|defensive angled steel arc|parry|Defensive weapon glint sweeps across source; no shield spell or outgoing hit.
align-qi|restoration|healing|source|qi inward restorative pulse|regain|Healing qi gathers at source and settles; not an additional attack.
all-in-my-head|resolve|illusion|source|phantom mental phase|mental|Phantom shell dissolves inward as physical pain becomes mental; no immunity promise.
all-in-your-head|resolve|mind|source|focused mental refusal|Will|Inward mental focus closes around source; different from physical afterimage treatment.
all-returns-to-slumber|elementAura|dream|source|night quiet sinking veil|Slowed|Night veil closes across source's field; selected minds receive only symbolic drowsiness.
all-shall-end-in-flames|elementTarget|fire|targets|white hot wide eruption|sphere|Gather then wide white-hot eruption at chosen area; death/rebirth never shown as guaranteed.
all-the-time-in-the-world|time|time|source|clock mental projection|mental projection|Time halo and mental echo cue observation; never freezes others or moves documents.
all-this-has-happened-before|time|divination|source|past life layered memory|past|Memory echoes converge into source's initiative focus; granted Step is separate.
all-this-will-happen-again|fortune|mind|source|emotional cycle reroll|reroll|Mental cycle opens and reforms as a second chance, not a past-life Strike.
alloy-flesh-and-steel|form|metal|source|metal skin closing lattice|replace|Metallic lattice closes into source form; later blast and shield uses separate.
alluring-performance|performance|sonic|targets|spiral performance glitter|performance|Source performance blooms outward toward selected observers; fascination is conditional.
allys-shelter|targetSupport|ward|source|adjacent shared shelter|adjacent|Shared shelter accent forms around source using ally's support, no ally damage.
alter-resistance|form|transform|source|chromatic changing skin|resistance|Chromatic shell changes on source after incoming energy; no outgoing damage.
amalgamate|groundCreation|void|targets|two shadow convergent fusion|fusing them|Shadow fragments converge into a larger target growth; creature creation stays with PF2e.
ambush-bladderwort|groundCreation|plant|targets|watery seed planted growth|seed|Plant a small watery seed now; later trap, drowning and fruit healing are separate events.
analyze-weakness|focus|divination|targets|precise weak point scan|carefully study|Focused target scan marks studied positioning; does not perform the next Strike.
anatomical-quartering|multiStrike|blood|targets|four blood bone flesh spirit facets|four Strikes|Four source facets precede up to four different-target melee contacts; final contact gets spirit accent.
anchor-stance|stance|water|source|water low anchored brace|neutrally buoyant|Low water ring settles into an anchored stance; no actual buoyancy/movement update.
animal-rage|form|transform|source|animal fierce expanding silhouette|transform|Primal silhouette thickens around source; natural attacks are later uses.
animalistic-brutality|preparation|transform|source|animal sharpening morph glint|gains one|Short animal morph enhancement at source; does not attack or force selected trait.
annihilating-compound-invocation|elementTarget|force|targets|four runic convergent reverberations|four runes|Four converging runic accents precede force reverberation; no unconditional disintegration death.
anoint-ally|rune|blood|targets|blood rune inscribed ally|blood rune|Blood rune forms at selected adjacent ally; later blood magic remains separate.
aphet-flash|elementTarget|light|targets|swarm bright central flash|bright flash|Flash centered on selected swarm position then warm residual glow; dazzled conditional.
apocalyptic-visions|elementTarget|mind|targets|layered falling nightmare echoes|project|Source mental projection casts nightmare accents across selected minds; no physical falling meteor attack.
apparition-cloud|concealment|spirit|source|thousand spirit shards dispersal|thousand shards|Spiritual shards spread into concealment around source; finite cue, no familiar destruction.
apparitions-enhancement|preparation|spirit|source|weapon spirit encasing|encases|Spirit power closes onto source weapon/unarmed focus; no immediate target attack.
apparitions-quickening|spellshape|spirit|source|two apparition tightening charge|reduce|Paired spirit focus gathers for the next spell; no premature spell launch.
apparitions-reflection|restoration|spirit|source|apparition reserve returning flash|regain|Returning spirit reserve represents slot recovery; chosen immediately-cast spell has its own animation.
aquatic-pirouette|movement|water|source|underwater rotating sidestep|spin|Water curl and restrained spinning echo represent evasive movement; documents stay intact.
arc-of-destruction|ranged|weapon|targets|incoming reversal weapon arc|launch it back|Source deflection cue then return projectile toward selected attacker; counterattack remains conditional.
arcane-propulsion|flight|arcane|source|back ports upward energy|ports|Back/foot energy swells into gentle lift cue; no true token flight reposition.
archaeologists-luck|fortune|luck|source|trap rune second chance|Reroll|Compact fortune cycle around source after failed trap check.
archaeologists-warning|command|divination|targets|outward warning signal|warn your companions|Source warning glint reaches selected companions' attention cues.
architect-of-flame|groundCreation|fire|targets|fire rising wall foundation|wall or dome|Fire foundation grows at selected location; wall shape remains an approximation.
armor-in-earth|form|earth|source|stone enclosing armor|Stone encases you|Stone fragments gather and close around source into armor; no target damage.
artists-attendance|movement|arcane|source|double stride arriving rune|Stride twice|Two movement echoes finish in a source tracing glint; optional fly speed does not force flight.
artokuss-fire|craft|fire|source|volatile additive contained flame|crafting|Contained mixing flame at source; no bomb throw, later fire damage or persistent burn now.
as-a-thousand-soldiers|form|poison|source|swarm dispersing returning silhouette|swarm of bees|Swarm-like dispersal and return around source; optional passed enemies get no automatic sting outcomes.
ash-strider|movement|fire|source|ash billowing drift|whirling ash|Ash disperses into movement echo then settles around source; traversal damage remains conditional.
ashen-veil|concealment|earth|source|ash skin low obscure mantle|smearing ash|Low earthy ash veil around source; no attacks or undead damage.
ask-the-bones|focus|spirit|source|ancestor bone knowledge glint|bone of an ancestor|Small spiritual knowledge glint representing consulted ancestor bone.
asp-stance|stance|poison|source|sinuous low swaying coil|fluid, sinuous stance|Low sinuous coil settles around source; later flurry and sickness aren't activation hits.
assume-earths-mantle|stance|earth|source|large clustered rock mantle|rock cluster|Broad rock mantle closes around source; no token size or reach document update.
astral-compound-invocation|elementTarget|mind|targets|two runic mental interference|waves of mental interference|Two rune accents converge then mental ripples affect selected foe; stupefaction conditional.
astral-tether|targetSupport|mind|targets|thin psychic linked halo|thread of psychic energy|Source and ally receive matching psychic link accents; later amp benefit separate.
athletes-ally|preparation|weapon|source|warshard athletic power charge|channel the power|Power gathers onto source's weapon; no immediate Grapple/Shove/Trip.
attunement-shift|preparation|plant|source|terrain attunement replacing rim|alter your terrain attunement|Source terrain rim changes; element choice remains configurable, no projectile.
augment-senses|focus|transform|source|vestigial eye unfolding scan|vestigial eyes|Source sensory facets unfold; no damage ray or actual larger mechanical search template.
aura-expertise|elementAura|arcane|source|sustained aura returning breath|Sustain|Existing aura cue refreshes at source; no new attack or indefinite effect.
avatars-protection|form|spirit|source|divine avatar towering shelter|god's form|Divine shell rises around source before settling defensively; actual avatar spell separate.
avenge-in-glory|resolve|spirit|source|honoring ally inward courage|honor your ally|Honoring spiritual glint strengthens source; no revenge attack or ally resurrection.
banish-falsehoods-of-flesh|targetSupport|dispel|targets|polymorph peeling reveal|counteract a polymorph|Outer shimmer peels from chosen creature; reveal/cleansing is conditional on counteract.
banner-twirl|concealment|weapon|source|banner circular defensive flourish|spin your banner|Banner-like rotating glint and local veil shield source; no attacks.
barrier-of-boreal-frost|groundCreation|cold|targets|ice vertical brick screen|structure of ice|Ice grows at selected location as a screen; no target-directed damage or hemisphere.
bashing-charge|movement|weapon|source|two stride obstacle brace|Force Open|Two movement echoes culminate in a low obstacle impact cue, not an enemy Strike.
bat-form|form|shadow|source|small bat wing silhouette|transform into a bat|Dark wing-like shimmer contracts into a bat-sized cosmetic echo.
battle-assessment|focus|divination|targets|enemy strengths layered scan|careful observation|Layered target knowledge scan; concealed text is a requirement, not source invisibility.
battle-medicine|medicine|healing|targets|careful wound small restoration|patch up wounds|Small wound dressing then restoration at chosen creature; no divine ray.
battle-prayer|elementTarget|spirit|targets|scripture mental judgment|recite scripture|Source prayer glint precedes sacred target pulse; harm depends on Religion result.
battlefront-sabotage|craft|weapon|targets|precise structural fracture glint|sabotage|Small targeted tampering glint, no premature weapon launch or damage contact.
be-right-back|time|time|source|timeline repeated gear flicker|flicker a few times|Source echoes flicker and reconverge to represent alternate-timeline purchase.
beastmasters-call|groundCreation|summon|targets|primal companion soft projection|primal projection|Primal projection cue at chosen empty square; no attack, actor creation or support resolution.
beasts-of-slumbering-steel|groundCreation|metal|targets|interlocking mount rising base|mounts|Metal foundation rises beneath chosen riders; no immediate attack or actual mounted document update.
beckoning-dirge|preparation|void|targets|dirge thrall beckoning focus|thrall|Dirge accent focuses on selected thrall origin; later spell and thrall destruction separate.
become-destiny|resolve|dispel|source|external bond releasing radiance|remove any one condition|Source bonds dissolve into resolve cue; rules decide removal and hazard escape.
beguiling-aura|elementAura|mind|source|subtle breathing mental field|mental signals|Subtle mental field expands around source; later failed-save Step not shown now.
benefactors-majesty|resolve|light|source|grand mantle cleansing flare|grandeur|Grand source mantle rises and clears inward; recovery checks remain conditional.
benefactors-wings|flight|wind|source|spectral paired dragon wings|spectral wings|Wing-like paired wisps support a gentle source lift cue.
benevolent-spirit-deck|targetSupport|ward|targets|cards paired orbit shelter|cards move through the air|Protective card-like accents orbit selected ally; no damage missile.
bespell-strikes|preparation|arcane|source|weapon siphoned spell sheath|siphon spell energy|Spell energy closes onto source weapon, not an immediate Strike or target blast.
big-debut|performance|mind|targets|dramatic opening outward spotlight|dramatic pose|Source spotlight and observer anticipation cue; no automatic stunned condition.
bizarre-transformation|spellshape|transform|source|chimerical antler forming charge|next action|Morphing source charge readies next Untamed Form; no current attack or chosen elemental damage.
black-cat-curse|fortune|curse|targets|spiteful closing fortune loop|rerolls|Dark fortune loop folds around selected enemy's save attempt.
black-powder-flash|elementTarget|fire|targets|small close powder flash|pinch of black powder|Compact close-range flash at target face; no firearm projectile or guaranteed blindness.
blade-brake|guard|weapon|source|low weapon anchored spark|plow your weapon|Low steel spark anchors source to ground/surface; no enemy attack.
blade-of-the-heart|rune|spirit|source|heart shared rune returning glint|phases harmlessly|Harmless ally-heart glint leads to source weapon inscription; no bloody damage.
blanket-defense|targetSupport|ward|targets|source shield shared perimeter|each ally|Source shield cue extends to selected adjacent allies; no immediate Shield Block contact.
blasting-beams|ray|force|targets|single hand directed heat beam|beam from one hand|Directed hand beam with target contact; heat/lightning option configurable, no weapon slash.
blaze-of-revelation|elementAura|spirit|source|mystery overflowing divine shell|divine power|Divine overflow rises around source; no automatic death or invented revelation spell.
blazing-aura|elementAura|fire|source|explosive expanding flame rim|explode in flame|Source flame expands as emanation; ally quickened and enemy damage remain PF2e results.
blazing-spirit|elementTarget|fire|targets|defender flare then close retaliation|fiery defenses|Source defensive flame followed by close target fire pulse; no invented flying fire bolt.
blazing-talon-surge|bindStrike|fire|targets|rushing talon then grasp coil|Stride once|Source pursuit echo precedes one fiery melee contact, then conditional grasp accent.
blazing-wave|elementCone|fire|targets|broad cascading fire fan|cone|Source flame cascade then selected-target fan accents; knock prone conditional.
bleak-humorist|taunt|mind|targets|fading source bleak joke|bleak joke|Low source speaking glint precedes foe laughter/distracted cue; no guaranteed fall.
bleed-out|elementTarget|blood|targets|residual spell bloodletting mark|ranged bloodletting|Source residual magic focuses a bloodletting target mark; no invented physical arrow.
bless-shield|rune|spirit|source|prayer shield ghost touch|prayers|Prayer script settles on source shield; its later Block remains separate.
blessed-denial|targetSupport|ward|targets|peace loosening condition veil|lessening a harmful condition|Peaceful selected-ally veil loosens; no damaging hit or guaranteed condition cure.
blessed-spell|spellshape|healing|source|mercy upcoming spell charge|next action|Source mercy charge readies next spell; healing and counteract don't occur early.
blessing-of-the-five|healing|vitality|targets|fivefold divine restoration bloom|heal your allies|Broad restoration at selected allies; resurrection alternative remains customization, no automatic revival.
blood-calls-blood|resolve|blood|source|blood magic interrupted resolve|finish Casting|Blood resolve closes around source to represent refused disruption; no new spell blast.
blood-pool|groundCreation|blood|targets|low blood pool expanding ground|pool the blood|Low blood pool grows near triggering creature; healing happens when ally later absorbs it.
blood-rising|preparation|blood|source|bloodline answering pulse|magic in your blood surges|Bloodline surge at source; selected blood magic effect/recipient remains customizable.
blood-shield|guard|blood|source|blood thick defensive shell|barrier of your own blood|Blood curls into source barrier; no immediate Block destruction or enemy damage.
bloodline-conduit|spellshape|arcane|source|ambient inward channel charge|ambient energies|Ambient energies contract at source for next spell's fuel; no early cast.
bloom-cabaret-entrance|performance|mind|targets|elegant slow entrance spotlight|make an entrance|Slow source entrance and selected-observer anticipation cue; no initiative changes.
bloom-of-health|command|healing|targets|rally outward restorative echoes|rallying cry|Source shout fans restorative cues toward selected allies; fast healing remains rules-managed.
boasters-challenge|taunt|mind|targets|bold direct challenge focus|declare a challenge|Source declaration glint and focused target mental ring; weapon Strikes occur later.
bodily-disintegration|form|arcane|source|atomic dispersal moving return|disassemble momentarily|Source fragments disperse into an echo then reform; no forced relocation or wall crossing.
body-barrier|targetSupport|weapon|targets|body forward shelter line|grant all allies|Source brace and selected allies' cover accents, not a magical damage beam.
body-of-air|form|wind|source|living vapor dispersing shell|living vapor|Source shell becomes vapor then settles; no counterattack or document transformation.
body-shield|guard|void|source|thrall interposed defensive shade|throw an adjacent thrall|Interposed shade shields source; no actual thrall deletion or attack on selected foe.
bold-defiance|resolve|transform|source|changing shape hardening rim|harden your form|Source form rim hardens into resilience after shape change.
boleras-interrogation|focus|mind|targets|steady gaze closing truth ring|unable to speak|Steady selected-target focus/truth ring, no fear attack or guaranteed confession.
bolster-ally|command|sonic|targets|urgent encouragement protective pulse|shout encouragement|Source shout then chosen ally's reassuring pulse before save.
bon-mot|taunt|mind|targets|precise quip dizzy target|insightful quip|Small speaking flourish precedes distracted target cue; mental outcome conditional.
`.trim().split("\n");

const normalized = value => value.replace(/[^a-z0-9]+/g, "");
const map = {};
for (const row of rows) {
  const [slug,motif,theme,subject,shape,evidence,rationale] = row.split("|");
  const feat = PF2E_FEATS.find(f => normalized(f.slug) === normalized(slug));
  if (!feat) throw Error(`Reviewed feat not found: ${slug}`);
  if (map[feat.id]) throw Error(`Duplicate review: ${feat.name}`);
  map[feat.id] = { motif,theme,subject,shape,evidence:[evidence],rationale,
    tempo:/slow|measured|steady/.test(shape)?"measured":/flash|urgent/.test(shape)?"quick":"flowing",
    approach:shape,contacts:{count:motif==="multiStrike"?4:/Strike|ray|boomerang/.test(motif)?1:0,distribution:motif==="multiStrike"?"different targets":"selected",conditional:true},
    finish:[shape],constraints:["Cosmetic finite cue; rules outcomes, later granted uses and token positions remain PF2e/player decisions."],
    review:{descriptionHash:feat.descriptionHash,fullDescriptionRead:true,method:"individual full-description source review",batch:"nonmartial-0-129"} };
}
await writeFile(new URL("../data/feat-early-review.mjs",import.meta.url),`// Individually read full pinned descriptions. Hashes reject source drift.\nexport const FEAT_EARLY_REVIEW = ${JSON.stringify(map,null,2)};\n`);
console.log(`Saved ${Object.keys(map).length} full-description reviews.`);
