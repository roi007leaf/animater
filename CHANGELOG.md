# Changelog

## Unreleased

- **Customizing a catalog entry uses your version right away.** Clicking Customize on a condition, effect or D&D entry now plays your saved version instead of the catalog one, with no extra "Enable customization" step. If that catalog was off, it turns on for that one entry only.
- **Plainer wording for condition and effect animations.** "Document-linked" and "native document" are gone: the Studio now says the animation plays while the condition or effect is on the token.

## 0.2.6 (2026-10-08)

- **"Attached aura" stages are now called "Stays on token"**, which says what they do: the animation sits on the token and moves with it.
- **"Stay until the effect ends" for token auras.** A looping aura (a Shield ward, a glow) can now stay on the token for exactly as long as the spell's effect lasts, with no duration in milliseconds to guess.
  - **Where to find it:** a checkbox right under Duration on any aura stage in the Studio. It replaces the old "Persist until stopped" option, which was hidden under Asset & visibility.
  - **When it ends:** when the item's effect leaves the token (for example "Spell Effect: Shield" in PF2e/SF2e, or the item's Active Effect in D&D), when the spell ends, or when you press Stop.
  - **No effect applied:** if no effect is applied within a minute, the animation stops on its own.
  - **Duration:** now only sets how long the preview lasts.
- **Players can make their own animations, with GM approval.**
  - **Players:** they open Animater (toolbar button or Alt+Shift+A) to a Studio of their own recipes, with the asset library; catalogs and settings stay GM-only. Each recipe card shows whether it is waiting for the GM, approved or declined.
  - **GM:** the Recipes page lists every player animation, waiting ones first, with Preview, Approve and Decline (or Revoke).
  - **Playback:** an approved animation plays only for the items that player's own characters use, even when the GM's automatic playback is off.
  - **Open in Studio:** the GM can open any player animation in the full Studio to inspect or fix it. A banner shows whose animations are open, with Approve, Decline and Done reviewing. Saved edits go back to that player and need approving again; the GM's own recipes and drafts come back when they're done reviewing.
  - **Approval covers one version:** any edit sends the recipe back for approval, and players cannot approve their own.
- **FXMaster effects stay inside the template.** When an animation has a placed template, its FXMaster particles or filters (snowstorm, fog, bloom…) now play only inside that template, as a temporary FXMaster region effect on the template, instead of over the whole scene. They are removed when the stage ends or the template is deleted. Without a template they still cover the scene. Local preview keeps its particles inside the preview area too.
- **Local preview shows FXMaster particles.** Snow, rain, embers, snowstorms and other FXMaster particle stages now appear in Local preview on your screen only; the scene is not changed. FXMaster scene filters (bloom, fog…) still need Play at table.
- **Play at table works without a template.** A recipe with an area used to stop with "Select a supported area first" while the window was tucked away, so it looked like the window just shrank. It now plays at the same sample area Local preview uses. If anything still prevents playback, the reason shows as a notification.
- **"Off" animation quality silences Animater too.** A player who sets Animation quality to Off no longer hears Animater sounds either; everyone else still does.
- **PF2e and SF2e effects no longer share one animation per theme.**
  - Effects of the same kind used to look identical: every lightning effect showed the same orb, and over 400 effects shared one blue border. They now take the theme's variants in turn.
  - Effects with the same name stem (Lightning Armillary, Catcher, Powered, Rod) always get different animations.
  - Lightning draws from orbs, static crackle and lightning balls; fire and poison have wider pools; enhanced senses show glowing eyes.
  - Wards use a compact shield marker instead of the large hex dome.
