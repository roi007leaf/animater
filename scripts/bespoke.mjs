// Bespoke per-entry compositions. Reviewers author full-description designs for
// individual catalog entries (spell, feat, weapon use, D&D activity, effect…)
// in scripts/bespoke/*.mjs; this layer swaps them in for the generated recipe
// while keeping the entry's optional sounds (re-anchored to the new stages) or
// selecting a different sound profile. Applied by withCatalogFx, the one hook
// every catalog builder passes through.
import { BESPOKE } from './bespoke/index.mjs';
import { validateRecipe, MAX_STAGES } from './model.mjs';
import { addSpellSounds } from './spell-sounds.mjs';
import { addAbilitySounds } from './ability-sounds.mjs';
import { markElementChoice } from './element-choice.mjs';
import { ELEMENT_CHOICE_SPELLS } from './bespoke/element-choice-spells.mjs';

// Lookup keys, most specific first: `<system>:<id>:<variant|mode>` then `<system>:<id>`.
export function bespokeKeys(recipe, entry = {}, options = {}) {
  const system = recipe.systemId ?? entry.systemId ?? 'pf2e';
  const ids = [...new Set([entry.id, entry.documentId].filter(Boolean))];
  const variant = options.variant?.id ?? options.mode?.mode ?? (typeof options.mode === 'string' ? options.mode : undefined) ?? recipe.weaponMode ?? recipe.activityId;
  return ids.flatMap(id => [...(variant ? [`${system}:${id}:${variant}`] : []), `${system}:${id}`]);
}
const anchorKind = kind => ['travel', 'projectile'].includes(kind) ? 'travel' : ['impact', 'template'].includes(kind) ? 'impact' : kind === 'cast' ? 'cast' : 'other';
// Keep existing sound cues but point each at the new stage of the same role.
function reanchorSounds(oldStages, newStages) {
  const byId = new Map(oldStages.map(s => [s.stageId, s]));
  const visual = newStages.filter(s => !['sound', 'motion', 'sprite'].includes(s.kind));
  return oldStages.filter(s => s.kind === 'sound').map(sound => {
    const role = anchorKind(byId.get(sound.afterStage)?.kind);
    const anchor = visual.find(s => anchorKind(s.kind) === role) ?? (role === 'other' ? visual.find(s => ['aura', 'impact', 'template'].includes(s.kind)) : null) ?? visual[0];
    return anchor ? { ...sound, afterStage: anchor.stageId, timingAnchor: 'start', delay: anchor.delay ?? 0 } : null;
  }).filter(Boolean);
}
export function applyBespoke(recipe, entry = {}, options = {}) {
  let result = recipe;
  const key = bespokeKeys(recipe, entry, options).find(k => BESPOKE[k]);
  const design = key && BESPOKE[key];
  if (design && options.bespoke !== false) {
    const built = design.build({ recipe, entry, options });
    const stages = (built.stages ?? built).map((s, i) => ({ stageId: `${recipe.id}-b${i + 1}`, ...s }));
    let all;
    if (design.sound !== undefined && options.sounds) {
      const item = { id: entry.id ?? recipe.id, slug: entry.slug ?? recipe.id, design: entry.design, soundProfile: design.sound };
      all = design.sound === null ? stages
        : design.soundNamespace === 'ability' ? addAbilitySounds(item, stages, { sounds: options.sounds, mode: options.mode?.mode ?? options.mode, design: { profile: design.sound } })
        : addSpellSounds(item, stages, { sounds: options.sounds, design: { profile: design.sound } });
    } else all = [...stages, ...reanchorSounds(recipe.stages, stages)];
    result = validateRecipe({ ...recipe, ...(built.recipe ?? {}), description: design.rationale ?? recipe.description, bespoke: key, stages: all.slice(0, MAX_STAGES) });
  }
  // Play-time element choice for entries whose native text offers one.
  const text = entry.plainDescription ?? entry.descriptionText ?? '';
  if (ELEMENT_CHOICE_SPELLS.has(entry.id) || ELEMENT_CHOICE_SPELLS.has(entry.documentId)) result = markElementChoice(result, 'choose a damage type');
  else if (text) result = markElementChoice(result, text);
  return result;
}
