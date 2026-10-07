import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sf2eSources} from './sf2e-source.mjs';
import {assetDatabases} from './asset-databases.mjs';
import {buildSpellDesign} from './twoe-spell-design.mjs';
import {profiles,classify,selectStateMedia} from './twoe-state-design.mjs';
import {classifyFeat,analyzeFeat,plainFeatDescription} from './feat-semantics.mjs';
import {analyzeWeapon} from './weapon-semantics.mjs';
import {selectWeaponMedia} from './weapon-asset-selection.mjs';
import {resolveFeatMedia} from './feat-asset-selection.mjs';
import {resolveSpellMedia,assetGeometry,coneMaterialMatches} from './spell-asset-selection.mjs';
import {SPELL_MOTIFS} from '../scripts/spell-design.mjs';
import {SPELL_THEMES,spellRecipe} from '../scripts/spell-choreography.mjs';
import {FEAT_MOTIFS,featRecipe} from '../scripts/feat-choreography.mjs';
import {weaponRecipe} from '../scripts/weapon-choreography.mjs';
import {stateRecipe} from '../scripts/state-catalog.mjs';
import {statePresentation} from '../scripts/state-presentation.mjs';
import {buildConditionDesign} from './pf2e-condition-designs.mjs';
import {buildAuraDesign} from './pf2e-aura-designs.mjs';
import {frameFeatCatalog} from './feat-framing.mjs';
import {diversifySpellMedia} from './spell-media-variety.mjs';
import {allocateSpellIdentities} from './spell-variety-allocation.mjs';
import {mediaTiming} from './media-timing.mjs';
import {MEDIA_DURATIONS} from '../data/media-durations.mjs';
import {PF2E_SPELLS} from '../data/pf2e-spells.mjs';
import {PF2E_FEATS} from '../data/pf2e-feats.mjs';
import {PF2E_WEAPONS} from '../data/pf2e-weapons.mjs';
import {PF2E_CONDITIONS,PF2E_EFFECTS} from '../data/pf2e-state-catalog.mjs';
import {SPELL_SOUND_DESIGNS} from '../data/spell-sounds.mjs';
import {FEAT_SOUND_DESIGNS,WEAPON_SOUND_DESIGNS,ABILITY_SOUND_PROFILES} from '../data/ability-sounds.mjs';
import {SOUND_PROFILES} from '../data/spell-sounds.mjs';
import {validateRecipe,planRecipe} from '../scripts/model.mjs';

