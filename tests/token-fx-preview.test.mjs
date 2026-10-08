import test from 'node:test';
import assert from 'node:assert/strict';
import {previewFilters,TokenFxPreview} from '../scripts/token-fx-preview.mjs';
import {RecipePreview} from '../scripts/recipe-preview.mjs';
import {recipeFrame} from '../scripts/choreography.mjs';
import {validateRecipe} from '../scripts/model.mjs';

function fixture() {
  const calls=[],created=[];
  class Point {constructor(x=0,y=x){this.x=x;this.y=y;}set(x,y=x){this.x=x;this.y=y;}}
  class Filter {
    constructor(params){assert.equal(params.dummy,true);Object.assign(this,params);this.boundsPadding=new Point();created.push(this);}
    apply(){}
    activateTransform(){}
    normalizeTMParams(){}
    destroy(){calls.push(['filter-destroy',this]);}
  }
  class Anime {
    constructor(puppet){assert.equal(puppet,null,'preview must not register native world animation');}
    cosOscillation(){}
    initAnimatedInternals(spec){this.spec=spec;}
    animate(delta){calls.push(['animate',delta]);}
  }
  class Container {constructor(){this.children=[];}addChild(art){this.children.push(art);}destroy(options){calls.push(['container-destroy',options]);}}
  class Graphics extends Container {constructor(){super();this.position=new Point();this.width=55;this.height=55;}lineStyle(){return this;}beginFill(){return this;}drawCircle(){return this;}drawRoundedRect(){return this;}endFill(){return this;}}
  class Renderer {constructor(){calls.push(['renderer']);}resize(w,h){this.width=w;this.height=h;}render(){calls.push(['render']);}destroy(){calls.push(['renderer-destroy']);}}
  const PIXI={Point,Matrix:class{},Container,Graphics,Renderer};
  const params=[{filterType:'fire',color:0xffffff,filterOwner:'gm',placeableId:'native',autoDestroy:true,animated:{time:{animType:'syncCosOscillation'}}}];
  const preset={name:'Super-Frost',params};
  const tokenMagic={getPresets:()=>[preset],filterTypes:{fire:Filter}};
  const token=subject=>({dataset:{previewToken:subject},style:{width:'55px',height:'55px'},classList:{add:()=>calls.push(['hide-art',subject]),remove:()=>calls.push(['show-art',subject])},querySelector:()=>null,append:view=>calls.push(['append',subject,view])});
  const source=token('source'),target=token('targets');
  const scene={dataset:{},querySelectorAll:()=>[source,target],ownerDocument:{createElement:()=>({style:{},setAttribute(){},getContext:()=>({clearRect(){},drawImage(){calls.push(['copy']);}}),remove:()=>calls.push(['view-remove'])})}};
  const recipe=validateRecipe({id:'fx-preview',name:'FX',trigger:'manual',stages:[{kind:'tokenfx',fxPreset:preset.name,subject:'targets',duration:1000,delay:300}]});
  return {calls,created,PIXI,Anime,tokenMagic,preset,scene,recipe,source,target};
}
test('inline native constructors clone preset, keep tint, isolate animation clock and remove document ownership',()=>{
  const f=fixture(),original=structuredClone(f.preset);
  const filters=previewFilters(f.preset,{fxTint:'#11ddff'},{...f,sprite:{}});
  assert.equal(filters[0].color,0x11ddff);assert.equal(filters[0].autoDestroy,false);assert.equal(filters[0].autoDisable,false);
  assert.ok(!Object.hasOwn(filters[0],'filterOwner'));assert.ok(!Object.hasOwn(filters[0],'placeableId'));
  assert.equal(filters[0].animated.time.animType,'cosOscillation');assert.deepEqual(f.preset,original);
});
test('window shaders run on intended token only during native stage timing, then restore art and release GPU resources',async()=>{
  const f=fixture(),preview=new TokenFxPreview(f);await preview.ready();
  preview.draw(recipeFrame(f.recipe,100));assert.ok(!f.calls.some(c=>c[0]==='render'));
  preview.draw(recipeFrame(f.recipe,500));
  assert.equal(f.calls.filter(c=>c[0]==='render').length,1);
  assert.deepEqual(f.calls.filter(c=>c[0]==='hide-art').map(c=>c[1]),['targets']);
  preview.draw(recipeFrame(f.recipe,1500));assert.ok(f.calls.some(c=>c[0]==='show-art'&&c[1]==='targets'));
  preview.stop();preview.stop();
  assert.equal(f.calls.filter(c=>c[0]==='renderer-destroy').length,1);assert.equal(f.calls.filter(c=>c[0]==='filter-destroy').length,1);
  assert.ok(f.calls.filter(c=>c[0]==='container-destroy').every(c=>c[1].texture===false&&c[1].baseTexture===false));
});
test('partial native filter failure destroys initialized shaders and preserves preset data',()=>{
  const f=fixture();f.preset.params.push({filterType:'unknown'});
  assert.throws(()=>previewFilters(f.preset,{}, {...f,sprite:{}}),/Unsupported Token Magic/);
  assert.equal(f.calls.filter(c=>c[0]==='filter-destroy').length,1);
  assert.equal(f.preset.params[0].autoDestroy,true);
});

