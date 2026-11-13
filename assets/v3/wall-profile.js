/* Yangzhou V3 - perspective-aware courtyard wall elevation (candidate).
 * An overhead coping stays on the actual geometry centreline. Warm plaster
 * and foundation drop only towards the camera-facing SOUTH or EAST.
 * North-wall faces are shallower; south-wall faces show more elevation,
 * matching the slightly oblique painting of Courtyard Hall 01.
 * This is a diagnostic material profile, not a new painted sprite.
 */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3WallProfile=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const EPS=1e-7, COPING_HALF=4, FACE_START=3.25, BASE_HEIGHT=1.7;
const DEPTH=Object.freeze({north:6,south:10,west:7,east:8});
const PALETTE=Object.freeze({
 plasterTop:'#f0ede3',plasterBottom:'#d2cebf',
 foundation:'#999a90',foundationEdge:'#656e68',
 shadow:'rgba(50,63,57,.13)',eave:'rgba(47,58,53,.55)'
});
function orientation(a,b,hall={x:110,y:110}){
 hall=hall||{x:110,y:110};
 const dx=b[0]-a[0],dy=b[1]-a[1];
 if(Math.abs(dx)<EPS&&Math.abs(dy)<EPS)throw Error('Zero-length wall face');
 const horizontal=Math.abs(dy)<EPS;
 const vertical=Math.abs(dx)<EPS;
 if(!horizontal&&!vertical)throw Error('This V3 wall-profile proof requires orthogonal centreline segments');
 const side=horizontal?'south':'east';
 const location=horizontal
  ?(a[1]<hall.y?'north':'south')
  :(a[0]<hall.x?'west':'east');
 return Object.freeze({
  axis:horizontal?'horizontal':'vertical',location,side,
  normal:Object.freeze(horizontal?[0,1]:[1,0]),
  depth:DEPTH[location]
 });
}
function quad(a,b,normal,inner,outer){
 const [nx,ny]=normal;
 return [
  [a[0]+nx*inner,a[1]+ny*inner],
  [b[0]+nx*inner,b[1]+ny*inner],
  [b[0]+nx*outer,b[1]+ny*outer],
  [a[0]+nx*outer,a[1]+ny*outer]
 ];
}
function faceFor(a,b,hall){
 const dir=orientation(a,b,hall),outer=COPING_HALF+dir.depth;
 return Object.freeze({
  a,b,...dir,outer,
  face:quad(a,b,dir.normal,FACE_START,outer),
  base:quad(a,b,dir.normal,outer-BASE_HEIGHT,outer),
  shadow:quad(a,b,dir.normal,outer,outer+.75),
  eaveStart:[a[0]+dir.normal[0]*COPING_HALF,a[1]+dir.normal[1]*COPING_HALF],
  eaveEnd:[b[0]+dir.normal[0]*COPING_HALF,b[1]+dir.normal[1]*COPING_HALF]
 });
}
function close(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1])<EPS;}
function box(x1,y1,x2,y2){
 return [[x1,y1],[x2,y1],[x2,y2],[x1,y2]];
}
// A physical 90-degree wall must have ONE projected masonry corner, not two
// abruptly terminated rectangular faces. Both visible faces project south/
// east in the camera view; their outside quadrant can be missing at NE/SE.
// These shared corner piers close that quadrant for *all* four arm pairings.
// The roof miter is painted after these quads and hides the plaster under eaves.
function cornerFills(compiled,hall,faces){
 const result=[];
 for(const joint of compiled.junctions.filter(j=>j.kind==='L')){
  const p=joint.point,[x,y]=p;
  const touches=f=>close(f.a,p)||close(f.b,p);
  const horizontal=faces.find(f=>f.axis==='horizontal'&&touches(f));
  const vertical=faces.find(f=>f.axis==='vertical'&&touches(f));
  if(!horizontal||!vertical)throw Error('An L joint must connect exactly one horizontal and one vertical wall face');
  const outerX=x+vertical.outer,outerY=y+horizontal.outer;
  const plasterEndY=outerY-BASE_HEIGHT,plasterEndX=outerX-BASE_HEIGHT;
  // South-facing face carries its original west-to-east texture phase through
  // the corner. East-facing base then wraps its outside right-hand edge.
  result.push(Object.freeze({
   joint:Object.freeze([...p]),
   horizontal,vertical,outerX,outerY,
   face:box(x,y,outerX,outerY),
   plaster:box(x,y+FACE_START,outerX,plasterEndY),
   underEave:box(x,y,outerX,y+FACE_START),
   base:box(x,plasterEndY,outerX,outerY),
   baseEast:box(plasterEndX,y,outerX,outerY),
   shadowSouth:box(x,outerY,outerX+.75,outerY+.75),
   shadowEast:box(outerX,y,outerX+.75,outerY+.75)
  }));
 }
 return Object.freeze(result);
}
function build(compiled,hall){
 const faces=[];
 for(const path of compiled.paths)for(let i=1;i<path.points.length;i++)
  faces.push(faceFor(path.points[i-1],path.points[i],hall));
 return Object.freeze({faces:Object.freeze(faces),
  cornerFills:cornerFills(compiled,hall,faces)});
}
function fillQuad(ctx,q,ox,oy,paint){
 ctx.beginPath();ctx.moveTo(q[0][0]+ox,q[0][1]+oy);
 for(let i=1;i<q.length;i++)ctx.lineTo(q[i][0]+ox,q[i][1]+oy);
 ctx.closePath();ctx.fillStyle=paint;ctx.fill();
}
function gradient(ctx,f,ox,oy,ink){
 const mx=(f.a[0]+f.b[0])/2+ox,my=(f.a[1]+f.b[1])/2+oy;
 if(typeof ctx.createLinearGradient!=='function')return ink.plasterTop;
 const g=ctx.createLinearGradient(mx+f.normal[0]*FACE_START,
  my+f.normal[1]*FACE_START,mx+f.normal[0]*f.outer,my+f.normal[1]*f.outer);
 g.addColorStop(0,ink.plasterTop);
 g.addColorStop(1,ink.plasterBottom);
 return g;
}
function draw(ctx,compiled,tile,options={}){
 const form=build(compiled,options.hall),ink={...PALETTE,...options.palette};
 const ox=tile.x*220,oy=tile.y*220;
 ctx.save();
 // Contact shadow remains outside the elevated plaster, on its BOTTOM/RIGHT.
 // No foundations or wall faces are ever painted north/west of the coping.
 ctx.fillStyle=ink.shadow;
 for(const f of form.faces)fillQuad(ctx,f.shadow,ox,oy,ink.shadow);
 for(const joint of form.cornerFills){
  fillQuad(ctx,joint.shadowSouth,ox,oy,ink.shadow);
  fillQuad(ctx,joint.shadowEast,ox,oy,ink.shadow);
 }
 // Face polygons are projected consistently in screen space, regardless
 // of centreline winding. A south boundary exposes more plaster than north.
 for(const f of form.faces)fillQuad(ctx,f.face,ox,oy,gradient(ctx,f,ox,oy,ink));
 for(const f of form.cornerFills)fillQuad(ctx,f.face,ox,oy,ink.plasterBottom);
 const plasterPainted=!!(options.materialPainter&&options.plasterImage);
 const stonePainted=!!(options.materialPainter&&options.stoneImage);
 if(plasterPainted){
  options.materialPainter.drawPlaster(ctx,form,tile,options.plasterImage,{
   FACE_START,BASE_HEIGHT,quad
  });
 }
 // Stone base is at the LOWEST visible edge, not a symmetric halo on grass.
 for(const f of form.faces)fillQuad(ctx,f.base,ox,oy,ink.foundation);
 for(const f of form.cornerFills){
  fillQuad(ctx,f.base,ox,oy,ink.foundation);
  fillQuad(ctx,f.baseEast,ox,oy,ink.foundation);
 }
 if(stonePainted){
  options.materialPainter.drawStone(ctx,form,tile,options.stoneImage,{
   FACE_START,BASE_HEIGHT,quad
  });
 }
 ctx.restore();
 return Object.freeze({projected:true,faces:form.faces.length,
  plasterTextureUsed:plasterPainted,stoneTextureUsed:stonePainted,
  north:form.faces.filter(f=>f.location==='north').length,
  south:form.faces.filter(f=>f.location==='south').length,
  west:form.faces.filter(f=>f.location==='west').length,
  east:form.faces.filter(f=>f.location==='east').length,
  outerCornerFills:form.cornerFills.length});
}
function drawEaves(ctx,compiled,tile,options={}){
 const form=build(compiled,options.hall),ink={...PALETTE,...options.palette};
 const ox=tile.x*220,oy=tile.y*220;
 ctx.save();ctx.lineWidth=.65;ctx.strokeStyle=ink.eave;
 for(const f of form.faces){
  ctx.beginPath();ctx.moveTo(ox+f.eaveStart[0],oy+f.eaveStart[1]);
  ctx.lineTo(ox+f.eaveEnd[0],oy+f.eaveEnd[1]);ctx.stroke();
 }
 ctx.restore();
}
function drawGateReturns(ctx,compiled,tile,options={}){
 const ink={...PALETTE,...options.palette},ox=tile.x*220,oy=tile.y*220;
 let painted=0;
 ctx.save();ctx.strokeStyle=ink.foundationEdge;ctx.lineWidth=.85;
 for(const gate of compiled.gates){
  const direction=orientation(gate.start,gate.end,options.hall);
  const n=direction.normal;
  for(const end of [gate.start,gate.end]){
   // On the actual gate boundary, never spanning the passage itself.
   ctx.beginPath();
   ctx.moveTo(ox+end[0]+n[0]*COPING_HALF,oy+end[1]+n[1]*COPING_HALF);
   ctx.lineTo(ox+end[0]+n[0]*(COPING_HALF+direction.depth),
    oy+end[1]+n[1]*(COPING_HALF+direction.depth));
   ctx.stroke();painted++;
  }
 }
 ctx.restore();
 return painted;
}
function extentQuads(compiled,hall){
 const form=build(compiled,hall);
 // The full projected corner, both connected stone courses and their
 // shadows participate in the existing route/tile-clearance audit.
 return [
  ...form.faces.flatMap(f=>[f.face,f.shadow]),
  ...form.cornerFills.flatMap(f=>[f.face,f.shadowSouth,f.shadowEast])
 ];
}
return Object.freeze({
 EPS,COPING_HALF,FACE_START,BASE_HEIGHT,DEPTH,PALETTE,
 orientation,quad,faceFor,cornerFills,build,extentQuads,draw,drawEaves,
 drawGateReturns
});
});