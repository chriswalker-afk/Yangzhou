'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const topology=require('../tile-topology.js');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/v2/manifest.json'),'utf8'));
const SIZE=220;
assert.equal(topology.size,SIZE);
assert.deepEqual(topology.portWidth,{L:0,S:44,W:88});
assert.equal(topology.archetypes.length,8,'V2 must begin with only eight art families');
assert.equal(topology.starter.length,6);
assert.equal(new Set(topology.starter.map(t=>t.artId)).size,6);
assert.deepEqual(topology.validateBoard(topology.starter),[]);
assert.equal(data.status,'composition-study','Studies must not claim painterly approval');
assert.equal(data.tiles.length,8);
for(let i=0;i<8;i++){
 const t=topology.archetypes[i],m=data.tiles[i];
 assert.equal(m.id,t.id);assert.equal(m.edges,t.edges.join(''));
 assert.equal(m.variants.length,4);
 for(let r=0;r<4;r++){
  const expected=topology.rotateEdges(t.edges,r);
  assert.equal(m.variants[r].edges,expected.join(''));
  assert.equal(m.variants[r].artwork,null,'No binary master is in the repository: never claim otherwise');
  if(t.id==='street-straight'&&r===1){
    assert.equal(m.variants[r].status,'pilot-review-needs-repository-master');
    assert.equal(m.variants[r].sourceFilename,'watercolor_courtyards_along_yangzhou_street.png');
    assert.equal(m.variants[r].edges,'LSLS','East-west painting must not be attached to north-south ports');
  }else{
    assert.equal(m.variants[r].status,'needs-independent-painting');
  }
  assert.deepEqual(topology.rotateEdges(expected,4-r),t.edges);
 }
}
// A complete ten-tile ring, not just ten independently legal choices.
const D=[[0,-1],[1,0],[0,1],[-1,0]];
const choices=[
 [-1,0,'street-straight',0],[-1,1,'street-straight',0],
 [3,0,'street-straight',0],[3,1,'street-straight',0],
 [0,-1,'street-bend',3],[1,-1,'canal-straight',0],[2,-1,'street-bend',0],
 [0,2,'street-bend',2],[1,2,'canal-straight',0],[2,2,'street-bend',1]
];
const ring=choices.map(([x,y,id,rotation])=>{
 const base=topology.archetypes.find(t=>t.id===id);
 assert(base,'Unknown v2 tile '+id);
 return {x,y,id,rotation,edges:topology.rotateEdges(base.edges,rotation),kind:base.kind};
});
const whole=[...topology.starter,...ring];
assert.equal(whole.length,16);
const unique=new Set(whole.map(t=>t.x+','+t.y));
assert.equal(unique.size,16);
assert.deepEqual(topology.validateBoard(whole),[]);
let perimeter=new Set();
for(const t of topology.starter)for(const d of D){
 const k=(t.x+d[0])+','+(t.y+d[1]);
 if(!topology.starter.some(s=>s.x===t.x+d[0]&&s.y===t.y+d[1]))perimeter.add(k);
}
assert.equal(perimeter.size,10);
for(const p of ring)assert(perimeter.has(p.x+','+p.y));
const exposed=[];
for(const t of topology.starter)for(let i=0;i<4;i++){
 const d=D[i],s=topology.starter.find(s=>s.x===t.x+d[0]&&s.y===t.y+d[1]);
 if(!s)exposed.push(t.edges[i]);
}
assert.equal(exposed.filter(x=>x==='L').length,8);
assert.equal(exposed.filter(x=>x==='W').length,2);
assert.equal(exposed.filter(x=>x==='S').length,0);
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const lab=fs.readFileSync(path.join(__dirname,'../tile-lab-v2.html'),'utf8');
assert(html.includes('tile-art-v2.js'));
assert(html.includes('tile-topology.js'));
assert(html.includes('id:a.id,rotation:state.rotation'),'Tile placement must retain artwork identity and orientation');
assert(lab.includes('Strict')||lab.includes('strict'));
const pilot=fs.readFileSync(path.join(__dirname,'../street-pilot-review.html'),'utf8');
assert(pilot.includes("registerReviewImage(key,im)"),'Pilot inspector must render the real user-provided pixels');
assert(pilot.includes("const tiles=[tile(0,0),tile(1,0),tile(2,0)]"),'Three-square seam inspection is required');
assert(pilot.includes('LSLS'),'Original east-west connection must be explicit');
assert(html.includes('id="pilotUpload"')&&html.includes('street-pilot-review.html'),'Playable camera needs an obvious pilot preview path');
for(const name of ['tile-system.js','painted-lake.js','painted-assets.js','orthographic-lake.js','living-scene.js']){
 assert(!html.includes('<script src="'+name+'"'),'Retired artist still loads: '+name);
}
console.log('V2 tile contract passed: eight families / 32 study orientations / strict 16-square ring / no active legacy art.');
