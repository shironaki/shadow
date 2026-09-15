'use strict';
/* Apex visual stage: Phaser owns the presentation layer. */
import('./phaser-apex.js?v=0.2.0').catch(e=>console.warn('[PhaserApex] load failed:',e));
import('./qa.js?v=0.15.0').catch(e=>console.warn('[ShadowQA] load failed:',e));
/* ═══ ГЛАВНЫЙ: сохранения, старт игры, игровой цикл ═══ */
const SKEY='shadow_ascension_v4';
