# One severity vocabulary (and confidence on a separate axis)

> **Problem:** Findings from audits, scanners and review agents each bring their own severity words; records that say the same thing can't be compared.
>
> **Practice:** Four canonical levels; confidence (SUSPECT) on a separate axis; a mapping table instead of relabelling history; a sentinel that fails on a new vocabulary.
>
> **Evidence:** A review claimed two scales; counting found five, with 20 labels and ~550 occurrences.

## Measured

An external review said the project used *two* scales. Counting showed **five**: `CRITICAL/MAJOR/MINOR` (backend + plans) · `BLOCKER/P0–P3/Nit` (page audits) · `BLOCKER/HIGH/MEDIUM/NIT` (mobile audit) · `CRITICAL/HIGH/LOW` (scanner output) · `HIGH/MEDIUM/LOW` (risk tables) — **20 labels, ~550 occurrences**. (`S1–S4` turned out to be step IDs, not severities.)

## Canonical four levels

| Level | Meaning | When |
|---|---|---|
| **CRITICAL** | data loss · security hole · work stops entirely | now, before the next task |
| **MAJOR** | function broken, user has a workaround | same phase |
| **MINOR** | annoying, work proceeds | the phase's polish round |
| **POLISH** | cosmetic / improvement | still closed (zero-leftover rule) |

**SUSPECT is not a level, it's confidence.** "Might be a finding, not verified" sits on a separate axis: a finding can be CRITICAL *and* SUSPECT. The mark drops once verified. Other verification marks used: `SUSPECT → RESOLVED (false alarm)` · `✅ PROVEN LIVE (PoC)` · `STALE (S<N>)` with reason.

## Mapping, not relabelling

A mapping table converts every legacy label (BLOCKER/P0/CRITICAL → CRITICAL; HIGH/P1 → MAJOR; MEDIUM/P2 → MINOR; LOW/Nit/P3 → POLISH; risk HIGH/MEDIUM/LOW → MAJOR/MINOR/POLISH). **Old records are not relabelled** — history isn't rewritten into today's language; the meaning is read from the table. External tool output is quoted as-is and translated when it enters a plan: *"CRITICAL (scanner: CRITICAL)"*.

A sentinel fails if a new vocabulary appears. New projects start with the single scale from day one.

## Zero-leftover + triage

| Finding | Action |
|---|---|
| Blocking / critical | fix in this round |
| Small + safe (text, one line) | fix in this round |
| Medium/wide + risky (many files, behaviour change) | collect → batch fix phase, with user approval |

An audit session closes itself, polish included; accumulating a polish backlog is banned. Every closed finding leaves a permanent regression test named after it, proving ① the new behaviour is right and ② the old broken pattern gives a different result.
