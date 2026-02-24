#!/bin/bash
# Ralph Round 2 — improvements-2 branch
# Usage: bash scripts/ralph/ralph2.sh [max_iterations]

set -e

MAX_ITERATIONS=10
while [[ $# -gt 0 ]]; do
  if [[ "$1" =~ ^[0-9]+$ ]]; then
    MAX_ITERATIONS="$1"
  fi
  shift
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_MD="$SCRIPT_DIR/CLAUDE2.md"

echo "Starting Ralph Round 2 — Max iterations: $MAX_ITERATIONS"

# Unset CLAUDECODE so nested claude instances are allowed
unset CLAUDECODE

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo " Ralph2 Iteration $i of $MAX_ITERATIONS"
  echo "==============================================================="

  OUTPUT=$(claude --dangerously-skip-permissions --print < "$CLAUDE_MD" 2>&1 | tee /dev/stderr) || true

  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "Ralph2 completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    exit 0
  fi

  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph2 reached max iterations ($MAX_ITERATIONS) without completing all tasks."
exit 1
