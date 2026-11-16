'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const URL='http://127.0.0.1:8765/wall-geometry-lab-v3.html';
async function pixel(page,x,y){
 return page.evaluate(({x,y})=>{
  const ctx=document.querySelector('#scene').getContext('2d');
  return Array.from(ctx.getImageData(Math.round(x*3),Math.round(y*3),1,1).data);
 },{x,y});
}
async function run(){
 const errors=[];
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:920},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop '+e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#moonGateStatus')?.textContent.includes(
   'Original Moon Gate 01 verified (1448×721'),{timeout:35000});
  await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes(
   'verified'),{timeout:35000});
  await page.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes(
   '2/2 authentic'),{timeout:35000});
  assert(await page.locator('#showMoonGate').isChecked());
  assert(!(await page.locator('#showGate').isChecked()),
   'Diagnostic dotted thresholds should be hidden for painted gate review');
  const exported=JSON.parse(await page.locator('#export').textContent());
  assert.equal(exported.moonGateFrame.id,'moon-gate-01');
  assert.equal(exported.moonGateFrame.imageVerified,true);
  assert.equal(exported.audit.passableOpenings[0].open,true);
  assert.equal(exported.compiled.gates[0].width,30);
  const paintedSideLeft=await pixel(page,99,185);
  const paintedSideRight=await pixel(page,121,185);
  const paintedThreshold=await pixel(page,110,191);
  const openCentre=await pixel(page,110,184);
  const outside=await pixel(page,110,199);
  await page.locator('#moonGateInspection').screenshot({path:'artifacts/v3/moon-gate-painted-closeup-1x.png'});
  await page.screenshot({path:'artifacts/v3/moon-gate-painted-courtyard-1x.png',fullPage:true});
  await page.locator('#showMoonGate').uncheck();
  const emptyLeft=await pixel(page,99,185);
  const emptyRight=await pixel(page,121,185);
  const emptyThreshold=await pixel(page,110,191);
  const emptyCentre=await pixel(page,110,184);
  const emptyOutside=await pixel(page,110,199);
  assert.notDeepEqual(paintedSideLeft,emptyLeft,
   'Real original painting must fill left stone/plaster jamb, not just a line');
  assert.notDeepEqual(paintedSideRight,emptyRight,
   'Real original painting must fill right stone/plaster jamb');
  assert.notDeepEqual(paintedThreshold,emptyThreshold,
   'Original threshold must have painted stone beneath the round aperture');
  assert.deepEqual(openCentre,emptyCentre,
   'The centre of the circular opening must show real underlying ground');
  assert.deepEqual(outside,emptyOutside,
   'Moon gate sprite must not smear onto distant ground');
  await page.locator('#moonGateInspection').screenshot({path:'artifacts/v3/moon-gate-without-arch-closeup.png'});
  await page.locator('#showMoonGate').check();
  await page.locator('#zoom').click();
  await page.locator('#moonGateInspection').screenshot({path:'artifacts/v3/moon-gate-painted-closeup-3x.png'});
  await page.screenshot({path:'artifacts/v3/moon-gate-painted-courtyard-3x.png',fullPage:true});
  await page.locator('#study').selectOption('canal');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.locator('#study').selectOption('garden');
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile '+e.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#moonGateStatus')?.textContent.includes(
   'Original Moon Gate 01 verified (1448×721'),{timeout:35000});
  await mobile.screenshot({path:'artifacts/v3/moon-gate-painted-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('V3 painted Moon Gate 01 verified: original artwork, full jambs, transparent circular aperture, threshold, 1x/3x and mobile.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1});
