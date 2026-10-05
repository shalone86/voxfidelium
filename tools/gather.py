"""Gather candidate public-domain artworks for each rosary image pool.

Sources: sdcason.com (Free Catholic Gallery, Ghost content API),
Cleveland Museum of Art open access API (CC0), The Met open access API.
Writes tools/candidates.json. Curation happens in tools/curate.json.
"""
import json, re, sys, time, urllib.request, urllib.parse, os

HERE = os.path.dirname(__file__)
UA = {"User-Agent": "VoxFidelium-Rosary/1.0 (+https://github.com/shalone86/voxfidelium)"}

def get(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return json.load(r)
        except Exception as e:
            print("  retry", url[:90], e, file=sys.stderr); time.sleep(2 * (i + 1))
    return None

# pool -> (title regex, exclude regex, search terms for museum APIs)
POOLS = {
 "annunciation": (r"annunciat", r"shepherd|joachim|anna\b|icon of two|zacharias|death", ["annunciation"]),
 "visitation": (r"visitation|mary and elizabeth|virgin and saint elizabeth", r"", ["visitation"]),
 "nativity": (r"nativity|adoration of the (shepherds|child|christ child|infant)|birth of (christ|jesus)", r"nativity of (the virgin|mary|saint|st)|john the baptist|birth of the virgin", ["nativity", "adoration of the shepherds"]),
 "presentation": (r"presentation (of|in) (jesus|christ|the child|the infant|the temple)|purification of the virgin|simeon", r"presentation of the virgin|presentation of mary", ["presentation in the temple", "presentation of christ"]),
 "finding": (r"among the doctors|disput(e|ation) (with|in)|christ in the temple|jesus in the temple|finding (of )?(jesus|christ|the saviour)|twelve.year", r"expuls|money|cleansing|merchants|presentation", ["christ among the doctors", "finding in the temple"]),
 "baptism": (r"baptism of (christ|jesus)", r"", ["baptism of christ"]),
 "cana": (r"\bcana\b", r"", ["marriage at cana", "wedding at cana"]),
 "proclamation": (r"sermon on the mount|beatitud|christ preaching|jesus preaching|suffer the little|let the children|calling of (saint |st\.? )?(peter|andrew|matthew)|christ (teaching|blessing the children)|miraculous draught|woman taken in adultery|healing", r"saint (anthony|francis|john the baptist)|paul", ["sermon on the mount", "christ blessing the children", "calling of saint matthew", "christ preaching", "christ healing"]),
 "transfiguration": (r"transfigur", r"", ["transfiguration"]),
 "eucharist": (r"last supper|institution of the eucharist|communion of the apostles", r"", ["last supper", "communion of the apostles"]),
 "agony": (r"agony in the garden|gethsemane|garden of olives|christ on the mount of olives|mount of olives", r"", ["agony in the garden", "christ on the mount of olives"]),
 "scourging": (r"flagellat|scourg|christ at the (column|pillar)|christ bound to", r"", ["flagellation", "christ at the column"]),
 "crowning": (r"crown(ing|ed) (with|of) thorns|ecce homo|mocking of christ|man of sorrows|christ mocked", r"", ["crowning with thorns", "ecce homo", "mocking of christ"]),
 "carrying": (r"carrying the cross|bearing the cross|cross.bearing|road to calvary|way to calvary|christ carrying|veronica|procession to calvary|christ falls", r"", ["christ carrying the cross", "road to calvary"]),
 "crucifixion": (r"crucifixion|christ on the cross|crucified christ", r"saint peter|st\. peter|andrew|stigmat|peter", ["crucifixion"]),
 "resurrection": (r"resurrection of christ|the resurrection\b|christ risen|risen christ|noli me tangere|holy women at the (tomb|sepulchre)|three marys at the tomb|supper at emmaus|road to emmaus|doubting|incredulity", r"lazarus|resurrection of the dead|flesh", ["resurrection", "noli me tangere", "supper at emmaus", "incredulity of thomas"]),
 "ascension": (r"ascension", r"", ["ascension of christ"]),
 "pentecost": (r"pentecost|descent of the holy (spirit|ghost)", r"", ["pentecost"]),
 "assumption": (r"assumption", r"", ["assumption of the virgin"]),
 "coronation": (r"coronation of the virgin|coronation of mary|queen of heaven|virgin crowned", r"", ["coronation of the virgin"]),
 "father": (r"god the father|eternal father|god creating|creation of adam|ancient of days|almighty", r"", ["god the father", "eternal father"]),
 "trinity": (r"trinity|throne of grace|gnadenstuhl", r"monastery|church of|cathedral", ["holy trinity", "trinity"]),
 "shepherd": (r"good shepherd|christ (as|the) shepherd|lost sheep", r"", ["good shepherd"]),
 "madonna": (r"madonna and child|virgin and child", r"saints?|donor", ["virgin and child", "madonna and child"]),
 "rosary": (r"rosary|madonna of the rosary|virgin of the rosary", r"", ["madonna of the rosary", "virgin of the rosary"]),
 "pantocrator": (r"pantocrator|salvator mundi|christ blessing|head of christ|christ the redeemer", r"children", ["salvator mundi", "christ blessing"]),
}

def sdcason():
    posts = []
    key = "c95b7b0b1d8774ed773da4ed82"
    page = 1
    while True:
        d = get(f"https://sdcason.com/ghost/api/content/posts/?key={key}&limit=100&page={page}&include=tags&fields=id,title,slug,feature_image,url")
        if not d: break
        posts += d["posts"]
        if page >= d["meta"]["pagination"]["pages"]: break
        page += 1
    out = []
    for p in posts:
        tags = {t["name"] for t in p.get("tags", [])}
        if any("Coloring" in t or "Stock Photo" in t or "Cason" in t for t in tags): continue
        if not any(("Painting" in t or t in ("Byzantine Art", "Orthodox Icons and Art", "Illuminated Manuscripts", "Medieval Paintings", "Ethiopian Christian Art", "Public Domain Catholic Drawings", "Coptic Icons")) for t in tags): continue
        if not p.get("feature_image"): continue
        t = p["title"]
        m = re.match(r"(.*?)\s*\(([^)]*)\)\s*(?:by\s+(.*?))?\s*-\s*Public Domain", t)
        title, date, artist = (m.group(1), m.group(2), m.group(3) or "") if m else (t.split(" - ")[0], "", "")
        img = p["feature_image"]
        out.append(dict(src="sdcason", id="sd-" + p["slug"][:60], full=t, title=title.strip(), artist=(artist or "").strip(), date=date, link=p["url"], image=img))
    return out

def cleveland(term):
    d = get("https://openaccess-api.clevelandart.org/api/artworks/?" + urllib.parse.urlencode(dict(q=term, has_image=1, cc0=1, limit=60)))
    out = []
    for a in (d or {}).get("data", []):
        im = (a.get("images") or {}).get("web") or {}
        if not im.get("url"): continue
        cr = (a.get("creators") or [{}])
        out.append(dict(src="cleveland", id=f"cma-{a['id']}", full=a["title"], title=a["title"], artist=(cr[0].get("description") if cr else "") or "", date=a.get("creation_date") or "", link=a.get("url"), image=im["url"], type=a.get("type"), w=im.get("width"), h=im.get("height")))
    return out

def met(term):
    d = get("https://collectionapi.metmuseum.org/public/collection/v1.1/search?" + urllib.parse.urlencode(dict(q=term, hasImages="true", limit=60)))
    out = []
    for oid in (d or {}).get("objectIDs", [])[:60]:
        o = get(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}")
        time.sleep(0.05)
        if not o or not o.get("isPublicDomain") or not o.get("primaryImage"): continue
        out.append(dict(src="met", id=f"met-{oid}", full=o["title"], title=o["title"], artist=o.get("artistDisplayName", ""), date=o.get("objectDate", ""), link=o.get("objectURL"), image=o["primaryImage"], type=o.get("classification")))
    return out

if __name__ == "__main__":
    sd = sdcason()
    print("sdcason paintings", len(sd))
    cands = {}
    cache = {}
    for pool, (inc, exc, terms) in POOLS.items():
        res, seen = [], set()
        pool_src = list(sd)
        for t in terms:
            for fn in (cleveland, met):
                k = (fn.__name__, t)
                if k not in cache: cache[k] = fn(t)
                pool_src += cache[k]
        for a in pool_src:
            if a["id"] in seen: continue
            if not re.search(inc, a["full"], re.I): continue
            if exc and re.search(exc, a["full"], re.I): continue
            seen.add(a["id"]); res.append(a)
        cands[pool] = res
        print(pool, len(res), {s: sum(1 for r in res if r["src"] == s) for s in ("sdcason", "cleveland", "met")})
    json.dump(cands, open(os.path.join(HERE, "candidates.json"), "w"), indent=1)
