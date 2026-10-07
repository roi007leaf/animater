import {normalizeStateCatalogState,useStateEntry,stateRecipe,catalogStateEntry} from './state-catalog.mjs';
export async function handleStateCatalogAction(w,action,b){
 if(!['select-state','state-auto','state-pause','state-exclude','state-page','state-reset','use-state','copy-state','enable-state-custom'].includes(action))return false;
 const kind=action==='enable-state-custom'?catalogStateEntry(w.recipe()?.stateEntry)?.kind:w.page==='conditions'?'condition':'effect';
 const id=action==='enable-state-custom'?w.recipe()?.stateEntry:w.selectedState[kind],state=normalizeStateCatalogState(w.host.stateCatalogState?.(kind));
 if(action==='select-state'){if(w.selectedState[kind]===b.dataset.id)return true;w.selectedState[kind]=b.dataset.id;w.stageIndex=0;}
 else if(action==='state-page')w.statePages[kind]=Math.max(0,Number(b.dataset.index));
 else if(action==='state-reset'){w.stateFilters[kind]={search:'',group:'all',theme:'all',quality:'all'};w.statePages[kind]=0;}
 else if(action==='copy-state'){
  const recipe=w.recipe()??stateRecipe(catalogStateEntry(id),{catalog:w.host.catalog?.()}),saved=w.host.recipes().find(r=>r.lifecycle==='document'&&r.stateEntry===id&&r.stateDamageType===recipe.stateDamageType);
  if(!saved)await w.host.save([...w.host.recipes(),recipe]);
  await w.host.setStateCatalogState(kind,{customized:[...new Set([...state.customized,id])]});
  w.selected=saved?.id??recipe.id;w.page='recipes';w.search='';w.category='All';w.stageIndex=0;
  w.message='Edit the sustained layers, save, then enable this customization. Its lifetime follows the native document.';
 }else{
  const env=w.host.environment();if(env.demo||env.systemId!=='pf2e'||!env.ready)throw Error('Enable persistent animations inside a PF2e world with Sequencer and JB2A.');
  let change=action==='state-auto'?{enabled:!(state.enabled&&state.scope==='all'),scope:'all'}:action==='state-pause'?{enabled:false}:action==='state-exclude'?{excluded:state.excluded.includes(id)?state.excluded.filter(v=>v!==id):[...state.excluded,id]}:useStateEntry(state,id);
  if(action==='enable-state-custom'){
   if(w.dirty?.has(w.recipe()?.id))throw Error('Save your customization before enabling it.');
   change={...change,customized:[...new Set([...state.customized,id])]};
  }
  await w.host.setStateCatalogState(kind,change);w.message=change.enabled===false?'Catalog paused. Its attached visuals will end.':'Persistent catalog settings updated. Existing native documents are reconciled now.';
 }
 w.render();return true;
}
