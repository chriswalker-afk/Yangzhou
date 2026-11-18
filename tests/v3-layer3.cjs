'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const topology=require('../tile-topology.js');
const geo=require('../assets/v3/base-geometry.js');
const board=require('../assets/v3/all-layer2-review.js');
const walls=require('../assets/v3/wall-geometry.js');
const fine=require('../assets/v3/layer3-fine-details.js');
const manifest=JSON.parse(fs.readFileSync('assets/v3/fine/manifest.json','utf8'));
assert.equal(topology.portWidth.S,44,'V2 original art port unchanged');
assert.equal(geo.portWidths.S,28,'V3 narrowed road remains 28');
assert.equal(geo.portWidths.W,88,'Canal remains unchanged');
assert.equal(manifest.assets.length,24);
assert.deepEqual(manifest.assets.map(a=>a.id),fine.IDS);
for(const a of manifest.assets){
 assert.deepEqual(a.worldFootprint,[fine.ASSETS[a.id].width,fine.ASSETS[a.id].height],a.id+' dimensions');
 assert.equal(a.artworkCertifiedForV3,false);
 assert.equal(a.productionApproved,false);
 assert.equal(a.sourceOriginal.committedToGitHub,false);
 const bytes=fs.readFileSync(a.prepared.path);
 assert.equal(bytes.length,a.prepared.bytes,a.id+' bytes');
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.prepared.sha256,a.id+' checksum');
 assert.equal(bytes.toString('ascii',0,4),'RIFF',a.id+' RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP',a.id+' WEBP');
 assert.equal(bytes.toString('ascii',12,16),'VP8X',a.id+' dimensions header');
 const width=1+bytes.readUIntLE(24,3),height=1+bytes.readUIntLE(27,3);
 assert.deepEqual([width,height],a.prepared.pixelDimensions,a.id+' real dimensions');
 assert((bytes[20]&16)===16,a.id+' must preserve transparency');
}
const plan=fine.plan(board.plan(),geo,board,walls);
assert.equal(plan.tiles.length,25);
assert.deepEqual([...plan.used].sort(),[...fine.IDS].sort(),'All 24 candidate types must be seen');
assert(plan.totalPlacements>=55&&plan.totalPlacements<=110,'Layer 3 must be sparse, not covered in clutter');
for(const entry of plan.tiles){
 const original=board.plan().tiles.find(p=>p.tile.x===entry.tile.x&&p.tile.y===entry.tile.y);
 for(const p of entry.art){
  assert(fine.safe(original,p,geo,board,walls),p.id+' may not cross a road/canal, building, wall, or gate');
  assert(p.x>0&&p.y>0&&p.x<220&&p.y<220);
 }
}
assert.equal(plan.tiles.filter(x=>x.tile.role==='bridge').flatMap(x=>x.art).length,0,'Bridge painting must remain uncluttered');
assert(plan.counts['floating-lotus-leaves-01']>=1,'Lotus must appear inside the canal');
assert(plan.counts['stone-mooring-point-01']>=1,'Standalone mooring post must appear on a dry bank');
for(const tile of plan.tiles)for(const p of tile.art){
 if(p.id==='floating-lotus-leaves-01')assert(['vertical-canal','canal-junction'].includes(tile.tile.role),
   'Lotus must not be placed on a road, garden or bridge');
 if(p.id==='stone-mooring-point-01')assert(['landing-new','landing-original','south-bank-landing','waterside-pavilion'].includes(tile.tile.role),
   'The stone mooring point belongs beside a landing');
}

assert.deepEqual(fine.plan(board.plan(),geo,board,walls),plan,'Deterministic placements');
const fake={drawImage(){}},drawn=fine.draw(fake,plan,Object.fromEntries(fine.IDS.map(id=>[id,{}])));
assert.equal(drawn,plan.totalPlacements);
assert.equal(fine.draw(fake,plan,{}, {enabled:false}),0);
const html=fs.readFileSync('layer3-fine-details-v3.html','utf8');
for(const mark of ['layer2-all-assets-v3.html','id="scene"','id="showFine"','id="showGuides"',
 'id="plumCrop"','id="willowCrop"','id="courtCrop"','id="marketCrop"','id="bankCrop"','id="lotusCrop"','id="mooringCrop"',
 'assets/v3/layer3-fine-details.js','assets/v3/fine/manifest.json'])
 assert(html.includes(mark),'Missing preview feature '+mark);
console.log('V3 Layer 3 full QA passed: 24 original-source prepared sprites integrity-checked, '+
 plan.totalPlacements+' geometry-safe details across 25 tiles, all families included, zero bridge interference, and original V2 unchanged.');
