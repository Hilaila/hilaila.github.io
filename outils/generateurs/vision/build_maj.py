# Génère mises-a-jour.html : historique public des évolutions de GeoTerraChain QFS, premium Web3, FR/EN.
# Usage : python3 build_maj.py <vision.html (source du CSS)> <sortie>
# Chaque entrée correspond à des modifications réellement publiées (historique Git des deux dépôts).
import sys, re, os

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "build_vision.py"), encoding="utf-8").read()
exec(src.split("# ======================= CONTENU")[0].replace("OUT = sys.argv[1]", ""))   # T, ic, I, sec_head

VISION, OUT = sys.argv[1], sys.argv[2]
BASE_CSS = re.search(r"<style>(.*?)</style>", open(VISION, encoding="utf-8").read(), re.S).group(1)

I.update({
  "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  "code": '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
})

TAGS = {
  "secu": ("Sécurité", "Security", "t-secu"),
  "fiab": ("Fiabilité", "Reliability", "t-fiab"),
  "app": ("Application", "App", "t-app"),
  "gouv": ("Gouvernance", "Governance", "t-gouv"),
  "market": ("Marketplace", "Marketplace", "t-market"),
  "contenu": ("Contenu", "Content", "t-contenu"),
  "infra": ("Infrastructure", "Infrastructure", "t-infra"),
}

