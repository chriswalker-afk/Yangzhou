/* Yangzhou V3 – authentic painterly plaster & stone on camera-facing walls.
 * Fixed-ratio strip mapping; canonical geometry and existing roof left alone.
 * The repeating strips are clipped to the wall-face quads, not painted onto
 * hidden sides or across real moon-gate apertures. Candidate-only Layer 2.
 */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3WallFaceMaterials=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const BASE='assets/v3/wall-materials/',EPS=1e-7;
const ASSETS=Object.freeze({
 plaster:Object.freeze({
  id:'wall-plaster-ivory-01',filename:'wall-plaster-ivory-01.webp',
  path:BASE+'wall-plaster-ivory-01.webp',width:1256,height:314,bytes:56950,
  sha256:'f421d5853d2d85e1c71d42a14425f4d68ac611a15e2f1f5a68e5e43686a8d552',
  sourceSha256:'80f30c1d61799ff45d192ab4d203385d4ba99d3cdace9fe600c376eb8d2a425e',
  status:'visual-review-candidate'
 }),
 stone:Object.freeze({
  id:'wall-stone-base-01',filename:'wall-stone-base-01.webp',
  path:BASE+'wall-stone-base-01.webp',width:1256,height:157,bytes:69958,
  sha256:'67cc0b16d2a6985737b7ed2decab5c1504f0763dd40e44dc779e1fcdf6e7918b',
  sourceSha256:'a505bc7d5dede1f9b59cc124cc79ecda01e9a814840ed7f3d3dce8ed6bdcf0a6',
  status:'visual-review-candidate'
 })
});
const FACING=Object.freeze({horizontal:'south',vertical:'east'});
const hashHex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
async function decode(blob){
 if(typeof createImageBitmap==='function')return createImageBitmap(blob);
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(blob),img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Image decode failed'));};
  img.src=url;
 });
}
async function verify(kind,blob){
 const spec=ASSETS[kind];
 if(!spec)throw Error('Unknown V3 wall material '+kind);
 if(blob.size!==spec.bytes)throw Error(spec.id+' byte count mismatch');
 if(typeof crypto==='undefined'||!crypto.subtle)throw Error('SHA-256 requires HTTPS or localhost');
 const digest=hashHex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
 if(digest!==spec.sha256)throw Error(spec.id+' SHA-256 mismatch: expected original candidate');
 const img=await decode(blob);
 if(img.width!==spec.width||img.height!==spec.height)
  throw Error(spec.id+' pixel dimensions mismatch');
 return img;
}
function withDeadline(promise,ms,controller){
 let tid;
 return Promise.race([
  promise,
  new Promise((_,reject)=>{
   tid=setTimeout(()=>{controller?.abort();reject(Error('Wall texture loading timed out'))},ms);
  })
 ]).finally(()=>clearTimeout(tid));
}
async function loadOne(kind,timeoutMs=20000){
 const spec=ASSETS[kind],origins=[
  spec.path,
  'https://raw.githubusercontent.com/chriswalker-afk/Yangzhou/main/'+spec.path
 ];
 const errors=[];
 for(const url of origins){
  const controller=typeof AbortController!=='undefined'?new AbortController():null;
  try{
   const blob=await withDeadline((async()=>{
    const response=await fetch(url,{
     cache:'no-store',...(controller?{signal:controller.signal}:{})
    });
    if(!response.ok)throw Error('HTTP '+response.status);
    return response.blob();
   })(),timeoutMs,controller);
   return await verify(kind,blob);
  }catch(e){errors.push(url+': '+String(e.message||e));}
 }
 throw Error(errors.join(' | '));
}
async function loadAll(options={}){
 const images={},errors=[],kinds=Object.keys(ASSETS),progress=options.onProgress;
 let finished=0;
 await Promise.all(kinds.map(async kind=>{
  try{images[kind]=await loadOne(kind,options.timeoutMs||20000);}
  catch(e){errors.push(kind+': '+String(e.message||e));}
  finally{
   finished++;
   try{progress?.({images:{...images},errors:[...errors],finished,total:kinds.length});}catch(_){}
  }
 }));
 return {images,errors,finished};
}
function frame(face){
 const a=face.a,b=face.b;
 if(face.axis==='horizontal'){
  if(Math.abs(a[1]-b[1])>EPS)throw Error('Skewed horizontal plaster face');
  return Object.freeze({axis:'horizontal',angle:0,
   origin:[Math.min(a[0],b[0]),a[1]],phase:Math.min(a[0],b[0]),visibleSide:FACING.horizontal});
 }
 if(face.axis==='vertical'){
  if(Math.abs(a[0]-b[0])>EPS)throw Error('Skewed vertical plaster face');
  return Object.freeze({axis:'vertical',angle:-Math.PI/2,
   origin:[a[0],Math.max(a[1],b[1])],phase:-Math.max(a[1],b[1]),visibleSide:FACING.vertical});
 }
 throw Error('Expected orthogonal wall face');
}
function clipPoly(ctx,quad,ox,oy){
 ctx.beginPath();ctx.moveTo(ox+quad[0][0],oy+quad[0][1]);
 for(let j=1;j<quad.length;j++)ctx.lineTo(ox+quad[j][0],oy+quad[j][1]);
 ctx.closePath();ctx.clip();
}
function renderBand(ctx,image,tile,face,quad,inner,outer,alpha=1){
 if(!image)return 0;
 const h=outer-inner;
 if(!(h>0))throw Error('Invalid visible wall material height');
 const w=image.naturalWidth||image.width,ih=image.naturalHeight||image.height;
 if(!(w>0&&ih>0))throw Error('Image material not decoded');
 const period=h*w/ih;
 const ox=tile.x*220,oy=tile.y*220,f=frame(face);
 const length=Math.hypot(face.b[0]-face.a[0],face.b[1]-face.a[1]);
 let count=0;
 ctx.save();clipPoly(ctx,quad,ox,oy);
 ctx.translate(ox+f.origin[0],oy+f.origin[1]);ctx.rotate(f.angle);
 ctx.globalAlpha=alpha;
 // World-axis anchoring remains unchanged if a polyline reverses.
 const offset=((f.phase%period)+period)%period;
 for(let x=-offset-period;x<length+period*2;x+=period){
  ctx.drawImage(image,x,inner,period,h);
  count++;
 }
 ctx.restore();
 return count;
}
function drawPlaster(ctx,form,tile,image,geom){
 if(!image)return 0;
 let count=0;
 for(const face of form.faces){
  // The roof covers the first 0.75 units of the top edge. Opaque painting
  // avoids the doubled opacity that formerly produced dark joint stripes.
  const top=geom.FACE_START,bottom=face.outer-geom.BASE_HEIGHT;
  const q=geom.quad(face.a,face.b,face.normal,top,bottom);
  count+=renderBand(ctx,image,tile,face,q,top,bottom,1);
 }
 for(const joint of form.cornerFills){
  const [x,y]=joint.joint,outerX=joint.outerX;
  const segment={a:[x,y],b:[outerX,y],axis:'horizontal'};
  // The principal visible face keeps exactly the same V height and X-phase
  // as the adjoining horizontal segment. No cap bitmap is stretched to fit.
  // renderBand expects distances from this corner's own centreline,
  // NEVER absolute world Y (which would shift/stretch the texture off-canvas).
  const low=joint.outerY-y-geom.BASE_HEIGHT;
  count+=renderBand(ctx,image,tile,segment,joint.plaster,
   geom.FACE_START,low,1);
  // This little quadrant sits UNDER the mitered roof. At NE and SE it also
  // closes the exposed hole between the two offset wall-face rectangles.
  count+=renderBand(ctx,image,tile,segment,joint.underEave,
   0,geom.FACE_START,1);
 }
 return count;
}
function drawStone(ctx,form,tile,image,geom){
 if(!image)return 0;
 let count=0;
 for(const face of form.faces){
  const top=face.outer-geom.BASE_HEIGHT,bottom=face.outer;
  count+=renderBand(ctx,image,tile,face,face.base,top,bottom,1);
 }
 for(const joint of form.cornerFills){
  const [x,y]=joint.joint,outerX=joint.outerX,outerY=joint.outerY;
  const bottomTop=outerY-y-geom.BASE_HEIGHT;
  const bottomLocal=outerY-y;
  // Horizontal sill and vertical return share the *same* original stone
  // painting and meet in a single opaque lower-right corner. No blank
  // plaster square and no overlapping translucent stripes.
  const horizontal={axis:'horizontal',a:[x,y],b:[outerX,y]};
  count+=renderBand(ctx,image,tile,horizontal,joint.base,
   bottomTop,bottomLocal,1);
  const eastLeft=outerX-geom.BASE_HEIGHT;
  const vertical={axis:'vertical',a:[eastLeft,y],b:[eastLeft,outerY]};
  count+=renderBand(ctx,image,tile,vertical,joint.baseEast,
   0,geom.BASE_HEIGHT,1);
 }
 return count;
}
return Object.freeze({ASSETS,FACING,verify,loadOne,loadAll,frame,renderBand,drawPlaster,drawStone});
});