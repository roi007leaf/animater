# Optional choreography providers

Checked installed FXMaster 8.4.1 and Token Magic FX 0.8.4 source/API.

In a recipe, add a stage and choose **Token Magic FX** or **FXMaster scene effect**.

- Token Magic: choose an installed preset/library and caster or targets. Start, duration and linked timing use the same choreography timeline as JB2A. Transient filters render locally on each connected client; private canvas preview stays local. Cleanup removes only IDs generated for that cast. Requires Token Magic 0.8.4+ for transient API support.
- FXMaster: choose particles or filter, then an installed effect. Controls come from its registered parameter schema, including numeric bounds, tint, layering and effect-specific switches. Playback uses the public Effects API with unique IDs; cleanup stops only those rows. Whole-scene effects require GM playback. Private canvas preview skips this stage because the public API writes shared Scene state. FXMaster's window preview shows timed provider cues; native scene effects render on the Foundry canvas.

Both providers are optional. Missing/inactive providers skip their stages and log the reason; JB2A and sound stages continue.

Built-in PF2e, SF2e and D&D5e recipes add installed provider accents automatically. Native description predicates and existing delivery/footage determine eligibility: elemental contacts, restoration, protective fields, blur, invisibility, spectral bodies, teleport departure and rushing source tokens. Physical weapon hits do not become elemental body filters. Effects that only imply a statistical bonus do not automatically become burning or electric creatures. Provider stages follow their reference stage's timing and selected targets.

FXMaster is restricted to explicit scene-scale treatments: Earthquake screen shake, Control Weather clouds and Storm of Vengeance rain. These are temporary casting cues, not automatic weather-rule adjudication. Localized explosions and fog areas do not alter the entire scene.

**Setup → Catalog: Token Magic FX / FXMaster** controls built-in enhancements independently. Both default on and only add available installed presets/effects; saved custom choreography remains editable. World settings expose the same switches. Provider removal does not block base catalog previews or playback.

If Animater's synchronization channel is unavailable, catalog token accents are skipped while base visual playback continues. Explicit custom token-filter stages and token-motion stages still require their supported sync channel for table playback. Document-linked filters are derived locally by each viewer and do not need that channel.

Document-linked token filters stay until their native condition/effect expires, disappears, becomes hidden to the viewer or its catalog is disabled. Filters use local transient IDs, preserve existing Token Magic filters and reattach when native token artwork is recreated. Private previews still use the selected finite sample duration. Customize exposes preset, library and optional color override; native preset colors remain unchanged.

`tools/audit-catalog-fx.mjs --write` records coverage, exact presets and retained base choreography in `data/catalog-fx-audit.json`. Native description predicates are regenerated from pinned cached sources with `tools/build-catalog-fx-evidence.mjs`; they contain flags, not generated prose.

Stop, recipe failure and canvas teardown cancel active provider stages. Late provider completion immediately removes its own effects. Expired FXMaster rows left by interrupted clients are removed by a GM on canvas readiness or the next 30-second cleanup interval. Provider audio/background accumulation is disabled; use explicit Animater sound cues.

Assets → Token FX lists all installed Token Magic presets, including custom presets in its token and region libraries. Search names or native filter types, filter by category, and keep favorites/recent picks. Refresh after editing presets or changing module availability. Presets remain optional; unavailable providers do not appear as library assets.

Select a caster or target tokens, then use **Preview on canvas** to audition a preset privately. Preview has its own temporary filter IDs and session; finish, Stop, selection changes, navigation and closing Animater clean only that audition. The design preview displays preset metadata; native shader rendering requires Foundry.

**Add token filter stage** uses the chosen subject, duration and optional color override. **Use preset** replaces only a token-filter stage's preset/library; existing placement, timing and tint remain. Document-linked recipes keep added filters until their native condition/effect ends. Changes remain draft edits until Save.

Recipe-window playback renders installed Token Magic shaders directly on the preview token artwork, including custom presets. The same choreography clock controls subject, delay, duration and repeats. Overlapping filters stack on the local sprite; token motions carry the filtered sprite with them. This uses native filter constructors in dummy mode and a separate native animation clock, without registering world-token filters, writing flags or sending sockets. Stop, completion, navigation and close remove owned canvas layers, filters, textures and the renderer. Missing providers preserve the ordinary token artwork.

Presets with image-backed filters or native distortion helpers currently require the Foundry canvas. Window playback keeps the artwork and shows a short status beneath the preview for those presets; **Local preview** remains available. FXMaster scene effects continue to use their own timed provider cue. The standalone media-library design preview displays preset metadata.

Native shader QA: run `npm run preview -- 4181`, then open `/modules/animater/preview/token-fx-native-qa.html`. The fixture reads the locally installed Foundry PIXI and Token Magic shader sources at request time, including the imported Super-Frost preset; no vendor source is copied into the package. It exercises target frost and caster fire, overlapping timings, Stop and replay. DOM attributes expose per-token filter clocks and colored-pixel counts for rendered verification. It supplements lifecycle tests; it does not simulate a live Foundry world.

API evidence in installed modules:

- `tokenmagic/module/tokenmagic.js`: `getPresets`, `filterTypes`, `togglePreset(..., {action, transient: true})`.
- `tokenmagic/fx/filters/proto/FilterProto.js`, `fx/Anime.js`: dummy filter construction, native normalization and a standalone unregistered clock.
- `fxmaster/README.md`: Developer API, individual Effects API (`play`/`stop`), registered `CONFIG.fxmaster` effect types.
- `fxmaster/fxmaster.js.map`: `src/api.js`, `src/common/effect-parameter-normalization.js`, particle/filter parameter schemas.
