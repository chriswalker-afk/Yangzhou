/* Yangzhou V3 Layer 2 architectural moon-gate framing.
 * Preserve the real wall aperture, including the roof and collision gap.
 * Painted stone/ivory rim details live on the two existing gate jambs;
 * a circular arch is an elevated SOUTH-facing facade decoration, never a
 * ground-plane obstruction or a synthetic solid bridge across the passage.
 */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3MoonGate=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const RIM=Object.freeze({
 ink:'#6c7369',stone:'#a8a79a',light:'#e7e2d2',
 shadow:'rgba(54,61,55,.38)',inner:'rgba(74,79,69,.27)',
 threshold:'rgba(154,142,114,.32)'
});
const EPS=1e-7;
function frame(gate,hall){
 const [x,y]=gate.center;
 const horizontal=Math.abs(gate.tangent[1])<EPS;
 const north=horizontal&&y<(hall?.y??110);
 const radius=gate.width/2;
 // In an oblique overhead scene the architectural round opening is seen
 // in the facing wall elevation, while its centre remains empty on the map.
 // Its top is represented as a low projected arch on the existing wall ends:
 // the connecting upper lintel sits in image space, NOT in the ground plane.
 const facadeDepth=north?6:10;
 const faceY=y+4;
 return Object.freeze({
  center:[x,y],radius,width:gate.width,axis:horizontal?'horizontal':'vertical',
  top:faceY-(north?8:11),bottom:faceY+facadeDepth,
  left:x-radius,right:x+radius,north,
  // No point of this curve participates in wall geometry or solid masks.
  decorativeOnly:true,collisionFree:true
 });
}
function draw(ctx,compiled,tile,{hall=null,showDetail=true}={}){
 if(!showDetail||!compiled?.gates?.length)return 0;
 const ox=tile.x*220,oy=tile.y*220;
 ctx.save();let count=0;
 for(const gate of compiled.gates){
  const f=frame(gate,hall);
  // North-south apertures remain true openings but should not receive a
  // south-facing circular arc that would appear rotated in the ground plane.
  if(f.axis!=='horizontal')continue;
  const x=ox+f.center[0],y=oy+f.center[1];
  const left=ox+f.left,right=ox+f.right;
  // Thin painterly circular edging: the upper arc is suggested by a curve
  // above the real opening, with a small highlight just within the edge.
  // Never fill the gate or connect its bottom threshold with solid masonry.
  const top=oy+f.top,bottom=oy+f.bottom;
  const cx=x,cy=oy+f.top+f.radius;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=RIM.shadow;ctx.lineWidth=2.1;
  ctx.beginPath();ctx.arc(cx,cy,f.radius,Math.PI,0,false);ctx.stroke();
  ctx.strokeStyle=RIM.stone;ctx.lineWidth=1.45;
  ctx.beginPath();ctx.arc(cx,cy,f.radius-1,Math.PI,0,false);ctx.stroke();
  ctx.strokeStyle=RIM.light;ctx.lineWidth=.5;
  ctx.beginPath();ctx.arc(cx,cy,f.radius-2.2,Math.PI,0,false);ctx.stroke();
  // Stone reveal directly on the existing cut ends of the wall facade.
  // Restrict jamb strokes to their own sides, with nothing across the void.
  ctx.strokeStyle=RIM.ink;ctx.lineWidth=.9;
  for(const end of [left,right]){
   ctx.beginPath();ctx.moveTo(end,y+3.3);ctx.lineTo(end,bottom);ctx.stroke();
  }
  // Two small worn threshold stones. Deliberate centre gap persists.
  ctx.strokeStyle=RIM.threshold;ctx.lineWidth=1.15;
  ctx.beginPath();ctx.moveTo(left+1,bottom+.5);ctx.lineTo(left+4,bottom+.5);
  ctx.moveTo(right-4,bottom+.5);ctx.lineTo(right-1,bottom+.5);ctx.stroke();
  count++;
 }
 ctx.restore();
 return count;
}
return Object.freeze({RIM,frame,draw});
});
