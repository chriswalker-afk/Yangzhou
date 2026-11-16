/* Yangzhou V3 Layer 2 — painted moon gate mounted on a real opening.
 * Reuses the repository's earlier original Moon Gate 01, not a fabricated arc.
 * The gate illustration is an architectural elevation; the underlying
 * compiled wall ribbons, physical opening and Layer 1B paving stay unchanged.
 * Do not render a synthetic fallback when the verified art is unavailable.
 */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3MoonGate=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const ASSET=Object.freeze({
 id:'moon-gate-01',path:'assets/v3/enclosures/moon-gate-01.webp',
 width:1448,height:721,bytes:1246684,
 sha256:'e06e5a87395563c605b86f4777ebfa02a183ba40f09eca3fac70d755f5370853',
 source:'original V3 enclosure painting; untouched PNG-derived lossless WebP',
 status:'original-painted-candidate-needs-wall-integration-review',
 worldWidthForSouth30:40,visualOnly:true
});
const EPS=1e-7;
// The opening bounds are measured against the transparent INNER circular
// aperture of original Moon Gate 01 (1448x721), not its outer stone ring.
// Camera projection uses the exact existing frame dimensions. A conservative
// ellipse is hidden beneath the original artwork wherever there is masonry.
const INNER_APERTURE=Object.freeze({
 cx:.500,cy:.627,rx:.166,ry:.272,source:'original-painting-inner-opening'
});
function frame(gate,hall){
 const [x,y]=gate.center,dx=gate.tangent[0],dy=gate.tangent[1];
 const horizontal=Math.abs(dy)<EPS&&Math.abs(dx)>EPS;
 const north=horizontal&&y<(hall?.y??110);
 // Source is very nearly 2:1. Keep its EXACT aspect; no invented masonry.
 // Put the painted stone foundation on the real south-facing wall base,
 // while its taller tiled crown rises just above existing roof coping.
 const worldWidth=(gate.width+(north?6:10));
 const worldHeight=worldWidth*ASSET.height/ASSET.width;
 const wallBottom=y+(north?10:14);
 return Object.freeze({
  gateId:gate.id,axis:horizontal?'horizontal':'vertical',
  center:Object.freeze([x,y]),north,
  x:x-worldWidth/2,y:wallBottom-worldHeight,
  width:worldWidth,height:worldHeight,
  imageAspectRatio:ASSET.width/ASSET.height,
  source:ASSET.id,visualOnly:true,collisionFree:true,
  physicalOpeningWidth:gate.width,clearWidth:gate.walkThroughWidth
 });
}
// The image is an elevated south-facing architectural elevation: its visible
// circular hole is down-screen from the structural centreline. Ordinary ground
// clipping stops at the centreline, so the SOUTH gate otherwise looks through
// onto EXTERIOR grass. This aperture is a view of the actual floor surface on
// the courtyard side. Only the *view* is projected; no physical paving, wall,
// collision or external grass polygon is extended.
function apertureFor(placement){
 return Object.freeze({
  cx:placement.x+placement.width*INNER_APERTURE.cx,
  cy:placement.y+placement.height*INNER_APERTURE.cy,
  rx:placement.width*INNER_APERTURE.rx,
  ry:placement.height*INNER_APERTURE.ry,
  source:INNER_APERTURE.source,visualOnly:true
 });
}
function groundFor(gate,compiled,ground){
 if(!ground||!ground.model)return Object.freeze({source:'existing-ground',route:null,region:null});
 const {model,walkwayPainter,walkwayImage,pavingPainter,pavingImage}=ground;
 // A verified path is preferred, and only the one actually leading to this
 // gate can appear within its circular opening.
 const route=walkwayImage&&walkwayPainter?.routeFor?.(model,compiled);
 if(route&&(!gate.id||route.gateId===gate.id))
  return Object.freeze({source:'walkway-01',route,region:null});
 // A genuinely enclosed courtyard may show its original painted paving
 // through the door when the path is hidden. Open gardens stay on grass.
 const region=pavingImage&&pavingPainter?.regionFor?.(model);
 if(region)return Object.freeze({source:'courtyard-paving-01',route:null,region});
 return Object.freeze({source:'existing-ground',route:null,region:null});
}
function drawGroundInAperture(ctx,gate,compiled,tile,placement,ground){
 const selection=groundFor(gate,compiled,ground);
 if(selection.source==='existing-ground')return selection;
 const aperture=apertureFor(placement);
 const ox=tile.x*220,oy=tile.y*220;
 const cx=ox+aperture.cx,cy=oy+aperture.cy;
 ctx.save();
 ctx.beginPath();
 ctx.ellipse(cx,cy,aperture.rx,aperture.ry,0,0,2*Math.PI);
 ctx.clip();
 if(selection.route){
  const {route}=selection;
  const period=ground.walkwayPainter.ASSET.worldRepeat;
  const base=oy+route.y;
  // Retain the authentic pathway's existing slab phase on BOTH sides of the
  // projected threshold. Crucially these copies are CLIPPED TO THE CIRCLE,
  // not drawn on the outside Layer 1A grass or across any gameplay port.
  const first=base+Math.floor((cy-aperture.ry-base)/period)*period;
  // The projected circular view is fractionally wider than the horizontal
  // 12-unit path on a near/south wall. Widen *only the image seen through the
  // aperture*, never the actual ground corridor or its physical clearance.
  const visibleWidth=Math.max(route.width,aperture.rx*2+.4);
  const visibleX=ox+gate.center[0]-visibleWidth/2;
  for(let y=first;y<cy+aperture.ry-EPS;y+=period)
   ctx.drawImage(ground.walkwayImage,visibleX,y,visibleWidth,period);
 }else if(selection.region){
  const period=ground.pavingPainter.ASSET.worldPeriod;
  const left=cx-aperture.rx,right=cx+aperture.rx;
  const top=cy-aperture.ry,bottom=cy+aperture.ry;
  // Same world-space repeat phase as Courtyard Paving 01. This is a visible
  // continuation of the accepted original texture, not an opaque flat fill.
  for(let x=Math.floor(left/period)*period;x<right-EPS;x+=period)
   for(let y=Math.floor(top/period)*period;y<bottom-EPS;y+=period)
    ctx.drawImage(ground.pavingImage,x,y,period,period);
 }
 ctx.restore();
 return selection;
}
function draw(ctx,compiled,tile,{hall=null,image=null,showDetail=true,
 ground=null,showGround=true}={}){
 if(!showDetail||!image||!compiled?.gates?.length)return 0;
 const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
 if(w!==ASSET.width||h!==ASSET.height)throw Error('Moon Gate 01 source dimensions mismatch');
 const ox=tile.x*220,oy=tile.y*220;
 let painted=0;
 ctx.save();
 for(const gate of compiled.gates){
  const placement=frame(gate,hall);
  // Keep the compass-upright artwork. N-S walls require a separately
  // authored rotated-elevation gate and must not get a stretched/turned copy.
  if(placement.axis!=='horizontal')continue;
  if(showGround&&ground)drawGroundInAperture(ctx,gate,compiled,tile,placement,ground);
  // The real untouched painting occludes the projected floor around its
  // circular void, preserving the roof, plaster, stone ring and threshold.
  ctx.drawImage(image,ox+placement.x,oy+placement.y,
   placement.width,placement.height);
  painted++;
 }
 ctx.restore();
 return painted;
}
function digest(buffer){
 return Array.from(new Uint8Array(buffer),v=>v.toString(16).padStart(2,'0')).join('');
}
async function verifyFile(blob){
 if(blob.size!==ASSET.bytes)throw Error('Moon Gate 01: wrong original artwork size');
 if(typeof crypto==='undefined'||!crypto.subtle)
  throw Error('Moon Gate 01 requires HTTPS/localhost for SHA-256 verification');
 if(digest(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))!==ASSET.sha256)
  throw Error('Moon Gate 01 SHA-256 mismatch; refusing substituted artwork');
 let image;
 if(typeof createImageBitmap==='function')image=await createImageBitmap(blob);
 else image=await new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(blob),img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Gate image decode failed'))};
  img.src=url;
 });
 if((image.naturalWidth||image.width)!==ASSET.width||
    (image.naturalHeight||image.height)!==ASSET.height)
  throw Error('Moon Gate 01 dimensions do not match original painting');
 return image;
}
async function loadFromGitHub(timeoutMs=24000){
 const controller=typeof AbortController!=='undefined'?new AbortController():null;
 let timer;
 try{
  const response=await Promise.race([
   fetch(ASSET.path,{cache:'no-store',...(controller?{signal:controller.signal}:{})}),
   new Promise((_,reject)=>{
    timer=setTimeout(()=>{
     controller?.abort();reject(Error('Moon gate artwork request timed out'));
    },timeoutMs);
   })
  ]);
  if(!response.ok)throw Error('HTTP '+response.status+' loading Moon Gate 01');
  return await verifyFile(await response.blob());
 }finally{clearTimeout(timer);}
}
return Object.freeze({ASSET,INNER_APERTURE,frame,apertureFor,groundFor,drawGroundInAperture,draw,verifyFile,loadFromGitHub});
});
