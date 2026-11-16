'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const spec=JSON.parse(fs.readFileSync('assets/v3/large/new-candidates-manifest.json','utf8'));
const html=fs.readFileSync('layer2-new-assets-v3.html','utf8');
assert.equal(spec.schemaVersion,1);
assert.equal(spec.layer,2);
assert.equal(spec.gameplayApproved,false);
assert.equal(spec.items.length,5);
assert.equal(spec.status,'source-art-prepared-binaries-not-yet-imported');
const ids=['garden-pavilion-01','bamboo-grove-01','garden-rockery-02','courtyard-wing-01','waterside-landing-01'];
assert.deepEqual(spec.items.map(i=>i.id),ids);
assert.equal(new Set(spec.items.map(x=>x.id)).size,5);
for(const item of spec.items){
 assert(item.worldWidth>10&&item.worldHeight>10);
 assert(item.worldWidth<110&&item.worldHeight<110);
 assert(html.includes(item.id),item.id+' missing from preview');
 assert(html.includes(item.previewFile.replace('.webp','')),item.id+' missing file loader');
 assert(!fs.existsSync(item.image||('assets/v3/large/'+item.previewFile)),
 'Do not claim original artwork is in GitHub before actual binary upload.');
}
assert(html.includes('DecompressionStream(\'deflate-raw\')'));
assert(html.includes('new-candidates-manifest.json'));
assert(html.includes('courtyard-hall-01.webp'));
assert(html.includes('window.YangzhouV3Materials.loadAll()'));
assert(!html.includes('productionApproved:true'));
assert(fs.existsSync('index.html'));
console.log('V3 five-asset intake: exact candidate IDs, world sizes, honest missing binaries, ZIP/local preview, existing hall and unchanged V2 confirmed.');
