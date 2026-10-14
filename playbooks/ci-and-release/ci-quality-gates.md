# CI quality gates for a solo/small-team PHP + MariaDB SaaS on shared hosting

> **Problem:** On shared hosting there is no platform safety net: production gets hand-edited, staging drifts, a half-applied migration still answers HTTP 200.
>
> **Practice:** Migration lint, a two-diff schema drift check, anonymised staging refresh, deploys with backup + body-checked health endpoint + automatic rollback, and a self-discovering DB-less sentinel suite on every PR.
>
> **Evidence:** The drift alarm was red for ten days for a harmless reason until the single diff was split in two; 62 + 15 + 17 + 189 test scripts existed and none ran on PRs.

All workflows are GitHub Actions. Principle across all of them: **a gate that cannot measure does not return green** (see [gates-must-be-measured](../verification/gates-must-be-measured.md)).

## 1. Migration lint (static, no DB)

Triggers: PR touching `database/migrations/**` or `database/reverses/**`, plus a daily cron.

- Forward filenames must match `^\d{3}_[a-z0-9_]+\.sql$`; a `_reverse.sql` file inside `migrations/` fails.
- Reverse filenames: `^\d{3}_[a-z0-9_]+_reverse\.sql$` in `database/reverses/`.
- Forward migrations may not contain `DROP TABLE|COLUMN|INDEX` or `TRUNCATE` (comments stripped first: `--`, `#`, `/* */`). Destructive SQL lives in reverses.
- One justified exemption: a file whose **only** destructive statements are `DROP INDEX` and which carries a marker comment `-- MIGRATE-ALLOW-DROP-INDEX: <reason>` (relaxing a constraint isn't data loss). The migration runner applies the *identical* rule — the two are registered twins.

## 2. Schema drift check — two diffs, not one

Triggers: manual, PR on migrations, daily cron, and `workflow_call` from the production deploy (in `strict` mode, missing secrets = fail).

Flow:
1. Ephemeral MariaDB service. Load `initial-schema.sql` (strip `DEFINER=` → `CURRENT_USER`), apply all migrations → **expected** schema.
2. Over SSH (read-only), `mysqldump --no-data` of production, plus production's own `schema_migrations` list and last applied time. Sanity-check sizes; if the migrations table can't be read, **fail** — "behind" vs "hand-modified" can't be told apart.
3. Build **prod_expected** = base schema + only the migrations production says it applied.
4. Diff ① `prod_clone ↔ prod_expected` — non-empty means **someone changed production outside migrations** → red.
   Diff ② `prod_expected ↔ ci` — non-empty means production is merely **behind** → warning listing pending migrations by name.
5. A classifier script writes a summary; dumps uploaded as a 7-day artifact.

Why two diffs: with one diff, "production is behind" and "production was hand-edited" produced the same red. The alarm was red continuously for ten days for the harmless reason; a real hand edit in that window would have been invisible. After the split, **red means something**. It also removed the need for an `allow_drift` bypass on deploy.

Practical traps hit (and encoded): Atlas's file parser chokes on MariaDB conditional comments → load into a DB and diff via `mysql://`; schema names must be normalised in the inspected HCL; normalise database charsets to avoid "modify schema" noise; `--events` removed (no access to `mysql.event` on shared hosting); disable FK checks while loading an alphabetical dump.

Related rule: **production-clone migration rehearsal** before deploying new migrations — the clone ↔ local diff must be empty; the CI drift gate can't see everything a rehearsal sees.

## 3. Staging refresh: production → anonymise → staging

Weekly cron (lowest-traffic hour) + manual.

All DB work happens in **one SSH session on the host**, so production data never lands on the runner:
maintenance lock on staging → dump prod to host `/tmp` → drop/create staging DB → load → apply `anonymize.sql` → run migrations (idempotent safety net) → delete dump → remove lock → health check.

`anonymize.sql` is a template rendered on the runner (a bcrypt hash of a known test password is substituted in). It rewrites PII **deterministically from IDs** so foreign keys survive and test accounts are predictable: `CONCAT('user', id, '@example.test')` (RFC 6761 reserved domain — mail can never be delivered), names → `Student<id> Anonymous`, phones → padded fake numbers, national ID → padded ID, all passwords → the test hash, tokens/logos cleared, notification logs + verification tokens truncated, SMS provider secret → NULL. The only bypass input (`skip_anonymize`) is labelled DEBUG and defaults off.

A separate read-only workflow downloads an anonymised staging dump as an artifact so a real-shaped local copy can be built.

## 4. Production deploy with automatic rollback

Manual trigger only, guarded by typing a confirm string. Flow on the host:
1. Pre-flight (`.env` exists).
2. **Backup:** `git tag rollback-pre-<UTC stamp>` on the current commit + gzipped `mysqldump --single-transaction`. A backup below a sanity size aborts the deploy (the threshold was later lowered when the near-empty pre-launch DB tripped it — thresholds must match reality).
3. Deploy inside a subshell: `git fetch && git reset --hard origin/<ref>`, `composer install --no-dev`, dry-run migrations (captured so a migrate error also triggers rollback), apply, run any one-shot backfill tied to a specific migration *only if that migration was pending*.
4. **Health check** loop → **panel smoke** (login, public index, one index page per role: 200 or 302 is fine; any 4xx/5xx → rollback).
5. **Real health endpoint:** `/health.php` connects, pings and reads the schema; the deploy greps the *body* for `"status": "healthy"`. Reason: six URLs returning 200 only prove the web server is up — a half-applied migration can leave them green.
6. `ROLLBACK()` = `git reset --hard <previous>` + restore the dump. Old backups pruned after 14 days.

Process rule on top: **staging-first** — local → staging → user approval → production. Direct-to-production is banned. Production auto-push is off.

## 5. The everyday CI (PR + push)

- `php -l` over all PHP (vendor/archive excluded).
- PHPStan level 1, baseline-locked, **with a canary** that must be found.
- Secret scan (gitleaks).
- Tenant isolation: scan product code for new leaks against a baseline (see [idor-runtime-test](../verification/idor-runtime-test.md)).
- "Commit gates alive": hook files present, executable, single mechanism.
- **DB-less sentinel suite**, self-discovering (`tools/smoke_*.php`), exclusions with written reasons, shrink-only known-failures baseline, and every run prints its coverage. Measured motivation: there were 62 smoke + 15 drill + 17 verify + 189 test scripts, and **zero** of them ran on PRs.
- Every sentinel ends with a contract line (`✅ CLEAN — N/N passed, 0 failed`); any other ending is treated as a silent exit.

## 6. Linux CI for a Windows dev box (second project)

The CI comment says it plainly: dev is Windows, production Linux; Docker was dropped, so CI is the only "same environment" guarantee. It catches case-sensitive filenames (`class not found` only on Linux), runs PostgreSQL with `--locale=C --encoding=UTF8` (without `--encoding`, `initdb` silently falls back to `SQL_ASCII`), and creates the app role as **non-superuser** — the image's default superuser would bypass Row-Level Security and CI would test a database without tenant isolation. No step may use `continue-on-error`, `|| true` or `exit 0`: *"a green but empty CI is not a gate, it's gate decoration."*
