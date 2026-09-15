'use strict';
/* Shadow Ascension · Portal FX v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};let started=false,sceneRef=null,ring=null,lastState='';
 function iso(x,y,s){return{x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5}}
 function tick(t){const a=globalThis.__shadowPhaserApex,G=get('G'),s=a&&a.scene;if(!s||!G){requestAnimationFrame(tick);return}const st=a.stats||s,gx=Number(G.gateX??G.portalX),gy=Number(G.gateY??G.portalY),ok=Number.isFinite(gx)&&Number.isFinite(gy);if(ok){const p=iso(gx,gy,st);if(!ring){ring=s.add.graphics();ring.setDepth(p.y+50)}ring.clear();const q=1+.12*Math.sin(t*.004);ring.fillStyle(0x24143d,.3);ring.fillCircle(p.x,p.y-10,36*q);ring.lineStyle(4,0x8b5cf6,.8);ring.strokeCircle(p.x,p.y-10,25*q);ring.lineStyle(2,0xc4b5fd,.55);ring.strokeCircle(p.x,p.y-10,15/q);ring.setDepth(p.y+50)}else if(ring){ring.destroy();ring=null}const state=ok?'open':'closed';if(state!==lastState){lastState=state;a.portalFxEvent=state}a.portalFx={open:ok,state};requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,1900));
})();
