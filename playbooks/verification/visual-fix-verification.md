# Verifying visual fixes: measure the right box, negative-control the probe

> **Problem:** "Fixed" visual defects come back because the check never observed them: a 1x screenshot, a probe blind to clipped content, a stale viewport.
>
> **Practice:** Measure computed box geometry, use a fresh browser context per viewport, and negative-control every probe by removing the fix and watching it fail.
>
> **Evidence:** The negative control of a clipping probe reported 53.5 px and 25.4 px overflow at 390 px; the defect class had escaped twice before.

## Rules

1. **A 1× screenshot is not evidence.** Zoom 4× or measure (`getComputedStyle` / box geometry). And "computed style says applied" isn't enough either — some elements don't pass the rule to their inner structure (`input[type=file]` with flex). Real case: a file-picker button was "fixed" in one session and reported again by the user two sessions later. **If the user reports the same defect twice, assume the first fix was never measured** and research the root cause from scratch.
2. **Measure the DOM before changing CSS**, and verify interactive states (hover, focus, open drawer) in the DOM — wait ~250 ms for drawer/modal transitions; an instant `evaluate` lies.
3. **Fresh browser context per viewport.** Resizing an existing context (`setViewportSize`) gave misleading responsive measurements.
4. **Full-page screenshots drop touch mode** (`pointer: coarse`) in automated browsers — measure first, then capture.
5. **Scroll-by-scroll audit**, not one full-page shot: every viewport, scroll + interactive states + responsive active state + "does the UX make sense?". All four or don't mark it done.

## Choosing the probe (from an architecture decision record)

The defect class: fixed-size assets in fluid boxes get clipped, and `body { overflow-x: hidden }` hides it — `scrollWidth == clientWidth`. It escaped twice, both times after a probe reported the page clean.

| Method | Problem |
|---|---|
| `getBoundingClientRect()` | includes transforms; an animated element rotating 14° and scaling 1.05 gives a permanent false alarm. Disabling transforms breaks legitimate `translate(-50%,-50%)` layouts → false alarms the other way |
| `offsetWidth/Height` | doesn't exist on SVG elements — the main targets |
| **computed width/height + padding + border** | used value, transform-independent, works on SVG ✓ |

Decision: compare the asset's border-box with its container's content box (tolerance 1 px; real defects measured 25–100 px). Two qualifiers: **open hidden states one by one** (three of four scroll "acts" were `hidden`; the defect lived in act 3); **don't assert fill ratio** — a 45% threshold flagged three intentional placeholders; "too small in its box" is a design judgement for the design round, the test only asserts "doesn't exceed its frame". Documented limits: compares size not position; uses `parentElement`, not the nearest clipping ancestor.

## Negative control — every time

Temporarily remove the fix; the spec must go red and **report the measured numbers** (first run: 53.5 px and 25.4 px overflow at 390 px). Then restore. A probe that was never seen failing is not a probe.

## Measurement is not the whole check

Proportionate measurement: browser automation for behaviour and geometry; colour/size judgement by eye. And a green geometry suite says nothing about readability — see [verify-tool-findings](verify-tool-findings.md) case 5.
