import { writeFile } from "node:fs/promises";
import { PF2E_FEATS } from "../data/pf2e-feats.mjs";

// Feats added in PF2e 8.6.0, individually read from their complete pinned
// descriptions. Each row freezes the native id and description hash, so the
// map can be written before those feats exist in the runtime catalog; once
// they do, drift rejects the review. Rows describe THIS activation only.
// slug | id | descriptionHash | motif | theme | subject | visible shape | exact supporting clause | rationale
const rows = `
abrasive-drag|jm4phmw7NbnX4PXk|071d510d968bec2c1482451a97a1f60e8d045726165951abd41a8dd84cf7ccd2|trip|weapon|targets|mount drags the held foe in a low ground scrape|pulled to a space within your reach|Mount Trip and drag cue at the grabbed foe; forced movement and slashing damage stay native.
annul-compulsion|uihMSLvIe7jdyrz4|246371988dea3067bf8483f3094c0e2a59687fd98f84c3efe51b2682b9ae3240|counteract|curse|targets|contract amendment unravels a binding sigil|attempt to counteract a curse|Legal-rune amendment loosens the compulsion on the chosen creature; counteract outcome conditional.
become-as-shadow|AkekiMXAW0IYxESY|72c08aae8d0152fd0ee1e5ca8b44ed9de0672a6c0d5e9958e2eae702a559bff3|transform|shadow|source|corporeal form dissolves into a shadow silhouette|insubstantial as shadow|Source body darkens into an incorporeal shadow shell; bright-light penalties stay native.
bushwhack|3qBGxQSIC9ccJnKy|95cf3b7a6f0d9e9620657d7b10069ea4dfae19e53d9321815632d66076d43454|bind|weapon|targets|sudden lunge from hiding into a grip|appear from seemingly nowhere|Short Stride echo then grapple clutch at the chosen victim; damage only on a successful Grapple.
call-hellfire|3JzIfiiFmxeFsdPB|5070a8b25d3474693272841b272d8ab173a1c086f05b25ad41f50a9bff7619a3|elementAura|fire|source|hellish flame burst ring around the source|blast of hellish fire|Fire and spirit burst expands through the 10-foot emanation; damage depends on each Reflex save.
clarify-hellfire|WuNGNNe9bGTn6jgH|56f35c834d12579b6988e76bdc68651e843bd3171dec69da2591194e00fc6950|preparation|fire|source|holy-tinged flame clause kindles on the source|bypasses that devil's immunity to fire|Source fire empowerment cue; later fire damage to devils is separate.
condemn-soul|UVfNMSVC2ZKTDlgf|b0dd2c6b52e0d5fd25c7253ec6845d542b21eceeb93b414a43e9bac7187a8811|elementTarget|spirit|targets|binding legal runes close on the soul|condemn a creature's soul|Rune binding converges on the selected creature; weakness only on a failed Will save.
coursing-weave|Q3KUeYsuXUkGELTS|2c172cad35e890acc2487cd7403dbcb42e6a5e5a9943a6d11adedbcf95ce841f|movement|wind|source|easy evasive glide after the missed shot|Stride up to your Speed|Mocking evasive movement echo; Fly option and path remain player choices.
crop-protection|yHiH50dPLyvemeL5|44ffbc673b2206e39703d00268da1265bad61ea06d170c122c789eab4c1f77bb|strike|weapon|targets|protective melee Strike at the threatening enemy|Make a melee Strike against the triggering enemy|Single melee Strike; ally AC bonus only on a hit.
death-of-hope|C9WODZ3hDZLfyYf9|8f8fa084ec4b782ffeea747fca1dd8e139536851a535618c60825bd10d2611e5|elementAura|fear|source|despair field spreads 30 feet from the source|aura of absolute despair|Despairing emotional field radiates from the source; lost reactions and slowed depend on each enemy's save.
dispute-terms|vgtU5Man6Ipb2V0w|d4ddea235ea7ce48b627afaefed6708c1c2d6d37d6fb9385d79f58d6b93646c6|fortune|curse|source|doom ebbs as a misfortune clause tightens|Reduce the value of your doomed condition by 1|Source doom lightens with a misfortune glint; next-roll misfortune stays native.
fine-print|FFn6obt0uPkGsLvA|a7417e503ede9712897e66474399989ccc3fda7140436b712e5bc63cd6fc8d96|elementTarget|arcane|targets|hidden contract script flares at the wound|hidden clauses|Papery script cuts into the off-guard foe as a precision rider; no extra Strike.
free-the-bound|9oU92ttNdXEKFOGh|7c8c6c496ab9f9632cf0178915c17e118b407fc5ca9ca24f781a0473c8244113|targetSupport|weapon|targets|ally's bonds loosen with a readied counterstrike|Escape with a +1 circumstance bonus|Support cue at the escaping ally; their optional Strike is a separate action.
fumigate|VXNeR6rmIhPih84h|683c691453a1b0aacbfcc376c30159e5b402f6110721de8381134d6f7181af53|strike|weapon|targets|ruthless Strike with bleeding follow-through|Strike the required enemy|Single Strike; bleed and disarm only on a hit or critical hit.
galloping-launch|asELpoofuVihcqJ1|d06900d5e86dc42fa0a7af4318fa6e4c795e00973ae49967233ccf49d6b703f2|ranged|weapon|targets|mounted momentum throws the weapon on a long arc|ranged Strike with a thrown weapon|One thrown-weapon flight to the prey; extended range, no second throw.
hardening-necrosis|Yjet0FGAHPx7gjod|a269f2af662f71d847bb978fa3596e9f3ff19767da034d16fc9cc09095ec16fa|guard|void|source|undead flesh hardens into a stiff shell|resistant to the strongest physical attacks|Source hardening shell absorbs the critical hit; slowed afterwards stays native.
impose-order-infernal-pactbreaker|DavIoulC8GmZ1SNR|cb5dc1558131ab3bd29903c21a5e09a275827b633dca486a2526670cefe7297c|elementTarget|mind|targets|strict folio script lashes the adjacent attacker|impose the strict language of your folio|Mental script strike at the triggering enemy; damage depends on the Will save.
infernal-anguish|nqhqZErE8diYFabI|9f127f240204a055ead48a950fbcf463c6a71150d4883e5500ddaabdfe8023cc|dread|fear|targets|hellish visions flood the demoralized foe|implant the fiendish visions of Hell|Fearful vision cue at the demoralized creature; source doom increase stays native.
looming-gait|DfsVIWqZWzSiXShK|418bc1a25a031a14a81cabf9a7519e7df92fe866417994dc6fd6da96761744a0|charge|weapon|targets|long deliberate strides into a reaching downswing|You Stride and then Strike|Stride then one reaching Strike; reaction suppression stays native.
painful-spell|HY00EuyGBBbUb7ZT|521b03fa473c979ea7aa3eb85d47d523bcd7cb7d70b124975e895f472dd7c5b0|spellshape|shadow|source|shadowy barbs gather on the next spell|agonizing shadowy barbs|Spellshape cue on the source; added mental damage applies with the next spell.
quick-harvest|dPOH2iZ6ZT1jwpz9|c445f331e41e25b6cfcf709a86f0528ed6bc07248b45d157992a83f57854f5e5|command|plant|targets|quick crop mark on the chosen ally|designate an ally you can see|Brief designation cue on the selected ally; crop membership is native state.
reckless-riding-lunge|ks47UekSCM8gek6M|677990f6624f35d08886e767a9fccc5fd9611b4ef3d92b4fa40c5cce53b0b8c6|preparation|weapon|source|rider rises to lean out with extended reach|your reach with melee weapons increases by 5 feet|Source readiness cue; this action makes no Strike.
ride-by-recovery|oUCQymKo4eWxgteP|9728d458add6b75513026115b61f45c0bdeea7c28d231339306f88999cea280d|utility|weapon|source|item kicked up into hand mid-ride|kick a fallen spear|Small Interact flick at the source; item handling is native.
savor-the-hunt|jnXNqqRT5Qhw5Zau|362f6c05367b9d3eab8d73758f15fc711b2f0cc05e520c9781989f3420f48493|restoration|fear|source|terror feeds a dark vitality glow|temporary Hit Points|Source draws a dark glow from the victim's terror; temporary HP is native.
silo-crop|BoDfpvHIRHXheOyM|3f670070bdb7937492a77f92fe590e4777231f2421fcdeaac5706fac225d8b5c|performance|illusion|source|showy diversion draws eyes from the crop|draw a little attention to yourself|Source distraction flourish; benefits to crop members depend on the check.
stranglehold|mOWtfL7lhW9XpdBN|9cfbc71e17754ecfdb9c3037685c6e6c21238af1773a7c3c1b928e392fc69297|bind|weapon|targets|choking grip tightens on the held victim|barely speak|Squeezing grip cue at the grabbed creature; speech flat checks remain native.
submit-to-shadow|QAkxGCvXJTw41XMj|53122c9dd456f5e742d6f8a9e9b114b3eee8f5e84bc3f364bb3b738c576ede3a|dread|shadow|source|umbral tentacles burst from the dying source|shadowy tentacle|Shadow tentacle display around the source; healing and Frightened depend on native rules and saves.
sunless-slide|KlfXgSaTCdnUeW8C|0c63a11c6372c8a9b36ce37800ed6210eca6475eb0bda396f82675f3ceb8abdd|movement|shadow|source|darkness-borne gliding Step|glide out of reach|One Step echo through shadow; the following spell plays its own animation.
umbra-ally|fXPCNvieekzcGJbH|fdd36b6239d855c093d84277517b43ce47b5ee7969ceedbd497256d34d03fcf4|display|shadow|source|living shadow darts around nearby foes|your shadow begins to dance around your enemies|Source shadow animates and circles foes in reach; flanking is native.
unfaltering-ranks|UseAF1tBCb9O2eO7|a9abf906d3ceef443ffb362cf0b7d42ed1e5415d03b14c55d6e2d63a89b10415|inspiration|mind|source|steadying rally wave to allies|remove this weakness from your allies|Rallying outward pulse to allies within 60 feet; temporary HP, Speed and fear reduction depend on the check.
winged-mantle|hFGVBKL32H05Gsg6|a14e6f9741907eca5bb6756c36d5a81e8af11f0c57e5730f9a40368bbe681f54|guard|wind|source|wings fold protectively as you rise armed|wings protecting you|Stand-and-draw cue framed by sheltering wings; reaction suppression is native.
`.trim().split("\n");

