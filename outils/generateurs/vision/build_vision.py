# Génère la page Vision premium Web3 (FR/EN) de GeoTerraChain QFS.
# Usage : python3 build_vision.py <fichier_sortie.html>
import sys, html

OUT = sys.argv[1]

def L(fr, en, tag="span", cls=""):
    c = f' class="{cls}"' if cls else ""
    return f'<{tag} class="fr{(" " + cls) if cls else ""}">{fr}</{tag}><{tag} class="en{(" " + cls) if cls else ""}">{en}</{tag}>'

def T(fr, en):
    """Texte court bilingue (deux spans). Espaces insécables avant : ; ? ! en français."""
    for p in (" :", " ;", " ?", " !"):
        fr = fr.replace(p, "&nbsp;" + p[1])
    return f'<span class="fr">{fr}</span><span class="en">{en}</span>'

# ---------- Icônes (traits fins, couleur courante) ----------
I = {
  "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9M12 3C9.4 5.6 8.1 8.6 8.1 12s1.3 6.4 3.9 9"/>',
  "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  "compass": '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  "cube": '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M21 7l-9 5-9-5"/>',
  "layers": '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5" opacity=".5"/>',
  "pi": '<path d="M5 7h14M9 7v11M15 7v8.5c0 1.5.8 2.5 2.2 2.5"/>',
  "shield": '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  "chart": '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  "rocket": '<path d="M12 15l-3-3c1.5-4.5 4.5-8 10-9-1 5.5-4.5 8.5-9 10z"/><path d="M9 12l-4 1-2 3 4 1M12 15l-1 4 3 2 1-4"/><circle cx="15" cy="9" r="1.4"/>',
  "leaf": '<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19c3-4 6-7 10-9"/>',
  "building": '<path d="M4 21V5l8-3v19M12 21h8V9l-8-3"/><path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/>',
  "landmark": '<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/>',
  "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  "map": '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  "link": '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  "check": '<path d="M5 12.5l4.5 4.5L19 7"/>',
  "flame": '<path d="M12 22c4 0 7-2.8 7-6.8 0-4.2-3.3-6.7-4.6-10.2-.3 2.5-1.6 4-3 4.5C11.6 7 11 4.5 9 2c.4 3.3-4 6.3-4 12.2C5 19.2 8 22 12 22z"/>',
  "spark": '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  "play": '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>',
  "book": '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7M8 11h7"/>',
  "home": '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  "cart": '<path d="M3 4h2.5l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L21 8H6.3"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17.5" cy="19.5" r="1.4"/>',
}
def ic(name, cls="ic"):
    return f'<span class="{cls}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{I[name]}</svg></span>'

def sec_head(num, icon, fr, en, sfr="", sen=""):
    sub = f'<p class="sh-sub">{T(sfr, sen)}</p>' if sfr else ""
    return f'''<div class="sh">{ic(icon, "sh-ic")}<div><small class="mono">{num}</small><h2>{T(fr, en)}</h2>{sub}</div></div>'''

def bullets(items, cls="dots"):
    return f'<ul class="{cls}">' + "".join(f"<li>{T(fr, en)}</li>" for fr, en in items) + "</ul>"

# ======================= CONTENU =======================
nav = [("presentation", "Présentation", "Overview"), ("vision", "Vision", "Vision"), ("actifs", "Actifs", "Assets"),
       ("tokenisation", "Tokenisation", "Tokenization"), ("architecture", "Architecture", "Architecture"),
       ("gtcpi", "GTCπ", "GTCπ"), ("securite", "Sécurité", "Security"), ("impact", "Impact", "Impact")]

chips = [("globe", "Panafricain", "Pan-African"), ("link", "Blockchain", "Blockchain"), ("pi", "Pi Network", "Pi Network"),
         ("cube", "Web3", "Web3"), ("map", "SIG · GPS", "GIS · GPS"), ("shield", "KYC Pi", "Pi KYC"), ("spark", "GTCπ", "GTCπ")]

stats = [("8", "pays de l'UEMOA", "WAEMU countries"), ("14", "classes d'actifs", "asset classes"),
         ("3 141 592", "GTCπ · offre maximale", "GTCπ · max supply"), (T("0,5 %", "0.5%"), "burn par tokenisation", "burn per tokenization")]

agro = [("Cultures vivrières", "Food crops", "Maïs, riz, manioc, igname, plantain", "Maize, rice, cassava, yam, plantain"),
        ("Cultures de rente", "Cash crops", "Cacao, café, hévéa, palmier, anacarde", "Cocoa, coffee, rubber, oil palm, cashew"),
        ("Élevage et pastoralisme", "Livestock & pastoralism", "Bovins, ovins, caprins, volaille", "Cattle, sheep, goats, poultry"),
        ("Aquaculture et pisciculture", "Aquaculture & fish farming", "Bassins, étangs, fermes aquatiques", "Ponds, tanks, aquatic farms"),
        ("Raniculture", "Frog farming (raniculture)", "Élevage de grenouilles : bassins, écloseries, transformation", "Frog rearing: ponds, hatcheries, processing", "phare", "marketplace.html?cat=rani"),
        ("Myciculture (fongiculture)", "Mushroom farming (fungiculture)", "Champignons comestibles, dont la volvaire (Volvariella volvacea), champignon local africain", "Edible mushrooms, including the paddy-straw mushroom (Volvariella volvacea), a local African species", "phare", "marketplace.html?cat=myci"),
        ("Maraîchage et horticulture", "Market gardening & horticulture", "Légumes, fruits, fleurs", "Vegetables, fruits, flowers"),
        ("Agroforesterie et sylviculture", "Agroforestry & forestry", "Forêts gérées, plantations mixtes", "Managed forests, mixed plantations")]
immo = [("Terrains urbains", "Urban land", "Lots constructibles en zone urbaine", "Buildable plots in urban areas"),
        ("Terrains ruraux", "Rural land", "Parcelles périurbaines et rurales", "Peri-urban and rural plots"),
        ("Résidences", "Residences", "Villas, appartements, logements", "Villas, apartments, housing"),
        ("Immeubles commerciaux", "Commercial buildings", "Bureaux, centres commerciaux", "Offices, shopping centres"),
        ("Infrastructures industrielles", "Industrial infrastructure", "Usines, entrepôts, zones industrielles", "Factories, warehouses, industrial zones"),
        ("Complexes touristiques", "Tourism complexes", "Hôtels, resorts, sites écotouristiques", "Hotels, resorts, eco-tourism sites")]

