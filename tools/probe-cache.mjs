// Persistent memos shared by catalog builders (results live in .cache/).
//
// persistentProbe: ffprobe/ffmpeg measurements. A cached value is reused only
// when the measured file (path, size, mtime), the measuring module's source and
// the installed ffmpeg/ffprobe build are all unchanged.
//
// persistentMemo: per-entry results of a pure, deterministic function. The key
// is a canonical serialization of every argument (undefined, NaN, -0, holes and
// object identity between arguments included), plus a salt covering the code
// and any shared inputs. Arguments that cannot be serialized exactly
// (functions, class instances, cycles) and results that do not survive a JSON
// round trip are never cached, so a hit returns exactly what compute() would.
//
// ANIMATER_PROBE_CACHE=off / ANIMATER_MEMO=off disable them (equivalence checks).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const CACHE_DIR = fileURLToPath(new URL("../.cache/", import.meta.url));
const stores = new Map();
function store(name) {
  if (!stores.has(name)) {
    const file = `${CACHE_DIR}${name}.json`;
    let data = {};
    try { data = JSON.parse(readFileSync(file, "utf8")); } catch {}
    // Keys are "<group>|<salt>|...": a group seen here with a newer salt
    // drops its stale entries on save, so caches do not grow without bound.
    const entry = { file, data, dirty: false, salts: new Map() };
    stores.set(name, entry);
    if (stores.size === 1) process.once("exit", saveAll);
  }
  return stores.get(name);
}
function saveAll() {
  for (const { file, data, dirty, salts } of stores.values()) {
    if (!dirty) continue;
    // Merge with entries other builders wrote meanwhile; losing a race only loses cache hits.
    let current = {};
    try { current = JSON.parse(readFileSync(file, "utf8")); } catch {}
    const temporary = `${file}.${process.pid}.tmp`;
    try {
      mkdirSync(CACHE_DIR, { recursive: true });
      const merged = { ...current, ...data };
      for (const key of Object.keys(merged)) {
        const [group, salt] = key.split("|", 2);
        if (salts.has(group) && salts.get(group) !== salt) delete merged[key];
      }
      writeFileSync(temporary, JSON.stringify(merged));
      renameSync(temporary, file);
    } catch {}
  }
}
const sha = (...parts) => { const h = createHash("sha256"); for (const p of parts) h.update(p); return h.digest("hex"); };

// ------------------------------------------------------------------ probes ----
const probeEnabled = process.env.ANIMATER_PROBE_CACHE !== "off";
const salts = new Map();
let toolVersion = null;
function tools() {
  if (toolVersion === null) {
    const first = command => { try { return execFileSync(command, ["-version"], { encoding: "utf8", windowsHide: true }).split("\n")[0].trim(); } catch { return "unavailable"; } };
    toolVersion = `${first("ffprobe")}|${first("ffmpeg")}`;
  }
  return toolVersion;
}
function moduleSalt(moduleUrl) {
  if (!salts.has(moduleUrl)) salts.set(moduleUrl, sha(readFileSync(fileURLToPath(moduleUrl)), tools()).slice(0, 16));
  return salts.get(moduleUrl);
}

// compute() must be a deterministic function of the file and `extra`.
export async function persistentProbe(moduleUrl, kind, path, extra, compute) {
  if (!probeEnabled) return compute();
  let stamp;
  try { const info = statSync(path); stamp = `${info.size}:${info.mtimeMs}`; } catch { return compute(); }
  const key = `${kind}|${moduleSalt(moduleUrl)}|${path}|${stamp}|${JSON.stringify(extra ?? null)}`;
  const cache = store("media-probes");
  cache.salts.set(kind, moduleSalt(moduleUrl));
  if (Object.hasOwn(cache.data, key)) return structuredClone(cache.data[key]);
  const value = await compute();
  cache.data[key] = structuredClone(value);
  cache.dirty = true;
  return value;
}

// ------------------------------------------------------------------- memos ----
const memoEnabled = process.env.ANIMATER_MEMO !== "off";
class Uncacheable extends Error {}
// Exact, order-preserving encoding of plain data; shared references between
// arguments are encoded so identity checks (a === b) see the same structure.
export function canonical(value) {
  const ids = new Map(), active = new Set();
  const encode = v => {
    if (v === undefined) return { $: "u" };
    if (typeof v === "number") return Number.isFinite(v) && !Object.is(v, -0) ? v : { $: "n", v: Object.is(v, -0) ? "-0" : String(v) };
    if (v === null || typeof v === "string" || typeof v === "boolean") return v;
    if (typeof v !== "object") throw new Uncacheable(typeof v);
    if (ids.has(v)) return { $: "ref", id: ids.get(v) };
    if (active.has(v)) throw new Uncacheable("cycle");
    const proto = Object.getPrototypeOf(v);
    if (!Array.isArray(v) && proto !== Object.prototype && proto !== null) throw new Uncacheable("class instance");
    if (Object.getOwnPropertySymbols(v).length) throw new Uncacheable("symbol keys");
    const id = ids.size;
    ids.set(v, id);
    active.add(v);
    let out;
    if (Array.isArray(v)) {
      if (Object.keys(v).length !== v.filter(() => true).length || Object.keys(v).some(k => !/^\d+$/.test(k))) throw new Uncacheable("sparse or decorated array");
      out = { $: "a", id, v: Array.from(v, (x, i) => (i in v ? encode(x) : { $: "hole" })) };
    } else {
      out = { $: proto === null ? "o0" : "o", id, v: Object.keys(v).map(k => {
        const d = Object.getOwnPropertyDescriptor(v, k);
        if (!("value" in d)) throw new Uncacheable("accessor");
        return [k, encode(d.value)];
      }) };
    }
    active.delete(v);
    return out;
  };
  return JSON.stringify(encode(value));
}

// Synchronous memo: compute() must be a pure, deterministic function of
// `args` and of whatever `salt` digests (code, shared read-only inputs).
export function persistentMemo(name, salt, args, compute) {
  if (!memoEnabled) return compute();
  const [code] = salt.split(":");
  let key;
  try { key = `${name}|${code}|${sha(salt, "\0", canonical(args))}`; } catch (error) { if (error instanceof Uncacheable) return compute(); throw error; }
  const cache = store(`memo-${name}`);
  cache.salts.set(name, code);
  if (Object.hasOwn(cache.data, key)) return structuredClone(cache.data[key]);
  const value = compute();
  let copy;
  try { copy = JSON.parse(JSON.stringify(value)); } catch { return value; }
  if (isDeepStrictEqual(copy, value)) { cache.data[key] = copy; cache.dirty = true; }
  return value;
}
