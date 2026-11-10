/* Yangzhou's painterly expansion deck.
 * All 52 variants are individually composed, compass-upright square images,
 * grouped in thirteen 2x2 WebP atlases solely for loading efficiency.
 * Deck art is a HUMAN-REVIEW build, not a production art acceptance claim.
 */
(() => {
  'use strict';
  const ROOT='assets/tiles/painterly/';
  const WORLD=220;
  const SIZE=512;
  const disable=new URLSearchParams(window.location.search).get('tileArt')==='legacy';
  const topology=window.YangzhouTileTopology;
  const schema=topology?.archetypes||[];
  const images=new Map(),errors=new Map();
  let manifest=null,status=disable?'disabled':'loading';
  const notify=()=>{
    window.YangzhouTiles?.clear?.();
    if(window.YangzhouDebug?.state)window.YangzhouDebug.state.dirty=true;
    window.dispatchEvent?.(new Event('yangzhou-painterly-art-loaded'));
  };
  function locate(t){
    let index=Number.isInteger(t.archetypeIndex)?t.archetypeIndex:
      (typeof t.name==='string'?schema.findIndex(a=>a.name===t.name):-1);
    if(index<0||index>=schema.length)return null;
    let rotation=Number.isInteger(t.rotation)?((t.rotation%4)+4)%4:-1;
    if(rotation<0){
      // Legacy items can be identified from their N/E/S/W graph. Symmetric
      // signatures are visually identical at r0 and r2 unless explicitly set.
      rotation=[0,1,2,3].find(r=>topology.rotateEdges(schema[index].edges,r).join('')===t.edges.join(''));
    }
    if(rotation===undefined||rotation<0)return null;
    const declared=topology.rotateEdges(schema[index].edges,rotation).join('');
    if(!t.edges||t.edges.join('')!==declared)return null;
    return {index,rotation,declared};
  }
  function request(index){
    if(!manifest||status==='disabled'||images.has(index)||errors.has(index))return;
    const row=manifest.archetypes[index];
    const image=new Image();
    image.decoding='async';
    images.set(index,image);
    image.onload=()=>{
      if(image.naturalWidth!==1024||image.naturalHeight!==1024){
        errors.set(index,'Artwork atlas not 1024x1024: '+row.atlas);
        images.delete(index);
      }
      notify();
    };
    image.onerror=()=>{
      errors.set(index,'Artwork failed to load: '+row.atlas);
      images.delete(index);
      notify();
    };
    image.src=ROOT+row.atlas;
  }
  async function start(){
    if(disable)return;
    try{
      const response=await fetch(ROOT+'manifest.json',{cache:'no-cache'});
      if(!response.ok)throw Error('Painterly expansion manifest unavailable');
      const next=await response.json();
      if(!['review','approved'].includes(next.status)||next.archetypes?.length!==schema.length)
        throw Error('Painterly deck manifest not ready for use');
      for(let i=0;i<schema.length;i++){
        const spec=next.archetypes[i],reference=schema[i];
        if(spec.index!==i||spec.name!==reference.name||spec.baseEdges!==reference.edges.join('')||
           spec.variants?.length!==4||spec.atlas!=='archetype-'+String(i).padStart(2,'0')+'.webp')
          throw Error('Painterly tile manifest mismatches topology: '+reference.name);
        for(let r=0;r<4;r++){
          if(spec.variants[r].rotation!==r||
             spec.variants[r].edges!==topology.rotateEdges(reference.edges,r).join(''))
            throw Error('Painterly tile rotation mismatches: '+reference.name+' r'+r);
        }
      }
      manifest=next;
      status=next.status;
      notify();
    }catch(error){
      status='unavailable';errors.set('manifest',String(error?.message||error));
      notify();
    }
  }
  function draw(c,t){
    if(t.fixed||!manifest||status==='disabled'||status==='unavailable')return false;
    const at=locate(t);
    if(!at)return false;
    request(at.index);
    const image=images.get(at.index);
    if(!image?.complete||image.naturalWidth!==1024)return false;
    const ox=(at.rotation%2)*SIZE,oy=Math.floor(at.rotation/2)*SIZE;
    c.drawImage(image,ox,oy,SIZE,SIZE,0,0,WORLD,WORLD);
    return true;
  }
  window.YangzhouDeckPainter={
    draw,
    enabled:()=>!!manifest,
    locate,
    inspect:()=>({status,disabled:disable,loaded:[...images.values()].filter(i=>i.complete&&i.naturalWidth).length,
      expected:schema.length,errors:Object.fromEntries(errors),reviewRequired:status!=='approved'})
  };
  start();
})();