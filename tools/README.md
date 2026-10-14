# Tools

Small, dependency-free scripts that turn a playbook rule into an exit code.

## `blind_sample.py` - blind second review

Seeded review sample and disagreement rate for [blind-review-content-pipeline](../playbooks/llm/blind-review-content-pipeline.md) / the [`blind-second-review` skill](../skills/blind-second-review/SKILL.md). Python 3, standard library only.

```bash
# 1. which ids the reviewer must label (25%, reproducible: seeded by the batch name)
python blind_sample.py sample <batch-name> decision.json [--share 0.25]

# 2. after the reviewer wrote review.json: disagreement rate, items to remove
python blind_sample.py rate decision.json review.json [--threshold 0.05] [--ok H]
#    exit 1 when the rate exceeds the threshold -> redo the whole batch
```

Input formats:

```json
// decision.json
{"items": [{"id": 1, "selected": ["a", "b"]}]}
// review.json
{"items": [{"id": 1, "labels": {"a": "H", "b": "Z"}}]}
```

## `verify_bundle.js` - look inside the release artifact

AAB / APK / IPA files are zip archives. This refuses a bundle when an inner file doesn't match a required pattern, or when a version stamp inside the bundle differs from the repo's. Pure Node (`zlib`), no unzip dependency. Background: [release-checklists](../playbooks/ci-and-release/release-checklists.md).

```bash
node verify_bundle.js app-release.aab \
  --require "base/assets/public/js/ad-ids.js=TEST:\s*false" \
  --same    "base/assets/public/sw.js=www/sw.js=VERSION\s*=\s*'([^']+)'"
# exit 0 all checks passed · 1 a check failed (do not ship) · 2 usage error
```

Both flags may repeat. Counter-test it once with a deliberately bad bundle before trusting it in a release script.
