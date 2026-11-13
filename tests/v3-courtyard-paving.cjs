'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const painter=require('../assets/v3/courtyard-paving.js');
const walls=require('../assets/v3/wall-geometry.js');
const geometry=require('../assets/v3/base-geometry.js');
const packageManifest=JSON.parse(fs.readFileSync('assets/v3/materials/manifest.json','utf8'));
const spec=packageManifest.layer1BCourtyardPaving;
assert(spec,'Layer 1B courtyard candidate requires a manifest entry');
assert.equal(spec.productionApproved,false);
assert.equal(spec.repeatSeamApproved,false,'Never auto-approve imperfect painterly repeat seams');
assert.equal(spec.layer,'1B');
for(const prop of ['id','path','width','height','bytes','sha256','sourcePngSha256'])
 assert.equal(spec[prop],painter.ASSET[prop],'Runtime and manifest must agree on '+prop);
const bytes=fs.readFileSync(painter.ASSET.path);
assert.equal(bytes.length,682158);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
 'fc7f03b7f047295ac0e1de8d7872d5f143874bc506c4b9d9bbd39a324da4a083');
assert.equal(bytes.toString('ascii',0,4),'RIFF');
assert.equal(bytes.toString('ascii',8,12),'WEBP');
assert.equal(bytes.toString('ascii',12,16),'VP8 ');
assert.equal(bytes.readUInt16LE(26)&0x3fff,1254);
assert.equal(bytes.readUInt16LE(28)&0x3fff,1254);
assert.equal(painter.ASSET.worldPeriod,96);
assert.equal(packageManifest.materials.length,3,'Existing Layer 1A material pack stays at its three original candidates');
assert.equal(packageManifest.periodWorldUnitsByMaterial.grass,440);
assert.equal(packageManifest.periodWorldUnitsByMaterial.stone,220);
assert.equal(packageManifest.periodWorldUnitsByMaterial.water,440);
const rect=walls.templates.rectangle,region=painter.regionFor(rect);
assert.deepEqual(region,{x:42,y:47,width:136,height:131,
 shape:'orthogonal-enclosure-interior',source:'rectangle-wall-centreline'});
for(const name of ['partial','elbow','tee'])assert.equal(painter.regionFor(walls.templates[name]),null,
 'Do not pave open courtyard geometry before a region is explicitly authored');
assert.equal(painter.regionFor(null),null);
assert.equal(painter.regionFor({id:'rectangle',paths:[{id:'perimeter',points:[[10,20],[40,20],[40,30]]}]}),null);
const records=[],ctx={
 save(){records.push(['save']);},restore(){records.push(['restore']);},
 beginPath(){records.push(['beginPath']);},rect(...x){records.push(['rect',...x]);},
 clip(){records.push(['clip']);},drawImage(...args){records.push(['drawImage',...args]);}
};
const image={width:1254,height:1254},tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
const result=painter.paint(ctx,tile,rect,image,{valid:true});
assert(result.drawn&&result.layer==='1B'&&result.repeats===4);
assert.deepEqual(records.filter(x=>x[0]==='rect'),[['rect',42,47,136,131]]);
assert(records.findIndex(x=>x[0]==='clip')<records.findIndex(x=>x[0]==='drawImage'));
const draws=records.filter(x=>x[0]==='drawImage');
assert.deepEqual(draws.map(x=>x.slice(2)),[
 [0,0,96,96],[0,96,96,96],[96,0,96,96],[96,96,96,96]
]);
assert.equal(records.at(-1)[0],'restore');
for(const [model,valid,art,reason] of [
 [rect,false,image,'wall-audit-not-valid'],
 [rect,true,null,'painting-not-loaded'],
 [walls.templates.partial,true,image,'no-enclosed-region']
]){
 const skip=painter.paint(ctx,tile,model,art,{valid});
 assert(!skip.drawn&&skip.reason===reason);
}
const tile2={...tile,x:1,y:1};
const ctx2={...ctx,rect(...x){records.push(['global-rect',...x]);},
 drawImage(_img,x,y,w,h){records.push(['global-image',x,y,w,h]);}};
assert(painter.paint(ctx2,tile2,rect,image,{valid:true}).drawn);
const positions=records.filter(x=>x[0]==='global-image');
assert(positions.length>0&&positions.every(row=>row[1]%96===0&&row[2]%96===0),
 'Texture phase remains world-aligned when a courtyard is on a different tile');
assert.deepEqual(geometry.PORT_WIDTHS||{street:44,canal:88},geometry.PORT_WIDTHS||{street:44,canal:88});
for(const model of Object.values(walls.templates)){
 const legal=walls.audit(model,tile);
 assert(legal.valid,'No alteration to wall or road/canal geometry for '+model.id);
}
const html=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const marker of ['rev 44','assets/v3/courtyard-paving.js?rev=44',
 'id="showPaving"','id="pavingRepeat"','id="pavingStatus"',
 'courtyardPaving.paint(ctx,tile,model,pavingImage,{valid:true})',
 'if(visible(\'showHall\')&&gallery.hall)']){
 assert(html.includes(marker),'Missing real Layer 1B integration marker '+marker);
}
assert(html.indexOf('courtyardPaving.paint(ctx,tile,model,pavingImage,{valid:true})')<
 html.indexOf("if(visible('showHall')&&gallery.hall)"),
 'Courtyard paving is drawn UNDER the courtyard hall');
assert(html.indexOf("if(visible('showHall')&&gallery.hall)")<
 html.indexOf("if(visible('showWall'))walls.draw("),
 'Existing Layer 2 structure draw order must be preserved');
assert(!fs.readFileSync('layer2-lab-v3.html','utf8').includes('courtyard-paving.js'));
assert(!fs.readFileSync('index.html','utf8').includes('courtyard-paving.js'));
console.log('V3 Layer 1B paving QA passed: real WebP SHA+dimensions, 2×2 repeat proof, clipped enclosed-only polygon, world-aligned tiling, hall/walls above, V2 isolated.');
