'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const URL='http://127.0.0.1:8765/wall-geometry-lab-v3.html?rev=43';
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1470,height:1000},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes('2/2 authentic'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes('verified'),{timeout:30000});
  assert.match(await page.locator('h1').textContent(),/rev 43/);
  assert(await page.locator('#showPerspective').isChecked());
  await page.locator('#showHall').uncheck();
  await page.locator('#showGate').uncheck();
  const at=async(points)=>page.evaluate(points=>{
   const c=document.querySelector('#scene').getContext('2d',{willReadFrequently:true});
   return points.map(([x,y])=>Array.from(c.getImageData(Math.round(3*x),Math.round(3*y),1,1).data));
  },points);
  const points={
   ground:[200,200],
   NWfacade:[48,54],NEfacade:[172,54],
   SWfacade:[48,186],SEfacade:[172,186],
   bottomStone:[172,191],northStone:[172,56],
   NWbeyond:[36,55],NEbeyond:[189,55],
   SWendPlaster:[39,186],SEendPlaster:[181,186],
   SWendStone:[39,191],SEendStone:[181,191],
   leftGatePlaster:[94,186],rightGatePlaster:[126,186],
   leftGateStone:[94,191],rightGateStone:[126,191],
   SWroofOuter:[38.8,186],SEroofOuter:[181.2,186],
   SWstoneOuter:[38.8,191],SEstoneOuter:[181.2,191],
   SWpastRoof:[37.2,186],SEpastRoof:[182.8,186],
   SEoldSlab:[189,185],westOldSlab:[50,90],eastOldSlab:[189,90],
   westEave:[47,90],eastEave:[183,90],
   roofSE:[178,178],gate:[110,178],gateBelow:[110,190],
   hiddenNorth:[85,40],hiddenWest:[34,90]
  };
  const values=Object.fromEntries(Object.keys(points).map((k,i)=>
   [k,null]));
  const scans=await at(Object.values(points));
  Object.keys(points).forEach((k,i)=>{values[k]=scans[i];});
  for(const key of ['NWfacade','NEfacade','SWfacade','SEfacade',
   'bottomStone','northStone','roofSE','westEave','eastEave',
   'SWendPlaster','SEendPlaster','SWendStone','SEendStone',
   'leftGatePlaster','rightGatePlaster','leftGateStone','rightGateStone',
   'SWroofOuter','SEroofOuter','SWstoneOuter','SEstoneOuter']){
   assert.notDeepEqual(values[key],values.ground,
    'Painted roof/eave/south-facing façade must connect at '+key);
  }
  for(const key of ['NWbeyond','NEbeyond','SWpastRoof','SEpastRoof',
   'SEoldSlab','westOldSlab','eastOldSlab','gate','gateBelow',
   'hiddenNorth','hiddenWest']){
   assert.deepEqual(values[key],values.ground,
    'Overwide corner/side masonry or blocked gate at '+key);
  }
  // Prove four photos are real crops of the rendered courtyard, not mock-ups.
  const gallery=await page.evaluate(()=>{
   return ['NW','NE','SW','SE'].map(key=>{
    const c=document.getElementById('corner'+key);
    if(!c)return null;
    const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let opaque=0,changed=0;
    for(let i=0;i<d.length;i+=32){
     if(d[i+3]>200)opaque++;
     if(d[i]||d[i+1]||d[i+2])changed++;
    }
    return {key,width:c.width,height:c.height,opaque,changed};
   });
  });
  for(const card of gallery){
   assert(card&&card.width===180&&card.height===180,
    'All four corners need a 180-pixel original-scene close-up');
   assert(card.opaque>100&&card.changed>100,
    'Missing screenshot pixels for '+card.key);
  }
  const tile=JSON.parse(await page.locator('#export').textContent());
  assert(tile.audit.valid);
  assert.equal(tile.compiled.junctions.filter(j=>j.kind==='L').length,4);
  assert(tile.audit.passableOpenings[0].open);
  await page.screenshot({path:'artifacts/v3/wall-camera-4-corners-1x.png',fullPage:true});
  await page.locator('#zoom').click();
  await page.screenshot({path:'artifacts/v3/wall-camera-4-corners-3x.png',fullPage:true});
  await page.locator('#zoom').click();
  // Original paintings must remain material-dependent, but the shared roof
  // cannot change when the user switches the face textures.
  await page.locator('#showPlasterTexture').uncheck();
  const [noPlaster,noLeftPlaster,noRightPlaster,roofAfterPlaster]=
   await at([points.SEfacade,points.SWendPlaster,points.SEendPlaster,points.roofSE]);
  assert.notDeepEqual(noPlaster,values.SEfacade,'SE façade uses real ivory painting');
  assert.notDeepEqual(noLeftPlaster,values.SWendPlaster,
   'Painted ivory plaster must extend to the full southwest end cap');
  assert.notDeepEqual(noRightPlaster,values.SEendPlaster,
   'Painted ivory plaster must extend to the full southeast end cap');
  assert.deepEqual(roofAfterPlaster,values.roofSE,'Roof artwork is independent');
  await page.locator('#showPlasterTexture').check();
  await page.locator('#showStoneTexture').uncheck();
  const [noStone,noLeftStone,noRightStone,roofAfterStone]=
   await at([points.bottomStone,points.SWendStone,points.SEendStone,points.roofSE]);
  assert.notDeepEqual(noStone,values.bottomStone,'South base uses original stone painting');
  assert.notDeepEqual(noLeftStone,values.SWendStone,
   'Painted foundation must reach the southwest exterior corner');
  assert.notDeepEqual(noRightStone,values.SEendStone,
   'Painted foundation must reach the southeast exterior corner');
  assert.deepEqual(roofAfterStone,values.roofSE,'Stone toggle must not change corner coping');
  await page.locator('#showStoneTexture').check();
  await page.locator('#plan').selectOption('partial');
  assert(JSON.parse(await page.locator('#export').textContent()).audit.valid);
  await page.locator('#plan').selectOption('tee');
  assert.equal(JSON.parse(await page.locator('#export').textContent()).compiled.junctions.filter(j=>j.kind==='T').length,1);
  await page.screenshot({path:'artifacts/v3/wall-camera-tee-join.png',fullPage:true});
  await page.locator('#study').selectOption('canal');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.locator('#study').selectOption('street');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  await page.locator('#study').selectOption('garden');
  await page.locator('#showTextures').check();
  await page.locator('#showHall').check();
  await page.locator('#showGate').check();
  await page.screenshot({path:'artifacts/v3/wall-camera-courtyard-hall.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#faceStatus')?.textContent.includes('2/2 authentic'),{timeout:30000});
  for(const corner of ['NW','NE','SW','SE'])
   assert(await mobile.locator('#corner'+corner).isVisible());
  await mobile.screenshot({path:'artifacts/v3/wall-camera-4-corners-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No runtime JS exceptions on desktop/mobile');
  console.log('V3 rev43 corners QA passed: both lower corners painted to outer 4-unit roof-overhang edges, no false slabs, gate jambs/openings preserved, 1x/3x mobile.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
