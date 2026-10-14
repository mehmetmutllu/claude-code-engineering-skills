# What to ask the user, what to decide yourself, and how to show options

> **Problem:** An agent that asks too much stalls the work and hands the user decisions they can't evaluate; one that asks too little takes decisions that aren't its own.
>
> **Practice:** Ask only about what the end user will see; decide technical forks yourself and record the rejected options; show visual options rendered side by side with the recommendation pre-marked.
>
> **Evidence:** Distilled from repeated user corrections across several projects; a single frame with 12 rendered candidates unblocked an aesthetic decision that text descriptions had stalled.

## Ask vs decide

| Situation | Do |
|---|---|
| Changes what the end user sees: behaviour, pacing, visuals, scope | **Ask** |
| Only code structure, data shape, file layout | **Don't ask.** Pick the best option, justify it in one paragraph, record it with the rejected options. User's words: *"whatever is highest quality, do that."* |
| One option would break a written guarantee of the system | **Not a question.** Decide and show the concrete consequence. (Asked "should the frozen report of a closed period stay, be deleted or be regenerated?" — reply: *"isn't a snapshot supposed to stay? I don't get it."* A fake choice also lowers the weight of real questions.) |
| Genuinely risky and genuinely the organisation's call | Present options **with their risks**; don't reject or apply unilaterally |
| The user questions a task ("is this needed? why?") | It's a real question, not a request for approval — measure the rationale; if it isn't needed, say so |
| A minor pre-existing breakage found on the way | Fix it without asking if small; plan it if large. "It was already broken" is not a report item. |
| An audit finding would change a previously approved design | Don't offer options; grep the plan's decisions first |
| A design rule conflicts with an existing screen | Ask with an annotated screenshot; no silent "fix" |

## Show, don't describe

- For quality/aesthetic forks, describing arms in text fails (*"just set the most sensible one"*, *"give me options and we'll look"*). What moved one round forward was **12 candidates rendered in one frame**, same scene, same light, with scale lines. Use **6–12 candidates**, not 2–3 — the user chooses by elimination.
- Put a frame even under a **numeric** decision package. The user answered the frame, not the table, and added a defect nobody measured (a 3 px inner glow). *"Measurement knows what it counts; the frame shows what it didn't ask."*
- **Re-read the reply.** The chosen arm may not be the packaged arm: *"C2 is great, but make every area I haven't opened like that"* redefined the scope. Words like "but", "like this", "everywhere" are the new definition — code to them.
- For non-visual product forks: give a paragraph on how comparable products do it, and hand over a playable/installable build to try.
- Before redesigning a screen the user calls "too detailed", research comparable apps first.

## Artifacts are for reading, chat is for choosing

Clickable choice chips inside a published page failed: *"I can't click them."* The page was fine; the user viewed it on a non-interactive surface. Pattern that worked: publish the board (numbers, comparisons, rendered candidates) with the **recommended option pre-marked**, then ask in chat (structured question or a short reply format). Result: *"most things are already selected, go with them."*

## Decision package format

`arm | number | trade-off | recommended ✓`, plain language, each option illustrated with a concrete example from the product. Recommend "highest quality", not "least work". At most two question rounds per session (start approval + one package).

## Keep the user's words literal

- Don't turn an impression into a new rule ("it should feel white" ≠ "change the background colour"); touch only the element that was named.
- Additions the client didn't ask for are flagged **when added**, not discovered later.
- "Nobody understands it" → remove the abstraction, don't write an explanation. Screens don't get explanatory paragraphs; text goes in a tooltip or nowhere.
- Don't swing to the opposite extreme: "the card is empty" is solved by filling the card, not deleting it. Reduce the complaint to its adjective.
