/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

export { GameHeader } from './GameHeader';
export { ResultsScreen } from './ResultsScreen';
export { PremiumLevelSelect } from './LevelSelect';
export { useConfetti, ConfettiLayer } from './Confetti';
export { STANDARD_LEVELS } from './themes';
export type { ThemeState, LevelDef, GameResult } from './themes';
export {
  sfxCoin, sfxBuzz, sfxLevelUp, sfxComplete, sfxFail, sfxHeartLost, sfxClick, sfxFanfare,
  startMusic, stopMusic, updateMusic, getScale,
  THEME_FOREST, THEME_OCEAN, THEME_COSMOS, THEME_EARTH,
} from './AudioEngine';
