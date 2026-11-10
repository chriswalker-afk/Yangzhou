/*
 * Yangzhou V2 artwork boundary.
 * IMPORTANT: the eight expansion layouts drawn here are honest composition
 * studies, not production watercolours. Never make a procedural route overlay
 * pretend to be a finished master. Future artwork supplies independently
 * painted, compass-upright square images for each of the 4 orientations.
 */
(() => {
  'use strict';
  const T=220, HALF=110, DIR=[[0,-1],[1,0],[0,1],[-1,0]];
  const schema=window.YangzhouTileTopology;
  const lakeFiles=[
    '01-willow-garden.webp','02-northern-lake.webp','03-lakeside-teahouse.webp',
    '04-white-pagoda.webp','05-five-pavilion-bridge.webp','06-breakfast-house.webp'
  ];
  const lake=new Map(), masters=new Map(), permanentMasters=new Map(), failures=new Set(), temporaryReviewKeys=new Set();
  const palette={paper:'#e8e1d0',land:'#d5d5b7',ink:'#46554e',path:'#b9a88c',paving:'#dfd1b5',
    water:'#7baba7',waterInk:'#557d79',roof:'#64736d',leaf:'#869b74',shadow:'#606754',clay:'#b77862'};
  let manifest=null, manifestStatus='composition-study';
  function repaint(){
    if(window.YangzhouDebug?.state)window.YangzhouDebug.state.dirty=true;
    window.dispatchEvent(new Event('yangzhou-art-v2-updated'));
  }
  for(let i=0;i<lakeFiles.length;i++){
    const im=new Image();
    im.onload=repaint;
    im.onerror=()=>{failures.add(lakeFiles[i]);repaint();};
    im.src='assets/lake/'+lakeFiles[i];
    lake.set(i,im);
  }
  // Later, a review or approved manifest may point to 32 REAL artwork masters.
  // The absence of a master is explicitly a composition study, never a quiet
  // fallback to slices of the Slender West Lake painting.
  fetch('assets/v2/manifest.json').then(r=>{if(!r.ok)throw Error('V2 manifest unavailable');return r.json();})
    .then(m=>{
      if(m.status!=='composition-study'&&m.status!=='review'&&m.status!=='approved')
        throw Error('Unknown V2 status');
      if(m.tiles?.length!==schema.archetypes.length)throw Error('V2 deck does not match the game');
      for(let i=0;i<m.tiles.length;i++){
        const row=m.tiles[i],arch=schema.archetypes[i];
        if(row.id!==arch.id||row.edges!==arch.edges.join('')||row.variants?.length!==4)
          throw Error('V2 artwork topology mismatch '+arch.id);
        for(let r=0;r<4;r++){
          const v=row.variants[r],expected=schema.rotateEdges(arch.edges,r).join('');
          if(v.rotation!==r||v.edges!==expected)throw Error('V2 rotation mismatch '+arch.id+':'+r);
          if(v.artwork){
            if(v.status!=='review' && v.status!=='approved')throw Error('Master must declare review or approved status');
            const path='assets/v2/'+v.artwork;
            const im=new Image();
            im.onload=()=>{
              if(im.naturalWidth<1024||im.naturalWidth!==im.naturalHeight)
                failures.add('Rejected undersized/non-square master: '+path);
              else if((v.width&&v.width!==im.naturalWidth)||(v.height&&v.height!==im.naturalHeight))
                failures.add('Master differs from declared dimensions: '+path);
              repaint();
            };
            im.onerror=()=>{failures.add(path);repaint();};
            im.src=path;
            const key=arch.id+':'+r;
            permanentMasters.set(key,im);
            if(!temporaryReviewKeys.has(key))masters.set(key,im);
          }
        }
      }
      manifest=m;manifestStatus=m.status;repaint();
    }).catch(e=>{manifestStatus='manifest-error';failures.add(String(e));repaint();});
  function strokePath(c,points,w,color){
    c.beginPath();c.moveTo(points[0][0],points[0][1]);
    if(points.length===3)c.quadraticCurveTo(...points[1],...points[2]);
    else for(let i=1;i<points.length;i++)c.lineTo(...points[i]);
    c.lineCap='butt';c.lineJoin='round';c.lineWidth=w;c.strokeStyle=color;c.stroke();
  }
  function drawRoute(c,edges,type,width,fill){
    const sides=edges.map((v,i)=>v===type?i:-1).filter(i=>i!==-1);
    if(!sides.length)return;
    const pt=i=>[HALF+DIR[i][0]*HALF,HALF+DIR[i][1]*HALF];
    let lines=[];
    if(sides.length===2){
      const [a,b]=sides, opposite=(a+2)%4===b;
      lines=[opposite?[pt(a),pt(b)]:[pt(a),[HALF,HALF],pt(b)]];
    }else{
      lines=sides.map(i=>[pt(i),[HALF,HALF]]);
    }
    for(const points of lines)strokePath(c,points,width,fill);
    if(sides.length>2 || sides.length===1){
      c.fillStyle=fill;c.beginPath();c.arc(HALF,HALF,width/2,0,Math.PI*2);c.fill();
    }
    // These are route masks FOR STUDIES ONLY. All painted master artwork
    // must have banks, paving and routes authored into the original picture.
  }
  function foliage(c,x,y,r,flavour=0){
    c.save();c.translate(x,y);
    c.fillStyle='#5d6e5845';c.beginPath();c.ellipse(3,5,r+3,r*.67,.3,0,Math.PI*2);c.fill();
    const colors=['#7b946e','#91a582','#738a70','#a5ab83'];
    for(let i=0;i<11;i++){
      const a=i*2.399+flavour, d=r*(.2+.42*(i%4)/3),xx=Math.cos(a)*d,yy=Math.sin(a)*d*.78;
      c.fillStyle=colors[(i+flavour)%colors.length];
      c.beginPath();c.ellipse(xx,yy,r*(.26+(i%3)*.03),r*.18,a,0,Math.PI*2);c.fill();
      c.strokeStyle='#50624d65';c.lineWidth=.7;c.stroke();
    }
    c.strokeStyle='#50624d';c.lineWidth=.65;
    for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7;
      c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*r*.7,Math.sin(a)*r*.48);c.stroke();
    }
    c.restore();
  }
  function willow(c,x,y,r){
    foliage(c,x,y,r,2);
    c.save();c.translate(x,y);c.strokeStyle='#657f58bb';c.lineWidth=1;
    for(let i=0;i<20;i++){
      const a=(i/19)*Math.PI*2;const xx=Math.cos(a)*r*.9, yy=Math.sin(a)*r*.58;
      c.beginPath();c.moveTo(xx*.38,yy*.4);c.quadraticCurveTo(xx,yy-4,xx*.95,yy+r*.29);c.stroke();
    }
    c.restore();
  }
  function building(c,x,y,w,h,side=0){
    c.save();c.translate(x,y);
    c.fillStyle='#4b615032';c.fillRect(4,6,w,h);
    c.fillStyle='#e1d8c5';c.fillRect(0,0,w,h);
    c.strokeStyle='#8f93836b';c.lineWidth=1;c.strokeRect(0,0,w,h);
    c.fillStyle=palette.roof;
    c.beginPath();c.moveTo(-4,0);c.lineTo(w+4,0);c.lineTo(w+1,h*.5);c.lineTo(w+4,h);
    c.lineTo(-4,h);c.lineTo(-1,h*.5);c.closePath();c.fill();
    c.strokeStyle='#45574e';c.lineWidth=1.1;c.stroke();
    c.strokeStyle='#d0cfb9a6';c.lineWidth=.9;
    for(let i=1;i<11;i++){const xx=i*w/11;c.beginPath();c.moveTo(xx,1);c.lineTo(xx,h-1);c.stroke();}
    c.strokeStyle='#475b51';c.lineWidth=1;c.beginPath();c.moveTo(-3,h*.49);c.lineTo(w+3,h*.49);c.stroke();
    c.fillStyle='#a66e55';c.fillRect(side?w*.63:w*.15,h*.39,w*.19,h*.24);
    c.restore();
  }
  function courtyard(c,x,y,w,h){
    c.save();c.fillStyle='#ece1cb';c.fillRect(x,y,w,h);
    c.strokeStyle='#a29276';c.lineWidth=2;c.strokeRect(x,y,w,h);
    c.fillStyle='#c4b69b';for(let i=0;i<6;i++)c.fillRect(x+i*w/6,y+h*.52,w/7,1);
    c.restore();
  }
  function rockery(c,x,y,size){
    c.save();c.translate(x,y);
    c.fillStyle='#a6ad9d';c.strokeStyle='#6f7e72';c.lineWidth=1.1;
    for(let i=0;i<7;i++){
      const a=i*2.4,r=size*(.13+.05*i);const xx=Math.cos(a)*r,yy=Math.sin(a)*r*.7;
      c.beginPath();c.moveTo(xx-size*.18,yy);c.lineTo(xx,yy-size*.4);
      c.lineTo(xx+size*.19,yy-size*.12);c.lineTo(xx+size*.08,yy+size*.21);c.closePath();c.fill();c.stroke();
    }
    c.restore();
  }
  function steps(c,x,y,w=38){
    c.save();c.fillStyle='#cfc2a7';c.fillRect(x,y,w,9);
    c.strokeStyle='#948b76';c.lineWidth=1;
    for(let i=0;i<5;i++){c.beginPath();c.moveTo(x+i*w/5,y);c.lineTo(x+i*w/5,y+9);c.stroke();}
    c.restore();
  }
  function landmark(c,t){
    const id=t.id;
    // These eight unique compositional arrangements are deliberate drawings
    // about where space, roads, gardens and buildings belong, not final art.
    if(id==='garden-grove'){
      courtyard(c,35,28,102,70);building(c,43,29,76,22);
      rockery(c,82,154,30);willow(c,175,151,34);
      foliage(c,26,182,18,1);foliage(c,169,42,23,2);
    }else if(id==='street-straight'){
      courtyard(c,11,25,63,126);building(c,18,33,47,34);
      courtyard(c,145,83,63,110);building(c,150,123,52,38,1);
      willow(c,30,191,24);foliage(c,188,24,21,0);
      steps(c,72,91,20);steps(c,130,147,18);
    }else if(id==='street-bend'){
      courtyard(c,17,134,81,62);building(c,23,142,65,26);
      courtyard(c,128,132,74,69);building(c,136,150,56,34,1);
      rockery(c,63,77,18);foliage(c,175,50,28,2);
      steps(c,85,174,19);
    }else if(id==='market-cross'){
      building(c,15,17,64,27);building(c,143,18,59,29,1);
      building(c,19,159,59,35);building(c,143,164,59,32);
      for(let i=0;i<3;i++){steps(c,19+i*7,60+i*4,13);steps(c,166+i*8,150-i*4,13);}
    }else if(id==='canal-straight'){
      building(c,13,42,57,34);courtyard(c,9,106,56,73);
      willow(c,173,41,31);willow(c,174,172,32);
      steps(c,62,152,20);rockery(c,36,186,16);
    }else if(id==='canal-bend'){
      courtyard(c,21,134,73,62);building(c,26,143,62,26);
      willow(c,36,54,25);willow(c,181,178,25);
      rockery(c,138,181,24);steps(c,94,176,23);
    }else if(id==='stone-bridge'){
      courtyard(c,4,31,39,70);building(c,7,40,34,22);
      courtyard(c,177,128,38,68);building(c,183,158,27,28,1);
      c.strokeStyle='#6f6e61';c.lineWidth=1.6;
      for(let i=0;i<7;i++){
        c.beginPath();
        if(t.edges[1]==='S'){c.moveTo(83,72+i*12);c.lineTo(137,72+i*12);}
        else{c.moveTo(72+i*12,83);c.lineTo(72+i*12,137);}
        c.stroke();
      }
      willow(c,26,170,20);
    }else if(id==='canal-junction'){
      courtyard(c,14,141,63,62);building(c,20,155,49,26);
      willow(c,31,55,25);rockery(c,183,177,28);
      steps(c,64,163,18);
    }
  }
  function study(c,t){
    const e=t.edges;
    c.fillStyle=palette.land;c.fillRect(0,0,T,T);
    // Full-bleed landscape reaches every edge: no square inset, frame,
    // hidden seam or artificial apron. A joined board must remain seamless.
    drawRoute(c,e,'W',88,palette.water);
    if(e.includes('W')){
      c.save();c.globalAlpha=.45;drawRoute(c,e,'W',1,'#c2d9c9');c.restore();
    }
    drawRoute(c,e,'S',44,palette.path);
    if(e.includes('S'))drawRoute(c,e,'S',1.4,'#e9ddc6');
    // A bridge crossing has a separate pedestrian graph ABOVE the water.
    if(t.id==='stone-bridge'){
      // A rotated bridge retains upright buildings but changes the deck
      // axis. Its road edges connect over, not into, the navigable water.
      const horizontal=e[1]==='S';
      c.fillStyle='#c6bba5';
      if(horizontal)c.fillRect(63,91,94,38);else c.fillRect(91,63,38,94);
      c.strokeStyle='#8a7e6b';
      if(horizontal)c.strokeRect(63,91,94,38);else c.strokeRect(91,63,38,94);
      c.strokeStyle='#eadbc2';c.lineWidth=3;c.beginPath();
      if(horizontal){c.moveTo(65,95);c.lineTo(154,95);c.moveTo(65,126);c.lineTo(154,126);}
      else{c.moveTo(95,65);c.lineTo(95,154);c.moveTo(126,65);c.lineTo(126,154);}
      c.stroke();
    }
    landmark(c,t);
    // Crisp study watermark; no one should mistake these for signed-off art.
    c.fillStyle='#34483d';c.globalAlpha=.64;
    c.font='9px system-ui,sans-serif';c.fillText('LAYOUT STUDY',13,209);c.globalAlpha=1;
  }
  function draw(c,t){
    c.save();c.translate(t.x*T,t.y*T);
    c.beginPath();c.rect(0,0,T,T);c.clip();
    if(t.fixed){
      const i=Number(t.artIndex),im=lake.get(i);
      if(im?.complete&&im.naturalWidth===512){
        c.drawImage(im,0,0,T,T);
      }else{
        c.fillStyle='#d6d5c1';c.fillRect(0,0,T,T);
        c.fillStyle='#536358';c.font='12px system-ui,sans-serif';
        c.fillText('Lake reference',22,105);
        c.fillText('art loading',22,123);
      }
    }else{
      const k=t.id+':'+(t.rotation||0),im=masters.get(k);
      if(im?.complete&&im.naturalWidth>=1024&&im.naturalWidth===im.naturalHeight){
        c.drawImage(im,0,0,T,T);
      }else{
        study(c,t);
      }
    }
    c.restore();return true;
  }
  // PR13: a supplied high-resolution pilot may be inspected directly in the
  // current browser session without claiming that it is a committed master.
  // The image's architectural orientation is NEVER physically rotated.
  function registerReviewImage(key,im){
    if(key!=='street-straight:1')throw Error('PR13 permits only the east-west road pilot');
    if(!im?.complete||im.naturalWidth<1024||im.naturalWidth!==im.naturalHeight)
      throw Error('Pilot must be a fully loaded square image of at least 1024 pixels');
    masters.set(key,im);temporaryReviewKeys.add(key);repaint();
    return true;
  }
  function clearReviewImage(key){
    if(temporaryReviewKeys.has(key)){
      temporaryReviewKeys.delete(key);
      if(permanentMasters.has(key))masters.set(key,permanentMasters.get(key));
      else masters.delete(key);
      repaint();
    }
  }
  function getReviewImage(key){return temporaryReviewKeys.has(key)?masters.get(key):null;}
  function getMaster(key){
    const im=permanentMasters.get(key);
    return (im?.complete&&im.naturalWidth>=1024&&im.naturalWidth===im.naturalHeight)?im:null;
  }
  function inspect(){
    return {mode:'v2-composition-studies',manifestStatus,studies:schema.archetypes.length,
      paintingVariantsLoaded:[...permanentMasters.values()].filter(i=>i.complete&&i.naturalWidth>=1024&&i.naturalWidth===i.naturalHeight).length,
      lakeReferencesLoaded:[...lake.values()].filter(i=>i.complete&&i.naturalWidth).length,
      temporaryReviewKeys:[...temporaryReviewKeys],
      failures:[...failures]};
  }
  window.YangzhouArtV2={draw,inspect,registerReviewImage,clearReviewImage,getReviewImage,getMaster,
    ready:()=>[...lake.values()].every(i=>i.complete&&i.naturalWidth)};
})();
