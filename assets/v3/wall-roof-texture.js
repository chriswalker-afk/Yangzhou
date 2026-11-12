/* Yangzhou V3 candidate coping material: image follows actual wall centrelines,
 * clipped by exact mitered strip polygons. No V2 runtime dependency.
 * Image binary is user-uploaded, verified separately by SHA-256 before use.
 */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3WallRoofTexture=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const ASSET=Object.freeze({
 id:'wall-roof-tiles-01',path:'assets/v3/wall-materials/wall-roof-tiles-01.webp',
 width:1256,height:314,bytes:174360,sha256:'8a3a7abeb08c4e34bb0134c9a39ba301000435bed5d3c63ccad3bd7a949e578a',
 originalSha256:'731df70b0143848f3c1f0bc4b0c51e3d845fa7f09ca16cab8b2bba339853dd39',
 bandWidth:8,period:32,status:'candidate-not-production-approved'
});
const EPS=1e-7;
const normal=(a,b)=>{
 const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);
 if(l<EPS)throw Error('Zero-length wall UV segment');
 return [-dy/l,dx/l];
};
function miter(points,index,r,side){
 const n=points.length-1;
 if(index===0)return normal(points[0],points[1]).map(x=>x*r*side);
 if(index===n)return normal(points[n-1],points[n]).map(x=>x*r*side);
 const before=normal(points[index-1],points[index]);
 const after=normal(points[index],points[index+1]);
 const sx=before[0]+after[0],sy=before[1]+after[1],l=Math.hypot(sx,sy);
 if(l<EPS)throw Error('U-turn not allowed in continuous wall UV');
 const unit=[sx/l,sy/l],denom=unit[0]*after[0]+unit[1]*after[1];
 if(Math.abs(denom)<0.55)throw Error('Acute join exceeds coping miter limit');
 return unit.map(x=>x*r*side/denom);
}
function segmentQuad(points,index,width){
 const start=points[index],end=points[index+1],r=width/2;
 const aL=miter(points,index,r,1),aR=miter(points,index,r,-1);
 const bL=miter(points,index+1,r,1),bR=miter(points,index+1,r,-1);
 return [[start[0]+aL[0],start[1]+aL[1]],
         [end[0]+bL[0],end[1]+bL[1]],
         [end[0]+bR[0],end[1]+bR[1]],
         [start[0]+aR[0],start[1]+aR[1]]];
}
function pointInPolygon(point,quad){
 let inside=false;
 for(let i=0,j=quad.length-1;i<quad.length;j=i++){
  const a=quad[i],b=quad[j];
  if(((a[1]>point[1])!==(b[1]>point[1]))&&
      point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}
function segments(compiled){
 const result=[];
 for(const path of compiled.paths){
  const points=path.points;
  let u=0;
  for(let i=0;i<points.length-1;i++){
   const a=points[i],b=points[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
   if(len<EPS)throw Error('Zero-length wall UV segment');
   const quad=segmentQuad(points,i,ASSET.bandWidth);
   result.push(Object.freeze({
    pathId:path.id,index:i,a,b,length:len,u0:u,u1:u+len,
    tangent:[(b[0]-a[0])/len,(b[1]-a[1])/len],
    quad
   }));
   u+=len;
  }
 }
 return result;
}
// A full image repeat takes exactly 32x8 world units. Image source pixels
// are never stretched differently along the two material directions.
function draw(ctx,compiled,tile,image,options={}){
 if(!image)return Object.freeze({painted:false,segments:0,tiles:0});
 const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
 if(!(width>0&&height>0))throw Error('Coping texture did not decode');
 const period=ASSET.period,band=ASSET.bandWidth;
 let tiles=0;
 const ox=tile.x*220,oy=tile.y*220;
 ctx.save();
 for(const part of segments(compiled)){
  const a=part.a,angle=Math.atan2(part.tangent[1],part.tangent[0]);
  ctx.save();
  // Clip in world coordinates to the exact miter wedges. The adjacent wall
  // sections meet edge-to-edge, even when the texture direction changes.
  const q=part.quad;
  ctx.beginPath();ctx.moveTo(ox+q[0][0],oy+q[0][1]);
  for(let i=1;i<q.length;i++)ctx.lineTo(ox+q[i][0],oy+q[i][1]);
  ctx.closePath();ctx.clip();
  ctx.translate(ox+a[0],oy+a[1]);ctx.rotate(angle);
  // Keep U phase continuous across segments of the same wall path. An extra
  // repeat each side covers both end miters without leaving grass pixels.
  const offset=((part.u0%period)+period)%period;
  const begin=-offset-period;
  for(let x=begin;x<part.length+period;x+=period){
   ctx.drawImage(image,x,-band/2,period,band);
   tiles++;
  }
  ctx.restore();
 }
 ctx.restore();
 return Object.freeze({painted:true,segments:segments(compiled).length,tiles});
}
const digest=buf=>Array.from(new Uint8Array(buf),x=>x.toString(16).padStart(2,'0')).join('');
async function decodeImage(blob){
 if(typeof createImageBitmap==='function')return await createImageBitmap(blob);
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(blob),image=new Image();
  image.onload=()=>{URL.revokeObjectURL(url);resolve(image);};
  image.onerror=()=>{URL.revokeObjectURL(url);reject(Error('WebP could not be decoded'));};
  image.src=url;
 });
}
async function verifyFile(blob){
 if(blob.size!==ASSET.bytes)throw Error('Different roof-tile artwork file size (expected '+ASSET.bytes+' bytes)');
 if(typeof crypto==='undefined'||!crypto.subtle)throw Error('SHA-256 requires HTTPS or localhost');
 const hash=digest(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
 if(hash!==ASSET.sha256)throw Error('Roof artwork checksum mismatch; refusing substituted painting');
 const image=await decodeImage(blob);
 if(image.width!==ASSET.width||image.height!==ASSET.height)
  throw Error('Roof tile image dimensions do not match 1256 × 314');
 return image;
}
async function loadFromGitHub(timeoutMs=20000){
 const abort=typeof AbortController!=='undefined'?new AbortController():null;
 let timer;
 try{
  const response=await Promise.race([
   fetch(ASSET.path,{cache:'no-store',...(abort?{signal:abort.signal}:{})}),
   new Promise((_,reject)=>{
    timer=setTimeout(()=>{abort?.abort();reject(Error('Roof texture request timed out'))},timeoutMs);
   })
  ]);
  if(!response.ok)throw Error('HTTP '+response.status+' loading candidate roof artwork');
  return await verifyFile(await response.blob());
 }finally{clearTimeout(timer);}
}
return Object.freeze({ASSET,normal,miter,segmentQuad,segments,pointInPolygon,draw,verifyFile,loadFromGitHub});
});