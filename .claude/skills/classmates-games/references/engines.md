# Game Engines Reference

## Phaser 3.90
- Package: `phaser` (installed)
- Wrapper: `src/components/shared/GameShell.tsx`
- Example: `src/game/scenes/SpellingScene.ts` (404 lines)
- Use for: 2D games needing sprites, physics, particles, tweens
- Scene lifecycle: `preload()`, `create()`, `update()`

## Three.js 0.183
- Package: `three` + `@types/three` (installed)
- Example: `src/components/games/SouthlodgeRacers.tsx` (443 lines)
- Use for: 3D games, racing, 3D environments
- Pattern: useRef for container, useEffect for scene setup, requestAnimationFrame loop

## Kaplay.js
- Package: `kaplay` (installed)
- Use for: 2D platformers, puzzle games, quick prototypes
- Supports Tiled JSON tilemaps
- ASCII-based level maps for rapid prototyping

## LittleJS
- Package: `littlejsengine` (installed, ~10KB)
- Use for: Pixel art games, retro aesthetics, minimal bundle impact
- Can render 100K+ sprites at 60fps

## Godot 4.4.1
- Binary: `/usr/local/bin/godot` (installed, verified headless)
- Projects: `src/godot/[name]/` (source), `public/godot/[name]/` (export)
- Export: `godot --headless --path src/godot/[name] --export-release "Web" public/godot/[name]/index.html`
- Scene format: `.tscn` (plain text, Claude writes directly)
- Script format: `.gd` GDScript (Claude writes directly)
- React wrapper: iframe with postMessage bridge for results
- WASM size: ~42MB per game (browsers cache after first load)
- Touch: Use InputEventScreenTouch, not mouse capture
- For 2D: Use Node2D + _draw() or Sprite2D nodes
- For 3D: Use Node3D + MeshInstance3D nodes

## Nostalgist.js
- Package: `nostalgist` (installed)
- Use for: Playing Game Boy ROMs (from GB Studio) in browser
- Wraps RetroArch WASM cores

## Choosing an Engine

| Game Type | Best Engine |
|-----------|-------------|
| Quiz with 4 buttons | React + QuizEngine (no engine needed) |
| Quiz with visual theme | React + Motion + Canvas (premium pattern) |
| 2D platformer with sprites | Kaplay or Phaser |
| Pixel art retro game | LittleJS |
| 3D racing/adventure | Three.js or Godot |
| Complex 2D with physics | Godot |
| Retro Game Boy style | GB Studio + Nostalgist |
