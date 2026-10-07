# PF2e broader spell composition review

Reviewed 2026-10-07. Scope: remaining shared mental/utility, transformation, portal, restoration and summoning families. This is a source-semantic review and leaf implementation, not a claim that every movie has been watched on Foundry canvas.

145 complete native descriptions individually read, including target/range, options, save branches, heightened text and delayed effects. Added 129 explicit treatments in `scripts/spell-broad-variety-designs.mjs`; the other 16 descriptions have concrete recommendations below. New treatments do not overlap the existing DEEP or UTILITY authored maps. The accompanying JSON records each implemented spell's native ID, path, full-description hash, chosen motif and rationale. Integration corrections preserve Safe Passage's 10-foot width and radial protection tiles, target-dependent transpositions, and Spirit Link's casting-only setup and item-use trigger.

| Family | Full descriptions read | New treatments |
| --- | ---: | ---: |
| Mental and social spells | 44 | 44 |
| Transformations and morphs | 15 | 15 |
| Teleport, planar and passage spells | 15 | 15 |
| Restoration, healing and life support | 20 | 20 |
| Summons and incarnates | 14 | 14 |
| Remaining generic utility cluster | 37 | 21 |
| Total | 145 | 129 |

Primary source: native Foundry PF2e `pf2e-8.5.1`, commit `563fd52708673ddd4f66c76921efbf6a938fffed`, read via `tools/pf2e-source.mjs`. [Pinned PF2e native spell packs](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells). Installed JB2A inventories were inspected separately: 6,870 Patreon keys and 1,351 Free keys in `.cache/pf2e-variety-db.json`. No Eskie implementation code was copied.

## What changed materially

Changes separate the actual illustrated mechanism, participant roles, material, body location and layer structure. They do not rely on different labels, random timing or sound pitch to disguise shared visuals. Native points, area footprints and true directional attacks need their existing geometry gates preserved when integrating this leaf.

| Native distinction | Implemented treatment |
| --- | --- |
| Devour Life consumes a living victim and heals caster according to damage dealt. | Victim-local void contour, **target-origin inward flow**, caster gathering field. No heal on the victim. [Native source](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-8/devour-life.json). |
| Spirit Link transfers caster HP to recipient and takes its pain; it is neither vitality nor void. | Neutral source-to-recipient support strand and paired signs; future turn repeats are not pre-played. [Native source](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-1/spirit-link.json). |
| Clear Mind, Sound Body and Sure Footing counteract different impairments. | Head-level outward clearing and eyes; fitted body sweep; paired lower-limb release signs. All differ from wound restoration. |
| Cleanse Affliction and legacy Restoration can lessen a burden without curing it. | Gentle receding contamination/protective mark vs outward burden contour. No guaranteed cure or restored HP. |
| Stabilize leaves a creature unconscious at 0 HP. | Small low steady life spark; no standing motion, strong wound film or resurrection duplicate. [Native source](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/cantrip/stabilize.json). |
| Familiar's Resurrection, Breath of Life and Revival have different return semantics. | Master-bond reconnection and small life spark; strong emergency flare; large life flare with ephemeral duplicate. Actual living/dead outcomes remain native rules. |
| Fated Healing, Life Connection, Life Pact and Vital Beacon heal or transfer only later. | Paired peaceful preparation, inward hidden failsafe, matching pact marks, and body beacon with four diminishing potential glints. No premature target healing. |
| Mental Map reads target information; Mindlink transmits information; Empathic Link shares emotion. | Incoming map strand and caster insight; one outward thought transfer; matching heart signs with bidirectional quiet strands. |
| Excise Lexicon, Invent Code, Information Overload and Share Lore have different relationships to words/knowledge. | Erasing/dispersing fragments; ordered private code signs; many cascading irrelevant fragments; organized knowledge flow into recipients. |
| Laughing Fit, Roaring Applause, Uplifting Overture and Wilding Word involve different voices or performances. | Restrained upper-body laughter; paired hand glints/sound rings; caster notation plus prepared ally glint; caster growl rings plus recipient warning eyes. No automatic fall, future Aid success or immediate sickness. |
| Memory visions differ from damage, dreams and true control. | Past-life silhouette, neutral chosen-memory layers, repeated Déjà Vu echo, latent sealed knowledge, local spectral impressions and private authority suggestion each use distinct compositions. |
| King's Castle and Unexpected Transposition concern two known participants. | Both receive exchange/phase cues; caster is not the only endpoint. Unexpected Transposition's triggering attacker is not automatically the swap partner. |
| Fire's Pathway, Nature's Pathway, Ethereal Jaunt and Umbral Journey use different passage material/time. | Existing-fire entrance, living-growth entrance, gray ethereal phase and long-travel hazy shadow silhouettes. Remote destinations are not guessed from enemy targets. |
| Tesseract Tunnel creates a second portal after movement. | Casting entrance and stretching space potential; no invented exit at a targeted enemy or teleport replacing the required Stride. |
| Proximal Shift moves surrounding matter and creates departure/arrival debris. | Local departure debris and tearing matter cue; arrival damage waits for independently known destination. |
| Aberrant, celestial, cosmic, daemon, demon, devil, plant and fluid forms are not one generic blue transformation. | Tentacular distortion; feather/light reveal; gathering star outline; death smoke; rift material; ordered infernal bindings; rising plant/branch contour; amorphous blurred outline. Chosen specific forms are not guessed. |
| Mantles explicitly describe light, liquid metal and blooming branches. | Sweeping heavenly light; silver fluid rising over skin/armor; closing branches followed by an opening wild bloom. Optional powers remain unresolved. |
| Tentacular Innervation and Warding Aggression immediately perform an unarmed/weapon melee attempt. | Caster limb/ward preparation, paced lunge and explicit **target** contact attempt. These are actor Strikes, not automatically spell-attack-roll events. Save-dependent grab and ward strength remain outcomes. |
| Summons have different planar/material associations, but selected species and arrival point are missing. | Distinct chaotic/diverging, lawful/converging, celestial/light, draconic/winglike, neutral elemental, aberrant/tentacular, fiend/smoke, giant/heavy, temporal/divination and natural-spirit **casting** frames. No fake creature attack or spawn is asserted. |
| Incarnates have incompatible chosen arrival and delayed departure effects. | Fleshforged choice potential, irii time potential, immense Jandelay force-gate potential, foreboding stampede tremors and biome-neutral warden invocation. Their later departure attacks are not played during casting. |
| Generic utility objects are not target attack bursts. | Tiny ghost-carrier wait, quill/ink transcription, hand-level combat record, six collated insights, two sleeve pockets, chalk entrance, neutral weapon-rune inscription and force-scarf contour. |
| Safe Passage defines a 60ft-long, 10ft-wide protective terrain section despite structured `system.area` being null. | Explicit line/rectangular preview metadata and tiled protective signs replace a tiny caster cue; width comes from native prose. This is protection, not damaging passage or removal of difficult terrain. [Native source](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-3/safe-passage.json). |

