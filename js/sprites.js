'use strict';
/* ═══ СПРАЙТЫ: процедурная генерация всех персонажей и объектов ═══ */
/* СПРАЙТЫ */
const PALS={
 hero:{coatA:'#1b1440',coatB:'#0e0a24',trim:'#8b5cf6',lin:'#c4b5fd',skin:'#f1cfa5',hair:'#16132b',hairHi:'#413a75',eye:'#d8b4fe',bladeA:'#e7fbef',bladeB:'#4ade80',glove:'#241d4a',leg:'#120e2c'},
 heroU:{coatA:'#2b1a5e',coatB:'#160f38',trim:'#c084fc',lin:'#f5f3ff',skin:'#f1cfa5',hair:'#1a1435',hairHi:'#6d5bb8',eye:'#f0abfc',bladeA:'#ffffff',bladeB:'#d8b4fe',glove:'#33236e',leg:'#191243'},
 sol:{armA:'#4a151f',armB:'#2b0c12',plate:'#4d4656',plateHi:'#767086',eye:'#ff5d5d',horn:'#cfc7d6',leg:'#200a10',bladeA:'#cdd2de',bladeB:'#8a93a6'},
 shs:{armA:'#12244d',armB:'#0a1530',plate:'#2c4c80',plateHi:'#4a7cc0',eye:'#7dd3fc',horn:'#93c5fd',leg:'#0a1530',bladeA:'#dbeafe',bladeB:'#60a5fa'},
 kn:{armA:'#252b3a',armB:'#131724',plate:'#3b445e',plateHi:'#5b688a',eye:'#a5f3fc',cryst:'#7dd3fc',horn:'#93a7c9',leg:'#10141f',bladeA:'#e0f2fe',bladeB:'#38bdf8'},
 brt:{armA:'#45101a',armB:'#25070e',plate:'#433d44',eye:'#ff4d4d',horn:'#d6d3d1',leg:'#1c070c'},
 kam:{armA:'#571c10',armB:'#2b0d06',plate:'#5b3a2a',eye:'#ffb347',horn:'#e7d3b0',leg:'#200b05'},
 mg:{robeA:'#341021',robeB:'#180610',trim:'#f59e0b',eye:'#fbbf24',orb:'#fbbf24'},
 shm:{robeA:'#12244d',robeB:'#0a1530',trim:'#60a5fa',eye:'#93c5fd',orb:'#7dd3fc'},
 bar:{robeA:'#3b0a47',robeB:'#1d0526',trim:'#f0abfc',eye:'#f0abfc',orb:'#e879f9'},
 heroF:{coatA:'#241640',coatB:'#100a26',trim:'#a78bfa',lin:'#e9d5ff',skin:'#f3d3ac',hair:'#1c1533',hairHi:'#584a8e',eye:'#c084fc',bladeA:'#f5f3ff',bladeB:'#a78bfa',glove:'#2b2054',leg:'#140e2e'},
 heroUF:{coatA:'#3a2069',coatB:'#1c1138',trim:'#e879f9',lin:'#fdf4ff',skin:'#f3d3ac',hair:'#241a45',hairHi:'#7a5fc0',eye:'#f0abfc',bladeA:'#ffffff',bladeB:'#f0abfc',glove:'#452a80',leg:'#201546'},
 hd:{bodyA:'#5a1622',bodyB:'#2b0a10',spike:'#8a1f2d',eye:'#ff6b6b',claw:'#d8d3e0',leg:'#1a070c'},
 bel:{armA:'#31121b',armB:'#170810',plate:'#5b4a20',plateHi:'#8f7430',eye:'#ffd76a',horn:'#e7c76a',leg:'#170a10',bladeA:'#fff3c4',bladeB:'#d4a017',trim:'#f5c542'},
 beru:{armA:'#1d3b2a',armB:'#0a1f14',plate:'#2f6b43',plateHi:'#4a9463',eye:'#7dfaa5',horn:'#b7f7cd',leg:'#0a1f14',bladeA:'#eafff3',bladeB:'#4ade80',trim:'#86efac'},
 shh:{bodyA:'#143060',bodyB:'#0a1730',spike:'#2563eb',eye:'#7dd3fc',claw:'#bfdbfe',leg:'#0a1730'}
};
const SPR={};
function outline(c){
 const w=c.width,h=c.height,g=c.getContext('2d');
 const t=document.createElement('canvas');t.width=w;t.height=h;const tg=t.getContext('2d');
 for(const[ox,oy]of[[1,0],[-1,0],[0,1],[0,-1],[2,0],[-2,0],[0,2],[0,-2],[1,1],[-1,1],[1,-1],[-1,-1]])tg.drawImage(c,ox,oy);
 tg.globalCompositeOperation='source-in';tg.fillStyle='#08060f';tg.fillRect(0,0,w,h);
 g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='destination-over';g.drawImage(t,0,0);g.restore();
}
const SS=3;
function mk(key,w,h,fn,px=w/2,py=h){
 const c=document.createElement('canvas');c.width=Math.max(2,Math.ceil(w*SS));c.height=Math.max(2,Math.ceil(h*SS));
 const g=c.getContext('2d');g.scale(SS,SS);g.translate(px,py);fn(g);
 outline(c);
 SPR[key]={c,w,h,px,py};
}
function drawSpr(k,X,Y,o={}){
 const s=SPR[k];if(!s)return;
 ctx.save();ctx.globalAlpha=o.alpha??1;ctx.translate(X,Y);
 if(o.sc)ctx.scale(o.sc,o.sc);
 if(o.face&&o.face<0)ctx.scale(-1,1);
 ctx.drawImage(s.c,-s.px,-s.py,s.w,s.h);ctx.restore();
}
function drawRot(k,X,Y,ang,face,alpha=1){
 const s=SPR[k];if(!s)return;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(X,Y);ctx.scale(face,1);ctx.rotate(ang);
 ctx.drawImage(s.c,-s.px,-s.py,s.w,s.h);ctx.restore();
}
function rim(g,x0,y0,x1,y1){g.save();g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=1.4;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.restore()}
function shine(g,x,y,w){g.save();g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1.1;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y-1.4);g.stroke();g.restore()}
function torsoHero(g,p,offDag){
 // v0.10: человечные пропорции — торс короче, ноги длиннее (hip=21 в риге)
 g.beginPath();
 g.moveTo(-10,-30);g.quadraticCurveTo(-12,-20,-9,-12);
 g.quadraticCurveTo(-11,-6,-10,2);g.quadraticCurveTo(-5,4,0,4);g.quadraticCurveTo(5,4,10,2);
 g.quadraticCurveTo(11,-6,9,-12);g.quadraticCurveTo(12,-20,10,-30);
 g.quadraticCurveTo(5,-34,0,-34);g.quadraticCurveTo(-5,-34,-10,-30);g.closePath();
 g.fillStyle=lgg(g,-10,-33,10,3,[[0,p.coatA],[.55,p.coatA],[1,p.coatB]]);g.fill();
 g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;g.stroke();
 rim(g,-10,-30,-10,2);
 // грудная застёжка
 g.beginPath();g.moveTo(.7,-31);g.quadraticCurveTo(1.4,-16,1,2);g.lineTo(-.4,2);g.quadraticCurveTo(-.2,-16,-.7,-31);g.closePath();
 g.fillStyle=p.lin;g.globalAlpha=.8;g.fill();g.globalAlpha=1;
 // пояс
 g.fillStyle='#0c0a18';g.fillRect(-9,-9,18,4);
 g.fillStyle=p.trim;g.fillRect(-1.8,-9.6,3.6,5);
 g.fillStyle='rgba(255,255,255,.3)';g.fillRect(-1.8,-9.6,3.6,1.3);
 // плечи
 g.beginPath();g.moveTo(-10.5,-29);g.quadraticCurveTo(-6,-33,-2,-31.5);g.lineTo(-3,-27);g.quadraticCurveTo(-6.5,-27.6,-9.8,-26.4);g.closePath();
 g.fillStyle=lgg(g,-10,-33,-2,-26,[[0,p.coatA],[1,'#241b52']]);g.fill();
 g.strokeStyle=p.trim;g.lineWidth=.85;g.stroke();
 g.beginPath();g.moveTo(10.5,-29);g.quadraticCurveTo(6,-33,2,-31.5);g.lineTo(3,-27);g.quadraticCurveTo(6.5,-27.6,9.8,-26.4);g.closePath();
 g.fillStyle=lgg(g,10,-33,2,-26,[[0,p.coatA],[1,'#241b52']]);g.fill();
 g.strokeStyle=p.trim;g.lineWidth=.85;g.stroke();
 // воротник
 g.beginPath();g.moveTo(-4.5,-31.8);g.lineTo(0,-28.6);g.lineTo(4.5,-31.8);g.lineTo(3.6,-28.6);g.lineTo(-3.6,-28.6);g.closePath();
 g.fillStyle=p.coatA;g.fill();g.strokeStyle=p.trim;g.lineWidth=.9;g.stroke();
 if(offDag){
  g.save();g.translate(-8.5,-15);g.rotate(2.5);
  g.fillStyle='#241d4a';g.fillRect(-1.3,-3,2.6,6.4);
  g.fillStyle=lgg(g,0,0,0,-13,[[0,'#4ade80'],[1,'#e7fbef']]);
  g.beginPath();g.moveTo(0,-3);g.lineTo(1.7,-11.5);g.lineTo(0,-14.5);g.lineTo(-1.7,-11.5);g.closePath();g.fill();
  g.restore();
 }
 g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.ellipse(4.6,-26.5,3.6,1.8,-.2,0,TAU);g.fill();
}
function torsoHeroF(g,p,offDag){
 // v0.10: женский торс — приталенное пальто
 g.beginPath();
 g.moveTo(-8.6,-29);g.quadraticCurveTo(-10.5,-19,-6.5,-13);
 g.quadraticCurveTo(-9.5,-7,-8.6,3.5);g.quadraticCurveTo(-4,5.5,0,5.5);g.quadraticCurveTo(4,5.5,8.6,3.5);
 g.quadraticCurveTo(9.5,-7,6.5,-13);g.quadraticCurveTo(10.5,-19,8.6,-29);
 g.quadraticCurveTo(4.5,-33,0,-33);g.quadraticCurveTo(-4.5,-33,-8.6,-29);g.closePath();
 g.fillStyle=lgg(g,-8,-32,8,4,[[0,p.coatA],[.55,p.coatA],[1,p.coatB]]);g.fill();
 g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;g.stroke();
 rim(g,-8.6,-29,-8.6,3);
 // талия-шнур
 g.fillStyle='#0c0a18';g.fillRect(-7,-11.5,14,3.2);
 g.fillStyle=p.trim;g.fillRect(-1.4,-12,2.8,4.2);
 g.fillStyle=p.lin;g.globalAlpha=.75;
 g.beginPath();g.moveTo(.6,-29.5);g.quadraticCurveTo(1.1,-17,.8,-10.8);g.lineTo(-.3,-10.8);g.quadraticCurveTo(-.3,-17,-.6,-29.5);g.closePath();g.fill();g.globalAlpha=1;
 // воротник-стойка
 g.beginPath();g.moveTo(-4,-30.5);g.lineTo(0,-27.6);g.lineTo(4,-30.5);g.lineTo(3.2,-27.8);g.lineTo(-3.2,-27.8);g.closePath();
 g.fillStyle=p.coatA;g.fill();g.strokeStyle=p.trim;g.lineWidth=.85;g.stroke();
 if(offDag){
  g.save();g.translate(-7.5,-14);g.rotate(2.5);
  g.fillStyle='#241d4a';g.fillRect(-1.2,-2.8,2.4,6);
  g.fillStyle=lgg(g,0,0,0,-12.5,[[0,'#4ade80'],[1,'#e7fbef']]);
  g.beginPath();g.moveTo(0,-2.8);g.lineTo(1.6,-11);g.lineTo(0,-13.8);g.lineTo(-1.6,-11);g.closePath();g.fill();
  g.restore();
 }
 g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.ellipse(4,-25.5,3.2,1.6,-.2,0,TAU);g.fill();
}
function headHero(g,p){
 // v0.10: компактная голова (25px), спокойное лицо
 g.fillStyle=p.skin;g.fillRect(-1.6,-4.6,3.2,4.6);
 g.beginPath();g.moveTo(-4.3,-4.4);
 g.quadraticCurveTo(-5.8,-7.6,-5.5,-10.8);g.quadraticCurveTo(-5.2,-14.4,-2.2,-16.2);
 g.quadraticCurveTo(1.2,-17.9,4,-15.7);g.quadraticCurveTo(6.2,-13.5,6,-10);
 g.quadraticCurveTo(5.8,-7,4.7,-5);g.quadraticCurveTo(3.1,-3,1.1,-2.8);
 g.quadraticCurveTo(-1.8,-2.8,-4.3,-4.4);g.closePath();
 g.fillStyle=lgg(g,-5.5,-16.4,4.5,-2.8,[[0,'#f7ddb9'],[.6,p.skin],[1,'#e3b98a']]);g.fill();
 g.strokeStyle='rgba(60,30,40,.35)';g.lineWidth=.7;g.stroke();
 g.fillStyle='rgba(0,0,0,.13)';g.beginPath();g.ellipse(-3.9,-7.6,1,1.8,.3,0,TAU);g.fill();
 g.fillStyle=p.skin;g.beginPath();g.ellipse(-4.5,-8.2,1,1.6,-.2,0,TAU);g.fill();
 g.strokeStyle='rgba(60,30,40,.4)';g.lineWidth=.65;
 g.beginPath();g.moveTo(4.5,-5.8);g.lineTo(5.2,-6.5);g.stroke();
 g.beginPath();g.moveTo(4.3,-4.6);g.quadraticCurveTo(5,-4.3,5.5,-4.8);g.stroke();
 // причёска: зачёс назад
 g.beginPath();g.moveTo(-6,-9.4);
 g.quadraticCurveTo(-6.7,-15.2,-3.1,-18);g.quadraticCurveTo(.6,-20,3.9,-17.6);
 g.quadraticCurveTo(6.8,-15.5,6.6,-11.3);
 g.quadraticCurveTo(6.3,-8.8,5.4,-7.8);g.lineTo(4.9,-11.6);
 g.quadraticCurveTo(4,-14.2,1.5,-15);g.quadraticCurveTo(4.3,-12.6,3.9,-10);
 g.lineTo(2.8,-11.8);g.quadraticCurveTo(1.3,-13.5,-1.5,-13.7);
 g.quadraticCurveTo(-4.4,-13.8,-5.6,-11.4);g.closePath();
 g.fillStyle=lgg(g,-5.5,-19.5,4.5,-8.8,[[0,p.hairHi],[.35,p.hair],[1,p.hair]]);g.fill();
 rim(g,-5.8,-10.4,-6.4,-15.8);
 g.strokeStyle=p.hairHi;g.lineWidth=.95;g.globalAlpha=.75;
 g.beginPath();g.moveTo(-4.2,-16.4);g.quadraticCurveTo(0,-18,3.5,-16.2);g.stroke();g.globalAlpha=1;
 g.beginPath();g.moveTo(-3.3,-17.6);g.lineTo(-2.2,-19.1);g.lineTo(-.9,-18.2);g.closePath();
 g.fillStyle=p.hair;g.fill();
 // глаз с бликом + бровь
 g.save();g.shadowColor=p.eye;g.shadowBlur=3.5;g.fillStyle=p.eye;
 g.beginPath();g.ellipse(3.3,-9.6,1.5,.95,.12,0,TAU);g.fill();g.restore();
 g.fillStyle='#0c0a18';g.beginPath();g.ellipse(3.6,-9.6,.7,.95,.12,0,TAU);g.fill();
 g.fillStyle='rgba(255,255,255,.9)';g.fillRect(3.9,-10.3,.85,.55);
 g.strokeStyle=p.hair;g.lineWidth=1;g.lineCap='round';
 g.beginPath();g.moveTo(2,-12);g.quadraticCurveTo(3.4,-12.6,4.8,-11.8);g.stroke();
}
function headHeroF(g,p){
 // v0.10: женская голова — мягкие черты, длинные волосы
 g.fillStyle=p.skin;g.fillRect(-1.5,-4.4,3,4.4);
 g.beginPath();g.moveTo(-4,-4.2);
 g.quadraticCurveTo(-5.4,-7.4,-5.1,-10.4);g.quadraticCurveTo(-4.8,-13.8,-1.9,-15.5);
 g.quadraticCurveTo(1.4,-17.2,4,-15);g.quadraticCurveTo(6,-13,5.8,-9.7);
 g.quadraticCurveTo(5.6,-6.8,4.6,-4.9);g.quadraticCurveTo(3,-2.9,1.1,-2.7);
 g.quadraticCurveTo(-1.7,-2.7,-4,-4.2);g.closePath();
 g.fillStyle=lgg(g,-5.1,-15.8,4.4,-2.7,[[0,'#f9e0c0'],[.6,p.skin],[1,'#eac49a']]);g.fill();
 g.strokeStyle='rgba(60,30,40,.32)';g.lineWidth=.7;g.stroke();
 // длинные волосы: затылок и пряди до плеч
 g.beginPath();g.moveTo(-5.9,-9);
 g.quadraticCurveTo(-7.6,-14.5,-3.4,-17.6);g.quadraticCurveTo(.8,-20.4,4.6,-17.2);
 g.quadraticCurveTo(7.3,-14.6,7,-10);
 g.quadraticCurveTo(6.9,-6.2,6.1,-3.6);g.lineTo(4.9,-6);
 g.quadraticCurveTo(5.4,-10.6,4.2,-13.2);g.lineTo(3.6,-8.4);
 g.quadraticCurveTo(3.2,-5.6,1.8,-4.4);g.lineTo(1.6,-11);
 g.quadraticCurveTo(1.4,-13.6,-1.2,-14.4);
 g.quadraticCurveTo(-4,-14.7,-5.1,-12.2);g.lineTo(-5.4,-6.2);
 g.quadraticCurveTo(-5.8,-4.4,-6.4,-3.8);g.closePath();
 g.fillStyle=lgg(g,-6.6,-19,5.5,-4,[[0,p.hairHi],[.3,p.hair],[1,p.hair]]);g.fill();
 rim(g,-6,-10,-6.8,-15.4);
 g.strokeStyle=p.hairHi;g.lineWidth=.9;g.globalAlpha=.7;
 g.beginPath();g.moveTo(-3.8,-15.9);g.quadraticCurveTo(0,-17.6,3.6,-15.7);g.stroke();
 g.beginPath();g.moveTo(-4.6,-14.2);g.quadraticCurveTo(-5.3,-9.6,-4.9,-6);g.stroke();g.globalAlpha=1;
 // чёлка
 g.beginPath();g.moveTo(-4.6,-13.9);g.quadraticCurveTo(-1,-16.4,3.2,-14.4);g.quadraticCurveTo(1,-13.1,-1.4,-13.4);g.quadraticCurveTo(-3.4,-13.5,-4.6,-13.9);g.closePath();
 g.fillStyle=p.hair;g.fill();
 // глаз крупнее, губы
 g.save();g.shadowColor=p.eye;g.shadowBlur=3.5;g.fillStyle=p.eye;
 g.beginPath();g.ellipse(3.2,-9.2,1.7,1.1,.12,0,TAU);g.fill();g.restore();
 g.fillStyle='#0c0a18';g.beginPath();g.ellipse(3.5,-9.2,.8,1.1,.12,0,TAU);g.fill();
 g.fillStyle='rgba(255,255,255,.92)';g.fillRect(3.9,-10,.9,.6);
 g.strokeStyle=p.hair;g.lineWidth=1;g.lineCap='round';
 g.beginPath();g.moveTo(1.8,-11.6);g.quadraticCurveTo(3.3,-12.3,4.8,-11.4);g.stroke();
 g.strokeStyle='rgba(200,90,110,.75)';g.lineWidth=.9;
 g.beginPath();g.moveTo(3.5,-4.6);g.quadraticCurveTo(4.3,-4.2,5,-4.8);g.stroke();
}

