'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const geometry=require('../assets/v3/base-geometry.js');
const art=require('../assets/v3/courtyard-enclosures.js');
const style=JSON.parse(fs.readFileSync('assets/v3/enclosures/manifest.json','utf8'));
const ids=['white-garden-wall-long-01','white-garden-wall-short-01','white-garden-wall-corner-01','moon-gate-01'];
assert.deepEqual(art.IDS,ids);
assert.equal(style.productionApproved,false);
assert.equal(style.candidateStatus,'authentic-webps-committed-awaiting-seam-and-perspective-visual-review');
assert.equal(style.joinRules.nominalHorizontalOverlapWorldUnits,4);
assert.equal(art.PAINTED_JOIN_INSET,2);
assert.equal(style.tileWorldSize,220);
assert.equal(style.cornerRepaint.status,'uploaded-user-repaint-integrated-as-candidate');
assert.equal(style.artifacts.length,4);
const actualSizes={
 'white-garden-wall-long-01':[70,12],
 'white-garden-wall-short-01':[29,12],
 'white-garden-wall-corner-01':[29,24],
 'moon-gate-01':[32,16]
};
for(const id of ids){
 const item=art.COMPONENTS[id],listed=style.artifacts.find(e=>e.id===id);
 assert(item&&listed);
 assert.equal(item.filename,listed.filename);
 assert.equal(item.sha256,listed.sha256);
 assert.equal(item.bytes,listed.bytes);
 assert.equal(item.preparedWidth,listed.width);
 assert.deepEqual(item.ports,listed.ports,'Manifest contact ports must match runtime for '+id);
 assert.equal(item.paintedJoinInset,listed.paintedJoinInset);
 assert.equal(item.preparedHeight,listed.height);
 assert.deepEqual([item.width,item.height],actualSizes[id]);
 const paintedW=item.sourceCrop?.width||item.preparedWidth;
 const paintedH=item.sourceCrop?.height||item.preparedHeight;
 const aspectError=Math.abs(item.width/item.height/(paintedW/paintedH)-1);
 assert(aspectError<0.085,'Do not distort original painted candidate '+id);
 assert.deepEqual(item.sourceCrop||null,listed.sourceCrop||null);
 if(item.sourceCrop){
  const crop=item.sourceCrop;
  assert(crop.x>=0&&crop.y>=0&&crop.width>0&&crop.height>0);
  assert(crop.x+crop.width<=item.preparedWidth);
  assert(crop.y+crop.height<=item.preparedHeight);
 }
}
const court=art.plannedCompound();
assert.equal(court.pieces.length,6);
assert.equal(court.seams.length,4);
assert(court.seams.every(s=>s.gap<1e-10),'Connector endpoints must be exactly coincident');
assert(court.seams.every(s=>Math.abs(s.paintedOverlap-4)<1e-10),
 'Rendered neighbouring paintings must have a four-unit overlap, never exposed grass');
assert.deepEqual(court.seams.map(s=>[s.aIndex,s.bIndex]),[[0,1],[1,2],[3,4],[4,5]]);
assert(court.seams.every(s=>s.paintedOverlap>0 && s.paintedOverlap<6));
assert.equal(court.seams[0].x,106);
assert.equal(court.seams[1].x,131);
assert.equal(court.seams[2].x,107);
assert.equal(court.seams[3].x,135);
assert.deepEqual(court.pieces.map(p=>p.id),[
 'white-garden-wall-long-01','white-garden-wall-short-01','white-garden-wall-corner-01',
 'white-garden-wall-long-01','moon-gate-01','white-garden-wall-short-01'
]);
assert.equal(court.missingOrientedArtwork.length,2);
assert.equal(court.guides.length,2);
assert.equal(court.gateCorridor.centerX,121);
assert.deepEqual(art.COMPONENTS['white-garden-wall-corner-01'].sourceCrop,{x:51,y:154,width:1147,height:950});
assert.equal(art.COMPONENTS['white-garden-wall-corner-01'].preparedWidth,1254);
assert.equal(art.COMPONENTS['white-garden-wall-corner-01'].preparedHeight,1254);
assert.equal(art.COMPONENTS['white-garden-wall-corner-01'].bytes,921018);
assert.equal(art.COMPONENTS['white-garden-wall-corner-01'].sha256,
  '3304e8073574782204fad405a53011a4e53599d169699d1258bc9aa1c0083501');
