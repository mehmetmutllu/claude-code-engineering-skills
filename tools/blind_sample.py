"""
blind_sample.py - seeded review sample + disagreement rate for a blind second review.

  python blind_sample.py sample <batch-name> <decision.json> [--share 0.25]
      prints the ids the reviewer must label (reproducible: seeded by batch name)

  python blind_sample.py rate <decision.json> <review.json> [--threshold 0.05] [--ok H]
      disagreement = a SELECTED candidate the reviewer did not label as acceptable (default label "H").
      Exit code 1 when the rate exceeds the threshold -> redo the batch.
      Exit code 2 when nothing could be measured (no selected candidate was reviewed).

decision.json: {"items": [{"id": 1, "selected": ["a", "b", ...]}, ...]}
review.json:   {"items": [{"id": 1, "labels": {"a": "H", "b": "Z", ...}}, ...]}
"""
import argparse, json, math, random, sys


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)["items"]


def sample(args):
    ids = [it["id"] for it in load(args.decision)]
    k = math.ceil(len(ids) * args.share)
    for i in random.Random(args.batch).sample(ids, k):
        print(i)


def rate(args):
    selected = {it["id"]: it.get("selected", []) for it in load(args.decision)}
    reviewed = disagree = 0
    bad = []
    unknown = []
    for it in load(args.review):
        if it["id"] not in selected:
            unknown.append(it["id"])
            continue
        for cand in selected[it["id"]]:
            label = it["labels"].get(cand)
            if label is None:
                continue  # reviewer did not see this candidate
            reviewed += 1
            if label != args.ok:
                disagree += 1
                bad.append((it["id"], cand, label))
    if unknown:
        print(f"WARNING: {len(unknown)} review id(s) not in the decision file: {unknown[:10]}", file=sys.stderr)
    if reviewed == 0:
        print("COULD NOT MEASURE: no selected candidate was reviewed (wrong files? empty sample?)", file=sys.stderr)
        sys.exit(2)
    r = disagree / reviewed
    print(f"reviewed selected: {reviewed}  disagreeing: {disagree}  rate: {r:.1%}  threshold: {args.threshold:.0%}")
    for i, c, l in bad:
        print(f"  remove: id={i} candidate={c!r} reviewer={l}")
    if r > args.threshold:
        print("OVER THRESHOLD -> redo the batch with a fresh agent; put the examples above into its brief")
        sys.exit(1)


p = argparse.ArgumentParser()
sub = p.add_subparsers(dest="cmd", required=True)
s = sub.add_parser("sample"); s.add_argument("batch"); s.add_argument("decision"); s.add_argument("--share", type=float, default=0.25)
s.set_defaults(fn=sample)
r = sub.add_parser("rate"); r.add_argument("decision"); r.add_argument("review")
r.add_argument("--threshold", type=float, default=0.05); r.add_argument("--ok", default="H")
r.set_defaults(fn=rate)
a = p.parse_args()
a.fn(a)
