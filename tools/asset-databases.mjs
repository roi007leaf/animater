import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function variantFiles(row) {
  return [
    ...new Set(
      [
        row.file,
        ...(row.files ?? []),
        ...Object.values(row.distanceFiles ?? {}).flat(Infinity),
      ].filter((file) => typeof file === "string" && file.endsWith(".webm")),
    ),
  ];
}

export async function databaseEntries(source, initializer, exportName) {
  const mod = await import(
    `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
  );
  await mod[initializer]("modules");
  const entries = [];
  const templates = mod[exportName]._templates ?? {};
  const dimensions = (file) => {
    const size = file.match(/(\d+)x(\d+)\.webm$/i);
    return size ? { width: +size[1], height: +size[2] } : {};
  };
  const leaf = (file, key, inherited, extra = {}) => {
    if (typeof file !== "string" || !file.endsWith(".webm")) return;
    entries.push({ key, file, ...inherited, ...dimensions(file), ...extra });
  };
  const walk = (value, key, inherited = {}) => {
    if (typeof value === "string") {
      if (value.endsWith(".webm")) leaf(value, key, inherited);
      return;
    }
    if (Array.isArray(value)) {
      if (typeof value[0] === "string")
        leaf(value[0], key, inherited, {
          files: value.filter(
            (file) => typeof file === "string" && file.endsWith(".webm"),
          ),
        });
      return;
    }
    if (!value || typeof value !== "object") return;
    inherited = { ...inherited };
    if (value._metadata)
      inherited.metadata = { ...inherited.metadata, ...value._metadata };
    if (value._template) {
      inherited.templateName = value._template;
      inherited.template = Array.isArray(value._template)
        ? value._template
        : templates[value._template];
    }
    if (value._loop) inherited.loop = value._loop;
    const children = Object.entries(value).filter(([k]) => !k.startsWith("_"));
    if (children.some(([k]) => /^\d+ft$/.test(k))) {
      const distanceFiles = Object.fromEntries(
        children.filter(([k]) => /^\d+ft$/.test(k)),
      );
      const selected = value["15ft"] ?? children[0][1];
      const selectedFile = Array.isArray(selected) ? selected[0] : selected;
      leaf(selectedFile, key, inherited, { distanceFiles });
      return;
    }
    for (const [k, child] of children) walk(child, `${key}.${k}`, inherited);
  };
  walk(mod[exportName], "jb2a");
  return entries.sort((a, b) => a.key.localeCompare(b.key));
}
export async function assetDatabases() {
  const response = await fetch(
    "https://raw.githubusercontent.com/Jules-Bens-Aa/JB2A_DnD5e/main/scripts/jb2a_sequencer.js",
  );
  if (!response.ok)
    throw Error(`JB2A Free download failed: ${response.status}`);
  return {
    patreon: await databaseEntries(
      await readFile(
        fileURLToPath(
          new URL(
            "../../jb2a_patreon/scripts/jb2a_sequencer.js",
            import.meta.url,
          ),
        ),
        "utf8",
      ),
      "jb2aPatreonDatabase",
      "patreonDatabase",
    ),
    free: await databaseEntries(
      await response.text(),
      "jb2aFreeDatabase",
      "freeDatabase",
    ),
  };
}
if (process.argv.includes("--inspect")) {
  const databases = await assetDatabases();
  for (const [edition, entries] of Object.entries(databases)) {
    console.log(edition, entries.length);
    console.log(
      [...new Set(entries.map((e) => e.key.split(".")[1]))].join(", "),
    );
    for (const prefix of [
      "jb2a.eldritch_blast",
      "jb2a.fireball",
      "jb2a.healing",
      "jb2a.shield",
      "jb2a.magic_signs",
      "jb2a.template_circle",
      "jb2a.breath",
      "jb2a.token_border",
    ])
      console.log(
        prefix,
        entries
          .filter((e) => e.key.startsWith(prefix))
          .slice(0, 5)
          .map((e) => e.key),
      );
  }
}
