'use strict';
/* ═══ SHADOW ENGINE · ядро: утилиты, звук, ввод, камера, свет, физика ═══ */
const VER='0.8.1';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const irand=(a,b)=>Math.floor(rand(a,b+1));
const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const TAU=Math.PI*2;
const fmt=n=>Math.round(n).toLocaleString('ru-RU');
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash2(x,y){let h=(x*374761393+y*668265263)^(x<<7);h=(h^(h>>13))*1274126177;return((h^(h>>16))>>>0)/4294967296}
function ln(c,x1,y1,x2,y2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function pth(g,pts){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath()}
function lgg(g,x0,y0,x1,y1,st){const gr=g.createLinearGradient(x0,y0,x1,y1);for(const s of st)gr.addColorStop(s[0],s[1]);return gr}
function showErr(m){const b=$('errBox');b.style.display='block';b.textContent='⚠ '+m;clearTimeout(showErr._t);showErr._t=setTimeout(()=>b.style.display='none',8000)}
addEventListener('error',ev=>showErr((ev.message||'ошибка')+' @'+(ev.lineno||'?')));
function todayStr(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
/* ЗВУК */
const AU={ctx:null,gain:null,vol:.7,muted:false,
 init(){if(this.ctx)return;try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.gain=this.ctx.createGain();this.gain.gain.value=this.vol;this.gain.connect(this.ctx.destination)}catch(e){}},
 unlock(){this.init();if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});if(this.gain)this.gain.gain.value=SET.muted?0:SET.vol},
 tone(f,d,type='sine',v=.25,slide=0,dl=0){if(!this.ctx||this.muted)return;const t0=this.ctx.currentTime+dl,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(20,f),t0);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t0+d);g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(this.gain);o.start(t0);o.stop(t0+d+.03)},
 noise(d=.15,v=.25,f=1200,q=1,dl=0){if(!this.ctx||this.muted)return;const t0=this.ctx.currentTime+dl,n=(this.ctx.sampleRate*d)|0,b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),ch=b.getChannelData(0);for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);const s=this.ctx.createBufferSource();s.buffer=b;const fl=this.ctx.createBiquadFilter();fl.type='bandpass';fl.frequency.value=f;fl.Q.value=q;const g=this.ctx.createGain();g.gain.value=v;s.connect(fl);fl.connect(g);g.connect(this.gain);s.start(t0)}
};
const SFX={
 sys(){AU.tone(1046,.09,'sine',.12);AU.tone(1568,.14,'sine',.1,0,.07)},
 swing(){AU.noise(.1,.16,1900,.8)}, hit(){AU.noise(.07,.28,750,1);AU.tone(150,.07,'square',.1,-60)},
 crit(){AU.noise(.15,.32,520,1);AU.tone(95,.2,'sawtooth',.2,-45)},
 shoot(){AU.tone(760,.11,'square',.11,-320)}, fire(){AU.tone(820,.16,'sawtooth',.12,-260);AU.noise(.14,.13,620,1)},
 dash(){AU.noise(.17,.18,950,.6);AU.tone(320,.16,'sine',.09,480)},
 nova(){AU.tone(70,.5,'sawtooth',.28,-30);AU.noise(.4,.28,260,.6)},
 whirl(){for(let i=0;i<3;i++)AU.noise(.12,.14,1500+i*300,.8,i*.13)},
 hand(){AU.tone(52,.9,'sine',.3,26);AU.noise(.7,.2,180,.5);AU.tone(660,.5,'sine',.06,-500,.2)},
 ambush(){AU.noise(.2,.3,2600,.9);AU.tone(1400,.14,'sine',.16,-900)},
 arise(){AU.tone(58,.9,'sawtooth',.3,22);AU.tone(116,.9,'sawtooth',.18,11,.05);AU.noise(.8,.2,240,.5);[220,262,330].forEach((f,i)=>AU.tone(f,.7,'triangle',.1,0,.25+i*.06))},
 fail(){AU.tone(320,.3,'sine',.12,-180)},
 swap(){AU.tone(900,.09,'sine',.14,-500);AU.tone(400,.12,'sine',.14,500,.06)},
 bolt(){AU.noise(.22,.34,2600,.6);AU.tone(120,.25,'sawtooth',.24,-80)},
 breath(){AU.noise(.55,.3,420,.7);AU.tone(190,.55,'sawtooth',.2,-90)},
 hurt(){AU.tone(185,.14,'sawtooth',.18,-80)}, coin(){AU.tone(1150,.06,'sine',.13);AU.tone(1700,.08,'sine',.1,0,.05)},
 potion(){AU.tone(520,.14,'sine',.14,300);AU.tone(820,.14,'sine',.11,300,.07)},
 lvl(){[440,554,659,880].forEach((f,i)=>AU.tone(f,.24,'triangle',.18,0,i*.09))},
 portal(){AU.tone(88,1.1,'sine',.18,44);AU.tone(140,1.1,'sine',.11,60,.05)},
 gate(){AU.tone(48,1.4,'sawtooth',.3,18);AU.noise(1.1,.26,160,.5);[110,146,220].forEach((f,i)=>AU.tone(f,.9,'triangle',.13,0,.2+i*.12))},
 chest(){[523,659,784].forEach((f,i)=>AU.tone(f,.2,'triangle',.15,0,i*.07))},
 ui(){AU.tone(700,.05,'square',.05)},
 ulti(){AU.tone(58,.8,'sawtooth',.28,34);AU.noise(.6,.24,300,.5);[220,330,440].forEach((f,i)=>AU.tone(f,.5,'triangle',.13,0,i*.1))},
 die(){AU.tone(220,.6,'sawtooth',.24,-165);AU.noise(.5,.2,300,.5)},
 roar(){AU.tone(70,.7,'sawtooth',.3,40);AU.noise(.5,.25,180,.5)}
};
const IC={
 sword:'<g transform="rotate(45 12 12)"><rect x="11" y="1.5" width="2" height="13.5" rx="1"/><rect x="7.6" y="15" width="8.8" height="2" rx="1"/><rect x="11" y="17" width="2" height="4.5"/></g>',
 armor:'<path d="M12 2l4 2h4v5c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V4h4l4-2z"/>',
 flask:'<path d="M10 3h4v2l-1 1v3.2l4.2 7A3 3 0 0 1 14.6 21H9.4a3 3 0 0 1-2.6-4.8L11 9.2V6l-1-1V3z"/>',
 shard:'<path d="M12 2l5 7-5 13-5-13 5-7z"/>',dust:'<circle cx="8" cy="14" r="2.6"/><circle cx="13.5" cy="10" r="1.9"/><circle cx="15.5" cy="15.5" r="2.1"/>',
 gem:'<path d="M12 2 20 9l-8 13L4 9l8-7z"/>',
 skull:'<path d="M12 2a8 8 0 0 0-8 8c0 3 1.6 5.4 4 6.8V20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3.2c2.4-1.4 4-3.8 4-6.8a8 8 0 0 0-8-8zM8.6 12.2a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8zm6.8 0a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8z"/>',
 ghost:'<path d="M12 2a8 8 0 0 1 8 8v10l-3-2-2.5 2-2.5-2-2.5 2L7 18l-3 2V10a8 8 0 0 1 8-8z"/>',
 map:'<path d="M9 3l6 2 6-2v16l-6 2-6-2-6 2V5l6-2zm0 2v14m6-12v14" fill="none" stroke="currentColor" stroke-width="2"/>',
 gate:'<path d="M5 21v-8a7 7 0 0 1 14 0v8h-3.4v-8a3.6 3.6 0 0 0-7.2 0v8z"/><rect x="3" y="20" width="18" height="2.4" rx="1"/>',
 whirl:'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20.5 12A8.5 8.5 0 1 1 12 3.5"/><path d="M16.5 12A4.5 4.5 0 1 1 12 7.5"/></g><circle cx="12" cy="12" r="1.5"/>',
 daggers:'<g transform="rotate(45 12 12)"><rect x="11" y="1.5" width="2" height="11" rx="1"/><rect x="8" y="12.5" width="8" height="2" rx="1"/></g><g transform="rotate(-45 12 12)"><rect x="11" y="1.5" width="2" height="11" rx="1"/><rect x="8" y="12.5" width="8" height="2" rx="1"/></g>',
 hand:'<path d="M6.5 12V5.8a1.5 1.5 0 0 1 3 0V11h.6V4.2a1.5 1.5 0 0 1 3 0V11h.6V5.8a1.5 1.5 0 0 1 3 0v8.4c0 3.6-2.4 6.6-6 6.6-2.6 0-4-1.2-5.4-3.6l-1.7-2.9A1.6 1.6 0 0 1 6 13.4z"/>',
 king:'<path d="M3 8l4.2 4L12 5l4.8 7L21 8v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="2.6" r="1.4"/>',
 step:'<path d="M4 5l7 7-7 7V5zM12.5 5l7 7-7 7V5z"/>',
 swap:'<path d="M7 7h9l-2.5-2.5L15 3l5 4-5 4-1.5-1.5L16 9H7V7zm10 10H8l2.5 2.5L9 21l-5-4 5-4 1.5 1.5L8 15h9v2z"/>'
};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24">${IC[n]||IC.gem}</svg>`;
/* ВВОД */
const input={keys:new Set(),aimWorld:null,touchMode:matchMedia('(pointer:coarse)').matches,joy:{x:0,y:0},attackHeld:false};
function moveDir(){
 let sx=0,sy=0;
 if(input.keys.has('KeyW')||input.keys.has('ArrowUp'))sy-=1;
 if(input.keys.has('KeyS')||input.keys.has('ArrowDown'))sy+=1;
 if(input.keys.has('KeyA')||input.keys.has('ArrowLeft'))sx-=1;
 if(input.keys.has('KeyD')||input.keys.has('ArrowRight'))sx+=1;
 sx+=input.joy.x;sy+=input.joy.y;
 const l=Math.hypot(sx,sy);
 if(l<.01)return{l:0,wx:0,wy:0};
 let wx=sx*.5+sy, wy=sy-sx*.5;
 const wl=Math.hypot(wx,wy)||1;
 return{l:Math.min(1,l),wx:wx/wl*Math.min(1,l),wy:wy/wl*Math.min(1,l)};
}
addEventListener('keydown',e=>{
 if(e.repeat)return;
 const c=e.code;
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(c))e.preventDefault();
 input.keys.add(c);
 if(!G.started)return;
 if(anyModal()&&c!=='Escape'&&c!=='Tab')return; // ФИКС v0.8: навыки не срабатывают под окнами UI
 if(c==='KeyQ')castSkill('q');else if(c==='KeyE'){if(G.interact)doInteract();else castSkill('e')}
 else if(c==='KeyR')castSkill('r');else if(c==='KeyF')castSkill('f');
 else if(c==='KeyX')castSkill('x');else if(c==='KeyC')castSkill('c');
 else if(c==='Space')castSkill('u');
 else if(c==='Digit1')usePotion('potionHP');else if(c==='Digit2')usePotion('potionMP');
 else if(c==='Tab')toggleDrawer('invPanel');
 else if(c==='KeyM'){SET.muted=!SET.muted;if(AU.gain)AU.gain.gain.value=SET.muted?0:SET.vol;toast(SET.muted?'Звук выключен':'Звук включён')}
 else if(c==='Escape'){if(anyModal())closeAll();else openModal('setModal')}
});
addEventListener('keyup',e=>input.keys.delete(e.code));
const cvs=$('cv'),ctx=cvs.getContext('2d');
function screenToWorld(mx,my){
 if(!M.grid)return{x:0,y:0};
 const VS=zscale();
 const csx=w2sx(G.cam.x,G.cam.y),csy=w2sy(G.cam.x,G.cam.y);
 const u=(mx-innerWidth/2)/VS+csx,v=(my-innerHeight/2)/VS+csy;
 const X=u-M.OX,Y=v-M.OY;
 return{x:(X/32+Y/16)/2,y:(Y/16-X/32)/2};
}
cvs.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){input.touchMode=true;document.body.classList.add('touch');
  const w=screenToWorld(e.clientX,e.clientY);tryTapInteract(w);return}
 if(e.button===0)input.attackHeld=true;});
