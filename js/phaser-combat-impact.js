'use strict';
/* Shadow Ascension · Combat Impact Pass v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};const arr=v=>Array.isArray(v)?v:[];let started=false,seen=new Set;
 function iso(x,y,s){return{x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5}}
 function fx(scene,p,heavy){const g=scene.add.graphics();g.lineStyle(heavy?4:2,heavy?0xd6a84f:0xc4b5fd,.9);for(let i=0;i<6;i++){const a=i*Math.PI/3;g.lineBetween(p.x+Math.cos(a)*5,p.y-8+Math.sin(a)*5,p.x+Math.cos(a)*(heavy?28:18),p.y-8+Math.sin(a)*(heavy?28:18))}g.setDepth(p.y+700);scene.tweens.add({targets:g,alpha:0,scale:1.35,duration:260,ease:'Cubic.easeOut',onComplete:()=>g.destroy()})}
 function tick(){const a=globalThis.__shadowPhaserApex,G=get('G'),s=a&&a.scene;if(!s||!G){requestAnimationFrame(tick);return}const st=a.stats||s,hits=arr(G.hits),strikes=arr(G.strikes),all=hits.concat(strikes);all.forEach((h,i)=>{if(!h)return;const k=String(h.id??h.uid??h.time??i);if(seen.has(k))return;seen.add(k);const p=iso(Number(h.x)||Number(G.player&&G.player.x)||0,Number(h.y)||Number(G.player&&G.player.y)||0,st);fx(s,p,!!h.crit||!!h.heavy||Number(h.damage)>80)});if(seen.size>256)seen=new Set(Array.from(seen).slice(-128));a.combatImpact={events:all.length,seen:seen.size};requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,1700));
})();
