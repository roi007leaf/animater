# PF2e weapon catalog

Pinned official [PF2e 8.5.1 equipment pack](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/equipment), commit `563fd52708673ddd4f66c76921efbf6a938fffed`. Recursive inventory: 5,870 equipment documents, 1,018 weapon documents. **1,018 catalog entries / 1,127 supported usage animations:** 695 melee (including five unarmed-equipment bindings), 163 ranged, 269 thrown. Includes nested legacy equipment and alchemical bombs. Shears has no source description and uses conservative native weapon data.

## Usage and controls

Open **PF2e weapons**. Search names, traits, books and complete description text; filter by usage, weapon group, training or edition. Choose **Use animation** for one weapon or **Use weapon catalog** for all defaults. Catalog choices use no saved recipe slots and have independent automation settings. Exclusions, motion, sounds and volume remain configurable.

Mode buttons select the full preview or customization. The actual roll selects automatic playback: ordinary dagger melee, dagger thrown, javelin thrown only; Gun Sword ranged/melee; Dagger Pistol ranged/melee/thrown. Native `context.altUsage` wins over the base weapon's range, with native Strike/options fallbacks. Sending a weapon card and rolling damage do not replay an attack. Only the roll author's client dispatches; duplicate messages, private rolls and rerolls retain existing guards.

**Handwraps:** Handwraps of Mighty Blows, Dragon Handwraps, Restorative Handwraps, Amphisbaena Handwraps and Bloodknuckles are searchable entries. Their **Unarmed** mode previews a basic unarmed contact, with permanent rune finishes and optional contact audio. PF2e excludes the worn wraps themselves from Strike preparation; Animater routes a native unarmed roll to the first tagged, worn, invested pair on its actor, matching PF2e's selection. Removing investment or wearing a different pair changes the binding. An excluded active pair never falls through to another selected pair. Existing customization and disabled overrides still work. Critical healing and Twin Venom Strike poison remain conditional activations, rather than automatic benefits on every unarmed roll.

**Customize** creates/reopens an editable recipe for the selected mode. Its **PF2e weapon use** binding is visible in the editor. Other modes keep their defaults. **Use animation** restores catalog defaults without deleting saved edits. Local canvas previews use selected tokens; full editor previews highlight every visual, motion and audio stage.

## Description and artwork decisions

Every complete source description passes through semantic rules alongside native group, base weapon, damage, handedness, traits, alternate melee data and range. Stored hashes, full descriptions, per-mode rationale and selected keys make decisions inspectable. This is complete rule-based analysis with targeted exception checks, not a claim that all weapons were individually watched or manually reviewed.

Prefer weapon-specific JB2A families: rapier, shortsword, scimitar, falchion, handaxe/greataxe, staff/greatclub, glaive/halberd, hammer/maul, dagger, spear/javelin, chakram, shuriken, boomerang, sling, bow, crossbow and firearm. Local contact geometry stays at the foe; ranged/thrown footage flies from wielder to foe and keeps a linked contact finish. Free fallbacks preserve those geometry roles. Missing exact art is disclosed as an approximation. Acid spit uses poison-colored liquid footage; Free electrical spit uses a magical projectile substitute. Air guns and darts avoid black-powder artwork/audio where native descriptions establish another mechanism.

Wind-up and recovery use restrained cosmetic gestures, paced by handedness, agility and weapon weight. Artwork returns to its original pose; no game movement, ammunition, inventory, HP or resources change. A Strike addresses its first recorded target. Native damage, permanent runes and always-on damage rules belonging to that weapon supply elemental finishes. Multiple guaranteed elements keep separate finishes. Activated powers, critical-only riders, versatile damage choices, temporary ammunition and conditional returning are not guessed from an ordinary roll. Known custom base weapons can use a base default, but owned-item rune changes require customization.

### Contents and elemental finishes audit, 2026-10-07

The original selector requested nonexistent elemental impact families, so Acid Flask and several other elemental weapons silently selected a generic hit. Corrected families now resolve in both editions. **Acid Flask** has flask flight, a linked green liquid splash on the target, glass fragments and a brief corrosive residue. Free liquid substitutes retain liquid geometry and replace the source color before tinting, so blue footage can become green without turning dark.

All 171 bomb entries were checked against native damage and full-description rules, with targeted review of the 50 bomb families. Sixteen contents styles distinguish liquid, gas, fire, frost, lightning, void, radiance, force, sonic, shrapnel, crystal, pressure, firework, light, silk and thorns. Frost Vial, Bottled Lightning, Dread Ampoule, Water Bomb, Glue Bomb and Junk Bomb have matching target finishes. Bottled Sunlight retains its secondary fire cue. Missing exact art remains an approximation; Spider Satchel uses a symbolic silk cue.

The catalog includes 256 elemental uses and 85 finite residue cues. Residue lasts 2.4 seconds and does not track persistent damage, conditions, splash footprints or terrain. Always-on weapon damage such as Ankhrav Duster's acid and Storm Hammer's electricity is included; target-specific damage such as Silversoul Bomb's special persistence is excluded from ordinary playback. Brilliant supplies its unconditional fire, with conditional spirit/vitality excluded. Wounding follows the pinned system's bleed damage without inventing persistent damage.

Acid Flask's installed Patreon video composition was visibly checked through impact and residue, with synchronized stage highlights. Foundry's configured HTTPS endpoint was reachable but required joining a session; live canvas playback was not verified. Compiler, routing, both-edition planning and complete media timing have automated coverage. These checks do not claim that all 1,127 animations were individually watched.

Related enhancement tiers and weapons with equivalent construction can share choreography. Different names are not evidence of different physical attacks. Native damage, usage, handedness, reach and exact available artwork determine distinctions; no promise of 1,127 unrelated animation films.

## Validation and rebuild

Both editions preflight every usage: **0 missing keys / planning errors**. Complete inventories searched: 6,870 Patreon / 1,351 Free keys; actual selected weapon footage uses 72 Patreon / 52 Free keys. All 85 selected keys have measured timing. Full media lifecycle audit across spells, feats and weapons checks 732 files, with zero missing files, cutoffs or early fades. All 294 tests pass, including Acid Flask, other bomb contents, always-on damage rules, multiple runes, finite residue and color replacement. This measures availability and lifetime, not live visual review of every weapon.

Reports: [weapon JSON](../data/pf2e-weapon-audit.json), [weapon CSV](../data/pf2e-weapon-audit.csv), [sound decisions](../data/pf2e-ability-sound-audit.json), [media completeness](../data/pf2e-media-completeness-after.json).

```powershell
rtk proxy node tools/fetch-pf2e-weapon-source.mjs
rtk proxy node tools/build-pf2e-weapon-catalog.mjs
rtk proxy node tools/build-ability-sounds.mjs
rtk proxy node tools/audit-media-completeness.mjs --write-durations --fetch-missing-free
rtk npm test
```

Source fetch caches the pinned official archive and extracts only equipment into `.cache`. The animation module bundles references and metadata; media stays in installed JB2A/sound packs. Key audit can obtain official Free metadata; optional media audit downloads absent Free files only into development cache.
