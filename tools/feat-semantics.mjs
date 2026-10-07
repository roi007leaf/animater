import { createHash } from "node:crypto";

export function plainFeatDescription(html = "") {
  // PF2e formula tags contain nested [damage types] and [template options].
  // A non-greedy bracket regex silently erased delivery and leaked formulas.
  const text=String(html);let output="",cursor=0;
  while(cursor<text.length){
    const match=/@([A-Za-z]+)\[/.exec(text.slice(cursor));
    if(!match){output+=text.slice(cursor);break;}
    const start=cursor+match.index;output+=text.slice(cursor,start);
    let end=start+match[0].length,depth=1;
    while(end<text.length&&depth){if(text[end]==="[")depth++;else if(text[end]==="]")depth--;end++;}
    if(depth){output+=text.slice(start);break;}
    const content=text.slice(start+match[0].length,end-1),label=/^\{([^}]+)\}/.exec(text.slice(end));
    if(label){output+=label[1];end+=label[0].length;}
    else if(match[1]==="UUID")output+=content.split(".Item.").at(-1).replaceAll("-"," ");
    else if(match[1]==="Template")output+=`${content.split("|")[0]} area template ${content.split("|").slice(1).join(" ").replaceAll(":"," ")}`;
    else if(match[1]==="Check")output+=`${content.split("|")[0]} check`;
    else if(match[1]==="Damage")output+=`damage ${[...new Set(content.match(/\b(?:acid|bleed|bludgeoning|cold|electricity|fire|force|healing|mental|piercing|poison|slashing|sonic|spirit|vitality|void)\b/g)??[])].join(" ")}`;
    else output+=content.replace(/[|:[\]{}]/g," ");
    cursor=end;
  }
  return output.replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&#(?:39|x27);/g,"'")
    .replace(/&quot;/g,'"').replace(/\s+/g," ").trim();
}

export function classifyFeat(item) {
  const s = item.system ?? {}, activity = s.actionType?.value;
  const description = plainFeatDescription(s.description?.value);
  const hash = createHash("sha256").update(s.description?.value ?? "").digest("hex");
  const evidence = `${activity ?? "missing"}:${s.actions?.value ?? "null"}`;
  if (["action", "reaction", "free"].includes(activity)) return {
    included: true, classification: "native-active", descriptionHash: hash,
    reason: `Native actionType ${evidence}; animation follows this feat's own chat card.`,
  };
  // Grants and skill modifiers are not activities. A visible amount of time is
  // review evidence only; sending these passive parent cards must stay inert.
  const grant = /\b(?:you gain|you learn|you can cast|grants? you)\b/i.test(description) &&
    /\b(?:feat|spell|focus|cantrip|reaction|action)\b/i.test(description);
  const embedded = /\b(?:spend|spending|take|taking|perform|performing)\b.{0,55}\b(?:minutes?|hours?|days?|activity|actions?)\b|<span[^>]*action-glyph|\bexploration\s+(?:activity|action)\b/i.test(s.description?.value ?? "");
  return {
    included: false, classification: grant ? "passive-grant" : embedded ? "passive-embedded-activity-review" : "native-passive",
    descriptionHash: hash,
    reason: grant ? "Passive feat grants or enhances a separate action/spell; animate the granted item instead."
      : embedded ? "Native passive feat contains a possible embedded activity; no unambiguous own activation. Excluded for review."
        : `Native ${activity ?? "missing actionType"}; passive benefit has no own activation.`,
  };
}

