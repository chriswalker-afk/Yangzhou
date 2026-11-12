'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const geometry=require('../assets/v3/base-geometry.js');
const edges=require('../assets/v3/edge-system.js');
const art=require('../assets/v3/path-verge-art.js');
const manifest=JSON.parse(fs.readFileSync('assets/v3/edges/path-verge-manifest.json','utf8'));
const style=JSON.parse(fs.readFileSync('assets/v3/style-spec.json','utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');

assert.equal(manifest.status,'candidate-committed-awaiting-visual-approval');
assert.equal(manifest.fileCommitted,true);
assert.equal(manifest.review.artworkProductionApproved,false);
assert.equal(manifest.review.humanSeamReviewCompleted,false);
assert.equal(manifest.review.userSelectedForV3Preview,true);
assert.equal(art.path,manifest.preparedBinary.path);
assert.equal(art.period,220);
assert.equal(art.temporaryWidth,2.5);
assert.equal(art.visualLandSpread,5);
assert.equal(manifest.geometry.roadCoreWorldUnits,44);
assert.equal(manifest.geometry.paintedLandwardSpreadWorldUnits,art.visualLandSpread);
const candidate=style.edgeArtworkCandidates.find(x=>x.id==='path-verge-edge-01');
assert(candidate,'Candidate must be registered in V3 style manifest');
assert.equal(candidate.sha256,manifest.preparedBinary.sha256);
assert.equal(candidate.sourceSha256,manifest.source.sha256);
assert.equal(candidate.productionApproved,false);
assert.equal(candidate.fileAvailable,true);

const source=fs.readFileSync(manifest.source.path);
assert.equal(source.length,820025);
assert.equal(sha(source),'9e8b458c04d2af39a0c4df1bf1c059b3532526958676c736f139edbc0828557f');
assert.equal(source.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(source.readUInt32BE(16),2172);
assert.equal(source.readUInt32BE(20),724);
assert.equal(source[25],6,'Source must be RGBA PNG');

const bytes=fs.readFileSync(art.path);
assert.equal(bytes.length,428866);
assert.equal(sha(bytes),'5c99dfe5bf64ed71190a32246eec656f7df7561714045f0a984b3c25fe23e249');
assert.equal(bytes.toString('ascii',0,4),'RIFF');
assert.equal(bytes.toString('ascii',8,12),'WEBP');
assert.equal(bytes.toString('ascii',12,16),'VP8L','Must retain lossless WebP painting');
assert.equal(bytes[20],0x2f);
const packed=bytes.readUInt32LE(21);
assert.equal((packed&0x3fff)+1,1992);
assert.equal(((packed>>>14)&0x3fff)+1,194);
assert.equal((packed>>>28)&1,1,'Must retain transparent alpha');

const street=edges.compile(geometry.compile('LSLS'.split('')));
assert(street.traces.some(t=>t.role==='path-verge'));
const section=street.traces[0].samples[0];
const expanded=art.growLandward(section,5);
for(const side of ['left','right']){
 assert.deepEqual(expanded.core[side],section.core[side],'Street core must stay exactly positioned');
 const [px,py]=expanded.outer[side], [cx,cy]=section.core[side];
 assert(Math.abs(Math.hypot(px-cx,py-cy)-5)<1e-7,'Only decorative landward spread changes');
}
assert.deepEqual(section.outer,street.traces[0].samples[0].outer,'Source geometry must remain immutable');
assert.throws(()=>art.draw({},street,{naturalWidth:1992,naturalHeight:194},{spread:8.5}),/Unsupported painted verge spread/);
assert.equal(art.draw({},street,null),0);
assert.equal(art.prepareImage({naturalWidth:2172,naturalHeight:724}).naturalWidth,2172,'In Node do not mutate source image');

const calls=[];
const saved=global.DOMMatrix;
global.DOMMatrix=class{constructor(values){assert.equal(values.length,6);assert(values.every(Number.isFinite));this.values=values;calls.push(values);}};
const image={naturalWidth:1992,naturalHeight:194};
const mock={
 beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},
 createPattern(im,repeat){
   assert.equal(im,image);
   assert.equal(repeat,'repeat-x');
   return {setTransform(matrix){assert.equal(matrix.values.length,6);}};
 }
};
try{
 const count=art.draw(mock,street,image,{x:440,y:220});
 assert.equal(count,2,'Straight path must paint both land-side verges');
 assert.equal(calls.length,count,'Every segment must use global pattern coordinates');
 const bridge=edges.compile(geometry.compile('WSWS'.split('')));
 assert.equal(art.draw(mock,bridge,image),0,'No clover on bridge deck');
 const land=edges.compile(geometry.compile('LLLL'.split('')));
 assert.equal(art.draw(mock,land,image),0,'No false path on land');
 const cross=edges.compile(geometry.compile('SSSS'.split('')));
 assert(art.draw(mock,cross,image)>count,'A crossroad must decorate multiple external arms');
}finally{
 if(saved===undefined)delete global.DOMMatrix;
 else global.DOMMatrix=saved;
}
const page=fs.readFileSync('layer-lab-v3.html','utf8');
for(const marker of [
 'assets/v3/path-verge-art.js','id="paintedVerge"','id="vergeFile"','id="vergeStatus"',
 'paintedVergeOverlay:vergeEnabled&&vergeImage','vergeArt.load()','vergeArt.load(url)'
])assert(page.includes(marker),'Missing Path Verge candidate preview contract: '+marker);
const composer=fs.readFileSync('assets/v3/edge-system.js','utf8');
assert(composer.includes("type==='S'&&edgesOn&&typeof options.paintedVergeOverlay"),'Painter must only draw over S routes with edging on');
console.log('V3 Path Verge 01 passed: original and lossless WebP SHA-256, transparency, exact street masks, straights/junctions/bridge exclusions.');
