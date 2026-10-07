# Animater publication audit — 2026-10-07

**Not ready for Foundry's official listing.** Existing AI-authored prepared text remains in the runtime UI/catalogs. A release gate now blocks staging with incomplete provenance; that does not make the text compliant.

Internal development documentation, not package marketing or a compliance certificate. No submission, upload, release archive or maintainer attestation was made.

## Policy checked

[Official policy](https://foundryvtt.com/article/ai-policy/), revised March 18, 2026: human authorship is required for prepared text/UI (§4.1) and marketing (§4.5). AI-reviewed prose is insufficient. AI-assisted code/documentation is allowed with personal maintainer understanding (§4.4). External prepared media is covered (§1.1). This project cannot claim Zero AI (§6.6). New submissions must comply immediately (§2).

## Findings

| Surface | Workspace finding | Correction needed |
| --- | --- | --- |
| Spell, feat, weapon, condition/effect catalogs | Generated design explanations, notes, visual direction, treatment descriptions and custom stage labels are in runtime imports. | Remove optional explanations or obtain human-authored replacements. Preserve operational choreography separately. |
| Workspace/editor | AI-authored headings, buttons, help, status/error messages, accessibility labels and starter names are embedded in templates/JavaScript. | Human-write custom copy or use appropriately licensed human-written source strings. |
| Native game data | Copied native names and substantial source descriptions are present. These are not automatically AI-authored. | Verify per-source rights and preserve applicable notices. Do not rewrite legitimate source prose unnecessarily. |
| Manifest/README introduction | Former descriptions were generated during development. | Replaced both with a lightly edited version of the owner's original request and system-support reply. Source messages are recorded in `provenance.json`. Remaining README product prose still needs classification; technical software documentation is separate. |
| Package metadata | Author currently generic; release URLs absent. | Supply actual maintainer identity and source/manifest/download URLs. |
| Artwork/audio | No media files are bundled in the current runtime closure. Catalogs reference installed media and native icons. | Verify catalogued providers' human authorship and usage terms. Activation and familiar names do not establish provenance. |
| Source context | Native descriptions were read during earlier AI-assisted development. | Record rights applicable to material supplied, including reserved material. Public repository access alone is not evidence of unrestricted reuse. |
| Code/recipes | AI-assisted asset selection, timing, scale and token-motion configuration. | Maintainer must understand and maintain all shipped code. I treat executable choreography/configuration as software; Foundry has not reviewed that classification for Animater. |
| Licensing | No Animater license or third-party notice files. | Choose distribution terms and include required notices. A system's code license does not automatically cover game content or art. |

The native [D&D README](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/README.md#licenses) separates MIT software, CC BY 4.0 SRD text and separately licensed images. PF2e provides [OGL](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/static/licenses/OpenGameLicense.md) and [ORC notices](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/static/licenses/ORCLicense.md), alongside an [Apache software license](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/LICENSE). These identify evidence to review, not a certification that every copied field is redistributable.

## Description source

Human original: “i want to make an animation module that will use jb2a animations (supports free and patreon versions) and sequencer.” Human system reply: “PF2e + D&D 5e”.

Editorial result used in the manifest and README introduction:

> Animation module using JB2A animations (Free and Patreon) and Sequencer. PF2e + D&D 5e.

This uses human source wording with grammar/capitalization shortened. It does not disguise the previous generated description as human writing. Other text has not been declared human-authored.

## Inventory and commands

The current dependency closure contains **71 runtime files and zero bundled media files**. Read `audit.json` for current hashes, byte counts, external references and unresolved checks.

- `text-inventory.json`: exact distinct literal candidates and locations. Conservative scanner; includes software identifiers and native source values. **80,302 candidates does not mean 80,302 AI-written UI strings.**
- `ui-text-inventory.json`: narrower 1,547 UI/message candidates, still including code fragments and false positives.
- `text-authoring.csv`: writing worksheet. Replacement, author and evidence fields begin empty. JSON retains exact text; spreadsheet formula prefixes are escaped in CSV.
- `file-provenance-template.json`: current file hashes and pending origin slots.
- `provenance.json`: unresolved origins, asset/source rights, license and maintainer records. `humanMade: false` means **not verified here**, not an accusation about a provider.

```powershell
rtk proxy npm run audit:publication
rtk proxy npm run check:publication
rtk proxy npm run build:release
```

Audit/check return a nonzero exit code while blockers remain. Refreshing preserves the original writer worksheet and writes `text-authoring-current.csv`. Neither worksheet applies edits automatically: replacements must be deliberately applied to the source and tested.

Release staging checks provenance before creating `dist/animater`. It copies only the manifest's runtime dependency closure and declared license file, verifying hashes. Caches, tools, node modules, tests, previews, internal audits and screenshots are excluded. Existing `dist` is never removed or overwritten. Staging does not publish or create a release archive.

Validation: full suite passed 525 tests; after additional packaging edge cases, the publication suite passed 19 tests. Missing/stale origins, misleading AI-review records, description/evidence mismatches, dynamic execution, new media providers, bundled media, path escapes, worksheet preservation and blocked staging have regressions. Native gameplay behavior was not changed.

## Remaining human work

1. Remove optional generated catalog explanations rather than writing thousands of replacement blurbs, preserving animation behavior.
2. Obtain human custom UI/starter text. Do not classify merely reviewed AI text as human-authored.
3. Verify native source text and external asset/audio rights, preserving required notices. Add notices to the declared license file or extend the inclusion manifest for further notice files.
4. Apply source corrections, test behavior and refresh the inventory. Fill file-origin records against the new hashes. Origins describe prepared text; they do not claim the code was written without AI.
5. Personally review and learn the complete codebase. Attest understanding for the current digest only when true.
6. Supply real metadata/release URLs, pass the gate, inspect the staged package and seek Foundry package review. The gate cannot detect dishonest evidence or guarantee approval.
