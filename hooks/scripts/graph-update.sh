#!/usr/bin/env bash
# Hook wrapper: refresh the code knowledge graph in the background.
# Triggered by:
#   - PostToolUse Edit|Write|MultiEdit (after every file change)
#   - Stop (when the turn ends)
#
# Runs detached so the parent tool call returns immediately.
# Output suppressed; errors logged to .claude/scripts/.graph.log.
#
# WARNING: if your graph tool does a full re-extraction on every update,
# measure it first (see graphify-update.md) — at ~30 s per run this hook
# costs minutes per session.

set -e

# Name of the graph CLI on PATH (override with GRAPH_CLI=/path/to/cli).
GRAPH_CLI="${GRAPH_CLI:-graphify}"

if ! command -v "$GRAPH_CLI" >/dev/null 2>&1 && [ ! -f "$GRAPH_CLI" ]; then
  # Not installed — silent no-op so hooks never break the harness.
  exit 0
fi

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOG_DIR="$REPO_ROOT/.claude/scripts"
LOG_FILE="$LOG_DIR/.graph.log"
mkdir -p "$LOG_DIR"

# Detached subshell — the tool call returns instantly.
(
  cd "$REPO_ROOT" || exit 0
  "$GRAPH_CLI" update . >> "$LOG_FILE" 2>&1
) &
disown 2>/dev/null || true

exit 0
