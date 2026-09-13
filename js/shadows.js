'use strict';
/* ═══ АРМИЯ ТЕНЕЙ: ИИ и приказы теней (v0.9 — полное управление: стойки, фокус, отзыв) ═══ */
function cycleStance(){
 const order=['assault','defend','hold'];
 setStance(order[(order.indexOf(G.stance||'assault')+1)%order.length]);
}
function setStance(st){
 if(G.stance===st)return;
 G.stance=st;
 toast('Приказ: '+STANCES[st].n+' — '+STANCES[st].d,'#93c5fd');
 log('system','Армии теней приказано: <b>'+STANCES[st].n+'</b>');
 SFX.ui();
 renderShadows();
 if(typeof updateStanceChip==='function')updateStanceChip();
}
function recallShadows(){
 let n=0;
 for(const s of G.shadows){
  if(s.bench)continue;
  s.target=null;
  const a=(n/G.shadows.length)*TAU+rand(-.3,.3);
  const nx=G.player.x+Math.cos(a)*rand(.7,1.7),ny=G.player.y+Math.sin(a)*rand(.7,1.7);
  if(!circleBlocked(nx,ny,.3)){burst(nx,ny,7,'#7dd3fc',2);s.x=nx;s.y=ny;n++}
 }
 if(n){toast('Тени отозваны к вам ('+n+')','#93c5fd');SFX.portal();G.cam.shake=Math.max(G.cam.shake,3)}
 else toast('Нет теней в строю','#93c5fd');
}
function shadowPickTarget(p,s,distMax){
 // приоритет: цель-приказ игрока (фокус) → прежняя цель → ближайший к игроку
 if(G.focus&&!G.focus.dead&&dist(G.focus.x,G.focus.y,p.x,p.y)<distMax+3)
  {s.target=G.focus;return G.focus}
 if(!s.target||s.target.dead||dist(s.target.x,s.target.y,p.x,p.y)>distMax)s.target=null;
 if(!s.target){
  let bd=distMax;
  for(const e of G.enemies){
   if(e.dead)continue;
   const d=dist(e.x,e.y,p.x,p.y);
   if(d<bd){bd=d;s.target=e}
  }
 }
 return s.target;
}
function updateShadows(dt,p){
 G.shadows.forEach(s=>{if(s.bench){s.hp=Math.min(s.maxhp,s.hp+s.maxhp*.03*dt)}});
 const st=G.stance||'assault';
 G.shadows.forEach((s,i)=>{
  if(s.bench)return;
  s.rise=Math.max(0,s.rise-dt*1.6);s.cd-=dt;s.flash=Math.max(0,(s.flash||0)-dt);s.swingT=Math.max(0,(s.swingT||0)-dt);
  let moved=false;
  const rng=Math.min(ET[s.type].rng*.8+.2,2.2);
  if(st==='hold'){
   // СТОЙ: тени стоят на месте, бьют только подошедших вплотную
   let tgt=(s.target&&!s.target.dead&&dist(s.target.x,s.target.y,s.x,s.y)<rng+.5)?s.target:null;
   if(!tgt)for(const e of G.enemies){if(!e.dead&&dist(e.x,e.y,s.x,s.y)<rng+.4){tgt=e;break}}
   s.target=tgt;
   if(tgt){s.face=tgt.x>s.x?1:-1;
    if(s.cd<=0&&dist(s.x,s.y,tgt.x,tgt.y)<rng+.3){s.cd=ET[s.type].cd*1.1;s.swingT=.2;hitEnemy(tgt,s.atk,{src:'shadow'})}}
  }else{
   const distMax=st==='defend'?5.5:10; // ШТУРМ: радиус 10; ОБОРОНА: 5.5
   const tgt=shadowPickTarget(p,s,distMax);
   if(tgt){const tx=tgt.x,ty=tgt.y,d=dist(s.x,s.y,tx,ty);
    s.face=tx>s.x?1:-1;
    const engage=st==='assault'||dist(p.x,p.y,tx,ty)<3.6; // в обороне бьём только близких к игроку
    if(s.type==='mage'||s.type==='baran'){
     if(st==='assault'&&d>6){const dd=d||1;if(collideMove(s,(tx-s.x)/dd*s.spd*dt,(ty-s.y)/dd*s.spd*dt)){s.walk+=dt*2;moved=true}}
     const dp=dist(s.x,s.y,p.x,p.y);
     if(st==='defend'&&dp>3){const dd=dp||1;if(collideMove(s,(p.x-s.x)/dd*s.spd*dt,(p.y-s.y)/dd*s.spd*dt)){s.walk+=dt*2;moved=true}}
     else if(st!=='defend'&&d>6.5&&dp>6){const dd=d||1;collideMove(s,(tx-s.x)/dd*s.spd*dt*.7,(ty-s.y)/dd*s.spd*dt*.7)&&(s.walk+=dt*2,moved=true)}
     if(s.cd<=0&&d<6.5&&engage){s.cd=ET[s.type].cd*1.2;s.swingT=.2;SFX.shoot();
      G.projs.push({x:s.x,y:s.y,vx:(tx-s.x)/d*9,vy:(ty-s.y)/d*9,t:0,life:.9,dmg:s.atk,own:'s',kind:'sbolt',tr:[]});}
    }else{
     if(engage&&d>rng){const dd=d||1;
      if(collideMove(s,(tx-s.x)/dd*s.spd*dt,(ty-s.y)/dd*s.spd*dt)){s.walk+=dt*2;moved=true;s.stT=0}
      else{s.stT=(s.stT||0)+dt;
       if(s.stT>.7){const px2=-(ty-s.y),py2=tx-s.x;const pl2=Math.hypot(px2,py2)||1;
        collideMove(s,px2/pl2*s.spd*1.6*dt,py2/pl2*s.spd*1.6*dt);
        if(s.stT>1.6)s.stT=0;}}}
     const dp=dist(s.x,s.y,p.x,p.y);
     if((!engage||d<=rng)&&st==='defend'&&dp>2.4){const dd=dp||1;
      if(collideMove(s,(p.x-s.x)/dd*s.spd*dt,(p.y-s.y)/dd*s.spd*dt)){s.walk+=dt*2;moved=true}}
     if(engage&&s.cd<=0&&d<rng+.3){s.cd=ET[s.type].cd*1.1;s.swingT=.2;hitEnemy(tgt,s.atk,{src:'shadow'});}
    }
   }else{
    // нет цели: орбита вокруг игрока
    const act=activeShadows(),n=Math.max(1,act.length);
    const ii=act.indexOf(s);if(ii<0){s.mv=false;return}
    const a=ii*TAU/n+G.time*.15;
    const tx=p.x+Math.cos(a)*1.5,ty=p.y+Math.sin(a)*.9,d=dist(s.x,s.y,tx,ty);
    if(d>14){s.x=p.x+rand(-.6,.6);s.y=p.y+rand(-.6,.6);burst(s.x,s.y,8,'#7dd3fc',2)}
    else if(d>.3){collideMove(s,(tx-s.x)/d*3.4*dt,(ty-s.y)/d*3.4*dt)&&(s.walk+=dt*2,moved=true);}
    s.face=p.face;
   }
  }
  s.mv=moved;
  if(SET.parts&&Math.random()<.04)addPart(s.x+rand(-.3,.3),s.y+rand(-.2,.2),rand(2,14),0,0,rand(1,3),.6,1.6,'#3b82f6');
 });
}
