/* Yangzhou Living Painting Architecture.
 * Explicit world layers: clean ground -> water/boats -> bridge occlusion ->
 * walking residents -> willow occlusion -> floating leaves. The existing
 * tile game stays responsible for tile geometry, selection and camera.
 */
(() => {
  'use strict';
  const DIR='assets/living/';
  const FILES={
    clean:'starter-clean.webp',
    bridge:'bridge-foreground.png',
    willow:'willow-foreground.png',
    upper:'boat-upper.png',
    lower:'boat-lower.png',
    blue:'walker-blue.png',
    rose:'walker-rose.png',
    ochre:'walker-ochre.png'
  };
  const images={};
  let active=true,loadError=null,ready=false;
  const world={width:660,height:440,imageWidth:1200,imageHeight:800};
  const residents=[
    {image:'blue',offset:0,reverse:false,pace:1},
    {image:'rose',offset:.43,reverse:true,pace:.83},
    {image:'ochre',offset:.7,reverse:false,pace:.74}
  ];
  const bridgeWalk=[[341,323],[392,313],[452,303],[508,290],[572,292],
                    [641,294],[714,297],[781,313],[847,333]];
  const upperWater=[[633,124],[623,177],[628,233],[633,288],[633,354],[631,417]];
  const lowerWater=[[665,692],[648,629],[635,571],[631,498],[635,427],[637,357],[630,285]];
  const pi=Math.PI;
  function load(){
    const tasks=Object.entries(FILES).map(([key,name])=>new Promise(resolve=>{
      const img=new Image();images[key]=img;
      img.onload=()=>resolve(true);
      img.onerror=()=>{loadError=name;resolve(false);};
      img.src=DIR+name;
    }));
    Promise.all(tasks).then(result=>{
      ready=!!result[0]&&!!result[1]&&!!result[2];
      const status=document.getElementById('assetStatus');
      if(status)status.textContent=ready?'Living painting: independent layers ready':'Painted clean-plate unavailable; original painting shown';
      invalidate();
    });
  }
  function invalidate(){if(window.YangzhouDebug?.state)window.YangzhouDebug.state.dirty=true;}
  function pointAlong(points,position){
    const lengths=[];let total=0;
    for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],
      d=Math.hypot(b[0]-a[0],b[1]-a[1]);lengths.push(d);total+=d;}
    let distance=Math.max(0,Math.min(1,position))*total;
    for(let i=0;i<lengths.length;i++){
      if(distance<=lengths[i]||i===lengths.length-1){
        const a=points[i],b=points[i+1],fraction=lengths[i]?distance/lengths[i]:0;
        return [a[0]+fraction*(b[0]-a[0]),a[1]+fraction*(b[1]-a[1])];
      } distance-=lengths[i];
    }
    return points[points.length-1];
  }
  function phase(t,length,offset=0){
    return ((t/length+offset)%1+1)%1;
  }
  function drawSprite(ctx,key,cx,cy,width,height,angle=0,bob=0){
    const im=images[key];if(!im?.complete||!im.naturalWidth)return false;
    ctx.save();ctx.translate(cx,cy+bob);ctx.rotate(angle);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(im,-width/2,-height/2,width,height);ctx.restore();return true;
  }
  function ripples(c,t,animate){
    c.save();c.lineWidth=1.5;
    const wakes=[[636,460],[641,560],[632,190],[618,230]];
    for(let i=0;i<wakes.length;i++){
      const p=wakes[i],base=animate?(t*.00032+i*.23)%1:i*.19;
      for(let j=0;j<3;j++){
        const u=(base+j/3)%1,rx=3+u*22,ry=1+u*7;
        c.globalAlpha=.2*(1-u);
        c.strokeStyle=i%2?'#e9e5c3':'#d1e0c9';
        c.beginPath();c.ellipse(p[0],p[1],rx,ry,.14,0,pi*1.85);c.stroke();
      }
    }c.restore();
  }
  function boats(c,t,animate){
    const tt=animate?t:0;
    // Each boat is a transparent asset removed from the clean plate.
    const up=phase(tt,48000,.18);
    const a=pointAlong(upperWater,up);
    drawSprite(c,'upper',a[0],a[1],88,64,-.06,animate?Math.sin(tt*.0011)*1.2:0);
    const down=phase(tt,59000,.66),b=pointAlong(lowerWater,down);
    drawSprite(c,'lower',b[0],b[1],143,116,.06,animate?Math.sin(tt*.0009)*1.5:0);
  }
  function people(c,t,animate){
    const tt=animate?t:0;
    residents.forEach((r,i)=>{
      let u=phase(tt,r.pace?53000/r.pace:53000,r.offset);
      if(r.reverse)u=1-u;
      const [x,y]=pointAlong(bridgeWalk,u);
      const bob=animate?Math.sin(tt*.009+i*2.4)*1.1:0;
      const sway=animate?Math.sin(tt*.0043+i)*.03:0;
      const im=images[r.image];
      if(!im?.naturalWidth)return;
      const ratio=im.naturalWidth/im.naturalHeight;
      const h=31+(i%2)*2,w=h*ratio;
      drawSprite(c,r.image,x,y-10,w,h,sway,bob);
    });
  }
  function steamAndLeaves(c,t,animate){
    const tt=animate?t:0;
    c.save();c.lineWidth=1.2;
    for(let j=0;j<6;j++){
      let x=1110+j*11,y=556-(animate?((tt*.012+j*16)%63):j*8);
      c.globalAlpha=.10*(1-((j+1)/8));
      c.strokeStyle='#fff4dd';
      c.beginPath();c.moveTo(x,y+9);c.bezierCurveTo(x-5,y+2,x+7,y-5,x+Math.sin(tt*.0008+j)*4,y-11);c.stroke();
    }
    const leaves=[[865,405],[931,440],[752,480],[1050,388],[323,450],[918,363],[744,360]];
    c.globalAlpha=.6;
    leaves.forEach(([x,y],i)=>{
      const p=animate?phase(tt,24000,i*.17):i*.16;
      const dx=p*48,dy=p*22;
      c.save();c.translate(x+dx,y+dy);
      c.rotate((animate?tt*.00042:0)+i);
      c.fillStyle=i%2?'#bd9f61ba':'#93a078b9';
      c.beginPath();c.ellipse(0,0,3.6,1.6,.15,0,pi*2);c.fill();c.restore();
    });
    c.restore();
  }
  function drawScene(c,time,scale=1,motion=true){
    if(!ready)return false;
    c.save();c.scale(660/1200,440/800);
    // The clean plate is unoccupied: no stationary boat or walker underneath.
    c.drawImage(images.clean,0,0,1200,800);
    if(active){
      ripples(c,time,motion);
      boats(c,time,motion);
    }
    // First occlusion layer: opaque balustrades and pavilion roofs cover
    // boat traffic beneath the bridge.
    c.drawImage(images.bridge,0,0,1200,800);
    if(active)people(c,time,motion);
    // Second occlusion layer: willow clusters in front of pedestrians.
    c.drawImage(images.willow,0,0,1200,800);
    if(active)steamAndLeaves(c,time,motion);
    c.restore();return true;
  }
  function toggle(){
    active=!active;
    const button=document.getElementById('livingToggle');
    if(button){
      button.textContent=active?'Clean plate':'Living city';
      button.setAttribute('aria-pressed',String(!active));
      button.title=active?'Show unpopulated painted background':'Restore animated inhabitants';
    }
    invalidate();return active;
  }
  function bind(){
    document.getElementById('livingToggle')?.addEventListener('click',toggle);
    load();
  }
  window.YangzhouLiving={
    drawScene,getCleanImage:()=>ready?images.clean:null,ready:()=>ready,active:()=>active,toggle,
    setActive:v=>{active=!!v;invalidate();},
    inspect:()=>({ready,active,loadError,world,
      images:Object.fromEntries(Object.entries(images).map(([k,v])=>[k,!!v.naturalWidth])),
      routes:{bridge:bridgeWalk,upperWater,lowerWater},
      residentCount:residents.length})
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
  else bind();
})();