# Workshop: an image-based rosary

The brief: a mobile rosary where every prayer has its own public-domain artwork.
You swipe left to go to the next prayer. Ken Burns motion can be switched on or off.
You choose the mysteries (Joyful, Sorrowful, Glorious, Luminous) and whether to
include the opening and closing prayers.

## Concepts considered

### 1. "Gallery Walk": full-bleed art, prayer text on a scrim
Each prayer fills the screen with one painting. The prayer text sits on a soft
gradient at the bottom, with a thin row of beads at the top. Swipe left to go
forward and right to go back. Tap the painting to hide everything except the art.
- **Pros:** it feels like a museum at prayer, it's simple to learn, and it works
  for both people praying alone and people leading a group.
- **Cons:** landscape paintings get cropped on a portrait phone. The fix is a
  "whole painting" mode with a blurred backdrop.

### 2. "Book of Hours": illuminated-manuscript pages
Each prayer is a page with the art in an ornamented frame and the text set like
a manuscript, with drop caps and rubrics in red. Swiping turns the page.
- **Pros:** beautiful and distinctive.
- **Cons:** the art gets small on a phone, and the frame competes with the
  paintings. Page-curl animations feel gimmicky by the third decade.

### 3. "Bead Ring": a circular rosary navigator
A rosary ring sits at the bottom of the screen. Each bead holds a tiny
thumbnail, and you spin the ring to advance.
- **Pros:** a clever and tactile way to see where you are.
- **Cons:** it fights the swipe-left idea and is fiddly with one hand. It also
  hides the art, which is the whole point.

### 4. "Contemplative Slideshow": hands-free
Images cross-fade by themselves at a set pace while the prayer text fades in
and out, like a meditative video.
- **Pros:** great on a TV or a tablet propped on a table.
- **Cons:** most people pray at their own speed, so this works better as a mode
  than as the whole app.

## Pick: Concept 1, with the best parts of the others

I built **Gallery Walk** and folded in:

- **Hands-free mode** (from concept 4): an optional auto-advance timer.
- **Manuscript typography touches** (from concept 2): serif type, red rubric
  labels and a drop cap on the mystery announcement.
- **Bead progress** (from concept 3): a quiet row of ten beads for the current
  decade. You can tap it to jump.

### Features
- Choose the mysteries. Today's set is suggested by weekday (Joyful on Mon/Sat,
  Sorrowful on Tue/Fri, Glorious on Wed/Sun, Luminous on Thu).
- Separate toggles for the opening prayers and the closing prayers.
- **Ken Burns** on/off, with a slow, randomised pan and zoom.
- **Fit** (the whole painting on a blurred backdrop) or **Fill** (full bleed).
- **Fresh art each time:** each mystery has a pool of more than ten paintings,
  and ten are drawn for each rosary.
- **English or Latin** prayers.
- **Text: full / hidden.** A minimal mode for people who know the prayers.
  Tap the image to bring the text back.
- Artwork credits (title, artist, date, collection, link to the source).
- A mystery announcement card with scripture (Douay-Rheims) and the fruit of
  the mystery.
- **Keeps the screen awake** while you pray (Wake Lock API).
- **Resume** where you left off.
- Installable, offline-capable PWA.
- Keyboard arrows on desktop, and tap zones on the left and right edges.

### Image mapping per decade
| Prayer | Image |
| --- | --- |
| Mystery announcement | a painting of the mystery |
| Our Father | God the Father |
| Hail Mary ×10 | ten different paintings of the mystery |
| Glory Be | the Holy Trinity |
| O My Jesus | Christ the Good Shepherd |

Opening: Sign of the Cross (Trinity), Apostles' Creed (Christ Pantocrator /
Salvator Mundi), Our Father (God the Father), three Hail Marys (Madonna and
Child), Glory Be (Trinity).
Closing: Hail, Holy Queen (Coronation of the Virgin), the Rosary prayer
(Madonna of the Rosary), Sign of the Cross (Trinity).

### Sources
Images are re-hosted from public-domain or CC0 collections: the Free Catholic
Gallery (sdcason.com), the Cleveland Museum of Art Open Access collection (CC0),
the Metropolitan Museum of Art Open Access collection, and others. Every image
carries its credit and a link back to its source.
