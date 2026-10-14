# LLM evaluation harness: scenarios x models x repeats, blind judges, paid-cost accounting

> **Problem:** Picking a default model by impression, and paid evaluation runs that lose money or scenarios half-way.
>
> **Practice:** Scenarios x models x repeats with machine-checkable expectations; dry run -> preflight -> smoke -> capped run with resume; blind LLM judges with a rubric written before measuring, calibration and pairwise comparison.
>
> **Evidence:** The 495-turn baseline cost $1.09 in model calls and was scored by blind judges. The cheapest model became the default; fixing the weaknesses all models shared cut cost 15% and p90 latency 42% with quality unchanged (4.41 -> 4.39).

How the default model for an LLM game master was chosen with data instead of vibes. Total spend for the
baseline run: **$1.09** (495 turns). The harness lives next to the backend and reuses the real turn code.

## Shape

```
scenarios (73 defined: TR 47 / EN 26, 14 categories; 55 used in the baseline: TR 39 / EN 16)
  x providers (3 in baseline)
  x repeats   (3)
  -> each turn: seed world -> scene from snapshot -> safety-wrapped LLM -> engine turn
  -> runs.jsonl (one line per turn, append + fsync)
  -> judge-input/<random id>.json   (blind: no model name, no suggestion chips)
  -> judge-key.json                 (SECRET mapping id -> provider/model/scenario/repeat)
  -> report.json then report.md
```

Each scenario carries **machine-checkable expectations** besides the text: check requested / not requested,
reward cap respected, main-quest lock held, action present/absent, bilingual name produced, narrative
pattern, language detection, "no forbidden content". Content-trap scenarios (22) must both hear the request
and refuse it from inside the fiction - a silent topic change fails.

## Run order (never skip a step)

1. **Dry run** (no network, free): mock + a deliberately rogue fake model + a fake provider endpoint.
   Proves the harness, the expectations and the report before a cent is spent.
2. **Preflight** (cents): one tiny call per model -> HTTP 200, `reasoning_tokens == 0` when "none" was
   requested, the provider accepts the requested reasoning level, prompt cache warms on a 2nd identical call.
   If preflight fails, the measurement does not start.
3. **Smoke**: 2 scenarios per model, budget cap $0.5.
4. **Full run** with `--max-usd` cap and `--concurrency 2` (low tier rate limits).
5. **Resume** after any stop: already written (provider, scenario, repeat) tuples are skipped and **not paid
   again**; failed ones re-run.

A pre-measurement code review by 3 agents found 9 "loses money or scenarios" bugs before the first paid
call - e.g. the reasoning level was never sent so the server default (medium) would have cost 3-5x;
results were only written at the very end; no retry; paid-but-failed calls were not counted in the budget;
a regex `/bira/` (beer) matched the Turkish word "biraz" (a little).

## Money and run protection

- **Budget = what was paid**, read from the `usage` block of every HTTP response body (input, cached,
  output, reasoning) - including calls whose output later failed parsing, schema, or the content filter.
- Retries in one place (SDK retries off): 429/408/409/5xx/network -> 3 retries, `retry-after` or exponential
  1 -> 2 -> 4 s (max 60). Timeouts are not retried (the server may already have billed).
- **Stop immediately** on 401/403/404/`insufficient_quota`, or 3 consecutive failed turns: no new requests,
  records kept, print the `--resume` command.
- **Outgoing request guard:** if the configured reasoning level is missing from the request, the request is
  not sent. If "none" was requested and the response reports reasoning tokens, stop.
- Report files are never overwritten (`-2`, `-3` suffixes). JSON first, then Markdown, so a Markdown bug
  cannot lose data.
- Failed turns leave the success denominator and get their own table with reasons.

## Blind LLM-judge rubric (written BEFORE measuring)

Eight criteria, 1-5 (2 and 4 are in-between):

| Code | Criterion | Weight |
|---|---|---|
| O | Player agency - never decides or feels for the player; reports engine outcomes honestly | 20% |
| I | Relevance - answers what the player tried | 15% |
| T | Names, terms, consistency with world bible and given context | 15% |
| B | GM voice - vivid, consistent, no meta/"as an AI"/lists | 15% |
| A | Naturalness - reads as native writing | 10% |
| D | Language correctness | 10% |
| U | Length and pacing for mobile (2-5 sentences; longer is not better) | 10% |
| H | Form of address consistency | 5% |

