/* GeoTerraChain QFS — clavier et lecteurs d'écran (toutes les pages)
   1. Contour doré bien visible autour de l'élément actif quand on navigue au clavier.
   2. Onglets, questions de la FAQ, zone « Ajouter les documents » et autres zones cliquables
      utilisables au clavier (Tab pour s'y rendre, Entrée ou Espace pour les activer, flèches
      entre onglets), avec leur état annoncé aux lecteurs d'écran (sélectionné, ouvert, fermé).
   3. Zones à défilement horizontal (tableaux, rangées d'onglets) atteignables au clavier.
   4. Sur téléphone, champs de saisie en 16 px : le zoom reste possible sans que l'écran
      ne s'agrandisse tout seul à chaque saisie.
   Aucune donnée n'est envoyée ni conservée par ce script. */
(function () {
  "use strict";
  if (window.__gtcClavier) return;
  window.__gtcClavier = true;

  var st = document.createElement("style");
  st.id = "gtc-clavier";
  st.textContent =
    ":focus-visible{outline:2px solid #E8C872!important;outline-offset:2px!important}" +
    "@media (max-width:760px){input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]),select,textarea{font-size:16px!important}}";
  (document.head || document.documentElement).appendChild(st);

  var NATIVE = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY|DETAILS|LABEL|OPTION|VIDEO|AUDIO)$/;
  var TAB = /(^|\s)([\w]+-)?tab(\s|$)/;

  function sync(el) {
    if (el.__gtcTab) el.setAttribute("aria-pressed", el.classList.contains("active") ? "true" : "false");
    if (el.__gtcAcc) el.__gtcAcc.setAttribute("aria-expanded", el.classList.contains("open") ? "true" : "false");
  }

  function prepare(el) {
    if (el.__gtcKb || NATIVE.test(el.tagName) || el.isContentEditable) return;
    el.__gtcKb = true;
    var target = el;
    var q = null;
    for (var i = 0; i < el.children.length; i++) if (el.children[i].classList.contains("faq-question")) q = el.children[i];
    if (q) { target = q; el.__gtcAcc = q; }
    else if (TAB.test(el.className || "")) el.__gtcTab = true;
    if (!target.hasAttribute("role")) target.setAttribute("role", "button");
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "0");
    target.addEventListener("keydown", function (e) {
      if (e.target !== target) return;
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); el.click(); return; }
      if (el.__gtcTab && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        var tabs = [].filter.call(el.parentElement.children, function (c) { return c.__gtcTab; });
        var k = tabs.indexOf(el) + (e.key === "ArrowRight" ? 1 : -1);
        var next = tabs[(k + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); next.focus(); next.click(); }
      }
    });
    sync(el);
    if (window.MutationObserver) new MutationObserver(function () { sync(el); }).observe(el, { attributes: true, attributeFilter: ["class"] });
  }

  // Étiquette qui ouvre un champ caché (ajout de documents) : elle devient le bouton.
  function prepareLabel(lb) {
    if (lb.__gtcKb) return;
    var input = lb.htmlFor && document.getElementById(lb.htmlFor);
    if (!input || !(input.hidden || getComputedStyle(input).display === "none")) return;
    lb.__gtcKb = true;
    if (!lb.hasAttribute("role")) lb.setAttribute("role", "button");
    if (!lb.hasAttribute("tabindex")) lb.setAttribute("tabindex", "0");
    lb.addEventListener("keydown", function (e) {
      if (e.target !== lb) return;
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); input.click(); }
    });
  }

  function prepareAll(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.hasAttribute && root.hasAttribute("onclick")) prepare(root);
    var list = root.querySelectorAll("[onclick]");
    for (var i = 0; i < list.length; i++) prepare(list[i]);
    var labels = root.querySelectorAll("label[for]");
    for (var j = 0; j < labels.length; j++) prepareLabel(labels[j]);
  }

  var FOCUSABLE = "a[href],button,input,select,textarea,summary,[tabindex]";
  function scrollables() {
    if (!document.body) return;
    var all = document.body.getElementsByTagName("*");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.hasAttribute("tabindex")) continue;
      if (el.scrollWidth <= el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 2) continue;
      var cs = getComputedStyle(el);
      if (!/(auto|scroll)/.test(cs.overflowX + " " + cs.overflowY)) continue;
      if (el.querySelector(FOCUSABLE)) continue;
      el.setAttribute("tabindex", "0");
    }
  }

  // Contenu ajouté plus tard (listes chargées depuis le serveur, fenêtres) : seuls les
  // nouveaux éléments sont examinés ; le relevé des zones à défilement est regroupé.
  var timer = null;
  function scrollablesLater() { clearTimeout(timer); timer = setTimeout(scrollables, 600); }
  function onMutations(list) {
    var added = false;
    for (var i = 0; i < list.length; i++) {
      var nodes = list[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) if (nodes[j].nodeType === 1) { prepareAll(nodes[j]); added = true; }
    }
    if (added) scrollablesLater();
  }

  function start() {
    prepareAll(document.body);
    scrollables();
    if (window.MutationObserver) new MutationObserver(onMutations).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", scrollablesLater);
    window.addEventListener("load", scrollablesLater);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
