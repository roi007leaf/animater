# PF2e fire spell audit

Source: official PF2e 8.5.1 spell descriptions, pinned commit `563fd52708673ddd4f66c76921efbf6a938fffed`. Complete descriptions were read for the 79-entry reported fire cohort, including Rejuvenating Flames after its theme was corrected to healing. Audit exports retain description hashes and character counts, not additional copies of the source prose.

## Cause and changes

The semantic fallback treated unreviewed fire bursts as detonations. Eighteen spells consequently shared explosion-and-smoke bodies, including the three reported spells. Free asset substitutions also collapsed several ray and cone treatments.

Twenty-five explicit designs now use the described materials and delivery. Breath of Drought uses arid heat shimmer and dusty wind without an explosion. Burning Blossoms grows a flowering canopy with pale drifting petals and a heat layer over its native 30-foot radius. Dehydrate uses inward heat, flame and escaping vapor. Dust and fog form unignited clouds; ash falls; Geyser combines water and steam; fireworks differ by their actual footage and arrangement. Cataclysm layers its destructive elements, while Elemental Confluence forms six material clusters without automatically choosing its later attacks. Sun Blade and Fire Ray remain rays with different contact/ground layers; the three flame cones have different compositions in Free too.

Generic detonation now requires immediate explosion language in the opening description sentence. Conditional later ignition does not qualify. Optional audio stays quiet for dry heat, dehydration and unignited clouds; water, earth, sacred fire, sunlight and fireworks receive their own profiles. Deferred hazards and elemental formation no longer apply immediate token-burning filters. Save-dependent forced movement remains mechanical rather than moving selected victims on cast.

Additional material slots receive the same measured lifetime handling as the original slots. Rejuvenating Flames retains flame-cone footage even though its theme is healing.

## Validation

| Check | Result |
| --- | --- |
| Original main-body compositions | 62 Patreon / 56 Free across 79 spells |
| Current main-body compositions | 79 Patreon / 79 Free; no shared identities |
| Current missing edition keys | 0 / 0 |
| Full test suite | 705 passed, 0 failed |
| Whole PF2e spell geometry audit | 0 issues in both editions |
| Expanded media completeness audit | 2,008 probed files; 0 missing files, measured cutoffs or early fades |

Identity compares actual selected edition footage/variants, subjects, placement, repeats, tint and visible property tracks. It ignores names, IDs, timing, scale, sound, motion, provider filters and generic casting rings. The regression also strips the initial caster stage, so a different opening gesture cannot conceal a repeated main body. Distinct compositions can still share individual flame or smoke layers.

Rendered window previews were checked for the three reported spells using installed Patreon footage: media loaded without errors, stage highlights progressed, and Dehydrate reached its full 10.1-second playback end. Screenshots: [Drought](fire-drought-preview.png), [Blossoms](fire-blossoms-preview.png), [Dehydrate](fire-dehydrate-preview.png). No browser warnings/errors were recorded for these checks.

Free keys and geometry were checked against its inventory. The completeness audit used 894 reference measurements for Free footage; a separate Free installation was unavailable. These are inventory/media checks, not a claim of native Free canvas playback. The browser fixture does not run Foundry's canvas or automatic triggers.

## Artwork and context limits

Burning Blossoms uses a top-down flowering plant canopy as a symbolic substitute for the described hollow, 100-foot tree. Pale drifting leaves stand in for petals; Dehydrate's visible heat/vapor is also symbolic. Free lacks some exact colors and effect variants.

Formation previews illustrate initial spell placement. Later Sustain actions, chosen elemental attacks, enemy-triggered ignition, save results and vertical extents are not automatically resolved. Ember Doppelganger provides a caster-adjacent ember silhouette; independent minion placement/movement and later blast locations require customization. Heightened dimensions still depend on native area context.

Catalog defaults receive these changes on reload. Existing saved customizations retain their saved stages.

Evidence: `data/fire-spell-audit-before.json`, `data/fire-spell-audit.json`, `data/pf2e-media-audit-after.json`, `data/pf2e-media-completeness-after.json`, and `docs/fire-spell-audit-tests.log`. Regression command: `node --test tests/fire-spell-audit.test.mjs tests/spell-semantics.test.mjs tests/spell-gap-integration.test.mjs`.
