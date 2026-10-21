/* GeoTerraChain QFS — connexion réseau (toutes les pages)
   1. Bandeau « Hors ligne » quand la connexion est coupée, puis « Connexion rétablie ».
   2. Nouvel essai automatique des lectures (GET) après une coupure ou une panne passagère
      du serveur (502, 503, 504). Les envois (paiements, demandes, documents) ne sont
      jamais renvoyés automatiquement : c'est le Pioneer qui décide de réessayer.
   3. Message clair quand le serveur limite les demandes trop rapprochées (429).
   Aucune donnée n'est envoyée ni conservée par ce script. */
(function () {
  "use strict";
  if (window.__gtcReseau) return;
  window.__gtcReseau = true;

  var TXT = {
    fr: {
      off: "Connexion perdue. Vos saisies restent sur cette page ; tout reprendra dès le retour du réseau.",
      on: "Connexion rétablie.",
      limit: "Trop de demandes en peu de temps. Patientez une minute, puis réessayez.",
      close: "Fermer"
    },
    en: {
      off: "Connection lost. What you entered stays on this page; everything resumes once the network is back.",
      on: "Connection restored.",
      limit: "Too many requests in a short time. Wait a minute, then try again.",
      close: "Close"
    }
  };
  function lang() {
    var l = "";
    try { l = localStorage.getItem("gtcLang") || ""; } catch (e) {}
    if (!l) l = document.documentElement.getAttribute("data-lang") || document.documentElement.lang || "fr";
    return String(l).slice(0, 2) === "en" ? "en" : "fr";
  }
  function t(k) { return TXT[lang()][k]; }

  /* ---------- Bandeau ---------- */
  var bar = null, hideTimer = null;
  function ensureBar() {
    if (bar || !document.body) return bar;
    var st = document.createElement("style");
    st.textContent =
      "#gtc-net{position:fixed;left:0;right:0;top:0;z-index:2147483000;display:none;align-items:center;gap:10px;" +
      "padding:10px 14px;padding-top:calc(10px + env(safe-area-inset-top,0px));font:600 13.5px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;" +
      "color:#FFF4D6;background:#281604;border-bottom:1px solid rgba(232,200,114,.55);box-shadow:0 6px 18px rgba(0,0,0,.45)}" +
      "#gtc-net.on{display:flex}#gtc-net.ok{color:#D8FFE9;background:#08281A;border-bottom-color:rgba(61,220,151,.55)}" +
      "#gtc-net .d{flex:0 0 auto;width:9px;height:9px;border-radius:50%;background:#E8C872;box-shadow:0 0 8px #E8C872}" +
      "#gtc-net.ok .d{background:#3DDC97;box-shadow:0 0 8px #3DDC97}#gtc-net span{flex:1}" +
      "#gtc-net button{flex:0 0 auto;min-width:36px;min-height:36px;border:1px solid rgba(255,255,255,.25);border-radius:10px;background:transparent;color:inherit;font:inherit;cursor:pointer}";
    document.head.appendChild(st);
    bar = document.createElement("div");
    bar.id = "gtc-net";
    bar.setAttribute("role", "status");
    bar.setAttribute("aria-live", "polite");
    bar.innerHTML = '<i class="d" aria-hidden="true"></i><span></span><button type="button">✕</button>';
    bar.querySelector("button").addEventListener("click", function () { hide(); });
    document.body.appendChild(bar);
    return bar;
  }
  function show(kind, autoHideMs) {
    if (!ensureBar()) { document.addEventListener("DOMContentLoaded", function () { show(kind, autoHideMs); }, { once: true }); return; }
    clearTimeout(hideTimer);
    bar.className = "on" + (kind === "on" ? " ok" : "");
    bar.querySelector("span").textContent = t(kind);
    bar.querySelector("button").setAttribute("aria-label", t("close"));
    bar.setAttribute("data-kind", kind);
    if (autoHideMs) hideTimer = setTimeout(hide, autoHideMs);
  }
  function hide() { if (bar) { bar.className = ""; bar.removeAttribute("data-kind"); } }

  var wasOffline = false;
  window.addEventListener("offline", function () { wasOffline = true; show("off"); });
  window.addEventListener("online", function () {
    if (wasOffline) { wasOffline = false; show("on", 3500); }
  });
  if (navigator.onLine === false) { wasOffline = true; show("off"); }

  /* ---------- Nouvel essai des lectures ---------- */
  if (typeof window.fetch !== "function") return;
  var nativeFetch = window.fetch.bind(window);
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function waitOnline(maxMs) {
    if (navigator.onLine !== false) return Promise.resolve();
    return new Promise(function (resolve) {
      var done = false;
      function finish() { if (done) return; done = true; window.removeEventListener("online", finish); resolve(); }
      window.addEventListener("online", finish);
      setTimeout(finish, maxMs);
    });
  }
  function methodOf(input, init) {
    var m = (init && init.method) || (input && typeof input === "object" && input.method) || "GET";
    return String(m).toUpperCase();
  }
  function aborted(init, input) {
    var s = (init && init.signal) || (input && typeof input === "object" && input.signal);
    return Boolean(s && s.aborted);
  }

  window.fetch = function (input, init) {
    var method = methodOf(input, init);
    var reread = method === "GET" || method === "HEAD";
    var attempt = 0, MAX = 2;
    function once() {
      return nativeFetch(input, init).then(function (res) {
        if (res.status === 429) show("limit", 8000);
        if (reread && attempt < MAX && (res.status === 502 || res.status === 503 || res.status === 504)) {
          attempt++;
          return sleep(900 * attempt).then(once);
        }
        return res;
      }, function (err) {
        if ((err && err.name === "AbortError") || aborted(init, input)) throw err;
        if (navigator.onLine === false) { wasOffline = true; show("off"); }
        if (!reread || attempt >= MAX) throw err;
        attempt++;
        return (navigator.onLine === false ? waitOnline(20000) : sleep(900 * attempt)).then(function () {
          if (aborted(init, input)) throw err;
          return once();
        });
      });
    }
    return once();
  };
})();
