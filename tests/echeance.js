// GeoTerraChain QFS — test du calcul des échéances foncières (echeance-fonciere.js), sans navigateur.
// Règles : décret ivoirien n°2023-238 (art. 29 et 43) et décret n°2023-378 (art. 2), en vigueur le 13 juin 2023.
// Usage : node tests/echeance.js [dossier]
const path = require("path");
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const F = require(path.join(ROOT, "echeance-fonciere.js"));
let ok = 0, ko = 0;
const check = (c, m) => { if (c) { ok++; console.log("✓ " + m); } else { ko++; console.log("✗ " + m); if (process.env.GITHUB_ACTIONS) console.log("::error title=Échéance::" + m); } };
const CI = "Côte d'Ivoire", AUJ = "2026-11-04";
const c = (statut, signature, aujourdhui = AUJ, pays = CI) => F.calcul({ pays, statut, signature, aujourdhui });

// Certificat foncier (art. 43)
let r = c("certificat_foncier", "2020-05-10");
check(r.cas === "certificat" && r.date === "2033-06-13" && /al\. 1/.test(r.base), "Certificat signé avant le 13 juin 2023 → 13 juin 2033 (art. 43 al. 1)");
r = c("certificat_foncier", "2023-06-12");
check(r.date === "2033-06-13", "Certificat signé la veille de l'entrée en vigueur → 13 juin 2033");
r = c("certificat_foncier", "2023-06-13");
check(r.date === "2033-06-13" && /al\. 2/.test(r.base), "Certificat signé le 13 juin 2023 → 10 ans après la signature (art. 43 al. 2)");
r = c("certificat_foncier", "2025-09-02");
check(r.date === "2035-09-02" && r.etat === "ok", "Certificat signé le 2 sept. 2025 → 2 sept. 2035");
r = c("certificat_foncier", "2024-02-29");
check(r.date === "2034-02-28", "Signature un 29 février → 28 février dix ans plus tard");
r = c("certificat_foncier", "2020-05-10", "2032-11-01");
check(r.etat === "proche" && r.reste.mois === 7 && r.reste.ans === 0, "Moins d'un an avant l'échéance → « proche »");
r = c("certificat_foncier", "2020-05-10", "2034-01-01");
check(r.etat === "depasse" && r.reste.total < 0, "Échéance passée → « dépassé »");
r = c("certificat_foncier", "2026-12-01");
check(r.cas === "certificat_sans_date", "Date dans le futur → ignorée, l'application demande la date");
r = c("certificat_foncier", "2023-02-30");
check(r.cas === "certificat_sans_date", "Date inexistante (30 février) → ignorée");
r = c("certificat_foncier", "1985-01-01");
check(r.cas === "certificat_sans_date", "Date antérieure à 1999 → ignorée");
r = c("certificat_foncier", "");
check(r.cas === "certificat_sans_date" && r.date === "2033-06-13", "Sans date → message d'aide avec le 13 juin 2033");

// Autres statuts
check(c("coutumier").date === "2033-06-13" && c("coutumier").cas === "coutumier", "Droits coutumiers → constatation avant le 13 juin 2033 (décret 2023-378)");
check(c("bail").date === "2028-06-13" && c("bail").cas === "concession", "Concession provisoire → immatriculation avant le 13 juin 2028 (art. 29)");
check(c("titre_foncier").cas === "titre" && c("titre_foncier").date === null, "Titre foncier → aucune échéance");
check(c("attestation") === null && c("autre") === null, "Attestation, autre → rien n'est affiché");
check(c("certificat_foncier", "2020-05-10", AUJ, "Burkina Faso") === null, "Hors Côte d'Ivoire → rien n'est affiché");

// Textes FR / EN
r = c("certificat_foncier", "2020-05-10");
let t = F.texte(r, "fr");
check(t.titre === "Immatriculation à demander avant le 13 juin 2033 (reste 6 ans et 7 mois).", "Texte FR : « " + t.titre + " »");
check(/article 43/.test(t.detail) && /AFOR/.test(t.note), "Texte FR : base légale et mention « calcul indicatif »");
t = F.texte(r, "en");
check(t.titre === "Registration to be requested before 13 June 2033 (6 years and 7 months left).", "Texte EN : « " + t.titre + " »");
t = F.texte(c("certificat_foncier", "2020-05-10", "2033-06-01"), "fr");
check(t.titre === "Immatriculation à demander avant le 13 juin 2033 (reste 12 jours).", "Texte FR, derniers jours : « " + t.titre + " »");
check(F.dateLisible("2028-06-01", "fr") === "1er juin 2028", "Date FR : « 1er juin 2028 »");

