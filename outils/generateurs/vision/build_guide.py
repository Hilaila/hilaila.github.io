# Génère guide.html : guide de tokenisation pas à pas, fidèle à tokenisation.html, premium Web3, FR/EN.
# Usage : python3 build_guide.py <vision.html (source du CSS)> <sortie guide.html>
import sys, re, os

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "build_vision.py"), encoding="utf-8").read()
exec(src.split("# ======================= CONTENU")[0].replace("OUT = sys.argv[1]", ""))   # T, ic, I, sec_head, bullets

VISION, OUT = sys.argv[1], sys.argv[2]
BASE_CSS = re.search(r"<style>(.*?)</style>", open(VISION, encoding="utf-8").read(), re.S).group(1)

I.update({
  "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  "wallet": '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.3" fill="currentColor"/>',
  "file": '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  "pin": '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  "send": '<path d="M4 12l16-8-6 16-3-7z"/><path d="M11 13l9-9"/>',
  "help": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><circle cx="12" cy="17" r=".8" fill="currentColor"/>',
  "phone": '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  "lock": '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  "eye": '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
})

def btnlabel(fr, en):   # nom d'un bouton tel qu'il apparaît dans l'app
    return f'<span class="ui">{T(fr, en)}</span>'

nav = [("avant", "Avant", "Before"), ("etapes", "7 étapes", "7 steps"), ("paiement", "Paiement", "Payment"),
       ("suivi", "Suivi", "Tracking"), ("securite", "Sécurité", "Security"), ("faq", "FAQ", "FAQ")]

before = [
  ("phone", "Le Pi Browser installé", "The Pi Browser installed", "L'app ne fonctionne que dans le Pi Browser, pas dans Chrome ni WhatsApp.", "The app only works inside the Pi Browser, not in Chrome or WhatsApp."),
  ("shield", "Un compte Pioneer avec KYC validé", "A Pioneer account with validated KYC", "Le KYC est fait sur Pi Network : l'app ne vous demande aucun document d'identité.", "KYC is done on Pi Network: the app never asks for an ID document."),
  ("wallet", "Un peu de π dans votre Pi Wallet", "A little π in your Pi Wallet", "0,001 π, en Pi réels, pour le paiement pilote, plus les frais de réseau affichés par le Pi Wallet.", "0.001 π, in real Pi, for the pilot payment, plus the network fees shown by the Pi Wallet."),
  ("file", "Les informations du bien", "The property details", "Type, nom ou référence, pays, région, ville, superficie, statut de propriété.", "Type, name or reference, country, region, city, area, ownership status."),
  ("pin", "Sa localisation", "Its location", "Être sur place pour utiliser le GPS du téléphone, ou connaître la latitude et la longitude.", "Be on site to use the phone's GPS, or know the latitude and longitude."),
  ("file", "Un document foncier", "A land document", "Fichier PDF, JPG ou PNG (10 Mo maximum), ou un lien vers le document.", "A PDF, JPG or PNG file (10 MB maximum), or a link to the document."),
]

fields = [
  ("Type", "Type", True, "Terrain agricole, rural, urbain, immobilier, agro-pastoral, raniculture, myciculture, mine, énergie.", "Agricultural, rural or urban land, real estate, agro-pastoral, frog farming, mushroom farming, mining, energy."),
  ("Nom / référence", "Name / reference", True, "Exemple : TER-ABJ-0001.", "Example: TER-ABJ-0001."),
  ("Pays", "Country", True, "Côte d'Ivoire et pays de l'UEMOA, Ghana, Gabon, Cameroun, RDC.", "Côte d'Ivoire and WAEMU countries, Ghana, Gabon, Cameroon, DRC."),
  ("Région / district", "Region / district", True, "", ""),
  ("Ville / commune", "City / municipality", True, "", ""),
  ("Localité / village", "Locality / village", False, "Village, quartier, localité.", "Village, neighbourhood, locality."),
  ("Superficie (ha)", "Area (ha)", True, "En hectares.", "In hectares."),
  ("Statut de propriété", "Ownership status", True, "Titre foncier, certificat foncier, attestation, droit coutumier, bail / concession, autre.", "Land title, land certificate, attestation letter, customary right, lease / concession, other."),
  ("Latitude / Longitude", "Latitude / Longitude", True, "Remplies automatiquement à l'étape 4, ou saisies à la main.", "Filled in automatically at step 4, or typed by hand."),
  ("Valeur estimée + Unité", "Estimated value + Unit", False, "Unité en Pi par défaut ; XOF, USD et EUR sont indicatifs.", "Unit in Pi by default; XOF, USD and EUR are indicative."),
  ("Nombre cible de GTCπ", "Target number of GTCπ", True, "Pour un premier essai : 1.", "For a first try: 1."),
  ("Lien document foncier", "Land document link", False, "Lien vers votre document, si vous en avez un.", "Link to your document, if you have one."),
  ("Description", "Description", True, "Situation, usage, tout élément utile à la vérification.", "Location, use, anything useful for verification."),
]

