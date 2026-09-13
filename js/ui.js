'use strict';
/* ═══ UI: отрисовка сцены, HUD, панели, настройки, журнал ═══ */
/* ОКНА СИСТЕМЫ */
const sysQ=[];let sysT=null;
function sysNotify(title,lines,dur){sysQ.push({title,lines,dur:dur||3.4});pumpSys()}
function pumpSys(){
 if(sysT||!sysQ.length)return;
 const n=sysQ.shift();
 const box=document.createElement('div');box.className='sysWin';
 box.innerHTML=`<div class="sysT">[${n.title}]</div>`+n.lines.map(l=>`<div class="sysL">${l}</div>`).join('');
 $('sysQ').appendChild(box);SFX.sys();
 sysT=setTimeout(()=>{box.classList.add('out');sysT=setTimeout(()=>{box.remove();sysT=null;pumpSys()},360)},n.dur*1000);
}
/* ЖУРНАЛ */
let logFilter='all';
function log(cat,html){
 const list=$('logList');const p=document.createElement('p');p.className=cat;p.innerHTML=html;
 list.appendChild(p);while(list.children.length>60)list.removeChild(list.firstChild);
 list.scrollTop=list.scrollHeight;
 [...list.children].forEach(el=>{el.style.display=(logFilter==='all'||el.className===logFilter)?'':'none'});
}
document.querySelectorAll('#logTabs button').forEach(b=>b.onclick=()=>{
 logFilter=b.dataset.f;
 document.querySelectorAll('#logTabs button').forEach(x=>x.classList.toggle('on',x===b));
 const list=$('logList');[...list.children].forEach(el=>{el.style.display=(logFilter==='all'||el.className===logFilter)?'':'none'});
 SFX.ui();
});
/* — кнопки навыков/призыва (нужны SK из data.js) — */
for(const k of['q','e','r','f','u']){
 const el=$('sk-'+k);el.insertAdjacentHTML('afterbegin',ic(SK[k].icon));
 el.addEventListener('pointerdown',e=>{e.preventDefault();castSkill(k)});
}
$('ariseBtn').addEventListener('pointerdown',e=>{e.preventDefault();castSkill('x')});
$('swapBtn').addEventListener('pointerdown',e=>{e.preventDefault();castSkill('c')});
$('armyBadge').onclick=()=>openModal('shadowsModal');
const stanceChipEl=$('stanceChip');
stanceChipEl.onclick=()=>cycleStance(); // v0.9: стойки армии
let __stanceShown='';
function updateStanceChip(){
 const st=G.stance||'assault';
 if(st===__stanceShown)return;__stanceShown=st;
 stanceChipEl.innerHTML=STANCES[st].n+'<small>V — приказ · '+STANCES[st].n.toLowerCase()+'</small>';
}
$('interactBtn').addEventListener('pointerdown',e=>{e.preventDefault();doInteract()});
/* ПАНЕЛИ UI */
function anyModal(){return document.querySelector('.modal.open')||$('invPanel').classList.contains('open')}
function openModal(id){closeAll();$(id).classList.add('open');G.paused=true;SFX.ui();
 if(id==='statusModal')renderStatus();if(id==='skillsModal')renderSkills();if(id==='shadowsModal')renderShadows();
 if(id==='shopModal')renderShop();
 if(id==='mapModal')drawBigMap();if(id==='setModal')syncSettings();}
function toggleDrawer(id){
 // ФИКС v0.7: раньше вызывался с 'inv', а элемент — 'invPanel' → кнопка падала с ошибкой
 const el=$(id==='inv'?'invPanel':id);if(!el)return;
 const was=el.classList.contains('open');closeAll();
 if(!was){el.classList.add('open');G.paused=true;if(el.id==='invPanel')renderInv(true)}
 SFX.ui();
}
function closeAll(){document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));$('invPanel').classList.remove('open');$('questPanel').classList.remove('open');G.paused=!G.started}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{closeAll();SFX.ui()});
$('btnStat').onclick=()=>openModal('statusModal');
$('btnInv').onclick=()=>toggleDrawer('invPanel');
$('btnSkills').onclick=()=>openModal('skillsModal');
$('btnShadows').onclick=()=>openModal('shadowsModal');
$('btnShop').onclick=()=>openModal('shopModal');
$('btnMap').onclick=()=>openModal('mapModal');
$('btnSet').onclick=()=>openModal('setModal');
$('btnQuests').onclick=()=>{$('questPanel').classList.toggle('open');SFX.ui()};
let invTab='all',selItem=null,invNeeds=true;
function invDirty(){invNeeds=true}
document.querySelectorAll('#invTabs button').forEach(b=>b.onclick=()=>{invTab=b.dataset.t;
 document.querySelectorAll('#invTabs button').forEach(x=>x.classList.toggle('on',x===b));renderInv(true);SFX.ui()});
