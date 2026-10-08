import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

export const DND5E_SOURCE_REF = "release-6.0.5";
export const DND5E_SOURCE_SHA = "3ee48de02f8f6f7b2638c9f6cf3e9540c9c181cc";
const repository = "foundryvtt/dnd5e";
const moduleRoot = fileURLToPath(new URL("../", import.meta.url));
export const dnd5eSourceCache = join(moduleRoot, ".cache", "dnd5e-source", DND5E_SOURCE_SHA);
const sourceURL = path => `https://github.com/${repository}/blob/${DND5E_SOURCE_SHA}/${path}`;
async function fetchText(url) {
  const response = await fetch(url, { headers: { "User-Agent": "Animater-catalog" } });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.text();
}
export function descriptionText(html = "") {
  return String(html).replace(/@(?:UUID|Embed)\[([^\]]+)\](?:\{([^}]+)\})?/g, (_, id, label) => label ?? id.split(".").at(-1))
    .replace(/&reference\[([^\]]+)\](?:\{([^}]+)\})?/gi,(_,reference,label)=>label??reference.split(/\s+(?:apply|format|type)=/)[0])
    .replace(/\[\[.*?\]\]/g, " ").replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}
function mergeObjects(base, addition) {
  const value = structuredClone(base ?? {});
  for (const [key, next] of Object.entries(addition ?? {})) {
    if (next && typeof next === "object" && !Array.isArray(next)) value[key] = mergeObjects(value[key], next);
    else value[key] = structuredClone(next);
  }
  return value;
}
export function effectiveActivity(source, activity) {
  const effective = structuredClone(activity);
  const rider = source?.flags?.dnd5e?.riders?.activity?.includes(activity._id);
  for (const field of ["activation", "duration", "range", "target"]) {
    if (!rider && !activity[field]?.override && !activity[field]?.overrideSet && source?.system?.[field]) {
      effective[field] = mergeObjects(effective[field], source.system[field]);
    }
  }
  return effective;
}
export function sourceActivities(source, { effective = false } = {}) {
  return Object.entries(source?.system?.activities ?? {}).map(([id, activity]) => {
    const row = { ...activity, _id: activity._id ?? id };
    return effective ? effectiveActivity(source, row) : row;
  });
}
export function sourceEffects(source) { return Array.isArray(source?.effects) ? source.effects : []; }
export function hasNativeActivation(source) {
  return sourceActivities(source, {effective:true}).some(a => ["action", "bonus", "reaction", "minute", "hour", "special", "legendary", "lair", "crew"].includes(a.activation?.type)
    || ["attack", "save", "damage", "heal", "summon", "cast", "enchant", "forward"].includes(a.type));
}
export async function dnd5eConfiguration(tree) {
  const cacheFile = join(dnd5eSourceCache, "configuration.json");
  try { const cached=JSON.parse(await readFile(cacheFile, "utf8")); if(cached.revision===3)return cached; } catch {}
  const load = async path => {
    const file = join(dnd5eSourceCache, path.replaceAll("/", "-"));
    try { return await readFile(file, "utf8"); }
    catch { const text = await fetchText(`https://raw.githubusercontent.com/${repository}/${DND5E_SOURCE_SHA}/${path}`); await writeFile(file, text); return text; }
  };
  const config = await load("module/config.mjs");
  const language = JSON.parse(await load("lang/en.json"));
  const literal = name => {
    const match = config.match(new RegExp(`^DND5E\\.${name} = (\\{[\\s\\S]*?^\\});`, "m"));
    if (!match) throw new Error(`Native configuration ${name} not found.`);
    return JSON.parse(JSON.stringify(runInNewContext(`(${match[1]})`, {}, {timeout:1000})));
  };
  const conditionTypes = literal("conditionTypes");
  const statusEffects = literal("statusEffects");
  const encumbrance = literal("encumbrance");
  const bloodied = literal("bloodied");
  const paths = ["packs/_source/content24/appendices/rules-glossary.yml", "packs/_source/content24/appendices/appendix-d-rule-references.yml", "packs/_source/rules/appendix-a-conditions.yml", "packs/_source/rules/appendix-e-rules.yml"];
  const entries = [];
  for (const path of paths) {
    const entry = tree.tree.find(e => e.path === path);
    if (!entry) throw new Error(`Native condition rules missing: ${path}`);
    const file = join(dnd5eSourceCache, `${entry.sha}.yml`);
    try { await readFile(file); } catch { await writeFile(file, await load(path)); }
    entries.push({...entry, pack:path.split("/")[2],file});
  }
  const journalFile = join(dnd5eSourceCache, "condition-journals.json");
  const requestFile = join(dnd5eSourceCache, "condition-convert.json");
  await writeFile(requestFile, JSON.stringify({entries, output:journalFile}));
  execFileSync("python", [fileURLToPath(new URL("./dnd5e-yaml-cache.py", import.meta.url)), requestFile], {encoding:"utf8"});
  const journals = JSON.parse(await readFile(journalFile,"utf8"));
  const definitions = { ...statusEffects, ...conditionTypes, ...encumbrance.effects, bloodied };
  const localized = {};
  const flattenLanguage = (object, prefix="") => { for (const [key,value]of Object.entries(object)) { const name=prefix?`${prefix}.${key}`:key; if(value&&typeof value==="object")flattenLanguage(value,name);else localized[name]=value; } };
  flattenLanguage(language);
  const localize = key => localized[key] ?? key;
  const conditions = Object.entries(definitions).map(([id, definition]) => {
    const ref = definition.reference?.split(".");
    const journal = ref ? journals.find(r => r.pack===ref[2] && r.source._id===ref[4]) : null;
    const page = journal?.source.pages?.find(p => p._id===ref?.[6]);
    const html = page?.text?.content ?? page?.system?.description ?? page?.system?.tooltip ?? "";
    const name = localize(definition.name);
    const nativeId = (`dnd5e${id}`).slice(0,16).padEnd(16,"0");
    return { pack:"conditions",path:journal?.path ?? "module/config.mjs",blobSha:journal?.blobSha ?? tree.tree.find(e=>e.path==="module/config.mjs")?.sha, source:{_id:nativeId,name,type:"condition",img:definition.img,statuses:[id],system:{type:id,description:{value:html}},flags:{dnd5e:{nativeStatus:true,pseudo:!!definition.pseudo}}},uuid:definition.reference??null,edition:"both",sourceBook:"Native system status",sourceURL:sourceURL(journal?.path??"module/config.mjs"),description:descriptionText(html),activities:[],effectiveActivities:[],effects:[],statusId:id,nativeId,definition,descriptionAvailable:!!html };
  });
  const value = {revision:3,conditionTypes,statusEffects,encumbrance,bloodied,conditions};
  await writeFile(cacheFile, JSON.stringify(value));
  return value;
}
export async function dnd5eSources() {
  await mkdir(dnd5eSourceCache, { recursive: true });
  const treeFile = join(dnd5eSourceCache, "tree.json");
  let tree;
  try { tree = JSON.parse(await readFile(treeFile, "utf8")); }
  catch { tree = JSON.parse(await fetchText(`https://api.github.com/repos/${repository}/git/trees/${DND5E_SOURCE_SHA}?recursive=1`)); await writeFile(treeFile, JSON.stringify(tree)); }
  if (tree.truncated || tree.sha !== DND5E_SOURCE_SHA) throw new Error("Incomplete or unpinned D&D source tree.");
  const manifestFile = join(dnd5eSourceCache, "system.json");
  let manifest;
  try { manifest = JSON.parse(await readFile(manifestFile, "utf8")); }
  catch { manifest = JSON.parse(await fetchText(`https://raw.githubusercontent.com/${repository}/${DND5E_SOURCE_SHA}/system.json`)); await writeFile(manifestFile, JSON.stringify(manifest)); }
  const packs = manifest.packs.filter(p => ["Item", "ActiveEffect"].includes(p.type));
  const packNames = new Set(packs.map(p => p.name));
  const entries = tree.tree.filter(e => /^packs\/_source\/[^/]+\/.+\.ya?ml$/.test(e.path) && !/\/_folders?\.ya?ml$/.test(e.path) && packNames.has(e.path.split("/")[2]))
    .map(e => ({...e, pack: e.path.split("/")[2], file: join(dnd5eSourceCache, `${e.sha}.yml`)}));
  let cursor = 0;
  await Promise.all(Array.from({length: 12}, async () => { while (cursor < entries.length) {
    const entry = entries[cursor++];
    try { await readFile(entry.file); } catch { await writeFile(entry.file, await fetchText(`https://raw.githubusercontent.com/${repository}/${DND5E_SOURCE_SHA}/${entry.path}`)); }
  } }));
  const rowsFile = join(dnd5eSourceCache, "rows.json");
  let rows;
  try { rows = JSON.parse(await readFile(rowsFile, "utf8")); if (rows.length !== entries.length) throw new Error("stale cache"); }
  catch {
    const requestFile = join(dnd5eSourceCache, "convert.json");
    await writeFile(requestFile, JSON.stringify({entries, output: rowsFile}));
    execFileSync("python", [fileURLToPath(new URL("./dnd5e-yaml-cache.py", import.meta.url)), requestFile], {encoding:"utf8"});
    rows = JSON.parse(await readFile(rowsFile, "utf8"));
  }
  const packMap = new Map(packs.map(p => [p.name,p]));
  rows = rows.map(row => ({...row, uuid: `Compendium.dnd5e.${row.pack}.${packMap.get(row.pack).type}.${row.source._id}`, edition: row.pack === "effects" ? "both" : row.pack.endsWith("24") ? "2024" : "2014", sourceBook: packMap.get(row.pack).flags?.dnd5e?.sourceBook ?? "SRD", sourceURL: sourceURL(row.path), description: descriptionText(row.source.system?.description?.value ?? row.source.description ?? ""), activities: sourceActivities(row.source), effectiveActivities:sourceActivities(row.source,{effective:true}), effects: sourceEffects(row.source)}))
    .sort((a,b) => a.source.name.localeCompare(b.source.name) || a.pack.localeCompare(b.pack));
  const configuration = await dnd5eConfiguration(tree);
  return { ref: DND5E_SOURCE_REF, sha: DND5E_SOURCE_SHA, systemVersion: manifest.version, packs, rows, configuration, spells: rows.filter(r => r.source.type === "spell"), features: rows.filter(r => r.source.type === "feat"), weapons: rows.filter(r => r.source.type === "weapon"), items: rows.filter(r => !["spell","feat","weapon"].includes(r.source.type) && packMap.get(r.pack).type === "Item"), conditions: configuration.conditions, standaloneEffects: rows.filter(r => r.pack === "effects" && r.source.type !== "condition"), embeddedEffects: rows.flatMap(row => row.effects.map(effect => ({...row, parent: row.source, source: effect, uuid: `${row.uuid}.ActiveEffect.${effect._id}`, description: descriptionText(effect.description ?? row.source.system?.description?.value ?? "")}))) };
}
// Official D&D book modules (PHB, DMG, MM…) the developer owns, exported from a running
// Foundry into .cache/dnd5e-books (never committed or shipped). Rows mirror the SRD rows
// so the same generator builds them; their text is read here and never written out.
export const dnd5eBookCache = join(moduleRoot, ".cache", "dnd5e-books");
export async function dnd5eBookSources() {
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(dnd5eBookCache).catch(() => [])).filter(f => f.endsWith(".json")).sort();
  const rows = [];
  for (const file of files) {
    const { module, pack, items } = JSON.parse(await readFile(join(dnd5eBookCache, file), "utf8"));
    for (const source of items) {
      const row = { pack: `${module.replace(/^dnd-/, "")}-${pack}`, book: module, source, uuid: `Compendium.${module}.${pack}.Item.${source._id}`,
        edition: source.system?.source?.rules === "2014" ? "2014" : "2024", sourceBook: source.system?.source?.book ?? module,
        description: descriptionText(source.system?.description?.value ?? ""), activities: sourceActivities(source),
        effectiveActivities: sourceActivities(source, { effective: true }), effects: sourceEffects(source) };
      rows.push(row);
    }
  }
  rows.sort((a, b) => a.source.name.localeCompare(b.source.name) || a.pack.localeCompare(b.pack));
  return { rows, spells: rows.filter(r => r.source.type === "spell"), features: rows.filter(r => r.source.type === "feat"),
    weapons: rows.filter(r => r.source.type === "weapon"), items: rows.filter(r => !["spell", "feat", "weapon"].includes(r.source.type)) };
}
if (process.argv.includes("--inspect")) {
  const data = await dnd5eSources();
  const counts = {rows:data.rows.length, spells:data.spells.length, features:data.features.length, activeFeatures:data.features.filter(r=>hasNativeActivation(r.source)).length, weapons:data.weapons.length, items:data.items.length, activeItems:data.items.filter(r=>hasNativeActivation(r.source)).length, conditions:data.conditions.length, standaloneEffects:data.standaloneEffects.length, embeddedEffects:data.embeddedEffects.length};
  const manifest = {ref:data.ref,sha:data.sha,systemVersion:data.systemVersion,sourceLicense:"MIT system code; CC-BY-4.0 SRD 5.1 and SRD 5.2 text. Public official system packs only.",sourceCache:`.cache/dnd5e-source/${data.sha}/rows.json`,counts,packs:data.packs.map(p=>({...p,rows:data.rows.filter(r=>r.pack===p.name).length})),rows:data.rows.map(({source, activities,effectiveActivities,effects,...r})=>({...r,id:source._id,name:source.name,type:source.type,activityIds:activities.map(a=>a._id),effectIds:effects.map(e=>e._id),description:undefined})),conditions:data.conditions.map(r=>({id:r.statusId,nativeId:r.nativeId,name:r.source.name,uuid:r.uuid,sourceURL:r.sourceURL,descriptionAvailable:r.descriptionAvailable}))};
  await writeFile(join(moduleRoot,"data","dnd5e-source-manifest.json"), JSON.stringify(manifest,null,2)+"\n");
  console.log(JSON.stringify({ref:data.ref,sha:data.sha,systemVersion:data.systemVersion,...counts,packs:manifest.packs.map(p=>({name:p.name,rows:p.rows,type:p.type}))},null,2));
}
