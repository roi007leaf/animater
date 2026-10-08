import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { persistentProbe } from "./probe-cache.mjs";
export const modulesRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const SOUND_PACKS = {
  ggg: "GGG: Sequencer Sound DB Collection",
  psfx: "PSFX - Peri's Sound Effects",
  soundfxlibrary: "SoundFx Library",
  "pf2e-creature-sounds": "PF2e Creature Sounds",
};
export const audioFile = /\.(ogg|mp3|wav|flac|m4a|webm)$/i;
const exec = promisify(execFile);
// A quieter recording remains quieter: automatic balancing only attenuates.
// Mean-volume measurement is a conservative SFX check, not perceived LUFS.
export function automaticSoundGain(meanDb, peakDb) {
  if (!Number.isFinite(meanDb) || !Number.isFinite(peakDb)) return 1;
  return Math.max(.05, Math.min(1, 10 ** ((-20 - meanDb) / 20), 10 ** ((-3 - peakDb) / 20)));
}
const probes = new Map();
export function probeSoundFile(file) {
  const full = path.resolve(modulesRoot, "..", file);
  if (!probes.has(file)) probes.set(file, persistentProbe(import.meta.url, "sound", full, null, async () => {
    const [{ stdout }, { stderr }] = await Promise.all([
      exec("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", full], { windowsHide: true }),
      exec("ffmpeg", ["-hide_banner", "-nostats", "-threads", "1", "-i", full, "-af", "volumedetect", "-f", "null", "-"], { windowsHide: true }),
    ]);
    const nativeDuration = Math.ceil(Number(stdout.trim()) * 1000);
    const meanDb = Number(stderr.match(/mean_volume:\s*(-?[\d.]+)/)?.[1]);
    const peakDb = Number(stderr.match(/max_volume:\s*(-?[\d.]+)/)?.[1]);
    if (!(nativeDuration > 0) || !Number.isFinite(meanDb) || !Number.isFinite(peakDb)) throw Error(`Invalid or silent sound: ${file}`);
    return { nativeDuration, meanDb, peakDb, gain: Number(automaticSoundGain(meanDb, peakDb).toFixed(5)) };
  }));
  return probes.get(file);
}
async function walk(dir) {
  try {
    return (
      await Promise.all(
        (await readdir(dir, { withFileTypes: true })).map((d) =>
          d.isDirectory()
            ? walk(path.join(dir, d.name))
            : audioFile.test(d.name)
              ? [path.join(dir, d.name)]
              : [],
        ),
      )
    ).flat();
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}
function flatten(value, key) {
  if (typeof value === "string") return [{ key, file: value }];
  if (Array.isArray(value)) return value.flatMap((v) => flatten(v, key));
  return Object.entries(value ?? {}).flatMap(([k, v]) =>
    flatten(v, `${key}.${k}`),
  );
}
export async function soundInventory() {
  const entries = [],
    packs = [];
  for (const [module, title] of Object.entries(SOUND_PACKS)) {
    const files = await walk(path.join(modulesRoot, module));
    let registered = [];
    if (files.length && ["ggg", "psfx"].includes(module)) {
      const filename =
        module === "ggg" ? "scripts/soundDB.js" : "scripts/psfx_sequencer.js";
      // These two installed database builders contain data only; no module hooks.
      const source = await readFile(
        path.join(modulesRoot, module, filename),
        "utf8",
      );
      const db = await import(
        "data:text/javascript;base64," + Buffer.from(source).toString("base64")
      );
      if (module === "psfx") await db.registerPSFXDatabase("modules/psfx");
      registered = flatten(
        module === "ggg" ? db.database : db.psfxDatabase,
        module === "ggg" ? db.DB_PREFIX : "psfx",
      );
    } else
      registered = files.map((f) => ({
        key: "",
        file: "modules/" + path.relative(modulesRoot, f).replaceAll("\\", "/"),
      }));
    entries.push(...registered.map((e) => ({ ...e, module, title })));
    const manifest = JSON.parse(
      await readFile(
        path.join(modulesRoot, module, "module.json"),
        "utf8",
      ).catch(() => "{}"),
    );
    packs.push({
      module,
      title,
      version: manifest.version ?? "",
      files: files.length,
      registered: registered.length,
    });
  }
  return { entries, packs };
}
