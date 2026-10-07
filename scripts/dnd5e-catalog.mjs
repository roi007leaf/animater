import {DND5E_ENTRIES,DND5E_SOURCE} from '../data/dnd5e-catalog.mjs';
import {clone,normalize,validateRecipe,matchRecipe} from './model.mjs';
import {addSpellSounds} from './spell-sounds.mjs';
import {addAbilitySounds} from './ability-sounds.mjs';
import {applyCatalogMotion,dndMotionReview,withoutCatalogMotion} from './catalog-motion.mjs';
import {withCatalogFx} from './catalog-fx.mjs';
export {DND5E_ENTRIES,DND5E_SOURCE};
export const DND_KINDS=['spell','feat','weapon','item','condition','effect'];
const byId=new Map(DND5E_ENTRIES.map(e=>[e.id,e]));
const byUuid=new Map(DND5E_ENTRIES.filter(e=>e.uuid).map(e=>[e.uuid,e]));
export const dndEntries=kind=>kind?DND5E_ENTRIES.filter(e=>e.kind===kind):DND5E_ENTRIES;
export const dndEntry=id=>byId.get(String(id).replace(/^animater-/,''))??null;
export function normalizeDndCatalogState(state={}){
 state??={};const ids=values=>[...new Set((Array.isArray(values)?values:[]).filter(id=>byId.has(id)))];
 return {enabled:state.enabled===true,independent:state.independent===true,preferCatalog:state.preferCatalog===true,scope:state.scope==='selected'?'selected':'all',selected:ids(state.selected),excluded:ids(state.excluded),customized:ids(state.customized),motion:state.motion!==false,sound:state.sound!==false,soundVolume:Number.isFinite(Number(state.soundVolume))?Math.max(0,Math.min(1,Number(state.soundVolume))):.35,opacity:Number.isFinite(Number(state.opacity))?Math.max(.1,Math.min(1,Number(state.opacity))):1};
}
export const dndEntryEnabled=(id,state)=>state?.enabled===true&&!state.excluded?.includes(id)&&(state.scope!=='selected'||state.selected?.includes(id)||state.customized?.includes(id));
export function useDndEntry(state,id){
 if(!byId.has(id))throw Error('Choose a D&D catalog entry first.');
 state=normalizeDndCatalogState(state);
 return normalizeDndCatalogState({...state,enabled:true,independent:true,scope:state.enabled?state.scope:'selected',selected:state.enabled?[...state.selected,id]:[id],excluded:state.excluded.filter(v=>v!==id),customized:state.customized.filter(v=>v!==id)});
}
export function dndRecipe(entry,variantId,{motion=true,sounds,soundVolume=.35,fx=true,fxCatalog}={}){
 if(!entry)throw Error('Choose a D&D catalog entry first.');
 const variant=entry.variants.find(v=>v.id===variantId)??entry.variants[0];
 let recipe=clone(variant.recipe);
 recipe.stages=applyCatalogMotion(entry,recipe.stages,dndMotionReview(entry,variant));
 if(!motion)recipe.stages=withoutCatalogMotion(recipe.stages);
 if(!['condition','effect'].includes(entry.kind)){
  const item={id:entry.id,slug:entry.slug,soundProfile:variant.soundProfile};
  const design={profile:variant.soundProfile,excludeRoles:variant.soundExcludeRoles};
  recipe.stages=variant.soundNamespace==='ability'?addAbilitySounds(item,recipe.stages,{sounds,soundVolume,mode:variant.weaponMode,design}):addSpellSounds(item,recipe.stages,{sounds,soundVolume,design});
 }
 return withCatalogFx(validateRecipe(recipe),entry,{fx,fxCatalog,variant});
}
export function findDndEntry(event){
 const item=event.item;if(!item)return null;
 for(const uuid of [event.itemUuid,item._stats?.compendiumSource,item.flags?.core?.sourceId,item.original?.uuid,item.uuid]){const entry=byUuid.get(uuid);if(entry)return entry;}
 const kind=item.type==='spell'?'spell':item.type==='feat'?'feat':item.type==='weapon'?'weapon':'item';
 const edition=item.system?.source?.rules==='2014'?'2014':item.system?.source?.rules==='2024'?'2024':null;
 const matches=dndEntries(kind).filter(e=>normalize(e.name)===normalize(item.name)||item.system?.identifier&&e.identifier===item.system.identifier);
 return matches.find(e=>e.edition===edition)??matches.find(e=>e.edition==='2024')??matches[0]??null;
}
export function dndVariantForEvent(entry,event){
 const candidates=entry.variants.filter(v=>v.recipe.trigger===event.type&&(!v.weaponMode||v.weaponMode===event.weaponMode||!event.weaponMode));
 return candidates.find(v=>v.activityId===event.activityId)??candidates.find(v=>event.activityName&&normalize(v.activityName)===normalize(event.activityName))??(!event.activityId&&!event.activityName&&candidates.length===1?candidates[0]:null);
}
export function resolveDndAutomaticRecipe(event,stateFor,saved=[],{customEnabled=true,sounds}={}){
 const entry=findDndEntry(event),state=normalizeDndCatalogState(entry&&stateFor(entry.kind));
 const selected=entry&&dndEntryEnabled(entry.id,state),prefer=selected&&(state.selected.includes(entry.id)||state.preferCatalog&&!state.customized.includes(entry.id));
 const custom=customEnabled||selected&&state.customized.includes(entry.id)?saved:[];
 if(!prefer){const match=matchRecipe(custom,event);if(match)return match;}
 if(!selected||['condition','effect'].includes(entry.kind))return null;
 if(!prefer&&custom.some(r=>!r.enabled&&matchRecipe([{...r,enabled:true}],event)))return null;
 const variant=dndVariantForEvent(entry,event);if(!variant)return null;
 const recipe=dndRecipe(entry,variant.id,{motion:state.motion,sounds:state.sound?sounds:null,soundVolume:state.soundVolume});
 // Native cast level supplies the dart count; separate attack-roll beams stay one.
 if(entry.slug==='magic-missile'){
  const count=Math.min(18,Math.max(3,2+(Number(event.spellLevel)||entry.level||1)));
  for(const stage of recipe.stages)if(stage.repeats===3&&stage.repeatScope==='total')stage.repeats=count;
 }
 if(entry.slug==='chain-lightning'){
  const secondary=Math.min(8,3+Math.max(0,(Number(event.spellLevel)||6)-6));
  for(const stage of recipe.stages){
   if(stage.targetSelection==='secondary')stage.targetLimit=secondary;
   if(stage.kind==='impact'||stage.kind==='sound'&&stage.subject==='targets')stage.targetLimit=secondary+1;
  }
 }
 return validateRecipe(recipe);
}
export function filterDndEntries(kind,{search='',edition='all',level='all',theme='all'}={}){
 const query=normalize(search);
 const score=e=>normalize(e.name)===query?3:normalize(e.name).startsWith(query)?2:normalize(e.name).includes(query)?1:0;
 return dndEntries(kind).filter(e=>(edition==='all'||e.edition==='both'||e.edition===edition)&&(level==='all'||e.level===Number(level))&&(theme==='all'||e.theme===theme)&&(!query||normalize(`${e.name} ${e.identifier??''} ${e.descriptionText??''} ${e.group??''}`).includes(query))).sort((a,b)=>query?score(b)-score(a):0);
}
