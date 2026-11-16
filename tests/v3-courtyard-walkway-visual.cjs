'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const URL='http://127.0.0.1:8765/wall-geometry-lab-v3.html';
function sample(page,x,y){return page.evaluate(([x,y])=>{
 const c=document.getElementById('scene').getContext('2d');
 return Array.from(c.getImageData(Math.round(x*3),Math.round(y*3),1,1).data);
},[x,y]);}
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:920},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#walkwayStatus')?.textContent.includes(
   'verified (480×800; exact SHA-256)'),{timeout:40000});
  await page.waitForFunction(()=>document.querySelector('#pavingStatus')?.textContent.includes(
   'verified (1254×1254'),{timeout:40000});
  await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes(
   'verified'),{timeout:40000});
  assert(await page.locator('#showWalkway').isChecked());
  const info=JSON.parse(await page.locator('#export').textContent());
  assert(info.courtyardWalkway.painted&&info.courtyardWalkway.imageVerified);
  assert.equal(info.courtyardWalkway.route.width,12);
  assert.equal(info.courtyardWalkway.route.height,45.5);
  assert.equal(info.audit.passableOpenings[0].open,true);
  const pathPixel=await sample(page,110,150);
  const outsidePixel=await sample(page,64,159);
  const gatePixel=await sample(page,110,191);
  await page.locator('#walkwayInspection').screenshot({path:'artifacts/v3/walkway-texture-original-and-repeat.png'});
  await page.screenshot({path:'artifacts/v3/walkway-real-tile-1x.png',fullPage:true});
  await page.locator('#showWalkway').uncheck();
  assert.equal(JSON.parse(await page.locator('#export').textContent()).courtyardWalkway.painted,false);
  assert.notDeepEqual(pathPixel,await sample(page,110,150),
   'Real image-backed walkway must change the pixels on the path');
  assert.deepEqual(outsidePixel,await sample(page,64,159),
   'Path must never repaint unrelated courtyard paving');
  assert.deepEqual(gatePixel,await sample(page,110,191),
   'Stone threshold and real gate aperture must remain untouched');
  await page.locator('#showWalkway').check();
  await page.locator('#plan').selectOption('partial');
  const partial=JSON.parse(await page.locator('#export').textContent());
  assert.equal(partial.courtyardWalkway.route.direction,'south-from-north-gate');
  const northPixel=await sample(page,110,70);
  await page.locator('#showWalkway').uncheck();
  assert.notDeepEqual(northPixel,await sample(page,110,70),
   'Same independent texture should appear beneath northern garden gate');
  await page.locator('#showWalkway').check();
  await page.locator('#plan').selectOption('tee');
  assert.equal(JSON.parse(await page.locator('#export').textContent()).courtyardWalkway.route,null);
  await page.locator('#plan').selectOption('rectangle');
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(e=>e.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/walkway-real-tile-3x.png',fullPage:true});
  await page.locator('#study').selectOption('canal');
  // The top row is intentionally land; choose a lower ROW canal tile for the rejection check.
  await page.locator('#scene').click({position:{x:110,y:330}});
  await page.locator('#plan').selectOption('rectangle');
  const all=JSON.parse(await page.locator('#export').textContent());
  assert.equal(all.audit.valid,false);
  assert.equal(all.courtyardWalkway.painted,false);
  await page.screenshot({path:'artifacts/v3/walkway-invalid-canal-tile.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#walkwayStatus')?.textContent.includes(
   'verified (480×800; exact SHA-256)'),{timeout:40000});
  await mobile.screenshot({path:'artifacts/v3/walkway-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No runtime errors desktop/mobile');
  console.log('V3 authentic derived SVG path works as independent material on rectangles/north gardens; no changes to gates/other ground, 1x/3x/mobile.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1});
