# Twin registry: logic that lives in two places

> **Problem:** The same constant or algorithm lives in two files; change one, miss the other, and the bug is silent.
>
> **Practice:** Collapse to one canonical source first; if that's impossible, register the pair and check the other side whenever one changes.
>
> **Evidence:** 97 numbered twins over ~500 sessions in one project, many closed as "resolved, single source".

## Rule (two steps, in order)

1. **Collapse to one canonical source first.** E.g. the JS constant is fed from the backend (`window.X = <?= json_encode(...) ?>`), the grid engine moves to a shared `program-grid.js` both pages load, the shared table header becomes an included partial.
2. **If that's impossible, register the pair** in `context/twin-registry.md`. Whenever you touch one side, check the other.

The file is deliberately **not** excluded from the agent's reads, so search finds it. References in it are verified at write time (Grep/Read), never copied.

## Entry format

```markdown
### TW-5 — Schedule grid engine (create page ↔ import page) — ✅ RESOLVED (S223)
- **Resolution:** single source `assets/program-grid.js`; page-specific hooks `window.CELL_RENDERER(...)`, `window.onGridChange()`.
- **Still separate (deliberate):** conflict *display* (badge vs panel); datalists.
- **Sync rule:** engine changes affect both pages → retest both.
- **Contract:** conflict JSON fields = tip, level, icon, blocking, message, day, slot_id, teacher_id, class_id.
```
Entries for things that are *intentionally* different are just as valuable ("two counters both say 'pending attendance' but one filters by date — deliberate; if you touch one, review the other").

## Measured scale

In the source project the registry reached **97 numbered twins** over ~500 sessions. Many end as "✅ RESOLVED — single source X", which is the goal: the registry is a queue for de-duplication, not a museum.

## Related rules that came out of it

- **Multiple entry points are good; copied logic is bad.** Offering a feature from two screens is fine; copying its state/logic is not.
- **The canonical helper owns what callers can forget.** A helper bound `:pid` itself but left the `pd.program_id = :pid` *condition* to callers; 3 of 4 new callers forgot it. Had both been forgotten, the query would silently return every program's rows.
- **Asymmetric twins in tooling count too:** two sibling sentinel rules, one measured against the live file, one only against a synthetic sample (see `gates-must-be-measured.md`).
- A dashboard budget column that duplicated the sum of phase rows was itself registered as a twin, then demoted to non-binding with a test enforcing "phase rows win".
