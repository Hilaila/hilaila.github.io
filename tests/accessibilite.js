// GeoTerraChain QFS — contrôle d'accessibilité de toutes les pages (normes WCAG 2.2, niveaux A et AA).
// Outil : axe-core, la référence du domaine, exécuté dans Chromium via Playwright.
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
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
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
        const ctx = await browser.newContext({ viewport: { width: view.width, height: view.height }, reducedMotion: "reduce" });
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
        await page.addScriptTag({ content: AXE });
        const out = await page.evaluate(async tags => {
          const r = await window.axe.run(document, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations"] });
          return r.violations.map(v => ({
            id: v.id, impact: v.impact, help: v.help, url: v.helpUrl,
            nodes: v.nodes.map(n => ({ target: n.target.join(" "), html: n.html.slice(0, 140), summary: (n.failureSummary || "").replace(/\s+/g, " ").slice(0, 220) }))
          }));
        }, TAGS).catch(e => [{ id: "axe-erreur", impact: "serious", help: String(e.message || e).slice(0, 200), url: "", nodes: [] }]);
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
  // (GitHub en limite le nombre par étape : 10 par niveau).
  if (process.env.GITHUB_ACTIONS) {
    const enc = s => s.replace(/%/g, "%25").replace(/\r/g, "").replace(/\n/g, "%0A");
    if (!report.length) console.log(`::notice title=Accessibilité::Aucun problème : ${checks} contrôles WCAG 2.2 A/AA réussis.`);
    else {
      console.log(`::error title=Accessibilité::${enc(list.map(([id, r]) => `${id} [${r.impact}] : ${r.nodes.size} élément(s), ${r.pages.size} page(s)`).join("\n"))}`);
      const full = report.join("\n\n");
      const parts = [];
      for (let i = 0; i < full.length && parts.length < 9; i += 50000) parts.push(full.slice(i, i + 50000));
      parts.forEach((p, i) => console.log(`::notice title=Rapport accessibilité ${i + 1}/${parts.length}::${enc(p)}`));
    }
  }
  process.exit(list.length ? 1 : 0);
})().catch(e => {
  console.error("ERREUR", e);
  if (process.env.GITHUB_ACTIONS) console.log("::error title=Accessibilité::" + String(e && e.message || e).replace(/\r?\n/g, " ").slice(0, 400));
  process.exit(1);
});
