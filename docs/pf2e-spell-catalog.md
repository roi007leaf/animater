# PF2e animation catalog

Animater indexes every spell document in the pinned official PF2e **8.5.1** compendium: **1,994 entries**, including 120 cantrips, 493 focus spells, 1,214 ranked spells and 167 rituals. **1,096 entries have playable animations; 898 need configuration.** Edition totals: 1,584 remaster and 410 retained legacy documents. Homebrew and future source additions are outside this inventory. [Official source commit](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells).

The [complete CSV](../data/pf2e-animation-catalog.csv) lists every spell's design rationale, description analysis, native token motions, shared-composition count, stage timeline, duration, Free/Patreon keys, limitations and source. The [design audit](../data/pf2e-design-audit.json) lists remaining shared compositions and absent descriptions. The [coverage report](../data/pf2e-catalog-coverage.json) records asset preflight.

## Description matching and design

The generator analyzes the **entire available description** for 1,991 entries; it no longer stops at 900 characters. Opening narrative guides the motif, while complete text supplies sustained, persistent, push, impact and other cues. Native damage, traits, target, area, action count and rank constrain delivery and intensity. Healing classification uses native traits/damage kinds so incidental references to healing do not turn attacks into healing animations.

**584 entries have explicit reviewed mappings.** Other ready entries use description evidence and reusable native compositions. This is not a claim that all 1,994 descriptions were manually read or every spell has bespoke artwork. The three empty descriptions (Mindscape Shift, Open the Wall of Ghosts and Transmigrate) need configuration.

The current generated design audit reports **1,081 distinct rendering configurations** among ready entries. The audit compares actual selected media and rendering settings, excluding display names, IDs and inactive tint/filter values. Timing or scale differences count as configuration differences; they are not independently designed cinematics. Shared entries display their count and example names beside the preview. Unconfigured entries have no media or composition fingerprint and do not count as duplicate blank animations.

| Treatment | Entries | Meaning                                                              |
| --------- | ------: | -------------------------------------------------------------------- |
| Curated   |     231 | Explicit spell mappings and reviewed base treatments.                |
| Themed    |     411 | Description evidence and native fields select reusable motifs and media. |
| Symbolic  |     454 | Clearly labeled substitutes with visible limitations.                |
| Needs configuration | 898 | No built-in media; skipped by automatic catalog playback.             |

## Generic fallback removal, 2026-10-07

The broad cast/impact/rune fallback is disabled. Missing spell imagery is shown as a configuration gap instead of a finished animation. **Configure animation** opens a disabled, unsaved spell-bound draft; select assets and choreography before saving. Existing configured custom recipes still resolve normally, including when an old catalog preference points at an unconfigured entry.

This pass adds 32 explicit mappings based on complete native descriptions. Examples: Countless Eyes grows body-wide eyes; Containment forms a force enclosure; Bone Flense adds crimson weapon light without prematurely playing the later Strike or bleeding. Preparation spells such as Contingency, Alarm and Delay Consequence do not replay future damage or alerts. Material fields require visible opening-description evidence; a damage type or area shape alone is insufficient. Fog stays fog, static stays static, inhaled air contracts inward, and sand is tinted as sand. Unsupported sand cones remain unconfigured rather than receiving lightning footage.

Both edition inventories resolve **4,194 planned stages for 1,096 ready spell entries**, with zero missing keys. The integrated suite passes 544 tests. Media duration and alpha-footprint audits were regenerated after these changes; no cutoff stages or early fades were found in the audited playable recipes. Installed Patreon files and official Free reference files were checked separately. Rendered editor checks cover a specific force enclosure and the configuration-gap flow; live Foundry canvas playback was not verified in this pass. The validation section below retains an older dated snapshot.

## Distinctive examples

| Spell                               | Native Animater composition                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| Ignition                            | Finger-snap cue, smolder directly on target, embers, brief burning shiver.                     |
| Frostbite                           | Frost orb coalesces around target, cracking frost, icy residue, cold shiver.                   |
| Ray of Frost                        | Narrow icy ray and contact scar, distinct from Frostbite's enclosing orb.                      |
| Needle Darts                        | Three tightly spaced needles and three contact flashes.                                        |
| Blazing Bolt                        | One heat ray per selected target, staggered between targets.                                   |
| Force Barrage                       | Editable three-shard base volley; allocation/action choices need customization.                |
| Electric Arc / Chain Lightning      | Creature-to-creature paths in targeting order; stronger chain uses different media and pacing. |
| Thunderstrike                       | Descending lightning, delayed sonic ring, electrical token tremor.                             |
| Gouging Claw                        | Caster lunge, claw strike, target recoil, returning to original poses.                         |
| Hydraulic Push                      | Pressure jet, splash and cosmetic recoil; no forced movement.                                  |
| Vampiric Feast                      | Contact impact, return-flow tether from target to caster, caster recovery glow.                |
| Heal / Soothe                       | Vitality bloom and rising sparks versus a slower restorative wash and calm breath.             |
| Shield / Glass Shield / Bone Shield | Raised force guard versus translucent glints versus bone-colored assembly.                     |
| Haste / Slow                        | Quick trailing echoes versus a heavy slow time ring and delayed echo.                          |
| Fly / Levitate                      | Wind-assisted lift and shadow versus a slower gravity-ring lift.                               |
| Mirror Image / Blur                 | Three caster copies versus two tightly spaced blurred target copies.                           |
| Fireball                            | Single circular detonation followed by smoke.                                                  |
| Translocate / Teleport              | Quick departure shimmer versus longer runic preparation and broad gate.                        |

