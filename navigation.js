/* GeoTerraChain QFS — menu commun (toutes les pages)
   Un bouton « ☰ Menu » est ajouté à côté du lien « Accueil » de l'en-tête de chaque page.
   Il ouvre la liste de toutes les pages du site, groupées (Application, Comprendre,
   Informations légales, Administration), avec la page actuelle mise en évidence.
   Français et anglais ; utilisable au clavier (Échap pour fermer, Tab reste dans le menu)
   et annoncé aux lecteurs d'écran.
   Pour ajouter une page au menu : une ligne dans PAGES ci-dessous.
   Aucune donnée n'est envoyée ni conservée par ce script. */
(function () {
  "use strict";
  if (window.__gtcMenu) return;
  window.__gtcMenu = true;

  var PAGES = [
    { g: "app", f: "index.html", fr: "Accueil", en: "Home" },
    { g: "app", f: "tokenisation.html", fr: "Tokeniser un terrain", en: "Tokenise land" },
    { g: "app", f: "investissement.html", fr: "Investir", en: "Invest" },
    { g: "app", f: "marketplace.html", fr: "Marché agro-pastoral (démonstration)", en: "Agro-pastoral market (demo)" },
    { g: "app", f: "pioneer.html", fr: "Mon espace Pioneer", en: "My Pioneer space" },
    { g: "savoir", f: "pourquoi.html", fr: "Pourquoi GeoTerraChain QFS ?", en: "Why GeoTerraChain QFS?" },
    { g: "savoir", f: "vision-geoterrachain-qfs-premium-v2.html", fr: "Vision 2026", en: "Vision 2026" },
    { g: "savoir", f: "litepaper.html", fr: "Litepaper investisseurs", en: "Investor litepaper" },
    { g: "savoir", f: "guide.html", fr: "Guide de tokenisation (7 étapes)", en: "Tokenisation guide (7 steps)" },
    { g: "savoir", f: "guide-aide-geoterrachain-qfs.html", fr: "Guide & Aide (questions, assistant)", en: "Help & FAQ (questions, assistant)" },
    { g: "savoir", f: "campagne.html", fr: "Le film", en: "The film" },
    { g: "savoir", f: "mises-a-jour.html", fr: "Mises à jour", en: "Updates" },
    { g: "savoir", f: "gtcp-verification.html", fr: "Vérifier le jeton GTCπ", en: "Verify the GTCπ token" },
    { g: "legal", f: "privacy.html", fr: "Confidentialité", en: "Privacy" },
    { g: "legal", f: "termes.html", fr: "Conditions d'utilisation", en: "Terms of use" },
    { g: "admin", f: "historique.html", fr: "Journal (administrateur)", en: "Log (administrator)" }
  ];
  var TXT = {
    fr: { menu: "Menu", fermer: "Fermer le menu", titre: "Toutes les pages",
          app: "Application", savoir: "Comprendre", legal: "Informations légales", admin: "Administration",
          ici: "page actuelle", pied: "Projet indépendant · Phase pilote" },
    en: { menu: "Menu", fermer: "Close the menu", titre: "All pages",
          app: "App", savoir: "Learn", legal: "Legal information", admin: "Administration",
          ici: "current page", pied: "Independent project · Pilot phase" }
  };
  var GROUPES = ["app", "savoir", "legal", "admin"];

  function lang() {
    var l = "";
    try { l = localStorage.getItem("gtcLang") || ""; } catch (e) {}
    if (!l) l = document.documentElement.getAttribute("data-lang") || document.documentElement.lang || "fr";
    return String(l).slice(0, 2).toLowerCase() === "en" ? "en" : "fr";
  }
  function t(k) { return TXT[lang()][k]; }
  function ici() {
    var f = location.pathname.split("/").pop() || "index.html";
    return f === "vision.html" ? "vision-geoterrachain-qfs-premium-v2.html" : f === "terms.html" ? "termes.html" : f;
  }

  var st = document.createElement("style");
  st.id = "gtc-menu-style";
  st.textContent =
    ".gtc-menu-btn{cursor:pointer;white-space:nowrap}" +
    ".gtc-menu-flottant{font:inherit;padding:10px 15px;border-radius:999px;border:1px solid rgba(232,200,114,.45);background:#14121A;color:#F3E3B5;font-size:14px}" +
    ".gtc-menu-flottant{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147481000;box-shadow:0 8px 24px rgba(0,0,0,.45)}" +
    ".gtc-nav-groupe{display:inline-flex;align-items:center;gap:8px;flex-wrap:nowrap}" +
    "#gtc-menu{position:fixed;inset:0;z-index:2147482500;display:none}" +
    "#gtc-menu.ouvert{display:block}" +
    "#gtc-menu .gm-fond{position:absolute;inset:0;background:rgba(0,0,8,.66)}" +
    "#gtc-menu .gm-panneau{position:absolute;top:0;left:0;bottom:0;width:min(340px,88vw);overflow-y:auto;overscroll-behavior:contain;" +
      "background:#0B0B14;border-right:1px solid rgba(232,200,114,.28);box-shadow:20px 0 60px rgba(0,0,0,.55);" +
      "padding:calc(14px + env(safe-area-inset-top,0px)) 14px calc(18px + env(safe-area-inset-bottom,0px));" +
      "font-family:'Space Grotesk',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#EDE6D3;text-align:left;" +
      "transform:translateX(0);transition:transform .22s ease}" +
    "#gtc-menu .gm-tete{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 6px}" +
    "#gtc-menu .gm-tete b{font-size:15px;color:#E8C872;letter-spacing:.02em}" +
    "#gtc-menu .gm-fermer{min-width:44px;min-height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#EDE6D3;font-size:18px;cursor:pointer}" +
    "#gtc-menu h2,#gtc-menu a,#gtc-menu p,#gtc-menu b,#gtc-menu button{font-family:inherit}" +
    "#gtc-menu h2{margin:16px 4px 6px;line-height:1.3;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#C9B27A}" +
    "#gtc-menu ul{list-style:none;margin:0;padding:0;display:grid;gap:2px}" +
    "#gtc-menu a{display:block;padding:11px 12px;border-radius:10px;color:#EDE6D3;text-decoration:none;font-size:15px;line-height:1.3}" +
    "#gtc-menu a:hover,#gtc-menu a:focus-visible{background:rgba(232,200,114,.12);color:#FFF6DA}" +
    "#gtc-menu a[aria-current=page]{background:#E8C872;color:#0B0B14;font-weight:700}" +
    "#gtc-menu .gm-pied{margin:18px 4px 0;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);font-size:12px;color:#A9A190}" +
    "html.gtc-menu-ouvert{overflow:hidden}" +
    "@media (prefers-reduced-motion:reduce){#gtc-menu .gm-panneau{transition:none}}" +
    "@media print{.gtc-menu-btn,#gtc-menu{display:none!important}}";
  (document.head || document.documentElement).appendChild(st);

  var boite = null, panneau = null, ouvreur = null;

  function construire() {
    if (boite) return;
    boite = document.createElement("div");
    boite.id = "gtc-menu";
    boite.setAttribute("translate", "no");
    boite.innerHTML = '<div class="gm-fond"></div><div class="gm-panneau" role="dialog" aria-modal="true" aria-labelledby="gtc-menu-titre"></div>';
    panneau = boite.querySelector(".gm-panneau");
    boite.querySelector(".gm-fond").addEventListener("click", fermer);
    boite.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Esc") { e.preventDefault(); fermer(); return; }
      if (e.key !== "Tab") return;
      var f = panneau.querySelectorAll("a[href],button");
      if (!f.length) return;
      var premier = f[0], dernier = f[f.length - 1];
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    });
    document.body.appendChild(boite);
  }

  function remplir() {
    var l = lang(), page = ici(), html = "";
    html += '<div class="gm-tete"><b id="gtc-menu-titre">' + t("titre") + '</b>' +
            '<button type="button" class="gm-fermer" aria-label="' + t("fermer") + '">✕</button></div>';
    GROUPES.forEach(function (g) {
      var liste = PAGES.filter(function (p) { return p.g === g; });
      html += '<nav aria-label="' + t(g) + '"><h2>' + t(g) + '</h2><ul>';
      liste.forEach(function (p) {
        var cur = p.f === page;
        html += '<li><a href="/' + p.f + '"' + (cur ? ' aria-current="page"' : '') + '>' + (l === "en" ? p.en : p.fr) +
                (cur ? '<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"> (' + t("ici") + ')</span>' : '') + '</a></li>';
      });
      html += '</ul></nav>';
    });
    html += '<p class="gm-pied">' + t("pied") + '</p>';
    panneau.innerHTML = html;
    panneau.querySelector(".gm-fermer").addEventListener("click", fermer);
  }

  function ouvrir(e) {
    if (e) e.preventDefault();
    construire();
    remplir();
    ouvreur = (e && e.currentTarget) || document.activeElement;
    boite.classList.add("ouvert");
    document.documentElement.classList.add("gtc-menu-ouvert");
    // Le reste de la page devient inactif tant que le menu est ouvert (clavier, lecteurs d'écran).
    [].forEach.call(document.body.children, function (c) {
      if (c !== boite && !c.hasAttribute("inert")) { c.setAttribute("inert", ""); c.__gtcInert = true; }
    });
    boutons().forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    var cible = panneau.querySelector("a[aria-current=page]") || panneau.querySelector(".gm-fermer");
    if (cible) cible.focus();
  }
  function fermer() {
    if (!boite || !boite.classList.contains("ouvert")) return;
    boite.classList.remove("ouvert");
    document.documentElement.classList.remove("gtc-menu-ouvert");
    [].forEach.call(document.body.children, function (c) {
      if (c.__gtcInert) { c.removeAttribute("inert"); c.__gtcInert = false; }
    });
    boutons().forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    if (ouvreur && ouvreur.focus) ouvreur.focus();
  }
  function etiquette(b) { b.innerHTML = '<span aria-hidden="true">☰</span> ' + t("menu"); }
  function boutons() { return [].slice.call(document.querySelectorAll(".gtc-menu-btn")); }

  // Lien de l'en-tête à côté duquel placer le bouton : désigné par la page
  // (data-gtc-menu-before / data-gtc-menu-after), sinon le lien « ← Accueil ».
  var VERS_ACCUEIL = /^(\.?\/)?(index\.html)?([?#].*)?$/;
  function lienAccueil() {
    var exprès = document.querySelector("[data-gtc-menu-after],[data-gtc-menu-before]");
    if (exprès) return exprès;
    var liens = [].slice.call(document.querySelectorAll("a[href]")).filter(function (a) {
      var h = a.getAttribute("href");
      if (!VERS_ACCUEIL.test(h) || h.charAt(0) === "#") return false;
      if (a.querySelector("img,picture")) return false;
      var r = a.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < 700 && (a.textContent || "").trim().length > 0;
    });
    var retour = liens.filter(function (a) { return /←/.test(a.textContent); })[0];
    return retour || liens.filter(function (a) { return /accueil|home|app/i.test(a.textContent); })[0] || null;
  }

  function placer() {
    if (document.querySelector(".gtc-menu-btn")) return;
    var ref = lienAccueil(), b;
    if (ref) {
      b = ref.cloneNode(false);
      [].slice.call(b.attributes).forEach(function (at) {
        if (/^(href|id|data-|aria-|target|rel|onclick|title)/.test(at.name)) b.removeAttribute(at.name);
      });
      b.classList.remove("on", "active", "current", "is-active");
      b.setAttribute("href", "#menu");
      b.setAttribute("role", "button");
      b.classList.add("gtc-menu-btn");
      var parent = ref.parentNode, cs = window.getComputedStyle(parent);
      if (ref.hasAttribute("data-gtc-menu-before")) {
        parent.insertBefore(b, ref);
      } else if (/flex|grid/.test(cs.display) && /space-(between|around|evenly)/.test(cs.justifyContent) && parent.children.length <= 3) {
        var groupe = document.createElement("span");
        groupe.className = "gtc-nav-groupe";
        parent.insertBefore(groupe, ref);
        groupe.appendChild(ref);
        groupe.appendChild(b);
      } else {
        parent.insertBefore(b, ref.nextSibling);
      }
    } else {
      b = document.createElement("button");
      b.type = "button";
      b.className = "gtc-menu-btn gtc-menu-flottant";
    }
    etiquette(b);
    b.setAttribute("aria-haspopup", "dialog");
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-controls", "gtc-menu");
    b.addEventListener("click", ouvrir);
    b.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Spacebar") ouvrir(e); });
  }

  function demarrer() {
    placer();
    if (/[?&]menu-ouvert=1(&|$)/.test(location.search)) ouvrir(); // aperçu et tests
  }
  window.addEventListener("gtc:lang", function () {
    boutons().forEach(etiquette);
    if (boite && boite.classList.contains("ouvert")) remplir();
  });
  window.GTCMenu = { ouvrir: function () { ouvrir(); }, fermer: fermer, pages: PAGES.map(function (p) { return p.f; }) };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
