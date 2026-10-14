# Sprint plan, sprint ledger and decision register formats

> **Problem:** Multi-session work loses track of what was promised, what actually changed and what was really tested.
>
> **Practice:** One plan file approved before the sprint; one ledger at the end with a before/after table, invisible behaviour with numbers and an honest test status; agents keep append-only notes.
>
> **Evidence:** These formats carried a 36-sprint game project (67 plan/ledger/note files) and a mobile app release.

Three document types (plus agent notes and a roadmap table) carried a 36-sprint game project and a mobile app through dozens of sessions. Each
has one job; the same fact never lives in two of them.

| Document | Job | Written | Size rule |
|---|---|---|---|
| `docs/sprints/sprint-N-plan.md` | what we will do and why | before the sprint, approved by the owner | ~40-70 lines |
| `docs/sprints/sprint-N-ledger.md` | what actually changed, what was tested, what is open | at sprint end | ~30-50 lines |
| `decisions.md` | durable decisions with reasons | when a decision is made | <= 12 lines per entry |
| `docs/sprints/sN-notes-<agent>.md` | agent's running notes / hand-off | during the sprint | append-only |
| `docs/sprints/roadmap.md` | remaining sprint rounds, gates, what's needed from the owner | when the roadmap changes | one table |

## Sprint plan

```markdown
# Sprint N - <title> · <date> (AWAITING APPROVAL)

Source: <research report / feedback file>. Owner <date>: <what they asked, one line>.
Design: <constraint, e.g. no new components - existing page shell (D-0xx)>. Copy: <who writes UI text>.

## Why
- <reason 1, e.g. store policy requires in-app reporting of AI content -> mandatory>
- <reason 2>

## Phase 1 - Server (agent S · backend)
1. <endpoint/module>: inputs, limits (from config), auth, idempotency, what is stored.
- Acceptance: <test list>; existing tests green; 2 mutations.

## Phase 2 - Client (agent U)
1. <UI piece>: where, states, empty state, copy keys.
- Acceptance: <test list>.

## Orchestrator
- Draft copy files before agents start -> copy round with the copy writer while agents work.
- Merge, run suites, 2 mutations, deploy (migration + worker), ledger. Device build only on request.

## Out of scope
<explicitly deferred items>
```

Agent table variant used for larger sprints (file ownership is the point):

| Agent | Scope | YOURS (only these) |
|---|---|---|
| M · text calls + summary | ... | `src/llm/text.ts` (new), `src/context/aiSummary.ts` (new), tests (new) |
| U · client | ... | `UI/Play/ActEnd*` (new), DTOs (append only), locale `_draft` rows |

## Sprint ledger (change log)

```markdown
# Sprint N - <title> · change ledger (<date>)

Plan `sprint-N-plan.md` · D-0xx · commit <hash> · deploy <id> + migration 000x. **Not tried on a phone** (build only).

## What the player/user will see
| Where | Before | After |
|---|---|---|
| <screen> | - | <exact behaviour + exact copy> |

## Invisible behaviour
- <limits, rate caps, caches, filters, fallbacks - with the numbers>

## Tests
<suite counts (new ones)> · mutations: <what was broken> - all caught.
Live smoke (real AI, anonymous account): <steps and observed results>.

## Device check recipe
1. <steps the owner can do on the phone in 2 minutes>

## Open
- <known gaps, observations outside the sprint>
```

Rules:
- "Before / After" table for every visible change, with exact copy.
- Invisible behaviour gets numbers (per-day caps, thresholds), not adjectives.
- Test status is honest: "tested" only when the owner tried it on a device; otherwise say where it ran.
- Observations outside the sprint go into "Open", not into code.

App variant: one running ledger per release (`docs/<release>-change-ledger.md`) with a section per sprint,
written in plain user language ("Lesson path: first the A1-A2 lessons of all 15 topics, then B1-B2").

## Decision register and session card

Durable decisions go into a numbered register (format and the guard test: [decision-registry-with-test](../memory/decision-registry-with-test.md)); the session state card follows the rules in [memory-model-evolution](../memory/memory-model-evolution.md). Commit messages `Session N: <title>` make `git log --oneline` a readable history even when the card is stale.
