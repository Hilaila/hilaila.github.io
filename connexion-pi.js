/* GeoTerraChain QFS — sphère de connexion Pi (pages avec connexion Pioneer)

   Un écran de connexion plein écran : une sphère de points or et violet qui tourne.
   La sphère EST le bouton : on la touche pour se connecter avec Pi, et elle suit les
   vraies étapes de la connexion :
     1. « Connexion à Pi Network… »      — en attente de l'accord du Pioneer dans le Pi Browser ;
     2. « Vérification de votre identité… » — Pi a répondu, la page termine la connexion ;
     3. « Bienvenue, @nom »              — puis l'écran se ferme et la page continue ;
        ou « Connexion impossible » avec un bouton « Réessayer ».

   La connexion elle-même reste celle de chaque page (même fonction qu'avant) :
     GTCConnexion.lier(bouton, {
       lancer:  () => fonctionDeConnexionDeLaPage(),   // renvoie une promesse
       reussi:  () => true/false,                       // la page est-elle connectée ?
       nom:     () => "pseudo",                         // (facultatif) pour « Bienvenue »
       erreur:  () => "message",                        // (facultatif) message d'erreur de la page
       ouvrirSi: () => true/false,                      // (facultatif) ex. pas déjà connecté
       sinon:   () => ...                               // (facultatif) action si ouvrirSi est faux
     });

   Rien n'est envoyé ni conservé par ce script. Il ne demande jamais la phrase secrète.
   Accessibilité : fenêtre annoncée aux lecteurs d'écran, Échap pour fermer, Tab qui reste
   dans la fenêtre, et animation immobile si le téléphone demande moins d'animations. */
