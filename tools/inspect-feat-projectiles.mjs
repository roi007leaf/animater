import {assetDatabases} from "./asset-databases.mjs";
import {assetGeometry} from "./spell-asset-selection.mjs";
const db=await assetDatabases();
for(const [edition,rows] of Object.entries(db))console.log(edition,[...new Set(rows.filter(r=>assetGeometry(r)==="projectile"&&/dagger|sword|throw|axe|card/.test(r.key)).map(r=>r.key.split('.').slice(1,4).join('.')))].join("\n"));
if(process.argv.includes("--physical"))for(const [edition,rows] of Object.entries(db))console.log(edition,rows.filter(r=>assetGeometry(r)==="projectile"&&/bullet\.physical|arrow\.physical/.test(r.key)).map(r=>r.key).slice(0,40));
if(process.argv.includes("--bullets"))for(const [edition,rows] of Object.entries(db))console.log(edition,rows.filter(r=>r.key.startsWith("jb2a.bullet.")).map(r=>({key:r.key,geometry:assetGeometry(r),template:r.templateName})).slice(0,30));
