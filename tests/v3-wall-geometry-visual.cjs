'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const PORT='http://127.0.0.1:8765/wall-geometry-lab-v3.html';
function colourAt(page,x,y){
 return page.evaluate(({x,y})=>{
  const c=document.querySelector('#scene'),ctx=c.getContext('2d');
  return Array.from(ctx.getImageData(Math.round(x*3),Math.round(y*3),1,1).data);
 },{x,y});
}
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1400,height:930},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop '+e.message));
  await page.goto(PORT,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#summary')?.textContent.includes('Protected V3 ports'),{timeout:9000});
  assert.match(await page.locator('h1').textContent(),/rev 41/);
  assert.equal(await page.locator('#scene').evaluate(el=>el.style.width),'660px');
  assert.match(await page.locator('#summary').textContent(),/6 valid walled tiles/);
  let selection=JSON.parse(await page.locator('#export').textContent());
  assert.equal(selection.compiled.junctions.filter(j=>j.kind==='L').length,4);
  assert.equal(selection.compiled.gates.length,1);
  assert.equal(selection.compiled.gates[0].width,30);
  assert.equal(selection.audit.passableOpenings[0].open,true);
  // Turn off merely decorative gate threshold marks. What remains at the gate
  // centre is genuine underlying grass, not a painted imitation of an aperture.
  await page.locator('#showGate').uncheck();
  await page.locator('#showHall').uncheck();
  const gatePixel=await colourAt(page,110,178);
  const grassPixel=await colourAt(page,110,148);
  const wallPixel=await colourAt(page,110,47);
  assert.deepEqual(gatePixel,grassPixel,
   'Moon gate must really cut through the foundation, plaster and coping');
  assert.notDeepEqual(wallPixel,grassPixel,
   'Uncut north wall must still cover the grass');
  await page.locator('#showHall').check();
  await page.locator('#showGate').check();
  await page.screenshot({path:'artifacts/v3/wall-geometry-garden.png',fullPage:true});
  // T junction is an actual shared endpoint at the same world coordinate.
  const teePixel=await colourAt(page,2*220+110,48);
  const teeGround=await colourAt(page,2*220+185,100);
  assert.notDeepEqual(teePixel,teeGround,'T junction should have solid, seamless material coverage');
  // Select the partial enclosure, then test the L/T and rectangle presets.
  await page.locator('#scene').click({position:{x:330,y:112}});
  selection=JSON.parse(await page.locator('#export').textContent());
  assert.equal(selection.tile.wallModel,'partial');
  assert.equal(selection.compiled.gates[0].width,30);
  await page.locator('#plan').selectOption('tee');
  selection=JSON.parse(await page.locator('#export').textContent());
  assert.equal(selection.tile.wallModel,'tee');
  assert.equal(selection.compiled.junctions.filter(j=>j.kind==='T').length,1);
  await page.locator('#plan').selectOption('partial');
  // Connected canal tile: block walls rather than altering the existing water.
  await page.locator('#study').selectOption('canal');
  assert.match(await page.locator('#summary').textContent(),/3 deliberately rejected/);
  const waterBefore=await colourAt(page,110,220+110);
  await page.locator('#showWall').uncheck();
  const waterAfter=await colourAt(page,110,220+110);
  assert.deepEqual(waterBefore,waterAfter,
   'Toggling Layer 2 wall visibility must not change exact Layer 1 canal water');
  await page.locator('#showWall').check();
  await page.screenshot({path:'artifacts/v3/wall-geometry-canal.png',fullPage:true});
  await page.locator('#study').selectOption('street');
  assert.match(await page.locator('#summary').textContent(),/3 deliberately rejected/);
  const portWidths=await page.evaluate(()=>{
   const c=window.YangzhouV3Geometry;
   return [c.compile(['L','S','L','S']).exits.map(e=>e.width),
           c.compile(['L','W','L','W']).exits.map(e=>e.width)];
  });
  assert.deepEqual(portWidths,[[0,44,0,44],[0,88,0,88]]);
  await page.locator('#study').selectOption('junction');
  assert.match(await page.locator('#summary').textContent(),/rejected/);
  await page.screenshot({path:'artifacts/v3/wall-geometry-junction.png',fullPage:true});
  await page.locator('#study').selectOption('garden');
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(el=>el.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/wall-geometry-garden-3x.png',fullPage:true});
  await page.locator('#zoom').click();
  await page.waitForFunction(()=>document.querySelector('#readyStatus')?.textContent.includes('4/4 checked'),{timeout:45000});
  await page.locator('#showTextures').check();
  await page.screenshot({path:'artifacts/v3/wall-geometry-existing-layer1-textures.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile '+e.message));
  await mobile.goto(PORT,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#summary')?.textContent.includes('Protected V3 ports'),{timeout:9000});
  await mobile.screenshot({path:'artifacts/v3/wall-geometry-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No JS runtime exceptions on desktop or mobile');
  console.log('V3 continuous wall browser QA passed: 6 tiles, true empty gate, exact L/T, masked streets/canals, zoom, 1x/3x, optional textures and mobile.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
