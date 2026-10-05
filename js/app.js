import { PRAYERS, MYSTERIES, CHAPLETS, NOTES, ORDINALS } from "./prayers.js";

const $ = (s, el = document) => el.querySelector(s);
const SET_ORDER = ["joyful", "luminous", "sorrowful", "glorious"];
const CHAPLET_ORDER = ["divineMercy", "sevenSorrows", "stMichael"];
// Every devotion exposes the same shape: name, groups (decades / sorrows / salutations), kind.
const DEVOTIONS = {};
for (const [k, m] of Object.entries(MYSTERIES)) DEVOTIONS[k] = { ...m, kind: "rosary", groups: m.decades, groupWord: { en: "Mystery", la: "Mysterium" } };
Object.assign(DEVOTIONS, CHAPLETS);
const isRosary = (k) => DEVOTIONS[k] && DEVOTIONS[k].kind === "rosary";
// a prayer in the session language, falling back to English
const P_ = (key, lang) => PRAYERS[key][lang] || PRAYERS[key].en;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ---------------- storage ---------------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem("rosary." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("rosary." + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem("rosary." + k); } catch {} },
};

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const settings = Object.assign({
  set: todaysSet(), opening: true, closing: true,
  kenBurns: !reduceMotion, fit: "fit", lang: "en", text: "full", auto: 0,
}, store.get("settings", {}));
const saveSettings = () => store.set("settings", settings);
if (!DEVOTIONS[settings.set]) settings.set = todaysSet();
if (![0, 5, 10, 15, 20].includes(settings.auto)) settings.auto = 20; // older builds offered 35s/60s

function todaysSet() {
  const d = new Date().getDay();
  return SET_ORDER.find((k) => MYSTERIES[k].days.includes(d)) || "joyful";
}

/* ---------------- art ---------------- */
let ART = { pools: {} };
const artById = new Map();

