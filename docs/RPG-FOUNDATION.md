# Shadow Ascension — RPG Foundation

Branch: `dev/rpg-foundation`

## Direction

Browser-first 2D/isometric RPG with MMO-RPG growth paths. No mandatory 3D conversion. The client must remain usable on desktop and touch devices; a later native/engine port can reuse the gameplay model and save schema.

## Rules for this branch

1. Gameplay state stays outside renderers.
2. Rendering is layered: static world -> entities -> combat FX -> atmosphere/HUD.
3. Deterministic world generation remains seed-based.
4. New systems must have a smoke-test path before they become progression-critical.
5. No art dependency is allowed to block gameplay or QA.

## v0.13 foundation delivered

- `js/visual-upgrade.js`: non-invasive presentation layer over the existing isometric renderer.
  - raised wall lips / pseudo-height
  - material variation and cracks
  - room focal lighting
  - vignette and atmospheric motion
  - player spatial focus ring
- `js/qa.js`: browser smoke-test harness.
  - F9 toggles the panel
  - `?qa=1` opens it automatically
  - checks canvas, map dimensions, map connectivity, rooms, player/camera finiteness, combat collections, save availability, CharacterRenderer and visual layer
- `CharacterRenderer` imports the visual/QA layers without moving gameplay into the renderer.

## Next architecture stages

### Stage A — combat/readability

- hit-stop and impact tiers
- damage number channels
- telegraph language shared by mobs/bosses
- ground decals and persistent combat scars
- elite affixes

### Stage B — RPG depth

- equipment affixes and build tags
- class specialization branches
- quests with prerequisites and world flags
- dungeon objectives beyond kill-all
- reputation/faction layer
- crafting and economy sinks

### Stage C — MMO-shaped client architecture

- authoritative state boundary
- deterministic command/event model
- entity IDs and snapshot-friendly serialization
- reconnect-safe session state
- server-authoritative combat later, without rewriting the client presentation layer

### Stage D — engine option

Do not port yet. First make the browser vertical slice fun and testable. If the project later needs a native build, Godot is the preferred migration target because the gameplay/state model can map cleanly to scenes/resources while keeping a web export. The browser build remains a first-class target.
