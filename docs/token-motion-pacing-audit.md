# Token motion pacing audit

Scope: all native PF2e token motion defaults and six shared token pose functions. Canvas and recipe composition use the same pose function. No actor/token document fields, saved recipe settings, world settings, or user-selected durations are rewritten.

## Reproduced defects

Three regression tests failed before changes:

- Shake crammed five positional oscillations into every stage: a 380 ms shiver produced nine zero crossings (13.16 cycles/sec). All 313 native shakes exceeded 5.5 cycles/sec.
- Lunge, recoil, levitate, and pulse began/ended with nonzero velocity; a default lunge's sampled opening velocity was 109.96 px per normalized time unit.
- Fractional-intensity spin ended away from its initial visual angle, then snapped back. Intensity 0.3 produced a 1.883 rad (108 degree) last-frame reset.

## Corrections

- Shake cycles follow elapsed duration, capped at four cycles/sec and five total positional cycles. Rotation shares that cap with at most four total cycles. Fractional cycle counts retain a continuous resting pose.
- Squared-sine gesture envelopes preserve midpoint travel/scale and make endpoint velocity zero.
- Spin uses quintic easing and complete turns (intensity rounded to at least one full turn), so final restoration preserves visual angle without a fractional-angle snap. No native PF2e catalog stages currently use spin.
- Native catalog duration floors: shake 750 ms, recoil 650 ms, lunge 800 ms, pulse 900 ms, levitate/spin 1,400 ms. Existing longer defaults are retained. Lunge start advances to preserve its prior contact midpoint when timeline start permits; other reaction onsets remain fixed.
- The duration helper belongs only in native catalog generation. Saved/custom durations remain honored at playback, including a verified 100 ms user-selected motion.

## Measured catalog baseline and paced result

Baseline snapshot: 1,994 spells, 661 recipes with token motion, 678 motion stages. Applying pacing changes 434 durations; motion identity, subject, intensity, and distance remain unchanged.

| Motion   | Stages | Before duration | Paced duration | Changed durations |
| -------- | -----: | --------------- | -------------- | ----------------: |
| Shake    |    313 | 380–900 ms      | 750–900 ms     |               272 |
| Pulse    |    266 | 350–1,700 ms    | 900–1,700 ms   |                90 |
| Recoil   |     55 | 400–650 ms      | 650 ms         |                54 |
| Levitate |     27 | 550–2,100 ms    | 1,400–2,100 ms |                 1 |
| Lunge    |     17 | 500–550 ms      | 800 ms         |                17 |

These counts describe the catalog before concurrent animation-variety changes; final catalog counts can differ. Timing floors improve readability but are authored defaults, not assertions that every spell has a unique motion.

Integrated regeneration contains 653 motion recipes / 669 motion stages. No native stage falls below its new motion floor; all 310 shake stages run at at most 4 cycles/sec. Browser fixture confirms new 750ms starter shake and full-preview completion. Native presets and the new 800ms lunge action use the same pacing defaults; saved/custom timings stay unchanged. Only Haste's intentionally quick trails use accelerated native media (1.7×); other catalog footage uses normal playback speed. Full integrated suite: 156 passing tests. See [quality report](../data/pf2e-quality-audit.json).

## Verification

`node --test tests/motion.test.mjs tests/motion-pacing.test.mjs tests/recipe-preview.test.mjs`

Motion tests verify bounded shake rate, smooth boundaries, complete-turn spin settling, native timing, unchanged explicit playback duration, local mesh-only changes, stop/overlap restoration, hidden token suppression, and cancellation after native movement/rotation. Existing recipe preview tests verify shared pose playback and overlap behavior. Rendered/live visual validation is performed separately by the root agent; this audit does not claim browser or multiplayer verification.
