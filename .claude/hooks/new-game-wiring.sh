#!/bin/bash
# New Game Wiring Hook — fires on Write to components/games/
# No jq dependency.

INPUT=$(cat /dev/stdin)

# Extract tool name
TOOL=""
if [[ "$INPUT" == *'"tool_name"'* ]]; then
  TOOL=$(echo "$INPUT" | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

# Extract file_path
FILE_PATH=""
if [[ "$INPUT" == *'"file_path"'* ]]; then
  FILE_PATH=$(echo "$INPUT" | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

if [[ -z "$FILE_PATH" ]]; then
  echo '{"continue":true}'
  exit 0
fi

FILE_PATH=$(echo "$FILE_PATH" | sed 's|\\\\|/|g' | sed 's|\\|/|g')

# Only trigger on Write (new file creation) to game components
if [[ "$TOOL" != "Write" ]]; then
  echo '{"continue":true}'
  exit 0
fi

case "$FILE_PATH" in
  */components/games/*)
    ;;
  *)
    echo '{"continue":true}'
    exit 0
    ;;
esac

cat <<'EOF'
{"continue":true,"systemMessage":"NEW GAME FILE CREATED - Complete these wiring steps:\n1. Add lazy import in src/components/pupil/Home.tsx\n2. Add entry to QUIZ_GAMES map\n3. Add Lucide icon to GAME_ICONS\n4. Add to correct GAME_CATEGORIES\n5. Identify CfE outcomes from the skill CfE MAPPING TABLE\n6. Verify build passes: npm run build"}
EOF
exit 0
