---
name: blind-second-review
description: >-
  Run an independent, clean-context second review of AI-produced content batches (multiple-choice
  distractors, translations, example sentences, labels) with a seeded 25% sample, a pre-set
  disagreement threshold and batch rework. Use when a batch of generated or selected content must be
  quality-checked without a human proofreader, when the user says "audit", "second eye", "blind
  review", "check the batch", or before loading content into the app.
---

# Blind second review

The agent that produced a batch is never its only judge. A second agent with a clean context reviews a
reproducible sample without seeing the first agent's decisions, and the batch is redone if they disagree
too often. The owner is not asked to proofread.

## Before the run (write these down, do not change them after seeing results)

1. **Labelling scale** for the content type. For fill-in-the-blank distractors:
   - `U` fits naturally - even a learner who knows the word can't eliminate it (two right answers)
   - `Z` grammatical, odd but defensible
   - `H` grammatical, clearly wrong in meaning - **only these may be selected**
   - `B` broken grammar or a form cue that gives the answer away
   For translations: back-translate blind (see step 5).
2. **Sample rule:** `random.Random('<batch-name>').sample(ids, ceil(n/4))` - 25%, seeded by batch name.
3. **Threshold:** disagreement > 5% -> the whole batch is redone.
4. **Acceptance criteria for the final product** (e.g. two-right-answers < 2%, form-cue < 5%).

## Steps

1. Producer agent writes a decision file per batch (`<batch>.json`): every candidate labelled, 4-6 selected,
   or an empty selection + `needs_new_sentence: true` + a short reason. No items outside the candidate pool.
2. Run the structural check (`<tool> --check <batch>`); it must pass before review.
3. Spawn the reviewer agent with ONLY: the labelling table, the candidates and sentences for the sampled ids,
   and the output format. **Do not pass the decision file or the producer's reasoning.**
   Reviewer writes `<batch>.review.json`: `{"items":[{"id":..,"labels":{candidate: label}}]}`.
4. Compute disagreement: a *selected* item the reviewer labelled anything but `H`.
   `rate = disagreeing selected / reviewed selected` (use `tools/blind_sample.py`).
   - Remove every disagreeing item regardless of the rate.
   - Rate > threshold -> new producer agent, brief includes the disagreement examples; review again.
5. Translations: a clean-context agent translates the target-language text back **without seeing the
   source**; diff meaning, tense, quantifiers (both/either/all), subject. Fix, then re-run.
6. If the corpus has its own human review signal (votes, flags), use it as a third independent check.
7. Append recurring disagreement patterns to the producer instructions as "common mistakes" so the next
   batch avoids them.
8. Report to the owner: batches, first-pass rates, which batches were redone, final rates, what was fixed.
   Never "please review" - only real product decisions go to the owner.

## Rules

- Reviewer is strict: when unsure, label `U` or `Z`. Two right answers is the worst failure.
- Sources: select from licensed human-written material where possible; generate only when nothing fits,
  and prefer changing the item over generating.
- Reviewers have read-only access to decision files; no git, no browser, no files outside the batch.
- Write JSON with `ensure_ascii=False` so non-ASCII text stays readable in diffs.
