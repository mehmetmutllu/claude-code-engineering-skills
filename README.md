# Claude Code Engineering Skills

**The process I use to build software with [Claude Code](https://claude.com/claude-code): session memory that doesn't bloat, sprints with parallel sub-agents, gates that are measured before they're trusted, and evidence before "done".**

I build and maintain about ten projects with Claude Code as my day-to-day development tool: a multi-tenant SaaS (500+ numbered sessions), a two-developer SaaS, a mobile language-learning app going through Google Play and App Store release, an e-commerce site, a 3D mobile game, a game with an LLM game master, a nonprofit site with an accounting module, and a YouTube documentary pipeline. Architecture, data, security and product decisions stay with me; the agent writes, measures and reports. Everything here was extracted from those projects and made generic: playbooks (the practice and the incident behind it), slash commands, skills, hooks and small tools. Playbooks and this README are in English; most commands and some skills are in **Turkish**, the language I work in.

## Start here

1. [**A gate you don't measure is a gate you don't have**](playbooks/verification/gates-must-be-measured.md) - seven gates (hooks, CI jobs, sentinels) that printed green while protecting nothing, and the method that catches them.
2. [**Sprint orchestration with parallel sub-agents**](playbooks/orchestration/sprint-orchestration.md) - plan, file ownership per agent, merge, sequential tests, mutation checks, change ledger.
3. [**How the project-memory model evolved**](playbooks/memory/memory-model-evolution.md) - from a 4,219-line state file to a rotated 200-line one, with the measurements behind each step.

## How the system fits together

```
            CLAUDE.md (short reference + hard rules)       memory/ (durable decisions, read via index)
                         │                                              ▲
 /devam ──► git sync ──► read activeContext + PROGRESS line ──► cross-check ──► ≤10-line report ──► approval
                                                                                                     │
          ┌──────────────────────────────────────────────────────────────────────────────────────────┘
          ▼
   plan file (approved once) ──► sprint: orchestrator + parallel agents (own files / worktrees)
          │                              │
          │                              ▼
          │                 merge ─► tests one by one ─► mutation check ─► real browser clicks
          │                              │
          ▼                              ▼
   decision register            gates: pre-commit · commit-msg · pre-push · CI (each one broken once on purpose)
                                         │
                                         ▼
                 work end: test recipe in user language ─► user trial ─► "done" derived from the user only
                                         │
                                         ▼
 /bitir ──► continue-point ─► session block ─► ROTATE (3 blocks, ≤200 lines) ─► verify new references
            ─► secret scan ─► files added by name ─► "Session N: title" ─► push ─► change log
```

## Contents

### Playbooks

| Area | Playbook | One line |
|---|---|---|
| Orchestration | [sprint-orchestration](playbooks/orchestration/sprint-orchestration.md) | Orchestrator + parallel agents, brief template, worktree variant, context hand-offs |
| | [sprint-plan-and-ledger](playbooks/orchestration/sprint-plan-and-ledger.md) | Plan before, ledger after: before/after table, invisible behaviour, honest test status |
| | [autonomous-night-mode](playbooks/orchestration/autonomous-night-mode.md) | Hard boundaries for unattended sessions and the morning report |
| | [decision-surfaces](playbooks/orchestration/decision-surfaces.md) | What to ask the user, what to decide, how to show options |
| | [session-scope-and-context-budget](playbooks/orchestration/session-scope-and-context-budget.md) | One main task per session; save at ~50% context |
| | [working-preferences](playbooks/orchestration/working-preferences.md) | Standing rules for an owner who directs but doesn't review code |
| Memory | [memory-model-evolution](playbooks/memory/memory-model-evolution.md) | Four generations of session memory, measured |
| | [derived-state-not-copied](playbooks/memory/derived-state-not-copied.md) | "What's next" has one owner; append-only status logs |
| | [decision-registry-with-test](playbooks/memory/decision-registry-with-test.md) | ADRs and numbered decisions, plus a test that guards the registry |
| | [twin-registry](playbooks/memory/twin-registry.md) | Logic that lives in two places, tracked until it lives in one |
| | [multi-developer-session-state](playbooks/memory/multi-developer-session-state.md) | `state/<dev>/`, hostname identity, seals, hard budgets |
| | [two-machine-sync](playbooks/memory/two-machine-sync.md) | Laptop + desktop: what travels via git, what never does |
| Verification | [gates-must-be-measured](playbooks/verification/gates-must-be-measured.md) | Break every gate once; canaries; "could not measure" ≠ green |
| | [evidence-rule-agent-cannot-mark-tested](playbooks/verification/evidence-rule-agent-cannot-mark-tested.md) | ready / agent-verified / done, and only the user makes "done" |
| | [user-acceptance-handoff](playbooks/verification/user-acceptance-handoff.md) | Work end ≠ session end; hand-executed test recipes in user language |
| | [verify-tool-findings](playbooks/verification/verify-tool-findings.md) | Reproduce a finding and its rationale before fixing it |
| | [visual-fix-verification](playbooks/verification/visual-fix-verification.md) | Measure the right box; negative-control the probe |
| | [single-severity-scale](playbooks/verification/single-severity-scale.md) | One severity vocabulary, confidence on a separate axis |
| | [idor-runtime-test](playbooks/verification/idor-runtime-test.md) | Tenant isolation in three layers: scanner, runtime test, structural RLS test |
| | [variant-gate-measure-before-change](playbooks/verification/variant-gate-measure-before-change.md) | Measure every option first; commit order locked by a script |
| CI and release | [ci-quality-gates](playbooks/ci-and-release/ci-quality-gates.md) | Migration lint, two-diff schema drift, anonymised staging, deploy with rollback |
| | [deploy-verification-against-live](playbooks/ci-and-release/deploy-verification-against-live.md) | Hash-compare live vs repo; panels that don't overwrite |
| | [release-checklists](playbooks/ci-and-release/release-checklists.md) | Capacitor app to Google Play and the App Store: traps that produced wrong packages |
| LLM | [llm-evaluation-harness](playbooks/llm/llm-evaluation-harness.md) | Scenarios × models × repeats, blind judges, cost read from what was paid |
| | [llm-as-advisor-engine-decides](playbooks/llm/llm-as-advisor-engine-decides.md) | The model proposes typed actions; a deterministic validator decides |
| | [blind-review-content-pipeline](playbooks/llm/blind-review-content-pipeline.md) | Select from a licensed corpus, blind second review, batch rework |

### Commands

| Command | What it does |
|---|---|
| [`/devam`](commands/session/devam.md) | Session start: machine sync, read state, cross-check, short report, wait for approval |
| [`/bitir`](commands/session/bitir.md) | Session end: continue-point, rotation, reference check, tests, secret scan, commit + push |
| [`/devam-ekip`](commands/session/devam-ekip.md) | Session start for a shared repo: developer from `hostname`, own `state/<dev>/`, "next" derived from the plan |
| [`/bitir-ekip`](commands/session/bitir-ekip.md) | Session end for a shared repo: own state only, hard budgets, user-language test recipe, own branch + PR |
| [`/check`](commands/quality/check.md) | Read-only health check: lint, smoke URLs, git state, doc consistency |
| [`/test`](commands/quality/test.md) | Picks a test + review chain from the active phase type |
| [`/ship`](commands/quality/ship.md) | Commit + push with approval; files added by name; never triggers deploys itself |
| [`/autopilot`](commands/quality/autopilot.md) | Unattended mode: pick the next safe step, test each change, commit locally, never push |

### Skills

| Skill | What it does |
|---|---|
| [project-continuity](skills/project-continuity/SKILL.md) | The session protocol as a skill (English) |
| [sprint-orchestration](skills/sprint-orchestration/SKILL.md) | Run a work package as a sprint: plan, agent briefs, worktrees, merge, ledger |
| [measure-decide-apply](skills/measure-decide-apply/SKILL.md) | Number-driven changes: measure variants, one decision package, implement the chosen arm |
| [blind-second-review](skills/blind-second-review/SKILL.md) | Clean-context second review of content batches with a seeded sample and a threshold (English) |
| [browser-verified-review](skills/browser-verified-review/SKILL.md) | UI work is done only when verified in a browser (English) |
| [microcopy-tr](skills/microcopy-tr/SKILL.md) | Turkish UX writing rules and audit mode |
| [tiktok-karusel](skills/tiktok-karusel/SKILL.md) | TikTok photo-carousel rules for a language app |
| [cold-records-uretim](skills/cold-records-uretim/SKILL.md) | Gated production flow for a history documentary channel |
| [yt-audit](skills/yt-audit/SKILL.md) | 14-day channel audit: ≤3 findings, one change per finding |
| [yt-planner](skills/yt-planner/SKILL.md) | Publishing calendar + weighted topic scoring |

The three video skills reference tools inside their own project; they are here as examples of gated, checklist-driven skills, not as drop-in tools.

### Hooks, tools, templates

| Path | What it is |
|---|---|
| [`hooks/`](hooks/README.md) | `pre-commit`, `commit-msg`, `pre-push` git hooks and two Claude Code hooks, each with the incident behind it |
| [`tools/`](tools/README.md) | `blind_sample.py` (seeded review sample + disagreement rate), `verify_bundle.js` (look inside an AAB/APK/IPA before shipping) |
| [`templates/`](templates/) | Blank `CLAUDE.md`, `activeContext.md`, `PROGRESS.md`, `memory/README.md`, `.claudeignore` |
| [`examples/`](examples/) | Filled-in state files for a fictional project |

## How I run a piece of work

1. **Plan first.** A written plan, approved once before any code.
2. **Design approval on live previews.** Visual choices are rendered side by side in a real browser, not described; rejected variants are kept.
3. **Sprint.** Each independent task goes to a sub-agent with a full brief and its own files; I keep the main context, the shared files and the browser.
4. **Merge, test, break.** Test suites run one after another; every new guard is broken on purpose at least twice to prove it can fail.
5. **Hand off with evidence.** A test recipe in the user's language, then the user's trial. The agent may write "ready" or "agent-verified", never "tested".
6. **Change log.** Every user-visible change is listed item by item, so nothing ships silently.

Hard rules underneath: references are verified with grep/read before they are written into state; no unrequested refactors; secrets only in git-ignored files; files added by name (never `git add -A`); no `--no-verify`, no force push; schema changes only as migration files.

## Results these practices produced

All numbers come from the projects' own reports and logs.

- **Model choice by measurement:** the 495-turn baseline for a game-master model (55 scenarios × 3 models × 3 repeats) cost **$1.09** in model calls and was scored by blind LLM judges. The cheapest model became the default; fixing the weaknesses all three models shared then cut cost by **15%** and p90 latency by **42%** with quality unchanged (4.41 → 4.39). [llm-evaluation-harness](playbooks/llm/llm-evaluation-harness.md)
- **Content quality without a human proofreader:** a clean-context second review sent **5 of 15** topic batches back on the first pass; after rework every batch was at **≤ 4%** disagreement, and words with audited distractors went from 457 to **616 of 728**. [blind-review-content-pipeline](playbooks/llm/blind-review-content-pipeline.md)
- **Session memory that stays small:** one project's state file peaked at **1,586 lines** and was read in full at every start; after rotation it is about **100 lines** with 500+ numbered sessions. In another, a 4,219-line file whose real "now" was 106 lines became an overwritten card with a ≤ 15 KB start-of-session read. [memory-model-evolution](playbooks/memory/memory-model-evolution.md)
- **Gates that were silently off:** a pre-commit configuration had not run for **~4 months**, a PHPStan job was green after analysing **0 files**, and a tenant-isolation test exited 0 whether or not data leaked. Each was found and replaced with a gate that has to prove it ran. [gates-must-be-measured](playbooks/verification/gates-must-be-measured.md)
- **Mutation checks find real bugs:** in one round **3 of 9** mutations escaped the guards, and all three pointed at real defects in the code. [variant-gate-measure-before-change](playbooks/verification/variant-gate-measure-before-change.md)
- **Unattended work with boundaries:** the first "night mode" run completed a 7/7 approved list with 5 commits, unit tests 85/85 and browser smoke 27/27. [autonomous-night-mode](playbooks/orchestration/autonomous-night-mode.md)
- **Live vs repo drift made visible:** a hash comparison of 196 deployed files showed 88 identical, 31 different and 77 missing on the live site, before an upload that would have removed a working feature. [deploy-verification-against-live](playbooks/ci-and-release/deploy-verification-against-live.md)

## Installation

```bash
# commands (project level)
mkdir -p .claude/commands
cp commands/session/devam.md commands/session/bitir.md commands/quality/*.md .claude/commands/
#   two or more developers on one repo: use devam-ekip.md / bitir-ekip.md instead

# skills (project level, or ~/.claude/skills/ for all projects)
mkdir -p .claude/skills
cp -r skills/project-continuity skills/sprint-orchestration .claude/skills/

# state files
cp templates/CLAUDE.md templates/activeContext.md templates/PROGRESS.md templates/.claudeignore .
mkdir -p memory archive/sessions && cp templates/memory/README.md memory/

# git hooks (optional): see hooks/README.md
```

Then fill in the placeholders (`<proje-kökü>`, `<yerel-url>`, ...), adapt the lint/test commands in `commands/quality/` to your stack, and end every session with `/bitir`.

## Third-party skills I use alongside these

Not included here, not mine: impeccable, emil-design-eng, apple-design, design-taste-frontend, redesign-existing-projects, review-animations, design-review, graphify, security-audit, social, playwright-cli, e2e, humanizer, and a set of YouTube skills (yt-script, yt-seo, yt-shorts, yt-edit, yt-package, yt-retention). Some of my files call them by name.

## License

MIT - see [LICENSE](LICENSE).
