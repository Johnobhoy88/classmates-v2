#!/bin/bash
# Skill Enforcer Hook — PreToolUse
# Fires BEFORE editing game or teacher files.
# Reminds about mandatory skill steps before coding starts.
# No jq dependency — uses bash string matching.

INPUT=$(cat /dev/stdin)

# Extract file_path using bash pattern matching
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

# Check if this is a game file
if [[ "$FILE_PATH" == *"/components/games/"* ]] || [[ "$FILE_PATH" == *"/game/scenes/"* ]]; then
  cat <<'EOFMSG'
{"continue":true,"systemMessage":"SKILL REMINDER: You are editing a game file. The classmates-games skill requires:\n- Read references/engines.md for the engine you're using\n- Read references/premium-components.md for AudioEngine/Confetti/GameHeader/ResultsScreen APIs\n- Identify CfE outcomes from the CfE MAPPING TABLE in the skill\n- Use the FULL POWER of each engine (particles, tweens, camera effects)\n- Every interaction needs audio (sfxCoin, sfxBuzz, sfxClick, etc.)\n- Run the SHIPPING GATE checklist before telling the user you're done"}
EOFMSG
  exit 0
fi

if [[ "$FILE_PATH" == *"/components/teacher/"* ]]; then
  cat <<'EOFMSG'
{"continue":true,"systemMessage":"SKILL REMINDER: You are editing a teacher dashboard file. The classmates-teacher skill requires:\n- Read references/design-system.md for colours, typography, components\n- Use ALL of: Recharts, Motion, Radix UI, Lucide, Sonner\n- Follow PRIVACY RULES (no PII, RLS enforced, no console.log with pupil data)\n- Follow ACCESSIBILITY rules (keyboard nav, ARIA labels, WCAG AA contrast)\n- Every action needs Sonner toast feedback\n- Destructive actions need Radix AlertDialog\n- Run the SHIPPING GATE checklist before telling the user you're done"}
EOFMSG
  exit 0
fi

echo '{"continue":true}'
exit 0