const hash=value=>createHash('sha256').update(value).digest('hex');
const [source,databases]=await Promise.all([sf2eSources(),assetDatabases()]);
const pfSpells=new Map(PF2E_SPELLS.map(e=>[e.id,e]));
const pfStates=new Map([...PF2E_CONDITIONS,...PF2E_EFFECTS].map(e=>[e.documentId,e]));
const entries=[],spells=[],feats=[],weapons=[],states=[],excluded=[];
const timings=Object.assign({},...PF2E_FEATS.map(e=>e.mediaTiming??{}),...PF2E_WEAPONS.flatMap(e=>e.modes.map(m=>m.mediaTiming??{})));
for(const spell of PF2E_SPELLS)for(const [slot,keys]of Object.entries(spell.design.assets??{}))for(const key of keys)if(!timings[key]&&spell.design.mediaTiming?.[slot])timings[key]={...spell.design.mediaTiming[slot]};
const classes=new Set('envoy mystic operative soldier solarian witchwarper evolutionist mechanic technomancer'.split(' '));
const metadata=(entry,kind)=>{const s=entry.source.system;return {id:`sf2e-${kind}-${entry.pack}-${entry.source._id}`,documentId:entry.source._id,systemId:'sf2e',kind,nativeType:entry.source.type,pack:entry.pack,uuid:entry.uuid,name:entry.source.name,img:entry.source.img,slug:s.slug??entry.path.split('/').at(-1).replace(/\.json$/,''),level:s.level?.value??0,group:entry.pack,edition:'SF2e',publication:s.publication?.title??'',traits:s.traits?.value??[],descriptionText:plainFeatDescription(s.description?.value),descriptionHash:hash(s.description?.value??''),sourceURL:`https://github.com/foundryvtt/pf2e/blob/${source.sha}/${entry.path}`,shared:entry.shared===true};};
const themeSound=theme=>({electricity:'electric',mind:'psychic',plant:'growth',ward:'shield',gravity:'force',weapon:'metal',arcane:'force',illusion:'shadow',spirit:'holy',vitality:'healing',blood:'drain',curse:'shadow',dream:'sleep',luck:'bless',divination:'detect',web:'chainBinding'})[theme]??theme;
// Reviewed per-spell cues for SF2e spells without a PF2e composition (full
// descriptions read 2026-10-07). Replaces the old theme-keyword fallback that
// left "Needs configuration" labels on playing recipes (e.g. Absolute Zero's
// cold burst played a body-rune buff).
const SF2E_SPELL_MOTIFS={'absolute-zero':'materialArea-cold',accelerate:'swiftTime','adaptive-camouflage':'lightBend',adhere:'metalSurface','akashic-assistant':'summon','akashic-download':'eye','akashic-fount':'eye','akashic-revival':'restore','alternate-outcome':'runeBlessing',anthem:'song','awaken-computer':'empower','caustic-conversion':'acidGlob','cellular-stimulant':'swiftTime','chill-gaze':'icyRay','chrono-push':'phaseMissile','cloying-shadows':'shadowTendrils','commune-with-tech':'eye','control-machine':'mentalJolt','cozy-crashpad':'metalSurface','deadly-vitality':'drain','death-sentence':'divineRay',delete:'lightBend',discharge:'stormTouch','doom-scroll':'prismatic','dream-of-home':'charmHaze','eldritch-wrath':'shadowTendrils',electrotether:'electricalLasso','elemental-nova':'detonation','enhance-body':'empower','event-horizon':'materialArea-shadow','forge-drift-beacon':'portalStep','glow-up':'empower','gravity-field':'gravity','holographic-memory':'prismatic',howl:'sonicWave','implant-data':'eye','injury-echo':'weapon','instant-virus':'stormTouch',irradiate:'poisonMist','life-seal':'protectiveWard',measure:'eye','new-game':'prismatic',overheat:'flameRay','overload-systems':'detonation','parallel-forms':'castingRush','pocket-vacuum':'materialInwardAir',promession:'icyRay','quantum-analysis':'eye','reality-wipe':'lightBend',reorient:'restore',ricochet:'forceBolt','rocket-dash':'castingRush','root-of-all-pain':'mentalJolt','selective-invisibility':'lightBend','shadow-prison':'shadowTendrils','shadow-snap':'shadowTendrils','shifting-surge':'weaponRunes','sift-the-sphere':'eye',singlemind:'eye','singularity-seed':'gravity','skim-data':'eye','slice-reality':'darkRay','sonic-scream':'sonicWave','soul-surge':'vitalBolt','speak-with-computers':'whisper',stumble:'gravity','subjective-reality':'lightBend','tech-intuition':'eye','telekinetic-strangulation':'gravity','telekinetic-tantrum':'burstDebris','temporal-bullets':'swiftTime','time-loop':'slowTime','times-edge':'energyRay','twisted-vision':'mentalJolt','vague-idea':'eye','vibe-check':'charmHaze','vitality-web':'restore','void-scour':'materialArea-shadow','void-seed':'drain','void-whispers':'whisper','wall-of-plasma':'gapC-wall-of-fire','wall-of-steel':'gapC-wall-of-stone','warp-presence':'lightBend','warp-probability':'runeBlessing','warp-terrain':'stone','warp-time':'swiftTime','warp-world':'detonation','weight-of-ages':'gravity','wisp-ally':'lightOrb'};
// SF2e-native corrections from the 2026-10-07 audit (docs/animation-fix-plan-2026-10-07.md,
// SF2e rows). The shared PF2e designers pick fantasy art for sci-fi fiction (arrows for
// guns, music notes for gravity, glint+stars for everything). Lists are ordered
// Patreon-first chains; the resolver plays the first key each edition owns.
const jb=(...keys)=>keys.map(k=>`jb2a.${k}`),MUNDANE=jb('impact.005.white','impact.005.orange');
const SHOT={motif:'firearm',cast:jb('glint.yellow.few'),bolt:jb('bullet.01.orange'),hit:MUNDANE},BURST={...SHOT,bolt:jb('bullet.03.orange','bullet.02.orange')},SNIPE={...SHOT,bolt:jb('bullet.Snipe.orange','bullet.01.orange')};
const SF_CUES={
 tech:{cast:jb('markers_scifi.001.complete.001.blueteal'),aura:jb('markers_scifi.002.complete.001.blueteal')},
 gravity:{cast:jb('energy_strands.in.purple.01','energy_strands.in.green.01'),hit:jb('energy_strands.in.purple.01','energy_strands.in.green.01'),aura:jb('energy_strands.complete.dark_purple.01','energy_strands.complete.blue.01')},
 telepathy:{cast:jb('eyes.01.purple.single','eyes.01.dark_green.single'),aura:jb('energy_strands.overlay.purple.01','energy_strands.overlay.blue.01')},
 light:{cast:jb('markers.light.complete.yellow','markers.light.complete.blue'),aura:jb('dancing_light.yellow')},
 healing:{cast:jb('healing_generic.03.burst.green','healing_generic.200px.green'),aura:jb('healing_generic.200px.green')},
 comfort:{cast:jb('glint.yellow.few'),hit:jb('swirling_sparkles.01.yellow','swirling_sparkles.01.blue'),aura:jb('swirling_sparkles.01.yellow','swirling_sparkles.01.blue')},
 venom:{motif:'preparation',cast:jb('liquid.splash.green','particles.outward.greenyellow.01.01'),aura:jb('particles.swirl.greenyellow.01.01')},
 glitch:{motif:'concealment',cast:jb('markers_scifi.001.complete.002.blueteal','markers_scifi.001.complete.001.blueteal'),aura:jb('shimmer.01.blue')},
};
const SF2E_FEAT_MEDIA={
 'acquire-asset':SHOT,'fish-in-a-barrel':SHOT,'opportune-retort':SHOT,overwatch:SHOT,'ready-arms':SHOT,'overwhelming-shot':SHOT,
 'area-fire':BURST,'bullet-hell':BURST,'come-get-some':BURST,'concentrated-shot':BURST,'death-blossom':BURST,'fan-the-hammer':BURST,'hybrid-technique':BURST,'light-em-up':BURST,'run-hot':BURST,'shell-shower':BURST,'shot-on-the-run':BURST,'shoving-shot':BURST,'terror-forming':BURST,
 'rocket-jump':{...BURST,hit:jb('explosion.01.orange')},'longrifle-reload':SNIPE,'shobhad-special':SNIPE,
 'apply-atraxid-venom':SF_CUES.venom,'envenom-magazine':SF_CUES.venom,
 'line-up-the-shot':{motif:'preparation',cast:jb('glint.yellow.few'),aura:jb('hunters_mark.pulse.01.green')},
 // Solar flare is light energy, not an arrow; the vortex circles the solarian (no ranged leg).
 'hampering-flare':{motif:'ray',cast:SF_CUES.light.cast,bolt:jb('energy_beam.normal.yellow.01','lasershot.orange'),hit:jb('impact.006.yellow','impact.005.orange')},
 'constellation-vortex':{motif:'whirlwindStrike',cast:jb('melee_generic.whirlwind.01.orange'),hit:jb('twinkling_stars.points07.white'),aura:jb('hovering_laserweapon.one_handed.01.yellow','hovering_laserweapon.one_handed.01.blue.01')},
 'whirling-swipe':{motif:'whirlwindStrike',cast:jb('melee_generic.whirlwind.01.orange'),hit:jb('melee_generic.slash.01.orange')},
 'gravity-grasp':{motif:'utility',...SF_CUES.gravity},'black-hole':{hit:SF_CUES.gravity.hit,aura:SF_CUES.gravity.aura},
 'hostile-gravity':{cast:SF_CUES.gravity.cast,hit:jb('impact.ground_crack.01.purple','impact.ground_crack.01.orange'),aura:SF_CUES.gravity.aura},
 'apocalypse-burst':{motif:'elementCone',theme:'fire',cast:jb('cast_generic.fire.01.orange'),hit:jb('fireball.explosion.orange')},
 // Chosen-element breaths: the element is picked at play time, so use a neutral energy burst.
 ...Object.fromEntries(['draconic-breath','dragonkin-breath','dragon-breath-dragon-form'].map(s=>[s,{motif:'elementCone',cast:jb('glint.yellow.few'),hit:jb('explosion.03.blueyellow')}])),
 'eat-it':{motif:'utility',cast:jb('liquid.blob.green','particles.outward.greenyellow.01.01'),aura:jb('particles.swirl.greenyellow.01.01')},
 'bioluminescence-shirren':{motif:'utility',...SF_CUES.light},'corona':{motif:'elementAura',cast:SF_CUES.light.cast,aura:jb('energy_field.02.below.yellow','energy_field.02.below.blue')},
 'camera-blur':SF_CUES.glitch,'encode-presence':SF_CUES.glitch,'cloaking-field':SF_CUES.glitch,
 'evasive-jet':{motif:'movement',cast:jb('smoke.puff.side.02.white')},'dont-touch-that':{motif:'utility',cast:jb('ui.chevrons3.yellow'),aura:jb('glint.yellow.few')},
 'nanite-arena':{motif:'guard',cast:jb('markers_scifi.001.complete.003.blueteal','markers_scifi.001.complete.001.blueteal'),hit:jb('glint.yellow.few'),aura:jb('energy_field.02.above.blue')},
 'puff-up':{cast:jb('glint.yellow.few'),hit:MUNDANE,aura:jb('glint.yellow.few')},
 'cheer-up':{motif:'targetSupport',...SF_CUES.comfort,aura:jb('markers.heart.pink.01')},'self-soothe':{motif:'resolve',...SF_CUES.comfort},'center-your-emotions':{motif:'resolve',...SF_CUES.comfort},
 // "Perform first aid" / "perform a stunt" are not music.
 'administer-first-aid':{motif:'restoration',...SF_CUES.healing},'kiss-it-better':{motif:'restoration',...SF_CUES.healing},'akashic-sync':{motif:'utility',...SF_CUES.telepathy},'stunt':{motif:'movement',cast:jb('smoke.puff.side.02.white')},
 'star-brand':{motif:'utility',...SF_CUES.light},'wormhole':{motif:'teleport',cast:jb('portals.vertical.ring.dark_purple','portals.vertical.ring.bright_yellow'),hit:jb('misty_step.01.blue'),aura:jb('portals.vertical.ring.dark_purple','portals.vertical.ring.bright_yellow')},'fog-of-war':BURST,
 // A curled-up skittermander hurled as a ball: closest round thrown body, not an arrow or bullet.
 cannonball:{motif:'ranged',bolt:jb('boulder.toss.02.01.stone.brown'),hit:MUNDANE},
};
// Weapon media by native slug and mode. Flights replace; other slots prepend so each
// edition keeps its previous fallback when it lacks the new key.
const SF_SONIC={flight:jb('spell_projectile.sound.01.pinkteal','energy_beam.normal.blue.01'),muzzle:jb('soundwave.01.blue'),accent:jb('soundwave.01.blue')};
const SF_MISSILE={ranged:{flight:jb('ranged_missile.missile_only.001.orangeyellow','bullet.02.orange')}};
const SF2E_WEAPON_MEDIA={
 'replica-zo-microphone':{ranged:{...SF_SONIC,muzzle:jb('soundwave.01.purple','soundwave.01.blue'),accent:jb('soundwave.01.purple','soundwave.01.blue')}},
 'sonic-rifle':{ranged:{...SF_SONIC,accent:jb('soundwave.02.blue')}},streetsweeper:{ranged:{...SF_SONIC,accent:jb('soundwave.02.blue')}},
 'meme-cannon':{ranged:{flight:jb('spell_projectile.sound.01.pinkteal','energy_beam.normal.bluepink.02'),muzzle:jb('soundwave.01.purple','soundwave.01.blue'),accent:jb('dizzy_stars.200px.purple','dizzy_stars.200px.blueorange')}},
 'acid-dart-rifle':{ranged:{flight:jb('dart.01.throw.physical.white','dagger.throw.01.white')}},'reality-ripper':{ranged:{flight:jb('disintegrate.green')}},
 'gyrojet-pistol':SF_MISSILE,'reaction-breacher':SF_MISSILE,'stellar-cannon':SF_MISSILE,
 'skyfire-sword':{melee:{family:'sword',contact:jb('sword.melee.fire.orange','sword.melee.01.white')}},
 'plasma-sword':{melee:{contact:jb('lasersword.melee.orange.01')}},'quantum-reaver':{melee:{contact:jb('lasersword.melee.purple.01')}},'phase-cutlass':{melee:{contact:jb('lasersword.melee.dark_white.01')}},
 'zero-knife':{melee:{family:'dagger',contact:jb('dagger.melee.02.white')}},'force-needle':{melee:{family:'dagger',contact:jb('dagger.melee.02.white')}},
 'disintegration-lash':{melee:{family:'whip',contact:jb('melee_attack.01.flail.01')}},'fangblade':{melee:{contact:jb('melee_attack.01.sword_chainsaw.01')}},
 'bone-scepter':{melee:{element:'void',accent:jb('toll_the_dead.purple.skull_smoke','toll_the_dead.green.skull_smoke')}},
};
const SF_HOLY=/\b(holy|divine|sacred|deity|deities|god|gods|goddess|pray\w*|saint|sanctif\w*|blessing)\b/i,SF_DREAD=/\b(fear\w*|frighten\w*|death|dead|dying|doom\w*|dread\w*|terror\w*|intimidat\w*|demoraliz\w*|menac\w*|scar\w*|horr\w*|curse\w*|grave|bell|mourn\w*|sorrow\w*)\b/i;
// Lowering someone's fear is comfort, not a death knell.
const SF_COMFORT=/\b(reduce\w* (?:\w+ ){0,3}frightened|comfort\w*|calm\w*|sooth\w*|recenter\w*|reassur\w*)\b/i;
const SF_GUN=/\b(area fire|auto-?fire|ranged strikes?|ranged weapons?|guns?|firearms?|magazines?|sniper|automatic weapons?|area weapons?)\b/i;
const SF_MUSIC=/\b(music\w*|song\w*|sing\w*|perform\w*|instrument\w*|melod\w*|danc\w*|rhythm\w*|audience|concert\w*|chant\w*)\b/i;
// "Activity starts" filler → the cue its fiction names. Fortune keeps the stars.
const SF_TECH=/\b(hack\w*|computers?|tech|technolog\w*|devices?|drones?|programs?|programming|software|data|dataset|network\w*|cyber\w*|nanites?|holo\w*|androids?|robot\w*|machines?|circuit\w*|sensors?|electronic\w*|digital\w*|upload\w*|download\w*|firmware|interfaces?|augmentations?|gadgets?|toolkit|starships?|vehicles?|virus\w*|infosphere)\b/i;
// Fantasy rune circles, detect-magic scans and bardic notes on tech spells become sci-fi HUD markers.
const SF_ARCANE_KEY=/^jb2a\.(magic_signs|detect_magic|bardic_inspiration|music_notations|cast_shape|cast_generic\.01\.dark_purple|sleep\.target)/;
const sfFeatCue=(text,traits)=>traits.includes('fortune')||/\breroll/i.test(text)?null:
 SF_TECH.test(text.replace(/vitality network/gi,''))?SF_CUES.tech:
 /\b(gravit\w*|graviton|black hole|singularit\w*|telekine\w*)\b/i.test(text)?SF_CUES.gravity:
 traits.includes('healing')||/\b(regain\w* (?:\S+ ){0,4}hit points|regenerat\w*|heal\w*|temporary hit points)\b/i.test(text)?SF_CUES.healing:
 /\b(telepath\w*|psychic\w*|thoughtsense|brainwaves?|crowd the minds|link\w* (?:\S+ ){0,3}minds?)\b/i.test(text)?SF_CUES.telepathy:
 traits.includes('light')||/\b(glow\w*|photon\w*|biolumin\w*|radian\w*|luminous|shine|shining|bright light)\b/i.test(text)?SF_CUES.light:null;
