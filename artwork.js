/* Yangzhou - illustrated tile renderer, camera/art proof of concept.
   Hand-authored, deterministic vector painting. No external pictures or dependencies.
   Historical architectural details are interpretive and require review. */
(() => {
'use strict';
const S=220, PI=Math.PI, TAU=PI*2, CACHE=new Map(), MAX_CACHE=48, MAX_CACHE_PIXELS=18_000_000;
let cachePixels=0;
const ink='#4e554c', paper='#e9e0ca', roofInk='#535d58';
const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
const H=(a,b,c=0)=>{const n=Math.sin((a+13)*127.17+(b+7)*311.73+(c+3)*74.79)*43758.5453;return n-Math.floor(n);};
function line(c,x1,y1,x2,y2,col=ink,w=1){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
function oval(c,x,y,rx,ry,fill,stroke=null,w=1,angle=0){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=w;c.strokeStyle=stroke;c.stroke();}}
function polygon(c,pts,fill,stroke=null,w=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function brush(c,x,y,rx,ry,col){c.save();c.globalAlpha=.19;c.fillStyle=col;for(let i=0;i<5;i++)oval(c,x+i*1.3,y+i*.7,rx-i*.8,ry+i*.2,col);c.restore();}
function ground(c,t){c.fillStyle=paper;c.fillRect(0,0,S,S);
 const seed=t.seed||1;
 for(let i=0;i<98;i++){const x=H(seed,i,2)*S,y=H(seed,i,8)*S,w=11+H(i,seed,4)*35;oval(c,x,y,w,w*.47,i%3===0?'#d4d8b66e':i%3===1?'#d6c1a16a':'#f9efdc66',null,0,H(i,seed)*PI);}
 for(let i=0;i<390;i++){const x=H(i,seed,8)*S,y=H(i,seed,9)*S,r=.22+H(i,seed,1)*.55;oval(c,x,y,r,r,i%3===0?'#827c624c':'#fff9e174');}
}
function node(c,edges,which,outer,inner){const any=edges.some(e=>e===which);if(!any)return;
 c.lineCap='butt';c.lineJoin='round';
 function stroke(col,width){c.strokeStyle=col;c.lineWidth=width;
   for(let i=0;i<4;i++)if(edges[i]===which){const d=dirs[i],ex=110+d[0]*110,ey=110+d[1]*110;c.beginPath();c.moveTo(110,110);c.lineTo(ex,ey);c.stroke();}
   oval(c,110,110,width*.5,width*.5,col);
 }
 stroke(outer,which==='W'?92:43);
 stroke(inner,which==='W'?82:35);
 if(which==='W'){
   c.save();c.globalAlpha=.18;const gr=c.createLinearGradient(73,0,157,0);gr.addColorStop(0,'#3d6d6b');gr.addColorStop(.45,'#f6f3db');gr.addColorStop(1,'#356b68');stroke(gr,76);c.restore();
   c.strokeStyle='#d4d2b587';c.lineWidth=1;
   for(let i=0;i<23;i++){let x=91+H(i,4)*36,y=H(i,8)*220,len=3+H(i,5)*9;
     // Water texture may appear only over actual water; clipping to the water paths follows.
     c.save();c.globalCompositeOperation='source-atop';c.beginPath();c.ellipse(x,y,len,1.5,.08,0,PI);c.stroke();c.restore();
   }
 }
 if(which==='S'){
   c.strokeStyle='#94877350';c.lineWidth=.8;
   for(let i=0;i<4;i++)if(edges[i]==='S')for(let j=0;j<11;j++){let d=dirs[i],v=18+j*8,x=110+d[0]*v,y=110+d[1]*v;
      line(c,x+(d[1]? -15:0),y+(d[0]?-15:0),x+(d[1]?15:0),y+(d[0]?15:0),'#7b73614d',.65);}
 }
}
function grass(c,x,y,s=1,seed=1){c.save();c.translate(x,y);c.scale(s,s);for(let k=0;k<10;k++){const a=H(seed,k)*PI,rr=5+H(k,seed)*10,xx=Math.cos(a)*rr,yy=Math.sin(a)*rr*.65;
   line(c,0,2,xx,yy-5,k%2?'#7e9870a5':'#aaa982a5',.75);}
 c.restore();}
function rock(c,x,y,s=1,seed=0){c.save();c.translate(x,y);c.scale(s,s);
 const pts=[[-17,8],[-15,-3],[-8,-12],[-2,-9],[5,-18],[12,-7],[18,-2],[16,11],[5,14],[-7,12]];
 polygon(c,pts,'#aaa993','#737d71',1);
 polygon(c,[[-12,3],[-7,-10],[-3,-3],[2,3]],'#d3d0ae99');
 line(c,-6,12,0,2,'#7b8170',.8);line(c,4,12,9,-1,'#787d6c',.8);
 for(let i=0;i<3;i++)oval(c,H(seed,i)*18-9,H(seed,i,2)*8-4,2,1,'#eae6cb99');
 c.restore();}
function waterDetails(c,t){if(!t.edges.includes('W'))return;
 const seed=t.seed||1;
 c.save();c.beginPath();
 // Clip reflections to water only; leave stone paths and garden land unmarked.
 for(let i=0;i<4;i++)if(t.edges[i]==='W'){
  if(i===0)c.rect(69,0,82,111);
  else if(i===1)c.rect(109,69,111,82);
  else if(i===2)c.rect(69,109,82,111);
  else c.rect(0,69,111,82);
 }c.clip();
 for(let i=0;i<35;i++){let x=78+H(i,seed,1)*64,y=H(i,seed,3)*S;const k=4+H(i,seed,6)*8;
    c.strokeStyle=i%4===0?'#e5e6cbb4':'#c2d2ba91';c.lineWidth=.7+H(i,seed,5)*.9;
    c.beginPath();c.ellipse(x,y,k,2,H(i,seed,2)*.4-.2,PI*.1,PI*.86);c.stroke();}
 if(t.kind==='lake'||t.kind==='landing'){for(let i=0;i<5;i++){let x=91+H(i,seed)*37,y=20+H(i,seed,9)*180;oval(c,x,y,4,2,'#819d7792','#647d6b70',.5);}}
 c.restore();
}
function tree(c,x,y,r=20,seed=1){c.save();c.translate(x,y);
 // Gentle wash behind successive dry-brush leaves.
 brush(c,0,-6,r*1.18,r*.74,'#a3b084');
 line(c,0,15,1,-12,'#766954',2.1);
 for(let i=0;i<13;i++){let a=i*2.399+seed,rr=(.3+.6*H(seed,i))*r,px=Math.cos(a)*rr,py=Math.sin(a)*rr*.58-9;
   const col=['#708870b8','#8da17bba','#a5ae86b0','#6b806dae'][i%4];
   oval(c,px,py,r*.36,r*.27,col,'#6e81694f',.5,a*.32);
   for(let j=0;j<3;j++){let xx=px+(H(i,j,seed)-.5)*r*.35,yy=py+(H(i,j,seed+3)-.5)*r*.22;
     line(c,xx-2,yy+1,xx+1,yy-2,'#dce0b596',.5);}
 }
 c.restore();}
function willow(c,x,y,seed=1){tree(c,x,y,21,seed);c.save();c.translate(x,y);
 for(let j=0;j<18;j++){let angle=-PI+.16+j*.3,sway=Math.sin(angle)*26,ex=sway+(H(seed,j)-.5)*12,ey=25+H(j,seed)*28;
   c.beginPath();c.moveTo(0,-13);c.quadraticCurveTo(ex*.9,-11,ex,ey);c.strokeStyle=j%3?'#8a9a75ba':'#b2b489bd';c.lineWidth=.8;c.stroke();
   for(let k=0;k<4;k++){let yy=-5+k*(ey+7)/4,xx=ex*(k+1)/5;oval(c,xx,yy,2,4.5,'#8ca37c96',null,0,angle*.2);}
 }c.restore();}
function blossoms(c,x,y,seed=1){c.save();c.translate(x,y);tree(c,0,0,16,seed);
 for(let i=0;i<32;i++){let x=(H(i,seed,3)-.5)*36,y=(H(i,seed,8)-.6)*25;
   oval(c,x,y,2+H(i,seed)*1.4,1.4,'#c38d87c2');}
 c.restore();}
function tiledRoof(c,x,y,w,h,variant=0){c.save();
 const shadow=c.createLinearGradient(x,y,x,y+h);shadow.addColorStop(0,'#f5e9d2');shadow.addColorStop(1,'#a8987d');
 c.fillStyle=shadow;c.fillRect(x+5,y+h*.30,w-10,h*.74);
 c.strokeStyle='#8b7b68';c.lineWidth=1.25;c.strokeRect(x+5,y+h*.30,w-10,h*.74);
 // Timber latticework visible beneath tiled canopy.
 c.fillStyle='#785e4a';for(let i=1;i<=4;i++){const xx=x+6+(w-12)*i/5;c.fillRect(xx,y+h*.57,2,h*.39);}
 for(let i=0;i<3;i++){const xx=x+12+i*(w-24)/3;c.fillStyle='#d2b99a';c.fillRect(xx,y+h*.60,(w-28)/3, h*.26);c.strokeStyle='#86684d';c.strokeRect(xx,y+h*.60,(w-28)/3,h*.26);
   line(c,xx,y+h*.6,xx+(w-28)/3,y+h*.86,'#977c63',.45);
   line(c,xx+(w-28)/3,y+h*.6,xx,y+h*.86,'#977c63',.45);}
 const roofGrad=c.createLinearGradient(0,y-8,0,y+h*.42);
 roofGrad.addColorStop(0,variant?'#8d9589':'#6f7974');roofGrad.addColorStop(.57,variant?'#606d68':'#596561');roofGrad.addColorStop(1,'#455550');
 polygon(c,[[x-6,y+h*.33],[x+w*.48,y-8],[x+w*.57,y-6],[x+w+6,y+h*.33],[x+w-4,y+h*.39],[x+2,y+h*.4]],roofGrad,'#475650',1.4);
 // Thin converging ceramic roof-tile lines.
 for(let i=0;i<=16;i++){let p=i/16,base=x+p*w;
  c.strokeStyle=i%2?'#d5d1b078':'#2e4b475d';c.lineWidth=.8;
  c.beginPath();c.moveTo(x+w*.52,y-6);c.quadraticCurveTo((base+x+w*.52)/2,y+h*.12,base,y+h*.35);c.stroke();}
 line(c,x-6,y+h*.33,x+2,y+h*.25,'#4b5651',1.5);line(c,x+w+6,y+h*.33,x+w-2,y+h*.25,'#4b5651',1.5);
 line(c,x+w*.48,y-8,x+w*.57,y-8,'#dfd6b6',1.2);
 // Roof ridge and occasional terminal ornaments.
 for(let i=0;i<4;i++){let xx=x+w*.34+i*w*.12;oval(c,xx,y+h*.08,1.1,.8,'#c5be9e5a');}
 c.restore();}
function pavilion(c,x,y,w=48,variant=0){c.save();c.translate(x,y);let s=w/52;c.scale(s,s);
 oval(c,0,19,34,10,'#5b614c29');
 c.fillStyle='#d3b998';c.fillRect(-20,4,40,16);
 c.strokeStyle='#956f50';c.lineWidth=3;for(const px of [-17,17])line(c,px,-1,px,20,'#895c45',3);
 polygon(c,[[-29,2],[0,-23],[29,2],[24,5],[-24,5]],variant?'#a58457':'#c0a36b','#6d5f49',1.4);
 c.strokeStyle='#86694d';c.lineWidth=1;c.beginPath();c.moveTo(-30,0);c.quadraticCurveTo(-20,-3,-10,-12);c.lineTo(0,-23);c.lineTo(10,-12);c.quadraticCurveTo(20,-3,30,0);c.stroke();
 for(let i=-2;i<=2;i++)line(c,i*7,-1,i*2,-19,'#e6d8a06b',.7);
 line(c,-31,1,-25,-5,'#6c6552',1.4);line(c,31,1,25,-5,'#6c6552',1.4);
 c.restore();}
function pagoda(c,x,y){c.save();c.translate(x,y);
 oval(c,0,53,40,17,'#4c544b36');
 polygon(c,[[-38,36],[-30,30],[30,30],[38,36],[37,49],[-37,49]],'#c0b9a0','#7f7e70',1.4);
 polygon(c,[[-29,27],[-24,22],[24,22],[29,27],[29,36],[-29,36]],'#e1ddc8','#898475',1.2);
 // Rounded, bottle-shaped stupa: one swelling body, not a stack of storeys.
 const grd=c.createLinearGradient(-25,-25,26,20);grd.addColorStop(0,'#fff9e9');grd.addColorStop(.5,'#ede7d9');grd.addColorStop(1,'#bfc0ae');
 c.beginPath();c.moveTo(-20,24);c.bezierCurveTo(-26,13,-29,-3,-21,-19);c.bezierCurveTo(-12,-34,-7,-40,-7,-55);c.lineTo(7,-55);
 c.bezierCurveTo(7,-40,12,-34,21,-19);c.bezierCurveTo(29,-3,26,13,20,24);c.closePath();c.fillStyle=grd;c.fill();c.strokeStyle='#787b70';c.lineWidth=1.7;c.stroke();
 for(let i=0;i<3;i++){const yy=12+i*6;c.beginPath();c.ellipse(0,yy,21+i*.2,3,0,0,PI);c.strokeStyle='#aba99b';c.lineWidth=1;c.stroke();}
 line(c,0,-55,0,-77,'#958a6f',2);for(let i=0;i<3;i++)oval(c,0,-58-i*6,5-i*1.3,2.1,'#b59a66','#8e855d',.5);oval(c,0,-79,3,3,'#baa36c');
 // Recessed door at base and carved plinth.
 c.fillStyle='#7d766a';c.beginPath();c.arc(0,24,5,PI,TAU);c.lineTo(5,30);c.lineTo(-5,30);c.fill();
 for(let i=-2;i<=2;i++){line(c,i*11,35,i*11,45,'#938e80',.6);}
 c.restore();}
function person(c,x,y,shirt='#a06e57',activity='walk'){c.save();c.translate(x,y);
 oval(c,2,14,7,2,'#514a3c28');
 line(c,-1,9,-3,15,'#776353',1.2);line(c,3,9,5,15,'#776353',1.2);
 polygon(c,[[-4,0],[5,0],[8,11],[-7,11]],shirt,'#6e6250',.7);
 oval(c,.5,-3,3.5,4,'#c7a587','#856d5b',.5);
 oval(c,0,-6,4,2.3,'#3f4038');
 if(activity==='carry'){line(c,6,4,13,6,'#72604e',1.2);oval(c,15,9,7,3,'#b89c68','#746145',.6);}
 if(activity==='tea'){oval(c,9,6,4,2,'#ede1ca','#8d715b',.6);line(c,6,5,3,3,'#bfa58c',.8);}
 c.restore();}
function garden(c,seed,kind='garden',edges=[]){for(let i=0;i<16;i++){const x=H(seed,i,3)*210+5,y=H(seed,i,4)*210+5;if(x<25||x>196||y<23||y>195)continue;
   let onRoute=false;for(let d=0;d<4;d++){const e=edges[d];if(e==='L')continue;
     const dx=dirs[d][0],dy=dirs[d][1],along=dx?(x-110)*dx:(y-110)*dy,across=dx?Math.abs(y-110):Math.abs(x-110);
     if(along>=-3&&along<=110&&across<(e==='W'?49:27))onRoute=true;
   }if(onRoute)continue;
   if(i%4===0)rock(c,x,y,.7+H(i,seed)*.65,seed+i);else if(i%3===0)grass(c,x,y,.7,seed+i);}
 if(kind==='garden'){brush(c,76,146,29,16,'#8aa59b');for(let i=0;i<7;i++)oval(c,54+i*8,141+H(seed,i)*11,5,2.5,'#a3b88ba1');}
}
function wall(c,x,y,w,h,opening='south'){c.strokeStyle='#999284';c.lineWidth=8;c.strokeRect(x,y,w,h);c.strokeStyle='#e4d9c4';c.lineWidth=5;c.strokeRect(x,y,w,h);c.strokeStyle='#6c7367';c.lineWidth=1.6;c.strokeRect(x,y,w,h);
 if(opening==='south'){c.fillStyle=paper;c.fillRect(x+w*.42,y+h-7,w*.18,14);}
}
function breakfast(c,x,y,seed){c.save();c.translate(x,y);
 oval(c,0,0,17,12,'#d5b38c','#7a6551',1);
 for(let i=0;i<5;i++){const a=i*TAU/5;oval(c,Math.cos(a)*11,Math.sin(a)*6,3.6,2.4,'#fff1d9','#9d8060',.65);}
 oval(c,1,0,5,3,'#b8a075','#8d694f',.6);
 for(let i=0;i<3;i++){const p=i*7-6;line(c,p,-3,p+3,-5,'#f6ead0',.6);}
 c.restore();}
function brushScene(c,t){const seed=t.seed||1;
 // Keep all objects inset from legal road/water edge joints.
 if(t.kind==='five'){
   // Carefully layered stone bridge, raised above north/south navigable canal.
   c.fillStyle='#6966553c';c.fillRect(0,97,220,34);
   c.fillStyle='#c4b79c';c.fillRect(0,97,220,32);c.fillStyle='#dfd2b6';c.fillRect(0,101,220,24);
   for(let i=0;i<10;i++){line(c,i*24,101,i*24+14,124,'#8e847461',.8);}
   line(c,0,97,220,97,'#77715e',2.8);line(c,0,130,220,130,'#77715e',2.5);
   // Stone arches are drawn beneath the balustrade on the water side.
   for(let i=0;i<3;i++){const x=51+i*56;c.strokeStyle='#e5dbbd';c.lineWidth=4;c.beginPath();c.arc(x,134,17,PI,TAU);c.stroke();}
   for(let i=0;i<5;i++){const x=23+i*44;pavilion(c,x,99,37,i%2);line(c,x-14,128,x+14,128,'#7f7665',1);}
   for(let i=0;i<3;i++)person(c,55+i*44,125,i%2?'#b18469':'#68827c');
 }else if(t.kind==='pagoda'){
   wall(c,8,12,81,184,'south');garden(c,seed,'courtyard',t.edges);
   tiledRoof(c,121,151,81,54);pagoda(c,52,113);
   willow(c,169,46,seed);rock(c,30,178,.5,seed);person(c,113,164,'#a46e60');
 }else if(t.kind==='causeway'){
   wall(c,18,19,176,88,'south');garden(c,seed,'courtyard',t.edges);
   tiledRoof(c,47,39,102,65);willow(c,179,148,seed);
   blossoms(c,33,148,seed);person(c,111,174,'#7c8878');person(c,114,121,'#a66e5c','carry');
 }else if(t.kind==='approach'){
   tiledRoof(c,13,12,83,63);tiledRoof(c,140,12,73,57,1);
   garden(c,seed,'courtyard',t.edges);willow(c,181,183,seed);person(c,108,113,'#ae7f5b');person(c,149,117,'#6c8077');
 }else if(t.kind==='lake'){
   for(let i=0;i<4;i++){const y=22+i*54;willow(c,35,y,seed+i);tree(c,184,y+18,19,seed+i+8);}
   pavilion(c,189,99,47);rock(c,171,151,.8,seed);
 }else if(t.kind==='landing'){
   tiledRoof(c,7,17,77,65);wall(c,138,12,70,64,'south');garden(c,seed,'courtyard',t.edges);
   pavilion(c,179,86,50);willow(c,184,171,seed);
   // Mooring jetty and winding stone entry.
   polygon(c,[[136,121],[164,121],[164,183],[136,183]],'#9e9278','#6e6e5e',1.5);
   for(let i=0;i<6;i++)line(c,140,132+i*8,159,132+i*8,'#d5c9b7',.7);
   person(c,155,111,'#a46f61','carry');
 }else if(t.kind==='bridge'){
   c.fillStyle='#c7b8a0';c.fillRect(0,98,220,31);c.strokeStyle='#77715f';c.lineWidth=2;
   line(c,0,98,220,98);line(c,0,127,220,127);
   for(let i=0;i<6;i++)line(c,14+i*38,98,14+i*38,127,'#99907d',.9);
   pavilion(c,45,93,40);pavilion(c,177,93,40);
 }else if(t.kind==='tea'||t.kind==='market'){
   tiledRoof(c,17,17,103,76);tiledRoof(c,130,135,77,62,1);
   if(t.kind==='tea'){wall(c,8,108,78,103,'south');for(let i=0;i<3;i++){breakfast(c,30+(i%2)*40,134+Math.floor(i/2)*45,seed+i);}}
   else{for(let i=0;i<3;i++){breakfast(c,46+i*37,159,seed+i);}}
   willow(c,182,48,seed);person(c,119,114,'#b17957','carry');person(c,80,159,'#778777','tea');
 }else if(t.kind==='garden'){
   wall(c,13,14,193,192,'south');garden(c,seed,'garden',t.edges);pavilion(c,114,86,78);
   willow(c,41,61,seed);blossoms(c,177,156,seed);person(c,111,155,'#987561','tea');
 }else if(t.kind==='court'){
   wall(c,15,16,190,186,'south');tiledRoof(c,49,26,118,73);garden(c,seed,'court',t.edges);
   rock(c,50,144,1,seed);tree(c,173,160,21,seed);person(c,104,151,'#a17b60');
 }else{
   garden(c,seed,'courtyard',t.edges);tiledRoof(c,11,16,85,59);tiledRoof(c,124,139,86,65,1);
   tree(c,179,33,23,seed);person(c,79,112,'#ab7c5e');person(c,139,113,'#748477');
 }
}
function fineDetail(c,t){const seed=t.seed||1;
 c.save();c.strokeStyle='#6c746451';c.lineWidth=.45;
 for(let i=0;i<46;i++){let x=12+H(i,seed)*196,y=14+H(i,seed,2)*194,len=2+H(i,seed,3)*4;
   line(c,x,y,x+len,y-.6,'#736f5956',.35);}
 if(t.kind==='tea'||t.kind==='market'){for(let i=0;i<4;i++){const x=35+i*14,y=91;oval(c,x,y,2.2,1.6,'#eee5c8','#926f59',.55);}
   // Decorative wooden sign with a plausible blank brush-paper field; no invented Chinese glyphs.
   c.fillStyle='#b89c79';c.fillRect(20,86,29,10);c.strokeStyle='#796450';c.strokeRect(20,86,29,10);
 }
 if(t.kind==='five'){for(let i=0;i<5;i++){const x=23+i*44;line(c,x-10,105,x-10,119,'#c6a67a',1);line(c,x+10,105,x+10,119,'#c6a67a',1);}}
 c.restore();}
function renderBase(c,t){const seed=t.seed||1;c.save();c.beginPath();c.rect(0,0,S,S);c.clip();ground(c,t);
 // Landscape washes and rocky details under the routes.
 for(let i=0;i<13;i++){const x=H(seed,i,1)*S,y=H(seed,i,2)*S;brush(c,x,y,10+H(i,seed)*24,8+H(i,seed,4)*16,i%2?'#879d80':'#d2c2a3');}
 node(c,t.edges,'S','#999386','#cbbda4');
 node(c,t.edges,'W','#637c75','#87aba5');
 // A few small stone blocks reinforce texture of the walkway and banks.
 waterDetails(c,t);
 brushScene(c,t);fineDetail(c,t);
 c.restore();}
function getBase(t,zoom=1){const resolution=zoom>=3?6:zoom>=1.25?4:2;
 const k=t.kind+'|'+t.edges.join('')+'|'+(t.seed||1)+'|'+resolution;
 if(CACHE.has(k)){const img=CACHE.get(k);CACHE.delete(k);CACHE.set(k,img);return img;}
 const el=document.createElement('canvas');el.width=S*resolution;el.height=S*resolution;
 const painter=el.getContext('2d',{alpha:false});painter.scale(resolution,resolution);renderBase(painter,t);
 CACHE.set(k,el);cachePixels+=el.width*el.height;
 while(CACHE.size>MAX_CACHE||cachePixels>MAX_CACHE_PIXELS){const first=CACHE.keys().next().value,old=CACHE.get(first);
   // Always retain the requested tile, even on extremely memory-limited viewports.
   if(first===k&&CACHE.size===1)break;CACHE.delete(first);cachePixels-=old.width*old.height;
 }
 return el;}
function motion(c,t,time){if(!window.YangzhouDebug?.state.motion)return;
 const seed=t.seed||1,w=t.edges.includes('W');
 if(w){c.save();c.strokeStyle='#e9e4ca75';c.lineWidth=1;for(let i=0;i<6;i++){let y=((time*.014+i*37+seed*11)%230)-8;let x=110+Math.sin(time*.0006+i*1.9)*11;
     // Restrict wake glints toward the tile's water spine.
     c.beginPath();c.ellipse(x,y,5+i%3*3,1.3,-.1,0,PI);c.stroke();}c.restore();}
 if(['lake','landing','causeway','pagoda','garden','tea'].includes(t.kind)){
   const x=t.kind==='lake'?30:t.kind==='causeway'?180:t.kind==='pagoda'?170:t.kind==='landing'?182:178;
   const y=t.kind==='lake'?67:t.kind==='causeway'?156:t.kind==='pagoda'?42:t.kind==='landing'?169:42;
   c.save();c.strokeStyle='#7c987699';c.lineWidth=.75;
   for(let i=0;i<5;i++){let drift=Math.sin(time*.0007+i+seed)*2.6;c.beginPath();c.moveTo(x-9+i*4,y-18);c.quadraticCurveTo(x-14+i*4+drift,y+3,x-12+i*4+drift,y+19);c.stroke();}
   c.restore();
 }
 if(t.kind==='tea'||t.kind==='market'){c.save();for(let i=0;i<4;i++){let rise=(time*.018+i*17)%39;c.strokeStyle='#eee6d39a';c.lineWidth=1.25;c.beginPath();c.moveTo(50+i*5,144-rise*.2);c.quadraticCurveTo(44+i*5,139-rise,50+i*5+Math.sin(time*.001+i)*3,130-rise);c.stroke();}c.restore();}
 if(t.kind==='garden'||t.kind==='pagoda'){const x=70+Math.sin(time*.0006+seed)*5,y=177+(time*.005%22);oval(c,x,y,1.1,2.5,'#c99b8caa',null,0,time*.001);}
}
function draw(c,t,time,zoom=1){c.save();c.translate(t.x*S,t.y*S);
 const base=getBase(t,zoom);c.drawImage(base,0,0,S,S);
 if(zoom>=1.35)fineDetail(c,t);
 motion(c,t,time);
 c.restore();}
window.YangzhouArt={draw,renderBase,clearCache:()=>{CACHE.clear();cachePixels=0;}};
})();