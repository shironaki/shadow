'use strict';
/* Shadow Ascension · Arena Atmosphere v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
 let started=false,sceneRef=null,embers=[];
 function iso(x,y,s){return{x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5}}
 function boot(scene){if(sceneRef===scene)return;sceneRef=scene;const apex=globalThis.__shadowPhaserApex||{},s=apex.stats||scene;
  const layer=scene.add.container(0,0);layer.setDepth(100);for(let i=0;i<18;i++){const g=scene.add.graphics();g.fillStyle(0xc4b5fd,.22);g.fillCircle(0,0,1.5+(i%3));g.x=60+(i*97)%Math.max(160,scene.scale.width);g.y=70+(i*53)%Math.max(160,scene.scale.height);layer.add(g);embers.push({g,v:.2+(i%4)*.08,p: i*.7})}
  apex.arenaAtmosphere={version:'0.1',embers:embers.length};
 }
 function tick(t){const apex=globalThis.__shadowPhaserApex,scene=apex&&apex.scene;if(!scene){requestAnimationFrame(tick);return}boot(scene);for(const e of embers){e.g.y-=e.v;if(e.g.y<20)e.g.y=scene.scale.height+20;e.g.alpha=.12+.14*Math.sin(t*.002+e.p)}requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,1200));
})();