function slotHTML(it,i){
 const col=it?RC(it.rar):'rgba(255,255,255,.1)';
 const icn=it?ic(it.icon):'';
 const q=it&&it.qty>1?`<span class="q">${it.qty}</span>`:'';
 return `<div class="slot${selItem===it&&it?' sel':''}" data-i="${i}" style="border-color:${col};box-shadow:inset 0 0 10px ${col}22">${icn}${q}</div>`;
}
function renderInv(force){
 try{
  if(!force&&!invNeeds)return;invNeeds=false;
  const items=inv.filter(i=>invTab==='all'||(invTab==='equip'?i.slot:(invTab==='use'?(i.cat+'').startsWith('potion'):i.cat.startsWith('mat')||i.quest)));
  let html='';
  for(const it of items)html+=slotHTML(it,inv.indexOf(it));
  for(let i=items.length;i<40;i++)html+='<div class="slot"></div>';
  $('invGrid').innerHTML=html;
  $('invCount').textContent=inv.length+' / 60';
  $('eqRow').innerHTML=['weapon','armor','ring','relic'].map(s=>{
   const it=equipped[s];
   return `<div><div class="slot" data-eq="${s}" style="${it?'border-color:'+RC(it.rar):''}">${it?ic(it.icon):''}</div><div class="lbl">${{weapon:'Оружие',armor:'Броня',ring:'Кольцо',relic:'Реликвия'}[s]}</div></div>`}).join('');
  renderDetail();
  $('invGrid').querySelectorAll('[data-i]').forEach(el=>el.onclick=()=>{
   const it=inv[+el.dataset.i]||null;selItem=(it&&selItem===it)?null:it;renderInv(true);SFX.ui()});
  $('eqRow').querySelectorAll('[data-eq]').forEach(el=>el.onclick=()=>{
   const s=el.dataset.eq;if(!equipped[s])return;
   if(inv.length>=60){toast('Инвентарь полон');return}
   inv.push(equipped[s]);equipped[s]=null;calcStats();renderInv(true);SFX.ui()});
 }catch(e){showErr('Сумка: '+e.message)}
}
function renderDetail(){
 const d=$('invDetail');
 if(!selItem||!inv.includes(selItem)){d.innerHTML='<p style="color:var(--dim)">Выберите предмет…</p>';return}
 const col=RC(selItem.rar);
 let acts='';
 if((selItem.cat+'').startsWith('potion'))acts+='<button data-a="use">Выпить</button>';
 if(selItem.slot)acts+='<button data-a="eq">Экипировать</button>';
 if(!selItem.quest)acts+=`<button data-a="sell">Продать (${sellValue(selItem)} з.)</button>`;
 d.innerHTML=`<h4 style="color:${col}">${selItem.name}${selItem.qty>1?' ×'+selItem.qty:''}</h4><p>${selItem.desc||''}</p><div class="acts">${acts}</div>`;
 d.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{
  if(!selItem||!inv.includes(selItem))return;
  const a=b.dataset.a;
  if(a==='use')usePotion(selItem.cat);
  if(a==='eq'){const s=selItem.slot;const old=equipped[s];equipped[s]=selItem;inv.splice(inv.indexOf(selItem),1);if(old)inv.push(old);
   calcStats();log('system','Экипировано: <b>'+selItem.name+'</b>');}
  if(a==='sell'){const v=sellValue(selItem)*(selItem.qty||1);G.player.gold+=v;inv.splice(inv.indexOf(selItem),1);
   log('loot','Продано: '+selItem.name+' (+'+v+' золота)');SFX.coin();}
  selItem=null;calcStats();renderInv(true);saveGame();
 });
}
function renderSkills(){
 const p=G.player;
 let html='';
 for(const k of['q','e','r']){const s=SK[k],lv=p.skillLv[k],cost=Math.round(120*Math.pow(lv,1.6));
  html+=`<div class="srow">${ic(s.icon)}<div><b>${s.name} <span class="lv">Ур. ${lv}</span></b><small>${s.desc} · КД ${s.cd}с · Мана ${s.mp}</small></div><button class="up" data-k="${k}" ${p.gold<cost?'disabled':''}>Улучшить · ${cost} з.</button></div>`;}
 for(const k of['f','u','x','c']){const s=SK[k];
  html+=`<div class="srow">${ic(s.icon)}<div><b>${s.name}</b><small>${s.desc}${s.cd?` · КД ${s.cd}с`:''}${s.mp?` · Мана ${s.mp}`:''}</small></div></div>`;}
 $('skillsList').innerHTML=html;
 $('skillsList').querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.k,p2=G.player,cost=Math.round(120*Math.pow(p2.skillLv[k],1.6));
  if(p2.gold<cost){toast('Недостаточно золота');return}
  p2.gold-=cost;p2.skillLv[k]++;SFX.lvl();log('system',`Навык <b>${SK[k].name}</b> улучшен до Ур. ${p2.skillLv[k]}`);renderSkills();saveGame()});
}
function renderStatus(){
 const p=G.player,r=rankOf(p.level);
 ensureDaily();const d=G.daily;
 const statRow=k=>{const s=STATS[k];
  return `<div class="strow"><span class="stn">${s.n}</span><span class="stv">${p.stats[k]}</span><small>${s.d}</small>
  <button class="up" data-st="${k}" ${p.pts<=0?'disabled':''}>+</button></div>`};
 const drow=(k,label)=>`<div class="dqr"><span>${label}</span><b style="color:${d[k]>=DQT[k]?'#4ade80':'#8ec9ff'}">${Math.min(d[k],DQT[k])}/${DQT[k]}${d[k]>=DQT[k]?' ✓':''}</b></div>`;
 const unl=clamp(1+Math.floor(G.counters.gates/3),1,6);
 $('statusBody').innerHTML=`
  <div class="statHead">
    <div class="rankBig" style="color:${RANKC[r]};border-color:${RANKC[r]}">${r}</div>
    <div><b>${p.name||'ОХОТНИК'}</b><small>Уровень ${p.level} · Охотник ранга ${r}</small>
    <small>HP ${Math.ceil(p.hp)}/${p.maxhp} · MP ${Math.ceil(p.mp)}/${p.maxmp} · Атака ${p.atk} · Крит ${p.crit}%</small></div>
  </div>
  <div class="setrow"><span><b style="color:#8ec9ff">Очки способностей: ${p.pts}</b></span><span style="font-size:10px;color:var(--dim)">+5 за уровень</span></div>
  ${['str','agi','vit','int','per'].map(statRow).join('')}
  <div class="dqt">ДОСТУПНЫЕ РАНГИ ВРАТ</div>
  <div style="display:flex;gap:6px;padding:4px 0 8px">${RANKS.map((rk,i)=>`<span style="width:30px;height:30px;border:1.5px solid ${i<unl?RANKC[rk]:'rgba(255,255,255,.12)'};color:${i<unl?RANKC[rk]:'rgba(255,255,255,.2)'};border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px">${rk}</span>`).join('')}</div>
  <small style="display:block;color:var(--dim);font-size:10px;margin-bottom:6px">Новый ранг открывается за каждые 3 зачистки (сейчас: ${G.counters.gates})</small>
  <div class="dqt">ЕЖЕДНЕВНЫЙ КВЕСТ СИСТЕМЫ ${d.done?'· ВЫПОЛНЕН ✓':''}</div>
  ${drow('kills','Уничтожить врагов')}${drow('summons','Призвать теней (АРИЗ)')}${drow('elites','Победить элиту или босса')}${drow('gates','Зачистить врата')}
  ${d.done?'':'<small style="display:block;margin-top:6px;color:var(--dim);font-size:10px">Награда: +2 очка способностей, +20 кристаллов</small>'}`;
 $('statusBody').querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.st;if(p.pts<=0)return;p.pts--;p.stats[k]++;calcStats();SFX.lvl();
  log('system',`${STATS[k].n} повышена до ${p.stats[k]}`);renderStatus();saveGame()});
}
function renderShadows(){
 const p=G.player,act=activeShadows();
 const need=armyNeed(G.army.lvl);
 $('shadowsBody').innerHTML=`
  <div class="setrow" style="border:none;padding-top:0"><span>Власть Теней: <b style="color:#7dd3fc">Ур. ${G.army.lvl}</b> · Слоты: <b style="color:#7dd3fc">${act.length}/${armyMax()}</b> · В запасе: ${G.shadows.length-act.length}</span></div>
  <div class="setrow" style="border:none;gap:6px;flex-wrap:wrap"><span style="font-size:11px;color:var(--dim);width:100%">Приказ армии <b style="color:#fbbf24">(V)</b> · цель — последний удар игрока · отзыв <b style="color:#fbbf24">(T)</b></span>
  ${Object.entries(STANCES).map(([k,v])=>`<button class="up sm" data-st="${k}" style="${G.stance===k?'border-color:#fbbf24;color:#fbbf24':''}">${G.stance===k?'▶ ':''}${v.n}</button>`).join('')}
  <button class="up sm" data-rc>Отозвать всех</button></div>
  <div class="setrow" style="border:none"><span style="font-size:11px;color:var(--dim)">Призывов до роста Власти: <b style="color:#c4b5fd">${G.army.cnt} / ${need}</b> · +1 слот и +5% силе теней за уровень</span></div>
  ${G.shadows.length?G.shadows.map((s,i)=>`<div class="shRow${s.bench?' bench':''}${G.selected===i?' sel':''}" data-i="${i}">
   <canvas class="mini" width="80" height="80" data-mini="${i}" style="border-color:${GDCOL[s.grade]}"></canvas>
   <div style="flex:1;min-width:0"><b style="font-size:12.5px;color:${s.grade?GDCOL[s.grade]:'#ddd6fe'}">${shName(s)}</b>
   <small style="display:block;color:var(--dim);font-size:10.5px">Ур. ${s.lvl} · HP ${Math.round(s.hp)}/${Math.round(s.maxhp)} · Атк ${Math.round(s.atk)} · ${s.bench?'хранилище':'в строю'}</small></div>
   <div class="shBtns">
    <button class="up sm" data-bs="${i}">${s.bench?'В строй':'В запас'}</button>
    <button class="up sm" data-rl="${i}">Отпустить</button>
   </div>
  </div>`).join('')
  :'<p style="color:var(--dim);font-size:12px;padding:10px 0">Убивайте врагов в вратах и нажимайте <b style="color:#93c5fd">АРИЗ! (X)</b> у тел — так вербуются тени и растёт Власть Теней.</p>'}`;
 $('shadowsBody').querySelectorAll('[data-i]').forEach(el=>el.onclick=()=>{G.selected=+el.dataset.i;renderShadows();updateComp(true)});
 $('shadowsBody').querySelectorAll('[data-bs]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleBench(+b.dataset.bs,!G.shadows[+b.dataset.bs].bench)});
 $('shadowsBody').querySelectorAll('[data-rl]').forEach(b=>b.onclick=e=>{
  e.stopPropagation();
  const i=+b.dataset.rl;
  if(b.dataset.armed){releaseShadow(i);return}
  b.dataset.armed='1';b.textContent='Точно?';setTimeout(()=>{if(b.isConnected){b.dataset.armed='';b.textContent='Отпустить'}},2000);
 });
 $('shadowsBody').querySelectorAll('[data-mini]').forEach(c2=>{const s=G.shadows[+c2.dataset.mini];if(s)drawMini(c2.getContext('2d'),s.type,80,s.grade)});
 $('shadowsBody').querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>setStance(b.dataset.st));
 $('shadowsBody').querySelectorAll('[data-rc]').forEach(b=>b.onclick=()=>recallShadows());
}
const SHOP=[
 {id:'hp',n:'Зелье лечения ×1',cost:15,icon:'flask'},
 {id:'mp',n:'Зелье маны ×1',cost:12,icon:'flask'},
 {id:'arise',n:'Шанс АРИЗ +3% (макс. +20%)',cost:25,icon:'skull'},
 {id:'relic',n:'Случайная реликвия',cost:60,icon:'gem'}
];
function renderShop(){
 const p=G.player;
 $('shopBody').innerHTML=`<div class="setrow" style="border:none;padding-top:0"><span>Кристаллы: <b style="color:#c4b5fd">${p.crystals}</b> · Эссенция: <b style="color:#7dd3fc">${p.essence}</b></span></div>
  <div class="setrow" style="border:none;font-size:11px;color:var(--dim)"><span>Слоты армии растут только от Власти Теней (призывы X) — не продаются.</span></div>`+
  SHOP.map((s,i)=>{
   let dis=s.id==='arise'&&G.riseBonus>=.2;
   return `<div class="srow">${ic(s.icon)}<div><b>${s.n}</b><small>кристаллы</small></div>
   <button class="up" data-s="${i}" ${p.crystals<s.cost||dis?'disabled':''}>${dis?'макс.':'Купить · '+s.cost}</button></div>`}).join('');
 $('shopBody').querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{
  const s=SHOP[+b.dataset.s],p2=G.player;
  if(p2.crystals<s.cost){toast('Недостаточно кристаллов');return}
  p2.crystals-=s.cost;
  if(s.id==='hp'){addItem(makeItem('potionHP',G.gateDiff));toast('Куплено: Зелье лечения')}
  if(s.id==='mp'){addItem(makeItem('potionMP',G.gateDiff));toast('Куплено: Зелье маны')}
  if(s.id==='arise'){G.riseBonus=Math.min(.2,G.riseBonus+.03);toast('Шанс АРИЗ: +'+Math.round(G.riseBonus*100)+'%','#93c5fd')}
  if(s.id==='relic'){const it=makeItem('relic',G.gateDiff);addItem(it);
   toast('Реликвия: '+it.name,'#fbbf24');splash('РЕЛИКВИЯ',it.name);}
  SFX.chest();renderShop();saveGame();
 });
}
function drawMini(c,type,S,grade=0){
 c.clearRect(0,0,S,S);const g=c.createRadialGradient(S/2,S/2,2,S/2,S/2,S/2);
 const col=type==='knight'||type==='igirs'?'#38bdf8':type==='hound'?'#60a5fa':(type==='mage'||type==='baran')?'#818cf8':type==='kamish'?'#f59e0b':type==='bel'?'#fde68a':type==='beru'?'#4ade80':'#3b82f6';
 g.addColorStop(0,(grade?GDCOL[grade]:col)+'55');g.addColorStop(1,'#0a0820');c.fillStyle=g;c.fillRect(0,0,S,S);
 c.save();c.translate(S/2,S/2);c.fillStyle=grade?GDCOL[grade]:col;
 c.beginPath();c.moveTo(0,-S*.32);c.lineTo(S*.22,0);c.lineTo(0,S*.32);c.lineTo(-S*.22,0);c.closePath();c.fill();
 c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.moveTo(0,-S*.32);c.lineTo(S*.08,-S*.1);c.lineTo(-S*.08,-S*.1);c.closePath();c.fill();
 if(grade>=3){c.strokeStyle=GDCOL[3];c.lineWidth=2;c.beginPath();c.arc(S/2,S/2,S*.4,0,TAU);c.stroke()}
 c.restore();
}
function drawMiniMap(c,cell){
 if(!M.grid)return;
 const W=c.canvas.width,H=c.canvas.height;
 c.clearRect(0,0,W,H);
 const ox=(W-M.W*cell)/2,oy=(H-M.H*cell)/2;
 c.fillStyle='rgba(255,255,255,.05)';
 for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++)if(M.grid[y*M.W+x])c.fillRect(ox+x*cell,oy+y*cell,cell-.5,cell-.5);
 const dot=(x,y,col,r)=>{c.fillStyle=col;c.beginPath();c.arc(ox+x*cell,oy+y*cell,r,0,TAU);c.fill()};
 for(const sp of M.spawns)dot(sp.x,sp.y,'rgba(150,130,255,.4)',1.6);
 if(G.mode==='hub'&&G.hubGate)dot(G.hubGate.x,G.hubGate.y,G.hubGate.red?'#ef4444':RANKC[RANKS[G.hubGate.rank]],3.4+Math.sin(G.time*6));
 if(M.portal)dot(M.portal.x,M.portal.y,M.portal.active?'#a855f7':'#4c1d95',3+Math.sin(G.time*4));
 if(M.chest)dot(M.chest.x,M.chest.y,M.chest.opened?'#57534e':'#fbbf24',2.4);
 for(const c3 of G.corpses)dot(c3.x,c3.y,'#38bdf8',2);
 for(const s of G.shadows)if(!s.bench)dot(s.x,s.y,s.grade?GDCOL[s.grade]:'#60a5fa',2);
 for(const e of G.enemies)dot(e.x,e.y,e.boss?'#f87171':e.elite?'#f59e0b':'#ef4444',e.boss?3.6:e.elite?3:2);
 if(G.player)dot(G.player.x,G.player.y,'#ffffff',3);
}
function drawBigMap(){const c=$('bigMap').getContext('2d');drawMiniMap(c,360/M.W)}
$('mmPlus').onclick=()=>{G.mmZoom=Math.min(3,G.mmZoom+1);SFX.ui()};
$('mmMinus').onclick=()=>{G.mmZoom=Math.max(1,G.mmZoom-1);SFX.ui()};
function syncSettings(){
 $('volR').value=SET.vol*100;$('volV').textContent=Math.round(SET.vol*100)+'%';
 $('chkShake').checked=SET.shake;$('chkFilter').checked=SET.filter;
 $('selPart').value=SET.parts?'1':'0';$('selJoy').value=SET.joy;
 $('nameInp2').value=G.player?G.player.name:'';
}
$('volR').oninput=e=>{SET.vol=e.target.value/100;if(AU.gain)AU.gain.gain.value=SET.muted?0:SET.vol;$('volV').textContent=e.target.value+'%'};
$('chkShake').onchange=e=>SET.shake=e.target.checked;
$('chkFilter').onchange=e=>{SET.filter=e.target.checked;cvs.classList.toggle('fx',SET.filter)};
$('selPart').onchange=e=>SET.parts=+e.target.value;
$('selJoy').onchange=e=>{SET.joy=e.target.value;applyJoySide()};
$('btnName').onclick=()=>{
 const v=($('nameInp2').value||'').trim().slice(0,16);
 if(!v||!G.player)return;
 G.player.name=v;toast('Имя изменено: '+v,'#93c5fd');SFX.ui();saveGame();
};
let resetArm=false;
$('btnReset').onclick=()=>{
 if(!resetArm){resetArm=true;$('btnReset').textContent='Точно сбросить? Нажмите ещё раз';setTimeout(()=>{resetArm=false;$('btnReset').textContent='Сбросить весь прогресс'},2500);return}
 try{['shadow_ascension_v4','shadow_ascension_v3','shadow_ascension_v2'].forEach(k=>localStorage.removeItem(k))}catch(e){};location.reload();
};
function toast(msg,col){
 const t=document.createElement('div');t.className='toast';t.innerHTML=msg;
 if(col)t.style.color=col;$('toasts').appendChild(t);setTimeout(()=>t.remove(),2600);
}
function splash(t,s,red){$('splashT').textContent=t;$('splashS').textContent=s||'';
 const el=$('splash');el.classList.toggle('red',!!red);el.classList.remove('show');void el.offsetWidth;el.classList.add('show')}
