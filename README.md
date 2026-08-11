# Claude Code Engineering Skills

**Workflow skills for long-running, AI-assisted software projects: persistent project memory, session continuity, Git automation, browser testing and design review.**

I build and maintain production systems (multi-tenant SaaS, e-commerce, multi-service platforms) largely through AI-assisted development with [Claude Code](https://claude.com/claude-code). These are the workflow skills that make that sustainable on projects with **hundreds of sessions** — not toy scripts, but the actual discipline extracted from production use, genericized here with placeholder project names.

## The Problem

AI coding assistants are stateless between sessions. On a large project this causes:

- **Context loss** — every new session starts from zero; the assistant re-discovers the architecture, re-asks answered questions and repeats settled decisions.
- **Context bloat** — pasting the whole history into every session wastes the context window and degrades output quality.
- **Drift** — plans, docs and state files silently diverge from the code and from each other.
- **Unverified work** — "looks done" replaces "proven done" unless verification is part of the loop.

## The Solution

A small set of always-current state files + strict session protocols:

```
project/
├── activeContext.md   ← THE living narrative: "continue point" + last 3 session summaries
├── PROGRESS.md        ← thin frame: roadmap + completed-phase registry (rarely written)
├── plans/<topic>.md   ← single source of truth (SSOT) per work stream
└── CLAUDE.md          ← short protocol reference, pointing at the above
```

**Session start:** read `activeContext.md` → cross-check the active plan's status log against the continue-point → report state → work.
**Session end:** update the continue-point, append a session block (rolling window — older blocks move to an archive), verify every file/function reference written to state actually exists in code, then commit + push with a session-numbered message.

Key design rules learned the hard way:

- **One owner per fact.** "What's next" lives in exactly one file. Every copy is a future stale copy.
- **Append-only status logs.** A "NEXT: X" pointer that must be hand-flipped will eventually lie; an append-only "✅ X done" log can at worst be incomplete — which is safe.
- **Verify references at write time.** Never copy a file/function/endpoint reference from another document into state — grep the code first.
- **Rolling summaries.** Keep the last N session blocks inline; archive the rest. The state file stays readable forever.
- **Track known duplicates.** When logic must exist in two places (PHP + JS validation twins), record the pair in a registry so touching one prompts checking the other.

## What's in this repository

| Path | Contents |
|------|----------|
| [`skills/project-continuity/`](skills/project-continuity/) | The session start/end protocol as a reusable Claude Code skill |
| [`skills/design-review/`](skills/design-review/) | Browser-verified UI review workflow (Playwright + screenshots + review passes) |
| [`examples/`](examples/) | Filled-in example state files for a fictional project |
| [`docs/`](docs/) | Why persistent context works, and the failure modes it prevents |

## Results (from production use)

On my largest project this workflow has carried **340+ numbered sessions** across many months: every session starts with an accurate picture in under a minute, work is verified by smoke/e2e suites before being marked done, and the git history reads as a numbered session journal. The same pattern runs on several other production codebases.

## Using It

1. Copy `examples/activeContext.example.md` and `examples/PROGRESS.example.md` into your project and rename them.
2. Add the session protocol from `skills/project-continuity/SKILL.md` to your project's `CLAUDE.md` (or install it as a skill).
3. End every working session through the protocol — the discipline is the product.

No proprietary project context, client names or credentials are included; examples use placeholder projects.
