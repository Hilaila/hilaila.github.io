# Génère marketplace.html : Marketplace agro-pastorale (démonstration), premium Web3, FR/EN.
# Reprend le design de la page Vision (CSS de base + icônes) pour rester cohérent avec l'app.
# Usage : python3 build_market.py <vision.html (source du CSS)> <sortie marketplace.html>
import sys, re, os, json

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "..", "vision", "build_vision.py"), encoding="utf-8").read()
exec(src.split("# ======================= CONTENU")[0].replace("OUT = sys.argv[1]", ""))   # T, ic, I, sec_head, bullets

VISION, OUT = sys.argv[1], sys.argv[2]
BASE_CSS = re.search(r"<style>(.*?)</style>", open(VISION, encoding="utf-8").read(), re.S).group(1)

# ---------- Icônes d'interface ----------
UI = {
  "cart": '<path d="M3 4h2.5l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.3"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
  "search": '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  "filter": '<path d="M4 6h16M7 12h10M10 18h4"/>',
  "heart": '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
  "pin": '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.8" r=".9" fill="currentColor"/>',
  "plus": '<path d="M12 5v14M5 12h14"/>',
  "minus": '<path d="M5 12h14"/>',
  "trash": '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  "x": '<path d="M6 6l12 12M18 6L6 18"/>',
  "store": '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5 11v9h14v-9M10 20v-5h4v5"/>',
  "hash": '<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>',
  "truck": '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
  "star": '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  "grid": '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  "link": I["link"],
  "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  "qr": '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 20h1.5M20 14v1.5"/>',
  "print": '<path d="M7 9V4h10v5"/><path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="6" rx="1"/>',
  "save": '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
}
I.update(UI)

# ---------- Illustrations des produits (traits fins) ----------
PIC = {
  "grain": '<path d="M12 21V9"/><path d="M12 9c-2.2-.8-3.4-2.8-3.4-5.4 2.2.3 3.4 2.3 3.4 5.4zM12 9c2.2-.8 3.4-2.8 3.4-5.4-2.2.3-3.4 2.3-3.4 5.4z"/><path d="M12 14c-2.3-.8-3.8-2.8-3.8-5.2 2.3.3 3.8 2.3 3.8 5.2zM12 14c2.3-.8 3.8-2.8 3.8-5.2-2.3.3-3.8 2.3-3.8 5.2z"/><path d="M12 19c-2.3-.8-3.8-2.8-3.8-5.2 2.3.3 3.8 2.3 3.8 5.2zM12 19c2.3-.8 3.8-2.8 3.8-5.2-2.3.3-3.8 2.3-3.8 5.2z"/>',
  "tuber": '<path d="M5.5 19.5c2.5-.8 8.5-5.5 11.6-10.4 1.6-2.6.2-5-2.1-4C10.6 7 6.6 12.8 5.5 19.5z"/><path d="M15.5 5l2.2-2.2M17.2 6.6l3-.9M9 14.5l2 .8M11.6 10.7l2 .8"/>',
  "tomato": '<circle cx="12" cy="13.5" r="7.2"/><path d="M12 6.3V3.2M8.6 6.8L12 8.6l3.4-1.8M12 8.6l-1.8 2M12 8.6l1.8 2"/>',
  "banana": '<path d="M4 12.5c2.8 5.6 11.4 6.8 16.5-.8"/><path d="M4 12.5c4.4 2.7 11.6 2.2 16.5-.8"/><path d="M20.5 11.7l.8-3.2M4 12.5L3 11"/>',
  "nut": '<path d="M7.2 5.2c5-2.2 11 1.6 11 7.8 0 4.2-3 7-6 6.2-2.2-.6-2.3-3-4.3-4.1S3.2 13.4 4 9.3c.4-1.8 1.6-3.3 3.2-4.1z"/><path d="M9 7.5c3-.6 6 1.5 6.6 4.8"/>',
  "pineapple": '<path d="M12 9.5c3 0 5 2.9 5 6.2S15 21 12 21s-5-2-5-5.3 2-6.2 5-6.2z"/><path d="M12 9.5V3.5M12 6.5L9 3.8M12 6.5l3-2.7M9.6 13l4.8 5M14.4 13l-4.8 5"/>',
  "cocoa": '<path d="M12 3c3.9 0 6 4 6 9s-2.1 9-6 9-6-4-6-9 2.1-9 6-9z"/><path d="M12 3v18M9 5.2c-.9 4-.9 9.6 0 13.6M15 5.2c.9 4 .9 9.6 0 13.6"/>',
  "bean": '<path d="M8.2 19.6c-3.6-2.1-4.4-7.6-1.8-12.1s7.8-6.6 11.4-4.5 4.4 7.6 1.8 12.1-7.8 6.6-11.4 4.5z"/><path d="M15.6 3.6c-1.6 2.8-.4 5.6-2.4 8.4s-4.9 3.4-6.2 7.2"/>',
  "frog": '<circle cx="8.2" cy="7.2" r="2.4"/><circle cx="15.8" cy="7.2" r="2.4"/><circle cx="8.2" cy="7.2" r=".7" fill="currentColor"/><circle cx="15.8" cy="7.2" r=".7" fill="currentColor"/><path d="M5.9 8.6C3.8 10.1 3.2 13.2 4.6 15.6c2 3.4 12.8 3.4 14.8 0 1.4-2.4.8-5.5-1.3-7"/><path d="M9 13.8c1.9 1.2 4.1 1.2 6 0"/><path d="M4.6 15.6l-2 3.6h3M19.4 15.6l2 3.6h-3"/>',
  "mushroom": '<path d="M3 12.5a9 7.5 0 0 1 18 0z"/><path d="M9.5 12.5v6a2.5 2.5 0 0 0 5 0v-6"/><circle cx="8.6" cy="9" r="1" fill="currentColor"/><circle cx="14.6" cy="7.8" r="1" fill="currentColor"/><circle cx="12" cy="10.4" r=".7" fill="currentColor"/>',
  "spawn": '<path d="M7 7h10l1.5 13.5h-13z"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7"/><path d="M9.5 15.5a2.5 2 0 0 1 5 0z"/><path d="M11 15.5v2h2v-2"/>',
  "fish": '<path d="M2.5 12c3-4.2 8.2-5.6 12.5-3.4l4.5-3.2v13.2L15 15.4c-4.3 2.2-9.5.8-12.5-3.4z"/><circle cx="7.6" cy="11" r=".9" fill="currentColor"/><path d="M10.5 9.5c.8 1.6.8 3.4 0 5"/>',
  "egg": '<path d="M12 3c3.6 0 6.2 5.2 6.2 10.2a6.2 6.2 0 0 1-12.4 0C5.8 8.2 8.4 3 12 3z"/><path d="M9.2 14.5a3 3 0 0 0 2.8 2.6"/>',
  "bowl": '<path d="M3 11.5h18a9 8.5 0 0 1-18 0z"/><path d="M8 21h8"/><path d="M9 8.5c0-2 2-2.2 2-4.3M13.2 8.5c0-2 2-2.2 2-4.3"/>',
  "jar": '<path d="M8 3.5h8M7 6.5h10l1 3.2v8.3a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9.7z"/><path d="M6.4 12h11.2"/><path d="M12 14.3l1.6.9v1.9l-1.6.9-1.6-.9v-1.9z"/>',
  "comb": '<path d="M12 2.8l4 2.3v4.6L12 12 8 9.7V5.1z"/><path d="M8 9.7L4 12v4.6l4 2.3 4-2.3V12M16 9.7l4 2.3v4.6l-4 2.3-4-2.3"/>',
  "cloth": '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M7.5 7l2.2 3 2.3-3 2.3 3 2.2-3M7.5 14h9M7.5 17.5h5.5"/>',
  "basket": '<path d="M3 10h18l-2.2 10H5.2z"/><path d="M8 10l3.2-6M16 10l-3.2-6"/><path d="M6.8 14h10.4M7.4 17h9.2"/>',
}

