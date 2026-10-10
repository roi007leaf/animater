import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const FEAT_REVIEW_GENERATORS = ['early', 'description', 'support', 'late', 'update'].map(name => ({
  script: `tools/feat-${name}-review.mjs`,
  output: `data/feat-${name}-review.mjs`,
  args: name === 'description' ? ['--build'] : [],
}));

// Development maps are local outputs, reconstructed from retained generators
// and the pinned runtime catalog before a rebuild or review audit needs them.
export function ensureFeatReviews(root = fileURLToPath(new URL('../', import.meta.url))) {
  for (const { script, output, args } of FEAT_REVIEW_GENERATORS) {
    if (existsSync(join(root, output))) continue;
    execFileSync(process.execPath, [join(root, script), ...args], { cwd: root, stdio: 'pipe', windowsHide: true });
    if (!existsSync(join(root, output))) throw Error(`Review generator did not write ${output}`);
  }
}
