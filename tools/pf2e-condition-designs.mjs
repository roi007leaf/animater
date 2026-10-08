import {assetGeometry} from './spell-asset-selection.mjs';
import {colorAffinity} from './color-affinity.mjs';
import {variantFiles} from './asset-databases.mjs';

// Reviewed against the full localized native descriptions. These cues never
// move actors, decide outcomes, or change PF2e's visibility or action economy.
const palettes={fire:['orange','#ff8a3d'],frost:['blue','#8cdcff'],grey:['grey','#b7bdc8'],white:['white','#e4e9f2'],black:['dark_black','#555765'],purple:['purple','#ba9cdd'],red:['dark_red','#cf7284'],green:['green','#9ac885'],yellow:['yellow','#e6d096'],blue:['blue','#94bdd6'],pink:['pink','#e2a6ce'],orange:['orange','#c89f83']};
const track=(property,from,to,duration,pingPong=true)=>({property,from,to,duration,loop:true,pingPong,ease:'easeInOutQuad'});
const flatten=value=>[{property:'scale.y',from:value,to:value,duration:6000}];
const art=(roots,palette='grey',options={})=>({roots:Array.isArray(roots)?roots:[roots],palette,scale:1,opacity:.92,below:false,offsetX:0,offsetY:0,offsetUnits:'token',playbackRate:.8,...options});
// The color sits before the style in the database; selection handles that root.
const rim=(style,palette,options={})=>art('token_border.circle.static',palette,{style:`.${String(style).padStart(3,'0')}`,scale:1.35,below:true,...options});
const veil=(palette,options={})=>art('fog_cloud.01.white',palette,{scale:1.1,opacity:.8,...options});
const glyph=(root,palette,options={})=>art(`markers.${root}`,palette,{scale:.85,...(['fear','heart','mute','shield_cracked','skull','drop','poison','stun','runes','runes02','runes03'].includes(root)?{style:'.03'}:{}),...options});
const plan=(theme,quality,...layers)=>({theme,quality,layers});
// Visible-alpha centers measured across the complete movies, not the padded
// 400px frame. Blue and pink variants have slightly different vertical bounds.
const sleepAnchors={
 'SleepSymbol01_01_Regular_Blue_400x400.webm':{x:.6796875,y:.30859375},
 'SleepSymbol01_01_Dark_Pink_400x400.webm':{x:.6796875,y:.31640625},
};

