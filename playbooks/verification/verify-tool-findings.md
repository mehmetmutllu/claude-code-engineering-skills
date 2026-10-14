# Verify the finding before fixing it — including the finding's own rationale

> **Problem:** Audit tools, review agents and earlier plan entries produce findings that sound authoritative. Acting on them unverified wastes sessions or puts the fix in the wrong place.
>
> **Practice:** Reproduce each finding yourself; check the finding's own rationale (who actually reads this file?); treat a scan's coverage as only what the scanner can see.
>
> **Evidence:** Four page-speed findings were caused by the host's bot protection; 4 of ~19 review-agent findings were false; Lighthouse swung 96 to 49 on the same page.

## Case 1 — performance tool findings that weren't real

A hosted page-speed audit reported four problems: a JS file with `SyntaxError: Unexpected token '<'`, a font timing out, a 5.3 s server response, a malformed `robots.txt`. Requested one by one: JS 200 with correct MIME and size, font 200, TTFB 0.4–0.6 s. Root cause: the host's IP+rate-based bot protection served a challenge page when the auditor fetched dozens of resources in seconds. **Not fixable in code** — trying would have been wasted effort.

Same project: a design-review agent produced ~19 findings over 3 rounds, **4 were false** (a gap that didn't exist, a wrong grid count, unchecked alt text) and it missed a real defect. Local Lighthouse on that machine swung 96 ↔ 49 for the same page.

**Apply:** before relaying a tool report or changing code, verify each item yourself — `curl -D` (status, MIME, size), `curl -w '%{time_starttransfer}'`, grep + line number. Never trust a single run for CLS/TBT. Report verified "not ours" items *with evidence* (useful when writing to the host). Record refuted hypotheses in a "CLOSED ITEMS" list so the next session doesn't reopen them.

## Case 2 — the rationale was wrong, so the fix location was wrong

An external review said a design-principles file was "automatically read by the design-review agent and the design skill". Measured: the agent definition (107 lines) never referenced it; the only skill that did was postponed. The real reader was the main session itself. The false claim had spread from the file's own header and imposed a non-existent constraint for **four months**.

Ask three questions before applying any finding — **measure, don't read them from the plan:**
1. Who *actually* reads/calls this? (grep the definition)
2. What is the claimed number/version *today*? (run it, don't copy)
3. Who is affected by the fix?

If the rationale is wrong, fix and seal the **rationale** in the plan, or the next reader starts with the same error.

## Case 3 — a scan's coverage is only what the scanner can see

"All surfaces scanned" missed two pages that built SQL by concatenating fragments — the pattern never matched; an agent sweep found them. "Three places write attendance" was four. Rules:
- Count coverage claims and write the count into a sentinel, so N+1 breaks the test.
- Search by meaning, not by one spelling; add an agent sweep when in doubt.
- Bulk find-replace on lines with multiple matches is dangerous: the same SQL line appeared 3 times, two of them in queries without that alias — touching them would have broken the query. Edit one by one with context.

## Case 4 — don't label before checking the domain

Before calling a field "missing" or "a bug": check the domain model (what the concept *means*, which table holds it — words mislead: a table named like "appointments" actually held one-to-one *lessons*), scan synonyms (rating/score, comment/coach_note/notes) and test **capture → store → display** end to end.

## Case 5 — a tool's green is not a screen's quality

An accounting dashboard was closed twice with "measured with Playwright, no overflow, console clean" — and rejected twice by the user: *"no narrative… alignment is bad, data everywhere that confuses."* Bounding boxes say whether a box overflows, not whether a page is understandable. A screen ships only after all three: numeric measurement (for defects) · comparison with established apps doing the same job · a design-skill pass (hierarchy, reading order). The answer to "no narrative" is layout, grouping, alignment, headings — **not paragraphs of explanation on screen**.
