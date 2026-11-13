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
function cornerFills(compiled,hall){
 // Only a camera-facing SE *outside* corner has a missing quadrant:
 // the horizontal arm arrives from W and the vertical arm arrives from N.
 // Else the two directed face rectangles already overlap at the join.
 const fills=[];
 for(const joint of compiled.junctions.filter(j=>j.kind==='L')){
  const [x,y]=joint.point;
  const arms=[];
  for(const path of compiled.paths)for(let i=1;i<path.points.length;i++){
   const [a,b]=[path.points[i],path.points[i-1]];
   if(Math.hypot(a[0]-x,a[1]-y)<EPS)arms.push(b);
   else if(Math.hypot(b[0]-x,b[1]-y)<EPS)arms.push(a);
  }
  const west=arms.some(p=>p[0]<x-EPS&&Math.abs(p[1]-y)<EPS);
  const north=arms.some(p=>p[1]<y-EPS&&Math.abs(p[0]-x)<EPS);
  if(!west||!north)continue;
  const eastDepth=orientation([x,y-1],[x,y],hall).depth;
  const southDepth=orientation([x-1,y],[x,y],hall).depth;
  const xOuter=x+COPING_HALF+eastDepth,yOuter=y+COPING_HALF+southDepth;
  fills.push(Object.freeze({
   joint:joint.point,
   face:[[x+FACE_START,y+FACE_START],[xOuter,y+FACE_START],
    [xOuter,yOuter],[x+FACE_START,yOuter]],
   base:[[x+FACE_START,yOuter-BASE_HEIGHT],[xOuter,yOuter-BASE_HEIGHT],
    [xOuter,yOuter],[x+FACE_START,yOuter]]
  }));
 }
 return Object.freeze(fills);
}
function build(compiled,hall){
 const faces=[];
 for(const path of compiled.paths)for(let i=1;i<path.points.length;i++)
  faces.push(faceFor(path.points[i-1],path.points[i],hall));
 return Object.freeze({faces:Object.freeze(faces),
  cornerFills:cornerFills(compiled,hall)});
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
 // Face polygons are projected consistently in screen space, regardless
 // of centreline winding. A south boundary exposes more plaster than north.
 for(const f of form.faces)fillQuad(ctx,f.face,ox,oy,gradient(ctx,f,ox,oy,ink));
 for(const f of form.cornerFills)fillQuad(ctx,f.face,ox,oy,ink.plasterBottom);
 // Stone base is at the LOWEST visible edge, not a symmetric halo on grass.
 for(const f of form.faces)fillQuad(ctx,f.base,ox,oy,ink.foundation);
 for(const f of form.cornerFills)fillQuad(ctx,f.base,ox,oy,ink.foundation);
 ctx.restore();
 return Object.freeze({projected:true,faces:form.faces.length,
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
function extentQuads(compiled,hall){
 const form=build(compiled,hall);
 // These quads are the actual off-centreline VISUAL envelope for safety QA,
 // including the .75-unit ground shadow. No symmetric radius inflation.
 return [
  ...form.faces.flatMap(f=>[f.face,f.shadow]),
  ...form.cornerFills.map(f=>f.face)
 ];
}
return Object.freeze({
 EPS,COPING_HALF,FACE_START,BASE_HEIGHT,DEPTH,PALETTE,
 orientation,quad,faceFor,cornerFills,build,extentQuads,draw,drawEaves
});
});