// Search the complete edition inventory. Family hints guide intent; geometry
// gates run first, so a matching name can never turn an impact into a ray.
import {colorAffinity} from './color-affinity.mjs';
import {reviewedUpgradeRoots} from './jb2a-reviewed-upgrades.mjs';
const split = (value = "") => value.split(",").filter(Boolean);
export const SPELL_SELECTION_REVISION=4;
const words = (value) =>
  String(value ?? "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((x) => x.length > 2);
const colors = {
  fire: "orange",
  cold: "blue",
  electricity: "blue",
  acid: "green",
  poison: "green",
  force: "purple",
  sonic: "blue",
  vitality: "green",
  void: "purple",
  spirit: "yellow",
  blood: "red",
  earth: "brown",
  water: "blue",
  wind: "white",
  plant: "green",
  metal: "white",
  shadow: "dark_purple",
  light: "yellow",
  healing: "green",
};
const synonyms = {
  acid: ["poison", "liquid", "acid"],
  ice: ["cold", "frost", "snow", "sleet"],
  cold: ["ice", "frost", "snow", "sleet"],
  electricity: ["lightning", "electric", "static"],
  plant: ["vine", "leaves", "growth", "entangle", "thorn"],
  wind: ["gust", "whirlwind", "air", "feathers"],
  water: ["liquid", "splash", "bubble"],
  force: ["energy", "magic"],
  spirit: ["divine", "sacred", "guardians"],
  vitality: ["healing", "cure", "bless"],
  healing: ["healing", "cure", "bless"],
  void: ["darkness", "annihilation", "hadar"],
  shadow: ["darkness", "smoke"],
  sonic: ["soundwave", "thunderwave", "shatter", "music"],
  poison: ["fumes", "cloud", "toxic"],
  earth: ["boulder", "rock", "ground", "eruption"],
  metal: ["blade", "dagger", "sword"],
  divination: ["detect", "eyes"],
  teleport: ["portal", "misty"],
  ward: ["shield", "shell"],
  fear: ["dead", "hadar"],
  transform: ["shimmer"],
  mind: ["sleep", "dizzy"],
  web: ["web"],
  flame: ["fire"],
  light: ["glint", "moonbeam", "sacred", "stars"],
};
const ignoredFamilies = new Set([
  "ui",
  "extras",
  "icon",
  "screen_overlay",
  "markers",
  "markers_scifi",
  "token_stage",
  "token_border",
  "zoning",
  "footprints",
  "wrench",
  "barrel",
  "caltrops",
  "braziers",
  "muzzle_flash",
  "sneak_attack_text",
  "hovering_laserweapon",
  "lasersword_db",
  "lasersword",
  "lasershot",
  "bullet",
  "pumpkin",
  "ouija_planchette",
  "fork",
  "ioun_stones",
]);
const family = (row) => row.key.split(".")[1];
const rootMatches = (row, root) =>
  row.key === `jb2a.${root}` || row.key.startsWith(`jb2a.${root}.`);
const parentMatches = (row, root) => {
  const parent = root.split(".").slice(0, -1).join(".");
  return parent.length > 0 && rootMatches(row, parent);
};
const infoCache = new WeakMap();
function info(row) {
  if (!infoCache.has(row))
    infoCache.set(row, {
      key: row.key.toLowerCase(),
      family: family(row),
      familyWords: new Set(words(family(row))),
      tokens: new Set(words(`${row.key} ${row.metadata?.name ?? ""}`)),
      parts: new Set(row.key.toLowerCase().split(".")),
      geometry: assetGeometry(row),
    });
  return infoCache.get(row);
}
export function assetGeometry(row) {
  const key = row.key.toLowerCase(),
    file = row.file.toLowerCase(),
    root = family(row),
    all = `${key} ${file}`;
  // Some database aliases say 500x100 but point to square ring footage.
  if (/\b(?:ring|sphere)\b|_ring_|_sphere_/.test(all)) return "radial";
  // Circular field files can include a footprint such as _15ft_. That is not
  // projectile travel distance (e.g. the looping radar sweep).
  if (key.startsWith('jb2a.template_circle.') || key.startsWith('jb2a.volley_of_projectiles_circle.')) return 'radial';
  // A weapon family can contain ranged and localized melee siblings.
  if (/\.melee\b|_melee_/.test(all)) return "radial";
  if (/\.cone\b|_cone_|template.cone|burning_hands|cone_of_cold/.test(all))
    return "cone";
  if (/\.line\b|_line_|template.line/.test(all)) return "line";
  if (/wall/.test(root)) return "wall";
  if (
    [
      "energy_strands",
      "vine",
      "spiritual_weapon",
      "boulder",
      "rolling_boulder",
      "throwable",
      "wind_stream",
    ].includes(root) &&
    !/_\d+ft_/.test(file) &&
    !row.distanceFiles
  )
    return "radial";
  if (
    row.templateName === "ray" ||
    [
      "ray_of_frost",
      "scorching_ray",
      "energy_beam",
      "energy_conduit",
      "energy_strands",
      "chain_lightning",
      "electric_arc",
      "lightning_bolt",
      "witch_bolt",
      "disintegrate",
      "gust_of_wind",
      "wind_stream",
      "vine",
    ].includes(root) ||
    key.includes(".beam.")
  )
    return "beam";
  if (
    [
      "arrow",
      "bolt",
      "fire_bolt",
      "magic_missile",
      "eldritch_blast",
      "guiding_bolt",
      "dart",
      "boulder",
      "rolling_boulder",
      "snowball_toss",
      "spell_projectile",
      "spiritual_weapon",
      "throwable",
      "ranged",
      "ranged_missile",
      "ranged_helix",
      "pack_hound_missile",
      "shuriken",
      "chakram",
      "boomerang",
      "javelin",
      "spear",
    ].includes(root) ||
    row.templateName === "ranged" ||
    (/_\d+ft_/.test(file) && !["vine"].includes(root))
  )
    return "projectile";
  return "radial";
}
function wantedGeometry(slot, context, profile) {
  const authored = context.design?.slotGeometry?.[slot] ?? profile?.slotGeometry?.[slot];
  if (authored) {
    if (!["radial", "cone", "line", "wall", "beam", "object", "projectile", "missile"].includes(authored))
      throw Error(`Unknown authored media geometry: ${slot}/${authored}`);
    return authored;
  }
  if (slot === "area" && context.delivery === "line") {
    if (context.design?.pattern === "lineTiles" || context.design?.areaLayout === 'tiles') return "radial";
    if (context.design?.pattern === "lineFlight") return "projectile";
    if (context.design?.pattern === "lineBarrier") return "wall";
  }
  if (slot === "area" && ["cone", "line", "wall"].includes(context.delivery))
    return context.delivery;
  if (slot !== "bolt") return "radial";
  if (
    [
      "ray",
      "disintegrate",
      "chain",
      "drain",
      "push",
      "fetters",
      "electricLasso",
      "tetherPull",
      "drawLightning",
      "curseTransfer",
      "currentLink",
      "retrievingHook",
      "sharedEyes",
      "tetherConnection",
      "coneRayFan",
    ].includes(context.design?.pattern)
  )
    return "beam";
  if (
    [
      "movingGlob",
      "armament",
      "vine",
      "flyingSwarm",
      "areaMissile",
      "object",
      "coneStarFan",
      "coneObjectFan",
    ].includes(context.design?.pattern)
  )
    return "object";
  if (context.design?.pattern === "missile") return "missile";
  return "projectile";
}
function eligible(row, geometry, slot, roots, context) {
  const shape = info(row).geometry;
  // Concrete objects cannot become generic ambience because their metadata
  // contains broad words such as "arcane" or "casting".
  if (
    family(row) === "arcane_hand" &&
    !roots.some((r) => rootMatches(row, r)) &&
    !/\bhand\b/i.test(context.design?.assetIntent ?? "")
  )
    return false;
  if (
    ignoredFamilies.has(family(row)) &&
    !roots.some((r) => rootMatches(row, r))
  )
    return false;
  if (
    slot === "cast" &&
    !roots.some((r) => rootMatches(row, r)) &&
    !/\.caster\.|\.source\.|cast_/.test(row.key)
  )
    return false;
  if (geometry === "beam" || geometry === "line")
    return shape === "beam" || shape === "line";
  if (geometry === "object")
    return (
      ((context.design?.pattern === "coneObjectFan" ? shape === "radial" : ["radial", "projectile"].includes(shape)) ||
        family(row) === "spiritual_weapon") &&
      roots.some((r) => rootMatches(row, r) || parentMatches(row, r))
    );
  if (geometry === "missile") return shape === "projectile";
  if (geometry === "projectile") {
    if (shape === "projectile" || shape === "beam") return true;
    // Native moving-object stages can carry localized footage (water glob, ice
    // shard). Only explicitly authored object hints may opt into that geometry.
    return (
      shape === "radial" &&
      ["object", "glob", "needles", "volley"].includes(
        context.design?.pattern,
      ) &&
      roots.some((r) => rootMatches(row, r))
    );
  }
  if (geometry === "radial") return shape === "radial";
  return shape === geometry;
}
// Positive fidelity test for catalog badges; neutral cone footage is still a
// valid geometric fallback but must not be called a material-matched effect.
export function coneMaterialMatches(key, theme) {
  const root = key.replace(/^jb2a\./, '').split('.')[0].toLowerCase();
  if (root === 'burning_hands') return theme === 'fire';
  if (root === 'cone_of_cold') return theme === 'cold';
  if (root === 'water_splash') return theme === 'water';
  if (!/breath_weapons/.test(root)) return false;
  const material = key.toLowerCase().match(/\.(fire|cold|ice|poison|acid|lightning)\./)?.[1];
  return ({fire:'fire',cold:'cold',ice:'cold',poison:'poison',acid:'acid',lightning:'electricity'})[material] === theme;
}
function coneMaterialFits(row, theme, roots, context) {
  const key = row.key.toLowerCase(), root = family(row);
  if (root === "cone_of_cold" || root === "burning_hands")
    return theme === (root === "cone_of_cold" ? "cold" : "fire");
  if (/breath_weapons/.test(root)) {
    const material = key.match(/\.(fire|cold|ice|poison|acid|lightning|holy|arcana)\./)?.[1];
    return ({fire:["fire"],cold:["cold"],ice:["cold"],poison:["poison","disease"],acid:["acid"],lightning:["electricity"],holy:["spirit","vitality","light","healing"],arcana:["arcane","force","mind","time","gravity","illusion","void"]}[material] ?? []).includes(theme);
  }
  if (root === "water_splash") return theme === "water";
  // Arrow volleys are not interchangeable with light, sound or mental waves.
  if (/volley_of_projectiles/i.test(root)) return /\b(?:arrow|arrows)\b/i.test(context.design?.assetIntent ?? context.name ?? "");
  return true;
}
export function resolveSpellMedia(
  databases,
  theme,
  profile = {},
  defaults = profile,
  context = {},
) {
  const result = {};
  const nameWords = new Set(words(context.name ?? context.slug));
  const clueWords = new Set(
    words(
      `${context.design?.pattern === "generic" ? "" : (context.design?.label ?? "")} ${context.design?.assetIntent ?? ""}`,
    ),
  );
  const themeWords = new Set([theme, ...(synonyms[theme] ?? [])]);
  for (const token of nameWords)
    for (const word of synonyms[token] ?? []) clueWords.add(word);
  const conflictingElements = Object.entries({
    fire: ["fire"],
    cold: ["cold", "ice", "frost"],
    earth: ["earth"],
    water: ["water"],
    electricity: ["lightning", "electric"],
  })
    .filter(([element]) => element !== theme)
    .flatMap(([_element, aliases]) => aliases);
  for (const slot of ["cast", "bolt", "hit", "aura", "area",...Object.keys(profile.additionalMedia??{})]) {
    const motifRoots = split(profile[slot]??profile.additionalMedia?.[slot]),
      defaultRoots = split(defaults[slot]);
    const upgrades = reviewedUpgradeRoots(context, slot);
    const roots = [...upgrades, ...motifRoots, ...defaultRoots];
    const geometry = wantedGeometry(slot, context, profile);
    const selected = [];
    for (const edition of ["patreon", "free"]) {
      let candidates = databases[edition]
        .filter((row) => eligible(row, geometry, slot, roots, context))
        .filter(row => geometry !== "cone" || coneMaterialFits(row, profile.slotThemes?.[slot]??theme, roots, context))
        .filter(
          (row) =>
            ["cone", "line", "wall"].includes(geometry) ||
            roots.some(
              (root) => rootMatches(row, root) || parentMatches(row, root),
            ) ||
            [...nameWords].some((word) => info(row).familyWords.has(word)) ||
            [...themeWords, ...clueWords].some((word) =>
              info(row).tokens.has(word),
            ) ||
            ["energy_beam", "spell_projectile", "impact"].includes(family(row)),
        )
        ;
      const authored=candidates.filter(row=>motifRoots.some(root=>rootMatches(row,root)));
      // A real, geometry-compatible authored family is a constraint, not a
      // small ranking bonus that generic element/name matches can defeat.
      const upgraded=candidates.filter(row=>upgrades.some(root=>rootMatches(row,root)));
      if(upgraded.length)candidates=upgraded;
      else if(profile!==defaults && authored.length)candidates=authored;
      const ranked = candidates.map((row) => {
          const {
            key,
            familyWords,
            tokens,
            parts,
            geometry: shape,
          } = info(row);
          let score = 0;
          const nameHits = [...nameWords].filter((t) => familyWords.has(t));
          score += nameHits.length * (slot === "cast" ? 4 : 28);
          const normalizedName = [...nameWords].join(""),
            normalizedFamily = [...familyWords].join("");
          if (normalizedName && normalizedName === normalizedFamily)
            score += slot === "cast" ? 10 : 95;
          for (const token of clueWords) if (tokens.has(token)) score += 10;
          for (const token of themeWords) if (tokens.has(token)) score += 9;
          const motifAt = motifRoots.findIndex((root) =>
            rootMatches(row, root),
          );
          const defaultAt = defaultRoots.findIndex((root) =>
            rootMatches(row, root),
          );
          if (motifAt >= 0)
            score += profile === defaults ? 30 : 60 - Math.min(motifAt, 5) * 5;
          if (slot === "area" && context.delivery === "line" && motifAt >= 0)
            score += 180 - Math.min(motifAt, 5) * 15;
          if (
            motifAt >= 0 &&
            profile !== defaults &&
            ["aura", "cast"].includes(slot)
          )
            score += 90;
          if (defaultAt >= 0) {
            score += 25 - Math.min(defaultAt, 5) * 3;
            // Material at the casting source (leaves, feathers, static, runes)
            // is intentional. A generic "cast_" role bonus must not erase it.
            if (slot === "cast" && defaultAt === 0) score += 35;
          }
          if (
            motifAt < 0 &&
            motifRoots.some((root) => parentMatches(row, root))
          )
            score += 42;
          if (
            !motifRoots.some((root) => rootMatches(row, root)) &&
            conflictingElements.some((alias) => parts.has(alias))
          )
            score -= 18;
          const color = colors[theme] ?? "purple";
          if (parts.has(color)) score += 9;
          else if (key.includes(color)) score += 3;
          if (slot === "cast" && /\.caster\.|\.source\.|cast_/.test(key))
            score += 20;
          if (
            slot === "hit" &&
            /\.target\.|\.explosion\.|\.burst\.|\.impact\./.test(key)
          )
            score += 16;
          if (
            ["hit", "cast", "area"].includes(slot) &&
            /\.loop\b|loop_/.test(key)
          )
            score -= 18;
          if (slot === "aura" && /\.loop\b|loop_/.test(key)) score += 12;
          if (slot === "hit" && /\.caster\.|\.source\./.test(key)) score -= 40;
          if (slot === "cast" && /\.target\./.test(key)) score -= 20;
          if (/reversed/.test(key)) score -= 10;
          if (slot === "bolt" && /\.return\b/.test(key)) score -= 180;
          if (geometry === "projectile" && shape === "beam") score -= 12;
          // Generic artistic fallbacks remain available even without lexical match.
          if (score === 0)
            score =
              family(row) ===
              (geometry === "beam"
                ? "energy_beam"
                : geometry === "projectile"
                  ? "spell_projectile"
                  : "impact")
                ? 1
                : -100;
          return { row, score };
        })
        .sort(
          (a, b) => b.score - a.score || colorAffinity(b.row.key, colors[profile.slotThemes?.[slot] ?? theme] ?? "purple") - colorAffinity(a.row.key, colors[profile.slotThemes?.[slot] ?? theme] ?? "purple") || a.row.key.localeCompare(b.row.key),
        );
      const winner = ranked[0]?.row;
      if (!winner)
        throw Error(
          `No ${edition} ${theme}/${slot} ${geometry} media for ${context.name ?? "default profile"}`,
        );
      context.onSelection?.({
        edition,
        slot,
        key: winner.key,
        geometry,
        score: ranked[0].score,
        matchedHints: roots.filter((root) => rootMatches(winner, root)),
        nameMatches: [...nameWords].filter((word) =>
          info(winner).familyWords.has(word),
        ),
        colorMatch: info(winner)
          .key.split(".")
          .includes(colors[theme] ?? "purple"),
        reason: roots.some((root) => rootMatches(winner, root))
          ? "geometry-compatible family hint"
          : "geometry-compatible semantic inventory match",
      });
      if (!selected.includes(winner.key)) selected.push(winner.key);
    }
    result[slot] = selected;
  }
  return result;
}
