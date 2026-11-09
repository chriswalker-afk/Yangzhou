/* Painted, topology-aware gameplay tiles. Uses locally stored handscroll images.
   This is a transition between the approved painting and bespoke rotatable tile art. */
(() => {
  'use strict';
  const S=220, cache=new Map(), MAX=48;
  const directions=[[0,-1],[1,0],[0,1],[-1,0]];
  const hash=(a,b)=>{const n=Math.sin((a+1)*143.87+(b+1)*317.19)*14569.17;return n-Math.floor(n);};
  // Fixed, orientation-neutral image samples: buildings never rotate sideways.
  const crops={
    tea:['breakfast',.47,.50,.80],market:['breakfast',.57,.42,.74],
    bridge:['bridge',.49,.47,.83],garden:['pagoda',.38,.46,.83],
    court:['pagoda',.61,.47,.73],street:['panorama',.25,.46,.66],
    landing:['panorama',.66,.58,.58],canal:['panorama',.55,.49,.53]
  },fallback=['panorama',.49,.43,.69];
  function crop(c,img,kind,seed){
    const [,cx,cy,portion]=crops[kind]||fallback;
    const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
    const side=Math.min(w,h)*portion;
    const jx=(hash(seed,3)-.5)*Math.min(90,w-side)*.65;
    const jy=(hash(seed,7)-.5)*Math.min(60,h-side)*.65;
    const sx=Math.max(0,Math.min(w-side,cx*w-side*.5+jx));
    const sy=Math.max(0,Math.min(h-side,cy*h-side*.5+jy));
    c.drawImage(img,sx,sy,side,side,0,0,S,S);
  }
  function pattern(c,img,rect){
    const p=document.createElement('canvas');p.width=160;p.height=160;
    p.getContext('2d').drawImage(img,...rect,0,0,p.width,p.height);
    return c.createPattern(p,'repeat');
  }
  function stroke(c,edges,which,width,paint){
    c.save();c.strokeStyle=paint;c.lineWidth=width;c.lineCap='butt';c.lineJoin='round';
    for(let i=0;i<4;i++)if(edges[i]===which){
      const [dx,dy]=directions[i];c.beginPath();c.moveTo(110,110);
      c.lineTo(110+dx*110,110+dy*110);c.stroke();
    }
    c.fillStyle=paint;c.beginPath();c.arc(110,110,width*.5,0,Math.PI*2);c.fill();c.restore();
  }
  function detail(c,edges,type){
    for(let i=0;i<4;i++)if(edges[i]===type){
      const [dx,dy]=directions[i];
      for(let k=1;k<=10;k++){const d=k*10,x=110+dx*d,y=110+dy*d;
        c.strokeStyle=type==='S'?'#685e4850':'#e8e7c451';c.lineWidth=type==='S'?.7:1.15;
        c.beginPath();c.moveTo(x-dy*(type==='S'?14:9),y+dx*(type==='S'?14:9));
        c.lineTo(x+dy*(type==='S'?14:9),y-dx*(type==='S'?14:9));c.stroke();
      }
    }
  }
  function raster(t,images){
    const el=document.createElement('canvas');el.width=660;el.height=660;
    const c=el.getContext('2d');if(!c)return null;c.scale(3,3);c.save();
    c.beginPath();c.rect(0,0,S,S);c.clip();
    const [key]=crops[t.kind]||fallback;
    crop(c,images[key],t.kind,t.seed||1);
    const water=pattern(c,images.panorama,[530,350,150,150]);
    const road=pattern(c,images.breakfast,[740,560,140,140]);
    if(t.edges.includes('W')){
      stroke(c,t.edges,'W',96,'#668f85e5');
      stroke(c,t.edges,'W',85,water);
      stroke(c,t.edges,'W',78,'#91b6a632');
      detail(c,t.edges,'W');
    }
    if(t.edges.includes('S')){
      stroke(c,t.edges,'S',51,'#706754bd');
      stroke(c,t.edges,'S',40,road);
      stroke(c,t.edges,'S',34,'#dbc6a436');
      detail(c,t.edges,'S');
    }
    if(t.kind==='bridge'){
      c.fillStyle='#cabb9fd5';c.fillRect(8,99,204,23);
      c.strokeStyle='#786a55';c.lineWidth=1.7;c.strokeRect(8,99,204,23);
      for(let k=0;k<6;k++){let x=12+k*36;c.beginPath();c.moveTo(x,100);c.lineTo(x,121);c.stroke();}
    }
    // Delicate paper grain, not a cartoon pixel-art overlay.
    c.save();c.globalAlpha=.10;
    for(let i=0;i<65;i++){const x=hash(i,13)*220,y=hash(i,29)*220;
      c.fillStyle=i%2?'#f4edd7':'#627c70';c.beginPath();c.arc(x,y,hash(i,7)*1.25,0,Math.PI*2);c.fill();}
    c.restore();c.restore();
    if(window.YangzhouEdgeArt?.drawBands)window.YangzhouEdgeArt.drawBands(c,t.edges);
    return el;
  }
  function draw(c,t){
    if(t.fixed)return false;
    // Animation architecture rule: never use old paintings containing fixed
    // people or boats as the source of a newly placed tile. Use only clean art.
    const clean=window.YangzhouLiving?.getCleanImage?.();
    if(!clean)return false;
    const images={panorama:clean,bridge:clean,breakfast:clean,pagoda:clean};
    const k=t.kind+'|'+t.edges.join('')+'|'+(t.seed||1);
    let img=cache.get(k);
    if(!img){img=raster(t,images);if(!img)return false;cache.set(k,img);
      if(cache.size>MAX)cache.delete(cache.keys().next().value);}
    c.save();c.translate(t.x*S,t.y*S);c.imageSmoothingQuality='high';
    c.drawImage(img,0,0,S,S);c.restore();return true;
  }
  window.YangzhouTileArt={draw,clear:()=>cache.clear(),stats:()=>({cached:cache.size,source:'clean-plate'})};
})();