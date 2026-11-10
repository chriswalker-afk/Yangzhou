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
  // Eight new independent layout briefs. This is a composition stage; the
  // current study graphics must not be marketed as finished tile paintings.
  const archetypes=[
    {id:'garden-grove',name:'Willow garden',note:'An enclosed garden with willows and rockery',edges:['L','L','L','L'],kind:'garden'},
    {id:'street-straight',name:'Stone-paved street',note:'A quiet street with separate courtyards',edges:['S','L','S','L'],kind:'street'},
    {id:'street-bend',name:'Street corner',note:'A turning paved lane with enclosed houses',edges:['S','S','L','L'],kind:'street'},
    {id:'market-cross',name:'Market crossroads',note:'A crossroads flanked by four market quarters',edges:['S','S','S','S'],kind:'market'},
    {id:'canal-straight',name:'Straight canal',note:'A navigable willow-lined waterway',edges:['W','L','W','L'],kind:'canal'},
    {id:'canal-bend',name:'Willow canal bend',note:'A curved bank and riverside garden',edges:['W','W','L','L'],kind:'canal'},
    {id:'stone-bridge',name:'Small stone footbridge',note:'A walking street above a separate canal route',edges:['W','S','W','S'],kind:'bridge'},
    {id:'canal-junction',name:'Canal junction',note:'Three waterways meet around landscaped banks',edges:['W','W','W','L'],kind:'canal'}
  ];
  // Six bespoke square paintings; one fixed starting tile = one art file.
  // Masters are compass-upright, so the buildings never rotate sideways.
  // The N/S lake and E/W bridge each connect through the tile centre.
  // The bridge ends at the pagoda garden and southern landing; no external street exits.
  const starter=[
    {x:0,y:0,edges:['L','L','L','L'],kind:'causeway',name:'Willow Garden',artIndex:0,artId:'lake-01',fixed:true,rotation:0,seed:1},
    {x:1,y:0,edges:['W','L','W','L'],kind:'lake',name:'Northern Lake',artIndex:1,artId:'lake-02',fixed:true,rotation:0,seed:2},
    {x:2,y:0,edges:['L','L','L','L'],kind:'tea',name:'Lakeside Gardens and Teahouses',artIndex:2,artId:'lake-03',fixed:true,rotation:0,seed:3},
    {x:0,y:1,edges:['L','S','L','L'],kind:'pagoda',name:'White Pagoda Garden',artIndex:3,artId:'lake-04',fixed:true,rotation:0,seed:4},
    {x:1,y:1,edges:['W','S','W','S'],kind:'five',name:'Five-Pavilion Bridge',artIndex:4,artId:'lake-05',fixed:true,rotation:0,seed:5},
    {x:2,y:1,edges:['L','L','L','S'],kind:'landing',name:'Southern Landing and Breakfast House',artIndex:5,artId:'lake-06',fixed:true,rotation:0,seed:6}
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
  if(new Set(starter.map(t=>t.artId)).size!==6)
    throw Error('All six starting squares require distinct artwork references');
  const api=Object.freeze({size:SIZE,center:CENTER,portWidth:PORT_WIDTH,
    directions:DIR,archetypes,starter,rotateEdges,validateBoard,edgeOK});
  if(typeof window!=='undefined')window.YangzhouTileTopology=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();
