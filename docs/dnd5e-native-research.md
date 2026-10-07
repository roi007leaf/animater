# Native D&D5e catalog research

Animater can build its D&D catalog from the installed system's public native documents, with separate legacy and modern activities. PF2e choreography and trigger assumptions must not be reused as D&D rules. This research changes source tooling and direction data only; it does not change a world, settings, documents, or UI.

## Source and coverage

Installed system: **D&D5e 6.0.5**, Foundry minimum **14.367**. Sources are pinned to official `release-6.0.5`, commit [`3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc`](https://github.com/foundryvtt/dnd5e/tree/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc). The complete, non-truncated official Git tree supplied **3,655 Item/ActiveEffect YAML documents from 16 public packs**. This is the public system/SRD corpus, not every published D&D book or every action embedded inside an Actor pack. The system ships SRD 5.1 and SRD 5.2 content, with legacy and modern packs. [Official system README](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/README.md), [system FAQ](https://github.com/foundryvtt/dnd5e/wiki/FAQ).

| Inventory | Native documents |
| --- | ---: |
| Spells | 659: 320 legacy, 339 modern |
| Features | 1,097 |
| Features with native activation or roll activity | 562 |
| Weapons, including native magical/natural variants | 484 |
| Other item types | 1,242 |
| Other items with native activation or roll activity | 566 |
| Registered native conditions/statuses | 44 |
| Standalone ActiveEffects | 173 |
| Embedded Item ActiveEffects | 1,294 |

Inventory classifications are data-driven candidates. A roll-bearing damage rider can be active without an activation cost; a utility with no activation can be passive. Embedded enchantment effects may target an Item rather than an Actor and must not automatically receive token auras. Final builder/runtime eligibility remains distinct from these source counts.

Public pack counts: `items` 872; `tradegoods` 23; `spells` 320; `backgrounds` 3; `classes` 12; `subclasses` 12; `classfeatures` 235; `races` 35; `monsterfeatures` 252; `classes24` 282; `origins24` 54; `feats24` 17; `spells24` 341; `equipment24` 633; `monsterfeatures24` 391; `effects` 173. The 341 documents in `spells24` include two feature helpers and 339 actual spells. Native IDs and variant pack identity are preserved, rather than deduplicating by name.

Local manifests also show Players Handbook 2.2.0, Dungeon Master's Guide 2.0.0, Monster Manual 1.4.0, and Heroes of the Borderlands 1.1.0. **Only their manifests were inspected. Their paid databases were not read, copied, or cached.** Licensed/private modules and user compendiums need runtime extensions or explicit user-owned recipes; this public catalog must not claim those books are covered.

System code uses MIT; SRD 5.1 and 5.2 text uses CC-BY-4.0. Preserve Wizards attribution and source links when publishing derived catalog descriptions. Referencing installed icon paths does not grant redistribution rights to icon files. [Official license](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/LICENSE.txt), [Wizards SRD licensing](https://www.dndbeyond.com/srd).

## Source loader contract

### Weapon preparation follow-up

A second read-only audit checked all **484 weapon documents**: **15** have a blank native category, **86** contain an attack missing its type value, and **152** contain an attack missing its classification. Native preparation derives missing attack types from the weapon category and otherwise defaults to melee; it does not automatically inherit a whole weapon definition from `baseItem`.

Thirteen blank-category documents are enchantment sources that require a chosen base weapon. The two other blank-category documents are Book of Shadows, which has no physical damage, and Conjured Flame Blade, which supplies explicit melee spell/fire semantics. These are different cases: a book should not acquire an invented physical Strike, while the conjured blade can retain its native attack. The catalog marks unresolved enchantment sources and the book placeholder manual, preserving the configured conjured blade.

For previews, a registered native base such as longbow can supply missing physical geometry/modes, with an explicit symbolic limit. Applied weapon enchantment provenance comes from active `isAppliedEnchantment` effects and their `system.origin.activity/item/profile`, not solely the chosen base weapon's compendium UUID. Copied rider activities receive new IDs and link through `flags.dnd5e.dependentOn`. Fully automatic identification and composition of every user-chosen enchanted base is not claimed by this catalog; customize the applied weapon for those combinations.

Native damage parts remain authoritative. Energy Bow's primary profile replaces piercing with force; Frost Brand adds cold; Sword of Wounding adds necrotic; Vicious preserves the existing damage material. Flame Tongue requires a separate activation, and Holy Avenger's zero-valued radiant marker denotes a conditional creature rider. A zero-valued part must not become an unconditional elemental finish. Missing bow geometry, physical contact audio anchors and these conditional-source distinctions received explicit regression coverage.

`tools/dnd5e-source.mjs` exports `DND5E_SOURCE_REF`, `DND5E_SOURCE_SHA`, `dnd5eSourceCache`, `descriptionText`, `sourceActivities`, `sourceEffects`, `effectiveActivity`, `hasNativeActivation`, `dnd5eConfiguration`, and async `dnd5eSources()`.

`dnd5eSources()` returns `{ref, sha, systemVersion, packs, rows, configuration, spells, features, weapons, items, conditions, standaloneEffects, embeddedEffects}`. Each row retains:

```js
{
  pack, path, blobSha, source, uuid, edition, sourceBook, sourceURL,
  description, activities, effectiveActivities, effects
}
```

`source` is untouched native JSON, including full description HTML, `_id`, activities, effect references, flags, properties, and system data. `activities` retains raw activity data; `effectiveActivities` resolves native parent Item inheritance. The plain `description` convenience field strips HTML/enrichers. Inline roll widgets and embedded references can contain facts absent from this plain field, so full reviews must inspect raw HTML and referenced public tables where necessary. Raw source is cached beneath `.cache/dnd5e-source/<sha>/rows.json`. `data/dnd5e-source-manifest.json` is the publishable compact provenance/inventory manifest, without the full cached source payload.

Activity `activation`, `duration`, `range`, and `target` generally inherit Item values. Native activity overrides, `overrideSet`, and activities listed in `flags.dnd5e.riders.activity` keep their own values. This matters for a lingering damage/save activity: inheriting a parent's spell area incorrectly can create another template or repeat its full cast. The loader mirrors the native merge order without modifying source data. Linked cast spells have additional dynamic inheritance in the prepared system runtime; prepared live Activities remain authoritative. [Native activity data](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/module/data/activity/base-activity.mjs).

Conditions are derived from native configuration and English localization, including encumbrance/bloodied configuration. Each preserves the native `statusId`, the generated ActiveEffect `_id`, and native rules JournalPage UUID when present. **21 of the 44 statuses have native rules prose; 23 have configuration only.** Those 23 are honestly marked `descriptionAvailable: false`. Do not invent rules descriptions. The native static effect ID is padded/truncated from `dnd5e` plus status ID; it is distinct from the status ID. Current native Journal links mostly resolve modern rules; legacy condition-rule differences need explicit edition policy. [Native configuration](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/module/config.mjs).

## Hooks and native playback provenance

The following signatures were checked against installed 6.0.5 compiled source and pinned official source. Listen to modern hooks once, avoiding simultaneous legacy-hook subscriptions that duplicate playback. [Official hooks documentation](https://github.com/foundryvtt/dnd5e/wiki/Hooks).

| Event | Native payload / implication |
| --- | --- |
| `dnd5e.postUseActivity` | `(activity, usageConfig, results)`. Activity is a native usage clone. `results` includes `effects`, `templates`, `updates`, and `message`; this runs before subsequent automatic attack/heal/damage rolling. |
| `dnd5e.rollAttackV2` | `(rolls, {subject: Activity, ammoUpdate})`. The concrete usage mode is in `rolls[0].options.attackMode`. |
| `dnd5e.rollDamageV2` | `(rolls, {subject: Activity})`. **Healing uses this same hook** through HealActivity; there is no separate `dnd5e.rollHealing` hook in installed 6.0.5. |
| `dnd5e.postCreateMeasuredTemplate` | `(activity, RegionDocument[])`. Despite the hook's historical name, current native placement creates Regions. |

Chat targets are in `results.message.system.targets` (or a pending message's `data.system.targets`), not `results.targets`. Target descriptors contain actor/token UUIDs plus presentation metadata. Message activity metadata includes native activity ID/type/UUID; Item metadata includes native Item UUID and `compendiumSource`. Capture target order and activity identity at the actual event; do not depend on later user selections. [Native activity use](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/module/documents/activity/mixin.mjs), [target descriptors](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/module/data/chat-message/fields/targets-field.mjs).

Weapon usage mode is not deduced from a weapon's properties alone. Actual `attackMode` may start with `thrown`, or equal `ranged`; the native `getActionType(mode)` converts otherwise-melee attacks accordingly. The last mode is also saved in `item.flags.dnd5e.last.<activityId>.attackMode`, but the current roll option is strongest evidence. Dagger, spear, handaxe, javelin, and trident therefore need separate contact and flight behavior. [Native attacks](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/module/documents/activity/attack.mjs).

HealActivity invokes shared damage rolling and marks the chat message as healing. Recognize `subject.type === 'heal'` in the modern damage hook; it should produce a heal recipe, not a damaging hit. Generic standalone rolls can have no valid Activity subject and must not be guessed into a catalog entry. [HealActivity](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/module/documents/activity/heal.mjs).

CastActivity calls the linked spell's own `Activity.use()`. Both parent and linked spell use hooks can fire. Play the spell's full payload once; a parent resource/caster cue can be separate. Cached linked spell metadata includes `_stats.compendiumSource` and `flags.dnd5e.cachedFor`, allowing native source identity to survive an owned/usage clone. [Native linked casting](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/module/documents/activity/cast.mjs).

## Templates and region geometry

New native Regions preserve `flags.dnd5e.activity`, `item`, `origin`, `spellLevel`, and `dimensions: {size, width, height, units}`. The `origin` is the usage Token UUID. Native `shapes[]` supplies the actual geometry, including wall panels; attachments can follow their token unless stationary. D&D converts native activity units to scene grid units, so previews must not assume feet or one fixed square size. Area playback should resolve this native Region, match its geometry, and avoid duplicating a cast that already animated on use. [Native template placement](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/module/canvas/template-placement.mjs).

For local preview, create only temporary native-compatible preview geometry and clean it up after the longest effect completes. For persistent real area art, a native Region lifecycle is distinct from Actor ActiveEffect lifecycle; an aura attached to an Actor and a placed wall cannot be cleaned up using the same owner blindly.

## Persistent conditions and effects

Use `Actor.appliedEffects` and native `effect.active`, rather than walking all embedded effect JSON. Foundry includes Actor effects and transferred owned-Item effects; D&D additionally limits applicable effect type. Core `active` means not disabled and not suppressed. Suppression includes native expiration, condition immunity, antimagic/magical state, source Item suppression, and dependent origin state. An enchantment effect with an Item target is not a token condition.

Native `effect.target`, `effect.origin`, and `effect.getSource()` identify the actual affected Actor and source. Origin may resolve to an Activity, Item, Actor, effect, or Region behavior; inspect the resolved activity's Item/compendium source before assuming all origins are Item UUIDs. Catalog persistent loops should exist only while the corresponding native applied status/effect exists and is active. Reconcile effect create/update/delete, relevant Actor/Item changes, world time, and combat turn transitions after native data preparation. [D&D ActiveEffect lifecycle](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/module/documents/active-effect.mjs), [Actor effect applicability](https://github.com/foundryvtt/dnd5e/blob/3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc/module/documents/actor/actor.mjs).

Do not expire art only because `duration.remaining <= 0`. D&D supports long/short rest expiry and source/target start/end turn expiry events, and native `isExpiryEvent` determines the boundary. Concentration cleanup removes dependent effects. Native suppression/active state, not an independent Animater timer, determines whether persistent condition/effect art remains. Core details were also checked against the installed Foundry14 `ActiveEffect` and `Actor` document implementations; no core files were edited.

## Full-description choreography review

`data/dnd5e-native-directions.json` contains **268 activity directions for 184 individually inspected native documents**: 179 had full native prose; five modern basic weapons had empty descriptions and were reviewed using native properties/activity data. Both modern Prismatic RollTables and the 21 available native condition descriptions were read. This is a targeted, substantial semantic review, **not a claim that every one of the 3,655 source rows received individual human-equivalent prose review**.

Each direction has native `uuid` and `activityId`; lookup key is `${uuid}::${activityId}`. `trigger`, `delivery`, `theme`, `origin`, `targeting`, optional `counts`/`colors`, and `followup` encode recommended semantics. `motion` contains semantic recommendations, not a promise that every named motion maps directly to an existing runtime motor. Map it to supported visual-only motions while letting native movement own real destinations. The generation tool pins the reviewed inventory and fails on source drift.

Representative findings:

| Native spell/action | Required choreography distinction |
| --- | --- |
| Chain Lightning | Caster → first target, then fan from first target to other targets; no PF2e sequential-hop rule. |
| Magic Missile | Three base darts, distributed across targets, arrive simultaneously; upcast changes total dart count. |
| Eldritch Blast / Scorching Ray | One visible ray per actual attack roll; do not launch every granted ray on each roll. |
| Disintegrate | Explicit green ray despite force damage; native outcome owns any actual destruction. |
| Chill Touch | Legacy remote skeletal hand; modern melee contact. |
| Lightning Bolt / Sunbeam | Actual line from source through region, not impact-only or multi-target missiles. |
| Prismatic Spray / Wall | Eight-ray cone versus seven-layer barrier; table/secondary saves only accent affected targets. |
| Acid Arrow / Heat Metal | Initial flight/heating differs from lingering/reheat/save followups; followups do not repeat launch. |
| Oil / Alchemist's Fire / Acid | Unlit oil coating, adhesive flame, and acid splash differ; save/attack method follows edition. |
| Conjure spells | 2014 independent creatures versus 2024 aura/spectral pack/elemental spirit, depending on exact spell. |
| Divine Smite / Sneak Attack / Hex damage | Accent the existing strike, not another whole attack. |
| Monk's Focus / Heightened Focus | Two versus three illustrative flurry beats; distinct guard and wind-step activities. |
| Teleport / movement grants | Native chosen teleport owns destination; Fly/Jump/Haste do not automatically move an actor. |
| Healing / cleanse | Heal pulses, touch healing, temporary protection, and poison removal remain distinct. |

The directions are original semantic recommendations, not copied Eskie macro code. Asset availability, fitting JB2A free/Patreon families, measured scaling, native sound selections, and rendered playback must still be audited by the catalog/runtime owners.

## Reproduction and validation

```powershell
rtk proxy node tools/dnd5e-source.mjs --inspect
rtk proxy node tools/build-dnd5e-native-directions.mjs
rtk proxy node --test tests/dnd5e-source.test.mjs tests/dnd5e-native-directions.test.mjs
```

Source inheritance/rider tests and direction regressions cover native parent inheritance, explicit overrides, inactive utility filtering, first-target lightning fan, simultaneous darts, single-roll rays, Chill Touch editions, target-only damage followups, unlit oil, thrown modes, linked-cast delegation, and Prismatic counts. These verify source/direction contracts; they do not substitute for native Foundry rendered integration tests.
