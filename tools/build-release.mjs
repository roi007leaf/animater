import { mkdir, copyFile, readFile, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { MODULE_ROOT, sha256 } from './publication-audit.mjs';
import { checkPublication } from './check-publication.mjs';

export async function stageRelease(root = MODULE_ROOT) {
  const { report, inventory } = await checkPublication(root);
  if (!report.readyForRelease) throw Error(`Release blocked: ${report.blockers.length} unresolved publication checks. Run npm run audit:publication and inspect publication/audit.json.`);
  const directory = path.join(root, 'dist', 'animater');
  // Never delete or silently replace an existing artifact. This also protects
  // against a symlink in the parent directing writes outside this workspace.
  try { await lstat(path.join(root, 'dist')); throw Error('dist already exists; choose a clean staging directory after reviewing its contents.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(directory, { recursive: true });
  for (const file of inventory.files) {
    const source = path.join(root, file.path), destination = path.join(directory, file.path);
    const bytes = await readFile(source);
    if (sha256(bytes) !== file.sha256) throw Error(`Source changed during release preparation: ${file.path}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
    if (sha256(await readFile(destination)) !== file.sha256) throw Error(`Staging copy changed: ${file.path}`);
  }
  await writeFile(path.join(root, 'dist', 'release-inventory.json'), JSON.stringify({
    id: inventory.manifest.id, version: inventory.manifest.version, codeDigest: inventory.codeDigest,
    files: inventory.files, sourceAudit: 'publication/audit.json',
  }, null, 2) + '\n');
  return directory;
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1] ?? '')).href) {
  try { console.log(await stageRelease()); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
