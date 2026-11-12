/* Yangzhou V3 - enclosure assembly prototype. Never used by playable V2.
 * Authoritative tile geometry is the existing V3 base renderer. Sprite sources
 * are authentic paintings; no textures or simulated join artwork are substituted.
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
// The actual wall paintings have transparent endcap breathing room. Mathematical
// rectangle-to-rectangle joins exposed grass. Paint-contact ports are 2 units
// inside each joined side, making a controlled 4-unit overlap with no scaling.
const PAINTED_JOIN_INSET=2;
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
  ports:Object.freeze({W:[-33,0],E:[33,0]}),paintedJoinInset:PAINTED_JOIN_INSET,kind:'straight'
 }),
 'white-garden-wall-short-01':Object.freeze({
  id:'white-garden-wall-short-01',name:'White Garden Wall 02 — Short',
  filename:'white-garden-wall-short-01.webp',width:29,height:12,
  preparedWidth:1225,preparedHeight:541,bytes:833094,
  sha256:'3f6d358a9871ac1c5a68a1bf00b971c58c478aab3e249b5574a8d1fe8aabd1a0',
  ports:Object.freeze({W:[-12.5,0],E:[12.5,0]}),paintedJoinInset:PAINTED_JOIN_INSET,kind:'straight'
 }),
 'white-garden-wall-corner-01':Object.freeze({
  id:'white-garden-wall-corner-01',name:'White Garden Wall Corner 01 — West-to-South (repaint)',
  filename:'white-garden-wall-corner-01.webp',width:29,height:24,
  // Keep the exact uploaded, lossless 1254px square file. The artwork's
  // visible painting occupies an offset rectangle; crop only when drawing.
  // This preserves the source painting and aligns its 12-unit-high horizontal
  // wall with the adjoining long/short sections without stretching the square.
  preparedWidth:1254,preparedHeight:1254,bytes:921018,
  sha256:'3304e8073574782204fad405a53011a4e53599d169699d1258bc9aa1c0083501',
  sourceCrop:Object.freeze({x:51,y:154,width:1147,height:950}),
  ports:Object.freeze({W:[-12.5,-6],S:[10,12]}),paintedJoinInset:PAINTED_JOIN_INSET,kind:'corner'
 }),
 'moon-gate-01':Object.freeze({
  id:'moon-gate-01',name:'Moon Gate 01',
  filename:'moon-gate-01.webp',width:32,height:16,
  preparedWidth:1448,preparedHeight:721,bytes:1246684,
  sha256:'e06e5a87395563c605b86f4777ebfa02a183ba40f09eca3fac70d755f5370853',
  ports:Object.freeze({W:[-14,0],E:[14,0]}),paintedJoinInset:PAINTED_JOIN_INSET,kind:'gate',passable:true,walkThroughAxis:'north-south'
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
   const left=COMPONENTS[prev.id],right=c;
   const rectOverlap=prev.x+left.width/2-(piece.x-right.width/2);
   seams.push(Object.freeze({
    a:prev.id,b:piece.id,aIndex:parts.length-1,bIndex:parts.length,
    x:end.x,y:end.y,gap:Math.hypot(end.x-start.x,end.y-start.y),
    paintedOverlap:rectOverlap
   }));
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
  seams:Object.freeze([
   ...north.seams,
   ...south.seams.map(j=>Object.freeze({...j,aIndex:j.aIndex+north.pieces.length,bIndex:j.bIndex+north.pieces.length}))
  ]),
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
 for(let i=0;i<layout.pieces.length;i++)for(let j=i+1;j<layout.pieces.length;j++){
  if(!overlap(layout.pieces[i],layout.pieces[j]))continue;
  const intended=layout.seams.find(s=>s.aIndex===i&&s.bIndex===j);
  if(intended&&intended.gap<0.001&&
     intended.paintedOverlap>=3.9&&intended.paintedOverlap<=4.1)continue;
  problems.push('Non-joined wall footprints overlap: '+i+', '+j);
 }
 if(!layer2.validateDetail(tile,layout.hall))problems.push('Courtyard hall placement conflicts with routes');
 const hallBounds={id:'courtyard-hall-01',x:layout.hall.x,y:layout.hall.y};
 const hall=layer2.COMPONENTS[hallBounds.id];
 for(const p of layout.pieces){
  const c=COMPONENTS[p.id];
  if(Math.abs(p.x-hallBounds.x)<(c.width+hall.width)/2 &&
     Math.abs(p.y-hallBounds.y)<(c.height+hall.height)/2)
    problems.push('Courtyard wall intrudes into hall: '+p.id);
 }
 for(const j of layout.seams){
  if(j.gap>0.001)problems.push('Disconnected join: '+j.a+' / '+j.b);
  if(j.paintedOverlap<3.9||j.paintedOverlap>4.1)
   problems.push('Invalid painted join overlap: '+j.a+' / '+j.b);
 }
 return Object.freeze({valid:problems.length===0,problems:Object.freeze(problems),seams:layout.seams.length,passableGateAxis:'north-south',visualClosed:false});
}
// One rendering contract for the six-tile scene and the enlarged join bench.
// Bitmap cropping is independent from the structural world footprint.
function drawSprite(ctx,img,piece,ox=0,oy=0){
 const c=COMPONENTS[piece.id];
 if(!img||!c)return false;
 const dx=ox+piece.x-c.width/2,dy=oy+piece.y-c.height/2;
 if(c.sourceCrop){
  const crop=c.sourceCrop;
  // Crop offsets were measured against the original 1254px artwork.
  // Derivative previews retain that geometry, but use fewer source pixels.
  const actualWidth=img.naturalWidth||img.width||c.preparedWidth;
  const actualHeight=img.naturalHeight||img.height||c.preparedHeight;
  const ratioX=actualWidth/c.preparedWidth,ratioY=actualHeight/c.preparedHeight;
  ctx.drawImage(img,crop.x*ratioX,crop.y*ratioY,
    crop.width*ratioX,crop.height*ratioY,dx,dy,c.width,c.height);
 }else{
  ctx.drawImage(img,dx,dy,c.width,c.height);
 }
 return true;
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
  if(img){if(drawSprite(ctx,img,piece,ox,oy))drawn++;}else if(guides){
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
// Do not hold the whole art preview hostage to one stalled request or WebP decode.
// Report each independently verified original, with a hard deadline and safe abort.
function validTimeout(value){
 return Number.isFinite(value)?Math.max(350,Math.min(60000,Math.round(value))):35000;
}
function withDeadline(task,timeoutMs,controller,label){
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{
   try{controller?.abort();}catch(_){}
   reject(Error(label+' timed out after '+timeoutMs+'ms'));
  },timeoutMs);
  Promise.resolve(task).then(
   value=>{clearTimeout(timer);resolve(value);},
   error=>{clearTimeout(timer);reject(error);}
  );
 });
}
// Preview assets are visual derivatives of the same painter-authored originals.
// They are never treated as the production master. The manifest links each
// derivative to the unchanged original SHA-256; both hashes are checked.
const PREVIEWS=Object.freeze({
 'white-garden-wall-long-01':'white-garden-wall-long.webp',
 'white-garden-wall-short-01':'white-garden-wall-short.webp',
 'white-garden-wall-corner-01':'white-garden-wall-corner.webp',
 'moon-gate-01':'moon-gate.webp'
});
const PREVIEW_ROOT='assets/v3/previews/';
const RAW_ROOT='https://raw.githubusercontent.com/chriswalker-afk/Yangzhou/main/';
const CDN_ROOT='https://cdn.jsdelivr.net/gh/chriswalker-afk/Yangzhou@main/';
async function fetchBounded(url,timeoutMs){
 const controller=typeof AbortController!=='undefined'?new AbortController():null;
 return withDeadline((async()=>{
  const response=await fetch(url,{
   cache:'no-store',...(controller?{signal:controller.signal}:{})
  });
  if(!response.ok)throw Error('HTTP '+response.status+' for '+url);
  return response.blob();
 })(),timeoutMs,controller,url);
}
async function fetchFirstValid(url,sha256,bytes,dimensions,timeoutMs){
 const urls=[url,RAW_ROOT+url,CDN_ROOT+url];
 let last=null;
 for(const candidate of urls){
  try{
   const blob=await fetchBounded(candidate,timeoutMs);
   if(blob.size!==bytes)throw Error('Unexpected size for '+candidate);
   if(typeof crypto==='undefined'||!crypto.subtle)throw Error('HTTPS SHA-256 unavailable');
   const digest=shaHex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
   if(digest!==sha256)throw Error('Integrity mismatch for '+candidate);
   const image=await withDeadline(decodeBlob(blob),timeoutMs,null,candidate+' image decode');
   if(dimensions&&(image.naturalWidth!==dimensions[0]||image.naturalHeight!==dimensions[1]))
    throw Error('Wrong pixel dimensions for '+candidate);
   return image;
  }catch(err){last=err;}
 }
 throw Error('All three image sources failed; last error: '+String(last?.message||last));
}
async function fetchPreviewManifest(timeoutMs){
 const urls=[PREVIEW_ROOT+'manifest.json',RAW_ROOT+PREVIEW_ROOT+'manifest.json'];
 let last=null;
 for(const url of urls){
  const controller=typeof AbortController!=='undefined'?new AbortController():null;
  try{
   const text=await withDeadline((async()=>{
    const response=await fetch(url,{cache:'no-store',...(controller?{signal:controller.signal}:{})});
    if(!response.ok)throw Error('HTTP '+response.status);
    return response.json();
   })(),timeoutMs,controller,'preview manifest '+url);
   if(text.schemaVersion!==1||!text.assets)throw Error('Invalid preview provenance manifest');
   return text;
  }catch(err){last=err;}
 }
 throw Error('Could not reach compact V3 preview manifest: '+String(last?.message||last));
}
async function loadCommitted(options={}){
 const images={},missing=[],errors=[],total=IDS.length;
 const timeoutMs=validTimeout(options.timeoutMs);
 let completed=0,manifest=null;
 const progress=()=>{
  try{options.onProgress?.({images:{...images},missing:[...missing],
   errors:[...errors],completed,total,done:completed===total});}catch(_){}
 };
 if(typeof fetch==='undefined'){
  missing.push(...IDS.map(id=>COMPONENTS[id].filename));
  errors.push('Browser image fetch unavailable');completed=total;progress();
  return {images,missing,errors};
 }
 if(options.preferPreviews){
  try{manifest=options.previewManifest||await fetchPreviewManifest(timeoutMs);}
  catch(err){errors.push('Preview manifest: '+String(err.message||err));}
 }
 progress();
 // No more than two enclosure requests in flight. Twelve simultaneous large
 // images starved each other on a slow connection, triggering the old timeout.
 let next=0;
 async function worker(){
 while(next<IDS.length){
  const id=IDS[next++],c=COMPONENTS[id],name=PREVIEWS[id];
  try{
   if(manifest){
    const meta=manifest.assets[name];
    if(!meta||meta.sourceSha256!==c.sha256||
       meta.source!==(BASE+c.filename))
     throw Error('Preview provenance does not match original '+c.filename);
    images[id]=await fetchFirstValid(meta.preview,meta.previewSha256,
      meta.previewBytes,meta.previewDimensions,timeoutMs);
   }else{
    images[id]=await fetchFirstValid(BASE+c.filename,c.sha256,c.bytes,
      [c.preparedWidth,c.preparedHeight],timeoutMs);
   }
  }catch(err){
   missing.push(c.filename);
   errors.push(id+': '+String(err.message||err));
  }finally{completed++;progress();}
 }
 }
 await Promise.all([worker(),worker()]);
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
return Object.freeze({TILE,INSET,GAP,PAINTED_JOIN_INSET,BASE,PREVIEWS,PREVIEW_ROOT,IDS,COMPONENTS,CONFIG,
 port,horizontalChain,plannedCompound,safeForTile,audit,draw,drawSprite,
 fetchPreviewManifest,fetchFirstValid,loadCommitted,loadLocal});
});