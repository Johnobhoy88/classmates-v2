---
name: classmates-games
description: |
  Build educational games for Southlodge Classmates v2 — a Scottish primary school platform using React 19, TypeScript, and multiple game engines (Phaser, Three.js, Kaplay, LittleJS, Godot 4.4). ALWAYS use this skill when working in classmates-v2 on ANYTHING game-related: creating new games, fixing game bugs, adding features, using Phaser/Three.js/Kaplay/LittleJS/Godot, implementing QuizEngine quizzes, adding AudioEngine/Confetti/GameHeader/ResultsScreen, or aligning with Scottish CfE curriculum. Also trigger when user mentions: spelling games, maths games, times tables, word games, educational games, game polish, game audio, canvas games, 2D games, 3D games, racing games, quiz games, or any Classmates game component. If the user mentions "classmates" and "game" in any form, READ THIS SKILL FIRST.
---

# Classmates Games Skill

> Build premium-quality educational games for Scottish primary schools (P1–P7)

## ANTI-SANDBAGGING RULES — READ FIRST

These engines are **INSTALLED AND WORKING**. Do not:

- Do not suggest "simpler alternatives" when asked to use Phaser/Three.js/Godot
- Do not claim Godot can't run headless (it can: `godot --headless --export-release`)
- Do not skip premium components to "keep it simple"
- Do not suggest Canvas 2D when Phaser is requested
- Do not avoid Three.js for "performance concerns" without evidence
- Do not refuse to write Godot .tscn/.gd files

**If asked to build with an engine, BUILD WITH THAT ENGINE.**

-----

## Quick Reference

| Task | Read First |
|------|-----------|
| New quiz game | `references/quiz-engine.md` |
| New 2D game (Phaser/Kaplay/LittleJS) | `references/engines.md` |
| New 3D game (Three.js) | `references/engines.md` |
| Godot game | `references/engines.md` -> Godot section |
| Adding polish | `references/premium-components.md` |
| CfE curriculum tagging | `references/cfe-curriculum.md` |
| Quality checklist | `references/quality-gates.md` |

-----

## Platform Overview

**Repo**: `github.com/Johnobhoy88/classmates-v2` (private)
**Deploy**: https://classmates-v2.vercel.app (auto-deploy from master)
**Supabase**: `mtlzmeyppmumbsjhsagq` (eu-west-2)

### Core Stack

```
React 19.2.4 + TypeScript 6.0.2 + Vite 8.0.4
Tailwind CSS 4.2.2 + Motion (animations)
Supabase (cloud) + Dexie (offline IndexedDB)
```

### Game Engines (ALL installed)

| Engine | Use Case | Import |
|--------|----------|--------|
| **Phaser 3.90** | 2D games, sprites, physics | `import Phaser from 'phaser'` |
| **Three.js 0.183** | 3D graphics, racing games | `import * as THREE from 'three'` |
| **Kaplay** | 2D platformers, puzzles | `import kaplay from 'kaplay'` |
| **LittleJS** | Pixel art, tiny games (~10KB) | `import { engineInit } from 'littlejsengine'` |
| **Godot 4.4.1** | Complex games, HTML5 export | System binary, iframe embed |
| **Nostalgist** | Retro emulation | `import { Nostalgist } from 'nostalgist'` |

-----

## Workflow: RESEARCH -> DESIGN -> BUILD -> TEST -> REFINE -> DEPLOY

### Phase 1: RESEARCH

Before writing code:

1. **Check existing games** for patterns:
   ```bash
   ls src/components/games/
   cat src/components/games/SpellingGame.tsx  # Premium example
   cat src/components/games/SouthlodgeRacers.tsx  # Three.js example
   ```
2. **Check premium components**:
   ```bash
   ls src/components/premium/
   ```
3. **Identify CfE outcomes** — read `references/cfe-curriculum.md`
4. **Choose engine** based on game type (see `references/engines.md`)

**Gate**: Engine chosen, CfE outcomes identified

### Phase 2: DESIGN

Present to user for approval:

- Game concept and mechanics
- Visual style (match existing Classmates aesthetic)
- Content source (curriculum level, word lists, etc.)
- Premium components to use

**Gate**: User approves design

### Phase 3: BUILD

1. Scaffold the game component
2. Wire up chosen engine
3. Implement core gameplay loop
4. Add premium components (AudioEngine, Confetti, etc.)
5. Connect to ProgressTracker for XP/streaks

**Gate**: Game compiles with `npm run dev`

### Phase 4: TEST

```bash
npm run dev
# Navigate to game in browser
# Test on mobile viewport (375px width)
```

Check:

- Game loads without console errors
- Touch controls work on mobile
- Audio plays (with user gesture)
- Progress saves correctly
- Results screen shows

