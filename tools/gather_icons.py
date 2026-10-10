"""Gather candidate icons of Christ for the Jesus Prayer (tools/candidates_icons.json).

Only Byzantine, Russian and Ukrainian icons (and the post-Byzantine Cretan school).
The list is hand-picked: Wikidata items (images from Wikimedia Commons thumbnails,
since the Commons API rate-limits), Free Catholic Gallery posts and Met objects.
"""
import hashlib, json, os, re, subprocess, sys, time, urllib.parse, urllib.request
HERE = os.path.dirname(__file__)
UA = {"User-Agent": "IlluminatedRosary/1.0 (+https://github.com/shalone86/illuminatedrosary)"}

WIKIDATA = [
 "Q4501499",   # Christ Pantocrator, St Catherine's Monastery, Sinai (6th c.)
 "Q5109001",   # Andrei Rublev, Christ the Redeemer (Zvenigorod), c. 1420
 "Q19838804",  # Saviour Not Made by Hands, Novgorod (12th c.)
 "Q4430774",   # Saviour in Golden Robes
 "Q4430776",   # Saviour of the Fiery Eye
 "Q24932672",  # Yaroslavl Saviour
 "Q4430773",   # Eleazarovsky Saviour
 "Q20054016",  # Christ Emmanuel with archangels
 "Q65126432",  # Dionisius, Saviour in Glory
 "Q4430775",   # Saviour with Golden Hair
 "Q4430778",   # Saviour from Gavshinka
 "Q4430772",   # All-Merciful Saviour
 "Q69077450",  # Saviour of Borisoglebsk
 "Q4430777",   # Saviour Not Made by Hands (Izium/Kharkiv, Ukraine)
 "Q55430049",  # Crucified Saviour of Zarvanytsia (Ukraine)
 "Q21002477",  # Deesis, Dormition Cathedral
 "Q113256272", # Andreas Ritzos, Christ Enthroned
 "Q52224101",  # Emmanuel Tzanes, Christ Enthroned
 "Q135935446", # Emmanuel Tzanes, King of Kings
 "Q112644476", # Emmanuel Tzanes, Head of Christ
 "Q109829299", # Michael Damaskinos, Christ the High Priest
 "Q134887672", # Mosaic icon of Christ the Merciful
 "Q112570101", # Emmanuel Tzanes, The Holy Towel
]
SDCASON = [
 "christ-pantocrator-in-daphni-monastery-11th-centur",
 "the-christ-pantocrator-of-the-deesis-mosaic-13th-c",
 "christ-the-saviour-pantokrator-550-public-domain-o",
 "triptych-icon-of-christ-saint-nicholas-and-saint-b",
 "great-deesis-with-prophets-16th-century-russian-pu",
 "deesis-with-saints-triptych-18-19th-century-public",
 "medallion-with-christ-from-an-icon-frame-1100-cons",
]
MET = [473412, 437578, 206321, 466148, 464531]

# English titles and dates where Wikidata has only Russian labels or a bare year
NAMES = {
 "Q4501499": ("Christ Pantocrator, St. Catherine's Monastery, Sinai", "6th century"),
 "Q5109001": ("Christ the Saviour (Zvenigorod Deesis)", "c. 1410–20"),
 "Q19838804": ("The Saviour Not Made by Hands (Novgorod)", "12th century"),
 "Q4430774": ("The Saviour in Golden Robes", ""),
 "Q4430776": ("The Saviour of the Fiery Eye", "14th century"),
 "Q24932672": ("The Yaroslavl Saviour", "13th century"),
 "Q4430773": ("The Eleazarovsky Saviour", "14th century"),
 "Q20054016": ("Christ Emmanuel with Archangels", "12th century"),
 "Q65126432": ("The Saviour in Glory", "c. 1500"),
 "Q4430775": ("The Saviour with the Golden Hair", ""),
 "Q4430778": ("The Saviour from Gavshinka", ""),
 "Q4430772": ("The All-Merciful Saviour", ""),
 "Q69077450": ("The Saviour of Borisoglebsk", ""),
 "Q4430777": ("The Saviour Not Made by Hands (Izium, Ukraine)", "c. 1750"),
 "Q55430049": ("The Crucified Saviour of Zarvanytsia (Ukraine)", "1728"),
 "Q21002477": ("Deesis, Dormition Cathedral, Moscow", ""),
 "Q113256272": ("Christ Enthroned", "15th century"),
 "Q52224101": ("Christ Enthroned", "1664"),
 "Q135935446": ("Christ, King of Kings", "1686"),
 "Q112644476": ("Head of Christ", "1663"),
 "Q109829299": ("Christ the Great High Priest", "16th century"),
 "Q134887672": ("Christ the Merciful (mosaic icon)", "12th century"),
 "Q112570101": ("The Holy Mandylion", "1659"),
}

