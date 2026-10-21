// GeoTerraChain QFS — test du clavier et des lecteurs d'écran (script partagé clavier.js).
// Vérifie, sur un vrai navigateur : onglets, questions de la FAQ et ajout de documents
// utilisables au clavier, états annoncés (ouvert, sélectionné), contour de focus visible,
// zoom autorisé, champs en 16 px sur téléphone, langue déclarée en anglais.
// Usage : node tests/clavier.js [dossier]   (requis : npm install --no-save playwright)
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html"; const f = path.join(ROOT, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { "content-type": { ".html": "text/html", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png" }[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res); }).listen(8770);
const PI = `window.Pi={init(){},authenticate(){return Promise.reject(new Error("stub"))},createPayment(){},nativeFeaturesList(){return Promise.resolve([])}};`;
let ok = 0, ko = 0; const check = (c, m) => { if (c) { ok++; console.log("✓ " + m); } else { ko++; console.log("✗ " + m); if (process.env.GITHUB_ACTIONS) console.log("::error title=Clavier::" + m); } };
async function open(b, pg, w = 360, lang = "fr") {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
  await ctx.addInitScript(l => { try { localStorage.setItem("gtcLang", l); } catch (e) {} }, lang);
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.route("**/*", r => { const u = r.request().url(); if (u.includes("sdk.minepi.com")) return r.fulfill({ contentType: "text/javascript", body: PI }); return u.startsWith("http://localhost:8770") ? r.continue() : r.abort(); });
  await p.goto("http://localhost:8770/" + pg); await p.waitForTimeout(900);
  return { p, ctx, errs };
}
async function tabTo(p, pred, max = 80) {
  for (let i = 0; i < max; i++) { await p.keyboard.press("Tab"); if (await p.evaluate(pred)) return true; }
  return false;
}
(async () => {
  const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  // FAQ Guide & Aide
  let { p, ctx, errs } = await open(b, "guide-aide-geoterrachain-qfs.html");
  check(await p.evaluate(() => { const q = document.querySelector(".faq-question"); return q.getAttribute("role") === "button" && q.getAttribute("tabindex") === "0" && q.getAttribute("aria-expanded") === "false"; }), "FAQ : question = bouton atteignable, état « fermé » annoncé");
  check(await tabTo(p, () => document.activeElement.classList.contains("faq-question")), "FAQ : atteinte avec la touche Tab");
  check(await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== "none" && parseFloat(getComputedStyle(document.activeElement).outlineWidth) >= 2), "Contour de focus visible (clavier)");
  await p.keyboard.press("Enter"); await p.waitForTimeout(200);
  check(await p.evaluate(() => document.activeElement.parentElement.classList.contains("open") && document.activeElement.getAttribute("aria-expanded") === "true"), "FAQ : Entrée ouvre la réponse, état « ouvert » annoncé");
  await p.keyboard.press(" "); await p.waitForTimeout(200);
  check(await p.evaluate(() => !document.activeElement.parentElement.classList.contains("open")), "FAQ : Espace referme");
  check(await p.evaluate(() => document.querySelector(".main-tab").getAttribute("aria-pressed") === "true" && document.querySelectorAll(".main-tab")[1].getAttribute("aria-pressed") === "false"), "Onglets FAQ / IA : état annoncé");
  check(errs.length === 0, "Guide & Aide : aucune erreur JavaScript");
  await ctx.close();
  // Onglets Investissement
  ({ p, ctx, errs } = await open(b, "investissement.html"));
  check(await tabTo(p, () => document.activeElement.classList.contains("tab")), "Investissement : onglet atteint au clavier");
  await p.keyboard.press("ArrowRight"); await p.waitForTimeout(250);
  check(await p.evaluate(() => document.activeElement.dataset.tab === "create" && document.activeElement.classList.contains("active") && document.activeElement.getAttribute("aria-pressed") === "true" && document.getElementById("panel-create").classList.contains("active")), "Investissement : flèche droite → onglet « Créer un projet » ouvert");
  await p.keyboard.press("Enter"); await p.waitForTimeout(150);
  check(errs.length === 0, "Investissement : aucune erreur JavaScript");
  check(await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector("input, textarea")).fontSize) >= 16), "Téléphone : champs en 16 px (pas de zoom automatique)");
  check(await p.evaluate(() => !/user-scalable=no|maximum-scale=1/.test(document.querySelector('meta[name=viewport]').content)), "Zoom autorisé");
  await ctx.close();
  // Pourquoi
  ({ p, ctx, errs } = await open(b, "pourquoi.html"));
  check(await tabTo(p, () => document.activeElement.classList.contains("audience-tab")), "Pourquoi : onglets de public atteints au clavier");
  await p.keyboard.press("ArrowRight"); await p.waitForTimeout(400);
  check(await p.evaluate(() => document.querySelector(".audience-tab.active").dataset.target === "institutions"), "Pourquoi : flèche droite change de public");
  check(errs.length === 0, "Pourquoi : aucune erreur JavaScript");
  await ctx.close();
  // Pioneer
  ({ p, ctx, errs } = await open(b, "pioneer.html"));
  check(await p.evaluate(() => [...document.querySelectorAll(".tab")].every(t => t.getAttribute("tabindex") === "0" && t.getAttribute("role") === "button")), "Mon espace : onglets utilisables au clavier");
  await ctx.close();
  // Litepaper tableau défilant
  ({ p, ctx, errs } = await open(b, "litepaper.html"));
  await p.waitForTimeout(800);
  check(await p.evaluate(() => [...document.querySelectorAll(".card > table, .tabs")].some(t => t.getAttribute("tabindex") === "0")), "Litepaper : tableau défilant atteignable au clavier");
  await ctx.close();
  ({ p, ctx, errs } = await open(b, "tokenisation.html"));
  check(await p.evaluate(() => { const l = document.querySelector("label.document-drop"); return l && l.getAttribute("tabindex") === "0" && l.getAttribute("role") === "button"; }), "Tokeniser : « Ajouter les documents » atteignable au clavier");
  await p.evaluate(() => { const l = document.querySelector("label.document-drop"); const pn = l.closest(".step-panel"); document.querySelectorAll(".step-panel").forEach(x => x.classList.remove("active")); pn.classList.add("active"); l.focus(); });
  console.log("   (focus sur l'étiquette : " + await p.evaluate(() => document.activeElement && document.activeElement.className) + ")");
  await p.waitForTimeout(700);
  const fc = p.waitForEvent("filechooser", { timeout: 3000 }).then(() => true, () => false);
  await p.waitForTimeout(300); // le temps que Playwright intercepte la fenêtre de choix
  await p.keyboard.press("Enter");
  check(await fc, "Tokeniser : Entrée ouvre le choix des fichiers");
  check(errs.length === 0, "Tokeniser : aucune erreur JavaScript");
  await ctx.close();
  // Bureau : pas de 16 px forcé, et anglais = lang en
  ({ p, ctx, errs } = await open(b, "index.html", 1280, "en"));
  check(await p.evaluate(() => document.documentElement.lang.startsWith("en")), "Anglais : la page se déclare en anglais (lecteurs d'écran)");
  await ctx.close();
  ({ p, ctx, errs } = await open(b, "tokenisation.html", 1280, "en"));
  check(await p.evaluate(() => document.documentElement.lang.startsWith("en")), "Tokeniser (anglais) : langue déclarée");
  await ctx.close();
  await b.close(); srv.close();
  console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
})();
