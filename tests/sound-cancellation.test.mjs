import test from 'node:test';
import assert from 'node:assert/strict';
import {AnimaterRuntime} from '../scripts/runtime.mjs';
const recipe={id:'audition',name:'Audition',trigger:'manual',stages:[{kind:'sound',soundFile:'modules/psfx/test.ogg',duration:100,volume:.35}]};
const context={source:{id:'source',center:{x:0,y:0}},targets:[]};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('Stop during uncached sound preload prevents playback and preview-clock startup',async()=>{
 let release,preloads=0,plays=0,starts=0;const gate=new Promise(resolve=>{release=resolve;});
 const sound=new Proxy({}, {get:()=>()=>sound});
 const runtime=new AnimaterRuntime({ready:()=>true,userId:()=> 'qa',canPlay:()=>true,preloadSounds:async()=>{preloads++;await gate;},endEffects:async()=>{},endSounds:async()=>{},sequence:()=>({sound:()=>sound,play:async()=>{plays++;}})});
 const pending=runtime.play(recipe,context,{onStart:()=>{starts++;}});await tick();
 await runtime.stop();release();await pending;
 assert.equal(preloads,1);assert.equal(plays,0);assert.equal(starts,0);assert.equal(runtime.sessions.size,0);
});
test('late sequence completion after Stop drains exact sound session without affecting other users',async()=>{
 let release,ends=[],active=false;const gate=new Promise(resolve=>{release=resolve;});
 const sound=new Proxy({}, {get:()=>()=>sound});
 const runtime=new AnimaterRuntime({ready:()=>true,userId:()=> 'qa',canPlay:()=>true,endEffects:async()=>{},endSounds:async filters=>{ends.push(filters.name);active=false;},sequence:()=>({sound:()=>sound,play:async()=>{await gate;active=true;}})});
 const pending=runtime.play(recipe,context);await tick();await runtime.stop();release();assert.equal(await pending,null);
 assert.equal(active,false);assert.ok(ends.some(name=>name.startsWith('animater-qa-')&&!name.endsWith('*')));
 assert.ok(ends.every(name=>name.startsWith('animater-qa-')));
});
