/* Six individually loaded square, orthographic concept paintings.
 * Shared world-space geometry guarantees exact pixel-continuous joins.
 * This is a concept prototype, not the final hand-painted asset set.
 */
(() => {
 'use strict';
 const S=220, WIDTH=660, HEIGHT=440;
 const svg=(x,y)=>{
 const trees=[];
 function rand(a){let n=Math.sin(a*12.9898+41.33)*43758.5453;return n-Math.floor(n)}
 for(let i=0;i<170;i++){
  const px=rand(i*3+1)*660,py=rand(i*3+2)*440;
  // Keep a broad navigable water corridor and the central bridge clear.
  const bank=330+54*Math.sin(py/89)+20*Math.sin(py/37);
  if(Math.abs(px-bank)<(py<220?76:90)|| (py>288&&py<364&&px>180&&px<485))continue;
  const r=7+rand(i*7)*13;
  trees.push('<g opacity=".94"><ellipse cx="'+px.toFixed(2)+'" cy="'+(py+3).toFixed(2)+'" rx="'+(r*.8).toFixed(2)+'" ry="'+(r*.56).toFixed(2)+'" fill="#637c5b" opacity=".25"/><circle cx="'+px.toFixed(2)+'" cy="'+py.toFixed(2)+'" r="'+r.toFixed(2)+'" fill="'+(['#8da879','#a5b98b','#698d6d','#c5b28e','#d9a8a2'][i%5])+'" stroke="#647f65" stroke-width=".65"/><circle cx="'+(px-r*.23).toFixed(2)+'" cy="'+(py-r*.2).toFixed(2)+'" r="'+(r*.46).toFixed(2)+'" fill="#d6d4aa" opacity=".38"/></g>');
 }
 const flowers=[];for(let i=0;i<150;i++){const px=rand(i*5+23)*660,py=rand(i*5+24)*440;const bank=330+54*Math.sin(py/89)+20*Math.sin(py/37);if(Math.abs(px-bank)<70)continue;flowers.push('<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="'+(1+rand(i*9)*2).toFixed(1)+'" fill="'+(i%3?'#e5b3ad':'#f4e7ce')+'" opacity=".85"/>')}
 const waterPath='M 286 0 C 266 38 237 88 265 143 C 298 193 263 226 242 273 C 225 333 268 388 286 440 L 374 440 C 424 400 445 351 419 292 C 394 248 390 212 419 159 C 449 93 416 39 374 0 Z';
 const pavilions=(cx,cy,size)=>'<g transform="translate('+cx+' '+cy+') scale('+size+')"><rect x="-18" y="-13" width="36" height="26" rx="2" fill="#d6c5a5" stroke="#826b54" stroke-width="2"/><path d="M-25 -14 L0 -29 L25 -14 L16 -7 L-16 -7 Z" fill="#566f6d" stroke="#354b4b" stroke-width="2"/><path d="M-18 14 L0 23 L18 14" fill="none" stroke="#a58b65" stroke-width="3"/><path d="M-12 -7 V12 M12 -7 V12" stroke="#a4604a" stroke-width="3"/></g>';
 const bridge='<g><path d="M 210 329 C 265 317 290 319 330 324 C 378 330 410 321 450 326" fill="none" stroke="#687b73" stroke-width="59"/><path d="M 210 329 C 265 317 290 319 330 324 C 378 330 410 321 450 326" fill="none" stroke="#e7d6b4" stroke-width="48"/><path d="M 210 329 C 265 317 290 319 330 324 C 378 330 410 321 450 326" fill="none" stroke="#a38e6f" stroke-width="1.5" stroke-dasharray="5 7"/><path d="M 210 304 C 265 292 290 294 330 299 C 378 305 410 296 450 301 M 210 354 C 265 342 290 344 330 349 C 378 355 410 346 450 351" fill="none" stroke="#f7eed5" stroke-width="4"/>'+[245,287,330,373,415].map(cx=>pavilions(cx,326,.58)).join('')+'</g>';
 const path='<path d="M 210 329 C 166 323 153 350 120 366 C 94 379 64 382 30 404 M 450 326 C 491 326 505 353 542 357 C 577 363 594 384 624 405" stroke="#98836b" stroke-width="24" fill="none"/><path d="M 210 329 C 166 323 153 350 120 366 C 94 379 64 382 30 404 M 450 326 C 491 326 505 353 542 357 C 577 363 594 384 624 405" stroke="#d6c6a6" stroke-width="19" fill="none" stroke-dasharray="1 3"/>';
 const pagoda='<g transform="translate(79 316)"><ellipse rx="33" ry="18" cy="21" fill="#9b9985" opacity=".4"/><path d="M-18 19 C-24 5 -15 -3 -10 -12 C-5 -20 -5 -27 -4 -31 L4 -31 C5 -27 5 -20 10 -12 C15 -3 24 5 18 19Z" fill="#f5f0df" stroke="#8c9081" stroke-width="2"/><path d="M-25 20 H25 V27 H-25Z" fill="#ddd1b6" stroke="#92826b" stroke-width="2"/><path d="M0 -31 V-44" stroke="#ad9462" stroke-width="3"/><circle cy="-45" r="3" fill="#c9ad64"/></g>';
 const lakeRings=Array.from({length:90},(_,i)=>{let py=rand(i*17+2)*440,px=330+54*Math.sin(py/89)+20*Math.sin(py/37)+(rand(i*17+4)-.5)*80;return '<path d="M'+(px-6).toFixed(1)+' '+py.toFixed(1)+' q 6 -2 12 0" fill="none" stroke="#d5e2c9" opacity=".38" stroke-width=".8"/>'}).join('');
 const whole='<defs><pattern id="paper" width="19" height="19" patternUnits="userSpaceOnUse"><path d="M0 12 L5 10 M10 4 L15 2" stroke="#b2bca2" opacity=".19" stroke-width=".6"/></pattern></defs><rect width="660" height="440" fill="#a8b78d"/><rect width="660" height="440" fill="url(#paper)"/><path d="'+waterPath+'" fill="#7eaca8" stroke="#d3d0aa" stroke-width="5"/>'+lakeRings+trees.join('')+flowers.join('')+path+bridge+pagoda+pavilions(552,90,1.3)+pavilions(117,113,1.1)+'<g transform="translate(556 367)"><rect x="-30" y="-22" width="60" height="44" fill="#e9dfc5" stroke="#a59073" stroke-width="3"/><path d="M-37 -23 L0 -43 L37 -23 L29 -12 L-29 -12 Z" fill="#526a64" stroke="#384f4a" stroke-width="2"/></g>';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="'+(x*220)+' '+(y*220)+' 220 220"><g>'+whole+'</g></svg>';
 };
 const files={};
 for(let y=0;y<2;y++)for(let x=0;x<3;x++)files[x+','+y]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(x,y));
 const imgs={};for(const [key,src] of Object.entries(files)){const im=new Image();im.src=src;im.onload=()=>{window.YangzhouTiles?.clear();if(window.YangzhouDebug?.state)window.YangzhouDebug.state.dirty=true;};imgs[key]=im;}
 window.YangzhouOrthographic={
  draw:(c,t)=>{const im=imgs[t.x+','+t.y];if(!t.fixed||!im?.complete||!im.naturalWidth)return false;c.drawImage(im,0,0,220,220);return true;},
  ready:()=>Object.values(imgs).every(im=>im.complete&&im.naturalWidth),
  description:'Orthographic six-tile concept with globally continuous terrain, no feathering'
 };
})();