/**
 * Yangzhou / Carcassonne-style square-tile painter.
 *
 * One game tile === one stand-alone, high-detail, square art asset.
 * Roads and canal topology are painted BEFORE decorative architectural
 * foreground elements, from deterministic N/E/S/W centred connector masks.
 * Never crop a panoramic scene and pretend it is tileable.
 */
(() => {
  'use strict';
  const S=220,TAU=Math.PI*2,MAX_CACHE=46;
  const sourceRoot='assets/tiles/';
  const NAMES=[
    'road-straight','bridge-stone','garden-willow','garden-courtyard',
    'garden-rockery','garden-blossoms','garden-riverside','garden-teahouse',
    'road-stone-texture','canal-water-texture','five-pavilion-foreground'
  ];
  const imgs={};const cache=new Map();let errors=[];
  function load(){
    for(const name of NAMES){
      const img=new Image();imgs[name]=img;
      img.onload=()=>{window.YangzhouDebug?.state&&(window.YangzhouDebug.state.dirty=true);};
      img.onerror=()=>{errors.push(name);window.YangzhouDebug?.state&&(window.YangzhouDebug.state.dirty=true);};
      img.src=sourceRoot+name+(name==='five-pavilion-foreground'?'.png':'.webp');
    }
  }
  const ok=name=>!!(imgs[name]?.complete&&imgs[name]?.naturalWidth);
  const populated=()=>NAMES.filter(name=>ok(name)).length;
  const hash=(a,b=0)=>{const n=Math.sin((a+2)*127.17+(b+5)*311.73)*43758.5453;return n-Math.floor(n);};
  const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
  const skin={
    causeway:['road-straight'],lake:['garden-riverside'],
    tea:['garden-teahouse','garden-courtyard'],
    pagoda:['garden-willow'],five:['bridge-stone'],landing:['garden-riverside','garden-teahouse'],
    garden:['garden-willow','garden-courtyard','garden-rockery','garden-blossoms'],
    court:['garden-courtyard','garden-teahouse'],market:['garden-teahouse','garden-courtyard'],
    street:['garden-willow','garden-blossoms'],canal:['garden-riverside','garden-rockery'],
    bridge:['bridge-stone'],gate:['garden-courtyard'],
  };
  function baseFor(t){const a=skin[t.kind]||['garden-blossoms','garden-rockery'];return a[Math.abs(t.seed||0)%a.length];}
  function imageOr(c,name,x,y,w,h){if(!ok(name))return false;c.drawImage(imgs[name],x,y,w,h);return true;}
  function edgePoint(i){return [110+dirs[i][0]*110,110+dirs[i][1]*110];}
  function network(c,edges,type,width,paint){
    const chosen=edges.map((e,i)=>e===type?i:-1).filter(i=>i>=0);
    if(!chosen.length)return;
    c.save();c.lineCap='round';c.lineJoin='round';c.lineWidth=width;
    c.strokeStyle=paint;
    const draw=(begin,mid,end=null)=>{
      c.beginPath();c.moveTo(begin[0],begin[1]);
      if(end)c.quadraticCurveTo(mid[0],mid[1],end[0],end[1]);
      else c.lineTo(mid[0],mid[1]);
      c.stroke();
    };
    if(chosen.length===2){const [a,b]=chosen;
      const pa=edgePoint(a),pb=edgePoint(b);
      const opposite=((a+2)%4)===b;
      if(opposite)draw(pa,pb);
      else draw(pa,[110,110],pb); // smooth quarter turn, correct endpoints
    }else{
      for(const i of chosen)draw(edgePoint(i),[110,110]);
      // Junction ends remain smooth; no open central cut-off.
      c.beginPath();c.arc(110,110,width/2,0,TAU);c.fillStyle=paint;c.fill();
    }
    if(chosen.length===1){
      c.beginPath();c.arc(110,110,width/2,0,TAU);c.fillStyle=paint;c.fill();
    }
    c.restore();
  }
  function texturedPaint(c,key,fallback){
    if(!ok(key))return fallback;
    const p=c.createPattern(imgs[key],'repeat');
    return p||fallback;
  }
  function perimeter(c,t){
    // Bank and curb centerlines use the same coordinate as the edge contract.
    const edge=window.YangzhouEdgeArt;
    if(edge?.drawBands)edge.drawBands(c,t.edges);
  }
  function plant(c,x,y,r,seed){
    // Sparse separate botanical ink strokes occupy safe land pockets only.
    c.save();c.translate(x,y);
    c.lineWidth=.9;c.strokeStyle='#61735f81';
    for(let i=0;i<8;i++){
      const angle=i*.82+seed,r2=r*(.4+hash(seed,i)*.5);
      c.beginPath();c.moveTo(0,1);c.lineTo(Math.cos(angle)*r2,Math.sin(angle)*r2*.62);c.stroke();
    }
    c.restore();
  }
  function drawLocalArchitecture(c,t){
    if(t.kind==='pagoda'){
      // The White Pagoda must be a bottle-shaped white stupa, not a tower.
      c.save();c.translate(63,143);
      c.shadowColor='#494f402c';c.shadowBlur=9;c.shadowOffsetY=5;
      c.fillStyle='#e8e5d9';c.strokeStyle='#7d8179';c.lineWidth=1.4;
      c.beginPath();c.moveTo(-17,21);c.bezierCurveTo(-25,-1,-12,-18,-7,-22);
      c.bezierCurveTo(-4,-25,-4,-36,-4,-46);c.lineTo(4,-46);
      c.bezierCurveTo(4,-35,4,-25,7,-22);c.bezierCurveTo(16,-12,25,-1,17,21);
      c.closePath();c.fill();c.stroke();c.shadowBlur=0;
      c.fillStyle='#d7cbb2';c.fillRect(-24,21,48,10);
      c.strokeStyle='#8b8777';c.strokeRect(-24,21,48,10);
      c.strokeStyle='#ab9461';c.lineWidth=3;
      c.beginPath();c.moveTo(0,-47);c.lineTo(0,-62);c.stroke();
      for(let i=0;i<4;i++){c.beginPath();c.ellipse(0,-46-i*4,4.5-i*.6,1.6,0,0,TAU);c.stroke();}
      c.restore();
    }
    if(t.kind==='five'){
      // The bridge underpainting is a separate tile; the five roofs are
      // a separate illustration layer, never hard-coded into the lake base.
      if(!imageOr(c,'five-pavilion-foreground',12,82,196,85)){
        c.save();for(let i=0;i<5;i++){
          const x=29+i*41;c.fillStyle='#b69b6b';
          c.beginPath();c.moveTo(x-15,102);c.lineTo(x,80);c.lineTo(x+15,102);
          c.closePath();c.fill();c.strokeStyle='#6d6553';c.lineWidth=1;c.stroke();
        }c.restore();
      }
    }
    if(t.kind==='tea'||t.kind==='market'){
      for(let i=0;i<3;i++){
        const x=35+i*18,y=162+(i%2)*5;
        c.fillStyle='#ece1c9';c.strokeStyle='#87715c';c.lineWidth=.65;
        c.beginPath();c.ellipse(x,y,3,1.7,0,0,TAU);c.fill();c.stroke();
      }
    }
  }
  function paint(c,t){
    c.save();c.beginPath();c.rect(0,0,S,S);c.clip();
    const base=baseFor(t);
    if(!imageOr(c,base,0,0,S,S)){
      c.fillStyle='#b2b78b';c.fillRect(0,0,S,S);
    }
    const W=t.edges.includes('W'),R=t.edges.includes('S');
    // A waterway is its own navigable network. It is always below streets.
    if(W){
      network(c,t.edges,'W',106,'#7d8d76b0');   // rough painted bank underwash
      network(c,t.edges,'W',94,'#d1d0b394');    // stone margin
      network(c,t.edges,'W',88,texturedPaint(c,'canal-water-texture','#87afa7'));
      network(c,t.edges,'W',79,'#8cb5ad2b');
    }
    if(R){
      network(c,t.edges,'S',54,'#8c8b70a0');
      network(c,t.edges,'S',48,'#d7c7a9');
      network(c,t.edges,'S',44,texturedPaint(c,'road-stone-texture','#cebca0'));
      network(c,t.edges,'S',39,'#f1e5ca12');
    }
    if(W&&R){
      // Separate raised pedestrian bridge over water, with stone railings.
      const northSouth=t.edges[0]==='W'&&t.edges[2]==='W';
      c.save();c.strokeStyle='#796d5ac3';c.lineWidth=2.2;
      if(northSouth){
        c.beginPath();c.moveTo(40,96);c.lineTo(180,96);c.moveTo(40,123);c.lineTo(180,123);c.stroke();
      }else{
        c.beginPath();c.moveTo(96,40);c.lineTo(96,180);c.moveTo(123,40);c.lineTo(123,180);c.stroke();
      }
      c.restore();
    }
    // Local architecture never controls the geometry of a road/canal exit.
    drawLocalArchitecture(c,t);
    if(t.kind==='garden'||t.kind==='pagoda'||t.kind==='court'){
      for(let k=0;k<6;k++)plant(c,17+((k*73)%187),24+((k*41)%168),5,k+t.seed);
    }
    perimeter(c,t);
    c.restore();
  }
  function raster(t,resolution){
    const can=document.createElement('canvas');can.width=can.height=S*resolution;
    const c=can.getContext('2d');c.scale(resolution,resolution);paint(c,t);return can;
  }
  function draw(c,t,time,scale=1){
    if(!ok(baseFor(t)))return false;
    const detail=scale>=2.7?5:4;
    const k=[t.kind,t.edges.join(''),t.seed||0,detail].join(':');
    let can=cache.get(k);
    if(!can){can=raster(t,detail);cache.set(k,can);if(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);}
    else{cache.delete(k);cache.set(k,can);}
    c.save();c.translate(t.x*S,t.y*S);c.drawImage(can,0,0,S,S);c.restore();return true;
  }
  function drawBridgeOccluders(c,board){
    // Future production layers may register more independent roofs and trees.
    // The bridge roof layer is already part of the stationary tile painting;
    // actors are drawn only along designated bridge deck path heights.
  }
  window.YangzhouTiles={draw,drawBridgeOccluders,ready:()=>populated()>=8,
    assetsReady:()=>NAMES.filter(ok),errors:()=>errors.slice(),
    stats:()=>({cached:cache.size,loaded:populated(),mode:'individual-square-tile-masters'}),
    tileSize:S,sourceFor:baseFor,clear:()=>cache.clear()};
  load();
})();