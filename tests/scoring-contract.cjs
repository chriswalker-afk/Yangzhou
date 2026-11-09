'use strict';
const assert=require('node:assert/strict');
const topology=require('../tile-topology.js');
const scoring=require('../scoring-tile-spec.cjs');
const audit=scoring.auditStarter();
assert(audit.valid);
assert.equal(audit.report.length,6);
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
