# Variant gate: measure every option before changing the code, enforced by commit order

> **Problem:** "Measure first, then ask, then implement" is easy to write and easy to violate; a written rule was broken in the very next session.
>
> **Practice:** Measure every option as a variant, commit the measurement with an empty decision section, ask once, implement only the chosen arm with mutation-verified guards; a script locks the commit order.
>
> **Evidence:** A full measurement run took 8 min 02 s and seven of them used 33% of a session; in one round 3 of 9 mutations escaped, and all three exposed real defects.

Context: a 3D idle-tycoon game whose balance lives in a single config (`economy.config.ts`) plus the tick/rules code, measured by headless simulation tools.

## The loop

```
0 START    3 small files (≤ 15 KB) → one message: now / next / open questions → approval
1 QUESTION open the turn card: QUESTION · ARMS TO MEASURE · (empty) NUMBERS · DECISION · IMPLEMENTATION · GUARD
2 MEASURE  short run to validate the tool (did the bot walk? is the variant effective? conservation = 0?)
           → full run BASELINE → every arm as a VARIANT → report §Findings
           → commit #1: tool + raw output + report (DECISION SECTION EMPTY)
3 DECIDE   one decision package: arm | number | trade-off | recommended ✓ → user picks
4 APPLY    code only for the chosen arm → guard test → verify with ≥ 2 mutations → FINAL full run
           → commit #2: code + test + finished report + decision record
5 CLOSE    session-end protocol
```

## The lock

- A balance change (touching the three balance files) is not allowed without that arm's **number row** in the report's findings table.
- Alternatives (A or B) are written as **variants** (temporary config injected into the tool), never as code. Code only for the chosen arm.
- **Two commits** make the order mechanical. A script (`npm run order`) checks unpushed commits: if a commit touching balance files comes before any measurement commit in the range → exit 1. Validated against real history: one past turn → CLEAN, the turn that caused the rule → VIOLATION.
- Two false-positive patterns were later closed: (a) commit #1 was already pushed before the decision → look *back* from the range to the last balance commit or a report with a filled decision section; (b) commit #1 legitimately adds a measurement *seam* in tick code → a commit whose report decision section is empty may touch tick/rules (must be behaviour-neutral) but never the numbers file.
- The tool checks order, not numbers: its output names the report files a human must check for the number row.

## Short vs full runs (measured)

One full measurement run took **8 min 02 s**; seven runs = ~56 of a 168-minute session (33%) — the single largest cost. Rule: `MEASURE=short` while developing (< 60 s: 1–2 scenarios × 300 s × 1 seed), `MEASURE=full` only for baseline and final. **Only full-run-stamped numbers go into a report.**

## Shared measurement skeleton with self-checks

Copy-pasted scaffolding (seeded RNG, fake storage, setup) was byte-identical across three tools, and the same tool bugs were rediscovered every time (bot stuck in the street; variant reverted after setup and silently ineffective). A shared library now stamps every run: **bot-walked**, **variant-effective** (first 100 frames' fingerprint must differ with vs without the variant; otherwise "VARIANT INEFFECTIVE — NOT A MEASUREMENT"), **conservation**. A tool's lessons live in the library as assertions, not in prose.

## Mutation-verified guards

A green test proves nothing; its red does. Each guard is validated by a mutation script: every mutation re-introduces one defect the turn closed (e.g. trigger reverted to a circle, frame recomputed in a second place, label split in two). If the guard doesn't go red, the script prints **ESCAPED**.

**An escaped mutation points at the code, not just the test:** in one round, 3 of 9 mutations escaped and all three revealed real defects in the tool (an ambiguous rule silently choosing, a never-tested write path, a dead condition). Line-ending normalisation is defensive: before `.gitattributes` existed, CRLF conversion made multi-line patterns unfindable and a run reported a **false 12/12**.

## What is never cut for speed

Guard test · ≥ 2 mutations · final full run. In the session that motivated the rule, those three caught three real holes. The time savings came from elsewhere (short runs, order lock, shared skeleton, single-place documentation): projected 168 → ~90–100 min per turn.

## Question turns: max two

(a) start approval, (b) the decision package. Questions arising in between wait for the package; those that don't fit go to "ask next session" on the turn card. "You pick the sensible one" = the recommended arm; don't ask again.
