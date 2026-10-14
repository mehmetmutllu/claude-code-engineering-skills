# Blind-review content pipeline

> **Problem:** AI-produced educational content at scale, for an owner who will not proofread it.
>
> **Practice:** Select from a licensed human-written corpus instead of generating; a clean-context second agent labels a seeded 25% sample blind; more than 5% disagreement redoes the whole batch.
>
> **Evidence:** 5 of 15 topic batches were redone on the first pass and all ended at <= 4%; audited distractors went from 457 to 616 of 728 words; blind back-translation produced 19 translation fixes.

How AI-assisted educational content (example sentences, translations, multiple-choice distractors) was
produced for a vocabulary app without the owner having to proofread anything. The owner's rule:
"I can't review and fix everything, you have to." So quality control is built into the pipeline.

## Principles

1. **Select, don't generate.** Example sentences are not written by an LLM. Candidates are filtered from a
   human-written, licensed bilingual corpus (Tatoeba EN-TR pairs, CC BY), and the model **chooses** among
   them and fixes the translation if needed. Coverage of >=3 usable candidates per word measured before
   committing to this: A1 98% · A2 94% · B1 83% · B2 62%. Only when no candidate exists does anything else
   happen - and then changing the word is preferred over generating a sentence.
2. **Licences decide sources.** Word lists and corpora are checked for commercial use and local-storage
   rights before use; attribution fields (sentence id + author) are stored per item; edited translations
   keep the original in a separate field and are marked "modified".
3. **Two independent eyes.** The agent that selects is never the only judge. A second, clean-context
   agent reviews a sample **without seeing the first agent's decisions**.
4. **Thresholds are written before the run** and do not move after results come in.
5. **Every stage is a script with an exit code.** Nothing is accepted by "looks fine".

## Pipeline (one batch = one topic)

```
selection/<topic>.json      hand/agent picked: [word, meaning, en_sentence_id, tr_sentence_id, fixed_tr?]
  -> write_selection.py     builds the topic JSON; keeps distractors of unchanged sentences, drops changed ones
  -> distractor_candidates.py   ~10-15 candidates per word: same POS, same/lower level, from our own pool,
                                not a target of the same lesson, not a synonym/antonym
  -> agent labels each candidate U / Z / H / B  (see below), picks 4-6 H
  -> blind reviewer labels a seeded 25% sample  -> disagreement rate
  -> validate.py            structural + linguistic checks, exit 1 on any error
  -> lesson_check.py        lesson layout rules (8 items per lesson, pairs that must not share a lesson)
  -> loader (dry run first) -> package build
```

## The labelling scale (distractors for fill-in-the-blank)

| Label | Meaning | Selectable? |
|---|---|---|
| **U** | Sentence is natural and correct - even someone who knows the word cannot eliminate it ("two right answers") | no |
| **Z** | Grammatical, meaning odd but defensible if the context is stretched | no |
| **H** | Grammatical, clearly wrong in meaning - a learner who knows the target eliminates it | **yes, only these** |
| **B** | Grammar/inflection/article broken, or a form cue (`an` + consonant) gives the answer away | no |

Standard: an A1-B2 learner who knows the target's meaning can find the answer alone; one who doesn't finds
all options equally plausible. When in doubt, say U or Z - two right answers is the worst failure.

## Blind second review

- Reviewer gets the candidates and sentences, **not** the decision file.
- Sample: `random.Random('<topic>').sample(ids, ceil(n/4))` - seeded by topic so the sample is reproducible.
- Disagreement = a **selected** distractor that the reviewer labelled U, Z or B.
  Rate = disagreeing selected / reviewed selected.
- **> 5% -> the whole batch is redone** by a fresh agent whose brief includes the disagreement examples.
- A disagreeing distractor is removed in every case, even when the batch passes.
- Recurring disagreement patterns are appended to the instructions as "common mistakes" (e.g. person nouns
  in "go to the ___" are defensible -> Z; "It is ___ to V" only takes evaluative adjectives -> others B).

Result on the real run: 728 topic words; 5 of 15 topics exceeded 5% on the first pass and were redone;
after rework every topic was <= 4%. 457 words got audited distractors in round one; after replacing 238
sentences with ones that actually determine the target, 616 / 728.

## Blind back-translation (for translation fixes)

- A clean-context agent sees only the Turkish sentence and translates it back to English **without seeing
  the original English**. Meaning drift, tense shifts and subject mix-ups surface as differences.
- Third independent signal: the corpus's own human review votes (no negative votes on 243 changed sentences).
- That run produced 19 translation fixes (subject confusion, tense, word choice).

Translation rules that came out of owner feedback:
- The taught word's equivalent stays **visible as one unit** in the translation (learner must find it).
- Quantifiers (both/either/all), number and tense are mirrored, not "naturalised" away.
- Natural phrasing that keeps both properties is searched for before giving up either.

## Measure the problem before fixing it

Before the redesign, 220 fill-in-the-blank questions were sampled and measured: ~14% had at least one
fully correct wrong option (95% CI 10-19), ~20-24% had no distractor matching the blank's part of speech
(answer obvious from grammar). Root cause: distractors were picked without looking at the sentence.
Acceptance criteria for the fix were set from this: two-right-answers < 2%, form-gives-it-away < 5%.
Literature reviewed first (item-writing guidelines and distractor-generation papers): an LLM alone
produced only ~67% sound distractors in one study -> review is mandatory.

## Sentence replacement criteria (when the sentence does not determine the target)

A sentence like "Do you have a ___?" admits any noun. Replacement test: put 5 frequent words of the same
type into the blank - none may be natural, at most one defensible with effort. Defining context ("My
mother's mother is my ___"), fixed collocations ("brush your ___") and cause/effect are strong; "very / so
/ a ___" frames are weak. If no corpus candidate passes, record `"status": "no_candidate"` and keep the old
sentence - never invent one.

## Agent restrictions in content batches

No browser, no git, no files outside the topic, decision files read-only for reviewers, never change the
meaning list unless the brief explicitly asks. Output written with `json.dump(..., ensure_ascii=False)`.

See the [blind-second-review skill](../../skills/blind-second-review/SKILL.md) and [tools/blind_sample.py](../../tools/blind_sample.py).
