---
name: classmates-games
description: |
  Build educational games for Southlodge Classmates v2 — a Scottish primary school platform using React 19, TypeScript, and multiple game engines (Phaser, Three.js, Kaplay, LittleJS, Godot 4.4). ALWAYS use this skill when working in classmates-v2 on ANYTHING game-related: creating new games, fixing game bugs, adding features, using Phaser/Three.js/Kaplay/LittleJS/Godot, implementing QuizEngine quizzes, adding AudioEngine/Confetti/GameHeader/ResultsScreen, or aligning with Scottish CfE curriculum. Also trigger when user mentions: spelling games, maths games, times tables, word games, educational games, game polish, game audio, canvas games, 2D games, 3D games, racing games, quiz games, or any Classmates game component. If the user mentions "classmates" and "game" in any form, READ THIS SKILL FIRST.
---

# Classmates Games Skill

> These children deserve games as good as anything on the App Store. Build to that standard.

## MANDATORY QUALITY RULES

You are building for real children at a real school. Every game must feel like it was made by a professional studio, not a demo or proof-of-concept. These rules are non-negotiable:

### USE THE FULL POWER OF EACH ENGINE

**Phaser 3.90** — Do not write basic sprite movement. Use:
- Arcade or Matter.js physics (collisions, gravity, forces)
- Tweens for juice (scale bounces, colour flashes, shake effects)
- Particle emitters (sparks, dust, confetti, magic effects)
- Camera effects (shake, flash, fade, follow with lerp)
- Tilemaps (load from Tiled JSON, not hardcoded positions)
- Sprite sheets with animation frames (not static images)
- Scene transitions (not instant swaps)
- Sound manager (even with procedural Web Audio, use Phaser's timing)

**Three.js 0.183** — Do not write bare geometry with Lambert materials. Use:
- PBR materials (MeshStandardMaterial with roughness/metalness)
- Directional + ambient + point lights with shadows
- Post-processing (bloom, SSAO, tone mapping)
- Smooth camera transitions (lerp, quaternion slerp)
- Instanced meshes for repeated objects (trees, coins, obstacles)
- Raycasting for click/touch interaction
- Fog for depth
- Particle systems (custom or three-stdlib)

**Kaplay.js** — Do not write a basic platformer. Use:
- Full collision layers and tags
- Tiled JSON map loading
- Character animation state machines (idle, run, jump, fall)
- Parallax scrolling backgrounds (multiple layers)
- Screen shake and flash effects
- Custom components for game-specific behaviours
- Area triggers for dialogue/questions
- Proper death/respawn mechanics

**LittleJS** — Do not write static sprites. Use:
- Tile-based rendering at full speed (100K+ sprites)
- Particle system (built-in, very capable)
- Sound effects (built-in synth)
- WebGL mode for maximum performance
- Persistent world with camera scrolling
- Destructible terrain if applicable

**Godot 4.4** — Do not write a Node2D with _draw() only. Use:
- Proper scene tree (separate scenes for Player, Enemy, UI, Level)
- CharacterBody2D or CharacterBody3D with proper physics
- AnimationPlayer for sprite animations and UI transitions
- Particle systems (GPUParticles2D/3D)
- TileMap nodes with autotiling (not manual draw calls)
- Signals for decoupled communication
- Exported variables (@export) for tunable parameters
- Shaders for visual effects (water, glow, dissolve)
- AudioStreamPlayer with procedural or embedded audio
- Touch input via InputEventScreenTouch and InputEventScreenDrag
- Export as HTML5 via: `godot --headless --path <project> --export-release "Web" <output>`

### VISUAL QUALITY BAR

Every game must have:
- **Parallax background** — at least 2 layers of depth
- **Particle effects** — on correct answer, wrong answer, completion, coin collection
- **Screen juice** — shake on impact, bounce on collect, flash on damage
- **Smooth transitions** — between states (menu -> play -> results), not instant
- **Colour palette** — cohesive, kid-friendly, not random
- **Character animation** — idle, action states minimum. Never a static circle.
- **UI polish** — buttons have hover/press states, text has shadows/outlines for readability

If the game doesn't look like something a child would choose to play over watching YouTube, it's not done.

### AUDIO QUALITY BAR

Every game must have:
- **Background music** — procedural or looped, themed to the game world
- **SFX on every interaction** — tap, correct, wrong, collect, jump, land
- **Streak audio** — escalating feedback as streaks build
- **Completion fanfare** — celebratory, proportional to performance
- **Mute toggle** — always accessible, respects user preference

Use `src/components/premium/AudioEngine.ts` for React games. For Godot, write equivalent GDScript audio using AudioStreamPlayer and procedural generation.

### MOBILE-FIRST

Every game must work on a school tablet (iPad, Chromebook, Android tablet):
- **Touch controls only** — no mouse-required interactions
- **Minimum tap target 44px** — fingers, not cursors
- **Landscape AND portrait** — or lock to one with clear orientation
- **No hover states as primary interaction** — hover is enhancement only
- **On-screen controls** — virtual joystick or tap zones, never keyboard-required
- **Test at 375px width** — phones are the minimum

### NEVER SHIP

- A blue screen (test your Godot exports!)
- A game that requires a keyboard to play
- A game with no audio feedback
- A static circle as a "character"
- Hardcoded positions instead of procedural/tilemap levels
- Console errors in production
- A game that doesn't save results to ProgressTracker
- Placeholder text ("Lorem ipsum", "TODO", "Coming soon")

-----

## Engine Selection Guide

| Game Type | Engine | Why |
|-----------|--------|-----|
| Quiz (4 buttons) | React + QuizEngine | Fast, accessible, lightweight |
| Quiz with visual theme | React + Motion + Canvas | Premium look, SpellingGame pattern |
| 2D platformer with sprites | Kaplay or Phaser | Full physics, animation, tilemaps |
| Pixel art retro game | LittleJS | Tiny bundle, massive sprite count |
| 3D racing/flying | Three.js | WebGL, PBR materials, shadows |
| Complex 2D/3D showpiece | Godot 4.4 | Full engine, best visual quality |
| Retro Game Boy style | GB Studio + Nostalgist | Authentic retro experience |

**When in doubt, use the most powerful engine that fits.** A Kaplay platformer with proper tilemaps and particle effects beats a Canvas2D hack every time.

-----

## Architecture Patterns

### Pattern 1: QuizEngine (for quiz-type games)
- Import data from `src/game/content/`
- Pass to `QuizEngine` component
- It handles scoring, streaks, results, progress saving

### Pattern 2: Premium React Games (SpellingGame, PhonicsQuiz pattern)
- Canvas background component (animated world)
- Motion animations for UI elements
- AudioEngine for SFX + music
- GameHeader (quit dialog, hearts, progress)
- ResultsScreen (stars, stats, play again)
- Confetti on completion

### Pattern 3: Engine Games (Phaser/Kaplay/LittleJS)
- React wrapper component with ref for canvas mount
- Engine handles rendering and game logic
- Callback to React for results
- `recordGameResult()` on completion

### Pattern 4: Godot Games
- Source in `src/godot/[name]/` (.tscn, .gd, project.godot)
- Export to `public/godot/[name]/` (HTML5/WASM)
- React wrapper with iframe + postMessage bridge
- GDScript calls `JavaScriptBridge.eval()` to send results
- React listens with `window.addEventListener('message', handler)`
- Export command: `godot --headless --path src/godot/[name] --export-release "Web" public/godot/[name]/index.html`

-----

## Progress Integration

EVERY game, regardless of engine, must call `recordGameResult()`:

```typescript
recordGameResult({
  pupilId: string,
  gameId: string,       // unique, matches Home.tsx routing
  score: number,        // 0-100 percentage
  stars: number,        // 0-3 (>=30%=1, >=60%=2, >=90%=3)
  streak: number,       // current streak
  bestStreak: number,   // session best
  correct: number,      // raw correct count
  total: number,        // raw total count
});
```

For Godot games, send via postMessage:
```gdscript
JavaScriptBridge.eval("""
  window.parent.postMessage({
    type: 'godot-game-result',
    gameId: '%s', score: %d, total: %d, stars: %d,
    streak: %d, bestStreak: %d, correct: %d
  }, '*');
""" % [game_id, score, total, stars, streak, best_streak, correct])
```

-----

## Wiring Into the App

Every new game needs:
1. Game component in `src/components/games/`
2. Lazy import in `src/components/pupil/Home.tsx`
3. Entry in `QUIZ_GAMES` map (or iframe for Godot)
4. Lucide icon in `GAME_ICONS`
5. Entry in correct category in `GAME_CATEGORIES`
6. Copyright header on every file
7. Build must pass: `npm run build`

-----

## Scottish CfE Tagging

Every game must identify its curriculum alignment. See `references/cfe-curriculum.md` for outcome codes. This is not optional — it's how teachers justify using the app to their headteacher.

-----

## References

- `references/engines.md` — Detailed engine docs and capabilities
- `references/premium-components.md` — AudioEngine, Confetti, GameHeader, ResultsScreen APIs
- `references/quiz-engine.md` — QuizEngine props, content data files
- `references/cfe-curriculum.md` — Scottish CfE outcomes for all subjects
- `references/quality-gates.md` — Shipping checklist