def svg(inner, cls=""):
    c = f' class="{cls}"' if cls else ""
    return f'<svg{c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>'

# ---------- Données de démonstration ----------
COUNTRIES = {"CI": {"fr": "Côte d'Ivoire", "en": "Côte d'Ivoire"}, "SN": {"fr": "Sénégal", "en": "Senegal"},
             "BF": {"fr": "Burkina Faso", "en": "Burkina Faso"}, "BJ": {"fr": "Bénin", "en": "Benin"},
             "ML": {"fr": "Mali", "en": "Mali"}, "TG": {"fr": "Togo", "en": "Togo"},
             "NE": {"fr": "Niger", "en": "Niger"}, "GW": {"fr": "Guinée-Bissau", "en": "Guinea-Bissau"}}

def B(fr, en): return {"fr": fr, "en": en}

CATS = [
  {"id": "rani", "name": B("Raniculture", "Frog farming"), "ic": "frog", "a": "#3DDC97", "b": "#0B4434", "star": True},
  {"id": "myci", "name": B("Myciculture", "Mushroom farming"), "ic": "mushroom", "a": "#A88BFF", "b": "#2E1F63", "star": True},
  {"id": "cereales", "name": B("Céréales", "Cereals"), "ic": "grain", "a": "#E8C872", "b": "#5E460C"},
  {"id": "tubercules", "name": B("Tubercules & légumes", "Roots & vegetables"), "ic": "tuber", "a": "#D49A5A", "b": "#45290F"},
  {"id": "fruits", "name": B("Fruits & noix", "Fruits & nuts"), "ic": "banana", "a": "#F2A541", "b": "#633006"},
  {"id": "cacao", "name": B("Cacao & café", "Cocoa & coffee"), "ic": "cocoa", "a": "#C27448", "b": "#30170A"},
  {"id": "elevage", "name": B("Élevage & pisciculture", "Livestock & fish farming"), "ic": "fish", "a": "#4FB3D9", "b": "#0E3049"},
  {"id": "transfo", "name": B("Produits transformés", "Processed goods"), "ic": "jar", "a": "#F4D35E", "b": "#6E4600"},
  {"id": "artisanat", "name": B("Artisanat", "Crafts"), "ic": "basket", "a": "#E07A5F", "b": "#4A1A10"},
]

def P(id, cat, icn, name, city, c, price, unit, prod, desc):
    return {"id": id, "cat": cat, "ic": icn, "name": name, "city": city, "c": c, "price": price, "unit": unit, "prod": prod, "desc": desc}

PRODUCTS = [
  P("ra1", "rani", "frog", B("Cuisses de grenouille fraîches", "Fresh frog legs"), "Grand-Bassam", "CI", 6000, B("kg", "kg"),
    B("Ferme ranicole", "Frog farm"), B("Grenouilles élevées en bassins contrôlés, préparées puis conditionnées au froid.", "Frogs raised in controlled ponds, then prepared and cold-packed.")),
  P("ra2", "rani", "frog", B("Juvéniles de grenouilles", "Frog juveniles"), "Abidjan", "CI", 150, B("pièce", "piece"),
    B("Écloserie", "Hatchery"), B("Juvéniles issus d'écloserie, destinés au démarrage de nouveaux bassins d'élevage.", "Hatchery-raised juveniles to stock new rearing ponds.")),
  P("my1", "myci", "mushroom", B("Volvaire fraîche", "Fresh paddy-straw mushroom"), "Yamoussoukro", "CI", 3000, B("kg", "kg"),
    B("Champignonnière", "Mushroom farm"), B("Volvariella volvacea, champignon local africain, cultivé sur paille et récolté le jour même.", "Volvariella volvacea, a local African mushroom grown on straw and harvested the same day.")),
  P("my2", "myci", "mushroom", B("Pleurotes séchés", "Dried oyster mushrooms"), "Bouaké", "CI", 2500, B("250 g", "250 g"),
    B("Champignonnière", "Mushroom farm"), B("Pleurotes séchés à basse température pour une longue conservation.", "Oyster mushrooms dried at low temperature for long storage.")),
  P("my3", "myci", "spawn", B("Semence de champignons", "Mushroom spawn"), "Abidjan", "CI", 2000, B("sachet de 1 kg", "1 kg bag"),
    B("Laboratoire de semences", "Spawn laboratory"), B("Semence (blanc) pour démarrer une culture de volvaire ou de pleurotes.", "Spawn to start growing paddy-straw or oyster mushrooms.")),
  P("ce1", "cereales", "grain", B("Riz local blanchi", "Local milled rice"), "Korhogo", "CI", 600, B("kg", "kg"),
    B("Coopérative rizicole", "Rice cooperative"), B("Riz paddy local, décortiqué et blanchi près des parcelles.", "Local paddy rice, hulled and milled near the fields.")),
  P("ce2", "cereales", "grain", B("Maïs grain", "Grain maize"), "Bobo-Dioulasso", "BF", 300, B("kg", "kg"),
    B("Groupement céréalier", "Grain producers' group"), B("Maïs séché et trié, pour la consommation ou l'alimentation animale.", "Dried and sorted maize for food or animal feed.")),
  P("tu1", "tubercules", "tuber", B("Manioc frais", "Fresh cassava"), "Dimbokro", "CI", 250, B("kg", "kg"),
    B("Coopérative vivrière", "Food-crop cooperative"), B("Racines de manioc récoltées à maturité, pour l'attiéké, le placali ou la cuisson.", "Cassava roots harvested at maturity, for attiéké, placali or cooking.")),
  P("tu2", "tubercules", "tuber", B("Igname", "Yam"), "Bouaké", "CI", 500, B("kg", "kg"),
    B("Groupement de producteurs", "Producers' group"), B("Igname de la région du Gbêkê, triée par calibre.", "Yam from the Gbêkê region, sorted by size.")),
  P("tu3", "tubercules", "tomato", B("Tomates fraîches", "Fresh tomatoes"), "Thiès", "SN", 700, B("kg", "kg"),
    B("Maraîchers", "Market gardeners"), B("Tomates de plein champ, cueillies à maturité.", "Field-grown tomatoes, picked ripe.")),
  P("fr1", "fruits", "banana", B("Banane plantain", "Plantain"), "Agboville", "CI", 400, B("kg", "kg"),
    B("Ferme vivrière", "Food-crop farm"), B("Régimes de plantain, mûrs ou verts selon l'usage.", "Plantain bunches, ripe or green depending on use.")),
  P("fr2", "fruits", "nut", B("Noix de cajou", "Cashew nuts"), "Bondoukou", "CI", 4200, B("kg", "kg"),
    B("Coopérative d'anacarde", "Cashew cooperative"), B("Amandes de cajou décortiquées et séchées.", "Shelled and dried cashew kernels.")),
  P("fr3", "fruits", "pineapple", B("Ananas pain de sucre", "Sugarloaf pineapple"), "Allada", "BJ", 800, B("pièce", "piece"),
    B("Planteurs d'ananas", "Pineapple growers"), B("Variété douce et peu acide, récoltée à maturité.", "A sweet, low-acid variety, harvested ripe.")),
  P("ca1", "cacao", "cocoa", B("Fèves de cacao séchées", "Dried cocoa beans"), "Soubré", "CI", 2800, B("kg", "kg"),
    B("Coopérative cacaoyère", "Cocoa cooperative"), B("Fèves fermentées et séchées au soleil.", "Fermented, sun-dried beans.")),
  P("ca2", "cacao", "bean", B("Café robusta torréfié", "Roasted robusta coffee"), "Daloa", "CI", 4000, B("500 g", "500 g"),
    B("Coopérative caféière", "Coffee cooperative"), B("Robusta torréfié localement, en grains ou moulu.", "Locally roasted robusta, whole bean or ground.")),
  P("el1", "elevage", "fish", B("Tilapia frais", "Fresh tilapia"), "Jacqueville", "CI", 2500, B("kg", "kg"),
    B("Ferme piscicole", "Fish farm"), B("Tilapia élevé en étangs, vendu entier et frais.", "Pond-raised tilapia, sold whole and fresh.")),
  P("el2", "elevage", "egg", B("Œufs fermiers", "Farm eggs"), "Bingerville", "CI", 2500, B("plateau de 30", "tray of 30"),
    B("Ferme avicole", "Poultry farm"), B("Œufs de poules élevées en plein air.", "Eggs from free-range hens.")),
  P("pt1", "transfo", "bowl", B("Attiéké frais", "Fresh attiéké"), "Dabou", "CI", 600, B("kg", "kg"),
    B("Transformatrices de manioc", "Cassava processors"), B("Semoule de manioc fermenté, préparée de façon traditionnelle.", "Fermented cassava semolina, traditionally prepared.")),
  P("pt2", "transfo", "jar", B("Beurre de karité", "Shea butter"), "Koudougou", "BF", 3000, B("500 g", "500 g"),
    B("Coopérative de femmes", "Women's cooperative"), B("Beurre de karité non raffiné, extrait à la main.", "Unrefined shea butter, hand-extracted.")),
  P("pt3", "transfo", "comb", B("Miel pur", "Pure honey"), "Korhogo", "CI", 5000, B("500 g", "500 g"),
    B("Apiculteurs", "Beekeepers"), B("Miel de savane, filtré à froid.", "Savannah honey, cold-filtered.")),
  P("ar1", "artisanat", "cloth", B("Toile de Korhogo", "Korhogo cloth"), "Korhogo", "CI", 25000, B("pièce", "piece"),
    B("Artisans peintres", "Painter artisans"), B("Toile de coton peinte à la main selon la tradition sénoufo.", "Cotton cloth hand-painted in the Senufo tradition.")),
  P("ar2", "artisanat", "basket", B("Paniers tressés", "Woven baskets"), "Ségou", "ML", 7500, B("pièce", "piece"),
    B("Vanniers", "Basket weavers"), B("Paniers tressés à la main en fibres naturelles.", "Hand-woven baskets in natural fibres.")),
]

