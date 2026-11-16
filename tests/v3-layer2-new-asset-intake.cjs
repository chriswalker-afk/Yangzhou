'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const spec=JSON.parse(fs.readFileSync('assets/v3/large/new-candidates-manifest.json','utf8'));
const html=fs.readFileSync('layer2-new-assets-v3.html','utf8');
assert.equal(spec.schemaVersion,1);
assert.equal(spec.layer,2);
assert.equal(spec.gameplayApproved,false);
assert.equal(spec.items.length,5);
assert.equal(spec.status,'binary-source-and-lossless-webp-committed-awaiting-visual-review');
const ids=['garden-pavilion-01','bamboo-grove-01','garden-rockery-02','courtyard-wing-01','waterside-landing-01'];
assert.deepEqual(spec.items.map(i=>i.id),ids);
assert.equal(new Set(spec.items.map(x=>x.id)).size,5);
for(const item of spec.items){
 assert(item.worldWidth>10&&item.worldHeight>10);
 assert(item.worldWidth<110&&item.worldHeight<110);
 assert(html.includes(item.id),item.id+' missing from preview');
 assert(html.includes(item.previewFile.replace('.webp','')),item.id+' missing file loader');
 const imagePath=item.image,original=item.sourcePath;
 assert(fs.existsSync(imagePath),'Actual prepared sprite must be committed: '+imagePath);
 assert(fs.existsSync(original),'Full-resolution original must be committed: '+original);
 const bytes=fs.readFileSync(imagePath),source=fs.readFileSync(original);
 assert.equal(bytes.length,item.bytes,item.id+' WebP byte count');
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256,
  item.id+' must match exact lossless WebP artwork');
 assert.equal(crypto.createHash('sha256').update(source).digest('hex'),item.sourceSha256,
  item.id+' must match original generative painting');
 assert.equal(item.binaryCommitted,true);
 assert.equal(item.productionApproved,false);
 assert.equal(item.aspectRatioWorldMatch,true,'Do not stretch painterly assets in game geometry');
 assert(Math.abs(item.worldWidth/item.worldHeight-item.width/item.height)/(item.width/item.height)<.035);


}
assert(html.includes('DecompressionStream(\'deflate-raw\')'));
assert(html.includes('new-candidates-manifest.json'));
assert(html.includes('courtyard-hall-01.webp'));
assert(html.includes('window.YangzhouV3Materials.loadAll()'));
assert(html.includes('async function loadOriginals()'));
assert(html.includes("crypto.subtle.digest('SHA-256'"));
assert(!html.includes('productionApproved:true'));
assert(fs.existsSync('index.html'));
console.log('V3 five-asset intake: all 10 source and lossless WebP files verified, exact world sizes, SHA-256 autoload preview, existing hall and V2 isolation.');
