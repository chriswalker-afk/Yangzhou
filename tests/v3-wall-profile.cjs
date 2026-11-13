'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const walls=require('../assets/v3/wall-geometry.js');
const profile=require('../assets/v3/wall-profile.js');
const roof=require('../assets/v3/wall-roof-texture.js');
const tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
const rectangle=walls.templates.rectangle,compiled=walls.compile(rectangle);
assert.deepEqual(profile.DEPTH,{north:6,south:10,west:7,east:8});
assert.equal(profile.COPING_HALF,roof.ASSET.bandWidth/2);
assert.equal(profile.FACE_START,3.25);
function has(q,p){
 const xmin=Math.min(...q.map(v=>v[0])),xmax=Math.max(...q.map(v=>v[0]));
 const ymin=Math.min(...q.map(v=>v[1])),ymax=Math.max(...q.map(v=>v[1]));
 return p[0]>xmin+1e-8&&p[0]<xmax-1e-8&&p[1]>ymin+1e-8&&p[1]<ymax-1e-8;
}
const form=profile.build(compiled,rectangle.hall);
assert.equal(form.faces.length,compiled.ribbons.length,'Each wall segment gets one continuous material face');
const top=form.faces.find(f=>f.axis==='horizontal'&&f.location==='north');
const bottom=form.faces.find(f=>f.axis==='horizontal'&&f.location==='south');
const west=form.faces.find(f=>f.axis==='vertical'&&f.location==='west');
const east=form.faces.find(f=>f.axis==='vertical'&&f.location==='east');
for(const f of [top,bottom,west,east])assert(f,'All four compass elevations must exist');
assert.deepEqual(top.normal,[0,1]);assert.deepEqual(bottom.normal,[0,1]);
assert.deepEqual(west.normal,[1,0]);assert.deepEqual(east.normal,[1,0]);
assert.equal(top.outer,10);assert.equal(bottom.outer,14);
assert.equal(west.outer,11);assert.equal(east.outer,12);
assert(bottom.depth>top.depth,'The near wall must show more painted plaster than the far wall');
assert(has(top.face,[75,54]),'Top wall must have a visible south-facing plaster face');
assert(!has(top.face,[75,43]),'No plaster may peek above the north roof coping');
assert(has(bottom.face,[75,186]),'Bottom wall must have a deeper visible plaster face');
assert(!has(bottom.face,[75,173]),'No plaster may show above the south roof coping');
assert(has(west.face,[49,75]),'West side wall must show its face to screen right');
assert(!has(west.face,[38,75]),'West wall plaster must not show on the screen-left side');
assert(has(east.face,[185,75]),'East side wall must have the same screen-right plaster orientation');
assert(!has(east.face,[171,75]),'East wall may not paint hidden-side plaster');
assert(form.cornerFills.length>=1,'The SE outside corner needs its own continuous plaster infill');
assert(form.cornerFills.some(f=>has(f.face,[183,184])),'SE corner must not show a blank diagonal');
const q=profile.extentQuads(compiled,rectangle.hall);
assert(q.length>=form.faces.length,'Safety audit needs the projected visual footprint');
assert(!q.some(poly=>has(poly,[110,178])),'The real moon-gate opening remains clear in the wall profile');
for(const model of Object.values(walls.templates)){
 const land=walls.audit(model,tile,{profilePainter:profile});
 assert(land.valid,model.id+' should have a safe view-facing elevation: '+land.issues.join('; '));
 const moved=walls.audit(model,{...tile,x:13,y:-8},{profilePainter:profile});
 assert.deepEqual(land,moved,'View-facing wall geometry must be tile-local');
 for(const gates of walls.compile(model).gates){
  assert(!profile.extentQuads(walls.compile(model),model.hall).some(poly=>has(poly,gates.center)));
 }
}
const canal={...tile,edges:['L','W','L','W']};
const street={...tile,edges:['L','S','L','S']};
assert(!walls.audit(rectangle,canal,{profilePainter:profile}).valid);
assert(!walls.audit(rectangle,street,{profilePainter:profile}).valid);
// Test that a profile placed near the path is rejected even when its original
// symmetric centreline passes: the visible-face extents are audited separately.
const shifted={
 id:'shifted-test',hall:null,
 paths:[{id:'south-face-near-tile',points:[[25,200],[190,200]]}],
 openings:[]
};
assert(walls.audit(shifted,tile).valid,'Legacy centreline fit should be permitted');
assert(!walls.audit(shifted,tile,{profilePainter:profile}).valid,
 'Projected plaster and stone base cannot violate the 10-unit tile safety inset');
