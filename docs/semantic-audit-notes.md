# PF2e animation semantics audit

Audit source: all **1,994** spell documents in the pinned PF2e 8.5.1 inventory, including legacy spells, focus spells, cantrips, and rituals. **1,991** contain descriptions; three do not. Source revision: [`563fd52708673ddd4f66c76921efbf6a938fffed`](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells).

This inventory-wide pass programmatically inspects every complete description, native target, area, range, trait, and current animation classification. Individually reviewed exceptions are recorded in `AUTHORED_SPELL_DESIGNS` and the delivery overrides in `tools/spell-semantics.mjs`. The generated design audit reports their count. **This is not a claim that every spell received an individual artistic review.**

## Confirmed defects and corrections

| Spell or group                                                                          | Previous defect                                                                               | Corrected interpretation                                                                                                           |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Ray of Corruption                                                                       | Poison cloud at target; no connecting ray. Native source omits attack trait.                  | Toxic ray from caster to target; explicit base spell attack respected.                                                             |
| Briny Bolt                                                                              | Generic energy ray.                                                                           | Hurled saltwater projectile and splash.                                                                                            |
| Winter Bolt                                                                             | Continuous icy ray.                                                                           | Physical icicle projectile. Delayed next-turn detonation remains a mechanical event, not falsely timed inside the casting preview. |
| Moonbeam / Moonlight Ray                                                                | Fire or generic beam art selected from damage/theme fallback.                                 | Silvery moonlight beam.                                                                                                            |
| Chromatic Ray                                                                           | Generic energy ray.                                                                           | Prismatic beam. Color-result mechanics remain GM/PF2e controlled.                                                                  |
| Divine Lance / Holy Light                                                               | Projectile or unrelated theme fallback could replace beam art.                                | Dedicated radiant ray treatment with beam geometry.                                                                                |
| Force Bolt                                                                              | Stationary target effects.                                                                    | One automatic-hit force projectile; no invented spell attack.                                                                      |
| Heartbolt                                                                               | Caster aura because metadata records the secondary emanation.                                 | Vitality projectile to primary target, then target-centered bloom.                                                                 |
| Blazing Blade                                                                           | Ray fired from caster.                                                                        | Scimitar-shaped blade, contact attack.                                                                                             |
| Shocking Grasp, Withering Grasp, Imaginary Weapon, and other direct melee/touch attacks | Attack trait automatically implied ranged projectile.                                         | Native touch range or direct melee attack wording selects contact geometry.                                                        |
| Shambling Horror                                                                        | Ranged attack and divination eye, inferred from minion's later attacks/senses.                | Reanimation at corpse; casting trigger, not invented direct attack.                                                                |
| Hand of the Apprentice                                                                  | Gravity lift, inferred from levitating the weapon.                                            | Thrown weapon and return treatment.                                                                                                |
| Propelling Air Stream                                                                   | Flight buff hid the initial blast.                                                            | Projectile delivery preserved; later flight does not erase primary action.                                                         |
| Vindicator's Mark                                                                       | Detection eye replaced magical dart.                                                          | Projectile delivery preserved; marking/detection is secondary.                                                                     |
| Final Sacrifice, Necrotic Bomb, Detonate Magic, Deathly Scream                          | Emanation displayed at caster despite prose naming a remote minion/item anchor.               | Effect centered on chosen target; surrounding area extent remains cosmetic.                                                        |
| Rebuke Death                                                                            | Caster-centered healing aura.                                                                 | Selected creatures receive healing effects.                                                                                        |
| Nine Incarnate spells                                                                   | Generic caster buffs, or flight buffs inferred from summoned creatures.                       | Symbolic conjuration/arrival cue. The animation does not create or control summoned actors.                                        |
| Legacy descriptions with stat paragraphs                                                | First paragraph was Trigger, Requirements, Area, or another field; imagery was never reached. | First substantive description paragraph supplies visual cues.                                                                      |

Four regressions failed before the semantic repairs. Expanded deterministic tests cover delivery, direct attack evidence, incidental ray examples, stat headers, contact geometry, secondary flight/detection, and remote conjuration anchors.

