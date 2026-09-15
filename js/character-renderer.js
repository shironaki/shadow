'use strict';
/*
 * SHADOW ASCENSION — Chibi Character v0.15
 * Production Kit removed. The hero is now rendered as a clean, deterministic
 * vector chibi directly on the existing 2D canvas: no sprite sheets, no asset
 * packing, no broken external PNGs. Movement/combat state remains gameplay-owned.
 */
(function(){
  const TAG='[ChibiCharacter]';
  let installed=false,baseUpdate=null,baseDrawPlayer=null;
  const get=n=>{try{return globalThis.eval(n)}catch(_){return undefined}};
  const setGlobal=(n,v)=>{try{globalThis.eval(n+'='+v);return true}catch(_){return false}};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const TAU=Math.PI*2;
  let t=0,lastX=0,lastY=0;

  function pal(p){
    const cls=p?.cls||'shade';
    if(cls==='mage')return {hair:'#d8c6ff',hair2:'#a78bfa',coat:'#312e81',coat2:'#4c1d95',accent:'#c084fc',skin:'#f0c8a8',boot:'#17152b',eye:'#7dd3fc'};
    if(cls==='ward')return {hair:'#d9b08c',hair2:'#8b5a3c',coat:'#334155',coat2:'#475569',accent:'#93c5fd',skin:'#efc7a5',boot:'#111827',eye:'#60a5fa'};
    return {hair:'#20253b',hair2:'#111426',coat:'#172554',coat2:'#1e3a8a',accent:'#8b5cf6',skin:'#efc3a2',boot:'#0b1020',eye:'#a5b4fc'};
  }
  function state(p,g){
    if(p.dead)return'death';
    if(g&&g.hurtT>0)return'hurt';
    if(p.atkT>0||p.swingT>0)return'attack';
    if(p.moving)return'walk';
    return'idle';
  }
  function round(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
  function ellipse(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}
  function stroke(c,fn,col,w=1){c.save();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';fn();c.stroke();c.restore()}

  function drawChibi(X,Y,p,g){
    const c=get('ctx');if(!c)return;
    const C=pal(p),st=state(p,g);
    const walkPhase=st==='walk'?Math.sin(t*10):0;
    const bob=st==='idle'?Math.sin(t*2.4)*1.1:st==='walk'?Math.abs(walkPhase)*.7:0;
    const atk=st==='attack'?clamp(1-(p.atkT||p.swingT||0)/.28,0,1):0;
    const alpha=g&&p.stealth>0?.42:.98;
    const facing=p.face===undefined?1:(p.face<0?-1:1);
    c.save();c.globalAlpha=alpha;c.translate(X,Y-bob);c.scale(facing,1);

    // Contact shadow: keeps the chibi glued to the isometric floor.
    c.save();c.globalAlpha=.28*alpha;c.fillStyle='#05050c';ellipse(c,0,4,17,5);c.restore();
    if(st==='death'){c.translate(0,8);c.rotate(-.08);c.globalAlpha*=.75}

    // Back cape / hood silhouette.
    c.fillStyle=C.coat2;c.beginPath();c.moveTo(-10,-26);c.quadraticCurveTo(-15,-17,-12,-4);c.quadraticCurveTo(-9,2,0,3);c.quadraticCurveTo(9,2,12,-4);c.quadraticCurveTo(15,-17,10,-26);c.closePath();c.fill();

    // Legs + boots.
    const step=st==='walk'?walkPhase*3:0;
    c.fillStyle=C.boot;round(c,-8-step,-9,7,12,3);round(c,1+step,-9,7,12,3);
    c.fillStyle=C.accent;round(c,-9-step,-2,8,4,2);round(c,1+step,-2,8,4,2);

    // Compact body, belt and arms.
    c.fillStyle=C.coat;round(c,-12,-31,24,24,8);
    c.fillStyle=C.coat2;round(c,-10,-29,20,11,5);
    c.fillStyle='#0b0a14';round(c,-10,-12,20,4,2);c.fillStyle=C.accent;round(c,-2,-13,4,5,1);
    const armA=st==='attack'?-1.35+atk*.35:-.12+walkPhase*.06;
    c.save();c.translate(10,-24);c.rotate(armA);c.fillStyle=C.skin;round(c,-3,0,6,13,3);c.fillStyle=C.coat;round(c,-4,0,8,7,3);c.restore();
    c.save();c.translate(-10,-24);c.rotate(.12-walkPhase*.06);c.fillStyle=C.skin;round(c,-3,0,6,13,3);c.fillStyle=C.coat;round(c,-4,0,8,7,3);c.restore();

    // Class weapon.
    c.save();c.translate(14,-23);c.rotate(st==='attack'?-1.0:-.35);
    if(p.cls==='mage'){
      c.strokeStyle='#d8b4ff';c.lineWidth=2.3;c.beginPath();c.moveTo(0,-7);c.lineTo(0,15);c.stroke();c.fillStyle=C.accent;ellipse(c,0,-9,3.4,3.4);
    }else{
      c.strokeStyle='#cbd5e1';c.lineWidth=2;c.beginPath();c.moveTo(0,-6);c.lineTo(0,13);c.stroke();c.fillStyle='#94a3b8';c.beginPath();c.moveTo(0,-9);c.lineTo(2,-4);c.lineTo(0,-2);c.lineTo(-2,-4);c.closePath();c.fill();
    }
    c.restore();

    // Neck + oversized chibi head.
    c.fillStyle=C.skin;round(c,-4,-36,8,6,2);
    c.fillStyle=C.skin;ellipse(c,0,-45,15,14);
    c.fillStyle=C.skin;ellipse(c,-14,-45,3.2,4);ellipse(c,14,-45,3.2,4);

    // Hair cap with side locks.
    c.fillStyle=C.hair;c.beginPath();c.moveTo(-15,-45);c.quadraticCurveTo(-15,-59,0,-61);c.quadraticCurveTo(15,-59,15,-45);c.lineTo(11,-50);c.lineTo(7,-47);c.lineTo(3,-53);c.lineTo(-2,-48);c.lineTo(-7,-53);c.lineTo(-11,-48);c.closePath();c.fill();
    c.fillStyle=C.hair2;round(c,-13,-47,4,9,2);round(c,9,-47,4,9,2);

    // Large readable eyes + blush + tiny smile.
    c.fillStyle=C.eye;ellipse(c,-5,-45,2.4,3.1);ellipse(c,5,-45,2.4,3.1);
    c.fillStyle='#0b1020';ellipse(c,-5,-44.5,1,1.5);ellipse(c,5,-44.5,1,1.5);
    c.fillStyle='rgba(255,255,255,.8)';ellipse(c,-4.4,-45.4,.55,.7);ellipse(c,5.6,-45.4,.55,.7);
    c.fillStyle='#d98f91';ellipse(c,-8,-40.5,2.2,1.1);ellipse(c,8,-40.5,2.2,1.1);
    stroke(c,()=>{c.beginPath();c.arc(0,-40,3,.15,Math.PI-.15)},'rgba(90,45,45,.65)',.8);

    // Class emblem on chest.
    c.fillStyle=C.accent;ellipse(c,0,-23,2.5,2.5);
    if(p.cls==='mage'){c.strokeStyle='#f5e9ff';c.lineWidth=1;c.beginPath();c.arc(0,-23,4,0,TAU);c.stroke()}

    if(st==='attack'){c.save();c.globalAlpha=.55+.25*Math.sin(t*24);c.strokeStyle=C.accent;c.lineWidth=2.2;c.beginPath();c.arc(16,-30,15,-1.3,.5);c.stroke();c.restore()}
    if(st==='hurt'){c.save();c.globalAlpha=.65;c.fillStyle='#fff';ellipse(c,0,-30,18,31);c.restore()}
    if(st==='death'){c.save();c.globalAlpha=.55;c.fillStyle=C.accent;for(let i=0;i<5;i++){const a=i*1.3+t*.4;ellipse(c,Math.cos(a)*18,-24+Math.sin(a)*14,1.5,1.5)}c.restore()}
    c.restore();
  }

  function safePosition(p,x=p.x,y=p.y){
    const M=get('M');if(!M||!M.grid||!Number.isFinite(x)||!Number.isFinite(y))return true;
    const open=(tx,ty)=>tx>=0&&ty>=0&&tx<M.W&&ty<M.H&&!!M.grid[ty*M.W+tx];
    const r=.30;
    const pts=[[x,y],[x+r,y],[x-r,y],[x,y+r],[x,y-r],[x+r*.72,y+r*.72],[x-r*.72,y-r*.72]];
    if(!pts.every(([px,py])=>open(Math.floor(px),Math.floor(py))))return false;
    for(const o of(M.obst||[])){if(!o)continue;const rr=r+(o.r||.42),dx=x-o.x,dy=y-o.y;if(dx*dx+dy*dy<rr*rr)return false}
    return true;
  }
  function enforceCollision(p){
    if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
    const ox=p.x,oy=p.y;
    if(safePosition(p,ox,oy)){lastX=ox;lastY=oy;return}
    // Sweep the previous safe point to the new point so one-frame movement cannot tunnel through walls.
    const sx=Number.isFinite(lastX)?lastX:ox,sy=Number.isFinite(lastY)?lastY:oy;
    let goodX=sx,goodY=sy;
    for(let i=1;i<=14;i++){const q=i/14,tx=sx+(ox-sx)*q,ty=sy+(oy-sy)*q;if(safePosition(p,tx,ty)){goodX=tx;goodY=ty}else break}
    p.x=goodX;p.y=goodY;lastX=goodX;lastY=goodY;
  }

  function install(){
    if(installed)return;
    const upd=get('update'),dp=get('drawPlayer');
    if(typeof upd!=='function'||typeof dp!=='function'){setTimeout(install,0);return}
    baseUpdate=upd;baseDrawPlayer=dp;
    const g=get('G');if(g&&g.player){lastX=g.player.x;lastY=g.player.y}
    window.__shadowChibiUpdate=function(dt){baseUpdate.apply(this,arguments);const g=get('G');if(g&&g.player)enforceCollision(g.player)};
    window.__shadowChibiDraw=function(X,Y){const g=get('G');if(g&&g.player)drawChibi(X,Y,g.player,g);else baseDrawPlayer.apply(this,arguments)};
    if(!setGlobal('update','window.__shadowChibiUpdate')||!setGlobal('drawPlayer','window.__shadowChibiDraw')){console.warn(TAG,'global hook unavailable');return}
    installed=true;console.info(TAG,'installed');
  }
  const tick=()=>{t+=1/60;requestAnimationFrame(tick)};requestAnimationFrame(tick);
  install();
})();
