'use strict';
/* ═══ АРМИЯ ТЕНЕЙ: ИИ и приказы теней (v0.9 — полное управление) ═══ */
function updateShadows(dt,p){
G.shadows.forEach(s=>{if(s.bench){s.hp=Math.min(s.maxhp,s.hp+s.maxhp*.03*dt)}});
 G.shadows.forEach((s,i)=>{
  if(s.bench)return;
  s.rise=Math.max(0,s.rise-dt*1.6);s.cd-=dt;s.flash=Math.max(0,(s.flash||0)-dt);s.swingT=Math.max(0,(s.swingT||0)-dt);
  if(!s.target||s.target.dead||dist(s.target.x,s.target.y,p.x,p.y)>10)s.target=null;
  if(!s.target)for(const e of G.enemies)if(!e.dead&&dist(e.x,e.y,p.x,p.y)<8){s.target=e;break}
  let moved=false;
  if(s.target){const tx=s.target.x,ty=s.target.y,d=dist(s.x,s.y,tx,ty);
   const rng=Math.min(ET[s.type].rng*.8+.2,2.2);
   s.face=tx>s.x?1:-1;
   if(s.type==='mage'||s.type==='baran'){
    if(d>6){const dd=d||1;if(collideMove(s,(tx-s.x)/dd*s.spd*dt,(ty-s.y)/dd*s.spd*dt)){s.walk+=dt*2;moved=true}}
    if(s.cd<=0&&d<6.5){s.cd=ET[s.type].cd*1.2;s.swingT=.2;SFX.shoot();
     G.projs.push({x:s.x,y:s.y,vx:(tx-s.x)/d*9,vy:(ty-s.y)/d*9,t:0,life:.9,dmg:s.atk,own:'s',kind:'sbolt',tr:[]});}
   }else{
    if(d>rng){const dd=d||1;
     if(collideMove(s,(tx-s.x)/dd*s.spd*dt,(ty-s.y)/dd*s.spd*dt)){s.walk+=dt*2;moved=true;s.stT=0}
     else{s.stT=(s.stT||0)+dt;
      if(s.stT>.7){const px2=-(ty-s.y),py2=tx-s.x;const pl2=Math.hypot(px2,py2)||1;
       collideMove(s,px2/pl2*s.spd*1.6*dt,py2/pl2*s.spd*1.6*dt);
       if(s.stT>1.6)s.stT=0;}}}
    if(s.cd<=0&&d<rng+.3){s.cd=ET[s.type].cd*1.1;s.swingT=.2;hitEnemy(s.target,s.atk,{src:'shadow'});}
   }
  }else{
   const act=activeShadows(),n=Math.max(1,act.length);
   const ii=act.indexOf(s);if(ii<0)return;
   const a=ii*TAU/n+G.time*.15;
   const tx=p.x+Math.cos(a)*1.5,ty=p.y+Math.sin(a)*.9,d=dist(s.x,s.y,tx,ty);
   if(d>14){s.x=p.x+rand(-.6,.6);s.y=p.y+rand(-.6,.6);burst(s.x,s.y,8,'#7dd3fc',2)}
   else if(d>.3){collideMove(s,(tx-s.x)/d*3.4*dt,(ty-s.y)/d*3.4*dt)&&(s.walk+=dt*2,moved=true);}
   s.face=p.face;
  }
  s.mv=moved;
  if(SET.parts&&Math.random()<.04)addPart(s.x+rand(-.3,.3),s.y+rand(-.2,.2),rand(2,14),0,0,rand(1,3),.6,1.6,'#3b82f6');
 });
 
}
