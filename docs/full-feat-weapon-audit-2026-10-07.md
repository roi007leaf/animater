# Full feat and weapon visual audit — 2026-10-07

This pass checks the entire shipped active feat and weapon populations, then reads suspect activations individually. Its scope is **2,308 active feat entries and 1,013 weapon documents / 1,122 native usages**. This is not a claim that every entry has bespoke footage or that every description received an individual human reading.

The current-pass individual reading ledger is [full-feat-weapon-review-scope-2026-10-07.json](../data/full-feat-weapon-review-scope-2026-10-07.json): **163 feat descriptions and 178 weapon descriptions**, including all **171 bomb entries**, their grade variants, three Splintering Spears, the five return-text suspects and Macuahuitl. Full raw descriptions were consulted when normalized text omitted an unlabeled UUID reference. Followup corpus performer/minion scans read 28 additional complete descriptions (26 additional unique feats), distinguishing actual performers from granted later attacks and legitimate self actions. The earlier movement audit separately read 175 feat entries, including all 137 movement/flight descriptions in its reviewed subset; these counts must not simply be added because they overlap.

## Sources and method

- Native PF2e **8.5.1**, pinned revision [`563fd52708673ddd4f66c76921efbf6a938fffed`](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e). Weapon mode, damage, persistent damage, traits, runes and DamageDice/FlatModifier predicates were checked against native data rather than inferring damage from a magical item's name.
- Installed JB2A Patreon database and [official JB2A Free database](https://github.com/Jules-Bens-Aa/JB2A_DnD5e/blob/main/scripts/jb2a_sequencer.js): **6,870 Patreon and 1,351 Free video keys** available to selection. Existing inherited templates and video metadata determine radial versus directional geometry. The inventory is searched completely; using every available key is not an artistic requirement.
- Corpus suspect scan found 229 feat suspects and 358 weapon suspects. Overlapping reasons: 123 advanced attack-topology feats, 32 counted-Strike descriptions, 30 no-contact candidates, 31 throw-text candidates, 25 alternate origins; 189 weapons with relevant native rule elements, 171 bomb payloads, five return-text items and three multi-mode persistent items. These are review queues, not 587 confirmed defects.
- `tools/feat-weapon-deep-audit.mjs` checks every generated entry in both editions at near, far and six-selected-target contexts. It checks full-description provenance, installed-edition keys, local versus stretched geometry, native usage regeneration, contact/flight presence, unrelated-target spill, finite sampled token poses and neutral restoration. It records selected keys and coarse visible compositions honestly.
- `tests/full-feat-weapon-audit.test.mjs` contains 18 focused regressions for the concrete failures below. Tests use explicit graph fixtures so they do not require downloading media; the selector probe separately used the complete actual databases.
- Rendered Foundry playback, clip alpha/activity measurements, media duration/scaling and sounds are separate parent-agent audits. Pure graph checks do not prove that every animation was watched, heard or rendered on the live canvas.

## Confirmed failures and fixes

| Native activity | Failure | Change |
|---|---|---|
| Paired Shots / Twin Shot Knockdown | Paired melee slashes despite firearms/crossbows | Two real shots at the same foe; Paired Shots arrives simultaneously. Default firearm art explicitly allows crossbow replacement. Prone remains conditional. |
| Bullet Split | Both simultaneous cloned projectiles went to the first foe | Exactly one concurrent flight and arrival per selected different foe, capped at two. |
| Triggerbrand Blitz | First/second/last routing skipped middle targets or repeated a missing victim | Ordered first/second/third contacts; missing optional second/third stages do not fall back to the first. Shared positional routing fix supplied by the parent. |
| Anatomical Quartering | Four total repeats cycled through fewer than four different creatures | Once per selected victim, capped at four, with the spirit accent at the final capped recipient. Shared target-limit ordering fix supplied by the parent. |
| Blazing Streak and different-foe charges | Declared attack count duplicated already selected victims | Once per distinct selected victim, capped at the native maximum. |
| Cross the Final Horizon | Tiny approach, generic weapon cuts and three hits distributed across foes | Readable held rush into three same-foe unarmed storm contacts. Electricity is the configured example; sonic remains a native per-Strike choice. No automatic drained outcome. |
| Generic charge fallback | A few-pixel lunge represented actual Stride/Leap activities | Bounded cosmetic rush/leap/roll toward a sampled endpoint, arrival-linked contact and readable hold/reset budgets. This is not exact multi-waypoint traversal. |
| Clear the Way | Five weapon Strikes although native action makes Shove checks | Up to five local Shove cues followed by a cosmetic half-Speed Stride. No damaging weapon-contact sequence. |
| Everstand Strike | Target guard cues counted as extra hits and the target appeared shielded | One native shield bash, then a conditional source Raise-a-Shield cue. |
| Clan's Edge | Same-target/default finish; Parry shown at victim | Two different dagger recipients, followed by source Parry. |
| Into the Fray | Two generic cuts without movement or different weapon/shield art | Cosmetic approach plus weapon contact at first foe and shield contact at second. Native Leap/Stride/Swim choice and actual route remain configurable. |
| Defend Our Union | Protective Strike lacked the actual post-trigger Stride | Held cosmetic approach before one protective contact. Ranged alternative and successful damage reduction remain explicit choices. |
| Skyseeker | Default three hits assumed optional level-12/16 successful continuations | Base one Leap and one Strike; higher-level branches require explicit different creatures and successful hits. |
| Tidal Wave | No actual movement cue and an unsupported claim that both attacks must share a foe | Real bounded cosmetic approach with two contacts; native direction now permits selected foe(s). Default sampled choreography uses the first foe and documents routing customization. |
| Impossible Flurry | Unsupported same-target restriction | Native six-Strike sequence can distribute over the selected foe(s); other same-foe multiStrike finishes no longer splash unrelated targets. |
| Godbreaker | Ordinary repeated cuts, no joint ascent or final slam | Source and grabbed foe share a finite upward map silhouette, three unarmed contacts and a final ground-slam cue. This depicts the successful branch, abbreviates height and restores meshes without moving documents. |
| Spinning Stand / Hindquarter Kick | No rotational stance cue | Readable source spin with talon contact; optional second Spinning Stand foe stays an explicit branch. Cosmetic reset does not apply Stand. |
| Split Spellstrike | No chosen-magic discharge at the two weapon recipients | Localized symbolic discharge at each separate contact. The actual chosen spell and area are not guessed. |
| Devastating Manifestation | Missing manifestation and spirit damage accent | Soulforged source manifestation followed by the configured weapon branch and spirit accents. Armor/shield-only branch remains a separate customization. |
| Borrowed Ability / Brain Drain / Exsanguinate / Desiccating Inhalation / Desperate Revival | Source-only inward flourish without victim-to-source flow | Visible small radial motes move from actual selected creature(s) into the source. No stationary strands stretched into a false beam and no added weapon Strike. |
| Cascading Ray / Killshot's Report | Secondary spell energy incorrectly began at caster | Previously struck first creature emits toward the second creature. No caller recast and no first-target reattack. |
| Chain of Words | Caster fan-out and impacts on rune bearers, who are explicitly outside the damage line | One configured rune-endpoint line with no endpoint attack. Actual rune bearer selection must be supplied by the user/native context. |
| Chain Reaction | A literal bullet bounced through every victim | One initial shot followed by ordered improbable-consequence cues. Controlled Bullet retains its genuine chained projectile. |
| Bullet Dancer Reload / Cauterize | Only the shot was represented | Source after-shot reload or heated-barrel assistance glint. Cauterize defaults to self assistance; adjacent-ally recipient is configurable and ending bleed is not guaranteed. |
| Star Grenade | Circular fireball concealed its distinctive crossed release | Two perpendicular local flame arms at the same arrival. They are a compact illustration; actual two 25-foot splash lines remain native/manual. |
| Silversoul / Silverscrap | Purple mental gas or generic-colored metal obscured native silver material | Silver particle radiance and silver-toned shrapnel. Nindoru-only persistence is excluded from the unconditional Strike graph. |
| Vexing Vapor / Crystal Shards | Mental-purple gas and blue ice contradicted red powder/red-brown crystals | Red-powder gas coloring and brown crystal fragmentation. Crystal footage remains an explicitly symbolic sharp-shard substitute, not cold damage. |
| Blightburn | Ordinary poison liquid despite radioactive material | Particle discharge and brief green energy-field residue. No illness progression or recurring splash automation. |
| Aether Marbles | Missing lingering force eddies | Brief force-field residue rather than a liquid blob. No difficult-terrain creation. |
| Sticky Algae / Peshpine / Twigjack / Durian / Spider Satchel | Material distinctions lost in shared poison/physical payloads | Algae plus glowing particles; plant-colored needles/brambles; physical fruit contact plus stench; finite biting-particle swarm approximation. Spider Satchel does not become an entangling web. No literal spider-swarm footage exists in the inspected inventories. |
| Mode-specific persistent damage / Wounding | Base-mode persistence could leak into alternate use; unconditional Wounding lacked a lingering cue | Each usage reads its own persistent damage; Wounding and unconditional native persistent rules get brief residue. Critical-only and target-specific riders remain excluded. |
| Macuahuitl and implicit bleed rules | Tearing trait was omitted; bleed rule elements without category could lose their ongoing cue | Tearing supplies unconditional bleed contact and finite residue. Native DamageDicePF2e, ModifierPF2e and DamageInstance classify bleed as persistent without explicit category. The old contradictory Wounding test was corrected against this native implementation. |
| Cane of the Maelstrom | Successful-Strike Warpwave rider absent from ordinary club/thrown graphs | Finite distortion field follows primary contact; multicolored Patreon art and explicitly approximate blue Free art. The reaction shield, Mirage and Creation activations remain separate. Shared runtime success gating belongs to the parent. |
| Actual performer and ordered-victim roles | A caller or unordered current target set could stand in for an eidolon, thrall, mount, innovation, rune endpoint or previous victim | 47 reviewed entries have explicit `playbackRoles` metadata and `featPlaybackRoles` lookup. Unresolved automatic roles skip with the supplied Activity reason through the parent runtime guard. Two-performer actions remain manual illustrations until a customized graph maps both actors. |

## Native rules fidelity and remaining limits

Native action counts do not mean guaranteed hits. Attacks that continue only after success, optional higher-level continuations, resistance branches, prone/drained conditions, healing and Escape opportunities remain player/GM decisions. The graph is a finite configured illustration, not an evaluator of these outcomes.

Boomerang return-text suspects were reviewed rather than blanket-tagged as returning. Its Recovery trait is distinct from an unconditional returning rune. Text such as “returns to normal form,” the cane's recurring whispers and Trueshape's polymorph effect does not create a weapon-return flight. Splintering Spear's always-on bleed belongs to both legal weapon usages; its activated area shatter does not become an ordinary Strike explosion.

Eidolon/thrall/mount/innovation activities need the actual performer. Selected rune endpoints and previously struck foes also need explicit roles. The 47 explicit role records preserve worn-innovation versus separate-construct alternatives, commanded-thrall recipients and defeated-victim origins. Magical Onslaught, Recoiling Relocation, Tandem Strike/Movement, Pack Movement, Duo Dragon Kick and mounted rider-plus-mount charges require two actual performers; their one-source graph is only a manual illustration. If automatic native chat data cannot identify these, a caller token is not an honest substitute. The current parent runtime guard skips automatic playback for all 47 records and displays the supplied Activity reason; actual actor/history resolution has not been implemented. Manual preview/customization remains available with correctly selected actors. Role metadata survives recipe normalization/save/import. Generated reasons are checked against the native names, including the repaired builder name propagation. No companion is invented and no TokenDocument relocation occurs.

Routes remain cosmetic and sampled. Generic multi-foe charges do not reconstruct every native waypoint or prove reach along the path. Godbreaker’s upward map silhouette is an abbreviated successful-branch illustration, not three exact 20-foot elevation changes. Its meshes reset after the visual; that reset is not falling damage or a Stand action. Joint geometry, holds and cosmetic restoration are tested separately from rules execution.

Native artwork is shared where the source activities describe the same material or weapon action. Grade variants often differ mechanically rather than visually; those grades should not receive random unrelated colors or effects. Key counts, fine timing differences, labels and IDs are not evidence of bespoke choreography. No name/hash-based jitter or arbitrary inventory-usage quota was introduced.

## Validation and reproduction

Focused graph/material tests: **18/18 pass**; expanded feat catalog, variety, path motion, weapon catalog and focused tests: **70/70 pass**. The actual selector probe covered 17 changed feat designs and six changed weapon modes against the complete 6,870/1,351-key inventories: **zero missing assets**. Cane's additional field selector has a separate two-edition regression; the parent added a shared success-only gate so automatic unknown/failure rolls omit Warpwave while local preview shows the successful branch.

The final regenerated whole-corpus ledger passes with **zero issues**: **2,308 feats, 1,013 weapon documents, 1,122 usages, 20,580 edition/context plans and 13,908 planned motion instances**. Every motion instance receives **201 pose samples** for finite geometry and neutral restoration; repeated paths are checked for overlap and readable duration floors. The three contexts are near one recipient, far one recipient and six selected recipients. The highest sampled feat translation speed is **11.212 squares/second**, Sudden Leap at the far sample with a **4.56-second** total motion. These are cosmetic pacing measurements, not legal movement speeds or proof of every live mesh frame.

Actual selected footage counts:

| Domain | Patreon keys / families | Free keys / families |
|---|---:|---:|
| Feats | 286 / 84 | 167 / 89 |
| Weapon uses | 96 / 50 | 65 / 44 |

The quantized visible graph fingerprint reports 2,308 feat configurations per edition. This **does not establish 2,308 bespoke or perceptually unique animations**: entrances, framing and timing can split fingerprints while related activities remain visibly similar. The parent's broad-family similarity clusters supply the stronger shared-structure measurement. No arbitrary palette or asset-use quota was added to inflate these counts.

Final machine evidence: [full-feat-weapon-audit-2026-10-07.json](../data/full-feat-weapon-audit-2026-10-07.json). Live playback, alpha/activity, clipping/scaling, sound and multiplayer behavior belong to the separate parent audits; graph success is not substituted for those checks.

```powershell
rtk proxy node tools/build-pf2e-feat-catalog.mjs --reuse-media
rtk proxy node tools/build-pf2e-weapon-catalog.mjs
rtk proxy node tools/feat-weapon-deep-audit.mjs
rtk proxy node --test tests/full-feat-weapon-audit.test.mjs tests/deep-feat-audit.test.mjs tests/weapon-catalog.test.mjs tests/deep-weapon-audit.test.mjs
```

`FEAT_SELECTION_REVISION` is 6. Reuse retains already measured media timing, while changed selection/routing semantics refresh native assets. Generated catalog files are rebuilt by the parent only; this agent edited semantic selectors, choreography, regressions and audit records.
