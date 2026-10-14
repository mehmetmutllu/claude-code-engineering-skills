# How the project-memory model evolved: from "memory bank" to rule table + rotation

> **Problem:** Every AI-assisted project needs memory across sessions. Every memory format that is append-only eventually becomes an archive that is re-read at every session start: slow, expensive, and worse for quality.
>
> **Practice:** Each state file has exactly one job and a hard line budget; a rolling window of 3 session blocks with rotation into an ignored archive; durable decisions in topic files read selectively via an index; the same fact never lives in two files.
>
> **Evidence:** In a game project the state file reached 4,219 lines while the real "now" was 106 lines; ~100-170k tokens were loaded before work started where ~10k were needed. In the SaaS project the state file peaked at 1,586 lines; with 500+ numbered sessions it is about 100 lines today.

This is the observed evolution across ~10 projects over 18 months, with the measurements that forced each step. The installable protocol is the [`project-continuity` skill](../../skills/project-continuity/SKILL.md) plus the [`/devam`](../../commands/session/devam.md) and [`/bitir`](../../commands/session/bitir.md) commands; blank files are in [`templates/`](../../templates/).

## The failure modes it prevents

1. **The blank-session tax.** Without state files, every session spends its opening tokens re-discovering the project and re-asking settled questions. With a continue-point, the assistant is productive in the first minute, and the human gets a status report for free.
2. **Stale pointers.** The most dangerous state is state that is *almost* right. One owner per fact, and append-only status logs instead of hand-maintained "NEXT:" pointers (see [derived-state-not-copied](derived-state-not-copied.md)).
3. **Reference drift.** Docs cite files and functions that no longer exist. A code reference is written into state only after being verified against the code *at write time*, never copied from another document.
4. **Duplicated logic silently diverging.** Keep a [twin registry](twin-registry.md).
5. **Unverified "done".** Sessions end with evidence: test counts, screenshots, verification scripts (see [evidence-rule-agent-cannot-mark-tested](../verification/evidence-rule-agent-cannot-mark-tested.md)).

## Generation 1 - one "context" folder, loaded every time

`.context/ACTIVE.md` + `index.md` + `phases/` + `sessions/` + `decisions.md`, with trigger words (`<project>-continue`, `-status`, `-archive`, `-phase`). `CLAUDE.md` says: read ACTIVE first, never ask "where were we?". Works for a few dozen sessions.

## Generation 2 - the classic "memory bank"

`projectbrief.md` (purpose + **invariant rules**) · `activeContext.md` · `progress.md` · `decisions.md`, plus a `<project>-continue` and `<project>-save` command pair. The continue command reads all four, cross-checks `git log -10` against `activeContext` ("commit exists but md not updated -> tell the user first"), gives a 3-5 sentence status and asks for approval.

A variant used three files (`progress.md`, `activecontext.md` = last 5 sessions, `decisions.md` = ADRs) and recorded the choice itself as an ADR: *"cold start of 3 small files ≈ 6-8K tokens; cost: discipline - if the save command isn't run, context goes stale."*

## The failure it ran into (measured, game project)

After ~4 months:
- `activeContext.md`: **4,219 lines / 349 KB**, containing **96 stacked "## NOW" blocks**; +4,906 / -632 lines over its history (13% deletions, so effectively append-only), growing ~200 lines per session.
- The real "now" was the first 106 lines = **7.3 KB (~2.3k tokens)**. The continue skill said "read in order": the Read tool loaded ~140 KB (2,000-line cap), and `progress.md` added 187 KB. **~100-170k tokens loaded before work started; ~10k needed.**
- The same finding was written in **5 places** (report, decision, progress, activeContext, dashboard card): 9 of 11 key numbers appeared in all four Markdown files.

Same pattern in the SaaS project: state file at 1,586 lines, a 474-line continue-point, 233 archive stubs (~860 lines).

