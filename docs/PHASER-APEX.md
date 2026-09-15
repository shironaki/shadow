# Phaser Apex Stage

## Goal

`dev/phaser-apex` moves the visible game presentation to **Phaser 3.90** while keeping the existing gameplay simulation authoritative.

- Gameplay state: legacy `G`, `M`, `update()` and input systems.
- Presentation: `js/phaser-apex.js`.
- Phaser canvas is layered above the legacy render surface; the legacy canvas is hidden once Phaser starts.
- Mobile/desktop resize is handled by Phaser `Scale.RESIZE`.

## v0.3 presentation pass

- Isometric floor tiles with material variation and bevel-like borders.
- Exposed dungeon edges rendered as real vertical wall faces with depth ordering.
- Wall faces receive horizontal masonry seams and alternating light/shadow sides.
- Pixel-art chibi hero texture with idle/walk frames, cloak, face, boots, belt and dagger.
- Presentation props for torches, crystals, chest and portal when those objects exist in map state.
- Local FX around the player and presentation-only shadows.
- Phaser startup retries while gameplay globals are still initializing.
- QA panel checks Phaser runtime, host creation, map connectivity, collision state and FPS.

## Boundary

Phaser is intentionally presentation-first in this stage. Gameplay collision, combat, saves and progression remain in the established simulation until a later migration has equivalent automated coverage.
