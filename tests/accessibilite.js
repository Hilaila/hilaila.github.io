// GeoTerraChain QFS — contrôle d'accessibilité de toutes les pages (normes WCAG 2.2, niveaux A et AA).
// Outil : axe-core, la référence du domaine, exécuté dans Chromium via Playwright.
// En plus, le contraste de chaque texte est mesuré sur le rendu réel (fonds en dégradé compris).
// Chaque page est contrôlée en français et en anglais, sur un écran de téléphone (360 px)
// et sur un écran d'ordinateur (1280 px), avec le réglage « réduire les animations » actif
// (sinon les éléments en cours d'apparition faussent la mesure des contrastes).
// Échoue s'il reste au moins un problème. Sur GitHub Actions, le rapport complet est
// publié sous forme d'annotations lisibles depuis la page de l'exécution.
// Usage : node tests/accessibilite.js [dossier]
//         (requis : npm install --no-save playwright axe-core)
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), http = require("http");

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const PORT = 8766;
const SKIP = new Set(["vision.html", "terms.html"]); // pages de simple redirection
const EXTRA = ["historique.html?demo=1"];            // Journal avec données fictives
let AXE = null;
try { AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"); }
catch (e) { if (!process.env.SANS_AXE) throw e; console.log("axe-core absent : seul le contraste mesuré est contrôlé (SANS_AXE)."); }
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const mime = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".txt": "text/plain", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "content-type": mime[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(PORT);

const PI_STUB = `window.Pi = { init(){}, authenticate(){ return Promise.reject(new Error("stub")) }, createPayment(){}, openShareDialog(){}, nativeFeaturesList(){ return Promise.resolve([]) } };`;

// Contraste mesuré sur le rendu réel (complète axe-core, qui laisse « à vérifier » les textes
// posés sur un dégradé ou une transparence) : le texte est masqué, la page photographiée, puis
// la couleur de fond réellement affichée sous chaque texte est lue (médiane des pixels).
function collect() {
  const parse = s => { const m = s && s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const els = []; const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode; if (!t.nodeValue.trim()) continue;
    const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    if (el.closest("script,style,noscript,[aria-hidden=true],svg")) continue;
    if (el.closest("button:disabled,[disabled],[aria-disabled=true]")) continue;
    { const d = el.closest("details"); if (d && !d.open && !el.closest("summary")) continue; }
    if (el.closest("#splash")) continue;
    // rectangle du texte lui-même (pas de toute la boîte)
    const range = document.createRange(); range.selectNodeContents(t);
    const rr = [...range.getClientRects()].filter(r => r.width > 1 && r.height > 1);
    if (!rr.length) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden") continue;
    let op = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
    if (op < 0.1) continue;
    const gt = (cs.webkitBackgroundClip === "text" || cs.backgroundClip === "text") && cs.backgroundImage !== "none";
    const fg = parse(cs.color);
    const stops = gt ? (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(parse).filter(c => c && c.a > 0) : [];
    if (!gt && (!fg || fg.a === 0)) continue;
    if (gt) el.setAttribute("data-a11y-gt", "1");
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
    const cls = (typeof el.className === "string" && el.className.trim()) ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    els.push({
      sel: el.tagName.toLowerCase() + cls, txt: t.nodeValue.trim().slice(0, 40),
      rects: rr.slice(0, 4).map(r => ({ x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height })),
      fg, op, stops, size, bold
    });
  }
  window.__a11yEls = els;
  const st = document.createElement("style"); st.id = "a11y-hide";
  st.textContent = "*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}[data-a11y-gt]{background-image:none!important}::placeholder{color:transparent!important}";
  document.head.appendChild(st);
  return els.length;
}

async function measure(b64) {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
  const cx = cv.getContext("2d", { willReadFrequently: true }); cx.drawImage(img, 0, 0);
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a) });
  const hex = c => "#" + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
  const out = [];
  for (const e of window.__a11yEls) {
    const px = [];
    for (const r of e.rects) {
      const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y));
      const w = Math.min(cv.width - x0, Math.ceil(r.w)), h = Math.min(cv.height - y0, Math.ceil(r.h));
      if (w <= 0 || h <= 0) continue;
      const d = cx.getImageData(x0, y0, w, h).data;
      const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 300)));
      for (let yy = 0; yy < h; yy += step) for (let xx = 0; xx < w; xx += step) { const i = (yy * w + xx) * 4; px.push({ r: d[i], g: d[i + 1], b: d[i + 2] }); }
    }
    if (!px.length) continue;
    px.sort((a, b) => lum(a) - lum(b));
    const med = px[Math.floor(px.length / 2)];
    // fond le plus défavorable plausible : 20e et 80e centiles
    const cands = [px[Math.floor(px.length * 0.2)], med, px[Math.floor(px.length * 0.8)]];
    const fgs = e.stops.length ? e.stops.map(s => ({ ...s, a: s.a * e.op })) : [{ ...e.fg, a: e.fg.a * e.op }];
    let worst = null;
    for (const bg of cands) for (const f of fgs) { const fc = over(f, bg); const r = ratio(fc, bg); if (!worst || r < worst.r) worst = { r, fc, bg }; }
    const large = e.size >= 24 || (e.bold && e.size >= 18.66);
    const need = large ? 3 : 4.5;
    if (worst.r < need) out.push({ sel: e.sel, txt: e.txt, r: +worst.r.toFixed(2), need, fg: hex(worst.fc), bg: hex(worst.bg), size: e.size + "px" + (e.bold ? " gras" : "") });
  }
  return out;
}


