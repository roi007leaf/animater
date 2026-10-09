# Changelog

## 0.3.3 (2026-10-09)

### New
- **Teleport spells really teleport.** When a teleport spell plays, whoever cast it clicks where to go.
  - A ring shows the spell's range, and a ghost of the token follows the mouse (red when out of range). Esc or right-click cancels.
  - The token vanishes in a misty step, jumps there without walking, and reappears.
  - It's the only Animater setting that actually moves a token.
  - **Spells:** on by default for PF2e Translocate, Dimension Door and Friendfetch (which brings the first target to a spot next to you), and D&D Misty Step, Thunder Step, Far Step and Dimension Door.
  - **Any recipe:** turn it on in the Studio's recipe settings: *Teleport* (the caster or the first target), a range in feet or the spell's own, and optionally *Next to the caster*. Or turn it off for a spell you'd rather move by hand.
  - **Moving someone else:** if a player moves a creature they don't own (an ally fetched to them), the GM's client moves it, but only if that player owns the caster on the same scene.
- **Animation button on item sheets (GM).** Spell, feat, action, feature, weapon, condition and effect sheets have an *Animation* button in their header (D&D 5e: in the header's ⋮ menu).
  - **Your own recipe:** if you made one for the item, it opens in the Studio.
  - **Otherwise:** the item's catalog entry opens, ready to preview or customize.

  Entries are found by the item's compendium source, so an NPC's *Slow (2/day)* opens *Slow* and a *+1 Flaming Kukri* opens *Kukri*.
- **Token motion switch for conditions and effects.** The condition and effect catalogs (PF2e, SF2e and D&D 5e) now have the *Token motion* switch the other catalogs have. Choose *Effects only* to keep the visuals without the creature trembling, swaying or lying down.

### Fixed
- **Condition animations no longer blink out when a turn passes.** When a condition's value changes, such as PF2e lowering Frightened 2 to 1 at the end of a turn, its animation used to end and then restart at the new strength, leaving a gap. The old animation now stays until the new one is playing.
- **Restrained no longer shows fog clouds.** Its web layer used the Web spell's 5×5 area footage, which looks like grey clouds around the token. It now uses a token-sized spider web.
- **Condition markers vanishing while a token is selected (PF2e Visioner users).** This is fixed in PF2e Visioner, not Animater. While you view through a selected token, Visioner lowered every lasting effect under token art, including markers attached to that token. Update PF2e Visioner once its fix is released.

## 0.3.2 (2026-10-09)

### Flash screens

- **New moment: Last enemy falls.** A during-combat flash screen can now play when the final enemy drops to 0 HP, or is marked defeated while it still has HP. It plays once per combat, so dropping to 0 and then being marked defeated doesn't play it twice. Before, nothing marked that moment: the combat's ending screen only plays when the combat is closed. Switch it on like any other moment: the On/Off switch under _During combat_, or the ⚙ panel in the Combat Tracker.
- **Finish Him! plays when the last enemy falls**, not when one enemy is left standing (that is still _Last One Standing_). If you already made a copy from the gallery, it still says _Last enemy standing_: open it, set _Plays at_ to _Last enemy falls_, save, and switch it on.

## 0.3.1 (2026-10-09)

### Updates from inside Foundry work again

Animater's update link pointed at GitHub's "latest" release, which never includes prereleases. So Foundry could never find an update, and each version had to be installed by hand with a new manifest.

A permanent _Update link_ release now always carries the newest manifest, and the release pipeline refreshes it with every version. Copies already installed (0.2.x, 0.3.0) find this update and every later one, with no reinstall.

### Conditions

- **Prone creatures lie down.**
  - A prone token falls onto its side (about 80°), sits a little lower, and gets back up smoothly when the condition ends or a preview finishes.
  - Before, Prone only drew a shadow and dust under the token, which barely showed.
  - Only the token's picture moves, on each screen; the token itself never moves.
  - An unconscious creature, which PF2e also makes prone, now lies down instead of only breathing.
  - Works in PF2e, SF2e and D&D 5e.
- **A better Blinded (PF2e, SF2e).** The black darkness disc that hid the whole token is gone. Now a dark blindfold of haze lies across the eyes, with a dim eye under it that keeps fading out, so you can still see who is blinded.
- **No darkness over unconscious creatures (PF2e, SF2e).** Unconscious automatically adds Blinded, whose animation covered the sleeping token and its sleep symbol. While a creature is Unconscious, the Blinded animation stays off. Blinded on its own still shows.
- **Concealed** is a lighter haze, so the token stays readable through it.
- **Restrained** adds a faint web over the chains, so it no longer looks the same as Grabbed.
- **Steadier body motions.** Condition body motions (trembling, swaying, lying down…) now move in step with Foundry's own drawing, so a token no longer flickers back to its natural pose for a frame when it is hovered, selected or updated.

### Flash screens

- **Finish Him!** A new ready-made screen in a fighting-game style. When one enemy is left standing:
  - the scene freezes dark;
  - a red burst and embers flare;
  - _FINISH HIM!_ slams in with a camera punch, a red flash and a shake.

  Find it in **+ New flash screen**, then switch it on under _During combat_. The text is yours to change, for example to _FINISH THEM!_.

## 0.3.0 (2026-10-09)

The big one: **flash screens**, full-screen title cards for your table, with their own editor. Also random variants, damage reactions and damage-typed knockouts.

### Flash screens

Full-screen title cards ("Roll for Initiative!", "Boss Battle", "Victory"…) that play on every player's screen at the moments you choose. They replace the short-lived _Combat moments_ option; Foundry already marks the current turn.

**When they play**

- **Combat start and end.** The Combat Tracker shows _Opening_ and _Ending_ menus for the current combat: a screen, _Random_ or _None_, plus ▶ to preview. PF2e HUD's tracker has the same menus behind a ⚡ button in its header. A combat that picks nothing uses the world default.
- **Off until you choose.** No screen plays by default. Set the defaults in the ⚙ panel of the tracker picker, or with _Use for_ on the screen's _Screen_ tab.
- **During combat.** Screens can play on a _new round_, a _critical hit_, an _enemy defeated_, the _last enemy standing_ or a _party member down_. Each is off until you switch it on, using the _On/Off_ switch on its card in the library or the tracker's ⚙ panel. A moment never interrupts a screen that is already showing.
- **Before an animation.** A recipe can show a flash screen right before it plays (Studio, ⚙ _Recipe settings_, _Flash screen first_). The animation starts as the screen fades. The screen shows only once the animation is sure to play, and _Stop_ cancels both.
- Only the active GM triggers screens, so each plays once for everyone. Players with Animation quality _Off_ don't see them. Playing music dips while a screen shows (per screen, on by default).

**The library**

- _Flash screens_ is its own page in the Animater menu, like Recipes.
  - Every screen is a card with a small live preview.
  - Cards are grouped into _Combat start_, _During combat_, _Combat end_ and _Before an animation_.
  - Import, Export and **+ New flash screen** are in the page header.
- **+ New flash screen** opens a gallery: start from a blank screen or a copy of any ready-made one.
- **Twelve ready-made screens:**
  - _Roll for Initiative!_, _Boss Battle_, _Face Off_ (party vs enemies) and _Ambush!_
  - _Signature Move_ and _Cut-in_ (before an animation)
  - _Next Round_, _Critical!_ and _Last One Standing_
  - _Victory_ and _Battle Over_
- **Share:** _Export_ saves every screen to a file; _Import_ adds screens from one.

**The editor**

- Opening a card takes you to the editor on its own page. Animater's menu shrinks to icons, like the recipe Studio. **←** (or the _Flash screens_ menu item) goes back to the library; unsaved changes are kept and marked •.
- **Layout:**
  - A one-row header: the name, _Plays at_, then undo, redo, duplicate, delete, revert and save.
  - A 16:9 stage.
  - A timeline with a seconds ruler.
  - An inspector with **Layer** and **Screen** tabs.
- **Quick tools.** The toolbar over the stage changes with the selected layer to offer its most used actions:
  - text: bold, italic, gradient, size, entrance;
  - images: choose a file, size, blend;
  - portraits: who, frame, names;
  - particles: type, direction, amount, speed;
  - sounds: move to the playhead, listen;
  - flash, shake and punch: move to the playhead, strength.

  Every layer on the stage also gets centre buttons and a keyframe button.

- **On the stage:**
  - drag a layer to move it;
  - the corner handle resizes it;
  - the round handle rotates it (_Shift_ snaps to 15°);
  - band edges stretch a band.

  The mouse wheel sets opacity, and _Shift_+wheel sets size. Layers snap to the centre and to each other with pink guide lines; hold _Alt_ to place freely.

- **On the timeline:**
  - drag a bar to move it in time;
  - drag its ends to trim it;
  - drag its shaded ends to set the entrance and exit;
  - drag ◆ to retime a keyframe;
  - drag the **yellow end of the ruler** to make the whole screen longer or shorter.

  Zoom with −, + and _Fit_ or Ctrl+wheel, and scroll with Shift+wheel. Click or drag the ruler to move the playhead.

- **Rows:** each has an icon for its kind of layer, 👁 to hide it while you edit, and **M**/**S** to mute or solo it in the editor's preview. Saved screens always play every layer.
- **Fields:** drag any number field's label to change it (_Shift_ faster, _Alt_ finer).
- **Preview** plays the screen in the editor, with the slider, clock and playhead following along. _Play for everyone_ shows it on every player's screen now.
- **Undo and redo** (Ctrl+Z, Ctrl+Shift+Z). You can also duplicate layers, and copy keyframes from one layer and paste them onto another.
- **Shortcuts:**
  - arrows nudge (_Shift_ ×10);
  - `[` `]` rotate;
  - `-` `=` resize;
  - `K` adds a keyframe;
  - Space plays;
  - `,` `.` step the playhead;
  - Tab picks the next layer;
  - Ctrl+D duplicates;
  - Delete removes.

  They only act while you work in the editor, so the map never moves.

- **?** lists every shortcut and the words that fill themselves in.
- **Show me:** guided walkthroughs (_A sliding title_, _A signature move_). A virtual mouse builds a screen on the real interface one step at a time, with _Next_, _Back_, ↺ replay and ✕. It all happens on a practice screen that is never saved.

**Layers**

- **Text:**
  - font, size, colour, outline, glow, bold, italic and spacing;
  - a two-colour _gradient_;
  - _letters_ or _words_ arriving one by one.
- **Image or video:** any file, or a JB2A key.
- **Portraits:** fill in from the encounter when the screen plays:
  - who: _the party_ (player-owned or friendly tokens), _the enemies_, _the boss_ (highest level or CR), _everyone_, or _the one using the action_;
  - token images or actor portraits;
  - framed as circles, rounded squares or a **Slash** cut-in;
  - optional names;
  - popping in one after another, in rows (_Per row_: 2 makes "2 above 2").

  Hidden combatants never appear. With no encounter, stand-ins show in the editor.

- **Colour band:** a slanted strip of colour behind a title.
- **Speed lines:** manga lines rushing to a point you place.
- **Light burst:** turning rays from behind.
- **Slash streak:** a bright cut across the screen.
- **Particles:** embers, sparks, snow, ash, petals or blood, with direction, amount, speed and size.
- **Moments:**
  - _Sound_ cues at exact times;
  - _Screen flash_;
  - _Screen shake_;
  - **Camera punch** (the whole card zooms in hard, then eases back).

**Animating layers**

- **Entrances and exits:**
  - fade;
  - slide (four ways);
  - zoom;
  - slam;
  - type on;
  - wipe;
  - blur;
  - _Outline, then fill_: the outline draws itself, then the colour pours in.
- **Keyframes:** add a ◆, move the playhead, then drag or resize the layer. It moves, scales, turns and fades smoothly between keyframes. A text's keyframes can also change its colour and glow.
- **Loop effects** while a layer shows, at a chosen speed:
  - pulse;
  - glow;
  - heartbeat;
  - glitch;
  - flicker;
  - wobble;
  - float;
  - spin.
- **Blend modes** on every layer: Screen, Add, Multiply, Overlay. _Screen_ or _Add_ hides the black around JB2A videos so they glow.

**The screen**

- **Backdrop:** a colour and darkness, dark edges, and _Cinematic bars_.
- **Animated background:** a JB2A loop (bad omen, fog, crimson or ember fog, storm, darkness, fireflies, sleet, runes, energy field) or any video.
- **A sound** for the whole screen.
- **Game scene behind it:** freeze the map and turn it grey, dark or sepia while the card shows. Each player's map comes back when the card ends.
- **Words that fill themselves in.** Text layers have chips to insert them.

  | Word       | Shows                        |
  | ---------- | ---------------------------- |
  | `{scene}`  | the scene name               |
  | `{round}`  | the round number             |
  | `{boss}`   | the strongest enemy          |
  | `{name}`   | who crit, fell or acted      |
  | `{action}` | the attack, spell or ability |

### Random variants

- A stage can have random variants: copies with their own asset, size and timing. Each play picks one, so repeated attacks don't look identical.
- To add one, select a stage in the Studio and click _🎲 Add a random variant_ under Type, then change the copy as you like.
- In the timeline, a group is one clip with numbered tabs on top (_1 2 3 +_). Click a number to edit that variant, or _+_ to add another.
- _Remove this variant_ in the stage panel deletes one.
- While you edit a variant, the others are hidden in the preview. Stages linked to a variant follow whichever one played.

### Damage reactions and knockouts

- **Damage reactions:** a token that takes energy damage flashes in that damage's look:
  - flames for fire;
  - an ice shard for cold;
  - crackle for electricity;
  - a splash for acid;
  - also poison, void/necrotic, vitality/radiant, force, mental/psychic, sonic/thunder and spirit.

  With Token Magic FX, the token's own artwork also burns, frosts, crackles or glows for a moment. Physical damage keeps its weapon animation only. Setting: _Damage reactions_ (on by default).

- **Damage-typed knockouts:** dropping to 0 HP still collapses the token, and now finishes in the look of the damage that did it: burned to ash, frozen and shattered, fried by lightning, dissolved in acid, or blasted apart by force. With Token Magic FX, the matching filter plays on the falling token. Physical damage keeps the plain collapse. Setting: _Damage-typed knockouts_ (on by default). Artwork missing from JB2A Free is skipped and never blocks the collapse.
- Both work in PF2e, SF2e and D&D 5e.

### Smaller changes

- **JB2A status is honest.** The sidebar dot used to turn green as soon as Sequencer was running, even when JB2A's animations weren't in Sequencer's database. It now stays grey in that case. The Setup card says "Active, but Sequencer has no JB2A animations · reload Foundry; if it stays, press F12 and look for JB2A errors".
- The tagline is now _Make every moment felt_.

## 0.2.7 (2026-10-08)

- **Your customized conditions and effects play with plug & play off.** A condition or effect you customized (or made yourself) now plays from your Recipes whenever Automatic playback is on, even if that catalog is paused. Spells, feats and weapons already worked this way. It doesn't play if you explicitly chose "Use animation" for the catalog version of that entry, or if you disable the recipe. Turning Automatic playback on or off updates lasting animations right away.
- **Leaner condition and effect catalog page.** The "Using catalog animation" box is gone (the Use / Customize buttons already show it), the Local canvas preview button has space above it, and "Loops while document active" now reads "Loops while it is on the token".
- **Recipes say when they can't play.**
  - **Same link:** when two enabled recipes are linked to the same item, condition or effect, the card that loses says "⚠ Not playing: “Spell Effect: Shield” is also linked to … and plays instead", and the winner says which recipe it overrides. The Studio header shows the warning too.
  - **Who wins:** a catalog copy beats a handmade lasting animation, a recipe bound to an item beats one matched by name, and otherwise the tie is broken by internal recipe ID.
  - **Not linked:** a recipe with a trigger but no names or item says "Not linked to anything yet" instead of looking ready to play.
- **Studio trigger chip text is centered.** "Attack rolled · fire bolt" now sits in the middle of its pill instead of near the top.
- **Studio buttons line up.** In a narrower window, "Save recipe" no longer wraps onto two lines and grows taller than Revert. The bar buttons share one height, and the recipe name shrinks instead.
- **New recipe asks what kind of animation you want.**
  - **Action animation:** plays once when something happens: a spell, an attack, damage, or an area.
  - **Lasting animation:** stays on a token while a condition or effect is on it, and stops when it is removed.
  - Each choice has a one-line explanation and an example. A lasting animation opens its Recipe settings so you can type the condition or effect name first.
  - Players, and worlds without condition support, go straight to an action animation.
- **Duplicating a lasting animation keeps it lasting** instead of turning it into a manual one.
- **Condition and effect recipes are marked as such.** Their recipe cards carry a teal "◷ Condition · stays while on token" (or Effect) badge. In the Studio, the trigger reads "Effect · while on token", so they no longer look like ordinary one-shot recipes.
- **Condition and effect layers always stay on the token.** A layer added to a condition or effect animation used to stay invisible until a hidden "keep" box was ticked. These layers now always last while the condition or effect is on the token. The one-choice Subject menu is gone, and a note explains that Duration only sets the preview length.
- **Tidier Studio stage panel.**
  - Target options (which targets, maximum targets, skip without targets, spread across targets, delay between targets) only show on stages that play on or toward targets, not on Caster, Area or screen stages.
  - Anchor X/Y show only after ticking "Override artwork anchor", and tint colour options only after ticking "Apply tint".
  - Remove stage is now a small bin next to the stage type, instead of hiding under Asset & visibility.
  - Plainer labels: "Restart every", "Stop clip at", "Play the clip once, no looping", "Recolor fully".
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

- **Exclude from the catalog card.** Every catalog card (spells, feats, actions, features, weapons, conditions, effects, and the D&D 5e / SF2e catalogs) has a ⊘ toggle on hover. It excludes that entry from plug & play without selecting it first; click again to include it. Excluded cards are dimmed and marked _Excluded_.

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

- Stages have a **Start** choice: _After_ (optional gap) or _With_ another stage, or _At a set time_. Pick a specific stage to follow (e.g. stage 3 with stage 1); it stays attached when stages move. New stages follow the previous one; sounds and token motion start with it. Loops are refused.

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

- Per-device _Animation quality_ (Full / Balanced / Low / Off); optional layers are only sent to viewers whose setting allows them.
- _Weapon effect size_ (default 1.5×), and toggles for Token Magic FX and FXMaster enhancements.

### Integrations

- Automated Animations stands down for items Animater animates (items customized in Automated Animations stay with it).
- Spell Arsenal keeps its mapped area spells, with an opt-in to also play the Animater recipe.
- Trigger Engine node _Animater: Play animation_; `animater.preDispatch` / `animater.played` hooks; `api.resolve` and `api.handles`.

### Workspace

- Catalog pages with search and filters, full composed previews with stage highlights, private canvas previews, a recipe editor (stages, timing, tracks, motion, sound, overlays), a JB2A/Token Magic/sound media library, activity log and import/export.
