// GeoTerraChain QFS — vérification automatique de toutes les pages.
// Charge chaque page sur un écran de téléphone (360 px), en français puis en anglais,
// avec un Pi SDK simulé et sans accès au serveur. Échoue si :
//   - une erreur JavaScript apparaît (hors appels réseau bloqués volontairement) ;
//   - la page déborde horizontalement ;
//   - une image ne se charge pas ;
//   - un lien interne mène vers une page inexistante.
// Usage : node tests/audit-pages.js [dossier]   (Playwright requis : npm install --no-save playwright)
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), http = require("http");

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const PORT = 8765;
const SKIP = new Set(["vision.html", "terms.html"]); // pages de simple redirection
const mime = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".txt": "text/plain", ".css": "text/css", ".json": "application/json" };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "content-type": mime[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(PORT);

const PI_STUB = `window.Pi = { init(){}, authenticate(){ return Promise.reject(new Error("stub")) }, createPayment(){}, openShareDialog(){}, nativeFeaturesList(){ return Promise.resolve([]) } };`;
const NETWORK_NOISE = /Failed to fetch|NetworkError|net::|ERR_|Failed to load resource/;

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html") && !SKIP.has(f)).sort();
  const problems = [];
  const links = new Set();
  for (const lang of ["fr", "en"]) {
    for (const pg of pages) {
      const ctx = await browser.newContext({ viewport: { width: 360, height: 760 } });
      await ctx.addInitScript(l => { try { localStorage.setItem("gtcLang", l); } catch (e) {} }, lang);
      const page = await ctx.newPage();
      const errs = [];
      page.on("pageerror", e => { if (!NETWORK_NOISE.test(e.message)) errs.push("JS : " + e.message.slice(0, 160)); });
      page.on("console", m => { if (m.type() === "error" && !NETWORK_NOISE.test(m.text())) errs.push("console : " + m.text().slice(0, 160)); });
      await page.route("**/*", r => {
        const u = r.request().url();
        if (u.includes("sdk.minepi.com")) return r.fulfill({ contentType: "text/javascript", body: PI_STUB });
        if (u.startsWith(`http://localhost:${PORT}`)) return r.continue();
        return r.abort();
      });
      try { await page.goto(`http://localhost:${PORT}/${pg}`, { waitUntil: "load", timeout: 30000 }); }
      catch (e) { errs.push("chargement : " + e.message.slice(0, 100)); }
      await page.waitForTimeout(1200);
      const info = await page.evaluate(() => ({
        links: [...document.querySelectorAll("a[href]")].map(a => a.getAttribute("href")),
        over: document.documentElement.scrollWidth - window.innerWidth,
        imgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && !i.src.startsWith("data:")).map(i => i.getAttribute("src"))
      })).catch(() => ({ links: [], over: 0, imgs: [] }));
      info.links.forEach(l => links.add(pg + " -> " + l));
      if (errs.length) problems.push(`[${lang}] ${pg} : ${errs.join(" | ")}`);
      if (info.over > 0) problems.push(`[${lang}] ${pg} : déborde de ${info.over} px`);
      if (info.imgs.length) problems.push(`[${lang}] ${pg} : images absentes ${info.imgs.join(", ")}`);
      console.log(`${errs.length || info.over > 0 || info.imgs.length ? "✗" : "✓"} [${lang}] ${pg}`);
      await ctx.close();
    }
  }
  for (const e of links) {
    const [from, href] = e.split(" -> ");
    if (!href || /^(#|javascript:|mailto:|pi:|tel:)/.test(href) || href.includes("${")) continue;
    let u;
    if (href.startsWith("https://hilaila.github.io")) u = href.replace("https://hilaila.github.io", "");
    else if (/^https?:/.test(href)) continue;
    else u = path.posix.join("/", path.posix.dirname(from), href);
    u = u.split("#")[0].split("?")[0];
    if (u.endsWith("/")) u += "index.html";
    if (!fs.existsSync(path.join(ROOT, u))) problems.push(`lien mort : ${from} -> ${href}`);
  }
  await browser.close(); srv.close();
  const uniq = [...new Set(problems)];
  console.log(`\n${pages.length} pages × 2 langues vérifiées · ${uniq.length} problème(s)`);
  uniq.forEach(p => console.log("  ✗ " + p));
  // Sur GitHub Actions : chaque problème devient une annotation lisible depuis la page du test.
  if (process.env.GITHUB_ACTIONS) uniq.slice(0, 40).forEach(p => console.log("::error title=Vérification des pages::" + p.replace(/\r?\n/g, " ")));
  process.exit(uniq.length ? 1 : 0);
})().catch(e => {
  console.error("ERREUR", e);
  if (process.env.GITHUB_ACTIONS) console.log("::error title=Vérification des pages::" + String(e && e.message || e).replace(/\r?\n/g, " ").slice(0, 400));
  process.exit(1);
});