## Generation 3 - roles, rolling window, hard budgets

1. **Each file has exactly one job:**
   - `activeContext.md` - the only live narrative: continue-point + last **3** session blocks.
   - `PROGRESS.md` - thin frame + phase registry; written only when the roadmap changes, **not every session**.
   - a fixed reference file (workspace, ports, logins) - rarely.
   - SSOT plans - own "what's next" (see [derived-state-not-copied](derived-state-not-copied.md)).
2. **Rolling-3:** the 4th block moves to `archive/sessions/<YYYY-MM>/`; `archive/` is in `.claudeignore`.
3. **Hard budgets enforced by the session-record hook:** whole file ≤ 400 lines · continue-point ≤ 60 · session block ≤ 40 · archive traces **one line per month** (an `archive/sessions/INDEX.md` table of month -> session range replaced 151 trace lines). Hook: [commit-msg-session-gate](../../hooks/commit-msg-session-gate.md).
4. **Turn card (game project):** `activeContext.md` became a card **overwritten** each session (≤ 80 lines: question · arms to measure · numbers · decision · implementation · guard). `git log -p activeContext.md` *is* the history - the 96 blocks had been a bad imitation of it. Start-of-session read set capped at **≤ 15 KB** (measured). See [variant-gate-measure-before-change](../verification/variant-gate-measure-before-change.md).
5. **Each fact in one place:** numbers -> `docs/<topic>-report-<phase>.md`; decision ≤ 12 lines -> decision log; status -> 1-2 lines in progress; "now" -> the card; narrative -> nowhere a second time; history -> git + archive.

## Generation 4 (current) - rule table + rotation + topic memory

`CLAUDE.md` is a short reference with a **file-role table** (role · when written · line limit) and a **"golden rule": the same information never lives in two files** - volatile detail only in `activeContext.md`, permanent decisions only in `memory/`.

- `activeContext.md` ≤ **200 lines** (hard), max 3 session blocks.
- `memory/*.md` topic files (decisions-product, decisions-infra, session protocol, machine sync...) ≤ 150 lines each; read **selectively via an index**, never all at once.
- **Rotation at every session end:** 4th block -> `archive/sessions/<YYYY-MM>.md`; over 200 lines -> shorten each block to 15 lines, then move permanent knowledge to `memory/` leaving a one-line pointer; **information repeated a third time belongs in `memory/`**; a memory file over 150 lines is split by topic.
- "If you see a rule violation (e.g. state file over 200 lines), rotate first, then write."

The read cost at session start stays around 350 lines (activeContext ≤ 200 + the active PROGRESS line + an index) however large the project grows. For two or more developers on one repo, see [multi-developer-session-state](multi-developer-session-state.md).

## Two memory systems, two jobs

| System | Holds | Properties |
|---|---|---|
| Agent auto-memory (`~/.claude/projects/.../memory/`) | *how we work*: preferences, principles, rejected ideas, lessons (`feedback_*`) | auto-loaded index, machine-local, not in git |
| Repo memory (`memory-bank/`, `activeContext.md`, `memory/`) | *where the project is*: state, decisions, phases | in git, must be identical on every machine |

Never put project *state* in auto-memory (it's machine-local); never copy preferences into the repo memory. The auto-memory index is one line per entry - in one project it hit 22.7 KB, close to the ~24 KB read limit beyond which pointers silently stop loading, so it was shortened and given a "one line per record" header. Keeping auto-memory in sync between two machines: [session-sync-two-machines](../../hooks/session-sync-two-machines.md).

## Why files, not a memory feature

- Files are **versioned with the code** - state and code can't drift apart in git history.
- Files are **reviewable** - the human can read and redline the same context the AI uses.
- Files are **portable** - any AI tool, or any human, can pick the project up.

## What stayed constant through all generations

Verify references at write time · append-only status logs · commit + push at session end · the continue command is read-only (except marking `▶`).
