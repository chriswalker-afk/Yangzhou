'use strict';
// Regression for the exact missing texture at the OUTER ends of the southern
// courtyard wall (as seen in the rev41 user screenshot). Gate ends were
// already intact; rev42 must not accidentally crop them or close the gate.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const wall=require('../assets/v3/wall-geometry.js');
const profile=require('../assets/v3/wall-profile.js');
const materials=require('../assets/v3/wall-face-materials.js');
const roof=require('../assets/v3/wall-roof-texture.js');
const rectangle=wall.templates.rectangle;
const compiled=wall.compile(rectangle);
const form=profile.build(compiled,rectangle.hall);
const EPS=1e-8;
const equal=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<EPS;
function inside(poly,pt){
 if(!poly)return false;
 let flag=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];
  if((a[1]>pt[1])!==(b[1]>pt[1])&&
   pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])
   flag=!flag;
 }
 return flag;
}
const north=form.faces.filter(f=>f.hasFacade&&f.location==='north');
const south=form.faces.filter(f=>f.hasFacade&&f.location==='south');
assert.equal(north.length,1,'Far wall is one continuous horizontal run');
assert.equal(south.length,2,'Moon gate still splits near wall into exactly two runs');
const northFace=north[0];
assert.equal(northFace.cornerReveal,3.75);
assert(northFace.cornerStart&&northFace.cornerEnd);
assert(!equal(northFace.a,northFace.sourceA)&&
 !equal(northFace.b,northFace.sourceB),
 'Far wall remains tucked beneath roof at true L corners');
const cornerPoints=[[42,178],[178,178]];
const gatePoints=[[95,178],[125,178]];
for(const face of south){
 assert.equal(face.cornerReveal,0,'Bottom facade must have zero corner trim');
 assert(equal(face.a,face.sourceA)&&equal(face.b,face.sourceB),
  'Both the plaster and stone material quads must reach the original end');
 const x0=Math.min(face.a[0],face.b[0]),x1=Math.max(face.a[0],face.b[0]);
 assert.equal(face.a[1],178);
 assert.equal(face.b[1],178);
 assert(inside(face.face,[(x0+x1)/2,186]));
 assert(inside(face.base,[(x0+x1)/2,191]));
}
for(const corner of cornerPoints){
 assert(south.some(f=>equal(f.a,corner)||equal(f.b,corner)),
  'South plaster and stone must reach the true roof-owned corner '+corner);
 const dx=corner[0]<110?.8:-.8;
 const plaster=[corner[0]+dx,186],stone=[corner[0]+dx,191];
 assert(south.some(f=>inside(f.face,plaster)),
  'Ivory plaster must reach within 0.8 units of the outside '+corner);
 assert(south.some(f=>inside(f.base,stone)),
  'Stone base must reach within 0.8 units of the outside '+corner);
}
for(const cap of gatePoints){
 assert(south.some(f=>equal(f.a,cap)||equal(f.b,cap)),
  'Original open-wall moon-gate jamb cannot be trimmed '+cap);
 const dx=cap[0]<110?-.8:.8;
 assert(south.some(f=>inside(f.face,[cap[0]+dx,186])),
  'Plaster must reach each opening-adjacent jamb '+cap);
 assert(south.some(f=>inside(f.base,[cap[0]+dx,191])),
  'Stone must reach each opening-adjacent jamb '+cap);
}
for(const pt of [[110,178],[110,186],[110,191],[110,194]]){
 assert(!south.some(f=>inside(f.face,pt)||inside(f.base,pt)),
  'Real moon-gate aperture remains an empty gap: '+pt);
}
for(const pt of [[41,186],[179,186],[41,191],[179,191]]){
 assert(!south.some(f=>inside(f.face,pt)||inside(f.base,pt)),
  'Do not add oversized white blocks beyond the actual courtyard corner '+pt);
}
assert.equal(compiled.gates.length,1);
assert.equal(compiled.gates[0].width,30);
assert.equal(compiled.gates[0].walkThroughWidth,14);
assert.equal(profile.cornerFills(compiled,rectangle.hall).length,4);
assert(form.cornerJoins.every(j=>j.artificialPier===false&&j.southFacadeReveal===0));
assert(form.faces.filter(f=>f.axis==='vertical').every(f=>!f.hasFacade&&!f.face&&!f.base),
 'Vertical sides must remain roof and narrow eave only');
for(const m of Object.values(wall.templates)){
 const tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
 assert(wall.audit(m,tile,{profilePainter:profile}).valid,
  'No route or tile footprint regressions: '+m.id);
 assert.deepEqual(wall.audit(m,tile,{profilePainter:profile}),
  wall.audit(m,{...tile,x:7,y:-9},{profilePainter:profile}));
}
for(const edges of [['L','W','L','W'],['L','S','L','S']]){
 assert(!wall.audit(rectangle,{x:0,y:0,edges,seed:1},{profilePainter:profile}).valid,
  'The extension must never cross existing canal or road masks');
}
assert.equal(roof.ASSET.sha256,
 '8a3a7abeb08c4e34bb0134c9a39ba301000435bed5d3c63ccad3bd7a949e578a');
const manifest=JSON.parse(fs.readFileSync('assets/v3/wall-materials/manifest.json','utf8'));
assert.equal(manifest.prepared.sha256,roof.ASSET.sha256);
assert.equal(manifest.faceMaterials.plaster.prepared.sha256,materials.ASSETS.plaster.sha256);
assert.equal(manifest.faceMaterials.stone.prepared.sha256,materials.ASSETS.stone.sha256);
const html=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
assert(html.includes('Wall Geometry &amp; Texture Lab (rev 42)'));
assert(html.includes('assets/v3/wall-profile.js?rev=42'));
for(const key of ['showPlasterTexture','showStoneTexture','showPerspective','cornerNW','cornerNE','cornerSW','cornerSE'])
 assert(html.includes('id="'+key+'"'));
assert(!fs.readFileSync('layer2-lab-v3.html','utf8').includes('wall-profile.js'));
assert(!fs.readFileSync('courtyard-enclosure-lab-v3.html','utf8').includes('wall-profile.js'));
console.log('V3 rev42 end-cap QA passed: full SW/SE plaster and stone to outer corners, untrimmed 95/125 moon-gate jambs, north reveal preserved, roof/hashes unchanged and protected Layer 1 routes.');
