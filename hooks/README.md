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

All three git hooks live in **one** folder, `.githooks/`:

```bash
mkdir -p .githooks
cp hooks/scripts/pre-commit hooks/scripts/commit-msg hooks/scripts/pre-push .githooks/
git config core.hooksPath .githooks          # per machine; not carried by the repo - make it step 0 of onboarding
git update-index --chmod=+x .githooks/*      # commit them as 100755 or they silently won't run
```

Then edit the configuration block at the top of each script (product paths, checklist file, sentinel names, tenant tables). Use **one** hook mechanism: `core.hooksPath` disables `.git/hooks`, and with it any `.pre-commit-config.yaml`. Why that matters: [gates-must-be-measured](../playbooks/verification/gates-must-be-measured.md).

`pre-commit` needs bash (it reads the staged list NUL-separated, so file names with spaces are safe).

### `commit-msg` fails closed

If the checklist file or a sentinel the hook calls (`tools/smoke_*.php`, project-specific, not included) does not exist, the commit is **rejected**: a gate that silently skips is no gate. Opt out explicitly while a project has no such files yet:

| Variable | Effect |
|---|---|
| `ALLOW_NO_CHECKLIST=1` | allow product commits when the checklist file doesn't exist |
| `ALLOW_NO_SENTINEL=1` | allow session-record commits when the state/closure sentinels don't exist |

Set them per commit (`ALLOW_NO_CHECKLIST=1 git commit ...`) or in your shell profile. `pre-commit` skips its own optional sentinel (`tools/smoke_commit_gates.php`) when it is absent.
