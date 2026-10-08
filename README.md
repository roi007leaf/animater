# Animater

Animation module using JB2A animations (Free and Patreon) and Sequencer. PF2e, SF2e, and D&D 5e.

Development publication check: this build contains AI-authored prepared text and is **not ready for Foundry's official listing**. See [publication audit and required human work](publication/readiness.md). `rtk proxy npm run audit:publication` inventories runtime text and unresolved provenance; `rtk proxy npm run build:release` refuses staging until those checks are resolved. These checks do not establish human authorship or replace Foundry review.

Version 0.2.0 is a development foundation. The editor and JB2A video previews were verified inside Foundry 14 with PF2e 8.5.1. A private Casting flourish preview visibly animated the existing token artwork and restored its pose; Activity recorded paired motion and Sequencer playback. Native PF2e and D&D 5e 6.0.5 hooks, motion restoration, private routing, and scene-scoped transport have automated coverage. Live D&D 5e gameplay and multiplayer replication remain unverified.

SF2e 1.5.1 support: 432 spells, 681 active feats, 174 actions, 3 class/ancestry features, 192 weapons, 46 condition entries and 400 sustained effects. Native SF2e UUIDs, chat rolls, Area Fire/Auto-Fire Regions, temporary previews, optional sound packs and document-linked lifetimes use separate catalog settings. Only the world’s system catalogs appear. See [SF2e coverage and limits](docs/sf2e-support.md). Native SF2e world gameplay and multiplayer verification remain outstanding.

## Start in Foundry

1. Restart Foundry so it discovers the new `Data/modules/animater/module.json`.
2. Activate Sequencer 4.2+ and one JB2A pack: `JB2A_DnD5e` (Free) or `jb2a_patreon` (Patreon).
3. Activate Animater in your world and reload.
   When updating from 0.1, stop and start the actual Foundry server instance so it registers the new module socket, then reload connected clients. A browser refresh cannot register the channel. For a launcher-managed server, use that launcher's Stop/Start controls. The warning shows Animater's version loaded by the server, which can differ from updated files on disk. Local motion previews work without table sync; table motion remains blocked until the channel is available.
4. Open **Settings â†’ Animater â†’ Open Animater**, the wand in Token Controls, or **Alt+Shift+A**.
5. Pick a recipe. Select a caster token and target at least one token, then click **Local preview**.

Area spell canvas previews place a temporary, local measured template and remove it on completion, Stop, errors, or scene changes. Catalog spells retain their native area size and shape when customized. Bursts center on the first target, or caster when no target is selected; emanations, cones and lines start at the caster. A selected circular, native line or square area supplies custom placement and size. Custom area stages without spell metadata use a 15-foot-radius sample. These previews never save a template or trigger automatic spell playback. Line spells follow native endpoints and width; cone footprints retain symbolic casting cues.

6. Set trigger and item names, or drag an item into **When it plays**. Save. Enable **Automatic playback** in Setup when ready.

Automatic playback defaults to **off**. Other animation engines are detected and named in Setup; overlapping triggers can produce duplicate effects. Animater does not change another module's configuration.

Open **PF2e spells**, preview a ready entry, then choose **Use animation** or **Use entire catalog** for plug-and-play defaults. Built-ins use catalog data without saved-recipe slots. **Customize** creates or reopens editable choreography; switching back to catalog playback preserves saved edits. The inventory contains 1,994 documents: **1,096 ready animations and 898 entries needing configuration**. Generic casting-ring/impact fallback is disabled. Unconfigured entries skip catalog playback; **Configure animation** opens a disabled blank draft bound to the spell, and existing configured custom recipes still work. Ready treatments include 231 curated, 411 themed and 454 symbolic compositions with visible limitations. Full descriptions inform semantic rules; 584 entries have explicit reviewed mappings. This does not claim all spells have bespoke artwork or were individually watched. Shared compositions remain labeled; see the [current catalog](docs/pf2e-spell-catalog.md) and [design audit](data/pf2e-design-audit.json). Individual spells can be excluded; ready rituals use manual playback. Choose **Effects only** when motion sync is unavailable.

## D&D 5e catalogs

In a D&D world, the sidebar shows D&D catalogs only; a PF2e world shows PF2e catalogs only. Each system keeps separate catalog activation, exclusions, customizations, motion and sound settings.

