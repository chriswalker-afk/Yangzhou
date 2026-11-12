/* Yangzhou V3 — painted canal bank preview adapter.
 * Candidate only. Never invoked by the playable V2 game.
 * Image lands on both LAND-SIDE banks of each canal; core mask unchanged.
 * Browser-only CanvasPattern affine mapping. No generated art fallback.
 */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3CanalBankArt=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const period=220; // world units; shared across the entire board
 const path='assets/v3/edges/canal-bank-edge-01.webp';
 const isImage=image=>!!image&&Number.isFinite(image.naturalWidth||image.width)&&
   (image.naturalWidth||image.width)>0&&(image.naturalHeight||image.height)>0;
 const positiveMod=(value,mod)=>((value%mod)+mod)%mod;
 function load(url=path){
   if(typeof Image==='undefined')return Promise.reject(Error('Browser Image required'));
   return new Promise((resolve,reject)=>{
     const image=new Image();image.onload=()=>resolve(image);
     image.onerror=()=>reject(Error('Painted edge candidate not yet committed: '+url));
     image.src=url;
   });
 }
 function segment(ctx,image,a,b,side,x,y){
   // Trace sections are local tile coordinates. Offset only vertices, never
   // the global grass/paving/water pattern origin.
   const o=side==='left'?'left':'right';
   const q0=a.outer[o],q1=b.outer[o],r0=a.core[o],r1=b.core[o];
   const anchor=[q0[0]+x,q0[1]+y],next=[q1[0]+x,q1[1]+y];
   const delta=[next[0]-anchor[0],next[1]-anchor[1]];
   const distance=Math.hypot(...delta);if(distance<1e-6)return false;
   // Positive direction is canonical along increasing world x+y so a route
   // compiled in reverse cannot flip its painting at a tile mouth.
   const sign=delta[0]+delta[1]<0?-1:1;
   const tangent=[sign*delta[0]/distance,sign*delta[1]/distance];
   const inward=(side==='left'?-1:1);
   const normal=[a.normal[0]*inward,a.normal[1]*inward];
   const band=Math.hypot(q0[0]-r0[0],q0[1]-r0[1]);
   const imW=image.naturalWidth||image.width,imH=image.naturalHeight||image.height;
   const phase=positiveMod(anchor[0]+anchor[1],period);
   // CanvasPattern setTransform maps texture pixels into world-space.
   // The phase is anchored at a *global coordinate*, not a tile-local x.
   const scale=period/imW;
   const transform=[
      tangent[0]*scale,tangent[1]*scale,
      normal[0]*band/imH,normal[1]*band/imH,
      anchor[0]-tangent[0]*phase,anchor[1]-tangent[1]*phase
   ];
   const pattern=ctx.createPattern(image,'repeat-x');
   if(!pattern||typeof pattern.setTransform!=='function'||typeof DOMMatrix==='undefined')
      return false;
   pattern.setTransform(new DOMMatrix(transform));
   ctx.beginPath();
   ctx.moveTo(anchor[0],anchor[1]);
   ctx.lineTo(next[0],next[1]);
   ctx.lineTo(r1[0]+x,r1[1]+y);
   ctx.lineTo(r0[0]+x,r0[1]+y);
   ctx.closePath();
   ctx.fillStyle=pattern;ctx.fill();
   return true;
 }
 function draw(ctx,compiled,image,options={}){
   if(!isImage(image))return 0;
   if(!compiled?.traces)throw Error('Compiled V3 edging required');
   const x=options.x||0,y=options.y||0;
   let painted=0;
   // Never paint over the canal core. Bridge deck renders separately
   // afterwards via the normal compositor; this is a review-only overlay.
   for(const trace of compiled.traces.filter(t=>t.material==='W')){
     for(let i=1;i<trace.samples.length;i++){
       const a=trace.samples[i-1],b=trace.samples[i];
       for(const side of ['left','right']){
         if(segment(ctx,image,a,b,side,x,y))painted++;
       }
     }
   }
   return painted;
 }
 return Object.freeze({period,path,isImage,positiveMod,load,segment,draw});
});
