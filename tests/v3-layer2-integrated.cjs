'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const topology=require('../tile-topology.js');
const layer2=require('../assets/v3/layer2-placements.js');
const geometry=require('../assets/v3/base-geometry.js');
const walls=require('../assets/v3/wall-geometry.js');
const walkway=require('../assets/v3/courtyard-walkway.js');
const composer=require('../assets/v3/layer2-integrated.js');
const manifest=JSON.parse(fs.readFileSync('assets/v3/large/new-candidates-manifest.json','utf8'));
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
assert.equal(composer.NEW_IDS.length,5);
assert.equal(composer.TILE,220);
for(const spec of manifest.items){
 assert(composer.NEW_IDS.includes(spec.id));
 const def=layer2.COMPONENTS[spec.id];
 assert(def,'Sprite must be registered in canonical Layer 2 registry');
 assert.equal(def.width,spec.worldWidth);
 assert.equal(def.height,spec.worldHeight);
 assert.equal(def.image,spec.image);
 assert.equal(def.productionApproved,false);
 assert.equal(sha(fs.readFileSync(spec.image)),spec.sha256);
 const bytes=fs.readFileSync(spec.image);
 assert.equal(bytes.length,spec.bytes);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
}
const t=(code,seed=1,x=0,y=0)=>({x,y,seed,edges:code.split('')});
const wide=composer.plan(t('LLLL'),'wide');
assert(wide.accepted&&wide.wallAudit.valid,'The wide enclosure must pass wall audit');
assert.equal(wide.placements.length,2);
assert.deepEqual(wide.placements.map(p=>p.id),['courtyard-hall-01','courtyard-wing-01']);
assert.deepEqual(wide.placements[1],{id:'courtyard-wing-01',x:52,y:107});
assert(walkway.routeFor(wide.model,wide.compiled),'Gate to hall walkway must remain valid');
assert.equal(wide.compiled.gates.length,1);
assert(!walls.isSolid(wide.compiled,wide.compiled.gates[0].center));
for(let i=0;i<wide.placements.length;i++)for(let j=i+1;j<wide.placements.length;j++)
 assert(layer2.distinctFootprints(wide.placements[i],[wide.placements[j]],7));
for(const p of wide.placements)
 assert(composer.validate(t('LLLL'),p,{model:wide.model,compiled:wide.compiled,
 already:wide.placements.filter(q=>q!==p)}));
const pref=composer.plan(t('LLLL'),'pavilion');
assert(pref.accepted);
assert.deepEqual(pref.placements.map(p=>p.id),['garden-pavilion-01','bamboo-grove-01']);
const rocks=composer.plan(t('LLLL'),'rockery');
assert(rocks.placements.some(p=>p.id==='garden-rockery-02'));
const bamboo=composer.plan(t('LLLL'),'bamboo');
assert(bamboo.placements.some(p=>p.id==='bamboo-grove-01'));
const landing=composer.plan(t('LWLW'),'landing');
assert.deepEqual(landing.placements,[{id:'waterside-landing-01',x:110,y:53}]);
assert(layer2.validateDetail(t('LWLW'),landing.placements[0]));
for(const code of ['LLLL','LSLS','LWWW','WLWL','LWLL','LWWL']){
 assert(!composer.plan(t(code),'landing').placements.length,
  'Waterfront landing must never be auto placed on any unapproved canal signature '+code);
}
assert(!composer.plan(t('LWLW'),'wide').accepted,'Walled courtyard cannot overlap water');
assert(!composer.plan(t('LSLS'),'wide').accepted,'Walled courtyard cannot block roadway');
for(const kind of composer.ALLOWED){
 for(const code of ['LLLL','LWLW','LSLS','LWWW']){
  const tile=t(code,7);
  const planned=composer.plan(tile,kind);
  const moved=composer.plan({...tile,x:10,y:30},kind);
  assert.deepEqual(planned.placements,moved.placements,
   'Anchored objects move with tile independent of board grid position');
  for(let i=0;i<planned.placements.length;i++){
   const a=planned.placements[i];
   assert(layer2.validateDetail(tile,a),'No sprite may violate Layer 1 geometry');
   for(let j=i+1;j<planned.placements.length;j++)
    assert(layer2.distinctFootprints(a,[planned.placements[j]],7));
   if(planned.compiled&&a.id!=='waterside-landing-01'){
    assert(composer.wallClear(a,planned.compiled),'Painted object may not intersect wall plaster or roof');
    assert(composer.routeClear(a,planned.model,planned.compiled),'Must leave courtyard walkway passable');
   }
  }
 }
}
for(const signature of geometry.signatures){
 const tile=t(signature);
 for(const kind of composer.ALLOWED){
  const p=composer.plan(tile,kind);
  assert.deepEqual(p.placements,composer.plan({...tile,x:-17,y:14},kind).placements);
 }
}
assert(!composer.validate(t('LLLL'),{id:'courtyard-wing-01',x:110,y:110},{
 model:wide.model,compiled:wide.compiled,
 already:[wide.placements[0]]}),'Wing may not collide with hall');
const calls=[],images=Object.fromEntries(composer.NEW_IDS.map(id=>[id,{id}]));
images['courtyard-hall-01']={id:'courtyard-hall-01'};
assert.equal(composer.draw({drawImage:(...args)=>calls.push(args)},t('LLLL'),wide,images),2);
assert.equal(calls[0][3],96);
assert.equal(calls[1][3],33);
assert.equal(composer.draw({drawImage(){}},t('LLLL'),wide,images,
 {visible:{'courtyard-wing-01':false}}),1);
const landCalls=[];
assert.equal(composer.draw({drawImage:(...args)=>landCalls.push(args)},
 t('LWLW'),landing,images),1);
assert.equal(landCalls[0][3],95);
assert.equal(landCalls[0][4],47);
assert.equal(topology.validateBoard([
 t('LLLL',1,0,0),t('LLLL',2,1,0),t('LLLL',3,2,0),
 t('LWLW',4,0,1),t('LWLW',5,1,1),t('LWLW',6,2,1)
]).length,0);
assert(!fs.readFileSync('index.html','utf8').includes('layer2-integrated'),
 'V2 must not depend on this candidate module');
console.log('V3 rev49 compositor: five real asset SHA-256s, wide hall+wing, true 30-unit moon gate, all 20 tile signatures, strict shore and road/canal safety.');
