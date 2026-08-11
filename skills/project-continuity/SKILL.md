# Skill: project-continuity

Session start/end protocol for long-running AI-assisted projects. Trigger it with a project command like `/project-continue` ("continue where we left off").

## State files and their roles

| File | Role | Written when |
|------|------|--------------|
| `activeContext.md` | The ONE living narrative: 🎯 continue-point + rolling last-3 session blocks | **Every session end** |
| `PROGRESS.md` | Thin frame: roadmap + registry of completed phases | Only when the roadmap/registry changes |
| `plans/<topic>.md` | Single source of truth (SSOT) for one work stream: decisions, phases, status log | When that stream advances |

One owner per fact: the continue-point owns "what's next"; plan status logs are append-only completion journals; `PROGRESS.md` points at the active plan without copying volatile detail.

## Session start

1. Read `activeContext.md` (continue-point + last sessions), then `PROGRESS.md` (active phase + registry).
2. **Cross-check:** compare the active plan's status log with the continue-point and the `PROGRESS.md` active-phase line. Any contradiction → STOP and show the user instead of guessing.
3. Give a short status report, get confirmation, then work.

## Session end

Triggered by "save the session" / "switching to a new chat".

1. **Update `activeContext.md`** (the main write): rewrite the 🎯 continue-point for the next session; append a `## SESSION N (date) — title` block. Keep only the last 3 blocks inline — move older ones to `archive/sessions/<YYYY-MM>/`.
2. **`PROGRESS.md` only if its content actually changed** (a phase completed, the roadmap moved). Same for any fixed-reference doc.
3. **Append, don't flip:** when a phase finishes, append one `✅ <phase> DONE (S<N>)` line to the plan's status log. Never maintain a "NEXT: X" pointer in more than one place.
4. **Verify new references:** every file path / `function()` / endpoint written into state **this session** must be confirmed against the real code (grep/read) — no copying references from other documents.
5. **Commit + push:** review `git status` for secrets (`.env`, `config.*`, keys) → add named files only (never `add -A`) → commit as `Session N: <title>` with bullet points → push. If hooks fail, fix the cause; never `--no-verify`, never force-push.
6. Report: which pages/files changed (UI changes flagged with viewport notes), and the revert command for the session's commit.

## Extra rules

- Max ~1 main task + 1 small side task per session — long sessions produce stale summaries and unverifiable diffs.
- When heavy changes pile up and a natural break appears, *offer* to save the session; never end it unilaterally.
- Recalled state describes what was true when written — verify before relying on it.
