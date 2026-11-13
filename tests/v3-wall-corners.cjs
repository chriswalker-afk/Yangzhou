'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const wall=require('../assets/v3/wall-geometry.js');
const profile=require('../assets/v3/wall-profile.js');
const paint=require('../assets/v3/wall-face-materials.js');
const coping=require('../assets/v3/wall-roof-texture.js');
const tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
const rectModel=wall.templates.rectangle,compiled=wall.compile(rectModel);
const form=profile.build(compiled,rectModel.hall);
const locationByName={NW:[42,47],NE:[178,47],SW:[42,178],SE:[178,178]};
const equals=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-7;
function inside(quad,point){
 let ok=false;
 for(let i=0,j=quad.length-1;i<quad.length;j=i++){
  const a=quad[i],b=quad[j];
  if((a[1]>point[1])!==(b[1]>point[1]) &&
     point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])ok=!ok;
 }
 return ok;
}
assert.equal(form.cornerFills.length,4,
 'Every L orientation must receive a real projected plaster/stone corner, not just SE');
assert.equal(profile.cornerFills(compiled,rectModel.hall).length,4,
 'Direct legacy cornerFills API remains supported');
const cornerTypes=new Set();
for(const [kind,point] of Object.entries(locationByName)){
 const join=form.cornerFills.find(f=>equals(f.joint,point));
 assert(join,'Missing physical '+kind+' corner');
 cornerTypes.add(kind);
 assert(join.horizontal.axis==='horizontal'&&join.vertical.axis==='vertical');
 assert(join.outerX>point[0]+profile.COPING_HALF);
 assert(join.outerY>point[1]+profile.COPING_HALF);
 assert(inside(join.face,[point[0]+2,point[1]+8]),
  'Projected plaster pier must fill old exposed grass behind the '+kind+' miter');
 assert(inside(join.base,[point[0]+3,join.outerY-.65]),
  'Stone foundation must continue around the lower '+kind+' edge');
 assert(inside(join.baseEast,[join.outerX-.65,point[1]+3]),
  'Stone foundation must wrap around the right '+kind+' edge');
 assert(inside(join.underEave,[point[0]+3,point[1]+1]),
  'Plaster must reach beneath the coping without showing on its hidden side');
 assert(inside(join.shadowSouth,[point[0]+3,join.outerY+.25]));
 assert(inside(join.shadowEast,[join.outerX+.25,point[1]+3]));
 assert(!inside(join.face,[point[0]-2,point[1]-2]),
  'The projected pier may not place plaster above/left of the visible roofing');
 const segments=coping.segments(compiled);
 assert(segments.some(s=>coping.pointInPolygon([point[0]+1,point[1]+1],s.quad)),
  'The original roof remains painted across the '+kind+' corner footprint');
}
assert.equal(cornerTypes.size,4);
assert.equal(profile.build(wall.compile(wall.templates.partial),wall.templates.partial.hall).cornerFills.length,2);
assert.equal(profile.build(wall.compile(wall.templates.elbow),wall.templates.elbow.hall).cornerFills.length,1);
assert.equal(profile.build(wall.compile(wall.templates.tee),wall.templates.tee.hall).cornerFills.length,0);
const logged=[],ctx={
 globalAlpha:1,
 save(){logged.push('save')},restore(){logged.push('restore')},
 beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
 translate(){},rotate(theta){logged.push(['angle',theta])},
 drawImage(img,x,y,w,h){logged.push(['image',img,w,h,this.globalAlpha])},
 stroke(){logged.push('stroke')},
 createLinearGradient(){return {addColorStop(){}}},
 fill(){logged.push('fill')},setLineDash(){},arc(){}
};
const ivory={width:1256,height:314},stone={width:1256,height:157};
const plasterTiles=paint.drawPlaster(ctx,form,tile,ivory,profile);
const stoneTiles=paint.drawStone(ctx,form,tile,stone,profile);
assert(plasterTiles>0&&stoneTiles>0);
const images=logged.filter(x=>Array.isArray(x)&&x[0]==='image');
assert.equal(images.length,plasterTiles+stoneTiles);
assert(images.every(x=>x[4]===1),
 'Opaque painting must not darken overlapping joint regions twice');
assert(images.some(x=>x[1]===ivory)&&images.some(x=>x[1]===stone));
assert(logged.some(x=>Array.isArray(x)&&x[0]==='angle'&&x[1]===-Math.PI/2),
 'Vertical stone returns reuse the genuine source painting rotated by 90 degrees');
const actual=profile.draw(ctx,compiled,tile,{
 hall:rectModel.hall,materialPainter:paint,plasterImage:ivory,stoneImage:stone
});
assert.equal(actual.outerCornerFills,4);
assert(actual.plasterTextureUsed&&actual.stoneTextureUsed);
const ret=profile.drawGateReturns(ctx,compiled,tile,{hall:rectModel.hall});
assert.equal(ret,2,'Each moon gate needs a visible return at both real wall ends');
assert(!form.cornerFills.some(j=>inside(j.face,[110,178])),
 'Masonry corner patches must not fabricate geometry across the moon-gate opening');
for(const m of Object.values(wall.templates)){
 const c=wall.compile(m),f=profile.build(c,m.hall);
 for(const gate of c.gates){
  assert(!f.cornerFills.some(j=>inside(j.face,gate.center)),
   'Junction plaster must leave the centre of every gate passable');
 }
 const report=wall.audit(m,tile,{profilePainter:profile});
 assert(report.valid,m.id+' corner geometry must fit original grass tile: '+report.issues.join('; '));
 assert.deepEqual(report,wall.audit(m,{...tile,x:5,y:3},{profilePainter:profile}),
  'Projected corners must remain tile-local, independent of board placement');
}
for(const edges of [['L','W','L','W'],['L','S','L','S']]){
 assert(!wall.audit(rectModel,{...tile,edges},{profilePainter:profile}).valid,
  'Expanded corner footprints must never overlap the original street/canal routes');
}
const page=fs.readFileSync('wall-geometry-lab-v3.html','utf8');
for(const marker of ['rev 40','id="cornerNW"','id="cornerNE"','id="cornerSW"','id="cornerSE"',
 'renderCornerInspection()','assets/v3/wall-profile.js?rev=40',
 'assets/v3/wall-face-materials.js?rev=40'])
 assert(page.includes(marker),'Missing review-ready V3 corner detail '+marker);
assert(!fs.readFileSync('layer2-lab-v3.html','utf8').includes('wall-profile.js'));
assert(!fs.readFileSync('courtyard-enclosure-lab-v3.html','utf8').includes('wall-face-materials.js'));
console.log('V3 corner masonry QA passed: NW/NE/SW/SE projected piers, continuous plaster, two-sided stone bases, roof coverage, exact gate jambs and original route exclusions.');
