'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const h=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const cert=read('assets/v3/layer2-art-certification.json');
const large=read('assets/v3/large/manifest.json');
const candidate=read('assets/v3/large/new-candidates-manifest.json');
const style=read('assets/v3/style-spec.json');
const wall=read('assets/v3/wall-materials/manifest.json');
const enclosure=read('assets/v3/enclosures/manifest.json');
const layer2=require('../assets/v3/layer2-placements.js');
const composer=require('../assets/v3/layer2-integrated.js');
assert.equal(cert.schemaVersion,1);
assert.equal(cert.status,'artwork-certified-for-v3-only');
assert.equal(cert.productionReleaseApproved,false);
assert.equal(cert.liveGameUnchanged,true);
assert.equal(cert.assets.length,12);
assert.equal(new Set(cert.assets.map(x=>x.id)).size,12);
assert.equal(large.components.length,8);
assert(large.components.every(x=>x.artworkCertifiedForV3&&x.humanVisualReviewComplete));
assert(large.components.every(x=>x.historicAccuracyReviewed===false&&x.repetitionReviewed===false));
assert(large.components.every(x=>x.productionApproved===false));
assert(large.components.filter(x=>x.placement&&'candidateOnly' in x.placement)
 .every(x=>x.placement.candidateOnly===true),
 'Artwork certification must not accidentally allow candidate placements in production');
assert.equal(large.status,'v3-artwork-certified-production-gated');
assert.equal(candidate.items.length,5);
assert.equal(candidate.integration.shorelineReviewOutstanding,false);
assert.equal(candidate.integration.requiresVisualReview,false);
assert(candidate.items.every(x=>x.artworkCertifiedForV3&&!x.productionApproved));
assert.equal(style.approval.historical,'unreviewed');
assert.equal(style.approval.finalGameProduction,'not-approved');
for(const file of cert.assets){
 const buf=fs.readFileSync(file.image);
 assert.equal(h(buf),file.sha256,'Certified hash mismatch: '+file.id);
 assert.equal(buf.length,file.bytes,'Certified bytes mismatch: '+file.id);
 assert(file.artworkCertifiedForV3&&!file.productionApproved,'Scope error: '+file.id);
 assert(!file.historicalAccuracyVerified&&!file.largeLayoutRepetitionVerified);
 if(file.family==='large-sprite'){
  const item=large.components.find(x=>x.assetId===file.id);
  const def=layer2.COMPONENTS[file.id];
  assert(item&&def,'Registry large sprite missing '+file.id);
  assert.deepEqual(file.worldFootprint,[def.width,def.height]);
  assert.equal(item.prepared.sha256,file.sha256);
  assert.equal(item.prepared.bytes,file.bytes);
  assert.equal(def.artworkCertifiedForV3,true);
  assert.equal(def.productionApproved,false);
  const entry=style.spriteLibrary.find(x=>x.id===file.id);
  assert(entry&&entry.artworkCertifiedForV3&&!entry.productionApproved);
 }else if(file.family==='active-architectural-opening'){
  const entry=enclosure.artifacts.find(x=>x.id===file.id);
  assert(entry&&entry.sha256===file.sha256);
  assert(entry.artworkCertifiedForV3);
 }else{
  const entry=file.id==='wall-roof-tiles-01'?wall.prepared:
   file.id==='wall-plaster-ivory-01'?wall.faceMaterials.plaster.prepared:
   wall.faceMaterials.stone.prepared;
  assert.equal(entry.sha256,file.sha256);
 }
}
assert.equal(cert.assets.filter(x=>x.family==='large-sprite').length,8);
assert.equal(cert.assets.filter(x=>x.family==='wall material').length,3);
assert.equal(cert.assets.filter(x=>x.family==='active-architectural-opening').length,1);
assert.equal(enclosure.activeContinuousWallCertification.artworkCertifiedForV3,true);
assert.equal(wall.artworkCertifiedForV3,true);
assert.equal(wall.productionApproved,false);
assert.equal(large.components.find(x=>x.assetId==='waterside-landing-01')
 .shorelineReview.status,'accepted-for-existing-north-bank-LWLW-configuration');
assert.equal(large.components.find(x=>x.assetId==='waterside-landing-01')
 .placement.requiresShorelineArtReview,false);
assert.equal(candidate.items.find(x=>x.id==='waterside-landing-01')
 .shorelineReview.status,'accepted-north-bank-straight-canal-only');
const northCanal={x:1,y:0,edges:['L','W','L','W'],seed:2};
assert.deepEqual(composer.plan(northCanal,'landing').placements,
 [{id:'waterside-landing-01',x:110,y:53}]);
assert.equal(composer.plan({...northCanal,edges:['L','L','L','L']},'landing').placements.length,0);
assert(!fs.readFileSync('index.html','utf8').includes('layer2-art-certification'),
 'Certification is a V3 source contract, not a V2 gameplay migration');
for(const str of ['historical','repetition','V2'])
 assert(cert.explicitlyNotCertified.some(x=>x.toLowerCase().includes(str.toLowerCase())),
  'Maintain explicit certification exclusions for '+str);
console.log('V3 Layer 2 certificate passed: eight sprites + original moon gate + three real wall paints, all 12 hashes and scope guards.');
