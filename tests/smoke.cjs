/* Zero-dependency browser logic smoke tests for Yangzhou.
   Canvas calls use a lightweight mock; these do NOT replace visual browser testing. */
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const artwork=fs.readFileSync('artwork.js','utf8');
const ambient=fs.readFileSync('ambient.js','utf8');
const living=fs.readFileSync('living-scene.js','utf8');
const edges=fs.readFileSync('edge-art.js','utf8');
const tiles=fs.readFileSync('tile-system.js','utf8');
const topology=fs.readFileSync('tile-topology.js','utf8');
const schema=require('../tile-topology.js');
assert.equal(schema.portWidth.S,44);
assert.equal(schema.portWidth.W,88);
assert.equal(schema.center,110);
assert.equal(schema.starter.length,6);
const renderer=fs.readFileSync('tile-system.js','utf8');
const edgePainter=fs.readFileSync('edge-art.js','utf8');
// A production landmark master must not be obscured by a second
// procedurally drawn landmark or a translucent vector street.
assert(renderer.includes("if(!master&&!useAtlas&&(t.kind==='five'"),'No duplicate landmarks over square art masters');
assert(!renderer.includes("const spur=t.kind==='pagoda'"),'No fake road spurs across landmark paintings');
assert(!edgePainter.includes('drawBands(c,t.edges,exposed)'), 'No doubled edge wash around starter');
assert(renderer.includes('if(!useAtlas)window.YangzhouEdgeArt?.drawBands?.(c,t.edges)'), 'Coherent lake tiles must not receive feathered edge washes');

assert.equal(new Set(schema.starter.map(t=>t.master)).size,6);
assert.deepEqual(schema.validateBoard(schema.starter),[]);
for(const t of schema.starter){
  for(let k=0;k<4;k++)assert.equal(schema.rotateEdges(t.edges,k).length,4);
}
for(const a of schema.archetypes){
  assert.equal(schema.rotateEdges(a.edges,4).join(''),a.edges.join(''));
  assert.equal(schema.rotateEdges(a.edges,-1).join(''),schema.rotateEdges(a.edges,3).join(''));
}
const bad=schema.starter.map(t=>({...t,edges:t.edges.slice()}));
bad[0].edges[1]='W';
assert(schema.validateBoard(bad).length>0,'Invalid adjacent topology must be rejected');
new vm.Script(topology,{filename:'tile-topology.js'});
assert(edges.includes('S:44,W:88')||edges.includes('S:44,W:88'),'Shared edge art must use canonical port widths');

new vm.Script(tiles,{filename:'tile-system.js'});
assert(html.includes('<script src="tile-system.js"></script>'),'The new square-tile art renderer must load');
assert(!html.includes('drawStarterAtlas(ctx'),'A full starter panorama must never be drawn as the board');
assert(tiles.includes('const S=220')&&tiles.includes('network(c,t.edges'),
       'Every square image must share topology-aware connection geometry');
new vm.Script(edges,{filename:'edge-art.js'});
assert(html.includes('<script src="edge-art.js"></script>'),'Universal edge painter should load');
assert(edges.includes('drawStarterPerimeter')&&edges.includes('drawBands'),
       'Fixed and newly placed tiles must share a border geometry contract');

new vm.Script(living,{filename:'living-scene.js'});
assert(html.includes('<script src="living-scene.js"></script>'),'Living painting module should be loaded');
assert(html.includes('id="livingToggle"'),'Clean-plate comparison control should exist');
assert(living.includes('bridge-foreground.png')&&living.includes('starter-clean.webp'),
       'Layer system must load a clean plate and separate bridge foreground');

const scripts=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)]
  .map(x=>x[1]).filter(x=>x.trim());
assert.equal(scripts.length,1,'Expected one inline main game script');

