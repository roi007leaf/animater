import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repository = "foundryvtt/pf2e";
export async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Animater-catalog",
      // Anonymous API calls are rate limited; use a token when one is set.
      ...(process.env.GITHUB_TOKEN && url.startsWith("https://api.github.com/") ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!response.ok) throw Error(`${response.status}: ${url}`);
  return response.json();
}
export async function spellSources(ref = "pf2e-8.5.1") {
  const tree = await fetchJSON(
    `https://api.github.com/repos/${repository}/git/trees/${ref}?recursive=1`,
  );
  if (tree.truncated)
    throw Error(
      "PF2e source tree truncated; cannot assert complete spell coverage.",
    );
  const paths = tree.tree.filter(
    (entry) =>
      /^packs\/(?:pf2e\/)?(?:spells(?:-srd)?|rituals)\/.+\.json$/.test(
        entry.path,
      ) && !entry.path.endsWith("/_folders.json"),
  );
  if (!paths.length)
    throw Error(
      `No spell sources found: ${tree.tree
        .filter((e) => e.path.includes("spell") && e.path.startsWith("packs/"))
        .slice(0, 15)
        .map((e) => e.path)
        .join(", ")}`,
    );
  const cache = join(tmpdir(), "animater-pf2e-source", tree.sha);
  await mkdir(cache, { recursive: true });
  let cursor = 0;
  const spells = [];
  await Promise.all(
    Array.from({ length: 16 }, async () => {
      while (cursor < paths.length) {
        const entry = paths[cursor++];
        const file = join(cache, `${entry.sha}.json`);
        let source;
        try {
          source = JSON.parse(await readFile(file, "utf8"));
        } catch {
          source = await fetchJSON(
            `https://raw.githubusercontent.com/${repository}/${tree.sha}/${entry.path}`,
          );
          await writeFile(file, JSON.stringify(source));
        }
        if (source.type === "spell") spells.push({ path: entry.path, source });
      }
    }),
  );
  return {
    ref,
    sha: tree.sha,
    count: paths.length,
    spells: spells.sort((a, b) => a.source.name.localeCompare(b.source.name)),
  };
}

if (process.argv.includes("--inspect")) {
  const data = await spellSources();
  console.log(
    JSON.stringify(
      {
        ref: data.ref,
        sha: data.sha,
        paths: data.count,
        spells: data.spells.length,
        examples: data.spells.filter((s) =>
          [
            "Fireball",
            "Heal",
            "Ignition",
            "Frostbite",
            "Fear",
            "Force Barrage",
            "Summon Animal",
            "Teleport",
            "Shield",
          ].includes(s.source.name),
        ),
      },
      null,
      2,
    ),
  );
}