**Gate**: All checks pass

### Phase 5: REFINE

- Is the visual quality at premium level?
- Are animations smooth (60fps)?
- Does audio enhance the experience?
- Is feedback immediate and satisfying?

**Gate**: Meets quality bar in `references/quality-gates.md`

### Phase 6: DEPLOY

```bash
npm run lint
npm run build
git add -A
git commit -m "feat(games): add [GameName] - [CfE outcomes]"
git push origin master
# Verify at https://classmates-v2.vercel.app
```

**Gate**: Green Vercel deploy, game accessible

-----

## Game Architecture Patterns

### Pattern 1: QuizEngine Games (Fastest)

For vocabulary, spelling, maths facts — use the shared QuizEngine:

```tsx
import { QuizEngine } from '../shared/QuizEngine';

export function MyQuiz({ onExit }: { onExit: () => void }) {
  const questions = data.map(item => ({
    prompt: item.question,
    display: item.display,
    answer: item.correct,
    options: shuffle([item.correct, ...item.distractors])
  }));
  return <QuizEngine gameId="my-quiz" title="My Quiz" questions={questions} onExit={onExit} />;
}
```

See `references/quiz-engine.md` for full API.

### Pattern 2: Premium Games (React + Motion + Canvas)

For visually rich games with themed backgrounds:

```tsx
import { GameHeader, ResultsScreen, Confetti } from '../premium';
import { AudioEngine } from '../premium/AudioEngine';
```

See SpellingGame.tsx and PhonicsQuiz.tsx for working examples.

### Pattern 3: Phaser Games (2D with physics)

```tsx
import { GameShell } from '../shared/GameShell';
// Scene class extends Phaser.Scene
export function MyGame({ onExit }: { onExit: () => void }) {
  return <GameShell scene={MyScene} onExit={onExit} />;
}
```

### Pattern 4: Three.js Games (3D)

See SouthlodgeRacers.tsx — standalone React component with THREE scene, renderer, animation loop.

### Pattern 5: Godot Games (HTML5 export)

Godot projects live in `src/godot/[project-name]/` and export to `public/godot/[project-name]/`.

```tsx
// React wrapper with iframe + postMessage bridge
export default function GodotGame({ onExit }: { onExit: () => void }) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'godot-game-result') {
        recordGameResult({ ...event.data });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  return <iframe src="/godot/my-game/index.html" className="w-full h-screen" />;
}
```

Export command: `godot --headless --path src/godot/my-game --export-release "Web" public/godot/my-game/index.html`

-----

## Premium Components (ALWAYS USE)

Every game should use these from `src/components/premium/`:

| Component | Purpose | Required? |
|-----------|---------|-----------|
| `AudioEngine` | Procedural SFX + dynamic music | Yes |
| `Confetti` | Celebration particles | On wins |
| `GameHeader` | Quit dialog + tooltip hearts | Yes |
| `ResultsScreen` | Shared results with Motion | Yes |
| `themes.ts` | Game theme definitions | Yes |

See `references/premium-components.md` for full API.

-----

## Scottish CfE Curriculum

All games must tag their curriculum alignment:

```tsx
const gameMetadata = {
  level: 'first',  // early | first | second
  subject: 'literacy',
  strand: 'spelling',
  outcomes: ['LIT 1-21a'],
};
```

See `references/cfe-curriculum.md` for full outcome lists.

-----

## File Locations

```
src/
├── components/
│   ├── games/          # 32+ game files
│   ├── premium/        # Shared premium components
│   └── shared/         # QuizEngine, GameShell, LevelSelect
├── game/
│   └── content/        # 15 data files, ~1,700 lines curriculum
└── godot/              # Godot project sources
public/
└── godot/              # Exported HTML5/WASM
```

-----

## Quality Standards

Before marking a game complete:

1. **Visual**: Premium aesthetic, not placeholder
2. **Audio**: SFX for actions, music where appropriate
3. **Feedback**: Immediate response to all inputs
4. **Mobile**: Touch controls, 375px+ viewport
5. **Performance**: 60fps, <3s initial load
6. **Curriculum**: Tagged with CfE outcomes
7. **Progress**: Saves to ProgressTracker
8. **Copyright**: Header on every file (HighlandAI, CC BY-NC 4.0)

-----

## Common Pitfalls

| Problem | Solution |
|---------|----------|
| "Phaser is complex, let's use Canvas" | NO. Use Phaser as requested. |
| "Three.js is overkill" | NO. Use Three.js for 3D games. |
| Missing audio | ALWAYS add AudioEngine |
| No confetti on wins | ALWAYS add Confetti |
| Placeholder graphics | Replace before shipping |
| Desktop-only controls | Add touch support |
