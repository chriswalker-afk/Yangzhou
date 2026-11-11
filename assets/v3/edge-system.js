/* Yangzhou V3 Layer 1B — geometry-following edge-treatment proof.
 * This file contains NO painted edge artwork and does not affect V2.
 * Surface masks retain the exact 44-unit street and 88-unit canal mouths.
 */
(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.YangzhouV3Edges=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';

  // These are temporary land-side widths in world units, NOT enlarged route mouths.
  // Each outer ribbon is drawn first; the exact-width material then masks its centre.
  const treatments=Object.freeze({
    S:Object.freeze({id:'path-verge',outside:2.5,contact:0.8,core:44}),
    W:Object.freeze({id:'canal-bank',outside:4,contact:1.2,core:88})
  });
  const samplesPerCurve=49; // <= 0.5 world-unit step error for these gentle quadratics

  function pointOnRoute(route,t){
    if(!route||!['line','quadratic'].includes(route.kind)||!Number.isFinite(t)||t<0||t>1)
      throw Error('Expected a valid route and parameter in [0,1]');
    const [x0,y0]=route.start,[x1,y1]=route.end;
    let x,y,dx,dy;
    if(route.kind==='quadratic'){
      const [cx,cy]=route.control,u=1-t;
      x=u*u*x0+2*u*t*cx+t*t*x1;
      y=u*u*y0+2*u*t*cy+t*t*y1;
      dx=2*u*(cx-x0)+2*t*(x1-cx);
      dy=2*u*(cy-y0)+2*t*(y1-cy);
    }else{
      x=x0+(x1-x0)*t;y=y0+(y1-y0)*t;
      dx=x1-x0;dy=y1-y0;
    }
    const len=Math.hypot(dx,dy);
    if(!(len>0))throw Error('Degenerate V3 route');
    return {center:[x,y],tangent:[dx/len,dy/len],normal:[-dy/len,dx/len]};
  }

  function crossSection(route,t){
    const style=treatments[route.type];
    if(!style||route.width!==style.core)throw Error('Unsupported route material or width');
    const p=pointOnRoute(route,t),[x,y]=p.center,[nx,ny]=p.normal;
    const offset=(amount,side)=>[x+amount*nx*side,y+amount*ny*side];
    const core=style.core/2;
    return Object.freeze({
      t,center:p.center,tangent:p.tangent,normal:p.normal,
      core:Object.freeze({left:offset(core,1),right:offset(core,-1)}),
      outer:Object.freeze({left:offset(core+style.outside,1),right:offset(core+style.outside,-1)}),
      contact:Object.freeze({left:offset(core+style.contact,1),right:offset(core+style.contact,-1)})
    });
  }

  function traceRoute(route,bridge){
    const steps=route.kind==='quadratic'?samplesPerCurve:2;
    const samples=Array.from({length:steps},(_,i)=>crossSection(route,i/(steps-1)));
    return Object.freeze({
      route,material:route.type,role:bridge&&route.type==='S'?'bridge-deck':treatments[route.type].id,
      samples:Object.freeze(samples)
    });
  }

  function compile(geometry){
    if(!geometry||!Array.isArray(geometry.paths)||!Array.isArray(geometry.exits))
      throw Error('Compile a Yangzhou V3 geometry tile first');
    return Object.freeze({geometry,traces:Object.freeze(geometry.paths.map(r=>traceRoute(r,geometry.bridge)))});
  }

  // Fill the two offset boundaries as a polygon. We never rotate artwork
  // or reset a texture's pattern origin at the tile boundary.
  function fillRibbon(ctx,trace,boundary,fill,offsetX=0,offsetY=0){
    const points=trace.samples;
    if(!points.length)return;
    ctx.beginPath();
    const pos=point=>[point[0]+offsetX,point[1]+offsetY];
    ctx.moveTo(...pos(points[0][boundary].left));
    for(let i=1;i<points.length;i++)ctx.lineTo(...pos(points[i][boundary].left));
    for(let i=points.length-1;i>=0;i--)ctx.lineTo(...pos(points[i][boundary].right));
    ctx.closePath();
    ctx.fillStyle=fill;ctx.fill();
  }

  // The ribbon vertices are offset into board space, never translated via ctx:
  // CanvasPattern coordinates therefore stay global across neighbouring tiles.
  // Pass the already world-aligned CanvasPattern for stone/water.
  // An edge proof is deliberately a flat, replaceable color — NOT a new image.
  function draw(ctx,compiled,style,options={}){
    const edgesOn=options.edges!==false;
    const ox=options.x||0,oy=options.y||0;
    if(!style||!style.stone||!style.water)throw Error('Stone and water styles required');
    const traces=compiled.traces;
    for(const type of ['W','S']){
      const group=traces.filter(r=>r.material===type);
      if(edgesOn){
        for(const r of group){
          const bridge=r.role==='bridge-deck';
          const outer=type==='W'?style.canalBank:bridge?style.bridgeEdge:style.pathVerge;
          if(!outer)throw Error('Missing temporary V3 edge color');
          fillRibbon(ctx,r,'outer',outer,ox,oy);
        }
        for(const r of group){
          const bridge=r.role==='bridge-deck';
          const contact=type==='W'?style.canalContact:bridge?style.bridgeContact:style.pathContact;
          if(!contact)throw Error('Missing temporary V3 contact color');
          fillRibbon(ctx,r,'contact',contact,ox,oy);
        }
      }
      // All core masks are painted after all edge bands for a junction.
      // Water is underneath the bridge's road; paths cannot add water exits.
      for(const r of group)fillRibbon(ctx,r,'core',type==='W'?style.water:style.stone,ox,oy);
    }
  }

  return Object.freeze({treatments,samplesPerCurve,pointOnRoute,crossSection,traceRoute,compile,fillRibbon,draw});
});
