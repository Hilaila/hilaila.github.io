/* GeoTerraChain QFS — échéances foncières (Côte d'Ivoire, terres rurales)
   Calcule, pour un terrain situé en Côte d'Ivoire, la date limite des démarches fixées par :
     - décret n°2023-238 du 5 avril 2023 (procédures d'immatriculation des terres du domaine
       foncier rural), en vigueur depuis le 13 juin 2023 :
         art. 43 : certificat foncier → immatriculation à requérir dans les 10 ans, à compter du
                   13 juin 2023 (certificat plus ancien) ou de la signature du certificat ;
                   au-delà, l'État immatricule au nom du titulaire, qui lui doit tous les frais
                   avant toute transaction ;
         art. 29 : concession provisoire → immatriculation dans les 5 ans (13 juin 2028) ;
     - décret n°2023-378 du 3 mai 2023 (terres sans maître), art. 2 : droits coutumiers non
       constatés dans les 10 ans (13 juin 2033) → terre considérée comme sans maître.
   Calcul indicatif, sans valeur juridique : à vérifier auprès de l'AFOR ou d'un juriste.
   Aucune donnée n'est envoyée ni conservée par ce script. */
(function (root) {
  "use strict";

  var VIGUEUR = "2023-06-13";      // entrée en vigueur des décrets n°2023-238 et n°2023-378
  var PREMIER = "1999-01-01";      // date de signature la plus ancienne acceptée
  var PAYS = "Côte d'Ivoire";
  var MOIS = {
    fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };

  function iso(d) { return d.toISOString().slice(0, 10); }
  function jour(s) { return Date.parse(s + "T00:00:00Z"); }

  // « AAAA-MM-JJ » existant réellement (refuse 2023-02-30), sinon null.
  function dateValide(s) {
    s = String(s || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    var t = jour(s);
    return Number.isFinite(t) && iso(new Date(t)) === s ? s : null;
  }

  // Même jour, n ans plus tard (29 février → 28 février si l'année n'est pas bissextile).
  function ajouterAns(s, n) {
    var a = Number(s.slice(0, 4)) + n, m = Number(s.slice(5, 7)), j = Number(s.slice(8, 10));
    var dernier = new Date(Date.UTC(a, m, 0)).getUTCDate();
    return a + "-" + s.slice(5, 7) + "-" + String(Math.min(j, dernier)).padStart(2, "0");
  }

  function aujourdhui() { return iso(new Date()); }

  // Temps restant entre deux dates : { ans, mois, jours, total (jours) }.
  function ecart(de, a) {
    var y = Number(a.slice(0, 4)) - Number(de.slice(0, 4));
    var m = Number(a.slice(5, 7)) - Number(de.slice(5, 7));
    var d = Number(a.slice(8, 10)) - Number(de.slice(8, 10));
    if (d < 0) { m -= 1; d += new Date(Date.UTC(Number(a.slice(0, 4)), Number(a.slice(5, 7)) - 1, 0)).getUTCDate(); }
    if (m < 0) { y -= 1; m += 12; }
    return { ans: y, mois: m, jours: d, total: Math.round((jour(a) - jour(de)) / 864e5) };
  }

  /* o = { pays, statut, signature (AAAA-MM-JJ, certificat foncier), aujourdhui (facultatif) }
     Renvoie null si aucune règle ne s'applique, sinon :
     { cas: "titre" | "certificat" | "certificat_sans_date" | "coutumier" | "concession",
       date, base, etat: "ok" | "proche" | "depasse" | "info", reste } */
  function calcul(o) {
    o = o || {};
    if (String(o.pays || "").trim() !== PAYS) return null;
    var auj = dateValide(o.aujourdhui) || aujourdhui();
    var r;
    switch (o.statut) {
      case "titre_foncier":
        return { cas: "titre", date: null, base: null, etat: "info", reste: null };
      case "certificat_foncier":
        var sig = dateValide(o.signature);
        if (!sig || sig < PREMIER || sig > auj) {
          return { cas: "certificat_sans_date", date: ajouterAns(VIGUEUR, 10), base: "2023-238 art. 43", etat: "info", reste: null };
        }
        r = sig < VIGUEUR
          ? { cas: "certificat", date: ajouterAns(VIGUEUR, 10), base: "2023-238 art. 43 al. 1", signature: sig }
          : { cas: "certificat", date: ajouterAns(sig, 10), base: "2023-238 art. 43 al. 2", signature: sig };
        break;
      case "coutumier":
        r = { cas: "coutumier", date: ajouterAns(VIGUEUR, 10), base: "2023-378 art. 2" };
        break;
      case "bail":
        r = { cas: "concession", date: ajouterAns(VIGUEUR, 5), base: "2023-238 art. 29 ; 2023-378 art. 2" };
        break;
      default:
        return null;
    }
    r.reste = ecart(auj, r.date);
    r.etat = r.reste.total < 0 ? "depasse" : r.reste.total <= 365 ? "proche" : "ok";
    return r;
  }

  function dateLisible(s, lang) {
    if (!s) return "";
    var l = lang === "en" ? "en" : "fr", j = Number(s.slice(8, 10));
    return (l === "fr" && j === 1 ? "1er" : j) + " " + MOIS[l][Number(s.slice(5, 7)) - 1] + " " + s.slice(0, 4);
  }

  function duree(r, lang) {
    if (!r) return "";                      // titre foncier, certificat sans date : pas de durée
    var en = lang === "en", p = [];
    function n(v, un, plu) { return v + " " + (v > 1 ? plu : un); }
    if (r.ans > 0) p.push(en ? n(r.ans, "year", "years") : n(r.ans, "an", "ans"));
    if (r.mois > 0) p.push(en ? n(r.mois, "month", "months") : r.mois + " mois");
    if (!p.length) p.push(en ? n(Math.max(r.jours, 0), "day", "days") : n(Math.max(r.jours, 0), "jour", "jours"));
    return p.join(en ? " and " : " et ");
  }

  var NOTE = {
    fr: "Calcul indicatif, à vérifier auprès de l'AFOR ou d'un juriste.",
    en: "Indicative calculation, to be checked with AFOR or a lawyer."
  };

  // Texte à afficher : { titre, detail, note } dans la langue demandée.
  function texte(r, lang) {
    if (!r) return null;
    var en = lang === "en", d = dateLisible(r.date, lang), reste = r.reste;
    var t = {
      titre: { fr: "Terre déjà immatriculée : aucune échéance d'immatriculation.",
               en: "Land already registered: no registration deadline." },
      certificat_sans_date: {
        fr: "Indiquez la date de signature du certificat pour calculer l'échéance d'immatriculation : 10 ans après la signature, ou le " + dateLisible(r.date, "fr") + " pour un certificat signé avant le 13 juin 2023.",
        en: "Enter the certificate's signing date to work out the registration deadline: 10 years after signing, or " + dateLisible(r.date, "en") + " for a certificate signed before 13 June 2023." },
      certificat: r.etat === "depasse"
        ? { fr: "Échéance d'immatriculation dépassée depuis le " + d + ".",
            en: "Registration deadline passed on " + d + "." }
        : { fr: "Immatriculation à demander avant le " + d + " (reste " + duree(reste, "fr") + ").",
            en: "Registration to be requested before " + d + " (" + duree(reste, "en") + " left)." },
      coutumier: r.etat === "depasse"
        ? { fr: "Délai de constatation des droits coutumiers dépassé depuis le " + d + ".",
            en: "Deadline to record customary rights passed on " + d + "." }
        : { fr: "Droits coutumiers à faire constater par un certificat foncier avant le " + d + " (reste " + duree(reste, "fr") + ").",
            en: "Customary rights to be recorded by a land certificate before " + d + " (" + duree(reste, "en") + " left)." },
      concession: r.etat === "depasse"
        ? { fr: "S'il s'agit d'une concession provisoire de terre rurale : délai d'immatriculation dépassé depuis le " + d + ".",
            en: "If this is a provisional rural land concession: registration deadline passed on " + d + "." }
        : { fr: "S'il s'agit d'une concession provisoire de terre rurale : immatriculation à faire avant le " + d + " (reste " + duree(reste, "fr") + ").",
            en: "If this is a provisional rural land concession: registration to be done before " + d + " (" + duree(reste, "en") + " left)." }
    };
    var detail = {
      titre: { fr: "", en: "" },
      certificat_sans_date: { fr: "Décret n°2023-238 du 5 avril 2023, article 43.", en: "Decree No. 2023-238 of 5 April 2023, article 43." },
      certificat: { fr: "Au-delà, l'État immatricule la parcelle au nom du titulaire, qui lui doit tous les frais avant toute vente (décret n°2023-238 du 5 avril 2023, article 43).",
                    en: "After that, the State registers the plot in the holder's name; the holder owes it all the costs before any sale (Decree No. 2023-238 of 5 April 2023, article 43)." },
      coutumier: { fr: "Sinon, la terre peut être considérée comme sans maître (décret n°2023-378 du 3 mai 2023, article 2).",
                   en: "Otherwise the land may be treated as ownerless (Decree No. 2023-378 of 3 May 2023, article 2)." },
      concession: { fr: "Sinon, la terre peut être considérée comme sans maître (décret n°2023-238, article 29 ; décret n°2023-378, article 2).",
                    en: "Otherwise the land may be treated as ownerless (Decree No. 2023-238, article 29; Decree No. 2023-378, article 2)." }
    };
    var l = en ? "en" : "fr";
    return { titre: t[r.cas][l], detail: detail[r.cas][l], note: r.cas === "titre" ? "" : NOTE[l] };
  }

  var API = { calcul: calcul, texte: texte, duree: duree, dateLisible: dateLisible, dateValide: dateValide, ajouterAns: ajouterAns, VIGUEUR: VIGUEUR, PREMIER: PREMIER };
  root.GTCFoncier = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : this);
