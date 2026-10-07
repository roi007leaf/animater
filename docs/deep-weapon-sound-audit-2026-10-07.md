# Weapon and sound audit — 2026-10-07

The previous catalog often collapsed distinct weapon construction into generic footage and sound. Elemental weapons could play several physical-contact sounds for one Strike. Repeated missiles, a full eight-layer spell, and ward profiles had separate audio timing/availability defects. This pass fixes those seams and records evidence for every catalog entry.

## Sources and scope

- Native PF2e **8.5.1**, pinned commit `563fd52708673ddd4f66c76921efbf6a938fffed`, [official equipment source](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/equipment). All weapon descriptions are parsed in full, hashed, and compared with their sound decisions. Spell/feat sound decisions are checked against the same pinned source cache.
- JB2A inventories: installed Patreon database and the official Free database resolved by `tools/asset-databases.mjs`. Geometry is checked in both inventories. Exact availability of a Free video on this machine is a separate question.
- Audio: the installed database and exact files of **GGG 0.2.1**, **PSFX 0.18.0**, **SoundFx Library 1.0.3**, and **PF2e Creature Sounds 2.0.0**. `tools/sound-databases.mjs` owns provider discovery. Modules that only manage sounds do not create an imaginary library.
- Weapon scope: **1,013 native weapon documents / 1,122 native Strike uses**, including melee, ranged, thrown and combination uses; bombs are included. The five native worn rune items are excluded. General consumable/equipment activated powers are **not** a separate supported item catalog. Permanent own-weapon damage is included; optional activations, target-dependent riders and critical-only effects are not assumed on every Strike.
- Sound scope: **1,994 spells and 2,308 active feats**, plus all weapon uses. Quiet, private, subtle and player-selected auditory effects intentionally receive no guessed public noise.

## Concrete changes

### Weapon shape, material and motion

- Shortswords and wakizashi retain short-blade footage despite piercing damage. Katana, butterfly sword, sickle, scythe, mace, shield and claw construction select their own available families. The source declaration outranks a comparison or an optional transformation list: Serithtial's default Strike remains its bastard-sword shape.
- Native flame melee footage and elemental arrows/bolts are considered before neutral footage. Matching native colors keep their original highlights. A color correction is still used for an off-color Free substitute; substituting colors does not create a new composition.
- Returning boomerangs, chakrams, darts, shields, javelins and axes preserve their physical return shape when matching media exists. A return clip is not silently selected as a dagger just because an invented database alias was absent.
- Pernicious Spore Bomb uses a finite fungal-growth cue. Boulder Seed shows expanding foam followed by brief hardening debris; this is a symbolic approximation, not a terrain object. Silver Orb filings use silver rather than beige physical particles. Acid/frost/shock/other elemental finishes remain on the actual struck target.
- Source melee gestures reach a readable **14–20 px on a 100 px grid** and peak at the authored contact stage. Heavy movement is slower. Firearm recoil begins at discharge. These are cosmetic poses, not changes to PF2e positions, reach or attack rules. A contact-stage start is not proof of the exact blade-contact frame inside a baked video.

### Sound semantics and variety

- Native shortbow/longbow, pistol/musket/arquebus, polearm blade/spear thrust, katana, claw, wooden staff/metal staff and thrown axe get distinct sound families where explicit. A musket's description comparing it with an arquebus no longer overrides its actual construction.
- Bombs use material-led landing cues: elemental pot contents, water bladder, pressure burst, fragment burst, brambles, fungal growth, or actual brittle container. Uncertain soft foam/gas/web contents do not gain pottery noises simply because they are bombs.
- Enchanted weapon contacts have one physical attack cue and one primary elemental finish. Additional rune layers do not each add another simultaneous sound. Vitality damage uses a radiant attack cue instead of a healing cue.
- Restorative Strike separates source restoration from its physical blow. Aerial Boomerang uses wind, not wooden-object throwing. Raising a shield, intercepting a blow and making an outgoing shield Strike use their respective authored phases.
- Up to six actual variations per provider/cue are retained. The selection uses semantic family first, then a deterministic alternate. More files used is not itself a quality target. Related tiers and the same base weapon can correctly share a Strike.

### Playback defects

