/* GeoTerraChain QFS — couche de traduction FR → EN.
 *
 * Principe : la page reste écrite en français et sa logique n'est pas modifiée.
 * En anglais, ce script remplace à l'affichage chaque texte français connu
 * (dictionnaire window.GTC_EN, chargé avant ce fichier) par sa traduction,
 * y compris les messages créés plus tard par la page (toasts, statuts…).
 * Le français d'origine est conservé sur chaque nœud pour revenir en FR
 * sans recharger la page. Réglage de langue partagé avec le reste du site :
 * localStorage « gtcLang ».
 */
(function () {
  "use strict";
  var D = window.GTC_EN || {};

  function norm(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); }

  var EXACT = Object.create(null);
  Object.keys(D.exact || {}).forEach(function (k) { EXACT[norm(k)] = D.exact[k]; });
  var PREFIX = (D.prefix || []).map(function (p) { return [norm(p[0]), p[1]]; })
    .sort(function (a, b) { return b[0].length - a[0].length; });
  var REGEX = D.regex || [];
  var ATTRS = ["placeholder", "title", "aria-label", "alt"];

  var LANG = (function () {
    var l = null;
    try { l = localStorage.getItem("gtcLang"); } catch (e) {}
    if (l !== "fr" && l !== "en") l = (navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
    return l;
  })();
  window.GTC_LANG = LANG;
  document.documentElement.lang = LANG;

  function tr(s) {
    var n = norm(s);
    if (!n) return null;
    if (Object.prototype.hasOwnProperty.call(EXACT, n)) return EXACT[n];
    for (var i = 0; i < PREFIX.length; i++) {
      if (n.indexOf(PREFIX[i][0]) === 0) return PREFIX[i][1] + n.slice(PREFIX[i][0].length);
    }
    for (var j = 0; j < REGEX.length; j++) {
      if (REGEX[j][0].test(n)) return n.replace(REGEX[j][0], REGEX[j][1]);
    }
    return null;
  }

  function keepSpaces(orig, t) {
    return (/^\s/.test(orig) ? " " : "") + t + (/\s$/.test(orig) ? " " : "");
  }

  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };

  function doText(node) {
    var p = node.parentNode;
    if (!p || SKIP[p.nodeName] || (p.closest && p.closest("[data-gtc-noi18n]"))) return;
    var v = node.nodeValue;
    if (LANG === "en") {
      if (node.__gtcEn != null && v === node.__gtcEn) return;      // déjà traduit
      var t = tr(v);
      if (t == null || t === norm(v)) return;
      var out = keepSpaces(v, t);
      node.__gtcFr = v; node.__gtcEn = out;
      node.nodeValue = out;
    } else if (node.__gtcFr != null && v === node.__gtcEn) {
      node.nodeValue = node.__gtcFr;
      node.__gtcEn = null;
    }
  }

  function doAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute || !el.hasAttribute(a)) continue;
      var key = "data-gtc-fr-" + a, v = el.getAttribute(a);
      if (LANG === "en") {
        if (el.getAttribute("data-gtc-en-" + a) === v) continue;
        var t = tr(v);
        if (t == null || t === norm(v)) continue;
        el.setAttribute(key, v); el.setAttribute("data-gtc-en-" + a, t); el.setAttribute(a, t);
      } else if (el.hasAttribute(key) && el.getAttribute("data-gtc-en-" + a) === v) {
        el.setAttribute(a, el.getAttribute(key)); el.removeAttribute("data-gtc-en-" + a);
      }
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) { if (SKIP[root.nodeName] && root.nodeName !== "TEXTAREA") return; doAttrs(root); }
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) doText(n); else if (!SKIP[n.nodeName] || n.nodeName === "TEXTAREA") doAttrs(n);
    }
  }

  var baseTitle = null;
  function doTitle() {
    if (baseTitle == null) baseTitle = document.title;
    if (LANG === "en") { var t = (D.title) || tr(baseTitle); if (t) document.title = t; }
    else document.title = baseTitle;
  }

  var busy = false;
  var mo = new MutationObserver(function (records) {
    if (busy) return;
    busy = true;
    try {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.type === "characterData") doText(r.target);
        else if (r.type === "attributes") doAttrs(r.target);
        else for (var j = 0; j < r.addedNodes.length; j++) walk(r.addedNodes[j]);
      }
    } finally { busy = false; }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });

  /* ---------- Bouton FR / EN ---------- */
  var CSS = ".gtc-lang{display:inline-flex;align-items:center;gap:2px;padding:3px;border:1.5px solid #E8C872;border-radius:999px;background:rgba(232,200,114,.10);box-shadow:0 0 14px rgba(232,200,114,.3);vertical-align:middle;flex-shrink:0}" +
    ".gtc-lang svg{width:16px;height:16px;margin:0 2px 0 4px;color:#E8C872}" +
    ".gtc-lang button{border:0;border-radius:999px;background:transparent;color:#D9CFB4;font:700 12px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.06em;padding:6px 9px;min-width:34px;cursor:pointer}" +
    ".gtc-lang button.on{background:linear-gradient(120deg,#F4E7C1,#E8C872);color:#000008;box-shadow:0 0 10px rgba(232,200,114,.5)}";

  function makeToggle() {
    var w = document.createElement("div");
    w.className = "gtc-lang"; w.setAttribute("role", "group"); w.setAttribute("aria-label", "Langue / Language");
    w.setAttribute("data-gtc-noi18n", "");
    w.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9M12 3C9.4 5.6 8.1 8.6 8.1 12s1.3 6.4 3.9 9"/></svg>' +
      '<button type="button" data-l="fr">FR</button><button type="button" data-l="en">EN</button>';
    w.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button[data-l]");
      if (b) setLang(b.getAttribute("data-l"));
    });
    return w;
  }
  function paintToggles() {
    document.querySelectorAll(".gtc-lang button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-l") === LANG); });
  }

  function setLang(l) {
    if (l !== "fr" && l !== "en") return;
    LANG = l; window.GTC_LANG = l;
    try { localStorage.setItem("gtcLang", l); } catch (e) {}
    document.documentElement.lang = l;
    busy = true;
    try { walk(document.body); doTitle(); } finally { busy = false; }
    paintToggles();
    try { window.dispatchEvent(new CustomEvent("gtc:lang", { detail: l })); } catch (e) {}
  }

  window.GTC_I18N = { setLang: setLang, t: function (s) { return LANG === "en" ? (tr(s) || s) : s; } };

  function start() {
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    document.querySelectorAll("[data-gtc-lang-slot]").forEach(function (slot) { slot.appendChild(makeToggle()); });
    busy = true;
    try { walk(document.body); doTitle(); } finally { busy = false; }
    paintToggles();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