steps = [
  ("user", "Connexion Pi", "Pi sign-in",
   f"Appuyez sur {btnlabel('π Connexion', 'π Sign in')}. Une fenêtre Pi Network s'ouvre : acceptez le partage de votre nom d'utilisateur.",
   f"Tap {btnlabel('π Connexion', 'π Sign in')}. A Pi Network window opens: accept sharing your username.",
   "Votre nom @Pioneer s'affiche.", "Your @Pioneer name appears.",
   "Si « Pi ne répond pas encore » s'affiche, vérifiez que vous êtes bien dans le Pi Browser.", "If “Pi is not responding yet” appears, check that you are inside the Pi Browser."),
  ("shield", "Vérification d'identité", "Identity check",
   f"Appuyez sur {btnlabel('Vérifier mon identité', 'Check my identity')}. Le serveur confirme votre identité Pi auprès de Pi Network.",
   f"Tap {btnlabel('Vérifier mon identité', 'Check my identity')}. The server confirms your Pi identity with Pi Network.",
   "« Identité backend : ✓ Confirmée » et « Accès tokenisation : ✓ Autorisé ».", "“Server identity: ✓ Confirmed” and “Tokenization access: ✓ Authorized”.",
   "Le contrôle KYC complet est appliqué par Pi Network au moment du paiement.", "Full KYC is enforced by Pi Network at payment time."),
  ("file", "Informations de l'actif", "Asset information",
   f"Remplissez le formulaire (champs ci-dessous), puis appuyez sur {btnlabel('Continuer →', 'Continue →')}.",
   f"Fill in the form (fields below), then tap {btnlabel('Continuer →', 'Continue →')}.",
   "Les champs marqués * sont obligatoires.", "Fields marked * are required.", "", ""),
  ("pin", "Localisation", "Location",
   f"Sur place, appuyez sur {btnlabel('📍 Utiliser ma position', '📍 Use my location')} et autorisez la localisation. {btnlabel('Afficher la localisation', 'Show location')} ouvre la carte pour vérifier. Puis {btnlabel('Confirmer localisation →', 'Confirm location →')}.",
   f"On site, tap {btnlabel('📍 Utiliser ma position', '📍 Use my location')} and allow location access. {btnlabel('Afficher la localisation', 'Show location')} opens the map to check. Then {btnlabel('Confirmer localisation →', 'Confirm location →')}.",
   "« 📍 Actif localisé » avec la latitude et la longitude.", "“📍 Asset located” with latitude and longitude.",
   "Les coordonnées doivent correspondre à l'emplacement réel de l'actif.", "The coordinates must match the asset's real location."),
  ("file", "Documents fonciers", "Land documents",
   f"Appuyez sur {btnlabel('📎 Ajouter les documents', '📎 Add documents')} et choisissez vos fichiers (PDF, JPG, PNG ; 5 fichiers de 10 Mo au maximum). Il faut au moins un document, ou le lien saisi à l'étape 3.",
   f"Tap {btnlabel('📎 Ajouter les documents', '📎 Add documents')} and choose your files (PDF, JPG, PNG; up to 5 files of 10 MB). At least one document is needed, or the link entered at step 3.",
   "La liste de vos fichiers s'affiche.", "Your file list appears.",
   "Vos fichiers sont envoyés juste après la soumission, dans un espace de stockage privé, avec leur empreinte SHA-256 : toute modification serait détectée. Seuls les vérificateurs de la plateforme peuvent les ouvrir.",
   "Your files are sent right after submission to a private storage space, with their SHA-256 fingerprint: any change would be detected. Only the platform's verifiers can open them."),
  ("flame", "Calcul du burn de 0,5 %", "0.5% burn calculation",
   f"L'app calcule l'offre, le burn (offre × 0,005) et l'offre nette. Appuyez sur {btnlabel('Confirmer le calcul →', 'Confirm calculation →')}.",
   f"The app calculates the offer, the burn (offer × 0.005) and the net offer. Tap {btnlabel('Confirmer le calcul →', 'Confirm calculation →')}.",
   "Le serveur recalcule ce montant à la soumission.", "The server recalculates this amount on submission.", "", ""),
  ("send", "Soumission", "Submission",
   f"Relisez le récapitulatif, puis appuyez sur {btnlabel('◈ SOUMETTRE À LA TOKENISATION', '◈ SUBMIT FOR TOKENIZATION')}.",
   f"Review the summary, then tap {btnlabel('◈ SOUMETTRE À LA TOKENISATION', '◈ SUBMIT FOR TOKENIZATION')}.",
   "« ✓ DEMANDE ENREGISTRÉE », la référence GTC-…, puis « ✓ document(s) envoyé(s) et scellé(s) ».", "“✓ REQUEST RECORDED”, the GTC-… reference, then “✓ document(s) uploaded and sealed”.",
   "Notez la référence de votre demande.", "Write down your request reference."),
]

