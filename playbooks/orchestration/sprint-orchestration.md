# Sprint orchestration with parallel sub-agents

> **Problem:** Parallel sub-agents speed up large work packages, but they collide on files, corrupt shared state, "verify" by reading code instead of using the product, and hand the owner decisions or changes nobody approved.
>
> **Practice:** One orchestrator session keeps the plan, the shared files, the browser and the commits; each agent gets a full written brief with the files it may write; the orchestrator merges, tests sequentially, mutation-checks the new guards and closes with a change ledger.
>
> **Evidence:** Used across a mobile language-learning app, a 36-sprint game with an LLM game master (67 plan/ledger/note files, up to 8 agents in one sprint), a multi-tenant SaaS (ten data-persistence phases in one session) and a nonprofit's accounting module. After agents reported "clean", end-to-end clicks by the orchestrator still found 4 regressions.

The installable version of this playbook is the [`sprint-orchestration` skill](../../skills/sprint-orchestration/SKILL.md). Plan and ledger formats: [sprint-plan-and-ledger](sprint-plan-and-ledger.md).

## The loop

```
plan  ->  owner approves plan (once; no "shall I continue?" between phases)
      ->  design questions, one screen at a time, shown as LIVE previews  ->  owner picks
      ->  sprint: parallel agents, each owning separate files
      ->  orchestrator merges shared files, runs tests sequentially, mutation-checks
      ->  change ledger (every user-visible change)  ->  commit (per phase)
```

1. **Plan first.** A written plan file (`docs/sprints/sprint-N-plan.md`) with: why, phases, an **agent table with "YOUR files / DO NOT TOUCH"**, the shared contract, acceptance criteria, out of scope, and batched questions for the owner. Status line at the top: `(AWAITING APPROVAL)` until the owner says go.
2. **Design approval with live previews.** Any visual decision is shown as 3-4 variants side by side in a preview harness (real app copies in iframes with variant CSS injected), not described in prose. The orchestrator screenshots the variants first and checks overflow/contrast itself. Rejected variants are kept in the harness, not deleted - the owner may change their mind.
3. **Sprint.** Independent tasks go to parallel agents. Hard cap of 3 concurrent agents in the app project (usage limits); the game project went as high as 8 in one sprint when tasks were fully disjoint.
4. **Merge.** Shared files (router, `index.html`, app entry point, game turn loop) are touched ONLY by the orchestrator. Agents never edit them; they hand back an "integration recipe" in their report.
5. **Test.** The orchestrator runs test suites one after another (browser automation and Gradle/Unity are RAM-heavy; never in parallel with another heavy session).
6. **Mutation check.** After tests pass, deliberately break 2 things the sprint added (remove a cooldown, raise a cap, drop a guard) and confirm the tests catch each one, then restore. Logged in the ledger as "mutation 2/2 caught". A passing suite that cannot fail proves nothing. An escaped mutation is investigated in the **code** first, not only in the test.
7. **Change ledger**, then commit.

## Agent briefing template ("rule book")

Every agent gets the full brief; agents do not inherit the orchestrator's context.

```markdown
# Agent <letter> - <one-line task>

## Context
- Product rule in one sentence (the "simple model" section of the plan).
- Relevant decision IDs and what they say (paste the lines, don't just cite).

## Read first (exact paths)
- CLAUDE.md, plus the project's lessons on measuring gates and verifying findings
- docs/plan-x.md sections 3-5
- src/feature/existing.ts (pattern to follow)

## You may write ONLY these files
- src/feature/newModule.ts            (new)
- test/feature/newModule.test.ts      (new)
- locale/feature.json                 (add keys with _draft suffix only)

## Out of scope - do not touch
- src/app.ts, index.html, the turn loop (orchestrator merges)
- pushes, production, consoles, store dashboards, browsers unless stated
- refactors outside your files; note them in your report instead

## Tests
- Write tests next to the module. Run: <exact command>. Must be green.
- Mutation: break 2-3 key rules on purpose, confirm the tests fail, restore from a backup copy.
- Do not edit shared sentinel counts; run the sentinel and report the new number with its reason.

## Progress notes
- After every major step append a line to docs/sprints/sN-notes-<letter>.md
  (what is done, what is next). This makes a hand-off cheap.

## Report back (<=25 lines)
- Files written · commit hash (if any) · test count · mutations caught
- Integration recipe for the orchestrator (which call goes where)
- Found out of scope · needs an owner/organisation decision
- Open questions: PRODUCT decisions only. Technical edge cases you solve yourself.
```

