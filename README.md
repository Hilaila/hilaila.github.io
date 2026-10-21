# GeoTerraChain QFS — application (Pi Network)

Application web de **GeoTerraChain QFS** : tokenisation d'actifs réels africains (foncier, agro-pastoral,
raniculture, myciculture…) sur Pi Network, en **phase pilote** (Pi Testnet, jeton de test GTCπ sur
Stellar Testnet). Projet indépendant — Côte d'Ivoire, zone UEMOA.

- Adresse publique : <https://hilaila.github.io>
- Adresse de test (application Pi Testnet) : <https://hilailagithubio-testnet.vercel.app>
- Serveur : dépôt privé `Hilaila/geoterrachain-qfs-vercel` (Vercel)

> L'application ne demande jamais la phrase secrète de 24 mots d'un Pioneer et n'exige pas de KYC :
> elle accepte les Pioneers vérifiés par Pi Network. Aucune clé ni aucun secret ne doit figurer dans
> ce dépôt public.

## Pages

| Page | Rôle |
|---|---|
| `index.html` | Accueil, connexion Pi, catégories d'actifs, projets publiés. |
| `tokenisation.html` | Tokeniser un actif : 7 étapes, documents, paiement Pi de test, émission GTCπ. |
| `investissement.html` | Projets collectifs : investir, créer un projet (validé par l'administrateur). |
| `pioneer.html` | Mon espace : demandes, documents, statuts. |
| `marketplace.html` | Marketplace agro-pastorale (démonstration), codes QR d'emballage. |
| `historique.html` | Journal administrateur : actions, projets à valider, registre des incidents, incidents du serveur. Aperçu fictif : `historique.html?demo=1`. |
| `vision-geoterrachain-qfs-premium-v2.html` | Vision du projet (`vision.html` redirige vers elle). |
| `pourquoi.html`, `guide.html`, `guide-aide-geoterrachain-qfs.html` | Pourquoi, guide de tokenisation, aide et FAQ. |
| `gtcp-verification.html` | Identité officielle du jeton GTCπ et de son émetteur (Testnet). |
| `mises-a-jour.html` | Historique public des évolutions. |
| `litepaper.html`, `campagne.html` | Litepaper, page « Le film ». |
| `privacy.html`, `termes.html` (`terms.html` redirige) | Confidentialité, conditions d'utilisation. |
| `404.html` | Page introuvable, avec suggestion de la bonne page. |
| `tokenisation-testnet.html` | Ancienne page de test (adresse de redirection de la connexion Pi). Ne pas supprimer. |
| `validation-key.txt` | Clé de validation du domaine pour Pi Network. Ne pas modifier sans instruction de Pi. |

## Éléments partagés

- `reseau.js` (toutes les pages) : bandeau « Hors ligne », nouvel essai automatique des lectures,
  message en cas de limite de demandes (429). Les envois (paiements, demandes) ne sont jamais renvoyés
  automatiquement.
- `i18n/` : traductions anglaises de Tokeniser et de Guide & Aide (`gtc-i18n.js` + dictionnaires).
  Les autres pages contiennent leurs deux langues. Langue mémorisée dans `localStorage` (`gtcLang`).
- `logo-160.webp`, `logo-640.webp` : logo affiché dans les pages ; `logo-final-complet.png` reste
  l'original (aperçus de partage, Developer Portal).
- Réglage « réduire les animations » du téléphone respecté sur toutes les pages.

## Pages générées

Certaines pages sont produites par des scripts (dossier `outils/generateurs/`). Pour les modifier,
changer le script puis régénérer, depuis la racine du dépôt :

```
python3 outils/generateurs/vision/build_vision.py vision-geoterrachain-qfs-premium-v2.html
python3 outils/generateurs/vision/build_maj.py vision-geoterrachain-qfs-premium-v2.html mises-a-jour.html
python3 outils/generateurs/market/build_market.py vision-geoterrachain-qfs-premium-v2.html marketplace.html
python3 outils/generateurs/i18n/gen.py
```

`build_guide.py` (guide.html) et `build_verif.py` (gtcp-verification.html) suivent le même principe.

## Tests

```
npm install --no-save playwright && npx playwright install chromium
node tests/audit-pages.js .
```

Chaque page est chargée sur un écran de téléphone (360 px), en français et en anglais. Le test échoue
en cas d'erreur JavaScript, de débordement, d'image absente ou de lien interne mort. Il est lancé
automatiquement par GitHub Actions à chaque publication (`.github/workflows/verifier-pages.yml`).

## Publication

GitHub Pages publie la branche `main` sur `hilaila.github.io` ; le projet Vercel
`hilaila.github.io-testnet` publie la même branche sur l'adresse de test (dossier de départ : racine).
Méthode : branche dédiée → tests → accord du fondateur → fusion sur `main` → vérification des deux
mises en ligne.

## Assistance

Contact : iyhalob2015outlookfr@gmail.com — voir aussi `guide-aide-geoterrachain-qfs.html` et
`mises-a-jour.html`.
