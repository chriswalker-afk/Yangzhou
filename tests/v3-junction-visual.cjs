'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
fs.mkdirSync('artifacts/v3',{recursive:true});

// The exact regression: with all original painted banks on, every pixel in
// the UNION of canal-water cores must match the same scene with edges off.
// This is stronger than testing a few hand-picked points and catches thin
// tan lines drawn by a different canal arm through the T-junction mouth.
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push('desktop '+e.message));
  await page.goto('http://127.0.0.1:8765/layer-lab-v3.html',{waitUntil:'load'});
  await page.waitForFunction(()=>
    document.querySelector('#status')?.textContent.includes('All three texture candidates loaded') &&
    document.querySelector('#bankStatus')?.textContent.includes('committed candidate image loaded from GitHub') &&
    document.querySelector('#vergeStatus')?.textContent.includes('committed candidate image loaded from GitHub'),
    {timeout:30000});
  assert.match(await page.locator('h1').textContent(),/rev 25/);

  // Draw an independently computed water union from actual topology and
  // core ribbons. This mask is not inferred from image colours; transparent
  // parts of the source artwork cannot make the test falsely pass.
  async function assertCanalCoreUnchanged(study,codes){
    await page.locator('#sceneChoice').selectOption(study);
    const maskCount=await page.evaluate(({codes})=>{
      const canvas=document.getElementById('scene');
      const scale=canvas.width/660;
      const ctx=canvas.getContext('2d');
      window.__junctionBefore=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      const mask=document.createElement('canvas');
      mask.width=canvas.width;mask.height=canvas.height;
      const mctx=mask.getContext('2d',{willReadFrequently:true});
      mctx.setTransform(scale,0,0,scale,0,0);
      const geom=window.YangzhouV3Geometry,edges=window.YangzhouV3Edges;
      codes.forEach((signature,i)=>{
        const compiled=edges.compile(geom.compile(signature.split('')));
        const x=(i%3)*220,y=Math.floor(i/3)*220;
        for(const water of compiled.traces.filter(t=>t.material==='W')){
          edges.fillRibbon(mctx,water,'core','#fff',x,y);
        }
      });
      window.__junctionMask=mctx.getImageData(0,0,mask.width,mask.height).data;
      let count=0;for(let i=3;i<window.__junctionMask.length;i+=4){
        if(window.__junctionMask[i]===255)count++;
      }
      return count;
    },{codes});
    assert(maskCount>40000,'Water-core mask must cover large continuous region for '+study);
    if(study==='canal-junction'){
      await page.screenshot({path:'artifacts/v3/canal-t-junction-land-clipped-painted.png',fullPage:true});
    }
    await page.locator('#edges').click();
    assert.equal(await page.locator('#edges').getAttribute('aria-pressed'),'false');
    const comparison=await page.evaluate(()=>{
      const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');
      const after=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      const before=window.__junctionBefore,mask=window.__junctionMask;
      let damaged=0,first=null;
      for(let i=0;i<mask.length;i+=4){
        if(mask[i+3]!==255)continue;
        if(after[i]!==before[i]||after[i+1]!==before[i+1]||after[i+2]!==before[i+2]){
          damaged++;
          if(!first){
            const pix=i/4;
            first={x:(pix%canvas.width)/3,y:Math.floor(pix/canvas.width)/3,
              before:[...before.slice(i,i+4)],after:[...after.slice(i,i+4)]};
          }
        }
      }
      // A visible bank must still exist OUTSIDE the water, on land near the
      // T-junction branch (x286 left water edge, 4-unit land-side bank).
      function pixel(x,y){
        const index=(Math.round(y*3)*canvas.width+Math.round(x*3))*4;
        return Array.from(after.slice(index,index+4));
      }
      const offLand=pixel(284,195);
      const old=window.__junctionBefore;
      const landIndex=(Math.round(195*3)*canvas.width+Math.round(284*3))*4;
      const onLand=Array.from(old.slice(landIndex,landIndex+4));
      return {damaged,first,offLand,onLand};
    });
    assert.equal(comparison.damaged,0,
      study+': canal-bank pixels must NEVER overlap the union of water-core arms; first mismatch '+
      JSON.stringify(comparison.first));
    if(study==='canal-junction'){
      assert.notDeepEqual(comparison.onLand,comparison.offLand,
        'Do not fix junction by removing all bank treatments; land-side branch bank must stay visible');
      await page.screenshot({path:'artifacts/v3/canal-t-junction-no-banks.png',fullPage:true});
    }
    await page.locator('#edges').click();
    assert.equal(await page.locator('#edges').getAttribute('aria-pressed'),'true');
    console.log(study+': water union preserved at '+maskCount+' fully covered canvas pixels');
  }

  await assertCanalCoreUnchanged('canal-junction',
    ['LWLW','LWWW','LWLW','LLLL','WLLL','LLLL']);
  await assertCanalCoreUnchanged('joined',
    ['LSLS','LSLS','LSLS','LWLW','LWLW','LWLW']);
  await assertCanalCoreUnchanged('canal-bend',
    ['LWLW','WLLW','LLLL','LLLL','LLLL','LLLL']);

  // Bridge retains its deck above the water; the painted bank toggle alone
  // may not change stone at the crossing centre.
  await page.locator('#sceneChoice').selectOption('bridge');
  await page.screenshot({path:'artifacts/v3/canal-bridge-banks-preserved.png',fullPage:true});
  const bridgeCentre=()=>page.evaluate(()=>{
    const c=document.getElementById('scene'),ctx=c.getContext('2d');
    const i=(Math.round(110*3)*c.width+Math.round(330*3))*4;
    return Array.from(ctx.getImageData(0,0,c.width,c.height).data.slice(i,i+4));
  });
  const beforeBridge=await bridgeCentre();
  await page.locator('#paintedBank').click();
  assert.deepEqual(await bridgeCentre(),beforeBridge,'Bridge deck must cover all bank artwork');
  await page.locator('#paintedBank').click();

  await page.locator('#sceneChoice').selectOption('canal-junction');
  await page.locator('#zoom').click();
  assert.equal(await page.locator('#scene').evaluate(x=>x.style.width),'1980px');
  await page.screenshot({path:'artifacts/v3/canal-t-junction-land-clipped-3x.png',fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:800},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile '+e.message));
  await mobile.goto('http://127.0.0.1:8765/layer-lab-v3.html',{waitUntil:'load'});
  await mobile.waitForFunction(()=>
    document.querySelector('#bankStatus')?.textContent.includes('committed candidate image loaded from GitHub'),
    {timeout:30000});
  await mobile.locator('#sceneChoice').selectOption('canal-junction');
  await mobile.screenshot({path:'artifacts/v3/canal-t-junction-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'V3 lab must have no desktop/mobile JavaScript errors');
  console.log('V3 canal-bank junction regression passed: exact water union protected in T, straight, bend, bridge and mobile.');
 }finally{await browser.close();}
}
run().catch(err=>{console.error(err);process.exitCode=1;});
