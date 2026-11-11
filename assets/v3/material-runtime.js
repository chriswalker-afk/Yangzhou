/* Yangzhou V3: world-aligned, candidate-only repeating material loader.
 * No effect on V2 index.html; see layer-lab-v3.html.
 */
(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.YangzhouV3Materials=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const base='assets/v3/materials/';
  const files=Object.freeze({
    grass:'grass-01-lossless.webp',
    stone:'stone-01-lossless.webp',
    water:'water-01-lossless.webp'
  });
  const ids=Object.freeze(['grass','stone','water']);
  const worldPeriod=440; // two world tiles; one consistent phase across seams
  function imageFromUrl(url){
    if(typeof Image==='undefined')return Promise.reject(Error('Browser Image unavailable'));
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(Error('Material image unavailable: '+url));
      image.src=url;
    });
  }
  async function loadAll(){
    const results=await Promise.all(ids.map(async id=>{
      try{return {id,image:await imageFromUrl(base+files[id]),error:null};}
      catch(e){return {id,image:null,error:String(e)};}
    }));
    const images={},missing={};
    for(const r of results)if(r.image)images[r.id]=r.image;else missing[r.id]=r.error;
    return {images,missing};
  }
  async function loadLocal(file){
    if(!file||!(file.type==='image/webp'||file.type==='image/png'))throw Error('Select a PNG or WebP texture');
    if(typeof URL==='undefined'||!URL.createObjectURL)throw Error('Local image preview unsupported');
    const url=URL.createObjectURL(file);
    try{return await imageFromUrl(url);}finally{URL.revokeObjectURL(url);}
  }
  function makePattern(ctx,image,period=worldPeriod){
    if(!ctx||!image||!Number.isFinite(period)||period<=0)throw Error('Invalid texture pattern');
    const pattern=ctx.createPattern(image,'repeat');
    if(!pattern)throw Error('Unable to create repeating pattern');
    if(typeof DOMMatrix!=='undefined'&&typeof pattern.setTransform==='function'){
      const scale=period/image.naturalWidth;
      pattern.setTransform(new DOMMatrix([scale,0,0,scale,0,0]));
      return pattern;
    }
    // Fallback: one period in a temporary canvas. No per-tile pattern resets.
    if(typeof document==='undefined')throw Error('Canvas pattern scaling unsupported');
    const surface=document.createElement('canvas');
    surface.width=surface.height=Math.round(period);
    surface.getContext('2d').drawImage(image,0,0,surface.width,surface.height);
    return ctx.createPattern(surface,'repeat');
  }
  return Object.freeze({files,ids,base,worldPeriod,loadAll,loadLocal,makePattern});
});
