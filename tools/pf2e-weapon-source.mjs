import {readFile,readdir,writeFile} from 'node:fs/promises';
export const WEAPON_SOURCE_SHA='581c2bf2ca9734f4dd83f034fbcc93f8e4fd96eb';
// Same pinned official PF2e revision as spells and feats. Entire equipment pack
// is inspected: name filters cannot establish complete weapon coverage.
export async function weaponSources(){
  const root=new URL(`../.cache/pf2e-${WEAPON_SOURCE_SHA}/packs/pf2e/equipment/`,import.meta.url);
  const walk=async(url,prefix='')=>(await Promise.all((await readdir(url,{withFileTypes:true})).map(e=>e.isDirectory()?walk(new URL(e.name+'/',url),prefix+e.name+'/'):e.name.endsWith('.json')?[prefix+e.name]:[]))).flat();
  let names;
  try{names=await walk(root);}
  catch{throw Error('Extract the pinned PF2e source equipment directory into .cache before building weapons. See docs/pf2e-weapon-catalog.md.');}
  const weapons=[],excluded=[];
  for(const name of names.sort()){
    const source=JSON.parse(await readFile(new URL(name,root),'utf8'));
    if(source.type==='weapon')weapons.push({source,path:`packs/pf2e/equipment/${name}`});
    else excluded.push({id:source._id,type:source.type,path:name});
  }
  return {sha:WEAPON_SOURCE_SHA,ref:'pf2e-8.6.0',total:names.length,weapons:weapons.sort((a,b)=>a.source.name.localeCompare(b.source.name)),excluded};
}
if(process.argv.includes('--inspect')){
 const s=await weaponSources(),count=key=>Object.fromEntries([...new Set(s.weapons.map(e=>e.source.system[key]))].map(k=>[k,s.weapons.filter(e=>e.source.system[key]===k).length]));
 console.log(JSON.stringify({total:s.total,weapons:s.weapons.length,groups:count('group'),categories:count('category'),examples:s.weapons.filter(e=>/^(Dagger|Longbow|Javelin|Gun Sword|Dagger Pistol|Boomerang|Shuriken|Sling|Fist|Handwraps of Mighty Blows|Alchemist's Fire \(Lesser\)|Spear)$/.test(e.source.name))},null,2));
 await writeFile(new URL('../.cache/weapon-source.json',import.meta.url),JSON.stringify(s));
}
