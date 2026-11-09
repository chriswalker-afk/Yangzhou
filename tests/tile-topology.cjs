/* Independent topology tests, without canvas or a browser. */
'use strict';
const assert=require('node:assert/strict');
const model=require('../tile-topology.js');
const {starter,archetypes,size,center,portWidth,rotateEdges,validateBoard}=model;

assert.equal(size,220);
assert.equal(center,110);
assert.deepEqual(portWidth,{L:0,S:44,W:88});
assert.equal(starter.length,6);
assert.equal(new Set(starter.map(t=>t.master)).size,6);
assert(starter.every(t=>t.fixed),'Every starter tile must be fixed');
assert.deepEqual(starter.map(t=>[t.x,t.y]),[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]);
assert.deepEqual(validateBoard(starter),[],'Starting six tiles must match across all internal seams');
assert.equal(archetypes.length,13);
for(const t of [...starter,...archetypes]){
  assert.equal(t.edges.length,4,t.name);
  assert(t.edges.every(e=>['L','S','W'].includes(e)),t.name);
  for(let r=0;r<8;r++){
    const rotated=rotateEdges(t.edges,r);
    assert.deepEqual(rotated,rotateEdges(t.edges,r%4),t.name);
    assert.deepEqual(rotateEdges(rotated,4-r%4),t.edges,t.name);
  }
}
assert.deepEqual(rotateEdges(['S','L','W','L'],1),['L','S','L','W']);
assert.deepEqual(rotateEdges(['S','L','W','L'],3),['L','W','L','S']);
assert.throws(()=>rotateEdges(['L','L']),/requires/);
assert.throws(()=>rotateEdges(['L','X','L','L']),/requires/);

const broken=starter.map(t=>({...t,edges:[...t.edges]}));
broken[1].edges[3]='S';
assert(validateBoard(broken).some(e=>e.includes('Edge mismatch')));
const duplicated=starter.concat(starter[0]);
assert(validateBoard(duplicated).some(e=>e.includes('Duplicate')));
const directions=[[0,-1],[1,0],[0,1],[-1,0]];
const board=new Map(starter.map(t=>[t.x+','+t.y,t]));
const perimeter=new Map();
for(const t of starter)for(const [index,[dx,dy]] of directions.entries()){
  const x=t.x+dx,y=t.y+dy,k=x+','+y;
  if(!board.has(k))perimeter.set(k,{x,y,side:index,expected:t.edges[index]});
}
assert.equal(perimeter.size,10,'Six-tile starter has ten external neighbours');
function compatible(x,y,edges){
  if(board.has(x+','+y))return false;
  let touching=false;
  for(let i=0;i<4;i++){
    const n=board.get((x+directions[i][0])+','+(y+directions[i][1]));
    if(n){touching=true;if(n.edges[(i+2)%4]!==edges[i])return false;}
  }
  return touching;
}
const preferred={S:'Stone-paved street',W:'Mooring basin',L:'Garden pavilion'};
for(const cell of [...perimeter.values()].sort((a,b)=>a.y-b.y||a.x-b.x)){
  const choices=archetypes.flatMap(arch=>[0,1,2,3].flatMap(r=>{
    const edges=rotateEdges(arch.edges,r);
    return compatible(cell.x,cell.y,edges)?[{arch,edges,r}]:[];
  }));
  assert(choices.length>0,'No archetype fits '+cell.x+','+cell.y);
  const choice=choices.find(o=>o.arch.name===preferred[cell.expected]);
  assert(choice,'No preferred tile fits '+cell.x+','+cell.y);
  board.set(cell.x+','+cell.y,{x:cell.x,y:cell.y,...choice.arch,edges:choice.edges});
}
assert.equal(board.size,16,'All perimeter slots can be filled together');
assert.deepEqual(validateBoard(board.values()),[]);
console.log('Topology tests passed: all rotations, 6 independent masters, centred ports, 13 archetypes and 10-tile expansion.');
