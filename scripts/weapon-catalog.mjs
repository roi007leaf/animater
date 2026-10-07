import {PF2E_WEAPONS,PF2E_WEAPON_SOURCE} from '../data/pf2e-weapons.mjs';
import {weaponRecipe} from './weapon-choreography.mjs';
import {normalize,matchRecipe} from './model.mjs';
export {PF2E_WEAPONS,PF2E_WEAPON_SOURCE,weaponRecipe};
const byId=new Map(PF2E_WEAPONS.map(w=>[w.id,w])),byName=new Map(),byBase=new Map();
for(const w of [...PF2E_WEAPONS].sort((a,b)=>Number(a.edition==='legacy')-Number(b.edition==='legacy')||a.level-b.level)){
 for(const n of [w.name,w.slug])if(!byName.has(normalize(n)))byName.set(normalize(n),w);
 if(w.base&&normalize(w.base)===normalize(w.slug)&&!byBase.has(w.base))byBase.set(w.base,w);
}
export const catalogWeapon=id=>byId.get(String(id).replace(/^pf2e-weapon-/,'').replace(/-(melee|ranged|thrown)$/,''))??null;
export const weaponCustomizationKey=(id,mode)=>`${id}:${mode}`;
export function normalizeWeaponCatalogState(state={}){
 state??={};const ids=list=>[...new Set((Array.isArray(list)?list:[]).map(id=>catalogWeapon(id)?.id).filter(Boolean))];
 return {enabled:state.enabled===true,independent:state.independent===true,scope:state.scope==='selected'?'selected':'all',selected:ids(state.selected),excluded:ids(state.excluded),customized:[...new Set((Array.isArray(state.customized)?state.customized:[]).map(String).filter(k=>{const[id,mode,...extra]=k.split(':');return !extra.length&&byId.get(id)?.modes.some(m=>m.mode===mode);}))],preferCatalog:state.preferCatalog===true,motion:state.motion!==false,sound:state.sound!==false,soundVolume:Number.isFinite(Number(state.soundVolume))?Math.max(0,Math.min(1,Number(state.soundVolume))):.35};
}
export const catalogWeaponEnabled=(id,state)=>state?.enabled===true&&!state.excluded?.includes(id)&&(state.scope!=='selected'||state.selected?.includes(id)===true);
export function useCatalogWeapon(state,id){state=normalizeWeaponCatalogState(state);id=catalogWeapon(id)?.id;if(!id)throw Error('Choose a weapon first.');return normalizeWeaponCatalogState({...state,enabled:true,independent:true,scope:state.enabled?state.scope:'selected',selected:state.enabled?[...state.selected,id]:[id],excluded:state.excluded.filter(k=>k!==id),customized:state.customized.filter(k=>!k.startsWith(id+':'))});}
function catalogForItem(item,itemUuid){
 for(const uuid of [item.uuid,item.original?.uuid,item._stats?.compendiumSource,item.flags?.core?.sourceId,itemUuid])if(uuid?.startsWith('Compendium.pf2e.equipment-srd.')){const w=byId.get(uuid.split('.').at(-1));if(w)return w;}
 return byName.get(normalize(item.system?.slug??item.slug))??byName.get(normalize(item.name))??byBase.get(item.system?.baseItem)??null;
}
export function findCatalogWeapon(event){
 const item=event?.item;if(item?.type!=='weapon')return null;
 const direct=catalogForItem(item,event.itemUuid);if(direct)return direct;
 if((item.category??item.system?.category)!=='unarmed')return null;
 // Match PF2e prepareAttacks: only its first worn, invested, tagged pair
 // supplies the synthetic unarmed attacks. Never infer wraps from a roll name.
 const actor=item.actor??event.actor;
 const wraps=actor?.itemTypes?.weapon?.find(w=>(w.category??w.system?.category)==='unarmed'&&w.system?.traits?.otherTags?.includes('handwraps-of-mighty-blows')&&w.isEquipped===true&&w.isInvested===true);
 const catalog=wraps&&catalogForItem(wraps);
 return catalog?.strikeBinding==='unarmed'?catalog:null;
}
export function resolveAutomaticWeaponRecipe(event,state,custom=[],{customEnabled=true,soundCatalog}={}){
 const weapon=findCatalogWeapon(event),mode=event.weaponMode??weapon?.modes[0]?.mode,key=weaponCustomizationKey(weapon?.id,mode);
 const active=weapon&&event.type==='attack'&&catalogWeaponEnabled(weapon.id,state)&&weapon.modes.some(m=>m.mode===mode);
 const bound={...event,weaponMode:mode,...(weapon?.strikeBinding==='unarmed'?{itemUuid:`Compendium.pf2e.equipment-srd.Item.${weapon.id}`}:{})};
 const configured=customEnabled||active&&state.customized?.includes(key)?custom:[];
 if(active&&(state.selected?.includes(weapon.id)||state.preferCatalog)&&!state.customized?.includes(key))return weaponRecipe(weapon,mode,{motion:state.motion,soundCatalog:state.sound===false?null:soundCatalog,soundVolume:state.soundVolume});
 const saved=matchRecipe(configured,bound);if(saved)return saved;
 if(!active||configured.some(r=>!r.enabled&&matchRecipe([{...r,enabled:true}],bound)))return null;
 return weaponRecipe(weapon,mode,{motion:state.motion,soundCatalog:state.sound===false?null:soundCatalog,soundVolume:state.soundVolume});
}
export function filterWeapons({search='',group='all',mode='all',category='all',edition='all'}={}){const q=normalize(search);return PF2E_WEAPONS.filter(w=>(group==='all'||w.group===group)&&(mode==='all'||w.modes.some(m=>m.mode===mode))&&(category==='all'||w.category===category)&&(edition==='all'||w.edition===edition)&&(!q||normalize(`${w.name} ${w.slug} ${w.traits.join(' ')} ${w.publication} ${w.plainDescription}`).includes(q)));}
