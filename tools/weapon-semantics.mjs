import {createHash} from 'node:crypto';
import {descriptionText} from './spell-semantics.mjs';
const physical=new Set(['bludgeoning','piercing','slashing']);
// Pinned PF2e rune damage: Brilliant's spirit/vitality components are target-
// dependent; Holy/Unholy always deal spirit (the target changes its amount).
const runeElements={flaming:'fire',frost:'cold',shock:'electricity',corrosive:'acid',thundering:'sonic',wounding:'bleed',brilliant:'fire',astral:'spirit',holy:'spirit',unholy:'unholy'};
const nativeElement=t=>physical.has(t)?'physical':t;
// Visual flourishes for an item's own element/sanctification traits or its
// themed construction. They never become Strike damage (mode.element stays).
// Poison/void/mental/force traits usually mark an activation, so only elemental,
// sanctified and material traits flourish.
const traitFlavors={fire:'fire',cold:'cold',electricity:'electricity',acid:'acid',sonic:'sonic',holy:'holy',unholy:'unholy',air:'air',earth:'earth',water:'water',wood:'plant',plant:'plant',shadow:'shadow',light:'light'};
const themedFlavors=[[/^staff-of-fire\b/,['fire']],[/^(?:staff-of-air|staff-of-the-tempest)\b/,['electricity']],[/^(?:atmospheric-staff|staff-of-the-desert-winds)\b/,['air']],[/^(?:staff-of-water|fluid-form-staff)\b/,['water']],[/^staff-of-earth\b/,['earth']],[/^staff-of-encroaching-shadows\b/,['shadow']],[/^(?:staff-of-the-dead|zombie-staff)\b/,['void']],[/^staff-of-healing\b/,['vitality']],[/^boreal-staff\b/,['cold']],[/^corrosive-staff\b/,['acid']],[/^poisoners-staff\b/,['poison']],[/^staff-of-illumination\b/,['light']],[/^(?:verdant-staff|birchstaff|arboreal-staff|twining-staff|staff-of-natures-(?:vengeance|cunning))\b/,['plant']],[/^mentalists-staff\b/,['mental']],[/^(?:staff-of-arcane-might|staff-of-power|staff-of-the-magi)\b/,['force']],[/^(?:four-tiger-blade|guiding-starknife)\b/,['light']],[/^blade-of-four-energies\b/,['fire','cold','electricity']],[/^four-ways-dogslicer\b/,['fire','cold','electricity']]];
function unconditionalStrikeRules(system){
 const rules=(system.rules??[]).filter(r=>['DamageDice','FlatModifier'].includes(r.key)&&r.critical!==true&&
  /^[a-z]+$/.test(r.damageType??'')&&[r.selector].flat().some(s=>/^\{item\|(id|_id)\}-damage$/.test(s)));
 return rules.filter(r=>!r.predicate?.length||r.predicate.length===1&&typeof r.predicate[0]?.not==='string'&&
   rules.some(p=>p.damageType===r.damageType&&p.predicate?.length===1&&p.predicate[0]===r.predicate[0].not));
}
function bombPayload(slug,element,persistent){
 let style=({acid:'liquid',poison:'liquid',cold:'frost',electricity:'lightning',fire:'fire',void:'void',negative:'void',vitality:'radiance',positive:'radiance',force:'force',sonic:'sonic',mental:'gas'})[element]??'shrapnel';
 let hue=element;
 if(/^(sulfur-bomb|skunk-bomb|durian-bomb|dread-ampoule|vexing-vapor)/.test(slug)){style='gas';hue=slug.startsWith('sulfur')?'light':slug.startsWith('durian')?'poison':element;}
 if(/^(glue-bomb|tanglefoot-bag|mud-bomb|water-bomb|goo-grenade|steelscour)/.test(slug)){style='liquid';hue=slug.startsWith('glue')||slug.startsWith('tanglefoot')?'glue':slug.startsWith('mud')?'mud':slug.startsWith('water')?'water':element;}
 if(/^crystal-shards/.test(slug)){style='crystal';hue='crystal';}
 if(/^blightburn-bomb/.test(slug)){style='radiation';hue='poison';}
 if(/^aether-marbles/.test(slug))style='force';
 if(/^star-grenade/.test(slug))style='crossFire';
 if(/^silversoul-bomb/.test(slug)){style='silverLight';hue='silver';}
 if(/^silverscrap-bomb/.test(slug))hue='silver';
 if(/^vexing-vapor/.test(slug))hue='redPowder';
 if(/^sticky-algae-bomb/.test(slug))style='algae';
 if(/^peshpine-grenade/.test(slug)){style='needles';hue='plant';}
 if(/^pressure-bomb/.test(slug))style='pressure';
 if(/^boulder-seed/.test(slug)){style='foam';hue='foam';}
 if(/^pernicious-spore-bomb/.test(slug)){style='spores';hue='poison';}
 if(/^silver-orb/.test(slug))hue='silver';
 if(/^dwarven-daisy/.test(slug))style='firework';
 if(/^bioluminescence-bomb/.test(slug)){style='light';hue='light';}
 if(/^spider-satchel/.test(slug)){style='insects';hue='darkInsects';}
 if(/^twigjack-sack/.test(slug)){style='thorns';hue='plant';}
 const residue=Boolean(persistent)||/^(aether-marbles|goo-grenade|glue-bomb|tanglefoot-bag|mud-bomb|silver-orb|sticky-algae-bomb|bioluminescence-bomb|pernicious-spore-bomb|boulder-seed)/.test(slug);
 return {style,element:hue,residue,residueElement:persistent??hue,fracture:/flask|vial|ampoule|sulfur-bomb|crystal-shards/.test(slug),
  secondary:/^bottled-sunlight/.test(slug)?'fire':/^sulfur-bomb/.test(slug)?'acid':/^durian-bomb/.test(slug)?'physical':'',note:`Target-centered contents cue; lingering artwork is brief and does not track a condition or splash footprint.${style==='crossFire'?' A local crossed burst illustrates the release; place the two perpendicular 25-foot splash lines manually.':''}${/^durian-bomb/.test(slug)?' Green odor is symbolic stench, not poison damage; fruit needles supply the physical contact.':''}${style==='insects'?' Moving particles approximate biting spider babies; available JB2A footage has no literal spider swarm.':''}`};
}
function nativeSwordFamily(base,construction,fallback){
 const shapes=[[/\bbutterfly[- ]?sword\b/,'butterflysword'],[/\b(?:short[- ]?sword|wakizashi)\b/,'shortsword'],[/\bkatana\b/,'katana'],[/\bscimitar\b/,'scimitar'],[/\bfalchion\b/,'falchion'],[/\b(?:rapier|estoc)\b/,'rapier'],[/\b(?:bastard[- ]sword|long[- ]?sword)\b/,'sword'],[/\bgreat[- ]?sword\b/,'greatsword']];
 // A declared base item wins. Without one, take the first explicit physical
 // construction, rather than a later list of optional transformed shapes.
 const declared=shapes.find(([pattern])=>pattern.test(base??''));
 if(declared)return declared[1];
 const found=shapes.map(([pattern,family])=>({index:construction.search(pattern),family})).filter(s=>s.index>=0).sort((a,b)=>a.index-b.index);
 return found[0]?.family??fallback;
}
export function weaponModes(system){
 const traits=system.traits?.value??[],modes=[];
 const add=(mode,s,range)=>modes.push({mode,group:s.group??'weapon',damage:s.damage?.damageType??s.damage?.type??'bludgeoning',die:s.damage?.die??'d4',persistent:s.damage?.persistent,traits:s.traits?.value??s.traits??[],range:range??0});
 const thrownBase=traits.includes('thrown')||system.group==='bomb';
 add(system.range?thrownBase?'thrown':'ranged':'melee',system,system.range);
 const thrown=traits.find(t=>/^thrown-\d+$/.test(t));
 if(!system.range&&thrown)add('thrown',system,Number(thrown.split('-')[1]));
 if(system.meleeUsage?.group&&system.meleeUsage?.damage){
  const m=system.meleeUsage;add('melee',m,0);
  const t=(m.traits??[]).find(t=>/^thrown-\d+$/.test(t));
  if(t)add('thrown',m,Number(t.split('-')[1]));
 }
 return modes;
}
export function analyzeWeapon(item,path){
 const s=item.system,raw=s.description?.value??'',plain=descriptionText(raw),traits=s.traits?.value??[];
 const unarmedEquipment=s.category==='unarmed'&&s.traits?.otherTags?.includes('handwraps-of-mighty-blows');
 const runes=Object.values(s.runes?.property??{});
 // Exact rune names (optionally greater/major): Shockwave is not Shock.
 const permanent=[...new Set(runes.flatMap(r=>Object.entries(runeElements).filter(([name])=>String(r).toLowerCase().replace(/^(?:greater|major|true)/,'')===name).map(([,type])=>type)))];
 const strikeRules=unconditionalStrikeRules(s),riders=[...new Set(strikeRules.map(r=>r.damageType))];
 const hands=/two-hands/.test(s.usage?.value??'')?2:1;
 const slug=path.split('/').at(-1).replace(/\.json$/,'');
 // Wrapped item damage is storage data, not a separate Strike. Preview the
 // native basic unarmed contact; only permanent runes supply extra finishes.
 const modeSystem=unarmedEquipment?{...s,range:null,damage:{damageType:'bludgeoning',die:'d4'},traits:{...s.traits,value:[...new Set([...traits,'agile','finesse','nonlethal','unarmed'])]}}:s;
 const modes=weaponModes(modeSystem).map(m=>{
  const text=(item.name+' '+s.baseItem+' '+plain).toLowerCase(),g=m.group;
  let family=m.mode==='melee'?g==='knife'?'dagger':g==='sword'?hands===2?'greatsword':'sword':g==='spear'?'spear':g==='hammer'?'hammer':g==='club'?'club':g==='flail'&&/whip|lash/.test(text)?'whip':g==='flail'?'flail':g==='brawling'?'unarmed':g==='axe'?'axe':g==='polearm'?'polearm':g==='pick'?'pick':g==='shield'?'shield':'contact'
   :m.mode==='thrown'?g==='bomb'?/flask|vial|bottl|ampoule|glass (?:sphere|orb)/.test(text)?'flask':'bomb':/shuriken|throwing star/.test(text)?'shuriken':/boomerang/.test(text)?'boomerang':g==='spear'||/javelin/.test(text)?'spear':g==='knife'||/dart|kunai/.test(text)?'dagger':g==='hammer'?'hammer':g==='axe'?'axe':'thrown'
   :g==='bow'?'bow':g==='crossbow'?'crossbow':g==='sling'?'sling':/blowgun/.test(text)?'blowgun':g==='firearm'?'firearm':'projectile';
  const construction=(item.name+' '+s.baseItem+' '+plain.split(/Activate|Frequency|Critical Hit/i)[0]).toLowerCase();
  if(m.mode==='melee'){
   // Explicit native construction outranks damage: shortswords pierce too, but
   // do not become rapiers. Base identity also survives a magical item's rename.
   if(g==='sword')family=nativeSwordFamily(s.baseItem,construction,family);
   if(g==='knife'&&/\bsickle\b/.test(construction))family='sickle';
   if(g==='axe')family=hands===2?'greataxe':'handaxe';
   if(g==='club')family=/staff/.test(construction)?'quarterstaff':/\bmace\b/.test(construction)?'mace':hands===2?'greatclub':'club';
   if(g==='polearm')family=/\bscythe\b/.test(construction)?'scythe':/halberd/.test(construction)?'halberd':'glaive';
   if(g==='hammer')family=/maul/.test(construction)?'maul':/warhammer/.test(construction)?'warhammer':'hammer';
   if(g==='brawling'&&/\b(?:claw|talon)\b/.test(construction)&&m.damage==='slashing')family='claw';
   // Cutting spears swing like a glaive; ring blades have native chakram footage.
   if(g==='spear'&&m.damage==='slashing')family='glaive';
   if(family==='contact'&&/\bchakr(?:am|i)\b/.test(construction))family='chakram';
  }else{
   if(m.mode==='thrown')family=/javelin/.test(construction)?'javelin':/\bchakr(?:am|i)\b|\bdiabolo\b/.test(construction)?'chakram':/shuriken|throwing star/.test(construction)?'shuriken':/kunai|dart/.test(construction)&&g!=='bomb'?'dart':g==='axe'?'handaxe':g==='shield'?'shieldThrow':family;
   // Generic thrown objects: vials, pens, bolas, hooks and weights each get a shaped flight.
   if(m.mode==='thrown'&&g!=='bomb'&&/\b(?:holy|unholy) water\b|\bvial\b|\bflask\b/.test(item.name.toLowerCase()))family='vial';
   else if(family==='thrown')family=g==='dart'?'dart':g==='sling'||/\bbolas?\b/.test(construction)?'bola':g==='flail'?['piercing','slashing'].includes(m.damage)?'hook':'weight':g==='club'?'club':family;
   if(m.mode==='ranged')family=/spittle instead of typical/.test(construction)?'spittle':/pressurized air instead of black powder/.test(construction)?'airgun':/spear-like projectiles/.test(construction)?'spike':/uses darts as ammunition/.test(construction)?'dart':family;
  }
  const tearing=m.traits.includes('tearing');
  const elements=[...new Set([nativeElement(m.damage),...permanent,...riders.map(nativeElement),...(tearing?['bleed']:[])].filter(t=>t!=='physical').map(t=>t==='spirit'&&traits.includes('unholy')?'unholy':t))];
  const flavor=g==='bomb'?[]:[...new Set([...traits.map(t=>traitFlavors[t]),...(themedFlavors.find(([pattern])=>pattern.test(slug))?.[1]??[])].filter(f=>f&&!elements.includes(f)&&!(f==='holy'&&elements.includes('spirit'))))].slice(0,3);
  const damage=elements[0]??'physical';
  // Silversoul's mental persistence is creature-specific, not a generic hit.
  // Native DamageDicePF2e/ModifierPF2e and DamageInstance classify bleed as
  // persistent without an explicit category. Tearing also supplies bleed on
  // every successful Strike; conditional/critical rule elements stay excluded.
  const implicitBleed=m.damage==='bleed'||tearing||permanent.includes('bleed')||strikeRules.some(r=>r.damageType==='bleed');
  const persistent=!/^silversoul-bomb/.test(slug)&&m.persistent?.number>0?m.persistent.type:implicitBleed?'bleed':strikeRules.find(r=>r.category==='persistent')?.damageType??'';
  const payload=g==='bomb'?bombPayload(slug,damage,persistent):null;
  if(payload&&family==='flask')payload.fracture=true;
  const reach=m.traits.includes('reach'),agile=m.traits.includes('agile');
  const die=Number(m.die.replace('d',''))||6;
  // This is an explicit successful-Strike rider in the native description,
  // independent of the cane's reaction and spell-casting activations.
  const onHitCue=slug==='cane-of-the-maelstrom'?'warpwave':'';
  return {...m,family,element:damage,elements,flavor,persistent,payload,hands,reach,agile,heavy:hands===2||die>=10,
    onHitCue,
    returning:m.mode==='thrown'&&runes.includes('returning'),
    rationale:`${m.mode==='melee'?`${hands===2?'Two-handed':'One-handed'} ${m.damage} contact${reach?', extended reach':''}`:`${family} ${m.mode==='thrown'?'throw':'shot'} across ${m.range} ft increments`}. ${damage!=='physical'?`${elements.join(' + ')} native damage, permanent runes or always-on own-weapon damage rules supply the contact accents.`:'Physical weapon footage and restrained contact finish.'}${payload?` ${payload.style} contents at impact${payload.residue?', followed by a brief residue cue':''}. ${payload.note}`:persistent?' Brief native persistent-damage cue follows contact.':''}${flavor.length?` ${flavor.join(' + ')} flourish reflects the item's own traits or construction, not Strike damage.`:''}${onHitCue?' Successful-hit Warpwave is illustrated by a finite distortion field; its random rules outcome is not applied. Patreon has multicolored footage; Free uses a blue approximation.':''} Native weapon data and full description inform the design; activated powers, target-dependent riders and critical-only effects are not inferred from a Strike.`};
 });
 return {id:item._id,name:item.name,img:item.img,slug,level:s.level?.value??0,base:s.baseItem??'',group:s.group??'weapon',category:s.category,traits,rarity:s.traits?.rarity??'common',edition:s.publication?.remaster===false?'legacy':'remaster',publication:s.publication?.title??'',path,description:raw,plainDescription:plain,
  ...(unarmedEquipment?{strikeBinding:'unarmed'}:{}),
  descriptionHash:createHash('sha256').update(raw).digest('hex').slice(0,16),descriptionChars:plain.length,
  modes,notes:['Strike visuals only. Activated item powers, critical riders, versatile toggles and temporary ammunition effects can be customized separately.','Game positions, inventory, ammunition and rules remain controlled by PF2e.']};
}
