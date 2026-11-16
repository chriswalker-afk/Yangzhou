'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const painter=require('../assets/v3/courtyard-walkway.js');
const paving=require('../assets/v3/courtyard-paving.js');
const walls=require('../assets/v3/wall-geometry.js');
const profile=require('../assets/v3/wall-profile.js');
const manifest=JSON.parse(fs.readFileSync('assets/v3/materials/manifest.json','utf8'));
const spec=manifest.layer1BWalkway,asset=painter.ASSET;
assert(spec&&spec.layer==='1B'&&spec.productionApproved===false);
for(const field of ['id','path','width','height','bytes','sha256','worldWidth','worldRepeat'])
 assert.equal(spec[field],asset[field],field+' must match manifest');
const svg=fs.readFileSync(asset.path);
assert.equal(svg.length,918754);
assert.equal(crypto.createHash('sha256').update(svg).digest('hex'),asset.sha256);
assert(svg.toString().includes('<svg')&&svg.toString().includes('data:image/webp;base64,'));
assert(!svg.toString().includes('data:image/png;base64,'),
 'No generated scene screenshot should become a material');
const match=svg.toString().match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
assert(match,'Self-contained real painting needed in walkway image');
const originalPigment=Buffer.from(match[1],'base64');
assert.equal(crypto.createHash('sha256').update(originalPigment).digest('hex'),
 paving.ASSET.sha256,'Embedded authentic pigment must be byte-identical to existing source');
assert(originalPigment.equals(fs.readFileSync(paving.ASSET.path)),
 'This is a derivative asset, NOT a replacement of the original courtyard paving');
assert.equal(asset.worldWidth,12);
assert.equal(asset.worldRepeat,20);
const tile={x:0,y:0,seed:1,edges:['L','L','L','L']};
const rect=walls.templates.rectangle,partial=walls.templates.partial;
const r1=painter.routeFor(rect,walls.compile(rect));
assert(r1&&r1.gateId==='moon-gate'&&r1.x===104&&r1.y===132.5&&r1.width===12);
assert.equal(r1.height,45.5);
assert.equal(r1.direction,'north-from-south-gate');
assert.equal(r1.modifiesCollision,false);
const r2=painter.routeFor(partial,walls.compile(partial));
assert(r2&&r2.x===104&&r2.y===48&&r2.height===37.5);
assert.equal(r2.direction,'south-from-north-gate');
for(const id of ['tee','elbow']){
 assert.equal(painter.routeFor(walls.templates[id],walls.compile(walls.templates[id])),null);
}
const originalGate=walls.compile(rect).gates[0];
const records=[],ctx={
 save(){records.push('save');},restore(){records.push('restore');},
 beginPath(){records.push('begin');},
 rect(...args){records.push(['rect',...args]);},
 clip(){records.push('clip');},
 drawImage(...args){records.push(['image',...args]);}
};
const image={naturalWidth:480,naturalHeight:800};
const out=painter.paint(ctx,tile,rect,walls.compile(rect),image,{valid:true});
assert(out.drawn&&out.repeats===3&&out.layer==='1B');
assert.deepEqual(records.filter(r=>Array.isArray(r)&&r[0]==='rect'),
 [['rect',104,132.5,12,45.5]]);
assert(records.indexOf('clip')<records.indexOf(records.find(r=>Array.isArray(r)&&r[0]==='image')));
assert.deepEqual(records.filter(r=>Array.isArray(r)&&r[0]==='image').map(r=>r.slice(2)),
 [[104,132.5,12,20],[104,152.5,12,20],[104,172.5,12,20]]);
assert.equal(records.at(-1),'restore');
assert.equal(painter.paint(ctx,tile,rect,walls.compile(rect),image,{valid:false}).reason,
 'wall-audit-not-valid');
assert.equal(painter.paint(ctx,tile,rect,walls.compile(rect),null,{valid:true}).reason,
 'texture-not-loaded');
assert.equal(painter.paint(ctx,tile,walls.templates.tee,walls.compile(walls.templates.tee),image,{valid:true}).reason,
 'no-authored-gate-to-hall-route');
const afterGate=walls.compile(rect).gates[0];
assert.deepEqual(afterGate.start,originalGate.start);
assert.equal(walls.isSolid(walls.compile(rect),[110,178]),false);
assert(walls.audit(rect,tile,{profilePainter:profile}).valid);
assert.equal(walls.audit(rect,{...tile,edges:['L','W','L','W']},{profilePainter:profile}).valid,false);
assert.equal(walls.audit(rect,{...tile,edges:['L','S','L','S']},{profilePainter:profile}).valid,false);
const html=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const marker of ['id="showWalkway" checked','id="walkwayRepeat"','id="walkwayStatus"',
 'assets/v3/courtyard-walkway.js?rev=46',"courtyardWalkway.paint(ctx,tile,model",
 'loadWalkway();'])assert(html.includes(marker),marker);
const p=html.indexOf('courtyardPaving.paint(ctx,tile'),w=html.indexOf('courtyardWalkway.paint(ctx,tile'),hall=html.indexOf("if(visible('showHall')&&gallery.hall)");
assert(p>=0&&w>p&&hall>w,'Walkway is above ground paving but BELOW hall and wall architecture');
assert(!fs.readFileSync('index.html','utf8').includes('courtyard-walkway.js'));
console.log('V3 independent painted walkway SHA + embedded unchanged pigment, exact clip/tiling and legal gate-to-hall routes passed.');
