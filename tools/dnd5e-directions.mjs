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
 'divine smite':{theme:'light',delivery:'contact',hit:'divine_smite',sound:'holy'},
 'rage':{theme:'blood',delivery:'source',sound:null},
 'wild shape':{theme:'transform',delivery:'source',sound:'transform'},
 'oil':{theme:'water',delivery:'missile',sound:'water',note:'Unlit oil coating. Later fire damage does not make every thrown flask ignite.'},
 'acid':{theme:'acid',delivery:'missile',sound:'acidSplash'},
 'holy water':{theme:'light',delivery:'missile',sound:'holy'},
 "alchemist's fire":{theme:'fire',delivery:'missile',sound:'fireIgnition'},
 'daylight':{theme:'light',area:'markers.light,divine_smite.caster',cast:'divine_smite.caster',hit:'markers.light',sound:'light',note:'Bright sunlight spreads from the point; it dispels magical darkness rather than creating it.'},
 'continual flame':{theme:'fire',area:'flames',hit:'flames',cast:'cast_generic.fire',sound:'fireIgnition',note:'A heatless flame settles on the object; no detonation.'},
 'faerie fire':{theme:'light',area:'fairies,swirling_sparkles',hit:'fairies,swirling_sparkles',cast:'fairies',sound:'light',note:'Colored light outlines creatures; the spell involves no actual fire.'},
 'lamp':{theme:'fire',area:'flames',hit:'flames',cast:'cast_generic.fire',sound:'fireIgnition',note:'Lighting a lamp: a small steady flame, not an explosion.'},
 'hooded lantern':{theme:'fire',area:'flames',hit:'flames',cast:'cast_generic.fire',sound:'fireIgnition',note:'Lighting a lantern: a small steady flame, not an explosion.'},
 'bullseye lantern':{theme:'light',area:'breath_weapons02.burst.cone.holy,flames',hit:'flames',cast:'cast_generic.fire',sound:'fireIgnition',note:'Lighting a lantern: a small steady flame, not an explosion.'},
 'lantern, hooded':{theme:'fire',area:'flames',hit:'flames',cast:'cast_generic.fire',sound:'fireIgnition',note:'Lighting a lantern: a small steady flame, not an explosion.'},
 'lantern, bullseye':{theme:'light',area:'breath_weapons02.burst.cone.holy,flames',hit:'flames',cast:'cast_generic.fire',sound:'fireIgnition',note:'Lighting a lantern: a small steady flame, not an explosion.'},
 'tinderbox':{theme:'fire',area:'flames',hit:'flames',cast:'cast_generic.fire',sound:'fireIgnition',note:'Striking a small flame, not an explosion.'},
 'black tentacles':{theme:'void',area:'black_tentacles',hit:'black_tentacles',aura:'black_tentacles',sound:'void'},
 'torch':{theme:'fire',area:'flames',hit:'flames',cast:'cast_generic.fire',sound:'fireIgnition',note:'Lighting a torch: a small steady flame, not an explosion.'},
 'caltrops':{theme:'weapon',area:'caltrops.01',hit:'caltrops.01',sound:null,note:'Caltrops scatter across the native square.'},
 'ball bearings':{theme:'weapon',area:'ball_bearing',hit:'ball_bearing',sound:null,note:'Ball bearings spill across the native square.'},
 'flurry of blows':{theme:'weapon',delivery:'contact',hit:'flurry_of_blows,unarmed_strike',sound:'unarmed',note:'Native individual attacks supply contacts; using the feature does not invent hit results.'},
 'sneak attack':{theme:'weapon',delivery:'contact',hit:'sneak_attack,melee_attack.01.magic_sword',sound:'dagger',note:'An extra damage contact on the existing victim, never an invented second weapon strike.'},
 'boulder toss':{theme:'earth',delivery:'areaMissile',bolt:'boulder.toss',hit:'impact.boulder',area:'impact.boulder,eruption',sound:'earth'},
 'net':{theme:'web',delivery:'missile',sound:'chainBinding'},
 'stinking cloud':{theme:'poison',area:'fog_cloud.02.green,fog_cloud',hit:'fumes.toxic,fumes',aura:'fog_cloud.02.green,fumes',tints:{area:'#f2e34d',aura:'#f2e34d'},sound:'poison'},
 'gust of wind':{theme:'wind',area:'gust_of_wind',sound:'wind'},
};
// Word-bounded so incidental substrings never set a theme ("divine" is not a
// vine, "toward" not a ward, "boil" not oil, "window" not wind).
export const nameThemes=[['healing',/\bheal|\bcure|restor|reviv|resurrect|regener|lay on hands|second wind/],['ward',/shield|\barmou?r\b|protection|resistance|immun|sanctuary|death ward/],['teleport',/teleport|misty step|dimension door|\bblink/],['illusion',/illusion|disguise|mirror image|invisib|\bblur\b/],['divination',/\bdetect|\bscry|\blocate\b|clairvoy|identify|commune|x-ray|true seeing/],['plant',/\bthorns?\b|\bvines?\b|\bplants?\b|\bbark(?:skin)?\b|entangl|\bnature\b|\bgrass\b/],['fire',/\bfire|flame|\bburn|scorch|meteor/],['cold',/\bice\b|\bcold\b|frost|\bsnow|sleet|\bhail|freez|frigid/],['electricity',/lightning|electric|witch bolt/],['sonic',/thunder|\bsound|shatter/],['acid',/\bacid|corros/],['poison',/poison|venom|toxic/],['water',/\bwater|\bocean|tidal|grease|\boil\b|\brain\b/],['earth',/\bearth|(?<!ioun )\bstone(?:skin)?\b(?! of)|\brocks?\b|\bmeld\b|\bclay\b/],['wind',/\bwinds?\b|\bgust|whirlwind/],['fear',/\bfear|fright|terror|horror/],['mind',/psychic|\bmind\b|\bcharm|\bsleep|confus/],['shadow',/(?<!dispels? (?:magical )?)darkness|shadow/],['light',/\bsun(?:light|beam|burst)?\b|daylight|radiant|\bholy\b|divine|\bbless|\bsmite\b|\bglow|\blight\b/],['void',/necrotic|\bdeath|wither|blight|vampir|annihilat/],['summon',/summon|conjure|animate dead/],['transform',/polymorph|\bshape|\benlarge|alter self/],['flight',/\bfly\b|levitat|feather fall|wind walk/],['time',/\bhaste\b|\bslow\b/]];
// Spell schools whose fiction is more reliable than incidental description words.
const schoolThemes={abj:'ward',div:'divination',enc:'mind',ill:'illusion',nec:'void',con:'summon',trs:'transform',evo:'force'};
const reliableSchools=new Set(['abj','div','enc','ill','nec']);
// Activity names that name an element/effect ("Damage: Sunlight", "Round 4:
// Hailstones", "Fireball (70-79)") outrank the parent item's name.
const activityThemes=new Set(['healing','teleport','illusion','divination','plant','fire','cold','electricity','sonic','acid','poison','water','earth','wind','fear','mind','shadow','light','void','summon','flight','time']);
const descTheme=text=>{let best,top=0;for(const [t,re] of nameThemes){if(t==='healing')continue;const n=text.match(new RegExp(re.source,'g'))?.length??0;if(n>top){best=t;top=n;}}return best;};
const PRISM={red:'#ff4040',orange:'#ff9f38',yellow:'#ffe166',green:'#62dc85',blue:'#73b9ff',indigo:'#4b3f91',violet:'#b87afa'};
// Non-magical martial action or mundane object: no casting circle, no sound.
const MUNDANE={theme:'weapon',noCast:true,sound:null,hit:'impact.005.white,melee_generic.slashing',aura:'wind_lines.01.01',area:'impact.009.white,impact.005.white'};
const breath=tint=>({area:'breath_weapons02.burst.cone.arcana',slotThemes:{area:'arcane'},tints:{area:tint}});
// Audit corrections (docs/animation-fix-plan-2026-10-07.md Part B). Each rule:
// [item name, fields, activity name?, edition?]. Later rules win.
const overrides=[
 // D&D audit batch 1 (tools/audit-dnd5e-catalog.mjs): use the spell's own JB2A
 // art, keep cantrip impacts small and fix theme misfires.
 [/^eldritch blast$/,{delivery:'missile',bolt:'eldritch_blast'}],
 [/^bless$/,{theme:'light',hit:'bless',aura:'bless'}],
 [/^fog cloud$/,{area:'fog_cloud',aura:'fog_cloud',hit:'fog_cloud'}],
 [/^gust of wind$/,{area:'gust_of_wind',aura:'gust_of_wind'}],
 [/^call lightning$/,{hit:'call_lightning',area:'call_lightning'}],
 [/^(?:fire bolt|produce flame|sorcerous burst)$/,{hit:'impact.fire,explosion.08'}],
 [/^hex$/,{theme:'curse',hit:'condition.curse',aura:'condition.curse',cast:'cast_generic'}],
 [/^haste$/,{aura:'wind_lines.01',hit:'wind_lines.01'}],
 [/^(?:thunderwave|shatter)$/,{cast:'cast_generic'}],
 [/\bof wounding$/,{theme:'blood'}],
 [/^hellish rebuke$/,{hit:'flames.green,flames.04.complete.green',aura:'flames.green,flames.04.loop.green',tints:{hit:'#62dc85',aura:'#62dc85'}},null,'2024'],
 [/^bestow curse$/,{theme:'curse',hit:'condition.curse',aura:'condition.curse'}],
 [/^mending$/,{theme:'transform',hit:'glint,swirling_sparkles',aura:'glint,swirling_sparkles'}],
 [/^find familiar$/,{theme:'summon'}],[/^pact of the chain$/,{theme:'summon'},/familiar/],
 [/^guardian of faith$/,{theme:'light',cast:'magic_signs.circle.01.conjuration',aura:'dancing_light'},/summon/],
 [/^insect plague$/,{theme:'poison',area:'whirlwind.green,fog_cloud.02.green',hit:'fumes.04.complete.green,fumes',aura:'whirlwind.green,fumes'}],
 [/^staff of swarming insects$/,{theme:'poison',cast:'fumes',area:'whirlwind.green,fog_cloud.02.green',aura:'whirlwind.green,fumes'},/insect|^cast$/],
 [/^chromatic orb$/,{bolt:'eldritch_blast.rainbow,magic_missile'}],
 [/^fire shield$/,{theme:'fire',aura:'shield_themed.above.fire,flames.04.loop',hit:'flames.04.complete,fireball.explosion'}],
 [/^passwall$/,{area:'smoke.puff.centered.grey,smoke.puff',areaTiles:true,aura:'smoke.puff.centered.grey,smoke.puff'}],
 [/^message$/,{theme:'sonic',cast:'cast_generic.sound',aura:'soundwave.02',hit:'soundwave.02'}],
 [/^giant insect$/,{theme:'plant'},null,'2014'],
 [/^contagion$/,{theme:'disease'}],
 [/^glyph of warding$/,{theme:'ward',cast:'magic_signs.circle.01.abjuration',aura:'magic_signs.circle.02.abjuration.complete'},/spell glyph|^cast$|^utility$/],
 [/^clone$/,{theme:'transform'}],
 [/^ink cloud$/,{theme:'shadow',cast:'smoke.puff.centered.dark_black',area:'fumes.04.complete.black,smoke.puff.centered.dark_black',aura:'fumes.04.complete.black,smoke.puff.centered.dark_black'}],
 [/^death glare$/,{hit:'toll_the_dead.purple.bell,toll_the_dead',aura:'toll_the_dead.purple.bell,toll_the_dead'}],
 [/^wall of ice$/,{area:'ice_spikes.wall.burst',areaTiles:true}],
 [/^wall of stone$/,{area:'falling_rocks.top.1x1.grey,falling_rocks.top.1x1',areaTiles:true}],
 [/^web$/,{delivery:'contact',noCast:true,hit:'web.01,web.02,web.complete'},/^attack$/],
 [/^net$/,{delivery:'contact',hit:'web.01,web.02',noCast:true},null,'2024'],
 [/^symbol$/,{theme:'ward',area:'magic_signs.circle.02.abjuration.complete',aura:'magic_signs.circle.02.abjuration.complete'},/inscribe/],
 [/^symbol$/,{theme:'void',area:'toll_the_dead.purple.skull_smoke,toll_the_dead'},/death/],
 [/^symbol$/,{theme:'mind',area:'sleep.target.dark_orangepurple,sleep.target'},/discord/],
 [/^symbol$/,{theme:'fear',area:'smoke.plumes.01.purple,smoke.plumes'},/fear/],
 [/^symbol$/,{theme:'shadow',area:'smoke.plumes.01.grey,smoke.plumes'},/hopeless/],
 [/^symbol$/,{theme:'mind',area:'dizzy_stars.400px.green,dizzy_stars'},/insanity/],
 [/^symbol$/,{theme:'void',area:'toll_the_dead.purple.shockwave,toll_the_dead'},/pain/],
 [/^symbol$/,{theme:'mind',area:'sleep.cloud.02.pink,sleep.cloud'},/sleep/],
 [/^symbol$/,{theme:'mind',area:'dizzy_stars.400px.blueorange,dizzy_stars'},/stunning/],
 [/^shillelagh$/,{hit:'impact.004.green,impact'},/attack/],
 [/^wish$/,{theme:'summon'},/replicate|^utility$/],[/^wish$/,{theme:'light',aura:'glint.yellow,twinkling_stars'},/wealth/],[/^wish$/,{theme:'healing'},/restore health/],[/^wish$/,{theme:'time'},/rewrite/],[/^wish$/,{theme:'void'},/stress effects/],
 [/^(?:action surge|riposte|gloves of missile snaring)$/,MUNDANE],[/^quick grapple$/,MUNDANE,/save/],
 [/^reaping scythe$/,{...MUNDANE,hit:'melee_generic.slashing',aura:'melee_generic.slashing'}],
 [/^legendary resistance$/,{noCast:true}],
 [/^deflect energy$/,{theme:'ward'},/reduce/],[/^deflect energy$/,{theme:'force'},/redirect/],
 [/^troll spawn$/,{theme:'plant'}],
 [/^overchannel$/,{theme:'force',hit:'particle_burst.01.circle.bluepurple',aura:'particle_burst.01.circle.bluepurple'}],
 [/^(?:necrotic strike|lifedrinker|deathless strike)$/,{noCast:true,hit:'impact.004.dark_purple,impact.001.dark_purple,impact.004',aura:'impact.004.dark_purple,impact.001.dark_purple,impact.004'},/^damage$|use|strike/],
 [/^deathless agility$/,{...MUNDANE,theme:'void',aura:'smoke.puff.centered.dark_purple,smoke.puff.centered'}],
 [/^pact of the blade$/,{theme:'summon',cast:'magic_signs.circle.01.conjuration',aura:'glint',hit:'glint'},/forge|^utility$/],[/^pact of the blade$/,{theme:'weapon',aura:'glint',hit:'impact.005.white'},/attack/],
 [/^repelling blast$/,{theme:'force',aura:'particle_burst.01.circle.bluepurple',hit:'particle_burst.01.circle.bluepurple'}],
 [/^sonic boom$/,{aura:'shatter',hit:'shatter'}],[/^shriek$/,{theme:'sonic'}],
 [/^paralyzing breath$/,breath('#d4e06a')],[/^weakening breath$/,breath('#a8935a')],[/^slowing breath$/,breath('#a9c2d6')],[/^repulsion breath$/,breath('#e6eef5')],[/^petrifying breath$/,breath('#9e9e8c')],
 [/^petrifying gaze$/,{...breath('#9e9e8c'),theme:'earth'}],
 [/^shimmering shield$/,{theme:'ward',aura:'shield'}],
 [/^war cry$/,{theme:'sonic',aura:'soundwave.01.orangeyellow,soundwave'}],
 [/^relentless endurance$/,{theme:'blood',noCast:true,aura:'impact.004.dark_red,impact.001.dark_red'}],
 [/^stone's endurance$/,{theme:'earth',noCast:true,aura:'shield_themed.above.molten_earth,shield'}],
 [/^weight of years$/,{theme:'time',tints:{aura:'#b39b7a',hit:'#b39b7a'}}],
 [/^tireless$/,{theme:'plant'}],
 [/^rage$/,{theme:'blood',noCast:true,aura:'aura_themed.01.outward.complete.metal.01.red,aura_themed.01.outward'}],
 [/^signature spells$/,{theme:'arcane'}],
 [/^tree stride$/,{theme:'teleport'}],
 [/^staff of the magi$/,{theme:'arcane'}],[/^staff of the magi$/,{theme:'ward'},/absor/],
 [/^blade barrier$/,{theme:'metal',area:'cloud_of_daggers',aura:'cloud_of_daggers',hit:'cloud_of_daggers'}],
 [/^animal messenger$|^carrying message$/,{theme:'flight'}],
 [/^druidcraft$/,{theme:'plant'}],
 [/^hallow$/,{theme:'ward'}],
 [/^mirror of life trapping$/,{theme:'illusion'}],
 [/^power word kill$/,{theme:'void',hit:'toll_the_dead.purple.skull_smoke,toll_the_dead',aura:'toll_the_dead.purple.skull_smoke,toll_the_dead'}],
 [/^heroism$/,{theme:'ward'}],
 [/^forcecage$/,{theme:'force'}],
 [/^rod of alertness$/,{theme:'ward'},/plant rod|protective aura/],
 // items
 [/^staff of the python$/,{theme:'transform',cast:'smoke.puff.centered.green',aura:'smoke.puff.centered.green'},/transform/],
 [/^collapsing roof$/,{theme:'earth',noCast:true,area:'falling_rocks.top.2x1.grey,falling_rocks',aura:'falling_rocks.top.2x1.grey,falling_rocks',hit:'falling_rocks.top.1x1.grey,falling_rocks'}],
 [/^falling net$/,{theme:'web',noCast:true,area:'web.complete,web.01',aura:'web.01,web.02',hit:'web.01,web.02'},/trigger/],
 [/^nine lives stealer/,{noCast:true,hit:'toll_the_dead.purple.skull_smoke,icon.skull',aura:'toll_the_dead.purple.skull_smoke,icon.skull'},/death|life steal/],
 [/^luck blade/,{hit:'twinkling_stars,glint.yellow',aura:'twinkling_stars,glint.yellow'}],
 [/^vorpal/,{hit:'icon.skull.dark_red,icon.skull',aura:'icon.skull.dark_red,icon.skull'}],
 [/^hammer of thunderbolts$/,{theme:'electricity',cast:'static_electricity',aura:'lightning_ball,static_electricity'},/hammer of thunderbolts|giant'?s bane/],
 [/^thunderous greatclub$/,breath('#b9cff5'),/clap of thunder/],
 [/^staff of the woodlands$/,{theme:'plant'}],[/^staff of the woodlands$/,{aura:'plant_growth'},/tree form/],[/^staff of the woodlands$/,{aura:'aura_themed.01.outward.loop.wood,aura_themed.01.outward.complete.wood'},/barkskin/],[/^staff of the woodlands$/,{theme:'shadow',aura:'smoke.puff.centered.dark_green,smoke.puff'},/pass without trace/],
 [/^staff of the magi$/,{theme:'arcane'},/^cast$/],
 [/^gem of brightness$/,{theme:'light'}],
 [/^figurine of wondrous power|^ivory goats$/,{theme:'summon'}],[/^figurine of wondrous power \((?:bronze griffon|serpentine owl|silver raven|ebony fly)\)/,{theme:'flight'}],[/^figurine of wondrous power \(ivory goat of terror\)|^ivory goats$/,{theme:'fear'},/terror|^save$/],
 [/^skull$/,{hit:'icon.skull.dark_red,toll_the_dead.purple.skull_smoke,icon.skull,toll_the_dead',aura:'icon.skull.dark_red,toll_the_dead.purple.skull_smoke,icon.skull,toll_the_dead'}],
 [/^rope of climbing$/,{theme:'arcane',noCast:true,sound:null,aura:'markers.circle_of_stars',hit:'markers.circle_of_stars'}],
 [/^necklace of prayer beads$/,{theme:'light'},/^cast$|bless|smit/],[/^necklace of prayer beads$/,{theme:'summon',cast:'magic_signs.circle.01.conjuration'},/summon/],[/^necklace of prayer beads$/,{theme:'flight',aura:'swirling_feathers.outburst'},/wind walk/],
 [/^manual of golems$/,{theme:'earth'},/clay|stone/],[/^manual of golems$/,{theme:'metal',aura:'aura_themed.01.inward.complete.metal,aura_themed.01.inward'},/iron/],[/^manual of golems$/,{theme:'blood',aura:'energy_strands.complete.dark_red.01,energy_strands'},/flesh/],
 [/^wand of wonder$/,{theme:'plant',area:'butterflies.complete',aura:'butterflies.complete'},/butterfl/],[/^wand of wonder$/,{theme:'light',area:'moonbeam.01.complete.rainbow,particle_burst'},/colorful light/],[/^wand of wonder$/,{theme:'light'},/stream of gems/],
 [/cloud giant strength|giant strength \(cloud\)/,{theme:'wind',aura:'whirlwind'}],[/hill giant strength|giant strength \(hill\)/,{theme:'earth'}],[/storm giant strength|giant strength \(storm\)/,{theme:'electricity'}],
 [/^(?:ring of x-ray vision|robe of eyes)$/,{theme:'divination',hit:'eyes.01',aura:'eyes.01'}],
 [/^talisman of pure good$/,{theme:'light',hit:'sacred_flame.target'},/pure rebuke/],[/^talisman of ultimate evil$/,{theme:'void',hit:'toll_the_dead'},/ultimate end/],
 [/^robe of scintillating colors$/,{theme:'light',aura:'energy_field.01.multicolored,markers.bubble.complete.rainbow',area:'moonbeam.01.complete.rainbow,energy_field.01.multicolored'}],
 [/^wand of fear$/,{area:'breath_weapons02.burst.cone.arcana.dark_black',slotThemes:{area:'arcane'}},/cone/],
 [/^instant fortress$/,{theme:'earth',area:'falling_rocks.top.2x1.grey,ground_cracks'},/grow tower|^save$/],
 // Wave 2 (motion/sound audit). A deflection is a parry, not healing or a
 // magic circle: white impact at the monk, shield-block sound, quick sidestep.
 [/^deflect (?:attacks|missiles?|energy)$/,{...MUNDANE,delivery:'source',aura:'impact.005.white,melee_generic.slashing',hit:'impact.005.white,melee_generic.slashing',sound:'shield',motion:'guard-small'}],
 [/^deflect (?:attacks|missiles?|energy)$/,{delivery:'contact'},/redirect|^save$/],
 [/^(?:parry|riposte|gloves of missile snaring|redirect attack)$/,{sound:'shield',motion:'guard-small'}],
 [/^uncanny dodge$/,{motion:'evade-small'}],
 // Motion vocabulary (press/sink/flicker/throw/brace/stagger/cower/slam/drift).
 [/^feather fall$/,{motion:'drift-gentle'}],
 [/^(?:misty step|blink|etherealness)$/,{motion:'flicker'}],
 [/^(?:cause fear|fear|frightful presence|frightening gaze|horrifying visage|dread command|wand of fear)$/,{motion:'cower-targets'}],
 [/^earthquake$/,{motion:'slam-small'},/^cast$/],[/tremor|\bstomp|seismic|world-shaking|shock ?wave/,{motion:'slam-small'}],
 [/^mysterious deck$/,{theme:'arcane'}],[/^dragon wings$/,{theme:'flight'}],
 // "Flame-like radiance": radiant damage, not fire (name word "flame").
 [/^sacred flame$/,{theme:'light',cast:'sacred_flame.source.yellow,sacred_flame.source',hit:'sacred_flame.target.yellow,sacred_flame.target',aura:'sacred_flame.target.yellow,sacred_flame.target',sound:'holy'}],[/^dancing /,{motion:'none'}],
 [/^(?:meld into stone|burrow|earth glide|tunneler)$/,{motion:'sink-small'}],
 [/^open hand technique$/,{motion:'stagger-targets'},/push|topple/],[/^cunning strike$/,{motion:'stagger-targets'},/trip/],
 [/^(?:shove|trip attack|pushing attack|tentacle slam|trample|trampling charge)$/,{motion:'stagger-targets'},/save/],
 [/^shriek$/,{sound:'fear'}],[/^(?:stunning screech)$/,{sound:'fear'}],
 [/^contagion$/,{sound:'void'}],
 [/^(?:insect plague|cloud of insects)$/,{sound:'swarm'}],[/^staff of swarming insects$/,{sound:'swarm'},/insect|^cast$/],
 [/^control weather$/,{theme:'wind',sound:'wind'}],
 [/^magnificent mansion$/,{theme:'summon',sound:'pocketTransition'}],
 [/^message$/,{sound:null}],[/^signal whistle$/,{sound:null}],
 [/^chime of opening$/,{sound:'unlock'}],
 [/^marvelous pigments$/,{theme:'transform',sound:'transform'}],
 [/^rod of lordly might$/,{theme:'mind'},/paralyze/],[/^rod of lordly might$/,{theme:'fear'},/terrify/],
 [/^twinned spell$/,{theme:'arcane'}],[/^tinker$/,{...MUNDANE,theme:'weapon'}],
 [/^cunning strike$/,{...MUNDANE,theme:'weapon'},/trip/],[/^cunning strike$/,{theme:'wind',sound:null},/withdraw/],
 [/^(?:iron spike|piton)$/,{sound:'metal'}],[/^hunting trap$/,{sound:'metalProjectile'}],
 [/^unarmed strike$/,{delivery:'contact',motion:'reach-stagger'},/grapple|shove/],
 [/^net$/,{hit:'web.complete.002.white,web.01,web.02'}],
];
// Delivery-aware performer gesture for a generated (non-reviewed) motion.
// Reviewed motion names keep their meaning but always attach to the right
// token: a reach, throw or stride belongs to the performer, never the target.
const HOSTILE=new Set(['fire','cold','electricity','sonic','acid','poison','void','curse','fear','disease','force','shadow','blood','web']);
const NAMED_GESTURES={'drift-gentle':['drift',2400,.3,'targets',.6,'Gentle feather descent'],'flicker':['flicker',1600,.12,'source',.5,'Phase flicker'],'cower-targets':['cower',1500,.25,'targets',.6,'Cowers in fear'],'slam-small':['slam',1400,.2,'source',.6,'Rise and slam'],'sink-small':['sink',1800,.25,'source',.6,'Sinks into the ground'],'stagger-targets':['stagger',1300,.2,'targets',.6,'Staggered by the blow'],'throw-small':['throw',1400,.12,'source',.6,'Wind-up and throw'],'brace-small':['brace',1500,.12,'source',.6,'Brace and settle'],'reach-small':['lunge',1500,.12,'source',.6,'Reach to touch'],'stride-small':['dodge',1600,.15,'source',.6,'Nimble step'],'evade-small':['dodge',1500,.15,'source',.6,'Deflecting sidestep'],'lift-illustrative':['levitate',2000,.22,null,.6,'Illustrative lift'],'hop-illustrative':['levitate',1600,.18,null,.6,'Illustrative hop'],'wind-step-small':['dodge',1600,.15,'source',.6,'Wind step'],'lash-small':['lunge',1600,.18,'source',.6,'Lash and settle'],'guard-small':['brace',1300,.12,'source',.6,'Guard and settle'],'native-teleport-cue':['flicker',1600,.1,'source',.5,'Teleport flicker'],'transform-cue':['pulse',1800,.1,null,.6,'Casting breath'],'breath-small':['recoil',1300,.06,'source',.5,'Exhale and settle'],'subtle-pulse':['pulse',1500,.05,'targets',.35,'Gentle boon']};
export function deliveryGesture(d,{subject='source',physical=false}={}){
 const a=d.activity??{},type=a.type,g=(motion,duration,distance,who,intensity,label)=>({motion,duration,distance,subject:who??subject,intensity,label});
 if(d.motion==='none'||type==='check'||d.followup)return null;
 // Healing by touch reads as a blessing on the recipient, never a lunge at an ally.
 if(type==='heal'&&(d.motion==='reach-small'||d.delivery==='contact'))return g('pulse',1500,.05,'targets',.35,'Healing touch');
 const named=NAMED_GESTURES[d.motion];if(named)return g(...named);
 // A shove is a reach followed by the victim staggering back.
 if(d.motion==='reach-stagger')return [g('lunge',1400,.12,'source',.6,'Reach to grapple or shove'),{...g('stagger',1300,.2,'targets',.6,'Shoved off balance'),delay:350}];
 // Restoring a resource use is bookkeeping, not a performance.
  if(/restore (?:uses?|slots?)/i.test(a.name??''))return null;
  // A monster's own natural attack still reaches for its victim.
  if(physical)return d.delivery==='contact'&&type==='attack'?g('lunge',1400,.14,'source',.6,'Natural attack lunge'):null;
 // Delegated casts and summons: the resulting spell/creature owns the motion.
 if(['cast','forward','summon'].includes(type))return null;
 if(d.theme==='teleport'||type==='teleport')return g('flicker',1600,.1,subject,.5,'Teleport flicker');
 if(d.theme==='flight'&&['source','recipient'].includes(d.delivery))return g('levitate',2000,.22,subject,.6,'Illustrative lift');
 if(d.theme==='fear'&&type==='save'&&!d.area)return g('cower',1500,.25,'targets',.6,'Cowers in fear');
 if(['missile','ray','fork','rayFan','areaMissile'].includes(d.delivery))return g('recoil',1100,.06,'source',.5,'Release and settle');
 if(d.area||['burst','cone','line'].includes(d.delivery))return g('pulse',1500,.09,'source',.6,'Casting breath');
 if(d.delivery==='contact')return type==='attack'&&a.attack?.type?.value!=='ranged'||a.range?.units==='touch'?g('lunge',1400,.12,'source',.5,'Reach to touch'):g('recoil',1100,.05,'source',.5,'Directed release');
 if(d.delivery==='recipient')return type==='heal'?g('pulse',1500,.05,'targets',.35,'Gentle restoration'):type==='save'||type==='damage'||HOSTILE.has(d.theme)?g('recoil',1100,.05,'source',.5,'Directed release'):g('pulse',1500,.05,'targets',.35,'Gentle boon');
 if(type==='save'||type==='damage')return g('pulse',1500,.09,'source',.6,'Casting breath');
 return HOSTILE.has(d.theme)&&type!=='heal'?g('pulse',1500,.09,'source',.6,'Casting breath'):g('pulse',1500,.05,'source',.35,type==='heal'?'Gentle restoration':'Gentle self boon');
}
export function nativeDirection(row,activity,mode){
 const item=row.source,a=effectiveActivity(item,activity),name=item.name.toLowerCase().replace(/\s*\((?:vial|flask)\)$/, ''),act=(a.name??'').toLowerCase(),desc=row.description.toLowerCase();
 const author=named[name]??(/^ioun stone|enhanced (?:agility|awareness|fortitude|insight|intellect|leadership|mastery|protection|strength)/.test(name)?{theme:'light',cast:'dancing_light',hit:'dancing_light',aura:'dancing_light',sound:'light',note:'A small gem begins orbiting the wearer\'s head.'}:undefined);
 // A delegated result named after a spell ("Fireball (70-79)") uses that spell's art.
 const actKey=act.replace(/\s*\([^)]*\)\s*$/,'').trim(),actAuthor=author?undefined:named[actKey]??named[act.match(/\(([^)]+)\)/)?.[1]??''];
 const base=structuredClone(author??(actAuthor?{theme:actAuthor.theme,...(actAuthor.area||actAuthor.hit?{aura:actAuthor.aura??actAuthor.hit??actAuthor.area,hit:actAuthor.hit??actAuthor.area}:{}),...(actAuthor.area?{area:actAuthor.area}:{}),...(actAuthor.tints?{tints:actAuthor.tints}:{})}:{}));
 // A part listing every damage type ("same type as the weapon/spell") names no
 // element; its first entry (acid) must not theme Brutal Strike or Frenzy.
 const types=[...(a.damage?.parts??[]).flatMap(p=>(p.types?.length??0)>3?[]:p.types??[]),...(a.healing?.types??[])];
 const school=item.type==='spell'?item.system?.school:undefined,tempHp=a.type==='heal'&&types.length>0&&types.every(t=>t==='temphp');
 // "Cast and Fire", "Restore Use", "Light Weapon" are verbs/properties, not effects.
 const actText=act.replace(/\b(?:and|to|cast) fire\b|\brestore (?:uses?|slots?)\b|\bplant rod\b|\blight (?:martial )?weapons?\b/g,'');
 const actTheme=nameThemes.find(([t,re])=>activityThemes.has(t)&&re.test(actText))?.[0],itemTheme=nameThemes.find(([,re])=>re.test(name))?.[0];
 const ELEMENTS=new Set(['fire','cold','electricity','sonic','acid','poison','water','earth','wind']);
 const leadTheme=actTheme&&(ELEMENTS.has(actTheme)||!ELEMENTS.has(itemTheme))?actTheme:itemTheme;
 const theme=base.theme??(a.type==='heal'?tempHp?'ward':'healing':leadTheme??types.map(t=>damageThemes[t]??t).find(t=>!['weapon','','temphp'].includes(t))??(reliableSchools.has(school)?schoolThemes[school]:undefined)??descTheme(desc.replace(/(?:immune|resistan)[^.]+\./g,''))??schoolThemes[school]??(item.type==='weapon'?'weapon':'arcane'));
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
 const fix={};
 for(const [re,set,actRe,edition] of overrides)if(re.test(name)&&(!actRe||actRe.test(act||(a.type??'')))&&(!edition||edition===row.edition))Object.assign(fix,structuredClone(set));
 const {theme:fixTheme,delivery:fixDelivery,...fixMedia}=fix;
 Object.assign(base,fixMedia);if(fixTheme)nativeTheme=fixTheme;if(fixDelivery&&!mode)delivery=fixDelivery;
 // Using a native tool/ability check does not promise a magical manifestation
 // or successful outcome. Keep its optional symbolic cue manual and quiet.
 if(a.type==='check'){trigger='manual';delivery='source';area=null;base.sound=null;base.motion='none';base.note='Native ability or tool check. No magical effect or successful outcome is assumed; this optional symbolic cue is manual and quiet.';}
 // Playing an instrument is audible even though the check promises no outcome.
 if(a.type==='check'&&/tune|song/.test(act)){base.sound='song';base.note='Native performance check: the instrument is heard; no magical effect or outcome is assumed. Manual cue.';}
 // Mundane martial features, monster traits and ordinary gear (Multiattack,
 // Parry, Uncanny Dodge, ropes, manacles…) are not spellcasting: no magic
 // circle, no floating spectral weapon, no sound. A brisk wind-line cue remains.
 const magical=/\b(?:spells?|magic(?:al)?|arcane|psionic|eldritch|innate|divine|radiant|necrotic|psychic|curse|ki|focus points?|ethereal|bardic|inspiration|specter|spectral|undead|charm(?:ed)?|frighten(?:ed)?|telepath\w*|teleport\w*|invisib\w*|gaze|screech|cacophony|gibbering|paralyz\w*|consume life|pact|invocation)\b/.test(desc+' '+name);
 const mundaneGear=!['spell','feat','weapon'].includes(item.type)&&!magical&&!(item.system?.properties??[]).includes?.('mgc')&&['common','',undefined,null].includes(item.system?.rarity);
 if(!author&&!review&&!fixTheme&&(item.type==='feat'||mundaneGear)&&!magical&&['arcane','weapon'].includes(nativeTheme)&&!['missile','ray','fork','areaMissile','rayFan'].includes(delivery)&&!area){
  for(const [k,v] of Object.entries(MUNDANE))if(k!=='theme'&&base[k]===undefined)base[k]=v;nativeTheme='weapon';
  // A physical monster/feature contact (Tail Swipe, Constrict, Trample) is audible.
  if(fix.sound===undefined&&delivery==='contact'&&['attack','save','damage'].includes(a.type))base.sound=/claw|talon|rake|scythe|swipe/.test(name)?'claw':/bite|chomp|fang|gore|horn|sting|spike|barb|tusk/.test(name)?'naturalPierce':'unarmed';
 }
 // Art-family corrections by theme (D&D only): small necrotic accents instead
 // of the room-sized annihilation sphere, fear/charm/psychic icons instead of
 // sleep Z's, sound waves instead of sheet music for roars and thunder, and no
 // floating spectral weapon on passive weapon riders.
 const text=`${name} ${act}`;
 if(!author){
  if(/\b(?:roars?|moan|shriek|howl|screech|bellow|war cry)\b/.test(text)){base.cast??='soundwave';base.aura??='soundwave';base.area??='thunderwave';base.hit??=nativeTheme==='fear'?'markers.fear':'soundwave';}
  if(nativeTheme==='void'&&!/annihilat/.test(name))base.aura??='smoke.puff.centered.dark_purple,energy_strands.overlay.dark_purple,smoke.puff.centered';
  if(nativeTheme==='curse'&&!review){base.hit??='condition.curse,toll_the_dead';base.aura??='condition.curse,hunters_mark';}
  if(nativeTheme==='fear'){base.hit??='markers.fear,smoke.plumes';base.aura??='markers.fear,smoke.plumes';base.area??='smoke.plumes.01.purple,smoke.plumes';}
  if(nativeTheme==='mind'){
   const kind=/sleep|slumber|dream|nightmare|drows/.test(text)?'sleep':/charm|dominat|\bgeas\b|friend|suggest|enthrall|beguil|compuls/.test(text)||/\bcharmed\b/.test(desc)&&!types.includes('psychic')?'charm':/thought|telepath|mind reading|detect/.test(text)?'thought':types.includes('psychic')||/psychic|mockery|insan|confus|madness|discord|stun|feeblemind|mind blast|synaptic|befuddl/.test(text)?'psychic':'enchant';
   const art={charm:'impact_themed.heart,markers.heart',thought:'eyes.01',psychic:'dizzy_stars',enchant:'magic_signs.circle.02.enchantment.complete'}[kind];
   if(art){base.hit??=art;base.aura??=art;base.area??=art;}
  }
  if(nativeTheme==='sonic'&&!/song|music|instrument|lute|lyre|flute|horn|drum|pipes|bagpipe|bard|whistle|\bviol|shawm|dulcimer|tune|mimic|chime|\bbell/.test(text)){base.cast??='soundwave';base.aura??='soundwave,shatter';}
  if(nativeTheme==='weapon'&&!mode&&!/spiritual weapon/.test(name)){base.hit??='impact.005.white,impact.005,melee_generic.slashing';base.aura??='glint';}
  if(nativeTheme==='earth'&&delivery==='line'&&!base.area){base.area='ground_cracks';base.areaTiles=true;}
 }
 // Prismatic layer saves show the named layer's color.
 const prism=/prismatic/.test(name)&&act.match(/\b(red|orange|yellow|green|blue|indigo|violet)\b/)?.[1];
 if(prism)base.tints={hit:PRISM[prism],aura:PRISM[prism]};
 if(a.type==='check'){base.cast='impact.005.white';base.hit=/tune|song|instrument/.test(act)?'music_notations':'glint';base.aura=base.hit;}
 const silent=/silence|invisible|invisibility|telepath|detect thoughts|pass without trace/.test(name)||base.sound===null;
 const profile=base.sound??({electricity:'electric',sonic:'sonic',vitality:'holy',spirit:'holy',light:'light',void:'void',mind:'psychic',plant:'growth',ward:'shield',arcane:'force',weapon:item.type==='weapon'?weaponSound(item):'sword',divination:'detect',illusion:'transform',flight:'wind',fear:'fear',curse:'void',web:'vines',disease:'poison',blood:'drain'}[nativeTheme]??nativeTheme);
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
 const family=[['crossbow',/crossbow/],['longbow',/longbow/],['shortbow',/shortbow|\bbow\b/],['sling',/sling/],['unarmed',/unarmed|\bfist|grapple|shove/],['dagger',/dagger|knife/],['axe',/axe/],['hammer',/hammer|maul/],['flail',/flail/],['whip',/whip/],['spear',/spear|javelin|trident|pike|lance/],['rapier',/rapier/],['staff',/staff/],['club',/club|mace|morningstar/],['greatsword',/greatsword/],['polearmBlade',/glaive|halberd/]].find(([,re])=>re.test(text))?.[0]??(item.system?.type?.value==='natural'&&!/sword|blade|sickle/.test(text)?'unarmed':'sword');
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
