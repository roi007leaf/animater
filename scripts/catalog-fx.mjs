import {installedFxCatalog, OPTIONAL_FX_KINDS} from './optional-fx.mjs';
import {validateRecipe, MAX_STAGES} from './model.mjs';
import {CATALOG_FX_EVIDENCE} from '../data/catalog-fx-evidence.mjs';
import {fxSemantics} from './catalog-fx-semantics.mjs';

export function catalogFxSettings(game = globalThis.game) {
  const enabled = key => { try { return game?.settings?.get('animater',key) !== false; } catch { return true; } };
  return {token:enabled('catalogTokenFx'),scene:enabled('catalogSceneFx')};
}
export function liveCatalogFx() {
  const game=globalThis.game, settings=catalogFxSettings(game);
  const catalog=installedFxCatalog({modules:game?.modules,tokenMagic:globalThis.TokenMagic,
    fxmaster:globalThis.FXMASTER?.api,config:globalThis.CONFIG?.fxmaster,
    localize:key=>game?.i18n?.localize?.(key)??key,isGM:game?.user?.isGM===true});
  return {...catalog,tokenReady:catalog.tokenReady&&settings.token,sceneReady:catalog.sceneReady&&settings.scene};
}
const slug = entry => String(entry.slug??entry.identifier??entry.name??'').toLowerCase()
  .replace(/^(?:spell[ -])?effect[ -:]*/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const bodyProfiles = {
  fire:{preset:'fire',tint:'#ff9b45'},cold:{preset:'pure-ice-aura',tint:'#9cdeff'},
  electricity:{preset:'electric',tint:'#88cfff'},acid:{preset:'fumes',tint:'#a2dc48'},
  poison:{preset:'smoke',tint:'#78bc57'},force:{preset:'glow',tint:'#ba9cff'},
  healing:{preset:'glow',tint:'#80dda4'},ward:{preset:'hexa-field',tint:'#a7bcff'},
  stone:{preset:'earth-field',tint:'#bea57f'},water:{preset:'water-field',tint:'#75cfff'},
  blur:{preset:'blur'},distortion:{preset:'distortion'},spectral:{preset:'spectral-body',tint:'#83dcf3'},
  teleport:{preset:'warp-field',tint:'#ccb8ff'},fireWard:{preset:'fire-aura',tint:'#ffb267'},
  rush:{preset:'zoomblur'},
};
const themes={fire:'fire',cold:'cold',ice:'cold',electricity:'electricity',lightning:'electricity',acid:'acid',poison:'poison',force:'force'};
const material = stage => (stage.assets??[]).join(' ');
const visual = stage => !['sound','motion','sprite',...OPTIONAL_FX_KINDS].includes(stage.kind);
const onTarget = stage => stage.kind==='impact'||stage.subject==='targets'||stage.kind==='template';
const semantics = (entry,recipe) => {
  const key=entry.uuid??entry.sourceUUID??recipe.itemUuid;
  return Object.hasOwn(CATALOG_FX_EVIDENCE,key)
    ? Object.fromEntries(CATALOG_FX_EVIDENCE[key].map(key=>[key,true])) : fxSemantics(entry);
};

// Existing reviewed delivery, material and description evidence determine body
// accents. A theme alone never means the caster or every victim is on fire.
function bodyProfile(recipe, entry, anchor, options) {
  if(entry.design?.contactFx===false)return null;
  const name=slug(entry),art=material(anchor),persistent=recipe.lifecycle==='document',meaning=semantics(entry,recipe);
  if (persistent && /^(?:persistent-damage|burning)$/.test(name))
    return themes[options.damageType??recipe.stateDamageType]??null;
  if (/^(?:blur|concealed|concealment|blurred)(?:-|$)/.test(name))return 'blur';
  if (/^(?:invisible|invisibility|displacement|mirror-image)(?:-|$)/.test(name))return 'distortion';
  if (/^(?:ethereal|etherealness|ghostly-form|incorporeal-form|ghost-walk)(?:-|$)/.test(name))return 'spectral';
  if (persistent && name==='petrified')return 'stone';
  if (persistent && name==='poisoned')return 'poison';
  if (meaning.healing&&/jb2a\.(?:cure_wounds|healing_generic|heal\.)/.test(art))return 'healing';
  if (meaning.ward&&anchor.kind==='aura'&&/jb2a\.(?:shield|wall_of_force|shield_spell|antilife_shell|protect)/.test(art))return 'ward';
  if (anchor.kind==='aura'&&/jb2a\.fire_shield/.test(art))return 'fireWard';
  if (anchor.kind==='aura'&&/jb2a\.stoneskin/.test(art))return 'stone';
  if (anchor.kind==='aura'&&/jb2a\.(?:water_bubble|watery_sphere)/.test(art))return 'water';
  if (!onTarget(anchor))return null;
  const theme=themes[options.mode?.payload?.element??options.mode?.element??options.variant?.theme??entry.theme];
  if (!theme)return null;
  const damaging=!!options.mode&&options.mode.element!=='physical'||meaning.damage||
    ['attack','damage'].includes(recipe.trigger)&&entry.design?.impact!==false;
  if (!damaging&&!persistent)return null;
  const materials={fire:/jb2a\.(?:fire|flames|burning|scorching|explosion)/,cold:/jb2a\.(?:ice|frost|cold|snow|sleet|ray_of_frost)/,
    electricity:/jb2a\.(?:lightning|electric|chain_lightning|static_electricity)/,acid:/jb2a\.(?:acid|liquid|drop|splash)/,
    poison:/jb2a\.(?:poison|smoke|gas|liquid|drop|splash)/,force:/jb2a\.(?:impact|magic_missile|eldritch|force|energy_field)/};
  return materials[theme].test(art)?theme:null;
}
const sceneProfiles={
  earthquake:{category:'filter',type:'screenShake',duration:2400,options:{timed:true,strength:.18,speed:.2,smoothness:.75,blur:0,decay:.85,duration:2.4,audioAware:false}},
  'control-weather':{category:'particle',type:'clouds',duration:6000,options:{density:.12,speed:.25}},
  'storm-of-vengeance':{category:'particle',type:'rain',duration:6000,options:{density:.3,speed:.6,splash:false}},
};

export function catalogFxDesign(recipe, entry, options={}) {
  if (!recipe.enabled || entry.design?.unavailable || entry.design?.motif==='generic')return [];
  const stages=recipe.stages.filter(visual),persistent=recipe.lifecycle==='document', additions=[];
  const bodyStages=recipe.stages.filter(s=>s.kind==='motion'&&s.motion==='rush'&&s.subject==='source');
  const meaning=semantics(entry,recipe);
  const teleportStage=!persistent&&meaning.teleport&&stages.find(s=>/jb2a\.(?:misty_step|portals|teleportation)/.test(material(s)));
  const order=persistent?stages:[...bodyStages,...(teleportStage?[teleportStage]:[]),...stages.filter(onTarget),...stages.filter(s=>!onTarget(s))];
  for (const anchor of order) {
    const profile=bodyStages.includes(anchor)?'rush':anchor===teleportStage?'teleport':bodyProfile(recipe,entry,anchor,options),spec=bodyProfiles[profile];
    if (!spec)continue;
    const subject=persistent?'source':onTarget(anchor)?'targets':anchor.subject??'source';
    const duration=persistent?6000:Math.max(1400,Math.min(2400,anchor.duration??1600));
    additions.push({kind:'tokenfx',stageId:`${recipe.id}-tmfx`,label:`Token Magic FX · ${spec.preset}`,assets:[],
      catalogFx:true,fxProfile:profile,fxPreset:spec.preset,fxLibrary:'tmfx-main',fxTint:spec.tint??'',subject,persist:persistent,
      delay:persistent?0:anchor.delay??0,duration,optionalTargets:subject==='targets',
      ...(persistent?{}:{afterStage:anchor.stageId,timingAnchor:'start',startOffset:0,
        targetSelection:anchor.targetSelection??'all',targetLimit:anchor.targetLimit??0,
        targetStagger:0,requiresHit:anchor.requiresHit===true})});
    break;
  }
  const scene=!persistent&&sceneProfiles[slug(entry)];
  if (scene) {
    const anchor=stages.find(s=>s.kind==='template')??stages[0];
    additions.push({kind:'scenefx',stageId:`${recipe.id}-fxmaster`,label:`FXMaster · ${scene.type}`,assets:[],catalogFx:true,
      fxProfile:slug(entry),fxCategory:scene.category,fxType:scene.type,fxOptions:{...scene.options},
      delay:anchor?.delay??0,duration:scene.duration,...(anchor?{afterStage:anchor.stageId,timingAnchor:'start',startOffset:0}:{})});
  }
  return additions;
}
export function withCatalogFx(recipe, entry, options={}) {
  if (options.fx===false)return recipe;
  const catalog=options.fxCatalog??liveCatalogFx();
  if (!catalog.tokenReady&&!catalog.sceneReady)return recipe;
  const candidates=catalogFxDesign(recipe,entry,options).filter(stage=>stage.kind==='tokenfx'
    ? catalog.tokenReady&&catalog.presets.some(p=>p.name===stage.fxPreset&&p.library===stage.fxLibrary)
    : catalog.sceneReady&&catalog.effects.some(e=>e.type===stage.fxType&&e.category===stage.fxCategory));
  const additions=candidates.filter(stage=>!recipe.stages.some(s=>s.stageId===stage.stageId));
  if (!additions.length)return recipe;
  return validateRecipe({...recipe,stages:[...recipe.stages,...additions].slice(0,MAX_STAGES)});
}
