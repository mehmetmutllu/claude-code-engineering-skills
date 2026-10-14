# LLM proposes, engine decides

> **Problem:** An LLM with direct write access to state eventually breaks the system's rules.
>
> **Practice:** The model proposes typed actions from a written contract; a pure, deterministic validator accepts or rejects each one against a working copy; rejections are logged data; the call budget is counted innermost.
>
> **Evidence:** Dice turns moved from two calls to one after measurement (pacing 2.87 on two-call turns vs 4.52 on single-call turns, cost of those turns roughly halved); silent drops in the apply step were found and fixed.

Pattern for putting an LLM inside a system with rules (a game master, an agent with side effects, a
content generator writing to a database). The model never changes state directly; it proposes typed
actions, a deterministic validator accepts or rejects each one, and only accepted actions are applied.

> "The AI says what *could* happen. The engine says what *actually* happened."

## 1. A written contract is the only language

One document (`docs/ai-contract.md`) lists every action the model may emit, what it does, and what the
engine checks. The same list is a JSON schema in the backend and is given to the model as tool/output schema.

| Action | Engine check (examples from the real contract) |
|---|---|
| `narrate{text}` | length limit |
| `say{npc_id, text}` | NPC present and alive |
| `skill_check{skill, tier, onSuccess, onFail}` | engine rolls the dice and picks the branch |
| `create_location{template, name_tr, name_en, hook}` | template in allow-list, free map cell, region quota |
| `create_npc{archetype, ...}` | archetype list, NPCs-per-location cap |
| `create_quest{template, giver, steps, reward}` | reward cap by level, active-quest cap |
| `update_quest{quest_id, step, state}` | step order (same or next), main-quest lock |
| `give_item{def_or_generated, rarity}` | rarity cap; legendary forbidden |
| `change_relation{target, delta}` | delta within +/-1..3 |
| `start_combat{enemy_group}` | group fits region and level |
| `move_party{location}` | reachable |
| `remember{summary, tags, importance}` | - |
| `suggest{options[3]}` | exactly 3, short, once per turn |

**What the model can never do** (validator rejects and logs): change level/stats/gold directly (only via
capped reward actions), invent classes or rules, kill protected NPCs, alter or close the main quest, make
up dice results or combat damage, emit asset names or coordinates (only template ids + tags).

Turn kinds narrow the allow-list further, e.g. a rest turn accepts only `narrate`, `say`, `suggest`,
`remember`; everything else is rejected with the turn kind as reason.

## 2. Validator shape

```ts
interface Rejection { op: unknown; reason: string }
interface ValidationResult { accepted: AppliedAction[]; rejected: Rejection[]; world: WorldView }

function validateOps(ops: unknown[], world: WorldView, newId: (p: string) => string,
                     restrict?: { allowed: Set<string>; label: string }): ValidationResult {
  const w = structuredClone(world);              // work on a copy
  for (const op of ops) {
    const parsed = Action.safeParse(op);         // 1) schema
    if (!parsed.success) { reject(op, 'schema: ' + issues); continue; }
    const a = normalize(parsed.data);
    const reason = restrict && !restrict.allowed.has(a.type)
      ? `${restrict.label}: ${a.type} not allowed this turn`
      : check(a, w);                             // 2) rules against CURRENT working state
    if (reason) { reject(op, reason); continue; }
    applyToWorkingCopy(a, w);                    // 3) later ops in the same turn see earlier effects
    accept(a);
  }
  return { accepted, rejected, world: w };
}
```

Key details:
- Validate against a working copy that accumulates the turn's accepted effects (two `create_location` in
  one turn count against the same quota; a second "vault solved" in the same turn is rejected).
- Pure function, no I/O -> unit-testable with hundreds of cases.
- The apply step must also report anything it skipped as rejected; silent drops were found and fixed.

## 3. Rejections are data

- Rejected actions drop silently from the player's view but are written to the turn record and to the
  per-call AI log (`rejected` count).
- If the narrative relies on a rejected action ("he gave you 5000 gold"), a short repair call rewrites it.
- Rejection rate and repair frequency are gate metrics in the evaluation harness.

## 4. Randomness and outcomes belong to the engine

- The model asks for a check; the engine rolls. Originally that meant a second LLM call to narrate the
  result. Measurement showed this hurt pacing (two paragraphs, sometimes contradicting) and doubled cost.
  Now the first call writes both short branches (`onSuccess`, `onFail`), the engine picks one; a second
  call only happens in configured critical cases.
- Determinism: everything generated is persistent; location = (template, seed, state). Same seed -> same scene.
  Seeds are derived from the world seed + id, so placement is reproducible.

## 5. Layers around the model call

```
CallBudget (innermost: every real network call counts, incl. safety regenerations and retries)
  -> provider adapter (OpenAI / Gemini / Anthropic / compat) behind one interface
  -> Fallback chain (cheap model -> backup provider)
  -> Safety wrapper: output filter (blocklist + classifier) -> regenerate -> safe template text
  -> Recorder (aiCalls row)
```
- Budget is counted innermost; counting at the outer layer hid 2-4 real calls behind one "respond".
- When the per-turn budget is exhausted the call throws a typed signal **before** hitting the network
  (cost 0); upper layers convert it into a safe result (template narration, skip the second call).
- Escalation to a stronger model is a pure function of config + player state (enabled, free tier allowed,
  per-turn max, per-player daily cap), with an alarm when the escalated share exceeds a target.
- Model ids, reasoning level, caps, quotas: all in config (and remote config), never in code.

## 6. Content rules as engine policy, not hope

Forbidden themes are listed in the contract and enforced twice: in the system prompt and by an output
filter. A forbidden request is acknowledged and declined from inside the fiction with one warm sentence,
no lecture, and something else the world offers. If the filter keeps tripping, a safe template is used.
Players can flag any AI narration ("report"); the server stores its own copy of the turn (never trusting
client text).

## 7. Keys and authority

- The client holds no model keys. Only the backend calls models.
- The backend is the single owner of world state; the client renders.
- Internal prompts in English (rule adherence); output language is a parameter; persistent names are
  generated in both languages together so switching language never breaks the world.
