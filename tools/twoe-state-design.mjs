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
 fog:{match:['ambient_fog.001.loop.small','smoke.plumes_loop','fumes.04.loop','markers.smoke'],color:'grey',hex:'#b6bfd0',note:'Soft haze denotes concealment; native visibility remains authoritative.'},
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
 penalty:{match:['condition.curse','token_border.circle.static'],color:'dark_red',hex:'#e07a84',note:'A dim red marker identifies a penalty or hindrance, distinct from beneficial effects.'},
 temphp:{match:['markers.heart','condition.boon'],color:'green',hex:'#8be6c4',note:'A heart marker identifies temporary Hit Points.'},
 senses:{match:['markers.light_orb','markers.simple'],color:'yellow',hex:'#f3e7a5',note:'A small light marks an enhanced sense such as darkvision or scent.'},
 defense:{match:['markers.shield.','shield.01.loop'],color:'green',hex:'#9fd8a8',note:'A small shield sigil marks a bonus to Armor Class or defenses.'},
 'ice-ward':{match:['shield_themed.above.ice','shield.01.loop'],color:'blue',hex:'#8cdcff',note:'An icy shield marks protection against cold.'},
 'choice-ward':{match:['shield.01.loop'],color:'white',hex:'#e6ecf5',note:'A neutral ward marks resistance to an energy chosen when the effect is applied; the chosen type sets its color when known.'},
 elemental:{match:['condition.boon.02'],color:'refraction',hex:'#e0d4f5',note:'A shifting multicolored shimmer marks an element or energy chosen when the effect is applied; it never assumes fire.'},
 air:{match:['particles.swirl'],color:'white',hex:'#e3eef6',note:'Swirling motes suggest air or graceful wind-borne movement.'},
 beast:{match:['claws.200px'],color:'red',hex:'#e7a07e',note:'A faint recurring claw mark represents an animal fighting style or form.'},
 bite:{match:['bite.200px'],color:'grey',hex:'#c9ced6',note:'A faint recurring bite marks an animal jaw-strike fighting style.'},
 transform:{match:['magic_signs.circle.02.transmutation.loop'],color:'yellow',hex:'#f0d98c',note:'A transmutation circle marks a sustained change of form; the native token image is not replaced.'},
 fiend:{match:['fumes.04.loop'],color:'black',hex:'#8c7487',note:'Dark brimstone fumes mark a fiendish form.'},
 mindward:{match:['markers.runes02','markers.runes'],color:'yellow',hex:'#f1dc9a',note:'Golden protective runes mark a ward against mental control or hostile magic, distinct from curse runes.'},
}
// Chosen damage types/elements and the sustained look each implies; `ward` is
// the look a resistance to that type takes (shield_themed where JB2A has one).
export const ELEMENT_LOOKS={
 acid:{theme:'acid',color:'green',hex:'#a6df71',ward:'shield'},cold:{theme:'cold',color:'blue',hex:'#8cdcff',ward:'ice-ward'},electricity:{theme:'lightning',color:'yellow',hex:'#f7df8d',ward:'shield'},fire:{theme:'fire',color:'orange',hex:'#ffad64',ward:'fire-ward'},sonic:{theme:'sonic',color:'blue',hex:'#c4adf0',ward:'shield'},poison:{theme:'poison',color:'green',hex:'#8cd894',ward:'shield'},mental:{theme:'mind',color:'purple',hex:'#bb8fff',ward:'shield'},void:{theme:'void',color:'purple',hex:'#ab91df',ward:'shield'},vitality:{theme:'light',color:'yellow',hex:'#f3e3a0',ward:'shield'},force:{theme:'shield',color:'purple',hex:'#c3a8f0',ward:'shield'},spirit:{theme:'void',color:'white',hex:'#dcd6ee',ward:'shield'},
 air:{theme:'air',color:'white',hex:'#e3eef6',ward:'shield'},earth:{theme:'stone',color:'grey',hex:'#c8a27a',ward:'shield'},metal:{theme:'stone',color:'grey',hex:'#c1c6cc',ward:'shield'},water:{theme:'water',color:'blue',hex:'#87d6ee',ward:'shield'},wood:{theme:'nature',color:'green',hex:'#9de6b0',ward:'shield'},
 bludgeoning:{theme:'neutral',color:'white',hex:'#d9dde6',ward:'shield'},piercing:{theme:'neutral',color:'white',hex:'#d9dde6',ward:'shield'},slashing:{theme:'neutral',color:'white',hex:'#d9dde6',ward:'shield'},
};
const shieldColors=['blue','green','purple','red','white','yellow'];
export const wardLook=type=>{const l=ELEMENT_LOOKS[type];if(!l)return null;return l.ward==='shield'?{theme:'shield',color:shieldColors.includes(l.color)?l.color:'white',hex:l.hex,wardColor:l.color}:{theme:l.ward,color:l.color,hex:l.hex};};
const elementLook=type=>{const l=ELEMENT_LOOKS[type];return l&&{theme:l.theme,color:l.color,hex:l.hex};};
// PF2e's default ChoiceSet flag is the item slug in dromedary case.
const camel=v=>String(v).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map((w,i)=>i?w[0].toUpperCase()+w.slice(1):w).join('');
const typesOf=r=>[].concat(r.type??[]).flatMap(t=>String(t).split(','));
const choiceRef=t=>{const m=/^\{item\|(?:flags\.system\.rulesSelections\.(\w+)|origin\.flags\.system\.([\w.]+))\}$/.exec(t);return m?(m[1]?{flag:m[1]}:{origin:m[2]}):null;};
// Resistances take the damage type's ward; effects whose element is chosen on
// application get per-choice variants and a neutral look until the choice is known.
export function elementDesign(item,theme){
 const rules=item.system.rules??[],choiceSets=rules.filter(r=>r.key==='ChoiceSet'&&Array.isArray(r.choices));
 const values=cs=>cs.choices.map(c=>c.value).filter(v=>typeof v==='string'&&ELEMENT_LOOKS[v]);
 const wardTypes=[...new Set(rules.filter(r=>['Resistance','Immunity'].includes(r.key)).flatMap(typesOf))];
 const refs=wardTypes.map(choiceRef).filter(Boolean),known=wardTypes.filter(t=>ELEMENT_LOOKS[t]);
 // A resistance that only applies for one chosen element (Elemental Gift: fire
 // resistance when Fire is picked) must not make the whole effect a fire ward.
 const wardRules=rules.filter(r=>['Resistance','Immunity'].includes(r.key));
 // A ward rule is branch-conditional when it only exists for some options of one of this item's
 // own choices (Elemental Gift: fire only; Harrow-Chosen: partial match only). Potion tiers that
 // each grant the same resistance are not conditional.
 const partial=choiceSets.filter(c=>c.rollOption&&new Set(wardRules.flatMap(r=>(r.predicate??[]).filter(p=>typeof p==='string'&&p.startsWith(c.rollOption+':')))).size<c.choices.length).map(c=>c.rollOption);
 const conditional=r=>Array.isArray(r.predicate)&&r.predicate.some(p=>typeof p==='string'&&partial.some(o=>p.startsWith(o+':')));
 // Only an unconditional element choice defines the effect (Harrow-Chosen's is one branch of several).
 const elementChoice=choiceSets.find(c=>values(c).length>=3&&!c.predicate?.length);
 if(elementChoice&&wardRules.length&&wardRules.every(conditional))
  return {base:{theme:'elemental'},choice:{flag:elementChoice.flag??camel(item.system.slug??item.name)},variants:Object.fromEntries(values(elementChoice).map(t=>[t,elementLook(t)]))};
 // Resistance granted only in one conditional branch (Harrow-Chosen) doesn't make the effect a ward.
 if(['shield','boon','neutral','defense'].includes(theme)&&wardRules.some(r=>!conditional(r))&&(refs.length||known.length||wardTypes.includes('all-damage'))){
  if(refs.length>1||known.length>=3)return {base:{theme:'prismatic-ward'}};
  if(refs.length===1){
   const ref=refs[0],cs=ref.flag&&choiceSets.find(c=>c.flag===ref.flag),types=cs?values(cs):Object.keys(ELEMENT_LOOKS);
   return {base:{theme:'choice-ward'},choice:ref,variants:Object.fromEntries(types.map(t=>[t,wardLook(t)]))};
  }
  if(known.length===1)return {base:wardLook(known[0])};
  if(!known.length)return {base:{theme:'shield',color:'white',hex:'#e6ecf5'}};
  return null;
 }
 if(!['fire','cold','lightning','acid','poison','sonic','neutral','boon','shield','flight','stone','water','speed','rage','elemental'].includes(theme))return null;
 const cs=choiceSets.find(c=>values(c).length>=2&&values(c).length*2>=c.choices.length&&!c.predicate?.length);
 if(!cs)return null;
 return {base:{theme:'elemental'},choice:{flag:cs.flag??camel(item.system.slug??item.name)},variants:Object.fromEntries(values(cs).map(t=>[t,elementLook(t)]))};
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
 // Battle forms: the form, not an incidental stat line, is the identity.
 const battle=rules.find(r=>r.key==='BattleForm');
 if(battle){
  const element=/\((air|earth|fire|metal|water|wood)\)/.exec(name)?.[1];
  if(element)return {theme:ELEMENT_LOOKS[element].theme,color:ELEMENT_LOOKS[element].color,hex:ELEMENT_LOOKS[element].hex,evidence:'Native battle form of the named element',quality:'themed'};
  // Fiend forms keep one family identity even when a variant also flies.
  if(/devil form/.test(name))return {theme:'fire',evidence:'Native devil battle form; matches the base Devil Form brimstone cue',quality:'symbolic'};
  if(/piscodaemon/.test(name))return {theme:'water',evidence:'Native aquatic daemon battle form',quality:'symbolic'};
  if(/demon form|daemon form/.test(name))return {theme:'fiend',evidence:'Native fiend battle form',quality:'symbolic'};
  if(battle.overrides?.speeds?.fly||rules.some(r=>r.key==='BaseSpeed'&&/fly/.test(String(r.selector??''))))return {theme:'flight',evidence:'Native battle form grants a fly Speed',quality:'symbolic'};
  if(!/animal form|plant form|untamed form|nature incarnate|ferrous|angel form/.test(name))return {theme:'transform',evidence:'Native BattleForm rule: a sustained change of form',quality:'symbolic'};
 }
 // Granted restraints read as bindings; sticky or plant snares as entanglement.
 if(rules.some(r=>r.key==='GrantItem'&&/conditionitems\.Item\.(?:grabbed|restrained|immobilized)$/i.test(String(r.uuid)))&&!/fire|flame|cold|ice|frost|acid|electric|lightning|sonic|void|cannon|suit|arrow|fork|hands|ground/.test(name))return {theme:/net|vine|glue|mud|snare|web|hair|root|entangl/.test(name)?'web':'chains',evidence:'Native rule grants a restraining condition',quality:'symbolic'};
 // Rule-shaped categories: valence first so penalties never share a buff's look.
 const mods=rules.filter(r=>r.key==='FlatModifier'&&typeof r.value==='number');
 const penalty=/\bpenalt(?:y|ies)\b/.test(name)||mods.length>0&&mods.every(r=>r.value<0);
 if(penalty)return {theme:/speed/.test(name)||rules.some(r=>/speed/i.test(String(r.selector??'')))?'slow':'penalty',evidence:'Native modifiers are penalties; marker uses hindrance colors',quality:'symbolic'};
 if(rules.some(r=>r.key==='TempHP')&&!/\b(fire|cold|acid|poison|electric|void|vitality)\b/.test(name))return {theme:'temphp',evidence:'Native TempHP rule',quality:'symbolic'};
 if(rules.some(r=>r.key==='BaseSpeed'&&/fly/.test(String(r.selector??'')))&&!/fire|flame/.test(name))return {theme:'flight',evidence:'Native fly Speed rule',quality:'symbolic'};
 if(rules.some(r=>r.key==='Sense')&&!/invisib/.test(name))return {theme:'senses',evidence:'Native Sense rule',quality:'symbolic'};
 // Every pure Armor Class bonus shares one defense sigil instead of splitting between shield and boon art.
 const selectors=r=>[].concat(r.selector??[]);
 if(mods.length&&mods.every(r=>r.value>0)&&mods.every(r=>selectors(r).some(s=>s==='ac'))&&!/fire|flame|cold|ice|frost|acid|electric|lightning|sonic|void|shadow/.test(name))return {theme:'defense',evidence:'Native rule: positive Armor Class modifier',quality:'symbolic'};
 const patterns=[['fire',/fire|flame|burn|blaz|ember/],['cold',/frost|\bice\b|cold|snow|winter/],['lightning',/lightning|electric|thunderbolt/],['acid',/acid|corros|vitriol/],['poison',/poison|venom|toxic|sicken|pollution/],['blood',/bleed|blood|wound/],['web',/web|entangl/],['chains',/restrain|grabb|immobil|binding|\bchains?\b|manacle|shackle|fetter/],['invisible',/invisib|undetected|hidden|unnoticed/],['fog',/mist|fog|conceal|blur|smoke/],['illusion',/mirror image|illus|disguise/],['rage',/rage|fury|berserk|feroci/],['curse',/curse|hex|bane|spiteful/],['fear',/fear|fright|terror|horror/],['stun',/stun|daze/],['silence',/silence|deafen|mute/],['music',/anthem|composition|inspire|song|\bsing(?:ing)?\b|dirge|hymn|courage/],['shield',/shield|armor|armour|protect|ward|defens/],['light',/bless|heroism|\blight\b|radiance|halo|sun|holy/],['heal',/heal|regener|recover|restor|vitality/],['flight',/flight|\bfly\b|\bwings\b|levitat/],['speed',/haste|quick|accelerat|fleet|speed/],['slow',/slow|fatigue|encumber/],['stone',/stone|petrif|rock|metal|mineral|titan.*stature/],['nature',/plant|wood|bark|leaf|leaves|vine|animal|beast|wild|nature/],['water',/water|aquatic|swim|sea\b|ocean/],['sonic',/sonic|sound|resonan/],['void',/void|negative|shadow|darkness/],['death',/death|dying|doom|undead|corpse/],['mark',/hunt|mark|prey|target lock/],['mind',/\bmental\b|psychic|\bmind\b|telepath|stupef|confus|charm|overtake soul/]];
 for(const [theme,re] of patterns)if(re.test(name))return {theme,evidence:desc?'Name and complete native description':'Native name and rules; source description absent',quality:desc?'themed':'symbolic'};
 for(const [theme,re] of patterns)if(re.test(desc.replace(/(?:resistan\w*|immun\w*|weakness)[^.]+\./g,'')))return {theme,evidence:'Complete native description',quality:'symbolic'};
 const positive=rules.some(r=>r.key==='FlatModifier'&&typeof r.value==='number'&&r.value>0);
 return {theme:positive?'boon':'neutral',evidence:'Native statistical effect; no literal visual depiction',quality:'symbolic'};
}
export function selectStateMedia(db,theme,seed,color){
 const p={...profiles[theme],...(color?{color}:{})};const chosen={};
 const exact=r=>r.key.includes(`.${p.color}`),hue=r=>exact(r)||r.key.includes(`.dark_${p.color}`);
 for(const [edition,rows] of Object.entries(db)){
  let candidates=[];
  for(const prefix of p.match){
   candidates=rows.filter(r=>r.key.startsWith(`jb2a.${prefix}`)&&assetGeometry(r)==='radial'&&!/intro|outro|complete|outburst|pulse/.test(r.key)&&!r.key.startsWith('jb2a.icon.'));
   if(candidates.length)break;
  }
  if(!candidates.length)throw Error(`No sustained localized ${theme} asset in ${edition}`);
  // A missing color falls back to white art (tinted at runtime), never an arbitrary hue.
  const colored=candidates.filter(exact).length?candidates.filter(exact):candidates.filter(hue),white=candidates.filter(r=>r.key.includes('.white'));candidates=colored.length?colored:white.length?white:candidates;
  // Numbered variants are picked per category, not per entry, so one mechanic keeps one look.
  candidates.sort((a,b)=>a.key.localeCompare(b.key));chosen[edition]=candidates[parseInt(hash(`${theme}:${p.color}`).slice(0,8),16)%candidates.length];
 }
 return {assets:[...new Set([chosen.patreon.key,chosen.free.key])],editions:Object.fromEntries(Object.entries(chosen).map(([e,r])=>[e,{key:r.key,files:variantFiles(r),colorSubstitution:!hue(r)}]))};
}
