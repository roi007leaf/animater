import {createHash} from 'node:crypto';
import {assetGeometry} from './spell-asset-selection.mjs';
import {variantFiles} from './asset-databases.mjs';
import {STATE_SEMANTIC_REVIEWS} from './state-semantic-reviews.mjs';
const hash=v=>createHash('sha256').update(v).digest('hex');
const plain=v=>String(v??'').replace(/@UUID\[[^\]]*\](?:\{([^}]+)\})?/g,(_,label)=>label??'').replace(/<[^>]*>/g,' ').replace(/&[a-z]+;/gi,' ').replace(/\s+/g,' ').trim();
export const profiles={
 fear:{match:['markers.fear','markers.horror'],color:'purple',hex:'#bb8fff',note:'A hovering fear sigil; sustained anxiety without moving the token.'},
 antidote:{match:['shield.01.loop','token_border.circle.static'],color:'green',hex:'#a7deac',note:'A protective ward marks resistance or a saving-throw bonus against poison or disease; it does not depict being poisoned.'},
 cooldown:{match:['token_border.circle.static','markers.simple'],color:'blue',hex:'#b3bdd2',note:'A quiet owner-only border marks a temporary reuse restriction; it does not depict the ended ability as still active.'},
 'fire-ward':{match:['shield_themed.above.fire'],color:'orange',hex:'#ffb27b',note:'A sustained fiery shield surrounds its bearer; native Shield Block remains controlled by PF2e.'},
 'glass-ward':{match:['shield.01.loop.white','condition.boon.02.001.refraction'],color:'white',hex:'#c8e7f5',note:'A clear barrier represents Glass Shield; Free uses a symbolic refractive shimmer.'},
 'prismatic-ward':{match:['energy_field.01.multicolored','condition.boon.02.001.refraction'],color:'multicolored',hex:'#d5acff',note:'A multicolored field represents Prismatic Shield; Free uses a symbolic refractive shimmer.'},
 'sonic-ward':{match:['shield.01.loop','markers.shield'],color:'blue',hex:'#a7ccec',note:'A protective shield marks sonic immunity from Droning Wings; this effect does not grant flight.'},
 stun:{match:['markers.stun'],color:'yellow',hex:'#f6d988',note:'Circling stars signal impaired actions.'},
 poison:{match:['markers.poison','fumes.04.loop'],color:'green',hex:'#92d483',note:'A poison sigil or low toxic haze.'},
 curse:{match:['markers.runes','condition.curse'],color:'purple',hex:'#b195d7',note:'An ominous rune marks an ongoing curse or penalty.'},
 blood:{match:['markers.drop'],color:'red',hex:'#ed859b',note:'A blood-drop marker identifies ongoing wounds or bleeding.'},
 chains:{match:['markers.chain'],color:'grey',hex:'#b4c3d8',note:'Bindings encircle the affected creature.'},
 shield:{match:['shield.01.loop','markers.shield'],color:'blue',hex:'#8bbdf4',note:'A translucent shield surrounds the creature.'},
 broken:{match:['markers.shield_cracked'],color:'orange',hex:'#d1a786',note:'A fractured shield marks compromised defenses or equipment.'},
 fire:{match:['flames.04.loop','shield_themed.above.fire'],color:'orange',hex:'#ffb27b',note:'Contained flames follow the bearer while the effect lasts.'},
 cold:{match:['aura_themed.01.orbit.loop.cold','markers.snowflake'],color:'blue',hex:'#8cdcff',note:'An icy orbit or snowflake identifies the cold effect.'},
 lightning:{match:['lightning_orb','energy_field.01'],color:'blue',hex:'#a9caff',note:'A restrained electric field surrounds the bearer.'},
 acid:{match:['bubble.001.001.loop','fumes.04.loop'],color:'green',hex:'#b5eb78',note:'A bubbling corrosive veil; Free may substitute blue bubbles.'},
 fog:{match:['ambient_fog.001.loop.small.white','smoke.plumes_loop','fumes.04.loop','markers.smoke'],color:'grey',hex:'#b6bfd0',note:'Soft haze denotes concealment; native visibility remains authoritative.'},
 nature:{match:['swirling_leaves.loop','aura_themed.01.orbit.loop.nature'],color:'green',hex:'#9de6b0',note:'Leaves orbit a sustained natural effect.'},
 stone:{match:['aura_themed.01.orbit.loop.metal'],color:'grey',hex:'#c1b9b3',note:'A muted stone-colored ring is a symbolic cue; the token is not transformed.'},
 light:{match:['markers.light','bless.200px.loop'],color:'yellow',hex:'#ffe2a0',note:'A soft light marks ongoing blessing or illumination.'},
 heal:{match:['markers.heart','bless.200px.loop'],color:'green',hex:'#8be6c4',note:'A restorative heart or blessing loop identifies ongoing recovery.'},
 music:{match:['markers.music','markers.music_note'],color:'blue',hex:'#c7acff',note:'Musical notes follow an ongoing composition.'},
 silence:{match:['markers.mute'],color:'dark_red',hex:'#d79da9',note:'A muted-sound sigil marks hearing or speech impairment.'},
 mind:{match:['markers.runes02','markers.runes03'],color:'purple',hex:'#d8a8e9',note:'A mind-rune marks sustained mental influence.'},
 speed:{match:['token_border.circle.spinning','particles.swirl'],color:'blue',hex:'#8fe2f4',note:'A brisk border suggests heightened speed; token position stays intact.'},
 slow:{match:['token_border.circle.static','markers.simple'],color:'blue',hex:'#a5b0df',note:'A quiet static border marks constrained action or movement.'},
 flight:{match:['token_border.circle.spinning'],color:'white',hex:'#bedcf5',note:'A soft rotating border symbolizes flight without raising the native token or implying an unrelated element.'},
 mark:{match:['hunters_mark.loop','markers.simple'],color:'green',hex:'#e3a690',note:'An attached targeting mark follows the effect bearer.'},
 death:{match:['markers.skull'],color:'purple',hex:'#ce9bb9',note:'A subdued skull signals mortal danger.'},
 boon:{match:['condition.boon','token_border.circle.static'],color:'green',hex:'#a9dbb4',note:'A quiet boon marker represents a statistical enhancement.'},
 neutral:{match:['token_border.circle.static','markers.simple'],color:'blue',hex:'#aebddd',note:'A subtle border is a symbolic marker for this ongoing state.'},
 invisible:{match:['markers.on_token_mask','markers.smoke','token_border.circle.static'],color:'grey',hex:'#b5bcd9',note:'A private veil marks invisibility to its owner and GMs; it never changes token visibility.'},
 illusion:{match:['markers.bubble','bubble.001.001.loop'],color:'purple',hex:'#d1a2e5',note:'A translucent shimmer represents ongoing illusion; it does not create mechanical duplicates.'},
 water:{match:['bubble.001.001.loop','aura_themed.01.orbit.loop.cold'],color:'blue',hex:'#87d6ee',note:'Water-like bubbles follow a sustained aquatic effect.'},
 void:{match:['aura_themed.01.orbit.loop.cold','markers.runes'],color:'purple',hex:'#b99be5',note:'A dark arcane orbit symbolizes void energy.'},
 sonic:{match:['markers.music','energy_field.01'],color:'blue',hex:'#bfa8ef',note:'A restrained resonance cue denotes sustained sonic energy.'},
 web:{match:['web.loop','markers.chain'],color:'white',hex:'#d3d8e8',note:'A web or binding loop marks entanglement.'},
 rage:{match:['aura_themed.01.orbit.loop.metal','token_border.circle.spinning'],color:'red',hex:'#ed978c',note:'A red orbit suggests a continuing battle state.'},
}
// Name first, then full description. Resistances/immunities do not falsely turn
// a cold-resistant fire shield into an icy aura. Nonvisual bonuses are symbolic.
export function classify(item){
 if(STATE_SEMANTIC_REVIEWS[item.name])return STATE_SEMANTIC_REVIEWS[item.name];
 const name=item.name.toLowerCase(),desc=plain(item.system.description?.value).toLowerCase();
 const rules=item.system.rules??[];
 if(/shield immunity|rage temporary hit points immunity|treat wounds immunity|battle medicine immunity|guidance immunity/.test(name))return {theme:'cooldown',evidence:'Reviewed native description: temporary reuse restriction, not the original buff or injury',quality:'curated'};
 if(/fire shield/.test(name))return {theme:'fire-ward',evidence:'Native description: a fire shield grants protection and supports Shield Block',quality:'curated'};
 if(/glass shield/.test(name))return {theme:'glass-ward',evidence:'Native spell describes a clear glass barrier',quality:'themed'};
 if(/prismatic shield/.test(name))return {theme:'prismatic-ward',evidence:'Native spell describes rotating multicolored protective shards',quality:'themed'};
 if(/droning wings/.test(name))return {theme:'sonic-ward',evidence:'Native effect description and Immunity rule: sonic immunity, not flight',quality:'curated'};
 if(/\bantidote\b|\bantiplague\b|elixir of life|poison resistance|disease resistance/.test(name))return {theme:'antidote',evidence:'Native ongoing effect: protective save bonus or resistance, rather than the immediate consumable use',quality:'curated'};
 if(/\bflight\b|\bwings\b/.test(name))return {theme:'flight',evidence:'Native name and complete description: flight-associated sustained cue',quality:'themed'};
 const patterns=[['fire',/fire|flame|burn|blaz|ember/],['cold',/frost|\bice\b|cold|snow|winter/],['lightning',/lightning|electric|thunderbolt/],['acid',/acid|corros|vitriol/],['poison',/poison|venom|toxic|sicken|pollution/],['blood',/bleed|blood|wound/],['web',/web|entangl/],['chains',/restrain|grabb|immobil|binding|chains/],['invisible',/invisib|undetected|hidden|unnoticed/],['fog',/mist|fog|conceal|blur|smoke/],['illusion',/mirror image|illus|disguise/],['rage',/rage|fury|berserk|feroci/],['curse',/curse|hex|bane|spiteful/],['fear',/fear|fright|terror|horror/],['stun',/stun|daze/],['silence',/silence|deafen|mute/],['music',/anthem|composition|inspire|song|\bsing(?:ing)?\b|dirge|hymn|courage/],['shield',/shield|armor|armour|protect|ward|defens/],['light',/bless|heroism|\blight\b|radiance|halo|sun|holy/],['heal',/heal|regener|recover|restor|vitality/],['flight',/flight|\bfly\b|\bwings\b|levitat/],['speed',/haste|quick|accelerat|fleet|speed/],['slow',/slow|fatigue|encumber/],['stone',/stone|petrif|rock|metal|mineral|titan.*stature/],['nature',/plant|wood|bark|leaf|leaves|vine|animal|beast|wild|nature/],['water',/water|aquatic|swim|sea\b|ocean/],['sonic',/sonic|sound|resonan/],['void',/void|negative|shadow|darkness/],['death',/death|dying|doom|undead|corpse/],['mark',/hunt|mark|prey|target lock/],['mind',/\bmental\b|psychic|\bmind\b|telepath|stupef|confus|charm|overtake soul/]];
 for(const [theme,re] of patterns)if(re.test(name))return {theme,evidence:desc?'Name and complete native description':'Native name and rules; source description absent',quality:desc?'themed':'symbolic'};
 for(const [theme,re] of patterns)if(re.test(desc.replace(/(?:resistan\w*|immun\w*|weakness)[^.]+\./g,'')))return {theme,evidence:'Complete native description',quality:'symbolic'};
 const positive=rules.some(r=>r.key==='FlatModifier'&&typeof r.value==='number'&&r.value>0);
 return {theme:positive?'boon':'neutral',evidence:'Native statistical effect; no literal visual depiction',quality:'symbolic'};
}
export function selectStateMedia(db,theme,seed,color){
 const p={...profiles[theme],...(color?{color}:{})};const chosen={};
 for(const [edition,rows] of Object.entries(db)){
  let candidates=[];
  for(const prefix of p.match){
   candidates=rows.filter(r=>r.key.startsWith(`jb2a.${prefix}`)&&assetGeometry(r)==='radial'&&!/intro|outro|complete|outburst|pulse/.test(r.key)&&!r.key.startsWith('jb2a.icon.'));
   if(candidates.length)break;
  }
  if(!candidates.length)throw Error(`No sustained localized ${theme} asset in ${edition}`);
  const colored=candidates.filter(r=>r.key.includes(`.${p.color}`));if(colored.length)candidates=colored;
  candidates.sort((a,b)=>a.key.localeCompare(b.key));chosen[edition]=candidates[parseInt(hash(seed).slice(0,8),16)%candidates.length];
 }
 return {assets:[...new Set([chosen.patreon.key,chosen.free.key])],editions:Object.fromEntries(Object.entries(chosen).map(([e,r])=>[e,{key:r.key,files:variantFiles(r),colorSubstitution:!r.key.includes(`.${p.color}`)}]))};
}
