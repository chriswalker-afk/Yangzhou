'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1450,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto('http://127.0.0.1:8765/courtyard-enclosure-lab-v3.html',{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('#assetStatus')?.textContent.includes('V3 continuous grass'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#enclosureStatus')?.textContent.includes('/4 verified'),{timeout:30000});
  const initialArtworkStatus=await page.locator('#enclosureStatus').textContent();
  assert.match(await page.locator('h1').textContent(),/rev 30/);
  const data=JSON.parse(await page.locator('#layoutData').textContent());
  assert.equal(data.tileSize,220);
  assert.equal(data.courtyardReview.tileIndex,0);
  assert(data.courtyardReview.validation.valid);
  assert.equal(data.courtyardReview.layout.pieces.length,6);
  assert(data.courtyardReview.layout.seams.every(s=>s.gap===0));
  assert.equal(data.courtyardReview.canBuildCompleteEnclosure,false);
  await page.screenshot({path:'artifacts/v3/enclosure-assembly-garden.png',fullPage:true});
  await page.locator('#showGuides').click();
  assert.equal(await page.locator('#showGuides').getAttribute('aria-pressed'),'false');
  await page.locator('#showGuides').click();
  assert.equal(await page.locator('#showGuides').getAttribute('aria-pressed'),'true');
  await page.locator('#study').selectOption('junction');
  const junction=JSON.parse(await page.locator('#layoutData').textContent());
  assert.equal(junction.courtyardReview.tileIndex,3);
  assert(junction.courtyardReview.validation.valid);
  await page.screenshot({path:'artifacts/v3/enclosure-assembly-canal-junction.png',fullPage:true});
  await page.locator('#study').selectOption('joined');
  const joined=JSON.parse(await page.locator('#layoutData').textContent());
  assert.equal(joined.courtyardReview.tileIndex,null,'Do not force walls over joined street/canal tiles');
  await page.locator('#placeHere').click();
  assert.match(await page.locator('#enclosureStatus').textContent(),/Cannot build courtyard/);
  await page.locator('#study').selectOption('garden');
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(el=>el.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/enclosure-assembly-garden-3x.png',fullPage:true});
  const count=await page.evaluate(()=>window.YangzhouV3Enclosures.IDS.length);
  assert.equal(count,4);
  const missing=fs.readdirSync('assets/v3/enclosures').filter(f=>f.endsWith('.webp'));
  const status=initialArtworkStatus; // Later rejection messages should not erase the original artwork availability result.
  if(missing.length===0)assert.match(status,/0\/4 verified/,'No fake artwork should load when files absent');
  else assert.match(status,/4\/4 verified/,'All committed artwork must be automatically verified and loaded');
  const mobile=await browser.newPage({viewport:{width:390,height:800},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto('http://127.0.0.1:8765/courtyard-enclosure-lab-v3.html',{waitUntil:'load'});
  await mobile.waitForFunction(()=>document.querySelector('#assetStatus')?.textContent.includes('V3 continuous grass'),{timeout:30000});
  await mobile.screenshot({path:'artifacts/v3/enclosure-assembly-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No runtime JavaScript exceptions on desktop/mobile');
  console.log('V3 enclosure art lab browser QA passed: 6-tile study, exact seams, canal route safeguards, 3x, mobile, honest artwork status.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});