assert.equal(court.hall.x,107);
const grass={x:0,y:0,edges:['L','L','L','L'],seed:1};
assert(art.audit(grass).valid,'All-land courtyard should pass structural rule checks');
assert.equal(art.audit(grass).visualClosed,false,'Do not claim full enclosure without painted side walls');
assert.deepEqual(art.audit({...grass,x:20,y:-3}),art.audit(grass),'Moving a tile must not change local courtyard');
const unsafe={x:0,y:0,edges:['L','W','L','W'],seed:1};
assert(!art.audit(unsafe).valid,'Courtyard cannot be painted over canal crossing');
assert(!art.safeForTile(grass,{id:'white-garden-wall-long-01',x:12,y:47}));
assert(!art.safeForTile(unsafe,{id:'moon-gate-01',x:110,y:110}));
for(const signature of geometry.signatures){
 const t={x:0,y:0,edges:signature.split(''),seed:7};
 const a=art.audit(t);
 if(a.valid)for(const p of court.pieces)assert(art.safeForTile(t,p));
}
const drawCalls=[],stub={
 save(){},restore(){},setLineDash(){},beginPath(){},moveTo(){},lineTo(){},
 stroke(){},arc(){},fill(){},strokeRect(){},
 drawImage(...args){drawCalls.push(args)}
};
const fakeImages=Object.fromEntries(ids.map(id=>[id,{id}]));
const draw=art.draw(stub,grass,fakeImages,{guides:false});
assert(draw.valid);
assert.equal(draw.drawn,6);
assert.equal(drawCalls.length,6);
assert(drawCalls.every(x=>x[3]>0&&x[4]>0),'Image drawing must use positive dimensions');
const cropped=drawCalls.filter(x=>x.length===9);
assert.equal(cropped.length,1,'Only the repainted corner uses the source-cropping renderer');
assert.deepEqual(cropped[0].slice(1,5),[51,154,1147,950],
 'The original 1254px upload is cropped non-destructively at render time');
assert.deepEqual(cropped[0].slice(7,9),[29,24],
 'Painting retains its intended 29x24 world-unit aspect and wall height');
assert.equal(art.draw(stub,grass,{}, {guides:false}).drawn,0,'Missing art must not be faked');
assert(!art.draw(stub,unsafe,fakeImages,{guides:false}).valid);
const page=fs.readFileSync('courtyard-enclosure-lab-v3.html','utf8');
for(const marker of ['Courtyard Enclosure Assembly Lab (rev 33)','id="enclosureFiles"',
 'enclosure.loadCommitted()','enclosure.loadLocal(files)','id="joinBench"',
 'enclosure.draw(ctx,tile,enclosureImages','enclosure.drawSprite(c,img,p)','id="placeHere"','id="zoom"','painted'])
 assert(page.includes(marker),'Missing V3 isolated lab contract: '+marker);
assert(!page.includes('ctx.rotate('),'Never rotate a facade to imitate compass-upright wall art');
const existing=fs.readFileSync('layer2-lab-v3.html','utf8');
assert(existing.includes('Layer 2 Tile Composition Lab (rev 29)'),'Existing six-tile lab remains unchanged');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const paths=style.artifacts.map(a=>'assets/v3/enclosures/'+a.filename);
const present=paths.filter(p=>fs.existsSync(p));
if(present.length){
 assert.equal(present.length,4,'All four authentic WebPs must be uploaded together');
 for(const row of style.artifacts){
  const content=fs.readFileSync('assets/v3/enclosures/'+row.filename);
  assert.equal(content.length,row.bytes,'Exact prepared byte count required');
  assert.equal(hash(content),row.sha256,'Authentic WebP checksum required');
  assert.equal(content.toString('ascii',0,4),'RIFF');
  assert.equal(content.toString('ascii',8,16),'WEBPVP8L');
  assert.equal(content[20],0x2f);
  const b=content.readUInt32LE(21);
  assert.equal((b&0x3fff)+1,row.width);
  assert.equal(((b>>>14)&0x3fff)+1,row.height);
  assert.equal((b>>>28)&1,1,'Transparency required');
 }
}
console.log('Yangzhou V3 enclosure structural QA passed: 4 real asset declarations, 4 exact join seams, safe one-tile compound, honest missing images, intact V2/layer2 labs. '+present.length+'/4 source binaries on this branch.');