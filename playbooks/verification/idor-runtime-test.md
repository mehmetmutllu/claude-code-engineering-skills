# Tenant isolation: static scan, runtime IDOR test, structural test

> **Problem:** In a multi-tenant app the most important invariant, one tenant never sees another's data, is usually guarded by code review alone.
>
> **Practice:** Three layers: a static scanner with a baseline, a black-box runtime test with exit codes 0/1/2, and a structural test that asks the database which tables need row-level security.
>
> **Evidence:** The original runtime script verified nothing (it printed expectations and always exited 0); with RLS enabled but not forced, the owner role still saw 2 of 2 rows.

## Layer 1 — composite-key rule + static scanner

Rule: every query on a tenant-owned table filters by tenant: `WHERE id = ? AND tenant_id = ?`, and "not found" and "not yours" return the **same generic 404/redirect** (no existence oracle).

- A `pre-commit` check on staged PHP: raw `WHERE id = ?` present, `tenant_id` absent, and the file queries a tenant table → reject (`tools/` and one-off scripts exempt).
- A full scanner (`tools/tenant-leak-scan.php`): regex patterns with a ±20-line window that must contain `tenant_id`, severities CRITICAL/MAJOR/MINOR, `--json`, exit `0` none / `1` findings / `2` internal error. Runs in CI against a **baseline** of known findings; a new finding fails, a fixed one must be removed from the baseline.

Static scanning is a heuristic. The measured lesson: queries built by concatenating fragments never matched the pattern — "I scanned everything" meant *everything the scanner could see*. See [verify-tool-findings](verify-tool-findings.md).

## Layer 2 — runtime IDOR test (black box, local)

Log in as tenant A's admin and request an edit page with four parameters:

| Case | Input | Expected |
|---|---|---|
| OWN | A's own record id | 200, form renders |
| CROSS | tenant B's record id | 302 → list?status=not_found |
| NULL | no parameter | 302 → list |
| SWAP | non-existent id | 302 → list?status=not_found (same as CROSS) |

The script got rewritten after an external review showed **it verified nothing**: it printed expected behaviour as text, never compared, had no exit code. Leak or no leak → same output, `0`. Now:

```bash
#!/usr/bin/env bash
# Exit: 0 all as expected · 1 deviation · 2 environment not ready
set -u
BASE="${IDOR_BASE:-http://localhost:8080/app}"
# 0. Server up?  If not → exit 2. "Clean" without measuring is the worst result.
curl -s -o /dev/null --max-time 10 "$BASE/login.php" || { echo "ENV NOT READY"; exit 2; }
# 1. Log in (fetch CSRF token from the form, POST credentials from env, keep cookie jar)
# 2. Verify the login itself: Location must point into the admin panel, else exit 2.
#    Without this, every case returns 302 and the test "proves" isolation while logged out.
# 3. For each case: request, read status + Location, compare with expected → passed/failed counters
# 4. exit $(( failed > 0 ? 1 : 0 ))
```
Run it only locally against known fixture IDs; on staging/production the IDs don't match and it would give a false "clean".

## Layer 3 — structural isolation (PostgreSQL, second project)

Isolation is **structural**, not regex: Row-Level Security policies + a model trait that scopes queries + an architecture test. Two tests:

- **Behaviour test**: isolation works today for the known tables.
- **Structure test**: asks the database *which tables have a `company_id` column* and asserts each has RLS **enabled and FORCED** with a policy. It doesn't list tables by hand, so a table added six months later without RLS fails immediately. Tables legitimately outside tenancy are in a short constant with a reason per line.

Measured trap encoded in that test: in PostgreSQL, RLS does not apply to the table **owner** by default. Migrations ran as the app role, so the app role owned the tables. With only `ENABLE ROW LEVEL SECURITY`, the owner saw 2 of 2 rows (isolation dead); with `FORCE`, 1 row. Also: CI must not run the app as superuser (superusers bypass RLS).

## Security claims need proof

Separate rule used across security rounds: a suspected hole is proven with a working PoC (real data in the DB, open the page, measure the DOM); then scan **all twins** of the same pattern and report which are already safe; then turn the PoC into a permanent regression test; then comment *why* the fix has this shape. Example: an `escapeHtml()` that didn't escape quotes, used both in an attribute and inside an inline `onclick` string → stored DOM-XSS. Strengthening the escape fixes the attribute but **not** the inline handler (the browser entity-decodes before parsing JS) — the structural fix was `data-*` + event delegation. Without the PoC, "escape is already there" would have passed review.

"Probably vulnerable" and "probably safe" are both banned phrasings.
