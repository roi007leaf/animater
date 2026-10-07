import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assetDatabases,variantFiles} from './asset-databases.mjs';
import {assetGeometry} from './spell-asset-selection.mjs';
import {availabilityEntries} from './audit-catalog-availability.mjs';

const snapshot=new URL('../.cache/jb2a-update-before.json',import.meta.url);
export function catalogChoices(db){
 const inventories=Object.fromEntries(Object.entries(db).map(([edition,rows])=>[edition,new Set(rows.map(r=>r.key))]));
 return availabilityEntries().map(e=>({system:e.system,kind:e.kind,id:e.item.id,name:e.item.name,variant:e.variant??'',stages:e.build().stages.filter(s=>s.assets?.length&&s.kind!=='sound').map(s=>({id:s.stageId,kind:s.kind,assets:s.assets,selected:Object.fromEntries(Object.entries(inventories).map(([edition,keys])=>[edition,s.assets.find(key=>keys.has(key))??null]))}))}));
}
export async function auditJb2aUpdate({capture=false}={}){
 const db=await assetDatabases(),manifest=JSON.parse(await readFile(new URL('../../jb2a_patreon/module.json',import.meta.url),'utf8'));
 const previous=JSON.parse(await readFile(new URL('../.cache/persistent-databases.json',import.meta.url),'utf8')).patreon;
 const old=new Map(previous.map(r=>[r.key,r])),added=db.patreon.filter(r=>!old.has(r.key)),removed=previous.filter(r=>!db.patreon.some(n=>n.key===r.key));
 const changed=db.patreon.filter(r=>old.has(r.key)&&JSON.stringify(variantFiles(r))!==JSON.stringify(variantFiles(old.get(r.key))));
 const choices=catalogChoices(db);
 if(capture){await mkdir(new URL('../.cache/',import.meta.url),{recursive:true});await writeFile(snapshot,JSON.stringify(choices,null,2)+'\n');}
 const before=JSON.parse(await readFile(snapshot,'utf8'));
 const identity=e=>`${e.system}/${e.kind}/${e.id}/${e.variant}`,beforeMap=new Map(before.map(e=>[identity(e),e])),substitutions=[];
 for(const e of choices){
  const oldEntry=beforeMap.get(identity(e));
  for(const s of e.stages){const oldStage=oldEntry?.stages.find(o=>o.id===s.id);if(!oldStage)continue;
   for(const edition of Object.keys(db))if(oldStage.selected[edition]!==s.selected[edition])substitutions.push({system:e.system,kind:e.kind,id:e.id,name:e.name,variant:e.variant,stage:s.id,edition,before:oldStage.selected[edition],after:s.selected[edition]});
  }
 }
 const keys=new Set(added.map(r=>r.key)),families={};
 for(const row of added){const family=row.key.split('.')[1],group=families[family]??={keys:0,geometries:{},examples:[]};group.keys++;const geometry=assetGeometry(row);group.geometries[geometry]=(group.geometries[geometry]??0)+1;if(group.examples.length<12)group.examples.push({key:row.key,file:row.file,metadata:row.metadata});}
 const usage={};
 for(const e of choices){const group=`${e.system}/${e.kind}`,u=usage[group]??={entries:0,entriesUsingAddedKeys:0,addedKeys:new Set()};u.entries++;const selected=e.stages.map(s=>s.selected.patreon).filter(key=>keys.has(key));if(selected.length)u.entriesUsingAddedKeys++;for(const key of selected)u.addedKeys.add(key);}
 for(const u of Object.values(usage))u.addedKeys=[...u.addedKeys].sort();
 const summary={configurations:choices.length,
  configurationsPreviouslyUsingAddedKeys:before.filter(e=>e.stages.some(s=>keys.has(s.selected.patreon))).length,
  configurationsUsingAddedKeys:Object.values(usage).reduce((n,u)=>n+u.entriesUsingAddedKeys,0),
  newlyAdoptedConfigurations:new Set(substitutions.filter(s=>s.edition==='patreon'&&keys.has(s.after)).map(s=>`${s.system}/${s.kind}/${s.id}/${s.variant}`)).size,
  addedKeysInUse:new Set(Object.values(usage).flatMap(u=>u.addedKeys)).size,
  substitutionsToAddedKeys:substitutions.filter(s=>keys.has(s.after)).length};
 const report={installedVersion:manifest.version,baselineKeys:previous.length,currentKeys:db.patreon.length,addedKeys:added.map(r=>r.key),removedKeys:removed.map(r=>r.key),retargetedKeys:changed.map(r=>({key:r.key,before:variantFiles(old.get(r.key)),after:variantFiles(r)})),families,summary,usage,substitutions};
 await writeFile(new URL('../data/jb2a-update-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=await auditJb2aUpdate({capture:process.argv.includes('--capture')});
 console.log(JSON.stringify({version:report.installedVersion,baseline:report.baselineKeys,current:report.currentKeys,added:report.addedKeys.length,removed:report.removedKeys.length,retargeted:report.retargetedKeys.length,addedFamilies:Object.keys(report.families).length,...report.summary,usage:Object.fromEntries(Object.entries(report.usage).map(([name,u])=>[name,{entries:u.entries,usingNew:u.entriesUsingAddedKeys,newKeys:u.addedKeys.length}])),substitutions:report.substitutions.length},null,2));
}
