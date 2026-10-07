# Animation fix plan — full catalog audit (2026-10-07)

Scope: every catalog recipe was resolved to concrete JB2A keys (Patreon 7,648 keys + Free 1,351 keys) and compared against its native description.

| System | Spells | Feats/features | Weapons | Items | Conditions | Effects |
|---|---:|---:|---:|---:|---:|---:|
| PF2e | 1,994 | 2,308 | 1,127 uses | — | 43 | 2,929 |
| SF2e | 432 | 858 | 299 uses | — | 60 | 400 |
| D&D 5e | 957 variants | 685 | 815 | 865 | 44 | 1,333 |

16,149 recipe rows total. Method: (1) automated resolution + 20 heuristic checks over all rows; (2) 20 parallel semantic reviews, each reading every line of ~500–1,500 rows (name, traits, area, description excerpt, resolved stages, motion) and proposing fixes with keys grepped from the inventory. SF2e rows identical to their PF2e source were reviewed once under PF2e.

Limits: no recipe was watched in Foundry; descriptions were clipped to ~450 chars for review; reviewer row counts reflect judgment ("skip OK entries"), not exhaustive per-entry sign-off. Keys marked ⚠ in Part B were proposed by a reviewer but are **not** in either inventory (placeholders like `0X` or invented names) — re-pick before applying.

Source data for this report: `rows.json` (resolved ledger) and `findings.json` (heuristic hits) in the session scratchpad; regenerate with the extractor if needed.

---

## Part A — Systemic fixes (do these first; each fixes dozens–hundreds of entries)

### A1. Color picker falls back to the alphabetically-first color (blue) — **High, ~600+ stages**
Root cause in selection: when the requested theme color is missing from a family, ranking ends in `a.key.localeCompare(b.key)` → `.blue`. Weapon picker prefers `.white`, which often doesn't exist.
- `tools/weapon-asset-selection.mjs`: `flights.firearm = ['bullet.01','bullet.02']` → `bullet.01.blue` for ~100 mundane PF2e firearms (Flintlock Musket, Arquebus, Blunderbuss, Hand Cannon, Pepperbox…), plus 63 `bullet.01.purple`. **Fix:** root `bullet.01.orange`/`bullet.02.orange` for mundane guns; use colored bullets only for elemental/magic ammo (fire→orange/red, poison→green, force→purple).
- `scripts/weapon-payloads.mjs` `physical:['impact.001.white','impact.001']` — `impact.001.white` doesn't exist in Patreon → **222 PF2e weapon Strikes + 24 SF2e + 15 D&D end on a blue magic flash** (Longbow, Sling, Javelin, every firearm). **Fix:** use `impact.005.white`/`impact.007.white`/`impact.009.white` (exist) or drop the finish for mundane hits.
- Earth theme color `"brown"` (spell-asset-selection `colors`) doesn't exist on `ground_cracks` → **151 earth/stone entries use `ground_cracks.*.blue`** in Patreon while Free gets the correct orange (Earthquake, Crushing Ground, Dividing Trench, Burrow Ward, ~33 PF2e feats, D&D Flesh to Stone/Move Earth). **Fix:** per-family color fallback chain (earth: orange → dark_red → white; never blue).
- Fire `fire_ring` has no orange → `fire_ring.500px.blue` on **~60 fire entries** (Fire Shield, Shroud of Flame, Lava Leap, Crawling Fire, Solar Detonation, Self Destruct, Ignite the Sun, Continual Flame, Brazier of Commanding Fire Elementals). **Fix:** fire chain orange → red → yellow. (Funeral Flames is intentionally blue — keep.)
- **General fix:** replace alphabetical tiebreak with a theme-aware color-distance ranking, and add a test asserting no fire/earth/acid-themed recipe resolves to a blue key without a tint.

### A2. Free edition swaps color without tint — **Medium, ~1,100 entries / 650 distinct key pairs**
Purple→yellow glints (1,385 stages), `magic_signs…evocation.purple`→`dark_red` (620), `fumes.toxic.green`→`fumes.04.complete.grey` (166: poison becomes ash), `liquid.blob/bubble green`→blue (acid becomes water), purple void/shadow→blue (reads as cold), `toll_the_dead.purple`→`green` (necrotic reads as poison), `impact.005.white`→`impact.frost.white.01` (adds frost to Thunderous Landing, Magnetic Acceleration, Needle Darts), Drake Rifle (Electricity) Free → `eldritch_blast.purple`. ~1,500 stages flip element color family.
**Fix:** when the Free pick's color family differs from Patreon's, auto-apply `colorize` + `tint` of the Patreon hue (the pipeline already does this for states via `colorSubstitution`); never fall back across element families (frost/eldritch) without approval.

