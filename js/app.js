import { PRAYERS, MYSTERIES, OPENING_INTENTIONS, ORDINALS } from "./prayers.js";

const $ = (s, el = document) => el.querySelector(s);
const SET_ORDER = ["joyful", "luminous", "sorrowful", "glorious"];
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

/* ---------------- building the rosary ---------------- */
function buildSteps(setKey, opening, closing) {
  const deal = makeDealer();
  const set = MYSTERIES[setKey];
  const steps = [];
  const P = (prayer, pool, extra = {}) => steps.push({ type: "prayer", prayer, art: deal(pool), ...extra });

  if (opening) {
    P("sign", "trinity", { section: "opening" });
    P("creed", "pantocrator", { section: "opening" });
    P("ourFather", "father", { section: "opening" });
    for (let i = 0; i < 3; i++) P("hailMary", "madonna", { section: "opening", bead: i + 1, beads: 3, intention: i });
    P("gloryBe", "trinity", { section: "opening" });
  }
  set.decades.forEach((m, d) => {
    // deal the ten Hail Mary images first so the announcement draws an 11th when the pool allows
    const hm = Array.from({ length: 10 }, () => deal(m.pool));
    steps.push({ type: "announce", decade: d, art: deal(m.pool) || hm[0] });
    P("ourFather", "father", { decade: d, bead: 0 });
    hm.forEach((id, i) => steps.push({ type: "prayer", prayer: "hailMary", art: id, decade: d, bead: i + 1 }));
    P("gloryBe", "trinity", { decade: d, bead: 11 });
    P("fatima", "shepherd", { decade: d, bead: 11 });
  });
  if (closing) {
    P("hailHolyQueen", "coronation", { section: "closing" });
    P("rosaryPrayer", "rosary", { section: "closing" });
    P("sign", "trinity", { section: "closing" });
  }
  steps.push({ type: "end", art: deal("rosary") || deal("madonna") });
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
  const bgc = coverFor(settings.set);
  if (bgc) $(".home-bg").style.backgroundImage = `url("${bgc.src}")`;

  document.querySelectorAll("#home [data-setting]").forEach((el) => {
    el.checked = !!settings[el.dataset.setting];
    el.onchange = () => { settings[el.dataset.setting] = el.checked; saveSettings(); };
  });
  renderSettings($("#home [data-settings]"));

  const saved = store.get("session", null);
  const r = $("#resume");
  if (saved && saved.index > 0 && saved.index < saved.steps.length - 1 && saved.steps.every((s) => !s.art || artById.has(s.art))) {
    r.hidden = false;
    $(".resume-detail", r).textContent = `${MYSTERIES[saved.set].name.en} — ${describeStep(saved.steps[saved.index], saved.set)}`;
  } else r.hidden = true;
}

function coverFor(setKey) {
  const pool = ART.pools[MYSTERIES[setKey].decades[0].pool];
  const c = ART.covers && ART.covers[setKey] ? artById.get(ART.covers[setKey]) : pool && pool[0];
  return c || null;
}

const OPTIONS = [
  { key: "kenBurns", label: "Ken Burns motion", hint: "Slow pan and zoom across each painting", type: "switch" },
  { key: "fit", label: "Painting", hint: "Whole painting, or fill the screen", type: "seg", options: [["fit", "Whole"], ["fill", "Fill"]] },
  { key: "text", label: "Prayer text", hint: "Minimal hides the words; tap the image to reveal", type: "seg", options: [["full", "Full"], ["minimal", "Minimal"]] },
  { key: "lang", label: "Language", type: "seg", options: [["en", "English"], ["la", "Latin"]] },
  { key: "auto", label: "Hands-free", hint: "Advance automatically after a pause", type: "seg", options: [[0, "Off"], [20, "20s"], [35, "35s"], [60, "60s"]] },
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
    if (session.lang !== settings.lang) { session.lang = settings.lang; renderTrack(); }
    else document.querySelectorAll(".slide").forEach((s) => applyKenBurns(s, s.classList.contains("current")));
    scheduleAuto();
  }
}

/* ---------------- prayer screen ---------------- */
function describeStep(step, setKey, lang = "en") {
  const set = MYSTERIES[setKey];
  if (step.type === "announce") return `${ORDINALS[lang][step.decade]} ${lang === "la" ? "Mysterium" : "Mystery"}: ${set.decades[step.decade].name[lang]}`;
  if (step.type === "end") return lang === "la" ? "Finis" : "The end";
  const p = PRAYERS[step.prayer][lang].title;
  if (step.decade != null) return `${set.decades[step.decade].name[lang]} · ${p}${step.prayer === "hailMary" ? ` ${step.bead}` : ""}`;
  return `${step.section === "opening" ? (lang === "la" ? "Initium" : "Opening") : lang === "la" ? "Conclusio" : "Closing"} · ${p}`;
}

