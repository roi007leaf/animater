# Full sound audit - 2026-10-07

Automatic sound follows the action that actually happens, the permitted weapon, and the described audience. This pass removes gunfire from blowguns, premature music from preparation, public audio from private melodies, and contact noises from quiet metal buffs. It also replaces Force Barrage's gravitational impact cue with the already installed missile-release family, balances loud recordings conservatively, and prevents rapid contacts from accumulating long overlapping tails.

## Scope and evidence

The source is native PF2e 8.5.1, pinned commit `563fd52708673ddd4f66c76921efbf6a938fffed`. Every catalog sound decision is compared with its complete native description hash: **1,994 spells, 2,308 active feats, and 1,122 weapon uses**. Whole-row checks build recipes with no provider, each supported provider alone, and all providers together. Source comparison and rule matching cover every row; the concrete suspect descriptions below were read individually in full. This does not claim 5,424 individually heard playthroughs.

The persistent catalog's **43 conditions and 2,929 effects** remains deliberately quiet. Native state refresh, value changes, reload, scene entry, expiry, and duplicate-condition handover must not emit attack sounds or restart ambience. Persistent visual loops never generate recurring audio. Finite casting and attack recipes remain the source of automatic sound.

Provider inventory is the installed source data and actual filesystem, rather than a hand-written list of guessed keys:

| Provider | Installed version | Audio files inventoried |
| --- | --- | ---: |
| GGG: Sequencer Sound DB Collection | 0.2.1 | 3,447 |
| PSFX - Peri's Sound Effects | 0.18.0 | 439 |
| SoundFx Library | 1.0.3 | 167 |
| PF2e Creature Sounds | 2.0.0 | 2,871 |

