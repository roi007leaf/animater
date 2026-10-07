# PF2e spell animation audit — 2026-10-07

This pass checks all 1,994 pinned PF2e records, independently directs 111 spells after individual full-description reading, and repairs native area geometry, incorrect visual subjects, motion timing and hidden contact footage. It does **not** establish that all 1,994 spells have bespoke artwork or have been watched individually in Foundry.

## Source and evidence

- Native source: [PF2e 8.5.1 spell packs](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells), commit `563fd52708673ddd4f66c76921efbf6a938fffed`.
- All 1,994 source JSON files loaded. Full normalized descriptions scanned without an opening-paragraph or 900-character cutoff; per-entry SHA-256 and character count checked against catalog provenance. Raw HTML hashes and inline UUID references retained in the evidence report, because unlabeled references disappear from the normalized prose used by historical catalog hashes.
- 1,991 records have nonempty official descriptions. Mindscape Shift, Open the Wall of Ghosts and Transmigrate have empty official descriptions at this revision. Their catalog notes explicitly require manual review; no full-prose reading is claimed for them.
- Asset inventory: every key from installed Patreon database, 6,870; [official JB2A Free database](https://github.com/Jules-Bens-Aa/JB2A_DnD5e/blob/main/scripts/jb2a_sequencer.js), 1,351. Inherited dimensions, Sequencer templates, distance variants and alternate movies preserved. Still-image leaves excluded.
- Inventory reference: installed `../jb2a_patreon/scripts/jb2a_sequencer.js`; reproducible loading through `tools/asset-databases.mjs`. Selection evidence reports actual first available key in **each** edition, not every unselected candidate in a recipe.
- Independent choreography follows native PF2e prose. No Eskie macro code copied. Effects illustrate casting and stated physical events; they do not apply saves, conditions, damage, real movement, transformed dimensions or later actions.

`deep-spell-audit-2026-10-07.json` is the per-entry evidence artifact. Each record includes pinned native source link, both description hashes, inline references, native targets/range/area/actions, review class, visual rationale, motions, and actual selected Free/Patreon files and geometry. Its current totals after the final build are authoritative; the older `PF2E_SOURCE.designs.distinctCompositions` field uses a looser historical metric.

## Findings and changes

| Problem | Evidence | Repair |
|---|---|---|
| Native cones rendered caster-only decorations | Cone's selected `area` asset was discarded by generic or musical choreography | Placed cone effect uses native aperture and forward endpoint. Musical caster cues retain the area stage. Material gate rejects poison or arrow footage for unrelated sound/light effects. |
| Cube/cylinder/square spells classified as self buffs | Native source has 9 cubes, 17 cylinders and 12 squares; casting art often stayed at caster | Nonritual true area spells use placed footprints and template trigger. Reviewed secondary-area target spells retain their actual target anchor. |
| True emanations illustrated as tiny caster auras | Native emanation was present but art used token footprint | Full placed emanation footprint. Parent runtime supports native PF2e Region placement and local preview cleanup. |
| Native contact peak suppressed by generic entrance | Parent decoded-alpha audit found 295 affected recipe/file peaks before changes, including impacts peaking at 83 ms | Native instant contact films remove imposed fade/scale/rotation entrances and retain complete one-shot lifetime. Shield-intro footage retains its own formation, avoiding a second entrance. |
| Life-Draining Roots healing cue stretched into its area | Full native description creates a 30-foot damaging line and separately revitalizes the caster; generic area conversion changed the radial healing film to a template | Explicit caster-local cast/aura helpers retain local placement while the root attack keeps its placed line. Default Bless/Bane emanation auras still use native footprints. Failing regression reproduced the lost source subject before the fix; selected media remains appropriate. |
| Floor art squeezed to suggest gravity | Weight of the World's floor cracks compressed to 45% height at movie peak | Native cracks keep their shape. A translucent **recipient copy** receives mild downward pressure instead. |
| Covert influence and protective ally magic used identical encouragement | Full Ignite Ambition and Strength of Mind descriptions describe different recipients and intent | Quiet persuasive thread versus mental-defense ward; no generic repeated strength buff. |
| Shooting stars shared fire-breath movie | Spray of Stars has fire damage, but prose describes tiny stars and dazzling light | Seven star objects fan through the native cone; faint neutral fan follows. No fire-breath film. Explicit symbolic shooting-star substitution. |
| Motion removal left dangling stage references | Dimensional Assault/Blink Charge contact referenced omitted approach stage in Effects-only mode | Preserve resolved contact time while removing that reference; full catalog round-trip and Effects-only regression. |
| Self-cast Spectral Advance required an unrelated target | Its approach default used target range | Bounded fixed-distance cosmetic pass; actual movement/relocation remains manual. |
| Dimensional approach visibly crossed too fast | Far-context rush peak approximately 39 squares/sec | 2,600 ms base + 180 ms/square, 45% arrival, 30% hold; far 12-square visual peak about 10.5 squares/sec. Contact stays linked to arrival. |
| Spear melee treated as thrown footage | `spear.melee.01.white` inherited family projectile classification | Explicit native melee sibling classified as localized/radial; spear throw remains projectile. |
| UI falsely called real fire cone an arcane symbolic cast | Generic motif label/quality ignored native area and selected material | Theme/shape label reflects placed area. Cone marked themed only when both editions select real matching material; neutral cone fallback stays symbolic. |
| Geyser note denied geometry now supported | Stale note said exact cube not modeled | Notes distinguish rendered native cube footprint from symbolic upward spout and unmodeled vertical/fall mechanics. |

There are 453 native area-bearing source records: burst 204, emanation 133, cone 52, line 26, cylinder 17, cube 9, square 12. These counts are **not** a directive to treat every mention of area as the primary cast. Rituals and reviewed target spells with a secondary area differ. Final recipe audit independently derives footprint classification from native source and checks area stage plus placement trigger; the rebuilt catalog has 422 true native-footprint recipes.

## Individually directed first group — 45 spells

Each listed spell was read through its whole description, including optional, outcome-dependent and heightened branches. The grouped table describes the resulting direction; complete per-spell rationale and source remain in the JSON evidence.

| Spells | Native distinction retained |
|---|---|
| Paralyze; Confusion; Uncontrollable Dance | Motor impulses sealed without sleep/movement; conflicted impulses with restrained wobble; musical notation plus smooth cosmetic dance turn. |
| Guidance; Ignite Ambition; Strength of Mind | Guiding recipient star; covert motive thread; ally mental/fear defense. |
| Qi Rush; Agile Feet; Athletic Rush; Unimpeded Stride | Casting includes movement. Bounded cinematic passes and departure copies; Qi Rush illustrates two passes, other choices remain manual. |
| Fleet Step; Tailwind | Speed granted, no Stride performed by cast. Foot trails/breeze remain stationary. |
| Dimensional Assault; Blink Charge | Rift and readable approach precede one arrival-linked contact. Teleport destination, Strike and critical branches remain rules. |
| Spectral Advance | Source spiritual veil and bounded approach; mounted or actual movement not selected automatically. |
| Ash Cloud; Ashen Wind; Mist | Obscuring clouds form first. Delayed breathing/turn-start damage is not replaced by immediate fireball. |
| Boil Blood | Internal heat masked to body, restrained reaction and blood residue; no external bolt. |
| Bracing Tendrils | Force roots anchor caster feet without moving anchored caster. |
| Blazing Armory | Flaming weapon simulacrum materializes in hand; no cast-time Strike. Free color corrected intentionally toward flame. |
| Mending; Lock; Knock | Inward repair; contracting latch ward; opening latch ward. Object location needs stand-in token. |
| Weight of the World | Ground pressure retains floor geometry; target copy contracts slightly; restrained blood aftershock. |
| Flame Strike; Hellfire Plume; Volcanic Eruption | Divine yellow fire descends; hellfire erupts below; ground fracture then molten eruption/cooling. Native cylinders preserved. |
| Whirlpool; Whirlwind; Punishing Winds; Flame Vortex; Cyclone Rondo | Native vortex footprint and formation. Later Sustain damage, height, drowning and forced movement not guessed. |
| Astral Rain | Force shapes fall into native cube; blade footage is an explicit symbolic substitute. |
| Spray of Stars | Seven small star objects spread through native cone, followed by faint dazzling fan. |
| Chromatic Image | Three separately colored copies, not a generic Mirror Image clone. Destroyed-image effects excluded until resolved. |
| Enlarge; Shrink | Opposite copy-scale changes; document size, reach and equipment untouched. |
| Fiery Body; Corrosive Body; Mantle of the Frozen Heart | Living flame; acidic secretion/fumes; cold blue ice skin. Granted touch attacks, flight and optional mantle choices are not performed during cast. |
| Ash Form; Disperse into Air | Ash or wind particulate veil and dissolving impressions; no unrelated fire attack or invented reform destination. |
| Wooden Fists; Dragon Wings | Growth at hands/arms; brief rising silhouette and explicitly symbolic flight artwork. No automatic full-body form or flight movement. |

`fog-cloud` is also an authored compatibility alias, but has no separate record in this pinned inventory and is excluded from the 45 count.

## Former 66-spell utility cluster — full individual review

All 66 originally belonged to the same conservative nonritual composition cluster. Each complete description was read separately. Dedicated motifs now express different fiction, recipients and causal direction. A symbolic label is retained where JB2A lacks literal food, rope, painted scouts, parrots or anatomical art; that label does not mean the old generic impact was retained.

| Spell | Reviewed direction / branch boundary |
|---|---|
| Allfood | Object softens into beige gooey edible substance; no heal or attack. |
| Animate Rope | Rope-like chain coil/loop and responsive strands; Bind/Crawl commands not automatically selected. |
| Ant Haul | Musculoskeletal support near body/feet; no size increase or movement. |
| Anticipate Peril | Eye-level foresight and alert star before initiative. |
| Beseech the Sphinx | Recipient constellation and cosmic guidance; skill/save choice remains editable. |
| Blindness | Eye cue dims behind localized dark veil; no area Darkness or document vision change. |
| Bottomless Stomach | Small mouth-pocket entrance; no whole-creature teleport or premature disgorging. |
| Breadcrumbs | Stationary foot-level glitter hints later trail; no invented route. |
| Claim Curse | Threads flow **target to caster**, then retie locally. |
| Cleanse Cuisine | Local food/drink wash and gourmet swirl; no creature heal. |
| Clouded Focus | Clear near eye and hazy periphery; distant perception limit stays mechanical. |
| Connective Current | Thin caster-enemy current; later reaction Stride not performed. |
| Cradle Aloft | Selected object copy lifts gently; holder is not levitated. |
| Day's Weight | Time seal and weary silhouette; fatigue/weakness result not assumed. |
| Deafness | Hearing wave and note subside; differs from eye obscuration and sonic damage. |
| Decompose | Faint initial decay veil; actual corpse remains, full decay follows native duration. |
| Diabolic Edict | Task oath seal; reward/refusal branch not pre-resolved. |
| Discern Secrets | Patron whisper becomes perception/rune cue; player resolves free action. |
| Distracting Decoy | Single colorful butterfly-like distraction, permitted by broad small-shape imagery. |
| Elemental Betrayal | Neutral vulnerability mark; none of six chosen elements guessed or dealt as damage. |
| Endure | Quiet heart/body reinforcement for temporary vitality; no wound-heal movie. |
| Familiar's Face | Companion eye sensor and caster receiving cue; no teleport. |
| Fate's Travels | Corpse memory eye and historical flecks; unknown past route not drawn as fact. |
| Floating Harness | Spectral harness and gentle support rise; no forced adjacency/teleport. |
| Forced Quiet | Mouth-level whisper symbol subsides; hearing and verbal casting remain possible. |
| Fortify Summoning | Defensive resilience on existing summoned creature; no extra spawn/attack. |
| Friendly Push | Soft force and bounded cosmetic recoil; real direction/distance remains choice. |
| Gecko Grip | Tiny hand/foot grip patches; web/leaves explicitly substitute clinging hairs. |
| Genie's Veil | Colored smoke/sparkles and fading/returning copy; actual token visibility unchanged. |
| Groom Companion | Grime-like flecks depart, clean glints remain; no healing. |
| Healer's Blessing | Vital heart/star promise; later healing is not played at cast. |
| Imprint Message | Psychic rune flecks draw **into** object; differs from reading outward. |
| Inertia Lock | Stationary seal and four fixed anchors; no lift, pull or drop. |
| Liberating Command | Restraint cue opens with command; reaction Escape and its success remain unresolved. |
| Lock Item | Local hand/object binding, not full-body paralysis or weapon attack. |
| Magic Hide | Body-fitted protective hide veil; no battle form or Strike. |
| Mist Sight | Mist parts at clear eye; no newly created fog area. |
| Negate Aroma | Faint neutral scent disperses outward; no poisonous gas attack. |
| Nudge Fate | One subtle strand twist and fortune cue; no roll result assumed. |
| Object Memory | Three experience impressions and proficiency cue; no guessed weapon type. |
| Object Reading | Eye reads object, impression rises to caster; actual history remains GM information. |
| Overstuff | Beige lower-body fullness and mild discomfort; no forced vomit/critical branch. |
| Painted Scout | Small dark drawn sensor on stone stand-in; no creature spawn or later scout movement. |
| Peaceful Rest | Still preservation ward on corpse; opposite Decompose, no resurrection. |
| Pet Cache | Companion copy contracts into pocket; document remains, later reappearance excluded. |
| Physical Boost | Body-fitted physical capacity cue; next check/save is not rolled. |
| Practice Makes Perfect | Returning corrective rune; no duplicate action or result branch. |
| Quick Sort | Three scattered glyph groups converge into ordered rows; actual objects not updated. |
| Rapid Adaptation | Environment gathers into companion; actual surrounding adaptation needs customization. |
| Restyle | Appearance sweep across garment; existing shape/material retained. |
| Retrieving Hook | Symbolic rope outward, then bounded target approach toward caster; save/real destination not guessed. |
| Return the Favor | Paired gratitude and recipient temporary vitality; no wound heal or attack. |
| Scramble Body | Masked internal nausea and restrained wobble; no acid flight or assumed failed save. |
| Share Vision | Both participant eye cues and strands in both directions. |
| Sigil | One small personal mark, not full-floor rune; invisible mark choice needs customization. |
| Sting of the Sea | Blue face portal and briny localized tentacle substitute; later repeated saves not animated. |
| Synchronize | Quiet timed sigil applied; **later three flashes not falsely played now**. |
| Synchronize Steps | Matching participant foot sigils; no invented caster link or cast-time Step/Stride. |
| Tether | Non-electric caster-target tether and local loop; immobilization/breakage outcome not assumed. |
| The Parrot's Whisper | Tiny fluttering echo and insight; parrot art absent, answer/time remain GM decisions. |
| Translate | Symbols become meaningful; no music or projectile cue. |
| Unbroken Panoply | Three similar weapon stand-in copies; no universal longsword assumption or attack. |
| Unfetter Eidolon | Binding cue opens; no relocation or premature unmanifestation. |
| Verminous Lure | Neutral musk and inward traces; **no swarm summoned**, animal decisions remain rules. |
| Vision of Weakness | Foe weak-point marker and caster insight; later granted attack not played. |
| Watchdog | Watchful eye and quiet ward; alarm/teleport happen later, not at cast. |

## Variety measurement

`tools/spell-meaningful-audit.mjs` conservatively hashes actual selected media, stage roles/subjects, repetitions/distribution, target selection, direction, motion paths, active filters/entrances and quantized tracks. Names, IDs, labels, sound, raw milliseconds, tiny rank-scale changes and disabled tint are excluded. A second metric reduces art to family, removing exact video/color variants. This measures configuration variety, **not** whether videos look aesthetically different or all stories are faithfully depicted.

Before native/utility fixes, a stored-catalog snapshot measured 793 Patreon / 820 Free meaningful compositions, versus the historical catalog's inflated 1,279. That snapshot used current live choreography helpers, so it is not a pristine pre-change rendered comparison. The intermediate 42-spell/native-area rebuild measured 819 / 843, family layouts 799 / 829, with 302 Patreon / 191 Free actual selected keys.

Final regenerated audit, both editions: **0 reported issues** across all 1,994 records. Catalog includes 322 total individually authored/reviewed records (111 added during this pass), 298 motifs, and 662 motion-bearing recipes / 675 motion stages. The historical exact-configuration count is 1,392; conservative counts below are more appropriate for meaningful variety.

| Final visual metric | Patreon | Free |
|---|---:|---:|
| Inventory keys searched | 6,870 | 1,351 |
| Actual first-available selected keys | 325 | 208 |
| Representative selected files | 325 | 208 |
| Meaningful compositions | 885 | 907 |
| Family choreography configurations | 865 | 893 |
| Largest remaining identical meaningful cluster (rituals) | 81 | 72 |

Representative file count uses inventory's representative `file`; alternate/distance files under each selected key are additionally measured by the parent media audit. These metrics must not be read as 325/208 complete videos watched by a human.

Unused JB2A keys are not automatically evidence of missing spell coverage. Distance variants, multiple footage files, colors and alternate sequences can share an effect role. Conversely, scanning the entire inventory is not evidence that every spell got a fitting animation. This audit therefore records actual used files and largest identical meaningful clusters, not an asset-use percentage as a quality score.

The 66-spell nonritual utility cluster was specifically broken apart because its descriptions were clearly different. Related rituals, shared magical buffs, teleport cues and battle forms still cluster. There are still 930 nonritual entries using generic motifs. No claim is made that these are individually reviewed or unique; largest remaining clusters are listed in the final evidence JSON for follow-up. For example, a 40-entry Patreon cluster combines general casting/conjuration cues; a 39-entry mental cluster and 38-entry teleport cluster remain. Those counts expose remaining shared work rather than hide it in renamed or recolored recipes.

## Remaining size-envelope exceptions

Parent decoded-alpha measurements sample every selected edition/file variant at 24 fps, approximately one-frame precision (41.67 ms). The repaired rebuilds reduced peak-suppression rows from **295 to 12 to 8**. The final `data/media-visibility-audit-after.json` retains all eight flags across four spells and both editions. Review compared their full native descriptions, authored envelopes and decoded active durations. None of these eight is a hidden instantaneous baked contact: two spells form sustained rune artwork, one grows a body buff, and one deliberately contracts a life-force distortion. No production patch, threshold change or exclusion was applied to dismiss these flags.

Exact residual rows; retention is relative to the requested opacity/size at the decoded movie's alpha peak, not the fraction of its total playback that remains visible:

| Spell / stage | Edition | Peak (ms) | Opacity retention | Size retention | Decoded active duration (ms) |
| --- | --- | ---: | ---: | ---: | ---: |
| Day's Weight / Time passes | Patreon | 0 | 0 | 1 | 8,083.33 |
| Day's Weight / Time passes | Free | 0 | 0 | 1 | 8,083.33 |
| Runic Body / Body runes rise | Patreon | 708.33 | 1 | 0.737 | 1,416.67 |
| Runic Body / Body runes rise | Free | 708.33 | 1 | 0.737 | 1,416.67 |
| Siege Weapon's Blessing / Runes inscribe | Patreon | 0 | 0 | 0.1 | 8,083.33 |
| Siege Weapon's Blessing / Runes inscribe | Free | 0 | 0 | 0.1 | 8,083.33 |
| Void Warp / Life-force distortion | Patreon | 1,208.33 | 1 | 0.65 | 2,041.67 |
| Void Warp / Life-force distortion | Free | 3,125 | 1 | 0.65 | 5,000 |

Authored rationale and exact playback settings:

- **Day's Weight:** native spell fast-forwards the target's experience of a day. `jb2a.magic_signs.circle.01.divination` has sustained alpha over approximately 8 seconds, with its highest measured alpha in the first frame. A 40 ms fade hides that first frame only; no scale entrance exists. The time seal rotates 0 to 180 degrees over 1,900 ms, and its one-shot stage retains the full 8,233 ms movie. This brief formation does not hide the only time cue; fatigue/weakness outcomes are not assumed.
- **Runic Body:** native description has glowing runes appearing on the target's body, empowering later unarmed attacks. `jb2a.on_token_buff.001.001.bluepurple` deliberately rises from 0.1 to full scale over 1,000 ms, with a 40 ms fade and full 1,983 ms one-shot lifetime. Its peak around 708 ms occurs at 0.737 size, just below the audit's 0.74 threshold; subsequent active frames complete the formation. Opacity is fully retained at that peak. This is an intentional developing buff, not an instantaneous damaging contact.
- **Siege Weapon's Blessing:** native casting traces a magic rune onto a siege weapon; the later Load/Launch effects are not enacted at cast. The same divination footage as Day's Weight grows from 0.1 to full scale over 1,000 ms, with a 40 ms fade and full 8,233 ms one-shot lifetime. The movie peaks at time zero but remains active for about 8 seconds. Deliberate rune inscription forms during the first second and then remains visible; it does not discard the only meaningful frame.
- **Void Warp:** native spell harms life force. Patreon `jb2a.energy_strands.complete.purple.01` and Free `jb2a.energy_strands.02.marker.bluepurple` deliberately contract horizontally from 1.2 to 0.65 over 650 ms, using an explicit `scale.x` track. No generic scale entrance remains; the 40 ms fade finishes well before either edition's alpha peak, where opacity is fully retained. Both stages retain 5,150 ms one-shot lifetime. Size retention correctly reports the authored contraction rather than a hidden baked hit. Target document remains untouched.
- Weight of the World **no longer** uses the exception: native floor art retains scale. Its copy pressure is a separate cosmetic silhouette track.
- Ignite Ambition / Strength of Mind **no longer** justify identical on-token growth: covert thread / ward recipes replace those questionable shared cues.

## Verification and limits

After the final caster-local repair and coordinated regeneration, the complete module suite passes **381/381 tests**. Final spell and combined catalog audits both report zero issues.

Tests reproduce missing native area stage, incorrect cone material, hidden contact entrance, self shield's double formation, spear melee geometry, Effects-only references, fast approach, utility causal direction and improper cast-time later actions. **70 targeted spell checks passed after the previous regeneration**, including every record's bounded editable round trip, all 66 utility constructions, and all self/area recipes playing without unrelated creature targets. The later Life-Draining Roots repair adds one regression covering caster-local restoration and preservation of Bless/Bane emanation footprints; 27 affected design/choreography checks pass, and a transient rebuild of all 1,994 recipes finds no missing native footprint. Final full-description/edition/geometry evidence is regenerated after the parent rebuild. Parent additionally owns native cone/fan compilation/hook integration checks, decoded-media alpha measurement and rendered browser/editor verification using installed media. A live Foundry canvas session was unavailable at the join page this pass, so live canvas and multiplayer verification remain unverified. Individual watching of all 1,994 spells has not occurred.

Known limits retained explicitly:

1. Two-dimensional footprint is available; cylinder height, cube elevation and three-dimensional cover are not depicted as rules. Multiple separated native cubes/squares use one base preview footprint and need extra placement/customization.
2. Walls lacking explicit reviewed native length require manual placement/customization. No arbitrary wall area is fabricated.
3. Non-native remote point conjurations can remain caster-centered symbolic cues. Actual remote unoccupied location/object/summon placement is not inferred.
4. Object/surface recipes require a stand-in token at the location; held-object illustrations can use holder. Automatic item or wall-surface aiming is unavailable. Names/open-native-details links expose actual Foundry documents but do not create drawable item placeables.
5. Free editions may substitute color/film while preserving role/geometry. Literal parrots, rope, food, tiny painted scouts, animal hairs and some wing/body forms are unavailable; notes and symbolic quality remain.
6. Player choices, heightened counts/areas, environment-dependent forms, secret information, sustained actions, subsequent turns and save-result branches require configuration or native resolution. The illustration does not automatically choose these.
7. Motion is cosmetic and restores pose. Copy growth/contraction does not set creature size. There is no mechanical animation-driven movement.
8. Sounds are optional and audited by the separate sound workstream. This document's meaningful visual metric deliberately excludes sound; it does not prove correct audio for every entry.

Reproduction after source changes:

```powershell
rtk proxy node tools/build-pf2e-catalog.mjs --reuse-media
rtk proxy node tools/audit-deep-spells.mjs
rtk proxy node --test tests/deep-spell-audit.test.mjs tests/spell-catalog.test.mjs tests/spell-asset-selection.test.mjs tests/spell-semantics.test.mjs tests/spell-design.test.mjs tests/spell-choreography-audit.test.mjs tests/delivery-audit.test.mjs
```

Rebuild invalidates cached media when motif/theme/delivery/native-footprint changes. Unchanged clips retain calibrated media timings. Source revision mismatch aborts reuse, preventing provenance from silently drifting.
