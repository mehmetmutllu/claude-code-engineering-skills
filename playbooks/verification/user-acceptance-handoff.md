# Work end ≠ session end: the three-phase handoff to the user

> **Problem:** Agents treat "save the session" as the handover, but the user catches problems the moment the agent reports. Without a test recipe at that point, the report is half a report.
>
> **Practice:** Work end comes before session end: finish your own measurement, reset test data, write a hand-executed recipe in the user's language, then stop and read the user's notes.
>
> **Evidence:** The notes file showed 77 of 92 notes open; only 38 really were. A scenario dataset exposed a delete dialog that lied, which no schema test caught.

## Three phases, not two

1. **Session start** — read state, report, mark the plan line being worked on with `▶`.
2. **Work end** (before any commit or session record):
   1. **Finish your own measurement.** "No errors" ≠ "looks right": an empty cell, `--:--`, a counter that disagrees with its list — all count as defects.
   2. **Reset test data.** Restore whatever your own test consumed; never leave the user a spent dataset.
   3. **Write the test recipe first**, into a checklist file the user reads (a "dashboard"). The recipe is **executed by hand before it is written**: walk the real clicks end to end, write the navigation path using the menu labels the user sees ("Management › Lesson Hours"), and put the **expected result** next to every step.
   4. **Report + recipe → STOP.** The report says *what happened*, the recipe *where to try it*. Do not move to the session record.
   5. **Read the user's notes.** Each note is either solved now or written into a plan — say which, explicitly.
   6. **Close notes.** A solved or planned note is closed in the same session with its reason (`- [x] … — closed DD.MM.YYYY (solved: S418 / moved to plan: G6b)`).
3. **Session end** — only now: state files, commit, push.

## Recipe format (user language)

```markdown
## S<N> — <DD.MM.YYYY> · <short title>

### Done
- <plain sentences about what changed, no jargon>

### Check
- [ ] <what to look at> → <menu path>
  - why: <plain reason>
  - LOOK: <where> » <what you should see>
```

**Jargon is banned and enforced:** no file names, table names, function names, SQL terms. A sentinel scans the checklist text and fails if any leak in. A sentence must answer *"what will I see, where do I look, is it right?"*

## Scenario tenant

For anything the user should try, build a **persistent scenario dataset** with a script: `scenario.php {setup|status|teardown}`. It keeps its own IDs stable across `setup`, includes every role needed (admin, staff, end user, parent…) and the `status` command prints the counters the user should compare before/after. Later phases extend the same scenario instead of building new ones. The recipe always lists the accounts to use — a rule born when the user said *"I don't have an account with that state; in such cases you need to give it to me."*

Real case: a schema test said "691 → 0 orphaned rows". Only the scenario tenant revealed that the deletion confirmation dialog was now *lying* ("2 attendance records will be deleted, cannot be undone" — but nothing was deleted). No schema test would have caught that.

## Note-closing discipline (measured)

Measured once: the notes file showed **77 of 92** notes open; only **38** actually were. 39 notes had been solved or moved into plans but never closed — and the whole 33 KB file was re-read at every session start. Accumulation was ~55 notes per 6 weeks, caused solely by the missing close rule. A sentinel now tracks the open-note count.

## Gate

See [commit-msg-session-gate](../../hooks/commit-msg-session-gate.md): product-code commits are rejected unless the checklist file gained a new block.
