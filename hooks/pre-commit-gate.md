# Hook: pre-commit gate — syntax, secrets, tenant filter, size, and the gates' own health

> A single-mechanism git `pre-commit` hook for PHP projects that checks only **staged** content. It replaced a `.pre-commit-config.yaml` that had silently not run for ~4 months (see [gates-must-be-measured](../playbooks/verification/gates-must-be-measured.md)).

Script: [`scripts/pre-commit`](scripts/pre-commit)

## Checks

1. **`php -l`** on staged PHP. Choose the interpreter explicitly (`PHP_BIN`) — on one machine the bare `php` on PATH was an old 7.x from a previous stack.
2. **Secrets by name** (`.env`, local config, keys). `.env.example` is allowed *only* with `__PLACEHOLDER__` values for secret-named keys — the first version blocked the project's own documented template, and "a gate that raises false alarms is a gate that will be switched off". The exemption isn't blind: a real value in a secret-named key still fails.
3. **Secrets by content**, deliberately narrow (cloud key IDs, API key prefixes, private key headers) + gitleaks if installed. Scan `git show :<file>` (the staged blob), not the working tree.
4. **Tenant filter**: raw `WHERE id = ?` without the tenant column in a file that queries tenant tables. Parent-scoped queries (`WHERE customer_id = :x`) don't trigger. The full scanner runs in CI.
5. **> 1 MB files** — binaries don't go into the repo.
6. **Gates alive**: a sentinel checks hook files exist, are `100755` in the index, `core.hooksPath` is right, and no competing `.pre-commit-config.yaml` came back. Its first run found both hooks committed as `100644` — they would have silently died on the next clone.

## Install

```bash
git config core.hooksPath .githooks       # per machine, not carried by the repo
git update-index --chmod=+x .githooks/pre-commit .githooks/commit-msg .githooks/pre-push
```
Put the install line in `CLAUDE.md` and in the onboarding doc as step 0, and in the state file as a reminder for the second machine.
