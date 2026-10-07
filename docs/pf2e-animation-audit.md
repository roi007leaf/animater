# PF2e animation audit — 2026-10-06

Latest pacing/variety/scaling pass: **156 tests**, **115 individually reviewed treatments**, **106 motifs**, **653 motion recipes / 669 motion stages**, **1,262 configurations**, **247 Patreon / 168 Free selected keys**, **109 families per edition**. All 1,994 spells / 6,852 expanded stages pass both-edition preflight; zero detected geometry violations. Updates: [motion](token-motion-pacing-audit.md), [variety](spell-variety-audit.md), [scaling](animation-scaling-audit.md), [quality report](../data/pf2e-quality-audit.json). Sections below record the preceding ray/media audit snapshot.

Audited all **1,994** pinned PF2e 8.5.1 documents through three independent work areas: spell semantics, JB2A media selection, and choreography. All **1,991 available descriptions** receive programmatic analysis; **89 spells** now have individually reviewed authored treatments. The three absent descriptions remain flagged. This does not claim a bespoke animation or manual artistic review for every spell. [Official source](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells).

## Confirmed problems and repairs

| Problem                                                                                               | Repair                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ray of Corruption was target mist, with no beam or proper attack trigger.                             | Connecting toxic beam, target vapour, recoil, and direct spell-attack evidence.                                                                                                                     |
| Holy/light rays could resolve to a projectile; Moonbeam followed fire damage into orange casting art. | Strict beam geometry and explicit radiant/lunar/prismatic motifs; neutral lunar charge.                                                                                                             |
| Briny Bolt, Acid Splash, Winter Bolt, and Force Bolt shared generic ray treatment.                    | Moving saltwater/acid globs, a single physical icicle/missile, and one force projectile.                                                                                                            |
| Square vines and complete energy strands were stretched into beams.                                   | Localized vine flight/binding; range strand variants for connecting drains.                                                                                                                         |
| Fire jets appeared centered as impacts; smoke aftermath could resolve to another Fireball.            | Geometry gate excludes directional footage from centered roles; explicit aftermath intent outranks spell-name matching.                                                                             |
| Spiritual Armament and Spiritual Weapon shared inappropriate melee movement.                          | Armament flies outward and returns; Spiritual Weapon manifests beside foe.                                                                                                                          |
| Murder of Crows used Eldritch Blast as flock travel.                                                  | Native localized flock projectile, target torment and feather wisps. Bat footage is explicitly labeled as a symbolic crow substitute.                                                               |
| Touch/melee attacks were interpreted as ranged; remote secondary emanations appeared at caster.       | Description/range-aware contact geometry and reviewed target-anchor overrides.                                                                                                                      |
| Actual ray footage looked shortened in editor preview.                                                | Preserve canonical 15ft file, JB2A template padding, aspect ratio and token-center endpoints. Scale controls thickness without shrinking ordinary connecting length.                                |
| Workspace startup passed a missing-distance map into file parsing.                                    | Normalize preview values to paths and flatten Sequencer's fallback file list; preserve valid 15ft selection and beam metadata. Four installed cone entries reproduce the missing-15ft return shape. |

The [semantic notes](semantic-audit-notes.md) enumerate every ray/beam opening and compound-delivery limitation. Fifteen targeted-ray spells were individually checked; they produce 16 base beam stages because Disintegrate includes a tracer and destructive beam. Three other descriptions specify lines, one a cone, and three use unrelated ray/beam meanings.

## Full inventory selection

The resolver searches all canonical video entries, inheriting database names, templates, dimensions and distance/variation metadata. Geometry is required before semantic ranking. Spell name, authored visual intent, role, theme and edition availability guide selection. Hints remain intentional artistic preferences; they no longer limit discovery to a fixed family list or a theme/motif cache. New suitable inventory families can participate without a new hardcoded media mapping. Still-image variants are excluded.

| Metric                             | Patreon |  Free |
| ---------------------------------- | ------: | ----: |
| Inventory video keys searched      |   6,870 | 1,351 |
| Inventory root families            |     199 |   197 |
| Previously selected keys           |     160 |   117 |
| Currently selected keys            |     239 |   159 |
| Currently selected root families   |     106 |   104 |
| Detected geometry violations       |       0 |     0 |
| Direct targeted-ray spells checked |      15 |    15 |

All spell-appropriate choices are considered; using every color variant or unrelated interface/science-fiction asset would not improve fidelity. The 38 UI animation families are semantic categories, separate from these JB2A root-family counts. Free has fewer colors/art options: for example a localized blue glob stands in for a missing green acid glob. Such fallbacks preserve geometry and remain customizable. No arbitrary hashes or random palette changes manufacture uniqueness.

## Verification

- **121 automated tests pass**, including missing-distance/malformed-preview startup, ray versus missile selection, unseen-family discovery, mixed-family geometry, role priority, edition fallback, missing attack traits, incidental narrative examples, returning projectiles, flock routing, beam padding, native timing, motion restoration, scroll retention and existing orb/chain flows.
- All **1,994 recipes / 6,856 expanded planned stages** pass both-edition asset preflight. 5,996 base VFX stages are checked for geometry; motions/copies/repeated instances explain the differing totals. All selected installed Patreon files exist.
- Rendered Chrome QA shows real Frost and Corruption beams connecting caster to target, correctly aligned ordered Chain Lightning hops, a localized flying flock with its explicit substitute label, active-step highlights and loaded weapon media. Native Sequencer return routing is covered by compiler regressions; multiplayer and full Free footage playback remain unverified.
- Machine-readable evidence: [geometry/media report](../data/pf2e-media-audit-after.json), [asset coverage](../data/pf2e-catalog-coverage.json), [design report](../data/pf2e-design-audit.json), and [per-spell CSV](../data/pf2e-animation-catalog.csv).
- Startup replay uses the installed Sequencer range-selection method against all 6,870 canonical local video entries. Live Foundry workspace opens with all 7,018 registered entries and loaded asset video previews after the normalization fix.

661 catalog recipes include 678 cosmetic token-motion stages. 83 motifs produce 1,215 combined-edition configuration groups, 1,189 Patreon and 1,199 Free. Timing/scale differences count as configuration differences, not bespoke artwork. Shared compositions remain disclosed in the UI.

## Remaining limits

Cone, line, wall, remote summon and compound placement remain explicitly symbolic where Animater cannot place the real geometry. Creature-specific summons, heightened/action variants, Sustain actions and delayed rules events still require customization. Visuals never create creatures, consume thralls, move token documents, apply conditions, determine saves, or implement rules. Eskie informs visual staging; no macro code is copied or pack dependency introduced. Existing saved overrides retain priority; refreshed built-ins do not overwrite them.

Reload the Foundry client to load the updated catalog and renderer. Existing unavailable motion sockets still require a Foundry server restart for table-wide token motion; private previews or Effects only remain available.