const VIEWS = [{ name: "téléphone", width: 360, height: 760 }, { name: "ordinateur", width: 1280, height: 800 }];

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const only = process.env.PAGES ? process.env.PAGES.split(",") : null;
  const pages = (only || fs.readdirSync(ROOT).filter(f => f.endsWith(".html") && !SKIP.has(f)).sort().concat(EXTRA));
  const rules = new Map(); // id -> { impact, help, url, nodes: [], pages: Set }
  let checks = 0;
  for (const lang of ["fr", "en"]) {
    for (const view of VIEWS) {
      for (const pg of pages) {
        const ctx = await browser.newContext({ viewport: { width: view.width, height: view.height }, reducedMotion: "reduce", deviceScaleFactor: 1 });
        await ctx.addInitScript(l => { try { localStorage.setItem("gtcLang", l); } catch (e) {} }, lang);
        const page = await ctx.newPage();
        await page.route("**/*", r => {
          const u = r.request().url();
          if (u.includes("sdk.minepi.com")) return r.fulfill({ contentType: "text/javascript", body: PI_STUB });
          if (u.startsWith(`http://localhost:${PORT}`)) return r.continue();
          return r.abort();
        });
        try { await page.goto(`http://localhost:${PORT}/${pg}`, { waitUntil: "load", timeout: 30000 }); } catch (e) {}
        await page.waitForTimeout(1500);
        if (AXE) await page.addScriptTag({ content: AXE });
        const out = !AXE ? [] : await page.evaluate(async tags => {
          const r = await window.axe.run(document, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations"] });
          return r.violations.map(v => ({
            id: v.id, impact: v.impact, help: v.help, url: v.helpUrl,
            nodes: v.nodes.map(n => ({ target: n.target.join(" "), html: n.html.slice(0, 140), summary: (n.failureSummary || "").replace(/\s+/g, " ").slice(0, 220) }))
          }));
        }, TAGS).catch(e => [{ id: "axe-erreur", impact: "serious", help: String(e.message || e).slice(0, 200), url: "", nodes: [] }]);
        // Contraste mesuré (en dernier : le texte est masqué pour la photo).
        try {
          await page.evaluate(collect);
          await page.waitForTimeout(150);
          const shot = await page.screenshot({ fullPage: true, animations: "disabled" });
          const low = await page.evaluate(measure, shot.toString("base64"));
          if (low.length) out.push({ id: "contraste-mesure", impact: "serious", help: "Contraste du texte mesuré sur le rendu (WCAG 1.4.3, 4,5:1 ou 3:1 pour les grands textes)", url: "",
            nodes: low.map(x => ({ target: x.sel, html: "« " + x.txt + " »", summary: `${x.r}:1 au lieu de ${x.need}:1 — ${x.fg} sur ${x.bg}, ${x.size}` })) });
        } catch (e) { /* page sans texte mesurable */ }
        checks++;
        const n = out.reduce((s, v) => s + v.nodes.length, 0);
        console.log(`${n ? "✗" : "✓"} [${lang} · ${view.name}] ${pg}${n ? " — " + n + " élément(s)" : ""}`);
        for (const v of out) {
          if (!rules.has(v.id)) rules.set(v.id, { impact: v.impact, help: v.help, url: v.url, nodes: new Map(), pages: new Set() });
          const r = rules.get(v.id);
          r.pages.add(pg);
          for (const nd of v.nodes) {
            const key = pg + " | " + nd.target;
            if (!r.nodes.has(key)) r.nodes.set(key, { page: pg, where: `${lang}·${view.name}`, ...nd });
          }
        }
        await ctx.close();
      }
    }
  }
  await browser.close(); srv.close();

  const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const list = [...rules.entries()].sort((a, b) => (order[a[1].impact] ?? 9) - (order[b[1].impact] ?? 9));
  const total = list.reduce((s, [, r]) => s + r.nodes.size, 0);
  console.log(`\n${pages.length} pages × 2 langues × 2 écrans = ${checks} contrôles · ${list.length} règle(s) non respectée(s) · ${total} élément(s)`);
  const report = [];
  for (const [id, r] of list) {
    const lines = [`${id} [${r.impact}] ${r.help} — ${r.nodes.size} élément(s) sur ${r.pages.size} page(s) : ${[...r.pages].join(", ")}`];
    for (const nd of [...r.nodes.values()].slice(0, 60)) lines.push(`  · ${nd.page} (${nd.where}) ${nd.target} :: ${nd.html} :: ${nd.summary}`);
    if (r.nodes.size > 60) lines.push(`  … ${r.nodes.size - 60} autre(s)`);
    report.push(lines.join("\n"));
    console.log("\n" + lines.join("\n"));
  }
  if (process.env.RAPPORT) fs.writeFileSync(process.env.RAPPORT, report.join("\n\n"));
  // GitHub Actions : un résumé (erreur), puis le rapport complet découpé en annotations
  // (GitHub limite : 10 annotations par niveau et environ 4 000 caractères chacune).
  if (process.env.GITHUB_ACTIONS) {
    const enc = s => s.replace(/%/g, "%25").replace(/\r/g, "").replace(/\n/g, "%0A");
    if (!report.length) console.log(`::notice title=Accessibilité::Aucun problème : ${checks} contrôles WCAG 2.2 A/AA réussis.`);
    else {
      console.log(`::error title=Accessibilité::${enc(list.map(([id, r]) => `${id} [${r.impact}] : ${r.nodes.size} élément(s), ${r.pages.size} page(s)`).join("\n"))}`);
      const full = report.join("\n\n");
      const parts = [];
      for (let i = 0; i < full.length && parts.length < 9; i += 3800) parts.push(full.slice(i, i + 3800));
      parts.forEach((p, i) => console.log(`::notice title=Rapport accessibilité ${i + 1}/${parts.length}::${enc(p)}`));
    }
  }
  process.exit(list.length ? 1 : 0);
})().catch(e => {
  console.error("ERREUR", e);
  if (process.env.GITHUB_ACTIONS) console.log("::error title=Accessibilité::" + String(e && e.message || e).replace(/\r?\n/g, " ").slice(0, 400));
  process.exit(1);
});
