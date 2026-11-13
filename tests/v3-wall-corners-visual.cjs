'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const URL='http://127.0.0.1:8765/wall-geometry-lab-v3.html?rev=40';
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1470,height:1000},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes('2/2 authentic'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes('verified'),{timeout:30000});
  assert.match(await page.locator('h1').textContent(),/rev 40/);
  assert(await page.locator('#showPerspective').isChecked());
  assert(await page.locator('#showPlasterTexture').isChecked());
  assert(await page.locator('#showStoneTexture').isChecked());
  await page.locator('#showHall').uncheck();
  await page.locator('#showGate').uncheck();
  const get=async(locations)=>page.evaluate(locations=>{
   const canvas=document.getElementById('scene'),c=canvas.getContext('2d');
   return locations.map(([x,y])=>Array.from(c.getImageData(Math.round(3*x),Math.round(3*y),1,1).data));
  },locations);
  const pts={
   ground:[200,200],NE:[184,56],NW:[48,55],
   SW:[46,186],SE:[180,186],SEstoneBottom:[180,191],
   SEstoneEast:[189,185],roofSE:[178,178],
   gate:[110,178],gateFoot:[110,190],
   hiddenNorth:[85,40],hiddenWest:[34,90]
  };
  const samples=await get(Object.values(pts));
  const values=Object.fromEntries(Object.keys(pts).map((k,i)=>[k,samples[i]]));
  for(const key of ['NW','NE','SW','SE','SEstoneBottom','SEstoneEast','roofSE'])
   assert.notDeepEqual(values[key],values.ground,
    'Corner '+key+' exposed bare ground instead of roof, plaster or stone');
  for(const key of ['gate','gateFoot','hiddenNorth','hiddenWest'])
   assert.deepEqual(values[key],values.ground,
    'Perspective repair must not close the moon gate or paint on the hidden side at '+key);
  // These two gaps were unpainted in the previous corner implementation:
  // the small SE gap just outside the mitered roof and its east stone return.
  await page.locator('#showPlasterTexture').uncheck();
  const afterPlaster=(await get([pts.SE]))[0];
  assert.notDeepEqual(afterPlaster,values.SE,
   'Southeast missing-quadrant repair must really use the ORIGINAL plaster material');
  await page.locator('#showPlasterTexture').check();
  await page.locator('#showStoneTexture').uncheck();
  const afterStone=await get([pts.SEstoneEast,pts.SEstoneBottom,pts.roofSE]);
  assert.notDeepEqual(afterStone[0],values.SEstoneEast,
   'The stone base must wrap around the right-hand side of the SE corner');
  assert.notDeepEqual(afterStone[1],values.SEstoneBottom,
   'The lower stone course must continue underneath the SE corner');
  assert.deepEqual(afterStone[2],values.roofSE,
   'No change to roof painting or original miter join when stone is toggled');
  await page.locator('#showStoneTexture').check();
  const gallery=await page.evaluate(()=>{
   return ['NW','NE','SW','SE'].map(key=>{
    const canvas=document.getElementById('corner'+key);
    if(!canvas)return null;
    const c=canvas.getContext('2d');
    const data=c.getImageData(0,0,canvas.width,canvas.height).data;
    let varying=0,opaque=0;
    for(let i=0;i<data.length;i+=32){
     if(data[i]>0||data[i+1]>0||data[i+2]>0)varying++;
     if(data[i+3]>200)opaque++;
    }
    return {key,width:canvas.width,height:canvas.height,varying,opaque};
   });
  });
  for(const snapshot of gallery){
   assert(snapshot,'All four close-ups must be real source-canvas captures');
   assert.equal(snapshot.width,180);assert.equal(snapshot.height,180);
   assert(snapshot.varying>100&&snapshot.opaque>100,'Missing original canvas crop '+snapshot.key);
  }
  const exportData=JSON.parse(await page.locator('#export').textContent());
  assert(exportData.audit.valid,'The four continuous corners must remain valid on an all-land tile');
  assert.equal(exportData.compiled.junctions.filter(j=>j.kind==='L').length,4);
  assert(exportData.audit.passableOpenings[0].open,'Gate is real geometry, not a sprite');
  await page.screenshot({path:'artifacts/v3/wall-corners-4-way-closeup-1x.png',fullPage:true});
  await page.locator('#zoom').click();
  await page.screenshot({path:'artifacts/v3/wall-corners-4-way-closeup-3x.png',fullPage:true});
  await page.locator('#zoom').click();
  await page.locator('#plan').selectOption('partial');
  assert.equal(JSON.parse(await page.locator('#export').textContent()).audit.valid,true);
  await page.locator('#plan').selectOption('tee');
  assert.equal(JSON.parse(await page.locator('#export').textContent()).compiled.junctions.filter(j=>j.kind==='T').length,1);
  await page.screenshot({path:'artifacts/v3/wall-corners-tee-join.png',fullPage:true});
  await page.locator('#study').selectOption('canal');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.locator('#study').selectOption('street');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.locator('#study').selectOption('garden');
  await page.locator('#showTextures').check();
  await page.locator('#showHall').check();
  await page.screenshot({path:'artifacts/v3/wall-corners-courtyard-hall.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes('2/2 authentic'),{timeout:30000});
  assert(await mobile.locator('#cornerSE').isVisible());
  await mobile.screenshot({path:'artifacts/v3/wall-corners-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No runtime errors for any four-corner geometry renders');
  console.log('V3 corner browser QA passed: four real wall joint close-ups, previously exposed SE masonry repaired, two-direction stone base, clear gate, 1x/3x, T, routes, mobile and actual original WebPs.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
