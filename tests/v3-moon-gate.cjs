'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const walls=require('../assets/v3/wall-geometry.js');
const profile=require('../assets/v3/wall-profile.js');
const gatePainter=require('../assets/v3/moon-gate-frame.js');
const tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
let recorded=[];
const ctx={
 save(){},restore(){},beginPath(){recorded.push('begin')},arc(...args){recorded.push(['arc',...args])},
 moveTo(){},lineTo(){},stroke(){recorded.push('stroke')},fill(){},
 closePath(){},setLineDash(){},createLinearGradient(){return {addColorStop(){}}}
};
for(const model of Object.values(walls.templates)){
 const compiled=walls.compile(model);
 const before=compiled.gates.map(g=>[g.center,g.width,g.start,g.end,walls.isSolid(compiled,g.center)]);
 recorded=[];
 const painted=gatePainter.draw(ctx,compiled,tile,{hall:model.hall});
 assert.equal(painted,compiled.gates.filter(g=>Math.abs(g.tangent[1])<1e-7).length);
 for(const gate of compiled.gates){
  const f=gatePainter.frame(gate,model.hall);
  assert.equal(f.width,gate.width);
  assert(f.decorativeOnly&&f.collisionFree);
  assert.equal(walls.isSolid(compiled,gate.center),false,'Opening must stay physically empty');
 }
 assert.deepEqual(compiled.gates.map(g=>[g.center,g.width,g.start,g.end,walls.isSolid(compiled,g.center)]),before);
 assert(walls.audit(model,tile,{profilePainter:profile}).valid);
}
assert.equal(gatePainter.draw(ctx,walls.compile(walls.templates.rectangle),tile,
 {hall:walls.templates.rectangle.hall,showDetail:false}),0);
const html=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
assert(html.includes('id="showMoonGate" checked'));
assert(html.includes('assets/v3/moon-gate-frame.js?rev=45'));
assert(html.includes("moonGatePainter:visible('showMoonGate')?moonGate:null"));
assert(html.includes("'showPaving','showMoonGate'"));
const wallSource=fs.readFileSync('assets/v3/wall-geometry.js','utf8');
assert(wallSource.includes('options.moonGatePainter.draw(ctx,compiled,tile'));
assert(wallSource.indexOf('options.moonGatePainter.draw(ctx,compiled,tile')<
 wallSource.indexOf('if(options.showGates!==false)'));
console.log('Moon gate: arched rim only, authentic passable void and exact Layer 1/Layer 2 collision geometry preserved.');