The public D&D 6.0.5 catalog contains **659 spells, 562 active features, 484 weapons, 566 activated items, 44 native statuses and 1,333 Actor-capable effects** across the official 2014 and 2024 SRD packs. Native activities and melee/ranged/thrown usages have distinct variants. Choose **Use animation** or **Use entire catalog** for defaults, or **Customize** for editable choreography. Full composed previews highlight each stage; area previews create temporary local geometry and clean it up afterward. Conditions and effects remain attached only while native applied documents are active. Persistent layers have no sound loop or token displacement.

The catalog preserves D&D rules distinctions: first-target Chain Lightning forks, simultaneous total Magic Missile darts with native upcasting, one flight per native attack event, legacy versus modern Chill Touch, target-only followups, healing through the native damage hook, and selected weapon attack modes. Acid, Oil and Alchemist’s Fire use flask flights and target payloads; Oil stays unlit. Linked cast/summon activities that require another performer remain manual; their resulting native spell/attack owns automatic playback. Enchantment templates requiring a physical base also remain manual; arbitrary applied-enchantment combinations can be customized on the owned weapon. Native ability/tool checks remain manual and quiet. Optional sounds use active installed libraries and keep working when a pack becomes unavailable.

Coverage is the **public SRD corpus**, not every commercial book. Generation examines native descriptions/data throughout; 184 documents received individual description/activity review. Shared or symbolic artwork remains labeled. See [native research and source provenance](docs/dnd5e-native-research.md) and [D&D validation](docs/dnd5e-catalog-validation.md). Native integration fixtures and browser previews are checked; live D&D multiplayer gameplay remains unverified.