function imageFixture() {
  const f=fixture(),pending=[];
  class Texture {constructor(base){this.baseTexture=base;}destroy(base){f.calls.push(['image-texture-destroy',this,base]);}}
  class Sprite extends f.PIXI.Container {
    constructor(texture){super();this.texture=this._texture=texture;this.anchor=new f.PIXI.Point();this.position=new f.PIXI.Point();this.scale=new f.PIXI.Point(1);}
    destroy(options){this.destroyed=true;f.calls.push(['image-sprite-destroy',options]);}
  }
  Object.assign(f.PIXI,{BaseTexture:class {constructor(image){this.resource=image;this.realWidth=image.naturalWidth;this.realHeight=image.naturalHeight;}},Texture,Sprite});
  const create=f.scene.ownerDocument.createElement;
  f.scene.ownerDocument.createElement=tag=>{
    if(tag!=='img')return create(tag);
    const events=new Map();
    const image={naturalWidth:0,naturalHeight:0,addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:type=>events.delete(type),
      set src(path){this.path=path;if(path)pending.push(this);},finish(){this.naturalWidth=64;this.naturalHeight=64;events.get('load')?.();},fail(){events.get('error')?.();}};
    return image;
  };
  f.preset.params=[{filterType:'sprite',imagePath:'modules/tokenmagic/fx/assets/box.webp',rotation:45,scaleX:.16,scaleY:.16}];
  f.tokenMagic.filterTypes.sprite=f.tokenMagic.filterTypes.fire;
  return {...f,pending};
}

test('image-backed presets buffer owned textures and bind native sampler sprites before drawing',async()=>{
  const f=imageFixture(),original=structuredClone(f.preset),preview=new TokenFxPreview(f);
  const ready=preview.ready();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(f.pending.length,1,'buffer one texture per unique preset image');
  assert.match(f.pending[0].path,/modules\/tokenmagic\/fx\/assets\/box\.webp$/);
  assert.ok(!f.calls.some(c=>c[0]==='renderer'),'playback waits for image preparation');
  f.pending[0].finish();await ready;preview.draw(recipeFrame(f.recipe,500));
  assert.equal(f.scene.dataset.fxError,undefined);
  const filter=preview.records[1].art.filters[0];
  assert.equal(filter.tex.baseTexture.resource,f.pending[0]);assert.equal(filter.uSamplerTarget,filter.tex);
  assert.equal(filter.targetSprite.renderable,false);assert.equal(filter.targetSprite.anchor.x,.5);
  assert.equal(filter.targetSprite.width,55);assert.equal(filter.rotation,45);assert.equal(filter.scaleX,.16);
  assert.deepEqual(f.preset,original);preview.stop();preview.stop();
  assert.equal(f.calls.filter(c=>c[0]==='image-texture-destroy').length,1);
  assert.equal(f.calls.filter(c=>c[0]==='image-texture-destroy')[0][2],true);
});

test('switching cards during image preparation cancels late textures and renderer creation',async()=>{
  const f=imageFixture(),preview=new TokenFxPreview(f),ready=preview.ready();
  await new Promise(resolve=>setImmediate(resolve));assert.equal(f.pending.length,1);
  preview.stop();f.pending[0].finish();await ready;
  assert.equal(preview.records.length,0);assert.ok(!f.calls.some(c=>c[0]==='renderer'));
  assert.ok(!f.calls.some(c=>c[0]==='image-texture-destroy'),'canceled images never allocate GPU textures');
});

test('a missing preset image releases previously buffered textures and never shows a blank shader',async()=>{
  const f=imageFixture();f.preset.params.push({...f.preset.params[0],imagePath:'modules/tokenmagic/fx/assets/missing.webp'});
  const preview=new TokenFxPreview(f),ready=preview.ready(),failure=assert.rejects(ready,/Token Magic image unavailable:.*missing\.webp/);
  await new Promise(resolve=>setImmediate(resolve));f.pending[0].finish();await new Promise(resolve=>setImmediate(resolve));
  f.pending[1].fail();await failure;
  assert.equal(preview.stopped,true);assert.equal(preview.imageTextures.size,0);
  assert.equal(f.calls.filter(c=>c[0]==='image-texture-destroy').length,1);
  assert.ok(!f.calls.some(c=>c[0]==='renderer'));
});

