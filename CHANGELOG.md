# Changelog

## 0.1.1 — prerelease (2026-10-08)

- Installing no longer offers JB2A Free when you use JB2A Patreon: the manifest no longer recommends a specific JB2A edition (install either one).
- Stages have a **Start** choice: *After* (optional gap) or *With* another stage, or *At a set time*. Pick *Previous stage* to follow whatever comes before it, or a specific stage (e.g. stage 3 with stage 1), which it stays attached to when reordered. New stages follow the previous one; sounds and token motion start with it. Stages that start with their neighbour are chained in the timeline; loops are refused.
- The Animater window minimizes while Local preview or Play at table runs and restores afterwards (per-user setting).
- **Recipe Studio.** Opening a recipe now fills the whole window, laid out like a video editor:
  - **Monitor.** A large preview with play/pause, stop, go to start/end, loop and a time readout.
  - **Inspector.** The selected stage's settings sit on the right. Drag the divider to resize it.
  - **Timeline.** A multi-track timeline runs across the bottom, with tracks for Caster, Flight, Target, Token motion, Sound and Filters & scene. Stages that don't overlap share a row.
  - **Scrubbing.** Click or drag the ruler (or empty track space) to scrub; the monitor shows that exact moment.
  - **Editing clips.** Drag clips to move them; they snap to other clips and to the playhead (hold Alt to place freely). Drag a clip's right edge to trim it. Lines show what the selected clip starts with or after.
  - **Adding stages.** Each track's **+** adds a stage at the playhead.
  - **Right-click menu.** Start at playhead, duplicate after it, or delete.
  - **Shortcuts.** Space plays or pauses, Home/End jump, `,` `.` and the arrow keys step (Shift for larger steps), L loops, Ctrl+D duplicates, Delete removes, Ctrl+S saves. Ctrl+wheel or the slider zooms the timeline, and Fit resets the zoom.
  - **Layout.** The timeline's height and the inspector's width are remembered per browser.
  - **Mute / Solo.** Each track has **M** and **S** buttons. Muted tracks (or every track but the soloed ones) are hidden and silent in the monitor, so you can check one part of a recipe on its own.
- FXMaster particle effects (bats, rain, embers…) now play inside the recipe monitor, scaled to the preview grid, and follow scrubbing, pause and loop. Scene filters (bloom, fog…) still need Play at table.
- The bound item shows its name and icon; click it to open its sheet.
- Local preview and Play at table tell you to select a caster token before the window minimizes, instead of minimizing and failing quietly.
- Catalog controls (Plug & play, Token motion, sounds) are compact pills that share one row on every catalog tab; their descriptions show on hover.
- The recipe library uses the full window width; **← Recipes** (or the Recipes nav item) returns to it.

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