function makeContext(){
  const x={};
  for(const k of ['save','restore','beginPath','closePath','clip','rect','fill','stroke',
   'moveTo','lineTo','arc','ellipse','fillRect','strokeRect','clearRect','setTransform',
   'translate','scale','rotate','quadraticCurveTo','bezierCurveTo','drawImage','setLineDash']){
   x[k]=()=>{};
  }
  x.createLinearGradient=()=>({addColorStop:()=>{}});
  return x;
}
class Element{
 constructor(id){this.id=id;this.textContent='';this.disabled=false;this.style={};this.attrs={};
  this.events={};this.classList={add(){},remove(){},toggle(){}};
  this.ctx=makeContext();this.width=0;this.height=0;}
 getContext(){return this.ctx;}
 addEventListener(event,fn){this.events[event]=fn;}
 setPointerCapture(){}
 insertAdjacentElement(){}
 setAttribute(k,v){this.attrs[k]=v;}
}
const elements=new Map();
const document={
 getElementById(id){if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);},
 createElement(type){return new Element(type)}
};
const rafQueue=[];
const window={innerWidth:1280,innerHeight:830,addEventListener(){},matchMedia:()=>({matches:false})};
const context=vm.createContext({
 window,document,matchMedia:()=>({matches:false}),devicePixelRatio:2,
 requestAnimationFrame:(fn)=>rafQueue.push(fn),
 console,Math,Set,Map,Array,Object,Number,String,Uint8Array,Date
});
function execute(code,name){new vm.Script(code,{filename:name}).runInContext(context);}
function frame(count=1){for(let i=0;i<count;i++){
  const callbacks=rafQueue.splice(0);for(const cb of callbacks)cb((framesRun++)*16+16);
}}
let framesRun=0;
execute(artwork,'artwork.js');
execute(topology,'tile-topology.js');
execute(scripts[0],'game-inline.js');
// The old continuous ambient backplate is intentionally retired.
frame(2);

const game=window.YangzhouDebug;
assert(game,'Game debug API should exist');
assert.equal(game.board.size,6);
assert.equal(game.archetypes.length,13);
assert.equal(game.topology,window.YangzhouTileTopology);
assert.equal(game.board.get('1,1').master,'bridge-stone');
const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
for(const tile of game.board.values()){
 for(let i=0;i<4;i++){const other=game.board.get((tile.x+dirs[i][0])+','+(tile.y+dirs[i][1]));
  if(other)assert.equal(tile.edges[i],other.edges[(i+2)%4],'Starter edge mismatch');
 }
}
for(const type of game.archetypes){
 assert.equal(game.rotEdges(type.edges,4).join(''),type.edges.join(''),'Full rotation identity');
 for(let r=0;r<4;r++)assert.equal(game.rotEdges(type.edges,r).length,4);
}
const canvas=elements.get('scene'),st=game.state;
const click=(x,y)=>{
 canvas.events.pointerdown({pointerType:'mouse',pointerId:1,clientX:x,clientY:y});
 canvas.events.pointerup({pointerType:'mouse',pointerId:1,clientX:x,clientY:y});
};
assert(game.candidates().length>0,'Starter must allow at least one placement');
const site=game.candidates()[0];
const px=(site[0]*220+110)*st.scale+st.offsetX,py=(site[1]*220+110)*st.scale+st.offsetY;
click(px,py);
assert(st.selected,'Valid location should select');
assert.equal(elements.get('place').disabled,false);
elements.get('place').onclick();
assert.equal(game.board.size,7);
assert.equal(st.selected,null);
assert.equal(game.board.get(site.join(',')).fixed,undefined);

// Occupied tile cannot be placed again; geometry remains unchanged.
const placed=game.board.get(site.join(','));
click((placed.x*220+110)*st.scale+st.offsetX,(placed.y*220+110)*st.scale+st.offsetY);
assert.equal(st.selected,null);

elements.get('explore').onclick();
assert.equal(st.showSites,false);
assert.equal(elements.get('place').disabled,true);
elements.get('explore').onclick();
assert.equal(st.showSites,true);

const anchor={x:612,y:333};
const before={x:(anchor.x-st.offsetX)/st.scale,y:(anchor.y-st.offsetY)/st.scale};
canvas.events.wheel({preventDefault(){},deltaY:-250,deltaMode:0,clientX:anchor.x,clientY:anchor.y});
frame(70);
const after={x:(anchor.x-st.offsetX)/st.scale,y:(anchor.y-st.offsetY)/st.scale};
assert(Math.hypot(before.x-after.x,before.y-after.y)<1,'Zoom must stay anchored to pointer');
assert(st.scale>.8,'Wheel zoom should zoom in');
const zoomBeforeDetail=st.scale;
elements.get('viewDetail').onclick();frame(65);
assert(st.scale>=3.3&&st.scale>zoomBeforeDetail,'Detail preset should zoom toward target');
elements.get('fit').onclick();frame(70);
assert(st.scale<2,'Fit should return to city overview');

