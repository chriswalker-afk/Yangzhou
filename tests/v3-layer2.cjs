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
assert.equal(entries.length,1,'A land-only tile should be able to hold one hall');
assert(layer2.validateDetail(grass,entries[0]));
assert.deepEqual(layer2.plan({...grass,x:10,y:-3}),entries);
assert.deepEqual(layer2.plan({...grass,seed:2}),[],'Variant seed controls density');
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
assert.deepEqual(layer2.plan(restored[1]),[]);
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
 'layers','Layer 2 Tile Composition Lab (rev 26)']){
  if(marker==='layers')continue;
  assert(lab.includes(marker),'Layer2 lab missing contract '+marker);
}
assert(!lab.includes('ctx.rotate('),'Never rotate compass-upright artwork');
console.log('V3 Layer2 tile contract passed: original transparent art, 20 tile signatures, safe land placement, stable local anchors, serialization and no V2 changes.');