import { resolveSpellMedia, assetGeometry } from "./spell-asset-selection.mjs";
import { TOSS_MEDIA } from '../scripts/feat-toss.mjs';

const martial = new Set(["strike","heavyStrike","doubleStrike","multiStrike","mixedStrike","restorativeStrike","smite","spellstrike","fearStrike","charge","tumbleStrike","feintStrike","bindStrike","tripStrike","drawStrike","whirlwindStrike"]);
export const FEAT_SELECTION_REVISION = 8;
// Reviewed contact shape and weapon decide native footage. Never cycle colors
// or variants by name/hash merely to inflate the number of used keys.
export function nativeFeatRoots(context) {
  const weapon=(context.direction?.weapon??"").toLowerCase();
  const shape=[context.direction?.shape,context.direction?.approach,...(context.direction?.finish??[])].join(" ").toLowerCase();
  const paired=(context.direction?.contacts?.count??1)>1;
  const heavy=context.motif==="heavyStrike"||/weighted|descending|slam|pummel/.test(shape);
  if(/claw|talon/.test(weapon))return [`melee_generic.creature_attack.claw.${paired?"002":"001"}`,"melee_generic.creature_attack.claw","unarmed_strike.physical","unarmed_strike"];
  if(/pincer/.test(weapon))return ["melee_generic.creature_attack.pincer","unarmed_strike.physical"];
  if(/jaw|fang|bite/.test(weapon))return ["bite","unarmed_strike.physical.01","unarmed_strike.physical"];
  if(/fist|kick|unarmed/.test(weapon)||context.motif==="unarmed")return [heavy?"melee_generic.creature_attack.fist.002":"unarmed_strike.physical.02","unarmed_strike.physical","melee_generic.creature_attack.fist","unarmed_strike"];
  if(!martial.has(context.motif))return [];
  if(context.slug==="into-the-fray")return ["melee_generic.slashing.one_handed","melee_generic.slash.01","sword.melee.01"];
  if(/polearm|spear/.test(weapon))return ["spear.melee.01","melee_generic.piercing","melee_generic.slash"];
  if(/dagger|knife/.test(weapon))return ["dagger.melee.02","melee_generic.piercing","melee_generic.slash"];
  if(/shield/.test(weapon))return ["melee_attack.06.shield","melee_generic.bludgeoning.two_handed","melee_generic.bludgeoning","unarmed_strike.physical"];
  if(/shield|hammer|club|mace|bludgeon|bash|ram/.test(weapon+" "+shape))return [`melee_generic.bludgeoning.${heavy?"two_handed":"one_handed"}`,"unarmed_strike.physical.02","unarmed_strike.physical","melee_generic.slash"];
  if(/thrust|pierc|stab|spear|narrow/.test(weapon+" "+shape))return ["melee_generic.piercing","sword.melee.01","melee_generic.slash.02.001","melee_generic.slash"];
  if(/two-handed|greatsword/.test(weapon)&&heavy)return ["melee_attack.03.greatsword.02","greatsword.melee.standard","melee_generic.slashing.two_handed","melee_generic.slash.02.002","melee_generic.slash"];
  if(/wide|cleav|sweep/.test(shape))return ["melee_generic.slash.02.002","melee_generic.slashing.two_handed","melee_generic.slash","sword.melee"];
  if(paired)return ["melee_generic.slash.02.001","melee_generic.slash.02","melee_generic.slash","sword.melee"];
  return ["melee_generic.slash.01","melee_generic.slashing.one_handed","melee_generic.slash","sword.melee"];
}
const contactColors={weapon:["white","grey","bluepurple"],fire:["orange","red","yellow"],cold:["blue","white"],electricity:["purple","blue","yellow"],acid:["green","yellow"],poison:["green","purple"],plant:["green","yellow"],blood:["red","dark_red"],void:["dark_purple","purple","black"],spirit:["white","yellow","blue"],vitality:["yellow","white","green"]};
const colorRank=(key,theme)=>{
  const colors=contactColors[theme]??contactColors.weapon;
  const index=colors.findIndex(color=>key.split('.').includes(color));
  return index<0?colors.length:index;
};
export function resolveFeatMedia(databases, theme, profile, defaults, context) {
  if(TOSS_MEDIA[context.slug]) {
    const assets={},selections=[];
    for(const [slot,roots] of Object.entries(TOSS_MEDIA[context.slug])){
      assets[slot]=[];
      const geometry=slot==='bolt'?'projectile':'radial';
      for(const edition of ['patreon','free']){
        const chosen=databases[edition].filter(row=>assetGeometry(row)===geometry)
          .map(row=>({row,index:roots.findIndex(root=>row.key===`jb2a.${root}`||row.key.startsWith(`jb2a.${root}.`))})).filter(r=>r.index>=0)
          .sort((a,b)=>a.index-b.index||colorRank(a.row.key,theme)-colorRank(b.row.key,theme)||a.row.key.localeCompare(b.row.key))[0]?.row;
        if(!chosen)throw Error(`No ${edition} ${slot} footage for ${context.name}.`);
        if(!assets[slot].includes(chosen.key))assets[slot].push(chosen.key);
        selections.push({edition,slot,key:chosen.key,geometry,reason:'description-reviewed toss activity: physical recipient and phase-specific footage'});
      }
    }
    return {assets,selections};
  }
  const intent=[context.direction?.weapon,context.direction?.shape,context.direction?.approach,context.description].join(" ").toLowerCase();
  if(["ranged","throughShot","mixedStrike"].includes(context.motif))profile={...profile,bolt:/firearm|bullet|gun|pistol|musket/.test(intent)?"bullet.physical,bullet":"arrow.physical,arrow,bolt"};
  if(context.motif==="restoration"&&theme!=="healing")profile={...profile,cast:defaults.cast,aura:defaults.aura};
  if(context.slug==="magnetic-pinions")profile={...profile,bolt:"bullet.physical,bullet"};
  if(context.slug==="vengeful-spirit-deck")profile={...profile,bolt:"ranged.card,spell_projectile"};
  if(context.slug==="doctors-visitation")profile={...profile,cast:"glint",hit:"healing_generic.03.burst,healing_generic",aura:"healing_generic.loop"};
  if(["guarded-advance","guarded-advance-knight-vigilant"].includes(context.slug))profile={...profile,cast:"shield.01.complete,shield",aura:"shield"};
  if(context.slug==="black-powder-boost")profile={...profile,cast:"muzzle_flash.single,smoke",aura:"smoke"};
  if(context.slug==="explosive-leap")profile={...profile,cast:"explosion,fireball.explosion",aura:"smoke"};
  if(["marine-jet","propelled-leap"].includes(context.slug))profile={...profile,cast:"water_splash,liquid",aura:"water_splash,liquid"};
  if(context.slug==="ratfolk-roll")profile={...profile,cast:"ground_cracks,smoke",aura:"ground_cracks,smoke"};
  if(context.slug==="cross-the-final-horizon")profile={...profile,cast:"static_electricity",aura:"static_electricity"};
  const passageContacts={
    "sonic-strafe":"shatter,impact", "volcanic-escape":"fireball.explosion,impact_themed.fire",
    "dive-of-the-divine":"divine_smite,impact", "thunderous-landing":"shatter,impact",
    "danse-macabre":"ground_cracks,impact", "strafing-breath":"impact,ground_cracks",
    "to-war":"ground_cracks,impact", "trampling-charge":"ground_cracks,impact",
  };
  if(passageContacts[context.slug])profile={...profile,hit:passageContacts[context.slug]};
  const pattern=["ray","boomerang","lineCue"].includes(context.motif)?"ray":"missile";
  const selections=[];
  const assets=resolveSpellMedia(databases,theme,profile,defaults,{...context,delivery:"target",design:{label:profile.label,assetIntent:context.rationale,pattern},onSelection:selection=>selections.push(selection)});
  if(context.slug==='aerial-boomerang'){
    // Native fiction is a flying blade of wind. Keep the Free wind beam when
    // no projectile slash exists; both editions remain baked travel footage.
    const previousKeys=assets.bolt,editionKeys=[];
    for(const edition of ['patreon','free']){
      const candidate=databases[edition].find(row=>row.key==='jb2a.ranged_slash.instant.001.white'&&assetGeometry(row)==='projectile');
      const keys=new Set(databases[edition].map(row=>row.key));
      editionKeys.push(candidate?.key??previousKeys.find(key=>keys.has(key)));
      if(!candidate)continue;
      const at=selections.findIndex(selection=>selection.edition===edition&&selection.slot==='bolt');
      selections[at]={edition,slot:'bolt',key:candidate.key,geometry:'projectile',reason:'native shearing wind blade; baked ranged slash'};
    }
    assets.bolt=[...new Set(editionKeys.filter(Boolean))];
  }
  const extra=(slot,roots,reason)=>{
    assets[slot]=[];
    for(const edition of ["patreon","free"]){
      const chosen=databases[edition].filter(r=>assetGeometry(r)==="radial")
        .map(row=>({row,index:roots.findIndex(root=>row.key===`jb2a.${root}`||row.key.startsWith(`jb2a.${root}.`))})).filter(r=>r.index>=0)
        .sort((a,b)=>a.index-b.index||colorRank(a.row.key,theme)-colorRank(b.row.key,theme)||a.row.key.localeCompare(b.row.key))[0]?.row;
      if(!chosen)throw Error(`No ${edition} ${slot} footage for ${context.name}.`);
      if(!assets[slot].includes(chosen.key))assets[slot].push(chosen.key);
      selections.push({edition,slot,key:chosen.key,geometry:"radial",reason});
    }
  };
  if(context.motif==="absorb"&&/target|thrall|creature|cone|emanation/.test(context.direction?.origin??""))extra("transfer",theme==="blood"?["particles.002.001.complete.few.red","particles.002.001.complete.few"]:["particles.002.001.complete.few"],"small moving energy motes convey victim-to-source intake; not stretched stationary footage");
  if(context.slug==="into-the-fray")extra("shieldHit",["melee_attack.06.shield","melee_generic.bludgeoning.one_handed","unarmed_strike.physical"],"second native Strike uses shield, rather than another copy of weapon art");
  if(["everstand-strike","clans-edge"].includes(context.slug))extra("guard",["shield.01.complete","shield"],"source guard follows contact; target is not granted a shield");
  if(context.slug==="godbreaker")extra("landing",["ground_cracks.01","impact.001.white","impact.001"],"final successful-branch ground slam after three unarmed hits");
  if(context.slug==="split-spellstrike")extra("magicFinish",["energy_field.02.above.purple","energy_field.02.above","impact.001"],"symbolic chosen-spell discharge at the two different weapon recipients");
  if(["anatomical-quartering","devastating-manifestation"].includes(context.slug))extra("spiritFinish",["divine_smite.target.yellowwhite","divine_smite.target.blueyellow","impact.001.white"],"localized spirit accent; no invented condition or extra Strike");
  if(context.slug==="devastating-manifestation")extra("manifestation",["shimmer","energy_field.01"],"armament manifests before optional weapon contacts");
  if(context.slug==="liberating-dive"){
    extra("rescue",["shield.01.complete","shield"],"second selected creature is the willing ally receiving an Escape opportunity");
    extra("hit",["melee_generic.slash.01","melee_generic.slash"],"one selected foe receives the optional metal wing Blast contact");
  }
  // Natural weapon contact is already localized footage with inherited melee
  // metadata. Generic impact/color bonuses must not replace an explicit slash.
  const roots=nativeFeatRoots(context);
  if(roots.length){
    const chosen=[];
    for(const edition of ["patreon","free"]){
      const candidate=databases[edition].filter(row=>assetGeometry(row)==="radial"&&["melee","melee_large"].includes(row.templateName))
        .map(row=>({row,index:roots.findIndex(root=>row.key===`jb2a.${root}`||row.key.startsWith(`jb2a.${root}.`))})).filter(row=>row.index>=0)
        .sort((a,b)=>a.index-b.index||colorRank(a.row.key,theme)-colorRank(b.row.key,theme)||a.row.key.localeCompare(b.row.key))[0]?.row;
      if(!candidate)throw Error(`No native ${edition} melee contact for ${context.name}.`);
      if(!chosen.includes(candidate.key))chosen.push(candidate.key);
      const index=selections.findIndex(s=>s.edition===edition&&s.slot==="hit");
      selections[index]={edition,slot:"hit",key:candidate.key,geometry:"radial",matchedHints:roots.filter(root=>candidate.key.startsWith(`jb2a.${root}.`)),reason:"native inherited melee-template contact; prioritized over generic impacts"};
    }
    assets.hit=chosen;
  }
  if(context.slug==="black-powder-boost"){
    assets.cast=[];
    for(const edition of ["patreon","free"]){
      const candidate=databases[edition].filter(row=>assetGeometry(row)==="radial"&&row.key.startsWith("jb2a.muzzle_flash.single."))
        .sort((a,b)=>colorRank(a.key,"fire")-colorRank(b.key,"fire")||a.key.localeCompare(b.key))[0];
      if(!candidate)throw Error(`No native ${edition} source muzzle flash.`);
      if(!assets.cast.includes(candidate.key))assets.cast.push(candidate.key);
      const index=selections.findIndex(s=>s.edition===edition&&s.slot==="cast");
      selections[index]={edition,slot:"cast",key:candidate.key,geometry:"radial",reason:"source firearm discharge powers jump; no foe-directed projectile"};
    }
  }
  if(["rebounding-assault","throw-and-catch"].includes(context.slug)){
    const selected=[],roots=["greatsword.throw","sword.throw","dagger.throw"];
    for(const edition of ["patreon","free"]){
      const candidate=databases[edition].filter(row=>assetGeometry(row)==="projectile").map(row=>({row,index:roots.findIndex(root=>row.key.startsWith(`jb2a.${root}.`))})).filter(r=>r.index>=0).sort((a,b)=>a.index-b.index||a.row.key.localeCompare(b.row.key))[0]?.row;
      if(!candidate)throw Error(`No native ${edition} thrown weapon for ${context.name}.`);
      if(!selected.includes(candidate.key))selected.push(candidate.key);
      selections.push({edition,slot:"thrown",key:candidate.key,geometry:"projectile",reason:"moving thrown weapon; Free dagger approximates configurable melee weapon"});
    }
    assets.thrown=selected;
  }
  if(["running-reload","nightwave-springing-reload"].includes(context.slug)){
    assets.reload=[];
    for(const edition of ["patreon","free"]){
      const candidate=databases[edition].filter(row=>assetGeometry(row)==="radial"&&row.key.startsWith("jb2a.glint.")&&row.key.endsWith(".few"))
        .sort((a,b)=>a.key.localeCompare(b.key))[0];
      if(!candidate)throw Error(`No localized ${edition} reload glint.`);
      if(!assets.reload.includes(candidate.key))assets.reload.push(candidate.key);
      selections.push({edition,slot:"reload",key:candidate.key,geometry:"radial",reason:"small source glint after movement; reload is not a shot"});
    }
  }
  return {assets,selections};
}
