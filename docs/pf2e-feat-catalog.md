# PF2e active feat catalog

Pinned [PF2e pf2e-8.5.1](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feats), commit `563fd52708673ddd4f66c76921efbf6a938fffed`. 6,284 feat documents: **2,308 native active feats**, 3,976 passive parents excluded. Native actions/reactions/free actions only; no inferred passive activations.

## Full-description review

**2,308 complete active descriptions individually read.** Per-feat review data retains the source hash, supporting clauses, subject, current-activation approach, contacts, weapon, tempo, shape, finish and constraints. The review distinguishes this activation from later granted attacks, subsequent spells, conditional successes and optional modes. Reading coverage does not claim every recipe was watched on a live Foundry canvas.

The build rejects stale review hashes. Three parallel review areas plus early source review cover the full active catalog. Full HTML, readable description, Git blob and pinned source URL remain in generated records. Passive grants and ambiguous embedded activities stay excluded rather than manufacturing an activation.

## Visible variety

**2,308 distinct complete compositions.** Separate edition checks retain 2,308 Patreon and 2,308 Free effects-only compositions. Comparisons ignore IDs, names, labels, inactive tint, token motions and copies; timing/position/rotation values are quantized so trivial noise cannot establish variety.

Related feats retain shared visual vocabulary. Semantic treatments select current-activation choreography; 1352 colliding shared bases receive discrete ambient framing, footprint and entrance choices. These art choices are recorded separately from the description's mechanics. This establishes visible configuration differences, not 2,308 unrelated asset films or a guarantee that every pair looks wholly unrelated.

Double Slice plants the caster and crosses two opposing cuts with a 550ms gap. Twin Takedown uses a pursuit echo and alternating cuts with a 300ms gap. Both keep two contacts and full weapon footage. Mixed weapon feats preserve shot/melee ordering. Preparations stay at their source rather than attacking early. Aerial Boomerang's initial activation flies out and whirls at the endpoint; returning is a separate later action. Recovery does not heal a hostile Strike target.

Time Dilation Cascade retains six total Strikes. Triangle Shot launches three simultaneous arrows at one foe. Magnetic Pinions sends one fragment to each chosen foe, capped at three; targeting one foe does not triple its attacks. Ordered chaining inherits launch timing once, so contact arrives before the next hop. Target endpoint and maximum-target controls remain available in Customize.

## Activation and limits

Catalog starts disabled. **Use animation** enables one feat; **Use feat catalog** enables built-ins without saving custom recipes. Only this feat's own send-to-chat event activates it. Generic weapon Strikes, skills and passive acquisitions cannot identify feat use. Separate spell and feat automation settings remain independent. Customize for chosen weapons, elements, modes, companion origins, secondary allies and object placement.

All cues are finite and cosmetic. No TokenDocument movement, HP, resources, conditions or actor creation. Actual Strides, reactions, saves, hits and later abilities remain PF2e/player decisions. Source selection must identify the actual acting creature; companions are never invented. Walls, exact objects, cones and summons retain symbolic placement/art limits.

Ordinary token gestures retain a minimum 800ms, maximum 0.25-square displacement and maximum intensity 0.35. Eight individually directed movement feats now use bounded rush, leap, roll or lateral dodge paths, with readable 1.6–2.4-second base durations plus target-distance pacing. Sudden Charge rushes beside its first foe and holds for one Strike; Sudden Leap strikes in midair before landing; Flying Kick contacts at jump end; successful Tumbling Strike passes to the far side. Cartwheel Dodge, Defensive Roll, Skirmish Strike and Running Reload each have distinct path scale and cadence. All artwork returns to its original pose. See [expressive motion](expressive-token-motion.md) for controls, source evidence and limits.

“Destination reached” links synchronize contact with the arrival phase instead of the cosmetic return. Effects-only removes native motion and safely detaches those links at sample timing. Baked weapon/projectile clips retain measured complete duration at normal speed; media not available for probing remains reported as unverified footage timing.

## Assets and validation

Full JB2A inventory search: 7,648 Patreon / 1,351 Free keys. Localized geometry for source/contact/aura cues, directed geometry for flights. Actual selected use: 320 Patreon keys across 92 families; 192 Free keys across 98 families. Both editions plan all 2,308 recipes: 5,334 effects and 1,198 motion stages per edition; **0 plan/asset/geometry issues**. Edition fallbacks can approximate colors or artwork.

Audit: [JSON](../data/pf2e-feat-audit.json), [CSV](../data/pf2e-feat-audit.csv). Review datasets: early, martial, support and late `data/feat-*-review.mjs`. Rebuild: `rtk proxy node tools/build-pf2e-feat-catalog.mjs`. Tests include source coverage, hashes, native triggering, current-activation semantics, attack counts, edition-specific effects-only variety, framing and UI previews. Optional feat sounds remain quiet.
