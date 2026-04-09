---
name: classmates-games
description: |
  Build educational games for Southlodge Classmates v2 — a Scottish primary school platform using React 19, TypeScript, and multiple game engines (Phaser, Three.js, Kaplay, LittleJS, Godot 4.4). ALWAYS use this skill when working in classmates-v2 on ANYTHING game-related: creating new games, fixing game bugs, adding features, using Phaser/Three.js/Kaplay/LittleJS/Godot, implementing QuizEngine quizzes, adding AudioEngine/Confetti/GameHeader/ResultsScreen, or aligning with Scottish CfE curriculum. Also trigger when user mentions: spelling games, maths games, times tables, word games, educational games, game polish, game audio, canvas games, 2D games, 3D games, racing games, quiz games, or any Classmates game component. If the user mentions "classmates" and "game" in any form, READ THIS SKILL FIRST.
---

# Classmates Games Skill

> These children deserve games as good as anything on the App Store. Build to that standard.

## BEFORE YOU WRITE ANY CODE

This is a blocking requirement. You MUST complete these steps before writing a single line:

**STEP 1:** Read the engine reference for any engine you'll use: `references/engines.md`
**STEP 2:** Read the premium components API if using QuizEngine, AudioEngine, Confetti, GameHeader, or ResultsScreen: `references/premium-components.md`
**STEP 3:** If building a quiz game, read `references/quiz-engine.md`
**STEP 4:** Identify the CfE outcomes for the game from the CfE MAPPING TABLE below
**STEP 5:** Review the SHIPPING GATE checklist at the bottom — you will need to pass every item

If you skip these steps, you WILL miss requirements and waste the user's time. Do them now.

-----

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
| Quiz with visual theme | React + Motion + Phaser bg | Premium look, PhonicsQuiz pattern |
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
- Pass to `QuizEngine` component with `theme` prop ('forest' | 'cosmos' | 'earth')
- QuizEngine provides: Phaser background, Motion animations, AudioEngine, Confetti, GameHeader, ResultsScreen
- Literacy games use `theme: 'forest'`, numeracy use `theme: 'cosmos'`, geography use `theme: 'earth'`

### Pattern 2: Premium React Games (SpellingGame, PhonicsQuiz pattern)
- Canvas/Phaser background component (animated world)
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

-----

## Wiring Into the App

Every new game needs:
1. Game component in `src/components/games/`
2. Lazy import in `src/components/pupil/Home.tsx`
3. Entry in `QUIZ_GAMES` map (or iframe for Godot)
4. Lucide icon in `GAME_ICONS`
5. Entry in correct category in `GAME_CATEGORIES`
6. Copyright header on every file
7. CfE outcome codes identified (see below)
8. Build must pass: `npm run build`

-----

## SCOTTISH CfE CURRICULUM MAPPING (MANDATORY)

This is NOT optional. Every game must have its CfE outcomes identified. Teachers use this to justify the app to their headteacher.

### CfE Levels

| Level | Stages | Ages |
|-------|--------|------|
| Early | P1 | 4-5 |
| First | P2-P4 | 5-8 |
| Second | P5-P7 | 8-12 |

### Outcome Codes

**Literacy & English:**
- LIT 1-02a: Listening and talking
- LIT 1-07a: Finding and using information
- LIT 1-11a: Creating texts
- LIT 1-13a: Spelling (knowledge of spelling patterns)
- LIT 1-21a: Reading (word recognition, phonics)
- ENG 1-12a: Grammar and punctuation
- ENG 1-17a: Vocabulary

**Numeracy & Mathematics:**
- MNU 1-01a: Number and number processes (counting, ordering)
- MNU 1-02a: Addition and subtraction
- MNU 1-03a: Multiplication and division
- MNU 1-07a: Fractions, decimals, percentages
- MNU 1-09a: Money
- MNU 1-10a: Time
- MTH 1-06a: Number patterns and sequences
- MTH 1-13a: Measurement
- MTH 1-16a: 2D shapes and 3D objects

**Social Studies:**
- SOC 1-12a: People, place, environment (geography)
- SOC 1-14a: People, past events, societies (history)

