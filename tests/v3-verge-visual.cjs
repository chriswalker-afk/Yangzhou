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
  page.on('pageerror',e=>errors.push('desktop '+String(e)));
  await page.goto('http://127.0.0.1:8765/layer-lab-v3.html',{waitUntil:'load'});
  await page.waitForFunction(()=>
    document.getElementById('vergeStatus')?.textContent.includes('committed candidate image loaded from GitHub') &&
    document.getElementById('bankStatus')?.textContent.includes('committed candidate image loaded from GitHub') &&
    document.getElementById('status')?.textContent.includes('All three texture candidates loaded'),
    {timeout:30000});
  assert.match(await page.locator('h1').textContent(),/rev 24/);
  assert.equal(await page.locator('#paintedVerge').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#paintedBank').getAttribute('aria-pressed'),'true');

  const sample=()=>page.evaluate(()=>{
    const ctx=document.getElementById('scene').getContext('2d');
    const p=(x,y)=>[...ctx.getImageData(x*3,y*3,1,1).data];
    const region=(x,y,w,h)=>{
      const data=ctx.getImageData(x*3,y*3,w*3,h*3).data;
      let r=0,g=0,b=0;
      for(let i=0;i<data.length;i+=4){r+=data[i];g+=data[i+1];b+=data[i+2];}
      return [r,g,b];
    };
    return {
      upper:region(20,83,180,6),lower:region(20,132,180,6),
      stone:p(110,110),canal:p(110,330),land:p(110,30)
    };
  });

  const painted=await sample();
  await page.screenshot({path:'artifacts/v3/path-verge-painted-joined.png',fullPage:true});
  await page.locator('#paintedVerge').click();
  assert.equal(await page.locator('#paintedVerge').getAttribute('aria-pressed'),'false');
  const fallback=await sample();
  assert.notDeepEqual(painted.upper,fallback.upper,'Painted verge must alter the upper path-to-grass transition');
  assert.notDeepEqual(painted.lower,fallback.lower,'Painted verge must alter the lower path-to-grass transition');
  assert.deepEqual(painted.stone,fallback.stone,'Path core must remain identical with painterly verge disabled');
  assert.deepEqual(painted.canal,fallback.canal,'Canal water must be unaffected by path overlay');
  assert.deepEqual(painted.land,fallback.land,'Distant grass must be unchanged');
  assert.match(await page.locator('#vergeStatus').textContent(),/Painted preview OFF/);
  await page.screenshot({path:'artifacts/v3/path-verge-temporary-fallback.png',fullPage:true});
  await page.locator('#paintedVerge').click();
  assert.equal(await page.locator('#paintedVerge').getAttribute('aria-pressed'),'true');
  assert.deepEqual((await sample()).upper,painted.upper,'Restoring the painted verge must be deterministic');

  for(const study of ['street-bend','street-cross','bridge','joined']){
    await page.locator('#sceneChoice').selectOption(study);
    assert.equal(await page.locator('#sceneChoice').inputValue(),study);
    await page.screenshot({path:'artifacts/v3/path-verge-'+study+'.png',fullPage:true});
  }
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(x=>x.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/path-verge-3x-joined.png',fullPage:true});

  // Confirm a local override changes the painting without touching GitHub.
  const png=await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=36;canvas.height=8;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#714C36';ctx.fillRect(0,0,36,8);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const beforeOverride=await sample();
  await page.locator('#vergeFile').setInputFiles({name:'preview-only.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await page.waitForFunction(()=>document.getElementById('vergeStatus')?.textContent.includes('local candidate preview only'));
  assert.notDeepEqual((await sample()).upper,beforeOverride.upper,'Local candidate overrides painting in this browser only');
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>document.getElementById('vergeStatus')?.textContent.includes('committed candidate image loaded from GitHub'),{timeout:30000});

  const mobile=await browser.newPage({viewport:{width:390,height:800},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile '+String(e)));
  await mobile.goto('http://127.0.0.1:8765/layer-lab-v3.html',{waitUntil:'load'});
  await mobile.waitForFunction(()=>document.getElementById('vergeStatus')?.textContent.includes('committed candidate image loaded from GitHub'),{timeout:30000});
  await mobile.locator('#sceneChoice').selectOption('street-bend');
  await mobile.screenshot({path:'artifacts/v3/path-verge-mobile-bend.png',fullPage:true});
  assert.deepEqual(errors,[],'Desktop/mobile must have no page errors');
  console.log('Path Verge 01 browser QA passed: both painted sides, exact paving/water cores, 1x/3x, bends, junctions, bridge and mobile.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exit(1);});
