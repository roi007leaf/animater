import {stageFrame} from './stage-options.mjs';
import {TokenFxPreviewClock} from './token-fx-preview-clock.mjs';

const imageFilters=new Set(['sprite','spriteMask','polymorph']);
const videoPath=path=>/\.(?:webm|mp4|m4v|mov|ogv)(?:[?#]|$)/i.test(path);

// Native Token Magic shaders, with local sprites and an isolated animation
// clock. Dummy constructors bypass placeable lookup and global Anime registry.
export function previewFilters(preset, stage, {PIXI, Anime, tokenMagic, sprite, imageTextures=new Map()}) {
  const filters=[];
  try {
    for(const original of preset.params) {
      const params=structuredClone(original),Filter=tokenMagic.filterTypes?.[params.filterType];
      if(!Filter)throw Error(`Unsupported Token Magic filter: ${params.filterType}`);
      if(params.filterType==='distortion'||params.imagePath&&(!imageFilters.has(params.filterType)||videoPath(params.imagePath)))
        throw Error(`Canvas-only Token Magic filter: ${params.filterType}`);
      const texture=params.imagePath?imageTextures.get(params.imagePath):null;
      if(params.imagePath&&!texture)throw Error(`Token Magic image unavailable: ${params.imagePath}`);
      Object.assign(params,{dummy:true,autoDisable:false,autoDestroy:false,enabled:params.enabled!==false});
      // No ownership or native-document IDs in the off-canvas animation player.
      delete params.filterOwner;delete params.placeableId;delete params.filterInternalId;
      if(/^#[\da-f]{6}$/i.test(stage.fxTint??'')&&typeof params.color==='number') {
        params.color=Number.parseInt(stage.fxTint.slice(1),16);if(params.animated)delete params.animated.color;
      }
      const filter=new Filter(params);filters.push(filter);
      filter.targetPlaceable={worldTransform:new PIXI.Matrix(),x:0,y:0};
      filter.placeableImg=sprite;
      if(texture) {
        // Dummy constructors skip assignTexture: supply a private sampler
        // sprite without Texture.from's global cache or game.video playback.
        const target=new PIXI.Sprite(texture),base=sprite.texture?.baseTexture;
        target.renderable=false;target.anchor.set(.5);
        target.width=base?.realWidth??sprite.width;
        target.height=params.filterType==='polymorph'
          ?target.width*texture.baseTexture.realHeight/texture.baseTexture.realWidth
          :base?.realHeight??sprite.height;
        filter.targetSprite=target;filter.tex=texture;filter.uSamplerTarget=texture;
        sprite.addChild(target);
      }
      filter.boundsPadding??=new PIXI.Point(0,0);
      filter.boundsPadding.set?.(Math.max(0,Number(filter.padding)||0));
      // Restore native geometry-aware apply, which dummy construction replaces.
      filter.apply=Filter.prototype.apply;
      filter.activateTransform?.();
      const anime=new Anime(null);anime.puppet=filter;filter.anime=anime;
      for(const spec of Object.values(filter.animated??{})) {
        const local=spec.animType?.replace(/^sync([A-Z])/,(_,letter)=>letter.toLowerCase());
        if(local&&typeof anime[local]==='function')spec.animType=local;
      }
      filter.normalizeTMParams?.();
      anime.initAnimatedInternals(filter.animated??{});anime.animated=filter.animated??{};
      filter.autoDisable=false;filter.autoDestroy=false;
      filters.at(-1).previewAnime=anime;
    }
    return filters.sort((a,b)=>(a.zOrder??0)-(b.zOrder??0));
  } catch(error) {filters.forEach(f=>{try{f.destroy?.();}catch{/* Preserve the original constructor/binding error. */}});throw error;}
}

export class TokenFxPreview {
  constructor({scene,recipe,PIXI,Anime=TokenFxPreviewClock,tokenMagic}) {
    Object.assign(this,{scene,recipe,PIXI,Anime,tokenMagic});
    this.abort=new AbortController();this.records=[];this.imageTextures=new Map();this.stopped=false;
    this.info=JSON.parse(scene.dataset.previewTokens??'{}');
    this.entries=(recipe.playbackPlan??recipe.stages).flatMap((stage,index)=>stage.kind==='tokenfx'?[{stage,index}]:[]);
  }
  async ready() {
    const {PIXI,scene}=this;
    try {await this.prepareImages();}catch(error){this.stop();throw error;}
    for(const token of scene.querySelectorAll('[data-preview-token]')) {
      if(this.stopped)return;
      const image=token.querySelector('img');
      if(image&&!image.complete)await new Promise(resolve=>{
        const finish=()=>{clearTimeout(timer);image.removeEventListener('load',finish);image.removeEventListener('error',finish);this.abort.signal.removeEventListener('abort',finish);resolve();};
        const timer=setTimeout(finish,5000);image.addEventListener('load',finish,{once:true});image.addEventListener('error',finish,{once:true});this.abort.signal.addEventListener('abort',finish,{once:true});
      });
      if(this.stopped)return;
      const width=parseFloat(token.style.width)||token.clientWidth||55,height=parseFloat(token.style.height)||token.clientHeight||55;
      const container=new PIXI.Container();
      let art,texture;
      if(image?.naturalWidth>0) {
        // Own this texture, rather than leaving each rerendered HTML image in
        // PIXI's global Texture.from cache after the preview is closed.
        texture=new PIXI.Texture(new PIXI.BaseTexture(image));
        art=new PIXI.Sprite(texture);art.anchor.set(.5);
        art.width=parseFloat(image.style.width)||width;art.height=parseFloat(image.style.height)||height;
        if(scene.dataset.fitTokenFx!==undefined&&image.naturalHeight>0) {
          const fit=Math.min(art.width/image.naturalWidth,art.height/image.naturalHeight);
          art.width=image.naturalWidth*fit;art.height=image.naturalHeight*fit;
        }
        const info=this.info.targetList?.find(t=>t.id===token.dataset.previewActor)??this.info[token.dataset.previewToken];
        art.rotation=(info?.rotation??0)*Math.PI/180;
        if(info?.textureScaleX<0)art.scale.x*=-1;if(info?.textureScaleY<0)art.scale.y*=-1;
      } else {
        art=new PIXI.Graphics();const radius=Math.min(width,height)*.43;
        art.lineStyle(2,0xc4b3ff).beginFill(0x35314b).drawCircle(0,0,radius).endFill();
        art.beginFill(0xded5ff).drawCircle(0,-radius*.25,radius*.22).drawRoundedRect(-radius*.43,radius*.12,radius*.86,radius*.44,radius*.15).endFill();
      }
      container.addChild(art);
      const view=scene.ownerDocument.createElement('canvas');view.className='an-tokenfx-preview';view.hidden=true;
      view.setAttribute('aria-label','Token Magic FX token preview');token.append(view);
      this.records.push({token,container,art,texture,view,context:view.getContext('2d'),width,height,groups:new Map()});
    }
    if(!this.stopped&&this.records.length)this.renderer=new PIXI.Renderer({width:256,height:256,resolution:1,backgroundAlpha:0,antialias:true,preserveDrawingBuffer:true});
  }
  async prepareImages() {
    const paths=new Set();
    for(const entry of this.entries) {
      entry.preset=this.tokenMagic.getPresets(entry.stage.fxLibrary??'tmfx-main').find(p=>p.name===entry.stage.fxPreset);
      for(const params of entry.preset?.params??[]) {
        if(params.imagePath&&imageFilters.has(params.filterType)&&!videoPath(params.imagePath))paths.add(params.imagePath);
      }
    }
    for(const path of paths) {
      if(this.stopped)return;
      const image=this.scene.ownerDocument.createElement('img');
      image.crossOrigin='anonymous';
      const loaded=await new Promise((resolve,reject)=>{
        const finish=()=>{
          clearTimeout(timer);image.removeEventListener('load',finish);image.removeEventListener('error',finish);this.abort.signal.removeEventListener('abort',finish);
          if(this.stopped){image.src='';resolve(false);}
          else if(image.naturalWidth>0)resolve(true);
          else reject(Error(`Token Magic image unavailable: ${path}`));
        };
        const timer=setTimeout(finish,5000);
        image.addEventListener('load',finish,{once:true});image.addEventListener('error',finish,{once:true});this.abort.signal.addEventListener('abort',finish,{once:true});
        // Resolve relative data paths beneath Foundry's configured route prefix.
        image.src=new URL(path,new URL('../../../',import.meta.url)).href;
      });
      if(!loaded||this.stopped)return;
      this.imageTextures.set(path,new this.PIXI.Texture(new this.PIXI.BaseTexture(image)));
    }
  }
  state(entry,frame) {
    if(frame.muted?.has(entry.index))return {state:'pending',progress:0,localTime:0,stage:entry.stage};
    return this.recipe.playbackPlan?{...stageFrame({...entry.stage,repeats:1,targetStagger:0},frame.time),stage:entry.stage}:frame.stages[entry.index];
  }
  matches(record,stage) {
    if(record.token.dataset.previewToken!==(stage.subject??'source'))return false;
    if(this.recipe.playbackPlan&&stage.destination?.id&&record.token.dataset.previewActor)return stage.destination.id===record.token.dataset.previewActor;
    return !this.recipe.playbackPlan||stage.subject!=='targets'||Number(record.token.dataset.targetIndex??0)===Number(stage.targetIndex??0);
  }
  draw(frame) {
    if(this.stopped||!this.renderer)return;
    for(const record of this.records) {
      const active=this.entries.filter(e=>this.matches(record,e.stage)&&this.state(e,frame)?.state==='playing');
      if(!active.length){this.clear(record);record.failed=null;continue;}
      const signature=active.map(e=>`${e.index}:${this.state(e,frame).iteration??0}`).join(',');
      if(record.failed===signature){this.clear(record);continue;}
      try {
        const filters=[];
        for(const entry of active) {
          const state=this.state(entry,frame),key=`${entry.index}:${state.iteration??0}`;
          let group=record.groups.get(key);
          if(!group) {
            const preset=entry.preset;
            if(!preset?.params?.length)throw Error('Token Magic preset unavailable');
            group={filters:previewFilters(preset,entry.stage,{...this,sprite:record.art}),time:0};record.groups.set(key,group);
          }
          const delta=Math.max(0,state.localTime-group.time);group.time=state.localTime;
          for(const filter of group.filters) {
            if(filter.enabled!==false) {filter.previewAnime.animate(delta);filter.preComputation?.();filters.push(filter);}
          }
        }
        record.art.filters=filters;
        const pad=Math.min(192,Math.ceil(Math.max(24,record.width*.6,record.height*.6,...filters.map(f=>Number(f.padding)||0))));
        const size=Math.ceil(Math.max(record.width,record.height,Math.abs(record.art.width),Math.abs(record.art.height))*1.42+pad*2);
        if(this.renderer.width!==size||this.renderer.height!==size)this.renderer.resize(size,size);
        record.art.position.set(size/2,size/2);
        this.renderer.render(record.container);
        if(record.view.width!==size||record.view.height!==size){record.view.width=size;record.view.height=size;record.view.style.width=`${size}px`;record.view.style.height=`${size}px`;}
        if(this.scene.dataset.fitTokenFx!==undefined) {
          const fit=Math.min(1,Math.max(1,this.scene.clientWidth-16)/size,Math.max(1,this.scene.clientHeight-16)/size);
          record.view.style.width=`${size*fit}px`;record.view.style.height=`${size*fit}px`;
        }
        record.context.clearRect(0,0,size,size);record.context.drawImage(this.renderer.view,0,0);
        record.view.hidden=false;record.token.classList.add('an-tokenfx-active');
      } catch(error) {record.failed=signature;this.clear(record);this.scene.dataset.fxError=error.message;}
    }
  }
  clear(record) {record.view.hidden=true;record.token.classList.remove('an-tokenfx-active');record.art.filters=null;}
  stop() {
    if(this.stopped)return;this.stopped=true;this.abort.abort();
    for(const record of this.records) {
      this.clear(record);record.view.remove();
      record.groups.forEach(g=>g.filters.forEach(f=>f.destroy?.()));
      record.container.destroy({children:true,texture:false,baseTexture:false});
      record.texture?.destroy(true);
    }
    this.renderer?.destroy(true);this.records=[];
    this.imageTextures.forEach(texture=>texture.destroy(true));this.imageTextures.clear();
  }
}
