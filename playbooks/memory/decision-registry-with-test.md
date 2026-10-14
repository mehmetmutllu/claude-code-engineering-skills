# Decision registries — and a test that guards the registry itself

> **Problem:** AI sessions re-open settled questions or act on half-remembered decisions. A decision log fixes that, until the log itself becomes ambiguous.
>
> **Practice:** Supersede, never delete; every decision carries its "why"; a test guards the registry itself (unique numbers, a non-empty parse).
>
> **Evidence:** Three registry styles in use (34 ADRs; 45 numbered decisions; D-001...D-168 short records). Two decision numbers issued twice went unnoticed until someone cited one.

Three registry styles were used across projects; each solved a different pressure.

## Style 1 — ADR (e-commerce project, 34 records)

`decisions.md`, format **Context → Decision → Consequences**, newest at the bottom, each with `Date` and `Status`. Reversed decisions are **never deleted**: they get `[SUPERSEDED by ADR-NN]`, and the new one says `[supersedes ADR-NN]`.

What made the ADRs valuable was recording *rejected alternatives with measurements*, e.g. an ADR on a layout-clipping probe compared three measurement methods (`getBoundingClientRect` includes transforms → permanent false alarms; `offsetWidth` doesn't exist on SVG; computed style + padding + border works) and stated what the probe deliberately does **not** claim.

ADRs also recorded *process* decisions, e.g. "dev CLI scripts may run without asking; destructive flags, pushes to main, production deploys and ad-hoc SQL on user data still need explicit approval; every auto-run is followed by a short report".

## Style 2 — numbered binding decisions (two-developer SaaS, 45 entries)

`context/decisions.md`: *"Not discussed again. If it changes it is **not deleted** — struck through, new decision added with a session seal."* Each entry: **What → Why → How it's applied**, plus "accepted cost" where relevant. Sections by topic (Technology · Product · Process · Brand).

**The incident:** Two decision numbers were each issued **twice** — sections are topical, so numbers don't flow in order; a session adding a Process decision continued from the highest number *in that section*, not in the file. Nothing complained: valid Markdown, green tests. The defect only surfaced when citing: 20+ code/test references pointed to the first entry with that number, four doc lines to the second. A column-drop rationale cited the number; anyone opening it found an unrelated anonymisation decision.

**Fix:** later duplicates renumbered to fresh numbers; references in code left untouched (they meant the originals). Header rule: *"Number from the highest number in the **whole** file, not from the end of your section."* And a guard test:

```php
// tests/Feature/DecisionRegistryTest.php (sketch)
public function test_decision_numbers_are_unique(): void
{
    $text = str_replace(["\r\n", "\r"], "\n", file_get_contents(base_path('context/decisions.md')));
    preg_match_all('/^### K(\d+) — (.+)$/m', $text, $m, PREG_SET_ORDER);
    $this->assertNotEmpty($m, 'No headings parsed — if the format changed, this gate would measure nothing.');
    $dupes = array_keys(array_filter(array_count_values(array_map(fn($e) => (int)$e[1], $m)), fn($n) => $n > 1));
    $this->assertSame([], $dupes, 'Duplicate decision numbers: '.implode(', ', $dupes));
}
```
Notes: line endings normalised (repo LF, Windows working copy CRLF — a parser had died silently on exactly this before); an empty parse is a **failure**, not a pass; the test reads the *real* file, not a fixture, because the defect lived in the real file.

## Style 3 — short decisions + reports (3D mobile game, D-001…D-168)

`memory-bank/decisions.md` is append-only and never read in full at session start — it's searched by `D-0xx`. After measuring that the same finding was written in five places, the format was capped: **decision sentence + the 1–2 decisive numbers + rationale, ≤ 12 lines, ending with a link to the report**. The numbers table lives only in `docs/<topic>-report-<phase>.md`.

Template used in a second game project (an LLM game master), same 12-line cap:

```markdown
# decisions - decision log (D-NNN, <= 12 lines)

Status: **FINAL** (owner approved) · **PROPOSAL** (awaiting approval) · `[SUPERSEDED by D-NN]`

## D-0NN · Dice turn: two branches, one call (replaces D-0MM) · FINAL (<date>, owner)
The first call writes short success/fail branches with the check; the engine rolls and appends the
matching branch; no second call. Second call only in configured critical cases.
Reason: baseline measurement - pacing score 2.87 on two-call turns vs 4.52 single-call; cost ~halved.
```

Its rules:
- Number is never reused. A changed decision is not edited away: the old entry gets `[SUPERSEDED by D-NN]`
  and stays readable.
- Each entry: context (optional), decision, consequence/reason. Who decided and when is in the title line.
- Measurements and long analysis live in reports (`docs/*-report-<date>.md`); the decision cites them.
- A mobile app project uses the same idea with `K<N>` ids split by area (`decisions_product.md`,
  `decisions_infra.md`, ...), each file <= 150 lines, split by topic when it grows.

Technical forks the user doesn't need to decide (data shape, file layout) are decided by the agent, justified in one paragraph and recorded **with the rejected options**.

## Common rules

- Supersede, don't delete. History of reasoning is the point.
- Every decision says *why* with the incident that caused it — a rule without its "why" gets "optimised away".
- A note the agent wrote itself is **not** a decision. Before acting on something that only appears in the agent's own earlier notes, search the registry; if there's no decision behind it, say so. (Real case: "delete the demo records before launch" had been copied forward for many sessions as if decided — nobody had asked for it, and doing it would have required temporarily disabling a deletion guard.)
- Volatile values (current highest number, counts) are not copied into onboarding docs — "derived from the registry, not written here".
