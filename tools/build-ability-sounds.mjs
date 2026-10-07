import {writeFile} from 'node:fs/promises';
import {soundInventory,probeSoundFile} from './sound-databases.mjs';
import {PF2E_FEATS} from '../data/pf2e-feats.mjs';
import {PF2E_WEAPONS} from '../data/pf2e-weapons.mjs';
import {SOUND_PROFILES} from '../data/spell-sounds.mjs';
import {featSoundDirection,weaponSoundDirection} from './ability-sound-semantics.mjs';
import {validateSoundFile} from '../scripts/stage-options.mjs';
const {entries,packs}=await soundInventory();
const cue=(label,role,ggg,psfx='',files='')=>({label,role,selectors:{ggg,psfx,soundfxlibrary:files}});
const profiles={
 allyHeave:[cue('Physical ally lift and heave','cast','^ggg-sfx\\.ranged\\.thrown\\.general')],
 naturalPierce:[cue('Natural piercing contact','contact','^ggg-sfx\\.melee\\.claws\\.strike\\.stab\\.01')],
 physicalToss:[cue('Thrown release','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Thrown-weapon contact','contact','','','Combat/Single/Throw Hit')],
 sword:[cue('Blade contact','contact','^ggg-sfx\\.melee\\.blade\\.strike\\.shortsword\\.01','^psfx\\.weapon-attacks\\.sword','Combat/Single/.*(Sword|Blade)')],
 greatsword:[cue('Heavy blade contact','contact','^ggg-sfx\\.melee\\.blade\\.strike\\.greatsword\\.01','^psfx\\.weapon-attacks\\.sword')],
 dagger:[cue('Dagger contact','contact','^ggg-sfx\\.melee\\.blade\\.strike\\.dagger\\.01','^psfx\\.weapon-attacks\\.dagger')],
 spear:[cue('Spear contact','contact','^ggg-sfx\\.melee\\.polearm\\.strike\\.01\\.pierce','^psfx\\.weapon-attacks\\.spear')],
 polearmBlade:[cue('Polearm blade contact','contact','^ggg-sfx\\.melee\\.polearm\\.strike\\.01\\.blade','^psfx\\.weapon-attacks\\.spear')],
 rapier:[cue('Rapier thrust','contact','^ggg-sfx\\.melee\\.blade\\.strike\\.rapier','^psfx\\.weapon-attacks\\.sword')],
 staff:[cue('Staff contact','contact','^ggg-sfx\\.melee\\.bludgeoning\\.strike\\.one-hand')],
 ironStaff:[cue('Metal staff contact','contact','^ggg-sfx\\.melee\\.bludgeoning\\.strike\\.staff\\.iron')],
 katana:[cue('Katana contact','contact','^ggg-sfx\\.melee\\.blade\\.strike\\.katana\\.general','^psfx\\.weapon-attacks\\.sword')],
 axe:[cue('Axe contact','contact','^ggg-sfx\\.melee\\.axe\\.strike','^psfx\\.weapon-attacks\\.axe')],
 club:[cue('Blunt contact','contact','^ggg-sfx\\.melee\\.bludgeoning\\.strike\\.one-hand','^psfx\\.weapon-attacks\\.(club|mace|hammer)')],
 hammer:[cue('Hammer contact','contact','^ggg-sfx\\.melee\\.bludgeoning\\.strike\\.two-hand','^psfx\\.weapon-attacks\\.hammer')],
 flail:[cue('Flail contact','contact','^ggg-sfx\\.melee\\.bludgeoning\\.strike\\.flail')],
 whip:[cue('Whip crack','contact','^ggg-sfx\\.melee\\.whip\\.strike\\.01')],
 unarmed:[cue('Unarmed contact','contact','^ggg-sfx\\.melee\\.unarmed\\.fist\\.strike\\.01\\.medium')],
 claw:[cue('Claw contact','contact','^ggg-sfx\\.melee\\.claws\\.strike\\.slash')],
 kick:[cue('Kick contact','contact','^ggg-sfx\\.melee\\.unarmed\\.kick\\.strike\\.01\\.medium')],
 shield:[cue('Shield intercept','effect','^ggg-sfx\\.equipment\\.armor\\.shield\\.impact','', 'Combat/Single/Shield Hit')],
 shieldStrike:[cue('Shield strike','contact','^ggg-sfx\\.equipment\\.armor\\.shield\\.impact','', 'Combat/Single/Shield Hit')],
 shieldRaise:[cue('Shield raises','cast','^ggg-sfx\\.equipment\\.armor\\.shield\\.equip')],
 bow:[cue('Bow release','release','^ggg-sfx\\.ranged\\.bow\\.strike\\.general\\.01'),cue('Arrow contact','impact','^ggg-sfx\\.ranged\\.bow\\.impact\\.01')],
 longbow:[cue('Longbow release','release','^ggg-sfx\\.ranged\\.bow\\.strike\\.long_bow\\.01','^psfx\\.ranged-weapons\\.longbow.*15ft'),cue('Arrow contact','impact','^ggg-sfx\\.ranged\\.bow\\.impact\\.01')],
 shortbow:[cue('Shortbow release','release','^ggg-sfx\\.ranged\\.bow\\.strike\\.short_bow\\.01'),cue('Arrow contact','impact','^ggg-sfx\\.ranged\\.bow\\.impact\\.01')],
 crossbow:[cue('Crossbow release','release','^ggg-sfx\\.ranged\\.crossbow\\.strike\\.01'),cue('Bolt contact','impact','^ggg-sfx\\.ranged\\.bow\\.impact\\.01')],
 sling:[cue('Sling release','release','^ggg-sfx\\.ranged\\.sling\\.strike'),cue('Stone contact','impact','^ggg-sfx\\.ranged\\.sling\\.impact')],
 firearm:[cue('Black-powder discharge','release','^ggg-sfx\\.ranged\\.firearm\\.old_timey\\.strike'),cue('Round contact','impact','^ggg-sfx\\.ranged\\.firearm\\.flintlock_pistol\\.impact')],
 pistol:[cue('Pistol discharge','release','^ggg-sfx\\.ranged\\.firearm\\.flintlock_pistol\\.strike'),cue('Round contact','impact','^ggg-sfx\\.ranged\\.firearm\\.flintlock_pistol\\.impact')],
 musket:[cue('Musket discharge','release','^ggg-sfx\\.ranged\\.firearm\\.musket\\.strike'),cue('Round contact','impact','^ggg-sfx\\.ranged\\.firearm\\.musket\\.impact')],
 arquebus:[cue('Arquebus discharge','release','^ggg-sfx\\.ranged\\.firearm\\.arquebus\\.strike'),cue('Round contact','impact','^ggg-sfx\\.ranged\\.firearm\\.arquebus\\.impact')],
 blowgun:[cue('Dart release','release','^ggg-sfx\\.ranged\\.blowgun\\.strike')],
 thrown:[cue('Thrown release','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Thrown contact','impact','', '', 'Combat/Single/Throw Hit')],
 ranged:[cue('Projectile release','release','^ggg-sfx\\.ranged\\.thrown\\.general')],
 mixed:[cue('Projectile release','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Blade contact','contact','^ggg-sfx\\.melee\\.blade\\.strike\\.shortsword\\.01','^psfx\\.weapon-attacks\\.sword')],
 bomb:[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Container breaks','impact','^ggg-sfx\\.ranged\\.bomb\\.break')],
 'bomb-soft':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general')],
 'bomb-fracture':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Container breaks','impact','^ggg-sfx\\.ranged\\.bomb\\.break')],
 'bomb-explosive':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Fragment burst','impact','^ggg-sfx\\.ranged\\.bomb\\.explosion')],
 'bomb-pressure':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Pressure burst','impact','^ggg-sfx\\.ranged\\.bomb\\.explosion')],
 'bomb-water':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Water bladder splash','impact','^ggg-sfx\\.ranged\\.bomb\\.water','','Misc/Single/Water Splash')],
 'bomb-thorns':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Brambles release','impact','^ggg-sfx\\.magic\\.primal\\.burst\\.bramble')],
 'bomb-spores':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Mold growth','impact','^ggg-sfx\\.magic\\.primal\\.growth\\.02')],
 'bomb-acid':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Acid contents burst','impact','^ggg-sfx\\.ranged\\.bomb\\.acid','acid-splash')],
 'bomb-cold':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Frost contents burst','impact','^ggg-sfx\\.ranged\\.bomb\\.ice','impacts\\.magicaleffects\\.cold')],
 'bomb-fire':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Flame contents burst','impact','^ggg-sfx\\.ranged\\.bomb\\.fire','casting\\.fire')],
 'bomb-electricity':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Lightning contents burst','impact','^ggg-sfx\\.ranged\\.bomb\\.electricity','impacts\\.magicaleffects\\.lightning','Spell Impact Lightning')],
 'bomb-poison':[cue('Bomb toss','release','^ggg-sfx\\.ranged\\.thrown\\.general'),cue('Toxic contents burst','impact','^ggg-sfx\\.ranged\\.bomb\\.poison','poison-spray')],
 boomerang:[cue('Boomerang release','release','^ggg-sfx\\.ranged\\.thrown\\.boomerang\\.whoosh')],
 shuriken:[cue('Shuriken release','release','^ggg-sfx\\.ranged\\.thrown\\.shuriken\\.strike'),cue('Shuriken contact','impact','^ggg-sfx\\.ranged\\.thrown\\.shuriken\\.impact')],
 thrownSpear:[cue('Spear release','release','^ggg-sfx\\.ranged\\.thrown\\.spear\\.strike'),cue('Spear contact','impact','^ggg-sfx\\.ranged\\.thrown\\.spear\\.impact')],
 thrownDagger:[cue('Dagger release','release','^ggg-sfx\\.ranged\\.thrown\\.knife\\.strike'),cue('Dagger contact','impact','^ggg-sfx\\.ranged\\.thrown\\.knife\\.impact')],
 thrownAxe:[cue('Axe release','release','^ggg-sfx\\.melee\\.axe\\.throw\\.01\\.throw'),cue('Axe contact','impact','', '', 'Combat/Single/Throw Hit')],
};
const missing=[],selected=new Map();
for(const [profile,cues]of Object.entries(profiles))for(const c of cues){
 c.candidates=[];
 for(const [module,expression]of Object.entries(c.selectors)){
  if(!expression)continue;const re=new RegExp(expression,'i');
  const choices=entries.filter(e=>e.module===module&&re.test(e.key||e.file)).sort((a,b)=>a.file.localeCompare(b.file));
  const unique=[...new Map(choices.filter(e=>!/(?:loop|death|hurt|lethal|incantation)/i.test(e.key+' '+e.file)).map(e=>[e.file,e])).values()].slice(0,6);
  c.candidates.push(...unique.map(e=>({module:e.module,key:e.key,file:e.file})));
 }
 delete c.selectors;if(!c.candidates.length)missing.push({profile,label:c.label});
 for(const cnd of c.candidates){validateSoundFile(cnd.file);selected.set(cnd.file,cnd);}
}
const durations=new Map();let next=0;const files=[...selected.keys()];
await Promise.all(Array.from({length:8},async()=>{while(next<files.length){const file=files[next++];durations.set(file,await probeSoundFile(file));}}));
for(const cues of Object.values(profiles))for(const c of cues)for(const cnd of c.candidates)Object.assign(cnd,durations.get(cnd.file),{duration:Math.min(4500,durations.get(cnd.file).nativeDuration)});
const feats=Object.fromEntries(PF2E_FEATS.map(f=>[f.id,featSoundDirection(f)]));
const weapons=Object.fromEntries(PF2E_WEAPONS.flatMap(w=>w.modes.map(m=>{
 const d=weaponSoundDirection(w,m);if(m.mode==='thrown'&&['dagger','spear'].includes(d.profile))d.profile=d.profile==='spear'?'thrownSpear':'thrownDagger';
 return [`${w.id}:${m.mode}`,d];
})));
// Elemental bombs use the spell elemental impact profile, following actual base
// damage. Glass breaking alone misrepresents fire, frost and shock bombs.
const elements={fire:'fire',cold:'cold',electricity:'electric',acid:'acid',poison:'poison',void:'void',vitality:'holy',mental:'psychic',sonic:'sonic'};
for(const w of PF2E_WEAPONS)for(const m of w.modes)if(m.group==='bomb'&&SOUND_PROFILES[elements[m.element]]){
 const key=`bomb-${m.element}`;profiles[key]??=[...profiles.bomb.slice(0,1),...SOUND_PROFILES[elements[m.element]].slice(0,1).map(c=>({...c,role:'impact'}))];
 const decision=weapons[`${w.id}:${m.mode}`];decision.profile=key;decision.reason=`Native ${m.element} bomb contents have their own landing cue, rather than a generic pot break or restoration tone. ${m.rationale}`;
}
for(const w of PF2E_WEAPONS)for(const m of w.modes){
 const decision=weapons[`${w.id}:${m.mode}`],element=elements[m.element];
 // Native enchanted contact has one physical attack plus one material finish.
 // Keep additional rune layers quiet to avoid piling several cues on one hit.
 if(m.group==='bomb'||!element||!profiles[decision.profile]||!SOUND_PROFILES[element])continue;
 const key=`enchanted-${decision.profile}-${m.element}`;
 profiles[key]??=[...profiles[decision.profile],...SOUND_PROFILES[element].slice(0,1).map(c=>({...c,role:'impact',anchorSlot:'accent'}))];
 decision.profile=key;
}
// Restoration is a source spell followed by one physical blow. Use both phases
// without making the optional ally restoration sound like another weapon hit.
profiles.restorativeStrike=[...SOUND_PROFILES.healing.map(c=>({...c,role:'cast'})),...profiles.sword];
for(const [id,d]of Object.entries(feats))if(d.profile&&!profiles[d.profile]&&!SOUND_PROFILES[d.profile]){d.reason+=' No matching profile available.';d.profile='';}
const usedFiles=new Set(Object.values(profiles).flatMap(cues=>cues.flatMap(c=>c.candidates.map(e=>e.file))));
const coverage={feats:PF2E_FEATS.length,featSounds:Object.values(feats).filter(d=>d.profile).length,quietFeats:Object.values(feats).filter(d=>!d.profile).length,weapons:PF2E_WEAPONS.length,weaponModes:Object.keys(weapons).length,weaponSounds:Object.values(weapons).filter(d=>(profiles[d.profile]??SOUND_PROFILES[d.profile])?.some(c=>c.candidates.length)).length,selectedAudioFiles:usedFiles.size,packs,missing};
await writeFile('data/ability-sounds.mjs',`// Generated by tools/build-ability-sounds.mjs. Existing optional pack references only.\nexport const ABILITY_SOUND_PROFILES = ${JSON.stringify(profiles,null,2)};\nexport const FEAT_SOUND_DESIGNS = ${JSON.stringify(feats,null,2)};\nexport const WEAPON_SOUND_DESIGNS = ${JSON.stringify(weapons,null,2)};\n`);
await writeFile('data/pf2e-ability-sound-audit.json',JSON.stringify({coverage,feats,weapons},null,2));
console.log(JSON.stringify(coverage,null,2));
