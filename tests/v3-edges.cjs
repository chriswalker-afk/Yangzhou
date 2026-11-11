'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const topology=require('../tile-topology.js');
const geometry=require('../assets/v3/base-geometry.js');
const edges=require('../assets/v3/edge-system.js');
const spec=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/v3/style-spec.json'),'utf8'));

const near=(a,b,message)=>assert(Math.abs(a-b)<1e-8,message+' ('+a+' vs '+b+')');
assert.equal(geometry.signatures.length,20);
assert.deepEqual(Object.keys(edges.treatments),['S','W']);
assert.deepEqual(edges.treatments.S,{id:'path-verge',outside:2.5,contact:0.8,core:44});
assert.deepEqual(edges.treatments.W,{id:'canal-bank',outside:4,contact:1.2,core:88});
assert(spec.edgeTreatments.every(e=>e.status==='temporary-geometry-only'&&e.asset===null));
for(const e of spec.edgeTreatments){
  const type=e.routeType,rule=edges.treatments[type];
  assert(rule);assert.equal(e.landSideWidthWorldUnits,rule.outside);
  assert.equal(e.contactWidthWorldUnits,rule.contact);
  assert.equal(e.coreMouthWorldUnits,rule.core);
}

function edgeSection(trace,side){
  const t=trace.route.sides[0]===side?0:1;
  if(!trace.route.sides.includes(side))throw Error('Trace does not reach requested side');
  return edges.crossSection(trace.route,t);
}
function sectionRange(s,boundary,side){
  const axis=side%2===0?0:1;
  return [s[boundary].left[axis],s[boundary].right[axis]].sort((a,b)=>a-b);
}
for(const signature of geometry.signatures){
  const g=geometry.compile(signature.split('')),model=edges.compile(g);
  assert.equal(model.geometry,g);
  assert.equal(model.traces.length,g.paths.length,'One reusable edge trace per route');
  assert.deepEqual(g.edges,signature.split(''));
  for(const trace of model.traces){
    const r=trace.route,rule=edges.treatments[r.type];
    assert.equal(trace.role,g.bridge&&r.type==='S'?'bridge-deck':rule.id);
    assert.equal(trace.samples.length,r.kind==='quadratic'?49:2);
    for(const section of trace.samples){
      const [tx,ty]=section.tangent,[nx,ny]=section.normal;
      near(Math.hypot(tx,ty),1,'Unit tangent');
      near(Math.hypot(nx,ny),1,'Unit normal');
      near(tx*nx+ty*ny,0,'Tangent orthogonal to normal');
      near(Math.hypot(
        section.core.left[0]-section.core.right[0],
        section.core.left[1]-section.core.right[1]),rule.core,'Exact core width');
      near(Math.hypot(
        section.outer.left[0]-section.outer.right[0],
        section.outer.left[1]-section.outer.right[1]),rule.core+2*rule.outside,'Outer band');
      near(Math.hypot(
        section.contact.left[0]-section.contact.right[0],
        section.contact.left[1]-section.contact.right[1]),rule.core+2*rule.contact,'Contact rim');
    }
  }
  for(let side=0;side<4;side++){
    const port=g.exits[side],type=port.type;
    const candidates=model.traces.filter(trace=>trace.route.sides.includes(side));
    assert.equal(candidates.length,type==='L'?0:1,'No extra route or edging may exit land');
    if(type==='L')continue;
    const sample=edgeSection(candidates[0],side);
    const sideAxis=side%2===0?1:0;
    const border=side===0||side===3?0:220;
    near(sample.center[sideAxis],border,'Mouth ends on exact tile boundary');
    near(Math.abs(sample.tangent[sideAxis]),1,'Route meets edge perpendicularly');
    near(sample.tangent[1-sideAxis],0,'Zero tangential drift on tile edge');
    const mouth=sectionRange(sample,'core',side);
    near(mouth[0],port.start,'Surface mouth start');
    near(mouth[1],port.end,'Surface mouth end');
    const band=sectionRange(sample,'outer',side);
    near(band[0],port.start-edges.treatments[type].outside,'Land-side band start');
    near(band[1],port.end+edges.treatments[type].outside,'Land-side band end');

    // An independently compiled neighbour must share both material and edge
    // endpoints exactly; the originating route direction does not matter.
    const opposite=(side+2)%4;
    const other=['L','L','L','L'];other[opposite]=type;
    const neighbour=edges.compile(geometry.compile(other));
    const n=edgeSection(neighbour.traces.find(trace=>trace.route.sides.includes(opposite)),opposite);
    for(const boundary of ['core','outer','contact']){
      const a=sectionRange(sample,boundary,side),b=sectionRange(n,boundary,opposite);
      near(a[0],b[0],'Shared '+boundary+' first endpoint');
      near(a[1],b[1],'Shared '+boundary+' second endpoint');
    }
  }
}

