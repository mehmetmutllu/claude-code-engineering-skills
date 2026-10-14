# Session state for two (or more) developers: `state/<dev>/`

> **Problem:** The single-developer continuity pattern breaks when a second developer joins: both rewrite the same state file and every push conflicts.
>
> **Practice:** Per-developer `state/<dev>/` folders, `hostname` as identity, per-developer seals instead of a global counter, hard line budgets enforced by a commit hook, a local pre-push guard for `main`.
>
> **Evidence:** Designed from a measured failure: a 1,586-line state file, 74% of which was not "the last 3 sessions".

This layout was designed for a two-developer SaaS repo, explicitly inheriting the lessons of a 500-session single-developer project ("most expensive lesson: if both sides write the state file, every push conflicts").

## Layout

```
state/
├── <dev-a>/activeContext.md     ← only dev-a writes here
└── <dev-b>/activeContext.md     ← only dev-b writes here
plans/
├── REGISTRY.md                  ← every plan + class + owner
├── <slug>/plan.md               ← SSOT of a work stream; only its owner edits
├── kontrol/<dev>.md             ← per-developer test recipes (user language) → no conflicts
├── notes.md                     ← the user's free notes (append only)
└── requests.md                  ← "please change X in your plan/file" between developers
context/
├── team.md                      ← ownership table, branch model, seal prefixes
├── machines.md                  ← hostname → machine → developer
└── decisions.md                 ← binding decisions (see decision-registry playbook)
```

## Identity: hostname, nothing else

At session start: run `hostname` → look it up in `context/machines.md` → that gives the developer code → read `state/<code>/`. **Unknown hostname = ask the user; never guess.** Folder hints (which install directory exists) were proven misleading — both machines had both directories; one session believed it was on the wrong machine and nearly synced in the wrong direction.

## Seals instead of a global counter

Each developer has a prefix: `M1, M2…` and `H1, H2…`. Joint work: `(M12+H5)`. No coordination needed — `M12` and `H5` never collide, and the author is readable from the seal.

**Seal ≠ ownership** — two different questions that look alike:

| | Question | Lives in | Example |
|---|---|---|---|
| Seal | *When and on whose watch did this happen?* | plan lines, session records | `✅ Z-F1 DONE (M3)` |
| Ownership | *Who will do this?* | `plans/REGISTRY.md`, `context/team.md` | `Owner: dev-a` |

A seal is history and never changes; ownership is a plan and can be renegotiated. Plan "line letters" (Line A, Line B) name *plans*, not developers — choose developer prefixes that can't be confused with them.

## Ownership table (excerpt)

| Path | Owner | Rule |
|---|---|---|
| `state/<code>/` | that developer only | never write the other side's file |
| `PROGRESS.md` | shared | only on roadmap/registry change; request via `requests.md` |
| `plans/REGISTRY.md` | shared | add your own line; don't edit others' |
| `plans/<slug>/plan.md` | registry owner | others request changes |
| `CLAUDE.md`, `AGENTS.md`, `context/*` | shared | change via PR so the other side sees it |

## Branches and pushes

- `main` protected; work on `<dev>/<plan-slug>/<short-name>`; merge by PR with green CI.
- Free private repos had no server-side branch protection → a local `pre-push` hook rejects pushes to `main` (see [pre-push-protect-main](../../hooks/pre-push-protect-main.md)). When server protection is bought, **keep the hook** — two gates back each other up.
- First command after cloning: `git config core.hooksPath .githooks` (lives in `.git/config`, does not travel with the repo). Put it in the onboarding doc as step 0.
- `git pull --rebase` before every push; never force-push; never `--no-verify`. Two developers don't push a session-end at the same moment — a one-line "saving now" message is enough.

## Hard budgets (carried over from the measured failure)

The source project's state file had grown to **1,586 lines, 74% of which were not "the last 3 sessions"**: 233 archive stubs (~700 lines), a never-pruned continue-point of 474 lines.

| File / section | Limit | If exceeded |
|---|---|---|
| `state/<code>/activeContext.md` total | 400 lines | session cannot close until pruned |
| continue-point section | 60 lines | excess moves to archive |
| one session block | 40 lines | long narrative goes straight to an archive file; 3-line summary + pointer stays |
| archive traces | **one line per month** | widen the month's range, never add a line |

```
> 📦 Archive — 2026-08: M1-M9 → archive/sessions/2026-08.md
```
Enforced by the session-record commit hook (state sentinel). When a phase closes, its "carried-over items" leave the continue-point too.

## Onboarding the second developer

A welcome file in the repo (`WELCOME.md`) that **points, never copies**: where protocol, constraints, ownership, setup traps, decisions and plans live — and the two setup lines that, if skipped, cost days (hooks path, local env file via a secure channel). Machine table rows are filled when setup actually happens on that machine (`hostname` captured then), not asked in advance.
