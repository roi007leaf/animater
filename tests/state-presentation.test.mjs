import test from 'node:test';
import assert from 'node:assert/strict';
import {statePresentation} from '../scripts/state-presentation.mjs';
import {PF2E_EFFECTS,PF2E_CONDITIONS,stateRecipe} from '../scripts/state-catalog.mjs';
import {SF2E_ENTRIES} from '../data/sf2e-catalog.mjs';

test("a lasting Hunter's Mark is a small corner badge, never a sheet over the token's face",()=>{
 const p=statePresentation({assets:['jb2a.hunters_mark.loop.06.green']});
 assert.ok(p.scale<=.4);assert.equal(p.below,false);assert.equal(p.offsetUnits,'token');
 assert.ok(p.offsetX>0&&p.offsetY<0,'top-right corner');assert.ok(Math.abs(p.offsetX)+p.scale/2<=.5,'inside its own square');
});
test("no PF2e or SF2e lasting state draws Hunter's Mark larger than a badge (SF2e Get 'Em! hid tokens under a glyph)",()=>{
 const states=[...PF2E_CONDITIONS,...PF2E_EFFECTS,...(SF2E_ENTRIES??[]).filter(e=>['condition','effect'].includes(e.kind))];
 for(const e of states){const r=e.state?{stages:e.variants?.[0]?.recipe?.stages??[]}:stateRecipe(e);
  for(const s of r.stages??[])if((s.assets??[]).some(a=>/hunters_mark\.loop/.test(a)))assert.ok(s.scale<=.4,`${e.name}: ${s.scale}`);}
});
