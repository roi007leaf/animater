# Weapon and active-feat sounds

Feat catalog sound settings existed, but feat recipe generation never inserted sound stages. Fixed in catalog generation, automatic cards, manual API playback and full previews. Existing saved custom recipes retain their authored audio choices.

Full source descriptions and reviewed feat choreography inform audio rules. **687 of 2,308 active feats** receive an optional sound design; **1,621 stay quiet** when the description is silent, the action depends on a player-chosen weapon, or audio would imply an unperformed effect. Double Slice attaches separate blade cues to its two contacts. Quiet/subtle activities avoid public audio. Battle Medicine avoids magical healing tones; Running Reload avoids inventing a firearm. Unspecified mixed/ranged weapons use neutral release cues.

All **1,122 native weapon uses** have an audio design. Melee uses contact cues; ranged and thrown uses release plus available contact cues. Bow, crossbow, sling, firearm, blowgun, dagger, spear, staff, axe, blunt weapons and unarmed attacks use matching profiles. Elemental bomb contact uses its base damage profile. Audio follows linked visual starts, including repeated attacks; shorter sound files do not change attack cadence. Variants are selected deterministically within fitting profiles.

## Packs and UI

Detect active **GGG: Sequencer Sound DB Collection**, **PSFX**, **SoundFx Library** and **PF2e Creature Sounds** through existing installed pack references. Each catalog has separate sound toggle and volume, default 35%. **Sound design** explains the decision, lists available cues and provides **Listen**/native audio controls. **Preview recipe** includes synchronized audio and stage highlights. **Customize** copies editable sound stages; files, volume and timing can be changed.

Coverage depends on active libraries. GGG supplies the broadest physical weapon selection; some profiles have PSFX or SoundFx alternatives. Creature voices remain subject to species certainty. Monk's enhancements, Soundboard/Soundpad, Soundbrett and Sound of Silence are managers rather than a reliable shared spell/weapon library; enabling them alone cannot supply these cues.

Optional packs are not dependencies. Missing/deactivated packs skip optional audio while visuals keep their timing. Registration can arrive late; resolution rechecks availability. Stopping an animation stops its sound. Cosmetic audio resolves no actions, attacks, damage or resources.

## Evidence

[Audit JSON](../data/pf2e-ability-sound-audit.json) records a decision and description hash for every active feat and weapon use. New physical profiles probe 131 selected audio files for existence and finite duration; elemental designs reuse the already audited spell sound profiles. Pack inventory: 3,447 GGG, 439 PSFX, 167 SoundFx Library and 2,871 Creature Sounds files. No missing profile candidates in the installed audit. Counts describe available designs, not simultaneous playback or universal coverage from one enabled pack.

Regression coverage includes paired contacts, repeat cadence, source hashes, quiet activities, late registration, missing-pack fallback, UI toggles/volume, native feat cards, native weapon alternate usages and private preview routing. Browser verification covers loaded audio, synchronized release/highlights and full preview completion. Live multiplayer weapon/audio replication remains unverified.

Rebuild with `rtk proxy node tools/build-ability-sounds.mjs` after rebuilding the pinned feat/weapon datasets. It inventories supported installed packs, validates candidate paths and probes audio before writing metadata. No sound media is bundled.
