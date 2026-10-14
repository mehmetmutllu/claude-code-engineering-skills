# Claude Code Engineering Skills

**The session protocol, quality commands and skills I actually use with [Claude Code](https://claude.com/claude-code) on long-running projects.**

I build and maintain several projects (a multi-tenant school management SaaS, a mobile language-learning app, an e-commerce site, a YouTube documentary pipeline) mostly through AI-assisted development. The files here are copied from those projects and genericized: project paths became placeholders, private details were removed. Command and skill bodies are in **Turkish**, the language I work in; this README and the `project-continuity` / `browser-verified-review` skills are in English.

## The problem

Claude Code starts every session with no memory of the last one. On a big project that means:

- **Context loss** — each session re-discovers the architecture and re-asks settled questions.
- **Context bloat** — "just write everything into one notes file" works until the file is 1,000+ lines and is read in full at every start.
- **Drift** — plans, notes and code quietly disagree; a stale file path copied from one doc to another spreads.
- **Unverified "done"** — work is declared finished without a test number or a screenshot.

## How the session system works

```
project/
├── CLAUDE.md                  short reference + hard rules (auto-loaded)
├── activeContext.md           🎯 continue-point + last 3 session blocks   ≤200 lines, rewritten every session
├── PROGRESS.md                roadmap + completed-phase registry          changed only when a phase changes
├── memory/                    durable decisions, read selectively via README.md index   ≤150 lines per file
├── archive/sessions/YYYY-MM.md  old session blocks (excluded by .claudeignore)
└── .claude/commands/
    ├── devam.md   /devam  = session start
    └── bitir.md   /bitir  = session end
```

```
/devam:  git fetch → (clean & behind? pull --ff-only) → read activeContext + PROGRESS active line
         → cross-check (contradiction → stop and ask) → ≤10-line report → wait for confirmation

/bitir:  rewrite continue-point → add session block → ROTATE → PROGRESS only if changed
         → new durable decision → memory/ → verify new references → run tests for what changed
         → secret scan → add files by name → "Oturum N: title" commit → push → change log
```

**Rotation** is what keeps it usable: more than 3 session blocks → the oldest moves to `archive/`; over 200 lines → blocks shrink to 15 lines, then durable content moves to `memory/` behind a one-line pointer; a fact written for the third time belongs in `memory/`. The read cost at session start stays around 350 lines however large the project gets. One of my projects reached a 1,087-line `activeContext.md` before I added these rules; it now has 500+ numbered sessions and the file is about 100 lines.

## What's in this repository

| Path | What it is |
|------|------------|
| [`commands/session/devam.md`](commands/session/devam.md) | `/devam` — session start: machine sync, read state, cross-check, short report |
| [`commands/session/bitir.md`](commands/session/bitir.md) | `/bitir` — session end: continue-point, rotation, reference check, secret scan, commit + push |
| [`commands/quality/check.md`](commands/quality/check.md) | Read-only health check: lint, smoke URLs, git state, doc consistency |
| [`commands/quality/test.md`](commands/quality/test.md) | Picks a test + review chain from the active phase type (DB, auth, checkout, UI, copy…) |
| [`commands/quality/ship.md`](commands/quality/ship.md) | Commit + push with approval; files added by name; never triggers deploys itself |
| [`commands/quality/autopilot.md`](commands/quality/autopilot.md) | Unattended mode: pick the next safe step, test each change, commit locally, never push |
| [`skills/project-continuity/`](skills/project-continuity/SKILL.md) | The session protocol above as a skill (English) |
| [`skills/browser-verified-review/`](skills/browser-verified-review/SKILL.md) | UI work is done only when verified in a browser: measure DOM, screenshot per viewport |
| [`skills/microcopy-tr/`](skills/microcopy-tr/SKILL.md) | Turkish UX writing rules: buttons, errors, empty states, banned marketing words, audit mode |
| [`skills/tiktok-karusel/`](skills/tiktok-karusel/SKILL.md) | TikTok photo-carousel rules for a language app: hooks, slide types, safe zones, banned AI phrasing |
| [`skills/cold-records-uretim/`](skills/cold-records-uretim/SKILL.md) | Gated production flow for a history documentary channel: research → script → shot plan → visual self-QA → Shorts → package |
| [`skills/yt-audit/`](skills/yt-audit/SKILL.md) | 14-day channel audit: snapshot stats, ≤3 findings, one change per finding |
| [`skills/yt-planner/`](skills/yt-planner/SKILL.md) | Publishing calendar + weighted topic scoring from competitor view counts |
| [`templates/`](templates/) | Blank `CLAUDE.md`, `activeContext.md`, `PROGRESS.md`, `memory/README.md`, `.claudeignore` |
| [`examples/`](examples/) | Filled-in state files for a fictional project |
| [`docs/why-persistent-context.md`](docs/why-persistent-context.md) | The failure modes this prevents |

The three video skills reference tools inside their own project (render scripts, `memory-bank/` files); they are included as examples of how I write gated, checklist-driven skills, not as drop-in tools.

## How I run a piece of work

1. **Plan first.** A written plan, approved before any code.
2. **Design approval on live previews.** Visual choices are shown as 3–4 variants side by side in a real browser preview (not described in text); rejected variants are kept, not deleted.
3. **Sprint with parallel sub-agents (at most 3).** Each independent task goes to its own sub-agent with a brief: context, files to read, the *separate* files it may write, what is out of scope, the test to run, a short report. I stay the orchestrator and keep the main context.
4. **Merge + test.** I wire the shared files together and run the test suites one after another.
5. **Change log.** Every user-visible change (screen, text, behavior, default setting) is listed item by item, so nothing ships silently.

Long-running agents write progress notes as they go; when one grows too large it is replaced by a fresh agent that gets only the hand-off note.

## Rules that hold everything together

- **Verify references.** A file path, function or endpoint is written into a state file only after grep/read confirms it exists. Never copy one from another document.
- **Stay in scope.** No unrequested refactors or "while I'm here" cleanups; noticed problems go into `activeContext.md` as notes.
- **Secrets never go in code.** Credentials live in `.env` (git-ignored); every commit is preceded by a `git status` + staged-diff scan; files are added by name (`git add -A` is banned); no `--no-verify`, no force push.
- **Schema changes are migration files**, never database dumps.
- **One owner per fact.** Volatile state lives only in `activeContext.md`, durable decisions only in `memory/`.

## Installation

```bash
# commands (project level)
mkdir -p .claude/commands
cp commands/session/*.md commands/quality/*.md .claude/commands/

# skills (project level, or ~/.claude/skills/ for all projects)
mkdir -p .claude/skills
cp -r skills/project-continuity skills/microcopy-tr .claude/skills/

# state files
cp templates/CLAUDE.md templates/activeContext.md templates/PROGRESS.md templates/.claudeignore .
mkdir -p memory archive/sessions && cp templates/memory/README.md memory/
```

Then fill in the placeholders (`<proje-kökü>`, `<yerel-url>`, …), adapt the lint/test commands in `commands/quality/` to your stack, and end every session with `/bitir`.

## Third-party skills I use alongside these

Not included here, not mine: impeccable, emil-design-eng, apple-design, design-taste-frontend, redesign-existing-projects, review-animations, design-review, graphify, security-audit, social, playwright-cli, e2e, humanizer, and a set of YouTube skills (yt-script, yt-seo, yt-shorts, yt-edit, yt-package, yt-retention). Some of my files call them by name.

## License

MIT — see [LICENSE](LICENSE).
