# PF2e fear and mental animation variety review

Reviewed 2026-10-07. Full native descriptions read for **66 unique spell documents**: all **38 fear-theme entries**, **Fear the Sun**, **20 nearest mental/charm/confusion entries**, and **7 additional nightmare/phantasmal entries**. Source: public Foundry PF2e 8.5.1, pinned commit [563fd52708673ddd4f66c76921efbf6a938fffed](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells). Each linked name below resolves to its exact native JSON. Descriptions, targeting, traits, saves, heightened changes and delayed followups were read together; no external macro code copied.

## Finding and implementation scope

The reported repetition is real. Current generated Dread Secret, Fear, Fearful Feast, Friends to Foes and Hollow Heart use the same four-stage topology: **Plant dread → Dread blooms → Dark wisps → Fear tremor**. Those entries all select the same purple casting, bell and smoke families. Fear the Sun uses a generic purple bell composition. Exact composition counters under-report the practical similarity because metadata and parameter changes create different hashes.

New `scripts/spell-fear-designs.mjs` supplies **39 original authored treatments**: all 38 fear-theme entries plus Fear the Sun. Every treatment changes meaningful composition—recipient, material, origin/direction, spatial pattern, state preparation or followup timing. Integration, generated catalog, sound bindings and browser verification belong to the parent task. The other 27 reviewed neighbors receive directions in this report; their implementation is outside this file's scope.

Most private mental visions have no literal JB2A footage. Their public table art is explicitly **symbolic**. An icon is a narrative cue, not proof a native condition applied. Suggested palettes below are artistic choices unless prose specifies a material; violet is not mandated by the fear trait. Both Free and Patreon roots were inspected in `.cache/pf2e-variety-db.json`; geometry-compatible replacements remain available. Single-eye imagery may become several eyes in Free, and ancestor/hag/teeth/phantom art remains a labeled substitute.

## Presentation boundaries

- Native saves and effects own frightened, fleeing, stunned, paralyzed, confused, cursed, healing, death and expiry. Casting never fabricates those outcomes.
- Token motions are restrained, finite mesh gestures or translucent copies; restore the artwork. Never change token position, real footprint, HP, vision or document conditions.
- Private hallucinations and subtle spells should support subdued or local presentation. Their cosmetic table art does not enforce observer-specific perception or secrecy.
- Native burst/emanation footprints retain their actual area. A moving storm follows later Sustain events; no invented movement during the cast. Huge rituals use a labeled local vignette rather than a fabricated square-mile combat template.
- Preparations and contingencies show preparation only. Three-round harm is not compressed into one casting playback. Future strikes and reactions require their actual native event.
- Sound recommendations describe timbre and spatial origin, not invented licensed audio files. They should remain quiet enough to distinguish cues without repeating a loud generic scare on every spell.

## All fear-theme entries, plus the reported non-fear spell

