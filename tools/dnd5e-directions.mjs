// Native D&D activity semantics. Full source text remains available for audits.
import {effectiveActivity} from './dnd5e-source.mjs';
import {readFileSync} from 'node:fs';
const reviewed=JSON.parse(readFileSync(new URL('../data/dnd5e-native-directions.json',import.meta.url),'utf8'));
const directions=new Map(reviewed.directions.map(d=>[`${d.uuid}::${d.activityId}`,d]));
export const damageThemes={lightning:'electricity',thunder:'sonic',radiant:'light',necrotic:'void',psychic:'mind',healing:'healing',slashing:'weapon',piercing:'weapon',bludgeoning:'weapon'};
const named={
 'magic missile':{theme:'force',delivery:'missile',count:3,bolt:'magic_missile',sound:'forceMissile',note:'Three force darts total, distributed over selected recipients. Higher slots add darts; each dart has its own contact.'},
 'chain lightning':{theme:'electricity',delivery:'fork',bolt:'chain_lightning',sound:'chainLightning',note:'Initial arc reaches the primary target; secondary bolts fork from that first target, never hop between secondary targets.'},
 'eldritch blast':{theme:'force',delivery:'missile',bolt:'eldritch_blast',sound:'forceMissile',note:'One bolt for each native attack roll. Additional beams are separate attacks, not repeated on every roll.'},
 'scorching ray':{theme:'fire',delivery:'ray',bolt:'scorching_ray',sound:'fireRay',note:'One hot ray per native attack roll; additional rays keep their own rolls and targets.'},
 'ray of frost':{theme:'cold',delivery:'ray',bolt:'ray_of_frost',sound:'coldRay'},
 'ray of sickness':{theme:'poison',delivery:'ray',bolt:'energy_beam',sound:'poisonRay'},
 'ray of enfeeblement':{theme:'void',delivery:'ray',bolt:'energy_beam',sound:'darkRay'},
 'disintegrate':{theme:'force',delivery:'ray',bolt:'disintegrate.green',hit:'impact.003.green',cast:'cast_generic.02.green',sound:'forceRay'},
 'witch bolt':{theme:'electricity',delivery:'ray',bolt:'witch_bolt',sound:'lightningBolt'},
 'fire bolt':{theme:'fire',delivery:'missile',bolt:'fire_bolt',sound:'fireRay'},
 'guiding bolt':{theme:'light',delivery:'missile',bolt:'guiding_bolt',sound:'radiantRay'},
 'acid arrow':{theme:'acid',delivery:'missile',bolt:'arrow',sound:'acidSplash'},
 "melf's acid arrow":{theme:'acid',delivery:'missile',bolt:'arrow',sound:'acidSplash'},
 'chromatic orb':{theme:'force',delivery:'missile',bolt:'chromatic_orb,spell_projectile',sound:'force',note:'One elemental orb. Choose its damage material in Customize; 2024 bounce requires matching damage dice and is never fabricated automatically.'},
 'fireball':{theme:'fire',delivery:'areaMissile',bolt:'fire_bolt',area:'fireball.explosion',sound:'fireball'},
 'lightning bolt':{theme:'electricity',area:'lightning_bolt',sound:'lightningBolt'},
 'burning hands':{theme:'fire',area:'burning_hands',sound:'fireCone'},
 'cone of cold':{theme:'cold',area:'cone_of_cold',sound:'coldCone'},
 'moonbeam':{theme:'light',area:'moonbeam',sound:'moonRay'},
 'call lightning':{theme:'electricity',area:'call_lightning',hit:'lightning_strike',sound:'lightningBolt'},
 'ice storm':{theme:'cold',area:'ice_storm,sleet_storm',sound:'cold'},
 'meteor swarm':{theme:'fire',area:'meteor_swarm,fireball.explosion',sound:'fireball'},
 'spirit guardians':{theme:'spirit',area:'spirit_guardians',sound:'holy'},
 'spiritual weapon':{theme:'weapon',delivery:'contact',hit:'spiritual_weapon',sound:'metal',note:'Local spectral weapon contact. Its remote summon is not the caster rushing to its victim.'},
 'thunderwave':{theme:'sonic',area:'thunderwave',sound:'sonic'},
 'shatter':{theme:'sonic',area:'shatter',sound:'sonic'},
 'web':{theme:'web',area:'web',sound:'vines'},
 'entangle':{theme:'plant',area:'entangle',sound:'vines'},
 'cloudkill':{theme:'poison',area:'cloudkill,fog_cloud',sound:'poison'},
 'fog cloud':{theme:'water',area:'fog_cloud',sound:'wind'},
 'darkness':{theme:'shadow',area:'darkness',sound:'shadow'},
 'grease':{theme:'water',area:'grease,liquid',sound:'water'},
 'sleep':{theme:'mind',sound:'sleep'},
 'hideous laughter':{theme:'mind',sound:'laughter'},
 'counterspell':{theme:'dispel',sound:'dispel'},
 'dispel magic':{theme:'dispel',sound:'dispel'},
 'antimagic field':{theme:'dispel',delivery:'source',sound:'dispel',note:'Caster-centered suppression field. It prevents magic; incidental teleportation restrictions are not a teleport animation.'},
 'forbiddance':{theme:'ward',sound:'shield',note:'Protective ward over the native area; travel restrictions do not create a teleport. Follow-up contact stays local.'},
 'misty step':{theme:'teleport',delivery:'source',sound:'teleport'},
 'dimension door':{theme:'teleport',delivery:'source',sound:'teleport'},
 'teleport':{theme:'teleport',delivery:'source',sound:'teleport'},
 'second wind':{theme:'healing',delivery:'source',sound:'healing'},
 'sneak attack':{theme:'weapon',delivery:'contact',sound:'dagger',note:'An extra damage contact on the existing victim, never an invented second weapon strike.'},
 'divine smite':{theme:'light',delivery:'contact',hit:'divine_smite',sound:'holy'},
 'rage':{theme:'blood',delivery:'source',sound:null},
 'wild shape':{theme:'transform',delivery:'source',sound:'transform'},
 'flurry of blows':{theme:'weapon',delivery:'contact',sound:'unarmed',note:'Native individual attacks supply contacts; using the feature does not invent hit results.'},
 'oil':{theme:'water',delivery:'missile',sound:'water',note:'Unlit oil coating. Later fire damage does not make every thrown flask ignite.'},
 'acid':{theme:'acid',delivery:'missile',sound:'acidSplash'},
 'holy water':{theme:'light',delivery:'missile',sound:'holy'},
 "alchemist's fire":{theme:'fire',delivery:'missile',sound:'fireIgnition'},
 'net':{theme:'web',delivery:'missile',sound:'chainBinding'},
};
const nameThemes=[['healing',/heal|cure|restor|reviv|resurrect|regener|lay on hands|second wind/],['ward',/shield|armor|armour|protection|resistance|immun|sanctuary|death ward/],['teleport',/teleport|misty step|dimension door|blink/],['illusion',/illusion|disguise|mirror image|invisib|blur/],['divination',/detect|scry|locate|clairvoy|identify|commune/],['plant',/thorn|vine|plant|bark|entangl|nature/],['fire',/fire|flame|burn|scorch|meteor/],['cold',/\bice\b|cold|frost|snow|sleet/],['electricity',/lightning|electric|witch bolt/],['sonic',/thunder|sound|shatter/],['acid',/acid|corros/],['poison',/poison|venom|toxic/],['water',/water|ocean|tidal|grease|oil/],['earth',/earth|stone|rock|meld/],['wind',/wind|gust|whirlwind/],['fear',/fear|fright|terror/],['mind',/psychic|mind|charm|sleep|confus/],['shadow',/darkness|shadow/],['light',/sun|radiant|holy|divine|bless/],['void',/necrotic|death|wither|blight|vampir/],['summon',/summon|conjure|animate dead/],['transform',/polymorph|shape|enlarge|reduce|alter self/],['flight',/\bfly\b|levitat|feather fall/],['time',/haste|slow/]];
export function nativeDirection(row,activity,mode){
 const item=row.source,a=effectiveActivity(item,activity),name=item.name.toLowerCase().replace(/\s*\((?:vial|flask)\)$/, ''),act=(a.name??'').toLowerCase(),desc=row.description.toLowerCase();
 const author=named[name],base=structuredClone(author??{});
 const types=[...(a.damage?.parts??[]).flatMap(p=>p.types??[]),...(a.healing?.types??[])];
 const theme=base.theme??(a.type==='heal'?'healing':nameThemes.find(([,re])=>re.test(name))?.[0]??types.map(t=>damageThemes[t]??t).find(t=>!['weapon',''].includes(t))??nameThemes.find(([,re])=>re.test(desc.replace(/(?:immune|resistan)[^.]+\./g,'')))?.[0]??(item.type==='weapon'?'weapon':'arcane'));
 const template=a.target?.template,shape=template?.type,size=Number(template?.size);
 let area=shape&&Number.isFinite(size)&&size>0?{type:['sphere','radius'].includes(shape)?'circle':shape==='wall'?'line':shape,value:size}:null;
 const followup=item.flags?.dnd5e?.riders?.activity?.includes(a._id)||/follow.?up|ongoing|subsequent|lethargy|burn save|sustain|failure|mishap/.test(act)||a.activation?.type==='special'&&a.type==='damage'&&!/cast|throw|strike|attack/.test(act);
 const self=a.target?.affects?.type==='self'||a.range?.units==='self'&&!area;
 let delivery=base.delivery??(area?shape==='cone'?'cone':shape==='line'?'line':'burst':a.type==='attack'?a.attack?.type?.value==='melee'?'contact':/ray|beam/.test(name)?'ray':'missile':a.type==='heal'?self?'source':'recipient':self?'source':a.type==='damage'||types.length?'contact':a.target?.affects?.type?'recipient':'source');
 if(mode)delivery=mode==='melee'?'contact':'missile';
 if(followup){delivery=self?'source':'contact';delete base.count;}
 if(area&&delivery!=='areaMissile')delivery=area.type==='cone'?'cone':area.type==='line'?'line':'burst';
 if(name==='oil'&&/douse/.test(act))delivery='burst';
 if(a.type==='cast'||a.type==='forward')delivery='source';
 let trigger=area?'template':a.type==='attack'?'attack':['damage','heal'].includes(a.type)?'damage':'use';
 const review=directions.get(`${row.uuid}::${a._id}`);
 let nativeTheme=theme;
 if(review){
  nativeTheme=damageThemes[review.theme]??({lightning:'electricity',radiant:'light',necrotic:'void',psychic:'mind',prismatic:'force',petrification:'earth',blindness:'shadow','chosen-element':theme,oil:'water',resolve:'ward',reveal:'divination',divine:'spirit',nature:'plant',mobility:'wind',disruption:'dispel',stealth:'shadow',physical:'weapon',speed:'time',slow:'time',defense:'ward',restraint:'web',cleanse:'healing',mist:'water',primal:'plant',thunder:'sonic',protection:'ward',sleep:'mind'}[review.theme]??review.theme);
  const deliveryMap={projectile:'missile',local:review.origin==='caster'?'source':'contact',resource:'source',buff:review.origin==='caster'?'source':'recipient',summon:'source',cone:'cone',line:'line','vertical-strike':'contact',cloud:'burst',beam:'ray',aura:review.origin==='caster'?'source':'recipient',contact:'contact',teleport:'source','projectile-area':'areaMissile','falling-area':'burst',delegate:'source',column:'burst','ray-fan':'rayFan',wall:'line','barrier-sphere':'burst',area:'burst',cube:'burst',ring:'burst',connection:'ray',transform:review.origin==='caster'?'source':'recipient'};
  if(review.delivery!=='weapon-mode')delivery=deliveryMap[review.delivery]??delivery;
  if(review.targeting==='first-target-fan')delivery='fork';
  trigger=review.trigger;
  if(review.followup){area=null;delete base.count;}
  base.note=review.notes;base.motion=review.motion;base.nativeCounts=review.counts;
  if(review.colors)base.colors=review.colors;
  if(/Chill Touch/i.test(item.name)){base.hit='energy_strands,particle_burst';base.cast='cast_generic';}
 }
 if(mode)delivery=mode==='melee'?'contact':'missile';
 if(item.type!=='spell'&&['acid',"alchemist's fire",'oil'].includes(name)&&delivery==='missile'&&!followup){
  base.bolt='throwable.throw.flask';base.physicalThrow=true;
  if(name==='acid')base.hit='liquid.splash.green,liquid.splash';
  if(name==='oil')base.hit='liquid.splash.brown,liquid.splash';
 }
 // Using a native tool/ability check does not promise a magical manifestation
 // or successful outcome. Keep its optional symbolic cue manual and quiet.
 if(a.type==='check'){trigger='manual';delivery='source';area=null;base.sound=null;base.motion='none';base.note='Native ability or tool check. No magical effect or successful outcome is assumed; this optional symbolic cue is manual and quiet.';}
 const silent=/silence|invisible|invisibility|telepath|detect thoughts|pass without trace/.test(name)||base.sound===null;
 const profile=base.sound??({electricity:'electric',sonic:'sonic',vitality:'holy',spirit:'holy',light:'light',void:'void',mind:'psychic',plant:'growth',ward:'shield',arcane:'force',weapon:'sword',divination:'detect',illusion:'transform',flight:'wind',fear:'fear',curse:'void',web:'vines'}[nativeTheme]??nativeTheme);
 return {...base,areaAsset:typeof base.area==='string'?base.area:undefined,theme:nativeTheme,delivery,area,trigger,followup:review?.followup??followup,self,activity:a,reviewed:Boolean(review),sound:silent?null:profile,
 note:base.note??`${a.name||item.name}: ${followup?'native follow-up; target-local cue':area?`${shape} footprint from native activity`:delivery==='source'?'caster-local activation':delivery==='ray'?'visible ray followed by contact':delivery==='missile'?'flight followed by target contact':delivery==='contact'?'localized contact':'recipient-local effect'}. ${row.edition} rules and complete source description inform material; symbolic media does not change rules.`};
}
export function weaponModes(item,a){
 if(a.type!=='attack')return [undefined];
 const explicit=a.attack?.type?.value;
 const ranged=explicit==='ranged'||!explicit&&(/[Rr]$/.test(item.system?.type?.value??'')||['longbow','shortbow','lightcrossbow','heavycrossbow','handcrossbow','blowgun','dart','sling','pistol','musket'].includes(item.system?.type?.baseItem));
 const naturalRanged=item.system?.type?.value==='natural'&&Number(item.system?.range?.value)>Number(item.system?.range?.reach??5);
 return [...new Set([ranged?'ranged':'melee',...(naturalRanged?['ranged']:[]),...(item.system?.properties?.includes('thr')?['thrown']:[])])];
}
export function weaponSound(item,mode){
 const text=`${item.system?.type?.baseItem??''} ${item.name}`.toLowerCase();
 const family=[['crossbow',/crossbow/],['longbow',/longbow/],['shortbow',/shortbow|\bbow\b/],['sling',/sling/],['dagger',/dagger|knife/],['axe',/axe/],['hammer',/hammer|maul/],['flail',/flail/],['whip',/whip/],['spear',/spear|javelin|trident|pike|lance/],['rapier',/rapier/],['staff',/staff/],['club',/club|mace|morningstar/],['greatsword',/greatsword/],['polearmBlade',/glaive|halberd/]].find(([,re])=>re.test(text))?.[0]??(item.system?.type?.value==='natural'&&!/sword|blade|sickle/.test(text)?'unarmed':'sword');
 return mode==='thrown'?({dagger:'thrownDagger',axe:'thrownAxe',spear:'thrownSpear'}[family]??'thrown'):mode==='ranged'?(['crossbow','longbow','shortbow','sling'].includes(family)?family:'ranged'):family;
}

// D&D identifiers differ from the JB2A/shared selector's weapon families.
// Keep unknown natural contacts damage-specific instead of selecting the first
// generic contact (which happens to be bludgeoning in the inventory).
export function weaponVisualFamily(item){
 const base=item.system?.type?.baseItem??'';
 const aliases={longsword:'sword',battleaxe:'axe',lighthammer:'hammer',morningstar:'mace',warpick:'pick',pike:'spear',lance:'spear',trident:'spear',longbow:'bow',shortbow:'bow',lightcrossbow:'crossbow',heavycrossbow:'crossbow',handcrossbow:'crossbow',pistol:'firearm',musket:'firearm'};
 if(base)return aliases[base]??base;
 const text=item.name.toLowerCase();
 return [['boulder',/boulder|\brock\b/],['spike',/tail spike|thorn burst|hail of bark/],['claw',/claw|talon|rake|rend|scratch/],['spear',/spear|harpoon|fork/],['hammer',/hammer/],['club',/club|cudgel/],['quarterstaff',/staff/],['sickle',/sickle/],['sword',/sword|blade/],['bow',/\bbow\b/],['whip',/whip/]].find(([,re])=>re.test(text))?.[0]??'contact';
}
