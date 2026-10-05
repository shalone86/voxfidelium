"""Second Met pass restricted to medium=Paintings (the first pass was mostly prints)."""
import json, os, re, sys, time, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from gather import POOLS, get
HERE = os.path.dirname(__file__)
have = {a["id"] for p in json.load(open(os.path.join(HERE, "candidates.json"))).values() for a in p}
EXTRA_TERMS = {"visitation": ["visitation mary elizabeth"], "finding": ["christ among the doctors", "jesus temple doctors"], "cana": ["cana"], "transfiguration": ["transfiguration"],
               "shepherd": ["good shepherd", "shepherd christ"], "rosary": ["rosary"], "father": ["god the father", "eternal father", "trinity"], "assumption": ["assumption"], "pentecost": ["pentecost"]}
objs, out = {}, {}
for pool, (inc, exc, terms) in POOLS.items():
    out[pool] = []
    for t in terms + EXTRA_TERMS.get(pool, []):
        d = get("https://collectionapi.metmuseum.org/public/collection/v1.1/search?" + urllib.parse.urlencode(dict(q=t, hasImages="true", medium="Paintings", limit=80)))
        for oid in (d or {}).get("objectIDs", []):
            if f"met-{oid}" in have: continue
            if oid not in objs:
                objs[oid] = get(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}"); time.sleep(0.03)
            o = objs[oid]
            if not o or not o.get("isPublicDomain") or not o.get("primaryImage"): continue
            if not re.search(inc, o["title"], re.I) or (exc and re.search(exc, o["title"], re.I)): continue
            if any(a["id"] == f"met-{oid}" for a in out[pool]): continue
            out[pool].append(dict(src="met", id=f"met-{oid}", full=o["title"], title=o["title"], artist=o.get("artistDisplayName", ""), date=o.get("objectDate", ""), link=o.get("objectURL"), image=o["primaryImage"], type=o.get("classification")))
    print(pool, len(out[pool]), flush=True)
json.dump(out, open(os.path.join(HERE, "candidates_met2.json"), "w"), indent=1)
