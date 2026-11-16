'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const url='http://127.0.0.1:8765/layer2-integrated-v3.html';
async function paintSum(page,x,y,w,h){
 return page.evaluate(([x,y,w,h])=>{
  const data=document.querySelector('#scene').getContext('2d').getImageData(x*3,y*3,w*3,h*3).data;
  let s=0;for(let i=0;i<data.length;i+=4)s=(s+data[i]*3+data[i+1]*5+data[i+2]*7)>>>0;
  return s;
 },[x,y,w,h]);
}
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#layer2Status')?.textContent.includes(
    'original paintings verified: 5/5'),null,{timeout:40000});
  await page.waitForFunction(()=>document.querySelector('#moonGateStatus')?.textContent.includes('Original Moon Gate 01 verified'),
   null,{timeout:40000});
  await page.waitForFunction(()=>document.querySelector('#pavingStatus')?.textContent.includes('verified (1254×1254'),
   null,{timeout:40000});
  await page.waitForFunction(()=>document.querySelector('#walkwayStatus')?.textContent.includes('verified (480×800'),
   null,{timeout:40000});
  await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes('verified'),
   null,{timeout:40000});
  const doc=JSON.parse(await page.locator('#export').textContent());
  assert.equal(doc.tile.wallModel,'wide');
  assert(doc.audit.valid);
  assert(doc.composition.accepted);
  assert.deepEqual(doc.composition.placements.map(p=>p.id),['courtyard-hall-01','courtyard-wing-01']);
  assert.equal(doc.composition.verifiedAssets.length,5);
  assert(doc.audit.passableOpenings[0].open);
  assert.equal(doc.courtyardWalkway.route.width,12);
  assert.equal(doc.moonGateGround.source,'walkway-01');
  assert.equal(doc.moonGateFrame.imageVerified,true);
  assert.equal(doc.composition.layer1TopologyUnchanged,true);
  const wingWith=await paintSum(page,38,65,28,83);
  await page.locator('#showNewAssets').uncheck();
  assert.notEqual(wingWith,await paintSum(page,38,65,28,83),
   'Wing must draw a real transparent painted sprite');
  await page.locator('#showNewAssets').check();
  assert.equal(wingWith,await paintSum(page,38,65,28,83),'Layer 2 toggle must restore exact sprite image');
  await page.screenshot({path:'artifacts/v3/layer2-integrated-six-tile-1x.png',fullPage:true});
  // Select adjacent all-land garden without modifying any tile signature.
  await page.locator('#scene').click({position:{x:330,y:110}});
  let chosen=JSON.parse(await page.locator('#export').textContent());
  assert.equal(chosen.tile.wallModel,'pavilion');
  assert.deepEqual(chosen.composition.placements.map(p=>p.id),['garden-pavilion-01','bamboo-grove-01']);
  await page.locator('#scene').click({position:{x:550,y:110}});
  chosen=JSON.parse(await page.locator('#export').textContent());
  assert.equal(chosen.tile.wallModel,'rockery');
  assert(chosen.composition.placements.some(p=>p.id==='garden-rockery-02'));
  await page.locator('#scene').click({position:{x:110,y:330}});
  chosen=JSON.parse(await page.locator('#export').textContent());
  assert.equal(chosen.tile.wallModel,'landing');
  assert.deepEqual(chosen.tile.edges,['L','W','L','W']);
  assert.equal(chosen.composition.placements[0].id,'waterside-landing-01');
  const waterWith=await paintSum(page,74,251,72,50);
  await page.locator('#showLanding').uncheck();
  assert.notEqual(waterWith,await paintSum(page,74,251,72,50),
   'Landing must be independently removable, leaving existing genuine water beneath');
  await page.locator('#showLanding').check();
  assert.equal(waterWith,await paintSum(page,74,251,72,50));
  await page.screenshot({path:'artifacts/v3/layer2-landing-north-bank-1x.png',fullPage:true});
  // Attempt an invalid layout: no invented landing allowed on open land.
  await page.locator('#study').selectOption('garden');
  chosen=JSON.parse(await page.locator('#export').textContent());
  assert.equal(chosen.tile.wallModel,'wide');
  await page.locator('#scene').click({position:{x:110,y:330}});
  chosen=JSON.parse(await page.locator('#export').textContent());
  assert.equal(chosen.composition.placements.length,0);
  await page.locator('#study').selectOption('mixed');
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(e=>e.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/layer2-integrated-six-tile-3x.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(url,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#layer2Status')?.textContent.includes('verified: 5/5'),
   null,{timeout:40000});
  await mobile.screenshot({path:'artifacts/v3/layer2-integrated-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'Desktop and mobile integration must be free from page JavaScript errors');
  console.log('V3 rev49 integrated browser QA: SHA-verified five original paintings, wide hall+wing, pavilion/bamboo/rockery, strict shore landing, existing moon gate/path, toggles, 1×/3× and mobile.');
 }finally{await browser.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
