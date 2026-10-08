import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
async function fetchJSON(url) {
  // GITHUB_TOKEN lifts the 60 requests/hour anonymous API limit.
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(url, { headers: { "User-Agent": "Animater-feat-catalog", ...(token && url.startsWith("https://api.github.com/") ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!response.ok) throw Error(`${response.status}: ${url}`);
  return response.json();
}

// Pin compendium data, including descriptions, to the same revision as spells.
// Meta actions animate through their own catalogs (weapon Strikes, spells) or
// have no visible act of their own.
const META_ACTIONS = new Set(["strike", "cast-a-spell", "sustain", "sustain-a-spell", "delay", "ready", "interact", "release", "activate-an-item"]);
// pack: "feats" (default), "classfeatures" or "actions" — separate catalogs built by the same pipeline.
export async function featSources(ref = "pf2e-8.5.1", pack = "feats") {
  const repository = "foundryvtt/pf2e";
  const tree = await fetchJSON(`https://api.github.com/repos/${repository}/git/trees/${ref}?recursive=1`);
  if (tree.truncated) throw Error("PF2e source tree truncated; feat coverage cannot be established.");
  const packPattern = pack === "feats" ? /^packs\/(?:pf2e\/)?feats(?:-srd)?\/.+\.json$/ : new RegExp(`^packs\\/(?:pf2e\\/)?${pack}\\/.+\\.json$`);
  const paths = tree.tree.filter((entry) => packPattern.test(entry.path) && !entry.path.endsWith("/_folders.json"));
  if (!paths.length) throw Error(`No feat sources found in ${ref}.`);
  const cache = join(tmpdir(), "animater-pf2e-source", tree.sha);
  await mkdir(cache, { recursive: true });
  const feats = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: 16 }, async () => {
    while (cursor < paths.length) {
      const entry = paths[cursor++];
      const file = join(cache, `${entry.sha}.json`);
      let source;
      try { source = JSON.parse(await readFile(file, "utf8")); }
      catch {
        source = await fetchJSON(`https://raw.githubusercontent.com/${repository}/${tree.sha}/${entry.path}`);
        await writeFile(file, JSON.stringify(source));
      }
      const slug = source.system?.slug ?? entry.path.split("/").at(-1).replace(/\.json$/, "");
      if (source.type === "feat" || (pack === "actions" && source.type === "action" && !META_ACTIONS.has(slug))) feats.push({ path: entry.path, sha: entry.sha, source });
    }
  }));
  return { ref, sha: tree.sha, count: paths.length, feats: feats.sort((a, b) => a.source.name.localeCompare(b.source.name) || a.path.localeCompare(b.path)) };
}

if (process.argv.includes("--inspect")) {
  const data = await featSources();
  const counts = {};
  for (const { source } of data.feats) {
    const key = `${source.system.actionType?.value ?? "missing"}:${source.system.actions?.value ?? "null"}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  console.log(JSON.stringify({ ref: data.ref, sha: data.sha, paths: data.count, feats: data.feats.length, counts,
    examples: data.feats.filter(({ source }) => /^(Sudden Charge|Vicious Swing|Power Attack|Double Slice|Flurry of Blows|Intimidating Strike|Battle Medicine|Lay on Hands|Flying Flame|Elemental Blast|Reactive Strike|Deflecting Wave|Fresh Produce)$/.test(source.name)) }, null, 2));
}
