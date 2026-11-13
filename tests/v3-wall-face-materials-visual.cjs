'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const URL='http://127.0.0.1:8765/wall-geometry-lab-v3.html?rev=44';
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errs=[];
 try{
  const page=await browser.newPage({viewport:{width:1480,height:940},deviceScaleFactor:1});
  page.on('pageerror',e=>errs.push('desktop '+e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#summary')?.textContent.includes('Protected V3 ports'),{timeout:11000});
  await page.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes('2/2 authentic'),{timeout:25000});
  await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes('verified'),{timeout:25000});
  assert.match(await page.locator('h1').textContent(),/rev 44/);
  for(const id of ['#showRoofTexture','#showPlasterTexture','#showStoneTexture','#showPerspective']){
   assert(await page.locator(id).isChecked(),'Both new paintings load by default '+id);
  }
  assert.match(await page.locator('#summary').textContent(),/Plaster: painted \(candidate\).*Stone: painted \(candidate\)/);
  assert.match(await page.locator('#faceStatus').textContent(),/2\/2 authentic wall-face materials verified/);
  await page.locator('#showHall').uncheck();
  await page.locator('#showGate').uncheck();
  const at=async(x,y)=>page.evaluate(({x,y})=>{
   const ctx=document.querySelector('#scene').getContext('2d',{willReadFrequently:true});
   return Array.from(ctx.getImageData(Math.round(x*3),Math.round(y*3),1,1).data);
  },{x,y});
  const ground=await at(200,200);
  const plasterPoint=[85,54],basePoint=[85,56];
  const paintedPlaster=await at(...plasterPoint);
  const paintedStone=await at(...basePoint);
  const roofPixel=await at(85,47);
  assert.notDeepEqual(paintedPlaster,ground);
  assert.notDeepEqual(paintedStone,ground);
  for(const pt of [[85,40],[70,170],[34,90],[170,90],[110,178],[110,190]]){
   assert.deepEqual(await at(...pt),ground,'No painted material may fill hidden side or gate at '+pt);
  }
  await page.screenshot({path:'artifacts/v3/wall-painted-three-materials-1x.png',fullPage:true});
  await page.locator('#showPlasterTexture').uncheck();
  const plainPlaster=await at(...plasterPoint);
  assert.notDeepEqual(plainPlaster,paintedPlaster,'Plaster checkbox must change actual rendered pixels');
  assert.deepEqual(await at(85,47),roofPixel,'Plaster toggle must not alter roof painting');
  assert.deepEqual(await at(...basePoint),paintedStone,'Plaster toggle must not replace stone band');
  await page.locator('#showPlasterTexture').check();
  await page.locator('#showStoneTexture').uncheck();
  const plainStone=await at(...basePoint);
  assert.notDeepEqual(plainStone,paintedStone,'Stone checkbox must change real foundation pixels');
  assert.deepEqual(await at(85,47),roofPixel,'Stone toggle must not repaint roof');
  await page.screenshot({path:'artifacts/v3/wall-plaster-only-comparison.png',fullPage:true});
  await page.locator('#showStoneTexture').check();
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(c=>c.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/wall-painted-three-materials-3x.png',fullPage:true});
  await page.locator('#zoom').click();
  const data=JSON.parse(await page.locator('#export').textContent());
  assert.equal(data.faceTextures.plaster.id,'wall-plaster-ivory-01');
  assert.equal(data.faceTextures.stone.id,'wall-stone-base-01');
  assert.equal(data.audit.valid,true);
  assert.equal(data.audit.passableOpenings[0].open,true);
  await page.locator('#plan').selectOption('tee');
  assert.equal(JSON.parse(await page.locator('#export').textContent()).compiled.junctions.filter(j=>j.kind==='T').length,1);
  await page.screenshot({path:'artifacts/v3/wall-painted-t-junction.png',fullPage:true});
  await page.locator('#plan').selectOption('rectangle');
  await page.locator('#study').selectOption('canal');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.screenshot({path:'artifacts/v3/wall-painted-canal-guard.png',fullPage:true});
  await page.locator('#study').selectOption('garden');
  await page.locator('#showHall').check();
  await page.locator('#showTextures').check();
  await page.screenshot({path:'artifacts/v3/wall-painted-courtyard-hall.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errs.push('mobile '+e.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes('2/2 authentic'),{timeout:25000});
  await mobile.screenshot({path:'artifacts/v3/wall-painted-materials-mobile.png',fullPage:true});
  assert.deepEqual(errs,[],'No JS runtime errors with original painted files');
  console.log('V3 painted plaster and stone visual QA passed: exact 2/2 hashed sources, independent toggles, visible elevation, clear gate, unchanged coping, T join, 3x, canals and mobile.');
 }finally{await browser.close();}
}
run().catch(err=>{console.error(err);process.exitCode=1;});
