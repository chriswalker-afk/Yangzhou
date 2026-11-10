'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const topology=fs.readFileSync('tile-topology.js','utf8');
const art=fs.readFileSync('tile-art-v2.js','utf8');
const scripts=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
assert.equal(scripts.length,1,'Expected one inline game controller');
const calls=[];
function makeContext(){
 const c={};
 const f=['save','restore','beginPath','closePath','clip','rect','fill','stroke','moveTo','lineTo','arc','ellipse','fillRect','strokeRect',
  'clearRect','setTransform','translate','scale','rotate','quadraticCurveTo','bezierCurveTo','drawImage','setLineDash','fillText'];
 for(const k of f)c[k]=(...a)=>{calls.push(k);};
 c.createLinearGradient=()=>({addColorStop:()=>{}});
 return c;
}
class El{
 constructor(id){this.id=id;this.textContent='';this.disabled=false;this.style={};this.events={};this.classList={add(){},remove(){},toggle(){}};
 this.ctx=makeContext();this.width=0;this.height=0;this.attrs={};}
 getContext(){return this.ctx;}
 addEventListener(n,fn){this.events[n]=fn;}
 setPointerCapture(){}
 setAttribute(n,v){this.attrs[n]=v;}
 click(){this.onclick?.();}
}
const elements=new Map();
const document={
 getElementById(id){if(!elements.has(id))elements.set(id,new El(id));return elements.get(id);},
 createElement(type){return new El(type)}
};
class Image{
 constructor(){this.complete=false;this.naturalWidth=0;}
 set src(value){this._src=value;}
 get src(){return this._src;}
}
const queue=[],events={};
const window={innerWidth:1280,innerHeight:830,dispatchEvent(){},addEventListener(k,v){events[k]=v;}};
const ctx=vm.createContext({window,document,Image,Event:class Event{constructor(type){this.type=type;}},
 console,Math,Set,Map,Array,Object,Number,String,Uint8Array,Date,Promise,
 fetch:()=>new Promise(()=>{}),devicePixelRatio:2,
 requestAnimationFrame:(f)=>queue.push(f),matchMedia:()=>({matches:false})});
const run=(s,name)=>new vm.Script(s,{filename:name}).runInContext(ctx);
run(topology,'tile-topology.js');
run(art,'tile-art-v2.js');
run(scripts[0],'inline-game.js');
let now=0;
function frame(n=1){for(let i=0;i<n;i++){
 const active=queue.splice(0);now+=16;
 for(const cb of active)cb(now);
}}
frame(2);
const game=window.YangzhouDebug;
assert(game,'Game debug API missing');
assert.equal(game.archetypes.length,8);
assert.equal(game.board.size,6);
assert.equal(game.topology,window.YangzhouTileTopology);
assert.deepEqual([...window.YangzhouTileTopology.validateBoard([...game.board.values()])],[]);
assert.equal(window.YangzhouArtV2.inspect().mode,'v2-composition-studies');
for(const a of game.archetypes)for(let r=0;r<4;r++){
 const t={x:0,y:0,id:a.id,rotation:r,edges:game.rotEdges(a.edges,r),kind:a.kind};
 assert.equal(window.YangzhouArtV2.draw(makeContext(),t),true);
}
const canvas=elements.get('scene'),st=game.state;
const click=(x,y)=>{
 canvas.events.pointerdown({pointerType:'mouse',pointerId:1,clientX:x,clientY:y});
 canvas.events.pointerup({pointerType:'mouse',pointerId:1,clientX:x,clientY:y});
};
const possible=game.candidates();assert(possible.length>0);
const [x,y]=possible[0];
click((x*220+110)*st.scale+st.offsetX,(y*220+110)*st.scale+st.offsetY);
assert(st.selected,'Legal placement must select site');
elements.get('place').onclick();
assert.equal(game.board.size,7);
const placed=game.board.get(x+','+y);
assert.equal(placed.id,'garden-grove');
assert.equal(placed.rotation,0);
assert.equal(st.selected,null);
assert.deepEqual([...window.YangzhouTileTopology.validateBoard([...game.board.values()])],[]);
// PR13: a valid 1254px east-west image may temporarily take over ONLY
// the correct orientation; it is never re-used for a north-south street.
const pilot=new Image();pilot.complete=true;pilot.naturalWidth=1254;pilot.naturalHeight=1254;
window.YangzhouArtV2.registerReviewImage('street-straight:1',pilot);
assert.equal(window.YangzhouArtV2.getReviewImage('street-straight:1'),pilot);
assert.equal(window.YangzhouArtV2.inspect().temporaryReviewKeys.length,1);
assert.throws(()=>window.YangzhouArtV2.registerReviewImage('street-straight:0',pilot));
assert.equal(window.YangzhouArtV2.draw(makeContext(),{x:0,y:0,id:'street-straight',kind:'street',rotation:1,edges:['L','S','L','S']}),true);
assert(calls.includes('drawImage'),'Loaded street artwork should be drawn as an actual image');
window.YangzhouArtV2.clearReviewImage('street-straight:1');
assert.equal(window.YangzhouArtV2.getReviewImage('street-straight:1'),null);
const old=st.scale;
elements.get('viewDetail').onclick();frame(80);
assert(st.scale>=3.3&&st.scale>old,'Detail camera must zoom in');
elements.get('fit').onclick();frame(80);
assert(st.scale<2,'Fit must reset overview');
elements.get('explore').onclick();assert.equal(st.showSites,false);
elements.get('explore').onclick();assert.equal(st.showSites,true);
assert.equal(window.YangzhouArtV2.inspect().temporaryReviewKeys.length,0,'Original must not remain injected after clear');
console.log('V2 game smoke passed: camera, no legacy painter, eight tile types, rotation, placement, and schematic drawing.');
