'use strict';
// Regression for the persistent grass strip beneath the vertical roof at
// the OUTER ends of the southern courtyard wall (rev42 screenshot).
// The plaster/stone must reach x=38 / x=182 (not x=42 / x=178).
// Gate ends remain at x=95 / x=125 and must not be extended.
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
 assert.equal(face.cornerReveal,-profile.COPING_HALF,
  'Bottom facade must extend by the roof half-width at true corner joins');
 const delta=Math.sign(face.sourceB[0]-face.sourceA[0]);
 assert.notEqual(face.cornerStart,face.cornerEnd,
  'Each south-wall run has one actual L corner and one open moon-gate end');
 if(face.cornerStart){
  assert(Math.abs(face.a[0]-(face.sourceA[0]-4*delta))<EPS);
  assert(equal(face.b,face.sourceB),'Moon-gate jamb remains unextended');
 }else{
  assert(equal(face.a,face.sourceA),'Moon-gate jamb remains unextended');
  assert(Math.abs(face.b[0]-(face.sourceB[0]+4*delta))<EPS);
 }
 const x0=Math.min(face.a[0],face.b[0]),x1=Math.max(face.a[0],face.b[0]);
 assert.equal(face.a[1],178);
 assert.equal(face.b[1],178);
 assert(inside(face.face,[(x0+x1)/2,186]));
 assert(inside(face.base,[(x0+x1)/2,191]));
}
for(const corner of cornerPoints){
 const outward=corner[0]<110?-profile.COPING_HALF:profile.COPING_HALF;
 const outer=[corner[0]+outward,corner[1]];
 assert(south.some(f=>equal(f.a,outer)||equal(f.b,outer)),
  'South plaster and stone must meet the outer vertical roof edge '+outer);
 const dx=corner[0]<110?.8:-.8;
 const plaster=[outer[0]+dx,186],stone=[outer[0]+dx,191];
 assert(south.some(f=>inside(f.face,plaster)),
  'Original ivory plaster must continue into the formerly open 4-unit roof-half strip '+outer);
 assert(south.some(f=>inside(f.base,stone)),
  'Original stone foundation must continue into the formerly open roof-half strip '+outer);
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
for(const pt of [[37,186],[183,186],[37,191],[183,191]]){
 assert(!south.some(f=>inside(f.face,pt)||inside(f.base,pt)),
  'Do not add oversized white blocks beyond the actual courtyard corner '+pt);
}
assert.equal(compiled.gates.length,1);
assert.equal(compiled.gates[0].width,30);
assert.equal(compiled.gates[0].walkThroughWidth,14);
assert.equal(profile.cornerFills(compiled,rectangle.hall).length,4);
assert(form.cornerJoins.every(j=>j.artificialPier===false&&j.southFacadeReveal===-profile.COPING_HALF));
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
assert(html.includes('Courtyard Paving &amp; Wall Texture Lab (rev 44)'));
assert(html.includes('assets/v3/wall-profile.js?rev=44'));
for(const key of ['showPlasterTexture','showStoneTexture','showPerspective','cornerNW','cornerNE','cornerSW','cornerSE'])
 assert(html.includes('id="'+key+'"'));
assert(!fs.readFileSync('layer2-lab-v3.html','utf8').includes('wall-profile.js'));
assert(!fs.readFileSync('courtyard-enclosure-lab-v3.html','utf8').includes('wall-profile.js'));
console.log('V3 rev43 end-cap QA passed: SW+SE plaster/stone now reach x=38/x=182 outer eaves, untouched moon-gate jambs x=95/125, north reveal and roof/hashes unchanged.');
