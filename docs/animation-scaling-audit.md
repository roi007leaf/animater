# Animation scaling audit

Verified against installed Sequencer 4.2.3 compiled source, plus native Animater runtime/compiler and editor rendering regressions. No Foundry documents or settings changed.

## Reproduced defects

- **Beam thickness cancelled:** Animater called `stretchTo(target).scale(0.4)`. Sequencer first divides connecting distance by `scale.x`, then scales both axes. At distance 300px, 1000×400 media with 200px padding at each end stayed 200px high for every scalar scale. The editor showed 80px for scale 0.4, so canvas and editor disagreed.
- **Rectangular tokens distorted local artwork:** `scaleToObject()` fits each axis to token dimensions. A 200×100 token made square rings 200×100. Texture scales and negative mirror signs should not alter an occupied-footprint ring.
- **Copied sprites lost captured dimensions:** `copySprite()` already captures actual mesh dimensions, including token texture sizing. Later `scaleToObject()` overwrote that with occupied grid dimensions; a 400×100 mesh on a 200×100 footprint became 200×50.
- **Area textures forced square:** explicit width and height both used template diameter, distorting non-square media rather than retaining artwork proportions.
- **Editor artwork over-sized:** every local effect used a fixed 115×115 layer around a 55px sample token. Scale 1 appeared over twice canvas size. Native non-square media and large-token footprint were ignored.
- **Editor property-track increments used the wrong base:** width/height changes divided by 115 regardless of actual rendered artwork size.

## Fixes

- Beams use `{ x: 1, y: stage.scale }`, preserving padding-aware source/target endpoints while applying requested thickness.
- Local effects and projectiles use the longest occupied token dimension and native media aspect. Mirrored or oversized token textures do not distort surrounding rings. Moving projectiles continue using origin footprint, including return flights; saved scale controls remain effective.
- Token copies keep Sequencer's captured mesh dimensions and inherited orientation; stage scale applies once. Editor copies use supplied mesh dimensions and mirror signs, including explicit mirror controls without double-negation.
- Circular area effects keep diameter as their largest artwork dimension and retain native aspect. Existing scene/template cleanup remains intact.
- Editor local layers use 55px per sample grid square, occupied token footprint and native media aspect. Area sizes use supplied scene grid distance. Property-track increments use actual layer dimensions.

## Verification and limits

Five compiler/editor regressions failed before fixes; all pass afterward. Nine dedicated scaling tests cover reduced/enlarged beam thickness, rectangular/portrait/large/mirrored tokens, copied meshes, circular area sizes, outbound/return projectiles, metadata fallbacks and grid-unit artwork tracks. Existing beam padding, chained routing, reverse travel, orb composition and template lifecycle tests remain passing.

Browser/canvas visual checks handled by parent task. This does not claim every JB2A file's transparent margins were individually measured; metadata alone cannot identify opaque artwork bounds. Editor overlays and token masking remain approximate; real canvas Sequencer rendering is authoritative.

Integrated browser fixture renders a 2×1 caster at 110×55px and a 1×1 target at 55×55px; a beam at scale 0.4 keeps its padding-aware connecting width and applies `scale(1, 0.4)` to artwork. Native workspace loads updated metadata. Live canvas playback of these fixes was not checked: current active scene had no available token selection. No scene or world state was changed. Reusable read-only fixture: `preview/quality-audit.html`.

## Transparent padding and preview recovery follow-up (2026-10-07)

The earlier audit checked frame proportions and occupied token footprints. It did not measure visible alpha. That left a substantial defect: `GenericSlash01_01_Regular_BluePurple_800x600.webm` uses only about 206×200 pixels of its 800×600 frame. Fitting the full frame to a 55px token produced a roughly 14px slash. The shared editor/canvas sizing now enlarges the padded frame by 3.88 so the visible slash occupies the requested footprint. Frame center, native proportions, choreography scale and anchors are retained. Beam stretching, screen overlays and copied token meshes retain their separate geometry.

`tools/audit-media-footprints.mjs` measures all selected local footage across spell, feat and weapon catalog recipes, including loops and random variants. It decodes alpha with the matching libvpx decoder, samples at 6fps and 128px width, and unions visible bounds above alpha 64 (or half peak alpha for intentionally translucent footage, with a minimum of 8). The generated `data/media-footprints.mjs` contains 704 distinct movie profiles for 911 edition-specific selected paths. There are no missing measurements. This is sampled visible coverage, not a claim to measure every frame or every asset in the JB2A library. Media outside these profiles keeps its original frame sizing.

Availability is checked separately from reference measurements. The completeness audit now includes looping media and records exact installed paths: all 894 selected Patreon variant paths exist. JB2A Free is not installed in this environment; 480 Free paths have reference measurements, not proven installed availability. Reference copies and official cached media must never count as successful original preview URLs.

The intermittent badge was reproduced with a real failed video followed by a healthy reload: “Asset unavailable” remained over the healthy frame. Workspace now clears the badge on loaded data, ignores obsolete/aborted resource events, and retries failed loads when Replay starts. Permission-blocked `play()` calls no longer masquerade as unavailable assets. Real network/codec failures still display the badge and a tooltip with the failed path.

Verification: the three original regressions failed before the fixes; the complete 301-test suite passes after them. Browser verified healthy reload removes the badge, actual Twin Takedown layers use a 213×160px padded frame around a 55px token, and a paused same-frame comparison visibly shows the corrected slash. Runtime compiler regressions cover local cast/impact/aura/projectile stages, large rectangular footprints, beam stretching and template lifetimes. This follow-up did not verify live Foundry canvas playback because an authenticated canvas was unavailable. Reproduction/proof fixtures remain marked diagnostic under `.cache/`.
