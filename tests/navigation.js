// GeoTerraChain QFS — test du menu commun (script partagé navigation.js) et des liens.
// Vérifie, sur un vrai navigateur : bouton « Menu » présent dans l'en-tête de chaque page,
// menu complet (toutes les pages du site), page actuelle signalée, clavier (Échap, Tab qui
// reste dans le menu, retour au bouton), anglais ; puis qu'aucun lien interne n'est cassé.
// Usage : node tests/navigation.js [dossier]   (requis : npm install --no-save playwright)
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const PORT = 8771;
// Pages hors menu : erreur 404, redirections, ancienne page gardée pour Pi Sign-In.
const HORS_MENU = new Set(["404.html", "terms.html", "vision.html", "tokenisation-testnet.html"]);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".css": "text/css", ".json": "application/json" };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
}).listen(PORT);
const PI = `window.Pi={init(){},authenticate(){return Promise.reject(new Error("stub"))},createPayment(){},nativeFeaturesList(){return Promise.resolve([])}};`;
let ok = 0, ko = 0;
const check = (c, m) => { if (c) { ok++; console.log("✓ " + m); } else { ko++; console.log("✗ " + m); if (process.env.GITHUB_ACTIONS) console.log("::error title=Menu::" + m); } };

async function open(b, pg, lang = "fr", w = 390) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 } });
  await ctx.addInitScript(l => { try { localStorage.setItem("gtcLang", l); sessionStorage.setItem("gtcSplash", "1"); } catch (e) {} }, lang);
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.route("**/*", r => { const u = r.request().url(); if (u.includes("sdk.minepi.com")) return r.fulfill({ contentType: "text/javascript", body: PI }); return u.startsWith(`http://localhost:${PORT}`) ? r.continue() : r.abort(); });
  await p.goto(`http://localhost:${PORT}/${pg}`, { waitUntil: "load" }); await p.waitForTimeout(700);
  return { p, ctx, errs };
}

