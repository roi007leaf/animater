# Animation fix pass — results (2026-10-07)

Implementation record for [the fix plan](animation-fix-plan-2026-10-07.md). Systemic fixes (color affinity, mundane impacts, muzzle flash, SF2e reviewed motifs, D&D theme rules, effect marker valence/tint, Free-edition color parity) were made first; then each domain was worked row by row. Every Part B row is listed below as implemented, skipped (with reason) or already fixed.

Audit deltas over all 16,149 recipe rows (before → after): one-shot stages >9 s 286 → 0; near-invisible layers 22 → 0; healing art on non-healing entries 133 → 25; "Needs configuration" recipes that still played 89 → 0; element art absent from the description 1,973 → 1,272; native area spells without an area stage 65 → 31; mundane blue magic impacts 276 → 13; blue earth cracks 152 → 1; blue fire rings 61 → 0. Free-edition fallbacks of a different hue are now tinted at plan time (`scripts/color-parity.mjs`).

Not watched in Foundry; full test suite (732) passes.


---

## Spells (PF2e) — animation fix pass report

Catalog rebuilt with `node tools/build-pf2e-catalog.mjs` (clean, no issues). All 23 spell test files pass (184/184, no test edits needed).

### 1. Summary counts

Table rows: 142. Implemented: 96; Skipped with reason: 19; plan-marked no fix needed: 21; Already fixed: 6.

"No fix needed" rows are ones the plan itself marked as fine (positive examples). Some table rows group several spells.

### 2. Part B rows