async function loadArt() {
  const r = await fetch("data/art.json");
  ART = await r.json();
  for (const [pool, list] of Object.entries(ART.pools)) for (const a of list) { a.pool = pool; artById.set(a.id, a); }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Deals images from shuffled decks so nothing repeats until a pool is exhausted.
function makeDealer() {
  const decks = {}, used = new Set();
  return (pool) => {
    if (Array.isArray(pool)) {
      const key = pool.join("+");
      if (!ART.pools[key]) ART.pools[key] = pool.flatMap((p) => ART.pools[p] || []);
      pool = key;
    }
    const list = ART.pools[pool] || [];
    if (!list.length) return null;
    for (let tries = 0; tries < 2; tries++) {
      if (!decks[pool] || !decks[pool].length) decks[pool] = shuffle(list.map((a) => a.id));
      while (decks[pool].length) {
        const id = decks[pool].pop();
        if (!used.has(id) || tries) { used.add(id); return id; }
      }
    }
    return list[0].id;
  };
}

/* ---------------- building a devotion ---------------- */
// A step is one slide: { type: prayer|announce|end, prayer, art, g (group index),
// bead / beads (position on the bead row), big (the large bead), section, note, n }
function buildSteps(key, opening, closing) {
  const deal = makeDealer();
  const dev = DEVOTIONS[key];
  const steps = [];
  const P = (prayer, pool, extra = {}) => steps.push({ type: "prayer", prayer, art: deal(pool), ...extra });
  const times = (n, fn) => { for (let i = 1; i <= n; i++) fn(i); };
  const group = (g, pool, prayer, count, { announce = true, big = ["ourFather", "father"] } = {}) => {
    // deal the bead images first so the announcement draws one more when the pool allows
    const ids = Array.from({ length: count }, () => deal(pool));
    if (announce) steps.push({ type: "announce", g, beads: count, art: deal(pool) || ids[0] });
    P(big[0], big[1], { g, bead: 0, big: true, beads: count });
    ids.forEach((id, i) => steps.push({ type: "prayer", prayer, art: id, g, bead: i + 1, beads: count }));
  };

  if (dev.kind === "rosary") {
    if (opening) {
      P("sign", "trinity", { section: "opening" });
      P("creed", "pantocrator", { section: "opening" });
      P("ourFather", "father", { section: "opening" });
      ["faith", "hope", "charity"].forEach((note, i) => P("hailMary", "madonna", { section: "opening", bead: i + 1, beads: 3, note }));
      P("gloryBe", "trinity", { section: "opening" });
    }
    dev.groups.forEach((m, g) => {
      group(g, m.pool, "hailMary", 10);
      P("gloryBe", "trinity", { g, bead: 11, beads: 10 });
      P("fatima", "shepherd", { g, bead: 11, beads: 10 });
    });
    if (closing) {
      P("hailHolyQueen", "coronation", { section: "closing" });
      P("rosaryPrayer", "rosary", { section: "closing" });
      P("sign", "trinity", { section: "closing" });
    }
    steps.push({ type: "end", art: deal("rosary") || deal("madonna") });
  } else if (dev.kind === "divineMercy") {
    P("sign", "trinity", { section: "opening" });
    if (opening) {
      P("dmOpening", "mercy", { section: "opening" });
      times(3, (n) => P("bloodWater", "mercy", { section: "opening", bead: n, beads: 3, n }));
    }
    P("ourFather", "father", { section: "opening" });
    P("hailMary", "madonna", { section: "opening" });
    P("creed", "pantocrator", { section: "opening" });
    dev.groups.forEach((m, g) => group(g, m.pool, "sorrowfulPassion", 10, { announce: false, big: ["eternalFather", "father"] }));
    times(3, (n) => P("holyGod", "trinity", { section: "closing", bead: n, beads: 3, n }));
    if (closing) P("dmClosing", "mercy", { section: "closing" });
    P("sign", "trinity", { section: "closing" });
    steps.push({ type: "end", art: deal("mercy") });
  } else if (dev.kind === "sevenSorrows") {
    P("sign", "trinity", { section: "opening" });
    P("deusInAdiutorium", "dolorosa", { section: "opening" });
    if (opening) P("contrition", "mercy", { section: "opening" });
    dev.groups.forEach((m, g) => group(g, m.pool, "hailMary", 7));
    times(3, (n) => P("hailMary", "dolorosa", { section: "closing", bead: n, beads: 3, note: "tears", n }));
    if (closing) P("sorrowsClosing", "pieta", { section: "closing" });
    P("sign", "trinity", { section: "closing" });
    steps.push({ type: "end", art: deal("dolorosa") });
  } else if (dev.kind === "stMichael") {
    P("sign", "trinity", { section: "opening" });
    P("deusInAdiutorium", "michael", { section: "opening" });
    // claim the four archangel/guardian images first; the salutations then draw from every angel pool
    const honors = ["michael", "gabriel", "raphael", "guardian"].map((who) => [who, deal(who)]);
    const host = ["angels", "gabriel", "raphael", "guardian"];
    dev.groups.forEach((m, g) => {
      P("salutation" + g, host, { g, bead: -1, beads: 3, plain: true });
      const hm = Array.from({ length: 3 }, () => deal(host));
      P("ourFather", "michael", { g, bead: 0, big: true, beads: 3 });
      hm.forEach((id, i) => steps.push({ type: "prayer", prayer: "hailMary", art: id, g, bead: i + 1, beads: 3 }));
    });
    honors.forEach(([who, art], i) => steps.push({ type: "prayer", prayer: "ourFather", art, section: "honors", note: who, bead: i + 1, beads: 4 }));
    P("michaelClosing", "michael", { section: "closing" });
    P("michaelPrayer", "michael", { section: "closing" });
    P("sign", "trinity", { section: "closing" });
    steps.push({ type: "end", art: deal("michael") });
  }
  return steps;
}

/* ---------------- state ---------------- */
let session = null; // { set, steps, index, lang, started }
let autoTimer = null, autoStart = 0, wakeLock = null;

function saveSession() { if (session) store.set("session", session); }

/* ---------------- home screen ---------------- */
function renderHome() {
  const sets = $("#sets");
  sets.innerHTML = "";
  const today = todaysSet();
  for (const k of SET_ORDER) {
    const m = MYSTERIES[k];
    const b = document.createElement("button");
    b.className = "set";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(settings.set === k));
    const cover = coverFor(k);
    if (cover) b.style.backgroundImage = `url("${cover.src}")`;
    b.innerHTML = `${k === today ? '<span class="badge">TODAY</span>' : ""}
      <span class="set-name">${m.name.en.replace(" Mysteries", "")}</span>
      <span class="set-days">${m.days.map((d) => DAY_NAMES[d]).join(" · ")}</span>`;
    b.onclick = () => { settings.set = k; saveSettings(); renderHome(); };
    sets.appendChild(b);
  }
  const chaplets = $("#chaplets");
  chaplets.innerHTML = "";
  for (const k of CHAPLET_ORDER) {
    const c = DEVOTIONS[k];
    const b = document.createElement("button");
    b.className = "ribbon";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(settings.set === k));
    const cover = coverFor(k);
    if (cover) b.style.backgroundImage = `url("${cover.src}")`;
    const badge = chapletBadge(k);
    b.innerHTML = `${badge ? `<span class="badge">${badge}</span>` : ""}
      <span class="ribbon-name">${c.name.en}</span><span class="ribbon-sub">${c.sub}</span>`;
    b.onclick = () => { settings.set = k; saveSettings(); renderHome(); };
    chaplets.appendChild(b);
  }

  const bgc = coverFor(settings.set);
  if (bgc) $(".home-bg").style.backgroundImage = `url("${bgc.src}")`;

  // the toggles describe the selected devotion's optional prayers
  const dev = DEVOTIONS[settings.set];
  const opts = isRosary(settings.set)
    ? { opening: ["Opening prayers", "Sign of the Cross, Creed, Our Father, three Hail Marys, Glory Be"], closing: ["Closing prayers", "Hail, Holy Queen and the Rosary prayer"] }
    : dev.options;
  document.querySelectorAll("#home [data-setting]").forEach((el) => {
    const key = el.dataset.setting, row = el.closest(".row");
    row.hidden = !opts[key];
    if (opts[key]) row.querySelector("span").innerHTML = `${opts[key][0]}<small>${opts[key][1]}</small>`;
    el.checked = !!settings[key];
    el.onchange = () => { settings[key] = el.checked; saveSettings(); };
  });
  $("#prayersNote").hidden = !!(opts.opening || opts.closing);
  $("#prayersNote").textContent = dev.kind === "stMichael" ? "The opening invocation, nine salutations, four Our Fathers and the closing prayers are all included." : "";
  $("[data-action=begin]").textContent = isRosary(settings.set) ? "Begin the Rosary" : dev.begin;
  renderSettings($("#home [data-settings]"));

  const saved = store.get("session", null);
  const r = $("#resume");
  if (saved && DEVOTIONS[saved.set] && saved.v === 2 && saved.index > 0 && saved.index < saved.steps.length - 1 && saved.steps.every((s) => !s.art || artById.has(s.art))) {
    r.hidden = false;
    $(".resume-detail", r).textContent = `${DEVOTIONS[saved.set].name.en} — ${describeStep(saved.steps[saved.index], saved.set)}`;
  } else r.hidden = true;
}