Derived descriptions include content from the System Reference Document 5.1 and 5.2 by Wizards of the Coast LLC, available at [Wizards SRD](https://www.dndbeyond.com/srd), under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Source pack/document links accompany entries. No animation, sound, or icon media is bundled.

## Workspace

Click a selected spell, feature or item title to open its native Foundry sheet, resolved from its compendium UUID. Animation cards select the preview; the title opens the sheet without changing the workspace's scroll position. Details require Foundry; the standalone preview and native statuses without a rules-document UUID disable title actions.

- **Recipes:** search, category filters, twelve starters, clone/create/delete, editable names and descriptions, draft preservation while switching recipes. Existing worlds can use **Add 3 motion recipes** above the cards; existing edits are preserved.
- **PF2e spells:** all 1,994 spell documents from PF2e 8.5.1, including focus, rituals and legacy entries. Search/filter, full composition previews with step highlights, private canvas previews, **Use animation** and optional **Customize**. Optional catalog automation stays separate from saved recipes. See the [animation audit](docs/pf2e-animation-audit.md), [catalog coverage](docs/pf2e-spell-catalog.md) and the [full CSV](data/pf2e-animation-catalog.csv).
- **PF2e feats:** 2,308 active feat documents from PF2e 8.5.1: 1,619 actions, 473 reactions and 216 free actions. The other 3,976 native passive feat items are excluded. Search by name, trait or book; filter by level, activity, category, class, animation family and treatment. Full previews highlight every stage. **Use animation** enables one feat directly; **Use feat catalog** enables catalog defaults without saved recipe slots. **Customize** opens editable choreography. Feat automation is separate from spell automation. See [coverage and limitations](docs/pf2e-feat-catalog.md).
- **PF2e actions:** 494 basic, skill and class actions such as Demoralize, Grapple, Raise a Shield, Rage and Glimpse of Redemption (native `actionspf2e` pack), with their own page, settings and enable/exclude state.
- **PF2e features:** class and ancestry features such as Flurry of Blows and Sneak Attack; damage riders (Sneak Attack, Precise Strike, ranger Precision) play alongside the Strike's own animation when the damage roll includes them.
- **PF2e weapons:** 1,013 weapons / 1,122 native melee, ranged and thrown uses. Full-description search, mode buttons, complete previews/highlights, direct catalog use and per-mode customization. Actual Strike usage selects the animation, including combination weapons. Bombs release matching contents on the target, with optional glass fragments and brief residue. Guaranteed elemental weapon damage keeps its own contact finishes. Optional weapon sounds have independent toggle/volume and auditions. See [weapon catalog and limits](docs/pf2e-weapon-catalog.md).
- **Travel paths:** beam stages support caster to every target, creature-to-creature chains, or target to caster for drain effects. Moving projectiles also support target-to-caster returns. Native controls preserve existing saved recipes' default source routing.
- **Feat treatments:** every active feat's complete description has an individual review, source hash and evidence. Related feats retain shared visual vocabulary but get distinct visible effect composition, including effects-only Free/Patreon playback. Double Slice uses overlapping crossed cuts; Twin Takedown uses pursuit echoes and staggered alternating cuts. Preparations do not prematurely cast later attacks; mixed weapon combinations preserve their attack sequence. Framing differences are art choices, not rules outcomes. Audit data records semantic design and visible framing separately.
- **Choreography:** up to twelve stages, timing, duration, scale, opacity, layer, and optional persistent aura. Drag a stage onto another to reorder, or use visible Earlier/Later buttons. Reordering assigns the existing chronological start-time slots to the new order; durations and settings stay with their stages, and simultaneous slots stay simultaneous. Changes remain drafts until saved.
- **Full recipe preview:** Preview recipe plays every installed JB2A layer and token motion together in the editor, with elapsed time, progress, replay/stop, and highlights on every currently playing stage. Overlapping steps highlight together; completed steps remain marked. Selected stage retains the individual asset preview. Editor composition uses sample spacing; chains show targeted creatures in order (up to six), or three sample targets. Other recipes show one target. Local preview uses actual Sequencer canvas placement and also highlights stages. Editing, switching views, and closing the workspace cancel editor preview.
- **Token motion:** **+ Token** adds rush, arcing leap, roll, lateral dodge, lunge, recoil, shake, spin, rise/settle or pulse. Choose a target approach or fixed gesture, near/far-side finish, distance cap, leap height and arrival hold. **Destination reached** timing links keep a Strike synchronized as distance changes. Eight movement feats have individual treatments, including Sudden Charge and Sudden Leap; see [expressive motion](docs/expressive-token-motion.md). Full previews use the same pose as canvas playback. Artwork returns afterward; actual movement remains a player action. Existing saved gestures retain their configuration.
- **Effect configuration:** grouped controls for repetition and target staggering; media speed and opening/end clipping; grid offsets, anchors, mirroring, attachment and token cropping; entrance/exit fades, scale/rotation transitions and easing; tint, brightness, contrast, saturation, hue, blur and glow. Neutral defaults preserve existing recipes and JB2A alignment. Changing anchor values enables the explicit anchor override.
- **Property tracks:** up to six tracks per effect for horizontal/vertical position, rotation, width/height multipliers or opacity. Set endpoints, duration, delay and easing; optionally loop/ping-pong. End-relative tracks use zero to finish at stage end and negative offsets to finish earlier. Tracks animate effect artwork; token motion animates the original token.
- **Copies, sound and overlays:** add a stage, then choose **Token copy / shadow**, **Sound cue** or **Screen overlay**. Copies use caster/target artwork with spacing and optional silhouettes. Sound supports a relative Foundry audio path, native **Browse audio**, volume, fades and clipping. Screen overlays can fit the viewport. No sound media or Eskie Macro Pack dependency is bundled.
- **Assets:** searches the installed Sequencer JB2A database, loads visible thumbnails and one larger looping video preview, then applies an asset to the selected effect stage's draft. Token motion uses no JB2A file.
- **When it plays:** manual, item use, attack roll, damage roll, area placement, or effect creation. Exact names and native slugs; comma-separated alternatives. A bound item UUID takes precedence over names.
- **Activity:** a bounded local log of matched, dispatched, skipped, or blocked events. Missing source, targets, and assets explain how to repair the recipe.
- **Setup:** dependency status, system adapter status, coexistence notice, and automation switch.
- **Import/export:** versioned JSON, validation, a review showing replacement counts before import. Export includes saved recipes. Import preserves the automation setting.

Configuration is GM-only. Players can trigger configured animations from their own events. Manual API playback requires source-token ownership. Local canvas previews do not broadcast and do not persist. **Stop my effects** cancels scheduled stages/repetitions and ends this user's Animater effects and sounds.

Active feat animations play when the player sends that feat's own item card to chat. Target affected creatures first for target-based treatments. A generic Strike, skill roll or granted spell cannot reliably identify its parent feat, so those events do not infer feat activation. Native passive feat parents are excluded even when they grant actions or spells; activate the separate item instead. Authored treatments and description-based semantic rules share labeled motifs. These visual cues never resolve conditions, damage, resources or actual token movement.

## PF2e conditions and persistent effects

**PF2e conditions** and **PF2e effects** add 43 core conditions and 2,929 native spell, item, feat, creature and campaign effect documents. Enable one entry or a whole catalog. Attached visuals stay while their native documents are active, stop on removal/expiry/overrides, and return after reload or scene changes. Persistent Damage follows its actual damage type. Previews end automatically; **Customize** edits document-linked aura layers. Names open native Foundry Item sheets. See [persistent catalog guide and limits](docs/pf2e-state-catalog.md).

## Optional catalog sounds

**PF2e spells → Spell sounds** automatically detects active **GGG**, **PSFX**, **SoundFx Library** and **PF2e Creature Sounds**. Toggle sounds or set catalog volume (35% default); expand each spell's **Sound design** to see its rationale and audition cues. **Preview recipe** includes synchronized sound. **Customize** copies editable sound stages; replace files, change volume or link a cue to a stage's start or finish.

Weapons and active feats now have separate sound toggles and volume controls. Full-description audio rules provide designs for all 1,122 weapon uses and 687 active feats; silent or ambiguous activities stay quiet. Feat sounds were previously missing from recipe generation; automatic cards and previews now include available cues. Related generic melee feats follow blade artwork unless customized for the wielded weapon. See [weapon/feat sound decisions](docs/pf2e-ability-sounds.md).

All 1,994 spell entries were audited against pinned PF2e 8.5.1 descriptions: 1,991 contain description text; three empty descriptions stay quiet. Semantic rules and reviewed exceptions assign fitting audio to 881 spells across 61 profiles. Remaining 1,113 entries stay quiet or await player-chosen audio. Coverage depends on active packs; no pack supplies every effect. See [sound audit](docs/pf2e-spell-sounds.md), [per-spell CSV](data/pf2e-spell-sounds.csv), and [coverage data](data/spell-sound-coverage.json).

Missing/inactive packs skip only optional cues. Existing saved recipes keep their custom audio and volume. Monk's Sound Enhancements, Moulinette Soundboards, Soundbrett and The Sound of Silence manage playback; their installed copies do not contain spell sound libraries. No audio files are bundled or copied.

## Chromatic Orb builder

Orb choreography uses six native layers: orbit charge, rainbow charge, release flash, orb shell, rainbow core and elemental impact. Each layer supports stage names and normal editor controls. **New recipe** opens a blank manual draft; choose assets, add moving projectile stages and linked timing, preview, then save. The recipe header's Chromatic Orb shortcut has been removed. **Local canvas preview** uses selected caster and targets before saving anything.

Flight duration is base duration plus grid distance times extra milliseconds per square. Both orb layers move with Sequencer `moveTowards`, rather than stretching into a beam. A shared landing group keeps shell, core and impact on one randomized point per target. Impact starts 100ms before the core finishes. Changing distance or target staggering adjusts arrival timing automatically. The builder's sample distance controls preview timing; its visual spacing is illustrative.

Other recipes can use **Moving orb / projectile** and **Linked timing & flight** for the same controls. Stable stage links survive reordering; â†³ marks computed sample start times. Removing a referenced layer converts its dependents to absolute sample timing. Sprite width/height changes use grid squares; scale X/Y tracks remain multipliers. Free editions may substitute available colors or charge art, and fallback charge art starts at its opening rather than inheriting a long Patreon clip skip. Final bursts use JB2A instead of Eskie's custom impact artwork.

## System adapters

| Event        | PF2e                                                  | D&D 5e                                      |
| ------------ | ----------------------------------------------------- | ------------------------------------------- |
| Item use     | Authored item chat card                               | `dnd5e.postUseActivity`                     |
| Attack       | Authored attack chat message                          | `dnd5e.rollAttackV2`                        |
| Damage roll  | Authored damage chat message                          | `dnd5e.rollDamageV2`                        |
| Area         | `createRegion` / `createMeasuredTemplate` origin item | Region activity / origin item               |
| Effect added | Effect/condition item on actor                        | Enabled ActiveEffect on actor or owned item |

PF2e rerolls, private/blind messages, saving throws, skill checks, flat checks, and damage-applied messages are excluded. A recorded PF2e target takes precedence over current targeting. Only the initiating author/client starts playback; Sequencer replicates VFX. Token motion uses Animater's scene-scoped module socket and each client's local rendered token mesh. It does not change token documents, movement, rotation, ownership, or hidden state. Stop, overlap, scene teardown, and movement restore or cancel cosmetic poses. Hidden or invisible tokens are skipped. Local previews do not send motion packets.

D&D 5e uses native activity hooks, not Midi-QOL workflows. Roll hooks without an activity are ignored. Private use messages and roll objects carrying a non-public roll mode are skipped. Core roll hooks do not consistently supply per-target outcomes or final message visibility; comprehensive private-roll handling remains a live-integration follow-up. D&D 5e attack misses are not guessed from AC. PF2e supplies miss behavior from its recorded attack outcome.

## Asset editions

No animation media are bundled. Assets and CDN URLs come from Sequencer's registered JB2A database. Recipes contain ordered fallback keys, so missing colors can fall back to an installed variant. The editor shows when a fallback is used. If no candidate exists, the entire recipe is blocked before any effect starts.

Verification on 2026-10-06: all twelve starter recipes and all six Chromatic Orb variants resolve against the installed Patreon database (6,870 variants) and the current official Free database (1,351 variants). This verifies key availability, not downloaded Free video playback or identical artwork in both editions.

The earlier [combined audit](docs/deep-catalog-audit-2026-10-07.md) and [per-entry ledger](data/deep-catalog-audit-2026-10-07.json) record the broad inventory review. After generic spell fallback removal, current [coverage](data/pf2e-catalog-coverage.json) checks 1,096 playable spells against both edition inventories and reports the other 898 as unconfigured. Current [media completeness](data/pf2e-media-completeness-after.json) includes playable spells, active feats and weapon uses. Exact installed paths are checked separately from official Free reference measurements.

## Development preview

From this directory:

```powershell
rtk node tools/preview.mjs
```

Open [Animater preview](http://127.0.0.1:4174). The preview uses the actual shared workspace code and locally installed JB2A media. Changes are stored only in that browser's local storage. It cannot play canvas sequences or receive game events. The server binds to loopback and serves Animater and installed JB2A files. The [Foundry CSS regression harness](http://127.0.0.1:4174/modules/animater/preview/foundry.html) also serves installed Foundry CSS, fonts, and icons read-only. Its footer checks card height, heading fonts, timeline layout, checkbox pseudo-elements, and native window-control icon fonts.

## API

```js
const animater = game.modules.get("animater").api;
animater.open(); // GM only
await animater.preview("ember"); // selected caster + current targets, local
await animater.play("ember", {
  source: canvas.tokens.controlled[0],
  targets: Array.from(game.user.targets),
});
await animater.stop();
console.table(animater.activity());
console.table(animater.feats().feats); // active PF2e catalog and pinned source metadata
console.table(animater.actions().actions); // basic, skill and class actions
console.table(animater.features().features); // class and ancestry features, including damage riders
console.table(animater.weapons().weapons); // weapon catalog with supported native modes
console.table(animater.conditions().conditions); // native PF2e conditions
console.table(animater.effects().effects); // spell, item, feat and creature effect Items
animater.resolve(message); // recipe automatic playback would use, or null; nothing plays
animater.handles(item); // true when Animater would animate this item or chat message
```

Hooks: `animater.preDispatch(event, recipe)` runs before automatic playback; return `false` to claim the event. `animater.played(event, recipe)` runs afterwards.

## Integrations

- **Automated Animations.** With *Take over from Automated Animations when Animater has an animation* enabled (default), Automated Animations stops its workflow for any item Animater would animate, and the conflict warning is hidden. Items customized in Automated Animations (enabled, *Customize* set) stay with Automated Animations; Animater skips them.
- **Spell Arsenal.** Spells mapped to an area rule are left to Spell Arsenal; Animater skips its own automatic area animation. Enable *Also play Animater recipe* on a mapping to have Spell Arsenal play the Animater recipe beside its tiles, once per area or chat card, on the active GM. Opted-in damage and cast mappings likewise replace Animater's automatic playback.
- **Trigger Engine.** Adds the *Animater: Play animation* action node (recipe ID or name, source token, target tokens) to Trigger Animations and Trigger Engine graphs. It plays on the active GM.

## Validation

```powershell
rtk npm test
rtk node tools/verify-libraries.mjs
rtk proxy node tools/verify-spell-catalog.mjs
rtk proxy node tools/audit-spell-quality.mjs
```

The verification commands read your installed Patreon database and fetch the official Free database source for key verification. They do not copy media into this module.

The automated suite covers matching, asset fallback, imports/configuration round-trips, bounds, multi-target planning, ownership/private routing, stop/error cancellation, native activity adapters, token restoration, sockets, chronological reordering, overlapping/repeated/staggered highlights, composed audio/video/token playback, property tracks, clipping and end-relative timing. Editor regressions cover retained scroll/media nodes, stage navigation, repeated controls and visible motion restart blockers; integration covers local selection/target preview hooks and native PF2e recorded targets with current targeting cleared. Catalog regressions check the complete pinned inventory, every generated recipe, UUID/localized lookup, trigger choices, opt-in automation, exclusions, disabled overrides, customization deduplication and full custom storage. Browser checks cover catalog search/filter counts, empty states, full playback/highlights, loaded spell icons, editable copies and compact layouts. Orb regressions cover six element variants, shared scatter, per-target duration/arrival, stagger inheritance, reference validation, width/height tracks and synchronized moving layers. Live PF2e checks include immediate caster/target portrait sync. Private tests completed for the six-layer orb, effect fades/growth, brightness/glow, a position track, three token shadows, sound with native file selection, and a screen overlay. The Foundry CSS harness retains five passing layout/icon checks. Live D&D 5e and multiplayer configuration playback remain unverified.

## Current limits

- Foundry 14 target. PF2e workspace, asset previews, and private token motion were checked live. Older Foundry versions, live D&D 5e gameplay, and multiplayer replication are unverified.
- Native circles/emanations, cones, lines and square/cube footprints are supported. Cone films preserve vertex, direction, aperture and portable native clipping; cone projectile fans spread through the area. Complex multi-shape regions and arbitrary wall paths need manual authoring. Vertical volume is not rendered in 3D; a rectangular token's emanation uses an enclosing circular artwork approximation.
- Sound cues use your files. Camera movement, mechanical token movement and teleport actions remain unsupported. Cosmetic token poses are supported.
- Native configuration covers common effect composition, not every Eskie macro-specific workflow. See [configuration coverage](docs/eskie-configurations.md). Editor filters/cropping are composition approximations; Local preview uses Sequencer's exact canvas rendering. Chain composition previews display staggered creature-to-creature hops; other recipes show one target. Canvas preview remains authoritative for actual placement.
- Manual recipe auras persist until stopped or cleaned up by Sequencer. PF2e Conditions and Effects catalogs instead follow active native documents, ending on removal, expiry or suppression.
- Starter names are English. Bind localized items by UUID or edit matching names.
- Maximum 200 saved custom recipes; built-in PF2e catalogs remain separate and page through their full inventories. The asset browser displays the first 100 matches, with narrower search for the rest.
- Settings are world-scoped. Concurrent GM edits are not transactionally merged.
- Dynamic hooks do not establish one action-wide workflow identity across use, attack, and damage. Keep a recipe on one trigger to avoid unintended multiple plays.

See [research and product direction](docs/research.md) for the comparison and the next development priorities.

Latest combined pass: [deep catalog audit, 2026-10-07](docs/deep-catalog-audit-2026-10-07.md), with [spell description evidence](docs/deep-spell-audit-2026-10-07.md), [feat and shared motion audit](docs/deep-feat-motion-audit-2026-10-07.md), [weapon and sound audit](docs/deep-weapon-sound-audit-2026-10-07.md), and [utility sound review](docs/deep-utility-sound-audit-2026-10-07.md). These distinguish full inventory checks, individually read descriptions, reference footage and rendered samples. Earlier passes: [motion pacing](docs/token-motion-pacing-audit.md), [spell variety](docs/spell-variety-audit.md), [scaling](docs/animation-scaling-audit.md). Read-only rendered fixture: `preview/quality-audit.html`. Saved durations are retained; native defaults use readable floors.

Local artwork now accounts for transparent movie padding using measured visible bounds for 1,077 selected media filenames. The editor and canvas compiler share the correction; scale 1 fits visible artwork to the occupied footprint while retaining native aspect and placement. Unmeasured custom media keeps frame sizing. Preview recovery clears stale unavailable badges and Replay retries failed loads. Actual file/codec errors retain a failed-path tooltip. Rebuild measurements with `rtk proxy node tools/audit-media-footprints.mjs --fetch-missing-free --write`; installed-path availability is reported separately from reference footage in `data/pf2e-media-completeness-after.json`.

Catalog activation leaves saved-recipe automation unchanged. **Use entire catalog** prefers catalog defaults with explicitly chosen customizations. **Pause catalog** pauses that path; saved recipes retain their original automation setting. Native-trigger regressions verify one selected spell cannot activate unrelated custom recipes or double-play an override. Rendered flow verified using an isolated memory-only fixture (`preview/quality-audit.html?usage`); no world settings were changed for QA.