(async () => {
  const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html")).sort();
  const reelles = pages.filter(f => !HORS_MENU.has(f));

  // 1. Le menu contient toutes les pages du site (une nouvelle page doit y être ajoutée).
  let { p, ctx, errs } = await open(b, "index.html");
  const listees = await p.evaluate(() => (window.GTCMenu && GTCMenu.pages) || []);
  const manquantes = reelles.filter(f => !listees.includes(f));
  check(manquantes.length === 0, "Menu : toutes les pages y figurent" + (manquantes.length ? " (manque : " + manquantes.join(", ") + ")" : ""));
  check(listees.every(f => fs.existsSync(path.join(ROOT, f))), "Menu : chaque lien mène à une page existante");
  await ctx.close();

  // 2. Bouton et menu sur chaque page (téléphone).
  for (const pg of reelles.concat(["404.html"])) {
    ({ p, ctx, errs } = await open(b, pg));
    const btn = await p.evaluate(() => {
      const l = document.querySelectorAll(".gtc-menu-btn"); const e = l[0]; if (!e) return { n: 0 };
      const r = e.getBoundingClientRect();
      return { n: l.length, visible: r.width > 0 && r.height > 0, haut: r.top < 520, flottant: e.classList.contains("gtc-menu-flottant"), larg: r.width, haute: r.height, deborde: r.right > innerWidth + 1 };
    });
    check(btn.n === 1 && btn.visible && btn.haut && !btn.flottant && !btn.deborde && btn.haute >= 24, `${pg} : bouton « Menu » dans l'en-tête`);
    await p.click(".gtc-menu-btn"); await p.waitForTimeout(150);
    const m = await p.evaluate(pg => {
      const d = document.querySelector("#gtc-menu"), panneau = d && d.querySelector("[role=dialog]");
      const cur = d && d.querySelector("a[aria-current=page]");
      return {
        ouvert: !!d && getComputedStyle(d).display !== "none" && panneau.getAttribute("aria-modal") === "true",
        liens: d ? d.querySelectorAll("a[href]").length : 0,
        cur: cur ? cur.getAttribute("href") : null,
        focus: !!d && d.contains(document.activeElement),
        etendu: document.querySelector(".gtc-menu-btn").getAttribute("aria-expanded"),
        inerte: [...document.body.children].filter(c => c.id !== "gtc-menu" && !/^(SCRIPT|STYLE)$/.test(c.tagName)).every(c => c.hasAttribute("inert"))
      };
    }, pg);
    const attendu = pg === "404.html" ? null : "/" + pg;
    check(m.ouvert && m.liens === listees.length && m.cur === attendu && m.focus && m.etendu === "true" && m.inerte, `${pg} : menu ouvert, ${listees.length} pages, page actuelle signalée, reste de la page inactif`);
    await p.keyboard.press("Escape"); await p.waitForTimeout(100);
    const f = await p.evaluate(() => ({ ferme: getComputedStyle(document.querySelector("#gtc-menu")).display === "none", retour: document.activeElement && document.activeElement.classList.contains("gtc-menu-btn"), inerte: !!document.querySelector("body > [inert]") }));
    check(f.ferme && f.retour && !f.inerte && errs.length === 0, `${pg} : Échap referme, retour au bouton, aucune erreur JavaScript`);
    await ctx.close();
  }

  // 3. Clavier : Tab reste dans le menu ; Espace ouvre ; lien suivi.
  ({ p, ctx, errs } = await open(b, "pioneer.html"));
  await p.focus(".gtc-menu-btn"); await p.keyboard.press(" "); await p.waitForTimeout(150);
  const n = await p.evaluate(() => document.querySelectorAll("#gtc-menu a[href], #gtc-menu button").length);
  let dedans = true;
  for (let i = 0; i < n + 2; i++) { await p.keyboard.press("Tab"); if (!(await p.evaluate(() => document.querySelector("#gtc-menu").contains(document.activeElement)))) dedans = false; }
  await p.keyboard.press("Shift+Tab");
  check(dedans && await p.evaluate(() => document.querySelector("#gtc-menu").contains(document.activeElement)), "Clavier : Espace ouvre, Tab et Maj+Tab restent dans le menu");
  await Promise.all([p.waitForNavigation(), p.click('#gtc-menu a[href="/guide.html"]')]);
  check(new URL(p.url()).pathname === "/guide.html", "Lien du menu suivi (Mon espace → Guide de tokenisation)");
  await ctx.close();

  // 4. Anglais.
  ({ p, ctx, errs } = await open(b, "tokenisation.html", "en"));
  await p.click(".gtc-menu-btn"); await p.waitForTimeout(150);
  const en = await p.evaluate(() => document.querySelector("#gtc-menu").innerText);
  check(/All pages/.test(en) && /Home/.test(en) && /Tokenise land/.test(en) && /Independent project · Pilot phase/.test(en), "Anglais : menu traduit");
  check(errs.length === 0, "Anglais : aucune erreur JavaScript");
  await ctx.close();

  // 5. Aucun lien interne cassé dans les pages.
  const casses = [];
  for (const f of pages) {
    const s = fs.readFileSync(path.join(ROOT, f), "utf8");
    for (const m of s.matchAll(/href\s*=\s*["']([^"'#?]+\.html)/g)) {
      const h = m[1];
      if (/^(https?:)?\/\//.test(h) || h.includes("${")) continue;
      const cible = path.join(ROOT, h.startsWith("/") ? h : path.join(path.dirname(f), h));
      if (!fs.existsSync(cible)) casses.push(f + " → " + h);
    }
  }
  check(casses.length === 0, "Liens internes : aucun lien cassé" + (casses.length ? " (" + [...new Set(casses)].join(", ") + ")" : ""));

  await b.close(); srv.close();
  console.log(`\n${ok} réussis, ${ko} échoués`);
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error("ERREUR", e); if (process.env.GITHUB_ACTIONS) console.log("::error title=Menu::" + String(e.message || e).slice(0, 300)); process.exit(1); });
