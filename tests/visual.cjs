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
    await page.waitForFunction(()=>window.YangzhouLiving?.ready()===true,{timeout:25000});
    const layers=await page.evaluate(()=>window.YangzhouLiving.inspect());
    assert(layers.ready,'Clean layered painted scene should be ready');
    assert(layers.images.clean&&layers.images.bridge&&layers.images.willow,'Background and foreground layers missing');
    assert(layers.images.upper&&layers.images.lower,'Boats must load as separate transparent images');
    assert(layers.images.blue&&layers.images.rose,'Independent resident sprites missing');
    assert.equal(layers.residentCount,3);

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
    // The very same camera must show an unpopulated plate when the life layer is disabled.
    await page.click('#livingToggle');
    assert.equal(await page.evaluate(()=>window.YangzhouLiving.active()),false);
    await page.screenshot({path:OUT+'/clean-plate.png'});
    await page.click('#livingToggle');
    assert.equal(await page.evaluate(()=>window.YangzhouLiving.active()),true);
    await page.screenshot({path:OUT+'/living-plate.png'});
    // Foreground PNGs must be transparent away from painted bridge objects.
    const alpha=await page.evaluate(async()=>{
      const img=new Image();img.src='assets/living/bridge-foreground.png';
      await img.decode();const el=document.createElement('canvas');
      el.width=img.naturalWidth;el.height=img.naturalHeight;let c=el.getContext('2d');
      c.drawImage(img,0,0);return [c.getImageData(10,10,1,1).data[3],
                                      c.getImageData(637,230,1,1).data[3]];
    });
    assert.equal(alpha[0],0,'Bridge foreground must be transparent over blank landscape');
    assert(alpha[1]>0,'Bridge foreground must contain separate painted roof pixels');

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
    assert.equal(await page.evaluate(()=>window.YangzhouTileArt.stats().source),'clean-plate','Placed tiles must use a background without baked-in actors');
    // Actual pixel comparisons across every compatible edge type and
    // orientation: two different underlying paintings must have a tiny
    // measurable seam once their shared boundary aprons are rendered.
    const edges=await page.evaluate(()=>{
      const art=window.YangzhouEdgeArt;
      const result=[];
      if(!art)throw new Error('Shared edge module not loaded');
      for(const type of ['L','S','W']){
        for(const vertical of [false,true]){
          const cv=document.createElement('canvas');
          cv.width=vertical?220:440;cv.height=vertical?440:220;
          const c=cv.getContext('2d');
          c.fillStyle='#c15240';c.fillRect(0,0,vertical?220:220,vertical?220:220);
          c.fillStyle='#3858a4';
          if(vertical)c.fillRect(0,220,220,220);
          else c.fillRect(220,0,220,220);
          const a=vertical?['L','L',type,'L']:['L',type,'L','L'];
          const b=vertical?[type,'L','L','L']:['L','L','L',type];
          art.drawTile(c,{x:0,y:0,edges:a});
          art.drawTile(c,{x:vertical?0:1,y:vertical?1:0,edges:b});
          let total=0,max=0,n=0;
          for(let p=5;p<215;p++){
            const q1=vertical?c.getImageData(p,219,1,1).data:c.getImageData(219,p,1,1).data;
            const q2=vertical?c.getImageData(p,220,1,1).data:c.getImageData(220,p,1,1).data;
            const d=Math.max(Math.abs(q1[0]-q2[0]),Math.abs(q1[1]-q2[1]),Math.abs(q1[2]-q2[2]));
            total+=d;max=Math.max(max,d);n++;
          }
          result.push({type,vertical,mean:total/n,max});
        }
      }
      return result;
    });
    for(const item of edges){
      assert(item.mean<14,'High visible paint seam for '+JSON.stringify(item));
      assert(item.max<70,'Hard discontinuity at edge for '+JSON.stringify(item));
    }
    console.log('Tileable painted edges (horizontal/vertical, L/S/W):',edges);

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
