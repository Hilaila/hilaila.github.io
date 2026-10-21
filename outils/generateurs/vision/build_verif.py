# Génère gtcp-verification.html : identité officielle du jeton GTCπ, premium Web3, FR/EN.
# Usage : python3 build_verif.py <vision.html (source du CSS)> <ancienne page (adresses)> <sortie>
import sys, re, os

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "build_vision.py"), encoding="utf-8").read()
exec(src.split("# ======================= CONTENU")[0].replace("OUT = sys.argv[1]", ""))   # T, ic, I

VISION, OLD, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
BASE_CSS = re.search(r"<style>(.*?)</style>", open(VISION, encoding="utf-8").read(), re.S).group(1)
old = open(OLD, encoding="utf-8").read()
addrs = []
for a in re.findall(r"\bG[A-Z2-7]{55}\b", old):
    if a not in addrs: addrs.append(a)
ISSUER, LEGACY1, LEGACY2 = addrs[0], addrs[1], addrs[2]
EXPLORER = f"https://stellar.expert/explorer/testnet/account/{ISSUER}"

I.update({
  "copy": '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  "ext": '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  "alert": '<path d="M12 3l9.5 17H2.5z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".9" fill="currentColor"/>',
  "archive": '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>',
})

def addr_block(a, cls=""):
    return f'''<div class="addr {cls}"><code class="mono">{a}</code><button type="button" class="cp" data-copy="{a}" aria-label="Copier l'adresse">{ic("copy", "ci")}<span>{T("Copier", "Copy")}</span></button></div>'''

ident = [
  (T("Nom", "Name"), "GTCπ", "gold"),
  (T("Code on-chain (Asset Code)", "On-chain code (Asset Code)"), "GTCP", "gold"),
  (T("Réseau", "Network"), T("Stellar Testnet · phase pilote", "Stellar Testnet · pilot phase"), ""),
  (T("Mainnet", "Mainnet"), T("Non déployé", "Not deployed"), "muted2"),
  (T("Offre maximale", "Maximum supply"), "3 141 592 GTCπ", ""),
  (T("Burn par tokenisation", "Burn per tokenization"), T("0,5 %", "0.5%"), ""),
  (T("Projet", "Project"), "GeoTerraChain QFS", "gold"),
]
ident_html = "".join(f'<div class="prm"><span>{a}</span><b class="mono {c}">{b}</b></div>' for a, b, c in ident)

status = [
  ("ok", "check", "Émetteur officiellement déclaré par GeoTerraChain QFS", "Issuer officially declared by GeoTerraChain QFS"),
  ("ok", "check", "Émissions de test confirmées sur Stellar Testnet (dernière : 15 octobre 2026)", "Test issuances confirmed on Stellar Testnet (latest: 15 October 2026)"),
  ("wait", "clock", "Mainnet : non déployé — aucune émission réelle à ce jour", "Mainnet: not deployed — no real issuance to date"),
]
status_html = "".join(f'<li class="{k}">{ic(i, "si")}<span>{T(fr, en)}</span></li>' for k, i, fr, en in status)

chain = [("GeoTerraChain QFS", "GeoTerraChain QFS"), ("GTCπ", "GTCπ"), ("GTCP", "GTCP"),
         (T("Émetteur", "Issuer") + f' <span class="mono">{ISSUER[:6]}…{ISSUER[-5:]}</span>', T("Émetteur", "Issuer")), ("Stellar Testnet", "Stellar Testnet")]
chain_html = "".join(f'<div class="cn"><span class="hx mono">{i + 1}</span><b>{a}</b></div>' for i, (a, _) in enumerate(chain))

steps = [
  ("Ouvrez le compte émetteur sur StellarExpert (bouton ci-dessous).", "Open the issuer account on StellarExpert (button below)."),
  ("Vérifiez que le jeton s'appelle GTCP et que son émetteur est exactement l'adresse affichée ici.", "Check that the token is called GTCP and that its issuer is exactly the address shown here."),
  ("Tout jeton « GTCP » ou « GTCπ » émis par une autre adresse n'est pas celui de GeoTerraChain QFS.", "Any “GTCP” or “GTCπ” token issued by another address is not the GeoTerraChain QFS token."),
]
steps_html = "".join(f"<li><span>{T(fr, en)}</span></li>" for fr, en in steps)

