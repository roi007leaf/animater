import {mkdir,writeFile,access} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {WEAPON_SOURCE_SHA} from './pf2e-weapon-source.mjs';
const cache=fileURLToPath(new URL('../.cache/',import.meta.url));
const archive=fileURLToPath(new URL('../.cache/pf2e-source.tar.gz',import.meta.url));
await mkdir(cache,{recursive:true});
try {await access(archive);} catch {
 const response=await fetch(`https://codeload.github.com/foundryvtt/pf2e/tar.gz/${WEAPON_SOURCE_SHA}`);
 if(!response.ok)throw Error(`Pinned PF2e archive failed: ${response.status}`);
 await writeFile(archive,Buffer.from(await response.arrayBuffer()));
}
await promisify(execFile)('tar',['-xf',archive,'-C',cache,`pf2e-${WEAPON_SOURCE_SHA}/packs/pf2e/equipment`],{windowsHide:true});
console.log('Extracted pinned official equipment pack, including nested legacy entries.');