function coverFor(setKey) {
  const dev = DEVOTIONS[setKey];
  const pool = ART.pools[dev.cover || dev.groups[0].pool];
  const c = ART.covers && ART.covers[setKey] ? artById.get(ART.covers[setKey]) : pool && pool[0];
  return c || null;
}

// Western Easter (anonymous Gregorian algorithm), for Divine Mercy Sunday
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
}

function chapletBadge(k, now = new Date()) {
  const md = `${now.getMonth() + 1}-${now.getDate()}`;
  if (k === "divineMercy") {
    const dms = easter(now.getFullYear()); dms.setDate(dms.getDate() + 7);
    if (now.toDateString() === dms.toDateString() || md === "10-5") return "FEAST";
    if (now.getHours() === 15) return "3 PM";
  }
  if (k === "sevenSorrows" && md === "9-15") return "FEAST";
  if (k === "stMichael" && md === "9-29") return "FEAST";
  return "";
}

const OPTIONS = [
  { key: "kenBurns", label: "Ken Burns motion", hint: "Slow pan and zoom across each painting", type: "switch" },
  { key: "fit", label: "Painting", hint: "Whole painting, or fill the screen", type: "seg", options: [["fit", "Whole"], ["fill", "Fill"]] },
  { key: "text", label: "Prayer text", hint: "Minimal hides the words; tap the image to reveal", type: "seg", options: [["full", "Full"], ["minimal", "Minimal"]] },
  { key: "lang", label: "Language", type: "seg", options: [["en", "English"], ["la", "Latin"]] },
  { key: "auto", label: "Hands-free", hint: "Advance automatically after a pause", type: "seg", options: [[0, "Off"], [5, "5s"], [10, "10s"], [15, "15s"], [20, "20s"]] },
];

