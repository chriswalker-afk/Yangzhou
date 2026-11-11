'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/v3/materials/manifest.json'),'utf8'));
const style=JSON.parse(fs.readFileSync(path.join(root,'assets/v3/style-spec.json'),'utf8'));
const runtime=require('../assets/v3/material-runtime.js');
assert.equal(manifest.schemaVersion,1);
assert.equal(manifest.status,'candidate-accepted-awaiting-binary-upload');
assert.equal(manifest.materialTexturePeriodWorldUnits,440);
assert.deepEqual([...runtime.ids],['grass','stone','water']);
assert.equal(runtime.worldPeriod,440);
assert.deepEqual(runtime.periodById,{grass:440,stone:220,water:440});
assert.deepEqual(manifest.periodWorldUnitsByMaterial,{grass:440,stone:220,water:440});
assert.equal(manifest.materials.length,3);
assert.equal(style.materials.length,3);
assert.equal(style.approval.artwork,'unapproved');
assert.notEqual(style.approval.materials,'approved');
assert(manifest.materials.every(m=>m.productionApproved===false));
const seen=new Set(),present=[];
for(const candidate of manifest.materials){
  assert(['grass','stone','water'].includes(candidate.id));
  assert(!seen.has(candidate.id));seen.add(candidate.id);
  assert.equal(candidate.file,runtime.files[candidate.id]);
  assert.equal(candidate.width,1254);assert.equal(candidate.height,1254);
  assert.equal(candidate.reviewStatus,'candidate-accepted');
  assert.match(candidate.sha256,/^[a-f0-9]{64}$/);
  const expected=style.materials.find(m=>m.id===candidate.id);
  assert(expected);
  assert.equal(expected.state,'candidate-accepted');
  assert.equal(expected.image,'assets/v3/materials/'+candidate.file);
  assert.equal(expected.worldAligned,true);
  assert.equal(expected.textureWorldPeriodUnits,runtime.periodById[candidate.id]);
  assert.equal(expected.productionApproved,false);
  const filename=path.join(root,'assets/v3/materials',candidate.file);
  if(!fs.existsSync(filename))continue;
  present.push(candidate.id);
  const b=fs.readFileSync(filename);
  assert.equal(b.length,candidate.bytes,'Wrong length for '+candidate.file);
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WEBP');
  assert.equal(b.toString('ascii',12,16),'VP8L','Expected lossless WebP');
  assert.equal(b[20],0x2f,'Expected VP8L header');
  const packed=b.readUInt32LE(21);
  assert.equal((packed&0x3fff)+1,1254);
  assert.equal(((packed>>>14)&0x3fff)+1,1254);
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'),candidate.sha256,'Candidate not byte-identical to accepted source');
}
assert(present.length===0||present.length===3,
  'Partial binary intake is invalid; supply all three unmodified accepted texture files');
const page=fs.readFileSync(path.join(root,'layer-lab-v3.html'),'utf8');
for(const marker of [
  'assets/v3/base-geometry.js',
  'assets/v3/material-runtime.js',
  'materials.loadAll()',
  'materials.loadLocal(',
  'materials.makePattern(',
  'id="ports"','id="zoom"',
  'id="grassFile"','id="stoneFile"','id="waterFile"',
  "edges:i<3?'LSLS':'LWLW'",
  'ctx.setTransform(3,0,0,3,0,0)'
])assert(page.includes(marker),'Missing V3 material lab contract: '+marker);
// World-space material repeat geometry: the pattern origin must be independent
// of tile coordinates and an image period must be scaled consistently.
const previous=global.DOMMatrix;
global.DOMMatrix=class{constructor(v){this.values=v;}};
try{
  let mat;
  const pattern={setTransform(x){mat=x;}};
  const canvas={createPattern(image,repeat){assert.equal(image.naturalWidth,1254);assert.equal(repeat,'repeat');return pattern;}};
  assert.equal(runtime.makePattern(canvas,{naturalWidth:1254}),pattern);
  assert.equal(mat.values[0],440/1254);
  assert.equal(mat.values[3],440/1254);
  assert.equal(mat.values[4],0);
  assert.equal(mat.values[5],0);
  let fine;
  assert.equal(runtime.makePattern({createPattern:()=>({setTransform(x){fine=x;}})},{naturalWidth:1254},runtime.periodById.stone)?.setTransform instanceof Function,true);
  assert.equal(fine.values[0],220/1254);
}finally{
  if(previous===undefined)delete global.DOMMatrix;
  else global.DOMMatrix=previous;
}
console.log('V3 material contract passed: 3 accepted candidate records, exact provenance, world-space preview, local-source fallback.');
if(present.length===0)console.log('NOTICE: all 3 candidate WebP binaries still await upload to assets/v3/materials (this is NOT a completed art import).');
else console.log('All 3 lossless WebP binaries verified against approved-candidate checksums and dimensions.');
