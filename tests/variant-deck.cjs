'use strict';
/* Yangzhou painted-variant contract: exact original image bytes,
 * connector-compatible pools and deterministic per-tile scene selection. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const topology=require('../tile-topology.js');
const root=path.join(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/v2/variant-pools.json'),'utf8'));
assert.equal(manifest.schemaVersion,1);
assert.equal(manifest.imagePixels,1254);
assert.equal(manifest.pools.length,11);
const keys=new Set(),files=new Set();
let variants=0,multiple=0;
for(const group of manifest.pools){
 const archetype=topology.archetypes.find(a=>a.id===group.archetype);
 assert(archetype,'Unknown family '+group.archetype);
 const legal=Array.from({length:4},(_,i)=>topology.rotateEdges(archetype.edges,i).join(''));
 assert(legal.includes(group.edges),'Incompatible edge pattern '+group.archetype+':'+group.edges);
 const key=group.archetype+':'+group.edges;
 assert(!keys.has(key),'Duplicate topology pool '+key);
 keys.add(key);
 if(group.variants.length>1)multiple++;
 for(const v of group.variants){
  assert(!files.has(v.file),'The same picture is assigned to multiple art slots');
  files.add(v.file);
  assert(v.file.startsWith('variants/'+group.archetype+'/'));
  assert(v.file.endsWith('.webp'));
  assert.equal(v.width,1254);
  assert.equal(v.height,1254);
  const data=fs.readFileSync(path.join(root,'assets/v2',v.file));
  assert.equal(data.length,v.bytes,'Unexpected image length '+v.file);
  assert.equal(data.subarray(0,4).toString(),'RIFF','Not a RIFF WebP '+v.file);
  assert.equal(data.subarray(8,12).toString(),'WEBP','Not a WebP '+v.file);
  assert.equal(data.readUInt32LE(4)+8,data.length,'RIFF size mismatch '+v.file);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),v.sha256,'Image source modified '+v.file);
  variants++;
 }
}
assert.equal(variants,19);
assert(multiple>=3,'The package must include multiple genuine variants for some tile edge groups');

// Exercise browser artwork routing without relying on an image server.
// The renderer is normally loaded after topology and the existing painter.
let fallbackCalls=0,paintedCalls=0;
const artist={draw:()=>{fallbackCalls++;return true;},inspect:()=>({paintingVariantsLoaded:3})};
const context={
 window:{YangzhouArtV2:artist,YangzhouTileTopology:topology,dispatchEvent:()=>{},YangzhouDebug:null},
 Image:class {
  constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
  set src(value){this._src=value;this.complete=true;this.naturalWidth=1254;this.naturalHeight=1254;queueMicrotask(()=>this.onload?.());}
  get src(){return this._src;}
 },
 Event:class {constructor(type){this.type=type;}},
 fetch:async()=>({ok:true,json:async()=>manifest}),
 console,Math,Map,Set,Array,Object,Number,String,Promise,
};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/v2/variant-runtime.js'),'utf8'),
 context,{filename:'variant-runtime.js'});
(async()=>{
 // fetch().then(json).then(register) needs two microtask turns.
 for(let k=0;k<8&&!context.window.YangzhouVariantDeck.inspect().variantPoolReady;k++)
  await new Promise(resolve=>setImmediate(resolve));
 const deck=context.window.YangzhouVariantDeck;
 assert.equal(deck.inspect().variantPoolReady,true);
 assert.equal(deck.inspect().variantPools,11);
 assert.equal(deck.inspect().variantCandidates,19);
 assert.equal(deck.inspect().variantPaintingsLoaded,19);

 const context2={save(){},restore(){},translate(){},beginPath(){},rect(){},clip(){},
  drawImage(){paintedCalls++;}};
 for(const group of manifest.pools){
  const tile={id:group.archetype,edges:group.edges.split(''),x:3,y:7,seed:22};
  deck.setGameSeed(908);
  const a=deck.getSelectedVariant(tile);
  assert(a,'No image selected for '+group.archetype+':'+group.edges);
  assert.equal(a.edges,group.edges);
  assert(group.variants.some(v=>v.id===a.id));
  assert.deepEqual(deck.getSelectedVariant(tile),a,'Stable art for redraw and zoom');
  assert.equal(artist.draw(context2,tile),true);
  assert.equal(deck.getSelectedVariant({...tile,artVariantId:group.variants[0].id}).id,
    group.variants[0].id,'Explicit known artwork may be held stable');
  if(group.variants.length>1){
   const seen=new Set();
   for(let seed=1;seed<=30;seed++){
    deck.setGameSeed(seed);
    seen.add(deck.getSelectedVariant(tile).id);
   }
   assert(seen.size>1,'The randomized pool must offer actual visual variation');
  }
 }
 assert.equal(paintedCalls,11);
 assert.equal(deck.getSelectedVariant({id:'canal-straight',edges:['S','S','S','S']}),null,
  'A mismatched edge signature may never show canal art');
 assert.equal(deck.getSelectedVariant({id:'street-straight',edges:['S','L','S','L'],fixed:true}),null,
  'Fixed Slender West Lake tiles never use expansion artwork');
 const before=fallbackCalls;
 artist.draw(context2,{id:'unpainted',edges:['L','L','L','L'],x:0,y:0});
 assert.equal(fallbackCalls,before+1,'Absent variant pool must preserve existing renderer');
 console.log('Yangzhou variant QA passed: 19 image hashes; 11 topology-safe groups; deterministic seeded draws; real random diversity; preserved lake fallback');
})().catch(error=>{console.error(error);process.exitCode=1;});
