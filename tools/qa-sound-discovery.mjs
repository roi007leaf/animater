// Development-only replay of FilePicker discovery against installed folders.
import {readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {installedMediaLibrary} from '../scripts/media-library-sources.mjs';
import {SOUND_SOURCE} from '../scripts/spell-sounds.mjs';

const dataRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const enabled=process.argv.slice(2);
const modules=new Map(SOUND_SOURCE.packs.filter(p=>!enabled.length||enabled.includes(p.module)).map(p=>[p.module,{active:true}]));
const visited=[],failures=[];
const browse=async path=>{
  visited.push(path);
  try {
    const entries=await readdir(resolve(dataRoot,path),{withFileTypes:true});
    return {files:entries.filter(e=>e.isFile()).map(e=>`${path}/${e.name}`),dirs:entries.filter(e=>e.isDirectory()).map(e=>`${path}/${e.name}`)};
  } catch(error) {failures.push({path,error:error.message});throw error;}
};
const result=await installedMediaLibrary({modules,browse});
console.log(JSON.stringify({modules:[...modules.keys()],folders:visited.length,byModule:Object.fromEntries([...modules.keys()].map(id=>[id,visited.filter(p=>p.startsWith(`modules/${id}/`)||p===`modules/${id}`).length])),audio:result.entries.filter(e=>e.type==='audio').length,warning:result.warning,discovery:result.discovery,failures},null,2));
