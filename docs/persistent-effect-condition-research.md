# PF2e persistent condition and effect visuals

Research date: 2026-10-07. Installed PF2e **8.5.1**, Sequencer **4.2.3**. PF2e source pinned to **563fd52708673ddd4f66c76921efbf6a938fffed**. Findings verified against installed bundles and corresponding primary source; recommendations below distinguish native mechanics from cosmetic rendering.

## Catalog scope

Counts are standalone JSON Item documents in pinned native packs, excluding `_folders.json`. They do not count actor-embedded NPC effects or custom world effects.

| Native source pack | Condition documents | Effect documents | Other documents |
|---|---:|---:|---:|
| conditions | 43 | 0 | 0 |
| spell-effects | 0 | 545 | 0 |
| equipment-effects | 0 | 721 | 0 |
| feat-effects | 0 | 853 | 0 |
| bestiary-effects | 0 | 682 | 0 |
| other-effects | 0 | 53 | 0 |
| campaign-effects | 1 | 68 | 7 feats |
| boons-and-curses | 0 | 7 | 240 feats |
| **Total reviewed packs** | **44** | **2,929** | **247 feats** |

Equipment plus spell effects alone: **1,266**. Conditions catalog core: **43**. Full effect-pack coverage can include all **2,929** effects without treating passive feats as effect documents. Source pack `conditions` maps to runtime compendium **`pf2e.conditionitems`**, verified in installed `system.json:1129`; remaining named effect packs retain their names. Inspect document `type`, not filename or pack title. [PF2e pack manifest](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/system.pf2e.json), [pinned PF2e compendium sources](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e)

Extracted research cache: `.cache/persistent-research/pf2e-563fd52708673ddd4f66c76921efbf6a938fffed`; inventory: `.cache/persistent-research/inventory.json`. Counts include separate boon probe.

## Native lifecycle

