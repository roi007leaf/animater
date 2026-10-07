# D&D5e catalog validation — 2026-10-07

Animater now provides separate D&D5e catalogs for spells, active features, weapons, activated items, conditions and Actor-capable effects. The world system selects navigation, built-in API data and automatic matching. PF2e and D&D catalog settings remain independent. Saved custom recipes retain their existing editor behavior; their native system/activity binding prevents automatic cross-system matches.

## Native coverage

The source is the official public D&D5e **6.0.5** release, pinned to [`3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc`](https://github.com/foundryvtt/dnd5e/tree/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc). Both 2014 and 2024 SRD pack identities are preserved. This is public system content, not all commercial books or every activity embedded in an Actor pack.

| Catalog | Entries | Native activity/use variants |
| --- | ---: | ---: |
| Spells | 659 | 957 |
| Active features | 562 | 685 |
| Weapons | 484 | 815 |
| Activated items | 566 | 865 |
| Conditions/statuses | 44 | 44 |
| Actor-capable effects | 1,333 | 1,333 |
| **Total** | **3,648** | **4,699** |

Passive features are excluded. Item-target enchantments are excluded from persistent token auras. Native effect suppression, disabling and removal govern persistent playback; Animater does not replace native effect expiry rules. Invisibility/hiding cues preserve native visibility and ownership. Persistent visuals have no looping sound or token motion.

See [native research](dnd5e-native-research.md) for source licensing, inheritance, hooks and individually reviewed descriptions. **184 documents** received individual native description/activity review, yielding **279 reviewed usage variants** after weapon modes and other variants expand. The rest use full-description/native-data semantic rules and carry shared or symbolic artwork labels. These counts do not mean every animation was watched or every document was individually read.

## Choreography and runtime checks

Regression coverage includes:

- D&D Chain Lightning travels to the primary target, then forks from that target to secondaries; native upcasting increases the secondary limit.
- Magic Missile launches three total simultaneous darts at first level, distributes them across selected recipients, and increases the total from the native cast level. It does not create three darts per target. Attack-roll spells use one flight per native attack event rather than guessing beam counts from prose.
- Legacy Chill Touch uses a remote hand/contact cue; its modern melee activity stays local. Native damage riders/followups remain local and omit a second full cast or repeated area.
- Actual melee/ranged/thrown roll modes select weapon contact versus weapon flight. Flaming weapon activities use their own native damage parts; the ordinary attack does not inherit inactive fire. Seven Prismatic Wall layers and eight Prismatic Spray ray lanes preserve their different native shapes.
- Acid, Oil and Alchemist’s Fire use thrown flask footage with target payload effects. Oil stays unlit. Natural weapons with native ranged reach retain a ranged alternative; explicit melee activity types stay melee.
- Weapon release/contact phase identities retain their synchronized audio anchors. Every eligible weapon sound design is checked for an actual cue and valid stage link. Zero-valued conditional damage markers do not add unconditional elemental impacts.
- D&D weapon identifiers map to their actual blade/hammer/spear families rather than generic bludgeoning footage. Unknown natural contacts follow native physical damage; natural energy rays/bolts use thematic media and audio. Boulder/Rock attacks use stone flight footage, with edition substitutes disclosed. Newly selected footage received complete distance/random duration measurements.
- Healing uses the native damage hook's HealActivity subject. Recorded chat-message targets and effective upcast levels are captured; blind/private rolls stay private. Use and subsequent attack/damage events do not duplicate the same cast.
- Native D&D Regions retain activity/item/source provenance and area size. Local area previews use temporary geometry and clean it up on completion, cancellation or errors.
- Linked cast, summon and forwarded activities with unresolved performers stay manual. The resulting native spell or attack owns automatic playback rather than inventing a caster, victim or outcome.
- All 144 native ability/tool-check usages keep manual, quiet symbolic previews without token motion. Catalog automation does not turn mundane checks or unresolved outcomes into magical casts.

The full suite passed **494 tests, 0 failures**, including existing PF2e regressions and native D&D hook, API, Region and transferred-effect fixtures.

## Exhaustive generated-data and media checks

Every one of the 4,699 D&D usage variants was validated and planned against both complete JB2A inventories. The [per-variant ledger](../data/dnd5e-catalog-validation.json) records native identity, trigger, review status, asset choices, motion and optional sound decisions.

| Check | Result |
| --- | ---: |
| Missing resolved assets or invalid travel geometry | 0 |
| Motion-bound or persistent-lifecycle violations | 0 |
| Selected Patreon keys / families | 532 / 116 |
| Selected Free keys / families | 260 / 111 |
| Distinct rendering configurations | 1,378 |
| Variants with cosmetic token motion | 2,959 |
| Eligible audible variants / quiet variants | 3,105 / 1,594 |
| Optional sound profiles / selected primary sound candidates | 77 / 166 |

The configuration metric ignores names and IDs, but includes actual timing, tracks, assets and sound. It is not a claim of 4,699 unique animations: related editions, weapon upgrades and repeated native effects intentionally share fitting compositions. Sound counts use an all-providers resolver fixture; actual playback selects only candidates available from active installed packs. Existing decoded sound measurements, trims and gain/fallback rules are reused. Persistent and intentionally quiet activities remain quiet.

The combined PF2e/D&D media audit covered **13,124 recipe/use rows**, **2,531 selected distance/random video paths** and **1,499 selected media keys**. Duration probing used 1,994 distinct files; visible-footprint measurement covered 1,885 selected paths and 1,468 basename profiles. Final results:

- **0 measured cutoffs, 0 early exit fades, 0 missing duration/alpha/footprint measurements.**
- **0 D&D suppressed visual peaks, 0 D&D movie actions shorter than the 200 ms audit threshold.** Short teleport, impact and slash films receive slower playback; one-shot entrances no longer hide early peaks.
- All **1,728 selected Patreon paths** were present in the installed pack. The Free pack was absent locally: **803 Free paths** were measured using official reference copies or byte-equivalent installed filenames. Free key resolution and timing are verified; live Free-pack rendering is not verified here.

The alpha report retains pre-existing PF2e short-action findings separately. This D&D implementation does not claim to clear every earlier PF2e variety or speed limitation.

## Rendered evidence and limits

An isolated preview at port 4178 was used without changing the live world or settings. All six D&D pages loaded. Switching the preview system to PF2e removed every D&D catalog navigation entry; switching to D&D removed every PF2e entry. Shared conditions remained visible when filtering either rules edition.

The 2024 Magic Missile composition loaded all three flight and three contact videos with no media errors, highlighted active steps and reached `Recipe complete`. Thrown Dagger loaded recognizable dagger footage plus knife release/contact audio; its melee usage retained one contact cue. Poisoned loaded the green persistent marker and finished its finite preview. Disintegrate loaded a green cast, actual green ray and green contact movie; Customize opened its five editable visual/motion/audio stages and retained the native spell UUID. Acid loaded a green flask flight, target liquid splash and PSFX Acid Splash cue and reached `Recipe complete`. Flaming Flame Tongue Longsword loaded actual fiery sword footage, a fire contact effect, blade audio and fire audio; ordinary mode retained its physical contact alone. Boulder loaded actual stone flight and matching earth audio and completed its full preview. Necrotic Ray loaded a purple ray and necrotic contact sound, then reached `Recipe complete`. Mason's Tools showed its native check as manual and quiet, with no token motion. Items and persistent effects showed their native activity/lifecycle information. Browser warning/error logs were empty for these checks. The isolated QA customization was removed, its tab closed and its server stopped.

These are rendered standalone previews and native integration fixtures. **Live D&D world gameplay and multiplayer replication remain unverified.** No world system was changed for QA. Chromatic Orb's chosen damage material is not reliably available at its earlier use/attack hook; the default is a disclosed neutral force treatment, with native controls available through Customize. JB2A substitutes for unavailable literal creatures/objects/materials remain symbolic.

Native enchantment templates without a selected physical base remain manual. Thirteen weapon templates and Book of Shadows explain this limitation; Conjured Flame Blade retains its explicit melee spell attack. A `baseItem` identifier alone does not imply native damage/attack inheritance. Arbitrary combinations of applied weapon enchantments do not yet produce a synthesized catalog choreography; customize the resulting owned weapon when needed. Conditional damage outcomes unavailable at the triggering hook are not guessed.

## Reproduce

From the Animater module directory:

```powershell
rtk proxy node tools/build-dnd5e-catalog.mjs
rtk proxy node tools/audit-media-completeness.mjs --all-systems --fetch-missing-free --write-durations
# Rebuild after newly measured durations, then run the fresh timing pass.
rtk proxy node tools/build-dnd5e-catalog.mjs
rtk proxy node tools/audit-media-completeness.mjs --all-systems --fetch-missing-free
rtk proxy node tools/audit-media-footprints.mjs --all-systems --fetch-missing-free --write
rtk proxy node tools/audit-media-visibility.mjs --all-systems --fetch-missing-free
rtk proxy node tools/verify-dnd5e-catalog.mjs
rtk proxy node --test tests/*.test.mjs
rtk proxy node tools/preview.mjs 4178
```

Preview URL: `http://127.0.0.1:4178/modules/animater/preview/index.html?system=dnd5e`. Reference media is audit cache only; no animation, sound or icon media is bundled in the catalog.