test('scene distortion and video-backed image presets keep explicit canvas fallback without loading shared media',async()=>{
  const f=imageFixture();f.preset.params[0].imagePath='modules/custom/overlay.webm';
  const preview=new TokenFxPreview(f);await preview.ready();preview.draw(recipeFrame(f.recipe,500));
  assert.equal(f.pending.length,0);assert.match(f.scene.dataset.fxError,/Canvas-only Token Magic filter: sprite/);
  assert.ok(!f.calls.some(c=>c[0]==='hide-art'));preview.stop();
});

test('asset-window shader output fits padded effects inside its preview bounds',async()=>{
  const f=fixture();f.preset.params[0].padding=150;f.scene.dataset.fitTokenFx='';f.scene.clientWidth=240;f.scene.clientHeight=235;
  const preview=new TokenFxPreview(f);await preview.ready();preview.draw(recipeFrame(f.recipe,500));
  const {view}=preview.records[1];
  assert.ok(view.width>219);assert.ok(Math.abs(parseFloat(view.style.width)-219)<1e-8);
  assert.ok(Math.abs(parseFloat(view.style.height)-219)<1e-8);preview.stop();
});

test('token artwork keeps native dimensions, rotation and mirrors without leaking image textures',async()=>{
  const f=fixture();
  class Texture {constructor(base){this.baseTexture=base;}destroy(base){f.calls.push(['texture-destroy',base]);}}
  class Sprite {constructor(texture){this.texture=texture;this.anchor=new f.PIXI.Point();this.position=new f.PIXI.Point();this.scale=new f.PIXI.Point(1);}}
  Object.assign(f.PIXI,{BaseTexture:class {constructor(image){this.resource=image;}},Texture,Sprite});
  const image={complete:true,naturalWidth:128,style:{width:'70px',height:'90px'}};
  f.source.querySelector=()=>image;
  f.scene.dataset.previewTokens=JSON.stringify({source:{rotation:45,textureScaleX:-1,textureScaleY:1}});
  const preview=new TokenFxPreview(f);await preview.ready();
  const {art,texture}=preview.records[0];
  assert.equal(texture.baseTexture.resource,image);assert.equal(art.width,70);assert.equal(art.height,90);
  assert.equal(art.rotation,Math.PI/4);assert.equal(art.scale.x,-1);assert.equal(art.scale.y,1);
  preview.stop();preview.stop();assert.deepEqual(f.calls.filter(c=>c[0]==='texture-destroy'),[['texture-destroy',true]]);
  f.scene.dataset.fitTokenFx='';Object.assign(image,{naturalHeight:64,style:{width:'112px',height:'112px'}});
  const sample=new TokenFxPreview(f);await sample.ready();
  assert.equal(sample.records[0].art.width,112);assert.equal(sample.records[0].art.height,56);
  sample.stop();
});

test('unsupported active shaders preserve artwork and fail once instead of retrying every frame',async()=>{
  const f=fixture();let lookups=0;
  f.tokenMagic.getPresets=()=>{lookups++;return [{name:'Super-Frost',params:[{filterType:'unknown'}]}];};
  const preview=new TokenFxPreview(f);await preview.ready();
  for(const time of [500,700,900])preview.draw(recipeFrame(f.recipe,time));
  assert.equal(lookups,1);assert.match(f.scene.dataset.fxError,/Unsupported Token Magic/);
  assert.ok(!f.calls.some(c=>c[0]==='hide-art'));preview.stop();
});
test('recipe preview buffers and drives shader lifecycle, including late preparation cancellation',async()=>{
  const f=fixture(),calls=[];
  const scene={dataset:{},querySelectorAll:()=>[]};
  const native={ready:async()=>calls.push('ready'),draw:()=>calls.push('draw'),stop:()=>calls.push('stop')};
  const preview=new RecipePreview(scene,f.recipe,()=>{}, {tokenFx:async()=>native});
  await preview.prepareTokenFx();preview.draw(recipeFrame(f.recipe,500));preview.stop();
  assert.deepEqual(calls,['ready','draw','stop']);
  let complete;const pending=new RecipePreview(scene,f.recipe,()=>{}, {tokenFx:()=>new Promise(resolve=>{complete=resolve;})});
  const ready=pending.prepareTokenFx();await new Promise(resolve=>setImmediate(resolve));pending.stop();complete(native);await ready;
  assert.equal(calls.at(-1),'stop');assert.equal(calls.filter(c=>c==='ready').length,1);
});
