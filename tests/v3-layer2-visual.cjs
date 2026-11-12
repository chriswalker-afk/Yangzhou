'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
fs.mkdirSync('artifacts/v3',{recursive:true});
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto('http://127.0.0.1:8765/layer2-lab-v3.html',{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('#assetStatus')?.textContent.includes('Layer 2 Courtyard Hall 01, Willow Tree 01 and Garden Rockery 01 loaded automatically'),{timeout:30000});
  assert.match(await page.locator('h1').textContent(),/rev 29/);
  assert.match(await page.locator('#tileInfo').textContent(),/Selected tile 0,0/);
  const measure=()=>page.evaluate(()=>{
    const ctx=document.querySelector('#scene').getContext('2d');
    const sum=(x,y,w,h)=>{
      const p=ctx.getImageData(x*3,y*3,w*3,h*3).data;
      let r=0,g=0,b=0;
      for(let i=0;i<p.length;i+=4){r+=p[i];g+=p[i+1];b+=p[i+2];}
      return [r,g,b];
    };
    return {
      building:sum(40,10,140,56),
      stone:sum(40,101,140,18),
      canal:sum(40,302,140,55),
      untouched:sum(265,18,100,55)
    };
  });
  const withArt=await measure();
  await page.screenshot({path:'artifacts/v3/layer2-six-tile-three-assets.png',fullPage:true});
  await page.locator('#showDetails').click();
  assert.equal(await page.locator('#showDetails').getAttribute('aria-pressed'),'false');
  const withoutArt=await measure();
  assert.notDeepEqual(withArt.building,withoutArt.building,'Authentic courtyard, willow and rockery must affect tile appearance');
  const compiledPorts=await page.evaluate(()=>window.YangzhouV3Geometry.compile(['L','S','L','S']).exits.map(x=>x.width));
  assert.deepEqual(compiledPorts,[0,44,0,44],'Layer 2 must not modify exact 44-unit street ports');
  const waterPorts=await page.evaluate(()=>window.YangzhouV3Geometry.compile(['L','W','L','W']).exits.map(x=>x.width));
  assert.deepEqual(waterPorts,[0,88,0,88],'Layer 2 must not modify exact 88-unit canal ports');
  await page.screenshot({path:'artifacts/v3/layer2-six-tile-no-large-details.png',fullPage:true});
  await page.locator('#showDetails').click();
  assert.deepEqual((await measure()).building,withArt.building,'Layer 2 visibility must be deterministic');

  const saved=JSON.parse(await page.locator('#layoutData').textContent());
  assert.equal(saved.tileSize,220);
  assert.equal(saved.tiles.length,6);
  assert.equal(saved.tiles[0].seed,1);
  assert(saved.tiles[0].layer2.length>=1,'First tile owns its hall');
  assert(saved.tiles[1].layer2.some(p=>p.id==='willow-tree-01'), 'Seed 2 must show a willow');
  assert(saved.tiles[1].layer2.some(p=>p.id==='garden-rockery-01'), 'Seed 2 must show a rockery');
  await page.locator('#nextSeed').click();
  assert.match(await page.locator('#tileInfo').textContent(),/seed 2/);
  assert(!JSON.parse(await page.locator('#layoutData').textContent()).tiles[0].layer2.some(p=>p.id==='courtyard-hall-01'),'Seed 2 must remove the initial hall');
  await page.locator('#prevSeed').click();
  assert.deepEqual((await measure()).building,withArt.building,'Original seed restores identical local art');

  for(const layout of ['junction','garden','joined']){
    await page.locator('#study').selectOption(layout);
    const tileData=JSON.parse(await page.locator('#layoutData').textContent());
    assert.equal(tileData.tiles.length,6);
    if(layout!=='joined')await page.screenshot({path:'artifacts/v3/layer2-'+layout+'.png',fullPage:true});
  }
  // Toggling each authentic painting independently must change garden imagery.
  await page.locator('#study').selectOption('garden');
  const fullImageSum=()=>page.evaluate(()=>{
    const pixels=document.querySelector('#scene').getContext('2d').getImageData(0,0,1980,1320).data;
    let sum=0;for(let i=0;i<pixels.length;i+=4)sum=(sum+3*pixels[i]+5*pixels[i+1]+7*pixels[i+2])>>>0;
    return sum;
  });
  const beforeSingles=await fullImageSum();
  await page.locator('#showWillow').uncheck();
  assert.notEqual(await fullImageSum(),beforeSingles,'Willow toggles must visibly remove real artwork');
  await page.locator('#showWillow').check();
  assert.equal(await fullImageSum(),beforeSingles,'Re-enabling willow must restore original image');
  await page.locator('#showRockery').uncheck();
  assert.notEqual(await fullImageSum(),beforeSingles,'Rockery toggles must visibly remove real artwork');
  await page.locator('#showRockery').check();
  assert.equal(await fullImageSum(),beforeSingles,'Re-enabling rockery must restore original image');
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(e=>e.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/layer2-three-assets-3x.png',fullPage:true});
  await page.locator('#showGrid').click();
  assert.equal(await page.locator('#showGrid').getAttribute('aria-pressed'),'false');
  await page.locator('#showGrid').click();

  const mobile=await browser.newPage({viewport:{width:390,height:800},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto('http://127.0.0.1:8765/layer2-lab-v3.html',{waitUntil:'load'});
  await mobile.waitForFunction(()=>document.querySelector('#assetStatus')?.textContent.includes('Layer 2 Courtyard Hall 01, Willow Tree 01 and Garden Rockery 01 loaded automatically'),{timeout:30000});
  await mobile.screenshot({path:'artifacts/v3/layer2-three-assets-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'V3 Layer 2 laboratory must have no desktop/mobile JavaScript errors');
  console.log('V3 Layer2 real browser QA passed: authentic hall/willow/rockery, tile-local seeds, immutable route ports, visual toggles, 3x zoom and mobile.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});