# (date ISO, date FR, date EN, [(tag, texte FR, texte EN), …]) — du plus récent au plus ancien
ENTRIES = [
  ("2026-10-26", "26 octobre 2026", "26 October 2026", [
    ("app", "Connexion Pioneer : une sphère animée or et violet sert désormais de bouton de connexion Pi et affiche chaque étape (connexion, vérification, bienvenue), avec « Réessayer » en cas d'échec.",
            "Pioneer sign-in: an animated gold and violet sphere now serves as the Pi sign-in button and shows each step (connecting, verifying, welcome), with “Try again” if it fails."),
  ]),
  ("2026-10-21", "21 octobre 2026", "21 October 2026", [
    ("secu", "Le serveur limite le nombre de demandes trop rapprochées, pour éviter les abus.",
             "The server limits requests sent too close together, to prevent abuse."),
    ("fiab", "Message « Hors ligne » et reprise automatique des lectures après une coupure de connexion.",
             "“Offline” message and automatic retry of reads after a connection drop."),
    ("app", "Tokeniser : le formulaire est gardé en brouillon sur votre téléphone ; lien vers l'explorateur pour le jeton de test émis ; identifiant de paiement Pi copiable.",
            "Tokenize: the form is kept as a draft on your phone; explorer link for the issued test token; copyable Pi payment ID."),
    ("app", "Pages plus légères (logo optimisé) et réglage « réduire les animations » du téléphone respecté sur toutes les pages.",
            "Lighter pages (optimised logo) and the phone's “reduce motion” setting respected on every page."),
    ("gouv", "Registre des incidents et suivi des erreurs du serveur pour l'administrateur ; publication de cette page « Mises à jour ».",
             "Incident register and server error tracking for the administrator; this “Updates” page is published."),
    ("gouv", "Sauvegarde chiffrée de la base chaque semaine, vérifiée par une restauration d'essai automatique.",
             "Weekly encrypted database backup, checked by an automatic test restore."),
    ("app", "Accessibilité : textes plus contrastés, zoom permis sur toutes les pages, onglets, questions et ajout de documents utilisables au clavier, élément actif bien visible ; contrôle automatique selon les normes WCAG 2.2 (niveaux A et AA).",
            "Accessibility: higher-contrast text, zoom allowed on every page, tabs, questions and document upload usable from the keyboard, clearly visible focus; automatic check against WCAG 2.2 (levels A and AA)."),
  ]),
  ("2026-10-19", "19 octobre 2026", "19 October 2026", [
    ("market", "Marketplace : bouton « Code QR » pour imprimer ou photographier l'étiquette d'emballage d'un produit.",
               "Marketplace: “QR code” button to print or photograph a product's packaging label."),
  ]),
  ("2026-10-18", "18 octobre 2026", "18 October 2026", [
    ("infra", "Adresse de test séparée préparée pour l'application de test, en vue du passage au réseau principal de Pi.",
              "Separate test address prepared for the test app, ahead of the move to Pi's main network."),
  ]),
  ("2026-10-15", "15 octobre 2026", "15 October 2026", [
    ("secu", "Chaque paiement Pi est revérifié par le serveur (propriétaire, montant, opération) et ne peut servir qu'une seule fois.",
             "Every Pi payment is re-checked by the server (owner, amount, operation) and can only be used once."),
    ("gouv", "Les projets créés par les Pioneers ne sont publiés qu'après validation par l'administrateur.",
             "Projects created by Pioneers are only published after the administrator approves them."),
    ("market", "Ouverture de la Marketplace agro-pastorale en démonstration, en français et en anglais.",
               "Launch of the agro-pastoral Marketplace as a demo, in French and English."),
    ("contenu", "Page « Vérification GTCπ » : identité officielle du jeton et de son émetteur.",
                "“GTCπ verification” page: official identity of the token and its issuer."),
    ("contenu", "Raniculture et myciculture ajoutées aux types d'actifs, avec liens vers la Marketplace ; page Vision accessible depuis le menu.",
                "Frog farming and mushroom farming added to asset types, with links to the Marketplace; Vision page reachable from the menu."),
  ]),
  ("2026-10-14", "14 octobre 2026", "14 October 2026", [
    ("secu", "Documents fonciers envoyés vers un stockage privé, avec empreinte numérique SHA-256 scellée.",
             "Land documents sent to private storage, with a sealed SHA-256 fingerprint."),
    ("secu", "Le jeton de test GTCπ n'est émis qu'après un paiement Pi finalisé, et une seule fois par demande.",
             "The GTCπ test token is only issued after a completed Pi payment, and only once per request."),
    ("contenu", "Versions anglaises de Tokeniser, du Guide, de la Vision et de la page d'erreur.",
                "English versions of Tokenize, the Guide, Vision and the error page."),
    ("contenu", "Page « Le film » : spot de 30 secondes et film de 2 minutes.",
                "“The film” page: 30-second spot and 2-minute film."),
  ]),
  ("2026-10-12", "12 octobre 2026", "12 October 2026", [
    ("gouv", "Journal de l'application pour l'administrateur : connexions, demandes, paiements et émissions.",
             "App log for the administrator: sign-ins, requests, payments and issuances."),
    ("contenu", "Politique de confidentialité mise à jour (version 2.3).",
                "Privacy policy updated (version 2.3)."),
  ]),
  ("2026-10-10", "10 octobre 2026", "10 October 2026", [
    ("contenu", "Publication de la politique de confidentialité et des conditions d'utilisation.",
                "Privacy policy and terms of use published."),
  ]),
]

def tag(k):
    fr, en, cls = TAGS[k]
    return f'<span class="tg {cls}">{T(fr, en)}</span>'

days_html = "".join(
  f'''<li class="day">
      <div class="dn"><span class="mono"></span></div>
      <div class="glass">
        <time datetime="{iso}">{T(dfr, den)}</time>
        <ul class="items">{"".join(f"<li>{tag(k)}<p>{T(fr, en)}</p></li>" for k, fr, en in items)}</ul>
      </div>
    </li>''' for iso, dfr, den, items in ENTRIES)

