'use strict';
/* ═══ СУЩНОСТИ: игрок, враги, тени, Власть Теней ═══ */
/* ВЛАСТЬ ТЕНЕЙ */
function armyLevelUp(){
 G.army.lvl++;G.counters.army=G.army.lvl;reapplyArmy();
 sysNotify('ВЛАСТЬ ТЕНЕЙ',[`Уровень Власти: <b>${G.army.lvl}</b>`,`Слотов армии: <b>${armyMax()}</b>`,`Сила всех теней: +5%`]);
 SFX.lvl();renderShadows();
}
function checkArmy(){
 let need=armyNeed(G.army.lvl);
 while(G.army.cnt>=need&&G.army.lvl<AMAX_LV){armyLevelUp();need=armyNeed(G.army.lvl)}
}
function reapplyArmy(){
 const pw=armyPower();
 for(const s of G.shadows){s.maxhp=s.base.hp*GDM[s.grade]*pw;s.atk=s.base.atk*GDM[s.grade]*pw;s.hp=Math.min(s.hp,s.maxhp)}
}
function activeShadows(){return G.shadows.filter(s=>!s.bench)}
/* СУЩНОСТИ */
function newPlayer(sv){
 G.player={name:'',x:0,y:0,vx:0,vy:0,r:.3,level:1,exp:0,gold:0,crystals:0,essence:0,fury:0,
  hp:1,mp:1,atk:20,maxhp:280,maxmp:99,crit:8,spd:5,mpRegen:4,face:1,walk:0,moving:false,atkT:0,swingT:0,combo:0,comboT:0,
  cds:{q:0,e:0,r:0,f:0,x:0,c:0},skillLv:{q:1,e:1,r:1,f:1},dashT:0,dashX:0,dashY:0,inv:0,dead:false,aimX:0,aimY:1,
  relKasaka:false,relBaruka:false,relMonolith:false,relHeart:false,
  stats:{str:1,agi:1,vit:1,int:1,per:1},pts:0,sex:'m',cls:'shade'}; // v0.10: пол и класс
 if(sv){
  Object.assign(G.player,{name:sv.name||'',level:sv.level||1,exp:sv.exp||0,gold:sv.gold||0,crystals:sv.crystals||0,essence:sv.essence||0,fury:sv.fury||0,skillLv:Object.assign({q:1,e:1,r:1,f:1},sv.skillLv)});
  G.player.sex=sv.sex==='f'?'f':'m';G.player.cls=CLASSES[sv.cls]?sv.cls:'shade';
  if(sv.stats&&sv.stats.str){Object.assign(G.player.stats,sv.stats);G.player.pts=sv.pts||0}
  else G.player.pts=Math.max(0,(sv.level||1)-1)*5;
 }
 calcStats();
 G.player.hp=sv?Math.min(sv.hp||G.player.maxhp,G.player.maxhp):G.player.maxhp; // NaN-защита
 G.player.mp=sv?Math.min(sv.mp||G.player.maxmp,G.player.maxmp):G.player.maxmp;
}
function makeEnemy(type,f,x,y){
 const b=ET[type];
 const pw=(b.boss&&f>3)?f-2:f;
 return {kind:'enemy',type,x,y,vx:0,vy:0,r:b.r,hp:b.hp*mh(pw),maxhp:b.hp*mh(pw),atk:b.atk*ma(pw),spd:b.spd,
  exp:Math.round(b.exp*(1+.12*(f-1))),ag:b.ag,rng:b.rng,cdMax:b.cd,cd:rand(.5,1.5),wind:0,windMax:.32,flash:0,stun:0,
  kx:0,ky:0,walk:rand(9),face:1,mv:false,elite:b.elite,boss:b.boss,aggro:false,dead:false,swingT:0,lungeT:0,poison:null,ptick:0,stT:0,
  spec:b.spec||null,specCd:3};
}
function makeShadow(type,f,x,y,i,grade=0){
 const b=ET[type]||ET.soldier,m=GDM[clamp(grade,0,4)]*armyPower(); // v0.9: ранг 4 «Легенда»
 const hp=b.hp*.85*mh(f)*m,atk=b.atk*.7*ma(f)*m;
 return {kind:'shadow',type,x,y,r:.34,lvl:f,grade:clamp(grade,0,4),bench:false,base:{hp:b.hp*.85*mh(f),atk:b.atk*.7*ma(f)},
  atk,spd:type==='hound'?3.6:2.6,maxhp:hp,hp,cd:0,walk:rand(9),face:1,idx:i,rise:0,dead:false,swingT:0,mv:true,target:null,flash:0,stT:0};
}
function promoteShadow(idx){
 const s=G.shadows[idx];if(!s)return;
 if(s.grade>=4){toast('Достигнут высший ранг: Легенда','#f0abfc');return}
 const cost=GDC[s.grade+1];
 if(G.player.essence<cost){toast('Нужно эссенции: '+cost);SFX.ui();return}
 G.player.essence-=cost;s.grade++;
 const m=GDM[s.grade]*armyPower();
 s.maxhp=s.base.hp*m;s.atk=s.base.atk*m;s.hp=s.maxhp;
 SFX.arise();burst(s.x,s.y,22,GDCOL[s.grade],3);
 addFx({kind:'ring',x:s.x,y:s.y,r0:.3,r1:2,t:0,dur:.6,c:GDCOL[s.grade]});
 log('system',`<b>${shName(s)}</b> повышен до ранга <b style="color:${GDCOL[s.grade]}">${GDN[s.grade]}</b>!`);
 toast(shName(s)+' → '+GDN[s.grade],GDCOL[s.grade]);
 renderShadows();saveGame();
}
function toggleBench(idx,toBench){
 const s=G.shadows[idx];if(!s)return;
 if(!toBench){
  if(activeShadows().length>=armyMax()){toast('Строй полон ('+armyMax()+'). Повышайте Власть Теней (призывы X)');SFX.ui();return}
  s.bench=false;s.x=G.player.x+rand(-1,1);s.y=G.player.y+rand(-.6,.6);s.rise=1;
  burst(s.x,s.y,10,'#7dd3fc',2);SFX.swap();
  toast(shName(s)+' встаёт в строй','#93c5fd');
 }else{
  s.bench=true;toast(shName(s)+' отправлен в хранилище','#94a3b8');
 }
 renderShadows();saveGame();
}
function releaseShadow(idx){
 const s=G.shadows[idx];if(!s)return;
 G.shadows.splice(idx,1);
 G.player.essence+=2;
 toast(shName(s)+' отпущен (+2 эссенции)','#a78bfa');
 SFX.fail();renderShadows();updateComp(true);saveGame();
}
function shName(s){return SHN[s.type]+(s.grade?' · '+GDN[s.grade]:'')}
