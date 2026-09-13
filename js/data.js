'use strict';
/* ═══ ДАННЫЕ: навыки, враги, тени, предметы, квесты, состояние игры ═══ */
/* ДАННЫЕ */
const SK={
 q:{name:'Вихрь Клинков',icon:'whirl',cd:5,mp:25,dmg:.85,desc:'Танец клинков: 3 вращающихся удара вокруг вас. Отравляет ядом Касаки.'},
 e:{name:'Метательные Кинжалы',icon:'daggers',cd:4,mp:20,dmg:.55,desc:'Веер из 5 кинжалов. Попадание отравляет цель.'},
 r:{name:'Рука Правителя',icon:'hand',cd:10,mp:40,dmg:2.4,desc:'Телекинез Монарха: стягивает врагов в точку, обездвиживает и сжимает взрывом.'},
 f:{name:'Шаг Сквозь Тень',icon:'step',cd:8,mp:15,dmg:0,desc:'Рывок и невидимость на 2.5с. Атака из тени — гарантированный крит (УБИЙСТВО).'},
 u:{name:'ПРОБУЖДЕНИЕ МОНАРХА',icon:'king',dur:8,desc:'Когда ярость полна — форма Теневого Монарха: клыки тьмы, +35% урона, вампиризм 12%.'},
 x:{name:'АРИЗ!',icon:'ghost',mp:15,desc:'Извлечение тени из павшего врага (X / кнопка у тела). Каждый призыв качает Власть Теней.'},
 c:{name:'Обмен Тенями',icon:'swap',mp:10,cd:6,desc:'Поменяйтесь местами с ближайшей тенью в строю (C).'}
};
const STATS={str:{n:'Сила',d:'+2 атаки за очко'},agi:{n:'Ловкость',d:'+0.1 к скорости за очко'},vit:{n:'Выносливость',d:'+12 HP за очко'},int:{n:'Интеллект',d:'+8 маны, +0.5 реген/с'},per:{n:'Восприятие',d:'+1% крита, +радиус цели'}};
const RANKS=['E','D','C','B','A','S'];
const rankOf=l=>l<5?'E':l<10?'D':l<15?'C':l<21?'B':l<28?'A':'S';
const RANKC={E:'#9ca3af',D:'#e2e8f0',C:'#60a5fa',B:'#a78bfa',A:'#fb923c',S:'#f87171'};
const DQT={kills:15,summons:3,elites:1,gates:1};
const ET={
 hound:{n:'Гончая Бездны',hp:58,atk:11,spd:3.4,r:.4,exp:15,ag:7.5,rng:1.05,cd:1.1,g:[2,6],rise:.65},
 soldier:{n:'Демон-Воин',hp:115,atk:15,spd:2.1,r:.48,exp:26,ag:7,rng:1.25,cd:1.5,g:[4,10],rise:.65},
 mage:{n:'Демон-Чародей',hp:78,atk:13,spd:1.8,r:.42,exp:30,ag:9,rng:6.5,keep:4.2,cd:2.6,ranged:1,g:[5,12],rise:.6},
 brute:{n:'Палач Бездны',hp:430,atk:24,spd:2.0,r:.66,exp:150,ag:9,rng:1.55,cd:2.0,slam:1,elite:1,g:[25,60],rise:.4},
 knight:{n:'Тёмный Рыцарь',hp:950,atk:30,spd:2.4,r:.7,exp:420,ag:11,rng:1.5,cd:1.4,burst:1,boss:1,g:[80,160],rise:.3},
 igirs:{n:'Игрис, Рыцарь-Командир',hp:1700,atk:36,spd:2.9,r:.7,exp:900,ag:13,rng:1.5,cd:1.2,boss:1,spec:'dash',g:[200,400],rise:0},
 baran:{n:'Баран, Монарх Белого Пламени',hp:2000,atk:34,spd:1.9,r:.7,exp:1100,ag:13,rng:6.5,keep:3.4,cd:1.7,ranged:1,burst:1,boss:1,spec:'lightning',g:[240,480],rise:0},
 kamish:{n:'Камиш, Пожиратель',hp:2600,atk:44,spd:2.2,r:.8,exp:1500,ag:13,rng:1.7,cd:1.9,slam:1,boss:1,spec:'breath',g:[300,600],rise:0},
 bel:{n:'Беллион, Гроссмейстер Теней',hp:5600,atk:54,spd:2.7,r:.85,exp:3200,ag:14,rng:1.85,cd:1.5,slam:1,boss:1,mega:1,spec:'dash',g:[520,940],rise:1},
 beru:{n:'Беру, Король Муравьёв',hp:4600,atk:47,spd:3.7,r:.75,exp:2600,ag:15,rng:1.4,cd:1.0,boss:1,mega:1,spec:'dash',g:[440,800],rise:1}
};
const SHN={soldier:'Теневой Солдат',hound:'Теневой Гончий',mage:'Теневой Маг',knight:'Теневой Рыцарь',igirs:'Игрис',baran:'Баран',kamish:'Камиш',bel:'Беллион',beru:'Беру'};
const STANCES={assault:{n:'Штурм',d:'тени атакуют всех в радиусе'},defend:{n:'Оборона',d:'тени держатся рядом и бьют близких'},hold:{n:'Стой',d:'тени стоят на месте'}};
const GDN=['Обычная','Отборная','Элитная','Маршал','Легенда'];
const GDM=[1,1.25,1.55,2,2.7];
const GDC=[0,4,9,16,28];
const GDCOL=['#64748b','#60a5fa','#a78bfa','#fbbf24','#f0abfc'];
const REL={kasaka:{n:'Клинок Касаки',desc:'Ваши удары парализуют врагов (18%, 0.7с). Не действует на владык.'},baruka:{n:'Кинжал Баруки',desc:'+12% к шансу крита, критический урон ×3.4.'},monolith:{n:'Слеза Монолита',desc:'Вне боя восстанавливает 1.5% здоровья каждые 5 секунд.'},heart:{n:'Сердце Монарха',desc:'+50% к набору ярости.'}};
const RARS=[{n:'Обычный',c:'#9ca3af'},{n:'Магический',c:'#60a5fa'},{n:'Редкий',c:'#a78bfa'},{n:'Эпический',c:'#f59e0b'}];
const RC=r=>RARS[clamp(r|0,0,3)].c;
const mh=f=>1+.22*(f-1), ma=f=>1+.14*(f-1);
const AMAX_LV=8;
const armyNeed=l=>5*l;
const armyPower=()=>1+.05*((G.army?G.army.lvl:1)-1);
const armyMax=()=>Math.min(10,2+(G.army?G.army.lvl:1));
const G={started:false,mode:'hub',gateRank:0,gateRed:false,gateDiff:1,hubGate:null,gateT:8,
 floor:1,seed:0,time:0,paused:true,punch:0,hitstop:0,stealth:0,whirl:null,hands:[],strikes:[],cine:0,fade:0,regenT:0,
 player:null,enemies:[],shadows:[],projs:[],loots:[],corpses:[],parts:[],texts:[],fx:[],ghosts:[],decals:[],motes:[],fogs:[],
 army:{lvl:1,cnt:0},
 cam:{x:5,y:5,shake:0},wave:{budget:0,t:2,eliteAt:0,eliteDone:true,bossPending:null},cleared:false,ultiT:0,ultiTick:0,
 counters:{kills:0,summons:0,elites:0,crystals:0,gates:0,army:1},quests:[],questSeq:0,riseBonus:0,
 interact:null,selected:0,noCombat:9,hurtT:0,fps:60,ping:32,mmZoom:1,saveT:0,tutArise:false,ctxLost:false,lsT:0,daily:null,
 stance:'assault',focus:null,focusT:0};