CSS = """
  .days { list-style:none; position:relative; display:grid; gap:14px; padding-left:34px; }
  .days::before { content:""; position:absolute; left:11px; top:8px; bottom:8px; width:2px; background:linear-gradient(180deg, var(--gold-2), var(--violet), rgba(201,168,76,.15)); opacity:.6; }
  .day { position:relative; }
  .day .dn { position:absolute; left:-34px; top:16px; width:24px; height:24px; clip-path:polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); background:linear-gradient(135deg, #FFF3C4, var(--gold-2) 50%, var(--gold-3)); }
  .day time { display:block; font:700 12px 'JetBrains Mono', monospace; letter-spacing:.1em; text-transform:uppercase; color:var(--gold-2); margin-bottom:8px; }
  .items { list-style:none; display:grid; gap:10px; }
  .items li { display:grid; gap:4px; padding-bottom:10px; border-bottom:1px solid rgba(201,168,76,.12); }
  .items li:last-child { padding-bottom:0; border-bottom:0; }
  .items p { font-size:14.5px; line-height:1.5; }
  .tg { justify-self:start; font:700 10px 'JetBrains Mono', monospace; letter-spacing:.12em; text-transform:uppercase; padding:2px 8px; border-radius:999px; border:1px solid var(--line); color:var(--gold-2); }
  .t-secu { color:#FFB4B4; border-color:rgba(255,141,141,.45); }
  .t-fiab { color:#9FF0C8; border-color:rgba(61,220,151,.45); }
  .t-gouv { color:var(--violet-2); border-color:rgba(168,139,255,.45); }
  .t-market { color:#9FF0C8; border-color:rgba(61,220,151,.35); }
  .t-infra { color:#BFD4FF; border-color:rgba(120,160,255,.45); }
  ol.how { list-style:none; counter-reset:h; display:grid; gap:8px; }
  ol.how li { counter-increment:h; display:flex; gap:12px; align-items:flex-start; padding:11px 12px; border:1px solid var(--line); border-radius:14px; background:rgba(0,0,8,.4); font-size:14px; }
  ol.how li::before { content:counter(h); flex-shrink:0; width:24px; height:24px; display:grid; place-items:center; border-radius:8px; font:700 12px 'JetBrains Mono', monospace; color:#000008; background:linear-gradient(135deg, #FFF3C4, var(--gold-2)); }
  .ver { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:14px; }
  .ver > span { font:700 11px 'JetBrains Mono', monospace; letter-spacing:.1em; padding:5px 10px; border-radius:999px; border:1px solid var(--line); color:var(--gold-2); background:rgba(232,200,114,.06); }
"""

process = [
  ("Chaque modification est d'abord vérifiée : tests automatiques du serveur et contrôle de toutes les pages sur écran de téléphone, en français et en anglais.",
   "Every change is checked first: automatic server tests and a check of every page on a phone screen, in French and English."),
  ("Elle n'est publiée qu'avec l'accord du fondateur.",
   "It is only published with the founder's approval."),
  ("Le code de l'application est public : chacun peut consulter son historique sur GitHub.",
   "The app's code is public: anyone can read its history on GitHub."),
  ("Les incidents sont notés dans un registre suivi par l'administrateur, jusqu'à leur résolution.",
   "Incidents are recorded in a register followed by the administrator until they are resolved."),
]
process_html = "".join(f"<li><span>{T(a, b)}</span></li>" for a, b in process)