- Physical weapon-contact cues anchor to the stable `-contact` stage, avoiding duplicate strike noises on elemental and residue finishes.
- Weapon landing audio anchors to the stable `-accent` stage. Descriptive fungal, thorn and pressure labels cannot fall back to launch when a text filter fails to recognize their wording.
- Spell ward and physical shield profiles coexist even though both namespaces contain `shield`. Registration enumerates both namespaces rather than overwriting one by object spread.
- Optional sound stages use `MAX_STAGES` rather than the obsolete eight-stage limit. Prismatic Wall retains sound with its eight visual stages.
- Repeated missile sounds inherit repeat count and explicit stride from their visual release. A short per-shot pulse avoids overlapping long recordings; the automatic cue does not promise to play a whole long provider take for every 300 ms missile.
- Lightning Storm's thunder follows its sample lightning strike rather than cloud formation. PSFX release uses the actual casting clip; secondary chain-hop recordings are excluded. Teleport departure anchors to the caster phase.

## Evidence and verification

`tools/audit-weapon-sounds.mjs --probe-audio` writes `data/deep-weapon-sound-audit.json`. It records each entry's native description hash/character count, sound reason, authored visual/audio stages, exact provider/path, phase anchor, repeat cadence, volume and availability with no provider, each provider alone, and all providers together. It validates all weapon plans in both JB2A databases, localized contacts, projectile geometry, single-Strike target restriction and stage budget.

Audio probes check every retained candidate's exact file, active database resolution, native duration and FFmpeg mean/peak level. Probes do not rewrite or redistribute audio. Long native clips are finite and capped to 4.5 seconds for automatic playback. Catalog volume remains user controlled; measured dB does not prove identical perceived loudness.

Structural visual counts deliberately omit IDs, labels, delay, scale, tint, decorative angles and numeric/color variants. A timing tweak or recolor cannot claim a new choreography. Large related-tier/base-weapon groups remain visible in the evidence instead of being hidden behind artificial uniqueness.

Added regressions cover the reported defects plus native construction, returning shape, elemental footage/color, readable contact gestures, gun recoil, native sound distinctions and material-led bombs. With the utility/star follow-up, all **61 targeted tests pass** after coordinated regeneration; that manual source subset is documented in `docs/deep-utility-sound-audit-2026-10-07.md`.

The following table records the initial weapon/sound regeneration snapshot, before the 66-spell utility/star follow-up. The final machine-readable audit is refreshed by the root workflow and is authoritative for current combined metrics.

| Catalog | Entries / uses | With automatic sound | Quiet by design | Sound profiles used | Actual selected audio files | Structural visual compositions |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Weapons | 1,122 uses | 1,122 | 0 | 92 | 199 | 166 |
| Feats | 2,308 | 687 | 1,621 | 29 | 98 | 537 |
| Spells | 1,994 | 879 | 1,115 | 60 | 77 | 640 |

All-provider playback currently selects **94 Patreon / 64 Free weapon keys**, up from 72 / 52 in the pre-regeneration inventory. These are substantive native-family additions, not an attempt to consume every color/number variant. Actual audio-file counts refer to deterministic current choices with all installed providers available; provider precedence changes these choices when a pack is absent. File counts across catalogs overlap.

The native probe checked **481 unique retained audio files**: zero missing exact files, zero unresolved active database references, all with playable duration. Mean native levels ranged from **−32.9 to −11.8 dB**. **89 clips** exceed the automatic 4.5-second cap. This variation is recorded, not hidden behind a claim that provider recordings have equal perceived loudness. Provider settings expose volume control.

Final whole-row audit: zero description-hash mismatches, stale sound decisions, invalid weapon plans, geometry mismatches, unintended second-target weapon hits, stage-budget violations, missing anchors, repeated-cue cadence mismatches or audio with no enabled provider. The report also checks stable physical-contact and landing-audio phases.

## Limits

Every row is parsed and mechanically audited; suspect descriptions were individually read in full. This is not a claim that over 5,000 animations were individually watched or all audio timbres listened to. A semantic filename is evidence of intent, not proof of audible character. Broader spell/feat visual and token-motion findings are documented in their companion audits. General equipment activations, exact contact frames, difficult-terrain objects, and target-dependent rule outcomes remain outside this weapon Strike pass.