### Game-to-CfE Mapping

| Game | CfE Outcomes |
|------|-------------|
| Spelling | LIT 1-13a, LIT 1-21a |
| Phonics | LIT 1-21a |
| Grammar | ENG 1-12a |
| Vocabulary | ENG 1-17a |
| Rhyming | LIT 1-21a |
| Punctuation | ENG 1-12a |
| Word Families | LIT 1-13a |
| Dictation | LIT 1-02a, LIT 1-13a |
| Missing Vowels | LIT 1-13a |
| Anagrams | LIT 1-13a |
| Sentences | LIT 1-11a, ENG 1-12a |
| Reading | LIT 1-07a, LIT 1-21a |
| Maths | MNU 1-02a, MNU 1-03a |
| Number Bonds | MNU 1-02a |
| Times Tables | MNU 1-03a |
| Fractions | MNU 1-07a |
| Money | MNU 1-09a |
| Telling Time | MNU 1-10a |
| Place Value | MNU 1-01a |
| Missing Number | MNU 1-02a |
| Shapes | MTH 1-16a |
| Measurement | MTH 1-13a |
| Word Problems | MNU 1-02a, MNU 1-03a |
| Speed Maths | MNU 1-02a, MNU 1-03a |
| Data Handling | MNU 1-01a |
| Sequences | MTH 1-06a |
| Capitals | SOC 1-12a |
| Continents | SOC 1-12a |
| Weather | SOC 1-12a |
| Compass | SOC 1-12a |
| Flags | SOC 1-12a |
| Scotland Quiz | SOC 1-12a, SOC 1-14a |

When building a new game, identify which outcomes it covers and add the CfE metadata.

-----

## SHIPPING GATE (MANDATORY)

You are NOT done until EVERY item below passes. Do NOT tell the user the work is complete until you have verified each one. Run through this checklist explicitly before finishing.

### Functional
- [ ] Game loads without console errors
- [ ] All questions display correctly
- [ ] Correct/wrong answer detection works
- [ ] Score tallies correctly
- [ ] Stars calculated: >=30%=1, >=60%=2, >=90%=3
- [ ] recordGameResult() called on completion
- [ ] Results appear in Dexie (check IndexedDB)

### Visual
- [ ] Premium aesthetic (not plain HTML buttons)
- [ ] Consistent with Classmates design language
- [ ] Animations are smooth (Motion for React, tweens for Phaser)
- [ ] No placeholder text or lorem ipsum
- [ ] Copyright header on every file

### Audio
- [ ] AudioEngine imported and initialised
- [ ] SFX plays on correct answer
- [ ] SFX plays on wrong answer
- [ ] Streak SFX at milestones (3, 5, 10)
- [ ] Completion fanfare
- [ ] Audio respects mute toggle

### Mobile
- [ ] Touch controls work (tap, swipe as needed)
- [ ] Layout fits 375px width minimum
- [ ] Buttons/targets are at least 44px tap area
- [ ] No mouse-only interactions
- [ ] No hover-dependent UI

### Performance
- [ ] 60fps during gameplay
- [ ] Initial load <3 seconds (excluding WASM)
- [ ] No memory leaks (timers cleaned up in useEffect returns)
- [ ] Code-split (lazy loaded, not in initial bundle)

### Curriculum
- [ ] CfE level tagged (early/first/second)
- [ ] CfE outcomes identified from mapping table above
- [ ] Content appropriate for target age group
- [ ] Scottish context where relevant

### Integration
- [ ] Added to Home.tsx QUIZ_GAMES or loaded via iframe
- [ ] Lazy import in Home.tsx
- [ ] Icon assigned in GAME_ICONS (Lucide)
- [ ] Added to correct category (Literacy/Numeracy/Geography/Challenge)
- [ ] Build passes: `npm run build`

-----

## References (optional lookup)

These files have detailed API docs you can look up as needed:
- `references/engines.md` — Engine versions, patterns, examples
- `references/premium-components.md` — AudioEngine, Confetti, GameHeader, ResultsScreen, LevelSelect APIs
- `references/quiz-engine.md` — QuizEngine props, scoring, content data files
