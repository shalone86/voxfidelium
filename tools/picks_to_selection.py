"""Turn curation notes (tools/picks.txt) into tools/selection.json + tools/extra.json.

Line format:  <pool> <kind> <refs>
  kind c: indices into candidates.json[pool]
  kind w: indices into candidates_commons.json[pool]
  kind m: indices into candidates_met2.json[pool]
  kind i: indices into candidates_icons.json[pool] (tools/gather_icons.py)
  kind x: <otherpool>:<index> into candidates.json (cross-pool reuse)
"""
import json, os
HERE = os.path.dirname(__file__)
L = lambda f: json.load(open(os.path.join(HERE, f))) if os.path.exists(os.path.join(HERE, f)) else {}
C, W, M, I = L("candidates.json"), L("candidates_commons.json"), L("candidates_met2.json"), L("candidates_icons.json")
sel, extra = {}, {}
for line in open(os.path.join(HERE, "picks.txt")):
    if not line.strip() or line.startswith("#"): continue
    pool, kind, refs = line.split(None, 2)
    src_pool = pool
    if pool == "angels2": pool = "angels"
    out = sel.setdefault(pool, [])
    for r in refs.replace(" ", "").split(","):
        if kind == "x":
            sp, i = r.split(":"); a = C[sp][int(i)]
        else:
            a = {"c": C, "w": W, "m": M, "i": I}[kind][src_pool][int(r)]
            if kind != "c": extra[a["id"]] = a
        if a["id"] not in out: out.append(a["id"])
# cover art for the four mystery cards on the home screen
covers = {"joyful": C["annunciation"][0]["id"], "luminous": C["transfiguration"][4]["id"], "sorrowful": C["carrying"][1]["id"], "glorious": C["resurrection"][0]["id"],
          "divineMercy": C["mercy"][10]["id"], "sevenSorrows": C["dolorosa"][1]["id"], "stMichael": C["michael"][8]["id"],
          "fiveWounds": C["mercy"][12]["id"], "jesusPrayer": I["jesus"][0]["id"]}
sel["_covers"] = covers
json.dump(sel, open(os.path.join(HERE, "selection.json"), "w"), indent=1)
json.dump(list(extra.values()), open(os.path.join(HERE, "extra.json"), "w"), indent=1)
print({k: len(v) for k, v in sel.items() if not k.startswith("_")})
