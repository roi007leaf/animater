# Research and product direction

Date: 2026-10-06. Target: Foundry 14, Pathfinder 2e, D&D 5e, Sequencer, JB2A Free and Patreon.

## Sources and evidence

The user supplied [Eskie's Shorts](https://www.youtube.com/@eskieTTRPG/shorts). The channel page was inspected in Chrome. Its catalog includes class-themed collections, fire/ice/lightning spells, rage, wings, traps, kineticist effects, and utility effects. Representative fire and lightning clips were opened and their rendered frames inspected. This is a sample, not a frame-by-frame review of all 67 videos.

- [Fire Spell Effects](https://www.youtube.com/shorts/KOVcF4nFkhQ): visible Burning Hands frame uses a directional flame extending from its caster. The caster token remains the visual anchor.
- [Lightning Spell Effects](https://www.youtube.com/shorts/De3ubSAxyD0): visible Shocking Grasp frame emphasizes source and target identity and the space between them.
- [Eskie Macro Pack](https://github.com/aljames-arctic/eskie-macro-pack): community-maintained collection documents customizable effects, overlays, showcases, and traps. It distinguishes Sequencer/socketlib requirements from optional asset packs and integrations. Some Eskie-style effects use assets beyond JB2A; a JB2A-only module should not promise identical artwork.
- [Trigger Animations reference](https://wiki.mrvauxs.net/reference/trigger-animations/): authoritative explanation of node-based Sequencer workflows, Trigger Engine, matching/priority, and supplied PF2e events.
- [Current Automated Animations repository](https://github.com/theripper93/autoanimations): current maintainer, asset separation, and supported automation scope. The old Otigon repository is archived; it should not be used as the sole compatibility reference.
- [Sequencer linked-effects tutorial](https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/master/docs/tutorials/basic-linked.md): database paths preserve JB2A's alignment information for stretched source/target effects.
- [Official Free database](https://github.com/Jules-Bens-Aa/JB2A_DnD5e/blob/main/scripts/jb2a_sequencer.js): actual available keys, variants, and paths.

Installed source reviewed: Trigger Animations 0.9.9, Automated Animations 7.1.5, Sequencer 4.2.3, JB2A Patreon 0.8.1, PF2e 8.5.1, and D&D 5e 6.0.5. Current installed Trigger Animations and Automated Animations manifests target Foundry 14. Native chat/activity/region hooks and Sequencer database/playback methods were checked in these local sources.

## Comparison

Strengths below are grounded in the documented or installed feature surfaces. UX drawbacks are design assessments, not measured usability results.

| Area               | Trigger Animations                                                                                                                          | Automated Animations                                                                                        | Animater direction                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Main strength      | Visual node programming exposes broad Sequencer capabilities                                                                                | Presets and automatic recognition reduce routine animation setup                                            | Starter recipes plus a small stage editor                                            |
| Expressiveness     | Branching/data flow, computed names, predicates, layering, custom events through Trigger Engine                                             | Melee/range/template/on-token categories, extras, sounds, presets and item customization                    | A focused cast → travel → impact model; advanced functionality added deliberately    |
| Learning cost      | Users must understand nodes, connections, sequence execution, and trigger routing                                                           | Users must understand recognition, global vs item settings, categories, and system-specific trigger choices | One workspace: choose, preview, bind, save                                           |
| Strength for PF2e  | Rich event naming includes item slug, weapon group, and base item                                                                           | Installed native PF2e adapter handles chat and region origins                                               | Use native system data, exact names/slugs, and UUID bindings                         |
| Strength for 5e    | Custom events can be built through its event framework                                                                                      | Installed adapter handles modern native activity hooks                                                      | Separate native 5e adapter; one shared recipe format                                 |
| Matching           | Documented priority and name specificity; wildcard handling                                                                                 | Global automatic recognition plus item overrides                                                            | UUID wins over exact-name recipes; stable deterministic tie-break                    |
| Configuration risk | Documentation describes a shared trigger registration menu accessible to users; permissions should be checked against the installed release | Multiple global/item layers can obscure the source of a configuration decision                              | GM-only configuration; local diagnostics show the selected recipe or blocking reason |
| Dependency cost    | Trigger Engine + Sequencer, plus chosen assets                                                                                              | Sequencer + socketlib, plus chosen assets                                                                   | Sequencer + one JB2A pack; no new sync layer                                         |
| Main UX drawback   | High flexibility can make a simple task feel like programming                                                                               | Large setting surface can fragment a simple edit across categories and overrides                            | Progressive disclosure and a single inspector                                        |
| What to learn      | Expressiveness, event/data separation, deterministic routing                                                                                | Fast presets, visual asset selection, recognized item behavior                                              | Preserve the useful concepts without copying either UI                               |

Animater's narrow stage editor currently offers substantially less power and fewer finished animations than either mature module. Its value proposition is clarity of configuration; that still needs user testing in real sessions. Version 0.2 adds a small scene-scoped socket transport for cosmetic token motion alongside Sequencer's VFX transport; the original dependency comparison above describes the 0.1 effects-only implementation.

## Token choreography follow-up, 2026-10-06

Checked [Eskie rage motion](https://github.com/aljames-arctic/eskie-macro-pack/blob/main/src/animation/effects/active-effect/rage/rage-super-saiyan.js), [Misty Step](https://github.com/aljames-arctic/eskie-macro-pack/blob/main/src/standalone-macros/misty-step.js), and [Sequencer effect APIs](https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/master/docs/api/effect.md). They illustrate the difference between playing a video at a token and choreographing token artwork with layered effects, oscillation, rise, rotation, and appearance changes. These concepts informed new lunge, recoil, shake, spin, rise, and pulse stages; macro implementations were not copied.

Installed Sequencer's animation section sends token updates through its document socket handler. Animater instead animates the rendered token mesh locally and replicates only cosmetic stage settings. This keeps private previews local and preserves the mechanical position, rotation, and hidden state. JB2A effects continue to use Sequencer. Teleports, camera work, and full Eskie sequences remain outside this implementation.

The reported clipped cards reproduced deterministically with installed Foundry 14 CSS: 36px button height, inherited Modesto headings, horizontal flex timeline controls, and checkbox icon pseudo-elements. The standalone preview had missed these collisions. A new real-CSS harness checks those four symptoms; container queries now adapt to Foundry window size instead of relying solely on viewport size.

Validation: live PF2e workspace with 232px recipe cards, corrected typography/timeline/checkboxes, 7,018 catalog entries, and looping JB2A video previews. A private Casting flourish preview visibly lifted existing token artwork above its unchanged token square, restored its pose, and completed paired Sequencer/motion playback. This caught a browser-only animation-frame binding issue and late JB2A registration timing; both have regressions. 28 Node tests cover pose restoration, overlap, movement cancellation, hidden token suppression, private preview routing, socket scene/permission checks, and mixed scheduling. Live D&D 5e gameplay and multiplayer replication remain unverified. Updating from 0.1 requires a Foundry server restart to register the module socket before table motion is enabled.

## What to borrow from Eskie's examples

Native configuration expansion now covers common effect settings, sound, token-copy layers, property tracks and screen overlays. See [native configuration coverage](eskie-configurations.md) for current controls, exact scope and validation. This remains independent from Eskie Macro Pack; specialized macro workflows are not automatically reproduced.

1. **Keep the caster identifiable.** A brief cast cue ties the spectacle to a token.
2. **Make direction readable.** Travel uses Sequencer database alignment rather than a raw stretched WebM path.
3. **Give the action an ending.** Impact or an attached aura closes the sequence.
4. **Use coherent themes.** Category and accent help browsing; actual asset color stays explicit, especially when Free fallbacks differ.
5. **Keep elaborate effects optional.** Sound, token movement, scene overlays, and camera effects should be separate opt-ins with clear boundaries.

The initial recipes are original compositions of installed JB2A database entries. No Eskie macros or premium media were copied.

## UX decisions implemented in 0.1

- A persistent navigation rail with Recipes, Assets, Activity, and Setup.
- Recipe cards communicate category, stage count, trigger, and missing-asset state before opening the editor.
- The editor previews one actual asset at a time and exposes placement/timing/scale first.
- Opacity, layering, persistence, fallbacks, and reordering sit under advanced controls.
- The asset browser separates inspecting an effect from applying it to a draft.
- Unsaved drafts survive switching recipes in the same open workspace. Revert restores saved data.
- Item drop binds the actual UUID instead of guessing from a localized name.
- Local preview and table playback are separate, clearly labeled actions.
- Automatic playback begins off, with active competing engines named in Setup.
- Import reviews additions and replacements before saving.
- Stop is user-scoped and cancels remaining scheduled stages.

## Next development priorities

1. Verify activation, rendering, canvas playback, multi-client replication, and role changes in a live PF2e world and a live 5e world. Add captured integration regressions for any actual failures.
2. Add action/workflow identities to reliably join use, roll, outcome, area, and effect lifecycle events. This enables robust private-roll handling and avoids duplicate animation across phases.
3. Add mechanical effect expiration and disable/delete cleanup for persistent auras.
4. Support cone, line, and polygon geometry with accurate alignment for both systems' regions.
5. Expand cinematic presets using native sound, token copies and property tracks. Camera and mechanical token workflows remain separate future work.
6. Expand curated recipe packs by spell theme and weapon type; verify every recipe with the Free library as well as Patreon.
7. Add localization, reduced-effects preferences, favorites, paged large libraries, and migration from recognized configurations only where formats can be mapped honestly.

Suggested usability acceptance criteria: a new GM can configure one effect without a macro, identify a missing asset without reading logs, and know whether a preview is private. These are targets, not measured outcomes.
