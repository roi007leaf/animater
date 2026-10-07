import { featSources } from "./pf2e-feat-source.mjs";
import { assetDatabases } from "./asset-databases.mjs";
import { analyzeFeat } from "./feat-semantics.mjs";
if(process.argv.includes("--delivery")) {
  const {PF2E_FEATS}=await import("../data/pf2e-feats.mjs");
  const rows=PF2E_FEATS.map(feat=>({feat,design:analyzeFeat({name:feat.name,system:{slug:feat.slug,description:{value:feat.description},traits:{value:feat.traits}}},feat.path)}));
  const counts={};for(const {design} of rows) counts[design.motif]=(counts[design.motif]??0)+1;
  console.log(JSON.stringify({counts,changed:rows.filter(({feat,design})=>feat.motif!==design.motif||feat.theme!==design.theme).map(({feat,design})=>({name:feat.name,before:`${feat.theme}/${feat.motif}`,after:`${design.theme}/${design.motif}`})),
    utilityReview:rows.filter(({design})=>design.motif==="utility").filter(({feat})=>/\bstrike|beam|ray|cone|line\b|\b(?:hurl|shoot|fire|spit|breathe|throw|heal|shield|attack)\b/i.test(feat.plainDescription)).slice(0,75).map(({feat})=>({name:feat.name,description:feat.plainDescription}))},null,2));
  process.exit(0);
}
const [data, databases] = await Promise.all([featSources(), assetDatabases()]);
const counts = {};
for (const { source } of data.feats) {
  const key = `${source.system.actionType?.value ?? "missing"}:${source.system.actions?.value ?? "null"}`;
  counts[key] = (counts[key] ?? 0) + 1;
}
console.log(JSON.stringify({ ref: data.ref, sha: data.sha, paths: data.count, feats: data.feats.length, counts,
  examples: data.feats.filter(({ source }) => /^(Sudden Charge|Vicious Swing|Power Attack|Double Slice|Flurry of Blows|Intimidating Strike|Battle Medicine|Flying Flame|Elemental Blast|Reactive Strike|Deflecting Wave|Fresh Produce|Shield Block|Basic Devotion|Wholeness of Body|Lay on Hands)$/.test(source.name)).map(({path,source})=>({path,...source})),
  families: Object.fromEntries(Object.entries(databases).map(([edition,rows])=>[edition,[...new Set(rows.map(r=>r.key.split(".")[1]))]])),
  weaponKeys: Object.fromEntries(Object.entries(databases).map(([edition,rows])=>[edition,rows.filter(r=>/jb2a\.(?:melee|unarmed|sword|dagger|shield|healing)/.test(r.key)).filter((r,i,a)=>a.findIndex(s=>s.key.split(".").slice(0,3).join(".")===r.key.split(".").slice(0,3).join("."))===i).slice(0,50).map(r=>({key:r.key,file:r.file,template:r.template}))]))
}, null, 2));
