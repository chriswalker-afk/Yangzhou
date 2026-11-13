'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const wall=require('../assets/v3/wall-geometry.js');
const profile=require('../assets/v3/wall-profile.js');
const paint=require('../assets/v3/wall-face-materials.js');
const coping=require('../assets/v3/wall-roof-texture.js');
const tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
const rectModel=wall.templates.rectangle,compiled=wall.compile(rectModel);
const form=profile.build(compiled,rectModel.hall);
const corners={NW:[42,47],NE:[178,47],SW:[42,178],SE:[178,178]};
const close=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-7;
function covered(point,polys){
 return polys.some(q=>{
  let isInside=false;
  for(let i=0,j=q.length-1;i<q.length;j=i++){
   const a=q[i],b=q[j];
   if((a[1]>point[1])!==(b[1]>point[1])&&
      point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])
    isInside=!isInside;
  }
  return isInside;
 });
}
assert.equal(form.cornerJoins.length,4);
assert.equal(form.cornerFills.length,4,'Legacy name now means metadata, not masonry fills');
assert(form.cornerJoins.every(j=>j.kind==='roof-shared-vertex'&&!j.artificialPier));
assert.equal(profile.cornerFills(compiled,rectModel.hall).length,4);
const polygons=profile.extentQuads(compiled,rectModel.hall);
for(const [kind,vertex] of Object.entries(corners)){
 const j=form.cornerJoins.find(q=>close(q.joint,vertex));
 assert(j,'Missing shared roof vertex '+kind);
 assert.equal(j.reveal,3.75);
 assert.equal(j.southFacadeReveal,0,'Near wall has no L-corner plaster/stone crop');
 assert(!('face' in j)&&!('base' in j)&&!('shadowSouth' in j),
  'Corner '+kind+' must not invent a rectangular projected plaster pier');
 const h=form.faces.find(f=>f.hasFacade&&
  (close(f.sourceA,vertex)||close(f.sourceB,vertex)));
 assert(h,'A continuous horizontal façade must terminate at '+kind);
 const end=close(h.sourceA,vertex)?h.a:h.b;
 if(kind.startsWith('N')){
  assert(Math.abs(end[0]-vertex[0])>3.7&&Math.abs(end[0]-vertex[0])<3.9,
   'North face remains tucked behind the roof at '+kind);
 }else{
  assert(Math.abs(end[0]-vertex[0])<1e-8,
   'Bottom wall plaster and stone must reach the true visible corner at '+kind);
 }
 const roof=coping.segments(compiled);
 assert(roof.some(s=>coping.pointInPolygon([vertex[0]+1,vertex[1]+1],s.quad)),
  'Original mitered roof covers the shared vertex '+kind);
}
for(const pt of [[189,55],[189,185],[180,186],[50,90],[190,90]])
 assert(!covered(pt,polygons),
  'Old oversized side-wall/corner plaster must be removed at '+pt);
for(const pt of [[48,54],[172,54],[48,186],[172,186],
 [43,186],[177,186],[43,191],[177,191]])
 assert(covered(pt,polygons),
  'Horizontal masonry must still meet the coping at '+pt);
const north=form.faces.find(f=>f.location==='north');
const south=form.faces.find(f=>f.location==='south');
assert(south.outer>north.outer,'Near-wall plaster is visibly deeper');
for(const side of form.faces.filter(f=>f.axis==='vertical')){
 assert.equal(side.face,null,'No vertical ivory plaster');
 assert.equal(side.base,null,'No vertical stone foundation');
 assert(side.sideEave,'The side roof still has a thin shaded eave');
}
const images=[],rotations=[],ctx={
 globalAlpha:1,save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},
 closePath(){},clip(){},translate(){},rotate(x){rotations.push(x)},
 drawImage(img,x,y,w,h){images.push({img,x,y,w,h,alpha:this.globalAlpha})},
 fill(){},stroke(){},setLineDash(){},arc(){},
 createLinearGradient(){return {addColorStop(){}}}
};
const plaster={width:1256,height:314},stone={width:1256,height:157};
const p=paint.drawPlaster(ctx,form,tile,plaster,profile);
const st=paint.drawStone(ctx,form,tile,stone,profile);
assert(p>0&&st>0);
assert.equal(images.length,p+st);
assert(images.every(i=>i.alpha===1),'Material at the joins must not double darken');
assert(!rotations.includes(-Math.PI/2),
 'Plaster/stone must never rotate onto a perpendicular side-wall façade');
for(const i of images){
 assert(i.h>0&&i.w>0);
 assert(Math.abs(i.w/i.h-(i.img===plaster?4:8))<1e-8,
  'Paint material retains its native aspect ratio');
}
const real=profile.draw(ctx,compiled,tile,{
 hall:rectModel.hall,materialPainter:paint,plasterImage:plaster,stoneImage:stone
});
assert.equal(real.outerCornerFills,0);
assert.equal(real.cornerJoins,4);
assert.equal(real.verticalEaves,2);
assert(real.plasterTextureUsed&&real.stoneTextureUsed);
assert.equal(profile.drawGateReturns(ctx,compiled,tile,{hall:rectModel.hall}),2);
const roofAngles=[],roofCtx={...ctx,rotate(x){roofAngles.push(x);}};
coping.draw(roofCtx,compiled,tile,{naturalWidth:1256,naturalHeight:314});
assert(roofAngles.includes(-Math.PI/2)&&roofAngles.includes(0),
 'Same roof watercolour remains rotated on vertical walls');
for(const model of Object.values(wall.templates)){
 const c=wall.compile(model),f=profile.build(c,model.hall);
 assert.equal(f.cornerJoins.length,c.junctions.filter(j=>j.kind==='L').length);
 assert(f.faces.filter(x=>x.axis==='vertical').every(x=>x.base===null));
 for(const gate of c.gates){
  assert(!covered(gate.center,profile.extentQuads(c,model.hall)),
   'No rendered plaster/stone/side eave may close the real moon gate');
 }
 const report=wall.audit(model,tile,{profilePainter:profile});
 assert(report.valid,model.id+' must stay tile-safe: '+report.issues.join('; '));
 assert.deepEqual(report,wall.audit(model,{...tile,x:5,y:3},{profilePainter:profile}));
}
for(const edges of [['L','W','L','W'],['L','S','L','S']])
 assert(!wall.audit(rectModel,{...tile,edges},{profilePainter:profile}).valid);
const page=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const item of ['rev 42','id="cornerNW"','id="cornerNE"',
 'id="cornerSW"','id="cornerSE"','renderCornerInspection()',
 'assets/v3/wall-profile.js?rev=42','assets/v3/wall-face-materials.js?rev=42'])
 assert(page.includes(item),item);
assert(!fs.readFileSync('layer2-lab-v3.html','utf8').includes('wall-profile.js'));
assert(!fs.readFileSync('courtyard-enclosure-lab-v3.html','utf8').includes('wall-face-materials.js'));
console.log('V3 four-corner QA passed: north corners tucked, both bottom plaster/stone end caps extended, true gate opening, original roof unchanged and protected routes.');
