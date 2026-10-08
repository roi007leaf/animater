// Static module graph for the incremental catalog build (tools/build.mjs).
// Follows import/export-from, literal dynamic import() and
// new URL("<literal>", import.meta.url) references to files inside the module.
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as acorn from "acorn";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const rel = file => relative(ROOT, file).split(sep).join("/");
const SCANNED = /\.(?:mjs|js)$/;

function walk(node, visit) {
  if (!node || typeof node.type !== "string") return;
  visit(node);
  for (const key in node) {
    const value = node[key];
    if (key === "type" || key === "start" || key === "end") continue;
    if (Array.isArray(value)) for (const child of value) walk(child, visit);
    else if (value && typeof value.type === "string") walk(value, visit);
  }
}
const literal = node => node?.type === "Literal" && typeof node.value === "string" ? node.value
  : node?.type === "TemplateLiteral" && !node.expressions.length ? node.quasis[0].value.cooked : null;
const isImportMetaUrl = node => node?.type === "MemberExpression" && node.object?.type === "MetaProperty" && node.property?.name === "url";

const refsCache = new Map();
// Parsed references survive between runs, keyed by path and content hash.
const PARSE_CACHE = resolve(ROOT, ".cache/build-graph-cache.json"), PARSE_VERSION = 2;
let parsed = null, parsedDirty = false;
function parseCache() {
  if (!parsed) { try { parsed = JSON.parse(readFileSync(PARSE_CACHE, "utf8")); if (parsed.version !== PARSE_VERSION) throw 0; } catch { parsed = { version: PARSE_VERSION }; } }
  return parsed;
}
export function saveGraphCache() {
  if (!parsedDirty) return;
  const keep = { version: PARSE_VERSION };
  for (const [key, info] of Object.entries(parsed)) if (key.includes("@") && fileHash(key.split("@")[0]) === key.split("@")[1]) keep[key] = info;
  mkdirSync(dirname(PARSE_CACHE), { recursive: true });
  writeFileSync(PARSE_CACHE, JSON.stringify(keep));
  parsedDirty = false;
}
// A module whose top level only declares (imports, const bindings, functions,
// a default export) has no evaluation side effects beyond its exports.
const DECLARATIVE = new Set(["ImportDeclaration", "FunctionDeclaration", "ExportDefaultDeclaration", "EmptyStatement"]);
const declarative = ast => ast.body.every(n => DECLARATIVE.has(n.type) || (n.type === "VariableDeclaration" && n.kind === "const"));

// Parsed facts about one source file: module-relative references (absolute
// paths of existing files) and whether its top level is purely declarative.
export function moduleInfo(file) {
  if (refsCache.has(file)) return refsCache.get(file);
  const existing = list => new Set(list.map(r => resolve(ROOT, r)).filter(r => existsSync(r) && statSync(r).isFile()));
  if (!SCANNED.test(file)) { const info = { refs: new Set(), declarative: false }; refsCache.set(file, info); return info; }
  const key = `${rel(file)}@${fileHash(rel(file))}`;
  let cached = parseCache()[key];
  if (!cached) {
    // Candidates are cached before the existence check so a file created later is picked up.
    const candidates = new Set();
    const ast = acorn.parse(readFileSync(file, "utf8"), { ecmaVersion: "latest", sourceType: "module", allowHashBang: true });
    const add = spec => {
      if (!spec || !(spec.startsWith("./") || spec.startsWith("../"))) return;
      const target = resolve(dirname(file), spec.split(/[?#]/)[0]);
      if (target.startsWith(ROOT + sep)) candidates.add(rel(target));
    };
    walk(ast, node => {
      if (["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"].includes(node.type) && node.source) add(literal(node.source));
      else if (node.type === "ImportExpression") add(literal(node.source));
      else if (node.type === "NewExpression" && node.callee?.name === "URL" && isImportMetaUrl(node.arguments?.[1])) add(literal(node.arguments[0]));
    });
    cached = parseCache()[key] = { refs: [...candidates], declarative: declarative(ast) };
    parsedDirty = true;
  }
  const info = { refs: existing(cached.refs), declarative: cached.declarative };
  refsCache.set(file, info);
  return info;
}
export const moduleReferences = file => moduleInfo(file).refs;

// Transitive closure from entry files, skipping `exclude`d paths entirely
// (a builder's own outputs: their content is not its input).
export function closure(entries, { exclude = new Set() } = {}) {
  const seen = new Set(), queue = entries.map(e => resolve(ROOT, e));
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file) || exclude.has(rel(file))) continue;
    seen.add(file);
    for (const ref of moduleReferences(file)) queue.push(ref);
  }
  return [...seen].map(rel).sort();
}

const hashCache = new Map();
export function fileHash(path) {
  const file = resolve(ROOT, path);
  if (!hashCache.has(file)) hashCache.set(file, existsSync(file) ? createHash("sha256").update(readFileSync(file)).digest("hex") : "missing");
  return hashCache.get(file);
}
export function forgetHashes(paths) { for (const p of paths) hashCache.delete(resolve(ROOT, p)); }
export const digest = value => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
