# "What's next" is derived, never copied

> **Problem:** "Next phase" gets copied into several files; each copy is a future stale copy, and a stale pointer actively misleads the next session.
>
> **Practice:** One owner (the plan's order plus an append-only status log); every repetition is checked by a sentinel; a derivation script prints the truth.
>
> **Evidence:** A `NEXT:` footer kept pointing at a finished phase; eight plans had eight different "F3"s until phase IDs got a plan prefix.

## Incidents

- A plan footer said `NEXT: R2a` after R2a was finished; noticed one session later.
- A session revised the plan at the very end, but the continue-point had been written *before* the revision — the next session was handed the wrong phase.
- A progress file kept "paket count / next phase ID / decision count" copies that drifted from the plan.
- In a second project the same status was written to both `PROGRESS.md` and an HTML dashboard; both were copies and would have diverged.

## The rules

1. **One owner.** "Next work item" is owned by the SSOT plan's *order* plus its `## STATUS` log. State files may **repeat** it for narrative, but a sentinel enforces the repetition.
2. **Append-only status log.** When a phase finishes, append exactly one line: `✅ <PHASE-ID> DONE (S<N>)`. Never write `NEXT: X`, never edit an existing line from NEXT to DONE. Worst case of an append-only log is *incomplete* (safe); worst case of a next-pointer is *wrong* (harmful).
3. **Progress file holds only non-volatile pointers:** phase name + path to the SSOT plan. No counters, no next-IDs, no hashes ("same rule as git HEAD: volatile detail is not copied, so it cannot go stale").
4. **Order of writing at session end:** if the plan was revised this session, write the continue-point **after** the plan's final form.
5. **A derivation script prints the truth.** Examples in use:
   - `tools/status.php` parses the plan's phase table (column map from the header row, loose anchors, Turkish-safe lowercasing — `mb_strtolower('İ')` yields `i` + U+0307 and silently breaks `===`) and the append-only session log, and prints "next phase / progress". Its sentinel checks: ① the derivation is **non-empty** (format drift returns zero instead of throwing — that is exactly where silent-empty is caught) ② documents that repeat the value agree ③ the log is append-only ④ the session was pushed.
   - A state/SSOT sentinel prints the derived block first, then compares the continue-point box, summary line, plan footer and progress active-phase line against it. **Broken → stop and show the user.** It runs at session start and is called by the session-record commit hook.
6. **A "▶ in progress" marker may be hand-set**, because forgetting it makes the dashboard incomplete-but-true (silence), not false.

## Plan registry

Every plan file is classified in a registry (`plans/REGISTRY.md`): `main` (main line, in order) · `side` (parallel line) · `pending` · `acceptance` (finished, waiting for user acceptance — **not** a work queue) · `closed`. A sentinel enforces:
1. a plan missing from the registry breaks the build (forces classification);
2. registry and code-side lists agree;
3. **a plan's own text may not contradict its registry class** (born when a plan was shown as "side line" while its own text said "then into the main line").

Rule: *whoever opens a new plan adds its registry line in the same commit.*

A related lesson: the registry's "session budget" column drifted (26 phases vs "21 sessions" displayed). The fix was to stop treating the column as binding — **the sum of the phase rows is the truth**, and a test (`DashboardBudgetConsistencyTest`) enforces it.

## Phase IDs carry a plan prefix

`<PREFIX>-F<n>` (e.g. `Z-F1`, `PO-F4`). Bare `F3` is banned — eight plans had eight different F3s. The dashboard parser requires `-F`, so un-prefixed "ghost phases" cannot be counted.
