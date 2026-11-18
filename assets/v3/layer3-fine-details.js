/* Yangzhou V3: first eight original-painted Layer 3 detail candidates.
 * Review-only. No Layer 1, Layer 2 or playable V2 renderer changes.
 * Positions are tile-owned, reproducible and checked against route/solid masks.
 */
(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.YangzhouV3FineDetails=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const SIZE=220;
const ASSETS=Object.freeze({
 'moss-clump-01':Object.freeze({width:17,height:9,family:'garden'}),
 'fallen-willow-leaves-01':Object.freeze({width:18,height:7,family:'willow'}),
 'plum-petals-01':Object.freeze({width:18,height:8,family:'plum'}),
 'wildflower-cluster-01':Object.freeze({width:16,height:13,family:'garden'}),
 'ceramic-flower-pot-01':Object.freeze({width:15,height:20,family:'courtyard'}),
 'earthenware-water-jar-01':Object.freeze({width:17,height:18,family:'courtyard'}),
 'woven-basket-01':Object.freeze({width:16,height:15,family:'market'}),
 'reed-cluster-01':Object.freeze({width:22,height:19,family:'waterfront'})
});
const IDS=Object.freeze(Object.keys(ASSETS));
const P=(id,x,y)=>Object.freeze({id,x,y});
const RECIPE=Object.freeze({
 'hall-step':Object.freeze([P('ceramic-flower-pot-01',67,155),P('earthenware-water-jar-01',149,156)]),
 'courtyard-wing':Object.freeze([P('ceramic-flower-pot-01',60,170),P('earthenware-water-jar-01',165,169)]),
 'vertical-canal':Object.freeze([P('reed-cluster-01',179,178)]),
 corridor:Object.freeze([P('moss-clump-01',53,173),P('wildflower-cluster-01',170,169)]),
 'rockery-one':Object.freeze([P('moss-clump-01',60,172),P('wildflower-cluster-01',164,172)]),
 shopfront:Object.freeze([P('woven-basket-01',164,171),P('moss-clump-01',50,171)]),
 'tea-house':Object.freeze([P('woven-basket-01',165,171),P('moss-clump-01',55,176)]),
 bridge:Object.freeze([]),
 'market-garden':Object.freeze([P('woven-basket-01',164,172),P('wildflower-cluster-01',54,170)]),
 'street-rockery':Object.freeze([P('moss-clump-01',156,169),P('wildflower-cluster-01',66,171)]),
 'plum-garden':Object.freeze([P('plum-petals-01',150,166),P('moss-clump-01',60,166)]),
 'small-residence':Object.freeze([P('ceramic-flower-pot-01',69,152),P('wildflower-cluster-01',149,155)]),
 'pavilion-garden':Object.freeze([P('wildflower-cluster-01',168,163),P('moss-clump-01',57,164)]),
 'bamboo-garden':Object.freeze([P('wildflower-cluster-01',56,164),P('moss-clump-01',105,190)]),
 'landing-new':Object.freeze([P('reed-cluster-01',183,180)]),
 'landing-original':Object.freeze([P('reed-cluster-01',182,184)]),
 'canal-junction':Object.freeze([P('reed-cluster-01',185,181)]),
 'south-bank-landing':Object.freeze([P('reed-cluster-01',36,185)]),
 'waterside-pavilion':Object.freeze([P('reed-cluster-01',181,181)]),
 'willow-garden':Object.freeze([P('fallen-willow-leaves-01',152,165),P('moss-clump-01',64,170)]),
 'rockery-two':Object.freeze([P('moss-clump-01',62,165),P('wildflower-cluster-01',162,171)]),
 'open-garden':Object.freeze([P('moss-clump-01',66,157),P('wildflower-cluster-01',159,165)])
});
function hash(seed,name){
 let h=(seed|0)^2166136261;
 for(const c of name){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
}
function distSegment(x,y,x0,y0,x1,y1){
 const a=x1-x0,b=y1-y0,len=a*a+b*b;
 const t=len?Math.max(0,Math.min(1,((x-x0)*a+(y-y0)*b)/len)):0;
 return Math.hypot(x-(x0+t*a),y-(y0+t*b));
}
function distRoute(p,route){
 if(route.kind==='line')return distSegment(p.x,p.y,...route.start,...route.end);
 if(route.kind==='quadratic'){
  let old=route.start,best=Infinity;
  for(let j=1;j<=80;j++){
   const t=j/80,u=1-t,now=[
    u*u*route.start[0]+2*u*t*route.control[0]+t*t*route.end[0],
    u*u*route.start[1]+2*u*t*route.control[1]+t*t*route.end[1]];
   best=Math.min(best,distSegment(p.x,p.y,...old,...now));old=now;
  }
  return best;
 }
 throw Error('Unsupported V3 route '+route.kind);
}
function overlap(a,aw,ah,b,bw,bh,pad=4){
 return Math.abs(a.x-b.x)<(aw+bw)/2+pad && Math.abs(a.y-b.y)<(ah+bh)/2+pad;
}
function safe(entry,p,geometry,board,walls){
 const spec=ASSETS[p.id],tile=entry.tile;
 if(!spec||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 if(p.x-spec.width/2<12||p.x+spec.width/2>208||
    p.y-spec.height/2<12||p.y+spec.height/2>208)return false;
 const radius=Math.hypot(spec.width,spec.height)/2;
 for(const r of geometry.compile(tile.edges).paths){
  if(distRoute(p,r)<r.width/2+(r.type==='W'?5:4)+radius)return false;
 }
 for(const object of entry.art){
  const d=board.definition(object.id);
  if(!d)return false;
  if(overlap(p,spec.width,spec.height,object,d.width,d.height,5))return false;
 }
 if(entry.model&&walls){
  const model=walls.compile(entry.model);
  // A five-point footprint check also catches a prop centred in a real moon-gate void.
  const samples=[[p.x,p.y],[p.x-spec.width/2,p.y-spec.height/2],
   [p.x+spec.width/2,p.y-spec.height/2],[p.x-spec.width/2,p.y+spec.height/2],
   [p.x+spec.width/2,p.y+spec.height/2]];
  if(samples.some(v=>walls.isSolid(model,v)))return false;
 }
 return true;
}
function plan(basePlan,geometry,board,walls){
 if(!basePlan||!Array.isArray(basePlan.tiles)||basePlan.tiles.length!==25)
  throw Error('Layer 3 requires the existing connected 25-tile Layer 2 review');
 const tiles=[],seen=new Set(),totals={};
 for(const entry of basePlan.tiles){
  const role=entry.tile.role,recipe=RECIPE[role]||[];
  const placements=[];
  for(const p0 of recipe){
   let x=p0.x,y=p0.y;
   // Centreline-safe, seed-stable 2-unit nudge; no per-frame randomness.
   const h=hash(entry.tile.seed,p0.id);
   if(role==='vertical-canal')x=entry.tile.y===0?41:179; // authored west/east bank variation
   else {x+=(h%5)-2;y+=(Math.floor(h/7)%5)-2;}
   const p=Object.freeze({id:p0.id,x,y});
   if(!safe(entry,p,geometry,board,walls))
    throw Error('Unsafe fine detail '+p.id+' at '+entry.tile.x+','+entry.tile.y+
     ' ('+x+','+y+') role '+role);
   const d=ASSETS[p.id];
   if(placements.some(a=>overlap(p,d.width,d.height,a,ASSETS[a.id].width,ASSETS[a.id].height,3)))
    throw Error('Fine-detail overlap in '+role);
   placements.push(p);seen.add(p.id);totals[p.id]=(totals[p.id]||0)+1;
  }
  tiles.push(Object.freeze({tile:entry.tile,art:Object.freeze(placements)}));
 }
 const missing=IDS.filter(id=>!seen.has(id));
 if(missing.length)throw Error('The review scene is missing Layer 3 art: '+missing.join(', '));
 return Object.freeze({tiles:Object.freeze(tiles),used:Object.freeze([...seen]),
  counts:Object.freeze(totals),totalPlacements:tiles.reduce((sum,x)=>sum+x.art.length,0)});
}
function draw(ctx,finePlan,images,{enabled=true,highlight='',showGuides=false}={}){
 if(!enabled)return 0;
 let count=0;
 for(const entry of finePlan.tiles)for(const p of entry.art){
  const image=images[p.id],spec=ASSETS[p.id];if(!image)continue;
  const x=entry.tile.x*SIZE+p.x-spec.width/2;
  const y=entry.tile.y*SIZE+p.y-spec.height/2;
  ctx.drawImage(image,x,y,spec.width,spec.height);count++;
  if(showGuides&&(!highlight||highlight===p.id)){
   ctx.save();ctx.strokeStyle='#ae5835';ctx.lineWidth=.65;ctx.setLineDash([2,2]);
   ctx.strokeRect(x,y,spec.width,spec.height);ctx.restore();
  }
 }
 return count;
}
return Object.freeze({SIZE,ASSETS,IDS,RECIPE,hash,distRoute,safe,plan,draw});
});