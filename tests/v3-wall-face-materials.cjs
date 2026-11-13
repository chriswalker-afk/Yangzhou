'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const wall=require('../assets/v3/wall-geometry.js');
const profile=require('../assets/v3/wall-profile.js');
const painter=require('../assets/v3/wall-face-materials.js');
const tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
const expected={
 plaster:{size:56950,sha:'f421d5853d2d85e1c71d42a14425f4d68ac611a15e2f1f5a68e5e43686a8d552',dims:[1256,314]},
 stone:{size:69958,sha:'67cc0b16d2a6985737b7ed2decab5c1504f0763dd40e44dc779e1fcdf6e7918b',dims:[1256,157]}
};
for(const [type,expect] of Object.entries(expected)){
 const spec=painter.ASSETS[type];
 assert.equal(spec.bytes,expect.size);
 assert.equal(spec.sha256,expect.sha);
 assert.deepEqual([spec.width,spec.height],expect.dims);
 assert.equal(spec.status,'visual-review-candidate');
 const bytes=fs.readFileSync(spec.path);
 assert.equal(bytes.length,spec.bytes, 'Original prepared WebP bytes must be present');
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),spec.sha256);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
}
const manifest=JSON.parse(fs.readFileSync('assets/v3/wall-materials/manifest.json','utf8'));
assert.equal(manifest.productionApproved,false);
for(const [type] of Object.entries(expected)){
 const meta=manifest.faceMaterials?.[type];
 assert(meta,'Provenance manifest must include the '+type+' candidate');
 assert.equal(meta.prepared.sha256,painter.ASSETS[type].sha256);
 assert.equal(meta.prepared.bytes,painter.ASSETS[type].bytes);
 assert.equal(meta.productionApproved,false);
}
const roof=require('../assets/v3/wall-roof-texture.js');
assert.equal(roof.ASSET.sha256,
 '8a3a7abeb08c4e34bb0134c9a39ba301000435bed5d3c63ccad3bd7a949e578a',
 'The original accepted roof painting must not change');
const rect=wall.compile(wall.templates.rectangle);
const form=profile.build(rect,wall.templates.rectangle.hall);
assert(form.faces.length>0);
const north=form.faces.find(f=>f.location==='north');
const south=form.faces.find(f=>f.location==='south');
const vertical=form.faces.find(f=>f.axis==='vertical');
assert(north&&south&&vertical);
assert.deepEqual(painter.frame(north),{
 axis:'horizontal',angle:0,origin:[Math.min(north.a[0],north.b[0]),north.a[1]],
 phase:Math.min(north.a[0],north.b[0]),visibleSide:'south'
});
assert.equal(painter.frame(vertical).angle,-Math.PI/2);
assert.equal(painter.frame(vertical).visibleSide,'east');
const forward=painter.frame({axis:'vertical',a:[43,10],b:[43,190]});
const reverse=painter.frame({axis:'vertical',a:[43,190],b:[43,10]});
assert.deepEqual(forward,reverse,'Material texture must stay upright when a wall path reverses');
const calls=[],ctx={
 save(){calls.push(['save']);},restore(){calls.push(['restore']);},
 beginPath(){},moveTo(){},lineTo(){},closePath(){},
 clip(){calls.push(['clip']);},translate(){},rotate(x){calls.push(['rotate',x]);},
 drawImage(...args){calls.push(['image',...args]);}
};
const plaster={width:1256,height:314},stone={width:1256,height:157};
const batches={plaster:painter.drawPlaster(ctx,form,tile,plaster,profile),
 stone:painter.drawStone(ctx,form,tile,stone,profile)};
assert(batches.plaster>0&&batches.stone>0);
const strips=calls.filter(x=>x[0]==='image');
assert.equal(strips.length,batches.plaster+batches.stone);
for(const call of strips){
 const source=call[1],period=call[4],height=call[5];
 assert(period>0&&height>0);
 const ratio=source===plaster?4:8;
 assert(Math.abs(period/height-ratio)<1e-8,'Texture pixels may not stretch differently along U and V');
}
assert(calls.some(x=>x[0]==='rotate'&&x[1]===-Math.PI/2));
assert(calls.some(x=>x[0]==='rotate'&&x[1]===0));
function inside(q,p){
 let minX=Math.min(...q.map(v=>v[0])),maxX=Math.max(...q.map(v=>v[0]));
 let minY=Math.min(...q.map(v=>v[1])),maxY=Math.max(...q.map(v=>v[1]));
 return p[0]>minX+1e-8&&p[0]<maxX-1e-8&&p[1]>minY+1e-8&&p[1]<maxY-1e-8;
}
for(const model of Object.values(wall.templates)){
 const compiled=wall.compile(model);
 const f=profile.build(compiled,model.hall);
 for(const gate of compiled.gates){
  assert(!f.faces.some(face=>inside(face.face,gate.center)),
   'Plaster material must leave the moon-gate corridor entirely empty');
  assert(!f.faces.some(face=>inside(face.base,gate.center)),
   'Stone base material must not close the moon-gate opening');
 }
 assert.equal(wall.audit(model,tile,{profilePainter:profile}).valid,true);
}
const fakeCtx={
 ...ctx,setLineDash(){},stroke(){},fill(){},arc(){},
 createLinearGradient(){return {addColorStop(){}}}
};
const integrated=wall.draw(fakeCtx,wall.templates.rectangle,tile,{
 profilePainter:profile,materialPainter:painter,
 plasterImage:plaster,stoneImage:stone,
 showGates:false,showJoints:false
});
assert(integrated.drawn&&integrated.perspectiveProfileUsed);
assert(integrated.plasterTextureUsed&&integrated.stoneTextureUsed);
const rejected=wall.draw(fakeCtx,wall.templates.rectangle,
 {...tile,edges:['L','W','L','W']},
 {profilePainter:profile,materialPainter:painter,plasterImage:plaster,stoneImage:stone});
assert(!rejected.drawn,'New material cannot change exact V3 canal exclusion');
const html=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const target of ['rev 40','assets/v3/wall-face-materials.js?rev=40',
 'id="showPlasterTexture"','id="showStoneTexture"','id="faceStatus"',
 'wallFaceMaterials.loadAll','plasterImage:visible(','stoneImage:visible(']){
 assert(html.includes(target),'V3 lab missing genuine painted material control: '+target);
}
assert(!fs.readFileSync('layer2-lab-v3.html','utf8').includes('wall-face-materials.js'),
 'Existing Layer 2 art lab must not be modified');
assert(!fs.readFileSync('courtyard-enclosure-lab-v3.html','utf8').includes('wall-face-materials.js'));
console.log('V3 painted plaster & stone QA passed: genuine source hashes, 4:1 / 8:1 UV, camera-facing rotation, real gate openings, canal safety and V2 isolation.');
