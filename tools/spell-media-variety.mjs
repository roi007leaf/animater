import {assetGeometry} from './spell-asset-selection.mjs';
import {variantFiles} from './asset-databases.mjs';
// Spread genuine numbered movie variants inside the selected semantic family.
// Keep color, intro/loop/contact role and every nonnumeric qualifier. An authored
// numeric family hint is a constraint; it cannot be diversified away.
export function diversifySpellMedia(spells,databases,motifs){
 const changed=[],patreonChoices=new Map();
 const orderedEditions=Object.entries(databases).sort(([a],[b])=>Number(b==='patreon')-Number(a==='patreon'));
 for(const [edition,rows] of orderedEditions){
  const byKey=new Map(rows.map(r=>[r.key,r])),usage=new Map(),pools=new Map();
  const lane=row=>row.key.split('.').filter(p=>!/^\d+$/.test(p)).join('.')+':'+assetGeometry(row)+':'+
    [...new Set(variantFiles(row).map(file=>file.match(/\d{2,5}x\d{2,5}/i)?.[0]??'unknown'))].sort().join(',');
  for(const row of rows){const key=lane(row);const pool=pools.get(key)??[];pool.push(row);pools.set(key,pool);}
  for(const spell of [...spells].sort((a,b)=>Number(b.design.authored)-Number(a.design.authored)||a.slug.localeCompare(b.slug)||a.id.localeCompare(b.id))){
   for(const [slot,keys] of Object.entries(spell.design.assets)){
    const original=keys.find(k=>byKey.has(k));if(!original)continue;
    const originalRow=byKey.get(original),family=original.split('.')[1];
    const roots=(motifs[spell.design.motif]?.[slot]??'').split(',');
    const pinned=roots.some(root=>root.split('.')[0]===family&&root.split('.').some(p=>/^\d+$/.test(p)));
    const primary=patreonChoices.get(`${spell.id}:${slot}`);
    const candidates=edition==='free'&&byKey.has(primary)?[byKey.get(primary)]:pinned?[originalRow]:pools.get(lane(originalRow))??[originalRow];
    const distinct=new Map();for(const row of candidates){const id=JSON.stringify(variantFiles(row));if(!distinct.has(id)||row.key===original)distinct.set(id,row);}
    const selected=[...distinct.values()].sort((a,b)=>(usage.get(a.key)??0)-(usage.get(b.key)??0)||Number(b.key===original)-Number(a.key===original)||a.key.localeCompare(b.key))[0];
    usage.set(selected.key,(usage.get(selected.key)??0)+1);
    if(edition==='patreon')patreonChoices.set(`${spell.id}:${slot}`,selected.key);
    if(selected.key===original)continue;
    // Insert at this edition's resolved position. Free must not jump ahead of
    // a Patreon-only color/role selected by the director.
    const at=keys.findIndex(k=>byKey.has(k)),retained=keys.filter(k=>k!==selected.key);
    spell.design.assets[slot]=[...retained.slice(0,at),selected.key,...retained.slice(at)];
    changed.push({id:spell.id,name:spell.name,edition,slot,from:original,to:selected.key});
   }
  }
 }
 return {changed:changed.length,variants:changed,methodology:'Numbered movie variants within the same selected semantic family, color, role and geometry. Explicit numeric authored roots are retained; keys sharing exactly the same movie inventory are not different variants.'};
}
