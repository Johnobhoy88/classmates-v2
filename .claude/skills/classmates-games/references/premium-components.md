# Premium Components Reference

All in `src/components/premium/`. Import via barrel: `import { GameHeader, ResultsScreen, Confetti } from '../premium'`

## AudioEngine (`AudioEngine.ts`)
- Procedural SFX using Web Audio API (zero audio files)
- SFX: sfxCoin, sfxBuzz, sfxLevelUp, sfxComplete, sfxFail, sfxHeartLost, sfxClick, sfxFanfare
- Dynamic music: arpeggio tempo scales with streak level
- Themes: THEME_FOREST (C major), THEME_OCEAN (F major)
- `updateMusic(streak)` — call to adjust tempo

## Confetti (`Confetti.tsx`)
- `useConfetti()` hook returns `{ burst }` function
- `<ConfettiLayer />` component renders falling paper
- 6 colours, configurable count
- Use on: 3-star results, perfect scores, game completion

## GameHeader (`GameHeader.tsx`)
- Radix AlertDialog quit confirmation ("Leave the forest?")
- Radix Tooltip on hearts ("X lives remaining")
- Motion animated hearts with shatter on loss
- Audio toggle button
- Word/question counter

## ResultsScreen (`ResultsScreen.tsx`)
- Spring-animated star reveal (3 stars with rotation)
- Staggered missed items list
- Play Again / Back buttons with Motion
- Props: stars, score, total, bestStreak, missed, onPlayAgain, onExit

## LevelSelect (`LevelSelect.tsx`)
- Motion slide-in level cards with gradient backgrounds
- Configurable title, subtitle, icon, levels array
- Audio toggle, back button

## themes.ts
- ThemeState interface (progress, streak, livesRatio, event)
- LevelDef interface, STANDARD_LEVELS preset
- GameResult interface
