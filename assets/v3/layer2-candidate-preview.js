/* V3 review-only overlay. Authentic painterly images are imported locally, not faked. */
(function(root,factory){
 const api=factory(typeof module!=='undefined'&&module.exports?require('./base-geometry.js'):root.YangzhouV3Geometry,
 typeof module!=='undefined'&&module.exports?require('./layer2-placements.js'):root.YangzhouV3Layer2);
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3CandidatePreview=api;
})(typeof window!=='undefined'?window:null,function(geometry,layer2){
'use strict';
if(!geometry||!layer2)throw Error('V3 geometry and Layer 2 are required');
const ASSETS=Object.freeze({
 'willow-tree-01':Object.freeze({filename:'willow-tree-01.webp',sha256:'8e41982dd8d59a5476d5430cb865d9f86578bb69e9bc69c94c30373d5392fc9e',width:48,height:58,kind:'canopy',trunkRadius:7}),
 'garden-rockery-01':Object.freeze({filename:'garden-rockery-01.webp',sha256:'3a22cb438726d4a88cd9d24d6cf9be47faabd7ecff3aa604a9d3b5d131580e89',width:52,height:37,kind:'solid'})
});
const POSITIONS=[[57,52],[163,52],[58,164],[161,163],[110,54],[110,164],[57,110],[162,110],[110,110]];
function rectanglePoints(x,y,w,h){
 const out=[];for(let a=0;a<=6;a++)for(let b=0;b<=6;b++)out.push([x-w/2+a*w/6,y-h/2+b*h/6]);return out;
}
function clearOfRoutes(tile,p){
 const spec=ASSETS[p.id],corners=rectanglePoints(p.x,p.y,spec.width,spec.height);
 for(const [x,y] of corners)if(x<10||x>210||y<10||y>210)return false;
 const samples=spec.kind==='canopy'?[[p.x,p.y]]:corners;
 for(const path of geometry.compile(tile.edges).paths){
  const edge=path.type==='W'?4:5;
  const limit=path.width/2+edge+6+(spec.kind==='canopy'?spec.trunkRadius:0);
  if(samples.some(point=>layer2.minRouteDistance(point,path)<limit))return false;
 }
 return true;
}
function intersects(a,b,gap=8){
 return Math.abs(a.x-b.x)<(a.width+b.width)/2+gap&&Math.abs(a.y-b.y)<(a.height+b.height)/2+gap;
}
function plan(tile){
 const occupied=layer2.plan(tile).map(p=>{const c=layer2.COMPONENTS[p.id];return {...p,width:c.width,height:c.height};});
 const placements=[];
 for(const [i,id] of ['willow-tree-01','garden-rockery-01'].entries()){
  const spec=ASSETS[id],offset=(tile.seed*7+tile.x*11+tile.y*17+i*4)%POSITIONS.length;
  for(let j=0;j<POSITIONS.length;j++){
   const [x,y]=POSITIONS[(j+offset)%POSITIONS.length],p={id,x,y,width:spec.width,height:spec.height};
   if(clearOfRoutes(tile,p)&&!occupied.some(other=>intersects(p,other))){
    placements.push({id,x,y});occupied.push(p);break;
   }
  }
 }
 return placements;
}
function draw(ctx,tile,images){
 let count=0;for(const p of plan(tile)){
  const spec=ASSETS[p.id],img=images?.[p.id];if(!img)continue;
  ctx.drawImage(img,tile.x*220+p.x-spec.width/2,tile.y*220+p.y-spec.height/2,spec.width,spec.height);count++;
 }return count;
}
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
async function verifiedImage(id,blob){
 const spec=ASSETS[id];if(!spec)throw Error('Unknown sprite '+id);
 if(!crypto?.subtle)throw Error('Browser SHA-256 support requires HTTPS');
 const bytes=await blob.arrayBuffer();
 const digest=hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)));
 if(digest!==spec.sha256)throw Error('SHA-256 mismatch for '+spec.filename+'. Choose the unmodified artwork package.');
 const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
 try{return await new Promise((resolve,reject)=>{
  const img=new Image();img.onload=()=>resolve(img);
  img.onerror=()=>reject(Error('Unable to decode '+spec.filename));img.src=url;
 });}finally{URL.revokeObjectURL(url);}
}
async function importBlobs(blobs){
 const result={};
 for(const id of Object.keys(ASSETS)){
  if(!blobs[id])throw Error('Missing '+ASSETS[id].filename);
  result[id]=await verifiedImage(id,blobs[id]);
 }
 return result;
}
async function importWebps(files){
 const blobs={};for(const f of files)for(const [id,spec] of Object.entries(ASSETS))
  if(f.name===spec.filename)blobs[id]=f;
 return importBlobs(blobs);
}
async function unzipCandidates(file){
 const bytes=await file.arrayBuffer(),v=new DataView(bytes),arr=new Uint8Array(bytes);
 const u16=n=>v.getUint16(n,true),u32=n=>v.getUint32(n,true);
 let end=-1;
 for(let p=bytes.byteLength-22;p>=Math.max(0,bytes.byteLength-65557);p--)
  if(u32(p)===0x06054b50){end=p;break;}
 if(end<0)throw Error('ZIP directory not found');
 let ptr=u32(end+16),count=u16(end+10);
 const blobs={};
 for(let i=0;i<count;i++){
  if(u32(ptr)!==0x02014b50)throw Error('Invalid ZIP directory');
  const method=u16(ptr+10),size=u32(ptr+20),nlen=u16(ptr+28),extra=u16(ptr+30),comment=u16(ptr+32),local=u32(ptr+42);
  const name=new TextDecoder().decode(arr.subarray(ptr+46,ptr+46+nlen));
  ptr+=46+nlen+extra+comment;
  const entry=Object.entries(ASSETS).find(([,spec])=>name==='assets/v3/large/'+spec.filename);
  if(!entry)continue;
  if(u32(local)!==0x04034b50)throw Error('Bad ZIP local header for '+name);
  const begin=local+30+u16(local+26)+u16(local+28);
  const payload=arr.slice(begin,begin+size);
  let blob=new Blob([payload],{type:'image/webp'});
  if(method===8){
   if(typeof DecompressionStream==='undefined')throw Error('ZIP decompression unavailable: extract ZIP and select both WebPs');
   try{blob=await new Response(blob.stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();}
   catch(_){throw Error('ZIP decompression unsupported: extract ZIP and select both WebPs');}
  }else if(method!==0)throw Error('Unsupported ZIP compression '+method);
  blobs[entry[0]]=blob;
 }
 return importBlobs(blobs);
}
return Object.freeze({ASSETS,clearOfRoutes,plan,draw,importWebps,unzipCandidates});
});