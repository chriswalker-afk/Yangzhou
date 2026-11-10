'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
fs.mkdirSync('artifacts/v2',{recursive:true});
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  desktop.on('pageerror',e=>errors.push('game: '+String(e)));
  await desktop.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
  await desktop.waitForFunction(()=>window.YangzhouArtV2?.ready(),{timeout:30000});
  const status=await desktop.evaluate(()=>({
   size:window.YangzhouDebug.board.size,
   names:window.YangzhouDebug.archetypes.map(t=>t.id),
   art:window.YangzhouArtV2.inspect(),
   ports:window.YangzhouTileTopology.portWidth
  }));
  assert.equal(status.size,6);
  assert.equal(status.names.length,8);
  assert.equal(status.art.lakeReferencesLoaded,6);
  assert.equal(status.art.paintingVariantsLoaded,0);
  assert.equal(status.ports.S,44);
  assert.equal(status.ports.W,88);
  const placement=await desktop.evaluate(()=>{
    const g=window.YangzhouDebug,site=g.candidates()[0],s=g.state;
    return {site,screenX:(site[0]*220+110)*s.scale+s.offsetX,screenY:(site[1]*220+110)*s.scale+s.offsetY};
  });
  assert(placement.site);
  await desktop.mouse.click(placement.screenX,placement.screenY);
  await desktop.locator('#place').click();
  const made=await desktop.evaluate(()=>{
    const g=window.YangzhouDebug;
    return {n:g.board.size,latest:[...g.board.values()].find(t=>!t.fixed),valid:g.topology.validateBoard([...g.board.values()])};
  });
  assert.equal(made.n,7);
  assert.equal(made.latest?.id,'garden-grove');
  assert.deepEqual(made.valid,[]);
  await desktop.screenshot({path:'artifacts/v2/playable-desktop.png',fullPage:true});
  await desktop.locator('#viewDetail').click();
  await desktop.waitForTimeout(650);
  await desktop.screenshot({path:'artifacts/v2/playable-detail.png',fullPage:true});

  const lab=await browser.newPage({viewport:{width:1440,height:950},deviceScaleFactor:1});
  lab.on('pageerror',e=>errors.push('lab: '+String(e)));
  await lab.goto('http://127.0.0.1:8765/tile-lab-v2.html',{waitUntil:'load'});
  await lab.waitForFunction(()=>window.YangzhouArtV2?.ready(),{timeout:30000});
  assert.equal(await lab.locator('.variant canvas').count(),32);
  assert.match(await lab.locator('#ringCheck').textContent(),/16\/16 tiles legally connected/);
  await lab.screenshot({path:'artifacts/v2/tile-gallery-desktop.png',fullPage:true});
  await lab.locator('.variant').first().click();
  await lab.locator('#detail').waitFor({state:'visible'});
  await lab.screenshot({path:'artifacts/v2/composition-closeup.png',fullPage:true});
  await lab.locator('#close').click();
  await lab.locator('#ports').check();
  await lab.screenshot({path:'artifacts/v2/ports-overlay.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:780},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile: '+String(e)));
  await mobile.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
  await mobile.waitForFunction(()=>window.YangzhouArtV2?.ready(),{timeout:30000});
  assert.equal(await mobile.locator('#tileLab').count(),1);
  await mobile.screenshot({path:'artifacts/v2/playable-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'Browser JavaScript errors');
  console.log('V2 browser QA passed: desktop/mobile, placement, gallery, 32 studies, 16-square ring and detail zoom.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exit(1)});