pay = [
  ("Appuyez sur", "Tap", btnlabel("π Payer 0,001 π (pilote)", "π Pay 0.001 π (pilot)"), "sous votre demande.", "under your request."),
  ("Le", "The", "<b>Pi Wallet officiel</b>", "s'ouvre. Vérifiez le montant (0,001 π) et le mémo « Tokenisation : GTC-… ».", "opens. Check the amount (0.001 π) and the memo “Tokenisation: GTC-…”."),
  ("Si le Pi Wallet le demande, déverrouillez-le", "If the Pi Wallet asks, unlock it", "", "(phrase secrète ou empreinte), puis confirmez le paiement.", "(secret phrase or fingerprint), then confirm the payment."),
  ("L'app affiche", "The app shows", "« Paiement pilote confirmé sur Pi Network »", "avec votre TXID Pi.", "with your Pi TXID."),
  ("Phase pilote : un", "Pilot phase: a", "jeton de test GTCπ", "est émis sur le réseau de test Stellar. Il n'a aucune valeur et ne vaut ni tokenisation ni titre de propriété.", "is issued on the Stellar test network. It has no value and is neither a tokenization nor a property title."),
]

statuses = [
  ("En attente de vérification", "Awaiting verification", "Votre demande est enregistrée et sera examinée.", "Your request is recorded and will be reviewed.", "now"),
  ("Vérifié", "Verified", "Les informations et les documents ont été contrôlés.", "The information and documents have been checked.", ""),
  ("Tokenisation définitive", "Final tokenization", "Émission du jeton de l'actif, après vérification. Prévue avec le Mainnet.", "Issuance of the asset token, after verification. Planned with Mainnet.", "later"),
]

