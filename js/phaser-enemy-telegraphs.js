'use strict';
/* Shadow Ascension · Enemy Telegraphs v0.1
 * Presentation-only combat readability. Never mutates simulation state.
 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
 const arr=v=>Array.isArray(v)?v:[];
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 let started=false,known=new Map,fx=new Set,last=performance.now();
 function iso(x,y,s){return{x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5}}
 function kind(e){return String(e&&((e.type??e.kind??e.name))||'shadow').toLowerCase()}
 function elite(e){return !!(e&&((e.elite??e.isElite)||(e.grade>0))) || /boss|elite|guardian|lord|commander/.test(kind(e))}
 function boss(e){return !!(e&&((e.boss??e.isBoss))) || /boss|monarch|king|queen|lord/.test(kind(e))}
 function range(e){if(boss(e))return 1.9;if(/mage|witch|caster|archer|ranged/.test(kind(e)))return 1.45;if(/beast|wolf|hound|assassin/.test(kind(e)))return .9;return 1.15}
 function color(e){return boss(e)?0xd6a84f:elite(e)?0xc4b5fd:0x8b5cf6}
 function ring(scene,p,r,c,a=.7){const g=scene.add.graphics();g.lineStyle(3,c,a);g.strokeCircle(p.x,p.y-8,r);g.lineStyle(1,c,a*.45);g.strokeCircle(p.x,p.y-8,r*.72);return g}
 function telegraph(scene,p,e,t){const c=color(e),r=range(e)*28,g=ring(scene,p,r,c,.72);g.setDepth(p.y+500);scene.tweens.add({targets:g,scale:.72,alpha:.12,duration:380,repeat:1,yoyo:true,onComplete:()=>g.destroy()});if(boss(e)){const arc=scene.add.graphics();arc.lineStyle(4,c,.9);arc.beginPath();arc.arc(p.x,p.y-8,r*1.28,Math.PI*.15,Math.PI*.85);arc.strokePath();arc.setDepth(p.y+510);scene.tweens.add({targets:arc,angle:28,alpha:0,duration:520,onComplete:()=>arc.destroy()})}}
 function hitFlash(scene,p,e){const c=color(e),g=scene.add.graphics();g.fillStyle(c,.32);g.fillCircle(p.x,p.y-12,8);g.lineStyle(2,c,.8);g.strokeCircle(p.x,p.y-12,18);g.setDepth(p.y+520);scene.tweens.add({targets:g,scale:1.8,alpha:0,duration:260,onComplete:()=>g.destroy()})}
 function tick(){const apex=globalThis.__shadowPhaserApex,scene=apex&&apex.scene,G=get('G');if(!scene||!G){requestAnimationFrame(tick);return}const s=apex.stats||scene,now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;const es=arr(G.enemies),live=new Set;
  es.forEach((e,i)=>{if(!e)return;const id=String(e.id??e.uid??e.eid??i),p=iso(num(e.x),num(e.y),s);live.add(id);let k=known.get(id);if(!k){k={x:num(e.x),y:num(e.y),hp:num(e.hp,e.health),max:num(e.maxhp,e.maxHP,e.hp),t:0};known.set(id,k)}
   const hp=num(e.hp,e.health), prev=k.hp, changed=Math.abs(hp-prev)>.001;k.hp=hp;k.max=num(e.maxhp,e.maxHP,k.max);
   const tele=!!(e.windup||e.casting||e.cast||e.attacking||e.attackWindup||e.telegraph||e.channeling||e.charging);
   const stamp=Number(e.attackAt??e.nextAttack??e.cooldownUntil??0);const nearStamp=stamp>0&&stamp-now<700&&stamp-now>0;
   if((tele||nearStamp)&&now-k.t>300){k.t=now;telegraph(scene,p,e,now)}
   if(changed&&hp<prev)hitFlash(scene,p,e);
  });
  for(const id of known.keys())if(!live.has(id))known.delete(id);
  apex.enemyTelegraphStats={enemies:es.length,tracked:known.size,dt};requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,900));
})();
