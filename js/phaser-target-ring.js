'use strict';
/* Shadow Ascension · target ring v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}},arr=v=>Array.isArray(v)?v:[];
 let started=false,ring=null,lastKey='';
 function iso(x,y,s){return{x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5}}
 function pick(G){return G&&((G.target&&typeof G.target==='object')?G.target:null)||G&&((G.selectedEnemy&&typeof G.selectedEnemy==='object')?G.selectedEnemy:null)}
 function tick(){const a=globalThis.__shadowPhaserApex,s=a&&a.scene, G=get('G');if(!s||!G){requestAnimationFrame(tick);return}const st=a.stats||s,t=performance.now(),e=pick(G);if(!ring){ring=s.add.graphics();ring.setDepth(999500)}ring.clear();if(!e){lastKey='';a.targetRingStats={active:false};requestAnimationFrame(tick);return}const x=Number(e.x),y=Number(e.y);if(!Number.isFinite(x)||!Number.isFinite(y)){requestAnimationFrame(tick);return}const p=iso(x,y,st),pulse=1+Math.sin(t*.008)*.1,key=String(e.uid??e.id??x+':'+y);ring.lineStyle(2,0xc4b5fd,.85);ring.strokeEllipse(p.x,p.y+4,30*pulse,12*pulse);ring.lineStyle(1,0x8b5cf6,.65);ring.strokeEllipse(p.x,p.y+4,42/pulse,16/pulse);ring.fillStyle(0x8b5cf6,.12);ring.fillEllipse(p.x,p.y+4,26*pulse,9*pulse);lastKey=key;a.targetRingStats={active:true,key};requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,900));
})();
