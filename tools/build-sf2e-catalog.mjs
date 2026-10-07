import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sf2eSources} from './sf2e-source.mjs';
import {assetDatabases} from './asset-databases.mjs';
import {buildSpellDesign} from './twoe-spell-design.mjs';
import {profiles,classify,selectStateMedia} from './twoe-state-design.mjs';
import {classifyFeat,analyzeFeat,plainFeatDescription} from './feat-semantics.mjs';
import {analyzeWeapon} from './weapon-semantics.mjs';
import {selectWeaponMedia} from './weapon-asset-selection.mjs';
import {resolveFeatMedia} from './feat-asset-selection.mjs';
import {resolveSpellMedia,assetGeometry,coneMaterialMatches} from './spell-asset-selection.mjs';
import {SPELL_MOTIFS} from '../scripts/spell-design.mjs';
import {SPELL_THEMES,spellRecipe} from '../scripts/spell-choreography.mjs';
import {FEAT_MOTIFS,featRecipe} from '../scripts/feat-choreography.mjs';
import {weaponRecipe} from '../scripts/weapon-choreography.mjs';
import {stateRecipe} from '../scripts/state-catalog.mjs';
import {statePresentation} from '../scripts/state-presentation.mjs';
import {buildConditionDesign} from './pf2e-condition-designs.mjs';
import {buildAuraDesign} from './pf2e-aura-designs.mjs';
import {frameFeatCatalog} from './feat-framing.mjs';
import {diversifySpellMedia} from './spell-media-variety.mjs';
import {allocateSpellIdentities} from './spell-variety-allocation.mjs';
import {mediaTiming} from './media-timing.mjs';
import {MEDIA_DURATIONS} from '../data/media-durations.mjs';
import {PF2E_SPELLS} from '../data/pf2e-spells.mjs';
import {PF2E_FEATS} from '../data/pf2e-feats.mjs';
import {PF2E_WEAPONS} from '../data/pf2e-weapons.mjs';
import {PF2E_CONDITIONS,PF2E_EFFECTS} from '../data/pf2e-state-catalog.mjs';
import {SPELL_SOUND_DESIGNS} from '../data/spell-sounds.mjs';
import {FEAT_SOUND_DESIGNS,WEAPON_SOUND_DESIGNS,ABILITY_SOUND_PROFILES} from '../data/ability-sounds.mjs';
import {SOUND_PROFILES} from '../data/spell-sounds.mjs';
import {validateRecipe,planRecipe} from '../scripts/model.mjs';

