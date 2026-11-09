/* Yangzhou · Painted scene atlas and close-inspection gallery.
   Original generated artwork supplied in this project, optimized as local WebP files.
   Paintings are evocative reconstructions, not historically verified documentary images.
   No CDN links, signed URLs or dependencies. */
(() => {
  'use strict';
  const ROOT='assets/painted/';
  const WIDTH=660, HEIGHT=440;
  const descriptions={
    panorama:{src:'starter-panorama.webp',title:'Slender West Lake',subtitle:'The city as a living handscroll',description:'A connected landscape of waterside gardens, the Five-Pavilion Bridge, a white stupa, tea houses, willow banks and everyday lives. This is the six-tile starting scene.'},
    bridge:{src:'five-pavilion-bridge.webp',title:'Five-Pavilion Bridge · 五亭桥',subtitle:'A landmark above the lake',description:'Five pavilion roofs punctuate the waterway. Observe the carved balustrades, passengers, willow branches and the movement of the lake beneath the bridge.'},
    breakfast:{src:'canal-breakfast.webp',title:'A leisurely breakfast · 早茶',subtitle:'Daily life beside the water',description:'Tables of tea and small dishes, a working steamer, passengers arriving by boat and the little details of a relaxed morning.'},
    pagoda:{src:'white-pagoda-garden.webp',title:'White Pagoda Garden · 白塔',subtitle:'Quiet paths among rockeries',description:'The white, bottle-shaped stupa provides a distinctive centrepiece among classical garden pavilions, trees and winding paths.'}
  };
  const images={};let readyCount=0;
  function load(){if(typeof Image==='undefined')return;
    for(const [k,v] of Object.entries(descriptions)){
      const img=new Image();img.decoding='async';
      img.addEventListener('load',()=>{images[k]=img;readyCount++;const state=window.YangzhouDebug?.state;if(state)state.dirty=true;
        const status=document.getElementById('assetStatus');if(status)status.textContent=readyCount===4?'Painted artwork ready':`Paintings ${readyCount}/4`;
      });
      img.addEventListener('error',()=>{const s=document.getElementById('assetStatus');if(s)s.textContent='Artwork unavailable · using illustrated fallback';});
      img.src=ROOT+v.src;
    }
  }
  function drawStarterAtlas(c,time){const img=images.panorama;
    if(!img)return false;
    c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    // One draw for six starter tiles: unlike six independent images this cannot show seams.
    c.drawImage(img,0,0,WIDTH,HEIGHT);
    if(window.YangzhouDebug?.state.motion){
      c.save();c.lineWidth=.7;
      for(let i=0;i<7;i++){
        const x=351+Math.sin(time*.0005+i*2.1)*26;
        const y=36+((time*.012+i*59)%370);
        c.strokeStyle='rgba(245,234,201,.18)';c.beginPath();c.ellipse(x,y,5+i%3*3,1.2,-.1,0,Math.PI);c.stroke();
      }
      // Subtle wind-drawn willow fronds near the pagoda and canal-side breakfast house.
      for(const [x,y,phase] of [[133,292,1],[550,315,3]]){
        c.strokeStyle='rgba(112,140,104,.18)';
        for(let j=0;j<4;j++){
          const sway=Math.sin(time*.0007+j+phase)*2.7;
          c.beginPath();c.moveTo(x+j*5,y-14);c.quadraticCurveTo(x+j*5+sway,y+1,x+j*5+sway*2,y+22);c.stroke();
        }
      }
      c.restore();
    }
    c.restore();return true;
  }
  function imageFor(kind){return kind==='tea'||kind==='market'?'breakfast':kind==='bridge'?'bridge':kind==='garden'||kind==='court'||kind==='pagoda'?'pagoda':null;}
  const motifCache=new Map();
  function motif(kind){const id=imageFor(kind),img=id&&images[id];if(!img||typeof document==='undefined')return null;
    if(motifCache.has(id))return motifCache.get(id);
    const canvas=document.createElement('canvas');canvas.width=400;canvas.height=400;
    const c=canvas.getContext('2d');if(!c)return null;
    // Keep the center sharp; avoid placing fixed path/shoreline boundaries from the source inside new connections.
    const sourceSquare=Math.min(img.naturalWidth||img.width,img.naturalHeight||img.height);
    const sx=((img.naturalWidth||img.width)-sourceSquare)*.5;
    const sy=((img.naturalHeight||img.height)-sourceSquare)*.5;
    c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    c.drawImage(img,sx,sy,sourceSquare,sourceSquare,0,0,400,400);
    c.globalCompositeOperation='destination-in';
    const fade=c.createRadialGradient(200,200,55,200,200,205);
    fade.addColorStop(0,'rgba(0,0,0,.92)');fade.addColorStop(.66,'rgba(0,0,0,.88)');fade.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=fade;c.fillRect(0,0,400,400);
    motifCache.set(id,canvas);return canvas;
  }
  function drawMotif(c,t){if(t.fixed)return false;
    const x=t.kind==='bridge'?36:38,y=t.kind==='bridge'?31:27;
    const m=motif(t.kind);if(!m)return false;
    c.save();c.globalAlpha=.77;
    // Leave >=30px unpainted around edges, preserving consistent game connector geometry.
    c.drawImage(m,x,y,220-x*2,220-y*2);
    c.restore();return true;
  }
  const scenes=['panorama','bridge','breakfast','pagoda'];let current='panorama';
  function open(kind){const dialog=document.getElementById('artDialog');if(!dialog)return;
    current=descriptions[kind]?kind:'panorama';
    const s=descriptions[current];const img=document.getElementById('artImage');
    if(img){img.src=ROOT+s.src;img.alt=s.description;}
    const title=document.getElementById('artTitle');if(title)title.textContent=s.title;
    const subtitle=document.getElementById('artSubtitle');if(subtitle)subtitle.textContent=s.subtitle;
    const summary=document.getElementById('artDescription');if(summary)summary.textContent=s.description;
    const count=document.getElementById('artCount');if(count)count.textContent=`${scenes.indexOf(current)+1} / ${scenes.length}`;
    if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();else dialog.setAttribute('open','');
    const state=window.YangzhouDebug?.state;if(state)state.dirty=true;
  }
  function close(){const dialog=document.getElementById('artDialog');if(!dialog)return;
    if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');
  }
  function next(delta){open(scenes[(scenes.indexOf(current)+delta+scenes.length)%scenes.length]);}
  function sceneForTile(t){if(!t)return 'panorama';
    if(t.kind==='five'||t.kind==='bridge')return 'bridge';
    if(t.kind==='pagoda'||t.kind==='garden'||t.kind==='court')return 'pagoda';
    if(t.kind==='tea'||t.kind==='market'||t.kind==='landing')return 'breakfast';
    return 'panorama';
  }
  window.YangzhouPainted={drawStarterAtlas,drawMotif,open,close,sceneForTile,ready:()=>!!images.panorama,getImage:key=>images[key]||null,manifest:descriptions};
  function bind(){
    document.getElementById('scenes')?.addEventListener('click',()=>open('panorama'));
    document.getElementById('closePaintings')?.addEventListener('click',close);
    document.getElementById('artPrevious')?.addEventListener('click',()=>next(-1));
    document.getElementById('artNext')?.addEventListener('click',()=>next(1));
    document.getElementById('artDialog')?.addEventListener('click',e=>{if(e.target?.id==='artDialog')close();});
    document.getElementById('artDialog')?.addEventListener('keydown',e=>{
      if(e.key==='ArrowRight'){e.preventDefault();next(1);}else if(e.key==='ArrowLeft'){e.preventDefault();next(-1);}
    });
    load();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();