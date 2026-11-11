/* Yangzhou V3 — exact topology-driven geometry; NOT production painted artwork. */
(function(root,factory){
  const api=factory(typeof module!=='undefined'&&module.exports?require('../../tile-topology.js'):root.YangzhouTileTopology);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.YangzhouV3Geometry=api;
})(typeof window!=='undefined'?window:null,function(topology){
  'use strict';
  if(!topology)throw Error('Load tile-topology.js first');
  const SIZE=topology.size, MID=topology.center;
  const directions=Object.freeze([[MID,0],[SIZE,MID],[MID,SIZE],[0,MID]]);
  const edgesOK=edges=>topology.edgeOK(edges);
  const port=(side,type)=>{
    if(!Number.isInteger(side)||side<0||side>3||!['L','S','W'].includes(type))throw Error('Invalid port');
    const width=topology.portWidth[type],centre=directions[side];
    return Object.freeze({side,type,width,centre:Object.freeze([...centre]),
      start:MID-width/2,end:MID+width/2});
  };
  const route=(type,sides)=>{
    if(!sides.length)return [];
    if(sides.length===1)return [{kind:'line',type,width:topology.portWidth[type],sides:[sides[0]],start:[...directions[sides[0]]],end:[MID,MID]}];
    if(sides.length===2){
      const [a,b]=sides,opposite=(a+2)%4===b;
      return [{kind:opposite?'line':'quadratic',type,width:topology.portWidth[type],sides:[a,b],
        start:[...directions[a]],control:opposite?null:[MID,MID],end:[...directions[b]]}];
    }
    return sides.map(side=>({kind:'line',type,width:topology.portWidth[type],sides:[side],start:[...directions[side]],end:[MID,MID]}));
  };
  function compile(edges){
    if(!edgesOK(edges))throw Error('Invalid N/E/S/W edge signature');
    const exits=edges.map((type,side)=>port(side,type));
    const paths=[];
    for(const type of ['W','S']){
      const sides=edges.map((v,i)=>v===type?i:-1).filter(i=>i>=0);
      paths.push(...route(type,sides));
    }
    return Object.freeze({size:SIZE,edges:Object.freeze([...edges]),exits:Object.freeze(exits),paths:Object.freeze(paths),
      bridge:edges.includes('S')&&edges.includes('W')});
  }
  function shapes(ctx,geometry,material){
    for(const p of geometry.paths.filter(p=>p.type===material)){
      ctx.beginPath();ctx.moveTo(...p.start);
      if(p.kind==='quadratic')ctx.quadraticCurveTo(...p.control,...p.end);
      else ctx.lineTo(...p.end);
      ctx.lineWidth=p.width;ctx.lineCap='butt';ctx.lineJoin='round';ctx.stroke();
      // For a junction, overlapping full-width arms meet with no disconnected channel.
    }
  }
  function drawStudy(ctx,edges,colors){
    const g=compile(edges);
    ctx.save();
    ctx.fillStyle=colors.grass;ctx.fillRect(0,0,SIZE,SIZE);
    ctx.strokeStyle=colors.bank;shapes(ctx,g,'W');
    // Width is exact for the water mask; the bank follows the channel internally.
    ctx.strokeStyle=colors.water;shapes(ctx,g,'W');
    ctx.strokeStyle=colors.paving;shapes(ctx,g,'S');
    // A street bridge is always drawn over the water; these are distinct routes.
    ctx.restore();
    return g;
  }
  const signatures=Object.freeze([...new Set(topology.archetypes.flatMap(a=>Array.from({length:4},(_,r)=>topology.rotateEdges(a.edges,r).join(''))))].sort());
  return Object.freeze({size:SIZE,port,compile,signatures,drawStudy});
});
