'use strict';
const assert=require('node:assert/strict');
const topology=require('../tile-topology.js');
const scoring=require('../scoring-tile-spec.cjs');
const audit=scoring.auditStarter();
assert(audit.valid);
assert.equal(audit.report.length,6);
const starters=topology.starter;
const at=(x,y)=>starters.find(t=>t.x===x&&t.y===y);
const outer=[];
for(const t of starters)for(let i=0;i<4;i++){
 const [dx,dy]=topology.directions[i];
 if(!at(t.x+dx,t.y+dy))outer.push(t.edges[i]);
}
assert.equal(outer.length,10);
assert.equal(outer.filter(e=>e==='L').length,8);
assert.equal(outer.filter(e=>e==='W').length,2);
assert.equal(outer.filter(e=>e==='S').length,0);
assert.deepEqual(at(0,1).edges,['L','S','L','L']);
assert.deepEqual(at(1,1).edges,['W','S','W','S']);
assert.deepEqual(at(2,1).edges,['L','L','L','S']);
assert.equal(scoring.makeSpec(at(0,1)).routes[0].ports.join(','),'1');
assert.equal(scoring.makeSpec(at(2,1)).routes[0].ports.join(','),'3');
assert.equal(scoring.makeSpec(at(1,1)).routes.length,2);

for(const tile of topology.starter)assert.deepEqual(scoring.validate(tile,scoring.makeSpec(tile)),[]);
for(const arch of topology.archetypes){
 const tile={...arch,fixed:false};
 const spec=scoring.makeSpec(tile);
 assert.deepEqual(scoring.validate(tile,spec),[],arch.name);
 for(let rotation=0;rotation<4;rotation++){
   const rotated={...tile,edges:topology.rotateEdges(tile.edges,rotation)};
   assert.deepEqual(scoring.validate(rotated,scoring.rotatedSpec(tile,rotation)),[],arch.name+' rotation '+rotation);
 }
}
const bridge=scoring.makeSpec(topology.starter.find(t=>t.kind==='five'));
assert.equal(bridge.routes.length,2);
assert.notEqual(bridge.routes[0].type,bridge.routes[1].type);
const bad={...topology.starter[0],edges:['S','L','S','L']};
assert(scoring.validate(bad,{routes:[{type:'street',ports:[0]}],features:[]}).length>0);
console.log('Scoring-aware tile contract passed: six fixed starters, thirteen archetypes, four rotations and bridge isolation');
