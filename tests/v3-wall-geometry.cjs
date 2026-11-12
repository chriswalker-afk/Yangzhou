'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const topology=require('../tile-topology.js');
const base=require('../assets/v3/base-geometry.js');
const layer2=require('../assets/v3/layer2-placements.js');
const walls=require('../assets/v3/wall-geometry.js');
const grass=Object.freeze({x:0,y:0,edges:['L','L','L','L'],seed:1});
assert.equal(walls.TILE,220);
assert.equal(walls.INSET,10);
assert.equal(walls.SAFE_GAP,6);
assert.deepEqual(walls.WIDTHS,{foundation:16,plaster:12,coping:8,ridge:2});
assert.equal(walls.MATERIALS.length,4);
assert(walls.MATERIALS.every(m=>m.state==='temporary-flat-colour'));
const expected={
 rectangle:{l:4,t:0,gates:1,width:30},
 partial:{l:2,t:0,gates:1,width:30},
 elbow:{l:1,t:0,gates:0,width:null},
 tee:{l:0,t:1,gates:1,width:24}
};
for(const [name,model] of Object.entries(walls.templates)){
 const compiled=walls.compile(model),report=walls.audit(model,grass),e=expected[name];
 assert(report.valid,name+' must fit an all-land tile: '+report.issues.join(', '));
 assert.equal(compiled.junctions.filter(j=>j.kind==='L').length,e.l,'L turn count '+name);
 assert.equal(compiled.junctions.filter(j=>j.kind==='T').length,e.t,'T join count '+name);
 assert.equal(compiled.gates.length,e.gates,'Gate count '+name);
 assert(compiled.junctions.every(j=>j.seamGap===0),'No fake gap at '+name+' corners');
 assert.deepEqual(report, walls.audit(model,{...grass,x:39,y:-42}),
  'Tile movement cannot change wall-local placement '+name);
 assert.equal(compiled.ribbons.filter(s=>s.u1<=s.u0).length,0,'Every material UV runs forward');
 for(const section of compiled.ribbons){
  assert(Math.abs(walls.length([section.a,section.b])-(section.u1-section.u0))<1e-7);
  assert.equal(section.slots.length,4);
  assert(Math.abs(section.tangent[0]*section.normal[0]+section.tangent[1]*section.normal[1])<1e-8);
 }
 for(const gate of compiled.gates){
  assert.equal(gate.width,e.width);
  assert(gate.walkThroughWidth>=8);
  assert.equal(walls.isSolid(compiled,gate.center),false,
   'Moon gate centre must be a real HOLE, not paint over a wall');
  const normal=gate.normal;
  for(const d of [-5,-3,0,3,5])
   assert.equal(walls.isSolid(compiled,[gate.center[0]+normal[0]*d,gate.center[1]+normal[1]*d]),false,
    'Open gate needs a traversable perpendicular corridor');
  assert.equal(walls.isSolid(compiled,gate.start),true,'Structural post at gate start');
  assert.equal(walls.isSolid(compiled,gate.end),true,'Structural post at gate end');
 }
}
const rect=walls.compile(walls.templates.rectangle);
assert.equal(rect.paths.length,1,'One continuous perimeter around all four corners');
assert.equal(rect.paths[0].closed,false,'The cut gate is the only open seam in the loop');
const perimeter=walls.length(walls.templates.rectangle.paths[0].points);
const structuralLength=rect.paths.flatMap(p=>p.points.slice(1).map((pt,i)=>
 walls.length([p.points[i],pt]))).reduce((a,b)=>a+b,0);
assert(Math.abs(structuralLength-(perimeter-30))<1e-6,'Moon gate cuts exactly 30 units from the wall');
assert.deepEqual(rect.gates[0].center,[110,178]);
assert(Math.abs(rect.gates[0].normal[0])<1e-9 && rect.gates[0].normal[1]===-1, 'South wall moon-gate normal is north');
assert(!walls.isSolid(rect,[110,178]));
assert(walls.isSolid(rect,[110,47]),'The opposite north wall remains structural');
const tee=walls.compile(walls.templates.tee);
assert.deepEqual(tee.junctions.filter(j=>j.kind==='T').map(j=>j.point),[[110,48]],
 'One exact T-branch endpoint lies on the crossbar centreline');
