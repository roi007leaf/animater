// Interpret Token Magic preset animation data locally. Shaders still come from
// the loaded module, but preview timing never imports its unbundled bootstrap,
// attaches to the world ticker, or writes animation state to documents.
const oscillations={
  cosOscillation:['cos',2],halfCosOscillation:['cos',1],
  sinOscillation:['sin',2],halfSinOscillation:['sin',1],
  chaoticOscillation:['cos',2,'chaos'],
  colorOscillation:['cos',2,'color'],halfColorOscillation:['cos',1,'color'],
};
const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
const mix=(a,b,weight)=>b+(a-b)*weight;

export class TokenFxPreviewClock {
  constructor(puppet=null,{random=Math.random}={}) {
    this.puppet=puppet;this.random=random;this.states=new Map();this.animated={};
  }
  hasInternals(effect){return this.states.has(effect);}
  initInternals(effect){this.states.set(effect,{time:0,elapsed:0,loop:0,changed:false});}
  initAnimatedInternals(animated){for(const effect of Object.keys(animated))this.initInternals(effect);}
  animate(delta) {
    for(const [effect,spec] of Object.entries(this.animated)) {
      if(spec.active===false||typeof this[spec.animType]!=='function')continue;
      if(!this.hasInternals(effect))this.initInternals(effect);
      const state=this.states.get(effect),duration=Math.max(1,finite(spec.loopDuration,3000));
      const pause=Math.max(0,finite(spec.pauseBetweenDuration));
      const loops=Number.isFinite(spec.loops)&&spec.loops>0?spec.loops:Infinity;
      const end=Number.isFinite(loops)?loops*duration+(loops-1)*pause:Infinity;
      const previous=state.elapsed;
      state.time=Math.min(end,state.time+Math.max(0,finite(delta)));
      const cycle=Math.floor(state.time/(duration+pause));
      state.changed=cycle!==state.loop;state.loop=cycle;
      state.elapsed=state.time>=end?loops*duration:cycle*duration+Math.min(duration,state.time%(duration+pause));
      this[spec.animType](effect,state.elapsed,state.elapsed-previous,state);
      if(state.time>=end)spec.active=false;
    }
  }
  oscillate(effect,time,type) {
    const spec=this.animated[effect],[wave,turns,kind]=oscillations[type];
    const phase=time/Math.max(1,finite(spec.loopDuration,3000))+finite(spec.syncShift)
      +(kind==='chaos'?this.random()*finite(spec.chaosFactor,.25):0);
    const weight=(1+Math[wave](phase*Math.PI*turns))/2;
    if(kind==='color') {
      let color=0;
      for(const shift of [16,8,0])color|=Math.floor(mix((spec.val1>>shift)&255,(spec.val2>>shift)&255,weight))<<shift;
      this.puppet[effect]=color;
    } else this.puppet[effect]=mix(finite(spec.val1),finite(spec.val2),weight);
  }
  move(effect,_time,delta){this.puppet[effect]=finite(this.puppet[effect])+finite(this.animated[effect].speed)*delta;}
  moveToward(effect,time) {
    const spec=this.animated[effect];
    this.puppet[effect]=(finite(spec.val1)-finite(spec.val2))*time/Math.max(1,finite(spec.loopDuration,3000));
  }
  rotation(effect,time) {
    const spec=this.animated[effect],angle=360*time/Math.max(1,finite(spec.loopDuration,3000));
    this.puppet[effect]=spec.clockWise===false?360-angle:angle;
  }
  syncRotation(effect,time){this.rotation(effect,time);}
  randomNumber(effect) {
    const spec=this.animated[effect],value=mix(finite(spec.val2),finite(spec.val1),this.random());
    this.puppet[effect]=spec.wantInteger?Math.floor(value):value;
  }
  randomNumberPerLoop(effect,_time,_delta,state){if(state.changed)this.randomNumber(effect);}
  randomColor(effect){this.puppet[effect]=Math.floor(this.random()*0xffffff);}
  randomColorPerLoop(effect,_time,_delta,state){if(state.changed)this.randomColor(effect);}
}

// Native parameter normalization checks named methods on filter.anime.
// Synchronized modes use this preview's elapsed time rather than world time.
for(const type of Object.keys(oscillations)) {
  TokenFxPreviewClock.prototype[type]=function(effect,time){this.oscillate(effect,time,type);};
}
for(const type of ['cosOscillation','sinOscillation','chaoticOscillation','colorOscillation']) {
  const name='sync'+type[0].toUpperCase()+type.slice(1);
  TokenFxPreviewClock.prototype[name]=TokenFxPreviewClock.prototype[type];
}