## Explicit limits

127 of 129 new treatments use symbolic artwork for at least part of their mechanism. The warm skin glow of Capital Dividend closely follows an explicit visible native description; Safe Passage uses its native geometric footprint with conventional protective signs. This count describes material fidelity, not missing assets: all declared roots have installed matches in both editions. A feather can illustrate wings or a quill, but is not exact dragon or pen artwork; a liquid impression is not exact conjured food. A translucent caster copy illustrates transformation potential, not the chosen creature's portrait.

40 treatments are explicitly casting-only because they prepare later triggers, remote destinations, selected summons or scene objects. They are individually reviewed invocations; they are not complete resolved reproductions of those later actions. This is preferable to a visually confident but false result. Remaining context needed for a complete animation includes:

- Chosen form/element/optional powers and exact creature asset or token.
- A destination point, route, heading, surface or summon arrival space distinct from enemy targets.
- Correct participant roles: companion, familiar, swap partner, blamed creature, two opposing targets or actual victim.
- Actual attack/save/counteract outcomes and the system's actor-Strike event provenance.
- Separate trigger events for stored energy release, delayed message, healing ticks, reaction activation and incarnate departure.

Real token documents are never changed by these leaf illustrations. Cosmetic motions restore the original presentation; movement routes or critical-result falls are not invented. No new perpetual sound or persistent-state audio is added. Private thought/message and unresolved casting cues should retain the sound audit's quiet defaults.

## Remaining 16 individually reviewed recommendations

These stay outside this leaf because their decisive event context, scene geometry or bespoke artwork needs shared integration. Do not mark them individually authored by this file.

