"""Find a focal point (fx, fy as 0–1 fractions) for each image so "Fill" mode crops
around faces instead of the centre. Uses OpenCV's YuNet face detector
(tools/face_detection_yunet_2023mar.onnx, from opencv_zoo, MIT licence).
Images without a detected face fall back to slightly above centre.
Updates data/art.json in place."""
import json, os, sys
import cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.path.join(ROOT, "tools", "face_detection_yunet_2023mar.onnx")
DEFAULT = (0.5, 0.42)

def faces(path, det):
    img = cv2.imread(path)
    h, w = img.shape[:2]
    scale = 960 / max(h, w)
    if scale < 1: img = cv2.resize(img, (int(w * scale), int(h * scale)))
    h, w = img.shape[:2]
    det.setInputSize((w, h))
    _, found = det.detect(img)
    out = []
    for f in (found if found is not None else []):
        x, y, fw, fh, score = f[0], f[1], f[2], f[3], f[-1]
        out.append(((x + fw / 2) / w, (y + fh / 2) / h, fw * fh / (w * h), float(score)))
    return out

def focal(fs):
    if not fs: return DEFAULT
    fs = [(float(x), float(y), float(a), s) for x, y, a, s in fs]
    big = max(a for _, _, a, _ in fs)
    keep = [f for f in fs if f[2] >= big * 0.25]  # the main figures, not distant crowds
    wsum = sum(a * s for _, _, a, s in keep)
    fx = sum(x * a * s for x, _, a, s in keep) / wsum
    fy = sum(y * a * s for _, y, a, s in keep) / wsum
    return (round(float(fx), 3), round(float(fy), 3))

def main():
    det = cv2.FaceDetectorYN.create(MODEL, "", (320, 320), score_threshold=0.55, nms_threshold=0.3, top_k=50)
    art = json.load(open(os.path.join(ROOT, "data/art.json")))
    cache, hits = {}, 0
    for pool in art["pools"].values():
        for a in pool:
            if a["src"] not in cache:
                fs = faces(os.path.join(ROOT, a["src"]), det)
                cache[a["src"]] = (focal(fs), len(fs))
                hits += bool(fs)
            (a["fx"], a["fy"]), _ = cache[a["src"]]
    json.dump(art, open(os.path.join(ROOT, "data/art.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"{hits}/{len(cache)} images with faces")
    if len(sys.argv) > 1:  # debug: write a contact sheet with the focal points marked
        import random
        from PIL import Image, ImageDraw
        items = random.Random(1).sample(sorted(cache), 40)
        sheet = Image.new("RGB", (8 * 200, 5 * 240), "#222"); d = ImageDraw.Draw(sheet)
        for i, src in enumerate(items):
            im = Image.open(os.path.join(ROOT, src)); im.thumbnail((190, 230))
            x0, y0 = (i % 8) * 200 + 5, (i // 8) * 240 + 5
            sheet.paste(im, (x0, y0))
            (fx, fy), n = cache[src]
            cx, cy = x0 + fx * im.width, y0 + fy * im.height
            d.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], outline="#0f0" if n else "#f00", width=3)
        sheet.save(sys.argv[1])

if __name__ == "__main__":
    main()
