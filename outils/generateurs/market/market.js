(function () {
  "use strict";
  var D = window.GTC_MARKET || {};
  var CATS = D.cats || [], P = D.products || [], C = D.countries || {}, PIC = D.icons || {}, UI = D.ui || {};
  var root = document.documentElement;
  var LANG = root.getAttribute("data-lang") === "en" ? "en" : "fr";
  var MAX = 30000;

  var S = {
    fr: {
      title: "Marketplace — GeoTerraChain QFS",
      all: "Tous", example: "EXEMPLE", flagship: "★ Filière phare", add: "Ajouter", details: "Détails",
      added: "{name} ajouté au panier.", favOn: "Ajouté à vos favoris.", favOff: "Retiré de vos favoris.",
      fav: "Ajouter aux favoris", count1: "1 produit", countN: "{n} produits", count0: "Aucun produit",
      empty: "Aucun produit ne correspond à votre recherche.", reset: "Réinitialiser les filtres",
      cartEmpty: "Votre panier est vide.", cartEmptySub: "Ajoutez un produit pour commencer.",
      remove: "Retirer", less: "Diminuer la quantité", more: "Augmenter la quantité",
      allCountries: "Tous les pays de l'UEMOA", sortDef: "Filières phares d'abord", sortAsc: "Prix croissant",
      sortDesc: "Prix décroissant", sortName: "Nom (A → Z)", ph: "Produit, ville, filière…", noLimit: "Sans limite",
      producer: "Producteur", exSuffix: " · exemple", origin: "Origine", price: "Prix d'exemple", trace: "Traçabilité du lot",
      tr1: "Origine déclarée", tr1d: "{place}, déclarée par le producteur.",
      tr2: "Producteur vérifié", tr2d: "Identité Pi (KYC fait sur Pi Network) et contrôle de l'exploitation.",
      tr3: "Lot horodaté", tr3d: "Récolte, conditionnement et expédition inscrits au journal d'audit.",
      tr4: "Preuve on-chain", tr4d: "Empreinte du lot ancrée sur Stellar après vérification.",
      stEx: "Exemple", stPlan: "Prévu", addCart: "Ajouter au panier", close: "Fermer",
      orderTitle: "Commande de démonstration", orderIntro: "Votre panier contient {n} article(s) pour un total de {total}.",
      orderInfo: "En confirmant, une référence et une empreinte SHA-256 sont calculées sur votre appareil. Aucun paiement n'est demandé, aucune donnée n'est envoyée et rien n'est inscrit sur la blockchain.",
      confirm: "Créer la commande de démonstration", cancel: "Annuler",
      doneBadge: "Démonstration", doneTitle: "Commande de démonstration créée", ref: "Référence", time: "Horodatage (appareil)",
      hash: "Empreinte SHA-256", status: "Statut", statusV: "Démo · non on-chain · aucun paiement",
      hashNA: "Indisponible sur ce navigateur",
      doneNote: "Cette référence n'a aucune valeur commerciale. Dans la version réelle, une commande ne sera confirmée qu'après la vérification du paiement Pi par le serveur.",
      ok: "Compris", toastOrder: "Commande de démonstration créée : {ref}", needItem: "Ajoutez au moins un produit avant de commander.",
      jEmpty: "Aucun évènement pour l'instant. Ajoutez un produit ou simulez une commande.",
      jAdd: "Ajout au panier", jOrder: "Commande de démonstration", jLocal: "Horodaté sur l'appareil · non on-chain",
      sellTitle: "Espace producteur",
      sellBody: "<p>L'espace producteur ouvrira après la phase pilote : publication d'annonces par des producteurs vérifiés (KYC fait sur Pi Network), gestion des lots et commandes payées en Pi.</p><p>Vous pouvez dès aujourd'hui tokeniser un actif agro-pastoral : bassin ranicole, champignonnière, plantation, élevage…</p>",
      sellCta: "Tokeniser un actif", cart: "Mon panier", cats: "Catégories",
      qrBtn: "Code QR", qrKick: "Étiquette d'emballage", qrTag: "EXEMPLE",
      qrText: "À imprimer ou à photographier pour l'emballage. Scanné avec un téléphone, ce code ouvre la fiche de ce produit sur la Marketplace.",
      qrLink: "Lien contenu dans le code", qrPrint: "Imprimer", qrSave: "Enregistrer l'image", qrBack: "← Retour à la fiche",
      qrNote: "Démonstration : ce code renvoie vers un produit d'exemple. Dans la version réelle, chaque lot aura son propre code, relié à sa traçabilité vérifiée.",
      qrSaved: "Image du code QR enregistrée.", qrSaveKo: "Enregistrement impossible ici : faites une capture d'écran du code.",
      qrPrintKo: "Impression indisponible dans ce navigateur : enregistrez l'image ou faites une capture d'écran.",
      qrAlt: "Code QR du produit {name}"
    },
    en: {
      title: "Marketplace — GeoTerraChain QFS",
      all: "All", example: "EXAMPLE", flagship: "★ Flagship", add: "Add", details: "Details",
      added: "{name} added to your basket.", favOn: "Added to your favourites.", favOff: "Removed from your favourites.",
      fav: "Add to favourites", count1: "1 product", countN: "{n} products", count0: "No product",
      empty: "No product matches your search.", reset: "Reset filters",
      cartEmpty: "Your basket is empty.", cartEmptySub: "Add a product to get started.",
      remove: "Remove", less: "Decrease quantity", more: "Increase quantity",
      allCountries: "All WAEMU countries", sortDef: "Flagship sectors first", sortAsc: "Price: low to high",
      sortDesc: "Price: high to low", sortName: "Name (A → Z)", ph: "Product, city, sector…", noLimit: "No limit",
      producer: "Producer", exSuffix: " · example", origin: "Origin", price: "Sample price", trace: "Batch traceability",
      tr1: "Declared origin", tr1d: "{place}, declared by the producer.",
      tr2: "Verified producer", tr2d: "Pi identity (KYC done on Pi Network) and farm inspection.",
      tr3: "Timestamped batch", tr3d: "Harvest, packing and shipping recorded in the audit log.",
      tr4: "On-chain proof", tr4d: "Batch fingerprint anchored on Stellar after verification.",
      stEx: "Example", stPlan: "Planned", addCart: "Add to basket", close: "Close",
      orderTitle: "Demo order", orderIntro: "Your basket holds {n} item(s) for a total of {total}.",
      orderInfo: "When you confirm, a reference and a SHA-256 fingerprint are computed on your device. No payment is requested, no data is sent and nothing is written to the blockchain.",
      confirm: "Create the demo order", cancel: "Cancel",
      doneBadge: "Demo", doneTitle: "Demo order created", ref: "Reference", time: "Timestamp (device)",
      hash: "SHA-256 fingerprint", status: "Status", statusV: "Demo · not on-chain · no payment",
      hashNA: "Not available in this browser",
      doneNote: "This reference has no commercial value. In the real version, an order will only be confirmed after the server verifies the Pi payment.",
      ok: "Got it", toastOrder: "Demo order created: {ref}", needItem: "Add at least one product before ordering.",
      jEmpty: "No events yet. Add a product or simulate an order.",
      jAdd: "Added to basket", jOrder: "Demo order", jLocal: "Device timestamp · not on-chain",
      sellTitle: "Producer space",
      sellBody: "<p>The producer space will open after the pilot phase: listings by verified producers (KYC done on Pi Network), batch management and orders paid in Pi.</p><p>You can already tokenize an agro-pastoral asset today: frog ponds, a mushroom farm, a plantation, livestock…</p>",
      sellCta: "Tokenize an asset", cart: "My basket", cats: "Categories",
      qrBtn: "QR code", qrKick: "Packaging label", qrTag: "EXAMPLE",
      qrText: "Print it or take a photo of it for the packaging. When scanned with a phone, this code opens this product's page on the Marketplace.",
      qrLink: "Link inside the code", qrPrint: "Print", qrSave: "Save the image", qrBack: "← Back to the product",
      qrNote: "Demo: this code points to a sample product. In the real version, each batch will have its own code, linked to its verified traceability.",
      qrSaved: "QR code image saved.", qrSaveKo: "Saving is not possible here: take a screenshot of the code.",
      qrPrintKo: "Printing is not available in this browser: save the image or take a screenshot.",
      qrAlt: "QR code for {name}"
    }
  };
  function t(k) { return (S[LANG] && S[LANG][k] != null) ? S[LANG][k] : (S.fr[k] != null ? S.fr[k] : k); }
  function tx(o) { return o ? (o[LANG] || o.fr || "") : ""; }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function svg(inner) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (inner || "") + "</svg>"; }
  function num(n) { return new Intl.NumberFormat(LANG === "en" ? "en-US" : "fr-FR").format(n); }
  function money(n) { return num(n) + " XOF"; }
  function when(iso) {
    try { return new Date(iso).toLocaleString(LANG === "en" ? "en-GB" : "fr-FR", { dateStyle: "medium", timeStyle: "medium" }); }
    catch (e) { return iso; }
  }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function byId(id) { for (var i = 0; i < P.length; i++) if (P[i].id === id) return P[i]; return null; }
  function catOf(p) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === p.cat) return CATS[i]; return CATS[0]; }
  var PAT = '<svg class="pat" aria-hidden="true"><rect width="100%" height="100%" fill="url(#hexp)"/></svg>';

  /* ---------- Préférences locales (favoris, panier) ---------- */
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === "object" ? v : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var favs = load("gtcMarketFav", []); if (!Array.isArray(favs)) favs = [];
  favs = favs.filter(function (id) { return !!byId(id); });
  var cart = load("gtcMarketCart", {}); var clean = {};
  Object.keys(cart).forEach(function (id) { var q = Math.floor(Number(cart[id])); if (byId(id) && q > 0 && q < 1000) clean[id] = q; });
  cart = clean;
  var journal = [];

  var state = { cat: "all", q: "", country: "all", max: MAX, sort: "def", star: false, fav: false };
  try {
    var qc = new URLSearchParams(location.search).get("cat");
    if (qc && CATS.some(function (c) { return c.id === qc; })) state.cat = qc;
  } catch (e) {}

  /* ---------- Catégories ---------- */
  function renderCats() {
    var h = '<button type="button" class="cat' + (state.cat === "all" ? " on" : "") + '" data-cat="all" aria-pressed="' + (state.cat === "all") + '">' + svg(UI.grid) + "<span>" + t("all") + "</span></button>";
    CATS.forEach(function (c) {
      var on = state.cat === c.id;
      h += '<button type="button" class="cat' + (c.star ? " star" : "") + (on ? " on" : "") + '" data-cat="' + c.id + '" aria-pressed="' + on + '">' + svg(PIC[c.ic]) + "<span>" + esc(tx(c.name)) + "</span>" + (c.star ? '<b class="st" aria-hidden="true">★</b>' : "") + "</button>";
    });
    $("cats").innerHTML = h;
    $("cats").setAttribute("aria-label", t("cats"));
  }

  /* ---------- Filtres ---------- */
  function renderFilterControls() {
    var fc = $("fc"), fs = $("fs");
    var codes = Object.keys(C);
    fc.innerHTML = '<option value="all">' + esc(t("allCountries")) + "</option>" + codes.map(function (k) { return '<option value="' + k + '">' + esc(tx(C[k])) + "</option>"; }).join("");
    fc.value = state.country;
    fs.innerHTML = [["def", "sortDef"], ["asc", "sortAsc"], ["desc", "sortDesc"], ["name", "sortName"]].map(function (o) { return '<option value="' + o[0] + '">' + esc(t(o[1])) + "</option>"; }).join("");
    fs.value = state.sort;
    $("q").setAttribute("placeholder", t("ph"));
    $("q").setAttribute("aria-label", t("ph"));
    paintPrice();
  }
  function paintPrice() { $("fpv").textContent = state.max >= MAX ? t("noLimit") : money(state.max); }
  function filtersActive() { return state.country !== "all" || state.max < MAX || state.sort !== "def" || state.star || state.fav; }

  function list() {
    var q = norm(state.q.trim());
    var arr = P.filter(function (p) {
      var c = catOf(p);
      if (state.cat !== "all" && p.cat !== state.cat) return false;
      if (state.country !== "all" && p.c !== state.country) return false;
      if (state.max < MAX && p.price > state.max) return false;
      if (state.star && !c.star) return false;
      if (state.fav && favs.indexOf(p.id) < 0) return false;
      if (q) {
        var hay = norm([p.name.fr, p.name.en, p.city, C[p.c].fr, C[p.c].en, c.name.fr, c.name.en, p.prod.fr, p.prod.en].join(" "));
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    if (state.sort === "asc") arr.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === "desc") arr.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === "name") arr.sort(function (a, b) { return tx(a.name).localeCompare(tx(b.name), LANG); });
    return arr;
  }

  /* ---------- Cartes produits ---------- */
  function artBox(p, cls) {
    var c = catOf(p);
    return '<div class="' + cls + '" style="--a:' + c.a + ";--b:" + c.b + '">' + PAT + '<span class="aic">' + svg(PIC[p.ic]) + "</span>" +
      '<span class="ex">' + t("example") + "</span>" + (c.star ? '<span class="flag">' + t("flagship") + "</span>" : "");
  }
  function card(p, i) {
    var c = catOf(p), fav = favs.indexOf(p.id) >= 0;
    return '<article class="pcard' + (c.star ? " star" : "") + '" style="animation-delay:' + Math.min(i * 30, 300) + 'ms">' +
      artBox(p, "art") +
        '<button type="button" class="fav' + (fav ? " on" : "") + '" data-fav="' + p.id + '" aria-pressed="' + fav + '" aria-label="' + esc(t("fav") + " — " + tx(p.name)) + '">' + svg(UI.heart) + "</button></div>" +
      '<div class="pb"><small>' + esc(tx(c.name)) + "</small><h3>" + esc(tx(p.name)) + "</h3>" +
        '<div class="loc">' + svg(UI.pin) + "<span>" + esc(p.city) + ", " + esc(tx(C[p.c])) + "</span></div>" +
        '<div class="price">' + num(p.price) + " <span>XOF / " + esc(tx(p.unit)) + "</span></div>" +
        '<div class="prod">' + esc(tx(p.prod)) + t("exSuffix") + "</div>" +
        '<div class="pact"><button type="button" class="bs gold" data-add="' + p.id + '">' + svg(UI.plus) + t("add") + "</button>" +
        '<button type="button" class="bs icon" data-info="' + p.id + '" aria-label="' + esc(t("details") + " — " + tx(p.name)) + '">' + svg(UI.info) + "</button></div>" +
      "</div></article>";
  }
  function renderGrid() {
    var arr = list();
    $("count").textContent = arr.length === 0 ? t("count0") : arr.length === 1 ? t("count1") : t("countN").replace("{n}", arr.length);
    $("grid").innerHTML = arr.length ? arr.map(card).join("") :
      '<div class="empty"><p>' + t("empty") + '</p><button type="button" class="bs" data-reset>' + t("reset") + "</button></div>";
    $("fdot").classList.toggle("on", filtersActive());
  }

  /* ---------- Panier ---------- */
  function entries() { return Object.keys(cart).filter(function (id) { return cart[id] > 0 && byId(id); }).map(function (id) { return [byId(id), cart[id]]; }); }
  function totals(e) { var n = 0, s = 0; e.forEach(function (x) { n += x[1]; s += x[0].price * x[1]; }); return { n: n, s: s }; }
  function renderCart() {
    var e = entries(), tt = totals(e);
    $("cartc").textContent = tt.n; $("fabc").textContent = tt.n;
    $("subt").textContent = money(tt.s);
    $("checkout").disabled = !e.length;
    $("dl").innerHTML = e.length ? e.map(function (x) {
      var p = x[0], q = x[1], c = catOf(p);
      return '<div class="crow"><span class="mini" style="--a:' + c.a + ";--b:" + c.b + '">' + svg(PIC[p.ic]) + "</span><div><b>" + esc(tx(p.name)) + "</b><small>" + money(p.price) + " / " + esc(tx(p.unit)) + "</small>" +
        '<div class="qty"><button type="button" data-dec="' + p.id + '" aria-label="' + esc(t("less")) + '">' + svg(UI.minus) + "</button><output>" + q + "</output>" +
        '<button type="button" data-inc="' + p.id + '" aria-label="' + esc(t("more")) + '">' + svg(UI.plus) + "</button>" +
        '<span class="lt">' + money(p.price * q) + "</span>" +
        '<button type="button" class="rm" data-rm="' + p.id + '" aria-label="' + esc(t("remove") + " — " + tx(p.name)) + '">' + svg(UI.trash) + "</button></div></div></div>";
    }).join("") : '<div class="cempty">' + svg(UI.cart) + "<b>" + t("cartEmpty") + "</b><span>" + t("cartEmptySub") + "</span></div>";
    $("fab").setAttribute("aria-label", t("cart") + " (" + tt.n + ")");
  }
  function setQty(id, q) {
    if (q <= 0) delete cart[id]; else cart[id] = Math.min(q, 999);
    save("gtcMarketCart", cart); renderCart();
  }
  function add(id) {
    var p = byId(id); if (!p) return;
    setQty(id, (cart[id] || 0) + 1);
    log({ type: "add", id: id });
    toast(t("added").replace("{name}", tx(p.name)));
    var f = $("fab"); f.classList.remove("bump"); void f.offsetWidth; f.classList.add("bump");
  }

  /* ---------- Journal de démonstration ---------- */
  function log(ev) { ev.time = new Date().toISOString(); journal.unshift(ev); journal = journal.slice(0, 8); renderJournal(); }
  function renderJournal() {
    $("jl").innerHTML = journal.length ? journal.map(function (e) {
      var title = e.type === "order" ? t("jOrder") + " · " + e.ref : t("jAdd") + " · " + tx((byId(e.id) || { name: { fr: "" } }).name);
      return '<li class="jr"><span class="ji">' + svg(e.type === "order" ? UI.hash : UI.cart) + "</span><div><b>" + esc(title) + "</b><small>" + esc(when(e.time)) + "</small>" +
        (e.hash ? "<code>SHA-256 " + e.hash.slice(0, 16) + "…" + e.hash.slice(-8) + "</code>" : "") + "<em>" + t("jLocal") + "</em></div></li>";
    }).join("") : '<li class="jempty">' + t("jEmpty") + "</li>";
  }

  /* ---------- Fenêtres (détails, commande, espace producteur) ---------- */
  var lastFocus = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    $("mbody").innerHTML = html;
    var md = $("mw").querySelector(".modal"); if (md) md.scrollTop = 0;
    $("mw").classList.add("on");
    var b = $("mw").querySelector(".mact .btn") || $("mclose"); try { b.focus({ preventScroll: true }); } catch (e) {}
  }
  function closeModal() {
    if (!$("mw").classList.contains("on")) return;
    $("mw").classList.remove("on"); $("mbody").innerHTML = "";
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function details(id) {
    var p = byId(id); if (!p) return;
    var c = catOf(p), place = p.city + ", " + tx(C[p.c]);
    var steps = [["tr1", t("tr1d").replace("{place}", place), "s-ex"], ["tr2", t("tr2d"), "s-plan"], ["tr3", t("tr3d"), "s-plan"], ["tr4", t("tr4d"), "s-plan"]];
    openModal(artBox(p, "md-art") + "</div>" +
      '<small class="kick">' + esc(tx(c.name)) + '</small><h2 id="mt">' + esc(tx(p.name)) + "</h2><p>" + esc(tx(p.desc)) + "</p>" +
      '<div class="kvs"><div><span>' + t("origin") + "</span><b>" + esc(place) + "</b></div>" +
        "<div><span>" + t("producer") + "</span><b>" + esc(tx(p.prod)) + t("exSuffix") + "</b></div>" +
        "<div><span>" + t("price") + '</span><b class="mono gold">' + money(p.price) + " / " + esc(tx(p.unit)) + "</b></div></div>" +
      '<h3 class="md-h">' + svg(UI.link) + t("trace") + '</h3><ol class="tl">' + steps.map(function (s, i) {
        return '<li class="' + s[2] + '"><i>' + (i + 1) + "</i><div><b>" + t(s[0]) + "</b><span>" + esc(s[1]) + '</span></div><em class="' + (s[2] === "s-ex" ? "st-ex" : "st-plan") + '">' + (s[2] === "s-ex" ? t("stEx") : t("stPlan")) + "</em></li>";
      }).join("") + "</ol>" +
      '<div class="mact"><button type="button" class="btn btn-gold" data-add="' + p.id + '" data-close>' + svg(UI.plus) + t("addCart") + '</button><button type="button" class="btn" data-qr="' + p.id + '">' + svg(UI.qr) + t("qrBtn") + '</button><button type="button" class="btn" data-close>' + t("close") + "</button></div>");
  }

  /* ---------- Code QR d'emballage ---------- */
  // Le code imprimé sur l'emballage pointe toujours vers l'adresse publique de l'app.
  var PUBLIC_URL = "https://hilaila.github.io/marketplace.html";
  function productUrl(p) { return PUBLIC_URL + "?p=" + encodeURIComponent(p.id); }
  function qrCard(id) {
    var p = byId(id); if (!p || !window.GTCQR) return;
    var url = productUrl(p), code;
    try { code = GTCQR.make(url, "Q"); } catch (e) { toast(t("qrSaveKo")); return; }
    var place = p.city + ", " + tx(C[p.c]);
    openModal('<small class="kick">' + t("qrKick") + '</small><h2 id="mt">' + esc(tx(p.name)) + "</h2>" +
      '<div class="qr-label" id="qrl">' + GTCQR.svg(code, t("qrAlt").replace("{name}", tx(p.name))) +
        "<b>" + esc(tx(p.name)) + "</b><small>" + esc(place) + "</small><small>GeoTerraChain QFS · Marketplace</small>" +
        '<span class="qr-tag">' + t("qrTag") + "</span></div>" +
      "<p>" + t("qrText") + "</p>" +
      '<div class="qr-url" title="' + esc(t("qrLink")) + '">' + esc(url) + "</div>" +
      '<p class="qr-note">' + t("qrNote") + "</p>" +
      '<div class="mact"><button type="button" class="btn btn-gold" data-qrprint>' + svg(UI.print) + t("qrPrint") + '</button>' +
        '<button type="button" class="btn" data-qrsave="' + p.id + '">' + svg(UI.save) + t("qrSave") + "</button>" +
        '<button type="button" class="btn" data-info="' + p.id + '">' + t("qrBack") + "</button></div>");
  }
  function qrPrint() {
    if (typeof window.print !== "function") { toast(t("qrPrintKo")); return; }
    try { window.print(); } catch (e) { toast(t("qrPrintKo")); }
  }
  function qrSave(id) {
    var p = byId(id); if (!p) return;
    try {
      var code = GTCQR.make(productUrl(p), "Q"), sc = 12, n = code.size + 8, w = n * sc, h = w + 132;
      var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
      var g = cv.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#000";
      for (var y = 0; y < code.size; y++) for (var x = 0; x < code.size; x++) if (code.dark(x, y)) g.fillRect((x + 4) * sc, (y + 4) * sc, sc, sc);
      g.textAlign = "center"; g.textBaseline = "alphabetic";
      var name = tx(p.name), fs = 30;
      g.font = "700 " + fs + "px system-ui, sans-serif";
      while (g.measureText(name).width > w - 40 && fs > 16) { fs -= 2; g.font = "700 " + fs + "px system-ui, sans-serif"; }
      g.fillText(name, w / 2, w + 30);
      g.font = "600 20px monospace"; g.fillStyle = "#333";
      g.fillText(p.city + ", " + tx(C[p.c]), w / 2, w + 62);
      g.fillText("GeoTerraChain QFS · Marketplace · " + t("qrTag"), w / 2, w + 92);
      var a = document.createElement("a");
      a.href = cv.toDataURL("image/png"); a.download = "qr-geoterrachain-" + p.id + ".png";
      document.body.appendChild(a); a.click(); a.remove();
      toast(t("qrSaved"));
    } catch (e) { toast(t("qrSaveKo")); }
  }
  function checkout() {
    var e = entries(); if (!e.length) { toast(t("needItem")); return; }
    var tt = totals(e);
    openModal('<h2 id="mt">' + t("orderTitle") + "</h2><p>" + t("orderIntro").replace("{n}", "<b>" + tt.n + "</b>").replace("{total}", '<b class="gold mono">' + money(tt.s) + "</b>") + "</p>" +
      '<ul class="olist">' + e.map(function (x) { return "<li><span>" + x[1] + " × " + esc(tx(x[0].name)) + '</span><b class="mono">' + money(x[0].price * x[1]) + "</b></li>"; }).join("") + "</ul>" +
      '<p class="fine">' + t("orderInfo") + "</p>" +
      '<div class="mact"><button type="button" class="btn btn-gold" id="confirm">' + t("confirm") + '</button><button type="button" class="btn" data-close>' + t("cancel") + "</button></div>");
    $("confirm").addEventListener("click", function () { this.disabled = true; confirmOrder(e, tt); });
  }
  function rand4() {
    try { var a = new Uint8Array(2); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("").toUpperCase(); }
    catch (e) { return Math.random().toString(16).slice(2, 6).toUpperCase(); }
  }
  function sha256(s) {
    try {
      if (!window.crypto || !crypto.subtle || !window.TextEncoder) return Promise.resolve(null);
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      }).catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }
  function confirmOrder(e, tt) {
    var now = new Date();
    var ref = "DEMO-" + now.toISOString().slice(0, 10).replace(/-/g, "") + "-" + rand4();
    var payload = JSON.stringify({ ref: ref, time: now.toISOString(), items: e.map(function (x) { return { id: x[0].id, qty: x[1], price: x[0].price }; }), total: tt.s, currency: "XOF", demo: true });
    sha256(payload).then(function (hash) {
      journal.unshift({ type: "order", ref: ref, time: now.toISOString(), hash: hash }); journal = journal.slice(0, 8);
      cart = {}; save("gtcMarketCart", cart); renderCart(); renderJournal(); closeDrawer(true);
      openModal('<span class="okbadge">' + svg(UI.hash) + t("doneBadge") + '</span><h2 id="mt">' + t("doneTitle") + "</h2>" +
        '<div class="kvs"><div><span>' + t("ref") + '</span><b class="mono gold">' + ref + "</b></div>" +
          "<div><span>" + t("time") + "</span><b>" + esc(when(now.toISOString())) + "</b></div>" +
          "<div><span>" + t("hash") + "</span>" + (hash ? "<code>" + hash + "</code>" : "<b>" + t("hashNA") + "</b>") + "</div>" +
          "<div><span>" + t("status") + "</span><b>" + t("statusV") + "</b></div></div>" +
        '<p class="fine">' + t("doneNote") + "</p>" +
        '<div class="mact"><button type="button" class="btn btn-gold" data-close>' + t("ok") + "</button></div>");
    });
  }
  function sell() {
    openModal('<h2 id="mt">' + t("sellTitle") + "</h2>" + t("sellBody") +
      '<div class="mact"><a class="btn btn-gold" href="tokenisation.html">' + t("sellCta") + ' →</a><button type="button" class="btn" data-close>' + t("close") + "</button></div>");
  }

  /* ---------- Tiroir du panier ---------- */
  function openDrawer() {
    lastFocus = document.activeElement;
    $("drawer").classList.add("on"); $("ov").classList.add("on"); $("drawer").setAttribute("aria-hidden", "false");
    try { $("dclose").focus({ preventScroll: true }); } catch (e) {}
  }
  function closeDrawer(silent) {
    if (!$("drawer").classList.contains("on")) return;
    $("drawer").classList.remove("on"); $("ov").classList.remove("on"); $("drawer").setAttribute("aria-hidden", "true");
    if (!silent && lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---------- Notification ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $("toast"); el.textContent = msg; el.classList.add("on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove("on"); }, 2600);
  }

  /* ---------- Évènements ---------- */
  function goCatalogue() {
    var el = $("catalogue"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest ? ev.target.closest("[data-add],[data-info],[data-fav],[data-cat],[data-go],[data-inc],[data-dec],[data-rm],[data-reset],[data-close],[data-qr],[data-qrprint],[data-qrsave]") : null;
    if (!el) return;
    if (el.hasAttribute("data-qr")) return qrCard(el.getAttribute("data-qr"));
    if (el.hasAttribute("data-qrprint")) return qrPrint();
    if (el.hasAttribute("data-qrsave")) return qrSave(el.getAttribute("data-qrsave"));
    if (el.hasAttribute("data-add")) add(el.getAttribute("data-add"));
    if (el.hasAttribute("data-close")) { closeModal(); return; }
    if (el.hasAttribute("data-add")) return;
    if (el.hasAttribute("data-info")) return details(el.getAttribute("data-info"));
    if (el.hasAttribute("data-fav")) {
      var id = el.getAttribute("data-fav"), i = favs.indexOf(id);
      if (i >= 0) favs.splice(i, 1); else favs.push(id);
      save("gtcMarketFav", favs); renderGrid(); toast(i >= 0 ? t("favOff") : t("favOn")); return;
    }
    if (el.hasAttribute("data-cat")) { state.cat = el.getAttribute("data-cat"); renderCats(); renderGrid(); return; }
    if (el.hasAttribute("data-go")) { state.cat = el.getAttribute("data-go"); renderCats(); renderGrid(); goCatalogue(); return; }
    if (el.hasAttribute("data-inc")) { var a = el.getAttribute("data-inc"); setQty(a, (cart[a] || 0) + 1); return; }
    if (el.hasAttribute("data-dec")) { var b = el.getAttribute("data-dec"); setQty(b, (cart[b] || 0) - 1); return; }
    if (el.hasAttribute("data-rm")) { setQty(el.getAttribute("data-rm"), 0); return; }
    if (el.hasAttribute("data-reset")) { resetFilters(); return; }
  });
  function resetFilters() {
    state = { cat: "all", q: "", country: "all", max: MAX, sort: "def", star: false, fav: false };
    $("q").value = ""; $("fp").value = MAX; $("fstar").checked = false; $("ffav").checked = false;
    renderCats(); renderFilterControls(); renderGrid();
  }
  $("q").addEventListener("input", function () { state.q = this.value; renderGrid(); });
  $("fc").addEventListener("change", function () { state.country = this.value; renderGrid(); });
  $("fs").addEventListener("change", function () { state.sort = this.value; renderGrid(); });
  $("fp").addEventListener("input", function () { state.max = Number(this.value) || MAX; paintPrice(); renderGrid(); });
  $("fstar").addEventListener("change", function () { state.star = this.checked; renderGrid(); });
  $("ffav").addEventListener("change", function () { state.fav = this.checked; renderGrid(); });
  $("freset").addEventListener("click", resetFilters);
  $("fbtn").addEventListener("click", function () {
    var open = $("fpanel").classList.toggle("open");
    this.setAttribute("aria-expanded", String(open));
  });
  $("cartbtn").addEventListener("click", openDrawer);
  $("fab").addEventListener("click", openDrawer);
  $("dclose").addEventListener("click", function () { closeDrawer(); });
  $("ov").addEventListener("click", function () { closeDrawer(); });
  $("checkout").addEventListener("click", checkout);
  $("mclose").addEventListener("click", closeModal);
  $("mw").addEventListener("click", function (e) { if (e.target === this) closeModal(); });
  $("sell").addEventListener("click", sell);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if ($("mw").classList.contains("on")) closeModal(); else closeDrawer();
  });

  /* ---------- Langue ---------- */
  function setLang(l) {
    LANG = l === "en" ? "en" : "fr";
    root.setAttribute("data-lang", LANG); root.lang = LANG; document.title = t("title");
    document.querySelectorAll(".lang button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-l") === LANG); });
    ["mclose", "dclose"].forEach(function (id) { $(id).setAttribute("aria-label", t("close")); });
    closeModal();
    renderCats(); renderFilterControls(); renderGrid(); renderCart(); renderJournal();
  }
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () {
      var l = b.getAttribute("data-l");
      try { localStorage.setItem("gtcLang", l); } catch (e) {}
      setLang(l);
    });
  });

  setLang(LANG);
  if (state.cat !== "all") setTimeout(goCatalogue, 300);

  /* ---------- Lien direct vers un produit (?p=…), utilisé par le code QR ---------- */
  try {
    var qp = new URLSearchParams(location.search).get("p");
    if (qp && byId(qp)) setTimeout(function () { details(qp); }, 350);
  } catch (e) {}
})();
