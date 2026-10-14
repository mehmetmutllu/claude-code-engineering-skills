# Hook: SessionStart / SessionEnd sync of agent memory between two machines

> The agent's auto-memory folder (`~/.claude/projects/<project>/memory/`) is machine-local and not in git. When the same project is worked on from a laptop and a desktop, preferences learned on one machine are missing on the other. Manual "collect/install" scripts were forgotten — memory on one machine was **six weeks stale** before this hook existed.

## Design (as used)

`settings.json` (user level, installed once per machine by an install script — settings files themselves are not synced):

```json
{
  "hooks": {
    "SessionStart": [
      { "matcher": "startup|clear",
        "hooks": [ { "type": "command", "command": "<sync-script> pull", "timeout": 90 } ] }
    ],
    "SessionEnd": [
      { "hooks": [ { "type": "command", "command": "<sync-script> push", "timeout": 15 } ] }
    ]
  }
}
```

**pull (session start):** update the private sync repo → copy memory files to local (**newer wins, nothing deleted**) → merge the `MEMORY.md` indexes → copy any missing machine-specific files (e.g. app signing files) → `git pull --ff-only` in the project.

**push (session end):** re-launch itself in the background (the hook timeout is short) → copy memory to the sync repo → commit + push → if the *project* has committed-but-unpushed commits, push them. **Uncommitted code is never auto-committed.**

## Rules that matter

- **No deletions, newer wins** (`robocopy /E /XO` semantics on Windows; `rsync -u` elsewhere). A sync that can delete will one day delete the wrong side.
- **Index merge by identity:** `MEMORY.md` is the union of both indexes; a line's identity is its `(file.md)` link. Lines are never removed by sync.
- **One lock:** `/clear` closes the old session and opens a new one, so pull and push can run at the same time.
- **Log to a temp file**, never to the console of the session.
- The hook reads the project directory from the JSON on stdin and forwards it to the background copy.
- **The sync repo is private and is never named in project files** (projects may become public). Project docs say "secret-file sync" at most.
- The session-end protocol still commits and pushes; if the terminal is force-closed, `SessionEnd` may not fire.

## Minimal sketch (bash, illustrative)

```bash
#!/usr/bin/env bash
# usage: session-sync.sh pull|push   (stdin: hook JSON with "cwd")
set -u
MODE="$1"; SYNC_REPO="${SYNC_REPO:?}"; LOG="${TMPDIR:-/tmp}/session-sync.log"
PROJ=$(python3 -c 'import json,sys;print(json.load(sys.stdin).get("cwd",""))' 2>/dev/null || pwd)
MEM_LOCAL="$HOME/.claude/projects/$(echo "$PROJ" | sed 's#[:/\\ ]#-#g')/memory"
MEM_REMOTE="$SYNC_REPO/memory/$(basename "$PROJ")"
exec 9>"${TMPDIR:-/tmp}/session-sync.lock"; flock -w 30 9 || exit 0
log(){ printf '%s [%s] %s\n' "$(date '+%F %T')" "$MODE" "$*" >>"$LOG"; }
case "$MODE" in
  pull)
    git -C "$SYNC_REPO" pull --ff-only >>"$LOG" 2>&1
    mkdir -p "$MEM_LOCAL"; rsync -a -u --exclude MEMORY.md "$MEM_REMOTE/" "$MEM_LOCAL/" >>"$LOG" 2>&1
    # merge indexes: union of lines, identity = (file.md) link
    cat "$MEM_LOCAL/MEMORY.md" "$MEM_REMOTE/MEMORY.md" 2>/dev/null \
      | awk 'match($0,/\(([^)]+\.md)\)/,m){ if(!seen[m[1]]++) print; next } { if(!seen[$0]++) print }' \
      > "$MEM_LOCAL/MEMORY.md.new" && mv "$MEM_LOCAL/MEMORY.md.new" "$MEM_LOCAL/MEMORY.md"
    git -C "$PROJ" pull --ff-only >>"$LOG" 2>&1 || log "project pull skipped (dirty/diverged)"
    ;;
  push)
    ( mkdir -p "$MEM_REMOTE"; rsync -a -u "$MEM_LOCAL/" "$MEM_REMOTE/"
      git -C "$SYNC_REPO" add memory/ && git -C "$SYNC_REPO" commit -qm "memory sync" && git -C "$SYNC_REPO" push -q
      [ -n "$(git -C "$PROJ" log @{u}.. --oneline 2>/dev/null)" ] && git -C "$PROJ" push -q
    ) >>"$LOG" 2>&1 & disown ;;
esac
exit 0
```
(The sketch uses GNU `awk`'s `match(..., arr)`; adapt for your platform. On Windows the original was a PowerShell script.)

## Related

What travels where between the two machines, `hostname` as machine identity, and the rule never to auto-run a restore script: [two-machine-sync](../playbooks/memory/two-machine-sync.md).