steps = [
  ("user", "Authentification & KYC", "Sign-in & KYC",
   "Connexion avec Pi Network (Pi SDK 2.0). Seuls les Pioneers dont le KYC est validé par Pi Network accèdent à la tokenisation. L'application ne demande ni document d'identité, ni phrase secrète.",
   "Sign-in with Pi Network (Pi SDK 2.0). Only Pioneers whose KYC is validated by Pi Network can tokenize. The app never asks for an ID document or the secret phrase.",
   [("KYC Pi Network", "Pi Network KYC"), ("Pi SDK 2.0", "Pi SDK 2.0"), ("Identité vérifiée", "Verified identity")]),
  ("shield", "Vérification de l'actif", "Asset verification",
   "Contrôles administratifs et techniques : documents, foncier, cadastre, propriété, GPS, SIG, superficie, cohérence territoriale et prévention de la fraude.",
   "Administrative and technical checks: documents, land records, cadastre, ownership, GPS, GIS, area, territorial consistency and fraud prevention.",
   [("GPS", "GPS"), ("SIG", "GIS"), ("Anti-fraude", "Anti-fraud")]),
  ("spark", "Émission du jeton GTCπ", "GTCπ token issuance",
   "Une fois le dossier vérifié, émission du jeton GTCπ (code GTCP) lié à la demande : référence unique, empreinte cryptographique des documents et référence de transaction.",
   "Once the file is verified, the GTCπ token (code GTCP) is issued for the request: unique reference, cryptographic fingerprint of the documents and transaction reference.",
   [("Jeton GTCπ", "GTCπ token"), ("Empreinte crypto", "Crypto fingerprint"), ("Référence unique", "Unique reference")]),
  ("link", "Enregistrement on-chain", "On-chain record",
   "Enregistrement des références vérifiées sur le réseau blockchain retenu par l'architecture du projet, avec traçabilité et vérification.",
   "Verified references are recorded on the blockchain network chosen by the project's architecture, with traceability and verification.",
   [("Traçable", "Traceable"), ("Vérifiable", "Verifiable"), ("Audit", "Audit")]),
]

layers = [
  ("user", "Couche utilisateur", "User layer", [("Application web progressive", "Progressive web app"), ("Pi Browser", "Pi Browser"), ("Portail Web3", "Web3 portal"), ("Marketplace numérique", "Digital marketplace")]),
  ("map", "Couche cartographique", "Mapping layer", [("SIG professionnel", "Professional GIS"), ("GPS du téléphone et GPS de précision", "Phone GPS and precision GPS"), ("OpenStreetMap", "OpenStreetMap"), ("Mapbox", "Mapbox")]),
  ("link", "Couche blockchain", "Blockchain layer", [("Pi Network · Pi SDK 2.0", "Pi Network · Pi SDK 2.0"), ("Registre distribué (Stellar)", "Distributed ledger (Stellar)"), ("Jeton GTCπ (GTCP)", "GTCπ token (GTCP)"), ("Actifs numériques adossés", "Asset-backed digital tokens")]),
]

params = [("Nom", "Name", "GeoTerraChain Token"), ("Symbole", "Symbol", "GTCπ"), ("Code on-chain", "On-chain code", "GTCP"),
          ("Offre maximale", "Maximum supply", "3 141 592 GTCπ"), ("Prix de référence", "Reference price", "1 GTCπ = 1 π"),
          ("Burn par tokenisation", "Burn per tokenization", T("0,5 %", "0.5%"))]
utilities = [("Paiement des services de tokenisation", "Payment for tokenization services"), ("Frais de transaction de la marketplace", "Marketplace transaction fees"),
             ("Récompenses communautaires", "Community rewards"), ("Gouvernance participative", "Participatory governance"),
             ("Financement territorial", "Territorial financing"), ("Accès aux services premium", "Access to premium services")]

security = [("Authentification Pi Network", "Pi Network authentication"), ("KYC validé par Pi Network", "KYC validated by Pi Network"),
            ("Signature cryptographique des transactions", "Cryptographic transaction signing"), ("Journal d'audit des actions", "Audit log of actions"),
            ("Traçabilité des dossiers", "File traceability"), ("Phrase secrète jamais demandée", "Secret phrase never requested")]
compliance = [("KYC — connaissance du client", "KYC — know your customer"), ("AML — lutte contre le blanchiment", "AML — anti-money laundering"),
              ("Protection des données personnelles", "Personal data protection"), ("Réglementations foncières et numériques applicables", "Applicable land and digital regulations")]

cases = [
  ("leaf", "Agriculture", "Agriculture", "Plantation de cacao", "Cocoa plantation",
   [("Sécurisation de la propriété", "Securing ownership"), ("Valorisation économique", "Economic value"), ("Financement participatif", "Crowdfunding"), ("Suivi de production", "Production tracking")]),
  ("building", "Immobilier", "Real estate", "Projet résidentiel", "Residential project",
   [("Fractionnement d'actifs", "Asset fractioning"), ("Investissement collectif", "Collective investment"), ("Gestion transparente", "Transparent management"), ("Traçabilité des droits", "Rights traceability")]),
  ("landmark", "Collectivités", "Local authorities", "Gestion du territoire", "Territorial management",
   [("Cadastre numérique", "Digital cadastre"), ("Cartographie intelligente", "Smart mapping"), ("Planification urbaine", "Urban planning"), ("Gestion des ressources", "Resource management")]),
]
impacts = [
  ("chart", "Économiques", "Economic", [("Création de valeur foncière", "Land value creation"), ("Inclusion financière", "Financial inclusion"), ("Attraction des investisseurs", "Attracting investors")]),
  ("user", "Sociaux", "Social", [("Réduction des conflits fonciers", "Fewer land disputes"), ("Renforcement de la confiance", "Stronger trust"), ("Autonomisation des communautés", "Community empowerment")]),
  ("cube", "Technologiques", "Technological", [("Modernisation territoriale", "Territorial modernisation"), ("Transformation numérique", "Digital transformation"), ("Développement du Web3 africain", "Growth of African Web3")]),
]
longterm = [("Une référence en registre foncier numérique panafricain", "A reference in pan-African digital land registry"),
            ("Une référence africaine en intelligence territoriale", "An African reference in territorial intelligence"),
            ("Une plateforme de tokenisation d'actifs réels", "A real-world asset tokenization platform"),
            ("Un hub de financement territorial Web3", "A Web3 territorial financing hub"),
            ("Une infrastructure pour États et investisseurs", "An infrastructure for states and investors"),
            ("Un moteur de développement durable et inclusif", "A driver of sustainable, inclusive development")]

# ======================= GABARIT =======================
def tiles(items):
    out = []
    for i, it in enumerate(items, 1):
        tfr, ten, dfr, den = it[:4]
        star = len(it) > 4 and it[4] == "phare"
        tag = f'<span class="star-tag mono">{T("★ Filière phare", "★ Flagship")}</span>' if star else ""
        href = it[5] if len(it) > 5 else ""
        link = f'<a class="mlink" href="{href}">{ic("cart")}{T("Marketplace", "Marketplace")}</a>' if href else ""
        out.append(f'<div class="asset{" star" if star else ""}"><div class="nrow"><span class="n mono">{i:02d}</span>{tag}</div><b>{T(tfr, ten)}</b><span>{T(dfr, den)}</span>{link}</div>')
    return "".join(out)

steps_html = "".join(
  f'''<li class="step{' hot' if i == 3 else ''}">
      <div class="node"><span class="mono">{i}</span></div>
      <div class="card glass">
        <div class="step-h">{ic(icn)}<h3>{T(tfr, ten)}</h3></div>
        <p>{T(dfr, den)}</p>
        <div class="tags">{"".join(f'<span class="tag">{T(a, b)}</span>' for a, b in tags)}</div>
      </div>
    </li>''' for i, (icn, tfr, ten, dfr, den, tags) in enumerate(steps, 1))

