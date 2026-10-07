# PF2e spell sound audit

Built from PF2e 8.5.1 commit `563fd52708673ddd4f66c76921efbf6a938fffed`, using each complete native description plus the animation's delivery and motif. This is a semantic-rule audit, with specific exceptions reviewed individually; it is not a claim that thousands of clips were individually listened to.

| Installed library                  | Version | Audio files inventoried | Spells with fitting candidates |
| ---------------------------------- | ------- | ----------------------: | -----------------------------: |
| GGG: Sequencer Sound DB Collection | 0.2.1   |                   3,447 |                            856 |
| PSFX – Peri's Sound Effects        | 0.18.0  |                     439 |                            706 |
| SoundFx Library                    | 1.0.3   |                     167 |                             99 |
| PF2e Creature Sounds               | 2.0.0   |                   2,871 |                              1 |

Coverage overlaps. 880 of 1,994 entries have a fitting sound direction; 1,114 are intentionally quiet, ambiguous utility effects, player-chosen sounds, or missing descriptions. Three native entries have empty descriptions. The build inventories all four libraries, selects 262 distinct files across 61 semantic profiles, verifies every selected path, and probes playable duration. Paths and database keys are references to the installed packs, never redistributed audio.

The other four modules in the supplied screenshot contain no audio assets in their installed copies: Monk's Sound Enhancements, Soundboard & Soundpad (Moulinette), Soundbrett, and The Sound of Silence. They can manage other audio but are not asset sources for this catalog.

## Matching decisions

- Fireball: cast charge at the gathering stage; explosion at the detonation. Its area-only animation does not receive a projectile flight sound.
- Ray of Frost and Scorching Ray/Blazing Bolt: dedicated directional ray clips, not generic explosions.
- Admonishing Ray uses energy-ray audio instead of rocks inferred from bludgeoning damage. Moonbeam uses moonlight shimmer instead of fire inferred from damage. Polar Ray, divine/prismatic rays, dark rays and toxic-spore rays retain their described material and directional release.
- Chain Lightning: a quieter, maximum 550ms discharge on each ordered target hop. GGG's short electric zap is preferred over long thunder/weapon clips. Ordinary multi-target effects play one cue to avoid stacking identical sounds.
- Healing, cleansing, roots, stone/ice/fire walls, teleportation, time shifts and protective fields use separate families.
- Silence, subtle spells and private messages stay quiet. Ghost Sound/Sculpt Sound need the player's chosen sound; Ghost Sound explicitly disallows intricate music, so it receives no musical flourish.
- Roar of the Dragon can use dragon audio. Roaring Applause instead uses audience cheering. Form and summoning spells do not assume a chosen creature or play its injury/death cries.
- GGG's acid cast/impact categories contain poison-labelled files. Acid mappings use actual acid filenames; poison mappings use poison filenames.
- Looping ambience, guns, death/hurt cries and spoken incantations are excluded from automatic spell matching. Unknown effects do not receive arbitrary noise to inflate coverage.

Variant selection rotates deterministically within a vetted semantic family. PSFX is preferred when it has a corresponding spell cue; GGG supplies many material/form cues. Appropriate SoundFx and creature alternatives remain available when other packs are absent. Matching variants can still be shared by related spells; the CSV exposes these mappings.

## Playback and configuration

Catalog sounds default on at 35% volume when a fitting pack is active. The catalog toggle affects built-ins; saved customizations retain their own sound settings. Each detail view explains quiet/unavailable states and provides individual audio controls. The full editor preview uses the same start anchors and chain timing as canvas playback, with one-shot audio, fades and a 4.5-second maximum automatic cue. Existing manual cues keep user-configured duration.

Sound links reference stable stage IDs. A start link follows its parent start without inheriting the parent's duration; finish links retain existing behavior. Impact cues follow actual impact timing. Sounds are compiled through Sequencer alongside visuals, so local canvas previews remain local and table playback follows normal Sequencer synchronization. Stop cancels pending cues and ends only the current user's Animater sounds/effects.

Active module and database checks happen when recipes are built and before playback. Late database registration is recognized. PSFX's configured alternate location is resolved through registered keys. Saved native sound stages retain fallback candidates; disabling a pack chooses an available alternative or skips that cue while retaining visual stages. Editing a cue's file converts it to an independent custom sound.

## Rebuild and evidence

Run `node tools/build-spell-sounds.mjs` with the audited libraries installed and `ffprobe` available. Sources are cached by commit through the existing PF2e source collector. Generated files:

- `data/spell-sounds.mjs`: profile candidates and per-spell direction/rationale/description hash.
- `data/pf2e-spell-sounds.csv`: every spell, its rationale and candidates from each pack.
- `data/spell-sound-coverage.json`: source versions, inventory and coverage counts.

Regression checks cover all 1,994 recipes across six active-pack combinations, quiet exceptions, real file existence, relocation, late registration, pack removal, saved overrides, stage start/impact timing and chain hops. Native hook/API tests cover PF2e attacks, local sound previews and Stop. Browser QA uses real installed audio files; world settings and documents are untouched.
