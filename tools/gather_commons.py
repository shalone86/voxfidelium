"""Add Wikimedia Commons candidates for thin pools (slow & polite: Commons rate-limits)."""
import json, re, sys, time, urllib.request, urllib.parse, os, html
HERE = os.path.dirname(__file__)
UA = {"User-Agent": "VoxFidelium-Rosary/1.0 (https://github.com/shalone86/voxfidelium)"}
C = lambda cents, what: [f"{c}th-century paintings of {what}" for c in cents]
CATS = {
 "shepherd": C([16, 17, 18, 19], "Jesus Christ as the Good Shepherd"),
 "transfiguration": C([15, 16, 17], "the Transfiguration"),
 "cana": C([15, 16, 17], "the marriage at Cana"),
 "father": C([15, 16, 17], "God the Father"),
 "agony": C([15, 16, 17], "the Agony in the Garden"),
 "finding": C([16, 17], "Jesus Christ among the doctors"),
 "pentecost": C([15, 16, 17], "Pentecost"),
 "assumption": C([15, 16, 17], "Assumption of Mary"),
 "visitation": C([15, 16], "Visitation"),
 "scourging": C([15, 16, 17], "the flagellation of Jesus Christ"),
 "eucharist": C([15, 16], "the Last Supper"),
 "proclamation": ["Paintings of the Sermon on the Mount"],
 "rosary": ["Madonna of the Rosary (Caravaggio)", "Madonna of the Rosary (Lotto)"],
}
def api(params):
    params.update(format="json", maxlag=5)
    for i in range(6):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params), headers=UA), timeout=60))
        except Exception as e:
            print("  wait", e, file=sys.stderr); time.sleep(15 * (i + 1))
def strip(s): return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()
out = {}
for pool, cats in CATS.items():
    out[pool] = []
    for cat in cats:
        d = api(dict(action="query", generator="categorymembers", gcmtitle="Category:" + cat, gcmtype="file", gcmlimit=50,
                     prop="imageinfo", iiprop="url|extmetadata|size", iiurlwidth=1280,
                     iiextmetadatafilter="LicenseShortName|Artist|DateTimeOriginal|ObjectName|ImageDescription"))
        pages = (d or {}).get("query", {}).get("pages", {})
        n = 0
        for p in pages.values():
            ii = (p.get("imageinfo") or [{}])[0]
            md = ii.get("extmetadata", {})
            lic = md.get("LicenseShortName", {}).get("value", "")
            if not re.search(r"public domain|^pd|cc0", lic, re.I): continue
            if not re.search(r"\.(jpe?g|png|tiff?)$", p["title"], re.I): continue
            if ii.get("width", 0) < 900 and ii.get("height", 0) < 900: continue
            name = p["title"][5:].rsplit(".", 1)[0]
            title = strip(md.get("ObjectName", {}).get("value")) or name
            out[pool].append(dict(src="commons", id="wc-" + str(p["pageid"]), full=name + " " + title, title=title[:140], artist=strip(md.get("Artist", {}).get("value"))[:80],
                                  date=strip(md.get("DateTimeOriginal", {}).get("value"))[:40], link=ii.get("descriptionurl"), image=ii.get("thumburl") or ii.get("url"),
                                  thumb=re.sub(r"/\d+px-", "/330px-", ii.get("thumburl", "")) or None, type=None, w=ii.get("width"), h=ii.get("height")))
            n += 1
        print(pool, cat, n, flush=True)
        time.sleep(6)
json.dump(out, open(os.path.join(HERE, "candidates_commons.json"), "w"), indent=1)