// Reviewed multi-layer looks for individual effects (keyed by effect slug).
export const EFFECT_PLANS={
 // A thermal wheel: a burning ring and an orbit of icy motes turning in opposite
 // directions around the caster while the spell lasts.
 'spell-effect-entropic-wheel':plan('fire','curated',
  art('fire_ring.500px','fire',{scale:1.2,opacity:.75,below:true,playbackRate:.7,tracks:[track('rotation',0,360,7000,false)]}),
  art('aura_themed.01.orbit.loop.cold.01','frost',{scale:1.35,opacity:.85,playbackRate:.7,tracks:[track('rotation',0,-360,7000,false)]})),
};
export const CONDITION_PLANS={
 blinded:plan('vision','symbolic',art('darkness.black','black',{offsetY:-.1,scale:.9,opacity:.8})),
 broken:plan('broken','themed',glyph('shield_cracked','orange',{scale:1})),
 // Off-balance: wobbling motes over a tilting rim.
 clumsy:plan('coordination','symbolic',art('particles.swirl','orange',{scale:1.2,opacity:.75,playbackRate:.6,tracks:[track('rotation',-14,14,900)]}),rim(3,'orange',{opacity:.7,tracks:[track('rotation',-5,5,1500)]})),
 concealed:plan('fog','themed',art('fog_cloud.01.white','grey',{scale:1.45,opacity:.8})),
 confused:plan('mind','symbolic',glyph('circle_of_stars','purple',{scale:1.05,offsetY:-.15,tracks:[track('rotation',-25,25,2400)]})),
 controlled:plan('mind','symbolic',glyph('runes02','blue',{scale:1.05,tracks:[track('alpha',.65,.95,2600)]})),
 cursebound:plan('curse','symbolic',glyph('runes','purple',{scale:1.1})),
 dazzled:plan('vision','themed',glyph('light.loop','yellow',{scale:.8,offsetY:-.2,brightness:1.1})),
 deafened:plan('silence','symbolic',glyph('mute','grey',{scale:.75})),
 doomed:plan('death','symbolic',glyph('skull','purple',{scale:.8}),rim(7,'purple',{opacity:.8})),
 drained:plan('health','symbolic',glyph('heart','grey',{scale:.85,brightness:.8})),
 dying:plan('death','symbolic',glyph('heart','red',{scale:1.05,tracks:[track('alpha',.55,.95,2000)]})),
 // Overburdened: a heavy, slow metal orbit pressed flat at the feet.
 encumbered:plan('slow','symbolic',art('aura_themed.01.orbit.loop.metal','grey',{scale:1.35,offsetY:.3,below:true,playbackRate:.35,opacity:.85,tracks:flatten(.45)}),rim(5,'orange',{scale:1.4,offsetY:.3,tracks:flatten(.6)})),
 // Strength draining away: inward motes over a drooping rim.
 enfeebled:plan('weakness','symbolic',art('particles.inward','red',{scale:1.2,opacity:.7,playbackRate:.6}),rim(2,'grey',{scale:1.35,opacity:.85,tracks:[track('scale.y',.8,.95,4200)]})),
 fascinated:plan('mind','symbolic',glyph('light_orb.loop','blue',{scale:.65,offsetY:-.2,tracks:[track('scale.x',.9,1.1,3000),track('scale.y',.9,1.1,3000)]})),
 // Weary: a small, fading sleep cue (Unconscious uses the full blue symbol).
 fatigued:plan('slow','symbolic',art('sleep.symbol','pink',{style:'.dark_pink',scale:.6,offsetY:-.2,opacity:.7,playbackRate:.5,mediaAnchors:sleepAnchors,tracks:[track('alpha',.35,.7,3500)]}),rim(4,'grey',{opacity:.75,tracks:[track('alpha',.55,.85,4000)]})),
 fleeing:plan('fear','symbolic',art('particles.outward','white',{scale:1.35,below:true,opacity:.85})),
 friendly:plan('attitude','symbolic',glyph('heart','pink',{scale:.65})),
 frightened:plan('fear','themed',glyph('fear','purple',{scale:1})),
 grabbed:plan('chains','themed',art('markers.chain.standard.loop.01','grey',{scale:1.6})),
 helpful:plan('attitude','symbolic',glyph('heart','pink',{scale:.65}),glyph('heart','pink',{scale:.55,mirrorX:true})),
 hidden:plan('invisible','symbolic',veil('grey'),rim(6,'grey',{opacity:.85})),
 // Aggression: a targeting sigil over the dark red attitude rim.
 hostile:plan('attitude','symbolic',rim(7,'red',{scale:1.4}),art('hunters_mark.loop','red',{scale:.6,opacity:.8})),
 // Held in place: the binding motif of Grabbed/Restrained, shackled flat at the feet.
 immobilized:plan('chains','symbolic',art(['markers.chain.square.loop.01','markers.chain.standard.loop.01'],'grey',{scale:1.45,offsetY:.25,tracks:flatten(.55)})),
 indifferent:plan('attitude','symbolic',rim(1,'grey')),
 invisible:plan('invisible','symbolic',art('condition.boon.02.001.refraction','white',{scale:1.35,opacity:.8})),
 observed:plan('neutral','symbolic',rim(2,'white',{scale:1.3})),
 'off-guard':plan('broken','symbolic',glyph('shield_cracked','red',{scale:.75})),
 // Rigid stasis: a nearly frozen dome, distinct from Unconscious sleep and from bindings.
 paralyzed:plan('slow','symbolic',art('energy_field.02.above','white',{scale:1.25,opacity:.5,playbackRate:.2}),rim(6,'white',{below:false,scale:1.3})),
 'persistent-damage':plan('neutral','symbolic',rim(4,'red',{scale:1.4,tracks:[track('alpha',.7,.95,2200)]})),
 petrified:plan('stone','symbolic',art('aura_themed.01.orbit.loop.metal.01','grey',{scale:1.4,playbackRate:.4,below:false})),
 prone:plan('slow','symbolic',rim(2,'grey',{scale:1.4,offsetY:.28,tracks:flatten(.4)})),
 quickened:plan('speed','symbolic',art('token_border.circle.spinning','blue',{scale:1.4,below:true,playbackRate:.75})),
 restrained:plan('chains','themed',art('markers.chain.standard.loop.02','grey',{scale:1.65})),
 sickened:plan('fog','symbolic',art('fumes.04.loop','green',{scale:1.35,offsetY:.12,opacity:.85})),
 slowed:plan('slow','symbolic',rim(3,'blue',{scale:1.4})),
 stunned:plan('stun','themed',glyph('stun','yellow',{scale:1.05})),
 stupefied:plan('mind','symbolic',art('fumes.04.loop','purple',{scale:.9,offsetY:-.2,opacity:.8}),glyph('runes03','purple',{scale:.65})),
 unconscious:plan('slow','themed',art('sleep.symbol','blue',{scale:.95,offsetY:-.2,playbackRate:.7,mediaAnchors:sleepAnchors})),
 undetected:plan('invisible','symbolic',veil('black'),rim(5,'grey',{opacity:.85})),
 unfriendly:plan('attitude','symbolic',rim(3,'orange',{scale:1.35})),
 unnoticed:plan('invisible','symbolic',veil('black',{scale:.9}),rim(4,'grey',{opacity:.85})),
 wounded:plan('health','symbolic',glyph('heart','red',{scale:.75})),
};

