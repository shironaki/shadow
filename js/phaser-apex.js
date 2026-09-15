/* Shadow Ascension · Phaser Apex Stage v0.3
 * Phaser owns presentation; legacy gameplay owns state and simulation.
 */
(function(){
'use strict';
const PHASER='https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
let started=false,game=null,ready=null,retryTimer=null;
const get=n=>{try{return globalThis.eval(n)}catch(_){return null}};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function loadPhaser(){
 if(globalThis.Phaser)return Promise.resolve(globalThis.Phaser);if(ready)return ready;
 ready=new Promise((resolve,reject)=>{const s=document.createElement('script');s.type='module';s.textContent=`import Phaser from '${PHASER}';globalThis.Phaser=Phaser;globalThis.dispatchEvent(new Event('shadow-phaser-ready'));`;s.onerror=reject;globalThis.addEventListener('shadow-phaser-ready',()=>resolve(globalThis.Phaser),{once:true});document.head.appendChild(s)});return ready;
}
function iso(x,y,ox,oy,tw,th){return{x:ox+(x-y)*tw*.5,y:oy+(x+y)*th*.5}}
function diamond(g,cx,cy,tw,th,fill,stroke){g.fillStyle(fill,1);g.beginPath();g.moveTo(cx,cy-th*.5);g.lineTo(cx+tw*.5,cy);g.lineTo(cx,cy+th*.5);g.lineTo(cx-tw*.5,cy);g.closePath();g.fillPath();if(stroke){g.lineStyle(1,stroke,1);g.strokePath()}}
function rect(g,x,y,w,h,r,fill,alpha=1){g.fillStyle(fill,alpha);g.fillRoundedRect(x,y,w,h,r)}
function makePixelHero(scene){
 const c=scene.add.container(0,0), key='shadow-apex-hero';
 if(!scene.textures.exists(key)){
  const W=48,H=64,scale=1,can=document.createElement('canvas');can.width=W*4;can.height=H;const ctx=can.getContext('2d');ctx.imageSmoothingEnabled=false;
  const px=ctx=>{}; const P={o:'#171322',hair:'#21182d',hair2:'#39244e',skin:'#f0b58f',skin2:'#d58a69',eye:'#15101d',cloth:'#34245a',cloth2:'#5a3b8f',belt:'#c99535',gold:'#f1c65b',boot:'#181525',steel:'#dbe6ff',steel2:'#8999bd'};
  function r(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x*4,y*4,w*4,h*4)}
  function poly(a,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(a[0][0]*4,a[0][1]*4);for(let i=1;i<a.length;i++)ctx.lineTo(a[i][0]*4,a[i][1]*4);ctx.closePath();ctx.fill()}
  function frame(f){ctx.clearRect(0,0,can.width,can.height);const bob=f===1?1:f===2?-1:0;
   // shadow / boots
   r(14,54+bob,8,6,P.o);r(27,53+bob,8,7,P.o);r(12,59+bob,12,3,P.boot);r(26,59+bob,12,3,P.boot);
   // cloak body + outline
   poly([[10,28],[38,28],[40,51+bob],[34,57+bob],[26,52+bob],[18,57+bob],[8,51+bob]],P.o);
   poly([[13,30],[35,30],[37,49+bob],[31,54+bob],[26,48+bob],[19,54+bob],[11,49+bob]],P.cloth);
   poly([[25,31],[35,31],[36,48+bob],[30,52+bob],[26,46+bob]],P.cloth2);
   // belt
   r(12,43+bob,24,4,P.belt);r(22,42+bob,5,6,P.gold);
   // neck + face
   r(21,24,7,7,P.skin2);r(12,12,24,16,P.o);r(14,13,20,14,P.skin);r(12,18,4,6,P.skin2);r(32,18,4,6,P.skin2);
   // hair cap and locks
   poly([[11,17],[13,9],[19,5],[29,6],[36,11],[35,21],[30,18],[27,12],[21,15],[18,21]],P.hair);
   poly([[14,14],[17,9],[23,7],[30,9],[33,13],[28,12],[24,15],[19,14]],P.hair2);
   poly([[13,17],[9,20],[12,23],[17,20]],P.hair2);poly([[32,16],[38,20],[35,23],[31,20]],P.hair2);
   // eyes / face
   r(17,17,4,5,P.eye);r(27,17,4,5,P.eye);r(18,17,1,2,'#fff');r(28,17,1,2,'#fff');r(22,23,4,1,P.skin2);
   // scarf
   r(14,27,20,4,P.o);r(16,27,16,3,P.cloth2);
   // arms + dagger
   r(8,32+bob,6,16,P.o);r(34,31+bob,6,16,P.o);r(9,34+bob,4,11,P.cloth2);r(35,33+bob,4,11,P.cloth2);
   r(38,29+bob,3,3,P.skin);r(40,25+bob,2,12,P.gold);poly([[42,25+bob],[47,19+bob],[44,29+bob]],P.steel);r(43,22+bob,4,2,P.steel2);
  }
  for(let f=0;f<3;f++){frame(f);ctx.drawImage(can,0,0,W*4,H, f*W*4,0,W*4,H)}
  frame(0);scene.textures.addCanvas(key,can);const t=scene.textures.get(key);t.add('idle',0,0,0,W,H);t.add('walk1',0,W,0,W,H);t.add('walk2',0,W*2,0,W,H);
 }
 const img=scene.add.image(0,0,key,'idle').setOrigin(.5,1).setScale(1.15);c.add(img);return {container:c,img};
}
function makeProp(scene,type){const c=scene.add.container(0,0),g=scene.add.graphics();
 if(type==='torch'){g.fillStyle(0x171321,1);g.fillRect(-3,-2,6,18);g.fillStyle(0x9a6531,1);g.fillRect(-2,0,4,14);g.fillStyle(0xffd36a,1);g.fillTriangle(0,-18,-7,-3,7,-3);g.fillStyle(0xfff0b0,1);g.fillTriangle(0,-13,-3,-4,3,-4);}
 else if(type==='crystal'){g.fillStyle(0x24193d,1);g.fillTriangle(0,-24,-9,4,10,4);g.fillStyle(0x8b5cf6,1);g.fillTriangle(0,-20,-5,1,6,1);g.fillStyle(0xc4b5fd,.8);g.fillTriangle(0,-18,2,-1,-2,-1);}
 else if(type==='chest'){g.fillStyle(0x171321,1);g.fillRoundedRect(-15,-11,30,20,3);g.fillStyle(0x7b4b29,1);g.fillRoundedRect(-12,-9,24,15,2);g.fillStyle(0xc58b37,1);g.fillRect(-2,-8,4,12);g.fillStyle(0xf0c15b,1);g.fillRect(-3,-2,6,4);}
 else {g.fillStyle(0x171321,1);g.fillCircle(0,0,11);g.fillStyle(0x4b4165,1);g.fillCircle(0,-4,8);g.fillStyle(0x8b5cf6,1);g.fillCircle(0,-7,3);}
 c.add(g);return c;
}
function buildScene(Phaser){return class ApexScene extends Phaser.Scene{
 constructor(){super({key:'ShadowApex'});this.floor=null;this.walls=[];this.props=[];this.fx=null;this.hero=null;this.lastKey='';this.world=null;this.worldW=0;this.worldH=0;}
 create(){this.cameras.main.setBackgroundColor('#070712');this.floor=this.add.graphics();this.fx=this.add.graphics();this.world=this.add.container(0,0);this.world.add([this.floor,this.fx]);this.hero=makePixelHero(this);this.world.add(this.hero.container);this.redraw(true);this.scale.on('resize',()=>this.redraw(true));}
 clearWalls(){for(const o of this.walls)o.destroy();this.walls=[];for(const o of this.props)o.destroy();this.props=[];}
 redraw(force){const M=get('M'),G=get('G');if(!M||!M.grid)return;const w=this.scale.width,h=this.scale.height;const tw=clamp(Math.min(w/12,58),34,58),th=tw*.5;this.tw=tw;this.th=th;this.ox=(M.H+1)*tw*.5+40;this.oy=70;this.floor.clear();this.clearWalls();
  const cells=[];let minX=99999,maxX=-99999,minY=99999,maxY=-99999;
  this.floor.fillStyle(0x090812,1);this.floor.fillRect(-2000,-2000,4000,4000);
  for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++)if(M.grid[y]?.[x]){const p=iso(x+.5,y+.5,this.ox,this.oy,tw,th),v=((x*17+y*31+((G&&G.seed)||0))%9===0)?0x30284a:0x25203a;diamond(this.floor,p.x,p.y,tw-.7,th-.7,v,0x3f3658);cells.push([x,y]);minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y)}
  const wallH=th*2.25;
  const edges=[];for(const [x,y] of cells){const es=[{nx:x-1,ny:y,a:[x,y+1],b:[x,y],side:'west'},{nx:x,ny:y-1,a:[x,y],b:[x+1,y],side:'north'},{nx:x+1,ny:y,a:[x+1,y],b:[x+1,y+1],side:'east'},{nx:x,ny:y+1,a:[x+1,y+1],b:[x,y+1],side:'south'}];for(const e of es)if(!M.grid[e.ny]?.[e.nx])edges.push({x,y,e})}
  edges.sort((A,B)=>{const a=iso((A.e.a[0]+A.e.b[0])*.5,(A.e.a[1]+A.e.b[1])*.5,this.ox,this.oy,tw,th).y;const b=iso((B.e.a[0]+B.e.b[0])*.5,(B.e.a[1]+B.e.b[1])*.5,this.ox,this.oy,tw,th).y;return a-b});
  for(const item of edges){const e=item.e,a=iso(e.a[0],e.a[1],this.ox,this.oy,tw,th),b=iso(e.b[0],e.b[1],this.ox,this.oy,tw,th),g=this.add.graphics();const dark=e.side==='north'||e.side==='west';g.fillStyle(dark?0x302944:0x3d3452,1);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.lineTo(b.x,b.y+wallH);g.lineTo(a.x,a.y+wallH);g.closePath();g.fillPath();g.lineStyle(1,0x161222,.95);g.strokePath();g.lineStyle(2,dark?0x6e6288:0x85749d,.7);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.strokePath();
   const seg=Math.max(1,Math.floor(tw/12));for(let yy=th;yy<wallH-2;yy+=th){g.lineStyle(1,0x191526,.42);g.beginPath();g.moveTo(a.x,a.y+yy);g.lineTo(b.x,b.y+yy);g.strokePath()}g.setDepth((a.y+b.y)*.5);this.walls.push(g);
  }
  // Decorative props from the gameplay map, kept presentation-only.
  const list=[];if(Array.isArray(M.torches))for(const p of M.torches)list.push(['torch',p]);if(Array.isArray(M.crystals))for(const p of M.crystals)list.push(['crystal',p]);if(M.chest)list.push(['chest',M.chest]);if(M.portal)list.push(['portal',M.portal]);
  for(const [type,p] of list){if(!p)continue;const q=iso(p.x+.5,p.y+.5,this.ox,this.oy,tw,th),o=makeProp(this,type);o.x=q.x;o.y=q.y;o.setDepth(q.y+5);this.world.add(o);this.props.push(o)}
  this.lastKey=String(G&&G.seed)+'|'+M.W+'x'+M.H+'|'+w+'x'+h;this.worldW=Math.max(w,maxX-minX+160);this.worldH=Math.max(h,maxY-minY+wallH+160);
 }
 update(){const G=get('G'),M=get('M');if(!G||!M||!G.player)return;if(M.grid&&this.lastKey!==String(G&&G.seed)+'|'+M.W+'x'+M.H+'|'+this.scale.width+'x'+this.scale.height)this.redraw(true);const p=G.player,q=iso(p.x+.5,p.y+.5,this.ox,this.oy,this.tw,this.th);this.hero.container.x=q.x;this.hero.container.y=q.y+2;this.hero.container.setDepth(q.y+80);const moving=!!p.moving;this.hero.img.setTexture('shadow-apex-hero',moving?(Math.floor(this.time.now/150)%2?'walk1':'walk2'):'idle');this.hero.img.y=moving?Math.sin(this.time.now*.018)*2:-1;
  this.fx.clear();this.fx.fillStyle(0x000000,.32);this.fx.fillEllipse(q.x,q.y+5,34,11);this.fx.fillStyle(0x8b5cf6,.10);this.fx.fillEllipse(q.x,q.y-3,28,32);for(let i=0;i<6;i++){const a=this.time.now*.00022+i*1.7,r=18+(i*17)%48;this.fx.fillStyle(i%2?0x7c3aed:0xc4b5fd,.22);this.fx.fillCircle(q.x+Math.cos(a)*r,q.y-20+Math.sin(a)*r*.3,1.2)}
 }
};}
async function start(){if(started)return;try{const Phaser=await loadPhaser();if(!get('M')||!get('G')){retryTimer=setTimeout(start,400);return}started=true;const old=document.getElementById('cv');if(old)old.style.visibility='hidden';let host=document.getElementById('phaser-apex');if(!host){host=document.createElement('div');host.id='phaser-apex';host.style.cssText='position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none';document.body.appendChild(host)}game=new Phaser.Game({type:Phaser.AUTO,parent:host,width:innerWidth,height:innerHeight,backgroundColor:'#070712',render:{antialias:true,pixelArt:false,roundPixels:false},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},scene:buildScene(Phaser)});globalThis.__shadowPhaserApex={game,version:'0.3.0',engine:'Phaser 3.90',renderer:'iso-depth'};}catch(e){started=false;console.error('[PhaserApex]',e);retryTimer=setTimeout(start,1200)}}
window.addEventListener('load',()=>setTimeout(start,250));window.addEventListener('shadow-start-phaser',start);window.addEventListener('resize',()=>{if(started&&game)game.scale.resize(innerWidth,innerHeight)});
})();
