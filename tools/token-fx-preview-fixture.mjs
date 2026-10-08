import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

// QA-only native shader fixture. Reads the user's installed vendor/module
// sources at request time; no Token Magic or Foundry code is redistributed.
export async function tokenFxPreviewFixture(modulesRoot) {
  const root=resolve(modulesRoot,'tokenmagic');
  const source=async path=>(await readFile(resolve(root,path),'utf8')).replace(/^import[^;]*;\s*/gm,'');
  const native=await import('data:text/javascript;base64,'+Buffer.from(await readFile(resolve(root,'fx/presets/defaultpresets.js'),'utf8')).toString('base64'));
  const presets=native.allPresets.filter(p=>['fire','fumes','electric','chaos-images','Bulging Out'].includes(p.name));
  const imported=JSON.parse(await readFile(resolve(root,'import/TMFX-update-presets-v043.json'),'utf8'));
  presets.push(...imported.filter(p=>['Super-Frost','Evade Stance','Saving Roll','Dodge Jump'].includes(p.name)));
  const textures=JSON.parse(await readFile(resolve(root,'import/TMFX-update-presets-v044.json'),'utf8'));
  presets.push(...textures.filter(p=>['Criss-Cross','Star Mask'].includes(p.name)));
  return `
import * as PIXICore from '/preview-pixi.mjs';
import {burnFire} from '/modules/tokenmagic/fx/glsl/fragmentshaders/fire.js';
import {burnXFire} from '/modules/tokenmagic/fx/glsl/fragmentshaders/xfire.js';
import {fumes} from '/modules/tokenmagic/fx/glsl/fragmentshaders/fumes.js';
import {zapElectricity} from '/modules/tokenmagic/fx/glsl/fragmentshaders/electricity.js';
import {mirrorImages} from '/modules/tokenmagic/fx/glsl/fragmentshaders/mirrorimages.js';
import {customVertex2D} from '/modules/tokenmagic/fx/glsl/vertexshaders/customvertex2D.js';
import {customVertex2DSampler} from '/modules/tokenmagic/fx/glsl/vertexshaders/customvertex2DSampler.js';
import {matrix} from '/modules/tokenmagic/fx/glsl/fragmentshaders/matrix.js';
import {sprite} from '/modules/tokenmagic/fx/glsl/fragmentshaders/sprite.js';
import {spritemask} from '/modules/tokenmagic/fx/glsl/fragmentshaders/spritemask.js';
import {Workspace} from '../scripts/workspace.mjs';
import {TokenFxPreview} from '../scripts/token-fx-preview.mjs';
import {validateRecipe} from '../scripts/model.mjs';
import {tokenPresetMetadata} from '../scripts/optional-fx.mjs';
const PIXI={...PIXICore,filters:{...PIXICore.filters}};
globalThis.PIXI=PIXI;
await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/modules/tokenmagic/libs/filters/pixi-filters.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});
globalThis.foundry={utils:{randomID:()=>crypto.randomUUID(),mergeObject:(target,value)=>Object.assign(target,value)}};
globalThis.Color=class {constructor(value){this.value=typeof value==='string'?parseInt(value.replace('#',''),16):Number(value);}applyRGB(out){out[0]=((this.value>>16)&255)/255;out[1]=((this.value>>8)&255)/255;out[2]=(this.value&255)/255;}};
const isAnimationDisabled=()=>false,FilterOverrideManager={applyOverrides(){}},PlaceableType={TOKEN:'Token'},getPlaceableById=()=>null,fixPath=path=>path;
${await source('fx/filters/proto/FilterProto.js')}
${await source('fx/filters/CustomFilter.js')}
${await source('fx/filters/FilterFire.js')}
${await source('fx/filters/FilterXFire.js')}
${await source('fx/filters/FilterFumes.js')}
${await source('fx/filters/FilterElectric.js')}
${await source('fx/filters/FilterMirrorImages.js')}
${await source('fx/filters/FilterBulgePinch.js')}
${await source('fx/filters/FilterTransform.js')}
${await source('fx/filters/FilterSprite.js')}
${await source('fx/filters/FilterSpriteMask.js')}
const presets=${JSON.stringify(presets)};
const tokenMagic={getPresets:library=>presets.filter(p=>p.library===library),filterTypes:{fire:FilterFire,xfire:FilterXFire,fumes:FilterFumes,electric:FilterElectric,images:FilterMirrorImages,bulgepinch:FilterBulgePinch,transform:FilterTransform,sprite:FilterSprite,spriteMask:FilterSpriteMask}};
const recipe=validateRecipe({id:'tokenfx-window-qa',name:'Token FX window preview',trigger:'manual',stages:[
 {kind:'tokenfx',label:'Super-Frost',fxPreset:'Super-Frost',subject:'targets',delay:600,duration:12000},
 {kind:'tokenfx',label:'Caster fire',fxPreset:'fire',subject:'source',delay:2600,duration:5000}
]});
new Workspace(document.querySelector('.an-root'),{
 recipes:()=>[recipe],catalog:()=>[],logs:()=>[],enabled:()=>false,
 environment:()=>({demo:true,ready:true,systemId:'pf2e',system:'Pathfinder 2e',pack:'Native Token Magic QA',dependencies:[],conflicts:[]}),
 fxCatalog:()=>({tokenReady:true,sceneReady:false,presets:presets.map(p=>tokenPresetMetadata(p,p.library)),effects:[]}),
 mediaURL:file=>'/'+file.replace(/^\\//,''),
 previewTokenFx:()=>{const root=document.querySelector('.an-root');root.dataset.qaCanvasCalls=String(Number(root.dataset.qaCanvasCalls??0)+1);throw Error('Canvas backend must not run in this fixture');},
 previewTokens:()=>({source:{name:'Caster',img:'/systems/pf2e/icons/iconics/Ezren.webp',width:1,height:1},targets:{name:'Target',img:'/icons/svg/mystery-man.svg',width:1,height:1}}),
 createTokenFxPreview:async(scene,recipe)=>{
   const preview=new TokenFxPreview({scene,recipe,PIXI,tokenMagic}),draw=preview.draw.bind(preview),samples=[];
   preview.draw=frame=>{
     draw(frame);
     for(const r of preview.records)if(r.art.filters?.length) {
       const pixels=r.context.getImageData(0,0,r.view.width,r.view.height).data;
       let mass=0,x=0,y=0,hash=0;
       for(let i=0;i<pixels.length;i+=4){const a=pixels[i+3];mass+=a;x+=(i/4%r.view.width)*a;y+=Math.floor(i/4/r.view.width)*a;hash=(Math.imul(hash,31)+pixels[i]+pixels[i+1]+pixels[i+2]+a)|0;}
       samples.push({time:frame.time,x:x/mass,y:y/mass,hash});
     }
     scene.dataset.qaMotion=JSON.stringify({samples:samples.length,xRange:Math.max(...samples.map(s=>s.x))-Math.min(...samples.map(s=>s.x)),yRange:Math.max(...samples.map(s=>s.y))-Math.min(...samples.map(s=>s.y)),pixelFrames:new Set(samples.map(s=>s.hash)).size});
     scene.dataset.qaShaders=JSON.stringify(preview.records.map(r=>({subject:r.token.dataset.previewToken,
       filters:r.art.filters?.map(f=>({type:f.filterType,enabled:f.enabled,time:f.time,color:f.color,translationX:f.translationX,translationY:f.translationY,rotation:f.rotation,scaleX:f.scaleX,scaleY:f.scaleY})),
       coloredPixels:r.context?Array.from(r.context.getImageData(0,0,r.view.width,r.view.height).data).filter((v,i,a)=>i%4===0&&a[i+3]>0&&Math.max(v,a[i+1],a[i+2])-Math.min(v,a[i+1],a[i+2])>25).length:0})));
   };return preview;
 },
 save:async()=>{},setEnabled:async()=>{},stop:async()=>{},confirm:async()=>false
});`;
}
