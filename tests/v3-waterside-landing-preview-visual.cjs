'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const url='http://127.0.0.1:8765/waterside-landing-review-v3.html';
async function sample(page,x,y){
 return await page.evaluate(([x,y])=>{
  const ctx=document.getElementById('scene').getContext('2d');
  return [...ctx.getImageData(Math.round(x*3),Math.round(y*3),1,1).data];
 },[x,y]);
}
async function sum(page,x,y,w,h){
 return page.evaluate(([x,y,w,h])=>{
  const data=document.getElementById('scene').getContext('2d')
   .getImageData(Math.round(x*3),Math.round(y*3),Math.round(w*3),Math.round(h*3)).data;
  let s=0;
  for(let i=0;i<data.length;i+=4)
   s=(s+(data[i]*3+data[i+1]*5+data[i+2]*7)>>>0)>>>0;
  return s;
 },[x,y,w,h]);
}
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950},deviceScaleFactor:1});
  page.on('pageerror',err=>errors.push('desktop: '+err.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.getElementById('landingStatus')?.textContent.includes(
   'Original Waterside Landing 01 verified'),null,{timeout:40000});
  await page.waitForFunction(()=>document.getElementById('materialStatus')?.textContent.includes(
   'original painted grass, stone, canal water and bank edge loaded'),null,{timeout:40000});
  const data=JSON.parse(await page.locator('#report').textContent());
  assert.equal(data.tiles.length,3);
  assert.deepEqual(data.tiles.map(t=>t.edges.join('')),['LWLW','LWLW','LWLW']);
  assert.deepEqual(data.canal.seams,[220,440]);
  assert.equal(data.canal.width,88);
  assert.equal(data.canal.north,66);
  assert.equal(data.canal.south,154);
  assert.equal(data.canal.paintedSource,true);
  assert.equal(data.canal.bankSource,true);
  assert.equal(data.landing.sha256Verified,true);
  assert.equal(data.landing.visible,true);
  assert.deepEqual(data.landing.center,[110,53]);
  const realWater=[];
  for(const x of [110,218,220,330,438,440,550]){
   const v=await sample(page,x,110);
   assert.equal(v[3],255,'Water mask must reach all three tiles and both seams at x='+x);
   realWater.push(v);
  }
  const landingOn=await sum(page,285,31,91,35);
  const unmovedWater=await sample(page,330,110);
  const outsideBank=await sample(page,330,170);
  const leftBank=await sum(page,0,59,220,20);
  await page.locator('#scene').screenshot({
   path:'artifacts/v3/waterside-landing-connected-canal-1x.png'});
  await page.locator('#closeUp').screenshot({
   path:'artifacts/v3/waterside-landing-stone-to-water-closeup.png'});
  await page.screenshot({path:'artifacts/v3/waterside-landing-review-page-desktop.png',fullPage:true});
  await page.locator('#showLanding').uncheck();
  assert.notEqual(landingOn,await sum(page,285,31,91,35),
   'Real independent masked landing sprite must be visible over the north shore');
  assert.deepEqual(await sample(page,330,110),unmovedWater,
   'Landing must not change water core beyond the stone steps');
  assert.deepEqual(await sample(page,330,170),outsideBank,
   'Landing must not paint over distant south-bank ground');
  assert.deepEqual(await Promise.all([110,218,220,330,438,440,550]
   .map(x=>sample(page,x,110))),realWater,
   'All three original painted water segments survive sprite hide/show');
  await page.locator('#showLanding').check();
  assert.equal(await sum(page,285,31,91,35),landingOn);
  await page.locator('#showBank').uncheck();
  assert.notEqual(leftBank,await sum(page,0,59,220,20),
   'Painted canal-bank candidate should visibly differ from flat diagnostic edge');
  assert.deepEqual(await sample(page,330,110),unmovedWater,
   'Bank texture toggle must never alter the navigable water channel');
  await page.locator('#showBank').check();
  await page.locator('#showTextures').uncheck();
  assert.notDeepEqual(await sample(page,330,110),unmovedWater,
   'Painted jade water should be distinct from the diagnostic flat-colour fallback');
  await page.locator('#showTextures').check();
  assert.deepEqual(await sample(page,330,110),unmovedWater);
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(e=>e.style.width),'1980px');
  await page.locator('#scene').screenshot({
   path:'artifacts/v3/waterside-landing-connected-canal-3x.png'});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,
   hasTouch:true,deviceScaleFactor:1});
  mobile.on('pageerror',err=>errors.push('mobile: '+err.message));
  await mobile.goto(url,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.getElementById('landingStatus')?.textContent.includes(
   'Original Waterside Landing 01 verified'),null,{timeout:40000});
  await mobile.waitForFunction(()=>document.getElementById('materialStatus')?.textContent.includes(
   'original painted grass, stone, canal water and bank edge loaded'),null,{timeout:40000});
  await mobile.screenshot({path:'artifacts/v3/waterside-landing-connected-canal-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No desktop/mobile JS errors');
  console.log('V3 rev50 landing panorama browser QA: exact original sprite, three connected 88-unit canal masks, real painted bank and jade water, controls, 1x/3x/mobile.');
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1});
