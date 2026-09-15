'use strict';
/* Shadow Ascension · hero movement trail v0.1 */
(function(){
 let started=false,lastX=null,lastY=null,stamps=[],last=0;
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 const iso=(x,y,s)=>({x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5});
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}
 function tick(){const a=globalThis.__shadowPhaserApex,scene=a&&a.scene,G=(()=>{try{return globalThis.eval('G')}catch(_){return null}})();if(!a||!scene||!G){requestAnimationFrame(tick);return}const p=G.player||G.hero||G.me;if(p){const q=iso(num(p.x),num(p.y),a.stats||{});if(lastX!==null&&Math.hypot(q.x-lastX,q.y-lastY)>7&&performance.now()-last>55){const g=scene.add.graphics();g.fillStyle(0x8b5cf6,.22);g.fillEllipse(0,0,16,7);g.x=q.x;g.y=q.y+3;g.setDepth(q.y+1);stamps.push(g);if(stamps.length>10)stamps.shift();stamps.forEach((o,i)=>o.setAlpha((i+1)/stamps.length*.18));last=performance.now()}lastX=q.x;lastY=q.y}stamps=stamps.filter(o=>o&&o.scene);a.heroTrail={active:true,stamps:stamps.length};requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,900));
})();
