/* Yangzhou V3 Layer 1B — modular painted courtyard walkway.
 * A real, independently stored and SHA-256-verified image texture is tiled
 * in world-space along geometry-derived gate-to-hall approaches.
 * It is not a screenshot, permanent stroke, roadway, or wall collision mask.
 * The accepted grass/paving/road/canal images are never edited.
 */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3CourtyardWalkway=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const TILE=220,EPS=1e-7;
const ASSET=Object.freeze({
 id:'courtyard-walkway-01',title:'Weathered Jiangnan Courtyard Walkway Texture 01',
 path:'assets/v3/materials/courtyard-walkway-01.svg',mimeType:'image/svg+xml',
 width:480,height:800,bytes:918754,
 sha256:'3c04af446d89159b09940a73d40e2490fcd5a99dfe5b270eacad75f0b98f4c10',
 originalPigmentSha256:'fc7f03b7f047295ac0e1de8d7872d5f143874bc506c4b9d9bbd39a324da4a083',
 worldWidth:12,worldRepeat:20,layer:'1B',productionApproved:false,
 status:'independent-painterly-stone-path-candidate-for-visual-review'
});
function routeFor(model,compiled){
 if(!model||!compiled||!model.hall)return null;
 // These are the only authored routes: a fully enclosed southern entrance
 // or a three-sided northern entrance. T/L walls have no appropriate axis.
 if(model.id!=='rectangle'&&model.id!=='partial')return null;
 const gates=compiled.gates||[],hall=model.hall;
 const gate=gates.find(g=>Math.abs(g.tangent[1])<EPS&&
   Math.abs(g.center[0]-hall.x)<EPS&&g.walkThroughWidth>=ASSET.worldWidth+1);
 if(!gate)return null;
 const fromSouth=gate.center[1]>hall.y;
 const hallHalfHeight=23.5; // Exact existing 96x47 hall illustration footprint.
 const y0=fromSouth?hall.y+hallHalfHeight:gate.center[1];
 const y1=fromSouth?gate.center[1]:hall.y-hallHalfHeight;
 if(y1-y0<ASSET.worldRepeat/2)return null;
 const x=hall.x-ASSET.worldWidth/2;
 // Keep all art tile-owned, passable within the real moon-gate aperture,
 // and entirely clear of Layer 1A protected outer tile ports.
 if(x<10||x+ASSET.worldWidth>TILE-10||y0<10||y1>TILE-10)return null;
 return Object.freeze({
  id:'gate-to-hall',tileLocal:true,layer:'1B',
  gateId:gate.id,direction:fromSouth?'north-from-south-gate':'south-from-north-gate',
  x,y:y0,width:ASSET.worldWidth,height:y1-y0,
  entrance:Object.freeze([...gate.center]),
  hall:Object.freeze([hall.x,hall.y]),
  gameplayRoad:false,modifiesCollision:false
 });
}
function paint(ctx,tile,model,compiled,image,options={}){
 if(options.valid!==true)return Object.freeze({drawn:false,reason:'wall-audit-not-valid'});
 const route=routeFor(model,compiled);
 if(!route)return Object.freeze({drawn:false,reason:'no-authored-gate-to-hall-route'});
 if(!image)return Object.freeze({drawn:false,reason:'texture-not-loaded',route});
 const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
 if(width!==ASSET.width||height!==ASSET.height)throw Error('Walkway texture dimensions mismatch');
 const ox=tile.x*TILE,oy=tile.y*TILE;
 const px=ox+route.x,y0=oy+route.y,y1=y0+route.height;
 let repeats=0;
 ctx.save();
 ctx.beginPath();ctx.rect(px,y0,route.width,route.height);ctx.clip();
 // The artwork is a vertically repeating, self-contained transparent strip.
 // Clipping is bounded by the architectural gate and hall facade, not
 // painted into either wall or the geography beyond the courtyard.
 for(let y=y0;y<y1-EPS;y+=ASSET.worldRepeat){
  ctx.drawImage(image,px,y,ASSET.worldWidth,ASSET.worldRepeat);
  repeats++;
 }
 ctx.restore();
 return Object.freeze({drawn:true,layer:'1B',route,repeats,
  texture:ASSET.id,changesLayer1A:false,changesWallGeometry:false});
}
function digest(buffer){return Array.from(new Uint8Array(buffer),v=>v.toString(16).padStart(2,'0')).join('');}
async function verifyFile(blob){
 if(!blob||blob.size!==ASSET.bytes)throw Error('Walkway 01 file byte size mismatch');
 if(typeof crypto==='undefined'||!crypto.subtle)
  throw Error('Walkway 01 artwork verification requires HTTPS or localhost');
 const hash=digest(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
 if(hash!==ASSET.sha256)throw Error('Walkway 01 checksum mismatch; rejecting changed artwork');
 const url=URL.createObjectURL(blob);
 try {
  const image=await new Promise((resolve,reject)=>{
   const img=new Image();
   img.onload=()=>resolve(img);
   img.onerror=()=>reject(Error('Embedded stone-art texture SVG could not decode'));
   img.src=url;
  });
  if(image.naturalWidth!==ASSET.width||image.naturalHeight!==ASSET.height)
   throw Error('Walkway 01 image dimensions mismatch');
  return image;
 }finally{URL.revokeObjectURL(url);}
}
async function load(timeoutMs=25000){
 const controller=typeof AbortController!=='undefined'?new AbortController():null;
 let timer;
 try{
  const response=await Promise.race([
   fetch(ASSET.path,{cache:'no-store',...(controller?{signal:controller.signal}:{})}),
   new Promise((_,reject)=>{timer=setTimeout(()=>{
    controller?.abort();reject(Error('Walkway texture download timed out'));
   },timeoutMs);})
  ]);
  if(!response.ok)throw Error('HTTP '+response.status+' loading Walkway Texture 01');
  return await verifyFile(await response.blob());
 }finally{clearTimeout(timer);}
}
function repeatProof(ctx,image,{width=240,height=400}={}){
 if(!image)return false;
 const w=width/2,h=w*ASSET.height/ASSET.width;
 ctx.clearRect(0,0,width,height);
 ctx.save();
 for(let y=0;y<height;y+=h)ctx.drawImage(image,width/4,y,w,h);
 ctx.restore();
 return true;
}
return Object.freeze({ASSET,TILE,routeFor,paint,verifyFile,load,repeatProof});
});
