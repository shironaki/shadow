'use strict';
/*
 * SHADOW ASCENSION — Visual Upgrade / v0.14
 * Presentation only. Gameplay state, movement and combat remain elsewhere.
 * 2D Canvas / browser / mobile friendly: no WebGL dependency, no 3D rewrite.
 */
(function(){
  const TAG='[VisualUpgrade]';
  let baseRender=null,basePrerender=null,lastMapCanvas=null,installed=false,t=0;
  const get=n=>{try{return globalThis.eval(n)}catch(_){return undefined}};
  const setGlobal=(n,v)=>{try{globalThis.eval(n+'='+v);return true}catch(_){return false}};
  const finite=(n,d=0)=>Number.isFinite(n)?n:d;
  const hash=(x,y,s=0)=>{let n=(x*374761393+y*668265263+s*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967295};
  const path=(c,p)=>{c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath()};

  function decorateMap(){
    const M=get('M');if(!M||!M.cv||M.cv===lastMapCanvas||!M.grid)return;
    lastMapCanvas=M.cv;const c=M.cv.getContext('2d');if(!c)return;
    const OX=finite(M.OX),OY=finite(M.OY,40),W=M.W|0,H=M.H|0;
    const ix=(x,y)=>(x-y)*32+OX,iy=(x,y)=>(x+y)*16+OY;
    const open=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&!!M.grid[y*W+x];

    /* Surface material: deterministic stains and inset facets. */
    c.save();c.globalCompositeOperation='multiply';
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(!open(x,y))continue;const q=hash(x,y,11);if(q<.62)continue;
      const sx=ix(x+.5,y+.5),sy=iy(x+.5,y+.5),rx=5+hash(x,y,12)*11,ry=2.5+hash(x,y,13)*5;
      const g=c.createRadialGradient(sx,sy,0,sx,sy,rx);g.addColorStop(0,'rgba(5,5,14,.18)');g.addColorStop(1,'rgba(5,5,14,0)');
      c.fillStyle=g;c.beginPath();c.ellipse(sx,sy,rx,ry,hash(x,y,14)*Math.PI,0,Math.PI*2);c.fill();
    }
    c.restore();

    /* Bevel the walkable diamond. This is the main anti-flatness pass. */
    c.save();c.lineJoin='round';
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(!open(x,y))continue;const sx=ix(x+.5,y+.5),sy=iy(x+.5,y+.5);
      const top=[sx,sy-16],right=[sx+32,sy],bottom=[sx,sy+16],left=[sx-32,sy];
      const edges=[
        [!open(x,y-1),left,top,'rgba(255,255,255,.20)'],
        [!open(x+1,y),top,right,'rgba(0,0,0,.48)'],
        [!open(x,y+1),right,bottom,'rgba(0,0,0,.34)'],
        [!open(x-1,y),bottom,left,'rgba(0,0,0,.20)']
      ];
      for(const [yes,a,b,col] of edges){if(!yes)continue;
        c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();
        const drop=7+hash(x,y,30)*5;path(c,[a,b,[b[0],b[1]+drop],[a[0],a[1]+drop]]);
        const g=c.createLinearGradient(a[0],a[1],a[0],a[1]+drop);g.addColorStop(0,'rgba(0,0,0,.24)');g.addColorStop(1,'rgba(0,0,0,.02)');c.fillStyle=g;c.fill();
      }
    }
    c.restore();

    /* Room floor breaks: inner rings make rooms readable at a glance. */
    c.save();c.globalAlpha=.18;c.lineWidth=.8;
    for(const r of (Array.isArray(M.rooms)?M.rooms:[])){if(!r)continue;const sx=ix(r.cx,r.cy),sy=iy(r.cx,r.cy);const rw=Math.max(22,r.w*13),rh=Math.max(12,r.h*6.5);c.strokeStyle='rgba(220,215,255,.32)';c.beginPath();c.ellipse(sx,sy,rw,rh,0,0,Math.PI*2);c.stroke()}
    c.restore();

    /* Sparse cracks / masonry grain. */
    c.save();c.globalAlpha=.3;c.lineWidth=.8;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(open(x,y)&&hash(x,y,40)>.77){const sx=ix(x+.5,y+.5),sy=iy(x+.5,y+.5),q=hash(x,y,41);c.strokeStyle=q>.62?'rgba(0,0,0,.3)':'rgba(255,255,255,.14)';c.beginPath();c.moveTo(sx-8,sy);c.lineTo(sx-2,sy+1);c.lineTo(sx+4,sy-2);c.lineTo(sx+9,sy);if(q>.7)c.lineTo(sx+6,sy+3);c.stroke()}
    c.restore();

    /* Focal lighting baked into the map, very low contrast. */
    c.save();c.globalCompositeOperation='screen';
    for(const r of (Array.isArray(M.rooms)?M.rooms:[])){if(!r)continue;const sx=ix(r.cx,r.cy),sy=iy(r.cx,r.cy),R=Math.max(22,Math.min(r.w,r.h)*11);const g=c.createRadialGradient(sx,sy,0,sx,sy,R);g.addColorStop(0,'rgba(130,105,255,.065)');g.addColorStop(1,'rgba(130,105,255,0)');c.fillStyle=g;c.beginPath();c.arc(sx,sy,R,0,Math.PI*2);c.fill()}
    c.restore();

    const w=M.cw||M.cv.width,h=M.ch||M.cv.height;c.save();const v=c.createRadialGradient(w/2,h*.46,Math.min(w,h)*.18,w/2,h*.46,Math.max(w,h)*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.72,'rgba(0,0,0,.035)');v.addColorStop(1,'rgba(0,0,0,.32)');c.fillStyle=v;c.fillRect(0,0,w,h);c.restore();
  }

  function worldToScreen(x,y){
    const G=get('G'),M=get('M'),vw=finite(get('vw')),vh=finite(get('vh'));if(!G||!M||!vw||!vh)return null;
    const z=get('zscale'),VS=typeof z==='function'?z():1,cam=G.cam||{x:G.player?.x||0,y:G.player?.y||0};
    const csx=(cam.x-cam.y)*32+(M.OX||0),csy=(cam.x+cam.y)*16+(M.OY||40);
    return {x:((x-y)*32+(M.OX||0)-csx)*VS+vw/2,y:((x+y)*16+(M.OY||40)-csy)*VS+vh/2,s:VS};
  }

  function glow(x,y,r,alpha){
    const ctx=get('ctx');if(!ctx)return;const q=worldToScreen(x,y);if(!q)return;
    const R=r*q.s,g=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,R);g.addColorStop(0,'rgba(210,190,255,'+alpha+')');g.addColorStop(.32,'rgba(130,110,255,'+(alpha*.45)+')');g.addColorStop(1,'rgba(70,60,160,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(q.x,q.y,R,0,Math.PI*2);ctx.fill();
  }

  function drawWorldFX(){
    const ctx=get('ctx'),G=get('G'),M=get('M'),vw=finite(get('vw')),vh=finite(get('vh'));if(!ctx||!G||!M||!vw||!vh)return;
    t+=1/60;ctx.save();ctx.globalCompositeOperation='screen';
    /* Torches and crystals: small local pools of light, not a global wash. */
    for(const o of (M.torches||[])){if(Math.sin(t*2.2+(o.seed||0))<-.92)continue;glow(o.x,o.y,18,.075)}
    for(const o of (M.crystals||[]))glow(o.x,o.y,14,.065+.025*Math.sin(t*1.7+(o.seed||0)));
    if(M.portal&&M.portal.active){glow(M.portal.x,M.portal.y,32,.14);const q=worldToScreen(M.portal.x,M.portal.y);if(q){ctx.save();ctx.globalAlpha=.32+.12*Math.sin(t*2.4);ctx.strokeStyle='rgba(180,150,255,.9)';ctx.lineWidth=1.2*q.s;ctx.beginPath();ctx.ellipse(q.x,q.y,13*q.s,7*q.s,0,0,Math.PI*2);ctx.stroke();ctx.restore()}}
    ctx.restore();

    /* Floating motes: deterministic per room, very cheap and sparse. */
    ctx.save();ctx.globalCompositeOperation='lighter';
    const rooms=Array.isArray(M.rooms)?M.rooms:[];
    for(let ri=0;ri<rooms.length;ri++){const r=rooms[ri];if(!r)continue;for(let i=0;i<3;i++){const seed=hash(ri,i,77),px=r.x+seed*r.w,py=r.y+hash(ri,i,78)*r.h,phase=hash(ri,i,79)*TAU,q=worldToScreen(px,py);if(!q)continue;const yy=q.y+Math.sin(t*.7+phase)*5*q.s;ctx.globalAlpha=.08+.05*Math.sin(t*1.1+phase);ctx.fillStyle='rgba(205,195,255,1)';ctx.beginPath();ctx.arc(q.x,yy,Math.max(.7,q.s*1.1),0,TAU);ctx.fill()}}
    ctx.restore();

    /* Player ground contact: animated ring communicates height and location. */
    const p=G.player;if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){const q=worldToScreen(p.x,p.y);if(q){ctx.save();ctx.globalAlpha=.18+.06*Math.sin(t*2);ctx.strokeStyle='rgba(205,190,255,.9)';ctx.lineWidth=Math.max(1,1.3*q.s);ctx.beginPath();ctx.ellipse(q.x,q.y+6*q.s,18*q.s,6*q.s,0,0,TAU);ctx.stroke();ctx.restore()}}
  }

  function drawAtmosphere(){
    const ctx=get('ctx'),vw=finite(get('vw')),vh=finite(get('vh')),SET=get('SET');if(!ctx||!vw||!vh)return;
    ctx.save();ctx.globalCompositeOperation='screen';const pulse=.5+.5*Math.sin(t*.8),cx=vw*.5,cy=vh*.52;const rg=ctx.createRadialGradient(cx,cy,Math.min(vw,vh)*.05,cx,cy,Math.min(vw,vh)*.7);rg.addColorStop(0,'rgba(110,90,255,'+(0.012+0.006*pulse)+')');rg.addColorStop(.55,'rgba(60,70,150,.006)');rg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,vw,vh);ctx.restore();
    ctx.save();const vig=ctx.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*.28,vw/2,vh/2,Math.max(vw,vh)*.72);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(.78,'rgba(0,0,0,'+(SET&&SET.filter===false?.1:.16)+')');vig.addColorStop(1,'rgba(0,0,0,.38)');ctx.fillStyle=vig;ctx.fillRect(0,0,vw,vh);ctx.restore();
  }

  function install(){
    if(installed)return;const pr=get('prerender'),rd=get('render');if(typeof pr!=='function'||typeof rd!=='function'){setTimeout(install,0);return}
    basePrerender=pr;baseRender=rd;
    window.__shadowVisualPrerender=function(){const out=basePrerender.apply(this,arguments);decorateMap();return out};
    window.__shadowVisualRender=function(){const out=baseRender.apply(this,arguments);drawWorldFX();drawAtmosphere();return out};
    if(!setGlobal('prerender','window.__shadowVisualPrerender')||!setGlobal('render','window.__shadowVisualRender')){console.warn(TAG,'global hook unavailable');return}
    installed=true;decorateMap();console.info(TAG,'installed');
  }
  install();
})();