function armSword(g,p,L){
 // v0.9: рука с ровным хватом и долом на клинке
 g.strokeStyle=p.armA||p.coatA;g.lineWidth=4.4;g.lineCap='round';
 g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(5.5,.3,9.5,.2);g.stroke();
 g.fillStyle=p.glove||p.plate;g.beginPath();g.arc(10.5,.2,2.9,0,TAU);g.fill();
 g.save();g.translate(12,.2);
 g.fillStyle=p.trim||'#6b7280';g.fillRect(-1.8,-4.2,3.6,8.4);
 g.fillStyle='rgba(255,255,255,.3)';g.fillRect(-1.8,-4.2,3.6,1.2);
 g.beginPath();g.moveTo(0,-2.2);g.quadraticCurveTo(L*.5,-3,L-4,-1.4);g.lineTo(L,0);g.lineTo(L-4,1.4);g.quadraticCurveTo(L*.5,3,0,2.2);g.closePath();
 g.fillStyle=lgg(g,0,-2.4,L,2.4,[[0,p.bladeB],[.45,p.bladeA],[1,p.bladeA]]);g.fill();
 g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.7;g.beginPath();g.moveTo(2.4,-.4);g.lineTo(L-3.6,-.4);g.stroke();
 g.strokeStyle='rgba(255,255,255,.28)';g.beginPath();g.moveTo(2.4,.7);g.lineTo(L-4.4,.7);g.stroke();
 g.restore();
}
function armClaw(g){
 g.strokeStyle='#241a4f';g.lineWidth=5;g.lineCap='round';
 g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(6,.4,10,.2);g.stroke();
 g.fillStyle='#33236e';g.beginPath();g.arc(11,.2,3,0,TAU);g.fill();
 for(let i=-1;i<=1;i++){
  g.save();g.translate(12,.2);g.rotate(i*.38);
  const L=24-Math.abs(i)*5.5;
  g.beginPath();g.moveTo(0,-2);g.quadraticCurveTo(L*.6,-3.2,L,0);g.quadraticCurveTo(L*.6,2.6,0,2);g.closePath();
  g.fillStyle=lgg(g,0,0,L,0,[[0,'#7c3aed'],[.6,'#c084fc'],[1,'#f5f3ff']]);g.fill();
  g.restore();
 }
}

