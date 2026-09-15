'use strict';
/*
 * SHADOW ASCENSION — Visual Upgrade / v0.13
 * Pure presentation layer. It does not own game state or combat rules.
 * It enriches the existing isometric renderer with depth, material, lighting
 * and atmosphere while keeping the game 2D/browser/mobile friendly.
 */
(function(){
  const TAG='[VisualUpgrade]';
  let baseRender=null, basePrerender=null, lastMapCanvas=null, installed=false;
  let t=0;

  const get=(name)=>{try{return globalThis.eval(name)}catch(_){return undefined}};
  const setGlobal=(name,valueName)=>{try{globalThis.eval(name+'='+valueName);return true}catch(_){return false}};
  const finite=(n,d=0)=>Number.isFinite(n)?n:d;
  const hash=(x,y,s=0)=>{
    let n=(x*374761393+y*668265263+s*1442695041)|0;
    n=(n^(n>>>13))*1274126177|0;
    return ((n^(n>>>16))>>>0)/4294967295;
  };
  const path=(c,pts)=>{c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath()};

  function decorateMap(){
    const M=get('M');
    if(!M||!M.cv||M.cv===lastMapCanvas||!M.grid)return;
    lastMapCanvas=M.cv;
    const c=M.cv.getContext('2d'); if(!c)return;
    const OX=finite(M.OX), OY=finite(M.OY,40), W=M.W|0,H=M.H|0;
    const ix=(x,y)=>(x-y)*32+OX, iy=(x,y)=>(x+y)*16+OY;
    const open=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&!!M.grid[y*W+x];

    /* 1) Soft material variation: stone/earth patches inside rooms. */
    c.save();
    c.globalCompositeOperation='multiply';
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(!open(x,y))continue;
      const q=hash(x,y,11);
      if(q<.68)continue;
      const sx=ix(x+.5,y+.5), sy=iy(x+.5,y+.5);
      const rx=6+hash(x,y,12)*10, ry=3+hash(x,y,13)*5;
      const g=c.createRadialGradient(sx,sy,0,sx,sy,rx);
      g.addColorStop(0,'rgba(8,8,18,.16)'); g.addColorStop(1,'rgba(8,8,18,0)');
      c.fillStyle=g; c.beginPath(); c.ellipse(sx,sy,rx,ry,hash(x,y,14)*Math.PI,0,Math.PI*2); c.fill();
    }
    c.restore();

    /* 2) Raised wall lips. Every blocked neighbor gets a small extruded face. */
    c.save();
    c.lineWidth=1;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(!open(x,y))continue;
      const sx=ix(x+.5,y+.5), sy=iy(x+.5,y+.5);
      const top=[sx,sy-16], right=[sx+32,sy], bottom=[sx,sy+16], left=[sx-32,sy];
      const faces=[
        [!open(x+1,y),top,right,'rgba(4,4,10,.42)'],
        [!open(x,y+1),right,bottom,'rgba(4,4,10,.32)'],
        [!open(x-1,y),bottom,left,'rgba(4,4,10,.25)'],
        [!open(x,y-1),left,top,'rgba(255,255,255,.055)']
      ];
      for(const [yes,a,b,col] of faces){
        if(!yes)continue;
        const drop=10+hash(x,y,30)*5;
        path(c,[a,b,[b[0],b[1]+drop],[a[0],a[1]+drop]]);
        const gr=c.createLinearGradient(a[0],a[1],a[0],a[1]+drop);
        gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,.06)');
        c.fillStyle=gr;c.fill();c.strokeStyle='rgba(0,0,0,.18)';c.stroke();
      }
    }
    c.restore();

    /* 3) Fine cracks/grain make large flat areas read as physical surfaces. */
    c.save(); c.globalAlpha=.32; c.lineWidth=.8;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(!open(x,y)||hash(x,y,40)<.78)continue;
      const sx=ix(x+.5,y+.5), sy=iy(x+.5,y+.5), q=hash(x,y,41);
      c.strokeStyle=q>.65?'rgba(0,0,0,.28)':'rgba(255,255,255,.13)';
      c.beginPath();c.moveTo(sx-7,sy-1);c.lineTo(sx-2,sy+1);c.lineTo(sx+4,sy-2);c.lineTo(sx+9,sy);
      if(q>.72)c.lineTo(sx+6,sy+3);c.stroke();
    }
    c.restore();

    /* 4) Room focal glow: the eye gets a center and the dungeon stops reading as one plane. */
    c.save(); c.globalCompositeOperation='screen';
    const rooms=Array.isArray(M.rooms)?M.rooms:[];
    for(let i=0;i<rooms.length;i++){
      const r=rooms[i]; if(!r)continue;
      const sx=ix(r.cx,r.cy),sy=iy(r.cx,r.cy),R=Math.max(20,Math.min(r.w,r.h)*10);
      const g=c.createRadialGradient(sx,sy,0,sx,sy,R);
      g.addColorStop(0,'rgba(130,105,255,.055)');g.addColorStop(1,'rgba(130,105,255,0)');
      c.fillStyle=g;c.beginPath();c.arc(sx,sy,R,0,Math.PI*2);c.fill();
    }
    c.restore();

    /* 5) Edge darkening on the static map gives the arena a readable frame. */
    const w=M.cw||M.cv.width,h=M.ch||M.cv.height;
    c.save();
    const v=c.createRadialGradient(w/2,h*.46,Math.min(w,h)*.18,w/2,h*.46,Math.max(w,h)*.72);
    v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.72,'rgba(0,0,0,.04)');v.addColorStop(1,'rgba(0,0,0,.34)');
    c.fillStyle=v;c.fillRect(0,0,w,h);c.restore();
  }

  function drawAtmosphere(){
    const ctx=get('ctx'),vw=finite(get('vw')),vh=finite(get('vh'));
    const G=get('G'), SET=get('SET');
    if(!ctx||!vw||!vh)return;
    const p=G&&G.player;
    t+=1/60;
    ctx.save();
    ctx.globalCompositeOperation='screen';
    const pulse=.5+.5*Math.sin(t*.8);
    const cx=vw*.5,cy=vh*.52;
    const rg=ctx.createRadialGradient(cx,cy,Math.min(vw,vh)*.05,cx,cy,Math.min(vw,vh)*.7);
    rg.addColorStop(0,'rgba(110,90,255,'+(0.018+0.008*pulse)+')');
    rg.addColorStop(.55,'rgba(60,70,150,.008)');
    rg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=rg;ctx.fillRect(0,0,vw,vh);
    ctx.restore();

    ctx.save();
    const vig=ctx.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*.28,vw/2,vh/2,Math.max(vw,vh)*.72);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(.78,'rgba(0,0,0,'+(SET&&SET.filter===false?.12:.18)+')');
    vig.addColorStop(1,'rgba(0,0,0,.42)');
    ctx.fillStyle=vig;ctx.fillRect(0,0,vw,vh);ctx.restore();

    if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){
      try{
        const z=get('zscale');
        const VS=typeof z==='function'?z():1;
        const M=get('M');
        const cam=G.cam||{x:p.x,y:p.y};
        const csx=(cam.x-cam.y)*32+(M.OX||0),csy=(cam.x+cam.y)*16+(M.OY||40);
        const sx=((p.x-p.y)*32+(M.OX||0)-csx)*VS+vw/2;
        const sy=((p.x+p.y)*16+(M.OY||40)-csy)*VS+vh/2;
        ctx.save();ctx.globalAlpha=.22+.06*Math.sin(t*2);
        ctx.strokeStyle='rgba(190,170,255,.9)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.ellipse(sx,sy+7*VS,18*VS,6*VS,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }catch(_){/* visual layer must never break gameplay */}
    }
  }

  function install(){
    if(installed)return;
    const pr=get('prerender'),rd=get('render');
    if(typeof pr!=='function'||typeof rd!=='function'){
      setTimeout(install,0);return;
    }
    basePrerender=pr;baseRender=rd;
    window.__shadowVisualPrerender=function(){
      const out=basePrerender.apply(this,arguments);decorateMap();return out;
    };
    window.__shadowVisualRender=function(){
      const out=baseRender.apply(this,arguments);drawAtmosphere();return out;
    };
    if(!setGlobal('prerender','window.__shadowVisualPrerender')||!setGlobal('render','window.__shadowVisualRender')){
      console.warn(TAG,'global hook unavailable');return;
    }
    installed=true;
    decorateMap();
    console.info(TAG,'installed');
  }
  install();
})();
