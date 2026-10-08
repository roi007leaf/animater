import {MediaLibrary} from '../scripts/media-library.mjs';
import {Workspace} from '../scripts/workspace.mjs';
// QA-only timing at production seams, published to DOM for browser inspection.
const root=document.querySelector('.an-root'),samples=[];
for(const [prototype,method] of [[MediaLibrary.prototype,'html'],[Workspace.prototype,'render']]) {
  const original=prototype[method];
  prototype[method]=function(...args){
    const start=performance.now(),result=original.apply(this,args);
    samples.push({method,type:this.filters?.type,page:this.page,ms:Math.round((performance.now()-start)*100)/100});
    root.dataset.qaTimings=JSON.stringify(samples.slice(-20));return result;
  };
}
const load=MediaLibrary.prototype.load;
MediaLibrary.prototype.load=async function(...args){
  const start=performance.now();await load.apply(this,args);
  root.dataset.qaLoadMs=String(Math.round((performance.now()-start)*100)/100);
  root.dataset.qaLoaded=String(this.loaded===true);
};
let thumbnailLoads=0,thumbnailReady=0;
const nativeLoad=HTMLMediaElement.prototype.load;
HTMLMediaElement.prototype.load=function(...args){
  if(this.closest('.an-asset-thumb')&&this.getAttribute('src'))root.dataset.qaThumbnailLoads=String(++thumbnailLoads);
  return nativeLoad.apply(this,args);
};
root.addEventListener('loadeddata',event=>{if(event.target.closest('.an-asset-thumb'))root.dataset.qaThumbnailReady=String(++thumbnailReady);},{capture:true});
await import('./preview.mjs');
