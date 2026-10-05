# The Illuminated Rosary

A mobile rosary, plus the Divine Mercy Chaplet, the Chaplet of the Seven
Sorrows, the Chaplet of St. Michael and the Chaplet of the Five Wounds, where
every prayer has its own public-domain painting. Swipe left to pray onward.

**Live app:** https://shalone86.github.io/illuminatedrosary/

- Pick the Joyful, Sorrowful, Glorious or Luminous mysteries. Today's set is
  suggested for you.
- Opening and closing prayers can each be switched on or off.
- In each decade, God the Father goes with the Our Father, ten different
  paintings of the mystery go with the Hail Marys, the Holy Trinity goes with
  the Glory Be, and Christ the Good Shepherd goes with the O My Jesus.
- Every rosary draws a fresh set of ten paintings from each mystery's pool.
- Ken Burns motion (on or off), whole-painting or full-bleed display, English
  or Latin, a minimal text mode, a hands-free timer, keep-screen-awake, resume
  where you left off, and offline install (PWA).
- Optional background music, Instrumental or Sung:
  - Instrumental: public-domain Musopen recordings (Bach, Suk, Haydn, Mozart,
    Schubert…) plus violin *Ave Marias* by Heifetz and Elman.
  - Sung: historic 78 rpm recordings from 1902–1925, public domain in the US
    (Sistine Chapel Choir, Westminster Cathedral Choir, the English Singers,
    McCormack, Caruso, Alda, Schumann-Heink).
  - The Joyful, Luminous and Glorious mysteries and St. Michael get a peaceful
    playlist. The Sorrowful mysteries, Seven Sorrows, Divine Mercy and the Five
    Wounds get a more contemplative one.
- Prayer form: Roman, or Byzantine (the wording of the Ukrainian Catholic
  rosary: "Rejoice, Mother of God", the Byzantine Glory Be and Creed, Eastern
  opening prayers and "It is truly right").
- "Fill" mode crops each painting around its faces (focal points found with
  OpenCV's YuNet detector, `tools/focal_points.py`).
- Installable app (PWA): an "Install app" link on Android and desktop, and
  instructions for iPhone. "Save all paintings for offline" (in About) caches
  every painting, about 90 MB.
- Tap ⓘ for the artwork's title, artist, date and source.

See [WORKSHOP.md](WORKSHOP.md) for the design concepts that were considered and
why this one was chosen.

## Project layout

```
index.html, css/, js/          the app (vanilla JS, no build step)
js/prayers.js                  prayer texts (EN/LA), mysteries, chaplets, scripture
data/art.json                  generated image catalogue (pools → artworks)
img/                           resized artwork (max 1400px)
music/, data/music.json        background music (python3 tools/build_music.py)
sw.js, manifest.webmanifest    offline support and install
tools/                         scripts that gather, curate and build the art
.nojekyll                      served as-is by GitHub Pages (main branch, root)
```

## Checking content

`node tools/validate.mjs` checks the prayer texts, devotion definitions, image
catalogue and music list for broken references. It also runs on every push in
GitHub Actions. If `data/art.json` is ever unreadable, the app still runs with
prayer text only.

## Rebuilding the art

```
python3 tools/gather.py                 # sdcason.com, Cleveland Museum of Art, The Met → candidates.json
python3 tools/gather_commons.py         # Wikimedia Commons for thin pools (slow on purpose)
# hand-curate tools/picks.txt (pool, source, indices into the candidate lists)
python3 tools/picks_to_selection.py     # → selection.json, extra.json
python3 tools/build_images.py           # downloads, resizes, writes img/ and data/art.json
```

## Image sources

All artwork is in the public domain or released under CC0:
[Free Catholic Gallery (sdcason.com)](https://sdcason.com),
[Cleveland Museum of Art Open Access](https://www.clevelandart.org/open-access),
[The Metropolitan Museum of Art Open Access](https://www.metmuseum.org/about-the-met/policies-and-documents/open-access),
and [Wikimedia Commons](https://commons.wikimedia.org).
Scripture is from the Douay-Rheims Bible.

Run it locally with `python3 -m http.server`, then open http://localhost:8000.
