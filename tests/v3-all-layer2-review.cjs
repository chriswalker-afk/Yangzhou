'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const geo=require('../assets/v3/base-geometry.js');
const topology=require('../tile-topology.js');
const placement=require('../assets/v3/layer2-placements.js');
const older=require('../assets/v3/seven-candidates.js');
const moduleUnderTest=require('../assets/v3/all-layer2-review.js');
const latest=JSON.parse(fs.readFileSync('assets/v3/large/three-latest-candidates-manifest.json','utf8'));
const seven=JSON.parse(fs.readFileSync('assets/v3/large/seven-candidates-manifest.json','utf8'));
const certified=JSON.parse(fs.readFileSync('assets/v3/layer2-art-certification.json','utf8'));
const html=fs.readFileSync('layer2-all-assets-v3.html','utf8');
const board=moduleUnderTest;
assert.equal(latest.schemaVersion,1);
assert.equal(latest.productionApproved,false);
assert.equal(latest.newAssets.length,3);
assert.equal(latest.preview,'layer2-all-assets-v3.html');
assert.equal(board.GRID,5);
assert.equal(board.SIZE,220);
assert.equal(board.CERTIFIED_IDS.length,8);
assert.equal(board.SEVEN_IDS.length,7);
assert.equal(board.THREE_IDS.length,3);
assert.equal(board.ALL_IDS.length,18);
assert.equal(new Set(board.ALL_IDS).size,18);
assert.equal(certified.assets.filter(a=>board.CERTIFIED_IDS.includes(a.id)).length,8);
assert.equal(seven.newAssets.length,7);
const expectedLatest=['plum-blossom-tree-01','courtyard-entrance-step-01','south-bank-landing-01'];
assert.deepEqual(new Set(latest.newAssets.map(a=>a.id)),new Set(expectedLatest));
for(const item of latest.newAssets){
 const def=board.NEW[item.id];
 assert(def,'New image must be registered in 5x5 review: '+item.id);
 assert.equal(item.worldFootprint.width,def.width);
 assert.equal(item.worldFootprint.height,def.height);
 assert.equal(item.renderedArtwork.width,def.drawWidth);
 assert.equal(item.renderedArtwork.height,def.drawHeight);
 assert.equal(item.artworkCertifiedForV3,false);
 assert.equal(item.productionApproved,false);
 assert(item.sourceOriginal.hasAlpha&&item.prepared.hasAlpha&&item.prepared.exactSourceRGBA);
 for(const file of [item.sourceOriginal,item.prepared]){
  assert(fs.existsSync(file.path),item.id+' is not present: '+file.path);
  const bytes=fs.readFileSync(file.path);
  assert.equal(bytes.length,file.bytes,'Original bytes '+item.id);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256,'Original SHA-256 '+item.id);
 }
}
for(const id of board.CERTIFIED_IDS){
 const c=certified.assets.find(a=>a.id===id);
 assert(c&&c.artworkCertifiedForV3===true);
 const image=fs.readFileSync(c.image);
 assert.equal(image.byteLength,c.bytes);
 assert.equal(crypto.createHash('sha256').update(image).digest('hex'),c.sha256);
}
for(const item of seven.newAssets){
 const png=fs.readFileSync(item.sourceOriginal.path),webp=fs.readFileSync(item.prepared.path);
 assert.equal(crypto.createHash('sha256').update(png).digest('hex'),item.sourceOriginal.sha256);
 assert.equal(crypto.createHash('sha256').update(webp).digest('hex'),item.prepared.sha256);
}
const plan=board.plan();
assert.equal(plan.tiles.length,25);
assert.equal(plan.totalUnique,18);
assert.deepEqual(plan.missing,[]);
assert.equal(topology.validateBoard(plan.tiles.map(e=>e.tile)).length,0);
const allPlaced=new Set(plan.tiles.flatMap(x=>x.art.map(p=>p.id)));
for(const id of board.ALL_IDS)assert(allPlaced.has(id),'Asset missing from actual scene: '+id);
assert(!allPlaced.has('side-facing-moon-gate-01'),'Retired side-facing gate must not return');
const bridge=plan.tiles.find(e=>e.tile.role==='bridge');
assert(bridge);assert.deepEqual(bridge.tile.edges,['W','S','W','S']);
assert.deepEqual(board.bounds(bridge.art[0]),{left:66,right:154,top:88,bottom:132});
assert(geo.compile(bridge.tile.edges).bridge,'Bridge topology must be registered');
const south=plan.tiles.find(e=>e.tile.role==='south-bank-landing');
assert(south);assert.equal(south.tile.edges.join(''),'LWLW');
assert.deepEqual(board.bounds(south.art[0]),{left:62.5,right:157.5,top:160,bottom:207});
const canal=geo.compile(south.tile.edges);
assert(canal.paths.length===1&&canal.paths[0].type==='W'&&canal.paths[0].width===88);
assert.equal(board.isSafe(south.tile,{id:'south-bank-landing-01',x:110,y:110}),false,'Landing in the canal is forbidden');
assert.equal(board.isSafe({...south.tile,edges:['L','L','L','L']},south.art[0]),false,'Landing on ordinary land is forbidden');
const tree=plan.tiles.find(e=>e.tile.role==='plum-garden');
assert(tree&&tree.art[0].id==='plum-blossom-tree-01');
assert.equal(board.NEW['plum-blossom-tree-01'].trunkRadius,6);
assert.equal(board.NEW['plum-blossom-tree-01'].drawHeight,48,'Do not distort 1:1 source to 48x58');
assert(board.isSafe(tree.tile,tree.art[0]));
const stepTile=plan.tiles.find(e=>e.tile.role==='hall-step');
assert(stepTile&&stepTile.art.some(a=>a.id==='courtyard-hall-01'));
const step=stepTile.art.find(a=>a.id==='courtyard-entrance-step-01');
assert(step&&board.isSafe(stepTile.tile,step));
assert.deepEqual(board.bounds(step),{left:100,right:120,top:132,bottom:142});
assert.equal(board.NEW[step.id].drawWidth,20);
assert(Math.abs(board.NEW[step.id].drawHeight-20/3)<1e-12,'Stone step must keep original 3:1 painting aspect');
assert(stepTile.model&&stepTile.audit.valid);
assert.equal(placement.COMPONENTS['courtyard-hall-01'].height,47);
assert(!stepTile.art.some(a=>a.id==='side-facing-moon-gate-01'));
const stubs=[],ctx={
 drawImage:(...p)=>stubs.push(p),save:()=>{},restore:()=>{},beginPath:()=>{},rect:()=>{},clip:()=>{}
};
assert.equal(board.draw(ctx,tree,{'plum-blossom-tree-01':{}}),1);
assert.equal(stubs[0].length,5);
assert.equal(stubs[0][3],48);assert.equal(stubs[0][4],48);
stubs.length=0;
assert.equal(board.draw(ctx,stepTile,{'courtyard-entrance-step-01':{}}),1);
assert.equal(stubs[0][3],20);assert(Math.abs(stubs[0][4]-20/3)<1e-12);
stubs.length=0;
assert.equal(board.draw(ctx,south,{'south-bank-landing-01':{}}),1);
assert.equal(stubs[0][3],94);assert.equal(stubs[0][4],47);
assert(!html.includes('side-facing-moon-gate-01.webp'));
for(const token of ['showCertified','showSeven','showThree','plumCloseup','stepCloseup','southCloseup',
 'bridgeCloseup','moonGatePainter:moonGate','bridgeSpriteMode:tile.role===','verificationCount===18','galleryCards']){
 assert(html.includes(token),'All-asset review missing '+token);
}
assert(!html.includes('bridgeDeckPattern'),'Bridge road underlay must stay removed');
console.log('Yangzhou V3 ALL Layer 2: 18 authentic sprites, 25 connected tiles, 3 new PNG/WebP pairs and geometry / bridge / door / water contracts verified.');
