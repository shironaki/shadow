/**
 * Shadow Ascension - Production Kit CharacterRenderer.
 * Rendering only: movement, combat and state ownership stay in gameplay code.
 */
'use strict';

class CharacterRenderer {
  constructor(ctx, manifest, characterId, options = {}) {
    this.ctx = ctx; this.manifest = manifest; this.characterId = characterId;
    this.data = manifest.characters[characterId]; if (!this.data) throw new Error(`Unknown character: ${characterId}`);
    this.frameW = manifest.canvas.logicalWidth; this.frameH = manifest.canvas.logicalHeight;
    this.state = 'idle'; this.frame = 0; this.elapsed = 0; this.done = false; this.flipX = false;
    this.scale = options.scale ?? 0.42; this.x = options.x ?? 0; this.y = options.y ?? 0; this.anchorY = options.anchorY ?? 1; this.shadow = options.shadow ?? true;
    this.images = Object.create(null); this.loading = this.load();
  }
  loadImage(src) { return new Promise((resolve, reject) => { const img = new Image(); img.decoding = 'async'; img.onload = () => resolve(img); img.onerror = () => reject(new Error(`Failed to load sprite: ${src}`)); img.src = src; }); }
  async load() { await Promise.all(Object.entries(this.data.sprites).map(async ([state, src]) => { const img = await this.loadImage(src); const expectedFrames = this.manifest.animations[state]?.frames; if (!expectedFrames || img.width < expectedFrames * this.frameW || img.height < this.frameH) throw new Error(`Invalid sprite sheet for ${state}: ${src}`); this.images[state] = img; })); return this; }
  setAnimation(state, restart = false) { if (!this.manifest.animations[state]) throw new Error(`Unknown animation: ${state}`); if (state !== this.state || restart) { this.state = state; this.frame = 0; this.elapsed = 0; this.done = false; } }
  playOnce(state) { this.setAnimation(state, true); }
  update(dtMs) { const anim = this.manifest.animations[this.state]; if (!anim || (this.done && !anim.loop)) return; this.elapsed += Math.max(0, dtMs); const frameTime = 1000 / anim.fps; while (this.elapsed + 1e-7 >= frameTime) { this.elapsed -= frameTime; this.frame += 1; if (this.frame >= anim.frames) { if (anim.loop) this.frame = 0; else { this.frame = anim.frames - 1; this.done = true; this.elapsed = 0; break; } } } }
  draw(options = {}) { const img = this.images[this.state]; if (!img) return false; const ctx = this.ctx, scale = options.scale ?? this.scale, x = options.x ?? this.x, y = options.y ?? this.y, alpha = options.alpha ?? 1, dw = this.frameW * scale, dh = this.frameH * scale, dx = x - dw / 2, dy = y - dh * this.anchorY, sx = Math.min(this.frame, (img.width / this.frameW) - 1) * this.frameW; ctx.save(); ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = false; if (this.shadow) { ctx.save(); ctx.globalAlpha = 0.22 * alpha; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, y + 5 * scale, 28 * scale, 7 * scale, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } ctx.translate(dx + (this.flipX ? dw : 0), dy); if (this.flipX) ctx.scale(-1, 1); ctx.drawImage(img, sx, 0, this.frameW, this.frameH, 0, 0, dw, dh); ctx.restore(); return true; }
}
window.CharacterRenderer = CharacterRenderer;

(function () {
  if (window.__shadowCharacterRendererInstalled) return;
  window.__shadowCharacterRendererInstalled = true;
  const MANIFEST_URL = 'assets/manifest.json', CLASS_MAP = { shade: 'assassin', ward: 'warrior', mage: 'mage' };
  let manifest = null, renderer = null, loadingId = '', failed = false;
  function game() { try { return globalThis.eval('G'); } catch (_) { return null; } }
  function context() { try { return globalThis.eval('ctx'); } catch (_) { const canvas = document.getElementById('cv'); return canvas ? canvas.getContext('2d') : null; } }
  function characterId(p) { return (CLASS_MAP[p.cls] || 'assassin') + '_' + (p.sex === 'f' ? 'female' : 'male'); }
  function stateFor(p) { const g = game(); if (p.dead) return 'death'; if (g && g.hurtT > 0) return 'hurt'; if (p.atkT > 0 || p.swingT > 0) return 'attack'; return p.moving ? 'walk' : 'idle'; }
  async function ensureRenderer() { const g = game(); if (failed || !manifest || !g || !g.player) return; const id = characterId(g.player); if (renderer && renderer.characterId === id) return; if (loadingId === id) return; loadingId = id; try { const next = new CharacterRenderer(context(), manifest, id, { scale: .34, anchorY: 1, shadow: true }); await next.loading; const current = game(); if (current && current.player && characterId(current.player) === id) renderer = next; } catch (e) { failed = true; console.warn('[CharacterRenderer] sprite load failed:', e); } finally { if (loadingId === id) loadingId = ''; } }
  function sync() { const g = game(); if (!g || !g.player) return; ensureRenderer(); if (!renderer) return; const state = stateFor(g.player); if (state === 'attack' && renderer.state !== 'attack') renderer.playOnce('attack'); else if (state === 'hurt' && renderer.state !== 'hurt') renderer.playOnce('hurt'); else if (state === 'death' && renderer.state !== 'death') renderer.playOnce('death'); else if (state === 'walk' && renderer.state !== 'walk') renderer.setAnimation('walk'); else if (state === 'idle' && renderer.state !== 'idle' && renderer.done) renderer.setAnimation('idle'); if (g.player.face !== undefined) renderer.flipX = g.player.face < 0; }
  const legacyDrawPlayer = globalThis.eval('drawPlayer'), legacyUpdate = globalThis.eval('update');
  window.__shadowCharacterDraw = function (X, Y) { const g = game(); if (renderer && !failed && renderer.draw({ x: X, y: Y, scale: .34, alpha: g && g.stealth > 0 ? .4 : .98 })) return; if (typeof legacyDrawPlayer === 'function') legacyDrawPlayer(X, Y); };
  window.__shadowCharacterUpdate = function (dt) { if (typeof legacyUpdate === 'function') legacyUpdate(dt); sync(); if (renderer) renderer.update(dt * 1000); };
  globalThis.eval('drawPlayer = window.__shadowCharacterDraw');
  globalThis.eval('update = window.__shadowCharacterUpdate');
  fetch(MANIFEST_URL, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('manifest HTTP ' + r.status); return r.json(); }).then(m => { manifest = m; sync(); }).catch(e => { failed = true; console.warn('[CharacterRenderer] manifest load failed:', e); });
})();
