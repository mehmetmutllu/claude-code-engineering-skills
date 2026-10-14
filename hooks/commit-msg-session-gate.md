# Hook: commit-msg gate — no product commit without a test recipe, no session record with unanswered tests

> A git `commit-msg` hook that turns the "work end → test recipe → user trial → then save" protocol into a mechanical gate. Born after the same complaint arrived twice in a row: *"you did a lot — did we test it accordingly?"* and *"we already discussed this."*

Script: [`scripts/commit-msg`](scripts/commit-msg)

## Behaviour

| Commit | Gate |
|---|---|
| `Session <N>: …` (session record) | runs the state sentinel (state ↔ SSOT plan, line budgets) **and** the closure sentinel (newest checklist block's items answered — `[x]` by user or `[a]` agent-verified) |
| changes product code (paths matching a regex) | the checklist file must contain a block heading that `HEAD` doesn't have |
| docs / state / tooling only | not involved |
| message has a line starting with `[skip-test] <reason>` | skipped, visibly |

## Design notes (each from a real failure)

- **Earliest observable boundary.** Nothing can watch the chat; the earliest thing that *can* be watched is a commit. That's why the gate opens on every product commit, not only at the session record.
- **Compare sets, not positions.** Version 1 checked "is the newest block non-empty" — delete the new block and the previous (answered) block became "newest" and the gate opened. Version 2 compared the first heading — but the file isn't strictly newest-first, so every commit was rejected. Final: *is there a heading in the index that `HEAD` doesn't have?*
- **Escape hatch at line start only** — a commit message describing `[skip-test]` used it by accident.
- **The budget sentinel must be called from here.** It existed, it failed, sessions still closed, because nothing called it.
- **One hook mechanism.** `core.hooksPath` disables `.git/hooks` (and thus the pre-commit framework). Don't run both.
- **Executable bit in the index** (`100755`), or the hook silently doesn't run on a fresh clone.
- **Per-machine install:** `git config core.hooksPath tools/git-hooks`. Worktree creation can rewrite it to an absolute path — reset after merges.
- Never bypass with `--no-verify`; fix the cause.

## Companion sentinels you need

- `smoke_state_ssot.php` — prints the derived "next phase/progress" and compares every place that repeats it; checks line budgets (whole file / continue-point / session block / archive traces). See [derived-state-not-copied](../playbooks/memory/derived-state-not-copied.md).
- `smoke_session_closure.php` — parses the checklist; newest block must be readable by the dashboard and answered; `--block-exists-only` mode for product commits.
- `smoke_commit_gates.php` — hooks present, executable, `core.hooksPath` correct, no `.pre-commit-config.yaml`. Called by the pre-commit hook and by CI.
