'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const URL='http://127.0.0.1:8765/layer2-all-assets-v3.html';
fs.mkdirSync('artifacts/v3',{recursive:true});
async function inspect(page,label){
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 await page.goto(URL,{waitUntil:'load'});
 await page.waitForFunction(()=>document.querySelector('#loadStatus')?.textContent.includes('18 / 18'),null,{timeout:120000});
 const state=await page.evaluate(()=>{
  const board=window.YangzhouV3AllLayer2Review,plan=board.plan(),c=document.querySelector('#scene');
  return {width:c.width,height:c.height,count:plan.tiles.length,unique:plan.totalUnique,missing:plan.missing,
    sprites:document.querySelectorAll('#galleryCards article').length,
    verifiedImages:[...document.querySelectorAll('#galleryCards img')].filter(i=>i.complete&&i.naturalWidth>0).length,
    details:['plumCloseup','stepCloseup','southCloseup','bridgeCloseup']
      .map(id=>({id,width:document.getElementById(id).width,
       alpha:document.getElementById(id).getContext('2d').getImageData(300,200,1,1).data[3]}))
  };
 });
 assert.deepEqual([state.width,state.height,state.count,state.unique],[2200,2200,25,18]);
 assert.deepEqual(state.missing,[]);
 assert.equal(state.sprites,18);assert.equal(state.verifiedImages,18);
 assert(state.details.every(x=>x.alpha>0),'All four close-ups must show real rendered pixels');
 assert.deepEqual(errors,[],'No page scripting failures');
 const paintProof=await page.evaluate(()=>{
  const cv=document.getElementById('scene'),context=cv.getContext('2d');
  const checksum=(x,y,w,h)=>{
   const d=context.getImageData(Math.round(x*2),Math.round(y*2),Math.round(w*2),Math.round(h*2)).data;
   let value=0;for(let i=0;i<d.length;i+=4)value=(value+((i/4+1)%97)*(d[i]+d[i+1]*3+d[i+2]*7))%1000000007;
   return value;
  };
  const selected={
   plum:checksum(88,89,44,48),
   step:checksum(100,132,20,10),
   south:checksum(738,820,65,41),
   canal:checksum(758,753,20,25)
  };
  const three=document.getElementById('showThree');three.click();
  const without={
   plum:checksum(88,89,44,48),step:checksum(100,132,20,10),
   south:checksum(738,820,65,41),canal:checksum(758,753,20,25)
  };
  three.click();
  const bridgeCenter=checksum(530,321,40,18);
  const bridgeWaterMargin=checksum(530,307,40,4);
  const seven=document.getElementById('showSeven');seven.click();
  const missingBridgeCenter=checksum(530,321,40,18);
  const waterOnlyMargin=checksum(530,307,40,4);
  seven.click();
  return {selected,without,bridgeCenter,bridgeWaterMargin,missingBridgeCenter,waterOnlyMargin,
    threeRestored:three.checked,sevenRestored:seven.checked};
 });
 for(const id of ['plum','step','south'])
  assert.notEqual(paintProof.selected[id],paintProof.without[id],id+' must visibly change the in-context render');
 assert.equal(paintProof.selected.canal,paintProof.without.canal,'New south-bank landing cannot alter canal-water pixels');
 assert.notEqual(paintProof.bridgeCenter,paintProof.missingBridgeCenter,'Bridge painting is visible over water');
 assert.equal(paintProof.bridgeWaterMargin,paintProof.waterOnlyMargin,'Transparent bridge margins must show water, not road underlay');
 assert(paintProof.threeRestored&&paintProof.sevenRestored,'Source group toggles are restored');
 await page.locator('#scene').screenshot({path:'artifacts/v3/all-layer2-'+label+'-5x5.png',animations:'disabled'});
 await page.locator('#plumCloseup').screenshot({path:'artifacts/v3/plum-'+label+'.png'});
 await page.locator('#stepCloseup').screenshot({path:'artifacts/v3/step-'+label+'.png'});
 await page.locator('#southCloseup').screenshot({path:'artifacts/v3/south-bank-'+label+'.png'});
 await page.locator('#bridgeCloseup').screenshot({path:'artifacts/v3/bridge-'+label+'.png'});
}
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const desktop=await browser.newPage({viewport:{width:1480,height:920},deviceScaleFactor:1});
  await inspect(desktop,'desktop');
  await desktop.waitForFunction(()=>document.querySelector('#loadStatus')?.textContent.includes('Grass/stone/water: 3/3'));
  await desktop.waitForFunction(()=>document.getElementById('grassVersion').value==='fine');
  const freshGrass=await desktop.locator('#scene').evaluate(c=>{
   const ctx=c.getContext('2d');
   return Array.from(ctx.getImageData(920*2,960*2,60*2,60*2).data).reduce((a,v,i)=>a+(i%4===3?0:v),0);
  });
  await desktop.locator('#grassVersion').selectOption('original');
  await desktop.waitForFunction(()=>document.querySelector('#loadStatus')?.textContent.includes('Grass/stone/water: 3/3'));
  await desktop.locator('#scene').screenshot({path:'artifacts/v3/all-layer2-grass-v1-comparison.png',animations:'disabled'});
  const oldGrass=await desktop.locator('#scene').evaluate(c=>{
   const ctx=c.getContext('2d');
   return Array.from(ctx.getImageData(920*2,960*2,60*2,60*2).data).reduce((a,v,i)=>a+(i%4===3?0:v),0);
  });
  assert.notEqual(freshGrass,oldGrass,'Fine grass v2 and archived original v1 must visibly differ');
  await desktop.locator('#grassVersion').selectOption('fine');
  await desktop.locator('#scene').screenshot({path:'artifacts/v3/all-layer2-fine-grass-v2.png',animations:'disabled'});
  // The seam-safe, lossless WebP must decode with exactly identical RGB
  // along both repeating edges. Check full pixel rows/columns in Chromium.
  const seams=await desktop.evaluate(async()=>{
   const img=new Image();img.src='assets/v3/materials/grass-02-lossless.webp';await img.decode();
   const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
   const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0);
   const a=cx.getImageData(0,0,c.width,c.height).data,W=c.width,H=c.height;
   let horizontal=0,vertical=0;for(let y=0;y<H;y++)for(let k=0;k<3;k++){
     if(a[(y*W)*4+k]!==a[(y*W+W-1)*4+k])horizontal++;
   }
   for(let x=0;x<W;x++)for(let k=0;k<3;k++){
     if(a[x*4+k]!==a[((H-1)*W+x)*4+k])vertical++;
   }
   return {horizontal,vertical,width:W,height:H};
  });
  assert.deepEqual(seams,{horizontal:0,vertical:0,width:1254,height:1254},
   'Fine grass v2 must have pixel-matched top/bottom and left/right repeat edges');
  await desktop.locator('#zoomIn').click();await desktop.locator('#zoomIn').click();
  assert.equal(await desktop.locator('#zoomText').textContent(),'3×');
  await desktop.locator('#focusAsset').selectOption('south-bank-landing-01');
  assert.equal(await desktop.locator('#focusAsset').inputValue(),'south-bank-landing-01');
  await desktop.locator('#zoomReset').click();
  await desktop.screenshot({path:'artifacts/v3/all-layer2-desktop-review-page.png',fullPage:true,animations:'disabled'});
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await inspect(mobile,'mobile');
  console.log('V3 whole-board QA: all 18 images verified; 25 valid tiles, 3 new sprite toggle proofs, bridge-water proof, desktop and mobile close-ups captured.');
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
