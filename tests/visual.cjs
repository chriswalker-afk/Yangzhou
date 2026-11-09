/* Browser visual QA for the painted Yangzhou proof of concept. */
'use strict';
const { chromium }=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const OUT='artifacts/visual';
fs.mkdirSync(OUT,{recursive:true});
async function main(){
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const errors=[];
  async function visit(page){
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
    await page.waitForFunction(()=>window.YangzhouPainted?.ready()===true,{timeout:25000});
    const size=await page.evaluate(()=>window.YangzhouDebug.board.size);
    assert.equal(size,6,'Six fixed starter tiles should be present');
    const image=await page.locator('#artImage').evaluate(el=>({complete:el.complete,naturalWidth:el.naturalWidth}));
    assert(image.complete&&image.naturalWidth>=1000,'Full-resolution painted image failed to load');
  }
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
    await visit(page);
    await page.click('#explore');
    await page.waitForTimeout(650);
    await page.screenshot({path:OUT+'/desktop-overview.png'});
    await page.click('#viewDetail');
    await page.waitForTimeout(700);
    await page.screenshot({path:OUT+'/desktop-closeup.png'});
    await page.click('#scenes');
    await page.locator('#artDialog').waitFor({state:'visible'});
    await page.screenshot({path:OUT+'/art-gallery.png'});
    await page.click('#artNext');
    assert((await page.locator('#artTitle').innerText()).includes('Five-Pavilion Bridge'),'Next should show bridge detail');
    await page.click('#closePaintings');
    await page.click('#fit');
    await page.waitForTimeout(500);
    await page.click('#explore');
    assert.equal(await page.evaluate(()=>window.YangzhouDebug.state.showSites),true,'Place mode restored');
    // Zoom out to include neighboring candidate spaces, then test an actual canvas click.
    await page.mouse.move(715,450);
    await page.mouse.wheel(0,650);
    await page.waitForTimeout(780);
    const target=await page.evaluate(()=>{
      const g=window.YangzhouDebug,s=g.state;
      for(const [x,y] of g.candidates()){
        const px=(x*220+110)*s.scale+s.offsetX,py=(y*220+110)*s.scale+s.offsetY;
        if(px>60&&px<innerWidth-110&&py>155&&py<innerHeight-170)return {px,py};
      }
      return null;
    });
    assert(target,'At least one candidate should be clickable after zooming out');
    await page.mouse.click(target.px,target.py);
    assert.equal(await page.locator('#place').isDisabled(),false,'Canvas click should select a legal tile');
    await page.click('#place');
    assert.equal(await page.evaluate(()=>window.YangzhouDebug.board.size),7,'Tile placement must still work');
    await page.waitForTimeout(330);
    assert((await page.evaluate(()=>window.YangzhouTileArt?.stats().cached||0))>0,'New tiles must use painted image composites, not procedural fallback');
    await page.screenshot({path:OUT+'/desktop-placement.png'});
    const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await visit(mobile);
    await mobile.click('#explore');
    await mobile.waitForTimeout(600);
    const mobileFrame=await mobile.evaluate(()=>{
      const s=window.YangzhouDebug.state;
      return {fraction:660*s.scale/innerWidth,scale:s.scale};
    });
    assert(mobileFrame.fraction>=.75,'The painted city should use at least 75% of mobile viewport width');
    await mobile.screenshot({path:OUT+'/mobile-overview.png'});
    await mobile.click('#scenes');
    await mobile.locator('#artDialog').waitFor({state:'visible'});
    await mobile.screenshot({path:OUT+'/mobile-gallery.png'});
    assert.equal(errors.length,0,'Page errors: '+errors.join('\n'));
    console.log('Visual QA passed: panorama, detail zoom, artwork gallery, desktop/mobile layout, tile interaction.');
  } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
