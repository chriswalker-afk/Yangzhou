/*
 * Yangzhou's single source of truth for placeable square tiles.
 *
 * Every tile is a complete 220 x 220 world-unit square. Art is selected
 * per tile, never sliced from the Slender West Lake panorama.
 * Edge array order is [north, east, south, west]; L=land, S=street, W=water.
 * Ports meet at edge centre. Rotation changes topology, not the orientation
 * of painted roofs, trees or people.
 */
(() => {
  'use strict';
  const SIZE=220, CENTER=SIZE/2;
  const PORT_WIDTH=Object.freeze({L:0,S:44,W:88});
  const DIR=Object.freeze([[0,-1],[1,0],[0,1],[-1,0]]);
  const edgeOK=e=>Array.isArray(e)&&e.length===4&&e.every(v=>v==='L'||v==='S'||v==='W');
  const rotateEdges=(edges,quarterTurns=0)=>{
    if(!edgeOK(edges))throw new Error('Tile requires N/E/S/W land, street or water edges');
    const turns=((quarterTurns%4)+4)%4;
    return edges.map((_,i)=>edges[(i-turns+4)%4]);
  };
  const archetypes=[
    {name:'Canal-side teahouse',note:'Warm food, tea, passing boats',edges:['L','W','L','S'],kind:'tea'},
    {name:'Stone-paved street',note:'A peaceful road through Yangzhou',edges:['S','L','S','L'],kind:'street'},
    {name:'Willow canal bend',note:'Water and softly moving willows',edges:['W','W','L','L'],kind:'canal'},
    {name:'Waterfront landing',note:'Where small boats pause to moor',edges:['L','W','L','W'],kind:'landing'},
    {name:'Garden enclosure',note:'Bamboo, rockery and quiet pathways',edges:['L','L','L','L'],kind:'garden'},
    {name:'Market crossroads',note:'Stalls, visitors and tiled roofs',edges:['S','S','S','S'],kind:'market'},
    {name:'Canal crossroads',note:'A meeting place for waterways',edges:['W','W','W','W'],kind:'canal'},
    {name:'Street corner',note:'Shops beside a turning road',edges:['S','S','L','L'],kind:'street'},
    {name:'Small stone bridge',note:'A walkway over a navigable canal',edges:['W','S','W','S'],kind:'bridge'},
    {name:'Garden pavilion',note:'A place to admire the scenery',edges:['L','S','L','L'],kind:'garden'},
    {name:'Walled courtyard',note:'A composed domestic garden',edges:['S','L','L','L'],kind:'court'},
    {name:'Canal junction',note:'A new branch for passing boats',edges:['W','W','W','L'],kind:'canal'},
    {name:'Mooring basin',note:'A calm end to the canal with a place to dock',edges:['W','L','L','L'],kind:'landing'}
  ];
  // Six bespoke square paintings; one fixed starting tile = one art file.
  // Masters are compass-upright, so the buildings never rotate sideways.
  // The N/S lake and E/W bridge each connect through the tile centre.
  // The bridge ends at the pagoda garden and southern landing; no external street exits.
  const starter=[
    {x:0,y:0,edges:['L','L','L','L'],kind:'causeway',name:'Willow Garden',master:'road-straight',fixed:true,rotation:0,seed:1,artStatus:'requires-repaint'},
    {x:1,y:0,edges:['W','L','W','L'],kind:'lake',name:'Northern Lake',master:'river-straight',fixed:true,rotation:0,seed:2,artStatus:'prototype'},
    {x:2,y:0,edges:['L','L','L','L'],kind:'tea',name:'Lakeside Gardens and Teahouses',master:'road-teahouse',fixed:true,rotation:0,seed:3,artStatus:'requires-repaint'},
    {x:0,y:1,edges:['L','S','L','L'],kind:'pagoda',name:'White Pagoda Garden',master:'road-pagoda',fixed:true,rotation:0,seed:4,artStatus:'requires-repaint'},
    {x:1,y:1,edges:['W','S','W','S'],kind:'five',name:'Five-Pavilion Bridge',master:'bridge-stone',fixed:true,rotation:0,seed:5,artStatus:'prototype'},
    {x:2,y:1,edges:['L','L','L','S'],kind:'landing',name:'Southern Landing and Breakfast House',master:'road-landing',fixed:true,rotation:0,seed:6,artStatus:'requires-repaint'}
  ];
  function validateBoard(tiles){
    const all=new Map();
    const issues=[];
    for(const t of tiles){
      if(!Number.isInteger(t.x)||!Number.isInteger(t.y)||!edgeOK(t.edges)){
        issues.push('Invalid tile coordinate or edges: '+JSON.stringify(t));continue;
      }
      const k=t.x+','+t.y;
      if(all.has(k))issues.push('Duplicate tile at '+k);
      all.set(k,t);
    }
    for(const t of all.values())for(let i=0;i<4;i++){
      const n=all.get((t.x+DIR[i][0])+','+(t.y+DIR[i][1]));
      if(n&&t.edges[i]!==n.edges[(i+2)%4])
        issues.push('Edge mismatch '+t.x+','+t.y+' -> '+n.x+','+n.y);
    }
    return issues;
  }
  const issues=validateBoard(starter);
  if(issues.length)throw Error('Broken Slender West Lake starting tiles: '+issues.join('; '));
  if(new Set(starter.map(t=>t.master)).size!==6)
    throw Error('All six starter tiles require their own independent square painting');
  const api=Object.freeze({size:SIZE,center:CENTER,portWidth:PORT_WIDTH,
    directions:DIR,archetypes,starter,rotateEdges,validateBoard,edgeOK});
  if(typeof window!=='undefined')window.YangzhouTileTopology=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();
