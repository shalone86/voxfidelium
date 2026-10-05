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

---

# Workshop 2: adding chaplets without demoting the rosary

The goal is to add the Divine Mercy Chaplet, the Seven Sorrows and the
Chaplet of St. Michael while keeping the rosary home screen as it is (the
2×2 mystery cards, the toggles and the big Begin button).

## Options considered

### A. Tabs at the top ("Rosary | Chaplets")
- **Pros:** a clean split, and each tab gets its own layout.
- **Cons:** it puts new chrome above the hero and makes the rosary just
  one of two equals. The chaplets are also hidden until you think to tap the
  tab.

### B. A row of chaplet "ribbons" under the mysteries
The 2×2 rosary grid stays first and keeps its size. Below it, a "Chaplets"
heading introduces three wide, short cards, each with a strip of painting, a
name and one line of description. Picking one moves the gold ring to it. The
Prayers section then switches to that chaplet's optional parts, and the
button reads "Begin the Chaplet".
- **Pros:** everything stays on one screen, the chaplets are easy to find,
  and the rosary is still clearly the main event by size and position.
- **Cons:** the home screen gets a bit longer.

### C. A "More devotions" link at the bottom that opens a sheet
- **Pros:** leaves the home screen untouched.
- **Cons:** the chaplets are buried, and most people would never find them.

### D. A swipeable carousel of devotions at the top
- **Pros:** playful.
- **Cons:** it breaks up the 2×2 grid people already like, and it hides
  three of the four choices at any moment.

## Pick: B, chaplet ribbons

- The ribbons are about a third the height of a mystery card, so the rosary
  still dominates.
- Context badges appear on the cards:
  - **Divine Mercy:** "3 PM" during the Hour of Mercy, and "Feast" on Divine
    Mercy Sunday and on St. Faustina's day (Oct 5).
  - **Seven Sorrows:** "Feast" on Sept 15.
  - **St. Michael:** "Feast" on Michaelmas (Sept 29).
- Each chaplet brings its own optional prayers to the toggles. For example,
  the Divine Mercy opening prayers are "You expired, Jesus…" and "O Blood and
  Water…".

## Image mapping

**Divine Mercy Chaplet**

| Prayer | Image |
| --- | --- |
| Opening prayers | Divine Mercy, Sacred Heart and Man of Sorrows images |
| Eternal Father | God the Father |
| "For the sake of His sorrowful Passion" ×10 | the Passion, one scene per decade: Agony, Scourging, Crowning with Thorns, Carrying of the Cross, Crucifixion |
| Holy God ×3 | the Trinity |

**Seven Sorrows**

| Prayer | Image |
| --- | --- |
| Each sorrow (title card + 7 Hail Marys) | paintings of that sorrow: Simeon's prophecy, Flight into Egypt, Loss in the Temple, Mary meets Jesus on the way, Crucifixion, Descent from the Cross / Pietà, Entombment |
| Our Father | God the Father |
| Three Hail Marys for Our Lady's tears | Mater Dolorosa |

**Chaplet of St. Michael**

| Prayer | Image |
| --- | --- |
| Each of the nine salutations | choirs of angels |
| Our Father | St. Michael |
| Three Hail Marys | angels |
| The four closing Our Fathers | St. Michael, St. Gabriel, St. Raphael (Tobias and the Angel) and a guardian angel |

---

# Scope decision

The aim is for people to be able to jump straight in and pray. The set of
devotions is therefore closed:
- the Rosary, in its Roman or Byzantine form
- the Divine Mercy Chaplet
- the Seven Sorrows
- St. Michael
- the Five Wounds

No date badges, and no further chaplets. The site is meant to be built once and
left alone.
