import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { MODULE_ROOT, POLICY_URL, POLICY_REVISION, runtimeInventory, publicationBlockers, writingCSV } from './publication-audit.mjs';

export async function checkPublication(root = MODULE_ROOT, { write = false } = {}) {
  const directory = path.join(root, 'publication');
  const provenance = JSON.parse(await readFile(path.join(directory, 'provenance.json'), 'utf8'));
  const inventory = await runtimeInventory(root, provenance.licenseFile ? [provenance.licenseFile] : []);
  const blockers = publicationBlockers(inventory, provenance);
  const report = {
    policyUrl: POLICY_URL, policyRevision: POLICY_REVISION, auditedAt: new Date().toISOString(),
    readyForRelease: blockers.length === 0,
    assessment: 'Technical gate only; provenance assertions require genuine human evidence. This is not a Foundry approval or an authorship detector.',
    codeDigest: inventory.codeDigest,
    summary: { runtimeFiles: inventory.files.length, bytes: inventory.files.reduce((n, f) => n + f.bytes, 0),
      bundledMediaFiles: inventory.files.filter(f => f.kind === 'media').length, textCandidates: inventory.text.length,
      candidateCategories: Object.fromEntries([...new Set(inventory.text.map(r => r.category))].sort().map(k => [k, inventory.text.filter(r => r.category === k).length])),
      blockers: blockers.length },
    blockers, files: inventory.files, externalReferences: inventory.externalReferences,
  };
  if (write) {
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'audit.json'), JSON.stringify(report, null, 2) + '\n');
    await writeFile(path.join(directory, 'text-inventory.json'), JSON.stringify(inventory.text, null, 2) + '\n');
    await writeFile(path.join(directory, 'ui-text-inventory.json'), JSON.stringify(inventory.text.filter(r => r.category === 'ui-or-message'), null, 2) + '\n');
    // Do not overwrite a writer's work. A refreshed inventory has its own path.
    const worksheet = path.join(directory, 'text-authoring.csv');
    try { await writeFile(worksheet, writingCSV(inventory.text), { flag: 'wx' }); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      await writeFile(path.join(directory, 'text-authoring-current.csv'), writingCSV(inventory.text));
    }
    await writeFile(path.join(directory, 'file-provenance-template.json'), JSON.stringify(inventory.files.map(f => ({
      path: f.path, sha256: f.sha256, origin: 'pending', author: '', evidence: '',
      ...(f.kind === 'media' ? { humanMade: false, licenseEvidence: '' } : {}),
    })), null, 2) + '\n');
  }
  return { report, inventory, provenance };
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1] ?? '')).href) {
  try {
    const { report } = await checkPublication(MODULE_ROOT, { write: process.argv.includes('--write') });
    console.log(JSON.stringify({ ...report.summary, readyForRelease: report.readyForRelease, codeDigest: report.codeDigest,
      blockerTypes: Object.fromEntries([...new Set(report.blockers.map(b => b.code))].map(k => [k, report.blockers.filter(b => b.code === k).length])) }, null, 2));
    if (!report.readyForRelease) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
