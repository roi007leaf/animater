// Audit retained optional media, not the timbre of an unheard recording.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {SOUND_PROFILES} from '../data/spell-sounds.mjs';
import {ABILITY_SOUND_PROFILES} from '../data/ability-sounds.mjs';
import {modulesRoot,probeSoundFile,automaticSoundGain} from './sound-databases.mjs';

const output=process.argv.find(a=>a.startsWith('--output='))?.slice(9)??'docs/full-sound-file-audit-2026-10-07.json';
const probeReport=process.argv.find(a=>a.startsWith('--probe-report='))?.slice(15);
const previous=probeReport?JSON.parse(await readFile(probeReport,'utf8')):null;
if(previous&&previous.audio?.probed!==previous.audio?.candidateFiles)throw Error('Supplied probe report did not decode every retained candidate');
const measured=new Map(previous?.audio?.evidence?.map(e=>[e.file,e])??[]);
const candidates=new Map();
for(const [catalog,profiles]of [['spell',SOUND_PROFILES],['ability',ABILITY_SOUND_PROFILES]])for(const [profile,cues]of Object.entries(profiles))for(const [cueIndex,cue]of cues.entries())for(const candidate of cue.candidates){
 const entry=candidates.get(candidate.file)??{file:candidate.file,module:candidate.module,references:[],copies:[]};
 entry.references.push({catalog,profile,cue:cueIndex,label:cue.label,key:candidate.key});entry.copies.push(candidate);candidates.set(candidate.file,entry);
}
const rows=[...candidates.values()],evidence=[],issues=[];let cursor=0;
await Promise.all(Array.from({length:6},async()=>{while(cursor<rows.length){
 const {copies,...row}=rows[cursor++];
 try{
  const full=path.resolve(modulesRoot,'..',row.file),bytes=await readFile(full);
  const sourceSha256=createHash('sha256').update(bytes).digest('hex');
  const actual=measured.get(row.file)??await probeSoundFile(row.file);
  if(!(actual.nativeDuration>0)||!Number.isFinite(actual.meanDb)||!Number.isFinite(actual.peakDb))throw Error('Decoder returned invalid duration or non-finite levels');
  const gain=Number(automaticSoundGain(actual.meanDb,actual.peakDb).toFixed(5));
  for(const candidate of copies){
   if(candidate.nativeDuration!==actual.nativeDuration||candidate.meanDb!==actual.meanDb||candidate.peakDb!==actual.peakDb||candidate.gain!==gain)issues.push({file:row.file,type:'generated-measurement-mismatch'});
   if(!(candidate.duration>0&&candidate.duration<=Math.min(4500,actual.nativeDuration)))issues.push({file:row.file,type:'invalid-cue-duration'});
  }
  evidence.push({...row,bytes:bytes.byteLength,sourceSha256,nativeDuration:actual.nativeDuration,meanDb:actual.meanDb,peakDb:actual.peakDb,gain,effectiveMeanDb:Number((actual.meanDb+20*Math.log10(gain)).toFixed(3)),effectivePeakDb:Number((actual.peakDb+20*Math.log10(gain)).toFixed(3))});
 }catch(error){issues.push({file:row.file,type:'missing-or-unplayable',message:error.message});}
}}));
evidence.sort((a,b)=>a.file.localeCompare(b.file));
const summary={candidateFiles:rows.length,hashedFiles:evidence.length,decodedFiles:evidence.length,attenuated:evidence.filter(e=>e.gain<1).length,unboostedQuiet:evidence.filter(e=>e.gain===1).length,meanDbRange:[Math.min(...evidence.map(e=>e.meanDb)),Math.max(...evidence.map(e=>e.meanDb))],effectiveMeanDbRange:[Math.min(...evidence.map(e=>e.effectiveMeanDb)),Math.max(...evidence.map(e=>e.effectiveMeanDb))],effectivePeakDbMax:Math.max(...evidence.map(e=>e.effectivePeakDb)),issues:issues.length};
await writeFile(output,JSON.stringify({date:'2026-10-07',summary,measurementSource:probeReport??'Fresh FFprobe duration and FFmpeg volumedetect per candidate',policy:'Attenuation only; user volume remains independent. Whole-file dBFS is not perceived LUFS. No audio audition claimed.',issues,evidence},null,2)+'\n');
console.log(JSON.stringify({output,...summary},null,2));
if(issues.length)process.exitCode=1;