// Geometry is unchanged regardless of whether placeholder edging is visible.
const bridge=edges.compile(geometry.compile('WSWS'.split('')));
assert.equal(bridge.traces.length,2);
assert.deepEqual(bridge.traces.map(t=>t.role),['canal-bank','bridge-deck']);
const junction=edges.compile(geometry.compile('LWWW'.split('')));
assert.equal(junction.traces.length,3);
const styles={
 stone:'stone-texture',water:'water-texture',pathVerge:'temporary-verge',
 pathContact:'temporary-verge-rim',canalBank:'temporary-bank',
 canalContact:'temporary-bank-rim',bridgeEdge:'temporary-deck',
 bridgeContact:'temporary-deck-rim'
};
function fakeCanvas(){
 const calls=[],moves=[];
 const ctx={
  beginPath(){},moveTo(x,y){moves.push([x,y]);},
  lineTo(){},closePath(){},fill(){calls.push(ctx.fillStyle);},
  fillStyle:''
 };
 return {ctx,calls,moves};
}
let rendered=fakeCanvas();
edges.draw(rendered.ctx,bridge,styles,{edges:true,x:440,y:220});
assert.deepEqual(rendered.calls,[
 'temporary-bank','temporary-bank-rim','water-texture',
 'temporary-deck','temporary-deck-rim','stone-texture'
],'Water and bank must render beneath the elevated bridge deck and rim');
const first=bridge.traces[0].samples[0].outer.left;
near(rendered.moves[0][0],first[0]+440,'World-space X offset');
near(rendered.moves[0][1],first[1]+220,'World-space Y offset');
rendered=fakeCanvas();
edges.draw(rendered.ctx,bridge,styles,{edges:false,x:440,y:220});
assert.deepEqual(rendered.calls,['water-texture','stone-texture'],'Off must retain exact base masks');
rendered=fakeCanvas();
edges.draw(rendered.ctx,junction,styles,{edges:true});
assert.deepEqual(rendered.calls,[
 'temporary-bank','temporary-bank','temporary-bank',
 'temporary-bank-rim','temporary-bank-rim','temporary-bank-rim',
 'water-texture','water-texture','water-texture'
],'Junction arms must each be painted before their common core to avoid internal border seams');

assert.throws(()=>edges.crossSection({type:'S',width:80},0));
assert.throws(()=>edges.pointOnRoute({kind:'bogus'},0));
assert.throws(()=>edges.compile(null));

const lab=fs.readFileSync(path.join(__dirname,'../layer-lab-v3.html'),'utf8');
for(const marker of [
 'assets/v3/edge-system.js','id="edges"','id="sceneChoice"',
 'edgeSystem', 'edging.draw(', 'edges:edgesVisible,x,y',
 "bridge:['LSLS','WSWS','LSLS'", "'canal-junction':['LWLW','LWWW'",
 "document.getElementById('sceneChoice').addEventListener('change',draw)"
])assert(lab.includes(marker),'Missing V3 Layer 1B laboratory contract: '+marker);
assert(!lab.includes('ctx.translate('),'Do not reset CanvasPattern phase per tile');
assert(!lab.includes('approved edge artwork'),'Cannot declare placeholder edging as approved');
console.log('V3 edge geometry passed: all 20 signatures, exact S/W masks, matching border ribbons, bends, junctions, bridge order and temporary-only art.');
