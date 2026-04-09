#!/bin/bash
# Classmates Game File Quality Hook — COMPREHENSIVE
# Enforces the classmates-games skill requirements on every edit.
# No jq dependency — uses bash string matching.

INPUT=$(cat /dev/stdin)

# Extract file_path using sed
FILE_PATH=""
if [[ "$INPUT" == *'"file_path"'* ]]; then
  FILE_PATH=$(echo "$INPUT" | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

if [[ -z "$FILE_PATH" ]]; then
  echo '{"continue":true}'
  exit 0
fi

# Normalize path separators
FILE_PATH=$(echo "$FILE_PATH" | sed 's|\\\\|/|g' | sed 's|\\|/|g')

# Only check game-related files
case "$FILE_PATH" in
  */components/games/*|*/game/scenes/*|*/components/shared/Quiz*|*/components/shared/Level*|*/components/shared/GameShell*|*/components/shared/QuizWorld*)
    ;;
  *)
    echo '{"continue":true}'
    exit 0
    ;;
esac

# Read full file if it exists
FULL=""
if [[ -f "$FILE_PATH" ]]; then
  FULL=$(cat "$FILE_PATH" 2>/dev/null || echo "")
fi

WARNINGS=""
BLOCKERS=""

# ========== BLOCKERS (exit 2 — prevents the edit) ==========

# BLOCKER: No TODO/placeholder/stub text
if echo "$FULL" | grep -qi "TODO\|FIXME\|placeholder\|Coming soon\|Lorem ipsum\|STUB"; then
  BLOCKERS="${BLOCKERS}|- BLOCKER: Contains TODO/placeholder/stub text. Skill says NEVER SHIP these."
fi

# BLOCKER: No console.log in game files (production code)
if echo "$FULL" | grep -q "console\.log"; then
  BLOCKERS="${BLOCKERS}|- BLOCKER: console.log found in game file. Remove before shipping."
fi

# ========== WARNINGS ==========

# Check 1: Copyright header
if [[ -n "$FULL" ]]; then
  HEAD=$(head -6 "$FILE_PATH" 2>/dev/null || echo "")
  if ! echo "$HEAD" | grep -q "HighlandAI"; then
    WARNINGS="${WARNINGS}|- Missing HighlandAI copyright header (required on every file)"
  fi
fi

# Check 2: QuizEngine games MUST have theme prop
if [[ "$FILE_PATH" == *"/components/games/"* ]]; then
  if echo "$FULL" | grep -q "QuizEngine"; then
    if ! echo "$FULL" | grep -q "theme:"; then
      WARNINGS="${WARNINGS}|- QuizEngine game missing theme prop. Use forest (literacy), cosmos (numeracy), or earth (geography)."
    fi
  fi
fi

# Check 3: Game files need audio
if [[ "$FILE_PATH" == *"/components/games/"* ]]; then
  if ! echo "$FULL" | grep -q "QuizEngine\|sfxCoin\|sfxBuzz\|sfxCorrect\|sfxWrong\|AudioEngine\|startMusic\|sfxClick"; then
    WARNINGS="${WARNINGS}|- No audio detected. Skill requires SFX on every interaction."
  fi
fi

# Check 4: Game files need progress tracking
if [[ "$FILE_PATH" == *"/components/games/"* ]]; then
  if ! echo "$FULL" | grep -q "recordGameResult\|QuizEngine"; then
    WARNINGS="${WARNINGS}|- No recordGameResult() call found. Every game must save progress."
  fi
fi

# Check 5: Games should use Motion for animations
if [[ "$FILE_PATH" == *"/components/games/"* ]]; then
  if ! echo "$FULL" | grep -q "motion\|Motion\|AnimatePresence\|QuizEngine"; then
    WARNINGS="${WARNINGS}|- No Motion imports. Skill requires smooth transitions."
  fi
fi

# Check 6: Phaser scenes need particles and tweens
if [[ "$FILE_PATH" == *"/game/scenes/"* ]]; then
  if ! echo "$FULL" | grep -qi "particles\|emitter"; then
    WARNINGS="${WARNINGS}|- Phaser scene without particle emitters."
  fi
  if ! echo "$FULL" | grep -qi "tweens\|tween"; then
    WARNINGS="${WARNINGS}|- Phaser scene without tweens."
  fi
  if ! echo "$FULL" | grep -qi "camera.*shake\|camera.*flash"; then
    WARNINGS="${WARNINGS}|- Phaser scene without camera effects."
  fi
fi

# Check 7: LevelSelect should have theme
if echo "$FULL" | grep -q "<LevelSelect"; then
  if ! echo "$FULL" | grep -q "theme="; then
    WARNINGS="${WARNINGS}|- LevelSelect call missing theme prop."
  fi
fi

# ========== OUTPUT ==========

if [[ -n "$BLOCKERS" ]]; then
  # Format for JSON output
  MSG="GAME QUALITY GATE FAILED: ${BLOCKERS}"
  MSG=$(echo "$MSG" | sed 's/"/\\"/g')
  echo "{\"decision\":\"block\",\"reason\":\"${MSG}\",\"continue\":false}"
  exit 2
fi

if [[ -n "$WARNINGS" ]]; then
  MSG="GAME QUALITY WARNINGS: ${WARNINGS} | Fix before shipping. See classmates-games skill SHIPPING GATE."
  MSG=$(echo "$MSG" | sed 's/"/\\"/g')
  echo "{\"continue\":true,\"systemMessage\":\"${MSG}\"}"
  exit 0
fi

echo '{"continue":true}'
exit 0
