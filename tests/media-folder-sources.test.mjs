import test from 'node:test';
import assert from 'node:assert/strict';
import {installedMediaLibrary,MediaLibraryLoader} from '../scripts/media-library-sources.mjs';
import {mediaFolderSources,mediaGroups} from '../scripts/media-library-model.mjs';
import {MediaLibrary,libraryPreferences} from '../scripts/media-library.mjs';
import {validateRecipe,planRecipe} from '../scripts/model.mjs';

const root='modules/bossloot/assets';
const folders=[{path:root,name:'BossLoot'}];
const browse=async path=>path===root
  ? {dirs:[`${root}/spells`,`${root}/spells`,'modules/other',`${root}/../private`,`${root}/node_modules`],files:[`${root}/ward.png`,`${root}/hit.ogg`,`${root}/index.js`,'modules/other/leak.webm']}
  : {dirs:[],files:[`${root}/spells/fire_loop.webm`,`${root}/spells/ice.mp4`]};

test('unregistered folder source discovers nested visuals and audio, filters by name and produces playable file recipes',async()=>{
  const progress=[],calls=[];
  const result=await installedMediaLibrary({folderSources:folders,onProgress:part=>progress.push(...part.entries),browse:async path=>{calls.push(path);return browse(path);}});
  assert.deepEqual(calls,[root,`${root}/spells`]);
  assert.equal(result.entries.length,4);assert.equal(result.warning,'');
  assert.ok(result.entries.every(item=>item.source==='BossLoot'));
  assert.deepEqual(progress.map(item=>item.id).sort(),result.entries.map(item=>item.id).sort());
  const matches=mediaGroups(result.entries,{type:'animation',source:'BossLoot',search:'fire'});
  assert.equal(matches.count,1);
  const item=matches.groups[0].variants[0];
  assert.equal(item.loop,true);
  const recipe=validateRecipe({id:'boss',name:'Boss',trigger:'manual',stages:[{kind:'cast',assets:[item.file]}]});
  assert.equal(planRecipe(recipe,result.entries,{source:{center:{x:0,y:0}},targets:[]})[0].asset,item.file);
});

test('folder discovery preserves registered variants and their database metadata without duplicate loose files',async()=>{
  const file=`${root}/spells/fire_loop.webm`;
  const database={searchFor:()=>['bossloot'],getPathsUnder:()=>['bossloot.fire.blue'],getAllFileEntries:()=>[file],getEntry:()=>({getFile:()=>file,template:[100,200,300]})};
  const result=await installedMediaLibrary({database,folderSources:folders,browse});
  const rows=result.entries.filter(item=>item.files.includes(file));
  assert.equal(rows.length,1);assert.equal(rows[0].key,'bossloot.fire.blue');
  assert.deepEqual(rows[0].template,[100,200,300]);
});

test('folder preferences reject invalid roots, deduplicate paths and retain custom names',()=>{
  assert.deepEqual(mediaFolderSources([null,{path:''},{path:'/'},{path:'../secret'},{path:'modules/x/../secret'},{path:'https://bad.test/assets'},{path:'C:\\assets'},{path:'modules/x?bad'},{path:'modules/.git'}]),[]);
  assert.deepEqual(libraryPreferences({sources:[{path:root+'/',name:'Old'},{path:root,name:' BossLoot '}]}).sources,folders);
  assert.equal(mediaFolderSources([{path:'worlds/demo/My Assets'}])[0].name,'My Assets');
});

test('adding, renaming and removing folder sources invalidate cached discovery; Refresh finds new files',async()=>{
  let folderSources=[],files=[],calls=0;
  const loader=new MediaLibraryLoader(()=>({folderSources,browse:async()=>{calls++;return {dirs:[],files};}}));
  await loader.load();assert.equal(calls,0);
  folderSources=folders;files=[`${root}/first.webm`];assert.equal(loader.peek(),null);
  const first=await loader.load();assert.equal(first.entries.length,1);
  assert.equal(await loader.load(),first);assert.equal(calls,1);
  files.push(`${root}/second.webm`);assert.equal((await loader.load(true)).entries.length,2);
  folderSources=[{path:root,name:'Renamed'}];assert.equal(loader.peek(),null);
  assert.ok((await loader.load()).entries.every(row=>row.source==='Renamed'));
  folderSources=[];assert.equal(loader.peek(),null);assert.equal((await loader.load()).entries.length,0);
});

test('folder scan reports permission errors and exact folder budget instead of silently dropping assets',async()=>{
  const limited=await installedMediaLibrary({folderSources:folders,browse,maxFolders:1});
  assert.equal(limited.discovery.folders,1);assert.equal(limited.discovery.limitReached,true);
  assert.match(limited.warning,/Media indexing reached folder limit/);
  const failed=await installedMediaLibrary({folderSources:folders,browse:async()=>{throw Error('Permission denied');}});
  assert.match(failed.warning,/BossLoot|modules\/bossloot\/assets/);assert.match(failed.warning,/Permission denied/);
});

test('source controls persist folders, refresh named results and remove indexing without changing recipe',async()=>{
  let prefs=libraryPreferences(),picked;
  const recipe=validateRecipe({id:'existing',name:'Existing',trigger:'manual',stages:[{kind:'cast',assets:[`${root}/ward.png`]}]});
  const before=structuredClone(recipe);
  const host={catalog:()=>[],mediaPreferences:()=>prefs,setMediaPreferences:async value=>{prefs=libraryPreferences(value);},pickMediaFolder:callback=>{picked=callback;},loadMediaCatalog:()=>installedMediaLibrary({folderSources:prefs.sources,browse})};
  const w={host,page:'recipes',root:{querySelector:selector=>selector==='[data-media-source-name]'?{value:'BossLoot'}:null},recipe:()=>recipe,stageLabel:stage=>stage.kind,stageIndex:0,abort:new AbortController()};
  const library=new MediaLibrary(w);library.render=()=>{};
  assert.match(library.html(recipe),/Add folder/);
  await library.action('media-source-add',{dataset:{}});await picked(root);
  assert.deepEqual(prefs.sources,folders);assert.equal(library.filters.source,'BossLoot');
  assert.equal(library.results().count,2);
  assert.match(library.html(recipe),/Remove BossLoot folder source/);
  const reopened=new MediaLibrary(w);assert.deepEqual(reopened.prefs.sources,folders);
  await library.action('media-source-remove',{dataset:{path:root}});
  assert.deepEqual(prefs.sources,[]);assert.equal(library.items.length,0);
  assert.deepEqual(recipe,before);
});

test('failed preference save leaves source state unchanged and canceled picker cannot add a source',async()=>{
  let picked;
  const abort=new AbortController();
  const library=new MediaLibrary({host:{catalog:()=>[],pickMediaFolder:callback=>{picked=callback;},setMediaPreferences:async()=>{throw Error('Save failed');}},root:{querySelector:()=>null},abort});
  library.render=()=>{};
  await library.action('media-source-add',{dataset:{}});await picked(root);
  assert.deepEqual(library.prefs.sources,[]);assert.equal(library.error,'Save failed');
  abort.abort();library.error='';await picked(root);
  assert.deepEqual(library.prefs.sources,[]);assert.equal(library.error,'');
});