Use **`condition.active`**, a prepared Boolean. PF2e retains overridden or lesser duplicate condition Items but marks them inactive and ignores their rules. Displaying every condition Item would produce contradictory stacked visuals: Blinded suppresses Dazzled; Restrained suppresses Grabbed. Persistent Damage condition `key` adds damage type, so fire and bleed are separate active instances. A condition value change can switch which duplicate is active. Reconcile whole actor after any related Item change. [ConditionPF2e](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/module/item/condition/document.ts#L173-L284)

**`actor.conditions.active` includes stored and in-memory conditions.** `actor.itemTypes.condition` covers stored Items only. Temporary conditions can come from native rules; losing their granter can remove them without `deleteItem` for that condition. Condition `appliedBy` resolves `system.references.parent.id`, then `flags.pf2e.grantedBy.id`, through actor Items or actor conditions. Traverse granters with a visited-ID guard until a stored Item is found; tie to that stored document, not an unresolvable in-memory UUID. Reconciliation remains final authority. [ActorConditions](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/module/actor/conditions.ts), [Item provenance](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/module/item/base/document.ts#L85-L106)

Use **`effect.isExpired`** / prepared `system.expired`; PF2e derives expiration from remaining duration. Native effect schema has no universal `disabled` or `suppressed` field. `system.duration.sustained` describes sustained duration, not inactivity. `system.tokenIcon.show` controls native icon display, not mechanical activity. Badge counters below minimum can delete the Item. Effects may remain as expired documents when automatic removal is disabled. [EffectPF2e](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/module/item/effect/document.ts#L26-L80), [effect schema](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/module/item/effect/data.ts)

World-time advancement can reset actor/effect data and change expiration **without updating effect Items**. Combat changes reset actors and refresh effect tracking. Encounter effects may be removed on encounter end, depending on PF2e automatic removal settings. Deletion-only cleanup therefore misses expiration and derived condition changes. Observe Item create/update/delete; actor updates; `updateWorldTime`; combat update/delete; token create/update/delete and refresh; `canvasReady` / `canvasTearDown`; relevant user or setting changes. Debounce and diff desired state after preparation. [EffectTracker](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/module/system/effect-tracker.ts), [world-time hook](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/scripts/hooks/update-world-time.ts), [native CombatPF2e](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/module/encounter/document.ts)

## Visibility and authority

Native unidentified effects are hidden from **all non-GMs**, including their actor owners. Secret conditions suppress non-GM display when actor lacks a player owner and `pf2e.metagame_secretCondition` is enabled. Preserve those gates before constructing VFX. Restrict hidden, undetected, unnoticed and invisible presentation to viewers who can see the token; never create an external visible marker that reveals an unseen token's location. [AbstractEffect native visibility](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/module/item/abstract-effect/document.ts#L179-L202)

Prefer per-client rendering from that client's visible native documents. This avoids multiple clients independently broadcasting the same animation and lets each respect current detection. Use `attachTo(token, {bindVisibility:true, bindAlpha:true, bindElevation:true})` and explicit visibility guards. Sequencer **`.private()` only hides the effect from its manager UI**; it is not audience privacy. Broadcast designs must instead use `.forUsers(...)` and a single designated authority. Default Sequencer creation permission allows players; stricter world settings can block client creation, which should be surfaced without bypassing permissions. [Sequencer effect source](https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/4.2.3/src/sections/effect.js), [visibility implementation](https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/4.2.3/src/canvas-effects/canvas-effect.js)

## Sequencer API implications

- **`.persist(true)`** loops indefinitely. **`.temporary(true)`** prevents storage despite persistence. **`.play({local:true})` alone still stores persistent data** in Sequencer 4.x; combine temporary and local for document-derived layers rebuilt on reload.
- **`.origin(item.uuid)`** supplies lookup metadata. **`.tieToDocuments([storedItem, token.document])`** ends effects when either document is deleted; it does not detect expiration or condition overrides.
- Persistent **`Sequence.play()` resolves when its effects end**, not when creation completes. Do not await that promise inside serialized reconciliation. Reserve identity before starting, observe rejection, and clean up late-created effects after document removal or scene change.
- `preCreateSequencerEffect` receives serialized effect data and may return `false` to cancel. `createSequencerEffect` receives the CanvasEffect instance (`effect.data.name`) before asynchronous initialization; manager registration follows immediately. Queue microtask cleanup for a cancelled namespace, then end that exact effect through manager. `endedSequencerEffect` receives the same CanvasEffect instance. These hooks avoid waiting for indefinite persistent playback to discover late creation.
- **`EffectManager.endEffects(filters, false)`** suppresses `END_EFFECTS` broadcast in installed 4.2.3. Use exact module-scoped names; never end another module's origin-matching visuals. Direct `CanvasEffect.endEffect()` destroys an effect but bypasses manager removal; prefer manager API.
- Filters validate `sceneId` exists. Clean up before teardown or use effects IDs from manager when a scene has already disappeared. `sceneId` is not sufficient isolation: 4.2.3 `_filterEffects` itself does not compare scene IDs, so namespace must include scene/token/document identity.

[Sequencer effect section API source](https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/4.2.3/src/sections/effect.js), [EffectManager implementation](https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/4.2.3/src/modules/sequencer-effect-manager.js#L98-L157), [Sequence play implementation](https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/4.2.3/src/sequence.js)

**Upstream caveat:** temporary effect owners send `UPDATE_EFFECT_POSITION` when source position or dimensions change, even with `data.local=true`. The installed manager adds this ticker without a local guard (`dist/sequencer.js:11836`). Local temporary layers avoid duplicate visual broadcasts and saved effects, but cannot truthfully be described as zero socket traffic. Do not modify Sequencer or falsify remote flags to work around this. Restrict creation to visible sources and document the behavior. [Exact upstream temporary ticker](https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/4.2.3/src/modules/sequencer-effect-manager.js#L327-L413)

## Source aura sizing

Prepared Aura rule retains **`rule.item`** and **`rule.slug`**. `actor.auras.get(rule.slug).radius` is native resolved radius in feet. Each prepared aura `effects[]` entry retains **`parent: rule.item`**, which confirms source-effect association; AuraData itself has no top-level source Item. Require an active owned Aura rule and matching prepared aura. Recipient copies (`effect.fromAura` / `flags.pf2e.aura`) usually have no emitting Aura rule and should keep token-footprint overlays. Multiple same-slug rules can merge and later override radius; use final native radius, deduplicate the same emanation, and avoid arbitrary first-aura lookup. [AuraRuleElement](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/module/rules/rule-element/aura.ts#L276-L337), [AuraData and AuraEffectData](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/src/module/actor/types.ts#L55-L77)

## Recommended checks

Verify creation, duplicate hooks, condition value handover, overrides, stored and derived condition removal, unidentified/secret conditions, player visibility changes, expired effects retained in inventory, time/combat advancement, linked and synthetic actors, multiple tokens per actor, reload and scene switch, deletion during asynchronous startup, namespace isolation and finite preview cleanup. Preview must stop its own demonstration without adding or deleting native PF2e conditions/effects. Rendering must remain cosmetic: no actor updates, mechanical token motion, or continuous sounds.

## Semantic review of generated designs

Read all **43 condition descriptions fully**, plus native effect descriptions and complete originating spell/item descriptions for the examples below. Reviewed initial generator designs during implementation; recommendations describe issues found in that snapshot, not a claim that all remain after fixes. Asset candidates verified against full `.cache/persistent-databases.json` inventories: **6,870 Patreon / 1,351 Free** keys. This is semantic and API review, not rendered footage certification.

**Description resolution:** Sickened source contains only `@Localize[PF2E.condition.sickened.rules]`. Its complete installed English text describes nausea, penalties, inability to ingest willingly, and retching recovery. It does not imply poisoning. Resolve native localization before claiming the source description was analyzed. Current `plain()` also drops UUID-linked names without labels; origin Item/spell descriptions may contain richer imagery than short mechanical effect summaries. [Native English condition text](https://github.com/foundryvtt/pf2e/blob/pf2e-8.5.1/static/lang/en.json), [Sickened source](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/conditions/sickened.json)

### All condition meanings and visual assessment

The table records each condition separately. Rune, border and marker depictions remain symbolic, even when individually curated.

| Condition | Native meaning relevant to depiction | Assessment / recommendation |
|---|---|---|
| Blinded | Cannot see; visual checks fail | Dark symbolic cue fits; avoid claiming an actual curse. Initial rationale called it private while flag was false. |
| Broken | Damaged objects cannot function normally | Cracked-shield symbol fits; do not imply creature condition changes equipment HP. |
| Clumsy | Dexterity-related penalties | Quiet border fits symbolic coordination penalty. |
| Concealed | Obscured to particular viewers | Low smoke fits obscuration; respect viewer-relative detection. |
| Confused | Random hostile behavior; no allies | Mind-rune fits; no forced token motion. |
| Controlled | Another being dictates actions | Mind-rune fits domination; distinguish from confusion by marker variant. |
| Cursebound | Oracle curse grows with value | Curse rune fits; value changes need native reconciliation. |
| Dazzled | Overstimulated or swimming vision | Dim visual-interference cue fits; never grant actual light. |
| Deafened | Cannot hear; auditory-action difficulties | Mute sigil fits; wording should identify hearing, not inability to speak. |
| Doomed | Lower dying threshold | Skull is symbolic mortal danger, not death. |
| Drained | Health/vitality depleted, possibly without blood loss | Blood drop only symbolic; rationale must say depleted vitality rather than active bleeding. |
| Dying | At death's door; unconscious | Subdued skull fits danger; avoid corpse/dead depiction. |
| Encumbered | Too much carried weight; slower movement | Quiet constrained-movement border fits. |
| Enfeebled | Strength-related penalties | Rune is symbolic weakness; does not establish a curse. |
| Fascinated | Compelled attention; concentration restricted | Mind-rune fits distraction. |
| Fatigued | Exhaustion; AC/save penalties | Quiet border fits exhaustion. |
| Fleeing | Compelled to escape a source | Fear sigil fits; persistent animation must not move token itself. |
| Friendly | Likes a particular character | Heart can symbolize affection; replace healing/recovery rationale with disposition. |
| Frightened | Fear penalties; value normally decreases | Fear sigil fits; value changes do not restart continuous footage unnecessarily. |
| Grabbed | Held by creature; off-guard and immobilized | Binding symbol fits; native condition overlap can create multiple cues. |
| Helpful | Willing to aid a particular character | Gentle social cue; does not grant statistical enhancement. |
| Hidden | Location known, exact placement unclear to viewer | Private veil fits; hidden is not always invisible. |
| Hostile | Seeks harm; does not necessarily attack | Private red attitude border preferable to magical Rage orbit. |
| Immobilized | Cannot use move actions | Binding symbol fits; does not necessarily mean literal chains. |
| Indifferent | Neutral attitude toward character | Private neutral border fits. |
| Invisible | Cannot be seen; detection can become hidden | Private veil fits; never alter native visibility. |
| Observed | Perceived through a precise sense | Quiet private indicator; Hunter's Mark misleadingly suggests hunted prey. |
| Off-Guard | Defensive distraction; AC penalty | Cracked shield can be symbolic lowered defense; distinguish from broken equipment. |
| Paralyzed | Frozen; only purely mental actions allowed | Binding cue symbolic; avoid implying literal restraints. |
| Persistent Damage | End-turn damage of specific type | Choose type-specific fire/acid/bleed/etc.; generic blood only unknown-type fallback. |
| Petrified | Literally transformed into stone | Grey stone symbol appropriate approximation; metal orbit should be labelled symbolic. |
| Prone | Lying on ground; Crawl/Stand restrictions | Ground-level marker fits conservative depiction. |
| Quickened | Additional action with source restrictions | Brisk border fits; no mechanical speed alteration. |
| Restrained | Pinned/tied up; overrides Grabbed | Strong binding symbol fits; suppress inactive Grabbed cue. |
| Sickened | Nausea; penalties; cannot ingest willingly | Green illness symbol acceptable approximation; not automatically poisoned. |
| Slowed | Fewer actions | Static constrained-action border fits. |
| Stunned | Cannot act; action loss or duration | Circling stars fit; overrides Slowed. |
| Stupefied | Clouded thoughts; mental penalties | Mind-rune fits. |
| Unconscious | Sleep or knocked out; cannot act | Subdued border fits; not death, paralysis or recurring collapse. |
| Undetected | Viewer does not know occupied space | Private veil only; public marker would reveal position. |
| Unfriendly | Dislikes/distrusts particular character | Private attitude cue; avoid claiming curse. |
| Unnoticed | Viewer does not know creature exists | Private veil only; no public marker. |
| Wounded | Serious recent injury raises future dying value | Injury marker symbolic; ongoing bleeding is not inherent. |

Primary source for each row: [all pinned PF2e condition descriptions](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/conditions). Generated descriptions match those documents except unresolved localization, noted above.

### Notable persistent spell and item effects

| Native effect or ability | Description-grounded recommendation | Verified candidate assets |
|---|---|---|
| Fire Shield | Hovering shield made of fire; cold resistance does not make it an ice effect. Prefer shield-shaped flames over generic burning-body aura. | Both editions: `jb2a.shield_themed.above.fire.01.orange`; optional complementary `.below.fire.01.orange`. |
| Shield | Magical shield of force until effect ends/Shield Block. | Both: `jb2a.shield.01.loop.blue`. |
| Glass Shield | Clear glass barrier; preserve distinction from force shield. | Patreon: `jb2a.shield.01.loop.white`. Both: `jb2a.condition.boon.02.001.refraction` as explicitly symbolic glass substitute. |
| Prismatic Shield | Multicolored rotating protective shards, not identical plain-blue Shield. | Patreon: `jb2a.energy_field.01.multicolored`; Free: `jb2a.condition.boon.02.001.refraction`, clearly labelled approximation. |
| Bless | Beneficial emanation and recipient attack bonus; native source radius grows on Sustain. | Both: `jb2a.bless.200px.loop.yellow`; source Aura rule determines footprint, recipients remain local. |
| Bane | Doubt/attack penalty for affected enemies within emanation. | Both: `jb2a.condition.curse.01.001.red`, symbolic doubt/penalty cue; no `jb2a.bane` family exists. |
| Heroism | Broad beneficial status bonus; not actual illumination. | Both: `jb2a.condition.boon.01.001.green`; avoid promising emitted light. |
| Mirror Image | Three illusory duplicates, destroyed one by one. | No dedicated `mirror_image` family. Bubble/refraction loop is symbolic only. Literal depiction needs cosmetic sprite copies synchronized to native badge, without token documents. |
| Blur | Blurry form, Concealed; location remains obvious and cannot enable Hide/Sneak. | No standalone native effect in reviewed packs; use native Concealed lifecycle. Smoke is broad approximation; refraction/shimmer would better distinguish known Blur provenance. |
| Invisibility | Invisible/undetected/hidden according to detection; hostile action may end spell. | No standalone native effect here; private Invisible condition veil follows native condition removal. |
| Haste | Quickened for Strike/Stride only. | Spinning border fits; avoid stacking near-identical Haste and granted Quickened cues excessively. |
| Slow | Slowed by save outcome; native durations differ. | No standalone Slow effect here; native Slowed condition controls lifetime. |
| Fly / wings | Fly Speed; particular wings may emit light or look bat-like. | All feather assets are `outburst`, not sustained loops. Neutral `jb2a.wind_stream.white` exists both editions; generic border safer than random cold/wood/nature orbit. Label symbolic flight. |
| Rage | Continuing battle state and melee damage/temporary HP. | Red border/orbit is symbolic; electrical Rage of the Sky Father / Tempest Rage deserve electric cue rather than all identical red metal orbit. |
| Smoke Ball / legacy Smokestick | Stationary opaque smoke burst, dispersible by strong wind. | Native 8.5.1 Smoke Ball has no standalone effect Item. A bearer-attached cloud would be wrong: requires template/area lifecycle. Both: `jb2a.smoke.plumes_loop.01.grey` as area-film candidate. |
| Antidote | Persistent bonus to Fortitude saves against poisons, not poisoned condition. | Both: `jb2a.markers.shield.green.01` or green boon cue. |
| Antiplague | Persistent bonus to Fortitude saves against disease. | Existing boon cue appropriate; no toxic haze. |
| Elixir of Life | Immediate healing, then temporary bonus to saves against diseases/poisons. | Persistent cue should represent protection/boon, not poisoned state or repeated healing. |

Sources: [native Fire Shield](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-4/fire-shield.json), [Prismatic Shield](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-9/prismatic-shield.json), [Mirror Image](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spells/spells/rank-2/mirror-image.json), [native spell effects](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spell-effects), [native equipment effects](https://github.com/foundryvtt/pf2e/tree/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/equipment-effects), [Smoke Ball](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/equipment/smoke-ball-lesser.json), [Antidote](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/equipment/antidote-lesser.json), [Elixir of Life](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/equipment/elixir-of-life-minor.json).

### Cooldowns and classifier corrections

Full descriptions of all six immunity-named effects were reviewed. **Shield Immunity** begins after Shield ends and prevents recasting; an enduring shield visual is materially wrong. **Rage Temporary Hit Points Immunity** prevents regaining Rage temporary HP; it does not establish Rage. **Treat Wounds Immunity** is treatment cooldown, not persistent bleeding. Use distinct quiet cooldown markers. Battle Medicine and Guidance immunity were already neutral. Diplomatic Immunity instead gives an attacker weakness to allied damage, so a blanket positive immunity rule would also be wrong. [Shield cooldown](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/spell-effects/effect-shield-immunity.json), [Rage cooldown](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feat-effects/effect-rage-temporary-hit-points-immunity.json), [Treat Wounds cooldown](https://github.com/foundryvtt/pf2e/blob/563fd52708673ddd4f66c76921efbf6a938fffed/packs/pf2e/feat-effects/effect-treat-wounds-immunity.json)

Initial `/light\b/` regex matched **Flight** by suffix. Use word boundaries on both sides and purposeful handling of names such as Droning Wings, whose effect only grants sonic immunity. Names alone cannot distinguish applied elemental damage from resistance/protection against that element. Prefer reviewed exact overrides plus native rule/description role checks; use symbolic conservative fallback when depiction is unclear. Do not select arbitrary elements merely to increase asset usage: the initial generic flight fallback randomly chose cold, nature, wood or metal footage because all feather candidates were excluded as outbursts.