DATA = {"cats": CATS, "products": PRODUCTS, "countries": COUNTRIES, "icons": PIC, "ui": UI}

# ---------- Feuille de style propre à la Marketplace ----------
MARKET_CSS = r"""
  button { font:inherit; }
  button.btn { cursor:pointer; }
  .gold { color:var(--gold-2); }
  .sub .cartbtn { margin-left:auto; display:inline-flex; align-items:center; gap:7px; height:36px; padding:0 8px 0 12px; border:1px solid rgba(232,200,114,.45); border-radius:999px; background:rgba(232,200,114,.08); color:var(--text); font:600 13px 'Space Grotesk', sans-serif; cursor:pointer; }
  .cartbtn svg { width:18px; height:18px; color:var(--gold-2); }
  .cnt { min-width:21px; height:21px; padding:0 6px; border-radius:999px; display:inline-grid; place-items:center; font:700 11px 'JetBrains Mono', monospace; color:#000008; background:linear-gradient(120deg, #F4E7C1, var(--gold-2)); }

  /* Héros */
  .hero .chip svg { width:15px; height:15px; color:var(--gold-2); }
  .flow { position:relative; display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; max-width:560px; margin:20px auto 2px; }
  .flow::before { content:""; position:absolute; left:12%; right:12%; top:22px; height:2px; background:linear-gradient(90deg, var(--gold-2), var(--violet-2), var(--green)); opacity:.65; }
  .fnode { position:relative; display:flex; flex-direction:column; align-items:center; gap:7px; font-size:11.5px; line-height:1.25; color:#CFC6B2; }
  .fnode .hx { width:44px; height:44px; display:grid; place-items:center; clip-path:polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); background:linear-gradient(135deg, #FFF3C4, var(--gold-2) 50%, var(--gold-3)); color:#000008; }
  .fnode .hx svg { width:20px; height:20px; }
  .fnode:nth-child(2) .hx { animation:glow 2.4s ease-in-out infinite; }
  .demo { display:flex; gap:12px; align-items:flex-start; margin-top:14px; padding:14px 16px; border:1px dashed rgba(168,139,255,.55); border-radius:18px; background:rgba(123,92,214,.09); font-size:13.5px; color:#DDD5C3; }
  .demo .ic { color:var(--violet-2); background:rgba(123,92,214,.15); border-color:rgba(168,139,255,.4); }
  .demo b { color:var(--violet-2); }

  /* Filières phares */
  .flagships { display:grid; gap:12px; }
  @media (min-width:760px) { .flagships { grid-template-columns:1fr 1fr; } }
  .fs { position:relative; overflow:hidden; display:flex; flex-direction:column; gap:12px; padding:18px; border-radius:22px; border:1px solid rgba(232,200,114,.5); background:linear-gradient(150deg, var(--fa), rgba(0,0,8,.55) 72%); box-shadow:0 0 26px rgba(201,168,76,.12); }
  .fs::after { content:""; position:absolute; right:-60px; top:-60px; width:180px; height:180px; border-radius:50%; background:radial-gradient(circle, var(--fa), transparent 70%); pointer-events:none; }
  .fs-h { display:flex; align-items:center; gap:14px; }
  .fs .big { flex-shrink:0; width:64px; height:64px; display:grid; place-items:center; border-radius:20px; color:#FFF8E1; background:radial-gradient(circle at 30% 20%, var(--a), var(--b) 80%); border:1px solid rgba(255,255,255,.25); box-shadow:0 10px 26px rgba(0,0,0,.35); }
  .fs .big svg { width:36px; height:36px; }
  .fs small { display:block; font:700 10.5px 'JetBrains Mono', monospace; letter-spacing:.16em; color:var(--gold-2); }
  .fs h3 { font-family:'Playfair Display', Georgia, serif; font-size:22px; }
  .fs p { position:relative; z-index:1; font-size:14px; color:#DDD5C3; }
  .fs .bs { position:relative; z-index:1; align-self:flex-start; }

  /* Catalogue */
  .cats { display:flex; gap:8px; overflow-x:auto; padding:2px 2px 10px; scrollbar-width:none; }
  .cats::-webkit-scrollbar { display:none; }
  .cat { flex-shrink:0; display:inline-flex; align-items:center; gap:7px; height:40px; padding:0 14px; border-radius:999px; border:1px solid var(--line); background:rgba(0,0,8,.45); color:#D9CFB4; font:600 13px 'Space Grotesk', sans-serif; cursor:pointer; transition:all .2s; }
  .cat svg { width:17px; height:17px; color:var(--gold-2); }
  .cat.star { border-color:rgba(232,200,114,.45); }
  .cat .st { color:var(--gold-2); font-size:12px; }
  .cat.on { color:#000008; background:linear-gradient(120deg, #F4E7C1, var(--gold-2)); border-color:transparent; box-shadow:0 0 14px rgba(232,200,114,.4); }
  .cat.on svg, .cat.on .st { color:#000008; }
  .tools { display:flex; gap:8px; align-items:center; margin-top:4px; }
  .search { flex:1; min-width:0; display:flex; align-items:center; gap:8px; height:46px; padding:0 14px; border:1px solid var(--line); border-radius:999px; background:rgba(0,0,8,.55); transition:border-color .2s, box-shadow .2s; }
  .search svg { width:18px; height:18px; flex-shrink:0; color:var(--gold-2); }
  .search input { flex:1; min-width:0; height:100%; border:0; outline:0; background:transparent; color:var(--text); font:500 14.5px 'Space Grotesk', sans-serif; }
  .search input::placeholder { color:#7F7867; }
  .search:focus-within { border-color:var(--gold-2); box-shadow:0 0 0 3px rgba(232,200,114,.14); }
  .fbtn { position:relative; flex-shrink:0; display:inline-flex; align-items:center; gap:7px; height:46px; padding:0 15px; border-radius:999px; border:1px solid var(--line); background:rgba(0,0,8,.55); color:var(--text); font:600 13.5px 'Space Grotesk', sans-serif; cursor:pointer; }
  .fbtn svg { width:18px; height:18px; color:var(--gold-2); }
  .fbtn[aria-expanded="true"] { border-color:var(--gold-2); }
  .fbtn .dot { position:absolute; right:9px; top:9px; width:8px; height:8px; border-radius:50%; background:var(--green); box-shadow:0 0 8px var(--green); display:none; }
  .fbtn .dot.on { display:block; }
  .fpanel { display:none; margin-top:10px; gap:12px; }
  .fpanel.open { display:grid; }
  @media (min-width:760px) { .fpanel.open { grid-template-columns:repeat(3, minmax(0, 1fr)); align-items:end; } }
  .fld { display:flex; flex-direction:column; gap:6px; min-width:0; }
  .fld small { font:600 10.5px 'JetBrains Mono', monospace; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); }
  .fld select { width:100%; height:42px; padding:0 12px; border-radius:12px; border:1px solid var(--line); background:#05050F; color:var(--text); font:500 14px 'Space Grotesk', sans-serif; }
  .fld .rng { display:flex; align-items:center; gap:10px; }
  .fld input[type=range] { flex:1; min-width:0; accent-color:var(--gold-2); }
  .fld .rng b { flex-shrink:0; font-size:12.5px; color:var(--gold-2); min-width:74px; text-align:right; }
  .tg { display:flex; align-items:center; gap:10px; min-height:42px; padding:0 12px; border:1px solid var(--line); border-radius:12px; background:rgba(0,0,8,.4); font-size:13.5px; cursor:pointer; }
  .tg input { width:18px; height:18px; accent-color:var(--gold-2); }
  .count { margin:14px 2px 10px; font-size:12px; letter-spacing:.06em; color:var(--muted); }
  .pgrid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px; }
  @media (min-width:760px) { .pgrid { grid-template-columns:repeat(3, minmax(0, 1fr)); gap:14px; } }
  .pcard { position:relative; display:flex; flex-direction:column; min-width:0; border:1px solid var(--line); border-radius:18px; overflow:hidden; background:linear-gradient(160deg, rgba(255,255,255,.05), rgba(255,255,255,.012)); transition:transform .2s, border-color .2s, box-shadow .2s; animation:monte .35s ease both; }
  @keyframes monte { from { opacity:0; transform:translateY(8px); } }
  .pcard:hover { transform:translateY(-3px); border-color:rgba(232,200,114,.55); box-shadow:0 12px 30px rgba(0,0,0,.45), 0 0 22px rgba(201,168,76,.14); }
  .pcard.star { border-color:rgba(232,200,114,.45); }
  .art, .md-art { position:relative; display:grid; place-items:center; overflow:hidden; background:radial-gradient(circle at 30% 18%, var(--a), var(--b) 78%); }
  .art { height:120px; }
  .art .pat, .md-art .pat { position:absolute; inset:0; width:100%; height:100%; opacity:.2; }
  .art::after, .md-art::after { content:""; position:absolute; inset:0; background:linear-gradient(180deg, transparent 55%, rgba(0,0,8,.45)); }
  .aic { position:relative; z-index:1; width:62px; height:62px; display:grid; place-items:center; border-radius:20px; color:#FFF8E1; background:rgba(0,0,8,.32); border:1px solid rgba(255,255,255,.28); box-shadow:0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18); }
  .aic svg { width:34px; height:34px; }
  .ex { position:absolute; z-index:2; left:8px; top:8px; font:700 9.5px 'JetBrains Mono', monospace; letter-spacing:.12em; color:#EDE6D6; background:rgba(0,0,8,.6); border:1px solid rgba(255,255,255,.22); border-radius:999px; padding:3px 7px; }
  .flag { position:absolute; z-index:2; left:8px; bottom:8px; font:700 9.5px 'JetBrains Mono', monospace; letter-spacing:.04em; color:#000008; background:linear-gradient(120deg, #F4E7C1, var(--gold-2)); border-radius:999px; padding:2px 8px; }
  .fav { position:absolute; z-index:2; right:8px; top:8px; width:34px; height:34px; display:grid; place-items:center; border-radius:50%; border:1px solid rgba(255,255,255,.22); background:rgba(0,0,8,.6); color:#F3EEE2; cursor:pointer; transition:transform .15s; }
  .fav svg { width:17px; height:17px; }
  .fav.on { color:#FF8D8D; border-color:rgba(255,141,141,.5); }
  .fav.on svg { fill:currentColor; }
  .fav:active { transform:scale(.88); }
  .pb { display:flex; flex-direction:column; gap:3px; flex:1; min-width:0; padding:11px 12px 12px; }
  .pb small { font:600 9.5px 'JetBrains Mono', monospace; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pb h3 { font-size:14.5px; line-height:1.25; }
  .loc { display:flex; align-items:flex-start; gap:4px; font-size:12px; color:var(--muted); min-width:0; }
  .loc svg { width:13px; height:13px; flex-shrink:0; margin-top:2px; }
  .loc span { min-width:0; overflow-wrap:anywhere; }
  .price { margin-top:5px; font:700 16px 'JetBrains Mono', monospace; color:var(--gold-2); line-height:1.25; }
  .price span { font:500 11px 'Space Grotesk', sans-serif; color:var(--muted); }
  .prod { font-size:11.5px; color:#B9B09C; }
  .pact { display:grid; grid-template-columns:minmax(0, 1fr) auto; gap:6px; margin-top:auto; padding-top:10px; }
  .bs { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:38px; padding:0 12px; border-radius:999px; border:1px solid var(--line); background:var(--glass); color:var(--text); font:700 12.5px 'Space Grotesk', sans-serif; cursor:pointer; white-space:nowrap; }
  .bs svg { width:15px; height:15px; flex-shrink:0; }
  .bs.gold { border:0; color:#000008; background:linear-gradient(120deg, #F4E7C1, var(--gold-2) 45%, var(--gold)); box-shadow:0 0 14px rgba(201,168,76,.25); }
  .bs.icon { width:38px; padding:0; }
  .bs:active, .btn:active { transform:scale(.97); }
  .empty { grid-column:1 / -1; padding:30px 18px; text-align:center; color:var(--muted); border:1px dashed var(--line); border-radius:18px; }
  .empty button { margin-top:12px; }

  /* Journal */
  .jl { list-style:none; display:grid; gap:10px; }
  .jr { display:flex; gap:12px; align-items:flex-start; padding-bottom:10px; border-bottom:1px solid rgba(201,168,76,.12); }
  .jr:last-child { padding-bottom:0; border-bottom:0; }
  .ji { flex-shrink:0; width:34px; height:34px; display:grid; place-items:center; clip-path:polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); background:linear-gradient(135deg, #FFF3C4, var(--gold-2) 50%, var(--gold-3)); color:#000008; }
  .ji svg { width:16px; height:16px; }
  .jr div { min-width:0; display:flex; flex-direction:column; gap:2px; }
  .jr b { font-size:13.5px; overflow-wrap:anywhere; }
  .jr small { font:500 11.5px 'JetBrains Mono', monospace; color:var(--muted); }
  .jr code { font:500 11.5px 'JetBrains Mono', monospace; color:var(--green); overflow-wrap:anywhere; }
  .jr em { font-style:normal; font-size:10.5px; letter-spacing:.06em; color:var(--violet-2); }
  .jempty { font-size:13.5px; color:var(--muted); text-align:center; padding:6px 0; }
  .steps .tag.plan { color:var(--violet-2); border-color:rgba(168,139,255,.4); background:rgba(123,92,214,.10); }

  /* Panier (tiroir) */
  .overlay { position:fixed; inset:0; z-index:40; background:rgba(0,0,8,.7); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); opacity:0; pointer-events:none; transition:opacity .25s; }
  .overlay.on { opacity:1; pointer-events:auto; }
  .drawer { position:fixed; z-index:41; top:0; right:0; bottom:0; width:min(400px, 100%); display:flex; flex-direction:column; background:linear-gradient(180deg, #08081C, #000008 60%); border-left:1px solid var(--line); box-shadow:-20px 0 60px rgba(0,0,0,.5); transform:translateX(102%); transition:transform .3s cubic-bezier(.2,.8,.2,1); visibility:hidden; }
  .drawer.on { transform:none; visibility:visible; }
  .dh { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:16px; border-bottom:1px solid var(--line); }
  .dh h2 { display:flex; align-items:center; gap:10px; font-family:'Playfair Display', Georgia, serif; font-size:21px; }
  .dh h2 svg { width:22px; height:22px; color:var(--gold-2); }
  .icb { flex-shrink:0; width:40px; height:40px; display:grid; place-items:center; border-radius:50%; border:1px solid var(--line); background:rgba(0,0,8,.5); color:var(--text); cursor:pointer; }
  .icb svg { width:18px; height:18px; }
  .dl { flex:1; overflow-y:auto; padding:4px 16px; }
  .crow { display:grid; grid-template-columns:46px minmax(0, 1fr); gap:12px; padding:12px 0; border-bottom:1px solid rgba(201,168,76,.12); }
  .mini { width:46px; height:46px; display:grid; place-items:center; border-radius:14px; color:#FFF8E1; background:radial-gradient(circle at 30% 20%, var(--a), var(--b) 80%); border:1px solid rgba(255,255,255,.2); }
  .mini svg { width:24px; height:24px; }
  .crow b { display:block; font-size:13.5px; line-height:1.3; }
  .crow small { display:block; font:500 11.5px 'JetBrains Mono', monospace; color:var(--muted); }
  .qty { display:flex; align-items:center; gap:8px; margin-top:8px; }
  .qty button { width:30px; height:30px; display:grid; place-items:center; border-radius:9px; border:1px solid var(--line); background:rgba(0,0,8,.5); color:var(--text); cursor:pointer; }
  .qty button svg { width:15px; height:15px; }
  .qty output { min-width:20px; text-align:center; font:700 13px 'JetBrains Mono', monospace; }
  .qty .lt { margin-left:auto; font:700 13px 'JetBrains Mono', monospace; color:var(--gold-2); }
  .qty .rm { color:#FF9E9E; border-color:rgba(255,141,141,.3); }
  .cempty { display:flex; flex-direction:column; align-items:center; gap:6px; padding:40px 10px; text-align:center; color:var(--muted); font-size:13.5px; }
  .cempty svg { width:40px; height:40px; color:var(--gold); opacity:.7; margin-bottom:6px; }
  .cempty b { color:var(--text); font-size:15px; }
  .df { padding:14px 16px calc(16px + env(safe-area-inset-bottom)); border-top:1px solid var(--line); background:rgba(0,0,8,.6); }
  .tot { display:flex; justify-content:space-between; align-items:baseline; gap:10px; font-size:14px; color:var(--muted); }
  .tot b { font:700 19px 'JetBrains Mono', monospace; color:var(--gold-2); }
  .df .fine { margin:8px 0 12px; }
  .wide { width:100%; }
  .btn[disabled] { opacity:.45; pointer-events:none; }

  /* Fenêtres */
  .mwrap { position:fixed; inset:0; z-index:50; display:none; place-items:center; padding:16px; background:rgba(0,0,8,.78); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); }
  .mwrap.on { display:grid; }
  .modal { position:relative; width:100%; max-width:520px; max-height:88vh; overflow-y:auto; padding:20px; border-radius:24px; background:linear-gradient(160deg, #0B0B22, #04040F); border:1px solid rgba(232,200,114,.4); box-shadow:0 30px 80px rgba(0,0,0,.6), 0 0 40px rgba(201,168,76,.12); animation:monte .25s ease both; }
  .modal .mx { position:absolute; right:12px; top:12px; z-index:3; }
  .modal h2 { font-family:'Playfair Display', Georgia, serif; font-size:24px; line-height:1.2; padding-right:44px; }
  .modal p { margin-top:10px; font-size:14px; color:#D5CDBB; }
  .md-art { height:150px; margin:-20px -20px 16px; }
  .md-art .aic { width:74px; height:74px; border-radius:24px; }
  .md-art .aic svg { width:40px; height:40px; }
  .kick { display:block; font:700 10.5px 'JetBrains Mono', monospace; letter-spacing:.16em; text-transform:uppercase; color:var(--gold); margin-bottom:4px; }
  .kvs { display:grid; gap:0; margin-top:14px; border:1px solid var(--line); border-radius:16px; padding:2px 14px; background:rgba(0,0,8,.4); }
  .kvs div { display:flex; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px solid rgba(201,168,76,.12); font-size:13.5px; }
  .kvs div:last-child { border-bottom:0; }
  .kvs span { color:var(--muted); flex-shrink:0; }
  .kvs b { text-align:right; font-weight:600; overflow-wrap:anywhere; }
  .kvs code { font:500 12px 'JetBrains Mono', monospace; color:var(--green); overflow-wrap:anywhere; text-align:right; }
  .md-h { display:flex; align-items:center; gap:8px; margin:18px 0 10px; font-size:15px; }
  .md-h svg { width:18px; height:18px; color:var(--gold-2); }
  .tl { list-style:none; position:relative; display:grid; gap:10px; }
  .tl::before { content:""; position:absolute; left:13px; top:8px; bottom:8px; width:2px; background:linear-gradient(180deg, var(--gold-2), var(--violet-2)); opacity:.5; }
  .tl li { position:relative; display:grid; grid-template-columns:28px minmax(0, 1fr) auto; gap:10px; align-items:start; }
  .tl i { width:28px; height:28px; display:grid; place-items:center; font:700 12px 'JetBrains Mono', monospace; font-style:normal; color:#000008; clip-path:polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); background:linear-gradient(135deg, #FFF3C4, var(--gold-2) 50%, var(--gold-3)); }
  .tl li.s-plan i { background:linear-gradient(135deg, #D9CCFF, var(--violet-2)); }
  .tl b { display:block; font-size:13.5px; }
  .tl span { display:block; font-size:12.5px; color:var(--muted); line-height:1.4; }
  .tl em { font-style:normal; font:700 9.5px 'JetBrains Mono', monospace; letter-spacing:.08em; text-transform:uppercase; padding:3px 7px; border-radius:999px; white-space:nowrap; }
  .st-ex { color:var(--gold-2); border:1px solid var(--line); background:rgba(232,200,114,.08); }
  .st-plan { color:var(--violet-2); border:1px solid rgba(168,139,255,.4); background:rgba(123,92,214,.10); }
  .olist { list-style:none; margin-top:12px; border:1px solid var(--line); border-radius:16px; padding:2px 14px; background:rgba(0,0,8,.4); }
  .olist li { display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-bottom:1px solid rgba(201,168,76,.12); font-size:13.5px; }
  .olist li:last-child { border-bottom:0; }
  .olist b { flex-shrink:0; color:var(--gold-2); }
  .mact { display:flex; flex-wrap:wrap; gap:10px; margin-top:18px; }
  .mact .btn { flex:1 1 auto; }
  .mact .btn svg { width:18px; height:18px; flex-shrink:0; }
  /* Code QR d'emballage */
  .qr-label { margin:14px auto 0; width:min(100%, 300px); padding:16px 16px 14px; border-radius:18px; background:#fff; color:#000; text-align:center; box-shadow:0 0 0 1px rgba(232,200,114,.5), 0 0 30px rgba(201,168,76,.18); }
  .qr-label .qr-svg { display:block; width:100%; height:auto; image-rendering:pixelated; }
  .qr-label b { display:block; margin-top:8px; font:700 15px 'Space Grotesk', system-ui, sans-serif; line-height:1.25; color:#000; }
  .qr-label small { display:block; margin-top:3px; font:600 11px 'JetBrains Mono', monospace; letter-spacing:.06em; color:#333; }
  .qr-label .qr-tag { display:inline-block; margin-top:7px; padding:2px 8px; border-radius:999px; border:1px solid #000; font:700 10px 'JetBrains Mono', monospace; letter-spacing:.14em; color:#000; }
  .qr-url { margin-top:12px; padding:9px 12px; border:1px dashed var(--line); border-radius:12px; font:500 11.5px 'JetBrains Mono', monospace; color:var(--gold-2); overflow-wrap:anywhere; text-align:center; }
  .qr-note { margin-top:10px; font-size:12px !important; color:var(--muted) !important; }
  @media print {
    @page { margin:10mm; }
    html, body { background:#fff !important; }
    body * { visibility:hidden !important; }
    .mwrap.on .qr-label, .mwrap.on .qr-label * { visibility:visible !important; }
    .mwrap.on .qr-label { position:fixed; left:0; right:0; top:0; margin:0 auto; width:62mm; padding:4mm; box-shadow:none; border:0.3mm solid #000; }
    .mwrap, .modal { background:none !important; box-shadow:none !important; border:0 !important; animation:none !important; backdrop-filter:none !important; }
  }
  .okbadge { display:inline-flex; align-items:center; gap:8px; margin-bottom:10px; font:700 10.5px 'JetBrains Mono', monospace; letter-spacing:.14em; text-transform:uppercase; color:var(--violet-2); border:1px solid rgba(168,139,255,.45); background:rgba(123,92,214,.12); border-radius:999px; padding:5px 10px; }

  /* Bouton panier flottant + notification */
  .fab { position:fixed; right:14px; bottom:16px; z-index:30; width:56px; height:56px; display:grid; place-items:center; border:0; border-radius:50%; color:#000008; background:linear-gradient(135deg, #FFF3C4, var(--gold-2) 55%, var(--gold)); box-shadow:0 0 24px rgba(201,168,76,.5), 0 10px 24px rgba(0,0,0,.4); cursor:pointer; }
  .fab svg { width:25px; height:25px; }
  .fab .cnt { position:absolute; right:-3px; top:-3px; color:var(--text); background:#14142E; border:1.5px solid var(--gold-2); }
  .fab.bump { animation:bump .45s ease; }
  @keyframes bump { 30% { transform:scale(1.15); } 60% { transform:scale(.95); } }
  .toast { position:fixed; left:0; right:0; bottom:86px; z-index:60; width:fit-content; max-width:min(92vw, 440px); margin:0 auto; transform:translateY(20px); opacity:0; pointer-events:none; padding:12px 16px; border-radius:14px; background:rgba(10,30,22,.95); border:1px solid rgba(61,220,151,.45); color:#D8FFE9; font-size:13.5px; box-shadow:0 12px 30px rgba(0,0,0,.45); transition:all .25s; }
  .toast.on { opacity:1; transform:none; }
  footer { padding-bottom:90px; }
  .ftlinks { display:flex; flex-wrap:wrap; justify-content:center; gap:6px 14px; margin-top:8px; }
  .ftlinks a { color:var(--muted); }
"""

