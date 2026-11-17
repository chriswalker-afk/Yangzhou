/* Yangzhou V3 — ALL Layer 2 original art in one connected 5x5 proof.
 * Review-only: 8 previously certified originals + 7 newer candidates
 * + 3 new candidate PNG/WebP pairs. No V2 production renderer changes.
 */
(function(root,factory){
 const node=typeof module!=='undefined'&&!!module.exports;
 const api=factory(
  node?require('../../tile-topology.js'):root.YangzhouTileTopology,
  node?require('./base-geometry.js'):root.YangzhouV3Geometry,
  node?require('./layer2-placements.js'):root.YangzhouV3Layer2,
  node?require('./wall-geometry.js'):root.YangzhouV3WallGeometry,
  node?require('./seven-candidates.js'):root.YangzhouV3SevenCandidates
 );
 if(node)module.exports=api;
 if(root)root.YangzhouV3AllLayer2Review=api;
})(typeof window!=='undefined'?window:null,function(topology,geo,layer2,walls,seven){
'use strict';
if(!topology||!geo||!layer2||!walls||!seven)throw Error('V3 original geometry, placement, wall and seven-asset modules must load');
const SIZE=220,GRID=5;
const NEW=Object.freeze({
 'plum-blossom-tree-01':Object.freeze({width:48,height:58,drawWidth:48,drawHeight:48,trunkRadius:6,trunkOffsetY:21,mode:'trunk',signature:'LLLL'}),
 'courtyard-entrance-step-01':Object.freeze({width:20,height:10,drawWidth:20,drawHeight:20/3,mode:'walkable-threshold',signature:'LLLL'}),
 'south-bank-landing-01':Object.freeze({width:95,height:47,drawWidth:94,drawHeight:47,mode:'canal-south',signature:'LWLW'})
});
const CERTIFIED_IDS=Object.freeze(['courtyard-hall-01','willow-tree-01','garden-rockery-01','garden-pavilion-01',
 'bamboo-grove-01','garden-rockery-02','courtyard-wing-01','waterside-landing-01']);
const SEVEN_IDS=Object.freeze([...seven.ID_LIST]);
const THREE_IDS=Object.freeze(Object.keys(NEW));
const ALL_IDS=Object.freeze([...CERTIFIED_IDS,...SEVEN_IDS,...THREE_IDS]);
const LAYOUT=Object.freeze([
 ['LLLL','LLLL','WLWL','LLLL','LLLL'],
 ['LSLS','LSLS','WSWS','LSLS','LSLS'],
 ['LLLL','LLLL','WLWL','LLLL','LLLL'],
 ['LWLW','LWLW','WWLW','LWLW','LWLW'],
 ['LLLL','LLLL','LLLL','LLLL','LLLL']
].map(row=>Object.freeze(row)));
const ROLES=Object.freeze([
 ['hall-step','courtyard-wing','vertical-canal','corridor','rockery-one'],
 ['shopfront','tea-house','bridge','market-garden','street-rockery'],
 ['plum-garden','small-residence','vertical-canal','pavilion-garden','bamboo-garden'],
 ['landing-new','landing-original','canal-junction','south-bank-landing','waterside-pavilion'],
 ['willow-garden','rockery-one','hall-step','rockery-two','open-garden']
].map(row=>Object.freeze(row)));
const P=(id,x,y)=>Object.freeze({id,x,y});
const OBJECTS=Object.freeze({
 'hall-step':Object.freeze([P('courtyard-hall-01',110,109),P('courtyard-entrance-step-01',110,137)]),
 'courtyard-wing':Object.freeze([P('courtyard-wing-01',110,110)]),
 corridor:Object.freeze([P('covered-garden-corridor-01',103,111)]),
 'rockery-one':Object.freeze([P('garden-rockery-01',110,110)]),
 shopfront:Object.freeze([P('street-shopfront-01',110,52)]),
 'tea-house':Object.freeze([P('tea-house-01',110,52)]),
 bridge:Object.freeze([P('stone-bridge-parapets-01',110,110)]),
 'market-garden':Object.freeze([P('street-shopfront-01',110,52),P('willow-tree-01',180,42)]),
 'street-rockery':Object.freeze([P('garden-rockery-02',40,40)]),
 'plum-garden':Object.freeze([P('plum-blossom-tree-01',110,112)]),
 'small-residence':Object.freeze([P('small-residence-01',110,107)]),
 'pavilion-garden':Object.freeze([P('garden-pavilion-01',110,103)]),
 'bamboo-garden':Object.freeze([P('bamboo-grove-01',66,93),P('garden-rockery-02',158,165)]),
 'landing-new':Object.freeze([P('waterside-landing-02',110,36)]),
 'landing-original':Object.freeze([P('waterside-landing-01',110,53)]),
 'south-bank-landing':Object.freeze([P('south-bank-landing-01',110,183.5)]),
 'waterside-pavilion':Object.freeze([P('waterside-pavilion-01',110,35)]),
 'willow-garden':Object.freeze([P('willow-tree-01',110,109)]),
 'rockery-two':Object.freeze([P('garden-rockery-02',110,110)])
});
function definition(id){
 if(NEW[id])return NEW[id];
 if(seven.ASSETS[id])return seven.ASSETS[id];
 return layer2.COMPONENTS[id]||null;
}
function category(id){
 return CERTIFIED_IDS.includes(id)?'certified':SEVEN_IDS.includes(id)?'seven':THREE_IDS.includes(id)?'three':null;
}
function tiles(){
 const out=[];
 for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){
  const signature=LAYOUT[y][x];
  out.push(Object.freeze({x,y,seed:1+x+y*GRID,edges:Object.freeze(signature.split('')),role:ROLES[y][x]}));
 }
 const issues=topology.validateBoard(out);
 if(issues.length)throw Error('5x5 edge-port discontinuity: '+issues.join('; '));
 return Object.freeze(out);
}
function bounds(p){
 const spec=definition(p.id);
 if(!spec)throw Error('Unknown review asset '+p.id);
 return Object.freeze({left:p.x-spec.width/2,right:p.x+spec.width/2,
  top:p.y-spec.height/2,bottom:p.y+spec.height/2});
}
function isSafe(tile,p){
 const spec=definition(p.id),kind=category(p.id);
 if(!spec||!kind)return false;
 const bound=bounds(p);
 if(bound.left<10||bound.right>210||bound.top<10||bound.bottom>210)return false;
 if(kind==='seven'){
  const pseudoRole=p.id==='small-residence-01'?'small-residence':tile.role;
  return seven.isSafe({...tile,role:pseudoRole},p);
 }
 if(kind==='certified')return layer2.validateDetail(tile,p);
 const signature=tile.edges.join('');
 if(signature!==spec.signature)return false;
 const g=geo.compile(tile.edges);
 if(spec.mode==='canal-south'){
  // Genuine south shoreline: y=66..154 is unmodified water. 6-unit
  // separation from water; all 95x47 structure stays on the south land.
  return p.x===110&&p.y===183.5&&bound.top===160&&bound.bottom===207&&
   g.paths.length===1&&g.paths[0].type==='W'&&g.paths[0].kind==='line'&&g.paths[0].width===88;
 }
 if(g.paths.length)return false;
 if(spec.mode==='walkable-threshold'){
  // Contact with Hall south edge at y=132.5 is intentional. A step is
  // traversable and bridges the centred 12-unit walkway, not a wall.
  return tile.role==='hall-step'&&p.x===110&&p.y===137&&
   !!OBJECTS[tile.role].find(a=>a.id==='courtyard-hall-01'&&a.x===110&&a.y===109);
 }
 if(spec.mode==='trunk'){
  const ground=[p.x,p.y+spec.trunkOffsetY];
  if(ground[0]-spec.trunkRadius<10||ground[0]+spec.trunkRadius>210||
     ground[1]-spec.trunkRadius<10||ground[1]+spec.trunkRadius>210)return false;
  return true;
 }
 return false;
}
function modelFor(role){
 if(role==='hall-step')return walls.templates.rectangle;
 if(role==='small-residence')return seven.modelFor('small-residence');
 return null;
}
function conflict(a,b){
 if(a.id==='courtyard-entrance-step-01'||b.id==='courtyard-entrance-step-01'){
  // Contact with authored Hall threshold is allowed, otherwise not.
  return !(['courtyard-hall-01','courtyard-entrance-step-01'].includes(a.id)&&
           ['courtyard-hall-01','courtyard-entrance-step-01'].includes(b.id));
 }
 const x=definition(a.id),y=definition(b.id);
 return Math.abs(a.x-b.x)<(x.width+y.width)/2+6&&
        Math.abs(a.y-b.y)<(x.height+y.height)/2+6;
}
function plan(){
 const out=[],seen=new Set();
 for(const tile of tiles()){
  const art=OBJECTS[tile.role]||[];
  for(let i=0;i<art.length;i++){
   const p=art[i];if(!isSafe(tile,p))throw Error('Illegal '+p.id+' at '+tile.x+','+tile.y);
   for(let j=0;j<i;j++)if(conflict(art[j],p))
     throw Error('Colliding assets '+art[j].id+' and '+p.id+' at '+tile.x+','+tile.y);
   seen.add(p.id);
  }
  const model=modelFor(tile.role);
  const audit=model?walls.audit(model,tile):null;
  if(audit&&!audit.valid)throw Error('Courtyard wall clearance failed at '+tile.x+','+tile.y+': '+audit.issues.join(', '));
  out.push(Object.freeze({tile,art:Object.freeze([...art]),model,audit}));
 }
 const missing=ALL_IDS.filter(id=>!seen.has(id));
 if(missing.length)throw Error('Whole-Layer-2 proof is missing assets: '+missing.join(', '));
 return Object.freeze({tiles:Object.freeze(out),missing:Object.freeze(missing),
  totalUnique:seen.size,certified:CERTIFIED_IDS.length,newer:SEVEN_IDS.length,latest:THREE_IDS.length});
}
function draw(ctx,entry,images,{showCertified=true,showSeven=true,showThree=true}={}){
 const {tile,art}=entry;let count=0;
 for(const p of art){
  const cat=category(p.id);
  if((cat==='certified'&&!showCertified)||(cat==='seven'&&!showSeven)||(cat==='three'&&!showThree))continue;
  const im=images?.[p.id],d=definition(p.id);if(!im)continue;
  if(cat==='seven'){count+=seven.draw(ctx,{tile,art:[p]},images);continue;}
  const dw=d.drawWidth||d.width,dh=d.drawHeight||d.height;
  ctx.drawImage(im,tile.x*SIZE+p.x-dw/2,tile.y*SIZE+p.y-dh/2,dw,dh);
  count++;
 }
 return count;
}
return Object.freeze({SIZE,GRID,LAYOUT,ROLES,OBJECTS,NEW,CERTIFIED_IDS,SEVEN_IDS,THREE_IDS,
 ALL_IDS,category,definition,tiles,bounds,isSafe,modelFor,plan,draw});
});
