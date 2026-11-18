/* Yangzhou V3: complete 24 original-painted Layer 3 detail candidates.
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
 'reed-cluster-01':Object.freeze({width:22,height:19,family:'waterfront'}),
 'moss-clump-02':Object.freeze({width:20,height:8,family:'garden'}),
 'moss-clump-03':Object.freeze({width:20,height:10,family:'garden'}),
 'fallen-willow-leaves-02':Object.freeze({width:20,height:6,family:'willow'}),
 'wildflower-cluster-02':Object.freeze({width:17,height:14,family:'garden'}),
 'small-stones-01':Object.freeze({width:21,height:11,family:'garden'}),
 'small-pebbles-01':Object.freeze({width:20,height:6,family:'garden'}),
 'ceramic-flower-pot-02':Object.freeze({width:16,height:22,family:'courtyard'}),
 'wooden-bucket-01':Object.freeze({width:16,height:20,family:'courtyard'}),
 'bamboo-planter-01':Object.freeze({width:25,height:18,family:'courtyard'}),
 'stacked-wicker-baskets-01':Object.freeze({width:23,height:20,family:'market'}),
 'wooden-goods-box-01':Object.freeze({width:21,height:17,family:'market'}),
 'rolled-woven-mat-01':Object.freeze({width:18,height:10,family:'market'}),
 'tea-produce-containers-01':Object.freeze({width:23,height:18,family:'market'}),
 'reed-cluster-02':Object.freeze({width:21,height:22,family:'waterfront'}),
 'floating-lotus-leaves-01':Object.freeze({width:22,height:12,family:'water'}),
 'stone-mooring-point-01':Object.freeze({width:14,height:18,family:'waterfront'})
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
/* Additional carefully chosen first-choice positions for the second 16.
 * The original eight detail recipes remain untouched; deterministic geometry
 * search is used only when a new secondary detail conflicts locally.
 */
const EXTRA=Object.freeze({
 'hall-step':Object.freeze([]),
 'courtyard-wing':Object.freeze([]),
 'vertical-canal':Object.freeze([P('floating-lotus-leaves-01',110,70),P('reed-cluster-02',181,177)]),
 corridor:Object.freeze([P('moss-clump-02',146,185),P('small-pebbles-01',82,172)]),
 'rockery-one':Object.freeze([P('small-stones-01',109,182),P('moss-clump-03',165,185)]),
 shopfront:Object.freeze([P('wooden-goods-box-01',102,187),P('rolled-woven-mat-01',183,181)]),
 'tea-house':Object.freeze([P('stacked-wicker-baskets-01',116,181),P('tea-produce-containers-01',68,186),P('wooden-bucket-01',189,178)]),
 'market-garden':Object.freeze([P('tea-produce-containers-01',109,178),P('rolled-woven-mat-01',183,181)]),
 'street-rockery':Object.freeze([P('small-stones-01',108,176),P('small-pebbles-01',35,182)]),
 'plum-garden':Object.freeze([P('wildflower-cluster-02',117,184),P('ceramic-flower-pot-02',182,184)]),
 'small-residence':Object.freeze([]),
 'pavilion-garden':Object.freeze([P('bamboo-planter-01',109,185)]),
 'bamboo-garden':Object.freeze([P('moss-clump-03',193,180),P('small-stones-01',40,188)]),
 'landing-new':Object.freeze([P('stone-mooring-point-01',42,185),P('reed-cluster-02',183,183)]),
 'landing-original':Object.freeze([P('reed-cluster-02',44,180)]),
 'canal-junction':Object.freeze([P('small-pebbles-01',35,179)]),
 'south-bank-landing':Object.freeze([P('stone-mooring-point-01',182,185)]),
 'waterside-pavilion':Object.freeze([P('reed-cluster-02',41,181)]),
 'willow-garden':Object.freeze([P('fallen-willow-leaves-02',102,168),P('small-pebbles-01',180,182)]),
 'rockery-two':Object.freeze([P('moss-clump-03',107,187)]),
 'open-garden':Object.freeze([P('wildflower-cluster-02',111,185),P('moss-clump-02',182,185)])
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
 const routes=geometry.compile(tile.edges).paths;
 if(spec.family==='water'){
  // Lotus artwork must be contained entirely inside a genuine canal, never
  // behind the bridge or on joining roads. Do not move the underlying water.
  if(tile.role==='bridge')return false;
  const eligible=routes.some(r=>r.type==='W' &&
    distRoute(p,r)+radius+4<=r.width/2);
  if(!eligible)return false;
  if(routes.some(r=>r.type==='S'&&distRoute(p,r)<r.width/2+radius+3))return false;
 }else{
  for(const r of routes)if(distRoute(p,r)<r.width/2+(r.type==='W'?5:4)+radius)return false;
 }
 // Keep courtyard threshold corridors accessible as walkways.
 if(entry.model&&p.y>130&&Math.abs(p.x-110)<radius+7)return false;
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
  const role=entry.tile.role,oldRecipe=RECIPE[role]||[];
  const recipe=[...oldRecipe,...(EXTRA[role]||[])];
  const placements=[];
  for(let index=0;index<recipe.length;index++){
   const p0=recipe[index],spec=ASSETS[p0.id],h=hash(entry.tile.seed,p0.id);
   let x=p0.x,y=p0.y;
   if(index<oldRecipe.length){
    // Preserve 100% of the previously reviewed first-eight placements.
    if(role==='vertical-canal')x=entry.tile.y===0?41:179;
    else{x+=(h%5)-2;y+=(Math.floor(h/7)%5)-2;}
   }else if(role==='vertical-canal'&&spec.family==='waterfront'){
    x=entry.tile.y===0?179:41; // the bank opposite the first reed
   }else{x+=(h%5)-2;y+=(Math.floor(h/7)%5)-2;}
   const legal=(q)=>safe(entry,q,geometry,board,walls)&&
    !placements.some(a=>overlap(q,spec.width,spec.height,a,ASSETS[a.id].width,ASSETS[a.id].height,3));
   let p=Object.freeze({id:p0.id,x,y});
   if(!legal(p)&&index>=oldRecipe.length){
    // Search only within the same tile; near the authored position first.
    // Sorting is deterministic (no Math.random and no animation-dependent drift).
    let nearest=null,best=Infinity;
    const xs=spec.family==='water'?[110,99,121,88,132]:[32,45,59,74,88,102,117,132,146,161,176,189];
    const ys=spec.family==='water'?[50,70,91,121,146,168]:[144,155,167,178,190,198,122,100,79];
    for(const xx of xs)for(const yy of ys){
     const q=Object.freeze({id:p0.id,x:xx,y:yy});
     if(!legal(q))continue;
     const score=(xx-x)**2+(yy-y)**2+(hash(entry.tile.seed,xx+':'+yy+p0.id)%23)/30;
     if(score<best){best=score;nearest=q;}
    }
    if(nearest)p=nearest;
   }
   if(!legal(p)){
    // Under no circumstances force a detail onto a road, wall, building or
    // other asset. Secondary decorations are optional when a tile is full.
    if(index>=oldRecipe.length)continue;
    throw Error('Existing certified review placement moved: '+p.id+' at '+
      entry.tile.x+','+entry.tile.y+' ('+x+','+y+') role '+role);
   }
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
return Object.freeze({SIZE,ASSETS,IDS,RECIPE,EXTRA,hash,distRoute,safe,plan,draw});
});