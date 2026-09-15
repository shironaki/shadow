'use strict';
/* Shadow Ascension · Army Formation v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
 const arr=v=>Array.isArray(v)?v:[];
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 let started=false,items=new Map();
 function iso(x,y,s){return{x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5}}
 function role(s){const t=String(s&&s.type||'').toLowerCase();if(/tank|knight|guard|armor|golem/.test(t))return'tank';if(/mage|witch|archer|ranged/.test(t))return'ranged';if(/wolf|beast|hound|assassin|rogue/.test(t))return'fast';return'front'}
 function offset(i,count,r){const row=Math.floor(i/6),cols=Math.min(6,count),col=i%6;let x=(col-(cols-1)/2)*.9,y=1+row*.72;if(r==='tank')x*=1.08;if(r==='ranged')y+=.5;if(r==='fast')y+=.25;return{x,y}}
 function make(scene,s){const r=role(s),k=r==='tank'?1.08:r==='fast'?.78:r==='ranged'?.88:.88,c=scene.add.container(0,0),g=scene.add.graphics();g.fillStyle(0x08060e,.65);g.fillEllipse(0,4,27*k,9*k);g.fillStyle(r==='tank'?0x302040:0x171322,1);g.fillEllipse(0,-10,18*k,25*k);g.fillStyle(r==='ranged'?0x7446bd:r==='tank'?0x4b326d:0x513b79,1);g.fillTriangle(0,-31*k,-13*k,1,13*k,1);g.fillStyle(0xbca7ff,1);g.fillCircle(-3,-12,2*k);g.fillCircle(3,-12,2*k);if(r==='tank'){g.lineStyle(2,0xd6a84f,.8);g.strokeCircle(0,-10,13);g.fillStyle(0xd6a84f,.9);g.fillRect(-10,-1,20,3)}if(r==='ranged'){g.lineStyle(2,0xc4b5fd,.8);g.lineBetween(-9,-5,10,-22)}c.add(g);return c}
 function tick(){const apex=globalThis.__shadowPhaserApex,scene=apex&&apex.scene,G=get('G');if(!scene||!G){requestAnimationFrame(tick);return}const s=apex.stats||scene,p=G.player,active=arr(typeof get('activeShadows')==='function'?get('activeShadows')():G.shadows).filter(x=>x&&!x.bench),seen=new Set;active.forEach((sh,i)=>{const id=String(sh.uid??sh.id??i);seen.add(id);let o=items.get(id);if(!o){o=make(scene,sh);items.set(id,o);const q=iso(num(p&&p.x),num(p&&p.y),s);o.setPosition(q.x,q.y)}const q=offset(i,active.length,role(sh)),target=iso(num(p&&p.x)+q.x,num(p&&p.y)+q.y,s);o.x+=(target.x-o.x)*.16;o.y+=(target.y-o.y)*.16;o.setDepth(o.y+14)});for(const[id,o]of items)if(!seen.has(id)){o.destroy();items.delete(id)}apex.formationStats={count:active.length,roles:active.map(role)};requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,700));
})();
