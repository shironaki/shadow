'use strict';
/*
 * SHADOW ASCENSION — World Presentation v0.15
 * 2D isometric only. No gameplay ownership: this layer makes the existing grid read as
 * connected floor + solid wall architecture, with mobile-safe presentation effects.
 */
(function(){
  const TAG='[WorldPresentation]';
  let baseRender=null,basePrerender=null,installed=false,lastMapCanvas=null,t=0;
  const get=n=>{try{return globalThis.eval(n)}catch(_){return undefined}};
  const setGlobal=(n,v)=>{try{globalThis.eval(n+'='+v);return true}catch(_){return false}};
  const finite=(n,d=0)=>Number.isFinite(n)?n:d;
  const hash=(x,y,s=0)=>{let n=(x*374761393+y*668265263+s*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967295};
  const path=(c,p)=>{c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath()};

  function wallFace(c,a,b,h,top,bottom){
    const p=[a,b,[b[0],b[1]+h],[a[0],a[1]+h]];
    const g=c.createLinearGradient(a[0],a[1],a[0],a[1]+h);g.addColorStop(0,top);g.addColorStop(.2,bottom);g.addColorStop(1,'rgba(4,5,12,.82)');
    path(c,p);c.fillStyle=g;c.fill();
    c.strokeStyle='rgba(0,0,0,.72)';c.lineWidth=1.25;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(a[0],a[1]+h);c.lineTo(b[0],b[1]+h);c.stroke();
    c.strokeStyle='rgba(255,255,255,.10)';c.lineWidth=.8;c.beginPath();c.moveTo(a[0]+1,a[1]+2);c.lineTo(b[0]-1,b[1]+2);c.stroke();
    c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.7;
    for(let yy=7;yy<h;yy+=7){c.beginPath();c.moveTo(a[0],a[1]+yy);c.lineTo(b[0],b[1]+yy);c.stroke()}
  }

  function decorateMap(){
    const M=get('M');if(!M||!M.cv||M.cv===lastMapCanvas||!M.grid)return;
    lastMapCanvas=M.cv;const c=M.cv.getContext('2d');if(!c)return;
    const OX=finite(M.OX),OY=finite(M.OY,40),W=M.W|0,H=M.H|0;
    const ix=(x,y)=>(x-y)*32+OX,iy=(x,y)=>(x+y)*16+OY;
    const open=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&!!M.grid[y*W+x];
    const G=get('G'),hub=!G||G.gateDiff===undefined||G.gateDiff>=9999;
    const wallH=hub?22:18;

    // Floor seam / material detail.
    c.save();c.lineJoin='round';
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(!open(x,y))continue;const sx=ix(x+.5,y+.5),sy=iy(x+.5,y+.5),q=hash(x,y,11);
      const top=[sx,sy-16],right=[sx+32,sy],bottom=[sx,sy+16],left=[sx-32,sy];
      c.strokeStyle=q>.5?'rgba(255,255,255,.11)':'rgba(255,255,255,.07)';c.lineWidth=1;
      c.beginPath();c.moveTo(left[0]+2,left[1]);c.lineTo(top[0],top[1]+2);c.lineTo(right[0]-2,right[1]);c.stroke();
      c.strokeStyle='rgba(0,0,0,.22)';c.beginPath();c.moveTo(right[0]-2,right[1]);c.lineTo(bottom[0],bottom[1]-2);c.lineTo(left[0]+2,left[1]);c.stroke();
      if(q>.70){c.fillStyle='rgba(8,8,18,.055)';c.beginPath();c.ellipse(sx,sy,11+q*7,3+q*2,hash(x,y,12)*Math.PI,0,Math.PI*2);c.fill()}
    }
    c.restore();

    // Solid vertical walls joined directly to every blocked border of the floor.
    c.save();c.lineJoin='round';
    for(let sum=0;sum<=W+H-2;sum++)for(let y=0;y<H;y++){
      const x=sum-y;if(x<0||x>=W||!open(x,y))continue;
      const sx=ix(x+.5,y+.5),sy=iy(x+.5,y+.5),top=[sx,sy-16],right=[sx+32,sy],bottom=[sx,sy+16],left=[sx-32,sy];
      const edges=[
        [!open(x,y-1),left,top,'rgba(98,86,140,.95)','rgba(34,30,57,.98)'],
        [!open(x+1,y),top,right,'rgba(80,70,114,.92)','rgba(26,24,45,.98)'],
        [!open(x,y+1),right,bottom,'rgba(58,50,86,.94)','rgba(19,18,34,.99)'],
        [!open(x-1,y),bottom,left,'rgba(48,42,72,.94)','rgba(15,15,29,.99)']
      ];
      for(const [yes,a,b,tc,bc] of edges)if(yes)wallFace(c,a,b,wallH,tc,bc);
    }
    c.restore();

    // Crisp cap at the exact floor/wall seam.
    c.save();c.lineCap='round';c.lineWidth=1.8;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(open(x,y)){
      const sx=ix(x+.5,y+.5),sy=iy(x+.5,y+.5),top=[sx,sy-16],right=[sx+32,sy],bottom=[sx,sy+16],left=[sx-32,sy];
      for(const [yes,a,b] of [[!open(x,y-1),left,top],[!open(x+1,y),top,right],[!open(x,y+1),right,bottom],[!open(x-1,y),bottom,left]])if(yes){c.strokeStyle='rgba(215,205,255,.24)';c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()}
    }
    c.restore();

    // Room hierarchy and hub plaza dressing; these are visual only and sit on open cells.
    c.save();
    for(const r of(Array.isArray(M.rooms)?M.rooms:[])){if(!r)continue;const sx=ix(r.cx,r.cy),sy=iy(r.cx,r.cy);c.globalAlpha=.22;c.lineWidth=1;c.strokeStyle='rgba(220,215,255,.35)';c.beginPath();c.ellipse(sx,sy,Math.max(24,r.w*12.5),Math.max(13,r.h*6),0,0,Math.PI*2);c.stroke();if(hub){c.globalAlpha=.09;c.fillStyle='rgba(170,150,255,.22)';c.beginPath();c.ellipse(sx,sy,Math.max(18,r.w*10),Math.max(9,r.h*5),0,0,Math.PI*2);c.fill()}}
    c.restore();

    c.save();c.globalAlpha=.28;c.lineWidth=.8;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(open(x,y)&&hash(x,y,40)>.80){const sx=ix(x+.5,y+.5),sy=iy(x+.5,y+.5),q=hash(x,y,41);c.strokeStyle=q>.6?'rgba(0,0,0,.28)':'rgba(255,255,255,.13)';c.beginPath();c.moveTo(sx-8,sy);c.lineTo(sx-2,sy+1);c.lineTo(sx+4,sy-2);c.lineTo(sx+9,sy);c.stroke()}
    c.restore();

    if(hub&&Array.isArray(M.rooms)&&M.rooms[0]){
      const r=M.rooms[0],corners=[[r.x+2,r.y+2],[r.x+r.w-3,r.y+2],[r.x+2,r.y+r.h-3],[r.x+r.w-3,r.y+r.h-3]];c.save();
      for(let i=0;i<corners.length;i++){const [gx,gy]=corners[i],q=worldPoint(gx+.5,gy+.5,OX,OY);c.fillStyle='rgba(5,5,15,.5)';c.beginPath();c.ellipse(q.x,q.y+2,10,5,0,0,Math.PI*2);c.fill();c.fillStyle='rgba(35,31,58,.95)';c.beginPath();c.moveTo(q.x-6,q.y);c.lineTo(q.x,q.y-12);c.lineTo(q.x+6,q.y);c.lineTo(q.x,q.y+4);c.closePath();c.fill();c.strokeStyle=i===0?'rgba(192,132,252,.48)':'rgba(148,163,184,.24)';c.lineWidth=1.2;c.beginPath();c.moveTo(q.x,q.y-11);c.lineTo(q.x,q.y-2);c.stroke()}
      c.restore();
    }

    const w=M.cw||M.cv.width,h=M.ch||M.cv.height;c.save();const v=c.createRadialGradient(w/2,h*.46,Math.min(w,h)*.16,w/2,h*.46,Math.max(w,h)*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.74,'rgba(0,0,0,.035)');v.addColorStop(1,'rgba(0,0,0,.30)');c.fillStyle=v;c.fillRect(0,0,w,h);c.restore();
  }

  function worldPoint(x,y,OX,OY){return{x:(x-y)*32+OX,y:(x+y)*16+OY}}
  function worldToScreen(x,y){
    const G=get('G'),M=get('M'),vw=finite(get('vw')),vh=finite(get('vh'));if(!G||!M||!vw||!vh)return null;
    const z=get('zscale'),VS=typeof z==='function'?z():1,cam=G.cam||{x:G.player?.x||0,y:G.player?.y||0};
    const csx=(cam.x-cam.y)*32+(M.OX||0),csy=(cam.x+cam.y)*16+(M.OY||40);
    return{x:((x-y)*32+(M.OX||0)-csx)*VS+vw/2,y:((x+y)*16+(M.OY||40)-csy)*VS+vh/2,s:VS}
  }
  function glow(x,y,r,a){const c=get('ctx'),q=worldToScreen(x,y);if(!c||!q)return;const R=r*q.s,g=c.createRadialGradient(q.x,q.y,0,q.x,q.y,R);g.addColorStop(0,'rgba(220,205,255,'+a+')');g.addColorStop(.32,'rgba(145,125,255,'+(a*.4)+')');g.addColorStop(1,'rgba(60,50,140,0)');c.fillStyle=g;c.beginPath();c.arc(q.x,q.y,R,0,Math.PI*2);c.fill()}
  function drawWorldFX(){
    const c=get('ctx'),G=get('G'),M=get('M'),vw=finite(get('vw')),vh=finite(get('vh'));if(!c||!G||!M||!vw||!vh)return;t+=1/60;
    c.save();c.globalCompositeOperation='screen';for(const o of(M.torches||[]))glow(o.x,o.y,16,.065);for(const o of(M.crystals||[]))glow(o.x,o.y,13,.055+.02*Math.sin(t*1.7+(o.seed||0)));if(M.portal?.active)glow(M.portal.x,M.portal.y,30,.13);c.restore();
    c.save();c.globalCompositeOperation='lighter';const rooms=Array.isArray(M.rooms)?M.rooms:[];for(let ri=0;ri<rooms.length;ri++){const r=rooms[ri];if(!r)continue;for(let i=0;i<2;i++){const q=worldToScreen(r.x+hash(ri,i,77)*r.w,r.y+hash(ri,i,78)*r.h);if(!q)continue;const ph=hash(ri,i,79)*Math.PI*2;c.globalAlpha=.07+.04*Math.sin(t*.8+ph);c.fillStyle='#ddd6fe';c.beginPath();c.arc(q.x,q.y+Math.sin(t*.7+ph)*5*q.s,Math.max(.7,q.s),0,Math.PI*2);c.fill()}}c.restore();
    const p=G.player;if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){const q=worldToScreen(p.x,p.y);if(q){c.save();c.globalAlpha=.16+.05*Math.sin(t*2.2);c.strokeStyle='#ddd6fe';c.lineWidth=Math.max(1,1.2*q.s);c.beginPath();c.ellipse(q.x,q.y+5*q.s,17*q.s,5.5*q.s,0,0,Math.PI*2);c.stroke();c.restore()}}
  }
  function drawAtmosphere(){const c=get('ctx'),vw=finite(get('vw')),vh=finite(get('vh')),SET=get('SET');if(!c||!vw||!vh)return;c.save();const v=c.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*.25,vw/2,vh/2,Math.max(vw,vh)*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.82,'rgba(0,0,0,'+(SET&&SET.filter===false?.08:.13)+')');v.addColorStop(1,'rgba(0,0,0,.34)');c.fillStyle=v;c.fillRect(0,0,vw,vh);c.restore()}
  function install(){
    if(installed)return;const pr=get('prerender'),rd=get('render');if(typeof pr!=='function'||typeof rd!=='function'){setTimeout(install,0);return}basePrerender=pr;baseRender=rd;
    window.__shadowVisualPrerender=function(){const out=basePrerender.apply(this,arguments);decorateMap();return out};
    window.__shadowVisualRender=function(){const out=baseRender.apply(this,arguments);drawWorldFX();drawAtmosphere();return out};
    if(!setGlobal('prerender','window.__shadowVisualPrerender')||!setGlobal('render','window.__shadowVisualRender')){console.warn(TAG,'global hook unavailable');return}installed=true;decorateMap();console.info(TAG,'installed');
  }
  install();
})();
