/**
 * Shadow Ascension - CharacterRenderer
 * Production Kit drop-in Canvas 2D renderer.
 * Gameplay/input logic intentionally lives outside this renderer.
 */
'use strict';

class CharacterRenderer {
  constructor(ctx, manifest, characterId, options = {}) {
    this.ctx = ctx;
    this.manifest = manifest;
    this.characterId = characterId;
    this.data = manifest.characters[characterId];
    if (!this.data) throw new Error(`Unknown character: ${characterId}`);

    this.frameW = manifest.canvas.logicalWidth;
    this.frameH = manifest.canvas.logicalHeight;
    this.state = 'idle';
    this.frame = 0;
    this.elapsed = 0;
    this.done = false;
    this.flipX = false;

    this.scale = options.scale ?? 1;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.anchorY = options.anchorY ?? 1;
    this.shadow = options.shadow ?? true;
    this.images = {};
    this.loading = this.load();
  }

  async load() {
    const entries = Object.entries(this.data.sprites);
    await Promise.all(entries.map(async ([state, src]) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      await img.decode();
      this.images[state] = img;
    }));
  }

  setAnimation(state, restart = false) {
    if (!this.manifest.animations[state]) throw new Error(`Unknown animation: ${state}`);
    if (state !== this.state || restart) {
      this.state = state;
      this.frame = 0;
      this.elapsed = 0;
      this.done = false;
    }
  }

  playOnce(state) {
    this.setAnimation(state, true);
  }

  update(dt) {
    const anim = this.manifest.animations[this.state];
    if (this.done && !anim.loop) return;
    this.elapsed += dt;
    const frameTime = 1000 / anim.fps;
    while (this.elapsed >= frameTime) {
      this.elapsed -= frameTime;
      this.frame++;
      if (this.frame >= anim.frames) {
        if (anim.loop) this.frame = 0;
        else {
          this.frame = anim.frames - 1;
          this.done = true;
        }
      }
    }
  }

  draw(options = {}) {
    const ctx = this.ctx;
    const img = this.images[this.state];
    if (!img) return;

    const scale = options.scale ?? this.scale;
    const x = options.x ?? this.x;
    const y = options.y ?? this.y;
    const alpha = options.alpha ?? 1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;

    if (this.shadow) {
      ctx.save();
      ctx.globalAlpha = 0.25 * alpha;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(x, y + 6 * scale, 34 * scale, 9 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const dw = this.frameW * scale;
    const dh = this.frameH * scale;
    const dx = x - dw / 2;
    const dy = y - dh * this.anchorY;

    ctx.translate(dx + (this.flipX ? dw : 0), dy);
    if (this.flipX) ctx.scale(-1, 1);
    ctx.drawImage(img, this.frame * this.frameW, 0, this.frameW, this.frameH, 0, 0, dw, dh);
    ctx.restore();
  }
}

window.CharacterRenderer = CharacterRenderer;