# ---------- Contenu statique ----------
nav = [("index.html", "Accueil", "Home"), ("investissement.html", "Investir", "Invest"), ("tokenisation.html", "Tokeniser", "Tokenize"),
       ("marketplace.html", "Marketplace", "Marketplace"), ("historique.html", "Journal", "Activity log"),
       ("guide.html", "Guide", "Guide"), ("vision.html", "Vision", "Vision")]
nav_html = "".join(f'<a href="{f}"{" class=\"on\" aria-current=\"page\"" if f == "marketplace.html" else ""}>{T(fr, en)}</a>' for f, fr, en in nav)

chips = [("store", "Producteurs locaux", "Local producers"), ("hash", "Lots traçables", "Traceable batches"),
         ("pi", "Paiement en Pi · prévu", "Pi payment · planned"), ("star", "Filières phares", "Flagship sectors")]
chips_html = "".join(f'<span class="chip">{svg(I[i])}{T(fr, en)}</span>' for i, fr, en in chips)

flow = [("store", "Producteur vérifié", "Verified producer"), ("hash", "Lot horodaté", "Timestamped batch"),
        ("pi", "Paiement π", "π payment"), ("truck", "Livraison", "Delivery")]
flow_html = "".join(f'<div class="fnode"><span class="hx">{svg(I[i])}</span><span>{T(fr, en)}</span></div>' for i, fr, en in flow)

