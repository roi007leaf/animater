# SF2e support

Source: official SF2e 1.5.1, tag `sf2e-1.5.1`, commit `563fd52708673ddd4f66c76921efbf6a938fffed` in `foundryvtt/pf2e`. Generation follows the system builder's explicit shared-PF2e document list and native pack/flag remapping. It does not import the complete PF2e catalog into Starfinder worlds.

| Catalog | Native entries |
| --- | ---: |
| Spells | 432 |
| Active feats/actions | 858 |
| Weapons | 192 |
| Conditions pack | 46 |
| Sustained effects | 400 |

The conditions pack contains 43 condition Items and 3 effect Items. Effect-backed conditions, including Suppressed, use condition catalog settings while retaining their native effect expiry rules. The source inventory contains 3,990 documents. Passive feats, passive grants, and non-activated equipment parents remain excluded. Equipment-created effect Items appear in Effects; this build has no separate activated-equipment catalog for SF2e.

Catalog settings default off. Use a single entry or enable its entire catalog; customizations retain native SF2e UUIDs. The world system controls visible catalogs and automatic matching. Item names open their native Foundry sheets. SF2e uses `sf2e` chat/template flags while retaining the shared PF2e document structure.

Weapons distinguish melee, ranged and thrown usage. Laser, plasma, cold, sonic, electrical, corrosive and null attacks use matching media families where installed. Native Area Fire and Auto-Fire variants wait for Region/template placement. Unsuffixed cone/line traits use native range; automatic weapons use the native half-range cone. Grenades fly into their placed burst before payload playback. Area footage uses actual cone media or a bounded directional fan; symbolic substitutes remain labeled.

Native conditions/effects and prepared auras use the shared persistent reconciler, with SF2e-only lookup. Visuals follow document removal, expiry, visibility and scene changes. Aura fields use prepared radius beyond the token footprint. Recipient effects remain token-sized. Persistent states remain silent.

Spells and active abilities share description-based choreography builders with PF2e. Native SF2e descriptions drive selection, including explicit target empowerment for Supercharge Weapon. Media is reused where concepts match; this is not a claim that all entries are bespoke or individually watched. Quiet sound designs stay quiet. Optional GGG, PSFX and SoundFx Library cues require those packs; no media is bundled. Native cast rank reaches rank-dependent choreography. Variable-action Force Barrage retains the existing editable three-action illustration because the cast card does not reliably expose action budget.

Validation: all generated usages resolve in installed Free and Patreon inventories; 640 tests pass across the complete module. Automated coverage includes system isolation, native rolls and Regions, optional sound compilation, alternate usages, area variants, customization priority, effect-backed conditions, expiry, private visibility, aura radius and native-sheet routing. Rendered preview uses installed JB2A footage and step highlighting. Native SF2e world gameplay and multiplayer remain unverified.

Regenerate with `rtk proxy node tools/build-sf2e-catalog.mjs`. Coverage and excluded sources: `data/sf2e-catalog-validation.json`.
