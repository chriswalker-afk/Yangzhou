'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const moon=require('../assets/v3/moon-gate-frame.js');
const walls=require('../assets/v3/wall-geometry.js');
const walkway=require('../assets/v3/courtyard-walkway.js');
const paving=require('../assets/v3/courtyard-paving.js');
const tile={x:0,y:0,seed:1,edges:['L','L','L','L']};
const rectangle=walls.templates.rectangle,partial=walls.templates.partial;
const rect=walls.compile(rectangle),north=walls.compile(partial);
const rectGate=rect.gates[0],northGate=north.gates[0];
const image={naturalWidth:1448,naturalHeight:721};
const walkwayImage={naturalWidth:480,naturalHeight:800};
const pavingImage={width:1254,height:1254};
const original=fs.readFileSync(moon.ASSET.path);
assert.equal(crypto.createHash('sha256').update(original).digest('hex'),moon.ASSET.sha256);
const savedPaving=fs.readFileSync(paving.ASSET.path);
assert.equal(crypto.createHash('sha256').update(savedPaving).digest('hex'),paving.ASSET.sha256);
const savedWalkway=fs.readFileSync(walkway.ASSET.path);
assert.equal(crypto.createHash('sha256').update(savedWalkway).digest('hex'),walkway.ASSET.sha256);
const ground=(model,{useWalkway=true,usePaving=true}={})=>({
 model,walkwayPainter:walkway,walkwayImage:useWalkway?walkwayImage:null,
 pavingPainter:paving,pavingImage:usePaving?pavingImage:null
});
function context(){
 const calls=[];
 const ctx={
  save(){calls.push(['save'])},restore(){calls.push(['restore'])},
  beginPath(){calls.push(['begin'])},
  ellipse(...values){calls.push(['ellipse',...values])},
  clip(){calls.push(['clip'])},
  drawImage(...args){calls.push(['drawImage',...args])}
 };
 return {ctx,calls};
}
const frame=moon.frame(rectGate,rectangle.hall);
const aperture=moon.apertureFor(frame);
assert.equal(frame.width,40);
assert(Math.abs(aperture.cx-110)<1e-8);
assert(aperture.cy>rectGate.center[1]+3,'South portal is south of physical wall centreline');
assert(aperture.cy+aperture.ry<193,'Mask stays above existing threshold');
assert(aperture.rx<7&&aperture.ry<6,'Clip lies inside stone ring');
assert(aperture.source.includes('original-painting'));
const nFrame=moon.frame(northGate,partial.hall);
const nAperture=moon.apertureFor(nFrame);
assert(nAperture.cy>northGate.center[1],
 'Far/north gate has its own projected architectural aperture');
assert.equal(moon.groundFor(rectGate,rect,ground(rectangle)).source,'walkway-01');
assert.equal(moon.groundFor(rectGate,rect,ground(rectangle,{useWalkway:false})).source,
 'courtyard-paving-01');
assert.equal(moon.groundFor(rectGate,rect,ground(rectangle,{useWalkway:false,usePaving:false})).source,
 'existing-ground');
assert.equal(moon.groundFor(northGate,north,ground(partial)).source,'walkway-01');
assert.equal(moon.groundFor(northGate,north,ground(partial,{useWalkway:false})).source,
 'existing-ground','Open north garden has no fabricated full courtyard paving');
assert.equal(moon.groundFor(rectGate,rect,ground(walls.templates.elbow)).source,
 'existing-ground','No fictional access path in L-shaped model');
{
 const {ctx,calls}=context();
 assert.equal(moon.draw(ctx,rect,tile,{hall:rectangle.hall,image,ground:ground(rectangle)}),1);
 const floor=calls.filter(x=>x[0]==='drawImage'&&x[1]===walkwayImage);
 const art=calls.filter(x=>x[0]==='drawImage'&&x[1]===image);
 assert(floor.length>0&&art.length===1,'Real walkway is painted under original gate image');
 assert(calls.some(x=>x[0]==='ellipse')&&calls.some(x=>x[0]==='clip'),
  'Floor is clipped strictly within original circular aperture');
 assert(calls.indexOf(floor[0])<calls.indexOf(art[0]),'Original masonry must occlude floor');
 for(const call of floor){
  const [kind,img,x,y,width,height]=call;
  assert.equal(kind,'drawImage');assert.equal(img,walkwayImage);
  assert(width>=12&&width<15&&height===20,
   'Only the visual aperture may widen slightly; original path is 12 units');
  assert(y<aperture.cy+aperture.ry&&y+20>aperture.cy-aperture.ry);
 }
}
{
 const {ctx,calls}=context();
 moon.draw(ctx,rect,tile,{hall:rectangle.hall,image,
  ground:ground(rectangle,{useWalkway:false})});
 const fills=calls.filter(c=>c[0]==='drawImage'&&c[1]===pavingImage);
 assert(fills.length>0);
 assert(fills.every(c=>c[2]%96===0&&c[3]%96===0&&c[4]===96&&c[5]===96),
  'The visible paving uses exactly the original world-space pattern');
}
{
 const {ctx,calls}=context();
 moon.draw(ctx,rect,tile,{hall:rectangle.hall,image,
  ground:ground(rectangle,{useWalkway:false,usePaving:false})});
 assert.equal(calls.some(x=>x[0]==='ellipse'),false,
  'With neither real material, leave genuine underlying grass visible');
 assert.equal(calls.filter(x=>x[0]==='drawImage').length,1,
  'Only original artwork is painted when no source ground is available');
}
{
 const {ctx,calls}=context();
 moon.draw(ctx,rect,tile,{hall:rectangle.hall,image,ground:ground(rectangle),
  showGround:false});
 assert(!calls.some(x=>x[0]==='ellipse'),'Diagnostic toggle disables view projection');
 assert.equal(calls.filter(x=>x[0]==='drawImage').length,1);
}
const before=rect.gates.map(g=>[g.start,g.end,g.width,g.walkThroughWidth]);
assert(!walls.isSolid(rect,rectGate.center));
assert(!walls.isSolid(north,northGate.center));
assert.deepEqual(rect.gates.map(g=>[g.start,g.end,g.width,g.walkThroughWidth]),before);
assert(walls.audit(rectangle,tile).valid);
for(const code of [['L','S','L','S'],['L','W','L','W']])
 assert(!walls.audit(rectangle,{...tile,edges:code}).valid,
  'Layer 1 road/canal rejection is unchanged');
const html=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const s of ['id="showGateGround" checked','moonGateGround:gateGround(model)',
 'showMoonGateGround:visible(\'showGateGround\')','id="moonGateNorthClose"',
 'moonGateGround:{','assets/v3/moon-gate-frame.js?rev=47']){
 assert(html.includes(s),'Missing real floor-through-door integration '+s);
}
assert(!fs.readFileSync('index.html','utf8').includes('moonGateGround'),
 'No changes to playable V2 image or collisions');
console.log('V3 rev47 portal material contract: real 30-unit opening, genuine painted walkway/paving visible through the original arch only; no outside paint or geometry changes.');
