'use strict';
/* ═══ БОЙ: удары, навыки, урон, врата, главный цикл обновления ═══ */
/* БОЙ */
function addFury(v){G.player.fury=clamp(G.player.fury+v*(G.player.relHeart?1.5:1),0,100)}
function spawnText(x,y,txt,col,big){if(G.texts.length>70)G.texts.shift();G.texts.push({x,y,t:0,txt,col,big})}
function addPart(x,y,z,vx,vy,vz,life,size,col){if(SET.parts&&G.parts.length>340)return;G.parts.push({x,y,z:z||0,vx,vy,vz:vz||0,life,t:0,size,col})}
function burst(x,y,n,col,sp=3){for(let i=0;i<n;i++){const a=rand(TAU),s=rand(.4,1)*sp;addPart(x,y,rand(6,20),Math.cos(a)*s,Math.sin(a)*s,rand(1,4),rand(.4,.9),rand(1.5,3.5),col)}}
function addFx(o){G.fx.push(o)}
function applyPoison(e,dps){e.poison={t:3.2,dps:Math.max(e.poison?e.poison.dps:0,dps)}}
function kasakaProc(e){
 if(!G.player.relKasaka||e.boss||e.dead)return;
 if(Math.random()<.18){e.stun=Math.max(e.stun,.7);spawnText(e.x,e.y-1,'ПАРАЛИЧ','#a3e635')}
}
function hitEnemy(e,dmg,opts={}){
 if(e.dead)return;
 let crit=false;const p=G.player;
 if(opts.src!=='shadow'){crit=opts.forceCrit?true:Math.random()*100<p.crit;if(crit){dmg*=p.relBaruka?3.4:3;G.punch=Math.min(.5,G.punch+.16);G.hitstop=Math.max(G.hitstop,.04)}}
 else if(opts.forceCrit){dmg*=3;crit=true}
 if(G.ultiT>0&&opts.src!=='shadow')dmg*=1.35;
 dmg=Math.max(1,Math.round(dmg*rand(.9,1.1)));
 e.hp-=dmg;e.flash=.13;e.aggro=true;
 if(opts.src!=='shadow'){G.focus=e;G.focusT=8} // v0.9: приоритетная цель армии
 spawnText(e.x,e.y,'-'+dmg,crit?'#fca5a5':opts.src==='shadow'?'#7dd3fc':'#ffffff',crit);
 if(crit){SFX.crit();if(SET.shake)G.cam.shake=Math.max(G.cam.shake,5)}else if(opts.src!=='shadow')SFX.hit();
 burst(e.x,e.y,crit?10:5,crit?'#f87171':'#e9d5ff',2.5);
 if(SET.parts&&opts.ang!==undefined)for(let i=0;i<3;i++)addPart(e.x,e.y,rand(8,16),Math.cos(opts.ang+rand(-.5,.5))*rand(3,6),Math.sin(opts.ang+rand(-.5,.5))*rand(3,6),rand(1,3),.25,1.6,'#fde68a');
 if(opts.kb){const d=Math.max(.001,dist(e.x,e.y,p.x,p.y));e.kx+=(e.x-p.x)/d*opts.kb*6;e.ky+=(e.y-p.y)/d*opts.kb*6}
 if(opts.stun)e.stun=Math.max(e.stun,opts.stun);
 if(!opts.src||opts.src==='p')kasakaProc(e);
 if(G.ultiT>0&&opts.src!=='shadow'){const heal=Math.round(dmg*.12);
  if(heal>0&&p.hp<p.maxhp){p.hp=Math.min(p.maxhp,p.hp+heal);G.lsT-=1;if(G.lsT<=0){G.lsT=.35;spawnText(p.x,p.y-1.6,'+'+heal,'#4ade80')}}}
 addFury(dmg*.06);
 if(e.hp<=0)killEnemy(e);
}
function killEnemy(e){
 if(e.dead)return;
 e.dead=true;const p=G.player;const b=ET[e.type];
 G.counters.kills++;addFury(9);G.hitstop=Math.max(G.hitstop,.045);
 if(e.elite||e.boss)G.counters.elites++;
 ensureDaily();G.daily.kills++;if(e.elite||e.boss)G.daily.elites++;checkDaily();
 // владыка алых врат — награда сразу (плюс ранговая на выходе)
 if(e.gateBoss==='mega'){ // v0.9: мегабосс
  p.essence+=8;p.gold+=500;
  dropLoot('relic',e.x,e.y,makeItem('relic',G.gateDiff));
  dropLoot('relic',e.x+.5,e.y+.2,makeItem('relic',G.gateDiff));
  dropLoot('gem',e.x,e.y,25);
  dropLoot('crystalQ',e.x,e.y,3);
  sysNotify('МЕГАБОСС ПАЛ',[b.n+' повержен!','Тело хранит <b style="color:#f0abfc">Легендарную тень</b> — используйте АРИЗ!','Награда: двойная реликвия, 25 кристаллов, эссенция +8.']);
  splash('МЕГАБОСС ПАЛ','ТЕНЬ ВЛАДЫКИ ДОСТУПНА');SFX.chest();G.cam.shake=12;
 }
 if(e.gateBoss==='lord'){
  p.essence+=3;
  dropLoot('relic',e.x,e.y,makeItem('relic',G.gateDiff));
  dropLoot('gem',e.x,e.y,10);
  sysNotify('ВЛАДЫКА ПАЛ',[b.n+' повержён!','Реликвия и эссенция ваши. Покиньте врата через выход.']);
  splash('ВЛАДЫКА ПАЛ','ВРАТА ПОКОРЕНЫ');SFX.chest();
 }
 burst(e.x,e.y,16,e.boss?'#7dd3fc':'#ef4444',3.5);
 for(let i=0;i<7;i++)addPart(e.x+rand(-.3,.3),e.y,rand(4,14),rand(-.4,.4),rand(-.4,.4),rand(3,6),rand(.6,1),2,'#7dd3fc');
 G.decals.push({x:e.x,y:e.y,t:0});
 const ng=irand(b.g[0],b.g[1])+Math.round(G.gateDiff*1.5);
 for(let i=0;i<Math.min(4,1+(ng/12|0));i++)dropLoot('gold',e.x+rand(-.4,.4),e.y+rand(-.4,.4),Math.ceil(ng/Math.min(4,1+(ng/12|0))));
 if(Math.random()<.55)dropLoot('gem',e.x,e.y,irand(1,2));
 if(Math.random()<.12)dropLoot('potionHP',e.x,e.y,1);
 if(Math.random()<.10)dropLoot('potionMP',e.x,e.y,1);
 if(Math.random()<.22)dropLoot(['mat1','mat2','mat3'][irand(0,2)],e.x,e.y,1);
 if(Math.random()<.07+e.elite*.3)dropLoot('item',e.x,e.y,makeItem(['weapon','armor','ring'][irand(0,2)],G.gateDiff,e.elite?Math.max(1,weightedRar(G.gateDiff)):undefined));
 if(e.boss&&e.gateBoss!=='lord'&&Math.random()<.25)dropLoot('relic',e.x,e.y,makeItem('relic',G.gateDiff));
 if(e.boss)dropLoot('crystalQ',e.x,e.y,1);
 if((e.elite||e.boss)&&!e.gateBoss){p.essence+=e.boss?3:1;p.gold+=e.boss?120:40;
  log('combat',`<b>${b.n}</b> повержен!`);}
 const rank=e.boss?'boss':e.elite?'elite':'norm';
 G.corpses.push({type:e.type,x:e.x,y:e.y,t:0,rank,arise:0,burn:0,riseCh:b.rise,mega:b.mega?1:0});
 if(!G.tutArise){G.tutArise=true;
  toast('Тело врага пало — нажмите X или кнопку «АРИЗ!» рядом с ним','#93c5fd');
  log('system','<b>Система:</b> используйте «АРИЗ!» (X) у тела, чтобы извлечь тень.');}
 gainExp(Math.round(e.exp*(1+.12*(G.gateDiff-1))));
 checkQuests();invDirty();
}
function dropLoot(kind,x,y,val){G.loots.push({kind,x:x+rand(-.3,.3),y:y+rand(-.3,.3),val,vx:rand(-2,2),vy:rand(-2,2),t:0})}
function gainExp(v){
 const p=G.player;p.exp+=v;
 let need=Math.round(80*Math.pow(p.level,1.35)+30);
 while(p.exp>=need){p.exp-=need;p.level++;p.pts=(p.pts||0)+5;calcStats();p.hp=p.maxhp;p.mp=p.maxmp;
  SFX.lvl();addFx({kind:'ring',x:p.x,y:p.y,r0:.3,r1:3,t:0,dur:.7,c:'#fbbf24'});
  addFx({kind:'pillar',x:p.x,y:p.y,t:0,dur:.7});
  burst(p.x,p.y,26,'#fbbf24',4);
  sysNotify('УВЕДОМЛЕНИЕ',['Вы достигли уровня <b>'+p.level+'</b>.','Получено: <b>5 очков способностей</b>.','Ранг охотника: <b style="color:'+RANKC[rankOf(p.level)]+'">'+rankOf(p.level)+'</b>.']);
  log('system',`<b>Уровень повышен: ${p.level}!</b>`);
  checkQuests();need=Math.round(80*Math.pow(p.level,1.35)+30);saveGame();}
}
function hitOres(x,y,r){ // v0.9: добыча руды ударами
 if(G.mode!=='dungeon')return;
 for(const c of M.crystals){
  if(c.mined||c.hp===undefined)continue;
  if(dist(c.x,c.y,x,y)>r+.35)continue;
  c.hp--;SFX.hit();burst(c.x,c.y,4,'#93c5fd',1.6);
  if(c.hp<=0){c.mined=true;
   const gold=irand(8,20)+G.gateDiff*2;
   dropLoot('gold',c.x,c.y,gold);
   dropLoot(['mat1','mat2','mat3'][irand(0,2)],c.x,c.y,1);
   if(Math.random()<.2)dropLoot('gem',c.x,c.y,irand(1,2));
   if(Math.random()<.08)dropLoot('crystalQ',c.x,c.y,1);
   burst(c.x,c.y,12,'#67e8f9',2.5);
   log('combat','Добыта <b>руда</b> из жилы: золото, материалы');checkQuests();
  }else spawnText(c.x,c.y-.8,'руда','#a5f3fc');
 }
}
function meleeArc(ang,range,arc,mult,opts={}){
 const p=G.player;
 addFx({kind:'arc',x:p.x,y:p.y,dir:ang,range,arc,t:0,dur:opts.dur||.2,c1:opts.c1||'rgba(168,85,247,.5)',c2:opts.c2||'#e9d5ff'});
 hitOres(p.x,p.y,range*.9);
 for(const e of G.enemies){
  const d=dist(e.x,e.y,p.x,p.y);if(d>range+e.r)continue;
  let a=Math.atan2(e.y-p.y,e.x-p.x)-ang;while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;
  if(Math.abs(a)<arc/2+.25)hitEnemy(e,p.atk*mult,Object.assign({ang},opts));
 }
}
function aimPoint(){
 const p=G.player;const mouse=input.aimWorld;
 let tgt=null,bd=6.5+((p.stats&&p.stats.per||1)-1)*.3;
 for(const e of G.enemies){const d=dist(e.x,e.y,p.x,p.y);if(d<bd){bd=d;tgt=e}}
 if(input.touchMode||!mouse)return tgt?{x:tgt.x,y:tgt.y}:{x:p.x+p.aimX*3,y:p.y+p.aimY*3};
 if(tgt&&dist(tgt.x,tgt.y,mouse.x,mouse.y)<2.5)return{x:tgt.x,y:tgt.y};
 return mouse;
}
function faceTo(x,y){const p=G.player;p.aimX=x-p.x;p.aimY=y-p.y;const l=Math.hypot(p.aimX,p.aimY)||1;p.aimX/=l;p.aimY/=l;if(Math.abs(p.aimX)>.15)p.face=p.aimX>0?1:-1}
function basicAttack(){
 const p=G.player;if(p.atkT>0||p.dead)return;
 const t=aimPoint();faceTo(t.x,t.y);
 const ang=Math.atan2(t.y-p.y,t.x-p.x);
 const wasStealth=G.stealth>0;
 p.comboT=.9;p.combo=(p.combo+1)%3;
 const third=p.combo===2;
 const mult=third?1.6:1, range=(third?2.05:1.75)+(G.ultiT>0?.4:0), arc=third?2.3:1.7;
 p.atkT=third?.44:.32;p.swingT=.2;
 p.vx+=Math.cos(ang)*(third?3.2:2.2);p.vy+=Math.sin(ang)*(third?3.2:2.2);
 SFX.swing();
 if(wasStealth){
  G.stealth=0;G.hitstop=Math.max(G.hitstop,.09);SFX.ambush();
  burst(p.x,p.y,10,'#94a3b8',2);
  meleeArc(ang,range+.3,arc,3,{forceCrit:true,kb:.5});
  spawnText(p.x,p.y-2,'УБИЙСТВО!','#fde047',true);
 }else{
  meleeArc(ang,range,arc,mult,{kb:third?.45:.15,c1:third?'rgba(74,222,128,.5)':undefined,c2:third?'#bbf7d0':undefined});
  for(const e of G.enemies){if(!e.dead&&dist(e.x,e.y,p.x,p.y)<range+e.r)applyPoison(e,p.atk*.14)}
 }
}
function meleeArc360(range,mult,opts={}){
 const p=G.player;
 addFx({kind:'ring',x:p.x,y:p.y,r0:.3,r1:range,t:0,dur:.25,c:'#a855f7'});
 hitOres(p.x,p.y,range*.9);
 for(const e of G.enemies){if(!e.dead&&dist(e.x,e.y,p.x,p.y)<range+e.r){hitEnemy(e,p.atk*mult,opts);if(!e.dead)applyPoison(e,p.atk*.12)}}
}
function castSkill(k){
 const p=G.player;if(!p||p.dead)return;
 if(k==='u'){
  if(G.ultiT>0)return;
  if(p.fury<100){toast('Ярость не готова: '+Math.floor(p.fury)+'%');SFX.ui();return}
  p.fury=0;G.ultiT=SK.u.dur;G.ultiTick=0;SFX.ulti();G.punch=Math.min(.6,G.punch+.35);
  splash('ПРОБУЖДЕНИЕ МОНАРХА','АРИЗЕ — ВЛАСТЬ ТЕНЕЙ');
  log('system','<b>ПРОБУЖДЕНИЕ МОНАРХА!</b> Тьма слушается вас.');
  addFx({kind:'ring',x:p.x,y:p.y,r0:.5,r1:6.5,t:0,dur:.6,c:'#a855f7'});
  burst(p.x,p.y,40,'#a855f7',5);G.cam.shake=9;return;
 }
 if(k==='x'){tryArise();return}
 if(k==='c'){trySwap();return}
 const s=SK[k],lv=p.skillLv[k];
 if(p.cds[k]>0){toast('Перезарядка: '+p.cds[k].toFixed(1)+' с');return}
 if(p.mp<s.mp){toast('Недостаточно маны');SFX.ui();return}
 p.mp-=s.mp;p.cds[k]=s.cd;
 const t=aimPoint();faceTo(t.x,t.y);
 const mult=s.dmg*(1+.15*(lv-1));
 G.stealth=0;
 if(k==='q'){G.whirl={t:.92,tick:0};SFX.whirl();}
 else if(k==='e'){SFX.shoot();const base=Math.atan2(t.y-p.y,t.x-p.x);
  for(let i=-2;i<=2;i++)G.projs.push({x:p.x,y:p.y,vx:Math.cos(base+i*.2)*11.5,vy:Math.sin(base+i*.2)*11.5,t:0,life:.85,dmg:p.atk*mult,own:'p',kind:'dagger',tr:[]});}
 else if(k==='r'){SFX.hand();G.cam.shake=6;G.punch=Math.min(.6,G.punch+.25);
  G.hands.push({x:t.x,y:t.y,t:0,dur:1.5,dmg:p.atk*mult});
  addFx({kind:'ring',x:t.x,y:t.y,r0:2.2,r1:.4,t:0,dur:1.4,c:'#c084fc'});}
 else if(k==='f'){SFX.dash();p.dashT=.16;p.inv=.3;G.stealth=2.5;
  const mv=moveDir();let dx,dy;
  if(mv.l>.1){dx=mv.wx/mv.l;dy=mv.wy/mv.l}else{const a=Math.atan2(t.y-p.y,t.x-p.x);dx=Math.cos(a);dy=Math.sin(a)}
  const l=Math.hypot(dx,dy)||1;p.dashX=dx/l*22;p.dashY=dy/l*22;
  addFx({kind:'streak',x:p.x,y:p.y,x2:p.x+dx/l*3.4,y2:p.y+dy/l*3.4,t:0,dur:.3});
  for(let i=0;i<3;i++)G.ghosts.push({x:p.x-dx*i*.06,y:p.y-dy*i*.06,face:p.face,t:-i*.05});}
}
function tryArise(){
 const p=G.player;if(p.dead)return;
 if(p.cds.x>0){toast('Перезарядка: '+p.cds.x.toFixed(1)+' с');return}
 const bodies=G.corpses.filter(c=>!c.arise&&!c.burn&&dist(c.x,c.y,p.x,p.y)<3.4);
 if(!bodies.length){toast('Рядом нет тел для извлечения');SFX.ui();return}
 p.cds.x=1.4;
 for(const c of bodies){
  if(p.mp<SK.x.mp){toast('Недостаточно маны для призыва');break}
  p.mp-=SK.x.mp;
  const chance=c.riseCh!==undefined?c.riseCh:(c.rank==='boss'?.3:c.rank==='elite'?.4:.6);
  if(Math.random()<chance+G.riseBonus){
   c.arise=.9;
   spawnText(c.x,c.y-1.4,'АРИЗ!','#c084fc',true);
   SFX.arise();G.punch=Math.min(.6,G.punch+.15);
   addFx({kind:'ring',x:c.x,y:c.y,r0:.2,r1:2.2,t:0,dur:.8,c:'#60a5fa'});
   log('system','<b>АРИЗ!</b> Тьма дрожит над телом '+ET[c.type].n+'…');
  }else{
   c.burn=.9;
   spawnText(c.x,c.y,'Тень ускользнула…','#94a3b8');
   SFX.fail();
  }
 }
}
function countPending(){return G.corpses.reduce((n,c)=>n+(c.arise>0?1:0),0)}
function trySwap(){
 const p=G.player;if(p.dead)return;
 if(p.cds.c>0){toast('Перезарядка: '+p.cds.c.toFixed(1)+' с');return}
 const s=activeShadows().sort((a,b)=>dist(a.x,a.y,p.x,p.y)-dist(b.x,b.y,p.x,p.y))[0];
 if(!s){toast('Нет теней в строю');SFX.ui();return}
 if(p.mp<SK.c.mp){toast('Недостаточно маны');SFX.ui();return}
 p.mp-=SK.c.mp;p.cds.c=SK.c.cd;
 const ox=p.x,oy=p.y;
 burst(p.x,p.y,10,'#60a5fa',3);burst(s.x,s.y,10,'#60a5fa',3);
 G.ghosts.push({x:p.x,y:p.y,face:p.face,t:0});
 p.x=s.x;p.y=s.y;s.x=ox;s.y=oy;
 p.inv=Math.max(p.inv,.25);SFX.swap();
 spawnText(p.x,p.y-1.6,'Обмен Тенями','#93c5fd');
}
/* ВРАТА: спавн/вход/выход */
function pickRank(){
 const unl=clamp(1+Math.floor(G.counters.gates/3),1,6);
 const ws=[6,5,4,3,2,1].slice(0,unl);
 let t=ws.reduce((a,b)=>a+b,0),r=Math.random()*t;
 for(let i=0;i<unl;i++){r-=ws[i];if(r<=0)return i}
 return 0;
}
function spawnHubGate(){
 const idx=pickRank();
 const sp=M.spawns[irand(0,M.spawns.length-1)];
 // v0.9: золотые мега-врата Владык — шанс растёт после 9 зачисток
 const mega=G.counters.gates>=9&&Math.random()<.16&&idx>=3;
 G.hubGate={x:sp.x,y:sp.y,rank:idx,red:!mega&&idx>=4&&Math.random()<.5,mega,life:60};
 if(mega)sysNotify('ЗОЛОТЫЕ МЕГА-ВРАТА',[
  '<b style="color:#fbbf24">ВРАТА ВЛАДЫК</b>',
  'Внутри ждёт мегабосс. Победа даст <b style="color:#f0abfc">Легендарную тень</b>.',
  'Отмечены на карте. Врата закроются через 60 секунд.']);
 else sysNotify('ОБНАРУЖЕНЫ ВРАТА',[
  G.hubGate.red?'<b style="color:#f87171">АЛЫЕ ВРАТА · Дворец Демонов</b>':'Врата ранга <b style="color:'+RANKC[RANKS[idx]]+'">'+RANKS[idx]+'</b>',
  'Отмечены на карте. Врата закроются через 60 секунд.']);
 SFX.portal();
}
function enterHubGate(){
 const g=G.hubGate;if(!g||G.mode!=='hub')return;
 genDungeon(g.rank,g.red,g.mega);placePlayer();
 G.mode='dungeon';G.fade=1;SFX.gate();
 G.cine=1.8;document.body.classList.add('cine');
 splash(g.mega?'ЗОЛОТЫЕ МЕГА-ВРАТА':g.red?'ДВОРЕЦ ДЕМОНОВ':'ВРАТА РАНГА '+RANKS[g.rank],g.mega?'ВЛАДЫКА ЖДЁТ':g.red?'ВЛАДЫКА ЖДЁТ':'ЗАЧИСТИТЕ ПОДЗЕМЕЛЬЕ',g.mega||g.red);
 sysNotify('ВХОД В ВРАТА',['Уничтожьте всех демонов.','Босс: '+(g.mega?'<b style="color:#fbbf24">Мегабосс Владык</b>':g.red?'<b>Владыка Дворца</b>':g.rank>=2?'<b>Тёмный Рыцарь</b>':'нет')+'.']);
 log('story','Вы вошли в врата ранга <b style="color:'+RANKC[RANKS[g.rank]]+'">'+RANKS[g.rank]+'</b>.');
 saveGame();
}
function returnHub(){
 const p=G.player,idx=G.gateRank,red=G.gateRed;
 const gold=(60+idx*45)*(red?2:1)+irand(0,25),cry=4+idx*3+(red?8:0),ess=idx>=2?(red?2:1):0;
 p.gold+=gold;p.crystals+=cry;p.essence+=ess;
 G.counters.gates++;
 ensureDaily();G.daily.gates++;checkDaily();
 sysNotify('ВРАТА ЗАЧИЩЕНЫ',[
  'Награда: <b>'+gold+'</b> золота, <b>'+cry+'</b> кристаллов'+(ess?', <b>'+ess+'</b> эссенции':''),
  'Следующие врата откроются в другом месте.']);
 log('story','Врата ранга <b style="color:'+RANKC[RANKS[idx]]+'">'+RANKS[idx]+'</b> зачищены. Вы вернулись в Мир.');
 SFX.chest();
 G.mode='hub';G.hubGate=null;G.gateT=rand(18,32);
 genHub();placePlayer();G.fade=1;
 checkQuests();saveGame();
}
/* ОБНОВЛЕНИЕ */
function update(dt){
 const p=G.player;if(!p)return;
 G.time+=dt;
 G.punch=Math.max(0,G.punch-dt*2.4);
 G.fade=Math.max(0,G.fade-dt*2);
 if(G.cine>0){G.cine-=dt;if(G.cine<=0)document.body.classList.remove('cine')}
 if(G.stealth>0){G.stealth-=dt;if(Math.random()<dt*8)G.ghosts.push({x:p.x,y:p.y,face:p.face,t:0})}
 const md=moveDir();
 p.moving=md.l>.05||p.dashT>0;
 let sp=p.spd*(G.ultiT>0?1.3:1);
 if(G.stealth>0)sp*=1.3;
 if(G.whirl)sp*=1.2;
 if(p.dashT>0){p.dashT-=dt;collideMove(p,p.dashX*dt,p.dashY*dt);
  if(Math.random()<.6)G.ghosts.push({x:p.x,y:p.y,face:p.face,t:0});}
 else{p.vx=lerp(p.vx,md.wx*sp*md.l,1-Math.exp(-12*dt));p.vy=lerp(p.vy,md.wy*sp*md.l,1-Math.exp(-12*dt));
  collideMove(p,p.vx*dt,p.vy*dt);}
 if(md.l>.05&&p.atkT<=0&&p.swingT<=0){const l=Math.hypot(md.wx,md.wy)||1;p.aimX=md.wx/l;p.aimY=md.wy/l;if(Math.abs(md.wx)>.15)p.face=md.wx>0?1:-1} // v0.9: тело поворачивается по движению
 p.walk+=dt*(p.moving?1:.35);
 p.atkT=Math.max(0,p.atkT-dt);p.swingT=Math.max(0,p.swingT-dt);p.inv=Math.max(0,p.inv-dt);
 p.comboT-=dt;if(p.comboT<=0)p.combo=0;
 for(const k in p.cds)p.cds[k]=Math.max(0,p.cds[k]-dt);
 p.mp=Math.min(p.maxmp,p.mp+(p.mpRegen||4)*dt);
 G.noCombat+=dt;
 if(!p.dead&&G.noCombat>4&&p.hp<p.maxhp)p.hp=Math.min(p.maxhp,p.hp+p.maxhp*.012*dt); // ФИКС v0.8: без регена у мёртвого
 if(p.relMonolith&&!p.dead){G.regenT+=dt;
  if(G.regenT>5&&G.noCombat>3&&p.hp<p.maxhp){G.regenT=0;const h=Math.round(p.maxhp*.015);
   p.hp=Math.min(p.maxhp,p.hp+h);spawnText(p.x,p.y-1.4,'+'+h,'#4ade80')}}
 if(input.attackHeld&&!anyModal())basicAttack();
 if(G.whirl){G.whirl.t-=dt;G.whirl.tick-=dt;
  if(G.whirl.tick<=0){G.whirl.tick=.28;SFX.swing();meleeArc360(2.15,.85,{kb:.12})}
  if(G.whirl.t<=0)G.whirl=null;}
 for(let i=G.hands.length-1;i>=0;i--){const hz=G.hands[i];hz.t+=dt;
  for(const e of G.enemies){if(e.dead)continue;const d=dist(e.x,e.y,hz.x,hz.y);
   if(d<4.2){const pull=1-hz.t/hz.dur;const dd=d||1;
    collideMove(e,(hz.x-e.x)/dd*7.5*pull*dt,(hz.y-e.y)/dd*7.5*pull*dt);
    e.stun=Math.max(e.stun,.2);e.flash=Math.max(e.flash,.04);}}
  if(SET.parts&&Math.random()<dt*40){const a=rand(TAU),r=rand(1.5,4);
   addPart(hz.x+Math.cos(a)*r,hz.y+Math.sin(a)*r*.5,rand(4,22),-Math.cos(a)*2.2,-Math.sin(a)*1.1,rand(1,3),.5,1.8,'#c084fc')}
  if(hz.t>=hz.dur){
   SFX.nova();G.cam.shake=Math.max(G.cam.shake,6);G.punch=Math.min(.6,G.punch+.25);
   addFx({kind:'ring',x:hz.x,y:hz.y,r0:.3,r1:3,t:0,dur:.4,c:'#e9d5ff'});
   burst(hz.x,hz.y,26,'#a855f7',4.5);
   for(const e of G.enemies){if(!e.dead&&dist(e.x,e.y,hz.x,hz.y)<3.2)hitEnemy(e,hz.dmg,{kb:.4})}
   G.hands.splice(i,1);}
 }
 for(let i=G.strikes.length-1;i>=0;i--){const s2=G.strikes[i];s2.t+=dt;
  if(s2.t>=s2.dur){
   addFx({kind:'bolt',x1:s2.x+.8,y1:s2.y-6,x2:s2.x,y2:s2.y,t:0,dur:.22,seed:Math.random()*9});
   addFx({kind:'ring',x:s2.x,y:s2.y,r0:.1,r1:1.2,t:0,dur:.3,c:'#e879f9'});
   burst(s2.x,s2.y,12,'#e879f9',3.5);SFX.bolt();
   if(dist(p.x,p.y,s2.x,s2.y)<1.25&&p.inv<=0)hurtPlayer(s2.dmg);
   G.strikes.splice(i,1);}
  else if(SET.parts&&Math.random()<dt*30)addPart(s2.x+rand(-.5,.5),s2.y+rand(-.3,.3),rand(0,3),0,0,rand(1,3),.4,1.6,'#e879f9');
 }
 if(G.ultiT>0){G.ultiT-=dt;G.ultiTick-=dt;
  if(Math.random()<dt*18)addPart(p.x+rand(-.5,.5),p.y+rand(-.4,.4),rand(0,8),rand(-.4,.4),rand(-.4,.4),rand(2,5),.5,2,'#c084fc');
  if(G.ultiTick<=0){G.ultiTick=.5;const tg=G.enemies.filter(e=>!e.dead&&dist(e.x,e.y,p.x,p.y)<7);
   for(let i=0;i<Math.min(3,tg.length);i++){const e=tg[irand(0,tg.length-1)];
    addFx({kind:'bolt',x1:p.x,y1:p.y,x2:e.x,y2:e.y,t:0,dur:.25,seed:Math.random()*9});
    hitEnemy(e,p.atk*1.2,{});burst(e.x,e.y,8,'#a855f7',3);}}}
 /* --- волны подземелья / таймер врат Мира --- */
 if(G.mode==='hub'){
  if(G.hubGate){G.hubGate.life-=dt;
   if(G.hubGate.life<=0){G.hubGate=null;G.gateT=rand(20,40);toast('Врата закрылись…','#94a3b8')}}
  else{G.gateT-=dt;if(G.gateT<=0)spawnHubGate()}
 }else{
  if(G.wave.budget>0){G.wave.t-=dt;
   if(G.wave.t<=0){G.wave.t=rand(2.2,3.4);
    let n=Math.min(G.wave.budget,irand(2,3));
    const r=M.rooms[irand(1,M.rooms.length-1)]||M.rooms[0];
    for(let i=0;i<n;i++){const x=r.cx+rand(-r.w/3,r.w/3),y=r.cy+rand(-r.h/3,r.h/3);
     if(blocked(x|0,y|0)||circleBlocked(x,y,.35))continue;
     const roll=Math.random(),type=roll<.4?'hound':roll<.75?'soldier':'mage';
     G.enemies.push(makeEnemy(type,G.gateDiff,x,y));G.wave.budget--;}
   }
   if(!G.wave.eliteDone&&G.wave.budget<=G.wave.eliteAt){G.wave.eliteDone=true;
    const r=M.rooms[M.rooms.length-1];
    const e=makeEnemy('brute',G.gateDiff,r.cx,r.cy);e.aggro=true;
    G.enemies.push(e);SFX.roar();G.cam.shake=7;
    splash('ПАЛАЧ БЕЗДНЫ','ЭЛИТНЫЙ ДЕМОН',false);
    toast('Элита: Палач Бездны','#f87171');}
  }else if(G.wave.bossPending){
   const r=M.rooms[M.rooms.length-1];
   const e=makeEnemy(G.wave.bossPending,G.gateDiff+(G.gateRed?2:0),r.cx,r.cy);
   e.aggro=true;e.gateBoss=G.gateMega?'mega':G.gateRed?'lord':'boss';e.specCd=2.5;
   const bt=G.wave.bossPending;G.wave.bossPending=null;
   G.enemies.push(e);SFX.roar();G.cam.shake=G.gateMega?14:9;G.punch=.4;
   splash(G.gateMega?'МЕГАБОСС':G.gateRed?'ВЛАДЫКА ДВОРЦА':'ТЁМНЫЙ РЫЦАРЬ',ET[bt].n,G.gateMega||G.gateRed);
   sysNotify('БОСС',[(G.gateMega?'<b style="color:#fbbf24">Мегабосс</b>: ':G.gateRed?'<b>Владыка Дворца</b>: ':'<b>Хранитель врат</b>: ')+ET[e.type].n]);
  }else if(G.enemies.length===0&&!G.cleared){
   // ФИКС v0.7: cleared корректно сбрасывается в genFloor/genHub — врата выхода всегда откроются
   G.cleared=true;M.portal.active=true;SFX.portal();
   sysNotify('ВРАТА ЗАЧИЩЕНЫ',['Врата выхода открылись в дальней комнате.']);
   toast('Портал выхода активирован','#c4b5fd');addFury(15);
  }
 }
 /* --- враги --- */
 for(let i=G.enemies.length-1;i>=0;i--){const e=G.enemies[i];
  if(e.dead){G.enemies.splice(i,1);continue}
  e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,e.stun-dt);
  e.swingT=Math.max(0,e.swingT-dt);e.lungeT=Math.max(0,e.lungeT-dt);
  if(e.poison){e.poison.t-=dt;e.hp-=e.poison.dps*dt;e.ptick+=dt;
   if(SET.parts&&Math.random()<dt*6)addPart(e.x+rand(-.3,.3),e.y,rand(4,18),0,0,rand(1,2.5),.5,1.6,'#84cc16');
   if(e.ptick>.6){e.ptick=0;spawnText(e.x,e.y,'-'+Math.max(1,Math.round(e.poison.dps*.6)),'#a3e635')}
   if(e.hp<=0){killEnemy(e);continue}
   if(e.poison.t<=0)e.poison=null;}
  e.kx*=Math.exp(-8*dt);e.ky*=Math.exp(-8*dt);collideMove(e,e.kx*dt,e.ky*dt);
  e.cd-=dt;e.specCd-=dt;const d=dist(e.x,e.y,p.x,p.y);const b=ET[e.type];
  const stealthBlind=G.stealth>0&&d>1.7;
  if(stealthBlind&&e.aggro&&d>2.5&&!e.boss)e.aggro=false;
  if(e.aggro&&!e.boss&&!e.elite&&d>20)e.aggro=false; // leash: обычные враги отстают на дистанции
  if(!e.aggro&&d<(G.stealth>0?1.7:b.ag))e.aggro=true;
  let moved=false;
  if(e.stun<=0&&e.aggro&&!p.dead&&!stealthBlind){
   e.face=p.x>e.x?1:-1;
   if(e.spec&&e.specCd<=0){
    if(e.spec==='dash'&&d>2.2){
     e.specCd=4.5+rand(0,1.5);
     burst(e.x,e.y,12,'#38bdf8',3);
     for(let t3=0;t3<8;t3++){const a=rand(TAU),nx=p.x+Math.cos(a)*1.3,ny=p.y+Math.sin(a)*1.3;
      if(!circleBlocked(nx,ny,e.r)){e.x=nx;e.y=ny;break}}
     burst(e.x,e.y,12,'#38bdf8',3);SFX.dash();
     e.face=p.x>e.x?1:-1;e.wind=.2;e.windMax=.2;e.cd=Math.max(e.cd,1);
    }else if(e.spec==='lightning'&&d<8){
     e.specCd=5.5+rand(0,1.5);SFX.hand();
     for(let j=0;j<3;j++)G.strikes.push({x:p.x+rand(-1.4,1.4),y:p.y+rand(-.9,.9),t:-j*.25,dur:.85,dmg:e.atk*.9});
     log('combat','<b>Баран</b> обрушивает Белое Пламя с небес!');
    }else if(e.spec==='breath'&&d<5.5){
     e.specCd=5+rand(0,1.5);e.wind=.6;e.windMax=.6;e.breathA=Math.atan2(p.y-e.y,p.x-e.x);
    }else e.specCd=1.5;
   }
   // ФИКС v0.8: восстановлена базовая атака врагов (wind-up → удар/выстрел/слэм)
   if(e.cd<=0&&e.wind<=0){
    if(b.ranged){
     if(d<b.rng&&d>1.1){e.wind=e.windMax;e.cd=b.cd*rand(.85,1.2);e.castA=Math.atan2(p.y-e.y,p.x-e.x)}
    }else if(b.slam){
     if(d<2.5){e.wind=.55;e.windMax=.55;e.cd=b.cd*rand(.85,1.2);e.slamX=p.x;e.slamY=p.y}
    }else if(d<e.rng+.35){e.wind=e.windMax;e.cd=b.cd*rand(.85,1.2)}
   }
   const wantMove=b.ranged?(d<b.keep?-1:d>b.rng?1:0):(d>e.rng?1:0);
   if(wantMove!==0){const s2=e.spd*wantMove;let nx=(p.x-e.x)/(d||1)*s2,ny=(p.y-e.y)/(d||1)*s2;
    for(const o of G.enemies)if(o!==e&&!o.dead){const dd=dist(e.x,e.y,o.x,o.y);if(dd<.9&&dd>0){nx+=(e.x-o.x)/dd*1.2;ny+=(e.y-o.y)/dd*1.2}}
    if(collideMove(e,nx*dt,ny*dt)){e.walk+=dt*2;moved=true;e.stT=0}
    else{e.stT=(e.stT||0)+dt;
     if(e.stT>.7){const px2=-(p.y-e.y),py2=p.x-e.x;const pl2=Math.hypot(px2,py2)||1;
      collideMove(e,px2/pl2*e.spd*1.6*dt,py2/pl2*e.spd*1.6*dt);
      if(e.stT>1.6)e.stT=0;}}
   }
  }
  e.mv=moved||Math.abs(e.kx)+Math.abs(e.ky)>1.5;
  if(e.wind>0){e.wind-=dt;
   if(e.wind<=0){
    if(e.breathA!==undefined&&e.spec==='breath'){
     SFX.breath();
     for(let j=-3;j<=3;j++){const a=e.breathA+j*.13;
      G.projs.push({x:e.x,y:e.y,vx:Math.cos(a)*6.5,vy:Math.sin(a)*6.5,t:0,life:1.15,dmg:e.atk*.55,own:'e',kind:'fire'});}
     e.breathA=undefined;e.swingT=.3;
    }else if(e.castA!==undefined&&b.ranged){
     SFX.shoot();
     const n=b.burst?3:1;
     for(let j=0;j<n;j++){const a=e.castA+(j-(n-1)/2)*.16;
      G.projs.push({x:e.x,y:e.y,vx:Math.cos(a)*7.5,vy:Math.sin(a)*7.5,t:0,life:1.3,dmg:e.atk*.9,own:'e',kind:'ebolt'});}
     e.castA=undefined;e.swingT=.25;
    }else if(e.slamX!==undefined&&b.slam){addFx({kind:'ring',x:e.slamX,y:e.slamY,r0:.3,r1:1.8,t:0,dur:.3,c:'#ef4444'});
     burst(e.slamX,e.slamY,14,'#ef4444',3);SFX.nova();G.punch=Math.min(.5,G.punch+.15);
     if(dist(p.x,p.y,e.slamX,e.slamY)<1.8&&p.inv<=0)hurtPlayer(e.atk*1.3);
     e.slamX=undefined;e.swingT=.25;}
    else if(d<e.rng+.4){e.swingT=.2;SFX.swing();
     if(e.type==='hound'||e.type==='igirs'){const dd=d||1;e.kx+=(p.x-e.x)/dd*6;e.ky+=(p.y-e.y)/dd*6;e.lungeT=.16;}
     if(p.inv<=0)hurtPlayer(e.atk);}
   }}
 }
 for(let i=G.projs.length-1;i>=0;i--){const pr=G.projs[i];
  pr.x+=pr.vx*dt;pr.y+=pr.vy*dt;pr.t+=dt;
  if(pr.tr){pr.tr.push({x:pr.x,y:pr.y});if(pr.tr.length>7)pr.tr.shift()}
  if(SET.parts&&Math.random()<.5)addPart(pr.x,pr.y,10,rand(-.5,.5),rand(-.5,.5),rand(.5,2),.3,pr.kind==='dagger'?1.6:2.2,pr.kind==='fire'?'#fb923c':pr.kind==='dagger'?'#84cc16':pr.kind==='ebolt'?'#f87171':'#7dd3fc');
  let kill=pr.t>pr.life||blocked(pr.x|0,pr.y|0);
  if(!kill){
   if(pr.own==='p'||pr.own==='s'){for(const e of G.enemies){if(!e.dead&&dist(e.x,e.y,pr.x,pr.y)<e.r+.18){
    hitEnemy(e,pr.dmg,{kb:.2,src:pr.own==='s'?'shadow':'p',ang:Math.atan2(pr.vy,pr.vx)});
    if(pr.kind==='dagger'&&pr.own==='p'&&!e.dead)applyPoison(e,G.player.atk*.14);
    kill=true;break}}}
   else if(p.inv<=0&&dist(p.x,p.y,pr.x,pr.y)<p.r+.2){hurtPlayer(pr.dmg);kill=true}
  }
  if(kill){burst(pr.x,pr.y,5,pr.kind==='fire'?'#fb923c':'#a78bfa',2);G.projs.splice(i,1)}
 }
 updateShadows(dt,p); // ИИ армии теней — модуль shadows.js
 if(G.focus){G.focusT-=dt;if(G.focusT<=0||G.focus.dead||G.focus.hp<=0)G.focus=null}

