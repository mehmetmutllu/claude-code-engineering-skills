# Skill: design-review

Browser-verified UI review workflow. The rule it enforces: **never mark UI work ✅ from reading code — verify it in a real browser.**

## The loop

1. **Measure before changing.** Before touching CSS, measure the live DOM (`browser_evaluate` via Playwright MCP): computed styles, box sizes, overflow. Fixes based on guessed values create new bugs.
2. **Screenshot every claim.** Each visual change is verified with a saved screenshot per affected viewport (e.g. 375 / 768 / 1024 / 1440), named by convention: `test-screenshots/F<session>_<viewport>_<feature>.png`.
3. **Interactive states are part of the page.** Hover, focus-visible, active, open/closed disclosure states are checked in the DOM — not assumed from the stylesheet.
4. **Scroll the whole page.** Full-page screenshots hide problems; audit viewport by viewport (scroll positions, sticky elements, responsive breakpoints).
5. **Review passes, not vibes.** Run structured review passes (accessibility, contrast, spacing/token consistency, motion rules) with explicit score thresholds — a page ships when it clears the bar twice: baseline and post-fix closing pass.
6. **Zero leftover polish.** A review session closes its own findings — critical through polish — instead of accumulating a backlog that nobody drains.

## System-level rules that keep reviews cheap

- **Design tokens over magic numbers** — spacing/color/motion come from tokens; a reviewer flags any literal that bypasses them.
- **One design signature** — recurring page patterns (cards, tables, toasts) follow one documented standard, so review compares against a spec, not taste.
- **Motion rules** — durations/easings from tokens only; `transition: all` banned; reduced-motion respected.
- **Responsive strategy documented once** — e.g. wide tables get `overflow-x: auto` + minimum width instead of per-page improvisation.

## Why it works

UI regressions are the easiest defects to ship and the cheapest to catch — *if* verification is mechanical. Making "browser-verified + screenshot" the definition of done removes the entire class of "it looked fine in the diff" bugs.
