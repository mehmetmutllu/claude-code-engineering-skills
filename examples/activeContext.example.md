# Active Context (example — fictional project "Orbit CRM")

> Updated at the end of every session. A new session reads this file and continues from the continue-point.
> **Last update:** 2026-08-10 (Session **41** — invoice PDF export shipped, e2e 34/0)

## 🎯 CONTINUE POINT

> **ACTIVE WORK — INVOICING MODULE.** SSOT: `plans/invoicing.md` (decisions D1-D6 + phases P1-P5).
> ✅ P1 schema (migration 012 + reverse + drill) · ✅ P2 create/edit flows (smoke 18/0) · ✅ P3 PDF export (Session 41 — e2e 34/0, screenshots `S41_*`).
> **▶️ NEXT = P4: e-mail delivery** — reuse `app/mail_helpers.php::sendTransactional()` (verified to exist, Session 41); add per-tenant sender config; extend e2e with delivery assertions.
> ⚠️ Known twin: amount formatting exists in PHP (`formatAmount()`) and JS (`js/format.js`) — registry entry T-3; touching one requires checking the other.

## 🔄 SESSION 41 (2026-08-10) — Invoice PDF export

- Built PDF export on the existing render pipeline (no new dependency).
- Fixed rounding drift between list view and PDF total (root cause: duplicated formatter — logged as twin T-3).
- Evidence: e2e invoice suite 34/0 · smoke 18/0 · screenshots `S41_1440_invoice-pdf.png`.

## 🔄 SESSION 40 (2026-08-08) — Invoice edit flow

- Edit flow with optimistic locking (D4); conflict toast verified in browser.
- Evidence: smoke 18/0 · e2e 28/0.

## 🔄 SESSION 39 (2026-08-07) — Invoice create flow

- Create flow + validation (server + JS mirror, registered as twin T-2).
- Evidence: smoke 15/0.

*(Older session blocks live in `archive/sessions/2026-08/`.)*
