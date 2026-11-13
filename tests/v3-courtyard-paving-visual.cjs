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
  const page=await browser.newPage({viewport:{width:1450,height:1000},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#pavingStatus')?.textContent.includes('verified (1254×1254'),{timeout:25000});
  await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes('verified'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes('2/2 authentic'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#readyStatus')?.textContent.includes('4/4 loaded'),{timeout:30000});
  assert.match(await page.locator('h1').textContent(),/rev 44/);
  assert(await page.locator('#showPaving').isChecked());
  assert.match(await page.locator('#pavingStatus').textContent(),/SHA-256 matches/);
  const samples=async(points)=>page.evaluate(points=>{
   const ctx=document.getElementById('scene').getContext('2d',{willReadFrequently:true});
   return points.map(([x,y])=>Array.from(ctx.getImageData(Math.round(x*3),Math.round(y*3),1,1).data));
  },points);
  await page.locator('#showGate').uncheck();
  await page.locator('#showJoints').uncheck();
  const pts={
   paving:[110,70],
   pavedOtherTile:[330,290],
   grassOutside:[20,120],
   grassBeyondWall:[195,120],
   gateExit:[110,185],
   hallRoof:[110,104],
   wallRoof:[85,47],
   leftInterior:[51,120],
   rightInterior:[169,120]
  };
  const initial=await samples(Object.values(pts));
  const values=Object.fromEntries(Object.keys(pts).map((key,i)=>[key,initial[i]]));
  assert.notDeepEqual(values.paving,values.grassOutside,
   'The original paving painting must visibly cover the courtyard interior');
  assert.notDeepEqual(values.pavedOtherTile,values.grassOutside,
   'A second valid enclosed courtyard should use the same painted material');
  const details=JSON.parse(await page.locator('#export').textContent());
  assert(details.audit.valid);
  assert(details.courtyardPaving.painted);
  assert(details.courtyardPaving.imageVerified);
  assert.deepEqual(details.courtyardPaving.region,
   {x:42,y:47,width:136,height:131,shape:'orthogonal-enclosure-interior',
    source:'rectangle-wall-centreline'});
  assert.equal(details.courtyardPaving.worldPeriod,96);
  await page.screenshot({path:'artifacts/v3/courtyard-layer1b-painted-1x.png',fullPage:true});
  // Preserve the legacy unadorned-gap pixel baseline. Moon Gate 01 has
  // its own painted-asset regression, including transparency and joins.
  await page.locator('#showMoonGate').uncheck();
  await page.locator('#showPaving').uncheck();
  const without=await samples(Object.values(pts));
  for(const name of ['paving','pavedOtherTile','leftInterior','rightInterior']){
   const index=Object.keys(pts).indexOf(name);
   assert.notDeepEqual(without[index],values[name],
    'Courtyard paving toggle must change the real painted ground at '+name);
  }
  for(const name of ['grassOutside','grassBeyondWall','gateExit']){
   const index=Object.keys(pts).indexOf(name);
   assert.deepEqual(without[index],values[name],
    'Paving must never alter grass outside or an open moon gate at '+name);
  }
  // The original hall and roof paintings include subtle transparent paint.
  // A new ground surface may contribute 1–2 RGB levels through their soft
  // pixels; require strong occlusion, not false byte-for-byte opacity.
  const groundDelta=values.paving.slice(0,3).reduce((n,v,i)=>
   n+Math.abs(v-without[Object.keys(pts).indexOf('paving')][i]),0);
  for(const name of ['hallRoof','wallRoof']){
   const index=Object.keys(pts).indexOf(name);
   const blendDelta=values[name].slice(0,3).reduce((n,v,i)=>
    n+Math.abs(v-without[index][i]),0);
   assert(blendDelta<groundDelta*.5+6,
    'Layer 2 '+name+' must visually occlude the new paving ('+
    blendDelta+' vs exposed ground delta '+groundDelta+')');
  }
  assert(!JSON.parse(await page.locator('#export').textContent()).courtyardPaving.painted);
  await page.screenshot({path:'artifacts/v3/courtyard-layer1b-grass-comparison.png',fullPage:true});
  await page.locator('#showPaving').check();
  assert(JSON.parse(await page.locator('#export').textContent()).courtyardPaving.painted);
  const proof=await page.evaluate(()=>{
   const c=document.getElementById('pavingRepeat'),p=c.getContext('2d');
   const at=(x,y)=>Array.from(p.getImageData(x,y,1,1).data);
   return {
    width:c.width,height:c.height,
    upperLeft:at(55,65),upperRight:at(235,65),
    lowerLeft:at(55,245),lowerRight:at(235,245),
    centreA:at(178,178),centreB:at(182,182)
   };
  });
  assert.equal(proof.width,360);assert.equal(proof.height,360);
  assert.deepEqual(proof.upperLeft,proof.upperRight,
   'Repeat proof must show byte-matching copies of one authentic image');
  assert.deepEqual(proof.upperLeft,proof.lowerLeft);
  assert.deepEqual(proof.upperLeft,proof.lowerRight);
  await page.locator('#pavingInspection').screenshot({path:'artifacts/v3/courtyard-paving-2x2-seam-review.png'});
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(c=>c.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/courtyard-layer1b-painted-3x.png',fullPage:true});
  await page.locator('#zoom').click();
  // Non-closed templates are never automatically paved.
  await page.locator('#plan').selectOption('partial');
  const open=JSON.parse(await page.locator('#export').textContent());
  assert.equal(open.courtyardPaving.region,null);
  assert.equal(open.courtyardPaving.painted,false);
  await page.locator('#plan').selectOption('rectangle');
  // A rejected canal crossing cannot receive any Layer 1B fill.
  await page.locator('#study').selectOption('canal');
  await page.locator('#scene').click({position:{x:110,y:330}});
  await page.locator('#plan').selectOption('rectangle');
  const blocked=JSON.parse(await page.locator('#export').textContent());
  assert.equal(blocked.audit.valid,false);
  assert.equal(blocked.courtyardPaving.painted,false);
  const beforeBlocked=(await samples([[110,330]]))[0];
  await page.locator('#showPaving').uncheck();
  const afterBlocked=(await samples([[110,330]]))[0];
  assert.deepEqual(beforeBlocked,afterBlocked,
   'Paving toggle cannot paint across an invalid canal tile');
  await page.locator('#showPaving').check();
  await page.screenshot({path:'artifacts/v3/courtyard-layer1b-canal-exclusion.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#pavingStatus')?.textContent.includes('verified (1254×1254'),{timeout:25000});
  assert(await mobile.locator('#showPaving').isChecked());
  await mobile.screenshot({path:'artifacts/v3/courtyard-layer1b-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No browser runtime exceptions desktop/mobile');
  console.log('V3 Layer 1B paving browser QA passed: original SHA-verified painting loads automatically, clipped under hall/walls, 2x2 repeated proof, toggle, 1x/3x, no gate/road/canal spill, mobile.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