function renderSettings(host) {
  host.innerHTML = "";
  for (const o of OPTIONS) {
    const row = document.createElement(o.type === "switch" ? "label" : "div");
    row.className = "row";
    row.innerHTML = `<span>${o.label}${o.hint ? `<small>${o.hint}</small>` : ""}</span>`;
    if (o.type === "switch") {
      const inp = document.createElement("input");
      inp.type = "checkbox"; inp.className = "switch"; inp.checked = !!settings[o.key];
      inp.onchange = () => { settings[o.key] = inp.checked; saveSettings(); applySettings(); };
      row.appendChild(inp);
    } else {
      const seg = document.createElement("div");
      seg.className = "seg"; seg.setAttribute("role", "group"); seg.setAttribute("aria-label", o.label);
      for (const [v, l] of o.options) {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = l; b.setAttribute("aria-pressed", String(settings[o.key] === v));
        b.onclick = () => {
          settings[o.key] = v; saveSettings();
          seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          applySettings();
        };
        seg.appendChild(b);
      }
      row.appendChild(seg);
    }
    host.appendChild(row);
  }
}

function applySettings() {
  const pray = $("#pray");
  pray.classList.toggle("fill", settings.fit === "fill");
  pray.classList.toggle("minimal", settings.text === "minimal");
  if (session) {
    session.lang = settings.lang;
    renderTrack();
  }
}

/* ---------------- prayer screen ---------------- */
const ord = (g, lang) => ORDINALS[lang][g];

function groupLine(dev, g, lang) {
  if (dev.kind === "rosary") return lang === "la" ? `Mysterium ${ord(g, "la")}` : `${ord(g, "en")} ${dev.name.en.replace(" Mysteries", "")} Mystery`;
  return lang === "la" ? `${dev.groupWord.la} ${ord(g, "la")}` : `${ord(g, "en")} ${dev.groupWord.en}`;
}

function sectionLine(dev, section, lang) {
  if (section === "opening") return lang === "la" ? "Initium" : "Opening Prayers";
  if (section === "honors") return lang === "la" ? "Quattuor Pater Noster" : "Four Our Fathers";
  if (section === "closing") return lang === "la" ? "Conclusio" : "Closing Prayers";
  return dev.name[lang];
}

function describeStep(step, key, lang = "en") {
  const dev = DEVOTIONS[key];
  if (step.type === "announce") return `${groupLine(dev, step.g, lang)}: ${dev.groups[step.g].name[lang]}`;
  if (step.type === "end") return lang === "la" ? "Finis" : "The end";
  const p = P_(step.prayer, lang).title;
  if (step.g != null) return `${dev.groups[step.g].name[lang]} · ${p}${step.bead > 0 && !step.big && step.bead <= step.beads ? ` ${step.bead}` : ""}`;
  return `${sectionLine(dev, step.section, lang)} · ${p}`;
}

function slideHTML(step) {
  const lang = session.lang;
  const dev = DEVOTIONS[session.set];
  if (step.type === "announce") {
    const m = dev.groups[step.g];
    const ordLine = lang === "la" || dev.kind !== "rosary" ? groupLine(dev, step.g, lang) : `The ${groupLine(dev, step.g, "en")}`;
    return `<div class="scrim"></div><div class="words">
      <div class="ordinal">${ordLine}</div>
      <div class="mname">${m.name[lang]}</div>
      ${m.verse ? `<div class="verse">${m.verse}</div><div class="ref">${m.ref}</div>` : ""}
      ${m.fruit ? `<div class="fruit">Fruit · ${m.fruit}</div>` : ""}${creditLine(step)}</div>`;
  }
  if (step.type === "end") {
    return `<div class="scrim" style="height:100%"></div><div class="words">
      <div class="amen">Amen.</div>
      <div class="ref">${dev.name[lang]}</div>
      <div class="actions">
        <button class="primary" data-action="home">Return home</button>
        <button data-action="again">Pray again</button>
      </div></div>`;
  }
  const p = P_(step.prayer, lang);
  // the top bar already names the section, so the label carries the mystery, scene or intention
  let label = step.note ? NOTES[step.note][lang] : step.g != null && !step.plain ? dev.groups[step.g].name[lang] : "";
  let title = p.title;
  const counted = (step.prayer === "hailMary" || step.prayer === "sorrowfulPassion") && step.bead > 0 && step.bead <= step.beads;
  if (counted || step.n) title += ` <span style="opacity:.6;font-weight:400">${toRoman(step.n || step.bead)}</span>`;
  const body = p.text;
  const long = body.length > 330 ? " long" : "";
  return `<div class="scrim"></div><div class="words">
    ${label ? `<div class="label">${label}</div>` : ""}
    <h2 class="title">${title}</h2>
    <div class="body${long}">${body}</div>
    <div class="tap-note">Tap to show the prayer</div>${creditLine(step)}</div>`;
}

