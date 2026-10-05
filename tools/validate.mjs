// Content check before deploy: `node tools/validate.mjs` (no dependencies).
// Verifies prayer texts, devotion definitions, the image catalogue and the music list
// reference things that exist. Exits non-zero on errors; warnings don't fail.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { PRAYERS, MYSTERIES, CHAPLETS, NOTES, BYZANTINE } = await import(path.join(ROOT, "js/prayers.js"));
const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
const readJSON = (f) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8")); } catch (e) { err(`${f}: ${e.message}`); return null; } };

// prayers
for (const [k, p] of Object.entries(PRAYERS)) {
  if (!p.en || !p.en.title || !p.en.text) err(`prayer ${k}: missing English title/text`);
  if (p.la && (!p.la.title || !p.la.text)) err(`prayer ${k}: incomplete Latin`);
}
for (const [k, v] of Object.entries(BYZANTINE)) if (!PRAYERS[k] || !PRAYERS[v]) err(`Byzantine mapping ${k} → ${v} points to a missing prayer`);
for (const [k, n] of Object.entries(NOTES)) if (!n.en) err(`note ${k}: missing English`);

// image catalogue
const art = readJSON("data/art.json");
const pools = art ? art.pools : {};
if (art) {
  for (const [pool, list] of Object.entries(pools)) {
    if (!Array.isArray(list) || !list.length) { err(`art pool ${pool}: empty`); continue; }
    for (const a of list) {
      if (!a.id || !a.src) { err(`art pool ${pool}: entry without id/src`); continue; }
      if (!fs.existsSync(path.join(ROOT, a.src))) err(`art ${a.id}: file ${a.src} missing`);
      if (!a.title) warn(`art ${a.id}: no title`);
      if (!a.link) warn(`art ${a.id}: no source link (rights documentation)`);
      if (a.fx != null && (a.fx < 0 || a.fx > 1 || a.fy < 0 || a.fy > 1)) err(`art ${a.id}: focal point out of range`);
    }
  }
  for (const [k, id] of Object.entries(art.covers || {})) if (!Object.values(pools).flat().some((a) => a.id === id)) err(`cover for ${k}: ${id} not in catalogue`);
}
const poolsOf = (p) => (Array.isArray(p) ? p : [p]);
const need = (p, n, where) => {
  const have = poolsOf(p).reduce((s, x) => s + (pools[x] ? pools[x].length : 0), 0);
  if (!have) err(`${where}: pool ${poolsOf(p).join("+")} missing`);
  else if (have < n) warn(`${where}: pool ${poolsOf(p).join("+")} has ${have} images for ${n} slides (some will repeat)`);
};

// devotions
for (const [k, m] of Object.entries(MYSTERIES)) {
  if (!m.name || !m.name.en) err(`mysteries ${k}: no name`);
  if (!Array.isArray(m.decades) || m.decades.length !== 5) err(`mysteries ${k}: needs 5 decades`);
  (m.decades || []).forEach((d, i) => { if (!d.name || !d.verse || !d.ref) err(`mysteries ${k} decade ${i + 1}: name/verse/ref missing`); need(d.pool, 11, `${k} decade ${i + 1}`); });
}
const perGroup = { divineMercy: 10, sevenSorrows: 8, stMichael: 4, fiveWounds: 6 };
for (const [k, c] of Object.entries(CHAPLETS)) {
  if (!c.name || !c.name.en || !c.begin || !c.groups || !c.groups.length) { err(`chaplet ${k}: name/begin/groups missing`); continue; }
  c.groups.forEach((g, i) => {
    if (!g.name || !g.name.en) err(`chaplet ${k} group ${i + 1}: no name`);
    if (g.prayer && !PRAYERS[g.prayer]) err(`chaplet ${k} group ${i + 1}: prayer ${g.prayer} missing`);
    need(g.pool, perGroup[k] || 1, `${k} group ${i + 1}`);
  });
  if (c.cover && !pools[c.cover]) err(`chaplet ${k}: cover pool ${c.cover} missing`);
}
for (const p of ["trinity", "father", "madonna", "pantocrator", "shepherd", "coronation", "rosary", "mercy", "dolorosa", "michael", "angels", "gabriel", "raphael", "guardian", "pentecost"]) need(p, 1, "prayer images");

// music
const music = readJSON("data/music.json");
if (music) for (const t of music.tracks || []) {
  if (!t.id || !t.src || !t.title || !(t.moods || []).length) err(`music ${t.id || "?"}: id/src/title/moods missing`);
  else if (!fs.existsSync(path.join(ROOT, t.src))) err(`music ${t.id}: file ${t.src} missing`);
  if (!t.source) warn(`music ${t.id}: no source (rights documentation)`);
}

for (const w of warnings) console.log("warning:", w);
for (const e of errors) console.log("ERROR:", e);
console.log(`${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
