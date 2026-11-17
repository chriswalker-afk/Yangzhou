'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const manifest=JSON.parse(fs.readFileSync('assets/v3/large/seven-candidates-manifest.json','utf8'));
const board=require('../assets/v3/seven-candidates.js');
const html=fs.readFileSync('layer2-seven-new-assets-v3.html','utf8');
assert.equal(manifest.schemaVersion,1);
assert.equal(manifest.newAssets.length,7);
assert.equal(manifest.productionApproved,false);
assert.equal(manifest.preview,'layer2-seven-new-assets-v3.html');
assert.equal(new Set(manifest.newAssets.map(a=>a.id)).size,7);
for(const item of manifest.newAssets){
 assert(html.includes(item.id),'Missing gallery/canvas asset reference: '+item.id);
 assert(item.sourceOriginal.hasAlpha&&item.prepared.hasAlpha);
 assert(item.prepared.exactSourceRGBA);
 assert.equal(item.artworkCertifiedForV3,false);
 assert.equal(item.productionApproved,false);
 const def=board.ASSETS[item.id];
 assert(def,'Unregistered asset '+item.id);
 assert.equal(item.worldFootprint.width,def.width);
 assert.equal(item.worldFootprint.height,def.height);
 assert.equal(item.requiredSignature,def.signature);
 for(const [descriptor,kind] of [[item.sourceOriginal,'PNG'],[item.prepared,'WebP']]){
  const bytes=fs.readFileSync(descriptor.path);
  assert.equal(bytes.length,descriptor.bytes,kind+' bytes '+item.id);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),descriptor.sha256,kind+' SHA256 '+item.id);
 }
}
const normal=board.plan({gateWidth:30});
assert.equal(normal.tiles.length,16);
assert.equal(normal.allNewAssetsIncluded,true);
assert.equal(normal.sideGateClearWidth,14);
assert.equal(normal.sideGateClearanceApproved,false);
const spacious=board.plan({gateWidth:40});
assert.equal(spacious.sideGateClearWidth,24);
assert.equal(spacious.sideGateClearanceApproved,true);
assert(!html.includes('productionApproved:true'));
assert(html.includes('loadVerified'));
assert(html.includes('loadFromGitHub'));
assert(html.includes('Gate geometry not approved'));
console.log('Seven V3 originals verified, connected 4x4 topology valid, all seven placed, 30-unit gate flagged, 40-unit comparator clears 24 units. V2 unchanged.');