countries_in_use = sorted({p["c"] for p in PRODUCTS})
stats = [(str(len(CATS)), "filières", "sectors"), (str(len(PRODUCTS)), "produits d'exemple", "sample products"),
         ("8", "pays de l'UEMOA", "WAEMU countries"), ("π", "paiement prévu en Pi", "payment planned in Pi")]
stats_html = "".join(f'<div class="stat"><b>{v}</b><span>{T(fr, en)}</span></div>' for v, fr, en in stats)

def flag_card(cat, title_fr, title_en, dfr, den, fa):
    c = next(x for x in CATS if x["id"] == cat)
    return f'''<article class="fs" style="--fa:{fa};--a:{c["a"]};--b:{c["b"]}">
      <div class="fs-h"><span class="big">{svg(PIC[c["ic"]])}</span><div><small>{T("★ FILIÈRE PHARE", "★ FLAGSHIP SECTOR")}</small><h3>{T(title_fr, title_en)}</h3></div></div>
      <p>{T(dfr, den)}</p>
      <button type="button" class="bs gold" data-go="{cat}">{T("Voir les produits", "See the products")} →</button>
    </article>'''

flags_html = flag_card("rani", "Raniculture", "Frog farming",
    "Élevage de grenouilles en bassins : écloseries, grossissement, transformation et chaîne du froid.",
    "Frog rearing in ponds: hatcheries, grow-out, processing and cold chain.", "rgba(61,220,151,.20)") + \
  flag_card("myci", "Myciculture (fongiculture)", "Mushroom farming (fungiculture)",
    "Champignons comestibles, dont la volvaire (Volvariella volvacea), champignon local africain cultivé sur paille.",
    "Edible mushrooms, including the paddy-straw mushroom (Volvariella volvacea), a local African species grown on straw.", "rgba(168,139,255,.22)")

