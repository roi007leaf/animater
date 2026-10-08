# Animater

Automatic animations for **Pathfinder 2e**, **Starfinder 2e** and **D&D 5e** in **Foundry VTT 14**, powered by **Sequencer and JB2A**. Enable ready-made catalogs or choose individual animations, then cast spells, make attacks and use abilities through your system's normal workflow.

Animater combines visual effects, cosmetic token movement and optional sound. Browse and preview catalog entries, or customize them in **Recipe Studio**, a timeline editor with separate tracks for visuals, motion, sound and filters.

> PF2e has received the most live table testing. SF2e, D&D 5e and multiplayer playback have had less testing. Report bugs and requests on the [issue tracker](https://github.com/roi007leaf/animater/issues).

## Requirements

| | Module | Notes |
|---|---|---|
| Required | [Sequencer](https://github.com/fantasycalendar/FoundryVTT-Sequencer) 4.2+ | Plays every effect |
| Required (one) | JB2A Free (`JB2A_DnD5e`) or JB2A Patreon (`jb2a_patreon`) | Patreon unlocks the full art set; every animation has a Free fallback |
| Optional | GGG, PSFX, SoundFx Library, PF2e Creature Sounds | Sound cues; uses whichever packs are active |
| Optional | Token Magic FX | Token filters (frost, blur, image copies, glows) |
| Optional | FXMaster | Brief scene weather for storm and weather spells |

## Install

1. In Foundry's **Add-on Modules → Install Module**, paste the manifest URL:
   `https://github.com/roi007leaf/animater/releases/latest/download/module.json`
   For a specific version, use the manifest attached to that version on the [releases page](https://github.com/roi007leaf/animater/releases).
2. Activate Sequencer, a JB2A pack and Animater in your world.
3. Open **Game Settings → Animater → Open Animater** (or the wand in Token Controls, or **Alt+Shift+A**).
4. Open a catalog and enable it with **Use entire catalog** or the corresponding **Use … catalog** button. To enable one entry, select it and choose **Use animation**. Automatic playback is off until you enable it.
5. Cast, attack or use the enabled ability normally. For a canvas preview, select a caster token first and target any affected creatures.

Install and activate **either** JB2A edition; Patreon users do not need JB2A Free as well. Animation, sound and icon media comes from your installed asset packs, rather than being bundled with Animater.

## What it animates

- **Spells.** Casting, flight, impact and area footage that follows the native template: bursts, cones, lines, emanations and walls. Spells that let you choose a damage type animate in the chosen element.
- **Feats, actions and class features.** Each has its own catalog page: Demoralize, Grapple, Raise a Shield, Rage, Sneak Attack, Flurry of Blows, Glimpse of Redemption and many more. Damage riders such as Sneak Attack play alongside the Strike.
- **Weapons.** Melee, ranged and thrown uses, chosen from the actual Strike. Elemental runes, bombs and firearms included.
- **Effects and conditions.** Persistent layers that follow the token while the native effect or condition is active, and end when it ends.
  - Afflictions read as debuffs at a glance.
  - Valued conditions such as Frightened 1–4 grow stronger with their value.
  - Persistent damage shows its damage type.
- **Token motion.** Cosmetic lunges, recoils, leaps, charges and stagger poses that return the token to its place. The real token position never changes.
- **Sound.** Optional, synchronized to the visuals, and only from packs you have installed.

Every catalog entry can be previewed in the workspace, enabled or excluded individually, and customized into an editable recipe: stages, timing, assets, motion, sound and filters.

### Catalog controls

- Search and filter entries within each catalog.
- Enable the whole catalog, or choose individual entries with **Use animation**.
- While the whole catalog is enabled, hover a card and use **⊘** to exclude that entry. Click again to include it; excluded cards appear dimmed.
- Adjust token motion, sounds and volume using the catalog controls.
- Choose **Customize** to create an editable recipe for an entry. Entries marked as needing configuration require setup before automatic playback.

## Recipe Studio

Build your own animation or customize a catalog entry in a timeline workspace.

- **Preview monitor:** Play, pause, stop, loop and scrub to inspect a specific moment.
- **Separate tracks:** Caster, Flight, Target, Token motion, Sound, and Filters & scene. Add stages with the track's **+** button.
- **Clip editing:** Drag clips to change timing, drag their right edge to trim duration, and right-click to duplicate or delete. Clips snap to other clips and the playhead; hold **Alt** to place freely.
- **Choreography:** Start a stage *With* or *After* another stage, or *At a set time*. Linked stages stay attached when their timing changes.
- **Mute and solo:** Isolate tracks while previewing to check visuals, motion, sound and filters separately.
- **Stage inspector:** Choose assets, stage types and stage-specific options. Visual assets have previews; sound stages have a listen player and volume control.
- **Recipe settings:** Set the trigger, bound item, description, category and accent through the **⚙** trigger chip.
- **Table playback:** Try a private local canvas preview, then use **Play at table** to share the animation.

FXMaster particles can play inside the preview monitor. FXMaster scene filters need **Play at table** to inspect their appearance on the scene.

Useful shortcuts: **Space** to play/pause, **Home/End** to jump, **L** to loop, **Ctrl+D** to duplicate, **Delete** to remove a clip, **Ctrl+S** to save, and **Ctrl+wheel** to zoom the timeline.

## Settings

| Setting | Scope | What it does |
|---|---|---|
| Animation quality (this device) | Each player | Full / Balanced / Low / Off. Lower it on slower computers; other players are unaffected |
| Weapon effect size | World | Multiplies weapon hit and residue size (default 1.5×) |
| Add Token Magic FX filters to catalog animations | World | Optional filters when Token Magic FX is active |
| Add FXMaster scene effects to catalog animations | World | Optional scene effects when FXMaster is active |
| Take over from Automated Animations | World | When both modules would animate the same item, Animater plays and Automated Animations stands down |

The per-user preview setting can minimize the Animater window during local previews and table playback, then restore it afterward.

### Animation quality

| Level | What that player sees |
|---|---|
| Full | Every layer, token motion and Token Magic filters |
| Balanced | Main and secondary layers; no decorative layers or Token Magic filters; up to 3 persistent effects per token |
| Low | Only the main effect of each animation, plus token motion; one persistent effect per token |
| Off | No Animater visuals (sounds still play) |

The player who starts an animation only sends optional layers to viewers whose level allows them, so slower computers never load footage they won't show.

## Integrations

- **Automated Animations.** Animater takes over items it animates. Items you customized in Automated Animations stay with Automated Animations.
- **Spell Arsenal.** Spells mapped to a Spell Arsenal area rule keep their lasting Spell Arsenal tiles. Tick *Also play Animater recipe* on a mapping to play Animater's animation beside them.
- **Trigger Engine / Trigger Animations.** Adds an *Animater: Play animation* node.

## API

```js
const animater = game.modules.get("animater").api;
await animater.play("Fireball", { source: canvas.tokens.controlled[0], targets: Array.from(game.user.targets) });
await animater.preview("Fireball"); // local only
animater.resolve(message);          // the recipe automatic playback would use, or null
animater.handles(item);             // true when Animater would animate this item or message
await animater.stop();
```

Hooks: `animater.preDispatch(event, recipe)` runs before automatic playback (return `false` to claim the event); `animater.played(event, recipe)` runs afterwards.

## Known limits

- Foundry 14 only. Multiplayer replication and live D&D 5e / SF2e play have had less testing than PF2e.
- Area animations play once when the area is placed. For visuals that last as long as the area does, use Spell Arsenal.
- Actions whose area is placed separately (e.g. Dragon Breath) use their regular animation; template-driven action areas are planned.
- Token motion is cosmetic; it never moves tokens or changes their documents.
- D&D 5e catalogs use public 2014 and 2024 SRD content. Passive features are excluded from active ability catalogs.
- No animation, sound or icon media is bundled; everything comes from the JB2A and sound modules you install.

## Development

```bash
npm ci                         # install development dependencies
npm test                       # unit and integration tests
npm run build                  # rebuild changed catalogs
npm run build -- --dry-run      # inspect the incremental build plan
node tools/release-files.mjs    # list release ZIP contents
```

Catalog data is generated by `tools/build-*.mjs` from pinned system compendium sources. Release archives contain only runtime files; audits and docs stay local.

Development-only `data/feat-*-review.mjs` maps are Git-ignored. Catalog builds and review audits recreate missing maps from the retained review generators and pinned feat catalog.

Runtime catalog data, sound mappings, FX description flags and media measurements remain tracked because Foundry loads them directly. Development inspection helpers are local-only; release archives exclude tools, tests, caches and development review maps.

D&D 5e descriptions include content from the System Reference Document 5.1 and 5.2 by Wizards of the Coast LLC, available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## License

GPL-3.0. See [LICENSE](LICENSE).
