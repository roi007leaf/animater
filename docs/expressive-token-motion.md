# Expressive token motion

Eight complete feat descriptions were read for this pass against pinned PF2e pf2e-8.5.1, commit 563fd52708673ddd4f66c76921efbf6a938fffed. These are explicit treatments, not a claim that every movement feat now uses a path.

| Full source description | Native motion | Choreography and limits |
| --- | --- | --- |
| [Sudden Charge](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats/class/shared-class-feats/level-1/sudden-charge.json) | rush | Double sprint into one melee Strike. Cosmetic approach stops beside the first target, holds for contact, then returns. |
| [Sudden Leap](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats/class/shared-class-feats/level-8/sudden-leap.json) | leap | Shows one midair Strike, followed by a controlled drop and upright landing. Optional Felling Strike remains a player choice. |
| [Flying Kick](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats/class/monk/level-4/flying-kick.json) | leap | Shows one unarmed Strike at the end of the jump, then landing. No extra attacks. |
| [Tumbling Strike](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats/archetype/acrobat/level-8/tumbling-strike.json) | roll | Illustrates a successful Acrobatics check: pass through the foe, then one Strike. Failure and critical failure branches remain manual. |
| [Skirmish Strike](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats/class/shared-class-feats/level-6/skirmish-strike.json) | dodge | Default illustrates Step then Strike. Customize linked timing for Strike then Step; no full charge. |
| [Cartwheel Dodge](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats/archetype/provocator/cartwheel-dodge.json) | roll | Successful-save reaction shown as a broad cartwheel. No attack or damage cue. |
| [Defensive Roll](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats/class/rogue/level-14/defensive-roll.json) | roll | Short evasive roll disperses a lethal physical blow. Does not depict a Strike or grant movement. |
| [Running Reload](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats/class/shared-class-feats/level-4/running-reload.json) | rush | Stride, Step or Sneak, followed by a reload cue. No projectile or gunshot. |

## Controls

Customize → select the motion stage. Choose Rush, Leap, Roll or Dodge. Target approaches stop beside the target's actual rectangular footprint; pass-through finishes on its far side. First, second and last targeted creature are available. Fixed-distance gestures work without a target; Dodge is a lateral fixed gesture.

Path & pacing exposes arrival time, destination hold, distance pacing and target gap. Leap adds arc height and height at Strike, allowing an airborne contact followed by landing. Roll and Dodge expose direction. A maximum path bounds artwork travel; it is not a PF2e Speed or reach calculation. Built-ins use 1.6–2.4-second base durations, up to 12 grid squares, with extra approach time per square where applicable. Full recipe preview respects actual preview dimensions; canvas uses real token positions and footprints. Selected-stage schematics compress fixed-distance gestures to fit their small stage.

Link the contact stage to the motion stage and choose **Destination reached**. This anchors to the arrival phase rather than waiting for the cosmetic return. Distance changes resolve both motion and contact together. Full native weapon footage is retained; measured contact offset is accounted for when available. Exact internal melee contact markers are unavailable for these selected films; their stage onset currently marks arrival. Internal weapon contact frames remain an artwork limitation.

Running Reload waits until the movement illustration and cosmetic return finish before its source-centered reload accent. It has no shot. Evasion cues stay at the departure point rather than pretending Sequencer's document attachment tracks a separately animated mesh. Tumbling Strike illustrates success only; failure/critical failure remain manual. Skirmish Strike defaults to Step then Strike; timing can be customized for the reverse order.

## Gameplay and restoration

Motion animates the existing rendered token mesh, never TokenDocument position, rotation, elevation or resources. Artwork returns afterward. A real source movement or rotation cancels the old pose without undoing the new document state. Moving, hiding or destroying a target cancels a target approach and restores its source mesh. Stop, replacement motion and workspace closure also restore poses. Hidden source tokens are skipped. Local preview stays private; table motion transports portable resolved stage settings on the existing scene-scoped channel.

Effects-only removes motion and detaches arrival references at sample timing. Existing saved recipes are preserved; use catalog defaults or customize anew to receive the updated movement treatments.

## Validation

267 automated tests pass, including multi-square arrival/hold/return, near/far-side finishes, diagonal rectangular clearance, leap contact/landing, lateral dodge, distance caps, target order, long projectile distance scaling, phase bounds, import round-trip, effects-only planning, matching editor/canvas poses, cancellation and portable linked socket stages. Complete media audit still checks 1,994 spells and 2,308 active feats across both editions: 564 native files, zero measured cutoffs or early fades. Browser checks cover charge arrival and highlighted contact, leap height/landing, and rendered path controls. Multiplayer and live Foundry canvas playback of these new paths remain unverified.