road = [
  ("user", "Producteur vérifié", "Verified producer",
   "Le producteur se connecte avec Pi Network (KYC fait sur Pi). Son exploitation est contrôlée avant toute publication.",
   "The producer signs in with Pi Network (KYC done on Pi). Their farm is checked before anything is published.",
   [("KYC Pi", "Pi KYC"), ("Contrôle de l'exploitation", "Farm inspection")]),
  ("store", "Annonce et lot", "Listing and batch",
   "Chaque produit est publié avec son origine, son numéro de lot et sa date de récolte.",
   "Each product is listed with its origin, batch number and harvest date.",
   [("Origine", "Origin"), ("Lot", "Batch"), ("Récolte", "Harvest")]),
  ("pi", "Commande et paiement en Pi", "Order and payment in Pi",
   "Le consommateur commande et paie en Pi dans le Pi Browser. Le serveur vérifie le paiement avant de confirmer la commande.",
   "The consumer orders and pays in Pi inside the Pi Browser. The server verifies the payment before confirming the order.",
   [("Pi SDK", "Pi SDK"), ("Vérification serveur", "Server verification")]),
  ("link", "Traçabilité vérifiable", "Verifiable traceability",
   "Récolte, expédition et livraison sont inscrites au journal d'audit ; les preuves vérifiées sont ancrées sur Stellar.",
   "Harvest, shipping and delivery are recorded in the audit log; verified proofs are anchored on Stellar.",
   [("Journal d'audit", "Audit log"), ("Stellar", "Stellar")]),
]
road_html = "".join(
  f'''<li class="step">
      <div class="node"><span class="mono">{i}</span></div>
      <div class="card glass">
        <div class="step-h">{ic(icn)}<h3>{T(tfr, ten)}</h3></div>
        <p>{T(dfr, den)}</p>
        <div class="tags"><span class="tag plan">{T("Prévu", "Planned")}</span>{"".join(f'<span class="tag">{T(a, b)}</span>' for a, b in tags)}</div>
      </div>
    </li>''' for i, (icn, tfr, ten, dfr, den, tags) in enumerate(road, 1))