for(let i=G.loots.length-1;i>=0;i--){const L=G.loots[i];L.t+=dt;
  L.vx*=Math.exp(-6*dt);L.vy*=Math.exp(-6*dt);
  const d=dist(L.x,L.y,p.x,p.y);
  if(d<3.4&&L.t>.4){const pull=16*(1-d/3.4);L.vx+=(p.x-L.x)/d*pull;L.vy+=(p.y-L.y)/d*pull} // v0.9: магнит шире
  L.x+=L.vx*dt;L.y+=L.vy*dt;
  if(d<.8&&L.t>.35){pickup(L);G.loots.splice(i,1)}
 }
 for(let i=G.corpses.length-1;i>=0;i--){const c=G.corpses[i];c.t+=dt;
  if(c.arise>0){c.arise-=dt;
   if(SET.parts&&Math.random()<dt*40)addPart(c.x+rand(-.25,.25),c.y,rand(0,4),0,0,rand(4,8),.6,2,'#60a5fa');
   if(c.arise<=0){
    const s=makeShadow(c.type,G.gateDiff,c.x,c.y,G.shadows.length,c.mega?4:0);s.rise=1; // v0.9: мегабосс → Легенда
    if(activeShadows().length>=armyMax()){s.bench=true;
     toast('Строй полон — '+shName(s)+' отправлен в хранилище','#93c5fd');
     G.shadows.push(s);
    }else{G.shadows.push(s);toast('Тень призвана: '+shName(s),'#93c5fd')}
    G.counters.summons++;G.army.cnt++;addFury(10);
    ensureDaily();G.daily.summons++;checkDaily();checkArmy();
    burst(c.x,c.y,20,'#7dd3fc',3);
    log('system',`Тень Призвана: <b>${shName(s)}</b> · Власть ${G.army.cnt}/${armyNeed(G.army.lvl)}`);
    if(c.rank==='boss'){splash('АРИЗ!','ВЛАДЫКА ПРИСЯГНУЛ ВАМ');sysNotify('АРИЗ',['Тень владыки пополнит армию: <b>'+shName(s)+'</b>'])}
    if(c.mega){splash('ЛЕГЕНДА ПРИСЯГНУЛА','РАНГ 5 · ВЛАДЫКА ТЕНЕЙ');sysNotify('ЛЕГЕНДА',['<b style="color:#f0abfc">'+shName(s)+'</b> — легендарная тень в вашем войске!'])}
    checkQuests();renderShadows();
    G.corpses.splice(i,1);}
   continue;}
  if(c.burn>0){c.burn-=dt;
   if(SET.parts&&Math.random()<dt*24)addPart(c.x+rand(-.2,.2),c.y,rand(0,3),0,0,rand(2,5),.5,1.6,'#38bdf8');
   if(c.burn<=0)G.corpses.splice(i,1);
   continue;}
  if(c.t>11)G.corpses.splice(i,1);
 }
 for(let i=G.fx.length-1;i>=0;i--){const f=G.fx[i];f.t+=dt;if(f.t>f.dur)G.fx.splice(i,1)}
 for(let i=G.parts.length-1;i>=0;i--){const q=G.parts[i];q.t+=dt;
  q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vz-=9*dt;if(q.z<0){q.z=0;q.vz*=-.4;q.vx*=.6;q.vy*=.6}
  if(q.t>q.life)G.parts.splice(i,1)}
 for(let i=G.texts.length-1;i>=0;i--){const t=G.texts[i];t.t+=dt;if(t.t>1)G.texts.splice(i,1)}
 for(let i=G.ghosts.length-1;i>=0;i--){const g2=G.ghosts[i];g2.t+=dt;if(g2.t>.35)G.ghosts.splice(i,1)}
 for(let i=G.decals.length-1;i>=0;i--){G.decals[i].t+=dt;if(G.decals[i].t>25)G.decals.splice(i,1)}
 G.cam.x=lerp(G.cam.x,p.x,1-Math.exp(-6*dt));G.cam.y=lerp(G.cam.y,p.y,1-Math.exp(-6*dt));
 G.cam.shake=Math.max(0,G.cam.shake-dt*22);
 G.hurtT=Math.max(0,G.hurtT-dt*1.5);
 G.interact=null;
 if(G.mode==='hub'){
  if(G.hubGate&&dist(p.x,p.y,G.hubGate.x,G.hubGate.y)<1.9)G.interact='gate';
 }else{
  if(M.portal&&M.portal.active&&dist(p.x,p.y,M.portal.x,M.portal.y)<1.8)G.interact='portal';
  else if(M.chest&&!M.chest.opened&&dist(p.x,p.y,M.chest.x,M.chest.y)<1.5)G.interact='chest';
 }
 if(SET.parts){
  for(const t of M.torches){if(Math.abs(t.x-G.cam.x)>17||Math.abs(t.y-G.cam.y)>13)continue;
   if(Math.random()<dt*2.2)addPart(t.x+rand(-.12,.12),t.y-.15,30,rand(-.18,.18),rand(-.12,.12),rand(1.5,3.2),rand(.5,.9),1.5,t.type==='wall'?'#fdba74':'#7dd3fc');}
  if(M.portal&&M.portal.active&&dist(p.x,p.y,M.portal.x,M.portal.y)<16&&Math.random()<dt*14){
   const a=rand(TAU);addPart(M.portal.x+Math.cos(a)*1.4,M.portal.y+Math.sin(a)*.7,26,-Math.cos(a)*1.6,-Math.sin(a)*.8,rand(0,1),.9,2,'#a855f7');}
  if(G.hubGate&&dist(p.x,p.y,G.hubGate.x,G.hubGate.y)<16&&Math.random()<dt*10){
   const a=rand(TAU);addPart(G.hubGate.x+Math.cos(a)*1.3,G.hubGate.y+Math.sin(a)*.65,22,0,0,rand(1,3),.8,2,G.hubGate.red?'#ef4444':RANKC[RANKS[G.hubGate.rank]]);}
 }
 if(!G.motes.length)for(let i=0;i<32;i++)G.motes.push({x:p.x+rand(-18,18),y:p.y+rand(-12,12),ph:rand(TAU),z:rand(8,44)});
 for(const m of G.motes){m.x+=Math.sin(G.time*.4+m.ph)*.5*dt;m.y+=(Math.cos(G.time*.3+m.ph)*.35-.1)*dt;
  if(Math.abs(m.x-G.cam.x)>22||Math.abs(m.y-G.cam.y)>15){m.x=G.cam.x+rand(-18,18);m.y=G.cam.y+rand(-12,12)}}
 for(const f2 of G.fogs){f2.x+=Math.sin(G.time*.1+f2.ph)*.3*dt;f2.y+=Math.cos(G.time*.13+f2.ph)*.2*dt;
  if(dist(f2.x,f2.y,G.cam.x,G.cam.y)>20){f2.x=G.cam.x+rand(-14,14);f2.y=G.cam.y+rand(-9,9)}}
 G.saveT+=dt;if(G.saveT>9){G.saveT=0;saveGame()}
}
function hurtPlayer(dmg){
 const p=G.player;if(p.dead||p.inv>0)return;
 dmg=Math.round(dmg*rand(.9,1.1));p.hp-=dmg;G.noCombat=0;G.hurtT=1;addFury(6);G.punch=Math.min(.5,G.punch+.12);
 G.stealth=0;
 spawnText(p.x,p.y,'-'+dmg,'#f87171',false);SFX.hurt();
 if(SET.shake)G.cam.shake=Math.max(G.cam.shake,4);
 burst(p.x,p.y,8,'#ef4444',2.5);
 if(p.hp<=0){p.hp=0;p.dead=true;G.ultiT=0;G.whirl=null;SFX.die();
  $('deathSub').textContent=`ЗАЧИЩЕНО ВРАТ: ${G.counters.gates} · УБИТО: ${G.counters.kills}`;
  $('deathOv').style.display='flex';saveGame();}
}
function pickup(L){
 const p=G.player;
 if(L.kind==='gold'){p.gold+=L.val;SFX.coin();spawnText(p.x,p.y,'+'+L.val+' золота','#fcd34d')}
 else if(L.kind==='gem'){p.crystals+=L.val;SFX.coin();spawnText(p.x,p.y,'+'+L.val+' кристаллов','#c4b5fd');log('loot','Получено: <b>Кристаллы ×'+L.val+'</b>')}
 else if(L.kind==='potionHP'||L.kind==='potionMP'){addItem(makeItem(L.kind,G.gateDiff));SFX.potion();log('loot','Получено: <b>'+(L.kind==='potionHP'?'Зелье лечения':'Зелье маны')+'</b>')}
 else if(L.kind==='item'){if(addItem(L.val)){SFX.chest();log('loot','Найдено: <b style="color:'+RC(L.val.rar)+'">'+L.val.name+'</b> ('+RARS[clamp(L.val.rar|0,0,3)].n+')')}}
 else if(L.kind==='relic'){if(addItem(L.val)){SFX.lvl();log('loot','<b style="color:#fbbf24">РЕЛИКВИЯ: '+L.val.name+'</b>');toast('Реликвия: '+L.val.name,'#fbbf24');splash('РЕЛИКВИЯ',L.val.name)}}
 else if(L.kind==='crystalQ'){addItem(makeItem('crystalQ'));SFX.lvl();G.counters.crystals++;
  log('story','<b>Древний кристалл</b> у вас в руках. Тьма шепчет…');checkQuests();toast('Древний кристалл получен!','#6ee7b7')}
 else{addItem(makeItem(L.kind,G.gateDiff));log('loot','Получено: <b>'+({mat1:'Древний осколок',mat2:'Кристалл тьмы',mat3:'Прах теней'}[L.kind]||'Материал')+'</b>')}
 invDirty();
}
function usePotion(kind){
 const p=G.player;
 if(!p||p.dead)return;
 const it=inv.find(i=>i.name===(kind==='potionHP'?'Зелье лечения':'Зелье маны'));
 if(!it){toast('Нет зелья');return}
 if(kind==='potionHP'){p.hp=Math.min(p.maxhp,p.hp+p.maxhp*.45);addFx({kind:'ring',x:p.x,y:p.y,r0:.3,r1:1.4,t:0,dur:.5,c:'#4ade80'})}
 else{p.mp=Math.min(p.maxmp,p.mp+p.maxmp*.55);addFx({kind:'ring',x:p.x,y:p.y,r0:.3,r1:1.4,t:0,dur:.5,c:'#38bdf8'})}
 SFX.potion();it.qty--;if(it.qty<=0)inv.splice(inv.indexOf(it),1);invDirty();
}
function doInteract(){
 if(G.interact==='gate'){
  enterHubGate();
 }else if(G.interact==='portal'){
  if(!M.portal||!M.portal.active){toast('Сначала зачистите подземелье');return}
  returnHub();
 }else if(G.interact==='chest'){
  M.chest.opened=true;SFX.chest();
  log('loot','<b>Найден сундук!</b>');
  const g=irand(40,80)+G.gateDiff*10;dropLoot('gold',M.chest.x,M.chest.y,g);
  dropLoot('gem',M.chest.x,M.chest.y,irand(3,6));
  dropLoot('item',M.chest.x,M.chest.y,makeItem(['weapon','armor','ring'][irand(0,2)],G.gateDiff,Math.max(1,weightedRar(G.gateDiff))));
  burst(M.chest.x,M.chest.y,26,'#fbbf24',4);
 }
}
function placePlayer(){
 const r=M.rooms[0];const p=G.player;p.x=r.cx;p.y=r.cy;p.vx=p.vy=0;
 G.cam.x=p.x;G.cam.y=p.y;
}