function sfFeatMedia(feat,text,traits){
 const own=SF2E_FEAT_MEDIA[feat.slug],slots={...feat.assets},has=(slot,re)=>(slots[slot]??[]).some(k=>re.test(k));let patch=own;
 if(!patch&&feat.motif==='utility'&&has('aura',/twinkling_stars/))patch=sfFeatCue(text,traits);
 if(!patch&&feat.motif==='inspiration'&&has('cast',/music_notations/)&&!SF_MUSIC.test(text))patch=sfFeatCue(text,traits)??SF_CUES.comfort;
 if(patch){const {motif,theme,...media}=patch;Object.assign(slots,media);if(motif)feat.motif=motif;if(theme)feat.theme=theme;}
 // Guns fire bullets with a plain hit, never purple/blue magic bullets or arrows.
 if(!own&&['firearm','throughShot','mixedStrike','ranged'].includes(feat.motif)&&(has('bolt',/\.bullet\./)||has('bolt',/\.arrow\.physical/)&&SF_GUN.test(text))){
  if(has('bolt',/\.arrow\.physical|\.bullet\.\w+\.(purple|blue)$/))slots.bolt=/\b(area fire|auto-?fire)\b/i.test(text)?BURST.bolt:SHOT.bolt;
  if(has('hit',/^jb2a\.(impact\.00[15]\.(purple|blue)$|divine_smite)/))slots.hit=MUNDANE;
  if(feat.motif==='ranged')feat.motif='firearm';
 }
 // Holy pillar as a generic hit, death bell on non-dread fiction, acid that reads as water.
 for(const slot of ['cast','hit','aura']){
  if(has(slot,/divine_smite/)&&!SF_HOLY.test(text))slots[slot]=/\b(gravit\w*|graviton)\b/i.test(text)?SF_CUES.gravity.hit:MUNDANE;
  if(has(slot,/toll_the_dead/)&&(SF_COMFORT.test(text)||!SF_DREAD.test(text)))slots[slot]=slot!=='cast'?SF_CUES.comfort.hit:SF_COMFORT.test(text)?SF_CUES.comfort.cast:SF_CUES.telepathy.cast;
  if(feat.theme==='acid'&&slots[slot])slots[slot]=slots[slot].map(k=>k==='jb2a.liquid.blob.blue'?'jb2a.particles.outward.greenyellow.01.01':k);
 }
 // Solarian solar-weapon blows are light blades.
 if(traits.includes('solarian')&&/\bsolar weapon\b/i.test(text)&&/^jb2a\.melee_generic\./.test(slots.hit?.[0]??''))slots.hit=[...jb('lasersword.melee.yellow.01'),...slots.hit];
 if(JSON.stringify(slots)!==JSON.stringify(feat.assets)){feat.assets=slots;feat.notes=[...(feat.notes??[]),'SF2e-native media correction (2026-10-07 audit).'];}
}
const spellFallback={ward:'forceShield',healing:'restore',fear:'dread',mind:'mentalJolt',teleport:'portalStep',transform:'form',shadow:'darkShroud',divination:'eye',sonic:'song',weapon:'weaponRunes',light:'lightOrb',time:'swiftTime',force:'empower',arcane:'bodyRunes'};
for(const entry of source.entries){
 const item=entry.source,s=item.system??{},native={systemId:'sf2e',uuid:entry.uuid};
 if(item.type==='spell'){
  const spell={...buildSpellDesign(entry,databases,pfSpells.get(item._id)),...native};
  if(spell.design.unavailable){
   const text=plainFeatDescription(s.description?.value).toLowerCase();
   const motif=SF2E_SPELL_MOTIFS[spell.slug]??(/weapon|ammunition|shot|strike/.test(text)?'weaponRunes':/data|information|search|detect|computer|sensor|navigate/.test(text)?'eye':/illusion|hologram|image|disguise/.test(text)?'lightBend':/teleport|portal|dimension/.test(text)?'portalStep':spellFallback[spell.theme]??'bodyRunes');
   if(!SPELL_MOTIFS[motif])throw Error(`Unknown SF2e motif ${motif} for ${spell.slug}`);
   Object.assign(spell.design,{motif,pattern:SPELL_MOTIFS[motif].pattern,label:SPELL_MOTIFS[motif].label,unavailable:false,rationale:`${SPELL_MOTIFS[motif].label}: reviewed SF2e cue from the full description; no bespoke JB2A composition exists.`});spell.quality='symbolic';
   spell.notes=[...(spell.notes??[]).filter(n=>!n.startsWith('Configure this spell')),'Symbolic SF2e cue chosen from the full description; bespoke artwork is unavailable.'];
   spell.design.assets=resolveSpellMedia(databases,spell.theme,SPELL_MOTIFS[motif],SPELL_THEMES[spell.theme],{name:spell.name,slug:spell.slug,design:spell.design,area:spell.area,delivery:spell.delivery});
  }
  if(spell.slug==='supercharge-weapon'){
   Object.assign(spell,{theme:'force',delivery:'target',trigger:'use',quality:'themed'});Object.assign(spell.design,{motif:'empower',pattern:SPELL_MOTIFS.empower.pattern,subject:'targets',unavailable:false});spell.design.assets=resolveSpellMedia(databases,'force',SPELL_MOTIFS.empower,SPELL_THEMES.force,{name:spell.name,slug:spell.slug,design:spell.design,delivery:'target'});
  }
  const spellText=plainFeatDescription(s.description?.value);
  if(!entry.shared)for(const [slot,keys]of Object.entries(spell.design.assets??{})){
   if(SF_TECH.test(spellText.replace(/(vitality|your) network/gi,""))&&keys.some(k=>SF_ARCANE_KEY.test(k)))spell.design.assets[slot]=keys.some(k=>/\.loop\b/.test(k))?jb('markers_scifi.001.loop.001.blueteal'):slot==='cast'?SF_CUES.tech.cast:SF_CUES.tech.aura;
   // Screams and howls are sound waves, not sheet music.
   else if(keys.some(k=>/^jb2a\.music_notations\./.test(k))&&!SF_MUSIC.test(spellText))spell.design.assets[slot]=jb('soundwave.02.blue');
  }
  spells.push({entry,spell});
 }else if(['feat','action'].includes(item.type)){
  const active=classifyFeat(item);if(!active.included){excluded.push({uuid:entry.uuid,type:item.type,classification:active.classification});continue;}
  const design=analyzeFeat(item,entry.path),traits=s.traits?.value??[];
  const resolved=resolveFeatMedia(databases,design.theme,FEAT_MOTIFS[design.motif],SPELL_THEMES[design.theme],{name:item.name,slug:design.slug,motif:design.motif,rationale:design.rationale,direction:design.direction,traits,description:plainFeatDescription(s.description?.value)});
  const feat={id:item._id,name:item.name,slug:design.slug,...native,level:s.level?.value??0,actionType:s.actionType?.value,actions:s.actions?.value,traits,classTraits:traits.filter(t=>classes.has(t)),category:s.category??entry.pack,trigger:'use',descriptionHash:active.descriptionHash,...design,...resolved};
  if(!entry.shared)sfFeatMedia(feat,plainFeatDescription(s.description?.value),traits);
  feats.push({entry,feat});
 }else if(item.type==='weapon'){
  // Launchers and some grenades ship without a native range; they fly, they are never swung.
  const launcher=/\/grenade-launcher-/.test(entry.path),grenade=s.group==='grenade'||(s.traits?.value??[]).includes('grenade')||launcher;
  const range=s.range??(grenade?Number(plainFeatDescription(s.description?.value).match(/\brange (?:increment )?(?:of )?(\d+) f/i)?.[1])||70:null);
  const weapon={...analyzeWeapon(grenade?{...item,system:{...s,group:'bomb',range}}:item,entry.path),...native,nativeGroup:grenade?'grenade':s.group};
  for(const mode of weapon.modes){
   const roots={laser:['lasershot.red','lasershot.orange'],plasma:['fire_bolt.orange'],shock:['bolt.lightning.blue','arrow.lightning.blue'],cryo:['ray_of_frost.blue','snowball_toss'],sonic:['energy_beam.normal.blue'],corrosive:['spell_projectile.poison.greenyellow','eldritch_blast.green'],projectile:['bullet.02','bullet.01'],sniper:['bullet.02','bullet.01'],dart:['dart.01.throw'],flame:['fire_bolt.orange'],mental:['eldritch_blast.purple'],null:['disintegrate.purple','eldritch_blast.purple']};
   if(mode.mode==='ranged'&&roots[s.group]){mode.family=['projectile','sniper'].includes(s.group)?'firearm':s.group==='dart'?'blowgun':'firearm';mode.flightRoots=roots[s.group];}
   Object.assign(mode,selectWeaponMedia(databases,weapon,mode));
   if(mode.mode==='ranged'&&['cryo','sonic'].includes(s.group)){
    mode.assets.flight=[...new Set(Object.values(databases).map(rows=>rows.filter(r=>roots[s.group].some(p=>r.key===`jb2a.${p}`||r.key.startsWith(`jb2a.${p}.`))&&['beam','projectile'].includes(assetGeometry(r))).sort((a,b)=>a.key.localeCompare(b.key))[0]?.key).filter(Boolean))];
   }
   if(launcher)Object.assign(mode,{mode:'ranged',family:'firearm'}),mode.assets.muzzle=jb('muzzle_flash.single.01.yellow');
   const fix=SF2E_WEAPON_MEDIA[weapon.slug]?.[mode.mode]??(mode.mode==='ranged'&&s.group==='sonic'?SF_SONIC:null);
   if(fix){const {family,element,...media}=fix;if(family)mode.family=family;if(element)Object.assign(mode,{element,elements:[element]});for(const [slot,keys]of Object.entries(media))mode.assets[slot]=[...new Set([...keys,...(slot==='flight'?[]:mode.assets[slot]??[])])];}
  }
  weapons.push({entry,weapon});
 }else if(['condition','effect'].includes(item.type)){
  const kind=entry.pack==='conditions'||item.type==='condition'?'condition':'effect',meta=metadata(entry,kind),slug=meta.slug,shared=pfStates.get(item._id),design={...classify(item),...(/^spell-effect-skyfire-wings-/.test(slug)?{theme:'fire'}:{})},profile=profiles[design.theme];
  const state={...(shared?structuredClone(shared):{}),...meta,id:`${entry.pack}-${item._id}`,systemId:'sf2e',slug,group:entry.pack,nativeDuration:s.duration??null,theme:design.theme,quality:design.quality,color:design.hex??profile.hex,description:s.description?.value??'',...selectStateMedia(databases,design.theme,slug,design.color),opacity:1,scale:1.35};
  if(item.type==='condition')Object.assign(state,buildConditionDesign(state,databases));
  else Object.assign(state,statePresentation(state));
  if(slug==='suppressed')Object.assign(state,{theme:'slow',below:true,scale:1.4,offsetY:.2,assets:selectStateMedia(databases,'slow',slug,'red').assets});
  if(shared?.auras)state.auras=[];if(shared?.auraSources)state.auraSources=[];
  for(const rule of s.rules??[])if(rule.key==='Aura'){
   state.auras??=[];state.auras.push({slug:rule.slug??slug,radius:typeof rule.radius==='number'?rule.radius:null});
  }
  states.push({entry,state});
 }else excluded.push({uuid:entry.uuid,type:item.type,classification:'no-native-activation'});
}
// Aura effect links identify the source token; render the native prepared radius.
for(const {entry,state}of states)for(const sourceEntry of source.entries)for(const rule of sourceEntry.source.system?.rules??[])if(rule.key==='Aura')for(const effect of rule.effects??[]){
 const reference=effect.uuid;if(typeof reference!=='string')continue;
 if(reference!==entry.uuid&&reference!==`Compendium.sf2e.${entry.pack}.Item.${entry.source.name}`)continue;
 state.auraSources??=[];state.auraSources.push({uuid:sourceEntry.uuid,slug:rule.slug??sourceEntry.source.system?.slug??sourceEntry.path.split('/').at(-1).replace(/\.json$/,''),radius:typeof rule.radius==='number'?rule.radius:null});
}
for(const {state}of states)if(state.auras?.length||state.auraSources?.length){
 try{state.auraDesign=buildAuraDesign(state,databases);}catch{
  const media=selectStateMedia(databases,state.theme,state.slug);state.auraAssets=media.assets;state.auraDesign={id:state.slug,layers:[{assets:media.assets,stageId:'native-aura-field',scale:1,opacity:.9,below:true,playbackRate:.65}]};
 }
}
const variety=diversifySpellMedia(spells.map(e=>e.spell),databases,SPELL_MOTIFS);
console.log(`SF2e: ${spells.length} spells, ${feats.length} active abilities, ${weapons.length} weapons, ${states.length} sustained states.`);
const assets=[...spells.map(e=>e.spell.design.assets),...feats.map(e=>e.feat.assets),...weapons.flatMap(e=>e.weapon.modes.map(m=>m.assets))];
const keys=[...new Set(assets.flatMap(media=>Object.values(media).flat()))],rows=new Map(Object.values(databases).flat().map(row=>[row.key,row]));
let next=0;await Promise.all(Array.from({length:4},async()=>{while(next<keys.length){const key=keys[next++];if(!timings[key]){const row=rows.get(key),geometry=assetGeometry(row),duration=MEDIA_DURATIONS[key];const timing=duration&&!['beam','projectile','line'].includes(geometry)?{duration,baked:false}:await mediaTiming(row,databases);if(timing)timings[key]=timing;}}}));
for(const [key,timing]of Object.entries(timings))timing.duration=Math.max(timing.duration??0,MEDIA_DURATIONS[key]??0);
for(const {spell}of spells)spell.design.mediaTiming=Object.fromEntries(Object.entries(spell.design.assets).flatMap(([slot,keys])=>{const samples=keys.map(k=>timings[k]).filter(Boolean);return samples.length?[[slot,{duration:Math.max(...samples.map(t=>t.duration)),baked:samples.every(t=>t.baked),...(samples.some(t=>t.contact)?{contact:Math.max(...samples.map(t=>t.contact??0))}:{})}]]:[];}));
for(const {feat}of feats)feat.mediaTiming=Object.fromEntries(Object.values(feat.assets).flat().filter(k=>timings[k]).map(k=>[k,timings[k]]));
for(const {weapon}of weapons)for(const mode of weapon.modes){mode.mediaTiming=Object.fromEntries(Object.values(mode.assets).flat().filter(k=>timings[k]).map(k=>[k,timings[k]]));mode.approximations=mode.selections.filter(s=>s.approximation).map(s=>`${s.edition}: ${s.key}`);}
allocateSpellIdentities(spells.map(e=>e.spell),spell=>spellRecipe(spell,undefined,{motion:false}),databases,new Map(source.entries.filter(e=>e.source.type==='spell').map(e=>[e.source._id,e.source])));frameFeatCatalog(feats.map(e=>e.feat),databases);
const bind=(recipe,entry)=>validateRecipe({...recipe,description:'',systemId:'sf2e',catalogEntry:entry.id,itemUuid:entry.uuid,lifecycle:['condition','effect'].includes(entry.kind)?'document':recipe.lifecycle,stateEntry:['condition','effect'].includes(entry.kind)?entry.id:recipe.stateEntry});
for(const {entry,spell}of spells){const meta=metadata(entry,'spell'),sound=SPELL_SOUND_DESIGNS[spell.id]?.profile??themeSound(spell.theme);entries.push({...meta,level:spell.rank,theme:spell.theme,quality:spell.quality,spell,variants:[{id:'cast',label:spell.kind==='cantrip'?'Cantrip':`Rank ${spell.rank}`,soundProfile:sound,recipe:bind(spellRecipe(spell),meta)}]});}
for(const {entry,feat}of feats){const meta=metadata(entry,'feat'),profile=FEAT_SOUND_DESIGNS[feat.id]?.profile??({unarmed:'unarmed',doubleStrike:'sword',strike:'sword',heavyStrike:'greatsword',ranged:'ranged',firearm:'firearm',bombThrow:'bomb',guard:'shieldRaise',bind:'chainBinding',trip:'unarmed',shove:'unarmed',movement:'wind',flight:'wind',stealth:'shadow',teleport:'teleport',healing:'healing',dread:'fear',utility:'detect',perception:'detect'})[feat.motif]??themeSound(feat.theme);entries.push({...meta,theme:feat.theme,quality:feat.quality,actionType:feat.actionType,actions:feat.actions,classTraits:feat.classTraits,variants:[{id:'activate',label:feat.actionType==='action'?`${feat.actions??1} actions`:feat.actionType,soundProfile:profile,soundNamespace:'ability',recipe:bind(featRecipe(feat),meta)}]});}
for(const {entry,weapon}of weapons){
 const meta=metadata(entry,'weapon'),variants=weapon.modes.map(mode=>({id:mode.mode,label:mode.mode,weaponMode:mode.mode,soundNamespace:'ability',soundProfile:WEAPON_SOUND_DESIGNS[`${weapon.id}:${mode.mode}`]?.profile??(weapon.nativeGroup==='laser'?'fireRay':weapon.nativeGroup==='cryo'?'coldRay':weapon.nativeGroup==='shock'?'electric':weapon.nativeGroup==='sonic'?'sonic':weapon.nativeGroup==='corrosive'?'acid':weapon.nativeGroup==='plasma'?'fire':mode.payload?`bomb-${mode.element}`:mode.family),recipe:bind(weaponRecipe(weapon,mode.mode),meta)}));
 const automatic=weapon.traits.includes('automatic'),trait=weapon.traits.find(t=>/^area-(burst|cone|line)(?:-\d+)?$/.test(t)),tag=entry.source.system.description?.value.match(/@Template\[(burst|cone|line)\|distance:(\d+)/);
 const area=automatic?{type:'cone',value:Math.max(5,Math.floor((weapon.range??entry.source.system.range??10)/2/5)*5)}:trait?{type:trait.split('-')[1],value:Number(trait.split('-')[2])||(trait.includes('burst')?5:entry.source.system.range)}:weapon.nativeGroup==='grenade'&&tag?{type:tag[1],value:Number(tag[2])}:/\/grenade-launcher-/.test(entry.path)?{type:'burst',value:10}:null;
 if(area){
  const mode=weapon.modes[0],recipe=variants[0].recipe,impact=recipe.stages.find(s=>s.kind==='impact'),flight=recipe.stages.find(s=>s.kind==='travel'),label=automatic?'Auto-Fire':'Area Fire';
  const stages=recipe.stages.filter(s=>s.kind==='motion').map(s=>({...s,distance:.08}));
  if(area.type==='cone'){
   const selectedCones=Object.values(databases).map(db=>db.filter(row=>assetGeometry(row)==='cone'&&coneMaterialMatches(row.key,mode.element)).sort((a,b)=>a.key.localeCompare(b.key))[0]?.key).filter(Boolean),coneKeys=[...new Set(selectedCones)];
   if(selectedCones.length===Object.keys(databases).length){
    const samples=await Promise.all(coneKeys.map(async key=>timings[key]??await mediaTiming(rows.get(key),databases)));
    stages.push({...impact,kind:'template',stageId:`${meta.id}-area`,label,assets:coneKeys,delay:500,afterStage:'',duration:Math.max(2500,...samples.filter(Boolean).map(t=>t.duration)),scale:1,oneShot:true});
   }else stages.push({...flight,stageId:`${meta.id}-area-fan`,label,travelDestination:'area',areaLayout:'fan',fanCount:automatic?7:5,delay:500,afterStage:'',opacity:.85});
  }else{
   if(weapon.nativeGroup==='grenade'&&flight)stages.push({...flight,travelDestination:'area'});
   stages.push({...impact,kind:'template',stageId:`${meta.id}-area`,label,assets:area.type==='line'?mode.assets.flight:mode.assets.accent,delay:500,afterStage:weapon.nativeGroup==='grenade'?flight?.stageId??'':'',duration:Math.max(2500,impact?.duration??0,area.type==='line'?flight?.duration??0:0),scale:1,oneShot:true});
  }
  variants.push({id:'area',label,weaponMode:'area',soundNamespace:'ability',soundProfile:variants[0].soundProfile,recipe:bind({...recipe,id:`${recipe.id}-area`,trigger:'template',weaponMode:undefined,previewArea:area,stages},meta)});
 }
 entries.push({...meta,group:weapon.nativeGroup,theme:weapon.modes[0].element,quality:'themed',variants});
}
for(const {entry,state}of states){const meta=metadata(entry,state.kind),variants=[];for(const damageType of state.slug==='persistent-damage'?Object.keys(state.damageVariants??{}):[undefined])variants.push({id:damageType??'active',label:damageType??'Active',damageType,recipe:bind(stateRecipe(state,{damageType}),meta)});entries.push({...meta,theme:state.theme,quality:state.quality,private:state.private??['hidden','invisible','undetected','unnoticed'].includes(state.slug),state,variants});}
// Physical family aliases and non-elemental grenade payloads need real profiles.
const soundAliases={chakram:'thrown',glaive:'polearmBlade',greataxe:'axe',contact:'unarmed','bomb-physical':'bomb-explosive','bomb-untyped':'bomb-soft'};
for(const entry of entries)for(const variant of entry.variants){
 variant.soundProfile=soundAliases[variant.soundProfile]??variant.soundProfile;
 if(!entry.state&&variant.soundProfile&&!{...SOUND_PROFILES,...ABILITY_SOUND_PROFILES}[variant.soundProfile])throw Error(`Unknown SF2e sound profile: ${entry.name}/${variant.soundProfile}`);
}
const context={source:{id:'s',center:{x:100,y:100},w:100,h:100,document:{width:1,height:1}},targets:[{id:'t',center:{x:400,y:100},w:100,h:100,document:{width:1,height:1}}],gridSize:100,gridDistance:5,template:{id:'area'},area:{type:'cone',center:{x:100,y:100},endpoint:{x:500,y:100},diameter:400,length:400,width:100,angle:90}};
const issues=[];for(const entry of entries)for(const variant of entry.variants)for(const [edition,db]of Object.entries(databases))try{planRecipe(variant.recipe,db,context);}catch(error){issues.push({id:entry.id,name:entry.name,variant:variant.id,edition,error:error.message});}
const meta={systemId:'sf2e',version:source.version,ref:source.ref,sha:source.sha,repository:source.repository,sourceDocuments:source.entries.length,counts:Object.fromEntries(['spell','feat','weapon','condition','effect'].map(k=>[k,entries.filter(e=>e.kind===k).length])),variants:entries.reduce((n,e)=>n+e.variants.length,0),excluded:excluded.length,descriptionHashes:entries.length,variety,issues:issues.length};
await writeFile('data/sf2e-catalog.mjs',`// Native SF2e catalog. References only; no animation or sound media bundled.\nexport const SF2E_SOURCE=${JSON.stringify(meta)};\nexport const SF2E_ENTRIES=${JSON.stringify(entries)};\n`);
await writeFile('data/sf2e-catalog-validation.json',JSON.stringify({source:meta,issues,excluded},null,2));
console.log(JSON.stringify({source:meta,issues:issues.slice(0,15)},null,2));if(issues.length)process.exitCode=1;
