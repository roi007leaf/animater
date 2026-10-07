import {writeFile} from "node:fs/promises";
import {dnd5eSources, DND5E_SOURCE_SHA} from "./dnd5e-source.mjs";

// These native documents were read in full, including both Prismatic 2024 tables.
// Five modern weapon descriptions are empty; their review uses native properties.
const reviewedNames = new Set([
  "Acid", "Acid Arrow", "Action Surge", "Aid", "Alchemist's Fire", "Animate Dead", "Animate Objects", "Bane", "Bless",
  "Breath Weapon", "Burning Hands", "Call Lightning", "Chain Lightning", "Channel Divinity", "Channel Divinity: Turn Undead",
  "Chill Touch", "Chromatic Orb", "Cone of Cold", "Conjure Animals", "Conjure Elemental", "Conjure Minor Elementals",
  "Conjure Woodland Beings", "Counterspell", "Cunning Action", "Cure Wounds", "Dagger", "Dancing Lights", "Dimension Door",
  "Disintegrate", "Divine Smite", "Eldritch Blast", "Fire Shield", "Fireball", "Flame Blade", "Flurry of Blows", "Fly",
  "Guiding Bolt", "Handaxe", "Haste", "Healing Word", "Heat Metal", "Heightened Focus", "Hex", "Hold Monster", "Hold Person",
  "Holy Water", "Hunter's Mark", "Ice Storm", "Javelin", "Jump", "Lay on Hands", "Lightning Bolt", "Longstrider", "Magic Missile",
  "Magic Weapon", "Misty Step", "Monk's Focus", "Moonbeam", "Net", "Oil", "Patient Defense", "Prismatic Spray", "Prismatic Wall",
  "Rage", "Ray of Enfeeblement", "Ray of Frost", "Resilient Sphere", "Scorching Ray", "Searing Smite", "Second Wind", "Shatter",
  "Shield", "Sleep", "Sneak Attack", "Spear", "Spirit Guardians", "Spiritual Weapon", "Step of the Wind", "Sunbeam", "Sunburst",
  "Thunderwave", "Trident", "Vampiric Touch", "Wall of Fire", "Wall of Force", "Wall of Stone", "Warding Bond", "Whip", "Wild Shape"
]);