// ---------- Dans le navigateur : formulaire Tokeniser et Mon espace ----------
async function navigateur() {
  let chromium;
  try { ({ chromium } = require("playwright")); } catch (e) { console.log("(playwright absent : test navigateur ignoré)"); return; }
  const http = require("http"), fs = require("fs");
  const PORT = 8773;
  const TYPES = { ".html": "text/html", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".css": "text/css", ".json": "application/json" };
  const srv = http.createServer((req, res) => {
    let f = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
  }).listen(PORT);
  const PI = `window.Pi={init(){},authenticate(){return Promise.reject(new Error("stub"))},createPayment(){},nativeFeaturesList(){return Promise.resolve([])}};`;
  let AXE = null; try { AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"); } catch (e) {}
  const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  async function open(pg, lang) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(l => { try { localStorage.setItem("gtcLang", l); sessionStorage.setItem("gtcSplash", "1"); } catch (e) {} }, lang);
    const p = await ctx.newPage(); const errs = [];
    p.on("pageerror", e => errs.push(e.message));
    await p.route("**/*", r => { const u = r.request().url(); if (u.includes("sdk.minepi.com")) return r.fulfill({ contentType: "text/javascript", body: PI }); return u.startsWith(`http://localhost:${PORT}`) ? r.continue() : r.abort(); });
    await p.goto(`http://localhost:${PORT}/${pg}`, { waitUntil: "load" }); await p.waitForTimeout(500);
    return { p, ctx, errs };
  }
  try {
    // Formulaire : étape 3 ouverte comme après la connexion Pi
    let { p, ctx, errs } = await open("tokenisation.html", "fr");
    await p.evaluate(() => { const pn = document.querySelector("#assetForm").closest(".step-panel"); document.querySelectorAll(".step-panel").forEach(x => x.classList.remove("active")); pn.classList.add("active"); });
    const etat = () => p.evaluate(() => { const vu = s => { const el = document.querySelector(s); return !!el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().height > 0; };
      return { champ: vu("#certificateDateGroup"), actif: !document.querySelector("#certificateDate").disabled,
      boite: vu("#echeanceGroup"), texte: document.querySelector("#echeanceFonciere").innerText.replace(/\s+/g, " ").trim(),
      classe: document.querySelector("#echeanceFonciere").className }; });
    let e = await etat();
    check(!e.champ && !e.actif && !e.boite, "Formulaire : rien d'affiché avant le choix du pays et du statut");
    await p.selectOption("#country", "Côte d'Ivoire"); await p.selectOption("#ownershipStatus", "certificat_foncier");
    e = await etat();
    check(e.champ && e.actif && e.boite && /Indiquez la date de signature/.test(e.texte), "Certificat foncier en Côte d'Ivoire : champ date et aide affichés");
    await p.fill("#certificateDate", "2020-05-10"); await p.dispatchEvent("#certificateDate", "change");
    e = await etat();
    check(/Immatriculation à demander avant le 13 juin 2033/.test(e.texte) && /article 43/.test(e.texte) && /Calcul indicatif/.test(e.texte), "Date saisie → échéance du 13 juin 2033, base légale, mention indicative");
    if (AXE) {
      await p.addScriptTag({ content: AXE });
      const v = await p.evaluate(async () => (await axe.run({ include: [["#certificateDateGroup"], ["#echeanceGroup"]] }, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map(x => x.id));
      check(v.length === 0, "Accessibilité (axe-core) du champ et de l'encadré" + (v.length ? " : " + v.join(", ") : ""));
    }
    const pl = await p.evaluate(() => buildPayload().asset.certificateSignedAt);
    check(pl === "2020-05-10", "Date envoyée au serveur avec la demande");
    await p.evaluate(() => buildSummary());
    const rec = await p.evaluate(() => ({ vis: getComputedStyle(document.querySelector("#summaryEcheanceRow")).display !== "none", t: document.querySelector("#summaryEcheance").textContent }));
    check(rec.vis && rec.t === "13 juin 2033", "Récapitulatif : « Échéance d'immatriculation : 13 juin 2033 »");
    await p.selectOption("#ownershipStatus", "titre_foncier");
    e = await etat();
    const pl2 = await p.evaluate(() => buildPayload().asset.certificateSignedAt);
    check(!e.champ && !e.actif && /aucune échéance/.test(e.texte) && pl2 === null, "Titre foncier : champ date masqué, date non envoyée");
    await p.selectOption("#ownershipStatus", "coutumier");
    e = await etat();
    check(/avant le 13 juin 2033/.test(e.texte) && /sans maître/.test(e.texte), "Droits coutumiers : constatation avant le 13 juin 2033, risque « sans maître »");
    await p.selectOption("#country", "Burkina Faso");
    e = await etat();
    check(!e.boite, "Hors Côte d'Ivoire : aucun encadré");
    check(errs.length === 0, "Formulaire : aucune erreur JavaScript");
    await ctx.close();

    // Anglais
    ({ p, ctx, errs } = await open("tokenisation.html", "en"));
    await p.evaluate(() => { const pn = document.querySelector("#assetForm").closest(".step-panel"); document.querySelectorAll(".step-panel").forEach(x => x.classList.remove("active")); pn.classList.add("active"); });
    await p.selectOption("#country", "Côte d'Ivoire"); await p.selectOption("#ownershipStatus", "certificat_foncier");
    await p.fill("#certificateDate", "2020-05-10"); await p.dispatchEvent("#certificateDate", "change");
    e = await etat();
    const lab = await p.evaluate(() => document.querySelector("label[for=certificateDate]").textContent.trim());
    check(/Registration to be requested before 13 June 2033/.test(e.texte) && lab === "Land certificate signing date", "Anglais : encadré et libellé traduits");
    await p.evaluate(() => GTC_I18N.setLang("fr")); await p.waitForTimeout(100);
    e = await etat();
    check(/avant le 13 juin 2033/.test(e.texte), "Passage EN → FR : encadré traduit sans recharger");
    check(errs.length === 0, "Anglais : aucune erreur JavaScript");
    await ctx.close();

    // Mon espace : échéance sur chaque actif
    ({ p, ctx, errs } = await open("pioneer.html", "fr"));
    const html = await p.evaluate(() => renderActifs([
      { created_at: "2026-11-04", payload: { requestId: "GTC-1", tokenomics: { targetOffer: 10 }, asset: { reference: "A", country: "Côte d'Ivoire", ownershipStatus: "certificat_foncier", certificateSignedAt: "2020-05-10" } } },
      { created_at: "2026-11-04", payload: { requestId: "GTC-2", tokenomics: { targetOffer: 10 }, asset: { reference: "B", country: "Côte d'Ivoire", ownershipStatus: "certificat_foncier" } } },
      { created_at: "2026-11-04", payload: { requestId: "GTC-3", tokenomics: { targetOffer: 10 }, asset: { reference: "C", country: "Côte d'Ivoire", ownershipStatus: "titre_foncier" } } }
    ]));
    const txt = html.replace(/&#039;/g, "'");
    check(/Échéance d'immatriculation<\/span><span class="">13 juin 2033<\/span>/.test(txt) && /Temps restant<\/span><span class="">\d+ ans? et \d+ mois</.test(txt), "Mon espace : « Échéance d'immatriculation : 13 juin 2033 » et temps restant");
    check(/date du certificat non indiquée/.test(txt) && (txt.match(/Échéance d'immatriculation/g) || []).length === 2, "Mon espace : ancienne demande sans date signalée ; rien pour un titre foncier");
    check(errs.length === 0, "Mon espace : aucune erreur JavaScript");
    await ctx.close();
  } finally { await b.close(); srv.close(); }
}

navigateur().catch(e => { ko++; console.log("✗ ERREUR " + (e && e.message || e)); }).then(() => {
  console.log(`\n${ok} réussis, ${ko} échoués`);
  process.exit(ko ? 1 : 0);
});
