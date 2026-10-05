"""Download and encode the background music.

Source: the Musopen Kickstarter recordings, released into the public domain
(archive.org item MusopenCollectionAsFlac, Public Domain Mark 1.0).
Writes music/<id>.mp3 (96 kbps, loudness-normalised for quiet background use)
and data/music.json.
"""
import json, os, subprocess, sys, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ITEM = "MusopenCollectionAsFlac"
BASE = f"https://archive.org/download/{ITEM}/"
UA = {"User-Agent": "IlluminatedRosary/1.0 (+https://github.com/shalone86/illuminatedrosary)"}

# id, archive path (without extension), composer, title, moods
TRACKS = [
 ("suk-meditation", "Suk_Meditation/JosefSuk-Meditation", "Josef Suk", "Meditation on the Old Czech Hymn “St. Wenceslas”", ["peaceful", "sorrowful"]),
 ("bach-goldberg-aria", "Bach_GoldbergVariations/JohannSebastianBach-01-GoldbergVariationsBwv.988-Aria", "J. S. Bach", "Goldberg Variations: Aria", ["peaceful"]),
 ("bach-goldberg-13", "Bach_GoldbergVariations/JohannSebastianBach-14-GoldbergVariationsBwv.988-Variation13", "J. S. Bach", "Goldberg Variations: Variation 13", ["peaceful"]),
 ("bach-goldberg-aria-da-capo", "Bach_GoldbergVariations/JohannSebastianBach-32-GoldbergVariationsBwv.988-AriaDaCapo", "J. S. Bach", "Goldberg Variations: Aria da capo", ["peaceful", "sorrowful"]),
 ("bach-goldberg-15", "Bach_GoldbergVariations/JohannSebastianBach-16-GoldbergVariationsBwv.988-Variation15.CanonOnTheFifth", "J. S. Bach", "Goldberg Variations: Variation 15 (Canon at the Fifth)", ["sorrowful"]),
 ("bach-goldberg-25", "Bach_GoldbergVariations/JohannSebastianBach-26-GoldbergVariationsBwv.988-Variation25", "J. S. Bach", "Goldberg Variations: Variation 25", ["sorrowful"]),
 ("haydn-lark-adagio", "Haydn_StringQuartetInDMajorOp.64/JosephHaydn-StringQuartetInDOp.645H363Lark-02-AdagioCantabile", "Joseph Haydn", "String Quartet “The Lark”: Adagio cantabile", ["peaceful"]),
 ("mozart-k465-andante", "Mozart_StringQuartetNo.19inCMajorK465/WolfgangAmadeusMozart-StringQuartetNo.19InCK465Dissonance-02-AndanteCantabile", "W. A. Mozart", "String Quartet No. 19, K. 465: Andante cantabile", ["peaceful"]),
 ("mozart-k421-andante", "Mozart_StringQuartetNo.15inDMinorK421/WolfgangAmadeusMozart-StringQuartetNo.15InDMinorK421-02-Andante", "W. A. Mozart", "String Quartet No. 15, K. 421: Andante", ["sorrowful"]),
 ("beethoven-op18-6-adagio", "Beethoven_StringQuartetNo.6inBFlatMajorOp.18/LudwigVanBeethoven-StringQuartetNo.6InBFlatMajorOp.18No.6-02-AdagioMaNonTroppo", "Ludwig van Beethoven", "String Quartet Op. 18 No. 6: Adagio ma non troppo", ["peaceful"]),
 ("dvorak-american-lento", "Dvorak_StringQuartetNo.12inFMajorOp.96/AntonnDvorak-StringQuartetNo.12InFMajorOp.96American-02-Lento", "Antonín Dvořák", "String Quartet “American”: Lento", ["sorrowful"]),
 ("dvorak-op51-romanza", "Dvorak_StringQuartetNo.10inEFlatOp.51/AntonnDvorak-StringQuartetNo.10InEFlatOp.51-03-Romanza", "Antonín Dvořák", "String Quartet No. 10: Romanza", ["peaceful"]),
 ("schubert-d664-andante", "Schubert_SonataInAMajorD.664/FranzSchubert-SonataInAMajorD.664-02-Andante", "Franz Schubert", "Piano Sonata in A major, D. 664: Andante", ["peaceful"]),
 ("schubert-d568-andante", "Schubert_SonataInEFlatMajorD.568/FranzSchubert-SonataInEFlatMajorD.568-02-AndanteMolto", "Franz Schubert", "Piano Sonata in E-flat major, D. 568: Andante molto", ["peaceful"]),
 ("schubert-d784-andante", "Schubert_SonataInAMinorD.784/FranzSchubert-SonataInAMinorD.784-02-Andante", "Franz Schubert", "Piano Sonata in A minor, D. 784: Andante", ["sorrowful"]),
 ("schubert-d959-andantino", "Schubert_SonataInAMinorD.959/FranzSchubert-SonataInAMinorD.959-02-Andantino", "Franz Schubert", "Piano Sonata in A major, D. 959: Andantino", ["sorrowful"]),
 ("schubert-d958-adagio", "Schubert_SonataInCMinorD.958/FranzSchubert-SonataInCMinorD.958-02-Adagio", "Franz Schubert", "Piano Sonata in C minor, D. 958: Adagio", ["sorrowful"]),
 ("mendelssohn-scottish-adagio", "Mendelssohn_ScottishSymphony/FelixMendelssohn-SymphonyNo.3InAMinorscottishOp.56-03-Adagio", "Felix Mendelssohn", "“Scottish” Symphony: Adagio", ["peaceful"]),
 ("brahms-3-andante", "Brahms_SymphonyNo.3inFMajor/JohannesBrahms-SymphonyNo.3InFMajorOp.90-02-Andante", "Johannes Brahms", "Symphony No. 3: Andante", ["peaceful"]),
]

def main():
    meta = json.load(urllib.request.urlopen(urllib.request.Request(f"https://archive.org/metadata/{ITEM}", headers=UA), timeout=60))
    files = {f["name"]: f for f in meta["files"]}
    os.makedirs(os.path.join(ROOT, "music"), exist_ok=True)
    out = []
    for tid, path, composer, title, moods in TRACKS:
        src = next((path + ext for ext in (".mp3", ".ogg") if path + ext in files), None)
        if not src:
            # names in the item are sometimes truncated differently; match on prefix
            src = next((n for n in files if n.startswith(path[:60]) and n.endswith(".mp3")), None)
        if not src: sys.exit(f"missing {path}")
        dst = os.path.join(ROOT, "music", tid + ".mp3")
        if not os.path.exists(dst):
            tmp = dst + ".src"
            urllib.request.urlretrieve(BASE + urllib.parse.quote(src), tmp)
            # quiet background level, gentle fades, 96 kbps stereo
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-22:TP=-2:LRA=11,afade=t=in:d=2",
                            "-ac", "2", "-ar", "44100", "-b:a", "96k", "-map_metadata", "-1", dst], check=True)
            os.remove(tmp)
        secs = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst], capture_output=True, text=True).stdout)
        out.append(dict(id=tid, src=f"music/{tid}.mp3", composer=composer, title=title, moods=moods, duration=round(secs),
                        source="Musopen (public domain)", link=f"https://archive.org/details/{ITEM}"))
        print(tid, round(secs), "s", os.path.getsize(dst) // 1024, "KB", flush=True)
    json.dump({"tracks": out}, open(os.path.join(ROOT, "data/music.json"), "w"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()
