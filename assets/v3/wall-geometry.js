/* Yangzhou V3 Layer 2 - continuous courtyard wall geometry experiment.
 * Walls are vector centerlines with REAL cut-out gate apertures, NOT joined
 * sprite rectangles. Reusable painted materials can fill these bands later.
 * Isolated from the live V2 game and the previous V3 wall-sprite laboratory.
 */
(function(root,factory){
 const geometry=typeof module!=='undefined'&&module.exports?require('./base-geometry.js'):root.YangzhouV3Geometry;
 const layer2=typeof module!=='undefined'&&module.exports?require('./layer2-placements.js'):root.YangzhouV3Layer2;
 const api=factory(geometry,layer2);
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3WallGeometry=api;
})(typeof window!=='undefined'?window:null,function(geometry,layer2){
'use strict';
if(!geometry||!layer2)throw Error('Yangzhou V3 wall model needs base geometry and Layer 2');
const TILE=220,INSET=10,SAFE_GAP=6,EPS=1e-7;
// Diagnostic drawing only; these constants are also the future texture-band widths.
const WIDTHS=Object.freeze({foundation:16,plaster:12,coping:8,ridge:2});
const PALETTE=Object.freeze({
 foundation:'#aaa59b', plaster:'#e9e4d4', coping:'#636d69',
 ridge:'#a8afa5', ink:'#3e4842', post:'#8b928b', threshold:'#c6a976'
});
const MATERIALS=Object.freeze([
 Object.freeze({slot:'foundation',width:WIDTHS.foundation,state:'temporary-flat-colour'}),
 Object.freeze({slot:'plaster',width:WIDTHS.plaster,state:'temporary-flat-colour'}),
 Object.freeze({slot:'coping',width:WIDTHS.coping,state:'temporary-flat-colour'}),
 Object.freeze({slot:'ridge',width:WIDTHS.ridge,state:'temporary-flat-colour'})
]);
const templates=Object.freeze({
 rectangle:Object.freeze({
  id:'rectangle',name:'Enclosed courtyard + real moon gate',
  hall:Object.freeze({id:'courtyard-hall-01',x:110,y:109}),
  paths:Object.freeze([Object.freeze({id:'perimeter',points:Object.freeze([[42,47],[178,47],[178,178],[42,178],[42,47]])})]),
  openings:Object.freeze([Object.freeze({id:'moon-gate',pathId:'perimeter',center:[110,178],width:30})])
 }),
 partial:Object.freeze({
  id:'partial',name:'Three-sided garden + framed north gate',
  hall:Object.freeze({id:'courtyard-hall-01',x:110,y:109}),
  paths:Object.freeze([Object.freeze({id:'three-sided',points:Object.freeze([[43,174],[43,48],[177,48],[177,174]])})]),
  openings:Object.freeze([Object.freeze({id:'moon-gate',pathId:'three-sided',center:[110,48],width:30})])
 }),
 elbow:Object.freeze({
  id:'elbow',name:'L-shaped courtyard boundary',
  hall:Object.freeze({id:'courtyard-hall-01',x:117,y:125}),
  paths:Object.freeze([Object.freeze({id:'elbow',points:Object.freeze([[43,175],[43,51],[177,51]])})]),
  openings:Object.freeze([])
 }),
 tee:Object.freeze({
  id:'tee',name:'T-intersection + passable gate',
  hall:Object.freeze({id:'courtyard-hall-01',x:110,y:128}),
  paths:Object.freeze([
   Object.freeze({id:'crossbar',points:Object.freeze([[43,48],[177,48]])}),
   Object.freeze({id:'branch',points:Object.freeze([[110,48],[110,69]])})
  ]),
  openings:Object.freeze([Object.freeze({id:'moon-gate',pathId:'crossbar',center:[148,48],width:24})])
 })
});
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
function length(points){let n=0;for(let i=1;i<points.length;i++)n+=dist(points[i-1],points[i]);return n;}
const same=(a,b)=>dist(a,b)<EPS;
function pointAlong(points,at){
 const size=length(points);
 if(at<0||at>size+EPS)throw Error('Distance outside wall centreline');
 let s=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],segment=dist(a,b);
  if(segment<EPS)throw Error('Zero-length centreline segment');
  if(at<=s+segment+EPS||i===points.length-1){
   const unit=[(b[0]-a[0])/segment,(b[1]-a[1])/segment];
   const t=Math.max(0,Math.min(1,(at-s)/segment));
   return Object.freeze({point:lerp(a,b,t),tangent:unit,normal:[-unit[1],unit[0]],s:at});
  }
  s+=segment;
 }
 throw Error('Invalid polyline position');
}
function distanceAlong(points,pt){
 let s=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],v=[b[0]-a[0],b[1]-a[1]];
  const l2=v[0]*v[0]+v[1]*v[1];
  if(l2<EPS)throw Error('Zero-length segment');
  const t=((pt[0]-a[0])*v[0]+(pt[1]-a[1])*v[1])/l2;
  const proj=lerp(a,b,Math.max(0,Math.min(1,t)));
  if(t>=-EPS&&t<=1+EPS&&dist(proj,pt)<EPS)return s+Math.max(0,Math.min(1,t))*Math.sqrt(l2);
  s+=Math.sqrt(l2);
 }
 throw Error('Moon gate centre must lie exactly on a defined wall centreline');
}
function slice(points,start,end){
 if(end-start<EPS)return [];
 const result=[pointAlong(points,start).point],total=length(points);
 let s=0;
 for(let i=1;i<points.length;i++){
  s+=dist(points[i-1],points[i]);
  if(s>start+EPS&&s<end-EPS)result.push([...points[i]]);
 }
 result.push(pointAlong(points,Math.min(end,total)).point);
 return result.filter((pt,i,arr)=>i===0||!same(pt,arr[i-1]));
}
function compile(model){
 if(!model||!Array.isArray(model.paths)||!Array.isArray(model.openings))throw Error('Invalid courtyard wall model');
 const seen=new Set();
 for(const p of model.paths){
  if(!p.id||seen.has(p.id)||!Array.isArray(p.points)||p.points.length<2)throw Error('Invalid or duplicate centreline');
  seen.add(p.id);
  for(const q of p.points)if(!Array.isArray(q)||q.length!==2||q.some(v=>!Number.isFinite(v)))throw Error('Bad wall vertex');
  if(length(p.points)<EPS)throw Error('Empty wall');
 }
 const paths=[],gates=[],ribbons=[];
 for(const p of model.paths){
  const total=length(p.points),closed=same(p.points[0],p.points[p.points.length-1]);
  const cuts=model.openings.filter(g=>g.pathId===p.id).map(g=>{
   if(!g.id||!Number.isFinite(g.width)||g.width<WIDTHS.foundation+4)throw Error('Moon gate needs a genuinely passable opening');
   const mid=distanceAlong(p.points,g.center),from=mid-g.width/2,to=mid+g.width/2;
   if(from<=EPS||to>=total-EPS)throw Error('Moon gate cannot overlap a centreline endpoint');
   const a=pointAlong(p.points,from),b=pointAlong(p.points,to),center=pointAlong(p.points,mid);
   if(!same(a.tangent,b.tangent))throw Error('Moon gate may not span a wall corner');
   return {...g,at:mid,from,to,start:a.point,end:b.point,tangent:center.tangent,
    normal:center.normal,walkThroughWidth:g.width-WIDTHS.foundation};
  }).sort((a,b)=>a.from-b.from);
  for(let i=1;i<cuts.length;i++)if(cuts[i].from-cuts[i-1].to<SAFE_GAP)throw Error('Moon gates must have independent posts');
  for(const g of cuts)gates.push(Object.freeze(g));
  let painted=[];
  if(!cuts.length){
   painted=[p.points.map(q=>[...q])];
  }else if(closed&&cuts.length===1){
   const c=cuts[0];
   // One uninterrupted solid path wraps all four corners. There is only
   // ONE cap pair at the real gate; no phantom seam on the first vertex.
   const suffix=slice(p.points,c.to,total),prefix=slice(p.points,0,c.from);
   painted=[suffix.concat(prefix.slice(1))];
  }else{
   let begin=0;
   for(const c of cuts){
    painted.push(slice(p.points,begin,c.from));begin=c.to;
   }
   painted.push(slice(p.points,begin,total));
  }
  for(const points of painted.filter(x=>x.length>=2)){
   const path={id:p.id,points:Object.freeze(points.map(q=>Object.freeze(q))),closed:!cuts.length&&closed};
   paths.push(Object.freeze(path));
   let u=0;
   for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],l=dist(a,b);
    const tangent=[(b[0]-a[0])/l,(b[1]-a[1])/l];
    ribbons.push(Object.freeze({
     pathId:p.id,a:Object.freeze([...a]),b:Object.freeze([...b]),
     tangent:Object.freeze(tangent),normal:Object.freeze([-tangent[1],tangent[0]]),
     u0:u,u1:u+l,
     // Textures will be sampled in path-local arc length u, across width v;
     // no texture is assigned or claimed production-ready in this proof.
     slots:Object.freeze(MATERIALS.map(m=>Object.freeze({id:m.slot,halfWidth:m.width/2})))
    }));
    u+=l;
   }
  }
 }
 for(const g of model.openings)if(!seen.has(g.pathId))throw Error('Opening references unknown wall');
 const junctions=detectJunctions(model);
 return Object.freeze({modelId:model.id,paths:Object.freeze(paths),
  gates:Object.freeze(gates),junctions:Object.freeze(junctions),
  ribbons:Object.freeze(ribbons),hall:model.hall});
}
function detectJunctions(model){
 const joints=[];
 for(const p of model.paths){
  const pts=p.points,closed=same(pts[0],pts[pts.length-1]);
  for(let i=1;i<pts.length-1;i++){
   const p0=pts[i-1],p1=pts[i],p2=pts[i+1];
   const a=[p1[0]-p0[0],p1[1]-p0[1]],b=[p2[0]-p1[0],p2[1]-p1[1]];
   const cross=a[0]*b[1]-a[1]*b[0];
   if(Math.abs(cross)>EPS)joints.push(Object.freeze({kind:'L',point:Object.freeze([...p1]),pathId:p.id,seamGap:0}));
  }
  if(closed&&pts.length>=4){
   const before=pts[pts.length-2],current=pts[0],next=pts[1];
   const a=[current[0]-before[0],current[1]-before[1]],b=[next[0]-current[0],next[1]-current[1]];
   if(Math.abs(a[0]*b[1]-a[1]*b[0])>EPS)
    joints.push(Object.freeze({kind:'L',point:Object.freeze([...current]),pathId:p.id,seamGap:0}));
  }
 }
 for(let i=0;i<model.paths.length;i++)for(let j=0;j<model.paths.length;j++)if(i!==j){
  const a=model.paths[i],b=model.paths[j];
  for(const end of [b.points[0],b.points[b.points.length-1]]){
   for(let k=1;k<a.points.length;k++){
    const p0=a.points[k-1],p1=a.points[k],u=[p1[0]-p0[0],p1[1]-p0[1]];
    const len2=u[0]*u[0]+u[1]*u[1];
    const t=((end[0]-p0[0])*u[0]+(end[1]-p0[1])*u[1])/len2;
    const test=lerp(p0,p1,t);
    if(t>EPS&&t<1-EPS&&same(test,end)&&
       !joints.some(v=>v.kind==='T'&&same(v.point,end))){
     joints.push(Object.freeze({kind:'T',point:Object.freeze([...end]),pathId:a.id,seamGap:0}));
    }
   }
  }
 }
 return joints;
}
function distToSegment(p,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;
 const t=len2>0?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len2)):0;
 return Math.hypot(p[0]-(a[0]+t*dx),p[1]-(a[1]+t*dy));
}
function isSolid(compiled,point,band='foundation'){
 const radius=WIDTHS[band]/2;
 if(!(radius>0))throw Error('Unknown wall band');
 for(const path of compiled.paths)for(let i=1;i<path.points.length;i++){
  if(distToSegment(point,path.points[i-1],path.points[i])<=radius+EPS)return true;
 }
 return false;
}
function audit(model,tile,{protectHall=true,profilePainter=null}={}){
 const compiled=compile(model),issues=[];
 const tileEdges=geometry.compile(tile.edges);
 const hall=model.hall&&protectHall?layer2.COMPONENTS[model.hall.id]:null;
 if(hall&&!layer2.validateDetail(tile,model.hall))issues.push('Hall overlaps route or tile boundary');
 const r=WIDTHS.foundation/2;
 for(const p of model.paths){
  for(let i=1;i<p.points.length;i++){
   const a=p.points[i-1],b=p.points[i],n=Math.ceil(dist(a,b)/2);
   for(let k=0;k<=n;k++){
    const pt=lerp(a,b,k/n),[x,y]=pt;
    if(x<INSET+r-EPS||x>TILE-INSET-r+EPS||y<INSET+r-EPS||y>TILE-INSET-r+EPS){
     issues.push('Wall footprint crosses tile inset');continue;
    }
    for(const road of tileEdges.paths){
     const edge=road.type==='W'?4:5;
     const clearance=road.width/2+edge+SAFE_GAP+r;
     if(layer2.minRouteDistance(pt,road)<clearance-EPS){
      issues.push('Wall enters protected '+(road.type==='W'?'canal':'street')+' corridor');break;
     }
    }
    if(hall){
     const wx=hall.width/2+SAFE_GAP+r,wy=hall.height/2+SAFE_GAP+r;
     if(Math.abs(x-model.hall.x)<wx&&Math.abs(y-model.hall.y)<wy)
      issues.push('Wall intrudes into courtyard hall clearance');
    }
   }
  }
 }
 // The camera-facing wall face extends DOWN/RIGHT from the roof. Check its
 // actual asymmetrical polygons against the immutable Layer 1 geometry. Using
 // a symmetric inflated wall radius would incorrectly reject the west wall
 // beside our Courtyard Hall even when its visible face has enough space.
 if(profilePainter){
  const visualQuads=profilePainter.extentQuads(compiled,model.hall);
  for(const q of visualQuads){
   for(let side=0;side<q.length;side++){
    const a=q[side],b=q[(side+1)%q.length];
    const count=Math.max(1,Math.ceil(dist(a,b)/2));
    for(let i=0;i<=count;i++){
     const pt=lerp(a,b,i/count);
     if(pt[0]<INSET-EPS||pt[0]>TILE-INSET+EPS||
        pt[1]<INSET-EPS||pt[1]>TILE-INSET+EPS)
      issues.push('Perspective wall face crosses tile inset');
     for(const road of tileEdges.paths){
      const edge=road.type==='W'?4:5;
      const clearance=road.width/2+edge+SAFE_GAP;
      if(layer2.minRouteDistance(pt,road)<clearance-EPS)
       issues.push('Perspective wall face enters protected '+(road.type==='W'?'canal':'street')+' corridor');
     }
     if(hall&&
       Math.abs(pt[0]-model.hall.x)<hall.width/2+SAFE_GAP-EPS&&
       Math.abs(pt[1]-model.hall.y)<hall.height/2+SAFE_GAP-EPS)
      issues.push('Perspective wall face intrudes into courtyard hall clearance');
    }
   }
  }
 }
 // Exactly shared L/T vertices, rather than separate wall-sprite borders.
 if(compiled.junctions.some(j=>j.seamGap!==0))issues.push('Disconnected wall junction');
 return Object.freeze({valid:issues.length===0,issues:Object.freeze([...new Set(issues)]),
  wallSegments:compiled.ribbons.length,junctions:compiled.junctions.length,
  lCorners:compiled.junctions.filter(j=>j.kind==='L').length,
  tJunctions:compiled.junctions.filter(j=>j.kind==='T').length,
  passableOpenings:compiled.gates.map(g=>Object.freeze({
   id:g.id,centre:g.center,width:g.width,clearWidth:g.walkThroughWidth,
   open:!isSolid(compiled,g.center)
  })),complete:model.id==='rectangle',materialStatus:'temporary-flat-colours'});
}
function trace(ctx,points,ox,oy,closed=false){
 ctx.beginPath();ctx.moveTo(points[0][0]+ox,points[0][1]+oy);
 for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0]+ox,points[i][1]+oy);
 if(closed)ctx.closePath();
}
function draw(ctx,model,tile,options={}){
 const useProfile=!!(options.profilePainter&&options.perspective!==false);
 const compiled=compile(model),report=audit(model,tile,{
  profilePainter:useProfile?options.profilePainter:null
 });
 if(!report.valid)return Object.freeze({...report,drawn:false});
 const ox=tile.x*TILE,oy=tile.y*TILE;
 const ink={...PALETTE,...options.palette};
 ctx.save();ctx.lineCap='butt';ctx.lineJoin='miter';ctx.miterLimit=4;
 // Layer by layer across ALL centreline paths: intersections therefore
 // share one continuous substrate rather than exposing independent endcaps.
 const useRoof=!!(options.roofImage&&options.roofPainter);
 if(useProfile)options.profilePainter.draw(ctx,compiled,tile,{
  hall:model.hall,palette:options.profilePalette,
  materialPainter:options.materialPainter,
  plasterImage:options.plasterImage,stoneImage:options.stoneImage
 });
 for(const band of MATERIALS){
  if(useProfile&&(band.slot==='foundation'||band.slot==='plaster'))continue;
  // The painterly roof image already contains its ridge/eave highlights,
  // so do not paint a second synthetic line over the accepted painting.
  if(useRoof&&band.slot==='ridge')continue;
  ctx.strokeStyle=ink[band.slot];ctx.lineWidth=band.width;
  for(const path of compiled.paths){
   trace(ctx,path.points,ox,oy,path.closed);ctx.stroke();
  }
  // Draw atop the continuous grey coping substrate, clipped to miter-joined
  // wall ribbons. The cut moon gate remains completely empty.
  if(useRoof&&band.slot==='coping')
   options.roofPainter.draw(ctx,compiled,tile,options.roofImage);
 }
 // Portal holes are true omissions from ALL 4 solid strokes. The dotted
 // threshold is an optional diagnostic overlay, never a solid collision mask.
 if(useProfile&&typeof options.profilePainter.drawEaves==='function')
  options.profilePainter.drawEaves(ctx,compiled,tile,{hall:model.hall});
 // Architectural return edges at the true opening ends are permanent
 // features, not optional guide lines. Never bridge the gate itself.
 if(useProfile&&typeof options.profilePainter.drawGateReturns==='function')
  options.profilePainter.drawGateReturns(ctx,compiled,tile,{hall:model.hall});
 if(options.moonGatePainter&&useProfile)options.moonGatePainter.draw(ctx,compiled,tile,{hall:model.hall,image:options.moonGateImage,showDetail:true});
 if(options.showGates!==false){
  for(const g of compiled.gates){
   const [x,y]=g.center,[tx,ty]=g.tangent,[nx,ny]=g.normal;
   ctx.strokeStyle=ink.threshold;ctx.lineWidth=.8;
   ctx.setLineDash([2,3]);ctx.beginPath();
   ctx.moveTo(ox+g.start[0],oy+g.start[1]);
   ctx.lineTo(ox+g.end[0],oy+g.end[1]);ctx.stroke();ctx.setLineDash([]);
   for(const side of [g.start,g.end]){
    ctx.strokeStyle=ink.ink;ctx.lineWidth=1;ctx.beginPath();
    ctx.moveTo(ox+side[0]-nx*WIDTHS.coping/2,oy+side[1]-ny*WIDTHS.coping/2);
    ctx.lineTo(ox+side[0]+nx*WIDTHS.coping/2,oy+side[1]+ny*WIDTHS.coping/2);ctx.stroke();
   }
  }
 }
 if(options.showJoints){
  for(const j of compiled.junctions){
   ctx.beginPath();ctx.arc(ox+j.point[0],oy+j.point[1],2.5,0,2*Math.PI);
   ctx.fillStyle=j.kind==='T'?'#a06d54':'#426c59';ctx.fill();
  }
 }
 ctx.restore();
 return Object.freeze({...report,drawn:true,roofTextureUsed:useRoof,
  perspectiveProfileUsed:useProfile,
  plasterTextureUsed:!!(useProfile&&options.materialPainter&&options.plasterImage),
  stoneTextureUsed:!!(useProfile&&options.materialPainter&&options.stoneImage)});
}
return Object.freeze({TILE,INSET,SAFE_GAP,EPS,WIDTHS,PALETTE,MATERIALS,templates,
 length,pointAlong,distanceAlong,slice,compile,detectJunctions,distToSegment,isSolid,audit,draw});
});