const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
const note = (...parts) => parts.filter(Boolean).join(" ");
function direction(row, activity) {
  const name = row.source.name;
  const activityName = activity.name ?? "";
  const lower = activityName.toLowerCase();
  const shape = activity.target?.template?.type;
  const self = activity.target?.affects?.type === "self";
  const isFollowup = /lingering|additional|retaliation|reheat|scorch object|bonus .*damage|on damage|hold onto|burn save|start of turn|entry|enter save|emanation save|failed teleport|lethargy|enfeeblement save/.test(lower);
  const result = {
    uuid: row.uuid, activityId: activity._id, name, edition: row.edition, activityName,
    trigger: activity.type === "attack" ? "attack" : ["damage", "heal"].includes(activity.type) ? "damage" : shape ? "template" : "use",
    delivery: activity.type === "attack" ? "projectile" : ["heal", "enchant", "utility"].includes(activity.type) ? "buff" : activity.type === "summon" ? "summon" : shape ? "area" : "local",
    theme: "arcane", origin: self ? "caster" : "caster", targeting: self ? "self" : shape ? "native-area" : "selected-targets",
    motion: "cast-gesture", followup: isFollowup, notes: "Respect the effective native activity and selected targets."
  };
  const set = values => Object.assign(result, values);
  const local = (theme, notes, extra = {}) => set({delivery:"local", theme, origin:"target", motion:"none", notes, ...extra});
  const buff = (theme, notes, extra = {}) => set({delivery:"buff", theme, motion:"none", notes, ...extra});
  const beam = (theme, notes, extra = {}) => set({delivery:"beam", theme, notes, ...extra});
  const area = (theme, notes, extra = {}) => set({delivery:"area", theme, targeting:"native-area", notes, ...extra});
  const contact = (theme, notes, extra = {}) => set({delivery:"contact", theme, motion:"reach-small", notes, ...extra});
  switch (name) {
    case "Magic Missile":
      set({delivery:"projectile",theme:"force",counts:{base:3,perSlotAboveBase:1,baseSlotLevel:1,simultaneousArrival:true,splitAcrossTargets:true},notes:"Three separate force darts at first level, assigned across targets; all arrive together. Increase total darts by slot level, not per target."}); break;
    case "Eldritch Blast":
      beam("force", "Render one beam for each native attack roll. The 2/3/4 beams at character levels 5/11/17 are separate attacks, not an automatic fan on every roll.", {counts:{perAttackRoll:1,characterLevelThresholds:[5,11,17]}}); break;
    case "Scorching Ray":
      if (activity.type === "attack") beam("fire", "One fiery ray per native attack roll; three rays plus one per higher slot are separate attacks.", {counts:{perAttackRoll:1,base:3,baseSlotLevel:2,perSlotAboveBase:1}});
      else buff("fire", "Caster release cue only. Separate ray attacks produce their own ray; do not launch three rays from this resource activity.", {delivery:"resource",targeting:"self",origin:"caster"}); break;
    case "Chain Lightning":
      beam("lightning", "Caster to first selected target, then fan from that first target to up to three other targets within 30 feet. D&D does not use PF2e sequential target hops.", {targeting:"first-target-fan",counts:{baseTargets:4,secondaryTargets:3,perSlotAboveBase:1,baseSlotLevel:6,secondaryRangeFeet:30}}); break;
    case "Chromatic Orb":
      set({delivery:"projectile",theme:"chosen-element",elementChoices:["acid","cold","fire","lightning","poison","thunder"],notes:"Chosen elemental orb with matched launch and impact. 2024 bounce is conditional on equal damage-die results and a new target choice; never force a bounce on every cast.",counts:{base:1,conditionalBounce:true,perAttackRoll:1}}); break;
    case "Disintegrate": beam("force", "A thin GREEN ray followed by a dissolving target accent. Do not hide or delete the target unless native consequences actually remove it.", {colors:["green"]}); break;
    case "Ray of Frost": beam("cold", "Blue-white frost beam with brief cold impact; visible continuous ray, not an orb or impact-only cue.", {colors:["blue","white"]}); break;
    case "Ray of Enfeeblement":
      if (isFollowup) local("necrotic", "Existing enfeeblement save: target weakening cue only, no repeated launch.");
      else beam("necrotic", "Black/dark weakening ray. 2014 uses an attack; 2024 uses a save. Keep the ray visual for either native activity.", {colors:["black","purple"]}); break;
    case "Guiding Bolt": set({delivery:"projectile",theme:"radiant",notes:"Bright streak to target then a lingering luminous accent; illumination follows native effect application.",colors:["gold","white"]}); break;
    case "Chill Touch":
      if (row.edition === "2014") local("necrotic", "Ghostly skeletal hand appears around the target at range. The legacy ranged attack does not require a traveling projectile.");
      else contact("necrotic", "2024 is a melee necrotic touch; dark contact hand cue rather than the legacy remote hand."); break;
    case "Acid Arrow":
      if (activity.type === "damage") local("acid", "Lingering acid tick on the target only; no second arrow flight.", {followup:true});
      else set({delivery:"projectile",theme:"acid",notes:"Green acidic arrow travels to target, then wet corrosive splash. Handle miss damage using native results rather than hiding all splash automatically.",colors:["green"]}); break;
    case "Acid": set({delivery:"projectile",theme:"acid",motion:"throw-small",notes:"Thrown vial lands and produces an acid splash on the target. 2024 native action uses a Dexterity save rather than an attack roll."}); break;
    case "Alchemist's Fire": set({delivery:"projectile",theme:"fire",motion:"throw-small",notes:"Thrown flask shatters into adhesive flame on the target; native burning ActiveEffect owns any persistent loop. Legacy attack and modern save use the same flask-to-flame semantics."}); break;
    case "Holy Water": set({delivery:"projectile",theme:"radiant",motion:"throw-small",notes:"Thrown vial with pale holy-water splash on target; damage eligibility belongs to native fiend/undead rules. No generic fire explosion."}); break;
    case "Oil":
      if (/douse/.test(lower)) local("oil", "Douse space with an unlit slick/coating cue. Oil does not ignite merely because its conditional damage activity is used.", {targeting:"native-area",requiresIgnitionEvent:true});
      else set({delivery:"projectile",theme:"oil",motion:"throw-small",notes:"Thrown UNLIT oil coating. A later fire event may ignite it; do not attach a fireball to the default throw.",requiresIgnitionEvent:true}); break;
    case "Net":
      if (activity.type === "save" && row.edition === "2014") local("restraint", "Existing net escape save: short binding accent, not a second net throw.", {followup:true});
      else set({delivery:"projectile",theme:"restraint",motion:"throw-small",notes:"Net flight followed by binding mesh; no damage slash. 2014 uses weapon attack, 2024 uses Dexterity save."}); break;
    case "Dagger": case "Handaxe": case "Javelin": case "Spear": case "Trident":
      set({delivery:"weapon-mode",theme:"physical",motion:"native-attack-mode",modes:["melee","thrown"],notes:"Contact attack in melee; recognizable weapon flight when native roll options.attackMode starts with thrown. Do not select flight merely from the item's thrown property."}); break;
    case "Whip": contact("physical", "Flexible reach lash followed by localized contact; preserve reach without treating the whip as an arrow.", {motion:"lash-small"}); break;
    case "Lightning Bolt": area("lightning", "Visible source-to-end LINE through native region; no separate missiles to every creature.", {delivery:"line",motion:"release-gesture"}); break;
    case "Burning Hands": area("fire", "Cone of flame from caster hands matching native cone orientation; target impacts are secondary.", {delivery:"cone",motion:"release-gesture"}); break;
    case "Cone of Cold": area("cold", "Wide cone of frost from caster, with icy target accents after the cone.", {delivery:"cone",motion:"release-gesture"}); break;
    case "Fireball": area("fire", "Small launch streak to selected native area point, then expanding fire explosion. Scale explosion from area diameter rather than token size.", {delivery:"projectile-area",motion:"release-gesture"}); break;
    case "Thunderwave": area("thunder", "Caster-adjacent native cube receives an outward pressure wave; no forced victim displacement before native results.", {delivery:"cube",motion:"brace-small"}); break;
    case "Shatter": area("thunder", "Sharp pressure/cracking burst centered on the native sphere; avoid a caster projectile."); break;
    case "Ice Storm": area("cold", "Hail falls into the native cylinder with icy impacts; no horizontal caster missiles.", {origin:"above-area",delivery:"falling-area"}); break;
    case "Call Lightning":
      if (activity.type === "utility") area("lightning", "Conjure storm cloud at the native cylinder; selected strike activities create their own vertical bolt.", {delivery:"cloud",origin:"above-area"});
      else area("lightning", "Vertical lightning from storm cloud to chosen ground point, not a beam from the caster. Repeated damage/strike does not re-create the cloud.", {delivery:"vertical-strike",origin:"above-area",followup:row.edition==="2024" && activity.type==="damage"}); break;
    case "Moonbeam":
      if (/burn/.test(lower)) local("radiant", "Creature in the existing moonbeam receives a pale burn cue only; no new horizontal ray.", {followup:true});
      else area("radiant", "Vertical silver/pale lunar column at native cylinder, with gentle falloff. Move activity relocates the existing beam without a caster missile.", {delivery:"column",origin:"above-area",colors:["white","silver"],followup:/move/.test(lower)}); break;
    case "Sunbeam":
      if (activity.type === "utility") buff("radiant", "Create a caster-held mote cue; the Line of Radiance activity owns the actual beam.", {delivery:"resource",targeting:"self"});
      else area("radiant", "Bright sun ray through the native LINE, with a radiant/blinding accent. Later sunbeam activity emits one new line without repeating initial charge.", {delivery:"line",followup:/new sunbeam/.test(lower),colors:["gold","white"]}); break;
    case "Sunburst": area("radiant", "Large spherical sunlight burst at area center, not the narrow Sunbeam line.", {colors:["gold","white"]}); break;
    case "Prismatic Spray":
      if (/indigo|violet|^[1-7]\./i.test(activityName)) local(/indigo/.test(lower)?"petrification":/violet/.test(lower)?"blindness":"chosen-element", "Selected color's consequence/save on target only; do not re-cast the complete spray from a followup save.", {followup:true,colors:colors.filter(c=>lower.includes(c))});
      else area("prismatic", "Description specifies EIGHT rays in a cone. Seven named colors plus special double-ray result; native table/save determines target consequences.", {delivery:"ray-fan",colors,counts:{visualRays:8,colorFamilies:7},outcomeTable:"Compendium.dnd5e.tables24.RollTable.phbPrismaticRays"}); break;
    case "Prismatic Wall":
      if (activity.type === "save") local("prismatic", "Existing wall's blinding, traversal, or color-layer save; target-only consequence accent, never another complete wall.", {followup:true});
      else area("prismatic", "Seven separate colored layers in native wall or globe geometry. Do not replace rectangular panels with ring footage.", {delivery:/sphere|globe/.test(lower)?"barrier-sphere":"wall",colors,counts:{layers:7},outcomeTable:"Compendium.dnd5e.tables24.RollTable.phbPrismaticLaye"}); break;
    case "Wall of Fire":
      if (activity.type === "damage") local("fire", "Contact with existing wall: target flame lick only, not another wall placement.", {followup:true});
      else area("fire", "Fiery barrier follows the native wall/ring geometry, height, and selected hot side.", {delivery:/ring/.test(lower)?"ring":"wall"}); break;
    case "Wall of Force": area("force", "Translucent force barrier follows native panel or sphere geometry. No fake damage impact.", {delivery:/sphere|globe|hemispherical/.test(lower)?"barrier-sphere":"wall",motion:"none"}); break;
    case "Wall of Stone": area("earth", "Raise stone panels matching native dimensions; trapping save does not imply a projectile hit.", {delivery:"wall",motion:"brace-small"}); break;
    case "Resilient Sphere": set({delivery:"barrier-sphere",theme:"force",origin:"target",motion:"none",notes:"Protective/containment force sphere encloses the selected target, scaled to its footprint; no missile or explosion."}); break;
    case "Fire Shield":
      if (activity.type === "damage") local("chosen-element", "Retaliation damage on the attacking creature only; preserve warm fire/chill cold choice and do not re-cast self shield.", {followup:true,elementChoices:["fire","cold"]});
      else buff("chosen-element", "Wispy self shield in warm fire or chill cold colors. Native chosen shield effect owns persistence and resistance.", {elementChoices:["fire","cold"],targeting:"self",origin:"caster"}); break;
    case "Flame Blade":
      if (activity.type === "attack") contact("fire", "Contact strike using a fiery blade; no ranged projectile.");
      else buff("fire", "Evoke/enchant a held fiery blade; no attack or target damage on weapon creation.", {origin:"caster",targeting:"self"}); break;
    case "Magic Weapon": buff("arcane", "Enchantment shimmer on the chosen weapon/wielder. No swing or impact merely for granting magic.", {origin:"target"}); break;
    case "Heat Metal": local("fire", "Red-hot metallic target glow. Reheat/scorch is a target pulse; hold/on-damage saves do not create another launched attack.", {colors:["red","orange"],followup:!/cast/.test(lower)}); break;
    case "Bless": buff("radiant", "Separate gentle blessing pulse on each selected ally; native ActiveEffect controls ongoing marker.", {origin:"target",colors:["gold"]}); break;
    case "Bane": buff("curse", "Subtle dark burden around each selected victim; save results control lasting native effect.", {origin:"target",colors:["purple"]}); break;
    case "Hex":
      if (activity.type === "damage") local("necrotic", "Bonus hex damage on already-hit target only; no second launch.", {followup:true});
      else buff("curse", "Place or relocate a dark curse mark to the chosen target. Relocation does not imply another damaging attack.", {origin:"target",followup:/new creature/.test(lower)}); break;
    case "Hunter's Mark":
      if (activity.type === "damage") local(row.edition==="2024"?"force":"physical", "Bonus mark damage accents the already-hit quarry; no second weapon swing or flight.", {followup:true});
      else buff("nature", "Quarry mark appears on the target; move-mark activity moves the same mark without damage.", {origin:"target",followup:/move/.test(lower)}); break;
    case "Hold Person": case "Hold Monster": buff("restraint", "Arcane binding/paralysis accent around selected target; keep duration tied to actual native effect, not casting intent.", {origin:"target"}); break;
    case "Sleep": area("sleep", "Soft settling motes in the selected native sphere; native roll/save resolves actual sleeping creatures. Avoid automatically making every selected actor unconscious.", {motion:"none"}); break;
    case "Haste":
      if (/lethargy/.test(lower)) local("slow", "Haste ended: sluggish/lethargic cue, not another speed buff.", {followup:true});
      else buff("speed", "Accelerating aura on target. Granting extra actions does not automatically move or attack with the token.", {origin:"target",motion:"subtle-pulse"}); break;
    case "Jump": buff("mobility", "Springlike upward accent on affected target; grant jumping capability without automatically moving its document.", {origin:"target",motion:"hop-illustrative"}); break;
    case "Longstrider": buff("speed", "Ground-level stride motes on target; this grants speed, not an actual forced charge.", {origin:"target",motion:"subtle-pulse"}); break;
    case "Fly": buff("flight", "Lift/airflow cue on target; native actor effects grant flight. No arbitrary canvas movement or persistent fake altitude.", {origin:"target",motion:"lift-illustrative"}); break;
    case "Misty Step": set({delivery:"teleport",theme:"mist",targeting:"self",origin:"caster",motion:"native-teleport-cue",notes:"Silvery mist disappearance and arrival cue follow native chosen teleport destination. Native activity owns token movement."}); break;
    case "Dimension Door":
      if (activity.type === "damage") local("force", "Failed teleport damage pulse only; do not vanish or move participants again.", {followup:true});
      else set({delivery:"teleport",theme:"arcane",motion:"native-teleport-cue",notes:"Departure/arrival portal cue for caster and chosen companion; native activity owns actual destination and movement."}); break;
    case "Dancing Lights": set({delivery:"summon",theme:"light",motion:"none",notes:/move/.test(lower)?"Move existing lights; do not re-create a full cast or projectile.":"Manifest up to four small lights at chosen positions, optionally combined into a humanoid shape; do not imply damage.",counts:{max:4},followup:/move/.test(lower)}); break;
    case "Spiritual Weapon": set({delivery:"summon",theme:"radiant",motion:"none",notes:/move|command/.test(lower)?"Command/move the existing spiritual weapon. Its actual attack resolves separately from this utility cue.":"Manifest a floating chosen weapon at the selected space. Do not make the caster lunge or infer a hit on summoning.",followup:/move|command/.test(lower)}); break;
    case "Spirit Guardians":
      if (row.edition === "2014" && activity.type === "save") local("chosen-element", "Entry/turn save inside existing guardians: target spectral pulse only, not another summoning or caster missile.", {followup:true,elementChoices:["radiant","necrotic"]});
      else area("chosen-element", "Spectral spirits surround caster in a 15-foot area. Choose radiant or necrotic from native casting choice; native effect owns persistent aura.", {delivery:"aura",origin:"caster",motion:"none",elementChoices:["radiant","necrotic"]}); break;
    case "Vampiric Touch":
      if (activity.type === "attack") contact("necrotic", "Melee shadow contact then victim-to-caster life-intake accent; no caster-to-victim missile.", {secondaryDirection:"target-to-caster"});
      else buff("necrotic", "Charge the caster's grasping hand; later native touch attack owns contact and life intake.", {delivery:"resource",targeting:"self"}); break;
    case "Animate Dead": set({delivery:/reassert/.test(lower)?"buff":"summon",theme:"necrotic",motion:"none",origin:"target",notes:/reassert/.test(lower)?"Reassert control over existing undead; no new body or raising animation.":"Animate selected remains into undead; bones and corpse can require different manifestation cues, native summon owns created actor.",followup:/reassert/.test(lower)}); break;
    case "Animate Objects": set({delivery:"summon",theme:"arcane",motion:"none",origin:"target",notes:"Animate chosen inanimate objects with rising/shimmer cue; do not substitute generic summoned humanoids or attack on creation."}); break;
    case "Conjure Animals":
      if (row.edition === "2024" && activity.type === "save") local("nature", "Existing spectral pack's area attack/save pulse; no new summon at caster.", {followup:true});
      else set({delivery:"summon",theme:"nature",motion:"none",notes:row.edition==="2014"?"Summon independent fey animal creatures at native chosen spaces; no automatic attacks.":"Manifest a Large spectral animal pack at selected space. Avoid insisting it is one particular animal; modern spell is not the legacy multi-creature summon."}); break;
    case "Conjure Minor Elementals":
      if (activity.type === "damage") local("chosen-element", "Bonus attack damage on already-hit target only; no new summoning or projectile.", {followup:true,elementChoices:["acid","cold","fire","lightning"]});
      else set({delivery:row.edition==="2024"?"aura":"summon",theme:"chosen-element",motion:"none",origin:row.edition==="2024"?"caster":"target",targeting:row.edition==="2024"?"self":"selected-space",notes:row.edition==="2024"?"Elemental 15-foot aura around caster grants chosen bonus damage; it does not summon separate creatures.":"Legacy spell summons multiple independent minor elementals; no bonus-damage aura substitution.",elementChoices:["acid","cold","fire","lightning"]}); break;
    case "Conjure Woodland Beings":
      if (/disengage/.test(lower)) buff("mobility", "Disengage option: self movement-readiness cue only, no new woodland summon.", {delivery:"resource",targeting:"self",followup:true});
      else if (/emanation save/.test(lower)) local("force", "Existing 10-foot woodland emanation target pulse; no new summon.", {followup:true});
      else set({delivery:row.edition==="2024"?"aura":"summon",theme:"nature",motion:"none",origin:row.edition==="2024"?"caster":"target",notes:row.edition==="2024"?"Spectral woodland beings circle caster in a 10-foot emanation; not legacy independent summoned fey.":"Summon independent fey creatures in native selected spaces; do not auto-attack on cast."}); break;
    case "Conjure Elemental": set({delivery:activity.type==="utility"?"resource":"summon",theme:"chosen-element",motion:"none",notes:row.edition==="2024"?"Large intangible chosen elemental spirit at native space: air/lightning, earth/thunder, fire/fire, or water/cold. Avoid always using fire.":"Summon native chosen elemental creature; cast preparation and summon placement are distinct activities.",elementChoices:["air","earth","fire","water"]}); break;
    case "Cure Wounds": contact("healing", "Touch-range healing flourish on selected recipient; no ranged healing bolt.", {motion:"reach-small"}); break;
    case "Healing Word": local("healing", "Remote spoken blessing and bright healing pulse on recipient; not a touch lunge or weapon-like healing ray."); break;
    case "Aid": buff("healing", "Bolstering protective pulse on up to three allies; native max/current Hit Point increase differs from a damaging multi-projectile.", {origin:"target",counts:{maxTargets:3}}); break;
    case "Warding Bond": buff("protection", "Gentle caster-to-willing-target protective link; shared harm follows native rules, not an attack at casting.", {delivery:"connection",secondaryDirection:"caster-to-target"}); break;
    case "Counterspell": local("disruption", "Interrupting disruption around the selected enemy caster. Do not imply its spell definitely failed without native outcome."); break;
    case "Shield": buff("protection", "Self barrier for spell; protective wearer cue for monster shield feature. Passive equipment shield has no action animation.", {origin:"caster",targeting:"self",motion:"brace-small"}); break;
    case "Searing Smite":
      if (activity.type === "save") local("fire", "Existing smite's start-of-turn burning save: smoldering victim cue only.", {followup:true});
      else local("fire", "Fire accent on an already-landed weapon strike; do not launch another attack or missile.", {followup:true}); break;
    case "Divine Smite": local("radiant", "Radiant strike accent on the already-hit victim. Extra unholy-creature damage is a rider; never replay the full weapon attack.", {followup:true}); break;
    case "Sneak Attack": local("physical", "Precise extra damage accent on already-hit target; no repeated full attack or new projectile.", {followup:true}); break;
    case "Second Wind": buff("healing", "Self recovery breath and healing pulse; no targeted attack.", {targeting:"self",origin:"caster",motion:"breath-small"}); break;
    case "Lay on Hands":
      if (activity.type === "heal") contact("healing", "Gentle golden touch healing on recipient; native pool determines healing amount.");
      else contact("cleanse", "Cleanse poison/disease as applicable to edition; no pretend Hit Point healing from a cleanse-only use.", {motion:"none"}); break;
    case "Rage": buff("primal", "Self primal empowerment, not an injury effect. Use one readable activation pulse and quiet native-effect-owned duration aura.", {targeting:"self",motion:"brace-small"}); break;
    case "Action Surge": buff("resolve", "Self burst of resolve/readiness; extra action is not an automatic extra attack.", {delivery:"resource",targeting:"self",motion:"brace-small"}); break;
    case "Flurry of Blows": contact("physical", "Two illustrative unarmed beats. Native utility grants later attacks; do not assert both hit or duplicate future individual attack rolls.", {targeting:"chosen-opponent-or-self",motion:"two-beat-strike",counts:{illustrativeBeats:2,actualAttackResults:false}}); break;
    case "Patient Defense": buff("defense", "Self evasive guard cue; Dodge/Disengage grant is not forced victim movement.", {targeting:"self",motion:"guard-small"}); break;
    case "Step of the Wind": buff("mobility", "Self wind/stride cue for chosen Dash or Disengage and jump boost; native chosen movement owns destination.", {targeting:"self",motion:"wind-step-small"}); break;
    case "Monk's Focus":
      if (/flurry/.test(lower)) contact("physical", "Two illustrative unarmed beats; future native attack rolls still own actual hits.", {motion:"two-beat-strike",counts:{illustrativeBeats:2,actualAttackResults:false}});
      else if (/patient/.test(lower)) buff("defense", /focus point/.test(lower)?"Focus point option grants Dodge and Disengage: guarded evasive cue.":"No-focus Patient Defense grants Disengage only; do not imply Dodge.", {targeting:"self",motion:"guard-small"});
      else buff("mobility", "Wind-step Dash cue; focus spending adds Disengage and stronger jump. Native movement owns actual destination.", {targeting:"self",motion:"wind-step-small"}); break;
    case "Heightened Focus":
      if (/flurry/.test(lower)) contact("physical", "Three illustrative unarmed beats, distinct from base Monk's Focus two. Actual later hits remain native attack rolls.", {motion:"three-beat-strike",counts:{illustrativeBeats:3,actualAttackResults:false}});
      else buff("defense", "Heightened Patient Defense adds temporary Hit Point protection; use guard plus protective pulse, not ordinary healing.", {targeting:"self",motion:"guard-small"}); break;
    case "Cunning Action": buff(/hide/.test(lower)?"stealth":"mobility", /hide/.test(lower)?"Hide readiness/soft shadow cue, not automatic invisibility.":/disengage/.test(lower)?"Evasive Disengage cue, distinct from Dash.":/dash/.test(lower)?"Quick Dash readiness cue; native movement owns actual travel.":"Native generic choice unspecified: conservative agility/readiness cue, no invented destination.", {delivery:"resource",targeting:"self",motion:/hide/.test(lower)?"none":/disengage/.test(lower)?"evade-small":"stride-small"}); break;
    case "Channel Divinity":
      if (/heal/.test(lower)) local("healing", "Divine Spark healing pulse on chosen creature; not necrotic damage.");
      else if (/spark/.test(lower)) local("chosen-element", "Divine Spark selected radiant/necrotic target pulse.", {elementChoices:["radiant","necrotic"]});
      else if (/turn undead/.test(lower)) area("radiant", "Holy outward rebuke around caster; native failed saves apply turning. No forced fleeing before outcome.", {delivery:"aura",origin:"caster"});
      else if (/divine sense/.test(lower)) buff("reveal", "Self sense/reveal pulse; visual must not disclose unknown creature locations.", {targeting:"self"});
      else buff("divine", "Generic channel resource counter: restrained holy readiness cue. Do not assume Turn Undead or Divine Spark from the parent counter alone.", {delivery:"resource",targeting:"self"}); break;
    case "Channel Divinity: Turn Undead": area("radiant", "Outward holy rebuke in a 30-foot caster area; actual native failed saves control turned effects and fleeing.", {delivery:"aura",origin:"caster",motion:"brace-small"}); break;
    case "Breath Weapon": area("chosen-element", "Chosen ancestry element breath follows native cone or line option, not an impact-only cue.", {delivery:shape==="line"?"line":"cone",elementChoices:["acid","cold","fire","lightning","poison"],motion:"breath-small"}); break;
    case "Wild Shape": buff("nature", "Nature transformation cue around caster. Native chosen form/transform activity owns actual actor and token changes; do not invent a wolf form.", {delivery:"transform",targeting:"self",motion:"transform-cue"}); break;
  }
  if (activity.type === "cast") {
    set({trigger:"use",delivery:"delegate",origin:"caster",targeting:"self",motion:"none",notes:note(result.notes,"This activity casts a linked spell: delegate full flight/payload to that spell's native activity; never play the full animation twice."),delegatesToNativeSpell:activity.spell?.uuid ?? null});
  }
  if (!activity.activation?.type && activity.type === "utility") {
    result.trigger = "manual";
    result.notes = note(result.notes,"No native activation on this utility; avoid automatically playing passive benefit text.");
  }
  return result;
}

