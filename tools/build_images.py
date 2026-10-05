"""Download, resize and catalogue the curated artworks.

Reads tools/candidates.json and tools/selection.json ({pool: [candidate ids]}),
writes img/<id>.jpg (max 1600px, progressive JPEG) and data/art.json.
"""
import base64, io, json, os, re, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "VoxFidelium-Rosary/1.0 (+https://github.com/shalone86/illuminatedrosary)"}
SOURCES = {"sdcason": "Free Catholic Gallery (sdcason.com)", "cleveland": "Cleveland Museum of Art", "met": "The Metropolitan Museum of Art", "wellcome": "Wellcome Collection", "rijks": "Rijksmuseum", "commons": "Wikimedia Commons"}
MAX = 1400

cands = json.load(open(os.path.join(ROOT, "tools/candidates.json")))
sel = json.load(open(os.path.join(ROOT, "tools/selection.json")))
by_id = {a["id"]: a for pool in cands.values() for a in pool}
extra = os.path.join(ROOT, "tools/extra.json")
if os.path.exists(extra):
    for a in json.load(open(extra)): by_id[a["id"]] = a

def slug(s): return re.sub(r"[^a-z0-9-]+", "-", s.lower()).strip("-")[:70]

def clean_artist(s):
    # "Jaume Ferrer (Spanish, died 1460)" -> "Jaume Ferrer"; Commons sometimes repeats names on new lines
    s = re.sub(r"\s*\([^)]*\)", "", s or "").strip()
    return re.split(r"\s{2,}|\n", s)[0][:70]

def source_url(a):
    u = a["image"]
    if a["src"] == "sdcason" and "/content/images/" in u and "/size/" not in u:
        u = u.replace("/content/images/", "/content/images/size/w2000/")
    return u

def fetch(a):
    fn = os.path.join(ROOT, "img", slug(a["id"]) + ".jpg")
    if os.path.exists(fn):
        im = Image.open(fn)
    else:
        for i in range(4):
            try:
                data = urllib.request.urlopen(urllib.request.Request(source_url(a), headers=UA), timeout=90).read(); break
            except Exception as e:
                print("retry", a["id"], e, file=sys.stderr); time.sleep(3 * (i + 1))
        else:
            # Ghost resize endpoint can fail on some files; fall back to the original
            data = urllib.request.urlopen(urllib.request.Request(a["image"], headers=UA), timeout=90).read()
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("RGB")
        im.thumbnail((MAX, MAX), Image.LANCZOS)
        im.save(fn, "JPEG", quality=76, progressive=True, optimize=True)
    lq = im.copy(); lq.thumbnail((24, 24))
    b = io.BytesIO(); lq.save(b, "JPEG", quality=60)
    return dict(w=im.width, h=im.height, lq="data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode())

os.makedirs(os.path.join(ROOT, "img"), exist_ok=True)
ids = sorted({i for v in sel.values() if isinstance(v, list) for i in v})
missing = [i for i in ids if i not in by_id]
if missing: sys.exit(f"unknown ids: {missing}")
with ThreadPoolExecutor(6) as ex:
    meta = dict(zip(ids, ex.map(lambda i: fetch(by_id[i]), ids)))

pools = {}
for pool, lst in sel.items():
    if pool.startswith("_"): continue
    pools[pool] = []
    for i in lst:
        a = by_id[i]
        pools[pool].append(dict(id=slug(i), src=f"img/{slug(i)}.jpg", title=a["title"], artist=clean_artist(a.get("artist", "")), date=a.get("date", ""), source=SOURCES[a["src"]], link=a.get("link", ""), **meta[i]))
out = dict(pools=pools, covers={k: slug(v) for k, v in sel.get("_covers", {}).items()})
json.dump(out, open(os.path.join(ROOT, "data/art.json"), "w"), ensure_ascii=False, separators=(",", ":"))
used = {slug(i) + ".jpg" for i in ids}
for f in os.listdir(os.path.join(ROOT, "img")):
    if f not in used: os.remove(os.path.join(ROOT, "img", f)); print("removed stale", f)
print({k: len(v) for k, v in pools.items()})

# keep the face focal points in step with the catalogue (needs opencv-python-headless)
try:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import focal_points
    focal_points.main()
except ImportError as e:
    print("focal points skipped:", e)