addEventListener('pointerup',()=>input.attackHeld=false);
addEventListener('pointerdown',()=>AU.unlock(),{once:true}); // iOS: звук по первому касанию
addEventListener('mousemove',e=>{input.aimWorld=screenToWorld(e.clientX,e.clientY)});
cvs.addEventListener('contextmenu',e=>e.preventDefault());
const joyEl=$('joy'),knob=$('joyKnob'),jz=$('joyZone');let joyId=null,jcx=0,jcy=0;
jz.addEventListener('contextmenu',e=>e.preventDefault());
jz.addEventListener('pointerdown',e=>{ // ФИКС v0.8.1: зона снова кликабельна; мышь = атака (как по полю)
 if(joyId!==null)return;
 if(e.pointerType==='mouse'){input.attackHeld=true;return}
 e.preventDefault();input.touchMode=true;document.body.classList.add('touch');
 joyId=e.pointerId;try{jz.setPointerCapture(joyId)}catch(_){}
 const r=jz.getBoundingClientRect(),hw=(joyEl.offsetWidth||128)/2;
 jcx=e.clientX;jcy=e.clientY;
 joyEl.style.left=(jcx-r.left-hw)+'px';joyEl.style.right='auto';joyEl.style.bottom='auto';joyEl.style.top=(jcy-r.top-hw)+'px';joyMove(e)});