HEXP = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><pattern id="hexp" width="28" height="50" patternUnits="userSpaceOnUse"><path d="M14 33L0 25V8l14-8 14 8v17l-14 8v17M14 0v17L0 25v17l14 8 14-8V25l-14-8" fill="none" stroke="#fff" stroke-width="1"/></pattern></defs></svg>'

page = f'''<!DOCTYPE html>
<html lang="fr" data-lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#000008">
<meta name="color-scheme" content="dark">
<title>Marketplace — GeoTerraChain QFS</title>
<meta name="description" content="GeoTerraChain QFS — Marketplace agro-pastorale (démonstration) : du champ au panier, producteurs de l'UEMOA, raniculture et myciculture. Projet indépendant, phase pilote.">
<meta property="og:title" content="GeoTerraChain QFS — Marketplace">
<meta property="og:description" content="Du champ au panier. Marketplace agro-pastorale en démonstration — projet indépendant, phase pilote.">
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
<style>{BASE_CSS}{MARKET_CSS}</style>
<script src="reseau.js"></script>
<script src="clavier.js" defer></script>
</head>
<body>
{HEXP}
<header class="top">
  <div class="bar">
    <a class="brand" href="index.html">
      <img src="logo-160.webp" alt="GeoTerraChain QFS">
      <span><b>GeoTerraChain QFS</b><small>Marketplace · {T("Démo", "Demo")}</small></span>
    </a>
    <span class="badge">{T("PHASE PILOTE", "PILOT PHASE")}</span>
  </div>
  <div class="sub">
    <div class="lang" role="group" aria-label="Langue / Language"><span class="globe" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">{I["globe"]}</svg></span><button type="button" data-l="fr">FR</button><button type="button" data-l="en">EN</button></div>
    <button type="button" class="cartbtn" id="cartbtn" aria-haspopup="dialog">{svg(UI["cart"])}<span>{T("Panier", "Basket")}</span><span class="cnt" id="cartc">0</span></button>
  </div>
  <nav class="nav" aria-label="Navigation">{nav_html}</nav>
</header>
<div class="ticker" aria-hidden="true"><div>{T(
  "MARKETPLACE · DU CHAMP AU PANIER · <b>DÉMONSTRATION</b> · RANICULTURE · MYCICULTURE · UEMOA · TRAÇABILITÉ · PAIEMENT EN PI · <b>PHASE PILOTE</b> ·&nbsp; MARKETPLACE · DU CHAMP AU PANIER · <b>DÉMONSTRATION</b> · RANICULTURE · MYCICULTURE · UEMOA · TRAÇABILITÉ · PAIEMENT EN PI · <b>PHASE PILOTE</b> ·&nbsp;",
  "MARKETPLACE · FROM FIELD TO BASKET · <b>DEMO</b> · FROG FARMING · MUSHROOM FARMING · WAEMU · TRACEABILITY · PAYMENT IN PI · <b>PILOT PHASE</b> ·&nbsp; MARKETPLACE · FROM FIELD TO BASKET · <b>DEMO</b> · FROG FARMING · MUSHROOM FARMING · WAEMU · TRACEABILITY · PAYMENT IN PI · <b>PILOT PHASE</b> ·&nbsp;")}</div></div>

<main>
  <section class="hero" id="haut">
    <span class="eyebrow"><i></i>{T("Marketplace agro-pastorale · Démonstration", "Agro-pastoral marketplace · Demo")}</span>
    <h1>{T("Du champ<br><em>au panier</em>", "From field<br><em>to basket</em>")}</h1>
    <p class="tagline">{T("PRODUIRE · VENDRE · TRACER", "PRODUCE · SELL · TRACE")}</p>
    <p class="lead">{T("Le marché numérique qui reliera les producteurs africains aux consommateurs, avec la traçabilité de chaque lot et un paiement en Pi.",
                       "The digital market that will connect African producers with consumers, with traceability for every batch and payment in Pi.")}</p>
    <div class="chips">{chips_html}</div>
    <div class="flow" aria-hidden="true">{flow_html}</div>
  </section>
  <div class="stats">{stats_html}</div>
  <div class="demo" role="note">{ic("info")}<p>{T(
    "<b>Mode démonstration.</b> Les produits, prix et producteurs sont des exemples. Aucune vente, aucun paiement, aucune donnée personnelle collectée et aucune inscription sur la blockchain.",
    "<b>Demo mode.</b> Products, prices and producers are examples. No sale, no payment, no personal data collected and nothing written to the blockchain.")}</p></div>

  <section class="block" id="phares">
    {sec_head("★", "star", "Filières phares", "Flagship sectors", "Deux filières au cœur du projet GeoTerraChain QFS.", "Two sectors at the heart of GeoTerraChain QFS.")}
    <div class="flagships">{flags_html}</div>
  </section>

  <section class="block" id="catalogue">
    {sec_head("01", "cart", "Catalogue", "Catalogue", "Prix d'exemple en francs CFA (XOF), donnés à titre indicatif.", "Sample prices in CFA francs (XOF), for illustration only.")}
    <div class="cats" id="cats" role="group" aria-label="Catégories"></div>
    <div class="tools">
      <label class="search">{svg(UI["search"])}<input id="q" type="search" autocomplete="off" enterkeyhint="search" placeholder="Produit, ville, filière…"></label>
      <button type="button" class="fbtn" id="fbtn" aria-expanded="false" aria-controls="fpanel">{svg(UI["filter"])}<span>{T("Filtres", "Filters")}</span><i class="dot" id="fdot"></i></button>
    </div>
    <div class="fpanel glass" id="fpanel">
      <label class="fld"><small>{T("Pays", "Country")}</small><select id="fc"></select></label>
      <label class="fld"><small>{T("Prix maximum", "Maximum price")}</small><span class="rng"><input type="range" id="fp" min="500" max="30000" step="500" value="30000"><b class="mono" id="fpv"></b></span></label>
      <label class="fld"><small>{T("Trier par", "Sort by")}</small><select id="fs"></select></label>
      <label class="tg"><input type="checkbox" id="fstar"><span>{T("Filières phares uniquement", "Flagship sectors only")}</span></label>
      <label class="tg"><input type="checkbox" id="ffav"><span>{T("Mes favoris uniquement", "My favourites only")}</span></label>
      <button type="button" class="bs" id="freset">{T("Réinitialiser les filtres", "Reset filters")}</button>
    </div>
    <p class="count mono" id="count" aria-live="polite"></p>
    <div class="pgrid" id="grid"></div>
  </section>

  <section class="block" id="journal">
    {sec_head("02", "link", "Journal de traçabilité", "Traceability log", "Démonstration : les évènements restent sur votre appareil, le temps de la visite.", "Demo: events stay on your device, for this visit only.")}
    <div class="glass"><ol class="jl" id="jl"></ol></div>
  </section>

  <section class="block" id="fonctionnement">
    {sec_head("03", "rocket", "Comment fonctionnera la Marketplace", "How the Marketplace will work", "Après la phase pilote, étape par étape.", "After the pilot phase, step by step.")}
    <ol class="steps">{road_html}</ol>
    <div class="cta">
      <button type="button" class="btn btn-gold" id="sell">{ic("store")}{T("Vendre mes produits", "Sell my products")}</button>
      <a class="btn" href="tokenisation.html">{ic("cube")}{T("Tokeniser un actif agro-pastoral", "Tokenize an agro-pastoral asset")}</a>
      <a class="btn" href="guide.html">{ic("book")}{T("Guide", "Guide")}</a>
      <a class="btn" href="index.html">{ic("home")}{T("Accueil", "Home")}</a>
    </div>
    <p class="note">{T("Projet indépendant · Phase pilote. Catalogue de démonstration : produits, prix et producteurs donnés à titre d'exemple. GeoTerraChain QFS ne vous demandera jamais votre phrase secrète de 24 mots.",
      "Independent project · Pilot phase. Demo catalogue: products, prices and producers are examples. GeoTerraChain QFS will never ask for your 24-word secret phrase.")}</p>
  </section>
</main>
<footer><b>GeoTerraChain QFS</b> · Marketplace<br>{T("Développé par @Hilaila · Côte d'Ivoire · UEMOA · 2026", "Built by @Hilaila · Côte d'Ivoire · WAEMU · 2026")}
  <div class="ftlinks"><a href="privacy.html">{T("Confidentialité", "Privacy")}</a><a href="termes.html">{T("Conditions d'utilisation", "Terms of use")}</a><a href="guide-aide-geoterrachain-qfs.html">{T("Guide & Aide", "Guide & Help")}</a></div>
</footer>

<button type="button" class="fab" id="fab" aria-haspopup="dialog" aria-label="Mon panier">{svg(UI["cart"])}<span class="cnt" id="fabc">0</span></button>
<div class="overlay" id="ov"></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="dt" aria-hidden="true">
  <div class="dh"><h2 id="dt">{svg(UI["cart"])}{T("Mon panier", "My basket")}</h2><button type="button" class="icb" id="dclose" aria-label="Fermer">{svg(UI["x"])}</button></div>
  <div class="dl" id="dl"></div>
  <div class="df">
    <div class="tot"><span>{T("Sous-total", "Subtotal")}</span><b id="subt">0 XOF</b></div>
    <p class="fine">{T("Paiement en Pi prévu après la phase pilote. Aucun taux de conversion n'est appliqué dans cette démonstration.", "Payment in Pi is planned after the pilot phase. No conversion rate is applied in this demo.")}</p>
    <button type="button" class="btn btn-gold wide" id="checkout">{T("Simuler la commande", "Simulate the order")} →</button>
  </div>
</aside>
<div class="mwrap" id="mw" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="modal"><button type="button" class="icb mx" id="mclose" aria-label="Fermer">{svg(UI["x"])}</button><div id="mbody"></div></div></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script>
var GTC_MARKET = {json.dumps(DATA, ensure_ascii=False)};
</script>
<script>
%%JS%%
</script>
</body>
</html>
'''

JS = open(os.path.join(HERE, "qr.js"), encoding="utf-8").read() + "\n" + open(os.path.join(HERE, "market.js"), encoding="utf-8").read()
page = page.replace("%%JS%%", JS)
open(OUT, "w", encoding="utf-8").write(page)
print("ok", len(page))
