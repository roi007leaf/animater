export function fxSemantics(entry, description='') {
  const text=String(description || entry.plainDescription || entry.descriptionText || '').replace(/<[^>]*>/g,' ').replace(/@\w+\[[^\]]+\]\{([^}]+)\}/g,'$1').replace(/\s+/g,' ').toLowerCase();
  const name=String(entry.slug??entry.name??'').toLowerCase().replace(/^(?:spell[ -])?effect[ -:]*/,'');
  return {
    damage:/\b(?:deal(?:s|t|ing)?|take(?:s|n)?|taking|suffer(?:s|ing)?)\b(?!\s+(?:no|zero)\b)[^.!?]{0,100}\bdamage\b/.test(text),
    healing:/\b(?:restore[sd]?|regain[sd]?|recover[sd]?|heal[sd]?)\b[^.!?]{0,70}\bhit points?\b/.test(text)||/\b(?:healing|restorative)\b[^.!?]{0,60}\b(?:hit points?|vitality)\b/.test(text),
    ward:/\b(?:gain[sd]?|grants?|provides?|gives?)\b[^.!?]{0,85}\b(?:bonus[^.!?]{0,35}(?:\bac\b|armor class)|resistance to|protective (?:barrier|shield))\b/.test(text)||/^(?:shield|fire-shield|force-shield|wall-of-force|protectors-sphere)(?:-|$)/.test(name),
    teleport:/\b(?:teleport(?:s|ed|ation)?|translocate)\b/.test(text)||/^(?:translocate|teleport|dimension-door|misty-step|blink)(?:-|$)/.test(name),
  };
}
