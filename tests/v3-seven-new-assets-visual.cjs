'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const URL='http://127.0.0.1:8765/layer2-seven-new-assets-v3.html';
fs.mkdirSync('artifacts/v3',{recursive:true});
async function inspect(page,filename){
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(URL,{waitUntil:'load'});
 await page.waitForFunction(()=>document.querySelector('#loadStatus')?.textContent.includes('7 of 7'),null,{timeout:60000});
 assert.equal(await page.locator('#gallery article').count(),7);
 assert.equal(await page.locator('#gallery img').count(),7);
 assert.equal(await page.locator('#bridgeCloseup').count(),1);
 assert.equal(await page.locator('#showBridgeGuides').isChecked(),true);
 const closeup=await page.locator('#bridgeCloseup').evaluate(c=>({width:c.width,height:c.height,alpha:c.getContext('2d').getImageData(352,256,1,1).data[3]}));
 assert.deepEqual([closeup.width,closeup.height],[704,512]);
 assert(closeup.alpha>0,'Bridge close-up must contain real connected V3 pixels');
 // Pixel regression: the painted bridge has transparent upper/lower
 // margins within the exactly 88x44 footprint. Those must show the same
 // canal pixels with bridge artwork toggled on or off: NO stone underlay.
 const waterProof=await page.evaluate(()=>{
  const art=document.querySelector('#showNew');
  const c=document.querySelector('#scene').getContext('2d');
  const px=(x,y)=>[...c.getImageData(Math.round(x*2),Math.round(y*2),1,1).data];
  const samples=[[534,309],[550,309],[566,309],[534,350],[550,350],[566,350]];
  const painted=samples.map(([x,y])=>px(x,y));
  const deck=px(550,330);
  art.click();
  const water=samples.map(([x,y])=>px(x,y));
  const exposedCanal=px(550,330);
  art.click();
  return {painted,water,deck,exposedCanal,artRestored:art.checked};
 });
 assert.equal(waterProof.artRestored,true,'Bridge artwork display restored after water-only comparison');
 assert.deepEqual(waterProof.painted,waterProof.water,
  'All transparent bridge-margin pixels MUST show unchanged canal water, never stone road texture');
 assert.notDeepEqual(waterProof.deck,waterProof.exposedCanal,
  'Bridge image must still paint a visible deck above the canal water');
 const snap=await page.evaluate(()=>{
  const canvas=document.querySelector('canvas'),p=window.YangzhouV3SevenCandidates.plan({gateWidth:30});
  return {width:canvas.width,height:canvas.height,tiles:p.tiles.length,art:p.allNewAssetsIncluded,
   pixels:[...canvas.getContext('2d').getImageData(880,880,1,1).data]};
 });
 assert.deepEqual([snap.width,snap.height,snap.tiles,snap.art],[1760,1760,16,true]);
 assert(snap.pixels[3]>0,'Canvas must contain actual rendered pixels');
 assert.deepEqual(errors,[]);
 await page.screenshot({path:'artifacts/v3/'+filename,fullPage:true,animations:'disabled'});
}
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  const desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await inspect(desktop,'seven-new-assets-connected-4x4-desktop.png');
  await desktop.locator('#showGrid').uncheck();
  await desktop.locator('#zoomIn').click();
  await desktop.locator('#zoomIn').click();
  assert.equal(await desktop.locator('#zoomLabel').textContent(),'3×');
  assert.equal(await desktop.locator('#gateWidth').count(),0);
  await desktop.locator('#showBridgeGuides').uncheck();
  await desktop.screenshot({path:'artifacts/v3/bridge-exact-span-88-by-44-no-guides.png',fullPage:true,animations:'disabled'});
  await desktop.locator('#showBridgeGuides').check();
  await desktop.screenshot({path:'artifacts/v3/seven-new-assets-replacements-3x.png',fullPage:true,animations:'disabled'});
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await inspect(mobile,'seven-new-assets-connected-4x4-mobile.png');
  console.log('Seven original paintings loaded SHA-verified in 4x4 canvas, gallery and mobile/desktop, and replacement assets display without retired side gate.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
