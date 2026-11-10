'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
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
assert.equal(data.status,'review','One original painted master is under review, not approved');
assert.equal(data.tiles.length,8);
// The new second-original intake stays in a review branch until both original
// full-resolution binaries exist; the production manifest is not falsified.
const intake=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/v2/street-pair-intake.json'),'utf8'));
assert.equal(intake.status,'awaiting-original-binary-upload');
assert.equal(intake.candidates.length,2);
assert.equal(intake.candidates[0].rotation,1);
assert.equal(intake.candidates[1].rotation,3);
assert(intake.candidates.every(c=>c.edges==='LSLS'));
assert.notEqual(intake.candidates[0].sha256,intake.candidates[1].sha256);
const stagedPairPage=fs.readFileSync(path.join(__dirname,'../street-pair-review.html'),'utf8');
assert(stagedPairPage.includes('street-east-west-repaint.png'));
assert(stagedPairPage.includes('street-east-west-neighbour.png'));
assert(stagedPairPage.includes('Review')||stagedPairPage.includes('review'));

let masterCount=0;
for(let i=0;i<8;i++){
 const t=topology.archetypes[i],m=data.tiles[i];
 assert.equal(m.id,t.id);assert.equal(m.edges,t.edges.join(''));
 assert.equal(m.variants.length,4);
 for(let r=0;r<4;r++){
  const expected=topology.rotateEdges(t.edges,r);
  const v=m.variants[r];
  assert.equal(v.edges,expected.join(''));
  if(t.id==='street-straight'&&r===1){
    masterCount++;
    assert.equal(v.status,'review','Imported original is NOT approved');
    assert.equal(v.artwork,'street-straight-east-west.png');
    assert.equal(v.edges,'LSLS','Painting is east-west, not north-south');
    assert.equal(v.sourceFilename,'watercolor_courtyards_along_yangzhou_street.png');
    const p=path.join(__dirname,'../assets/v2/',v.artwork);
    const bytes=fs.readFileSync(p);
    assert.equal(bytes.length,4108283,'Full 4.1MB original must be present (not broken rename or thumbnail)');
    assert.equal(bytes.length,v.bytes);
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Artwork must be a real PNG');
    assert.equal(bytes.readUInt32BE(16),1254);
    assert.equal(bytes.readUInt32BE(20),1254);
    assert.equal(bytes.readUInt32BE(16),v.width);
    assert.equal(bytes.readUInt32BE(20),v.height);
    const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
    assert.equal(sha256,'bc8fc1cf37b0404dc6620385a6167576692e3aee11bbf7346da28edbb158b2c2');
    assert.equal(sha256,v.sha256);
    const gitHeader=Buffer.from('blob '+bytes.length+'\0','utf8');
    const gitBlob=crypto.createHash('sha1').update(gitHeader).update(bytes).digest('hex');
    assert.equal(gitBlob,'39c962c0e6a370a811e7c8535fef20581f14505c');
    assert.equal(gitBlob,v.gitBlobSha);
  }else{
    assert.equal(v.artwork,null,'Every other orientation remains a clearly labelled study');
    assert.equal(v.status,'needs-independent-painting');
  }
  assert.deepEqual(topology.rotateEdges(expected,4-r),t.edges);
 }
}
assert.equal(masterCount,1,'Only one independently painted variant is currently available');
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

// A genuine second original is required for road/street and street/garden joining.
const neighborLab=fs.readFileSync(path.join(__dirname,'../painted-neighbour-lab.html'),'utf8');
const road=topology.archetypes.find(t=>t.id==='street-straight');
const grove=topology.archetypes.find(t=>t.id==='garden-grove');
const paintedRoad=topology.rotateEdges(road.edges,1);
assert.equal(paintedRoad.join(''),'LSLS');
for(const [x,y,edges] of [[1,0,paintedRoad],[-1,0,paintedRoad],[0,-1,grove.edges],[0,1,grove.edges]]){
 assert.deepEqual(topology.validateBoard([
  {x:0,y:0,edges:paintedRoad,id:'street-straight',rotation:1},
  {x,y,edges,id:y===0?'street-straight':'garden-grove',rotation:y===0?1:0}
 ]),[],'Neighbour must have a legal edge for its chosen position');
}
assert(neighborLab.includes('NO INDEPENDENT PAINTING'),'Missing second image must never be shown as finished art');
assert(neighborLab.includes("crypto.subtle.digest('SHA-256',bytes)"),'Second painting must be checked for exact source duplication');
assert(neighborLab.includes('seamMetric(original,neighbor.image,mode)'),'A real two-source seam diagnostic must be calculated');
assert(neighborLab.includes("blockedHashes.has(hash)"),'Original and archived first painting cannot pass as new independent artwork');
assert(neighborLab.includes("getMaster('street-straight:3')"),'The second committed original must autoload in the pair join laboratory');
assert(stagedPairPage.includes('street-east-west-repaint.png')&&stagedPairPage.includes('street-east-west-neighbour.png'),'Both distinct painted masters must appear in the new pair studio');
assert(neighborLab.includes('widthAccepted')&&neighborLab.includes('historicalAccepted'),'Artwork gate must remain a human task');
assert(neighborLab.includes('44 / 220'),'Exact street mouth width must be visible to reviewer');

const pilot=fs.readFileSync(path.join(__dirname,'../street-pilot-review.html'),'utf8');
assert(pilot.includes('useCommittedMaster()'),'Review studio must load the real repository image automatically');
assert(pilot.includes("registerReviewImage(key,im)"),'Pilot inspector must still allow a local revision for comparison');
assert(pilot.includes("const tiles=[tile(0,0),tile(1,0),tile(2,0)]"),'Three-square seam inspection is required');
assert(pilot.includes('LSLS'),'Original east-west connection must be explicit');
assert(html.includes('id="pilotUpload"')&&html.includes('painted-neighbour-lab.html'),'Playable camera should link to the independent join laboratory and offer optional revision preview');
assert(html.includes('const state={type:1,rotation:1'),'Game should initially preview the imported east-west street');
const painter=fs.readFileSync(path.join(__dirname,'../tile-art-v2.js'),'utf8');
assert(painter.includes('permanentMasters'),'Original imported painting must be kept separately from optional temporary revisions');
assert(painter.includes('getMaster'),'Review studio needs to retrieve the original loaded image');
for(const name of ['tile-system.js','painted-lake.js','painted-assets.js','orthographic-lake.js','living-scene.js']){
 assert(!html.includes('<script src="'+name+'"'),'Retired artist still loads: '+name);
}
console.log('V2 contract passed: original 4.1MB painterly tile, exact 44/220 street geometry, 4 legal neighbour configurations, distinct-source QA gate, 31 study slots.');
