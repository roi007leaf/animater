import { loadFeatReviews } from "./feat-review.mjs";
import { PF2E_FEATS } from "../data/pf2e-feats.mjs";
import { featRecipe } from "../scripts/feat-choreography.mjs";
const reviews=await loadFeatReviews();
const motifs={},themes={},subjects={};
for(const r of Object.values(reviews)){const m=r.overrideMotif??r.motif;motifs[m]=(motifs[m]??0)+1;themes[r.theme]=(themes[r.theme]??0)+1;subjects[r.subject]=(subjects[r.subject]??0)+1;}
console.log(JSON.stringify({reviewed:Object.keys(reviews).length,motifs,themes,subjects},null,2));
if(process.argv.includes("--early-evidence"))for(const feat of PF2E_FEATS){const r=reviews[feat.id];if(r?.review?.batch!=="nonmartial-0-129")continue;for(const quote of r.evidence)if(!feat.plainDescription.toLowerCase().includes(quote.toLowerCase()))console.log(`${feat.slug}: evidence '${quote}'\n${feat.plainDescription}\n`);}
if(process.argv.includes("--critical"))for(const name of ["Time Dilation Cascade","Triangle Shot","Magnetic Pinions","Torrent in the Blood","Vengeful Spirit Deck","Zombie Horde","Whirlwind Spell","Ruby Resurrection","Mixed Maneuver"]){const f=PF2E_FEATS.find(f=>f.name===name);if(f)console.log(`\n${name}\n${f.plainDescription}\n${JSON.stringify(reviews[f.id])}\n`);}
if(process.argv.includes("--mixed"))for(const name of ["Triggerbrand Blitz","Triggerbrand Salvo","Stab and Blast","Drifter's Juke","Infiltration Assassination","Rebounding Assault","Throw and Catch","Two-Weapon Fusillade"]){const f=PF2E_FEATS.find(f=>f.name===name);if(f)console.log(`\n${name}\n${f.plainDescription}\n${JSON.stringify(reviews[f.id])}\n`);}
const nameIndex=process.argv.indexOf("--name");
if(nameIndex>=0){const f=PF2E_FEATS.find(f=>f.name===process.argv[nameIndex+1]);if(!f)throw Error("Unknown feat");console.log(JSON.stringify({name:f.name,description:f.plainDescription,subject:f.subject,direction:f.direction,review:reviews[f.id],recipe:featRecipe(f)},null,2));}