| Native spell | Full-description distinction | Original choreography / palette / optional motion | Sound direction and limits |
|---|---|---|---|
| [Agonizing Despair][agonizing-despair] (legacy) | The mind falls into a deep well of painful dread; mental damage and fear depend on Will. | Target-centered descending vortex, sinking motes and dark depth. Slate/violet depth; one small sinking shudder. No caster missile. | A short descending hollow drone, not a musical dirge. |
| [Ancestral Touch][ancestral-touch] | Touch makes a living recipient experience the ancestors around the caster. | Spectral witnesses around caster → bounded touch gesture → contact handprint/witness circle on recipient. Bone-white and spectral blue. | Close contact whisper ensemble. No long ranged flight sound. |
| [Ancestral Winds][ancestral-winds] | Wailing ancestral storm occupies a 20-foot burst; later Sustain can move it. Living targets take void and mental damage. | Horizontal rotating wind field with ragged spiritual presences inside the actual area. Blue-grey wind; no rising individual stalkers. | Wind plus distant layered wails originating in the area. |
| [Belittling Boast][belittling-boast] (legacy) | A boast about a chosen attack or skill Demoralizes surrounding enemies and alters that activity's modifiers. | Caster herald crest rises, spoken wave reaches the native burst, confident speaker glint. Warm brass; small upright pulse. | Assertive spoken/percussive proclamation. No damage impact. |
| [Blistering Invective][blistering-invective] | Insults verbally burn a creature; persistent fire and frightened are save-dependent. | Sharp word/note near caster → small orange flames kindle on listener. Brief flinch; no fireball. Cast vignette stays finite. | Sharp spoken sizzle with a small flame crackle. Persistent loop only if a native effect exists. |
| [Canticle of Everlasting Grief][canticle-of-everlasting-grief] | Only the victim hears a melody of cherished losses; a curse can last a round, a week or indefinitely. | Private drooping notes near victim, sinking memory flecks. Silver-blue notes; no public area concert or guaranteed curse spread. | Soft mournful descending notes at the victim. Avoid full battlefield sonic blast. |
| [Crescent Scepter][crescent-scepter] | Held regalia resembles a feared institution's authority; later attackers save. | Bright crest beside the caster's held object and a short authority gleam. Customize real object position. | One polished regalia chime; no enemy scream on cast. |
| [Cutting Insult][cutting-insult] (legacy) | Spoken cruelty inflicts mental pain; bleed occurs only on failure. | Angular verbal score cuts across head-level space; sharp red edge. Claw footage is symbolic wording, not an actual claw strike. | A dry verbal snap and short cutting hiss. No unconditional blood splash. |
| [Deathly Scream][deathly-scream] | **A selected thrall** screams, damaging creatures in its 5-foot emanation. | Soundwave centered on the thrall with a spectral mouth impression. Caster receives only a prompting cue. | Spectral scream from the thrall. The current target-attached 2.8-square pulse is a symbolic area illustration, not exact rules geometry. |
| [Debilitating Terror][debilitating-terror] | Terrifying images disrupt attacks against the caster; **no frightened condition**. | Three fractured private images surround the recipient; focus shimmer fractures. No mandatory fear tremor or paralysis. | Brief dissonant fragments and a cut-off focus tone. |
| [Dirge of Doom][dirge-of-doom] | A musical composition maintains enemy frightened within the performer's emanation. | Low ground-level musical field and solemn flat notes across the full native area. No phantom assailants. | Low measured bass phrase from performer. Native effect controls duration. |
| [Dread Ambience][dread-ambience] | Two-day ritual makes a square-mile place unwelcoming for a year or more. | Local ritual seal → hostile leaf motion → low mist vignette. Desaturated green/grey; no attack on every creature. | Unwelcoming environmental rustle. Region ownership and huge footprint require manual scene staging. |
| [Dread Secret][dread-secret] | A spoken fundamental secret uses a **known numeric weakness or resistance**. Incorrect knowledge produces no effect. | Revelation rune opens at selected recipients; two defense-symbol halves part. Blue/gold insight. Chosen weakness material needs explicit input. | Close whisper and brittle seal fracture. Never invent the chosen element or damage amount. |
| [Fear][fear] | Simple planted fear; critical failure may make the victim flee. | Inward closing energy seed at victim → single lingering fear sign → small finite tremor. No projectile or mental damage. | One inward heartbeat/dread pulse. Never drive fleeing movement. |
| [Fear the Sun][fear-the-sun] | **Fortitude, not fear/mental**: light sensitivity, dazzled, conditional Light Blindness. | White/gold ocular glare → contracting eye ring; a brief light-sensitive flinch. No sun missile or fear skull. | Light glass shimmer and quiet sensory ring. Immediate blindness only if native result and bright light warrant it. |
| [Fearful Feast][fearful-feast] | Reaction to frightened: caster inhales the victim's bravery/hope; healing occurs only on failed saves and depends on actual damage. | Victim's warm flecks lift → **target-to-caster strand** → gathering at caster mouth. Small inhaling pulse. | An inward breath/siphon from victim toward caster. No unconditional healing cue. |
| [Friends to Foes][friends-to-foes] | Imagined betrayal by friends; fear lingers near allies, critical failure can confuse. | Friendly paired emblems around victim rotate into opposing blade shapes. Rose friendship turns threatening; no actual ally token attacks. | A paired friendly tone breaks into discord. Do not move the victim away from allies. |
| [Hollow Heart][hollow-heart] | Self-serving ambition severs trust; victim ceases treating anyone as ally. Fear appears only on critical failure. | Ambition crest over **victim** → heart contracts into hollow outline → connection stubs pull apart. No initial damage or fear shake. | A clear aspirational tone becomes hollow and isolated. |
| [Horrific Visage][horrific-visage] | Caster briefly shows a hag face to enemies in an emanation. | Hag-face/eye impression belongs to caster; a gaze wave reaches native area; disguise slips away. Symbolic face art. | One brief uncanny reveal sound from caster, not identical target impacts. |
| [Horrifying Blood Loss][horrifying-blood-loss] (legacy) | Curse magnifies fear of **existing bleeding**. Heightened witnesses need not themselves bleed. | Enlarged existing red blood-drop omen plus watching eyes. Witness staging separate; no new bleed. | Close heartbeat and a small wet reminder; no fresh wound slash. |
| [Hypnopompic Terrors][hypnopompic-terrors] (legacy) | Nightmare wave affects up to ten; asleep victims wake and save worse, with possible paralysis. | A horizontal breaker of dream fragments sweeps past several victims; eyes open after it. Distinct from one Waking Nightmare pane. | A staggered dream-breaker wash. No automatic awakening/paralysis pose. |
| [Impending Doom][impending-doom] (legacy) | Prediction develops over **three rounds**; damage comes at the end. | Three separated forecast markers and a doom seal announce future sequence. No attack, death or damage on cast. | Three quiet forecast ticks; actual later events should own later sounds. |
| [Implement of Destruction][implement-of-destruction] | Chosen enemy and **chosen weapon**, possibly held by a willing ally, are linked; future hits cause mental harm. | Weapon-fate declaration and enemy-linked omen. No swing, charge or damage. Real weapon/wielder anchoring requires explicit configuration. | A metallic fate-seal ring, with no weapon strike on cast. |
| [Invoke Spirits][invoke-spirits] | Ragged dead apparitions **rise and stalk** in a 10-foot burst; later Sustain moves the area. | Vertical rising silhouettes and stalking presences inside native footprint. Dark smoke/blue dead light; distinct from windstorm. | Ragged ground-rise and stalking whispers from the area. |
| [Lift Nature's Caul][lift-natures-caul] | Gauzy veil lifts from familiar surroundings; some beings are bolstered, others mentally afflicted. | Film peels up from native area → crooked alien contours and watchful shapes. No creature transformation or universal frightened. | Soft veil lift followed by uncanny environmental texture. |
| [Mask of Terror][mask-of-terror] | Protects a recipient with observer-specific frightening appearance; later attackers save. | Ambiguous layered mask **on the protected creature**, eyes and slight translucent mask afterimage. No single universally correct demon image. | Low protective mask shimmer. No enemy scream or failed-save impact at casting. |
| [Mind of Menace][mind-of-menace] | Ten-minute mental ward prepares Fight with Fear for up to 24 hours; using it ends the spell. | Caster mental ward → closing eye → waiting reaction seal. No distant target or reactive attack during cast. | A quiet seal-close sound. Reaction choreography needs its own actual event. |
| [Missed Cue][missed-cue] | Stage fright and forgotten words cause anguish and possible slowed while frightened. | Empty spotlight opens over target; prompt notes disappear at missed beats. A small quiver. No grief melody or boast crest. | Stumbled phrase followed by an awkward missing beat. |
| [Phantasmal Killer][phantasmal-killer] (legacy) | A private fearsome creature rushes at one living victim; death requires native critical/save outcomes. | External phantom outline rushes from beside victim → imaginary claws → dissolve. No physical summon or real death. | One rushing private assailant and near-contact sting. |
| [Scrounger's Glee][scroungers-glee] | Cruel canine laugh sustains fear. Later critical-Strike reaction heals **the striking ally**, not always caster. | Caster tooth glint → laughing notes near victim → scavenger omen. Teeth ivory; laughter airy/dark. | Canine laugh with a short scavenger rattle. Later heal omitted until eligible reaction. |
| [Shock and Awe][shock-and-awe] | Illusory battlefield cannon, bullets, arrows or magical salvos overwhelm senses; no real elemental damage. | Several separated salvo flashes and false impact smoke across the actual 50-foot area. Symbolic ammunition choice remains editable. | Staggered fake battlefield salvos. Avoid lightning crack merely because name contains “shock”. |
| [Spiral of Horrors][spiral-of-horrors] | Howling shades visibly whirl around caster's sustained emanation. | Broad rotating spiritual spiral and trailing wisps around full footprint. No low flat-note field. | Circling spectral howls from the aura. |
| [Teeth to Terror][teeth-to-terror] (legacy) | Hallucinated teeth fall, crawl, stab and choke; mental, not physical tooth removal. | Ivory fragments fall from jaw region, crawl inward and vanish. Claw art is a labeled tooth substitute. Brief jaw unease. | Small dry enamel skitters, not blood splatter or actual choking confirmation. |
| [Threatening Mimicry][threatening-mimicry] | Caster appears bigger/stronger with threatening natural features; footprint remains unchanged. | Larger translucent caster outline, antler/claw-like extensions, presence wave through native area. | Low growl/feature-extension texture from caster. No permanent token scale change. |
| [Unfathomable Song][unfathomable-song] | Unnatural notes trigger a variable condition table on repeated native saves. | Incompatible sharp/flat notes dislocate around selected recipients; sensory shimmer. No fixed fear result. | Off-grid discordant notes, distinct from mournful Canticle/Dirge. |
| [Unspeakable Shadow][unspeakable-shadow] (legacy) | **The victim's own shadow** becomes a devouring private monster. | Ground shadow gathers under victim, rises as dark tendril silhouette and reaches inward. No caster bolt. | Ground-adjacent shadow rustle and low devouring growl. Do not force attacks, flight or death. |
| [Vision of Death][vision-of-death] | Victim sees its **own death**, rather than an external attacking creature. | Private frame, death sign, translucent victim image collapses within it and fades. Real token remains visible. | A short fatal-vision swell and return. No literal token kill or hide. |
| [Waking Nightmare][waking-nightmare] | One terrifying vision; **no immediate damage**. Later Strikes add damage; sleeping failure can awaken/paralyze. | Single private nightmare pane near head opens then closes, uncanny eye residue. Small shudder. | One abrupt dream intrusion. Later Strike/resolution sounds separate. |
| [Weird][weird] (legacy) | Multiple personal phantom assailants attack many victims privately. | Encircling phantoms converge per victim simultaneously. Same legitimate assailant family as Phantasmal Killer, with multi-origin encirclement. | Multiple staggered private rushes, capped volume. No real summons or automatic death. |

## Twenty nearest mental/charm/confusion overlaps

These are individual directions after reading their complete descriptions. They are not newly implemented by `spell-fear-designs.mjs`.

| Native spell | Distinct choreography direction | Accuracy boundary / sound |
|---|---|---|
| [Charm][charm] | Soft honeyed speech motes and dreamlike haze over **caster's visage as perceived by victim**. Rose/gold. | Subtle presentation; no fixed attitude or control outcome. Soft conversational warmth. |
| [Charming Push][charming-push] | Open-palm arc bends an anger line aside rather than breaking focus with dark images. | Same save-result family as Debilitating Terror, different fiction. Smooth redirect sound; no guaranteed stun. |
| [Charming Touch][charming-touch] | Brief contact petal/handprint and close attraction haze. | Touch, attraction eligibility and attitude native. No ranged heart projectile. Quiet contact chime. |
| [Command][command] | Single strong spoken chevron/command sign near chosen recipient. | Chosen approach/run/release/prone/stand happens on native next turn, not casting. One clear vocal percussion. |
| [Commanding Lash][commanding-lash] | Recall the wound from the caster's **most recent damaging action**, then a sharp copper command thread. | No second weapon hit/new damage; needs known qualifying victim. Dry threatening command. |
| [Confusion][confusion] | Crossed directional paths and misaligned orbital arrows around head. | No automated random attacks/movement or fear skull. Several competing quiet impulses. |
| [Daze][daze] | One short head-level psychic tap and afterimage. | Nonlethal mental jolt; no guaranteed stun or vast dread cloud. A small rounded mental knock. |
| [Delusional Pride][delusional-pride] | Overlarge reflected crown/mirror around victim; fracture only after eligible failed effort. | Overconfidence, not lost ally identity; no guaranteed failure or frightened. Self-assured mirror tone. |
| [Dominate][dominate] | Taut indigo control filaments/mental brace after actual failed save. | Native orders and self-destructive limits; never force token movement. A precise binding tension. |
| [Evil Eye][evil-eye] | Baleful green eye glance from caster and greasy envious mark on victim. | Current remaster version causes **sickened**, not frightened. Low envious hiss; no legacy fear behavior inferred. |
| [Hallucination][hallucination] | Chosen perception overlay, lens misregistration or substituted object cue. | User chooses image; perception differs from belief. No mandatory horror or physical world replacement. Restrained perceptual shimmer. |
| [Hypnotize][hypnotize] | Hovering colored pattern cloud in native burst. | Area visual fascination/dazzled, not psychic missile. Low mesmerizing cyclic tones. |
| [Illusory Creature][illusory-creature] | Manifest **chosen visible creature** at selected location; later creature Strikes originate there. | Cast is manifestation only. No automatic fear attack, physical summon claim or actual HP reversal. Chosen creature timbre. |
| [Laughing Fit][laughing-fit] | Buoyant laugh ripples and bounded shoulder/bob impression. | Prone/no-actions only after actual critical failure; native body stays upright until rules decide. Laugh beats. |
| [Mind Games][mind-games] (legacy) | Alternating two-sided mental lattice duel between caster and victim. | Caster can be stunned on target critical success; wrong to always recoil victim. Back-and-forth pulses. |
| [Never Mind][never-mind] | Mental glyph constellation fragments and dims around head. | Stupefied/capability loss native; no animation changes PC ownership/type. Quiet thoughts fading. |
| [Paranoia][paranoia] | Many watchful directional eyes around victim, scanning every surrounding threat. | Everyone becomes suspect, unlike specific ally betrayal or self-serving ambition. Distrustful whispers from several directions. |
| [Roaring Applause][roaring-applause] | Performer flourish followed by paired clapping emblems/beats at recipients. | No reactions/slow/fascination depend on saves, not automatically forced movement. Applause distinct from laughter. |
| [Suggestion][suggestion] | Thin amber conversational thread and gently guiding sign. | Plausible, non-self-destructive advice; no shouted-command stomp or dominating chains. Honeyed low phrase. |
| [Synesthesia][synesthesia] | Sound ripples change into color ribbons; slight misaligned sensory afterimages. | Sensory rewiring, not actual physical blindness/invisibility. Cross-modal tones changing timbre. |

## Seven further nightmare/phantasmal overlaps

| Native spell | Distinct choreography direction | Accuracy boundary / sound |
|---|---|---|
| [Nightmare][nightmare] | Folded dream message departs caster as a **planetary deferred casting vignette**. Later eligible sleeping target gets dream intrusion. | Target need not be on canvas; next sleep owns save/fatigue/drained. No immediate attack. Quiet distant dream dispatch. |
| [Phantasmal Calamity][phantasmal-calamity] | Private cracked horizon/falling-city/fissure vision within actual 30-foot burst. | No actual scene destruction or terrain trap; additional critical-failure save/disbelief controls confinement. Apocalyptic vision rumble. |
| [Phantasmal Protagonist][phantasmal-protagonist] | Story-page/rune silhouette manifests at chosen unoccupied location; separate **hero / ally / villain** presentations. | Cast does not auto-Strike, grant HP or harry. Later phantom is performer; no generic fear tag for every villain. Storybook manifestation. |
| [Phantasmal Treasure][phantasmal-treasure] | Soft cherished outline at chosen location and victim eyeline lure. | Desire may be person/avatar/hero, not always coins. Never move victim automatically. Precious private glimmer. |
| [Recurring Nightmare][recurring-nightmare] | Ghostly thrall forms **at chosen thrall space**, with phasing halo; later native thrall movement/charge is performer. | No top-level fear trait, but thrall manifestation/movement can cause fear. No caster bolt; resummon only on eligible Sustain. Ghostly emergence. |
| [Shared Nightmare][shared-nightmare] | Mirrored two-way exchange of dream images between caster and target. | Save can confuse **caster** or target; don't always punish target. Swapped opposing dream tones. |
| [Visions of Danger][visions-of-danger] | Tiny chosen illusion swarm—fiendish insects, animated saws or another selected appearance—circulates in actual burst. | No mandatory spiders or physical wounds. Entry/start/disbelief owns later damage/immunity. Match insect buzz versus saw scrape to user's chosen appearance. |

## Legacy/remaster and honest family reuse

- Ten fear-theme rows in this pinned corpus are legacy: Agonizing Despair, Belittling Boast, Cutting Insult, Horrifying Blood Loss, Hypnopompic Terrors, Impending Doom, Phantasmal Killer, Teeth to Terror, Unspeakable Shadow and Weird. They remain separate native documents; don't silently overwrite their mechanics with a related remaster spell.
- **Phantasmal Killer / Vision of Death:** related death-and-fear family, different native imagery and resolution. External assailant versus one's own death vision merits different topology, regardless of remaster relationship.
- **Phantasmal Killer / Weird:** genuinely share private personal-assailant fiction. Reuse the family honestly, with single-side rush versus multi-side simultaneous encirclement. Recoloring alone is not new choreography.
- **Waking Nightmare / Hypnopompic Terrors / Nightmare / Shared Nightmare / Recurring Nightmare:** respectively one waking vision, multi-victim dream wave, deferred sleeping curse, bilateral mind exchange and an actual ghostly thrall. Shared names do not justify shared sequences.
- **Charming Push / Debilitating Terror:** closely matched native save results, different soft redirection versus frightening-image fiction. Their art can differ without inventing different rules.
- **Friends to Foes / Hollow Heart / Paranoia / Delusional Pride:** ally betrayal, self-serving isolation, suspicion of everyone and overconfidence. These need different symbols and origins despite overlapping mental debuffs.
- Current native `Fear` occurs once. `Hypnotic Pattern`, `Hideous Laughter` and `Feeblemind` are not separate spell documents in this pinned source. Do not fabricate additional catalog variants or claim old-name behavior from absent documents. No rename mapping was needed for this review.
- Current Evil Eye's complete prose says sickened. Legacy fear-version semantics must not leak into that current entry.

## Validation and remaining limits

- New module syntax passes Node.
- All 39 authored slugs resolve to native catalog entries; every pattern returns layers.
- Full live inventory resolver produced available used-stage media in **both Free and Patreon for all 39**. Explicit roots checked against the cached database; no invented JB2A roots remain.
- Structural check stripping labels, stage IDs, delays and durations found **zero identical layer signatures** among the 39. This is a regression aid, not proof of artistic quality; meaningful distinctions are the native fiction reviewed above.
- No new healing stage for Fearful Feast or Scrounger's Glee; no forced fleeing, token death, damage application or indefinite cast-time persistence.
- Area treatments preserve native fields through shared builder integration. Deathly Scream remains a target-attached symbolic pulse pending an explicit target-origin area adapter. Implement of Destruction's exact chosen weapon origin, huge ritual ownership, private-observer art, reaction followups and true save-conditional branches require additional native context; labels state these limits.
- Sound bindings and rendered Foundry playback have not been verified by this subagent. Suggested acoustic diversity is a followup design brief, not an implementation claim.

[agonizing-despair]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-3/agonizing-despair.json
[ancestral-touch]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/ancestral-touch.json
[ancestral-winds]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-5/ancestral-winds.json
[belittling-boast]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-5/belittling-boast.json
[blistering-invective]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/blistering-invective.json
[canticle-of-everlasting-grief]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-8/canticle-of-everlasting-grief.json
[crescent-scepter]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/crescent-scepter.json
[cutting-insult]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/cutting-insult.json
[deathly-scream]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/deathly-scream.json
[debilitating-terror]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/debilitating-terror.json
[dirge-of-doom]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/dirge-of-doom.json
[dread-ambience]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/rituals/dread-ambience.json
[dread-secret]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/dread-secret.json
[fear]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-1/fear.json
[fear-the-sun]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/fear-the-sun.json
[fearful-feast]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/fearful-feast.json
[friends-to-foes]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-4/friends-to-foes.json
[hollow-heart]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/hollow-heart.json
[horrific-visage]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/horrific-visage.json
[horrifying-blood-loss]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/horrifying-blood-loss.json
[hypnopompic-terrors]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-8/hypnopompic-terrors.json
[impending-doom]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-3/impending-doom.json
[implement-of-destruction]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-4/implement-of-destruction.json
[invoke-spirits]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-5/invoke-spirits.json
[lift-natures-caul]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/lift-natures-caul.json
[mask-of-terror]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-7/mask-of-terror.json
[mind-of-menace]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-3/mind-of-menace.json
[missed-cue]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-6/missed-cue.json
[phantasmal-killer]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-4/phantasmal-killer.json
[scroungers-glee]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/scroungers-glee.json
[shock-and-awe]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-5/shock-and-awe.json
[spiral-of-horrors]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/spiral-of-horrors.json
[teeth-to-terror]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/teeth-to-terror.json
[threatening-mimicry]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/threatening-mimicry.json
[unfathomable-song]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-9/unfathomable-song.json
[unspeakable-shadow]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-9/unspeakable-shadow.json
[vision-of-death]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-4/vision-of-death.json
[waking-nightmare]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/waking-nightmare.json
[weird]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-9/weird.json
[charm]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-1/charm.json
[charming-push]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/charming-push.json
[charming-touch]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/charming-touch.json
[command]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-1/command.json
[commanding-lash]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/commanding-lash.json
[confusion]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-4/confusion.json
[daze]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/cantrip/daze.json
[delusional-pride]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/delusional-pride.json
[dominate]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-6/dominate.json
[evil-eye]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/evil-eye.json
[hallucination]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-5/hallucination.json
[hypnotize]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-3/hypnotize.json
[illusory-creature]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/illusory-creature.json
[laughing-fit]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/laughing-fit.json
[mind-games]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/mind-games.json
[never-mind]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-6/never-mind.json
[paranoia]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/paranoia.json
[roaring-applause]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-3/roaring-applause.json
[suggestion]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-4/suggestion.json
[synesthesia]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-5/synesthesia.json
[nightmare]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-4/nightmare.json
[phantasmal-calamity]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-6/phantasmal-calamity.json
[phantasmal-protagonist]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-4/phantasmal-protagonist.json
[phantasmal-treasure]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/phantasmal-treasure.json
[recurring-nightmare]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/necromancer/recurring-nightmare.json
[shared-nightmare]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/focus/shared-nightmare.json
[visions-of-danger]: https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-7/visions-of-danger.json
