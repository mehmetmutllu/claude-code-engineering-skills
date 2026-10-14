# Hook: pre-push — protect `main` when the platform doesn't

> A local `pre-push` hook that rejects pushes to `refs/heads/main`, used in a two-developer repo where the plan tier offered no server-side branch protection for private repos.

Script: [`scripts/pre-push`](scripts/pre-push)

- Reads `<local_ref> <local_sha> <remote_ref> <remote_sha>` lines from stdin; any `remote_ref == refs/heads/main` → exit 1 with the branch + PR recipe.
- Lives in `.githooks/`, activated by `git config core.hooksPath .githooks` — the onboarding doc makes this the first command after cloning: *"skip it and that machine has no gate protecting main."*
- **Keep it after server protection is added.** Redundant gates are the point.
- CI complements it: `main` push events still run CI, so a clone without the hook would at least turn red after the fact.
- Pairs with the team rules: branches `<dev>/<plan-slug>/<short-name>`, `git pull --rebase` before push, no force push, no `--no-verify`.
