import './visual-upgrade.js?v=0.13.0';
import './qa.js?v=0.13.0';
/**
 * Shadow Ascension - Production Kit CharacterRenderer.
 * Rendering only: movement, combat and state ownership stay in gameplay code.
 */
'use strict';
class CharacterRenderer {
  constructor(ctx, manifest, characterId, options = {}) {
    this.ctx=ctx; this.manifest=manifest; this.characterId=characterId; this.data=manifest.characters[characterId];
    if(!this.data)throw new Error(`Unknown character: ${characterId}`);
    this.frameW=manifest.canvas.logicalWidth; this.frameH=manifest.canvas.logicalHeight;
    this.columns=Math.max(1,manifest.spritePacking?.columnsPerFrame||3);
    this.characterColumn=Math.min(this.columns-1,Math.max(0,manifest.spritePacking?.characterColumn??1));
    this.sourceW=this.frameW/this.columns;
    this.state='idle'; this.frame=0; this.elapsed=0; this.done=false; this.flipX=false;
    this.scale=options.scale??.42; this.x=options.x??0; this.y=options.y??0; this.anchorY=options.anchorY??1; this.shadow=options.shadow??true; this.images=Object.create(null); this.loading=this.load();
  }
  loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Failed to load sprite: ${src}`));img.src=src})}
  async load(){await Promise.all(Object.entries(this.data.sprites).map(async([state,src])=>{const img=await this.loadImage(src),frames=this.manifest.animations[state]?.frames;if(!frames||img.width<frames*this.frameW||img.height<this.frameH)throw new Error(`Invalid sprite sheet for ${state}: ${src}`);this.images[state]=img}));return this}
  setAnimation(state,restart=false){if(!this.manifest.animations[state])throw new Error(`Unknown animation: ${state}`);if(state!==this.state||restart){this.state=state;this.frame=0;this.elapsed=0;this.done=false}}
  playOnce(state){this.setAnimation(state,true)}
  update(dtMs){const anim=this.manifest.animations[this.state];if(!anim||(this.done&&!anim.loop))return;this.elapsed+=Math.max(0,dtMs);const ft=1000/anim.fps;while(this.elapsed+1e-7>=ft){this.elapsed-=ft;this.frame++;if(this.frame>=anim.frames){if(anim.loop)this.frame=0;else{this.frame=anim.frames-1;this.done=true;this.elapsed=0;break}}}}
  draw(options={}){const img=this.images[this.state];if(!img)return false;const c=this.ctx,s=options.scale??this.scale,x=options.x??this.x,y=options.y??this.y,a=options.alpha??1,dw=this.sourceW*s,dh=this.frameH*s,dx=x-dw/2,dy=y-dh*this.anchorY,sx=this.frame*this.frameW+this.characterColumn*this.sourceW;c.save();c.globalAlpha=a;c.imageSmoothingEnabled=false;if(this.shadow){c.save();c.globalAlpha=.22*a;c.fillStyle='#000';c.beginPath();c.ellipse(x,y+5*s,18*s,5*s,0,0,Math.PI*2);c.fill();c.restore()}c.translate(dx+(this.flipX?dw:0),dy);if(this.flipX)c.scale(-1,1);c.drawImage(img,sx,0,this.sourceW,this.frameH,0,0,dw,dh);c.restore();return true}
}
window.CharacterRenderer=CharacterRenderer;
(function(){
  if(window.__shadowCharacterRendererInstalled)return;
  window.__shadowCharacterRendererInstalled=true;
  const CLASS_MAP={shade:'assassin',ward:'warrior',mage:'mage'};
  let manifest=null,renderer=null,loadingId='',loadToken=0,updateHookInstalled=false;
  let visualFrame=0,drawnFrame=-1,loadedSprites='';
  const spriteSet=()=>(typeof SET!=='undefined'&&SET.sprites)||'user';
  const manifestUrl=()=>spriteSet()==='gen'?'assets/manifest-gen.json':'assets/manifest.json';
  function loadManifest(){loadedSprites=spriteSet();manifest=null;renderer=null;loadToken++;loadingId='';
    fetch(manifestUrl(),{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('manifest HTTP '+r.status);return r.json()}).then(m=>{manifest=m;sync()}).catch(e=>console.warn('[CharacterRenderer] manifest load failed:',e))}
  function game(){try{return globalThis.eval('G')}catch(_){return null}}
  function context(){try{return globalThis.eval('ctx')}catch(_){const cv=document.getElementById('cv');return cv?cv.getContext('2d'):null}}
  function characterId(p){return (CLASS_MAP[p.cls]||'assassin')+'_'+(p.sex==='f'?'female':'male')}
  function stateFor(p){const g=game();if(p.dead)return'death';if(g&&g.hurtT>0)return'hurt';if(p.atkT>0||p.swingT>0)return'attack';return p.moving?'walk':'idle'}
  async function ensureRenderer(){const g=game();if(!manifest||!g||!g.player)return;const id=characterId(g.player);if(renderer&&renderer.characterId===id)return;if(loadingId===id)return;loadingId=id;const token=++loadToken;renderer=null;try{const next=new CharacterRenderer(context(),manifest,id,{scale:.34,anchorY:1,shadow:true});await next.loading;if(token!==loadToken)return;const cur=game();if(cur&&cur.player&&characterId(cur.player)===id)renderer=next}catch(e){if(token===loadToken)console.warn('[CharacterRenderer] sprite load failed:',e)}finally{if(loadingId===id)loadingId=''}}
  function sync(){if(spriteSet()!==loadedSprites)loadManifest();const g=game();if(!g||!g.player||!manifest)return;ensureRenderer();if(!renderer)return;const st=stateFor(g.player);if(st==='attack'&&renderer.state!=='attack')renderer.playOnce('attack');else if(st==='hurt'&&renderer.state!=='hurt')renderer.playOnce('hurt');else if(st==='death'&&renderer.state!=='death')renderer.playOnce('death');else if(st==='walk'&&renderer.state!=='walk')renderer.setAnimation('walk');else if(st==='idle'&&renderer.state!=='idle'&&renderer.done)renderer.setAnimation('idle');if(g.player.face!==undefined)renderer.flipX=g.player.face<0}
  function nextVisualFrame(){visualFrame++;requestAnimationFrame(nextVisualFrame)}
  requestAnimationFrame(nextVisualFrame);
  const legacyDrawPlayer=globalThis.eval('drawPlayer');
  window.__shadowCharacterDraw=function(X,Y){if(drawnFrame===visualFrame)return;drawnFrame=visualFrame;const g=game();if(renderer&&renderer.draw({x:X,y:Y,scale:.34,alpha:g&&g.stealth>0?.4:.98}))return;drawnFrame=-1;if(typeof legacyDrawPlayer==='function')legacyDrawPlayer(X,Y)};
  globalThis.eval('drawPlayer=window.__shadowCharacterDraw');
  function installUpdateHook(){if(updateHookInstalled)return true;let legacyUpdate;try{legacyUpdate=globalThis.eval('update')}catch(_){return false}updateHookInstalled=true;window.__shadowCharacterUpdate=function(dt){if(typeof legacyUpdate==='function')legacyUpdate(dt);sync();if(renderer)renderer.update(dt*1000)};globalThis.eval('update=window.__shadowCharacterUpdate');return true}
  queueMicrotask(()=>{if(!installUpdateHook())setTimeout(installUpdateHook,0)});
  loadManifest();
})();