faq = [
  ("Pourquoi faut-il un KYC Pi ?", "Why is Pi KYC required?",
   "Pour que chaque demande vienne d'une personne réelle et vérifiée. Le KYC est fait et contrôlé par Pi Network ; GeoTerraChain QFS ne vous demande aucun document d'identité.",
   "So that every request comes from a real, verified person. KYC is done and checked by Pi Network; GeoTerraChain QFS never asks for an ID document."),
  ("Qu'est-ce que le burn de 0,5 % ?", "What is the 0.5% burn?",
   "À chaque tokenisation, 0,5 % de l'offre en GTCπ est destiné au burn. Exemple : pour 1 GTCπ, 0,005 est brûlé et 0,995 reste. Ce mécanisme ne garantit aucune valeur ni aucun rendement.",
   "For each tokenization, 0.5% of the GTCπ offer goes to the burn. Example: for 1 GTCπ, 0.005 is burned and 0.995 remains. This mechanism guarantees no value and no return."),
  ("Le jeton de test a-t-il une valeur ?", "Does the test token have any value?",
   "Non. En phase pilote, le jeton GTCπ est émis sur le réseau de test Stellar pour tester le parcours. Il ne s'échange pas et ne représente aucun droit sur l'actif.",
   "No. During the pilot phase, the GTCπ token is issued on the Stellar test network to test the journey. It cannot be traded and grants no right over the asset."),
  ("Combien de π faut-il ?", "How much π do I need?",
   "0,001 π, en Pi réels, pour le paiement pilote, plus les frais de réseau affichés par le Pi Wallet avant confirmation. Ces paiements sont en pause depuis le 28 octobre 2026, jusqu'à la validation de l'application par Pi Network.",
   "0.001 π, in real Pi, for the pilot payment, plus the network fees shown by the Pi Wallet before you confirm. These payments have been paused since 28 October 2026, until Pi Network approves the app."),
  ("Mes documents sont-ils envoyés ?", "Are my documents uploaded?",
   "Oui, juste après la soumission, dans un espace de stockage privé, avec leur empreinte SHA-256. Seuls les vérificateurs de la plateforme peuvent les ouvrir, par un lien valable 5 minutes. Si l'envoi est interrompu, appuyez sur « Réessayer l'envoi ».",
   "Yes, right after submission, to a private storage space, with their SHA-256 fingerprint. Only the platform's verifiers can open them, through a link valid for 5 minutes. If the upload is interrupted, tap “Retry upload”."),
  ("« Pi ne répond pas encore » : que faire ?", "“Pi is not responding yet”: what should I do?",
   "La connexion ne fonctionne que dans le Pi Browser. Si le lien s'est ouvert dans Chrome ou WhatsApp, ouvrez le Pi Browser et tapez hilaila.github.io. Sinon, appuyez de nouveau sur « π Connexion ».",
   "Sign-in only works inside the Pi Browser. If the link opened in Chrome or WhatsApp, open the Pi Browser and type hilaila.github.io. Otherwise, tap “π Sign in” again."),
  ("Le paiement a été interrompu : que faire ?", "The payment was interrupted: what should I do?",
   "Reconnectez-vous avec Pi : un paiement commencé est finalisé automatiquement à la connexion suivante. Un paiement sans transaction est annulé par Pi Network.",
   "Sign in with Pi again: a started payment is completed automatically at the next sign-in. A payment with no transaction is cancelled by Pi Network."),
  ("Où voir mes demandes ?", "Where can I see my requests?",
   "Dans « Mon espace », onglet « Mes actifs ». Gardez aussi la référence GTC-… et le TXID affichés à la fin.",
   "In “My space”, “My assets” tab. Also keep the GTC-… reference and the TXID shown at the end."),
]

