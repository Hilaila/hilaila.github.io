import json, importlib.util, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
def load(p):
    spec = importlib.util.spec_from_file_location("d", p); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
for src, out in (("dict_tokenisation.py", "tokenisation-en.js"), ("dict_aide.py", "aide-en.js")):
    m = load(os.path.join(HERE, src))
    rx = ",\n  ".join("[new RegExp(%s), %s]" % (json.dumps(a, ensure_ascii=False), json.dumps(b, ensure_ascii=False)) for a, b in m.REGEX)
    js = ("/* Traductions FR → EN (générées) — utilisées par i18n/gtc-i18n.js */\nwindow.GTC_EN = {\n  title: %s,\n  exact: %s,\n  prefix: %s,\n  regex: [\n  %s\n  ]\n};\n" %
          (json.dumps(m.TITLE, ensure_ascii=False), json.dumps(m.EXACT, ensure_ascii=False, indent=1), json.dumps(m.PREFIX, ensure_ascii=False), rx))
    open(os.path.join(REPO, "i18n", out), "w", encoding="utf-8").write(js)
    print(out, len(m.EXACT), "entrées")