export const DAMAGE_PLANS={
 acid:plan('acid','themed',art('bubble.001.001.loop','green',{scale:1.45})),
 bleed:plan('blood','themed',glyph('drop','red',{scale:.85})),
 bludgeoning:plan('broken','symbolic',glyph('shield_cracked','orange',{scale:.95})),
 cold:plan('cold','themed',art('aura_themed.01.orbit.loop.cold.01','blue',{scale:1.45})),
 electricity:plan('lightning','themed',art('energy_field.01','blue',{scale:1.5})),
 fire:plan('fire','themed',art('flames.04.loop','orange',{scale:1.5})),
 force:plan('shield','symbolic',art('energy_field.01','purple',{scale:1.3})),
 mental:plan('mind','symbolic',glyph('runes03','purple',{scale:.95})),
 // Physical persistent damage: a repeating stab for piercing and red claw rakes for
 // slashing, so the three physical types no longer differ only by rotation.
 piercing:plan('broken','symbolic',art(['melee_generic.piercing.one_handed','rapier.melee.01'],'red',{scale:.95,opacity:.55,playbackRate:.6})),
 poison:plan('poison','themed',glyph('poison','green',{scale:1})),
 slashing:plan('broken','symbolic',art('claws.200px','red',{scale:1.05,opacity:.6,playbackRate:.6})),
 sonic:plan('sonic','symbolic',art('energy_field.01','white',{scale:1.5,tracks:[track('scale.x',.85,1.1,1800),track('scale.y',.85,1.1,1800)]})),
 spirit:plan('void','symbolic',art('energy_strands.overlay','white',{scale:1.4})),
 vitality:plan('light','symbolic',art('energy_field.01','yellow',{scale:1.45})),
 void:plan('void','symbolic',art('energy_strands.overlay','black',{scale:1.45})),
};

function build(entry,definition,db,id){
 if(!definition)throw Error(`Missing reviewed condition design: ${id}`);
 const layers=definition.layers.map((spec,index)=>{
  const {roots,palette,style,mediaAnchors,...layout}=spec,[color,tint]=palettes[palette],chosen={};
  for(const [edition,rows] of Object.entries(db)){
   let candidates=[];
   for(const root of roots){
    candidates=rows.filter(r=>(r.key===`jb2a.${root}`||r.key.startsWith(`jb2a.${root}.`))&&assetGeometry(r)==='radial'&&!/intro|outro|complete|outburst|pulse/.test(r.key)&&(!style||r.key.endsWith(style)));
    if(candidates.length)break;
   }
   if(!candidates.length)throw Error(`Missing ${id} layer ${index+1}: ${roots} (${edition})`);
   const colored=candidates.filter(r=>r.key.split('.').some(c=>c===color||c===`dark_${color}`));
   chosen[edition]=(colored.length?colored:candidates).sort((a,b)=>colorAffinity(b.key,color)-colorAffinity(a.key,color)||a.key.localeCompare(b.key))[0];
  }
  const editions=Object.fromEntries(Object.entries(chosen).map(([edition,row])=>{
   const files=variantFiles(row),anchor=mediaAnchors?.[files[0]?.split(/[\\/]/).at(-1)];
   if(mediaAnchors&&(files.length!==1||!anchor))throw Error(`Unmeasured ${id} artwork anchor (${edition}): ${files}`);
   return [edition,{key:row.key,files,colorSubstitution:!row.key.split('.').some(c=>c===color||c===`dark_${color}`),...(anchor?{anchor}:{})}];
  }));
  const primaryAnchor=editions.patreon.anchor;
  return {...layout,...(primaryAnchor?{customAnchor:true,anchorX:primaryAnchor.x,anchorY:primaryAnchor.y}:{}),stageId:`condition-${index+1}`,label:entry.name,assets:[...new Set([chosen.patreon.key,chosen.free.key])],tint,tintEnabled:true,colorize:true,editions};
 });
 const primary=layers[0];
 return {theme:definition.theme,quality:definition.quality,color:primary.tint,rationale:'',evidence:'native-condition-description',conditionDesign:{id,descriptionHash:entry.descriptionHash,layers},...primary,presentationRole:primary.below?'field':'body'};
}

export function buildEffectDesign(entry,db){
 return EFFECT_PLANS[entry.slug]?{...build(entry,EFFECT_PLANS[entry.slug],db,entry.slug),evidence:'Reviewed complete native description'}:null;
}
export function buildConditionDesign(entry,db){
 const design=build(entry,CONDITION_PLANS[entry.slug],db,entry.slug);
 if(entry.slug==='persistent-damage')design.damageVariants=Object.fromEntries(Object.entries(DAMAGE_PLANS).map(([type,definition])=>[type,build(entry,definition,db,`persistent-${type}`)]));
 return design;
}
