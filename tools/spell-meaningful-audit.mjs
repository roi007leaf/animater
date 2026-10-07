import { createHash } from 'node:crypto';
// A separate, conservative variety metric. Millisecond/rank-size nudges cannot
// promote otherwise identical media choreography into a new visual design.
const bucket=(n,step=0.5)=>Math.round((Number(n)||0)/step)*step;
export function meaningfulSpellFingerprint(spell,recipe,database,{familiesOnly=false}={}){
 const media=new Map(database.map(row=>[row.key,row.file??row.key]));
 const index=new Map(recipe.stages.map((stage,i)=>[stage.stageId,i]));
 const stages=recipe.stages.filter(s=>s.kind!=='sound').map(s=>{
  const chosen=s.assets.find(key=>media.has(key));
  const data={kind:s.kind,subject:s.subject,repeats:s.repeats,repeatScope:s.repeatScope,targetSelection:s.targetSelection,targetLimit:s.targetLimit,
   ...(s.kind==='motion'?{motion:s.motion,distance:bucket(s.distance,0.25),intensity:bucket(s.intensity,0.25),motionRange:s.motionRange,motionEndpoint:s.motionEndpoint}:
   s.kind==='sprite'?{copies:s.copies,spread:bucket(s.copySpread,0.25),shadow:s.shadow}:
   {media:familiesOnly?chosen?.split('.')[1]??'missing':media.get(chosen)??'missing',scale:bucket(s.scale),area:s.kind==='template'?s.areaLayout:undefined}),
   offset:[bucket(s.offsetX,0.25),bucket(s.offsetY,0.25)],rotation:bucket(s.rotation,45),entrance:s.scaleInDuration?(s.scaleIn<1?'grows':s.scaleIn>1?'contracts':'steady'):'native',exit:s.scaleOutDuration?(s.scaleOut<1?'contracts':s.scaleOut>1?'grows':'steady'):'native',opacity:bucket(s.opacity,0.25),
   ...(s.tintEnabled?{tint:s.tint,colorize:s.colorize===true}:{}),blur:bucket(s.blur,2),hue:bucket(s.hue,45),glow:bucket(s.glow,1),maskToken:s.maskToken,mirror:[s.mirrorX,s.mirrorY],
   ...(s.afterStage?{linkedTo:index.get(s.afterStage),anchor:s.timingAnchor}:{}),
   tracks:(s.tracks??[]).map(t=>({property:t.property,from:bucket(t.from,t.property==='rotation'?45:0.25),to:bucket(t.to,t.property==='rotation'?45:0.25),loop:t.loop,pingPong:t.pingPong}))};
  return data;
 });
 return createHash('sha256').update(JSON.stringify({delivery:spell.delivery,stages})).digest('hex');
}
