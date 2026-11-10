'use strict';
/* Validate original full-resolution images in a tile artwork batch.
 * In a staging PR, missing uncommitted artwork is reported as PENDING.
 * The strict flag rejects missing painted candidates before manifest promotion.
 * Geometry and image identity are verified; art quality still needs review.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const top=require('../tile-topology.js');
const root=path.join(__dirname,'../assets/v2');
const batch=JSON.parse(fs.readFileSync(path.join(root,'art-batch-01.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const strict=process.argv.includes('--require-painted');
assert.equal(batch.schemaVersion,1);
assert.equal(batch.batchId,'tile-art-expansion-01');
assert.equal(batch.slots.length,4,'This batch should contain four distinct archetype+orientation slots');
assert.equal(batch.artDirection.tileWorldUnits,top.size);
assert.equal(batch.artDirection.streetPortWorldWidth,top.portWidth.S);
assert.equal(batch.artDirection.waterPortWorldWidth,top.portWidth.W);
const ids=new Set(),files=new Set();let paintedReady=0,missing=0;
for(const slot of batch.slots){
 assert(!ids.has(slot.id),'Duplicate batch slot '+slot.id);ids.add(slot.id);
 assert(slot.id===slot.archetype+':'+slot.rotation);
 const arch=top.archetypes.find(t=>t.id===slot.archetype);
 assert(arch,'Unknown tile archetype '+slot.id);
 const expected=top.rotateEdges(arch.edges,slot.rotation).join('');
 assert.equal(slot.edges,expected,'Wrong declared ports for '+slot.id);
 assert.equal(slot.filename,path.basename(slot.filename));
 assert(!files.has(slot.filename),'Duplicate image filename');files.add(slot.filename);
 const manifestSlot=manifest.tiles.find(t=>t.id===slot.archetype)?.variants[slot.rotation];
 assert(manifestSlot,'Missing game manifest slot '+slot.id);
 assert.equal(manifestSlot.edges,expected,'Gameplay and art contracts must agree');
 const file=path.join(root,slot.filename);
 if(slot.status==='painted-awaiting-upload'||slot.status==='integrated-review'){
  assert.equal(slot.imageWidth,1254);
  assert.equal(slot.imageHeight,1254);
  assert.equal(slot.expectedSha256?.length,64);
  if(!fs.existsSync(file)){
   missing++;
   assert.equal(slot.status,'painted-awaiting-upload','Integrated painting is missing: '+slot.filename);
   assert.equal(manifestSlot.artwork,null,'Never point the game to an absent painting: '+slot.id);
   console.log('PENDING original painting upload:',slot.filename);
   continue;
  }
  const bytes=fs.readFileSync(file);
  assert.equal(bytes.length,slot.expectedSizeBytes,slot.filename+' byte size mismatch');
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',slot.filename+' must be a PNG');
  assert.equal(bytes.readUInt32BE(16),slot.imageWidth);
  assert.equal(bytes.readUInt32BE(20),slot.imageHeight);
  const sha=crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha,slot.expectedSha256,slot.filename+' does not match original generated painting');
  assert(slot.imageWidth>=1024&&slot.imageWidth===slot.imageHeight);
  paintedReady++;
  if(manifestSlot.artwork)assert.equal(manifestSlot.artwork,slot.filename,'Wrong live image assignment');
  console.log('VERIFIED original',slot.filename,bytes.length+' bytes',slot.edges);
 }else{
  assert.equal(slot.status,'painting-not-yet-produced');
  assert.equal(manifestSlot.artwork,null,'Do not market a non-existent painting as integrated: '+slot.id);
  assert(!fs.existsSync(file),'Untracked image exists for unpainted slot '+slot.id);
 }
}
const street=manifest.tiles.find(t=>t.id==='street-straight');
assert.equal(street.variants[1].artwork,'street-east-west-repaint.png');
assert.equal(street.variants[3].artwork,'street-east-west-neighbour.png');
assert.equal(manifest.status,'review','Keep existing artists under review, not production approved');
const layout=[
 {x:0,y:0,edges:top.rotateEdges(top.archetypes.find(t=>t.id==='street-straight').edges,0)},
 {x:1,y:0,edges:top.rotateEdges(top.archetypes.find(t=>t.id==='garden-grove').edges,0)},
 {x:0,y:1,edges:top.rotateEdges(top.archetypes.find(t=>t.id==='street-bend').edges,0)},
 {x:1,y:1,edges:top.rotateEdges(top.archetypes.find(t=>t.id==='street-straight').edges,1)}
];
assert.deepEqual(top.validateBoard(layout),[],'Pilot city block must connect legally');
if(strict&&missing){console.error('Need '+missing+' original PNG upload(s) before art integration.');process.exitCode=1;}
console.log('Artwork Batch 01 contract:',paintedReady+' painted files verified',missing+' awaiting upload',batch.slots.length-paintedReady-missing+' unpainted briefs');
