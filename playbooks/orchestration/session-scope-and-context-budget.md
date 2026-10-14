# One main task per session — and stopping before context degrades quality

> **Problem:** Long sessions that compress several tasks produce subtle misses and burn context that later work needs.
>
> **Practice:** At most one main task plus one small side task per session; save at ~50% context; stop at a natural boundary and leave the next job with acceptance numbers.
>
> **Evidence:** A session that combined four items and two phases produced four detail defects; the planned audit was re-sized from ~42 to ~84 sessions.

## Rule: max 1 main task + 1 small side task

Origin: in one session four items plus two phases were done together; the user then reported four detail defects (a modal footer, two bars no longer side by side, a broken flex row, thin reset buttons) — attention was split and DOM verification was skipped. The user's instruction: *"every context swells with edits; at least double the number of sessions; work much shorter per session — the AI works better and it's cheaper."* The planned audit was re-sized from ~42 to ~84 sessions (≥ 1 session per page).

How it's applied:
- One page audit + its skill calls + fixes = one session. Don't move to the next page.
- A cross-page fix is its own session or an explicit sub-phase.
- New protocol rule + memory update + audit in the same session → split.
- Write "what we'll do today" at the start; **scope expansion is banned**.
- The rule is portable as one table row in `CLAUDE.md`:
  `| Session scope — max 1 main + 1 small side task per session. No multi-task compression. |`

## Rule: save at ~50% context

User rule: *"if context reaches 60%, or whatever limit starts degrading quality — even 50% — save the session, stop the agents you need to, then notify me; I'll clear and resume."*

1. Finish the small step in hand (never leave a half-edit). Stop running background agents/tasks.
2. Run the full session-end protocol without asking.
3. Send a push notification: "saved, `/clear` → resume command". (The user often works remotely from a phone; the notification calls them back.)

There's no exact meter; estimate from conversation size and **stop early when in doubt**. In sprint sessions ask after each phase: *"does one more phase fit?"*

## Rule: stop at a natural boundary, never mid-decision… or mid-code

From the night-session protocol of a game project: *"working non-stop doesn't mean 'continue until the end' — close at a natural stopping point."* The natural points are the end of a measure step (measurement committed, decision section empty) or a full test + commit + push. When stopping, leave in the state file *"next session's job" + its acceptance criteria as a list of numbers*. **"Don't leave half-written code; leave a half-made decision."**

## Rule: split a task into at most two parts

Only if needed; the cut line is a green intermediate state; logic and visual work go in separate parts.

## Why it works

Short sessions + a ≤ 200–400 line state file (see [memory-model-evolution](../memory/memory-model-evolution.md)) mean every session starts with an accurate picture in under a minute, and quality doesn't degrade in the second half of a long context.
