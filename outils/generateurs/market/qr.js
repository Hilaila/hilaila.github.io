/* GeoTerraChain QFS — générateur de code QR (sans dépendance).
   Norme ISO/IEC 18004 : mode octet (UTF-8), versions 1 à 10, niveaux L, M, Q, H,
   correction d'erreurs Reed-Solomon, choix automatique du meilleur masque.
   Usage : GTCQR.make("https://…", "Q") → { size, version, mask, dark(x, y) } */
var GTCQR = (function () {
  "use strict";
  // [octets EC par bloc, blocs groupe 1, octets données groupe 1, blocs groupe 2, octets données groupe 2]
  var TABLE = {
    L: [[7,1,19,0,0],[10,1,34,0,0],[15,1,55,0,0],[20,1,80,0,0],[26,1,108,0,0],[18,2,68,0,0],[20,2,78,0,0],[24,2,97,0,0],[30,2,116,0,0],[18,2,68,2,69]],
    M: [[10,1,16,0,0],[16,1,28,0,0],[26,1,44,0,0],[18,2,32,0,0],[24,2,43,0,0],[16,4,27,0,0],[18,4,31,0,0],[22,2,38,2,39],[22,3,36,2,37],[26,4,43,1,44]],
    Q: [[13,1,13,0,0],[22,1,22,0,0],[18,2,17,0,0],[26,2,24,0,0],[18,2,15,2,16],[24,4,19,0,0],[18,2,14,4,15],[22,4,18,2,19],[20,4,16,4,17],[24,6,19,2,20]],
    H: [[17,1,9,0,0],[28,1,16,0,0],[22,2,13,0,0],[16,4,9,0,0],[22,2,11,2,12],[28,4,15,0,0],[26,4,13,1,14],[26,4,14,2,15],[24,4,12,4,13],[28,6,15,2,16]]
  };
  var FORMAT = { L: 1, M: 0, Q: 3, H: 2 };
  var ALIGN = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

  function utf8(s) {
    if (typeof TextEncoder !== "undefined") return Array.prototype.slice.call(new TextEncoder().encode(String(s)));
    var out = [], b = unescape(encodeURIComponent(String(s)));
    for (var i = 0; i < b.length; i++) out.push(b.charCodeAt(i));
    return out;
  }
  function bit(x, i) { return ((x >>> i) & 1) !== 0; }

  // Reed-Solomon sur GF(256), polynôme 0x11D
  function mul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z & 0xFF;
  }
  function divisor(deg) {
    var r = []; for (var i = 0; i < deg - 1; i++) r.push(0); r.push(1);
    var root = 1;
    for (var k = 0; k < deg; k++) {
      for (var j = 0; j < r.length; j++) { r[j] = mul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      root = mul(root, 2);
    }
    return r;
  }
  function remainder(data, div) {
    var r = div.map(function () { return 0; });
    data.forEach(function (b) {
      var f = b ^ r.shift(); r.push(0);
      div.forEach(function (c, i) { r[i] ^= mul(c, f); });
    });
    return r;
  }

  function codewords(bytes, ver, ecl) {
    var t = TABLE[ecl][ver - 1], ecLen = t[0];
    var dataLen = t[1] * t[2] + t[3] * t[4];
    var bits = [];
    function put(v, n) { for (var i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); }
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    var cap = dataLen * 8;
    put(0, Math.min(4, cap - bits.length));
    while (bits.length % 8) bits.push(0);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) { var v = 0; for (var j = 0; j < 8; j++) v = (v << 1) | bits[i + j]; data.push(v); }
    for (var p = 0; data.length < dataLen; p++) data.push(p % 2 ? 0x11 : 0xEC);
    // Blocs, correction d'erreurs, entrelacement
    var blocks = [], ecs = [], pos = 0, div = divisor(ecLen);
    [[t[1], t[2]], [t[3], t[4]]].forEach(function (g) {
      for (var n = 0; n < g[0]; n++) { var blk = data.slice(pos, pos + g[1]); pos += g[1]; blocks.push(blk); ecs.push(remainder(blk, div)); }
    });
    var out = [], maxLen = Math.max.apply(null, blocks.map(function (b) { return b.length; }));
    for (var k = 0; k < maxLen; k++) blocks.forEach(function (b) { if (k < b.length) out.push(b[k]); });
    for (var e = 0; e < ecLen; e++) ecs.forEach(function (c) { out.push(c[e]); });
    return out;
  }

  function build(ver, ecl, cw, mask) {
    var size = ver * 4 + 17, m = [], fn = [];
    for (var y = 0; y < size; y++) { m.push([]); fn.push([]); for (var x = 0; x < size; x++) { m[y].push(false); fn[y].push(false); } }
    function set(x, y, d) { m[y][x] = d; fn[y][x] = true; }
    for (var i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    [[3, 3], [size - 4, 3], [3, size - 4]].forEach(function (c) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = c[0] + dx, yy = c[1] + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) set(xx, yy, d !== 2 && d !== 4);
      }
    });
    var al = ALIGN[ver - 1], na = al.length;
    for (var a = 0; a < na; a++) for (var b = 0; b < na; b++) {
      if ((a === 0 && b === 0) || (a === 0 && b === na - 1) || (a === na - 1 && b === 0)) continue;
      for (var ay = -2; ay <= 2; ay++) for (var ax = -2; ax <= 2; ax++) set(al[a] + ax, al[b] + ay, Math.max(Math.abs(ax), Math.abs(ay)) !== 1);
    }
    function format(mk) {
      var data = FORMAT[ecl] << 3 | mk, rem = data;
      for (var k = 0; k < 10; k++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bits = (data << 10 | rem) ^ 0x5412;
      for (var i1 = 0; i1 <= 5; i1++) set(8, i1, bit(bits, i1));
      set(8, 7, bit(bits, 6)); set(8, 8, bit(bits, 7)); set(7, 8, bit(bits, 8));
      for (var i2 = 9; i2 < 15; i2++) set(14 - i2, 8, bit(bits, i2));
      for (var i3 = 0; i3 < 8; i3++) set(size - 1 - i3, 8, bit(bits, i3));
      for (var i4 = 8; i4 < 15; i4++) set(8, size - 15 + i4, bit(bits, i4));
      set(8, size - 8, true);
    }
    format(0);
    if (ver >= 7) {
      var rv = ver;
      for (var k2 = 0; k2 < 12; k2++) rv = (rv << 1) ^ ((rv >>> 11) * 0x1F25);
      var vb = ver << 12 | rv;
      for (var v = 0; v < 18; v++) { var c1 = size - 11 + v % 3, c2 = Math.floor(v / 3); set(c1, c2, bit(vb, v)); set(c2, c1, bit(vb, v)); }
    }
    // Placement des données en zigzag
    var n = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (var j = 0; j < 2; j++) {
        var px = right - j, up = ((right + 1) & 2) === 0, py = up ? size - 1 - vert : vert;
        if (!fn[py][px] && n < cw.length * 8) { m[py][px] = bit(cw[n >>> 3], 7 - (n & 7)); n++; }
      }
    }
    function maskOn(mk, x, y) {
      switch (mk) {
        case 0: return (x + y) % 2 === 0;
        case 1: return y % 2 === 0;
        case 2: return x % 3 === 0;
        case 3: return (x + y) % 3 === 0;
        case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
        case 5: return x * y % 2 + x * y % 3 === 0;
        case 6: return (x * y % 2 + x * y % 3) % 2 === 0;
        default: return ((x + y) % 2 + x * y % 3) % 2 === 0;
      }
    }
    function apply(mk) { for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) if (!fn[yy][xx] && maskOn(mk, xx, yy)) m[yy][xx] = !m[yy][xx]; }
    function penalty() {
      var s = 0, dark = 0, line, run, k3;
      for (var r = 0; r < 2; r++) for (var i5 = 0; i5 < size; i5++) {
        line = []; for (var j5 = 0; j5 < size; j5++) line.push(r ? m[j5][i5] : m[i5][j5]);
        run = 1;
        for (var q = 1; q <= size; q++) {
          if (q < size && line[q] === line[q - 1]) run++;
          else { if (run >= 5) s += 3 + run - 5; run = 1; }
        }
        var pat = line.map(function (d) { return d ? 1 : 0; }).join("");
        ["10111010000", "00001011101"].forEach(function (f) { k3 = pat.indexOf(f); while (k3 >= 0) { s += 40; k3 = pat.indexOf(f, k3 + 1); } });
      }
      for (var y2 = 0; y2 < size; y2++) for (var x2 = 0; x2 < size; x2++) {
        if (m[y2][x2]) dark++;
        if (y2 < size - 1 && x2 < size - 1 && m[y2][x2] === m[y2][x2 + 1] && m[y2][x2] === m[y2 + 1][x2] && m[y2][x2] === m[y2 + 1][x2 + 1]) s += 3;
      }
      var total = size * size;
      return s + (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    }
    var best = mask;
    if (best == null) {
      var low = Infinity;
      for (var mk = 0; mk < 8; mk++) { apply(mk); format(mk); var p = penalty(); if (p < low) { low = p; best = mk; } apply(mk); }
    }
    apply(best); format(best);
    return { size: size, version: ver, mask: best, ecl: ecl, dark: function (x, y) { return x >= 0 && y >= 0 && x < size && y < size && m[y][x]; } };
  }

  function make(text, ecl, mask) {
    ecl = TABLE[ecl] ? ecl : "Q";
    var bytes = utf8(text);
    for (var ver = 1; ver <= 10; ver++) {
      var t = TABLE[ecl][ver - 1], dataBits = (t[1] * t[2] + t[3] * t[4]) * 8;
      if (4 + (ver < 10 ? 8 : 16) + bytes.length * 8 <= dataBits) return build(ver, ecl, codewords(bytes, ver, ecl), mask);
    }
    throw new Error("QR_TOO_LONG");
  }

  // Dessin SVG (marge blanche de 4 modules, exigée pour la lecture)
  function svg(q, label) {
    var n = q.size + 8, d = "";
    for (var y = 0; y < q.size; y++) for (var x = 0; x < q.size; x++) if (q.dark(x, y)) d += "M" + (x + 4) + " " + (y + 4) + "h1v1h-1z";
    return '<svg class="qr-svg" viewBox="0 0 ' + n + " " + n + '" role="img" aria-label="' + String(label || "QR").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + '" shape-rendering="crispEdges">' +
      '<rect width="' + n + '" height="' + n + '" fill="#fff"/><path fill="#000" d="' + d + '"/></svg>';
  }

  return { make: make, svg: svg };
})();
