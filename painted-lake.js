/* Individually exported painted Slender West Lake square masters.
 * Atlas/panorama cropping is never done at runtime. The game only switches
 * to this layer after all six images have been staged and decoded.
 * Missing/staged assets leave the existing orthographic map operational.
 */
(() => {
  'use strict';
  const DIR='assets/lake/';
  const CELLS=[
    [0,0,'01-willow-garden.webp','LLLL'],
    [1,0,'02-northern-lake.webp','WLWL'],
    [2,0,'03-lakeside-teahouse.webp','LLLL'],
    [0,1,'04-white-pagoda.webp','LSLL'],
    [1,1,'05-five-pavilion-bridge.webp','WSWS'],
    [2,1,'06-breakfast-house.webp','LLLS']
  ];
  const previewRequested=new URLSearchParams(window.location.search).get('lakeArt')==='preview';
  let status='pending',reason='Staged artwork is not deployed',loaded=0;
  const images=new Map();
  const invalidate=()=>{
    window.YangzhouTiles?.clear?.();
    if(window.YangzhouDebug?.state)window.YangzhouDebug.state.dirty=true;
  };
  async function start(){
    try{
      const response=await fetch(DIR+'manifest.json',{cache:'no-cache'});
      if(!response.ok)throw Error('Lake artwork manifest unavailable');
      const manifest=await response.json();
      if(!['approved','review','staged'].includes(manifest.status)){
        status='unavailable';reason='Painting manifest is not available for display';
        return;
      }
      // Painterly source art is displayed by default so players no longer see
      // the flat geometry prototype. REVIEW is not production art sign-off.
      // The explicit ?lakeArt=preview mode remains available for inspection.
      if(!Array.isArray(manifest.tiles)||manifest.tiles.length!==CELLS.length)throw Error('Expected six square masters');
      for(const [x,y,src,signature] of CELLS){
        const row=manifest.tiles.find(t=>t.x===x&&t.y===y);
        if(!row||row.file!==src||row.edges!==signature)throw Error('Art manifest does not match canonical tile '+x+','+y);
      }
      const results=await Promise.all(CELLS.map(async ([x,y,name])=>{
        const image=new Image();
        image.src=DIR+name;
        await image.decode();
        if(image.naturalWidth!==image.naturalHeight||image.naturalWidth<512){
          throw Error(name+' must be an independently exported square at 512px or greater');
        }
        return [x+','+y,image];
      }));
      for(const [key,image] of results)images.set(key,image);
      loaded=results.length;
      status=manifest.status==='approved'?'ready':previewRequested?'preview':'review';
      reason=status==='ready'?'':'Painted lake in visual review; historical and outer-ring checks outstanding';
      invalidate();
    }catch(error){
      status='unavailable';reason=String(error?.message||error);
      images.clear();loaded=0;invalidate();
    }
  }
  window.YangzhouLakePainted={
    draw:(c,t)=>{
      const image=(status==='ready'||status==='preview'||status==='review')&&t.fixed?images.get(t.x+','+t.y):null;
      if(!image)return false;
      c.drawImage(image,0,0,220,220);
      return true;
    },
    ready:()=>status==='ready'||status==='preview'||status==='review',
    inspect:()=>({status,loaded,reason,previewRequested,mode:'independent painted square masters',filenames:CELLS.map(row=>row[2])})
  };
  start();
})();
