'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const walls=require('../assets/v3/wall-geometry.js');
const profile=require('../assets/v3/wall-profile.js');
const roof=require('../assets/v3/wall-roof-texture.js');
const tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
const rectangle=walls.templates.rectangle,compiled=walls.compile(rectangle);
function inside(poly,pt){
 if(!poly)return false;
 let flag=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];
  if((a[1]>pt[1])!==(b[1]>pt[1]) &&
     pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])flag=!flag;
 }
 return flag;
}
assert.deepEqual(profile.DEPTH,{north:6,south:10,west:0,east:0});
assert.equal(profile.COPING_HALF,roof.ASSET.bandWidth/2);
assert.equal(profile.FACE_START,3.25);
assert.equal(profile.CORNER_REVEAL,3.75);
assert(profile.SIDE_EAVE>0&&profile.SIDE_EAVE<1.5);
const form=profile.build(compiled,rectangle.hall);
assert.equal(form.cameraDirection,'south');
assert.equal(form.faces.length,compiled.ribbons.length);
const north=form.faces.find(f=>f.axis==='horizontal'&&f.location==='north');
const south=form.faces.find(f=>f.axis==='horizontal'&&f.location==='south');
const west=form.faces.find(f=>f.axis==='vertical'&&f.location==='west');
const east=form.faces.find(f=>f.axis==='vertical'&&f.location==='east');
for(const face of [north,south,west,east])assert(face);
assert.equal(north.outer,10);
assert.equal(south.outer,14);
assert(south.outer>north.outer,'Near wall has visibly deeper south-facing plaster');
for(const face of [north,south]){
 assert(face.hasFacade&&face.face&&face.base);
 assert.deepEqual(face.normal,[0,1]);
 assert(face.cornerStart||face.cornerEnd,'A horizontal courtyard face must tuck into its shared roof');
}
assert(inside(north.face,[85,54])&&inside(south.face,[85,186]));
assert(!inside(north.face,[85,40])&&!inside(south.face,[85,170]));
for(const face of [west,east]){
 assert.equal(face.hasFacade,false,'Vertical wall is NOT a second perpendicular plaster facade');
 assert.equal(face.depth,0);
 assert.equal(face.face,null);
 assert.equal(face.base,null);
 assert(face.sideEave,'N/S roofs have a narrow shaded eave');
 assert.deepEqual(face.normal,[1,0]);
 assert(Math.abs(face.outer-5.05)<1e-7);
}
assert(inside(west.sideEave,[46.5,95]));
assert(inside(east.sideEave,[182.5,95]));
assert(!inside(west.sideEave,[50,95]));
assert(!inside(east.sideEave,[189,95]));
assert.equal(form.cornerJoins.length,4);
assert.equal(form.cornerFills.length,4,'Four metadata joins remain for diagnostics');
assert(form.cornerJoins.every(j=>j.kind==='roof-shared-vertex'&&
 j.artificialPier===false&&j.reveal===profile.CORNER_REVEAL));
assert(form.cornerJoins.every(j=>j.face===undefined&&j.base===undefined),
 'A shared roof vertex must NOT create a separate broad plaster/stone rectangle');
const extent=profile.extentQuads(compiled,rectangle.hall);
assert(extent.length<compiled.ribbons.length*3+8,
 'No duplicated camera-facing corner slabs in the projected safety envelope');
assert(!extent.some(q=>inside(q,[189,185])),'Previously visible eastern white slab must be bare ground');
assert(!extent.some(q=>inside(q,[110,178])),'Gate centre remains physically open');
for(const m of Object.values(walls.templates)){
 const model=walls.compile(m),f=profile.build(model,m.hall);
 const land=walls.audit(m,tile,{profilePainter:profile});
 assert(land.valid,m.id+' must fit original all-land tile: '+land.issues.join('; '));
 assert.deepEqual(land,walls.audit(m,{...tile,x:7,y:-8},{profilePainter:profile}));
 for(const gate of model.gates){
  assert(!profile.extentQuads(model,m.hall).some(q=>inside(q,gate.center)));
 }
 for(const v of f.faces.filter(x=>x.axis==='vertical'))
  assert(v.base===null&&v.face===null);
}
const badStreet={...tile,edges:['L','S','L','S']};
const badCanal={...tile,edges:['L','W','L','W']};
assert(!walls.audit(rectangle,badStreet,{profilePainter:profile}).valid);
assert(!walls.audit(rectangle,badCanal,{profilePainter:profile}).valid);
const tooNearBottom={id:'lower-test',hall:null,
 paths:[{id:'bottom',points:[[25,200],[190,200]]}],openings:[]};
assert(walls.audit(tooNearBottom,tile).valid);
assert(!walls.audit(tooNearBottom,tile,{profilePainter:profile}).valid,
 'Projected south face still participates in tile-inset safety');
const frames=roof.segments(compiled).map(p=>roof.compassFrame(p));
assert(frames.some(f=>f.orientation==='horizontal'&&f.angle===0));
assert(frames.some(f=>f.orientation==='vertical'&&f.angle===-Math.PI/2));
assert.deepEqual(
 roof.compassFrame({a:[30,10],b:[30,90]}),
 roof.compassFrame({a:[30,90],b:[30,10]}),
 'Roof-image rotation must be compass-consistent when wall winding reverses'
);
const strokes=[],paintCtx={
 save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
 stroke(){strokes.push('stroke')},fill(){strokes.push('fill')},
 setLineDash(){},arc(){},clip(){},translate(){},rotate(){},drawImage(){},
 createLinearGradient(){return {addColorStop(){}}}
};
const drawn=profile.draw(paintCtx,compiled,tile,{hall:rectangle.hall});
assert(drawn.projected&&drawn.cameraDirection==='south');
assert.equal(drawn.outerCornerFills,0);
assert.equal(drawn.cornerJoins,4);
assert.equal(drawn.horizontalFacades,3,'Gate divides the south wall into two façades');
assert.equal(drawn.verticalEaves,2);
profile.drawEaves(paintCtx,compiled,tile,{hall:rectangle.hall});
assert.equal(profile.drawGateReturns(paintCtx,compiled,tile,{hall:rectangle.hall}),2);
assert(strokes.includes('fill')&&strokes.includes('stroke'));
const complete=walls.draw(paintCtx,rectangle,tile,{
 profilePainter:profile,roofPainter:roof,
 roofImage:{naturalWidth:1256,naturalHeight:314},
 showJoints:false,showGates:false
});
assert(complete.valid&&complete.roofTextureUsed&&complete.perspectiveProfileUsed);
assert(!walls.draw(paintCtx,rectangle,badCanal,{profilePainter:profile}).valid);
const html=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const marker of ['rev 41','assets/v3/wall-profile.js?rev=41',
 'id="showPerspective"','profilePainter:visible(',
 'perspectiveWallProfile:',"cameraFacing:['south']",
 'plasterAboveCoping:false'])assert(html.includes(marker),marker);
assert(!fs.readFileSync('layer2-lab-v3.html','utf8').includes('wall-profile.js'));
assert(!fs.readFileSync('courtyard-enclosure-lab-v3.html','utf8').includes('wall-profile.js'));
console.log('V3 south-camera geometry passed: 6/10 near/far façades, zero vertical plaster, shared L corners, narrow side eaves, 90° roof, open gates and unchanged routes.');