def get(url, headers=UA):
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=60))
        except Exception as e: print("  retry", url[:80], e, file=sys.stderr); time.sleep(3 * (i + 1))

def commons_thumb(fn, width=1280):
    # upload.wikimedia.org serves standard thumbnail widths without going through the API
    fn = fn.replace(" ", "_"); h = hashlib.md5(fn.encode()).hexdigest(); q = urllib.parse.quote(fn)
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{width}px-{q}" + (".jpg" if fn.lower().endswith((".tif", ".tiff")) else "")

def wikidata():
    vals = " ".join("wd:" + q for q in WIKIDATA)
    q = f"""SELECT ?i ?en ?ru ?img ?inception ?creatorLabel ?collLabel WHERE {{ VALUES ?i {{ {vals} }}
      ?i wdt:P18 ?img . OPTIONAL {{ ?i rdfs:label ?en FILTER(LANG(?en)="en") }} OPTIONAL {{ ?i rdfs:label ?ru FILTER(LANG(?ru)="ru") }}
      OPTIONAL {{ ?i wdt:P571 ?inception }} OPTIONAL {{ ?i wdt:P170 ?creator }} OPTIONAL {{ ?i wdt:P195 ?coll }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,ru,uk". }} }}"""
    d = get("https://query.wikidata.org/sparql?" + urllib.parse.urlencode(dict(query=q, format="json")))
    out = {}
    for b in d["results"]["bindings"]:
        g = lambda k: b.get(k, {}).get("value", "")
        qid = g("i").rsplit("/", 1)[1]
        if qid in out: continue
        fn = urllib.parse.unquote(g("img").rsplit("/", 1)[1])
        creator = g("creatorLabel"); creator = "" if creator.startswith("http") or re.match(r"Q\d+$", creator) else creator
        coll = g("collLabel"); coll = "" if coll.startswith("http") else coll
        title, date = NAMES.get(qid, (g("en") or g("ru"), g("inception")[:4].lstrip("0")))
        out[qid] = dict(src="commons", id="wd-" + qid, title=title, artist=creator, date=date,
                        collection=coll, link="https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(fn.replace(" ", "_")), image=commons_thumb(fn), wikidata=g("i"))
    return [out[q] for q in WIKIDATA if q in out]

def sdcason():
    key = "c95b7b0b1d8774ed773da4ed82"; out = []
    for s in SDCASON:
        d = get(f"https://sdcason.com/ghost/api/content/posts/?key={key}&filter=slug:~^'{s}'&fields=title,slug,feature_image,url")
        for p in (d or {}).get("posts", [])[:1]:
            m = re.match(r"(.*?)\s*\(([^)]*)\)\s*(?:by\s+(.*?))?\s*-?\s*Public Domain", p["title"])
            title, date, artist = (m.group(1), m.group(2), m.group(3) or "") if m else (p["title"].split(" - ")[0], "", "")
            out.append(dict(src="sdcason", id="sd-" + p["slug"][:60], title=title.strip(), artist=artist.strip(), date=date, link=p["url"], image=p["feature_image"]))
    return out

def met():
    out = []
    for oid in MET:
        o = get(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}")
        if o and o.get("isPublicDomain") and o.get("primaryImage"):
            out.append(dict(src="met", id=f"met-{oid}", title=o["title"], artist=o.get("artistDisplayName", ""), date=o.get("objectDate", ""), link=o.get("objectURL"), image=o["primaryImage"]))
    return out

if __name__ == "__main__":
    res = wikidata() + sdcason() + met()
    json.dump({"jesus": res}, open(os.path.join(HERE, "candidates_icons.json"), "w"), indent=1, ensure_ascii=False)
    for i, a in enumerate(res): print(i, a["id"], "|", a["title"][:60], "|", a["artist"], "|", a["date"])