| Entry | Action | Detail |
|---|---|---|
| 500 Toads | Implemented | No toad or frog art exists in either inventory. The hopping tiles now use `footprints.monster.grey` (webbed/clawed tracks; Free falls back to shoe prints), tinted green-brown, and the dust is `particles.002.001.complete.many.greenyellow` (Free: blue, tinted green). |
| Biting Words | Implemented | Stage labels renamed: "Sonic words fly" / "Words strike" / "Sonic recoil". Blue beam kept: blue is the catalog's sonic color (soundwave.*.blue). |
| Blade Barrier | Implemented | New `fixBladeWall`: `cloud_of_daggers.daggers.purple` churning blades + a flattened energy-field plane. No shield. |
| Dismantle | Implemented | `fixDismantle`: `shatter.purple` + `particles.outward.purple`, with a small shake. |
| Cryostasis | Implemented | `fixIceEncase`: `ice_spikes.radial.burst/loop.blue` plus an ice-tinted silhouette. |
| Befitting Attire | Implemented | `fixAttire`: swirling sparkles → shimmer → glints. Shield dropped. |
| Allegro | Implemented | `fixAllegro`: music cast, `wind_lines.01.01.white`, sparkles, mild `pulse@targets`. No dizzy stars, no shake. |
| Commanding Lash / Chastising Retort / Daze / … / Crisis of Faith | Implemented | The jolt pattern's "Mental stars" scale now grows with damage dice (0.85 + 0.05 per die, max +0.45): Daze 0.9, Crisis of Faith 1.15. |
| Clairaudience | Implemented | Rule `senseHearing`: soundwave.01/02, relabeled. |
| Clairvoyance | Implemented | Rule `senseSensor`: floating `eyes.01.dark_green.single` sensor. |
| Darkvision / Deep Sight / Darkened Sight | Implemented | Darkvision → `senseDark` (dark-tinted eyes, like Deep Sight). The other two were already fine. |
| Detect Metal | Implemented | `senseMetal`: circle tinted #c0c0c8 plus metal glints. |
| Detect Poison | Implemented | `sensePoison`: `icon.poison.dark_green` plus a green-tinted search circle. |
| Call of the Grave | Implemented | Beam and impact colorized sickly green (#7a9e4a). Its cast is already cast_generic; the abjuration sign is on Chilling Darkness. |
| Aberrant Form | Skipped | The row contradicts itself: it asks to "raise" opacity to 0.5–0.6, but it is already 0.65. |
| Aerial Form … Crown of Prophets (form cluster) | Implemented | New rule in `refineSpellMotif` sends the generic `form` motif to a family: formAerial (feathers, #cfe8ff), formBeast (brown claws, #9a7b4f; 20 spells incl. Dinosaur/Elephant/Animal/Insect/Everfull Moon), formPlant, formMetal (Ferrous/Leaden/Metal Merged), formStone, formFey, formShadow (Devouring Dark), formWater (Feet to Fins, Ooze). Crown of Prophets has no family keyword and stays neutral. |
| Angel Form | Skipped | No fix needed (positive example). |
| Acid Arrow | Implemented | Residue opacity 0.45. The generic "Lingering residue" layer also went from 0.3 to 0.4 for every persistent spell. |
| Acid Splash | Implemented | movingGlob projectile scale 0.45 → 0.55 (all non-thunder globs). |
| Air Walk | Implemented | `fixAirWalk`: cast and hit are `wind_lines.01.01.white`. No feathers. |
| Airburst / Blastback | Implemented | `fixAirBlast`: one-shot `thunderwave.center` tinted white plus wind lines. Replaces the 8 s looping whirlwind. |
| Amalgamizing Leap | Already fixed | The portal-ring cast now plays 1400 ms (casting-seal identity layout). |
| Angelic Halo | Implemented | Emanation template opacity 0.9 → 0.5. |
| Animal Allies / Buzzing Servants / Cinder Swarm / Blood in the Water / Bounty of the Sky | Implemented (2 of 5) | Blood in the Water → water_splash (red in Patreon) plus bubbles. Bounty of the Sky → swirling_feathers. Others unchanged: Buzzing Servants (bees) and Animal Allies have no better art; Cinder Swarm is orange butterflies. |
| Animate Rope | Skipped | No rope asset in either inventory; the chain stand-in stays. |
| Arcane Explosion | Implemented | gapA support material → `explosion.01.purple` (Free `explosion.02.blue`) for the outward force. |
| Army of Shadows | Implemented | Darkness opacity 0.25 → 0.5. The template already spans the native area, so scale is not the issue. |
| Ash Cloud / Ashen Wind | Implemented | All layers colorized ash grey (#8a8378). Ash Cloud's Patreon fog was green. |
| Astral Labyrinth | Implemented | Web replaced with `energy_strands.overlay.blue.01`. |
| Avenging Wildwood / Bridge of Vines / Bursting Bloom | Skipped | No fix needed. |
| Bane | Implemented | `doubt` aura root → `magic_signs.circle.02.enchantment` (enchantment, not abjuration). |
| Beheading Buzz Saw | Skipped | No fix needed. |
| Begone | Skipped | Optional; the energy strands plus recoil already read as a shove. |
| Black Tentacles | Skipped | No fix needed. |
| Blazing Dive | Skipped | Low value: the leap motion carries the ascent and wind lines already play at landing. |
| Blended "Divination scan" group | Implemented (partial) | Blind Eye → sealed dark eye; Blood Duplicate → blood splash plus shimmer; Defended by Spirits → spirit_guardians; Disguise Magic → circle plus masking shimmer. Approximate, Augury, Detect Creator and Detect Scrying are genuine divinations and keep the scan. Channel Arrogance kept (no fitting art). |
| Blur | Implemented | Afterimage layer is now shimmer, not smoke. |
| Boil Blood | Skipped | The row itself says skip. |
| Call of the Quenching | Skipped | The design already names rain, but no raindrop asset exists in either inventory; the template already covers the 1-mile area. |
| Cataclysm / Chain Lightning / Charm | Skipped | No fix needed. |
| Chilling Darkness | Implemented | Beam and impact colorized cold blue (#9fd6ff), distinct from Call of the Grave. |
| Chromatic Image | Skipped | No fix needed. |
| Chromatic Ray / Chromatic Wall | Skipped | Needs a runtime tint chosen per roll; recipes can't express that. |
| Clinging Shadows Stance … Contingency (9 "fine" rows) | Skipped | No fix needed. |
| Create Food | Skipped | Not duplicates: the 6 stages sit at 6 different offsets (a 3×2 plate grid). Verified with a whole-catalog true-duplicate audit: 0 real duplicates. |
| Create Water | Skipped | Not duplicates: two hands at offsetX ±0.3. |
| Crushing Ground / Cyclone Rondo / Daemon-Demon-Devil Form / Darkness group | Skipped | No fix needed. |
| Daydreamer's Curse | Implemented | Sleep cloud → shimmer; the drifting eye is kept. |
| Death Knell | Skipped | Optional; the heart-then-skull sequence is conceptually right. |
| Deathless March / Deity's Strike | Skipped | No fix needed. |
| Devour Life / Drain Life / … / Chroma Leach | Already fixed | Chroma Leach already has a bespoke color-drain (desaturating sparkles), not the life-drain beam. |
| Dirge of Remembrance / Disintegrate | Skipped | No fix needed. |
| Dinosaur Form | Implemented | formBeast (claws, earthy tint). |
| Dinosaur Fort | Skipped | Not duplicates: 4 skulls at the 4 fort corners. |
| Divine Armageddon … / Dizzying Colors | Skipped | No fix needed (Dizzying Colors also gains a cone footprint, see A7). |
| Dragon Form | Implemented | Cast and accent layers colorized red-orange (#d9653b). The dragon type is chosen at cast time and can't be read. |
| Draw Ire | Implemented | "Ire flares": stars colorized red (#e0483c). |
| Draw Moisture | Implemented | `fixMoisture`: water leaves the object (splash) and a droplet bobs in the caster's hand. Levitate removed. |
| Dull Ambition | Skipped | The plan rates it acceptable. |
| Dust Storm | Implemented | Fog colorized tan (#c7a77e); stage relabeled "Choking dust spreads". |
| Earth and Sky | Skipped | Acceptable. |
| Earthbind | Implemented | Binding threads colorized earth brown (#9b7a55). |
| Electrified Crystal Ward | Skipped | Low priority; static_electricity already present. |
| Elephant Form | Implemented | formBeast. |
| Ember Doppelgänger / Enfeeble | Skipped | No fix needed. |
| Enlarge | Skipped | Acceptable. |
| Entrancing Eyes | Skipped | No fix needed. |
| Equal Footing | Skipped | Acceptable metaphor. |
| Erase Trail | Skipped | No fix needed. |
| Fashionista | Implemented | `fixAttire` (shimmer, glints, sparkles). |
| Fated Confrontation / Favorable Review / Fear the Sun | Skipped | No fix needed. |
| Field of Razors | Implemented | Web → `cloud_of_daggers.daggers`, still steel-tinted and desaturated. |
| Fishing Spot | Implemented | Quarterstaff swing → a static glint "Fishing rod glints". |
| Flashy Disappearance | Skipped | Low priority. |
| Flense | Implemented | `fixFlense` (theme blood): claws plus `liquid.splash02.red`. No weapon. |
| Fly | Skipped | No fix needed. |
| Foraging Friends | Implemented | Tracks → `footprints.monster.grey` (Free falls back to shoe). |
| Forceful Hand | Implemented | `fixForceHand`: `arcane_hand.purple` beside the caster. |
| Freezing Touch / Friendfetch / Frog Tongue / Fulminating Impact | Skipped | No fix needed. |
| Fungal Hyphae | Implemented | `senseGrowth`: green swirling leaves plus a green search circle. |
| Gasping Marsh / Geyser / Ghost Rush / Glamorize | Skipped | No fix needed. |
| Glass Sand | Skipped | No glass art; now also shows a cone footprint (A7). |
| Glimpse Weakness | Implemented | `fixWeakPoint`: `hunters_mark.pulse.purple` on the foe. |
| Glowing Trail | Implemented | `fixTrail`: 3 fading dancing_light motes trail behind the caster. No scan. |
| Gravitational Pull | Implemented | `fixGravityPull`: gravity ring plus `rush@targets` toward the caster (motionRange target, like Friendfetch). No levitate. |
| Gravity Weapon | Skipped | Low priority. |
| Grease | Implemented | Cast splash colorized brown (#6b4f2a). |
| Grisly Growths | Implemented | `fixGrowths`: flesh eruption (`liquid.splash02`) plus extra eyes popping open. No weapon. |
| Grim Tendrils / Halcyon Mists | Skipped | No fix needed. |
| Heatvision | Implemented | `senseHeat`: orange eyes and an orange outline circle. |
| Heinous Future | Skipped | No fix needed. |
| Helpful Steps | Implemented | Quarterstaff swings → shimmer "Steps take shape" plus construction glints. |
| Holy Light / Hypnotize / Ice Storm group | Skipped | No fix needed. |
| Illusory Disguise | Implemented | `fixDisguise`: shimmer, changed silhouette and `markers.on_token_mask` guise. |
| Imaginary Weapon … Infectious Comedy | Skipped | No fix needed. |
| Instant Armor | Implemented | `fixArmorStow`: shimmer shrinks away into a small extradimensional portal ring. |
| Interposing Earth | Implemented | The plan rated it acceptable; the per-element ward rule now gives it `shield_themed.above.molten_earth`. |
| Inner Radiance Torrent / Invisibility group | Skipped | No fix needed (Invisibility Curtain's faint layer was raised under A9). |
| Lashunta's Life Bubble | Implemented | `fixLifeBubble`: `bubble.001.001.complete` plus a loop. |
| Lay on Hands / Leng Sting group / Lignify | Skipped | No fix needed. |
| Life's Flowing River | Implemented | `fixGhostRiver`: water splash plus a liquid blob flowing outward, colorized ghostly pale blue. |
| Magical Fetters | Implemented | `fixFetters`: impact is `markers.chain.spectral_standard.complete.02` ("Manacles clasp"). |
| Magic Stone | Implemented | The 20 s asteroid is replaced by small `falling_rocks.top.1x1.grey` at scale 0.35. |
| Percussive Impact | Implemented | Labels: Compress sound / Sound sphere flies / Sonic burst. The bubble stays as the "compressed ball of sound" (no sonic projectile asset exists). |
| Power Word Kill | Implemented | `fixKillWord`: large `icon.skull` (scale 1.6), dark soundwave burst and a fatal shudder. |
| Magnetic Attraction | Implemented | The flight now really uses the spectral dagger (`slotGeometry` object; previously it fell back to magic_missile). Arrival is `aura_themed.01.inward.complete.metal.01.grey` at 0.7 opacity. |
| Magnetic Acceleration | Implemented | `fixMetalShot`: hit root `impact.009` (Patreon white, Free orange) colorized neutral grey. No frost fallback. |
| Needle Darts | Implemented | `fixMetalNeedles`: same `impact.009` plus grey fix. |
| Mad Monkeys | Implemented | Spirit-guardian ring → a lively warm particle swarm (orangeyellow, tinted) plus monster tracks. |
| Living Thunderbolt | Implemented | Lightning aura opacity 0.35 → 0.75, scale 1.4. Motion kept, since a rush would imply movement the spell doesn't make at cast time. |
| Metallic Meteorite Glyph | Implemented | Meteor projectile playbackRate 3: 20.5 s → 6.8 s. |
| Mantle of Heaven's Slopes | Skipped | Not duplicates: mirrored wings (offsetX ±0.35, rotation ±35). |
| Scrying / Scrying Ripples | Implemented | `senseSensor` floating-eye sensor. |
| Raise Dead / Revival / Resurrect / Reincarnate | Implemented (Raise Dead) | Raise Dead: bloom scale 1.8 for 2.6 s, sparks 1.6. Revival, Resurrect and Reincarnate already have bespoke recipes. |
| Reclined Apport | Implemented | `portalItem` (with Fetch, Far-Flung Fetch, Magic Mailbox, Thoughtful Gift, Trade Items): ring 0.4, blink 0.45, no caster-departure echo. |
| Percussive Impact (cast stage) | Implemented | See above. |
| Sleep | Implemented | Planet → `sleep.symbol` (Zzz) over a `sleep.cloud` area. |
| Unseen Heralds | Implemented | `icon.mute` → `soundwave.01` "Illusory mouths speak". |
| Thunderous Strike | Implemented | Quarterstaff → weapon-agnostic `melee_generic.slash.02`. |
| Splinter Volley | Implemented | Bolt root → `arrow.physical.green` (Free `arrow.physical.blue`). The old `arrow.physical.brown` root didn't exist, which caused the cold-arrow pick. |
| Stop Heart | Implemented | Heart colorized dark red (#8a1f3a). |
| Unbearable Cacophony | Implemented | Soundwave scale 1.6 plus a `shatter.blue` "Sound becomes damaging" burst. |
| Variable Gravity / Unrelenting Gravity | Already fixed | They already use the gravity ring (energy_field); no feathers are present. |
| Vapor Form | Implemented | `fixVapor`: smoke puff, fading solid form, shimmer mist, gentle drift. |
| Trickster's Feathers | Implemented | `fixFeatherGuise`: shimmer guise plus illusory feathers. |
| Spell Turning / Spell Riposte | Already fixed | Spell Turning already layers a reflective shimmer. Riposte's reflected-thread layer already conveys reflection; left as is. |
| Teleport | Already fixed | Already `teleportGate` (teleport.01 at scale 2.2); no misty_step layer. |
| Teleportation Circle | Implemented | Added a `portals.horizontal.ring` ground circle at scale 1.7. |
| The Everfull Moon | Implemented | formBeast (claws, earthy tint). |
| Tree of Life and Death | Implemented | `fixTwinTrees`: two plant-growth trees, one green (life), one void-tinted (#5b3f6e), set apart. |
| Unblinking Flame Aura / Ignition | Implemented (Aura) | Aura's heal bloom colorized flame orange. Ignition already uses orange feathers. |
| Summon Animal / Construct / Plant or Fungus / Undead / Instrument | Implemented | `fix:summon` per type (also Summon Fey and Summon Lesser Servitor): tinted circle plus accent. Animal → claws; Construct → orbiting metal; Plant → leaves; Undead → skull; Instrument → music notes; Fey → butterflies; Servitor → planar star. |
| Trickster's Mirrors | Implemented | Bubble → shimmer mirror plus a glint. |
| Unfolding Wind Crash | Implemented | `levitate d0.25` → `leap` with jumpHeight 2.4. Gap C pose nodes now accept options. |
| Vision of Beauty / Vision of Death | Skipped | Low priority; already distinct heart vs skull. |
| Weapon of Judgment | Implemented | `spiritual_weapon.longsword.01.spectral` (no flaming variant). |
| Wall of Flesh | Implemented | Heart icon dropped; flesh tiles scale 1.25 plus `liquid.splash_side02.red` tissue. |
| Wish | Implemented | Larger recipe: soundwave 1.4, strands 1.6, `portals.vertical` reality rift 1.8 and a twinkling-stars rewrite. |
| Stormburst | Implemented | Added a `shatter.blue` thunderclap. |
| Thundering Dominance | Implemented | `fixRoarBuff`: roar soundwaves plus predatory aura on the companion. It's a buff, so no shake. |
| Umbral Mindtheft | Implemented | Rune icon colorized shadow purple. |
| Weird | Skipped | Low priority, acceptable. |
| Vicious Jealousy | Implemented | Motif label "Social ties sever and isolate"; stage label "Ties to allies sever". |
| Whirling Flames / Wildfire / Signal Skyrocket | Implemented | Fire designs now have descriptive labels (e.g. "Flame vortex rises", "Wildfire spreads", "Rocket climbs" / "Burst overhead"). |
| Summerland Spell | Implemented | `flaming_sphere` → `dancing_light.yellow`. |
| Transmigrate | Already fixed | The kiln fire already resolves to `flames.04.complete.orange`. |
| Shock and Awe | Implemented | Salvo flashes → translucent `explosion.01` cannon blasts. |
| Thicket of Knives | Implemented | Added `cloud_of_daggers` "Phantom blades flicker" (the 3 sprite copies already existed). |
| Timely Reminder / Telepathic Demand | Implemented | Telepathic Demand: harsher purple tint, higher opacity, labels "Demand intrudes" / "Compulsion lingers". |
| Zero Gravity | Implemented | Field 0.25 → 0.45; flecks 0.4 → 0.65. |
| Tortoise and the Hare | Skipped | Already has a wind-lines "Speed potential" layer. The quickened ally isn't separately targetable in this recipe. |

### 3. Systemic changes (Part A, spell items)

- **New `scripts/spell-fix-designs.mjs`**, wired into `spell-design.mjs` (motifs, authored designs, layer chain, post-pass) and `tools/spell-semantics.mjs` (cluster refinement). It contains:
  - `refineSpellMotif` (rule level, non-authored spells only):
    - **A5 Force shield:** shields that are real wards get per-element `shield_themed` art: fire (Phoenix Ward), earth (Interposing Earth, Untwisting Iron Pillar).
    - **A5 Divination scan:** split into senseHearing, Sensor, Dark, Heat, Poison, Metal, Growth and Earth (16 spells).
    - **A5 Transformation silhouettes:** split into 8 form families (35 spells).
  - Authored fixes for the non-ward "Force shield raised" spells: Dismantle, Cryostasis, Befitting Attire, Fashionista, Glimpse Weakness, Trickster's Feathers, Illusory Disguise, Instant Armor, Lashunta's Life Bubble, Life's Flowing River, Forceful Hand, Blade Barrier, Conductive Weapon, Weave Wood and Magnetic Repulsion. 33 genuine wards remain on forceShield.
  - **A5 Teleport scale:** six object-sized teleports → `portalItem`; Gate, Forest of Gates and Space Fold Gate → `planarGate` (vertical vortex at scale 2.6).
  - **A5 Summons:** 7 summon types differentiated.
  - **A5 Mental jolt:** Allegro, Power Word Kill and Thundering Dominance moved off the jolt; jolt scale now grows with damage dice.
  - `applyFixStyle`: motif- and slug-level tint, labels, stage tweaks and drops.
  - `capSpellStages`: the A9 rules below.
- **A9 long stages:** one-shot stages whose final length (media plus exit fade/shrink) exceeds 9 s are sped up with `playbackRate` (≥1.05, ≤3) to about 8 s. Explicit authored rates are left alone. Long stages went from 129 to 1; the one left is Freeze Time's deliberate 0.35× "still moment".
- **A9 faint layers:** opacity floor 0.25 for any asset layer under 0.2. Faint layers went from 17 to 0.
- **A9 duplicates:** the cited "duplicates" all sit at distinct offsets (verified by a catalog-wide audit: 0 true duplicates). No change.
- **A7 cones with no footprint:** every projectile-fan cone in gap A, B and C now adds a 0.4-opacity `detect_magic.cone` footprint. Gap A fan graphs' area root is now `detect_magic.cone`. That covers Ancient Dust, Eagle's Cry, Horde of Underlings, Fungal Exhalation and 29 others. Ghostly Tragedy and Ibex's Harvest emanations now play as templates. Native-area spells without a template went from 51 to 17.
- **A7 remaining 17:** these are targeted or secondary-area spells where the area isn't the visual footprint, and none is a template-less native area. Examples: Collective Transposition (which already has a footprint aura), Detonate Magic, Heartbolt.
- **A7 line spells:** Arctic Rift now uses `template_line.ice` (lineBeam). Wall of Radiance now uses `energy_wall` (lineBarrier) tinted bright. Bone Spear is a projectile flight and Scatter Scree is intentional falling-rock tiles, so both were left.
- **A7 burning_hands cones:** all three skipped. Elemental Annihilation Wave deals native fire damage, Plasma Whirl is plasma, and Rejuvenating Flames are literal healing flames.
- **A8:** Unseen Heralds and Brain Drain fixed (Brain Drain: memories flow to the caster as knowledge runes; no healing art). Shock to the System skipped: its description really does heal and revive (regains 8d8 HP), so the healing art is correct.
- **Shared motif edits:**
  - fireShield hit → `shield_themed.above.fire`.
  - blurred aura → shimmer.
  - doubt (Bane) → enchantment circle.
  - movingGlob scale 0.55.
  - Persistent residue opacity 0.4.
  - frostRift → lineBeam ice line.
  - woodSplinters → `arrow.physical.green`.
  - magneticReturn geometry fixed.
  - illusionBallistics → explosions.
  - broadJealousy label.
  - Fire-design labels.
- `SPELL_SELECTION_REVISION` bumped 3 → 4, so `--reuse-media` caches re-resolve.
- Every new JB2A key or root was checked against both key lists.

### 4. Tests changed

None. All 184 tests in the 23 spell test files pass. One intermediate failure caught real violations: Gap C forbids comma root lists. I fixed it by using single roots (`icon.heart`, `portals.vertical`) rather than editing the test.

### 5. Requests for files I don't own

- None required.
- SF2e reuses these motifs; the lead needs to rebuild SF2e to pick them up.
- `scripts/catalog-motion.mjs` (shared): if reviewed motion for Gravitational Pull is wanted there, it could get an `approach(...)` entry like Friendfetch's. The fix currently builds the pose inline.

---

## feats — PF2e active feats (Part B feats 1–4, A5/A8 feat items)

### 1. Summary
- Part B rows (counting each grouped row once; ~107 rows incl. the 14 ground-crack and 12 spectral-mace rows): **implemented 73**, **partial 4**, **skipped 14**, **already fixed / no fix needed 16**.
- Systemic rules (A5/A8) change media on **776 / 2308** PF2e feats (diff of asset first-keys before/after the rebuild).
- Build: `node tools/build-pf2e-feat-catalog.mjs` → exit 0, `issues: []`, 2308 feats, distinct compositions 2308/2308 in both editions.
- Tests: feat-*.test.mjs, deep-feat-audit, full-feat-weapon-audit, catalog-motion-coverage, motion-pacing, path-motion → **106/106 pass**. No tests changed.

### 2. Part B rows
| Entry | Action | Detail |
|---|---|---|
| Collapse Wall | implemented | hit `falling_rocks.top.1x1.grey`, aura dust `smoke.puff.side.grey` (no wall_of_fire/wall_of_force, no rolling boulder) |
| Amalgamate | implemented | hit `liquid.blob.purple`, aura `energy_strands.in.red` (no sacred_flame, no sphere_of_annihilation) |
| Abscission Shards | implemented | blood rule: hit `liquid.splash_side02.red` in Patreon |
| Bone Burst | implemented | hit `impact.ground_crack.01.white` (bone-white crack), aura glint |
| A Hush Falls Over the World | implemented | cast/aura `darkness.black` |
| Call Worm Spirit | implemented | hit `ground_cracks.01.white`, aura `bite.400px.grey` (maw) |
| Call the Swarm | implemented | no skull smoke: hit `smoke.puff.centered.grey`, aura `ground_cracks.02.white` |
| Beastmaster's Call | implemented | conjuration circle `magic_signs.circle.02.conjuration.complete/loop` instead of call_lightning |
| Celestial Cacophony | implemented | added per-target sonic aura `soundwave.02.orangeyellow` after the fire fan |
| Anatomical Quartering | implemented | spiritFinish `energy_strands.complete.grey` (pale spirit) instead of divine_smite |
| Blood Pool / Draining Strike / Bleed Out | implemented (Bleed Out) / already OK | Bleed Out hit → liquid splash; Blood Pool already liquid.blob/energy_strands; Draining Strike has no divine_smite |
| Dazzling Dragonet Disappearance | implemented | cast `dancing_light.yellow` flash, aura `shimmer.01.orange` vanish |
| Dalang's Ally | implemented | cast/hit `darkness.black`, aura dark `shimmer.01.purple` |
| Dream Guise | skipped | L; plan itself says shimmer is fine |
| Bat Form | implemented | form rule: `bats.complete/loop.01.red` (also Form of the Bat) |
| Alloy Flesh and Steel | implemented | form rule: `aura_themed.01.inward.*.metal.01.grey` |
| As a Thousand Soldiers | skipped | no bee/swarm asset |
| Ash Strider | implemented | cast `smoke.puff.side.dark_black` (ash) instead of leaf wind |
| Decree of Execution / War / Prosperity | implemented | music rule: cast `soundwave.02`, War hit `ui.chevrons3.yellow` (allies Stride), aura glint |
| Command Attention / Confusing Commands / Converge | implemented | auditory → soundwave cast; Converge (non-auditory) → glint; no music notes |
| Fortune cluster (Acquired Tolerance … Define "Report") | implemented | fortune aura `twinkling_stars.points08` instead of abjuration circle (47 feats) |
| Blasting Beams | skipped | heat vs lightning is chosen in play; needs variant support |
| Blazing / Aura Expertise / Beguiling / Dominion Aura | implemented | `fire_ring.500px.red`; `energy_field.02.below.purple` ×2; `swirling_sparkles.01.bluepink` |
| Blast Lock / firearm Strikes | no fix needed | reviewer confirmation only |
| Battle Hymn to the Lost | implemented | target aura `spirit_guardians.blueyellow.spirits` (spectral warriors) |
| Brandish Authority | skipped | plan: neutral default reasonable (flavor is GM choice) |
| Begin Stampede | implemented | horn → `melee_generic.piercing.one_handed` (anatomy routing) |
| Belly Flop | implemented | added `shake@targets` weight cue |
| Blazing Talon Surge | no fix needed | positive control; now uses `creature_attack.claw.001.red` via talon anatomy (still fire-tinted) |
| Elemental Explosion | skipped | element chosen in play (rage instinct); a static branch would be a guess |
| Explosive Death Drop | implemented | hit `impact.fire.01.orange` |
| Ferocious Will | implemented | sleep rule → `energy_strands.02.marker.bluepurple` / `energy_strands.complete.purple` |
| Kashrishi Revivification | implemented | `healing_generic.03.burst` + `healing_generic.loop` |
| Eternal Torch | implemented | `flaming_sphere.200px.orange` + `dancing_light.yellow` |
| Flashforge | implemented | glint + `aura_themed.01.orbit.complete.metal.01.grey` |
| Goblin Club | implemented | `spiritual_weapon.club.01.spectral.02.green` |
| Lightning Tongue | implemented | `impact.005.white` + glint, no foliage |
| Ensnaring Disarm | implemented | `impact.005.white` + glint, no foliage |
| Harbinger's Caw / Ill Tide / Fluttering Distraction | implemented | misfortune rule: `hunters_mark.pulse/loop.01.purple` (9 misfortune feats) |
| Infinite Expanse of Bluest Heaven | implemented | `swirling_sparkles.01.blue` + `shimmer.01.blue`, no sleep |
| Lava Leap | implemented | aura `shield_themed.above.molten_earth.01.orange` (both editions) |
| Imprison Foe | implemented | aura `portals.horizontal.ring_masked.dark_purple` instead of vines |
| Guardian Lion Roar | partial | cast soundwave, hit `shatter.blue`; travel beam kept (no sound beam/line asset) |
| Frog Geyser | skipped | no water beam/line asset; travel remains energy_beam blue |
| Hurricane Swing | implemented | default = Gust of Wind: bolt `gust_of_wind.veryfast`, hit `whirlwind.bluewhite` |
| Kobold Breath | skipped | damage type/shape depends on lineage chosen in play |
| Instinctive Obfuscation | implemented | `shimmer.01.purple` double instead of smoke |
| Heat Wave | implemented | cast `smoke.plumes.01.dark_red` |
| Extraplanar Haze | implemented | aura `swirling_sparkles.01.blue` |
| Invigorating Breath | implemented | cast `wind_lines.01.01.white`, aura `healing_generic.loop` |
| Feral Mending | implemented | cast `healing_generic.03.burst.green` (matches green aura) |
| Giant's Stature | implemented | form stages ×1.45 scale |
| Falcon Swoop | already OK / implemented | motion is already a leap arc; aura now `swirling_feathers` (flight rule) |
| Glider Form | skipped | traversal review deliberately samples a level forward glide |
| Goring Charge | implemented | horn → piercing contact |
| Megavolt | implemented | travel `breath_weapons.lightning.line.blue` |
| Molten Wire / Scorching Disarm | implemented | hit `impact.fire.01.orange` |
| Pit of Snakes | implemented | `entangle.02.complete/loop.02.green` |
| Oversized Throw | implemented | `boulder.toss.01.01` + `impact.boulder.01` (Free: `boulder.toss.02.01.stone.brown` + ground crack) |
| Quill Spray | implemented | holy rule → `impact.005.white` |
| Rock Rampart | implemented | aura `falling_rocks.side.2x1.grey` instead of rolling boulder; foundation ground_cracks kept |
| Scorching Column | implemented | aura `wall_of_fire.ring.yellow` (radial ring = column footprint) |
| Rising Hurricane | implemented | `whirlwind.bluewhite` hit+aura |
| Ride the Tsunami | implemented | impact scale 2.2 |
| Regurgitate Mutagen | implemented | hit `liquid.splash_side02.green` |
| Rotten Slurry | partial | Patreon `liquid.splash_side02.green`; Free has no green splash → needs A2 tint (shared) |
| Scrap Barricade | implemented | `impact.005.orange` + `aura_themed…orbit…metal.01.red` (rust) |
| Mind Shards / Mental Static / Psi Burst … (cluster) | implemented | sleep rule: 59 hit + 17 aura slots → energy_strands (sleep kept only when text mentions sleep/dream/unconscious) |
| Point Blank Stance … Reflexive Stance (cluster) | implemented | non-magical weapon/ward stances: cast `impact.005.white`, aura glint (42 feats) |
| Shimmer cluster (Oni, Rat, Long-Nosed …) | partial | size scaling (Oni ×1.45, Rat ×0.65), winged forms → feathers, bats, metal; no per-form tint |
| Defend/shield-bubble cluster | implemented | non-magical weapon/earth guards without a shield in the text → parry flash + glint (22); divine guards → `ward.rune.yellow.01` (11); Reactive Shield etc. keep shield |
| Prepare/glint cluster (100+) | skipped | broad routing of preparation glints not attempted (risk to 100+ unrelated feats); holy/sleep/spectral/music rules cover the worst |
| Solar Detonation | already fixed | A1 (no fire_ring blue left) |
| Slowing Strike | implemented | hit `impact.005.white`; aura `markers.chain.standard.loop.02.grey` (was lightning_strike) |
| Thrash | implemented | hit `impact.005.white`, aura glint |
| Snakebird's Shadow | implemented | beam removed: lunge + one `melee_generic.slashing` contact per enemy (staggered) + water wake |
| Wild Winds Gust | implemented (differently) | wind crash is a ranged unarmed attack, so travel kept but `gust_of_wind.veryfast` instead of energy beam |
| The World Devours … World-Breaking Footfall (14 ground_cracks rows) | already fixed | A1; only Resounding Blow (sonic) keeps blue cracks, intentionally |
| Shove Down … Wing Bounce (12 spectral-mace rows) | implemented | spectral rule: trip/shove aura → `smoke.puff.side.grey` dust; weapon contacts white not purple |
| Thunderous Landing | implemented | hit `shatter.blue` (no frost in Free) |
| Twist the Knife | implemented | hit `liquid.splash_side02.red`, aura `energy_strands.in.red` |
| Shrink Down | implemented | ×0.65 scale (static; `scaleIn` is not consumed by the runtime, so no ramp) |
| Spike Skin | skipped | acceptable per plan; no spike overlay asset |
| Vine Lash | skipped | travel length is the baked `swirling_leaves.ranged` clip; no shorter vine projectile |
| Siege Celerity / Steal Time … | skipped | L |
| Smoke Curtain | implemented | added source smoke-cloud aura (`smoke.puff.ring.01.white`, ×2.4) |
| Movement feats with no motion (14 PF2e) | Walk the Plank implemented; 13 skipped | Walk the Plank: target `rush` away (forced Stride on success). Skipped because the feat's own creature does not move: Call Wizardly Tools (item teleports), Courageous Onslaught / Decree of War / Form Up! / Sovereign's Blade (allies move by reaction), Crawling Fire / Sand Snatcher (summons), Dance of the Tiger (stays put), Dance of the Jester (crit-only, both), Skeletal Extension / Spirit of the Blade (preparation), Storming Breath (optional Awakening), Tap into Blood (one of several options) |

### 3. Systemic changes
`tools/feat-asset-selection.mjs` (FEAT_SELECTION_REVISION 8 → 9):
- **force()**: re-picks a slot in explicit root order; with a `bad` regex only editions whose pick is the offending art are changed; an edition with no listed root keeps its pick.
- **FEAT_MEDIA**: per-feat audited media (all keys checked against both key lists).
- **featMediaCorrections()** (exported):
  - holy `divine_smite`/`sacred_flame` on non-holy themes → physical spark, blood splash, or void impact
  - weapon theme purple/blue magic impacts → `impact.005.white` / `impact.ground_crack.01.white`
  - `spiritual_weapon` without spectral fiction → dust (trip/shove) or glint
  - `sleep.*` without sleep fiction → energy_strands psychic
  - blood `toll_the_dead` → liquid
  - produce of non-plant themes → material-specific (fire/metal/spirit/teleport)
  - movement `wind_lines` → Fly feathers / Swim water / Burrow cracks, otherwise plain white lines
  - form shimmer → bats / metal / feathers
  - mundane guards → parry flash, divine guards → ward rune
  - martial stances → glint
  - misfortune → hunters_mark
  - fortune aura → twinkling stars
  - non-musical `music_notations` → soundwave (voiced) or glint, and `bardic_inspiration` hit → chevrons or glint
  - non-magical `detect_magic` → eyes
- **nativeFeatRoots**: unreviewed Strikes read their anatomy from text ("claw Strike", "horn", "tail"…); horn/antler/tusk → piercing, tail/hoof/wing → bludgeoning.

`tools/build-pf2e-feat-catalog.mjs`: passes `traits` into the media context.

`scripts/feat-choreography.mjs`:
- Snakebird's Shadow per-target melee
- Belly Flop shake
- Walk the Plank forced Stride
- Smoke Curtain cloud aura
- Celestial Cacophony sonic aura
- Ride the Tsunami scale
- size scaling for form/transform (giant/towering/oni ×1.45; shrink/tiny/rat ×0.65)

### 4. Tests changed
None. All 106 pass unchanged.

### 5. Requests for files I don't own
- **SF2e** (lead): `resolveFeatMedia` now applies `featMediaCorrections`. `build-sf2e-catalog.mjs` should pass `traits` in its context so trait-gated rules work: misfortune, mundane guard/stance, detect_magic→eyes, music. Without traits these rules treat every feat as non-magical. That is safe for most rules, but the trait-gated exclusions do not apply, so magical SF2e feats can get the mundane parry/stance/eyes rules. Rebuild SF2e after this.
- **A2 (Free tint parity, shared selection/runtime)**: Rotten Slurry, Regurgitate Mutagen, Amalgamate and others still fall back to blue/other-colored Free keys where Free has no matching color; this needs automatic colorize/tint.
- **Runtime (`scripts/runtime.mjs` / stage options)**: the `scaleIn` stage field written by the feat/spell choreographies is not read anywhere. A grow/shrink ramp (Shrink Down, Giant's Stature) needs runtime support for a start-scale ramp.
- **Variant support (model)**: Blasting Beams, Kobold Breath, Elemental Explosion and Hurricane Swing need a play-time element/shape choice to branch art properly.

---

## weapons — PF2e weapon Strike recipes

### 1. Summary
- Part B rows (parts 1+2, 34 rows) plus the Part A weapon items: **19 implemented**, **11 skipped**, **4 already fixed or stale**.
- Build: `node tools/build-pf2e-weapon-catalog.mjs` finishes with `issues: []`. 1018 weapons, 1127 usage designs.
- Every JB2A key the catalog selects now exists in the Patreon or Free list it was picked for. I checked all `selections` against `jb2a-patreon-keys.txt` and `jb2a-free-keys.txt`: 0 missing.
- Tests: weapon-catalog, deep-weapon-audit, full-feat-weapon-audit, handwraps and weapon-catalog-ui pass (45/45). No test was changed.

### 2. Per-row table
| Entry | Action | Detail |
|---|---|---|
| ~70 firearms: blue bullets (P1) | Already fixed | Verified: 0 physical firearm modes use `bullet.*.blue`; Flintlock Musket uses `bullet.01.orange`. |
| Firearms: no muzzle flash (P1) | Already fixed | Verified: every ranged firearm has a `Muzzle flash` cast (`muzzle_flash.single.01.yellow`). |
| Drake Rifle (Electricity) Free `eldritch_blast.purple` | Implemented | Spittle-electricity flight roots are now `bolt.lightning.blue` → `arrow.lightning.blue` → `lightning_bolt.narrow.blue`. That pick also accepts beam geometry. Free now gets `lightning_bolt.narrow.blue`. |
| Scalding Gauntlets (base) | Implemented | Its `fire` trait now adds a fire flourish (`impact.fire.01.orange`). The contact also takes the orange unarmed strike, like the Greater/Major/True versions. |
| Four-Ways Dogslicer | Implemented | Its cold, electricity and fire traits add three flourishes: frost, lightning_ball and impact.fire. |
| Blade of Four Energies (+Greater) | Implemented | A themed flavor adds fire, cold and electricity flourishes, capped at 3. Acid was left out because 3 is the cap. |
| Four-Tiger Blade | Implemented (adapted) | Added a `light flourish` (`impact.007.yellow`) for its "trail of light". It is not divine_smite, because the item deals no spirit damage and has no holy trait. |
| Azarim | Implemented | Its holy trait adds a `holy flourish` (`divine_smite.target.yellowwhite`, Free `blueyellow`). |
| Guiding Star (melee/thrown) | Implemented | Its holy trait adds a holy flourish to both modes. |
| Guiding Starknife (melee/thrown) | Implemented (adapted) | This version has only the divine trait (no holy), so it gets a starlight `light flourish` instead. |
| Whips (Alghollthu, Sugi, Giant Squid Lash, Lady's Spiral, etc.) | Implemented | The whip family now uses the neutral `melee_generic.slashing.one_handed` (Free `slash.01.orange`), keeping the existing 25° whip rotation. Only cold/void/force/mental whips keep the colored `slash.01` (bluepurple). Crimson Thorn's whip form is an activation, so it was not changed. |
| Hardened Harrow Deck | Implemented | Contact now uses the damage-type generic `melee_generic.piercing.one_handed`. The label "contact contact" is now "Weapon contact". |
| Dragon's Tongue (all) | Implemented | Spears that deal slashing damage now use the glaive family (`glaive.melee.01.white`). |
| Dragonprism Staff | Skipped | No slashing staff asset exists. Its staff swing is fine. |
| Bladed Hoop | Skipped | Low severity. The dagger contact is acceptable, and an axe sweep would misrepresent a hand-held hoop. |
| Granny's Hedge Trimmer | Skipped | The plan itself says no action is needed. |
| Grouped "element trait without finish" sweep | Implemented | This is the systemic `flavor` rule (§3). It covers 120 weapons. |
| Starknife melee/thrown "empty S:" | Stale | Both modes already have dagger contact or throw plus a finish. I kept the dagger throw: a four-pointed starknife is not a ring chakram. |
| Wish Knife "empty S:" | Stale | Already has `dagger.melee.02.white` contact. |
| Unholy Water | Implemented | Flight is now `throwable.throw.flask.01.black` (Free `flask.01.orange`). Its spirit damage with the unholy trait becomes the `unholy` element. The finish is `divine_smite.target.dark_purple` (Free: grey smoke tinted #7a3f9e). The same rule fixes Hell Staff and unholy-rune weapons. |
| Holy Water | Implemented (bonus) | Flight is now `throwable.throw.flask.01.white` instead of `hammer.throw`. |
| Tamchal Chakram melee | Implemented | Uses the new melee chakram family `melee_attack.01.chakram` (in both editions). |
| Stiletto Pen melee | Implemented | Uses `melee_generic.piercing.one_handed`. |
| Stiletto Pen thrown | Implemented | The dart family now uses `dart.01.throw.physical.white` (Free `dagger.throw.01.white`). |
| Skysunder | Implemented | Its electricity trait adds an electricity flourish (`lightning_ball.blue`). |
| Star Grenade (4) | Skipped | `breath_weapons.fire.line` is a caster-anchored cone/line asset. The weapon pipeline has no target-anchored template stage, and adding one is shared-model work. The existing crossed, squashed bursts already draw two perpendicular lines, and the note tells the GM to place the real lines. |
| Sulfur Bomb (4) | Implemented | Payload secondary `acid` adds an `acid additional finish` (`liquid.splash.green`, Free blue tinted #b8e580) after the gas puff. |
| Staff of Air / Tempest | Implemented | Electricity flourish. |
| Staff of Fire | Implemented | Fire flourish. The test rule that the Strike element stays physical still holds. |
| Timeflaying Blade | Skipped | The acid is correct: the description says "greater corrosive" and the item has a corrosive rune. |
| Twigjack Sack (4) | Implemented | One-shot impact stages over 4.65 s are now cut with `clipEnd:4050`, `duration:4650` and a 600 ms fade. This rule also cuts the 5.4 s flask fracture and the 6.5 s frost impact. |
| Tentacle Cannon | Skipped | Optional, low severity. |
| Spark Dancer | Skipped | The plan calls the current version an acceptable simplification. |
| Part A: ~70 "Staff of X" | Implemented | Themed flourishes by staff: Fire→fire; Air/Tempest→electricity; Atmospheric/Desert Winds→air (wind_lines); Water/Fluid Form→water (`water_splash.circle.01.blue`); Earth→`impact.ground_crack.01.orange`; Encroaching Shadows→`smoke.puff.centered.dark_black`; the Dead/Zombie→void; Healing→vitality; Boreal→cold; Corrosive→acid; Poisoner's→poison; Illumination→light; Verdant/Birch/Arboreal/Twining/Nature's→plant (`swirling_leaves.outburst.01.greenorange`, Free `wind_lines.01.leaves.01.green`); Mentalist's→mental; Arcane Might/Power/Magi→force. Staves with no element in their fiction keep the bare contact. |
| Part A: hammer.throw misuse | Implemented | New thrown families: vial (flask), dart/pen (dart), chakram (Chakri, Bladed Diabolo), bola (`mace.throw` then `slingshot`), hook for piercing or slashing flails such as Combat Grapnel, Tidal Fishhook and Flying Talon (`kunai.throw`), weight for blunt flails (`mace.throw`), thrown club (`mace.throw`). Only Light Hammer and Cayden's Tankard (light-hammer base) still use `hammer.throw`. Free has none of these projectiles, so it still falls back to `dagger.throw.01.white`. |

### 3. Systemic changes
- **`tools/weapon-semantics.mjs`**
  - New `mode.flavor`: up to 3 visual-only flourishes. They come from the item's elemental, sanctified and material traits (fire, cold, electricity, acid, sonic, holy, unholy, air, earth, water, wood/plant, shadow, light) and from the `themedFlavors` slug table (staves, Four-Tiger, Guiding Starknife, the four-energy blades).
  - Flourishes never change `mode.element`. Poison, void, mental and force traits are not flourished, because they usually mark activations.
  - Each affected mode's rationale says that its flourish is not Strike damage.
  - Spirit damage on an unholy-trait item becomes the `unholy` element.
  - The unholy rune maps to `unholy`. Before, the rune name "unholy" matched `holy` and became spirit.
  - Slashing spears use the glaive family. A melee chakram/chakri uses the chakram family.
  - The thrown-family split described in §2 (vial, dart, chakram, bola, hook, weight, club).
  - Sulfur bomb gets the acid secondary.
- **`tools/weapon-asset-selection.mjs`**
  - `pick` accepts a geometry array.
  - Generic `contact` resolves by damage type (`melee_generic.<damage>`).
  - New melee chakram family, whip roots, flight roots for the new thrown families, and vial colors (black for unholy).
  - The Drake Rifle electricity chain described in §2.
  - Flavor slots `flavor1..3` get their own picks.
  - The hue for the contact slot follows the first flavor when the damage is physical.
- **`scripts/weapon-payloads.mjs`**: new accents, colors and palettes for `unholy`, `holy`, `light`, `air`, `earth`, `water`, `plant` and `shadow`.
- **`scripts/weapon-choreography.mjs`**
  - `<flavor> flourish` impact stages start at contact +220 ms, then +110 ms for each further flourish, at scale 0.8 and opacity 0.9.
  - One-shot impacts are capped at about 4.65 s using `clipEnd`.
  - The generic contact label reads "Weapon contact".

### 4. Tests changed
None. The existing pin "Staff of Fire element stays physical" still holds, because the flourishes are kept separate from damage.

### 5. Requests / notes for other owners
- **SF2e and D&D builders** call `analyzeWeapon` and `selectWeaponMedia`. When the lead rebuilds them:
  - SF2e weapons with fire, electricity or other element traits will gain flourish stages.
  - Generic `contact` melee will follow the damage type when the caller passes `damage`.
  - Whips will become the neutral slash.
  - I did not rebuild those catalogs.
- **Shared model**: a target-anchored line-template stage would allow real Star Grenade lines. This would go in `scripts/model.mjs` and the template anchoring.
- **Unarmed and Fist contact**: when no flavor applies it still resolves to `unarmed_strike.physical.01.blue`, because that family has no white variant. A color-affinity rule in `tools/color-affinity.mjs` could prefer `orange` or `yellow` for mundane fists.

---

## states — PF2e conditions & effects (Part B parts 1–2, A6 remainder)

### 1. Summary
- Rows in the two tables: 64 (some rows name several entries).
- Implemented: 50. Already fixed by an earlier commit: 19 (the Free purple/green-to-blue tint rows, which are now verified). Skipped or no fix needed: 9 (5 were marked OK/n/a in the plan, 4 judged low value or not supported).
- Rebuilt with `node tools/build-pf2e-state-catalog.mjs`. Exit 0, `coverage.missing` is empty in both editions, and the aura duplicate check passes.
- Footprints: ran `node tools/audit-media-footprints.mjs --all-systems --fetch-missing-free --write`. Result: 0 missing; measured 1666 files.
  - I added `--all-systems` on purpose. Without it the write would rebuild `MEDIA_FOOTPRINTS` with no D&D files.
  - SF2e is never part of this audit.
  - This run reflects the catalogs as they were at that moment. If another domain adds keys later, it should re-run the audit.
- Tests: `tests/state-*.test.mjs`, `persistent-states`, `condition-*`, `aura-variety`, `animation-scaling` → 72/72 pass. That includes 4 new tests.
- A script check (`scratchpad/states-tintcheck.mjs`) found 0 stages out of 6934 that swap color without a tint. It covers every condition, damage variant, effect and element variant, in both editions.

### 2. Per-row table
| Entry | Action | Detail |
|---|---|---|
| Clumsy | implemented | Wobbling `particles.swirl` orange (±14° rotation) over the tilting orange rim. |
| Encumbered | implemented | Slow grey `aura_themed…metal` orbit squashed flat at the feet ("heavy load") plus the flattened orange rim. |
| Enfeebled | implemented | Red `particles.inward` (strength draining) over the drooping grey rim. No runes or curse art, as the test requires. |
| Fatigued | implemented | Small fading `sleep.symbol.dark_pink`, using the measured anchor. Unconscious keeps the full blue symbol. |
| Immobilized | implemented | `markers.chain.square.loop.01` grey, shackled flat at the feet. Free uses `chain.standard`, tinted. Theme is `chains`. |
| Paralyzed | implemented | Near-frozen `energy_field.02.above` dome (playbackRate .2) plus the white rim. No chains or ice (the test forbids them). |
| Hostile | implemented | Adds a `hunters_mark.loop` red targeting sigil over the dark red rim. |
| Dazzled until end of your next turn | implemented | Any "Effect: X until end of your next turn" whose X is a core condition now uses that condition's design (`CONDITION_PLANS`). |
| Off-Guard until end of your next turn | implemented | Same rule as above: `markers.shield_cracked`. |
| Deafened until end of your next turn | n/a (now consistent) | Also reuses the parent condition: grey `markers.mute`. Before it was dark_red mute. |
| Energy Shield Tunic / (Greater) | implemented | New `elementVariants` resolved from `rulesSelections.resistance`: fire → `shield_themed.above.fire`, cold → `shield_themed.above.ice`, acid → green / electricity → yellow / sonic → tinted `shield.01.loop`. Until a choice is known it shows a neutral white `choice-ward`. |
| Dragon Breath Scale | implemented | Neutral `elemental` refraction by default. Variants follow the chosen damage type (fire flames, force/mental/poison/spirit cues, physical neutral). |
| Energized Cartridge | implemented | Elemental default, plus acid/cold/electricity/fire variants. |
| Erraticannon / (Extra) | implemented | Reviewed as `elemental`: a multicolored `condition.boon.02` refraction, since the type is rolled for each attack. |
| Alchemical Strike | implemented | Elemental default plus variants. |
| Fulminating Shot | implemented | Elemental default plus variants. |
| Exploding Bullet | implemented | Elemental default, plus fire and sonic variants. |
| Elemental Assault | implemented | Elemental default, plus electricity/bludgeoning/fire/cold variants. |
| Energy Mutagen (4 grades) | implemented | `choice-ward` (it resists the attuned type), with per-type variants. |
| A Little Bird Told Me... | implemented | Now `flight`, through review plus the BattleForm fly rule. `swirling_feathers` has no loop, so it uses the existing spinning border, tinted. |
| Grit (Stage 1/2/3) | partial | Stage 1 and 2 now share one boon key, because numbered variants are picked per category. Stage 3 is purely a penalty (−4 Perception), so the penalty look is correct. I did not force one escalating family. |
| Dust Eternal / Fetid Fumes / Aura of Smoke / Noxious Smog / Mist Cloud / Clinging Smoke | implemented (5/6) | Fog color now follows the text: dust/sand → `ambient_fog…orangeyellow`, fetid/noxious/toxic/smog → `…greenyellow`, otherwise white tinted grey. Clinging Smoke stays a Speed-penalty `slow` marker, by the rule-based penalty rule. |
| Fuming Cloak | n/a | Marked as a good example. |
| Boulderhead Bock | implemented | Reviewed as the new `mindward` theme: golden `markers.runes02.yellow`, a protective ward rather than a stun marker. |
| Hexing Jar / Hexwise Banner / Liberated Mind | implemented | Same `mindward` gold runes, distinct from curse runes. |
| Humanoid Form | implemented | New `transform` theme: `magic_signs.circle.02.transmutation.loop.yellow` under the token. Also used for Shifting Form. |
| Elemental Motion | implemented | Elemental default. Variants: air → `particles.swirl` white, water → bubble, earth/metal → metal orbit, fire, wood → leaves. The runtime flag is the PF2e default dromedary slug, with a fallback that scans all selections. |
| Elemental Betrayal | implemented | Elemental default plus per-element variants. No fire default. |
| Chromatic Armor | implemented (ward) / skipped (light) | 3 chosen resistances → `prismatic-ward` (multicolored). I did not add a second light-marker stage: it would change single-stage presentation, and PF2e's TokenLight already sheds the light. |
| Demon Form (all) | implemented | BattleForm rule: demon/daemon forms → new `fiend` theme (`fumes.04.loop.black`; Free uses grey, tinted). This includes the flying Vrock and Nabasu. |
| Demon Form (Vrock) | implemented | `fiend` (it was a metal aura). |
| Devil Form (Barbazu / Osyluth) | implemented | Every Devil Form variant → `fire`, matching base Devil Form and Erinys. Flying variants included. |
| Daemon Form (Piscodaemon) | implemented | `water` bubble. |
| Dinosaur Form (all 6) | implemented | All are `transform`, so one look. |
| Mantle of the Melting Heart | skipped | Low priority polish; it is still in the reviewed `stone` group. |
| Ouroboros Buckles (Swarm of Snakes) | implemented | BattleForm → `transform` (no snake art exists). It is no longer a generic shield. |
| Potion of Acid / Electricity Resistance | already fixed | Free `shield.01.loop.blue` already carried the green/yellow tint through `markerTint`. Verified. |
| Potion of Fire / Cold Resistance (bonus) | implemented | Now `shield_themed.above.fire` / `.ice`. |
| Potion of Sonic Resistance | n/a | Marked OK. |
| Resolute Mind Wrap / Salve of Mental Pattern | already fixed | Free substitution is tinted purple. |
| Death Ward | already fixed | Tinted purple. |
| Void Shroud / Void Siphon / Void Tendrils / Preserved Moonflower / Shadow Rapier / Shadow Sheath Weapon / Thirsty Chalice / Gray Shadow / Touch of the Void / Clinging Shadows Stance | already fixed | Free `aura_themed…cold.blue` or curse.red carries the void-purple / penalty tint. 0 untinted substitutions in the check. |
| Acid Grip / Vitriolic Miasma / Pickled Demon Tongue / Slime Whip / Corrosive Body | already fixed | Free blue bubble tinted green. Acid Grip is a Speed-penalty `slow` marker, which is correct for its rules. |
| Masquerade of Seasons Stance | implemented | `choice-ward` variants: water → blue shield, fire → fire shield, void → purple shield, cold → ice shield. |
| Thermal Nimbus (Stance / Effect) | implemented | The effect resolves the cold/fire choice from the origin's `kineticist.thermalNimbus` (fire → `shield_themed.above.fire`, cold → `.ice`). The stance aura already branches through `auraDesign` variants. |
| Turn Aside Ambient Magic | implemented | `choice-ward` plus per-type variants. |
| Energy Aegis | implemented | 8 resisted types → `prismatic-ward`. |
| Prismatic Armor | implemented | 7 types → `prismatic-ward`, the same key as Prismatic Shield. |
| Cobra / Asp Stance | implemented | Reviewed as `poison`: `markers.poison.dark_green`. This includes Cobra Envenom, Bite of the Asp and Asp Stance (Irabel). |
| Crane / Gorilla / Tiger Stance | implemented | Crane → `air` swirl. Tiger → `claws.200px.bright_orange` (new `beast` theme, presented at opacity .5 and scale 1.2). Gorilla, Gorilla Pound, Dragon and Rushing Goat → `rage` orbit. Also covered: Wolf → `bite.200px.grey`, Claw and Talon → claws, Peafowl / Wild Winds / Air Shroud → air, Jellyfish → water. |
| Flood / Waterfowl / Jellyfish / Reflective Ripple | partial | Jellyfish moved from a green boon to water. The others are left as acceptable (low priority). |
| Mirror Image | skipped | The plan calls the current choice defensible, and no duplication loop exists. |
| Rowan Rifle / Fire Shield | n/a | Marked as good examples. |

### 3. Systemic changes (A6 remainder)
- **Deterministic numbered variants** (`selectStateMedia`): the pick is now `hash(theme:color)`, no longer per-entry. Every boon, neutral, penalty and defense entry now shares one key, which a test checks.
  - When the requested color is missing, the pick falls back to `.white` art, which is tinted. Before it was an arbitrary hue (fog had become purplered).
  - `dark_<color>` keys now count as the requested hue. Example: `markers.poison.dark_green` for green.
- **AC grammar:** a new `defense` theme (`markers.shield.green`) covers every effect whose numeric modifiers are all positive AC. 142 entries, which used to be split between shield and boon.
- **Resistance / immunity grammar** (`elementDesign`):
  - A single damage type uses that type's ward: fire → `shield_themed.above.fire`, cold → `.ice`, others → `shield.01.loop` in that color or tinted.
  - 3 or more types, or several chosen ones → `prismatic-ward`.
  - `all-damage` → a white ward.
  - A chosen type → `choice-ward` plus `elementVariants`.
  - This applies to `shield`, `boon`, `neutral` and `defense` themes. It replaces the build-local "single Resistance" block.
- **Chosen-element effects:** an element/damage-type ChoiceSet on a fire, cold, neutral, boon or similar theme gives a neutral `elemental` look by default, plus per-choice variants (66 entries have variants).
  - At runtime the choice comes from `item.flags.system.rulesSelections[flag]` or the origin flag path, through the new `stateElement()` in `scripts/state-catalog.mjs`.
  - `stateRecipe(entry,{element})` merges in the chosen variant.
- **Battle forms** (BattleForm rule):
  - A named element sets the look (this fixes Element Embodied Air/Earth, which showed **fire**).
  - Devil → fire, demon/daemon → fiend, Piscodaemon → water.
  - A fly Speed → flight (this fixes Aerial Form, which was poison).
  - Other forms → transform. Animal / Plant / Untamed / Ferrous / Angel forms keep their existing looks.
- **Restraints:** a GrantItem of grabbed, restrained or immobilized → `markers.chain`. Net, vine, glue, snare or hair names → web. The name pattern now includes chain, manacle, shackle and fetter (this fixes Impaling Chain).
- **Free tint (A2 for states):** this was already done through `markerTint` and layer `colorSubstitution`. I verified it across all 6934 stages. Element variants carry `wardColor`/`wardTint` or `color`, so they tint the same way.
- New profiles: defense, ice-ward, choice-ward, elemental, air, beast, bite, transform, fiend, mindward.
- `state-presentation`: added claws/bite (quiet field) and transmutation circle (below the token).

### 4. Tests changed
- `tests/state-polarity.test.mjs`: added 4 tests and kept all existing assertions:
  - timed condition variants reuse the parent's assets;
  - the 7 conditions each have a layer that is not a plain ring, and Immobilized uses chains;
  - chosen-element effects never default to fire, and `resolveStateRecipe` resolves fire / cold / acid for Energy Shield Tunic and water for Elemental Motion;
  - fire/cold potions use `shield_themed`, and the boon / neutral / penalty / defense themes each use exactly one key.

### 5. Requests for files I don't own
- `tools/catalog-audit-entries.mjs`: add `PF2E_EFFECTS.flatMap(item=>Object.keys(item.elementVariants??{}).map(element=>({domain:'elementVariant',item,mode:element,build:o=>stateRecipe(item,{element,aura:null,catalog:o?.catalog})})))` so footprint, timing and alpha audits cover element variants. They are all measured today; I checked by script.
- `tools/build-sf2e-catalog.mjs` (lead): `classify()` can now return `color`/`hex`. Pass them through as `selectStateMedia(databases,design.theme,slug,design.color)` and `color:design.hex??profile.hex`. Optionally apply `elementDesign()` the way the PF2e builder does. New themes exist in `profiles` (transform, fiend, defense, …), so SF2e builds as it is. **SF2e state recipes change when you rebuild**, because selection is now per category with a white fallback.
- `scripts/sf2e-states.mjs` / `scripts/sf2e-catalog.mjs`: pass `element:stateElement(entry.state,item)` into `stateRecipe` so SF2e effects shared with PF2e resolve the chosen element.
- `scripts/state-catalog-ui.mjs` / `scripts/workspace.mjs` (optional): offer an element picker for entries with `elementVariants`, like the existing damage-type picker, so previews can show each variant.
- `tools/audit-media-footprints.mjs` header and the brief: the documented command needs `--all-systems`, or the write drops D&D measurements.

---

## SF2e fix pass (tag: sf2e)

Only file edited: `tools/build-sf2e-catalog.mjs`. Rebuilt with `node tools/build-sf2e-catalog.mjs`: 0 issues, counts unchanged (432/858/192/46/400). `node --test tests/sf2e-catalog.test.mjs`: 9 out of 9 pass, with no test changes.

### 1. Summary counts
- Part B SF2e rows (parts 1 and 2): 74 rows. 61 implemented, 8 skipped or kept on purpose, 5 already fixed or partly fixed upstream.
- Part A SF2e items: A3 motif review done (2 refinements). A5 "Activity starts" cluster split by fiction. A7 sci-fi delivery and families done. A8 SF items (divine_smite, toll_the_dead, music_notations) done.
- Coordinator request: SF2e now passes `traits` and `direction` to `resolveFeatMedia`, in the same shape as `build-pf2e-feat-catalog.mjs`. Rebuilt afterwards.

### 2. Per-row table
| Entry | Action | Detail |
|---|---|---|
| 360 No Scope | already fixed | Upstream already gives `bullet.01.orange` with a mundane hit. |
| Fish in a Barrel, Opportune Retort, Overwatch, Ready Arms!, Acquire Asset | implemented | Firearm motif: `bullet.01.orange` plus `impact.005.white`/`.orange`. Orange, not purple (A1 mundane-gun rule). |
| Concentrated Shot, Death Blossom, Run Hot, Fan the Hammer, Come Get Some!, Hybrid Technique, Light 'Em Up, Shell Shower, Shot on the Run, Shoving Shot, plus Area Fire, Bullet Hell, Terror-Forming, Fog of War | implemented | Burst: `bullet.03.orange` (Patreon), `bullet.02.orange` (Free), plus a mundane hit. |
| Rocket Jump | implemented | Burst bullets plus `explosion.01.orange` hit. |
| Shobhad Special, Longrifle Reload | implemented | `bullet.Snipe.orange` (Free falls back to `bullet.01.orange`). |
| Line Up the Shot | implemented | Aim only; no shot is fired. Now a preparation motif: glint plus `hunters_mark.pulse.01.green`. |
| Envenom Magazine (+ Apply Atraxid Venom) | implemented differently | Spitting venom into a magazine is not a shot. Now a preparation motif: `liquid.splash.green` / `particles.outward.greenyellow` plus `particles.swirl.greenyellow`. |
| Hampering Flare | implemented | Ray motif: `markers.light` cast, `energy_beam.normal.yellow.01` (Free: `lasershot.orange`), `impact.006.yellow`. |
| Constellation Vortex | implemented | Travel dropped. whirlwindStrike: `melee_generic.whirlwind.01.orange` around the source, `twinkling_stars.points07.white` on adjacent creatures, and a `hovering_laserweapon.one_handed.01.yellow` aura for the manifested solar weapon. |
| Gravity Grasp, Gravity Tether | implemented | `energy_strands.in.purple.01` pull plus `energy_strands.complete.dark_purple.01` (Free: `in.green` / `complete.blue`). |
| Black Hole | implemented | Same inward-strands hit and aura. |
| Hostile Gravity | implemented | Gravity cast plus `impact.ground_crack.01.purple` (Free: `.orange`). No divine art. |
| Apocalypse Burst | implemented | elementCone with `cast_generic.fire.01.orange` and `fireball.explosion.orange`, matching Fire Breath. |
| Draconic Breath, Dragonkin Breath, Dragon Breath (Dragon Form) | partial | Toll bell and divine smite removed; now elementCone with neutral `explosion.03.blueyellow`. The element is chosen at play time and feats get no damage-type variant, so a per-element impact isn't possible in a static recipe. |
| Eat It! | implemented | `liquid.blob.green` plus green particles; no darkness. |
| Bioluminescence (Shirren) | implemented | `markers.light.complete.yellow` plus `dancing_light.yellow`. |
| Camera Blur, Encode Presence (+ Cloaking Field) | implemented | Concealment motif: `markers_scifi` "glitch" cast plus `shimmer.01.blue`. |
| Nanite Arena | implemented | Guard motif: `markers_scifi.001.complete.003` plus `energy_field.02.above.blue`. Fantasy rune and stray beam removed. |
| Overwhelming Shot | implemented | Now a standard shot: glint aim, orange bullet, mundane hit. Rune and shield arrival removed. |
| Digestive Spray, Gunk Spray, Nanite Form Strike (+ Spew Acidic Bile, Volosian Spit) | implemented differently | Rule for acid-theme SF feats: the Free `liquid.blob.blue` fallback becomes `particles.outward.greenyellow.01.01` (green is a native Free key). No tint added, because a stage tint would also recolor the Patreon key. |
| Discharge (spell) | already fixed | The A3 motif `stormTouch` already plays `static_electricity`. |
| Instant Virus | kept | `stormTouch` gives purple static, which reads as a corrupting electrical virus. Acceptable. |
| Combat Hack | implemented | Covered by the tech branch: `markers_scifi` cast and aura. |
| Awaken Computer | implemented | Rule for tech-text spells: `bardic_inspiration`, `magic_signs`, `detect_magic`, `cast_shape` and `sleep` slots become `markers_scifi`. The aura is now a sci-fi marker. |
| Holographic Memory | implemented | Same rule: `markers_scifi` cast and finish, plus the particle burst. |
| Spiritual Armament | skipped | The plan row itself calls it acceptable. |
| Puff Up | implemented | Glint plus mundane impact; no divine or sleep art. |
| Instinctive Hold / grapple family | skipped | The plan row says it is acceptable as a neutral binding cue. |
| Plasma Cannon, Plasma Caster, Starfall Pistol (both lines) | implemented | Plasma flight is now `fire_bolt.orange` for both editions; `eldritch_blast` removed. |
| Meme Cannon (both lines) | implemented | Flight: `spell_projectile.sound.01.pinkteal` (Free: `energy_beam.normal.bluepink.02`). Emitter: `soundwave.01.purple`. Finish: `dizzy_stars.200px.purple` (senses overloaded, nonlethal). `soundwave.*` is 600x600 radial footage, not a projectile, so it is used at the emitter and the target, not for flight. |
| Acid Dart Rifle | implemented | `dart.01.throw.physical.white` (Free: `dagger.throw.01.white`). The existing acid splash finish stays. |
| Reality Ripper | implemented differently | `disintegrate.green` beam. The text says it "tears apart matter by destroying its bindings to reality", which a dart doesn't show. |
| Grenade Launcher (all 4 grades) | implemented | Source has `range:null`. The range is now read from the description (280–490 ft) and the launcher is analysed as a bomb. Result: ranged firearm use with a muzzle flash, `throwable.throw.bomb.01` flight and `explosion.shrapnel.bomb.01.black`. A new burst-10 Area Fire variant is added because "Activate 2 Area Fire" previously had no template variant. |
| Szynegation Grenade (all 8) | implemented | Treated as a grenade by trait, since group is null on 3 grades and range is null on all. Now has a thrown `throwable.throw.bomb.01.green` flight plus acid splash and residue. Area Fire flies into the burst. |
| Skyfire Sword | implemented | `sword.melee.fire.orange` (Free: `sword.melee.01.white`), with family `sword`. |
| Zero Knife, Force Needle | implemented | `dagger.melee.02.white`, with family `dagger`. |
| Disintegration Lash | partial | Contact is now `melee_attack.01.flail.01` (whip, family `whip`). The `disintegrate.green` finish was not used: it is beam footage, which can't be placed as a point finish. The acid splash stays. |
| Polyglove / Shock Pad / Thermal Dynafan | kept | Per the plan row. |
| Boom Pistol, Screamer (both lines) | implemented | Sonic: flight `spell_projectile.sound.01.pinkteal` (Free: `energy_beam.normal.blue.01`), emitter `soundwave.01.blue` instead of a yellow muzzle flash, finish `soundwave.01.blue`. |
| Replica Zo! Microphone (both lines) | implemented | As above, with `soundwave.01.purple` (Free: blue). |
| Sonic Rifle, Streetsweeper | implemented | As above, with finish `soundwave.02.blue`. |
| Fangblade | implemented | `melee_attack.01.sword_chainsaw.01` (Free keeps its old fallback). |
| Bone Scepter | implemented | Element set to void. Finish is `toll_the_dead.purple.skull_smoke` (Free: `.green.skull_smoke`) instead of frost. |
| Persistent Damage piercing/slashing | skipped | This is the shared PF2e condition design, and the two are already different shapes (narrow vertical vs. 45-degree flattened). It belongs to the PF2e state owner. |
| Effect: Skyfire Wings (4 ranks) | implemented | Theme set to fire, which gives `flames.04.loop.orange` (flame presentation). |
| Effect: Jetpack / Atmospheric Flight / etc. | skipped | The flight-theme marker comes from shared `twoe-state-design` profiles (A6 marker grammar, another owner). SF picks it up on rebuild. |
| Effect: debuff rings | skipped | A6 valence colour is systemic and lives in state design (another owner). |
| Extra (A7): plasma/laser melee | implemented | `lasersword.melee.*` (Patreon) for Plasma Sword (orange), Quantum Reaver (purple), Phase Cutlass (dark_white); Free keeps its sword fallbacks. These are 800x600 melee swing films with radial geometry. Solarian solar-weapon Strikes get `lasersword.melee.yellow.01` first in their melee contact (5 feats). |
| Extra (A7): missiles | implemented | Gyrojet Pistol, Reaction Breacher, Stellar Cannon fly `ranged_missile.missile_only.001.orangeyellow` (Free: `bullet.02.orange`). |
| Extra: Cannonball | implemented | Arrow replaced with `boulder.toss.02.01.stone.brown`, the closest round thrown body. No skittermander art exists. |
| Extra: Wormhole, Star Brand, Corona, Evasive Jet, Don't Touch That!, Stunt, Administer First Aid, Kiss it Better, Akashic Sync, Center Your Emotions, Cheer Up, Self Soothe | implemented | Darkness and music-note art replaced: portals; light; stellar field; jet puff; warning chevrons; healing; telepathy; comfort sparkles. Cheer Up and Self Soothe no longer use `toll_the_dead`. |

### 3. Systemic changes (all in `build-sf2e-catalog.mjs`, SF-native entries only, `!entry.shared`)
- **Feat post-processor `sfFeatMedia`.** Runs after `resolveFeatMedia`, before timing, framing and recipes. Contents:
  - an explicit slug table (`SF2E_FEAT_MEDIA`);
  - "Activity starts" utility cues branched by fiction: tech → `markers_scifi`, gravity → inward `energy_strands`, healing (real HP or temp HP only) → `healing_generic`, telepathy → eyes plus strands, light → light marker plus `dancing_light`. Fortune and reroll feats keep the stars. Result: SF native utility filler went from 276 to 219; 115 feats now have fiction cues;
  - gun rule: `ranged` / `firearm` / `throughShot` / `mixedStrike` feats with arrow or purple/blue bullets get orange bullets (burst for Area/Auto-Fire) and a mundane hit, and the motif becomes `firearm` so the firearm sound profile applies;
  - `divine_smite` without holy text → mundane hit, or gravity strands when the text is about gravity. SF native feats with `divine_smite`: 34 before, 0 after;
  - `toll_the_dead` on comforting or non-dread text → sparkles;
  - `music_notations` on non-music "inspiration" feats → the matching cue.
- **Weapon post-processor.** `SF2E_WEAPON_MEDIA` by slug and mode, plus a default for the sonic group. Flight lists are replaced. Other slots are prepended, so each edition keeps its old fallback. Family and element overrides are supported (element also resets `elements`, to avoid empty secondary finishes). Grenade and launcher range is inferred. The plasma root is now `fire_bolt.orange`.
- **Spells.**
  - SF-native spells whose text is about tech: rune, detect-magic, bardic, cast_shape and sleep slots become `markers_scifi` (loop slots use a loop key).
  - Non-music spells with sheet-music slots → `soundwave.02.blue` (Sonic Scream).
  - Reviewed the 89 A3 motifs against their descriptions; the choices hold. Improvements came through these rules (Skim Data, Measure-style rune scans on tech spells, Awaken Computer, Holographic Memory, Sonic Scream).
- **resolveFeatMedia context (coordinator request).** Now passes `direction` and `traits` like the PF2e builder, so the new trait-gated feat rules apply to SF2e. SF overrides still run afterwards and take precedence.
- Every introduced key was checked against both inventories as an exact key: Patreon-first chains, each with a Free key or an existing fallback.

### 4. Tests
No test changes. `tests/sf2e-catalog.test.mjs` passes 9 out of 9; counts and the 0-issues audit are unchanged.

### 5. Requests for files I don't own
- `twoe-state-design` (A6): flight-speed effects (Jetpack, Atmospheric Flight, Hull Hop, Gift of Gadrathar, Interstellar Raft, Manifest Energy Wings) still use spinning rings. Debuff-only SF effects share buff-blue rings. SF2e inherits whatever the state grammar does.
- `feat-choreography` / `feat-semantics`: the `elementCone` motif only places target accents. A real cone template stage for breath feats would help Fire Breath, Apocalypse Burst and the dragon breaths. Feats also have no damage-type variants, so chosen-element breaths can't be coloured.
- `pf2e-condition-designs`: Persistent Damage piercing vs. slashing differ only by transform. Distinct marker art would need to come from that owner.

---

## D&D 5e — animation fix pass (tag: dnd5e)

Files edited: `tools/dnd5e-directions.mjs`, `tools/build-dnd5e-catalog.mjs`, `tests/dnd5e-catalog.test.mjs`.
Rebuilt: `data/dnd5e-catalog.mjs` (`node tools/build-dnd5e-catalog.mjs`; 4,699 variants, 2,766 changed vs. HEAD). `data/dnd5e-native-directions.json` and its builder were **not** touched (the builder overwrites the JSON and hard-checks a 184-row inventory; every fix was done as a post-review override in `dnd5e-directions.mjs`).
Verification: `node --test tests/dnd5e-*.test.mjs` → 25/25 pass. `node tools/verify-dnd5e-catalog.mjs` → `issues: []`, cutoffs 0 (it rewrote `data/dnd5e-catalog-validation.json`).

### 1. Summary counts (≈201 Part B rows in the six D&D sections)

| | Rows |
|---|---:|
| Implemented (this pass) | ~150 |
| Already fixed before this pass (verified) | ~25 |
| Skipped (with reason) | ~26 |

Already fixed and verified, not redone: Daylight ×3, Faerie Fire, lamps/lanterns/torch (extended to the 2024 names "Lantern, Hooded/Bullseye", Tinderbox), Ioun Stones ×16, caltrops, ball bearings, Flurry of Blows, Sneak Attack, Boulder Toss (now also a native boulder flight before the area), Hunter's Defense tints, Storm of Vengeance Hailstones (already ice_spikes), earth `ground_cracks` now orange (Flesh to Stone, Earthquake, Move Earth, Meld into Stone, Creation, Passwall cast), Horde Breaker/Colossus Slayer/Foe Slayer fumes (already gone), Channel Divinity: Sacred Weapon (already dancing_light), Comet Card / Brief Enfeeblement / Enervated / Withered (already off the sphere), Transferred AC Bonus, Burning family (already one orange fire_ring), Fire Giant Strength.

### 2. Per-row table

### D&D 5e spells & features (part 1)
| Entry | Action | Detail |
|---|---|---|
| Daylight ×3 | already fixed | divine_smite.caster + markers.light |
| Bestow Curse (2024 ×4, 2014) | implemented | theme `curse`; aura/hit `condition.curse` sigil; no void sphere, no death bell |
| Mending 2014/2024 | implemented | transform theme, small sparkle (`swirling_sparkles`/glint) instead of the evocation circle |
| Modify Memory 2014/2024 | implemented | enchantment school → mind; "Charmed" → `impact_themed.heart`/`markers.heart` (was leaves / acid fumes) |
| Find Familiar 2014 (+ Pact of the Chain "Find Familiar") | implemented | summon theme (conjuration circle), matches 2024 |
| Find Steed 2014 | already fixed | conjuration circle in both editions |
| Guardian of Faith [Summon] | implemented | conjuration-circle cast + dancing_light (2014 and 2024 summon) |
| Insect Plague ×3 | implemented | poison theme: `fumes.toxic` cast, `fog_cloud.02.green` / `whirlwind.green` area, fumes hit |
| Hellish Rebuke 2024 | implemented | `flames.green` (+ tint #62dc85 so Free's orange flames read green) |
| Chromatic Orb 2024 | partial | skull projectile removed (now `magic_missile`); per-choice art needs a runtime damage-type hook the catalog doesn't have |
| Fire Shield ×3 | implemented | theme fire, `shield_themed.above.fire` aura, flame retaliation hit |
| Flesh to Stone / Earthquake / Move Earth / Meld / Passwall / Creation colours | already fixed | orange cracks. Additionally: Passwall 2024 line = tiled grey dust puffs (was fire-breath line); Earthquake/Thunderous Greatclub fissure lines = tiled `ground_cracks` (systemic earth-line rule) |
| Message 2014/2024 | implemented | sonic: `cast_generic.sound` + soft `soundwave` (was ground_cracks) |
| Legend Lore 2014 | implemented | divination (school rule) |
| Polymorph | skipped | plan marks as acceptable placeholder; no per-form art |
| Giant Insect 2014 | implemented | nature theme (swirling leaves) |
| Compulsion ×3 | implemented | enchantment → mind/charm heart (was fire) |
| Contagion 2014 ×3 (+2024) | implemented | `disease` theme (fumes) |
| Glyph of Warding Spell Glyph / Cast | implemented | neutral abjuration glyph (`magic_signs.circle.02.abjuration`) instead of fire/shimmer |
| Darkness | no change | correct as is |
| Divine Word 2014/2024 | implemented | root cause: theme regex `vine` matched "di**vine**" → fixed word boundaries; now light |
| Arcanist's Magic Aura | skipped | low-priority illusion polish |
| Dream 2014 | skipped | low priority; now illusion (school) |
| Guards and Wards 2024 | implemented | abjuration → ward (shield/energy field) |
| Clone 2014/2024 | implemented | transform (growth) instead of void sphere |

### D&D 5e spells & features (part 2)
| Entry | Action | Detail |
|---|---|---|
| Stinking Cloud ×4 | implemented | named entry: fumes cast + `fog_cloud.02.green`, tint #f2e34d (yellow) |
| Private Sanctum 2014/2024 | implemented | abjuration → ward (was teleport, 16 s) |
| Ink Cloud 2014/2024 | implemented | shadow: black `fumes`/`smoke.puff.dark_black` |
| Horrifying Visage | implemented | fear area → `smoke.plumes.01.purple` (systemic fear art) |
| Fetid Cloud 2014 | already fixed | fumes + fog_cloud |
| Storm of Vengeance Hailstones | already fixed | ice_spikes |
| Death Burst 2014 | implemented | void aura is now a small dark puff (systemic) |
| Death Glare 2014/2024 | implemented | `toll_the_dead.purple.bell`, no sphere |
| Deathless Agility 2024 | implemented | no cast, small dark puff |
| Deathless Strike 2024 | implemented | no cast, `impact.004.dark_purple` |
| Vampiric Touch [Cast] 2014 | implemented | small dark puff (systemic void aura) |
| Boulder Toss 2024 | already fixed + improved | boulder.toss flight then area |
| Wall of Ice panels (2014/2024 + feat) | implemented | `ice_spikes.wall.burst` tiled along the line (`areaTiles`) |
| Wall of Stone ×4 | implemented | `falling_rocks.top.1x1.grey` tiled along the line (no fire-breath line) |
| Prismatic Wall colour layers (2014 ×7) | implemented | follow-up hit tinted with the layer's hex |
| Symbol ×14 | implemented | per effect: Fear smoke plumes, Sleep sleep.cloud, Pain toll shockwave, Stunning/Insanity dizzy_stars, Discord sleep.target orange-purple, Hopelessness grey smoke, Death toll skull smoke, Inscribe = abjuration glyph |
| Shillelagh [Spellcasting Attack] | implemented | `impact.004.green` instead of entangle |
| Wish ×6 | implemented | Wealth → gold glint/stars, Restore Health → healing, Resistance → shield (kept), Rewrite Events → time (icosahedron), Stress → void puff, Replicate → conjuration |
| Action Surge 2014/2024 | implemented | mundane preset: no cast, no sound, wind-line flash |
| Indomitable / Giant Killer / Charge / Hooves / Claw / Chomp / Multiattack-type | implemented | mundane rule now drops the "Gather Arcane" cast stage and sound (they already had wind_lines) |
| Horde Breaker / Colossus Slayer / Foe Slayer | already fixed | no fumes |
| Channel Divinity: Sacred Weapon | already fixed | dancing_light |
| Deflect Energy Reduce/Redirect | implemented | Reduce = ward shield, Redirect = force (no acid/heal green) |
| Coven Magic / Divine Aid duplicates | skipped | data-layer duplication of the native pack, not an animation bug (Divine Aid now light via the `vine` fix) |

### D&D 5e spells & features (part 3)
| Entry | Action | Detail |
|---|---|---|
| Web [attack] 2014 | implemented | contact `web.01/web.02` at target, no cast, no skull/ice projectile (no web projectile exists in JB2A) |
| Wall of Ice ×3 feat | implemented | as above; 20 s duration now capped |
| Pursuit / Tree Stride | implemented | one-shot cap → 4 s (was 16.3 s); Tree Stride spell → teleport theme |
| Life Drain 2024 | already fixed | already toll bell (no sphere) |
| Lifedrinker [damage] | implemented | no cast, `impact.004.dark_purple` (chosen-type variant not possible) |
| Necrotic Strike | implemented | no cast, dark impact |
| Overchannel ×2 | implemented | force `particle_burst` |
| Vampire Weakness Running Water / Sunlight | implemented | activity-name theme: water splash / light |
| Troll Spawn | implemented | nature regrowth (swirling leaves) |
| Reaping Scythe | implemented | mundane slashing impact |
| Mockery / Vicious Mockery | implemented | psychic → `dizzy_stars` (systemic mind split) |
| Nightmare | skipped | single activity; sleep art kept (plan: keep for unconscious branch) |
| Pact of the Blade Forge / Spellcasting Attack | implemented | conjuration circle + glint; attack = glint/impact, no sleep art |
| Psychic Drain | implemented | dizzy_stars |
| Repelling Blast | implemented | force particle burst |
| Roar (2014/2024 ×4), First/Second/Third Roar, Moan, Shriek, War Cry | implemented | roar keyword rule: `soundwave` cast/aura, `thunderwave` area (dark_purple when fear); Shriek → sonic |
| Sonic Boom | implemented | `shatter` |
| Vortex ×3 | implemented | soundwave instead of clef (systemic sonic rule); escape check neutral |
| Mimicry | no change | check → neutral glint (acceptable per plan) |
| Petrifying Breath/Gaze, Paralyzing, Repulsion, Weakening, Slowing Breath | implemented | arcana cone kept, tinted grey #9e9e8c / yellow-green #d4e06a / pale #e6eef5 / brown #a8935a / blue-grey #a9c2d6; Petrifying Gaze → earth |
| Shimmering Shield 2024 | implemented | ward shield (temp-HP rule + override) |
| War Cry | implemented | soundwave |
| Relentless Endurance | implemented | no cast, dark-red impact flash |
| Stone's Endurance | implemented | no cast, `shield_themed.above.molten_earth` |
| Legendary Resistance | implemented | cast stage removed (shield aura only) |
| Multiattack / Parry / Uncanny Dodge / Pounce / Trample / Trampling Charge | implemented | no magic circle/cast, no sound (mundane rule) |
| Riposte | implemented | mundane preset (8.2 s cast gone) |
| Quick Grapple Save / Escape | implemented | mundane white impact; escape check neutral |
| Weight of Years | implemented | time (icosahedron), tint #b39b7a |
| Tireless | implemented | nature for both activities |
| Noxious Miasma / Spores / Stench / Toxic Ink | implemented | cast cap 3 s (was 11.18 s) |
| Rage | implemented | blood theme, no cast, red `aura_themed.01.outward` burst |
| Signature Spells | implemented | arcane (no leaves) |
| Wild Companion | implemented | summon + cast cap |
| Sear Undead | implemented | moonbeam capped to 4 s (was 13.3 s) |

### D&D 5e weapons & items (part 1)
| Entry | Action | Detail |
|---|---|---|
| Staff of the Python Transform | implemented | green `smoke.puff` transform |
| Collapsing Roof ×4 | implemented | `falling_rocks` grey, no cast |
| Falling Net triggers | implemented | web, no cast; escape checks neutral |
| Staff of Charming cast | implemented | heart |
| Crystal Ball of Mind Reading | implemented | `eyes.01` (thought kind) |
| Nine Lives Stealer [Save vs Death] | implemented | toll skull smoke / skull icon, no cast |
| Luck Blade ×3 | implemented | gold glint / twinkling stars |
| Vorpal ×4 | implemented | `icon.skull` |
| Giant/Dragon Slayer passive & save lines | implemented | systemic weapon-rider rule: neutral `impact.005/007/009` (no divine_smite / spiritual_weapon) |
| Unarmed Strike Grapple/Shove | implemented | neutral impact (Free falls back to unarmed_strike) |
| Hammer of Thunderbolts activation / Giant's Bane | implemented | static_electricity + lightning_ball; 2014 Hurl Hammer now flies `hammer.throw` (was arrow) |
| Thunderous Greatclub Clap of Thunder | implemented | arcana cone tinted thunder blue (#b9cff5) |
| Staff of Swarming Insects | implemented | poison: fumes + fog cloud / green whirlwind |
| Staff of the Woodlands ×8 | implemented | nature theme; Tree Form `plant_growth`, Barkskin wood aura, Pass without Trace shadowy puff |
| Staff of the Magi | implemented | arcane cast lines, Spell Absorption ward |
| Dancing Greatsword/Longsword/Rapier/Scimitar/Shortsword 2014 | implemented | melee contact = flying `spiritual_weapon.<blade>.01.spectral`, no wielder lunge |
| Gloves of Missile Snaring | implemented | mundane catch flash |
| Gem of Brightness | implemented | light; 3rd command = `breath_weapons02…cone.holy` light cone |
| Ammunition/Arrow/Bolt of Slaying | skipped | plan: acceptable shared signature |
| Figurine of Wondrous Power (2014) | implemented | flying (griffon/owl/raven/fly) → feathers; others → summon circle; Goat of Terror keeps fear |
| Instruments [Play/Improvise] | implemented | check cue = `music_notations` |

### D&D 5e weapons & items (part 2)
| Entry | Action | Detail |
|---|---|---|
| Skull (Deck) | implemented | skull icon / toll skull smoke |
| Rope of Climbing | implemented | neutral `markers.circle_of_stars`, no cast, silent |
| Necklace of Prayer Beads | implemented | Summons → conjuration; Wind Walking → feathers; Blessing/Smiting → light; Curing/Favor → healing; 2024 cast lines light |
| Manual of Golems ×4 | implemented | Clay/Stone earth, Iron metal inward aura, Flesh blood strands |
| Wand of Wonder Fireball / Lightning Bolt / Darkness / Gust of Wind (2014) | implemented | delegated results reuse the named spell's art (`named[activity]` lookup): fireball.explosion, electricity, darkness, wind |
| Wand of Wonder Butterflies (2024) | implemented | `butterflies.complete`; also Heavy Rain water, Grass plant_growth, Colorful Light rainbow moonbeam, Stinking Cloud fumes |
| Lamp/Torch/Lanterns [light] | already fixed | extended to 2024 names; bullseye = light cone |
| Potion/Ring of Resistance | skipped | single activity per item; the damage type is a runtime choice |
| Potion of Giant Strength Cloud/Hill/Storm | implemented | whirlwind / earth / lightning |
| Figurines (part-2 row) | implemented | see above |
| Ivory Goats | implemented | Traveling/Travail/Recall → summon; Terror → fear |
| Ring of X-ray Vision | implemented | `eyes.01` |
| Robe of Eyes | implemented | `eyes.01` |
| Talisman Pure Rebuke / Ultimate End | implemented | sacred_flame / toll_the_dead |
| Rope / Manacles / Hempen & Silk Rope checks | already fixed | neutral check cue (glint); mundane gear rule also removes casts from any non-check activity |
| Lute/Lyre/Horn/… checks | implemented | music_notations |
| Playing Cards / Three-dragon ante | skipped | neutral check cue already; no card sprite in JB2A |
| Robe of Scintillating Colors | implemented | rainbow moonbeam / multicolored field |
| Wand of Fear Cone | implemented | dark_black arcana cone |
| Ring of Animal Influence / Potion of Climbing / Oil / Holy Water | no change | plan: fine |
| Rod of Alertness / Instant Fortress / Shield of the Cavalier | implemented (partial) | Instant Fortress → falling rocks; Rod Plant Rod/Protective Aura → ward; Cavalier kept |

### D&D 5e conditions & effects
| Entry | Action | Detail |
|---|---|---|
| Diseased | implemented | `fumes.04.loop` green, tint #9cc26a |
| Resurrection Sickness ×4, Magical Fatigue, Spell Taxed | implemented | negative valence → `condition.curse` |
| Insanity, Befuddled | implemented | `dizzy_stars` (red debuff tint) |
| Comet Card Death Save Advantage | already fixed | boon marker |
| Brief Enfeeblement / Enervated / Withered | already fixed | curse marker |
| Ioun Stones ×16 | already fixed | light orb |
| Fire Giant Strength | already fixed | orange fire_ring |
| Cloud / Storm Giant Strength | implemented | whirlwind / static_electricity |
| Imprisonment: Chained, Chaining, Restrained by Iron | implemented | `markers.chain` (chain rule now outranks the Restrained status) |
| Divine Favor, Divine Order: Protector, Thaumaturge | implemented | dancing_light (and `vine` regex fix) |
| Hunter's Defense | already fixed | damage-type tints |
| Transferred AC Bonus | already fixed | boon marker |
| Hit: STR −1d4, Wounded and Cannot Heal | implemented | curse marker (no spectral weapon; weapon theme never falls back to spiritual_weapon) |
| Supernatural Readiness | already fixed | boon |
| Mage Armor | implemented | AC/armor shields use `shield.02.loop` (resistances stay shield.01) |
| Bless/Blessed | skipped | low priority, plan "fine" |
| Burning family | already fixed | single orange fire_ring |
| Animal Messenger / Carrying Message | implemented | no music notes (flight theme; neutral ring marker) |
| (extra) Imprisonment Slumber/Buried/Hedged | implemented | sleep symbol / falling rocks / energy field (were fire shields) |

### 3. Systemic changes

`tools/dnd5e-directions.mjs`
- **Theme inference rewrite**: word-bounded `nameThemes` (fixed "di*vine*"→plant, "t*oward*", "b*oil*", "*wind*ow", "*smit*ing" etc.); spells use school for abj/div/enc/ill/nec before description words, and school as final fallback; description theme = most frequent theme word (not first in list order); temp-HP heal activities → ward (not healing art).
- **Activity-name themes** ("Damage: Sunlight", "Round 4: Hailstones", "Bead of Curing") outrank a non-element item name; verbs/properties ("Cast and Fire", "Restore Use/Slots", "Light Weapon", "Plant Rod") are ignored. Activities named after a spell ("Fireball (70–79)") reuse that spell's `named` art.
- **Override table** `overrides` ([item, fields, activity?, edition?]) applied after the native review; supports `theme`, slot roots, `delivery`, `noCast`, `tints`, `slotThemes`, `areaTiles`, `sound`.
- **Mundane preset** (MUNDANE): no cast stage, no sound, wind-line/white-impact cue; applied to non-magical feats (as before, but now without the "Gather Arcane" cast) and to common non-magical gear; magical keyword list extended (bardic, ethereal, gaze, pact, invocation…) so Bardic Inspiration etc. aren't treated as mundane.
- **Art-family corrections**: void aura = small dark puff (never sphere_of_annihilation except the Sphere item); curse = condition.curse; fear = markers.fear / smoke plumes; mind split into charm (heart), thought (eyes), psychic (dizzy_stars), sleep (kept), generic enchantment (enchantment sign); roars/moans/shrieks/war cry = soundwave/thunderwave; sonic (non-music) cast = soundwave; weapon riders (non-mode) = neutral impact + glint; earth lines = tiled ground_cracks; prismatic layer saves tinted.
- Named additions: Stinking Cloud, Gust of Wind, Black Tentacles, 2024 lantern/tinderbox names.

`tools/build-dnd5e-catalog.mjs`
- `capOneShot`: one-shot non-persistent, non-travel stages longer than the cap get `playbackRate` ≤1.5 then `clipEnd` + 500 ms fade; cap 3 s for casts, 4 s otherwise (all 8–20 s stages gone; only 6.4 s guiding-bolt *travel* remains, intentionally excluded).
- Direction `tints` → stage tint/colorize; `noCast`; `slotThemes` and `areaTiles` passed to `resolveSpellMedia` (line walls of radial art tile along the line).
- Dancing weapons (2014) contact = flying spectral blade, no lunge; hammer/maul thrown flight roots `hammer.throw`.
- `stateAssets`: chain rule before status; diseased/sickness/fatigue/taxed/insanity/befuddled/wounded negative; dizzy_stars, fumes, dancing_light, whirlwind, static_electricity, imprisonment variants, AC shield.02; weapon/ward/void theme fallbacks no longer hit spiritual_weapon / shield_themed fire / sphere.
- Sound profile map: disease→poison, blood→drain.

### 4. Tests changed
- Added `audit fixes: art families match the fiction and one-shot stages stay short` to `tests/dnd5e-catalog.test.mjs` (Hellish Rebuke green, Wall of Stone not fire breath, Web shot not a projectile, every non-persistent non-travel spell/feat/item stage ≤4.5 s, no sphere_of_annihilation outside the Sphere item, Multiattack/Parry/Uncanny Dodge have no cast). No existing assertion was changed.

### 5. Requests for files I don't own
- `tools/weapon-asset-selection.mjs`: **Net** (2014 weapon, ranged/thrown) still flies `arrow.physical`; there is no net/web projectile in JB2A — suggest a contact-only `web.01` for net family, or no flight.
- `tools/spell-asset-selection.mjs`: root `eldritch_blast.rainbow` is rejected for `bolt` (beam geometry vs. projectile) so Chromatic Orb can't use a multicolour orb; a per-choice damage-type hook at runtime would be needed to branch Chromatic Orb / Lifedrinker / Potion & Ring of Resistance / Fire Shield cold option by the chosen type.
- `scripts/spell-choreography.mjs` `SPELL_THEMES`: `void.aura` default is `sphere_of_annihilation` and `weapon.aura` is `spiritual_weapon`, `curse.cast` root `magic_signs.circle.01.necromancy` doesn't exist in either inventory — D&D now overrides these locally, but PF2e/SF2e may inherit the same oversized sphere / spectral-weapon defaults.
- Data-layer duplicates (Coven Magic ×6, Divine Aid ×4, Rope/Manacles duplicates) come from the native packs; dedupe would belong in `tools/dnd5e-source.mjs` policy (not done: would change entry ids).
