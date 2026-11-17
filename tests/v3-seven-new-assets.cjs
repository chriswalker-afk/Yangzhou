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
 assert(html.includes('manifest.newAssets') && html.includes('renderGallery()') && html.includes('board.draw('),'Manifest-driven gallery/canvas binding must be present: '+item.id);
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
const bridgeTile=normal.tiles.find(e=>e.tile.role==='bridge');
assert(bridgeTile&&bridgeTile.art.length===1);
assert.deepEqual(board.bounds(bridgeTile.art[0]),{left:66,right:154,top:88,bottom:132});
assert.deepEqual([board.ASSETS['stone-bridge-parapets-01'].width,board.ASSETS['stone-bridge-parapets-01'].height],[88,44]);
assert.deepEqual(board.ASSETS['stone-bridge-parapets-01'].crop,{x:250,y:151,width:1272,height:528});
assert.deepEqual([board.SPECIFICS.bridgeWaterWidth,board.SPECIFICS.bridgeRoadWidth],[88,44]);
assert(html.includes('bridgeSpriteMode:tile.role')); 
assert(html.includes('id="bridgeCloseup"')&&html.includes('drawBridgeCloseup(plan)'));
const calls=[];
const spy={beginPath:()=>{},rect:(...a)=>calls.push(['rect',...a]),clip:(...a)=>calls.push(['clip',...a]),
 fillRect:(...a)=>calls.push(['fillRect',...a]),drawImage:(...a)=>calls.push(['drawImage',...a]),save:()=>{},restore:()=>{}};
assert.equal(board.draw(spy,bridgeTile,{'stone-bridge-parapets-01':{}},{bridgeDeckPattern:'#eee'}),1);
assert(calls.some(c=>c[0]==='rect'&&c.slice(1).join(',')==='506,308,88,44'));
assert(calls.some(c=>c[0]==='fillRect'&&c.slice(1).join(',')==='506,308,88,44'));
const painted=calls.find(c=>c[0]==='drawImage');
assert(painted&&painted[2]===250&&painted[3]===151&&painted[4]===1272&&painted[5]===528);
assert.equal(painted[6],506);
assert.equal(painted[8],88);
assert(Math.abs(painted[9]-88*528/1272)<1e-8);
assert(Math.abs(painted[7]-(308+(44-88*528/1272)/2))<1e-8);
const edgeOps=[];
const mock={beginPath:()=>{},moveTo:()=>{},lineTo:()=>{},closePath:()=>{},fill:()=>{},save:()=>{},restore:()=>{},
 rect:(...a)=>edgeOps.push(['rect',...a]),clip:(rule)=>edgeOps.push(['clip',rule])};
const geom=require('../assets/v3/base-geometry.js');
const edgeMod=require('../assets/v3/edge-system.js');
edgeMod.draw(mock,edgeMod.compile(geom.compile(bridgeTile.tile.edges)),
 {stone:'#ddd',water:'#79a69f',canalBank:'#b5a38a',canalContact:'#5e8075',bridgeEdge:'#b4a990',bridgeContact:'#6e8176'},
 {x:440,y:220,bridgeSpriteMode:true,edges:true});
assert(edgeOps.some(c=>c[0]==='rect'&&c.slice(1).join(',')==='506,220,88,220'));
assert(edgeOps.some(c=>c[0]==='clip'&&c[1]==='evenodd'));
assert.equal(normal.sideGateClearWidth,null);
assert.equal(normal.sideGateClearanceApproved,null);
const spacious=board.plan({gateWidth:40});
assert.equal(spacious.sideGateClearWidth,null);
assert.equal(spacious.sideGateClearanceApproved,null);
assert(!html.includes('productionApproved:true'));
assert(html.includes('loadVerified'));
assert(html.includes('board.loadVerified'));
assert(!html.includes('Gate geometry not approved'));
assert(!manifest.newAssets.some(a=>a.id==='side-facing-moon-gate-01'));
assert(manifest.newAssets.some(a=>a.id==='waterside-landing-02'));
console.log('Seven previews verified with replacement bridge, simplified landing and retired side gate; V2 unchanged.');
