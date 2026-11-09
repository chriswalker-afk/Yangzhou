/* Ambient characters are separate from scoring pieces. This overlay shares the board camera transform. */
(() => {
'use strict';
const game=()=>window.YangzhouDebug;
const base=document.getElementById('scene');
const layer=document.createElement('canvas');layer.id='living-overlay';layer.setAttribute('aria-hidden','true');layer.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
base.insertAdjacentElement('afterend',layer);
const c=layer.getContext('2d');
let dpr=1,lastW=0,lastH=0;
function resize(w,h){if(w===lastW&&h===lastH)return;lastW=w;lastH=h;dpr=Math.min(devicePixelRatio||1,2);layer.width=Math.ceil(w*dpr);layer.height=Math.ceil(h*dpr);c.setTransform(dpr,0,0,dpr,0,0);}
function person(x,y,t,i){c.save();c.translate(x,y);
 const step=Math.sin(t*.008+i*2.7)*2;
 c.fillStyle='#4e554c28';c.beginPath();c.ellipse(1,13,7,2,0,0,Math.PI*2);c.fill();
 c.strokeStyle='#796959';c.lineWidth=1.2;c.beginPath();c.moveTo(-2,8);c.lineTo(-3+step,14);c.moveTo(3,8);c.lineTo(4-step,14);c.stroke();
 const robes=['#aa745f','#697e76','#929474','#b18a69'];
 c.fillStyle=robes[i%robes.length];c.beginPath();c.moveTo(-4,0);c.lineTo(4,0);c.lineTo(7,11);c.lineTo(-7,11);c.closePath();c.fill();
 c.strokeStyle='#685b4b';c.lineWidth=.6;c.stroke();
 // Side sleeves and miniature Qing-style headwear; these remain deliberately small.
 c.fillStyle=robes[i%robes.length];c.fillRect(-7,2,4,5);c.fillRect(4,2,4,5);
 c.fillStyle='#c2a586';c.beginPath();c.ellipse(0,-4,3.7,4.2,0,0,Math.PI*2);c.fill();
 c.fillStyle='#40433b';c.beginPath();c.ellipse(0,-7,4.3,2.5,0,Math.PI,Math.PI*2);c.fill();
 if(i%3===0){c.strokeStyle='#7e6e55';c.beginPath();c.moveTo(8,4);c.lineTo(12,7);c.stroke();c.fillStyle='#c4a574';c.beginPath();c.ellipse(14,9,5,3,0,0,Math.PI*2);c.fill();}
 c.restore();}
function boat(x,y,t){c.save();c.translate(x,y);c.rotate(Math.PI/2);
 c.fillStyle='#496d6944';c.beginPath();c.ellipse(3,3,25,10,0,0,Math.PI*2);c.fill();
 const wood=c.createLinearGradient(-14,0,19,0);wood.addColorStop(0,'#8b7150');wood.addColorStop(.5,'#a78b61');wood.addColorStop(1,'#665039');
 c.beginPath();c.moveTo(-25,0);c.quadraticCurveTo(-16,-9,18,-9);c.lineTo(25,0);c.lineTo(18,9);c.quadraticCurveTo(-16,9,-25,0);c.closePath();c.fillStyle=wood;c.fill();c.strokeStyle='#5d5547';c.lineWidth=1.1;c.stroke();
 // Curved low canopy with fine reed lines.
 c.fillStyle='#c5b58c';c.beginPath();c.moveTo(-9,-6);c.lineTo(11,-6);c.lineTo(15,0);c.lineTo(11,6);c.lineTo(-9,6);c.closePath();c.fill();
 c.strokeStyle='#847557';c.lineWidth=.55;for(let i=-7;i<12;i+=3){c.beginPath();c.moveTo(i,-6);c.lineTo(i+4,6);c.stroke();}
 c.fillStyle='#55574a';c.beginPath();c.arc(-15,0,3,0,Math.PI*2);c.fill();
 c.strokeStyle='#6a5943';c.lineWidth=1.4;c.beginPath();c.moveTo(15,1);c.lineTo(27,21+Math.sin(t*.0018)*2);c.stroke();
 c.restore();}
function draw(now){requestAnimationFrame(draw);const g=game();if(!g)return;const s=g.state;resize(s.w,s.h);c.clearRect(0,0,s.w,s.h);if(!s.motion)return;c.save();c.translate(s.offsetX,s.offsetY);c.scale(s.scale,s.scale);
 // A boat crosses all three connected starter-water tiles; this will be generalized by the route-graph pass.
 if(g.board.has('1,0')&&g.board.has('1,1')&&g.board.has('1,2')){let p=((now*.028)%750)-45;
   // The boat passes beneath the Five-Pavilion Bridge (scene y=220+110=330).
   // Hide the hull while it is under the stone structure instead of painting it on top.
   if(p<305||p>355)boat(330+Math.sin(p*.014)*4,p,now);
   else {c.save();c.globalAlpha=.18;c.strokeStyle='#e0e0c5';c.beginPath();c.ellipse(330,p,9,4,0,0,Math.PI*2);c.stroke();c.restore();}
 }
 // Figures use the bridge route spanning the 03/04 seam, rather than isolated per-tile animation.
 if(g.board.has('0,1')&&g.board.has('1,1')){for(let i=0;i<3;i++){let x=((now*.015+i*160)%510)-35;person(x,329+(i%2)*10,now,i);}}
 // A few occasional, delicate glints travel with the central waterway.
 c.strokeStyle='#e4dfba80';c.lineWidth=1.4;for(let i=0;i<8;i++){let y=(now*.011+i*99)%680;c.beginPath();c.ellipse(326+Math.sin(i*3+y*.012)*13,y,5,1,0,0,Math.PI);c.stroke();}
 c.restore();}
requestAnimationFrame(draw);
})();