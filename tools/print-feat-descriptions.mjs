import { PF2E_FEATS } from "../scripts/feat-catalog.mjs";
const martial = new Set("strike unarmed heavyStrike doubleStrike charge ranged firearm bombThrow alchemicalShot fearStrike feintStrike bindStrike tripStrike dread shove trip".split(" "));
const feats = PF2E_FEATS.filter(f => !martial.has(f.motif));
const start = Number(process.argv[2] ?? 0), size = Number(process.argv[3] ?? 35);
console.log(`NONMARTIAL ${start}-${Math.min(feats.length, start+size)-1} of ${feats.length}`);
for (const [i,f] of feats.slice(start,start+size).entries()) {
  console.log(`\n# ${start+i}: ${f.id} | ${f.name} | ${f.slug} | ${f.actionType}/${f.actions} | level ${f.level} | ${f.traits.join(',')} | ${f.motif}/${f.theme}\n${f.plainDescription}`);
}
