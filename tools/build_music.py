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

# Historic 78 rpm recordings from the Internet Archive. Every one was recorded and
# published in 1925 or earlier, so it is in the public domain in the US (Music
# Modernization Act: pre-1926 sound recordings entered the public domain by Jan 1, 2026).
# item, file, id, composer, title, performer, year, kind, moods
HISTORIC = [
 ("78_ave-maria-hail-mary_sistine-chapel-choir-vitttoria-monsignor-rella-perpetual_gbia0468205a", "Ave Maria (Hail, Mary!) - Sistine Chapel Choir.mp3", "sistine-ave-maria-1924", "Tomás Luis de Victoria", "Ave Maria", "Sistine Chapel Choir, cond. Antonio Rella", 1924, "sung", ["peaceful", "sorrowful"]),
 ("78_o-salutaris-hostia-oh-saving-victim_sistine-chapel-choir-perosi-monsignor-rella-p_gbia0468205b", "O Salutaris Hostia (Oh Saving Victi - Sistine Chapel Choir.mp3", "sistine-o-salutaris-1924", "Lorenzo Perosi", "O Salutaris Hostia", "Sistine Chapel Choir, cond. Antonio Rella", 1924, "sung", ["peaceful"]),
 ("78_laudate-praise-ye_choir-of-monsignor-rella-sistine-chapel-choir-of-the-vatican-r_gbia0517925a", "Laudate (Praise Ye) - Choir of Monsignor Rella.mp3", "sistine-laudate-1924", "Palestrina", "Laudate", "Sistine Chapel Choir, cond. Antonio Rella", 1924, "sung", ["peaceful"]),
 ("78_kyrie-eleison-and-gloria_westminster-cathedral-choir-rev-vernon-russell-b-a_gbia3002378b", "KYRIE ELEISON AND GLORIA - WESTMINSTER CATHEDRAL CHOIR.mp3", "westminster-kyrie-gloria-1925", "", "Kyrie eleison and Gloria", "Westminster Cathedral Choir, cond. Fr. Vernon Russell", 1925, "sung", ["peaceful"]),
 ("78_sanctus-benedictus-and-agnus-dei_westminster-cathedral-choir-rev-vernon-russell-b_gbia3002377b", "SANCTUS BENEDICTUS AND AGNUS - WESTMINSTER CATHEDRAL CHOIR.mp3", "westminster-sanctus-agnus-1925", "", "Sanctus, Benedictus and Agnus Dei", "Westminster Cathedral Choir, cond. Fr. Vernon Russell", 1925, "sung", ["peaceful", "sorrowful"]),
 ("78_sanctus-from-messe-solennelle_westminster-cathedral-choir-anon-anon", "D_341_Ac_5678f.mp3", "westminster-sanctus-1911", "", "Sanctus from the Messe Solennelle", "Westminster Cathedral Choir", 1911, "sung", ["peaceful"]),
 ("78_ave-verum-corpus-hail-o-hail-true-body_english-singers-the", "E_305_Bb_3544-I.mp3", "english-singers-ave-verum-1923", "William Byrd", "Ave verum corpus", "The English Singers", 1923, "sung", ["peaceful", "sorrowful"]),
 ("coro-capella-sistina-mozart-ave-verum-gc-54767-bew", "Coro Capella Sistina Mozart Ave Verum GC-54767 bew.mp3", "sistine-ave-verum-1902", "W. A. Mozart", "Ave verum corpus", "Sistine Chapel Choir", 1902, "sung", ["peaceful", "sorrowful"]),
 ("da-458-mc-cormack-ave-maria-cav.", "DA 458 McCormack - Ave Maria (Cav.).mp3", "mccormack-kreisler-ave-maria-1914", "Pietro Mascagni", "Ave Maria (on the Intermezzo from Cavalleria rusticana)", "John McCormack, Fritz Kreisler", 1914, "sung", ["peaceful"]),
 ("78_panis-angelicus-oh-lord-most-holy_frances-alda-frank-la-forge-gutia-casini-csar_gbia7028237b", "Panis Angelicus (Oh Lord Most Holy) - Frances Alda.mp3", "alda-panis-angelicus-1920", "César Franck", "Panis Angelicus", "Frances Alda", 1920, "sung", ["peaceful", "sorrowful"]),
 ("78_gloria-twelfth-mass_gregorian-choir-mozart_gbia0023265a", "Gloria - Twelfth Mass - Gregorian Choir - Mozart.mp3", "gregorian-choir-gloria-1915", "attr. W. A. Mozart", "Gloria from the “Twelfth Mass”", "Gregorian Choir", 1915, "sung", ["peaceful"]),
 ("78_crucifix_john-mccormack-reinald-werrenrath-f-w-rosier-j-faure_gbia0057983a", "Crucifix - John McCormack - Reinald Werrenrath.mp3", "mccormack-crucifix-1917", "Jean-Baptiste Faure", "Crucifix", "John McCormack, Reinald Werrenrath", 1917, "sung", ["sorrowful"]),
 ("Caruso-Faure", "Caruso-Faure-Crucifix.mp3", "caruso-crucifix-1911", "Jean-Baptiste Faure", "Crucifix", "Enrico Caruso, Marcel Journet", 1911, "sung", ["sorrowful"]),
 ("78_before-the-crucifix_ernestine-schumann-heink-princess-gabrielle-wrede-frank-la-forg_gbia0524598b", "Before the Crucifix - Ernestine Schumann-Heink.mp3", "schumann-heink-before-the-crucifix-1915", "Frank La Forge", "Before the Crucifix", "Ernestine Schumann-Heink", 1915, "sung", ["sorrowful"]),
 ("78_ave-maria_jascha-heifetz-andr-benoist-schubert-wilhelmj_gbia0234102a", "Ave Maria - Jascha Heifetz - André Benoist.mp3", "heifetz-ave-maria-1917", "Franz Schubert", "Ave Maria (violin)", "Jascha Heifetz, André Benoist", 1917, "instrumental", ["peaceful", "sorrowful"]),
 ("78_ave-maria_mischa-elman-schubert-wilhelmj_gbia7003785a", "Ave Maria - MISCHA ELMAN - SCHUBERT - WILHELMJ.mp3", "elman-ave-maria-1913", "Franz Schubert", "Ave Maria (violin)", "Mischa Elman", 1913, "instrumental", ["peaceful", "sorrowful"]),
]
# light restoration for acoustic-era transfers: trim rumble and hiss, reduce surface noise
HISTORIC_FILTER = "highpass=f=70,lowpass=f=8000,afftdn=nr=10:nf=-40,"

