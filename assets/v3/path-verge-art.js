/* Yangzhou V3 — painted Path Verge Edge 01, candidate-only.
 * Reuses Canal Bank Edge 01's affine strip mapping so art follows a V3 path,
 * but ONLY on the land side of actual non-bridge stone-paving routes.
 * The navigable/visible paving core remains exactly 44 world units wide.
 * The V2 game never loads this module.
 */
(function(root,factory){
  const edgeArt=(typeof module!=='undefined'&&module.exports)
    ?require('./canal-bank-art.js'):root?.YangzhouV3CanalBankArt;
  const api=factory(edgeArt);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.YangzhouV3PathVergeArt=api;
})(typeof window!=='undefined'?window:null,function(edgeArt){
  'use strict';
  if(!edgeArt||typeof edgeArt.segment!=='function')throw Error('Canal-bank strip mapper is required for V3 verge overlays');

  const path='assets/v3/edges/path-verge-edge-01.webp';
  const period=220;
  const temporaryWidth=2.5;
  const visualLandSpread=5; // plant silhouettes may extend into grass; never change road geometry

  function prepareImage(image){
    if(!edgeArt.isImage(image))return image;
    // The original RGBA 2172 x 724 PNG is retained as a source master.
    // Local file previews crop the original's empty transparent margins;
    // the committed lossless WebP additionally has an exact blended seam.
    const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
    if(w===2172&&h===724&&typeof document!=='undefined'){
      const canvas=document.createElement('canvas');
      canvas.width=1992;canvas.height=194;
      canvas.getContext('2d').drawImage(image,90,269,1992,194,0,0,1992,194);
      return canvas;
    }
    return image;
  }
  function load(url=path){
    return edgeArt.load(url);
  }
  function growLandward(section,spread){
    // Only expand the painted sprite's footprint into *grass*.
    // The core edge stays at exactly 22 units either side of the street.
    const extended={};
    for(const side of ['left','right']){
      const core=section.core[side],outer=section.outer[side];
      const d=Math.hypot(outer[0]-core[0],outer[1]-core[1]);
      if(Math.abs(d-temporaryWidth)>1e-6)throw Error('V3 path width contract changed unexpectedly');
      const factor=spread/d;
      extended[side]=[
        core[0]+(outer[0]-core[0])*factor,
        core[1]+(outer[1]-core[1])*factor
      ];
    }
    return { ...section,outer:extended };
  }
  function draw(ctx,compiled,image,options={}){
    if(!edgeArt.isImage(image))return 0;
    if(!compiled||!Array.isArray(compiled.traces))throw Error('Compiled V3 edge geometry required');
    const spread=options.spread??visualLandSpread;
    if(!Number.isFinite(spread)||spread<temporaryWidth||spread>8)throw Error('Unsupported painted verge spread');
    const x=options.x||0,y=options.y||0;
    let segments=0;
    // Bridge deck is elevated stone: do NOT grow clover on its parapet.
    for(const trace of compiled.traces.filter(t=>t.material==='S'&&t.role!=='bridge-deck')){
      for(let i=1;i<trace.samples.length;i++){
        const a=growLandward(trace.samples[i-1],spread);
        const b=growLandward(trace.samples[i],spread);
        for(const side of ['left','right']){
          if(edgeArt.segment(ctx,image,a,b,side,x,y))segments++;
        }
      }
    }
    return segments;
  }
  return Object.freeze({path,period,temporaryWidth,visualLandSpread,prepareImage,load,growLandward,draw});
});