assert(walls.isSolid(tee,[110,48]),'The T-junction must have no gap');
assert.equal(tee.paths.length,3,'T has two gate-cut beam lengths and one solid branch');
assert.deepEqual(base.compile(['L','S','L','S']).exits.map(e=>e.width),[0,44,0,44]);
assert.deepEqual(base.compile(['L','W','L','W']).exits.map(e=>e.width),[0,88,0,88]);
const road={...grass,edges:['L','S','L','S']},canal={...grass,edges:['L','W','L','W']};
for(const model of [walls.templates.rectangle,walls.templates.partial,walls.templates.elbow]){
 assert(!walls.audit(model,road).valid,model.id+' must not cover connected road');
 assert(!walls.audit(model,canal).valid,model.id+' must not cover connected canal');
}
const gateOnCanal={...walls.templates.rectangle,openings:[{id:'moon-gate',pathId:'perimeter',center:[110,178],width:30}]};
assert(!walls.audit(gateOnCanal,canal).valid,'A real gate must not hide an illegal canal intersection');
for(const signature of base.signatures){
 const tile={...grass,edges:signature.split('')};
 for(const model of Object.values(walls.templates)){
  const result=walls.audit(model,tile);
  if(!result.valid)continue;
  const geom=base.compile(tile.edges);
  for(const line of model.paths)for(let i=1;i<line.points.length;i++){
   const a=line.points[i-1],b=line.points[i],steps=Math.ceil(walls.length([a,b])/2);
   for(let j=0;j<=steps;j++){
    const t=j/steps,pt=[a[0]*(1-t)+b[0]*t,a[1]*(1-t)+b[1]*t];
    for(const route of geom.paths){
     const clearance=route.width/2+(route.type==='W'?4:5)+6+walls.WIDTHS.foundation/2;
     assert(layer2.minRouteDistance(pt,route)>=clearance-1e-6,
      'Accepted wall crossed '+route.type+' route in signature '+signature);
    }
   }
  }
 }
}
const invalid=(opening)=>({...walls.templates.rectangle,openings:[opening]});
assert.throws(()=>walls.compile(invalid({id:'bad',pathId:'perimeter',center:[110,178],width:9})),/genuinely passable/);
assert.throws(()=>walls.compile(invalid({id:'bad',pathId:'perimeter',center:[178,178],width:25})),/corner|endpoint/);
assert.throws(()=>walls.compile(invalid({id:'bad',pathId:'unknown',center:[110,178],width:30})),/unknown wall/);
// Diagnostic draws must have no source imagery or introduced texture swatches.
const strokes=[],mock={
 save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
 setLineDash(){},arc(){},fill(){},
 stroke(){strokes.push({width:this.lineWidth,colour:this.strokeStyle});}
};
const paintResult=walls.draw(mock,walls.templates.rectangle,grass,{showGates:false,showJoints:false});
assert(paintResult.valid&&paintResult.drawn);
assert.deepEqual(strokes.map(v=>v.width),[16,12,8,2]);
assert.equal(strokes.every(s=>typeof s.colour==='string'),true);
const n=strokes.length;
const blocked=walls.draw(mock,walls.templates.rectangle,canal);
assert(!blocked.valid&&!blocked.drawn);
assert.equal(strokes.length,n,'Reject full wall before touching a canal tile');
const scene=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const item of ['Wall Geometry &amp; Texture Lab (rev 37)','assets/v3/wall-geometry.js',
 'id="study"','id="plan"','id="showTextures"','id="showGate"',
 'id="zoom"','id="scene"','CODES','wallModel:choices[selected]','walls.audit(model,tile)',
 'geometry.compile(tile.edges)','edgeSystem.draw(ctx,compiledEdge']){
 assert(scene.includes(item),'Missing separate V3 proof: '+item);
}
assert(!scene.includes('courtyard-enclosures.js'),
 'The new lab must not reuse the old inconsistent wall-sprite architecture');
assert(fs.readFileSync('layer2-lab-v3.html','utf8').includes('rev 29'));
assert(fs.readFileSync('courtyard-enclosure-lab-v3.html','utf8').includes('rev 35'));
assert(fs.existsSync('index.html'));
console.log('V3 continuous-wall QA passed: 4 L, exact T, true 30/24-unit moon-gate cut-outs, 20 topology signatures, no path intrusion, 4 diagnostic material bands and V2 isolation.');