Plus a compliance flag (yes/no, not a score), counted separately as a red line.

Rules:
- Schema validity, rejection rate and cost are **not** judged - the engine measures those.
- Judges see only what the player sees, in shuffled order, under random ids. The key is opened only after
  scores are locked.
- **Calibration:** 12 mixed items (good/medium/bad, both languages, refusals) to every judge first; any
  criterion where judges differ by > 1 is redefined.
- **Consistency:** ~10% re-scored by a different judge in different order; the gap is reported.
- **Pairwise comparison** in addition: for each scenario, "which is the better GM reply?", A/B side
  randomised. Absolute scores diagnose, pairwise ranks.
- Paired results per scenario; repeats of one scenario are not independent samples.
- Short justification only for the lowest criterion (<= 15 words). Empty/broken outputs are "unscorable"
  and counted against the model.
- Human check: 10 blind items for the owner at the end. Second opinion: 10 answers per model to another
  vendor's model with the same rubric, blind.

## Real baseline result (55 scenarios x 3 models x 3 repeats = 495 turns, 0 errors)

Judges: 8 Claude Opus agents. Calibration 12 items x 6 judges; 50 re-scored; 165 pairs.

| | gpt-6-luna | gpt-5.4-mini | gpt-6.1-sol |
|---|---|---|---|
| Weighted quality (1-5) | 4.41 | 4.19 | 4.54 |
| Engine expectations met | 92.8% | 89.8% | 96.5% |
| $ per move (measured) | $0.00026 | $0.00225 (8.7x) | $0.00409 (15.7x) |
| Turn time p50 / p90 | 2.7 / 5.3 s | 2.0 / 3.8 s | 5.9 / 11.1 s |
| Pairwise | luna 41 - 14 mini · luna 8 - 45 sol | | |

- Paired difference (95% CI): luna - mini +0.22 [+0.14, +0.31]; luna - sol -0.13 [-0.17, -0.08].
- Inter-judge spread 0.0-0.75 (only 1 case > 1 on the calibration set); re-score gap 0.19. Side A won
  102/163 pairs (mild order bias) but pairwise agreed in direction with absolute scores. Compliance flags: 0.
- **Decision:** the cheapest model became default for every move; the mid model was dropped entirely (worse
  AND 8.7x pricier); the best model is reserved for a few critical moments (<= 2% of moves).

## The most useful output: shared weaknesses

The report's best section listed weaknesses **all three models shared** - meaning prompt or engine causes
that switching models would not fix:
1. Dice-roll turns showed two paragraphs ("you try..." + the result from a 2nd call): pacing 2.87 on the
   112 two-call turns vs 4.52 on single-call turns. Fix: one call writes both branches, the engine picks.
   This also halves the cost of those turns.
2. False claims by the player ("my friend's sword") accepted.
3. Meta voice traced to one line of the system prompt that literally ordered it.
4. Name leakage - English names in Turkish text because the world bible body was in English.
5. A scenario that was itself unfair (expected a quest in one turn where a good GM waits for acceptance).

After fixing these and re-measuring (330 items, same rubric): consistency T 4.51 -> 4.78, false-claim
category 3.98 -> 4.34, quality held (4.41 -> 4.39, inside +/-0.1 noise), cost -15%, p90 latency -42%.
One regression (combat narration shrank to one dry sentence) was found by the judges and fixed.

## Multi-turn session test

Single-turn scores miss memory drift, repetition and rule fatigue. Five scripted sessions (main quest, side
quest + social, combat + rest, abuse/edge input, short English) run through the real game loop with an
in-memory DB, deterministic clock and seeded dice. Checks: repeated 5-grams, quest tracking, summary
length, false-claim acceptance, safety hits, call budget hits, cost per step, prompt growth first -> last,
cache rate. A real 5-session run cost $0.0512 total, $0.00029-0.00037 per step, prompt growth 6-9.5%,
cache 85.8-89.2%.

## Per-call logging in production

Every AI call writes a row: provider, model, tokens (input/cached/output/reasoning), ms, cost, rejected
ops count, phase (`propose`, `regenerate`, `summary`, `memory_translate`...). Cost per player-hour =
$/turn x turns per hour (60, a config value). Model choice, quotas and caps live in config, not code.
