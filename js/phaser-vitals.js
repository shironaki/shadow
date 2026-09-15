'use strict';
/* Shadow Ascension · Phaser Runtime Vitals v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
 let started=false,last=performance.now(),frames=0,fps=0;
 function tick(now){const a=globalThis.__shadowPhaserApex||{},G=get('G');frames++;if(now-last>=1000){fps=Math.round(frames*1000/(now-last));frames=0;last=now}a.vitals={fps,active:!!a.active,scene:!!a.scene,world:a.worldPass||null,enemies:G&&Array.isArray(G.enemies)?G.enemies.length:0,shadows:G&&Array.isArray(G.shadows)?G.shadows.filter(s=>s&&!s.bench).length:0,projectiles:G&&Array.isArray(G.projs)?G.projs.length:0};requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,1400));
})();