// Each authored entry is tied to the complete description, not a name-only
// elemental guess. Rules outcomes remain PF2e decisions; these are visual cues.
export const AUTHORED_FEATS = {
  "aether-beam": ["ray", "force", "An aether beam fires along a line: source gathers energy → continuous directed beam → target contact. Selected-target endpoint approximates the line footprint; customize exact placement."],
  "alchemical-shot": ["alchemicalShot", "weapon", "Load alchemical bomb contents then Strike with firearm: liquid loading cue → physical firearm shot → target impact. Bomb energy type is chosen in play; customize elemental finish."],
  "sudden-charge": ["charge", "weapon", "Stride twice, then melee Strike: cosmetic sprint afterimage → settled lunge → contact. Actual Strides remain player movement."],
  "vicious-swing": ["heavyStrike", "weapon", "One deliberately powerful melee blow: wind-up → broad slash → weighty contact. Extra damage is not additional visual strikes."],
  "power-attack": ["heavyStrike", "weapon", "Legacy powerful single melee blow; charge and one weighty impact, not a projectile barrage."],
  "double-slice": ["doubleStrike", "weapon", "Two melee weapons attack the same foe: two offset opposing slashes → combined finish. Target one foe."],
  "intimidating-strike": ["fearStrike", "fear", "Melee contact precedes confidence-shattering fear cue; fright is conditional on PF2e's hit and damage result."],
  "battle-medicine": ["medicine", "healing", "Patch wounds using healer's toolkit: restrained target healing bloom, no divine beam or automatic wound removal."],
  "shield-block": ["shield", "ward", "Raised shield snaps into a defensive barrier → physical contact spark at the defender; no displaced token."],
  "reactive-strike": ["strike", "weapon", "A melee counterattack against the provoking creature, played only when this reaction's own feat card is sent."],
  "deflecting-wave": ["waveGuard", "water", "Water cascade at the defender → water shield → dispersing splash. No attack ray is emitted."],
  "flying-flame": ["flamePath", "fire", "Tiny flame flies through a chosen path. Visual hops follow targeted order, with each arrival flaming; this is a route approximation, not a straight caster fan."],
  "fresh-produce": ["produce", "plant", "Produce grows in chosen creature's hand or at its feet; growth cue only. Eating and healing happen later as a separate Interact."],
  "timber-sentinel": ["sentinel", "plant", "A tree appears to intercept Strikes: ground roots → rising tree-like growth → ward. Tree imagery is symbolic; no summoned actor created."],
  "ocean's-balm": ["waterHeal", "water", "A touched ally receives soothing water and healing bloom; flowing target aura replaces a projectile."],
  "oceans-balm": ["waterHeal", "water", "A touched ally receives soothing water and healing bloom; flowing target aura replaces a projectile."],
  "four-winds": ["windMove", "wind", "Winds speed allied movement: target wind halo and short cosmetic lift. PF2e Strides and destinations remain player choices."],
  "hail-of-splinters": ["splinterCone", "plant", "Wood shards erupt in a cone; localized splinter accents approximate the directional fan until an exact authored cone is configured."],
  "aerial-boomerang": ["boomerang", "wind", "Air blade flies outward and returns; forward flight → target wind sweep → reverse return effect. Line path is symbolic."],
  "tumbling-strike": ["tumbleStrike", "weapon", "Tumble through a foe's space, then Strike: cosmetic spinning afterimage → melee contact. Does not perform Acrobatics or move documents."],
  "twin-takedown": ["doubleStrike", "weapon", "Two attacks with different weapons against hunted prey: paired opposing melee slashes. Does not choose or mark prey."],
  "twin-feint": ["feintStrike", "weapon", "Two melee attacks, first distracting: pale opening slash → stronger second slash → brief target distraction marker."],
  "snagging-strike": ["bindStrike", "weapon", "Strike then restrict escape: melee slash → restrained target ring. Off-guard and movement rules remain PF2e."],
  "knockdown": ["tripStrike", "weapon", "Melee Strike followed by Trip: slash → low ground contact → restrained tilt/shake cue. Does not rotate token flat or set prone."],
  "slam-down": ["tripStrike", "weapon", "Melee Strike followed by Trip: slash → low ground contact; cosmetic target recoil only, no automatic prone."],
  "combat-grab": ["bindStrike", "weapon", "Attack while grabbing: melee contact → attached restraint pulse. Does not grab or set conditions."],
  "dazzling-display": ["display", "fear", "Weapon flourishes intimidate observers: source weapon circle → fear cues at selected observers; no weapon projectile."],
  "scare-to-death": ["dread", "fear", "Powerful intimidation: source threat → target dread aura → dark target pulse, never a guaranteed death animation."],
  "bon-mot": ["taunt", "mind", "A cutting quip rattles a foe: speaking cue → target dizzy/mental pulse; no physical hit or movement."],
  "quick-draw": ["drawStrike", "weapon", "Draw a weapon and Strike: brief source glint → weapon contact. No magic charge loop."],
  "whirlwind-strike": ["whirlwindStrike", "weapon", "Melee Strikes against nearby foes: source whirling slash and ordered selected-target contacts, not missile flights."],
  "felling-strike": ["heavyStrike", "weapon", "One grounded melee strike and weighted contact; cosmetic feedback never drops a flying target mechanically."],
  "blazing-wave": ["elementCone", "fire", "Fan of flame sweeps ahead: caster flame rise → selected-target fire impacts. Cone footprint is symbolic without an authored area."],
  "winter-sleet": ["elementAura", "cold", "Sleet surrounds the kineticist: finite icy ground aura, no bolts. This cue does not maintain a persistent mechanical aura."],
  "thermal-nimbus": ["elementAura", "fire", "Temperature emanates around source: finite source heat aura, no target projectile; thermal option requires customization."],
  "safe-elements": ["targetGuard", "ward", "Exclude selected allies from impulses: gentle target protective halos, never damage impacts."],
};

