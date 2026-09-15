'use strict';
/* Shadow Ascension · level-up presentation v0.1 */
(function(){
 let started=false,lastLevel=null;
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 const iso=(x,y,s)=>({x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5});
 function burst(scene,p){for(let i=0;i<8;i++){const g=scene.add.graphics();g.lineStyle(2,0xf5d06f,.8);g.lineBetween(0,-8,0,-20);g.x=p.x;g.y=p.y-18;g.rotation=i*Math.PI/4;scene.tweens.add({targets:g,scale:1.5,alpha:0,duration:650,delay:i*18,onComplete:()=>g.destroy()})}}
 function tick(){const a=globalThis.__shadowPhaserApex,scene=a&&a.scene,G=(()=>{try{return globalThis.eval('G')}catch(_){return null}})();if(!a||!scene||!G){requestAnimationFrame(tick);return}const p=G.player||G.hero||G.me,lv=p&&num(p.level,NaN);if(Number.isFinite(lv)&&lv!==lastLevel){if(lastLevel!==null){const q=iso(num(p.x),num(p.y),a.stats||{});burst(scene,q);const t=scene.add.text(q.x,q.y-70,'LEVEL UP',{fontFamily:'monospace',fontSize:'18px',fontStyle:'bold',stroke:'#120d08',strokeThickness:5});t.setOrigin(.5);t.setDepth(q.y+700);scene.tweens.add({targets:t,y:q.y-105,alpha:0,duration:1000,onComplete:()=>t.destroy()})}lastLevel=lv}a.levelUp={level:lastLevel};requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,1000));
})();