function torMega(g,p){
 // v0.9: мегабоссы — Беллион/Беру
 g.beginPath();
 g.moveTo(-14,-36);g.quadraticCurveTo(-16.5,-24,-13,-14);g.quadraticCurveTo(-16,-5,-15,7);
 g.quadraticCurveTo(-7,9.5,0,9.5);g.quadraticCurveTo(7,9.5,15,7);
 g.quadraticCurveTo(16,-5,13,-14);g.quadraticCurveTo(16.5,-24,14,-36);
 g.quadraticCurveTo(7,-41,0,-41);g.quadraticCurveTo(-7,-41,-14,-36);g.closePath();
 g.fillStyle=lgg(g,-14,-40,14,8,[[0,p.armA],[.6,p.armB],[1,p.armA]]);g.fill();
 g.strokeStyle='rgba(0,0,0,.65)';g.lineWidth=1.1;g.stroke();
 rim(g,-14,-36,-15,6);
 g.beginPath();g.moveTo(-7,-33);g.quadraticCurveTo(0,-28.5,7,-33);g.lineTo(6,-18);g.quadraticCurveTo(0,-15,-6,-18);g.closePath();
 g.fillStyle=lgg(g,0,-33,0,-15,[[0,p.plateHi],[1,p.plate]]);g.fill();
 g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=.9;g.stroke();
 shine(g,-4,-29,6);
 g.save();g.shadowColor=p.eye;g.shadowBlur=7;g.fillStyle=p.eye;
 g.beginPath();g.moveTo(0,-31);g.lineTo(2.6,-25.5);g.lineTo(0,-20.5);g.lineTo(-2.6,-25.5);g.closePath();g.fill();g.restore();
 g.fillStyle='#0a0710';g.fillRect(-13,-12,26,5);
 g.fillStyle=p.trim;g.fillRect(-2.4,-12.8,4.8,6.2);
 g.beginPath();g.moveTo(-15,-35);g.quadraticCurveTo(-21,-38,-19,-30);g.quadraticCurveTo(-16,-27,-13,-30);g.closePath();
 g.fillStyle=lgg(g,-19,-37,-13,-28,[[0,p.plateHi],[1,p.plate]]);g.fill();g.strokeStyle=p.trim;g.lineWidth=1;g.stroke();
 g.beginPath();g.moveTo(15,-35);g.quadraticCurveTo(21,-38,19,-30);g.quadraticCurveTo(16,-27,13,-30);g.closePath();
 g.fillStyle=lgg(g,19,-37,13,-28,[[0,p.plateHi],[1,p.plate]]);g.fill();g.stroke();
 g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1.3;
 g.beginPath();g.moveTo(-13,-30);g.quadraticCurveTo(0,-34.5,13,-30);g.stroke();
}
function headMega(g,p,crown){
 g.fillStyle='#0d0912';g.fillRect(-1.9,-5.5,3.8,5.5);
 g.beginPath();g.moveTo(-6,-5);g.quadraticCurveTo(-8,-13,-4,-17.5);g.quadraticCurveTo(0,-20.5,4.6,-17);
 g.quadraticCurveTo(8,-13.5,7.4,-9);g.quadraticCurveTo(6.8,-5.5,4,-4.4);g.quadraticCurveTo(0,-3.4,-3.4,-4.2);
 g.quadraticCurveTo(-5.4,-4.6,-6,-5);g.closePath();
 g.fillStyle=lgg(g,-7,-18,6,-4,[[0,p.plateHi],[.5,p.plate],[1,p.armB]]);g.fill();
 g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;g.stroke();
 shine(g,-3.6,-14,5);
 g.save();g.shadowColor=p.eye;g.shadowBlur=6;g.fillStyle=p.eye;
 g.beginPath();g.moveTo(1.6,-11.8);g.lineTo(5.4,-11);g.lineTo(5,-9.4);g.lineTo(1.8,-10.4);g.closePath();g.fill();
 g.beginPath();g.moveTo(-4.6,-11.4);g.lineTo(-1.2,-11.8);g.lineTo(-1.6,-10.2);g.lineTo(-4.4,-9.8);g.closePath();g.fill();g.restore();
 g.strokeStyle=p.horn;g.lineWidth=2.4;g.lineCap='round';
 g.beginPath();g.moveTo(-4.4,-16);g.quadraticCurveTo(-8.5,-20,-7,-25.5);g.stroke();
 g.beginPath();g.moveTo(4.4,-16.4);g.quadraticCurveTo(8.5,-20.5,7,-26);g.stroke();
 if(crown){
  g.strokeStyle=p.trim;g.lineWidth=1.6;
  g.beginPath();g.moveTo(-6,-17.5);g.lineTo(-4.4,-21.5);g.lineTo(-2.2,-18.6);g.lineTo(0,-23);g.lineTo(2.2,-18.6);g.lineTo(4.4,-21.5);g.lineTo(6,-17.5);g.stroke();
  g.save();g.shadowColor=p.eye;g.shadowBlur=5;g.fillStyle=p.eye;
  g.beginPath();g.moveTo(0,-23);g.lineTo(1.2,-25.6);g.lineTo(0,-27.4);g.lineTo(-1.2,-25.6);g.closePath();g.fill();g.restore();
 }
}
function greatArm(g,p,L){
 g.strokeStyle=p.armA;g.lineWidth=5.4;g.lineCap='round';
 g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(5.5,.3,9.5,.2);g.stroke();
 g.fillStyle=p.plate;g.beginPath();g.arc(10.5,.2,3.3,0,TAU);g.fill();
 g.save();g.translate(12.2,.2);
 g.fillStyle=p.trim;g.fillRect(-2.2,-5.4,4.4,10.8);
 g.beginPath();g.moveTo(-4.6,-5);g.lineTo(-2.2,-3);g.lineTo(-2.2,3);g.lineTo(-4.6,5);g.closePath();
 g.fillStyle=p.trim;g.fill();
 g.beginPath();g.moveTo(0,-2.6);g.quadraticCurveTo(L*.5,-3.6,L-5,-1.8);g.lineTo(L,0);g.lineTo(L-5,1.8);g.quadraticCurveTo(L*.5,3.6,0,2.6);g.closePath();
 g.fillStyle=lgg(g,0,-3,L,3,[[0,p.bladeB],[.4,p.bladeA],[1,p.bladeA]]);g.fill();
 g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.8;g.beginPath();g.moveTo(3,-.5);g.lineTo(L-4.4,-.5);g.stroke();
 g.restore();
}
function spearArm(g,p){
 g.strokeStyle=p.armA;g.lineWidth=5;g.lineCap='round';
 g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(5.5,.3,9.5,.2);g.stroke();
 g.fillStyle=p.plate;g.beginPath();g.arc(10.5,.2,3,0,TAU);g.fill();
 g.save();g.translate(11.6,.2);
 g.strokeStyle=p.plateHi;g.lineWidth=2.2;
 g.beginPath();g.moveTo(-2,0);g.lineTo(26,0);g.stroke();
 g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.8;
 g.beginPath();g.moveTo(0,-.7);g.lineTo(25,-.7);g.stroke();
 g.save();g.shadowColor=p.eye;g.shadowBlur=6;g.fillStyle=p.bladeA;
 g.beginPath();g.moveTo(26,0);g.lineTo(33,-1.4);g.lineTo(36.5,0);g.lineTo(33,1.4);g.closePath();g.fill();
 g.beginPath();g.moveTo(26,0);g.lineTo(30,-4.6);g.lineTo(31.5,-3.6);g.closePath();g.fill();
 g.beginPath();g.moveTo(26,0);g.lineTo(30,4.6);g.lineTo(31.5,3.6);g.closePath();g.fill();
 g.restore();g.restore();
}
function torsoSoldier(g,p){
 g.beginPath();g.moveTo(-8,-24);g.quadraticCurveTo(-10,-12,-11,-1);g.lineTo(11,-1);g.quadraticCurveTo(9,-13,8,-24);g.closePath();
 g.fillStyle=lgg(g,0,-24,0,0,[[0,p.armA],[1,p.armB]]);g.fill();g.strokeStyle='rgba(0,0,0,.5)';g.stroke();
 rim(g,-8,-24,-11,-1);
 g.beginPath();g.moveTo(-6.5,-22);g.quadraticCurveTo(0,-18.5,6.5,-22);g.lineTo(5,-10);g.quadraticCurveTo(0,-8,-5,-10);g.closePath();
 g.fillStyle=lgg(g,0,-22,0,-9,[[0,p.plateHi],[1,p.plate]]);g.fill();
 shine(g,-4,-19,5);
 g.fillStyle=p.plate;g.beginPath();g.arc(-7,-22,3.6,0,TAU);g.arc(7,-22,3.6,0,TAU);g.fill();
 g.fillStyle=p.plateHi;g.beginPath();g.arc(-7,-23,2,0,TAU);g.arc(7,-23,2,0,TAU);g.fill();
 g.fillStyle='#14090c';g.fillRect(-9,-4,19,3);
 g.fillStyle='#8a8577';g.fillRect(-1.4,-4,3,3);
}
function headSoldier(g,p){
 g.fillStyle=p.leg;g.fillRect(-1.5,-3,3,3);
 g.beginPath();g.moveTo(-5,-3);g.quadraticCurveTo(-6.5,-12,-2,-15);g.quadraticCurveTo(3,-17.5,6,-12);g.quadraticCurveTo(6.6,-7,5,-3);g.closePath();
 g.fillStyle=lgg(g,-5,-15,5,-3,[[0,p.plateHi],[1,p.plate]]);g.fill();g.strokeStyle='rgba(0,0,0,.5)';g.stroke();
 shine(g,-3,-12,4);
 g.strokeStyle=p.horn;g.lineWidth=2;g.lineCap='round';
 g.beginPath();g.moveTo(-3,-14);g.quadraticCurveTo(-6,-18,-5,-21);g.stroke();
 g.beginPath();g.moveTo(3,-14.5);g.quadraticCurveTo(6,-18,5,-21);g.stroke();
 g.save();g.shadowColor=p.eye;g.shadowBlur=4;g.fillStyle=p.eye;g.fillRect(.5,-10.5,4.5,1.5);g.restore();
}
function torsoKnight(g,p){
 g.beginPath();g.moveTo(-9,-26);g.quadraticCurveTo(-12,-12,-12,-1);g.lineTo(12,-1);g.quadraticCurveTo(11,-14,9,-26);g.closePath();
 g.fillStyle=lgg(g,0,-26,0,0,[[0,p.armA],[1,p.armB]]);g.fill();g.strokeStyle='rgba(0,0,0,.55)';g.stroke();
 rim(g,-9,-26,-12,-1);
 g.beginPath();g.moveTo(-7,-24);g.quadraticCurveTo(0,-20,7,-24);g.lineTo(5.5,-9);g.quadraticCurveTo(0,-6.6,-5.5,-9);g.closePath();
 g.fillStyle=lgg(g,0,-24,0,-8,[[0,p.plateHi],[1,p.plate]]);g.fill();
 shine(g,-4,-20,6);
 g.save();g.shadowColor=p.cryst;g.shadowBlur=6;g.fillStyle=p.cryst;
 pth(g,[0,-20,2.6,-15,0,-10,-2.6,-15]);g.fill();g.restore();
 [[-7.6,-23],[7.6,-23]].forEach(([x,y])=>{g.fillStyle=p.plate;g.beginPath();g.arc(x,y,4.2,0,TAU);g.fill();
  g.fillStyle=p.plateHi;g.beginPath();g.arc(x,y-1,2.4,0,TAU);g.fill()});
 g.fillStyle='#0c101c';g.fillRect(-10,-4,21,3.4);
}
function headKnight(g,p){
 g.beginPath();g.moveTo(-5,-3);g.quadraticCurveTo(-6.5,-12,-2.5,-15.5);g.quadraticCurveTo(3,-17.5,6,-12);g.quadraticCurveTo(6.8,-7,5,-3);g.closePath();
 g.fillStyle=lgg(g,-5,-16,5,-3,[[0,p.plateHi],[1,p.plate]]);g.fill();g.strokeStyle='rgba(0,0,0,.55)';g.stroke();
 shine(g,-3,-13,4);
 g.fillStyle=p.horn;
 pth(g,[-4,-14,-6.4,-20,-2.2,-15]);g.fill();
 pth(g,[0,-15,-.4,-22,1.4,-15]);g.fill();
 pth(g,[3.4,-14,5.8,-20,1.8,-15]);g.fill();
 g.save();g.shadowColor=p.eye;g.shadowBlur=5;g.fillStyle=p.eye;
 g.fillRect(.5,-11,4.6,1.6);g.fillRect(2.2,-13.5,1.4,6.5);g.restore();
 g.fillStyle=p.cryst;g.globalAlpha=.9;pth(g,[-2,-8,-.6,-11,.4,-8,-.8,-5.6]);g.fill();g.globalAlpha=1;
}
function torsoBrute(g,p){
 g.beginPath();g.moveTo(-11,-26);g.quadraticCurveTo(-14,-12,-13,-1);g.lineTo(12,-1);g.quadraticCurveTo(13,-14,10,-26);g.closePath();
 g.fillStyle=lgg(g,0,-26,0,0,[[0,p.armA],[1,p.armB]]);g.fill();
 rim(g,-11,-26,-13,-1);
 g.strokeStyle='#1a0a0d';g.lineWidth=3;g.beginPath();g.moveTo(-9,-20);g.lineTo(9,-8);g.stroke();
 g.fillStyle=p.plate;g.beginPath();g.arc(-9,-23,4.4,0,TAU);g.fill();
 shine(g,-11,-24,3);
 g.fillStyle='#140a0d';g.fillRect(-10,-4,21,3.6);
}
function headBrute(g,p){
 g.fillStyle=p.leg;g.fillRect(-2,-3,4,3);
 g.beginPath();g.moveTo(-5,-3);g.quadraticCurveTo(-6.5,-11,-2,-13.5);g.quadraticCurveTo(3.5,-15.5,6,-10.5);g.quadraticCurveTo(6.5,-5.5,5,-3);g.closePath();
 g.fillStyle=lgg(g,-5,-13,5,-3,[[0,p.armA],[1,p.armB]]);g.fill();
 g.strokeStyle=p.horn;g.lineWidth=2.4;g.lineCap='round';
 g.beginPath();g.moveTo(-3,-12.5);g.quadraticCurveTo(-8,-16,-8.5,-20);g.stroke();
 g.beginPath();g.moveTo(3,-13);g.quadraticCurveTo(8,-16.5,8,-20.5);g.stroke();
 g.save();g.shadowColor=p.eye;g.shadowBlur=5;g.fillStyle=p.eye;
 g.beginPath();g.arc(2.6,-10,1.4,0,TAU);g.arc(-1,-10.2,1.2,0,TAU);g.fill();g.restore();
 g.fillStyle=p.horn;pth(g,[3,-5.5,4.8,-8.4,5.2,-5]);g.fill();
}
function axeArm(g,p){
 g.strokeStyle=p.armA;g.lineWidth=5.4;g.lineCap='round';
 g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(7,.5,12,.2);g.stroke();
 g.fillStyle=p.plate;g.beginPath();g.arc(13,.2,3,0,TAU);g.fill();
 g.save();g.translate(13,.2);
 g.strokeStyle='#3a2f28';g.lineWidth=2.6;g.beginPath();g.moveTo(-2,2);g.lineTo(22,-2);g.stroke();
 g.fillStyle=lgg(g,20,-10,26,6,[[0,'#8f96a3'],[1,'#565d68']]);
 g.beginPath();g.moveTo(19,-2);g.quadraticCurveTo(26,-11,29,-3);g.quadraticCurveTo(30,3,26,8);g.quadraticCurveTo(22,6,19,3);g.closePath();g.fill();
 g.strokeStyle='#c7ccd8';g.lineWidth=.8;g.beginPath();g.moveTo(28.4,-2.6);g.quadraticCurveTo(29.6,2,26.6,7);g.stroke();
 g.restore();
}
function robeMage(g,p){
 g.beginPath();g.moveTo(-6,-24);g.quadraticCurveTo(-9,-12,-8,0);
 g.lineTo(-5,-2.5);g.lineTo(-3,0);g.lineTo(-1,-2);g.lineTo(1.5,0);g.lineTo(3.5,-2.5);g.lineTo(6,-.5);g.quadraticCurveTo(8,-12,5,-24);g.closePath();
 g.fillStyle=lgg(g,0,-24,0,0,[[0,p.robeA],[1,p.robeB]]);g.fill();
 rim(g,-6,-24,-8,0);
 g.strokeStyle=p.trim;g.globalAlpha=.5;g.lineWidth=1;g.beginPath();g.moveTo(-5,-22);g.quadraticCurveTo(-7.5,-11,-7,-1);g.stroke();g.globalAlpha=1;
 g.beginPath();g.moveTo(-6,-22);g.quadraticCurveTo(-7,-31,0,-32.5);g.quadraticCurveTo(7,-31,6.2,-22);g.quadraticCurveTo(2,-19.5,-1,-20.5);g.quadraticCurveTo(-4.5,-21.5,-6,-22);g.closePath();
 g.fillStyle=lgg(g,0,-32,0,-20,[[0,p.robeA],[1,p.robeB]]);g.fill();
 g.beginPath();g.ellipse(2.4,-25.5,3.4,4,-.1,0,TAU);g.fillStyle='#05030c';g.fill();
 g.save();g.shadowColor=p.eye;g.shadowBlur=5;g.fillStyle=p.eye;
 g.beginPath();g.arc(1.4,-26,.9,0,TAU);g.arc(4.2,-25.6,.9,0,TAU);g.fill();g.restore();
 g.strokeStyle=p.trim;g.lineWidth=1.4;g.beginPath();g.moveTo(-5,-22);g.lineTo(-7,-16);g.moveTo(5,-22);g.lineTo(7,-16);g.stroke();
}
function staffMage(g,p){
 g.strokeStyle='#3a2a18';g.lineWidth=2.2;g.lineCap='round';
 g.beginPath();g.moveTo(0,3);g.lineTo(1.6,-32);g.stroke();
 g.save();g.shadowColor=p.orb;g.shadowBlur=8;g.fillStyle=p.orb;g.beginPath();g.arc(2,-34.5,3.4,0,TAU);g.fill();
 g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(1,-35.4,1.1,0,TAU);g.fill();g.restore();
 g.strokeStyle='#3a2a18';g.lineWidth=1.6;
 g.beginPath();g.moveTo(-.6,-31);g.quadraticCurveTo(-2.4,-35,-1,-37.5);g.stroke();
 g.beginPath();g.moveTo(4.4,-31);g.quadraticCurveTo(6.2,-35,4.6,-37.5);g.stroke();
}
function houndBody(g,p){
 g.strokeStyle=p.bodyB;g.lineWidth=3;g.lineCap='round';
 g.beginPath();g.moveTo(-13,-9);g.quadraticCurveTo(-19,-12,-21,-17);g.stroke();
 g.beginPath();g.moveTo(-14,-6);g.quadraticCurveTo(-16,-12,-9,-14);g.quadraticCurveTo(-2,-16.5,4,-15);g.quadraticCurveTo(10,-13.5,13,-9);g.quadraticCurveTo(15,-6,12,-4);g.quadraticCurveTo(2,-2.5,-8,-3.5);g.quadraticCurveTo(-13,-4,-14,-6);g.closePath();
 g.fillStyle=lgg(g,0,-16,0,-3,[[0,p.bodyA],[1,p.bodyB]]);g.fill();
 g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1;g.stroke();
 rim(g,-9,-14,4,-15);
 g.fillStyle=p.spike;
 for(let i=0;i<4;i++){const bx=-8+i*5.4,bh=5.5-i*.5;pth(g,[bx,-14.6,bx+2.2,-14.6-bh,bx+4.4,-14.2]);g.fill()}
 g.beginPath();g.moveTo(8,-13);g.quadraticCurveTo(13,-16,17,-13.5);g.quadraticCurveTo(20.5,-11.5,19.5,-8.5);g.lineTo(21.5,-7);g.lineTo(16.5,-6);g.lineTo(19.5,-4.2);g.lineTo(14,-4.6);g.quadraticCurveTo(10,-6,8,-8.5);g.closePath();
 g.fillStyle=lgg(g,8,-16,16,-4,[[0,p.bodyA],[1,p.bodyB]]);g.fill();g.stroke();
 g.fillStyle=p.claw;pth(g,[19.5,-7.2,20.6,-5.6,19,-5.8]);g.fill();
 g.save();g.shadowColor=p.eye;g.shadowBlur=5;g.fillStyle=p.eye;g.beginPath();g.arc(13.5,-11.5,1.5,0,TAU);g.fill();g.restore();
}
function buildSprites(){
 mk('tor_hero',30,38,g=>torsoHero(g,PALS.hero,true));
 mk('head_hero',24,26,g=>headHero(g,PALS.hero));
 mk('arm_hero',38,15,g=>armSword(g,PALS.hero,16),2,7.5);
 mk('tor_heroU',30,38,g=>torsoHero(g,PALS.heroU,false));
 mk('head_heroU',24,26,g=>headHero(g,PALS.heroU));
 mk('tor_heroF',28,38,g=>torsoHeroF(g,PALS.heroF,true));
 mk('head_heroF',26,27,g=>headHeroF(g,PALS.heroF));
 mk('tor_heroUF',28,38,g=>torsoHeroF(g,PALS.heroUF,false));
 mk('head_heroUF',26,27,g=>headHeroF(g,PALS.heroUF));
 mk('tor_bel',36,44,g=>torMega(g,PALS.bel));mk('head_bel',28,32,g=>headMega(g,PALS.bel,true));
 mk('arm_bel',52,17,g=>greatArm(g,PALS.bel,38),2,8.5);
 mk('tor_ber',34,42,g=>torMega(g,PALS.beru));mk('head_ber',26,30,g=>headMega(g,PALS.beru,false));
 mk('arm_ber',42,14,g=>spearArm(g,PALS.beru),2,7);
 mk('arm_claw',48,18,g=>armClaw(g),2,9);
 for(const k of['sol','shs']){const p=PALS[k];
  mk('tor_'+k,30,30,g=>torsoSoldier(g,p));mk('head_'+k,22,26,g=>headSoldier(g,p));
  mk('arm_'+k,40,14,g=>armSword(g,p,22),2,7);}
 mk('tor_kn',32,30,g=>torsoKnight(g,PALS.kn));mk('head_kn',24,26,g=>headKnight(g,PALS.kn));
 mk('arm_kn',50,14,g=>armSword(g,PALS.kn,32),2,7);
 mk('tor_brt',34,30,g=>torsoBrute(g,PALS.brt));mk('head_brt',24,26,g=>headBrute(g,PALS.brt));
 mk('arm_brt',46,16,g=>axeArm(g,PALS.brt),2,8);
 mk('tor_kam',38,32,g=>torsoBrute(g,PALS.kam));mk('head_kam',26,28,g=>headBrute(g,PALS.kam));
 mk('arm_kam',50,18,g=>axeArm(g,PALS.kam),2,8);
 mk('robe_mg',22,40,g=>robeMage(g,PALS.mg));mk('staff_mg',14,50,g=>staffMage(g,PALS.mg),7,14);
 mk('robe_shm',22,40,g=>robeMage(g,PALS.shm));mk('staff_shm',14,50,g=>staffMage(g,PALS.shm),7,14);
 mk('robe_bar',26,44,g=>robeMage(g,PALS.bar));mk('staff_bar',16,54,g=>staffMage(g,PALS.bar),8,16);
 mk('body_hd',50,26,g=>houndBody(g,PALS.hd));mk('body_shh',50,26,g=>houndBody(g,PALS.shh));
 mk('braz',26,48,g=>{
  g.fillStyle='#1c1730';pth(g,[-8,0,8,0,6,-5,-6,-5]);g.fill();
  g.fillStyle=lgg(g,-5,0,5,0,[[0,'#141024'],[.5,'#2a2144'],[1,'#100c1e']]);g.fillRect(-4.5,-34,9,29);
  g.fillStyle='#241c3c';g.fillRect(-6,-38,12,4);
  g.beginPath();g.ellipse(0,-40,9,3.4,0,0,TAU);g.fillStyle='#2b2148';g.fill();
  g.beginPath();g.ellipse(0,-40.5,6.4,2.2,0,0,TAU);g.fillStyle='#0d0a1c';g.fill();
  g.save();g.shadowColor='#60a5fa';g.shadowBlur=6;g.fillStyle='#93c5fd';g.beginPath();g.arc(0,-40.5,2,0,TAU);g.fill();g.restore();
  g.strokeStyle='rgba(139,92,246,.5)';g.lineWidth=1;g.beginPath();g.moveTo(-6,-5);g.lineTo(-4.5,-34);g.stroke();
 });
 mk('wtor',16,26,g=>{
  g.strokeStyle='#241c3c';g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-1,-8,1,-13);g.stroke();
  g.fillStyle='#2b2148';g.beginPath();g.ellipse(1,-14.5,4.6,2.6,0,0,TAU);g.fill();
  g.fillStyle='#0d0a1c';g.beginPath();g.ellipse(1,-14.8,3.2,1.6,0,0,TAU);g.fill();
  g.save();g.shadowColor='#fb923c';g.shadowBlur=5;g.fillStyle='#fdba74';g.beginPath();g.arc(1,-15,1.6,0,TAU);g.fill();g.restore();
 });
 mk('pillar',34,40,g=>{
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,0,14,5,0,0,TAU);g.fill();
  g.fillStyle='#191430';pth(g,[-11,-2,11,-2,9,-7,-9,-7]);g.fill();
  g.fillStyle=lgg(g,-8,0,8,0,[[0,'#120e22'],[.45,'#2c2348'],[1,'#0f0b1d']]);
  g.beginPath();g.moveTo(-8,-7);g.lineTo(-7,-26);g.lineTo(-3,-29);g.lineTo(2,-27);g.lineTo(7,-24);g.lineTo(8,-7);g.closePath();g.fill();
  rim(g,-8,-7,-7,-26);
  g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=1;g.beginPath();g.moveTo(-2,-8);g.lineTo(-1,-18);g.lineTo(-4,-24);g.stroke();
  g.fillStyle='rgba(76,107,76,.25)';g.beginPath();g.ellipse(-5,-8,3,1.6,0,0,TAU);g.fill();
  g.strokeStyle='rgba(139,92,246,.35)';g.beginPath();g.moveTo(8,-8);g.lineTo(7,-23);g.stroke();
 });
 mk('arch',120,172,g=>{
  g.fillStyle='rgba(6,4,16,.92)';g.fillRect(-34,-108,68,108);
  const col=x=>{
   g.fillStyle=lgg(g,x-9,0,x+9,0,[[0,'#0f0b20'],[.45,'#2a2148'],[1,'#0d0919']]);g.fillRect(x-9,-112,18,104);
   g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;g.strokeRect(x-9,-112,18,104);
   g.fillStyle='#332856';g.fillRect(x-12,-120,24,9);
   g.fillStyle='#1c1634';g.fillRect(x-12,-8,24,8);
   g.strokeStyle='rgba(168,85,247,.4)';g.beginPath();g.moveTo(x-9,-110);g.lineTo(x-9,-12);g.stroke();
   g.save();g.shadowColor='#7dd3fc';g.shadowBlur=4;g.strokeStyle='rgba(147,197,253,.8)';g.lineWidth=1.1;
   for(let i=0;i<3;i++){const ry=-30-i*26;g.beginPath();g.moveTo(x-3,ry);g.lineTo(x+3,ry-4);g.moveTo(x,ry+2);g.lineTo(x,ry-7);g.stroke()}
   g.restore();
  };
  col(-44);col(44);
  g.beginPath();g.arc(0,-108,52,Math.PI,0);g.arc(0,-108,38,0,Math.PI,true);g.closePath();
  g.fillStyle=lgg(g,0,-160,0,-100,[[0,'#2a2148'],[1,'#161030']]);g.fill();
  g.strokeStyle='rgba(168,85,247,.5)';g.lineWidth=1.2;
  g.beginPath();g.arc(0,-108,52,Math.PI,0);g.stroke();
  g.beginPath();g.arc(0,-108,38,Math.PI,0);g.stroke();
  g.fillStyle='#3a2d63';pth(g,[0,-164,7,-154,0,-144,-7,-154]);g.fill();
  g.strokeStyle='rgba(196,181,253,.5)';g.stroke();
 });
 mk('mgate',116,158,g=>{ // v0.9: мега-врата Владык
  g.fillStyle='rgba(10,7,2,.95)';g.fillRect(-32,-96,64,96);
  const col=x=>{
   g.fillStyle=lgg(g,x-10,0,x+10,0,[[0,'#241a04'],[.45,'#6b4e0e'],[1,'#160f02']]);g.fillRect(x-10,-104,20,100);
   g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=1;
   for(let i=0;i<5;i++){g.beginPath();g.moveTo(x-10,-90+i*20);g.lineTo(x+10,-96+i*20);g.stroke()}
   g.fillStyle='#8a6a1c';g.fillRect(x-13,-114,26,11);
   g.save();g.shadowColor='#fde68a';g.shadowBlur=7;
   g.fillStyle='#fbbf24';g.beginPath();g.moveTo(x,-104);g.lineTo(x+4,-97);g.lineTo(x,-92);g.lineTo(x-4,-97);g.closePath();g.fill();
   g.restore();
   g.strokeStyle='rgba(251,191,36,.55)';g.lineWidth=1.2;
   g.beginPath();g.moveTo(x-10,-102);g.lineTo(x-10,-8);g.stroke();
   g.save();g.shadowColor='#fef3c7';g.shadowBlur=4;g.strokeStyle='rgba(254,243,199,.85)';g.lineWidth=1.1;
   for(let i=0;i<3;i++){const ry=-26-i*24;g.beginPath();g.moveTo(x-4,ry);g.lineTo(x+4,ry-5);g.stroke()}
   g.restore();
  };
  col(-31);col(31);
  g.fillStyle=lgg(g,-31,-150,31,-150,[[0,'#6b4e0e'],[.5,'#fde68a'],[1,'#6b4e0e']]);g.fillRect(-42,-158,84,16);
  g.fillStyle='#fbbf24';g.fillRect(-42,-160,84,4);
  g.fillStyle='#160f02';g.fillRect(-42,-146,84,5);
  for(let i=0;i<8;i++){g.fillStyle=i%2?'#fbbf24':'#fde68a';g.beginPath();g.arc(-36+i*10.3,-150+Math.sin(i*1.2)*3,3,0,TAU);g.fill()}
  g.fillStyle='rgba(6,4,1,.92)';g.beginPath();g.moveTo(-21,-140);g.quadraticCurveTo(0,-52,21,-140);g.quadraticCurveTo(0,-158,-21,-140);g.fill();
  g.save();g.shadowColor='#fbbf24';g.shadowBlur=8;g.strokeStyle='rgba(251,191,36,.6)';g.lineWidth=2;
  g.beginPath();g.moveTo(-21,-140);g.quadraticCurveTo(0,-52,21,-140);g.stroke();
  g.beginPath();g.moveTo(-15,-138);g.quadraticCurveTo(0,-62,15,-138);g.stroke();g.restore();
  g.save();g.shadowColor='#fde68a';g.shadowBlur=6;g.fillStyle='#fde68a';
  g.beginPath();g.moveTo(0,-124);g.lineTo(4,-116);g.lineTo(0,-108);g.lineTo(-4,-116);g.closePath();g.fill();g.restore();
 });
 mk('rgate',116,158,g=>{
  g.fillStyle='rgba(8,3,6,.94)';g.fillRect(-32,-96,64,96);
  const col=x=>{
   g.fillStyle=lgg(g,x-10,0,x+10,0,[[0,'#1a060b'],[.45,'#3d1018'],[1,'#120409']]);g.fillRect(x-10,-104,20,100);
   g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=1;
   for(let i=0;i<5;i++){g.beginPath();g.moveTo(x-10,-90+i*20);g.lineTo(x+10,-96+i*20);g.stroke()}
   g.fillStyle='#4a1019';g.fillRect(x-13,-114,26,11);
   g.save();g.shadowColor='#ef4444';g.shadowBlur=6;
   g.fillStyle='#ef4444';g.beginPath();g.moveTo(x,-104);g.lineTo(x+4,-97);g.lineTo(x,-92);g.lineTo(x-4,-97);g.closePath();g.fill();
   g.restore();
   g.strokeStyle='rgba(239,68,68,.5)';g.lineWidth=1.2;
   g.beginPath();g.moveTo(x-10,-102);g.lineTo(x-10,-8);g.stroke();
   g.save();g.shadowColor='#fca5a5';g.shadowBlur=4;g.strokeStyle='rgba(252,165,165,.85)';g.lineWidth=1.1;
   for(let i=0;i<3;i++){const ry=-26-i*24;g.beginPath();g.moveTo(x-4,ry);g.lineTo(x+4,ry-5);g.stroke()}
   g.restore();
  };
  col(-42);col(42);
  g.beginPath();g.moveTo(-52,-100);g.quadraticCurveTo(-20,-140,0,-138);g.quadraticCurveTo(20,-140,52,-100);
  g.lineTo(38,-96);g.quadraticCurveTo(20,-124,0,-126);g.quadraticCurveTo(-20,-124,-38,-96);g.closePath();
  g.fillStyle=lgg(g,0,-140,0,-96,[[0,'#3d1018'],[1,'#1a060b']]);g.fill();
  g.strokeStyle='rgba(239,68,68,.55)';g.stroke();
  g.fillStyle='#4a1019';pth(g,[0,-150,8,-138,0,-128,-8,-138]);g.fill();
  g.save();g.shadowColor='#ef4444';g.shadowBlur=8;g.strokeStyle='rgba(252,165,165,.8)';g.lineWidth=1;g.stroke();g.restore();
 });
 mk('chest0',30,24,g=>{
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(0,0,13,4,0,0,TAU);g.fill();
  g.fillStyle=lgg(g,0,-14,0,0,[[0,'#8a5a22'],[1,'#5d3a14']]);g.fillRect(-11,-12,22,11);
  g.strokeStyle='#2a1a08';g.strokeRect(-11,-12,22,11);
  g.beginPath();g.moveTo(-11,-12);g.quadraticCurveTo(0,-22,11,-12);g.closePath();
  g.fillStyle=lgg(g,0,-20,0,-10,[[0,'#a06a2a'],[1,'#6d451a']]);g.fill();g.stroke();
  g.fillStyle='#d1a545';g.fillRect(-11,-8,22,2);g.fillRect(-2.4,-12,4.8,11);
  g.save();g.shadowColor='#fbbf24';g.shadowBlur=6;g.fillStyle='#fde68a';g.fillRect(-1.6,-10,3.2,4);g.restore();
 });
 mk('chest1',30,24,g=>{
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(0,0,13,4,0,0,TAU);g.fill();
  g.save();g.translate(-11,-12);g.rotate(-1.1);
  g.fillStyle='#6d451a';g.fillRect(0,-8,22,8);g.strokeStyle='#2a1a08';g.strokeRect(0,-8,22,8);g.restore();
  g.fillStyle='#1c1206';g.fillRect(-11,-12,22,11);
  g.save();g.shadowColor='#fbbf24';g.shadowBlur=8;g.fillStyle='rgba(251,191,36,.5)';
  g.beginPath();g.ellipse(0,-11,8,3,0,0,TAU);g.fill();g.restore();
  g.strokeStyle='#2a1a08';g.strokeRect(-11,-12,22,11);
  g.fillStyle='#d1a545';g.fillRect(-11,-9,22,2);
 });
 for(let v=0;v<3;v++)mk('cry'+v,24,26,g=>{
  const cols=[['#c084fc','#7c3aed'],['#7dd3fc','#2563eb'],['#f0abfc','#a21caf']][v];
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,0,9,3,0,0,TAU);g.fill();
  const shd=(x0,h,wd,a)=>{g.save();g.translate(x0,0);g.rotate(a);
   g.beginPath();g.moveTo(0,0);g.lineTo(wd*.5,-h*.45);g.lineTo(0,-h);g.lineTo(-wd*.5,-h*.4);g.closePath();
   g.fillStyle=lgg(g,0,0,0,-h,[[0,cols[1]],[1,cols[0]]]);g.fill();
   g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=.8;g.stroke();
   g.strokeStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(-wd*.12,-h*.15);g.lineTo(0,-h*.85);g.stroke();g.restore();};
  shd(-4,16,7,-.15);shd(2,20,8,.1);shd(6,12,6,.35);shd(-8,10,5,-.4);
 });
}
buildSprites();
