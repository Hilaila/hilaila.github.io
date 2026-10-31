// GeoTerraChain QFS — test de la sphère de connexion Pi (connexion-pi.js) sur chaque page.
// Pi est simulé : connexion acceptée, refusée, ou absente (navigateur ordinaire).
// Vérifie : ouverture au toucher du bouton, étapes affichées, « Bienvenue, @nom »,
// fermeture automatique, état de la page après connexion, « Réessayer » en cas d'échec,
// touche Échap et retour du focus sur le bouton ; paiement resté en attente chez Pi traité
// à la connexion (annulé s'il n'a jamais été signé, finalisé sinon).
// Usage : node tests/connexion.js [dossier]   (requis : npm install --no-save playwright)
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), http = require("http");

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const PORT = 8774;
const mime = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp", ".txt": "text/plain", ".svg": "image/svg+xml" };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": mime[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
}).listen(PORT);

const STUB = {
  ok: `window.Pi = { init(){}, authenticate(){ return new Promise(r => setTimeout(() => r({ accessToken: "jeton-essai", user: { username: "Testeur", uid: "u-essai" } }), 900)); }, createPayment(){}, nativeFeaturesList(){ return Promise.resolve([]); } };`,
  refus: `window.Pi = { init(){}, authenticate(){ return new Promise((_, j) => setTimeout(() => j(new Error("Refusé par le Pioneer")), 600)); }, createPayment(){}, nativeFeaturesList(){ return Promise.resolve([]); } };`
};
const PAGES = [
  { pg: "index.html", btn: "#piBtn", apres: () => document.getElementById("piBtn").textContent.includes("@Testeur") },
  { pg: "tokenisation.html", btn: "#piLoginBtn", apres: () => document.getElementById("piLoginBtn").textContent.includes("@Testeur") },
  { pg: "investissement.html", btn: "#piLoginBtn", apres: () => document.getElementById("piStatusBadge").textContent.includes("@Testeur") },
  { pg: "pioneer.html", btn: "#piLoginBtn", apres: () => true },
  { pg: "historique.html", btn: "#loginBtn", apres: () => document.getElementById("login").classList.contains("hide") }
];

let ok = 0, ko = 0;
const check = (c, m) => { if (c) { ok++; console.log("✓ " + m); } else { ko++; console.log("✗ " + m); if (process.env.GITHUB_ACTIONS) console.log("::error title=Connexion Pi::" + m); } };