CSS = r"""
  .addr { display:flex; align-items:center; gap:8px; margin-top:8px; padding:10px 12px; border:1px solid rgba(232,200,114,.4); border-radius:14px; background:rgba(0,0,8,.55); }
  .addr code { flex:1; min-width:0; font-size:12.5px; line-height:1.5; color:var(--gold-2); overflow-wrap:anywhere; word-break:break-all; }
  .addr.old code { color:var(--muted); text-decoration:line-through; text-decoration-color:rgba(255,141,141,.6); }
  .cp { flex-shrink:0; display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 12px; border-radius:999px; border:1px solid var(--line); background:var(--glass); color:var(--text); font:700 12px 'Space Grotesk', sans-serif; cursor:pointer; }
  .cp .ci { width:16px; height:16px; border:0; background:none; }
  .cp .ci svg { width:15px; height:15px; }
  .lbl { font:600 10.5px 'JetBrains Mono', monospace; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); }
  .prm b.gold { color:var(--gold-2); }
  .prm b.muted2 { color:var(--violet-2); }
  ul.st { list-style:none; display:grid; gap:8px; }
  ul.st li { display:flex; gap:10px; align-items:flex-start; padding:11px 12px; border-radius:14px; font-size:14px; }
  ul.st li.ok { border:1px solid rgba(61,220,151,.35); background:rgba(61,220,151,.07); }
  ul.st li.wait { border:1px solid rgba(168,139,255,.35); background:rgba(123,92,214,.08); }
  ul.st .si { width:24px; height:24px; border-radius:50%; border:0; }
  ul.st li.ok .si { color:var(--green); background:rgba(61,220,151,.15); }
  ul.st li.wait .si { color:var(--violet-2); background:rgba(123,92,214,.18); }
  ul.st .si svg { width:14px; height:14px; }
  .chainv { display:grid; gap:0; justify-items:center; text-align:center; }
  .cn { position:relative; display:flex; flex-direction:column; align-items:center; gap:6px; padding-bottom:18px; }
  .cn:not(:last-child)::after { content:""; position:absolute; bottom:0; left:50%; width:2px; height:16px; background:linear-gradient(180deg, var(--gold-2), var(--violet-2)); opacity:.7; }
  .cn .hx { width:34px; height:34px; display:grid; place-items:center; clip-path:polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); background:linear-gradient(135deg, #FFF3C4, var(--gold-2) 50%, var(--gold-3)); color:#000008; font-weight:700; font-size:13px; }
  .cn b { font-size:15px; }
  .cn b .mono { font-size:12px; color:var(--gold-2); font-weight:500; }
  ol.how { list-style:none; counter-reset:h; display:grid; gap:8px; }
  ol.how li { counter-increment:h; display:flex; gap:12px; align-items:flex-start; padding:11px 12px; border:1px solid var(--line); border-radius:14px; background:rgba(0,0,8,.4); font-size:14px; }
  ol.how li::before { content:counter(h); flex-shrink:0; width:24px; height:24px; display:grid; place-items:center; border-radius:8px; font:700 12px 'JetBrains Mono', monospace; color:#000008; background:linear-gradient(135deg, #FFF3C4, var(--gold-2)); }
  .legacy { border-style:dashed; }
  .legacy .lrow + .lrow { margin-top:12px; }
  .legacy .pill-h { margin-bottom:10px; }
  .pill-h.ko { color:var(--red); border:1px solid rgba(255,141,141,.35); background:rgba(255,141,141,.08); }
  .toast { position:fixed; left:0; right:0; bottom:22px; margin:0 auto; width:fit-content; max-width:90vw; z-index:40; padding:10px 16px; border-radius:12px; background:rgba(10,30,22,.95); border:1px solid rgba(61,220,151,.45); color:#D8FFE9; font-size:13.5px; opacity:0; transform:translateY(12px); transition:all .25s; pointer-events:none; }
  .toast.on { opacity:1; transform:none; }
"""

