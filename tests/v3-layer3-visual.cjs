'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const URL='http://127.0.0.1:8765/layer3-fine-details-v3.html';
fs.mkdirSync('artifacts/v3',{recursive:true});
async function inspect(page,label){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(URL,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{
  const el=document.getElementById('loadStatus'),r=window.YangzhouV3FineReview;
  return el?.textContent.includes('8 / 8')&&el?.textContent.includes('All 18 Layer 2')&&
    r?.getPlan()?.tiles.length===25;
 },null,{timeout:120000});
 const state=await page.evaluate(()=>{
  const r=window.YangzhouV3FineReview,p=r.getPlan(),c=document.getElementById('scene');
  const imgs=[...document.querySelectorAll('#gallery img')];
  return {canvas:[c.width,c.height],used:p.used,total:p.totalPlacements,
    counts:p.counts,gallery:imgs.length,images:imgs.filter(i=>i.complete&&i.naturalWidth>0).length,
    error:r.getErrors(),source:document.querySelector('#sourceFrame').contentDocument
     .getElementById('loadStatus').textContent};
 });
 assert.deepEqual(state.canvas,[2200,2200]);
 assert.equal(state.used.length,8,'All eight sprites must be in context');
 assert(state.total>=20&&state.total<=60,'Density should be restrained');
 assert.equal(state.gallery,8);assert.equal(state.images,8);
 assert.deepEqual(state.error,[]);
 assert.match(state.source,/18 \/ 18/);
 // For each fine asset, removing the overlay must change real pixels in at
 // least one of its in-context footprints, not only the gallery.
 const compare=await page.evaluate(()=>{
  const r=window.YangzhouV3FineReview,p=r.getPlan(),canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');
  const sample=id=>{
   const entry=p.tiles.find(x=>x.art.some(a=>a.id===id));
   const pos=entry.art.find(a=>a.id===id),d=r.fine.ASSETS[id];
   const x=Math.round((entry.tile.x*220+pos.x-d.width/2)*2);
   const y=Math.round((entry.tile.y*220+pos.y-d.height/2)*2);
   return ctx.getImageData(x,y,Math.round(d.width*2),Math.round(d.height*2)).data;
  };
  const ids=[...r.fine.IDS],before=ids.map(id=>new Uint8ClampedArray(sample(id)));
  const water=()=>[...ctx.getImageData(2*(2*220+110),2*(0*220+110),1,1).data];
  const road=()=>[...ctx.getImageData(2*(1*220+110),2*(1*220+110),1,1).data];
  const oldWater=water(),oldRoad=road();
  document.getElementById('showFine').click();
  const after=ids.map(id=>new Uint8ClampedArray(sample(id)));
  const diff=ids.map((id,k)=>{
   let delta=0;for(let i=0;i<before[k].length;i+=4)
    delta+=Math.abs(before[k][i]-after[k][i])+
      Math.abs(before[k][i+1]-after[k][i+1])+
      Math.abs(before[k][i+2]-after[k][i+2]);
   return {id,delta};
  });
  const cleanWater=water(),cleanRoad=road();
  document.getElementById('showFine').click();
  return {diff,waterEqual:JSON.stringify(oldWater)===JSON.stringify(cleanWater),
    roadEqual:JSON.stringify(oldRoad)===JSON.stringify(cleanRoad),
    restored:document.getElementById('showFine').checked};
 });
 assert(compare.diff.every(x=>x.delta>500),
  'Every candidate needs visible in-context pixels: '+JSON.stringify(compare.diff));
 assert(compare.waterEqual&&compare.roadEqual,'Unchanged road and canal cores');
 assert(compare.restored);
 assert.deepEqual(errors,[],'No browser scripting errors');
 await page.locator('#scene').screenshot({path:'artifacts/v3/layer3-eight-'+label+'-5x5.png',animations:'disabled'});
 await page.screenshot({path:'artifacts/v3/layer3-eight-'+label+'-page.png',fullPage:true,animations:'disabled'});
 for(const c of ['plumCrop','willowCrop','courtCrop','marketCrop','bankCrop'])
  if(label==='desktop')await page.locator('#'+c).screenshot({path:'artifacts/v3/layer3-'+c+'.png',animations:'disabled'});
 return state;
}
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const state=await inspect(desktop,'desktop');
  await desktop.locator('#zoomIn').click();await desktop.locator('#zoomIn').click();
  assert.equal(await desktop.locator('#zoomText').textContent(),'3×');
  await desktop.locator('#zoomReset').click();
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await inspect(mobile,'mobile');
  console.log('Layer 3 desktop/mobile paint proof: 8 SHA-verified sprites, '+state.total+
   ' in-context detail placements, on/off pixel differences, unchanged canal and road, 1x/3x checks, gallery and close-ups.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
