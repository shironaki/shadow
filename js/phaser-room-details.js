'use strict';
/* Shadow Ascension · room details v0.1 */
(function(){
 const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
 let started=false,sceneRef=null,signature='';
 function iso(x,y,s){return{x:s.ox+(x-y)*s.tw*.5,y:s.oy+(x+y)*s.th*.5}}
 function draw(scene,s){const G=get('G'),grid=G&&G.grid;if(!Array.isArray(grid))return false;const sig=grid.length+':'+grid.map(r=>Array.isArray(r)?r.length:0).join(',');if(sig===signature)return true;signature=sig;const layer=scene.add.container(0,0);layer.setDepth(100);for(let y=0;y<grid.length;y++)for(let x=0;x<(Array.isArray(grid[y])?grid[y].length:0);x++){const v=grid[y][x];if(v===0||v===false||v==null)continue;const p=iso(x,y,s),g=scene.add.graphics();if((x+y)%7===0){g.fillStyle(0xc4b5fd,.10);g.fillCircle(p.x,p.y-3,2)}if((x*3+y)%11===0){g.lineStyle(1,0x8b5cf6,.18);g.lineBetween(p.x-7,p.y,p.x+7,p.y)}layer.add(g)}sceneRef=layer;return true}
 function tick(){const a=globalThis.__shadowPhaserApex,s=a&&a.scene,G=get('G');if(!s||!G){requestAnimationFrame(tick);return}const st=a.stats||s;if(!sceneRef)draw(s,st);a.roomDetailsStats={active:!!sceneRef,signature};requestAnimationFrame(tick)}
 function start(){if(started)return;started=true;requestAnimationFrame(tick)}
 window.addEventListener('shadow-start-phaser',start);window.addEventListener('load',()=>setTimeout(start,1100));
})();
