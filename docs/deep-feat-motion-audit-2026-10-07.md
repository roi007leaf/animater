# Deep feat and shared token-motion audit — 2026-10-07

This pass checks every shipped active feat and every motion stage in the spell,
feat and weapon-mode catalogs. It also re-reads the complete descriptions of 175
named abilities, including **all 137 movement/flight designs that previously had
only stationary or vertical cues**. It does not claim that all 2,308 feats were
individually watched, nor that each has bespoke artwork.

## Sources and reproducible scope

- Official Foundry PF2e 8.5.1, pinned commit
  [`563fd52708673ddd4f66c76921efbf6a938fffed`](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats).
  The shipped corpus contains 2,308 active feats; 3,976 passive/grant-only or
  uncertain embedded activities remain excluded. Complete descriptions and their
  source URLs are retained. The audit checks each description against both stored
  SHA-256 provenance hashes, rather than reconstructing meaning from a name.
- Installed JB2A Patreon Sequencer database, 6,870 keys, and the
  [official JB2A Free database](https://github.com/Jules-Bens-Aa/JB2A_DnD5e/blob/main/scripts/jb2a_sequencer.js),
  1,351 keys. Inherited template metadata and actual radial/projectile geometry
  decide whether footage is suitable for a localized contact.
- `data/deep-feat-motion-audit-2026-10-07.json` records the complete re-read list,
  per-entry source links/hashes, movement classification, edition key selections,
  non-caster origins and sampled motion measurements. Run the audit after the final
  coordinated catalog rebuild; temporary snapshots in `.cache` are not release
  evidence.

For each edition, every feat is planned in three contexts: three selected victims,
unequal large rectangular tokens on a diagonal, and a distant target. This creates
6,924 plans per edition, 13,848 total, totaling 24,792 planned stages per edition.
The final feat snapshot selects 278 Patreon keys from 81 families, and 162 Free
keys from 87 families. Those are semantic selections from the entire inventory,
not a quota to use every color or unrelated film. Motion sampling covers all 2,308 feats,
1,994 spells and **all 1,122 weapon modes**, including secondary thrown/ranged
modes. Each resulting motion stage is sampled at 201 progress values in each
context. Checks include finite poses, neutral ending poses, geometry, asset
availability and required reviewed traversal. Pure pose sampling does not prove
rendered Foundry behavior; runtime restoration has separate tests, and rendered
media verification belongs to the coordinated main audit.

## Measured failures and repairs

| Failure before this pass | Resulting behavior |
| --- | --- |
| Double Shot and Hunted Shot inherited paired melee slashes. | Both use ranged launches. Double Shot distributes its two attacks across different selected targets; Hunted Shot keeps both on the first hunted prey. No melee lunge is added. |
| Generic feat lunges moved only 3.6px at grid size 100. | A default restrained lunge now reaches 12px. Explicit per-ability overrides remain authored choices. |
| Many actual Stride/Fly/Swim/Leap activities used only a pulse or tiny rise. | 111 additional description-classified route designs retain their existing effect art while adding visible traversal. Flight grants remain stationary. |
| Source flourish physical clips inherited generic growth/fade entrances. The main alpha audit found 26 affected feat peaks, at about 48% requested size. | Physical source films are tagged as one-shot before art direction: no generic fade/growth suppression, complete native footage, separate ambient direction when needed. |
| Almost all physical contact choices collapsed to generic slash/fist footage. | Native contact selection now distinguishes paired cuts, broad sweeps, thrusts, heavy swords, fists, claws and bludgeons. The audited snapshot selects 21 native Patreon contact keys and 11 Free keys. |
| Concurrent motions on one token canceled the earlier stage mid-pose. | Same-playback tracks compose deltas against one captured baseline; each track finishes independently. A new playback owner replaces the earlier session cleanly. |
| Token resize/texture changes could restore an obsolete mesh scale. | Geometry/texture changes cancel the old motion without restoring obsolete scale. Position, rotation, visibility, mesh replacement and changed destination also cancel safely. |
| A user-level stop could miss session-owned motions. | Exact-owner stop is default; explicit prefix stop covers that user's sessions and preserves other users' motions. |
| Directed default routes returned over 25% of total time after traveling outward over 45%. | Catalog defaults allocate 40% outbound, 20% hold, 40% reset. Bespoke held-contact profiles keep their explicit budgets. Saved/custom recipes are not silently rewritten. |
| Counted Steps/hops used a 120–200ms repeat start interval over 1.4–2.2s poses, stacking rather than taking distinct Steps. | Each repeated path finishes before its next begins: start interval equals duration plus the authored gap. Hopping Stride has three low 2.2s arcs, separately tested near/far/without a target. |

Native contact color choice follows the reviewed element and weapon. It never
cycles colors by name/ID merely to raise asset counts. Free may need a different
weapon family or hue where matching footage does not exist; those substitutions
remain approximations.

## Movement descriptions: all 137 previously stationary designs reviewed

The explicit classification lives in `scripts/feat-traversal.mjs`.

| Classification | Count | Treatment |
| --- | ---: | --- |
| Single-body traversal | 91 | Description-specific sprint, pursuit, retreat, Step, shallow Fly, glide, leap, roll, dive or throw sample. |
| Joint route | 8 | Source plus one explicitly selected partner receive parallel sample poses. Independent vectors no longer send them in opposite directions. |
| Alternate performer | 12 | A sample route is available, but the actual mount, eidolon, horde, mortar or vehicle must be chosen as source; no guessed actor lookup. |
| Movement-mode grant | 7 | Finite stationary manifestation; no action has moved the recipient yet. |
| Local pose/attempt | 14 | Stand, hang, hover, vertical-only movement, a distracting gesture or an Escape attempt; no invented lateral route. |
| Explicit action choice | 4 | Stationary/alternative branches retained honestly; configure a resolved movement branch when appropriate. |
| Existing area relocation | 1 | Shift Spell moves an existing effect's area, not a token. A finite cue does not pretend to locate/move the original template. |

The remaining 26 stationary designs are thus **classified**, not overlooked
traversal activities. For example, Divine Wings, Arcane Propulsion, Cyclonic Ascent
and Propulsive Leap grant a movement mode. Evanescent Wings, Benefactor's Wings,
Fledgling Flight and Take Wing explicitly use Fly and now show short wing-assisted
transit. One-Toed Hop and Float Free are vertical-only; a lateral charge would
misrepresent them. Switcheroo's opposed two-body swap cannot safely assume a
successful outcome or adjacent footprint mapping, so its attempt cue remains local.

The separately directed profile table has 29 hand-directed activities, including:

- Sudden Charge: source approach, held destination, exactly one Strike.
- Sudden Leap/Flying Kick: actual arc and one described airborne/end-of-jump contact.
- Dashing Pounce: leap into exactly two same-foe claw contacts, separated by 550ms.
- Doctor's Visitation: approach the selected patient, then finite care cue; no attack
  or guaranteed HP restoration.
- Running Reload/Nightwave Springing Reload: movement then a source reload glint;
  no gunshot or damaging projectile is invented.
- Elf Step/Wing Step/Guarded Advance: counted short movement cues rather than a long
  charge. Knight Vigilant's Guarded Advance uses one Step, Guardian's uses two.
- Incredible Sprint/Furious Sprint/Marine Jet: sustained level motion with readable
  departures, rather than a short pulse. Artistic echoes are not action counters.
- Hit the Dirt!/Roll with It: a finite prone silhouette makes the ending visible.
  Cosmetic restoration is not a Stand action and does not remove native prone.

Lightning Dash and Lava Leap now have dedicated topology. Lightning Dash has a body
transit and selected traversal shocks rather than outgoing rays. Lava Leap has a
molten takeoff, an arc, selected landing contacts and a cooled protective cue.
Tramples contact each selected victim once. Source/ally water and leadership
activities now include both relevant poses. Swan Dive shows dive then Swim; Light
Paws shows Stride then Step; forced throws travel away from the source rather than
back toward it.

## Shared runtime and pacing verification

`combineMotionPoses(poses)` sums local translation/rotation and multiplies scales.
`TokenMotionPlayer` stores one mesh baseline plus independent tracks for one owner.
Changing a real token's position/rotation/size/texture, hiding it, replacing its mesh,
or changing a tracked destination cancels the cosmetic track without overwriting
the real change. Neither playback nor restoration writes TokenDocument fields.

The headings `toward`, `away`, `up`, `down`, `left` and `right` are explicit artwork
directions. Fixed map-axis routes are useful for paired silhouettes and vertical
illustrations in a top-down scene; they do not change actual elevation or place a
token in a legal destination. Parent integration normalizes/presents these controls
and uses per-playback owner IDs, with user-prefix cleanup.

The sampled report records peak translation speed rather than inventing a universal
speed cutoff. The far-context spell audit identified Blink Charge and Dimensional
Assault at about 39 squares/second; the spell audit reduced their cosmetic slide to a
readable distance-paced transition. Teleport premise alone did not justify an
unreadable slide. Gesture pacing, source/endpoint cancellation, same-owner overlap,
cross-user isolation and route geometry have direct regressions.

## Variety and limitations

There are still shared motifs, physical contact families and ambient cues. Exact
configuration hashes overstate visible uniqueness; coarse visible signatures also
retain framing, tracks, offsets, mirror, motion heading and timing. Neither metric
equals a count of bespoke artwork. The main catalog audit reports both meaningful
compositions and broad family/topology groups. This pass improves semantic selection
and visible route topology without adding imperceptible jitter or synthetic ID-based
differences.

The catalog describes cosmetic performances. It does not resolve checks, saves,
hit/miss, critical branches, conditions, damage, ammunition, resource expenditure,
real movement, Mount state or initiative. Exact historical movement paths and
multi-actor optional branches remain manual. The audit separately records 24
reviewed non-caster origins from the wider feat dataset; additional mount/vehicle
activities now carry explicit performer notes in their route classification.

Selected victim contacts approximate traversed lines and landing emanations. In
particular, Lightning Dash does not place/move a 30-foot line, Lava Leap does not
place a 10-foot emanation at a cosmetic mesh endpoint, and tramples do not compute
the legal walked route or creature-size eligibility. A cosmetic reset restores
artwork; it does not depict another legal Stride. Native film alpha peaks/contact
metadata are timing proxies, not proofs of a blade collision on a specific video
frame. Sounds were audited by the separate weapon/sound audit; this report does not
claim independent listening review.

## Validation commands

Run after all coordinated factories and sound choices are final:

```powershell
rtk proxy node tools/build-pf2e-feat-catalog.mjs --reuse-media
rtk proxy node tools/audit-deep-feat-motion.mjs
rtk proxy node --test tests/feat-catalog.test.mjs tests/feat-variety.test.mjs tests/deep-feat-audit.test.mjs tests/feat-native-assets.test.mjs tests/path-motion.test.mjs tests/motion.test.mjs tests/motion-pacing.test.mjs
```

Final coordinated feat rebuild: selection revision 5, 545 timing keys measured,
zero missing timings and zero builder issues. Targeted tests: **79/79 pass**, including
whole-catalog generated hashes/variety and focused runtime/direction regressions.
The new auditor adapts synthetic areas to each spell's native shape, so cone fans
are tested with an actual cone context rather than an unrelated circle fixture.
The final machine audit reports zero missing assets, localized geometry violations,
non-finite poses, non-neutral endings, under-paced paths, overlapping repeated paths
or unreviewed stationary traversal, across the stated three-context coverage.
Rendered native media and connected-client checks are reported separately by the
main audit.
