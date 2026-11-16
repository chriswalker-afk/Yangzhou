'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const topology=require('../tile-topology.js');
const geometry=require('../assets/v3/base-geometry.js');
const edges=require('../assets/v3/edge-system.js');
const composer=require('../assets/v3/layer2-integrated.js');
const proof=require('../assets/v3/waterside-landing-canal-proof.js');
const manifest=JSON.parse(fs.readFileSync('assets/v3/large/new-candidates-manifest.json','utf8'));
const item=manifest.items.find(x=>x.id==='waterside-landing-01');
assert(item&&item.binaryCommitted&&item.productionApproved===false);
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(item.image)).digest('hex'),item.sha256,
 'Original Waterside Landing 01 must stay byte identical');
assert.equal(proof.TILE,220);
assert.deepEqual(proof.TILES.map(x=>x.x),[0,1,2]);
assert.deepEqual(proof.TILES.map(x=>x.y),[0,0,0]);
assert.deepEqual(proof.TILES.map(x=>x.edges.join('')),['LWLW','LWLW','LWLW']);
assert.deepEqual(proof.WATER,{width:88,centerY:110,north:66,south:154,
 totalLength:660,connectedSegments:3});
assert.deepEqual(proof.CENTER,{index:1,tileX:1,x:110,y:53});
assert.equal(topology.validateBoard(proof.TILES).length,0,'Three connected tile topology must be legal');
const p=proof.plan();
assert.equal(p.components.length,3);
assert.equal(p.landing.placements.length,1);
assert.equal(p.landing.placements[0].id,item.id);
assert.deepEqual(p.landing.placements[0],{id:item.id,x:110,y:53});
for(const part of p.components){
 const route=part.g.paths[0];
 assert.equal(route.type,'W');
 assert.equal(route.kind,'line');
 assert.equal(route.width,88);
 assert.equal(route.start[1],110);
 assert.equal(route.end[1],110);
 assert.equal(part.compiled.traces.length,1);
 assert.equal(part.compiled.traces[0].material,'W');
 assert.equal(composer.plan(part.tile,'landing').placements.length,1);
}
for(let x=1;x<3;x++){
 const left=geometry.compile(p.tiles[x-1].edges).exits[1];
 const right=geometry.compile(p.tiles[x].edges).exits[3];
 assert.equal(left.type,'W');
 assert.equal(right.type,'W');
 assert.equal(left.width,right.width);
}
const draws=[];
let fillStyle='#000';
const ctx={
 save(){},restore(){},
 beginPath(){},rect(){},clip(){},moveTo(){},lineTo(){},closePath(){},
 fill(){draws.push(['fill',fillStyle])},
 setLineDash(){},stroke(){},
 fillRect(...args){draws.push(['rect',...args,fillStyle])},
 drawImage(...args){draws.push(['image',...args])},
 set fillStyle(v){fillStyle=v},get fillStyle(){return fillStyle}
};
const image={naturalWidth:item.width,naturalHeight:item.height};
const opts={images:{[item.id]:image},showLanding:true,showPaintedBank:false,showGuides:false,
 style:{grass:'#abc',stone:'#def',water:'#123'}};
const yes=proof.draw(ctx,opts);
assert.equal(yes.usedSprite,true);
assert.equal(yes.canalConnected,true);
assert.equal(yes.originalWaterMaskUnchanged,true);
assert.deepEqual(yes.stats.map(x=>x.spriteCount),[0,1,0],
 'The original landing image belongs to exactly the middle tile');
assert.equal(draws.filter(x=>x[0]==='fill'&&x[1]==='#123').length,3,
 'Canal water must be drawn as three true 88-unit V3 masks');
const art=draws.filter(x=>x[0]==='image');
assert.equal(art.length,1,'Only one artwork sprite on the centre bank');
assert.deepEqual(art[0].slice(2),[220+110-95/2,53-47/2,95,47],
 'Landing positioned relative to middle tile without changing original scale');
draws.length=0;
const no=proof.draw(ctx,{...opts,showLanding:false});
assert.equal(no.usedSprite,false);
assert.equal(draws.filter(x=>x[0]==='image').length,0);
assert.equal(draws.filter(x=>x[0]==='fill'&&x[1]==='#123').length,3,
 'Hiding landing must not hide or widen the three original canal masks');
assert(!fs.readFileSync('index.html','utf8').includes('waterside-landing-canal-proof'),
 'V2 gameplay must not depend on review-only code');
const html=fs.readFileSync('waterside-landing-review-v3.html','utf8');
const integrated=fs.readFileSync('layer2-integrated-v3.html','utf8');
for(const required of [
 'id="scene" width="1980" height="660"',
 'id="showLanding" type="checkbox" checked',
 'id="showBank" type="checkbox" checked',
 'id="showTextures" type="checkbox" checked',
 'id="closeUp"','Original Waterside Landing 01 verified',
 "spec.sha256", "blob.size!==spec.bytes",
 'waterside-landing-canal-proof.js?rev=50',
 'the <strong>north bank of the middle tile</strong>'
])assert(html.includes(required),required);
assert(integrated.includes('waterside-landing-review-v3.html?rev=50'));
assert(integrated.includes('id="showTextures" checked'),
 'Normal integrated review should show painted jade water by default');
console.log('V3 rev50 3-tile landing preview: genuine connected canal 88-unit masks, exact original WebP, north-bank centre placement and no V2 changes.');