function creditLine(step) {
  const a = step.art && artById.get(step.art);
  if (!a) return "";
  return `<div class="credit">${esc([a.artist, a.date].filter(Boolean).join(", ") || a.title)}</div>`;
}

function toRoman(n) {
  return ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || String(n);
}

function makeSlide(idx) {
  const el = document.createElement("div");
  el.className = "slide";
  el.dataset.idx = idx;
  const step = session.steps[idx];
  if (!step) return el;
  el.classList.add(step.type);
  const a = step.art && artById.get(step.art);
  if (a) {
    const bd = document.createElement("div");
    bd.className = "backdrop";
    if (a.lq) bd.style.backgroundImage = `url("${a.lq}")`;
    el.appendChild(bd);
    const art = document.createElement("div");
    art.className = "art";
    initKenBurns(art);
    const img = new Image();
    img.alt = `${a.title}${a.artist ? ", " + a.artist : ""}`;
    img.decoding = "async";
    img.onload = () => img.classList.add("loaded");
    img.src = a.src;
    if (img.complete) img.classList.add("loaded");
    art.appendChild(img);
    el.appendChild(art);
    applyKenBurns(el, false);
  }
  el.insertAdjacentHTML("beforeend", slideHTML(step));
  return el;
}

// Each slide gets its pan/zoom path when it is created and rests on the path's first
// frame while it waits off-screen, so the animation starts exactly where the slide
// already is when it swipes in (no jump).
function initKenBurns(art) {
  const r = (a, b) => (a + Math.random() * (b - a)).toFixed(3);
  const fill = settings.fit === "fill";
  const zoomIn = Math.random() < 0.6;
  const lo = fill ? 1.04 : 1.0, hi = fill ? 1.22 : 1.14;
  const [s0, s1] = zoomIn ? [lo, hi] : [hi, lo];
  const pan = fill ? 3.5 : 2.5;
  art.style.setProperty("--s0", s0);
  art.style.setProperty("--s1", s1);
  art.style.setProperty("--x0", r(-pan, pan) + "%");
  art.style.setProperty("--y0", r(-pan, pan) + "%");
  art.style.setProperty("--x1", r(-pan, pan) + "%");
  art.style.setProperty("--y1", r(-pan, pan) + "%");
  art.style.setProperty("--kb-dur", r(18, 26) + "s");
}

function applyKenBurns(slide, active) {
  const art = $(".art", slide);
  if (!art) return;
  art.style.transform = settings.kenBurns ? "scale(var(--s0)) translate(var(--x0), var(--y0))" : "";
  slide.classList.toggle("kb", settings.kenBurns && active);
}

let slides = []; // [prev, cur, next]

function renderTrack() {
  const track = $("#track");
  track.classList.remove("anim");
  track.style.transform = "translateX(0)";
  track.innerHTML = "";
  slides = [-1, 0, 1].map((o) => {
    const s = makeSlide(session.index + o);
    s.style.left = `${o * 100}%`;
    track.appendChild(s);
    return s;
  });
  slides[1].classList.add("current");
  applyKenBurns(slides[1], true);
  updateChrome();
  preload();
  scheduleAuto();
  saveSession();
}

function preload() {
  for (const o of [2, 3]) {
    const st = session.steps[session.index + o];
    const a = st && st.art && artById.get(st.art);
    if (a) { const i = new Image(); i.src = a.src; }
  }
}

function updateChrome() {
  const step = session.steps[session.index];
  const dev = DEVOTIONS[session.set];
  const lang = session.lang;
  $("#whereLine").textContent = step.g != null ? groupLine(dev, step.g, lang) : step.type === "end" ? dev.name[lang] : sectionLine(dev, step.section, lang);

  const beads = $("#beads");
  beads.innerHTML = "";
  const mk = (cls) => { const b = document.createElement("span"); b.className = "bead " + cls; beads.appendChild(b); };
  if (step.g != null) {
    // large bead, then the small beads; the rosary adds a marker for the Glory Be / O My Jesus
    const n = step.beads || 10;
    const pos = step.type === "announce" ? -1 : step.bead;
    mk("big" + (pos === 0 ? " now" : pos > 0 ? " done" : ""));
    for (let i = 1; i <= n; i++) mk(i === pos ? "now" : i < pos ? "done" : "");
    if (dev.kind === "rosary") mk("sep" + (pos === n + 1 ? " now" : ""));
  } else if (step.beads) {
    for (let i = 1; i <= step.beads; i++) mk(i === step.bead ? "now" : i < step.bead ? "done" : "");
  }
  $("#progressFill").style.width = `${(session.index / (session.steps.length - 1)) * 100}%`;
  $("#swipeHint").hidden = !(session.index === 0 && !store.get("swiped", false));
}

