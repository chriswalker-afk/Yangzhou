/* Yangzhou V3 — Layer 2 tile-owned large details (experimental, not V2).
 * Local anchors survive moving a tile. Geometry masks decide safe placement.
 * Artist-authored objects remain compass-upright; never rotate their bitmaps.
 * Trees have a land-only trunk footprint; their visual canopy may overhang routes.
 */
(function(root,factory){
  const geometry=typeof module!=='undefined'&&module.exports
    ?require('./base-geometry.js'):root?.YangzhouV3Geometry;
  const api=factory(geometry);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.YangzhouV3Layer2=api;
})(typeof window!=='undefined'?window:null,function(geometry){
  'use strict';
  if(!geometry)throw Error('V3 topology geometry is required before Layer 2');
  const TILE_SIZE=220;
  const EDGE_INSET=10;
  const SAFE_GAP=6;
  const COMPONENTS=Object.freeze({
    'courtyard-hall-01':Object.freeze({
      id:'courtyard-hall-01',name:'Yangzhou Courtyard Hall 01',
      image:'assets/v3/large/courtyard-hall-01.webp',
      width:96,height:47,shadow:0,collision:'solid',compassUpright:true,
      status:'candidate-awaiting-visual-and-historical-review',
      productionApproved:false
    }),
    'willow-tree-01':Object.freeze({
      id:'willow-tree-01',name:'Yangzhou Willow Tree 01',
      image:'assets/v3/large/willow-tree-01.webp',
      width:48,height:58,shadow:0,collision:'trunk',trunkRadius:7,compassUpright:true,
      status:'candidate-awaiting-visual-and-historical-review',
      productionApproved:false
    }),
    'garden-rockery-01':Object.freeze({
      id:'garden-rockery-01',name:'Yangzhou Garden Rockery 01',
      image:'assets/v3/large/garden-rockery-01.webp',
      width:52,height:37,shadow:0,collision:'solid',compassUpright:true,
      status:'candidate-awaiting-visual-and-historical-review',
      productionApproved:false
    })
  });
  // Fixed candidate anchors are deliberately interior. NEVER rotate or mirror
  // the painting to match a rotated road/water topology.
  const ANCHORS=Object.freeze([
    [110,35],[60,36],[160,36],[110,185],[60,185],[160,185],
    [58,110],[162,110],[110,110]
  ].map(a=>Object.freeze(a)));
  const SCENERY_ANCHORS=Object.freeze([
    // Insets at 32/40/180/188 allow authentic land-bank greenery and rocks
    // beside an 88-unit canal without pushing solid trunks into the water.
    [40,40],[180,40],[40,180],[180,180],
    [110,40],[110,180],[40,110],[180,110],[110,110],
    [32,32],[188,32],[32,188],[188,188],
    [55,55],[165,55],[55,165],[165,165]
  ].map(a=>Object.freeze(a)));
  const hash=(seed,str)=>{
    let h=(Math.trunc(seed)>>>0)^2166136261;
    for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}
    return h>>>0;
  };
  const segmentDist=(px,py,ax,ay,bx,by)=>{
    const dx=bx-ax,dy=by-ay,d2=dx*dx+dy*dy;
    const t=d2>0?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/d2)):0;
    return Math.hypot(px-ax-t*dx,py-ay-t*dy);
  };
  function minRouteDistance(point,route){
    const [x,y]=point;
    if(route.kind==='line')return segmentDist(x,y,...route.start,...route.end);
    const [x0,y0]=route.start,[cx,cy]=route.control,[x1,y1]=route.end;
    let last=[x0,y0],d=Infinity;
    for(let i=1;i<=96;i++){
      const t=i/96,u=1-t;
      const next=[u*u*x0+2*u*t*cx+t*t*x1,u*u*y0+2*u*t*cy+t*t*y1];
      d=Math.min(d,segmentDist(x,y,...last,...next));last=next;
    }
    return d;
  }
  function footprintSamples(x,y,w,h){
    const out=[];
    // 6x6 samples protect the entire rectangular footprint, not just corners.
    for(let i=0;i<=6;i++)for(let j=0;j<=6;j++)
      out.push([x-w/2+w*i/6,y-h/2+h*j/6]);
    return out;
  }
  function validateDetail(tile,detail){
    if(!tile||!Array.isArray(tile.edges)||tile.edges.length!==4)throw Error('Tile has no valid N/E/S/W edges');
    const c=COMPONENTS[detail?.id];if(!c)throw Error('Unknown V3 large detail '+detail?.id);
    if(!Number.isFinite(detail.x)||!Number.isFinite(detail.y))throw Error('Invalid local detail coordinate');
    const points=footprintSamples(detail.x,detail.y,c.width,c.height);
    const inset=EDGE_INSET;
    for(const [x,y] of points){
      if(x<inset||y<inset||x>TILE_SIZE-inset||y>TILE_SIZE-inset)
        return false;
    }
    const g=geometry.compile(tile.edges);
    const routePoints=c.collision==='trunk'?[[detail.x,detail.y]]:points;
    for(const path of g.paths){
      // Only the willow's trunk is solid; willow canopy may drape over a route.
      const radius=path.width/2+(path.type==='W'?4:5)+SAFE_GAP+
        (c.collision==='trunk'?c.trunkRadius:0);
      for(const point of routePoints)if(minRouteDistance(point,path)<radius)return false;
    }
    return true;
  }
  function distinctFootprints(candidate,existing,gap=7){
    const a=COMPONENTS[candidate.id];
    return existing.every(p=>{
      const b=COMPONENTS[p.id];
      return Math.abs(candidate.x-p.x)>=(a.width+b.width)/2+gap ||
        Math.abs(candidate.y-p.y)>=(a.height+b.height)/2+gap;
    });
  }
  function normaliseTile(tile){
    if(!tile||!Number.isInteger(tile.x)||!Number.isInteger(tile.y))throw Error('Tile needs integer board x/y');
    const g=geometry.compile(tile.edges);
    if(tile.seed!==undefined&&(!Number.isInteger(tile.seed)||tile.seed<0))throw Error('Seed must be non-negative integer');
    return {...tile,edges:[...g.edges],seed:tile.seed??1};
  }
  function plan(tile){
    const data=normaliseTile(tile);
    if(Array.isArray(data.layer2)){
      const placed=[];
      for(const p of data.layer2){
        if(!validateDetail(data,p))throw Error('Large detail would block a route or tile seam: '+p.id);
        if(!distinctFootprints(p,placed))throw Error('Layer 2 details overlap within a tile: '+p.id);
        placed.push(Object.freeze({id:p.id,x:p.x,y:p.y}));
      }
      return placed;
    }
    // All decisions use seed + topology, never board grid x/y.
    // When moved to another board cell, the same tile keeps its own artwork.
    const placed=[];
    function tryAsset(id,anchors){
      const offset=hash(data.seed,data.edges.join('')+id)%anchors.length;
      for(let i=0;i<anchors.length;i++){
        const [x,y]=anchors[(i+offset)%anchors.length],p={id,x,y};
        if(validateDetail(data,p)&&distinctFootprints(p,placed)){
          placed.push(Object.freeze(p));return true;
        }
      }
      return false;
    }
    // Deliberately sparse architecture, but frequent small-scale natural variety.
    if(data.seed%3===1)tryAsset('courtyard-hall-01',ANCHORS);
    if(data.seed%5!==0)tryAsset('willow-tree-01',SCENERY_ANCHORS);
    if(data.seed%4!==3)tryAsset('garden-rockery-01',SCENERY_ANCHORS);
    return placed;
  }
  function draw(ctx,tile,images,options={}){
    if(!ctx||typeof ctx.drawImage!=='function')throw Error('Canvas context required');
    const details=plan(tile);
    const ox=tile.x*TILE_SIZE,oy=tile.y*TILE_SIZE;
    let count=0;
    for(const p of details){
      const component=COMPONENTS[p.id],img=images?.[p.id];
      if(!img||options.visible?.[p.id]===false)continue; // Never fake missing art.
      ctx.drawImage(img,ox+p.x-component.width/2,oy+p.y-component.height/2,component.width,component.height);
      count++;
    }
    return count;
  }
  function saveBoard(tiles){
    return JSON.stringify({version:1,coordinateSpace:'world-tile-local',tileSize:TILE_SIZE,
      tiles:tiles.map(tile=>{
        const t=normaliseTile(tile);return {
          x:t.x,y:t.y,edges:t.edges,seed:t.seed,
          layer2:plan(t).map(p=>({id:p.id,x:p.x,y:p.y}))
        };
      })
    },null,2);
  }
  function restoreBoard(json){
    const stored=typeof json==='string'?JSON.parse(json):json;
    if(stored?.version!==1||stored.tileSize!==TILE_SIZE||!Array.isArray(stored.tiles))
      throw Error('Unsupported V3 tile layout format');
    const tiles=stored.tiles.map(normaliseTile);
    for(const t of tiles)plan(t); // Reject invalid placements rather than silently move them.
    return tiles;
  }
  function loadImages(){
    if(typeof Image==='undefined')return Promise.reject(Error('Browser images required'));
    return Promise.all(Object.values(COMPONENTS).map(c=>new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>resolve([c.id,image]);
      image.onerror=()=>reject(Error('Missing V3 artwork candidate: '+c.image));image.src=c.image;
    }))).then(entries=>Object.fromEntries(entries));
  }
  return Object.freeze({TILE_SIZE,EDGE_INSET,SAFE_GAP,COMPONENTS,ANCHORS,SCENERY_ANCHORS,
    minRouteDistance,footprintSamples,validateDetail,distinctFootprints,normaliseTile,plan,draw,saveBoard,restoreBoard,loadImages});
});