layers_html = "".join(
  f'''<div class="layer l{i}">
      <div class="layer-h">{ic(icn)}<h3>{T(tfr, ten)}</h3><span class="mono lvl">L{i}</span></div>
      <div class="tags">{"".join(f'<span class="tag">{T(a, b)}</span>' for a, b in items)}</div>
    </div>''' for i, (icn, tfr, ten, items) in enumerate(layers, 1))

params_html = "".join(f'<div class="prm"><span>{T(a, b)}</span><b class="mono">{v}</b></div>' for a, b, v in params)

cases_html = "".join(
  f'''<div class="case glass">
      <div class="case-h">{ic(icn)}<div><small class="mono">{T(kfr, ken)}</small><h3>{T(tfr, ten)}</h3></div></div>
      {bullets(items)}
    </div>''' for icn, kfr, ken, tfr, ten, items in cases)

impacts_html = "".join(
  f'''<div class="imp">{ic(icn)}<h3>{T("Impacts " + fr.lower(), en + " impact")}</h3>{bullets(items)}</div>''' for icn, fr, en, items in impacts)

page = f'''<!DOCTYPE html>
<html lang="fr" data-lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#000008">
<title>Vision — GeoTerraChain QFS</title>
<meta name="description" content="GeoTerraChain QFS — vision et résumé exécutif : infrastructure panafricaine de tokenisation foncière, agrobusiness et immobilier, en phase pilote.">
<meta property="og:title" content="GeoTerraChain QFS — Vision">
<meta property="og:description" content="Notre Terre · Notre Richesse. Infrastructure panafricaine de tokenisation des actifs réels — projet indépendant, phase pilote.">
<meta property="og:image" content="https://hilaila.github.io/videos/apercu-lien.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"></noscript>
<script>
  // Langue : même réglage que le reste du site (localStorage gtcLang).
  (function () {{
    var l = null;
    try {{ l = localStorage.getItem("gtcLang"); }} catch (e) {{}}
    if (l !== "fr" && l !== "en") l = (navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
    document.documentElement.setAttribute("data-lang", l);
    document.documentElement.lang = l;
  }})();
</script>
<style>
  :root {{
    --bg:#000008; --gold:#C9A84C; --gold-2:#E8C872; --gold-3:#8B6914;
    --text:#E8E2D4; --muted:#9A9384; --line:rgba(201,168,76,.18);
    --glass:rgba(255,255,255,.035); --green:#3DDC97; --violet:#7B5CD6; --violet-2:#A88BFF; --red:#FF8D8D;
    --shine:linear-gradient(100deg, #A87A14 0%, #F6D978 28%, #FFF5CF 42%, #E2B33A 58%, #B8871A 100%);
  }}
  [data-lang="fr"] .en, [data-lang="en"] .fr {{ display:none !important; }}
  * {{ box-sizing:border-box; margin:0; padding:0; }}
  html {{ -webkit-text-size-adjust:100%; scroll-behavior:smooth; scroll-padding-top:150px; }}
  body {{
    background:var(--bg); color:var(--text); font-family:'Space Grotesk', system-ui, sans-serif; line-height:1.6; font-size:15px; min-height:100vh; overflow-x:hidden;
    background-image:
      radial-gradient(ellipse 60% 40% at 15% 0%, rgba(201,168,76,.14), transparent 70%),
      radial-gradient(ellipse 50% 35% at 100% 25%, rgba(123,92,214,.16), transparent 70%),
      radial-gradient(ellipse 60% 40% at 0% 100%, rgba(201,168,76,.08), transparent 70%);
    background-attachment:fixed;
  }}
  body::before {{ content:""; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.35;
    background-image:linear-gradient(rgba(201,168,76,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,.05) 1px, transparent 1px);
    background-size:44px 44px; mask-image:radial-gradient(ellipse 80% 60% at 50% 20%, #000 30%, transparent 75%); -webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 20%, #000 30%, transparent 75%); }}
  header, main, footer, .ticker {{ position:relative; z-index:1; }}
  a {{ color:var(--gold-2); text-decoration:none; }}
  .mono {{ font-family:'JetBrains Mono', ui-monospace, monospace; }}

  /* ---------- En-tête ---------- */
  .top {{ position:sticky; top:0; z-index:20; background:rgba(0,0,8,.78); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border-bottom:1px solid var(--line); }}
  .top::after {{ content:""; position:absolute; left:0; right:0; bottom:-1px; height:1px; background:linear-gradient(90deg, transparent, var(--gold), transparent); }}
  .bar {{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 16px; max-width:1040px; margin:0 auto; }}
  .brand {{ display:flex; align-items:center; gap:10px; color:var(--text); min-width:0; }}
  .brand img {{ width:40px; height:40px; border-radius:50%; object-fit:cover; border:1.5px solid var(--gold); box-shadow:0 0 18px rgba(201,168,76,.25); flex-shrink:0; }}
  .brand b {{ display:block; font-family:'Playfair Display', Georgia, serif; font-size:17px; color:var(--gold-2); font-weight:700; line-height:1.15; white-space:nowrap; }}
  .brand small {{ display:block; font-size:10px; letter-spacing:.2em; color:var(--muted); text-transform:uppercase; }}
  .badge {{ flex-shrink:0; font:700 10px 'JetBrains Mono', monospace; letter-spacing:.12em; color:var(--violet-2); border:1px solid rgba(168,139,255,.45); background:rgba(123,92,214,.12); border-radius:999px; padding:5px 10px; }}
  .sub {{ display:flex; align-items:center; gap:8px; padding:2px 16px 10px; max-width:1040px; margin:0 auto; }}
  .lang {{ display:flex; align-items:center; flex-shrink:0; gap:2px; padding:3px; border:1.5px solid var(--gold-2); border-radius:999px; background:rgba(232,200,114,.10); box-shadow:0 0 14px rgba(232,200,114,.35); }}
  .lang .globe {{ display:grid; place-items:center; width:24px; color:var(--gold-2); padding-left:3px; }}
  .lang .globe svg {{ width:17px; height:17px; }}
  .lang button {{ border:0; border-radius:999px; background:transparent; color:#D9CFB4; font:700 12.5px 'JetBrains Mono', monospace; letter-spacing:.06em; padding:6px 10px; min-width:38px; cursor:pointer; }}
  .lang button.on {{ background:linear-gradient(120deg, #F4E7C1, var(--gold-2)); color:#000008; box-shadow:0 0 10px rgba(232,200,114,.5); }}
  .msep {{ flex-shrink:0; width:1px; align-self:stretch; margin:4px 2px; background:linear-gradient(180deg, transparent, rgba(232,200,114,.6), transparent); }}
  .sub > a {{ font-size:13.5px; color:var(--text); padding:6px 12px; border:1px solid var(--line); border-radius:999px; background:var(--glass); white-space:nowrap; }}
  .nav {{ display:flex; gap:6px; overflow-x:auto; padding:0 16px 10px; max-width:1040px; margin:0 auto; scrollbar-width:none; }}
  .nav::-webkit-scrollbar {{ display:none; }}
  .nav a {{ flex-shrink:0; font:600 12px 'JetBrains Mono', monospace; letter-spacing:.06em; color:#CFC6B2; padding:6px 12px; border:1px solid var(--line); border-radius:999px; background:rgba(0,0,8,.4); transition:all .2s; }}
  .nav a.on {{ color:#000008; background:linear-gradient(120deg, #F4E7C1, var(--gold-2)); border-color:transparent; box-shadow:0 0 12px rgba(232,200,114,.4); }}
  .ticker {{ overflow:hidden; border-bottom:1px solid var(--line); background:rgba(201,168,76,.03); }}
  .ticker div {{ display:inline-block; white-space:nowrap; padding:8px 0; font-family:'JetBrains Mono', monospace; font-size:12px; color:var(--gold); letter-spacing:.08em; animation:defile 38s linear infinite; }}
  .ticker b {{ color:var(--green); font-weight:500; }}
  @keyframes defile {{ from {{ transform:translateX(0); }} to {{ transform:translateX(-50%); }} }}

  main {{ max-width:1040px; margin:0 auto; padding:18px 16px 0; }}

  /* ---------- Héros ---------- */
  .hero {{ position:relative; overflow:hidden; padding:26px 20px 24px; border:1px solid var(--line); border-radius:28px; background:linear-gradient(135deg, rgba(201,168,76,.13), rgba(123,92,214,.09) 60%, rgba(255,255,255,.02)); text-align:center; }}
  .hero::after {{ content:""; position:absolute; width:300px; height:300px; right:-130px; top:-140px; border-radius:50%; background:radial-gradient(circle, rgba(232,200,114,.22), transparent 65%); pointer-events:none; }}
  .emblem {{ position:relative; width:min(230px, 64vw); aspect-ratio:1; margin:2px auto 10px; }}
  .emblem svg {{ position:absolute; inset:0; width:100%; height:100%; overflow:visible; }}
  .emblem img {{ position:absolute; left:50%; top:50%; width:54%; height:54%; transform:translate(-50%, -50%); border-radius:50%; object-fit:cover; border:1.5px solid rgba(232,200,114,.6); box-shadow:0 0 40px rgba(232,200,114,.35); }}
  .ring {{ transform-origin:50% 50%; animation:tourne 30s linear infinite; }}
  .ring2 {{ transform-origin:50% 50%; animation:tourne 46s linear infinite reverse; }}
  @keyframes tourne {{ to {{ transform:rotate(360deg); }} }}
  .eyebrow {{ display:inline-flex; align-items:center; gap:8px; font:500 11px 'JetBrains Mono', monospace; letter-spacing:.14em; text-transform:uppercase; color:var(--gold-2); border:1px solid var(--line); border-radius:999px; padding:6px 12px; background:rgba(0,0,8,.4); }}
  .eyebrow i {{ width:7px; height:7px; border-radius:50%; background:var(--green); box-shadow:0 0 10px var(--green); animation:pulse 1.8s ease-in-out infinite; }}
  @keyframes pulse {{ 50% {{ opacity:.35; }} }}
  .hero h1 {{ position:relative; z-index:1; margin-top:14px; font-family:'Playfair Display', Georgia, serif; font-size:clamp(34px, 10vw, 58px); line-height:1.02; font-weight:800; }}
  .hero h1 em, .shine {{ font-style:normal; background:var(--shine); background-size:260% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:brille 4s linear infinite; }}
  @keyframes brille {{ from {{ background-position:100% 0; }} to {{ background-position:-160% 0; }} }}
  .tagline {{ margin-top:8px; font:500 12px 'JetBrains Mono', monospace; letter-spacing:.22em; text-transform:uppercase; color:var(--gold-2); }}
  .hero p.lead {{ position:relative; z-index:1; margin:12px auto 0; color:#CFC6B2; font-size:15px; max-width:640px; }}
  .chips {{ display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-top:16px; position:relative; z-index:1; }}
  .chip {{ display:inline-flex; align-items:center; gap:6px; font:600 11.5px 'JetBrains Mono', monospace; letter-spacing:.05em; color:var(--text); padding:6px 11px; border:1px solid var(--line); border-radius:999px; background:rgba(0,0,8,.45); }}
  .chip .ic {{ width:15px; height:15px; color:var(--gold-2); }}
  .chip .ic svg {{ width:15px; height:15px; }}
  .stats {{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:14px 0 6px; }}
  @media (min-width:760px) {{ .stats {{ grid-template-columns:repeat(4, 1fr); }} }}
  .stat {{ position:relative; overflow:hidden; padding:14px; border:1px solid var(--line); border-radius:18px; background:var(--glass); }}
  .stat::before {{ content:""; position:absolute; left:0; right:0; top:0; height:2px; background:linear-gradient(90deg, transparent, var(--gold-2), transparent); opacity:.7; }}
  .stat b {{ display:block; font:700 clamp(20px, 6vw, 26px) 'JetBrains Mono', monospace; color:var(--gold-2); line-height:1.15; }}
  .stat span {{ display:block; margin-top:4px; font-size:12px; color:var(--muted); line-height:1.35; }}

  /* ---------- Sections ---------- */
  section.block {{ margin-top:30px; }}
  .sh {{ display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; }}
  .sh-ic {{ flex-shrink:0; width:44px; height:44px; display:grid; place-items:center; border-radius:14px; color:var(--gold-2); background:linear-gradient(135deg, rgba(232,200,114,.18), rgba(123,92,214,.12)); border:1px solid rgba(232,200,114,.35); box-shadow:0 0 18px rgba(201,168,76,.18); }}
  .sh-ic svg {{ width:22px; height:22px; }}
  .sh small {{ display:block; font-size:11px; letter-spacing:.18em; color:var(--muted); }}
  .sh h2 {{ font-family:'Playfair Display', Georgia, serif; font-size:clamp(23px, 6.4vw, 32px); line-height:1.15; color:var(--text); }}
  .sh-sub {{ margin-top:4px; font-size:13.5px; color:var(--muted); }}
  .glass {{ position:relative; border:1px solid var(--line); border-radius:20px; background:linear-gradient(160deg, rgba(255,255,255,.05), rgba(255,255,255,.015)); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); padding:18px; }}
  .glass + .glass {{ margin-top:12px; }}
  .lead2 {{ font-size:15.5px; color:#DDD5C3; }}
  .lead2 b {{ color:var(--gold-2); font-weight:600; }}
  .cols {{ display:grid; gap:12px; }}
  @media (min-width:760px) {{ .cols.c2 {{ grid-template-columns:1fr 1fr; }} .cols.c3 {{ grid-template-columns:repeat(3, 1fr); }} }}
  .cols .glass + .glass {{ margin-top:0; }}
  .kv small {{ display:block; font:500 10.5px 'JetBrains Mono', monospace; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); }}
  .kv b {{ display:block; margin-top:4px; font-family:'Playfair Display', Georgia, serif; font-size:21px; color:var(--gold-2); }}
  .kv > span {{ display:block; font-size:12.5px; color:var(--muted); }}
  h3 {{ font-size:16px; font-weight:700; color:var(--text); line-height:1.3; }}
  .card-h {{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }}
  .ic {{ flex-shrink:0; width:34px; height:34px; display:grid; place-items:center; border-radius:10px; background:rgba(232,200,114,.10); border:1px solid var(--line); color:var(--gold-2); }}
  .ic svg {{ width:18px; height:18px; }}
  ul.dots {{ list-style:none; display:grid; gap:7px; }}
  ul.dots li {{ position:relative; padding-left:20px; font-size:14px; color:#DDD5C3; }}
  ul.dots li::before {{ content:""; position:absolute; left:2px; top:.62em; width:8px; height:8px; transform:rotate(45deg); background:linear-gradient(135deg, #FFF3C4, var(--gold)); box-shadow:0 0 8px rgba(232,200,114,.5); }}
  ul.checks {{ list-style:none; display:grid; gap:8px; }}
  ul.checks li {{ display:flex; gap:10px; align-items:flex-start; font-size:14px; }}
  ul.checks li i {{ flex-shrink:0; width:20px; height:20px; border-radius:50%; display:grid; place-items:center; margin-top:1px; font-style:normal; font-size:12px; font-weight:700; }}
  ul.checks.ok li i {{ background:rgba(61,220,151,.14); color:var(--green); border:1px solid rgba(61,220,151,.4); }}
  ul.checks.goal li i {{ background:rgba(168,139,255,.12); color:var(--violet-2); border:1px solid rgba(168,139,255,.4); }}
  .pill-h {{ display:inline-flex; align-items:center; gap:6px; margin-bottom:12px; font:600 11px 'JetBrains Mono', monospace; letter-spacing:.14em; text-transform:uppercase; padding:5px 10px; border-radius:999px; }}
  .pill-h.ok {{ color:var(--green); border:1px solid rgba(61,220,151,.35); background:rgba(61,220,151,.08); }}
  .pill-h.goal {{ color:var(--violet-2); border:1px solid rgba(168,139,255,.35); background:rgba(123,92,214,.10); }}

  /* Actifs */
  .sector {{ display:flex; align-items:center; gap:10px; margin:4px 0 10px; }}
  .sector h3 {{ font-family:'Playfair Display', Georgia, serif; font-size:19px; color:var(--gold-2); }}
  .assets {{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }}
  @media (min-width:760px) {{ .assets {{ grid-template-columns:repeat(3, 1fr); }} }}
  .asset {{ position:relative; display:flex; flex-direction:column; gap:4px; padding:13px; border:1px solid var(--line); border-radius:16px; background:rgba(0,0,8,.42); overflow:hidden; }}
  .asset::after {{ content:""; position:absolute; right:-24px; top:-24px; width:70px; height:70px; border-radius:50%; background:radial-gradient(circle, rgba(232,200,114,.14), transparent 70%); }}
  .asset .n {{ font-size:11px; color:var(--gold); letter-spacing:.1em; }}
  .asset.star {{ border-color:rgba(232,200,114,.6); background:linear-gradient(160deg, rgba(232,200,114,.16), rgba(0,0,8,.45)); box-shadow:0 0 22px rgba(201,168,76,.16); }}
  .asset .nrow {{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:4px 6px; }}
  .asset .star-tag {{ position:relative; z-index:1; font-size:9.5px; font-weight:700; letter-spacing:.04em; color:#000008; background:linear-gradient(120deg, #F4E7C1, var(--gold-2)); border-radius:999px; padding:2px 7px; }}
  .asset b {{ font-size:14.5px; line-height:1.3; }}
  .asset .mlink {{ position:relative; z-index:1; align-self:stretch; display:inline-flex; align-items:center; justify-content:center; gap:5px; margin-top:auto; white-space:nowrap; min-height:36px; padding:0 8px; border-radius:999px; border:1px solid rgba(232,200,114,.55); background:rgba(232,200,114,.10); color:var(--gold-2); font:700 12.5px 'Space Grotesk', system-ui, sans-serif; text-decoration:none; }}
  .asset > span {{ margin-bottom:6px; }}
  .asset .mlink .ic {{ width:16px; height:16px; border:0; background:transparent; }}
  .asset .mlink .ic svg {{ width:14px; height:14px; }}
  .asset .mlink:hover, .asset .mlink:focus-visible {{ background:rgba(232,200,114,.2); }}
  .asset > span {{ font-size:12px; color:var(--muted); line-height:1.4; }}

  /* Processus */
  .steps {{ list-style:none; position:relative; display:grid; gap:12px; padding-left:46px; }}
  .steps::before {{ content:""; position:absolute; left:17px; top:10px; bottom:10px; width:2px; background:linear-gradient(180deg, var(--gold-2), var(--violet), var(--gold-2)); opacity:.55; }}
  .step {{ position:relative; }}
  .step .node {{ position:absolute; left:-46px; top:14px; width:36px; height:36px; display:grid; place-items:center; clip-path:polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); background:linear-gradient(135deg, #FFF3C4, var(--gold-2) 50%, var(--gold-3)); }}
  .step .node span {{ font-weight:700; font-size:14px; color:#000008; }}
  .step.hot .card {{ border-color:rgba(232,200,114,.55); background:linear-gradient(160deg, rgba(232,200,114,.14), rgba(123,92,214,.08)); box-shadow:0 0 30px rgba(201,168,76,.18); }}
  .step.hot .node {{ box-shadow:0 0 0 4px rgba(232,200,114,.2); animation:glow 2.4s ease-in-out infinite; }}
  @keyframes glow {{ 50% {{ filter:drop-shadow(0 0 10px rgba(232,200,114,.9)); }} }}
  .step-h {{ display:flex; align-items:center; gap:10px; margin-bottom:6px; }}
  .step p {{ font-size:14px; color:#D5CDBB; }}
  .tags {{ display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }}
  .tag {{ font:600 11px 'JetBrains Mono', monospace; letter-spacing:.04em; color:var(--gold-2); padding:4px 9px; border:1px solid var(--line); border-radius:999px; background:rgba(232,200,114,.06); }}

  /* Architecture */
  .stack {{ display:grid; gap:10px; }}
  .layer {{ position:relative; padding:16px; border-radius:18px; border:1px solid var(--line); background:linear-gradient(160deg, rgba(255,255,255,.05), rgba(255,255,255,.012)); }}
  .layer::before {{ content:""; position:absolute; left:16px; right:16px; bottom:-11px; height:10px; border-radius:0 0 14px 14px; border:1px solid var(--line); border-top:0; background:rgba(201,168,76,.04); }}
  .layer.l3::before {{ display:none; }}
  .layer.l1 {{ border-color:rgba(168,139,255,.38); }}
  .layer.l3 {{ border-color:rgba(232,200,114,.5); background:linear-gradient(160deg, rgba(232,200,114,.12), rgba(255,255,255,.015)); }}
  .layer-h {{ display:flex; align-items:center; gap:10px; }}
  .layer-h h3 {{ flex:1; }}
  .lvl {{ font-size:11px; color:var(--muted); letter-spacing:.12em; }}

  /* GTCπ */
  .supply {{ text-align:center; padding:22px 18px; }}
  .supply small {{ display:block; font:500 11px 'JetBrains Mono', monospace; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); }}
  .supply b {{ display:block; margin-top:6px; font:800 clamp(34px, 11vw, 54px)/1.05 'JetBrains Mono', monospace; }}
  .supply span {{ display:block; margin-top:4px; font-size:13px; color:var(--muted); }}
  .prms {{ display:grid; gap:0; }}
  .prm {{ display:flex; justify-content:space-between; gap:10px; padding:10px 0; border-bottom:1px solid rgba(201,168,76,.12); font-size:14px; }}
  .prm:last-child {{ border-bottom:0; }}
  .prm > span {{ color:var(--muted); }}
  .prm b {{ color:var(--gold-2); font-size:13.5px; text-align:right; }}
  .burn {{ display:grid; grid-template-columns:1fr auto 1fr auto 1fr; align-items:center; gap:6px; margin-top:12px; text-align:center; }}
  .burn div {{ padding:10px 6px; border:1px solid var(--line); border-radius:14px; background:rgba(0,0,8,.45); }}
  .burn div b {{ display:block; font:700 15px 'JetBrains Mono', monospace; }}
  .burn div span {{ display:block; font-size:11px; color:var(--muted); }}
  .burn .fire b {{ color:#FFB28A; }}
  .burn .net b {{ color:var(--green); }}
  .burn em {{ font-style:normal; color:var(--gold-2); font-weight:700; }}
  .util {{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }}
  .util div {{ display:flex; gap:8px; align-items:flex-start; padding:10px; border:1px solid var(--line); border-radius:12px; background:rgba(0,0,8,.4); font-size:13px; line-height:1.35; }}
  .util div i {{ flex-shrink:0; font-style:normal; color:var(--gold-2); font-weight:700; }}
  .fine {{ margin-top:12px; font-size:12.5px; color:var(--muted); }}

  /* Impact */
  .case-h {{ display:flex; align-items:center; gap:10px; margin-bottom:12px; }}
  .case-h small {{ display:block; font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--gold); }}
  .imp {{ padding:16px; border:1px solid var(--line); border-radius:18px; background:rgba(0,0,8,.4); }}
  .imp h3 {{ margin:10px 0 10px; }}

  /* Vision long terme + conclusion */
  .goals {{ list-style:none; display:grid; gap:8px; counter-reset:g; }}
  .goals li {{ counter-increment:g; display:flex; gap:12px; align-items:center; padding:12px 14px; border:1px solid var(--line); border-radius:14px; background:rgba(0,0,8,.4); font-size:14.5px; }}
  .goals li::before {{ content:counter(g, decimal-leading-zero); font:700 12px 'JetBrains Mono', monospace; color:#000008; background:linear-gradient(135deg, #FFF3C4, var(--gold-2)); border-radius:8px; padding:4px 7px; }}
  .quote {{ margin-top:14px; text-align:center; padding:26px 20px; border-color:rgba(232,200,114,.4); background:linear-gradient(135deg, rgba(232,200,114,.12), rgba(123,92,214,.10)); }}
  .quote p {{ font-family:'Playfair Display', Georgia, serif; font-size:clamp(19px, 5.4vw, 26px); line-height:1.35; }}
  .quote small {{ display:block; margin-top:12px; font:500 11px 'JetBrains Mono', monospace; letter-spacing:.2em; color:var(--gold-2); }}
  .concl {{ font-size:14.5px; color:#D5CDBB; }}

  .cta {{ display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:18px; }}
  .btn {{ display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:46px; padding:0 18px; border-radius:999px; border:1px solid var(--line); background:var(--glass); color:var(--text); font:700 14px 'Space Grotesk', system-ui, sans-serif; }}
  .btn .ic {{ width:22px; height:22px; border:0; background:transparent; }}
  .btn .ic svg {{ width:18px; height:18px; }}
  .btn-gold {{ border:0; background:linear-gradient(120deg, #F4E7C1, var(--gold-2) 45%, var(--gold)); color:#000008; box-shadow:0 0 22px rgba(201,168,76,.35); }}
  .btn-gold .ic {{ color:#000008; }}
  .note {{ margin-top:22px; padding:14px 16px; border:1px dashed rgba(201,168,76,.35); border-radius:16px; font-size:12.5px; color:var(--muted); text-align:center; }}
  footer {{ max-width:1040px; margin:0 auto; padding:20px 16px 34px; text-align:center; font:500 11px/1.8 'JetBrains Mono', monospace; letter-spacing:.12em; color:var(--muted); }}
  footer b {{ color:var(--gold-2); font-weight:500; }}
  .totop {{ position:fixed; right:14px; bottom:16px; z-index:30; width:44px; height:44px; border-radius:50%; display:grid; place-items:center; color:#000008; background:linear-gradient(135deg, #FFF3C4, var(--gold-2)); box-shadow:0 0 18px rgba(201,168,76,.45); opacity:0; pointer-events:none; transition:opacity .25s; font-weight:700; }}
  .totop.on {{ opacity:1; pointer-events:auto; }}

  @media (prefers-reduced-motion: reduce) {{
    *, *::before, *::after {{ animation:none !important; transition:none !important; }}
    html {{ scroll-behavior:auto; }}
  }}
</style>
<script src="reseau.js"></script>
</head>
<body>
<header class="top">
  <div class="bar">
    <a class="brand" href="index.html">
      <img src="logo-160.webp" alt="GeoTerraChain QFS">
      <span><b>GeoTerraChain QFS</b><small>Vision · 2026</small></span>
    </a>
    <span class="badge">{T("PHASE PILOTE", "PILOT PHASE")}</span>
  </div>
  <div class="sub">
    <div class="lang" role="group" aria-label="Langue / Language"><span class="globe" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">{I["globe"]}</svg></span><button type="button" data-l="fr">FR</button><button type="button" data-l="en">EN</button></div>
    <span class="msep" aria-hidden="true"></span>
    <a href="index.html">{T("← Accueil", "← Home")}</a>
  </div>
  <nav class="nav" aria-label="Sections">{"".join(f'<a href="#{i}" data-s="{i}">{T(fr, en)}</a>' for i, fr, en in nav)}</nav>
</header>
<div class="ticker" aria-hidden="true"><div>{T(
  "VISION 2026 · NOTRE TERRE · NOTRE RICHESSE · <b>PHASE PILOTE</b> · UEMOA · AGROBUSINESS · IMMOBILIER · GTCπ · PI NETWORK ·&nbsp; VISION 2026 · NOTRE TERRE · NOTRE RICHESSE · <b>PHASE PILOTE</b> · UEMOA · AGROBUSINESS · IMMOBILIER · GTCπ · PI NETWORK ·&nbsp;",
  "VISION 2026 · OUR LAND · OUR WEALTH · <b>PILOT PHASE</b> · WAEMU · AGRIBUSINESS · REAL ESTATE · GTCπ · PI NETWORK ·&nbsp; VISION 2026 · OUR LAND · OUR WEALTH · <b>PILOT PHASE</b> · WAEMU · AGRIBUSINESS · REAL ESTATE · GTCπ · PI NETWORK ·&nbsp;")}</div></div>

<main>
  <section class="hero" id="presentation">
    <div class="emblem" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3C4"/><stop offset=".5" stop-color="#E8C872"/><stop offset="1" stop-color="#8B6914"/></linearGradient></defs>
        <g class="ring2"><circle cx="100" cy="100" r="97" fill="none" stroke="rgba(168,139,255,.35)" stroke-width="1" stroke-dasharray="2 7"/></g>
        <g class="ring">
          <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill="none" stroke="url(#g)" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="100" cy="10" r="4.5" fill="#E8C872"/><circle cx="178" cy="55" r="4.5" fill="#E8C872"/><circle cx="178" cy="145" r="4.5" fill="#E8C872"/>
          <circle cx="100" cy="190" r="4.5" fill="#E8C872"/><circle cx="22" cy="145" r="4.5" fill="#E8C872"/><circle cx="22" cy="55" r="4.5" fill="#E8C872"/>
        </g>
      </svg>
      <img src="logo-640.webp" alt="" decoding="async">
    </div>
    <span class="eyebrow"><i></i>{T("Document institutionnel · Vision 2026", "Institutional document · Vision 2026")}</span>
    <h1>GeoTerraChain <em>QFS</em></h1>
    <p class="tagline">{T("Notre Terre · Notre Richesse", "Our Land · Our Wealth")}</p>
    <p class="lead">{T(
      "Infrastructure panafricaine d'intelligence territoriale, d'agrobusiness intégré, de gestion foncière numérique et de promotion immobilière, sécurisée par la blockchain.",
      "A pan-African infrastructure for territorial intelligence, integrated agribusiness, digital land management and real estate development, secured by blockchain.")}</p>
    <div class="chips">{"".join(f'<span class="chip">{ic(i)}{T(fr, en)}</span>' for i, fr, en in chips)}</div>
  </section>

  <div class="stats">{"".join(f'<div class="stat"><b>{v.replace(",", ",") }</b><span>{T(fr, en)}</span></div>' for v, fr, en in stats)}</div>

  <section class="block">
    {sec_head("01", "target", "Présentation générale", "Overview")}
    <div class="glass"><p class="lead2">{T(
      "GeoTerraChain QFS est une <b>infrastructure numérique panafricaine</b> conçue pour moderniser la gestion foncière, l'agrobusiness, l'immobilier et le développement territorial grâce à la blockchain, au Web3, à l'intelligence territoriale, au SIG, au GPS et à l'identité numérique.",
      "GeoTerraChain QFS is a <b>pan-African digital infrastructure</b> designed to modernise land management, agribusiness, real estate and territorial development through blockchain, Web3, territorial intelligence, GIS, GPS and digital identity.")}</p></div>
    <div class="cols c3" style="margin-top:12px">
      <div class="glass kv"><small>{T("Fondateur", "Founder")}</small><b>@Hilaila</b><span>{T("Pioneer KYC vérifié · Côte d'Ivoire", "KYC-verified Pioneer · Côte d'Ivoire")}</span></div>
      <div class="glass kv"><small>{T("Réseau", "Network")}</small><b>Pi Network</b><span>{T("Pi SDK 2.0 · Stellar · phase pilote (Testnet)", "Pi SDK 2.0 · Stellar · pilot phase (Testnet)")}</span></div>
      <div class="glass kv"><small>{T("Zone cible", "Target area")}</small><b>{T("UEMOA · Afrique", "WAEMU · Africa")}</b><span>{T("8 pays · expansion continentale", "8 countries · continental expansion")}</span></div>
    </div>
  </section>

  <section class="block" id="vision">
    {sec_head("02", "compass", "Vision panafricaine", "Pan-African vision")}
    <div class="cols c2">
      <div class="glass"><div class="card-h">{ic("target")}<h3>{T("Notre ambition", "Our ambition")}</h3></div>
        <p class="sh-sub" style="margin:0 0 10px">{T("Construire une infrastructure panafricaine permettant :", "Build a pan-African infrastructure enabling:")}</p>
        {bullets([("La sécurisation des droits fonciers", "Secure land rights"), ("La digitalisation des territoires", "Digitised territories"),
                  ("La tokenisation des actifs agricoles et immobiliers", "Tokenization of agricultural and real estate assets"),
                  ("L'amélioration de la gouvernance territoriale", "Better territorial governance"),
                  ("Le financement participatif des projets de développement", "Crowdfunding of development projects"),
                  ("L'intégration de l'Afrique dans l'économie numérique mondiale", "Africa's integration into the global digital economy")])}
      </div>
      <div class="glass"><div class="card-h">{ic("rocket")}<h3>{T("Notre mission", "Our mission")}</h3></div>
        <p class="sh-sub" style="margin:0 0 10px">{T("Permettre aux citoyens, entreprises, investisseurs, collectivités et gouvernements de :", "Enable citizens, businesses, investors, local authorities and governments to:")}</p>
        {bullets([("Gérer numériquement leurs actifs fonciers et agro-pastoraux", "Manage their land and agro-pastoral assets digitally"), ("Sécuriser leurs droits de propriété", "Secure their property rights"),
                  ("Valoriser leurs terres, leurs actifs immobiliers et agro-pastoraux", "Add value to their land, real estate and agro-pastoral assets"),
                  ("Développer leurs filières agro-pastorales : élevage, pisciculture, raniculture, myciculture, cultures", "Grow their agro-pastoral sectors: livestock, fish farming, frog farming, mushroom farming, crops"),
                  ("Financer leurs projets via le Web3", "Finance their projects through Web3"),
                  ("Accéder à l'économie numérique internationale", "Access the international digital economy")])}
      </div>
    </div>
  </section>

  <section class="block" id="actifs">
    {sec_head("03", "layers", "Actifs éligibles à la tokenisation", "Assets eligible for tokenization", "14 classes d'actifs réels, en deux secteurs, dont deux filières phares : la raniculture et la myciculture.", "14 real-world asset classes, in two sectors, including two flagship sectors: frog farming and mushroom farming.")}
    <div class="glass">
      <div class="sector">{ic("leaf")}<h3>{T("Agrobusiness", "Agribusiness")}</h3></div>
      <div class="assets">{tiles(agro)}</div>
    </div>
    <div class="glass">
      <div class="sector">{ic("building")}<h3>{T("Immobilier", "Real estate")}</h3></div>
      <div class="assets">{tiles(immo)}</div>
    </div>
  </section>

  <section class="block" id="tokenisation">
    {sec_head("04", "spark", "Processus de tokenisation", "Tokenization process", "Quatre étapes, de la connexion Pi à l'enregistrement on-chain.", "Four steps, from Pi sign-in to the on-chain record.")}
    <ol class="steps">{steps_html}</ol>
  </section>

  <section class="block" id="architecture">
    {sec_head("05", "cube", "Architecture technologique", "Technology architecture", "Trois couches, de l'utilisateur au registre.", "Three layers, from the user to the ledger.")}
    <div class="stack">{layers_html}</div>
  </section>

  <section class="block" id="gtcpi">
    {sec_head("06", "pi", "Gouvernance économique du GTCπ", "GTCπ economic governance")}
    <div class="glass supply"><small>{T("Offre maximale", "Maximum supply")}</small><b class="shine">3 141 592</b><span>{T("jetons GTCπ — en référence au nombre π", "GTCπ tokens — a nod to the number π")}</span></div>
    <div class="cols c2" style="margin-top:12px">
      <div class="glass"><div class="card-h">{ic("chart")}<h3>{T("Paramètres du jeton", "Token parameters")}</h3></div><div class="prms">{params_html}</div></div>
      <div class="glass"><div class="card-h">{ic("flame")}<h3>{T("Burn de 0,5 % : exemple", "0.5% burn: example")}</h3></div>
        <p class="sh-sub" style="margin:0">{T("Pour une offre de 1 GTCπ :", "For an offer of 1 GTCπ:")}</p>
        <div class="burn">
          <div><b>1</b><span>{T("offre", "offer")}</span></div><em>−</em>
          <div class="fire"><b>{T("0,005", "0.005")}</b><span>{T("brûlé", "burned")}</span></div><em>=</em>
          <div class="net"><b>{T("0,995", "0.995")}</b><span>{T("net", "net")}</span></div>
        </div>
        <p class="fine">{T("Le burn est associé à chaque opération de tokenisation, sous réserve de son implémentation technique et de son cadre réglementaire.", "The burn applies to each tokenization operation, subject to its technical implementation and regulatory framework.")}</p>
      </div>
    </div>
    <div class="glass" style="margin-top:12px"><div class="card-h">{ic("spark")}<h3>{T("Utilités du GTCπ", "GTCπ utilities")}</h3></div>
      <div class="util">{"".join(f'<div><i>◆</i>{T(a, b)}</div>' for a, b in utilities)}</div>
      <p class="fine">{T("Paramètres de conception, susceptibles d'évoluer. Phase pilote : jetons de test sur réseau de test, sans valeur ; Mainnet non déployé.", "Design parameters, subject to change. Pilot phase: test tokens on a test network, with no value; Mainnet not deployed.")}</p>
    </div>
  </section>

  <section class="block" id="securite">
    {sec_head("07", "shield", "Sécurité & conformité", "Security & compliance")}
    <div class="cols c2">
      <div class="glass"><span class="pill-h ok">● {T("En place", "In place")}</span>
        <ul class="checks ok">{"".join(f'<li><i>✓</i><span>{T(a, b)}</span></li>' for a, b in security)}</ul></div>
      <div class="glass"><span class="pill-h goal">◇ {T("Cadre de conformité visé", "Target compliance framework")}</span>
        <ul class="checks goal">{"".join(f'<li><i>◇</i><span>{T(a, b)}</span></li>' for a, b in compliance)}</ul></div>
    </div>
  </section>

  <section class="block" id="impact">
    {sec_head("08", "chart", "Impacts & cas d'usage", "Impact & use cases")}
    <div class="cols c3">{cases_html}</div>
    <div class="cols c3" style="margin-top:12px">{impacts_html}</div>
  </section>

  <section class="block">
    {sec_head("09", "rocket", "Vision à long terme", "Long-term vision", "GeoTerraChain QFS ambitionne de devenir :", "GeoTerraChain QFS aims to become:")}
    <ol class="goals">{"".join(f"<li><span>{T(a, b)}</span></li>" for a, b in longterm)}</ol>
    <div class="glass" style="margin-top:12px"><p class="concl">{T(
      "GeoTerraChain QFS associe blockchain, Web3, gestion foncière numérique, promotion immobilière, agrobusiness intégré, intelligence territoriale, SIG, GPS et identité numérique pour transformer les actifs africains en actifs numériques sécurisés, traçables, valorisables et accessibles.",
      "GeoTerraChain QFS combines blockchain, Web3, digital land management, real estate development, integrated agribusiness, territorial intelligence, GIS, GPS and digital identity to turn African assets into secure, traceable, valuable and accessible digital assets.")}</p></div>
    <div class="glass quote"><p>{T("« Sécuriser, valoriser et transformer les actifs africains grâce à la blockchain, au Web3 et à l'intelligence territoriale. »", "“Securing, adding value to and transforming African assets through blockchain, Web3 and territorial intelligence.”")}</p><small>{T("NOTRE TERRE · NOTRE RICHESSE", "OUR LAND · OUR WEALTH")}</small></div>
    <div class="cta">
      <a class="btn btn-gold" href="index.html">{ic("home")}{T("Accéder à l'app", "Open the app")}</a>
      <a class="btn" href="tokenisation.html">{ic("cube")}{T("Tokeniser un actif", "Tokenize an asset")}</a>
      <a class="btn" href="marketplace.html">{ic("cart")}{T("Marketplace", "Marketplace")}</a>
      <a class="btn" href="guide.html">{ic("book")}{T("Guide", "Guide")}</a>
      <a class="btn" href="campagne.html">{ic("play")}{T("Le film", "The film")}</a>
      <a class="btn" href="litepaper.html">{ic("chart")}{T("Litepaper", "Litepaper (FR)")}</a>
    </div>
    <p class="note">{T("Projet indépendant · Phase pilote. La technologie ne remplace ni les documents légaux ni les autorités compétentes. GeoTerraChain QFS ne vous demandera jamais votre phrase secrète de 24 mots.",
      "Independent project · Pilot phase. Technology does not replace legal documents or the competent authorities. GeoTerraChain QFS will never ask for your 24-word secret phrase.")}</p>
  </section>
</main>
<footer><b>GeoTerraChain QFS</b><br>{T("Développé par @Hilaila · Côte d'Ivoire · UEMOA · 2026", "Built by @Hilaila · Côte d'Ivoire · WAEMU · 2026")}</footer>
<a class="totop" id="totop" href="#presentation" aria-label="Haut de page">↑</a>

<script>
(function () {{
  var root = document.documentElement;
  var TITLES = {{ fr: "Vision — GeoTerraChain QFS", en: "Vision — GeoTerraChain QFS" }};
  function setLang(l) {{
    root.setAttribute("data-lang", l); root.lang = l; document.title = TITLES[l];
    document.querySelectorAll(".lang button").forEach(function (b) {{ b.classList.toggle("on", b.getAttribute("data-l") === l); }});
  }}
  document.querySelectorAll(".lang button").forEach(function (b) {{
    b.addEventListener("click", function () {{
      var l = b.getAttribute("data-l");
      try {{ localStorage.setItem("gtcLang", l); }} catch (e) {{}}
      setLang(l);
    }});
  }});
  setLang(root.getAttribute("data-lang") || "fr");

  // Section active dans la barre de navigation + bouton « haut de page »
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var secs = links.map(function (a) {{ return document.getElementById(a.getAttribute("data-s")); }});
  var nav = document.querySelector(".nav"), current = null;
  function onScroll() {{
    var y = window.scrollY + 170, idx = 0;
    secs.forEach(function (s, i) {{ if (s && s.offsetTop <= y) idx = i; }});
    if (idx !== current) {{
      current = idx;
      links.forEach(function (a, i) {{ a.classList.toggle("on", i === idx); }});
      var a = links[idx];
      if (a && nav) nav.scrollTo({{ left: a.offsetLeft - 16, behavior: "smooth" }});
    }}
    document.getElementById("totop").classList.toggle("on", window.scrollY > 600);
  }}
  window.addEventListener("scroll", onScroll, {{ passive: true }});
  onScroll();
}})();
</script>
</body>
</html>
'''

open(OUT, "w", encoding="utf-8").write(page)
print("ok", len(page))