Managers such as Monk's Sound Enhancements, Soundboard/Soundpad, Soundbrett, and The Sound of Silence contain no corresponding audio library in these installed copies. Their presence cannot supply a missing cue. [GGG's own database project](https://github.com/ChasarooniZ/GGG-Sequencer-Sound-DB-Collection), [PSFX's official library description](https://github.com/JimHPerry/psfx), and [SoundFx Library's official scope](https://github.com/MaterialFoundry/SoundFxLibrary) provide primary provider context. Animater stores references only and does not redistribute sound media.

The fresh pre-fix decoder audit checked **483 distinct candidate files**: zero missing paths, zero unresolved active DB references, and every candidate decoded with finite duration. Whole-file mean levels ranged from **-32.9 to -11.8 dBFS**; 89 native recordings were longer than the existing 4.5-second automatic cue cap. The final coordinated regeneration and decoder report is recorded separately below; historical pre-fix counts should not be substituted for final metrics.

## Native semantic corrections

| Source | Complete-description finding | Result |
| --- | --- | --- |
| Deathblow | Strike uses a blowgun or sling, not a gun | Neutral ranged release; `blowgun` no longer matches `gun` |
| Lonely Army | Explicitly attacks with deadly silence, using blowgun/sling | Quiet; no repeated gunfire |
| Blast Tackle / Trick Shot | Crossbow or firearm is permitted, in either word order | Neutral release preserves player choice |
| Twin Shot Knockdown | Two ranged Strikes with crossbows or firearms | Ranged cue rather than paired sword contacts |
| Writhing Runelord Weapon | Requires a polearm or spear | Long-hafted contact family |
| Cross the Final Horizon | Explicit unarmed elemental combination | Unarmed contact identity; visual choreography reviewed by the feat audit |
| Clear the Way | Attempts Shoves, then moves; makes no weapon Strike | No blade-cut cue |
| Everstand Strike | Makes one shield Strike; the successful hit can then Raise the Shield | One outgoing contact cue follows the corrected visual contact count |
| Force Barrage | Solidified magic shards fly toward individually chosen targets | Dedicated missile release, following actual repeat cadence |
| Boots on the Ground | Illusory troops cannot create music or intelligible speech | Quiet; forbidden music no longer treated as evidence for a song |
| Canticle of Everlasting Grief | Melody is audible only to its target | No automatic public audio |
| Enthrall | Caster may speak or sing | Player performance remains player chosen |
| Fortissimo Composition | Improves the next composition | No premature performance cue |
| Fold Metal / Precious Metals / Serrate | Reshaping, transmutation, or a weapon buff happens now | No anvil strike or outgoing blow |
| Field of Razors / Rust Cloud | Area formation happens now; contact/corrosion damage occurs later | No casting-time anvil impact |
| Steel Fortifications / Wall of Metal | Structures form in empty space; breakage happens later | No metal collision at formation |
| Needle Darts / Magnetic Acceleration | Metal objects actually fly | Separate release and landing-contact phases |
| Metal Reverberation | Tuning fork produces an explicit resonant note | Finite resonant chime; avoids anvil smash |
| Restraining Chains | Steel chain weaves and pulls | Finite moving-chain cue |
| Shielded Arm | Ore reinforces a protective arm; does not make a shield bash | Ward formation; no metal impact |

The primary rules are the pinned [spell sources](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells), [feat sources](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats), and [equipment sources](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/equipment). Per-entry source paths and description hashes stay in generated catalog data and sound audit evidence.

Provider labels are also checked against their actual filenames. The full GGG inventory already contains `magic.arcane.cast.missiles.02` recordings named **Force Barrage 001-007**; the old profile selected unrelated **Impact Gravi Blast** recordings instead. Toxic rays now prefer explicitly poison-whoosh files. Generic metal contacts exclude the **Anvil Deny** UI-style recording. No insect buzzing or wooden saw foley is substituted merely because a spell is named Buzz Saw.

## Timing, variants, and level balancing

- Paired physical contacts choose different real recordings deterministically within their vetted provider family. Related base weapons and tiers can still correctly share sound families.
- Automatic cues retain the recordings' original pitch and sample rate; this pass introduces no synthetic pitch shift to manufacture variety.
- Repeated releases and contacts inherit authored repeat count and stride. Rapid-contact tails fade before the next authored contact; they do not accumulate several full recordings at once. Later sample distance changes still follow the stable visual start links.
- Force Barrage prefers its short GGG release family when present. Decoded waveform inspection of all six retained GGG variants found strongest transients between **95 ms and 217 ms**, inside the 270 ms per-shot window. PSFX remains an optional fallback, with a measured 300 ms opening trim applied only to its known missile recordings. The untrimmed 5-foot and 15-foot variants measured **-88.05 and -52.60 dBFS RMS** in their first 270 ms; their actual 300-570 ms release windows measured **-14.87 and -13.68 dBFS RMS**, with peaks **-2.11 and -1.92 dBFS**. The other three PSFX distance variants also contain release energy in this window, from -12.98 to -12.01 dBFS RMS. Their later whole-recording strongest peaks are not confused with the earlier outgoing cue. These mono waveform measurements use 10 kHz decoding, before user volume/attenuation; they are not an audition or proof of identical timbre.
- Candidate gain is measured, then limited to `min(1, 10^((-20 - meanDb)/20), 10^((-3 - peakDb)/20))`. Thus louder files are attenuated; quiet recordings are never boosted. The user's volume multiplies this gain. The targets use whole-file FFmpeg mean/peak measurements, not integrated LUFS or a perceived-loudness promise.
- Saved optional cues retain current gain metadata. When an optional provider disappears, playback resolves an available vetted fallback and replaces its attenuation once. Repeated preview preparation does not compound gain. Manually chosen sound files and their authored volume remain independent.
- Optional missile opening provenance also survives saved recipes. Provider fallback replaces the known opening once, preserving additional user trim. Trimming limits the remaining native duration instead of looping beyond the recording. A previously unavailable preview clears its quiet flag when a provider becomes available again.
- All automatic cues remain finite, with fades and the existing maximum 4.5-second cap. Whole recordings are not promised for every rapid contact or missile. No assets are rewritten.
- Native attack release/contact, spell area impact, lightning hops, target-specific arrival links, and physical versus elemental weapon finishes keep their own anchors. Missing optional cues preserve visual timing and stage highlight indices.

The installed Sequencer source remains the actual playback authority. Its [official sound API documentation](https://fantasycomputer.works/FoundryVTT-Sequencer/#/api/sound) describes the sound section used by Animater. Installed Sequencer 4.2.3 source confirms the public preload signatures are `preload(files, false)` and `preloadForClients(files, false)`: strings or arrays of strings, then a boolean. Audio preloading delegates to public `foundry.audio.AudioHelper.preloadSound`. Installed Foundry core retains decoded buffers by the same source path for recordings shorter than ten minutes. Table preloading falls back to local loading if the caller lacks Sequencer's preload permission.

The native loading lifecycle exposed a Stop race: Sequencer adds a sound to its running-sound registry only after asynchronous loading, so stopping currently registered sounds cannot cancel a recording still loading. Preloading before the session starts, checking the cancellation epoch after preload, and ending the exact cancelled session again after `sequence.play()` resolves address that boundary through public APIs. Audio unlock remains asynchronous and therefore also needs that post-preload cancellation check. Runtime Stop and finite preview cleanup are covered by the shared integration tests; this sound-only pass does not claim live multiplayer audition.

## Verification and limits

Twelve new sound regressions cover native weapon choices, complete-description negation/privacy/preparation, dedicated missile families, paired recording variety, rapid-contact tails, attenuation without boosts, every generated recording's finite measurement metadata, provider fallback without repeated gain, manual-volume preservation, measured missile opening trims, provider return after an unavailable preview, and quiet persistent states. Existing sound regressions retain no-provider behavior, late registration, PSFX path relocation, native source hashes, quiet utilities, shape-specific rays, exact file existence, stable start links, lightning hops, and all six provider combinations.

`tools/audit-sound-files.mjs` records SHA256 of the actual media bytes separately from native PF2e description hashes. It verifies that retained generated duration, mean, peak, and gain match decoder evidence. These hashes identify the reviewed installed recordings; they do not authorize redistribution or describe their timbre.

Decoder and level probes inspect the actual retained media files, including candidates only used when another provider is disabled. Filenames and database classification establish intended semantics; they do not establish audible character. No audio-listening tool was exposed to this audit agent. Recorded waveform and decoder evidence therefore must not be described as listening to every clip.

Remaining limits: simultaneous physical/elemental layers, audio generated by different players, and other modules can overlap; per-file balancing is not a global master limiter. Measurements and media hashes identify the listed installed provider versions; replacement recordings need regeneration rather than assuming their levels match. Optional direct-file libraries rely on the installed version's paths, whereas registered libraries additionally check current database keys. Private, uncertain, and player-chosen sounds stay quiet rather than inventing noise. Related abilities may share a physically appropriate contact family; deterministic variant rotation does not make them different rules or bespoke foley.

## Final coordinated validation

The regenerated catalogs passed the complete 5,424-row audit with **zero issues**. Checks cover no sound provider, each of the four providers individually, and all four together. This is six configurations, not every possible provider subset.

| Catalog | Action rows | Rows with available cues | Deliberately quiet rows | Used sound profiles | Actual selected files with all providers |
| --- | ---: | ---: | ---: | ---: | ---: |
| Spells | 1,994 | 896 | 1,098 | 66 | 83 |
| Active feats | 2,308 | 685 | 1,623 | 30 | 99 |
| Weapon uses | 1,122 | 1,122 | 0 | 92 | 199 |

Provider-only availability differs because the libraries contain different kinds of sound. Quiet rows and missing suitable optional cues do not suppress visual choreography:

| Active provider alone | Spells | Feats | Weapon uses |
| --- | ---: | ---: | ---: |
| GGG | 872 | 685 | 1,122 |
| PSFX | 732 | 455 | 412 |
| SoundFx Library | 87 | 39 | 54 |
| PF2e Creature Sounds | 1 | 0 | 0 |

**496 retained candidate media files** passed exact-path, active database reference, duration, and FFmpeg decode checks. All 496 actual files were separately SHA256 hashed. Generated measurements matched the independently decoded report with zero discrepancies. **382 files are attenuated; 114 are never boosted.** Effective whole-file mean levels range from -34.8 to -20.0 dBFS; maximum effective peak is -3.0 dBFS, before the user's volume. The 95 native clips exceeding 4.5 seconds retain the finite automatic cue cap.

The five focused sound test files pass **53/53 tests**, including all twelve new regressions. All 2,972 persistent state recipes contain zero sound stages. Broad runtime/visual verification belongs to the coordinated root audit, including the public-preload cancellation fix and sound clip-range compilation.

Reproducible commands:

```text
rtk proxy node --test tests/full-sound-audit.test.mjs tests/ability-sounds.test.mjs tests/spell-sounds.test.mjs tests/deep-sound-audit.test.mjs tests/deep-sound-semantics.test.mjs
rtk proxy node tools/audit-weapon-sounds.mjs --probe-audio --output=.cache/full-sound-audit-final.json
rtk proxy node tools/audit-sound-files.mjs --probe-report=.cache/full-sound-audit-final.json
```

Retained evidence: [actual media hashes and measured levels](full-sound-file-audit-2026-10-07.json), [representative waveform and every PSFX missile window](full-sound-waveform-2026-10-07.json). The full source-description/provider/phase matrix is `.cache/full-sound-audit-final.json`; it contains no sound media.
