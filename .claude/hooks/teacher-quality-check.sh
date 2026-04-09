#!/bin/bash
# Classmates Teacher Dashboard Quality Hook — COMPREHENSIVE
# No jq dependency — uses bash string matching.

INPUT=$(cat /dev/stdin)

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

# Only check teacher component files
case "$FILE_PATH" in
  */components/teacher/*)
    ;;
  *)
    echo '{"continue":true}'
    exit 0
    ;;
esac

FULL=""
if [[ -f "$FILE_PATH" ]]; then
  FULL=$(cat "$FILE_PATH" 2>/dev/null || echo "")
fi

WARNINGS=""
BLOCKERS=""

# ========== BLOCKERS ==========

if echo "$FULL" | grep -qi "TODO\|FIXME\|placeholder\|Lorem ipsum\|STUB"; then
  BLOCKERS="${BLOCKERS}|- BLOCKER: Contains TODO/placeholder text."
fi

if echo "$FULL" | grep -q "console\.log"; then
  BLOCKERS="${BLOCKERS}|- BLOCKER: console.log found. Privacy rules forbid logging pupil data."
fi

if echo "$FULL" | grep -qi "real.name\|full.name\|date.of.birth\|DOB\|email.*pupil\|phone.*number"; then
  BLOCKERS="${BLOCKERS}|- BLOCKER: Possible PII field detected. NEVER collect real names, DOB, emails for pupils."
fi

# ========== WARNINGS ==========

if [[ -n "$FULL" ]]; then
  HEAD=$(head -6 "$FILE_PATH" 2>/dev/null || echo "")
  if ! echo "$HEAD" | grep -q "HighlandAI"; then
    WARNINGS="${WARNINGS}|- Missing HighlandAI copyright header"
  fi
fi

if echo "$FULL" | grep -qi "delete\|remove\|update\|create\|insert\|upsert"; then
  if ! echo "$FULL" | grep -q "toast\|sonner\|Sonner"; then
    WARNINGS="${WARNINGS}|- Data operations without Sonner toast. Every action needs feedback."
  fi
fi

if echo "$FULL" | grep -qi "delete\|remove\|reset.*pin"; then
  if ! echo "$FULL" | grep -q "AlertDialog"; then
    WARNINGS="${WARNINGS}|- Destructive action without Radix AlertDialog confirmation."
  fi
fi

if ! echo "$FULL" | grep -q "motion\|Motion\|AnimatePresence"; then
  WARNINGS="${WARNINGS}|- No Motion imports. Skill says do not render static pages."
fi

if echo "$FULL" | grep -q "Loading\.\.\."; then
  WARNINGS="${WARNINGS}|- Raw Loading... text. Use skeleton placeholders instead."
fi

if echo "$FULL" | grep -q "BarChart\|LineChart\|AreaChart\|PieChart"; then
  if ! echo "$FULL" | grep -q "XAxis\|YAxis\|Legend\|Tooltip"; then
    WARNINGS="${WARNINGS}|- Chart without axis labels, legend, or tooltip."
  fi
fi

if echo "$FULL" | grep -q "<input\|<select\|<textarea"; then
  if ! echo "$FULL" | grep -q "htmlFor\|aria-label\|<label"; then
    WARNINGS="${WARNINGS}|- Form inputs without labels. Accessibility requires labels."
  fi
fi

# ========== OUTPUT ==========

if [[ -n "$BLOCKERS" ]]; then
  MSG="TEACHER QUALITY GATE FAILED: ${BLOCKERS}"
  MSG=$(echo "$MSG" | sed 's/"/\\"/g')
  echo "{\"decision\":\"block\",\"reason\":\"${MSG}\",\"continue\":false}"
  exit 2
fi

if [[ -n "$WARNINGS" ]]; then
  MSG="TEACHER QUALITY WARNINGS: ${WARNINGS} | See classmates-teacher skill SHIPPING GATE."
  MSG=$(echo "$MSG" | sed 's/"/\\"/g')
  echo "{\"continue\":true,\"systemMessage\":\"${MSG}\"}"
  exit 0
fi

echo '{"continue":true}'
exit 0