TITLE = "Vérification GTCπ — GeoTerraChain QFS"
page = f'''<!DOCTYPE html>
<html lang="fr" data-lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#000008">
<title>{TITLE}</title>
<meta name="description" content="Identité officielle du jeton GTCπ (code GTCP) de GeoTerraChain QFS : émetteur déclaré sur Stellar Testnet, phase pilote.">
<meta property="og:title" content="GeoTerraChain QFS — Vérification GTCπ">
<meta property="og:description" content="Émetteur officiel du jeton GTCπ (GTCP) sur Stellar Testnet — projet indépendant, phase pilote.">
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
</head>
<body>
<header class="top">
  <div class="bar">
    <a class="brand" href="index.html">
      <img src="logo-160.webp" alt="GeoTerraChain QFS">
      <span><b>GeoTerraChain QFS</b><small>{T("Vérification GTCπ", "GTCπ verification")}</small></span>
    </a>
    <span class="badge">{T("PHASE PILOTE", "PILOT PHASE")}</span>
  </div>
  <div class="sub">
    <div class="lang" role="group" aria-label="Langue / Language"><span class="globe" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">{I["globe"]}</svg></span><button type="button" data-l="fr">FR</button><button type="button" data-l="en">EN</button></div>
    <span class="msep" aria-hidden="true"></span>
    <a href="index.html">{T("← Accueil", "← Home")}</a>
  </div>
</header>
<div class="ticker" aria-hidden="true"><div>{T(
  "GTCπ · CODE GTCP · <b>ÉMETTEUR OFFICIEL</b> · STELLAR TESTNET · PHASE PILOTE · MAINNET NON DÉPLOYÉ ·&nbsp; GTCπ · CODE GTCP · <b>ÉMETTEUR OFFICIEL</b> · STELLAR TESTNET · PHASE PILOTE · MAINNET NON DÉPLOYÉ ·&nbsp;",
  "GTCπ · CODE GTCP · <b>OFFICIAL ISSUER</b> · STELLAR TESTNET · PILOT PHASE · MAINNET NOT DEPLOYED ·&nbsp; GTCπ · CODE GTCP · <b>OFFICIAL ISSUER</b> · STELLAR TESTNET · PILOT PHASE · MAINNET NOT DEPLOYED ·&nbsp;")}</div></div>

<main>
  <section class="hero" id="haut">
    <span class="eyebrow"><i></i>{T("Identité officielle du jeton", "Official token identity")}</span>
    <h1>{T("GTCπ <em>vérifiable</em>", "GTCπ, <em>verifiable</em>")}</h1>
    <p class="tagline">{T("UN SEUL ÉMETTEUR · UNE SEULE ADRESSE", "ONE ISSUER · ONE ADDRESS")}</p>
    <p class="lead">{T("Cette page indique la seule adresse autorisée à émettre le jeton GTCπ (code GTCP) de GeoTerraChain QFS. Chacun peut la vérifier publiquement sur la blockchain Stellar.",
                       "This page shows the only address authorised to issue the GeoTerraChain QFS GTCπ token (code GTCP). Anyone can check it publicly on the Stellar blockchain.")}</p>
  </section>

  <section class="block">
    {sec_head("01", "shield", "Émetteur officiel", "Official issuer", "Adresse publique du compte émetteur sur Stellar Testnet.", "Public address of the issuer account on Stellar Testnet.")}
    <div class="glass">
      <span class="lbl">{T("Adresse de l'émetteur (Issuer)", "Issuer address")}</span>
      {addr_block(ISSUER)}
      <div class="cta" style="justify-content:flex-start">
        <a class="btn btn-gold" href="{EXPLORER}" target="_blank" rel="noopener">{ic("ext")}{T("Voir sur StellarExpert", "View on StellarExpert")}</a>
      </div>
    </div>
  </section>

  <section class="block">
    {sec_head("02", "spark", "Fiche d'identité", "Identity card")}
    <div class="cols c2">
      <div class="glass"><div class="prms">{ident_html}</div></div>
      <div class="glass"><ul class="st">{status_html}</ul></div>
    </div>
  </section>

  <section class="block">
    {sec_head("03", "link", "Chaîne de confiance", "Chain of trust")}
    <div class="glass"><div class="chainv">{chain_html}</div></div>
  </section>

  <section class="block">
    {sec_head("04", "check", "Comment vérifier", "How to verify")}
    <ol class="how">{steps_html}</ol>
  </section>

  <section class="block">
    {sec_head("05", "archive", "Émetteurs antérieurs abandonnés", "Former, abandoned issuers", "Testnet uniquement — ne pas utiliser comme référence.", "Testnet only — do not use as a reference.")}
    <div class="glass legacy">
      <span class="pill-h ko">{T("Historique · non valides", "History · not valid")}</span>
      <p class="fine" style="margin:0 0 12px">{T("Deux adresses ont été abandonnées pendant la mise en place du système : la première après la perte de sa clé de contrôle, la seconde après une erreur de saisie de sa clé secrète. Aucune n'est utilisée par GeoTerraChain QFS.",
        "Two addresses were abandoned while the system was being set up: the first after its control key was lost, the second after its secret key was mistyped. Neither is used by GeoTerraChain QFS.")}</p>
      <div class="lrow"><span class="lbl">{T("1ʳᵉ adresse (clé perdue)", "1st address (key lost)")}</span>{addr_block(LEGACY1, "old")}</div>
      <div class="lrow"><span class="lbl">{T("2ᵉ adresse (clé mal saisie)", "2nd address (key mistyped)")}</span>{addr_block(LEGACY2, "old")}</div>
    </div>
    <div class="cta">
      <a class="btn" href="litepaper.html">{ic("chart")}{T("Litepaper", "Litepaper (FR)")}</a>
      <a class="btn" href="guide.html">{ic("book")}{T("Guide", "Guide")}</a>
      <a class="btn" href="index.html">{ic("home")}{T("Accueil", "Home")}</a>
    </div>
    <p class="note">{T("Projet indépendant · Phase pilote. Le jeton de test GTCπ n'a aucune valeur, ne s'échange pas et ne représente aucun droit sur un actif. Cette page atteste d'une déclaration de projet sur Stellar Testnet : elle ne constitue ni une reconnaissance juridique ni un titre foncier. GeoTerraChain QFS ne vous demandera jamais votre phrase secrète de 24 mots.",
      "Independent project · Pilot phase. The GTCπ test token has no value, cannot be traded and represents no right over any asset. This page records a project declaration on Stellar Testnet: it is neither a legal recognition nor a land title. GeoTerraChain QFS will never ask for your 24-word secret phrase.")}</p>
  </section>
</main>
<footer><b>GeoTerraChain QFS</b><br>{T("Développé par @Hilaila · Côte d'Ivoire · UEMOA · 2026", "Built by @Hilaila · Côte d'Ivoire · WAEMU · 2026")}</footer>
<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script>
(function () {{
  var root = document.documentElement;
  var MSG = {{ fr: {{ ok: "Adresse copiée ✓", ko: "Copie impossible : sélectionnez l'adresse à la main." }}, en: {{ ok: "Address copied ✓", ko: "Copy failed: select the address manually." }} }};
  function lang() {{ return root.getAttribute("data-lang") === "en" ? "en" : "fr"; }}
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
  setLang(lang());
  var t = null;
  function toast(m) {{ var el = document.getElementById("toast"); el.textContent = m; el.classList.add("on"); clearTimeout(t); t = setTimeout(function () {{ el.classList.remove("on"); }}, 2200); }}
  function fallback(v) {{
    try {{ var ta = document.createElement("textarea"); ta.value = v; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); var ok = document.execCommand("copy"); document.body.removeChild(ta); return ok; }} catch (e) {{ return false; }}
  }}
  document.addEventListener("click", function (e) {{
    var b = e.target.closest ? e.target.closest("button[data-copy]") : null; if (!b) return;
    var v = b.getAttribute("data-copy");
    var done = function () {{ toast(MSG[lang()].ok); }}, fail = function () {{ toast(fallback(v) ? MSG[lang()].ok : MSG[lang()].ko); }};
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, fail); else fail();
  }});
}})();
</script>
</body>
</html>
'''
open(OUT, "w", encoding="utf-8").write(page)
print("ok", len(page))
