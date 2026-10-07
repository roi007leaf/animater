# Full-clip playback audit

Force Barrage's first missile file lasts 1,867ms. Its 60-foot variant lasts 2,033ms, and the longest distance/random variant lasts 2,200ms. The former 1,900ms stage cut those longer files off. A separate 3,000ms impact ceiling also shortened longer footage.

The baseline found 1,315 shortened stage/edition combinations across 420 spells and 207 active feats, plus 2,350 exit fades beginning before native footage ended. These counts include both Free and Patreon resolutions, so they are not counts of unique stages.

The audit now includes all 1,994 spells, 2,308 active feats and 1,122 native uses of 1,013 weapons against both inventories. It includes every distance/random variant for each selected one-shot or travel key. Missing Free-only footage is fetched from the official public JB2A repository into development cache; other files use installed footage. Current counts live in the generated report and weapon catalog audit. The report records their source URLs. No downloaded media is bundled with Animater.

**Result: zero measured cutoffs, zero premature exit fades, zero unmeasured files in this selected scope.** Looping ambience and finite casting cues retain their authored windows; the whole-clip audit covers one-shot stages and native travel. Explicit opening skips or clip endpoints remain deliberate authored clips. This audit does not claim to measure every asset in the entire JB2A inventory.

## Fix

- Full one-shot stages cover the longest selected native movie at the configured playback speed. Exit fades, shrinking and rotation occur after that movie finishes.
- Normalization happens before linked timing, repetition, preview highlighting and cleanup deadlines, and again at runtime entry. Older saved one-shot recipes receive the same protection without a storage rewrite.
- Generators probe every distance/random variant rather than the first file. The impact generator no longer imposes a three-second cap. Rebuilt catalog data and CSV timelines reflect complete playback.
- Explicit trims and looping windows retain their configured duration. Existing contact estimates and launch intervals are retained; this is not a new frame-by-frame arrival review for every variant.
- Long native films can now take more than three seconds; they are played at the configured speed rather than automatically accelerated. Clips exceeding the per-stage 30-second limit require an explicit trim or a faster chosen speed.

## Verification

Native-file regressions check Force Barrage distance/random variants and long-impact spells. Model/editor/runtime regressions cover playback speed, repeated tails, finish links, fades, scaling, rotation, cleanup deadlines, idempotent validation and explicit trims. Existing tests cover overlapping total volleys, target staggering, cancellation and temporary-template cleanup.

All 288 automated tests passed, with no skipped tests, on 2026-10-06. Weapon regressions also cover native alternate usages, optional audio and complete travel/contact footage.

Rendered installed-media verification played all three Force Barrage flights and all three contacts to their native video ends. The editor reported completion only at the full 3.4-second timeline, with no browser errors. Foundry canvas behavior is covered by compiler/runtime regressions; live Foundry gameplay was not verified during this audit.

Reproduce with:

```powershell
rtk proxy npm test
rtk proxy node tools/audit-media-completeness.mjs
```

To refresh measured durations, use `--write-durations`. On a fresh machine without all required Free-only files, add `--fetch-missing-free` to fetch them from the official public repository. Run the audit again after writing the registry so its imported recipes use the updated lifetimes. `--baseline` captures the current state; it does not recreate the historical pre-fix state.

Evidence: [before](../data/pf2e-media-completeness-before.json), [after](../data/pf2e-media-completeness-after.json), [shipped duration registry](../data/media-durations.mjs).
