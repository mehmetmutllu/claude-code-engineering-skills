# Why Persistent Context Works

## The failure modes it prevents

**1. The blank-session tax.** Without state files, every session spends its opening tokens re-discovering the project. With a continue-point, the assistant is productive in the first minute — and the *human* also gets a status report for free.

**2. Stale pointers.** The most dangerous state is state that is *almost* right. Two design rules eliminate the worst of it:
- *One owner per fact* — "what's next" exists in exactly one file. Every additional copy is a future contradiction.
- *Append-only status logs* — a completion journal can only be incomplete (safe); a hand-maintained "NEXT:" pointer can be **wrong** (dangerous). We learned this from a real incident where a finished phase kept being reported as "next" because a footer pointer wasn't flipped.

**3. Reference drift.** Docs love to cite files and functions that no longer exist. Rule: a code reference may only be written into state after being verified against the code *at write time* — never copied from another document.

**4. Duplicated logic silently diverging.** Some duplication is unavoidable (server + client validation). Instead of pretending it isn't there, keep a **twin registry**: every known pair is listed, and touching one side requires checking the other.

**5. Unverified "done".** Sessions end with evidence — test counts (e.g. `e2e 34/0`), screenshots for UI, verification scripts for cross-module invariants. "Done" without a number is a claim, not a state.

## Why files, not memory features

- Files are **versioned with the code** — state and code can't drift apart in git history.
- Files are **reviewable** — the human can read/redline the same context the AI uses.
- Files are **portable** — any AI tool (or any human) can pick the project up.

## Scaling behavior

The pattern's cost is constant per session (one state-file update); its value grows with project size. On a project with 500+ numbered sessions the live state file is about 100 lines, because rolling archival keeps the working set small while the archive keeps history complete. Before rotation was introduced, the same file had grown to 1,087 lines and was read in full at every session start.
