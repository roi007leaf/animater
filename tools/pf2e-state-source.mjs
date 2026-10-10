import {mkdir,writeFile,access} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {resolve} from 'node:path';
export const STATE_SOURCE_SHA='581c2bf2ca9734f4dd83f034fbcc93f8e4fd96eb';
export const STATE_SOURCE_PACKS=['conditions','spell-effects','equipment-effects','feat-effects','bestiary-effects','other-effects','campaign-effects','boons-and-curses'];
export const AURA_SOURCE_PACKS=[...STATE_SOURCE_PACKS,'equipment','feats','spells'];
export async function ensureStateSources(){
 const root=`pf2e-${STATE_SOURCE_SHA}`,base=resolve('.cache/persistent-research'),packs=resolve(base,root,'packs/pf2e');
 try{await Promise.all([...AURA_SOURCE_PACKS.map(p=>access(resolve(packs,p))),access(resolve(base,root,'static/lang/en.json'))]);return packs;}catch{}
 await mkdir(base,{recursive:true});const archive=resolve('.cache',`pf2e-${STATE_SOURCE_SHA}.tar.gz`);
 try{await access(archive);}catch{
  const response=await fetch(`https://codeload.github.com/foundryvtt/pf2e/tar.gz/${STATE_SOURCE_SHA}`);
  if(!response.ok)throw Error(`PF2e sources unavailable: ${response.status}`);
  await writeFile(archive,Buffer.from(await response.arrayBuffer()));
 }
 await promisify(execFile)('tar',['-xzf',archive,'-C',base,...AURA_SOURCE_PACKS.map(p=>`${root}/packs/pf2e/${p}`),`${root}/static/lang/en.json`]);
 return packs;
}
