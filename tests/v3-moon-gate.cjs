'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const walls=require('../assets/v3/wall-geometry.js');
const profile=require('../assets/v3/wall-profile.js');
const gatePainter=require('../assets/v3/moon-gate-frame.js');
const tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
const asset=gatePainter.ASSET;
assert.equal(asset.id,'moon-gate-01');
const original=fs.readFileSync(asset.path);
assert.equal(original.length,asset.bytes,'The original 1.2 MB painted gate is untouched');
assert.equal(crypto.createHash('sha256').update(original).digest('hex'),asset.sha256,
 'The original painted Moon Gate 01 is exact, not a fabricated replacement');
const calls=[];
const ctx={
 save(){},restore(){},drawImage(...args){calls.push(args)},
 beginPath(){throw Error('No vector semicircles are allowed')},
 arc(){throw Error('Do not draw fake circular gate lines')},
 fill(){throw Error('Do not paint a synthetic gate face')},
 stroke(){throw Error('Do not paint synthetic gate outlines')}
};
const image={naturalWidth:asset.width,naturalHeight:asset.height};
for(const model of Object.values(walls.templates)){
 const compiled=walls.compile(model);
 const before=compiled.gates.map(g=>[g.center,g.width,g.start,g.end,walls.isSolid(compiled,g.center)]);
 const expected=compiled.gates.filter(g=>Math.abs(g.tangent[1])<1e-7).length;
 calls.length=0;
 const painted=gatePainter.draw(ctx,compiled,tile,{hall:model.hall,image});
 assert.equal(painted,expected);
 assert.equal(calls.length,expected);
 for(const g of compiled.gates){
  const f=gatePainter.frame(g,model.hall);
  assert.equal(f.physicalOpeningWidth,g.width);
  assert.equal(f.clearWidth,g.walkThroughWidth);
  assert(f.visualOnly&&f.collisionFree);
  assert(Math.abs(f.width/f.height-asset.width/asset.height)<1e-8,
   'Never stretch earlier painting out of aspect');
  assert.equal(walls.isSolid(compiled,g.center),false,'Opening must stay physically empty');
  assert(f.width>g.width,'Painted pier ends must overlap the physical wall ends');
 }
 assert.deepEqual(compiled.gates.map(g=>[g.center,g.width,g.start,g.end,walls.isSolid(compiled,g.center)]),before);
 assert(walls.audit(model,tile,{profilePainter:profile}).valid);
}
const rectangle=walls.compile(walls.templates.rectangle);
assert.equal(gatePainter.draw(ctx,rectangle,tile,{image,showDetail:false}),0);
assert.equal(gatePainter.draw(ctx,rectangle,tile,{}),0,
 'No fake vector art when authentic moon gate is unavailable');
const html=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const expected of ['id="showMoonGate" checked',
 'assets/v3/moon-gate-frame.js?rev=45',
 'moonGatePainter:visible(\'showMoonGate\')?moonGate:null',
 'moonGateImage,','id="moonGateClose"','id="moonGateStatus"',
 'loadMoonGate();'])assert(html.includes(expected),expected);
const wallSource=fs.readFileSync('assets/v3/wall-geometry.js','utf8');
assert(wallSource.includes('image:options.moonGateImage'));
assert(wallSource.indexOf('options.moonGatePainter.draw(ctx,compiled,tile')<
 wallSource.indexOf('if(options.showGates!==false)'));
console.log('Moon Gate 01 exact original artwork, non-stretched 2:1 projection, real passable gate and Layer 1/Layer 2 topology confirmed.');
