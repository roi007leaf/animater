// Measures when the common JB2A cast clips actually show something.
// JB2A webm colour planes are black wherever the clip is transparent, so the
// first/last frame whose mean luma rises 5% of the clip's peak above its black
// floor bounds the visible window. Totals use ffprobe like media-durations.
// Rebuild: rtk proxy node tools/measure-cast-windows.mjs --write
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assetDatabases, variantFiles } from "./asset-databases.mjs";

const exec = promisify(execFile);
const data = fileURLToPath(new URL("../../../", import.meta.url));
// Cast families the catalogs open with. Loops have no lead-in; outros end a circle.
const FAMILY = /^jb2a\.(cast_generic|cast_shape|magic_signs\.circle)\./;
const SKIP = /\.(loop|outro)\./;

async function measure(path) {
  const { stdout } = await exec("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", path,
    "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-", "-f", "null", "-"], { maxBuffer: 1 << 26 });
  const lines = stdout.split(/\r?\n/), frames = [];
  for (let i = 0; i < lines.length; i++) {
    const time = lines[i].match(/pts_time:([\d.]+)/), luma = lines[i + 1]?.match(/YAVG=([\d.]+)/);
    if (time && luma) frames.push([+time[1], +luma[1]]);
  }
  const floor = Math.min(...frames.map((f) => f[1]));
  const peak = Math.max(...frames.map((f) => f[1])) - floor;
  const lit = frames.filter((f) => f[1] - floor >= peak * 0.05);
  const step = frames[1][0] - frames[0][0];
  const probe = await exec("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]);
  return {
    start: Math.floor(lit[0][0] * 100) * 10,
    end: Math.round((lit.at(-1)[0] + step) * 1000),
    total: Math.ceil(Number(probe.stdout.trim()) * 1000),
  };
}

const families = new Map();
for (const rows of Object.values(await assetDatabases()))
  for (const row of rows) {
    if (!FAMILY.test(row.key) || SKIP.test(row.key + ".")) continue;
    const file = variantFiles(row).map((f) => resolve(data, f)).find(existsSync);
    if (!file) continue;
    const family = row.key.split(".").slice(0, -1).join(".");
    if (!families.has(family)) families.set(family, new Map());
    families.get(family).set(row.key, file);
  }
const windows = {};
for (const [family, members] of [...families].sort()) {
  const measured = [];
  for (const file of new Set(members.values())) measured.push(await measure(file));
  windows[family] = {
    start: Math.min(...measured.map((m) => m.start)),
    end: Math.min(Math.max(...measured.map((m) => m.end)), Math.max(...measured.map((m) => m.total))),
    total: Math.max(...measured.map((m) => m.total)),
  };
  console.log(family, JSON.stringify(windows[family]));
}
if (process.argv.includes("--write"))
  await writeFile(new URL("../data/media-visible.mjs", import.meta.url),
    `// Visible window (media ms) of JB2A cast families: blank lead-in until \`start\`,
// nothing left after \`end\`, file length \`total\`. Keyed by asset prefix; colour
// variants share their family's earliest start and latest end.
// Rebuild: rtk proxy node tools/measure-cast-windows.mjs --write
export const MEDIA_VISIBLE = {
${Object.entries(windows).map(([k, v]) => `  ${JSON.stringify(k)}: { start: ${v.start}, end: ${v.end}, total: ${v.total} },`).join("\n")}
};
`);