Choreography follows Eskie's visual principles: buildup, layered silhouettes, timed impact, residual effects and restrained token reactions. Animater implements these independently through its own stage vocabulary; no Eskie macro code or pack dependency is bundled. Research references: [Eskie Macro Pack](https://github.com/aljames-arctic/eskie-macro-pack), specifically Fly, Mirror Image, Healing Word and Chain Lightning examples at commit 007c6cb8fe2dfdba1f7724913aacbdd82260b912. Reference spells are visual inspiration; PF2e descriptions determine the new compositions.

## Use and controls

1. Reload the Foundry client and open **Animater â†’ PF2e spells**.
2. Search by name, trait or sourcebook; filter rank, kind, tradition, edition, family or treatment.
3. Read **Why this animation** and its description-review/shared-composition label.
4. **Preview recipe** plays all installed media, token motion and copies together, with progress and overlapping active-step highlights. Chains show targeted creatures in order (up to six), or three sample targets when fewer than two are targeted. Overlapping volleys show each flight and contact using the native planner. Other recipes use one sample target. **Local canvas preview** uses selected caster, actual targets and native circular/line/square areas privately.
5. **Use animation** enables this spell directly from catalog data, consuming no saved recipe slot. **Customize** opens native editable stages; existing bound copies open without duplication. Timing controls offer overlapping launches, total versus per-target play counts, and one-shot media. Line stages offer stretched or separate artwork; moving effects can aim at a selected area center. Beam and moving-projectile stages offer **Travel path**: caster to each target, chain through targets, or target to caster for drains. Drag/reorder stages, change media, timing, tracks and reactions.
6. **Token motion** defaults on: 663 catalog recipes contain 676 native motion stages. **Effects only** removes motion stages while retaining VFX and token copies; it affects built-in previews, automatic catalog playback, copies created afterward, and built-in API playback. Existing saved recipes retain their own configuration.
7. Choose **Use entire catalog** for plug-and-play defaults on native roll events. New catalog activation operates independently of saved-recipe automation in Setup. **Use animation** chooses catalog defaults for one spell; **Customize** selects its editable version, preserving previous edits and enabled state. Both catalog and saved-recipe automation start off; existing world settings retain their previous behavior until these new actions are chosen. Per-spell exclusions remain available; rituals use manual **Play animation**. Catalog defaults stay outside the 200 saved-recipe limit.

World configuration is GM-only. Browsing works in either supported system; automatic compendium lookup is PF2e only. Lookup uses compendium source UUID first, then exact name/slug, excluding non-spell items. Direct spell attacks identified by native traits or description use attack rolls, targeted damage/save spells use damage rolls, circular bursts, line spells and Force Rain's square use area placement, utility cues use item-use/chat events. Existing private-roll, author/client, ownership and deduplication guards apply.

## Placement and practical limits

Token motion animates the existing rendered mesh, then restores its pose. It does not move token documents or apply conditions, change artwork/visibility, summon creatures or teleport. Hidden/invisible tokens are skipped. Stop and scene teardown cancel poses and pending effects.

**Server restart:** If Animater reports unavailable motion sync, restart the Foundry server and reload connected clients before automatic/table recipes with motion. Private preview already works. Choose **Effects only** to use built-in VFX while motion sync is unavailable. Recipes are preflighted as a whole, preventing partial playback.

Chain paths follow target insertion order; PF2e range, save outcomes and stopping rules are not automated. Editor preview depicts each hop with staggered impacts and token reactions; canvas preview uses every actual target. Volleys describe an editable base casting mode; action allocation and heightened variants may need custom recipes. Emanations use decorative token-scale auras. Line recipes use actual measured-template or rectangular PF2e Region endpoints and width. Stationary path/scenery cues use separately sized artwork along the line. Complex walls, linked constellations, alternate origins and unavailable literal objects retain explicit symbolic/customization notes. Cone, ordinary wall, remote conjuration and Spout's cube remain symbolic placement cues. Area recipes do not infer affected creature tokens. Sustained/persistent cues have bounded visual lifetimes; they do not monitor repeated mechanical ticks. Damage outcomes such as disintegration death or Shield Block's break are not assumed at cast time.

See [delivery audit](pf2e-delivery-audit.md) for the Force Barrage, descending-lightning, targeted-flight and line corrections, source-review scope, and practical limits.

## Verification and maintenance

On 2026-10-06, all **1,994 recipes / 6,944 planned stages** passed installed Patreon and official Free key preflight, with zero missing keys. They resolve to **287 Patreon** or **182 Free** media files. Installed Patreon files exist. Free art/colors may substitute; Free playback and individual visual review of every video are not claimed. Rendered editor QA verified target lift/shadow, overlapping step highlights, motion toggle and beam-path customization. Multiplayer replication and live D&D 5e remain unverified.

Run tests and rebuild from the pinned official source:

```powershell
rtk npm test
rtk proxy node tools/build-pf2e-catalog.mjs
rtk proxy node tools/verify-spell-catalog.mjs
rtk proxy node tools/audit-animation-media.mjs
```

The generator verifies complete source inventory and unique IDs, analyzes descriptions, resolves both media editions and writes factual metadata, CSV and design audit. Description hashes/lengths document provenance without bundling spell rules prose. Source caches stay in the OS temporary directory. JB2A media are resolved through Sequencer from the installed library.
