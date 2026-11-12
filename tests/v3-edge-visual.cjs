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
  page.on('pageerror',e=>errors.push('desktop: '+e));
  await page.goto('http://127.0.0.1:8765/layer-lab-v3.html',{waitUntil:'load'});
  await page.waitForFunction(()=>
    document.querySelector('#status')?.textContent?.includes('All three texture candidates loaded for visual review') &&
    ['grass','stone','water'].every(id=>document.querySelector('#status')?.textContent?.includes(id+': loaded from GitHub assets')),
    {timeout:30000});
  assert.equal(await page.locator('#sceneChoice').inputValue(),'joined');
  assert.equal(await page.locator('#edges').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#scene').getAttribute('width'),'1980');

  // The outside-only verge is present, with an exact 44-unit street centre.
  // Compare the same world-coordinate sample with and without the band:
  // this must visibly change something on land, while keeping the stone.
  const pixel=()=>page.evaluate(()=>{
    const c=document.getElementById('scene'),ctx=c.getContext('2d');
    const sample=(x,y)=>[...ctx.getImageData(x*3,y*3,1,1).data];
    return {
      edge:sample(110,133),core:sample(110,110),water:sample(110,330),
      canalBankTop:sample(110,284),canalBankBottom:sample(110,376),
      canalContactTop:sample(110,285)
    };
  });
  const before=await pixel();
  assert.match(await page.locator('#edgeState').textContent(),/Layer 1B.*Edging ON/);
  assert.deepEqual(before.canalBankTop,[186,167,137,255],
    'Real canvas must display the temporary canal-bank ribbon ABOVE the water');
  assert.deepEqual(before.canalBankBottom,[186,167,137,255],
    'Real canvas must display the temporary canal-bank ribbon BELOW the water');
  assert.deepEqual(before.canalContactTop,[86,123,112,255],
    'A contrasting waterline rim must remain just outside the 40% water mouth');
  await page.screenshot({path:'artifacts/v3/layer1b-six-joined-edging.png',fullPage:true});
  await page.locator('#edges').click();
  assert.equal(await page.locator('#edges').getAttribute('aria-pressed'),'false');
  const after=await pixel();
  assert.notDeepEqual(before.edge,after.edge,'Land-side path edging should visibly differ when switched off');
  assert.notDeepEqual(before.canalBankTop,after.canalBankTop,'Canal bank MUST visibly differ from grass when edging is disabled');
  assert.notDeepEqual(before.canalBankBottom,after.canalBankBottom,'Lower canal bank MUST visibly differ from grass when edging is disabled');
  assert.match(await page.locator('#edgeState').textContent(),/Edging OFF/);
  assert.deepEqual(before.core,after.core,'Exact route centre must use the same unchanged stone material');
  assert.deepEqual(before.water,after.water,'Water core must remain identical after hiding edges');
  await page.screenshot({path:'artifacts/v3/layer1b-six-joined-no-edging.png',fullPage:true});
  await page.locator('#edges').click();
  assert.equal(await page.locator('#edges').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#edgeState').textContent(),/Edging ON/);

  // A generated image may be previewed locally without importing an
  // unverified or substituted binary into GitHub.
  await page.waitForFunction(()=>document.querySelector('#bankStatus')?.textContent.includes('committed candidate image loaded from GitHub'),{timeout:30000});
  assert.match(await page.locator('#bankStatus').textContent(),/committed candidate image loaded from GitHub/);
  const committedBankPixel=await page.evaluate(()=>[...document.querySelector('#scene').getContext('2d').getImageData(110*3,284*3,1,1).data]);
  assert.notDeepEqual(committedBankPixel,before.canalBankTop,'Actual committed canal-bank artwork must replace temporary color');
  const paintedFixture=await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=32;c.height=8;
    const ctx=c.getContext('2d');ctx.fillStyle='#AB6B46';ctx.fillRect(0,0,32,8);
    return c.toDataURL('image/png').split(',')[1];
  });
  await page.locator('#bankFile').setInputFiles({
    name:'fixture-not-approved-art.png',
    mimeType:'image/png',
    buffer:Buffer.from(paintedFixture,'base64')
  });
  await page.waitForFunction(()=>document.querySelector('#bankStatus')?.textContent.includes('local original preview only'));
  const bankPixel=()=>page.evaluate(()=>[...document.getElementById('scene').getContext('2d').getImageData(110*3,284*3,1,1).data]);
  const fixtureBank=await bankPixel();
  assert.notDeepEqual(fixtureBank,committedBankPixel,'Local image override should replace committed artwork');
  await page.locator('#paintedBank').click();
  assert.equal(await page.locator('#paintedBank').getAttribute('aria-pressed'),'false');
  assert.deepEqual(await bankPixel(),before.canalBankTop,'Painted bank OFF should restore temporary diagnostic edging');
  await page.locator('#paintedBank').click();
  assert.equal(await page.locator('#paintedBank').getAttribute('aria-pressed'),'true');
  assert.deepEqual(await bankPixel(),fixtureBank,'Painted bank ON should restore the local candidate image');
  await page.screenshot({path:'artifacts/v3/layer1b-local-painted-bank-fixture.png',fullPage:true});

  // All selected geometries are drawn through the same compositor.
  const studies=['street-bend','canal-bend','bridge','canal-junction','street-cross','joined'];
  for(const study of studies){
    await page.locator('#sceneChoice').selectOption(study);
    assert.equal(await page.locator('#sceneChoice').inputValue(),study);
    assert.equal(await page.locator('#status').textContent().then(s=>s.includes('All three texture candidates loaded')),true);
    if(study==='street-bend'||study==='canal-bend'||study==='bridge'||study==='canal-junction'){
      await page.screenshot({path:'artifacts/v3/layer1b-'+study+'.png',fullPage:true});
    }
  }
  await page.locator('#ports').click();
  assert.equal(await page.locator('#ports').getAttribute('aria-pressed'),'true');
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#zoom').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#scene').evaluate(el=>el.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/layer1b-three-times-ports.png',fullPage:true});

  const mobile=await browser.newPage({viewport:{width:390,height:800},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile: '+e));
  await mobile.goto('http://127.0.0.1:8765/layer-lab-v3.html',{waitUntil:'load'});
  await mobile.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('All three texture candidates loaded'),{timeout:30000});
  await mobile.locator('#sceneChoice').selectOption('bridge');
  await mobile.locator('#ports').click();
  assert.equal(await mobile.locator('#ports').getAttribute('aria-pressed'),'true');
  await mobile.screenshot({path:'artifacts/v3/layer1b-mobile-bridge.png',fullPage:true});
  assert.deepEqual(errors,[],'No JavaScript errors in V3 desktop/mobile prototype');
  console.log('V3 Layer 1B browser QA passed: committed textures, six joins, edge comparison, bends, bridge, junctions, 3x guides and mobile.');
 }finally{
  await browser.close();
 }
}
run().catch(e=>{console.error(e);process.exit(1)});
