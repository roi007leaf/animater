import test from 'node:test';
import assert from 'node:assert/strict';
import {PersistentStates,activeState,stateVisible,storedStateDocument,nativeAuraStates,shownStates} from '../scripts/persistent-states.mjs';
import {PF2E_CONDITIONS,PF2E_EFFECTS,stateRecipe,useStateEntry} from '../scripts/state-catalog.mjs';
const fear=PF2E_CONDITIONS.find(e=>e.slug==='frightened'),damage=PF2E_CONDITIONS.find(e=>e.slug==='persistent-damage'),bless=PF2E_EFFECTS.find(e=>e.name==='Spell Effect: Bless');
const native=(e,id='i')=>({id,uuid:`Actor.a.Item.${id}`,type:e.kind,name:e.name,slug:e.kind==='condition'?e.slug:undefined,sourceId:e.uuid,system:{active:true,value:{isValued:e.kind==='condition',value:1}},active:true});
function fixture(items=[native(fear)]){
 const calls=[],waits=[],actor={items,hasPlayerOwner:true,isOwner:true},token={id:'t',name:'Caster',document:{uuid:'Scene.s.Token.t'},actor,visible:true,isOwner:true,w:100,h:100},states={condition:{enabled:true,scope:'all'},effect:{enabled:true,scope:'all'}};
 let scene='s',tokens=[token],saved=[],ready=true,visibility={isGM:true},pending=false;
 const h={clientId:'client1',ready:()=>ready,sceneId:()=>scene,tokens:()=>tokens,recipes:()=>saved,state:k=>states[k],visibility:()=>visibility,gridSize:()=>100,catalog:()=>[...PF2E_CONDITIONS,...PF2E_EFFECTS].flatMap(e=>[...e.assets,...Object.values(e.damageVariants??{}).flatMap(v=>v.assets),...(e.auraDesign?.layers??[]).flatMap(l=>l.assets),...Object.values(e.auraDesign?.variants??{}).flatMap(v=>v.layers.flatMap(l=>l.assets))]).map(key=>({key,file:'marker.webm',width:400,height:400})),
 end:async name=>{calls.push(['end',name]);const wait=waits.find(w=>w.name===name);if(wait)wait.resolve();},sequence:()=>{let name;const seq={effect:()=>new Proxy({}, {get:(_,method)=>(...args)=>{calls.push([method,...args]);if(method==='name')name=args[0];return proxy;}}),play:options=>{calls.push(['play',options]);if(!pending)return Promise.resolve();return new Promise(resolve=>waits.push({name,resolve}));}};const proxy=new Proxy({}, {get:(_,method)=>(...args)=>{calls.push([method,...args]);if(method==='name')name=args[0];return proxy;}});seq.effect=()=>proxy;return seq;}};
 const manager=new PersistentStates(h);
 return {manager,calls,token,actor,states,items,waits,setScene:v=>scene=v,setTokens:v=>tokens=v,setSaved:v=>saved=v,setReady:v=>ready=v,setVisibility:v=>visibility=v,setPending:v=>pending=v};
}
const flush=()=>new Promise(r=>setTimeout(r,0));
const stateFxCatalog={tokenReady:true,sceneReady:false,presets:[{name:'blur',library:'tmfx-main'}],effects:[]};
test('native expiry, visibility, mesh recreation and catalog FX changes clean document-linked filters',async()=>{
 const entry=PF2E_CONDITIONS.find(e=>e.slug==='concealed'),item=native(entry),f=fixture([item]),retained=new Set();let enabled=true;
 f.token.mesh={uid:1};f.manager.host.resolveStateRecipe=()=>stateRecipe(entry,{fx:enabled,fxCatalog:stateFxCatalog});
 f.manager.host.retainFx=async(stage,{session})=>{assert.equal(stage.destination,f.token);assert.equal(stage.persist,true);retained.add(session);};
 f.manager.host.stopFx=async session=>retained.delete(session);
 await f.manager.reconcile();await flush();assert.equal(retained.size,1);
 const first=[...retained][0];await f.manager.reconcile();await flush();assert.ok(retained.has(first));
 f.token.mesh.uid=2;await f.manager.reconcile();await flush();assert.equal(retained.size,1);assert.ok(!retained.has(first));
 enabled=false;await f.manager.reconcile();await flush();assert.equal(retained.size,0);assert.equal(f.manager.active.size,1,'JB2A remains');
 enabled=true;await f.manager.reconcile();await flush();assert.equal(retained.size,1);
 f.token.visible=false;await f.manager.reconcile();assert.equal(retained.size,0);
 f.token.visible=true;await f.manager.reconcile();await flush();assert.equal(retained.size,1);
 f.actor.items=[];await f.manager.reconcile();assert.equal(retained.size,0);
 await f.manager.destroy();
});
test('a failed optional persistent shader never prevents the native JB2A state layer',async()=>{
 const entry=PF2E_CONDITIONS.find(e=>e.slug==='concealed'),f=fixture([native(entry)]),traces=[];
 f.manager.host.resolveStateRecipe=()=>stateRecipe(entry,{fxCatalog:stateFxCatalog});
 f.manager.host.retainFx=async()=>{throw Error('Shader failed');};f.manager.host.trace=(...args)=>traces.push(args);
 await f.manager.reconcile();await flush();assert.equal(f.calls.filter(c=>c[0]==='play').length,1);
 assert.equal(f.manager.active.size,1);assert.ok(traces.some(t=>t[0]==='Skipped'&&t[1].includes('Shader failed')));
 await f.manager.destroy();
});
test('Off-Guard and Wounded persistent canvas effects attach centered on small, large and rectangular tokens',async()=>{
 for(const slug of ['off-guard','wounded'])for(const [w,h] of [[100,100],[200,200],[100,200]]){
  const entry=PF2E_CONDITIONS.find(e=>e.slug===slug),f=fixture([native(entry)]);
  Object.assign(f.token,{w,h});await f.manager.reconcile();
  assert.deepEqual(f.calls.find(c=>c[0]==='attachTo')[2].offset,{x:0,y:0},`${slug} ${w}x${h}`);
  assert.ok(!f.calls.some(c=>c[0]==='atLocation'), 'offset must be applied only once');
  await f.manager.destroy();
 }
});
test('Unconscious uses its installed edition visible-symbol anchor in native Sequencer playback',async()=>{
 const entry=PF2E_CONDITIONS.find(e=>e.slug==='unconscious');
 for(const edition of ['free','patreon']){
  const media=entry.conditionDesign.layers[0].editions[edition],f=fixture([native(entry)]);
  f.manager.host.catalog=()=>[{key:media.key,file:media.files[0],width:400,height:400}];
  await f.manager.reconcile();
  assert.deepEqual(f.calls.find(c=>c[0]==='anchor')[1],media.anchor);
  assert.deepEqual(f.calls.find(c=>c[0]==='attachTo')[2].offset,{x:0,y:-.2});
  await f.manager.destroy();
 }
});
test('active states start once, attach to native token and Item, stay indefinitely, and end only their own namespace on removal',async()=>{
 const f=fixture();f.setPending(true);await f.manager.reconcile();await f.manager.reconcile();
 assert.equal(f.calls.filter(c=>c[0]==='play').length,1);assert.deepEqual(f.calls.find(c=>c[0]==='play')[1],{local:true});
 assert.ok(f.calls.some(c=>c[0]==='persist'));assert.ok(f.calls.some(c=>c[0]==='temporary'));assert.ok(!f.calls.some(c=>c[0]==='duration'));
 assert.deepEqual(f.calls.find(c=>c[0]==='tieToDocuments')[1],['Scene.s.Token.t','Actor.a.Item.i']);
 assert.equal(f.calls.find(c=>c[0]==='attachTo')[2].bindVisibility,true);
 const name=[...f.manager.active.values()][0].name;assert.ok(name.startsWith('animater-state-client1-'));
 f.actor.items=[];await f.manager.reconcile();await flush();assert.equal(f.manager.active.size,0);assert.ok(f.calls.some(c=>c[0]==='end'&&c[1]===name));
});
test('effect expiry without deletion, secret visibility, and catalog pause remove retained visual layers',async()=>{
 const item=native(bless),f=fixture([item]);await f.manager.reconcile();assert.equal(f.manager.active.size,1);
 item.isExpired=true;await f.manager.reconcile();assert.equal(f.manager.active.size,0);assert.equal(f.actor.items.length,1);
 item.isExpired=false;await f.manager.reconcile();item.system.unidentified=true;f.setVisibility({isGM:false});await f.manager.reconcile();assert.equal(f.manager.active.size,0);
 f.setVisibility({isGM:true});await f.manager.reconcile();f.states.effect.enabled=false;await f.manager.reconcile();assert.equal(f.manager.active.size,0);
});
test('native Form a Flock aura covers its ten-foot reach beyond the bearer footprint',async()=>{
 const entry=PF2E_EFFECTS.find(e=>e.name==='Aura: Form a Flock'),item=native(entry),f=fixture([item]);
 item.system.rules=[{key:'Aura',radius:10}];
 f.actor.auras=new Map([[entry.slug,{slug:entry.slug,radius:10,effects:[]}]]);
 await f.manager.reconcile();
 assert.equal(f.calls.find(c=>c[0]==='size')[1].width,500);
 await f.manager.destroy();
});
test('prepared radius drives dynamic aura growth, grid distance changes and cleanup',async()=>{
 const entry=PF2E_EFFECTS.find(e=>e.name==='Aura: Manifest Will'),item=native(entry),f=fixture([item]);
 item.system.rules=[{key:'Aura',slug:'manifest-will',radius:'@item.flags.pf2e.auraRadius'}];
 const aura={slug:'manifest-will',radius:10,effects:[]};f.actor.auras=new Map([[aura.slug,aura]]);
 await f.manager.reconcile();const first=[...f.manager.active.values()][0].name;
 assert.equal(f.calls.find(c=>c[0]==='size')[1].width,500);
 aura.radius=20;await f.manager.reconcile();
 assert.equal(f.calls.filter(c=>c[0]==='size').at(-1)[1].width,900);
 assert.ok(f.calls.some(c=>c[0]==='end'&&c[1]===first));
 f.manager.host.gridDistance=()=>10;await f.manager.reconcile();
 assert.equal(f.calls.filter(c=>c[0]==='size').at(-1)[1].width,500);
 f.actor.auras.clear();await f.manager.reconcile();
 assert.ok([...f.manager.active.values()].every(r=>!r.item.animaterAura));
 await f.manager.destroy();
});
test('Demon\'s Knot emits thirty feet from equipment bearer; its penalty recipient stays token-sized',async()=>{
 const entry=PF2E_EFFECTS.find(e=>e.name==="Aura: Demon's Knot"),recipient=native(entry),f=fixture([recipient]);
 assert.equal(stateRecipe(entry).stages[0].auraRadius,30);
 const source={id:'knot',uuid:'Actor.a.Item.knot',name:"Demon's Knot",type:'equipment',sourceId:entry.auraSources.find(s=>s.slug==='demons-knot').uuid,system:{rules:[{key:'Aura',slug:'demons-knot',radius:30}]}};
 f.actor.items.push(source);f.actor.auras=new Map([['demons-knot',{slug:'demons-knot',radius:30,effects:[{parent:source,uuid:"Compendium.pf2e.equipment-effects.Item.Aura: Demon's Knot"}]}]]);
 await f.manager.reconcile();
 const fields=[...f.manager.active.values()].filter(r=>r.item.animaterAura);
 assert.equal(fields.length,1);assert.equal(fields[0].recipe.stages[0].auraRadius,30);
 assert.ok(f.calls.some(c=>c[0]==='size'&&c[1].width===1300));
 assert.ok(f.calls.some(c=>c[0]==='size'&&c[1].width===150));
 assert.ok(f.calls.some(c=>c[0]==='tieToDocuments'&&c[1].includes(source.uuid)));
 f.actor.items=[recipient];f.actor.auras.clear();await f.manager.reconcile();
 assert.equal(f.manager.active.size,1);assert.equal([...f.manager.active.values()][0].recipe.stages[0].auraRadius,undefined);
 await f.manager.destroy();
});
test('multiple prepared auras from one Item retain separate keys and disappear independently',async()=>{
 const entry=PF2E_EFFECTS.find(e=>e.auras?.length===2),item=native(entry),f=fixture([item]);
 item.system.rules=entry.auras.map((a,i)=>({key:'Aura',slug:`${a.slug}-${i}`,radius:10}));
 f.actor.auras=new Map(entry.auras.map((a,i)=>[`${a.slug}-${i}`,{slug:`${a.slug}-${i}`,radius:10+i*5,effects:[]}]));
 assert.equal(nativeAuraStates(f.actor).length,2);await f.manager.reconcile();assert.equal(f.manager.active.size,2);
 f.actor.auras.delete(`${entry.auras[0].slug}-0`);await f.manager.reconcile();assert.equal(f.manager.active.size,1);
 await f.manager.destroy();
});
test('all field layers share one native lifetime and end together when an emitter disappears',async()=>{
 const entry=PF2E_EFFECTS.find(e=>e.name==='Aura: Protective Wards'),item=native(entry),f=fixture([item]);
 item.system.rules=[{key:'Aura',slug:'protective-wards',radius:15}];f.actor.auras=new Map([['protective-wards',{slug:'protective-wards',radius:15,effects:[]}]]);
 await f.manager.reconcile();assert.equal(f.calls.filter(c=>c[0]==='file').length,2);
 const names=f.calls.filter(c=>c[0]==='name').map(c=>c[1]);assert.equal(new Set(names).size,1);
 assert.ok(f.calls.filter(c=>c[0]==='tieToDocuments').every(c=>c[1].includes(item.uuid)));
 f.actor.items=[];f.actor.auras.clear();await f.manager.reconcile();assert.equal(f.manager.active.size,0);
 assert.equal(f.calls.filter(c=>c[0]==='end'&&c[1]===names[0]).length,1);await f.manager.destroy();
});
test('multiple actual contributors to a merged aura retain their own designs and final native radius',()=>{
 const one=PF2E_EFFECTS.find(e=>e.name==='Stance: Shattershields'),two=PF2E_EFFECTS.find(e=>e.name==='Stance: Kindle Inner Flames');
 const a=native(one,'plates'),b=native(two,'embers');for(const item of [a,b])item.system.rules=[{key:'Aura',slug:'kinetic-aura',radius:10}];
 const actor={items:[a,b],auras:new Map([['kinetic-aura',{slug:'kinetic-aura',radius:20,effects:[{parent:a},{parent:b}]}]])};
 const states=nativeAuraStates(actor);assert.deepEqual(states.map(i=>i.animaterAura.entryId),[one.id,two.id]);assert.ok(states.every(i=>i.animaterAura.radius===20));
});
test('lower duplicate and overridden conditions stay quiet; value handover changes tie document',async()=>{
 const lower=native(fear,'low'),higher=native(fear,'high');lower.active=false;higher.system.value.value=2;const f=fixture([lower,higher]);await f.manager.reconcile();assert.equal(f.manager.active.size,1);
 higher.active=false;lower.active=true;await f.manager.reconcile();
 // Same condition key can change backing native Item; never retain its old tie.
 assert.ok(f.calls.filter(c=>c[0]==='tieToDocuments').some(c=>c[1].includes(lower.uuid)));
 lower.active=false;await f.manager.reconcile();assert.equal(f.manager.active.size,0);
});
test('persistent damage types have separate identities and tracks disappear independently',async()=>{
 const fire=native(damage,'fire'),bleed=native(damage,'bleed');fire.system.persistent={damageType:'fire'};bleed.system.persistent={damageType:'bleed'};const f=fixture([fire,bleed]);await f.manager.reconcile();assert.equal(f.manager.active.size,2);
 assert.ok(f.calls.some(c=>c[0]==='file'&&/flames/.test(c[1])));assert.ok(f.calls.some(c=>c[0]==='file'&&/drop/.test(c[1])));
 f.actor.items=[bleed];await f.manager.reconcile();assert.equal(f.manager.active.size,1);
});
test('scene clear, token deletion, and reload rebuild still-active states without stale flags',async()=>{
 const f=fixture();await f.manager.reconcile();const first=[...f.manager.active.values()][0].name;await f.manager.clear();assert.equal(f.manager.accepts(first),false);
 f.setScene('new-scene');await f.manager.reconcile();assert.equal(f.manager.active.size,1);assert.notEqual([...f.manager.active.values()][0].name,first);
 f.setTokens([]);await f.manager.reconcile();assert.equal(f.manager.active.size,0);
 f.setTokens([f.token]);await f.manager.reconcile();f.setReady(false);await f.manager.reconcile();assert.equal(f.manager.active.size,0);await f.manager.destroy();
});
test('local viewer gates never change native documents or reveal unidentified / unseen states',()=>{
 const token={visible:true,isOwner:true,actor:{isOwner:true,hasPlayerOwner:true},document:{}},effect=native(bless);
 effect.system.unidentified=true;assert.equal(stateVisible(effect,token,{isGM:false}),false);
 token.visible=false;assert.equal(stateVisible(effect,token,{isGM:true}),false);token.visible=true;token.document.hidden=true;assert.equal(stateVisible(effect,token,{isGM:false}),false);
 token.document.hidden=false;token.actor.hasPlayerOwner=false;assert.equal(stateVisible(native(fear),token,{secretConditions:true}),false);
 assert.equal(activeState({...native(fear),active:false}),false);assert.equal(activeState({...effect,isExpired:true}),false);
});
test('derived conditions tie to stored granters; granter cycles fail closed; ownership transitions clear visuals',async()=>{
 const grant=native(bless,'grant'),derived={...native(fear,'derived'),isInMemoryOnly:true,appliedBy:grant},f=fixture([grant]);f.actor.conditions={active:[derived]};await f.manager.reconcile();
 assert.ok(f.calls.filter(c=>c[0]==='tieToDocuments').every(c=>!c[1].includes(derived.uuid)));
 assert.equal(storedStateDocument(derived),grant.uuid);derived.appliedBy=derived;assert.equal(storedStateDocument(derived),null);
 const hidden=PF2E_CONDITIONS.find(e=>e.slug==='hidden');f.actor.conditions.active=[native(hidden)];f.actor.items=[];await f.manager.reconcile();f.setVisibility({isGM:false});f.token.isOwner=false;f.actor.isOwner=false;await f.manager.reconcile();assert.equal(f.manager.active.size,0);
});
test('custom edits replace exact layers, disabled recipes stop them, and deletion during startup cancels late-created effects',async()=>{
 const f=fixture(),custom={...stateRecipe(fear),name:'Quiet Fear'};f.states.condition={...useStateEntry({},fear.id),customized:[fear.id]};f.setSaved([custom]);await f.manager.reconcile();const old=[...f.manager.active.values()][0].name;
 f.setSaved([{...custom,stages:custom.stages.map(s=>({...s,scale:1.5}))}]);await f.manager.reconcile();assert.notEqual([...f.manager.active.values()][0].name,old);assert.equal(f.manager.accepts(old),false);
 const fresh=[...f.manager.active.values()][0].name;f.setSaved([{...custom,enabled:false}]);await f.manager.reconcile();assert.equal(f.manager.accepts(fresh),false);assert.equal(f.manager.active.size,0);
 assert.equal(f.manager.accepts('other-module-animation'),true);await f.manager.destroy();
});

test('Unconscious hides the darkness of the Blinded it brings; Blinded alone still shows',()=>{
 const c=(slug)=>({type:'condition',slug,name:slug});
 assert.deepEqual(shownStates([c('unconscious'),c('blinded'),c('off-guard')]).map(i=>i.slug),['unconscious','off-guard']);
 assert.deepEqual(shownStates([c('blinded')]).map(i=>i.slug),['blinded']);
 assert.deepEqual(shownStates([{type:'effect',slug:'blinded'},c('unconscious')]).length,2,'only conditions are folded');
});
