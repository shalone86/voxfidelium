"""Turn curation notes (tools/picks.txt) into tools/selection.json + tools/extra.json.

Line format:  <pool> <kind> <refs>
  kind c: indices into candidates.json[pool]
  kind w: indices into candidates_commons.json[pool]
  kind m: indices into candidates_met2.json[pool]
  kind x: <otherpool>:<index> into candidates.json (cross-pool reuse)
"""
import json, os
HERE = os.path.dirname(__file__)
L = lambda f: json.load(open(os.path.join(HERE, f))) if os.path.exists(os.path.join(HERE, f)) else {}
C, W, M = L("candidates.json"), L("candidates_commons.json"), L("candidates_met2.json")
sel, extra = {}, {}
for line in open(os.path.join(HERE, "picks.txt")):
    if not line.strip() or line.startswith("#"): continue
    pool, kind, refs = line.split(None, 2)
    out = sel.setdefault(pool, [])
    for r in refs.replace(" ", "").split(","):
        if kind == "x":
            sp, i = r.split(":"); a = C[sp][int(i)]
        else:
            a = {"c": C, "w": W, "m": M}[kind][pool][int(r)]
            if kind != "c": extra[a["id"]] = a
        if a["id"] not in out: out.append(a["id"])
covers = {"joyful": sel["annunciation"][0], "luminous": sel["transfiguration"][0], "sorrowful": sel["agony"][0], "glorious": sel["resurrection"][0]}
sel["_covers"] = covers
json.dump(sel, open(os.path.join(HERE, "selection.json"), "w"), indent=1)
json.dump(list(extra.values()), open(os.path.join(HERE, "extra.json"), "w"), indent=1)
print({k: len(v) for k, v in sel.items() if not k.startswith("_")})