// Two-finger pinch updates the scale without accidental tile placement.
const t=(x,y)=>({clientX:x,clientY:y});
canvas.events.touchstart({preventDefault(){},touches:[t(490,300),t(570,300)]});
const touchStartScale=st.scale;
canvas.events.touchmove({preventDefault(){},touches:[t(470,300),t(590,300)]});
frame(65);
assert(st.scale>touchStartScale,'Pinch should increase scale');
canvas.events.touchend({preventDefault(){},touches:[]});

elements.get('motion').onclick();assert.equal(st.motion,false);
elements.get('motion').onclick();assert.equal(st.motion,true);
// Contract: EVERY position adjacent to the original six-tile lake must be
// able to accept at least one real deck archetype at a legal orientation.
// Stronger than edge labels alone: fill the entire 10-tile outside ring at once.
game.board.delete(site.join(','));
assert.equal(game.board.size,6,'Return to fixed starter before perimeter test');
const fixed=[...game.board.values()];
const perimeter=new Map(),directions=[[0,-1],[1,0],[0,1],[-1,0]];
for(const ft of fixed)for(let d=0;d<4;d++){
  const x=ft.x+directions[d][0],y=ft.y+directions[d][1],k=x+','+y;
  if(!game.board.has(k))perimeter.set(k,{x,y,side:d,port:ft.edges[d]});
}
assert.equal(perimeter.size,10,'3 x 2 starter must have ten expansion positions');
const ports=[...perimeter.values()].map(z=>z.port);
assert.equal(ports.filter(p=>p==='S').length,5,'Five outward roads have their own painted source-tile exits');
assert.equal(ports.filter(p=>p==='W').length,2,'North and south canal exits');
assert.equal(ports.filter(p=>p==='L').length,3,'Three natural garden/landscape borders');
const preferred={'S':'Stone-paved street','W':'Mooring basin','L':'Garden pavilion'};
const ring=[...perimeter.values()].sort((a,b)=>a.y-b.y||a.x-b.x);
for(const cell of ring){
  // Check any tile may match even before a suggested choice is made.
  const all=[];
  for(const arch of game.archetypes)for(let rotation=0;rotation<4;rotation++){
    const edges=game.rotEdges(arch.edges,rotation);
    if(game.canPlace(cell.x,cell.y,edges))all.push({name:arch.name,rotation});
  }
  assert(all.length>0,'No deck tile fits '+JSON.stringify(cell));
  // Place an explicitly chosen, easy-to-recognize candidate. The entire
  // outer ring must remain compatible with previously placed neighbours.
  const arch=game.archetypes.find(a=>a.name===preferred[cell.port]);
  assert(arch,'Missing archetype for '+cell.port);
  const rotation=[0,1,2,3].find(r=>{const e=game.rotEdges(arch.edges,r);return game.canPlace(cell.x,cell.y,e)&&(cell.port!=='L'||e[cell.side]==='S');});
  assert.notEqual(rotation,undefined,'No suitable '+arch.name+' at '+cell.x+','+cell.y);
  game.board.set(cell.x+','+cell.y,{
    x:cell.x,y:cell.y,edges:game.rotEdges(arch.edges,rotation),
    kind:arch.kind,name:arch.name,seed:31+game.board.size,rotation,fixed:false
  });
}
assert.equal(game.board.size,16,'All ten starter perimeter locations should be placeable simultaneously');
for(const t of game.board.values())for(let i=0;i<4;i++){
  const d=directions[i],other=game.board.get((t.x+d[0])+','+(t.y+d[1]));
  if(other)assert.equal(t.edges[i],other.edges[(i+2)%4],
    'Ring neighbour edges must match: '+t.x+','+t.y);
}
assert.deepEqual(schema.validateBoard([...game.board.values()]),[],
  'Expanded painted city must preserve topology on every internal seam');
console.log('Yangzhou smoke tests passed: shared schema, six standalone tile masters, 44/88 ports, rotations, 13 archetypes, ring and camera.');
