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
  await desktop.waitForFunction(()=>window.YangzhouArtV2?.getMaster?.('street-straight:3')?.naturalWidth===1254 && window.YangzhouArtV2?.getMaster?.('street-straight:0')?.naturalWidth===1254,{timeout:30000});
  await desktop.screenshot({path:'artifacts/v2/two-painted-streets-game-rack.png',fullPage:true});
  await desktop.evaluate(()=>{const game=window.YangzhouDebug;game.state.type=1;game.state.rotation=0;game.state.selected=null;});
  await desktop.screenshot({path:'artifacts/v2/north-south-street-active.png',fullPage:true});
  await desktop.evaluate(()=>{const game=window.YangzhouDebug;game.state.type=1;game.state.rotation=1;game.state.selected=null;});
  // 19 independently painted expansion images; keep one stable, topology-safe
  // selection per placed tile. This verifies the real downloaded WebPs, not
  // an approximate or synthetic test sprite.
  await desktop.waitForFunction(()=>{
    const x=window.YangzhouVariantDeck?.inspect();
    return x?.variantPoolReady===true && x.variantPaintingsLoaded===19;
  },{timeout:60000});
  const randomQA=await desktop.evaluate(()=>{
    const deck=window.YangzhouVariantDeck;
    const east={id:'street-straight',edges:['L','S','L','S'],x:5,y:9,seed:31};
    const canal={id:'canal-straight',edges:['W','L','W','L'],x:1,y:5,seed:42};
    deck.setGameSeed(7);
    const first=deck.getSelectedVariant(east);
    const repeated=deck.getSelectedVariant(east);
    const canalSelected=deck.getSelectedVariant(canal);
    const seen=new Set();
    for(let n=1;n<40;n++){
      deck.setGameSeed(n);
      seen.add(deck.getSelectedVariant(east)?.id);
    }
    deck.setGameSeed(7);
    return {info:deck.inspect(),first,repeated,canalSelected,
      uniqueDraws:seen.size,
      fixed:deck.getSelectedVariant({...east,fixed:true}),
      invalid:deck.getSelectedVariant({...east,edges:['W','W','L','L']})};
  });
  assert.equal(randomQA.info.variantPools,11);
  assert.equal(randomQA.info.variantCandidates,19);
  assert.deepEqual(randomQA.info.variantFailures,[]);
  assert.equal(randomQA.first?.edges,'LSLS');
  assert.deepEqual(randomQA.first,randomQA.repeated);
  assert.equal(randomQA.canalSelected?.edges,'WLWL');
  assert(randomQA.uniqueDraws>1,'Randomization should vary per seed');
  assert.equal(randomQA.fixed,null,'Original lake tiles must never be replaced');
  assert.equal(randomQA.invalid,null,'No wrong-edge tile may receive artwork');
  await desktop.screenshot({path:'artifacts/v2/painted-variants-active.png',fullPage:true});

  const variantGallery=await browser.newPage({viewport:{width:1380,height:850},deviceScaleFactor:1});
  variantGallery.on('pageerror',e=>errors.push('variants-gallery: '+String(e)));
  await variantGallery.goto('http://127.0.0.1:8765/variant-gallery.html',{waitUntil:'load'});
  assert.equal(await variantGallery.locator('figure img').count(),19,'Gallery must show 19 original square paintings');
  // The public gallery intentionally uses lazy loading; force all originals
  // to load before we inspect their dimensions or capture a full-page shot.
  await variantGallery.locator('figure img').evaluateAll(images=>images.forEach(img=>{img.loading='eager';}));
  await variantGallery.waitForFunction(()=>
    [...document.querySelectorAll('figure img')].every(im=>im.complete&&im.naturalWidth===1254&&im.naturalHeight===1254),
    {timeout:60000});
  await variantGallery.screenshot({path:'artifacts/v2/19-painted-originals-gallery.png',fullPage:true});

  const status=await desktop.evaluate(()=>({
   size:window.YangzhouDebug.board.size,
   names:window.YangzhouDebug.archetypes.map(t=>t.id),
   art:window.YangzhouArtV2.inspect(),
   ports:window.YangzhouTileTopology.portWidth
  }));
  assert.equal(status.size,6);
  assert.equal(status.names.length,8);
  assert.equal(status.art.lakeReferencesLoaded,6);
  assert.equal(status.art.paintingVariantsLoaded,3,'Three independent street paintings must load from the active manifest');
  const activeMasters=await desktop.evaluate(()=>({
    repaint:window.YangzhouArtV2.getMaster('street-straight:1')?.src,
    neighbour:window.YangzhouArtV2.getMaster('street-straight:3')?.src
  }));
  assert.match(activeMasters.repaint,/street-east-west-repaint\.png/);
  assert.match(activeMasters.neighbour,/street-east-west-neighbour\.png/);
  assert.notEqual(activeMasters.repaint,activeMasters.neighbour,'Two different original paintings, not a duplicated image');
  assert.match(await desktop.evaluate(()=>window.YangzhouArtV2.getMaster('street-straight:0')?.src),/street-straight-north-south\.png/);
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
  await lab.waitForFunction(()=>window.YangzhouArtV2?.getMaster?.('street-straight:1')?.naturalWidth===1254&&window.YangzhouArtV2?.getMaster?.('street-straight:3')?.naturalWidth===1254,{timeout:30000});
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
  await mobile.waitForFunction(()=>window.YangzhouArtV2?.getMaster?.('street-straight:1')?.naturalWidth===1254&&window.YangzhouArtV2?.getMaster?.('street-straight:3')?.naturalWidth===1254,{timeout:30000});
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
  assert.match(await pilotPage.locator('#assetStatus').textContent(),/Repainted street painting loaded from GitHub/);
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
  assert.match(await pilotPage.locator('#assetStatus').textContent(),/Repainted street painting loaded from GitHub/);
  await desktop.locator('#pilotUpload').setInputFiles(fileFixture);
  await desktop.waitForFunction(()=>window.YangzhouArtV2.inspect().temporaryReviewKeys.length===1);
  const selected=await desktop.evaluate(()=>{
    const s=window.YangzhouDebug.state;
    return {id:window.YangzhouDebug.archetypes[s.type].id,rotation:s.rotation,
       edges:window.YangzhouDebug.rotEdges(window.YangzhouDebug.archetypes[s.type].edges,s.rotation).join('')};
  });
  assert.deepEqual(selected,{id:'street-straight',rotation:1,edges:'LSLS'});
  await desktop.screenshot({path:'artifacts/v2/pr13-playable-pilot-fixture.png',fullPage:true});

  // Real two-original painting lab. It loads both committed images directly,
  // while synthetic local fixtures are only used to exercise the override UX.
  const pairReview=await browser.newPage({viewport:{width:1400,height:940},deviceScaleFactor:1});
  pairReview.on('pageerror',e=>errors.push('pair: '+String(e)));
  await pairReview.goto('http://127.0.0.1:8765/street-pair-review.html',{waitUntil:'load'});
  await pairReview.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('2/2 full-resolution'),{timeout:30000});
  assert.match(await pairReview.locator('#status').textContent(),/2\/2 full-resolution originals available/);
  await pairReview.locator('#ports').click();
  assert.equal(await pairReview.locator('#ports').getAttribute('aria-pressed'),'true');
  await pairReview.screenshot({path:'artifacts/v2/real-street-pair-1x.png',fullPage:true});
  await pairReview.locator('#zoom').selectOption('3');
  await pairReview.screenshot({path:'artifacts/v2/real-street-pair-3x.png',fullPage:true});
  await pairReview.locator('#swap').click();
  await pairReview.screenshot({path:'artifacts/v2/real-street-pair-swapped.png',fullPage:true});

  const neighbourLab=await browser.newPage({viewport:{width:1400,height:920},deviceScaleFactor:1});
  neighbourLab.on('pageerror',e=>errors.push('neighbour: '+String(e)));
  await neighbourLab.goto('http://127.0.0.1:8765/painted-neighbour-lab.html',{waitUntil:'load'});
  await neighbourLab.waitForFunction(()=>window.YangzhouArtV2?.getMaster?.('street-straight:1')?.naturalWidth===1254&&window.YangzhouArtV2?.getMaster?.('street-straight:3')?.naturalWidth===1254,{timeout:30000});
  assert.match(await neighbourLab.locator('#originalStatus').textContent(),/Repainted 1254px street loaded from GitHub/);
  assert.match(await neighbourLab.locator('#neighbourStatus').textContent(),/Independent neighbour loaded from GitHub/);
  assert(Number(await neighbourLab.locator('#edgeDelta').textContent())>=0,'Real two-original edge metric must load');
  assert.match(await neighbourLab.locator('#humanStatus').textContent(),/Not approved/);
  await neighbourLab.screenshot({path:'artifacts/v2/two-original-neighbour-lab.png',fullPage:true});
  await neighbourLab.locator('#neighbourFile').setInputFiles(fileFixture);
  await neighbourLab.waitForFunction(()=>document.getElementById('neighbourStatus')?.textContent.includes('Independent candidate loaded locally'));
  assert(Number(await neighbourLab.locator('#edgeDelta').textContent())>=0,'A temporary different artwork can still be compared');
  await neighbourLab.locator('#clearNeighbour').click();
  assert.match(await neighbourLab.locator('#neighbourStatus').textContent(),/Independent neighbour loaded from GitHub/,'Reset must restore the real committed neighbour');
  await neighbourLab.locator('#zoom').selectOption('3');
  await neighbourLab.screenshot({path:'artifacts/v2/two-original-neighbour-lab-3x.png',fullPage:true});
  await neighbourLab.locator('#neighbourPosition').selectOption('north');
  assert.equal(await neighbourLab.locator('#edgeDelta').textContent(),'—','No invented garden painting allowed');
  await neighbourLab.locator('#neighbourFile').setInputFiles(fileFixture);
  await neighbourLab.waitForFunction(()=>document.getElementById('edgeDelta').textContent!=='—');
  assert.match(await neighbourLab.locator('#geometryStatus').textContent(),/Legal connection \(north\)/);
  await neighbourLab.locator('#neighbourPosition').selectOption('east');
  const sourceFile=fs.readFileSync('assets/v2/street-east-west-repaint.png');
  await neighbourLab.locator('#neighbourFile').setInputFiles({name:'duplicate.png',mimeType:'image/png',buffer:sourceFile});
  await neighbourLab.waitForFunction(()=>document.getElementById('neighbourStatus').textContent.startsWith('Rejected:'));
  assert.match(await neighbourLab.locator('#neighbourStatus').textContent(),/exact copy of the first street painting/);
  assert(Number(await neighbourLab.locator('#edgeDelta').textContent())>=0,'Rejecting a duplicate must leave the committed second original visible');
  const mobileLab=await browser.newPage({viewport:{width:390,height:790},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobileLab.on('pageerror',e=>errors.push('neighbour-mobile: '+String(e)));
  await mobileLab.goto('http://127.0.0.1:8765/painted-neighbour-lab.html',{waitUntil:'load'});
  await mobileLab.waitForFunction(()=>window.YangzhouArtV2?.getMaster?.('street-straight:1')?.naturalWidth===1254&&window.YangzhouArtV2?.getMaster?.('street-straight:3')?.naturalWidth===1254,{timeout:30000});
  await mobileLab.screenshot({path:'artifacts/v2/two-original-neighbour-lab-mobile.png',fullPage:true});

  // Artwork Batch 01: one new complete-square original has been generated;
  // the page must keep missing paintings explicitly pending. Local file
  // previews are technical fixtures only, not finished/new painterly artwork.
  const batchPage=await browser.newPage({viewport:{width:1400,height:950},deviceScaleFactor:1});
  batchPage.on('pageerror',e=>errors.push('art-batch: '+String(e)));
  await batchPage.goto('http://127.0.0.1:8765/tile-art-expansion.html',{waitUntil:'load'});
  await batchPage.waitForFunction(()=>document.querySelectorAll('#gallery .card').length===4 && document.getElementById('boardStatus')?.textContent.includes('4/4 topology joins valid'),{timeout:30000});
  assert.equal(await batchPage.locator('#gallery .card').count(),4);
  const pendingImage=fs.existsSync('assets/v2/street-straight-north-south.png');
  assert.match(await batchPage.locator('#boardStatus').textContent(),new RegExp('New north–south paintings visible: '+(pendingImage?1:0)+'/1'));
  assert.match(await batchPage.locator('#gallery').textContent(),/Composition brief only/);
  assert.match(await batchPage.locator('#state-street-straight-0').textContent(),/Original artwork file loaded from GitHub/);
  assert.equal(await batchPage.locator('#gallery .card').count(),4);
  await batchPage.screenshot({path:'artifacts/v2/next-batch-four-art-slots.png',fullPage:true});
  await batchPage.locator('#gallery .card').first().locator('input[type=file]').setInputFiles(fileFixture);
  await batchPage.waitForFunction(()=>document.getElementById('state-street-straight-0').textContent.includes('Local image preview only'),{timeout:30000});
  assert.match(await batchPage.locator('#boardStatus').textContent(),/New north–south paintings visible: 1\/1/);
  await batchPage.locator('#showPorts').click();
  assert.equal(await batchPage.locator('#showPorts').getAttribute('aria-pressed'),'true');
  await batchPage.locator('#scale').selectOption('3');
  assert.equal(await batchPage.locator('#board').getAttribute('width'),'1320');
  await batchPage.screenshot({path:'artifacts/v2/next-batch-port-guide-and-connection.png',fullPage:true});

  assert.deepEqual(errors,[],'Browser JavaScript errors');
  console.log('Painted pair QA passed: two original 1254px images in correct LSLS slots, mobile/desktop, real 1x/3x seam comparison, gallery, override/restore, duplicate-source rejection.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exit(1)});