const hash=value=>createHash('sha256').update(value).digest('hex');
const [source,databases]=await Promise.all([sf2eSources(),assetDatabases()]);
const pfSpells=new Map(PF2E_SPELLS.map(e=>[e.id,e]));
const pfStates=new Map([...PF2E_CONDITIONS,...PF2E_EFFECTS].map(e=>[e.documentId,e]));
const entries=[],spells=[],feats=[],weapons=[],states=[],excluded=[];
const timings=Object.assign({},...PF2E_FEATS.map(e=>e.mediaTiming??{}),...PF2E_WEAPONS.flatMap(e=>e.modes.map(m=>m.mediaTiming??{})));
for(const spell of PF2E_SPELLS)for(const [slot,keys]of Object.entries(spell.design.assets??{}))for(const key of keys)if(!timings[key]&&spell.design.mediaTiming?.[slot])timings[key]={...spell.design.mediaTiming[slot]};
const classes=new Set('envoy mystic operative soldier solarian witchwarper evolutionist mechanic technomancer'.split(' '));
const metadata=(entry,kind)=>{const s=entry.source.system;return {id:`sf2e-${kind}-${entry.pack}-${entry.source._id}`,documentId:entry.source._id,systemId:'sf2e',kind,nativeType:entry.source.type,pack:entry.pack,uuid:entry.uuid,name:entry.source.name,img:entry.source.img,slug:s.slug??entry.path.split('/').at(-1).replace(/\.json$/,''),level:s.level?.value??0,group:entry.pack,edition:'SF2e',publication:s.publication?.title??'',traits:s.traits?.value??[],descriptionText:plainFeatDescription(s.description?.value),descriptionHash:hash(s.description?.value??''),sourceURL:`https://github.com/foundryvtt/pf2e/blob/${source.sha}/${entry.path}`,shared:entry.shared===true};};
const themeSound=theme=>({electricity:'electric',mind:'psychic',plant:'growth',ward:'shield',gravity:'force',weapon:'metal',arcane:'force',illusion:'shadow',spirit:'holy',vitality:'healing',blood:'drain',curse:'shadow',dream:'sleep',luck:'bless',divination:'detect',web:'chainBinding'})[theme]??theme;
const spellFallback={ward:'forceShield',healing:'restore',fear:'dread',mind:'mentalJolt',teleport:'portalStep',transform:'form',shadow:'darkShroud',divination:'eye',sonic:'song',weapon:'weaponRunes',light:'lightOrb',time:'swiftTime',force:'empower',arcane:'bodyRunes'};
for(const entry of source.entries){
 const item=entry.source,s=item.system??{},native={systemId:'sf2e',uuid:entry.uuid};
 if(item.type==='spell'){
  const spell={...buildSpellDesign(entry,databases,pfSpells.get(item._id)),...native};
  if(spell.design.unavailable){
   const text=plainFeatDescription(s.description?.value).toLowerCase();
   const motif=/weapon|ammunition|shot|strike/.test(text)?'weaponRunes':/data|information|search|detect|computer|sensor|navigate/.test(text)?'eye':/illusion|hologram|image|disguise/.test(text)?'lightBend':/teleport|portal|dimension/.test(text)?'portalStep':spellFallback[spell.theme]??'bodyRunes';
   Object.assign(spell.design,{motif,pattern:SPELL_MOTIFS[motif].pattern,unavailable:false});spell.quality='symbolic';
   spell.design.assets=resolveSpellMedia(databases,spell.theme,SPELL_MOTIFS[motif],SPELL_THEMES[spell.theme],{name:spell.name,slug:spell.slug,design:spell.design,area:spell.area,delivery:spell.delivery});
  }
  if(spell.slug==='supercharge-weapon'){
   Object.assign(spell,{theme:'force',delivery:'target',trigger:'use',quality:'themed'});Object.assign(spell.design,{motif:'empower',pattern:SPELL_MOTIFS.empower.pattern,subject:'targets',unavailable:false});spell.design.assets=resolveSpellMedia(databases,'force',SPELL_MOTIFS.empower,SPELL_THEMES.force,{name:spell.name,slug:spell.slug,design:spell.design,delivery:'target'});
  }
  spells.push({entry,spell});
 }else if(['feat','action'].includes(item.type)){
  const active=classifyFeat(item);if(!active.included){excluded.push({uuid:entry.uuid,type:item.type,classification:active.classification});continue;}
  const design=analyzeFeat(item,entry.path),traits=s.traits?.value??[];
  const resolved=resolveFeatMedia(databases,design.theme,FEAT_MOTIFS[design.motif],SPELL_THEMES[design.theme],{name:item.name,slug:design.slug,motif:design.motif,rationale:design.rationale,description:plainFeatDescription(s.description?.value)});
  feats.push({entry,feat:{id:item._id,name:item.name,slug:design.slug,...native,level:s.level?.value??0,actionType:s.actionType?.value,actions:s.actions?.value,traits,classTraits:traits.filter(t=>classes.has(t)),category:s.category??entry.pack,trigger:'use',descriptionHash:active.descriptionHash,...design,...resolved}});
 }else if(item.type==='weapon'){
  const grenade=s.group==='grenade',weapon={...analyzeWeapon(grenade?{...item,system:{...s,group:'bomb'}}:item,entry.path),...native,nativeGroup:s.group};
  for(const mode of weapon.modes){
   const roots={laser:['lasershot.red','lasershot.orange'],plasma:['eldritch_blast.orange','fire_bolt.orange'],shock:['bolt.lightning.blue','arrow.lightning.blue'],cryo:['ray_of_frost.blue','snowball_toss'],sonic:['energy_beam.normal.blue'],corrosive:['spell_projectile.poison.greenyellow','eldritch_blast.green'],projectile:['bullet.02','bullet.01'],sniper:['bullet.02','bullet.01'],dart:['dart.01.throw'],flame:['fire_bolt.orange'],mental:['eldritch_blast.purple'],null:['disintegrate.purple','eldritch_blast.purple']};
   if(mode.mode==='ranged'&&roots[s.group]){mode.family=['projectile','sniper'].includes(s.group)?'firearm':s.group==='dart'?'blowgun':'firearm';mode.flightRoots=roots[s.group];}
   Object.assign(mode,selectWeaponMedia(databases,weapon,mode));
   if(mode.mode==='ranged'&&['cryo','sonic'].includes(s.group)){
    mode.assets.flight=[...new Set(Object.values(databases).map(rows=>rows.filter(r=>roots[s.group].some(p=>r.key===`jb2a.${p}`||r.key.startsWith(`jb2a.${p}.`))&&['beam','projectile'].includes(assetGeometry(r))).sort((a,b)=>a.key.localeCompare(b.key))[0]?.key).filter(Boolean))];
   }
  }
  weapons.push({entry,weapon});
 }else if(['condition','effect'].includes(item.type)){
  const kind=entry.pack==='conditions'||item.type==='condition'?'condition':'effect',meta=metadata(entry,kind),slug=meta.slug,shared=pfStates.get(item._id),design=classify(item),profile=profiles[design.theme];
  const state={...(shared?structuredClone(shared):{}),...meta,id:`${entry.pack}-${item._id}`,systemId:'sf2e',slug,group:entry.pack,nativeDuration:s.duration??null,theme:design.theme,quality:design.quality,color:profile.hex,description:s.description?.value??'',assets:selectStateMedia(databases,design.theme,slug).assets,opacity:1,scale:1.35};
  if(item.type==='condition')Object.assign(state,buildConditionDesign(state,databases));
  else Object.assign(state,statePresentation(state));
  if(slug==='suppressed')Object.assign(state,{theme:'slow',below:true,scale:1.4,offsetY:.2,assets:selectStateMedia(databases,'slow',slug,'red').assets});
  if(shared?.auras)state.auras=[];if(shared?.auraSources)state.auraSources=[];
  for(const rule of s.rules??[])if(rule.key==='Aura'){
   state.auras??=[];state.auras.push({slug:rule.slug??slug,radius:typeof rule.radius==='number'?rule.radius:null});
  }
  states.push({entry,state});
 }else excluded.push({uuid:entry.uuid,type:item.type,classification:'no-native-activation'});
}
// Aura effect links identify the source token; render the native prepared radius.
for(const {entry,state}of states)for(const sourceEntry of source.entries)for(const rule of sourceEntry.source.system?.rules??[])if(rule.key==='Aura')for(const effect of rule.effects??[]){
 const reference=effect.uuid;if(typeof reference!=='string')continue;
 if(reference!==entry.uuid&&reference!==`Compendium.sf2e.${entry.pack}.Item.${entry.source.name}`)continue;
 state.auraSources??=[];state.auraSources.push({uuid:sourceEntry.uuid,slug:rule.slug??sourceEntry.source.system?.slug??sourceEntry.path.split('/').at(-1).replace(/\.json$/,''),radius:typeof rule.radius==='number'?rule.radius:null});
}
for(const {state}of states)if(state.auras?.length||state.auraSources?.length){
 try{state.auraDesign=buildAuraDesign(state,databases);}catch{
  const media=selectStateMedia(databases,state.theme,state.slug);state.auraAssets=media.assets;state.auraDesign={id:state.slug,layers:[{assets:media.assets,stageId:'native-aura-field',scale:1,opacity:.9,below:true,playbackRate:.65}]};
 }
}
const variety=diversifySpellMedia(spells.map(e=>e.spell),databases,SPELL_MOTIFS);
console.log(`SF2e: ${spells.length} spells, ${feats.length} active abilities, ${weapons.length} weapons, ${states.length} sustained states.`);
const assets=[...spells.map(e=>e.spell.design.assets),...feats.map(e=>e.feat.assets),...weapons.flatMap(e=>e.weapon.modes.map(m=>m.assets))];
const keys=[...new Set(assets.flatMap(media=>Object.values(media).flat()))],rows=new Map(Object.values(databases).flat().map(row=>[row.key,row]));
let next=0;await Promise.all(Array.from({length:4},async()=>{while(next<keys.length){const key=keys[next++];if(!timings[key]){const row=rows.get(key),geometry=assetGeometry(row),duration=MEDIA_DURATIONS[key];const timing=duration&&!['beam','projectile','line'].includes(geometry)?{duration,baked:false}:await mediaTiming(row,databases);if(timing)timings[key]=timing;}}}));
for(const [key,timing]of Object.entries(timings))timing.duration=Math.max(timing.duration??0,MEDIA_DURATIONS[key]??0);
for(const {spell}of spells)spell.design.mediaTiming=Object.fromEntries(Object.entries(spell.design.assets).flatMap(([slot,keys])=>{const samples=keys.map(k=>timings[k]).filter(Boolean);return samples.length?[[slot,{duration:Math.max(...samples.map(t=>t.duration)),baked:samples.every(t=>t.baked),...(samples.some(t=>t.contact)?{contact:Math.max(...samples.map(t=>t.contact??0))}:{})}]]:[];}));
for(const {feat}of feats)feat.mediaTiming=Object.fromEntries(Object.values(feat.assets).flat().filter(k=>timings[k]).map(k=>[k,timings[k]]));
for(const {weapon}of weapons)for(const mode of weapon.modes){mode.mediaTiming=Object.fromEntries(Object.values(mode.assets).flat().filter(k=>timings[k]).map(k=>[k,timings[k]]));mode.approximations=mode.selections.filter(s=>s.approximation).map(s=>`${s.edition}: ${s.key}`);}
allocateSpellIdentities(spells.map(e=>e.spell),spell=>spellRecipe(spell,undefined,{motion:false}),databases,new Map(source.entries.filter(e=>e.source.type==='spell').map(e=>[e.source._id,e.source])));frameFeatCatalog(feats.map(e=>e.feat),databases);
const bind=(recipe,entry)=>validateRecipe({...recipe,description:'',systemId:'sf2e',catalogEntry:entry.id,itemUuid:entry.uuid,lifecycle:['condition','effect'].includes(entry.kind)?'document':recipe.lifecycle,stateEntry:['condition','effect'].includes(entry.kind)?entry.id:recipe.stateEntry});
for(const {entry,spell}of spells){const meta=metadata(entry,'spell'),sound=SPELL_SOUND_DESIGNS[spell.id]?.profile??themeSound(spell.theme);entries.push({...meta,level:spell.rank,theme:spell.theme,quality:spell.quality,spell,variants:[{id:'cast',label:spell.kind==='cantrip'?'Cantrip':`Rank ${spell.rank}`,soundProfile:sound,recipe:bind(spellRecipe(spell),meta)}]});}
for(const {entry,feat}of feats){const meta=metadata(entry,'feat'),profile=FEAT_SOUND_DESIGNS[feat.id]?.profile??({unarmed:'unarmed',doubleStrike:'sword',strike:'sword',heavyStrike:'greatsword',ranged:'ranged',firearm:'firearm',bombThrow:'bomb',guard:'shieldRaise',bind:'chainBinding',trip:'unarmed',shove:'unarmed',movement:'wind',flight:'wind',stealth:'shadow',teleport:'teleport',healing:'healing',dread:'fear',utility:'detect',perception:'detect'})[feat.motif]??themeSound(feat.theme);entries.push({...meta,theme:feat.theme,quality:feat.quality,actionType:feat.actionType,actions:feat.actions,classTraits:feat.classTraits,variants:[{id:'activate',label:feat.actionType==='action'?`${feat.actions??1} actions`:feat.actionType,soundProfile:profile,soundNamespace:'ability',recipe:bind(featRecipe(feat),meta)}]});}
for(const {entry,weapon}of weapons){
 const meta=metadata(entry,'weapon'),variants=weapon.modes.map(mode=>({id:mode.mode,label:mode.mode,weaponMode:mode.mode,soundNamespace:'ability',soundProfile:WEAPON_SOUND_DESIGNS[`${weapon.id}:${mode.mode}`]?.profile??(weapon.nativeGroup==='laser'?'fireRay':weapon.nativeGroup==='cryo'?'coldRay':weapon.nativeGroup==='shock'?'electric':weapon.nativeGroup==='sonic'?'sonic':weapon.nativeGroup==='corrosive'?'acid':weapon.nativeGroup==='plasma'?'fire':mode.payload?`bomb-${mode.element}`:mode.family),recipe:bind(weaponRecipe(weapon,mode.mode),meta)}));
 const automatic=weapon.traits.includes('automatic'),trait=weapon.traits.find(t=>/^area-(burst|cone|line)(?:-\d+)?$/.test(t)),tag=entry.source.system.description?.value.match(/@Template\[(burst|cone|line)\|distance:(\d+)/);
 const area=automatic?{type:'cone',value:Math.max(5,Math.floor((weapon.range??entry.source.system.range??10)/2/5)*5)}:trait?{type:trait.split('-')[1],value:Number(trait.split('-')[2])||(trait.includes('burst')?5:entry.source.system.range)}:weapon.nativeGroup==='grenade'&&tag?{type:tag[1],value:Number(tag[2])}:null;
 if(area){
  const mode=weapon.modes[0],recipe=variants[0].recipe,impact=recipe.stages.find(s=>s.kind==='impact'),flight=recipe.stages.find(s=>s.kind==='travel'),label=automatic?'Auto-Fire':'Area Fire';
  const stages=recipe.stages.filter(s=>s.kind==='motion').map(s=>({...s,distance:.08}));
  if(area.type==='cone'){
   const selectedCones=Object.values(databases).map(db=>db.filter(row=>assetGeometry(row)==='cone'&&coneMaterialMatches(row.key,mode.element)).sort((a,b)=>a.key.localeCompare(b.key))[0]?.key).filter(Boolean),coneKeys=[...new Set(selectedCones)];
   if(selectedCones.length===Object.keys(databases).length){
    const samples=await Promise.all(coneKeys.map(async key=>timings[key]??await mediaTiming(rows.get(key),databases)));
    stages.push({...impact,kind:'template',stageId:`${meta.id}-area`,label,assets:coneKeys,delay:500,afterStage:'',duration:Math.max(2500,...samples.filter(Boolean).map(t=>t.duration)),scale:1,oneShot:true});
   }else stages.push({...flight,stageId:`${meta.id}-area-fan`,label,travelDestination:'area',areaLayout:'fan',fanCount:automatic?7:5,delay:500,afterStage:'',opacity:.85});
  }else{
   if(weapon.nativeGroup==='grenade'&&flight)stages.push({...flight,travelDestination:'area'});
   stages.push({...impact,kind:'template',stageId:`${meta.id}-area`,label,assets:area.type==='line'?mode.assets.flight:mode.assets.accent,delay:500,afterStage:weapon.nativeGroup==='grenade'?flight?.stageId??'':'',duration:Math.max(2500,impact?.duration??0,area.type==='line'?flight?.duration??0:0),scale:1,oneShot:true});
  }
  variants.push({id:'area',label,weaponMode:'area',soundNamespace:'ability',soundProfile:variants[0].soundProfile,recipe:bind({...recipe,id:`${recipe.id}-area`,trigger:'template',weaponMode:undefined,previewArea:area,stages},meta)});
 }
 entries.push({...meta,group:weapon.nativeGroup,theme:weapon.modes[0].element,quality:'themed',variants});
}
for(const {entry,state}of states){const meta=metadata(entry,state.kind),variants=[];for(const damageType of state.slug==='persistent-damage'?Object.keys(state.damageVariants??{}):[undefined])variants.push({id:damageType??'active',label:damageType??'Active',damageType,recipe:bind(stateRecipe(state,{damageType}),meta)});entries.push({...meta,theme:state.theme,quality:state.quality,private:state.private??['hidden','invisible','undetected','unnoticed'].includes(state.slug),state,variants});}
// Physical family aliases and non-elemental grenade payloads need real profiles.
const soundAliases={chakram:'thrown',glaive:'polearmBlade',greataxe:'axe',contact:'unarmed','bomb-physical':'bomb-explosive','bomb-untyped':'bomb-soft'};
for(const entry of entries)for(const variant of entry.variants){
 variant.soundProfile=soundAliases[variant.soundProfile]??variant.soundProfile;
 if(!entry.state&&variant.soundProfile&&!{...SOUND_PROFILES,...ABILITY_SOUND_PROFILES}[variant.soundProfile])throw Error(`Unknown SF2e sound profile: ${entry.name}/${variant.soundProfile}`);
}
const context={source:{id:'s',center:{x:100,y:100},w:100,h:100,document:{width:1,height:1}},targets:[{id:'t',center:{x:400,y:100},w:100,h:100,document:{width:1,height:1}}],gridSize:100,gridDistance:5,template:{id:'area'},area:{type:'cone',center:{x:100,y:100},endpoint:{x:500,y:100},diameter:400,length:400,width:100,angle:90}};
const issues=[];for(const entry of entries)for(const variant of entry.variants)for(const [edition,db]of Object.entries(databases))try{planRecipe(variant.recipe,db,context);}catch(error){issues.push({id:entry.id,name:entry.name,variant:variant.id,edition,error:error.message});}
const meta={systemId:'sf2e',version:source.version,ref:source.ref,sha:source.sha,repository:source.repository,sourceDocuments:source.entries.length,counts:Object.fromEntries(['spell','feat','weapon','condition','effect'].map(k=>[k,entries.filter(e=>e.kind===k).length])),variants:entries.reduce((n,e)=>n+e.variants.length,0),excluded:excluded.length,descriptionHashes:entries.length,variety,issues:issues.length};
await writeFile('data/sf2e-catalog.mjs',`// Native SF2e catalog. References only; no animation or sound media bundled.\nexport const SF2E_SOURCE=${JSON.stringify(meta)};\nexport const SF2E_ENTRIES=${JSON.stringify(entries)};\n`);
await writeFile('data/sf2e-catalog-validation.json',JSON.stringify({source:meta,issues,excluded},null,2));
console.log(JSON.stringify({source:meta,issues:issues.slice(0,15)},null,2));if(issues.length)process.exitCode=1;
