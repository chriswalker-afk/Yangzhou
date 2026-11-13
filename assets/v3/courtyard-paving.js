/* Yangzhou V3 — Layer 1B enclosed courtyard paving candidate.
 * Original user-generated Jiangnan painting, independently SHA-256 verified.
 * This paints a world-aligned repeating GROUND SURFACE under Layer 2 hall
 * and wall geometry. It never redefines Layer 1A street/canal mouths or
 * paints open gardens as walled courtyards. Candidate only (visual seam QA).
 */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.YangzhouV3CourtyardPaving=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const EPS=1e-7, TILE=220;
const ASSET=Object.freeze({
 id:'courtyard-paving-01',
 title:'Yangzhou V3 Courtyard Paving Texture 01',
 path:'assets/v3/materials/courtyard-paving-01.webp',
 width:1254,height:1254,bytes:682158,
 sha256:'fc7f03b7f047295ac0e1de8d7872d5f143874bc506c4b9d9bbd39a324da4a083',
 sourcePngSha256:'5eca68db68132e8f1350da2ac40f1546b37b37bcaa0c80cf623e736e5551f74e',
 worldPeriod:96,layer:'1B',status:'candidate-for-visual-review',productionApproved:false
});
const hex=buffer=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
async function decode(blob){
 if(typeof createImageBitmap==='function')return await createImageBitmap(blob);
 return await new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(blob),image=new Image();
  image.onload=()=>{URL.revokeObjectURL(url);resolve(image);};
  image.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Paving WebP decode failed'));};
  image.src=url;
 });
}
async function verify(blob){
 if(!blob||blob.size!==ASSET.bytes)throw Error('Paving bytes do not match the committed original WebP');
 if(typeof crypto==='undefined'||!crypto.subtle)throw Error('Paving SHA-256 verification requires HTTPS or localhost');
 const digest=hex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
 if(digest!==ASSET.sha256)throw Error('Paving painting SHA-256 mismatch');
 const image=await decode(blob);
 if(image.width!==ASSET.width||image.height!==ASSET.height)
  throw Error('Paving dimensions mismatch: expected '+ASSET.width+' × '+ASSET.height);
 return image;
}
async function load(options={}){
 const duration=options.timeoutMs||20000;
 const urls=[ASSET.path,
  'https://raw.githubusercontent.com/chriswalker-afk/Yangzhou/main/'+ASSET.path];
 const failures=[];
 for(const url of urls){
  const controller=typeof AbortController!=='undefined'?new AbortController():null;
  let timer;
  try{
   const signal=controller?.signal;
   const blob=await Promise.race([
    fetch(url,{cache:'no-store',...(signal?{signal}:{})}).then(r=>{
     if(!r.ok)throw Error('HTTP '+r.status);
     return r.blob();
    }),
    new Promise((_,reject)=>{
     timer=setTimeout(()=>{
      controller?.abort();
      reject(Error('Paving artwork request timed out'));
     },duration);
    })
   ]);
   clearTimeout(timer);
   return await verify(blob);
  }catch(error){
   clearTimeout(timer);failures.push(url+': '+String(error.message||error));
  }
 }
 throw Error(failures.join(' | '));
}
// The region comes from the actual CLOSED rectangle wall centreline, not from
// a painted mask or a guessed screen-space box. Other templates remain grass
// until they have their own deliberately authored courtyard surface polygons.
function regionFor(model){
 if(!model||model.id!=='rectangle')return null;
 const path=model.paths?.find(p=>p.id==='perimeter');
 const pts=path?.points;
 if(!pts||pts.length!==5)return null;
 if(Math.hypot(pts[0][0]-pts[4][0],pts[0][1]-pts[4][1])>EPS)return null;
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
 const minX=Math.min(...xs),maxX=Math.max(...xs);
 const minY=Math.min(...ys),maxY=Math.max(...ys);
 if(!(minX>=10&&maxX<=TILE-10&&minY>=10&&maxY<=TILE-10))return null;
 const corners=new Set(pts.slice(0,-1).map(p=>p.join(',')));
 if(corners.size!==4||
  ![[minX,minY],[maxX,minY],[maxX,maxY],[minX,maxY]].every(p=>corners.has(p.join(','))))
  return null;
 return Object.freeze({x:minX,y:minY,width:maxX-minX,height:maxY-minY,
  shape:'orthogonal-enclosure-interior',source:'rectangle-wall-centreline'});
}
function paint(ctx,tile,model,image,options={}){
 const region=regionFor(model);
 if(!region)return Object.freeze({drawn:false,reason:'no-enclosed-region'});
 if(options.valid!==true)return Object.freeze({drawn:false,reason:'wall-audit-not-valid'});
 if(!image)return Object.freeze({drawn:false,reason:'painting-not-loaded'});
 if(!(image.width||image.naturalWidth)||!(image.height||image.naturalHeight))
  throw Error('Paving image must be decoded');
 const ox=tile.x*TILE,oy=tile.y*TILE,period=ASSET.worldPeriod;
 const left=ox+region.x,top=oy+region.y;
 const right=left+region.width,bottom=top+region.height;
 let repeats=0;
 ctx.save();
 ctx.beginPath();ctx.rect(left,top,region.width,region.height);ctx.clip();
 // Paint phase aligned to WORLD coordinates. Adjacent tile surface regions
 // reuse exactly the same phase rather than independently starting at 0.
 const startX=Math.floor(left/period)*period;
 const startY=Math.floor(top/period)*period;
 for(let x=startX;x<right-EPS;x+=period)
  for(let y=startY;y<bottom-EPS;y+=period){
   ctx.drawImage(image,x,y,period,period);repeats++;
  }
 ctx.restore();
 return Object.freeze({drawn:true,layer:'1B',region,worldPeriod:period,repeats});
}
// A 2×2 sample reveals source edge repeats at both axes; it is a diagnostic
// for visual seam approval, not a fake synthesized seamless replacement.
function repeatProof(ctx,image,size=360){
 if(!image)return false;
 const n=size/2;
 ctx.save();ctx.clearRect(0,0,size,size);
 for(let y=0;y<2;y++)for(let x=0;x<2;x++)
  ctx.drawImage(image,x*n,y*n,n,n);
 ctx.restore();
 return true;
}
return Object.freeze({ASSET,TILE,regionFor,verify,load,paint,repeatProof});
});