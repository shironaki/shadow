'use strict';
/* Shadow Ascension · Boss Telegraphs v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
 const arr=v=>Array.isArray(v)?v:[];
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 let started=false,last=0,sceneRef=null,marks=new Map(),bursts=[];
 function iso(x,y,s){return{x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5}}
 function key(e,i){return String(e&&(e.id??e.uid??e.eid??e.name))+'#'+i}
 function enemyName(e){return String(e&&(e.type??e.kind??e.name)||'').toLowerCase()}
 function isBoss(e){return !!(e&&((e.boss||e.isBoss||e.elite&&num(e.grade)>1)||/boss|monarch|king|queen|commander|demon|lord/.test(enemyName(e))))}
 function hpPct(e){const hp=num(e&&(e.hp??e.health),0),mx=Math.max(1,num(e&&(e.maxhp??e.maxHP??e.healthMax),hp||1));return hp/mx}
 function makeMarker(scene,boss){const c=scene.add.container(0,0),g=scene.add.graphics();g.fillStyle(0x09070f,.35);g.fillEllipse(0,4,boss?86:58,24);g.lineStyle(boss?4:2,boss?0xd6a84f:0x8b5cf6,.8);g.strokeEllipse(0,-5,boss?92:64,34);g.lineStyle(2,0xc4b5fd,.35);g.strokeEllipse(0,-5,boss?66:44,22);c.add(g);c.setAlpha(0);c.setScale(.6);return c}
 function burst(scene,p,boss){const g=scene.add.graphics();g.lineStyle(boss?4:2,boss?0xd6a84f:0xc4b5fd,.95);g.strokeCircle(p.x,p.y-8,boss?20:12);g.lineStyle(2,0x8b5cf6,.7);g.strokeCircle(p.x,p.y-8,boss?36:23);g.setDepth(p.y+600);scene.tweens.add({targets:g,scale:1.8,alpha:0,duration:500,ease:'Cubic.easeOut',onComplete:()=>g.destroy()})}
 function tick(now){const apex=globalThis.__shadowPhaserApex,G=get('G'),scene=apex&&apex.scene;if(!scene||!G){requestAnimationFrame(tick);return}sceneRef=scene;const s=apex.stats||scene,enemies=arr(G.enemies),seen=new Set,players=G.player;
  enemies.forEach((e,i)=>{if(!e)return;const k=key(e,i),boss=isBoss(e);seen.add(k);let m=marks.get(k);const p=iso(num(e.x),num(e.y),s);if(!m){m=makeMarker(scene,boss);marks.set(k,m);burst(scene,p,boss)}m.setPosition(p.x,p.y);m.setDepth(p.y+8);m.setAlpha(boss?(.16+.1*Math.sin(now*.006)):(hpPct(e)<.35?.1:0));
   const cast=num(e.castTime??e.attackTimer??e.windup??e.telegraph,0);if(cast>0){const q=Math.max(.05,Math.min(1,cast/2));m.setAlpha((boss?.5:.28)*q);m.setScale(.72+(.42*(1-q)))}
  });
  for(const[k,m]of marks)if(!seen.has(k)){m.destroy();marks.delete(k)}
  if(enemies.some(isBoss)&&Math.floor(now/700)!==Math.floor(last/700)){const b=enemies.find(isBoss),p=iso(num(b.x),num(b.y),s);burst(scene,p,true)}
  last=now;apex.bossTelegraphStats={enemies:enemies.length,bosses:enemies.filter(isBoss).length,markers:marks.size};requestAnimationFrame(tick)
 }
 function start(){if(started)return;started=true;last=performance.now();requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,1000));
})();
