'use strict';
const assert=require('node:assert/strict');
const art=require('../assets/v3/canal-bank-art.js');
const geometry=require('../assets/v3/base-geometry.js');
const edging=require('../assets/v3/edge-system.js');
assert.equal(art.path,'assets/v3/edges/canal-bank-edge-01.webp');
assert.equal(art.period,220);
assert.equal(art.positiveMod(-5,220),215);
assert.equal(art.isImage(null),false);
assert.equal(art.isImage({naturalWidth:2172,naturalHeight:724}),true);
const original={naturalWidth:2172,naturalHeight:724};
assert.equal(art.prepareImage(original),original,'Node without DOM must preserve source and avoid destructive cropping');
assert.equal(art.draw({},edging.compile(geometry.compile('LSLS'.split(''))),null),0);
const bridge=edging.compile(geometry.compile('WSWS'.split('')));
const canal=edging.compile(geometry.compile('LWLW'.split('')));
const image={naturalWidth:2172,naturalHeight:724};
const calls=[],painted=[];
global.DOMMatrix=class {
 constructor(values){this.values=values;calls.push(values);}
};
const ctx={
 beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){painted.push(this.fillStyle);},
 createPattern(im,repeat){assert.equal(im,image);assert.equal(repeat,'repeat-x');return {
  setTransform(matrix){assert.equal(matrix.values.length,6);assert(matrix.values.every(Number.isFinite));}
 };}
};
const n=art.draw(ctx,canal,image,{x:220,y:220});
assert(n>=2,'Both canal banks must be painted');
assert.equal(painted.length,n);
assert.equal(art.draw(ctx,bridge,image),2,'Straight bridge canal must receive two land-side bank ribbons');
assert.throws(()=>art.draw(ctx,{},image),/Compiled V3 edging required/);
const fs=require('node:fs');
const crypto=require('node:crypto');
const manifest=JSON.parse(fs.readFileSync('assets/v3/edges/manifest.json','utf8'));
assert.equal(manifest.status,'candidate-committed-awaiting-visual-approval');
assert.equal(manifest.fileCommitted,true);
assert.equal(manifest.preparedBinary.productionApproved,false);
assert.equal(manifest.source.width,2172);
assert.equal(manifest.source.height,724);
assert.equal(manifest.source.sha256,'cbef6e2ffad92e8a8171a944694ace9e498a7be97397de16f5a9bbe6fe048862');
const imgPresent=fs.existsSync(art.path);
assert.equal(imgPresent,true,'Authentic canal-bank WebP must be present');
const bytes=fs.readFileSync(art.path);
assert.equal(bytes.length,manifest.preparedBinary.bytes);
assert.equal(bytes.toString('ascii',0,4),'RIFF');
assert.equal(bytes.toString('ascii',8,12),'WEBP');
assert.equal(bytes.toString('ascii',12,16),'VP8L','Canal bank must use lossless WebP');
assert.equal(bytes[20],0x2f);
const packed=bytes.readUInt32LE(21);
assert.equal((packed&0x3fff)+1,manifest.preparedBinary.width);
assert.equal(((packed>>>14)&0x3fff)+1,manifest.preparedBinary.height);
assert.equal((packed>>>28)&1,1,'Canal-bank lossless WebP must declare transparency');
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.preparedBinary.sha256,'Canal bank differs from checked painting');
const lab=fs.readFileSync('layer-lab-v3.html','utf8');
for(const marker of ['assets/v3/canal-bank-art.js','id="bankFile"','id="paintedBank"','paintedBankOverlay:bankEnabled&&bankImage','bankArt.load()','bankArt.load(url)']){
 assert(lab.includes(marker),'Missing painted bank candidate contract: '+marker);
}
console.log('V3 painted bank integrity passed: committed lossless RGBA WebP exact SHA-256/size/dimensions, candidate only.');