let animating = false;

let queued = 0;

function go(delta) {
  if (!session) return;
  if (animating) { queued = delta; return; } // e.g. a quick second arrow-key press

  const target = session.index + delta;
  if (target < 0 || target >= session.steps.length) { bounce(delta); return; }
  const track = $("#track");
  track.classList.add("anim");
  track.style.transform = `translateX(${-delta * 100}%)`;
  if (delta > 0) store.set("swiped", true);
  clearAuto();
  animating = true;
  let fallback = 0;
  const done = (e) => {
    if (e && e.target !== track) return; // ignore transitions bubbling from slide contents
    track.removeEventListener("transitionend", done);
    clearTimeout(fallback);
    animating = false;
    session.index = target;
    // recycle slides
    track.classList.remove("anim");
    track.style.transform = "translateX(0)";
    if (delta > 0) {
      slides[0].remove();
      slides = [slides[1], slides[2], makeSlide(target + 1)];
      track.appendChild(slides[2]);
    } else {
      slides[2].remove();
      slides = [makeSlide(target - 1), slides[0], slides[1]];
      track.prepend(slides[0]);
    }
    slides.forEach((s, i) => { s.style.left = `${(i - 1) * 100}%`; s.classList.toggle("current", i === 1); applyKenBurns(s, i === 1); });
    slides[1].querySelector(".words")?.classList.remove("reveal");
    updateChrome();
    preload();
    scheduleAuto();
    saveSession();
    if (queued) { const q = queued; queued = 0; go(q); }
  };
  track.addEventListener("transitionend", done);
  fallback = setTimeout(done, 650);
}

function bounce(delta) {
  const track = $("#track");
  track.classList.add("anim");
  track.style.transform = `translateX(${delta * -6}%)`;
  setTimeout(() => { track.style.transform = "translateX(0)"; }, 180);
}

/* ---------------- gestures ---------------- */
function setupGestures() {
  const pray = $("#pray"), track = $("#track");
  let x0 = 0, y0 = 0, dx = 0, t0 = 0, dragging = false, decided = false, horiz = false, pid = null;
  pray.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, a, .chrome")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    x0 = e.clientX; y0 = e.clientY; dx = 0; t0 = performance.now(); dragging = true; decided = false; horiz = false; pid = e.pointerId;
  });
  pray.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pid) return;
    const mx = e.clientX - x0, my = e.clientY - y0;
    if (!decided && Math.hypot(mx, my) > 8) {
      decided = true; horiz = Math.abs(mx) > Math.abs(my);
      if (horiz) { try { pray.setPointerCapture(pid); } catch {} track.classList.remove("anim"); clearAuto(); }
    }
    if (horiz) {
      dx = mx;
      const atEdge = (dx > 0 && session.index === 0) || (dx < 0 && session.index === session.steps.length - 1);
      const eff = atEdge ? dx * 0.25 : dx;
      track.style.transform = `translateX(${eff}px)`;
    }
  });
  const end = (e) => {
    if (!dragging || e.pointerId !== pid) return;
    dragging = false;
    if (horiz) {
      const w = pray.clientWidth, v = Math.abs(dx) / Math.max(1, performance.now() - t0);
      if (Math.abs(dx) > w * 0.2 || (v > 0.45 && Math.abs(dx) > 30)) go(dx < 0 ? 1 : -1);
      else { track.classList.add("anim"); track.style.transform = "translateX(0)"; scheduleAuto(); }
    } else if (!decided && e.type === "pointerup") {
      onTap(e);
    }
  };
  pray.addEventListener("pointerup", end);
  pray.addEventListener("pointercancel", end);

  document.addEventListener("keydown", (e) => {
    if ($("#pray").hidden || !$("#sheet").hidden) { if (e.key === "Escape") closeSheet(); return; }
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
    else if (e.key === "Escape") openMenu();
    else if (e.key === "i") openInfo();
  });
}

function onTap(e) {
  const words = slides[1] && $(".words", slides[1]);
  const pray = $("#pray");
  if (settings.text === "minimal" && words && !words.classList.contains("reveal") && !pray.classList.contains("immersive")) {
    words.classList.add("reveal");
    return;
  }
  pray.classList.toggle("immersive");
}

