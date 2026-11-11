'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const topology=require('../tile-topology.js');
const v3=require('../assets/v3/base-geometry.js');
const spec=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/v3/style-spec.json'),'utf8'));
assert.equal(spec.status,'proposed-unapproved');
assert.equal(spec.approval.artwork,'unapproved');
assert.equal(spec.layers.length,4);
assert.deepEqual(spec.portWidthWorldUnits,{L:0,S:44,W:88});
assert.equal(v3.size,220);
assert.equal(v3.signatures.length,20,'Eight base families yield precisely 20 unique signatures');
assert.equal(new Set(v3.signatures).size,20);
assert(v3.signatures.includes('SWSW')&&v3.signatures.includes('WWWL')&&v3.signatures.includes('WLWW'));
for(const signature of v3.signatures){
 const edges=signature.split(''),g=v3.compile(edges);
 assert.deepEqual(g.edges,edges);
 for(let side=0;side<4;side++){
  const p=g.exits[side],w=topology.portWidth[edges[side]];
  assert.equal(p.type,edges[side]);assert.equal(p.width,w);
  assert.equal(p.start,110-w/2);assert.equal(p.end,110+w/2);
  assert.equal(p.end-p.start,w);
  assert.equal(p.centre[side%2===0?0:1],110,'Ports on N/S or E/W are exactly centred');
  assert.equal(p.centre[side%2===0?1:0],side===0||side===3?0:220,'Exit lies on the correct edge');
 }
 for(const type of ['W','S']){
  const sides=edges.map((e,i)=>e===type?i:-1).filter(x=>x>=0);
  const routes=g.paths.filter(p=>p.type===type);
  assert.equal(routes.length,sides.length<=2?(sides.length?1:0):sides.length);
  assert(routes.every(p=>p.width===topology.portWidth[type]));
  for(const side of sides)assert(routes.some(r=>r.sides.includes(side)),type+' must reach exit '+side);
  if(sides.length===2&&((sides[0]+2)%4!==sides[1])){
   assert.equal(routes[0].kind,'quadratic','Bends use edge-perpendicular quadratic tangents');
   assert.deepEqual(routes[0].control,[110,110]);
  }
  if(sides.length>=3)assert(routes.every(p=>p.end[0]===110&&p.end[1]===110),'All junction arms meet');
 }
 // The edge aperture contract is independent of the layout's decorative seed.
 for(let i=0;i<4;i++){
  const neighbour=v3.compile(topology.rotateEdges(['L','L','L','L'],0).map((_,j)=>j===(i+2)%4?edges[i]:'L'));
  assert.equal(g.exits[i].start,neighbour.exits[(i+2)%4].start);
  assert.equal(g.exits[i].end,neighbour.exits[(i+2)%4].end);
 }
}
const bridge=v3.compile('SWSW'.split(''));
assert.equal(bridge.bridge,true);
assert.equal(bridge.paths.filter(x=>x.type==='W').length,1);
assert.equal(bridge.paths.filter(x=>x.type==='S').length,1);
const junction=v3.compile('WWWL'.split(''));
assert.equal(junction.paths.length,3);
assert.equal(junction.exits[3].width,0);
assert.throws(()=>v3.compile(['X','L','L','L']));
assert(spec.materials.every(m=>m.state==='awaiting-texture'&&m.image===null),'Never pass placeholder colours as final textures');
console.log('V3 geometry contracts passed: 20 signatures, exact 20%/40% centred ports, connected bends/junctions, bridge separation, honest materials.');
