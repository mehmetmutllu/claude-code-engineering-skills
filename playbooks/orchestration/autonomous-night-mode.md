# Autonomous "night mode": safety boundaries for unattended sessions

> **Problem:** The user wants the agent to work for hours without supervision ("work until morning"). Without explicit boundaries, autonomy drifts into irreversible actions or into decisions that belong to the user.
>
> **Practice:** Start only from an approved list (or a cold-start decision matrix), never cross a fixed set of boundaries, test and commit per milestone, and leave a morning report whose open decisions carry a recommendation but are never applied.
>
> **Evidence:** Used in an e-commerce site and a 3D mobile game. The first night in the game project completed a 7/7 approved list: 5 commits pushed, unit tests 85/85, browser smoke 27/27, console errors 0, a morning report and a fresh build waiting.

The command that runs this mode is [`commands/quality/autopilot.md`](../../commands/quality/autopilot.md) (cold start, decision matrix, per-step rhythm, short start-of-run brief). This playbook adds what the two projects shared beyond the command: the boundary table, the morning report and the stop rule.

## Preconditions

- An **approved list** exists in the state file, marked as the night list. The agent starts without asking only if that list exists.
- Or: the autopilot command, whose cold start reads progress + recent sessions + decision log and **picks the next step itself**: close solvable blockers first, then the first item of the "really next" list; among options prefer *low risk, 30-90 min, testable*.

## Hard boundaries (never crossed unattended)

| Never | Why |
|---|---|
| Live payment calls, real SMTP, DNS changes, production deploy | require credentials/approval; irreversible |
| Downloading third-party code / new dependencies | the policy refuses it anyway, so it wastes time; it is an architecture decision |
| `--reset`, `DROP TABLE`, deleting or altering user data | no backup for content the agent breaks |
| Editing the agent's own permission settings | the policy is right to block it |
| Changing balance/economy numbers | **report + recommendation only**; applied only after morning approval |
| Store/publishing work | out of scope at night |
| Push (in one project) | left to the user; the other project pushed every milestone so a new window could resume |

## Rhythm per milestone (summary; full version in the command)

1. Lint the changed files; run **only the related** test spec (full regression at the end of the series).
2. Green -> commit. Red -> find the root cause, don't hide it; if unfixable, skip the commit and record a **blocker** in the state file.
3. A tool refused by the harness -> note it, find another path, don't force it.
4. Long test runs go to the background; work on independent preparation until the completion notification arrives (no sleeping, no polling).
5. Every few steps: tick the progress list, add a session block (rotation rules apply), record any new architecture decision, docs roll-up commit.
6. Keep visual changes easy to revert (a single palette/config file).
7. Avoid large JSON/log outputs in context (`tail -3`); auto-compaction is survivable because the state files are rich.

## The morning report

A file at the repo root, `NIGHT-REPORT-<date>.md`:
- What was done, **in commit order**, each with commit hash, root cause (for fixes), tests, and screenshot names (screenshots are git-ignored, local only).
- **"Morning decisions"** - open questions with the agent's recommendation (e.g. four balance options with one recommended combination), never applied.
- How to preview (dev server URL, how to restart it), and any permanent fix made to tooling along the way.
- Verification block: unit tests, build, simulation invariant, smoke, console errors, commits pushed.

## Stop rule

Context filling up -> stop at a natural boundary (see [session-scope-and-context-budget](session-scope-and-context-budget.md)). Leave the next step + acceptance numbers in the state file.