GUIDE_CSS = """
  .ui { display:inline-block; font:700 12.5px 'JetBrains Mono', monospace; color:#000008; background:linear-gradient(120deg, #F4E7C1, var(--gold-2)); border-radius:8px; padding:1px 7px; margin:1px 0; white-space:nowrap; }
  .need { display:grid; grid-template-columns:1fr; gap:10px; }
  @media (min-width:640px) { .need { grid-template-columns:1fr 1fr; } }
  .need div { display:flex; gap:12px; align-items:flex-start; padding:13px; border:1px solid var(--line); border-radius:16px; background:rgba(0,0,8,.42); }
  .need b { display:block; font-size:14.5px; }
  .need span.t { display:block; font-size:12.5px; color:var(--muted); line-height:1.45; margin-top:2px; }
  .open-app { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:12px; font-size:14px; }
  .open-app .arrow { color:var(--gold-2); }
  .url { font:600 13px 'JetBrains Mono', monospace; color:var(--gold-2); border:1px dashed rgba(232,200,114,.45); border-radius:8px; padding:2px 8px; }
  .warn { margin-top:12px; padding:10px 12px; border-radius:12px; border:1px solid rgba(255,141,141,.35); background:rgba(255,141,141,.07); color:#FFD0D0; font-size:13px; }
  .see { margin-top:10px; display:flex; gap:8px; align-items:flex-start; font-size:13px; color:var(--green); }
  .see .ic { width:24px; height:24px; border-radius:7px; background:rgba(61,220,151,.12); border-color:rgba(61,220,151,.35); color:var(--green); }
  .see .ic svg { width:14px; height:14px; }
  .tip { margin-top:8px; font-size:12.5px; color:var(--muted); padding-left:10px; border-left:2px solid rgba(232,200,114,.4); }
  .fields { margin-top:12px; display:grid; gap:6px; }
  .fld { display:grid; grid-template-columns:auto 1fr; gap:2px 10px; padding:9px 11px; border:1px solid rgba(201,168,76,.14); border-radius:12px; background:rgba(0,0,8,.35); }
  .fld b { font-size:13.5px; } .fld b i { font-style:normal; color:var(--gold-2); margin-left:2px; }
  .fld span { grid-column:1 / -1; font-size:12px; color:var(--muted); line-height:1.4; }
  .calc { margin-top:12px; padding:12px; border:1px solid rgba(232,200,114,.35); border-radius:14px; background:rgba(232,200,114,.06); }
  .calc label { display:block; font:500 11px 'JetBrains Mono', monospace; letter-spacing:.12em; text-transform:uppercase; color:var(--gold-2); }
  .calc input { width:100%; margin-top:6px; padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:rgba(0,0,8,.6); color:var(--text); font:600 16px 'JetBrains Mono', monospace; }
  .flow { list-style:none; display:grid; gap:8px; counter-reset:f; }
  .flow li { counter-increment:f; position:relative; padding:12px 14px 12px 50px; border:1px solid var(--line); border-radius:14px; background:rgba(0,0,8,.4); font-size:14px; }
  .flow li::before { content:counter(f); position:absolute; left:12px; top:11px; width:26px; height:26px; display:grid; place-items:center; border-radius:50%; font:700 12px 'JetBrains Mono', monospace; color:#000008; background:linear-gradient(135deg, #FFF3C4, var(--gold-2)); }
  .flow li b { color:var(--gold-2); }
  .states { display:grid; gap:10px; }
  @media (min-width:760px) { .states { grid-template-columns:repeat(3, 1fr); } }
  .state { position:relative; padding:14px; border:1px solid var(--line); border-radius:16px; background:rgba(0,0,8,.4); }
  .state small { font:600 10.5px 'JetBrains Mono', monospace; letter-spacing:.12em; text-transform:uppercase; }
  .state.now { border-color:rgba(232,200,114,.55); background:linear-gradient(160deg, rgba(232,200,114,.12), rgba(0,0,8,.4)); }
  .state.now small { color:var(--gold-2); } .state.later small { color:var(--violet-2); } .state small { color:var(--green); }
  .state b { display:block; margin-top:4px; font-size:15px; } .state p { margin-top:4px; font-size:12.5px; color:var(--muted); }
  .danger { border-color:rgba(255,141,141,.4); background:linear-gradient(160deg, rgba(255,141,141,.09), rgba(255,255,255,.015)); }
  .danger h3 { color:#FFC4C4; }
  details.q { border:1px solid var(--line); border-radius:14px; background:rgba(0,0,8,.4); }
  details.q + details.q { margin-top:8px; }
  details.q summary { list-style:none; cursor:pointer; padding:13px 44px 13px 14px; position:relative; font-weight:600; font-size:14.5px; }
  details.q summary::-webkit-details-marker { display:none; }
  details.q summary::after { content:"+"; position:absolute; right:14px; top:50%; transform:translateY(-50%); width:24px; height:24px; display:grid; place-items:center; border-radius:50%; border:1px solid var(--line); color:var(--gold-2); font:700 15px 'JetBrains Mono', monospace; }
  details.q[open] summary::after { content:"−"; }
  details.q p { padding:0 14px 14px; font-size:14px; color:#D5CDBB; }
"""

def need_html():
    return "".join(f'<div>{ic(i)}<span><b>{T(a, b)}</b><span class="t">{T(c, d)}</span></span></div>' for i, a, b, c, d in before)

def fields_html():
    return '<div class="fields">' + "".join(
        f'<div class="fld"><b>{T(a, b)}{"<i>*</i>" if req else ""}</b>{f"<span>{T(c, d)}</span>" if c else ""}</div>'
        for a, b, req, c, d in fields) + "</div>"

