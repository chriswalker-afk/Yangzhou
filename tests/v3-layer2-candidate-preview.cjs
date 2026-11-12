'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const geometry=require('../assets/v3/base-geometry.js');
const layer2=require('../assets/v3/layer2-placements.js');
const preview=require('../assets/v3/layer2-candidate-preview.js');
const ids=Object.keys(preview.ASSETS);
assert.deepEqual(ids,['willow-tree-01','garden-rockery-01']);
assert.equal(preview.ASSETS['willow-tree-01'].sha256,'8e41982dd8d59a5476d5430cb865d9f86578bb69e9bc69c94c30373d5392fc9e');
assert.equal(preview.ASSETS['garden-rockery-01'].sha256,'3a22cb438726d4a88cd9d24d6cf9be47faabd7ecff3aa604a9d3b5d131580e89');
assert.equal(preview.ASSETS['willow-tree-01'].kind,'canopy');
assert.equal(preview.ASSETS['garden-rockery-01'].kind,'solid');
let placed=0;
for(const signature of geometry.signatures)for(const seed of [0,1,2,4,7,14]){
 const tile={x:1,y:3,seed,edges:signature.split('')};
 const candidates=preview.plan(tile);
 assert(candidates.length<=2);
 for(const p of candidates){
  assert(preview.ASSETS[p.id],'An unknown sprite must not be placed');
  assert(preview.clearOfRoutes(tile,p),'Sprite intersects restricted routes: '+signature+' '+p.id);
  placed++;
 }
 const moved={...tile,x:100,y:-24};
 assert.deepEqual(preview.plan(moved),preview.plan(tile),'Tile movement must preserve relative art positions');
}
const garden={x:0,y:0,seed:2,edges:['L','L','L','L']};
assert.deepEqual(preview.plan(garden).map(p=>p.id),ids,'Garden should display both authentic candidates');
assert.equal(preview.clearOfRoutes(garden,{id:'garden-rockery-01',x:8,y:110}),false);
assert.equal(preview.clearOfRoutes({x:0,y:0,seed:2,edges:['L','W','L','W']},{id:'willow-tree-01',x:110,y:110}),false);
const draws=[],images=Object.fromEntries(ids.map(id=>[id,{id}]));
const n=preview.draw({drawImage:(...args)=>draws.push(args)},garden,images);
assert.equal(n,2);assert.equal(draws.length,2);
assert.equal(preview.draw({drawImage(){throw Error('Should not draw absent images')}},garden,{}),0);
const html=fs.readFileSync('layer2-artwork-review-v3.html','utf8');
for(const token of ['candidateZip','candidateWebps','candidates.unzipCandidates','candidates.importWebps','candidates.draw','previewOnlyCandidates','Willow and Rockery Tile Test (rev 28)'])
 assert(html.includes(token),'Preview page missing '+token);
assert(!html.includes('ctx.rotate('),'Candidate sprites must remain compass-upright');
console.log('V3 willow/rockery candidate review passed: '+placed+' safe placements across 20 signatures and verified original-image import hooks.');