def build_historic(out):
    for item, fname, tid, composer, title, performer, year, kind, moods in HISTORIC:
        if year > 1925: sys.exit(f"{tid}: {year} recording is not yet public domain in the US")
        dst = os.path.join(ROOT, "music", tid + ".mp3")
        if not os.path.exists(dst):
            tmp = dst + ".src"
            urllib.request.urlretrieve(f"https://archive.org/download/{item}/" + urllib.parse.quote(fname), tmp)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af",
                            HISTORIC_FILTER + "loudnorm=I=-22:TP=-2:LRA=11,afade=t=in:d=1.5",
                            "-ac", "2", "-ar", "44100", "-b:a", "96k", "-map_metadata", "-1", dst], check=True)
            os.remove(tmp)
        secs = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst], capture_output=True, text=True).stdout)
        out.append(dict(id=tid, src=f"music/{tid}.mp3", composer=composer, title=title, performer=f"{performer} ({year})", kind=kind, moods=moods,
                        duration=round(secs), source="Internet Archive 78 rpm (public domain recording)", link=f"https://archive.org/details/{item}"))
        print(tid, round(secs), "s", os.path.getsize(dst) // 1024, "KB", flush=True)

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
        out.append(dict(id=tid, src=f"music/{tid}.mp3", composer=composer, title=title, kind="instrumental", moods=moods, duration=round(secs),
                        source="Musopen (public domain)", link=f"https://archive.org/details/{ITEM}"))
        print(tid, round(secs), "s", os.path.getsize(dst) // 1024, "KB", flush=True)
    build_historic(out)
    json.dump({"tracks": out}, open(os.path.join(ROOT, "data/music.json"), "w"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()