function slideHTML(step) {
  const lang = session.lang;
  const set = MYSTERIES[session.set];
  if (step.type === "announce") {
    const m = set.decades[step.decade];
    const ord = lang === "la" ? `Mysterium ${ORDINALS.la[step.decade]}` : `The ${ORDINALS.en[step.decade]} ${set.name.en.replace(" Mysteries", "")} Mystery`;
    return `<div class="scrim"></div><div class="words">
      <div class="ordinal">${ord}</div>
      <div class="mname">${m.name[lang]}</div>
      <div class="verse">${m.verse}</div>
      <div class="ref">${m.ref}</div>
      <div class="fruit">Fruit · ${m.fruit}</div>${creditLine(step)}</div>`;
  }
  if (step.type === "end") {
    return `<div class="scrim" style="height:100%"></div><div class="words">
      <div class="amen">Amen.</div>
      <div class="ref">${set.name[lang]}</div>
      <div class="actions">
        <button class="primary" data-action="home">Return home</button>
        <button data-action="again">Pray again</button>
      </div></div>`;
  }
  const p = PRAYERS[step.prayer][lang];
  // the top bar already names the section, so the label carries the mystery or intention
  let label = step.decade != null ? set.decades[step.decade].name[lang] : "";
  let title = p.title;
  if (step.prayer === "hailMary" && step.bead) title += ` <span style="opacity:.6;font-weight:400">${toRoman(step.bead)}</span>`;
  let body = p.text;
  if (step.intention != null) label = OPENING_INTENTIONS[lang][step.intention];
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
    const img = new Image();
    img.alt = `${a.title}${a.artist ? ", " + a.artist : ""}`;
    img.decoding = "async";
    img.onload = () => img.classList.add("loaded");
    img.src = a.src;
    if (img.complete) img.classList.add("loaded");
    art.appendChild(img);
    el.appendChild(art);
  }
  el.insertAdjacentHTML("beforeend", slideHTML(step));
  return el;
}

function applyKenBurns(slide, active) {
  const art = $(".art", slide);
  if (!art) return;
  const on = settings.kenBurns && active;
  slide.classList.toggle("kb", on);
  if (!on) { art.style.animation = "none"; art.style.transform = ""; return; }
  art.style.animation = "";
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
  // restart the animation
  art.style.animation = "none"; void art.offsetWidth; art.style.animation = "";
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
  const set = MYSTERIES[session.set];
  const lang = session.lang;
  let line = "";
  if (step.decade != null) line = `${ORDINALS.en[step.decade]} ${set.name.en.replace(" Mysteries", "")} Mystery`;
  else if (step.section === "opening") line = "Opening Prayers";
  else if (step.section === "closing") line = "Closing Prayers";
  else line = set.name.en;
  if (lang === "la") {
    if (step.decade != null) line = `Mysterium ${ORDINALS.la[step.decade]}`;
    else line = set.name.la;
  }
  $("#whereLine").textContent = line;

  const beads = $("#beads");
  beads.innerHTML = "";
  if (step.decade != null) {
    // big bead (Our Father), ten small, then a marker for Glory Be
    const pos = step.type === "announce" ? -1 : step.bead;
    const mk = (cls) => { const b = document.createElement("span"); b.className = "bead " + cls; beads.appendChild(b); };
    mk("big" + (pos === 0 ? " now" : pos > 0 ? " done" : ""));
    for (let i = 1; i <= 10; i++) mk(i === pos ? "now" : i < pos ? "done" : "");
    mk("sep" + (pos === 11 ? " now" : ""));
  } else if (step.section === "opening" && step.beads) {
    for (let i = 1; i <= 3; i++) {
      const b = document.createElement("span");
      b.className = "bead" + (i === step.bead ? " now" : i < step.bead ? " done" : "");
      beads.appendChild(b);
    }
  }
  $("#progressFill").style.width = `${(session.index / (session.steps.length - 1)) * 100}%`;
  $("#swipeHint").hidden = !(session.index === 0 && !store.get("swiped", false));
}

let animating = false;

function go(delta) {
  if (!session || animating) return;
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
  const len = step.type === "prayer" ? PRAYERS[step.prayer].en.text.length : 200;
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
  $("#sheetBody").innerHTML = html;
  $("#sheet").hidden = false;
  clearAuto();
}
function closeSheet() {
  $("#sheet").hidden = true;
  if (!$("#pray").hidden) scheduleAuto();
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
  const set = MYSTERIES[session.set];
  const lang = session.lang;
  const jumps = [];
  const firstIdx = (pred) => session.steps.findIndex(pred);
  const op = firstIdx((s) => s.section === "opening");
  if (op >= 0) jumps.push([op, lang === "la" ? "Initium" : "Opening prayers", ""]);
  set.decades.forEach((m, d) => jumps.push([firstIdx((s) => s.type === "announce" && s.decade === d), m.name[lang], ORDINALS[lang][d]]));
  const cl = firstIdx((s) => s.section === "closing");
  if (cl >= 0) jumps.push([cl, lang === "la" ? "Conclusio" : "Closing prayers", ""]);
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
      <p>The Illuminated Rosary pairs every prayer with a work of sacred art. The ten Hail Marys of each decade are drawn fresh from a pool of paintings of that mystery each time you pray.</p>
      <p>All images are public domain or CC0, from the <a href="https://sdcason.com" target="_blank" rel="noopener">Free Catholic Gallery</a>, the <a href="https://www.clevelandart.org/open-access" target="_blank" rel="noopener">Cleveland Museum of Art</a>, <a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" target="_blank" rel="noopener">The Metropolitan Museum of Art</a> and others. Scripture is from the Douay-Rheims Bible.</p>
      <p><a href="https://github.com/shalone86/voxfidelium" target="_blank" rel="noopener">Source on GitHub</a></p>
    </div>
    ${Object.entries(bySource).map(([src, list]) => `<section><h2 class="rubric">${esc(src)} · ${list.length}</h2><ul class="credits-list">${list
      .map((a) => `<li><a href="${esc(a.link)}" target="_blank" rel="noopener">${esc(a.title)}</a> <span class="who">— ${esc([a.artist, a.date].filter(Boolean).join(", "))}</span></li>`).join("")}</ul></section>`).join("")}`);
}

/* ---------------- navigation between screens ---------------- */
function startRosary(fresh = true, push = true) {
  if (fresh) {
    session = { set: settings.set, steps: buildSteps(settings.set, settings.opening, settings.closing), index: 0, lang: settings.lang, started: Date.now() };
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
  renderHome();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
