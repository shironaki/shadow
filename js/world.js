'use strict';
/* ═══ МИР: генерация хаба и подземелий врат, палитры сцен, пререндер ═══ */
/* КАРТА */
const M={W:42,H:42,grid:null,rooms:[],torches:[],crystals:[],pillars:[],obst:[],spawns:[],portal:null,chest:null,OX:0,OY:40,WH:34,cv:null,cw:0,ch:0,FS:2};
/* ПАЛИТРЫ СЦЕН (v0.8.1): ранг врат задаёт освещение и цвет подземелья */
const DPALS={
 hub:{h:250,s:31,ws:24,amb:'rgba(90,40,170,.045)',fog:'#4c4680',acc:'#8b5cf6',acc2:'rgba(150,130,255,.5)'},
 e:{h:228,s:30,ws:22,amb:'rgba(40,70,190,.05)',fog:'#3e4a70',acc:'#60a5fa',acc2:'rgba(130,160,255,.5)'},
 d:{h:192,s:32,ws:24,amb:'rgba(20,120,140,.05)',fog:'#3d5f66',acc:'#22d3ee',acc2:'rgba(120,220,230,.5)'},
 c:{h:210,s:34,ws:24,amb:'rgba(30,90,200,.05)',fog:'#3a5580',acc:'#38bdf8',acc2:'rgba(120,190,255,.5)'},
 b:{h:268,s:34,ws:25,amb:'rgba(110,40,200,.05)',fog:'#54446e',acc:'#a78bfa',acc2:'rgba(190,160,255,.5)'},
 a:{h:32,s:36,ws:26,amb:'rgba(190,110,20,.05)',fog:'#6e5a3e',acc:'#fbbf24',acc2:'rgba(250,200,120,.5)'},
 s:{h:352,s:38,ws:26,amb:'rgba(190,30,50,.06)',fog:'#6e4048',acc:'#f87171',acc2:'rgba(255,150,150,.5)'},
 red:{h:0,s:42,ws:28,amb:'rgba(200,20,30,.07)',fog:'#703840',acc:'#ef4444',acc2:'rgba(255,120,120,.55)'}
};
let SCENE=DPALS.hub;
function scenePal(f){return f>=9999?DPALS.hub:DPALS[G.gateRed?'red':['e','d','c','b','a','s'][clamp(G.gateRank,0,5)]]}
const blocked=(x,y)=>x<0||y<0||x>=M.W||y>=M.H||!M.grid[y*M.W+x];
/* --- МИР (хаб) --- */
function genHub(){
 const R=mulberry32((G.seed^0x9e3779b9)>>>0);
 M.grid=new Uint8Array(M.W*M.H);M.rooms=[];M.torches=[];M.crystals=[];M.pillars=[];M.obst=[];M.portal=null;M.chest=null;M.spawns=[];
 const plaza={x:11,y:13,w:20,h:16,cx:21,cy:21};M.rooms.push(plaza);
 const yard1={x:4,y:5,w:6,h:6,cx:7,cy:8},yard2={x:32,y:30,w:6,h:6,cx:35,cy:33};
 M.rooms.push(yard1,yard2);
 for(const r of M.rooms)for(let j=r.y;j<r.y+r.h;j++)for(let i=r.x;i<r.x+r.w;i++)M.grid[j*M.W+i]=1;
 const carve=(x,y)=>{if(x>0&&y>0&&x<M.W-1&&y<M.H-1){M.grid[y*M.W+x]=1;M.grid[y*M.W+Math.min(M.W-1,x+1)]=1;M.grid[Math.min(M.H-1,y+1)*M.W+x]=1}};
 let x=yard1.cx|0,y=yard1.cy|0;while(x<plaza.x+2){x++;carve(x,y)}while(y<plaza.y+3){y++;carve(x,y)}
 x=yard2.cx|0;y=yard2.cy|0;while(x>plaza.x+plaza.w-3){x--;carve(x,y)}while(y>plaza.y+plaza.h-4){y--;carve(x,y)}
 // факелы по периметру площади
 for(let t=0;t<160;t++){
  const rx=plaza.x+((R()*plaza.w)|0),ry=plaza.y+((R()*plaza.h)|0);
  if(blocked(rx,ry))continue;
  if(!(blocked(rx,ry-1)||blocked(rx+1,ry)||blocked(rx-1,ry)||blocked(rx,ry+1)))continue;
  if(M.torches.some(o=>dist(o.x,o.y,rx+.5,ry+.5)<3))continue;
  M.torches.push({type:R()<.5?'braz':'wall',x:rx+.5,y:ry+.5,seed:R()*10});
 }
 for(let i=0;i<5;i++)M.crystals.push({x:plaza.x+1+R()*(plaza.w-2),y:plaza.y+1+R()*(plaza.h-2),seed:R()*10,v:irand(0,2)});
 // пьедесталы врат
 M.spawns=[{x:plaza.x+3,y:plaza.y+3},{x:plaza.x+plaza.w-4,y:plaza.y+3},{x:plaza.x+3,y:plaza.y+plaza.h-4},{x:plaza.x+plaza.w-4,y:plaza.y+plaza.h-4},{x:plaza.cx,y:plaza.y+2}];
 prerender(9999);
 G.wave={budget:0,t:0,eliteAt:0,eliteDone:true,bossPending:null};
 G.cleared=false;G.enemies=[];G.projs=[];G.corpses=[];G.loots=[];G.hands=[];G.strikes=[];G.whirl=null;
 G.fogs=[];for(let i=0;i<5;i++)G.fogs.push({x:plaza.cx+rand(-10,10),y:plaza.cy+rand(-7,7),r:rand(60,120),ph:rand(TAU)});
}
/* --- ПОДЗЕМЕЛЬЕ ВРАТ --- */
function genFloor(diff){
 const R=mulberry32(G.seed+diff*1013);
 M.grid=new Uint8Array(M.W*M.H);M.rooms=[];M.torches=[];M.crystals=[];M.pillars=[];M.obst=[];M.portal=null;M.chest=null;
 let guard=0;
 while(M.rooms.length<7&&guard++<300){
  const w=4+((R()*5)|0),h=4+((R()*5)|0),x=2+((R()*(M.W-w-4))|0),y=2+((R()*(M.H-h-4))|0);
  if(M.rooms.some(r=>x<r.x+r.w+2&&x+w+2>r.x&&y<r.y+r.h+2&&y+h+2>r.y))continue;
  M.rooms.push({x,y,w,h,cx:x+w/2,cy:y+h/2});
 }
 for(const r of M.rooms)for(let j=r.y;j<r.y+r.h;j++)for(let i=r.x;i<r.x+r.w;i++)M.grid[j*M.W+i]=1;
 const carve=(x,y)=>{if(x>0&&y>0&&x<M.W-1&&y<M.H-1){M.grid[y*M.W+x]=1;M.grid[y*M.W+Math.min(M.W-1,x+1)]=1;M.grid[Math.min(M.H-1,y+1)*M.W+x]=1}};
 for(let i=1;i<M.rooms.length;i++){const a=M.rooms[i-1],b=M.rooms[i];let x=a.cx|0,y=a.cy|0;const tx=b.cx|0,ty=b.cy|0;
  while(x!==tx){x+=x<tx?1:-1;carve(x,y)}while(y!==ty){y+=y<ty?1:-1;carve(x,y)}}
 let pr=M.rooms[0],bd=0;
 for(const r of M.rooms){const d=dist(r.cx,r.cy,M.rooms[0].cx,M.rooms[0].cy);if(d>bd){bd=d;pr=r}}
 M.portal={x:pr.cx,y:pr.cy,active:false};
 const cr=M.rooms[1+((R()*(M.rooms.length-1))|0)];
 M.chest={x:cr.cx,y:cr.cy+.8,opened:false};
 let nb=0,nw=0;
 for(const r of M.rooms){
  for(let t=0;t<50;t++){
   if(nb>=7&&nw>=12)break;
   const x=r.x+((R()*r.w)|0),y=r.y+((R()*r.h)|0);
   if(blocked(x,y))continue;
   if(!(blocked(x,y-1)||blocked(x+1,y)||blocked(x-1,y)||blocked(x,y+1)))continue;
   if(M.torches.some(o=>dist(o.x,o.y,x+.5,y+.5)<2.6))continue;
   if(dist(x+.5,y+.5,M.portal.x,M.portal.y)<2.2)continue;
   const type=(R()<.42&&nb<7)?'braz':'wall';
   if(type==='braz')nb++;else nw++;
   M.torches.push({type,x:x+.5,y:y+.5,seed:R()*10});
  }
  if(R()<.75)M.crystals.push({x:r.x+1+R()*(r.w-2),y:r.y+1+R()*(r.h-2),seed:R()*10,v:irand(0,2),hp:3,mined:false}); // v0.9: руда — жилы с hp
 }
 const clear9=(x,y)=>{for(let j=-1;j<=1;j++)for(let i2=-1;i2<=1;i2++)if(blocked(x+i2,y+j))return false;return true};
 for(const r of M.rooms){
  if(r===M.rooms[0]||r===pr||R()>=.4)continue;
  for(let t=0;t<24;t++){
   const x=(r.cx+rand(-r.w/4,r.w/4))|0,y=(r.cy+rand(-r.h/4,r.h/4))|0;
   if(!clear9(x,y))continue;
   if(x<=r.x+1||y<=r.y+1||x>=r.x+r.w-2||y>=r.y+r.h-2)continue;
   if(dist(x+.5,y+.5,M.chest.x,M.chest.y)<2.2)continue;
   if(dist(x+.5,y+.5,M.portal.x,M.portal.y)<2.4)continue;
   if(M.obst.some(o=>dist(o.x,o.y,x+.5,y+.5)<2.6))continue;
   M.obst.push({x:x+.5,y:y+.5,r:.42});M.pillars.push({x:x+.5,y:y+.5});break;
  }
 }
 prerender(diff);
 G.fogs=[];for(let i=0;i<6;i++)G.fogs.push({x:M.rooms[0].cx+rand(-14,14),y:M.rooms[0].cy+rand(-10,10),r:rand(60,130),ph:rand(TAU)});
}
function genDungeon(idx,red,mega){
 const diff=1+idx*2+(red?1:0)+(mega?2:0);
 G.gateDiff=diff;G.gateRank=idx;G.gateRed=red;G.gateMega=!!mega;
 genFloor(diff);
 const budget=6+idx*3+(mega?4:0);
 let bossPending=null;
 if(mega)bossPending=G.counters.gates%2?'bel':'beru'; // v0.9: мегабосс
 else if(idx>=2)bossPending=red?['igirs','baran','kamish'][G.counters.gates%3]:'knight';
 G.wave={budget,t:1.6,eliteAt:bossPending?0:Math.round(budget*.45),eliteDone:false,bossPending};
 G.cleared=false;G.enemies=[];G.projs=[];G.corpses=[];G.loots=[];G.hands=[];G.strikes=[];
}
function prerender(f){
 if(!M.grid)return;
 SCENE=scenePal(f); // v0.8.1: палитра сцены
 const PH=SCENE.h,PS=SCENE.s,PW=SCENE.ws;
 M.OX=M.H*32;
 const w=(M.W+M.H)*32,h=(M.W+M.H)*16+M.OY+90;
 M.FS=(innerWidth<900||dpr>1.5)?1.5:2;
 M.FS=Math.min(M.FS,Math.sqrt(10e6/(w*h)));
 const cv=document.createElement('canvas');cv.width=Math.max(2,Math.ceil(w*M.FS));cv.height=Math.max(2,Math.ceil(h*M.FS));
 const c=cv.getContext('2d');c.scale(M.FS,M.FS);
 const R=mulberry32(G.seed+f*77);
 const ix=(x,y)=>(x-y)*32+M.OX, iy=(x,y)=>(x+y)*16+M.OY;
 const solid=(x,y)=>x<0||y<0||x>=M.W||y>=M.H||!M.grid[y*M.W+x];
 for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){
  if(!M.grid[y*M.W+x])continue;
  const sx=ix(x,y),sy=iy(x,y),hh=hash2(x,y),h2=hash2(x*3+7,y*5+3);
  const L1=26+hh*8,L2=20+((hh*7)%1)*7; // v0.10: пол светлее — стены/пол читаются
  pth(c,[sx,sy-16,sx+32,sy,sx,sy+16]);c.fillStyle=`hsl(${PH+hh*14} ${PS+h2*9}% ${L1}%)`;c.fill();
  pth(c,[sx,sy-16,sx,sy+16,sx-32,sy]);c.fillStyle=`hsl(${PH+hh*14} ${PS+h2*9}% ${L2}%)`;c.fill();
  c.strokeStyle='rgba(255,255,255,.09)';c.lineWidth=1;
  c.beginPath();c.moveTo(sx,sy-16);c.lineTo(sx-32,sy);c.moveTo(sx,sy-16);c.lineTo(sx+32,sy);c.stroke();
  c.strokeStyle='rgba(0,0,0,.4)';
  c.beginPath();c.moveTo(sx-32,sy);c.lineTo(sx,sy+16);c.lineTo(sx+32,sy);c.stroke();
  c.strokeStyle='rgba(0,0,0,.22)';c.beginPath();c.moveTo(sx,sy-16);c.lineTo(sx,sy+16);c.stroke();
  if(h2>.87){c.strokeStyle='rgba(0,0,0,.35)';c.beginPath();c.moveTo(sx-12+hh*8,sy-4);c.lineTo(sx-2,sy+2);c.lineTo(sx+8-h2*6,sy-2);c.stroke()}
  if(hh<.035){c.save();c.shadowColor=SCENE.acc;c.shadowBlur=5;c.strokeStyle=SCENE.acc2;
   c.beginPath();c.arc(sx,sy,6,0,TAU);c.moveTo(sx-6,sy);c.lineTo(sx+6,sy);c.moveTo(sx,sy-4);c.lineTo(sx,sy+4);c.stroke();c.restore()}
  // v0.10: направленная тень от стены на пол — видно, где стена, а где проход
  const edge=(ax,ay,bx,by)=>{
   c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=1.4;
   c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();
   const t=.5;
   pth(c,[ax,ay,bx,by,bx+(sx-bx)*t,by+(sy-by)*t,ax+(sx-ax)*t,ay+(sy-ay)*t]);
   c.fillStyle='rgba(0,0,0,.30)';c.fill();
  };
  if(solid(x+1,y))edge(sx+32,sy,sx,sy+16);
  if(solid(x,y+1))edge(sx-32,sy,sx,sy+16);
  if(solid(x-1,y))edge(sx-32,sy,sx,sy-16);
  if(solid(x,y-1))edge(sx,sy-16,sx+32,sy);
 }
 for(let i=0;i<26;i++){const r=M.rooms[(R()*M.rooms.length)|0];if(!r)continue;
  const x=r.x+R()*r.w,y=r.y+R()*r.h;if(solid(x|0,y|0))continue;
  c.fillStyle='rgba(76,29,149,.10)';c.beginPath();c.ellipse(ix(x,y),iy(x,y),10+R()*14,5+R()*7,R(),0,TAU);c.fill()}
 const WH=M.WH;
 for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){
  if(!M.grid[y*M.W+x])continue;
  const nF=(dx,dy)=>!solid(x+dx,y+dy);
  if(!(nF(1,0)||nF(0,1)||nF(1,1)||nF(-1,0)||nF(0,-1)||nF(-1,-1)))continue;
  const sx=ix(x,y),sy=iy(x,y),hh=hash2(x*7,y*13);
  pth(c,[sx,sy-16-WH,sx+32,sy-WH,sx,sy+16-WH,sx-32,sy-WH]);
  c.fillStyle=`hsl(${PH+hh*12} ${PW}% ${42+hh*9}%)`;c.fill(); // v0.10: светлая вершина стены
  c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=1.2;c.stroke();
  pth(c,[sx,sy-14-WH,sx+28,sy-WH,sx,sy+14-WH,sx-28,sy-WH]);
  c.fillStyle=`hsl(${PH+hh*12} ${PW}% ${36+hh*7}%)`;c.fill();
  const face=(x1,y1,x2,y2)=>{
   const grd=lgg(c,0,y1-WH,0,y1,[[0,`hsl(${PH} ${PW}% ${30+hh*6}%)`],[1,`hsl(${PH} ${PW+4}% ${6+hh*3}%)`]]);
   pth(c,[x1,y1,x2,y2,x2,y2-WH,x1,y1-WH]);c.fillStyle=grd;c.fill();
   c.strokeStyle='rgba(0,0,0,.5)';
   for(let r2=1;r2<4;r2++){const t=r2/4;c.beginPath();c.moveTo(x1,y1-WH*t);c.lineTo(x2,y2-WH*t);c.stroke()}
   for(let r2=0;r2<4;r2++){const t=(r2+.5)/4,k=hash2(x*3+r2,y*5)*.8+.1;
    const jx=lerp(x1,x2,k),jy=lerp(y1,y2,k);
    c.beginPath();c.moveTo(jx,jy-WH*t);c.lineTo(jx,jy-WH*t-6);c.stroke()}
   c.strokeStyle='rgba(255,255,255,.22)';c.beginPath();c.moveTo(x1,y1-WH);c.lineTo(x2,y2-WH);c.stroke();
  c.strokeStyle='rgba(0,0,0,.55)';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
  };
  if(nF(1,0))face(sx,sy+16,sx+32,sy);
  if(nF(0,1))face(sx,sy+16,sx-32,sy);
 }
 c.strokeStyle='rgba(220,215,235,.22)';c.lineWidth=1.4;
 for(let i=0;i<14;i++){const r=M.rooms[(R()*M.rooms.length)|0];if(!r)continue;
  const x=r.x+R()*r.w,y=r.y+R()*r.h;if(solid(x|0,y|0))continue;
  const sx=ix(x,y),sy=iy(x,y);c.beginPath();c.arc(sx,sy,3,Math.PI*.1,Math.PI*.9);c.stroke();
  c.beginPath();c.arc(sx+6,sy+2,2.4,Math.PI*.1,Math.PI*.9);c.stroke();}
 M.cv=cv;M.cw=w;M.ch=h;
}