(function () {
  "use strict";
  if (window.GTCConnexion) return;

  /* ---------- Textes FR / EN ---------- */
  var TXT = {
    fr: {
      title: "Connexion Pioneer",
      idle: "Touchez la sphère pour vous connecter avec Pi",
      idleSub: "Seul votre nom d'utilisateur Pi est partagé avec GeoTerraChain QFS.",
      notPiBrowser: "Pour vous connecter, ouvrez GeoTerraChain QFS dans le Pi Browser.",
      pi: "Connexion à Pi Network…",
      piSub: "Acceptez la demande qui s'affiche dans le Pi Browser.",
      verif: "Vérification de votre identité…",
      almost: "Vous avez presque terminé…",
      ok: "Bienvenue",
      okSub: "Connexion réussie.",
      fail: "Connexion impossible",
      failSub: "Pi n'a pas confirmé la connexion. Vérifiez que vous êtes dans le Pi Browser, puis réessayez.",
      slow: "Pi ne répond pas",
      slowSub: "Êtes-vous bien dans le Pi Browser ? Vous pouvez réessayer.",
      retry: "Réessayer",
      close: "Fermer",
      sphere: "Se connecter avec Pi",
      foot: "GeoTerraChain QFS ne demande jamais votre phrase secrète de 24 mots."
    },
    en: {
      title: "Pioneer sign-in",
      idle: "Tap the sphere to sign in with Pi",
      idleSub: "Only your Pi username is shared with GeoTerraChain QFS.",
      notPiBrowser: "To sign in, open GeoTerraChain QFS in the Pi Browser.",
      pi: "Connecting to Pi Network…",
      piSub: "Approve the request shown in the Pi Browser.",
      verif: "Verifying your identity…",
      almost: "Almost done…",
      ok: "Welcome",
      okSub: "Signed in.",
      fail: "Sign-in failed",
      failSub: "Pi did not confirm the sign-in. Make sure you are in the Pi Browser, then try again.",
      slow: "Pi is not responding",
      slowSub: "Are you in the Pi Browser? You can try again.",
      retry: "Try again",
      close: "Close",
      sphere: "Sign in with Pi",
      foot: "GeoTerraChain QFS never asks for your 24-word passphrase."
    }
  };
  function lang() {
    var l = "";
    try { l = localStorage.getItem("gtcLang") || ""; } catch (e) {}
    if (!l) l = document.documentElement.getAttribute("lang") || "fr";
    return String(l).slice(0, 2) === "en" ? "en" : "fr";
  }
  function t(k) { return TXT[lang()][k]; }
  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var inPiBrowser = /PiBrowser/i.test(navigator.userAgent || "");

  /* ---------- Styles ---------- */
  var CSS =
    "#gtc-cx{position:fixed;inset:0;z-index:2147482000;display:none;flex-direction:column;align-items:center;" +
    "background:radial-gradient(circle at 50% 42%,rgba(123,92,214,.20),transparent 58%),radial-gradient(circle at 50% 100%,rgba(232,200,114,.10),transparent 50%),#000008;" +
    "color:#F3EEDF;font:500 15px/1.5 'Space Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;padding:max(14px,env(safe-area-inset-top)) 18px max(18px,env(safe-area-inset-bottom));overflow:auto}" +
    "#gtc-cx.on{display:flex}" +
    "#gtc-cx .cx-top{width:100%;max-width:520px;display:flex;align-items:center;justify-content:space-between;min-height:48px}" +
    "#gtc-cx .cx-x{width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.04);color:#F3EEDF;font:400 22px/1 system-ui,sans-serif;cursor:pointer}" +
    "#gtc-cx .cx-brand{font:700 11.5px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:#E8C872}" +
    "#gtc-cx .cx-msg{margin-top:clamp(10px,4vh,36px);min-height:84px;text-align:center;max-width:440px}" +
    "#gtc-cx .cx-msg h2{margin:0;font:700 clamp(19px,5.2vw,24px)/1.25 'Space Grotesk',system-ui,sans-serif;color:#F3EEDF}" +
    "#gtc-cx .cx-msg p{margin:8px 0 0;font-size:14px;color:#C9C2B0}" +
    "#gtc-cx .cx-zone{position:relative;flex:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:250px}" +
    "#gtc-cx .cx-sphere{position:relative;width:min(76vw,330px);height:min(76vw,330px);border:0;padding:0;border-radius:50%;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    "#gtc-cx .cx-sphere[aria-disabled=true]{cursor:progress}" +
    "#gtc-cx .cx-sphere canvas{position:absolute;inset:0;width:100%;height:100%}" +
    "#gtc-cx .cx-pi{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;display:grid;place-items:center;" +
    "font:800 34px/1 Georgia,'Times New Roman',serif;color:#000008;background:radial-gradient(circle at 35% 30%,#FFF3C4,#E8C872 45%,#B08A2E);" +
    "box-shadow:0 0 26px rgba(232,200,114,.55),0 0 60px rgba(232,200,114,.25);transition:transform .5s ease,opacity .5s ease}" +
    "#gtc-cx[data-etat=pi] .cx-pi,#gtc-cx[data-etat=verif] .cx-pi{transform:scale(.82);opacity:.9}" +
    "#gtc-cx[data-etat=ok] .cx-pi{transform:scale(1.18)}" +
    "#gtc-cx[data-etat=fail] .cx-pi,#gtc-cx[data-etat=slow] .cx-pi{opacity:.55}" +
    "#gtc-cx .cx-act{min-height:64px;display:flex;align-items:center;justify-content:center}" +
    "#gtc-cx .cx-retry{display:none;align-items:center;gap:8px;min-height:46px;padding:0 22px;border-radius:999px;border:1px solid rgba(232,200,114,.6);" +
    "background:rgba(232,200,114,.10);color:#F3EEDF;font:700 15px 'Space Grotesk',system-ui,sans-serif;cursor:pointer}" +
    "#gtc-cx[data-etat=fail] .cx-retry,#gtc-cx[data-etat=slow] .cx-retry{display:inline-flex}" +
    "#gtc-cx .cx-foot{max-width:420px;text-align:center;font-size:12.5px;color:#A8A190;margin-top:6px}" +
    "#gtc-cx .cx-foot b{color:#E8C872;font-weight:700}" +
    "@media (prefers-reduced-motion:reduce){#gtc-cx .cx-pi{transition:none}}";

  /* ---------- Sphère de points ---------- */
  var PAL = {
    idle: ["#E8C872", "#C9A84C", "#FFF3C4", "#E8C872", "#A88BFF"],
    pi: ["#E8C872", "#A88BFF", "#FFF3C4", "#7B5CD6"],
    verif: ["#3DDC97", "#E8C872", "#A88BFF", "#B9F5D8"],
    ok: ["#E8C872", "#FFF3C4", "#3DDC97"],
    fail: ["#8A8373", "#C9A84C", "#5C574C"]
  };
  function Sphere(canvas) {
    var N = 140, pts = [], ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), ph = i * ga;
      pts.push({ x: Math.cos(ph) * r, y: y, z: Math.sin(ph) * r, s: 1.8 + Math.random() * 2.4, k: Math.random() * 6.283, c: Math.floor(Math.random() * 5) });
    }
    var ctx = canvas.getContext("2d"), etat = "idle", t0 = performance.now(), tEtat = t0, raf = 0, w = 0, h = 0, dpr = 1;
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    function frame(now) {
      var t = (now - t0) / 1000, te = (now - tEtat) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
      var actif = etat === "pi" || etat === "verif";
      var vit = reduce ? 0 : (actif ? 0.9 : etat === "fail" || etat === "slow" ? 0.12 : 0.35);
      var rot = t * vit, tilt = 0.38, ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(rot), sr = Math.sin(rot);
      var pal = PAL[etat === "slow" ? "fail" : etat] || PAL.idle;
      // rayon : respiration au repos, convergence puis éclat en cas de succès, dispersion en cas d'échec
      var scale = 1;
      if (!reduce) {
        if (etat === "idle") scale = 1 + 0.025 * Math.sin(t * 1.4);
        else if (etat === "ok") scale = te < 0.45 ? 1 - 0.55 * (te / 0.45) : 0.45 + 0.75 * Math.min(1, (te - 0.45) / 0.6);
        else if (etat === "fail" || etat === "slow") scale = 1 + 0.08 * Math.min(1, te / 0.8);
      }
      var fade = etat === "ok" && !reduce && te > 0.45 ? Math.max(0, 1 - (te - 0.45) / 0.9) : 1;
      var list = [];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var x1 = p.x * cr - p.z * sr, z1 = p.x * sr + p.z * cr;
        var y2 = p.y * ct - z1 * st, z2 = p.y * st + z1 * ct;
        var d = (z2 + 1) / 2;
        var pulse = 1;
        if (!reduce) {
          if (actif) pulse = 1 + 0.55 * Math.max(0, Math.sin(t * 4.2 - p.y * 3.2 + (etat === "verif" ? p.k : 0)));
          else if (etat === "idle") pulse = 1 + 0.12 * Math.sin(t * 1.6 + p.k);
        }
        // couleur : bandes qui défilent pendant la connexion, mélange fixe au repos
        var ci;
        if (actif && !reduce) ci = Math.floor(((p.y + 1) * 2 + t * 0.8)) % pal.length;
        else ci = p.c % pal.length;
        var a = (0.22 + 0.78 * d) * fade * (etat === "fail" || etat === "slow" ? 0.6 : 1);
        list.push({ x: cx + x1 * R * scale, y: cy + y2 * R * scale, r: p.s * (0.45 + 0.8 * d) * pulse, c: pal[ci], a: a, d: d });
      }
      list.sort(function (a, b) { return a.d - b.d; });
      for (var j = 0; j < list.length; j++) {
        var q = list[j];
        ctx.globalAlpha = q.a; ctx.fillStyle = q.c;
        ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(0.6, q.r), 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    return {
      start: function () { size(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
      stop: function () { cancelAnimationFrame(raf); raf = 0; },
      set: function (e) { etat = e; tEtat = performance.now(); if (reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } },
      resize: function () { size(); if (reduce) raf = requestAnimationFrame(frame); }
    };
  }

  /* ---------- Fenêtre ---------- */
  var root = null, sphere = null, opts = null, retour = null, etat = "idle", run = 0, timers = [];
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function build() {
    if (root) return;
    var st = el("style"); st.id = "gtc-cx-style"; st.textContent = CSS; document.head.appendChild(st);
    root = el("div"); root.id = "gtc-cx";
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-labelledby", "gtc-cx-h");
    var top = el("div", "cx-top");
    var x = el("button", "cx-x", "×"); x.type = "button"; x.id = "gtc-cx-x";
    x.addEventListener("click", fermer);
    var brand = el("span", "cx-brand", "GeoTerraChain QFS");
    top.appendChild(x); top.appendChild(brand); top.appendChild(el("span", "", "")).style.width = "46px";
    var msg = el("div", "cx-msg"); msg.setAttribute("aria-live", "polite");
    var h = el("h2"); h.id = "gtc-cx-h"; var p = el("p"); p.id = "gtc-cx-p";
    msg.appendChild(h); msg.appendChild(p);
    var zone = el("div", "cx-zone");
    var b = el("button", "cx-sphere"); b.type = "button"; b.id = "gtc-cx-sphere";
    var cv = el("canvas"); cv.setAttribute("aria-hidden", "true");
    var pi = el("span", "cx-pi", "π"); pi.setAttribute("aria-hidden", "true");
    b.appendChild(cv); b.appendChild(pi); zone.appendChild(b);
    b.addEventListener("click", function () { if (etat === "idle" || etat === "fail" || etat === "slow") lancer(); });
    var act = el("div", "cx-act");
    var r = el("button", "cx-retry"); r.type = "button"; r.id = "gtc-cx-retry";
    r.innerHTML = '<span aria-hidden="true">↻</span><span></span>';
    r.addEventListener("click", lancer);
    act.appendChild(r);
    zone.appendChild(act); // « Réessayer » juste sous la sphère
    var foot = el("p", "cx-foot"); foot.id = "gtc-cx-foot";
    root.appendChild(top); root.appendChild(msg); root.appendChild(zone); root.appendChild(foot);
    document.body.appendChild(root);
    sphere = Sphere(cv);
    // Échap ferme, Tab reste dans la fenêtre (écouté sur tout le document : le focus
    // peut être sur la page un court instant quand un bouton disparaît).
    document.addEventListener("keydown", function (e) {
      if (!root.classList.contains("on")) return;
      if (e.key === "Escape") { e.preventDefault(); fermer(); return; }
      if (e.key !== "Tab") return;
      var f = [].filter.call(root.querySelectorAll("button"), function (n) { return n.offsetParent !== null && !n.disabled; });
      if (!f.length) return;
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === f.length - 1 || i === -1)) { e.preventDefault(); f[0].focus(); }
    });
    window.addEventListener("resize", function () { if (root.classList.contains("on")) sphere.resize(); });
  }
  function texte(h, p) {
    document.getElementById("gtc-cx-h").textContent = h;
    document.getElementById("gtc-cx-p").textContent = p || "";
  }
  function setEtat(e, h, p) {
    etat = e; root.setAttribute("data-etat", e); sphere.set(e === "almost" ? "verif" : e);
    // La sphère reste atteignable au clavier pendant la connexion, mais inactive.
    var sb = document.getElementById("gtc-cx-sphere");
    sb.setAttribute("aria-disabled", (e === "idle" || e === "fail" || e === "slow") ? "false" : "true");
    sb.setAttribute("aria-label", t("sphere"));
    texte(h, p);
    // Le focus reste dans la fenêtre (« Réessayer » disparaît pendant la connexion).
    if (!root.contains(document.activeElement)) { try { sb.focus(); } catch (er) {} }
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function textesFixes() {
    document.getElementById("gtc-cx-x").setAttribute("aria-label", t("close"));
    document.getElementById("gtc-cx-retry").lastChild.textContent = t("retry");
    document.getElementById("gtc-cx-foot").textContent = t("foot");
  }

  // Repère le moment où Pi répond (même fonction de connexion, simplement observée).
  var observe = null;
  function surveillerPi() {
    var P = window.Pi;
    if (!P || typeof P.authenticate !== "function" || P.authenticate.__gtcObs) return;
    var orig = P.authenticate;
    var f = function () {
      var r = orig.apply(this, arguments);
      try { if (r && typeof r.then === "function") r.then(function (a) { if (observe) observe(a); }, function () {}); } catch (e) {}
      return r;
    };
    f.__gtcObs = true;
    try { P.authenticate = f; } catch (e) {}
  }

  function lancer() {
    if (!opts) return;
    clearTimers();
    var id = ++run, nom = null;
    setEtat("pi", t("pi"), t("piSub"));
    surveillerPi();
    observe = function (a) {
      if (id !== run) return;
      try { nom = a && a.user && a.user.username; } catch (e) {}
      if (etat === "pi") {
        setEtat("verif", t("verif"), "");
        timers.push(setTimeout(function () { if (id === run && etat === "verif") setEtat("almost", t("almost"), ""); }, 4500));
      }
    };
    timers.push(setTimeout(function () { if (id === run && etat === "pi") setEtat("slow", t("slow"), t("slowSub")); }, 30000));
    var fin = function () {
      if (id !== run) return;
      clearTimers(); observe = null;
      var ok = false; try { ok = !!opts.reussi(); } catch (e) {}
      if (ok) {
        var n = nom; try { if (opts.nom) n = opts.nom() || n; } catch (e) {}
        setEtat("ok", t("ok") + (n ? ", @" + n : ""), t("okSub"));
        timers.push(setTimeout(function () { if (id === run) fermer(); }, reduce ? 1400 : 1700));
      } else {
        var m = ""; try { if (opts.erreur) m = opts.erreur() || ""; } catch (e) {}
        if (!m && typeof window.Pi === "undefined") m = t("notPiBrowser");
        setEtat("fail", t("fail"), m || t("failSub"));
        try { document.getElementById("gtc-cx-retry").focus(); } catch (e) {}
      }
    };
    var p;
    try { p = opts.lancer(); } catch (e) { p = null; }
    Promise.resolve(p).then(fin, fin);
  }

  function ouvrir(o) {
    build();
    opts = o || {}; run++; clearTimers();
    retour = document.activeElement;
    textesFixes();
    root.classList.add("on");
    document.documentElement.style.overflow = "hidden";
    sphere.start();
    setEtat("idle", t("idle"), inPiBrowser ? t("idleSub") : t("notPiBrowser"));
    try { document.getElementById("gtc-cx-sphere").focus(); } catch (e) {}
  }

  function fermer() {
    if (!root || !root.classList.contains("on")) return;
    run++; clearTimers(); observe = null;
    root.classList.remove("on");
    document.documentElement.style.overflow = "";
    sphere.stop();
    if (retour && retour.focus) try { retour.focus(); } catch (e) {}
  }

  window.GTCConnexion = {
    ouvrir: ouvrir,
    fermer: fermer,
    actif: function () { return !!(root && root.classList.contains("on")); },
    lier: function (bouton, o) {
      if (!bouton) return;
      bouton.addEventListener("click", function (e) {
        if (o.ouvrirSi && !o.ouvrirSi()) { if (o.sinon) o.sinon(); return; }
        e.preventDefault();
        ouvrir(o);
      });
    }
  };
})();