export async function buildDnd5eNativeDirections() {
  const source = await dnd5eSources();
  const rows = source.rows.filter(row => reviewedNames.has(row.source.name));
  if (rows.length !== 184) throw new Error(`Pinned manual-review inventory drifted: ${rows.length} rows; re-review before regenerating.`);
  const directions = rows.flatMap(row => row.effectiveActivities.map(activity => direction(row, activity)));
  const data = {
    schemaVersion:1, sourceSha:DND5E_SOURCE_SHA, scope:"Public D&D5e 6.0.5 SRD source documents manually reviewed; native descriptions may contain inline widgets and linked table references.",
    reviewedRows:rows.map(row => ({uuid:row.uuid,name:row.source.name,edition:row.edition,path:row.path,descriptionChars:row.description.length,reviewBasis:row.description.length?"full-native-description-and-activity-data":"native-weapon-properties-empty-description"})),
    reviewedTables:[
      {uuid:"Compendium.dnd5e.tables24.RollTable.phbPrismaticRays",path:"packs/_source/tables24/spells/prismatic-rays.yml"},
      {uuid:"Compendium.dnd5e.tables24.RollTable.phbPrismaticLaye",path:"packs/_source/tables24/spells/prismatic-layers.yml"}
    ],
    directions
  };
  await writeFile(new URL("../data/dnd5e-native-directions.json",import.meta.url),JSON.stringify(data,null,2)+"\n");
  return data;
}

if (process.argv[1]?.replaceAll("\\","/").endsWith("tools/build-dnd5e-native-directions.mjs")) {
  const data=await buildDnd5eNativeDirections();
  console.log(JSON.stringify({reviewedRows:data.reviewedRows.length,nativeProseRows:data.reviewedRows.filter(row=>row.descriptionChars).length,directions:data.directions.length,linkedTables:data.reviewedTables.length}));
}
