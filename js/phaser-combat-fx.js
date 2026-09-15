'use strict';
/* Shadow Ascension · Apex Combat FX v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
 const arr=v=>Array.isArray(v)?v:[];
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 let started=false,seen=new Map(),damage=new Map(),burst=new Map(),root=null,last=0;
 function iso(x,y,s){return{x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5}}
 function pos(v,s){return iso(num(v&&v.x),num(v&&v.y),s)}
 function key(v,i){return String(v&&(v.uid??v.id??v.eid??v.t))+'#'+i}
 function text(scene,x,y,value,big){const t=scene.add.text(x,y,String(value),{fontFamily:'monospace',fontSize:big?'18px':'13px',fontStyle:'bold',stroke:'#09070f',strokeThickness:4});t.setOrigin(.5);t.setDepth(y+500);return t}
 function slash(scene,p){const g=scene.add.graphics();g.lineStyle(4,0xe9d5ff,.95);g.beginPath();g.moveTo(p.x-20,p.y-30);g.lineTo(p.x+22,p.y+7);g.strokePath();g.lineStyle(2,0x8b5cf6,.9);g.beginPath();g.moveTo(p.x-8,p.y-32);g.lineTo(p.x+28,p.y-4);g.strokePath();g.setDepth(p.y+400);return g}
 function hit(scene,p,heavy){const g=scene.add.graphics();g.fillStyle(heavy?0xd6a84f:0xc4b5fd,.9);g.fillCircle(p.x,p.y-14,heavy?15:10);g.lineStyle(3,heavy?0xffe08a:0x8b5cf6,.85);g.strokeCircle(p.x,p.y-14,heavy?25:18);g.setDepth(p.y+401);return g}
 function start(){if(started)return;started=true;last=performance.now();requestAnimationFrame(tick)}
 function tick(now){const apex=globalThis.__shadowPhaserApex,scene=apex&&apex.scene,G=get('G');if(!scene||!G){requestAnimationFrame(tick);return}if(!root){root=scene.add.container(0,0);root.setDepth(950000)}const s=apex.stats||scene,dt=Math.min(.05,(now-last)/1000);last=now;
  const strikes=arr(G.strikes),hits=arr(G.hits),projs=arr(G.projs),all=[];
  strikes.forEach((v,i)=>all.push({v,i,type:'slash'}));hits.forEach((v,i)=>all.push({v,i:i+10000,type:'hit'}));
  const active=new Set;
  all.forEach((a)=>{const k=key(a.v,a.i);active.add(k);let o=seen.get(k);const p=pos(a.v,s);if(!o){o=a.type==='slash'?slash(scene,p):hit(scene,p,!!a.v&&((a.v.crit||a.v.critical)||num(a.v.damage)>50));seen.set(k,o)}o.x=p.x;o.y=p.y; o.alpha=Math.max(0,o.alpha-dt*2.8);});
  for(const[k,o]of seen)if(!active.has(k)||o.alpha<=0){o.destroy();seen.delete(k)}
  const floatHits=hits.slice(-18);floatHits.forEach((v,i)=>{const id=key(v,i);if(damage.has(id))return;const value=v&&(v.damage??v.dmg??v.amount);if(value==null)return;const p=pos(v,s),t=text(scene,p.x,p.y-32,(num(value)>0?'-':'')+Math.abs(Math.round(num(value))),!!(v.crit||v.critical));damage.set(id,{t,ttl:0});});
  for(const[k,o]of damage){o.ttl+=dt;o.t.y-=dt*22;o.t.alpha=Math.max(0,1-o.ttl/0.8);if(o.ttl>.8){o.t.destroy();damage.delete(k)}}
  apex.combatFxStats={strikes:strikes.length,hits:hits.length,projectiles:projs.length,labels:damage.size};requestAnimationFrame(tick)
 }
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,800));
})();
