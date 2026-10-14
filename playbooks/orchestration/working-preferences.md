# Working preferences: a non-specialist owner directing Claude Code

> **Problem:** An owner who decides product and design but does not review code or content gets either too many questions or silent changes.
>
> **Practice:** Standing rules, each saved after an incident: report every visible change, ask product questions as one-sentence rules, filter agent reports, never say "please review", respect hard console boundaries.
>
> **Evidence:** 17 rules, each with the incident behind it (e.g. a review timer added silently; a 1426x7346 px board unreadable on a phone).

These are the owner's standing instructions, distilled from feedback that was saved as persistent memory
after something went wrong. Each rule has the incident behind it. They are written for an owner who
decides product and design but does not review code or content line by line.

## Communication

1. **Report every user-visible change, item by item.** New card, screen, button, text, number, behaviour,
   default - and invisible changes that affect behaviour (thresholds, flags shipped off). Trigger: a review
   timer was added silently; "if I didn't open the app I'd never know."
2. **Ask product questions as one-sentence rules.** "If you sign in, everything is tied to the account."
   Scenario tables, edge cases ("what if a guest restores on another phone...") and internal timing details
   are not questions for the owner - the developer solves and tests them. Trigger: relaying raw agent reports
   "confused everything", and a technical note was misread.
3. **Filter agent reports before relaying.** Only decisions that change product behaviour go up; the rest
   is "handled" in one line.
4. **Always answer in the owner's language**, no drifting into English.
5. **User-facing copy is natural and plain.** No device-pointing phrases ("your progress came to this
   phone"); write "Your progress is loaded."
6. **Visuals sent to a phone stay readable without zooming:** one image <= ~1600 px tall; split long
   boards per section. A 1426x7346 board became unreadable when zoomed.

## Decisions and design

7. **Plan -> design approval -> sprint.** Big work starts with a plan; each design screen is approved
   separately; only then the sprint.
8. **Show design options live, side by side.** 3-4 variants in a preview harness with real app copies,
   checked by screenshot first, with a recommendation. Text descriptions of options do not produce decisions.
   Keep tried variants ("don't lose them, we may change").
9. **Simplicity first.** Few elements, one focus, short lines without explanations, lots of space, fits one
   screen without scrolling. Upsell elements are not pushed in the user's face. Trigger: four rich variants
   all got "too complex, I couldn't decide."
10. **Verify a "new" claim before presenting it.** Compare like with like (same colour, same size) before
    saying an asset is missing from our set. 13 "new" items turned out to be colour variants of existing ones.

## Autonomy

11. **Batch work with a known flow: don't ask "shall I continue?"** Finish all batches, commit each one,
    one report at the end, short status lines in between. Still ask for out-of-scope or hard-to-undo steps.
12. **The owner does not proofread content.** Do your own audit round (naturalness, meaning, consistency),
    fix what you find, and report "audited, fixed these, this one is your call" - never "please review".
13. **Context economy is your job, unprompted.** Hand-off note + fresh agent at ~200k tokens; close and save
    the main session around 30% context; stop finished agents that left background loops; start long
    renders detached from the session. Don't do it when it would hurt quality.

## Hard boundaries

14. **Some consoles are off-limits to the AI entirely** (not even opening the page). Work for them is
    delivered as files + a guide for the human who has access. Other consoles: ask every single time before
    entering; local emulators and CLIs are fine.
15. **"Tested" is written only when the owner confirmed it on a device.** Otherwise the ledger says what was
    tested where ("not tried on a phone, APK only built").
16. **Only request device tests the owner can actually run** (e.g. no iPhone available -> real-device tests
    on Android; iOS verified via CI artifacts).
17. **Large outputs go to the disk with space**, not the nearly full system drive.

## Project hygiene rules carried into every CLAUDE.md

- Secrets only in `.env`; check `git status` for leaks before every commit.
- Schema change = migration file; never transport schema via dump.
- No `git add -A`; add files one by one. No force push, no `--no-verify`.
- Verify a reference (path, function, endpoint name) with grep/read before writing it into a state file.
  Don't copy references from another document - stale reference chains are the sneakiest drift.
- Stay in scope: no unrequested refactors or "while I'm here" cleanups; note them in the active-context
  file to be handled in order.
- New code goes into a new file where possible, not into the 4000-line app file; shared wiring is done by
  the orchestrator.
