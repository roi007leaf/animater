import {registeredMedia, mergeMedia, libraryItem, safeMediaFile} from './media-library-model.mjs';
import {installedSoundCatalog, SOUND_SOURCE} from './spell-sounds.mjs';
// FilePicker remains the permission boundary. Scan only enabled sound modules,
// skip code/non-media files, and report partial discovery instead of hiding it.
export async function installedMediaLibrary({modules,database,browse,maxFolders=10_000}) {
  const entries=registeredMedia(database).map(entry=>({...entry,source:entry.source==='jb2a'
    ? modules?.get?.('jb2a_patreon')?.active?'JB2A Patreon':'JB2A Free'
    : SOUND_SOURCE.packs.find(p=>p.module===entry.source)?.title ?? modules?.get?.(entry.source)?.title ?? entry.source})), failures=[];
  const sounds=installedSoundCatalog(modules,database);
  const jobs=browse?SOUND_SOURCE.packs.filter(p=>modules?.get?.(p.module)?.active).map(p=>({path:`modules/${p.module}`,source:p.title})):[];
  const visited=new Set();
  const scheduled=new Set(jobs.map(job=>job.path));
  // Large installed packs routinely exceed 600 folders together. Retain a
  // safety budget without truncating ordinary libraries or counting duplicates.
  if(browse)while(jobs.length&&visited.size<maxFolders) {
    const batch=jobs.splice(0,Math.min(4,maxFolders-visited.size));
    await Promise.all(batch.map(async job=>{
      if(visited.has(job.path))return;visited.add(job.path);
      try {
        const result=await browse(job.path);
        for(const file of result.files??[])if(safeMediaFile(file,'audio')) {
          const item=libraryItem({file,type:'audio',source:job.source});if(item)entries.push(item);
        }
        for(const path of result.dirs??[]) {
          if(typeof path==='string'&&path.startsWith(`modules/${job.path.split('/')[1]}/`)&&!/(?:^|\/)(?:\.\.|\.git|node_modules)(?:\/|$)|[:<>"'\x00-\x1f]/.test(path)&&!scheduled.has(path)) {
            scheduled.add(path);jobs.push({path,source:job.source});
          }
        }
      } catch(error) {failures.push({path:job.path,error:String(error?.message??error)});}
    }));
  }
  const discovery={folders:visited.size,failures,limitReached:jobs.length>0,remaining:jobs.length};
  const warnings=[];
  if(failures.length)warnings.push(`Some sound folders could not be indexed. Browse files to add missing media. ${failures.slice(0,3).map(f=>`${f.path}: ${f.error}`).join(' · ')}${failures.length>3?` (+${failures.length-3})`:''}`);
  if(discovery.limitReached)warnings.push(`Sound indexing reached folder limit (${maxFolders}). Browse files to add missing media.`);
  // File identity merges registered and loose audio into one result. Preserve
  // audited duration/gain where a cue also belongs to the curated catalog.
  return {entries:mergeMedia(entries,sounds.entries??[]),warning:warnings.join(' '),discovery};
}
