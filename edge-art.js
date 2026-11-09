/* Shared terrain-edge contract for every Yangzhou tile.
 * The fixed painted handscroll and newly placed painted tiles must have the
 * same boundary pixels when their logical edges match. This file owns those
 * pixels: no artwork may paint through the 28px boundary apron without it.
 *
 * Types: L=land, S=street, W=water. Exits are centred on the tile edge.
 * Terrain is deliberately compass-neutral so 90° tile rotations remain valid.
 */
(() => {
  'use strict';
  const SIDE=220, DEPTH=34;
  const PORT={L:0,S:44,W:88};
  const STYLE={
    L:{land:'#ddd5be',base:'#e8dfc9',ink:'#b9aa8b'},
    S:{land:'#ddd5be',base:'#c7b79b',ink:'#8f8369'},
    W:{land:'#ddd5be',base:'#85aaa3',ink:'#6e8e87'}
  };
  function gradient(c,from,to,start=0,end=DEPTH){
    const g=c.createLinearGradient(0,start,0,end);
    g.addColorStop(0,from);
    g.addColorStop(.11,from);
    g.addColorStop(1,to);
    return g;
  }
  function wash(c,type){
    // The full 220px edge becomes a common painted-paper tone at the seam.
    // Alpha then decays inward to reveal the unique painted tile.
    c.fillStyle=gradient(c,'#ddd5be','#ddd5be00',0,DEPTH);
    c.fillRect(0,0,SIDE,DEPTH);
    if(type==='L'){
      c.strokeStyle='#9e97783a';c.lineWidth=.7;
      for(let i=0;i<12;i++){const u=(i+1)*17,v=9+(i%3)*5;
        c.beginPath();c.moveTo(u-4,v);c.quadraticCurveTo(u,v-2,u+4,v);c.stroke();}
      return;
    }
    const width=PORT[type],left=(SIDE-width)/2,right=(SIDE+width)/2;
    const base=STYLE[type].base;
    c.save();c.beginPath();c.rect(left,0,width,DEPTH+20);c.clip();
    c.fillStyle=gradient(c,base,type==='W'?'#85aaa300':'#c7b79b00',0,DEPTH+20);
    c.fillRect(left,0,width,DEPTH+20);
    // Gentle painterly highlights fade towards the individual tile centre.
    c.strokeStyle=type==='W'?'#d9d9b18b':'#a69a7a6b';
    c.lineWidth=type==='W'?1.1:.65;
    for(let i=0;i<5;i++){const v=2+i*9;
      c.globalAlpha=Math.max(.0,1-v/(DEPTH+12))*.55;
      if(type==='W'){c.beginPath();c.ellipse(SIDE/2+((i%3)-1)*11,v,4+i,1,0,0,Math.PI);c.stroke();}
      else {c.beginPath();c.moveTo(left+3,v);c.lineTo(right-3,v);c.stroke();}
    }c.restore();
    // Banks and curbs always terminate at precisely the same x on both
    // faces of a legal join. They are not authored independently per tile.
    for(const x of [left,right]){
      c.lineWidth=type==='W'?2.2:1.4;
      c.strokeStyle=type==='W'?'#c7cbb0':'#938977';
      c.beginPath();c.moveTo(x,0);c.lineTo(x,DEPTH*.42);c.stroke();
      c.strokeStyle=type==='W'?'#c7cbb000':'#93897700';
      c.lineWidth=type==='W'?1.3:.7;
      c.beginPath();c.moveTo(x,DEPTH*.42);c.lineTo(x,DEPTH+10);c.stroke();
    }
  }
  function transform(c,index){
    // Local coordinates (u,v): v=0 is the outward tile boundary.
    // South and west reverse u; all exit shapes are reflection-symmetric.
    if(index===0)return;
    if(index===1){c.translate(SIDE,0);c.rotate(Math.PI/2);}
    else if(index===2){c.translate(SIDE,SIDE);c.rotate(Math.PI);}
    else if(index===3){c.translate(0,SIDE);c.rotate(-Math.PI/2);}
  }
  function drawEdge(c,type,index){
    if(!Object.prototype.hasOwnProperty.call(STYLE,type))throw Error('Invalid edge type '+type);
    if(index<0||index>3)throw Error('Invalid edge orientation');
    c.save();transform(c,index);
    c.beginPath();c.rect(0,0,SIDE,DEPTH+20);c.clip();
    wash(c,type);
    c.restore();
  }
  function drawBands(c,edges,onlyIndices=null){
    if(!Array.isArray(edges)||edges.length!==4)throw Error('Expected N/E/S/W terrain edges');
    const indices=onlyIndices||[0,1,2,3];
    for(const index of indices)drawEdge(c,edges[index],index);
  }
  function drawTile(c,t){
    c.save();c.translate(t.x*SIDE,t.y*SIDE);drawBands(c,t.edges);c.restore();
  }
  function drawStarterPerimeter(c,board){
    if(!board)return;
    const offset=[[0,-1],[1,0],[0,1],[-1,0]];
    for(const t of board.values()){
      if(!t.fixed)continue;
      const exposed=[];
      for(let index=0;index<4;index++){
        const [dx,dy]=offset[index],neighbour=board.get((t.x+dx)+','+(t.y+dy));
        // The six starter tiles are a single painting. Avoid artificial
        // seams where two starter tiles already share the panorama.
        if(neighbour?.fixed)continue;
        exposed.push(index);
      }
      if(exposed.length){
        c.save();c.translate(t.x*SIDE,t.y*SIDE);
        drawBands(c,t.edges,exposed);c.restore();
      }
    }
  }
  window.YangzhouEdgeArt={
    drawEdge,drawBands,drawTile,drawStarterPerimeter,
    spec:Object.freeze({tileSize:SIDE,apron:DEPTH,exits:Object.freeze({...PORT}),
      center:SIDE/2,directions:['north','east','south','west']})
  };
})();