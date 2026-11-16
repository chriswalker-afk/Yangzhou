/* Yangzhou V3 rev49 — unified, geometry-guarded Layer 2 composition.
 * Existing artwork binaries, Layer 1A ports, Layer 1B surfaces, genuine wall
 * centreline geometry and original wall/courtyard laboratories remain intact.
 * Paintings never rotate or scale outside their authored world footprints.
 * This is a candidate preview planner, not a live V2 gameplay migration.
 */
(function(root,factory){
 const node=typeof module!=='undefined'&&module.exports;
 const api=factory(
  node?require('./base-geometry.js'):root.YangzhouV3Geometry,
  node?require('./layer2-placements.js'):root.YangzhouV3Layer2,
  node?require('./wall-geometry.js'):root.YangzhouV3WallGeometry,
  node?require('./courtyard-walkway.js'):root.YangzhouV3CourtyardWalkway
 );
 if(node)module.exports=api;
 if(root)root.YangzhouV3Layer2Integrated=api;
})(typeof window!=='undefined'?window:null,function(geometry,layer2,walls,walkway){
 'use strict';
 if(!geometry||!layer2||!walls||!walkway)throw Error('V3 layer geometry + walls + walkway required');
 const TILE=220;
 const NEW_IDS=Object.freeze(['garden-pavilion-01','bamboo-grove-01',
  'garden-rockery-02','courtyard-wing-01','waterside-landing-01']);
 const WORLD=Object.freeze({
  // The established 136-unit rectangle has no space for a 96-unit hall and
  // a 33-unit wing without collision. Use a SEPARATE genuine wider compound,
  // leaving all original wall templates and moon-gates unchanged.
  wide:Object.freeze({
   id:'rectangle',name:'Wider walled residence + side wing',
   role:'wide-courtyard',hall:Object.freeze({id:'courtyard-hall-01',x:124,y:97}),
   paths:Object.freeze([{id:'perimeter',
    points:Object.freeze([[22,43],[198,43],[198,194],[22,194],[22,43]])}]),
   openings:Object.freeze([{id:'moon-gate',pathId:'perimeter',
    center:Object.freeze([124,194]),width:30}])
  })
 });
 const MODEL_KINDS=Object.freeze({
  wide:WORLD.wide,
  rectangle:walls.templates.rectangle,
  partial:walls.templates.partial,
  elbow:walls.templates.elbow,
  tee:walls.templates.tee,
  pavilion:null,rockery:null,bamboo:null,landing:null,none:null
 });
 const ALLOWED=Object.freeze(Object.keys(MODEL_KINDS));
 function modelFor(kind){
  if(!Object.prototype.hasOwnProperty.call(MODEL_KINDS,kind))
   throw Error('Unknown Layer 2 composition '+kind);
  return MODEL_KINDS[kind];
 }
 function footprint(p){
  const c=layer2.COMPONENTS[p.id];
  if(!c)throw Error('Unknown Layer 2 asset '+p.id);
  return Object.freeze({left:p.x-c.width/2,right:p.x+c.width/2,
   top:p.y-c.height/2,bottom:p.y+c.height/2});
 }
 function intersects(a,b,pad=0){
  return a.left<b.right+pad&&a.right>b.left-pad&&
   a.top<b.bottom+pad&&a.bottom>b.top-pad;
 }
 function wallClear(p,compiled){
  // A visual bounding box must leave at least four units past the FOUNDATION
  // (8 world units each side). Not just the sprite's centre/trunk.
  const sample=layer2.footprintSamples(p.x,p.y,
   layer2.COMPONENTS[p.id].width,layer2.COMPONENTS[p.id].height);
  for(const path of compiled.paths){
   for(let j=1;j<path.points.length;j++)
    for(const q of sample)
     if(walls.distToSegment(q,path.points[j-1],path.points[j])<walls.WIDTHS.foundation/2+4)
      return false;
  }
  for(const gate of compiled.gates){
   const g={left:Math.min(gate.start[0],gate.end[0])-4,
    right:Math.max(gate.start[0],gate.end[0])+4,
    top:gate.center[1]-14,bottom:gate.center[1]+14};
   if(intersects(footprint(p),g))return false;
  }
  return true;
 }
 function routeClear(p,model,compiled){
  if(!model||!model.hall)return true;
  const route=walkway.routeFor(model,compiled);
  if(!route)return true;
  const r={left:route.x,right:route.x+route.width,
   top:route.y,bottom:route.y+route.height};
  // Hall is intentionally the destination of the path, not an obstruction.
  return p.id==='courtyard-hall-01'||!intersects(footprint(p),r,3);
 }
 function validate(tile,p,{model=null,compiled=null,already=[]}={}){
  if(!layer2.validateDetail(tile,p))return false;
  if(!layer2.distinctFootprints(p,already,7))return false;
  if(p.id==='waterside-landing-01')return !model&&already.length===0;
  if(compiled&&!wallClear(p,compiled))return false;
  if(!routeClear(p,model,compiled))return false;
  return true;
 }
 function plan(tile,kind){
  if(!tile||!Number.isInteger(tile.x)||!Number.isInteger(tile.y))
   throw Error('Layer 2 integrated tile must have integer board coordinates');
  if(!Array.isArray(tile.edges)||tile.edges.length!==4)
   throw Error('Tile must have N/E/S/W geometry');
  geometry.compile(tile.edges);
  const model=modelFor(kind);
  const report=model?walls.audit(model,tile):null;
  const compiled=report?.valid?walls.compile(model):null;
  if(report&&!report.valid)return Object.freeze({
   kind,tile,model,compiled:null,wallAudit:report,
   accepted:false,placements:Object.freeze([]),
   reason:'walls-rejected-for-road-canal-geometry'
  });
  const placements=[];
  function add(id,x,y){
   const p={id,x,y};
   if(!validate(tile,p,{model,compiled,already:placements}))return false;
   placements.push(Object.freeze(p));
   return true;
  }
  if(kind==='wide'){
   add('courtyard-hall-01',model.hall.x,model.hall.y);
   add('courtyard-wing-01',52,107);
  }else if(kind==='rectangle'||kind==='partial'||kind==='elbow'||kind==='tee'){
   add('courtyard-hall-01',model.hall.x,model.hall.y);
  }else if(kind==='pavilion'){
   add('garden-pavilion-01',110,97);
   add('bamboo-grove-01',48,166);
  }else if(kind==='rockery'){
   add('garden-rockery-02',91,106);
   add('bamboo-grove-01',170,160);
  }else if(kind==='bamboo'){
   add('bamboo-grove-01',91,98);
   add('garden-rockery-02',164,169);
  }else if(kind==='landing'){
   add('waterside-landing-01',110,53);
  }
  // A scene's identity is tile-local and independent of its placement on
  // the map. If no safe asset fits, it remains genuinely empty.
  return Object.freeze({kind,tile,model,compiled,wallAudit:report,
   accepted:true,placements:Object.freeze(placements),reason:null});
 }
 function draw(ctx,tile,layout,images,opts={}){
  const spec=typeof layout==='string'?plan(tile,layout):layout;
  if(!spec?.accepted)return 0;
  let n=0;
  const ox=tile.x*TILE,oy=tile.y*TILE;
  for(const p of spec.placements){
   if(opts.visible?.[p.id]===false)continue;
   const image=images?.[p.id];
   if(!image)continue; // no substitute silhouettes or fabricated artwork
   const c=layer2.COMPONENTS[p.id];
   ctx.drawImage(image,ox+p.x-c.width/2,oy+p.y-c.height/2,c.width,c.height);
   n++;
  }
  return n;
 }
 const hex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
 async function decodedImage(blob){
  if(typeof createImageBitmap==='function')return await createImageBitmap(blob);
  const url=URL.createObjectURL(blob);
  try{return await new Promise((resolve,reject)=>{
   const img=new Image();img.onload=()=>resolve(img);
   img.onerror=()=>reject(Error('Failed to decode original Layer 2 WebP'));img.src=url;
  });}finally{URL.revokeObjectURL(url);}
 }
 async function loadVerified({onProgress}={}){
  // The accepted five image hashes are not copied to a second registry:
  // one canonical asset-manifest drives original-blob verification.
  if(typeof crypto==='undefined'||!crypto.subtle)
   throw Error('Verified WebP loading requires HTTPS/localhost');
  const response=await fetch('assets/v3/large/new-candidates-manifest.json',{cache:'no-store'});
  if(!response.ok)throw Error('Could not load canonical Layer 2 asset manifest');
  const manifest=await response.json();
  const images={},errors=[];
  const newSpecs=Object.fromEntries(manifest.items.map(x=>[x.id,x]));
  for(const id of NEW_IDS){
   const spec=newSpecs[id],c=layer2.COMPONENTS[id];
   if(!spec||!spec.binaryCommitted||spec.productionApproved!==false||
      spec.image!==c.image||spec.worldWidth!==c.width||spec.worldHeight!==c.height)
    throw Error('Unverified Layer 2 manifest entry '+id);
  }
  await Promise.all(NEW_IDS.map(async id=>{
   const spec=newSpecs[id];
   try{
    const result=await fetch(spec.image,{cache:'no-store'});
    if(!result.ok)throw Error('HTTP '+result.status);
    const blob=await result.blob();
    if(blob.size!==spec.bytes)throw Error('Artwork byte count mismatch');
    const hash=hex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
    if(hash!==spec.sha256)throw Error('Artwork SHA-256 mismatch');
    const image=await decodedImage(blob);
    if((image.naturalWidth||image.width)!==spec.width||
       (image.naturalHeight||image.height)!==spec.height)
     throw Error('Artwork dimensions mismatch');
    images[id]=image;
    onProgress?.({images:{...images},errors:[...errors]});
   }catch(error){errors.push(id+': '+String(error.message||error));onProgress?.({images:{...images},errors:[...errors]});}
  }));
  // The original Courtyard Hall 01 has an independent established SHA
  // contract in tests/v3-layer2.cjs. Load it without regenerating art.
  try{
   const file=await fetch(layer2.COMPONENTS['courtyard-hall-01'].image,{cache:'no-store'});
   if(!file.ok)throw Error('HTTP '+file.status);
   images['courtyard-hall-01']=await decodedImage(await file.blob());
  }catch(e){errors.push('courtyard-hall-01: '+String(e.message||e));}
  return Object.freeze({images,errors,verifiedCount:NEW_IDS.filter(id=>!!images[id]).length});
 }
 return Object.freeze({TILE,NEW_IDS,MODEL_KINDS,ALLOWED,WORLD,modelFor,footprint,
  intersects,wallClear,routeClear,validate,plan,draw,loadVerified});
});
