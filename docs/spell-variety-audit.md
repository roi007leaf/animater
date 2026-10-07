# PF2e spell variety audit — 2026-10-06

User report: many spells look alike. Reproduced two selection failures and four utility-composition failures before changes.

## Confirmed causes

- Generic label words ("Arcane casting cue") leaked into semantic ranking. Free `arcane_hand` could beat intended ambience for unrelated spells. Hand footage now requires a concrete hand-family hint or explicit hand intent; generic labels no longer supply visual clues.
- A caster-role bonus overrode the first intentional thematic casting family. Plant spells selected a generic flash even when suitable leaves existed. First configured thematic casting material now receives sufficient priority; authored profiles and geometry gates still apply.
- Utility descriptions often became generic flashes, combat shields, scans, or mental impacts. Matching different spell fiction now selects explicit treatments and compositions.

## Reviewed scope

Read **38 complete descriptions** from pinned official PF2e 8.5.1 SHA `563fd52708673ddd4f66c76921efbf6a938fffed`: an initial 27-spell utility group plus 11 automatic-match checks. Slow already had an authored treatment. Added **26 authored treatments / 23 visual motifs** for:

- Message, Sending; Command; Suggestion, Charm.
- Silence, Sculpt Sound.
- Runic Weapon, Runic Body; Mystic Armor.
- Protection, Sanctuary, Spell Immunity, Resist Energy.
- Darkness, Light; Prestidigitation, Telekinetic Hand.
- Enfeeble, Infectious Enthusiasm; Organsight.
- Ghost Rush, Spirit Veil; Sudden Blight, Malignant Sustenance.
- Spontaneous Cartography.

Whispers use restrained arrival/reply waves; commands one stronger resonance; silence contracts and fades; sound editing bends into a second resonance. Weapon buffs inscribe without a caster lunge or a hit reaction. Armor wraps, sanctuary opens gently, protective wards close. Light uses a small hovering orb, darkness a placed globe, decay inward withering strands. Ghost Rush uses fading token copies while movement stays player controlled. Undead vigor uses void imagery rather than an attack or positive healing.

Guarded opening-led rules also recognize analogous communication, altered sound, runes, encouragement, sapped strength, spectral transformation, protection and illusion-haze descriptions. Save-result and heightened text is excluded. These automatic matches are not individually reviewed recipes.

The extra 11 full descriptions were Illusory Shroud, Song of Strength, Summon Healing Servitor, Lifelink Surge, Entreat Spirit, Inscrutable Mask, Necromancer's Generosity, Scrounger's Glee, Falsify Heat, Telepathic Demand and Timely Reminder. This review exposed overly broad encouragement and veil rules. Final rules preserve healing, threatening fear, incarnate and composition fiction, and only literal dreamy haze infers charm.

Organsight and Cartography remain explicitly symbolic: JB2A eyes/stars/runes do not depict organs or create a map. Resist Energy remains neutral until the chosen element is customized. Persistent lighting, object positions, buffs, saving throws and other rules state remain mechanical. No Eskie macro code copied.

## Validation

- **7 focused variety regressions**, all pass; six distinct reproduced failures preceded their fixes (the initial five-case run used a weaker hand fixture, then the real metadata pattern reproduced it). Seventh guards automatic matches against healing/fear/composition/veil errors found in full-description review.
- **36 related selector, semantics and choreography tests**, all pass.
- Full catalog regeneration, edition availability and geometry audits run by integrating agent after motion/scaling changes.

This is a scoped correction, not a claim that all 1,994 spells have bespoke animation art or individually reviewed choreography. Shared families remain appropriate where fiction matches; broad generic and repeated recipes still require further description-led work.

## Integrated catalog results

After final guarded rules and regeneration: 115 individually reviewed treatments, 106 motifs and 1,262 rendering configurations (previously 89 / 83 / 1,215). Timing and scale differences count as different configurations, not bespoke art. Generic motif entries fell from 1,300 to 1,271.

| Measured reuse                              | Before | After |
| ------------------------------------------- | -----: | ----: |
| Patreon generic purple caster flash, spells |  1,051 |   769 |
| Free generic yellow caster flash, spells    |  1,157 |   870 |
| Free giant hand, spells                     |    416 |     1 |
| Patreon selected canonical video keys       |    239 |   247 |
| Free selected canonical video keys          |    159 |   168 |

Both editions select 109 asset families. All 1,994 recipes / 6,852 expanded stages pass asset preflight; 5,997 base media stages have zero detected geometry violations. Complete integrated suite: 156 passing tests. See [quality audit](../data/pf2e-quality-audit.json) and [media audit](../data/pf2e-media-audit-after.json).
