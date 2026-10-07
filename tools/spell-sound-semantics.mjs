import { descriptionText, descriptionOpening, nativeSpellDescription } from "./spell-semantics.mjs";
import { BROAD_VARIETY_MOTIFS } from '../scripts/spell-broad-variety-designs.mjs';
// Reviewed complete utility descriptions. A visual illustration is not evidence
// of a sonic event, a resolved save, a selected material, or somebody's voice.
const utilityQuietReasons = Object.fromEntries([
  ["perilForesight constellationGuide nearFocus patronSecrets familiarSensor corpseJourney fateNudge objectExpertise objectPsychometry practicedCorrection sharedEyes languageMeaning weaknessInsight psychicImprint", "Private perception, thought, expertise or comprehension changes; no public voices, ray impacts or discovery noises are inferred."],
  ["loadBearing sightOcclusion hearingMute enduringMind geckoPurchase companionHide physiqueBoost gratitudeVitality environmentalAdaptation biologicalDisarray voiceQuiet timeWeariness", "Bodily support, temporary vitality, sensory loss or internal discomfort; no healing, injury, growl or sonic blast is inferred."],
  ["odorErase alluringMusk", "Olfactory change only; scent removal or attraction does not create an audible mist, animal swarm or attack."],
  ["tinySigil timedSigil companionWatch", "A small mark or watch condition is set now; later timer flashes, alarms and ending teleport are not played during casting."],
  ["diabolicTask escapeCommand gossipInsight", "Words, command or information are supplied by the player or GM; no prerecorded voice, answer, creature squawk or successful escape is assumed."],
  ["edibleObject cuisineCleanse companionGroom garmentRestyle suddenMeal corpseDecay preservedCorpse weaponOverlays", "Material appearance, cleanliness, nourishment or preservation changes; no wound healing, vomiting, fire, attack or noisy repair process is assumed."],
  ["animatedRope currentLink objectFloat mouthPocket glitterTrail floatingHarness inertiaAnchor heldItemFuse paintedSensor objectSorting movementPair tetherConnection eidolonUnfetter friendlyPropulsion curseTransfer", "Quiet support, a connection or a player-chosen object operation; no metal chain clank, selected object material, future movement or success sound is inferred."],
  ["flutterDecoy elementalWeakness genieVanish brinyFaceTendril mistPiercing", "The stated visual or selected-element illustration does not establish an audible strike, animal voice, explosion or large splash; optional sound remains customizable."],
].flatMap(([motifs, reason]) => motifs.split(" ").map(motif => [motif, reason])));
// Rules read the full native description. Traits alone never imply an explosion,
// animal voice, gunshot or spoken incantation. Uncertain utility spells stay quiet.
export function soundDirection(spell, source) {
  const description = nativeSpellDescription(source);
  const text = descriptionText(description);
  const opening = descriptionOpening(description);
  const name = spell.name.toLowerCase(),
    motif = spell.design?.motif ?? "";
  const choose = (profile, reason) => ({
    profile,
    reason,
    descriptionChars: text.length,
  });
  if (!text)
    return choose("", "No source description; no automatic sound inferred.");
  const reviewedFire={
    fireDrought:'',fireDehydrate:'',fireDust:'',fireFog:'',fireAshes:'',fireRedistribute:'',
    fireBlossoms:'fireIgnition',fireWildfire:'fireIgnition',fireDivine:'holy',fireSunBlade:'radiantRay',
    fireRayGround:'fireRay',fireGeyser:'water',fireBile:'earth',firePlasma:'fireCone',fireRejuvenating:'fireCone',
    fireBarrage:'fireball',fireFireworkBlast:'sonic',fireIgniteFireworks:'sonic',fireSkyrocket:'sonic',
    fireCataclysm:'earthquake',fireConfluence:'summon',fireDouble:'fireIgnition',fireTruth:'fire',fireWhirling:'fireCone',fireFumarole:'fireIgnition',
  };
  if(Object.hasOwn(reviewedFire,motif))
    return choose(reviewedFire[motif], 'Reviewed native fire-spell casting event; deferred ignition, internal heat and unresolved choices do not play explosion audio.');
  if (['solarSensitivity','secretRevelation','betrayalVision','ambitionIsolation','doomForecast','mentalContingency','defensiveTerrorMask','fatedWeapon','ownDeathVision','privateNightmare'].includes(motif))
    return choose('', 'Private perception, belief, a spoken secret or a prepared contingency; symbolic public artwork does not establish an audible fear or damage event.');
  if (motif==='confidenceSiphon')
    return choose('drain','Confidence is inhaled from the victim; a finite energy draw follows the returning strand. Save-dependent healing is not played.');
  if (BROAD_VARIETY_MOTIFS[motif]) {
    const reviewedProfiles = {
      broadDevourLife:['drain','Life is drawn from victim toward caster; no healing of the victim is inferred.'],
      broadVitalHeal:['healing','Immediate restoration of living targets; native undead use remains system context.'],
      broadAnimalHeal:['natureHeal','Immediate natural restoration of an animal; no creature voice is inferred.'],
      broadCompanionHeal:['natureHeal','Immediate natural restoration of an animal companion.'],
      broadStardustHeal:['healing','Finite starlit restoration, without claiming that later light effects have resolved.'],
      broadFamiliarReturn:['revive','Return of the familiar at one Hit Point; finite return cue, without general full healing.'],
      broadRevival:['revive','Finite return/restoration illustration; native living or dead target distinction remains unresolved.'],
      broadDeathIntercede:['healing','An immediate life spark intervenes against death; no general resurrection sound.'],
      broadLaughter:['laughter','Involuntary laughter is explicitly described.'],
      broadApplause:['applause','Audible cheers and applause are explicitly described.'],
    };
    const selected = reviewedProfiles[motif];
    return selected ? choose(...selected) : choose('', 'Reviewed private perception, prepared benefit, support, cleansing, object or casting-only illustration. No wound restoration, chosen voice/material, future impact or successful outcome is inferred; audio remains customizable.');
  }
  const reviewedQuiet = {
    "boots-on-the-ground": "Complete description forbids intelligible sounds such as music; no musical flourish is inferred for the illusory troops.",
    "canticle-of-everlasting-grief": "The melody is explicitly audible only to its target. Automatic public audio would expose a private manifestation; choose a private cue manually if desired.",
    "enthrall": "Caster may speak or sing. Words and performance are player chosen; no lute, prerecorded speech, or mandatory music is inferred.",
    "fortissimo-composition": "This preparation improves the next composition, rather than performing that composition now; its later music receives no premature cue.",
    "fold-metal": "An object is magically reshaped; no anvil strike, hammering, or impact is described.",
    "precious-metals": "Metal is transmuted into a selected material. No hammering, impact, or injury happens during this buff.",
    "serrate": "The weapon's surface twists into jagged edges; this buff does not itself make a Strike or ring an anvil.",
    "field-of-razors": "Metal dust becomes a barbed area. Its movement-triggered damage occurs later; no immediate anvil blow is inferred.",
    "rust-cloud": "Rust particles form a cloud. Metal corrosion and damage occur later; no immediate metal-contact blow is inferred.",
    "steel-fortifications": "Metal structures appear in empty squares. No impact or breakage occurs until later damage; no anvil strike is inferred.",
    "wall-of-metal": "An unbroken metal wall is conjured in empty space. No metal collision or later breakage is inferred at formation.",
  };
  if (reviewedQuiet[spell.slug]) return choose("", reviewedQuiet[spell.slug]);
  if (
    spell.traits.includes("subtle") ||
    /^(silence|quiet|message|dream message|embed message|imprint message|message rune)$/i.test(
      name,
    ) ||
    ["silenceField", "whisper"].includes(motif)
  )
    return choose(
      "",
      "Silent, subtle or private communication; no public sound cue.",
    );
  if (
    name === "ghost sound" ||
    /sculpt sound|ventriloquis|sound of silence/.test(name)
  )
    return choose(
      "",
      "Player chooses the sound or silence; choose an audio file in Customize.",
    );
  if (motif === "summonFortitude")
    return choose("transform", "Complete description transforms and fortifies an existing summoned ally's body; finite transformation cue, not another summoning arrival or creature voice.");
  if (motif === "healerPromise")
    return choose("bless", "Words bless the recipient for later vitality healing; beneficial blessing cue, with no immediate restoration or Hit Point gain assumed.");
  if (motif === "retrievingHook")
    return choose("objectWhoosh", "A magical hook and rope explicitly hurtle toward the target; neutral object-flight cue follows extension, with no metal-chain clank, impact or save result assumed.");
  if (motif === "companionPocket")
    return choose("pocketTransition", "Companion is drawn into an extradimensional pocket; finite spatial departure follows the target pocket entrance, without playing spell-end reappearance.");
  if (utilityQuietReasons[motif])
    return choose("", utilityQuietReasons[motif]);
  if (motif === "coneStarFan")
    return choose("starFlight", "Tiny shooting stars spread through a cone; light-particle shimmer follows their flight release. Fire damage does not turn the described stars into a flame blast or late dazzling impact.");
  if (spell.slug === "metal-reverberation")
    return choose("metalResonance", "The full description explicitly strikes a tuning fork and repeats its resonant note; a brief chime replaces an unrelated anvil smash.");
  if (spell.slug === "restraining-chains")
    return choose("chainBinding", "A steel chain weaves around the target and pulls on it; a finite moving-chain cue follows formation, without another physical Strike.");
  if (["needles", "metalShot", "fixMetalNeedles", "fixMetalShot"].includes(motif))
    return choose("metalProjectile", "Metal needles or a small metal object fly toward the target. A neutral flight cue follows release; metal contact follows the landing sample, rather than an anvil sound during casting.");
  if (name === "roar of the dragon")
    return choose(
      "dragonRoar",
      "Description explicitly channels a dragon roar.",
    );
  if (name === "roaring applause")
    return choose(
      "applause",
      "Description calls for cheering and applause, not an animal roar.",
    );
  if (/hideous laughter|laughing fit/.test(name))
    return choose("laughter", "Involuntary laughter described by spell.");
  if (/dispel magic|counterspell/.test(name) || motif === "dispel")
    return choose("dispel", "Magic is unraveled rather than detonated.");
  if (["guidedInsight", "mentalParalysis", "mentalConfusion", "compelledDance", "castingRush"].includes(motif))
    return choose("", "Guidance, altered thought or compelled movement does not itself establish an audible manifestation; no extra voices or music are inferred.");
  if (["mistVeil", "boilingBlood"].includes(motif))
    return choose("", "Quiet mist or internal heating does not imply an external splash, flame detonation or bodily injury sound.");
  if (motif === "ashVeil")
    return choose("wind", "Ash drifts in a cloud or swirling wind; finite air movement follows formation, without a fire explosion or assumed cough.");
  if (motif === "flamingArmory")
    return choose("fireIgnition", "A flaming weapon materializes as a buff; ignition follows formation, without weapon-contact audio before an attack.");
  if (motif === "waterVortex")
    return choose("water", "Churning waves form a watery vortex; finite water surge, without assuming an injury outcome.");
  if (motif === "windVortex" && name !== "cyclone rondo")
    return choose("wind", "A cyclone or tornado forms; finite wind cue follows formation.");
  if (
    /time jump|time beacon|time stop|temporal|slow|haste/.test(name) ||
    ["time", "timeRipple"].includes(motif)
  )
    return choose(
      /slow/.test(name) ? "slow" : "time",
      "Time alteration uses a short temporal cue.",
    );
  if (/unlock|knock/.test(name))
    return choose("unlock", "Lock opens; mechanical unlock cue.");
  if (/mending|repair|make whole/.test(name))
    return choose("mending", "Repair and restoration of an object.");
  if (/detect magic|read aura/.test(name))
    return choose("detect", "Brief magical detection cue.");
  if (
    ["portal", "teleport", "blink", "dimensionDoor", "teleportStrike"].includes(motif) ||
    /\b(teleport|translocate|dimensional|dimension door|blink)\b/.test(name)
  )
    return choose("teleport", "Spatial departure/arrival; short teleport cue.");
  if (/fireball|delayed blast/.test(name))
    return choose(
      "fireball",
      "Fire gathers, then detonates in a roaring area blast.",
    );
  if (/force barrage|magic missile/.test(name))
    return choose(
      "forceMissile",
      "Homing force missiles; missile release cue.",
    );
  if (/chain lightning/.test(name))
    return choose(
      "chainLightning",
      "Short electric discharge follows each target-to-target hop.",
    );
  if (/lightning bolt|lightning storm/.test(name))
    return choose(
      "lightningBolt",
      "Lightning discharge, with a separate thunderous impact.",
    );
  if (motif === "energyRay")
    return choose(
      "forceRay",
      "Description states a ray of energy; bludgeoning damage does not imply rocks.",
    );
  if (["prismaticRay", "divineRay"].includes(motif))
    return choose(
      "radiantRay",
      "A luminous ray uses a directional magical-energy cue.",
    );
  if (["lunarRay", "moonRay"].includes(motif))
    return choose(
      "moonRay",
      "Moonlight beam uses a lunar shimmer, not fire audio inferred from damage type.",
    );
  if (motif === "darkRay")
    return choose(
      "darkRay",
      "Sickening or dark energy ray uses a dark release cue, not an explosion.",
    );
  if (motif === "toxicRay")
    return choose(
      "poisonRay",
      "Toxic-spore ray uses a poison release; no corrosive-acid substitution.",
    );
  if (/scorching ray|blazing bolt/.test(name) || motif === "flameRay")
    return choose(
      "fireRay",
      "Directional fire ray; beam cue rather than explosion.",
    );
  if (/ray of frost/.test(name) || motif === "icyRay")
    return choose(
      "coldRay",
      "Directed freezing ray; dedicated frost-ray audio.",
    );
  if (/cone of cold/.test(name))
    return choose("coldCone", "Broad freezing cone; sustained rush of cold.");
  if (/burning hands|breathe fire/.test(name))
    return choose(
      "fireCone",
      "A fan of flame rather than a projectile impact.",
    );
  if (/shocking grasp/.test(name))
    return choose(
      "electricTouch",
      "Contact electricity; short crackling shock.",
    );
  if (/acid splash/.test(name))
    return choose(
      "acidSplash",
      "Small acid splash; no poison-labelled substitute.",
    );
  if (
    /\bheal\b|\bhealing\b|\brestore hit points\b|\bregain.{0,30}hit points/.test(
      opening.toLowerCase(),
    ) ||
    ["healing", "healBurst", "regeneration"].includes(motif)
  )
    return choose(
      spell.theme === "water"
        ? "waterHeal"
        : spell.theme === "plant"
          ? "natureHeal"
          : "healing",
      "Description restores health; gentle restorative cue.",
    );
  if (/reviv|resurrect|raise dead/.test(name))
    return choose("revive", "Return to life uses a resurrection cue.");
  if (
    /\bshield\b|\bward\b|\bbarrier\b/.test(name) ||
    ["shield", "forceShield", "protect", "ward"].includes(motif)
  )
    return choose("shield", "Protective field; short ward activation.");
  if (/\bbless\b|heroism|courage/.test(name))
    return choose("bless", "Encouragement or blessing; gentle beneficial cue.");
  if (
    /entangle|tangle|root|bramble|thorn/.test(name) ||
    ["entangle", "vines", "rootSnare"].includes(motif)
  )
    return choose(
      /wall/.test(name) ? "thornWall" : "vines",
      "Growing roots or vines; organic growth cue.",
    );
  if (/plant growth|verdant|timber|wood/.test(name) && spell.theme === "plant")
    return choose("growth", "Plant growth or wood formation.");
  if (
    /\bswarm\b|\bbugs\b|\binsect/.test(opening.toLowerCase()) &&
    spell.theme === "plant"
  )
    return choose("swarm", "Audible insects explicitly described.");
  if (/earthquake|seismic/.test(name))
    return choose("earthquake", "Ground shaking uses a short seismic rumble.");
  if (/wall of stone|stone wall/.test(name))
    return choose("stoneWall", "Stone structure rises into place.");
  if (/wall of ice|ice wall/.test(name))
    return choose("iceWall", "Ice structure forms and cracks.");
  if (/wall of fire|flame pillar/.test(name))
    return choose(
      "fireWall",
      "Rising flame, rather than a travelling fireball.",
    );
  if (/\b(light|lights|illuminate)\b/.test(name) || spell.theme === "light")
    return choose("light", "Light appears with a brief shimmer.");
  if (/\bsleep\b|slumber/.test(name))
    return choose("sleep", "Sleep magic uses a soft dream cue.");
  if (/\bfear\b|\bhorrif/.test(name) || ["fear", "dread"].includes(motif))
    return choose(
      "fear",
      "Fear effect uses a short ominous cue, without creature injury sounds.",
    );
  if (/siphon|drain|vampiric/.test(name) || motif === "drain")
    return choose("drain", "Life or energy is drawn away; siphon cue.");
  if (
    /musical|melody|music|\bsong\b/.test(opening.toLowerCase()) &&
    (spell.traits.includes("auditory") || motif === "song")
  )
    return choose(
      "song",
      "Description explicitly calls for music; short musical flourish.",
    );
  if (["portal", "summon"].includes(spell.delivery) || /\bsummon/.test(name))
    return choose(
      "summon",
      "Summoning arrival; creature species remains player choice.",
    );
  if (spell.delivery === "transform" || motif === "form")
    return choose(
      "transform",
      "Brief transformation cue; no assumed animal voice.",
    );
  // Damage and visible material effects provide safer family cues than school.
  const theme = {
    fire: "fire",
    cold: "cold",
    electricity: "electric",
    acid: "acid",
    poison: "poison",
    water: "water",
    wind: "wind",
    earth: "earth",
    metal: "metal",
    plant: "growth",
    sonic: "sonic",
    force: "force",
    void: "void",
    shadow: "shadow",
    healing: "healing",
    vitality: "holy",
    holy: "holy",
  }[spell.theme];
  if (motif === "restore")
    return choose(
      "healing",
      "Restoration or cleansing uses a gentle restorative cue.",
    );
  if (motif === "mentalJolt" && /\b(damage|pain|jolt|psychic)\b/i.test(opening))
    return choose(
      "psychic",
      "Psychic attack uses a short mental pulse, without spoken voices.",
    );
  if (spell.theme === "time")
    return choose("time", "Temporal effect uses a short time-shift cue.");
  if (spell.theme === "teleport")
    return choose(
      "teleport",
      "Spatial effect uses a short departure/arrival cue.",
    );
  if (
    motif === "swarm" &&
    /\b(insects?|bugs?|beetles?|flies|wasps?)\b/i.test(opening)
  )
    return choose("swarm", "Description explicitly evokes buzzing insects.");
  if (
    theme &&
    (spell.design?.damageDice ||
      /\b(damage|blast|burst|erupt\w*|flames?|freez\w*|surge|splash|stone|ice|wind|growth|energy|water|roots?|thorns?)\b/i.test(
        opening,
      ))
  )
    return choose(
      theme,
      `Description and ${spell.theme} treatment support a ${theme} effect cue.`,
    );
  return choose(
    "",
    "No unambiguous audible effect in description; quiet by default.",
  );
}
