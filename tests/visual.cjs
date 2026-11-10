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
  await desktop.waitForFunction(()=>window.YangzhouArtV2?.getMaster?.('street-straight:1')?.naturalWidth===1254,{timeout:30000});
  await desktop.screenshot({path:'artifacts/v2/original-painted-street-game-rack.png',fullPage:true});
  const status=await desktop.evaluate(()=>({
   size:window.YangzhouDebug.board.size,
   names:window.YangzhouDebug.archetypes.map(t=>t.id),
   art:window.YangzhouArtV2.inspect(),
   ports:window.YangzhouTileTopology.portWidth
  }));
  assert.equal(status.size,6);
  assert.equal(status.names.length,8);
  assert.equal(status.art.lakeReferencesLoaded,6);
  assert.equal(status.art.paintingVariantsLoaded,1,'The original committed image must load automatically');
  assert.equal(status.art.manifestStatus,'review');
  assert.equal(await desktop.evaluate(()=>window.YangzhouDebug.archetypes[window.YangzhouDebug.state.type].id),'street-straight');
  assert.equal(await desktop.evaluate(()=>window.YangzhouDebug.state.rotation),1);
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
  assert.equal(made.latest?.id,'street-straight');
  assert.equal(made.latest?.edges?.join(''),'LSLS');
  assert.deepEqual(made.valid,[]);
  await desktop.screenshot({path:'artifacts/v2/playable-desktop.png',fullPage:true});
  await desktop.locator('#viewDetail').click();
  await desktop.waitForTimeout(650);
  await desktop.screenshot({path:'artifacts/v2/playable-detail.png',fullPage:true});

  const lab=await browser.newPage({viewport:{width:1440,height:950},deviceScaleFactor:1});
  lab.on('pageerror',e=>errors.push('lab: '+String(e)));
  await lab.goto('http://127.0.0.1:8765/tile-lab-v2.html',{waitUntil:'load'});
  await lab.waitForFunction(()=>window.YangzhouArtV2?.ready(),{timeout:30000});
  await lab.waitForFunction(()=>window.YangzhouArtV2?.getMaster?.('street-straight:1')?.naturalWidth===1254,{timeout:30000});
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
  await mobile.waitForFunction(()=>window.YangzhouArtV2?.getMaster?.('street-straight:1')?.naturalWidth===1254,{timeout:30000});
  assert.equal(await mobile.locator('#tileLab').count(),1);
  await mobile.screenshot({path:'artifacts/v2/playable-mobile.png',fullPage:true});
  // PR13 technical integration: the fixture is NOT claimed to be original
  // painted artwork. It exercises the picker, actual image pixels, the game
  // renderer and repeated seam-inspection view in a headless browser.
  const fixtureData=await lab.evaluate(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=1024;
    const c=canvas.getContext('2d');
    c.fillStyle='#c6bf9d';c.fillRect(0,0,1024,1024);
    c.fillStyle='#b7a182';c.fillRect(0,410,1024,205);
    c.fillStyle='#6a7a64';c.fillRect(0,0,1024,410);
    c.fillStyle='#829272';c.fillRect(0,615,1024,409);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const fileFixture={name:'test-only-not-real-art.png',mimeType:'image/png',buffer:Buffer.from(fixtureData,'base64')};
  const pilotPage=await browser.newPage({viewport:{width:1420,height:940},deviceScaleFactor:1});
  pilotPage.on('pageerror',e=>errors.push('pilot: '+String(e)));
  await pilotPage.goto('http://127.0.0.1:8765/street-pilot-review.html',{waitUntil:'load'});
  await pilotPage.waitForFunction(()=>window.YangzhouArtV2?.ready(),{timeout:30000});
  await pilotPage.waitForFunction(()=>window.YangzhouArtV2?.getMaster?.('street-straight:1')?.naturalWidth===1254,{timeout:30000});
  await pilotPage.waitForFunction(()=>document.getElementById('sizeValue')?.textContent==='1254×1254',{timeout:30000});
  assert.match(await pilotPage.locator('#assetStatus').textContent(),/Original street painting loaded from GitHub/);
  assert.match(await pilotPage.locator('#geometryVerdict').textContent(),/outstanding/);
  await pilotPage.locator('#zoom').selectOption('1');
  await pilotPage.screenshot({path:'artifacts/v2/original-painted-street-1x.png',fullPage:true});
  await pilotPage.locator('#portToggle').click();
  await pilotPage.screenshot({path:'artifacts/v2/original-painted-street-1x-port-overlay.png',fullPage:true});
  await pilotPage.locator('#zoom').selectOption('3');
  await pilotPage.screenshot({path:'artifacts/v2/original-painted-street-3x-port-overlay.png',fullPage:true});
  // Synthetic upload is a temporary override for technical QA only.
  await pilotPage.locator('#pilotFile').setInputFiles(fileFixture);
  await pilotPage.waitForFunction(()=>window.YangzhouArtV2.inspect().temporaryReviewKeys.length===1);
  assert.match(await pilotPage.locator('#assetStatus').textContent(),/Temporary local revision/);
  assert.equal(await pilotPage.locator('#sizeValue').textContent(),'1024×1024');
  assert.match(await pilotPage.locator('#geometryVerdict').textContent(),/outstanding/);
  assert.equal(await pilotPage.locator('#portToggle').getAttribute('aria-pressed'),'true');
  await pilotPage.locator('#zoom').selectOption('3');
  await pilotPage.screenshot({path:'artifacts/v2/pr13-geometry-ports-fixture.png',fullPage:true});
  await pilotPage.locator('#clear').click();
  await pilotPage.waitForFunction(()=>window.YangzhouArtV2.inspect().temporaryReviewKeys.length===0);
  const imgStatus=await pilotPage.locator('#sizeValue').textContent();
  assert.equal(imgStatus,'1254×1254','Restoring must show the committed original, not a sketch');
  assert.equal(await pilotPage.evaluate(()=>window.YangzhouArtV2.getMaster('street-straight:1')?.naturalWidth),1254);
  assert.match(await pilotPage.locator('#assetStatus').textContent(),/Original street painting loaded from GitHub/);
  await desktop.locator('#pilotUpload').setInputFiles(fileFixture);
  await desktop.waitForFunction(()=>window.YangzhouArtV2.inspect().temporaryReviewKeys.length===1);
  const selected=await desktop.evaluate(()=>{
    const s=window.YangzhouDebug.state;
    return {id:window.YangzhouDebug.archetypes[s.type].id,rotation:s.rotation,
       edges:window.YangzhouDebug.rotEdges(window.YangzhouDebug.archetypes[s.type].edges,s.rotation).join('')};
  });
  assert.deepEqual(selected,{id:'street-straight',rotation:1,edges:'LSLS'});
  await desktop.screenshot({path:'artifacts/v2/pr13-playable-pilot-fixture.png',fullPage:true});
  assert.deepEqual(errors,[],'Browser JavaScript errors');
  console.log('Painted street browser QA passed: original 1254px image autoload, correct LSLS tile, mobile/desktop, original 1x/3x seam previews, 32-variant gallery, and local revision/restore.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exit(1)});
