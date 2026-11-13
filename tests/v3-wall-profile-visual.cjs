'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const URL='http://127.0.0.1:8765/wall-geometry-lab-v3.html';
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1450,height:960},deviceScaleFactor:1});
  page.on('pageerror',err=>errors.push('desktop: '+err.message));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#summary')?.textContent.includes('Protected V3 ports'),{timeout:9000});
  await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes('verified'),{timeout:30000});
  assert.match(await page.locator('h1').textContent(),/rev 40/);
  assert(await page.locator('#showPerspective').isChecked());
  assert(await page.locator('#showRoofTexture').isChecked());
  assert.match(await page.locator('#summary').textContent(),/camera-facing ivory plaster/);
  await page.locator('#showHall').uncheck();
  await page.locator('#showGate').uncheck();
  const pixels=await page.evaluate(()=>{
   const c=document.querySelector('#scene'),ctx=c.getContext('2d');
   const at=(x,y)=>Array.from(ctx.getImageData(Math.round(x*3),Math.round(y*3),1,1).data);
   return {
    ground:at(200,200),
    northTopHidden:at(85,40),northVisibleFace:at(85,55),
    southTopHidden:at(70,170),southVisibleFace:at(70,188),
    westHidden:at(34,90),westVisibleFace:at(50,90),
    eastHidden:at(170,90),eastVisibleFace:at(186,90),
    cornerSE:at(185,185),gate:at(110,178),
    gateBelow:at(110,190),roof:at(85,47)
   };
  });
  for(const key of ['northTopHidden','southTopHidden','westHidden','eastHidden','gate','gateBelow']){
   assert.deepEqual(pixels[key],pixels.ground,'No hidden-side plaster or roof in '+key);
  }
  for(const key of ['northVisibleFace','southVisibleFace','westVisibleFace','eastVisibleFace','cornerSE','roof']){
   assert.notDeepEqual(pixels[key],pixels.ground,'Painted perspective wall must be visible at '+key);
  }
  assert.notDeepEqual(pixels.northVisibleFace,pixels.southVisibleFace,
   'Perspective depth/lighting should differ at top and bottom walls');
  const profile=JSON.parse(await page.locator('#export').textContent()).perspectiveWallProfile;
  assert.deepEqual(profile.cameraFacing,['south','east']);
  assert.equal(profile.plasterAboveCoping,false);
  assert.equal(profile.sideRoofRotationDegrees,-90);
  assert.equal(profile.faceDepth.north,6);
  assert.equal(profile.faceDepth.south,10);
  await page.screenshot({path:'artifacts/v3/wall-perspective-profile-1x.png',fullPage:true});
  await page.locator('#zoom').click();
  await page.screenshot({path:'artifacts/v3/wall-perspective-profile-3x.png',fullPage:true});
  await page.locator('#zoom').click();
  // A/B compare against the old symmetric bands: this sample is bare grass
  // in new mode, but was mistakenly plaster/foundation in old mode.
  await page.locator('#showPerspective').uncheck();
  assert.match(await page.locator('#summary').textContent(),/old symmetric diagnostic bands/);
  const oldHidden=await page.evaluate(()=>{
   const ctx=document.querySelector('#scene').getContext('2d');
   return Array.from(ctx.getImageData(85*3,40*3,1,1).data);
  });
  assert.notDeepEqual(oldHidden,pixels.northTopHidden,'Comparison toggle must switch geometry renderers');
  await page.screenshot({path:'artifacts/v3/wall-perspective-old-symmetric-comparison.png',fullPage:true});
  await page.locator('#showPerspective').check();
  await page.locator('#plan').selectOption('tee');
  const tee=JSON.parse(await page.locator('#export').textContent());
  assert.equal(tee.compiled.junctions.filter(j=>j.kind==='T').length,1);
  assert(tee.audit.valid,'Profile must not break a land-safe T-junction');
  await page.screenshot({path:'artifacts/v3/wall-perspective-t-junction.png',fullPage:true});
  await page.locator('#plan').selectOption('rectangle');
  await page.locator('#study').selectOption('canal');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.screenshot({path:'artifacts/v3/wall-perspective-canal-safety.png',fullPage:true});
  await page.locator('#study').selectOption('street');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.locator('#study').selectOption('garden');
  await page.locator('#showTextures').check();
  await page.locator('#showHall').check();
  await page.locator('#showGate').check();
  await page.screenshot({path:'artifacts/v3/wall-perspective-hall-and-geography.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',err=>errors.push('mobile: '+err.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#summary')?.textContent.includes('Protected V3 ports'),{timeout:9000});
  assert(await mobile.locator('#showPerspective').isChecked());
  await mobile.screenshot({path:'artifacts/v3/wall-perspective-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No browser JS errors desktop/mobile');
  console.log('V3 perspective browser QA passed: near/far plaster faces, clean hidden side, canonical roof rotation, true gate hole, SE corner, T join, street/canal, 1x/3x and mobile.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
