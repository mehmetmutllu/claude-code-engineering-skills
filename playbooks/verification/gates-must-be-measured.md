# A gate you don't measure is a gate you don't have

> **Problem:** Hooks, CI jobs and sentinel scripts feel like protection. The expensive failure is not a gate that answers wrong, but one that silently doesn't run and keeps printing green.
>
> **Practice:** Break every gate on purpose once; give it a canary it must find; check its existence and executable bit; use a distinct exit code for "could not measure"; run it in CI too.
>
> **Evidence:** Seven silent failures in one long-running project, e.g. a pre-commit config that never ran for ~4 months and a PHPStan job that was green after analysing 0 files.

This playbook comes from a long-running multi-tenant SaaS (500+ numbered AI-assisted sessions) where the same class of defect was found in five different places within a few weeks, each time by accident.

## The incidents (all real, all silent)

| What was believed | What was actually true | How long |
|---|---|---|
| `.pre-commit-config.yaml` runs 4 checks (secret scan, `php -l`, tenant filter, large file) on every commit | `git config core.hooksPath tools/git-hooks` had been set. Git then **never looks at `.git/hooks`** — which is exactly where the pre-commit framework installs its hooks. Two mechanisms cancelled each other. | ~4 months |
| Hook scripts are executable | They were committed with mode `100644`. On a fresh clone they would silently not run. Found by the first run of a "gates are alive" sentinel. | since creation |
| PHPStan job in CI is green | The PHPStan bootstrap included product code, which called `exit()` when `.env`/`vendor` were missing. **`exit()` returns 0.** Zero files analysed, 18 seconds, ✅. | months |
| The IDOR runtime script verifies tenant isolation | It only *printed* the expected behaviour as text; no comparison, no exit code. A leak and no leak produced identical output and `0`. | since creation |
| The state-budget sentinel blocks oversized session state | The sentinel did fail — but the `commit-msg` hook never called it. The state file grew to 1,586 lines. | weeks |
| A text-search sentinel enforces a SQL rule | The pattern it searched for also appeared in the function's own **doc comment**. The rule was deliberately broken; the sentinel stayed green. | 4 occurrences |
| A UTF-8 scanner finds non-ASCII markers | The `/u` flag turned `[\x80-\xFF]` into a *code point* range; `✅` (U+2705) was never matched. In product code `ltrim($s, "✅▶ ")` treated the list as **bytes** and produced invalid UTF-8, so every later `/u` regex silently returned `false`. | years |

The project's own one-line summary: **"A written but unmeasured rule is an unapplied rule."** And: *"A written rule can be forgotten; a gate cannot."*

## The method

1. **Break it on purpose.** After building a gate, deliberately introduce the defect it guards against and watch it reject. Seeing it pass is not evidence.
2. **Add a canary.** A gate must *find* a known defect to prove it ran. Example: a file with an intentional undefined variable that PHPStan must report via a separate short config; if it isn't reported, CI fails. Never base "green" on exit code alone — `exit 0` means "didn't crash", not "passed".
3. **Measure the gate's existence.** A small sentinel checks: hook files present · executable bit (`100755` in the git index) · `core.hooksPath` points to the right place · the competing mechanism (`.pre-commit-config.yaml`) has **not** come back. Call this sentinel from the hook itself and from CI.
4. **Single mechanism.** Pick one hook location. A second mechanism doesn't add safety; it can disable the first.
5. **"Environment not ready" is its own exit code.** A runtime test that can't log in, or whose server is down, must exit `2`, never `0`. Otherwise "every request was rejected" looks identical to "isolation works".
6. **Measure behaviour, not source text.** If a sentinel must read code, strip comments at the token level first; better, run the code against a fake driver and inspect what it actually produces.
7. **Mind the timing.** A gate that fires after the moment it protects is useless. Example: a rule "every handoff to the user must include test accounts" was enforced only at the session-end commit — but the test recipe was handed to the user *before* that. Bind rules to the earliest observable point (the daily sentinel suite, not only the final commit).
8. **Give twin rules the same measurement.** If one rule is checked against the real file on every run and its sibling only against a synthetic sample, the sibling is blind.
9. **Can the gate read what it measures?** Encoding assumptions (bytes vs code points, CRLF vs LF, `/\R/` splitting UTF-8) belong in the "break it" round.
10. **Baselines may only shrink.** A known-failures list is enforced in both directions: a new failure breaks the suite, *and* a listed item that now passes breaks the suite until its line is deleted. Otherwise the list rots like a PHPStan baseline.
11. **Exclusions need a written reason.** A self-discovering test runner (it finds every `tools/smoke_*.php` without a manual list) keeps exclusions in a map `name => reason`; an empty reason fails the run, and the run always prints "N ran, M skipped (why)". Narrowing coverage becomes a visible act.
12. **Run new gates in CI too**, not just locally. One new sentinel compared "documented local PHP version" with the version of *whatever machine ran it* — impossible to satisfy on both laptop and CI runner; CI stayed red for 9 hours.

## The rule-birth loop

```
user catches a problem → measure it → write the lesson (Rule → Why: which incident → How to apply)
→ if it can be mechanised, bind it to a gate → break the gate once to prove it
```
Heuristic used in practice: **if a rule has been violated three times, it goes into a hook, not into another document.**

## Checklist for a new gate

- [ ] Deliberately broken once; rejection observed
- [ ] Positive liveness proof (canary / count of files analysed / expected finding)
- [ ] Existence + executable bit checked by a sentinel
- [ ] Distinct exit code for "could not measure"
- [ ] Runs in CI, not only locally
- [ ] Fires before the event it protects
- [ ] Exclusions/baselines are justified and shrink-only
