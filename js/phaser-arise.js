'use strict';
/* Shadow Ascension · Arise presentation v0.4 · pass orchestrator */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
 const arr=v=>Array.isArray(v)?v:[];
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 let started=false,last=performance.now(),known=new Set,fx=new Set;
 function iso(x,y,a){return{x:a.ox+(x-y)*a.tw*.5,y:a.oy+(x+y)*a.th*.5}}
 function burst(scene,p){const g=scene.add.graphics();g.lineStyle(3,0xc4b5fd,.95);g.strokeCircle(p.x,p.y-10,8);g.lineStyle(2,0x8b5cf6,.8);g.strokeCircle(p.x,p.y-10,18);scene.tweens.add({targets:g,scale:2.4,alpha:0,duration:430,ease:'Cubic.easeOut',onComplete:()=>g.destroy()})}
 function silhouette(scene,p){const c=scene.add.container(p.x,p.y+8),g=scene.add.graphics();g.fillStyle(0x09070f,.96);g.fillEllipse(0,4,30,9);g.fillEllipse(0,-10,15,22);g.fillTriangle(0,-30,-11,0,11,0);g.fillStyle(0xc4b5fd,1);g.fillCircle(-2,-12,1.5);g.fillCircle(2,-12,1.5);c.add(g);c.setDepth(p.y+300);c.setScale(.08);c.setAlpha(0);scene.tweens.add({targets:c,scale:.9,alpha:1,y:p.y-34,duration:500,ease:'Cubic.easeOut'});scene.tweens.add({targets:c,alpha:0,scale:.55,duration:260,delay:520,onComplete:()=>c.destroy()})}
 function label(scene,p){const t=scene.add.text(p.x,p.y-52,'АРИЗ!',{fontFamily:'monospace',fontSize:'15px',fontStyle:'bold',stroke:'#09070f',strokeThickness:4}).setOrigin(.5);t.setDepth(p.y+500);scene.tweens.add({targets:t,y:p.y-78,alpha:0,duration:700,delay:120,onComplete:()=>t.destroy()})}
 function tick(){const apex=globalThis.__shadowPhaserApex,scene=apex&&apex.scene,G=get('G');if(!scene||!G){requestAnimationFrame(tick);return}const s=apex.stats||scene,now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now,shadows=arr(G.shadows),corpses=arr(G.corpses),current=new Set;
  shadows.forEach((sh,i)=>{if(!sh)return;const id=String(sh.uid??sh.id??i);current.add(id);if(!known.has(id)){known.add(id);const p=iso(num(sh.x),num(sh.y),s);burst(scene,p);silhouette(scene,p);label(scene,p)}});
  corpses.forEach((c,i)=>{if(!c)return;const id='c:'+String(c.uid??c.id??i);if(fx.has(id))return;fx.add(id);burst(scene,iso(num(c.x),num(c.y),s))});
  if(known.size>128)for(const id of known)if(!current.has(id))known.delete(id);
  apex.ariseStats={shadows:shadows.length,corpses:corpses.length,known:known.size,dt};requestAnimationFrame(tick)
 }
 function loadPasses(){
  const names=['phaser-boss-telegraph.js?v=0.1.0','phaser-arena-atmosphere.js?v=0.1.0','phaser-vitals.js?v=0.1.0','phaser-mobile-polish.js?v=0.1.0','phaser-combat-impact.js?v=0.1.0','phaser-portal-fx.js?v=0.1.0','phaser-hero-trail.js?v=0.1.0','phaser-levelup.js?v=0.1.0','phaser-visual-qa.js?v=0.1.0'];
  Promise.all(names.map(src=>import('./'+src).catch(e=>console.warn('[shadow] visual pass failed',src,e))));
 }
 function start(){if(started)return;started=true;loadPasses();requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,850));
})();
