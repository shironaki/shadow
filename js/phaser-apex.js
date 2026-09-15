/* Shadow Ascension · Phaser Apex Stage
 * Rendering engine only. Existing gameplay/state remain authoritative.
 * Phaser 3 is loaded from jsDelivr so this branch can be tested without a build toolchain.
 */
(function(){
  'use strict';
  const PHASER='https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
  let started=false, game=null, ready=null;
  const state={seed:null,mode:null,w:0,h:0};

  function loadPhaser(){
    if(window.Phaser) return Promise.resolve(window.Phaser);
    if(ready) return ready;
    ready=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.type='module';
      s.textContent=`import Phaser from '${PHASER}'; window.Phaser=Phaser; window.dispatchEvent(new Event('shadow-phaser-ready'));`;
      s.onerror=reject;
      window.addEventListener('shadow-phaser-ready',()=>resolve(window.Phaser),{once:true});
      document.head.appendChild(s);
    });
    return ready;
  }

  function iso(x,y,ox,oy,tw,th){return {x:ox+(x-y)*tw*.5,y:oy+(x+y)*th*.5};}
  function diamond(g,cx,cy,tw,th,fill,stroke,sw){
    g.fillStyle(fill,1); g.beginPath();
    g.moveTo(cx,cy-th*.5); g.lineTo(cx+tw*.5,cy); g.lineTo(cx,cy+th*.5); g.lineTo(cx-tw*.5,cy); g.closePath(); g.fillPath();
    if(stroke){g.lineStyle(sw,stroke,1);g.strokePath();}
  }
  function hex(n){return Phaser.Display.Color.HexStringToColor(n).color;}

  function makeHero(scene){
    const c=scene.add.container(0,0).setDepth(100000);
    const g=scene.add.graphics();
    // Ground shadow
    g.fillStyle(0x000000,.32); g.fillEllipse(0,15,24,9);
    // Boots
    g.fillStyle(0x171522,1); g.fillRoundedRect(-10,7,8,8,3); g.fillRoundedRect(2,7,8,8,3);
    // Body / tunic
    g.fillStyle(0x34234e,1); g.fillRoundedRect(-12,-3,24,17,7);
    g.fillStyle(0x7c3aed,1); g.fillTriangle(0,-3,-8,10,8,10);
    // Belt
    g.fillStyle(0xf0b84b,1); g.fillRect(-11,5,22,3); g.fillStyle(0xfff0a0,1); g.fillRect(-2,4,4,5);
    // Head silhouette
    g.fillStyle(0xf1b78d,1); g.fillCircle(0,-16,15);
    // Ears
    g.fillStyle(0xd99470,1); g.fillCircle(-14,-15,4); g.fillCircle(14,-15,4);
    // Hair mass
    g.fillStyle(0x211b32,1); g.fillCircle(-6,-25,8); g.fillCircle(5,-26,10); g.fillCircle(11,-20,6);
    g.fillTriangle(-13,-24,-3,-33,1,-22); g.fillTriangle(0,-27,7,-35,10,-21);
    // Face panel
    g.fillStyle(0xf7c6a1,1); g.fillEllipse(0,-16,22,21);
    // Hair fringe
    g.fillStyle(0x211b32,1); g.fillTriangle(-10,-23,0,-31,1,-19); g.fillTriangle(0,-27,8,-32,8,-18);
    // Eyes
    g.fillStyle(0x100d18,1); g.fillEllipse(-5,-16,4.5,6); g.fillEllipse(5,-16,4.5,6);
    g.fillStyle(0xffffff,.95); g.fillCircle(-4.2,-17,1.1); g.fillCircle(5.8,-17,1.1);
    // Mouth
    g.lineStyle(1.2,0x8c3d4c,1); g.beginPath(); g.arc(0,-10,3,0.15,Math.PI-.15); g.strokePath();
    // Hood/collar
    g.fillStyle(0x161324,1); g.fillRoundedRect(-12,-5,24,7,4);
    // Weapon silhouette
    g.lineStyle(3,0xd9a441,1); g.beginPath(); g.moveTo(10,8); g.lineTo(19,-7); g.strokePath();
    g.fillStyle(0xc9d2ff,1); g.fillTriangle(19,-7,25,-14,21,-4);
    c.add(g);
    return c;
  }

  function buildScene(Phaser){
    class ApexScene extends Phaser.Scene{
      constructor(){super({key:'ShadowApex'});this.mapG=null;this.wallG=null;this.fxG=null;this.hero=null;this.lastMap=null;this.lastSize='';}
      create(){
        this.cameras.main.setBackgroundColor('#070712');
        this.mapG=this.add.graphics();this.wallG=this.add.graphics();this.fxG=this.add.graphics();
        this.hero=makeHero(this);
        this.events.on('shutdown',()=>{});
        this.redraw(true);
      }
      redraw(force){
        const M=window.M,G=window.G;if(!M||!M.grid)return;
        const key=String(G?.seed)+'|'+String(G?.mode)+'|'+String(M.W)+'x'+String(M.H)+'|'+this.scale.width+'x'+this.scale.height;
        if(!force&&key===this.lastMap)return;
        this.lastMap=key;
        const tw=Math.max(30,Math.min(54,this.scale.width/Math.max(9,(M.W+M.H)*.32)));
        const th=tw*.5;
        const ox=this.scale.width*.5;
        const oy=Math.max(90,this.scale.height*.22);
        this.tw=tw;this.th=th;this.ox=ox;this.oy=oy;
        this.mapG.clear();this.wallG.clear();
        // Deep backdrop plane
        this.mapG.fillStyle(0x0b0a16,1);this.mapG.fillRect(0,0,this.scale.width,this.scale.height);
        const roomCells=[];
        for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){
          const p=iso(x+.5,y+.5,ox,oy,tw,th);const open=!!M.grid[y]?.[x];
          if(open){
            const edge=((x*17+y*31+(G.seed||0))%9===0);
            const floor=edge?0x2a2440:0x242039;
            diamond(this.mapG,p.x,p.y,tw-.8,th-.8,floor,0x393154,1);
            // inset floor plate
            if((x+y)%3===0){const q=iso(x+.5,y+.5,ox,oy,tw*.82,th*.82);diamond(this.mapG,q.x,q.y,tw*.82,th*.82,0x28233f,null,0);}
            roomCells.push([x,y]);
          }
        }
        // Real architectural walls: only exposed faces, each face is a solid prism.
        const wallH=th*.78;
        for(const [x,y] of roomCells){
          const faces=[[x-1,y,'L'],[x,y-1,'R'],[x+1,y,'R'],[x,y+1,'L']];
          for(const [nx,ny,side] of faces){
            if(M.grid[ny]?.[nx])continue;
            const a=iso(x+(side==='L'?0:1),y+(side==='L'?1:0),ox,oy,tw,th);
            const b=iso(x+(side==='L'?0:1),y+(side==='L'?0:1),ox,oy,tw,th);
            const topA={x:a.x,y:a.y};const topB={x:b.x,y:b.y};
            const botA={x:a.x,y:a.y+wallH};const botB={x:b.x,y:b.y+wallH};
            const col=side==='L'?0x3b3454:0x322c4a;
            this.wallG.fillStyle(col,1);this.wallG.beginPath();
            this.wallG.moveTo(topA.x,topA.y);this.wallG.lineTo(topB.x,topB.y);this.wallG.lineTo(botB.x,botB.y);this.wallG.lineTo(botA.x,botA.y);this.wallG.closePath();this.wallG.fillPath();
            this.wallG.lineStyle(1,0x161321,.9);this.wallG.strokePath();
            this.wallG.lineStyle(2,0x665b85,.55);this.wallG.beginPath();this.wallG.moveTo(topA.x,topA.y);this.wallG.lineTo(topB.x,topB.y);this.wallG.strokePath();
          }
        }
      }
      update(){
        const G=window.G;if(!G||!G.player||!this.hero)return;
        const M=window.M; if(!M?.grid)return;
        const p=G.player;const q=iso(p.x+.5,p.y+.5,this.ox,this.oy,this.tw,this.th);
        this.hero.x=q.x;this.hero.y=q.y-(this.th*.35);
        this.hero.setDepth(q.y+40);
        const moving=!!p.moving;
        const bob=moving?Math.sin(this.time.now*.018)*1.5:Math.sin(this.time.now*.003)*.45;
        this.hero.scaleY=1+bob*.015;this.hero.y+=bob;
        this.fxG.clear();
        this.fxG.fillStyle(0x8b5cf6,.11);this.fxG.fillEllipse(q.x,q.y+7,32,12);
        // Sparse atmospheric motes, deterministic by time.
        for(let i=0;i<10;i++){
          const a=this.time.now*.00018+i*2.41;const r=18+(i*13)%70;
          const x=q.x+Math.cos(a)*r,y=q.y-18+Math.sin(a)*r*.35;
          this.fxG.fillStyle(i%3===0?0xc4b5fd:0x7c3aed,.18);this.fxG.fillCircle(x,y,1.2);
        }
      }
      resize(){this.lastMap='';this.redraw(true);}
    }
    return ApexScene;
  }

  async function start(){
    if(started)return;
    try{
      const Phaser=await loadPhaser();
      if(!window.M||!window.G){console.warn('[PhaserApex] gameplay globals not ready');return;}
      started=true;
      const old=document.getElementById('cv'); if(old)old.style.visibility='hidden';
      let host=document.getElementById('phaser-apex');
      if(!host){host=document.createElement('div');host.id='phaser-apex';host.style.cssText='position:absolute;inset:0;z-index:1;overflow:hidden';document.body.appendChild(host);}
      game=new Phaser.Game({type:Phaser.AUTO,parent:host,width:window.innerWidth,height:window.innerHeight,backgroundColor:'#070712',render:{antialias:true,pixelArt:false,roundPixels:false},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},scene:buildScene(Phaser)});
      window.__shadowPhaserApex={game,version:'0.1.0',engine:'Phaser 3.90'};
    }catch(e){started=false;console.error('[PhaserApex]',e);}
  }
  window.addEventListener('load',()=>setTimeout(start,50));
  window.addEventListener('shadow-start-phaser',start);
})();
