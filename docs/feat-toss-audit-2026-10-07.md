# Toss feat corrections — 7 October 2026

Scope: the eight toss-related results shown in the reported PF2e catalog search. Each complete native description was read from the pinned PF2e 8.5.1 source, SHA `563fd52708673ddd4f66c76921efbf6a938fffed`. The JSON companion records source links, hashes, media, recipients and timing.

| Activity | Corrected choreography |
| --- | --- |
| Distracting Toss | Upward distraction marker, source release, one actual thrown weapon flight, contact, symbolic catch marker. Never throws the enemy. |
| Feral Toss | Head shake and horn/antler/tusk thrust. The success-branch push requires a confirmed hit; no automatic critical-distance or size assumption. |
| Friendly Fling | Horn scoop and piercing nick, low 20-foot willing-ally arc, upright landing. |
| Friendly Toss | Backward wind-up, forward heave, high 30-foot willing-ally arc, broad landing dust. |
| Jotun's Boost | Upright ally lift feeding into a flatter 25-foot boost. The two-hand 30-foot alternative remains configurable. |
| Rebounding Toss | One configurable thrown weapon travels source → first foe → second foe. The rebound requires the first hit; no third recipient or caster-to-each-friend launch. |
| Whirlwind Toss | Held-victim whirl, Thrash, one collateral contact per other selected adjacent foe, then an optional victim-only 10-foot throw. |
| Wind-Tossed Spell | Two source wind cues prepare the next spell. No immediate attack or recipient throw. |

The three ally activities genuinely throw allies in their native rules. They previously inherited the same command/music/glint graph with small arc variations. Their new phase graphs differ; generic motion and framing cannot overwrite them. Ally and held-victim roles are explicit: automatic playback skips unresolved roles, while manual preview uses the selected first recipient. Actual PF2e positioning, damage, reaction Strikes and prone remain native/manual.

Native JB2A thrown footage replaces arrows for the two weapon activities. Short airflow and dust effects support the physical gestures. Horn/natural-weapon footage and the airborne distraction/catch markers are visual approximations, not bespoke horn or juggling videos. Optional audio uses physical heave, thrown contact, natural piercing and wind cues rather than performance music. Conditional contact audio inherits its visual hit gate.

Validation: nine new behavioral regressions; complete suite **573 passed**, followed by 16 targeted sound/toss checks after selecting the creature-piercing recordings. Eight distinct effects-only signatures in both editions. Media completeness audit: zero cutoffs/early fades and all selected installed Patreon paths present. Free references were checked against official inventory and measurements; Free is not installed. Motion audit: zero issues. All eight browser previews completed, without console warnings/errors; results are in `data/feat-toss-browser-checks-2026-10-07.json`. Browser verification is a design preview, not a claim of live Foundry multiplayer testing.

Reload Foundry clients to load the new catalog recipes. Existing saved custom recipes keep their authored stages; they do not automatically become catalog defaults.
