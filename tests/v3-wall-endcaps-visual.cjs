'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const URL='http://127.0.0.1:8765/wall-geometry-lab-v3.html?rev=42';
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1450,height:975},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes('verified'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes('2/2 authentic'),{timeout:30000});
  assert.match(await page.locator('h1').textContent(),/rev 42/);
  await page.locator('#showHall').uncheck();
  await page.locator('#showGate').uncheck();
  const points={
   background:[200,200],
   SWplaster:[42.7,186],SEplaster:[177.3,186],
   SWstone:[42.7,191],SEstone:[177.3,191],
   leftGatePlaster:[94,186],rightGatePlaster:[126,186],
   leftGateStone:[94,191],rightGateStone:[126,191],
   moonGate:[110,186],moonGateBase:[110,191],
   outsideLeft:[40.4,186],outsideRight:[179.6,186],
   northCornerRoof:[43,54],northVisible:[48,54],
   roofSW:[42,178],roofSE:[178,178]
  };
  const at=async(list)=>page.evaluate(list=>{
   const c=document.querySelector('#scene').getContext('2d',{willReadFrequently:true});
   return list.map(([x,y])=>Array.from(c.getImageData(Math.round(x*3),Math.round(y*3),1,1).data));
  },list);
  const scan=await at(Object.values(points)),keys=Object.keys(points);
  const values=Object.fromEntries(keys.map((k,i)=>[k,scan[i]]));
  for(const name of ['SWplaster','SEplaster','SWstone','SEstone',
   'leftGatePlaster','rightGatePlaster','leftGateStone','rightGateStone',
   'northCornerRoof','northVisible','roofSW','roofSE'])
   assert.notDeepEqual(values[name],values.background,
    'Missing painted wall material at '+name);
  for(const name of ['moonGate','moonGateBase','outsideLeft','outsideRight'])
   assert.deepEqual(values[name],values.background,
    'No fake plaster outside the wall or across the gate: '+name);
  const exportData=JSON.parse(await page.locator('#export').textContent());
  assert.equal(exportData.audit.valid,true);
  assert.equal(exportData.audit.passableOpenings[0].open,true);
  await page.screenshot({path:'artifacts/v3/wall-bottom-endcaps-rev42-1x.png',fullPage:true});
  await page.locator('#showPlasterTexture').uncheck();
  const withoutPlaster=await at([points.SWplaster,points.SEplaster,points.roofSW,points.roofSE]);
  for(let i=0;i<2;i++)assert.notDeepEqual(withoutPlaster[i],values[i===0?'SWplaster':'SEplaster'],
   'Each outer end must contain the authentic ivory watercolour, not only diagnostic fill');
  assert.deepEqual(withoutPlaster[2],values.roofSW);
  assert.deepEqual(withoutPlaster[3],values.roofSE);
  await page.locator('#showPlasterTexture').check();
  await page.locator('#showStoneTexture').uncheck();
  const withoutStone=await at([points.SWstone,points.SEstone,points.roofSW,points.roofSE]);
  for(let i=0;i<2;i++)assert.notDeepEqual(withoutStone[i],values[i===0?'SWstone':'SEstone'],
   'Both bottom foundation ends must use original stone texture, not flat colour');
  assert.deepEqual(withoutStone[2],values.roofSW);
  assert.deepEqual(withoutStone[3],values.roofSE);
  await page.locator('#showStoneTexture').check();
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(c=>c.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/wall-bottom-endcaps-rev42-3x.png',fullPage:true});
  await page.locator('#zoom').click();
  await page.locator('#study').selectOption('canal');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.locator('#study').selectOption('street');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes('2/2 authentic'),{timeout:30000});
  await mobile.screenshot({path:'artifacts/v3/wall-bottom-endcaps-rev42-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('V3 rev42 bottom-wall browser QA passed: genuine ivory/stone in outer SW+SE and gate end-caps at 1x/3x, roof unaffected, north trim intact, open gate and mobile.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