def steps_html():
    out = []
    for i, (icn, tfr, ten, dfr, den, sfr, sen, tipfr, tipen) in enumerate(steps, 1):
        extra = ""
        if i == 3: extra = fields_html()
        if i == 6:
            extra = f'''<div class="calc"><label for="calcIn">{T("Calculateur", "Calculator")}</label>
              <input id="calcIn" type="number" min="0" step="any" value="1" inputmode="decimal">
              <div class="burn" style="margin-top:10px">
                <div><b id="cOffer">1</b><span>{T("offre", "offer")}</span></div><em>−</em>
                <div class="fire"><b id="cBurn">0,005</b><span>{T("brûlé", "burned")}</span></div><em>=</em>
                <div class="net"><b id="cNet">0,995</b><span>{T("net", "net")}</span></div>
              </div></div>'''
        see = f'<div class="see">{ic("eye")}<span>{T(sfr, sen)}</span></div>' if sfr else ""
        tip = f'<p class="tip">{T(tipfr, tipen)}</p>' if tipfr else ""
        out.append(f'''<li class="step{' hot' if i == 7 else ''}" id="etape-{i}">
      <div class="node"><span class="mono">{i}</span></div>
      <div class="card glass">
        <div class="step-h">{ic(icn)}<h3>{T(tfr, ten)}</h3></div>
        <p>{T(dfr, den)}</p>{see}{tip}{extra}
      </div>
    </li>''')
    return "".join(out)

def pay_html():
    return '<ol class="flow">' + "".join(
        f"<li>{T(a, b)} {mid} {T(c, d)}</li>" if mid else f"<li>{T(a + ' ' + c, b + ' ' + d)}</li>" for a, b, mid, c, d in pay) + "</ol>"

def states_html():
    return '<div class="states">' + "".join(
        f'<div class="state {cls}"><small>{T(["Aujourd'hui", "Ensuite", "À venir · Mainnet"][k], ["Today", "Next", "Upcoming · Mainnet"][k])}</small><b>{T(a, b)}</b><p>{T(c, d)}</p></div>'
        for k, (a, b, c, d, cls) in enumerate(statuses)) + "</div>"

def faq_html():
    return "".join(f'<details class="q"><summary>{T(q, qe)}</summary><p>{T(a, ae)}</p></details>' for q, qe, a, ae in faq)

