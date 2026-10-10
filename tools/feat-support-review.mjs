import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { PF2E_FEATS } from '../data/pf2e-feats.mjs';

const frozenSources = {
  "bond-conservation": [
    "vhHKUooXX3PYqGaU",
    "1462ed3856fde3eef8fa6d4c060c489a36ecf28d9fe4dd642ab1b6bf2ebbf65b",
    "f958f36546e4cd841cb1a62c49c0282497dd97ec04f4384cf923321745fd7099"
  ],
  "bonds-of-death": [
    "8cq6NO087Te3P9yw",
    "e358d2e3cdfdea78772fa9ad3f798c20fc5ec297327f44329831612ebdb44037",
    "6f2ce9b27b533ef897f555eae46262d337c43d48d41c75be2192e50e7ce2977a"
  ],
  "bone-burst": [
    "zFPWGwYLC0wxqUDg",
    "c1c9ef97e07e4063f32bd96ca0748c7d2035ca265a58b44e1ee933bf07e7f3c9",
    "72555588ee7018eb3ab96cbb75a782a0181034de5a25adeef24a40079cb7e29a"
  ],
  "bone-spikes": [
    "cy9jqlHz75GTjg7l",
    "1bd538696add881c9845871eaa5758e971bffcfff3591f3fb4bb9418bd4cb69b",
    "9359452b0ad10f70de436f433e196868e1bfa771f31b582732e884c1c0a7c0d2"
  ],
  "bone-swarm": [
    "E4MS2wnRQJfyldrT",
    "7183dae0157eac6ca3becd2999337b9c811a55ccc67cdf7ac00bed31439dc430",
    "4d15566d4311ef8d5f75c5fde3b3ccec8bdf66947e17d66b2fcfe884d6820f32"
  ],
  "born-to-the-trees": [
    "6dpBiQ9lhgrAQzCd",
    "d3d368547885f53b01a374cc7806350b6ba4d2194da961f67d087124ee98b3eb",
    "d378fe378584dbac3bcc095e67703cfbb9e9f25827d7ac7b84487cc67931a708"
  ],
  "borrowed-ability": [
    "v4N0tTGjKGMwjqUG",
    "62e600385e39a20d1cf57c4f61d8d82f888e556bdaec85858ecf29d2d914d065",
    "051ad1308ba818b7dc8a76640b58a28e0094a27ac719948647d712b52d089aea"
  ],
  "bounce-back": [
    "MR4X38qgBj5tmkMw",
    "62542107d1f005b26a230ccf9ba32d910d15641069ce8187ae801700d5138439",
    "55f10856b79cbde400dd2a1e6e0a66cf8824fbdf748e47d77f4c168617204f5d"
  ],
  "bounce-boost": [
    "rR4uViPbbKRzf9TE",
    "6f2e8006eed0be2862b4a92f5dc1d27da87d3f0ba2081ce0388fa28951e2e010",
    "f31d06520f33d47053d537e6147819cbafe67d8dfd21988f3e980711258c38c4"
  ],
  "brain-drain": [
    "zQeglKcmBXvqfABR",
    "8a1543b072e68df94094c16406fc558f2bc0b68c59ec21075dab4ce78354d2ff",
    "87b6e83aed57a663b4e4b0f3fed3bcedeb82f467bc41ae17ff979b84f6d21fdb"
  ],
  "brains": [
    "Fpsd8Y8qJ3Tdbiyz",
    "7a2a2e4f0aaafd548eb328e25637916dcb5d473e8a45f832834d3ded07069d68",
    "e246ed455e077ad983cbd983275180be7a6f983a2f01a2122790f29d9c6af8b1"
  ],
  "branding-spell": [
    "BpFj45tQY8ExHIRm",
    "08742dabddaf0e578ada494dcaa9831228f6b0f79bb1a4a402ec81c7dddc2a88",
    "ea92aac4d569eb3922cf37cc98e06ecf0e8f0acff7f6c775c5a072bec6a3e1d8"
  ],
  "brandishing-draw": [
    "E25gWBCsDm3DbJdO",
    "279aaf0d362b15541df6318ff98c49cfd694c6a390174acea50e2e7edb037996",
    "d9912ee56538454e24a374ba6473417662ce1c79c36b036b64f0d1861689d52a"
  ],
  "breath-of-hungry-death": [
    "AV9NkSLNvv0UcdcP",
    "41b96ea87f0fbe249cb99201f978588a7bb69136cea2e1dc8aef56b3f5cf3c9c",
    "4e4cb1fd6acbe7a40342fdfdae3c9e261b9eaa31163cac6ba595c471467a6f8d"
  ],
  "breath-of-the-dragon-dragonblood": [
    "7y8DKd24c7eqzJGV",
    "00b8fb49e78b8024b281ed2b244aa2e22718efa607d436bd38385bf491de6075",
    "decab1334381aee96a799eefbde42989cb44c88772f1fbdfe4379225d5204bb0"
  ],
  "brightness-seeker": [
    "8aRa9VHoDKl9B1Z1",
    "270f0efaf84df74b33cd6862e768d900a3d97e44c9e8ff9f2082351200c15587",
    "92c240f6af21442f7e187ea9466dd57835a26d66ed9c3f18be5491ef4e174ddd"
  ],
  "bring-into-the-fold": [
    "KX79TV93yznyhhMJ",
    "5e9c5940a21f8b4723d570df04a1a49a35dede87a6bec6856452bf70e35b35b8",
    "ada8f1ab993f96ee7b4bf177aa066d2a71f50e376a6a2354240a7526b78204dc"
  ],
  "bristle": [
    "1gAehVvstGY885kJ",
    "38f8cc1aa71ffd227c116ddc18f956cff3dca579757868b540fe738eb2e7ffef",
    "20435c8aa1575a87e9d90e8edfb216cb524923b23602f9bb0b440e7a4262de7e"
  ],
  "buckler-dance": [
    "tDWc2LQNl0Op1Auq",
    "6e71d985f69f5bcc88fecfca490a09ca3edbb5e69b4dea6549534dc36534834c",
    "4aa57f16f8967e53c312254bbcabdaab8b80170a1d43de8dce7a9c027af94dea"
  ],
  "build-the-first-walls": [
    "Yzw1v2JLRO0G59bz",
    "bcddc5f6d41397845dc79c0ff842136f056efc56824be428cd3dbabf89c3f20f",
    "afa7fbb15adbbe9419a327d8623bfbe88a9c8024855cd2c71f4a8063f4e3cf6d"
  ],
  "burn-identity": [
    "fPTwCnKYesk1PvuI",
    "e8c55992e9d2b9819870c4cc56368d1dbfe132eb31b07fe19ec080094667254c",
    "72af885099d34367f77bcab2f54f99c6b48e1c14340e335ff7a3ac6ffdf03519"
  ],
  "burning-demand": [
    "89pgMAnwGYbrJlWt",
    "ce6081421080f4963277b3156ff076f31aef6b1709d01ad58b88b3b3689b01a2",
    "e0bb5e8d4fa140ab1c573e35f9946bb097fdca710e0cb85f8b8dbd59521a6ee1"
  ],
  "burning-jet": [
    "vS3GSv6ndGmh8FXz",
    "98b75bb3bc4c4842b837cd7287ca9ab62967f65e572487523c220cc1106e4bbb",
    "245d18e8e3523d6d76ba462be66feac068353a25b389433570704e980f790e8a"
  ],
  "burning-spell": [
    "bVng7Mkrj4UnQzLo",
    "7a61a6d0c7635aeaf7f03a2bce2bae4072b239a57f0491d5543d4a4fb9f128f9",
    "89759e5ebe76c2920dc3b859cb597e9f245d29e9a530287ca1a939ce0dd834df"
  ],
  "burning-surge": [
    "jJuRyhcqXGP0GJQe",
    "541502fac8fe5babfe27c32ecc3f60e5e4f6f9f7052aeb225f266282dfef8a88",
    "83adb7dc56aff5bc13fd480a8fcd99eab2e7297ecc07406030c27ea8c23ecf01"
  ],
  "burrowing-shot": [
    "G6aNxXTIJYIGeicK",
    "61b91a7f85bd4cd9b675223891a951fb0aa1ed0df4444737d54aa1b617b915de",
    "01a32cd7ad653ea9980deffc370cca9de6c8b25ddb73cda2cf7531cd9a6a4b4a"
  ],
  "by-your-name": [
    "iLFGrBeG2yas8cxm",
    "e1c1502664d331b8cc01f93183e21c2516ed05185224b1a0cb3c502d27d4f61d",
    "cfef234fff2149297dfa130e8c3fd0acacd3f23cbdf29d81b631cbbbee9c424b"
  ],
  "cadence-call": [
    "a9zzu4kb7vstq0HQ",
    "051fa6f00166b54c1ea9fff7e1b04e97b12289287ab7b5896c0e2bcfe736cdc5",
    "73f81180bc6a14736f1fe51d9b233a896af5fe395fc5209857cb7d94d59cc64f"
  ],
  "calacas-showstopper": [
    "Cf0CDTZvGaYDAXUN",
    "497b4bdd61f9747a4160afb6ce527aa4a791151ca517a71e84133f51ae3f0fbc",
    "8bcfe06f5e1362709a2ae00543b4a19fc6101341d3cd60f9d6f916dd3f8ca00a"
  ],
  "calcifying-sand": [
    "kh0uz44otsdQlpIk",
    "d781f4ef12d9eea9deb9215bff5c8c8007af3eac31d74f1b63c689afcbdb681b",
    "7d827c4709217bd09f716fe1980ffe3102bb80f6adfa409baa2ba844efa33e88"
  ],
  "call-and-response": [
    "JOq4Xe49A04YycRz",
    "4c047c4bdff7b53678b8cc71046a5b869ce3185d7737927adec039ba3d38e269",
    "0cb4a2be10f24a06f6a3258f592f88a3a012ccb5f8e2a6c483866f4d93a78c06"
  ],
  "call-from-deaths-door": [
    "24giyNqSjqrEnhN9",
    "8be0341d3fce6aca47f88301f57814621ede9663e60f1120c45ec7a470f6b20e",
    "0359957280488a9c1680eec1d6159c0833f8876b953164a530d6cf5b27e1480d"
  ],
  "call-implement": [
    "bPMYOiiqhrb098s6",
    "26ec06abe7081e827e884f811d3aee93636c9e5cbacc55b866a61c2ad8a85fba",
    "fb9144bb2316ee77ab32519d7aa2c222baaba498033da7913976333f6525f893"
  ],
  "call-the-first-tools": [
    "3uuP1MYBdLAXE7VL",
    "01962325556a28d0c1364bcc1b86ee05d906f1b074621c414b4e220205cc6b90",
    "19c83b9b82cd4aa97516b3cce258bb09680687c0e72341e72b88271412edc2f5"
  ],
  "call-the-hunt": [
    "syIPNelJTQSkErvu",
    "a306d3095914f8584da3128d6eb5703c02a8c82a11090c4eb0101e6e76c1259c",
    "8ef4b4900dd3026ccfc62c65ad18c85aa924509b6e47b66b2d990c0f72b503e1"
  ],
  "call-the-hurricane": [
    "YUHSK1ivdT1nLJk3",
    "62761bb09711a3fcd772ae6e1e19522a0b7c5e1258ff8e4d92916c1621bde2ee",
    "cfdf15ec5b417965c2f55548ac8a9745874225033bae41019e3c80564dca7b12"
  ],
  "call-the-swarm": [
    "8azOq906HL0pFqTc",
    "241c2c5336099833d13030f5c8b83faf9a5c634898dfdf6f9ae685bb9d19238d",
    "5cd4a4e15fac5b7d4b3668cf96facc0d5ab54b8fae410537cf1285cde43f9798"
  ],
  "call-to-battle": [
    "5yV41pARitDoPUen",
    "55c678cdc4bd179d29a7fbaf02cc601a3b82b74ebb44f8b86b89b5cce3871e7d",
    "2ccb59940f8004d89b1a04c52e6b0d9faa4c6cd80a4477156392d933b3a78260"
  ],
  "call-wizardly-tools": [
    "9j90iE61ZToFR8cu",
    "2b0846a01cde5d5a8f26199fb70192a04a8223a5fd4e67e165b6cd44b21359b3",
    "f71e92a9751e4ba162650ef2aa13daa37c19bd7c2caa00b03aed60647346a689"
  ],
  "cannibalize-magic": [
    "lIzsj8XlcL0tqQcm",
    "11476ddc99dda275c54925e61f40331aec71931e909d44601acf239e2d82187b",
    "6f5d25d95d6f2c734a3ab8e14fc6f4d57f9e9ea24f2d7889ce879ff7b6abd7e2"
  ],
  "cantorian-rejuvenation": [
    "56HvICglqH7uR3AY",
    "3da6e3781db4d5efeb37f34eb3ebab9127f8edc3102c407a31840d2f182b943e",
    "e0ddc0f098325fc4adaec5e2d814ec0cb28526530532f4633bea0b5afdb5c739"
  ],
  "cantorian-restoration": [
    "Qc9MH7wT182qasSV",
    "819accdf7c46e78e7bf0554aeb14f47e53f5bc7f5e7a24f8cdca322a8d30e4c9",
    "7740ca5c8cb26c110c3d2f36c701c5635b8d2da5d746cc70661f892dd3ab5c1f"
  ],
  "capture-magic": [
    "nlXyh7828TgZIewv",
    "235f3ed8db7710c9ae48a1522ea0a97d7f3eb6f5b27826eb6a1bd4af4e00c8e4",
    "b6600f45db2d24177f31f2c92329f7328c9dab57fdf4aaa3049ccad353d9f44d"
  ],
  "caretakers-restoration": [
    "5lqVFVTA98M6E80o",
    "4169fc740b0fb2f8be17a92965df012a76be83db3b1ac0076a2372e501b00ada",
    "a3f05e4f5e8a70f8fff8dfd18bd1e3e9c9b01367a3db719f71870969e08fb28b"
  ],
  "cartwheel-dodge": [
    "lmAuoHPxzQdaSUmN",
    "175668b5bd32053d288f2fe92dfef9282b4f447d66ba79604a48203fb5b2f138",
    "c5606cc682bc3d9b3bfc0ff47144d1eca0c932f5ebeca1ad81a66ce9ce2c400c"
  ],
  "cascade-bearers-flexibility": [
    "YOU5eCD5S4cS6Qeu",
    "54f00ed3f1b7e7e24cba98e58f5eab91e9a84f71abd78e4e2fa84081f09b146d",
    "19eb5d6ad0cf7dd169f96fb402a149fcb98a0c945dce0b3ce2f3b4c94d03d6ba"
  ],
  "cascading-ray": [
    "oiauCibmdgJ91kNI",
    "c6df49de2372147d13812c73190f2f04ad8182c0082edb312fecdadcc112a95f",
    "35271c7ec95761662fd436fb27cb089fec1683e3fc34549eac45e0c43d7c239e"
  ],
  "cast-down": [
    "lGCFVYjL9Lp5m9Ex",
    "54b7c1e686527fc23a3cc9f4d032265a0a4686236d987b910154284677de8cb3",
    "a4ee43fd416897a09182887c22333d562dc319862e8782bb660d0406f2a448ef"
  ],
  "cast-out": [
    "dVzPTpZoGSi5NR6y",
    "2d406af9147719099ce946cac55aea74fd938f2a0137dbc7a9ffa67eb6e197ff",
    "9ef0f93556fe8440866a560115bdb3ab1fd81b2ed289d1dc2a70aecc073e5aa6"
  ],
  "cats-luck": [
    "7qBuzHY8kEG8SdEP",
    "39487cecba0ba31d556b0567ca33b1ef647a4ee286f2e310f7f2eb9dec328ef8",
    "6b1cfe90e78bc560c7e96b339a0a330cc1afa6698be61510102dc0965ae9b5d6"
  ],
  "catchy-tune": [
    "ACXWB7a38ETc32Qj",
    "7335393512d159d5db625bcc485cfef50aca2313bad49cd3a3ae0281fd0f1c44",
    "85ca542763af4fea790a2b63bf83d835358ac310dba7e81594ab6cbee5057703"
  ],
  "caterwaul": [
    "nePEcAp7lTL35uyx",
    "8318b1d7063f40a7fafe9cfc64e09bb1b78705212c86620fc9399bfb1f1ef419",
    "636afbe40bb4a451826aeec467dd1388784da469c64b1974cb9c9ddad3d591b0"
  ],
  "catfolk-dance": [
    "Iqv8qj7ym63YjexN",
    "dcf39ffbb7e92a8254d8fb8c3d23748f9489c00e513a08b6b22778917057bc24",
    "8578ee69c8b2c71ae63369cb37082da7c835b1d2e1bd907dd2330df1070299fe"
  ],
  "cautious-word": [
    "2i6sEZ4rQm1Pd5nD",
    "ec24611735c710bbab0092276c1007f09a3236553999a8d549d1e0758e3ca705",
    "798a29770b4875f6c4f97920dbf674899ed61965cef11cc51e3d135d56a057eb"
  ],
  "celestial-cacophony": [
    "zWbPmIQfv9VTYwwH",
    "a2ec9ef41eb1557bb43b0588fb9a7d8d67af23b375cd56ea5418fb5fa1162c9b",
    "f57888e34266910c6158c6f8fe2eff6f2ebe1e37172ca130897d4dc4be56cad2"
  ],
  "cellular-reconstruction": [
    "11mW5dOCpwROjyV9",
    "b10240793c7ee56330f6da799dbe3afa670317053eb984e7b7fdf60e86bc7ac8",
    "23a2633de568526619dabe8ead6170e308bef799a10097f7bea1366903cd7eed"
  ],
  "cenotaph-stance": [
    "oP7xcBm4BfctDMHW",
    "1497814551428d9f83c43aa5167e9d41490d86c2c5dd0a0bc5a0d6024a836f21",
    "062f2f8d81dc53871fd75ffbcb9f860babb74937baa110036da43f119e2e5e77"
  ],
  "ceremony-of-protection": [
    "VSINzKESKAw2zA20",
    "ca5234eb52d2d819cbea38b9cfdf5c73f641d3d6f7051fff6e770b3e52f5d043",
    "d92bf5d3fc6f73b577bf4371d651c33f59b0c6d8848b80076fc19e61edb15eb6"
  ],
  "chain-infusion": [
    "TubRPkKaPuqAlryS",
    "311a3a87fa64bbf6a8533b596e4b72e8427f71533e507404cfc79e48611c4e5b",
    "c3b17ebbb7f4d158e2d99ca68759cfcc8ee32d6445a02be4f069d6f71be240a3"
  ],
  "chain-of-words": [
    "AhrwKAPb1LyRxpG4",
    "29a5cec381133a3ff2bf8b9857e45e16a9fb32a5658d10c8e3065fa5652e447e",
    "528c755c67caba3732e4ef0474cfc84f4e8a9b522c49981a4ff5472ba8e2ee62"
  ],
  "challenge-insight": [
    "bvyCaOChX3lwKUn8",
    "3e9443f179f8377ebe38302852e6db132350759fcd17be8c3ce1b8625dcfef99",
    "d82da0432ff32b4336ccdbb72db866bbada88926e3bcc5221267fe5783d82ecb"
  ],
  "chance-death": [
    "uiNRrdnJe0GOzy6Q",
    "147a94fd78a4e7df193840b112e2ff5e20ea3edaafd45681df5fc86fb3985fe0",
    "6ff1155155f4df6f57da1109f3dd1dff911e220d5aa70cccc70e4b0284ad5c5d"
  ],
  "channel-the-godmind": [
    "DYFOlJlMoDuHjrZx",
    "e582f47f25e37e57bb66c4948d4210a23e4ac5fb888a6624c9d425d92db0dff6",
    "2161be4bcbee7ed9e9a3455b01477dc481dee6eff9c659abf57b27ced1ca51c2"
  ],
  "channeled-protection": [
    "vgR68JyGFRCcTSew",
    "e4ae27968592fe5f5fff4f467c159699ce25de5b6be09634481deceeabfa7af7",
    "5bdfd532bbd1eb37662b42f2f1dad632ad316a3e4c0692d2d4d459a07a38e047"
  ],
  "channelers-stance": [
    "oLE64eHT9sB82lTP",
    "a9f1b8392172a362e28ecdb8d5e5017e42374bdaea6fa8f033409c8fb7296aa7",
    "67b55c80c0bf6a76926986623443058e812b255e3b6f59690605eb98898895da"
  ],
  "chaotic-spell": [
    "5uny1fH9ybbO6ytR",
    "cc362044603d470b6549661116a85d68351ff5d95881d59b779c562249ffccfa",
    "1501ff4603d264bc656f49e5defed38d02101bf354f2127966c7ed31f3adeab3"
  ],
  "charmed-life": [
    "DkoxNw9tsFFXrfJY",
    "85e7c0484d45f40e1134d642b14fd796f038da5ab46b2182037b5fa9f58507d5",
    "9972f465e1e078085264608ef3b3669643840d24d31ad0e38485ef2e21ebc443"
  ],
  "charred-remains": [
    "zsWIZQeVhIihNw6M",
    "8b581326d9312c6fe5e6e2a6810c1bf3ce14ceaf95bc2e8978622ee78d2efdb1",
    "420c9bddac1f0fcafe5c73fac997627ef99ea73ad379eb269a33afe5dba1cb82"
  ],
  "cheat-death": [
    "D2KSVHPRlBEibrV8",
    "88002567a679ac47ee5c0c5475074393c6ae99b06dadc9399e91a0077b7b1517",
    "1ab0958a336827ec67a502ad2725249c49f415c14135d5f7b489d1a032624f44"
  ],
  "chemical-purification": [
    "qFR5OddDBmhZe6nl",
    "36a4d4c764e28fd9b97e0307457c77fba76ce610941f7a518bd04f279b9ca2b9",
    "f16ffe4e4c15aaf1b9fda8b0ce1c449fbf689b3adee31280c8efa43098758947"
  ],
  "chromotherapy": [
    "RlFZ648UR0Q0YECL",
    "42d32440e9c89a72654a4e91df770670592b5b99963e2e506c45a9a91048dbbc",
    "4c408bb5bf1124b49485fd48e299122820e014450f15b27622c69894e6db36e4"
  ],
  "circle-of-spirits": [
    "M8jbV0il124Ve5oV",
    "4d7b0fab766ca16de09465230dcfa1a1aeeed45b4d673efa0d85a99f79be59b2",
    "4a2c264fe2db6b4fdc88237dfef9542837ddfe3aea0edf418f39c0a154e3ae0f"
  ],
  "clang": [
    "xaYEUVetHiRgmVhd",
    "5fdcffc5b6ec66021c4b699584149b5d414e87e20582a19e52da6d3185df0828",
    "8bfb7c2e991d3a883209951a1c910a1a00ae048949ae8f0b5b89243d801eac82"
  ],
  "clashing-compound-invocation": [
    "R2rDg7sYfinBDKxs",
    "2731d0c0d0bdbda92d096abeaece46ebc3911562909869f2579ee79f4cc000c6",
    "45c5e33864460ff17e96e36b1385f6e752d06c390769aab3c8e89c813dbba5b4"
  ],
  "clean-take": [
    "d26S1yVaOlNgayuX",
    "0116d0c3b0fac585b772f5b2300f32fad4b807a6797e6280e708a00c4c4ebdb3",
    "3eae02bab30e27e1bd7da82fbd5d8a461531d482d2ffe63a7f21834dd56ec6c8"
  ],
  "cleansing-light": [
    "gXAAJCnjfCDK7YV2",
    "9340d80eaa9a0a33fd9faab1cad58e9374329e42b4b06804cbbe4840a66a6ca5",
    "de2965353c643581253bda469a818e62835812426e820f1d344e896da3a365c5"
  ],
  "cleansing-spell": [
    "f5P6TYwCnf56iwX7",
    "698970ce69d5122eed6d493913c132bde3ec9756ade67b23153b01d111cb4dce",
    "f6d44b22d4ba2a9782c7f35c482cfe7d2bdb59ecb56960748ce3baa4fae64f27"
  ],
  "clear-as-air": [
    "4DbkL74DuVbMcYuG",
    "f99fab000416b535340adbf986b97fde32d0caf2ab256ff6ca73cac62488b679",
    "191310539d0556dccca73420b7c94e20a62af5c7ce3a60d86463f8eda8195072"
  ],
  "clever-gambit": [
    "D1o7GUraoFFzjaub",
    "e2ef6ebe876910e079eb2ade9baa0a5fd47b753209eda024cc9f11c56d5d8765",
    "47da859a4efa1042c9ba6529b0b1e969313bddcd67513f43ecfa8d880448959a"
  ],
  "cling": [
    "SiedJ6hnDLEGeeBj",
    "aecb63db16078e919a653c235461318734f77df7f21755cfcad00236a54ce299",
    "001cfbcb222fb8402b2bb729340a1cbddce56ab35a852e0e856a5133ca32b985"
  ],
  "clinging-to-life": [
    "vAGs7shxc8vhySpI",
    "fb22b5d206fcd0d348bd0563fd6a44af44b56816de4115fcc7ee3d8ef83d48b5",
    "3efa0b6e474499fa1f5b2453011c9ba93a28495279b394eb54368a0b4f7d4527"
  ],
  "cloak-of-poison": [
    "fnMT0AsZXFW9Ppyp",
    "9eef8f44210bb662b995e43d3ab825c6717f1d5616435302c8b0f37ae566da7d",
    "024b7c153ffb8ae0b1e90b339c93f35ddf9e2de24951df61ebbf3f3354cb0e4d"
  ],
  "close-contract": [
    "xCbvXyWZ7JyUtN2N",
    "f804c6ea7ad70856fc210130201d68fde817fc07d8185cb69a64b55aefd05d42",
    "862c3d05cc1d8357aef40fe30d5df469e7587bcad65638e0a1de51009213ab9a"
  ],
  "cobra-stance": [
    "AkV4Jyllo6nlK2Sl",
    "638203ba33806864d8b4adf2b6069d85080d316d5f37cf74c54d534974c61b0e",
    "581f863bc27cdc1ae1c7a8aeb273adaff3346ca088e6394099f7458a835863b1"
  ],
  "coerce-the-current": [
    "VNVsyOQzsyfBnclH",
    "326206068387ccb1919daaaa444138e2e40cf11d0b33c0a35400e27a27d6603f",
    "fef0c8b24f9c35099fd89e6de507c34b36e313460a363db5f8aec3021b823266"
  ],
  "cognitive-loophole": [
    "wPJFEUOXwf7y5jN3",
    "650c8f9d1ec81651edab5c26f269a849c8d0fd4a9cd3df2f7e2786855340cc6b",
    "c55d03a5b3764f5a0edf047ef6d523f10cd52398014dcb37fa836ca9b2ecf134"
  ],
  "collapse": [
    "TtlbpGchHOoWc4HN",
    "76031ae09745c09d550acf829be9fb3ac5b8f51e54a99af9a1fdad27e02dad23",
    "c578e1f69d4b9fa4992b2c0c3b400937b0b2c10d809ac88ccacfaa7dcaa69f53"
  ],
  "collapse-armor": [
    "DFusBl7CyNkuDTRa",
    "6adad84a8f569dd1c490d1785ff03a44751123b67e4e51b1ae0caeb5edb68c4a",
    "93e870631b44c461965377c8be488a301ac8b2c67e7aa3d1b5a1740e23088789"
  ],
  "collapse-construct": [
    "wKFQreilUASJkKzV",
    "898cb4690396f9ff0198ae1625c3d6f03e99ed1d57b6b05d563f63b8584e3898",
    "b13ab8246869027164a3472c4776e8bedd6492ed60ffededb826a51199bf1d8c"
  ],
  "collapse-wall": [
    "n1t6foOyrN48OVPK",
    "924c40bf0b1d7b7e6e47a4ca1e7fdd35dfa8319fe534962abf1eea8743cdfce2",
    "80a531a9df536aaca1a63993f8bc673ce81d04d31f7cba65f052a3d3a4db2d3c"
  ],
  "collateral-reinforcement": [
    "JBfJSrPlfH4Dwp6k",
    "67f2a2fb536df24ceb14756e299f36af6c4e067ea655f6fbdda0e46124bb7896",
    "693c6a7f50b2fe9b857c62b580d6a9bdce692ad9b4c7c0c4c625026ce4295aec"
  ],
  "combat-reading": [
    "kqW6d3Dfk4nApd7y",
    "7d9c4e52dcad97f80d3ff7f4d6394d2f2013912854f3f80592530d6cc0c01c08",
    "8cc07993b75b6dfbc83a66ef0274c4835c7e11b7ddb041206d0da16dbfa2c4b8"
  ],
  "combined-form": [
    "rR8cnLpOqgSOgxLq",
    "198eeb4b0070ae2b61832f0228283fc5c7b1ce5614b8f65e8b9eb9f1514ce10e",
    "6a2068bfcb7f6a5e23a49dbdeba9ca123643cc0a192289b639f364f8f7084ae2"
  ],
  "come-and-get-me": [
    "Z9gzWFk3qom2z904",
    "7ef519f74fa5b001b0f87acf0f01f693e8bb1650becb54e178e9dc0f5f0fbe2c",
    "2e6ab2b83b8cc47dca1fc5153e2af62308b476db1c9b782946b3410b3df38fbe"
  ],
  "come-in-from-the-wilderness": [
    "84gsfJtTe5tpJQKa",
    "b4f58c302688a97dfa23a351b7cb0bad44f0baab3d5cde91c5631cd1f8fe7889",
    "dd4aa0636c33741050f5dae6ea7131d1176c7f7ddb2993889c80cccd52d12ed4"
  ],
  "command-attention": [
    "N0gJ4Q69nslbdXHg",
    "45b39c4660453fea7d99fc719e186c2da22dd2e6ca7d56ce2e5221fa326bbdd9",
    "7ed6a7d09aba010b8d355e2736554675c58aec4af4e3f5aa16b370bb3cc68eb2"
  ],
  "command-elemental": [
    "7G773pjnePFgnYxw",
    "d9d03caef4d37bab7b87c5145b7c5ce1d41f1953d77ccc22dd902dedfccbdb44",
    "cc52dd07809e910f2d38a94d442e6f3496bd4093ce9c775ab9b9982dfc723874"
  ],
  "command-undead": [
    "xYakFeP6olBsxpZN",
    "6554c6145c120dd6efa160503195213eb922b0ff1c3d70b20cdc705a84da2a76",
    "5a04557c25567b9e86000a145de512e3926ee0107acd41d62c2d306605896921"
  ],
  "commitment-to-protection": [
    "gCUJYnWPQ9VM8eXk",
    "6750618b69ab5f802ce07200aa6c0062b57dcf79cf813d58ca1b32278762397d",
    "720e46142aba17c45a71597114b5ba5c45f03ec457fcd2edf7c498861b98874f"
  ],
  "commitment-to-vigilance": [
    "hlujiz5xxb50jqeL",
    "4da1f7735db6d53f7ea17f34a513b182d4b740cb84263574304f48c9f94f1d88",
    "dc18f1c6f8f8c2f5c94ae4e0fc31089ed9e9d7b1a8cf7ca73b2170bb89062c13"
  ],
  "communal-sustain": [
    "a2wXdQHiIoj3lHoe",
    "8a96d8cdb6fdd54b0f9cbbe3b280ba26067a6f40f17428e8205b4908415410aa",
    "17c26bb2ceca2c7976d5103ed9edaca9884dff019d68f1eb5b62a3549559f420"
  ],
  "community-knowledge": [
    "d8SK0BQmTZiJ0VT7",
    "05ef7e233d72481da2177c44d99a4f48227f45ecfb49b0f42613a5694a26cb49",
    "ba168cfef64feadedf6b1465599144f91e45def5f0b35b41ab8b1df98e4fe4e7"
  ],
  "complete-the-heros-journey": [
    "XUzuDFiQwYqL1dWc",
    "376f57ba9dee9ae3df0b294befa1cb037dda2fc5460a731bfd3ccf4d00667ce9",
    "fe891318cd5be5ba6bbd368f032e66f503143540e2564ca8f3a7ed9dac17c12f"
  ],
  "conceal-spell": [
    "sIeuPW0j39fTZm08",
    "fa1171df10d9bb44791d92200accdee45bc90b1cf2d2f69441bf4e2ed412c286",
    "38ffbdcd24916379396dc77b48be77012da85a6c92d71e72dc802bb20244a247"
  ],
  "conductive-sphere": [
    "BmngPSf3ZrzcmXcW",
    "6b015fac7d5375f977321ffe56e7e5027828471f748da766fda558e57824ebe5",
    "da63e9117f0a3d1410b2a6b88cca33c56ff0c0bd817ec0aee8aa1c4a56da4dde"
  ],
  "conductors-redirection": [
    "q2SlRECDwGBtlMl9",
    "bf96c644b5b5f5d078329ece744a4ad04a375186f0c9501f8d025f650d0cffa8",
    "39129d7c071b22aa418094d57a634a8add95eba34a4aea9855e1893dddac1bc3"
  ],
  "conduit-of-void-and-vitality": [
    "iwBUJ08g0NJ2Emdl",
    "3a3ede1994925af6aa1a44aff42d083815e944c0cc49b89fb080339ebc4227d3",
    "d7b839a87f348b6a3afe9cc813b26c1e508c3c515f377d4e671b5543ba136046"
  ],
  "confusing-commands": [
    "ABPDBNWvhJRWB86m",
    "6cce22f4a38743a2532f664fdece71238b644ae182438c8e6fa82a94e47996a7",
    "d9d8e939b38f33d234bd72ab308c7a877313fee422fe694103109b6ac27d20b6"
  ],
  "conjure-hell": [
    "hEcKcvcrnL7olmsc",
    "1cc6cc400e6e84cfc59900b65bbb42ab1545220894b8e1e3950d8db621fb2bbb",
    "23d077f6bc07ea51d1c197f6155bcda31b6c2dff947a523579d1d6cdb3e7d8e5"
  ],
  "consecrate-spell": [
    "JQs2O2TTgKWXgJgZ",
    "1ded8048c960c55b40138b1b2d7b2c377c216e700fe0a70b1f999903fefb9b66",
    "aa45f12412a32a5f13f8808a91ca365f39f6eec3387d069d3f6c9dc68f396e27"
  ],
  "consolidated-overlay-panopticon": [
    "qV6EuOI3UJYIL6xa",
    "554fdf7ce3fb55e55cd3cf4e160149e4f2923406ed6cbaf7118426537d64dc0a",
    "1c9d033ad6e156e37a25ea99f937e14ae8e4a5128d2e96374cce4c51bf24412d"
  ],
  "constricting-hold": [
    "si8FGX2ZRxetdVHp",
    "70584a03146a1214025d022b2d62b8f2db03a661fe15c10b3cd52565ee34a36e",
    "8c715cb0236c2a3300c0335b98fb52e10418ff370b4b7b780456ec5af7b706eb"
  ],
  "consume-energy": [
    "9Jbl71C5C6MnOqxV",
    "0e9d6305c236c156013dd3222319c890694b1372eafd977e0a3f87f400bbc0b0",
    "b6e18871c5960d757fd8174465c4768ba7b0ae1b4ad71ae3b8292e1a8790b8e6"
  ],
  "consume-magic": [
    "Q6UONcwTlZL4F8Fw",
    "29f3966fa6f1fd7ee981d25ba3b6b3b3c8a78794e4a613873f236e319f733303",
    "4861a10987891883eeb580bc0dbde25204dbe359a1befa929bec9bb821a36a46"
  ],
  "consume-power": [
    "2pJhI6FL9hvXhXUZ",
    "2cf86bc4b2ef675f6997d43a3ec6af6d86581758dd1cb699128bbce2154b6ae5",
    "4ff6aec6e5b9b2cc7d0c824e5396ef900d279acc3641165823707e545a8cf457"
  ],
  "contagious-spell": [
    "ad5MsrMMu721NH59",
    "0f2435bb2439f4af1c0aa7a1321e0dcd1fe4dd82f3f26bf7874144be31f0c4bb",
    "f884cb06c9117585d608bbc22be2323b30b4d1b9b27937d05c1b08df47aaa575"
  ],
  "contingency-leap": [
    "Bs5vvCSFAU7n2xtC",
    "368211dd2024038e96f70678e9ab6e56ef4a9d7cce41b4e89dd058a3579abf10",
    "4eacc9b29f1742dda552dc3d46716d5a1dfe0f4c7012269fb070be8424638956"
  ],
  "convincing-illusion": [
    "bSXcyu7ExWq9qUzG",
    "3f9a9a1e97d99a0a0debdb29d4af3b2cc4d17734e75f0f160753eef56f60dfe7",
    "c91ced740656784bea9423db127aa6d6b7e72c4fa0b595e95c7a6ddbfc25ff11"
  ],
  "convocation-of-earth-and-moon": [
    "Jfq7VKkSc6TY7MEl",
    "b078e7e742798fdcbd9b155d01aa4380bac3c6da9e2223872e9d05f0eb4948d1",
    "cd747bd9487259e0dc885ea2693177218498423edc68460c054e58b7aef77902"
  ],
  "coral-detoxification": [
    "6jSRLRk7XkKHJqy2",
    "e33a8ae9f262bffe376ba8c7e1ed01ce9c50bd5b39295cbd1be3f7605fa1e97c",
    "68b5bee5667db664eaaec7413fd31ccb2762afe530e8046f4761984d74a1d5b3"
  ],
  "coral-reserve": [
    "KN6IxTO7H5WGYh3W",
    "dc899f51fa7e7570ba4d5ea15ec9ce24547880dc3d05d8c4e04dc888a647274d",
    "e33eb60ed1fe6ef4393dbf9e3ca773713f789cffa1e12ba800f7d3ac9a375f1d"
  ],
  "core-cannon": [
    "zeyrLJr6b7hPdx4w",
    "7c802a5890f8d0e1aa5b6e0b8cfa227c8e616fbf1f7e105d9e8a07053aebde69",
    "d6ab8e68f630808a7a9e587bee51054d9cfbadb6ce15a198bdd7d9a4a539c25a"
  ],
  "cornered-animal": [
    "PcayTyfEv6s9wRfN",
    "1202f381632b1701dcb31b68c90cb03f197572ff2fc7649ecbeb1a3ed4a65ec2",
    "627a023ff300fc5a87a95d08c973c200b3a55651ef0da9516a0d804269b8aebb"
  ],
  "corpse-killers-defiance": [
    "fzERYW7BJQoxlvoD",
    "4336423039dc0565b2a5b068b35df6bdbcd4d43eff8cf16212be0087e67ef683",
    "0a72fbba6fdcadf313887f59353776fdc9fccfe2f27c168ee7f327a571d23796"
  ],
  "correct-the-story": [
    "dmw79BbtUCJd300O",
    "25b0e2462087a7f148cf16185179cf9a30e0a21826c8f53abd151b7063a8d7a6",
    "41828282f73276cfdbf275e6db886b5a83269251b28f658a9e42859abcdedd6f"
  ],
  "corrupted-ground": [
    "Gc5HwASZDFAQpb9Q",
    "bdf2a9c94108133eda58c89bcafbcac88fb3778cb834b35e1ce7b3c051a45682",
    "7da854cf6c42f9408cfa72436ee1049ddb8830808d730b728b955513f0745716"
  ],
  "counter-curse": [
    "3xkFb2qlAdgLmdSf",
    "01aca2584880ac4ea422ba6c757e919cc9eeb1225a5cbd4bbba9806582afa031",
    "5a17f23e5687fe1c3162efc61648fab842ed310fb48cf9cdd5927744a4f405fe"
  ],
  "counter-element": [
    "6Jj9YWkGaNfzLheQ",
    "f6803cc7ee75af2fd24021842b709a7d221172f0e2154f1396a59713117d9a60",
    "c9f5f48ee479659db3243fd2159d5d21f2256b882ed088041d3dba877b73edbb"
  ],
  "counter-thought": [
    "QKC9iiR4Epj1Lyc7",
    "2f001553c643501094e70a8cc964ea0bd422fc6dc35322a3cd61c301ff18d588",
    "050b25e4e82d911f0f59fd2aaf0331e85cfe2b85cb5cbd4503d49ae6191c42f9"
  ],
  "countercharm": [
    "r7srDh7Iz94vfwwN",
    "cb70bf3d827a051ccf12aebf2b8dc82de912cdfbfcf9d8286c48fbf1d9117041",
    "7060784f75ef5b422238ec937aa844488050147b3c329b950dcdf8ee58996afe"
  ],
  "counterspell-prepared": [
    "EpBG4CFMNSZQx7vI",
    "5a311e38fdb8277f45b789e5276a48e716d8dd29da8e47b4cdfd1a58aed8b4a9",
    "fb8b576125bb5b67da33c661c9ea0ed8ebc64eedf831c66ea18c843c826fbba4"
  ],
  "counterspell-spontaneous": [
    "deoHKUzpzT7iwWhL",
    "7606ebf62210206b8d336e05107ae978a9102fed3d07b84bd6407a7080bc090e",
    "2bba1aae42e89907c2a24d7b5a4010ed52fdd3c1ca40187a11202119664da51c"
  ],
  "courageous-advance": [
    "sv3ywEHaab9oZ3Nj",
    "e4dd9afb9c0de59b8eefae21521af757c01da9d0e6b23db56efbe5d00305d720",
    "aee553b040b3e26e100bfdabef5a7afbf766708ed001991c17e76959040851e9"
  ],
  "courageous-assault": [
    "Asb0UsQqeATsxqFJ",
    "de571a33c6709e63641bbdc7dc7020de12c7de901020006d83587dbe770259be",
    "6d2486b9dbdf98f36a1c27ba6be058ffb04d65e2dfbe0a035b38a0474f352497"
  ],
  "courageous-onslaught": [
    "8C9qo5LL9J0UTNGc",
    "36fd77e049ace8369a38165905031409592bbcac52dbbefd8fc1fe1eb0256da2",
    "b6e72448ee21407a4949a404d8e0b63c4e884a8cb57ac1dde692029ec16e5f33"
  ],
  "courteous-comeback": [
    "DwnnmTNOvpLbp7jJ",
    "2b1f3287a54ea4676dca005041eaa98272f4d1dd081907cb5c512202fe8d563d",
    "3c2f75eb1dfb08fd93fe0c5952081094bdceb1a392128f1598a67d8add05ed21"
  ],
  "coven-spell": [
    "1GxDzMf32UTTro1d",
    "1f35cdf0c8ee0121d3b4f51675b97c7ce174f8cc9dcd093716161297f70bef15",
    "c38b340fdbfc9bf3738ddbe095d198b43a3efb883b1b84cadc45b8137c282291"
  ],
  "covering-stance": [
    "sMKUJQ29CYYoB7b0",
    "3bf080d7c7805f2648702200451600a1ac71d98d9b460efe02919a86589d742a",
    "8f2f44dec3d5d6ac14b726fcc423850f60c897319b22cc19149652b2257edc9f"
  ],
  "crafters-instinct": [
    "j8tukQK5FT1Vfx2G",
    "44ea6f4abe4dbcba758c62847aaf70f1be4d2b1a6aaad218eb6b983e65db9f6b",
    "e3d71fa0f06356a52aab014cbe28cfc2994f2310324d88456bccf91b796b1971"
  ],
  "crane-stance": [
    "bf7NCeKqDClaqhTR",
    "ef21ab89337688cf592d45a315c86da6dba3180fa789cd558e20405bb7c9ceb6",
    "26d7d435989a2aa11618357e6fa4ba3519b3f680dc2d7ebafb0eb5a731cc87b9"
  ],
  "cranial-detonation": [
    "vCsprcXVTwgtUYAZ",
    "a30b3f716b38f782d592bcf7155ae4b66cccd4a17f08d4269c20c219dae20934",
    "2dfe05109ff898571ee57da262d75d53a8cd82e4c7af8f2684d180564d163892"
  ],
  "cratering-drop": [
    "4PdWIMjSHRTPekAl",
    "cabb50faf6fb5f3a5f8b4e743a8920f4ed15229063dbd82f279b4e4c879bd91a",
    "68f661ee3f00ec8fcde2881884783e8c4d41c5ceefadb00ecc4631dcf5432b60"
  ],
  "crawling-fire": [
    "rpBHUvBKodPCHaET",
    "16a4161948f07e6fed4d8fef242ae600ce9d6a736b6a0c4e916190a39f57e5a9",
    "2619cbee837237c4c3968e723045d1657f100fbbb36b2f1cc173c5f9235b0a90"
  ],
  "crimson-breath": [
    "ZuslXMXlW2TzoOgU",
    "cd4bb9de7105102952319a5d41b4909722d05bb9ccd36495007a04431dc16776",
    "5fe08f50f6f9eaf0e9eea2babae6b2e1a9d3a7503cc6a0022bc29d59442efc8c"
  ],
  "crimson-shroud": [
    "M2V1vqAziOkWV30B",
    "134404e80c57b4292e3d6bad2ef1a99f602711b8f783cf656685f141c145d3bc",
    "0179d4568aa60890be615a3cd6f32ff39bd411b33c291beea6524c92f90b2d64"
  ],
  "cringe": [
    "WoKiYMCXV27szBdy",
    "b63f58e29ee83835715fa8ead800f7c35c2e0eae6fa30a5b8c075772e371f6b1",
    "9eac0e1f892acc868c3e3778aae870fb48ab0cb50eb694e70dc921ffa803b40b"
  ],
  "cross-the-final-horizon": [
    "8YSwzLNlmBLoEyUj",
    "f03aaee45b7813cbaabc82e85f7ab323ae09acb167639e5dd9c7bcebdcc37aa7",
    "fedf35d17b6542b592c025a55a86c8ac53b05de2c9ef6784e13d9c1dff7388ec"
  ],
  "crossbow-ace": [
    "CpjN7v1QN8TQFcvI",
    "9eb4b5dd0b130f782c42c7029c92478423b718620d0b814281515c7fc46f0802",
    "79a36aea88646056a2b78cb43e131fc4c6ad8031a346c0b88be6e16e6ef14a7a"
  ],
  "crosscurrent-counter": [
    "sI4f0xdCVulyK9sn",
    "964f73b202c0156196c81613c17dcc2dde527c101f51a93b5b0c244981654348",
    "d02503da5aeec9dd5cace5a119624cb3403907917f62c3ca82c8bc15705a25fc"
  ],
  "crowned-in-tempests-fury": [
    "8iHpUB0bYaHh86Kk",
    "5c32ecaec140cea075b17ae0df158b942e5bbc5e5a74512dd2c5988c325ffd07",
    "67f8e337a7dd87e153bc9530ec24e8276ae32b96ab8b827cdab2d978ba07e0bc"
  ],
  "crusaders-masquerade": [
    "IxgBnW2L8MpJBUG2",
    "575513761ccc1d8db859875b4ea7cf7c138cbee13132a74fbb06973a3480c008",
    "445436ae6f58a27fdbae49cacae5b13e79e4a21577903b4d75947b39c09befc4"
  ],
  "cry-of-rebellion": [
    "Qf5aimp36VcZJiYh",
    "0ff2409452c7a18b6b1bfbed9a1c1e678472310d3b56836138309d805ce0e737",
    "970ab7f2f8395399c2356e0b4513a0d859fe4a59fa42b2800e0199ba1a72b7b6"
  ],
  "cryptic-spell": [
    "6oObLoUn3MjmwbaW",
    "c4ff042599aaccf5f5c4eecf7d6f44b9f3894319d42cc6f83bc8a0f8d918a593",
    "3fa698779e017760168305d85d564e2a35d59ae15076eb1bbb1fcba3a94094f3"
  ],
  "crystal-luminescence": [
    "TLuFqQwvnlJNeEsv",
    "321b1fdb2353b6e84a4c3a792f7d6494b7128cac6b7b6d343a6a2ea9daa933db",
    "b0a0e5749e55128339a8fb6b1052a31c88490f87efc8212dfe9fb408369c5a91"
  ],
  "current-spell": [
    "ajesR7y0jWzqjAgc",
    "8be41557dd1bae765f473345b1581ef1a9527f39b3cb7db97b76e16a5436ba8e",
    "0018a531eaf640f91f532e60dadd7320b874a0d73a19765b1f9887495178f283"
  ],
  "curse-of-the-saumen-kar": [
    "UJcuACMlspc1raL1",
    "0ffe49cdb184257e3c937db3cd08cc8c7e539407d15521c69b3e81c31a4f4af4",
    "1bb01551f9d340c24ae2e298281823e1792d98305e4fadf628c825dda81ad4be"
  ],
  "cursed-effigy": [
    "kPjBGlHMvBqFXNq2",
    "882dd16602d0d3d7faf21af0ee9c03ba0ce86284a7089a246ad7eecc4fca3e85",
    "c92b2f9e913a4ab6b5b30c9052e5b02b432f50413a4a19dd831b84b4b32778da"
  ],
  "cushion-landing": [
    "YXyoBZFpOj3WRX3l",
    "34fa293204de7c324f42c9ab35b9dfe8e3bf34d2e0cd34d297aa7eaeb880ab4c",
    "224429aec62b0c72f811a1a891c7ffa2216ec6335af559ad6cfcd6521fd45a7a"
  ],
  "cut-from-the-air": [
    "6xBu4BewIkOIt9M0",
    "bfde95ce71a9ceb379b88a86016f3bf203648d0c67b3f6d941a2ee7388605be7",
    "b6933c2dc3b2db86a1b3b7f28fe5ddf733b524de336f5d055dba5a858ac75f79"
  ],
  "cut-the-bonds": [
    "r0twuF5nxXN5lkLk",
    "ac41bcf3cad028d3d23b89f9ea5164cd32a7ad7b4e9e7fd766f970ae338efeae",
    "2c164a064b0391135adb4edca36a92e0cdcf6eba794ca9abc34dfd395f519f02"
  ],
  "cycle-of-souls": [
    "rHOBdIFvsLWoZFbS",
    "db86337271d13b8d30704a2d53e80231cb2f799619bfc16a340e6c18507aecd7",
    "7bc92c6e80b2b8e234fc5a6881236c2eaf2964937ee777d230e0ab16538a2eb0"
  ],
  "cyclonic-ascent": [
    "u9ZuPuXj0xA4dHxr",
    "58351d6bd0c2b72d8e488925e1c990a2342f84f8b5389da2653886a5ba229b39",
    "64aed5074d4e68adfe9c0f388d2cb985d1e48b45e3f38551c1884982dcceb100"
  ],
  "dalangs-ally": [
    "2jd9qqXPPXKDxBBZ",
    "8e38a6c36d27ab61ae39c989904f22b32b383c8d6c66204d791b51d61f9be1bb",
    "7044a6471dfd6808a168814109e782083f2be3dae3915435f68821b173ad91c6"
  ],
  "dance-of-intercession": [
    "epzeES7xJxvIXDdj",
    "b114951863f6e7bd7e3878e64243c134c9864f996f8f578f3ccfce7b43559547",
    "d5b9901429fa4aaef0282c85416d315c33c9cab3a6aa0c1cd2f34eb62b165274"
  ],
  "dance-of-the-jester": [
    "ycmxU7gySnfsO1Se",
    "ab36f096346e095d16bc73682b96736b81e7559dec3e19c935a3c9ec94ce11a7",
    "81071ae5b3b90731c4db32658b8152211f2e8a1e423a884520d1df6688769a29"
  ],
  "dance-of-the-mousedeer": [
    "1sojLNzisrsw0dhW",
    "b68aa14273004d872fbfd8e49a3ace6300d9f2501ea9c29374230d81883a8397",
    "be3957c17d6dea01fd49ddfe4e73354505c36baca95ddc326d141e9a0a940f5f"
  ],
  "dangle-vanara": [
    "ieFjiZSlT9J4boqP",
    "58def987c8a9e7aaa203e8de63eb2243202c2dcf3e59517dc8b30f9961569a2e",
    "0d2925baa316f05d79c589370be0bb59b49ee2fc18fb48796eadfec9be92d984"
  ],
  "danse-macabre": [
    "PcLqS5h6stRtdioZ",
    "d0db92e0a35b0cba2344919df3abfd86da6e22b7c6ced721d2a93e376a63c66d",
    "219d7967a8a8115808c9a5c1c96220daf127c0d36cca5a93bb5522aae1d79cb7"
  ],
  "daring-act": [
    "cny7ouhsoiNsWJ7X",
    "07f81f36bd090a462696f632d18346cf5a103630c3f6693bb8753b8fe1679193",
    "f56d31aa102417be8105516496c3caa3ff15c9fa2008a12f387d6b22e73df2cd"
  ],
  "dart-between": [
    "KwbteWlCzFT5veZO",
    "3acf7f1f7e65219e7354781fa4e23ffe20dab942586ac2d4411cc5e4b95060b5",
    "e4cfb6d264f69d63edf4c8453ccb5ff89ac1eb7d1246de5c9b0a71cbcfddbccc"
  ],
  "dash-of-herbs": [
    "azyp4nQgAPDI6nKv",
    "24532aade4f6861c5d281fb843446ea64fc7c14a9e683b9f488526c6f8eb1de4",
    "b9d938738cd39ed46257d4020430993167d1002a6b5903663d9943017d842c63"
  ],
  "dashing-pickup": [
    "nV29YjbLgRfEPXMR",
    "9c757901594cf25d9129676935931ebca56d819305f0943f86ac9082689e7421",
    "acf43c415d509417a021de583b79c551f2db1ecfca7d456a48b5e17024e11694"
  ],
  "dazzling-block": [
    "9uvymmdphxsD3yEd",
    "5dd647840fafbad6e5ebb11391d24eda80c0ff825b90d0b9f7efd7b3dce931e3",
    "797d5ba2fb79dee1c771087280240de223b7c0950c0f3b8e91c58e8355827e65"
  ],
  "dazzling-display": [
    "lk80TBn933RECRD7",
    "1be9c329c0007693c78d958e9cfcafa41875a2245f21e95a8cda2040112a8d4c",
    "584bae262ca526b50a10643b8cd4a38a0e567856678b77e12eb67452f97bce87"
  ],
  "dazzling-dragonet-disappearance": [
    "zeXHH7xFOOFXH9gB",
    "6abb5038d53252acb0f974f3a49cf24f4d23d16a3bf889d2c11bc27a21e264b5",
    "ed610db76cf4dfb99f5f691d8e1e7e979aac3c013ccfdfb9851cf6b2c7a6e107"
  ],
  "dead-reckoning": [
    "68Kc4UyhnP4l8mxq",
    "ab45edb0a532ffd33ccf8b02f7ad256299df967392f6ae11331fd4fc94bb8d18",
    "76437d0e02db6e5adfe669e649e404ed600ecebcd0b9d1ab25cf1060c01a6f44"
  ],
  "deadeye": [
    "NJyyxInJ743OotKf",
    "0ae8d59a896d116f1a7222e48c5e9db649e446255bc86a4284524c1289c29f31",
    "aa79d17a6ab4b251c1460caceb75bcc84c7f55fa262f9f625d026b2500f839fa"
  ],
  "death-rattle": [
    "E3kfs8Erq3iGSE78",
    "625b471125c381906f8a093535d605126693e2a1adb5c5e18cd075e9749718dd",
    "042d9510e5380261cc5ae475d14bb6ae8bab2ea0c6d408ecd5d95a6ef5016f73"
  ],
  "deaths-door": [
    "PSpwdvuddC9kXONz",
    "77f05362c0b1516b6b078e9aa8291dddc345c6d5cc407dc902b857e6bd3aceb4",
    "8d9b2bea1b8c44e236dbe6df06d0dba4b5fba32d78943dd0dff25d4f2cc6f264"
  ],
  "debilitating-dichotomy": [
    "iy9XKih5jIAdv67c",
    "2022aa695848d1543c3745413757c25e38112a57bb6fc11f397707b7f91410f1",
    "ddb4ec69e8b76d84dc5b1af1449a1351c02fec2d29055e48e49cc60fe53cda07"
  ],
  "deceptive-deduction": [
    "aTDFdtAuzPBv2xbw",
    "972f83d63eb1ae2dd77a57d3c45b3a304b452a14aaa661ae7e17feac27df834b",
    "137bd78127f50b5daa86e068611a8e629495b2e5981b9ac6ffbb92ba367e65b4"
  ],
  "declare-anathema": [
    "7P5aKtFoPVJJPPEV",
    "9999e92289a4945d36a3149593e88828a74c1b27ee8bf82f498985d5242ccd9c",
    "b3b1929f3c1bec5c6981321da62f95398faa883174e204b3000d48cf504f7fd9"
  ],
  "decree-of-execution": [
    "2mxg4JxPE8k9jSkr",
    "c09953f093402ad7641e9df0c74a440075a652fb9c5f6291843499c2bd854d37",
    "22511379e6a84145eb1cf68746c60ce8e55ab5961cf93a785b1cdd32a03619a6"
  ],
  "decree-of-prosperity": [
    "O31zB7jxaW2487Q8",
    "b8d8a1a8426f4555603e6dd3065baa041735aef7a3a6ab2bc49b99120ae2b09e",
    "7bbfb20a2e29fa290cae433ae62125f5daa93517ab43f988c7f90f9cb9b9e909"
  ],
  "deep-freeze": [
    "jNzjecRGyyAqkkrm",
    "de7ad6bb57547465a8d9d721cc35bfd3a81b02e5d2a28dfb60ea3275df69dfb0",
    "9837e87445788b0fd61b5411fd3ded5a4c6aa80b422b2a2bd8c8cd201b47565a"
  ],
  "defend-mount": [
    "sflJhnFzYfqZ2tDy",
    "b963e6ac7470925f9428b26b009dfdd97581f39295f220b6bef3e8d384e7dddf",
    "336d92a562d2b168806117907c52a85bca77d2b3f5981528bbe0fbb8896729ac"
  ],
  "defend-summoner": [
    "xlparPCGhkgjdhx2",
    "c6936033ebe2908d3a9f8277782a54688cd9994411be1f20b53e3a6a9b32e6d5",
    "c7501baceb94e901fef9613fc5275bd389a56c38b98a47f7ecbeb91f63aba88e"
  ],
  "defensive-coordination": [
    "515N9nl9ChZwLWKR",
    "e6cb1a1d299b394e55639bae0397014794bdeb8a706e6d408ed20f6f1de61e9e",
    "47422f939f9d2fbe88f55b73f9929ecf77e9e5440ad2696782dcc3ee2ac0c6ad"
  ],
  "defensive-dismissal": [
    "aJyNVKbTdpWFoM5z",
    "52f3ecf2a67a42a1c20228b73ff5b069a954892c7675a4c237b4014c2c2e2cba",
    "87bf4abcad9e3683043f5d84b8972d049b83514b4e84b995a97d06d43fc52f66"
  ],
  "defensive-growth": [
    "pGjSh6qk9kQLznKn",
    "e6f79895bb9dd8e390fdabd69da7f88baea5ba54811a4c83895c88aaa1734915",
    "a00200ca7432aba4496e07bb22965d2923cb44068ea944ccc0f8bda6410a752c"
  ],
  "defensive-instincts": [
    "RxA1PdgGbijkieJD",
    "01c614e0ecd12068a9d3999f51b4bd6c597e9891eb7899b7d9496ed2d8b70a43",
    "c5191eb8f9e019652bcbf45039366444fa647b2cc710130f2f141aa8e7aaf5fb"
  ],
  "defensive-recovery": [
    "d1ktdX1Fk37dG5ms",
    "a2c81867c84e08f8de66f7c8c9dfe47388693802fc82fdf321ce7ce214131e33",
    "8a72eb4da8825bd7a2e2c39fab48f9c19f9c1e8016e2bd734f95da7f5ee06a23"
  ],
  "defensive-roll": [
    "aPt0WfFoeLTzyQRA",
    "16cc6413fdfb2926ac322b7dae8e2701734e3881fe3213f0d86a1a7e7f07c023",
    "17b273fc200314ec997708ac4655d2e2a26cd2280a6fe4159ca3b65780ac9ec6"
  ],
  "defensive-swap": [
    "l3YdGb3S9f4dVdUz",
    "7fecdca32bdeeba5719dd27df9d357845d70a51cf72127c7a0f111b8249934ad",
    "2afd337c797d28a70c5b635a41d05deab1957778eeec04cf49027d8eb9babc2e"
  ],
  "defiant-banner": [
    "eAEq2FVnneuvOYUD",
    "556756af3f66f3a0da96533bc6a686a07c57514c499bf7cb18de8d714999a594",
    "7a77f6d0e69b10e50e258d3a2343d96091ebc9e0e1a0732c9e5ab8dd3288f51f"
  ],
  "define-report": [
    "0lHhrYVe4VXbdSkh",
    "75a0a82ceea67155774f5a8469981e80d470da4c2574eaaf8fa54832e0c022ca",
    "9e1d5044c4e80d3f115106b6c0183e3fcc55b2e08391160ce134949540753903"
  ],
  "define-the-canvas": [
    "BDP3asvoFQihPaG9",
    "d1e5923034a7510e5ed085a7849ade3cc7740559bb016529e862e6d761f7dc38",
    "2edc789e77e57ac663271c1989e3c61e539403eea08dc43b5939fcb266808a3c"
  ],
  "deflect-projectile": [
    "sgaqlDFTVC7Ryurt",
    "4afc852f5605044ad30cb433fe4320248facf980394977d77f82559d8d443239",
    "a1fe8d1e2bfcbfc225970db874f9ab475a7e8c407cc243819d1385620edb0e2a"
  ],
  "deflecting-cloud": [
    "VYdZmTifZRkRF7ey",
    "d611556b770f583a4d84d5d8fbd463a67d6adc7d4414868185198efe62da350a",
    "56f9e3b90b258ad67865b08bbe1646ef0632d9f396741c697102a00015adc511"
  ],
  "deflecting-jewel": [
    "e7nTmdVOcaVkn2Q9",
    "bf993dc3a5e748567b121e11da55fd606cf18d5e57eb6c7b38e08a2b665a438f",
    "078e1f35fd7b96ae4b05f72b821714fbbca0356025d0803d598fb62b8b43db68"
  ],
  "deflecting-shot": [
    "ToZw6ZjB0JhWwMeR",
    "8d36c242c2f57b23d29e8a7d84c9769e0a30e40d29e7d73d031a8f83d315fc0e",
    "c4ef41d31b20df4f666ecc336390712b06ae641e5a304a364bcabdac9d1ca7e1"
  ],
  "deflecting-wave": [
    "ie64VAbWnOGg9uad",
    "dd07e07202acd659d7fd4c78e17f672da8c6678ea19eb9e434a588d95c510fbd",
    "ebf06be51d517ad48daf4ce64519e8678e92420faf6f36bf5090eb3116fa99b7"
  ],
  "defy-hell": [
    "rLAaQBIgnv6zeNvP",
    "c0193ffaedc15e1b86a82051b8eaf2b49185aa8535fd56830cdd88fc928120a1",
    "739e424971a294470cc60ddc12336bc54960ea039862e3e84cfbb58e7a9f2cde"
  ],
  "deific-font": [
    "CjafX7d1XktxeyTa",
    "53976b124781b49aae1b77c717d60bb5beca8a3ade8a438de19127496be5ae8c",
    "afcadb1a6513629d789f7da03df7b534bbf8befa63469ea9df5d43648419d571"
  ],
  "delay-trap": [
    "Ar6W97iun6yYI8Df",
    "5ee0c1267b8891bb4b368c1c045bec321a041bd406a023b6fca5aa523c58585a",
    "fd741a6dd796ecab032e67fd9e474d0b269b7dca131df2012cfaae4e61046cb1"
  ],
  "demand-surrender": [
    "XmjvHxW5f7vKFIv7",
    "3ca152bd8a6b483fc729d17b7e8341d9bf1cdbe58ea82b0fd2caf1518b17f4e2",
    "11c5f3e42aec854ae9c3fba8359c6a0458fabb6c2d6277d76cb7a2e56b834c26"
  ],
  "demon-slayer": [
    "OLa87RacjBfMIVEQ",
    "7ec61137ba8d81fcf57755dc310d89c115ab3f3fd1e1cc6c29f03f138ae3fced",
    "a80c49c3b84d99a01ce5d8cc3dda1b3406da4d078fbf511ab68f0e9817086a50"
  ],
  "denier-of-destruction": [
    "siegOEdEpevAJNFw",
    "1aad9bf76f8061f8fc724b60633976f5c6352cba54f9bf2aa0bea93cd9c5d820",
    "a1ba1baba4fddb37832a03ef96249509efc5e35fe3d0af3e8b99e0ad90bbaea8"
  ],
  "denounce-tyranny": [
    "ISjnymvdFOPED9um",
    "5fb4439b8d1f15bad54675efda55cfe6f2080ea3c358ad8927efe4c126f76533",
    "38c5265d5e3fb30f9ea9144e2e7d5b9dffd21c330fe145f847801a6486a8d93e"
  ],
  "desert-wind": [
    "ti6rPcSBsCuyEHqy",
    "78756e6c5cc5e3732579a2e93d7ea193eb52083ed5a28aa2deedaa7c9dac3597",
    "045f1343a18f52a8482a0843461efd8277b3685f443bf80f86d3ededd959d0e0"
  ],
  "desiccating-inhalation": [
    "MrBHGo9nmzcVii3k",
    "8c08bb9b73a95291b71f6f8b148758d35a8f25f9cb6a7e84ae806744c4142112",
    "48db065966eb8f7d05172079640c32b74711c89b308390b0be2fd71598ab7c68"
  ],
  "desperate-finisher": [
    "nvPxCUOCMaYdhLp1",
    "14665de7891204b6e13e9eba108072f7c8ba46c9c59d1dbc98f113babc0ecd37",
    "7b61a58e727622f6a1dfbc35142e0d88a18941ae20fa5b417be8a8a451afe562"
  ],
  "desperate-prayer": [
    "WYaKRREZUSH0jel5",
    "f4a539d90d94fa27a28bdf47697ce1929fafb4e89672e86057047f184e810d8b",
    "54042ad6772490fb64a6abce5abad507bc140986461448c4f2044ff37e3e9035"
  ],
  "desperate-resuscitation": [
    "ZO37MZEQVNNtg46b",
    "145a25e51d52b12602c0bf0dd1a82657ed94427610893c939d6f269c3b645a3a",
    "a5f0727a4c5dad04f7351ae1c2d629bf08516466fdbac35a1388b4df32968797"
  ],
  "desperate-revival": [
    "u2gev0bUzDKwtpmI",
    "dd7f6c962f6d341fa88feb934ddcbd1e23a80554bd4f6f70da2e8e4a14a2ada9",
    "cf7c37775744e87fb36b4c5987dc2800000bd29eadbd2d3a1e167a742735f993"
  ],
  "desperate-surge": [
    "0yibAj2jEqErIRQO",
    "718f6473219374caa99cacb5cfd7033390fe7ffcabd797a5cf3bee28563058d4",
    "5296d68e1eecdabedd68dfd8027b9566bdd3a20bb5bd50da8cc4f9787a844aef"
  ],
  "desperate-wrath": [
    "EWeso1zDkCLGlnsW",
    "db14834af66f9fa20b5af7d672168092003c522de5d2b23600008dcbde6e5dc9",
    "5ffa7ea29f0417e53a8b49ea4cec8f2a1dfc1e4b5f1fa17650cd7b98a85a9cc1"
  ],
  "determination": [
    "wdkbfWKEjAFXAxto",
    "175a89408bbd4e0c929453ec801858a9f065576e551dd39034048d11922b8f60",
    "dcd3140a089aa20e9efb01dbdf73621df7edfe7858dca85796d1026c27845551"
  ],
  "determined-dash": [
    "vgsMKjAbRDNxT5TK",
    "6ab52c3c05c9590dbdadd70a15e7e878753f73ddaedfb5dc163789b6ee407faf",
    "f3038199ab308523a1b6783a9b5c6b6093bb68986cf8772c9d1dcf0892384fa6"
  ],
  "detonating-spell": [
    "K5ZONljq5XzS8MQc",
    "fe5d185a20f81159bb231f37bd046ffe37a89abedb490e84f568d85753dd1052",
    "2cda9545ff01b47677d5bbfde6f29ece805398d6eaa31d7754a0446d5c2ef378"
  ],
  "devastating-spellstrike": [
    "amPQHO9O86G6AC4P",
    "c664a4806d53d81b7997c46f38f8817d63a66f1133302310bc73fa8434248b0a",
    "0a2172d0419df7567ba0ec248a3e8218fe9a2b2eab8442d3da8098df758e12fb"
  ],
  "devil-in-plain-sight": [
    "j3dTFgfzmW8AmRxB",
    "f989bb01c398ad4a8cfd1edcffd8e76833c2ca85d51bc8c731ee8730acaa952c",
    "e0389a1778e575d9f12d1083ffc14256fdb752ac1c2435d92100c926c9f98435"
  ],
  "devoted-guardian": [
    "YwVdaszwpDJd6kf9",
    "30b87431a3fa07e297434c2ae975724da33c330e5e357e9676895580035d23dc",
    "4e307265b0fe7936aa5095b104627b8aa2c0c4f06a391d86dca1fb727e559bc8"
  ],
  "devrins-cunning-stance": [
    "OqqytsF2RIjB0EPR",
    "5203cebea1785c6157aa59a5272d27d4a70775ea202d8baab270bb03473915df",
    "b75d6bd88200879782e664cba9c44be4d4c612e5ae07be12ad267f28d000b29b"
  ],
  "diabolic-certitude": [
    "WxL8NMW9JQ5igu0C",
    "30a4de235fb544f373eaddfa066aafdf11731752f3008aac8262cdbd29a8a377",
    "f5ce76c83297194f7737639c0f4de31cff336fa4e842203d2d988f33a45b1b92"
  ],
  "diacritic-fluency": [
    "7s0I9i0eyo8Gkapa",
    "880effd739fe172bbc1e2c723465ddc534e6f3fbc5ddea89aacbba147e12ed43",
    "a6ce3cb492cb3528e8c9ca68be0f91a4a62330694c814660b4a876c64bd12346"
  ],
  "dig-quickly": [
    "PsLne80WUsD4IFa6",
    "2ac6138a1908eecc44c4fdb7b11b65b5d7461f8e6ae8b2dfd8fecffdf8b32458",
    "3b9321d989d0199a82629b744d2bd6fb35eb1498fe0d0121b1b7a77dc9079d2e"
  ],
  "dimensional-pilfer": [
    "g3J3kSfnlYjq34Md",
    "9ae42c1a306ab8eca9d03042d82f98a2a050ffd4c2996becce3ae381786ba6f6",
    "38f75801c12c97885b66c4f85de5fc8b1417afa17fefd07e60729f680f770f2a"
  ],
  "dire-growth": [
    "IlygXZqCaeB9X30e",
    "fbe55ca9b979b5d55834d2583f3737157e7057e4d9b302793ac6426318480ffa",
    "4b8b5fa1715a2779cf4f4802b212b88d939279de7ee5bef4349597b1c13979f1"
  ],
  "dirty-trick": [
    "5eNKs6738aykAhK2",
    "d20c885767355a767fa3eb40444fa7cb4d37bfc49ec8936d9f687e41e3a34b06",
    "6de8f8aff157aebb55f904709263b249cca003d65f631052c7244fa51d4985d1"
  ],
  "disarming-block": [
    "dSSwRyuhKTq1VubX",
    "75fcdea09c5e2c152cd28be7baaf6e8784e898b0e9a1dc8c2d5416b9bb09f15a",
    "1ed2f726e80587a57c504fb773b7f03b96649a7dbaed315e926c6fbbcc09c646"
  ],
  "disarming-intercept": [
    "HoDs90589eYQwcre",
    "c56aabfa59afbff6e777e0391ada87905c28f096d2a6454f2e4ed210d72dccab",
    "f79dcd180c69eb01f39b0957629d4b820a46d4bf01391a14a3d5085f2e25807b"
  ],
  "disarming-smile": [
    "ZGgFrQAQWk0keaFW",
    "5e6fb80b5ef949f2a654b526e30c010e822660e18a61cd29c393a424294ac778",
    "a25c8cb2c77d03e7634ca6341db47f2beb9a8124271a80827e0ef175a35be4d5"
  ],
  "disarming-stance": [
    "1p5ErCp33nGOzEsk",
    "44e7602e76de155f273ce39fcc75aa03de1e661731b33adb01bf9feb5c1aeba5",
    "45c6ec792e3fc814574f784433c8c703661290c7dadc992986e931262ff35a1e"
  ],
  "disciples-breath": [
    "cHOALlKY1XsCj3Fe",
    "eb3aeb1d2d002a75cd546cadde8296bfc36efbc3522b4e3dbd93c497c93ed1a9",
    "b2a7bd5d1cfee7c8e2b9d95a660402e5bb99ef898ba3db81730735d3cbb8a931"
  ],
  "disengaging-twist": [
    "W7IfFi6MkTDfO2hb",
    "1a26a5b2d7544df4973b016a3c6e17d2ce51399c2292dfd930673dfc5062265f",
    "5153ca7d46914f512daec286cf1b71e0c57b93077d7d5e997be2da15e1950b49"
  ],
  "dismal-harvest": [
    "uaUbQsdBIqCvJc2G",
    "4e126b49187319edde510da3cb144a1f1d52f2bca3d368d6356669eedea41371",
    "0b4e984008aec44e2352ffbbac61154e0d62ae376c709d9f59f0c981eae3aeca"
  ],
  "dispelling-spellstrike": [
    "Ndxu9YVGgenYmZSb",
    "62c8dcd23123350c78ea8c72c46657c159e67202567901b87ae7a1b28eac0d78",
    "28cd44a2a4160a51e95f92be8a5c1af9d1f9602342e23c2d9b87ae4966e0c6d6"
  ],
  "disrupting-strikes": [
    "Nm8n3urzpDqXni1i",
    "6c246e6fe928d9ab4c8294ce66ca8adbef9b106e8419077350301b08f516e614",
    "0251e1745c58286b21efe5b3ce6180acc1e5667f664d98be135695e17e60f32a"
  ],
  "disruptive-stance": [
    "OEGhbRgW6wRbccns",
    "8860105b81e24eb6aa81442d84d90c80a70e277961ad581f952f27522d428f84",
    "ca8fda16fc30044ed8dd3590d352a7f18cc663dda176c7793e66c2b5fd7cebfa"
  ],
  "disruptive-stare": [
    "d3J74jmGOrPBWUm9",
    "a5db6c7784831e43b1326c3782808855da4d0510a53043806d17d02898f44c8e",
    "7cd8e2294a2011e4fb77df3eaa27a434731df80f2463f7d3e8111362d819a086"
  ],
  "dissolutions-clarity": [
    "foMds7Wn9iavRuHx",
    "64672feaa34ad90fefed6dd514894a1a9e614bc00ce039ab49f41302ec390933",
    "99b424f580b84cf82cf6d273ec22afdfb7f2c671dc1175a931a6b2e7b152a405"
  ],
  "dissolutions-sight": [
    "wiV1CBh1OBhQCfbp",
    "875307fa14089ddcf6ed3c36bbbe6166c31b7eeed1c8dceb7bb1b88fd62649f5",
    "2dd5656d21a4423d0c1c3a99cbe2c7ef815926e0b8a27132721251b94ffd3c7c"
  ],
  "distant-wandering": [
    "YFPmD8BHv0XaF55G",
    "07ad5333bc533a10cee9e4d3588a254c2e9b01afd01ebf4dd47ffe60a5f094a8",
    "bac26931aa86314e8aee386bc34cc5d6dcdea6bded49b30b42f877ed13dcb396"
  ],
  "distant-waterbirds-poise": [
    "3HaftIWhhxIGWzE7",
    "0c48b382689de83cbee6474fca477b4b49501f59ef75a310056988eec7bb599a",
    "dcb12dda0222d7478006699aec0877f85fe228117080d9aa9d0dfff58ddb8217"
  ],
  "distracting-flattery": [
    "jzflcD1XnBp2bSZI",
    "7fe7653655dd14c21cc6fadbc034e965741994e5e3a1e97affc93a4be9168126",
    "24d95d813c103c6d4c5c4f240c6e85766c2763080f029f886e459ef5c3fcc166"
  ],
  "distracting-performance": [
    "4UXyMtXLaOxuH6Js",
    "6a5bda53bb598062e9c02fb7df2384a8048a2a7160b06d25550ac2b38b3dc48a",
    "60ec464059e29c322b4fe5684a74ccd01f46684011177a2ceb6583aa3a8ce490"
  ],
  "distracting-spellstrike": [
    "tIeVe9jOmxW7NgCK",
    "0ab4192975b6f0f4a5b80d977dfd7f6cd2507c4128cd5dfb04c5c89253a56bdf",
    "0ca6a3d1bcca79b8f8ee70ba1ef3d45e7b58244b19c25c72ad5554c6dfc45601"
  ],
  "dive-of-the-divine": [
    "Y5fO1ooNuCFPCB0s",
    "9e7af165cb5e74ce5f297c121fe8c6d6d357d3521763f9a38645666a1210ae97",
    "31bc892401baadcb14e49ec659439e39f21f9dd7c83fc4c9deeaec55d6c7132d"
  ],
  "diverse-recognition": [
    "yoeMOIgH8Snw1JCQ",
    "053889c5ca1a4a9053f1cbab5fb18b0a19c488c223d03dc0b6a36a8658f053bf",
    "baa012c91de15f8121f9b29af971d23ecd2e98c4e451dc459717fd50059cdabf"
  ],
  "divert-destiny": [
    "rljiwL00XW1RcnyL",
    "ac865a0f76fb737ab8318350bf3179baabeb54d2fd414e8cc5495f6f35762f37",
    "120005375b5df5a1b7142220bb33cd28185cba11ef7afafe634d2e2eb61fe809"
  ],
  "divert-streamflow": [
    "yFc0tN9HviAJnG1r",
    "56ce3ccadece53061ae2c799e52b06fa0cd73fcc5fcdce56cfba873d60d8fd22",
    "038caf56480f402c229777b118501e46ba1cd3c59c00d43de603e30deeef64aa"
  ],
  "diverting-vortex": [
    "PqZZSo06BH5N7x7C",
    "e5122deb8f9e0fdbd55b249a09a12486ee02e926eb20fe603189ab303f57f01f",
    "bba361d7bd0660343ef048dcc12875bd2ecbc14512614c5dd9c91176530b755e"
  ],
  "divine-aegis": [
    "xoIxiRtBVHV27Rvd",
    "eb286ad6a3bc42a19a17b7ee2ed3cbd34aeec6967edcfd75266489bee90fdcad",
    "4cef708e2ffae3e176a5173329c2aa1e934df90c3033516a76702a3b0a0c03f8"
  ],
  "divine-disharmony": [
    "fUR72e3t7p2IcqqG",
    "47ad1ceef55d13c7a0fad0bc342371eb90bc0ba161810fa8164d923acc78f19f",
    "93ed799ffcac48efa8d05ce872266b813a2649c20010985dc56a7db83154d353"
  ],
  "divine-grace": [
    "tJduF6N83l5khRow",
    "3f5230243c142c1aa7570f7d870c4eeed3252aafc50ebb4b05f3348864a8e75b",
    "cd2633ae9cae2dfa8692ed077c8bac6035721b8f242d177171a10db54bf93155"
  ],
  "divine-infusion": [
    "JcXzKwrdMkNszrJQ",
    "234d4bde0106624bc03da43343873979b65161e5000d8a6072065cb42a1be377",
    "f92dfd67c84e7f596c79cd8af330d275d97085b073b19b5f728792a994c91b1a"
  ],
  "divine-invulnerability": [
    "frPdltbxoYtAHpPX",
    "1f8d735ca57b0006fe51e0977c2ea6ce12ef13c55203e9016f785d40064dc93a",
    "ac21a163f95e16753dc41633945e9c26f2995e5604d6d2c214b9e466b77d24b8"
  ],
  "divine-presence": [
    "2uYigDgvlfCZVg9e",
    "bfcb7934c9e643e092c9d401b97ecbbda4443733c6c13435167abb3d06b4f930",
    "cfb53f6cc777663f095c5acab6caf3a6fd12065f4ba44975bc5a12105fcc5b04"
  ],
  "divine-rebuttal": [
    "iLFK11lcw5hViTBS",
    "1ff11f48659d32a192afe3837926445a22db86fb5f68a1e08d4906398d2bc944",
    "1173c3b1905c605b34414153849ba51725927564a9ad6820fdea931f3ea53938"
  ],
  "divine-weapon": [
    "Trj5azJlaOk5jgBi",
    "24c9ae3fc0134531eeb91beb423a7f5e8380f0fab69c2677f2fd2c89762b83ee",
    "dbfbdc55c5f0a475be0ece6cc834ef8aba1fc23caeafd8e617a3d426b2163280"
  ],
  "divine-wings": [
    "vtCrMziYxNyj8kP7",
    "43726a409d2b4cbeceece3bb046b82ce65a617bda6b5dcefc3e09955344fe76e",
    "e28462248edde2bcbbe07d1c2067dad40e1ca51cdbdc3c964f16d3f66adc0c64"
  ],
  "dizzying-spell": [
    "VVPPPT8kJRmeJ4sR",
    "50d93e7a56e454b2d8d689f122792f5d4136ed574e2efc8ace8c5bc2b79caa89",
    "e8346665aaaa7d9548a7cde77ee11b1990adfc5c3aed7c9269f409ca1f85a1fb"
  ],
  "doctors-visitation": [
    "1fBHZpM3Z3MQtzvi",
    "8bf09b858ead1a8333f2c58ebf9ab146e7c63cd6b6d9304747310eee4e045ea0",
    "53000c4266c3eaa84c778f28db1734aff00a41a669b6e107966474504df00105"
  ],
  "dodging-roll": [
    "nBWoZ311FXFJC8Zl",
    "87ee47bbfb5e434d12bca02cfc57ce27ef17e261de017c510d899524b1cdbfd8",
    "b8195b96aa5877b58067845fb2924404a9bf340280e3591018ba4ed150f2a8a1"
  ],
  "domino-effect": [
    "Z8r7U99OSmlxmV1b",
    "4b1b4f314cddb3ada4a9bda97fed5ab5e634c9cbb176cd81db5327d17c8d0333",
    "8a3d1a5fb65e44d074a2d83902b68f0ccc6a350c29b512ed50c4dd2736e6b4a6"
  ],
  "don-thy-fervor": [
    "hbDHgTwKsXiGFT1Z",
    "464de7b2ee27c02abb5553ece5c8fa8a22ed00b7b945b9ebed0c860096f5122b",
    "f5cd74a1547afb667675f62b63d4c23e34aba8c8f78e72ee44db3eaefde34031"
  ],
  "dousing-spell": [
    "nroOy0PBeEUGdUXD",
    "0c51de93e74da0418f723eb3cae4efef886b229b433fbc69c230fc42d55f4665",
    "d4829139a5a40120faf53e66b5336a4fb9fe98180a74a4accb7c63bf0b271582"
  ],
  "draconic-fury": [
    "fMIHi9AuwZF7DufT",
    "0d8ccbe8a997339729a4a764e169443856f7c52e87a5daa02afff8c41d799708",
    "9c9fdb43effc618a4e4eb2ca390777aac779ea0a4628edeab59ecdbe0f3bca26"
  ],
  "draconic-resilience": [
    "5shHvm7YP0B5diqB",
    "cb5b97b7a48b587fbffb2b13d0996e61c534bb5856c1f3734fdaf9a44dcbf269",
    "92c469c5c40918c713291377ecda082ffb07e794567d97e35d255790968aeba9"
  ],
  "drag-down": [
    "0Iv3VbR1DMPbZIjD",
    "89c4af71b540b6980a9f18f01cfb56e7c923b93cda8e3f7163d8fb47b0d37002",
    "31d275a9b5c02f0f1aecd67e1bc752bbf6eb90485dfe5c86427b1b35424aa9ce"
  ],
  "dragon-stance": [
    "8sy3sHwOHS4ImwvJ",
    "055976ec8abfcf1ce703ddd3bcce5b1f97ce05beb434ca94fe3342d4f910d4e4",
    "0ca55c5879a0f5025aab9e6d29c8bd615a7000dd19721f3f84d843a3867dc40d"
  ],
  "dragon-transformation": [
    "lgEihn7deZwHczGE",
    "5a4c3a438fcbe4a70e322a1ea341dab000f38a5663f7df55dc5a451a8f97fe30",
    "9df8c411cc03c2ed464d3b26596a4c1d150054bec4ed5680ec38c7b3a46e39a4"
  ],
  "dragons-flight": [
    "zQgdTW7CPYw8km5F",
    "c0c6670ae7dd6b7751b0f20a4c48344d4e8d57adb992a41f19a15f22ff697553",
    "82ece2a36fd815eb46b5c50d0ee1d1077a50c603c0aac7b75169e870c37a39fa"
  ],
  "dragons-journey": [
    "WRtf8xhjGM5Dy2RQ",
    "1441849a2342b74166835bab8df1878bc675a0e2523702e295b472f46bbc7942",
    "71b04321f87719d7138b4f75f0fc427004d9db77f51177047fcff3c528285cfa"
  ],
  "dragons-rage-breath": [
    "3uavnVbCsqTvzpgt",
    "af214630f03b5869a9c02d45b3511ee64d5983b8094c414c2ca0fc03aea346ac",
    "5adf3e59e1411d85bfb90dd346a4a55f7ba11d52da4286acb1a4370ce898ae3e"
  ],
  "dragons-rage-wings": [
    "bqZkAFS6eq9TKXMO",
    "da52eebdf0a76160f104c3528f271797228e73932e026522a1d462192fae8eb4",
    "cd7ed41127cd116effdddcd92716de537d6f7e658807f48dee8cd870425beed3"
  ],
  "dragonet-breath": [
    "RaqjaXp2miOq4Bis",
    "aa22ffee7cd6336f2f3bb0a0d66a16e2ad6f01d00de171851e289aa16aa0bf64",
    "0af1dd184f5b513276574fc611b4f3b362ea7df9ef017d94b40c750944e0e755"
  ],
  "drain-vitality": [
    "bJc477EbUYW2TlBx",
    "3893bb53a3d6f49653a0ca03ec75eca7cc1209e1190f644791bb01d028139dd7",
    "2140b44a8d48ad0e2693ac7747abaa20a8183d2688d06df37c38a3ea62e45603"
  ],
  "draw-from-the-land": [
    "HlqAdfxmcd9gdgHa",
    "0da49e17239088aee657cbfe396e517045b4c2205bdff5148955d0c2e1d1564c",
    "41c90449022dcfe3e66b2b378d55fbd96e84c2d32bc19068cb7ffd2ba2a0c906"
  ],
  "drawn-in-vital-ink": [
    "2XezSBe1jVsfYoDc",
    "af5f908525ef4581ff60b2a4c335db72e048882652bdb51285794749d556b201",
    "96147f98932dd9992e64e9716edb55e0d6b99a38c188f925dd2e811c281ed9f1"
  ],
  "dread-marshal-stance": [
    "R7c4PyTNkZb0yvoT",
    "9adbfaccab099d8fc9f867a1b163e6424a98b6ac011483f0a98fcdc7c21a8222",
    "19cd86d1cd87cc67e75d705e18d44977feb0a8f395c2750b8cbc3f8a07d727f6"
  ],
  "dream-guise": [
    "JxZobgFhLBNcFCwE",
    "2e6b8c3c8d84f2bd80501e80a7392f19c69e790f129a14c5a3db09fc052957fd",
    "aafbabc7fde4cd1bf06a2baecea0322018cf9f10afd0c70cb5f64ac022ff3029"
  ],
  "drifting-pollen": [
    "7W5oubPLcxHJdcHX",
    "8c72348ae03d590221b73f269e97f2e552182b53d8f009e9e47379994186d8cd",
    "60f47ab1491acc405383797595069ae1760fd0c4f7d1586bd207faf419e291f4"
  ],
  "drive-by-attack": [
    "Eg7YZBmeNJeY9wkD",
    "e36dccbd484e0c9fafe87a6d458aa4b5182344cf201a81c0bcbd4999e29818f4",
    "de33d0d554620d5aa7e9ba52ab43465965290cf4de0b31caae9ae6f2e8440457"
  ],
  "driving-rain": [
    "itn27nKYb8FRsdl3",
    "62e8574bbd4435214b407223771b965c433f53bb38eb380e067fb7ae8915029f",
    "60206736fafba84af924803c87e2270af4f072d5c5fdeb74b6bb078e6594557e"
  ],
  "drowning-mist": [
    "tMIz6B143mLMsTSI",
    "4ba19309a5b400aea12521bc8f60db8fcf43910146637cfdbaca6b42e62fe47c",
    "41dd89559b8b7b792adbe73ba93ce267245da597ae2b3fb74f2abb20823e79fa"
  ],
  "dualistic-synergy": [
    "9EqUTnbV8WHE2aKm",
    "7f44db1a7921db3778f0b513232400f8de7e288a91e8420352aacb7c8498337d",
    "622dd1eb2a24c8a97b3c1e99ef104e9f1a6766c3a98f1db3fb91503bc469bb78"
  ],
  "dueling-dance-fighter": [
    "FYz5eQeTox9IDkSd",
    "07f8509d64a6117b002f5b98ba0385017a7c416773e09921b7a7db587122b6b3",
    "78d28a2bac51a187bd3027c4a62a15f861a464d876d5afbe9af789ebbfc41a87"
  ],
  "dueling-dance-swashbuckler": [
    "9VGmE7X4aK2W8YWj",
    "c99327882410f8125a2678dc5b1aa4a8cd97029545b6ccced661dd76dd2c1026",
    "121017a7afbaaac71258714e395e41e1ba565fe5b0198422bbd3a9cc64abd65c"
  ],
  "dueling-parry": [
    "n7nQQR940OvFbw7T",
    "a45cfa1d60236eb4fd27d84e6856d97735798aedfd1f187852de9f09f09aa8c8",
    "62a0693dcd407177d452d90754987b1bfb77ea92a7b0aa9c68756855566d4a19"
  ],
  "duelists-challenge": [
    "5op3m0gwZjL4udit",
    "b05bf4064c4a3a27febecced4c271ed0730b150e73780f66db4eba8fd72b4f5d",
    "d217f889e553dff9e5d563e8529499c4bba49058de2c1cd4ea8efcec1a08c06a"
  ],
  "duelists-edge": [
    "Bk07joho2dUG3lVw",
    "a341be73ab8dc2f939e0a8b0489c5e829558ee9248059537a968dd20bbdf2509",
    "f6f5972ddde5ce33b34624058a1693c474b1607b15ad917030b086ed713d6fc6"
  ],
  "duelists-form": [
    "MXn2g1OrOOr2qqpJ",
    "e15deeca5e29765680d9656e8f3d5fb3b095d027c0cd1e2260ff53e54932bdfe",
    "36016303f70abe4c5ab91673bf018bef2a28df4c4d60201ea01b02c32e99f208"
  ],
  "dust-cloud": [
    "9ABMm2PE3eFSzhTY",
    "4335d43abe0c133518f45a894904a80958d08d53c881a55648d174a97a231383",
    "f94ef0ce1c09aaa963eb21a2d914161e055c8a61492ee64c741cae28ef27181a"
  ],
  "eat-fortune": [
    "rFmJVDdB313EibTs",
    "90a07b819035d1694e737642758c4bbc678cea21d22d7a8a20b56fcc68607b9c",
    "cf695e81f6e0b132178cf84d7b290d30408a159d0f11e68b27ef42d97e931b20"
  ],
  "ebb-and-flow": [
    "xSJaOcdhqDF1CBs3",
    "baa23acc7f108d6757ad1712ad401a8c992f3fcfcd70e96bca2b575c57ad1535",
    "daa1ad8e877ef070928b9206df10324b1abce6bf7079caebf5fba0414cc003e1"
  ],
  "echoes-in-stone": [
    "nKkbEKbE9vfKWKdd",
    "9c4499fe6e5147d15c981761a3087b8c14385e510ed7f312fcfcac3112197bc4",
    "8db0c58c36c9c64f55ac722d09eefff67f8b4d920292af43f6f36519fe002faf"
  ],
  "echoing-channel": [
    "T4Xm8vYtnGMOM0Cw",
    "6c42be4165912d8a1a63769052c2656b771ce9e45e4ef3aa6fd2d45e42e8bf89",
    "8f4a648b71776227be87873c113c4823e7ac12c762a4edff087dfe6b29632f84"
  ],
  "echoing-spell": [
    "NvEYf0jIETEu2LtP",
    "e25128077ffe481b8f937dcd50bf0fbaf78b48291b65a71878742de3e4d68e91",
    "2f132de4e568fe0751f0851f12bbf950cf6ded2c7df661aed057fa15efc1905d"
  ],
  "echoing-violence": [
    "DaW1Ugz0a24jhWLY",
    "7b662ad2c9ebec7d8844ed762730a31b465fbd1df115d2e6c76e094f02f3b223",
    "a3afce7a40901d1751f0a4ceb87a2cc0ee6a4e77ee78ef02a286a640b6b45111"
  ],
  "eclectic-obsession": [
    "0ihK3qYItmi8eVZs",
    "1258db056bf11be6d902209a4b84a69b9db70839262ac2e5b27b0fd368c9b68f",
    "269a1207887b83072345cfb24a35a3b3e89006d2367be4fca3856f664474d73a"
  ],
  "eclectic-sword-mastery": [
    "DNZlWe2V28KoajoN",
    "0419c9980bd8f54d61ccd3b51869a572afa02145fb6e3073dd8a657045c8188a",
    "bb2ce395c1cb63770d524c8490908e57f1cc024131176bf0dddda78f83782822"
  ],
  "ectoplasmic-aura": [
    "uBBQtYDIsVxnUJsZ",
    "8ff804eec12a42e5c0d254efd63415b52e288ecca7fccb70847d40044baee0e3",
    "5fb2c55e04f930dc178c5121d871063236e2bff63dc79a77324d436e5b2196ff"
  ],
  "edifying-trace": [
    "SCIczsxMTcwD5I4e",
    "bceaa8582a9444baf17ebf450432eec4fb696c4b1c3e70939cbe1c7275e2f81e",
    "8972854e095bf1eef75e994076332501ce282c29953ae90e5575887a8fe7d8b5"
  ],
  "educate-allies": [
    "9cHQua33V35JPE3U",
    "a89a8f63ef3344cd560b42c396f84652784d78147c10fcf70ec941516e150a76",
    "e868dc816cad2c57a15987769ea5adad3897fad2115824ec4dc03f34a0a92f42"
  ],
  "eerie-proclamation": [
    "Ob4w36tsd1WKSxZo",
    "4cac088c338b86f6319e4e85f20ea0c70b589538a89d92158733b100905f8fd3",
    "cfbaca3d1a45949f4cf5ef3c6936a84c460741ba9193c97e3dce8aa22dbf2783"
  ],
  "effortless-captivation": [
    "lZA7SYBmSPFlKNr2",
    "833a0c080fd8fdee007b7cedd2850eca3e074dc0fcb2058563b88d386e97310c",
    "842b5103c3a17353c858e3ff1fa27e80c7da75159e5ff1206e9d9591b140ebcb"
  ],
  "effortless-concentration": [
    "rgs6OZJYCgi5At8J",
    "b347c330d5fd9fead435e712841a5bb746827061107c275141fd5b8467151ff9",
    "7c4f9fa7dac2f19d8ab29772ceb9aac724252a6bbd516f3e72f1db043c7d7b90"
  ],
  "effortless-impulse": [
    "YpRd68IAAKz64Lwt",
    "c0805a5ed579847a38b01778b62c5bc930ab5f3a05c718451dc479cf49d3656f",
    "5fe0f3c59e49394a91bc61d55b5ef3d6f24bb14e8f2df211f0fa8c3c1e4b1d6a"
  ],
  "eidetic-memorization": [
    "JwosaDYoqfPiFMYa",
    "17183a895166dcb04288169efbd0d544493edd9b1f00921b9df0b78811f04c30",
    "cf87a3d31bee0aacd8cdcbd0e0618c341fb3f0b2cfc297a4c2529c1d2de9604a"
  ],
  "eidolons-retort": [
    "588O3jurogttvqgm",
    "f9122adc423c2212592bcea26d5ef333ba7e0012f20b8aa07ce984d123e7d8d2",
    "5b95f37a2558f51b6cbbc2464b2697688f06cd2f4770db2f501da7188ecbb2d3"
  ],
  "eidolons-trample": [
    "7GGxxoYNA4YrtML9",
    "f81da32127a9ff21b8b9ffa74376026966ebf0da9d84c1a00c65ca6cb10b3b27",
    "e232475d852c45346386d86a3919950f0095fb7726c5b61fa79c7976748faf75"
  ],
  "elaborate-flourish": [
    "pCVegyXxNibF4ulp",
    "071f598800a5dc8fac0ddd37b582df6e646f70798f494b89a0fbfa83d9871a34",
    "b7a1e343219620ecc856bba9dba4eef166c7cb596720c34a2490d023a88548b8"
  ],
  "eldritch-reload": [
    "kp2brlFZEbVCeWWh",
    "279180725588942ee0e71d6216d97c92ff8cb568e21b875fe7d990cdd1fdf38b",
    "f462cae4af8a94983c44e1af9d4492e2b97508d1054ec3121cb96463c5703900"
  ],
  "electric-counter": [
    "zfnZki2CxmZXdNBO",
    "e2d8f4f2e8c9e58007204b382aa984e28992a30e9fe0a979ded2b268f46afbb4",
    "59bf5eec0354a95ca03d937d172d0a6c93d0d3dc8712dc2c62617a07e368f90e"
  ],
  "electrify-armor": [
    "LvmYfUGX3uDCpIHY",
    "8761e1b8fb65ddcd9f5a2fadb1809af266c83f3e1f61164eac8c5f068f154786",
    "6194e7b16c36a13f344289d057cd309a0a7719a393033a02b62b4d5f28f34411"
  ],
  "elemental-artillery": [
    "E7j1e8R9FXaFUq0V",
    "651ce6cff7e0bb3de6c11d60eb2fe0170fd5aa25366f63f5ee55eb74576801c3",
    "75bad550abc061760a444f588bf5da9341c9c843d51f461d801c9e218b125b93"
  ],
  "elemental-assault": [
    "OKSsFlHY5UKc4dKu",
    "eca65f8e1129717ffc63803029f0084d287e964b930a53dd32b90c4a68c2486a",
    "3828f427adf2ef8a8d09c73d369097d606c360e34b2a9d84e9c4f6adbc16ace6"
  ],
  "elemental-bulwark": [
    "IUVzB39pRVyBFOEx",
    "f751db85f01c67965f60ef07129d38c404794fa43214fbe4e501a6b2640627ad",
    "5903bd5465bdf5aea37a7c2610ca2903e8fe2e4603e49688ce0eb860a7db5578"
  ],
  "elemental-defense": [
    "JWsX6ro1OTGDz4p3",
    "a74b35f577aa3041ed8f7440c5d69ba98f3aacbcaaf22f47a3dea1624a510ec7",
    "3fb4b667cd06fbf8ebbbc33cfd021e494cbc93a58425e68005ec38b3b4160570"
  ],
  "elemental-explosion": [
    "uHYQ0F7FzeMDNrAD",
    "0e3295d8e475de82b23a108d0f4eb78a6d13cf1a40bbbe17a7ba55f744f9b1c8",
    "f86f369b22816c52a93cb1a33015c0837d5fa7255c721b246f2591aa4b203653"
  ],
  "elemental-revision": [
    "7NQM5dJfOJ7J7pVA",
    "16e2e83bf26779ccfaa2437dc48feb98bab9e589aa19c7a174596d11227d602b",
    "eddf2c61e9d1972eb14e63f9d4557331e6cbbcd7d021305a3f03a54d8c93c449"
  ],
  "elemental-transformation": [
    "KwYtlupIsQyx7n8Z",
    "700b67ba9c379f31c64f9aecf01d8f0dd4d298c13215b965507c5f73a24540ad",
    "5ffa6080ba4df014dbc5bf7673267dbcbf1f8d4dda18c64d8eb19417ce0baf5d"
  ],
  "elf-step": [
    "aIm2qi4JZerthZmF",
    "5abe3fcdf9c3781c7be30ce9274e742db0f38cbcf6f6c6cb56b55520c13bb67d",
    "c987dad282b1ccd5fb26fa81a0a82415c0c2e33f8e99c9dad86f51ce4ab5fb14"
  ],
  "elucidation": [
    "04dRwEQh2ToqEm8u",
    "92e59b89741008892ffb7265aed1dfa1cc786b7825b356b99137f9cb46373c83",
    "bb0b0140fa6a6e0743d52556543d9a36eb78482116aa02ec359ee3f88da23c3a"
  ],
  "elude-trouble": [
    "5qVCl5MwPcx0sS7T",
    "a597e832aba6b816aa146326d683b90a681dc414c84cc0bac6744648a4e1c2f6",
    "4ed2ed68945ff569c2388b1537ed29fb53a4927239d66919270cb57db52daaed"
  ],
  "elven-persistence": [
    "y1Jp8e5zmO1InHMe",
    "1f5f08b6d3e4d805497991ba992d9b2690137209121deeec7e100a8af9f0f650",
    "320b03af9cfa794091f89f85236840c69001645a6bad5b4295c866fe3df63e27"
  ],
  "embrace-the-pain": [
    "j20djiiuVwUf8MqL",
    "6e9498c9e8af325c7fd6f725f73a2da9c3924c12ef026830ed1fe2a460f215fe",
    "800a7f64eb4ffdb64485d66e544d8d62161f3d477c1e0d9f91ea5688bf5e2668"
  ],
  "emergency-medical-assistance": [
    "9AZjpeeS824VsYv8",
    "066ec0f632c397ea42b271b52577e7c234fb62ce6df4a808321d8628da5d3341",
    "c926fb8411f8040eb17d3b56b0af16d28d546ce64395348d36999de649e6088f"
  ],
  "emergency-regeneration": [
    "wlBDcATuqTwjOIY2",
    "fba8602bf43efcf698f31cb488e25f1d7f0fb614849c57d0676c262169aef5c5",
    "869287bc19d508cdbbc410000c64b401c4fc4eed055632d0c5a006e051b2097a"
  ],
  "emergency-targe": [
    "uY03kVQBA81gbTj9",
    "e7c43b3040c2d9275c1314df24665edd44473e25ee29b8ef90a4f1093d96cff0",
    "fa2da5b417530a500ba857834e279c25a5ba371ecac9e0b4cc2f38fb7ab61467"
  ],
  "emissary-of-peace": [
    "SGBLDcT4wI5VUDCZ",
    "b71e1f01bcb169e41112c5d1f38527d06cd8a083dfde8b56aca85d05c733ad82",
    "6994f321bdb6712b7be7880c7cefb1ec7de77dc04cf8811ee7ae3c0cdfea8a46"
  ],
  "emit-defensive-odor": [
    "dpwUwH1xX48ufXVy",
    "7df2c1a32d9f097798b054f478840b487d2ecc835f7247e622c84c0d46e06c34",
    "a4476635e3b68c9d351c728c71cc4579eeebf304467308a513f5657352b6f5f2"
  ],
  "emotional-push": [
    "WLFvgbP8aQRhNHgZ",
    "b9f63bff9cac3f357390286a75f30f98f6ad58cd91df6257ba438ad1648c5283",
    "08ff9fcae37f0ba2d054a839618fd0e98c93ca632e8c63eaf5645601f97ed09f"
  ],
  "emotional-surge": [
    "d8DI7wLxtUy99g9K",
    "6f44167ba5f1c891b610726dace59bd5a29a731239dbdd431e716a8a623f38ec",
    "969683b1b93b3b755ced517a5dda2504751a608c5b425a14ba1daa9db096736e"
  ],
  "empathetic-plea": [
    "MS53Ds75BT379ZFm",
    "8cd62cad6cb9da20d2e5863893fe14a0096eb3484f2c226c3ed95e6b0d136329",
    "b1ef7ec74164bcc89cc1be7263eef3e4ee626da4546187000131d26607109e89"
  ],
  "emphatic-emissary": [
    "BV9k3nmVrWDLv8z6",
    "bc7584a83d702c835edfbbbc47c56519b9556668aec1e76e75753e486283727e",
    "a131a7177d5b6c5b0ec2e66590acfde99f21eeacfe49a757ba8cca7af61027c5"
  ],
  "empowered-onslaught": [
    "4evo0jTAKBhowyDG",
    "e5fc855c704873412084da93ab42fb55ed639729c05f7ddc2f6bf93a5ce1fc8a",
    "0574082318ebc7cec15cc67f0a600c2f35529d53589c17692936c79bba9b7d21"
  ],
  "encouraging-words": [
    "dUnT3HWMFD3d2eBJ",
    "fe2ff1126fd9a135b357d4d61ef1f004c7789b7cc89213716e8f825fc523df03",
    "fb3e2a2b6b21c2206905e8a6f155f3975d24686a06091ae198cabfe6ac219433"
  ],
  "enduring-debilitation": [
    "RzfWrOqHL2GcK0rr",
    "fb9e982c6450146f64442fdb20de7323158389ce8169ef6fd3de36e6496838c1",
    "85e04d4c415fc3288bd60811b42e68248f2b7a2ce244d94c6dd0384801b8ad69"
  ],
  "energetic-resonance": [
    "yUpZcrQHrz4mflKQ",
    "b953a536f7316550a3f8594d1d949d9802a5de983fb3d93e65ce24c20e96468a",
    "cc82329643ddeb64b35a222189114e2231123d4cd979187758769381a467786f"
  ],
  "energize-bite": [
    "3Xc0jsbXBsF4FSui",
    "14d4b6280381e51713ceb033e6b420e06a02eb4e9abea04f23ec1562a825fd25",
    "8b64be8bfd2b6abf0323980aabe34be73f772460e4f1f40bce1119debcc20dc3"
  ],
  "energized-font": [
    "NBDwiz1NDioc2eMP",
    "328ba572ddffcfcc965fc30c52d8e8464a38f8dd8ec10e18ddde3bc394da43e5",
    "accc1963f7f35337a3df98a9613c20f4cb4237f497e1b22acd206cc5ba4e632f"
  ],
  "energy-ablation": [
    "iS4Vc2zv7vgL5mnX",
    "4a351258679663d0119ec550fa9b46f7e8518802fbd6d1c63d2a2b2494355cfa",
    "3547596a95b05776c048a17e13726bd4c4ba6067ed6d5c345e2c0ed0dca90802"
  ],
  "energy-fusion": [
    "MgqRwyL8PWyYvoZs",
    "d92af6e4b4fda524d14828a830a12a61c89f4f97c6feb3780c1741394da0ada6",
    "b54415002453e296d8177b258a09f75dc8a39d09ee6ca21c18ae8851e413a04e"
  ],
  "energy-ward": [
    "lG4dYrnkE42IgnGG",
    "64455461a0d283db420d71f119eb631d443adce19068419d8b9001d7d5fec8c3",
    "0c69ac22fb8608b9c17bb8c1ffacfdc233cd61f69bd9f58529cbff4c2fb60299"
  ],
  "enervating-wail": [
    "VAxtUenSWEBWYBRt",
    "7fb0a86493d4c322d8bb1cbbb6e7ca9866049f14343dabe147b1604cf07d6c50",
    "83dfd34627842e5425029f9401aab0c08dc65fc01789cae557f3fefc0678639c"
  ],
  "enforce-oath": [
    "g0C3tqGjgShoDyif",
    "2c1b6b1c4534352c8135de09d24e7973e6d3cf1fc0c403fc2d8816299b7baebf",
    "3a676b58ab5ba450606061419155f6e346fc9f50bfbae7ed65285fc89e828bf2"
  ],
  "engine-of-destruction": [
    "GLHh9MWlcINLC6Q0",
    "4ba1398e8151ee0fb4424f20475f4d6b9eaebce56080858badd9fe64146a9806",
    "8c32dcdf6d759f711c596e3a1098abc20bc6c6ae2ad72f710f7f6f0505f84715"
  ],
  "enhance-spell": [
    "XbJyPlNflVVKGPa1",
    "c635a1f646559b6760391e3ee778fc613f26d02164ddab0b04ff75ee049b1fbd",
    "134a601c2862d7c4e62d4cb507cdbdaed92115bd4b1d70df88f6750ff8b541f0"
  ],
  "ensnaring-disarm": [
    "c3PN2NvV4ailHRKm",
    "5fb64ac7c5df1b7849f12d6d9523b4b93df9012b71d0eaaa09c1dd0a438d0df7",
    "2bba2cf29fb5f6b49322cd6a3c11ce6873510e58d2f2af009a9b176fdd000097"
  ],
  "ensnaring-wrappings": [
    "muyEI60L0FmCHuWb",
    "5a35bd0b81a67418092e81b72cf832c830d007d93a6e5fbf070dfe3f6eb99bc6",
    "ae25f3889967ce83e9cf2754d32fe8bca02f6ea26b019b062c5dce369f7cd9a7"
  ],
  "envenom-fangs": [
    "IY86Kvopp4ACuQsw",
    "3f9f2d5d72d6c309f1e5ac94766e195958469aece84b9691ea83df8c1741a756",
    "538b98be01951cb1a72b5a834d6131e5760d7768606f39ffeca83a6f1e62139f"
  ],
  "epiphany-at-the-crossroads": [
    "Fzb20MxhHMmKHVtn",
    "b38346be1e1408b4e660b4b49dc80dfc67fb661f3c1b7891d070958e76b2111b",
    "a528575f2b36585432bab4b26dd7f6a0a4abec724ea769ffd641a787abf235d3"
  ],
  "escape-timeline": [
    "INqBWbbDHF4DIg8i",
    "43dc83c8222f9fe54d502495137e667b71e9c7981837f068d38f1b381f13f9ec",
    "664032ff986cd604029598a2cd3a04c4b039bab767cdd4822027cee4dc1403f4"
  ],
  "essence-overflow": [
    "J7b0h6t09kS5e0R4",
    "41cad4e7679375fc62533266c3ccefce6402e7e55b179222b902b53a780a231c",
    "7a3958a5bcd2980af5b13599372d6f97057e6c365b7c347208569733a16d8102"
  ],
  "eternal-memories": [
    "14dFcInubWcPnFzR",
    "404b5fa7bee8ecd6fd4c0ea0730a01394b8d2a7bcfe67c9d1b9fce42134ac8ba",
    "b1540ee4dc303a936732f5b5f346a89c55813c541b96cbc09486dd91a3ba054b"
  ],
  "eternal-torch": [
    "MRT8BGiIiVYfVcXh",
    "4e30a094a94829589be5622f6f4f75b4994fa7e0bd82a7bb0d1d9c642201a29b",
    "cb77f648d865f47fd91f352312d1f8b8e000e6f712857af506719b1ae337f5a8"
  ],
  "evanescent-wings": [
    "ryRpqixE7cN8svwB",
    "03e289f1641a617a389b02129e6bebd869fade73327aeb75a32ddff75a2d358f",
    "de0073a22f2c7bbfa79e8498fa085d1c05472dbec7792a4e8e0e790695f09007"
  ],
  "evangelize": [
    "YgbcLfAEdi4xxvX5",
    "9457be8abad50d25e49906b7b23fe90006f63a0560153ea75543f29096469089",
    "3e45ef6bf7533b56ffd4d15a0103e107c965939e092128330491fa49b11230f9"
  ],
  "even-the-odds": [
    "5HDBvVbfoaXljbch",
    "613cf02bbd25c435bcd131c8739ad087db9c354bd9c100c1ca01ccab358f1271",
    "fa5dbabd0a13baad9b51a480bb4cb113ec7fd064aab1f1554d6218977863770a"
  ],
  "even-the-odds-eagle-knight": [
    "ccLpjnWjl62Ehegc",
    "24abc0389de254919baace4b31ec5e5afee98f1214c0554aa6140d324ae5f74f",
    "04cb9683fc4cac06a0aec5edaac364bd262eb5d8b83ab3cf51954f15a0e1fb0d"
  ],
  "everdistant-defense": [
    "EP8kaXNmrMfxOFAf",
    "5e83809937a6be335c72a6a0bb341a0d185e15122602c12c8a5eeabb9afc0200",
    "a7dcdfb074120a537a426b996e7eb28c6e67ef72adaf25a4fde9bec4b5de34b7"
  ],
  "everstand-stance": [
    "6GN1zh3RcnZhrzxP",
    "c4bbdf75c82f5b3ff082df58940da320562475208e416e421338a27868baf63a",
    "6187cc931aea92e3d81f90cc315894199f72a31da49b4c9e1967cca48b10092b"
  ],
  "everyone-duck": [
    "amf2zZuW299eiHAZ",
    "0de20aa0c244692bc6e0b004e158fbd5f84bfa152813fc627aac67080dd5697f",
    "4926ec3f706a07fea8731454fe2424e343c3408d84584c358c1740b125ae2c69"
  ],
  "expand-aura": [
    "H7Ocx80td7Sx7Cqn",
    "2eb626088621180084bcb307e01923611f07cc80dd121553eb71921a1ab3af2e",
    "ec0cffea31f27c542a71122f3f4230a24dce3b960169f679b28a2c76fa048dd6"
  ],
  "exploding-bullet": [
    "REkmAk9D1JREM6nj",
    "38957ce93e04ce4ca0f728f69f38f4dd0e86ce8607ed25f1af564d91442b927b",
    "a15e7dd7f8de7fb8d52f3609fbf2009fce7db705b50f98c61356e7efd67d6483"
  ],
  "exploit-blunder": [
    "tFrGaa0qI2JvnHsD",
    "a28cb31d8c72aea828d47cc876d32280ef0ace31cde2e6cfc72c7c2aa5dc4d6c",
    "0b91c593355a391e76f9e02fdd7db98d8fcbabb8135efd448f8b2e0d034f0543"
  ],
  "explosive-arrival": [
    "y9lH4EqTGTHvqbNr",
    "5256ebd87b0be822d29d455da1c6d5c86ccf166a550f79c522f1313cdb1cadbe",
    "52d76005b67943b54411cc18114b42906b79c2084c153e1a2ccd0f14cc45369a"
  ],
  "explosive-death-drop": [
    "OEwNLolzBarx8icm",
    "9be4191e466e5ea3d499890dfd0f2871d6cd89a74026728d0c68724de87c303d",
    "addca1c10feb70ab1fa91515213d378a770400b2b0cf4a2ba6ed7bd03a0ed7fd"
  ],
  "explosive-leap": [
    "UVsMJwHpQHjVZLTK",
    "dbcadc696e05f3d724af86b37ffcc973a0dd17d086a7775b461695310be60764",
    "64a0f848e76ad93fb86cd5d422c914be599399c79b06345e5f8cb83e940f9478"
  ],
  "explosive-maneuver": [
    "NDbNNMouxnnwBqwm",
    "20e3edc5a80ca8f8d39d1ac47259ca13e4ceecadfe21d66e09e847647f3d4dbe",
    "7f9a5e4d3f393144de5c8d9030960b9594b2a9e98cbc9a950109017133ec9f60"
  ],
  "explosive-metamorphosis": [
    "IK6xmiKfmotl8Hm9",
    "ad2a11f1d06e5319495ebdce83dd5a9608f79d4b0c133dadb3637ff974f07c4f",
    "328e296e080b3e717ae749b00cf0c8f803c46f04f2d084ac99f092aef0280092"
  ],
  "exsanguinate": [
    "d7qKSoYixczsD5nL",
    "e62eeb7b464ee06fcebb0caaa2f74144c1371e2e66f5509867c78883c8f5c6e2",
    "a971a811e1467ff691d281df936b22387de2e0b462870962d8b070d33f4cd665"
  ],
  "extend-surge": [
    "nksxAtBmwDUmrTcS",
    "e3812e584cc272eb088c03a289542a7b6d3383e28b412209c23c5dc7d10919cf",
    "a6a934082a5a2f58ca9166611fc9405e31702ebb7e9fbd7ca09e2c7d1dc99853"
  ],
  "extinguish-light": [
    "SBhzem6n3buoxlG5",
    "e316acfa3e3c22e40c730704b2a8aff02aa5dfdd6509cdb50a396c4414063a07",
    "01e40c1f41a855caf5ce08cc46feb5256e11a88bc51e5e1ee7b41f315f7ef818"
  ],
  "extraplanar-haze": [
    "Ewk7h9aQpKvy1RJo",
    "30e09eb5e2c22715ad37b76db6f46eb0210ee9d613ac777055fa525895071d57",
    "1682b9516cb5b48e0deacb356c146bd40f36638299208d2096e1f68e117684c8"
  ],
  "extravagant-parry": [
    "WcY7H7mRiK2VDquV",
    "5b58c6f020a2116b2d0e4e61e9a24d4272a3ff2dfa982d0d0af7a0e37ee02067",
    "709781a32c207c62d3cb41401cf6394c9fcece0707e0a0df6e6ea8a19a65dded"
  ],
  "exude-demonic-corruption": [
    "9LvJo3K2AjKcVvTc",
    "1b9109e5bcb2c64e9590be61e94aa311bb926ad6d453a98c40f59301309ff566",
    "62e6715fc849fafb0b46e6cf8b00ecf25bffd6f06355ba22df846380d8d5dd7a"
  ],
  "exult-in-violence": [
    "7k8ZR72NzcTdpmz6",
    "3b5ea623f233501168856b478c8dc29c4e97f87dff5d36b0bc79d32026d447fc",
    "154d019f45a9de02bec0fe63dd01f43b02f6a0a7a00527a46116318efb102c8a"
  ],
  "eye-for-numbers": [
    "0N8TtGSk5enoLBZ8",
    "6ed6cf30a019e2fd7fded3865d6095c783acdcce6b45a1ea4111ae57055bb4ce",
    "8150217d9b1fdf122911c9856fab2daaa2ef306ea76adce2f25dd590db799612"
  ],
  "eye-of-the-arclords": [
    "OtV7esAwza1U6Kwr",
    "0ca6b3eccd1ed6f477897c91e9870c677f77768b884fca0b17b799003be56f04",
    "0a61ed1975a6f94a4daa037b4da8530ebcbf18cc6508a7e5cbab25266960849e"
  ],
  "eyes-that-see-eternity": [
    "vJupczSgvEfQKA2L",
    "d54feb4e260fcb9de79e56ccf8216a6b9f31aa237fb4ebfbd99d1473d4fafa5f",
    "dd7af29920050f255137714fe0653255c4321d6fd21ad69e81c068c6c7d33dfe"
  ],
  "fabricate-truth": [
    "p2McwseYbPZrL5G3",
    "c28691598dd94dd30c33280945be379e9491e5d1b2845621c83ad7fc3c9e03d9",
    "2e1a03ad5bfd0f6c330b4a215c2061bea607a00b50705bf6bbf8e1b552ae0770"
  ],
  "fading": [
    "orTWiRwIQEc9FGJQ",
    "452c4946097d334d27bbcf4c2f4899f4272fa37ba86c8b4c17616ae864c9361c",
    "634eb3e1eb844abd4c6f5233c9be56854f794c370d94df5fdec331c8a37504d3"
  ],
  "faithful-stride": [
    "45L17b1vwUuE8mMc",
    "755500a902975a30e5ada6fe302403cb3aac4b9f9a5a89d11f9455318d4fad87",
    "2912a32c3898c3d0e2f954ab71ed131466876164da2e8d38dfff99c8e481dd52"
  ],
  "fake-out": [
    "Stydu9VtrhQZFZxt",
    "5420dbff566a197a907086abdb952362c84fce63a77120fa4e9bab483f754fca",
    "c7a1e165c772b6f3a9955a47475c5add87bd5326ccff0f04b984e02a0389cc69"
  ],
  "familiar-conduit": [
    "IYt6pMqiTocTrixA",
    "680f708ca94f13590067bbe57d98380ad9cb1ccbb603482781fd45990d05c85f",
    "70d109583cb8ff519d93924a80b13366d2b6dab211c16f48e66bf341fb2ebb6b"
  ],
  "familiars-eyes": [
    "Q4puGx4kBMXy45fa",
    "399ba57e662065920a785598c310e353057d7c2ffb9a5e5c92d979affb9caa8c",
    "b75431013f4f9ede03c5ada42ac3b14d71b3304e237483a775dc404665abdc88"
  ],
  "familiars-resolve": [
    "BQ50m0Jb9qyoPchi",
    "13d41a2a684687aae9515e3c13fa7d0eecee5c843d8d795631db1037b26b2bb6",
    "4f5319d5c2eec567d34d476d2b96bb77e31ff942c9deb653c996b9a6b1018781"
  ],
  "fanes-escape": [
    "9SdFlVQW4vM8ggh8",
    "997d75305d1471a3d4e52a3737404c537ab4925369555d6a21c42d7b7a230544",
    "98edc9e1df6ba1d4ce94e38e1e0e9d21cef83b11f37d16ee643c31ab81eca8e8"
  ],
  "fanes-fourberie": [
    "80CEAB05TP5ki9iW",
    "33ca75607e17c9fd356f5b0245cb26b63c1815d30216911b9acb3cff1766b3fe",
    "dba18cec17f5645d325f1d3a0fbc4c84cc00abaab2f0fa1de61187833d5f1319"
  ],
  "farabellus-flip": [
    "PH5b61x3iJSKP3Xi",
    "fe1aecfa0c040fc2ca962b07f4624efd2b6d704731d08c982753847d1fbb3ec1",
    "1a44a2699b623c13b505f928da1b7eec6fefe789d9fa730ffb901ce0ce85b670"
  ],
  "fearsome-familiar": [
    "PkQo8tb0Yby1pFU0",
    "e4961b87c7ebdc07b543e59ce7f2162c89f53b39cccca5ea6cf142246a20c4e9",
    "78b65951e04544c8392fdd0c8a4ef66a7c15744cf8ae561ae942f4af35a984b2"
  ],
  "feast": [
    "Tln47zk8F8nswrEI",
    "9abd2e8c2d7869c3364624e3cac9789d5a7252b22c66c69f556e36950e5cc0e9",
    "2ac8653be69079d6e1e3bd09274b076f2034e1339fb24cb48c138ad88f59ac76"
  ],
  "feathered-flechettes": [
    "fxkByzNBsYOcyYp8",
    "748ddb110dc90d911e6ae8454649905a27912dfaf5cd9495b5540e9919647f7e",
    "c8b592f2f9c89b12acb6696eb09732765312da8d931aa63d12255fa4e4c2cce8"
  ],
  "feed-on-pain": [
    "48crF8lpg78fRdhJ",
    "e695f824a9e553d08867cf2c3068c47bf45ff829c344340e4801d37034d41122",
    "35250a88564a69832fbd863f37da6b4b15949451d5a0849b33cf8e19e80492ce"
  ],
  "feed-the-void": [
    "F8rtjsojGLaRuU5l",
    "ebb41a9dddc6e142dec1804d60fd154d454de1f5d48d953bdfa66cfe13181665",
    "3dc21be5c15e1cff62488d2d044b686caa9a7cc8a26f95637a31397732280642"
  ],
  "feeling-your-oats": [
    "7SwpVfxSkPMPMazJ",
    "d4842df85f934689e06b283cc0ade08d0ff4693c78379fae975659dc2ec88a75",
    "a3b0f8bf2d606c18531047d6af40ecd12466e42bed63763b203226f6fb20acb0"
  ],
  "feign-innocence": [
    "UhyoBNQbGP6lKjwE",
    "2f1dfac88cf5088f5315290a542b3be3a4fd1df789e4fb2cc366d02246e809a8",
    "782253447850e5a499d3331a13a052fed069e334df7d798a78b49ea4e829f013"
  ],
  "feline-dance": [
    "7gYTO86pkFmm6zBn",
    "b55950119b73457a66c6b040b579749d008bfad45380c80fd3a342d9e6d876c8",
    "50a9f65bf268c01a59b80f299fdaa6cc03907e614708cbcdfa5d584f50f51bb8"
  ],
  "feral-mending": [
    "oHRCNciSjIBz4xqe",
    "f4d0645170685bc3d2e2ae8bd47d39308864bdfeed130a8ac33e19109535a627",
    "7ebd87dc60625dbde4d956a46efe6b858d3ab68e096752f4fb61dbc65d05db0a"
  ],
  "fermenting-liquors": [
    "vEpM7qYZmBiwBiNT",
    "21533bca3063e318a97b9a05caf2780d9795482244f95adb5f339473396336f6",
    "a368d678a43d7d1b6c5bafe74d56106b6c3c8d6804c92ad6c26564b49159eb24"
  ],
  "ferocious-gust": [
    "Sav50NxWdLnbaDWQ",
    "c5763aa69919292d3a1155d006af0754a0bc96b4852a67ae4e234eefe5b59841",
    "c98447f890f5c04a9f26c9dd2f4e589f96c956d36e0a0f3320faa3569110dc76"
  ],
  "ferocious-will": [
    "rdvwYaVN1Cnlm52A",
    "606106224f9568f598ad162aa2708bf0affc96e2c1a320197178a1f29a95158c",
    "dd353912706190ec087b5b54362713d9b97c62e208d1b9bfe1fd3c57593ea9ac"
  ],
  "ferocity-mimicry": [
    "P10KdjTbRcgXG0JM",
    "792e2516f88ccc640283f278f1f2a1bffbfc96dbe86b32bb87293caf2d2be41c",
    "f87af94e5da2311680c19517e43d76f3802ef053dbeaf97ec52dc86848cb99d3"
  ],
  "ferry-through-waves": [
    "b4YmWetKmNww6r9j",
    "2701f18cc0731b04fa9d3c139e665ea804fd0c80cd860b063a217ab33e3edc3e",
    "894abd3f5e465e04e3747a907a0252c429518e815e59d84a887027c5c9047009"
  ],
  "feys-trickery": [
    "XY2uS7pMKRLVNQKG",
    "bb9eff6f1423d74e8f76a6e9305ab3bdf7bd1c07ceeb9e939535073e9e7dcf12",
    "82f860a9ce29d36c2c11807e924368e12db1b76c1058f32dc61968ebc8743408"
  ],
  "fiend-slayer": [
    "DoaqSxIFx5CSgBBE",
    "6255215b11fcb86d3af40f86bbc3367448d8ea6b7452797650c8932d12dabd74",
    "102a088f1edf8718cb1ff1c3b6db68382a6dd40bae48fa829cc9652be28a4e67"
  ],
  "fierce-competitor": [
    "SEtFRKVV9bt4MJEn",
    "ed1f12320fe952b1c51a2a6ef41ba4270882f830b9cd9f0813700d43ed399205",
    "bb53ccde3b3d9a8e89481143b7c502edd0aed790cef11077a6982161760a38b9"
  ],
  "fierce-grasp": [
    "2phzdvmFJaUUGDmY",
    "3d7ab807c308aabb3c2094fd059399ac1098c4e3054c1c1b609e733350e22c29",
    "03872010523bcc6564181f1146f6d002227919a7cf524bdaa373ac032e1a8c72"
  ],
  "fiery-rebirth": [
    "lNIHXCQ0Zc2gY5OH",
    "9df38f0b6083267826260b3192f13276e2cec3d703e5b8f2d015655ab94ba970",
    "1b8029bb7110a4ad597c1acb567b2024aef16c8fcd7a27c0e4fd53cf64fbda85"
  ],
  "fiery-retort": [
    "6biVVoaqqUdQmQ37",
    "60e9df19337ff39e9e56e61d0b03f1ed3a45f3355a233842588f887dc5fb15f5",
    "b86541ac2ba4db21695ff717fd4fa592c855c143bfece8e8c50a1a1b52188c93"
  ],
  "final-spite": [
    "DlzqFgcu2APSli5K",
    "f8894e26328b58ca42f9b4c2e937df337f03a07d82cb8eaf12475374932106ad",
    "376396b00eb64590f6c0091e19bda5a521e96aa9b8df5546105af15ac0f54282"
  ],
  "fish-from-the-falls-edge": [
    "tv0TX0DiDg2lDMOl",
    "1933424c5a9710e88b839662c381cf7d0c6feed08fbbdf62d319327214f6a5d1",
    "a922bddede4fd2a8869d641e62845587502594ef406623ac675de53544cc30a5"
  ],
  "flair-rider-stance": [
    "dyjYNaE6Nc6zpsUM",
    "32ff4a840fd4679783f25068a3f07d449e94f5f40d52cccc88636824ccadbc40",
    "c4787f1c719b8770a6760415227f568d156c54dba93ec99709ffd83738763a82"
  ],
  "flamboyant-leap": [
    "TdwC9rTGgtF4CQ25",
    "308dea0b0fa75ace2fd67b06501493d4f722095b731c80cbab49dd588e6090d2",
    "6dde7b914912e2cc169064ede887dd2219f8f39651b15e51d724b34b1dcd1728"
  ],
  "flash-of-omnipotence": [
    "v6d1N3yygUccisQL",
    "f838920f3e9161acdb649577735077bc33a0204ec26f8bfd554f48ee29a6a0fa",
    "6461c7849406cfc5135e441b351e72b7b72694abca199bd5d886d302dab4d567"
  ],
  "flash-of-omnipresence": [
    "N9kJPSRz1Ax9eFdD",
    "aaeda0e859bc17e5aedab6169e4c44d94d2865a6c0c6a11623a3a0bf18abb5f6",
    "c5b09d0a1bafa3481cd81815ebb541fa9d7a12038b31c51d0d2ef57b3fe6b18c"
  ],
  "flash-of-omniscience": [
    "VnpI3sPgwLlcCJy3",
    "4066cc255774372c17adbeb68c9a8d53b94f87c67be1f367191ca7d3c9cb00d9",
    "7458647da5dfdf4e1543a3589065770520d0c58ccf7b55b047b6828fd9f776c4"
  ],
  "flashforge": [
    "S3NFO9meH9b08oiN",
    "feebab58a377375eb980d120b68c7de8cae53053f301c4e4d2f167163f98fd06",
    "d927fdd9e005408c29432caba138c332fdb16673576011a721a16213fa90215c"
  ],
  "flashing-shield": [
    "1NS6AM2oVNKb4LhX",
    "4857fa1f2c162855b03536b930fd57b10e265e3633ded9503c7f1eda43a002d7",
    "f45b0e8a22fb212d4e7ae8aa3463cb969e2062bbb7cd373a80674f2dfedb62c9"
  ],
  "flashy-dodge": [
    "TnYHtN9gQASqOnii",
    "8830b2be66c7b3d101f76d6413e6171d005657489764e8bad701bcb18c104518",
    "2c98fd9db27085b249f45492f5207c7a1794faa563129dda354f54d494842427"
  ],
  "fledgling-flight": [
    "UuVz1QY7QXD5cnLu",
    "a41015bedca3d792295d8c38a883b9a2c9e06317db05fa171df46c6b78f558a1",
    "485485b1b89b184bbd6e4bccf5a158ee881e4f12bd6c588bf79c2704e51bd22f"
  ],
  "fleeing-shriek": [
    "oOicdaf3WvT1i5ft",
    "c9c3357d68a25c6e05b2ec5a680971878514ea6ec80c7f6888bf20d5c10d4e97",
    "607eac79eab4aad648807c6dba43932f8b33ebd1a78aba24184ae0ba988964da"
  ],
  "fleet-tempo": [
    "SVdYJW5JsOMhAYd0",
    "8100e0980583ef11a57d7639ccac60538b89f515b9a371eb07a6d43cd911f1b4",
    "67380cfc066b480f86ec3e84b3328d1710ad6ac87fcbb9a750d631241e9d7e0c"
  ],
  "fleeting-shadow": [
    "hE6fchGuHuPIeKlO",
    "e3cb3c93a276245ac270592116a018d0774f527782a84cc72f3ab4072d4bf23e",
    "82426ebe8b10001e24a8a29449dff885a2ca00e1765c9dc78254f83737e6a964"
  ],
  "flensing-slice": [
    "F6VlPyZZpqV6d2CS",
    "0c84c85b9a6b180ecc60bfba652aef4c6fd937561782bd7f99ecec868e8b8836",
    "a60d0191acb339b04b7e830dc5747e92a27dd2fb04222553854b8d9a686069bb"
  ],
  "flickering-twirl": [
    "SyxXnSk2R0AM9HSn",
    "cf3ffecc2f70bb2adf81c64ba24a72d4fd309a42ca0c1e8b895133f590a8d330",
    "d43e630f8a3c6822f5d394793765cfc2b6c7d7149b0e8009eb6f70704abf776e"
  ],
  "flinging-updraft": [
    "RKh9lvo0PdE2Yto4",
    "e55a2f83743be45a1c240696caf92d9478e9d66db29a8c995545a38360174363",
    "aefe6aa09d68a47d8de3e9473507c316f808dfcbeeafd847390fd738c835c666"
  ],
  "float-free": [
    "zfNLF9S8drNKkljN",
    "5c040d377c274dd47e898bb0fe704fca5f18cfaab5c8e01512bb55f59be7629c",
    "1edeac4d1b291ff01698dcdcfc8c27c197d06c5b0d6e846e2f51fb9171dd8673"
  ],
  "flood-stance": [
    "lqStZou2d2WMLJxz",
    "991a6e0b2701b97e7fb7ec6a01b59e0ce7939d697a2467cd0e6a89bfdc45daa6",
    "00413565f86bdb03d8964ff8413d55aaeff2083fd6f877e6264deb06649d6ce7"
  ],
  "floral-restoration": [
    "ffLzfZIq7LoNXqWO",
    "daadedf865163f4768a1dc28c739b2b740865d82fd036570d73224fbd5e97a0b",
    "8423f256389ead83ec9cab4431461ae3ff629ae9d094246c551ad68734c750da"
  ],
  "flow-of-war": [
    "yqspSW7eEQVvuYrC",
    "03bbe4078fc76d41cf6faa1463195febcdab4383429fe8c722aab62be9ccc6b0",
    "b002bd6ffe19c08f3655442b4ced30258b1fdfa84b897725062a3d0580cd1b52"
  ],
  "flower-street-infamy": [
    "rgmX9TTthBYo508T",
    "a9b0c1131d09a51a43d1b675ad9bbf2574d8904c5386a304af6c39256a00c4a7",
    "83c78dec0873507e09ff0cffd21865ecf39ad811646bf55c80eca5ef5e091bc2"
  ],
  "flowering-path": [
    "V6b42u8dNn7K6FwJ",
    "072ad2f17295ea16b326421970c4eddf44e0812229a0101a67429c56245a02a6",
    "db3e27e7e370abf5baa10bca355c7560ab521fb96ea4b5d707d0717b07e85be3"
  ],
  "fluttering-distraction": [
    "hOImeMiRPIRKPPXY",
    "2d72556ef7031befb7a415e3d94dbe8ae2e27267d41be132071edeb780b0c0f6",
    "473a1c0cd01d669f75b5bdc16d41c41928c4390925ce0533693ac685c2519bbf"
  ],
  "fly-on-shadowed-wings": [
    "ekPCBxVAOugxpvUY",
    "79eb25bbfef9a6d5e4698eb7346e3e48487c969ae8c2ee869ee10398c37265ea",
    "ec6f00f21994a1099956cb124f8859184c6944172626f9ad6f242cd549c4917b"
  ],
  "flying-flame": [
    "1SbwsBbuCkkpgeYN",
    "1dc0a3f9838a0a22bdbfbd462f1c5d98b3f1cc197aa6f482d8401fe0647368c5",
    "f3caaca0b1e38eeb7e95f8b6b361ce9e9ade03c6f605482f538aa359481c9c48"
  ],
  "focus-ally": [
    "zodscjgydZRUSOLO",
    "c2cf17eeb4df6d6b3aaf95386dfd047a2076caeb08a1eada499ff073d579ea47",
    "db2844d816efb1247f6ebeb1f9065fcd8304e0eecefd8341358d5e6def61f27b"
  ],
  "focused-fire": [
    "t4022d8ndt8YJPSe",
    "435b3e8da21efdde0803e9ed6c4292f218b02ea4c6dc18419405225db365e020",
    "51d6b95fc00a0335b79fa8f7ce8d501b4dbab3d54b79823e4897da59c3f0a7ea"
  ],
  "focused-juggler": [
    "lYVAGuHU47Ixyuxy",
    "871673da8c292c2f4dda1b8abfebc7c2ae8ea4e4a11659037cbdc6ce8e88fedd",
    "aac5354d5bf9e4dc70eb76e48781bb4f044a768d012fee51e5f2288fc9aa1544"
  ],
  "forcible-energy": [
    "UJafwv306v75Syy7",
    "1d0b29b3b1595b2fb96396a8969546d3fae5ad650739af0e2cd52685df3d887f",
    "c2e2b5b5fcb81318c640c1952eb787ce7b3be8b343d7e39fbd50663784b8f4a2"
  ],
  "foresee-danger": [
    "pVDgiaqu1RbCOhuv",
    "40c41048c9418a0af443423a23b9b84c4058adcf5b1d5524ba55dfdc944ae324",
    "2aea3be5bff74b2080f3f1f5ddee2ef28f02a511aa3758df97e7649b5aea1d78"
  ],
  "foreseen-failure": [
    "PmhprI0vr3zTOkok",
    "897b3e43ee3934b5076eef2c7fbcc39b27b3566d9b4d00b4f9aed081112df1e5",
    "194f4b2100b6e4e7d51ab17f054d75aa33f1756aaf6c4e299cc7b44cf9b805ab"
  ],
  "forest-stealth": [
    "zgriBCYR4TmBoDqO",
    "c093d6a906c5f31b4a5d3be335cf374ce7b25f183f9726c7da337af55c0f7ef9",
    "db53e5eba12bd15bf39d6afa9b99753e16ed033bb76de007f8a2cc17e7fd4d2e"
  ],
  "forests-heart": [
    "2LjTxYTlRL7RwhOS",
    "6e37cadaec1bdd39b67a444412a698ae84d1db155f294032bafc6ffe792b2d62",
    "794f28600f6cdc7eaf1fb3778d0faf7c60c28b010757b62c0699776728bcddd4"
  ],
  "forestall-curse": [
    "NNeRv9Gcua1kMp4s",
    "00674ad20b92c050a5fbd4d5b6a110d1d7bdbc86fb4b80bc0e139335fe3aa275",
    "809a0119f46fa183f2098f5976802c719811ccd632bfee975f4628b218f574f9"
  ],
  "foretell-harm": [
    "CuVvDrBaVP9nYJlt",
    "681dac43ef7b816c494a96cfc395d24b6f4a3114b351b4b57fb0ab996f7b7d11",
    "f99f0ec836c70c145765ab23c6d44575ab66a198cadd4e645265c734c62b9ecb"
  ],
  "forewarn": [
    "vPA0EGXBaNzGxlxM",
    "69c75586ea0e103b13cad55f308d358b8be66cc30384067f18cd043980560674",
    "1e0d74a9fb0fc8e1724aed135cbb721f152371c074ec25afaba352dcccf7803e"
  ],
  "form-a-flock": [
    "VaxsPPPsgXzNxQVI",
    "cbbb7065fca750a417537c773baa1553453b13e54078c2dc23012cb9aeed8604",
    "9c550d05d6900d74e8da69f57f2c36f57bc24b32c3d54a38e46372f4a377c025"
  ],
  "form-control": [
    "RsluSLtSWq1vN8Hc",
    "636648736edfa8528fb60d3a4118526410ae6b404dc16e1da11f37a3f4128e22",
    "0e7d7d7e718a75bd48864a8323fa47aaaf2c7a4edae5c31803e0fa00f8433f60"
  ],
  "form-lock": [
    "0EY2WQC3Hb6Mitgz",
    "c130d0f6f222c23dc68f6b76f45fbdab1c81a6311c3e31fb06375d881ea4386e",
    "0f25a94ed4d216c56d6f791eac00129c28e7656625d5c0ae7131b174328e47e9"
  ],
  "form-of-the-bat": [
    "H965m1koFvY4FQkF",
    "ee5d8c0a7d90e00741b501aa5010794962273df175c6311775714cf184e2b18f",
    "1c0f45dd17aadd77a97f9affdf8fb02ff321e278be77b058cc1f84ee24675afd"
  ],
  "form-up": [
    "UpnXrLhJZ06HTaJh",
    "df090add74d37dc4ac5e1ee1e0a15508413974cabcef86e68e1cd9258144c71c",
    "95d4de561314c19fc1b79a35f954b5412d11850c31141187c71d09e32b3d96a6"
  ],
  "fortify-shield": [
    "DidzozerKLZ2UYLx",
    "41152342a040bdb720d108cb7454f5ecf785cd500affc2e3922070fc0cac48aa",
    "ad5f86d156eb9b6fe3445d6c1e81688e2a94139abdcd2ff845d5fe9f682226bb"
  ],
  "fortifying-knock": [
    "ybMeVTC8TG3rcgoU",
    "9f7a3f52c28d1a0b1d866d86640efd01bd1328909ffeb4d2e4eb86effd4537a6",
    "9589bc64b7ee9bc44e1c99ed74865250cc81ad331bbcc4824eac2bfe74782ff4"
  ],
  "fortunes-favor": [
    "HNeKm6BCu795585p",
    "40ca51edbfbe3c4ab5416474dbb7f037a667fac50700a174d99757d9bced6c8f",
    "546076c76af99b40e9a8e8b19c92b877e172c7d5b8ae93d2dace883ff1ad055a"
  ],
  "forward-gaze-into-life": [
    "ix1fhe9ttnvFLgmi",
    "b970af4fd5e156b38a0d4fc70f3b1379fed0ef81364db5d3b9208adcbf5b2c41",
    "f03b938b0fdfeade8589cba1cc7f634f48321fca2c6e607ef6d3962d1163d178"
  ],
  "fountain-of-secrets": [
    "MzdoJWpqyMmMDI1F",
    "f8a35c79ab006945c7a8e48d9bb81c1e4147034d248064f9504acb4bdcb31f7c",
    "b75d09c7ab2cfc35c0f52fb4520e3dbb1db0ed3c3edd8ff3acb914e9adecba8e"
  ],
  "four-winds": [
    "iySa8O4NaTdLPKQl",
    "9e623b62dde7bcb86fe08cf2fc25cc5fea8d40b7b02710bb4794afe48e365f7c",
    "1a33df10e6351930fe8f1c18f1112f15768dd71e0b188b6fc9cb4361354a7655"
  ],
  "four-armed-aspect": [
    "10bkE3TZsr7kvdn4",
    "03e46de9b5098884aa590fe18c8fc59133133297109081931b1465dafc5d3809",
    "d0b30924833285412ebc655d3662a0df9107dc7cb12d2c7c83f4dc9b52919c8f"
  ],
  "fox-trick": [
    "g9AOSz4QDAlUee9M",
    "a2e65d96e7f8f929b641999294443c0b0359cde8b5fa709c79442f59190ed143",
    "7d7e8f092e97ee3b5c4b238fb8ba83f434a21ff35e898c45fa0d6d846dae913f"
  ],
  "freeze-it": [
    "LhpE0NsfNwYP6MOz",
    "d831f24ca25207b26dab8e229ba47d396ef2c3aa21031cd0dc7ab354a01b03f9",
    "7cfd5c4e08aa7fc12871780c1a488ada4eeb6503c2aefd1d14ab5014bf272c6f"
  ],
  "fresh-produce": [
    "IcAEMf94XoTvtzAO",
    "18ee811e048e77d45c4f525fa6e2e98daf613400df253d5007aca8204b190706",
    "911cf69d42acb6e1525138bae80c61c283447b864f91f9af756a8ac7852a99d1"
  ],
  "frog-geyser": [
    "efx6ZCDilI1ixyAM",
    "e5dae467740f4ab32659ebbda14313fdd4c850532dc686f46648c5648fc52afa",
    "615dcd6b59b9928e716d3dc3369b5c8a16d43e2852b0a9711d31523aaac36fea"
  ],
  "fulminating-shot": [
    "o3J79hnr00ztcwtT",
    "15363c0269b7a3f699771c1f533a5dc878c81dd9b854f4c563f198d5e3debd1d",
    "51735f35570785c8eab0ada05fde249d0e01278cc2c6a8ea22f7b904634e2582"
  ],
  "furious-grab": [
    "7HPXQvPH3ovwtVae",
    "ebbb40a5e35de13681e95efc4b8997589284826f76b033dd265150ee06cb3ba1",
    "cb4890051cf96c8130ae19a36ff2ddceddb4c85950997e35e5256676a7b83511"
  ],
  "furious-sprint": [
    "p2I4o9Cc6UrXvjhO",
    "936d21590fee7bd469d7c41de69bdd580cff405fa9c50d28635cbce820a13333",
    "9de1287b63eb326c2901f384e08cd22e82470b52e73ed6a4ca6efdf89e246330"
  ],
  "furnace-form": [
    "6vHkvQv0j56nZuR3",
    "a49b48909e0613e59b283f5017a4422273a215bf29309cb9077ec14bdf10a72b",
    "ad05160402960dfa61e8d855c2f602fd29fc2c458dc4874b5e1a6f3ce642acfe"
  ],
  "galvanize-spell": [
    "AP3k96JtJHsDk0G4",
    "c27b1d64f96406d94ae95abc24d48d6beb9547dc6be82658dec7bdb468c91b66",
    "8b861f823ef4715c69eeeb438b6adfd89e3a20a77291dceee851b718fd2c90be"
  ],
  "gaping-flesh": [
    "GZrvQo5FcoP5qocX",
    "db42e8eb2d927790476af88f127280d5844b49277e83ca97fcb0b8a94dda895e",
    "0140ed230a4980fb7a2c581ef560f7f2d8cb5766f232f3789371359f7bd6ec13"
  ],
  "gardeners-resolve": [
    "gTg3D9Dv9L4NEVhV",
    "99711a08a77621e3e6db1c955605f6e28d23b57818d1913c1bbdcbce7bba3076",
    "8f7294ccd6ecb87b99e9cec1da70e57abedc9ce8aa1dec19f07c891de930ed48"
  ],
  "garland-spell": [
    "qUoAthRX9cNVHT9s",
    "b6c7efd2ca44e53da2f3949fe90c058b34d80af8d06a4b6ce18c28ed2c87e4eb",
    "ca2c0788fd9e50be65e5c7052750bf5a13a4cff65b116d820b5cb877bf3d7fd8"
  ],
  "gathering-moss": [
    "yg02rHaDPpGSgkrk",
    "5fe016a6b520d758c619388fc5eb76ed73784d3213a3d7dd03d995f78a07f530",
    "a5cb7f712e1dac0c9f6d8222ecb2f923614ad4da9544140bb21ed509d28dfecc"
  ],
  "generals-gambit": [
    "HX67CcR59JO2RJXI",
    "b339d584dcab86ba0635841302bac7afceeff3c6d39bc75acab8966f98c9f647",
    "8015be305c996cd7eb700dff344d9ad2301ad9434e633e75c049b992c03cf2f9"
  ],
  "geobukseon-retaliation": [
    "WcvscJpQhbTiefwn",
    "839f72b932549f81c9d266dc7616bcb7f2e9b59d07855f1807f3828b0aac2501",
    "33b09a0f25b624c2206ae6e76cb2f4a8189ec20fefa77cf84eb1833d108a136f"
  ],
  "geologic-attunement": [
    "YRanyv890fLiyaOY",
    "1447265b2f60839cb0d7c9c52da5d73db821242435f53110376ab1a47bc46b2a",
    "806bcb470825245d6d7f657dde33ed707cf5db0bd75470451f5ca056ee220530"
  ],
  "germination-of-resolve": [
    "PFKUr11TUN5NfOYF",
    "f99c8d7d78d85886967a4d6ec4218a5ec380567d2899de532a54334cc3384bec",
    "1a259bb5513a8138734c420416a7de9bf6f640dd64760a4637d42b06adff635e"
  ],
  "ghost-blade": [
    "tor4lzY0wpNcJd2U",
    "8ed45119af0204c48ec007c49512270c7bca5c9b2ab81ad1446aad74b9f70f34",
    "9816db6a46a398d91aa9cbb4ad4ba049623516d5e51ec932ed04688c4113ebed"
  ],
  "ghost-flight": [
    "zJXsGF61lH0WHw5v",
    "29f4968053073ab5900c7a96b01296088a4622c2139dd0df5b9af20481d68b2f",
    "e5f0d9faafe3b9e2b0a4f8d0bc9bd19d443c24be0da684156db7231b710b6c05"
  ],
  "ghost-strike": [
    "pM0g4ColXTiQ3gTa",
    "56d08d2b0e816767f81c45c7e133789a03b941991b1d03031d83b4f9d5a32c8c",
    "39a209712ad6bd1212df5e362a3767aa05098550733b1689fb91cad886e920f4"
  ],
  "ghost-wrangler": [
    "00OnDt8UEMwfoYWH",
    "edb2454b3fe48bd6f433bbcde143e7c0fa083f960e8efd273e86683d228378bb",
    "e92542f3c15f3f16105f5ce82db5a2181bdb3c15f44d6243b517ee85571526cf"
  ],
  "ghostly-stride": [
    "3caMKLpJqHHTu8Se",
    "393d6841c20b9435deb15a8da20bbcb8fdf964c8c1e3fb7d8819780c016ae3e8",
    "e8edbc22e412e208e70e51c52ab658debcd00c189e535bf9b2ce46fe03490904"
  ],
  "ghosts-in-the-storm": [
    "ABL4daQ7c65d0tEM",
    "532ddf582b289d2ef18b63331aedc9780c61f7b826315b0bf074fb3a217d1f71",
    "6a6880590895d896248b592f3f5c8866d7a04e696678adeabe755a3c565c109c"
  ],
  "giants-lunge": [
    "MFqFvuiYDAoADcft",
    "2c186fb374cf119ba3d4bd128d37095fe8478f6103f95f9d7b9994e5a622c5ea",
    "b926b555ea7f505055d7816068b6fba6b130793441de25c139a47bf4cc268a38"
  ],
  "giants-stature": [
    "W21jKAcG0GtEtBiK",
    "36180768da5aa40c8cea11505544f1b59401744377abbc9ef5b8a7e7a36b2a9f",
    "1e473494a25d018bc308a498c410f3a25f1f7237247734a48dc1b97af05f7887"
  ],
  "glacial-prison": [
    "QfyCxRwvOZfstbj7",
    "1be983117b80aeaea2615c0856db8b2f60d67772e328b030886a2d2deef63f05",
    "bb76c40a02828edc3997b023f1693591bd8890f5305f492c93e5c7d8a1185338"
  ],
  "gladiators-roar": [
    "YK7PLPoLGYGBivEt",
    "7ca85eb2ef9e3fca720540a132acd05dd65d312f5eda4735601e42c6f10135fd",
    "c44eb17992b8de68a7b7ec6ae9d241233318bd97e030ed97760bfa9330fa4983"
  ],
  "glass-skin": [
    "VF5XFpzBlqUFd8Mw",
    "cde3d69dcc3b85a2505a76d375c5d7f8a8df2536bda40a5ac2389eab008ab3b3",
    "550e226401b8f44ad2e0a97d84472ee3b73aa9db8de67ac143d5f08561aa93b0"
  ],
  "glean-lore": [
    "MJW4VP7PjVAX131C",
    "84a22f6563d4f78ecc0a13aae72187a5e8607e903affea2a5db0486ccad8c421",
    "d2b17882f77201fc6b3e8deb2780f268f945b0492c4e24f01e1ce8f941cc6a97"
  ],
  "glider-form": [
    "Bj0GvPgyPiC2kDH1",
    "18a6425265ae84e4f20da7d02ab996f515a426388561a4f82ae077b7d627227b",
    "9df2fd6604282605b470b9be029ad5ed936fda5fb4647d1c5c0d133450d0b510"
  ],
  "glorious-gamtu": [
    "rLP6gkn74KxjqUz6",
    "6d0939c87921a7276eb4df3716bca117247433cae1e55aa1a9d958b9d0654fe5",
    "92b8428a7b599214e70a05b4d0ccdf72da0c79880bb7c73ba10cdee35d44091e"
  ],
  "glory-and-valor": [
    "2GrlSP1xhKIz4G8B",
    "79281ba3f89434b10b79ce2ea0ed74612ff7c768fd2638e6a791676c9186806e",
    "fae5250645ff6ef0d66eb46335002ecf25b690f8e9d8259d61935466bccceb6c"
  ],
  "glory-on-high": [
    "mgbCNt7MgEVbMlJ7",
    "1252e267edc7a17442a0f77c7b7fc897a39cc0e5bc070698c5abf507a1e878b6",
    "8027361fdf06c5fec936a4ce474ae1763771abcbd44787b739058210279b8f0b"
  ],
  "gnaw": [
    "LNyTKhIZlM17026W",
    "6fdec73ad31c798e35e3d233aedf59ebf799c8a7d7f74c590c747f16e3a48f70",
    "512b4bb8f0e8fa7a10b6ed09299e75ccc2772745781e239b449b6e7125ac832a"
  ],
  "go-with-the-flow": [
    "u96anl3ACNhBqnbT",
    "a059d0d58d18b7ce44d27e92112656974995321fa3162e358454f6efbc2de71d",
    "fa346813a42e93232f0f6608dacbe51d19c9334d941eb8d1208f679bbc4f18ad"
  ],
  "goblin-club": [
    "Oh2GaKh4Qc77xSoO",
    "9d1b8303875d7646760a6d82b14ffba1b994aa66bbe78e92c11bdd4bbcf5639e",
    "8819a6ad926ccb72c661dd6e1df93ae827dafc41b3141995eb93b0e6959d6e35"
  ],
  "goblin-scuttle": [
    "UwH0sGIthv8kiPUt",
    "3f8b263789ba2eccb10a315178351045ff205865ff4a9a331b27b661077fd77a",
    "c5e4c89c26ce75a44732c94dc24f98824338710b6d728ce68b20da25487dbd08"
  ],
  "goblin-song": [
    "QZb0Utg0WFPf2Qg0",
    "a04dbe7f22ef2319ba57c4f94c1b84f128f0443353c8048a6bed67129b2bced3",
    "b7268015207c9b4cf0ddf24c8a71c5348170cdeeb499c599f533d7c342144b43"
  ],
  "godspeed": [
    "Mw4owPxaU6i2Dpgl",
    "709948a255e0be9c6f03a3a3e047163bb223f2be25ebfaa5ef972899a76781ae",
    "e974b52b6fa777d0fa3dae0016dd02a1944e17d3845d79b49339c048c6b934fc"
  ],
  "golden-dragons-bounty": [
    "HvbVV8wjJmVmkYt7",
    "f827d764a3b162148d051f56e3792ba86ce953c836e1114865c4cdff57e5e9e7",
    "de82faed207ee4013a24a6c47af2bf8267cbf6d2cbfe2e3521d2bf186de710c3"
  ],
  "golden-erinys-stance": [
    "BE5YNJooh0jfVVfM",
    "106b74c0945d6353d861b57e923c915da325ac92470cc0361c49ff43809cd21d",
    "eb337d059e3fb7cfb4a0ea5af43b0c4e26dedef6ff4f89eabf3ff9546fd4fe35"
  ],
  "gorilla-stance": [
    "DqD7htz8Sd1dh3BT",
    "2525cc378fd74745d2186d433a6d550289b83fe1e7a0364b52061de8e3307612",
    "0e1cb36cd0790227c368c03a9ad6b8fbd51a58a23a85953770cacf682b06b7a5"
  ],
  "gossamer-blade": [
    "JoFHG7NjJ6iUNnAY",
    "35ee3ffb0032b89c8f54985564b292d9e322e4308db2c27c3b1069b10cac3c89",
    "bb640db407b486b176e3bf22b80d4a23678d7ce7cf14d26ca8c1f6b2af6284e0"
  ],
  "graceful-poise": [
    "rFaUJtB46scuAidY",
    "29af62074c0421873b0a3c817e7c08ac32f03e4803576fd65ad3579a61994743",
    "99dd9727ff57415843e4b7e93eaf0f232c5f1a3344da019e97bcfef223ba803e"
  ],
  "grand-dance": [
    "gYcmow7HM8J3giwL",
    "df2d19db6ab321402316e173f29f6ccb8db57a451b2d9e67b97e41f37a420ef3",
    "336c4b612a5cc5ccf2277adfeebb37aa6cd9ee1a6d6d827bb04cb7d2755fb606"
  ],
  "grasping-reach": [
    "weYZzyMmlCIC2TZt",
    "e11c355f503a44f87f468211b18ab87465b1da890139a1efdc0a6f4c1d85c71d",
    "21580db050ef75e34946ad40ce4b577962a07513c578a6c93954e7a407afb4a7"
  ],
  "grasping-spirits-spell": [
    "qcILhNRHqIbW3xRN",
    "b9c21e0c66c69baecaf101c8c1da9766f0ff9f8e9838b3e92421a87f6bcf3d12",
    "ad930c5d78fe0f61b5ea6f2bf5edbaa21dc5e2de3794968b1d356d246bd23cd7"
  ],
  "green-dash": [
    "KMbNfO3Ljg1vY3fH",
    "d7aeb9e48a8bb1b345629ebd14b3fa8cd1600bc282d9d69f12a96731a3b5c2ae",
    "a52bf1791c1fbd8b4f7e64c78b2ce1bb818f65bec12f8c99257e05694cef7678"
  ],
  "greenwatch-veteran": [
    "9EmJElnNVmXQ7Rzn",
    "62f16f8946b0ada19dbd443753d77075e92d1c3e38cc8c5a8424163f980d28b2",
    "37a777052bcd5ff9254a955e8fc375f138ecab336712539fea82340c90099f9a"
  ],
  "griefs-fury": [
    "S6X3zFOCLVgRY2gd",
    "6629e87f53494cfe7670a41818a61e03125b8cda8c82ef38f6485c25dc03ffbb",
    "f9fc4933cfeb68047c672f0a1b64d936a033e70a142eca2f2355dd6c9f5b50ae"
  ],
  "grit-and-tenacity": [
    "94PGauGdzrVARMLc",
    "3b0105e4d95aa887aaeb42e37311d648bde7602a915337baf76badb887aebaaa",
    "4592c17da1b5f3d2268854f062281f4c46c1fe48ac5e6933800c4db9201826f5"
  ],
  "grovel": [
    "gS9FYlD0Vt8yyZkP",
    "ede6b14b6d145d55fccdbca2bed5faef513693fbb799eea4b37fdf2ed648d2b6",
    "9e770045b43e306be01a309a211339beaf28ba09f4d021905fec7caed3f228a4"
  ],
  "grow-tool": [
    "Rf8md5eIOxV2m4nJ",
    "366d3fa2fe896409ef683d9f3576ed7bc2db9cecf38369abf4fd3a464bc165a9",
    "0d14e64da0994db37434f26a70ef70658ecc40d45e7fec2530c3480598918146"
  ],
  "growth-spell": [
    "hRRxmIhRvg59RMqO",
    "36238377f43f910dc854dc5fe69e46f53fb35da79001bcb0b474158b967eccad",
    "d6e50b4b3e79d56e392f71cafcc9e1c5a4ddbb369d6037da19584e07183399eb"
  ],
  "grudging-compliment": [
    "AHchBBO8lXCCuVxT",
    "a9cfd30741db284c145dc6d652334dac0ade1d725fd345598faba3ce32158ceb",
    "c9ec28b9a5d07ca07f758f29fa5eab24e7f115f78998f5862ad551d0843ca921"
  ],
  "guarded-advance": [
    "etaixAdHNlHnLH0i",
    "c5be5f3533d1509a521fb89a442f76cf3679fd682f98b4788b3b4fc5aadf2ee3",
    "3944d69a95d25ffd8496471c512e4bdeedac8504e0a4ae9de25e8360dff7553c"
  ],
  "guarded-advance-knight-vigilant": [
    "Nb8MUoTpyX9u8di4",
    "8447b3006d060026bfd6252bcde22a876eff6f7a7a7c7eb7550d951f994d9b41",
    "4ba0cf100c206518132638841f2c899bf073968629ed3db920719cfa39028b86"
  ],
  "guarded-mind": [
    "bbBUbigCqgxiIT4E",
    "b1bd3dc3a37f52d77b5de3ed3a990485704eeab645ba5f80bdf5cc8e819ce1a8",
    "eb5c335febc8ee7cbce79039cd179153bd157a596b9f40b72337126a4d21d5db"
  ],
  "guardian-ghosts": [
    "31ozQ8lwNtiQi2N0",
    "c6a669cf8882b21758939b1c747526f5d5d8daa2c4ae60b2d07cd56bb361d5cd",
    "772195f38ba2f263b718419a83e271f0c32b920b9ced819ef014865d7b134312"
  ],
  "guardian-lion-roar": [
    "cgHpgpUeZdMXyCY4",
    "0a419b2f7c5b0cd6a6e5976c858f7d5595be38eba6709d8a5f80bcab9cdd72a9",
    "7ee22d60a209a5b0853b61a197341e8bc9dc4c4f4b7da4f0c782820ade3b27d2"
  ],
  "guardians-deflection-fighter": [
    "JdCRxwgtdQkJ1Ha6",
    "83d6445cb530f03541f934a30316fa4bef1b4fc72dae76baad5b34071ae48896",
    "c8d1fc502deea5164f5ecee265f72f5474d1f0d4147bbb4d16413d3c0f76ffd0"
  ],
  "guardians-deflection-swashbuckler": [
    "YJIzE2RhGRGfbt9j",
    "b080e5bec9085591062276eaa356fb672ae34d91221d138a11185462f18e2f66",
    "9d2b0761b687a901c825c6da6452c51e949e2484b701c7a6b20f668f66c9c9dd"
  ],
  "guardians-embrace": [
    "fJxIdcg7kWPwlULY",
    "5263b0418a15eb176c5248c7d1896a07a34e61fefc2afecdd4080d7073f19f4f",
    "51feb3d33a4cb477b0fffc854a94bfa4e3b7dc3c967558d3a5b493011e43fb83"
  ],
  "guide-the-timeline": [
    "Ek1CoyGKxsozDsaD",
    "1fd14aa06321e7e667275319de3f7e154c45c503acc823f3b621121ead620949",
    "79f19db7688847ee9af4d4f0a7ba6a05e6d4678473c544bcb95916cb602bed6b"
  ],
  "guided-by-the-stars": [
    "s1swBWSqtfrXTJHK",
    "b94a987f27d17a2ee811c4dd27abbb3702b8c718ac6a6692efcfc2c53703702b",
    "42bf1199c5ea396d4b32ea9ff82851a7e0af94a1bdf925823f811afb593bc9b7"
  ],
  "guided-hover": [
    "DXf3HFtO4EfXBq1A",
    "756a5fbf4fbd949859d54aa5f61e7bc4ab23f5713de38431fe7dbfcd310bd09c",
    "8d8dc03621add39654ec6ebfa4649722a45e8cf7fac8553a229c96a31910093b"
  ],
  "guided-skill": [
    "x7EGJYZQuxHbP50X",
    "977abc57b7b514d2a1ff8f702f078d694f9899d6054519d8e9a0912bce3cb188",
    "1c85ba5e7fa7ffe1a1231d232867847b03d17663ba9600c8cce2f9852e24e469"
  ],
  "guiding-words": [
    "LmsjuqB3rrZTqqa6",
    "c3eb019dcdea7256ca61573007eae6b32c650ccdcc22c69034abe82845cc7e5c",
    "f9526809ea6cc02fa445b6381bba9cf0f29e6bcf6faca0f5778a21ea44ad51f5"
  ],
  "guillotine-blade": [
    "jwjtxZL6XpkO5lv9",
    "cebea8626fdb73d76c3fc809e7559cf38baddc053066ae62d2bf7e8b32ebe546",
    "9f8f566331dda7c17c9da228e287738eff133cb80938b77cc0b21a12e12054b8"
  ],
  "gunpowder-gauntlet": [
    "FbzbZc4LGUTcz9tA",
    "ab8773799f08a725d036c46f48819ec396af3851f3e9e3536bcdf996fcaa868b",
    "d54b0c89e83ad26e995e9e329c856fe94c120368057dbfa2989a4a0e3e6872d2"
  ],
  "gusting-spell": [
    "riQ8sn3Gpbr3LdtR",
    "ae7a53e3fdec7ed9088ae56e192f12c74ff29ee8a23e6ceeabc17b245d3f2119",
    "56e1a437913721cc9d7a487a363983c746b1ff3b3068b751b17e7bc9887f5669"
  ],
  "haft-striker-stance": [
    "pKNnFOuHBkJEvmS1",
    "c7cf0a7b0884a61dba509565dd5a44fcba44db3bbf22b8ac12334bc6bc36c659",
    "b625d24fba17b91a80c285d89e8250085954bf05c95a7c1330e722494db3dba2"
  ],
  "hail-of-splinters": [
    "IaV9Ao4twLNblaSq",
    "9901d027de6cab1a1ae49b33576c0be8c3d38cbba4d248781799c15519744488",
    "3d441d835310f460177758a55a457417b738c988670ee2855b09c819d99bf9aa"
  ],
  "halfling-luck": [
    "ZbRVqf14RTJJIZXG",
    "392a4ed72ed44d4a536d86ef3eccc7833aeff01c552a320e6e6ea223d5c5cf42",
    "6f2801c8e53a4b252cbf8d5dfdd48d83a80faf7b0fdca8882354334456b3f8a8"
  ],
  "hallowed-earth": [
    "IvedXsxIyl0odI8U",
    "72d9304a7cd355bf4398c5d8e1330d519e797a61015af11c63045340957a4a2e",
    "6fc2ec0892fefea64ec91eb3d2c12c9cedee079d97deeaf341732204d83105aa"
  ],
  "halyard-strike": [
    "SlwgsFXscR49tRio",
    "60c634dfbdd3b41719a26441a79c5aff544b84fbd73317d02f6d7e8d1bd84abf",
    "7e739bb4544cebca6f96bde967d91a71529c3910fee0d8c5e2baa02288eb151c"
  ],
  "hampering-stance": [
    "UKXaMhb9qlPYw1HD",
    "37e2e773d995ea548501619349a73d6e45ec42b31a9cbabbb5aeb91285eb3eb1",
    "22eb48f7ef4e0991d77c82469016e2ed7167b7c369b088f6b2e748bbc8611700"
  ],
  "haphazard-repair": [
    "zxaE7C1NCGqZR8aU",
    "49678feb0a93706c86d794b5d110ee52fba8dad77ac6bfd28fedbd7dfdd067c4",
    "30cb94f11458113211776745126e74ec1edd3f22bad2abb41f16d3704af4fcbf"
  ],
  "harbingers-caw": [
    "KRfZcToCc5nvcQRa",
    "1ecc0c3f76487fd824ada0f9878cb8bae2ce2615bb9b691e3e2114562a1ea21f",
    "13aa72e453d986621292192bc4a28a46619616e530a110cc3e7da0c9f0672532"
  ],
  "harden-flesh": [
    "REgTwIVgI3j1FQiJ",
    "c50e7b6773126b416a76f587abb09c949543a6e4cea35840d47eda660616cc21",
    "b787c71f7ff08e041d4bc33ff052e2a8007dcd2d3e5eb1a52fe15a1c7fd69ab0"
  ],
  "hardwood-armor": [
    "cZa6br5C3Iyzqqi9",
    "4e4e0486c8334059415cd63046d0174ec86b571982558f983df88e64f748e55f",
    "3d56412e45b642a4253091ae5890cdce148f3a4d7c0f0aea1140449f0b382c9a"
  ],
  "harmonize": [
    "21YWBdoXGmj60vdI",
    "dad739adacfa87cc15697688277d979eb88ea78e6a0e3688ac5d6746c35411aa",
    "1d7e109802f4af46c65cd8df739155ddbe296c9d1a28bc7514057734e7b9e6f4"
  ],
  "harness-natural-magic": [
    "GhzryNTSlTBW808n",
    "c4bcbeb0de71e928099335737de141646a783297ad843a52dee04adaf160717a",
    "820171d2768d4d28b83d31f501e548149459f0aaffd234495e93c2a34246ead9"
  ],
  "harrow-casting": [
    "ATsP9JCBnzkwVQbl",
    "b9471f6bd6bf94a4b5056048cc59e9a9721726753467ef86e15eb4b391f761f7",
    "4c8b6dda812c924ce8c28f2fbfd914bc37e10faa3f696f23c642080a20e35a41"
  ],
  "hasty-celebration": [
    "Rb3ndqSyDUa6KvOL",
    "f9d3b6ffe8e973be58159b259395246e49cd5c78afb9e9a2235e593434b594a7",
    "76f29a6a94fe82ac7582569ccc0a555df9f8b3dad9bdeb89746e522482e62b6a"
  ],
  "head-of-the-night-parade": [
    "OYrcbyaV3v8ycksj",
    "24cbfd0374d85d9ede435dbe2dbd97bbb678162c5aa1a84e63768d7a3c67650a",
    "d7fac4672ed8e3ba895df969f61e0d17bbec932bdda8ce5d0897d82c4c36b426"
  ],
  "healers-halo": [
    "Ofk2WfHbj3nWRhJy",
    "21039068e12e076616c6ae19a3a17a59411ad5b2031d87ed48c409b16203b178",
    "335c3d43e018f02f234a3aad95114cdcb04aa76f57eed60c253842d851cd3f39"
  ],
  "healing-nexus": [
    "LiBVd5hhn6GyoI5X",
    "604382b0aaa0e4404a2a3ebeb3d8f9abdb72e90db4e4145bdd344622d0942d3f",
    "67bd66df308c80cce0d63c5e48fc20509a583a43be8295ce3b7c9819e8118b1b"
  ],
  "healing-transformation": [
    "85V3vdew0gykEtmu",
    "71bc7b0c731b528bcda98b1764331514f8176098da92d8d81ad0603ef705ab25",
    "169b160556d09d660765889d912dfaa1f0783b372a4fd4fb65eeb72f4902a5f1"
  ],
  "heat-wave": [
    "bKc8MMFEOpOJJihb",
    "091795471142b705bbf44c551e623531ab630d32638d83687aee9f9d774037c9",
    "cfade63001f89c7e567a40fd3d76701d15f4009d06301657c2bf2cf3d3ccfbd3"
  ],
  "heavens-step-offense": [
    "4fbGUm8j4zzljOo6",
    "db5600676351b710ef51e7426cad4ec095cf951874868c14f334cb9ed6f9059e",
    "d80dd8b05595ceecb41b7ca15cdfc5a7c4273312d9b4154aebf75043cdc079b6"
  ],
  "heavens-thunder": [
    "qJdbK8vgIqeHU7bu",
    "0ae1b9ed8867a528246d84b00a8dfb00e1f24746d0fae072394f81d7952bc964",
    "07cf615325bf5bc750cfb5af0bb63a6f3df6f5cd24471583de3b5e8a32f81840"
  ],
  "hedge-maze": [
    "m2Gz9y8VhGi0EpFC",
    "ff5a2c59797f0b1a151f418a1fa84fc70e46e0d4f622e53074864ee6896ea4fd",
    "fb7ffeb3e1917b50b5750b2fe55b19c20ee409ad2f7fdfaf6b95b29eb20a66b3"
  ],
  "heightened-captivation": [
    "BBvmmULFPLlHCeIK",
    "4db68b1ab8f638fbd0b91bee7500b3ecbd5f3440256e01d3f46d231fd1e2aaf9",
    "df0f4eb65586474ac1e21ffbbf66c114993d973caccbcf298d3576d90307987d"
  ],
  "hell-of-1-000-000-needles": [
    "mGGnDgk4wWpCMon8",
    "8fbd76afa5a6dbf6007079e29afe395b9f4351b005c36c5145e57e91860884bb",
    "657300d040544610eb600a4bddb783bed92c1840cef7d49e380f19c6dd1864fc"
  ],
  "hellbreakers-resolve": [
    "24LBBYT1op52Pm4J",
    "de161d78ae07dd32a35a9b9697f4b4fc60e4c6522d6ad27c6f939ceace4e1213",
    "d185214151894a31c4bffa8f5e874a5e4edaf0efdc8f7e894fabbde680f5c0ad"
  ],
  "helpful-tinkering": [
    "qUSWPWxYF8gfhfHM",
    "d7d411df099ae5a75e6a3f957ce6a1b31f77bbe16deaa006552081507342a4e6",
    "cc5d722b695b42002c3aa189f354f2ad38410971ca512904f579d2fa4d2349c2"
  ],
  "helts-spelldance": [
    "9tXGk4h9Bw3Wcnra",
    "ab6e2a050359dd1019ca36614bad7fa79511e83da33087bf448a17726963f3e5",
    "e78e62bb4ca3479c05bf5e8011a77afc34c77da50f83d5d5337ecf936442b53f"
  ],
  "hematocritical": [
    "AY3XRv2j0cZvHaks",
    "ca010ee536ed9f4282fc5f27c7bba18997805fe6f2036fa83d963db705092c05",
    "f5472c266f6c998af65b95aaa197d8d3e9fedfe7d6ba3bdeae7b6e9cf9204f65"
  ],
  "henge-gate": [
    "QpLRaBnuAiVRJOXG",
    "c1c1d813961013bc4948044c879a1529a931a99648abe5f776c164eea1f3dda0",
    "0b49c181cbf139013cdef6fae60084091b828634c90a7216d1c429473dbde5fc"
  ],
  "heralds-weapon": [
    "5ELeiNtEDgXfBcwt",
    "4dd9e3b8eb1d00b0d24c0bb86fb2e736607c3f96c2f9736b428c88dd001a4d59",
    "f030a8fefd73eab85a06d97bf1a8c17e7f4ba739822b9ca6fe24da2955a8a186"
  ],
  "heraldic-proclamation": [
    "5uzu5u5UFSfRRBSs",
    "477b04858e8beac85ac4a18949ff05a09efa13bf5f8fb1afb5b46086f6a27f61",
    "1a81d678fe00eea1ab18b0161838182d24e3f1146c9a8956339304ed01570d8a"
  ],
  "heroic-defiance": [
    "81jVmGF9Uo9dp2dI",
    "1c472b0ed1b3c3c29f865f1494154cb778baf29ce3c30e8602967e73ca0a146a",
    "a03930fb06cf1038ee39e28541b8a1a2ba7e06c58c48bcf5f85ff8c321bbb98d"
  ],
  "heroic-presence": [
    "iVwsLYjOJbfvL0Pe",
    "3810f9a7eb84f12dbab8379619bd1295dd4a94da0747fc21dd92465260f1a5f5",
    "a3ab22c2385602970d350d95007836981905d5da3aa7df3922cb4bf33882e58c"
  ],
  "heroic-recovery": [
    "KR78kinMmAZQHeoa",
    "bd1436390627a49166ec452218503d7cd72e0de9120cadbe82688afe4e77e6ca",
    "40a7698b064f1a69c09cc313a3ea332f91575a7f97e89572d8cda7decfd0f052"
  ],
  "hey-over-here": [
    "rVgEkpTLfbeOdzzw",
    "09ff2fbbab422e0dc217843d658b10948a97b3a353535bda06386ce0f89e5ac9",
    "dff727c412a7262de04f2a6bc5b549c8206fe13c1956c4ecaacaaeacdbb0bb2c"
  ],
  "hidden-paragon": [
    "Kl1O0WK37KMTumv1",
    "d474f1b61488edfd3ecb196c9ecbebaa9b031a2653e5b69ec547a12508e8aff5",
    "f5849e5475ab56530a8c1adc5feff051fb7862e36d5270e1caf1910ba1f85971"
  ],
  "high-alert": [
    "Ilh66megcbP7ahMN",
    "ec27b908003c62872885a16acbabeca3152614f30e2037ced17d77abbb299b8f",
    "255b25c6805f94d96dabbf86c0d16ad006a8813b1cd933cdef93928acf1edc65"
  ],
  "high-speed-regeneration": [
    "xDTjr415ZZM8x2WW",
    "af6e877494aa4cb1aab5f3461c118a843b5b3ef987ff4396a9b2d9f12ae1dd83",
    "e4b64298da582ba59ff9ebf707ff1e128cae30fd58b703117ddda47cda5270e8"
  ],
  "histrionic-injury": [
    "47ZB8mYBtBt1C7zh",
    "9636267891e0c873f73f5ccd941c4963905908ca62443e62ca42ae27d583acde",
    "6e2642b738131c88cfc4e9867deb6ea94d3e13f4f5be143d22b34fff6bdfe3a7"
  ],
  "hit-the-dirt": [
    "6LFBPpPPJjDq07fg",
    "83e1a7e8bf5c7588b903f9becf1ad13a7f05acea787288c3fb642525aae074d1",
    "59c79f17fbdf8c607732e716cb1f12e27b109720c61bdd4a645e1d43292f628b"
  ],
  "holy-light": [
    "xmf6oUYarFJGajtr",
    "3ebe1dca7bbb95b7ec783379e4b6bf84fef8f8b6aa58335c589720883e9c76fc",
    "d70a110a9e9df45b72ae2876d177388892e4a01b22fb8c4aa036261ac18a32ff"
  ],
  "hone-claws": [
    "GU3EQVOMjD9S2YWj",
    "5426f1b953299da74726e04fb4b608e36527404b1882ffe913629952d902ecff",
    "1dae4c0a3e930053124891790752d85a24c00eaeefe1a4a475ad0b6e18a5b13c"
  ],
  "hop-up": [
    "7ntWAreQp3x4wPxT",
    "4cf14644212dbbfba3150f21f891ca1e367b8ba914bba8ab64f7e4de4bb9defb",
    "54a658df2e8b87fd8726948ebd3f59b39a9b2d9b44ce125f6962984d2cbf5962"
  ],
  "hopping-stride": [
    "RkEvEqwc8pCBcusz",
    "860d414f51d00c659cf3f3ad2188fbb1ba263200c9fa9bfb5e908c643194ec00",
    "e2c6921d797885b4571ef9649916065899476e4d102bfaec2933a651b8b56230"
  ],
  "hot-foot": [
    "dtPXuS8MiWrz5UNK",
    "8ca2cec5467ad737f5230da1d0c7a287d43e8f8372e3030e50619a8458fed7f4",
    "08387a4e88937c2e2a47d10dbef0076d68d614907e747399c8339db8481d0dd2"
  ],
  "howling-aspect": [
    "rb0GCneYEzBi2LGr",
    "9552d7d208c2b0338e5e8e5fb825b8a7ebc76e13be13c0408321760e47476ff8",
    "2132efc7c3fd919ccdfac15ac34bcc6cd57cc9cf33b21e24fa7fde5f4d82673a"
  ],
  "humble-spell": [
    "j4PinERsGdcAnIET",
    "5100549ed8d0b155097f6a5418ea0a7708ab60207708a77c41c7186841f806a0",
    "603b7907b177fe17b31cf6fc13117e65cfa514e0d7330e912ae964856e00bf87"
  ],
  "hungry-blade": [
    "6nB5ycSo4zshj22k",
    "970a9edab574fe43a054dc92ebc09d4f8aa7c402eed60a0236c177d5d282a365",
    "fe51a328313ec77c883e20c2845d53d0af646094c56c4bd44c26033738ba9d15"
  ],
  "hunters-defense": [
    "KYTSvAEqK7KAyVwi",
    "133c10702b1f21ecd2f0df838a6659010c44a96ac430619e8b70eab39e3ed675",
    "903ed61d32aa3647fe65a8f7afdce83548191e07674c419c7078a84f9e8da382"
  ],
  "hurricane-swing": [
    "iJrjzLnLJkvQgrbS",
    "49b301c28b15654dd76e18f9b828429bb4944c81494b7faf2d0faa7400b2ba5f",
    "42ca98d73cc5cb3e1720028f9b225340feb86e5e6775a271d76d7cd86d751c7c"
  ],
  "hydraulic-deflection": [
    "kqRFoXfErUFEndIs",
    "adfa378db3ee1fac226c0cff560e778e25ed2b9c8dc92ec0ae348eb441d3e69f",
    "6c3f7352600a2ad4c8fee141d204f75000d08eb34c77ff0ba6522656d476300a"
  ],
  "hypnotic-lure": [
    "BaSl8PmfQwESIiY6",
    "db6c7f9ff36f487fca0b0be13728ec281f51f080b7417a8daadc1df969b9dfd7",
    "a933791108d8fa24ce7f79eeeaff5e5a73eca99451ec43e7344ce043fb337f65"
  ],
  "igneogenesis": [
    "zXsJuf8RjBlJ6nJv",
    "877d38141f0ae3285f6c9350839ef804316ae8e065cd34c398dc1673e9d17515",
    "24a9ba8fabd802e465a96984d6a58bbc9d3f938f4049c62b13f776869821c816"
  ],
  "ignite-the-sun": [
    "uKeUPPqV1cNnIy0h",
    "9a2a783f7ca25b1dd69f3f88f034fa85430fb5b5fb4c034401b5d37143d1125d",
    "8fbd91b8658c2b182b54ccb03c53c08d6c11a0b1fa3ff104a746fae4872f080f"
  ],
  "iivlars-deflection": [
    "lu9ehnCfjYMIi1pV",
    "10483fd5542bcf8d8875663c9a9c6ad2ae89a88d44492c5f30772daa2dde566f",
    "f358c7c2724ef8e71db45dc974273f9acb2e520986d5d9b485cf19b975c70f0f"
  ],
  "ill-tide": [
    "EAoMrpAEH9VBcDHK",
    "69ba5a875739b5e0e89ce6d45ede5415e661a856f5fe7cb28e6d1b7282ef232b",
    "71fff97ec76fc1801f903fee08078dbbffefca9ff7f1af0320f426be9ab99148"
  ],
  "imbue-spell": [
    "hcwSO3qeYLQtRLBa",
    "438bccc0f658eec8d1d801855e8a401e6bb9f79ceedba7dc319c6b236e3c5f8b",
    "9ec9b1b83af12528cfb432bcc1d7788c4176b29ade52a9d10bcfcfb06f24e156"
  ],
  "immovable-object": [
    "R8MaoG7CzHZmQYtM",
    "1fcc8705be9ba7c896e880b535a524c7083467a84d319d97a33be31d9dce2899",
    "ca80b29119bf21c520212bf4bbc99f01e0ec3b9c7060ec3beefef9ba632f4ddc"
  ],
  "impassable-wall-stance": [
    "YeyOqNFKaeuOTiJr",
    "42df9e20b4d28a895438ab44bfc0d5fe579a5614f8334395f588734cc9430252",
    "a5e35ceeef1407f31951e9a3daac89772d0045011848d2e0cf7f6eb7aff8ceec"
  ],
  "imperious-aura": [
    "iHGhQK8A4xsfaV8t",
    "1eaebba72f1daf1ad8ef309d9bdab5d10afb92cc0a04d76d790c934971515d12",
    "c8d6f14bf7a9557072aa90c26cd3352f47a06b14d0ef7f872c88896d2490a1a2"
  ],
  "implausible-infiltration": [
    "fLrwddS607eRFfHA",
    "0a40d76deaba6cad589e33ce89bc0dffec91ad50f17fc65c217746eed8cd2ccd",
    "4b95b43e570631354975bf68b2c7b057e062f722297be1179ba95a294ed354d7"
  ],
  "impose-order": [
    "DIjpbE2dh5MRGiYO",
    "0edd8b634a98ecf304c3637aa640b691630f02397bb4b161e4d414928e12ac5c",
    "280db80a51bf8c58f89a9ea4a000726ce34e9dade38f80a19be20b868025a9e3"
  ],
  "impose-order-psychic": [
    "VC8qdcCxtzCmG98M",
    "642f1d8156acc42b677f3dfd0934117f6e06a67cb7e212196d5502c12ec1edd8",
    "5b24a87b83e26f4e382c3d621975f887eb414f913380e265f261162f83f4b60d"
  ],
  "impossible-flurry": [
    "OqHfUQQorVBkx34j",
    "ddc470f911a861ac97956654104d0d0d1146e04387f1ba51dda809b5511b64bd",
    "50475839d09679cdd8019027694a4a82a87fbc7c38ed4d210c53309246bb2a02"
  ],
  "impossible-technique": [
    "srWsvDDdz77yieY1",
    "9d5cac5fe1a4608c1e8a321b6f956f50fced352cb6a3c2206e5265dad9652936",
    "b5e243d45ebd40af3f9b26bffa5d139d26e3922ee2529032c3b1d9beb4248677"
  ],
  "impressive-landing": [
    "QO8l5Dao8HnaFQE4",
    "bfd9dd04d1cfcf8678e70de41ff5864a10c7c8bc30b6b74a0a2a9cd0bafa62fa",
    "b73321a350050100ea29e7c03ada5f4a38b2c39e2a92577173d72108415b47a9"
  ],
  "imprison-foe": [
    "GPIKvj8K2yk2eVOC",
    "52112fb795825e6febd5f8347bfe60583e4af47efaf9d40d16ec2fdf41230aa8",
    "73d16ba299242f0abca395535a60872fae66296ab34b2eb48990993b5097bbb2"
  ],
  "improvise-admixture": [
    "H6SL2F11nlMfqCQC",
    "138b74b5b0ec63d55cc142a54e638ba1b17aef330bd85e9c6928ecd95565de19",
    "ba692b6cf23f1e62f46456608ef5570c2243db02573c44dd91ecebaf46c878ee"
  ],
  "improvise-strategy": [
    "XbMfMJq2sCQHdo1w",
    "07b1ef1b4825b17c5926705f741c11af98fc9d3c5f5034ead9d26faf690891b0",
    "bd827adea7624eb7623f3bc31ce7d47fac91ea8449267402a7ec64540228e072"
  ],
  "improvised-repair": [
    "xT593tHyPkumPuzz",
    "0cc0bc2f019b4d329319e0c289f56938913f30a977e8ad5207b6adaa4d4a9329",
    "9e021b0f3a72b7c298a658f9812fce1b513564e6150d2d919f50774ca34e35c6"
  ],
  "in-lightning-life": [
    "1RQLf09kpOO6ljmb",
    "971441f6291c49e4cfd6397efb62416ca31e5c18d4e063a962672a837ddafbd2",
    "cc70a370d6076f90a03c5778a0c2e1bc4db23b4e5ff2f03b4bd77b5de4b14722"
  ],
  "in-the-hordes-grip": [
    "E7dvSRTr9s2q8TKe",
    "26971db6bec0827529e554f2f8b2f438d8b7caa3a44713f36b36d74b86cc1dff",
    "c70b93ba33cb064f973db4e57917b8d3cad853d82c861d58098868fb84e17732"
  ],
  "in-tune": [
    "6FCWkhOo9NqfLKqV",
    "3cdd1e47aae06c5c5c5a6c0c848dc139bea091cf12837ecb33cded2623657a63",
    "031790855bd2f44d554261bcba5709b05c6c6b50778fc1d4612d66dcf80e33de"
  ],
  "incredible-improvisation": [
    "lHcDb9oXUdFupRdi",
    "88b982baba497817647f802d1588506ac97c3e6f74c6d4e0664d040a2e1176fe",
    "50bf2c5a0e00bd21abf114a3faec07a5350b3a635b93d2cf7a8cad9f01a3fce7"
  ],
  "incredible-recollection": [
    "2l15VfVHMw3ttgJ3",
    "859988036a5e905beb4014a6dd1ae99e7219ffb51503a34a157b11496ce955ea",
    "7b2abe263ef1768b6ad3b775d1d75605b29606889b29e14a046c004840cc2e13"
  ],
  "incriminating-spell": [
    "pBm5vej9divuL6dG",
    "412a4c6e727dbc78e2de281130abba0696863bc914af5c8924c069df6c2ecf3f",
    "bdea1afd8baf385c9445688c3df3f03e6e2f18734278fbf6650356da8c907f17"
  ],
  "indomitable-shot": [
    "XrvIHz2bkgdpJ8rI",
    "648116dbc61974cf2fbd71f99e4e3882916c460317569c98b252a26bb86c02ac",
    "711c552ce188fdce3ad9de5aa1b2f6b4a374cc04ab4455121ca9080fd5b91680"
  ],
  "indomitable-spirit": [
    "v84501yLBubHlGPz",
    "86d08b52f0d20327241be7a2cd0c1966f3cc77ad192f20e549449972dfdb820c",
    "2d9fb385e6e40ef750854953f2d81b7930aab2c0b2f27179462bfbdb4051b75f"
  ],
  "infiltrators-reload": [
    "2RwRguv3J0CbzjNg",
    "b42a1b0d37c9e4c2641e82de701223809a9c0dd77a5c028a8dfb4046096e6f97",
    "18f756e242654895706d4e43255425e6e3b71732f75e2095034a6a8e8ae46428"
  ],
  "infinite-expanse-of-bluest-heaven": [
    "fklx5lSy6ZEI3sID",
    "a3877b0a933d0dfc5352be521336622dc65f04de30ae1d18f8aa08b7da7c339b",
    "26ebe15b9455073517be4b560ebd3bfd9f5e78fe8b6e329ab8c3ba7e7175d26b"
  ],
  "infuse-void": [
    "nUKEfj7fI91JwO3o",
    "78140c3b278c894d2fa3540002e6d64541b2c9bec249f99c7184fd5370792397",
    "63b211991ee3e54a44a93ccc7252ae632075b2e3aaaafb89b28cd1dad35a724f"
  ],
  "infused-with-belkzens-might": [
    "DaRfJsWAivah3a07",
    "f717b6492dbfa7daa7db567411d084aa508019a03463a25ae2c48dfb73d7021f",
    "1c4204039052a6c4c1dcfae1e13e1fbec9fb2a97fc59688a6b9d010e77c6a7d4"
  ],
  "inhale-exhale": [
    "FrHsGqUvq6GrugC4",
    "2689115fac505fcd8b59395beb93a6860610d7c3d7cab7b45f8293a5ff971e75",
    "ed55cefd51f03fefccb3a3e382851d5a717c2d1639e662d2d64884ad924cda50"
  ],
  "inked-panoply": [
    "m2A7S4BjZg94WPyr",
    "e4e18df09776682df0167a2726581fff2b768ade79f29dbfd057a747786e2d72",
    "887e69cf017414b1d5ff8cbf2e01a52b8112830a0d303dd425805633687c51d6"
  ],
  "inner-strength": [
    "OY1Ewg0dbCp52Hl5",
    "27c56e044525db71d2a093e1d813bfd9b916ae049a26f4a167929bd08a08843d",
    "55c8f580c82e0412a3e0293771fe859eff5ed17660b65307b2e1a3794738d431"
  ],
  "inscribed-blast": [
    "2NWPxJ23ncTmqP6A",
    "62dc95ede72f0e49e1aa5e70d67da55aba3ae76f826cf63ada753b974e14304b",
    "99e6d10258550439ca03e25b1f19de887be2fb526ef389ee8e627373615f7b54"
  ],
  "inspiring-marshal-stance": [
    "bvOsJNeI0ewvQsFa",
    "f53fe6541455b9bd963a9cf0830c054176e81bd4b1397fe9c89d25b3639d72ff",
    "9491a1bc01a74edc66e83028630ecfaa8626e6001acd9eb4a7017357afd2933e"
  ],
  "inspiring-recitation": [
    "c2UuV5n5leFx9vlU",
    "5055345da6f20d2e945c00afad342086c3b3d4e0c961d22e73e2289c77b07451",
    "0e346276563fefd7b1bf4a438915755207660f2768810ca60a6d46fe93997b28"
  ],
  "inspiring-resilience": [
    "AbsqV1P8OAhChcRl",
    "72f202de1a5c02b5b8a7795afeb25d12569f3c6e7f7cf335d617e6451557f37a",
    "e920db68faf84a02c6ccb4bb461de5afc584e24c14b69439451b626029464cdf"
  ],
  "inspirit-hazard": [
    "5iHB5ZFJ25XrZHye",
    "2ceb4c6f42dfd00fda904b90c0552e56220460bf88cdbee16b16c097dbfc3dac",
    "4a7de39d35aac78518150f74bf85b6750d8d517ce29985ee0b0442a9aa31fb82"
  ],
  "instant-army": [
    "FWAiNuqFQiCgJrWj",
    "b6ae7dbe6816239ac64d02fec1db4fae0c12164f67194e4f691d165df1c9da86",
    "1b579bca2b22faccd1929e2e935f784d905038e70a145392de0ad801a8048f56"
  ],
  "instant-backup": [
    "dC14a0DZqDBA9B8g",
    "506a169265727b347d3d1a56cb1ebe2cf31c744e715a0606ea76985956affb99",
    "d73b452d42edcc13d1fca041438c126e808a84aaec16e8255ca0de9636f01624"
  ],
  "instant-opening": [
    "9zH7IOsmhRBEqXAV",
    "2bc7406175dab6f4a0c8f25cc7de43004fc8ac0b0a1577f12a54b4192c332f47",
    "97aeee552e5b003a3aa9757e1622096355f46e0ccfc3388e50e5d6f2e637f033"
  ],
  "instigate-psychic-duel": [
    "rm8NgrdZNjqpGlC1",
    "d0cace3fa97e82ffeac0a7f01a9b32e8efe9b806f89510f788c4ac9ed966365a",
    "e4568832d86c78980e77c50402ac72dc103a8183d075c4d265a0e8920a36dbfe"
  ],
  "instinctive-obfuscation": [
    "jatfexNkXaTs9s5Q",
    "d3506ae670eeb0c308a1119b8b1291e3403711159839c801b3ef32df2aa1fd28",
    "3ba301656a976731c928514e875323cbcb87056af6d70bb130ece158e34edcd1"
  ],
  "instinctive-support": [
    "buRSqam06r9jFAbB",
    "c51af8279e24d29c175eba86d3b141eaa110142f4db20847bd82a015a8a8aa48",
    "d6a7a4d037695f38d0654857cda322166715f6d2c7b4523dc2fc8cdf01524bbe"
  ],
  "instinctual-creation": [
    "EEPefggvOCFHApGD",
    "521670261dee4e76dc4191d96f2fc5d420f7e6b54ac8e80b27d04af200e5777f",
    "2fa50d6061fbccf4ff6f726d492321432a6d568102007c474a0981bc69e367bc"
  ],
  "intensified-element-stance": [
    "qOGD3K8VlQAAjsWy",
    "40eb98331edbe8f73b8723a7f668bf04cb841ce6e48ad9ea696450710e9e095a",
    "d19dbce65d212ff1eeefb118d4a2c5085d0b964fd8cb3e0095be46262bd7af13"
  ],
  "intensify-investiture": [
    "uJgATfMW3kumS6Y0",
    "75c037fad0fa215cb98e8c74dfc06c9627f4738ae4c58f06d495b50db625fc2e",
    "721c83c454acd4402e0a09e08c3d227fbfd9cafafb29bdc405201a4bc1752638"
  ],
  "interfering-surge": [
    "aWHOcGLA7AhX4xpm",
    "5bb296803b6fa5484729c5a65d3c76c3b8a7f851d7bf707157e366dca6e35c05",
    "a5feac9579918e5ccfd607a4338e0196eb951f4a218503fe76ee96f19bf68c31"
  ],
  "internal-dialogue": [
    "VB1UK3KA5uZcxC05",
    "48f2c976797cfda669cf8ba3baae4ca523597019dd518083b3c42344e44394e0",
    "37e34afb2d5543662813a23797a6d85faea34ba6da4cf7642abf170107807236"
  ],
  "interrogate": [
    "uFxUj8OgX04w5MXp",
    "ca784e28e4b24642629f8a5374c4a700eca38f8442552326f56ee7f9feb9a5e5",
    "56280e9aa5f2134b6c980ca7f47830ef7c4e9a5329a00ae198cf098033eb09c8"
  ],
  "interrupt-charge": [
    "MjPqgBQU9W4kelfz",
    "4516dc779463d8cdb18686d1e51e649971285af7ef8126e60c5297d8ffc3fea7",
    "24d9fe7d9f01491c828a7da3e2778f9b1751b87caaa80e6a6e3243306e54e666"
  ],
  "interstitial-escape": [
    "tgSDzfcsNly0EYRl",
    "62a13c5487688b161df1cdb3427bb41ccb3994f00e7293381967188bb5201ece",
    "99eddf6a7b0b0d925909a8e5536cf432f5244e4076401457f3b3fc1f135ea21d"
  ],
  "interweave-dispel": [
    "bjNeSAldeTzRcEaQ",
    "6c4df668b099236e7b87bf058adc17e1bc0d9bdb63af3fcea1529d554ef8e983",
    "cc0d597b61ae3fda00dfb9d2710324a0151b7346a4765e11cefd1ed4da5cd028"
  ],
  "intimidating-spell": [
    "SQM1Rrqihn1IoJJD",
    "14aba2d160a2edc793fbecacfcbe4d5b52445476dd936a66c1bfa41a9645dce9",
    "9caf0492e0ec05292496f43ffa4f6901920837f0cafb330cd198ea6606fcb5bc"
  ],
  "into-the-future": [
    "wuMa6iJyZ83LYJXH",
    "81f523d466aec2f6c5a4a16fc5f7fb5455b03292dbe8302d7f17c64a6e9a2616",
    "b9ba0685109ee11279d17efb535064f19c7dd7785d1589c8ee476f31bb579e21"
  ],
  "intuitive-illusions": [
    "MwjnRpVn3br88Caj",
    "eebe579244dd4fa2ebf00cb18acad2bfa19af003662e314674af24b02a659df6",
    "3111eb48f4c49342198e9ce202fa0193607fc8e5e438cda2aa1583438d87e29b"
  ],
  "invented-vulnerability": [
    "0bFXHrLuMKcuz9DD",
    "fa0dafbe06cae598675e5f25db395b9a65a6ee71b05edcc9c4364b704262be33",
    "a98e07de5603df304720b3f64378dbb31bc5bca97f55155ee21bea9f660faef6"
  ],
  "invigorating-surge": [
    "mMboqxWsQmwUTQ6m",
    "f61126861670c2457c59c6cd36aea0925c9d25b30fb5bb3a9bfce055327eb67d",
    "9c44e510cdd4a5ae3f7deedcfaaad984e9567816505d09fd8ebf57e72e8574e1"
  ],
  "invincible-army": [
    "2zxF682cNhgLMu26",
    "7391a567157a01cc7616a32d161db681454f05f2fa5f3c7712221b56f4ddf114",
    "e6214fb1ef73cf472cd3ecbcd14b31e9e2e659dd5a6c584e0527f419e1fb5da1"
  ],
  "invoke-defense": [
    "iBdvNOWazhiXeUUa",
    "e71dba79b31955146707979a71bd7a4cca3fa73d06a66aa95a53d2266dc2f9b3",
    "529d232f295161553092b386e5a0833c7eae110afb01d846f9e04a2bac9e3232"
  ],
  "invoke-movement": [
    "7ZYw4SiBLBbbICNs",
    "407d1541928832596d341370dfcabd34fc57a282d7b2914aa4e20a3d85b9d37b",
    "1ce8e80061ccd3af941a33321c777ac3830cf67910c0bb2874f3ba68c3146d77"
  ],
  "invoke-offense": [
    "EEtezGRTZSHayQDR",
    "4bcc3ebb0d5c42579271e2dee845610959b34c5a3eb27669b5075ca48aab636a",
    "5b8d1aa972f074d4917a16c1016fb2fbc6d67187d12f908798237dff4fd41674"
  ],
  "invoke-the-elements": [
    "4Jwtl2FvxskruHQv",
    "02ac74c5c1e549e6669c27a7abc10fb0fed9aed26e142ac8d584d4b7ebd02bfe",
    "a128ee36351a1d9a68864f3c774fce0d316a785ce0c8eaf198d04795135a3449"
  ],
  "iomedaes-valor": [
    "RmAl2BfBkFj8RC1S",
    "973764931bf05521f3ce15ef7b2609d205a175089f667569c6563df73e686544",
    "0f9680c81d12e1175eeaec0db47a6058e0aa8ea586da9cd27b1b3011f9a3b5b7"
  ],
  "ironblood-stance": [
    "x9cYkB8DrUBBwqJd",
    "e5e4905d3d04e6252f3ed96951b0c6528738f8906dede82b0f335690da19aadd",
    "f604321818a413c9596775e05702bcfabf6be58e69bfb8ffa406e916dc2107fe"
  ],
  "ironblood-surge": [
    "IqDbNiwHQH1xApo9",
    "950d57ad847c9cdabec36bf346372c4e4512aa9fc0dc76a9e2f3ea1cfadbe1fe",
    "0cc0a428d12211900ddc6bab9f25026c24f8b718a8bb9aacb143888c60c35eab"
  ],
  "irradiate": [
    "79GUhBznFfYqdwgO",
    "5e6dbeee3fe6f9f21aa30d4d5b449fd21a8fd8ecb7363d0a222f1e8a7e5b9ccb",
    "cccbbf9555dbe8dd6c781c0c8eeed3527fa9737895b4896ee20cae8a09bd97c2"
  ],
  "irresistible-bloom": [
    "gltXysTfoyF1Ywoc",
    "389fdcf772ccbf15521f795a1f096c65a4beb3825beeab52aa251bba7d4234d8",
    "876dc660c77e6adb01cb18a779455dd4d1393f064956c8f68615a7a854269819"
  ],
  "iruxi-glide": [
    "yqtaAZR9jfen6gEW",
    "76bd01cb0ce11bb4e97e42bbde0276fb259e1ea09fa3192966ae833a078a3ccf",
    "85ad76237cb22499f192aae0b57a80be700588ea0acce6e395b7e839f4622926"
  ],
  "it-was-me-all-along": [
    "hPfqQpiq6W8RPCxz",
    "b050340c9e40e59c083ae214e66005ec8b6a2da7bb5f9bf795c64eb7f353fde9",
    "4e95e12ec47bee323b7e28c95a0cf826c406aaca633b5eaf3d5b62c2907d135d"
  ],
  "its-not-over": [
    "37l9SEvS7X1jHtpD",
    "1597e317a8f449141e8e0d968212c1e2374a3d553a5df640b8567b31a2f1a74d",
    "7a820e4cf68ddf6cc7109a255ac2a1761cff4ffad504be182d53a6f0d50a43b4"
  ],
  "jagged-berms": [
    "9L6c9sxweM4IdOse",
    "2427cf9ec5e4c3aef50caacac8e65245b2f304eb32578e138f21259ec1d36bf4",
    "eed35cebe0aa01c812a560e3b6e2c148dc0bb5ded14070f8914432f438df8cb8"
  ],
  "jellyfish-stance": [
    "Jwq5o13uZF3ooln1",
    "96badc4bac1f878a2fd8e9d7f09a9df7023aea1d1794f2b5ab2b9cac5fc03776",
    "5fba1eacb5940fdb697b21bc313d31832d39c47038d585dc5b91c55e0e3db615"
  ],
  "jesters-gambol": [
    "dzPwwXHW5NzYGG5h",
    "bc6229e5846487b708af0ebfa2a2de2bf1454d1994f88df01c50e50eb6bb5673",
    "628d9abd8572f20e36e324a63b91a200948bb7f23b897e6edb00b58206345e24"
  ],
  "jotuns-battle-stance": [
    "ein1K7P51cs3Qusw",
    "cf09b9a14bde1662c2e52cbf0a0395e0ecc4c2ddfcb28af2b379edb563c2ab94",
    "a3f231f0e8c89d85e7eddec1cfc7c7062e4190f769be9aeb682375239da7e181"
  ],
  "jotuns-grasp": [
    "GsICYVRwfcry2s6K",
    "68fb13a0551a465e687d18b3e4917356a46db33a043cc2420ddb1488974c53ed",
    "b72dcaacdb8763a66626c535a1d150b1b11d44aa5cc3132b6b12df2a25d520ac"
  ],
  "juggle": [
    "AYb8PmGJ37HwIMwj",
    "234b65d3bb2fbe70477514a5852662437693ad4e85d0834ff9693758348540df",
    "7251814761e60798b985c28e3eed5f2679503d9c7a01061d649fe45b6318dd0a"
  ],
  "just-as-planned": [
    "3My19Wif5ks29tyg",
    "b628dcb730dc94e032ec0b08449c053dcd241be4522d8ef06807ef856a3141ab",
    "98603d76e3b9a2c885fe4d070068f7329d0927eabf25c67a509afdd3b8288f11"
  ],
  "just-one-more-thing": [
    "YluQPhevo0LKdF1p",
    "a8374258ffc2f7798cbb4534393433b4f9ff8dee94724016bf0bd111e3c18e26",
    "b6cbb9625383899fbb1a0515a664d55db63f0c0c30e025a796e72b14edecb962"
  ],
  "just-the-tool": [
    "cB6K0wkiDhduAjtL",
    "5d60bac28a9ef3e799e806e47712f63855be7e47c3a151819dd5b82f6b90e621",
    "fa8451eb30ac7164f70188790856525e7a05670667f6fa2031ed6e26b76cfa15"
  ],
  "ka-stone-ritual": [
    "CZQgH17ZxoBiVXLa",
    "ad11fcccaa8563ea5751180a584d76291d62c8d2cdeded3322be44183825af4b",
    "4877ce9582890cb5646ed21ddefb31115ef425bddd19c36f50a783fc489354e7"
  ],
  "kaiju-stance": [
    "RwOGkOLCalt4sqz6",
    "98730c290c9e8c7829edda2111e3c0abbbf48e8e40417d9a945b29c67604a353",
    "0a5a7f9fd86fe8ca0f4430c130f463bbec07d19ff9aa734ee5ca88a7f7ead370"
  ],
  "kaleidoscopic-entreaty": [
    "3zcjIjJ7ujldN3zr",
    "a9d8aa9e8766c94339ed9e2340204cb5aa82d50b9188f48d1ea8f32f7040eee2",
    "0e224239d5ab6392152bb728979439df5f7bb3fab57e1b41794bcf0b5264b191"
  ],
  "kashrishi-revivification": [
    "8VXYwHE5LqAGRGTB",
    "9702a3c9e7efa239acdc5b7ccf692eca01d0757cb5d0ebc60fd6afdcea45fd62",
    "5781c6c8666085de80cfd077c7724a8c439850af5ce1cd31684e6a6d429d6af5"
  ],
  "keep-pace": [
    "OzvvsyjAWWij4mmm",
    "2a15c2eda8b2f1ae23e30053b32c4e9cfe233d8c4ed080b585478c4ea48035dd",
    "cb75c9acfc3cb57386641b25118e80f98894fa9e3a3d80876eb8ece7fd4991fc"
  ],
  "keep-up-the-good-fight": [
    "DYayudEG8sZRB3Ot",
    "dcb475f2a4d4b1800d219e491e31d622c2d6690507c43159efb7979fe8a15e8a",
    "580e80ed23e9b3f3d6c6f9a365c1c4429fa43e2b1d8ca2a3339d3ed5b0fc3537"
  ],
  "killshots-report": [
    "4l5SeMRn84HKslVA",
    "cfce83494cef00a7e36b7b2f4c92f44b7e44135278403bc8bf0885d713583f56",
    "c6c2331563af417896351be331d481b64da6113adf463898fb628ab69ed1ce54"
  ],
  "kindle-inner-flames": [
    "ySeT8hrMEPF9AsQu",
    "d85b1fbafca1939a98db79659003f1b870fcc285c9d0ce40e3a528f58eb29eb8",
    "3b6d59357de598f23dd90414303b6642f6c36f2251eaef95f32727e1ff5c80d0"
  ],
  "kinetic-dampening": [
    "stsCnc8hR6db1Get",
    "2abb3444992996c9e52ee2edf5c961917ef789cfa449085ebc0ea702c1762fab",
    "ace9335f205ba11667502e8ae4599caf99abf90440cac38e8591d75763e22dfc"
  ],
  "kip-up": [
    "gBSPbQRXdagZTUwY",
    "d62535ba8bf449bc90d5c2a999ad422cdd16a283f8d5e3d72dacd263b47009bd",
    "749aba9a06119f8a64a8cdb748d61da440660199bd7775cdf7f34cc048cdf1e5"
  ],
  "kneel-before-the-rightful-heir": [
    "h0gwBDI61MxkvVPC",
    "4d0e039eef2138b337d1c66a1f2761f310ccbcf93445013302ed43e329426261",
    "a8356ab32e057ceeda24236bea473e35be17c13d289d0792af85f012a3a98ba1"
  ],
  "knockback-spell": [
    "ezFFYqOgmxzo8zKU",
    "4a667703ba353ead5f632f202713512529d31a5fd749142ec0b6f60b71ef9a1c",
    "3388457586fd530e44b56a87fb41732ab41743eeaf98b7d4f6a0ad7f6e388cbc"
  ],
  "know-oneself": [
    "shp63QZvw9xvkVvC",
    "1778f9c8b6ebe331d79f66e329dc67cceb8168011da9ffad8721103cdb0cd56a",
    "37f905dd387505686dd7544faab46b7d4e6111095bcce5c731e2ae76a52e988a"
  ],
  "know-thy-doom": [
    "fs2zVzyXrn5yqGqd",
    "6097c2b8eb8099d95829b48eef6b40d2305fabc94ed5086aad747211c827e40b",
    "02c5ab4ac9d77dfadea29b95d2897ad9fd5c25b34d5d237f2a7ebfd501721379"
  ],
  "know-your-enemy": [
    "tlqz29fgp45bjSg6",
    "8b678bd1effcc9c5a0a550ed16cc6bfe54a0e0a01005c38811ac8fe7c47894f0",
    "e20963eaa22d9433b970ab1c05869b1be221149e094a6cec2a17aee16c32aeac"
  ],
  "knowledge-of-shapes": [
    "zSWTX520paO6Zv1i",
    "642490e85edcf5253b0ad68916b6cb92fc8a914c5ffd320f330c0026ec97d542",
    "dfd96019e9c62e867be40583d2a5c859f165ffd78edd9c9527cbaa4313f833b8"
  ],
  "kobold-breath": [
    "PPUNMjRLQYnmwQvF",
    "4524a99309b995d64fc4f073fb6fb3cac7f85e273a3f4090af2ef178653d5211",
    "c3ac443dc6915fa7050c442e8b884010542462cdf8bc14ac464f2b6e337c769d"
  ],
  "krakens-call": [
    "aa8Qbo9D9WVeOGN5",
    "704ab8d1556e0c6a3bb46c13761c4e227550fd81c8dbb294fc9b5427f1bfe6ac",
    "0cc433b078bb399a468246b332614fd329b4d5c2c5693a673cd87380f78c2fed"
  ],
  "kreightons-cognitive-crossover": [
    "kIXFNPFBStOKunq4",
    "485457993f587e3dcfb2fca0ac7b0366c798ec07d0a866d99866f57a59bbe2e8",
    "d1acfb46048613aaee0cad50085484a2838319725194b704c0c796166b7f9944"
  ],
  "lassoing-lash": [
    "9O7DLcXVXpwLVXI6",
    "c7ca70111b31e0e52139f0adb3d2b389fd660351cf3737f2269528d43c425b78",
    "6a0b4b302c35176359c555b1a0d2b24f4932dc43c124d7d529e1589e5deb69ed"
  ],
  "lava-leap": [
    "OFCeTaAX99YbXOu0",
    "e06bd58720b90f0039082694ed19aee216f629d5c4864c442ea5ecab056e6e37",
    "310af4fb89bced97ffc5a58200c8436e9ae8e4681712ddb0b7486c5cd197b840"
  ],
  "lead-the-way": [
    "TW0fUdqqB69rIbRx",
    "54c850c8c585e72515d79ca3fc6e92ddf7a7bb0df63c3027037352aea100f031",
    "577e015f9885397f509d45fd5719a31fd5fbd5dc2a508251677190e239b3cfca"
  ],
  "leading-dance": [
    "ZHPSASbvbbshq1zG",
    "d9965287487907f933590ef0e937d9d3811399a1d2a4b771d16c8c5ba1eb38d6",
    "03df774742f944503fa26c8ff59126bebb66bb41187fa82b2e4784e927f7e6a4"
  ],
  "left-hand-blood": [
    "7XA3Hm2md2tU9pEz",
    "1efc74ac6703c3d5f33cd2a600e6b3c595dbc0ec47c37a43ae280241e20e6145",
    "de8dcd53a25ce8263c24434f4425af65b8c240dcc890eacf480749f3400ca2e8"
  ],
  "legend-of-combat": [
    "iUds1xfU9WtKGPMf",
    "ffcba91457a1a9e0ede617ffce85205a2104e38415e257d258caadd27daf5c8e",
    "8760cecf943fc3a8d02616c841c84ca1031982909458ecdda37c30b7ca09148a"
  ],
  "legendary-negotiation": [
    "A0TNeMNvyY8QpmLz",
    "acad490d71add295181df20d96597f2d0890601d2a9815330d8ba2793ec43d56",
    "b2b04a6b344abd1ad167678ef890daeda87b8a3c52f4658014f41995872bdc4c"
  ],
  "leshy-superstition": [
    "fYVFBnv9aVHv1UNg",
    "1a949b6d0b381fcf32b5244be6623efaeae1806562cb4f045d3eef700d437718",
    "23aa6f015b0b6b19be51b360a1818bf1606403eb9022149c6ded277d760c3742"
  ],
  "lesson-of-mutual-gambits": [
    "m9lf0M1h72tMIBKm",
    "82f1078ff71040991f9c9ee3a47ad6903261066c235f9a97955b70a8521e48dd",
    "6c289208b8e7857869d04e62667a39f995140427bdc444d23e6023c5f0f81ddd"
  ],
  "lesson-of-sympathetic-vulnerability": [
    "8oTv8BRweFeBqtm0",
    "98037eed5469be9e020a61d16786133bf72269cd3bb788c59b5a26f2842cbb94",
    "8548cb52688663437624b005079b8f5a3143a240eb38287f89bf131084c2e864"
  ],
  "lesson-of-the-broken-wing": [
    "CyvXimmSlpbOlBhX",
    "902033db00f99c3783038d06454352a1741da92bb7b7b178e584af914c7cff39",
    "295b7a608a3ddc611a7f9623486a070bca2bd1c7cfbe025d27ab13148e8ae02e"
  ],
  "lesson-of-the-circling-gale": [
    "dM3hbn5ogp3oajWg",
    "28dbd29485589efc24d29fde404ce3457e1b4d68fb441c15bdca04f801017b6e",
    "ff087cf5503740d3177c00d06f0ef6f19b9adceb2f03ac1cb20a2d5a368285c8"
  ],
  "lessons-of-flux": [
    "a01E0vIphNQrzBd1",
    "2b8364109754d7dd29798142120faef9ad9271924ddd91433552ac0124fe46e2",
    "42be8f5b16c6ba29f655c957ddde8ef59f700a1f13d87bd505e01a899c81f08a"
  ],
  "lets-try-that-again": [
    "XKAPPvPpS4b8rSFp",
    "2540f43eb73a3783fe2f319f9e1801734cff6d46a9953003d3209996b91c0803",
    "9c5dc32f2c66c312d38228671198e6c4c7d914a30e141d0d70cb53c795991e08"
  ],
  "lethal-edge": [
    "Xz9jmwwJnx17PjCu",
    "99425673db2dfbaf55760f241ccd3cdd909f58059506ae13da589a39bbe04c40",
    "b35d7320445e846ea9731471e36a40bd6d4c66045ccda203fbe70c5ebba9c589"
  ],
  "leverage-anguish": [
    "7OXTqBA6QgCatNwZ",
    "628a9fa0da13398f331cea1581910ff0be35a44287adb1d476c49eeff2e95053",
    "9d66d95884e748cda1c421a82db386d5a552d2ee1044b77e3733fabfcc3460d6"
  ],
  "levered-swing": [
    "6qIiczSzuOmp0yRx",
    "6b765f5ab614ac1bf6fcc1e2a172ee44d47079cbe3444e75a59aa0b5cb2ef824",
    "7ef5fd41dca27d428c07035d5fddbb8ad22e073500da68d3d49bdd16e5935a4d"
  ],
  "ley-line-conduit": [
    "BQkk7qSSRTFc5jNG",
    "be03b0bd19f0cedf61babf57ded9e58a84a919239e45dea73b87e8a5b4fea63b",
    "d585b9b7056452de65e0167421580a40b60c6423ec723619792944091973f958"
  ],
  "liberate-soul": [
    "8rKzUpDxAi8tMk7I",
    "4ff2fd39b8e88ac23e5c31e4ec4242534bc2f5769921d7aab36f89a4470de069",
    "9b8dd0b8af303c218efa15d97b1de288c6f682b827f769fb6eeb8748c2f66258"
  ],
  "liberated-mind": [
    "kF7dYvDYcoBABmLA",
    "dc969edca5bac0a262669f5d406d5f7d6e559cace15273efd80ecb3f72fcaf5d",
    "86263dfdf945cc0907bf7a311c2f6795089e32c7cb765962b083f7e3cf6df6db"
  ],
  "liberating-dive": [
    "aUhx6xKOhPuK9fEZ",
    "1c715610848cdebd108e66e9058d8f97aa6a9491594859d97fa798bd5ebac27f",
    "8b38b32a116355bed123d4f2ee7b41e773bc642b371a61b3d13cb688e444f402"
  ],
  "life-leap": [
    "aOIZvx5fx5jVHHOO",
    "317642c4bcb1afdeda7b1bf22ecc050fda1cf72cead11c39fb540fde650c545c",
    "72a3b4efef73e806913482f80f66dfe9299541352824b0a03c21a53a45c8f03f"
  ],
  "life-giving-magic": [
    "hSzNtRNwrma81Eeq",
    "49f77b96ab834c16f5975d71debf45fce44722db8f9b8991ae8a361ecbb20575",
    "2809b5fb5a207ddfb293a1b3e0d6b159e82a4900abb3974d592a0a24fd816fd1"
  ],
  "lifes-blood": [
    "bebyS7XJ1Z3S4Ud1",
    "84cd3951eb8f28d02cea69d9969a4d9d678a7ac7c055f14c564d835819c1326b",
    "ed1c3fbbda20fc51dcdcf57046bc41c634ba212baca2bdaabe083e887b4ea76b"
  ],
  "light-paws": [
    "EdVMwFRNV1LX1VWh",
    "24469854fc54374c093f3becebdf53ec1744e050c42ce1cfc884ed91c37becd0",
    "d12c409b9a02ff2f010b3a0824cd6b722a1898df3fa70ee3080b5280a4242107"
  ],
  "lightning-dash": [
    "8GG4h6DbpAEGGETG",
    "ee8ed97036636c2175facb4037d6e2b7463002598d2f091330584a0b4da54136",
    "0575c4968ac1a7e99eba7881d90318cd6baf0b5aa25bc50ebe5e9fabedbf7b8d"
  ],
  "lightning-qi": [
    "ZhiO6FDz68VCWybl",
    "1e200ab303249a02eaa49c071e37824e9441d05deecedf2b9854728d7d0755e8",
    "1fbc14e891f500239e5a65af3e8480c633c67c0302b82322828494b9e0fb1873"
  ],
  "lightning-rod": [
    "GabSQXUprub2eyUm",
    "3dfeed9cc69aa9f73f4667412e912817d8a486c6f7e2cdb23cadbddd08245451",
    "2b2e8579e77e87d8e1947b6be3fc5269708bcbd93782cea463203f42cb919ac8"
  ],
  "lightning-swap": [
    "657SMUB2N9VZOgYp",
    "b2d8cc0dcf74b179145440b078c7baee269d1c0c71d37f602d1281e2ec0da9ef",
    "460cbb74b6e937d07f594e152f6b41cd90a8571fee352a2c3b1fcd4e117c16cc"
  ],
  "lightning-tongue": [
    "qzalwa2Ze3dIqIrA",
    "cab41fd2ccff1177cee2d303590b8cac105b7c33ab54b6c7d3aef801ed41f137",
    "5b133bac5e89019cf115f990956069b4b1ee3db5f5907c3c3dfc8263070ca8f9"
  ],
  "live-off-borrowed-time": [
    "keCkeRzBANPgUG8M",
    "93a202c010b3b3c90d0a17dc9860df9acfd47fe614cacee396745ab4a0320244",
    "d9813d46b02e7e8f6291649e7c057ccd1107f8dbee098b5aa0500eaf1b3bce3e"
  ],
  "live-the-creed": [
    "fUvV0zsNf1Rj0eox",
    "52f1877b6eda27161f1eba9794fe4e37fc19c1db23340f4633dcab530e1c2568",
    "cffdc6845b591e1055be224a5badf67e1cc9fca5cf77f6e219b90beac00914c4"
  ],
  "living-bonfire": [
    "nvahDuuKRE0T8Sh9",
    "a5d384824dd1ae60654df040a797be986be060c3fe2a0db61b60fd40486cd0cd",
    "fe424153f64f60580bbf979bdd569a7a46f6756c112f18c64eabb016e1ef49f4"
  ],
  "living-for-the-applause": [
    "CL43gGiErw5FUtFQ",
    "9621b019bddc6784181679974d9ede5a3e6892bee3438a3ca50d3b7de3cca08b",
    "4f8712e300b54acc8dd61b8db74a4102661942d47c18344f919d8499d27038c9"
  ],
  "lock-on": [
    "McnLGEZnUbtYCNDW",
    "77fd433610d359df26197b4db057c7a46e01d013930866d8479c981476f1b3da",
    "2d6788d324364656acf4ef193b86c5300dae466ff558e4149305953b84c57cb7"
  ],
  "log-roll": [
    "SjJ8BOy5sc8p2H5E",
    "649236f554173e42158177fd9488c978046590b87ae5397f811dfdb95db6db17",
    "e316dc1367fc828335607cb095ce49a8442cbab4c8b9164444a022bdbc1f88a6"
  ],
  "long-nosed-form": [
    "WPz97m5FNlbLIQ6p",
    "3fdfd47449574b1325843f18fd14aff031d46a9744117d3e3f4b491241b65781",
    "39c779f90bf8b9adc07b4b42d2d9ec16adf8f28ed7de6291e5185ed20955b30c"
  ],
  "look-again": [
    "blOiU4LPlBjVHcgR",
    "2250a4923e5a4d60c153e64f2c87ebf84acc79eab4b7b6f2d269642f3abfd2f9",
    "f9f436eb1f935661ada5c5936ef84a6e60ee3b5eb2d5c0fb76d347f47abfe821"
  ],
  "look-but-dont-touch": [
    "k2L9p4cc8RrHufut",
    "5e3944c0af6f43163c2c3202b8db702894aaa115610c28b20475176a85996792",
    "ea6f8fc90aae0795df4c1e4cb9a3e4f6e860b56a637789ff2e1a9ba896463038"
  ],
  "lord-of-the-fiends": [
    "apz0n3Q3gWvQVChT",
    "4caf637b0de174924fdb0744bfe7160204bc512bab4c6c0689955f85637451f9",
    "51fefd71f88d85a8fecac1af8e91a46fed4828a393146a87fc13416633a91b33"
  ],
  "lose-your-chains": [
    "indcWWwZ2Mg7j9eB",
    "53dfd74de5d481afe97d73fcd356e1b7470c66f0c5e5a02c7fa7ce5179f065d1",
    "04980a6e4398aa006265bb3023e91b14346fab4bbb87f080d75f72026d896e48"
  ],
  "lucky-escape": [
    "Xb8CyW9sYS27ElcC",
    "8d18282c2df55615217a69a0b72b0b276a9f3d459bedf042afa5363ee777d9fa",
    "bc2ed8760bfad426bb7bc0abbcd4f9cbf8da81ddb63c6ca503f2234ed2ef0c51"
  ],
  "lunging-spellstrike": [
    "5tlTRfyPXkGS9Coq",
    "57c800ef56bc93eb6d0477c4457c713fa9b293d80899a0680166e755422d9ad6",
    "8573840e6c5d2f28bbfd358e65cf3d980468d0d87f7ccfa89385288724e3bceb"
  ],
  "lunging-stance": [
    "ZghzLmYgeE19GqjP",
    "c4efc572680b447cf275576dc7f5adffd605ebeca3c059d1548a4e1d4ace500a",
    "6489ec06a08daecaee50368eb87a45b00d0ee19058a5e31551391e7ad7acce52"
  ],
  "maelstrom-flow": [
    "yzBlvtPcjhRHFvp0",
    "31769783b68d1e9320af9c31cf26ab5be1808e355008446e222d3a0ca80f39d8",
    "452335929fabe3c67bbb2def2a3bb5c5e8e8b3ee4176960cefccb63882375e0a"
  ],
  "mages-field-dressing": [
    "buUSr6Dh9md9WqJx",
    "97422909b56f201e218a3fbdc477736a9ed2bf59f8c2ca7840852507e9249613",
    "f5107f00b1b16fb3ef2a33f426300d62ff188926acca06789308246c71ee965e"
  ],
  "magical-onslaught": [
    "pfos1p4SurbUgpjQ",
    "c6e1226d81f31392845d038279bdd161d2a8423f9ddbd0e659f0543df3321ecf",
    "d33f3292574df087284b3cb33e18954bba65b7f65d39ba64aaa31695e0c97897"
  ],
  "magitaxis": [
    "z986NkK75cCcxTlB",
    "00f9b21ed98712512327615eb72de6a68dd5d58bcf4403e7f8c1f7f1d618f024",
    "c32ff10b1e4d9ead8e84097233a3ab1e97cdafea1bd173b2f997a3867cfedef2"
  ],
  "magnetic-field": [
    "YJCAiNpFbX2MIc0G",
    "6fb9a1448c4822fb36c2058f9f96b9fc3b6f959e7f10fc1076cc284ef37cacee",
    "c44e664f1b9019b60e2461613d95f4831a1f3779ac51ed223aa55d71e64d0c1a"
  ],
  "magnetic-pinions": [
    "IAo6UeLgWqG7KK1x",
    "6e6b935193d836ac3e75ced8ffd1c6229e079b4812dd699577be4d04f31e3f01",
    "98e75e35fb42bc4ded76091ad25a10904cb6c28dbdf1d0633c38cc424c788a65"
  ],
  "magpie-snatch": [
    "NBwH9wEeUfKfOg8R",
    "bbec9d3ae341ed2d014dcb00cf5dc9c4007a1957969f8447e4c01ee5541680a8",
    "f7bcc8bc8f20ce67d651f9c04f0c2dc1e2084e5e561a90bc00c0b67271304304"
  ],
  "maguss-analysis": [
    "0yPbPVEESwB6Bdfw",
    "f636eefd34e9bfc032b0e7027ae302b4e03f0de295e0159467fcea2af82d0ed8",
    "5df0558f8320c249d7d0d883a0ba8c68a5744c3863dfccfccf60a7aef2450e32"
  ],
  "maidens-mending": [
    "Hmgy0GJKIawAiqHE",
    "db48e530b96e040cba26fa10f7fbc1490d7c85821a4ab5890ac64ec9d510b338",
    "6bf1cc0a113cd4ceaa36b23690227ca43eea83407c0c5a199c9bcc8760aa4a96"
  ],
  "make-do": [
    "SveiYRnJQ2plYFJ7",
    "8280f9d001e1670653fae1171b6ea46da872fed9be4c467f37ce58a04505ab8c",
    "ccd4ba7a8e65a4248415ba2ed7df87f777f45940e62476c7346659e537299bd9"
  ],
  "malleable-form": [
    "okJjCvQ6hcCk8FOC",
    "bdd7852e0e02b8ca8f67f4b3a462df7c149fa0b3ce8b864f59674839ed13d6bb",
    "82e4a4e64af7850e08635325ca472ac6b8bdf608d6d1a43ec0e997b5d670a12a"
  ],
  "malleable-movement": [
    "aMI39DZhWgNgJTAn",
    "eaded0cc47300bf18944e4b78517f9770a239a9a013d1374c92775303424f184",
    "0c8c4df4c19136636c297423de7c2860e840446af05ed245c5929d415d5cead4"
  ],
  "maneuvering-spell": [
    "HJBDFHIaJ3lfxcbs",
    "81042639400cd77118c3b56a85fe822f6bcaeb2bb877fcf8da38a2d76bee4fca",
    "4ff9f7de9fd4ba7dd7e0ee47cb0d15bb3876045e9040626154562bb2ebfdc814"
  ],
  "manifold-conduit": [
    "2e2Rv6SN3D2nX5M2",
    "9c5dd4e87cfd67bcf97bde92865b19fd91354cf0ef748d2b36796587bea9a02c",
    "d835d41dfbe1bd84b762f065307dd25cf0db1fa5fd242315280f0f9e96e150f5"
  ],
  "march-of-the-dead": [
    "awSvRVuAYKrYMDhy",
    "b89507e16750ff48dd7d3a3381169f3df0166980c98e964fe07d05d646b8509e",
    "8e955e437ae3db21da08099fbd42660d867f952315c521232ff9a813af513f1b"
  ],
  "march-the-mines": [
    "2WiNIIvUfNxQoZH7",
    "eaccda3dba437227876cc45d65ad89eb9f3d96e85ecc415d42c2f78e61ba8b48",
    "411cc3723d4ae6241b2dd22f59f0898baaef511f1e61b9ce43e33ad6ff97d1bd"
  ],
  "marine-jet": [
    "8JA6T7XY6bzDQ9E0",
    "36db56223dd2f91f38a4a1030924a3f5a1c7df0c8dc923f4d42f88f5e3a776cc",
    "880a973e47d7c1fa4ad2d548c72834db155aa85489d10d840983479e5d74efc6"
  ],
  "marked-for-rebuke": [
    "k8c0E7YyeIQJjRzB",
    "460d71e62ac9667b2b38fc4f661d0f05e8c11840b12038d115bd07466f75d52f",
    "d6d435b89f37db50a363c29e7af909f798f84514ea30394853860489dd9f6566"
  ],
  "martyr": [
    "fFfRsvDavUsTBDF2",
    "7c614a0fbcfe507ab0f30f8ac3a839d08fd26088b31d5d2c80af2c071b95d5f8",
    "8ee559b52e32a24c2246c67866c99d2d9b1fd38516da09e778341778a24a349b"
  ],
  "martyrs-parry": [
    "fGwd5g6yHzcyeCG1",
    "996641afc66c543e0314696fb229f9097aec769c2cc0d103b74a80ee046b3aa6",
    "e1496dfaa4a3861c947c514bdb166a8494ed6f09a776bd37d6b2c8635e75e851"
  ],
  "mask-of-pain": [
    "ByqxxJkJiNFtjghh",
    "024c5363a727d15f92e6a50759504ca8fcd4af6ab7e32fb44d000bcc8246b572",
    "deba2aee79847303858927f7dad7dbe98986dba6f6c084684a03d7fac18cd1c2"
  ],
  "mask-of-rejection": [
    "vxE9hBKB6F2ctOX3",
    "99f369a212c73d1d25d7f9083c54207fcdc6dd64b1ef294c9e0a62d188655bde",
    "490550945697ddd6e7423fc5074859fda848d18df7c69d4d8a9fbcef12e89ff7"
  ],
  "masked-casting": [
    "4xeDjt8eARzAGARP",
    "4763d3766d04370a6d393a3e6c6c7dc183793076a097de69cd3f1a8834dd4dc4",
    "fb460f5f6ba20419a25fe8d17fd6c60342e90023733898379204537d505d670a"
  ],
  "masquerade-of-seasons-stance": [
    "KMVXUgFArcftg1jQ",
    "794ab16fa0feb2a8d50b3efcea7097b0ba916dddd8bca1c80f668b47b26541e9",
    "4ca079d5d6d671a38d96183f7ed1b442f467571061e78b7aee6c1fc63e2efb33"
  ],
  "master-of-many-styles": [
    "qX9ZtfaAj6rxrVA7",
    "79c6814147e83342392e0c3d553940336ed342284e5dc53c1e293689458cd541",
    "ab6b34ecadda3ba3ab04c12b5113e385258c805a5043548711195fa7606fa6e7"
  ],
  "masters-counterspell": [
    "EDdJFwarNIJIkP2E",
    "d5109ea2cbf47388bad1f0533552d7ced24c2afeb9418bdb514d37477752682d",
    "fe28fe32f544f2d902ffc47946090aff6312f5cde52c0bb371590cb3b891f2c2"
  ],
  "megavolt": [
    "hlX7jYoS1s6srZC2",
    "1fdef8c97adcbf797ba515e0d1e1a054bec28511fac5e207374a712329a48783",
    "4ccfc84abda06a290acce24ddcad9430997ff172ad49fdabc3d60fcbfc44d959"
  ],
  "meld-into-eidolon": [
    "s97nKj9Uye1KXr7A",
    "0e691a13aabef849a0f654603d284a64f4023e02c8b0746ea863af1aaadf62e2",
    "5bfc7be0719028181cc8e0a7758f68d26f5160164c71d4548bcc848ed47613b4"
  ],
  "melodious-spell": [
    "kh4bTBgi3C9CjwHK",
    "51c0fb357751ea0cfeda41df026d5177c384cacfd14b98d02665ef0f21384c25",
    "5bd3bc6bd66346b60f3cf49c1f8598f44beafe92a27aa6172f9c8164e425f125"
  ],
  "memory-of-nothing": [
    "4F7suRtLfcurHqFI",
    "0eb827b2640e74dcc3fab84cf7d9f9b35aaef9753a6066d7714112354915ab6e",
    "2b682e5f5d25312980ac2674772481279141a0bc62af22f79a7713ad28870a76"
  ],
  "memory-of-skill": [
    "7UDWeLq8OAL04gHR",
    "4fea0b9fe4558772e4388c8bea23a11f5a727de922f313edafd50600d0d31065",
    "074326b655b5abdd117d70deb6f75d7923913483868093a78674de3ef8a4399a"
  ],
  "mental-static": [
    "7PlGRHizgieuYzDR",
    "85c92f8edb7a223cd4eeb26bfa0b84d3651198d02b49128e0dadb8fced29a443",
    "c3c0205486617c3f717180418beabb40721309a62c26bc52ad0869d2853aa009"
  ],
  "mercenary-reversal": [
    "dCGg0nRvk8jUQxz8",
    "ae265f4817ab07bb673d9a6ffe56863ae9412896710f99f6528fd2cd759ac7bc",
    "185f9051b09d382c11d9f24fbe23fcc1e6d693c94f2833ddbca439cc1d11147b"
  ],
  "merciless-rend": [
    "R7EaZPYtsy5H8lwn",
    "4721e8b9942f11447c38640a28b9cab8eaa77c8add6f5df738cdedc16e31e1ed",
    "6f09db743a0b8d66acf56cc2b5bf468c27d950448592b113ce414e64975ac41b"
  ],
  "mesmerizing-gaze": [
    "gOHBzx5Rqa6TZcrm",
    "de31e480ccc2ef710b73e0e7ebf0bc8eb3e7728acb4ac198fffce92a86042928",
    "1070b6c247c24c256859c38c41774853d4d3b1034331973b41186d12b8db4a68"
  ],
  "metabolize-element": [
    "URtcR1BU2OgfKHfm",
    "3e19810937cab461ea30031d9a41fcf93f25df00076eb8151c45da765df64935",
    "1fd1e7a463a6c0afdf85117ddd33ad3962110a05d14c1fc23fab80d3b6e07069"
  ],
  "metal-carapace": [
    "HbdOZ8YTtu8ykASc",
    "d7064c576d8313b9fc18241dd71506ea8a9f2ce4b1f3214446df28f9d64bfc0e",
    "9875416a242e3721ae1f4ae8e9b463e7a1d642f9e67ef891398f7ef79c19ff6e"
  ],
  "metallic-skin": [
    "syyT2xBA4H72TpOt",
    "001a0e07bc3c4e1b1a53d8efc9f9648d49da51e9b7ba2a6676066398f57fb4a2",
    "581156a0ec6bba32adb39c11c3140c238f30cf6155960d9f01187050933a4f1d"
  ],
  "meteoric-spellstrike": [
    "stwRJTOKUru9AmQC",
    "7fafc43add69559244798d271dd1c6e03eb4b3c55396c3b16b6a853ad580a6f4",
    "f46a435a645093e370656f3fcdddececf03844ab59eb5e58a40eb7e1266ce0f5"
  ],
  "mind-shards": [
    "xaSlCFYUXlu5f0zw",
    "9ee10088e8c634d6844f59461c32cdc1b4331a9cb0ab2c4f2d4da68bd78db709",
    "258725fa83eaced618d27f4fea30eb754c91aa84ca90ea3e23c10f7a81151904"
  ],
  "mineral-deposits": [
    "BSrYYphRONIkM19m",
    "659b87b8c82ecdf0831d6a2ca49c822f4d982e6318d16f60ecc5b6d774eb8e06",
    "e1fc74725794d74e1cf719a67a1771f1704d3e378d94818580796d81c5e29612"
  ],
  "minor-omen": [
    "u8hKEb71pI45XP1f",
    "ea9f07b92097527b9559c223db86772a4b8bef21070035d98437bbdce0eecaf4",
    "417ed193c54cc5d13e43200e230b70a73a92ed4aaa19b0d47d2999e0ed03aa47"
  ],
  "miraculous-intervention": [
    "APfPNpUQlKlCAJkS",
    "8c519f5fcc47d25a6789b6b33623f4d0a87b20b7b3b63863ad66cd1d94c1707e",
    "fdbc3fd9b105748106479e1eff51c4065e54e8660453343e43ad17cc7f77cecd"
  ],
  "miraculous-repair": [
    "fEzxwMCNyvooYqdn",
    "0bfaceecefe902d9c40b1ef53d9402c967664a5b401bed91151e24aa471816af",
    "751686b92143629c9cbcf5c1fcf03aacf0e91008f64bedf5ddcdf3231fa1da9c"
  ],
  "mirror-refuge": [
    "Nb8iLgQeuHU73hQM",
    "f0dfcd3843d435166da90c23f296b3c5c6d189cc2a3f66f9ec14563a7f6c4cee",
    "5e1dad59a78354a0728a250a5a79e6a761644ed269a201b238699f393fd5401c"
  ],
  "mist-escape": [
    "h7KZXNRm1gLV1yTt",
    "fefa63d9a7c7c0c9dc9ccd63c1d27eb70ce8f224c14a55903da9748765ac6e83",
    "be42415e8cffe32627ae90c5440a226de8480de45a2ec4a4581e72e55f2ca271"
  ],
  "misty-transformation": [
    "EOYxsteDMSSZovfV",
    "fa7787a1af03571bd8cbaa2a49e016da6ccbec04682a4f8e46059a03b6d6eb47",
    "8f4a17f27444360d9eb8a432421b47ba45b4ef9370d3d70205ade5ee77dccd88"
  ],
  "mixed-maneuver": [
    "jCIBYryi6Y3JwmqH",
    "628594c2f57843e598adf5afa4eb0e218699684a4fa1d9a5632364e01a19be63",
    "7dd1538456679a5727a009b98e2fff25d48bb3f89eb37e07e36cdb6a5ac16dc6"
  ],
  "mobile-shot-stance": [
    "rByA8NDI6ZtNgBeT",
    "25f832e0d8d3d45298403122026d9dd38b1f93c6499b1c59a06b237bf285653e",
    "d0a328d76f6334e015e202e19cbeca0783e2e3c3364baa229067686da6f27566"
  ],
  "mockingbirds-disarm": [
    "WlgaSpTSGQQrHKlx",
    "533aa33e891bad93ae8065a16c478d3ff967b1f29279adb69d9beeb61168382a",
    "98d7c79fc1506e93a58a9f90aea17fe9daccbe6d7cb4471f3b54626bc72727a1"
  ]
};

const sha256 = text => createHash('sha256').update(text).digest('hex');

// Rows below were individually read in full. Evidence is checked against source.
const reviewedRows = `
bond-conservation|preparation|arcane|caster|retained bonded-item residue curls inward|conserve just enough power|Next spell remains separate.
bonds-of-death|preparation|shadow|caster|two necromantic strands braid around source|metaphysical twine|No new summon or attack.
bone-burst|elementTarget|weapon|target|thrall-origin fan of bone fragments|explosion of bone shards|Origin is thrall, not caster; outcome conditional.
bone-spikes|form|weapon|caster|spines emerge along body silhouette|tear forth from your elbows|No immediate Strike; awakening abilities separate.
bone-swarm|form|weapon|caster|skeletal silhouette disperses into wide orbit|whirling storm of bones|Later damaging activity separate.
born-to-the-trees|targetSupport|plant|target|leafy climbing limbs wrap ally|Target a willing creature|No automatic leap or relocation.
borrowed-ability|absorb|mind|target|touch-link memories flow from target inward|pulling skills and memories through|Save conditional; no guaranteed skill transfer.
bounce-back|restoration|healing|caster|low vitality ember rises after collapse|recover from near-death experiences|Does not restore additional HP.
bounce-boost|targetSupport|wind|target|springy foot-level upward assist|springy legs to help others|Ally actual movement separate.
brain-drain|absorb|mind|target|target mental halo siphons into source|siphon off a creature's mental energy|Save conditional; no guaranteed focus or stupefy.
brains|focus|mind|caster|consumption sparks remembered synapses|synapses long rotten to fire|No attack or additional eating action.
branding-spell|preparation|fire|caster|faint private brand forms in casting focus|next action is to Cast|Brand target only after later spell failure.
brandishing-draw|strike|weapon|target|drawing crescent continues into single contact|draw and attack with the same motion|Only weapon drawn; finisher choice not inferred.
breath-of-hungry-death|elementCone|acid|target|sickly gas cone spreads in thick layers|massive cloud of flesh-eating gas|No unconditional paralysis, death, inhalation.
breath-of-the-dragon-dragonblood|elementCone|arcane|target|ancestral throat glow opens into breath fan|shape of the breath|Element and cone/line depend on exemplar.
brightness-seeker|focus|arcane|caster|slow omen constellation gathers overhead|studying your surroundings in search of omens|Augury result and later reaction separate.
bring-into-the-fold|preparation|mind|caster|earnest voice ribbons form inviting circle|next action is to issue|Ultimatum and changed attitude later conditional.
bristle|guard|weapon|caster|compact curl splays defensive spines|posture that splays out your bone spines|No outgoing quill attack.
buckler-dance|stance|ward|caster|small shield arcs rotate through defensive angles|spin your buckler defensively|No attack or document shield update.
build-the-first-walls|groundCreation|earth|target|upright dirt segments rise along chosen line|create a wall of dirt|Visual wall only; placement requires location.
burn-identity|teleport|teleport|caster|appearance echo burns away into portal haze|transport yourself up to 1 mile|No token relocation or guaranteed memory erasure.
burning-demand|command|fire|target|small target sigil pulses with voiced command|faintly glowing sigil|Ignition delayed and conditional; no flying bolt.
burning-jet|movement|fire|caster|rear flame exhaust drives cosmetic forward lean|burst of flame shoots behind you|No token relocation or free attack.
burning-spell|preparation|fire|caster|embers bind the next casting focus|enhance your spell with elemental fire|Later spell damage separate.
burning-surge|elementTarget|arcane|target|spellcaster-centered unstable magical flare|triggering creature and all creatures adjacent|Damage element depends on triggering spell.
burrowing-shot|ranged|weapon|target|mortar launch followed by concentrated ground punch|Launch your light mortar|Area blast not a personal aura; exact landing selected.
by-your-name|rune|arcane|caster|name-shaped diacritic assembles in focus|craft a rune|Rune invocation and damage later separate.
cadence-call|command|music|target|short marching beats ripple outward to allies|call out a quick cadence|No forced allied movement or guaranteed slow now.
calacas-showstopper|performance|music|target|instrument-breaking discord expands into sound burst|stunning blast of sound|Save outcome conditional; auditory not mental projectile.
calcifying-sand|guard|earth|caster|body crumbles to coarse grains and rebounds outward|becoming coarse sand|Petrification conditional, not a guaranteed stone statue.
call-and-response|preparation|music|caster|paired answer-ready note rings interlace|call-and-response chant|Later composition and ally response separate.
call-from-deaths-door|restoration|healing|target|fading ally light rekindles with broad life pulse|triggering ally loses the dying condition|Observed ally target; no attack.
call-implement|produce|teleport|caster|small ownership tether collapses into free hand|appeared in your free hand|Only implement, not caster teleport; contested conditional.
call-the-first-tools|craft|arcane|caster|silk strands weave hand-held tool glint|simple tool, such as a shovel or hammer|No tool object creation or attack.
call-the-hunt|command|weapon|target|source tactical lines frame existing prey|instruct your allies|Not a new Hunt Prey mark or immediate Strike.
call-the-hurricane|elementAura|water|caster|concentric waves spiral around still eye|Massive waves spiral around you|Push conditional; native area scale.
call-the-swarm|groundCreation|shadow|target|ground-hugging scurrying swarm fills remote burst|massive swarm of rats pours forth|No caster movement; finite swarm visual approximation.
call-to-battle|movement|weapon|caster|fallen spirit echo straightens into standing stance|You Stand|Stand cosmetic only; no attack.
call-wizardly-tools|produce|teleport|caster|book-sized teleport mote lands at hand or feet|bonded item or spellbook|Only item teleports, no actor motion.
cannibalize-magic|absorb|healing|caster|equipment sparkle drains into restoring body halo|drain one of your invested items|Counteract conditional; no equipment mutation.
cantorian-rejuvenation|restoration|vitality|caster|blood-born vitality wells up in two renewing pulses|life-giving energy|Healing and temporary protection; no target attack.
cantorian-restoration|restoration|vitality|target|dying ally rekindles from a single blood-bright spark|prevent the creature from dying|Invalid against death effects or absent remains.
capture-magic|absorb|arcane|caster|resisted spell residue folds into cascade stance|capture some of its magic|No spell attack replay; damage type source-dependent.
caretakers-restoration|craft|ward|caster|broken held equipment seams knit with stewarding light|repair objects important to you|Repairs item rather than heals actor.
cartwheel-dodge|movement|wind|caster|lateral rotating echo rolls away from danger|Step up to 10 feet|No relocation; reaction follows successful save.
cascade-bearers-flexibility|preparation|arcane|caster|branching spell diagram swivels into new arrangement|adjust a spell|No new spell cast or granted effect activated.
cascading-ray|ray|arcane|target|spillover ray leaps from previously struck foe to new foe|originating from the creature you damaged|Origin previous target, not caster; element source-dependent.
cast-down|preparation|healing|caster|downward faith weight gathers under casting focus|next action you use|No premature prone or extra damage.
cast-out|targetSupport|shadow|target|possession shadow peels outward from affected host|cast a malevolent entity out|Counteract conditional; no unconditional expulsion.
cats-luck|fortune|wind|caster|catlike sideways twist reopens a failed reflex path|instinctively twist away|Reroll only; no teleport or guaranteed success.
catchy-tune|performance|music|target|catchy beat loops outward with alternating dancing accents|can't help but dance along|Degree-dependent; no forced document movement.
caterwaul|targetSupport|music|target|urgent yowl wave catches ally before fading|calling your companion back|Remains at one HP; not broad healing.
catfolk-dance|movement|weapon|target|blocking footwork weaves across adjacent foe focus|always being in the way|Check conditional; no attack contact.
cautious-word|guard|ward|caster|spoken syllable snaps into renewed shield plane|immediately cast shield|Defense source only; slow consequence separate.
celestial-cacophony|elementCone|fire|target|firework pellets sizzle across low cone with sound rings|fireworks, sparklers, and black powder pellets|Ground cone; unstable alternative separate.
cellular-reconstruction|restoration|healing|caster|internal cellular lattice expands through three recovery beats|cellular functions into overdrive|Later round healing not replayed immediately.
cenotaph-stance|stance|ward|caster|immovable shield field plants at source feet|place where none will fall|No automatic ally block; moving ends stance.
ceremony-of-protection|guard|plant|caster|overlapping shell plates close around silhouette|exoskeleton to overlap itself|Physical exoskeleton, not spell cast.
chain-infusion|preparation|arcane|caster|branch-ready elemental beads connect in casting focus|next action is an Elemental Blast|Actual hit-dependent chain belongs to next blast.
chain-of-words|lineCue|force|target|glowing script links two rune endpoints|chain of glowing script flows between them|Rune-to-rune origin; no caster fan-out; immobilization conditional.
challenge-insight|command|mind|target|spoken contradiction disrupts enemy casting halo|make others doubt|Counteract conditional; no guaranteed stupefy.
chance-death|fortune|shadow|caster|failing life thread rewinds into second chance|reroll the triggering recovery check|Reroll may still fail; no resurrection promise.
channel-the-godmind|focus|mind|caster|ordered axiom lattice scans surrounding space|parse near-infinite variables|Sight enhancement, not stealth or invisibility.
channeled-protection|targetSupport|ward|target|apparition residue spreads to adjacent friendly shields|protect you|Source and adjacent allies, not enemies.
channelers-stance|stance|arcane|caster|open spiritual channel streams steadily through body|power to flow through you|Later healing and damage separate.
chaotic-spell|preparation|arcane|caster|unsettled elemental fragments tumble around spell focus|no idea what will happen|Next spell random type; no preselected sonic attack.
charmed-life|fortune|arcane|caster|danger-facing lucky glint resolves before defensive roll|haven't rolled yet|Bonus only; panache conditional.
charred-remains|preparation|fire|caster|casting focus sheds low ember trail|leaves embers in its wake|Future area spell leaves terrain; no immediate terrain.
cheat-death|resolve|shadow|caster|near-extinguished silhouette catches on thin life filament|escape the reaper by a hair's breadth|No broad HP healing; doomed cost remains.
chemical-purification|craft|vitality|caster|reagent swirl consecrates newly mixed bomb|chemically purify and consecrate your bombs|Preparation not flight despite incidental on-the-fly wording.
chromotherapy|targetSupport|healing|target|colored lamp beam bathes ally in recovery light|application of colored light|Assisted recovery conditional; choose correct recovery color.
circle-of-spirits|focus|shadow|caster|one attendant spirit dims as another brightens|becomes your primary apparition|No summon or additional focus restoration.
clang|movement|weapon|caster|armor glint rebounds into aggressive advance echo|Either Strike the triggering enemy or Stride|Alternative actions; do not automatically depict both.
clashing-compound-invocation|rune|arcane|target|opposed rune waves collide into disharmonic target pulse|destructive magical harmonics clash|Sickened degree conditional; no invented damage.
clean-take|fortune|music|caster|performed mask dissolves and reforms for second take|refine and tweak your performance|Reroll only; no mental attack.
cleansing-light|restoration|light|target|horn light fans through allies and dazzles enemy-facing edge|burst of light from your horn|Restoration and enemy dazzle; no damaging projectile.
cleansing-spell|preparation|healing|caster|celestial cleansing motes gather around healing focus|next action is to Cast a Spell|Target healing/counteract later.
clear-as-air|concealment|wind|caster|compressed air layers refract source silhouette|diffract and bend light|No movement; repeated use only conceals.
clever-gambit|movement|wind|caster|informed lateral exit follows existing critical contact|assessing your foe's capabilities|No extra Strike; movement cosmetic.
cling|targetSupport|weapon|target|short hand-level tether grips adjacent foe|hang onto a foe|No repeat Strike; not allied support; target attachment conditional.
clinging-to-life|resolve|shadow|caster|one life ember persists beneath lowered ghost silhouette|go to 1 Hit Point instead|Still prone and unconscious; no standing triumph.
cloak-of-poison|stance|poison|caster|toxic secretion coats outer body edge|cloak of concentrated poison|Reactive contact damage later, not target attack now.
close-contract|resolve|arcane|caster|completed planning lines close into reassuring seal|a plan comes together|Temporary HP only; no healing or attack.
cobra-stance|stance|poison|caster|tight coiled defense frames fang-poised hands|coiled up like a lashing cobra|No immediate fang Strike.
coerce-the-current|lineCue|water|target|underwater directional current sweeps along line|direct the water around you|Save-dependent push or pull; no forced token movement.
cognitive-loophole|resolve|mind|caster|mental constraint ring opens through small deliberate gap|temporarily overcome it|Suppresses one effect temporarily; not counteract cure.
collapse|form|weapon|caster|skeletal outline disassembles downward into bone heap|collapse into a pile of bones|No automatic Stand or outgoing attack.
collapse-armor|form|weapon|caster|articulated armor folds into compact belt-sized shape|compresses into its compact form|Don/doff alternatives; no armor item mutation.
collapse-construct|form|weapon|target|construct silhouette folds along mechanical joints|collapse it into a carrying case|Target companion, not caster polymorph.
collapse-wall|groundCreation|earth|target|placed explosive flash releases falling wall rubble|bring a wall down on a creature|Conditional structural break and save; no bomb flight.
collateral-reinforcement|targetSupport|shadow|target|bony layers and ghost phasing reinforce thrall edges|protect your thralls|Thrall defense, not caster shield.
combat-reading|focus|mind|target|cold-reading scan traces enemy aura strengths|discover your foe's strengths and weaknesses|Secret check may give false information; not stealth.
combined-form|form|transform|target|source echo converges into enlarged ally silhouette|melding into their transformation|No actual relocation or actor merge; source and ally linked.
come-and-get-me|resolve|weapon|caster|open-chested taunt widens aggressive source outline|open yourself to attacks|Later counterhit/temporary HP conditional, not immediate.
come-in-from-the-wilderness|targetSupport|earth|target|earth cocoon swaddles ally and settles at ground|swaddled in earth|Healing emerges next turn; no immediate forced displacement.
command-attention|command|mind|caster|spotlight-like attention halo centers all gaze on source|gaze falls only upon you|Distraction, not caster stealth or target mind damage.
command-elemental|command|arcane|target|elemental animating filaments bend around command seal|bend it to your will|Control or slow conditional; no actual control mutation.
command-undead|preparation|shadow|caster|necromantic command sigil prepares altered harm focus|next action you use|Next Harm transforms effects; no immediate damage/control.
commitment-to-protection|targetSupport|ward|target|tactical danger vector becomes ally-facing guard angle|more defensive pose|Check may impose penalty; no guaranteed protection.
commitment-to-vigilance|stance|weapon|caster|alert reach markers trace guarded perimeter|all spaces within your melee reach|Difficult terrain cue only; no attack.
communal-sustain|targetSupport|arcane|target|source support filament stabilizes ally casting ring|one spell with a sustained duration|Ally Sustain begins next turn; no extra cast.
community-knowledge|focus|mind|caster|ancestral faces echo into focused skill point|psychic echoes of your ancestors|Bonus to triggering check; no guaranteed knowledge.
complete-the-heros-journey|restoration|healing|caster|three ikon lights culminate in wide divine wave|divine spark travels through each|Heal or Harm choice; do not automatically portray both.
conceal-spell|preparation|shadow|caster|casting marks contract into nearly invisible pinpoints|hiding the shining runes|Subtle preparation; do not add conspicuous casting explosion.
conductive-sphere|groundCreation|electricity|target|small floating metal orb arcs around its perimeter|floating metal ball forms|Initial fly or adjacent damage choice; no automatic attack.
conductors-redirection|elementBolt|electricity|target|electric charge passes through source into close target|redirecting it at one target|Source still takes damage; target save conditional.
conduit-of-void-and-vitality|restoration|healing|caster|unstable curse threads weave broad divine pulse|cast a 3-action heal or harm spell|Heal/Harm choice with conditional extra target effect.
confusing-commands|command|mind|target|misleading authoritative voice waves overlap from banner|bewildering but authoritative commands|Enemy confusion save conditional.
conjure-hell|groundCreation|fire|target|remote infernal burst opens under fiery soul wisps|brief burst of its fire|Remote burst, not flying bolt; spirit burn conditional.
consecrate-spell|preparation|vitality|caster|faith halo consecrates a focused spell charge|infuse a spell with the power of your faith|Next undead-targeted spell separate.
consolidated-overlay-panopticon|focus|arcane|caster|clockwork ocular grid sweeps environmental lines|supercharge the prosthetic eyes|Sight bonus, no attack or magic projectile.
constricting-hold|bind|weapon|target|existing eidolon grip tightens inward at victim|eidolon constricts the creature|Eidolon origin; save conditional, not caster grapple.
consume-energy|absorb|arcane|caster|hostile element curls into body reservoir|draw it into your body|Counteract conditional; awakening later attacks separate.
consume-magic|absorb|arcane|caster|incoming area magic sinks into source with unsettled residue|consume the magic|Counteract conditional; does not heal actor.
consume-power|absorb|metal|caster|metal gate catches incoming elemental sparks|hold it in your kinetic gate|Later metal impulse boost separate.
contagious-spell|preparation|arcane|caster|one extra branching target bead grows from spell focus|one additional creature|Next spell selection, not immediate attack.
contingency-leap|teleport|teleport|caster|falling echo snaps sideways toward high edge portal|teleport to any edge or handhold|No actual relocation; handhold check may fail.
convincing-illusion|focus|mind|target|illusion edges sharpen around observer-facing focus|make your illusions seem even more real|Deception conditional; no mind damage.
convocation-of-earth-and-moon|form|light|caster|moon cocoon opens into broad stardust regalia silhouette|cocoon of moonlight|Form and flight cue; no automatic attack.
coral-detoxification|resolve|poison|caster|coral filtration lattice catches toxic green particles|additional layer of filtration|Poison save bonus, not bolt or guaranteed cure.
coral-reserve|resolve|water|caster|stored coral energy pulses into fatigued limbs|store of energy|Temporary condition suppression; no permanent cure.
core-cannon|form|metal|caster|automaton silhouette locks into charged cannon housing|body transforms into a powerful magical cannon|Transformation only; energy Strikes later separate.
cornered-animal|doubleStrike|weapon|target|two opposing unarmed contacts break outward from flank|two different creatures flanking you|Two distinct flank targets, not same-target double slice.
corpse-killers-defiance|command|light|target|victory glint becomes allied anti-undead rally wave|victory to rally your allies|No repeat attack or new corpse explosion.
correct-the-story|fortune|mind|target|enemy success trail rewinds through corrective script|enemy must reroll|Misfortune reroll only; outcome not guaranteed.
corrupted-ground|stance|void|caster|low void scars trace dark ground perimeter|scarring the earth in your wake|Later enemy end-turn damage, no immediate movement.
counter-curse|targetSupport|shadow|target|gathered curse maelstrom collides with hostile curse knot|neutralize it|Counteract conditional; constant aura may return.
counter-element|guard|arcane|caster|single element control ring interrupts incoming matching wave|gain control over it|Self unless critical counteract; redirection higher-level conditional.
counter-thought|command|mind|target|opposing mental ripple disrupts visible spell thought|mental magic to disrupt it|Counteract conditional; no actual mental attack.
countercharm|command|shadow|target|captivating illusion curls unmake enemy spell shimmer|innate magic to disrupt it|Counteract conditional; slot expended.
counterspell-prepared|command|arcane|target|matching prepared spell lattice cancels enemy casting marks|prepared spell to counter|Counteract conditional; not damaging spell replay.
counterspell-spontaneous|command|arcane|target|improvised matching magic wave meets enemy spell focus|spell that you have in your repertoire|Counteract conditional; visibly fluid rather than prepared lattice.
courageous-advance|preparation|music|caster|rousing forward-beat notes ready allied advance|exhort an ally to advance|Next anthem and ally reaction separate.
courageous-assault|preparation|music|caster|sharp downbeat readies single allied attack cue|stir an ally to attack|Next anthem and ally Strike separate.
courageous-onslaught|preparation|music|caster|two-beat performance couples advance then contact cue|orchestrate an onslaught|Next anthem and ally stride-strike separate.
courteous-comeback|fortune|music|caster|failed courteous phrase dissolves into revised flourish|poetic wit|Diplomacy reroll only.
coven-spell|targetSupport|arcane|target|paired incantation echoes link source to ally casting halo|rhyme with your ally's incantations|Empowers existing spell; no extra projectile.
covering-stance|stance|ward|caster|body-sized defensive angle shelters adjacent ally edge|protects nearby allies|End-turn cover and later intercept movement separate.
crafters-instinct|fortune|weapon|caster|barrel sight corrects a small aim flaw with glancing spark|adjust your aim on the fly|No flight; failed Strike adjustment not second attack.
crane-stance|stance|wind|caster|wing-like arm echoes flutter into poised high guard|arms flutter like a crane's wings|No immediate wing Strike or leap.
cranial-detonation|elementAura|mind|target|fallen foe head focus bursts into expanding psychic shockwave|flickering consciousness|Target origin; subsequent detonations conditional.
cratering-drop|movement|earth|target|linked descending silhouettes finish with crater ring|meteoric descent|Ground contact and falling damage conditional; no relocation.
crawling-fire|groundCreation|fire|target|small beast-like flame silhouette forms at chosen ground spot|flaming pelt and searing claws|Summoning proxy only; later impulse or movement separate.
crimson-breath|elementCone|fire|target|deep crimson throat flare pours into broad wormlike fire cone|blast of flame|Fire cone, no projectile fan-out.
crimson-shroud|stance|blood|caster|red mist veil settles around source with slow restorative motes|veil of red mist|Later fast healing, AC interaction, death vanish separate.
cringe|resolve|mind|caster|pitiful shrinking echo makes incoming contact recoil|pitiful posturing|Attacker damage reduction, not target damage.
cross-the-final-horizon|charge|electricity|target|storm-wrapped advance ends in three separate contact beats|make up to three Strikes|Drain only on all-three hits; choose electricity/sonic.
crossbow-ace|preparation|weapon|caster|coverward lean precedes crisp crossbow loading glint|Interact to reload|Diversion or cover choice; no fired bolt.
crosscurrent-counter|bind|water|target|water tendril spirals from source limb into existing grabber|tendril of it encasing your limb|Grapple and pull conditional; no doc movement.
crowned-in-tempests-fury|stance|electricity|caster|brow crown crackles above lifting lower-body winds|crown of lightning upon your brow|Aura contact damage later, no arbitrary target strike.
crusaders-masquerade|concealment|shadow|caster|mask-shaped veil screens source from undead gaze|mask can hide you from the undead|Not universal invisibility.
cry-of-rebellion|command|sonic|caster|large passionate yell carries allied rally beyond enemy shock ring|fuels your allies|Distinct ally 60 and foe 30 areas; save conditional.
cryptic-spell|preparation|plant|caster|casting manifestations dissolve into natural leaf and wind cues|natural sights and sounds|Subtle next spell, no transformation now.
crystal-luminescence|stance|light|caster|horn-sized crystal glow opens steady colored light radius|horn glows with bioluminescent color|Light only; no attack or blind promise.
current-spell|preparation|water|caster|air-water casting currents form nascent guard arc|spin off some of its currents|Next matching spell required; no immediate cast.
curse-of-the-saumen-kar|bind|cold|target|body rune flicker raises fitted icy prison dome|sphere made of unmelting ice|Save determines confinement; no forced token move.
cursed-effigy|rune|blood|caster|taken body fragment threads into small sympathetic doll seal|premade doll|No repeated Strike or immediate target damage.
cushion-landing|movement|wind|caster|mount-shaped supporting echo catches low descending source|mount dashes to your rescue|No doc mount or relocation; remaining fall damage possible.
cut-from-the-air|guard|weapon|caster|short weapon intercept arc knocks incoming projectile aside|knock aside ranged attacks|Only if attack misses; no outgoing Strike.
cut-the-bonds|targetSupport|weapon|target|precise blade arc cuts ally constraint tether|counteract that effect|Counteract conditional; no ally damage.
cycle-of-souls|movement|shadow|caster|spirit-guided step echo settles into stance ring|Step, then enter|No attack or document relocation.
cyclonic-ascent|flight|wind|caster|lower-body cyclone builds into supported hover|cyclone that lifts you|Fly speed grant not automatic long movement.
dalangs-ally|concealment|shadow|target|source shadow puppets split toward foe flanks|shadow darts around with your foes|Flanking cue only; no attack.
dance-of-intercession|performance|healing|caster|measured half-stride dance culminates in divine dragon-memory pulse|glimmer of the memory|Degree-dependent Heal or Harm, no unconditional cast.
dance-of-the-jester|performance|shadow|target|source and target shadows synchronize alternating stage steps|shadow and the opponent's synchronize|Action count check-dependent; no actual forced movement.
dance-of-the-mousedeer|concealment|shadow|caster|small evasive dance raises imaginary foreground shadows|Imaginary shadows rise up|Observer-dependent cover; no universal vanish.
dangle-vanara|movement|weapon|caster|tail anchor echo supports hanging silhouette|hang by your tail|Not sonic inspiration or attack.
danse-macabre|movement|shadow|target|horde-shaped ground echo advances dragging contact ripples|horde Strides|Horde origin; save-dependent reposition cosmetic only.
daring-act|movement|wind|caster|death-defying flourish sidesteps enemy focus|death-defying maneuver|Check determines movement; no attack now.
dart-between|teleport|teleport|caster|sharp blink closes source shimmer and reopens destination cue|In the blink of an eye|No actual relocation; Part the Veil separate.
dash-of-herbs|restoration|plant|target|medicinal leaf cloud rains gently onto ally|small cloud of medicinal herbs|Recovery save conditional; meal alternative separate.
dashing-pickup|movement|wind|caster|passing mount echo catches source at side|As it passes you|Mount movement type selectable; no guaranteed flight.
dazzling-block|elementCone|light|target|shield contact throws multicolored defensive flash fan|flash of brilliant, multicolored light|Save-dependent dazzle/blind, no damage.
dazzling-display|display|fear|caster|whirling weapon gleams culminate in unnerving show|whirling and flashing a weapon|Demoralize checks conditional; no Strike.
dazzling-dragonet-disappearance|concealment|light|caster|scale sheen flashes then silhouette disappears|brilliant sheen on your scales|No teleport relocation; invisibility and enemy dazzle.
dead-reckoning|focus|arcane|caster|compass-like focus line settles northward|which direction is north|Knowledge cue only; no magic attack.
deadeye|focus|wind|target|air and ground tells reveal faint enemy silhouette|smallest movements of objects|Reveals invisibility to source, not source stealth.
death-rattle|absorb|void|target|dismissed horde crumbles while nearby life wisps sink inward|draws life energy toward it|Horde-origin save-dependent drain, no caster flight.
deaths-door|resolve|ward|caster|temporary last-stand shell catches fatal pressure|continue to fight when others would fall|Temporary HP buffer, not guaranteed cure.
debilitating-dichotomy|elementTarget|mind|target|opposed divine mind rings strike both source and foe|You and one creature|Self damage also; stunned conditional.
deceptive-deduction|focus|mind|caster|observed skill pattern copies into improvised source diagram|following the example|Borrowed expertise for deception, no guaranteed knowledge.
declare-anathema|command|spirit|target|spoken taboo seal isolates target from friendly threads|friends and strangers to shy away|Degree-dependent curse/weakness; no direct damage.
decree-of-execution|command|spirit|target|solemn royal decree focuses spirit pressure on foe|Speak your decree|Level/save determine death; no automatic death visual.
decree-of-prosperity|command|light|target|gentle decree unfolds welcoming golden confidence rays|gentle encouragement|Skill prosperity only; no attack.
deep-freeze|elementBolt|cold|target|single supercooled fluid jet ends in target frost coating|Target one creature|Cone only unstable option, not default.
defend-mount|guard|weapon|caster|rider-shaped echo interposes between mount and incoming line|interpose yourself|No outgoing attack; source takes substituted hit.
defend-summoner|targetSupport|ward|target|eidolon-side guard plane covers summoner silhouette|eidolon blocks attacks|Eidolon origin; no generic source cast.
defensive-coordination|preparation|music|caster|paired rallying notes outline coordinated shield angles|hold the line|Next anthem raises shields; no immediate block.
defensive-dismissal|form|transform|caster|large form echo contracts back into original silhouette|Dismiss the polymorph effect|Reduction critical to normal hit, no heal.
defensive-growth|guard|plant|caster|flowers and branches weave shield across incoming side|shield of woven flowers and branches|Awakened retaliatory explosion only on later destruction.
defensive-instincts|movement|weapon|caster|tense guard outline precedes short careful step echo|body tenses up when surrounded|No attack or real relocation.
defensive-recovery|preparation|healing|caster|healing focus gains outer protective rim|temporary protection in addition to healing|Next single-target healing required.
defensive-roll|movement|weapon|caster|low rolling echo disperses impact into floorward arcs|Dropping into a roll|No target attack or teleport.
defensive-swap|targetSupport|ward|target|paired source-ally echoes cross behind guard planes|swap positions with each other|Actual positions unchanged by visual preview.
defiant-banner|command|ward|target|banner-like sweep expands sturdy allied perimeter|vigorously wave your banner|Resistance support; no actual enemy attack.
define-report|fortune|mind|caster|sheepish speech curl revises into diplomatic flourish|sheepish smile|Diplomacy reroll conditional; no guaranteed forgiveness.
define-the-canvas|groundCreation|earth|caster|rune stones orbit then mark ground canvas perimeter|rune-inscribed stones|Later ground runes separate; no automatic target effect.
deflect-projectile|guard|weapon|caster|free-hand intercept flick diverts small incoming spark|have deflected it|Only if attack misses; excludes massive projectiles.
deflecting-cloud|concealment|water|caster|wingbeat opens billowing obscuring mist wall|billowing cloud of mist|Not flight movement despite active wings requirement.
deflecting-jewel|guard|light|caster|head gem draws half-moon dividing ward line|attuned your head gem to the half moon|Defense only, no projectile.
deflecting-shot|ranged|weapon|target|quick intercept shot cuts incoming threat beside ally|shot to deflect a weapon|No direct ally damage; foe distraction/defense.
deflecting-wave|waveGuard|water|caster|compact water cascade disperses incoming edge|cascade of water|Defensive localized wave, not water attack.
defy-hell|stance|light|caster|devotional stance flares steady anti-infernal resolve|endless strength and courage|Hellbreaker Strikes later separate.
deific-font|preparation|healing|caster|life spark drains into divine spell reservoir|life force can fuel|Costs drained; next spell separate.
delay-trap|craft|weapon|target|small mechanical jam flash interrupts trap linkage|jam the workings of a trap|Check conditional; no trap explosion now.
demand-surrender|command|mind|target|strong command wave meets single foe attention seal|command that opponent to surrender|Save-dependent surrender/fleeing; no enforced animation death.
demon-slayer|strike|light|target|holy melee contact gathers restrained target light burst|deliver a melee blow|Large holy explosion only if demon slain.
denier-of-destruction|targetSupport|healing|target|life-sustaining orb shield absorbs incoming damage at ally|reduces the triggering damage|Prevention rather than actual HP healing.
denounce-tyranny|command|mind|target|spoken denunciation splits enemy alliance threads|disrupting its alliances|Social checks conditional, no mental damage.
desert-wind|stance|earth|caster|sand-dust vortex creates porous concealment perimeter|vortex of sand and dust|Later air damage enhancement separate.
desiccating-inhalation|absorb|void|caster|cone moisture ribbons pull inward then life spark rekindles|draw in the moisture|Healing only if a target damaged; no outward fire cone.
desperate-finisher|preparation|weapon|caster|reckless last-press emphasis tightens weapon focus|one last, reckless press|Selected press unspecified; do not invent fixed Strike.
desperate-prayer|focus|light|caster|upward plea receives one devotion spark|plea for their aid|Focus gain, not healing or automatic devotion spell.
desperate-resuscitation|restoration|healing|target|medical handwork pulses life into intact fallen ally|training in combat medicine|Medicine success required; no guaranteed resurrection.
desperate-revival|absorb|void|caster|wide outward life threads reverse into dying source|drain the life of all around|Save-dependent area drain and capped healing.
desperate-surge|bind|shadow|target|temporary spectral muscle channels a selected maneuver|using a spell attack roll|Grapple/reposition/shove/trip choice; no bonus recharge Strike.
desperate-wrath|resolve|blood|caster|wounded body rage swells into exposed aggressive outline|blood boils when you take a beating|Attack bonus and defense cost, no immediate Strike.
determination|resolve|mind|caster|stubborn mental pulse breaks one enclosing constraint ring|shrug off your foes' spells|Spell counteract conditional; no healing.
determined-dash|movement|wind|caster|two long determined movement echoes cut rough ground traces|Stride twice|Three-stride alternative separate; no attack.
detonating-spell|preparation|arcane|caster|volatile spell focus grows small outward splash buds|spell becomes volatile and explosive|Next successful damaging spell explodes, not now.
devastating-spellstrike|strike|arcane|target|wide spell-melee sweep adds small neighboring shock ring|sweeps are so wide|Spellstrike plus target-centered splash, not generic target burst.
devil-in-plain-sight|form|shadow|caster|fiendish features fold inward into disguised familiar silhouette|small ball of corruption|Disguise not invisibility or attack.
devoted-guardian|targetSupport|ward|target|wide source shield angle extends over adjacent ward|chosen ward|Adjacent ally protection; no outgoing attack.
devrins-cunning-stance|stance|mind|caster|sly tactical aura arranges deceptive flanking angles|keep their wits about them|Check-dependent stance; later reaction denial separate.
diabolic-certitude|focus|shadow|target|hell-trained recognition lines inspect observed devil|Recall Knowledge about a devil|Knowledge only; not attack.
diacritic-fluency|preparation|arcane|caster|rapid diacritic accent attaches to incomplete rune focus|modify a rune with great speed|Next Trace separate.
dig-quickly|groundCreation|earth|caster|hands excavate low pit and kick outward grit fan|cloud of grit|Extinguishes flames; no fire breath despite fire keyword.
dimensional-pilfer|produce|teleport|caster|small stolen-object shimmer blinks from owner to source hand|object vanishes|Thievery conditional; caster does not teleport.
dire-growth|form|transform|caster|primal animal outline broadens in muscular growth wave|primal reflection of your animal shape|No immediate attack or forced movement.
dirty-trick|bind|weapon|target|hand-level snag tugs boot or hat focus askew|hook a foe's bootlaces together|Check conditional; not magical damage.
disarming-block|guard|weapon|target|angled shield block twists held weapon line sideways|block at an angle|Disarm conditional; no additional Strike.
disarming-intercept|guard|weapon|target|armor-caught weapon line wrenches away in short body twist|catch a weapon in your armor|Disarm conditional; no direct damage.
disarming-smile|command|mind|target|warm facial glint opens a hesitant pause ring at attacker|wide and sincere smile|Diplomacy conditional; does not magically disarm weapon.
disarming-stance|stance|weapon|caster|single fencing blade settles into controlling guard angle|fencing stance|Future Disarm checks separate.
disciples-breath|elementCone|arcane|target|focus-free draconic exhalation unfolds ancestral energy fan|unleash your breath weapon|Dragon Breath element/shape chosen from character.
disengaging-twist|movement|weapon|caster|tight escape rotation slips out of grip outline|particularly adept at escaping|Escape check conditional; no damage.
dismal-harvest|absorb|shadow|caster|expiring breath wisps collect into necromantic buffer|expiring breaths of your enemies|No extra Mobbing Assault; temporary HP only.
dispelling-spellstrike|strike|arcane|target|spell-melee contact unthreads one active magic ring|force out magic affecting your enemy|On-hit counteract conditional; not generic utility.
disrupting-strikes|preparation|vitality|caster|weapon edge gains anti-undead vitality sheath|call forth vitality energy|Weapon enhancement only; no immediate Strike.
disruptive-stance|stance|weapon|caster|ready intercept blade hangs beside alert source outline|prepared to foil enemies' actions|Future Reactive Strike separate.
disruptive-stare|command|mind|target|narrow frigid gaze arrests enemy casting focus|frigid gaze|Mental disruption not cold damage; save conditional.
dissolutions-clarity|absorb|shadow|caster|nearby darkness gathers into one focused inner spark|draw on nearby shadows|Focus regain only; no stealth or attack.
dissolutions-sight|focus|shadow|caster|dark ocular halo reveals edges in surrounding blackness|no outer darkness can obscure your sight|Darkvision only; no vanish.
distant-wandering|form|spirit|caster|motionless body echo releases inaudible scouting spirit|spirit projects out of it|Body unconscious; spirit cannot attack or touch.
distant-waterbirds-poise|movement|water|caster|light water-skimming leap echo exits existing contact|flow around your foe|No second Spellstrike; no real relocation.
distracting-flattery|command|mind|target|polished flattering speech curls around social misstep|maintain a good impression|Check-dependent attitude prevention; not movement.
distracting-performance|performance|music|caster|stage flourish draws attention as ally edge fades|allowing your allies to Sneak away|Create Diversion conditional; no automatic ally movement.
distracting-spellstrike|feintStrike|arcane|target|free-hand distracting glimmer precedes one spell-melee contact|Feint immediately before|Feint then one Strike, not two Strikes.
dive-of-the-divine|movement|spirit|caster|vertical divine descent lands in broad sanctified shock ring|When you land|Area damage and push conditional; no doc movement.
diverse-recognition|focus|arcane|target|second distinct enemy outline receives informed scan|different kind of creature|Knowledge only, no target damage.
divert-destiny|restoration|vitality|caster|mythic life reservoir erupts through extinguishing fate veil|wells of mythic vitality|Survival cue; no actual state edits.
divert-streamflow|movement|water|target|flowing hand gesture redirects adjacent foe line then step echo|like a flowing stream|Reposition and subsequent Step conditional.
diverting-vortex|guard|wind|caster|spent spell residue spins into defensive air vortex|vortex that deflects ranged attacks|No outgoing weapon attack.
divine-aegis|guard|light|caster|split divine barrier shields mundane magic-facing edge|leaves you exposed to divine energy|Not universal invulnerability.
divine-disharmony|command|spirit|target|opposing holy symbols clash into distracting dissonant pulses|opposing divine objects|Skill check conditional; no damage.
divine-grace|targetSupport|light|caster|brief grace ray gathers into focused save halo|deity's grace|Save bonus only; no heal.
divine-infusion|preparation|healing|caster|healing focus gains bright weapon-empowering strands|empower its attacks|Next heal/harm then enhancement; no immediate attack.
divine-invulnerability|guard|light|caster|smoldering divine aura thickens around body|aura smolders with power|Resistance rather than absolute immunity.
divine-presence|stance|spirit|caster|godlike source silhouette echoes across small emanation|bearing of a god|No document teleport or immediate Strike.
divine-rebuttal|strike|spirit|target|favored-weapon contact releases allied saving resolve motes|Strike the adjacent creature|On-hit allied save support conditional.
divine-weapon|preparation|spirit|caster|residual divine spell wisps settle along held weapon edge|siphon residual spell energy|Weapon enhancement, no new spell or immediate hit.
divine-wings|flight|light|caster|feathered or batlike back echoes open into magical wings|magical wings from your back|Flight grant, no attack or automatic long movement.
dizzying-spell|preparation|mind|caster|next-spell focus gains slowly offset concentration rings|foe's head spinning|Future failed save required; no target stupefy now.
doctors-visitation|movement|healing|target|careful approach echo ends in hand-sized medical pulse|move to provide immediate care|Medicine/poison/first aid option, not attack.
dodging-roll|movement|weapon|caster|late low dodge echo rolls across incoming area edge|last possible moment|Resistance depends on leaving area; no real move.
domino-effect|bind|arcane|target|triggered snare line hops once into nearby second target|same snare|Target-to-target propagation, not caster stealth.
don-thy-fervor|resolve|shadow|caster|fiendish eye embers sharpen confident posture|eyes and posture|Skill and counteract bonus, no attack.
dousing-spell|preparation|water|caster|watery droplets coat next casting focus|enhance your spell with elemental water|Next target soak/recovery separate.
draconic-fury|elementCone|weapon|target|spectral claws rake outward in short cone flurry|spectral claws|Dragon proxy origin selectable; no dragon breath projectile.
draconic-resilience|guard|transform|caster|overlapping spectral dragon scales shimmer defensively|dragon scales shimmers over you|May target ally at spectral dragon; no immediate attack.
drag-down|bind|water|target|adjacent grip pulls a submerged outline downward|pull it below the surface|Grapple success required; no real forced movement.
dragon-stance|stance|weapon|caster|low dragon-tail leg echo settles into broad stance|stance of a dragon|Later powerful leg Strikes separate.
dragon-transformation|form|transform|caster|rage-lit silhouette expands into large dragon outline|ferocious Large dragon|No immediate breath or Strike.
dragons-flight|flight|wind|caster|small draconic wingbeats lift a short forward echo|small pair of draconic wings|Actual Fly movement visual only; fall possible.
dragons-journey|movement|wind|caster|paired fan cuts create serpentine low-resistance trail|serpentine path|Allied reaction movement optional; not defensive shield cast.
dragons-rage-breath|elementCone|arcane|target|deep raging inhale pours instinct energy into broad cone|breathe deeply and exhale|Element from chosen dragon, not weapon slash.
dragons-rage-wings|flight|transform|caster|rage-colored back wings unfold with muscular flare|sprout dragon wings|Flight grant only; no breath attack.
dragonet-breath|elementCone|arcane|target|small heritage-specific gas or spittle exhalation|associated with your heritage|Choose heritage cone/line and element; no universal fire breath.
drain-vitality|absorb|healing|caster|beast-gun essence spirals into temporary life sheath|swirling life essence|No gunshot; temporary HP and recovery checks.
draw-from-the-land|absorb|earth|caster|matching ground energy rises into body buffer|pull strength from the surrounding terrain|Temporary HP, not actual healing.
drawn-in-vital-ink|rune|blood|caster|brush-sized blood trail becomes distant rune tether|collect a bit of its blood|No repeated Strike or immediate rune damage.
dread-marshal-stance|stance|fear|caster|grim marshal posture projects vicious allied edge halo|Putting on a grim face|Entry check and later critical-hit fear conditional.
dream-guise|form|mind|target|two source-ally appearances blend into shared third mask|shared third appearance|No physical merge or actual token relocation.
drifting-pollen|stance|plant|caster|slow pollen haze fills kinetic aura perimeter|haze of pollen|Sickened/dazzle save conditional; not healing.
drive-by-attack|charge|weapon|target|vehicle-side passing echo carries one timed contact|At any point during your vehicle's movement|Vehicle origin, not automatic personal dash.
driving-rain|groundCreation|water|target|remote heavy rain burst impacts downward behind mist|Heavy drops of rain batter down|Damaging rain burst, not caster stealth.
drowning-mist|stance|water|caster|thick low mist rolls slowly from elemental gate|faint mist that feels as thick as standing water|Later breath actions/save effects separate.
dualistic-synergy|preparation|arcane|caster|arcane and primal rings align into dual casting focus|If the spell is arcane|Next spell-dependent knowledge/buffer, not current attack.
dueling-dance-fighter|stance|weapon|caster|free-hand balanced defensive blade circles compactly|free hand as pivot and balance|No immediate attack; fighter parry style.
dueling-dance-swashbuckler|stance|weapon|caster|extravagant free-hand flourish opens wider parry fan|benefits of Extravagant Parry|No immediate attack; distinct expansive style.
dueling-parry|guard|weapon|caster|one-handed blade cuts a concise defensive diagonal|parry attacks against you|Source defense only.
duelists-challenge|command|weapon|target|spoken duel line connects poised blade to chosen opponent|proclaim a challenge|Marks opponent without immediate damage.
duelists-edge|preparation|weapon|caster|initiative focus flashes as dueling blade is drawn|draw your weapon seamlessly|Weapon draw not Strike.
duelists-form|stance|weapon|caster|single-hand blade focus quickens poised step-ready outline|heightens the duelist's focus|Later extra actions separate; fatigue cost persists.
dust-cloud|concealment|earth|caster|dust and pollen thicken established waking-world area|Dust and pollen fill your waking world|Dazzle/blind later save-dependent, no attack.
eat-fortune|absorb|arcane|caster|twisting fate ribbon is swallowed into a closing beaklike curl|consume the interference|Disrupts fortune/misfortune; no damage or heal.
ebb-and-flow|preparation|healing|caster|bright and dark casting streams separate into two ready branches|both vitality and the void|Future dual-target Heal/Harm, not immediate result.
echoes-in-stone|focus|earth|caster|subtle ground vibration rings return to source feet|attune your senses to the stone|Tremorsense only, no earth damage.
echoing-channel|preparation|healing|caster|main divine focus creates smaller nearby energy pocket|smaller pocket of that energy|Future additional one-action Heal/Harm separate.
echoing-spell|preparation|arcane|caster|precise casting components form trailing resonance copy|exacting precision|Second cast later optional; no double playback now.
echoing-violence|elementTarget|weapon|target|existing unarmed contact reverberates internally in spaced pulses|reverberates through your opponent's body|Death only critical save failure; no additional Strike.
eclectic-obsession|focus|mind|caster|assorted recalled craft fragments settle into one lore sign|reflect on snippets|Temporary training, no guaranteed information.
eclectic-sword-mastery|preparation|weapon|caster|few practice blade arcs resolve into learned sword alignment|few practice swings|Practice not enemy Strike.
ectoplasmic-aura|stance|spirit|caster|thick translucent ectoplasm fills friendly defensive perimeter|air between you and your enemies thickens|Later enemy end-turn reaction denial save-dependent.
edifying-trace|rune|arcane|target|adjacent rune trace becomes revealing inspection lines|Trace a Rune onto an adjacent enemy|Knowledge success required for later saving penalty.
educate-allies|targetSupport|music|target|composition notes carry defensive lesson to allied edges|defensive knowledge|Buff existing composition, no new hostile spell.
eerie-proclamation|groundCreation|shadow|target|ominous small square marking darkens ground corners|10-foot by 10-foot square|Future entrant curse conditional; no damage now.
effortless-captivation|focus|mind|caster|subtle charming orbit receives effortless maintenance pulse|maintain your innate charms|Sustain only; no new target charm.
effortless-concentration|focus|arcane|caster|one existing spell ring renews through quiet inward attention|maintain your active spells|Sustain only, no extra casting.
effortless-impulse|focus|arcane|caster|steady kinetic-gate ripple refreshes existing elemental orbit|steady ripple|Sustain only, no new impulse burst.
eidetic-memorization|focus|mind|caster|page-like inscription lines imprint into memory focus|memorize an inscription|Writing recreation later, no magic damage.
eidolons-retort|strike|weapon|target|eidolon-side intercept contact meets triggering foe|eidolon makes a melee Strike|Eidolon origin, disruption only critical manipulate trigger.
eidolons-trample|movement|weapon|target|eidolon ground trail leaves staggered trampling contact rings|Trampling each creature|Eidolon origin; save-dependent damage, no source burst.
elaborate-flourish|preparation|arcane|caster|entrancing casting flourish layers ornate misleading marks|entrancing flourishes and grand pronouncements|Next cast obfuscation, no immediate attack.
eldritch-reload|preparation|arcane|caster|spent magic mote seats ammunition with quick loading glint|Interact to reload a weapon|Reload only, no shot.
electric-counter|guard|electricity|caster|electric defense briefly sparks into melee attacker-facing edge|resistance to electricity|Retaliation only if trigger melee; not universal target bolt.
electrify-armor|stance|electricity|caster|armor seams carry dancing electric sparks|electrify your armor|Future contact damage, not immediate foe attack.
elemental-artillery|ranged|metal|target|wood-metal ballista forms then fires jagged elemental bolt|immediately shoots a bolt|Proxy ballista origin; selected target contact, reload later.
elemental-assault|preparation|arcane|caster|chosen elemental sheath wraps arms and held weapons|shroud your arms and held weapons|Enhancement only; no bolt or immediate Strike.
elemental-bulwark|guard|arcane|caster|matching suli element meets incoming threat in short barrier|corresponding elements|Choose triggering element, not arbitrary universal ward.
elemental-defense|preparation|arcane|caster|element-ready casting orbit folds protective rim inward|attune yourself to elemental power|Next elemental spell creates protection, no attack now.
elemental-explosion|elementAura|arcane|caster|roiling rage energy breaks outward in short emanation|exploding elemental matter|Source-centered not target burst; chosen rage element.
elemental-revision|rune|arcane|target|rune strokes scratch away and rewrite elemental color|scratch out and rewrite|Touch willing item; no damaging invocation.
elemental-transformation|form|arcane|caster|kinetic gate opens directly into matching elemental body outline|transformative elemental energy|Form only; no aura attack.
elf-step|movement|wind|caster|two graceful short dance-step echoes|Step 5 feet twice|No attack or actual relocation.
elucidation|focus|mind|caster|clear illusion-cutting pulse opens allied perception edges|senses sharpened|Allies later disbelief checks; no attack.
elude-trouble|movement|wind|caster|catlike long escape echo slips beyond missed melee line|Stride up to your Speed|No counterattack.
elven-persistence|resolve|mind|caster|steady pursuit line overrides wavering skill focus|don't give up easily|Fixed check result, not ordinary fortune reroll.
embrace-the-pain|bind|blood|target|wounded source grip catches attacking limb or weapon|Ignoring your pain|Grapple or Disarm conditional, not outgoing Strike.
emergency-medical-assistance|targetSupport|healing|target|medical handwork brushes harmful residue off adjacent ally|brushing off acid to patting down fires|Recovery checks, no guaranteed HP healing.
emergency-regeneration|restoration|vitality|caster|last-moment regenerative lattice rebuilds life around source|regenerate|No target attack; acid/fire restriction.
emergency-targe|guard|ward|caster|urgent shield plane rises across already incoming attack|immediately Raise a Shield|Defense only, no automatic Shield Block.
emissary-of-peace|command|mind|target|gentle invitation wave reaches wounded foe without contact|foes surrender|Social request may fail; no forced submission.
emit-defensive-odor|elementTarget|poison|target|thick close-range pheromone spray hits adjacent foe|thick spray of defensive pheromones|Actual poison spray, not source-only shield.
emotional-push|focus|mind|target|existing emotion ripple sharpens target opening mark|sudden change in emotions|No extra emotion spell or attack; next attack setup.
emotional-surge|resolve|mind|caster|heart-level surge expands confident psychic outline|Your heart soars|Temporary attack/skill bonus, no immediate contact.
empathetic-plea|command|mind|target|small pleading source pose reaches hesitant attacker|puppy-dog eyes|Diplomacy conditional; no damaging psychic burst.
emphatic-emissary|focus|mind|caster|initiative awareness spreads restrained calming attention fan|meeting is close to unraveling|Disarming Smile optional first-turn ability separate.
empowered-onslaught|stance|arcane|caster|one existing battle aura gains layered synchronized focus|body and mind are perfectly in sync|No repeated critical hit or new aura cast.
encouraging-words|targetSupport|music|target|brief spoken pep-talk ribbon lifts ally stamina glow|quick pep talk|Stamina recovery check-dependent; not HP heal or mind attack.
enduring-debilitation|focus|shadow|target|existing debilitation marker lengthens into steady target band|last an exceptionally long time|Extends applied effect, no new hit.
energetic-resonance|guard|arcane|caster|blood resonance catches matching harmful spell frequency|blood resonates with magical energy|Damage-type resistance, not generic all-magic ward.
energize-bite|preparation|arcane|caster|leftover breath energy coats jaw outline|breath remains in your jaws|Bite enhancement only; no immediate jaws contact.
energized-font|focus|arcane|caster|inner magic condenses quickly into focused reserve spark|focus your mind more quickly|Focus regain only, no spell.
energy-ablation|preparation|arcane|caster|destructive casting focus splits off protective barrier crescent|divert some of its power|Next energy spell creates resistance.
energy-fusion|preparation|arcane|caster|two distinct energy channels fuse inside casting focus|fuse two spells together|Next spell combined damage, no double attack now.
energy-ward|guard|arcane|caster|last-spell residue contracts into matching energy ward|convert energy from the last spell|One energy resistance, no spell replay.
enervating-wail|elementAura|void|caster|terrible wail expands low spectral pressure through emanation|tears at the spirits|Awakened silent mental variant separate.
enforce-oath|focus|light|target|oath line narrows source attention toward sworn enemy|call on your oath|Focused bonuses and other-target cost, no attack.
engine-of-destruction|charge|weapon|target|construct deployment opens armaments then distributes enemy contacts|separating its limbs|Construct origin; one Strike per foe, not source aura damage.
enhance-spell|targetSupport|arcane|target|source frequency tuner aligns chosen ally spell focus|amplify or modify their spells|Next-turn spellshape, no current ally spell cast.
ensnaring-disarm|produce|weapon|target|disarmed item arc curves toward nearby student hand|student can grab it|Item flies; actor does not fly or repeat Strike.
ensnaring-wrappings|bind|weapon|target|loose arm wrappings unfurl around recently damaged foe|wrappings come loose|Grapple conditional; no extra Strike.
envenom-fangs|preparation|poison|caster|thin venom film gathers on fang outline|envenom your fangs|Next damaging fang Strike required.
epiphany-at-the-crossroads|restoration|light|caster|near-death omen resolves into upward life spark and standing echo|strange, near-death vision|Augury result symbolic; Stand optional.
escape-timeline|time|arcane|caster|physical outline slips out between slow clock-ring ticks|step outside of the flow of time|Same-location return, no distance dash or actual time mutation.
essence-overflow|elementAura|arcane|target|spectral dragon center ruptures into short energy emanation|explodes from your spectral dragon|Dragon origin; source excluded; benefactor element.
eternal-memories|focus|plant|caster|successive leafy incarnation echoes unfold into memory focus|previous incarnations|Skill choices only, no attack.
eternal-torch|produce|fire|target|small torch flame lights and orbits willing target|torch-like flame|Light creation, not target fire damage.
evanescent-wings|flight|wind|caster|brief tiny wing flutter carries low lifting echo|flutter for brief spurts|Fly action movement cosmetic; fall possible.
evangelize|command|mind|target|faith argument circles listener attention focus|listener's mind to whirl|Diplomacy conditional; no automatic mental damage.
even-the-odds|resolve|weapon|caster|confident source smile flares against opposing flank lines|confident smile or pose|Panache only; no attack.
even-the-odds-eagle-knight|preparation|light|caster|hopeful equalizing focus splits into two possible check paths|hold out hope|Next Commitment to Equality and buffer conditional.
everdistant-defense|guard|teleport|caster|spatial barrier stretches incoming aura path into layered distance|warp space|No token teleport; attack-range consequence conditional.
everstand-stance|stance|ward|caster|two-hand shield brace plants thick grounded guard plane|brace your shield with both hands|No immediate shield Strike.
everyone-duck|command|ward|caster|warning pulse lowers allied defensive echoes before trap flare|special precautions|Trap intentionally activates; no generic invulnerability.
expand-aura|stance|light|caster|existing champion aura widens from inner to outer ring|extend your influence and protection|Expansion only, no damage.
exploding-bullet|preparation|arcane|caster|small arcane shell seats volatile energy into firearm chamber|load your gun|Reload preparation; no shot or impact yet.
exploit-blunder|movement|weapon|caster|short informed step echo exploits missed enemy angle|make the most out of their mistakes|No second Strike.
explosive-arrival|preparation|fire|caster|summon-ready rune focus gains contained detonation sparks|next action is to Cast|Future summon-origin explosion, not caster burst now.
explosive-death-drop|bind|fire|target|gripped foe echo rises then drops into fiery landing ring|bringing them crashing down|Check determines fire drop; no flying bolt or relocation.
explosive-leap|movement|fire|caster|downward innovation blast launches rising source echo|explosion from your innovation downward|Minion origin possible; no target damage.
explosive-maneuver|bind|weapon|target|weapon mechanisms snap open into leverage hooks|deploys levers, tangling hooks|Maneuver chosen; not literal fire explosion or extra Strike.
explosive-metamorphosis|preparation|arcane|caster|transform-ready focus gains narrow elemental burst rim|complement your transformation|Next morph/polymorph required; no transformation now.
exsanguinate|absorb|blood|caster|foe blood spray curls toward source life reservoir|blood to spray upon you|After prior attack; no repeat Strike.
extend-surge|stance|arcane|caster|existing spell vortex unfolds wider outer spiral|tap deeper into the vortex|Aura expansion only, no new attack.
extinguish-light|concealment|shadow|target|small unattended light is wrapped in contracting shadow|wrap shadow around|Object light, not creature damage; magical counteract conditional.
extraplanar-haze|concealment|shadow|caster|skin-close crystalline or smoky motes form obvious haze|tiny particles of extraplanar matter|Concealed but cannot Hide/Sneak; no full invisibility.
extravagant-parry|guard|weapon|caster|stylish one-hand flourish opens decorative defensive arc|parry with style|Panache later missed attack; no Strike.
exude-demonic-corruption|preparation|poison|caster|toxic sludge coats body and weapon edge|covered in toxic sludge|Later melee/contact damage separate.
exult-in-violence|elementTarget|light|target|war cry calls vertical judgment pillar on different foe|pillar of light|Different random foe within struck target range; no repeat critical Strike.
eye-for-numbers|focus|mind|target|countable objects receive brief grouped ocular tally marks|estimate the number of items|Approximate number, no magic attack.
eye-of-the-arclords|focus|light|caster|incandescent forehead eye opens into scanning halo|incandescent third eye|Sight/detection, not stealth; later dazzled cost.
eyes-that-see-eternity|focus|light|caster|mythic ocular aperture opens concentric reality layers|secrets of reality and eternity|Truesight only, no damage.
fabricate-truth|command|mind|target|rapid false argument threads tangle listener focus|fast talking, switching arguments|Deception conditional; no mind bolt damage.
fading|concealment|blood|caster|crimson source image phases briefly and reforms|partially fade from reality|Same location; flat-check defense, no teleport distance.
faithful-stride|movement|light|caster|mounted double-stride echo skims unsupported liquid path|Stride across liquid|Mount movement only; may fall if ends unsupported.
fake-out|command|weapon|target|weapon flourish draws enemy attention without shot contact|acknowledge you as a threat|Aid attack roll, not additional fired attack.
familiar-conduit|preparation|arcane|caster|casting focus routes a single small conduit toward familiar|familiar as its origin point|Next spell origin shift; not new cast.
familiars-eyes|focus|mind|target|sensory thread leaves source eye and enters familiar focus|project your senses into your familiar|No familiar attack; source senses lost.
familiars-resolve|preparation|ward|caster|familiar-traced symbols dispel doubt around casting focus|throw off fear and doubt|Protection against fear, not inflicting fear.
fanes-escape|concealment|weapon|caster|fluttering card fan obscures source before short sneak echo|fluttering explosion|Cards not magic energy burst; no guaranteed invisible teleport.
fanes-fourberie|stance|weapon|caster|deck-like card glints align into dagger or dart ready fan|playing cards as weapons|Stance only, no card throw now.
farabellus-flip|movement|wind|caster|armored twisting somersault echo turns contact into momentum|twisting somersault|Step only if attack still hits; defense first.
fearsome-familiar|groundCreation|arcane|target|familiar silhouette trades into elemental summon aura|familiar trades places|Summon transition, no target damage; second daily use consequence separate.
feast|absorb|blood|target|adjacent jaws contact draws short life thread inward|feast upon an adjacent|Only live target takes damage; temporary HP, no broad spell burst.
feathered-flechettes|elementAura|weapon|caster|snapped wings scatter radial cutting feather streaks|send feathers scattering|Radial attack not flight movement.
feed-on-pain|absorb|mind|caster|psychic pain feedback condenses into false-life shell|psychic feedback|Temporary HP only, no extra mental damage.
feed-the-void|absorb|spirit|caster|heart black hole pulls screaming cone winds inward|black hole opening over your heart|Spirit damage only square contact; no automatic forced doc movement.
feeling-your-oats|resolve|mind|caster|self-assured pose sets a polished mental confidence ring|living your fantasy|Prepared Will substitution, no attack.
feign-innocence|command|mind|target|friendly speech ribbon masks hostile source attention|you're on its side|Deception-dependent temporary alliance, no domination damage.
feline-dance|fortune|wind|caster|fluid dodge transitions between claw and talon stance echoes|fluidly move between stances|Double-roll save, not target attack.
feral-mending|restoration|transform|caster|recently reshaped flesh settles under restorative primal motes|heal your wounds while reshaping|Post Change Shape healing, no repeat transformation.
fermenting-liquors|restoration|healing|target|small poured liquor glint warms adjacent ally center|serve your liquor|Willing adjacent creature; no potion projectile.
ferocious-gust|lineCue|wind|target|heavy wingbeats drive furious directed air line|furious gust|Gust of Wind effect, not source utility sparkle.
ferocious-will|elementTarget|mind|target|resisted mental effect rebounds as psychic feedback blast|magical feedback at the effect's source|Targets source of effect; slow conditional.
ferocity-mimicry|resolve|blood|caster|faltering combat outline catches on stubborn single life ember|continue fighting|One HP survival with wounded cost, not heal wave.
ferry-through-waves|movement|water|target|linked source-ally swim echoes ride one shared wave|carrying them along with you|No token movement; two-swim option separate.
feys-trickery|concealment|shadow|caster|playful fey shimmer folds source outline out of sight|momentarily vanish from sight|Invisibility rather than movement or attack.
fiend-slayer|elementTarget|void|target|previous fiend wound releases a short tearing void pulse|fiend you just struck|No new Strike; stun critical save conditional.
fierce-competitor|command|weapon|target|paired athletic challenge marks frame source and ally|challenge a single ally|Specific skill challenge, no immediate maneuver.
fierce-grasp|bind|weapon|target|existing grip bands tighten with braced source silhouette|hard for them to get away|Escape penalty and AC bonus, no additional damage.
fiery-rebirth|restoration|fire|caster|recovering life ember rises into adjacent retributive flame ring|return to consciousness|Adjacent foes only; push conditional, no bolts.
fiery-retort|elementTarget|fire|target|pain-facing close flame wave sears adjacent attacker|wave of flame|No caster-to-distant-target projectile.
final-spite|elementTarget|poison|target|near-death venom spite coils onto triggering foe|poisonous spite|Target save conditional; no auto source poison aura.
fish-from-the-falls-edge|restoration|vitality|target|ikon spark flies briefly into falling ally life halo|sending your divine spark|Actual prevention/healing; source ikon paused, no attack.
flair-rider-stance|stance|wind|caster|unpredictable rider flip echoes weave around mount-side cover|flip unpredictably around your dragon mount|No target attack or dragon breath.
flamboyant-leap|charge|weapon|target|stylish rising leap echo delivers one finisher then settles|leap and deliver|One finisher, not movement-only; no real relocation.
flash-of-omnipotence|preparation|light|caster|brief godlike source radiance sharpens future damage focus|power of a god|Damage enhancement not protective invulnerability.
flash-of-omnipresence|teleport|light|target|divine blink places source echo beside friendly outline|at an ally's side|Mythic arrival stun optional; no actual teleport.
flash-of-omniscience|focus|light|target|deific eye scan reveals layered enemy defense glyphs|world as your deity does|Information only; no target damage.
flashforge|produce|metal|target|small metal particles assemble into hand-sized tool|artificial metal object forms|Creation not metal attack; no actual inventory item.
flashing-shield|elementTarget|vitality|target|blocked shield flare sears adjacent undead edge|shield flares with holy light|Requires undead Shield Block, no new weapon Strike.
flashy-dodge|movement|weapon|caster|deft stylish side dodge leaves one confident source glint|deftly dodge|Defense only; panache conditional.
fledgling-flight|flight|wind|caster|fledgling wing lift beats carry short air echo|short bursts|Fly action not arcane spell; landing/fall conditional.
fleeing-shriek|elementAura|sonic|caster|close ear-piercing sound ring precedes departing source echo|ear-piercing screech|Damage then Stride, not just sonic movement.
fleet-tempo|command|music|target|sprightly tempo beats quicken friendly foot-level accents|sprightly tone|Speed grant; no forced movement.
fleeting-shadow|concealment|shadow|caster|hidden outline leaves two successive low sneak echoes|Hide, then Sneak twice|Stealth success conditional, no magic invisibility.
flensing-slice|elementTarget|blood|target|two prior blade wounds reopen as lingering bleed ribbons|flense the target|Post Double Slice effect, no repeat paired attack.
flickering-twirl|concealment|shadow|caster|twirling disguise silhouettes alternate into obvious blur|flickering blur|Cannot Hide from obvious concealment.
flinging-updraft|targetSupport|wind|target|target-local updraft lifts then deposits short landing echo|picking someone up|Unwilling save conditional; no caster flight or doc relocation.
float-free|movement|water|caster|gentle vertical underwater drift echo|vertically through the water|No air flight or attack.
flood-stance|stance|water|caster|held breath circulates through torso into torrent-ready fist halo|circulates a single breath|Stance only; no immediate punch.
floral-restoration|restoration|plant|caster|nearby healthy flora send soft vitality motes inward|plants share their vitality|Plants unharmed; HP and focus, no attack.
flow-of-war|preparation|spirit|caster|divine battle instinct quickens source weapon-and-step outline|Divine battle instincts|Extra action grant, no automatic Strike/Stride.
flower-street-infamy|command|mind|target|lascivious remembered tale tangles target attention ribbons|spin a lascivious tale|Deception-dependent stupefy; no actual damage.
flowering-path|stance|plant|caster|life energy roots at source feet with blooming trailing flowers|leave blooming flowers|Later Step/Stride creates terrain, not forced movement now.
fluttering-distraction|fortune|weapon|target|two fans snap alternating distracting arcs across enemy focus|snapping and fluttering your fans|Enemy double-roll lower, no attack contact.
fly-on-shadowed-wings|flight|shadow|caster|apparition shadow folds into pair of protective wings|pair of protective wings|Apparition temporarily dispersed; no outgoing damage.
flying-flame|flamePath|fire|target|tiny chosen flame travels routed path through successive targets|path you choose|Route source then previous targets; one save each.
focus-ally|fortune|mind|target|adjacent ally attention ring recenters for second save attempt|help them to recenter|Reroll may still fail; not heal.
focused-fire|ranged|weapon|target|mortar shot lands in sharply confined single-square blast|targeting a single square|Not broad aura or elemental magic burst.
focused-juggler|performance|weapon|caster|juggled-item orbit smoothly gains one additional bead|Increase the maximum number of items|Continue juggling, no attack.
forcible-energy|preparation|arcane|caster|complex energy manipulation leaves weakness-ready casting notch|complex manipulations|Next damaged target weakness, not defense.
foresee-danger|focus|mind|caster|several projected attack paths fade around evasive source focus|every possible way|Perception defense, not target weapon damage.
foreseen-failure|fortune|mind|caster|failed spell echo rewinds into alternate casting-ready vision|snap back to reality|Different replacement spell choice separate; no repeated same spell.
forest-stealth|concealment|plant|caster|underbrush foreground closes around crouched source echo|underbrush or foliage|Requires cover; no shadow teleport.
forests-heart|stance|plant|caster|apparition energy roots through ground into ready vine limbs|inhabit roots, control vines|Future unarmed vine attacks separate.
forestall-curse|preparation|ward|caster|restraining focus holds curse coil below next casting threshold|hold back your curse|Next cursebound ability, no immediate counteract.
foretell-harm|focus|shadow|target|ominous future injury mark hangs over prior spell target|target's future|Damage happens next turn; not immediate fire bolt.
forewarn|targetSupport|mind|target|planned danger lines redirect friendly defensive focus|direct your ally away from danger|Perception DC substitution, no target damage.
form-a-flock|stance|transform|caster|small dragonet-like orbit gathers around source perimeter|wild dragonets to swarm|Flock aura, later Acrid Barrage separate.
form-control|preparation|transform|caster|carefully stabilized form diagram settles around casting focus|longer period of time|Next Untamed Form only.
form-lock|bind|transform|target|existing grip unthreads foe alternate-form outline|break apart alternate forms|Counteract conditional; no guaranteed transformation.
form-of-the-bat|form|shadow|caster|large silhouette contracts into small harmless bat echo|harmless bat|No attack or harmful swarm.
form-up|command|weapon|target|formation markers open into selectable line wedge or cluster|Choose a formation|Allied reaction movement optional; no doc move.
fortify-shield|guard|earth|caster|rock and metal outgrowth thickens raised shield edge|rocky outgrowth of metal and stone|Later block enhancement, no Strike.
fortifying-knock|rune|ward|caster|raising shield stroke traces fresh rune over guard plane|Raise a Shield and Trace a Rune|Single combined preparation, no invocation attack.
fortunes-favor|fortune|arcane|caster|lucky investment spark brightens already reopening roll path|chance to pay off|Bonus to pending fortune reroll, not new reroll.
forward-gaze-into-life|elementCone|vitality|caster|forward bright cone opposes backward dark cone|aimed exactly opposite each other|Two opposed vitality/void cones; not one target burst.
fountain-of-secrets|focus|mind|caster|remembered details spring into layered contextual scan|constantly remember details|Knowledge check conditional.
four-winds|windMove|wind|target|four friendly wind lanes extend outward from source|propel four creatures|Willing targets choose Stride/Fly; no damage.
four-armed-aspect|form|transform|caster|extra arm-pair echoes grow from burden-bearing torso|additional pair of arms|No immediate Grapple/Disarm/Shove/Trip.
fox-trick|concealment|shadow|caster|playful foxlike distraction curl masks source or small object|joke or prank|Diversion/conceal/hide choice, no damaging magic.
freeze-it|bind|cold|target|close body frost clamps around adjacent foe limbs|expel frost from your body|Check-dependent clumsy, no damage.
fresh-produce|produce|plant|target|nourishing small fruit grows in open hand or at feet|grows in their open hand|Healing only when later consumed.
frog-geyser|lineCue|water|target|mouth-water jet sweeps low straight line|shoot water in a|Push/save dependent; not arcane beam damage.
fulminating-shot|preparation|arcane|caster|chosen elemental charge gathers around ready shot chamber|channel magic into your next shot|No projectile until next attack.
furious-grab|bind|weapon|target|rage-powered hand clamps previously struck foe outline|grab your foe|Existing contact follow-up, no repeat Strike.
furious-sprint|movement|wind|caster|long straight rush leaves five spaced advancing echoes|Stride up to five times|No attack; eight-stride variant separate.
furnace-form|form|fire|caster|body silhouette is consumed into living furnace flame|leave you a living flame|Transformation not immediate Fly; no Ignition granted.
galvanize-spell|preparation|arcane|caster|existing spellsurge spirals inward into powerful reduced-action focus|reabsorb the magic|Next spell separate; aura ends.
gaping-flesh|resolve|blood|caster|fresh wound visibly opens toward horrified attacker focus|wound yawns open|Sickened save conditional; no additional damage.
gardeners-resolve|resolve|mind|caster|nerves-of-steel focus steadies while mental pain ring contracts|keep your composure|Fear defense, not mental attack; source takes mental damage.
garland-spell|preparation|plant|caster|thorn-or-vine garland loops around plant casting focus|garland of plants|Future spell creates remote hazardous burst, not immediate poison.
gathering-moss|restoration|plant|caster|rooted source gathers slow moss-colored recovery light|rooting yourself in place|Fast healing tied to existing stance, no movement.
generals-gambit|movement|weapon|caster|strategic forward echo draws enemy gaze into diversion marker|draw the enemy's attention|Create Diversion conditional; no Strike.
geobukseon-retaliation|guard|metal|caster|turtle-shell plates unfold then short fiery spike chains erupt|retractable spike-covered shell|Defense plus adjacent retaliatory emanation, not just shield.
geologic-attunement|stance|earth|caster|stone-touching stance sends sensing ripples through ground|senses through it in rippling waves|Tremorsense, not attack.
germination-of-resolve|resolve|vitality|caster|soul vitality sprouts through fatigue constraint lines|Vitality floods your trammeled soul|Counteract conditional; no HP healing promise.
ghost-blade|preparation|spirit|caster|mind-weapon edge phases into translucent ghost-touch outline|alter your weapon's phase|Weapon enhancement only, no Strike.
ghost-flight|flight|spirit|caster|ground tether loosens beneath hovering ghost silhouette|suppress your tether|Removes flight restriction; no shield or attack.
ghost-strike|preparation|spirit|caster|carried weapon receives lingering ghost-touch sheath|infuse a weapon|No immediate Strike despite name.
ghost-wrangler|preparation|spirit|caster|ambient spirits coalesce tightly upon source fists|Spirits around you coalesce|Enables later spirit maneuvers; no current grapple.
ghostly-stride|movement|spirit|caster|slightly incorporeal stride echo passes through foe outlines|as you move|Fly optional if speed exists; no guaranteed flight.
ghosts-in-the-storm|stance|wind|caster|petlike gray clouds encircle source and friendly silhouettes|Fast-moving gray clouds|Later move grants concealment/shock separately.
giants-lunge|preparation|weapon|caster|body and weapon ready outline extend reach forward|prepare to attack foes outside|Reach preparation, no immediate lunge attack.
giants-stature|form|transform|caster|body and equipment silhouettes swell into broad giant shape|grow to incredible size|Large transformation with clumsy cost, no attack.
glacial-prison|bind|cold|target|tight frost rings gather and harden around observed foe|covering it in frost|Save-dependent freeze; not perception scan or cold damage.
gladiators-roar|elementCone|sonic|target|high screech expands in short damage cone with fear edge|high-pitched screech|Sonic damage primary; fear/stun conditional.
glass-skin|guard|earth|caster|flickering skin patches settle into glossy obsidian layer|protective layer of magical obsidian|Later Shatter Glass separate; not stone impact.
glean-lore|focus|light|caster|divine lore fragments sift through questioning focus|collected lore of the divine|Information may be erroneous; no certainty icon.
glider-form|flight|wind|target|eidolon buoyant wing echo glides forward while descending slowly|glide slowly toward the ground|Eidolon origin; no upward Fly or source transformation.
glorious-gamtu|produce|shadow|caster|small magical hat-shaped shimmer settles into source hands|conjure a magical Gamtu Hat|Creation only, no actor form or attack.
glory-and-valor|preparation|healing|caster|mighty ascendant cry ignites minute-long vitality-ready halo|revitalizing energy|Healing only on later qualifying successful Strike.
glory-on-high|flight|light|caster|upward source echo displays holy-symbol radiance through enemy emanation|unveil the full magnificence|Save-dependent enemy dazzle/blind/mental damage, not just flight.
gnaw|strike|weapon|target|determined jaws chew repeatedly at object-level contact|unattended, inanimate object|Object damage only, not enemy spell.
go-with-the-flow|concealment|mind|caster|disguise focus transfers mistaken attention to nearby other outline|mistakenly identifies another creature|Occultism conditional; no actual teleport.
goblin-club|produce|spirit|caster|spectral club glint condenses in hand|spectral bangmangi club|Weapon conjuration, not immediate smack.
goblin-scuttle|movement|weapon|caster|quick low side-step echo follows arriving friendly edge|adjust your position|One Step only, no attack.
goblin-song|performance|music|target|silly repetitive note loop annoys selected foe attention|annoying goblin songs|Debuff check-dependent, no allied inspiration.
godspeed|preparation|light|caster|mythic speed aura frames three movement-ready echoes|speed to rival beasts and demigods|Grants speed/quickened, no actual movement now.
golden-dragons-bounty|preparation|metal|caster|familiar-tuned metal sheen changes next spell material|alters the material of a spell|Next physical spell; chosen cold iron/silver/steel/adamantine.
golden-erinys-stance|stance|weapon|caster|vengeful fang-ready hand outline settles into precise stance|fury's fang|Later critical piercing sickness, no immediate attack.
gorilla-stance|stance|weapon|caster|low imposing knuckle-walking outline plants broad fists|knuckle - walking stance|Stance only; no gorilla slam.
gossamer-blade|elementTarget|force|target|translucent weapon echo resonates through existing wound|echo of your weapon|After previous Strike, no new physical contact.
graceful-poise|stance|weapon|caster|off-hand stinger angle balances paired weapon readiness|scorpion's stinger|Improves later Double Slice; no immediate double Strike.
grand-dance|movement|wind|caster|graceful air-walking dance echo follows sloping path|walk on air as if it were solid ground|No attacks; must end supported.
grasping-reach|preparation|plant|caster|supporting vine tendrils extend two-handed weapon grip|support your arms|Grip change only, no movement or attack.
grasping-spirits-spell|preparation|spirit|caster|semi-physical apparition strands ready extended spell reach|apparitions increase the range|Next spell then save-dependent pull, no grapple now.
green-dash|movement|plant|caster|vegetation spirit burst pushes source stride echo|spirits of vegetation|Movement type optional; not default flight.
greenwatch-veteran|focus|weapon|target|tracked enemy scan becomes brief allied hand-sign information lines|relay them to your allies|Recall Knowledge check, not shield.
griefs-fury|resolve|blood|caster|bonded-partner grief ignites aggressive source wellspring|wellspring of power ignites|Attack bonus/doomed cost; later temporary HP conditional.
grit-and-tenacity|fortune|weapon|caster|stubborn bodily and mental brace reopens failed save circle|deep reserves of toughness|Reroll may fail; no healing or attack.
grovel|command|mind|target|low pleading source gesture misdirects distant foe attention|less of a threat|Ranged Feint, no direct damage.
grow-tool|produce|plant|caster|flowers vines and wood sprout into hand-sized tool shape|desired shape|Cannot create weapon; no attack.
growth-spell|preparation|plant|caster|wooden growth tendrils extend next area-casting boundary|expand and grow|Next spell area only, no terrain now.
grudging-compliment|command|music|target|unexpected praise ribbon pulls foe gaze off surroundings|unexpected praise distracts|Diplomacy conditional, no damaging sonic effect.
guarded-advance|movement|ward|caster|raised shield covers two slow cautious step echoes|Raise a Shield and Step twice|Any order; no attack or actual relocation.
guarded-advance-knight-vigilant|movement|ward|caster|one cautious step echo tucks behind raised shield plane|Step and Raise a Shield|Single Step unlike Guardian two-step version.
guarded-mind|fortune|mind|caster|anathema-backed mental barrier opens second save path|thoughts of your anathema bolster you|Mental defense reroll, may still fail.
guardian-ghosts|targetSupport|spirit|target|incoming harm ribbon diverts from source to adjacent undead|undead companion to take it|Damage transfer, not outgoing attack or companion healing.
guardian-lion-roar|lineCue|sonic|target|innovation lion-maw focus emits compact sonic line|stream of sonic energy|Innovation origin; unstable longer line optional.
guardians-deflection-fighter|targetSupport|weapon|target|precise single-blade diagonal turns incoming ally attack aside|weapon to deflect the attack|Ally defense, no enemy Strike.
guardians-deflection-swashbuckler|targetSupport|weapon|target|stylish wide blade flourish deflects ally threat into panache glint|gain panache|Ally defense, distinct flourish; no outgoing hit.
guardians-embrace|guard|spirit|caster|spirit-guide silhouette dissolves into close protective shroud|invisible protective shroud|Later resistance reaction ends bonus; no actual guide destruction.
guide-the-timeline|fortune|arcane|target|subtle two-branch timeline favors ally or burdens foe|nudge the timeline|Enemy save conditional; no direct weapon damage.
guided-by-the-stars|fortune|light|caster|star constellation opens two favorable skill paths|stars grant you insights|Double-roll only, no guaranteed success.
guided-hover|flight|wind|target|mount wing underside fills with steady thermals|outstretched wings fill|Mount hover only; no forward Fly.
guided-skill|focus|spirit|caster|spirit-guide thread steadies four skill-ready focus marks|spirit guide for aid|Skill support, not invisibility.
guiding-words|targetSupport|light|target|spoken divine guidance aligns ally weapon-ready attention|guiding blades and arrows|Future attack double-roll on skill success; no fired arrow.
guillotine-blade|preparation|shadow|caster|spectral dagger edge deepens with finality resonance|Spectral Dagger gains|Vorpal enhancement only; no beheading now.
gunpowder-gauntlet|performance|weapon|target|performative firearm brandish narrows foe attention tunnel|performatively brandish your weapon|Performance aggro penalty, no gunshot.
gusting-spell|preparation|wind|caster|air-current spell focus supports wing-ready glide marks|gracefully glide with your wings|Next air/electricity spell then Fly, no current movement.
haft-striker-stance|stance|weapon|caster|two-handed weapon rotates to present shorter haft-ready angle|leverage the haft|Stance only; no immediate staff contact.
hail-of-splinters|splinterCone|plant|target|jagged wooden fusillade scatters through broad cone|fusillade of jagged splinters|Piercing/bleed cone, no stretched vines.
halfling-luck|fortune|light|caster|cheerful lucky shimmer reopens failed check path|happy-go-lucky nature|Reroll may worse, no guarantee.
hallowed-earth|stance|vitality|caster|sanctified ground glow forms quiet death-rest perimeter|sanctifies the earth|Later enemy end-turn damage, no immediate target burst.
halyard-strike|charge|weapon|target|rope-supported swing arc carries one weapon contact|swing up to twice your Speed|One Strike; no bolt despite grappling weapon possibility.
hampering-stance|stance|weapon|caster|close braced footwork blocks narrow enemy passage perimeter|difficult for enemies to move past|No attack or magic damage.
haphazard-repair|craft|weapon|caster|quick unstable tool sparks close innovation seams|quickly fix your innovation|Repair, not attack; no automatic success.
harbingers-caw|fortune|shadow|target|ominous caw overlaps two unfavorable target roll paths|caw ominously|Enemy double-roll lower; no damage.
harden-flesh|guard|earth|caster|mineral grains rise from ground into skin defense layer|fortify your skin with minerals|Physical resistance, not all damage immunity.
hardwood-armor|guard|plant|caster|bark plates grow around body and optional hand shield|Wood and bark grow|Creation/armor only; no damage.
harmonize|preparation|music|caster|two voice-like note tracks harmonize around next composition focus|double your voice|Next composition coexistence, no immediate cast.
harness-natural-magic|absorb|arcane|caster|faint ambient magic streams naturally into internal nexus|takes in that magic|Overflow state, not perception or attack.
harrow-casting|preparation|arcane|caster|drawn harrow card opens one suit-specific casting motif|destined potential|Suit chooses effect; future cast separate, not automatic healing.
hasty-celebration|performance|music|caster|hasty singing-dancing celebration sends allied victory beats|begin to party|Allied bonus/source off-guard; no repeated attack.
head-of-the-night-parade|groundCreation|shadow|target|three riotous apparition swarms gather as dancing parade|Mad Monkeys three times|Three summon areas, not simple inspiration buff.
healers-halo|restoration|healing|target|existing source halo amplifies recovering ally vitality flash|enhance positive energy|Additional healing only on original eligible recipients.
healing-nexus|restoration|healing|caster|absorbed nexus magic stitches small wound seams outward|stitch together any wounds|Source healing, overflowing ends.
healing-transformation|preparation|healing|caster|form-ready focus weaves restorative flesh threads|shapechanging magic to close wounds|Next single-target polymorph only.
heat-wave|concealment|fire|caster|incoming fire reshapes into close heat-smoke screen|screen of heat and smoke|Defense concealment, no outgoing flame attack.
heavens-step-offense|movement|weapon|caster|mercy flourish precedes straight advance toward next enemy|theatrical flourish|Prior Strike becomes nonlethal; no additional attack now.
heavens-thunder|preparation|electricity|caster|paired electric and sonic sheaths charge fists and monk weapons|unarmed attacks and any monk weapons|Future strikes/grapples/ki blast, no current bind.
hedge-maze|groundCreation|plant|target|multiple hedge wall segments rise into remote maze perimeter|maze of hedges|No caster movement; visual terrain only.
heightened-captivation|preparation|mind|caster|charm focus layers deepen around next illusion-ready ring|charms and illusions with more power|Next spell heightening, no target attack.
hell-of-1-000-000-needles|groundCreation|metal|target|remote cube bristles with immense metal needle lattice|monumental filaments of metal|Later Sustain lightning separate; impalement save-dependent.
hellbreakers-resolve|resolve|light|caster|steadfast body-and-mind halo braces against infernal danger|steeling your resolve|Temporary HP/save bonus, not heal.
helpful-tinkering|craft|weapon|target|fine tool sparks tune adjacent ally weapon edge|fiddle with your allies' weapons|Success enhancement; critical failure harm not automatically shown.
helts-spelldance|performance|arcane|caster|ostentatious one-or-two stride dance conceals casting-ready focus|Ostentatiously performing|Selected spell optional/unknown; no fixed attack.
hematocritical|preparation|blood|caster|enemy blood essence becomes fortune-ready casting sheen|arterial fluids|Future spell fortune/misfortune; no repeat critical Strike.
henge-gate|groundCreation|earth|target|two upright rune stones rise with overhead blazing gate script|two standing stones|Later physical ammunition traces rune; no immediate shot.
heralds-weapon|preparation|spirit|caster|pure spiritual energy wreaths held weapon silhouette|wreathed in pure spiritual energy|Weapon enhancement, no immediate target contact.
heraldic-proclamation|preparation|light|caster|god-backed proclamation charges wide allied-and-foe casting rim|If the next action you use|Next spell ally heal/enemy spirit damage, not now.
heroic-defiance|resolve|light|caster|doom shadows recoil from implacable inner spirit surge|time has not yet come|Temporary HP/saves, no resurrection.
heroic-presence|command|mind|target|heroic source bearing ignites willing ally resolve rings|new level of resolve|Willing allies, not control/damage.
heroic-recovery|preparation|healing|caster|restorative focus adds movement-and-weapon invigorating spokes|invigorates the recipient|Next healing spell and optional Stand separate.
hey-over-here|targetSupport|music|target|urgent distracting gossip ribbon overrides bad auditory focus|Listen to me|Improves saving degree; no sonic damage.
hidden-paragon|concealment|shadow|caster|already hidden source outline dissolves into deep undetectable veil|When you slip out of sight|Seek still possible; no teleport.
high-alert|targetSupport|ward|target|visual or spoken warning marks ally danger-facing edge|keeping watch over your allies|Conditional enemy type protection, no all-purpose heal.
high-speed-regeneration|restoration|healing|caster|wound seams knit through decisive bodily renewal pulse|wounds knit together|Secret damage/material suppressor; no target hit.
histrionic-injury|performance|mind|caster|startled theatrical source echo flails toward attacker attention|dramatic pratfall|Attacker save-dependent stupefy, no mental damage.
hit-the-dirt|movement|weapon|caster|low evasive leap echo ends in groundward prone silhouette|fling yourself out of harm's way|Always lands prone; no upright recovery now.
holy-light|stance|light|caster|raised-arm prayer grows tall beacon cylinder around source|beacon of holy light|Light/dazzle save effect, no damage.
hone-claws|preparation|weapon|caster|gnawing or grinding glints sharpen claw outline|wicked edge onto your claws|Next successful claw Strike bleed, not immediate contact.
hop-up|movement|wind|caster|frog-legged recovery echo springs from low to upright|frog-like agility|Stand only, no attack.
hopping-stride|movement|shadow|caster|low vampiric hopping echoes alternate along ground path|hop over every other square|No jumping over creatures or real token move.
hot-foot|ranged|weapon|target|careful firearm shot sparks ground beside foe feet|shoot at the ground near a target's feet|Reflex-directed debuff, no direct foe bullet damage.
howling-aspect|form|fire|caster|vowed ire flares hair and ragged fang silhouette|hair loose into flames|Grants future attacks, no immediate fire bolt.
humble-spell|preparation|shadow|caster|minimal gestures keep casting focus dim and compact|without flamboyant gestures|Subtle next spell, no conspicuous explosion.
hungry-blade|preparation|spirit|caster|spectral dagger edge hums with tasted-soul resonance|tasted an enemy's soul|Keen enhancement against prior target only.
hunters-defense|focus|plant|caster|natural-creature knowledge projects evasive threat vectors|predict and dodge|Nature DC defense, not weapon attack.
hurricane-swing|lineCue|wind|target|previous slashing arc releases chosen wind or lightning line|Choose either Lightning Bolt or Gust of Wind|Chosen innate spell required, no replay Strike.
hydraulic-deflection|guard|water|caster|small hovering water disc catches attack-facing edge|disc of hovering water|Defense only, no watery projectile.
hypnotic-lure|command|mind|target|unblinking ocular focus draws slow attention ribbons inward|unblinking gaze|Target approaches next turn on failed save, no immediate pull.
igneogenesis|groundCreation|earth|target|adjacent kinetic stone mass rises into simple sculpted block|permanent stone object|No damage or unwilling underfoot creation.
ignite-the-sun|groundCreation|fire|target|small remote solar core blooms with bright steady corona|miniature sun|Later Sustain movement/growth separate; not flying fire bolt.
iivlars-deflection|guard|ward|caster|skin-woven silk threads brace against grievous contact|silk woven into your skin|Flat-check conditional critical reduction, no heal.
ill-tide|fortune|water|target|unlucky tide ripple keeps target's failed fate circling|keep it going|Future roll twice lower, no actual water damage.
imbue-spell|targetSupport|arcane|target|completed spell energy folds into allied held reservoir|pass the energy of your magic|Ally releases later; no normal spell effects now.
immovable-object|stance|earth|caster|wide planted feet anchor grounded resistance lines|plant your feet|Forced movement immunity, no wind dash.
impassable-wall-stance|stance|weapon|caster|blocking guard silhouette closes narrow passage angles|refuse to let foes past|Future critical Reactive Strike move disruption separate.
imperious-aura|stance|arcane|caster|majestic kinetic glow prepares chosen aura stance|Use a stance impulse|Specific stance choice unknown; no immediate damage.
implausible-infiltration|movement|shadow|caster|source outline narrows through tiny wall-seam echo|tiny imperfections|Surface/material limits; no universal teleport.
impose-order|fortune|arcane|caster|ordered reality grid straightens chaotic failed check path|baseline of order|Fixed skill result or cancels misfortune, not reroll.
impose-order-psychic|resolve|mind|caster|disciplined psychic rings align into evenly measured damage focus|discipline to your mind and magic|Averages future damage dice, no sonic inspiration.
impossible-flurry|doubleStrike|weapon|target|paired weapon arcs alternate through six discernible contact beats|three melee Strikes with each|Six Strikes, not generic two-hit utility.
impossible-technique|fortune|wind|caster|impossible defensive echo splits enemy hit from failed-save path|maneuver that defies possibility|Attack lower reroll or save higher reroll, no guaranteed evade.
impressive-landing|elementAura|earth|caster|downward landing echo shatters small ground ring outward|slam into the ground|Ground debris damage and terrain, not target magic burst.
imprison-foe|bind|teleport|target|prior damaged foe is framed by closing extradimensional cell|extradimensional prison|Save-dependent prison; no caster teleport or actual actor removal.
improvise-admixture|craft|arcane|caster|scrounged reagent motes mix into small vial-ready swirls|produce a few more versatile vials|Crafting outcome, not flight from on-the-fly wording.
improvise-strategy|command|mind|target|unpredictable tactical lines distract enemy attention|inventing unpredictable tactics|Check/condition selection; no mind damage.
improvised-repair|craft|weapon|target|rough improvised seams patch broken equipment outline|patch damaged equipment|Restores no HP; not healing magic.
in-lightning-life|targetSupport|electricity|target|small toolkit-coil arc gently jolts adjacent ally vitality edge|gently shock|Temporary HP, not damage or caster ward.
in-the-hordes-grip|bind|shadow|target|horde claws mob target then clutch surrounding grip bands|skeletal claws and rotting hands|Horde origin; grab/restrain save-dependent, not inspiration.
in-tune|preparation|music|caster|composition focus routes rhythmic area center toward willing ally|area spreads from a willing ally|Next composition origin change only.
incredible-improvisation|focus|mind|caster|sudden brilliant skill glint resolves unfamiliar diagram|stroke of brilliance|Skill bonus, no mastery promise.
incredible-recollection|focus|mind|caster|five rapid but readable memory scan panels unfold|up to 5 Recall Knowledge|Knowledge checks, no attacks.
incriminating-spell|preparation|mind|caster|mental casting signature bends toward framed other source|blame someone else|Next spell false attribution, no current mind attack.
indomitable-shot|lineCue|weapon|target|single physical warshard shot penetrates sequential aligned foes|single shot that penetrates multiple foes|One continuous physical line, not caster fan-out.
indomitable-spirit|targetSupport|spirit|target|accumulated soul quintessence envelops adjacent friendly outlines|you and your comrades|AC/quickened support, no immediate Stride/Strike.
infiltrators-reload|preparation|weapon|caster|quiet loading glint precedes coverward fading silhouette|reload a weapon|Hide/Sneak/Cover choice; no shot.
infinite-expanse-of-bluest-heaven|groundCreation|mind|target|remote sky-blue illusion opens bottomless falling depth|impossibly blue sky|Illusory disorientation, no wind damage or actual falling.
infuse-void|preparation|void|caster|dark grave energy threads into next casting focus|next action you use|Future damage/focus conditional, no immediate void hit.
infused-with-belkzens-might|preparation|spirit|caster|orc-conquest tattoo echo channels spiritual weapon sheath|power into your own weapons|Enhancement only, no current target contact.
inhale-exhale|preparation|wind|caster|especially deep chest inhale expands breath-ready outline|prelude to unleashing|Next Dragonet Breath cone/line, not actual breath now.
inked-panoply|guard|spirit|caster|tattoo lines animate into spectral shield-bearer silhouette|spectral shield-bearer|Defense only, not summon actor.
inner-strength|resolve|blood|caster|gathered rage tightens muscles against enfeebling constraint|gather your strength and rage|Reduce enfeebled only, no HP heal or attack.
inscribed-blast|elementTarget|force|target|body-inscribed rune fades while adjacent offender receives force flash|inscribed runes fade|Adjacent triggering target; no ranged missile.
inspiring-marshal-stance|stance|light|caster|poised dedication halo opens steady allied resolve perimeter|dedication and poise|Entry check conditional; not attack.
inspiring-recitation|resolve|mind|caster|quiet coded phrase lines settle into single mission focus|quietly speak or recall coded phrases|Self skill boost, not universal allied inspiration.
inspiring-resilience|command|ward|target|source defiance ripple bolsters allied mental defenses|companions to persevere|Fear/mental save defense, not inflicting fear.
inspirit-hazard|rune|spirit|target|disabled hazard mechanism receives small creation-spirit glow|spirit of creation|Later rearm reaction separate; no trap attack now.
instant-army|groundCreation|shadow|target|many small necromantic spawn glints distribute across selected spaces|up to 20 thralls|Creation only; no immediate thrall attacks.
instant-backup|preparation|weapon|caster|misfired weapon echo drops while alternate weapon glint rises|quickly draw a backup|Weapon swap, no second shot.
instant-opening|command|mind|target|rude gesture or choice words expose single foe opening angle|few choice words|Off-guard only, no damage.
instigate-psychic-duel|bind|mind|target|paired source-target psychic centers open shared illusory duel frame|enter a psychic duel|Save-dependent duel, no immediate mind blast.
instinctive-obfuscation|concealment|mind|caster|one illusory double briefly overlaps source silhouette|illusory double of you|Double may intercept, no teleport or attack.
instinctive-support|command|plant|target|post-spell companion bond sends supporting attention loop|companion supports you|Actions/support grant, no extra companion Strike.
instinctual-creation|groundCreation|shadow|caster|two adjacent necromantic outlines appear on initiative beat|create two thralls|Creation only, not magical attacks.
intensified-element-stance|stance|arcane|caster|consumed elemental medicine brightens matching offense-ready body glow|elemental medicine in your body|Element chosen from medicine; future conditional damage.
intensify-investiture|preparation|arcane|caster|invested item bond receives stronger focused inner filament|more of yourself into them|Next item activation only.
interfering-surge|command|arcane|target|overcharging magic strains enemy casting focus into unstable knot|overcharge the triggering spell|Counteract conditional; surge origin depends result.
internal-dialogue|fortune|mind|caster|past-self whispers reopen failed skill diagram|past selves whisper|Incarnation Lore substitution, no reroll guaranteed success.
interrogate|command|mind|target|sharp question line pins conversing foe attention|Ask a question|Intimidation conditional; answers may be false.
interrupt-charge|bind|weapon|target|free-hand snag catches departing foe motion line|snag the foe|Movement disruption/slow check-dependent; no Strike.
interstitial-escape|teleport|teleport|caster|defensive blink slips between incoming contact lines|shift yourself to another location|No actual token move; resistance, not universal miss.
interweave-dispel|preparation|arcane|caster|dispelling thread weaves into next single-target casting focus|weave dispelling energy|Future on-hit/fail Dispel Magic optional; no damage now.
intimidating-spell|preparation|fear|caster|large-scale casting focus gathers threatening jagged rim|particularly terrifying|Next area damage spell adds fear conditionally.
into-the-future|preparation|arcane|caster|ready spell focus suspends between offset time rings|cast your magic into the future|Next spell delayed one round; no immediate attack.
intuitive-illusions|focus|mind|caster|existing illusory shimmer receives effortless sustain beat|effortlessly sustain your magical ruses|Sustain only; no new illusion.
invented-vulnerability|command|mind|target|confident weak-point story sketches target physical fracture marks|speaking with such certainty|Deception-dependent weakness, no damage.
invigorating-surge|targetSupport|arcane|target|existing spellsurge energy forms ally buffer shell|protect a nearby ally|Temporary HP, not healing or source-only shield.
invincible-army|targetSupport|mind|target|convincing victory tale layers defensive ally story halo|story of their invincibility|Check-dependent resistance, not absolute invincibility.
invoke-defense|form|spirit|caster|spirit hide or bark quality thickens body edge|defensive quality of spirits|One damage resistance; no attack.
invoke-movement|form|spirit|caster|chosen spirit locomotion feature appears along body outline|form of locomotion|Burrow/climb/fly/swim choice, no default flight.
invoke-offense|form|spirit|caster|spirit claw or vine feature grows into unarmed-ready outline|physical attack of the spirits|Grants attack, does not make one now.
invoke-the-elements|stance|arcane|caster|heritage-specific heat snow wave or storm veil surrounds source|aura of shimmering heat|Later adjacent end-turn damage; choose heritage element.
iomedaes-valor|resolve|light|caster|mortal bravery keeps last life ember behind short guard rim|mortal bravery|One HP survival/buffer, no resurrection.
ironblood-stance|stance|metal|caster|impenetrable iron body silhouette settles into grounded guard|stance of impenetrable iron|Later sweep attacks separate.
ironblood-surge|guard|metal|caster|steel-like muscle brace hardens existing stance outline|muscles to absorb the impact|Defense surge, no iron sweep attack.
irradiate|stance|poison|caster|radiation shimmer expands from source through sickly emanation|aura of radiation|Save-dependent sickness; damage only awakened variant.
irresistible-bloom|command|plant|caster|body flowers open into pleasant scent-and-color attraction halo|sprouting flowers|Fascination/next-turn approach conditional; no immediate pull.
iruxi-glide|flight|wind|caster|reptile gliding silhouette drifts slowly down and forward|glide slowly toward the ground|No upward flight, magic burst, or attack.
it-was-me-all-along|movement|mind|caster|disguise peels away in dramatic reveal then feintward stride echo|dramatically reveal your true identity|Feint and future attack fortune conditional, no Strike now.
its-not-over|restoration|healing|caster|dramatic fallen finale reverses into springing life pulse|spring back into action|HP recovery rather than temporary buffer.
jagged-berms|groundCreation|earth|target|six packed-earth mound cues rise with wooden stake edges|cube-shaped mounds|Later entering stakes damage; no target hit now.
jellyfish-stance|stance|water|caster|loosened joint silhouette sways with fluid stinging-lash readiness|incredible fluidity|No immediate lash contact.
jesters-gambol|stance|wind|caster|carefree unpredictable stance echoes slide around impediment lines|sublimely unpredictable|Resistance and terrain immunity, no attack.
jotuns-battle-stance|stance|weapon|caster|ancestral broad two-handed guard extends long weapon-ready edge|battle stance of your forebears|Reach stance, no Strike.
jotuns-grasp|bind|weapon|target|short gap-closing step echo ends in wrestling grip bands|Step and attempt|Grapple conditional, no direct damage.
juggle|performance|weapon|caster|small carried-item arcs rotate above alternating hand glints|still use your hands between tosses|Juggling only, not shield or attack.
just-as-planned|preparation|mind|caster|calculated enemy-path diagram opens two stratagem-ready outcomes|calculate your enemy's movements|Next Devise roll twice, no attack now.
just-one-more-thing|fortune|mind|target|pointed additional question reopens failed influence thread|another bit of information|Reroll may fail; no magical damage.
just-the-tool|form|weapon|caster|mind-weapon silhouette reshapes into mundane hand tool|morph your weapon|Tool/weapon conversion, no attack.
ka-stone-ritual|form|earth|caster|forehead ka-stone name seal glows into enlarging source outline|Enlarge on yourself|Activation choice from later feat; no actual long ritual now.
kaiju-stance|stance|earth|caster|large heavy silhouette grows into earth-shattering ready stance|become Large|Future critical splash separate; clumsy cost remains.
kaleidoscopic-entreaty|preparation|light|caster|entreat-ready spirit focus gathers multicolor show fragments|next action is to cast Entreat Spirit|Later emanation dazzle/blind conditional.
kashrishi-revivification|restoration|mind|caster|psychic well rises through fallen body as returning consciousness|well of psychic energy|One HP restoration, wounded still increases.
keep-pace|movement|weapon|caster|close pursuit echo follows retreating prey-side trail|keeping it in reach|Stride default, other movement only if available; no attack.
keep-up-the-good-fight|resolve|ward|caster|protective commitment braces last life ember with short buffer|commitment to protecting others|One HP plus temporary buffer, wounded cost.
killshots-report|elementBolt|arcane|target|fallen Spellstrike foe emits loud spell-energy echo to secondary foe|chain the spell's energy|Previous-target origin, actual spell semantics configurable.
kindle-inner-flames|stance|fire|caster|faint friendly embers drift across source and allied edges|faint, glowing embers|Later movement/Strike effects separate.
kinetic-dampening|guard|force|caster|soundless absorbing field softens incoming physical wave|dampen the force|Resistance, not all damage prevention; awakening area optional.
kip-up|movement|weapon|caster|compact grounded recovery echo snaps to upright poise|You stand up|Stand only, no arcane effect.
kneel-before-the-rightful-heir|command|mind|target|royal command pressure hangs over visible enemy heads|bow down before you|Mental save damage; prone ends persistent effect, not automatic kneeling.
knockback-spell|preparation|force|caster|area-casting focus adds outward push-ready rim|magical force to knock creatures back|Next spell failures cause push, no immediate shove.
know-oneself|resolve|mind|caster|mindfulness center steadies emotional collapse ring|mindfulness and self-knowledge|Critical failure becomes failure, not full success.
know-thy-doom|fortune|shadow|caster|legendary demise thread opens two recovery possibilities|not yet your time|Recovery roll and doom reduction, no guaranteed heal.
know-your-enemy|focus|weapon|target|strategic enemy inspection receives allied aid lines|knowledge into power|Recall Knowledge only, not attack.
knowledge-of-shapes|preparation|arcane|caster|inspired casting geometry stretches range or widens boundary|Reach Spell or Widen Spell|Spellshape choice, no cast or target effect.
kobold-breath|elementCone|arcane|target|benefactor-scaled mouth torrent opens small cone or thin line|torrent of energy from your mouth|Chosen benefactor element/shape, no universal fire.
krakens-call|groundCreation|water|target|remote dark-water portals extend grasping tentacle silhouettes|dozen small portals|Save-dependent crush/grab; no arcane target-only impact.
kreightons-cognitive-crossover|focus|mind|caster|failed clue track crosses into alternate knowledge pathway|most unlikely of sources|New chosen-skill check, not automatic knowledge.
lassoing-lash|bind|weapon|target|lash loop wraps target and pulls toward source-side landing cue|wrap your lash|Athletics conditional; no actual forced movement.
lava-leap|movement|fire|caster|molten body leap lands in lava wave then cooling stone shell|wave of lava crashes|Movement then emanation then guard, not just fire dash.
lead-the-way|movement|weapon|target|source forward echo opens following adjacent ally lane|opening for others to follow|Ally reaction optional; no attack.
leading-dance|performance|weapon|target|paired adjacent source-foe echoes follow a shared dance direction|sweep your foe into your dance|Check-dependent movement only; no damage.
left-hand-blood|preparation|poison|caster|self-cut blood trail coats held weapon with venom|poison a weapon|Self slashing cost, no healing or target hit now.
legend-of-combat|preparation|weapon|caster|legendary readiness glow frames extra reaction timing marks|gain an extra reaction|Future Speed of Arms, no immediate blows.
legendary-negotiation|command|mind|target|rapid diplomatic opening unfolds into peaceful request ribbon|engage in negotiations|Social request may fail, no mental domination.
leshy-superstition|fortune|plant|caster|nearby lucky object spirit glints into saving focus|power of a lucky object|Save bonus only, no actual reroll.
lesson-of-mutual-gambits|targetSupport|weapon|target|successful feint opening passes tactical advantage to student|opening for your student|Future student attack, no repeated feint Strike.
lesson-of-sympathetic-vulnerability|preparation|arcane|caster|student energy echo temporarily sheathes source attacks|borrow the essence|Damage-type preparation, no immediate hit.
lesson-of-the-broken-wing|command|weapon|caster|tempting vulnerable source pose draws enemy focus off student|tempting target|Source AC cost/student attack bonus, no guaranteed hit.
lesson-of-the-circling-gale|movement|wind|caster|source step echo mirrors optional student's trailing step|mirror each other's movements|No actual movement; ally reaction optional.
lessons-of-flux|fortune|mind|caster|failed maneuver lines permute into second attempt focus|persistence and permutation|Maneuver reroll and failed-result knowledge, no duplicate grapple.
lets-try-that-again|fortune|spirit|caster|past-life deja-vu echo resets failed skill track|sense of deja vu|Reroll may worse; not Recall Knowledge.
lethal-edge|elementTarget|spirit|target|existing spectral dagger wound echoes past-life anguish ring|anguish of every life|Debilitation only, no second dagger Strike.
leverage-anguish|restoration|healing|caster|emotional turmoil spirals inward then mends physical wound light|mend your physical form|Self healing after failed save; no curse removal.
levered-swing|movement|weapon|caster|lash anchor tether pivots source echo in broad swing arc|pivot around the anchor|Supported swing not wing flight; fall possible.
ley-line-conduit|preparation|plant|caster|world ley lines rise into slot-conserving spell focus|ley lines of the world|Next eligible spell only, no cast now.
liberate-soul|targetSupport|light|target|Pharasma spiral light cuts imprisoning soul bands|shatter the bonds imprisoning a soul|Counteract conditional; no direct damage.
liberated-mind|fortune|mind|caster|mental captivity ring cracks into reopened save path|mind won't be held hostage|Save reroll, not perception or attack.
liberating-dive|flight|metal|target|steel-feather dive cuts foe once and opens friendly restraint ring|slicing foes and restraints|One metal Strike plus ally escape/newsave, not just flight.
life-leap|teleport|light|caster|colorful source echo phases through adjacent life silhouette|opposite side|Same creature opposite-side blink, no attack or actual move.
life-giving-magic|resolve|vitality|caster|finished innate magic wells into small life buffer glow|refreshes your body|Temporary HP, no actual healing or repeat spell.
lifes-blood|restoration|blood|target|source blood strand coats adjacent ally wounds|coating its wounds with your blood|Source HP sacrifice equals ally healing; no enemy damage.
light-paws|movement|wind|caster|toe-balanced long stride echo pairs with short careful step|balance on your toes|Either order, no attack.
lightning-dash|movement|electricity|caster|body becomes narrow lightning line then reforms at endpoint|being of pure lightning|Traversal electric contacts; not stationary transformation only.
lightning-qi|preparation|spirit|caster|inner qi flows freely into compact shortened-cast focus|Qi flows freely|Next qi spell reduced action, not electricity attack.
lightning-rod|strike|metal|target|metal rod contact anchors subsequent targeted lightning flash|smash a metal rod|Melee/ranged Blast choice; lightning only on hit.
lightning-swap|preparation|weapon|caster|held-item echoes stow then paired weapon glints draw|switching between combat styles|Equipment swap only, no electric attack or shield spell.
lightning-tongue|produce|weapon|caster|thin tongue-like retrieval line draws small object to source|retrieve loose objects|Object Interact, not electricity or enemy attack.
live-off-borrowed-time|time|arcane|caster|future clock tick folds into current action-ready focus|steal a bit of time|Quickened now/slowed later; no actual timeline mutation.
live-the-creed|stance|light|caster|swift divine creed focus blooms chosen battle aura|cast a battle aura|Aura choice unknown; no immediate weapon hit.
living-bonfire|groundCreation|fire|target|remote living roots and branches assemble stable bonfire|conjure a bonfire|Later wood Blast burning logs separate, no bolt now.
living-for-the-applause|resolve|music|caster|last life ember rises toward hopeful audience attention glints|audience cheering you on|One HP survival; applause/AC check-dependent.
lock-on|focus|weapon|target|mechanical aim marker brackets observed foe weak point|enemy's weak point|Next construct Command boosts attack, no current shot.
log-roll|movement|earth|target|shuffling foot echoes destabilize shared narrow ground strip|shuffle your feet|Check-dependent fall, no target damage.
long-nosed-form|form|transform|caster|bird silhouette folds into imperfect long-nosed human echo|curious-looking human form|Disguise not invisibility; loses beak attack.
look-again|preparation|mind|caster|charm focus retains trailing second-attempt illusion copy|cast them again|Failed next spell recast next turn, not immediate duplicate.
look-but-dont-touch|stance|poison|caster|beautiful floral outer edge gains toxic contact sheen|beautiful to look upon but deadly to touch|Future contact damage, no target attack now.
lord-of-the-fiends|focus|shadow|target|multiple fiend outlines receive overlord-like assessment scan|assess them at a glance|Recall Knowledge and social mastery, no domination.
lose-your-chains|command|light|target|rebellious voice opens ally restraint bands toward escape focus|break free of their bonds|Ally Escape check at mythic, not automatic release.
lucky-escape|fortune|weapon|caster|coincidental low duck echo disrupts perfect incoming aim line|coincidental distraction|Enemy attack twice lower; no extra movement/attack.
lunging-spellstrike|strike|arcane|target|staff segments extend on magical strands into distant spell contact|exceptionally long|One staff Spellstrike, not generic utility sparkle.
lunging-stance|stance|weapon|caster|coiled source posture holds extended reactive blade angle|body coiled to strike|Future Reactive Strike, no immediate lunge.
maelstrom-flow|preparation|arcane|caster|improvised weapon absorbs volatile property-rune swirl|overloaded energy|Enhancement only; eventual destruction not immediate.
mages-field-dressing|restoration|arcane|target|pure magic threads and bandages dress existing ally wounds|glowing threads, bandages|Battle Medicine check; no repeat wizard spell.
magical-onslaught|strike|arcane|target|eidolon melee contact opens follow-up caster cantrip discharge|eidolon makes a melee Strike|Two origins; cantrip semantics chosen, not two weapon attacks.
magitaxis|movement|arcane|caster|source echo reflexively follows matching spell energy toward caster|move reflexively toward the source|Stride default, other types optional; no attack.
magnetic-field|stance|metal|caster|chosen-polarity field curves small metal motes inward or outward|Choose a polarity|Attract/repel choice, no direct damage.
magnetic-pinions|ranged|metal|target|up to three magnetically propelled metal fragments fly to foes|Small pieces of metal fly from you|Flying projectiles, not actor flight; attack contacts conditional.
magpie-snatch|movement|weapon|caster|two quick stride echoes snatch passing shiny object glint|snatching a shiny item|Object pickup, no foe attack.
maguss-analysis|focus|arcane|target|fighting assessment scan flows back into recharged Spellstrike focus|assessment informed by your knowledge|Knowledge/recharge only, no actual Strike.
maidens-mending|resolve|vitality|caster|finished bloodline magic wells into brief new-life buffer|magic that flows through your blood|Temporary HP, no spell replay.
make-do|craft|weapon|caster|broken held tool outline steadies with rough improvised brace|act in a pinch|Ignores broken temporarily, does not repair HP.
malleable-form|form|transform|caster|current battle-form echo shifts into alternate same-spell silhouette|different battle form|Existing polymorph only, duration reduced.
malleable-movement|movement|weapon|caster|weapon flexes into leap-supporting pole or hook echo|long flexible pole|Enhances current Leap, no attack.
maneuvering-spell|movement|arcane|caster|casting energy releases short step leap or upright recovery echo|Step, Leap, or Stand|Choice required; no extra spell attack.
manifold-conduit|preparation|spirit|caster|multiple spirit wisps gather into cyclone-ready focus|multiple spirits at once|Grants Entreat the Many, not instant summon or attack.
march-of-the-dead|command|shadow|target|thrall movement echoes converge into three-point surrounding grip|horde of thralls|Enemy encumber/slow only adjacent3/savefail, no caster dash.
march-the-mines|movement|earth|target|paired leader-and-follower ground trails burrow through earth|lead an ally along|Stride/Burrow twice choice; no attacks.
marine-jet|movement|water|caster|straight fast underwater trail carries five spaced swim echoes|shoot through the water|No elemental projectile or damage.
marked-for-rebuke|preparation|spirit|caster|divine punishment mark readies inside casting focus|fit for further punishment|Next damaged target weakness, no sonic blast now.
martyr|preparation|blood|caster|personal vitality ribbon readies transfer alongside healing focus|channel your own vitality|Next ally Heal/Harm with self HP cost, not now.
martyrs-parry|targetSupport|weapon|target|parry weapon interposes across bonded partner incoming attack|intercede to absorb|Damage transferred if still hits; no source invulnerability.
mask-of-pain|elementTarget|mind|target|warmask pain echo presses into already-demoralized foe mind|manifestation of your pain|Mental damage follow-up, no repeat Demoralize.
mask-of-rejection|fortune|fire|caster|warmask white-hot fury burns into reopened saving focus|white-hot fury|Save reroll, not fire damage to enemy.
masked-casting|guard|mind|caster|eyeless-mask shimmer shields visual-facing attention edge|eyeless mask|Avert Gaze and disbelief defense; no ordinary shield spell.
masquerade-of-seasons-stance|stance|arcane|caster|opening dance steps turn through chosen seasonal veil|spring, summer, winter, and autumn|Chosen resistance; no immediate elemental attack.
master-of-many-styles|stance|weapon|caster|fluid style outlines transition into chosen tactical stance|move fluidly between stances|Chosen stance unknown; no automatic attack.
masters-counterspell|command|arcane|target|master-tradition counter pattern interrupts foe casting focus|magic to disrupt it|Counteract conditional, no damage.
megavolt|lineCue|electricity|target|innovation electric reservoir bleeds into short damaging line bolt|electric power from your innovation|Innovation origin; unstable larger line optional.
meld-into-eidolon|form|transform|caster|source physical silhouette converges into eidolon form outline|you become them|Form merge, not sonic inspiration; no attack.
melodious-spell|preparation|music|caster|subtle casting threads hide inside restrained performance notes|weave your spellcasting into a performance|Optional social action, next spell no showy rune explosion.
memory-of-nothing|command|mind|target|look-and-gesture fractures target complex-action memory diagram|struggle to remember|Later complex activity damage, not inspiration/heal.
memory-of-skill|focus|spirit|caster|previous-life training echo settles into one skill focus|training in a previous life|Temporary proficiency, not movement.
mental-static|elementTarget|mind|target|resisted mind intrusion rebounds as stinging thought interference|Your thoughts sting back|Targets mental-effect source; optional image, no repeat effect.
mercenary-reversal|command|mind|target|persuasive tactical argument reframes enemy alliance threads|list of reasons why it should join|Save-dependent allegiance, no mental damage.
merciless-rend|elementTarget|blood|target|two existing eidolon cuts pull apart into one ripping wound pulse|eidolon rends|Automatic secondary damage follow-up, no two new Strikes.
mesmerizing-gaze|command|mind|target|locked gaze draws target attention into slow concentric eye rings|unable to look away|Fascination save-dependent, no damage.
metabolize-element|absorb|arcane|caster|incoming elemental particles metabolize into movement-ready source glow|metabolize the elemental particles|Quickened grant, no immediate movement or attack.
metal-carapace|guard|metal|caster|bent rusty metal sheets build fragile armor shell|bent and rusted metal|Armor and optional shield; shatters on later critical damage.
metallic-skin|guard|metal|caster|thick elemental metal plating slowly covers natural skin|covering your skin with thick metal|Resistance/AC and speed penalty; later fire bonus separate.
meteoric-spellstrike|ranged|arcane|target|ranged spell contact returns narrow energy trail toward source|from your target back to you|Intermediate line damage excludes endpoints; not generic target impact.
mind-shards|elementCone|mind|target|mind weapon swings then breaks into psychic shard cone|burst of psychic shards|Weapon reforms after; no physical splinter bleed.
mineral-deposits|preparation|metal|caster|bloodstream precious-metal sheen lines chosen natural weapon|Precious metals from your bloodstream|Metal-type enhancement, no immediate Strike.
minor-omen|fortune|light|caster|night-sky warning constellation reopens reflex-save focus|stars warn you of danger|Reroll may fail; no attack.
miraculous-intervention|command|light|target|whispered divine intervention interrupts adjacent hostile reaction ring|foil an enemy's response|Level-based disruption or attack roll, no damage.
miraculous-repair|craft|arcane|target|geniekin wish shimmer temporarily realigns mundane mechanism|wish it back into a functional state|Temporary functional repair, not creature heal.
mirror-refuge|concealment|teleport|caster|source silhouette folds into adjacent reflective plane|meld into an adjacent mirror|Refuge not target damage; mirror break harm later.
mist-escape|form|water|caster|fallen body disperses into low coffinward mist silhouette|You Turn to Mist|Not conscious healing; no immediate reconstitution.
misty-transformation|concealment|water|caster|new form releases low hazy cloud around occupied footprint|Wild mists cover your form|Concealment cloud after transformation, no repeat polymorph.
mixed-maneuver|bind|weapon|target|two distinct maneuver cues flow sequentially between grip and balance lines|Choose any two|Chosen maneuvers same/different targets; no two generic weapon hits.
mobile-shot-stance|stance|weapon|caster|loaded ranged weapon readiness aligns with nimble source footwork|shots become nimble and deadly|Stance only; no shot or Reactive Strike now.
mockingbirds-disarm|bind|weapon|target|passing tumble echo flicks foe wrist and weakens weapon grip|strike at a foe's wrist|Disarm check, not new damaging Strike.
`;

const tempoFor = (motif) => ['preparation','focus','craft','rune'].includes(motif) ? 'measured' : ['absorb','restoration','form','groundCreation'].includes(motif) ? 'build then settle' : 'anticipation then release';
const noContact = new Set(['preparation','focus','craft','rune','form','stance','guard','restoration','targetSupport','command','produce','teleport','movement']);
// Explicit review details where basic activity class is insufficient.
const details = {
  'bone-burst':{origin:'thrall',contacts:{count:1,distribution:'thrall to triggering creature',conditional:true}},
  'borrowed-ability':{origin:'target',contacts:{count:0,distribution:'touch-linked inward transfer',conditional:true}},
  'brain-drain':{origin:'target',contacts:{count:0,distribution:'target to source siphon',conditional:true}},
  'brandishing-draw':{motif:'drawStrike',contacts:{count:1,distribution:'single target',conditional:true},weapon:'drawn weapon'},
  'cascading-ray':{origin:'previous target',contacts:{count:1,distribution:'previous target to different target',conditional:true}},
  'chain-of-words':{origin:'rune',contacts:{count:1,distribution:'line between two rune endpoints',conditional:true}},
  'cornered-animal':{contacts:{count:2,distribution:'two different flanking targets',conditional:true}},
  'cranial-detonation':{origin:'fallen target',contacts:{count:1,distribution:'fallen-target centered emanation; later chain conditional',conditional:true}},
  'cross-the-final-horizon':{contacts:{count:3,distribution:'single target after approach',conditional:true}},
  'constricting-hold':{origin:'eidolon',contacts:{count:1,distribution:'existing gripped target',conditional:true}},
  'devastating-spellstrike':{motif:'spellstrike',contacts:{count:1,distribution:'single target plus neighboring splash',conditional:true}},
  'defend-summoner':{origin:'eidolon',contacts:{count:0,distribution:'summoner support',conditional:false}},
  'deflecting-shot':{contacts:{count:0,distribution:'intercept beside ally',conditional:false}},
  'demon-slayer':{contacts:{count:1,distribution:'single demon; death burst conditional',conditional:true}},
  'desiccating-inhalation':{origin:'cone targets',contacts:{count:0,distribution:'cone to source siphon',conditional:true}},
  'desperate-revival':{origin:'emanation targets',contacts:{count:0,distribution:'area to source siphon',conditional:true}},
  'dispelling-spellstrike':{motif:'spellstrike',contacts:{count:1,distribution:'single target then conditional counteract',conditional:true}},
  'distracting-spellstrike':{contacts:{count:1,distribution:'single target after feint',conditional:true}},
  'drive-by-attack':{origin:'vehicle',contacts:{count:1,distribution:'single target during movement',conditional:true}},
  'eidolons-retort':{origin:'eidolon',contacts:{count:1,distribution:'single triggering target',conditional:true}},
  'eidolons-trample':{origin:'eidolon',contacts:{count:1,distribution:'different targets along movement path',conditional:true}},
  'elemental-artillery':{origin:'ballista',contacts:{count:1,distribution:'single ranged target',conditional:true},weapon:'elemental ballista bolt'},
  'engine-of-destruction':{origin:'construct',contacts:{count:1,distribution:'each different foe within construct range',conditional:true}},
  'ensnaring-disarm':{contacts:{count:0,distribution:'disarmed item to student',conditional:false}},
  'essence-overflow':{origin:'spectral dragon',contacts:{count:1,distribution:'dragon-centered emanation',conditional:true}},
  'exsanguinate':{origin:'target',contacts:{count:0,distribution:'existing wound to source life reserve',conditional:false}},
  'flamboyant-leap':{contacts:{count:1,distribution:'single target during leap',conditional:true}},
  'flensing-slice':{contacts:{count:0,distribution:'existing paired target wounds',conditional:false}},
  'flying-flame':{origin:'source then previous target',contacts:{count:1,distribution:'ordered path through different targets',conditional:true}},
  'forward-gaze-into-life':{contacts:{count:2,distribution:'two opposed cones',conditional:true}},
  'four-winds':{contacts:{count:0,distribution:'up to four different willing allies',conditional:false}},
  'gossamer-blade':{contacts:{count:0,distribution:'existing wound force echo',conditional:false}},
  'guardian-lion-roar':{origin:'innovation',contacts:{count:1,distribution:'aligned line targets',conditional:true}},
  'guardian-ghosts':{origin:'source',contacts:{count:0,distribution:'harm transferred to adjacent undead companion',conditional:false}},
  'halyard-strike':{contacts:{count:1,distribution:'single target during swing',conditional:true}},
  'hot-foot':{contacts:{count:0,distribution:'ground beside target feet',conditional:true},weapon:'loaded firearm'},
  'impossible-flurry':{motif:'multiStrike',contacts:{count:6,distribution:'single target; three contacts each weapon',conditional:true},weapon:'two melee weapons',tempo:'six readable alternating weapon beats'},
  'in-the-hordes-grip':{origin:'horde',contacts:{count:1,distribution:'horde area targets then grip',conditional:true}},
  'indomitable-shot':{motif:'throughShot',contacts:{count:1,distribution:'one projectile through different aligned targets',conditional:true}},
  'killshots-report':{origin:'previous target',contacts:{count:1,distribution:'fallen target to different secondary target',conditional:true}},
  'left-hand-blood':{contacts:{count:0,distribution:'source self-cut into held weapon',conditional:false}},
  'lesson-of-mutual-gambits':{contacts:{count:0,distribution:'previously feinted foe to student-ready opportunity',conditional:false}},
  'liberating-dive':{contacts:{count:1,distribution:'single foe contact plus separate ally restraint release',conditional:true}},
  'lightning-dash':{contacts:{count:1,distribution:'different targets along source movement line',conditional:true}},
  'lightning-rod':{contacts:{count:1,distribution:'single target then on-hit lightning',conditional:true},weapon:'metal rod; melee or ranged elemental blast'},
  'lunging-spellstrike':{motif:'spellstrike',contacts:{count:1,distribution:'single target extended staff contact',conditional:true},weapon:'staff'},
  'magical-onslaught':{motif:'spellstrike',origin:'eidolon then summoner',contacts:{count:1,distribution:'same target melee then cantrip',conditional:true}},
  'magnetic-pinions':{contacts:{count:3,distribution:'up to three different targets',conditional:true},weapon:'magnetically launched metal fragments'},
  'march-of-the-dead':{origin:'thralls',contacts:{count:0,distribution:'three-thrall surrounding condition; not attack',conditional:true}},
  'megavolt':{origin:'innovation',contacts:{count:1,distribution:'aligned line targets',conditional:true}},
  'merciless-rend':{origin:'eidolon',contacts:{count:0,distribution:'same target two existing wounds',conditional:false}},
  'meteoric-spellstrike':{contacts:{count:1,distribution:'ranged target contact; return line through intermediate different targets',conditional:true}},
  'mixed-maneuver':{contacts:{count:2,distribution:'same or different targets with two chosen maneuvers',conditional:true}},
  'mockingbirds-disarm':{contacts:{count:0,distribution:'existing passed foe wrist',conditional:true}},
};
const reviews = {};
if (!Object.keys(frozenSources).length) {
  for (const row of reviewedRows.trim().split('\n')) {
    const slug = row.split('|')[0];
    const feat = PF2E_FEATS.find(f => f.slug === slug);
    if (!feat) throw new Error(`Cannot freeze absent source ${slug}`);
    const hash = sha256(feat.description);
    if (hash !== feat.descriptionHash) throw new Error(`Catalog source hash mismatch ${slug}`);
    frozenSources[slug] = [feat.id, hash, sha256(feat.plainDescription)];
  }
  // One-time snapshot: regeneration must never silently re-authorize changed text.
  const source = readFileSync(new URL(import.meta.url), 'utf8');
  writeFileSync(new URL(import.meta.url), source.replace('const frozenSources = {};', `const frozenSources = ${JSON.stringify(frozenSources, null, 2)};`));
}
for (const row of reviewedRows.trim().split('\n')) {
  const [slug,motif,theme,subject,shape,evidence,constraints] = row.split('|');
  const feat = PF2E_FEATS.find(f => f.slug === slug);
  if (!feat) throw new Error(`Unknown reviewed feat ${slug}`);
  const frozen = frozenSources[slug];
  if (!frozen || feat.id !== frozen[0] || sha256(feat.description) !== frozen[1] || sha256(feat.plainDescription) !== frozen[2]) throw new Error(`Stale reviewed source ${slug}; full re-review required.`);
  if (feat.descriptionHash !== frozen[1]) throw new Error(`Stored catalog source hash mismatch ${slug}`);
  if (!feat.plainDescription.toLowerCase().includes(evidence.toLowerCase())) throw new Error(`Evidence mismatch ${slug}: ${evidence}`);
  const extra = details[slug]??{};
  reviews[feat.id] = {
    review: { nativeId:frozen[0], descriptionHash:frozen[1], plainDescriptionHash:frozen[2], sourceCommit:'563fd52708673ddd4f66c76921efbf6a938fffed', fullDescriptionRead:true, method:'individual source review' },
    evidence:[evidence], motif,theme,subject,
    approach:shape, contacts:{count:noContact.has(motif)?0:1, distribution:subject==='caster'?'source-centered':'selected target',conditional:/conditional|save|contested/i.test(constraints)},
    weapon:theme==='weapon'?'as described':null,tempo:tempoFor(motif),shape,
    finish:[constraints],constraints:[constraints,'Cosmetic animation only; no document mutation.'],
    rationale:`${shape}. ${constraints}`, ...extra,
  };
}
// Original nonmartial ordering 130–909 verified before catalog regeneration.
// IDs remain stable when semantic corrections change the nonmartial filter.
if(Object.keys(reviews).length!==779||!reviews.vhHKUooXX3PYqGaU||!reviews.WlgaSpTSGQQrHKlx)throw new Error('Review range incomplete or duplicated.');
writeFileSync(new URL('../data/feat-support-review.mjs',import.meta.url),`// Individually reviewed complete PF2e descriptions. Generated by tools/feat-support-review.mjs.\nexport const FEAT_SUPPORT_REVIEW = ${JSON.stringify(reviews,null,2)};\n`);
console.log(`Wrote ${Object.keys(reviews).length} individual full-description support reviews.`);
console.log(`Read ${PF2E_FEATS.filter(f=>reviews[f.id]).reduce((total,f)=>total+f.plainDescription.length,0).toLocaleString()} description characters; every stored evidence clause verified.`);