let inv=[],equipped={weapon:null,armor:null,ring:null,relic:null},uid=1;
const SET={vol:.7,shake:true,filter:true,parts:1,joy:'left',muted:false};
let view={scale:1},dpr=Math.min(1.75,window.devicePixelRatio||1);
/* ЕЖЕДНЕВНЫЙ КВЕСТ */
function ensureDaily(){const t=todayStr();if(!G.daily||G.daily.d!==t)G.daily={d:t,kills:0,summons:0,elites:0,gates:0,done:false}}
function checkDaily(){
 const d=G.daily;if(!d||d.done)return;
 if(d.kills>=DQT.kills&&d.summons>=DQT.summons&&d.elites>=DQT.elites&&d.gates>=DQT.gates){
  d.done=true;const p=G.player;p.pts=(p.pts||0)+2;p.crystals+=20;
  sysNotify('ЕЖЕДНЕВНЫЙ КВЕСТ',['Все цели выполнены!','Награда: +2 очка способностей, +20 кристаллов']);
  SFX.chest();questsDirty();saveGame();
 }
}
/* ПРЕДМЕТЫ */
const WNAMES=[['Клинок Касаки','Теневой клинок','Кинжал Баруки','Демон-Монарх: Клинки'],['Кожаный доспех','Доспех стража','Латы рыцаря','Броня Владыки Теней'],['Медное кольцо','Кольцо теней','Печать мага','Печать Монарха']];
function makeItem(kind,floor,fr){
 const rar=fr!==undefined?fr:weightedRar(floor);
 const it={uid:uid++,cat:kind,qty:1};
 if(kind==='weapon'||kind==='armor'||kind==='ring'){
  it.slot=kind;it.rar=rar;it.name=(WNAMES[{weapon:0,armor:1,ring:2}[kind]][rar])||'Реликвия древних';
  const k=1+.12*floor;
  it.st=kind==='weapon'?{atk:Math.round((9+rar*10)*k)}:kind==='armor'?{hp:Math.round((34+rar*40)*k)}:{crit:3+rar*3};
  it.icon=kind;it.desc=kind==='weapon'?`Атака +${it.st.atk}`:kind==='armor'?`Здоровье +${it.st.hp}`:`Крит. шанс +${it.st.crit}%`;
 }else if(kind==='potionHP'||kind==='potionMP'){it.icon='flask';it.stack=1;
  it.name=kind==='potionHP'?'Зелье лечения':'Зелье маны';
  it.desc=kind==='potionHP'?'Восстанавливает 45% здоровья':'Восстанавливает 55% маны';it.rar=0;
 }else if(kind==='crystalQ'){it.icon='gem';it.name='Древний кристалл';it.desc='Пульсирует древней силой.';it.rar=2;it.quest=1;
 }else if(kind==='relic'){it.slot='relic';it.rar=3;it.icon='shard';
  const keys=Object.keys(REL);const rk=keys[irand(0,keys.length-1)];
  it.rel=rk;it.name=REL[rk].n;it.desc=REL[rk].desc;
 }else{it.icon={mat1:'shard',mat2:'shard',mat3:'dust'}[kind]||'shard';it.stack=1;it.rar=0;
  it.name={mat1:'Древний осколок',mat2:'Кристалл тьмы',mat3:'Прах теней'}[kind]||'Материал';
  it.desc='Материал. Можно продать торговцу-системе.';}
 return it;
}
function weightedRar(f){const r=Math.random()-.015*f;return r<.03?3:r<.14?2:r<.42?1:0}
function addItem(it){
 if(!it)return false;
 if(it.stack){const ex=inv.find(o=>o.name===it.name);if(ex){ex.qty=(ex.qty||1)+1;invDirty();return true}}
 if(inv.length>=60){const g=sellValue(it);G.player.gold+=g;toast('Инвентарь полон — продано за '+g+' золота');return true}
 inv.push(it);invDirty();return true;
}
function sellValue(it){return (it.rar+1)*({weapon:45,armor:38,ring:32,relic:80,potionHP:12,potionMP:12,crystalQ:0}[it.cat]||8)}
function calcStats(){
 const p=G.player;const st=p.stats||{str:1,agi:1,vit:1,int:1,per:1};
 let atk=16+p.level*3+(st.str-1)*2;
 let hp=220+p.level*36+(st.vit-1)*12;
 let mp=80+p.level*7+(st.int-1)*8;
 let crit=6+(st.per-1);
 for(const s of['weapon','armor','ring']){const it=equipped[s];if(it&&it.st){atk+=it.st.atk||0;hp+=it.st.hp||0;crit+=it.st.crit||0}}
 p.relKasaka=p.relBaruka=p.relMonolith=p.relHeart=false;
 if(equipped.relic&&equipped.relic.rel){const r=equipped.relic.rel;
  if(r==='kasaka')p.relKasaka=true;if(r==='baruka'){p.relBaruka=true;crit+=12}
  if(r==='monolith')p.relMonolith=true;if(r==='heart')p.relHeart=true;}
 p.maxhp=Math.round(hp);p.maxmp=Math.round(mp);p.atk=Math.round(atk);p.crit=Math.min(70,crit);
 p.spd=5.0+st.agi*.1;
 p.mpRegen=4+p.level*.05+(st.int-1)*.5;
 p.hp=Math.min(p.hp,p.maxhp);p.mp=Math.min(p.mp,p.maxmp);
}
/* КВЕСТЫ */
const QIC={kills:'skull',summons:'ghost',crystals:'gem',elites:'king',gates:'gate',army:'ghost'};
function nextQuest(){
 const s=G.questSeq%6;G.questSeq++;
 const cyc=(G.questSeq/6)|0;
 const mk2={
  0:()=>({key:'kills',title:'Путь Теней',txt:'Победи врагов в вратах',target:Math.round(20*Math.pow(1.3,cyc)),r:{gold:300,cryst:40}}),
  1:()=>({key:'summons',title:'АРИЗ!',txt:'Призови теней (X у тел)',target:5+3*cyc,r:{gold:250,cryst:30,ex:1}}),
  2:()=>({key:'crystals',title:'Тайна Врат',txt:'Добудь Древние кристаллы (боссы)',target:1+cyc,r:{gold:500,cryst:60}}),
  3:()=>({key:'elites',title:'Охота на Элиту',txt:'Победи элиту или боссов',target:2+2*cyc,r:{gold:450,cryst:50}}),
  4:()=>({key:'gates',title:'Зачистка Врат',txt:'Зачисти врата любого ранга',target:2+2*cyc,r:{gold:600,cryst:70}}),
  5:()=>({key:'army',title:'Власть Теней',txt:'Подними уровень Власти Теней',target:(G.counters.army||1)+1,r:{gold:700,cryst:80,ex:1}})
 }[s];
 const q=mk2();q.start=Object.assign({},G.counters);return q;
}
function initQuests(){G.quests=[nextQuest(),nextQuest(),nextQuest()];questsDirty()}
function qProg(q){return clamp((G.counters[q.key]||0)-(q.start[q.key]||0),0,q.target)}
function checkQuests(){
 let dirty=false;
 for(let i=G.quests.length-1;i>=0;i--){const q=G.quests[i];
  if(qProg(q)>=q.target){
   const p=G.player;p.gold+=q.r.gold;p.crystals+=q.r.cryst||0;
   if(q.r.ex)G.riseBonus=Math.min(.2,G.riseBonus+.04);
   sysNotify('КВЕСТ ВЫПОЛНЕН',['<b>'+q.title+'</b>','Награда: '+q.r.gold+' золота'+(q.r.cryst?', '+q.r.cryst+' кристаллов':'')+(q.r.ex?', +4% к шансу АРИЗ':'')]);
   log('system',`Квест выполнен: <b>${q.title}</b>.`);
   SFX.chest();
   G.quests.splice(i,1);G.quests.push(nextQuest());dirty=true;saveGame();
  }}
 if(dirty)questsDirty();
}
let questDirtyFlag=true;
function questsDirty(){questDirtyFlag=true}
function renderQuests(){
 if(!questDirtyFlag)return;questDirtyFlag=false;
 let dhtml='';
 if(G.daily&&!G.daily.done){ensureDaily();const d=G.daily;
  const cnt=(d.kills>=DQT.kills?1:0)+(d.summons>=DQT.summons?1:0)+(d.elites>=DQT.elites?1:0)+(d.gates>=DQT.gates?1:0);
  dhtml=`<div class="qi">${ic('skull')}<div><b>Ежедневный квест Системы</b><span>Цели: ${cnt}/4 — детали в «Статусе»</span></div></div>`;}
 $('questList').innerHTML=dhtml+G.quests.map(q=>{const pr=qProg(q),done=pr>=q.target;
  return `<div class="qi${done?' done':''}">${ic(QIC[q.key])}<div><b>${q.title}</b><span>${q.txt} (${pr}/${q.target})</span></div></div>`}).join('');
}
