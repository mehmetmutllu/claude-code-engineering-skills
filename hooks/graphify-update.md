# Hook: refresh a code knowledge graph in the background (and when to remove it)

> A `PostToolUse` + `Stop` hook that rebuilds a code knowledge graph after every file edit, fully detached so the tool call returns instantly. Includes the measured reason it was later **disabled** in the large project — read that part before installing.

## What it does

- Triggered on `PostToolUse` with matcher `Edit|Write|MultiEdit`, and on `Stop`.
- Silent no-op if the graph CLI isn't installed — a hook must never break the harness.
- Repo root from `$CLAUDE_PROJECT_DIR`, falling back to `pwd`.
- Runs `<graph-cli> update .` in a detached subshell (`( … ) & disown`), output appended to `.claude/scripts/.graph.log`. AST-only refresh, no API cost.

Script: [`scripts/graph-update.sh`](scripts/graph-update.sh)

## settings.json

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write|MultiEdit",
        "hooks": [ { "type": "command", "command": "bash .claude/scripts/graph-update.sh" } ] }
    ],
    "Stop": [
      { "matcher": "",
        "hooks": [ { "type": "command", "command": "bash .claude/scripts/graph-update.sh" } ] }
    ]
  }
}
```
Add `graph-out/` and `.claude/scripts/.graph.log` to `.gitignore`.

## Why it was removed in the big project (measured)

Each `update` was a **full re-extraction (~32 s for 323 files), not incremental**. Firing on every Edit/Write and at every Stop consumed minutes per session, and the graph wasn't actually used in the daily workflow — primary discovery was Grep/Glob + state files. Decision recorded in `CLAUDE.md`:

> Automatic update OFF. If needed, run it manually. For architecture/cross-module questions the graph report may be consulted, but it can be stale — trust it only after a manual update.

**Rule of thumb:** keep this hook only if (a) the update is incremental or takes < ~2 s on your repo, and (b) you actually query the graph during work. Otherwise make it a manual command.

## Lighter alternative used elsewhere

A `Stop` hook that only *reminds*:
```json
"Stop": [{ "matcher": "", "hooks": [{ "type": "command",
  "command": "echo '[hook] reminder: if work was done this session, run the session-end command to update state'" }] }]
```
