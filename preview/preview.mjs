import { Workspace } from "../scripts/workspace.mjs";
import { installedSoundCatalog } from "../scripts/spell-sounds.mjs";
import { SOUND_SOURCE, SOUND_PROFILES } from "../data/spell-sounds.mjs";
import { ABILITY_SOUND_PROFILES } from "../data/ability-sounds.mjs";
import { starterRecipes } from "../scripts/presets.mjs";
import {libraryPreferences} from '../scripts/media-library.mjs';
let data;
const requestedSystem=new URLSearchParams(location.search).get('system');
const systemId=['dnd5e','sf2e'].includes(requestedSystem)?requestedSystem:'pf2e';
const dndStates={},sfStates={};
try {
  data =
    JSON.parse(localStorage.getItem("animater-design-recipes")) ??
    starterRecipes();
} catch {
  data = starterRecipes();
}
const catalog = await fetch("/preview-catalog").then((r) => r.json());
const tokenFxCatalog=await fetch('/preview-token-fx').then(r=>r.ok?r.json():null).catch(()=>null);
const logs = [];
let spellCatalogState = { enabled: false, excluded: [] };
let weaponCatalogState = { enabled: false, excluded: [] };
const audioEntries = Object.values({ ...SOUND_PROFILES, ...ABILITY_SOUND_PROFILES }).flatMap(cues => cues.flatMap(c => c.candidates));
const soundModules = new Map(SOUND_SOURCE.packs.filter(p => p.files > 0).map(p => [p.module, { active: true }]));
const soundDatabase = { entryExists: key => audioEntries.some(c => c.key === key), getAllFileEntries: key => audioEntries.filter(c => c.key === key).map(c => c.file) };
let featCatalogState = { enabled: false, excluded: [] };
const stateCatalogStates = {condition: {enabled:false}, effect:{enabled:false}};
new Workspace(document.querySelector(".an-root"), {
  mediaPreferences:()=>{try{return libraryPreferences(JSON.parse(localStorage.getItem('animater-media-library'))??{});}catch{return libraryPreferences();}},
  setMediaPreferences:value=>localStorage.setItem('animater-media-library',JSON.stringify(libraryPreferences(value))),
  loadMediaCatalog:()=>fetch('/preview-media-catalog').then(r=>r.json()),
  sfCatalogState:kind=>sfStates[kind]??{},
  setSfCatalogState:async(kind,change)=>{sfStates[kind]={...sfStates[kind],...change};},
  dndCatalogState:kind=>dndStates[kind]??{},
  setDndCatalogState:async(kind,change)=>{dndStates[kind]={...dndStates[kind],...change};},
  mediaURL: file => `/${file.replace(/^\//, "")}`,
  stateCatalogState: kind => stateCatalogStates[kind],
  setStateCatalogState: async (kind, change) => { stateCatalogStates[kind] = {...stateCatalogStates[kind], ...change}; },
  soundCatalog: () => installedSoundCatalog(soundModules, soundDatabase),
  weaponCatalogState: () => weaponCatalogState,
  setWeaponCatalogState: async change => { weaponCatalogState = { ...weaponCatalogState, ...change }; },
  recipes: () => structuredClone(data),
  catalog: () => catalog,
  fxCatalog:()=>tokenFxCatalog??{tokenReady:false,sceneReady:false,presets:[],effects:[]},
  imageURL: (path) => `/${path.replace(/^\//, "")}`,
  logs: () => logs,
  enabled: () => false,
  catalogState: () => spellCatalogState,
  setCatalogState: async (change) => {
    spellCatalogState = { ...spellCatalogState, ...change };
  },
  featCatalogState: () => featCatalogState,
  setFeatCatalogState: async (change) => {
    featCatalogState = { ...featCatalogState, ...change };
  },
  environment: () => ({
    ready: catalog.length > 0,
    pack: catalog[0]?.pack ?? "JB2A unavailable",
    systemId,
    system: systemId==='sf2e'?'Starfinder 2e':systemId==='dnd5e'?'D&D 5e':'Pathfinder 2e',
    demo: true,
    motionReady: false,
    conflicts: [],
    problem: "No local JB2A library found.",
    dependencies: [
      {
        name: "Sequencer",
        ok: false,
        detail: "Canvas playback requires Foundry",
      },
      {
        name: catalog[0]?.pack ?? "JB2A",
        ok: catalog.length > 0,
        detail: "Real installed assets · preview only",
      },
      {
        name: "PF2e + SF2e + D&D 5e",
        ok: false,
        detail: "System hooks require Foundry",
      },
    ],
  }),
  save: async (recipes) => {
    data = structuredClone(recipes);
    localStorage.setItem("animater-design-recipes", JSON.stringify(data));
  },
  setEnabled: async () => {
    throw Error("Enable automatic playback inside Foundry.");
  },
  play: async () => {
    throw Error(
      "Canvas preview requires Foundry. The video above previews the selected JB2A asset.",
    );
  },
  stop: async () => {},
  refreshCatalog: () => catalog,
  resolveItem: async () => null,
  confirm: async (text) => window.confirm(text),
  export: async (text) => {
    const url = URL.createObjectURL(
      new Blob([text], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "animater-recipes.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
});
await import("./layout-check.mjs");
