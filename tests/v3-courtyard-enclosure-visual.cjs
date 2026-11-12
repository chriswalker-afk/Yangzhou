'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1450,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto('http://127.0.0.1:8765/courtyard-enclosure-lab-v3.html',{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('#assetStatus')?.textContent.includes('V3 continuous grass'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#enclosureStatus')?.textContent.includes('/4 verified'),{timeout:30000});
  const initialArtworkStatus=await page.locator('#enclosureStatus').textContent();
  assert.match(await page.locator('h1').textContent(),/rev 35/);
  assert(await page.locator('#retryAssets').isVisible(),'Retry artwork loading control must be available');
  assert.match(await page.locator('#enclosureStatus').textContent(),/4\/4 verified/);
  assert.match(await page.locator('#assetStatus').textContent(),/8\/8/);
  // The live lab must use compact previews; lossless masters remain in GitHub
  // but are not required as 16MB of simultaneous browser downloads.
  const previewTraffic=await page.evaluate(()=>performance.getEntriesByType('resource')
   .filter(r=>r.name.includes('/assets/v3/previews/')).map(r=>r.name));
  assert(previewTraffic.length>=12,
   'The courtyard lab must actually request its 12 compact previews: '+previewTraffic.length);
  const previewManifest=await page.evaluate(async()=>{
   const response=await fetch('assets/v3/previews/manifest.json');
   if(!response.ok)throw Error('Preview manifest unavailable');
   return response.json();
  });
  assert.equal(Object.keys(previewManifest.assets).length,12);
  assert(previewTraffic.some(u=>u.endsWith('/grass.webp')));
  assert(previewTraffic.some(u=>u.endsWith('/white-garden-wall-corner.webp')));
  // Regression: exact mathematical joins are insufficient when the painted
  // sprites have transparent terminal pixels. Inspect the real 4/4 WebPs in
  // an alpha-only compositing canvas, not the opaque grass-backed screenshot.
  const contactCoverage=await page.evaluate(async()=>{
   const enc=window.YangzhouV3Enclosures;
   const loaded=await enc.loadCommitted();
   if(loaded.missing.length)throw Error('Missing genuine WebP artwork: '+loaded.missing.join(','));
   const tile={x:0,y:0,edges:['L','L','L','L'],seed:1};
   const canvas=document.createElement('canvas'),scale=10;
   canvas.width=220*scale;canvas.height=220*scale;
   const c=canvas.getContext('2d',{willReadFrequently:true});
   c.setTransform(scale,0,0,scale,0,0);
   enc.draw(c,tile,loaded.images,{guides:false});
   const alpha=(x,y)=>c.getImageData(Math.round(x*scale),Math.round(y*scale),1,1).data[3];
   return enc.plannedCompound().seams.map(seam=>{
    const rows=[-1,0,1.5,3,4.5];
    const center=rows.map(d=>alpha(seam.x,seam.y+d));
    const neighbours=[-1,1].flatMap(dx=>rows.map(d=>alpha(seam.x+dx,seam.y+d)));
    return {names:seam.a+' -> '+seam.b,center,neighbours,paintedOverlap:seam.paintedOverlap};
   });
  });
  for(const contact of contactCoverage){
   assert.equal(contact.paintedOverlap,4,'Join overlap regressed at '+contact.names);
   assert(contact.center.filter(a=>a>=160).length>=3,
    'Grass-visible alpha gap survives at painted contact '+contact.names+' '+JSON.stringify(contact.center));
   assert(contact.neighbours.filter(a=>a>=160).length>=6,
    'Grass-visible alpha gap near contact '+contact.names+' '+JSON.stringify(contact.neighbours));
  }
  console.log('Four real painted courtyard joins contain no transparent contact cracks at the centre and neighbouring samples.');
  const data=JSON.parse(await page.locator('#layoutData').textContent());
  assert.equal(data.tileSize,220);
  assert.equal(data.courtyardReview.tileIndex,0);
  assert(data.courtyardReview.validation.valid);
  assert.equal(data.courtyardReview.layout.pieces.length,6);
  assert(data.courtyardReview.layout.seams.every(s=>s.gap===0));
  assert.equal(data.courtyardReview.canBuildCompleteEnclosure,false);
  await page.screenshot({path:'artifacts/v3/enclosure-assembly-garden.png',fullPage:true});
  await page.locator('#showGuides').click();
  assert.equal(await page.locator('#showGuides').getAttribute('aria-pressed'),'false');
  await page.locator('#showGuides').click();
  assert.equal(await page.locator('#showGuides').getAttribute('aria-pressed'),'true');
  await page.locator('#study').selectOption('junction');
  const junction=JSON.parse(await page.locator('#layoutData').textContent());
  assert.equal(junction.courtyardReview.tileIndex,3);
  assert(junction.courtyardReview.validation.valid);
  await page.screenshot({path:'artifacts/v3/enclosure-assembly-canal-junction.png',fullPage:true});
  await page.locator('#study').selectOption('joined');
  const joined=JSON.parse(await page.locator('#layoutData').textContent());
  assert.equal(joined.courtyardReview.tileIndex,null,'Do not force walls over joined street/canal tiles');
  await page.locator('#placeHere').click();
  assert.match(await page.locator('#enclosureStatus').textContent(),/Cannot build courtyard/);
  await page.locator('#study').selectOption('garden');
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(el=>el.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/enclosure-assembly-garden-3x.png',fullPage:true});
  const count=await page.evaluate(()=>window.YangzhouV3Enclosures.IDS.length);
  assert.equal(count,4);
  const missing=fs.readdirSync('assets/v3/enclosures').filter(f=>f.endsWith('.webp'));
  const status=initialArtworkStatus; // Later rejection messages should not erase the original artwork availability result.
  if(missing.length===0)assert.match(status,/0\/4 verified/,'No fake artwork should load when files absent');
  else assert.match(status,/4\/4 verified/,'All committed artwork must be automatically verified and loaded');
  const mobile=await browser.newPage({viewport:{width:390,height:800},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto('http://127.0.0.1:8765/courtyard-enclosure-lab-v3.html',{waitUntil:'load'});
  await mobile.waitForFunction(()=>document.querySelector('#assetStatus')?.textContent.includes('V3 continuous grass'),{timeout:30000});
  await mobile.screenshot({path:'artifacts/v3/enclosure-assembly-mobile.png',fullPage:true});
  // A slow remote WebP must never leave all scenery on "Loading" forever.
  // Stall one artwork fetch and one material Image request longer than the
  // deliberately short test timeout. Other original paintings stay visible.
  const stalled=await browser.newPage({viewport:{width:1000,height:750}});
  stalled.on('pageerror',e=>errors.push('stalled: '+e.message));
  for(const match of [
   '**/assets/v3/previews/moon-gate.webp',
   '**/assets/v3/previews/grass.webp'
  ]){
   await stalled.route(match,async route=>{
    await new Promise(resolve=>setTimeout(resolve,1800));
    try{await route.abort();}catch(_){} // The webpage may have aborted first.
   });
  }
  await stalled.goto('http://127.0.0.1:8765/courtyard-enclosure-lab-v3.html?assetTimeoutMs=600',
   {waitUntil:'load'});
  await stalled.waitForFunction(()=>
   document.querySelector('#enclosureStatus')?.textContent.includes('3/4 verified')&&
   document.querySelector('#enclosureStatus')?.textContent.includes('Could not load')&&
   document.querySelector('#assetStatus')?.textContent.includes('8/8 checked'),
   {timeout:9000});
  const partialArt=await stalled.locator('#enclosureStatus').textContent();
  const partialBase=await stalled.locator('#assetStatus').textContent();
  assert.match(partialArt,/moon-gate-01\.webp.*timed out/i,'Stalled gate must show a useful timeout');
  assert.match(partialBase,/grass.*Timed out/i,'Stalled material must show a useful timeout');
  assert(await stalled.locator('#scene').isVisible(),'Preview remains available despite stalled images');
  const available=await stalled.locator('#enclosureChips .ok').count();
  assert.equal(available,3,'Three verified original walls should remain visible');
  await stalled.screenshot({path:'artifacts/v3/enclosure-timeout-diagnostic.png',fullPage:true});
  await stalled.close();
  assert.deepEqual(errors,[],'No runtime JavaScript exceptions on desktop/mobile/stalled requests');
  console.log('V3 enclosure art lab browser QA passed: 6-tile study, real painted-overlap seam coverage, canal route safeguards, 3x, mobile, truthful artwork status.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});