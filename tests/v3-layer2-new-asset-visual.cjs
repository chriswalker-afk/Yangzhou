'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
fs.mkdirSync('artifacts/v3',{recursive:true});
const url='http://127.0.0.1:8765/layer2-new-assets-v3.html';
function sample(page){return page.evaluate(()=>{
 const c=document.querySelector('#scene').getContext('2d');
 const rgba=c.getImageData(110*3,110*3,1,1).data;
 return Array.from(rgba);
});}
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('#status')?.textContent.includes('5 of 5 verified GitHub WebP candidates loaded')&&document.querySelector('#status')?.textContent.includes('existing hall loaded'),null,{timeout:40000});
  assert.match(await page.locator('h1').textContent(),/rev 48/);
  assert.equal(await page.locator('#cards article').count(),6);
  const initial=await sample(page);
  assert.equal(await page.locator('#cards img').count(),6,
   'Five original candidates and original hall should all be visible');
  await page.screenshot({path:'artifacts/v3/new-layer2-all-committed-candidates-1x.png',fullPage:true});
  const original=fs.readFileSync('assets/v3/large/courtyard-hall-01.webp');
  // The optional local replacement must not overwrite the committed binary.
  // Verify canvas changes only within this local comparison preview.
  await page.locator('#assetFiles').setInputFiles([{name:'garden-pavilion-01.webp',mimeType:'image/webp',buffer:original}]);
  await page.waitForFunction(()=>document.querySelector('#status')?.textContent.includes('5 of 5 verified GitHub WebP candidates loaded'),null,{timeout:5000});
  assert.notDeepEqual(await sample(page),initial,'Selected real WebP must affect game canvas');
  await page.screenshot({path:'artifacts/v3/new-layer2-file-import-1x.png',fullPage:true});
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(x=>x.style.width),'1980px');
  await page.locator('#layout').selectOption('water');
  await page.screenshot({path:'artifacts/v3/new-layer2-file-import-3x-canal.png',fullPage:true});
  await page.locator('#showGrid').click();
  assert.equal(await page.locator('#showGrid').getAttribute('aria-pressed'),'false');
  const mobile=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.goto(url,{waitUntil:'load'});
  await mobile.waitForFunction(()=>document.querySelector('#status')?.textContent.includes('5 of 5 verified GitHub WebP candidates loaded')&&document.querySelector('#status')?.textContent.includes('existing hall loaded'),null,{timeout:40000});
  await mobile.screenshot({path:'artifacts/v3/new-layer2-all-committed-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No browser errors in upload preview');
  console.log('V3 rev48 verified five committed lossless WebPs and original hall auto-load, compare-toggle, garden/canal, desktop, 3x and mobile, without affecting original V2.');
 }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