TITLE = "Mises à jour — GeoTerraChain QFS"
page = f'''<!DOCTYPE html>
<html lang="fr" data-lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#000008">
<title>{TITLE}</title>
<meta name="description" content="Historique public des évolutions de GeoTerraChain QFS : sécurité, fiabilité, application, gouvernance. Projet indépendant, phase pilote.">
<meta property="og:title" content="GeoTerraChain QFS — Mises à jour">
<meta property="og:description" content="Ce qui a changé dans GeoTerraChain QFS, date par date.">
<meta property="og:image" content="https://hilaila.github.io/videos/apercu-lien.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"></noscript>
<script>
  (function () {{
    var l = null;
    try {{ l = localStorage.getItem("gtcLang"); }} catch (e) {{}}
    if (l !== "fr" && l !== "en") l = (navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
    document.documentElement.setAttribute("data-lang", l);
    document.documentElement.lang = l;
  }})();
</script>
<style>{BASE_CSS}{CSS}</style>
<script src="reseau.js"></script>
<script src="clavier.js" defer></script>
</head>
<body>
<header class="top">
  <div class="bar">
    <a class="brand" href="index.html">
      <img src="logo-160.webp" alt="GeoTerraChain QFS">
      <span><b>GeoTerraChain QFS</b><small>{T("Mises à jour", "Updates")}</small></span>
    </a>
    <span class="badge">{T("PHASE PILOTE", "PILOT PHASE")}</span>
  </div>
  <div class="sub">
    <div class="lang" role="group" aria-label="Langue / Language"><span class="globe" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">{I["globe"]}</svg></span><button type="button" data-l="fr">FR</button><button type="button" data-l="en">EN</button></div>
    <span class="msep" aria-hidden="true"></span>
    <a href="index.html">{T("← Accueil", "← Home")}</a>
  </div>
</header>

<main>
  <section class="hero" id="haut">
    <span class="eyebrow"><i></i>{T("Journal des évolutions", "Change log")}</span>
    <h1>{T("Ce qui a <em>changé</em>", "What has <em>changed</em>")}</h1>
    <p class="lead">{T("Les améliorations publiées dans GeoTerraChain QFS, date par date : sécurité, fiabilité, application et gouvernance.",
                       "The improvements published in GeoTerraChain QFS, date by date: security, reliability, app and governance.")}</p>
    <div class="ver"><span>{T("VERSION PILOTE 1.0.0", "PILOT VERSION 1.0.0")}</span><span>PI TESTNET</span><span>{T("MAINNET : NON DÉPLOYÉ", "MAINNET: NOT DEPLOYED")}</span></div>
  </section>

  <section class="block">
    {sec_head("01", "clock", "Dernières mises à jour", "Latest updates", "Du plus récent au plus ancien.", "Newest first.")}
    <ol class="days">{days_html}</ol>
  </section>

  <section class="block">
    {sec_head("02", "shield", "Comment nous publions", "How we publish")}
    <ol class="how">{process_html}</ol>
  </section>

  <section class="block">
    {sec_head("03", "mail", "Signaler un problème", "Report a problem")}
    <div class="glass">
      <p>{T("Un souci dans l'application ? Écrivez-nous en décrivant ce qui se passe, sur quelle page, et depuis quand. Ne communiquez jamais votre phrase secrète de 24 mots.",
            "A problem in the app? Write to us describing what happens, on which page and since when. Never share your 24-word secret phrase.")}</p>
      <div class="cta" style="justify-content:flex-start">
        <a class="btn btn-gold" href="mailto:iyhalob2015outlookfr@gmail.com?subject=GeoTerraChain%20QFS%20%E2%80%94%20Probl%C3%A8me">{ic("mail")}{T("Écrire au support", "Email support")}</a>
        <a class="btn" href="guide-aide-geoterrachain-qfs.html">{ic("book")}{T("Guide &amp; Aide", "Guide &amp; Help")}</a>
        <a class="btn" href="https://github.com/Hilaila/hilaila.github.io/commits/main" target="_blank" rel="noopener">{ic("code")}{T("Historique du code", "Code history")}</a>
      </div>
    </div>
    <p class="note">{T("Projet indépendant · Phase pilote. GeoTerraChain QFS ne vous demandera jamais votre phrase secrète de 24 mots.",
      "Independent project · Pilot phase. GeoTerraChain QFS will never ask for your 24-word secret phrase.")}</p>
  </section>
</main>
<footer><b>GeoTerraChain QFS</b><br>{T("Développé par @Hilaila · Côte d'Ivoire · UEMOA · 2026", "Built by @Hilaila · Côte d'Ivoire · WAEMU · 2026")}</footer>

<script>
(function () {{
  var root = document.documentElement;
  function setLang(l) {{
    root.setAttribute("data-lang", l); root.lang = l;
    document.querySelectorAll(".lang button").forEach(function (b) {{ b.classList.toggle("on", b.getAttribute("data-l") === l); }});
  }}
  document.querySelectorAll(".lang button").forEach(function (b) {{
    b.addEventListener("click", function () {{
      var l = b.getAttribute("data-l");
      try {{ localStorage.setItem("gtcLang", l); }} catch (e) {{}}
      setLang(l);
    }});
  }});
  setLang(root.getAttribute("data-lang") === "en" ? "en" : "fr");
}})();
</script>
</body>
</html>
'''
open(OUT, "w", encoding="utf-8").write(page)
print("ok", len(page))
