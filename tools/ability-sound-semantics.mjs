const martial=new Set(['strike','heavyStrike','doubleStrike','multiStrike','restorativeStrike','smite','spellstrike','fearStrike','charge','tumbleStrike','feintStrike','bindStrike','tripStrike','drawStrike','whirlwindStrike','unarmed']);
const elementProfiles={fire:'fire',cold:'cold',lightning:'electric',electricity:'electric',acid:'acid',poison:'poison',healing:'healing',vitality:'holy',holy:'holy',necrotic:'void',void:'void',water:'water',earth:'earth',wind:'wind',arcane:'force',psychic:'psychic',mental:'psychic',sonic:'sonic'};
export function featSoundDirection(feat){
 const text=feat.plainDescription??'',d=feat.direction??{},motif=feat.motif;
 const choose=(profile,reason)=>({profile,reason,descriptionChars:text.length,descriptionHash:feat.descriptionHash});
 if(!text)return choose('','No full description available.');
 if(['distracting-toss','rebounding-toss'].includes(feat.slug))return choose('physicalToss','Complete description throws a configurable weapon; neutral physical release and per-contact cues follow its actual flight and rebound, not a bow shot or recipient throw.');
 if(['friendly-fling','friendly-toss','jotuns-boost'].includes(feat.slug))return choose('allyHeave','Complete description physically lifts and throws a willing ally. A short movement whoosh follows the source preparation; no music, spell or weapon-impact sound is inferred.');
 if(feat.slug==='feral-toss')return choose('naturalPierce','One horn, antler or tusk contact; the conditional push is silent and never treated as another attack.');
 if(feat.slug==='whirlwind-toss')return choose('unarmed','Thrash contacts, including collateral victims, receive physical contact cues; the subsequent optional victim throw is not another Strike.');
 if(feat.slug==='wind-tossed-spell')return choose('wind','Source wind prepares the next spell; its later attack has separate audio.');
 if(feat.traits.includes('subtle')||/silent|silence|quiet|stealth|sneak|conceal|whisper/i.test(feat.name)||/\b(?:deadly|complete|absolute)\s+silence\b|\b(?:moves?|attacks?)\s+(?:and\s+attacks?\s+)?silently\b/i.test(text)||['concealment','perception','utility','fortune','focus','gaze','preparation','command','performance','display','craft','taunt','inspiration'].includes(motif))return choose('','Quiet, player-chosen or uncertain activity; no public sound is inferred. Choose a sound in Customize.');
 if(feat.slug==='clear-the-way')return choose('','Complete description attempts Shove maneuvers, then movement; no weapon Strike or blade-cut contact is performed.');
 if(feat.slug==='twin-shot-knockdown')return choose('ranged','Complete description makes two ranged Strikes with crossbows or firearms, rather than two melee blade contacts. Neutral release preserves the selected weapon.');
 if(feat.slug==='writhing-runelord-weapon')return choose('spear','Complete description requires a polearm or spear and two Strikes. A long-hafted contact cue replaces unrelated shortsword cuts.');
 if(feat.slug==='running-reload')return choose('','Reload type depends on the wielded weapon. Choose its reload sound in Customize; no gunshot inferred.');
 if(motif==='restorativeStrike')return choose('restorativeStrike','Complete description restores the source before one melee Strike. Healing and physical contact receive distinct phase cues; optional ally healing is not inferred as another blow.');
 if(martial.has(motif)&&d.contacts?.count!==0){
  let weapon=String(d.weapon??'').toLowerCase();
  if(!weapon||weapon==='as described'){
   if(/(?:make|making|attempt|perform)\s+(?:an?\s+|two\s+|three\s+)?unarmed\s+(?:strikes?|attacks?)/i.test(text)||/unarmed contacts/i.test(d.approach??'')||/\bunarmed attacks?\b/i.test(text)&&!/\bweapon\b/i.test(text))weapon='unarmed';
  }
  return choose(/kick/.test(feat.slug)?'kick':/claw|talon/.test(weapon)?'claw':/unarmed|fist|jaw/.test(weapon)||motif==='unarmed'?'unarmed':/hammer|club|staff|bludgeon/.test(weapon)?'club':'sword','Full description and reviewed contact sequence indicate physical attacks. Each authored contact receives its own cue; generic melee follows the blade artwork and can be customized for the wielded weapon.');
 }
 if(['firearm','alchemicalShot'].includes(motif))return /(?:firearm.*crossbow|crossbow.*firearm)/i.test(d.weapon??'')||/\bfirearm\b/i.test(text)&&/\bcrossbow\b/i.test(text)?choose('ranged','Firearm or crossbow permitted; neutral release avoids assuming the chosen weapon. Customize for its discharge.'):choose('firearm','Explicit firearm discharge, synchronized to release.');
 if(motif==='mixedStrike')return choose('mixed','Reviewed mixed melee/ranged attacks; neutral release plus physical contact avoids guessing a wielded gun or bow.');
 if(['ranged','throughShot'].includes(motif)){
  const weapon=String(d.weapon??'').toLowerCase();
  const profile=/\bor\b/.test(weapon)?'ranged':/\b(?:gun|firearm|bullet|pistol|musket|rifle)\b/.test(weapon)?'firearm':/\bblowgun\b/.test(weapon)?'blowgun':/\bcrossbow\b/.test(weapon)?'crossbow':/\b(?:bow|arrow)\b/.test(weapon)?'bow':/\bsling\b/.test(weapon)?'sling':'ranged';
  return choose(profile,'Reviewed ranged attack; exact weapon boundaries preserve blowgun/crossbow identity. Player-choice alternatives use a neutral release cue.');
 }
 if(motif==='boomerang'&&feat.theme==='wind')return choose('wind','Description creates a blade of shearing wind; no wooden boomerang is thrown.');
 if(['boomerang','bombThrow'].includes(motif))return choose(motif==='bombThrow'?'bomb':'thrown','Description explicitly throws an object; finite release cue.');
 if(motif==='medicine')return choose('','Mundane wound treatment: no magical healing tone or heartbeat is inferred.');
 if(motif==='shield'||motif==='guard'&&/shield/i.test(text))return choose(d.contacts?.count>0?'shieldStrike':/\b(?:raise|equip)\b/i.test(text)&&!/^shield-block$/.test(feat.slug)?'shieldRaise':'shield',d.contacts?.count>0?'Description makes an outgoing shield Strike; contact follows its blow.':'Physical shield is raised or intercepts a blow, following its reviewed action.');
 if(motif==='counteract')return choose('dispel','Description and reviewed design counteract magic.');
 if(motif==='teleport')return choose('teleport','Explicit spatial departure/arrival.');
 if(['restoration','healing','waterHeal','restorativeStrike'].includes(motif))return choose('healing','Description explicitly restores through a magical effect.');
 if(['elementTarget','elementAura','elementCone','elementBolt','flamePath','waveGuard','lineCue','ray','phoenix'].includes(motif))return choose(elementProfiles[feat.theme]??'','Reviewed elemental manifestation; optional finite elemental cue.');
 return choose('','No reliable audible action in the complete description; silent by design.');
}
export function weaponSoundDirection(weapon,mode){
 const construction=(weapon.base+' '+weapon.name+' '+(weapon.plainDescription??'').split(/Activate|Frequency|Critical Hit/i)[0]).toLowerCase();
 const nativeType=choices=>choices.map(([pattern,profile])=>({index:construction.search(pattern),profile})).filter(r=>r.index>=0).sort((a,b)=>a.index-b.index)[0]?.profile;
 if(mode.group==='bomb'){
  const payload=mode.payload??{},material=payload.style==='pressure'?'pressure':payload.style==='thorns'?'thorns':payload.style==='spores'?'spores':payload.element==='water'?'water':payload.style==='shrapnel'?'explosive':payload.fracture?'fracture':'soft';
  return {profile:'bomb-'+material,reason:`Native ${payload.style??'bomb'} payload selects ${material} audio; a soft bladder, plant sack or foam is not assumed to break like pottery. ${mode.rationale}`,descriptionChars:weapon.descriptionChars,descriptionHash:weapon.descriptionHash};
 }
 if(mode.mode==='ranged'&&mode.family==='bow')return {profile:nativeType([[/long[- ]?bow/,'longbow'],[/short[- ]?bow/,'shortbow']])??'bow',reason:'Native bow construction selects its matching draw/release; unspecified bows keep a neutral bow cue.',descriptionChars:weapon.descriptionChars,descriptionHash:weapon.descriptionHash};
 if(mode.mode==='ranged'&&mode.family==='firearm')return {profile:nativeType([[/arquebus/,'arquebus'],[/musket/,'musket'],[/pistol/,'pistol']])??'firearm',reason:'Native firearm construction selects arquebus, musket or pistol discharge when explicit; other firearms use a neutral black-powder cue.',descriptionChars:weapon.descriptionChars,descriptionHash:weapon.descriptionHash};
 const equivalents={rapier:'rapier',shortsword:'sword',katana:'katana',butterflysword:'sword',sickle:'sword',scimitar:'sword',falchion:'greatsword',handaxe:'axe',greataxe:'axe',quarterstaff:/\b(?:iron|steel|metal)\b/.test(construction)?'ironStaff':'staff',greatclub:'hammer',glaive:'polearmBlade',halberd:'polearmBlade',scythe:'polearmBlade',mace:'club',claw:'claw',maul:'hammer',warhammer:'hammer',javelin:'spear',dart:'thrownDagger',chakram:'thrown',shieldThrow:'thrown',projectile:'ranged',airgun:'blowgun',spike:'thrownSpear',spittle:elementProfiles[mode.element]??'force'};
 const family=equivalents[mode.family]??(['flask','bomb'].includes(mode.family)?'bomb':['polearm','pick'].includes(mode.family)?'spear':['contact','shield'].includes(mode.family)?'club':mode.family);
 return {profile:mode.mode==='thrown'&&family==='axe'?'thrownAxe':mode.mode==='thrown'&&!['bomb','spear','dagger','shuriken','boomerang'].includes(family)?'thrown':family,reason:`${mode.mode} ${family} cue follows native usage and physical construction. ${mode.rationale}`,descriptionChars:weapon.descriptionChars,descriptionHash:weapon.descriptionHash};
}
