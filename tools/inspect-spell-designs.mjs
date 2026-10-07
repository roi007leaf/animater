import { spellSources } from "./pf2e-source.mjs";
import { assetDatabases } from "./asset-databases.mjs";
import { PF2E_SPELLS, spellRecipe } from "../scripts/spell-catalog.mjs";
const [source, libraries] = await Promise.all([
  spellSources(),
  assetDatabases(),
]);
const names = process.argv.slice(2);
if (names.includes("--keys")) {
  for (const prefix of names.filter((n) => n !== "--keys"))
    console.log(
      prefix,
      Object.fromEntries(
        Object.entries(libraries).map(([edition, entries]) => [
          edition,
          entries
            .filter((e) => e.key.startsWith(`jb2a.${prefix}.`))
            .slice(0, 8)
            .map((e) => e.key),
        ]),
      ),
    );
} else if (names.includes("--assets")) {
  for (const [edition, entries] of Object.entries(libraries))
    console.log(
      edition,
      [...new Set(entries.map((e) => e.key.split(".")[1]))].join(", "),
    );
} else if (names.includes("--duplicates")) {
  const groups = new Map();
  for (const record of PF2E_SPELLS) {
    const stages = spellRecipe(record).stages.map(
      ({ stageId, label, tint, ...s }) => s,
    );
    const key = JSON.stringify(stages);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record.name);
  }
  console.log(
    JSON.stringify(
      {
        entries: PF2E_SPELLS.length,
        uniqueDesigns: groups.size,
        groups: [...groups.values()]
          .filter((g) => g.length > 1)
          .sort((a, b) => b.length - a.length)
          .slice(0, 12),
      },
      null,
      2,
    ),
  );
} else {
  for (const entry of source.spells.filter((e) =>
    names.includes(e.source.name.replace(/ \(Legacy\)$/, "")),
  )) {
    const item = entry.source;
    console.log(
      JSON.stringify(
        {
          name: item.name,
          path: entry.path,
          traits: item.system.traits.value,
          target: item.system.target,
          area: item.system.area,
          time: item.system.time,
          damage: item.system.damage,
          description: item.system.description.value
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim(),
        },
        null,
        2,
      ),
    );
  }
}
