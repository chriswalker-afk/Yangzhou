/* Yangzhou V3: seven NEW author-painted assets, isolated review composition.
 * No legacy sprite, Layer 1 mask, wall material or playable V2 source is changed.
 * Original bitmaps are always compass upright; authentic ground is composed separately.
 */
(function(root,factory){
 const node=typeof module!=='undefined'&&module.exports;
 const api=factory(node?require('../../tile-topology.js'):root.YangzhouTileTopology,
  node?require('./base-geometry.js'):root.YangzhouV3Geometry,
  node?require('./layer2-placements.js'):root.YangzhouV3Layer2,
  node?require('./wall-geometry.js'):root.YangzhouV3WallGeometry);
 if(node)module.exports=api;
 if(root)root.YangzhouV3SevenCandidates=api;
})(typeof window!=='undefined'?window:null,function(topology,geometry,layer2,walls){
 'use strict';
 if(!topology||!geometry||!layer2||!walls)throw Error('Original Yangzhou V3 topology/wall modules must load first');
 const SIZE=220,GRID=4;
 const ASSETS=Object.freeze({
  'stone-bridge-parapets-01':Object.freeze({width:88,height:44,mode:'bridge',signature:'WSWS',crop:Object.freeze({x:250,y:151,width:1272,height:528})}),
  'street-shopfront-01':Object.freeze({width:72,height:43,mode:'road-north',signature:'LSLS'}),
  'covered-garden-corridor-01':Object.freeze({width:88,height:30,mode:'land',signature:'LLLL'}),
  'waterside-pavilion-01':Object.freeze({width:72,height:48,mode:'canal-north',signature:'LWLW'}),
  'small-residence-01':Object.freeze({width:60,height:40,mode:'courtyard',signature:'LLLL'}),
  'tea-house-01':Object.freeze({width:84,height:46,mode:'road-north',signature:'LSLS'}),
  'waterside-landing-02':Object.freeze({width:95,height:52,mode:'canal-north',signature:'LWLW'})
 });
 const ID_LIST=Object.freeze(Object.keys(ASSETS));
 const LAYOUT=Object.freeze([
  ['LLLL','LLLL','WLWL','LLLL'],
  ['LSLS','LSLS','WSWS','LSLS'],
  ['LLLL','LLLL','WLWL','LLLL'],
  ['LWLW','LWLW','WWLW','LWLW']
 ].map(row=>Object.freeze([...row])));
 const ROLES=Object.freeze([
  ['hall-garden','corridor','vertical-canal','hall'],
  ['shopfront','tea-house','bridge','street-garden'],
  ['small-residence','rock-garden','vertical-canal','pavilion-garden'],
  ['waterside-pavilion','landing','canal-junction','canal-garden']
 ].map(row=>Object.freeze([...row])));
 const OBJECTS=Object.freeze({
  landing:Object.freeze([{id:'waterside-landing-02',x:110,y:36}]),
  'corridor':Object.freeze([{id:'covered-garden-corridor-01',x:103,y:111}]),
  'shopfront':Object.freeze([{id:'street-shopfront-01',x:110,y:52}]),
  'tea-house':Object.freeze([{id:'tea-house-01',x:110,y:52}]),
  'bridge':Object.freeze([{id:'stone-bridge-parapets-01',x:110,y:110}]),
  'small-residence':Object.freeze([{id:'small-residence-01',x:110,y:107}]),
  'waterside-pavilion':Object.freeze([{id:'waterside-pavilion-01',x:110,y:35}])
 });
 const ORIGINALS=Object.freeze({
  'hall-garden':[{id:'courtyard-hall-01',x:110,y:109}],
  hall:[{id:'courtyard-hall-01',x:110,y:109}],
  'rock-garden':[{id:'bamboo-grove-01',x:66,y:93},{id:'garden-rockery-02',x:158,y:165}],
  'pavilion-garden':[{id:'garden-pavilion-01',x:110,y:103}],
  'street-garden':[{id:'willow-tree-01',x:173,y:44}],
  'canal-garden':[{id:'garden-rockery-01',x:110,y:34}]
 });
 const SPECIFICS=Object.freeze({sideGateCenter:Object.freeze([52,110]),
  sideGateWallX:52,sideGateMinWalkThrough:24,verticalWallFoundationWidth:walls.WIDTHS.foundation,
  bridgeWaterWidth:88,bridgeRoadWidth:44,bridgeApproachWidth:geometry.portWidths.S});
 const rowcol=(x,y)=>LAYOUT[y]?.[x];
 function modelFor(role,{gateWidth=30}={}){
  if(role==='hall-garden')return walls.templates.rectangle;
  if(role==='small-residence')return {
   ...walls.templates.rectangle,name:'Small residential enclosure',
   hall:{id:'small-residence-01',x:110,y:107}
  };
  if(role==='hall')return walls.templates.rectangle;
  return null;
 }
 function tiles(){
  const items=[];
  for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++)items.push(Object.freeze({
   x,y,seed:1+x+GRID*y,edges:Object.freeze(rowcol(x,y).split('')),
   role:ROLES[y][x]
  }));
  const issues=topology.validateBoard(items);
  if(issues.length)throw Error('V3 connected-tile preview has mismatched ports: '+issues.join('; '));
  return Object.freeze(items);
 }
 function bounds(p){
  const s=ASSETS[p.id];if(!s)throw Error('Unknown new V3 art '+p.id);
  return Object.freeze({left:p.x-s.width/2,right:p.x+s.width/2,
   top:p.y-s.height/2,bottom:p.y+s.height/2});
 }
 function isSafe(tile,p,{gateWidth=30}={}){
  const s=ASSETS[p.id];if(!s||tile.edges.join('')!==s.signature)return false;
  const a=bounds(p);
  if(a.left<10||a.top<10||a.right>210||a.bottom>210)return false;
  if(s.mode==='bridge'){
   // Original 44-unit bridge image over the 88-unit canal meets 28-unit walkable approaches.
   const g=geometry.compile(tile.edges);
   return p.x===110&&p.y===110&&s.width===SPECIFICS.bridgeWaterWidth&&
    s.height===SPECIFICS.bridgeRoadWidth&&a.left===66&&a.right===154&&a.top===88&&a.bottom===132&&
    g.bridge&&g.paths.some(q=>q.type==='S'&&q.width===SPECIFICS.bridgeApproachWidth&&q.kind==='line')&&
    g.paths.some(q=>q.type==='W'&&q.width===88&&q.kind==='line');
  }
  if(s.mode==='canal-north'){
   // Entire pavilion stays on northern LAND, short of the original bank
   // and the immutable y=66 water mask. No sprite painting over canal.
   const g=geometry.compile(tile.edges);
   return g.paths.length===1&&g.paths[0].type==='W'&&g.paths[0].kind==='line'&&
    p.x===110&&a.bottom<=62&&a.top>=10;
  }
  const g=geometry.compile(tile.edges);
  const samples=layer2.footprintSamples(p.x,p.y,s.width,s.height);
  for(const route of g.paths){
   const clearance=route.width/2+(route.type==='W'?4:5)+6;
   for(const point of samples)if(layer2.minRouteDistance(point,route)<clearance)return false;
  }
  const model=modelFor(tile.role,{gateWidth});
  if(model){
   const wall=walls.compile(model);
   for(const line of wall.paths)for(let j=1;j<line.points.length;j++){
    for(const point of samples)if(walls.distToSegment(point,line.points[j-1],line.points[j])<walls.WIDTHS.foundation/2+6)return false;
   }
   for(const gate of wall.gates){
    if(s.mode==='courtyard'&&Math.abs(p.x-gate.center[0])<=s.width/2+4&&
     Math.abs(p.y-gate.center[1])<=s.height/2+4)return false;
   }
  }
  return true;
 }
 function plan({gateWidth=30}={}){
  if(gateWidth!==30&&gateWidth!==40)throw Error('Only authored 30/40 wall clearance comparison is supported');
  const out=[];
  for(const tile of tiles()){
   const art=OBJECTS[tile.role]||[];
   for(const p of art)if(!isSafe(tile,p,{gateWidth}))throw Error('Unsafe '+p.id+' at '+tile.x+','+tile.y);
   const model=modelFor(tile.role,{gateWidth});
   const audit=model?walls.audit(model,tile):null;
   if(audit&&!audit.valid)throw Error('Wall / hall rejected for tile '+tile.role+': '+audit.issues.join('; '));
   const gates=model?walls.compile(model).gates:[];
   out.push(Object.freeze({tile,model,audit,gates,art:Object.freeze(art),
    originals:Object.freeze(ORIGINALS[tile.role]||[])}));
  }
  return Object.freeze({tiles:Object.freeze(out),gateWidth,sideGateClearWidth:null,
   sideGateClearanceApproved:null,warning:null,
   allNewAssetsIncluded:ID_LIST.every(id=>out.some(t=>t.art.some(p=>p.id===id))) });
 }
 const digest=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
 async function loadVerified({onProgress}={}){
  if(!crypto?.subtle)throw Error('Original sprite SHA-256 review needs HTTPS or localhost');
  const m=await fetch('assets/v3/large/seven-candidates-manifest.json',{cache:'no-store'});
  if(!m.ok)throw Error('Cannot load seven candidate manifest: HTTP '+m.status);
  const manifest=await m.json();
  if(manifest.schemaVersion!==1||manifest.productionApproved!==false||
     manifest.newAssets?.length!==ID_LIST.length)throw Error('Unexpected asset manifest content');
  const names=Object.fromEntries(manifest.newAssets.map(x=>[x.id,x]));
  const images={},errors=[];
  await Promise.all(ID_LIST.map(async id=>{
   try{
    const spec=names[id],known=ASSETS[id];
    if(!spec||spec.worldFootprint.width!==known.width||spec.worldFootprint.height!==known.height||
       spec.artworkCertifiedForV3!==false||spec.productionApproved!==false||
       spec.requiredSignature!==known.signature||
       spec.prepared.path!==('assets/v3/large/'+id+'.webp'))throw Error('candidate contract mismatch');
    const result=await fetch(spec.prepared.path,{cache:'no-store'});
    if(!result.ok)throw Error('original sprite HTTP '+result.status);
    const blob=await result.blob();
    if(blob.size!==spec.prepared.bytes)throw Error('wrong original WebP byte count');
    const sha=digest(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
    if(sha!==spec.prepared.sha256)throw Error('original WebP SHA-256 mismatch');
    const image=await createImageBitmap(blob);
    if(image.width!==spec.prepared.width||image.height!==spec.prepared.height)
     throw Error('original image dimensions mismatch');
    images[id]=image;
   }catch(error){errors.push(id+': '+String(error.message||error));}
   onProgress?.({images:{...images},errors:[...errors]});
  }));
  return Object.freeze({images,errors,verifiedCount:ID_LIST.filter(id=>!!images[id]).length});
 }
 function draw(ctx,entry,images,{visible=true}={}){
  if(!visible)return 0;
  const {tile,art}=entry,ox=tile.x*SIZE,oy=tile.y*SIZE;
  let drawn=0;
  for(const p of art){
   const image=images?.[p.id],spec=ASSETS[p.id];if(!image)continue;
   const x=ox+p.x-spec.width/2,y=oy+p.y-spec.height/2;
   if(spec.mode==='bridge'){
    // The road renderer clips its stone surface to the two dry banks.
    // Keep the 88x44 crossing water-backed: never underpaint the transparent
    // pixels of the bridge PNG with a stone/road rectangle. The bridge's own
    // painted deck is the only paving between the two shores.
    ctx.save();ctx.beginPath();ctx.rect(x,y,spec.width,spec.height);ctx.clip();
    // Crop the original's transparent margins without distorting its aspect.
    const crop=spec.crop,artHeight=spec.width*crop.height/crop.width;
    ctx.drawImage(image,crop.x,crop.y,crop.width,crop.height,
     x,y+(spec.height-artHeight)/2,spec.width,artHeight);
    ctx.restore();
   }else ctx.drawImage(image,x,y,spec.width,spec.height);
   drawn++;
  }
  return drawn;
 }
 return Object.freeze({SIZE,GRID,ASSETS,ID_LIST,LAYOUT,ROLES,SPECIFICS,OBJECTS,ORIGINALS,
  modelFor,tiles,bounds,isSafe,plan,loadVerified,draw});
});