jz.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyMove(e)});
const joyEnd=e=>{if(e.pointerId!==joyId)return;joyId=null;input.joy.x=0;input.joy.y=0;knob.style.transform='translate(-50%,-50%)'};
jz.addEventListener('pointerup',joyEnd);jz.addEventListener('pointercancel',joyEnd);
function joyMove(e){let dx=e.clientX-jcx,dy=e.clientY-jcy;const l=Math.hypot(dx,dy),m=46;
 if(l>m){dx=dx/l*m;dy=dy/l*m}
 input.joy.x=dx/m;input.joy.y=dy/m;
 knob.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;}
const atkBtn=$('atkBtn');
atkBtn.addEventListener('pointerdown',e=>{e.preventDefault();input.attackHeld=true;input.touchMode=true;document.body.classList.add('touch')});
atkBtn.addEventListener('pointerup',()=>input.attackHeld=false);
atkBtn.addEventListener('pointercancel',()=>input.attackHeld=false);

function tryTapInteract(w){
 if(G.interact==='gate'&&G.hubGate&&dist(w.x,w.y,G.hubGate.x,G.hubGate.y)<1.7)doInteract();
 else if(G.interact==='portal'&&M.portal&&dist(w.x,w.y,M.portal.x,M.portal.y)<1.6)doInteract();
 else if(G.interact==='chest'&&M.chest&&dist(w.x,w.y,M.chest.x,M.chest.y)<1.4)doInteract();
}
function applyJoySide(){const j=$('joy'),z=$('joyZone'); // ФИКС v0.8.1: зона касания следует за джойстиком
 if(SET.joy==='right'){j.style.left='auto';j.style.right='26px';z.style.left='auto';z.style.right='0'}
 else{j.style.right='auto';j.style.left='26px';z.style.right='auto';z.style.left='0'}}
