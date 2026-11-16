/* Yangzhou V3 waterside landing — 3-tile connected-canal art proof.
 * This deliberately reuses the SAME Layer 1 masks and the SAME genuine
 * Layer 2 candidate. No sprite is flattened into a background image.
 */
(function(root,factory){
 const node=typeof module!=='undefined'&&module.exports;
 const api=factory(
   node?require('./base-geometry.js'):root.YangzhouV3Geometry,
   node?require('./edge-system.js'):root.YangzhouV3Edges,
   node?require('./canal-bank-art.js'):root.YangzhouV3CanalBankArt,
   node?require('./layer2-integrated.js'):root.YangzhouV3Layer2Integrated
 );
 if(node)module.exports=api;
 if(root)root.YangzhouV3LandingCanalProof=api;
})(typeof window!=='undefined'?window:null,function(geometry,edges,bankArt,composer){
 'use strict';
 const TILE=220;
 const TILES=Object.freeze([0,1,2].map((x)=>Object.freeze({
  x,y:0,seed:x+1,edges:Object.freeze(['L','W','L','W'])
 })));
 const WATER=Object.freeze({width:88,centerY:110,north:66,south:154,
  totalLength:660,connectedSegments:3});
 const CENTER=Object.freeze({index:1,tileX:1,x:110,y:53});
 const BASE=Object.freeze({grass:'#d7dcc7',stone:'#d7cdb7',water:'#8caea7',
  canalBank:'#baa88b',canalContact:'#5f847a',pathVerge:'#b8a88d',
  pathContact:'#889a82',bridgeEdge:'#9ba397',bridgeContact:'#677c75'});
 function plan(){
  const components=TILES.map(tile=>{
   const g=geometry.compile(tile.edges);
   const c=edges.compile(g);
   if(g.paths.length!==1||g.paths[0].type!=='W'||g.paths[0].kind!=='line'||
      g.paths[0].width!==WATER.width||
      Math.abs(g.paths[0].start[1]-WATER.centerY)>1e-7||
      Math.abs(g.paths[0].end[1]-WATER.centerY)>1e-7)
      throw Error('Landing preview must use the real straight 88-unit canal');
   return Object.freeze({tile,g,compiled:c});
  });
  const landing=composer.plan(TILES[CENTER.index],'landing');
  if(!landing.accepted||landing.placements.length!==1||
     landing.placements[0].id!=='waterside-landing-01'||
     landing.placements[0].x!==CENTER.x||
     landing.placements[0].y!==CENTER.y)
   throw Error('Landing placement diverges from the established Layer 2 contract');
  for(let i=1;i<TILES.length;i++){
   if(TILES[i-1].edges[1]!=='W'||TILES[i].edges[3]!=='W')
    throw Error('Canal not connected at tile seam '+i);
  }
  return Object.freeze({tiles:TILES,water:WATER,center:CENTER,
   components:Object.freeze(components),landing});
 }
 const SCENE=plan();
 function draw(ctx,{style={},bankImage=null,images={},showLanding=true,
   showPaintedBank=true,showGuides=false}={}){
  if(!ctx)throw Error('Canvas 2D context required');
  const paint={...BASE,...style};
  ctx.save();
  ctx.fillStyle=paint.grass;ctx.fillRect(0,0,TILE*3,TILE);
  const stats=[];
  for(const part of SCENE.components){
   const ox=part.tile.x*TILE,oy=0;
   ctx.save();ctx.beginPath();ctx.rect(ox,oy,TILE,TILE);ctx.clip();
   edges.draw(ctx,part.compiled,paint,{
    x:ox,y:oy,edges:true,
    paintedBankOverlay:showPaintedBank&&bankImage?
     (c,g,p)=>bankArt.draw(c,g,bankImage,p):null
   });
   let objects=0;
   if(part.tile.x===CENTER.index&&showLanding)
    objects=composer.draw(ctx,part.tile,SCENE.landing,images);
   stats.push(Object.freeze({x:part.tile.x,edges:part.tile.edges.join(''),
    waterWidth:part.g.paths[0].width,
    spriteCount:objects}));
   ctx.restore();
  }
  if(showGuides){
   ctx.save();
   ctx.strokeStyle='rgba(56,77,66,.7)';ctx.lineWidth=.6;
   ctx.setLineDash([3,3]);
   for(const x of [220,440]){
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,220);ctx.stroke();
   }
   ctx.setLineDash([]);
   ctx.restore();
  }
  ctx.restore();
  return Object.freeze({stats:Object.freeze(stats),water:WATER,
   originalWaterMaskUnchanged:true,canalConnected:true,
   usedSprite:stats[1].spriteCount===1});
 }
 return Object.freeze({TILE,TILES,WATER,CENTER,BASE,SCENE,plan,draw});
});
