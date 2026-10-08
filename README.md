# Animater

Automatic JB2A animations for **Pathfinder 2e**, **Starfinder 2e** and **D&D 5e** in Foundry VTT 14, played through Sequencer. Every spell, feat, action, class feature, weapon, item, effect and condition in the supported systems has a catalog entry matched to its own description, combining JB2A footage, token motion, optional Token Magic FX filters and optional sound.

> **Prerelease (0.1.0).** Feature-complete for everyday play in PF2e; SF2e and D&D 5e catalogs are complete but have had less live table testing. Please report issues on GitHub.

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
   (for this prerelease, use the `module.json` attached to the [0.1.0 release](https://github.com/roi007leaf/animater/releases)).
2. Activate Sequencer, a JB2A pack and Animater in your world.
3. Open **Game Settings → Animater → Open Animater** (or the wand in Token Controls, or **Alt+Shift+A**).
4. In a catalog page, choose **Use entire catalog** (or **Use animation** on single entries). Automatic playback is off until you enable it.

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

## Settings

| Setting | Scope | What it does |
|---|---|---|
| Animation quality (this device) | Each player | Full / Balanced / Low / Off. Lower it on slower computers; other players are unaffected |
| Weapon effect size | World | Multiplies weapon hit and residue size (default 1.5×) |
| Add Token Magic FX filters to catalog animations | World | Optional filters when Token Magic FX is active |
| Add FXMaster scene effects to catalog animations | World | Optional scene effects when FXMaster is active |
| Take over from Automated Animations | World | When both modules would animate the same item, Animater plays and Automated Animations stands down |

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
- No animation, sound or icon media is bundled; everything comes from the JB2A and sound modules you install.

## Development

```bash
npm test                 # unit and integration tests
npm run build            # rebuild changed catalogs (see tools/build.mjs)
node tools/release-files.mjs   # the files a release zip contains
```

Catalog data is generated by `tools/build-*.mjs` from pinned system compendium sources. Release archives contain only runtime files; audits and docs stay local.

D&D 5e descriptions include content from the System Reference Document 5.1 and 5.2 by Wizards of the Coast LLC, available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## License

GPL-3.0. See [LICENSE](LICENSE).
