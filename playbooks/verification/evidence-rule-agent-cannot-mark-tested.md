# Evidence rule: the agent cannot write "tested" for its own measurement

> **Problem:** When the same agent writes the code, runs the checks and updates the plan, "done and tested" collapses into a self-issued stamp.
>
> **Practice:** Three states (ready / agent-verified / done); "done" is derived only from the user's action; a `commit-msg` hook enforces it.
>
> **Evidence:** A plan dashboard showed three consecutive sessions as "test: done" while their acceptance checklists had zero closed items.

## The incident

In a multi-tenant SaaS project, the plan dashboard showed three consecutive sessions as `test: done` while the acceptance checklist for those sessions had **zero** closed items. Separately, finished and user-verified sessions still displayed "awaiting your test" because the flag was flipped by hand and forgotten. Both errors came from one cause: the test state was a hand-written copy instead of a derived value.

## The three states

Every work item in the plan's session breakdown ends with a test state:

| State | Meaning | Who may write it |
|---|---|---|
| `test: ready` | The agent measured it (sentinels, browser automation); user trial pending | agent |
| `test: agent-verified` | The agent drove the real UI end to end (e.g. Playwright clicks) and marked each checklist item `[a] — agent verified DD.MM.YYYY (S<N>)` | agent |
| `test: done` | The user confirmed — via the dashboard ("all fine") or verbally (`done (verbal approval S<N>)`) | **derived from the user's action only** |

`[a]` counts as *answered* for commit gates, but stays distinct from `[x]` (user-confirmed). The dashboard may show agent-verified sessions as complete ("Tested · agent"), but the data keeps the distinction so it is always visible *who* tested.

## Making it mechanical

1. **Derive, don't flip.** The plan line's test state is computed from the checklist file (all items `[x]` → `done`). A sentinel forces the plan file to match the derivation; nobody edits the flag by hand.
2. **Commit gate.** A `commit-msg` hook rejects:
   - a session-record commit (`Session N: …`) if the newest checklist block has unanswered items;
   - **any commit that changes product code** if the checklist file has no *new* block compared to `HEAD` (compare the *set* of block headings, not the first heading — ordering in the file is not guaranteed).
   - Escape hatch: a line starting with `[skip-test] <reason>` — visible in history, so "why was this saved untested?" is always answerable. Only match it at line start: an early version matched anywhere, and the commit message *describing* the escape hatch accidentally used it.
3. **Seal.** A finished line gets `✅` and a session seal `(S<N>)`; a sentinel rejects finished lines without a seal.

## Honest answers to "do I need to test this?"

The agent answers in two lists: *what I verified* and *what I could not verify*. "Everything works" is banned. If user testing is needed, the scenario data is prepared in the same session (see `user-acceptance-handoff.md`).

## Variant: autonomous sprints

When the user explicitly delegates testing ("you test, I'll accept at sprint end"), the flow becomes: measure → mark `[a]` → commit + push → continue to the next phase **without waiting**. Acceptance happens in bulk at the sprint boundary. The `done` state is still reserved for the user.

## Portable rule text (for a CLAUDE.md)

```
| Never write "tested/done" for your own measurement. | "done" is derived only from user approval. Your own checks = "ready" or "agent-verified". |
```
