---
name: project-continuity
description: Session start/end protocol for long-running AI-assisted projects — persistent state files (activeContext.md, PROGRESS.md, memory/, archive/), rotation rules that keep the per-session read cost constant, reference verification and a safe commit routine. Use when the user says "continue where we left off", "save the session", "/devam", "/bitir", or asks to set up session memory for a project.
---

# Skill: project-continuity

English summary of the session protocol. The ready-to-use Turkish commands are in
[`commands/session/devam.md`](../../commands/session/devam.md) (start) and
[`commands/session/bitir.md`](../../commands/session/bitir.md) (end); blank state files are in [`templates/`](../../templates/).

## State files — each has ONE job

| File | Role | Written when | Limit |
|------|------|--------------|-------|
| `activeContext.md` | Live state: 🎯 continue-point + last 3 session blocks | Every session end | **200 lines** (hard) |
| `PROGRESS.md` | Roadmap + completed-phase registry | Only when a phase/roadmap changes | 150 lines |
| `memory/*.md` | Durable knowledge: decisions, protocols, architecture notes | When a durable decision appears | 150 lines per file |
| `archive/sessions/YYYY-MM.md` | Old session blocks | Automatically, during rotation | unlimited (excluded via `.claudeignore`) |
| `plans/<topic>.md` (optional) | Single source of truth for one work stream, with an append-only status log | When that stream advances | — |

**Golden rule — one owner per fact.** Volatile detail ("we are at X, next is Y") lives only in `activeContext.md`; durable decisions live only in `memory/`. Every second copy is a future stale copy.

## Session start

1. **Machine sync first** (multi-machine projects): `git fetch` + `git status`. Clean and behind → `git pull --ff-only`, then read state. Dirty / ahead / diverged → stop and ask; never auto-rebase, reset or stash. Never run secret-sync or setup scripts unprompted.
2. Read `activeContext.md` (continue-point + latest block), then only the active-phase line of `PROGRESS.md`. Open `memory/` files selectively, via its index — never in bulk. Never read `archive/`.
3. **Cross-check:** continue-point vs. active phase (vs. the plan's status log). Contradiction → stop and show both; do not pick one.
4. Report in ≤10 lines (where we are · last session · next · open warning) and wait for confirmation.

## Session end

1. Rewrite the continue-point for the *next* session (concrete: file, function, pending decision). Add a `## 🔄 SESSION N (date) — title` block (≤15 lines, with evidence such as test counts).
2. **Rotation:**
   - more than 3 blocks → move the oldest to `archive/sessions/<YYYY-MM>.md` (move, don't copy);
   - over 200 lines → shorten blocks to 15 lines; still over → move durable content to `memory/` and leave a one-line pointer;
   - a fact repeated for the **third** time is durable → move it to `memory/`;
   - a `memory/` file over 150 lines → split by topic and update the index.
3. `PROGRESS.md` only if its content changed. Plan status logs are append-only (`✅ <phase> DONE (S<N>)`); never hand-maintain a "NEXT: X" pointer.
4. **Verify new references:** every path / function / endpoint written into state this session is checked with grep/read. Never copy a reference from another document.
5. Run the tests for what changed and record the numbers.
6. Commit: secret scan of `git status` and the staged diff → add files by name (never `add -A`) → `Session N: <title>` → push. Hook fails → fix the cause, never `--no-verify`; never force-push.
7. Close with a change log of everything the user will see, plus the commit hash.

## Why the cost stays flat

A new session reads ~350 lines (activeContext ≤200 + the PROGRESS line + an index). `archive/` and `memory/` grow with the project, but the start-of-session read does not. Before this rotation existed, one project's `activeContext.md` peaked at 1,586 lines and was read in full at every start; under these rules the same file is about 100 lines. The full history and measurements: [memory-model-evolution](../../playbooks/memory/memory-model-evolution.md); for two or more developers on one repo, use [`devam-ekip`](../../commands/session/devam-ekip.md) / [`bitir-ekip`](../../commands/session/bitir-ekip.md).

## When the system breaks

- activeContext over 200 lines → rotation was skipped; rotate first, then write.
- activeContext and PROGRESS disagree → stop, show both, ask.
- A reference points at something that no longer exists → the verify-at-write rule was skipped; fix it and restate the rule.

## Extra rules

- About one main task (+ one small side task) per session; long sessions produce stale summaries and unreviewable diffs.
- When changes pile up at a natural break, *offer* to save the session; never end it unilaterally.
- Recalled state describes what was true when written — verify before relying on it.
