import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spellSources} from './pf2e-source.mjs';
import {nativeSpellDescription,descriptionText} from './spell-semantics.mjs';
const source=await spellSources(),byId=new Map(source.spells.map(e=>[e.source._id,e.source]));
const hash=text=>createHash('sha256').update(text).digest('hex');
let count=0;
for(const slice of ['a','b','c']){
 const path=new URL(`../docs/spell-gap-${slice}-review.json`,import.meta.url),manifest=JSON.parse(await readFile(path,'utf8'));
 for(const entry of Array.isArray(manifest)?manifest:manifest.records){
  const item=byId.get(entry.id);assert(item,entry.id);
  const raw=nativeSpellDescription(item),text=descriptionText(raw);
  // Original workers recorded either raw HTML or normalized prose. Verify the
  // reviewed source before making that distinction explicit in all manifests.
  assert([hash(raw),hash(text)].includes(entry.descriptionHash),entry.slug);
  if(entry.sourceHash)assert.equal(entry.sourceHash,hash(raw),entry.slug);
  Object.assign(entry,{sourceHash:hash(raw),descriptionHash:hash(text),descriptionChars:text.length});
  count++;
 }
 if(process.argv.includes('--write'))await writeFile(path,JSON.stringify(manifest,null,2)+'\n');
}
assert.equal(count,897);
console.log(`${count} native description hashes verified.`);