const frames=roof.segments(compiled).map(p=>roof.compassFrame(p));
assert(frames.some(f=>f.orientation==='horizontal'&&f.angle===0&&f.visibleSide==='south'));
assert(frames.some(f=>f.orientation==='vertical'&&f.angle===-Math.PI/2&&f.visibleSide==='east'));
const forwardHorizontal=roof.compassFrame({a:[20,10],b:[100,10]});
const backwardHorizontal=roof.compassFrame({a:[100,10],b:[20,10]});
assert.deepEqual(forwardHorizontal,backwardHorizontal,'Reversing roof centreline cannot flip its lighting');
const forwardVertical=roof.compassFrame({a:[30,10],b:[30,90]});
const backwardVertical=roof.compassFrame({a:[30,90],b:[30,10]});
assert.deepEqual(forwardVertical,backwardVertical,'Side-wall roof always rotates -90 degrees');
assert.deepEqual(forwardVertical.origin,[30,90]);
const rotated=[],roofCtx={
 save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
 clip(){},translate(){},rotate(a){rotated.push(a)},drawImage(){}
};
roof.draw(roofCtx,compiled,tile,{naturalWidth:1256,naturalHeight:314});
assert(rotated.includes(-Math.PI/2),'Painting must truly rotate on N/S side-wall runs');
assert(rotated.includes(0),'East-west wall roof must retain original texture orientation');
const draws=[],faceCtx={
 save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
 fill(){draws.push('fill')},stroke(){draws.push('stroke')},
 createLinearGradient(){return {addColorStop(){}}}
};
const facesPainted=profile.draw(faceCtx,compiled,tile,{hall:rectangle.hall});
profile.drawEaves(faceCtx,compiled,tile,{hall:rectangle.hall});
assert(facesPainted.projected);
assert.equal(facesPainted.south,2,'Moon-gate split creates two south wall segments');
assert(draws.includes('fill')&&draws.includes('stroke'));
const visualCtx={
 ...faceCtx,setLineDash(){},arc(){},fill(){},stroke(){},
 drawImage(){},clip(){},translate(){},rotate(){},
 createLinearGradient(){return {addColorStop(){}}}
};
const report=walls.draw(visualCtx,rectangle,tile,{
 profilePainter:profile,roofPainter:roof,
 roofImage:{naturalWidth:1256,naturalHeight:314},
 showGates:false,showJoints:false
});
assert(report.valid&&report.perspectiveProfileUsed&&report.roofTextureUsed);
assert(!walls.draw(visualCtx,rectangle,canal,{profilePainter:profile}).valid);
const html=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const marker of ['rev 40','assets/v3/wall-profile.js?rev=40',
 'id="showPerspective"','profilePainter:visible(','perspectiveWallProfile:',
 'plasterAboveCoping:false']){
 assert(html.includes(marker),'Missing perspective review control '+marker);
}
assert(!fs.readFileSync('layer2-lab-v3.html','utf8').includes('wall-profile.js'));
assert(!fs.readFileSync('courtyard-enclosure-lab-v3.html','utf8').includes('wall-profile.js'));
console.log('V3 wall perspective QA passed: distinct near/far face heights, camera-correct sides, rotated roof, safe visual envelope, open gates, filled corners and V2 isolation.');
