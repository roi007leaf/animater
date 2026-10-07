import { createHash } from "node:crypto";
import {effectIdentity} from './spell-identity-audit.mjs';
// Compare rendering settings, never display labels, IDs or disabled options.
export function visualFingerprint(recipe, database) {
  const keys = new Map(database.map((row) => [row.key, row.file ?? row.key]));
  const stages = recipe.stages.map((s) => {
    if (s.kind === "motion")
      return {
        kind: s.kind,
        subject: s.subject,
        motion: s.motion,
        delay: s.delay,
        duration: s.duration,
        repeats: s.repeats,
        repeatGap: s.repeatGap,
        targetStagger: s.targetStagger,
        distance: ["pulse", "spin"].includes(s.motion) ? undefined : s.distance,
        intensity: s.intensity,
      };
    const ignored = new Set([
      "stageId",
      "label",
      "assets",
      "soundFile",
      "volume",
      "motion",
      "distance",
      "intensity",
    ]);
    if (s.kind !== "sprite")
      for (const key of ["copies", "copySpread", "shadow"]) ignored.add(key);
    if (s.kind !== "travel") ignored.add("travelOrigin");
    if (s.kind !== "projectile")
      for (const key of [
        "perSquare",
        "moveDelay",
        "moveEase",
        "landingGroup",
        "scatter",
      ])
        ignored.add(key);
    if (s.kind !== "overlay") ignored.add("overlayFit");
    if (!s.tintEnabled) ignored.add("tint");
    if (!s.glow) ignored.add("glowColor");
    if (!s.customAnchor && s.kind !== "overlay")
      for (const key of ["anchorX", "anchorY"]) ignored.add(key);
    if (!s.attach && s.kind !== "aura")
      for (const key of ["bindRotation", "bindAlpha"]) ignored.add(key);
    for (const [value, duration] of [
      ["scaleIn", "scaleInDuration"],
      ["scaleOut", "scaleOutDuration"],
      ["rotateIn", "rotateInDuration"],
      ["rotateOut", "rotateOutDuration"],
    ])
      if (!s[duration]) ignored.add(value);
    const result = Object.fromEntries(
      Object.entries(s).filter(([key]) => !ignored.has(key)),
    );
    result.afterStage = s.afterStage
      ? recipe.stages.findIndex((p) => p.stageId === s.afterStage)
      : "";
    if (s.kind !== "sprite")
      result.media =
        keys.get(s.assets.find((key) => keys.has(key))) ?? "missing";
    return result;
  });
  return createHash("sha256").update(JSON.stringify(stages)).digest("hex");
}
export function auditDesigns(spells, recipeFor, databases) {
  const groups = new Map();
  const editionGroups = Object.fromEntries(
    Object.keys(databases).map((key) => [key, new Set()]),
  );
  let motionRecipes = 0,
    motionStages = 0,
    authored = 0;
  const motifs = {},
    motions = {};
  for (const spell of spells) {
    if(spell.design.unavailable){spell.design.sharedCount=0;spell.design.sharedWith=[];continue;}
    const recipe = recipeFor(spell);
    const fingerprints = Object.entries(databases).map(([edition, db]) => {
      const fp = effectIdentity(recipe, db);
      editionGroups[edition].add(fp);
      return fp;
    });
    const fingerprint = fingerprints.join(":");
    if (!groups.has(fingerprint)) groups.set(fingerprint, []);
    groups.get(fingerprint).push(spell);
    const native = recipe.stages.filter((s) => s.kind === "motion");
    if (native.length) motionRecipes++;
    motionStages += native.length;
    for (const s of native) motions[s.motion] = (motions[s.motion] ?? 0) + 1;
    motifs[spell.design.motif] = (motifs[spell.design.motif] ?? 0) + 1;
    if (spell.design.authored) authored++;
  }
  for (const rows of groups.values())
    for (const spell of rows) {
      spell.design.sharedCount = rows.length;
      spell.design.sharedWith = rows
        .filter((s) => s.id !== spell.id)
        .slice(0, 3)
        .map((s) => s.name);
    }
  return {
    unconfigured:spells.filter(s=>s.design.unavailable).map(s=>({id:s.id,name:s.name})),
    missingDescriptions: spells
      .filter((s) => !s.design.descriptionChars)
      .map((s) => ({ id: s.id, name: s.name })),
    descriptionsAnalyzed: spells.filter(
      (s) => s.design.analysis === "full-description",
    ).length,
    individuallyReviewed: authored,
    motifs,
    motionRecipes,
    motionStages,
    motions,
    distinctCompositions: groups.size,
    distinctByEdition: Object.fromEntries(
      Object.entries(editionGroups).map(([k, v]) => [k, v.size]),
    ),
    methodology:
      "Selected movies and visible effect layout per JB2A edition. Excludes names, IDs, sounds, token motion, timing and rank scaling. Casting seals count as visible composition changes; this is not a count of bespoke artwork or independently reviewed spell fiction.",
    sharedGroups: [...groups.values()]
      .filter((rows) => rows.length > 1)
      .sort((a, b) => b.length - a.length)
      .map((rows) => ({
        count: rows.length,
        spells: rows.map((s) => ({ id: s.id, name: s.name })),
      })),
  };
}