/* ---------------- hands-free ---------------- */
function clearAuto() {
  clearTimeout(autoTimer); autoTimer = null;
  const f = $("#autoFill");
  f.style.transition = "none"; f.style.width = "0";
}
function scheduleAuto() {
  clearAuto();
  if (!session || !settings.auto || $("#pray").hidden) return;
  if (session.index >= session.steps.length - 1) return;
  const step = session.steps[session.index];
  // give long prayers (Creed, Salve Regina) more time
  const len = step.type === "prayer" ? P_(step.prayer, "en").text.length : 200;
  const ms = settings.auto * 1000 * Math.max(1, len / 260);
  const f = $("#autoFill");
  void f.offsetWidth;
  f.style.transition = `width ${ms}ms linear`;
  f.style.width = "100%";
  autoTimer = setTimeout(() => go(1), ms);
}

/* ---------------- wake lock ---------------- */
async function keepAwake() {
  try { if ("wakeLock" in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release", () => (wakeLock = null)); } } catch {}
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && !$("#pray").hidden) keepAwake(); });

/* ---------------- sheets ---------------- */
function openSheet(html) {
  const sheet = $("#sheet"), panel = $(".sheet-panel");
  $("#sheetBody").innerHTML = html;
  sheet.classList.remove("closing");
  panel.style.transform = "";
  panel.scrollTop = 0;
  sheet.hidden = false;
  clearAuto();
}
let closeTimer = 0;
function closeSheet() {
  const sheet = $("#sheet"), panel = $(".sheet-panel");
  if (sheet.hidden || sheet.classList.contains("closing")) return;
  sheet.classList.add("closing");
  panel.style.transform = "";
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    sheet.hidden = true;
    sheet.classList.remove("closing");
    $(".sheet-scrim").style.opacity = "";
    if (!$("#pray").hidden) scheduleAuto();
  }, 260);
}

// Pull the sheet down to dismiss it: from the grip/header anywhere, or from the
// content once it is scrolled to the top.
function setupSheetDrag() {
  const panel = $(".sheet-panel"), scrim = $(".sheet-scrim");
  let y0 = null, dy = 0, t0 = 0, dragging = false;
  const start = (y) => { y0 = y; dy = 0; t0 = performance.now(); dragging = false; };
  const move = (y, e) => {
    if (y0 == null) return;
    const d = y - y0;
    if (!dragging) {
      if (d > 6 && panel.scrollTop <= 0) { dragging = true; panel.classList.add("dragging"); }
      else if (Math.abs(d) > 6) { y0 = null; return; }
      else return;
    }
    dy = Math.max(0, d);
    panel.style.transform = `translateY(${dy}px)`;
    scrim.style.opacity = String(Math.max(0, 1 - dy / 400));
    if (e.cancelable) e.preventDefault();
  };
  const end = () => {
    if (dragging) {
      panel.classList.remove("dragging");
      const v = dy / Math.max(1, performance.now() - t0);
      if (dy > 100 || (v > 0.5 && dy > 30)) closeSheet();
      else { panel.style.transform = ""; scrim.style.opacity = ""; }
    }
    y0 = null; dragging = false;
  };
  panel.addEventListener("touchstart", (e) => start(e.touches[0].clientY), { passive: true });
  panel.addEventListener("touchmove", (e) => move(e.touches[0].clientY, e), { passive: false });
  panel.addEventListener("touchend", end);
  panel.addEventListener("touchcancel", end);
  // mouse: drag by the grip
  const grip = $(".sheet-grab");
  grip.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse" || e.target.closest("button")) return; grip.setPointerCapture(e.pointerId); start(e.clientY); });
  grip.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" && y0 != null) move(e.clientY, e); });
  grip.addEventListener("pointerup", (e) => { if (e.pointerType === "mouse") end(); });
}

function esc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function openInfo() {
  const step = session.steps[session.index];
  const a = step.art && artById.get(step.art);
  if (!a) return;
  openSheet(`<img class="thumb" src="${a.src}" alt="">
    <h3>${esc(a.title)}</h3>
    <p class="meta">${[a.artist, a.date].filter(Boolean).map(esc).join(", ")}<br>${esc(a.source)}</p>
    ${a.link ? `<a class="src" href="${esc(a.link)}" target="_blank" rel="noopener">View at the source ↗</a>` : ""}`);
}

