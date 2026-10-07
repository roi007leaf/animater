import {createHash} from 'node:crypto';
import {basename} from 'node:path';
import {variantFiles} from './asset-databases.mjs';

// Visible media and composition only. Labels, sound, token motion, rank-sized
// scaling and timing differences cannot turn the same effect into a new spell.
const indices=new WeakMap();
export function effectIdentity(recipe, rows) {
 if(!indices.has(rows))indices.set(rows,new Map(rows.map(r=>[r.key,r])));
 const byKey=indices.get(rows);
 const effects=recipe.stages.filter(s=>!['motion','sound'].includes(s.kind) && Number(s.opacity??1)>0);
 const signed=n=>Math.sign(Number(n)||0);
 const layout=n=>Math.round((Number(n)||0)*2)/2;
 const identity=effects.map(s=>{
  const row=byKey.get((s.assets??[]).find(key=>byKey.has(key)));
  return {
   kind:s.kind,subject:s.subject??(s.kind==='cast'?'source':'targets'),
   media:s.kind==='sprite'?'token-copy':row?[...new Set(variantFiles(row).map(file=>basename(file).replace(/_\d{2,5}x\d{2,5}(?=_|\.|$)/gi,'')))].sort():'missing',
   origin:['travel','projectile'].includes(s.kind)?s.travelOrigin:undefined,
   destination:['travel','projectile'].includes(s.kind)?s.travelDestination:undefined,
   layout:s.areaLayout,copies:s.kind==='sprite'?s.copies:undefined,
   repeats:s.repeats??1,repeatScope:s.repeatScope??'perTarget',below:Boolean(s.below),
   offset:[layout(s.offsetX),layout(s.offsetY)],
   hue:Math.round((Number(s.hue)||0)/45)*45,tint:s.tintEnabled?s.tint:undefined,
   entrance:s.scaleInDuration? signed(1-s.scaleIn):0,
   exit:s.scaleOutDuration?signed(s.scaleOut-1):0,
   tracks:(s.tracks??[]).map(t=>({property:t.property,from:layout(t.from),to:layout(t.to),loop:Boolean(t.loop),pingPong:Boolean(t.pingPong)})),
  };
 });
 return createHash('sha256').update(JSON.stringify(identity)).digest('hex');
}
export function identityGroups(spells,recipeFor,databases) {
 return Object.fromEntries(Object.entries(databases).map(([edition,rows])=>{
  const groups=new Map();
  for(const spell of spells){const key=effectIdentity(recipeFor(spell),rows);const group=groups.get(key)??[];group.push(spell);groups.set(key,group);}
  return [edition,groups];
 }));
}
