'use strict';
/* Shadow Ascension · Mobile Presentation Polish v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};let started=false,sceneRef=null,ui=null,last=0;
 function boot(scene){if(sceneRef===scene)return;sceneRef=scene;const c=scene.add.container(0,0);c.setDepth(1200000);const w=scene.scale.width,h=scene.scale.height;const mk=(x,y,r,label)=>{const g=scene.add.graphics();g.fillStyle(0x09070f,.55);g.lineStyle(2,0x8b5cf6,.65);g.fillCircle(x,y,r);g.strokeCircle(x,y,r);const t=scene.add.text(x,y,label,{fontFamily:'monospace',fontSize:'12px',fontStyle:'bold',stroke:'#09070f',strokeThickness:3}).setOrigin(.5);c.add(g);c.add(t);return{g,t}};ui={layer:c,buttons:[mk(w-76,h-92,29,'ATK'),mk(w-148,h-150,24,'Q'),mk(w-84,h-184,24,'E'),mk(w-210,h-94,24,'X')]};c.setAlpha(0);globalThis.__shadowPhaserApex.mobilePolish={version:'0.1',buttons:4};}
 function tick(t){const a=globalThis.__shadowPhaserApex,s=a&&a.scene;if(!s){requestAnimationFrame(tick);return}boot(s);const touch=document.body&&document.body.classList.contains('touch');if(ui){ui.layer.setAlpha(touch?.88:0);if(touch&&t-last>180){ui.buttons.forEach((b,i)=>b.g.setAlpha(.45+.12*Math.sin(t*.004+i)));last=t}}requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,1500));
})();
