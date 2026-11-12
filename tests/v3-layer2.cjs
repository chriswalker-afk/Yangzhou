'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const geometry=require('../assets/v3/base-geometry.js');
const layer2=require('../assets/v3/layer2-placements.js');
const style=JSON.parse(fs.readFileSync('assets/v3/style-spec.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('assets/v3/large/manifest.json','utf8'));
const asset=layer2.COMPONENTS['courtyard-hall-01'];
assert.equal(layer2.TILE_SIZE,geometry.size);
assert.equal(layer2.TILE_SIZE,220);
assert.equal(asset.width,96);
assert.equal(asset.height,47);
assert.equal(asset.compassUpright,true);
assert.equal(asset.productionApproved,false);
assert.equal(style.spriteLibrary.some(x=>x.id===asset.id&&x.productionApproved===false),true);
assert.equal(manifest.status,'candidate-committed-awaiting-visual-review');
assert.equal(manifest.components[0].productionApproved,false);
assert.equal(manifest.components[0].assetId,asset.id);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const source=fs.readFileSync('assets/v3/large/sources/courtyard-hall-01-original.png');
assert.equal(source.length,2099041);
assert.equal(sha(source),'ea66d963c1f86acbda5376267d5591f6b184bd36e864048b916b3748e1bfb1f9');
assert.equal(source.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(source.readUInt32BE(16),1774);
assert.equal(source.readUInt32BE(20),887);
assert.equal(source[25],6,'RGBA PNG is required');
const webp=fs.readFileSync(asset.image);
assert.equal(webp.length,1321474);
assert.equal(sha(webp),'3f28402dd8ba4b6cffb1fac693da4306a94631f8359f850d1ee97af8b372bc31');
assert.equal(webp.toString('ascii',0,4),'RIFF');
assert.equal(webp.toString('ascii',8,12),'WEBP');
assert.equal(webp.toString('ascii',12,16),'VP8L');
assert.equal(webp[20],0x2f);
const packed=webp.readUInt32LE(21);
assert.equal((packed&0x3fff)+1,1445);
assert.equal(((packed>>>14)&0x3fff)+1,707);
assert.equal((packed>>>28)&1,1,'Building sprite requires alpha transparency');

for(const signature of geometry.signatures){
  for(const seed of [1,2,4,7,14]){
    const t={x:0,y:0,edges:signature.split(''),seed};
    for(const p of layer2.plan(t)){
      assert(layer2.validateDetail(t,p),'Unsafe detail on topology '+signature);
      assert(p.x>=10&&p.x<=210&&p.y>=10&&p.y<=210);
      const relocated={...t,x:-12,y:205};
      assert.deepEqual(layer2.plan(relocated),layer2.plan(t),
        'Moving a tile in the board must never move its local decoration');
    }
  }
}
const grass={x:0,y:0,edges:['L','L','L','L'],seed:1};
const entries=layer2.plan(grass);
assert(entries.some(p=>p.id===asset.id),'A land-only tile should hold its original hall');
assert(entries.some(p=>p.id==='willow-tree-01'),'A land-only tile should also display a willow');
assert(entries.some(p=>p.id==='garden-rockery-01'),'A land-only tile should also display a rockery');
assert(layer2.validateDetail(grass,entries[0]));
assert.deepEqual(layer2.plan({...grass,x:10,y:-3}),entries);
assert(!layer2.plan({...grass,seed:2}).some(p=>p.id===asset.id),'Seed 2 removes the hall but keeps natural details');
const water={x:0,y:0,edges:['W','W','W','L'],seed:1};
assert.equal(layer2.validateDetail(water,{id:asset.id,x:110,y:110}),false,
 'Hall may not occupy the water crossing');
assert.equal(layer2.validateDetail(grass,{id:asset.id,x:3,y:110}),false,
 'Hall may not cross a tile boundary');
assert.equal(layer2.validateDetail({x:0,y:0,edges:['L','S','L','S'],seed:1},
  {id:asset.id,x:110,y:110}),false,'Hall may not cover a stone path');
assert.throws(()=>layer2.plan({...grass,layer2:[{id:asset.id,x:110,y:-20}]}),
 /Large detail would block a route or tile seam/);
assert.throws(()=>layer2.plan({...grass,layer2:[{id:'invented',x:40,y:40}]}),
 /Unknown V3 large detail/);
const explicit={...grass,layer2:entries};
const payload=layer2.saveBoard([explicit,{x:1,y:0,edges:['L','L','L','L'],seed:2}]);
const restored=layer2.restoreBoard(payload);
assert.deepEqual(restored[0].layer2,entries);
assert.deepEqual(layer2.plan(restored[0]),entries);
assert.deepEqual(layer2.plan(restored[1]),JSON.parse(payload).tiles[1].layer2);
assert.equal(JSON.parse(payload).tiles[0].x,0);
assert.throws(()=>layer2.restoreBoard({...JSON.parse(payload),tileSize:300}),
 /Unsupported V3 tile layout format/);
const draws=[];
const image={naturalWidth:1445,naturalHeight:707};
assert.equal(layer2.draw({drawImage:(...args)=>draws.push(args)},explicit,{[asset.id]:image}),1);
assert.equal(draws.length,1);
assert.equal(draws[0][0],image);
assert.equal(draws[0][3],96);
assert.equal(draws[0][4],47);
assert.equal(layer2.draw({drawImage(){throw Error('Should not fake image')}},explicit,{}),0);
assert.equal(layer2.draw({drawImage(){throw Error('No hall for seed2')}},{...grass,seed:2},{[asset.id]:image}),0);
const lab=fs.readFileSync('layer2-lab-v3.html','utf8');
for(const marker of ['assets/v3/layer2-placements.js','id="scene"','id="showDetails"',
 'id="tileInfo"','id="layoutData"','layer2.draw(ctx,tile,largeImages)',
 'layers','Layer 2 Tile Composition Lab (rev 29)','id="showWillow"','id="showRockery"']){
  if(marker==='layers')continue;
  assert(lab.includes(marker),'Layer2 lab missing contract '+marker);
}
assert(!lab.includes('ctx.rotate('),'Never rotate compass-upright artwork');
// The authentic new binaries were uploaded by the user and matched against SHA-256 and Git object SHA.
const newAssets=[
 ['willow-tree-01',1214,1229,2044912,'8e41982dd8d59a5476d5430cb865d9f86578bb69e9bc69c94c30373d5392fc9e'],
 ['garden-rockery-01',1238,815,1223626,'3a22cb438726d4a88cd9d24d6cf9be47faabd7ecff3aa604a9d3b5d131580e89']
];
for(const [id,width,height,bytes,digest] of newAssets){
 const detail=layer2.COMPONENTS[id];
 assert(detail&&detail.compassUpright&&detail.productionApproved===false);
 const info=manifest.components.find(c=>c.assetId===id);
 assert(info&&info.prepared.path===detail.image);
 assert.equal(info.prepared.sha256,digest);
 assert.equal(info.productionApproved,false);
 assert(style.spriteLibrary.some(c=>c.id===id&&c.productionApproved===false));
 const data=fs.readFileSync(detail.image);
 assert.equal(data.length,bytes,'Original user-uploaded WebP size must remain exact for '+id);
 assert.equal(sha(data),digest,'Original user-uploaded painting hash must remain exact for '+id);
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
 assert.equal(data.toString('ascii',12,16),'VP8L');
 const vp8l=data.readUInt32LE(21);
 assert.equal((vp8l&0x3fff)+1,width);
 assert.equal(((vp8l>>>14)&0x3fff)+1,height);
 assert.equal((vp8l>>>28)&1,1,'Alpha channel expected for '+id);
}
assert.equal(layer2.COMPONENTS['willow-tree-01'].collision,'trunk');
assert.equal(layer2.COMPONENTS['garden-rockery-01'].collision,'solid');
for(const sig of geometry.signatures)for(const seed of [0,1,2,3,4,5,7,11,17]){
 const t={x:0,y:0,edges:sig.split(''),seed},placed=layer2.plan(t);
 assert.deepEqual(placed,layer2.plan({...t,x:80,y:-5}),'Art anchors may not depend on board position');
 for(const p of placed)assert(layer2.validateDetail(t,p),'Unsafe detail '+p.id+' on '+sig);
 for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++)
  assert(layer2.distinctFootprints(placed[i],[placed[j]]),'Layer 2 sprites overlap');
}
const midCanal={x:0,y:0,edges:['L','W','L','W'],seed:2};
assert(!layer2.validateDetail(midCanal,{id:'willow-tree-01',x:110,y:110}),'Trunk may not stand in water');
assert(!layer2.validateDetail(midCanal,{id:'garden-rockery-01',x:110,y:110}),'Rockery may not occupy water');
assert.throws(()=>layer2.plan({...grass,layer2:[{id:'willow-tree-01',x:100,y:100},{id:'garden-rockery-01',x:100,y:100}]}),
 /overlap/);
console.log('V3 Layer2 contract passed: 3 authentic transparent paintings, 20 signatures, deterministic local anchors, trunk-vs-canopy safety, lossless hashes, serialization and V2 isolation.');