const map = {};
const catalog = new Map(PF2E_FEATS.map(f => [f.id, f]));
for (const row of rows) {
  const [slug,id,descriptionHash,motif,theme,subject,shape,evidence,rationale] = row.split("|");
  if (map[id]) throw Error(`Duplicate review: ${slug}`);
  const feat = catalog.get(id);
  if (feat && (feat.descriptionHash !== descriptionHash || feat.slug !== slug)) throw Error(`Reviewed source changed: ${slug}; review the complete description again.`);
  if (feat && !feat.plainDescription.includes(evidence)) throw Error(`Evidence mismatch ${slug}: ${evidence}`);
  map[id] = { motif,theme,subject,shape,evidence:[evidence],rationale,
    tempo:/slow|deliberate|steady/.test(shape)?"measured":/sudden|quick/.test(shape)?"quick":"flowing",
    approach:shape,contacts:{count:/Strike|ranged|charge|bind|trip|elementTarget|dread/.test(motif)&&subject==="targets"?1:0,distribution:subject==="targets"?"selected":"source",conditional:true},
    finish:[shape],constraints:["Cosmetic finite cue; rules outcomes, later granted uses and token positions remain PF2e/player decisions."],
    review:{descriptionHash,fullDescriptionRead:true,method:"individual full-description source review",batch:"pf2e-8.6.0-additions"} };
}
await writeFile(new URL("../data/feat-update-review.mjs",import.meta.url),`// Individually read full pinned descriptions. Hashes reject source drift.\nexport const FEAT_UPDATE_REVIEW = ${JSON.stringify(map,null,2)};\n`);
console.log(`Saved ${Object.keys(map).length} full-description reviews.`);