Real progress-note example (abridged): "Modules written: config/freeplay.ts, content/freeplay.ts (12 hooks + 5 road events) ... Tests 27/27. Mutation: removing cooldown, cap 80, dropping location check - all three caught (restored from backup). HANDOFF: integration recipe in report."

"Found out of scope" items are read, not skipped: a missing feature was discovered that way and got its own agent.

## Variant: worktree isolation (larger codebase with a database)

In the SaaS project each writing agent ran with `isolation: worktree` and committed inside its own worktree; the orchestrator merged with `git cherry-pick -n <hash>`.

```
orchestrator (main session): plan, context, browser tests, commits
   ├─ agent A  (isolation: worktree)  writes + DB-less sentinel + break-it round + commits in its worktree
   ├─ agent B  (isolation: worktree)  ...
   └─ audit agents (read-only, parallel)
orchestrator: git cherry-pick -n <hash>  → all sentinels + static analysis + tenant gate
            → real clicks in the browser (desktop + 390 px, scenario tenant)
            → checklist item [a] → commit + push per phase (not at session end)
```

Extra brief rules for this variant, each one from an incident:

- **Database read-only; the agent never starts or stops the DB server.** A database server started from an agent's shell died with the agent. If the DB is down, the orchestrator starts it from its own session in the background.
- **Shared files only via Edit, appended as a labelled block.** Parallel phases change the same constants and conflict on cherry-pick; never *guess* a count, run the sentinel.
- **No browser automation in agents** (the MCP browser profile is shared); browser testing is the orchestrator's. Exception: one design-review agent.
- **Own scratch subfolder** with a phase prefix: one agent overwrote the orchestrator's helper script in the shared scratchpad.
- Commit via `git -c core.hooksPath=<hooks> commit`: worktree creation rewrote `core.hooksPath` to an **absolute** path; reset it after every merge or the commit gate reports "gates broken".

Traps (each one happened):

- Worktrees live under `.claude/worktrees/`; directory-scanning sentinels must exclude it. Remove worktrees and branches when done.
- An agent's worktree can be served by the local web server, so it can measure its own change with a scripted (non-MCP) browser - copy the git-ignored `.env` and `vendor/` into the worktree first.
- **Take baseline screenshots before merging anything** into the main tree - measurement scripts read served files; one early cherry-pick polluted 9 baselines.
- Worktree base = last **commit**: commit the merge before launching a second wave.
- Pages that call `window.print()` on load freeze the automated browser; inject `window.print = () => {}` first.
- A behaviour test that `require`s app code whose chain reaches the DB gets silently excluded by the DB-less suite; load the pure function body instead.
- Agent audits are static reading. End-to-end clicks still found 4 regressions after agents reported clean - the browser round is never skipped.
- **Agents measure order, not usability.** UX review is done separately (design skills + comparison with established apps).

## Context hygiene: hand-off note + fresh agent

Long-running agents get expensive: two agents at ~379k and ~430k tokens burned through a weekly limit twice.

- Check long background agents periodically.
- At ~200k tokens (or ~1 hour, or after reading many images) the agent writes a **HANDOFF NOTE**: done, in progress, next step, gotchas. Stop it. Start a fresh agent with only the note and the original brief.
- Stop finished agents explicitly - otherwise a background loop (polling, render watcher) wakes them up with their whole context on every notification. Read agent reports, not their transcripts.
- Look at each visual board once (<= 1600 px tall).
- Main session: close and save well before the context fills (see [session-scope-and-context-budget](session-scope-and-context-budget.md)).
- Long renders/builds start detached from the session so closing the chat does not kill them.
- Do it on your own initiative, but not for its own sake: if a hand-off would hurt quality, don't.

## What goes to the owner

- Plan, design picks, and product rules - always asked.
- Mid-sprint "shall I continue?" - never asked for batch work with a known flow; give short status lines and keep going. Still ask for out-of-scope or hard-to-reverse steps.
- Agent reports are filtered before relaying: one-sentence product rules only; scenario tables, edge cases and internal timing details are solved, not asked.
- Agent findings that would change anything beyond the brief are **presented first** with screenshots - never cherry-picked silently.
- Every user-visible change is reported item by item in the ledger, including invisible behaviour changes (defaults, thresholds, flags shipped off), with a check recipe in the user's language.

## Cross-model tasks

- UI copy in the game project is not written by Claude: each screen's strings are asked from ChatGPT (via the browser extension) while agents are working; agents use `_draft` keys meanwhile.
- Rubrics and cost strategies got a ChatGPT second opinion; where it changed the outcome, that is credited in the document.
