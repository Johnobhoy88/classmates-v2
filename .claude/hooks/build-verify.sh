#!/bin/bash
# Build Verification Hook — PostToolUse on Bash
# No jq dependency.

INPUT=$(cat /dev/stdin)

# Extract command
COMMAND=""
if [[ "$INPUT" == *'"command"'* ]]; then
  COMMAND=$(echo "$INPUT" | sed 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

# Only trigger on build commands
case "$COMMAND" in
  *"npm run build"*|*"npx tsc"*|*"vite build"*)
    ;;
  *)
    echo '{"continue":true}'
    exit 0
    ;;
esac

cat <<'EOF'
{"continue":true,"systemMessage":"BUILD COMPLETED - Run through the SHIPPING GATE checklist:\n- CfE outcomes identified for all new/modified games\n- Audio on every interaction\n- Touch targets >= 44px\n- No console.log, no TODO, no placeholder text\n- recordGameResult() called on completion\n- Sonner toast on every CRUD action (teacher)\n- AlertDialog on destructive actions (teacher)\n- Motion animations on transitions\nDo NOT tell the user you are done until ALL items pass."}
EOF
exit 0
