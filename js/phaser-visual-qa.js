'use strict';
/* Shadow Ascension · presentation QA v0.1 */
(function(){
 let started=false,checks=0,failures=0,last=0;
 const fail=(name,detail)=>{failures++;console.warn('[shadow QA]',name,detail||'')};
 function run(){
  if(started)return; started=true;
  const apex=globalThis.__shadowPhaserApex;
  if(!apex){fail('apex-host','missing __shadowPhaserApex');return report()}
  checks++;
  if(!apex.active||!apex.scene)fail('scene','Phaser scene is not active'); else checks++;
  const s=apex.stats||{};
  ['ox','oy','tw','th'].forEach(k=>{checks++;if(!Number.isFinite(Number(s[k])))fail('iso-'+k,'missing iso metric')});
  const G=(()=>{try{return globalThis.eval('G')}catch(_){return null}})();
  checks++;if(!G)fail('simulation','G unavailable');
  const passes=['ariseStats','combatFxStats','combatImpact','portalFx','bossTelegraphStats','arenaAtmosphere','vitals','mobilePolish'];
  passes.forEach(k=>{checks++;if(apex[k]===undefined&&globalThis.__shadowPhaserApex[k]===undefined)console.info('[shadow QA] optional pass not yet reporting:',k)});
  report();
 }
 function report(){const apex=globalThis.__shadowPhaserApex||{};apex.visualQA={ok:failures===0,checks,failures,at:Date.now()};last=Date.now()}
 window.addEventListener('shadow-start-phaser',()=>setTimeout(run,1200));
 window.addEventListener('load',()=>setTimeout(run,2200));
})();
