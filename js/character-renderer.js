/**
 * Shadow Ascension - Production Kit CharacterRenderer.
 * Rendering only: movement, combat and state ownership stay in gameplay code.
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
    this.scale = options.scale ?? 0.42;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.anchorY = options.anchorY ?? 1;
    this.shadow = options.shadow ?? true;
    this.images = Object.create(null);
    this.loading = this.load();
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
      img.src = src;
    });
  }

  async load() {
    await Promise.all(Object.entries(this.data.sprites).map(async ([state, src]) => {
      const img = await this.loadImage(src);
      const expectedFrames = this.manifest.animations[state]?.frames;
      if (!expectedFrames || img.width < expectedFrames * this.frameW || img.height < this.frameH) {
        throw new Error(`Invalid sprite sheet for ${state}: ${src}`);
      }
      this.images[state] = img;
    }));
    return this;
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

  update(dtMs) {
    const anim = this.manifest.animations[this.state];
    if (!anim || (this.done && !anim.loop)) return;
    this.elapsed += Math.max(0, dtMs);
    const frameTime = 1000 / anim.fps;
    const epsilon = 1e-7;
    while (this.elapsed + epsilon >= frameTime) {
      this.elapsed -= frameTime;
      this.frame += 1;
      if (this.frame >= anim.frames) {
        if (anim.loop) this.frame = 0;
        else {
          this.frame = anim.frames - 1;
          this.done = true;
          this.elapsed = 0;
          break;
        }
      }
    }
  }

  draw(options = {}) {
    const img = this.images[this.state];
    if (!img) return false;
    const ctx = this.ctx;
    const scale = options.scale ?? this.scale;
    const x = options.x ?? this.x;
    const y = options.y ?? this.y;
    const alpha = options.alpha ?? 1;
    const dw = this.frameW * scale;
    const dh = this.frameH * scale;
    const dx = x - dw / 2;
    const dy = y - dh * this.anchorY;
    const sx = Math.min(this.frame, (img.width / this.frameW) - 1) * this.frameW;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    if (this.shadow) {
      ctx.save();
      ctx.globalAlpha = 0.22 * alpha;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(x, y + 5 * scale, 28 * scale, 7 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.translate(dx + (this.flipX ? dw : 0), dy);
    if (this.flipX) ctx.scale(-1, 1);
    ctx.drawImage(img, sx, 0, this.frameW, this.frameH, 0, 0, dw, dh);
    ctx.restore();
    return true;
  }
}

window.CharacterRenderer = CharacterRenderer;