/* СВЕТ/КАМЕРА */
let dk=document.createElement('canvas'),dkc=dk.getContext('2d'),lights=[];
const w2sx=(x,y)=>((x-y)*32+M.OX), w2sy=(x,y)=>((x+y)*16+M.OY);
function zscale(){return view.scale*(1+G.punch*.06)}
const GLOWS={};
function glow(col){if(GLOWS[col])return GLOWS[col];
 const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
 const gr=g.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');
 g.fillStyle=gr;g.fillRect(0,0,64,64);GLOWS[col]=c;return c;}
function dGl(X,Y,r,col,a){if(r<=0||a<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.drawImage(glow(col),X-r,Y-r,r*2,r*2);ctx.restore()}
function floorHalo(x,y,r,col,a){
 const X=w2sx(x,y),Y=w2sy(x,y);
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;
 ctx.translate(X,Y);ctx.scale(1,.5);
 const g=ctx.createRadialGradient(0,0,2,0,0,r*30);
 g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*30,0,TAU);ctx.fill();ctx.restore();
}
/* ФИЗИКА */
function circleBlocked(x,y,r){
 const x0=Math.floor(x-r),x1=Math.floor(x+r),y0=Math.floor(y-r),y1=Math.floor(y+r);
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)if(blocked(tx,ty)){
  const cx=clamp(x,tx,tx+1),cy=clamp(y,ty,ty+1);
  if((cx-x)**2+(cy-y)**2<r*r)return true;}
 for(const o of M.obst)if((o.x-x)**2+(o.y-y)**2<(o.r+r)**2)return true;
 return false;
}
function collideMove(e,dx,dy){
 let moved=false;
 if(!circleBlocked(e.x+dx,e.y,e.r)){e.x+=dx;moved=true}
 if(!circleBlocked(e.x,e.y+dy,e.r)){e.y+=dy;moved=true}
 return moved;
}
