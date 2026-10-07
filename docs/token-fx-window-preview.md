# Token Magic recipe-window preview verification

- Reproduced the reported provider card through `Workspace.optionalFxPreviewHTML` before the fix; regression failed against the old markup.
- Native shader fixture uses the installed Super-Frost preset (`xfire`, color 11322821), the installed fire preset, native filter classes/GLSL and Foundry's PIXI. It runs the production Workspace and TokenFxPreview; Foundry document globals are minimal QA shims. This is rendered shader verification, not a live-world integration run.
- During overlapping stages, target frost and caster fire both produced colored output. Captured target: 704 colored pixels and native clock -4.282; caster: 2,364 colored pixels and clock -0.3384. No shader error or provider card.
- Stop restored both token images and removed every preview canvas. Replay produced shader output again, completed at 12.6 seconds and left zero shader canvases or hidden token-art wrappers.
- Regression suite: 692 tests passed, zero failed. Main entrypoint syntax check passed. Lifecycle tests cover preset isolation, tint, subject/timing, cancellation, image geometry, owned texture cleanup and bounded unsupported-filter failure.

Screenshot: `token-fx-window-preview.png`. Test output: `token-fx-window-tests.log`. Native fixture: `/modules/animater/preview/token-fx-native-qa.html` on the development preview server.
