import {mkdir,readFile,readdir,writeFile,access} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {resolve} from 'node:path';

export const SF2E_REF='sf2e-1.5.1';
export const SF2E_PACKS=['spells','feats','actions','class-features','ancestry-features','equipment','conditions','spell-effects','equipment-effects','feat-effects','bestiary-effects','other-effects'];
export async function sf2eSources(){
 const cache=resolve('.cache/sf2e-source');await mkdir(cache,{recursive:true});
 const assembled=resolve(cache,`${SF2E_REF}-assembled-v2.json`);
 try{return JSON.parse(await readFile(assembled,'utf8'));}catch{}
 let tree;try{tree=JSON.parse(await readFile(resolve(cache,`${SF2E_REF}.json`),'utf8'));}catch{
  const response=await fetch(`https://api.github.com/repos/foundryvtt/pf2e/git/trees/${SF2E_REF}`);
  if(!response.ok)throw Error(`SF2e source unavailable: ${response.status}`);
  tree=await response.json();await writeFile(resolve(cache,`${SF2E_REF}.json`),JSON.stringify(tree));
 }
 const root=`pf2e-${tree.sha}`,base=resolve(cache,root),packs=resolve(base,'packs/sf2e');
 try{await Promise.all([...SF2E_PACKS.map(p=>access(resolve(packs,p))),access(resolve(base,'build/duplicates.json')),access(resolve(base,'system.pf2e.json')),access(resolve(base,'system.sf2e.json')),access(resolve(base,'static/lang/sf2e-overrides-en.json'))]);}catch{
  const archive=resolve(cache,`${tree.sha}.tar.gz`);
  try{await access(archive);}catch{const response=await fetch(`https://codeload.github.com/foundryvtt/pf2e/tar.gz/${tree.sha}`);if(!response.ok)throw Error(`SF2e archive unavailable: ${response.status}`);await writeFile(archive,Buffer.from(await response.arrayBuffer()));}
  await promisify(execFile)('tar',['-xzf',archive,'-C',cache,...SF2E_PACKS.map(p=>`${root}/packs/sf2e/${p}`),`${root}/build/duplicates.json`,`${root}/system.pf2e.json`,`${root}/system.sf2e.json`,`${root}/static/lang/en.json`,`${root}/static/lang/sf2e-overrides-en.json`]);
 }
 const language=JSON.parse(await readFile(resolve(base,'static/lang/en.json'),'utf8'));
 let sfLanguage={};try{sfLanguage=JSON.parse(await readFile(resolve(base,'static/lang/sf2e-overrides-en.json'),'utf8'));}catch{}
 const localize=html=>String(html??'').replace(/@Localize\[([^\]]+)\]/g,(raw,key)=>sfLanguage[key]??language[key]??key.split('.').reduce((v,k)=>v?.[k],sfLanguage)??key.split('.').reduce((v,k)=>v?.[k],language)??raw);
 const [duplicates,pfManifest,sfManifest]=await Promise.all(['build/duplicates.json','system.pf2e.json','system.sf2e.json'].map(p=>readFile(resolve(base,p),'utf8').then(JSON.parse)));
 const remap=Object.fromEntries(pfManifest.packs.flatMap(p=>{const sf=sfManifest.packs.find(s=>s.path===p.path);return sf?[[p.name,sf.name]]:[];}));
 const adjust=value=>typeof value==='string'?Object.entries(remap).reduce((s,[pf,sf])=>s.replaceAll(`Compendium.pf2e.${pf}`,`Compendium.sf2e.${sf}`),value.replaceAll('systems/pf2e','systems/sf2e').replace(/\bflags\.pf2e\./g,'flags.sf2e.')):Array.isArray(value)?value.map(adjust):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='flags'&&v?.pf2e?adjust({...v,sf2e:v.pf2e,pf2e:undefined}):adjust(v)])):value;
 const entries=[];
 for(const pack of SF2E_PACKS)for(const name of await readdir(resolve(packs,pack),{recursive:true})){
  const file=name.replaceAll('\\','/');if(!file.endsWith('.json')||file==='_folders.json')continue;
  const source=JSON.parse(await readFile(resolve(packs,pack,file),'utf8'));if(!source._id)continue;
  if(source.system?.description)source.system.description.value=localize(source.system.description.value);
  entries.push({pack,path:`packs/sf2e/${pack}/${file}`,source});
 }
 // SF2e's official builder imports only its explicitly listed PF2e duplicates.
 // Preserve those native IDs; do not expose the entire Pathfinder catalog.
 const duplicatePacks=SF2E_PACKS.filter(pack=>duplicates.some(g=>g.entries[pack]?.length));
 try{await Promise.all(duplicatePacks.map(p=>access(resolve(base,'packs/pf2e',p))));}catch{await promisify(execFile)('tar',['-xzf',resolve(cache,`${tree.sha}.tar.gz`),'-C',cache,...duplicatePacks.map(p=>`${root}/packs/pf2e/${p}`)]);}
 for(const pack of duplicatePacks){
  const native=new Map();for(const name of await readdir(resolve(base,'packs/pf2e',pack),{recursive:true})){
   const file=name.replaceAll('\\','/');if(!file.endsWith('.json')||file==='_folders.json')continue;const source=JSON.parse(await readFile(resolve(base,'packs/pf2e',pack,file),'utf8'));native.set(source.name,{source,path:`packs/pf2e/${pack}/${file}`});
  }
  for(const group of duplicates)for(const name of group.entries[pack]??[]){const original=native.get(name);if(!original)throw Error(`SF2e shared source missing: ${pack}/${name}`);const source=adjust(original.source);if(group.publication&&source.system?.publication)source.system.publication.title=group.publication;if(source.system?.description)source.system.description.value=localize(source.system.description.value);entries.push({...original,pack,shared:true,source});}
 }
 for(const entry of entries){entry.source=adjust(entry.source);entry.uuid=`Compendium.sf2e.${entry.pack}.Item.${entry.source._id}`;}
 if(new Set(entries.map(e=>e.uuid)).size!==entries.length)throw Error('Duplicate native SF2e compendium IDs.');
 const result={ref:SF2E_REF,version:'1.5.1',sha:tree.sha,repository:'foundryvtt/pf2e',entries:entries.sort((a,b)=>a.source.name.localeCompare(b.source.name)||a.path.localeCompare(b.path))};
 await writeFile(assembled,JSON.stringify(result));return result;
}
if(process.argv.includes('--inspect')){const data=await sf2eSources();console.log(JSON.stringify({ref:data.ref,sha:data.sha,counts:Object.fromEntries(SF2E_PACKS.map(p=>[p,data.entries.filter(e=>e.pack===p).length])),examples:data.entries.filter(e=>/laser pistol|plasma|supercharge weapon|suppressed|overclock|gimme shelter/i.test(e.source.name)).slice(0,12)},null,2));}
