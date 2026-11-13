'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const URL='http://127.0.0.1:8765/wall-geometry-lab-v3.html?rev=44';
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1450,height:970},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  // Keep legacy wall-material pixel baselines on the original grass surface.
  await page.locator('#showPaving').uncheck();
  await page.waitForFunction(()=>document.querySelector('#summary')?.textContent.includes('Protected V3 ports'),{timeout:9000});
  await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes('verified'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes('2/2 authentic'),{timeout:30000});
  assert.match(await page.locator('h1').textContent(),/rev 44/);
  assert(await page.locator('#showPerspective').isChecked());
  assert(await page.locator('#showRoofTexture').isChecked());
  assert.match(await page.locator('#summary').textContent(),/south-facing ivory plaster/);
  await page.locator('#showHall').uncheck();
  await page.locator('#showGate').uncheck();
  const colours=await page.evaluate(()=>{
   const ctx=document.querySelector('#scene').getContext('2d',{willReadFrequently:true});
   const at=(x,y)=>Array.from(ctx.getImageData(Math.round(x*3),Math.round(y*3),1,1).data);
   return {
    ground:at(200,200),northHidden:at(85,40),southHidden:at(70,170),
    westHidden:at(34,90),eastHidden:at(170,90),
    westWhiteSlab:at(50,90),eastWhiteSlab:at(189,90),
    outsideNE:at(189,55),outsideSE:at(189,185),
    northPlaster:at(85,54),southPlaster:at(85,186),
    southStone:at(85,191),eastEave:at(183,90),
    roof:at(85,47),gate:at(110,178),gateBelow:at(110,190)
   };
  });
  for(const key of ['northHidden','southHidden','westHidden','eastHidden',
   'westWhiteSlab','eastWhiteSlab','outsideNE','outsideSE','gate','gateBelow']){
   assert.deepEqual(colours[key],colours.ground,
    'No oversized plaster/stone or closed moon gate at '+key);
  }
  for(const key of ['northPlaster','southPlaster','southStone','eastEave','roof'])
   assert.notDeepEqual(colours[key],colours.ground,
    'Missing south-facing elevation or thin side eave at '+key);
  assert.notDeepEqual(colours.northPlaster,colours.southPlaster,
   'Six-unit north and ten-unit south elevations retain different visual depths');
  const p=JSON.parse(await page.locator('#export').textContent()).perspectiveWallProfile;
  assert.deepEqual(p.cameraFacing,['south']);
  assert.deepEqual(p.faceDepth,{north:6,south:10,west:0,east:0});
  assert.equal(p.sideRoofRotationDegrees,-90);
  assert.match(p.verticalWalls,/narrow shaded eave/i);
  assert.match(p.cornerMethod,/shared roof vertices/i);
  assert.equal(p.plasterAboveCoping,false);
  await page.screenshot({path:'artifacts/v3/wall-camera-south-1x.png',fullPage:true});
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(c=>c.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/wall-camera-south-3x.png',fullPage:true});
  await page.locator('#zoom').click();
  await page.locator('#showPerspective').uncheck();
  const old=await page.evaluate(()=>{
   const ctx=document.querySelector('#scene').getContext('2d',{willReadFrequently:true});
   return Array.from(ctx.getImageData(185*3,90*3,1,1).data);
  });
  assert.notDeepEqual(old,colours.ground,
   'Old symmetric comparison must visibly expose its former east-side plaster');
  await page.screenshot({path:'artifacts/v3/wall-camera-old-symmetric-comparison.png',fullPage:true});
  await page.locator('#showPerspective').check();
  await page.locator('#plan').selectOption('tee');
  const tee=JSON.parse(await page.locator('#export').textContent());
  assert.equal(tee.compiled.junctions.filter(j=>j.kind==='T').length,1);
  assert(tee.audit.valid);
  await page.screenshot({path:'artifacts/v3/wall-camera-tee.png',fullPage:true});
  await page.locator('#study').selectOption('canal');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.locator('#study').selectOption('street');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.locator('#study').selectOption('garden');
  await page.locator('#showTextures').check();
  await page.locator('#showHall').check();
  await page.locator('#showGate').check();
  await page.screenshot({path:'artifacts/v3/wall-camera-with-courtyard-hall.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#summary')?.textContent.includes('Protected V3 ports'),{timeout:9000});
  assert(await mobile.locator('#showPerspective').isChecked());
  for(const key of ['NW','NE','SW','SE'])
   assert(await mobile.locator('#corner'+key).isVisible());
  await mobile.screenshot({path:'artifacts/v3/wall-camera-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('V3 one-camera visual QA passed: no side plaster slabs, south-facing 6/10-unit elevations, thin vertical eaves, open gate, 1x/3x, routes and mobile.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
