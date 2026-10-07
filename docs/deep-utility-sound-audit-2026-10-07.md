# Utility sound follow-up — 2026-10-07

This follow-up covers the **66 individually reviewed utility spell designs** in `scripts/spell-utility-designs.mjs`. Their complete pinned PF2e descriptions were manually read in three untruncated batches. Native UUID references to conditions, actions and spells were checked separately so the text normalizer's omitted link labels did not hide a relevant rule. This is a defined manual subset; it does not claim manual reading or listening for all 1,994 spells.

Source: PF2e **8.5.1**, commit `563fd52708673ddd4f66c76921efbf6a938fffed`, [official spells](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/spells). Installed sound keys and exact filenames were read through `tools/sound-databases.mjs`; no audio was copied or redistributed.

| Spell | Previous decision | Reviewed decision and phase |
| --- | --- | --- |
| Fortify Summoning | Summoning arrival | `transform`: the body of the existing summoned creature is fortified; no new creature arrival or voice. |
| Healer's Blessing | Immediate healing | `bless`: a beneficial blessing for later healing; no current restoration or Hit Point gain. |
| Retrieving Hook | Quiet fallback | `objectWhoosh`: GGG General Throw A/B/C at hook-and-rope extension, with no metal chain, impact or save-result sound. |
| Pet Cache | Quiet fallback | `pocketTransition`: a finite spatial cue at the companion's pocket entrance, with no spell-end reappearance. |

The other **62 decisions are explicitly quiet**. These domains do not automatically gain noise from inherited theme metadata: eyesight/perception, thought and expertise, temporary vitality, bodily support or discomfort, food/clothing appearance, scent attraction/removal, small sigils, connections and uncertain object materials. The visible artwork illustrates a rule; it does not itself establish an audible event.

Liberating Command, Diabolic Edict, Discern Secrets and The Parrot's Whisper involve words or information, but no matching prerecorded speaker/content is inferred. The player or GM supplies speech. Watchdog's later alarm and ending teleport, Synchronize's later flashes, movement reactions and a successful Escape are not played during casting. Verminous Lure does not summon an audible animal swarm. Animate Rope and Tether do not necessarily use metallic chains. Quiet defaults remain customizable.

The new cues are finite illustrative options, rather than a claim that PF2e prescribes their exact timbre. Retrieving Hook uses neutral physical whoosh media instead of elemental ray or blade footage sounds. Pet Cache uses the same verified spatial media family as other departure effects but anchors to the target pocket formation; the ordinary caster-departure profile is a separate phase.

## Exact manual description subset

The 66 native slugs read for this follow-up are:

```text
allfood, animate-rope, ant-haul, anticipate-peril, beseech-the-sphinx,
blindness, bottomless-stomach, breadcrumbs, claim-curse, cleanse-cuisine,
clouded-focus, connective-current, cradle-aloft, days-weight, deafness,
decompose, diabolic-edict, discern-secrets, distracting-decoy,
elemental-betrayal, endure, familiars-face, fates-travels, floating-harness,
forced-quiet, fortify-summoning, friendly-push, gecko-grip, genies-veil,
groom-companion, healers-blessing, imprint-message, inertia-lock,
liberating-command, lock-item, magic-hide, mist-sight, negate-aroma,
nudge-fate, object-memory, object-reading, overstuff, painted-scout,
peaceful-rest, pet-cache, physical-boost, practice-makes-perfect,
quick-sort, rapid-adaptation, restyle, retrieving-hook, return-the-favor,
scramble-body, share-vision, sigil, sting-of-the-sea, synchronize,
synchronize-steps, tether, the-parrots-whisper, translate,
unbroken-panoply, unfetter-eidolon, verminous-lure, vision-of-weakness,
watchdog
```

## Validation

Four added regressions first failed, then passed: correct reinforcement/later-healing meanings, neutral hook/pocket cues, deliberate domain quiet reasons, and every one of the 62 quiet decisions surviving misleading inherited sonic/damage metadata. A generated-recipe integration test confirms hook audio follows actual travel and pocket departure follows the target entrance. The combined weapon/sound/semantic tests now pass **59 tests**. Production edits are limited to native sound decisions and two new sound profile definitions; generated catalogs are refreshed by the root audit workflow.

After coordinated regeneration, `tools/audit-weapon-sounds.mjs --probe-audio` rechecks source hashes, current sound decisions, exact paths, provider availability, phases and finite stage budget. Native file probing does not prove identical perceived loudness or constitute listening to every possible candidate.

## Separate shooting-star follow-up

Spray of Stars was read separately in full, including its fire-damage and save-dependent Dazzled durations; it is **one additional manual description**, outside the 66-spell utility subset. Its revised native cone sends seven small star objects outward before a faint dazzling film. Audio previously inferred a flame release from the fire damage and anchored it to the later dazzling film.

The `starFlight` decision now uses a finite light-particle shimmer at **Stars spread through cone**, the projectile release at **500 ms**. The installed GGG `magic.arcane.light.revealing` family provides Fantasy Fairy Dust 001–004; no generic flame blast, voice, impact or unrelated provider fallback is added. Without a fitting enabled pack, it stays quiet. Both regressions pass after regeneration: fire-damage semantic classification and actual generated release-phase timing. Combined focused validation now passes **61 tests**, including the utility cases above.