function openMenu() {
  const set = DEVOTIONS[session.set];
  const lang = session.lang;
  const jumps = [];
  const firstIdx = (pred) => session.steps.findIndex(pred);
  const section = (name) => { const i = firstIdx((s) => s.section === name); if (i >= 0) jumps.push([i, sectionLine(set, name, lang), ""]); };
  section("opening");
  set.groups.forEach((m, g) => jumps.push([firstIdx((s) => s.g === g), m.name[lang], ord(g, lang)]));
  section("honors");
  section("closing");
  const curSection = jumps.filter(([i]) => i <= session.index).pop();
  openSheet(`<h3>${set.name[lang]}</h3>
    <p class="meta">${esc(describeStep(session.steps[session.index], session.set, lang))}</p>
    <div class="jump">${jumps.map(([i, l, r]) => `<button data-jump="${i}" class="${curSection && curSection[0] === i ? "current" : ""}"><span>${esc(l)}</span><span>${esc(r)}</span></button>`).join("")}</div>
    <section><h2 class="rubric">Viewing</h2><div data-settings></div></section>
    <button class="danger" data-action="home">End &amp; return home</button>`);
  renderSettings($("#sheetBody [data-settings]"));
}

function openCredits() {
  const all = Object.values(ART.pools).flat();
  const uniq = [...new Map(all.map((a) => [a.id, a])).values()];
  const bySource = {};
  for (const a of uniq) (bySource[a.source] ||= []).push(a);
  openSheet(`<h3>About</h3>
    <div class="prose">
      <p>The Illuminated Rosary pairs every prayer with a work of sacred art: the Rosary, the Divine Mercy Chaplet, the Chaplet of the Seven Sorrows and the Chaplet of St. Michael. The paintings for each decade are drawn fresh from a pool of works on that mystery every time you pray.</p>
      <p>All images are public domain or CC0, from the <a href="https://sdcason.com" target="_blank" rel="noopener">Free Catholic Gallery</a>, the <a href="https://www.clevelandart.org/open-access" target="_blank" rel="noopener">Cleveland Museum of Art</a>, <a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" target="_blank" rel="noopener">The Metropolitan Museum of Art</a> and others. Scripture is from the Douay-Rheims Bible.</p>
      <p><a href="https://github.com/shalone86/voxfidelium" target="_blank" rel="noopener">Source on GitHub</a></p>
    </div>
    ${Object.entries(bySource).map(([src, list]) => `<section><h2 class="rubric">${esc(src)} · ${list.length}</h2><ul class="credits-list">${list
      .map((a) => `<li><a href="${esc(a.link)}" target="_blank" rel="noopener">${esc(a.title)}</a> <span class="who">— ${esc([a.artist, a.date].filter(Boolean).join(", "))}</span></li>`).join("")}</ul></section>`).join("")}`);
}

/* ---------------- navigation between screens ---------------- */
function startRosary(fresh = true, push = true) {
  if (fresh) {
    session = { v: 2, set: settings.set, steps: buildSteps(settings.set, settings.opening, settings.closing), index: 0, lang: settings.lang, started: Date.now() };
  }
  session.lang = settings.lang;
  $("#home").hidden = true;
  $("#pray").hidden = false;
  $("#pray").classList.remove("immersive");
  document.body.style.overflow = "hidden";
  applySettings();
  renderTrack();
  keepAwake();
  if (push) history.pushState({ pray: true }, "");
}

function goHome() {
  clearAuto();
  closeSheet();
  if (session && session.index >= session.steps.length - 1) store.del("session");
  session = null;
  $("#pray").hidden = true;
  $("#home").hidden = false;
  document.body.style.overflow = "";
  try { wakeLock && wakeLock.release(); } catch {}
  wakeLock = null;
  renderHome();
}

window.addEventListener("popstate", () => { if (!$("#sheet").hidden) closeSheet(); if (!$("#pray").hidden) goHome(); });

document.addEventListener("click", (e) => {
  const j = e.target.closest("[data-jump]");
  if (j) {
    session.index = +j.dataset.jump; closeSheet(); renderTrack(); return;
  }
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const act = b.dataset.action;
  if (act === "begin") startRosary(true);
  else if (act === "resume") { session = store.get("session"); startRosary(false); }
  else if (act === "menu") openMenu();
  else if (act === "info") openInfo();
  else if (act === "close-sheet") closeSheet();
  else if (act === "credits") openCredits();
  else if (act === "next") go(1);
  else if (act === "prev") go(-1);
  else if (act === "home") { if (history.state && history.state.pray) history.back(); else goHome(); }
  else if (act === "again") { store.del("session"); startRosary(true, false); }
});

/* ---------------- boot ---------------- */
(async function boot() {
  await loadArt();
  setupGestures();
  setupSheetDrag();
  renderHome();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
