# Native configuration coverage

Animater exposes its own saved controls, without installing or executing Eskie Macro Pack. Reviewed the [Eskie source](https://github.com/aljames-arctic/eskie-macro-pack/tree/main/src/animation), including [Chromatic Orb](https://github.com/aljames-arctic/eskie-macro-pack/blob/main/src/animation/effects/on-target/chromatic-orb.js), [Sun Halo Dragon](https://github.com/aljames-arctic/eskie-macro-pack/blob/main/src/animation/showcase/sun-halo-dragon.js), and [Cinema Bars](https://github.com/aljames-arctic/eskie-macro-pack/blob/main/src/animation/scene-overlays/cinema-bars.js). These illustrate configurable themes, layered property animation, optional sound/screen stages and viewport fitting. Their implementations and media were not copied.

| Configuration family  | Native Animater controls                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Effect choice / theme | Installed JB2A key browser, video previews, ordered Free/Patreon fallbacks, tint and hue                                               |
| Layer timing          | Stage start/duration, 1–6 plays, gaps and per-target staggering                                                                        |
| Media playback        | Speed, opening skip, optional absolute clip end; sound clipping with normal audio speed                                                |
| Placement             | Grid offsets, explicit artwork anchor override, degree rotation, mirrors, below-token layer and priority                               |
| Attachment            | Caster/target subject for auras and copies; follow token with optional bound rotation/opacity                                          |
| Entrance / exit       | Fade in/out, grow/shrink, rotate in/out, selected easing                                                                               |
| Appearance            | Tint, brightness, contrast, saturation, hue, blur, glow color/strength and token cropping                                              |
| Token artwork layers  | 1–6 copies, symmetric grid spacing, silhouette shadows, all effect transitions and tracks                                              |
| Property animation    | Horizontal/vertical offset, rotation, scale X/Y and absolute opacity; endpoints, delay, easing, loop, ping-pong or end-relative timing |
| Sound                 | Native audio picker or relative file path; volume, fades, clip window, repeats, private editor/canvas playback and scoped Stop         |
| Screen composition    | JB2A overlay stage, screen anchor, fit-to-screen option, offsets, appearance and transitions                                           |
| Token motion          | Six cosmetic poses with subject, distance/intensity and repeated timing; original token documents remain unchanged                     |
| Preview               | Composed media, copies, token poses, filters/transitions/tracks; active/completed step highlights, repeat gaps, replay and Stop        |

Settings survive save, import/export and reordering. Existing recipes gain neutral options. The duration of each play remains explicit; repeats start after that duration plus the configured gap. Persistent auras remain persistent only during real playback; preview is bounded. Stop cancels queued plays and ends user-scoped Sequencer effects/sounds.

Property position uses grid squares; rotation uses degrees; scale tracks use multipliers; opacity uses 0–1. End-relative track offset is 0 to finish at stage end, negative to finish earlier. End-relative mode applies to one-shot tracks; loops continue within the stage duration.

## Chromatic Orb authoring

**New recipe** opens a native six-element Chromatic Orb builder. Charging layers shrink via sprite width/height tracks, then a release flash and two moving orb layers play together. Flight adds actual grid distance to its base duration, pauses before moving and uses backward acceleration easing. Shell/core/impact share one jittered landing point per target. Impact links to the core's finish with a -100ms offset, including that target's distance and stagger. Full preview highlights active layers; private canvas preview runs before creation. All resulting layers remain editable and exportable. Final impact uses JB2A media instead of Eskie's custom damage artwork; Free fallback art can differ.

These primitives are available in other recipes through the **Moving orb / projectile** stage and **Linked timing & flight** controls. Stable stage IDs preserve references through reorder. The timeline marks linked starts with ↳ and displays sample timing; deleting a referenced layer converts dependents to an absolute sample time. Cycle/missing-reference validation prevents partially played compositions.

## Distinct workflows still outside this configuration layer

Common controls do not recreate every spell macro. Chromatic Orb's damage-type mapping is exposed by its builder; arbitrary spell branch logic remains outside this configuration layer. Procedural burn/shatter masks, fragment geometry, traps tied to scene documents, summon selection, camera control, actual teleport/movement, showcase dialogue/text, scene-background dimming and bespoke overlay artwork remain separate features. Token cropping is a Sequencer mask, not a burn/shatter implementation. Animater does not claim complete Eskie macro parity.

Screen overlays currently use installed JB2A artwork. No Eskie-only media is supplied. Audio paths are relative Foundry files; arbitrary scripts, external audio URLs and arbitrary property paths are not accepted by recipe imports.

Editor composition uses sample spacing and one target. CSS color/filter/cropping approximates Sequencer; Local preview is the exact canvas path, with real token geometry and all target staggering. Standalone preview cannot reproduce Foundry game triggers or multiplayer replication.

## Validation

53 automated checks pass. Configuration-focused checks cover neutral defaults, round-trips, bounds, allowed tracks/audio paths, native API compilation, clip windows, end-relative timing, copied/repeated/staggered planning, repeated media/audio, token-pose replacement and failed-media cancellation. Orb checks cover all six elements, shared jitter, distance-based arrival, target stagger inheritance, stage references and moving-layer previews. Browser checks verified builder creation, filter/track playback, three copies and synchronized stage highlights. Native PF2e private playback completed for the six-layer orb, fades/growth, brightness/glow, property animation, token shadows, sound selection/playback and fitted screen overlays. Live D&D 5e and multiplayer playback remain unverified.

API references: [Sequencer effects](https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/master/docs/api/effect.md), [Sequencer sounds](https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/master/docs/api/sound.md). Implemented calls were also checked against installed Sequencer 4.2.3 source.
