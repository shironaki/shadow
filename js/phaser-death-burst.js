'use strict';
/* Shadow Ascension · death burst v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}},arr=v=>Array.isArray(v)?v:[];
 let started=false,seen=new Set();
 function iso(x,y,s){return{x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5}}
 function burst(scene,p,big){const c=scene.add.container(p.x,p.y-8),g=scene.add.graphics();g.fillStyle(0x8b5cf6,.7);g.fillCircle(0,0,big?12:7);for(let i=0;i<(big?12:7);i++){const a=i*Math.PI*2/(big?12:7);g.lineStyle(2,0xc4b5fd,.8);g.lineBetween(Math.cos(a)*5,Math.sin(a)*5,Math.cos(a)*24,Math.sin(a)*24)}c.add(g);c.setDepth(p.y+500);scene.tweens.add({targets:c,scale:1.8,alpha:0,duration:360,ease:'Cubic.easeOut',onComplete:()=>c.destroy()})}
 function tick(){const a=globalThis.__shadowPhaserApex,s=a&&a.scene,G=get('G');if(!s||!G){requestAnimationFrame(tick);return}const st=a.stats||s,now=performance.now(),en=arr(G.enemies),active=new Set();en.forEach((e,i)=>{if(!e)return;const id=String(e.uid??e.id??i);active.add(id);seen.add(id)});if(seen.size>0){for(const id of Array.from(seen)){if(!active.has(id)){const corpse=arr(G.corpses).find(c=>String(c.uid??c.id)===''+id);if(corpse&&Number.isFinite(Number(corpse.x)))burst(s,iso(Number(corpse.x),Number(corpse.y),st),false);seen.delete(id)}}}a.deathBurstStats={tracked:seen.size,enemies:en.length,at:now};requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,1000));
})();
