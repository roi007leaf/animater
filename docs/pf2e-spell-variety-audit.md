# PF2e spell animation variety audit

Completed 2026-10-07. Scope: all 1,994 PF2e spell documents, including focus spells, cantrips, rituals, remaster and legacy entries. Source is Foundry PF2e 8.5.1 at [563fd52708673ddd4f66c76921efbf6a938fffed](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells).

## Why the reported spells looked the same

Broad fear routing selected the same casting, death-bell and smoke families, followed by the same shake. Spell labels, rank scaling and small timing differences concealed that repetition in the previous exact-settings audit. Fear the Sun was also wrongly given fear imagery despite its native light-sensitivity mechanism.

The replacement audit resolves the actual selected movie inventory separately for Free and Patreon. It excludes display names, IDs, sound, token motion, timing and rank scaling. It normalizes equivalent flags, ignores fully invisible layers and treats resolution-only copies as the same footage. Visible effect topology, recipient, direction, material, substantial offsets and property tracks establish composition differences.

| Edition | Distinct effect compositions before | Entries in shared compositions before | Distinct effect compositions after |
| --- | ---: | ---: | ---: |
| Patreon | 722 | 1,460 | 1,994 |
| Free | 740 | 1,452 | 1,994 |

These are configuration signatures, not a guarantee of subjective artistic dissimilarity. The effects-only comparison also passes with all optional sound and token motion removed.

## The six reported spells

| Spell | New core illustration | Native boundary |
| --- | --- | --- |
| Dread Secret | Revelation runes split a defense glyph around the recipients | Required secret and weakness/resistance choice are not guessed; no automatic successful debuff |
| Fear | Inward confidence collapse, one fear seed, restrained tremor | No projectile, invented psychic damage or automatic fleeing |
| Fear the Sun | Ocular glare and contracting sensitive eyes, brief flinch | Bright-light-dependent blindness remains native; no fear bell or damage |
| Fearful Feast | Target flecks rise, confidence strand returns to caster, mouth gathers it | Target-to-caster direction; failed-save healing is not assumed |
| Friends to Foes | Friendly peripheral emblems become opposing threatening images | Private betrayal vision is symbolic; real ally tokens never attack or move |
| Hollow Heart | Ambition swells, a heart contracts, nearby trust stubs separate | No initial damage; frightened is a critical-failure result |

These six no longer share the same core sequence. Their symbolic artwork is labeled honestly, since JB2A does not contain literal footage of every private mental experience.

## Full-description review and broader changes

Two source review passes read 66 and 145 complete descriptions, respectively: 207 unique native documents after removing overlap. They cover target/range, prose, saves, options, heightened changes and delayed effects. Added 168 explicit treatments: 39 fear/light-sensitivity designs and 129 broader designs. Exact native paths, hashes and individual reasoning are recorded in the [fear review](pf2e-fear-variety-review.md), [broader review](pf2e-broad-variety-review.md) and [broader source manifest](pf2e-broad-variety-review.json).

Every nonempty native description is also processed by the catalog's semantic analysis: 1,991 descriptions, without the old truncation of long prose. This automated processing is separate from the 207 individually read documents this round. The complete catalog now records 552 explicit authored mappings, including earlier reviews; that metadata is not a claim that all 1,994 descriptions were personally read this round.

Important corrections include:

- Devour Life consumes the victim and flows back to caster; Spirit Link uses a neutral outward support strand. They no longer masquerade as healing the same recipient.
- Stabilize remains a low, steady life sign, without standing or immediate wound healing. Fated Healing, Life Pact, Life Connection and Vital Beacon illustrate preparation rather than their later restoration.
- Casting-only preparations use the item-use trigger rather than waiting for future healing or damage dice. Spirit Link's setup now plays when cast.
- Transformations use their material and body-location clues, without choosing an unknown creature, weapon or element. Exact unavailable bodies remain symbolic.
- Paired known transpositions require recipients; source-only remote passage cues work without unrelated targets. Unknown remote destinations are never replaced by a targeted enemy.
- Safe Passage uses its prose-defined corridor: 60 feet long and 10 feet wide. Abjuration signs and glints tile the footprint. The geometry resolver now distinguishes protective radial tiles from directional attack footage; no acid beam is substituted. Height and heightened routes remain native context.
- Token gestures remain finite and cosmetic. Catalog recipes contain 611 motion compositions and 624 motion stages; existing generated-motion duration safeguards remain in force.

Three native source descriptions are empty: Mindscape Shift, Open the Wall of Ghosts and Transmigrate. Their entries remain explicitly based on native fields and symbolic casting cues. Sixteen additional fully reviewed utility descriptions have context/artwork recommendations in the broader review; their finite shared-art casting treatments remain available.

## Shared footage and remaining similarity

