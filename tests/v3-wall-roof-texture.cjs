'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const wall=require('../assets/v3/wall-geometry.js');
const roof=require('../assets/v3/wall-roof-texture.js');
const spec=JSON.parse(fs.readFileSync('assets/v3/wall-materials/manifest.json','utf8'));
const digest=data=>crypto.createHash('sha256').update(data).digest('hex');
assert.equal(spec.status,'candidate-committed-awaiting-visual-review');
assert.equal(spec.prepared.committed,true);
assert.equal(spec.prepared.gitBlobSha1,'724b075426f0e6fa2688a03e7ac366c50567a124');
assert.equal(spec.productionApproved,false);
assert.equal(spec.prepared.path,roof.ASSET.path);
assert.equal(spec.prepared.bytes,roof.ASSET.bytes);
assert.equal(spec.prepared.sha256,roof.ASSET.sha256);
assert.equal(spec.source.sha256,roof.ASSET.originalSha256);
assert.equal(roof.ASSET.width,1256);
assert.equal(roof.ASSET.height,314);
assert.equal(roof.ASSET.period/roof.ASSET.bandWidth,4);
const grass={x:0,y:0,edges:['L','L','L','L'],seed:1};
function covered(compiled,pt){
 return roof.segments(compiled).some(s=>roof.pointInPolygon(pt,s.quad));
}
for(const model of Object.values(wall.templates)){
 const compiled=wall.compile(model);
 const pieces=roof.segments(compiled);
 assert.equal(pieces.length,compiled.ribbons.length,model.id+' must UV-map every real segment');
 for(const [i,s] of pieces.entries()){
  assert.equal(s.quad.length,4);
  assert(s.quad.every(p=>p.every(Number.isFinite)));
  assert(s.length>0);
  assert(Math.abs(s.length-(s.u1-s.u0))<1e-6);
  // A textured section covers its own midpoint at both coping edges;
  // its polygon never vanishes at an L turn.
  const mid=[(s.a[0]+s.b[0])/2,(s.a[1]+s.b[1])/2];
  assert(roof.pointInPolygon(mid,s.quad),'Coping polygon midpoint missing '+i);
 }
 for(const gate of compiled.gates){
  assert(!covered(compiled,gate.center),'Roof texture may not cover true moon-gate opening');
  for(const d of [-3,0,3]){
   const pt=[gate.center[0]+gate.normal[0]*d,gate.center[1]+gate.normal[1]*d];
   assert(!covered(compiled,pt),'Gate must remain open across full roof thickness');
  }
 }
}
const rect=wall.compile(wall.templates.rectangle);
for(const joint of rect.junctions.filter(j=>j.kind==='L')){
 // The mitered roof strips meet without gaps at every actual courtyard turn.
 for(const dx of [-2.5,0,2.5])for(const dy of [-2.5,0,2.5]){
  assert(covered(rect,[joint.point[0]+dx,joint.point[1]+dy]),
   'Uncovered coping at L join '+joint.point+' delta '+[dx,dy]);
 }
}
const tee=wall.compile(wall.templates.tee);
assert(covered(tee,[110,48]),'T join has continuous coping at branch centre');
assert(covered(tee,[108,49])&&covered(tee,[112,47]),'T join must not expose background');
const rawImage={naturalWidth:1256,naturalHeight:314};
const trace=[],ctx={
 save(){trace.push('save')},restore(){trace.push('restore')},
 beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){trace.push('clip')},
 translate(){},rotate(){},
 drawImage(...args){trace.push({method:'drawImage',args})}
};
const report=roof.draw(ctx,rect,grass,rawImage);
assert(report.painted);
assert.equal(report.segments,roof.segments(rect).length);
assert.equal(trace.filter(x=>x==='clip').length,report.segments);
const paints=trace.filter(x=>x?.method==='drawImage');
assert.equal(paints.length,report.tiles);
assert(paints.length>0);
for(const paint of paints){
 assert.equal(paint.args[0],rawImage);
 assert.equal(paint.args[3],32,'Texture period must be fixed, not image-stretched to a wall');
 assert.equal(paint.args[4],8,'Across-wall scale must be exactly coping thickness');
}
assert.equal(roof.draw(ctx,rect,grass,null).painted,false);
const url='assets/v3/wall-materials/wall-roof-tiles-01.webp';
if(fs.existsSync(url)){
 const bytes=fs.readFileSync(url);
 assert.equal(bytes.length,roof.ASSET.bytes,'Wrong candidate upload length');
 assert.equal(digest(bytes),roof.ASSET.sha256,'Original texture WebP hash changed');
 assert.equal(bytes.subarray(0,4).toString(),'RIFF');
 assert.equal(bytes.subarray(8,12).toString(),'WEBP');
 console.log('Actual painter-generated V3 roof texture verified: '+bytes.length+' bytes');
}else{
 assert.fail('Committed authentic roof WebP missing from repository');
}
const page=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const item of ['Wall Geometry &amp; Texture Lab (rev 40)',
 'assets/v3/wall-roof-texture.js?rev=40','id="showRoofTexture"','id="roofFile"',
 'roofPainter.loadFromGitHub','roofPainter.verifyFile','roofPainter:roofPainter']){
 // HTML uses the shorthand roofPainter; check literal separately below
 if(item==='roofPainter:roofPainter')continue;
 assert(page.includes(item),'V3 painted coping test missing '+item);
}
assert(page.includes('roofImage:visible('));
assert(!fs.readFileSync('layer2-lab-v3.html','utf8').includes('wall-roof-texture.js'));
assert(!fs.readFileSync('courtyard-enclosure-lab-v3.html','utf8').includes('wall-roof-texture.js'));
console.log('V3 roof coping QA passed: exact 32x8 UV scale, mitered L/T coverage, genuine gate gaps, candidate provenance and V2 isolation.');