| Spell | Concrete next treatment and required context |
| --- | --- |
| Adaptive Ablation | Incoming damage-type context chooses acid/cold/electric/fire/sonic absorption into a protective body field. Resistance starts after the triggering damage; no false early immunity. |
| Battlefield Persistence | A restrained steadfast caster ward before a save. No victory flash or recovered HP before the roll. |
| Conglomerate of Limbs | Limb-construction invocation with explicit Huge thrall role/arrival space. Exact severed-limb thrall artwork is absent; later two separate melee attacks belong to commanded thrall actions. |
| Elemental Absorption | A chosen-element inward storage field at casting; separate two-action release event later aims stored damage at an enemy. Never discharge during initial cast. |
| Enduring Might | Defensive caster contour timed to a triggering attack/effect rather than a new outward strike. Use actor/source provenance to avoid animating the attacker incorrectly. |
| Euphoric Renewal | Quiet prepared life contingency. The return-of-consciousness event can later show renewal; do not Stand or restore consciousness during casting. |
| Extend Spell | A prepared time/duration sign for the next eligible single-target spell. No time-freeze illusion or extension of an unrelated current animation. |
| Impeccable Flow | Symmetric cosmic-order marks at cast; only a later critical failure reverses them into broken order. |
| Interdisciplinary Incantation | Formula remnants return from the actual triggering arcane caster to the imitator. That caster is an event role, not an arbitrary enemy target; the copied spell is not cast immediately. |
| Iron Gut | Elastic/toughened mouth-to-stomach contour with low-body storage readiness. This is physical storage, not an extradimensional portal or immediate vomiting. |
| It is Written | One contemplative future-self/foreknowledge impression; chosen roll and fulfillment of the destiny happen later. |
| Lucky Number | Read the actual d10 result to display one corresponding prepared number sign. No invented result; Lucky Break belongs to its later reaction. |
| Path of Least Resistance | Three actual candidate destinations and GM-selected safe route enable route previews/time resets followed by two Strides. Never pick an enemy as destination or blindly animate three harmful routes. |
| Perfected Body | A self-body correction contour after the eligible failed save is improved. No healing or toxin removal beyond the actual degree-of-success change. |
| Pulse of Civilization | A divinatory settlement-information impression at caster; names and locations come from GM information, not automatically drawn fake nearby city markers. |
| Travel by Turtle | Require chosen water arrival space and Large/Huge/Gargantuan turtle token/art, then noncombat boat-like travel. A water splash on an enemy is wrong. |

## Classifier cues safe to generalize

Classification should read the complete description sections and distinguish cast, choice, success branch, later trigger and departure. Useful cues are mechanisms, not name fragments:

- A directional transfer with an explicit donor and recipient should assign endpoint roles before choosing material. The same healing or mind trait does not establish transfer direction.
- An instruction to choose a form/element/power means unselected variants remain potential, unless casting/event context records the choice. Options can grant incompatible damage types, shape and movement.
- Prepared benefits activated on a future turn, reaction, Interact or later spell should animate preparation only at casting. Do not use later damaging/healing prose as initial target impacts.
- Counteract or reduced condition/affliction stage describes clearing or lessening; it does not establish restored HP, total cure or successful condition removal.
- An immediate melee weapon/unarmed Strike should preserve contact-attempt choreography and actor-Strike event semantics. It should not be automatically treated as a spell attack because the document is a spell.
- A described existing entrance, planar key, surface, destination or route requires that role/context; it should not silently reuse selected hostile targets.
- Incarnate `Arrive` and `Depart` are separate phases. Their footprints and choice-sensitive effects should remain separate contexts; later departure is not a longer casting clip.
- Private/subtle/mental/message outcomes need the sound audit's quiet policy. Mentioned future song or delayed voice is not an audible cast cue by itself.

These rules are high-confidence gates. They do not replace individual review of metaphor, negation, optional branches or old/remaster differences.

## Verification and reproducibility

`rtk proxy node .cache/verify-pf2e-broad-variety.mjs` passed all 129 leaf cases and 536 Patreon/Free slot-root checks. Each native slug exists; each motif exports; no overlap with existing authored leaves; all graphs return finite valid stage lists with unique IDs; maximum eight stages. All new token motions are at least 1.8 seconds. Focused assertions cover reverse Devour Life, outward Spirit Link, no Stand in Stabilize, paired King's Castle and explicit melee target contacts.

This verifier uses helper stubs and installed database keys. It proves structural/source/inventory consistency, not media decoding, rendered clipping, target selection correctness on a live multiplayer world, perceived size or final VFX identity diversity after catalog generation. Parent integration owns those broader checks and final rebuild.

- Authored leaf: `scripts/spell-broad-variety-designs.mjs`
- Per-spell source audit: `docs/pf2e-broad-variety-review.json`
- Full source-read cache used during this review: `.cache/pf2e-broad-variety-native.json` (279 cached sources; caching is not the same as individually reading all 279).
- Corrected effects-only strict baseline supplied by parent: `.cache/pf2e-strict-before.json`; original generic family grouping was used only to prioritize review, not to claim current duplicate counts.
