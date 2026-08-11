# PROGRESS (example — fictional project "Orbit CRM")

> Current state + continue-point live in `activeContext.md` (single owner). This file is the thin frame: roadmap + completed-phase registry. It is **not** updated every session — only when the roadmap or registry changes.

**Active phase:** Invoicing module — SSOT: `plans/invoicing.md`
*(No volatile detail here — no "next step", no counts. Those live in the continue-point and the plan.)*

## Roadmap

```
Phase A: Core CRM (contacts, deals)          ✅
Phase B: Multi-tenant isolation + auth       ✅
Phase C: Invoicing                           ← active
Phase D: Reporting
Phase E: Public API
```

## Completed-phase registry (searchable regression trail)

| Phase | Delivered | Key area / files |
|-------|-----------|------------------|
| A — Core CRM | contacts + deals CRUD, activity log | `app/contacts.php`, `app/deals.php` |
| B — Tenancy & auth | tenant-scoped queries (composite key pattern), role gates | `app/auth.php`, all queries `WHERE id=? AND tenant_id=?` |

> When touching an old area, find its row here → read the linked plan in `archive/` for full history.
