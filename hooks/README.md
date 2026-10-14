# Hooks

Git hooks and Claude Code hooks taken from real projects and made generic. Each `.md` file explains what the hook does, why it exists (the incident behind it) and how to install it. The scripts are in [`scripts/`](scripts/).

| Hook | Kind | What it enforces |
|---|---|---|
| [pre-commit-gate](pre-commit-gate.md) · [`scripts/pre-commit`](scripts/pre-commit) | git `pre-commit` | PHP syntax, secrets by name and content, tenant filter on raw `WHERE id = ?`, files over 1 MB, and that the gates themselves are alive |
| [commit-msg-session-gate](commit-msg-session-gate.md) · [`scripts/commit-msg`](scripts/commit-msg) | git `commit-msg` | no product-code commit without a new user-language test recipe; no session record while tests are unanswered or state budgets are exceeded |
| [pre-push-protect-main](pre-push-protect-main.md) · [`scripts/pre-push`](scripts/pre-push) | git `pre-push` | no direct push to `main` when the platform offers no branch protection |
| [graphify-update](graphify-update.md) · [`scripts/graph-update.sh`](scripts/graph-update.sh) | Claude Code `PostToolUse` + `Stop` | refreshes a code knowledge graph in the background; includes the measurement that got it switched off in a large repo |
| [session-sync-two-machines](session-sync-two-machines.md) | Claude Code `SessionStart` + `SessionEnd` | keeps the agent's machine-local memory in sync between a laptop and a desktop (design + illustrative sketch) |

## Install (git hooks)

```bash
mkdir -p tools/git-hooks
cp hooks/scripts/pre-commit hooks/scripts/commit-msg tools/git-hooks/
git config core.hooksPath tools/git-hooks          # per machine; not carried by the repo
git update-index --chmod=+x tools/git-hooks/*      # commit them as 100755 or they silently won't run
```

Then edit the configuration block at the top of each script (product paths, checklist file, sentinel names, tenant tables). Use **one** hook mechanism: `core.hooksPath` disables `.git/hooks`, and with it any `.pre-commit-config.yaml`. Why that matters: [gates-must-be-measured](../playbooks/verification/gates-must-be-measured.md).

The sentinels the hooks call (`tools/smoke_*.php`) are project-specific and not included; each hook skips a sentinel that doesn't exist.
