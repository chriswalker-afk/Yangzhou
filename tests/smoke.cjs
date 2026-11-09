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
execute(scripts[0],'game-inline.js');
execute(ambient,'ambient.js');
frame(2);

const game=window.YangzhouDebug;
assert(game,'Game debug API should exist');
assert.equal(game.board.size,6);
assert.equal(game.archetypes.length,12);
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
console.log('Yangzhou smoke tests passed: starter edges, 12 tiles, placement, explore, zoom anchoring, fit, pinch and motion.');
