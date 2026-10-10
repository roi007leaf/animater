import {resolveStateRecipe,findStateEntry,auraStateEntry,normalizeStateCatalogState,PF2E_EFFECTS} from './state-catalog.mjs';
import {planRecipe} from './model.mjs';
import {artworkSize, offsetInGridSquares,tokenFootprint,effectFootprint} from './media-preview.mjs';
import {applyEffectOptions} from './stage-options.mjs';
import {mediaForReference} from './media-library-model.mjs';
import {bodyTreatment} from './condition-body.mjs';

export function activeState(item){
 if(item?.animaterAura){const source=item.animaterAura.source;return source?.type==='effect'?activeState(source):Boolean(source);}
 if(item?.type==='condition')return (item.active??item.system?.active)===true&&(!item.system?.value?.isValued||Number(item.value??item.system.value.value)>0);
 return item?.type==='effect'&&item.isExpired!==true&&item.system?.expired!==true&&item.system?.disabled!==true;
}
export function stateVisible(item,token,{isGM=false,secretConditions=false}={},lookup=findStateEntry){
 if(!token||token.destroyed||token.visible===false)return false;
 if(!isGM&&token.document?.hidden)return false;
 if(isGM)return true;
 if(item.type==='effect'&&(item.animaterAura?.source??item).system?.unidentified===true)return false;
 if(item.type==='condition'&&secretConditions&&!token.actor?.hasPlayerOwner)return false;
 const entry=lookup(item);
 if(entry?.private&&!token.isOwner&&!token.actor?.isOwner)return false;
 return true;
}
// Valued conditions (Frightened 1–4, Clumsy, Drained, Doomed…) grow with their
// value: fainter and slower at 1, full strength, larger and faster at 3+.
export function conditionLevel(item){
 if(item?.type!=='condition'||item.system?.value?.isValued!==true)return 0;
 const value=Number(item.value??item.system.value.value);
 return Number.isFinite(value)&&value>0?Math.min(Math.round(value),4):1;
}
export function levelIntensity(level){
 if(!level)return {opacity:1,scale:1,rate:1};
 // The condition's own art carries the level: faint and calm at 1, larger, brighter and faster at 4.
 return {opacity:[.75,.86,.95,1][level-1],scale:[.9,1.05,1.2,1.35][level-1],rate:[.8,1.15,1.5,1.85][level-1]};
}
export function actorStates(actor,profile){
 const effects=Array.from(actor?.itemTypes?.effect??actor?.items??[]).filter(i=>i.type==='effect');
 // Native prepared conditions include synthetic GrantItem conditions and have
 // already discarded overridden/lower-valued duplicates.
 const conditions=Array.from(actor?.conditions?.active??actor?.itemTypes?.condition??actor?.items??[]).filter(i=>i.type==='condition');
 const auras=nativeAuraStates(actor,profile),emitters=new Set(auras.map(i=>i.animaterAura.source.uuid));
 return [...effects.filter(i=>!emitters.has(i.uuid)),...conditions,...auras];
}
function ruleSlug(rule,item){return rule.slug??item.slug??item.system?.slug??String(item.name??'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
export function nativeAuraStates(actor,{findStateEntry:lookup=findStateEntry,auraStateEntry:auraLookup=auraStateEntry,effects=PF2E_EFFECTS}={}){
 const states=[],items=Array.from(actor?.items??[]);
 for(const aura of actor?.auras?.values?.()??[]){
  if(!Number.isFinite(aura.radius)||aura.radius<=0)continue;
  const hasRule=item=>(item?.rules??item?.system?.rules??[]).some(r=>r.key==='Aura'&&ruleSlug(r,item)===aura.slug&&r.ignored!==true&&(typeof r.test!=='function'||r.test()));
  // PF2e merges same-slug rules (notably kinetic stances). Prepared effect
  // parents identify the actual contributing Items; an arbitrary first rule
  // can instead select the generic kinetic aura and hide all stance artwork.
  const parents=[...new Set((aura.effects??[]).map(e=>e.parent).filter(i=>i&&(items.includes(i)||i.isInMemoryOnly)))];
  const sources=parents.length?parents:items.filter(hasRule),seen=new Set();
  for(const source of sources){
   const links=(aura.effects??[]).filter(e=>e.parent===source);
   const entry=lookup(source)??links.map(e=>auraLookup(e.uuid)).find(Boolean)??effects.find(e=>e.auraSources?.some(s=>s.slug===aura.slug&&[source.sourceId,source._stats?.compendiumSource,source.flags?.core?.sourceId].includes(s.uuid)));
   if(!entry)continue;
   const ability=entry.auraDesign?.id??entry.id;if(seen.has(ability))continue;seen.add(ability);
   states.push({id:`aura-${aura.slug}`,uuid:source.uuid,type:'effect',name:entry.name,system:source.system,animaterAura:{entryId:entry.id,slug:aura.slug,radius:aura.radius,source}});
  }
 }
 return states;
}
const slug=item=>item.slug??item.system?.slug??item.name;
// An effect another creature's aura hands to this one (an ally inside Protective Wards or a
// banner) is drawn token-sized: the aura's ring belongs to its owner, not to every ally in it.
// PF2e marks those copies with flags.pf2e.aura.origin, the aura owner's actor.
export function grantedByOtherAura(item,token){const origin=item?.flags?.pf2e?.aura?.origin;return Boolean(origin)&&origin!==token?.actor?.uuid;}
// A condition that comes with another adds nothing to show. PF2e's Unconscious brings
// Blinded, whose darkness cloud would cover the sleeping token and its sleep symbol.
const IMPLIED={blinded:['unconscious']};
// Conditions about how a creature perceives others are shown through the others: select a Dazzled
// token and everyone else looks Concealed to you. The Dazzled token keeps only its own motion.
export const PERCEPTION={dazzled:'concealed'};
const stateKey=i=>String(slug(i)??'').toLowerCase();
export const motionOnly=i=>i.type==='condition'&&!i.animaterPerceived&&!!PERCEPTION[stateKey(i)];
export function shownStates(states){
 const on=new Set(states.filter(i=>i.type==='condition').map(stateKey));
 return states.filter(i=>!(i.type==='condition'&&IMPLIED[stateKey(i)]?.some(s=>on.has(s))));
}
// How the selected observer sees this token: a stand-in Concealed condition (this client only).
export function perceivedStates(observerSlugs,token,observer){
 if(!observer||observer===token)return [];
 const slugs=new Set([...observerSlugs].map(s=>String(s).toLowerCase()));
 const seen=Object.entries(PERCEPTION).find(([cause])=>slugs.has(cause))?.[1];
 if(!seen)return [];
 return [{id:`perceived-${seen}`,uuid:`perceived:${token.id}:${seen}`,type:'condition',slug:seen,name:seen[0].toUpperCase()+seen.slice(1),system:{slug:seen,active:true},active:true,animaterPerceived:true}];
}
export function stateDocumentKey(item){return item.animaterAura?`aura:${item.animaterAura.slug}:${item.uuid}`:item.type==='condition'?`condition:${slug(item)}:${item.system?.persistent?.damageType??''}`:`effect:${item.uuid??item.id}`;}
export function storedStateDocument(item){
 const visited=new Set();let current=item.animaterAura?.source??item;
 while(current?.isInMemoryOnly){if(visited.has(current.id))return null;visited.add(current.id);current=current.appliedBy??current.grantedBy;}
 // Derived conditions (Off-Guard from Grabbed, Quickened from Haste) carry an
 // embedded-looking UUID that no stored document answers; Sequencer cannot tie
 // to it, so those layers tie to the token and end through state reconciliation.
 const owner=current?.parent;
 if(current?.id&&owner?.items&&typeof owner.items.has==='function'&&!owner.items.has(current.id))return null;
 return current?.uuid??null;
}

// Each client derives its own visible layers from native documents. Persistent
// Sequencer media is temporary/local: no socket playback or stale scene flags.
export class PersistentStates{
 constructor(host){this.host=host;this.active=new Map();this.serial=0;this.revision=0;this.timer=null;this.closed=false;this.pending=new Set();}
 async end(record){this.host.body?.remove(record.name);await Promise.all([this.host.end(record.name),this.host.stopFx?.(record.name)]);}
 schedule(){if(this.closed)return;clearTimeout(this.timer);this.timer=setTimeout(()=>{this.timer=null;void this.reconcile().catch(e=>this.host.trace?.('Blocked',`Persistent effects: ${e.message}`));},35);}
 // Would a lasting animation show for this condition or effect (its catalog on, or your own
 // version)? Taking over Automated Animations stops AA's animation for the same document.
 covers(item){
  const h=this.host;if(this.closed||!item||!h.ready?.())return false;
  try{
   const state=(h.normalizeState??normalizeStateCatalogState)(h.state(h.stateKind?.(item)??item.type));
   const recipe=(h.resolveStateRecipe??resolveStateRecipe)(item,state,h.recipes?.()??[],h.catalog(),{customEnabled:h.customEnabled?.()??true});
   return Boolean(recipe?.stages?.some(s=>['aura','tokenfx'].includes(s.kind)&&s.persist));
  }catch{return false;}
 }
 accepts(name){if(!String(name??'').startsWith(`animater-state-${this.host.clientId}-`))return true;return !this.closed&&[...this.active.values()].some(r=>r.name===name&&!r.cancelled);}
 async reconcile(){
  const revision=++this.revision,desired=new Map(),h=this.host;
  if(!this.closed&&h.ready()){
   const saved=h.recipes?.()??[],catalog=h.catalog(),visibility=h.visibility?.()??{},scene=h.sceneId();
   // The device quality setting caps how many states each token shows.
   const budget=h.budget?.()??{states:Infinity,layers:Infinity};
   for(const token of h.tokens()){
    if(!token.actor)continue;
    let shown=0;
    const states=shownStates([...(h.actorStates??actorStates)(token.actor),...(h.perceivedStates?.(token)??[])]);
    for(const item of states){
     if(shown>=budget.states)break;
     if(!(h.activeState??activeState)(item)||!(h.stateVisible??stateVisible)(item,token,visibility))continue;
     const state=(h.normalizeState??normalizeStateCatalogState)(h.state(h.stateKind?.(item)??item.type)),recipe=(h.resolveStateRecipe??resolveStateRecipe)(item,state,saved,h.catalog(),{customEnabled:h.customEnabled?.()??true});if(!recipe||!recipe.stages.some(s=>['aura','tokenfx'].includes(s.kind)&&s.persist))continue;
     const key=`${scene}:${token.document?.uuid??token.id}:${(h.documentKey??stateDocumentKey)(item)}`;
     const signature=JSON.stringify([recipe,state.opacity,tokenFootprint(token,h.gridSize()),token.mechanicalBounds?.width,token.mesh?.uid,token.document?.texture?.src,h.gridDistance?.()??5,(h.storedDocument??storedStateDocument)(item),item.uuid,item.system?.badge?.value,item.value??item.system?.value?.value,item.system?.persistent?.damageType,grantedByOtherAura(item,token)]);
     if(!desired.has(key)){desired.set(key,{key,signature:signature+JSON.stringify(budget)+(state.motion===false?'still':'')+(motionOnly(item)?'body':''),token,item,recipe,opacity:state.opacity,motion:state.motion!==false,bodyOnly:motionOnly(item)});shown++;}
    }
   }
  }
  // A state that changed (Frightened 2 becoming 1 at the end of a turn) keeps showing until its
  // replacement is up, so it never blinks out; states that are gone end now.
  const stops=[],replaced=new Map();
  for(const [key,record] of this.active){const d=desired.get(key);if(d?.signature===record.signature)continue;this.active.delete(key);if(d)replaced.set(key,record);else{record.cancelled=true;stops.push(this.end(record));}}
  await Promise.all(stops);
  const retire=key=>{const old=replaced.get(key);if(!old)return;replaced.delete(key);old.cancelled=true;return this.end(old);};
  if(revision!==this.revision){await Promise.all([...replaced.keys()].map(retire));return;}
  const replacing=new Set();
  for(const [key,d] of desired){
   if(this.closed||this.active.has(key))continue;
   replacing.add(key);
   const record={...d,name:`animater-state-${h.clientId}-${++this.serial}`,cancelled:false};this.active.set(key,record);
   const work=this.start(record).then(()=>retire(key),async error=>{await retire(key);if(this.active.get(key)===record)this.active.delete(key);await this.end(record);h.trace?.('Blocked',`${record.recipe.name}: ${error.message}`);});
   this.pending.add(work);void work.finally(()=>this.pending.delete(work));
  }
  // Anything changed but not restarted (the manager closed meanwhile) ends now.
  await Promise.all([...replaced.keys()].filter(key=>!replacing.has(key)).map(retire));
  h.changed?.(this.active.size);
 }
 async start(r){
  const h=this.host,catalog=h.catalog(),grid=h.gridSize();
  const plan=planRecipe(r.recipe,catalog,{source:r.token,targets:[],gridSize:grid});
  const sequence=h.sequence();
  // Inside someone else's aura: a quiet copy (one telling layer, token-sized, a little dimmer). The ring is the owner's.
  const granted=grantedByOtherAura(r.item,r.token);
  // An ally's copy keeps the aura's most telling layer (its glyph, orbit, flame), not the plain ring every
  // aura shares, so different auras stay recognisable on the allies inside them. Sparse footage (glints,
  // motes, streaks) vanishes at token size, so it comes with the aura's own coloured ring.
  const lasting=plan.filter(s=>s.kind==='aura'&&s.persist),generic=s=>/template_circle\.aura\.|token_border\./.test(String(s.asset));
  const sparse=s=>/twinkling_stars\.|particles\.|wind_lines\.|swirling_leaves\.|butterflies\./.test(String(s.asset));
  const telling=lasting.find(s=>!generic(s)&&!sparse(s))??lasting.find(s=>!generic(s))??lasting[0];
  const allyCopy=!telling?[]:sparse(telling)?[lasting.find(generic),telling].filter(Boolean):[telling];
  const shown=r.bodyOnly?[]:granted?allyCopy:lasting;
  const budget=h.budget?.()??{layers:Infinity},level=levelIntensity(conditionLevel(r.item)),maxLayers=granted?Math.min(shown.length,budget.layers):budget.layers;
  let layers=0;
  for(const s of shown){
   if(layers++>=maxLayers)continue;
   const media=mediaForReference(catalog,s.asset);
   const e=sequence.effect().file(s.asset).name(r.name).origin(r.item.uuid??r.recipe.itemUuid)
    .attachTo(r.token,{offset:offsetInGridSquares(s,r.token,grid),gridUnits:true,bindRotation:s.bindRotation,bindAlpha:true,bindVisibility:true,bindElevation:true})
    .size(artworkSize(effectFootprint(granted?{...s,auraRadius:0}:s,r.token,grid,h.gridDistance?.()??5)*(granted&&s.auraRadius?Math.min(s.scale,1):s.scale)*level.scale,media)).opacity(Math.min(1,s.opacity*r.opacity*level.opacity*(granted?.8:1)))
    .persist().temporary().delay(s.delay).fadeIn(s.fadeIn).fadeOut(s.fadeOut);
   // A perceived Concealed/Hidden is a stand-in with no document of its own: tie it to the token only.
   const documents=[r.token.document?.uuid,r.item.animaterPerceived?null:(h.storedDocument??storedStateDocument)(r.item)].filter(Boolean);
   if(documents.length)e.tieToDocuments(documents);
   applyEffectOptions(e,{...s,oneShot:false,playbackRate:(s.playbackRate??1)*level.rate});
   if(s.below)e.belowTokens();else if(s.above)e.elevation(1);if(s.maskToken)e.mask(r.token);
  }
  if(r.cancelled||this.closed)return;
  const filters=r.bodyOnly?[]:plan.filter(s=>s.kind==='tokenfx'&&s.persist);
  if(filters.length)await Promise.all(filters.map(async stage=>{
   try { await h.retainFx?.({...stage,destination:r.token},{session:r.name}); }
   catch(error){h.trace?.('Skipped',`Token Magic FX: ${error.message}`);}
  }));
  if(r.cancelled||this.closed||this.active.get(r.key)!==r){await this.end(r);return;}
  h.trace?.('Persistent',`${r.recipe.name} follows ${r.token.name??'token'} while its condition or effect lasts.`);
  if(shown.length)await sequence.play({local:true});
  // Removal/scene changes can race asynchronous texture loading.
  if(r.cancelled||this.closed||this.active.get(r.key)!==r){await this.end(r);return;}
  // The creature itself reacts (trembles, sways, turns to stone…) while the state lasts.
  if(r.motion!==false)h.body?.add(r.name,r.token,bodyTreatment(r.item.name??r.recipe.name),{strength:level.scale});
 }
 async clear(){++this.revision;clearTimeout(this.timer);this.timer=null;const records=[...this.active.values()];this.active.clear();for(const r of records)r.cancelled=true;await Promise.all(records.map(r=>this.end(r)));}
 async destroy(){this.closed=true;await this.clear();}
}