async function ouvrir(browser, pg, mode, shots) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: shots ? 2 : 1, userAgent: "Mozilla/5.0 (Linux; Android 14) PiBrowser/2.0 Mobile" });
  await ctx.addInitScript(() => { try { localStorage.setItem("gtcLang", "fr"); sessionStorage.setItem("gtcSplash", "1"); } catch (e) {} });
  const page = await ctx.newPage(); const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  page.on("dialog", d => d.dismiss().catch(() => {}));
  await page.route("**/*", r => {
    const u = r.request().url();
    if (u.includes("sdk.minepi.com")) return mode === "absent" ? r.abort() : r.fulfill({ contentType: "text/javascript", body: STUB[mode] });
    if (/\/api\//.test(u) && !u.startsWith(`http://localhost:${PORT}`)) return r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "{}" });
    if (u.startsWith(`http://localhost:${PORT}`)) return r.continue();
    return r.abort();
  });
  await page.goto(`http://localhost:${PORT}/${pg}`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  return { ctx, page, errs };
}
const etat = page => page.evaluate(() => { const r = document.getElementById("gtc-cx"); return r && r.classList.contains("on") ? r.getAttribute("data-etat") : "fermé"; });
const titre = page => page.evaluate(() => (document.getElementById("gtc-cx-h") || {}).textContent || "");
async function attendre(page, cible, max = 8000) {
  const t0 = Date.now(); let e;
  while (Date.now() - t0 < max) { e = await etat(page); if (cible.includes(e)) return e; await page.waitForTimeout(100); }
  return e;
}

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const SHOTS = process.env.CAPTURES || "";
  for (const P of PAGES) {
    // 1. Connexion acceptée
    let { ctx, page, errs } = await ouvrir(browser, P.pg, "ok", SHOTS && P.pg === "index.html");
    await page.click(P.btn);
    check(await attendre(page, ["idle"], 3000) === "idle", `${P.pg} : le bouton ouvre la sphère de connexion`);
    check(await page.evaluate(() => document.activeElement && document.activeElement.id === "gtc-cx-sphere"), `${P.pg} : la sphère reçoit le focus (clavier, lecteur d'écran)`);
    if (SHOTS && P.pg === "index.html") await page.screenshot({ path: path.join(SHOTS, "1-repos.png") });
    await page.click("#gtc-cx-sphere");
    check(["pi", "verif", "almost", "ok"].includes(await attendre(page, ["pi", "verif", "almost", "ok"], 3000)), `${P.pg} : « Connexion à Pi Network… » après le toucher`);
    if (SHOTS && P.pg === "index.html") { await page.waitForTimeout(350); await page.screenshot({ path: path.join(SHOTS, "2-connexion.png") }); }
    const fin = await attendre(page, ["ok", "fail"], 8000);
    if (P.pg === "historique.html" || P.pg === "pioneer.html") check(fin === "ok", `${P.pg} : connexion réussie`);
    else check(fin === "ok" && (await titre(page)).includes("@Testeur"), `${P.pg} : « Bienvenue, @Testeur »`);
    if (SHOTS && P.pg === "index.html") await page.screenshot({ path: path.join(SHOTS, "3-bienvenue.png") });
    check(await attendre(page, ["fermé"], 4000) === "fermé", `${P.pg} : la sphère se ferme seule après la connexion`);
    check(await page.evaluate(P.apres), `${P.pg} : la page est bien connectée (même fonction qu'avant)`);
    check(errs.length === 0, `${P.pg} : aucune erreur JavaScript` + (errs.length ? " — " + errs[0] : ""));
    await ctx.close();
    // 2. Connexion refusée, puis Réessayer, puis Échap
    ({ ctx, page, errs } = await ouvrir(browser, P.pg, "refus", SHOTS && P.pg === "index.html"));
    await page.click(P.btn); await attendre(page, ["idle"], 3000);
    await page.click("#gtc-cx-sphere");
    check(await attendre(page, ["fail"], 6000) === "fail", `${P.pg} : refus → « Connexion impossible »`);
    check(await page.evaluate(() => getComputedStyle(document.getElementById("gtc-cx-retry")).display !== "none"), `${P.pg} : bouton « Réessayer » affiché`);
    if (SHOTS && P.pg === "index.html") await page.screenshot({ path: path.join(SHOTS, "4-echec.png") });
    await page.click("#gtc-cx-retry");
    check(["pi", "fail"].includes(await attendre(page, ["pi"], 2000)), `${P.pg} : « Réessayer » relance la connexion`);
    await attendre(page, ["fail"], 6000);
    await page.keyboard.press("Escape");
    check(await attendre(page, ["fermé"], 1500) === "fermé", `${P.pg} : Échap ferme la sphère`);
    check(await page.evaluate(sel => document.activeElement === document.querySelector(sel), P.btn), `${P.pg} : le focus revient sur le bouton de connexion`);
    check(errs.length === 0, `${P.pg} : aucune erreur JavaScript (refus)` + (errs.length ? " — " + errs[0] : ""));
    await ctx.close();
  }
  // 3. Accessibilité de la fenêtre elle-même (axe-core, si installé) : au repos et en échec.
  let AXE = null; try { AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"); } catch (e) {}
  if (AXE) {
    const { ctx: c2, page: p2 } = await ouvrir(browser, "index.html", "refus");
    await p2.click("#piBtn"); await attendre(p2, ["idle"], 3000);
    const axe = async () => { await p2.addScriptTag({ content: AXE }); return p2.evaluate(async () => (await window.axe.run("#gtc-cx", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map(v => v.id + " (" + v.nodes.length + ")")); };
    let v = await axe();
    check(!v.length, "Fenêtre de connexion au repos : normes WCAG 2.2 A/AA" + (v.length ? " — " + v.join(", ") : ""));
    await p2.click("#gtc-cx-sphere"); await attendre(p2, ["fail"], 6000);
    v = await axe();
    check(!v.length, "Fenêtre de connexion en échec : normes WCAG 2.2 A/AA" + (v.length ? " — " + v.join(", ") : ""));
    await c2.close();
  } else console.log("(axe-core absent : contrôle WCAG de la fenêtre non lancé)");
  // 4. Hors du Pi Browser (pas de Pi) : message clair
  const { ctx, page } = await ouvrir(browser, "index.html", "absent");
  await page.click("#piBtn"); await attendre(page, ["idle"], 3000);
  await page.click("#gtc-cx-sphere");
  check(await attendre(page, ["fail"], 4000) === "fail" && (await page.evaluate(() => document.getElementById("gtc-cx-p").textContent)).includes("Pi Browser"), "Sans Pi : « ouvrez GeoTerraChain QFS dans le Pi Browser »");
  await ctx.close();
  // 5. Paiement resté en attente chez Pi, signalé à la connexion (Investissement, Tokeniser).
  async function enAttente(pg, btn, payment, journalData) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: "Mozilla/5.0 (Linux; Android 14) PiBrowser/2.0 Mobile" });
    await ctx.addInitScript(() => { try { localStorage.setItem("gtcLang", "fr"); } catch (e) {} });
    const page = await ctx.newPage(); const appels = []; const errs = [];
    page.on("pageerror", e => errs.push(e.message)); page.on("dialog", d => d.dismiss().catch(() => {}));
    const stub = `window.Pi = { init(){}, authenticate(s, onInc){ return new Promise(r => setTimeout(() => { ${payment ? `onInc(${JSON.stringify(payment)});` : ""} r({ accessToken: "jeton", user: { username: "Testeur", uid: "u" } }); }, 400)); }, createPayment(){ window.__cpAppele = true; } };`;
    await page.route("**/*", r => {
      const u = r.request().url();
      if (u.includes("sdk.minepi.com")) return r.fulfill({ contentType: "text/javascript", body: stub });
      if (/\/api\//.test(u) && !u.startsWith(`http://localhost:${PORT}`)) {
        const chemin = u.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
        let corps = {}; try { corps = JSON.parse(r.request().postData() || "{}"); } catch (e) {}
        appels.push(chemin + (corps.paymentId ? ":" + corps.paymentId : "") + (corps.piPaymentId ? ":" + corps.piPaymentId : ""));
        const body = chemin === "/api/pi-auth" && corps.action === "journal" ? JSON.stringify({ ok: true, events: [], admins: ["Hilaila"], ...(journalData || {}) }) : '{"ok":true,"projects":[]}';
        return r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body });
      }
      if (u.startsWith(`http://localhost:${PORT}`)) return r.continue();
      return r.abort();
    });
    await page.goto(`http://localhost:${PORT}/${pg}`, { waitUntil: "load" }); await page.waitForTimeout(700);
    await page.click(btn); await attendre(page, ["idle"], 3000); await page.click("#gtc-cx-sphere");
    await attendre(page, ["fermé"], 8000); await page.waitForTimeout(1200);
    const r = { appels, errs, page, ctx };
    return r;
  }
  let r = await enAttente("investissement.html", "#piLoginBtn", { identifier: "pa-1", transaction: null, metadata: { projetId: "p", unites: 1 } });
  check(r.appels.includes("/api/payment-cancel:pa-1"), "Investissement : paiement jamais signé → annulé à la connexion");
  check(r.errs.length === 0, "Investissement : aucune erreur JavaScript (paiement en attente)");
  await r.ctx.close();
  r = await enAttente("investissement.html", "#piLoginBtn", { identifier: "pa-2", transaction: { txid: "TX2" }, metadata: { projetId: "97956e1f-3dd7-482b-b060-00e164500fc9", unites: 1 } });
  check(r.appels.includes("/api/payment-complete:pa-2") && r.appels.includes("/api/investment/invest:pa-2"), "Investissement : paiement signé → finalisé et unités attribuées");
  await r.ctx.close();
  r = await enAttente("tokenisation.html", "#piLoginBtn", { identifier: "pa-3", transaction: null, metadata: { requestId: "GTC-1" } });
  check(r.appels.includes("/api/payment-cancel:pa-3"), "Tokeniser : paiement jamais signé → annulé à la connexion");
  await r.ctx.close();
  r = await enAttente("historique.html", "#loginBtn", null, { paiements: { verifies: 3, annules: 2, finalises: 1, aFinaliser: 0 } });
  check((await r.page.evaluate(() => document.getElementById("updated").textContent)).includes("2 annulé(s), 1 finalisé(s)"), "Journal : résumé des paiements relus chez Pi");
  check(await r.page.evaluate(() => document.getElementById("payCard").classList.contains("hide")), "Journal : pas de carte « non résolus » sans problème");
  await r.ctx.close();
  r = await enAttente("historique.html", "#loginBtn", null, { paiements: { verifies: 1, annules: 0, finalises: 0, aFinaliser: 0, erreurs: 2, problemes: [
    { ref: "4smoxr", depuisJours: 17, etape: "annulation", http: 400, code: "<b>refus</b>", message: "Refus", etatPi: { reseau: "Pi Testnet", approuve: true, signe: false } },
    { ref: "rjHxh1", depuisJours: 5, etape: "lecture", http: 404, code: "payment_not_found", message: null, etatPi: null }] } });
  const carte = await r.page.evaluate(() => ({ cache: document.getElementById("payCard").classList.contains("hide"), txt: document.getElementById("payList").innerText, html: document.getElementById("payList").innerHTML, maj: document.getElementById("updated").textContent }));
  check(!carte.cache && carte.txt.includes("Paiement …4smoxr · depuis 17 j") && carte.txt.includes("Pi refuse l'annulation") && carte.txt.includes("HTTP 400"), "Journal : paiement non résolu affiché avec sa raison");
  check(carte.txt.includes("Chez Pi : Pi Testnet, approuvé") && carte.txt.includes("Pi ne renvoie pas ce paiement") && carte.txt.includes("HTTP 404 · payment_not_found"), "Journal : état chez Pi et lecture impossible");
  check(!carte.html.includes("<b>refus</b>") && carte.maj.includes("2 paiement(s) non résolu(s)"), "Journal : texte de Pi échappé, total dans le résumé");
  check(r.errs.length === 0, "Journal : aucune erreur JavaScript (paiements non résolus)");
  await r.ctx.close();
  r = await enAttente("historique.html", "#loginBtn", null, { paiements: { verifies: 1, attentePioneer: 1, erreurs: 0, problemes: [], attente: [{ ref: "rjHxh1", depuisJours: 5, reseau: "Pi Network" }] } });
  const att = await r.page.evaluate(() => ({ cache: document.getElementById("payCard").classList.contains("hide"), txt: document.getElementById("payList").innerText, ko: document.querySelectorAll("#payList .ko").length, maj: document.getElementById("updated").textContent }));
  check(!att.cache && att.ko === 0 && att.txt.includes("En attente du Pioneer : jamais signé, aucun Pi prélevé") && att.txt.includes("Réseau : Mainnet (vrais Pi)"), "Journal : paiement en attente du Pioneer, sans erreur rouge");
  check(att.maj.includes("1 paiement(s) en attente du Pioneer") && !att.maj.includes("non résolu"), "Journal : résumé « en attente du Pioneer »");
  await r.ctx.close();

  // 6. Paiements en pause (adresse principale = application Mainnet) ; ?pause-paiements=1 la simule.
  r = await enAttente("investissement.html", "#piLoginBtn", null);
  check(await r.page.evaluate(() => !document.getElementById("gtc-pause") && window.GTCPaiements && GTCPaiements.pause === false), "Hors adresse principale : paiements non mis en pause");
  await r.ctx.close();
  r = await enAttente("investissement.html?pause-paiements=1", "#piLoginBtn", null);
  const pz = await r.page.evaluate(() => {
    const b = document.getElementById("gtc-pause");
    let erreur = null;
    window.Pi.createPayment({ amount: 0.001 }, { onError: e => { erreur = e.message; } });
    return { b: b && b.textContent, role: b && b.getAttribute("role"), statut: document.querySelector(".header .status").textContent, erreur, appele: !!window.__cpAppele };
  });
  check(/Paiements Pi en pause/.test(pz.b || "") && pz.role === "status", "Pause : bandeau d'information annoncé (role=status)");
  check(!/PAUSE/.test(pz.statut), "Pause : pastille de connexion Pi de l'en-tête laissée intacte");
  check(!pz.appele && /validation de l'application par Pi Network/.test(pz.erreur || ""), "Pause : aucun paiement ouvert, explication donnée (garde-fou)");
  await r.page.evaluate(() => { document.getElementById("projectsList").insertAdjacentHTML("beforeend", '<div id="investAlert-x"></div>'); });
  await r.page.evaluate(() => { state.accessToken = "jeton"; return investInProject("x"); });
  check((await r.page.evaluate(() => document.getElementById("investAlert-x").textContent)).includes("Aucun Pi n'a été prélevé"), "Pause : Investir affiche l'explication");
  check(r.appels.every(a => !/payment-approve/.test(a)) && r.errs.length === 0, "Pause : aucune demande d'approbation, aucune erreur JavaScript");
  await r.ctx.close();
  r = await enAttente("tokenisation.html?pause-paiements=1", "#piLoginBtn", null);
  const pt = await r.page.evaluate(() => { state.submissionId = "GTC-T"; renderResultBox(); const b = document.getElementById("payNowBtn"); b.click(); return { label: b.textContent.trim(), attr: b.hasAttribute("data-gtc-paiement"), msg: document.getElementById("paymentStatus").textContent, appele: !!window.__cpAppele, statut: document.querySelector(".header .status").textContent.trim() }; });
  check(pt.statut === "PILOTE · PAIEMENTS EN PAUSE", "Pause : en-tête Tokeniser « PILOTE · PAIEMENTS EN PAUSE » (au lieu de PI NETWORK · PILOTE)");
  check(pt.label === "⏸ Paiements en pause" && pt.attr, "Pause : bouton Tokeniser « Paiements en pause »");
  check(!pt.appele && pt.msg.includes("Aucun Pi n'a été prélevé"), "Pause : Tokeniser n'ouvre aucun paiement et explique");
  check(r.errs.length === 0, "Pause : Tokeniser sans erreur JavaScript");
  await r.ctx.close();

  await browser.close(); srv.close();
  console.log(`\n${ok} réussis, ${ko} échoués`);
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error("ERREUR", e); if (process.env.GITHUB_ACTIONS) console.log("::error title=Connexion Pi::" + String(e.message || e).slice(0, 300)); process.exit(1); });
