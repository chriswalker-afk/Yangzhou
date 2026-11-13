'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const PAGE='http://127.0.0.1:8765/wall-geometry-lab-v3.html';
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1450,height:930},deviceScaleFactor:1});
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto(PAGE,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#summary')?.textContent.includes('Protected V3 ports'),{timeout:9000});
  assert.match(await page.locator('h1').textContent(),/rev 42/);
  assert(await page.locator('#showRoofTexture').isChecked());
  assert(await page.locator('#roofFile').isVisible());
  const tests=await page.evaluate(()=>{
   const walls=window.YangzhouV3WallGeometry,roof=window.YangzhouV3WallRoofTexture;
   const tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
   const roofCanvas=document.createElement('canvas');
   roofCanvas.width=128;roofCanvas.height=32;
   const p=roofCanvas.getContext('2d');
   p.fillStyle='#695f56';p.fillRect(0,0,128,32);
   for(let x=0;x<128;x+=16){
    p.fillStyle='#b5aaa0';p.fillRect(x,4,7,24);
   }
   function render(model,withTexture){
    const c=document.createElement('canvas');c.width=c.height=660;
    const ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.setTransform(3,0,0,3,0,0);
    ctx.fillStyle='rgb(30, 90, 20)';ctx.fillRect(0,0,220,220);
    const result=walls.draw(ctx,model,tile,{
     roofImage:withTexture?roofCanvas:null,roofPainter:roof,
     showGates:false,showJoints:false
    });
    const pixel=(x,y)=>Array.from(ctx.getImageData(x*3,y*3,1,1).data);
    return {result,gate:pixel(110,178),north:pixel(110,47),
      corner:pixel(42,47),atT:pixel(110,48),
      outside:pixel(200,200),
      // Paint on the grey coping, not the white plaster below it.
      alongWall:pixel(90,47)};
   }
   const rectangle=render(walls.templates.rectangle,true);
   const flat=render(walls.templates.rectangle,false);
   const tee=render(walls.templates.tee,true);
   return {rectangle,flat,tee,profile:{
    period:roof.ASSET.period,width:roof.ASSET.bandWidth,
    segments:roof.segments(walls.compile(walls.templates.rectangle)).length
   }};
  });
  assert.equal(tests.profile.period,32);
  assert.equal(tests.profile.width,8);
  assert.equal(tests.rectangle.result.roofTextureUsed,true);
  assert.equal(tests.flat.result.roofTextureUsed,false);
  assert.deepEqual(tests.rectangle.gate,tests.rectangle.outside,
   'Painted roof must NOT fill the genuine moon-gate aperture');
  assert.notDeepEqual(tests.rectangle.north,tests.rectangle.outside);
  assert.notDeepEqual(tests.rectangle.alongWall,tests.flat.alongWall,
   'Diagnostic coloured source image must be applied to continuous coping band');
  assert.notDeepEqual(tests.rectangle.corner,tests.rectangle.outside,'L corner should not expose grass');
  assert.notDeepEqual(tests.tee.atT,tests.tee.outside,'T join should not expose grass');
  await page.locator('#showRoofTexture').uncheck();
  assert.match(await page.locator('#summary').textContent(),/flat diagnostic/);
  await page.locator('#showRoofTexture').check();
  const actual='assets/v3/wall-materials/wall-roof-tiles-01.webp';
  if(fs.existsSync(actual)){
   await page.locator('#roofFile').setInputFiles(actual);
   await page.waitForFunction(()=>document.querySelector('#roofStatus')?.textContent.includes('verified'),{timeout:12000});
   assert.match(await page.locator('#summary').textContent(),/painted \(candidate\)/);
   await page.screenshot({path:'artifacts/v3/wall-roof-texture-real-1x.png',fullPage:true});
   await page.locator('#zoom').click();
   await page.screenshot({path:'artifacts/v3/wall-roof-texture-real-3x.png',fullPage:true});
  }else{
   await page.waitForFunction(()=>/not available|checking/i.test(document.querySelector('#roofStatus')?.textContent||''),{timeout:30000});
   await page.screenshot({path:'artifacts/v3/wall-roof-texture-upload-intake.png',fullPage:true});
  }
  await page.locator('#study').selectOption('canal');
  assert.match(await page.locator('#summary').textContent(),/deliberately rejected/);
  assert.deepEqual(errors,[]);
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',err=>errors.push('mobile: '+err.message));
  await mobile.goto(PAGE,{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#summary')?.textContent.includes('Protected V3 ports'),{timeout:9000});
  await mobile.screenshot({path:'artifacts/v3/wall-roof-texture-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('V3 painted coping browser QA passed: UV 32x8, L/T coverage, moon-gate hole, toggles, candidate source verification and mobile.');
 }finally{await browser.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
