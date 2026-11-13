/* Yangzhou V3 - one coherent, slightly elevated SOUTH-facing camera.
 * Horizontal walls have a shallow far or deeper near plaster elevation below
 * their coping. North-south walls show rotated coping with a narrow shaded
 * RIGHT eave only: never a second, perpendicular white-plaster facade.
 *
 * Exact wall corners share the roof vertex. The NORTH horizontal face is
 * tucked beneath the roof overhang; the SOUTH/BOTTOM horizontal face reaches
 * the OUTER 4-unit roof edge at each true L corner, preventing bare ground
 * under the perpendicular coping. The moon-gate ends remain full-length
 * but are never extended into the opening.
 * No independent corner infill rectangles.
 * All paint/geometry is tile-local; V2 and the previous labs are untouched.
 */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3WallProfile=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const EPS=1e-7,COPING_HALF=4,FACE_START=3.25,BASE_HEIGHT=1.7;
const SIDE_EAVE=1.05,SIDE_SHADOW=.55;
const CORNER_REVEAL=COPING_HALF-.25;
const DEPTH=Object.freeze({north:6,south:10,west:0,east:0});
const PALETTE=Object.freeze({
 plasterTop:'#f0ede3',plasterBottom:'#d2cebf',
 foundation:'#999a90',foundationEdge:'#656e68',
 shadow:'rgba(50,63,57,.13)',eave:'rgba(47,58,53,.55)',
 sideEave:'#747d74',sideShadow:'rgba(40,51,48,.17)'
});
const close=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<EPS;
function orientation(a,b,hall={x:110,y:110}){
 hall=hall||{x:110,y:110};
 const dx=b[0]-a[0],dy=b[1]-a[1];
 if(Math.abs(dx)<EPS&&Math.abs(dy)<EPS)throw Error('Zero-length wall face');
 const horizontal=Math.abs(dy)<EPS;
 if(!horizontal&&Math.abs(dx)>=EPS)throw Error('Wall perspective requires orthogonal segments');
 const location=horizontal?(a[1]<hall.y?'north':'south'):(a[0]<hall.x?'west':'east');
 return Object.freeze({
  axis:horizontal?'horizontal':'vertical',
  location,side:horizontal?'south':'east',
  normal:Object.freeze(horizontal?[0,1]:[1,0]),depth:DEPTH[location]
 });
}
function quad(a,b,normal,inner,outer){
 const [nx,ny]=normal;
 return [[a[0]+nx*inner,a[1]+ny*inner],
  [b[0]+nx*inner,b[1]+ny*inner],
  [b[0]+nx*outer,b[1]+ny*outer],
  [a[0]+nx*outer,a[1]+ny*outer]];
}
// Only the compass-facing horizontal facade gets any WHITE wall material.
// Vertical walls have a tiny shaded coping eave, not a plaster/stone band.
function faceFor(a,b,hall,{cornerStart=false,cornerEnd=false}={}){
 const direction=orientation(a,b,hall),horizontal=direction.axis==='horizontal';
 let paintedA=[...a],paintedB=[...b];
 // The roof owns the 90-degree miter, but the *visible* near/bottom
 // facade must reach the OUTSIDE of the perpendicular roof at each L turn.
 // Rev42 ended on the centreline and left a visible 4-unit strip of grass
 // beneath the roof's western/eastern half. Signed reveals fix the mismatch:
 // NORTH corners: +3.75 (hidden beneath coping);
 // SOUTH corners: -4 (extend to the perpendicular roof's outer edge).
 // Gate jambs and free ends are NEVER extended: only geometric L corners
 // set cornerStart/End, and no wall-face paint crosses a true opening.
 const cornerReveal=!horizontal?0:direction.location==='north'
  ?CORNER_REVEAL:-COPING_HALF;
 if(horizontal){
  const towards=Math.sign(b[0]-a[0]);
  if(cornerStart)paintedA=[a[0]+towards*cornerReveal,a[1]];
  if(cornerEnd)paintedB=[b[0]-towards*cornerReveal,b[1]];
  if(Math.abs(paintedB[0]-paintedA[0])<EPS)
   throw Error('Wall too short after shared-roof corner reveal');
 }
 const outer=COPING_HALF+(horizontal?direction.depth:SIDE_EAVE);
 const n=direction.normal;
 return Object.freeze({
  ...direction,
  sourceA:Object.freeze([...a]),sourceB:Object.freeze([...b]),
  a:Object.freeze(paintedA),b:Object.freeze(paintedB),
  outer,hasFacade:horizontal,cornerStart,cornerEnd,
  cornerReveal,
  face:horizontal?quad(paintedA,paintedB,n,FACE_START,outer):null,
  base:horizontal?quad(paintedA,paintedB,n,outer-BASE_HEIGHT,outer):null,
  shadow:quad(paintedA,paintedB,n,outer,outer+(horizontal?.75:SIDE_SHADOW)),
  sideEave:horizontal?null:quad(a,b,n,COPING_HALF-.35,outer),
  eaveStart:Object.freeze([a[0]+n[0]*COPING_HALF,a[1]+n[1]*COPING_HALF]),
  eaveEnd:Object.freeze([b[0]+n[0]*COPING_HALF,b[1]+n[1]*COPING_HALF])
 });
}
// The roof centreline owns each shared corner. No masonry rectangle is
// fabricated beyond the two actual connected faces.
function cornerFills(compiled,hall,faces){
 const joins=[];
 for(const corner of compiled.junctions.filter(j=>j.kind==='L')){
  const pt=corner.point;
  const connected=[];
  for(const path of compiled.paths)for(let i=1;i<path.points.length;i++){
   const a=path.points[i-1],b=path.points[i];
   if(close(pt,a)||close(pt,b))connected.push({a,b});
  }
  const horizontal=connected.find(e=>Math.abs(e.a[1]-e.b[1])<EPS);
  const vertical=connected.find(e=>Math.abs(e.a[0]-e.b[0])<EPS);
  if(!horizontal||!vertical)throw Error('A shared L corner needs orthogonal wall centrelines');
  joins.push(Object.freeze({
   joint:Object.freeze([...pt]),kind:'roof-shared-vertex',
   reveal:CORNER_REVEAL,southFacadeReveal:-COPING_HALF,
   southFacadeExtension:COPING_HALF,artificialPier:false,
   horizontal:horizontal,vertical:vertical
  }));
 }
 return Object.freeze(joins);
}
function build(compiled,hall){
 const joins=cornerFills(compiled,hall);
 const isJoin=p=>joins.some(j=>close(j.joint,p));
 const faces=[];
 for(const path of compiled.paths)for(let i=1;i<path.points.length;i++){
  const a=path.points[i-1],b=path.points[i];
  faces.push(faceFor(a,b,hall,{
   cornerStart:isJoin(a),cornerEnd:isJoin(b)
  }));
 }
 return Object.freeze({
  faces:Object.freeze(faces),
  // Name retained for existing diagnostics, but these are descriptors,
  // not polygons and are NEVER painted as large corner patches.
  cornerFills:joins,cornerJoins:joins,
  cameraDirection:'south'
 });
}
function fillQuad(ctx,q,ox,oy,paint){
 if(!q)return;
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
 // All occlusion has ONE camera direction: south, toward increasing screen Y.
 // The vertical coping's narrow eastern lip is shaded, never white plaster.
 for(const f of form.faces)fillQuad(ctx,f.shadow,ox,oy,
  f.hasFacade?ink.shadow:ink.sideShadow);
 for(const f of form.faces){
  if(f.hasFacade)fillQuad(ctx,f.face,ox,oy,gradient(ctx,f,ox,oy,ink));
  else fillQuad(ctx,f.sideEave,ox,oy,ink.sideEave);
 }
 const plasterPainted=!!(options.materialPainter&&options.plasterImage);
 const stonePainted=!!(options.materialPainter&&options.stoneImage);
 if(plasterPainted)options.materialPainter.drawPlaster(ctx,form,tile,
  options.plasterImage,{FACE_START,BASE_HEIGHT,quad});
 for(const f of form.faces)if(f.hasFacade)fillQuad(ctx,f.base,ox,oy,ink.foundation);
 if(stonePainted)options.materialPainter.drawStone(ctx,form,tile,
  options.stoneImage,{FACE_START,BASE_HEIGHT,quad});
 ctx.restore();
 return Object.freeze({
  projected:true,cameraDirection:'south',faces:form.faces.length,
  horizontalFacades:form.faces.filter(f=>f.hasFacade).length,
  verticalEaves:form.faces.filter(f=>!f.hasFacade).length,
  plasterTextureUsed:plasterPainted,stoneTextureUsed:stonePainted,
  north:form.faces.filter(f=>f.location==='north').length,
  south:form.faces.filter(f=>f.location==='south').length,
  west:form.faces.filter(f=>f.location==='west').length,
  east:form.faces.filter(f=>f.location==='east').length,
  outerCornerFills:0,cornerJoins:form.cornerJoins.length
 });
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
  const outer=COPING_HALF+(direction.axis==='horizontal'?direction.depth:SIDE_EAVE);
  for(const end of [gate.start,gate.end]){
   ctx.beginPath();
   ctx.moveTo(ox+end[0]+n[0]*COPING_HALF,oy+end[1]+n[1]*COPING_HALF);
   ctx.lineTo(ox+end[0]+n[0]*outer,oy+end[1]+n[1]*outer);
   ctx.stroke();painted++;
  }
 }
 ctx.restore();
 return painted;
}
function extentQuads(compiled,hall){
 const form=build(compiled,hall);
 return form.faces.flatMap(f=>[f.face,f.base,f.shadow,f.sideEave].filter(Boolean));
}
return Object.freeze({
 EPS,COPING_HALF,FACE_START,BASE_HEIGHT,SIDE_EAVE,SIDE_SHADOW,
 CORNER_REVEAL,DEPTH,PALETTE,
 orientation,quad,faceFor,cornerFills,build,extentQuads,draw,drawEaves,
 drawGateReturns
});
});