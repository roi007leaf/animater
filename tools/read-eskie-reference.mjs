const repository = "aljames-arctic/eskie-macro-pack";
const response = await fetch(
  `https://api.github.com/repos/${repository}/git/trees/main?recursive=1`,
  { headers: { "User-Agent": "Animater-design-research" } },
);
if (!response.ok) throw Error(`Eskie source unavailable: ${response.status}`);
const tree = await response.json();
if (tree.truncated) throw Error("Reference tree truncated");
const paths = tree.tree.filter(
  (e) =>
    e.type === "blob" &&
    e.path.startsWith("src/animation/") &&
    e.path.endsWith(".js"),
);
if (process.argv.includes("--list"))
  console.log(paths.map((e) => e.path).join("\n"));
else {
  const wanted = process.argv.slice(2);
  for (const entry of paths.filter((e) =>
    wanted.some((s) => e.path.endsWith(`/${s}.js`)),
  )) {
    const r = await fetch(
      `https://raw.githubusercontent.com/${repository}/${tree.sha}/${entry.path}`,
    );
    if (!r.ok) throw Error(`Reference missing ${entry.path}`);
    const text = await r.text();
    // Research output only. No reference source is written into the module.
    console.log(`${entry.path} (${tree.sha})\n${text}`);
  }
}