- **D&D official books reviewed.** A visual pass over the generated Player's Handbook, Monster Manual and Dungeon Master's Guide content:
  - **Smites** (Banishing, Blinding, Staggering, Thunderous, Wrathful) now strike the target in their own colour instead of glowing on the paladin.
  - **Book spells with literal JB2A footage:** Cloud of Daggers, Hunger of Hadar's darkness, Conjure Barrage and Conjure Volley's arrow volleys, Thunderclap and Destructive Wave's thunder, Armor of Agathys' ice shield.
  - **Book areas that last:** Cloud of Daggers, Hunger of Hadar, Jallarzi's Storm of Radiance and Tasha's Bubbling Cauldron loop, and Yolande's Regal Presence follows the caster.
  - **The beholder's Eye Rays** fire a ray, and each of the ten lands as its own effect.
  - **Weapon maneuvers and strike riders** (Commander's Strike, Trip Attack, Assassinate, Great Weapon Master…) land on the target as weapon hits.
  - **DMG firearms** fire bullets, the Ballista fires a bolt and the Cannon a cannonball. Reloading, loading and aiming no longer animate.
  - **Monster Manual:** "Expend Use" and "Roll 1d10" bookkeeping steps no longer play their own animation before the attack they lead to.

## 0.2.5 (2026-10-08)

- **All four degrees of success show.**
  - **Attacks:** a critical failure is a fumble. The attack goes wide and the attacker stumbles, unlike a plain miss.
  - **Saving throws against a spell or effect:** the saving creature reacts to its own result. It shrugs it off on a critical success, resists with a small shake on a success, staggers on a failure, and is overwhelmed on a critical failure.
  - **Systems:** PF2e and SF2e use all four. D&D 5e saves against a known DC use success and failure.
  - **Private rolls:** saves rolled privately or blind show nothing, so they give nothing away.
- **PF2e and SF2e lasting emanations and sustained spells.**
  - An aura emanation (Divine Aura, Destructive Aura, Reaper's Lantern…) loops around the caster and follows them. Emanations without the aura trait (Synaptic Pulse, Confusing Cry) only affect whoever is inside when cast, so they still play once.
  - Emanations that apply a spell effect (Bless, Protector's Sphere…) already show their aura from that effect, so they are not doubled.
  - Sustained spells count as lasting too. Their area ends when the spell's effect on the caster ends, or when the template is removed.
- **Auras that move with the caster.** Spirit Guardians, Aura of Life, Holy Aura, Antimagic Field and Antilife Shell (and, with the Player's Handbook, Aura of Purity, Aura of Vitality, Crusader's Mantle and Circle of Power) now keep looping around the caster and follow them as they move, instead of playing once.
- **Lasting areas end with concentration.** When a D&D caster stops concentrating (broken, dropped or expired), the looping animation of that spell's area ends too, even if its template is left on the map.
- **Hits, misses and crits look different.** A missed attack still flies, but wide of the target, and nothing lands on it: no impact, flinch or impact sound. A critical hit lands with a bigger impact and rocks the target harder. PF2e uses its degrees of success; D&D 5e uses natural 20s and 1s, and the attack total against the target's AC when one creature is targeted.
- **Creatures collapse when they drop.** A creature reaching 0 HP tips over and sags for a moment (D&D 5e, PF2e and SF2e); its Unconscious or Dying motion takes over from there.
- **Animations wait for Dice So Nice.** With Dice So Nice active, attack and damage animations start when the 3D dice for that roll land instead of while they are still tumbling. Each player can turn this off with the **Wait for Dice So Nice** setting (shown only when Dice So Nice is active).
- **D&D everyday spells look like themselves.** About 35 cantrips and 1st–3rd level spells that shared one purple divination circle or a blue shield marker now have their own look:
  - Divination opens glowing eyes (True Strike, Identify, Detect Thoughts, Clairvoyance, the Locate spells, Find Traps) or floating runes (Comprehend Languages, Tongues, Augury).
  - Guidance sparkles, Light glows, Mending draws threads together, Command rings out as a sound wave, and Hex and Bestow Curse wrap the target in dark strands.
  - Shield of Faith and Protection from Evil and Good raise star and rune wards, Sanctuary a golden blessing, Goodberry sprouts, and familiars, steeds and servants arrive through a portal ring.

## 0.2.4 (2026-10-08)

- **Several conditions on one creature.** The token now moves for the most important one instead of the most recent. From highest to lowest: Petrified (no motion), Paralyzed or Dead (held still), Unconscious, Dying or Sleeping (breathing), grappled or restrained (struggling), stunned or confused (wobbling), Frightened (trembling), poisoned or sickened (swaying), Blinded (searching), and tiredness or encumbrance (sagging). Applies in D&D 5e, PF2e and SF2e. New motions: D&D Dead, Stable, Dehydration and Malnutrition; PF2e/SF2e Slowed and Controlled; SF2e Glitching and Untethered.

## 0.2.3 (2026-10-08)

- **Right-click a recipe** in the recipe list to open it in the Studio, duplicate it or delete it, without opening it first.
- **Recipe delete is a red bin** in the Studio bar instead of the ⌫ symbol.
- **PF2e Dying no longer makes the token vanish.** Dying brings Unconscious, and the two breathing motions compounded every frame until the token shrank to nothing and stayed that way after the condition ended. A token now shows one condition motion at a time and returns to its natural pose when the last one ends.

## 0.2.2 (2026-10-08)

- **Custom asset sources.** Add named User Data folders in Assets to browse animations, images and sounds without Sequencer database registration, including subfolders. Sources are remembered per user and can be refreshed or removed. Folder source controls open in a compact toolbar popover.
- **Conditions move the creature.** While a condition lasts, the token itself reacts (on this screen only; the token never moves on the map): Frightened trembles, Poisoned/Sickened/Diseased sway, Stunned/Incapacitated wobble, Exhausted/Encumbered sag, Grappled/Restrained struggle, Blinded searches, Unconscious breathes slowly, and Petrified turns grey stone. Attacks and other token motion take priority; the device quality setting can turn it off.
- **No more force-field domes.** Wards, stone and water effects no longer wrap the token in Token Magic's large field bubble; they glow on the body instead. D&D wards and armour use a compact shield marker instead of JB2A's hex dome.
- **D&D conditions reviewed on a live scene:** Blinded, Invisible, Petrified, Prone, Paralyzed, Exhaustion, Grappled, Cursed, Charmed, Deafened and Incapacitated reworked to read clearly.
- **D&D spell areas.** Fog Cloud and Confusion (2024) fill their sphere instead of playing on the caster. A new Sunbeam (2024) fires along its line. The 2014 Sunbeam cast stays a mote in the caster's hand instead of a column of moonlight. Saves made inside an existing area (Cloudkill, Stinking Cloud, Web, Weird, Moonbeam's start-of-turn saves…) play only on the creature, not a fresh cast from the caster.
- **D&D official books.** With the Player's Handbook, Dungeon Master's Guide, Monster Manual or Heroes of the Borderlands modules active, their spells, features, weapons and items animate too. Book copies of SRD content use the SRD design (Evard's Black Tentacles, Bigby's Hand…). About 590 book-only entries (Toll the Dead, Arms of Hadar, smites, summons, Monster Manual attacks, DMG magic items) get their own compositions and appear in the D&D catalog marked PHB, DMG, MM or Borderlands. They appear only while that book module is active.
- **D&D save spells cast before targeting** (Sacred Flame, Toll the Dead) now play on their damage roll instead of being blocked.
- **Lasting areas stay on the map.** A spell area that lasts (a cloud, a wall, a web, darkness, a storm) keeps its animation looping on the template until the template is removed. Instant blasts and areas that only affect creatures when cast still play once. D&D 5e marks these spells in its catalog. In PF2e and SF2e, Animater decides when the spell is cast, from the spell's duration and what its name describes. Lasting wards show a circle on the ground instead of a dome.
- **Area spells that catch no one still play.** Casting Fear (or any area with creature reactions) at empty ground used to stop with "Target at least one token first"; the area now plays and only the reactions are skipped.
- **Foundry 14 templates passed by macros.** A MeasuredTemplate document handed to Animater now uses its Region's geometry; the template document's distance assumes a 100px grid and made cones and lines up to three times too long on larger grids.
- **Sunbeam reads as a 5-foot beam** instead of a thin thread, and Acid Splash (2024) bursts evenly across its sphere instead of splashing to one side.
- **Studio preview no longer stalls** on a sound stage without a volume.
- **JB2A warning.** When neither JB2A Free nor JB2A Patreon is active, the GM gets a notification on load and every Animater page shows a warning with a link to Setup. Built-in animations need one of them for their artwork.
- **D&D 5e / SF2e catalog styling.** Pagination, Reset filters, the Token motion / Sounds toggles, the volume readout and the quality badges now match the PF2e catalogs. Form controls keep Animater's font even when a game system restyles buttons and inputs.
- **Include from the catalog card.** When plug & play is off or set to picked entries, each card has a ✓ toggle that adds just that entry to plug & play (click again to remove it). While the whole catalog runs, cards show the ⊘ exclude toggle instead.
- **Sound volume sliders now apply everywhere.** Entries with a bespoke composition ignored the catalog volume and played at the 35% default: every PF2e action, plus about 1,000 D&D 5e and 350 SF2e activities. All of them now follow their catalog's slider.

## 0.2.1 (2026-10-08)

- **Exclude from the catalog card.** Every catalog card (spells, feats, actions, features, weapons, conditions, effects, and the D&D 5e / SF2e catalogs) has a ⊘ toggle on hover. It excludes that entry from plug & play without selecting it first; click again to include it. Excluded cards are dimmed and marked *Excluded*.

## 0.2.0 (2026-10-08)

### Recipe Studio
Opening a recipe fills the whole window, laid out like a video editor.
- **Monitor.** A large preview with play/pause, stop, go to start/end, loop and a time readout. Click or drag the ruler (or empty track space) to scrub; the monitor shows that exact moment.
- **FXMaster in the monitor.** Particle effects (bats, rain, embers…) play inside the preview, scaled to the preview grid, and follow scrubbing, pause and loop. Scene filters (bloom, fog…) still need Play at table.
- **Timeline.** Tracks for Caster, Flight, Target, Token motion, Sound and Filters & scene; stages that don't overlap share a row. Each track's **+** adds a stage at the playhead.
- **Editing clips.** Drag clips to move them; they snap to other clips and to the playhead (hold Alt to place freely). Drag a clip's right edge to trim it. Lines show what the selected clip starts with or after. Right-click for Start at playhead, Duplicate or Delete.
- **Mute / Solo.** Each track has **M** and **S**. Muted tracks (or every track but the soloed ones) are hidden and silent in the monitor, including token motion and Token Magic filters.
- **Inspector.** Shows only the selected stage. The Type choice offers the variants that fit its track (e.g. Target or Area). Visual assets show a small looping preview; sound stages have a volume slider and a listen player.
- **Recipe settings.** Trigger, item binding, description, category and accent open from the ⚙ trigger chip in the Studio bar (Esc closes). The bound item shows its name and icon; click it to open its sheet.
- **Shortcuts.** Space plays or pauses, Home/End jump, `,` `.` and the arrow keys step (Shift for larger steps), L loops, Ctrl+D duplicates, Delete removes, Ctrl+S saves, Ctrl+wheel zooms. Zoom, Fit and a help tooltip sit in the timeline's corner.
- **Layout.** The inspector's width and the timeline's height are adjustable and remembered per browser. The recipe library uses the full window width; **← Recipes** (or the Recipes nav item) returns to it.

### Choreography
- Stages have a **Start** choice: *After* (optional gap) or *With* another stage, or *At a set time*. Pick a specific stage to follow (e.g. stage 3 with stage 1); it stays attached when stages move. New stages follow the previous one; sounds and token motion start with it. Loops are refused.

### Workspace
- Local preview and Play at table check for a selected caster token first, instead of minimizing the window and failing quietly. The window minimizes while they run and restores afterwards (per-user setting).
- Catalog controls (Plug & play, Token motion, sounds) share one compact row on every catalog tab; their descriptions show on hover.
- Tooltips use Foundry's tooltip style.

### Installation
- Installing no longer offers JB2A Free when you use JB2A Patreon: the manifest no longer recommends a specific JB2A edition (install either one).

## 0.1.0 — prerelease (2026-10-08)

First public prerelease.

### Catalogs
- PF2e: 1,994 spells, 2,308 active feats, the native actions pack (Demoralize, Grapple, Raise a Shield, Rage…), class and ancestry features (Sneak Attack, Flurry of Blows, Glimpse of Redemption…), 1,013 weapons with melee/ranged/thrown uses, 43 conditions and 2,929 effects.
- SF2e: spells, feats, actions, features, weapons (including Area Fire and Auto-Fire), conditions and effects.
- D&D 5e (2014 and 2024 SRD): spells, features, weapons, activated items, statuses and effects.
- Every entry is matched to its own description, with bespoke compositions for thousands of entries combining JB2A footage, token motion, Token Magic FX and sound. Every animation resolves in both JB2A Free and Patreon.

### Playback
- Automatic playback from native chat cards, attack and damage rolls, placed areas and applied effects; per-entry enable, exclude and customize.
- Spells that offer a damage-type choice animate in the chosen element.
- Persistent effects and conditions follow the token while the native document is active. Afflictions read as debuffs; valued conditions (Frightened 1–4, Clumsy, Drained, Doomed…) grow with their value. Persistent damage shows its type.
- Cold area spells freeze the creatures they catch (Token Magic frost; Baileywiki's ice overlay when Nuts and Bolts and its Maps Premium Towns art are active).
- Cosmetic token motion: lunge, recoil, leap, charge, stagger, press, sink, throw, brace, cower, slam, drift and more.
- Optional sound from GGG, PSFX, SoundFx Library and PF2e Creature Sounds, falling back to whichever packs are installed.

### Settings and performance
- Per-device *Animation quality* (Full / Balanced / Low / Off); optional layers are only sent to viewers whose setting allows them.
- *Weapon effect size* (default 1.5×), and toggles for Token Magic FX and FXMaster enhancements.

### Integrations
- Automated Animations stands down for items Animater animates (items customized in Automated Animations stay with it).
- Spell Arsenal keeps its mapped area spells, with an opt-in to also play the Animater recipe.
- Trigger Engine node *Animater: Play animation*; `animater.preDispatch` / `animater.played` hooks; `api.resolve` and `api.handles`.

### Workspace
- Catalog pages with search and filters, full composed previews with stage highlights, private canvas previews, a recipe editor (stages, timing, tracks, motion, sound, overlays), a JB2A/Token Magic/sound media library, activity log and import/export.
