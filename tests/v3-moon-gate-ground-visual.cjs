'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const URL='http://127.0.0.1:8765/wall-geometry-lab-v3.html';
async function pixel(page,x,y){
 return page.evaluate(([x,y])=>{
  const ctx=document.getElementById('scene').getContext('2d');
  return Array.from(ctx.getImageData(Math.round(x*3),Math.round(y*3),1,1).data);
 },[x,y]);
}
function different(a,b){return a.slice(0,3).some((v,i)=>Math.abs(v-b[i])>2);}
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:920},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop '+e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  for(const [id,match] of [
   ['#moonGateStatus','Original Moon Gate 01 verified'],
   ['#walkwayStatus','verified (480×800; exact SHA-256)'],
   ['#pavingStatus','verified (1254×1254'],
   ['#faceStatus','2/2 authentic']]){
   await page.waitForFunction(([id,match])=>
    document.querySelector(id)?.textContent.includes(match),[id,match],{timeout:40000});
  }
  assert(await page.locator('#showGateGround').isChecked());
  assert(await page.locator('#showWalkway').isChecked());
  assert(await page.locator('#showPaving').isChecked());
  let info=JSON.parse(await page.locator('#export').textContent());
  assert(info.audit.valid&&info.moonGateGround.painted);
  assert.equal(info.moonGateGround.source,'walkway-01');
  const southPath=await pixel(page,110,184);
  const outside=await pixel(page,110,196);
  const edge=await pixel(page,98,184);
  const step=await pixel(page,110,191);
  await page.locator('#moonGateInspection').screenshot({
   path:'artifacts/v3/rev47-portal-south-and-north-closeups-1x.png'
  });
  await page.screenshot({path:'artifacts/v3/rev47-courtyard-through-gate-1x.png',fullPage:true});
  // Toggle ONLY the projected view, leaving both original ground layers and
  // the gate artwork visible. No ground outside the circle may change.
  await page.locator('#showGateGround').uncheck();
  info=JSON.parse(await page.locator('#export').textContent());
  assert.equal(info.moonGateGround.painted,false);
  const grassThrough=await pixel(page,110,184);
  assert(different(southPath,grassThrough),
   'Original south-gate transparent hole must show real stone path, not plain grass');
  assert.deepEqual(await pixel(page,110,196),outside,
   'Actual outside grass must not be painted over by the portal');
  assert.deepEqual(await pixel(page,98,184),edge,
   'Original ivory masonry wing must remain unchanged');
  assert.deepEqual(await pixel(page,110,191),step,
   'Original stone doorway threshold must remain unchanged');
  await page.locator('#moonGateInspection').screenshot({
   path:'artifacts/v3/rev47-portal-old-flat-grass-comparison.png'
  });
  await page.locator('#showGateGround').check();
  // A real courtyard can show its accepted paving when the optional central
  // walkway is hidden: the gate should NOT revert to artificial solid fill.
  await page.locator('#showWalkway').uncheck();
  info=JSON.parse(await page.locator('#export').textContent());
  assert.equal(info.moonGateGround.source,'courtyard-paving-01');
  assert(info.moonGateGround.painted);
  const courtyardThrough=await pixel(page,110,184);
  assert(different(courtyardThrough,grassThrough),
   'Original courtyard paving should replace plain grass within opening');
  await page.locator('#showPaving').uncheck();
  info=JSON.parse(await page.locator('#export').textContent());
  assert.equal(info.moonGateGround.source,'existing-ground');
  assert.equal(info.moonGateGround.painted,false);
  assert.deepEqual(await pixel(page,110,184),grassThrough,
   'When both verified Layer 1B assets are off the true Layer 1A grass is visible');
  // Northern partial garden has no blanket courtyard paving. The real
  // walkway, if enabled, should still be seen through its northern circle.
  await page.locator('#showWalkway').check();
  await page.locator('#showPaving').check();
  await page.locator('#plan').selectOption('partial');
  info=JSON.parse(await page.locator('#export').textContent());
  assert.equal(info.moonGateGround.source,'walkway-01');
  assert.equal(info.courtyardWalkway.route.direction,'south-from-north-gate');
  const northThrough=await pixel(page,110,50);
  const northGrass=await pixel(page,140,70);
  assert(different(northThrough,northGrass),
   'Northern moon-gate opening shows stone path, not same grass as adjacent ground');
  await page.locator('#moonGateInspection').screenshot({
   path:'artifacts/v3/rev47-north-gate-ground-closeup.png'
  });
  await page.locator('#showWalkway').uncheck();
  info=JSON.parse(await page.locator('#export').textContent());
  assert.equal(info.moonGateGround.source,'existing-ground',
   'Open north garden must fall back to its real grass, not invented paving');
  // No changes to routing for rejected canals, roads, or T/L walls.
  await page.locator('#plan').selectOption('tee');
  info=JSON.parse(await page.locator('#export').textContent());
  assert.equal(info.moonGateGround.source,'existing-ground');
  await page.locator('#plan').selectOption('rectangle');
  await page.locator('#showWalkway').check();
  await page.locator('#zoom').click();
  await page.screenshot({path:'artifacts/v3/rev47-through-moon-gate-3x.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile '+e.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>
   document.querySelector('#moonGateStatus')?.textContent.includes('verified')&&
   document.querySelector('#walkwayStatus')?.textContent.includes('verified'),
   null,{timeout:40000});
  await mobile.screenshot({path:'artifacts/v3/rev47-through-moon-gate-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('V3 rev47 portal ground QA passed: real painted path/courtyard within south/north gate opening, toggles, original threshold/ring and outside grass unchanged, 1x/3x/mobile.');
 }finally{await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1});