export function analyzeFeat(item, path) {
  const s = item.system, name = item.name, slug = s.slug ?? path.split("/").at(-1).replace(/\.json$/, "");
  const text = plainFeatDescription(s.description?.value), traits = s.traits?.value ?? [];
  const lower = text.toLowerCase();
  // Mechanical headers are not effect art (an enemy's fire attack should not
  // make a mundane defensive reaction a fire spell).
  const body = (s.description?.value ?? "").replace(/<p>\s*<strong>(?:Trigger|Requirements|Prerequisites|Frequency|Cost)<\/strong>[\s\S]*?<\/p>/gi, "");
  const visual = plainFeatDescription(body).toLowerCase();
  const authored = AUTHORED_FEATS[slug] ?? AUTHORED_FEATS[slug.replace(/-legacy$/, "")];
  let theme = authored?.[1] ?? ["fire", "cold", "electricity", "acid", "poison", "water", "air", "earth", "wood", "metal", "light", "shadow", "void", "vitality", "spirit", "mental", "sonic", "fear", "healing"].find(t => traits.includes(t));
  theme = { air: "wind", wood: "plant", mental: "mind" }[theme] ?? theme;
  if (!theme) {
    if (/\b(?:heal|restore.{0,35}hit points|patch up wounds)\b/.test(visual)) theme = "healing";
    else if (/\b(?:shield|parry|ward|block|protect|resistance)\b/.test(visual)) theme = "ward";
    else if (/\b(?:frightened|demoralize|intimidat|fear|terrify)\b/.test(visual)) theme = "fear";
    else if (/\b(?:strike|attack roll|weapon|unarmed|grapple|trip|shove)\b/.test(visual)) theme = "weapon";
    else if (/\b(?:stride|step|leap|tumble|sprint|climb|burrow|swim)\b/.test(visual)) theme = "wind";
    else if (/\b(?:invisible|hide|stealth|concealed)\b/.test(visual)) theme = "shadow";
    else if (/\b(?:sing|song|music|perform)\b/.test(visual)) theme = "sonic";
    else if (/\b(?:teleport|dimension|portal)\b/.test(visual)) theme = "teleport";
    else if (/\b(?:transform|change.{0,30}form|shapechange)\b/.test(visual)) theme = "transform";
    else {
      const element = /\bdamage\s+(fire|cold|electricity|acid|poison|force|sonic|vitality|void|spirit|mental)\b|\b(fire|cold|electricity|acid|poison|force|sonic|vitality|void|spirit|mental)\s+damage\b/.exec(visual);
      theme = element?.[1] ?? element?.[2] ?? "arcane";
      theme = theme === "mental" ? "mind" : theme;
    }
  }
  let motif = authored?.[0];
  const evidence = [];
  if(!motif&&traits.includes("stance")){motif="stance";evidence.push("Native stance activation sets a source stance; its granted attacks are separate uses.");}
  if(!motif&&(traits.includes("spellshape")||traits.includes("metamagic")||/\b(?:next action|next spell|next impulse)\b.{0,80}\b(?:cast|spell|impulse)\b/.test(visual))){motif="spellshape";evidence.push("Description modifies a subsequent spell/impulse; this activation gathers power at source, without prematurely emitting that later effect.");}
  const decide = (pattern, value, reason) => {
    if (!motif && pattern.test(visual)) { motif = value; evidence.push(reason); }
  };
  decide(/\b(?:fire|fires|emit|emits|shoot|shoots|unleash|unleashes)\b.{0,100}\b(?:beam|ray)\b|\b(?:beam|ray)\b.{0,120}\b(?:damage|line|target)\b/, "ray", "Description explicitly emits a directed beam/ray; never substituted with an impact or missile.");
  decide(/\b(?:cone|cone area template)\b.{0,100}\b(?:damage|creature|enemy)\b|\b(?:damage|breath|breathe|exhale|spew)\b.{0,100}\bcone\b/, "elementCone", "Description has a cone; selected-target fan accents are an explicitly symbolic footprint.");
  decide(/\b(?:damage|shoot|fire|blast|projectile|breath|breathe)\b.{0,100}\b(?:line|line area template)\b|\bline area template\b.{0,100}\b(?:damage|creature)\b/, "lineCue", "Description delivers along a line; a directed beam approximates chosen endpoints.");
  decide(/\bstrike\b.{0,55}\b(?:firearm|gun|pistol|musket)\b|\b(?:shoot|fire)\b.{0,45}\b(?:firearm|gun|pistol|musket|bullet)\b/, "firearm", "Description explicitly shoots a firearm.");
  decide(/\b(?:hurl|launch|throw|shoot|fire|spit)\b[^.!?]{0,80}\b(?:rock|stone|boulder|flame|fire|ice|water|acid|poison|projectile|bolt)\b/, "elementBolt", "Description launches described elemental/material projectile.");
  decide(/\b(?:strike|throw|hurl|toss)\b.{0,60}\b(?:alchemical bomb|bomb)\b/, "bombThrow", "Description throws or Strikes with a bomb; moving bomb footage precedes its contact.");
  decide(/\b(?:two|both|twice)\b.{0,100}\bstrikes?\b|\bmake two\b.{0,60}\battacks?\b/, "doubleStrike", "Description specifies two attacks/Strikes.");
  decide(/\b(?:stride|step|leap|tumble)\b.{0,150}\bstrike\b/, "charge", "Description combines movement then Strike.");
  decide(/\b(?:make|attempt|perform)\b.{0,50}\b(?:ranged strike|ranged attack)\b|\bstrike\b.{0,55}\b(?:firearm|bow|crossbow|ranged weapon)\b|\b(?:shoot|fire|hurl|throw)\b.{0,60}\b(?:arrow|bolt|bullet|projectile|spear|weapon)\b/, "ranged", "Description specifies ranged attack or thrown shot.");
  decide(/\b(?:make|attempt|perform)\b.{0,60}\b(?:melee strike|unarmed strike|strike)\b|(?:^|[.!?]\s*|\bthen[, ]+|\bnext[, ]+)strike\b/, traits.includes("unarmed") || /\bunarmed strike\b/.test(visual) ? "unarmed" : "strike", "Description explicitly performs a Strike.");
  decide(/\b(?:grapple|restrain|grab the|grab your|bind|immobiliz)\b/, "bind", "Description restrains or grapples affected creature.");
  decide(/\b(?:shove|push|knock back|drive.{0,30}back)\b/, "shove", "Description pushes/shoves affected creature.");
  decide(/\b(?:trip|knock.{0,30}prone)\b/, "trip", "Description trips or knocks down.");
  decide(/\b(?:heal|restore.{0,35}hit points|patch up wounds)\b/, "healing", "Description heals or restores health.");
  decide(/\b(?:frightened|demoralize|intimidat|terrify|fear)\b/, "dread", "Description intimidates or causes fear.");
  decide(/\b(?:shield|parry|ward|block|protect|resistance)\b/, "guard", "Description provides defense, resistance or protection.");
  decide(/\b(?:teleport|dimension|portal)\b/, "teleport", "Description relocates through magical transit.");
  decide(/\b(?:invisible|hide|stealth|concealed)\b/, "stealth", "Description hides or conceals.");
  decide(/\b(?:transform|change.{0,30}form|shapechange)\b/, "transform", "Description changes form.");
  decide(/\b(?:fly|flying|wings|levitate)\b/, "flight", "Description supports flight or ascent.");
  decide(/\b(?:stride|step|leap|tumble|sprint|climb|burrow|swim)\b/, "movement", "Description grants an active movement maneuver.");
  decide(/\b(?:sing|song|music|perform|inspire|rally|command.{0,30}allies)\b/, "inspiration", "Description supports performance, command or encouragement.");
  decide(/\b(?:detect|seek|recall knowledge|sense|observe|search)\b/, "perception", "Description gathers information or sharpens senses.");
  if (!motif && traits.includes("stance")) { motif = "stance"; evidence.push("Native stance trait; source stance entrance cue."); }
  if (!motif && traits.includes("impulse")) {
    motif = /\bcone\b/.test(lower) ? "elementCone" : /\b(?:emanation|aura|surround)\b/.test(lower) ? "elementAura" : /\b(?:blast|bolt|shoot|hurl|projectile|line)\b/.test(lower) ? "elementBolt" : "elementTarget";
    evidence.push("Native elemental impulse with described delivery.");
  }
  if(!motif&&/\b(?:deals?|take|takes|inflicts?)\b.{0,60}\bdamage\b/.test(visual)){
    motif="elementTarget";evidence.push("Description directly damages affected creatures; localized target effects, no invented projectile.");
  }
  if (!motif) { motif = "utility"; evidence.push("No sufficiently concrete visual delivery; finite symbolic activity cue."); }
  const selfMotifs = ["guard", "shield", "waveGuard", "movement", "flight", "stealth", "teleport", "transform", "stance", "spellshape", "perception", "utility", "inspiration", "display", "whirlwindStrike", "elementAura", "sentinel", "splinterCone", "elementCone"];
  const subject = selfMotifs.includes(motif) ? "source" : "targets";
  const symbolic = ["utility", "perception", "sentinel", "produce", "elementCone", "splinterCone", "boomerang", "flamePath", "elementAura", "lineCue"].includes(motif) || (motif === "ray" && /\bline\b/.test(visual));
  return { slug, theme, motif, subject, quality: symbolic ? "symbolic" : authored ? "signature" : "themed",
    authored: !!authored,
    rationale: authored?.[2] ?? evidence.join(" "),
    evidence, descriptionChars: text.length,
    notes: ["Plays when this feat is sent to chat; generic Strike/skill rolls are not assumed to use it.",
      ...(subject === "targets" ? ["Target the affected creature(s) before sending the feat to chat."] : []),
      ...(symbolic ? ["Symbolic visual approximation; precise objects, paths and mechanical areas require customization."] : []),
      "Visual cue only; success, conditions, HP, resources and token positions remain PF2e/player decisions."],
  };
}
