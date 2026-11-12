/* Yangzhou V3 - enclosure assembly prototype. Never used by playable V2.
 * Authoritative tile geometry is the existing V3 base renderer. Sprite sources
 * are real, independently painted PNGs; WebPs are not silently substituted.
 */
(function(root,factory){
  const geometry=typeof module!=='undefined'&&module.exports?require('./base-geometry.js'):root.YangzhouV3Geometry;
  const layer2=typeof module!=='undefined'&&module.exports?require('./layer2-placements.js'):root.YangzhouV3Layer2;
  const api=factory(geometry,layer2);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.YangzhouV3Enclosures=api;
})(typeof window!=='undefined'?window:null,function(geometry,layer2){
'use strict';
if(!geometry||!layer2)throw Error('V3 exact geometry and Layer 2 must load before courtyard enclosures');
const TILE=220, INSET=10, GAP=6;
const BASE='assets/v3/enclosures/';
/* The initial 70x12 / 40x12 / 36x36 / 32x22 footprints were art briefs.
 * These crop-ratio-conserving DRAW sizes were measured from the four authentic
 * paintings. Especially the short wall must be 29x12, not squashed to 40x12.
 * Structural collision geometry is deliberately not reduced with the crop.
 */
const COMPONENTS=Object.freeze({
 'white-garden-wall-long-01':Object.freeze({
  id:'white-garden-wall-long-01',name:'White Garden Wall 01 — Long',
  filename:'white-garden-wall-long-01.webp',width:70,height:12,
  preparedWidth:2125,preparedHeight:389,bytes:1107696,
  sha256:'cdba1b3166c9bdc8b5ea9c4afaba24b3dc32b59035c202f17a72e112aa619577',
  ports:Object.freeze({W:[-35,0],E:[35,0]}),kind:'straight'
 }),
 'white-garden-wall-short-01':Object.freeze({
  id:'white-garden-wall-short-01',name:'White Garden Wall 02 — Short',
  filename:'white-garden-wall-short-01.webp',width:29,height:12,
  preparedWidth:1225,preparedHeight:541,bytes:833094,
  sha256:'3f6d358a9871ac1c5a68a1bf00b971c58c478aab3e249b5574a8d1fe8aabd1a0',
  ports:Object.freeze({W:[-14.5,0],E:[14.5,0]}),kind:'straight'
 }),
 'white-garden-wall-corner-01':Object.freeze({
  id:'white-garden-wall-corner-01',name:'White Garden Wall Corner 01 — West-to-South',
  filename:'white-garden-wall-corner-01.webp',width:34,height:29,
  preparedWidth:1112,preparedHeight:940,bytes:939828,
  sha256:'4f1298dc6e51cb5ee556c9a30e50db4b351f13d4ee8ada6dde7db6fd83671d1a',
  ports:Object.freeze({W:[-17,-3],S:[10,14.5]}),kind:'corner'
 }),
 'moon-gate-01':Object.freeze({
  id:'moon-gate-01',name:'Moon Gate 01',
  filename:'moon-gate-01.webp',width:32,height:16,
  preparedWidth:1448,preparedHeight:721,bytes:1246684,
  sha256:'e06e5a87395563c605b86f4777ebfa02a183ba40f09eca3fac70d755f5370853',
  ports:Object.freeze({W:[-16,0],E:[16,0]}),kind:'gate',passable:true,walkThroughAxis:'north-south'
 })
});
const IDS=Object.keys(COMPONENTS);
function port(piece,side){
 const p=COMPONENTS[piece.id].ports[side];
 if(!p)throw Error('No '+side+' port on '+piece.id);
 return Object.freeze({x:piece.x+p[0],y:piece.y+p[1]});
}
function horizontalChain(startX,centerY,ids){
 let x=startX,y=centerY;const parts=[],seams=[];
 for(let i=0;i<ids.length;i++){
  const c=COMPONENTS[ids[i]];
  if(!c||!c.ports.W)throw Error('Asset lacks west join port: '+ids[i]);
  const piece=Object.freeze({id:ids[i],x:x-c.ports.W[0],y:y-c.ports.W[1]});
  if(parts.length){
   const prev=parts[parts.length-1],end=port(prev,'E'),start=port(piece,'W');
   seams.push(Object.freeze({a:prev.id,b:piece.id,x:end.x,y:end.y,gap:Math.hypot(end.x-start.x,end.y-start.y)}));
  }
  parts.push(piece);
  if(c.ports.E){const e=port(piece,'E');x=e.x;y=e.y;}
  else if(i!==ids.length-1)throw Error('Non-straight asset must terminate chain: '+piece.id);
 }
 return Object.freeze({pieces:Object.freeze(parts),seams:Object.freeze(seams)});
}
const CONFIG=Object.freeze({
 north:Object.freeze({startX:40,y:48,ids:['white-garden-wall-long-01','white-garden-wall-short-01','white-garden-wall-corner-01']}),
 south:Object.freeze({startX:41,y:172,ids:['white-garden-wall-long-01','moon-gate-01','white-garden-wall-short-01']})
});
function plannedCompound(){
 const north=horizontalChain(CONFIG.north.startX,CONFIG.north.y,CONFIG.north.ids);
 const south=horizontalChain(CONFIG.south.startX,CONFIG.south.y,CONFIG.south.ids);
 const gate=south.pieces.find(p=>p.id==='moon-gate-01');
 const corner=north.pieces.find(p=>p.id==='white-garden-wall-corner-01');
 return Object.freeze({
  pieces:Object.freeze([...north.pieces,...south.pieces]),
  seams:Object.freeze([...north.seams,...south.seams]),
  guides:Object.freeze([
   Object.freeze({from:{x:CONFIG.north.startX,y:CONFIG.north.y},to:{x:CONFIG.south.startX,y:CONFIG.south.y},reason:'north-south straight artwork missing'}),
   Object.freeze({from:port(corner,'S'),to:{x:CONFIG.south.startX+70+32+29,y:CONFIG.south.y},reason:'north-south straight artwork missing'})
  ]),
  gateCorridor:Object.freeze({centerX:gate.x,width:8,fromY:gate.y-16,toY:gate.y+16}),
  hall:Object.freeze({id:'courtyard-hall-01',x:107,y:110}),
  status:'partial-compound-only: missing two compass-upright north-south wall variants',
  missingOrientedArtwork:Object.freeze(['north-south-straight','opposite-turn-corner'])
 });
}
function sampleBox(p){
 const c=COMPONENTS[p.id];
 if(!c)throw Error('Unknown enclosure '+p.id);
 const points=[];
 for(let i=0;i<=6;i++)for(let j=0;j<=6;j++)
  points.push([p.x-c.width/2+i*c.width/6,p.y-c.height/2+j*c.height/6]);
 return points;
}
function safeForTile(tile,p){
 const pts=sampleBox(p);
 if(pts.some(([x,y])=>x<INSET||y<INSET||x>TILE-INSET||y>TILE-INSET))return false;
 for(const path of geometry.compile(tile.edges).paths){
  const radius=path.width/2+(path.type==='W'?4:5)+GAP;
  if(pts.some(pt=>layer2.minRouteDistance(pt,path)<radius))return false;
 }
 return true;
}
function overlap(a,b,slack=0.01){
 const aa=COMPONENTS[a.id],bb=COMPONENTS[b.id];
 return Math.abs(a.x-b.x)<(aa.width+bb.width)/2-slack &&
        Math.abs(a.y-b.y)<(aa.height+bb.height)/2-slack;
}
function audit(tile,layout=plannedCompound()){
 const problems=[];
 for(const p of layout.pieces)
  if(!safeForTile(tile,p))problems.push('Protected street/canal, or tile-boundary overlap: '+p.id);
 for(let i=0;i<layout.pieces.length;i++)for(let j=i+1;j<layout.pieces.length;j++)
  if(overlap(layout.pieces[i],layout.pieces[j]))problems.push('Two wall footprints overlap: '+i+', '+j);
 if(!layer2.validateDetail(tile,layout.hall))problems.push('Courtyard hall placement conflicts with routes');
 const hallBounds={id:'courtyard-hall-01',x:layout.hall.x,y:layout.hall.y};
 const hall=layer2.COMPONENTS[hallBounds.id];
 for(const p of layout.pieces){
  const c=COMPONENTS[p.id];
  if(Math.abs(p.x-hallBounds.x)<(c.width+hall.width)/2 &&
     Math.abs(p.y-hallBounds.y)<(c.height+hall.height)/2)
    problems.push('Courtyard wall intrudes into hall: '+p.id);
 }
 for(const j of layout.seams)if(j.gap>0.001)problems.push('Disconnected join: '+j.a+' / '+j.b);
 return Object.freeze({valid:problems.length===0,problems:Object.freeze(problems),seams:layout.seams.length,passableGateAxis:'north-south',visualClosed:false});
}
function draw(ctx,tile,images,options={}){
 const layout=plannedCompound(),check=audit(tile,layout);
 if(!check.valid)return Object.freeze({drawn:0,valid:false,problems:check.problems});
 const ox=tile.x*TILE,oy=tile.y*TILE;
 const guides=options.guides!==false;
 ctx.save();
 if(guides){
  ctx.strokeStyle='rgba(84,93,86,.65)';
  ctx.lineWidth=0.9;ctx.setLineDash([3,3]);
  for(const guide of layout.guides){
   ctx.beginPath();ctx.moveTo(ox+guide.from.x,oy+guide.from.y);
   ctx.lineTo(ox+guide.to.x,oy+guide.to.y);ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.strokeStyle='rgba(89,112,93,.8)';ctx.lineWidth=.7;
  ctx.strokeRect(ox+layout.gateCorridor.centerX-4,oy+layout.gateCorridor.fromY,
    layout.gateCorridor.width,layout.gateCorridor.toY-layout.gateCorridor.fromY);
 }
 let drawn=0;
 for(const piece of layout.pieces){
  const c=COMPONENTS[piece.id],img=images&&images[piece.id];
  if(img){
   ctx.drawImage(img,ox+piece.x-c.width/2,oy+piece.y-c.height/2,c.width,c.height);
   drawn++;
  }else if(guides){
   // Geometry-only review box; do not counterfeit a painted sprite.
   ctx.strokeStyle='rgba(150,67,53,.85)';ctx.lineWidth=.75;ctx.setLineDash([2,2]);
   ctx.strokeRect(ox+piece.x-c.width/2,oy+piece.y-c.height/2,c.width,c.height);
   ctx.setLineDash([]);
  }
 }
 if(guides){
  for(const seam of layout.seams){
   ctx.fillStyle='rgba(53,97,90,.9)';ctx.beginPath();
   ctx.arc(ox+seam.x,oy+seam.y,1.7,0,Math.PI*2);ctx.fill();
  }
 }
 ctx.restore();
 return Object.freeze({drawn,valid:true,problems:[],seams:layout.seams.length});
}
function shaHex(d){return Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,'0')).join('');}
function decodeBlob(blob){
 const url=URL.createObjectURL(blob);
 return new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>{URL.revokeObjectURL(url);resolve(image);};
  image.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Could not decode painted WebP'));};
  image.src=url;
 });
}
async function verify(id,blob){
 const c=COMPONENTS[id];
 if(!c)throw Error('Unknown sprite '+id);
 if(blob.size!==c.bytes)throw Error('Unexpected byte size for '+c.filename);
 if(typeof crypto==='undefined'||!crypto.subtle)throw Error('SHA-256 requires a secure HTTPS origin');
 const digest=shaHex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
 if(digest!==c.sha256)throw Error('Original painted sprite hash mismatch: '+c.filename);
 const img=await decodeBlob(blob);
 if(img.naturalWidth!==c.preparedWidth||img.naturalHeight!==c.preparedHeight)
  throw Error('Wrong sprite image dimensions for '+c.filename);
 return img;
}
async function loadCommitted(){
 const images={},missing=[],errors=[];
 if(typeof fetch==='undefined')return {images,missing:IDS,errors:['Browser required']};
 await Promise.all(IDS.map(async id=>{
  const c=COMPONENTS[id];
  try{
   const response=await fetch(BASE+c.filename,{cache:'no-store'});
   if(!response.ok)throw Error('HTTP '+response.status);
   images[id]=await verify(id,await response.blob());
  }catch(e){missing.push(c.filename);errors.push(id+': '+String(e.message||e));}
 }));
 return {images,missing,errors};
}
async function loadLocal(files){
 const byName=new Map(Array.from(files||[]).map(f=>[f.name,f]));
 const images={},missing=[],errors=[];
 await Promise.all(IDS.map(async id=>{
  const c=COMPONENTS[id],file=byName.get(c.filename);
  if(!file){missing.push(c.filename);return;}
  try{images[id]=await verify(id,file);}
  catch(e){missing.push(c.filename);errors.push(String(e.message||e));}
 }));
 return {images,missing,errors};
}
return Object.freeze({TILE,INSET,GAP,BASE,IDS,COMPONENTS,CONFIG,
 port,horizontalChain,plannedCompound,safeForTile,audit,draw,
 loadCommitted,loadLocal});
});