const PASSPORT_HTML=`<h4>Паспорт проекта · v${VER} «Владыки»</h4>
<b>v0.9 (текущая)</b> — МОДУЛЬНЫЙ ДВИЖОК: 9 файлов js/ (ядро/данные/мир/спрайты/сущности/тени/бой/UI/главный) без шага сборки. Золотые <b style="color:#fbbf24">мега-врата</b> (после 9 зачисток): мегабоссы <b>Беллион</b> и <b>Беру</b>, победа + АРИЗ даёт тень-<b style="color:#f0abfc">Легенду</b> (ранг 5, ×2.7 силы). Полное управление армией: стойки <b>Штурм/Оборона/Стой</b> (V), приказ-цель — последний удар игрока, отзыв всех (T). Руда в подземельях: жилы выбиваются ударами (золото/материалы/самоцветы). Лут подбирается шире, магнит сильнее. Новый портрет и человечная фигурка героя, наклон корпуса по прицелу и движению.<br>
<b>v0.8.1</b> — починен джойстик на телефоне (зона касаний не получала события), мобильная раскладка разведена по углам с учётом safe-area; у каждого ранга врат своя палитра подземелья.<br>
<b>v0.8 (текущая)</b> — ВОССТАНОВЛЕН БОЙ ВРАГОВ: у мобов снова есть замах, маги стреляют болтами, Палач бьёт слэмом по площади; leash-агро; ввод навыков блокируется при открытых окнах; миникарта вписана в холст; NaN-защита HP в старых сейвах; автосейв при сворачивании вкладки; разблокировка звука на iOS; Enter в поле имени; фавикон.<br>
<b>v0.7</b> — Мир-хаб с вратами рангов E→S и Алыми вратами.<br>
<b>v0.6</b> — Власть Теней, хранилище, имя игрока.<br>
<b>v0.7 (текущая)</b> — СТРУКТУРА МИРА: хаб «Мир» с пьедесталами; врата открываются по таймеру в случайном месте (60с), ранги E→S = сложность и награда; алые врата (A/S) с владыками; зачистка → выход → награда → новые врата elsewhere. ФИКСЫ: инвентарь (неверный id в toggleDrawer — кнопка падала с ошибкой), врата выхода не открывались (G.cleared не сбрасывался между подземельями), смена имени в Настройках.<br>
<b>v1.0 (план)</b>: порт на Godot 4 — нативные exe/apk, ассет-спрайты.<br>
<b>Сохранение:</b> shadow_ascension_v4; загрузка всегда из Мира.`;
$('passportBox').innerHTML=PASSPORT_HTML;
$('verTag').textContent='v'+VER;
console.log('%cSHADOW ASCENSION v'+VER,'color:#a855f7;font-weight:bold','\n'+PASSPORT_HTML.replace(/<[^>]+>/g,' '));
/* РЕНДЕР */
let rsT=null;
function resize(){
 dpr=Math.min(1.75,window.devicePixelRatio||1);
 cvs.width=Math.max(2,Math.ceil(innerWidth*dpr));cvs.height=Math.max(2,Math.ceil(innerHeight*dpr));
 view.scale=clamp(Math.min(innerWidth,innerHeight)/640,.7,1.5);
 dk.width=Math.max(2,Math.ceil(innerWidth/2));dk.height=Math.max(2,Math.ceil(innerHeight/2));
 if(M.grid&&G.started){clearTimeout(rsT);rsT=setTimeout(()=>prerender(G.mode==='hub'?9999:G.gateDiff),200)}
}
addEventListener('resize',resize);resize();
cvs.addEventListener('contextlost',e=>{e.preventDefault();G.ctxLost=true;showErr('Видеоконтекст потерян — восстановление…')});
cvs.addEventListener('contextrestored',()=>{G.ctxLost=false;resize();prerender(G.mode==='hub'?9999:G.gateDiff);toast('Видеоконтекст восстановлен','#4ade80')});
function humanoid(X,Y,o){
 const sc=o.scale||1,f=o.face||1,al=o.alpha??1;
 const bob=o.moving?Math.sin(o.walk*11)*1.7:Math.sin(o.walk*2)*.6;
 if(al>.3){ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(X,Y+1,11*sc,4.4*sc,0,0,TAU);ctx.fill()}
 ctx.save();ctx.globalAlpha=al;ctx.translate(X,Y);ctx.scale(f*sc,sc*(o.wind>0?.94:1));
 if(o.tilt)ctx.rotate(o.tilt); // v0.9: наклон тела к направлению атаки/движения
 const lw=o.moving?Math.sin(o.walk*11)*4.2:0;
 ctx.strokeStyle=o.leg;ctx.lineWidth=o.legW||4.6;ctx.lineCap='round';
 ln(ctx,-3.4,-12,-3.8-lw*.7,-.6);ln(ctx,3.4,-12,3.8+lw*.7,-.6);
 const T=SPR[o.tor];if(!T){ctx.restore();return}
 ctx.drawImage(T.c,-T.px,-12-bob-T.py,T.w,T.h);
 const H=SPR[o.head],hs=o.hs||1;
 if(H){ctx.save();ctx.translate(0,-12-bob-T.h+2);ctx.scale(hs,hs);ctx.drawImage(H.c,-H.px,-H.py,H.w,H.h);ctx.restore()}
 const idle=o.armIdle??.85;
 let ang;
 if(o.swing!=null)ang=lerp(-2.1,1.5,o.swing);
 else if(o.wind>0)ang=lerp(idle,-2.15,o.wind);
 else ang=idle+Math.sin(o.walk*2)*.07;
 const A=SPR[o.arm];
 if(A){ctx.save();ctx.translate(3.4,-12-bob-T.h+6);ctx.rotate(ang);ctx.drawImage(A.c,-A.px,-A.py,A.w,A.h);ctx.restore()}
 ctx.restore();
 if(o.flash>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(.75,o.flash*5);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(X,Y-20*sc,10*sc,20*sc,0,0,TAU);ctx.fill();ctx.restore()}
}
function capeDraw(X,Y,f,walk,moving,col,alpha){
 ctx.save();ctx.translate(X,Y-30);ctx.scale(f,1);
 const w1=moving?Math.sin(walk*10)*3:Math.sin(walk*2)*1;
 const w2=moving?Math.sin(walk*10-1.2)*4:Math.sin(walk*2-1)*1.4;
 ctx.beginPath();ctx.moveTo(0,-4);
 ctx.quadraticCurveTo(-10-w1,-2,-13-w2,14);
 ctx.quadraticCurveTo(-8-w2*.6,12,-6,22+w2);
 ctx.quadraticCurveTo(-3,10,1,20-w1*.5);
 ctx.quadraticCurveTo(2,6,2,-2);ctx.closePath();
 ctx.fillStyle=col;ctx.globalAlpha=alpha;ctx.fill();
 ctx.strokeStyle='rgba(139,92,246,.35)';ctx.lineWidth=1;ctx.stroke();
 ctx.restore();
}
function sigil(X,Y,r,col){
 ctx.save();ctx.translate(X,Y);ctx.rotate(G.time*.8);
 ctx.globalAlpha=.4;ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.setLineDash([7,6]);
 ctx.beginPath();ctx.ellipse(0,0,r,r*.5,0,0,TAU);ctx.stroke();ctx.setLineDash([]);
 ctx.rotate(-G.time*1.6);ctx.globalAlpha=.3;
 for(let i=0;i<3;i++){ctx.rotate(TAU/3);ctx.beginPath();ctx.moveTo(r*.55,0);ctx.lineTo(r*.85,4);ctx.lineTo(r*.85,-4);ctx.closePath();ctx.stroke()}
 ctx.restore();
}
function eBubble(X,Y){
 const b=Math.sin(G.time*4)*2;
 ctx.save();ctx.translate(X,Y+b);
 ctx.fillStyle='rgba(23,17,50,.95)';ctx.strokeStyle='#a78bfa';ctx.lineWidth=1.2;
 ctx.beginPath();ctx.arc(0,0,8.5,0,TAU);ctx.fill();ctx.stroke();
 ctx.fillStyle='#e9d5ff';ctx.font='700 9px Rubik';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillText('E',0,.5);ctx.restore();ctx.textBaseline='alphabetic';
}
function ariseBubble(X,Y){
 const b=Math.sin(G.time*5)*2;
 ctx.save();ctx.translate(X,Y-14+b);
 ctx.globalAlpha=.9;ctx.fillStyle='rgba(10,25,60,.92)';ctx.strokeStyle='#7cc4ff';ctx.lineWidth=1.2;
 ctx.beginPath();ctx.arc(0,0,9,0,TAU);ctx.fill();ctx.stroke();
 ctx.fillStyle='#bfe0ff';ctx.font='700 8px Rubik';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillText('X',0,.5);ctx.restore();ctx.textBaseline='alphabetic';
}
function drawPlayer(X,Y){
 const p=G.player,ult=G.ultiT>0;
 const pal=ult?'heroU':'hero';
 ctx.save();ctx.translate(X,Y);
 ctx.globalAlpha=ult?.5:(G.stealth>0?.25:.3);ctx.strokeStyle=ult?'#d8b4fe':'#8b5cf6';ctx.lineWidth=1.3;
 ctx.setLineDash([6,5]);ctx.lineDashOffset=G.time*14;
 ctx.beginPath();ctx.ellipse(0,0,15,7.2,0,0,TAU);ctx.stroke();
 ctx.setLineDash([]);ctx.restore();
 if(ult)dGl(X,Y-24,42,'#a855f7',.35+.15*Math.sin(G.time*8));
 if(G.stealth>0){ctx.save();ctx.globalAlpha=.3+.15*Math.sin(G.time*7);ctx.strokeStyle='#93c5fd';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(X,Y,17,8,0,0,TAU);ctx.stroke();ctx.restore()}
 capeDraw(X,Y,p.face,p.walk,p.moving,ult?'#1d1145':'#0d0a22',.96*(G.stealth>0?.55:1));
 const tilt=(p.atkT>0||p.swingT>0)?.42*clamp(p.aimY,-1,1):clamp(p.aimY,-1,1)*.26+(p.moving?.13:0); // v0.9: корпус возвращает по прицелу/движению
 humanoid(X,Y,{tor:'tor_'+pal,head:'head_'+pal,arm:ult?'arm_claw':'arm_hero',leg:PALS[pal].leg,legW:4.4,hs:1.16,
  face:p.face,walk:p.walk,moving:p.moving,alpha:G.stealth>0?.4:.98,swing:p.swingT>0?1-p.swingT/.24:null,wind:0,armIdle:.8,tilt});
 if(G.whirl){ctx.save();ctx.translate(X,Y-14);
  for(let i=0;i<2;i++){ctx.rotate(G.time*10+i*Math.PI);
   ctx.strokeStyle=i?'#e9d5ff':'#a855f7';ctx.lineWidth=3.4;ctx.globalAlpha=.8;
   ctx.beginPath();ctx.arc(0,0,34,-.5,1.6);ctx.stroke();
   ctx.lineWidth=1.6;ctx.globalAlpha=.5;
   ctx.beginPath();ctx.arc(0,0,26,-.2,1.3);ctx.stroke();}
  ctx.restore();}
}
function drawGhost(g2){
 humanoid(w2sx(g2.x,g2.y),w2sy(g2.x,g2.y),{tor:'tor_hero',head:'head_hero',arm:'arm_hero',
  leg:'#120e2c',hs:1.16,face:g2.face,walk:0,moving:false,alpha:.35*(1-g2.t/.35),wind:0});
}
function houndDraw(X,Y,o){
 const bob=o.mv?Math.sin(o.walk*13)*1.3:Math.sin(o.walk*2)*.4;
 ctx.save();ctx.globalAlpha=o.alpha??1;
 ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(X,Y+1,14,4.6,0,0,TAU);ctx.fill();
 ctx.translate(X,Y);ctx.scale(o.face,1);
 if(o.windP>0)ctx.scale(1.06,.9);
 if(o.lunge>0)ctx.scale(1.12,.95);
 const P=PALS[o.key==='body_shh'?'shh':'hd'];
 ctx.strokeStyle=P.leg;ctx.lineWidth=3.2;ctx.lineCap='round';
 const ph=[0,2.1,4.2,1.1],lx=[-9,-5.5,5,8.5];
 for(let i=0;i<4;i++){const sw=o.mv?Math.sin(o.walk*13+ph[i])*3.4:0;
  ln(ctx,lx[i],-8,lx[i]+sw,-Math.abs(Math.cos(o.walk*13+ph[i]))*(o.mv?2.2:0))}
 const B=SPR[o.key];ctx.drawImage(B.c,-B.px,-2-bob-B.py,B.w,B.h);
 ctx.restore();
 if(o.flash>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(.75,o.flash*5);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(X,Y-9,13,8,0,0,TAU);ctx.fill();ctx.restore()}
}
function mageDraw(X,Y,o){
 const fl=Math.sin(G.time*2.6+o.seed*7)*2.2-3;
 ctx.save();ctx.globalAlpha=o.alpha??1;
 ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(X,Y+1,8,3.2,0,0,TAU);ctx.fill();
 ctx.restore();
 if(o.windP>0){
  ctx.save();ctx.translate(X,Y);ctx.rotate(G.time*2);ctx.globalAlpha=.3+.3*o.windP;
  ctx.strokeStyle=o.key==='bar'?'#e879f9':'#fbbf24';ctx.lineWidth=1.2;ctx.setLineDash([5,5]);
  ctx.beginPath();ctx.ellipse(0,0,13,6,0,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  dGl(X,Y-26,16,o.key==='bar'?'#e879f9':'#fb923c',.3*o.windP);lights.push({x:o.wx,y:o.wy,r:2.5,i:.4*o.windP});
 }
 drawRot('staff_'+o.key,X+o.face*6,Y-20+fl,lerp(.3,-.7,o.windP),o.face,o.alpha??1);
 drawSpr('robe_'+o.key,X,Y-2+fl,{face:o.face,alpha:o.alpha??1});
 if(o.flash>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(.75,o.flash*5);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(X,Y-22,9,16,0,0,TAU);ctx.fill();ctx.restore()}
}
const BARY={hound:30,mage:46,soldier:46,brute:56,knight:60,igirs:62,baran:64,kamish:64,bel:82,beru:74};
function drawEnemy(e,X,Y){
 const windP=e.wind>0?1-e.wind/e.windMax:0;
 const swingP=e.swingT>0?1-e.swingT/.2:null;
 const etilt=e.wind>0?-.34*windP:swingP!=null?.38*swingP:(e.mv?.1:0); // v0.9: замах назад, выпад вперёд
 if(e.poison){ctx.save();ctx.globalAlpha=.5;ctx.strokeStyle='#84cc16';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(X,Y,12,5,0,0,TAU);ctx.stroke();ctx.restore()}
 if(e.type==='hound'){
  if(e.elite)sigil(X,Y,20,'#ef4444');
  houndDraw(X,Y,{key:'body_hd',walk:e.walk,mv:e.mv,face:e.face,windP,lunge:e.lungeT,flash:e.flash});
 }else if(e.type==='mage'||e.type==='baran'){
  if(e.boss){sigil(X,Y,26,'#e879f9');dGl(X,Y-10,32,'#e879f9',.18);lights.push({x:e.x,y:e.y,r:4,i:.45})}
  const sc=e.type==='baran'?1.3:1;
  ctx.save();ctx.translate(X,Y);ctx.scale(sc,sc);ctx.translate(-X,-Y);
  mageDraw(X,Y,{key:e.type==='baran'?'bar':'mg',face:e.face,windP,flash:e.flash,seed:e.walk,wx:e.x,wy:e.y});
  ctx.restore();
 }else if(e.type==='brute'||e.type==='kamish'){
  const kam=e.type==='kamish';
  sigil(X,Y,kam?30:26,kam?'#ffb347':'#ef4444');dGl(X,Y-10,30,kam?'#ffb347':'#ef4444',.16);lights.push({x:e.x,y:e.y,r:3,i:.35});
  humanoid(X,Y,{tor:kam?'tor_kam':'tor_brt',head:kam?'head_kam':'head_brt',arm:kam?'arm_kam':'arm_brt',
   leg:kam?'#200b05':'#1c070c',legW:6.6,hs:1.04,face:e.face,walk:e.walk,moving:e.mv,
   swing:swingP,wind:windP,scale:kam?1.55:1.42,armIdle:1.05,flash:e.flash,tilt:etilt});
 }else if(e.type==='bel'||e.type==='beru'){ // v0.9: мегабоссы
  const bel=e.type==='bel',pc=bel?'#fde68a':'#4ade80';
  sigil(X,Y,34,pc);dGl(X,Y-14,46,pc,.24);lights.push({x:e.x,y:e.y,r:5.5,i:.6});
  if(bel)capeDraw(X,Y,e.face,e.walk,e.mv,'#2a1015',.92);
  humanoid(X,Y,{tor:bel?'tor_bel':'tor_ber',head:bel?'head_bel':'head_ber',arm:bel?'arm_bel':'arm_ber',
   leg:bel?'#170a10':'#0a1f14',legW:bel?7:6.4,hs:1.06,face:e.face,walk:e.walk,moving:e.mv,
   swing:swingP,wind:windP,scale:bel?1.75:1.6,armIdle:.95,flash:e.flash,tilt:etilt});
 }else{
  const kn=e.type!=='soldier';
  if(kn){sigil(X,Y,e.boss?30:24,'#38bdf8');dGl(X,Y-12,34,'#38bdf8',.2);lights.push({x:e.x,y:e.y,r:4.5,i:.5});
   capeDraw(X,Y,e.face,e.walk,e.mv,'#101827',.9)}
  humanoid(X,Y,{tor:'tor_'+(kn?'kn':'sol'),head:'head_'+(kn?'kn':'sol'),arm:'arm_'+(kn?'kn':'sol'),
   leg:kn?'#10141f':'#200a10',legW:kn?5.4:5,hs:kn?1.12:1.08,face:e.face,walk:e.walk,moving:e.mv,
   swing:swingP,wind:windP,scale:kn?1.22:1,armIdle:.95,flash:e.flash,tilt:etilt});
 }
 if(e.hp<e.maxhp||e.aggro){
  const w=e.boss?44:e.elite?34:22,y=Y-(BARY[e.type]||46);
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(X-w/2,y,w,3);
  ctx.fillStyle=e.boss?'#f87171':e.elite?'#f59e0b':'#ef4444';ctx.fillRect(X-w/2,y,w*clamp(e.hp/e.maxhp,0,1),3);
  if(e.boss||e.elite){ctx.font='700 9px Rubik';ctx.textAlign='center';
   ctx.fillStyle=e.boss?'#fecaca':'#fde68a';
   ctx.strokeStyle='rgba(0,0,0,.7)';ctx.lineWidth=2.4;
   ctx.strokeText(ET[e.type].n,X,y-5);ctx.fillText(ET[e.type].n,X,y-5)}
 }
}
function drawShadow(s,X,Y){
 let yy=Y,al=.92;
 if(s.rise>0){yy=Y+s.rise*34;al=(1-s.rise)*.92}
 dGl(X,yy-14,20,s.grade>=3?GDCOL[3]:'#3b82f6',.22);lights.push({x:s.x,y:s.y,r:2.6,i:.45});
 if(s.grade>0){ctx.save();ctx.translate(X,yy);ctx.rotate(G.time*.7);ctx.globalAlpha=.3;
  ctx.strokeStyle=GDCOL[s.grade];ctx.lineWidth=1.2;ctx.setLineDash([6,6]);
  ctx.beginPath();ctx.ellipse(0,0,15,7,0,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore()}
 const swingP=s.swingT>0?1-s.swingT/.2:null;
 if(s.grade>=3)capeDraw(X,yy,s.face,s.walk,true,s.type==='bel'?'#2a1015':s.type==='beru'?'#0a1f14':s.type==='knight'||s.type==='igirs'?'#1e3a5f':'#172554',.8*al);
 if(s.grade>=4){ctx.save();ctx.translate(X,yy);ctx.rotate(G.time*1.2);ctx.globalAlpha=.5; // v0.9: аура Легенды
  ctx.strokeStyle=GDCOL[4];ctx.lineWidth=1.6;ctx.setLineDash([3,7]);
  ctx.beginPath();ctx.ellipse(0,4,19,9,0,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  dGl(X,yy-16,30,GDCOL[4],.3+.12*Math.sin(G.time*5));}
 if(s.type==='hound'){
  houndDraw(X,Y,{key:'body_shh',walk:s.walk,mv:s.mv,face:s.face,windP:0,lunge:0,flash:s.flash,alpha:al});
 }else if(s.type==='mage'||s.type==='baran'){
  mageDraw(X,Y,{key:s.type==='baran'?'bar':'shm',face:s.face,windP:0,flash:s.flash,seed:s.walk,wx:s.x,wy:s.y,alpha:al});
 }else if(s.type==='knight'||s.type==='igirs'){
  humanoid(X,yy,{tor:'tor_kn',head:'head_kn',arm:'arm_kn',leg:'#10141f',legW:5.4,hs:1.1,face:s.face,walk:s.walk,moving:true,
   swing:swingP,wind:0,scale:1.15,armIdle:.95,alpha:al,flash:s.flash});
 }else if(s.type==='bel'||s.type==='beru'){ // v0.9: тени-легенды
  const bel=s.type==='bel';
  humanoid(X,yy,{tor:bel?'tor_bel':'tor_ber',head:bel?'head_bel':'head_ber',arm:bel?'arm_bel':'arm_ber',
   leg:bel?'#170a10':'#0a1f14',legW:bel?7:6.4,hs:1.06,face:s.face,walk:s.walk,moving:true,
   swing:swingP,wind:0,scale:bel?1.6:1.45,armIdle:.95,alpha:al,flash:s.flash});
 }else if(s.type==='kamish'){
  humanoid(X,yy,{tor:'tor_kam',head:'head_kam',arm:'arm_kam',leg:'#200b05',legW:6.4,hs:1.04,face:s.face,walk:s.walk,moving:true,
   swing:swingP,wind:0,scale:1.4,armIdle:1.05,alpha:al,flash:s.flash});
 }else{
  humanoid(X,yy,{tor:'tor_shs',head:'head_shs',arm:'arm_shs',leg:'#0a1530',legW:5,hs:1.06,face:s.face,walk:s.walk,moving:true,
   swing:swingP,wind:0,scale:1,armIdle:.95,alpha:al,flash:s.flash});
 }
 const w=22,y=yy-46-(s.type==='kamish'?18:s.type==='knight'||s.type==='igirs'?12:0);
 ctx.save();ctx.globalAlpha=al;
 ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(X-w/2,y,w,2.6);
 ctx.fillStyle=s.grade>=3?GDCOL[3]:'#38bdf8';ctx.fillRect(X-w/2,y,w*clamp(s.hp/s.maxhp,0,1),2.6);
 ctx.restore();
}
function drawHand(hz,X,Y){
 const pr=hz.t/hz.dur;
 ctx.save();ctx.translate(X,Y);
 ctx.rotate(G.time*1.2);ctx.globalAlpha=.35;ctx.strokeStyle='#a855f7';ctx.lineWidth=2;
 ctx.setLineDash([10,7]);ctx.beginPath();ctx.ellipse(0,0,96*(.5+.5*pr),48*(.5+.5*pr),0,0,TAU);ctx.stroke();
 ctx.rotate(-G.time*2.4);ctx.setLineDash([4,9]);ctx.strokeStyle='#e9d5ff';ctx.globalAlpha=.28;
 ctx.beginPath();ctx.ellipse(0,0,66,33,0,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();
 for(let i=0;i<5;i++){const a=G.time*2+i*TAU/5;const r=(1-pr)*66+16;
  ctx.save();ctx.translate(X+Math.cos(a)*r,Y-24-pr*22+Math.sin(a)*r*.42);ctx.rotate(a);
  ctx.fillStyle='#8b5cf6';pth(ctx,[0,-7,4,0,0,7,-4,0]);ctx.fill();
  ctx.fillStyle='#e9d5ff';pth(ctx,[0,-7,1.6,-2,0,-4]);ctx.fill();ctx.restore();}
 dGl(X,Y-10,34,'#a855f7',.3+.2*Math.sin(G.time*9));
 if(pr<.25){ctx.save();ctx.font='700 10px Rubik';ctx.textAlign='center';ctx.fillStyle='#e9d5ff';
  ctx.fillText('РУКА ПРАВИТЕЛЯ',X,Y-64);ctx.restore();}
}
function drawStrike(s,X,Y){
 if(s.t<0)return;
 const pr=s.t/s.dur;
 ctx.save();ctx.translate(X,Y);
 ctx.globalAlpha=.3+pr*.5;ctx.strokeStyle='#e879f9';ctx.lineWidth=1.6;
 ctx.setLineDash([4,4]);
 ctx.beginPath();ctx.ellipse(0,0,34*pr+6,17*pr+3,0,0,TAU);ctx.stroke();ctx.setLineDash([]);
 if(pr>.6)dGl(0,-6,20,'#e879f9',.4);
 ctx.restore();
}
function drawPad(X,Y){
 ctx.save();ctx.translate(X,Y);
 ctx.globalAlpha=.25+.08*Math.sin(G.time*2);ctx.strokeStyle='#7c6fd0';ctx.lineWidth=1.2;
 ctx.setLineDash([5,5]);
 ctx.beginPath();ctx.ellipse(0,0,30,14,0,0,TAU);ctx.stroke();
 ctx.beginPath();ctx.ellipse(0,0,20,9,0,0,TAU);ctx.stroke();
 ctx.setLineDash([]);ctx.restore();
}
function drawHubGate(X,Y){
 const g=G.hubGate;if(!g)return;
 const col=g.mega?'#fbbf24':g.red?'#ef4444':RANKC[RANKS[g.rank]];
 ctx.save();ctx.translate(X,Y);
 ctx.globalAlpha=.5;ctx.strokeStyle=col;ctx.lineWidth=1.6;
 ctx.setLineDash([9,6]);ctx.lineDashOffset=(g.red?-1:1)*G.time*24;
 ctx.beginPath();ctx.ellipse(0,0,36,17,0,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();
 floorHalo(g.x,g.y,1.2,col,.18+.06*Math.sin(G.time*3));
 drawSpr(g.mega?'mgate':g.red?'rgate':'arch',X,Y+2,g.mega?{sc:1.12}:{});
 ctx.save();ctx.translate(X,Y-38);
 for(let i=0;i<2;i++){ctx.save();ctx.rotate(G.time*(i%2?-1:1)*.8+i*1.7);
  ctx.strokeStyle=i?'#fff':col;ctx.globalAlpha=.7;ctx.lineWidth=2.6;
  ctx.beginPath();ctx.ellipse(0,0,14-i*4,26-i*7,0,0,TAU);ctx.stroke();ctx.restore()}
 ctx.globalAlpha=.9;ctx.fillStyle='#05030e';
 ctx.beginPath();ctx.ellipse(0,0,10,22,0,0,TAU);ctx.fill();ctx.restore();
 dGl(X,Y-38,48,col,.4+.18*Math.sin(G.time*4));
 lights.push({x:g.x,y:g.y,r:7,i:.8});
 // буква ранга + таймер жизни
 ctx.save();ctx.textAlign='center';
 ctx.font='800 20px Philosopher, Rubik';
 ctx.strokeStyle='rgba(0,0,0,.8)';ctx.lineWidth=4;
 const lbl=g.mega?'МЕГА':RANKS[g.rank];
 ctx.strokeText(lbl,X,Y-150);
 ctx.fillStyle=col;ctx.fillText(lbl,X,Y-150);
 ctx.font='700 9px Rubik';ctx.strokeStyle='rgba(0,0,0,.7)';ctx.lineWidth=3;
 const sub=g.mega?'ЗОЛОТЫЕ МЕГА-ВРАТА':g.red?'АЛЫЕ ВРАТА · ВЛАДЫКА':'ВРАТА · РАНГ '+RANKS[g.rank];
 ctx.strokeText(lbl,X,Y-166);ctx.fillStyle=g.mega?'#fde68a':g.red?'#fca5a5':'#d8ccff';ctx.fillText(lbl,X,Y-166);
 // дуга времени
 ctx.strokeStyle=col;ctx.lineWidth=2;ctx.globalAlpha=.8;
 ctx.beginPath();ctx.arc(X,Y-142,10,-Math.PI/2,-Math.PI/2+TAU*clamp(g.life/60,0,1));ctx.stroke();
 ctx.restore();
 if(G.interact==='gate')eBubble(X,Y-96);
}
function drawPortal(X,Y){
 const act=M.portal.active;
 ctx.save();ctx.translate(X,Y);ctx.globalAlpha=.45;ctx.strokeStyle='#7c3aed';ctx.lineWidth=1.4;
 ctx.setLineDash([8,6]);ctx.lineDashOffset=G.time*20;
 ctx.beginPath();ctx.ellipse(0,0,34,16,0,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();
 floorHalo(M.portal.x,M.portal.y,act?1.1:.6,'#7c3aed',act?.16:.08);
 drawSpr('arch',X,Y+2,{});
 ctx.save();ctx.translate(X,Y-40);
 const R0=act?1:.55;
 for(let i=0;i<3;i++){ctx.save();ctx.rotate(G.time*(act?.9:.25)*(i%2?-1:1)+i*2.1);
  ctx.strokeStyle=i===1?'#e9d5ff':'#a855f7';ctx.globalAlpha=act?.85:.4;ctx.lineWidth=3-i*.7;
  ctx.beginPath();ctx.ellipse(0,0,(17-i*4)*R0,(30-i*7)*R0,0,0,TAU);ctx.stroke();ctx.restore()}
 ctx.globalAlpha=.92;ctx.fillStyle='#05030e';
 ctx.beginPath();ctx.ellipse(0,0,12*R0,26*R0,0,0,TAU);ctx.fill();ctx.restore();
 for(let i=0;i<6;i++){const a=G.time*(act?1.3:.4)+i*TAU/6;
  const rx=Math.cos(a)*30,ry=Math.sin(a)*14-40;
  ctx.save();ctx.translate(X+rx,Y+ry);ctx.rotate(a);
  ctx.fillStyle=act?'#c084fc':'#4c1d95';pth(ctx,[0,-4,2.4,0,0,4,-2.4,0]);ctx.fill();ctx.restore();}
 if(act){dGl(X,Y-40,55,'#a855f7',.5+.2*Math.sin(G.time*5));lights.push({x:M.portal.x,y:M.portal.y,r:8,i:.9})}
 ctx.save();ctx.font='10px Rubik';ctx.textAlign='center';
 ctx.fillStyle=act?'#e9d5ff':'#6b6390';
 ctx.fillText(act?'ВОЙТИ · ВЕРНУТЬСЯ В МИР':'ВРАТА ВЫХОДА',X,Y-176);
 ctx.restore();
 if(G.interact==='portal')eBubble(X,Y-108);
}
function drawChest(X,Y){
 drawSpr(M.chest.opened?'chest1':'chest0',X,Y,{});
 if(!M.chest.opened){dGl(X,Y-10,24,'#fbbf24',.25+.12*Math.sin(G.time*4));lights.push({x:M.chest.x,y:M.chest.y,r:3,i:.5})}
 if(G.interact==='chest')eBubble(X,Y-34);
}
function drawTorchD(t,X,Y){
 const fl=Math.sin(G.time*13+t.seed*7)*.6+Math.sin(G.time*23+t.seed*3)*.4;
 if(t.type==='braz'){
  drawSpr('braz',X,Y,{});
  ctx.save();ctx.globalCompositeOperation='lighter';
  ctx.fillStyle='rgba(96,165,250,.85)';ctx.beginPath();ctx.ellipse(X,Y-42+fl*.6,3.2,(5.4+fl),0,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(191,219,254,.9)';ctx.beginPath();ctx.ellipse(X,Y-41.6+fl*.6,1.6,3,0,0,TAU);ctx.fill();
  ctx.restore();
  dGl(X,Y-42,28,'#3b82f6',.5+fl*.12);
  floorHalo(t.x,t.y,1,'#3b82f6',.12);
  lights.push({x:t.x,y:t.y,r:5.5,i:.85});
 }else{
  drawSpr('wtor',X,Y-6,{});
  ctx.save();ctx.globalCompositeOperation='lighter';
  ctx.fillStyle='rgba(251,146,60,.85)';ctx.beginPath();ctx.ellipse(X,Y-21+fl*.6,2.8,(4.6+fl*.8),0,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(254,215,170,.9)';ctx.beginPath();ctx.ellipse(X,Y-20.6+fl*.6,1.4,2.6,0,0,TAU);ctx.fill();
  ctx.restore();
  dGl(X,Y-21,24,'#fb923c',.45+fl*.12);
  floorHalo(t.x,t.y,.85,'#fb923c',.1);
  lights.push({x:t.x,y:t.y,r:5,i:.8});
 }
}
function drawCrystalDec(cr,X,Y){
 if(cr.mined)return; // v0.9: добытая жила исчезает
 const pl=.5+.5*Math.sin(G.time*2+cr.seed);
 const mine=cr.hp!==undefined; // v0.9: жила руды — выбивается ударами
 drawSpr('cry'+cr.v,X,Y,{});
 if(mine){dGl(X,Y-8,24+pl*8,'#67e8f9',.34+pl*.22);
  floorHalo(cr.x,cr.y,.8,'#67e8f9',.12+pl*.06);
  for(let i=0;i<cr.hp;i++){ctx.fillStyle='rgba(103,232,249,.9)';pth(ctx,[X-6+i*5,Y-30,X-3.5+i*5,Y-25,X-6+i*5,Y-20,X-8.5+i*5,Y-25]);ctx.fill()}
 }else{dGl(X,Y-8,20+pl*6,cr.v===1?'#38bdf8':'#a855f7',.3+pl*.2);
  floorHalo(cr.x,cr.y,.7,cr.v===1?'#38bdf8':'#a855f7',.09+pl*.05)}
 lights.push({x:cr.x,y:cr.y,r:3.5,i:.45});
}
function drawLoot(L,X,Y){
 ctx.save();ctx.translate(X,Y);const bob=Math.sin(G.time*4+L.x*7)*2;
 ctx.translate(0,-4+bob);
 if(L.kind==='gold'){ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.ellipse(0,0,3.4*Math.abs(Math.sin(G.time*3+L.y*5))+1,3.4,0,0,TAU);ctx.fill()}
 else if(L.kind==='gem'){ctx.fillStyle='#818cf8';pth(ctx,[0,-4,3,0,0,4,-3,0]);ctx.fill();dGl(0,0,10,'#818cf8',.4)}
 else if(L.kind==='crystalQ'){ctx.fillStyle='#34d399';pth(ctx,[0,-7,5,0,0,7,-5,0]);ctx.fill();dGl(0,0,20,'#34d399',.5+.2*Math.sin(G.time*5))}
 else if(L.kind==='relic'){ctx.fillStyle='#fbbf24';ctx.save();ctx.rotate(G.time*1.5);
  pth(ctx,[0,-6,4.4,0,0,6,-4.4,0]);ctx.fill();
  ctx.fillStyle='#fffbeb';pth(ctx,[0,-6,1.8,-1.6,0,-2.6]);ctx.fill();ctx.restore();
  dGl(0,0,20,'#fbbf24',.5+.2*Math.sin(G.time*5))}
 else if(L.kind==='potionHP'){ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(0,0,3.4,0,TAU);ctx.fill();ctx.fillStyle='#cbd5e1';ctx.fillRect(-1,-6,2,3)}
 else if(L.kind==='potionMP'){ctx.fillStyle='#38bdf8';ctx.beginPath();ctx.arc(0,0,3.4,0,TAU);ctx.fill();ctx.fillStyle='#cbd5e1';ctx.fillRect(-1,-6,2,3)}
 else if(L.kind==='item'){const c2=RC(L.val.rar);ctx.fillStyle=c2;pth(ctx,[0,-5,4,0,0,5,-4,0]);ctx.fill();dGl(0,0,13,c2,.45)}
 else{ctx.fillStyle='#a78bfa';pth(ctx,[0,-4,2.6,0,0,4,-2.6,0]);ctx.fill()}
 ctx.restore();
}
function drawCorpse(c,X,Y){
 ctx.save();ctx.globalAlpha=clamp(1-c.t/11,0,1)*.75;
 ctx.translate(X,Y);
 ctx.fillStyle='#0c0a1c';ctx.beginPath();ctx.ellipse(0,-2,12,5,0,0,TAU);ctx.fill();
 ctx.strokeStyle='#3f3a4f';ctx.lineWidth=1.6;ln(ctx,-6,-3,-1,-1);ln(ctx,2,-2,8,-4);
 ctx.restore();
 if(c.rank==='elite'||c.rank==='boss'){ctx.save();ctx.globalAlpha=.6+.3*Math.sin(G.time*5);
  ctx.fillStyle='#38bdf8';ctx.beginPath();ctx.arc(X,Y-6,2.2,0,TAU);ctx.fill();ctx.restore();}
 if(!c.arise&&!c.burn&&G.player&&dist(c.x,c.y,G.player.x,G.player.y)<3.6)ariseBubble(X,Y-6);
}
function drawArcFx(f,X,Y){
 const p=f.t/f.dur;
 ctx.save();ctx.translate(X,Y-14);ctx.globalAlpha=(1-p)*.95;
 const R=f.range*30*(0.5+p*.6);
 ctx.rotate(f.dir);
 ctx.beginPath();ctx.arc(0,0,R,-f.arc/2,f.arc/2);ctx.arc(0,0,R*.45,f.arc/2,-f.arc/2,true);ctx.closePath();
 const g=ctx.createRadialGradient(0,0,R*.4,0,0,R);
 g.addColorStop(0,'rgba(168,85,247,0)');g.addColorStop(.75,f.c1);g.addColorStop(1,f.c2);
 ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=f.c2;ctx.lineWidth=1.6;ctx.globalAlpha=(1-p)*.8;ctx.stroke();
 ctx.restore();
}
function render(){
 const vw=innerWidth,vh=innerHeight;
 if(G.ctxLost){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#05040f';ctx.fillRect(0,0,vw,vh);
  ctx.fillStyle='#a78bfa';ctx.font='14px Rubik';ctx.textAlign='center';ctx.fillText('Восстановление видеоконтекста…',vw/2,vh/2);return}
 ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.fillStyle='#05040f';ctx.fillRect(0,0,vw,vh);
 lights.length=0;
 if(!M.grid||!G.player)return;
 const p=G.player,VS=zscale();
 const shx=SET.shake?rand(-1,1)*G.cam.shake:0,shy=SET.shake?rand(-1,1)*G.cam.shake:0;
 const csx=w2sx(G.cam.x,G.cam.y),csy=w2sy(G.cam.x,G.cam.y);
 const w2s=(x,y)=>[((x-y)*32+M.OX-csx)*VS+vw/2+shx,((x+y)*16+M.OY-csy)*VS+vh/2+shy];
 ctx.save();
 ctx.translate(vw/2+shx,vh/2+shy);ctx.scale(VS,VS);ctx.translate(-csx,-csy);
 if(M.cv)ctx.drawImage(M.cv,0,0,M.cv.width,M.cv.height,0,0,M.cw,M.ch);
 for(const d of G.decals){ctx.save();ctx.globalAlpha=clamp(1-d.t/25,0,1)*.3;ctx.fillStyle='#000';
  ctx.beginPath();ctx.ellipse(w2sx(d.x,d.y),w2sy(d.x,d.y),14,6,0,0,TAU);ctx.fill();ctx.restore()}
 if(G.mode==='hub')for(const sp of M.spawns)drawPad(w2sx(sp.x,sp.y),w2sy(sp.x,sp.y));
 const L=[];
 const push=(x,y,fn,zb=0)=>L.push({d:x+y+zb,fn});
 for(const t of M.torches)push(t.x,t.y,()=>drawTorchD(t,w2sx(t.x,t.y),w2sy(t.x,t.y)),.4);
 for(const c2 of M.crystals)push(c2.x,c2.y,()=>drawCrystalDec(c2,w2sx(c2.x,c2.y),w2sy(c2.x,c2.y)),.4);
 for(const pl2 of M.pillars)push(pl2.x,pl2.y,()=>drawSpr('pillar',w2sx(pl2.x,pl2.y),w2sy(pl2.x,pl2.y),{}),.4);
 if(G.mode==='hub'&&G.hubGate)push(G.hubGate.x,G.hubGate.y,()=>drawHubGate(w2sx(G.hubGate.x,G.hubGate.y),w2sy(G.hubGate.x,G.hubGate.y)),.41);
 if(M.portal)push(M.portal.x,M.portal.y,()=>drawPortal(w2sx(M.portal.x,M.portal.y),w2sy(M.portal.x,M.portal.y)),.41);
 if(M.chest)push(M.chest.x,M.chest.y,()=>drawChest(w2sx(M.chest.x,M.chest.y),w2sy(M.chest.x,M.chest.y)),.42);
 for(const hz of G.hands)push(hz.x,hz.y,()=>drawHand(hz,w2sx(hz.x,hz.y),w2sy(hz.x,hz.y)),.3);
 for(const st of G.strikes)if(st.t>=0)push(st.x,st.y,()=>drawStrike(st,w2sx(st.x,st.y),w2sy(st.x,st.y)),-.15);
 for(const c2 of G.corpses)push(c2.x,c2.y,()=>drawCorpse(c2,w2sx(c2.x,c2.y),w2sy(c2.x,c2.y)),-.1);
 for(const l of G.loots)push(l.x,l.y,()=>drawLoot(l,w2sx(l.x,l.y),w2sy(l.x,l.y)),-.2);
 for(const g2 of G.ghosts)if(g2.t>=0)push(g2.x,g2.y,()=>drawGhost(g2),-.3);
 for(const s of G.shadows)if(!s.bench)push(s.x,s.y,()=>drawShadow(s,w2sx(s.x,s.y),w2sy(s.x,s.y)));
 for(const e of G.enemies)push(e.x,e.y,()=>drawEnemy(e,w2sx(e.x,e.y),w2sy(e.x,e.y)));
 if(G.focus&&!G.focus.dead){const fx=w2sx(G.focus.x,G.focus.y),fy=w2sy(G.focus.x,G.focus.y),fa=G.time*2; // v0.9: приказ-цель армии
  ctx.save();ctx.translate(fx,fy-26);ctx.rotate(fa);
  ctx.strokeStyle='rgba(251,191,36,.9)';ctx.lineWidth=2;ctx.lineCap='round';
  for(let q=0;q<4;q++){ctx.save();ctx.rotate(q*Math.PI/2);
   ctx.beginPath();ctx.moveTo(9,-5);ctx.lineTo(13,0);ctx.lineTo(9,5);ctx.stroke();ctx.restore()}
  ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(0,0,17,0,TAU);ctx.stroke();ctx.restore();
  if(SET.parts&&Math.random()<.12)addPart(G.focus.x+rand(-.4,.4),G.focus.y+rand(-.3,.3),rand(3,9),0,0,rand(1,2),.4,1.4,'#fbbf24')}
 if(!p.dead)push(p.x,p.y,()=>{
  if(G.ultiT>0){lights.push({x:p.x,y:p.y,r:9,i:.85});
   ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5;
   ctx.fillStyle='#7c3aed';ctx.beginPath();ctx.ellipse(w2sx(p.x,p.y),w2sy(p.x,p.y)-2,26,12,0,0,TAU);ctx.fill();ctx.restore()}
  lights.push({x:p.x,y:p.y,r:7.5,i:.95});
  drawPlayer(w2sx(p.x,p.y),w2sy(p.x,p.y));
  if(p.inv>0){ctx.save();ctx.globalAlpha=.4;ctx.strokeStyle='#e9d5ff';
   ctx.beginPath();ctx.ellipse(w2sx(p.x,p.y),w2sy(p.x,p.y),18,9,0,0,TAU);ctx.stroke();ctx.restore()}
 });
 for(const pr of G.projs)push(pr.x,pr.y,()=>{const X=w2sx(pr.x,pr.y),Y=w2sy(pr.x,pr.y)-8;
  if(pr.tr&&pr.tr.length>1){
   ctx.save();ctx.lineCap='round';
   for(let i=1;i<pr.tr.length;i++){const a=i/pr.tr.length;
    ctx.strokeStyle=pr.kind==='fire'?'rgba(251,146,60,'+(a*.4)+')':pr.kind==='dagger'?'rgba(132,204,22,'+(a*.4)+')':'rgba(125,211,252,'+(a*.35)+')';
    ctx.lineWidth=2.4*a;
    ctx.beginPath();ctx.moveTo(w2sx(pr.tr[i-1].x,pr.tr[i-1].y),w2sy(pr.tr[i-1].x,pr.tr[i-1].y)-8);
    ctx.lineTo(w2sx(pr.tr[i].x,pr.tr[i].y),w2sy(pr.tr[i].x,pr.tr[i].y)-8);ctx.stroke()}
   ctx.restore();}
  if(pr.kind==='fire'){dGl(X,Y,12,'#fb923c',.8);ctx.fillStyle='#fdba74';ctx.beginPath();ctx.arc(X,Y,3,0,TAU);ctx.fill();
   lights.push({x:pr.x,y:pr.y,r:2.4,i:.6})}
  else if(pr.kind==='dagger'){dGl(X,Y,9,'#84cc16',.5);
   ctx.save();ctx.translate(X,Y);ctx.rotate(Math.atan2(pr.vy,pr.vx)+Math.PI/2);
   ctx.fillStyle='#e7fbef';pth(ctx,[0,-6,2,-1,0,4,-2,-1]);ctx.fill();
   ctx.fillStyle='#4ade80';pth(ctx,[0,4,1.4,1,-1.4,1]);ctx.fill();ctx.restore();}
  else if(pr.kind==='sbolt'){dGl(X,Y,10,'#7dd3fc',.7);
   ctx.fillStyle='#bae6fd';ctx.save();ctx.translate(X,Y);ctx.rotate(Math.atan2(pr.vy,pr.vx)+Math.PI/2);
   pth(ctx,[0,-5,2.6,0,0,5,-2.6,0]);ctx.fill();ctx.restore();}
  else if(pr.kind==='ebolt'){dGl(X,Y,11,'#f87171',.7);
   ctx.save();ctx.translate(X,Y);ctx.rotate(Math.atan2(pr.vy,pr.vx)+Math.PI/2);
   ctx.fillStyle='#fecaca';pth(ctx,[0,-5,2.6,0,0,5,-2.6,0]);ctx.fill();
   ctx.fillStyle='#ef4444';pth(ctx,[0,5,1.6,1.4,-1.6,1.4]);ctx.fill();ctx.restore();}
  else{const c2='#7dd3fc';dGl(X,Y,10,c2,.7);
   ctx.fillStyle=c2;ctx.save();ctx.translate(X,Y);ctx.rotate(Math.atan2(pr.vy,pr.vx)+Math.PI/2);
   pth(ctx,[0,-5,2.6,0,0,5,-2.6,0]);ctx.fill();ctx.restore()}});
 for(const f of G.fx)push(f.x,f.y,()=>{
  const X=w2sx(f.x,f.y),Y=w2sy(f.x,f.y);
  if(f.kind==='arc')drawArcFx(f,X,Y);
  else if(f.kind==='ring'){const pr=f.t/f.dur;ctx.save();ctx.globalAlpha=(1-pr)*.9;
   ctx.strokeStyle=f.c;ctx.lineWidth=3*(1-pr)+1;ctx.beginPath();
   ctx.ellipse(X,Y,Math.max(1,(f.r0+(f.r1-f.r0)*pr)*30),Math.max(1,(f.r0+(f.r1-f.r0)*pr)*15),0,0,TAU);ctx.stroke();ctx.restore()}
  else if(f.kind==='pillar'){const pr=f.t/f.dur;ctx.save();ctx.globalCompositeOperation='lighter';
   const g=ctx.createLinearGradient(0,Y-150*(1-pr),0,Y);
   g.addColorStop(0,'rgba(251,191,36,0)');g.addColorStop(1,'rgba(251,191,36,'+(0.4*(1-pr))+')');
   ctx.fillStyle=g;ctx.fillRect(X-14*(1-pr),Y-150*(1-pr),28*(1-pr),150*(1-pr));ctx.restore()}
  else if(f.kind==='streak'){const pr=f.t/f.dur;ctx.save();ctx.globalCompositeOperation='lighter';
   ctx.strokeStyle='rgba(147,197,253,'+(0.5*(1-pr))+')';ctx.lineWidth=4*(1-pr)+1;
   ctx.beginPath();ctx.moveTo(w2sx(f.x,f.y),w2sy(f.x,f.y)-14);ctx.lineTo(w2sx(f.x2,f.y2),w2sy(f.x2,f.y2)-14);ctx.stroke();ctx.restore()}
  else if(f.kind==='tele'){const pr=f.t/f.dur;ctx.save();ctx.globalAlpha=.25+pr*.3;ctx.fillStyle='#ef4444';
   ctx.beginPath();ctx.ellipse(X,Y,f.r*30*pr,f.r*15*pr,0,0,TAU);ctx.fill();ctx.strokeStyle='#fca5a5';ctx.stroke();ctx.restore()}
  else if(f.kind==='bolt'){ctx.save();ctx.globalAlpha=1-f.t/f.dur;ctx.strokeStyle='#c084fc';ctx.lineWidth=2.4;
   const x1=w2sx(f.x1,f.y1),y1=w2sy(f.x1,f.y1)-16,x2=w2sx(f.x2,f.y2),y2=w2sy(f.x2,f.y2)-14;
   ctx.beginPath();ctx.moveTo(x1,y1);
   for(let i=1;i<4;i++)ctx.lineTo(lerp(x1,x2,i/4)+Math.sin(f.seed+i*3)*14,lerp(y1,y2,i/4)+Math.cos(f.seed*2+i*5)*14);
   ctx.lineTo(x2,y2);ctx.stroke();dGl(x2,y2,16,'#a855f7',.8);ctx.restore()}
 },.3);
 L.sort((a,b)=>a.d-b.d);for(const it of L)it.fn();
 for(const q of G.parts){const X=w2sx(q.x,q.y),Y=w2sy(q.x,q.y)-q.z;
  ctx.globalAlpha=clamp(1-q.t/q.life,0,1);ctx.fillStyle=q.col;
  ctx.beginPath();ctx.arc(X,Y,q.size,0,TAU);ctx.fill()}
 ctx.globalAlpha=1;
 ctx.restore();
 dkc.setTransform(1,0,0,1,0,0);
 dkc.globalCompositeOperation='source-over';
 dkc.clearRect(0,0,dk.width,dk.height);
 dkc.fillStyle='rgba(5,4,18,.72)';dkc.fillRect(0,0,dk.width,dk.height);
 dkc.globalCompositeOperation='destination-out';
 const w2d=(x,y)=>[(((x-y)*32+M.OX-csx)*VS+vw/2+shx)*.5,(((x+y)*16+M.OY-csy)*VS+vh/2+shy)*.5];
 for(const l of lights){const[dx,dy]=w2d(l.x,l.y);const r=Math.max(2,l.r*32*VS*.5);
  const g=dkc.createRadialGradient(dx,dy,0,dx,dy,r);
  g.addColorStop(0,'rgba(0,0,0,'+l.i+')');g.addColorStop(1,'rgba(0,0,0,0)');
  dkc.fillStyle=g;dkc.beginPath();dkc.arc(dx,dy,r,0,TAU);dkc.fill();}
 dkc.globalCompositeOperation='source-over';
 ctx.drawImage(dk,0,0,vw,vh);
 ctx.save();ctx.globalCompositeOperation='lighter';
 ctx.fillStyle=SCENE.amb;ctx.fillRect(0,0,vw,vh);
 for(const f2 of G.fogs){const[sx3,sy3]=w2s(f2.x,f2.y);
  ctx.globalAlpha=.035+.02*Math.sin(G.time*.5+f2.ph);
  ctx.drawImage(glow(SCENE.fog),sx3-f2.r*VS,sy3-f2.r*VS*.45,f2.r*2*VS,f2.r*.9*VS);}
 for(const l of G.loots){
  if(l.kind!=='item'&&l.kind!=='crystalQ'&&l.kind!=='relic')continue;
  const[sx2,sy2]=w2s(l.x,l.y);const col=l.kind==='crystalQ'?'#34d399':l.kind==='relic'?'#fbbf24':RC(l.val.rar);
  const g=ctx.createLinearGradient(0,sy2-10,0,sy2-70);
  g.addColorStop(0,col+'55');g.addColorStop(1,col+'00');
  ctx.fillStyle=g;ctx.fillRect(sx2-3,sy2-70,6,60);
 }
 for(const m of G.motes){const[sx2,sy2]=w2s(m.x,m.y);
  ctx.globalAlpha=.14+.1*Math.sin(G.time+m.ph);ctx.fillStyle='#c4b5fd';
  ctx.beginPath();ctx.arc(sx2,sy2-m.z*VS*.4,1.2,0,TAU);ctx.fill()}
 ctx.restore();ctx.globalAlpha=1;
 ctx.textAlign='center';
 for(const t of G.texts){
  const X=((w2sx(t.x,t.y)-csx)*VS+vw/2+shx),Y=((w2sy(t.x,t.y)-40-t.t*46)-csy)*VS+vh/2+shy;
  const pop=1+.9*Math.exp(-t.t*8);
  ctx.globalAlpha=clamp(1-t.t,0,1);
  ctx.font='700 '+Math.round((t.big?22:15)*pop)+'px Rubik';
  ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(t.txt,X,Y);
  ctx.fillStyle=t.col;ctx.fillText(t.txt,X,Y);
  if(t.big&&/^-\d+$/.test(t.txt)){ctx.font='800 11px Rubik';ctx.strokeText('CRIT!',X,Y-20);ctx.fillStyle='#fbbf24';ctx.fillText('CRIT!',X,Y-20)}
 }
 ctx.globalAlpha=1;
 if(G.fade>0){ctx.fillStyle='rgba(3,2,10,'+G.fade+')';ctx.fillRect(0,0,vw,vh)}
 drawMiniMap($('mm').getContext('2d'),Math.min(340,260)/(M.W*G.mmZoom));
 renderQuests();
}
/* HUD */
const cache={};
function setTxt(id,v){if(cache[id]!==v){cache[id]=v;$(id).textContent=v}}
function updateHUD(){
 const p=G.player;if(!p)return;
 $('hpFill').style.width=clamp(p.hp/p.maxhp*100,0,100)+'%';
 $('mpFill').style.width=clamp(p.mp/p.maxmp*100,0,100)+'%';
 $('xpFill').style.width=clamp(p.exp/(Math.round(80*Math.pow(p.level,1.35)+30))*100,0,100)+'%';
 setTxt('hpText',Math.ceil(p.hp)+' / '+p.maxhp);setTxt('mpText',Math.ceil(p.mp)+' / '+p.maxmp);
 setTxt('pName',p.name||'ОХОТНИК');
 setTxt('pLvl','УРОВЕНЬ '+p.level+' · РАНГ '+rankOf(p.level)+(p.pts>0?' · +'+p.pts:''));
 setTxt('goldV',fmt(p.gold));setTxt('gemV',fmt(p.crystals));setTxt('essV',fmt(p.essence));
 if(G.mode==='hub'){
  setTxt('floorLabel','МИР · ТОЧКА СБОРА');
  setTxt('gateTimer',G.hubGate?'ВРАТА АКТИВНЫ · УСПЕЙ!':'Следующие врата через '+Math.ceil(G.gateT)+'с');
  setTxt('mmTitle','Мир');setTxt('mmFloor','Врат зачищено: '+G.counters.gates);
 }else{
  setTxt('floorLabel','ВРАТА РАНГА '+RANKS[G.gateRank]+(G.gateRed?' · АЛЫЕ':''));
  const foes=G.enemies.length+G.wave.budget+(G.wave.bossPending?1:0);
  setTxt('gateTimer',M.portal&&M.portal.active?'ВЫХОД ОТКРЫТ · НАЙДИТЕ ПОРТАЛ':'ВРАГОВ ОСТАЛОСЬ: '+foes);
  setTxt('mmTitle','Врата '+RANKS[G.gateRank]);setTxt('mmFloor','Сложность '+G.gateDiff);
 }
 setTxt('armyCount',activeShadows().length+'/'+armyMax());
 for(const k of['q','e','r','f']){const el=$('sk-'+k);
  let cd=el.querySelector('.cd'),ct=el.querySelector('.cdt');
  if(!cd){cd=document.createElement('div');cd.className='cd';el.appendChild(cd);
   ct=document.createElement('div');ct.className='cdt';el.appendChild(ct)}
  const rem=p.cds[k];
  cd.style.height=(rem/SK[k].cd*100)+'%';ct.textContent=rem>0?rem.toFixed(1):'';
  if(rem<=0&&!el.classList.contains('ready')&&cache['rdy'+k]){el.classList.add('ready');setTimeout(()=>el.classList.remove('ready'),400)}
  cache['rdy'+k]=rem<=0;}
 $('uwrap').style.background=`conic-gradient(from -90deg,#a855f7 0 ${p.fury}%,rgba(255,255,255,.07) ${p.fury}% 100%)`;
 const u=$('sk-u');let uc=u.querySelector('.cdt');
 if(!uc){uc=document.createElement('div');uc.className='cdt';u.appendChild(uc)}
 uc.textContent=G.ultiT>0?G.ultiT.toFixed(1):(p.fury>=100?'ГОТОВ':'');
 const boss=G.enemies.find(e=>e.boss);
 $('bossBar').style.display=boss?'block':'none';
 if(boss){$('bossFill').style.width=clamp(boss.hp/boss.maxhp*100,0,100)+'%';setTxt('bossName',ET[boss.type].n.toUpperCase())}
 const ib=$('interactBtn');
 if(G.interact&&!p.dead){ib.style.display='block';
  ib.classList.toggle('gateR',G.interact==='gate'&&G.hubGate&&G.hubGate.red);
  ib.textContent=G.interact==='gate'?'ВОЙТИ В ВРАТА':G.interact==='portal'?'ВЕРНУТЬСЯ В МИР':'ОТКРЫТЬ СУНДУК'}
 else ib.style.display='none';
 const near=G.corpses.some(c=>!c.arise&&!c.burn&&dist(c.x,c.y,p.x,p.y)<3.4);
 const ab=$('ariseBtn');
 ab.classList.toggle('show',!!(near&&!p.dead));
 const acd=ab.querySelector('.cd');if(acd)acd.style.height=(p.cds.x/1.4*100)+'%';
 updateComp();
 $('hurt').style.opacity=Math.min(.85,G.hurtT*.8)+(p.hp<p.maxhp*.3?.2+.15*Math.sin(G.time*6):0);
 $('ultfx').style.opacity=G.ultiT>0?.4:0;
 setTxt('perf','FPS '+Math.round(G.fps)+' · v'+VER);
}
let compSel=-1;
function updateComp(force){
 const list=activeShadows();
 if(!list.length){setTxt('compName','Армия теней пуста');setTxt('compLvl','Призывайте теней: АРИЗ! (X)');$('compFill').style.width='0%';setTxt('compRar','');return}
 if(compSel<0||compSel>=list.length||force){compSel=clamp(G.selected,0,list.length-1);
  drawMini($('compCv').getContext('2d'),list[compSel].type,88,list[compSel].grade)}
 const s=list[Math.min(compSel,list.length-1)];
 setTxt('compName',shName(s));setTxt('compLvl','Ур. '+s.lvl+' · HP '+Math.round(s.hp)+'/'+Math.round(s.maxhp));
 $('compFill').style.width=clamp(s.hp/s.maxhp*100,0,100)+'%';
 setTxt('compRar',s.grade?GDN[s.grade]:'В СТРОЮ');
}
function drawPortrait(){ // v0.9: новый портрет — спокойный взгляд охотника
 const c=$('portrait').getContext('2d'),S=132;
 const g=c.createLinearGradient(0,0,S,S);g.addColorStop(0,'#1c1440');g.addColorStop(.55,'#141033');g.addColorStop(1,'#0a081c');
 c.fillStyle=g;c.fillRect(0,0,S,S);
 const rg=c.createRadialGradient(S*.5,S*.42,6,S*.5,S*.42,S*.75);
 rg.addColorStop(0,'rgba(139,92,246,.32)');rg.addColorStop(.55,'rgba(99,102,241,.10)');rg.addColorStop(1,'rgba(0,0,0,0)');
 c.fillStyle=rg;c.fillRect(0,0,S,S);
 c.save();c.translate(S/2,S*.6);
 // шея и плечи в тёмном пальто
 c.fillStyle='#d9ab7e';c.fillRect(-8,-6,16,14);
 c.beginPath();c.moveTo(-42,42);c.quadraticCurveTo(-38,8,-20,-2);c.lineTo(-8,-8);c.lineTo(8,-8);c.lineTo(20,-2);
 c.quadraticCurveTo(38,8,42,42);c.closePath();
 const cg=c.createLinearGradient(-30,-8,30,42);cg.addColorStop(0,'#221a52');cg.addColorStop(.5,'#150f38');cg.addColorStop(1,'#0b0821');
 c.fillStyle=cg;c.fill();
 c.strokeStyle='#8b5cf6';c.lineWidth=1.6;c.globalAlpha=.75;
 c.beginPath();c.moveTo(-8,-6);c.lineTo(-5,26);c.lineTo(0,30);c.lineTo(5,26);c.lineTo(8,-6);c.stroke();c.globalAlpha=1;
 // лицо
 const fg=c.createLinearGradient(-20,-40,16,10);fg.addColorStop(0,'#f3d3ac');fg.addColorStop(.6,'#e8c092');fg.addColorStop(1,'#cfa273');
 c.fillStyle=fg;
 c.beginPath();c.moveTo(-19,-14);
 c.quadraticCurveTo(-21,-32,-11,-42);c.quadraticCurveTo(0,-49,11,-42);
 c.quadraticCurveTo(21,-31,20,-16);c.quadraticCurveTo(18,-2,10,6);
 c.quadraticCurveTo(0,12,-9,6);c.quadraticCurveTo(-17,0,-19,-14);c.closePath();c.fill();
 c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=2;
 c.beginPath();c.moveTo(-19,-16);c.quadraticCurveTo(-20,-30,-11,-40);c.stroke();
 // причёска: зачёс назад
 c.beginPath();c.moveTo(-22,-18);
 c.quadraticCurveTo(-26,-42,-12,-52);c.quadraticCurveTo(0,-58,13,-51);
 c.quadraticCurveTo(25,-43,23,-20);
 c.quadraticCurveTo(19,-34,12,-39);c.quadraticCurveTo(2,-43,-8,-39);
 c.quadraticCurveTo(-17,-33,-22,-18);c.closePath();
 const hg=c.createLinearGradient(-14,-54,14,-36);hg.addColorStop(0,'#2b2452');hg.addColorStop(1,'#191338');
 c.fillStyle=hg;c.fill();
 c.strokeStyle='rgba(139,92,246,.35)';c.lineWidth=1.2;
 c.beginPath();c.moveTo(-14,-46);c.quadraticCurveTo(0,-53,14,-45);c.stroke();
 // глаза: спокойные, с фиолетовым отблеском
 for(const ex of[-9,9]){
  c.fillStyle='#f8f6ff';c.beginPath();c.ellipse(ex,-16,5.4,3.4,ex<0?.06:-.06,0,TAU);c.fill();
  c.save();c.shadowColor='#a78bfa';c.shadowBlur=6;c.fillStyle='#4c1d95';
  c.beginPath();c.ellipse(ex+(ex<0?.8:-.8),-16,2.6,2.7,0,0,TAU);c.fill();c.restore();
  c.fillStyle='#0c0a18';c.beginPath();c.ellipse(ex+(ex<0?.8:-.8),-16,1.15,1.6,0,0,TAU);c.fill();
  c.fillStyle='rgba(255,255,255,.95)';c.beginPath();c.arc(ex+(ex<0?2:-2.4),-17.4,.9,0,TAU);c.fill();
  c.strokeStyle='#14112b';c.lineWidth=2;c.lineCap='round';
  c.beginPath();c.moveTo(ex-5,-21.5);c.quadraticCurveTo(ex,-23.5,ex+5,-21);c.stroke();
 }
 // нос и рот
 c.strokeStyle='rgba(120,80,60,.4)';c.lineWidth=1.4;
 c.beginPath();c.moveTo(0,-14);c.quadraticCurveTo(1.6,-8,.6,-5.6);c.stroke();
 c.strokeStyle='rgba(90,50,50,.55)';c.lineWidth=1.8;
 c.beginPath();c.moveTo(-4.4,-.4);c.quadraticCurveTo(0,1.4,4.4,-.8);c.stroke();
 c.restore();
 // мягкие тени-виньетки по углам
 c.fillStyle='rgba(10,8,28,.55)';
 pth(c,[0,0,S*.35,0,0,S*.4]);c.fill();
 pth(c,[S,0,S,0,S*.62,S*.28]);c.fill();
 c.fillStyle='rgba(124,58,237,.16)';
 pth(c,[0,S,0,S*.74,S*.22,S]);c.fill();
 pth(c,[S,S,S,S*.74,S*.78,S]);c.fill();
}
