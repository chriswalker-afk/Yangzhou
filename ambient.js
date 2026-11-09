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
function person(x,y,t,i){c.save();c.translate(x,y);let step=Math.sin(t*.008+i)*2;c.strokeStyle='#73624d';c.lineWidth=1.2;c.beginPath();c.moveTo(-2,7);c.lineTo(-4+step,13);c.moveTo(3,7);c.lineTo(4-step,13);c.stroke();c.fillStyle=['#a86e58','#667e7a','#858a69'][i%3];c.beginPath();c.moveTo(-3,1);c.lineTo(4,1);c.lineTo(5,9);c.lineTo(-5,9);c.fill();c.fillStyle='#bea687';c.beginPath();c.arc(0,-2,3.1,0,Math.PI*2);c.fill();c.fillStyle='#454741';c.fillRect(-3,-5,6,2);c.restore();}
function boat(x,y,t){c.save();c.translate(x,y);c.rotate(Math.PI/2);c.fillStyle='#705941';c.beginPath();c.moveTo(-20,0);c.quadraticCurveTo(-12,-8,17,-7);c.lineTo(22,0);c.lineTo(17,7);c.quadraticCurveTo(-12,8,-20,0);c.fill();c.strokeStyle='#4b473a';c.lineWidth=1;c.stroke();c.fillStyle='#bfa986';c.fillRect(-5,-5,13,10);c.strokeStyle='#594b3c';c.beginPath();c.moveTo(9,0);c.lineTo(19,21+Math.sin(t*.002)*3);c.stroke();c.restore();}
function draw(now){requestAnimationFrame(draw);const g=game();if(!g)return;const s=g.state;resize(s.w,s.h);c.clearRect(0,0,s.w,s.h);if(!s.motion)return;c.save();c.translate(s.offsetX,s.offsetY);c.scale(s.scale,s.scale);
 // A boat crosses all three connected starter-water tiles; this will be generalized by the route-graph pass.
 if(g.board.has('1,0')&&g.board.has('1,1')&&g.board.has('1,2')){let p=((now*.028)%750)-45;boat(330+Math.sin(p*.014)*4,p,now);}
 // Figures use the bridge route spanning the 03/04 seam, rather than isolated per-tile animation.
 if(g.board.has('0,1')&&g.board.has('1,1')){for(let i=0;i<3;i++){let x=((now*.015+i*160)%510)-35;person(x,329+(i%2)*10,now,i);}}
 // A few occasional, delicate glints travel with the central waterway.
 c.strokeStyle='#e4dfba80';c.lineWidth=1.4;for(let i=0;i<8;i++){let y=(now*.011+i*99)%680;c.beginPath();c.ellipse(326+Math.sin(i*3+y*.012)*13,y,5,1,0,0,Math.PI);c.stroke();}
 c.restore();}
requestAnimationFrame(draw);
})();