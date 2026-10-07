# Token motion coverage audit — 2026-10-07

The prior catalogs had gaps. This pass changed 180 transient recipe/activity variants: 13 PF2e spells, 151 PF2e feats, and 16 D&D native feature variants. It added 86 recipes with actual traversal and 92 missing physical ranged release gestures. Remaining improvements replace small gestures with described movement, rather than adding arbitrary motion to every activation.

## Coverage

Counts refer to recipe/activity/use variants, not unique document names. Only ready PF2e spell compositions are included; 898 unconfigured spells remain excluded from automatic playback.

| Catalog | Variants | Motion before → after | Traversal before → after |
| --- | ---: | ---: | ---: |
| PF2e spells | 1,096 | 451 → 457 | 14 → 27 |
| PF2e active feats | 2,308 | 948 → 1,069 | 213 → 272 |
| PF2e weapon uses | 1,122 | 1,122 → 1,122 | 0 → 0 |
| D&D spells | 957 | 821 → 821 | 0 → 0 |
| D&D feature activities | 685 | 640 → 640 | 3 → 17 |
| D&D weapon activities | 815 | 748 → 748 | 0 → 0 |
| D&D item activities | 865 | 750 → 750 | 0 → 0 |

Weapon attacks use bounded melee/throw gestures or firing recoil; they do not need a charge path merely because they are attacks. D&D weapon/item variants also include delegated and nonattack activities. A motion-free variant is not automatically an omission.

## Description-based changes

Complete descriptions were re-read for the 88 listed movement replacement variants: 13 spells, 59 feats, and 16 D&D feature activities. The machine-readable report records their source links, description hashes, profiles, and performer constraints. The remaining 92 release gestures use the existing description-derived weapon/motif and require an actual source-origin projectile stage. This pass does not claim to have manually re-read every catalog description.

- Dual-Weapon Blitz, Triggerbrand Blitz, Running Tackle, Swimming Charge and similar combined activities now traverse before or during their contacts. Needle in the Gods' Eyes uses an airborne approach.
- Parting Shot steps backward before shooting. Hurling Charge advances after its thrown Strike. Temporal Fury steps between contacts; Drifter's Juke depicts both Steps.
- Pack Movement has a close paired contact cadence distinct from Dual-Weapon Blitz. Its native two-performer gate remains: the default one-source graph is a manual illustration, not automatic selection of an animal companion.
- Friendfetch draws up to two selected willing allies inward after tether contact. Four Winds moves up to four selected willing participants. Friendly Push and ally tosses move the first selected recipient outward.
- Base-rank PF2e Jump depicts a self Leap; rank 3+ only grants future Leaps. Native chat origin cast rank selects the branch. Hippocampus Retreat transforms its caster, depicts one parting melee contact, then swims away.
- D&D Aggressive, Rampage, Prowl, Adrenaline Rush, World-Shaking Movement and Deadly Leap use paths. Cunning Strike only withdraws on its Withdraw activity; Poison, Trip and damage activities retain their own treatment. Monk and Cunning Action branches remain activity-specific.

Motion is cosmetic mesh displacement. It restores the original pose and never updates token documents, legal movement, conditions, resources or outcomes. Long routes are finite illustrations, not exact legal destinations. Selected recipient movements illustrate willing/chosen branches; the module does not infer consent or resolve conditional checks. Mounted, companion and tandem actions still require the actual performer mapping.

## Deliberate limits

Later movement grants and subsequent-turn options do not become automatic traversal during casting. Examples include Synchronize Steps, Connective Current, Wind Jump, heightened PF2e Jump and D&D Jump. Teleports with unknown destinations, remote objects, failed-save forced movement, and unresolved additional performers require explicit context or customization. Existing small activation gestures may remain for those entries.

All 2,972 PF2e persistent condition/effect recipes and 1,377 D&D persistent recipes remain quiet and motion-free. Status refreshes and aura loops must not repeatedly move tokens.

Catalog defaults were updated. Saved customized recipes retain their authored stages. Both systems' effects-only option resolves removed motion anchors while retaining artwork and audio stages.

## Verification

- 7,848 transient variants compiled, including effects-only forms; 23,544 plans across three-target, unequal rectangular token, and distant-target contexts.
- 3,658,401 pose samples checked for finite transforms and exact neutral restoration; zero issues in the coverage report.
- All 2,308 active feat compositions remain distinct under the existing coarse perceptual comparison; Free and Patreon effects-only comparisons also pass.
- Full test suite: **564 passed, 0 failed**, including regressions for attack/movement order, willing recipient counts, cast-rank branches, restored poses and preview bounds.
- Media completeness: zero missing referenced measurements, cutoff stages or premature fades. Installed Patreon paths verified; Free uses official inventory/reference measurements because Free is not installed here.
- Footprint audit: 2,114 selected paths, zero missing measurements.
- Browser proof: Dual-Weapon Blitz showed concurrent first contact/motion/audio at 1.9 seconds, then completed at 4.7 seconds. Jump showed caster motion while its target stayed still, then restored at 3.9 seconds. D&D Aggressive showed advancement, then restored at full completion. No browser warnings/errors observed.
- A browser check reproduced long fixed Leaps clipping the narrow composition preview. The schematic camera now fits the complete route with a consistent token/artwork grid. Narrow/wide preview regressions pass; canvas distances and durations are unchanged.

Live Foundry multiplayer was not exercised this pass. Runtime guarantees additionally rely on existing mocked Foundry/Sequencer regressions, rather than browser design preview alone.

Artifacts: [coverage report](../data/catalog-motion-coverage-audit.json), [audit tool](../tools/audit-catalog-motion.mjs), [motion profiles](../scripts/catalog-motion.mjs), [Jump preview proof](../.cache/motion-jump-preview.png), [D&D preview proof](../.cache/motion-dnd-aggressive-preview.png).

Reproduce coverage with `rtk proxy node tools/audit-catalog-motion.mjs --baseline .cache/motion-opportunities-before.json`. Without the optional baseline, the tool audits current coverage, timings and poses without before/after comparisons. The baseline remains a local audit artifact and is not a runtime dependency.
