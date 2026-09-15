'use strict';
/* Shadow Ascension · Arise presentation v0.1
 * Watches the real corpse/shadow arrays; presentation only.
 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
 const arr=v=>Array.isArray(v)?v:[];
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 let scene=null,views=new Map(),started=false,last=performance.now();
 function iso(x,y,a){return{x:a.ox+(x-y)*a.tw*.5,y:a.oy+(x+y)*a.th*.5}}
 function make(scene){const c=scene.add.container(0,0);const g=scene.add.graphics();g.fillStyle(0x080611,.7);g.fillEllipse(0,4,34,10);g.fillStyle(0x161020,1);g.fillEllipse(0,-7,18,25);g.fillStyle(0x5b35a2,1);g.fillTriangle(0,-30,-12,1,12,1);g.fillStyle(0xc4b5fd,1);g.fillCircle(-3,-10,2);g.fillCircle(3,-10,2);const ring=scene.add.graphics();ring.lineStyle(2,0x8b5cf6,.8);ring.strokeCircle(0,0,16);c.add([g,ring]);return{c,g,ring,t:performance.now(),phase:'rise'}}
 function burst(scene,x,y){const g=scene.add.graphics();g.lineStyle(2,0xc4b5fd,.9);g.strokeCircle(x,y,8);g.lineStyle(1,0x8b5cf6,.65);g.strokeCircle(x,y,18);scene.tweens.add({targets:g,scale:2,alpha:0,duration:420,onComplete:()=>g.destroy()});}
 function tick(){const apex=globalThis.__shadowPhaserApex;if(!apex||!apex.scene){requestAnimationFrame(tick);return}scene=apex.scene;const G=get('G'),a=apex.stats||scene;if(!G){requestAnimationFrame(tick);return}const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;
  const shadows=arr(G.shadows),corpses=arr(G.corpses),live=new Set;
  shadows.forEach((s,i)=>{if(!s)return;const k='s:'+String(s.uid??s.id??i);live.add(k);let v=views.get(k);if(!v){v=make(scene);views.set(k,v);const p=iso(num(s.x),num(s.y),a);v.c.setPosition(p.x,p.y-8);v.c.setScale(.15);v.c.setAlpha(0);scene.tweens.add({targets:v.c,scale:.78,alpha:1,duration:520,ease:'Cubic.easeOut'});burst(scene,p.x,p.y-10)}const p=iso(num(s.x),num(s.y),a);v.c.setPosition(p.x,p.y-8);v.c.setDepth(p.y+35);v.c.rotation=Math.sin(now*.003+i)*.025;v.ring.setAlpha(.35+.35*Math.sin(now*.006+i));});
  corpses.forEach((c,i)=>{if(!c)return;const k='c:'+String(c.uid??c.id??i);live.add(k);if(!views.has(k)){const v=make(scene);views.set(k,v);const p=iso(num(c.x),num(c.y),a);v.c.setPosition(p.x,p.y);v.c.setScale(1.05);v.c.setAlpha(.9);scene.tweens.add({targets:v.c,y:p.y-32,scale:.05,alpha:0,duration:700,ease:'Cubic.easeIn',onComplete:()=>{v.c.destroy();views.delete(k)}});burst(scene,p.x,p.y-8)}});
  for(const[k,v]of views){if(k.startsWith('s:')&&!live.has(k)){v.c.destroy();views.delete(k)}}
  apex.ariseStats={trackedShadows:shadows.length,trackedCorpses:corpses.length,dt};requestAnimationFrame(tick)
 }
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,850));
})();
