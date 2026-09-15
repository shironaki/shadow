/* Shadow Ascension · Phaser Apex Stage
 * Phaser owns presentation; legacy gameplay owns state and simulation.
 */
(function(){
'use strict';
const PHASER='https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
let started=false,game=null,ready=null;
const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
function loadPhaser(){
 if(globalThis.Phaser)return Promise.resolve(globalThis.Phaser);if(ready)return ready;
 ready=new Promise((resolve,reject)=>{const s=document.createElement('script');s.type='module';s.textContent=`import Phaser from '${PHASER}';globalThis.Phaser=Phaser;globalThis.dispatchEvent(new Event('shadow-phaser-ready'));`;s.onerror=reject;globalThis.addEventListener('shadow-phaser-ready',()=>resolve(globalThis.Phaser),{once:true});document.head.appendChild(s)});return ready;
}
function iso(x,y,ox,oy,tw,th){return{x:ox+(x-y)*tw*.5,y:oy+(x+y)*th*.5}}
function diamond(g,cx,cy,tw,th,fill,stroke){g.fillStyle(fill,1);g.beginPath();g.moveTo(cx,cy-th*.5);g.lineTo(cx+tw*.5,cy);g.lineTo(cx,cy+th*.5);g.lineTo(cx-tw*.5,cy);g.closePath();g.fillPath();if(stroke){g.lineStyle(1,stroke,1);g.strokePath()}}
function makeHero(scene){
 const c=scene.add.container(0,0),g=scene.add.graphics();
 // A compact, high-contrast chibi silhouette designed for small screens.
 g.fillStyle(0x000000,.38);g.fillEllipse(0,16,30,10);
 g.fillStyle(0x14121d,1);g.fillRoundedRect(-10,6,8,10,3);g.fillRoundedRect(2,6,8,10,3);
 g.fillStyle(0x34254f,1);g.fillRoundedRect(-12,-5,24,18,7);g.fillStyle(0x8b5cf6,1);g.fillTriangle(0,-5,-8,10,8,10);
 g.fillStyle(0xe7b34b,1);g.fillRect(-11,5,22,3);g.fillStyle(0xffef9a,1);g.fillRect(-2,4,4,5);
 g.fillStyle(0xe9aa82,1);g.fillCircle(0,-17,15);g.fillStyle(0xd18b67,1);g.fillCircle(-14,-16,4);g.fillCircle(14,-16,4);
 g.fillStyle(0x211a31,1);g.fillCircle(-6,-27,9);g.fillCircle(5,-28,10);g.fillCircle(11,-21,6);g.fillTriangle(-13,-24,-3,-35,1,-20);g.fillTriangle(0,-29,8,-36,10,-20);
 g.fillStyle(0xf5bd98,1);g.fillEllipse(0,-16,22,21);g.fillStyle(0x211a31,1);g.fillTriangle(-10,-23,0,-32,1,-19);g.fillTriangle(0,-28,8,-33,8,-18);
 g.fillStyle(0x100d18,1);g.fillEllipse(-5,-16,4.5,6);g.fillEllipse(5,-16,4.5,6);g.fillStyle(0xffffff,1);g.fillCircle(-4.2,-17,1.1);g.fillCircle(5.8,-17,1.1);
 g.lineStyle(1.2,0x8c3d4c,1);g.beginPath();g.arc(0,-10,3,.15,Math.PI-.15);g.strokePath();g.fillStyle(0x171324,1);g.fillRoundedRect(-12,-5,24,7,4);
 g.lineStyle(3,0xd8a23f,1);g.beginPath();g.moveTo(10,8);g.lineTo(19,-7);g.strokePath();g.fillStyle(0xcbd6ff,1);g.fillTriangle(19,-7,25,-14,21,-4);
 c.add(g);return c;
}
function buildScene(Phaser){return class ApexScene extends Phaser.Scene{
 constructor(){super({key:'ShadowApex'});this.mapG=null;this.wallG=null;this.fxG=null;this.hero=null;this.lastMap='';}
 create(){this.cameras.main.setBackgroundColor('#070712');this.mapG=this.add.graphics();this.wallG=this.add.graphics();this.fxG=this.add.graphics();this.hero=makeHero(this);this.redraw(true);}
 redraw(force){const M=get('M'),G=get('G');if(!M||!M.grid)return;const key=String(G&&G.seed)+'|'+String(G&&G.mode)+'|'+String(M.W)+'x'+String(M.H)+'|'+this.scale.width+'x'+this.scale.height;if(!force&&key===this.lastMap)return;this.lastMap=key;const tw=Math.max(30,Math.min(54,this.scale.width/Math.max(9,(M.W+M.H)*.32))),th=tw*.5,ox=this.scale.width*.5,oy=Math.max(86,this.scale.height*.20);this.tw=tw;this.th=th;this.ox=ox;this.oy=oy;this.mapG.clear();this.wallG.clear();this.mapG.fillStyle(0x090812,1);this.mapG.fillRect(0,0,this.scale.width,this.scale.height);
 const cells=[];for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++)if(M.grid[y]?.[x]){const p=iso(x+.5,y+.5,ox,oy,tw,th),v=((x*17+y*31+((G&&G.seed)||0))%11===0)?0x2d2743:0x242039;diamond(this.mapG,p.x,p.y,tw-.8,th-.8,v,0x393154);cells.push([x,y])}
 const wallH=th*.82;
 for(const [x,y] of cells){const edges=[{nx:x-1,ny:y,a:[x,y+1],b:[x,y]},{nx:x,ny:y-1,a:[x,y],b:[x+1,y]},{nx:x+1,ny:y,a:[x+1,y],b:[x+1,y+1]},{nx:x,ny:y+1,a:[x+1,y+1],b:[x,y+1]}];for(const e of edges){if(M.grid[e.ny]?.[e.nx])continue;const a=iso(e.a[0],e.a[1],ox,oy,tw,th),b=iso(e.b[0],e.b[1],ox,oy,tw,th);this.wallG.fillStyle((e.a[0]+e.b[0]+e.a[1]+e.b[1])%2?0x39334f:0x302a47,1);this.wallG.beginPath();this.wallG.moveTo(a.x,a.y);this.wallG.lineTo(b.x,b.y);this.wallG.lineTo(b.x,b.y+wallH);this.wallG.lineTo(a.x,a.y+wallH);this.wallG.closePath();this.wallG.fillPath();this.wallG.lineStyle(1,0x151220,.95);this.wallG.strokePath();this.wallG.lineStyle(2,0x71658f,.55);this.wallG.beginPath();this.wallG.moveTo(a.x,a.y);this.wallG.lineTo(b.x,b.y);this.wallG.strokePath()}}
 }
 update(){const G=get('G'),M=get('M');if(!G||!M)return;if(M.grid)this.redraw(false);if(!G.player||!this.hero||!this.tw)return;const p=G.player,q=iso(p.x+.5,p.y+.5,this.ox,this.oy,this.tw,this.th);this.hero.x=q.x;this.hero.y=q.y-this.th*.34;this.hero.setDepth(q.y+50);const moving=!!p.moving,bob=moving?Math.sin(this.time.now*.018)*1.2:Math.sin(this.time.now*.003)*.35;this.hero.y+=bob;this.fxG.clear();this.fxG.fillStyle(0x8b5cf6,.10);this.fxG.fillEllipse(q.x,q.y+7,32,11);for(let i=0;i<8;i++){const a=this.time.now*.00018+i*2.41,r=18+(i*13)%68;this.fxG.fillStyle(i%3===0?0xc4b5fd:0x7c3aed,.16);this.fxG.fillCircle(q.x+Math.cos(a)*r,q.y-18+Math.sin(a)*r*.35,1.1)}}
};}
async function start(){if(started)return;try{const Phaser=await loadPhaser();if(!get('M')||!get('G'))return;started=true;const old=document.getElementById('cv');if(old)old.style.visibility='hidden';let host=document.getElementById('phaser-apex');if(!host){host=document.createElement('div');host.id='phaser-apex';host.style.cssText='position:absolute;inset:0;z-index:1;overflow:hidden';document.body.appendChild(host)}game=new Phaser.Game({type:Phaser.AUTO,parent:host,width:innerWidth,height:innerHeight,backgroundColor:'#070712',render:{antialias:true,pixelArt:false,roundPixels:false},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},scene:buildScene(Phaser)});globalThis.__shadowPhaserApex={game,version:'0.2.0',engine:'Phaser 3.90'};}catch(e){started=false;console.error('[PhaserApex]',e)}}
window.addEventListener('load',()=>setTimeout(start,250));window.addEventListener('shadow-start-phaser',start);
})();