### A3. SF2e "Needs configuration" spells still play fallback art — **High, 89 spells**
`design.label === "Needs configuration"` with note "Generic casting effects are not substituted", yet `unavailable:false`, `catalogSpellReady()` true, and a motif (bodyRunes/weaponRunes/eye…) plays. Absolute Zero (30-ft cold burst) plays a blue body-runes buff; Caustic Conversion, Chill Gaze, Discharge, Electrotether, Overheat, Promession (damage spells) show only buff runes; Time's Edge, Skim Data, Reality Wipe, Injury Echo, Dream of Home similar.
**Fix:** either mark `unavailable:true` (honor the README's "no generic fallback" promise) or author designs. Priority authoring: damage spells by element (cold → `ice_spikes`/`cone_of_cold`, electricity → `lightning_strike`/`static_electricity`, fire → `fireball`), tech spells → `markers_scifi.*`, `ranged_missile.*`.

### A4. D&D theme inference mis-keys on words in the text — **High**
- **Daylight (all 3 variants) plays `darkness.black` twice** — "dispels darkness" in the text drove a Shadow theme. Fix: bright light — `divine_smite.caster.yellowwhite` + `markers.light.*` (no sunburst family exists).
- **Ioun Stones (16 entries) themed "Earth"** from the word *stone* → `ground_cracks` / `falling_rocks`. Fix: small orbiting gem (`aura_themed…orbit` family / `dancing_light`).
- **Faerie Fire (D&D, 3 variants + effect) = blue `fire_ring`** — not fire. Fix: `fairies.*` (unused family) or outline glow `token_border`/`swirling_sparkles` tinted per chosen color. PF2e Faerie Fire already does this better.
- Lamp/Lantern/Torch "Light" = `fireball.explosion.orange` (a detonation to light a lamp). Fix: small `flames` loop / `cast_generic.fire` at token scale.
- Storm of Vengeance "Hailstones" = green healing burst; Hellish Rebuke 2024 says green flames but plays orange explosion; Wall of Stone = recolored `breath_weapons.fire.line`; Web (2014 attack) travel = skull / ice shard projectile.
**Fix:** theme keywords must ignore negated/contrast phrases ("dispels darkness", "stone of …"); add explicit overrides; prefer reviewed `dndMotionReview` entries.

### A5. Generic fallback recipes standing in for distinct fiction — **Medium, thousands**
Top resolved keys: `glint.purple.few` 1,443 stages · `cast_generic.01.dark_purple` 627 · `magic_signs.circle.02.evocation.loop.purple` 620 · `cast_generic.02.dark_purple` 524 · `shield.01.loop.blue` 448 · `twinkling_stars.points04.orange` 421 · `detect_magic.circle.purple` 367.
Shared-recipe clusters (identical media signature, ≥15 unrelated entries): 160 clusters. Biggest:
| Cluster | Count | Fix direction |
|---|---:|---|
| SF2e feats `glint.purple.few` + `twinkling_stars.points04.orange` ("Activity starts") | 302 | Branch by trait: tech → `markers_scifi`, gravity → `energy_strands`/`black_tentacles` pull, telepathy → `eyes`, luck → keep stars |
| D&D features/items: `cast_generic.dark_purple` + `magic_signs…evocation.loop.purple` | ~260 (+120 mundane tools/items) | **Mundane actions get no magic circle.** Multiattack, Parry, Uncanny Dodge, Action Surge, Riposte, tool checks, ropes, manacles, locks → no animation or a neutral `impact.005.white`/`wind_lines` sting |
| PF2e feats `wind_lines.01.01.white` (any movement) | 102 (+75 SF2e) | Fly → `swirling_feathers`, Swim → `water_splash`, Burrow → `ground_cracks.orange`, Climb → keep |
| PF2e feats `melee_generic.slash.01.bluepurple` + glint (any Strike) | ~90 + 55 SF2e | Use the actual weapon/anatomy (`claws`, `bite`, `unarmed_strike`, `melee_attack.*`), white not bluepurple for mundane |
| "Transformation silhouettes" polymorph | ~60 PF2e spells, ~35+20 feats | Tint per form (Ferrous→metal grey, Elemental→element, Dragon→chromatic), animals → `bats`, `swirling_feathers`, `claws`. Element Embodied already proves the pattern. |
| "Force shield raised" | ~60 spells, ~40 feats | Only for real wards; per element `shield_themed.above.fire` / `.ice` / `.molten_earth`; Dismantle, Cryostasis, Fashionista, Befitting Attire, Glimpse Weakness, Trickster's Feathers are not shields |
| "Divination scan" (detect_magic circle) | ~63 PF2e + 24 SF2e | Senses → `eyes.*`, Scrying → floating eye, Detect Poison → `fumes`, Darkvision → `darkness` veil, Glowing Trail is not divination |
| "Mental jolt" (dizzy_stars) | ~50 | Allegro (haste) is not a jolt; Power Word Kill needs a bigger, darker beat; damage vs. charm vs. fear variants |
| "Quick departure shimmer" teleport | ~40 | Scale by range: blink vs. Teleport/Gate (`portals.vertical`, larger, longer) |
| "Vitality bloom" heal | ~40 | Keep; vary by source (Tree of Life and Death, Unblinking Flame Aura, Necromancer's Generosity void-tinted) |
| Summon X (Animal/Construct/Fey/Plant/Undead/Instrument/Lesser Servitor) | 7 | Differentiate like Giant/Celestial/Fiend/Dragon already are |
| PF2e weapons `quarterstaff.melee.01.white` (all "Staff of X") | 176 | Add element/school finish per staff (Staff of Fire → `impact.fire`, Air/Tempest → `lightning`/`wind_lines`) |

### A6. Persistent effects/conditions carry no meaning — **Medium, ~2,000 markers**
- PF2e: **826 effects use untinted `token_border.circle.static.blue.NNN`** (numbers 001–013 assigned arbitrarily) and ~210 `condition.boon.01.NNN.green`; **penalties and bonuses look identical** (e.g. "–2 circumstance penalty to attack rolls" = same blue ring as "A Challenge for Heroes (Ally)").
- 245 PF2e effects = `shield.01.loop.blue` incl. Antidote, Antiplague, Blood Booster, "A Little Bird Told Me", Bob.
- D&D: ~500 effects = `swirling_sparkles.01.<random color>` (Advantage and Disadvantage of the same skill often same color); ~195 Immunity/Resistance/Vulnerability = `shield.01.loop.blue` for every damage type; ~230 conditions/speeds = random-color `token_border`.
- Conditions with no identity: Clumsy, Encumbered, Enfeebled, Fatigued, Immobilized, Paralyzed, Hostile (siblings Frightened/Stunned/Sickened have good icons). Temp-HP effects randomly alternate between `markers.heart` and the generic ring.
- D&D Hunter's Defense: Cold → red, Fire → green, Poison → blue (inverted).
- `sphere_of_annihilation` used for Comet Card death-save *advantage* and minor penalties; `web.loop` for iron chains (use `markers.chain` as Grappled does); `healing_generic` on Diseased/Insanity/Befuddled.
**Fix — a marker grammar:** (1) valence color: buff = green/gold, debuff = red/purple, neutral = white; (2) category icon: AC → shield, attack → `hunters_mark`, speed → spinning ring/`wind_lines`, fly → `swirling_feathers`, senses → `eyes`, temp HP → `markers.heart`, resistance/immunity → `shield_themed.above.*` (fire/ice/molten_earth) or `shield.*` tinted per damage type, persistent damage → existing type markers; (3) chosen-element effects (Energy Shield Tunic, Elemental Motion, Resist Energy) take the chosen type, not default fire/blue; (4) "until end of next turn" variants reuse the parent condition's icon.

### A7. Wrong delivery / shape — **High where noted**
- **SF2e Grenade Launcher (4 grades) and Szynegation Grenades: melee bludgeon swing, no flight.** Use `throwable.throw.grenade`/bomb flight + `explosion`.
- SF2e plasma guns use `eldritch_blast.orange` (Plasma Cannon/Caster, Starfall Pistol), sonic guns use `energy_beam.normal.blue` (Boom Pistol, Screamer, Sonic Rifle, Streetsweeper) → `soundwave.*`; gun feats use `arrow.physical` (15) and `sword.throw`/`hammer.throw` (10, all Area/Auto-Fire feats) → bullets / `volley_of_projectiles_Line`; Skyfire Sword is a bludgeon fist (use `sword.melee.fire.orange` like Plasma Sword).
- **36 JB2A families never used**, several purpose-built: `lasersword`, `hovering_laserweapon`, `ranged_missile`, `ranged_helix`, `markers_scifi` (SF2e weapons/tech); `flurry_of_blows` (D&D Flurry of Blows uses `divine_smite`!); `sneak_attack` (Sneak Attack uses a purple magic sword); `caltrops`, `ball_bearing` (items use a purple particle burst); `volley_of_projectiles_ConePF2e/Cone5e/Line` (Volley, Impossible Volley); `template_cone_PF2e`; `witch_bolt`; `shield_attack` (Shield Throw); `fairies`; `scorched_earth`; `smoke_line`; `explosion_side`; `side_impact`; `kunai`; `braziers`; `on_token_cast`/`on_token_target`; `muzzle_flash` (exists, no firearm uses it — add a muzzle flash cast stage to every firearm).
- Boulder throws use magic sparkles / arrow line (D&D Boulder Toss, PF2e Oversized Throw) → `boulder.toss.01.01` + `impact.boulder.01`.
- 65 PF2e spells with native area have no template stage (Ancient Dust cone, Eagle's Cry cone, Horde of Underlings, Fungal Exhalation, Collective Transposition…); 25 line spells use radial art (Arctic Rift, Bone Spear, Scatter Scree, Wall of Radiance); 3 cones use `burning_hands` art for non-fire/mixed (Elemental Annihilation Wave, Plasma Whirl, Rejuvenating Flames).
- Snakebird's Shadow / Wild Winds Gust: melee strikes drawn as a traveling beam.
- `sphere_of_annihilation`/`arms_of_hadar` on small monster riders (Life Drain, Death Glare, Necrotic Strike, Troll Spawn) — massive scale mismatch.

### A8. Wrong art family (healing / holy / music / sleep as generic stings) — **High/Medium**
- `healing_generic` on non-healing: 133 heuristic hits, plus reviewer finds (Stinking Cloud, Insect Plague, Private Sanctum, Mending, Modify Memory, Staff of the Magi/Woodlands/Swarming Insects, Dragon Orb, Rod of Absorption, Deck "Skull", Necklace of Prayer Beads summons, War Cry, Shimmering Shield 2024, Brain Drain, Shock to the System).
- `divine_smite` (holy pillar) as generic big hit: Flurry of Blows, Abscission Shards, Amalgamate, Slowing Strike, Thrash, Berserker/Giant Slayer saves, 34 SF2e gunfire/gravity feats; Unholy Water uses holy yellowwhite (use `divine_smite.target.dark_purple`).
- `music_notations.bass_clef` for roars/thunder/gravity: Roar, Moan, Sonic Boom, Thunderclap, Gravity Grasp/Tether, Staff of the Python transform → `soundwave.*`, `energy_strands`.
- `sleep.*` for charm/psychic damage/fear (~40): Charm/Dominate/Geas, Mind Shards, Psi Burst, Mental Static, Staff of Charming → `impact_themed.heart`, `markers.fear`, `dizzy_stars`.
- `toll_the_dead` death bell on comforting feats (Cheer Up, Self Soothe).
- Unseen Heralds (illusory mouths broadcasting your voice) uses `icon.mute` — opposite meaning.
- Ioun Stones `falling_rocks`, Manual of Golems all-fire, Collapse Wall = blue `wall_of_fire`.

### A9. Timing / layering — **Medium**
- 286 non-persistent stages > 9 s: D&D "Gather Poison" 11.18 s cast (Spores, Stench, Poison Breath, Cunning Strike Withdraw, weapon "Poison Ray"), "Gather Protection" 8.2 s (Legendary Resistance, Riposte, Patient Defense ~20), "Gather Nature" 8.9 s (~11), Pursuit/Tree Stride teleport aura 16.3 s, Wall of Ice (2014) 20.2 s, Hallow 16.3 s, PF2e Abyssal Plague / Purple Worm Sting poison mist 11.15 s, Foraging Friends 9.25 s, Ward Domain 9.2 s. **Fix:** cap one-shot stages at ~3–4 s (trim/fade or `playbackRate`), keep long loops only for `persist`.
- 1,655 recipes repeat the same key inside one recipe (857 PF2e feats, 403 PF2e spells); many fire at the identical offset (Create Food ×6, Dinosaur Fort ×4, Claws of the Otter, Coral Scourge, Mantle of Heaven's Slopes) — pure overdraw. Merge or offset/scale them.
- 22 near-invisible layers (opacity < 0.2: Invisibility Curtain 0.14, Pummeling Rubble 0.10, Vampiric Exsanguination 0.15) — raise or remove.
- D&D: nearly every entry has `pulse@source d0.09 1500ms` motion regardless of fiction, while Jump/Levitate/Fly/Misty Step lack meaningful motion.
- 2014 vs. 2024 D&D variants of the same spell diverge (2024 fixed, 2014 not: Find Steed, etc.) — backport.

### A10. Recommended order
1. A1 color fallback + weapon `impact.001.white` bug + firearms (one-line selection fixes, big visible win).
2. A3 SF2e needs-config (mark unavailable now, author later) and A4 D&D theme-keyword bugs (Daylight, Ioun, Faerie Fire, lamps).
3. A7 high-severity delivery (grenade launchers, sci-fi weapon families, muzzle flash, unused purpose-built families).
4. A6 marker grammar for effects/conditions (largest count, mostly mechanical once grammar defined).
5. A2 Free tint parity (automatic rule).
6. A5/A8 cluster differentiation and A9 timing caps, then Part B per-entry rows.
7. Add regression audits: theme-vs-key color check, "healing art on non-healing", "Needs configuration plays", max one-shot duration, duplicate stage at same offset.

---

## Part B — Per-entry fixes (from 20 full-read reviews)

Severity: **H** clearly wrong/misleading · **M** generic where good art exists, or noticeable quality issue · **L** polish. ⚠ = proposed key not found in either inventory (pick a real variant). Patterns sections from each review are folded into Part A; entry tables follow verbatim.


### PF2e spells (part 1)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| 500 Toads | L | Toads shown only as grey shoe footprints + blue sparkle dust, no actual toad/frog imagery | add `jb2a.toad` ⚠ style key if present, or use green `particles.002.001.complete.many.greenyellow` instead of blue to suggest amphibians |
| Biting Words | M | Sonic vocal attack stages mislabeled "Water jet"/"Water splash" (copy-paste residue from a water spell); assets are sonic-correct but label drift risks future miscoloring | rename stages; confirm `energy_beam.normal.blue.01` tint should be neutral/white not blue (sonic, not water) |
| Blade Barrier | M | Wall of churning force blades rendered as generic "Force shield raised" shield icon, no wall/blade visual at all | use `wall_of_force.vertical.purple` + `cloud_of_daggers.daggers.purple` instead of `shield.01.intro/loop` |
| Dismantle | H | Object disassembles into components, shown as a "Force shield raised" (shield pulse) — opposite of the described effect | replace with `shatter.purple` + `particles.outward.purple.01.01` |
| Cryostasis | H | Target is frozen solid in ice to stabilize them; rendered with a generic blue "force shield" instead of any ice/frost | use `ice_spikes.wall.burst.blue` + `ice_spikes.radial.loop.blue` |
| Befitting Attire | M | Illusory reclothing of targets shown as "Force shield raised" with shield.01 loop — no connection to clothing/illusion | drop shield assets; use `shimmer.01.purple` only, tinted to the chosen occasion-appropriate color |
| Allegro | H | Pure buff (grants Quickened, no damage) plays damage-coded "Mental stars" dizzy_stars + `shake@targets` flinch motion — reads as an attack, not encouragement | replace dizzy_stars/shake with `wind_lines.01.01.white` + no shake motion (use a mild `pulse@targets`) |
| Commanding Lash / Chastising Retort / Daze / Debilitating Dichotomy / Cycle of Retribution / Confront Selves / Crisis of Faith | L | All share byte-identical "Mental pressure/Mental stars/Mental jolt" recipe — fine individually, but the cluster makes every mental-damage spell in the alphabet visually identical | vary scale/color per severity tier (e.g. Crisis of Faith 6d6-6d8 dmg should be bigger/more saturated than 1d6 Daze) |
| Clairaudience | L | Identical "Divination scan" recipe as every other detection spell despite being specifically about hearing | swap `detect_magic.circle.purple` for `soundwave.01.blue` ear-motif |
| Clairvoyance | L | Identical divination-scan recipe despite being specifically about sight | swap for `eyes.01.purple.few`-based recipe |
| Darkvision / Deep Sight / Darkened Sight | L | Reasonable (eyes-based) but Darkvision itself still uses the generic circle/divination-scan instead of the eye motif used by its sibling spells (Deep Sight, Darkened Sight) in the same file | align Darkvision to the `eyes.01.dark_green.single` tinted-black recipe already used by Deep Sight |
| Detect Metal | L | Generic divination scan gives no sense of "metal" | tint `detect_magic.circle` with a metallic grey/silver tint#c0c0c8 |
| Detect Poison | L | Generic divination scan gives no sense of "poison" | swap for `icon.poison.dark_green` |
| Call of the Grave | M | "Fire a ray of sickening energy" rendered with a purple abjuration-signs cast + purple beam identical to Chilling Darkness's cold/unholy beam; necrotic/sickening theme (Sickened condition) isn't conveyed | tint beam/impact sickly green (`tint#7a9e4a`) instead of purple, drop the abjuration cast-sign (wrong school) |
| Aberrant Form | L | Good differentiation already (purple/black_tentacles), but opacity o0.65 on the aura makes the "otherworldly flesh" barely visible against token art | raise aura opacity to ~o0.5-0.6 minimum readability, currently fine but borderline |
| Aerial Form / Animal Feature / Animal Form / Apex Companion / Armor of Thorn and Claw / Augmented Body / Canopy Crawler / Darkened Forest Form / Devouring Dark Form / Dinosaur Form / Crown of Prophets | M | Large cluster — identical purple/pink transformation recipe used for aerial, animal, dinosaur, aberrant-adjacent forms alike despite the module differentiating Angel/Cosmic/Daemon/Demon/Devil forms elsewhere | tint by family: aerial/feathered → white/sky-blue (`tint#cfe8ff`), animal/dinosaur → earthy green/brown (`tint#7a8f52`), leave aberrant purple |
| Angel Form | L | Good, already differentiated (dancing_light.yellow, divine_smite) — no fix needed, flagged only as a positive contrast example | — |
| Acid Arrow | L | Fine overall; opacity o0.3 aura of lingering fumes is nearly invisible at 1100ms duration | raise to o0.45 |
| Acid Splash (cantrip) | L | Scale 0.45 projectile glob for a cantrip reads as tiny; acceptable for a 1-action cantrip but the liquid.splash impact at s1.057 dwarfs it awkwardly | bump projectile scale to ~0.55 for visual continuity |
| Air Walk | L | "Ground shadow" sprite + levitate motion is good, but asset `swirling_feathers.outburst.01.purple` (feather burst) doesn't read as "walking on air," more like a wing/flight spell | swap to `wind_lines.01.01.white` loop under feet instead of feather burst |
| Airburst / Blastback | L | Both reuse the literal label "Wind emanation at placed origin" with `whirlwind.bluewhite`, a swirling vortex, for what the description frames as a single outward shove/boom (not a sustained whirlwind) | use a one-shot outward burst (`particle_burst.01.circle` + `wind_lines`) instead of a looping whirlwind |
| Amalgamizing Leap | L | Teleport-themed spell, fine, but portal key `portals.horizontal.ring_masked.purple` o0.98 with a very short 640ms duration barely registers before the next stage | extend to ~900ms or raise opacity |
| Angelic Halo | L | Good concept (halo token_border + aura) but opacity o0.9 on both cast and template is very strong/saturated for a passive aura buff | reduce template opacity to ~o0.5 |
| Animal Allies / Buzzing Servants / Cinder Swarm / Blood in the Water / Bounty of the Sky | M | All five summon-swarm spells share the identical "Swarming silhouettes" recipe using `bats.complete.01.red` as the free-edition fallback for butterflies regardless of the described creature (insects, bees, aquatic predators, geese) — bats are a poor fallback for bees/geese/fish | use distinct free-fallback per theme: bees→`bats` is fine only for Buzzing Servants; Blood in the Water (aquatic predators) should favor `bubble`/`liquid` not bats; Bounty of the Sky (geese) should use `swirling_feathers` not bats |
| Animate Rope | L | "Rope-like coil" uses `markers.chain...` ⚠ (a chain, not rope) as both Patreon and free key | if a rope-specific key exists use it; otherwise acceptable fallback, low priority |
| Arcane Explosion | M | Caster becomes "a ball of pure magic" then explodes — only `energy_field.01.blue` (a shield-like field) + outward template; no actual explosion asset despite 16d6 force damage emanation | add `explosion`-family key (e.g. jb2a explosion) to the template stage for impact weight |
| Army of Shadows | L | "Shadows invoked" burst60 area effect that snuffs light is rendered only as `darkness.black` o0.25 at s1 — likely far too small/transparent for a 200-ft burst radius | raise scale substantially or use multiple tiled darkness templates; current single s1 darkness.black cannot plausibly cover a 200-ft radius |
| Ash Cloud / Ashen Wind | L | Both "ash cloud" spells use generic `fog_cloud`/`smoke.plumes` with no ash/grey-black tint — reads as plain fog/mist rather than ash | add `tint#8a8378` (ash grey) to the fog/smoke stages |
| Astral Labyrinth | L | "Astral maze" uses `web.01`, a spider-web asset, for an invisible dimensional maze — web implies physical sticky strands, not astral geometry | swap for `icosahedron.rune.above.blueyellow` or `energy_strands` only (already used in stage 2/3), drop the web key |
| Avenging Wildwood / Bridge of Vines / Bursting Bloom | L | Three different plant-summon spells all default to `plant_growth.03.round.4x4` — fine, minor repetition, no fix needed, just noting the pattern isn't harmful here | — |
| Bane | M | "Doubt" debuff uses `magic_signs.circle.02.abjuration.loop.purple` (abjuration iconography) for an enchantment/mental effect — wrong school symbol | swap to `magic_signs.circle.02.enchantment.loop` or drop rune icon, keep only the inward-ring pulse |
| Beheading Buzz Saw | L | "Spinning disc with gruesome blades" uses `chakram.01.return.01` (a boomerang-like returning chakram) — reasonable substitute, no strong fix needed | — |
| Begone | L | Mystic shove — `energy_strands` for a bludgeoning/force shove reads abstract; consider `wind_lines` to sell the "rocketing backward" force | optional: add wind-trail behind the pushed target |
| Black Tentacles | L | Good — correctly uses `black_tentacles.dark_purple`, no fix needed | — |
| Blazing Dive | L | "Fiery comet" landing uses `fireball.explosion.orange` (appropriately fiery) but the initial "Fly up" launch stage has no upward visual cue beyond the `M: leap` motion | add brief `wind_lines` trail during the ascent for clarity |
| Blended "Divination scan" group (Approximate, Augury, Blind Eye, Blood Duplicate, Channel Arrogance, Clouded Focus, Defended by Spirits, Detect Creator, Detect Scrying, Disguise Magic) | L | 10+ entries share the exact divination-scan recipe; harmless individually but compounds the pattern above | see Patterns section — differentiate per specific knowledge granted |
| Blur | L | Good concept, but the "Afterimage wisps" aura asset is `smoke.plumes.01.purple`, smoke, rather than a blur/afterimage visual like `shimmer` repeated at lower opacity | swap aura to a second lower-opacity `shimmer.01.purple` layer instead of smoke |
| Boil Blood | L | "Boil Blood" internal heat uses `flames.01.orange` visible flame erupting from the body for internal-only fire damage — may be fine stylistically but risks implying external fire damage type confusion since this is pure fire damage, not an issue, skip | — |
| Call of the Quenching | L | Legendary 1-mile torrential spell rendered with the same small-scale `liquid.splash.blue` used for a 2-gallon Create Water — scale mismatch for an "impossible" mythic-tier spell | significantly increase scale/opacity or add `fog_cloud`/full-screen rain overlay to match the described epic scope |
| Cataclysm | L | Good — ambitious multi-element layering is appropriate for this all-element burst, no fix needed | — |
| Chain Lightning | L | Good — correctly uses `chain_lightning.primary.blue` matching the propagating-arc description, no fix needed | — |
| Charm | L | "Dreamy haze" fine; acceptable | — |
| Chilling Darkness | M | Shares identical "Unholy darkness beam" recipe/label with Call of the Grave (see Pattern); cold+unholy ray should look icy, not generic purple | tint impact/beam toward cold-blue (`tint#9fd6ff`) to differentiate from Call of the Grave's necrotic green |
| Chromatic Image | L | Good use of per-color sprite tints for the three illusory duplicates, no fix needed | — |
| Chromatic Ray | L | Uses fixed yellow beam/impact despite the spell being explicitly random-colored (fire/acid/cold/etc. per 1d4 roll) | color should be dynamically tinted to match the rolled damage type rather than fixed yellow |
| Chromatic Wall | L | Same fixed-color issue — wall is randomly colored per 1d4 roll but rendered fixed purple | tint dynamically per rolled color if the engine supports conditional tinting |
| Clinging Shadows Stance | L | Fine, shadow-themed assets appropriate | — |
| Cloak of Colors | L | Good | — |
| Clockwork Devotion | L | Good halberd+gear theme, appropriate | — |
| Cone of Cold / Chilling Spray | L | Both correctly use `cone_of_cold.blue`, fine, no fix | — |
| Confound the Eye and Confuse the Mind | L | Disguise-illusion spell uses generic `icon.runes.orange` rune bursts for "disguised spell identity" — fine placeholder, low priority | — |
| Confusing Colors / Confusing Cry / Confusion | L | All three "confusion"-family spells independently reasonable, no fix | — |
| Containment | L | Good, force-field themed correctly | — |
| Contingency | L | Fine | — |
| Create Food | L | Six duplicate identical "Soft food impression" stages stacked at the same timestamp/duration — redundant padding | collapse to 1-2 stages with varied position instead of 6 identical overlapping copies |
| Create Water | L | Two duplicate identical "Water flows from hands" stages at same timing | collapse to one stage |
| Crushing Ground | L | Good — ground opens/closes sequence appropriate | — |
| Cyclone Rondo | L | Good whirlwind use | — |
| Daemon Form / Demon Form / Devil Form | L | Good — all three already differentiated from each other and from the generic transformation cluster (toll_the_dead/arms_of_hadar/portals respectively); positive example, no fix | — |
| Darkness / Darklight / Army of Shadows / Dance of Darkness / Dim the Light | L | Multiple darkness spells share `darkness.black`; acceptable since all literally create magical darkness, no fix | — |
| Daydreamer's Curse | M | Uses `sleep.cloud.01.pink` (a sleep-cloud asset) for a distraction/misfortune curse that has nothing to do with sleep | swap to `eyes.01.dark_green.single` + unfocused `shimmer`, drop the sleep-cloud key entirely |
| Death Knell | L | "Life snuffed" uses `icon.heart.pink`, a heart icon, immediately followed by a skull — heart-then-skull sequence is a little busy but conceptually fine | optional: drop the heart icon, start directly with dimming/skull |
| Deathless March | L | Good — marching song for undead, reasonable | — |
| Deity's Strike | L | Good, divine weapon manifestation appropriate | — |
| Devour Life / Drain Life / Call The Blood / Chroma Leach / Defy the Gods | M | Five different life/color/blood-drain spells all reuse the identical "Reach for life force / Drain contact / Return life force / Caster receives" pipeline with only tint swaps — Chroma Leach specifically is about draining *color* (described as "impossible colors from beyond the stars"), not blood/life-force, yet uses the same drain recipe with no color-theft visual | give Chroma Leach a bespoke `swirling_sparkles`-draining-to-grey visual instead of the generic life-drain beam |
| Dirge of Remembrance | L | Good, sonic/incorporeal theme appropriate | — |
| Disintegrate | L | Good, correctly uses dedicated `disintegrate.purpleblue` key matching description, no fix | — |
| Dinosaur Form | M | Uses the same purple/pink generic transformation recipe as every other battle form (see Pattern); a dinosaur transformation reads identically to becoming an angel or a daemon's cousin aberration | retint green/brown earthy per Pattern fix |
| Dinosaur Fort | L | Four identical duplicate "Dinosaur adornment symbols" (`icon.skull.purple`) stages fired in parallel at the same timing — redundant | reduce to 1-2 varied-position stages |
| Divine Armageddon / Divine Decree / Divine Wrath / Divine Immolation | L | All reasonably differentiated (spirit_guardians, sacred_flame, fire_ring); no fix | — |
| Dizzying Colors | L | Good, swirling_sparkles projectile fine | — |
| Dragon Form | M | Uses purple magic_signs.rune.transmutation tint regardless of chosen dragon color/element — same issue as Chromatic Ray/Wall: player picks a dragon type (fire, cold, etc.) but visual stays fixed purple | tint per chosen dragon's elemental color if selectable, else default to red/orange (most iconic dragon color) instead of purple |

### PF2e spells (part 2)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Draw Ire | L | "Mental jolt" generic template, no distinct goad/retaliation cue | Add a small `icon.fear` or red-tinted accent distinguishing it from other mental-jolt spells |
| Draw Moisture | M | Uses "Gravity lift" cast/impact (`cast_shape`+`energy_field` "gravity ring") and `M: levitate@targets` for a spell about drying an object and collecting a water droplet — nothing gravity-related, and the *target creature* shouldn't visually levitate | Replace with `water_splash.circle.01.blue` + small floating droplet sprite; drop the `levitate@targets` motion entirely |
| Dull Ambition | L | Generic smoke+icosahedron, no sense of "undermining ambition/initiative" | Low priority, acceptable as-is |
| Dust Storm | L | Uses plain `fog_cloud` (mist) with no dust/sand tint for a spell explicitly about choking dust, not mist | Tint fog_cloud layer tan/brown (`tint#c7a77e`) to read as dust, not mist |
| Earth and Sky | L | "Caster lifts on a dragon-like gust" uses plain white `wind_lines`, no air-elemental punch for launching nearby creatures into the sky | Acceptable, low priority |
| Earthbind | L | "Gravity binding threads" uses blue `energy_strands` unrelated to earth theme | Tint strands brown/earth instead of blue |
| Electrified Crystal Ward | L | "Crystalline lock" icosahedron is blue/yellow but spell is about an electric hazard rune; fine but weak | Low priority |
| Elephant Form | M | Part of "Transformation silhouettes" cluster; becomes a mammoth/elephant with zero earthy/grey tint | Tint transformation layers grey-brown |
| Ember Doppelgänger | L | Correctly tinted orange (`tint#eb7b31`) — good, no fix needed | — |
| Enfeeble | L | Fine, no fix needed | — |
| Enlarge | L | "Cosmetic silhouette grows" using purple shimmer, no clear size-growth cue beyond scale bump already present | Acceptable |
| Entrancing Eyes | L | Fine | — |
| Equal Footing | L | "Footing impeded" uses `footprints.shoe.grey` (human shoe) regardless of creature type | Low priority — footprints are a reasonable universal metaphor here |
| Erase Trail | L | Fine, footprints metaphor appropriate | — |
| Fashionista | H | Gets the copy-pasted "Force shield raised" template (shield.01.intro/loop) for a spell that transforms the target's *clothing into high-fashion attire* — no shield, no clothing visual at all | Replace with `shimmer.01.blue`/`glint.yellow.few` (the "Glamorize" pattern) + `swirling_sparkles.01` for a fashionable flourish |
| Fated Confrontation | L | Fine | — |
| Favorable Review | L | Fine | — |
| Fear the Sun | L | Fine | — |
| Field of Razors | M | "Barbed metal thicket" uses `web.01` tinted grey — a spiderweb asset standing in for razor wire; passable but a cloud-of-daggers-style ground hazard (already used for Iron Rain) would read better | Consider `cloud_of_daggers.daggers` tinted grey/steel instead of web |
| Fishing Spot | M | Uses `quarterstaff.melee.01` (a weapon swing) to represent holding up a fishing rod — looks like a combat flourish for a wholly noncombat flavor spell | Replace with a static prop cue (glint/shimmer) rather than a melee weapon swing animation |
| Flashy Disappearance | L | Smoke tinted purple (`tint#ce78ff`) for "colorful smoke" — fine, though "colorful" implies more than one hue | Low priority |
| Flense | M | "Weapon manifests"/"Weapon flourish" (sword swing + spiritual_weapon trail) for a touch spell that strips flesh/muscle/organs from a body — no weapon described | Replace sword-swing with a claw/drain visual (e.g. `claws` + `liquid.splash02.red`) |
| Fly | L | Shares "Air lift and trailing shadow" template with Earth and Sky/Jump — fine, consistent | — |
| Foraging Friends | M | "Small animal tracks" uses `footprints.shoe.grey` — a human shoe print for small foraging animals (birds/mice) | Use `footprints.monster.grey` (exists in inventory) instead |
| Forceful Hand | M | Part of "Force shield raised" cluster; a spell literally about a conjured disembodied magic *hand* gets a shield animation with no hand visual anywhere | Add `arcane_hand.purple` (verified key) in place of/alongside the shield layers |
| Freezing Touch | L | Fine, cold imagery present throughout | — |
| Friendfetch | L | Correctly uses `rush@targets` motion to pull creatures toward caster — good example, contrast with Gravitational Pull below | — |
| Frog Tongue | L | Fine | — |
| Fulminating Impact | L | Fine | — |
| Fungal Hyphae | M | Part of "Divination scan" cluster; a fungal/plant tremorsense spell gets the generic arcane blue magic-circle divination scan with no plant tint | Use `swirling_leaves`/plant-green tint instead of blue arcane circle |
| Gasping Marsh | L | Fine, part of correctly-themed poison/fumes cluster | — |
| Geyser | L | Fine | — |
| Ghost Rush | L | Fine, yellow-tinted smoke plus shimmer reads as spectral movement | — |
| Glamorize | L | Good minimal, fitting cosmetic template — no fix needed, cited as a *good* pattern to reuse for Fashionista above | — |
| Glass Sand | L | "Jagged shards of glass fan" uses `icosahedron.simple.blue`, a weak generic gem shape (no glass-specific asset exists in the inventory) | Acceptable given asset limits; low priority |
| Glimpse Weakness | H | Gets the copy-pasted "Force shield raised" template for a spell about marking a foe's weak point so an ally's next hit lands harder — a shield is the opposite of the fiction (this debuffs the *enemy*, doesn't shield the caster) | Replace with `hunters_mark.pulse.01.purple` or `on_token_target.001.001.purplered` (verified keys) placed on the target |
| Glowing Trail | H | Part of "Divination scan" cluster but is not a divination effect at all — it's a cosmetic glowing path left behind by the caster's movement — yet gets the arcane detect-magic scan animation | Replace entirely with a trailing light cue (`dancing_light`/`glint` strung along the path), no magic-circle scan |
| Gravitational Pull | H | Uses the "Gravity lift" `energy_field` ring + `M: levitate@targets` (vertical float) for a spell that pulls the target *horizontally toward the caster* — wrong motion entirely; compare Friendfetch, which correctly uses `rush@targets` | Swap `levitate@targets` for `rush@targets` (pull inward toward caster) |
| Gravity Weapon | L | "Gravity lift" + `levitate@source` for a melee-damage buff — thin fit but acceptable since it's the caster's own channeled power | Low priority |
| Grease | L | Cast layer uses blue `water_splash.circle` for conjuring grease (brown oily slick); ground layer already correctly uses `grease.dark_brown.loop` | Tint the cast layer brown instead of blue for consistency |
| Grisly Growths | H | Gets the "Weapon manifests"/"Weapon flourish" sword-swing template (glint + melee_attack.magic_sword + spiritual_weapon trail) for a body-horror spell where the target's own flesh erupts extra limbs/eyes/organs — no weapon of any kind is involved | Replace with an eruption/growth visual (e.g. `aura_themed` outward burst or `claws`) instead of a magic-sword flourish |
| Grim Tendrils | L | Fine | — |
| Halcyon Mists | L | Fine | — |
| Heatvision | M | Part of "Divination scan" cluster; infrared heat vision starts with a fire-orange cast but switches to blue/green detect-magic circle and loop, inconsistent coloring for a heat sense | Keep orange/red tint throughout instead of switching to blue |
| Heinous Future | L | Fine | — |
| Helpful Steps | M | Uses `quarterstaff.melee.02` (a weapon swing) twice to represent conjuring a static ladder/staircase — looks like a combat flourish for a utility prop | Replace melee-swing layers with a construction-style glint/shimmer, no weapon swing |
| Holy Light | L | Fine, correctly uses divine_smite + sacred_flame | — |
| Hypnotize | L | Shares "Pulsing colored lights" template with several illusion-area spells — fine, consistent | — |
| Ice Storm / Eclipse Burst / Frozen Fog | L | `sleet_storm`/`darkness` templates fit their cold/dark themes correctly | — |
| Illusory Disguise | H | Gets the copy-pasted "Force shield raised" template for a spell whose entire effect is a *visual illusion changing the target's appearance* — there is no illusion/shimmer/mask visual anywhere in the recipe, only a shield raising | Replace with `shimmer.01.blue` + `markers.on_token_mask.complete.01.purple` (verified key) |
| Imaginary Weapon | L | Fine | — |
| Imp Sting | L | Fine, correctly themed poison | — |
| Impaling Spike | L | Fine | — |
| Implement of Destruction | L | Fine | — |
| Infectious Comedy | L | Fine | — |
| Instant Armor | M | Part of "Force shield raised" cluster; the fiction is armor *vanishing* into extradimensional storage, but the animation shows a shield being *raised* — backwards | Replace with a dissolve/fade (`shimmer` fading out) rather than a shield intro |
| Interposing Earth | L | Reasonably fits since it does raise an earthen barrier; ground_cracks cast layer is a good touch already present | Acceptable |
| Inner Radiance Torrent | L | Fine | — |
| Invisibility / Invisibility Cloak / Invisibility Curtain | L | Consistent shimmer+dissolve template, fine | — |
| Lashunta's Life Bubble | M | Part of "Force shield raised" cluster; an air-bubble breathing spell gets a generic shield instead of any bubble/air visual beyond the opening wind_lines cast layer | Add `bubble.001.001.complete.blue` for the bubble itself instead of shield.01 layers |
| Lay on Hands | L | Part of healing "Vitality bloom" cluster; fine fit, no scale differentiation needed at this level | — |
| Leng Sting / Leaden Steps / Light / Lightning Bolt / Lightning Storm | L | All fine, consistent with their themes | — |
| Life's Flowing River | H | Gets the "Force shield raised" template (shield.01.intro/loop) for a spell that creates a flowing *ghostly river of water* across the battlefield — completely unrelated visual; no water/ghost cue anywhere | Replace with `water_splash`/`liquid.blob.blue` + `glint` for a ghostly glow, matching the "flowing water" fiction |
| Lignify | L | Fine | — |

*Note: given the volume of entries (498 across both files), this table prioritizes clear mismatches (H), weak-but-fixable generic placeholders (M), and a representative sample of low-severity items; entries not listed were reviewed and judged acceptable as-is (correct delivery shape, reasonable color/theme match, normal scale/timing).*

### PF2e spells (part 3)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Magical Fetters | H | Description explicitly says "ghostly manacles... clasp around the target's limbs" but the travel/impact use a generic `energy_beam`/`energy_field` with no manacle shape at all | Use `markers.chain.spectral_standard.complete.02.purple` (already used correctly for Lock Item/Maze of Locked Doors) for the impact stage instead of `energy_field.02.above.purple` |
| Magic Stone | H | Ordinary sling bullets/stones shown as a giant `celestial_bodies.asteroid.single.iron.red.01` (a meteor-scale asset) at an absurd 20200ms duration for a non-persistent cast | Swap to `boulder.toss.02.01.stone.brown` or a small `glint`/`ward.star` sized down (s0.3-0.4), and cut duration to ~2-3s |
| Percussive Impact | H | "Compressed ball of sound" explosion is animated with liquid/water assets (`soundwave.01.blue` label "Gather liquid", `bubble.001.001.complete.blue` label "Moving glob", `shatter.blue` label "Liquid splash") — labels and bubble/glob imagery read as a water spell, not sonic | Replace `bubble.001.001.complete.blue` projectile with a sonic-styled projectile (e.g. `energy_field.02.above.blue` moving, or an existing `soundwave` projectile variant) and rename stages away from "liquid" |
| Power Word Kill | H | Instant-death word-of-power uses the same small `dizzy_stars` "Mental jolt" recipe as minor witch hexes (Over the Coals, Pact Broker) — no sense of scale for a kill spell | Give it a unique, larger key — e.g. `icon.skull.purple` at high scale + a `soundwave.02` burst — distinct from routine mental jolts |
| Magnetic Attraction | M | Metal objects pulled toward caster use `magic_missile.blue`/`purple` (a generic arcane-missile look) with no metal/magnetic theming | Use `aura_themed.01.inward.complete.metal.01.grey` (already used correctly in Magnetic Acceleration/Magnetize) for the travel stage instead |
| Magnetic Acceleration | M | Free-edition impact fallback is `impact.frost.white.01` for a bludgeoning+piercing metal projectile — reads as cold damage with no tint correction | Add `tint#c9c9c9` or swap fallback to `impact.009.orange`/`impact.boulder.01` |
| Needle Darts | M | Same frost-fallback issue: `F:impact.frost.white.01` for piercing metal needles in free edition | Swap fallback to `impact.009.white` (no frost) or add a neutral tint |
| Mad Monkeys | M | "Magical monkey spirits" piling and climbing use `spirit_guardians.blueyellow.ring`, the same somber religious-guardian ring reused elsewhere for ghosts/spirits — wrong register for mischievous monkeys | Use a livelier swarm asset (e.g. `butterflies`/`particles.inward` cluster already used for Pest Swarm/Moth's Supper) instead of the spirit-guardian ring |
| Living Thunderbolt | M | "Becoming a being of pure lightning" transformation only gets a faint `lightning_orb.01.loop.bluepurple` aura at o0.35 — too subdued for a full elemental transformation; motion is a weak `pulse@source d0.1` for a creature that now moves "at impossible speeds" | Raise aura opacity/scale, and swap motion to a fast `rush@source` to sell the speed boost |
| Metallic Meteorite Glyph | M | Projectile meteor duration (20500ms) and Magic Stone's reused asteroid asset both run far longer than the >8s non-persistent guideline for a single projectile delivery | Trim projectile duration to ~3-4s to match the impact timing |
| Mantle of Heaven's Slopes | M | Two identical `divine_smite.caster.blueyellow` "Open luminous mantle" layers fire at the exact same `+1250/2600ms` offset — redundant duplicate stacked layer | Remove one duplicate or stagger/differentiate the second layer (e.g. different scale/tint for a second "wing") |
| Scrying / Scrying Ripples | L | Both explicitly create a floating eye sensor but use the abstract "Divination scan" circle recipe instead of the `eyes.01` sensor look used correctly by Scouting Eye/Proliferating Eyes/Prying Survey | Swap to `eyes.01.dark_green.single`-based recipe for visual consistency with the other eye-sensor spells |
| Raise Dead / Revival / Resurrect / Reincarnate | L | True resurrection magic shares the same modest "Vitality bloom" visual as routine healing (Nature's Bounty) — no sense of scale for raising the dead | Scale up (larger burst, longer-held aura, brighter tint) to distinguish from minor Hit-Point healing |
| Reclined Apport | L | A "call a small item to my hand" cantrip-scale effect uses the same full `portals.horizontal.ring_masked` teleport-ring as whole-creature teleports (Rapid Retreat, Quandary) | Shrink scale substantially (s0.3-0.4) to match the trivial scope of the effect |
| Percussive Impact (cast stage) | L | Cast-stage label "Gather liquid" using `soundwave.01.blue` is just mislabeled text left over from a copy/paste of a water spell | Rename stage label to match sonic theme regardless of asset fix above |

### PF2e spells (part 4)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Sleep | M | Second stage labeled "Sleep symbol" uses `celestial_bodies.planet.no_atmo.03.grey` — a planet icon for a sleep effect, while a real sleep asset is already used in stage 1 | use `sleep.cloud.02.pink` or `dizzy_stars.200px.purple` instead of a planet icon |
| Unseen Heralds | H | Spell creates illusory talking "mouths" that transmit the caster's voice across the area, but uses `icon.mute.dark_red` (a muteness/silence icon) — opposite of the intended effect | replace with `soundwave.02.blue`/`icon.music_note` or a mouth/speech-themed icon, not mute |
| Thunderous Strike | M | Requires a two-handed melee weapon of any type, but animation hard-codes `quarterstaff.melee.01` — wrong for a greataxe, greatsword, etc. | replace with weapon-agnostic `melee_generic`/`unarmed_strike.magical` or a two-handed swing silhouette |
| Splinter Volley | L | Travels 3x as `arrow.cold.green` (a cold-element key tinted green) for a non-cold wooden-splinter piercing/bleed attack | use `arrow.physical.green` (verified key) instead of the cold-themed arrow |
| Stop Heart | M | "cruel grasp... squeeze at their heart," 10d10 void damage, yet impact uses `icon.heart.pink` — a soft pink heart reads as affection/healing, not a lethal void attack | use `icon.heart.dark_red` or add a purple/void tint |
| Unbearable Cacophony | M | Reality-breaking curse that makes all sound lethal; recipe is a weak `icon.music_note.blue` at s0.7 — far too small/generic for an area-wide "amplify every sound to damaging levels" effect | scale up with `shatter.blue` + wide `soundwave` burst |
| Variable Gravity / Unrelenting Gravity | M | Gravity-manipulation spells reuse the "Air lift and trailing shadow" flight recipe (`swirling_feathers`) — feathers have nothing to do with gravity control | drop feathers; use `energy_field` gravity ring only, no feather/wind asset |
| Vapor Form | M | Target becomes gaseous/amorphous but uses the feather-based flight recipe shared with Tiny Wings/Valkyrie wings | replace feathers with `shimmer`/`smoke.puff` mist dispersal, no feather asset |
| Trickster's Feathers | M | Illusory feather-guise disguise spell uses the generic "Force shield raised" recipe (`shield.01.intro/loop`) — a hard-light shield has nothing to do with an illusory disguise | replace with `shimmer.01` guise-shift effect instead of a shield bubble |
| Spell Turning / Spell Riposte | M | Both reflect spells back at the caster, but use a plain physical `shield.01.complete` rather than anything reflective | add `shimmer.01` or a mirrored look to sell "reflection," not just a generic shield |
| Teleport | M | Rank-7 signature long-range teleport (and heightened to 1 mile) uses the same small personal "departure shimmer" as a 10-ft reactive position-swap (Unexpected Transposition) | scale up `teleport.01.blue` (already used) and drop the tiny misty_step layer for a bigger gate flash reflecting the dramatic range |
| Teleportation Circle | L | Permanent ritual portal between two fixed points uses two small cosmetic icon stages (`icon.runes`, `ward.rune`), no actual portal/gate visual despite being literally a magic circle gate | add a `portals`/`magic_signs.circle` ground portal effect at s1.5+ |
| The Everfull Moon | M | Transformation into a Large hybrid werewolf battle form uses the identical generic "transformation silhouette" shimmer shared with minor cosmetic morphs (Snake Fangs, Spiked Carapace, etc.) — no beast/claw/fur cue at all | add `claws.200px` or a beast-tint to differentiate the lycanthrope transformation |
| Tree of Life and Death | M | Spell explicitly channels both life and death/vitality and void from two trees, but recipe is 100% the generic green "Vitality bloom" healing recipe with no void/death half | add a void-tinted mirror stage (second tree) alongside the green vitality stage |
| Unblinking Flame Aura / Unblinking Flame Ignition | L | Both are fire-patron abilities (heal/vitality-cold-resist and fire flight respectively) but use unmodified green heal recipe / uncolored feather flight with no fire tint | add orange/fire tint to the shared generic recipes |
| Summon Animal | M | Identical "Conjuration circle" recipe as Summon Construct/Fey/Plant/Undead/Instrument — no sense that an animal (vs. a robot or ghost) is arriving | tint green or add a small `claws`/paw-print flourish, consistent with how Summon Giant/Celestial/Dragon are already differentiated |
| Summon Construct | M | See above — identical to Summon Animal/Fey/etc. | tint grey/metallic with a `glint` flourish |
| Summon Plant or Fungus | M | Identical generic circle despite Summon Fey/Dragon/Giant getting thematic tints elsewhere | use `swirling_leaves`/green tint (already the established plant-spell language used across the file) |
| Summon Undead | M | Identical generic circle, no death/skull cue, while Summon Fiend gets `arms_of_hadar`+unholy smoke | add `icon.skull.purple` flourish |
| Summon Instrument | L | Identical generic conjuration circle for materializing a musical instrument — no musical cue | swap final stage for `music_notations` |
| Trickster's Mirrors | L | "Surrounded by up to 3 mirrors" uses `bubble.001.001.complete.blue` (a bubble) as the mirror stand-in, no glass/reflective look | use `shimmer.01` (already in stage 2) for the mirror itself instead of a bubble |
| Unfolding Wind Crash | M | Describes jumping up to 120 feet then slamming down for AoE damage, but motion is `levitate@source d0.25` — far too small a rise for a 120-ft leap | increase motion distance substantially (d2+) to sell the huge jump |
| Vision of Beauty / Vision of Death | L | Both private, target-only illusions use a shared `shimmer`/`icon.heart`/`icon.skull` combo that's indistinguishable from several unrelated mental-damage spells (Weird, Unspeakable Shadow) — acceptable but generic | low priority, consider unique color coding |
| Weapon of Judgment | L | "Immense weapon... hovering... ghostly" uses `spiritual_weapon.longsword.01.flaming.yellow` — flaming variant tinted, but spell has no fire trait (force/spirit only), flaming look misrepresents the damage type | swap to non-flaming spectral longsword variant |
| Wall of Flesh | M | 20-ft-tall, 3-ft-thick wall of living flesh gets only a thin `liquid.splash02.red` template + tiny `icon.heart.pink` at s0.5 — doesn't read as a wall at all | scale up red liquid/flesh template to match wall footprint; drop the small heart icon |
| Wish | M | Signature rank-10 reality-altering spell uses a minimal 2-stage generic recipe (`soundwave`+`energy_strands`) identical in scale/weight to minor divination cantrips | give Wish a larger, unique multi-stage recipe befitting its power level (e.g., `portals.vertical.vortex` + large `energy_field` + `twinkling_stars`) |
| Stormburst | L | "Voice projects like cracking thunder... summons localized storm" — no auditory/thunder-clap stage beyond the initial soundwave cast; the actual lightning/wind stages carry no thunder-boom moment | add a `shatter`/thunderclap burst alongside the lightning template |
| Thundering Dominance | L | "Amplify vocalizations... Thundering Roar" grants a roar ability but recipe never shows the roar motif (uses the shared generic Mental jolt recipe) | add a `soundwave`/roar cue distinguishing it from the other Mental-jolt reuses |
| Umbral Mindtheft | L | Steals "a broad field of knowledge" but uses `icon.runes02.orange` (orange, inconsistent with the shadow/purple palette used by its sibling spells Umbral Extraction/Umbral Graft in the same subclass) | retint to purple/shadow palette for consistency |
| Weird | L | 16d6 mental "worst fears" — three identical `icon.horror.purple` impacts plus one `claws` convergence; reasonable, but shares near-identical recipe with Unspeakable Shadow/Vision of Death, reducing distinctiveness for one of the game's signature illusion spells | consider a unique multi-fear-image asset/variation per stage instead of 3x the same icon |
| Vicious Jealousy | L | Label says "Social threads turn outward" but description is about isolating the target from allies (inward/severing) — stage labels/direction read backwards | relabel/flip strand direction to "inward" to match isolation fiction |
| Whirling Flames | L | Label repeats the spell's own name as a stage label ("Whirling Flames") rather than a descriptive action, inconsistent with the rest of the file's descriptive labeling convention | rename stage label to something descriptive like "Flame vortex rises" |
| Wildfire | L | Same self-referential "Wildfire" stage-label issue as above | rename to a descriptive label |
| Signal Skyrocket | L | Same self-referential "Signal Skyrocket"/"Glint"/"Firework"/"Particles" labels (generic one-word labels) inconsistent with the descriptive convention used elsewhere in the file | use descriptive action labels ("Rocket climbs," "Burst overhead," etc.) |
| Summerland Spell | L | A weather-calming ritual uses `flaming_sphere.200px.blue` (fire sphere) for "Temperate weather intent" — fire asset for a temperature-moderation (not fire) effect | swap to a neutral weather asset (e.g., `wind_lines`/`glint`) without the fireball-shaped sprite |
| Transmigrate | L | Funeral/reincarnation ritual's "Kiln fire" stage uses `flames.04.complete.blue` (blue=cold-coded in this file's convention) tinted orange via fallback swap, inconsistent flagging of element — low confusion risk only | verify tint consistently signals "fire/kiln," currently relies on F: fallback swap rather than base key |
| Shock and Awe | M | Illusion explicitly described as "cannons exploding, bullets and arrows flying, magical ballistics" — recipe is entirely generic purple/blue particle bursts and smoke puffs, none of which evoke cannons, bullets, or arrows | add a quick `arrow`/`impact.001` flicker among the particle bursts to sell "bullets and arrows," not just abstract purple puffs |
| Thicket of Knives | L | "Numerous phantom copies of your weapon arm" — recipe has only a generic `shimmer` cast stage and an unlabeled sprite; no sense of multiplying weapon-arm copies | add 2-3x repeated small weapon-flourish ghost copies instead of one shimmer |
| Timely Reminder / Telepathic Demand | L | Both reuse the identical "Quiet message and reply" soundwave recipe even though one is a delayed self-reminder and the other is a hostile Suggestion-equivalent mental intrusion — no severity distinction | add a harsher/purple tint to Telepathic Demand's version to distinguish coercive from benign message spells |
| Zero Gravity | L | "Negate gravity... creatures float" uses `energy_field` + `swirling_sparkles` at modest o0.25/o0.4 — fairly weak/transparent for a dramatic full-area zero-g effect | raise opacity slightly and/or add more particles to read clearly as "floating," distinct from the unrelated gravity-ring recipe used by Variable Gravity |
| Tortoise and the Hare | L | Speed is transferred from one creature to another (foe slows, ally speeds up) but only the foe gets an icosahedron "time slows" impact — the ally who becomes Quickened gets no visual payoff | add a `wind_lines` burst on the ally target receiving the speed |

### PF2e feats (part 1)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Collapse Wall | H | Stone/wood wall collapsing onto a creature uses `wall_of_fire.500x100.blue`, a fire-wall asset merely recolored — silhouette still reads as flame curtain | Replace with `falling_rocks.side.1x1.grey` (verified key) for the foundation stage |
| Amalgamate | H | Fusing two necromancer thralls into an abomination uses `sacred_flame.target.purple` (holy flame) for the base, `divine_smite` undertone for the rising manifestation | Use necrotic/physical fusion visuals: `liquid.blob.purple`/`energy_strands.in.red.01` instead of sacred_flame/divine_smite |
| Abscission Shards | H | Claw-shard **bleed** damage impact uses `divine_smite.target.red`, a holy light-pillar burst, merely tinted red | Swap to `liquid.splash_side02.red` (already the free fallback — promote it to the Patreon key too) for a blood-shard look |
| Bone Burst | H | Necromantic bone-shard explosion impact uses `divine_smite.target.dark_purple` (holy smite) | Use `ground_cracks`/`impact.001` + bone-white particle accents instead of the divine-coded burst |
| A Hush Falls Over the World | M | Auditory silence/concealment effect visualized with ordinary smoke puffs; nothing communicates "sound is gone" | No dedicated silence key exists in inventory; use a darker, static `darkness.black` tinted aura rather than smoke, which reads as fog/stealth not silence |
| Call Worm Spirit | M | Ghostly worm maw erupting from the ground uses `sacred_flame.target.yellow` (holy fire) | Use `ground_cracks.01` + a creature-attack bite impact (`melee_generic.creature_attack.*`) instead of holy flame |
| Call the Swarm (ratfolk) | M | Rat swarm summon uses `toll_the_dead.skull_smoke` ⚠ (death-bell skull smoke) and `smoke.puff.centered` | No rat/swarm key exists; at minimum drop the skull-bell motif (too death-cult) for plain `ground_cracks`/`smoke.puff` |
| Beastmaster's Call | M | Summoning a non-active animal companion projection uses `call_lightning.high_res.purple` (lightning summon) regardless of companion type | Use a neutral conjuration flash (`cast_generic`/`magic_signs.circle.02.conjuration`) instead of lightning-specific asset |
| Celestial Cacophony | M | Description explicitly calls out fireworks/sparklers and a cone of fire+**sonic** damage; recipe has zero sonic/soundwave element, only fire | Add a `static_electricity`/soundwave-style burst alongside `fireball.explosion.orange` to represent the sonic half |
| Anatomical Quartering | M | Final different-foe Strike "becomes spirit damage" rendered with `divine_smite.target.yellowwhite` (holy) on a necromancer archetype ability | Use a spirit/ghost-toned `energy_strands` or pale `energy_field` burst instead of the holy-coded smite |
| Blood Pool / Draining Strike / Bleed Out | M | Blood-magic/necromancer bleed-pool healing effects lean on `divine_smite`/`energy_strands.in.red` mixed inconsistently; some use holy-adjacent assets for unholy blood magic | Standardize necromancer blood-magic recipes on `liquid.blob.red`/`liquid.splash_side02.red`, never divine_smite |
| Dazzling Dragonet Disappearance | L | Scale-flash + vanish (Invisibility) uses smoke plume "Veil spreads" for what the text describes as a sheen/flash, not smoke | Use `glint`/`dancing_light` flash for the dazzle moment, keep shimmer only for the vanish |
| Dalang's Ally | L | Shadow-puppet flanking via the user's own shadow uses generic smoke puff | A shadow-specific tint (dark, low-opacity `shimmer` or `darkness.black`) communicates "shadow" better than smoke |
| Dream Guise | L | Two creatures merging into a shared illusory appearance uses the stock polymorph `shimmer.01.purple`, indistinguishable from every unrelated transformation | Fine given no illusion-specific morph key, but consider `shimmer` paired with a `glint` overlay to mark it as illusory rather than physical |
| Bat Form | L | Transforming into a bat uses generic blue shimmer | Swap to `bats.loop.01.*` (verified present) to actually depict a bat |
| Alloy Flesh and Steel | L | Body becomes living metal, but cast/aura uses plain blue shimmer, no metallic cue | Tint shimmer silver/grey or use existing `aura_themed.01.inward.*.metal.01.grey` |
| As a Thousand Soldiers | L | Transforms into a swarm of bees; no bee/swarm/insect key exists in the inventory | Acceptable fallback (green shimmer) given no asset exists; note for future asset acquisition only |
| Ash Strider | L | "Cloud of whirling ash" uses `wind_lines.01.leaves.01.greenorange`, a leaf-wind effect with no ash/smoke texture | Prefer a smoke-toned wind trail (`smoke.puff`-derived) over leaf particles for an ash cloud |
| Decree of Execution / Decree of War / Decree of Prosperity | L | Mythic decrees (lethal judgement, call to arms, blessing) all rendered with the bardic "Call encouragement" music-notation template, which specifically reads as a song/performance | Replace music_notations with a commanding `toll_the_dead`/`eyes`-style glyph for non-bard "decree" fiction |
| Command Attention / Confusing Commands / Converge | L | Commander-class vocal commands rendered with bard music-note glyphs | Same as above — use a non-musical command cue |
| Acquired Tolerance / Archaeologist's Luck / Black Cat Curse / Cat's Luck / Chance Death / Charmed Life / Clean Take / Correct the Story / Courteous Comeback / Crafter's Instinct / Define "Report" | L | All identical fortune-reroll recipe using an abjuration circle that free-falls back to an unrelated illusion circle | Use a school-neutral "luck" loop instead of a specific-school magic circle to avoid the abjuration→illusion free-edition mismatch |
| Blasting Beams | L | Description says "a directed beam of heat **or an arc of lightning**" — recipe only shows a generic purple energy beam, no lightning-specific variant option | Offer a `lightning_bolt`/`static_electricity` travel variant alongside the generic beam for the lightning flavor text |
| Blazing Aura / Aura Expertise / Beguiling Aura / Dominion Aura | L | Fire/mental/force auras all reuse the metal-plate-motif `aura_themed.01.inward.loop.metal.01.*` regardless of element | Swap non-metal auras to `fire_ring`/`energy_field`/plain colored loop instead of the metal motif |
| Blast Lock / Blast Tackle / various firearm Strikes | L | Firearm Strikes targeting a lock or grapple use the standard `impact.ground_crack`/`impact.005` — acceptable, no fix needed, listed only to confirm firearm recipes were checked and are reasonable |
| Battle Hymn to the Lost | L | Spirits of dead warriors surge out in a cone/emanation but recipe only shows melee contact + generic glint, no ghost/spirit visual despite explicit "spirits of warriors" text | Add a `ghost`/pale `energy_strands` overlay on the cone/emanation stage to depict the spectral warriors |
| Brandish Authority | L | Manifesting a visible sign of authority (crown of flame, scepter of souls, throne of skulls) uses plain `eyes.01` + `toll_the_dead` bell; no fire/skull cue despite flavor text offering fire/skull/soul options | Low priority — text is GM's choice of flavor, current neutral glyph is a reasonable default |
| Begin Stampede | L | Minotaur charges and Strikes with horns, but impact key is `melee_generic.bludgeoning.one_handed F:unarmed_strike.physical.02.blue` — generic unarmed, not horn-specific | Use `melee_generic.creature_attack.*` horn/charge variant if one exists, otherwise acceptable fallback |
| Belly Flop | L | Fist/gauntlet Strike while dropping prone in heavy armor — uses `melee_generic.creature_attack.fist.002.blue`, reasonable, but no "heavy armor slam" weight cue (no ground shake) despite "crush under enormous weight" text | Add a light `shake@targets` motion cue to sell the weight, currently missing |
| Blazing Talon Surge | L | Fire talon Strike while grappling — impact key `melee_generic.slash.01.orange` (orange = fire-coded, OK) but aura `entangle.02.loop.03.dark_orange` for the grapple hold is reasonable; flag only that this is one of the few correctly fire-tinted claw Strikes, included as a positive control, no fix needed |

### PF2e feats (part 2)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Elemental Explosion | H | Barbarian emanation blast matches the rager's chosen element (fire/cold/electricity/acid/sonic) but renders as a static purple `cast_generic`+`magic_signs.circle.02.evocation` rune circle regardless of element | Branch art per chosen element: `fireball.explosion.orange` (fire), `ice_spikes` (cold), `chain_lightning`/`static_electricity` (electricity), verified keys exist in inventory |
| Explosive Death Drop | H | Monk fire grapple-drop detonation's impact stage uses `energy_field.01.blue` — blue on a fire finisher | Retint impact to `impact.fire.01.orange` or `fireball.explosion.orange` |
| Ferocious Will | H | Mental-damage reflection reaction uses `sleep.target`/`sleep.target` assets with no sleep involved | Swap to `energy_strands`/`dizzy_stars` mental-damage art |
| Kashrishi Revivification | H | Death-save recovery to 1 HP uses `sleep.symbol`/`sleep.cloud.01.pink` | Replace with `healing_generic.03.burst`/`bless.200px` recovery burst |
| Eternal Torch | M | Conjures a magical torch flame; shown with `plant_growth` ring + `swirling_leaves` (foliage) | Use `flaming_sphere.200px` or `dancing_light`, colored to the chosen flame color |
| Flashforge | M | Conjures a metal item/tool; shown with `plant_growth` ring (foliage) | Use a metal/rune sparkle, not plant growth |
| Goblin Club | M | Conjures a spectral ghost-touch club; shown with `plant_growth`/`swirling_leaves` | Use `spiritual_weapon.club.01.astral` (already in use elsewhere in this file) |
| Lightning Tongue | M | Tongue snatches a nearby object (no conjuration); shown as plant growth sprouting an item | Replace with a quick tongue-lash/impact cue, not foliage |
| Ensnaring Disarm | M | Knocks a weapon loose for a student to catch; shown with `plant_growth` ring + `swirling_leaves` (foliage), unrelated to a dropped weapon | Replace with a glint/impact on the dislodged item |
| Harbinger's Caw | M | Curses target with misfortune; rendered with the same bright `twinkling_stars.points04.orange` used for ally fortune buffs | Use a dark/ominous variant for misfortune-imposing effects |
| Ill Tide | M | Same misfortune-curse-as-bright-fortune-twinkle issue | Dark/ominous variant |
| Fluttering Distraction | M | Forces an enemy's attack to reroll-take-lower (misfortune) shown with the same bright twinkle as ally buffs | Dark/ominous variant |
| Infinite Expanse of Bluest Heaven | M | Illusory endless-sky vertigo effect uses `sleep.target.blue`/`sleep.cloud.01.blue` | Use an illusion-circle or sky-colored asset instead of sleep art |
| Lava Leap | M | Fiery leap+wave finishes on `shield.01.loop.blue` "cooling shell" | Retint to orange/red to match the molten theme |
| Imprison Foe | M | Extradimensional-prison banishment aura ends on `entangle.02.loop...green` ⚠ (vines) | Replace vine-entangle with a portal/void-closing effect; vines imply physical restraint, not banishment |
| Guardian Lion Roar | M | Sonic roar (line template) travel/impact uses `energy_beam.normal.blue.01` — a generic magic beam, not sound | Use a `shatter`/soundwave-style key for travel and impact |
| Frog Geyser | M | Cast stage correctly uses `water_splash.circle.01.blue`, but the travel stage switches to the generic `energy_beam.normal.blue.01` mid-recipe | Keep water_splash/liquid imagery through the travel and impact stages |
| Hurricane Swing | M | Player's choice of Lightning Bolt *or* Gust of Wind both render identically via `energy_beam.normal.blue.01` | Branch: `chain_lightning`/`lightning_bolt` for the lightning choice, `wind_lines` for the gust choice |
| Kobold Breath | M | Breath shape/damage type varies by draconic lineage (fire/cold/acid/electricity/poison; line or cone) but always renders as fixed dark-purple `cast_generic` + `particle_burst` | Tint cast/impact to the chosen damage type |
| Instinctive Obfuscation | M | An illusory double appears to bait an attack; rendered with the same grey `smoke.plumes` veil used for stealth/invisibility feats, not a duplicate-image effect | Differentiate from generic concealment smoke; at minimum retint distinctly |
| Heat Wave | M | Concealment is specifically "a screen of heat and smoke" from resisted fire damage, rendered with plain grey `smoke.plumes_loop` | Use an orange/heat-shimmer tinted smoke, not neutral grey |
| Extraplanar Haze | L | Crystalline motes / smoky vapor concealment uses the same flat grey smoke as every other stealth feat | Add a crystalline sparkle tint to distinguish from mundane smoke |
| Invigorating Breath | L | Spirit guide's healing "breath" grants temp HP, rendered with `cast_generic.01.dark_purple` + `magic_signs.circle.02.evocation` rune circle — no breath/wind visual at all | Use `wind_lines` or a soft glow in place of the rune circle |
| Feral Mending | L | Nature healing while shapeshifting mixes a `cast_generic.01.dark_purple` cast with a green `swirling_leaves` aura — inconsistent coloring | Unify both stages to green/nature tones |
| Giant's Stature | L | Growing Large uses only the generic polymorph `shimmer.01`, with no scale-up cue | Increase aura/impact `s` scale to visually sell the size increase |
| Falcon Swoop | L | Flies twice toward prey but uses the ground-dash `rush@source` motion, no fly/levitate component | Use `fly`/`levitate` motion instead of ground rush |
| Glider Form | L | Eidolon glide descent uses ground-dash `rush@source d1.8` instead of a falling/gliding motion | Use `levitate`/`fly` with downward bias instead of rush |
| Goring Charge | L | Minotaur horns Strike (piercing, causes persistent bleed) falls back to a bludgeoning-flavored `melee_generic.bludgeoning.one_handed`/generic blue unarmed key | Use a piercing-tinted unarmed/claw key to match the described piercing horns |

### PF2e feats (part 3)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Megavolt | H | Native area is a `line` (distance 20/line) but delivery is `travel energy_beam.normal.blue.01`, a point-to-point beam, not a line-template asset | Use `breath_weapons.lightning.line.blue` (verified) sized to the line template instead of a beam |
| Molten Wire | H | Fire-trait trap; impact stage uses `energy_field.01.blue` — blue reads as cold/lightning, contradicts the orange cast and entangle aura | Swap to `energy_field.01.yellow` or add `tint#ff6a00` |
| Scorching Disarm | H | Same bug as Molten Wire: fire cast → blue `energy_field.01.blue` impact → orange aura, breaking the fire palette mid-sequence | Swap impact to `energy_field.01.yellow`/orange tint |
| Pit of Snakes | H | Burst of snakes rendered as `fumes.toxic.green` (poison gas look), no snake asset and no gas damage in the feat | Replace with `entangle.02.complete.02.green` (writhing mass, verified) for both foundation and loop stages |
| Oversized Throw | H | Hurling a boulder/log/table/wagon rendered as a thin `arrow.physical.blue` projectile — wrong delivery shape for a heavy thrown object | Swap travel to `boulder.toss.01.01` and impact to `impact.boulder.01` (both verified) |
| Quill Spray | M | Cone of piercing quills uses `divine_smite.target.*` (a holy-smite flash) for the impact — no piercing/quill read at all | Swap to `ice_spikes.radial.burst.grey` retinted brown, or a small `arrow.physical` burst, to suggest embedded quills |
| Rock Rampart | M | 40-ft wall of stone rendered with `rolling_boulder.loop.01.rock.brown` — a rolling-boulder animation, not a static wall | No wall_of_stone key exists; use the static `ground_cracks.01` foundation/loop pair already used for other earth walls instead of the rolling motion asset |
| Scorching Column | M | A 30-ft-tall vertical cylinder of fire rendered as a single radial `fireball.explosion.orange` burst — reads as a one-time blast, not a standing pillar | Use `wall_of_fire.100x100.yellow` oriented vertically for the aura/loop stage instead of (or in addition to) the explosion |
| Rising Hurricane | M | 40-ft-tall hurricane cylinder that lifts/drops creatures rendered as `water_splash.circle.01.blue` + a small bubble loop — far too small/static for the fiction | Swap to `whirlwind.bluewhite` (verified, already used correctly in Purifying Breeze) |
| Ride the Tsunami | M | "Booming, crashing walls of water" filling a cone/line up to 90/180 ft rendered as a small `water_splash.circle` at default scale | Scale up significantly (s2+) and/or swap to `whirlwind.bluewhite`/bubble-loop combo sized to the line/cone |
| Regurgitate Mutagen | L | Acid spit: travel uses green `arrow.poison.green.01`, impact flips to `liquid.blob.blue` — inconsistent color mid-flight (green→blue) | Make impact `liquid.splash_side02.green` (verified) to stay consistent acid-green throughout |
| Rotten Slurry | L | Same green→blue inconsistency: travel `arrow.poison.green.01`, impact `impact.001.green F:impact.001.blue` — free-edition fallback flips the color entirely rather than just losing detail | Pick a fallback that preserves green tint (e.g. apply `tint#6b8e23` to whatever free key is used) so Free users don't see a blue "rotten slurry" |
| Scrap Barricade | L | Welded scrap-metal barricade uses `impact.005.white` + `glint.blue.few` — reads as ice/frost, not rusted scrap | Retint brown/orange to match the "ragged pieces of metal" fiction |
| Mind Shards / Mental Static / Psi Burst / Psi Catastrophe / On Borrowed Time / Promise of Pain / Shame the Sin / Mask of Pain / Muckraking / Remember Their Names | M (cluster) | All ten pure-mental-damage feats use the `sleep.target` sleep/moon icon for impact+aura, implying a Sleep effect none of them have | Swap to `energy_strands.02.marker.bluepurple` or `particles.outward` pink/purple for a damage-only psychic read; reserve `sleep.*` for actual slumber effects |
| Point Blank Stance / Multishot Stance / Mobile Shot Stance / Monastic Archer Stance / Ricochet Stance (Fighter) / Ricochet Stance (Rogue) / Paragon's Guard / Opening Stance / Reflexive Stance | L (cluster) | Pure martial-readiness stances (no elemental trait) get the same `impact.005.purple` + `energy_field.02.above.purple` halo as elemental stances | Drop the elemental halo for these; use a plain weapon-glint cast instead, reserving energy_field for stances explicitly tied to an element |
| Shimmer-transformation cluster (Long-Nosed Form, Oni Form, Rat Form, Phantom Visage, Pesh Skin, Project Persona, Quick Shape, Rapid Hybridization, Reactive Transformation, Return to the Sea, Scoundrel's Surprise) | L (cluster) | Identical `shimmer.01` scale/tint regardless of target form's size/fiction (tiny rat vs Large Oni both s1) | Scale shimmer to the described form size and tint toward the form's dominant color |
| Defend/shield-bubble cluster (Mountain Stronghold, Negate Damage, Null Field, Orc Superstition, Pain is Temporary, Planar Sidestep, Preemptive Reconfiguration, Prescient Parry, Preternatural Parry, Prevailing Position, Reactive Resilience, Reactive Shield, Redirecting Draft, Repel Assault, Resilient Chassis, Sacred Defense, Sacrifice Armor, Saving Slash, Scars of Steel, Scattering in Spring, Sense the Strike) | M (cluster) | ~20 entries render an identical generic magic shield bubble for resistances/dodges that are not all magical (mundane Athletics dodge, physical toughness, nanite repair) | Differentiate: divine → `ward.rune.yellow.01`; tech/android → non-shield circuit cue; purely physical (no magic trait in the feat) → drop the magical shield bubble entirely for a plain parry flash |
| Prepare-focus/offer-support glint cluster (100+ entries across both files) | M (cluster, systemic) | A single sparkle (`glint.*.few`) stands in for poison, divine favor, mythic power, nanite activation, memory, and dozens of other fictions with no visual distinction | Route element/trait-flagged feats (fire, poison, divine, mythic, tech) to the matching themed family already used correctly elsewhere in the catalog instead of defaulting to glint |

## Note on coverage

Both part files (576 entries total) were read in full. The overwhelming majority of entries are reaction/stance/support feats built from a small set of shared templates (glint-prepare, shield-defend, wind-lines-move, shimmer-transform, sleep-mental, spellshape-prep) — these are addressed as systemic patterns above rather than one row per nearly-identical entry, per the brief's instruction to report large clusters once. Entries not listed (the large majority) use reasonable, trait-appropriate recipes and were not flagged.

### PF2e feats (part 4)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Solar Detonation | H | Fire explosion aura is `fire_ring.500px.blue` — wrong color for fire; free fallback (red) is correct, paid key isn't | Use `fire_ring.500px.orange` ⚠ (verified key) instead of `.blue` |
| Slowing Strike | H | Plain wound/slow Strike shows `divine_smite.target.dark_purple` — holy-smite visual with no divine trait in the feat | Replace with `impact.ground_crack.01.purple` or a neutral `impact.001.purple` ⚠ |
| Thrash | H | Barbarian bludgeoning grapple-squeeze shows `divine_smite.target.dark_purple` | Replace with `unarmed_strike.physical.02.purple` ⚠ |
| Snakebird's Shadow | H | Melee sword Strike against each enemy in a line delivered via `travel[Directed beam] energy_beam.normal.blue.01` — implies a ranged beam, not a weapon swing | Drop the beam travel; use `melee_generic.slash.01/02.*` impacts per target along the line |
| Wild Winds Gust | H | Unarmed "wind crash" cone/line Strikes delivered via `travel[Directed beam] energy_beam.normal.blue.01` — beam implies ranged attack, this is melee/unarmed | Drop the beam; fan `unarmed_strike.physical.02.blue` impacts across targets instead |
| The World Devours | M | Earth-engulfing ability uses `ground_cracks.01.blue` — blue crack for an earth/ground effect | `ground_cracks.01.orange` |
| Treacherous Earth | M | Same blue-crack-for-earth issue | `ground_cracks.01.orange` |
| Tremor | M | Same blue-crack-for-earth issue | `ground_cracks.01.orange` |
| Stomp Ground | M | Same blue-crack-for-earth issue | `ground_cracks.01.orange` |
| Stepping Stones | M | Foundation stage uses `ground_cracks.01.blue` for rock disks | `ground_cracks.01.orange` |
| Stone Forge of the First | M | Conjured stone forge uses `ground_cracks.01.blue` | `ground_cracks.01.orange` |
| Shifting Terrain | M | Rippling ground effect uses `ground_cracks.01.blue` | `ground_cracks.01.orange` |
| Smoothing Stomp | M | Magic-of-creation ground wave uses `ground_cracks.01.blue` | `ground_cracks.01.orange` |
| Start the Festival! | M | Tanuki trampling ground uses `ground_cracks.01.blue` | `ground_cracks.01.orange` |
| Tectonic Stomp | M | Tremor-topple ground effect uses `ground_cracks.01.blue` | `ground_cracks.01.orange` |
| Trample Mimicry | M | Trample impact-per-victim uses `ground_cracks.01.blue` | `ground_cracks.01.orange` |
| Wake and Tremble | M | World-rouse convulsion uses `ground_cracks.01.blue` | `ground_cracks.01.orange` |
| Weight of Stone | M | Falling-boulder cataclysm foundation stage uses `ground_cracks.01.blue` | `ground_cracks.01.orange` |
| Whirling Grindstone | M | Flint grindstone foundation uses `ground_cracks.01.blue` | `ground_cracks.01.orange` |
| World-Breaking Footfall | M | Kaiju-stance ground-shatter uses `ground_cracks.01.blue` | `ground_cracks.01.orange` |
| Shove Down | M | Mundane Trip-after-Shove shows a glowing spectral mace aura (`spiritual_weapon.club.01.astral.01.purple`) with no magic in the fiction | Replace aura with plain dust puff, e.g. `smoke.puff.side.dark_purple` at low opacity, or drop the stage |
| Shoving Sweep | M | Same unwarranted spectral-weapon aura on a mundane two-handed weapon Shove | Replace with dust/impact cue, no magic weapon |
| Staff Sweep | M | Same unwarranted spectral-weapon aura on a mundane staff Shove/Trip | Replace with dust/impact cue |
| Stay Here! | M | Same unwarranted spectral-weapon aura on a mundane Trip+Strike | Replace with dust/impact cue |
| Tail Spin | M | Same unwarranted spectral-weapon aura on a goblin tail-Trip | Replace with dust/impact cue |
| Toppling Transformation | M | Same unwarranted spectral-weapon aura on a polymorph-triggered Shove/Trip | Replace with dust/impact cue |
| Topple Foe | M | Same unwarranted spectral-weapon aura on an Athletics Trip | Replace with dust/impact cue |
| Tumbling Opportunist | M | Same unwarranted spectral-weapon aura on an Acrobatics Trip | Replace with dust/impact cue |
| Unbalancing Sweep | M | Same unwarranted spectral-weapon aura on a mundane Shove/Trip sweep | Replace with dust/impact cue |
| Wing Buffet | M | Same unwarranted spectral-weapon aura on a draconic wing buffet (physical, not magic) | Replace with dust/impact cue or wind-puff |
| Wing Shove | M | Same unwarranted spectral-weapon aura on a mundane double-Shove | Replace with dust/impact cue |
| Wing Bounce | M | Same unwarranted spectral-weapon aura on a physical Leap+Trip | Replace with dust/impact cue |
| Thunderous Landing | M | Free-tier fallback `impact.frost.white.01` adds unintended cold/frost to a non-elemental fly-landing shockwave | Use a neutral free fallback (e.g. `impact.001.white` ⚠) |
| Twist the Knife | M | Stealth bleed-wound uses `toll_the_dead.red.bell` (a dirge-bell cue) instead of a blood/bleed visual; free fallback `liquid.splash_side02.red` is actually more on-theme than the paid pick | Swap Patreon key to a blood-splash asset, e.g. `liquid.splash_side02.red`, keep bell only for actual Demoralize/fear effects |
| Shrink Down | L | Generic size-change shimmer gives no visual cue of actually shrinking | Scale the shimmer/aura down progressively (s-value ramp) instead of static s1, to sell the size reduction |
| Spike Skin | L | "Skin hardens with spiky protrusions" shown only as generic blue shimmer, no spike/armor cue | Consider `energy_field` replaced with a crystalline/spike-textured overlay if available, otherwise acceptable as-is |
| Vine Lash | L | Whip-vine attack correct in concept (swirling_leaves travel + vine impact) but travel duration (5722ms) is long for a 30 ft melee-range whip compared to peers (~1800-2500ms) | Shorten travel duration to ~1800-2000ms to match similar reach attacks |
| Siege Celerity / Steal Time / Timeline-Splitting Spell / Tempo Shift cluster | L | "Temporal focus" circle-magic cue reused identically for all time-themed feats regardless of effect (haste vs. slow vs. reroll) — acceptable but could differentiate haste (yellow/gold) vs. slow (dark/grey) tint | Tint the loop stage by effect: gold for speed-up, grey/dark for slow-down |
| Smoke Curtain | L | Firearm shot creates a lingering emanation smoke cloud (concealment area) but recipe has no persistent aura/template stage for the cloud itself, only cast+travel+impact at the shooter/target | Add an `aura`/area stage for the smoke cloud (e.g. `smoke.puff.centered` with persist) distinct from the shot's own cast/impact |

Coverage note: both files were read in full (289 + 286 lines). The great majority of entries are reaction/buff/skill feats sharing the module's standard glint/shield/energy_field/toll_the_dead vocabulary, which is internally consistent and not flagged individually; fixes above target the concrete color/semantic/delivery-shape errors and the clusters large enough to warrant a systemic change.

### PF2e weapons (part 1)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| ~70 firearm entries (Flintlock Musket/Pistol, Arquebus, Blunderbuss, Jezail, Hand Cannon, Pepperbox, Gun Sword, Axe Musket, etc. — see pattern list) | H | Patreon default ammo key is `bullet.01.blue`/`bullet.02.blue`, a magical-looking glowing bolt, for ordinary black-powder guns; the mundane-looking `orange` variant is relegated to the free-tier fallback only | Swap default to `bullet.01.orange`/`bullet.02.orange` (verified in both Patreon and Free lists); keep blue/purple/green/red + elemental keys only for weapons with the `magical` trait and an explicit elemental rider |
| Same ~70 firearm entries | M | No muzzle-flash `cast` stage at the shooter for any gun | Add `cast[muzzle flash] muzzle_flash.single.01.yellow` (verified key) at the firing position before the travel stage |
| Drake Rifle (Electricity) [ranged] | M | Free fallback for the lightning travel stage is `eldritch_blast.purple` (force-colored), contradicting the electricity damage type | Use `lightning_bolt.narrow.blue` (verified in jb2a-free-keys.txt) as `F:` fallback instead |
| Scalding Gauntlets [melee] (base rank) | H | Has `fire` trait and Pyric-fire flavor text but recipe is only `impact[unarmed contact]` — no fire finish, while the Greater/Major/True versions two entries later correctly add `impact[fire finish] impact.fire.01.orange` | Add the same fire-finish stage to the base-rank entry |
| Four-Ways Dogslicer [melee] | M | Weapon explicitly has cold, electricity, and fire traits (four-energies blade) but animation is plain `sword.melee.01.white` contact only — no elemental cue at all | Add at least one elemental `impact` finish (fire/cold/electricity, e.g. rotate or default to `impact.fire.01.orange`) matching its described gems |
| Blade of Four Energies [melee] + (Greater) | M | Described as formed of acid/cold/fire/electricity magical energy, but recipe shows only `impact[shortsword contact]`, no elemental finish on either rank | Add at least one representative elemental finish stage (acid/cold/fire/electricity) to both entries |
| Four-Tiger Blade [melee] | M | `divine` trait, forged "once-in-a-lifetime" legendary blade, but no spirit finish while comparable divine longswords (Chalice of Justice, Righteous Fury) get `divine_smite.target.yellowwhite` | Add `impact[spirit finish] divine_smite.target.yellowwhite F:divine_smite.target.blueyellow` |
| Azarim [melee] | M | `divine`, `holy`, `good`, intelligent weapon with no spirit/holy finish, unlike peer intelligent divine weapons (Piereta) which do get one | Add spirit finish stage |
| Guiding Star [melee]/[thrown], Guiding Starknife [melee]/[thrown] | M | All four modes are explicitly `divine`+`holy` starknives but show only plain dagger contact/throw, no spirit finish | Add `impact[spirit finish] divine_smite.target.yellowwhite` on the impact stage of each mode |
| Alghollthu Lash/Whip, Branch of the Great Sugi, Giant Squid Lash, Lady's Spiral, Crimson Thorn/asp-coil whip mode | M | Whip strikes render as a sword-shaped slash (`melee_generic.slash.01.bluepurple`) because no whip asset exists in JB2A; the undyed blue-purple hue reads as cold/void magic even for mundane-feeling leather whips | Keep the generic slash as the best-available substitute, but tint non-elemental whips brown/black (e.g. `tint#4a3728`) so they don't visually read as an elemental attack; leave the blue-purple only on items with a cold/void/occult theme |
| Hardened Harrow Deck [melee] | L | Stage label is malformed: `impact[contact contact]` (duplicated word) using `melee_generic.bludgeoning.one_handed F:melee_generic.slash.01.orange` for a thrown-card weapon that deals piercing damage | Relabel stage "Contact finish"; consider a thin blade/dagger-style key instead of the bludgeoning generic since cards cut, they don't bludgeon |
| Dragon's Tongue / (Greater) / (Major) [melee] | L | Weapon traits list is just `spear`, dmg:slashing (longspear carved to cut, not stab) but uses `impact[spear contact] spear.melee.01.white` (a piercing-style thrust animation) despite slashing damage type | Low priority — consider a glaive/slashing spear-swing key instead of the thrust-style spear contact, to match the slashing damage type |
| Dragonprism Staff / (Greater) [melee] | L | dmg:slashing on a quarterstaff-family weapon (all other staves in this family are bludgeoning) but uses the same bludgeoning `quarterstaff contact` key as every other staff | Low priority / likely fine as a generic staff swing, but note the damage-type mismatch if a slashing-staff variant key is ever added |
| Bladed Hoop [melee] | L | A spinning bladed ring (slashing, sweep, two-hand) renders as a single dagger-contact hit (`dagger.melee.02.white`) scaled down (s0.85) — undersells a sweeping disc weapon | Consider the `handaxe`/`greataxe`-sweep key or a wider slash effect scaled up instead of the small dagger key |
| Granny's Hedge Trimmer [melee] | L | A "polearm with whirring blades" (hedge-trimmer) uses the plain `glaive contact` key — reasonable given no hedge-trimmer asset exists, but worth a buzzsaw-style key (as correctly used on Buzzsaw Axe) if ever added | No action needed now; flagged for awareness only |
| Four-Ways Dogslicer, Blade of Four Energies, Scalding Gauntlets (base) grouped quality note | M | See pattern bullet 7/9 above — base-rank/multi-element items in this file systematically drop the elemental cue that their own upgraded siblings keep | Sweep for any weapon whose trait list includes an element but whose stage list has zero matching `impact[... finish]` |

### PF2e weapons (part 2)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Starknife [melee] | H | Empty `S:` field — no animation plays at all | add `impact[dagger contact] dagger.melee.02.white s0.85 +500/1750ms sel:first` (matches other agile piercing knives) |
| Starknife [thrown] | H | Empty `S:` field — no animation plays at all | add `travel[chakram flight] chakram.01.throw.01 F:dagger.throw.01.white s1 +500/2083ms sel:first ; impact[Contact finish] impact.001.blue s0.65 +1350/1450ms sel:first` (compass-rose ring shape fits the chakram-family asset) |
| Wish Knife [melee] | H | Empty `S:` field — no animation plays at all | add `impact[dagger contact] dagger.melee.02.white s0.85 +500/1750ms sel:first` (same family as Wish Blade/other knives) |
| Unholy Water [thrown] | H | Travels on `hammer.throw` (a spinning-hammer-shaped asset) instead of a vial; impact uses `divine_smite.target.yellowwhite`, the holy-radiance color, for an explicitly unholy/evil item | travel: `throwable.throw.flask.01.black s0.75 +625/3683ms sel:first` (exists in both editions); impact: `divine_smite.target.dark_purple F:divine_smite.target.blueyellow s0.65 +1475/2483ms sel:first` |
| Tamchal Chakram [melee] | H | dmg:slashing but resolves to `melee_generic.bludgeoning.one_handed`; a dedicated chakram asset exists and isn't used | `impact[chakram contact] melee_attack.01.chakram.01 F:melee_generic.slash.01.orange s1 +500/1617ms sel:first` |
| Stiletto Pen [melee] | H | dmg:piercing but resolves to `melee_generic.bludgeoning.one_handed` | `impact[contact contact] melee_generic.piercing.one_handed F:melee_generic.slash.01.orange s1 +500/1617ms sel:first` |
| Skysunder | H | Weapon has the `electricity` trait but gets a bare dagger hit — no electric layer, unlike Storm Flash/Storm Hammer/Skyrider Sword which all add one | add `impact[electricity finish] lightning_ball.blue s0.9 +680/2183ms sel:first` |
| Star Grenade (all 4 tiers) [thrown] | M | Weapon explicitly makes two perpendicular 25-ft fire **lines** through the target, but both "Horizontal"/"Perpendicular flame release" stages use `fireball.explosion.orange`, a radial blob, not a line shape | replace both with `template[Horizontal flame release] breath_weapons.fire.line.orange` / `template[Perpendicular flame release] breath_weapons.fire.line.orange`, rotated 90° from each other and anchored on the target (asset exists in both editions) |
| Sulfur Bomb (all 4 tiers) [thrown] | M | dmg:acid but impact is only a pale "light" smoke puff — no acid-colored cue, reads as poison gas not acid | add a short `impact[Acid tint] liquid.splash.green F:liquid.splash.blue tint#fff5b3` layer, or recolor the existing gas puff green like Skunk Bomb's poison gas |
| Stiletto Pen [thrown] | M | Travels on `hammer.throw` (heavy spinning shape) for a thin ink pen; the free fallback `dagger.throw.01.white` is actually the better-fitting shape for both editions | `travel[thrown flight] dagger.throw.01.white s1 +500/2083ms sel:first` |
| Staff of Air [melee] (all tiers) | M | Description: staff "crackles with electrical sparks" at all times, but Strike shows plain quarterstaff only | add `impact[electricity finish] lightning_ball.blue s0.85 +805/2183ms sel:first` |
| Staff of the Tempest [melee] (all tiers) | M | Description: "occasional spark of electricity flashing from its length", but Strike shows plain quarterstaff only | add `impact[electricity finish] lightning_ball.blue s0.85 +805/2183ms sel:first` |
| Staff of Fire [melee] (all tiers) | M | Description: staff is "blackened and burned", ignites tinder — fire-themed item with no fire cue on its own Strike | add `impact[fire finish] impact.fire.01.orange s0.85 +805/2417ms sel:first` |
| Timeflaying Blade | L | Gets an `impact[acid finish] liquid.splash.green` layer despite having no acid trait; fiction is about "collapsed paradoxes", not acid — looks like a copy-paste from an acid weapon | verify intent; if not acid, drop the acid finish layer rather than mislabel the damage as elemental |
| Twigjack Sack (all 4 tiers) [thrown] | L | `impact[Brambles burst]` entangle duration is 8483ms as a one-shot impact (not aura/persist) — borderline over the 8s non-persistent guideline | trim duration to ~4000-5000ms or re-flag the layer as `aura` |
| Tentacle Cannon (all 3 tiers) [ranged] | L | Fiction leans on squid/kraken tentacles but the gun's impact is a bare `impact.001.blue` with no aquatic/organic flourish | optional: add a brief `liquid.splash.blue` tint on impact for flavor; not required |
| Spark Dancer [ranged] | L | Gun fiction alternates fire/electricity each shot but the recipe always shows the fire finish only | acceptable simplification; note only if an alternating variant becomes feasible |

### PF2e conditions & effects (part 1)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Clumsy | M | Dex-based condition shown as plain static orange ring; no stumble/wobble identity | Use a dedicated stagger/off-balance icon (e.g. tinted `particles.outward` shake) instead of generic ring |
| Encumbered | M | Weight/overburden condition shown as plain static orange ring | Use a weight/burden-specific marker, distinct from Clumsy/Fatigued which share the same visual family |
| Enfeebled | M | Strength-penalty condition shown as plain static blue ring, same family as unrelated effects | Give a weakness-specific marker (e.g. drooping arm icon) separate from generic ring |
| Fatigued | M | Tiredness condition shown as plain static blue ring | Use a droop/sleepy-themed marker instead of catch-all ring |
| Immobilized | M | "Can't move" condition uses plain static blue ring while mechanically-similar Grabbed/Restrained correctly use chain icons | Reuse the chain/root motif already proven for Grabbed/Restrained |
| Paralyzed | M | Total incapacitation shown as the same plain ring used for trivial numeric buffs | Use a rigid/frozen-stiff icon (distinct from Unconscious's sleep symbol) |
| Hostile | L | Disposition condition uses a generic dark-red ring shared with unrelated debuffs; no "angry/aggressive" identity | Low priority; consider a glare/aggression icon if budget allows |
| Dazzled until end of your next turn (Critical Fumble Deck) | M | Timed variant ignores the correctly-themed parent `Dazzled` icon (yellow light-loop) and falls back to generic blue ring | Reuse `markers.light.loop.yellow` from the core Dazzled condition |
| Off-Guard until end of your next turn (Critical Fumble Deck) | M | Timed variant ignores the correctly-themed parent `Off-Guard` icon (cracked shield) and falls back to generic blue ring | Reuse `markers.shield_cracked.dark_red.03` from the core Off-Guard condition |
| Deafened until end of your next turn (Critical Fumble Deck) | L | Correctly reuses `markers.mute` — no fix needed, listed as a positive counter-example to the two rows above | n/a |
| Energy Shield Tunic / (Greater) | H | Description explicitly says the tunic changes color per chosen energy (acid=brown, cold=sky blue, electricity, fire, sonic) but recipe is static `shield.01.loop.blue` always | Tint `shield.01.loop` per chosen type: green(acid)/blue(cold)/bluepurple(electricity)/orange(fire)/yellow(sonic) |
| Dragon Breath Scale | H | Always shows `flames.04.loop.orange` even for non-fire lineages (Conspirator=mental/poison, Empyreal=spirit, Fortune=force, Mirage=force/mental, Omen=mental) | Branch on chosen lineage's damage type instead of hard-coding fire |
| Energized Cartridge | M | "Choose acid, cold, electricity, or fire" ammo effect always renders `flames.04.loop.orange` regardless of choice | Tint/swap per chosen damage type |
| Erraticannon / Erraticannon (Extra) | M | Weapon rolls a random damage type each attack but always shows the static generic ring, no per-type feedback | Use a rainbow/chaotic damage swap effect or at least tint to the rolled type |
| Alchemical Strike | M | Drudge chooses acid/cold/electricity/fire for its fist attacks but always shows `flames.04.loop.orange` | Tint per chosen damage type |
| Fulminating Shot | M | "Choose acid, cold, electricity, or fire" always renders fire | Tint per chosen damage type |
| Exploding Bullet | M | Chosen energy trait always renders fire | Tint per chosen type |
| Elemental Assault | M | Electricity(air)/bludgeoning(earth)/fire(fire)/cold(water) choice always renders fire flames | Branch per chosen element |
| Energy Mutagen (Lesser/Moderate/Greater/Major) | M | "Attuned energy type" (acid/cold/electricity/fire) never reflected; renders generic ring/boon green regardless of attunement | Tint to the attuned energy type |
| A Little Bird Told Me... | H | Feat transforms you into a small bird (finch/sparrow) with Fly Speed, but recipe is a plain `shield.01.loop.blue` — no bird/flight identity at all | Use `swirling_feathers` or `wind_lines` tinted to a natural bird color instead of a shield |
| Grit (Stage 1 / Stage 2 / Stage 3) | L | A 3-stage escalating mechanic jumps between unrelated visual families (boon.010 → boon.006 → plain blue ring) instead of visually escalating | Use one marker family that visibly intensifies (e.g. increasing opacity/scale) across the three stages |
| Dust Eternal / Fetid Fumes / Aura of Smoke / Noxious Smog / Mist Cloud / Clinging Smoke (all "concealed by smoke/dust/fog") | L | Fine individually (`ambient_fog`/`fumes`), but several use plain white fog even when the fiction specifies dust, ash, or poison-colored smoke | Tint fog per described color (dust=tan, poison=green, ash=grey) instead of leaving all white |
| Fuming Cloak (Item effects) & Aura: Fuming Cloak | L | Duplicate entries for the same item both correctly use black fumes + grey smoke plumes — no fix needed, included only to confirm the good pattern exists | n/a |
| Boulderhead Bock | L | Grants resistance to stunned/stupefied but shows `markers.stun` (teal/purple) even though the effect is a *resistance*, not the stunned condition itself — slightly misleading (implies the wearer is stunned, not protected from it) | Use a shield/ward icon instead of the stun marker to avoid implying the status itself |
| Hexing Jar / Hexwise Banner / Liberated Mind (anti-confusion/-control wards) | L | Protective wards against mental conditions reuse the same purple "rune curse" family used for *inflicting* curses elsewhere, muddying buff-vs-debuff read | Differentiate protective rune color (e.g. gold/white) from offensive curse rune color (purple/orange) |

Total entries surveyed: ~1,480 (43 core Conditions + ~1,437 "Effect:" catalog rows). The overwhelming majority (>900) fall under Pattern #1–#3 and are not separately tabulated per the brief's guidance to prefer pattern-level reporting for large identical groups.

### PF2e effects (part 2)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Spell Effect: Humanoid Form | H | Shows `flames.04.loop.orange`; description has zero fire content, it's a cosmetic shapeshift | Replace with a shimmer/transform cue, e.g. `magic_signs.circle.02.transmutation.loop.blue` or `twinkling_stars` |
| Spell Effect: Elemental Motion | M | Always renders fire even when the chosen element is air/earth/metal/water | Branch tint/key by chosen element (wind_lines for air, bubble for water, aura_themed metal for metal/earth) or use a neutral `template_circle.whirl` |
| Spell Effect: Elemental Betrayal | M | Target gains weakness to any of 6 elements but always shows fire | Same as above; at minimum drop the fire-specific key for a neutral weakness marker |
| Spell Effect: Chromatic Armor | M | Grants resistance to a *chosen* damage type and sheds bright light; renders plain untinted `shield.01.loop.blue`, losing both the color cue and the light-shedding visual | Tint shield by chosen damage type; add a light marker stage |
| Spell Effect: Demon Form | M | `markers.bubble.02.loop.purple` (speech-bubble/illusion icon) has no demonic quality | Use `fumes`/`skull`-family asset for a brimstone/demonic feel |
| Spell Effect: Demon Form (Vrock) | M | Uses `aura_themed...metal.01.grey` ⚠ — a stone/metal aura for a demon | Align with sibling variants on a demon-appropriate key |
| Spell Effect: Devil Form (Barbazu) | M | `markers.drop.red.01` (blood drop) for a bearded devil battle form | Use `flames.04.loop.orange` like the base Devil Form and Erinys variant |
| Spell Effect: Devil Form (Osyluth) | M | `markers.poison.purple.02` (poison icon) for a bone devil | Replace with fire/bone-appropriate key for consistency with other Devil Form variants |
| Spell Effect: Daemon Form (Piscodaemon) | M | `markers.poison.purple.02` for an aquatic fish-daemon | Use `bubble.001.001.loop.*` (water) instead |
| Spell Effect: Dinosaur Form (Deinonychus) / (Triceratops) | L | Use `markers.drop.red.02` while the other 4 Dinosaur Form variants use `shield.01.loop.blue` — inconsistent within one spell | Standardize all Dinosaur Form variants on one battle-form key |
| Spell Effect: Mantle of the Melting Heart | L | Copper/metal mantle (electricity/poison/disease options) rendered with plain grey metal aura — fine but no color differentiation from Mantle of the Frozen Heart's blue | Low priority polish; tint copper/gold |
| Effect: Ouroboros Buckles (Swarm of Snakes) | M | Grants climb/swim Speed, scent, AC 16+level — rendered as plain `shield.01.loop.blue`; no snake/swarm cue despite the name | Use a themed marker (e.g. a snake/swarm icon from `markers` or a green serpentine aura) |
| Effect: Potion of Acid Resistance | M | Paid key is green (good) but F: fallback is `shield.01.loop.blue` with no tint, turning it into generic/cold-looking in free edition | Add `tint#94dca8`-style green tint to the free fallback |
| Effect: Potion of Electricity Resistance | L | Paid key yellow, F: fallback blue untinted, losing the electric-yellow cue in free edition | Add tint to fallback |
| Effect: Potion of Sonic Resistance | OK | `markers.music_note.blue` — sonic↔music is a sensible, well-chosen mapping | no fix needed (noted as a good example) |
| Effect: Resolute Mind Wrap | L | Mental-damage resistance; paid key purple (fits "mental"), F: fallback blue, losing the mental-purple identity | Tint fallback purple/violet |
| Effect: Salve of Mental Pattern | L | Same purple→blue fallback loss as above | Tint fallback |
| Spell Effect: Death Ward | M | Grants resistance to void/death; paid `shield.01.loop.purple` (good), F: fallback `shield.01.loop.blue` untinted — death/void ward becomes a generic ward in free edition | Tint fallback purple |
| Effect: Void Shroud | M | Void fear/death aura; free fallback turns purple void key into plain blue cold key | Tint fallback to retain void-purple |
| Effect: Void Siphon (Necromancer) | M | Same purple→blue free fallback loss | Tint fallback |
| Effect: Void Tendrils | M | Same purple→blue free fallback loss | Tint fallback |
| Effect: Preserved Moonflower | L | Void-save ward; purple→blue fallback loses identity | Tint fallback |
| Effect: Shadow Rapier | M | Rake's blade "shrouds in void energy" — purple shadow key falls back to plain blue/cold | Tint fallback purple/black |
| Effect: Shadow Sheath Weapon | L | Same shadow purple→blue fallback | Tint fallback |
| Effect: Thirsty Chalice - Weapon | M | Void damage weapon buff; purple→blue fallback erases void cue | Tint fallback |
| Spell Effect: Gray Shadow | L | Shadow-hand poison strike; purple→blue fallback | Tint fallback |
| Spell Effect: Touch of the Void | M | Self buff vs. void damage; purple→blue fallback | Tint fallback |
| Stance: Clinging Shadows Stance | L | Shadow-grasp void strikes; purple→blue fallback | Tint fallback |
| Effect: Acid Grip (Spell Effect) | M | Acid persistent damage speed penalty; green acid bubble falls back to plain blue water bubble | Tint fallback green |
| Effect: Vitriolic Miasma | M | Poison/acid weakness; same green→blue bubble fallback loss | Tint fallback |
| Effect: Pickled Demon Tongue - Weapon | L | Acid strikes; green→blue fallback | Tint fallback |
| Effect: Slime Whip | L | Acid weapon; green→blue fallback | Tint fallback |
| Spell Effect: Corrosive Body / Corrosive Body (Temp HP) | M | Acid immunity/acid Strikes; green→blue fallback erases the acid identity for the spell's signature trait | Tint fallback green |
| Stance: Masquerade of Seasons Stance | M | Grants resistance to one of water/fire/void/cold (player choice) but always shows plain blue shield | Branch tint by chosen trait |
| Stance: Thermal Nimbus / Effect: Thermal Nimbus | M | Choice of cold or fire resistance always renders the same cool-blue refraction aura; fire option gets no fire cue | Add a fire-tinted alternate for the fire choice |
| Stance: Turn Aside Ambient Magic | L | Resistance to a chosen damage type (acid/cold/electricity/fire/sonic) always plain blue ring | Branch tint by chosen type |
| Spell Effect: Energy Aegis | L | Resistance to 8 damage types simultaneously, rendered as a single plain blue ring | Use a multicolored/refraction key like Prismatic Shield/Armor already do elsewhere |
| Spell Effect: Prismatic Armor | L | Resistance to 7 damage types, plain blue shield, while sibling "Prismatic Shield" correctly uses a multicolored refraction key | Reuse the multicolored refraction key from Prismatic Shield |
| Stance: Cobra Stance / Asp Stance | M | Poison-resistance snake stances rendered with the rage/fury red-to-grey metal aura instead of any poison/snake cue | Swap to a poison-green or snake-themed key |
| Stance: Crane Stance / Gorilla Stance / Tiger Stance (base) | L | Animal unarmed-strike stances render generic green boon ring with no claw/bird/ape cue | Use `claws`/`bite`-family assets already in the inventory |
| Stance: Flood Stance / Waterfowl Stance / Jellyfish Stance / Reflective Ripple Stance | L | Water-themed combat stances use plain `bubble.001.001.loop.blue` — acceptable but generic; no differentiation from any other "water" effect in the file | Low priority; consider a light foam/ripple variant for variety |
| Spell Effect: Mirror Image | L | Three illusory duplicates rendered as a static speech-bubble marker rather than anything suggesting duplication | Consider a subtler "shimmer repeat" cue, though current choice is defensible |
| Effect: Rowan Rifle (Cold) / (Electricity) / (Sonic) | OK | Correctly swaps aura_themed-cold / lightning_orb / music_note by chosen damage type | Good example of per-choice branching done right — no fix needed |
| Spell Effect: Fire Shield | OK | Uses bespoke `shield_themed.above.fire.01.orange` | No fix needed, flagged as a good contrast to the generic-shield pattern above |

### SF2e (part 1)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| 360 No Scope | H | Gun trick shot fires a fantasy fletched `arrow.physical.purple` | replace travel key with `bullet.01.purple` (verified, used correctly elsewhere in file) |
| Fish in a Barrel | H | Gun Strike uses `arrow.physical.purple` | → `bullet.01.purple` |
| Concentrated Shot | H | Automatic-weapon shot uses `arrow.physical.purple` | → `bullet.02.purple` or `.03` for a heavier burst |
| Death Blossom | H | Full-mag Area Fire spray uses `arrow.physical.purple` | → `bullet.03.purple` |
| Rocket Jump | H | Area-burst weapon fired to self-propel uses `arrow.physical.purple` | → `bullet.01.purple` + existing `explosion.0x` ⚠ already in family |
| Run Hot | H | Double Area Fire barrage uses `arrow.physical.purple` | → `bullet.03.purple` |
| Shobhad Special | M | Sniper shot with two-handed ranged weapon uses `arrow.physical.purple` | → `bullet.Snipe.purple` (verified exists, exact-fit key) |
| Longrifle Reload | M | Ranged-weapon reload-Strike uses `arrow.physical.purple` | → `bullet.Snipe.purple` |
| Overwatch | M | Ranged Strike vs. suppressed target uses `arrow.physical.purple` | → `bullet.01.purple` |
| Opportune Retort | M | Ranged riposte uses `arrow.physical.purple` | → `bullet.01.purple` |
| Hampering Flare | H | Solarian *light-energy* flare Strike uses `arrow.physical.purple` | → `energy_beam.normal.yellow.01` or a ray key, not a physical arrow |
| Constellation Vortex | M | Solarian weapon "circles the caster" (no ranged component in the text) but recipe gives it an `arrow.physical` travel stage | drop the travel stage; use a melee/aura orbit key instead |
| Fan the Hammer | H | Sustained full-auto gunfire uses `hammer.throw` (a literal thrown war-hammer) | → `bullet.03.purple` |
| Come Get Some! | H | Area/Auto-Fire last stand uses `sword.throw.blue` | → `bullet.02.purple` |
| Hybrid Technique | H | Combined Area/Auto-Fire feats use `sword.throw.blue` | → `bullet.02.purple` |
| Light 'Em Up | H | Area/Auto-Fire reveal attack uses `sword.throw.blue` | → `bullet.02.purple` |
| Line Up the Shot | H | Generic "aim with ranged weapon" uses `sword.throw.blue` | → `bullet.01.purple` |
| Ready Arms! | M | Directive to draw+Strike/Area Fire uses `sword.throw.blue` | → `bullet.01.purple` |
| Shell Shower | H | Area/Auto-Fire + debris uses `sword.throw.blue` | → `bullet.02.purple` |
| Shot on the Run | H | Gun Strike while Striding uses `sword.throw.blue` | → `bullet.01.purple` |
| Shoving Shot | H | Area/Auto-Fire knockback uses `sword.throw.blue` | → `bullet.02.purple` |
| Envenom Magazine | M | Poisoning a ranged weapon's magazine uses `sword.throw.blue` travel for the *next* shot | → `bullet.01.purple` tinted green for poison |
| Gravity Grasp | H | Telekinetic gravity-pull "cast" stage is `music_notations.bass_clef` (sheet music) | replace with `energy_strands.in.purple.01` (inward-pull family, verified, already used for Fear) |
| Gravity Tether | M | Same telekinetic pull ability, only generic glint/twinkling filler, no pull visual | → `energy_strands.in.purple.01` |
| Black Hole | M | Graviton pull-Strike has no singularity/pull art, just generic evocation loop | → `energy_strands.in.*` or a dedicated inward-particle key |
| Hostile Gravity | M | Gravity-crush damage uses a holy `divine_smite.target` impact | → a bludgeoning-themed impact (e.g. `ground_cracks` burst) instead of divine art |
| Apocalypse Burst | H | Explicit fire-trait breath (reskinned Fire Breath) plays zero fire art, only glint+twinkling_stars | copy Fire Breath's own recipe: `cast_generic.fire.01.orange` + `fireball.explosion.orange` |
| Draconic Breath (ryphorian) | H | Chosen-element breath cone shows dark-purple generic cast + `toll_the_dead` bell impact, no cone, no color match | use a cone template + elemental impact matching the chosen damage type |
| Dragonkin Breath | M | Cone breath uses `glint`+`divine_smite.target`, no breath/cone art | swap impact to an elemental key matching chosen damage |
| Dragon Breath (Dragon Form) | M | Same — chosen-element cone/line breath uses generic cast + `divine_smite.target` | same fix, elemental impact by chosen type |
| Eat It! (goblin) | M | Swallowing an item into an acidic stomach plays `darkness.black`+dark smoke, no acid cue | swap to `liquid.blob` tinted green |
| Bioluminescence (Shirren) | M | Ability to *start glowing* is rendered with `darkness.black` (turning light OFF) — inverted | replace with a glow/light key, e.g. `glint.yellow.few` loop |
| Camera Blur | M | Scrambling digital camera sensors plays literal physical shadow-smoke | use a static/glitch-styled particle key instead of `darkness.black` |
| Encode Presence | M | Same digital-sensor-scrambling fiction, same shadow-smoke mismatch | same fix |
| Nanite Arena | M | Hard-light wall construction opens with a fantasy `magic_signs.circle.01.abjuration` rune | swap to a neutral/tech-appropriate `shield.01.intro` or `energy_field` key |
| Overwhelming Shot | M | Precision gun-shot "Aim" stage uses `magic_signs.circle.01.abjuration` rune instead of the `glint` the rest of the operative kit uses | swap to `glint.*.few` for consistency |
| Digestive Spray | M | Free fallback for acid cone is `liquid.blob.blue` with no tint — reads as water, not acid | add `tint#` (e.g. `#5a8f3c`) to the Free line |
| Gunk Spray | M | Same acid→blue Free fallback without tint | same fix |
| Nanite Form Strike | M | Same acid→blue Free fallback without tint | same fix |
| Discharge (spell) | M | "Ignite a sudden spark of electricity" plays the generic purple magic-circle fallback instead of the module's own `static_electricity` family (used correctly elsewhere in file) | swap to `static_electricity.01/02.blue` |
| Instant Virus | M | Virus/glitch spell plays generic magic-circle fallback, no corruption/glitch identity | use tinted `particles.inward` or `static_electricity` |
| Combat Hack | L | Computer-hacking ability is pure "Activity starts" filler with zero tech identity | reuse `static_electricity` stage from Electrify LFAN for visual consistency |
| Awaken Computer | M | Granting sentience to a machine shares the identical mental-stun recipe (`dizzy_stars`) used for unrelated fear/confusion spells — no "awakening a mind" distinctiveness | use a dedicated rising-light/activation cue instead of the shared stun recipe |
| Holographic Memory | L | Projecting a recorded memory as a hologram shares the generic "Needs configuration" fallback, same as unrelated buff spells | reuse the `shimmer`+`energy_field` combo already used for Change Shape-type effects to suggest a projected image |
| Spiritual Armament | L | "Ghostly echo of a weapon you're wielding" always renders as a specific `spiritual_weapon.club` regardless of actual weapon (could be a laser pistol) | acceptable generic placeholder, but note the weapon-type mismatch if used with a ranged/energy weapon |
| Puff Up | L | Spine counter-Strike (a reflexive jab) is themed as a holy `divine_smite.target` impact on a secular reflex ability | swap to a plain piercing impact, no divine key |
| Instinctive Hold / Relentless Tentacles / Grapple family | L | Grapple-related feats use `entangle.02.loop.01.dark_pinkpurple F:entangle.02.loop.02.green` (a plant-vine look) for mechanical/tentacle/limb grapples uniformly | acceptable as a neutral binding cue, but consider a tentacle-specific loop for ijtikri's own tentacle feats specifically |

The "Needs configuration" (89 spells) and "Activity starts"/"Defend"/"Movement gathers" filler clusters (243/41/70 occurrences) above account for the large majority of entries in these two files and are deliberately reported once per pattern rather than as 300+ duplicate rows.

### SF2e (part 2)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Plasma Cannon | H | Plasma weapon travels on `eldritch_blast.orange`, a fantasy spell-icon asset, not a tech plasma bolt | Use `fire_bolt.orange` (already the verified free-tier fallback) as the patreon key too |
| Plasma Caster | H | Same fantasy eldritch_blast travel asset on a plasma pistol | Use `fire_bolt.orange` |
| Starfall Pistol | H | Same fantasy eldritch_blast travel asset on a plasma pistol; also used for its `[Area Fire]` line variant | Use `fire_bolt.orange` for both lines |
| Meme Cannon | H | Sonic/visual "gibberish" tech weapon travels on `eldritch_blast.purple`, a fantasy spell bolt, for both normal and `[Area Fire]` lines | Use `soundwave.01.purple` (verified key) instead |
| Acid Dart Rifle | H | Corrosive dart rifle travels on `spell_projectile.poison.greenyellow`, a fantasy magic-missile-style asset, not a tech dart | Use `dart.01.throw.physical.white` tinted green (`tint#b8e580`), matching the acid finish already present |
| Reality Ripper | H | Same fantasy spell_projectile travel asset on a reality-tearing tech rifle | Use `dart.01.throw.physical.white` tinted green, or `bullet.02.orange` tinted green |
| Grenade Launcher (Commercial/Superior/Tactical/Ultimate) | H | Ranged, reload-2, 280-490ft weapon animated as a melee bludgeon swing with no travel at all — wrong delivery shape | Add `travel[bomb flight] throwable.throw.bomb.01.black` + a generic explosive impact (e.g. `explosion.shrapnel.bomb.01.black`), matching every other grenade-type weapon |
| Szynegation Grenade (all 8 grade/Area-Fire variants) | H | Thrown acid grenade uses melee bludgeon contact instead of the `travel[bomb flight]` every sibling grenade (Frag/Incendiary/Degradation/Ossifying/etc.) uses | Add `travel[bomb flight] throwable.throw.bomb.01.black`, keep the existing `liquid.splash.green` acid impact |
| Skyfire Sword | H | "Famously wielded... this flaming blade" plays generic `melee_generic.bludgeoning.one_handed` instead of a sword key, despite Plasma Sword one entry over correctly using `sword.melee.fire.orange` for the identical concept | Swap first impact to `sword.melee.fire.orange` |
| Zero Knife | M | "Forms a blade of ice" switchblade plays generic bludgeoning contact before the cold finish, not a blade strike | Swap first impact to `dagger.melee.02.white` (or similar blade key) before `impact.frost.white.01` |
| Disintegration Lash | M | Whip that "sunders... at the atomic level" plays generic bludgeoning + plain green acid-liquid splash finish; no sense of disintegration | Use `melee_attack.01.flail.01` (whip motion, already used for Battle Ribbon/Vertebralis Thorn) for contact, and `disintegrate.green` (verified key) instead of `liquid.splash.green` for the finish |
| Force Needle | M | Injection needle plays the same generic bludgeoning contact as fists/gloves/grenades | Use a thin piercing key (e.g. `dagger.melee.02.white` scaled down) instead of bludgeoning |
| Polyglove / Shock Pad / Thermal Dynafan | L | Glove/pad tools reuse the same generic bludgeoning contact as swords and grenades; acceptable for a fist-strike but worth differentiating from blade weapons once those are fixed, to avoid the cluster collapsing back together | Keep bludgeoning/unarmed key only for these hand-worn items; don't reuse on blades |
| Boom Pistol | M | Sonic pistol travels on generic blue `energy_beam.normal.blue.01`, not a sound-wave visual | Use `soundwave.01.blue` |
| Screamer / Screamer [Area Fire] | M | Directional speaker weapon travels on generic blue energy beam | Use `soundwave.01.blue` (or `.02.blue`) for both lines |
| Replica Zo! Microphone / [Area Fire] | M | Sonic microphone weapon travels on generic blue energy beam | Use `soundwave.01.purple` to differentiate from the plain Screamer |
| Sonic Rifle | M | Ultrasound beam rifle travels on generic blue energy beam | Use `soundwave.02.blue` |
| Streetsweeper | M | Ultrasonic cannon travels on generic blue energy beam | Use `soundwave.02.blue` |
| Fangblade | L | "Motorized sword... spins with the force of an industrial chainsaw" plays the generic `greataxe` contact (same key as Doshko/Puzzleblade/Quantum Reaver, none of which are chainsaws) | Use verified key `melee_attack.01.sword_chainsaw.01` instead |
| Bone Scepter | L | "Drains life energy" (void-flavored) but finish is `impact.frost.white.01` (cold), implying wrong damage type | Use `toll_the_dead.purple.skull_smoke` tinted purple, matching Ossifying Grenade's void treatment |
| Persistent Damage [piercing] / [slashing] | L | Both reuse the identical `markers.simple.001.loop.001.blue` key (only scale differs: 0.9 vs 1.1), giving players no way to visually tell these two damage types apart at a glance | Differentiate with distinct marker families (e.g. piercing → a thin dart/line marker, slashing → the existing `melee_generic.slash`-style streak) |
| Effect: Skyfire Wings (3rd/5th/7th/9th-Rank) | M | Fire-winged flight buff uses plain spinning color rings instead of fire art, inconsistent with Absorb Flame/Kindle Blaze/Flamespewer in the same file correctly using `flames.04.loop.orange` | Swap all 4 rank tiers to `flames.04.loop.orange` |
| Effect: Jetpack / Atmospheric Flight / Hull Hop / Gift of Gadrathar / Interstellar Raft / Manifest Energy Wings | L | All fly-speed grants use the same generic ring family as unrelated buffs/debuffs, giving no "you are flying" cue | Route to a thrust/wind-themed key (e.g. `wind_lines.01.01.white`, already used elsewhere in the Animater recipes for movement) |
| Effect: (widespread debuffs sharing buff-colored rings, e.g. "Shoot to Kill", "Shattering Impact", "Sharpshooter", "Protective Bulk") | M (pattern, not itemized) | Numerous pure penalty effects use the identical blue ring used for temp-HP/attack-bonus buffs, giving players no buff/debuff visual distinction | Recolor penalty-only effects to a red/dark ring variant distinct from the buff ring |

Pattern rows above intentionally summarize large reused-recipe clusters rather than listing all affected names individually (per the "large clusters" guidance); representative example names are given in each pattern bullet and can be expanded on request.

### D&D 5e spells & features (part 1)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Daylight [Cast] (2014) | H | Bright sunlight spell renders as `darkness.black` cast+template — opposite of description | Use `divine_smite.caster.standard.yellowwhite` or scaled `dancing_light.yellow`, never darkness.black |
| Daylight [Conjure Daylight on Object] (2014) | H | Same darkness.black mismatch, aura stage too | Same fix, yellowwhite radiant burst |
| Daylight (2024) | H | Same darkness.black mismatch (cast+template) | Same fix |
| Bestow Curse [Curse Ability] (2024) | M | Non-damage curse debuff uses `sphere_of_annihilation.200px.purple` void-annihilation aura, implies lethal damage | Use a smaller rune-mark/curse-sigil effect (e.g. `magic_signs` curse variant), drop the annihilation sphere |
| Bestow Curse [Curse Attacks] (2024) | M | Same void-sphere mismatch | Same fix |
| Bestow Curse [Curse Actions] (2024) | M | Same void-sphere mismatch | Same fix |
| Bestow Curse [Curse Resilience] (2024) | M | `toll_the_dead` death-bell impact on a non-damage curse | Replace with curse-sigil mark, not a death bell |
| Mending (2014) | H | Object repair shows `healing_generic.loop.greenorange` (creature-healing aura) on a torn cloak/broken key | Use a small sparkle/mend cue on the object, not healing_generic |
| Mending (2024) | H | Same mismatch | Same fix |
| Modify Memory (2014) | H | Mind-altering charm effect uses healing_generic (creature-healing) instead of a mind/illusion cue | Swap to `cast_shape.circle.01.purple`/`sleep.symbol` family used by other charm spells |
| Modify Memory (2024) | H | Same mismatch | Same fix |
| Find Familiar (2014) | H | Summoning a cute familiar (bat/cat/owl/toad) uses toxic poison fumes (`fumes.toxic.green`) | Use `magic_signs.circle.01.conjuration` as the corrected 2024 variant of this same spell already does |
| Find Steed (2014) | M | Summoning a mount uses healing_generic instead of a summon-circle | Use `magic_signs.circle.01.conjuration`, matching the already-correct 2024 variant |
| Guardian of Faith [Summon Guardian of Faith] (2014) | L | Spectral guardian summon uses abjuration shield-ward loop, no summon-circle cue | Prefer `magic_signs.circle.01.conjuration` for the appearance moment |
| Insect Plague [Cast] (2014) | H | Biting-locust damage sphere renders as `healing_generic.03.burst.bluegreen` | Use `fumes.toxic.green` (poison/bite cue), not a healing burst — no insect key exists in inventory |
| Insect Plague [Start of Turn / Enter Sphere Save] (2014) | H | Same healing-burst impact for ongoing locust damage | Same fix |
| Insect Plague (2024) | H | Same healing_generic template for the swarm area | Same fix |
| Hellish Rebuke (2024) | M | Description specifies "green flames" but impact is `fireball.explosion.orange` | Use `flames.04.loop.green`/`flames.green.0X` ⚠ (confirmed in inventory) to match the 2024 color change |
| Chromatic Orb (2024) | M | Caster picks Acid/Cold/Fire/Lightning/Poison/Thunder but art is always the same pink/purple skull projectile regardless of choice | Branch travel/impact art per chosen type using existing element keys (acid/cold/lightning families already in this module) |
| Fire Shield [Cast] (2014) | M | Flame-wreathed-body spell uses untinted purple/blue generic shield loop, no fire cue | Tint orange or layer a small flames loop under the shield |
| Fire Shield (2024) | M | Same untinted shield loop | Same fix |
| Flesh to Stone [Cast] (2014) | M | Petrification spell uses `ground_cracks.0X.blue` ⚠ (reads as ice/water) instead of earthy brown | Use `ground_cracks.0X.orange` ⚠ (confirmed in inventory) |
| Earthquake [Cast] (2014/2024) | M | Ground-shaking spell uses blue ground_cracks | Use orange ground_cracks variant |
| Move Earth (2014/2024, all variants) | M | Same blue-vs-orange earth color mismatch | Use orange ground_cracks |
| Message (2014/2024) | L | A whispered message uses `ground_cracks` (earth-crack visual) entirely unrelated to sound/speech | Replace with a sound/whisper cue (e.g. `music_notations` family used elsewhere for speech effects), not ground cracks at all |
| Meld into Stone (all variants) | L | Uses blue ground_cracks for a stone-merging spell | Use orange ground_cracks for correct earth tone |
| Creation (2014/2024) | L | Uses blue ground_cracks/eruption for conjuring an object from shadow-stuff | Minor color fix to orange/brown if mineral option chosen; keep as-is for vegetable option |
| Passwall (2014/2024) | L | Blue ground_cracks for a wall-phasing spell | Use orange ground_cracks |
| Legend Lore (2014) | L | Uses blue ground_cracks/aura for a pure-knowledge divination spell, no divination theme at all | Switch to `magic_signs.circle.01.divination`/`detect_magic.circle` family used by other divination spells |
| Polymorph (2014/2024) | M | Transformation into a specific chosen beast form shows only generic green swirling leaves, no indication of the resulting creature | Acceptable as placeholder but flagged — most generic of the transformation-cluster entries; consider per-category (flying/aquatic/beast) variant art |
| Giant Insect (2014) | M | Turning centipedes/spiders/wasps giant uses the fully generic arcane evocation-sign loop, no insect/nature cue | Use `swirling_leaves`/nature family (as transformation spells do) rather than pure arcane signs |
| Compulsion [Cast] (2014) | M | Mind-compulsion forcing movement uses `cast_generic.fire.01.orange` + `flames.04.loop.orange` — fire has no connection to compulsion | Swap to the `cast_shape.circle.01.purple`/`sleep.symbol` mind-effect family used by Charm/Confusion |
| Compulsion [Command Creatures] (2014) | M | Same fire mismatch | Same fix |
| Compulsion [Repeat Save (After Command)] (2014) | M | Same fire mismatch | Same fix |
| Contagion [Cast] (2014) | H | Disease-touch spell uses `cast_generic.fire.01.orange` cast + `fireball.explosion.orange` impact — no fire in this spell | Use `fumes.toxic.green` poison/disease family (as Contagion 2024 correctly does) |
| Contagion [Disease Save] (2014) | H | Same fire mismatch | Same fix |
| Contagion [Apply Disease] (2014) | H | Same fire mismatch | Same fix |
| Glyph of Warding [Spell Glyph] (2024) | M | Generic fire cast/aura regardless of the (variable, DM-chosen) triggered spell | Acceptable as a neutral placeholder, but flag as weak/generic since the actual effect is unknowable at design time; consider a neutral rune-glyph cue instead of committing to fire |
| Darkness [Cast] (2014/2024) and Darkness [Conjure Darkness on Object] (2014) | L | Fine thematically but identical recipe to Daylight's broken darkness.black use — once Daylight is fixed, confirm Darkness keeps `darkness.black` (correct for Darkness only) | No change needed for Darkness itself, included for cross-reference with pattern #1 |
| Divine Word (2014/2024) | L | Uses `swirling_leaves` nature loop for a divine radiant command-word spell, no light/radiant cue | Switch to `dancing_light.yellow`/divine_smite family used by other radiant spells |
| Arcanist's Magic Aura (2014/2024) | L | Illusion-on-object/creature spell reuses generic shimmer, fine but identical to Blur/Invisibility/Disguise Self/Mirror Image — no differentiation across 5+ unrelated illusion spells | See pattern #2/#13; low priority polish |
| Dream [Cast] (2014) | L | Dream-sending spell uses the Charm-family `sleep.symbol.purple` aura identical to Charm Person, no dream/trance-specific look | Low priority; could use a softer indigo mist instead of the mind-control symbol |
| Guards and Wards (2024) | L | Large warding ritual uses healing_generic burst template, no ward/abjuration cue | Switch to a shield/ward family key |
| Clone (2014/2024) | L | Growing a duplicate body uses healing_generic loop, acceptable but generic | Low priority; consider a growth/transformation cue instead |

### D&D 5e spells & features (part 2)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Stinking Cloud [all 4 variants] (2014/2024) | H | Yellow poison gas rendered as green healing burst/loop (`healing_generic`) | Use `fumes.toxic.green` cast + `fog_cloud.02.green` template, tint `#f2e34d` for yellow |
| Private Sanctum (2014) | H | Privacy/warding spell shows a healing burst (`healing_generic.03.burst.bluegreen`) | Replace with `shimmer.01.purple` or abjuration `magic_signs.circle.01.abjuration` |
| Private Sanctum (2024) | H | Same healing-aura mismatch on the recipient bloom stage | Replace `healing_generic.loop.greenorange` with `shimmer.01.purple` |
| Ink Cloud (2014/2024) | H | Underwater ink jet rendered as green healing burst | Use `fumes.04.complete.black` tinted dark, or `fog_cloud.01.white` tinted black |
| Horrifying Visage (2014) | H | Fear-inducing visage shown as green healing burst | Match sibling Dreadful Glare/Fear Aura: `smoke.plumes.01.purple` |
| Fetid Cloud (2014) | H | Poison gas cloud rendered as green healing burst (its own 2024 version correctly uses `fumes.toxic.green`) | Use `fumes.toxic.green` + `fog_cloud.02.green` like the 2024 version |
| Storm of Vengeance [Round/Turn 4: Hailstones] (2014 & 2024) | H | Hail shown as green healing burst | Use `ice_spikes.radial.burst.blue` (already used elsewhere in the same spell) |
| Death Burst [utility/save] (2014) | M | On-death dust puff uses `sphere_of_annihilation.200px.purple`, a reality-void asset wildly oversized for a minor blind effect | Drop to a small `impact.001.pinkpurple` or `dust`-style burst; the 2024 version already simplified to `arms_of_hadar` only |
| Death Glare (2014/2024) | M | Simple death-gaze attack uses `sphere_of_annihilation.200px.purple` aura | Replace with `toll_the_dead.purple.bell` (already used for the 2024 impact) consistently, drop the sphere |
| Deathless Agility (2024) | M | Pure Dash/Disengage action gets `arms_of_hadar` cast + `sphere_of_annihilation` aura | Remove cast/aura entirely; motion-only (`M:` dash) is sufficient |
| Deathless Strike (2024) | M | Move+attack trait gets the same oversized void sphere | Replace with a small `impact` burst tied to the actual weapon hit, not a standing aura |
| Vampiric Touch [Cast] (2014) | M | Simply readying the touch spell triggers `sphere_of_annihilation.200px.purple` | Use a smaller necrotic cast glow (`arms_of_hadar.dark_purple` alone, no sphere) |
| Boulder Toss (2024) | M | Thrown boulder shown only as `particle_burst.01.circle.bluepurple` magic sparkle | Use `boulder.toss.01.01` (verified key) for travel/impact |
| Wall of Ice [Conjure/Create Panels] (2014 & 2024) | M | Static ice wall rendered via `celestial_bodies.asteroid.line.05x15.ice.blue.01` (looks like an incoming meteor) | Use `ice_spikes.wall.burst.blue`/`.white` (verified, already used for the dome variant) |
| Wall of Stone [Square/Long Panels] (2014 & 2024, both panel sizes) | M | Stone wall shown via `breath_weapons.fire.line.blue` (fire-breath asset recolored blue) — no stone texture/color | Use `ground_cracks.0X.blue/orange` (verified, already in use for earth spells) or add brown/grey tint |
| Prismatic Wall [Yellow/Green/Blue/Indigo/Violet Wall] (2014, 5 entries) | M | Named color variants all share identical `impact.00X.pinkpurple` ⚠ with no tint — none actually shows its stated color | Add `tint#` matching the 2024 layer hexes (yellow `#ffe166`, green `#62dc85`, blue `#73b9ff`, indigo `#4b3f91`, violet `#b87afa`) |
| Symbol [Glyph Effect: Discord/Fear/Hopelessness/Insanity/Pain/Sleep/Stunning] (2014 & 2024, 14 entries) | M | All 7 effects (×2 editions) reuse identical shimmer/fog or arms_of_hadar regardless of effect | Fear→`smoke.plumes.01.purple`, Sleep→`sleep.cloud.02.pink`, Pain→`toll_the_dead.purple.bell`, Stunning→`dizzy_stars.200px.blueorange`, Insanity→`dizzy_stars.200px.green`, Discord→`sleep.target.dark_orangepurple` |
| Shillelagh [Spellcasting Attack] (2014) | M | Simple nature-imbued weapon hit shows `entangle.02.complete.02.green` (a restrain/vine-wrap effect) though nothing is restrained | Use a plain nature impact (e.g. `swirling_leaves` burst) instead of an entangle visual |
| Wish [Stressful Wish: Conjure Wealth/Restore Health/Bestow Resistance ×2/Rewrite Events/Wish Stress Effects] (2014, 6 entries) | M | All Wish sub-effects play the identical bland healing bloom regardless of chosen effect | Differentiate: wealth→gold particle/coin sparkle, rewrite events→`icosahedron` time imagery, resistance→`shield` family, keep healing only for Restore Health |
| Action Surge (2014/2024) | M | Pure martial "extra action" trait shows an abjuration `shield.0X.loop.purple` ⚠ aura and a magic circle | Drop the magical aura/cast; this is a non-magical fighter feature — motion/flash only |
| Indomitable (2014/2024) | M | Reroll-a-save trait (mundane fighter feature) shows `magic_signs.circle.02.evocation.loop.purple` | Remove the arcane circle; no visual needed, or a subtle neutral flash |
| Giant Killer (2014) | M | Mundane reaction-attack feature shows arcane magic circle | Remove arcane visual; this is a martial reaction, not magic |
| Charge (2024, monster) | L | Mundane charge movement shows a full arcane cast+aura | Keep only the `M: pulse@targets`; drop cast/aura stage |
| Hooves/Claw Attack/Chomp (2014, monster basic attacks) | L | Flavorless basic physical attacks get a full arcane circle cast/aura instead of a weapon impact | Replace with a simple `impact` (claw/bite-appropriate) or remove entirely |
| Horde Breaker / Colossus Slayer / Foe Slayer (2014/2024) | L | Pure combat-math class features (extra damage, no fiction) get `fumes.04.loop.green` (poison-looking fumes) with no poison involved | Remove the poison-colored fumes aura; these features have no inherent visual |
| Channel Divinity: Sacred Weapon (2014) | M | Imbuing a weapon with radiant/positive energy shows generic purple arcane circle instead of radiant light | Use `dancing_light.yellow` (consistent with other radiant Channel Divinity options in the same file) |
| Deflect Energy [Redirect] (2024) | L | Redirect branch uses acid-green `cast_generic.02.green` while its sibling "Reduce" option uses healing green — inconsistent within the same feature | Make both branches share one neutral palette (e.g. force/energy blue) rather than mixing acid-green and healing-green |
| Coven Magic [cast] (2024, ×6) / Divine Aid [cast] (2024, ×4) | L | Byte-identical duplicate rows for the same feature/monster — not itself an animation bug, but suggests a data-export duplication worth deduping | Deduplicate at the data layer; animation choice itself (divination/nature cast) is acceptable |

### D&D 5e spells & features (part 3)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Web [attack] (2014) | H | Travel projectile is `spell_projectile.skull.pinkpurple` (F:`spell_projectile.ice_shard.blue`) — a skull/ice-shard thrown at target for a mundane web shot | replace travel key with `web.01` or `web.02` (verified) on both Patreon and Free |
| Wall of Ice [attack/save/utility] (2014, x3) | H | `celestial_bodies.asteroid.line.05x15.ice.blue.01` (meteor shower) for an ice wall; F:`ray_of_frost.blue` is a thin ray, not a wall; duration 20180ms | no dedicated wall-of-ice key exists; use `ice_spikes.radial.burst.white`/`ice_spikes.radial.loop.blue` tiled along the line, or recolor `wall_of_fire.300x100.blue` template to white/blue frost; cut duration to ~8s |
| Pursuit (2024) / Tree Stride (2024) | H | Teleport aura (`teleport.01.blue`/`portals.horizontal.ring_masked.purple`) persists 16264ms for an instant teleport | cut aura duration to ~1200-1500ms |
| Life Drain (2024) | H | Giant `sphere_of_annihilation.200px.purple` black-hole aura (6222ms) for a simple HP-max-drain rider | replace with `impact.001.dark_purple` sized to target |
| Lifedrinker [damage] (2024) | H | Same oversized void-sphere aura for a once/turn 1d6 rider (necrotic/psychic/radiant choice) | replace with `impact.001.dark_purple`/`impact.001.blue`/`impact.001.orange` matched to chosen damage type |
| Necrotic Strike (2024) | M | `arms_of_hadar` cast + `sphere_of_annihilation` aura for "makes one attack" monster action | swap to a melee impact asset (e.g. `impact.001.dark_purple`), drop void-sphere |
| Overchannel [damage] (2014, x2 dup) | M | `arms_of_hadar`/`sphere_of_annihilation` void visuals for "deal max damage" (no inherent visual element) | replace with a smaller evocation burst (`particle_burst.01.circle.bluepurple`) sized to caster |
| Vampire Weakness [Running Water]/[Sunlight] (2024) | M | Void/black-hole imagery for a passive weakness that triggers automatically | use `water_splash`/light burst matching the actual damage source instead of void sphere |
| Troll Spawn (2024) | M | Void-sphere aura for a severed-limb regrowth check | replace with `swirling_leaves`/organic regrowth-styled effect, not a black hole |
| Reaping Scythe (2014) | M | Void-sphere aura for a basic scythe melee attack | use a slashing melee impact asset instead |
| Mockery (2024, Vicious Mockery) | M | `sleep.target.dark_orangepurple` (sleep Z's) impact on a psychic insult cantrip | use `impact.001.dark_purple` (psychic-colored) instead of sleep imagery |
| Nightmare (2024) | L | Same `sleep.target` — acceptable since target can fall unconscious, but unconditional even on the "takes damage" branch | keep for unconscious branch; use a damage impact for the "else damage" branch |
| Pact of the Blade [Forge Pact Weapon] (2024) | M | `Gather Mind` + `sleep.symbol/cloud.purple` for conjuring a melee weapon | replace with a weapon-materialize effect (e.g. `magic_signs.circle.01.conjuration` + brief weapon glint), no sleep imagery |
| Pact of the Blade [Spellcasting Attack] (2024) | M | `sleep.symbol.purple` follow-up on a weapon attack | replace with a melee weapon trail/impact asset |
| Psychic Drain (2014) | L | `sleep.target.dark_orangepurple` impact for psychic-damage-and-heal-self | acceptable thematically (psychic) but consider `impact.001.dark_purple` to differentiate from actual sleep effects |
| Repelling Blast (2024) | M | `Gather Mind` + `sleep.symbol.purple` for a forced-push rider on a damaging cantrip | replace with a force-push burst (`particle_burst.01.circle.bluepurple` + outward motion), unrelated to sleep |
| Roar [First/Second/Third Roar] (2024, x3), Roar (2014) | M | `music_notations.bass_clef.blue` (sheet-music clef) for a monster's magical roar | replace with `soundwave.01.<color>` or `thunderwave.bottom_left.<color>` (both verified) |
| Moan (2014/2024) | M | `smoke.plumes`/clef note combo for an audible frightening moan, not visually "sound" | use `soundwave.01.purple` layered with the existing smoke, or drop clef note |
| Second Roar (2014) | M | `music_notations.bass_clef.blue` for deafen+frighten roar | `soundwave.01.purple` |
| Sonic Boom (2024) | M | `music_notations.bass_clef.blue` cast+aura for casting Shatter | use `shatter.blue` (already used correctly elsewhere) as the primary effect instead of music note |
| Vortex [Save/Damage/Escape] (2024, x3) | M | `music_notations.bass_clef.blue` for a sonic grapple vortex | `soundwave.01.blue` + the already-present `shatter.blue` impact is good; drop the clef |
| Mimicry (2024) | L | `music_notations.bass_clef.blue` aura for mimicking simple sounds — plausible but generic | acceptable; low priority |
| Petrifying Breath (2024, both saves) | M | Purple arcane cone (`breath_weapons02.burst.cone.arcana.purple.0X` ⚠) for petrification — no stone/grey cue | tint the cone grey/tan via `tint#9e9e8c` or layer `ground_cracks.01.grey` ⚠-style key if available; at minimum change tint hex off purple |
| Petrifying Gaze [First/Second Save] (2024) | M | Same purple arcane cone/aura reused for a gaze-based petrify, identical to Petrifying Breath and Paralyzing Breath | differentiate via tint (grey) from the paralysis/weaken/repulsion cones which share the exact same asset+color |
| Paralyzing Breath (2014/2024) | L | Purple arcane cone, indistinguishable from petrify/repulsion/weaken breaths | tint sickly yellow-green to read as paralytic gas |
| Repulsion Breath (2014/2024) | M | Static purple arcane cone for a pure force/knockback effect | use a wind-shockwave look (reuse `wind_lines`/`thunderwave` cone-style) instead of arcane mist |
| Weakening Breath (2014/2024) | L | Same purple arcane cone reused again | tint sickly green/brown to differ from the other 4 breath types sharing this asset |
| Slowing Breath (2014/2024) | L | Same purple arcane cone reused a 5th time | tint pale blue-grey ("slow/time" cue) to differentiate |
| Shimmering Shield (2024) | M | `healing_generic.loop.greenorange` for an AC-buff shield spell; its own 2014 sibling correctly uses `shield.02.loop.purple` | switch 2024 version to match 2014's `shield.*.loop` asset |
| War Cry (2024) | M | `healing_generic.loop.greenorange` for granting advantage via a battle cry | use `soundwave.01.orange` ⚠ or a rally/banner-style burst, not a green healing glow |
| Relentless Endurance (2014/2024, race) | M | `healing_generic.loop.greenorange` for "drop to 1 HP instead of 0" — not healing | use a defiant red/white flash (`impact.001.orange` or similar) instead of green heal glow |
| Stone's Endurance (2024) | M | `healing_generic.loop.greenorange` for a damage-reduction Reaction | use `shield`-themed asset (defensive block), not healing |
| Legendary Resistance (2014/2024) | M | 8213ms magic-circle cast + 4214ms shield aura for an instantaneous "fail becomes success" reaction | shorten cast to <1s, since the fictional moment is instantaneous |
| Multiattack (2014/2024) | M | Full `Gather Arcane` magic-circle cast+aura+pulse for "makes N attacks" with zero inherent magic | drop the spellcasting FX entirely for this purely mechanical action economy note |
| Parry (2014/2024) | M | Same generic magic-circle treatment for a non-magical AC-boost reaction | drop or replace with a quick metal-clash spark, not a magic circle |
| Uncanny Dodge (2014 x2, 2024) | M | Magic-circle cast+aura for halving damage from a seen attack — no magic involved | drop magic circle; a brief dodge motion (already have `recoil`/`dodge` motions elsewhere) suffices |
| Pounce [utility/save] (2014, x2), Pounce (2024) | M | Magic-circle cast+aura for a creature leaping and clawing | replace with claws/pounce impact asset, no arcane circle |
| Trample (2024) / Trampling Charge [utility/save/2024] (x3) | M | Magic-circle cast+aura for a charging/stomping creature | replace with a ground-impact/dust burst, no arcane circle |
| Riposte (2024) | M | `Gather Protection` cast (8213ms) + shield aura for an instant counter-attack reaction | shorten dramatically or drop the slow cast stage |
| Quick Grapple [Escape Check] (2024) | L | Bare magic-circle evocation aura for a grapple escape roll | de-emphasize or remove; escape checks are the target's own action, not the grappler's magic |
| Weight of Years [Save/Years Older] (2024, x2) | L | Generic magic-circle aura for an aging-curse effect | tint brown/grey and consider `icosahedron`/time imagery (already used for Slow/Stunning Strike) for consistency with other aging/time effects |
| Shriek (2024) | L | `particle_burst.01.circle.bluepurple` generic burst for an audible shriek, inconsistent with the soundwave/clef family used elsewhere for sonic effects | use `soundwave.01.purple` for consistency |
| Tireless [Decrease Exhaustion] (2024) | L | Generic magic-circle aura unrelated to exhaustion recovery | acceptable filler; low priority, consider nature-themed to match Tireless [Temp HP] partner entry |
| Noxious Miasma (2024) | L | `Gather Poison` cast runs 11180ms before the template even appears, for a single monster action | shorten cast clip well under 8s |
| Spores [Save/Damage While Poisoned] (2024, x2), Spores (2014) | L | Same 11180ms poison-gather cast reused 3x | shorten cast clip |
| Stench (2014/2024) | L | Same 11180ms poison-gather cast | shorten cast clip |
| Toxic Ink (2024) | L | Same 11180ms poison-gather cast | shorten cast clip |
| Rage (2014/2024) | M | 8888-8930ms `swirling_leaves.complete` nature cast for entering a primal barbarian rage — no nature/leaves element to rage fiction | replace with a visceral red/orange burst or muscle-flex flash; shorten cast |
| Signature Spells [Make/Expend First/Expend Second] (2024, x3) | L | `swirling_leaves` nature cast (8.9s) for a wizard marking signature spells — no nature connection | replace with `magic_signs`/book-themed cast; shorten duration |
| Wild Companion [Summon w/ Spell Slot/Wild Shape] (2024, x2) | L | 8.9s nature cast before familiar summon appears | shorten cast; otherwise thematically fine |
| Sear Undead (2024) | L | `moonbeam.01.complete.yellow` template runs 13305ms for a Channel Divinity radiant burst | shorten toward ~6-8s |

### D&D 5e weapons & items (part 1)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Staff of the Python [Transform into Snake]/[Transform] (2024/2014) | H | Uses `music_notations.bass_clef.blue` (a music note) for the staff becoming a Giant Constrictor Snake — no sound involved | Replace with a transformation puff, e.g. `smoke.puff.centered.green` (verified) as cast+aura, tinted green/brown |
| Collapsing Roof [Trigger 1-4/5-10/11-16/17-20] (2024) | H | Mechanical ceiling-collapse trap uses `magic_signs.circle.01.divination` + `detect_magic.circle.purple` — divination/scrying iconography on a trip-wire rockfall | Use `falling_rocks.side.2x1.grey`/`falling_rocks.side.1x1.grey` (verified) as the template/impact instead |
| Falling Net [Trigger ×4]/[Escape Check ×4]/[Set Trap] (2024) | H | Mundane net trap uses `magic_signs.circle.01.divination` + `detect_magic.circle.purple` | Use `net`/`web.complete.002` style asset (as used correctly on the mundane Net weapon's own [save] line) instead of divination signs |
| Staff of Charming [cast] (2024/2014, all variants) | M | "Charm Person/Command" cast reuses `sleep.symbol.purple`/`sleep.cloud` (Sleep spell art), wrong mental-effect family | Use `impact_themed.heart.pink` (verified) for the charm bloom instead of sleep cloud |
| Crystal Ball of Mind Reading [cast] (2024/2014) | M | Detect Thoughts/mind-reading reuses Sleep-cloud art | Swap to `impact_themed.heart.pink` or an eye/mind-themed `icon` key |
| Nine Lives Stealer [Save vs Death] (all weapon variants, 2014) | M | Death-save trigger for a soul-stealing sword reuses `spiritual_weapon.<weapon>.astral.01.purple` (a holy spectral-blade spell visual), unrelated to death/soul-stealing | Drop the spiritual_weapon aura; use a `skull`/`toll_the_dead` sting instead |
| Luck Blade [Luck Blade]/[Luck]/[cast] (2024) | M | A luck charm reuses the same `spiritual_weapon` holy-blade aura as grapples and giant-slaying | Replace with a sparkle/fortune cue, e.g. a tinted `icon` or `shimmer` sparkle, not a floating weapon spirit |
| Vorpal Sword (2024) / Vorpal Longsword/Scimitar [damage] (2014) | M | Decapitating critical uses `spiritual_weapon` aura or `divine_smite.dark_purple` ⚠ — neither reads as "beheading" | Use a `skull`-family impact or a sharper `impact_themed.slashing` ⚠ burst |
| Giant Slayer / Dragon Slayer [Giant Slayer]/[save] passive lines (all weapons, both editions) | M | Passive rider effects reuse `spiritual_weapon` aura or `divine_smite.dark_purple` ⚠ with no connection to giants/dragons/holy magic | Either remove the extra layer (it's a passive bonus, no event to show) or use a thematically neutral `impact.0XX` ⚠ burst |
| Unarmed Strike [Grapple/Shove] (2024, both monk/non-monk variants) | M | Grapple/shove follow-up uses `divine_smite.target.dark_purple`, a holy-radiant asset, on a mundane unarmed grapple | Replace with a plain `impact`/`melee_generic` burst — no radiant fiction here |
| Hammer of Thunderbolts [Hammer of Thunderbolts]/[Giant's Bane] activation (2024/2014) | M | Charge activation uses `music_notations.bass_clef.blue` for a weapon literally named "Thunderbolts" | Use `static_electricity.0X.blue` ⚠ or `lightning_ball.blue` (both verified, used correctly elsewhere in this same file) instead of a music note |
| Thunderous Greatclub [Clap of Thunder] (2024) | M | Cone template uses `detect_magic.cone.blue` (a divination-scan cone) for a thunderclap | No dedicated thunder-cone key found; at minimum retint off the "detect magic" blue, or reuse `thunderwave.bottom_left.blue` radius instead of a cone-shaped divination asset |
| Staff of Swarming Insects [Insect Cloud]/[cast] (2024/2014) | M | Insect swarm conjuration uses `healing_generic.03.burst.bluegreen`/`healing_generic.loop.greenorange` — healing art for a bug swarm | No swarm/insect key exists in inventory; use `swirling_leaves.loop.01.green` or a green `smoke.puff` as a closer substitute than healing bloom |
| Staff of the Woodlands [Animal Friendship]/[Awaken]/[Barkskin]/[Locate Animals or Plants]/[Pass without Trace]/[Speak with Animals]/[Speak with Plants]/[Tree Form] (2024/2014, all) | M | Eight distinct druidic spells all reuse the identical `cast_generic.02.green` + `healing_generic.loop.greenorange` healing bloom | Differentiate at least Pass without Trace (use `swirling_leaves`/stealth-toned fade) and Tree Form (use `plant_growth` family) from the healing-coded default |
| Staff of the Magi [cast] (2024/2014) — every spell-casting charge line (15+ duplicate rows) | M | Every spell the staff can cast (it's a 50-charge universal caster) renders as the same green healing bloom | At minimum swap the healing-coded green for a neutral arcane `cast_shape`/`magic_signs` (matches its 2014 sibling lines that correctly use `magic_signs.circle.01.abjuration`) |
| Dancing Greatsword/Longsword/Rapier/Scimitar/Shortsword (2014, base weapon lines) | L | "Weapon hovers and attacks on its own" has zero visual distinction from a plain mundane sword swing | Add a short `levitate`/hover `M:` motion cue to match the 2024 "Dancing Sword" treatment |
| Gloves of Missile Snaring (2014) | M | Catching a ranged projectile mid-air uses `ground_cracks.01.blue` (an earth-tremor asset) | Replace with a catch/impact burst, e.g. `impact.00X.blue` ⚠, not an earthquake crack |
| Gem of Brightness [Third Command Word] / Fire-Casting Statue [Trigger ×4] | L | Cone of Bright Light/fire-statue trap both render as `breath_weapons.fire.cone.orange` cones — fine for the fire statue, but Gem of Brightness's 3rd command (light burst, not fire breath) borrows a dragon-breath cone shape for a light effect | Low priority: acceptable substitute given no dedicated "light cone" key, but consider `sunburst`/`moonbeam`-style light instead of a fire-breath cone |
| Ammunition of Slaying / Arrow of Slaying / Bolt of Slaying (all editions) | L | All three "slaying" ammo items reuse identical `cast_generic.02.dark_purple` + `magic_signs.circle.02.evocation.loop.dark_red` regardless of monster type targeted | Low priority (same family, same mechanic) — acceptable as a shared "slaying ammo" signature, note only |
| Figurine of Wondrous Power (Bronze Griffon/Golden Lions/Marble Elephant/Obsidian Steed/Serpentine Owl/Silver Raven) (2014) | L | Six different animal statuettes transforming into six different beasts all reuse the same `cast_generic.0X.dark_purple` ⚠ + `magic_signs.circle.02.evocation` arcane bloom, giving no sense of which animal appears | Differentiate at least flying ones (owl/raven — `swirling_feathers`, already used correctly for Ebony Fly) from ground beasts |
| Bagpipes/Drum/Dulcimer/Flute [Play a Known Tune]/[Improvise a Song] (2024) | L | Pure ability checks (playing an instrument) get a magic `magic_signs.circle.02.evocation` aura — these are mundane performance checks, not spellcasting | Remove the arcane aura entirely for ability-check-only lines with no mechanical magical effect |

### D&D 5e weapons & items (part 2)
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Skull (2024, Deck of Many Things) | H | Avatar-of-Death/scythe summon uses green healing_generic bloom, zero death imagery | `cast[Gather Void] arms_of_hadar.dark_purple` ; `aura toll_the_dead.purple.bell` or `icon.skull.dark_purple` ⚠ (verified) |
| Rope of Climbing [Damage/Repair/Command Rope] | H | healing_generic used on a non-healing rope-animation effect | swap to a neutral `markers.circle_of_stars.green` or drop the heal-bloom aura entirely |
| Necklace of Prayer Beads [Bead of Summons (planar ally)] | H | healing_generic on a conjuration/summon effect | `cast[Gather Summoning] magic_signs.circle.01.conjuration` |
| Necklace of Prayer Beads [Bead of Wind Walking] | H | healing_generic on a flight effect | `aura swirling_feathers.outburst.01.purple` (matches Winged Boots in this file) |
| Manual of Golems [Create Clay/Flesh/Iron/Stone Golem] (all 4) | H | identical fire aura for 4 different materials, none fire-related | Clay/Stone → `ground_cracks.0X.*`; Iron → `aura_themed.01.inward.loop.metal.01.*`; Flesh → keep distinct tint (green/necrotic) |
| Wand of Wonder [Fireball (70-79)] (2014) | H | named Fireball roll result uses generic purple circle, not fire | `template fireball.explosion.orange` (verified key, already used elsewhere in this file) |
| Wand of Wonder [Lightning Bolt (37-46)] (2014) | H | named Lightning Bolt result uses generic purple circle | `template lightning_bolt.narrow.blue` (verified) |
| Wand of Wonder [Darkness (54-58)] (2014) | H | named Darkness result uses generic purple circle | `template darkness.black` (verified) |
| Wand of Wonder [Gust of Wind (16-20)] (2014) | M | named Gust of Wind result uses generic purple circle while Wind Fan elsewhere in this file correctly uses `gust_of_wind.default` | reuse `template gust_of_wind.default` |
| Wand of Wonder [Cloud of Oversized Butterflies (41-45)] (2024) | M | named butterflies result uses generic particle_burst, ignores verified `butterflies.*` keys | `template butterflies.complete.01.white` or `.bluepurple` |
| Lamp / Torch / Hooded Lantern / Bullseye Lantern [light] | M | lighting a mundane lamp triggers `fireball.explosion.orange` (combat-scale detonation) | replace with small looping flame glow sized to the light radius, not an explosion sprite |
| Potion/Ring of Resistance (all 10 damage types) | M | identical untinted blue/purple shield for every damage type — fire resistance looks like psychic resistance | tint `shield.0X.loop` ⚠ per damage type (orange=fire, pale-blue=cold, green=acid/poison, white-blue=lightning, black-green=necrotic, purple=psychic, yellow-white=radiant, blue-grey=thunder) |
| Potion of Giant Strength (Cloud/Hill/Storm) | M | Fire/Frost/Stone variants correctly themed (fire_ring/sleet_storm/ground_cracks) but Cloud/Hill/Storm fall back to flat purple arcane circle | Hill → `ground_cracks`; Storm → `static_electricity`/`lightning_ball` (thunder giants are storm-themed); Cloud → `wind_lines`/`whirlwind` |
| Figurines of Wondrous Power (Marble Elephant, Obsidian Steed, Onyx Dog, Serpentine Owl, Silver Raven) | M | 5 different animals all summon via identical flat purple circle | `portals.horizontal.ring_masked.purple` (already used for Djinni/Valhalla summons in this file) for a manifestation feel |
| Ivory Goats [Goat of Traveling]/[Goat of Travail]/[Revert or Recall] | M | fear-smoke recipe (correct only for Goat of Terror) reused for unrelated travel/locomotion goats | use the figurine-summon fix above instead of `smoke.plumes.01.purple` |
| Ring of X-ray Vision (both editions) | M | earth-cracks asset for a vision effect | `aura eyes.01.bluegreen.many` (verified, literal match) |
| Robe of Eyes [Light/Daylight Save] (2024) | L | eye-patterned robe uses flat purple evocation circle, ignores eyes-themed keys | `aura eyes.01.*` loop instead of `magic_signs` |
| Talisman of Pure Good [Pure Rebuke] / Ultimate Evil [Ultimate End] | M | sleep-spell imagery (`sleep.target`) on a holy/unholy touch-damage item that uses sacred_flame/toll_the_dead on its other stages | align with `sacred_flame.target.yellow` (good) / `toll_the_dead.*.bell` (evil) already used on sibling activities of the same item |
| Rope [Tie Knot]/[Burst Rope]/[Escape Check] (9 duplicate lines, 382-393) | M | pure mundane Strength/Dex checks (no magic) get a magic-circle evocation aura | remove the magic aura entirely for skill checks, or replace with a neutral low-opacity `markers.circle_of_stars` sting |
| Manacles [Bind]/[Escape]/[Burst Check] (x6 dup lines) | M | same — mundane restraint check shown as magic evocation | same fix as Rope checks |
| Hempen/Silk Rope [check] | M | mundane rope-strength check shown as magic evocation circle | remove magic aura or replace with neutral marker |
| Lute/Lyre/Horn/Pan Flute/Shawm/Viol [Play a Known Tune]/[Improvise a Song] (12 dup entries) | L | instrument skill checks get the generic evocation-loop aura (same as every other "Activation bloom" fallback) | replace with `music_notations.*` (already correctly used for Horn of Blasting/Signal Whistle elsewhere) |
| Playing Cards / Three-dragon ante [Catch Cheating]/[Play to Win] | L | card-game skill checks get magic evocation circle | replace with `ranged.card.01.projectile.*`-style card sprite or drop aura |
| Robe of Scintillating Colors [save]/[utility] | M | "shifting pattern of dazzling hues" item uses flat dark-purple cast_generic, ignoring verified rainbow-tagged keys (`markers.bubble.*.rainbow`, `eldritch_blast.rainbow`) | swap to a rainbow-tinted template for the "Display Dazzling Hues" variant specifically |
| Wand of Fear [Cone of Fear] (2014) | L | cone30 template uses `detect_magic.cone.purple` (a divination-detection cone shape reused for fear), no fear-specific tint | tint purple→dark grey/black or use `arms_of_hadar.dark_purple` cone-adapted, matching Pipes of Haunting's fear cast on the same row group |
| Ring of Animal Influence [Fear...] | L | fine (smoke.puff.ring is reasonable for fear) — no fix needed, listed only to contrast with Ivory Goats misuse above | — |
| Rod of Alertness [Plant Rod] / Instant Fortress [Grow Tower] / Shield of the Cavalier [Protective Field] | L | three unrelated "manifest an object" effects (rod becomes field generator, statuette becomes tower, shield projects barrier) all reuse the same `energy_field.02.above.purple` dome template | acceptable as a shared "magical dome" vocabulary, but Instant Fortress (growing a tower) reads better with `falling_rocks`/`ground_cracks` build-up instead of a flat energy dome |
| Potion of Climbing (2024 vs 2014) | L | both versions correctly use `ground_cracks` (earth/stone theme) — fine, no fix | — |
| Oil [Throw]/[Douse Space] (8 dup lines) | L | reasonable throwable-flask + liquid-splash recipe; fine, no fix needed | — |
| Holy Water | L | guiding_bolt travel + sacred_flame impact is well themed; fine, no fix | — |

### D&D 5e conditions & effects
| Entry | Sev | Problem | Fix |
|---|---|---|---|
| Diseased (Native effect) | H | Disease condition shown as green healing burst (`healing_generic.03.burst.green`) — opposite valence | Use `fumes.toxic.green` or a sickly rune marker instead |
| Resurrection Sickness (Day 1-4) (2024) ×4 | H | Debuff penalty shown as green healing burst/loop | Replace `healing_generic.*` with a desaturated/sickly marker |
| Insanity (2014) | H | Mind-breaking debuff shown as green healing burst | Replace with `sleep.symbol`/`markers` distress icon, not healing art |
| Befuddled (2024) | H | Psychic-damage/can't-cast debuff shown as green healing burst | Same fix as above |
| Magical Fatigue (2014) / Spell Taxed (2024) | M | Can't-cast-spells penalty shown as healing burst/loop | Replace with a fatigue/drain icon |
| Comet Card: Death Save Advantage (2024) | H | A *buff* (Advantage on death saves) shown as `sphere_of_annihilation.600px` — the single most catastrophic-looking asset in the file | Use a small `swirling_sparkles`/`dancing_light` blessing icon |
| Brief Enfeeblement / Enervated / Withered (2024) | M | Minor single-die stat penalty rendered as a giant black-hole void sphere | Downscale to a small desaturated marker; reserve sphere_of_annihilation for true annihilation effects |
| Ioun Stone of Agility/Fortitude/Insight/Intellect/Leadership/Mastery/Protection/Strength (2014) ×8 | H | Gem "orbiting your head" rendered as `falling_rocks` (debris/rockslide), opposite motion and object type | Use `aura_themed.01.orbit.loop.*` (already used for Rage) |
| Enhanced Agility/Awareness/Fortitude/Insight/Intellect/Leadership/Mastery/Protection/Strength: ... Bonus (2024) ×8 (same Ioun Stones, 2024 names) | H | Same falling_rocks mismatch | Same fix |
| Fire Giant Strength (2014 & 2024) | M | fire_ring tinted green/purple instead of fire colors | Tint red/orange/yellow |
| Cloud Giant Strength (2014 & 2024) | L | Generic swirling_sparkles, no wind/cloud theme | Use `whirlwind.*` (cloud/wind) instead |
| Storm Giant Strength (2014 & 2024) | M | Generic swirling_sparkles, no storm/lightning theme despite being the most electrically-themed giant | Use a lightning asset (`lightning_ball`/electric variant) |
| Imprisonment: Chained (2014) | M | Heavy metal chains shown as a white spiderweb | Use `markers.chain.*` (already used for Grappled in this file) |
| Chaining (2024) | M | Same chains-as-web mismatch | Use `markers.chain.*` |
| Restrained by Iron (2024) | M | Iron restraint shown as spiderweb | Use `markers.chain.*` |
| Divine Favor (2014 & 2024) | M | Radiant weapon-damage buff shown with druidic swirling leaves | Use `dancing_light` radiant sparkle family |
| Divine Order: Protector (2024) | L | Same leaf mismatch | Use `dancing_light`/shield family |
| Thaumaturge (2024) | L | Same leaf mismatch for a divine-magic feat | Use `dancing_light` |
| Hunter's Defense: Cold/Fire/Poison/Force/Radiant (2024) | M | hunters_mark tint doesn't match the named damage type (Cold=red, Fire=green, Poison=blue, Force=purple) | Re-tint to match each damage type's standard color |
| Transferred AC Bonus 1/2/3 (2024) | L | Generic AC buff shown as a floating spectral weapon (club/quarterstaff/warhammer) with no weapon involved thematically | Use shield-family icon instead of `spiritual_weapon` |
| Hit: STR Score -1d4 (2024) | M | Ability-score-drain debuff shown as a floating spectral hammer | Use a withering/drain marker, not a weapon asset |
| Wounded and Cannot Heal (2024) | M | Can't-regain-HP debuff shown as a floating spectral club | Use a wound/no-heal icon (e.g. crossed-out healing_generic) |
| Supernatural Readiness: Initiative Advantage (2024) | L | Initiative buff shown as a floating flaming spectral longsword | Use swirling_sparkles/alert icon instead |
| Mage Armor (2014 & 2024) | L | Fine as shield.01.loop.blue, but identical to literally every other Resistance/Immunity in the file — no visual distinction from "Fire Resistance" etc. | Give AC-boosting spells their own distinct shield tint (e.g. pale blue outline only, no fill) separate from damage-resistance shields |
| Bless / Blessed (2014 & 2024) | L | Fine (dancing_light), but identical asset/tint to Guiding Bolt, Holy Nimbus, Holy Protection, Sun Card, Radiant Strikes, Bathing in Holy Aura — 7+ distinct divine buffs are visually indistinguishable from one another | Vary scale or add a secondary small accent per effect so distinct divine buffs remain distinguishable at a glance |
| Burning (multiple sources: native condition, "Burning.", Compulsion, Covered in Alchemist's Fire) | M | Several "Burning"-family entries use fire_ring tinted grey/green/yellow inconsistently instead of a single canonical red/orange | Standardize all "on fire" conditions to one red/orange fire_ring |
| Animal Messenger (2014) / Carrying Message (2024) | L | A beast delivering a message uses `music_notations` (song/music asset) — message-carrying isn't musical | Use a simple travel/wind or messenger icon instead |