page = f'''<!DOCTYPE html>
<html lang="fr" data-lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#000008">
<title>Guide de tokenisation — GeoTerraChain QFS</title>
<meta name="description" content="Tokeniser un actif foncier avec GeoTerraChain QFS, étape par étape : connexion Pi, identité, actif, localisation, documents, burn, soumission et paiement pilote.">
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
<style>{BASE_CSS}{GUIDE_CSS}</style>
<script src="reseau.js"></script>
<script src="clavier.js" defer></script>
<script src="navigation.js" defer></script>
</head>
<body>
<header class="top">
  <div class="bar">
    <a class="brand" href="index.html">
      <img src="logo-160.webp" alt="GeoTerraChain QFS">
      <span><b>GeoTerraChain QFS</b><small>{T("Guide · 7 étapes", "Guide · 7 steps")}</small></span>
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
  "GUIDE OFFICIEL · 7 ÉTAPES · <b>PHASE PILOTE</b> · CONNEXION PI · KYC PI · BURN 0,5 % · GTCπ · NOTRE TERRE · NOTRE RICHESSE ·&nbsp; GUIDE OFFICIEL · 7 ÉTAPES · <b>PHASE PILOTE</b> · CONNEXION PI · KYC PI · BURN 0,5 % · GTCπ · NOTRE TERRE · NOTRE RICHESSE ·&nbsp;",
  "OFFICIAL GUIDE · 7 STEPS · <b>PILOT PHASE</b> · PI SIGN-IN · PI KYC · 0.5% BURN · GTCπ · OUR LAND · OUR WEALTH ·&nbsp; OFFICIAL GUIDE · 7 STEPS · <b>PILOT PHASE</b> · PI SIGN-IN · PI KYC · 0.5% BURN · GTCπ · OUR LAND · OUR WEALTH ·&nbsp;")}</div></div>

<main>
  <section class="hero">
    <span class="eyebrow"><i></i>{T("Guide officiel · Phase pilote", "Official guide · Pilot phase")}</span>
    <h1>{T("Tokeniser votre actif, <em>étape par étape</em>", "Tokenize your asset, <em>step by step</em>")}</h1>
    <p class="lead">{T("Ce guide suit exactement l'écran « Tokeniser » de l'application : 7 étapes, puis un paiement pilote de 0,001 π en Pi réels. Comptez une dizaine de minutes.",
      "This guide follows the app's “Tokenize” screen exactly: 7 steps, then a 0.001 π pilot payment in real Pi. Allow about ten minutes.")}</p>
    <div class="chips">
      <span class="chip">{ic("clock")}{T("≈ 10 minutes", "≈ 10 minutes")}</span>
      <span class="chip">{ic("layers")}{T("7 étapes", "7 steps")}</span>
      <span class="chip">{ic("shield")}{T("KYC Pi requis", "Pi KYC required")}</span>
      <span class="chip">{ic("wallet")}{T("Paiement pilote 0,001 π", "0.001 π pilot payment")}</span>
    </div>
  </section>

  <section class="block" id="avant">
    {sec_head("00", "check", "Avant de commencer", "Before you start", "Préparez ces éléments : le parcours ira plus vite.", "Get these ready: the journey will go faster.")}
    <div class="need">{need_html()}</div>
    <div class="glass" style="margin-top:12px">
      <div class="card-h">{ic("phone")}<h3>{T("Ouvrir l'écran « Tokeniser »", "Open the “Tokenize” screen")}</h3></div>
      <div class="open-app">{T("Ouvrez le Pi Browser", "Open the Pi Browser")} <span class="arrow">→</span> {T("tapez", "type")} <span class="url">hilaila.github.io</span> <span class="arrow">→</span> {btnlabel("◈ Tokeniser un actif", "◈ Tokenize an asset")}</div>
      <p class="warn">{T("Un lien ouvert depuis WhatsApp ou Chrome ne permet pas la connexion Pi : passez toujours par le Pi Browser.", "A link opened from WhatsApp or Chrome cannot sign in with Pi: always go through the Pi Browser.")}</p>
    </div>
  </section>

  <section class="block" id="etapes">
    {sec_head("01", "layers", "Les 7 étapes", "The 7 steps", "Une barre en haut de l'écran montre l'étape en cours.", "A bar at the top of the screen shows the current step.")}
    <ol class="steps">{steps_html()}</ol>
  </section>

  <section class="block" id="paiement">
    {sec_head("02", "wallet", "Le paiement pilote", "The pilot payment", "Juste après la soumission, sous votre demande.", "Right after submission, under your request.")}
    <div class="glass" style="margin-bottom:12px"><p class="lead2" style="font-size:14.5px">{T(
      "⏸ <b>Paiements en pause</b> depuis le 28 octobre 2026, jusqu'à la validation de l'application par Pi Network : aucun Pi ne peut être prélevé pour l'instant. Quand ils rouvriront, ce paiement se fera <b>en Pi réels</b> (réseau principal de Pi Network).",
      "⏸ <b>Payments paused</b> since 28 October 2026, until Pi Network approves the app: no Pi can be taken for now. When they reopen, this payment will be made <b>in real Pi</b> (Pi Network main network).")}</p></div>
    {pay_html()}
    <div class="glass" style="margin-top:12px"><p class="lead2" style="font-size:14.5px">{T(
      "L'écran se termine par : « <b>Votre dossier va maintenant être vérifié.</b> La tokenisation définitive n'aura lieu qu'après cette vérification. »",
      "The screen ends with: “<b>Your file will now be verified.</b> Final tokenization only happens after this verification.”")}</p></div>
  </section>

  <section class="block" id="suivi">
    {sec_head("03", "eye", "Suivre votre demande", "Track your request")}
    {states_html()}
    <div class="glass" style="margin-top:12px"><div class="card-h">{ic("user")}<h3>{T("Où la retrouver", "Where to find it")}</h3></div>
      <p class="lead2" style="font-size:14.5px">{T("Dans <b>Mon espace → Mes actifs</b>. Gardez aussi la référence GTC-… et le TXID Pi affichés à la fin.", "In <b>My space → My assets</b>. Also keep the GTC-… reference and the Pi TXID shown at the end.")}</p></div>
  </section>

  <section class="block" id="securite">
    {sec_head("04", "lock", "Sécurité", "Security")}
    <div class="glass danger">
      <div class="card-h">{ic("lock")}<h3>{T("Votre phrase secrète de 24 mots", "Your 24-word secret phrase")}</h3></div>
      <ul class="checks ok">
        <li><i>✓</i><span>{T("Ne la partagez jamais, avec personne, ni en capture ni par message.", "Never share it with anyone, in a screenshot or a message.")}</span></li>
        <li><i>✓</i><span>{T("Aucune page de GeoTerraChain QFS ne vous la demandera jamais.", "No GeoTerraChain QFS page will ever ask for it.")}</span></li>
        <li><i>✓</i><span>{T("Seul le Pi Wallet officiel peut vous demander de se déverrouiller : vérifiez que c'est bien lui avant de taper quoi que ce soit.", "Only the official Pi Wallet may ask you to unlock it: check that it really is the Pi Wallet before typing anything.")}</span></li>
        <li><i>✓</i><span>{T("Arrêtez tout enregistrement d'écran avant de la saisir.", "Stop any screen recording before entering it.")}</span></li>
      </ul>
    </div>
  </section>

  <section class="block" id="faq">
    {sec_head("05", "help", "Questions fréquentes", "Frequently asked questions")}
    {faq_html()}
    <div class="cta">
      <a class="btn btn-gold" href="tokenisation.html">{ic("cube")}{T("Tokeniser un actif", "Tokenize an asset")}</a>
      <a class="btn" href="guide-aide-geoterrachain-qfs.html">{ic("help")}{T("Guide & Aide", "Guide & Help")}</a>
      <a class="btn" href="campagne.html">{ic("play")}{T("Le film", "The film")}</a>
      <a class="btn" href="litepaper.html">{ic("chart")}{T("Litepaper", "Litepaper (FR)")}</a>
    </div>
    <p class="note">{T("Projet indépendant · Phase pilote. La technologie ne remplace ni les documents légaux ni les autorités compétentes.",
      "Independent project · Pilot phase. Technology does not replace legal documents or the competent authorities.")}</p>
  </section>
</main>
<footer><b>GeoTerraChain QFS</b><br>{T("Développé par @Hilaila · Côte d'Ivoire · UEMOA · 2026", "Built by @Hilaila · Côte d'Ivoire · WAEMU · 2026")}</footer>
<a class="totop" id="totop" href="#avant" aria-label="Haut de page">↑</a>

<script>
(function () {{
  var root = document.documentElement;
  var TITLES = {{ fr: "Guide de tokenisation — GeoTerraChain QFS", en: "Tokenization guide — GeoTerraChain QFS" }};
  function fmt(n) {{ return Number(n).toLocaleString(root.getAttribute("data-lang") === "en" ? "en-US" : "fr-FR", {{ maximumFractionDigits: 8 }}); }}
  function calc() {{
    var v = parseFloat(String(document.getElementById("calcIn").value).replace(",", "."));
    if (!isFinite(v) || v < 0) v = 0;
    var burn = Math.round(v * 0.005 * 1e8) / 1e8, net = Math.round((v - burn) * 1e8) / 1e8;
    document.getElementById("cOffer").textContent = fmt(v);
    document.getElementById("cBurn").textContent = fmt(burn);
    document.getElementById("cNet").textContent = fmt(net);
  }}
  function setLang(l) {{
    root.setAttribute("data-lang", l); root.lang = l; document.title = TITLES[l];
    document.querySelectorAll(".lang button").forEach(function (b) {{ b.classList.toggle("on", b.getAttribute("data-l") === l); }});
    calc();
  }}
  document.querySelectorAll(".lang button").forEach(function (b) {{
    b.addEventListener("click", function () {{
      var l = b.getAttribute("data-l");
      try {{ localStorage.setItem("gtcLang", l); }} catch (e) {{}}
      setLang(l);
    }});
  }});
  document.getElementById("calcIn").addEventListener("input", calc);
  setLang(root.getAttribute("data-lang") || "fr");

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
