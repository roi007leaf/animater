// Built-in defaults describe visible artwork, not its transparent video frame.
// Saved custom recipes keep their authored scale, opacity and placement.
export function statePresentation(design) {
 const asset=design.assets?.[0]??'';
 if(/\.markers\.(?:chain)|\.web\./.test(asset))return {presentationRole:'binding',scale:1.5,opacity:.92,below:false,offsetX:0,offsetY:0};
 // A marker's ring of icons circles the token under its art, wide enough (1.6x) that the icons orbit just outside a
 // round token's art; it never hovers over the head into the next square.
 if(/\.markers\./.test(asset))return {presentationRole:'marker',scale:1.6,opacity:.96,below:true,offsetX:0,offsetY:0};
 // The hex barrier footage fills its frame; it should hug the bearer, not dome over neighbours.
 if(/\.shield\.0\d\./.test(asset))return {presentationRole:'shield',scale:1.15,opacity:.8,below:false,offsetX:0,offsetY:0};
 if(/\.shield_themed\./.test(asset))return {presentationRole:'shield',scale:1.35,opacity:.86,below:false,offsetX:0,offsetY:0};
 // Curse rings read as a hindrance border under the token, sized like token borders.
 if(/\.token_border\.|\.condition\.curse\./.test(asset))return {presentationRole:'border',scale:1.5,opacity:.95,below:true,offsetX:0,offsetY:0};
 if(/\.fumes\.|\.smoke\./.test(asset))return {presentationRole:'haze',scale:1.5,opacity:.68,below:false,offsetX:0,offsetY:0};
 if(/\.hunters_mark\./.test(asset))return {presentationRole:'mark',scale:1.4,opacity:.92,below:false,offsetX:0,offsetY:0};
 if(/\.flames\./.test(asset))return {presentationRole:'flame',scale:1.5,opacity:.82,below:false,offsetX:0,offsetY:0};
 if(/\.aura_themed\.|\.swirling_leaves\./.test(asset))return {presentationRole:'orbit',scale:1.5,opacity:.84,below:false,offsetX:0,offsetY:0};
 // A looping strike is a quiet style cue, not a repeated attack.
 if(/\.(?:claws|bite)\./.test(asset))return {presentationRole:'field',scale:1.2,opacity:.5,below:false,offsetX:0,offsetY:0};
 if(/\.magic_signs\.circle\./.test(asset))return {presentationRole:'field',scale:1.45,opacity:.7,below:true,offsetX:0,offsetY:0};
 if(/\.bless\.|\.condition\.boon\./.test(asset))return {presentationRole:'boon',scale:1.5,opacity:.86,below:true,offsetX:0,offsetY:0};
 // Bearer layers stay within ~1.5x the token so they never swamp adjacent creatures.
 return {presentationRole:'field',scale:1.5,opacity:.82,below:false,offsetX:0,offsetY:0};
}
