/* GeoTerraChain QFS — paiements Pi en pause sur l'adresse principale
   L'adresse https://hilaila.github.io est enregistrée chez Pi Network comme application
   Mainnet : un paiement signé y prélèverait de vrais Pi. Tant que Pi n'a pas validé
   l'application, les paiements y sont en pause :
     1. bandeau d'information en haut des pages de paiement ;
     2. boutons de paiement renommés « Paiements en pause » (ils restent utilisables au
        clavier et affichent l'explication) ;
     3. garde-fou : Pi.createPayment n'ouvre plus de paiement sur cette adresse.
   Le serveur refuse aussi tout paiement Mainnet (voir api/payment-approve.js).
   Non concernés : l'adresse de test (Testnet) et les essais locaux. Les paiements déjà
   signés restent finalisés normalement à la connexion.
   Aucune donnée n'est envoyée ni conservée par ce script. */
(function () {
  "use strict";
  if (window.GTCPaiements) return;

  var ADRESSES_EN_PAUSE = ["hilaila.github.io"];
  var forcer = /[?&]pause-paiements=1(&|$)/.test(location.search); // aperçu et tests
  var pause = forcer || ADRESSES_EN_PAUSE.indexOf(location.hostname) !== -1;

  var TXT = {
    fr: {
      bandeau: "⏸ Paiements Pi en pause sur cette adresse, jusqu'à la validation de GeoTerraChain QFS par Pi Network. Aucun Pi ne peut être prélevé. Vous pouvez consulter les projets et préparer vos demandes.",
      bouton: "⏸ Paiements en pause",
      clic: "Paiements ouverts après la validation de l'application par Pi Network. Aucun Pi n'a été prélevé.",
      statut: "PILOTE · PAIEMENTS EN PAUSE"
    },
    en: {
      bandeau: "⏸ Pi payments are paused on this address until GeoTerraChain QFS is approved by Pi Network. No Pi can be taken. You can browse projects and prepare your requests.",
      bouton: "⏸ Payments paused",
      clic: "Payments open once Pi Network approves the app. No Pi was taken.",
      statut: "PILOT · PAYMENTS PAUSED"
    }
  };
  function lang() {
    var l = "";
    try { l = localStorage.getItem("gtcLang") || ""; } catch (e) {}
    if (!l) l = document.documentElement.getAttribute("data-lang") || document.documentElement.lang || "fr";
    return String(l).slice(0, 2).toLowerCase() === "en" ? "en" : "fr";
  }
  function t(k) { return TXT[lang()][k]; }

  window.GTCPaiements = {
    pause: pause,
    bouton: function () { return t("bouton"); },
    message: function () { return t("clic"); }
  };
  if (!pause) return;

  var st = document.createElement("style");
  st.id = "gtc-pause-paiements";
  st.textContent =
    "#gtc-pause{margin:0 0 14px;padding:11px 14px;border-radius:14px;border:1px solid rgba(232,200,114,.45);" +
    "background:rgba(232,200,114,.10);color:#F3E3B5;font-size:13px;line-height:1.5;text-align:center}";
  (document.head || document.documentElement).appendChild(st);

  function bandeau() {
    if (!document.body) return;
    var b = document.getElementById("gtc-pause");
    if (!b) {
      b = document.createElement("div");
      b.id = "gtc-pause";
      b.setAttribute("role", "status");
      var hote = document.querySelector(".app") || document.body;
      var tete = hote.querySelector("header");
      if (tete && tete.parentNode === hote) hote.insertBefore(b, tete.nextSibling);
      else hote.insertBefore(b, hote.firstChild);
    }
    b.textContent = t("bandeau");
    // Pastille « PI TESTNET » de l'en-tête (pas la pastille de connexion Pi).
    var s = document.querySelector(".header .status");
    if (s && (s.__gtcPause || /TESTNET/i.test(s.textContent))) {
      s.__gtcPause = true;
      var dot = s.querySelector(".status-dot");
      s.textContent = " " + t("statut");
      if (dot) s.insertBefore(dot, s.firstChild);
    }
  }

  // Garde-fou : aucun paiement ne s'ouvre, l'explication est donnée par la page (onError).
  function neutraliser() {
    var P = window.Pi;
    if (!P || P.__gtcPause) return;
    P.__gtcPause = true;
    P.createPayment = function (data, callbacks) {
      var err = new Error(t("clic"));
      err.code = "PAIEMENTS_EN_PAUSE";
      if (callbacks && typeof callbacks.onError === "function") {
        try { callbacks.onError(err); } catch (e) {}
      }
    };
  }

  neutraliser();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { neutraliser(); bandeau(); });
  else bandeau();
  window.addEventListener("load", neutraliser);
  window.addEventListener("gtc:lang", function () { bandeau(); boutons(); });
  window.addEventListener("storage", function (e) { if (e.key === "gtcLang") { bandeau(); boutons(); } });

  // Boutons de paiement déjà affichés (étiquette dans la langue choisie).
  function boutons() {
    var l = document.querySelectorAll("[data-gtc-paiement]");
    for (var i = 0; i < l.length; i++) l[i].textContent = t("bouton");
  }
})();