## Exhaustive ray/beam opening check

The first substantive description paragraph contains ray/beam terms in **22** entries. Each was inspected against its source meaning. Fifteen are direct targeted rays, three are native lines, one is a cone, and three are excluded meanings.

| Entry                  | Source meaning / required geometry                                                  |
| ---------------------- | ----------------------------------------------------------------------------------- |
| Admonishing Ray        | Targeted energy ray; bludgeoning damage does not imply a thrown boulder.            |
| Blazing Bolt           | One heat ray toward each chosen creature.                                           |
| Call of the Grave      | Targeted sickening energy ray.                                                      |
| Chilling Darkness      | Targeted dark, freezing ray.                                                        |
| Chromatic Ray          | Targeted colored-light ray.                                                         |
| Disintegrate           | Tracer followed by destructive beam.                                                |
| Divine Lance           | Targeted divine beam.                                                               |
| Fire Ray               | Targeted fiery band/ray and local burning ground.                                   |
| Holy Light             | Targeted holy light ray.                                                            |
| Moonbeam               | Targeted silvery moonlight ray.                                                     |
| Moonlight Ray          | Targeted freezing moonlight ray.                                                    |
| Polar Ray              | Targeted blue-white freezing ray.                                                   |
| Ray of Corruption      | Targeted toxic spore beam.                                                          |
| Ray of Frost           | Targeted icy ray.                                                                   |
| Sun Blade              | Sunlight ray fired from weapon; name alone must not imply melee.                    |
| Enervation             | Native line of void energy; exact line length/placement needs directional geometry. |
| Inner Radiance Torrent | Native radiant line; action/round variants are separate casting choices.            |
| Radiant Beam           | Native radiant line.                                                                |
| Prismatic Spray        | Cone of multiple colored beams.                                                     |
| Antimagic Field        | Ray is an example of outside magic, not this spell's visual delivery.               |
| Steel Fortifications   | Structural metal beams, not rays of magical energy.                                 |
| Blazing Blade          | Blade-shaped light, not a ranged beam.                                              |

Separating `ray/beam` cues from `bolt/jet` cues prevents physical bolts, water projectiles, and icicles from silently becoming continuous rays. Incidental references cannot change native area delivery or invent an attack trigger.

## Compound delivery review and remaining limits

The native inventory contains **34 non-ritual entries with both targets and areas**. These were screened as candidates, not blindly recentered. Bane/Bless correctly describe creatures inside a caster aura; Heartbolt and the reviewed minion/item explosions describe remote anchors. Native metadata alone cannot distinguish them.

Some compounds still require a chosen origin, separate casting mode, or later mechanical event:

- Bone Spear, Bony Barrage, Deathly Scream, Necrotic Bomb, and Zombie Horde use a thrall as origin. The selected thrall must be the visual anchor where supported; selection does not validate or consume the thrall.
- Pulverizing Wake combines a melee Strike with a cone aimed from the struck creature. A single caster-centered template cannot represent both correctly.
- Diadem of Divine Radiance, Spirit Object, Tangling Creepers, and Bottle the Storm contain subsequent or optional attacks. These must not globally convert initial spell casting into an attack animation. Individual later-action recipes remain necessary.
- Remote summons, walls, cylinders, squares, cubes, and utility objects do not all fit circle-template geometry. Unsupported geometry stays explicitly symbolic; no summoned actors, walls, items, movement, or rules effects are created by animation.
- Heightening, action choices, random color results, conditional damage, corpse/object targets, and Sustain variants are not resolved by the visual catalog. Recipes represent the documented base treatment and expose customization.
- Source descriptions are empty for Mindscape Shift, Open the Wall of Ghosts, and Transmigrate. Native fields only are available; their entries retain manual-review notes.

Semantic correctness and installed media availability are separate checks. The catalog's generated asset audit verifies available Free and Patreon keys and geometry compatibility; rendered preview and native Sequencer playback require their own validation.
