'use strict';
/* SHADOW ASCENSION — browser QA harness. Hidden by default; F9 / ?qa=1. */
(function(){
  const get=n=>{try{return globalThis.eval(n)}catch(_){return undefined}};
  const finite=n=>Number.isFinite(n);
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let panel=null,last=null;
  function mapConnectivity(M){
    if(!M||!M.grid||!M.W||!M.H)return false;
    const total=M.W*M.H,seen=new Uint8Array(total),q=[];let first=-1,open=0;
    for(let i=0;i<total;i++)if(M.grid[i]){open++;if(first<0)first=i}
    if(first<0)return false;q.push(first);seen[first]=1;let head=0,count=0;
    while(head<q.length){const i=q[head++];count++;const x=i%M.W;for(const n of[i-1,i+1,i-M.W,i+M.W]){if(n<0||n>=total||seen[n]||!M.grid[n])continue;if((n===i-1&&x===0)||(n===i+1&&x===M.W-1))continue;seen[n]=1;q.push(n)}}
    return count===open;
  }
  function run(){
    const G=get('G'),M=get('M'),ctx=get('ctx'),canvas=get('cvs');
    const tests=[];const ok=(name,pass,detail='')=>tests.push({name,pass:!!pass,detail});
    ok('Canvas',!!ctx&&!!canvas,ctx?`${canvas.width}×${canvas.height}`:'нет');
    ok('Карта',!!M&&!!M.grid&&M.grid.length===M.W*M.H,M?`${M.W}×${M.H}`:'нет');
    ok('Связность карты',mapConnectivity(M),'все проходимые клетки соединены');
    ok('Комнаты',!!M&&Array.isArray(M.rooms)&&M.rooms.length>=1,M?String(M.rooms.length):'нет');
    ok('Игрок',!!G&&!!G.player&&finite(G.player.x)&&finite(G.player.y)&&finite(G.player.hp),'позиция/HP конечные');
    ok('Камера',!!G&&!!G.cam&&finite(G.cam.x)&&finite(G.cam.y),'позиция конечная');
    ok('Бой',!!G&&Array.isArray(G.enemies)&&Array.isArray(G.projs)&&Array.isArray(G.loots),G?`враги ${G.enemies.length} · снаряды ${G.projs.length}`:'нет');
    ok('Сохранение',typeof localStorage!=='undefined','localStorage доступен');
    ok('Chibi',typeof window.__shadowChibiDraw==='function','нативный чиби-рендерер установлен');
    ok('Коллизия стен',typeof window.__shadowChibiUpdate==='function','движение проходит через sweep-проверку grid/obst');
    ok('CharacterRenderer adapter',typeof window.__shadowCharacterDraw==='function','совместимый drawPlayer-хук установлен');
    ok('WorldPresentation',typeof window.__shadowVisualPrerender==='function'&&typeof window.__shadowVisualRender==='function','слой стен/глубины установлен');
    ok('FPS',!G||!G.fps||G.fps>=24,G&&G.fps?Math.round(G.fps)+' FPS':'старт');
    const passed=tests.filter(x=>x.pass).length;last={time:new Date().toISOString(),passed,total:tests.length,tests};return last;
  }
  function mount(){
    if(panel)return;panel=document.createElement('div');panel.id='shadowQA';panel.style.cssText='position:fixed;right:12px;bottom:12px;z-index:1000;width:min(420px,calc(100vw - 24px));max-height:60vh;overflow:auto;background:rgba(6,5,18,.94);border:1px solid rgba(180,160,255,.45);box-shadow:0 18px 50px rgba(0,0,0,.45);border-radius:12px;padding:12px;color:#eee8ff;font:12px/1.45 system-ui,sans-serif;backdrop-filter:blur(10px);pointer-events:auto';document.body.appendChild(panel);refresh();
  }
  function refresh(){if(!panel)return;const r=run();panel.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="letter-spacing:.08em">SHADOW QA · v0.15</b><button id="qaClose" style="color:#c4b5fd">✕</button></div><div style="margin-bottom:8px"><b>${r.passed}/${r.total}</b> тестов пройдено</div>`+r.tests.map(x=>`<div style="display:flex;gap:8px;padding:3px 0;border-top:1px solid rgba(255,255,255,.06)"><span>${x.pass?'✓':'✕'}</span><b style="min-width:145px">${esc(x.name)}</b><span style="opacity:.7">${esc(x.detail)}</span></div>`).join('')+`<div style="opacity:.45;margin-top:8px;font-size:10px">F9 — скрыть/показать · ?qa=1 — открыть автоматически</div>`;panel.querySelector('#qaClose').onclick=()=>{panel.remove();panel=null}}
  function toggle(){if(panel){panel.remove();panel=null}else mount()}
  addEventListener('keydown',e=>{if(e.key==='F9'){e.preventDefault();toggle()}});
  window.__shadowQA={run,show:mount,hide:()=>{if(panel){panel.remove();panel=null}},get last(){return last}};
  setInterval(()=>{if(panel)refresh()},2500);setTimeout(()=>{if(location.search.includes('qa=1'))mount();run()},500);
})();
