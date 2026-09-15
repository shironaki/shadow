'use strict';
/* Shadow Ascension · Apex World Pass v0.5
 * Presentation-only extension: army, loot, corpses, gate/portal and ambient FX.
 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
 const arr=v=>Array.isArray(v)?v:[];
 const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 let layer=null,lastTick=0,items=new Map(),loot=new Map(),corpses=new Map();
 function iso(x,y,s){const tw=s.tw,th=s.th;return{x:s.ox+(x-y)*tw*.5,y:s.oy+(x+y)*th*.5}}
 function enemyPos(o,s){return iso(n(o.x),n(o.y),s)}
 function makeShadow(scene){const c=scene.add.container(0,0);const g=scene.add.graphics();g.fillStyle(0x09070f,.5);g.fillEllipse(0,3,25,8);g.fillStyle(0x171322,1);g.fillEllipse(0,-9,17,22);g.fillStyle(0x513b79,1);g.fillTriangle(0,-28,-12,0,12,0);g.fillStyle(0x8b5cf6,.85);g.fillCircle(0,-11,4);g.fillStyle(0xc4b5fd,.9);g.fillCircle(-2,-12,1);g.fillCircle(2,-12,1);c.add(g);return c}
 function makeLoot(scene,type){const g=scene.add.graphics();const t=String(type||'gold').toLowerCase();if(/crystal|essence|gem/.test(t)){g.fillStyle(0x6d3bc1,.25);g.fillCircle(0,-4,12);g.fillStyle(0x8b5cf6,1);g.fillTriangle(0,-14,-7,1,7,1);g.fillStyle(0xc4b5fd,1);g.fillTriangle(0,-11,2,-1,-2,-1)}else if(/potion|heal|mana/.test(t)){g.fillStyle(0x171322,1);g.fillRect(-7,-9,14,15);g.fillStyle(0x58d68d,1);g.fillRect(-5,-6,10,10);g.fillStyle(0xdbe6ff,1);g.fillRect(-4,-13,8,4)}else{g.fillStyle(0xd6a84f,1);g.fillCircle(0,-5,7);g.fillStyle(0xffe08a,1);g.fillCircle(-2,-7,2)}return g}
 function makeCorpse(scene){const g=scene.add.graphics();g.fillStyle(0x0b0911,.7);g.fillEllipse(0,2,28,9);g.fillStyle(0x252035,1);g.fillEllipse(0,-3,20,9);g.lineStyle(2,0x6d3bc1,.55);g.strokeEllipse(0,-3,23,12);return g}
 function drawGate(scene,G,s,t){const gx=n(G&&((G.gateX??G.portalX)),NaN),gy=n(G&&((G.gateY??G.portalY)),NaN);if(!Number.isFinite(gx)||!Number.isFinite(gy))return null;const p=iso(gx,gy,s),g=scene.add.graphics();const pulse=1+Math.sin(t*.003)*.08;g.fillStyle(0x24143d,.38);g.fillCircle(p.x,p.y-4,34*pulse);g.lineStyle(4,0x8b5cf6,.8);g.strokeCircle(p.x,p.y-10,23*pulse);g.lineStyle(2,0xc4b5fd,.55);g.strokeCircle(p.x,p.y-10,15/pulse);g.fillStyle(0x120c20,.85);g.fillCircle(p.x,p.y-10,9);return{g,p}}
 function boot(scene){if(layer)return;layer=scene.add.container(0,0);layer.setDepth(900000);layer.add(scene.add.graphics());lastTick=performance.now();globalThis.__shadowPhaserApex=globalThis.__shadowPhaserApex||{};globalThis.__shadowPhaserApex.worldPass='0.5';}
 function tick(){const apex=globalThis.__shadowPhaserApex,scene=apex&&apex.scene,G=get('G');if(!scene||!G){requestAnimationFrame(tick);return}boot(scene);const s=apex.stats||scene,now=performance.now(),dt=Math.min(.05,(now-lastTick)/1000);lastTick=now;const p=G.player;
  if(p){const hp=n(p.hp),mx=Math.max(1,n(p.maxhp,hp||1));apex.heroState={hp,maxhp:mx};}
  const active=arr(typeof get('activeShadows')==='function'?get('activeShadows')():G.shadows).filter(x=>x&&!x.bench);
  const seen=new Set;active.forEach((sh,i)=>{const k=String(sh.uid??sh.id??i);seen.add(k);let o=items.get(k);if(!o){o=makeShadow(scene);items.set(k,o)}const pos=iso(n(sh.x),n(sh.y),s);o.setPosition(pos.x,pos.y-7);o.setDepth(pos.y+5);o.setScale(.72+.08*Math.sin(now*.004+i));o.setAlpha(Math.max(.35,Math.min(1,n(sh.hp,1)>0?1:.2)));});for(const[k,o]of items)if(!seen.has(k)){o.destroy();items.delete(k)}
  const ls=arr(G.loots),lk=new Set;ls.forEach((it,i)=>{if(!it)return;const k=String(it.uid??it.id??i);lk.add(k);let o=loot.get(k);if(!o){o=makeLoot(scene,it.type??it.cat??'gold');loot.set(k,o)}const pos=iso(n(it.x),n(it.y),s);o.setPosition(pos.x,pos.y-5+Math.sin(now*.005+i)*3);o.setDepth(pos.y+20);});for(const[k,o]of loot)if(!lk.has(k)){o.destroy();loot.delete(k)}
  const cs=arr(G.corpses),ck=new Set;cs.forEach((it,i)=>{if(!it)return;const k=String(it.uid??it.id??i);ck.add(k);let o=corpses.get(k);if(!o){o=makeCorpse(scene);corpses.set(k,o)}const pos=iso(n(it.x),n(it.y),s);o.setPosition(pos.x,pos.y+2);o.setDepth(pos.y+2);o.setAlpha(.45+.2*Math.sin(now*.002+i));});for(const[k,o]of corpses)if(!ck.has(k)){o.destroy();corpses.delete(k)}
  if(apex.gateObj){apex.gateObj.g.destroy();apex.gateObj=null}const gate=drawGate(scene,G,s,now);if(gate){gate.g.setDepth(gate.p.y+30);apex.gateObj=gate}
  const hero=apex.scene.hero&&apex.scene.hero.container;if(hero&&p){const pos=iso(n(p.x),n(p.y),s);hero.setPosition(pos.x,pos.y);hero.setDepth(pos.y+40)}
  apex.worldPassStats={shadows:items.size,loots:loot.size,corpses:corpses.size,gate:!!gate,dt};requestAnimationFrame(tick)
 }
 function start(){if(globalThis.__shadowApexWorldPassStarted)return;globalThis.__shadowApexWorldPassStarted=true;requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,600));
})();