The inventory selection examines 6,870 Patreon keys and 1,351 Free keys. Numbered media variants are spread only within the selected semantic family, color, role, dimensions and geometry. Explicit numbered authored art remains pinned. Aliases and larger-resolution copies do not count as new movie variants. Free fallbacks cannot replace a recorded Patreon first choice when both packs contain a shared key.

| Effects-only selection | Patreon | Free |
| --- | ---: | ---: |
| Selected database keys | 525 | 303 |
| Selected distance/random movie files | 900 | 471 |
| Selected asset families | 122 | 122 |
| Core compositions with added casting styles removed | 1,060 | 986 |

The last row deliberately exposes residual shared core mechanisms. Similar spells can still share a rune, beam, icon or other JB2A family. The catalog does not contain 1,994 bespoke mechanisms or newly created movies.

For remaining shared families, 1,054 entries receive visible casting-layout variations. Of those, 332 chosen layouts match a preferred grammar from the opening prose; 722 are allocated alternative shared-art layouts to prevent exact repetition. These change meaningful spatial tracks or an additional casting echo, not a label, sound pitch, millisecond or tiny scale nudge. Directed flight, target contact and template timing stay intact. A casting echo is punctuation during casting, not an announcement that the entire animation has finished.

## Sound

Regenerated all 1,994 sound classifications from full native descriptions. Current catalog: 816 entries with optional audio profiles and 1,178 quiet entries. Quiet choices include private perceptions, spoken secrets, prepared benefits, cleansing without wound healing, and unresolved player-selected voices or materials.

Fear the Sun, Dread Secret, Friends to Foes and Hollow Heart no longer inherit the generic ominous fear cue. Fearful Feast and Devour Life use a finite siphon cue. Spirit Link and prepared life support do not play immediate healing sounds. Direct healing, natural healing, revival, laughter and applause retain fitting profiles. Species-specific wolf, dragon or monster voices are not guessed for an unspecified patron growl or humanoid howl.

Supported optional packs remain GGG, PSFX and SoundFx Library. Creature sounds contribute only when an explicitly fitting creature sound exists. Missing or disabled providers stay quiet without changing the effect graph. Sound selection, file existence and duration validation passed; this does not mean every audio recording was personally auditioned this round.

## Validation

- 508 automated tests pass, including PF2e and D&D isolation, editable recipe round-trip, optional sound combinations, native target routing, template preview cleanup, all-catalog effects-only uniqueness, and the reported six-spell regression.
- Full PF2e catalog audit: zero missing assets, sound files, geometry mismatches, short generated motions or invalid one-/three-target plans across spells and the existing feat, weapon and persistent-state catalogs.
- Full media-duration audit across both systems: zero missing selected media measurements, cutoffs or early fades. All 1,888 selected Patreon paths exist locally. The 876 Free paths were measured from official/reference files; the Free module is not installed in this workspace.
- Footprint audit: zero missing measurements across 2,060 selected sprite-sizing files. Alpha-visibility audit: zero suppressed clips, with intended contractions/fading artwork recorded separately. Naturally brief movie action is reported independently; it is not automatically lengthened or confused with short token motion.
- Rendered real installed Patreon footage for all six reported spells, plus Safe Passage, Devour Life, Spirit Link and Stabilize. Sample media loaded without errors; preview step status advanced and Fearful Feast reached its full completion. No browser console errors appeared in the isolated QA page.
- Independent review confirmed current casting styles preserve delivery/contact/template timing and the selected rotation footage visibly changes. Resolution-canonical comparison still yields 1,994 signatures in each edition.

Rendered checks are samples in the standalone workspace preview. This turn did not watch all recipes individually, run a live Free world, or rerun every animation on native Foundry canvas. Native canvas/event behavior has automated coverage; that is distinct from live visual verification. D&D catalog data remains separate, and the test suite checks both system paths.

Reproduction commands, run inside Animater:

```powershell
rtk proxy node tools/build-pf2e-catalog.mjs --reuse-media
rtk proxy node tools/build-spell-sounds.mjs
rtk proxy node --test tests/*.test.mjs
rtk proxy node tools/verify-spell-catalog.mjs
rtk proxy node tools/audit-catalog-depth.mjs --full
rtk proxy node tools/audit-media-completeness.mjs --all-systems
rtk proxy node tools/audit-media-footprints.mjs --all-systems
rtk proxy node tools/audit-media-visibility.mjs --all-systems --fetch-missing-free
```

The per-entry effect signature and casting allocation ledger is [pf2e-spell-variety-audit.json](../data/pf2e-spell-variety-audit.json). Structural verification is recorded in [full-catalog-audit-2026-10-07.json](../data/full-catalog-audit-2026-10-07.json). Local baseline signatures remain in `.cache/pf2e-strict-before.json` for this audit.
