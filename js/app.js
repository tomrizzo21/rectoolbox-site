/* Escape text for HTML/SVG markup. Use on every name a person typed or a layout file supplied. */
const esc = (v) =>
  String(v == null ? "" : v).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
let S = 3.4,
  VMAX = 175,
  U0 = -15,
  UMAX = 200;
const PL = 14,
  PT = 14,
  PACK = 1.5;
let W = PL * 2 + VMAX * S + 46,
  H = PT * 2 + (UMAX - U0) * S,
  ROT = 0;
const wt = (x, y) => (ROT === 90 ? [H - y, x] : ROT === 180 ? [W - x, H - y] : ROT === 270 ? [y, W - x] : [x, y]);
const wtInv = (X_, Y_) =>
  ROT === 90 ? [Y_, H - X_] : ROT === 180 ? [W - X_, H - Y_] : ROT === 270 ? [W - Y_, X_] : [X_, Y_];
const viewW = () => (ROT % 180 ? H : W),
  viewH = () => (ROT % 180 ? W : H);
let DIR = { v: 166, u: 88 };
const sv = document.getElementById("f");
sv.setAttribute("viewBox", `0 0 ${W} ${H}`);
const X = (v) => PL + (VMAX - v) * S,
  Y = (u) => PT + (u - U0) * S,
  V = (x) => VMAX - (x - PL) / S,
  U = (y) => (y - PT) / S + U0;
const NS = "http://www.w3.org/2000/svg";
function el(t, a, p, txt) {
  const e = document.createElementNS(NS, t);
  for (const k in a) e.setAttribute(k, a[k]);
  if (txt != null) e.textContent = txt;
  p.appendChild(e);
  return e;
}
const $ = (id) => document.getElementById(id);
const DEG = Math.PI / 180;

/* ---------- reference data ---------- */
const WW = "#1D9E75",
  BR = "#D85A30",
  PC = "#888780";
const BANDS = ["63", "125", "250", "500", "1k", "2k", "4k", "8k"];
// kind: colour, glyph, per-player dB SPL at 1 m (ff), directivity (1 = bell forward), spectrum offsets in dB per band
const KIND = {
  cl: { h: 3.0, c: WW, stub: 1.1, dir: "down", L: 95, d: 0.2, sp: [-40, -26, -12, -4, -1, 0, -6, -12] },
  fl: { h: 5.3, c: WW, stub: 1.6, dir: "side", L: 96, d: 0.1, sp: [-45, -35, -14, -3, 0, -4, -12, -20] },
  pic: { h: 5.3, c: WW, stub: 0.9, dir: "side", L: 100, d: 0.1, sp: [-50, -45, -30, -14, -4, 0, -4, -12] },
  sax: { h: 3.6, c: WW, stub: 1.0, dir: "down", L: 99, d: 0.3, sp: [-32, -16, -6, -1, 0, -6, -13, -22] },
  tsx: { h: 3.4, c: WW, stub: 1.0, dir: "down", L: 100, d: 0.3, sp: [-24, -9, -1, 0, -4, -12, -20, -28] },
  tpt: { h: 5.3, c: BR, stub: 1.7, L: 105, d: 0.85, sp: [-30, -20, -10, -3, 0, -1, -8, -18] },
  mel: { h: 5.3, c: BR, stub: 1.6, L: 103, d: 0.8, sp: [-28, -15, -5, 0, -2, -6, -14, -24] },
  bar: { h: 5.4, c: BR, stub: 1.5, L: 102, d: 0.6, sp: [-18, -6, -1, 0, -5, -12, -20, -28] },
  tb: { h: 5.0, c: BR, stub: 3.6, L: 106, d: 0.85, sp: [-24, -10, -3, 0, 0, -4, -12, -22] },
  sou: { h: 7.6, c: BR, bell: 1.5, L: 104, d: 0.5, sp: [-10, -2, 0, -4, -10, -16, -24, -32] },
  snr: { h: 3.2, c: PC, drum: 1, L: 110, d: 0.2, sp: [-14, -6, -2, -3, -2, 0, -1, -4] },
  qd: { h: 3.0, c: PC, drum: 1, L: 108, d: 0.2, sp: [-10, -3, 0, -2, -5, -8, -10, -14] },
  bd: { h: 3.3, c: PC, drum: 1, L: 109, d: 0.2, sp: [-6, 0, -2, -8, -14, -18, -22, -26] },
  drm: { h: 3.0, c: PC, drum: 1, L: 110, d: 0.2, sp: [-2, 0, -4, -6, -6, -6, -8, -12] },
  cym: { h: 5.0, c: PC, cym: 1, L: 112, d: 0, sp: [-40, -30, -20, -10, -4, -2, 0, -2] },
  kck: { h: 2.2, c: PC, drum: 1, L: 104, d: 0.15, sp: [0, -1, -5, -12, -18, -24, -30, -35] },
  tom: { h: 3.0, c: PC, drum: 1, L: 101, d: 0.15, sp: [-8, -1, 0, -3, -9, -15, -22, -28] },
  hh: { h: 4.0, c: PC, cym: 1, L: 98, d: 0, sp: [-45, -35, -22, -10, -3, 0, -1, -5] },
  ssx: { h: 4.4, c: WW, stub: 1.0, dir: "down", L: 94, d: 0.25, sp: [-35, -20, -8, -1, 0, -4, -12, -20] },
  bsx: { h: 3.3, c: WW, stub: 1.1, dir: "down", L: 98, d: 0.3, sp: [-20, -6, 0, -2, -8, -14, -22, -30] },
  pno: { h: 3.3, c: "#6B7280", stub: 1.2, L: 91, d: 0.15, sp: [-15, -8, -3, 0, -2, -5, -9, -14] },
  bas: { h: 3.5, c: "#6B7280", stub: 1.5, L: 92, d: 0.35, sp: [-4, 0, -3, -8, -14, -20, -27, -34] },
  gtr: { h: 3.5, c: "#6B7280", stub: 1.2, L: 96, d: 0.55, sp: [-18, -7, -1, 0, -3, -8, -14, -22] },
  vox: { h: 5.2, c: "#7C3AED", stub: 0.8, L: 90, d: 0.15, sp: [-35, -20, -8, -2, 0, -2, -8, -15] },
};
for (const k in KIND) {
  const lin = KIND[k].sp.map((x) => 10 ** (x / 10)),
    t = lin.reduce((a, b) => a + b, 0);
  KIND[k].bp = lin.map((x) => x / t);
}
const DEF_GROUPS = [
  ["cl2", "Clarinets 2nd part", "cl", 31, 10, 146, 26, "arc"],
  ["cl1", "Clarinets 1st part", "cl", 31, 10, 152, 62, "arc"],
  ["pic", "Piccolos", "pic", 14, 10, 134, 90, "arc"],
  ["fl", "Flutes", "fl", 40, 10, 144, 122, "arc"],
  ["alt", "Alto saxes", "sax", 40, 11, 112, 30, "arc"],
  ["ten", "Tenor saxes", "tsx", 22, 13, 106, 66, "arc"],
  ["mel", "Mellophones", "mel", 30, 13, 100, 98, "arc"],
  ["bar", "Baritones", "bar", 22, 16, 104, 132, "arc"],
  ["t3", "Trumpets 3rd part", "tpt", 18, 12, 66, -8, "arc"],
  ["t2", "Trumpets 2nd part", "tpt", 18, 12, 84, 20, "arc"],
  ["t1", "Trumpets 1st part", "tpt", 18, 12, 124, -4, "arc"],
  ["tba", "Trombones A", "tb", 25, 24, 86, 170, "block"],
  ["tbb", "Trombones B", "tb", 25, 24, 138, 190, "block"],
  ["cym", "Cymbals", "cym", 10, 20, 34, 36, "bunch"],
  ["sou", "Sousaphones", "sou", 36, 26, 34, 164, "bunch"],
  ["snr", "Snares", "snr", 10, 20, 48, 98, "block", 0, "drum"],
  ["qd", "Quads", "qd", 5, 24, 38, 98, "block", 0, "drum"],
  ["bd", "Bass drums", "bd", 7, 26, 28, 98, "block", 0, "drum"],
];
const OWNED0 = Object.fromEntries(Object.entries(MODELS).map(([k, m]) => [k, m.n]));

const dbFor = (k) => {
  const M = MODELS[k];
  if (M && M.db) return M.db;
  if (!M) return null;
  const mm = String(M.model).replace(/ \(XY stereo\)/, "");
  return (
    MICDB.find((r) => r.b === M.brand && (String(r.m) === mm || (String(r.m) === mm + " Ai" && false))) ||
    MICDB.find((r) => r.b + " " + r.m === k.replace(" (XY stereo)", "")) ||
    null
  );
};
const sensOf = (k) => {
  const r = dbFor(k);
  if (r && r.s) return r.s;
  const t = (MODELS[k] || {}).type || "";
  return /Dynamic/.test(t) ? 2 : /Ribbon/.test(t) ? 2 : 12;
};
const sensScale = (k) => Math.max(0.45, Math.min(1.8, Math.pow(sensOf(k) / 10, 0.35)));
function inv() {
  st.inv = st.inv || {};
  const I = st.inv;
  I.micAdd = I.micAdd || {};
  I.cableAdd = I.cableAdd || {};
  I.standOwned = I.standOwned || { boom: null, tall: null, short: null };
  I.standAdd = I.standAdd || {};
  I.snakeAdd = I.snakeAdd || {};
  I.ifaceAdd = I.ifaceAdd || {};
  I.photos = I.photos || {};
  I.acc = I.acc || [
    { name: "Pop filter", owned: null, add: 0 },
    { name: "Vocal isolator", owned: null, add: 0 },
  ];
  for (const x of [
    { name: "Single-channel DI box", owned: 1, add: 0 },
    { name: "Two-channel DI box", owned: 1, add: 0 },
  ])
    if (!I.acc.some((a) => a.name === x.name)) I.acc.push(x);
  I.custom = I.custom || {};
  I.micOwned = I.micOwned || {}; // owned counts you changed from the inventory sheet's (built-in models)
  return I;
}
const avail = (k) => (MODELS[k] ? MODELS[k].n : 0) + ((st && st.inv && st.inv.micAdd[k]) || 0);
const stockAvail = () => {
  const o = {};
  for (const L of LENS) o[L] = (st.stock[L] || 0) + ((st.inv && st.inv.cableAdd[L]) || 0);
  return o;
};
function mergeCustom() {
  if (typeof applyUserMics === "function") applyUserMics(); // mics added with their specs (js/usermics.js) join the Mic database
  for (const k in inv().custom) MODELS[k] = inv().custom[k];
}
/* Owned mic counts: the inventory sheet's, unless changed in Inventory › Mics (kept with the layout, or with the team's
   gear when signed in to a team: js/team.js). Custom models keep their own count. */
function applyMicOwned() {
  const I = inv();
  const seeded = !window.__signedInUser || window.__ownerStock === true;
  for (const k in OWNED0) if (MODELS[k] && !MODELS[k].custom) MODELS[k].n = I.micOwned[k] ?? (seeded ? OWNED0[k] : 0);
}
/* The inventory sheet's mic counts are Tom's gear: a signed-in user sees them only if they are an admin (the owner);
   anyone else signs in to a blank locker and adds what they own. Signed out (the local demo) keeps the sheet. */
function checkOwnerStock() {
  if (typeof account !== "object" || !account.onChange || typeof catalogUI !== "object") return;
  account.onChange(async (u) => {
    window.__signedInUser = !!u;
    let owner = false;
    if (u) {
      try {
        owner = await catalogUI.isAdmin();
      } catch (e) {}
    }
    window.__ownerStock = owner;
    applyMicOwned();
    if (typeof renderInvTabs === "function") renderInvTabs();
    window.dispatchEvent(new Event("rt:inventorychange"));
  });
}
/* Is any inventory defined (something owned or to buy)? Without one the guide neither limits nor counts mics. */
function micInventoryDefined() {
  return Object.keys(MODELS).some((k) => (MODELS[k].n || 0) > 0) || Object.keys(inv().micAdd).some((k) => inv().micAdd[k] > 0);
}
function setMicOwned(k, n) {
  if (!MODELS[k]) return;
  MODELS[k].n = n;
  if (!MODELS[k].custom) inv().micOwned[k] = n;
}
/* "Owned gear": what you have, as opposed to what a layout plans to buy. js/team.js shares it with a team. */
function ownedGear() {
  const I = inv(),
    g = { mics: {}, cables: {}, stands: {}, acc: {}, custom: {} };
  for (const k in MODELS) g.mics[k] = MODELS[k].n || 0;
  for (const L of LENS) g.cables[L] = st.stock[L] || 0;
  for (const k in I.standOwned) g.stands[k] = I.standOwned[k] ?? null;
  I.acc.forEach((a) => (g.acc[a.name] = a.owned ?? null));
  for (const k in I.custom) {
    const { n, ...m } = I.custom[k];
    g.custom[k] = m;
  }
  return g;
}
function applyOwnedGear(g) {
  const I = inv();
  for (const k in g.custom || {}) I.custom[k] = { ...g.custom[k], n: (I.custom[k] && I.custom[k].n) || 0, custom: 1 };
  mergeCustom();
  for (const k in g.mics || {}) setMicOwned(k, Math.max(0, +g.mics[k] || 0));
  for (const L in g.cables || {}) st.stock[L] = Math.max(0, +g.cables[L] || 0);
  for (const k in g.stands || {}) I.standOwned[k] = g.stands[k];
  for (const name in g.acc || {}) {
    const a = I.acc.find((x) => x.name === name);
    if (a) a.owned = g.acc[name];
    else I.acc.push({ name, owned: g.acc[name], add: 0, user: 1 });
  }
}
const PATS = { omni: 1, "wide cardioid": 0.7, cardioid: 0.5, supercardioid: 0.37, hypercardioid: 0.25, "figure-8": 0 };
const DEF_MICS = [
  ["cl1", "MXL 991"],
  ["cl2", "MXL 991"],
  ["fl", "Sennheiser e614"],
  ["pic", "Sennheiser e614"],
  ["alt", "Rode NT5"],
  ["ten", "Rode NT5"],
  ["mel", "Shure SM57"],
  ["bar", "Rode NT1-A"],
  ["t1", "AKG C414B-ULS"],
  ["t2", "Shure SM57"],
  ["t3", "Shure SM57"],
  ["tba", "AKG C414 XLII"],
  ["tbb", "AKG C414 XLII"],
  ["sou", "Rode NT1"],
  ["snr", "Shure SM57", { h: 6 }],
  ["qd", "MXL 991", { h: 8, label: "overhead" }],
  ["bd", "Shure Beta 52A", { h: 3 }],
  [null, "Rode NT4 (XY stereo)", { v: 158, u: 98, h: 10, label: "room" }],
];
const LENS = [50, 25, 20, 10, 6, 3];
const STOCK0 = { 50: 6, 25: 0, 20: 16, 10: 0, 6: 8, 3: 8 };
const BOXES0 = {
  b24: { name: "24-ch snake box", short: "24", trunk: 100, cap: 24, v: 98, u: 78, up: "auto", ups: ["desk"], on: true },
  b20: {
    name: "20-ch snake box",
    short: "20",
    trunk: 50,
    cap: 20,
    v: 58,
    u: 95,
    up: "auto",
    ups: ["desk", "b24"],
    on: true,
  },
  eth: {
    name: "4-ch Ethercon box",
    short: "E4",
    trunk: 30,
    cap: 4,
    v: 57,
    u: 112,
    up: "auto",
    ups: ["desk", "b24", "b20"],
    on: true,
  },
};
const VENUE = { horton: { dc: 4.5, label: "Horton" }, ipf: { dc: 7, label: "IPF" }, out: { dc: 0, label: "outdoors" } };

/* ---------- shapes (local x points the way the group faces) ---------- */
const SHAPES = {
  circle: { label: "Circle", f: (x, y) => x * x + y * y <= 1 },
  block: { label: "Block (2:1, wide side forward)", f: (x, y) => Math.abs(x) <= 0.5 && Math.abs(y) <= 1 },
  arc: {
    label: "Horn arc (curved round the mic)",
    f: (x, y) => {
      const dx = x - 1.7,
        r = Math.hypot(dx, y),
        a = Math.abs(Math.atan2(y, -dx));
      return r >= 1.2 && r <= 2.2 && a <= 0.9;
    },
  },
  fan: {
    label: "Fan (inside a cardioid's front)",
    f: (x, y) => {
      const dx = 1.3 - x,
        r = Math.hypot(dx, y),
        a = Math.abs(Math.atan2(y, dx));
      return dx > 0 && r >= 0.5 && r <= 2.1 && a <= 0.62;
    },
  },
  teardrop: {
    label: "Teardrop (point forward)",
    f: (x, y) => {
      if ((x + 0.3) ** 2 + y * y <= 0.64) return true;
      if (x < -0.3 || x > 1) return false;
      return Math.abs(y) <= (0.8 * (1 - x)) / 1.3;
    },
  },
  bunch: {
    label: "Bunch (loose rounded)",
    f: (x, y) => {
      const a = Math.atan2(y, x),
        r = Math.hypot(x, y);
      return r <= 1 + 0.12 * Math.sin(3 * a) + 0.08 * Math.cos(5 * a);
    },
  },
  custom: { label: "Drawn by hand…", f: (x, y) => x * x + y * y <= 1 },
};
function inPoly(P, x, y) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i],
      [xj, yj] = P[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-9) + xi) c = !c;
  }
  return c;
}
const shapeCache = new Map();
function shapeOf(G) {
  if (G.shape === "custom" && G.poly && G.poly.length > 2) {
    const key = JSON.stringify(G.poly);
    if (!shapeCache.has(key)) {
      const P = G.poly;
      let a = 0;
      for (let i = 0, j = P.length - 1; i < P.length; j = i++) a += P[j][0] * P[i][1] - P[i][0] * P[j][1];
      shapeCache.set(key, {
        f: (x, y) => inPoly(P, x, y),
        au: Math.abs(a) / 2,
        xmax: Math.max(...P.map((q) => q[0])),
        out: P,
      });
    }
    return shapeCache.get(key);
  }
  const S_ = SHAPES[G.shape === "custom" ? "circle" : G.shape] || SHAPES.circle;
  return { f: S_.f, au: S_.au, xmax: S_.xmax, out: outline(G.shape === "custom" ? "circle" : G.shape) };
}
for (const k in SHAPES) {
  let c = 0,
    xm = -9;
  const N = 220,
    R = 3;
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const x = -R + (2 * R * i) / N,
        y = -R + (2 * R * j) / N;
      if (SHAPES[k].f(x, y)) {
        c++;
        if (x > xm) xm = x;
      }
    }
  SHAPES[k].au = c * ((2 * R) / N) ** 2;
  SHAPES[k].xmax = xm;
}
/* Outlines depend only on the shape name; tracing one costs ~0.1 ms and shapeOf() is called hundreds of times per redraw, so trace each once. Callers only read the points. */
const outlineCache = new Map();
function outline(sh) {
  if (!outlineCache.has(sh)) outlineCache.set(sh, traceOutline(sh));
  return outlineCache.get(sh);
}
function traceOutline(sh) {
  const P = [];
  if (sh === "arc") {
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI - 0.9 + (1.8 * i) / 24;
      P.push([1.7 + 2.2 * Math.cos(a), 2.2 * Math.sin(a)]);
    }
    for (let i = 24; i >= 0; i--) {
      const a = Math.PI - 0.9 + (1.8 * i) / 24;
      P.push([1.7 + 1.2 * Math.cos(a), 1.2 * Math.sin(a)]);
    }
    return P;
  }
  if (sh === "fan") {
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI - 0.62 + (1.24 * i) / 20;
      P.push([1.3 + 2.1 * Math.cos(a), 2.1 * Math.sin(a)]);
    }
    for (let i = 20; i >= 0; i--) {
      const a = Math.PI - 0.62 + (1.24 * i) / 20;
      P.push([1.3 + 0.5 * Math.cos(a), 0.5 * Math.sin(a)]);
    }
    return P;
  }
  const f = SHAPES[sh].f;
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * 2 * Math.PI;
    let lo = 0,
      hi = 3.2;
    for (let j = 0; j < 24; j++) {
      const md = (lo + hi) / 2;
      f(Math.cos(a) * md, Math.sin(a) * md) ? (lo = md) : (hi = md);
    }
    P.push([Math.cos(a) * lo, Math.sin(a) * lo]);
  }
  return P;
}

/* ---------- geometry ---------- */
let st,
  sel = null,
  drag = null,
  heatDirty = true;
const area = (G) => G.n * G.a * PACK;
const scaleK = (G) => Math.sqrt(area(G) / shapeOf(G).au);
const reqR = (G) => Math.sqrt(area(G) / Math.PI);
function frame(G) {
  const base = Math.atan2(DIR.u - G.u, DIR.v - G.v) + (G.rot || 0) * DEG;
  const f = { v: Math.cos(base), u: Math.sin(base) };
  return { f, s: { v: -f.u, u: f.v }, ang: base };
}
function toField(G, x, y) {
  const fr = frame(G);
  return { v: G.v + fr.f.v * x + fr.s.v * y, u: G.u + fr.f.u * x + fr.s.u * y };
}
const dist = (a, b) => Math.hypot(a.v - b.v, a.u - b.u);
function micPos(m) {
  if (!m.g) return { v: m.v, u: m.u };
  const G = gOf(m.g);
  return { v: G.v + m.dv, u: G.u + m.du };
}
const gOf = (k) => st.groups.find((x) => x.k === k);
// combined groups: groups sharing a link id share their mic(s); the mics stay attached to the first group
const members = (k) => {
  const G = gOf(k);
  return G && G.link ? st.groups.filter((x) => x.link === G.link) : G ? [G] : [];
};
const memberKeys = (k) => members(k).map((x) => x.k);
const centroid = (gs) => {
  let a = 0,
    b = 0,
    n = 0;
  for (const G of gs) {
    a += G.v * G.n;
    b += G.u * G.n;
    n += G.n;
  }
  return { v: a / n, u: b / n };
};
const ownSum = (by, k) => memberKeys(k).reduce((a, x) => a + (by[x] || 0), 0);
function micAim(m) {
  const p = micPos(m);
  if (m.aim !== "auto") return +m.aim;
  let t;
  if (m.g) t = centroid(members(m.g));
  else {
    let a = 0,
      b = 0,
      n = 0;
    for (const G of st.groups) {
      a += G.v * G.n;
      b += G.u * G.n;
      n += G.n;
    }
    t = { v: a / n, u: b / n };
  }
  return Math.atan2(t.u - p.u, t.v - p.v) / DEG;
}
const pcache = new Map();
function peopleLocal(G) {
  const key = G.shape + "|" + G.n + "|" + G.a + "|" + (G.poly ? JSON.stringify(G.poly).length + ":" + G.poly[0] : "");
  if (pcache.has(key)) return pcache.get(key);
  const k = scaleK(G),
    f = shapeOf(G).f;
  let p = Math.sqrt(G.a * PACK) * 0.95,
    pts = [];
  for (let t = 0; t < 14; t++) {
    pts = [];
    const R = 3 * k;
    for (let x = -R; x <= R; x += p)
      for (let y = -R; y <= R; y += p) {
        const xo = x + (Math.round(y / p) & 1 ? p / 2 : 0);
        if (f(xo / k, y / k)) pts.push([xo, y]);
      }
    if (pts.length >= G.n) break;
    p *= 0.94;
  }
  pts.sort((a, b) => b[0] - a[0] || Math.abs(a[1]) - Math.abs(b[1]));
  pts = pts.slice(0, G.n);
  pcache.set(key, pts);
  return pts;
}
function elevAt(v, u) {
  let h = 0;
  for (const r of (st && st.risers) || [])
    if (Math.abs(u - r.u) <= r.w / 2 && Math.abs(v - r.v) <= r.d / 2 && r.h > h) h = r.h;
  return h;
}
const micZ = (m) => {
  const p = micPos(m);
  return m.h + elevAt(p.v, p.u);
};
function people(G) {
  const fr = frame(G),
    R = st && st.risers && st.risers.length;
  return peopleLocal(G).map(([x, y]) => {
    const v = G.v + fr.f.v * x + fr.s.v * y,
      rawU = G.u + fr.f.u * x + fr.s.u * y,
      u = G.rowStep ? Math.round(rawU / G.rowStep) * G.rowStep : rawU;
    return { v, u, fv: fr.f.v, fu: fr.f.u, e: R ? elevAt(v, u) : 0 };
  });
}
function defaultMicOffset(G, lat) {
  const fr = frame(G),
    k = scaleK(G),
    d = shapeOf(G).xmax * k + 4,
    l = (lat || 0) * k * 2;
  return { dv: fr.f.v * d + fr.s.v * l, du: fr.f.u * d + fr.s.u * l };
}

/* ---------- state ---------- */
function spread(groups) {
  // push groups apart until every pair has a ~6 ft walking/cable lane between their real outlines
  const sup = (G, ux, uu) => {
    const k = scaleK(G),
      fr = frame(G);
    let m = -1e9;
    for (const [x, y] of shapeOf(G).out) {
      const v = fr.f.v * x * k + fr.s.v * y * k,
        u = fr.f.u * x * k + fr.s.u * y * k,
        pr = v * ux + u * uu;
      if (pr > m) m = pr;
    }
    return m;
  };
  for (let it = 0; it < 120; it++) {
    let moved = false;
    const mates = (G) => (G.lock ? groups.filter((x) => x.lock === G.lock) : [G]);
    for (let i = 0; i < groups.length; i++)
      for (let j = i + 1; j < groups.length; j++) {
        const A = groups[i],
          Bq = groups[j],
          d = dist(A, Bq) || 0.1;
        if (d > 80) continue;
        const uv = (Bq.v - A.v) / d,
          uu = (Bq.u - A.u) / d,
          need = sup(A, uv, uu) + sup(Bq, -uv, -uu) + (A.lock && A.lock === Bq.lock ? 1 : 6);
        if (d < need) {
          const push = Math.min(4, (need - d) / 2);
          if (A.lock && A.lock === Bq.lock) {
            A.v -= uv * push;
            A.u -= uu * push;
            Bq.v += uv * push;
            Bq.u += uu * push;
          } else {
            mates(A).forEach((x) => {
              x.v -= uv * push;
              x.u -= uu * push;
            });
            mates(Bq).forEach((x) => {
              x.v += uv * push;
              x.u += uu * push;
            });
          }
          moved = true;
        }
      }
    for (const g of groups) {
      const r = reqR(g);
      g.v = Math.min(Math.max(g.v, r * 0.6), VMAX - 8);
      g.u = Math.min(Math.max(g.u, U0 + r * 0.7), UMAX - r * 0.7);
      if (dist(g, DIR) < r + 16) {
        const d = dist(g, DIR) || 1;
        g.v = DIR.v + ((g.v - DIR.v) / d) * (r + 16);
        g.u = DIR.u + ((g.u - DIR.u) / d) * (r + 16);
      }
    }
    if (!moved) break;
  }
}
function fresh() {
  const groups = DEF_GROUPS.map(([k, l, kind, n, a, v, u, shape, rot, lock]) => ({
    k,
    l,
    kind,
    n,
    a,
    v,
    u,
    shape,
    rot: 0,
    lock: lock || null,
  }));
  spread(groups);
  const s = {
    groups,
    mics: [],
    boxes: clone(BOXES0),
    desk: { v: 173, u: 100 },
    stock: { ...STOCK0 },
    buy: false,
    meters: [],
    nextId: 1,
    inv: {},
  };
  st = s;
  inv();
  for (const [g, model, o] of DEF_MICS) {
    const M = MODELS[model],
      m = {
        id: "m" + s.nextId++,
        g,
        model,
        aim: "auto",
        h: (o && o.h) || 7,
        route: "auto",
        pat: M.pat === "xy" ? "cardioid" : M.pat,
        label: (o && o.label) || "",
      };
    if (g) Object.assign(m, defaultMicOffset(gOf(g), o && o.lat));
    else {
      m.v = o.v;
      m.u = o.u;
    }
    s.mics.push(m);
  }
  return s;
}
/* Undo/redo: every save() that changes the layout (outside a drag) pushes the previous layout. A whole drag is one step. */
const UNDO_MAX = 60;
let undoStack = [],
  redoStack = [],
  lastSavedJSON = null;
function save() {
  const j = JSON.stringify(st);
  if (!drag) {
    if (lastSavedJSON !== null && j !== lastSavedJSON) {
      undoStack.push(lastSavedJSON);
      if (undoStack.length > UNDO_MAX) undoStack.shift();
      redoStack = [];
    }
    lastSavedJSON = j;
  }
  store.setRaw("rt-fh-planner-v4", j);
  if (typeof files === "object") files.title(); // "•" in the title when the open layout has unsaved changes
  if (typeof team === "object") team.changed(); // owned gear shared with a team uploads
}
function applyLayout(json) {
  st = upgrade(JSON.parse(json));
  st.risers = st.risers || [];
  inv();
  mergeCustom();
  applyMicOwned();
  if (typeof team === "object") team.afterLayout(); // a team's gear wins over the gear saved in the layout
  sel = null;
  lastSavedJSON = json;
  applyBg();
  heatDirty = true;
  draw();
}
function undo() {
  if (!undoStack.length) {
    status("Nothing to undo.");
    return;
  }
  redoStack.push(JSON.stringify(st));
  applyLayout(undoStack.pop());
  status(`Undone. ${undoStack.length} more step${undoStack.length === 1 ? "" : "s"} available.`);
}
function redo() {
  if (!redoStack.length) {
    status("Nothing to redo.");
    return;
  }
  undoStack.push(JSON.stringify(st));
  applyLayout(redoStack.pop());
  status("Redone.");
}
// Layout checkpoints preserve independent copies; neither saving nor downloading changes the active scene.
const LAYOUT_SNAPSHOTS_KEY = "rt-fh-snapshots-v1",
  ORIGINAL_LAYOUT_ID = "before-field-change-2026-11-01";
// rt-fh-ui-v1 stays listed so layouts saved before js/settings.js restore their view settings (settings.js re-reads it).
const LAYOUT_SETTING_KEYS = ["rt-fh-dock-v1", "rt-fh-ui-v1", "rt-settings-v1", "rt-fh-guide-v1", "rt-fh-conhide"];
function layoutSnapshots() {
  const raw = localStorage.getItem(LAYOUT_SNAPSHOTS_KEY);
  if (raw === null) return [];
  const list = JSON.parse(raw);
  if (!Array.isArray(list)) throw Error("The saved-layout library could not be read. It has been left untouched.");
  return list;
}
function saveLayoutSnapshot(name, state = st, id) {
  const list = layoutSnapshots();
  if (id && list.some((x) => x.id === id)) return list.find((x) => x.id === id);
  const snap = {
    format: "rec-toolbox-layout",
    version: 1,
    id: id || "layout-" + Date.now() + "-" + Math.random().toString(36).slice(2),
    name: name.trim() || "Untitled layout",
    createdAt: new Date().toISOString(),
    state: clone(state),
    settings: {},
  };
  if (!valid(snap.state)) throw Error("No valid layout to save.");
  LAYOUT_SETTING_KEYS.forEach((k) => (snap.settings[k] = localStorage.getItem(k)));
  list.push(snap);
  localStorage.setItem(LAYOUT_SNAPSHOTS_KEY, JSON.stringify(list));
  return snap;
}
function checkpointOriginalLayout(state) {
  try {
    saveLayoutSnapshot("Original field recording — before new layout (2026-11-01)", state, ORIGINAL_LAYOUT_ID);
  } catch (e) {
    window.layoutCheckpointError = "Could not preserve the original layout: " + e.message;
  }
}
function refreshLayoutSnapshots(selected) {
  const select = $("savedLayouts");
  select.replaceChildren();
  layoutSnapshots().forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
  if (selected) select.value = selected;
  $("bRestoreLayout").disabled = $("bDownloadLayout").disabled = !select.options.length;
}
function restoreLayoutBackup(backup) {
  const wrapped = backup && backup.format === "rec-toolbox-layout";
  if (wrapped && backup.version !== 1) throw Error("This backup version is not supported.");
  const state = wrapped ? backup.state : backup;
  if (!valid(state)) throw Error("This file is not a layout from this planner.");
  const next = JSON.stringify(upgrade(clone(state))),
    settings = wrapped ? backup.settings || {} : {};
  for (const key of LAYOUT_SETTING_KEYS)
    if (settings[key] != null) {
      if (typeof settings[key] !== "string") throw Error("Invalid saved settings.");
      JSON.parse(settings[key]);
    }
  const safety = saveLayoutSnapshot("Before restoring " + (backup.name || "imported layout"));
  const keys = ["rt-fh-planner-v4", ...LAYOUT_SETTING_KEYS],
    previous = {};
  keys.forEach((k) => (previous[k] = localStorage.getItem(k)));
  try {
    localStorage.setItem("rt-fh-planner-v4", next);
    for (const k of LAYOUT_SETTING_KEYS)
      if (Object.prototype.hasOwnProperty.call(settings, k)) {
        if (settings[k] === null) localStorage.removeItem(k);
        else localStorage.setItem(k, settings[k]);
      }
  } catch (e) {
    for (const k of keys) {
      if (previous[k] === null) localStorage.removeItem(k);
      else localStorage.setItem(k, previous[k]);
    }
    throw e;
  }
  // Prevent any pending save from writing the outgoing scene while the page reloads.
  st = JSON.parse(next);
  location.reload();
  return safety;
}
function valid(o) {
  return o && Array.isArray(o.groups) && Array.isArray(o.mics) && o.boxes && o.desk;
}
function upgrade(o) {
  const od = (o.groups || []).find((g) => g.k === "drm");
  if (od) {
    const i = o.groups.indexOf(od),
      fr = Math.atan2(DIR.u - od.u, DIR.v - od.v),
      f = { v: Math.cos(fr), u: Math.sin(fr) };
    const mk = (k, l, kind, n, a, off) => ({
      k,
      l,
      kind,
      n,
      a,
      v: od.v + f.v * off,
      u: od.u + f.u * off,
      shape: "block",
      rot: od.rot || 0,
      lock: "drum",
    });
    o.groups.splice(
      i,
      1,
      mk("snr", "Snares", "snr", 10, 20, 10),
      mk("qd", "Quads", "qd", 5, 24, 0),
      mk("bd", "Bass drums", "bd", 7, 26, -10),
    );
    for (const m of o.mics || [])
      if (m.g === "drm") {
        m.g = /52/.test(m.model) ? "bd" : /overhead/.test(m.label || "") ? "qd" : "snr";
        if (m.label === "snares/tenors" || m.label === "bass drums") m.label = "";
      }
  }
  for (const g of o.groups || []) if (g.lock === undefined) g.lock = null;
  for (const x of [...(o.mics || []), ...Object.values(o.boxes || {})]) if ("wire" in x) (x.wire = cleanWire(x.wire)) || delete x.wire;
  o.inv = o.inv || {};
  o.stock = o.stock || { ...STOCK0 };
  for (const L of LENS) if (o.stock[L] == null) o.stock[L] = 0;
  o.meters = o.meters || [];
  o.buy = !!o.buy;
  for (const g of o.groups) {
    g.rot = g.rot || 0;
    if (g.kind === "sax" && g.k === "ten") g.kind = "tsx";
  }
  for (const id in BOXES0) {
    o.boxes[id] = Object.assign({}, BOXES0[id], o.boxes[id] || {});
  }
  return o;
}
function load() {
  const s = store.getRaw("rt-fh-planner-v4");
  if (s === null) return null;
  let o = null;
  try {
    o = JSON.parse(s);
  } catch (e) {
    /* handled below as unreadable */
  }
  if (!valid(o)) {
    store.keepUnreadable("rt-fh-planner-v4", s, "layout");
    return null;
  }
  try {
    checkpointOriginalLayout(o);
    return upgrade(o);
  } catch (e) {
    console.warn("Saved layout could not be upgraded", e);
    store.keepUnreadable("rt-fh-planner-v4", s, "layout");
    return null;
  }
}

/* ---------- sound model ---------- */
function soundAt(p, opt) {
  // p:{v,u,z?} z = listening height in ft (default 5). Returns {tot, bands[8], by{group:linear}}
  const dc = VENUE[$("venue").value].dc,
    z = p.z ?? 5,
    direct = opt && opt.direct;
  const bands = new Array(8).fill(0),
    by = {};
  let tot = 0;
  const ca0 = opt && opt.mic ? Math.cos(opt.aim) : 0,
    sa0 = opt && opt.mic ? Math.sin(opt.aim) : 0;
  const byB = {};
  for (const G of st.groups) {
    const K = KIND[G.kind];
    let gsum = 0;
    const gb = [0, 0, 0, 0, 0, 0, 0, 0];
    const tilt = G.kind === "sou" ? 0.45 : 0,
      L10 = 10 ** (K.L / 10);
    for (const q of people(G)) {
      const dv = p.v - q.v,
        du = p.u - q.u,
        dz = z - (K.h + (q.e || 0)),
        dh = Math.hypot(dv, du),
        d3 = Math.hypot(dh, dz),
        dm = Math.max(0.6, d3 * 0.3048);
      const fz = tilt,
        fn = Math.hypot(1, fz),
        cosb = d3 > 0.01 ? (dv * q.fv + du * q.fu + dz * fz) / (d3 * fn) : 1;
      const dirG = 1 - K.d + K.d * Math.max(0.15, (1 + cosb) / 2) * 1.5;
      let pg = 1;
      if (opt && opt.mic) {
        const ca = dh > 0.01 ? -(dv * ca0 + du * sa0) / d3 : 1;
        if (opt.xy) {
          const th = Math.acos(Math.max(-1, Math.min(1, ca))),
            g1 = 0.5 + 0.5 * Math.cos(th - 45 * DEG); // th is unsigned (0 to 180°), so this is always the louder of the two capsules
          pg = g1 * g1; // XY pair: a source is heard at the level of the capsule that faces it more (not the average of both, which understates bleed by up to 2 dB)
        } else {
          const g = Math.abs(opt.a + (1 - opt.a) * ca);
          pg = g * g;
        }
      }
      const e = L10 * (dirG / (dm * dm) + (dc && !direct ? 1 / (dc * dc) : 0)) * pg;
      gsum += e;
      for (let bb = 0; bb < 8; bb++) {
        const x = e * K.bp[bb];
        bands[bb] += x;
        gb[bb] += x;
      }
    }
    by[G.k] = gsum;
    byB[G.k] = gb;
    tot += gsum;
  }
  return { tot, bands, by, byB };
}
// arrival-time spread: ms between the first and last section heard at a point
function spreadAt(p) {
  let lo = 1e9,
    hi = -1e9;
  for (const G of st.groups) {
    const k = scaleK(G);
    const d = Math.max(0, Math.hypot(p.v - G.v, p.u - G.u, (p.z ?? 5) - KIND[G.kind].h - elevAt(G.v, G.u)) - 0.5 * k);
    const t = d / 1.125;
    if (t < lo) lo = t;
    if (t > hi) hi = t;
  }
  return hi - lo;
}
const dB = (x) => (x > 0 ? 10 * Math.log10(x) : -99);
function bandColor(i, a) {
  return `hsla(${Math.round((i * 260) / 7)},70%,50%,${a ?? 1})`;
}
function centroidHue(b) {
  let s = 0,
    w = 0;
  b.forEach((x, i) => {
    s += x * i;
    w += x;
  });
  const c = w ? s / w : 3.5;
  return Math.round((c * 260) / 7);
}
const BCF = [63, 125, 250, 500, 1000, 2000, 4000, 8000];
function spPref(kind) {
  const meter = kind === "meter" && $("mtStyle") && $("mtStyle").value !== "same";
  return {
    style: meter ? $("mtStyle").value : ($("spStyle") && $("spStyle").value) || "bars",
    color: meter ? $("mtColor").value : ($("spColor") && $("spColor").value) || "rainbow",
  };
}
function spColor(color, i) {
  return color === "rainbow" ? bandColor(i) : color === "single" ? "var(--mic)" : "var(--mute)";
}
let gradN = 0;
// bands: 8 linear octave levels (63 Hz–8 kHz). Line/area use a log axis from 20 Hz to 25 kHz so every chart has the same grid.
function specSVG(bands, W, H, kind, opt) {
  opt = opt || {};
  const P = spPref(kind),
    d = bands.map(dB),
    mx = opt.ref ?? Math.max(...d),
    rng = opt.range || 30,
    yv = (v) => H - Math.max(0, Math.min(1, (v - mx + rng) / rng)) * H;
  let o = "";
  if (P.style === "third") {
    // 1/3-octave bands 50 Hz–12.5 kHz, smoothly interpolated from the octave data (the model only has octave detail)
    const TC = [
        50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000,
        6300, 8000, 10000, 12500,
      ],
      bw = W / TC.length,
      pts = [[20, d[0] - 6], ...BCF.map((f, i) => [f, d[i]]), [25000, d[7] - 10]];
    TC.forEach((f, j) => {
      let i = pts.findIndex((q) => q[0] >= f);
      if (i <= 0) i = 1;
      const [f0, v0] = pts[i - 1],
        [f1, v1] = pts[i],
        t = (Math.log(f) - Math.log(f0)) / (Math.log(f1) - Math.log(f0) || 1),
        v = v0 + ((v1 - v0) * (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t))))) / 2,
        y = yv(v),
        bi = Math.max(0, Math.min(7, Math.round(Math.log2(f / 63))));
      o += `<rect x="${(j * bw + bw * 0.1).toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * 0.8).toFixed(1)}" height="${Math.max(1, H - y).toFixed(1)}" fill="${spColor(P.color, bi)}"><title>${f >= 1000 ? f / 1000 + "k" : f} Hz: ${v.toFixed(0)} dB</title></rect>`;
    });
    return o;
  }
  if (P.style === "bars") {
    const bw = W / 8;
    d.forEach((v, i) => {
      const y = yv(v);
      o += `<rect x="${(i * bw + bw * 0.1).toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * 0.8).toFixed(1)}" height="${Math.max(1, H - y).toFixed(1)}" fill="${spColor(P.color, i)}"><title>${BANDS[i]} Hz: ${v.toFixed(0)} dB</title></rect>`;
    });
    return o;
  }
  const lx = (f) => ((Math.log10(f) - Math.log10(20)) / (Math.log10(25000) - Math.log10(20))) * W,
    pts = [[20, d[0] - 6], ...BCF.map((f, i) => [f, d[i]]), [25000, d[7] - 10]];
  if (opt.grid !== false)
    for (const f of [100, 1000, 10000])
      o += `<line x1="${lx(f).toFixed(1)}" x2="${lx(f).toFixed(1)}" y1="0" y2="${H}" stroke="var(--rule)" stroke-width="0.6"/>`;
  let path = "";
  for (let f = 20; f <= 25000; f *= 1.05) {
    let i = pts.findIndex((q) => q[0] >= f);
    if (i <= 0) i = 1;
    const [f0, v0] = pts[i - 1],
      [f1, v1] = pts[i],
      t = (Math.log(f) - Math.log(f0)) / (Math.log(f1) - Math.log(f0) || 1),
      s_ = (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) / 2;
    path += (path ? "L" : "M") + lx(f).toFixed(1) + " " + yv(v0 + (v1 - v0) * s_).toFixed(1);
  }
  let stroke = spColor(P.color, 3);
  if (P.color === "rainbow" && !opt.stroke) {
    const id = "spg" + gradN++;
    o += `<defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<stop offset="${(lx(BCF[i]) / W).toFixed(3)}" stop-color="${bandColor(i)}"/>`).join("")}</linearGradient></defs>`;
    stroke = `url(#${id})`;
  }
  if (opt.stroke) stroke = opt.stroke;
  if (P.style === "area") o += `<path d="${path}L${W} ${H}L0 ${H}Z" fill="${stroke}" fill-opacity="0.28"/>`;
  o += `<path d="${path}" fill="none" stroke="${stroke}" stroke-width="${opt.sw || 1.8}" ${opt.dash ? `stroke-dasharray="${opt.dash}"` : ""}/>`;
  return o;
}
function specAxis(kind) {
  const P = spPref(kind);
  if (kind === "diff") P.style = "line";
  if (P.style === "third")
    return `<div class="specl"><span>50</span><span>125</span><span>315</span><span>800</span><span>2k</span><span>5k</span><span>12.5k</span></div>`;
  if (P.style === "bars") return `<div class="specl">${BANDS.map((x) => `<span>${x}</span>`).join("")}</div>`;
  const L = (f) => ((Math.log10(f / 20) / Math.log10(1250)) * 100).toFixed(1);
  return `<div class="specl" style="position:relative;height:12px"><span style="position:absolute;left:0">20</span><span style="position:absolute;left:${L(100)}%">100</span><span style="position:absolute;left:${L(1000)}%">1k</span><span style="position:absolute;left:${L(10000)}%">10k</span><span style="position:absolute;right:0">25k Hz</span></div>`;
}
function specHTML(b, h, kind) {
  return `<svg viewBox="0 0 240 ${h || 46}" width="100%" height="${h || 46}" preserveAspectRatio="none" class="lblk">${specSVG(b, 240, h || 46, kind)}</svg>${specAxis(kind)}`;
}

/* ---------- routing ---------- */
const COMBOS = (() => {
  const L = LENS,
    n = L.length,
    o = [];
  for (let a = 0; a < n; a++) {
    o.push([L[a]]);
    for (let b = a; b < n; b++) {
      o.push([L[a], L[b]]);
      for (let c = b; c < n; c++) {
        o.push([L[a], L[b], L[c]]);
        for (let d = c; d < n; d++) o.push([L[a], L[b], L[c], L[d]]);
      }
    }
  }
  return o;
})();
/* Each combo's total length and per-length counts never change, so work them out once (same order, so ties pick the same combo). */
const COMBO_INFO = COMBOS.map((c) => {
  const cnt = {};
  c.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1));
  return { c, tot: c.reduce((a, b) => a + b, 0), cnt: Object.entries(cnt).map(([x, k]) => [+x, k]) };
});
function bestCombo(need, stock, mode, buy, clean) {
  let best = null;
  for (const { c, tot, cnt } of COMBO_INFO) {
    if (tot < need) continue;
    let bought = 0;
    for (const [x, k] of cnt) {
      const over = k - Math.max(0, stock[x]);
      if (over > 0) {
        if (!buy) {
          bought = -1;
          break;
        }
        bought += over;
      }
    }
    if (bought < 0) continue;
    const sc = clean
      ? bought * 150 + c.length * 100 + tot
      : bought * 5000 + (mode ? tot * 10 + c.length : c.length * 1000 + tot);
    if (!best || sc < best.sc) best = { c, tot, sc };
  }
  return best;
}
// grid router: walks round group footprints (2 ft cells, 0.75 ft margin)
let GC = 2,
  GNV = Math.ceil(VMAX / GC) + 1,
  GNU = Math.ceil((UMAX - U0) / GC) + 1;
function buildGrid() {
  const g = new Uint8Array(GNV * GNU);
  for (const G of st.groups) {
    const k = scaleK(G),
      fr = frame(G),
      f = shapeOf(G).f,
      rb = 3.2 * k + 3;
    const i0 = Math.max(0, Math.floor((G.v - rb) / GC)),
      i1 = Math.min(GNV - 1, Math.ceil((G.v + rb) / GC)),
      j0 = Math.max(0, Math.floor((G.u - rb - U0) / GC)),
      j1 = Math.min(GNU - 1, Math.ceil((G.u + rb - U0) / GC));
    for (let i = i0; i <= i1; i++)
      for (let j = j0; j <= j1; j++) {
        const v = i * GC,
          u = j * GC + U0,
          x = (v - G.v) * fr.f.v + (u - G.u) * fr.f.u,
          y = (v - G.v) * fr.s.v + (u - G.u) * fr.s.u;
        for (const [ox, oy] of [
          [0, 0],
          [0.75, 0],
          [-0.75, 0],
          [0, 0.75],
          [0, -0.75],
        ])
          if (f((x + ox) / k, (y + oy) / k)) {
            g[i * GNU + j] = 1;
            break;
          }
      }
  }
  return g;
}
function clearLine(g, a, b) {
  const L = dist(a, b),
    n = Math.max(1, Math.ceil(L / 0.7));
  for (let t = 1; t < n; t++) {
    const v = a.v + ((b.v - a.v) * t) / n,
      u = a.u + ((b.u - a.u) * t) / n,
      i = Math.round(v / GC),
      j = Math.round((u - U0) / GC);
    if (i >= 0 && i < GNV && j >= 0 && j < GNU && g[i * GNU + j]) return false;
  }
  return true;
}
function route(g, a, b, key) {
  if (rcache.has(key)) return rcache.get(key);
  let out;
  if (clearLine(g, a, b)) out = { pts: [a, b], len: dist(a, b) };
  else {
    const idx = (p) => [
      Math.max(0, Math.min(GNV - 1, Math.round(p.v / GC))),
      Math.max(0, Math.min(GNU - 1, Math.round((p.u - U0) / GC))),
    ];
    const [si, sj] = idx(a),
      [ti, tj] = idx(b),
      N = GNV * GNU,
      gs = new Float32Array(N).fill(1e9),
      par = new Int32Array(N).fill(-1),
      closed = new Uint8Array(N);
    const heap = [];
    const push = (f, n) => {
      heap.push([f, n]);
      let c = heap.length - 1;
      while (c > 0) {
        const p = (c - 1) >> 1;
        if (heap[p][0] <= heap[c][0]) break;
        [heap[p], heap[c]] = [heap[c], heap[p]];
        c = p;
      }
    };
    const pop = () => {
      const top = heap[0],
        last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        let c = 0;
        for (;;) {
          const l = 2 * c + 1,
            r = l + 1;
          let m = c;
          if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
          if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
          if (m === c) break;
          [heap[m], heap[c]] = [heap[c], heap[m]];
          c = m;
        }
      }
      return top;
    };
    const s0 = si * GNU + sj,
      t0 = ti * GNU + tj;
    gs[s0] = 0;
    push(0, s0);
    let found = false;
    while (heap.length) {
      const [, n] = pop();
      if (closed[n]) continue;
      closed[n] = 1;
      if (n === t0) {
        found = true;
        break;
      }
      const i = (n / GNU) | 0,
        j = n % GNU;
      for (let di = -1; di <= 1; di++)
        for (let dj = -1; dj <= 1; dj++) {
          if (!di && !dj) continue;
          const ni = i + di,
            nj = j + dj;
          if (ni < 0 || nj < 0 || ni >= GNV || nj >= GNU) continue;
          const nn = ni * GNU + nj;
          if (g[nn] && nn !== t0 && Math.hypot(ni - si, nj - sj) > 2.1 && Math.hypot(ni - ti, nj - tj) > 2.1) continue;
          const c = gs[n] + (di && dj ? 1.414 : 1) * GC;
          if (c < gs[nn]) {
            gs[nn] = c;
            par[nn] = n;
            push(c + Math.hypot(ni - ti, nj - tj) * GC, nn);
          }
        }
    }
    if (!found) out = { pts: [a, b], len: dist(a, b), blocked: true };
    else {
      const raw = [];
      for (let n = t0; n !== -1; n = par[n]) raw.push({ v: ((n / GNU) | 0) * GC, u: (n % GNU) * GC + U0 });
      raw.reverse();
      raw[0] = a;
      raw[raw.length - 1] = b;
      const pts = [raw[0]];
      let i = 0;
      while (i < raw.length - 1) {
        let j = raw.length - 1;
        while (j > i + 1 && !clearLine(g, raw[i], raw[j])) j--;
        pts.push(raw[j]);
        i = j;
      }
      let len = 0;
      for (let k = 1; k < pts.length; k++) len += dist(pts[k - 1], pts[k]);
      out = { pts, len };
    }
  }
  rcache.set(key, out);
  return out;
}
let rcache = new Map();
function inGroup(p, m) {
  m = m || 0;
  for (const G of st.groups) {
    const k = scaleK(G);
    if (dist(p, G) > 3.2 * k + m + 1) continue;
    const fr = frame(G),
      f = shapeOf(G).f,
      x = (p.v - G.v) * fr.f.v + (p.u - G.u) * fr.f.u,
      y = (p.v - G.v) * fr.s.v + (p.u - G.u) * fr.s.u;
    for (const [ox, oy] of [
      [0, 0],
      [m, 0],
      [-m, 0],
      [0, m],
      [0, -m],
    ])
      if (f((x + ox) / k, (y + oy) / k)) return G;
  }
  return null;
}
// counts groups whose actual footprint (plus a 1.5 ft margin) a straight run passes through
function hitGroups(a, b) {
  const L = dist(a, b);
  let n = 0;
  for (const G of st.groups) {
    const k = scaleK(G),
      rb = 3.2 * k + 2;
    const dv = b.v - a.v,
      du = b.u - a.u,
      L2 = dv * dv + du * du || 1;
    let t = ((G.v - a.v) * dv + (G.u - a.u) * du) / L2;
    t = Math.max(0, Math.min(1, t));
    if (Math.hypot(G.v - (a.v + t * dv), G.u - (a.u + t * du)) > rb) continue;
    const fr = frame(G),
      f = shapeOf(G).f,
      steps = Math.max(2, Math.ceil(L / 1.5));
    for (let i = 1; i < steps; i++) {
      const q = { v: a.v + (dv * i) / steps, u: a.u + (du * i) / steps },
        x = (q.v - G.v) * fr.f.v + (q.u - G.u) * fr.f.u,
        y = (q.v - G.v) * fr.s.v + (q.u - G.u) * fr.s.u;
      let hit = false;
      for (const [ox, oy] of [
        [0, 0],
        [0.5, 0],
        [-0.5, 0],
        [0, 0.5],
        [0, -0.5],
      ])
        if (f((x + ox) / k, (y + oy) / k)) {
          hit = true;
          break;
        }
      if (hit) {
        n++;
        break;
      }
    }
  }
  return n;
}
/* Hand-drawn cables (docs/CABLE_ROUTING_PLAN.md): a mic's m.wire or a box's b.wire = { to, via: [{v,u}…] }.
   The ends are the mic/box and its target, so they follow when things move; the pivots in via stay put. Smart route
   never changes them; the solver still picks the XLR pieces and checks stock and channel limits. */
function wireTarget(w, from) {
  if (!w || !Array.isArray(w.via)) return null;
  if (w.to === "desk") return st.desk;
  const b = st.boxes[w.to];
  return b && b.on && b !== from ? b : null;
}
function polyLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]);
  return L;
}
function cleanWire(w) {
  if (!w || typeof w !== "object" || typeof w.to !== "string" || !Array.isArray(w.via)) return undefined;
  const via = w.via.filter((p) => p && Number.isFinite(p.v) && Number.isFinite(p.u)).map((p) => ({ v: +p.v, u: +p.u }));
  return { to: w.to, via };
}
function solve(o) {
  o = o || {};
  const clean = (o.clean ?? st.cleanAlloc) && (o.buy ?? st.buy),
    buy = o.buy ?? st.buy,
    noCross = o.noCross ?? !!st.noCross,
    paths = noCross && !o.fast;
  rcache = new Map();
  const grid = paths ? buildGrid() : null;
  const rk = (a, b) => `${a.v.toFixed(1)},${a.u.toFixed(1)}>${b.v.toFixed(1)},${b.u.toFixed(1)}`;
  const crosses = (a, b) => hitGroups(a, b);
  const B = st.boxes,
    desk = st.desk,
    res = {
      boxUp: {},
      mic: {},
      warn: [],
      used: Object.fromEntries(LENS.map((l) => [l, 0])),
      left: {},
      bought: Object.fromEntries(LENS.map((l) => [l, 0])),
      pieces: 0,
      len: 0,
      cross: 0,
    };
  for (const id of ["b24", "b20", "eth"]) {
    const b = B[id];
    if (!b.on) {
      res.boxUp[id] = null;
      continue;
    }
    const wt = wireTarget(b.wire, b);
    if (wt) {
      const pts = [b, ...b.wire.via, wt],
        need = Math.round(polyLen(pts) * (b.wire.via.length ? 1.05 : 1.1) + 2), // same slack as smart route's runs
        fits = need <= b.trunk;
      res.boxUp[id] = { u: b.wire.to, need, fits, pts, wired: true };
      if (!fits) res.warn.push(`${esc(b.name)}: its ${b.trunk} ft trunk can't reach along the hand-drawn path (${need} ft needed)`);
      continue;
    }
    if (b.wire) res.warn.push(`${esc(b.name)}: its hand-drawn trunk goes to a box that's switched off; routed automatically`);
    const opts = b.up === "auto" ? b.ups : [b.up];
    let best = null;
    for (const u of opts) {
      if (u !== "desk" && !B[u].on) continue;
      const tgt = u === "desk" ? desk : B[u];
      const rt = paths ? route(grid, b, tgt, rk(b, tgt)) : null;
      const need =
        Math.round((rt && !rt.blocked ? rt.len * 1.05 : dist(b, tgt) * 1.1) + 2) + (rt && rt.blocked ? 999 : 0);
      const fits = need <= b.trunk;
      if (!best || (fits && !best.fits) || (fits === best.fits && need < best.need))
        best = { u, need, fits, pts: rt && rt.pts };
    }
    res.boxUp[id] = best;
    if (best && !best.fits)
      res.warn.push(`${esc(b.name)}: its ${b.trunk} ft trunk can't reach (${best.need} ft needed)`);
  }
  const boxOK = (id) => {
    const u = B[id].on && res.boxUp[id];
    return !!(u && u.fits && (u.u === "desk" || boxOK(u.u)));
  };
  const cand = (m) => {
    const p = micPos(m),
      ch = MODELS[m.model].ch || 1,
      list = [];
    const wt = wireTarget(m.wire);
    if (wt) {
      const pts = [p, ...m.wire.via, wt];
      // Same slack as smart route: 8 % on a path with bends, 12 % on a straight run.
      return [{ t: m.wire.to, need: Math.round(polyLen(pts) * (m.wire.via.length ? 1.08 : 1.12) + m.h + 2), ch, x: 0, pts, wired: true }];
    }
    for (const t of m.route === "auto" ? ["desk", "b24", "b20", "eth"] : [m.route]) {
      if (t !== "desk" && !B[t].on) continue;
      if (m.route === "auto" && t !== "desk" && !boxOK(t)) continue;
      const tp = t === "desk" ? desk : B[t];
      const rt = paths ? route(grid, p, tp, rk(p, tp)) : null;
      list.push({
        t,
        need: Math.round((rt ? rt.len * 1.08 : dist(p, tp) * 1.12) + m.h + 2),
        ch,
        x: paths ? (rt.blocked ? 1 : 0) : noCross ? crosses(p, tp) : 0,
        pts: rt && rt.pts,
      });
    }
    return list.sort((a, b) => a.x * 1000 + a.need - (b.x * 1000 + b.need));
  };
  const base = st.mics.map((m) => [m, cand(m)]);
  let bestRun = null;
  for (const mode of [0, 1])
    for (const ord of [1, -1]) {
      const stock = stockAvail(),
        used = Object.fromEntries(LENS.map((l) => [l, 0])),
        mic = {},
        load = { b24: 0, b20: 0, eth: 0 };
      let fail = 0,
        len = 0,
        pieces = 0,
        bought = 0;
      const order = base.slice().sort((a, b) => ord * ((b[1][0]?.need || 0) - (a[1][0]?.need || 0)));
      for (const [m, L] of order) {
        let done = null;
        for (const c of L) {
          if (c.t !== "desk" && load[c.t] + c.ch > B[c.t].cap) continue;
          const tmp = { ...stock },
            got = [];
          let ok = true;
          for (let i = 0; i < c.ch; i++) {
            const bc = bestCombo(c.need, tmp, mode, buy, clean);
            if (!bc) {
              ok = false;
              break;
            }
            bc.c.forEach((x) => tmp[x]--);
            got.push(bc.c);
          }
          if (ok) {
            done = { c, got };
            break;
          }
        }
        if (!done) {
          const c = (L[0] && L[0].wired ? L[0] : null) || L.find((c) => c.t === "desk" || load[c.t] + c.ch <= B[c.t].cap) || {
            t: "desk",
            need: L[0] ? L[0].need : 0,
            ch: MODELS[m.model].ch || 1,
          };
          done = { c, got: Array(c.ch).fill(null) };
          fail++;
        }
        if (done.c.t !== "desk") load[done.c.t] += done.c.ch;
        done.got.forEach(
          (g) =>
            g &&
            g.forEach((x) => {
              if (stock[x] <= 0) bought++;
              stock[x]--;
              used[x]++;
              len += x;
              pieces++;
            }),
        );
        mic[m.id] = { t: done.c.t, need: done.c.need, cabs: done.got, pts: done.c.pts, wired: !!done.c.wired };
      }
      const sc = fail * 1e6 + (clean ? bought * 150 + pieces * 100 + len : bought * 5000 + len);
      if (!bestRun || sc < bestRun.sc) bestRun = { sc, stock, used, mic, load, fail, len, pieces };
    }
  res.mic = bestRun.mic;
  res.used = bestRun.used;
  res.len = bestRun.len;
  res.pieces = bestRun.pieces;
  res.fail = bestRun.fail;
  res.short = 0;
  for (const id in res.mic) {
    const r = res.mic[id];
    if (r.cabs.some((c) => !c)) res.short += r.need;
  }
  res.trunkShort = 0;
  for (const id in res.boxUp) {
    const u = res.boxUp[id];
    if (u && !u.fits) res.trunkShort += Math.min(400, u.need) - st.boxes[id].trunk;
  }
  for (const L of LENS) {
    res.left[L] = stockAvail()[L] - res.used[L];
    res.bought[L] = Math.max(0, -res.left[L]);
  }
  const load_ = bestRun.load;
  for (const id of ["eth", "b20"]) {
    const u = res.boxUp[id];
    if (u && u.u !== "desk" && load_[id] > 0) load_[u.u] += load_[id];
  }
  for (const id in load_)
    if (B[id].on && load_[id] > B[id].cap)
      res.warn.push(`${B[id].name}: ${load_[id]} channels on a ${B[id].cap}-channel box`);
  res.load = load_;
  for (const m of st.mics)
    if (m.wire && !wireTarget(m.wire))
      res.warn.push(`${esc(micName(m))}: its hand-drawn cable went to a box that's switched off; routed automatically`);
  for (const m of st.mics) {
    const r = res.mic[m.id];
    if (r.cabs.some((c) => !c))
      res.warn.push(`${esc(micName(m))}: no XLR ${buy ? "combination" : "left in stock"} for ${r.need} ft`);
  }
  // crossings: XLR runs that pass through another group's footprint
  const segHits = (pts, a, b) => {
    if (!pts) return hitGroups(a, b);
    let n = 0;
    for (let i = 1; i < pts.length; i++) n = Math.max(n, hitGroups(pts[i - 1], pts[i]));
    return n;
  };
  for (const m of st.mics) {
    const r = res.mic[m.id];
    res.cross += segHits(r.pts, micPos(m), r.t === "desk" ? desk : B[r.t]);
  }
  for (const id of ["b24", "b20", "eth"]) {
    const u = res.boxUp[id];
    if (!u) continue;
    res.cross += segHits(u.pts, B[id], u.u === "desk" ? desk : B[u.u]);
  }
  // tracks
  // Mics that want the D8's preamps go there first; everything else fills the other units in patch order.
  const live = rigInputs().filter((x) => !x.dead);
  let d8 = live.filter((x) => x.id === "d8").map((x) => x.t),
    ada = live.filter((x) => x.id !== "d8").map((x) => x.t);
  const order = st.mics
    .slice()
    .sort((a, b) => (MODELS[a.model].pre === MODELS[b.model].pre ? 0 : MODELS[a.model].pre === "D8" ? -1 : 1));
  res.track = {};
  for (const m of order) {
    const n = MODELS[m.model].ch || 1,
      pool = MODELS[m.model].pre === "D8" ? d8 : ada,
      t = [];
    for (let i = 0; i < n; i++) {
      let x = pool.shift();
      if (x == null && pool === d8) x = ada.shift();
      t.push(x);
    }
    res.track[m.id] = t;
    if (t.some((x) => x == null)) res.warn.push(`${esc(micName(m))}: out of preamp inputs`);
  }
  return res;
}
function micName(m) {
  const G = m.g && gOf(m.g);
  return (G ? G.l : "Free-standing") + (m.label ? " " + m.label : "") + " · " + m.model;
}
const where = (p) => {
  const t = (st && st.bg && st.bg.type) || "field";
  if (t === "stage") {
    const B = bgDims();
    return `${Math.round(p.u - 0)} ft from stage left, ${Math.round(p.v - B.front)} ft back from the stage front`;
  }
  if (t === "grid") return `${Math.round(p.u)} ft across, ${Math.round(p.v)} ft deep`;
  const yd = 20 + p.u / 3,
    y = yd <= 50 ? yd : 100 - yd;
  return `${y.toFixed(1)} yd line (${yd <= 50 ? "upper" : "lower"} half), ${Math.round(p.v)} ft from numbers`;
};
/* Input t on the preamps, from Gear › Interfaces' patch order (js/interfaces.js): e.g. input 9 = interface 2, input 1. */
function inputSlot(t) {
  if (!t) return null;
  const x = rigInputs().find((r) => r.t === t);
  return x ? { iface: x.idx, name: x.label, input: x.input, short: x.short } : null;
}
const pre = (t) => {
  if (!t) return "none";
  const s = inputSlot(t);
  return s ? `${s.short} ch${s.input}` : `input ${t}`;
};
const cabTxt = (c) => (c ? c.join(" + ") + " ft" : "none");

/* ---------- smart route ---------- */
let smartBusy = false;
// Smart route: for every combination of snake boxes, seed box positions by clustering the mics (k-means),
// plus a few random seeds, then simulated annealing. The score depends on the chosen goal.
function smart(mode) {
  if (smartBusy) return;
  smartBusy = true;
  document.querySelectorAll("[data-smart]").forEach((b) => (b.disabled = true));
  if ($("smartPull")) $("smartPull").innerHTML = "";
  const stockOnly = $("oStock").checked,
    noX = $("oClear").checked,
    moveDesk = $("oDesk").checked,
    buy = !stockOnly;
  st.buy = buy;
  st.noCross = noX;
  st.cleanAlloc = mode === "clean";
  st.mics.forEach((m) => (m.route = "auto"));
  for (const id in st.boxes) st.boxes[id].up = "auto";
  // Hand-drawn cables (docs/CABLE_ROUTING_PLAN.md) stay unless asked; their ends still follow moved boxes.
  const drawn = [...st.mics, ...Object.values(st.boxes)].filter((o) => o.wire),
    rewire = $("oRewire").checked;
  if (rewire) drawn.forEach((o) => delete o.wire);
  const keys = ["b24", "b20", "eth"],
    desk0 = { ...st.desk };
  const score = (r) => {
    const bought = LENS.reduce((a, L) => a + r.bought[L], 0),
      boxes = keys.filter((k) => st.boxes[k].on).length;
    let s = r.fail * 2e4 + r.short * 150 + r.trunkShort * 300; // reach everything first, and get closer when you can't
    if (mode === "clean")
      s += r.pieces * 90 + r.cross * 700 + boxes * 250 + r.len * 0.15 + bought * 40; // fewest joints/runs through groups/boxes
    else s += r.len * 1 + r.pieces * 3 + r.cross * 3 + bought * 2; // least cable
    if (noX) s += r.cross * 1e5;
    for (const k of keys) {
      const b = st.boxes[k];
      if (b.on && inGroup(b, 2)) s += 1e5;
    }
    if (inGroup(st.desk, 4) || dist(st.desk, DIR) < 8) s += 1e5;
    return s;
  };
  const movers = () => [...keys.filter((k) => st.boxes[k].on).map((k) => st.boxes[k]), ...(moveDesk ? [st.desk] : [])];
  const snap = () => JSON.stringify({ b: st.boxes, d: st.desk }),
    load = (x) => {
      const o = JSON.parse(x);
      st.boxes = o.b;
      Object.assign(st.desk, o.d);
    };
  const clamp = (o) => {
    o.v = Math.max(2, Math.min(VMAX - 2, o.v));
    o.u = Math.max(U0 + 2, Math.min(UMAX - 2, o.u));
  };
  const free = (o) => {
    for (let t = 0; t < 40 && inGroup(o, 2); t++) {
      o.v += (Math.random() - 0.5) * 10;
      o.u += (Math.random() - 0.5) * 10;
      clamp(o);
    }
  };
  const mp = st.mics.map(micPos);
  function kmeansSeed(on) {
    const k = on.length + 1,
      C = [{ ...st.desk }];
    for (let i = 0; i < on.length; i++) {
      const q = mp[Math.floor(Math.random() * mp.length)];
      C.push({ v: q.v, u: q.u });
    }
    for (let it = 0; it < 25; it++) {
      const acc = C.map(() => ({ v: 0, u: 0, n: 0 }));
      for (const q of mp) {
        let bi = 0,
          bd = 1e9;
        C.forEach((c, i) => {
          const d = dist(c, q);
          if (d < bd) {
            bd = d;
            bi = i;
          }
        });
        acc[bi].v += q.v;
        acc[bi].u += q.u;
        acc[bi].n++;
      }
      for (let i = 1; i < k; i++)
        if (acc[i].n) {
          C[i].v = acc[i].v / acc[i].n;
          C[i].u = acc[i].u / acc[i].n;
        }
    }
    on.forEach((k_, i) => {
      const b = st.boxes[k_];
      b.v = C[i + 1].v;
      b.u = C[i + 1].u;
      clamp(b);
      free(b);
    });
  }
  function randomSeed(on) {
    on.forEach((k) => {
      const b = st.boxes[k],
        q = mp[Math.floor(Math.random() * mp.length)];
      b.v = q.v + (Math.random() - 0.5) * 30;
      b.u = q.u + (Math.random() - 0.5) * 30;
      clamp(b);
      free(b);
    });
  }
  const configs = [
    [1, 1, 1],
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [0, 0, 0],
  ];
  const jobs = [];
  for (const c of configs) {
    if (!c.some((x) => x) && !moveDesk) {
      jobs.push({ c, seed: "none" });
      continue;
    }
    for (const seed of ["km", "km", "rnd"]) jobs.push({ c, seed });
  }
  const ITER = window.__smartIter || 260; // tests set a small budget: they check what smart route does, not how well
  let ji = 0,
    it = 0,
    cur = 0,
    T = 0,
    best = Infinity,
    bestState = null,
    cand = null;
  function startJob() {
    const J = jobs[ji];
    keys.forEach((k, i) => (st.boxes[k].on = !!J.c[i]));
    Object.assign(st.desk, desk0);
    const on = keys.filter((k) => st.boxes[k].on);
    if (J.seed === "km") kmeansSeed(on);
    else if (J.seed === "rnd") randomSeed(on);
    cur = score(solve({ buy, fast: true }));
    T = Math.max(50, cur * 0.02);
    it = J.seed === "none" ? ITER : 0;
    if (cur < best) {
      best = cur;
      bestState = snap();
    }
  }
  startJob();
  function step() {
    const t0 = performance.now();
    while (performance.now() - t0 < 35 && it < ITER) {
      const on = movers();
      if (!on.length) {
        it = ITER;
        break;
      }
      const o = on[Math.floor(Math.random() * on.length)],
        ov = o.v,
        ou = o.u,
        stp = 6 + 40 * (1 - it / ITER);
      o.v += (Math.random() - 0.5) * 2 * stp;
      o.u += (Math.random() - 0.5) * 2 * stp;
      clamp(o);
      const sc = score(solve({ buy, fast: true }));
      if (sc <= cur || Math.random() < Math.exp(-(sc - cur) / T)) {
        cur = sc;
        if (sc < best) {
          best = sc;
          bestState = snap();
        }
      } else {
        o.v = ov;
        o.u = ou;
      }
      T *= 0.985;
      it++;
    }
    if (it >= ITER) {
      ji++;
      if (ji < jobs.length) startJob();
    }
    $("smartSt").textContent = `searching… ${Math.round(Math.min(1, (ji + it / ITER) / jobs.length) * 100)}%`;
    if (ji < jobs.length) {
      setTimeout(step, 0);
      return;
    }
    load(bestState);
    if (noX) {
      $("smartSt").textContent = "routing round groups…";
      let rit = 0,
        rcur = score(solve({ buy, noCross: true }));
      const RIT = window.__smartIter ? 10 : 120;
      const refine = () => {
        const t1 = performance.now();
        const on = movers();
        while (performance.now() - t1 < 40 && rit < RIT && on.length) {
          const o = on[rit % on.length],
            ov = o.v,
            ou = o.u,
            stp = rit < RIT / 2 ? 18 : 6;
          o.v += (Math.random() - 0.5) * 2 * stp;
          o.u += (Math.random() - 0.5) * 2 * stp;
          clamp(o);
          const sc = score(solve({ buy, noCross: true }));
          if (sc <= rcur) rcur = sc;
          else {
            o.v = ov;
            o.u = ou;
          }
          rit++;
        }
        $("smartSt").textContent = `routing round groups… ${Math.round((rit / RIT) * 100)}%`;
        if (rit < RIT && on.length) setTimeout(refine, 0);
        else finish();
      };
      setTimeout(refine, 0);
    } else finish();
  }
  function finish() {
    smartBusy = false;
    document.querySelectorAll("[data-smart]").forEach((b) => (b.disabled = false));
    heatDirty = true;
    draw();
    const r = solve(),
      bl = LENS.filter((L) => r.bought[L]).map((L) => `${r.bought[L]} × ${L} ft`),
      used = keys.filter((k) => st.boxes[k].on).map((k) => st.boxes[k].short);
    $("smartSt").textContent =
      `${{ clean: "Cleanest", short: "Shortest" }[mode]}${stockOnly ? ", stock only" : ""}${noX ? ", no cables under players" : ""}: ${r.len} ft of XLR in ${r.pieces} pieces · boxes used: ${used.length ? used.join(", ") : "none"} · ${r.cross} run${r.cross === 1 ? "" : "s"} through a group${bl.length ? " · buy " + bl.join(", ") : ""}${r.fail ? ` · ${r.fail} mic${r.fail === 1 ? "" : "s"} still can't reach (short by ${r.short} ft of run)` : ""}${
        drawn.length
          ? rewire
            ? ` · ${drawn.length} hand-drawn cable${drawn.length === 1 ? "" : "s"} re-routed`
            : ` · ${drawn.length} hand-drawn cable${drawn.length === 1 ? "" : "s"} kept`
          : ""
      }`;
    pullInShow();
  }
  setTimeout(step, 0);
}
/* Smart route, "pull sections in" (BACKLOG, Tom 2026-11-12: "pull the far sections in" suggestion that measures how far
   to move them). For each section with a mic that can't be reached, try moving it (with the sections it's linked or
   locked to) straight toward the nearest snake box or desk, one foot at a time, and keep the shortest move that
   reaches all of its mics without stranding another and without landing on another section. A suggestion: nothing
   moves until its button is pressed, and one Undo puts it back. */
function pullInPlan() {
  const buy = st.buy,
    start = solve({ buy, fast: true });
  if (!start.fail) return { moves: [], left: 0, base: 0 };
  const anchors = () => [st.desk, ...Object.values(st.boxes).filter((b) => b.on)],
    stranded = (r, m) => r.mic[m.id] && r.mic[m.id].cabs.some((c) => !c),
    moves = [];
  let base = start;
  // A section pulled in frees long cables the next one can use, so the moves are found one after another and kept
  // while the rest are tried; everything is put back at the end.
  for (let pass = 0; pass < 3 && base.fail; pass++) {
    let progress = false;
    for (const k of [...new Set(st.mics.filter((m) => stranded(base, m)).map((m) => m.g).filter(Boolean))]) {
      if (moves.some((p) => p.k === k)) continue;
      const G = gOf(k),
        set = G.lock ? st.groups.filter((x) => x.lock === G.lock) : members(k),
        mine = st.mics.filter((m) => m.g === k && stranded(base, m)),
        c = mine.map(micPos).reduce((a, p) => ({ v: a.v + p.v / mine.length, u: a.u + p.u / mine.length }), { v: 0, u: 0 }),
        to = anchors().reduce((a, b) => (dist(b, c) < dist(a, c) ? b : a)),
        d = dist(to, c);
      if (d < 1) continue;
      const ux = (to.v - c.v) / d,
        uy = (to.u - c.u) / d,
        orig = set.map((x) => [x, x.v, x.u]);
      let found = null;
      for (let t = 1; t <= Math.min(80, d) && !found; t++) {
        orig.forEach(([x, v, u]) => ((x.v = v + ux * t), (x.u = u + uy * t)));
        if (set.some((x) => { const o = inGroup(x, 0); return o && !set.includes(o); })) continue; // would land on another section
        const r = solve({ buy, fast: true });
        if (mine.every((m) => !stranded(r, m)) && r.fail < base.fail) found = { t, r };
      }
      if (found) {
        base = found.r;
        moves.push({ k, set: set.map((x) => x.k), label: G.l, t: found.t, ux, uy, to: to === st.desk ? "the desk" : `the ${to.short}-ch box` });
        progress = true;
      } else orig.forEach(([x, v, u]) => ((x.v = v), (x.u = u)));
    }
    if (!progress) break;
  }
  const left = base.fail;
  // restore: the moves were applied while searching; subtract them again
  for (const p of moves) for (const k of p.set) { const G = gOf(k); G.v -= p.ux * p.t; G.u -= p.uy * p.t; }
  return { moves, left, base: start.fail };
}
function pullInShow() {
  const box = $("smartPull");
  if (!box) return;
  const plan = pullInPlan();
  window.__pullInPlans = plan;
  if (!plan.base) {
    box.innerHTML = "";
    return;
  }
  const names = plan.moves.map((p) => `${esc(p.label)} ${p.t} ft toward ${p.to}`).join(", ");
  box.innerHTML = plan.moves.length
    ? `<button data-pull="all" style="white-space:nowrap" title="Move ${names.replace(/<[^>]*>/g, "")}. Nothing else changes; Ctrl+Z undoes it.">Pull sections in</button><span class="m"> ${plan.moves.map((p) => `${esc(p.label)} ${p.t} ft`).join(", ")}: reaches ${plan.base - plan.left} of ${plan.base} stranded mic${plan.base === 1 ? "" : "s"}${plan.left ? `; ${plan.left} still need${plan.left === 1 ? "s" : ""} more cable or a box` : ""}</span>`
    : `<span class="m">Moving sections closer wouldn't reach the stranded mics: they need more cable or another box.</span>`;
  const b = box.querySelector("[data-pull]");
  if (b)
    b.onclick = () => {
      for (const p of plan.moves) for (const k of p.set) { const G = gOf(k); G.v += p.ux * p.t; G.u += p.uy * p.t; }
      save();
      heatDirty = true;
      draw(true);
      box.innerHTML = "";
      status(`Pulled ${plan.moves.map((p) => `${p.label} in ${p.t} ft`).join(", ")}. Ctrl+Z puts it back; run Smart route again to re-check the cables.`);
    };
}

/* ---------- drawing ---------- */
const PCOL = { 50: "#2c5d8f", 25: "#3f8f6b", 20: "#8a6d1f", 10: "#8f4d8a", 6: "#b4562d", 3: "#c0392b" };
function pointAt(path, d) {
  for (let i = 1; i < path.length; i++) {
    const L = dist(path[i - 1], path[i]);
    if (d <= L || i === path.length - 1) {
      const t = L ? Math.min(1, d / L) : 0;
      return { v: path[i - 1].v + (path[i].v - path[i - 1].v) * t, u: path[i - 1].u + (path[i].u - path[i - 1].u) * t };
    }
    d -= L;
  }
  return path[path.length - 1];
}
function subPath(path, a, b) {
  const out = [pointAt(path, a)];
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    acc += dist(path[i - 1], path[i]);
    if (acc > a && acc < b) out.push(path[i]);
  }
  out.push(pointAt(path, b));
  return out;
}
function drawPieces(g, path, pieces, drop) {
  let Lp = 0;
  for (let i = 1; i < path.length; i++) Lp += dist(path[i - 1], path[i]);
  const C = pieces.reduce((a, b) => a + b, 0),
    f = Math.max(1, (C - drop) / Math.max(1, Lp));
  let cum = 0,
    prev = 0;
  pieces.forEach((len, i) => {
    cum += len;
    const end = i === pieces.length - 1 ? Lp : Math.min(Lp, Math.max(0, (cum - drop) / f));
    if (end > prev + 0.01) {
      const sp = subPath(path, prev, end);
      el(
        "polyline",
        {
          points: sp.map((z) => X(z.v).toFixed(1) + "," + Y(z.u).toFixed(1)).join(" "),
          fill: "none",
          stroke: PCOL[len],
          "stroke-width": 1.6,
          "stroke-opacity": 0.85,
          "stroke-linejoin": "round",
        },
        g,
      );
      if (end - prev > 9) {
        const mid = pointAt(path, (prev + end) / 2);
        el(
          "text",
          {
            x: X(mid.v),
            y: Y(mid.u) - 3,
            "text-anchor": "middle",
            "font-size": 9,
            fill: PCOL[len],
            "paint-order": "stroke",
            stroke: "var(--field)",
            "stroke-width": 2.5,
          },
          g,
          len,
        );
      }
    }
    if (i < pieces.length - 1) {
      const j = pointAt(path, end);
      el("circle", { cx: X(j.v), cy: Y(j.u), r: 2.2, fill: "var(--field)", stroke: PCOL[len], "stroke-width": 1.2 }, g);
    }
    prev = end;
  });
}
function polarPath(cx, cy, ang, a, R) {
  let d = "";
  for (let i = 0; i <= 90; i++) {
    const th = i * 4 * DEG,
      r = R * Math.abs(a + (1 - a) * Math.cos(th)),
      t = th + ang;
    d += (i ? "L" : "M") + (cx - Math.cos(t) * r * S).toFixed(1) + " " + (cy + Math.sin(t) * r * S).toFixed(1);
  }
  return d + "Z";
}
function bgDims() {
  const b = (st && st.bg) || { type: "field" },
    S_ = (st && st.bgs) || {};
  const sg = Object.assign({ w: 40, d: 30 }, S_.stage || {}),
    gr = Object.assign({ w: 60, d: 40, step: 5 }, S_.grid || {});
  if (b.type === "stage")
    return {
      type: "stage",
      w: sg.w,
      d: sg.d,
      front: 10,
      VMAX: 10 + sg.d + 4,
      U0: -4,
      UMAX: sg.w + 4,
      dir: { v: 13, u: sg.w / 2 },
    };
  if (b.type === "grid")
    return {
      type: "grid",
      w: gr.w,
      d: gr.d,
      step: gr.step,
      VMAX: gr.d,
      U0: -2,
      UMAX: gr.w + 2,
      dir: { v: 3, u: gr.w / 2 },
    };
  return { type: "field", VMAX: 175, U0: -15, UMAX: 200, dir: { v: 166, u: 88 } };
}
function applyBg() {
  const B = bgDims();
  VMAX = B.VMAX;
  U0 = B.U0;
  UMAX = B.UMAX;
  S = B.type === "field" ? 3.4 : 620 / Math.max(VMAX, UMAX - U0);
  W = PL * 2 + VMAX * S + 46;
  H = PT * 2 + (UMAX - U0) * S;
  DIR = B.type === "field" ? { v: 166, u: 88 } : st.dir || (st.dir = { ...B.dir });
  GNV = Math.ceil(VMAX / GC) + 1;
  GNU = Math.ceil((UMAX - U0) / GC) + 1;
  HEATSTEP = B.type === "field" ? 2 : Math.max(0.5, Math.max(VMAX, UMAX - U0) / 110);
  ROT = ((st.rots && st.rots[B.type]) || 0) % 360;
  VB = { x: 0, y: 0, w: viewW(), h: viewH() };
  sv.setAttribute("viewBox", `0 0 ${viewW()} ${viewH()}`);
  $("world").setAttribute(
    "transform",
    ROT === 90
      ? `translate(${H},0) rotate(90)`
      : ROT === 180
        ? `translate(${W},${H}) rotate(180)`
        : ROT === 270
          ? `translate(0,${W}) rotate(270)`
          : "",
  );
  heatDirty = true;
  pcache.clear();
  drawGrid();
  fixText();
  syncRot();
}
// keep labels upright: counter-rotate every <text> in the rotated canvas about its own anchor
let textFixed = false;
function fixText() {
  if (!ROT && !textFixed) return;
  textFixed = true;
  let any = false;
  $("world")
    .querySelectorAll("[data-up]")
    .forEach((g) => {
      any = true;
      if (ROT) g.setAttribute("transform", `rotate(${-ROT} ${g.dataset.up})`);
      else g.removeAttribute("transform");
    }); // desk, snake boxes, meters stay upright as a whole
  $("world")
    .querySelectorAll("text")
    .forEach((t) => {
      if (t.closest("[data-up]")) return;
      if (t.dataset.bt === undefined) {
        if (!ROT) return;
        t.dataset.bt = t.getAttribute("transform") || "";
      }
      any = true;
      const x = t.dataset.cx !== undefined ? parseFloat(t.dataset.cx) : parseFloat(t.getAttribute("x")) || 0,
        y = t.dataset.cy !== undefined ? parseFloat(t.dataset.cy) : parseFloat(t.getAttribute("y")) || 0,
        v = (t.dataset.bt + (ROT ? ` rotate(${-ROT} ${x} ${y})` : "")).trim();
      if (v) t.setAttribute("transform", v);
      else t.removeAttribute("transform");
    });
  if (!any && !ROT) textFixed = false;
}
new MutationObserver(() => fixText()).observe($("world"), { childList: true, subtree: true });
function rotateCanvas(d) {
  const t = (st.bg && st.bg.type) || "field";
  st.rots = st.rots || {};
  st.rots[t] = ((((st.rots[t] || 0) + d) % 360) + 360) % 360;
  applyBg();
  draw();
  if (window.__view3dRotate) window.__view3dRotate(-d * DEG); // the 3D view follows: the scene turns the same way on screen (js/view3d.js)
  status(`Canvas rotated to ${st.rots[t]}°.`);
}
function syncRot() {
  const t = (st.bg && st.bg.type) || "field",
    r = (st.rots && st.rots[t]) || 0;
  document
    .querySelectorAll('[data-act="rotcw"],[data-act="rotccw"]')
    .forEach((b) => (b.title = `Canvas is at ${r}° (rotates in 90° steps)`));
}
function drawDir() {
  const g = $("gDir");
  g.innerHTML = "";
  const mv = (st.bg || {}).type && st.bg.type !== "field";
  const gg = el("g", { style: mv ? "cursor:grab" : "" }, g);
  if (mv) {
    gg.dataset.t = "x";
    gg.dataset.k = "dir";
    gg.dataset.tip = "Director · drag to move";
  }
  el("circle", { cx: X(DIR.v), cy: Y(DIR.u), r: 9, fill: "transparent" }, gg);
  el(
    "text",
    {
      "data-cx": X(DIR.v),
      "data-cy": Y(DIR.u),
      x: X(DIR.v),
      y: Y(DIR.u) + 6,
      "text-anchor": "middle",
      "font-size": 17,
      "font-weight": 600,
      fill: "var(--red)",
    },
    gg,
    "X",
  );
  el(
    "text",
    {
      "data-cx": X(DIR.v),
      "data-cy": Y(DIR.u),
      x: X(DIR.v) + 12,
      y: Y(DIR.u) + 5,
      "font-size": 12,
      fill: "var(--mute)",
    },
    gg,
    "Director",
  );
}
function drawGrid() {
  const g = $("gGrid");
  g.innerHTML = "";
  const B = bgDims();
  if (B.type !== "field") {
    const step = B.type === "grid" ? B.step : 5,
      v0 = B.type === "stage" ? B.front : 0,
      v1 = v0 + B.d;
    if (B.type === "stage") {
      el(
        "rect",
        {
          x: X(v1),
          y: Y(0),
          width: B.d * S,
          height: B.w * S,
          fill: "var(--card)",
          "fill-opacity": 0.5,
          stroke: "var(--ink)",
          "stroke-width": 1.4,
        },
        g,
      );
      el("text", { x: X(v0) + 8, y: Y(B.w / 2) + 4, "font-size": 12, fill: "var(--mute)" }, g, "audience ▸");
      el(
        "text",
        { x: X(v1) - 4, y: Y(-2), "text-anchor": "start", "font-size": 11, fill: "var(--mute)" },
        g,
        `Stage ${B.w} × ${B.d} ft`,
      );
    }
    for (let u = 0; u <= B.w + 1e-6; u += step)
      el(
        "line",
        {
          x1: X(v0),
          x2: X(v1),
          y1: Y(u),
          y2: Y(u),
          stroke: "var(--line2)",
          "stroke-width": u % (step * 2) ? 0.4 : 0.8,
          "stroke-dasharray": B.type === "stage" ? "2 4" : "",
        },
        g,
      );
    for (let v = v0; v <= v1 + 1e-6; v += step)
      el(
        "line",
        {
          x1: X(v),
          x2: X(v),
          y1: Y(0),
          y2: Y(B.w),
          stroke: "var(--line2)",
          "stroke-width": (v - v0) % (step * 2) ? 0.4 : 0.8,
          "stroke-dasharray": B.type === "stage" ? "2 4" : "",
        },
        g,
      );
    for (let u = 0; u <= B.w + 1e-6; u += step * 2)
      el("text", { x: X(v0) + 6, y: Y(u) + 4, "font-size": 10, fill: "var(--mute)" }, g, u + " ft");
    drawDir();
    return;
  }
  for (let yd = -5; yd <= 66; yd++) {
    const u = yd * 3;
    if (u < U0 || u > UMAX) continue;
    const y = Y(u),
      lab = 20 + yd,
      ydl = lab <= 50 ? lab : 100 - lab;
    if (yd % 5 === 0) {
      el(
        "line",
        { x1: X(VMAX), x2: X(0), y1: y, y2: y, stroke: "var(--line2)", "stroke-width": yd % 10 === 0 ? 1 : 0.6 },
        g,
      );
      if (yd % 10 === 0) el("text", { x: X(0) + 8, y: y + 4, "font-size": 12, fill: "var(--mute)" }, g, ydl);
    } else {
      for (const v of [0, FIELDW])
        el(
          "line",
          { x1: X(v) - (v ? 0 : 4), x2: X(v) + (v ? 4 : 0), y1: y, y2: y, stroke: "var(--line2)", "stroke-width": 0.7 },
          g,
        );
      for (const v of HASHES[(st && st.hash) || "college"].at)
        el("line", { x1: X(v) - 3, x2: X(v) + 3, y1: y, y2: y, stroke: "var(--line2)", "stroke-width": 0.9 }, g);
    }
  }
  el("line", { x1: X(0), x2: X(0), y1: Y(U0), y2: Y(UMAX), stroke: "var(--line2)", "stroke-width": 0.8 }, g);
  el("line", { x1: X(FIELDW), x2: X(FIELDW), y1: Y(U0), y2: Y(UMAX), stroke: "var(--line2)", "stroke-width": 0.8 }, g);
  {
    const H = HASHES[(st && st.hash) || "college"];
    if (H.at.length)
      el(
        "text",
        { x: X(H.at[0]) - 4, y: Y(U0) + 10, "text-anchor": "end", "font-size": 10, fill: "var(--mute)" },
        g,
        H.label + " hashes",
      );
  }
  drawDir();
}
let HEATSTEP = 2;
function heatField(mode, z, step = HEATSTEP) {
  const nv = Math.ceil(VMAX / step),
    nu = Math.ceil((UMAX - U0) / step),
    val = new Float32Array(nv * nu),
    hue = new Float32Array(nv * nu);
  let mx = -1e9,
    mn = 1e9;
  for (let i = 0; i < nv; i++)
    for (let j = 0; j < nu; j++) {
      const p = { v: (i + 0.5) * step, u: U0 + (j + 0.5) * step, z };
      let L,
        h = 0;
      if (mode === "delay") L = spreadAt(p);
      else if (mode === "cover") {
        const c = coverAt(p);
        L = c.margin;
        h = c.hue;
      } else {
        const r = soundAt(p, mode === "room" ? null : { direct: 1 });
        L = dB(r.tot);
        h = centroidHue(r.bands);
      }
      val[i * nu + j] = L;
      hue[i * nu + j] = h;
      if (L > mx) mx = L;
      if (L < mn) mn = L;
    }
  return { nv, nu, val, hue, mx, mn, step };
}
function coverAt(p) {
  let best = -1,
    second = -1,
    bi = -1;
  st.mics.forEach((m, i) => {
    const q = micPos(m),
      d = Math.max(1, Math.hypot(p.v - q.v, p.u - q.u, (p.z ?? 5) - m.h)),
      ang = micAim(m) * DEG,
      M = MODELS[m.model],
      a = M.pat === "xy" ? 1 : (PATS[m.pat] ?? 0.5);
    const ca = ((p.v - q.v) * Math.cos(ang) + (p.u - q.u) * Math.sin(ang)) / d,
      g = (M.pat === "xy" ? 0.5 + 0.5 * Math.cos(Math.acos(Math.max(-1, Math.min(1, ca))) - 45 * DEG) : Math.abs(a + (1 - a) * ca)) / d; // XY: the louder of its two cardioid capsules
    if (g > best) {
      second = best;
      best = g;
      bi = i;
    } else if (g > second) second = g;
  });
  const m = st.mics[bi],
    col = m && m.g ? KIND[gOf(m.g).kind].c : "#4b3fb0";
  const hue = m ? (m.g ? (st.groups.findIndex((G) => G.k === m.g) * 360) / st.groups.length : 270) : 0;
  return { margin: second > 0 ? dB(best * best) - dB(second * second) : 20, hue };
}
function heatColor(mode, t, h) {
  if (mode === "cover") return [`hsl(${Math.round(h)},65%,50%)`, 0.12 + 0.45 * t];
  if (mode === "tone") return [`hsl(${h},70%,50%)`, 0.15 + 0.4 * t];
  if (mode === "delay") return [`hsl(${Math.round(120 - 120 * t)},70%,45%)`, 0.15 + 0.45 * t];
  return [`hsl(${Math.round(230 - 230 * t)},80%,50%)`, 0.1 + 0.5 * t];
}
function heatCanvas(F, mode, flipV) {
  const c = document.createElement("canvas");
  c.width = F.nv;
  c.height = F.nu;
  const x = c.getContext("2d");
  const rng = Math.max(1, F.mx - F.mn);
  for (let i = 0; i < F.nv; i++)
    for (let j = 0; j < F.nu; j++) {
      const t = (F.val[i * F.nu + j] - F.mn) / rng,
        [col, a] = heatColor(mode, t, F.hue[i * F.nu + j]);
      x.globalAlpha = a;
      x.fillStyle = col;
      x.fillRect(flipV ? F.nv - 1 - i : i, j, 1, 1);
    }
  return c;
}
function heatLegend(F, mode, z) {
  return mode === "cover"
    ? "Mic coverage: colour = which mic hears that spot best; strong colour = clear winner, pale = two mics compete"
    : mode === "tone"
      ? "Tone: red = low-heavy → violet = bright"
      : mode === "delay"
        ? `Timing smear: green ${F.mn.toFixed(0)} ms → red ${F.mx.toFixed(0)} ms (at ${z} ft)`
        : `${mode === "room" ? "Total" : "Direct"} sound at ${z} ft: blue ${F.mn.toFixed(0)} dB → red ${F.mx.toFixed(0)} dB`;
}
let lastF = null;
function drawContours() {
  const g = $("gCont");
  g.innerHTML = "";
  if (!$("tCont").checked || !lastF || $("heat").value === "off") return;
  const { F, mode } = lastF;
  if (mode === "tone" || mode === "cover") {
    $("status").textContent = "Contours need a loudness or timing heatmap.";
    return;
  }
  const stepL = mode === "delay" ? 10 : 3,
    lv0 = Math.ceil(F.mn / stepL) * stepL,
    val = (i, j) => F.val[i * F.nu + j],
    P = (i, j) => [X((i + 0.5) * HEATSTEP), Y(U0 + (j + 0.5) * HEATSTEP)];
  for (let L = lv0; L <= F.mx; L += stepL) {
    let d = "";
    for (let i = 0; i < F.nv - 1; i++)
      for (let j = 0; j < F.nu - 1; j++) {
        const a = val(i, j),
          b = val(i + 1, j),
          c = val(i + 1, j + 1),
          e = val(i, j + 1);
        const idx = (a > L) | ((b > L) << 1) | ((c > L) << 2) | ((e > L) << 3);
        if (idx === 0 || idx === 15) continue;
        const lerp = (p1, p2, v1, v2) => {
          const t = (L - v1) / (v2 - v1 || 1e-6);
          return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
        };
        const A = P(i, j),
          B = P(i + 1, j),
          C = P(i + 1, j + 1),
          E = P(i, j + 1);
        const eAB = lerp(A, B, a, b),
          eBC = lerp(B, C, b, c),
          eCE = lerp(C, E, c, e),
          eEA = lerp(E, A, e, a);
        const seg = {
          1: [[eEA, eAB]],
          2: [[eAB, eBC]],
          3: [[eEA, eBC]],
          4: [[eBC, eCE]],
          5: [
            [eEA, eAB],
            [eBC, eCE],
          ],
          6: [[eAB, eCE]],
          7: [[eEA, eCE]],
          8: [[eCE, eEA]],
          9: [[eCE, eAB]],
          10: [
            [eAB, eBC],
            [eCE, eEA],
          ],
          11: [[eCE, eBC]],
          12: [[eBC, eEA]],
          13: [[eBC, eAB]],
          14: [[eAB, eEA]],
        }[idx];
        for (const [p, q] of seg) d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
      }
    const major = Math.round(L / stepL) % 4 === 0;
    const pth = el(
      "path",
      { d, fill: "none", stroke: "var(--ink)", "stroke-opacity": major ? 0.55 : 0.28, "stroke-width": major ? 1 : 0.6 },
      g,
    );
    pth.dataset.tip = `${L} ${mode === "delay" ? "ms" : "dB"} contour`;
    if (major && d) {
      const m = d.match(/M([\d.]+) ([\d.]+)/);
      if (m)
        el(
          "text",
          {
            x: +m[1] + 2,
            y: +m[2] - 2,
            "font-size": 9,
            fill: "var(--ink)",
            "paint-order": "stroke",
            stroke: "var(--field)",
            "stroke-width": 2.5,
          },
          g,
          L + (mode === "delay" ? " ms" : " dB"),
        );
    }
  }
}
function drawHeat() {
  const g = $("gHeat");
  const mode = $("heat").value;
  if (mode === "off") {
    g.innerHTML = "";
    return;
  }
  if (!heatDirty && g.childNodes.length) return;
  g.innerHTML = "";
  const z = +$("hz").value,
    F = heatField(mode, z),
    c = heatCanvas(F, mode, true);
  el(
    "image",
    {
      href: c.toDataURL(),
      x: X(VMAX),
      y: Y(U0),
      width: VMAX * S,
      height: (UMAX - U0) * S,
      preserveAspectRatio: "none",
      style: "image-rendering:auto",
    },
    g,
  );
  el(
    "text",
    {
      x: X(VMAX) + 6,
      y: Y(UMAX) - 6,
      "font-size": 11,
      fill: "var(--mute)",
      "paint-order": "stroke",
      stroke: "var(--field)",
      "stroke-width": 3,
    },
    g,
    heatLegend(F, mode, z),
  );
  lastF = { F, mode };
  drawContours();
  heatDirty = false;
}
let res = null;
/* Coalesce redraws while dragging: at most one light redraw per screen frame instead of one per mouse event. */
let drawPending = 0;
function drawSoon() {
  if (!drawPending)
    drawPending = requestAnimationFrame(() => {
      drawPending = 0;
      draw(true);
    });
}
function draw(light) {
  if (drawPending && !light) {
    cancelAnimationFrame(drawPending);
    drawPending = 0;
  }
  const showM = $("tMics").checked,
    showC = showM && $("tCables").checked,
    showP = showM && $("tPolar").checked,
    showPpl = $("tPeople").checked,
    showSp = $("tSpec").checked;
  const gG = $("gGroups"),
    gM = $("gMics"),
    gC = $("gCables"),
    gP = $("gPolar"),
    gX = $("gGear"),
    gMe = $("gMeters");
  [gG, gM, gC, gP, gX, gMe].forEach((g) => (g.innerHTML = ""));
  if (!light) drawHeat();
  res = solve();
  {
    const done = new Set();
    for (const G of st.groups) {
      if (!G.link || done.has(G.link)) continue;
      done.add(G.link);
      const gs = members(G.k),
        c = centroid(gs);
      for (const x of gs)
        el(
          "line",
          {
            x1: X(c.v),
            y1: Y(c.u),
            x2: X(x.v),
            y2: Y(x.u),
            stroke: "var(--mic)",
            "stroke-width": 1.4,
            "stroke-dasharray": "5 4",
            "stroke-opacity": 0.7,
          },
          gG,
        );
      el("circle", { cx: X(c.v), cy: Y(c.u), r: 4, fill: "none", stroke: "var(--mic)", "stroke-width": 1.4 }, gG);
      el(
        "text",
        {
          x: X(c.v),
          y: Y(c.u) - 8,
          "text-anchor": "middle",
          "font-size": 10,
          fill: "var(--mic)",
          "paint-order": "stroke",
          stroke: "var(--field)",
          "stroke-width": 3,
        },
        gG,
        "shared mic",
      );
    }
  }
  {
    const seen = new Set();
    for (const G of st.groups) {
      if (!G.lock || seen.has(G.lock)) continue;
      seen.add(G.lock);
      const gs = st.groups.filter((x) => x.lock === G.lock);
      for (let i = 1; i < gs.length; i++)
        el(
          "line",
          {
            x1: X(gs[i - 1].v),
            y1: Y(gs[i - 1].u),
            x2: X(gs[i].v),
            y2: Y(gs[i].u),
            stroke: "var(--mute)",
            "stroke-width": 1.2,
            "stroke-dasharray": "1 3",
          },
          gG,
        );
    }
  }
  {
    const gR = $("gRis");
    gR.innerHTML = "";
    for (const r of st.risers || []) {
      const g = el("g", { style: "cursor:grab" }, gR);
      g.dataset.t = "r";
      g.dataset.k = r.id;
      const isS = sel && sel.t === "r" && sel.k === r.id;
      el(
        "rect",
        {
          x: X(r.v + r.d / 2),
          y: Y(r.u - r.w / 2),
          width: r.d * S,
          height: r.w * S,
          fill: "var(--line2)",
          "fill-opacity": 0.18 + Math.min(0.3, r.h * 0.06),
          stroke: isS ? "var(--red)" : "var(--ink)",
          "stroke-width": isS ? 2 : 1,
          "stroke-dasharray": "5 3",
        },
        g,
      );
      el(
        "text",
        { x: X(r.v + r.d / 2) + 4, y: Y(r.u - r.w / 2) + 12, "font-size": 10, fill: "var(--mute)" },
        g,
        `riser ${r.h} ft`,
      );
      g.dataset.tip = `Riser ${r.w} × ${r.d} ft, ${r.h} ft high`;
    }
  }
  for (const G of st.groups) {
    const K = KIND[G.kind],
      k = scaleK(G),
      fr = frame(G),
      isSel = sel && sel.t === "g" && sel.k === G.k;
    const g = el("g", { style: "cursor:grab" }, gG);
    g.dataset.t = "g";
    g.dataset.k = G.k;
    let d = "";
    shapeOf(G).out.forEach(([x, y], i) => {
      const p = toField(G, x * k, y * k);
      d += (i ? "L" : "M") + X(p.v).toFixed(1) + " " + Y(p.u).toFixed(1);
    });
    el("path", { d: d + "Z", fill: K.c, "fill-opacity": 0.16, stroke: K.c, "stroke-width": isSel ? 2.2 : 0.9 }, g);
    const tip = { v: G.v + fr.f.v * (shapeOf(G).xmax * k + 1.5), u: G.u + fr.f.u * (shapeOf(G).xmax * k + 1.5) };
    el(
      "line",
      {
        x1: X(G.v),
        y1: Y(G.u),
        x2: X(tip.v),
        y2: Y(tip.u),
        stroke: K.c,
        "stroke-width": 0.8,
        "stroke-dasharray": "2 3",
      },
      g,
    );
    if (showPpl) {
      for (const q of people(G)) {
        const cx = X(q.v),
          cy = Y(q.u);
        if (K.bell) el("circle", { cx, cy, r: K.bell * S, fill: "none", stroke: K.c, "stroke-width": 1 }, g);
        if (K.drum)
          el(
            "rect",
            { x: cx - 0.9 * S, y: cy - 0.9 * S, width: 1.8 * S, height: 1.8 * S, rx: 2, fill: "none", stroke: K.c },
            g,
          );
        el("circle", { cx, cy, r: 0.75 * S, fill: K.c }, g);
        const sl = K.stub || (K.cym ? 1.2 : 0);
        if (sl) {
          let ax = fr.f.v,
            au = fr.f.u;
          if (K.dir === "side") {
            ax = fr.s.v;
            au = fr.s.u;
          }
          el(
            "line",
            {
              x1: cx,
              y1: cy,
              x2: X(q.v + ax * sl),
              y2: Y(q.u + au * sl),
              stroke: K.c,
              "stroke-width": G.kind === "tb" ? 1.4 : 1.2,
            },
            g,
          );
          if (K.cym)
            el(
              "line",
              {
                x1: X(q.v - fr.s.v * sl),
                y1: Y(q.u - fr.s.u * sl),
                x2: X(q.v + fr.s.v * sl),
                y2: Y(q.u + fr.s.u * sl),
                stroke: K.c,
                "stroke-width": 1.2,
              },
              g,
            );
        }
      }
    }
    el(
      "text",
      {
        "data-cx": X(G.v),
        "data-cy": Y(G.u) + 4,
        x: X(G.v),
        y: Y(G.u) - 3,
        "text-anchor": "middle",
        "font-size": 12,
        "font-weight": 600,
        fill: "var(--ink)",
        "paint-order": "stroke",
        stroke: "var(--field)",
        "stroke-width": 3,
      },
      g,
      G.l.replace(" part", ""),
    );
    el(
      "text",
      {
        "data-cx": X(G.v),
        "data-cy": Y(G.u) + 4,
        x: X(G.v),
        y: Y(G.u) + 11,
        "text-anchor": "middle",
        "font-size": 11,
        fill: "var(--mute)",
        "paint-order": "stroke",
        stroke: "var(--field)",
        "stroke-width": 3,
      },
      g,
      G.n + " players",
    );
    if (showSp) {
      const gg = el("g", { transform: `translate(${(X(G.v) - 24).toFixed(1)},${(Y(G.u) + 16).toFixed(1)})` }, g);
      gg.innerHTML = specSVG(K.bp, 48, 16, "", { range: 40, grid: false, sw: 1.4 });
    }
    g.dataset.tip = `${esc(G.l)} · ${esc(G.n)} players · ${G.a} sq ft each${
      G.link
        ? "<br>Shares a mic with " +
          members(G.k)
            .filter((x) => x !== G)
            .map((x) => esc(x.l))
            .join(", ")
        : ""
    }<br>${KIND[G.kind].L} dB per player at 1 m (ff)`;
  }
  if (showM) {
    for (const m of st.mics) {
      const p = micPos(m),
        cx = X(p.v),
        cy = Y(p.u),
        ang = micAim(m) * DEG,
        M = MODELS[m.model],
        isSel = sel && sel.t === "m" && sel.k === m.id;
      if (showP) {
        const col = m.g ? KIND[gOf(m.g).kind].c : "#4b3fb0",
          R = (m.reach || 20) * (m.sscale === false ? 1 : sensScale(m.model));
        if (M.pat === "xy") {
          for (const o of [-45, 45])
            el(
              "path",
              {
                d: polarPath(cx, cy, ang + o * DEG, 0.5, R),
                fill: col,
                "fill-opacity": 0.04,
                stroke: col,
                "stroke-opacity": 0.35,
                "stroke-width": 0.6,
              },
              gP,
            );
        } else
          el(
            "path",
            {
              d: polarPath(cx, cy, ang, PATS[m.pat] ?? 0.5, R),
              fill: col,
              "fill-opacity": 0.05,
              stroke: col,
              "stroke-opacity": 0.45,
              "stroke-width": 0.6,
            },
            gP,
          );
      }
      if (m.g && (isSel || (drag && drag.obj === m))) {
        const G = gOf(m.g);
        if (G)
          el(
            "line",
            {
              x1: cx,
              y1: cy,
              x2: X(G.v),
              y2: Y(G.u),
              stroke: "var(--mic)",
              "stroke-width": 1,
              "stroke-dasharray": "2 3",
              "stroke-opacity": 0.8,
            },
            gM,
          );
      }
      const g = el("g", { style: "cursor:grab" }, gM);
      g.dataset.t = "m";
      g.dataset.k = m.id;
      el(
        "line",
        {
          x1: cx,
          y1: cy,
          x2: cx - Math.cos(ang) * 12,
          y2: cy + Math.sin(ang) * 12,
          stroke: "var(--mic)",
          "stroke-width": 1.6,
        },
        g,
      );
      el(
        "circle",
        {
          cx,
          cy,
          r: 4.5,
          fill: "var(--mic)",
          stroke: isSel ? "var(--red)" : "var(--field)",
          "stroke-width": isSel ? 2 : 1,
        },
        g,
      );
      const tr = res.track[m.id];
      el(
        "text",
        {
          "data-cx": cx,
          "data-cy": cy,
          x: cx + 7,
          y: cy - 6,
          "font-size": 10.5,
          fill: "var(--mic)",
          "paint-order": "stroke",
          stroke: "var(--field)",
          "stroke-width": 3,
        },
        g,
        tr.filter((x) => x).join("/"),
      );
      g.dataset.tip = `${esc(micName(m))}<br>Track ${tr.join(", ")} · ${pre(tr[0])} · ${m.h} ft stand · ${M.pat === "xy" ? "XY pair" : m.pat}`;
    }
    if (showC) {
      const ends = (t) => (t === "desk" ? st.desk : st.boxes[t]);
      // Hand-drawn cables show their bends as small squares (the pivots you placed).
      const bends = (path) =>
        path.slice(1, -1).forEach((z) =>
          el("rect", { x: X(z.v) - 2.5, y: Y(z.u) - 2.5, width: 5, height: 5, class: "wireBend" }, gC),
        );
      for (const m of st.mics) {
        const r = res.mic[m.id],
          p = micPos(m),
          q = ends(r.t);
        if (!q) continue;
        const bad = r.cabs.some((c) => !c),
          buyit = !bad && st.buy && res.mic[m.id].cabs.some((c) => c);
        const path = r.pts || [p, q],
          pl = path.map((z) => X(z.v).toFixed(1) + "," + Y(z.u).toFixed(1)).join(" ");
        if (bad || !r.cabs[0])
          el(
            "polyline",
            {
              points: pl,
              fill: "none",
              stroke: "var(--warn)",
              "stroke-opacity": 0.9,
              "stroke-width": 1.3,
              "stroke-linejoin": "round",
            },
            gC,
          );
        else
          drawPieces(
            gC,
            path,
            r.cabs[0].slice().sort((a, b) => a - b),
            m.h + 2,
          );
        if (r.wired) bends(path);
        const hit = el("polyline", { points: pl, fill: "none", stroke: "transparent", "stroke-width": 9 }, gC);
        hit.dataset.wire = "m:" + m.id; // click to select the cable (js/wiredraw.js)
        hit.dataset.tip = `XLR · ${esc(micName(m))} → ${r.t === "desk" ? "desk" : esc(st.boxes[r.t].name)}${r.wired ? " · hand-drawn" : ""}<br>${r.cabs.map(cabTxt).join(" | ")} · ${r.need} ft needed`;
      }
      for (const id of ["b24", "b20", "eth"]) {
        const b = st.boxes[id],
          u = res.boxUp[id];
        if (!b.on || !u) continue;
        const q = ends(u.u);
        const pl = (u.pts || [b, q]).map((z) => X(z.v).toFixed(1) + "," + Y(z.u).toFixed(1)).join(" ");
        el(
          "polyline",
          {
            points: pl,
            fill: "none",
            stroke: u.fits ? "var(--red)" : "var(--warn)",
            "stroke-width": 3.4,
            "stroke-dasharray": u.fits ? "" : "6 4",
            "stroke-opacity": 0.8,
            "stroke-linejoin": "round",
          },
          gC,
        );
        if (u.wired) bends(u.pts);
        const hit = el("polyline", { points: pl, fill: "none", stroke: "transparent", "stroke-width": 12 }, gC);
        hit.dataset.wire = "b:" + id;
        {
          const path = u.pts || [b, q];
          let Lp = 0;
          for (let i = 1; i < path.length; i++) Lp += dist(path[i - 1], path[i]);
          const mid = pointAt(path, Lp / 2);
          el(
            "text",
            {
              x: X(mid.v),
              y: Y(mid.u) - 5,
              "text-anchor": "middle",
              "font-size": 10,
              "font-weight": 600,
              fill: "var(--red)",
              "paint-order": "stroke",
              stroke: "var(--field)",
              "stroke-width": 3,
            },
            gC,
            b.trunk + " ft snake",
          );
        }
        hit.dataset.tip = `Snake trunk · ${esc(b.name)} (${b.trunk} ft) → ${u.u === "desk" ? "desk" : esc(st.boxes[u.u].name)}<br>${u.need} ft needed${u.fits ? "" : ", too short"} · carries ${res.load[id]} ch`;
      }
      for (const id of ["b24", "b20", "eth"]) {
        const b = st.boxes[id];
        if (!b.on) continue;
        const g = el("g", { style: "cursor:grab", "data-up": `${X(b.v)} ${Y(b.u)}` }, gX);
        g.dataset.t = "b";
        g.dataset.k = id;
        el(
          "rect",
          {
            x: X(b.v) - 15,
            y: Y(b.u) - 10,
            width: 30,
            height: 20,
            rx: 3,
            fill: "var(--card)",
            stroke: sel && sel.k === id ? "var(--red)" : "var(--ink)",
            "stroke-width": sel && sel.k === id ? 2 : 1,
          },
          g,
        );
        el(
          "text",
          { x: X(b.v), y: Y(b.u) + 4, "text-anchor": "middle", "font-size": 11, fill: "var(--ink)" },
          g,
          b.short,
        );
        g.dataset.tip = `${esc(b.name)} · ${res.load[id]}/${b.cap} channels`;
      }
      const g = el("g", { style: "cursor:grab", "data-up": `${X(st.desk.v)} ${Y(st.desk.u)}` }, gX);
      g.dataset.t = "d";
      g.dataset.k = "desk";
      el(
        "rect",
        {
          x: X(st.desk.v) - 24,
          y: Y(st.desk.u) - 11,
          width: 48,
          height: 22,
          rx: 3,
          fill: "var(--ink)",
          stroke: sel && sel.t === "d" ? "var(--red)" : "none",
          "stroke-width": 2,
        },
        g,
      );
      el(
        "text",
        { x: X(st.desk.v), y: Y(st.desk.u) + 4, "text-anchor": "middle", "font-size": 11, fill: "var(--bg)" },
        g,
        "Desk",
      );
      g.dataset.tip = "Recording desk: D8, two ADA8000s, Digiface, laptop";
    }
  }
  {
    const gW = $("gWeb");
    gW.innerHTML = "";
    if ($("tWeb").checked && showM)
      for (const m of st.mics) {
        if (!m.g) continue;
        const p = micPos(m),
          M = MODELS[m.model],
          sp = soundAt(
            { ...p, z: micZ(m) },
            { mic: 1, aim: micAim(m) * DEG, a: M.pat === "xy" ? 0.5 : (PATS[m.pat] ?? 0.5), xy: M.pat === "xy" },
          ),
          own = ownSum(sp.by, m.g);
        for (const [k, x] of Object.entries(sp.by)
          .filter(([k]) => !memberKeys(m.g).includes(k))
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)) {
          const rel = dB(x) - dB(own);
          if (rel < -10) continue;
          const G = gOf(k),
            t = Math.min(1, (rel + 10) / 20);
          const ln = el(
            "line",
            {
              x1: X(p.v),
              y1: Y(p.u),
              x2: X(G.v),
              y2: Y(G.u),
              stroke: KIND[G.kind].c,
              "stroke-width": 0.8 + 2.6 * t,
              "stroke-opacity": 0.2 + 0.45 * t,
              "stroke-linecap": "round",
              "stroke-dasharray": t < 0.5 ? "4 4" : "",
            },
            gW,
          );
          ln.dataset.tip = `Bleed into ${esc(micName(m))}<br>${esc(G.l)} arrives ${Math.abs(rel).toFixed(0)} dB ${rel > 0 ? "louder" : "quieter"} than ${esc(gOf(m.g).l)}`;
        }
      }
  }
  for (const mt of st.meters) {
    const r = soundAt(mt, { direct: 1 }),
      L = dB(r.tot),
      Lroom = dB(soundAt(mt).tot),
      cx = X(mt.v),
      cy = Y(mt.u),
      isSel = sel && sel.t === "e" && sel.k === mt.id;
    const g = el("g", { style: "cursor:grab", "data-up": `${cx} ${cy}` }, gMe);
    g.dataset.t = "e";
    g.dataset.k = mt.id;
    el(
      "rect",
      {
        x: cx - 27,
        y: cy - 12,
        width: 54,
        height: 24,
        rx: 12,
        fill: "var(--card)",
        stroke: isSel ? "var(--red)" : "var(--ink)",
        "stroke-width": isSel ? 2 : 1,
      },
      g,
    );
    el(
      "text",
      { x: cx, y: cy + 4, "text-anchor": "middle", "font-size": 11.5, "font-weight": 600, fill: "var(--ink)" },
      g,
      L.toFixed(0) + " dB",
    );
    {
      const gg = el("g", { transform: `translate(${(cx - 20).toFixed(1)},${(cy + 14).toFixed(1)})` }, g);
      gg.innerHTML = specSVG(r.bands, 40, 12, "meter", { grid: false, sw: 1.2 });
    }
    const top = Object.entries(r.by)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, x]) => `${esc(gOf(k).l.replace(" part", ""))} ${dB(x).toFixed(0)}`)
      .join(", ");
    g.dataset.tip = `Sound meter · direct sound ~${L.toFixed(0)} dB · with the room ~${Lroom.toFixed(0)} dB (${VENUE[$("venue").value].label})<br>Loudest direct: ${top}`;
  }
  renderSide();
  renderChan();
  renderStats();
  renderInv();
  renderExtras(light);
  save();
  window.dispatchEvent(new Event("planner:scenechange"));
}

/* ---------- side panels ---------- */
const used = (model) => st.mics.filter((m) => m.model === model).length;
function renderSide() {
  // "Stock only" and "No cables under players" are the checkboxes above this list (one control per setting).
  let h = "";
  h += `<table><tr><th>XLR</th><th>Owned</th><th>Used</th><th>${st.buy ? "Buy" : "Left"}</th></tr>`;
  for (const L of LENS)
    h += `<tr><td>${L} ft</td><td><input type="number" min="0" step="1" data-st="${L}" value="${st.stock[L] || 0}" aria-label="${L} ft cables owned" class="w56"></td><td>${res.used[L]}</td><td class="${res.bought[L] ? "warn" : ""}">${st.buy ? res.bought[L] : Math.max(0, res.left[L])}</td></tr>`;
  h += `</table><div class="m">${res.len} ft of XLR in ${res.pieces} pieces · ${res.cross} run${res.cross === 1 ? "" : "s"} through a group</div><div class="mt8">`;
  for (const id of ["b24", "b20", "eth"]) {
    const b = st.boxes[id],
      u = res.boxUp[id];
    h += `<div class="row"><label><input type="checkbox" data-box="${id}" ${b.on ? "checked" : ""}> ${esc(b.name)}</label><span class="m">${b.on ? `${res.load[id]}/${b.cap} ch${u ? ` · trunk ${u.need}/${b.trunk} ft` : ""}` : "not used"}</span></div>`;
  }
  h += `</div>`;
  const bl = LENS.filter((L) => res.bought[L]).map((L) => `${res.bought[L]} × ${L} ft`);
  if (st.buy && bl.length) h += `<div class="mt6"><b>Shopping list:</b> ${bl.join(", ")}</div>`;
  h += res.warn.length
    ? `<div class="warn mt6">${res.warn.map((w) => "• " + w).join("<br>")}</div>`
    : `<div class="ok mt6">Everything reaches${st.buy && bl.length ? " with the shopping list" : " with what's in stock"}.</div>`;
  $("stockBody").innerHTML = h;
  $("stockBody")
    .querySelectorAll("[data-st]")
    .forEach(
      (c) =>
        (c.onchange = () => {
          const n = +c.value;
          if (n >= 0 && Number.isInteger(n)) {
            st.stock[c.dataset.st] = n;
            draw(true);
          } else c.value = st.stock[c.dataset.st] || 0;
        }),
    );
  $("stockBody")
    .querySelectorAll("[data-box]")
    .forEach(
      (c) =>
        (c.onchange = () => {
          st.boxes[c.dataset.box].on = c.checked;
          st.mics.forEach((m) => {
            if (m.route === c.dataset.box && !c.checked) m.route = "auto";
          });
          draw(true);
        }),
    );
  let l = `<table><tr><th>Mic</th><th>In use</th><th>Spare</th><th></th></tr>`;
  for (const k in MODELS) {
    const u = used(k),
      a = avail(k);
    l += `<tr><td>${k}${inv().micAdd[k] ? ` <span class="badge">+${inv().micAdd[k]} to buy</span>` : ""}</td><td>${u}</td><td class="${u > a ? "warn" : ""}">${a - u}</td><td><button class="hb" data-info="${k}" aria-label="Info about ${k}">ⓘ</button></td></tr>`;
  }
  $("lockerBody").innerHTML =
    l +
    `</table><div class="row mt8"><button id="bFree">Add a free-standing mic</button></div><div id="lkErr" class="err"></div>`;
  $("bFree").onclick = () => {
    const k = Object.keys(MODELS).find((k) => used(k) < avail(k));
    if (!k) {
      $("lkErr").textContent = "Every mic in the locker is in use.";
      status("Every mic in the locker is in use.");
      return;
    }
    const m = {
      id: "m" + st.nextId++,
      g: null,
      model: k,
      aim: "auto",
      h: 7,
      route: "auto",
      pat: MODELS[k].pat === "xy" ? "cardioid" : MODELS[k].pat,
      label: "",
      v: 150,
      u: 88,
    };
    st.mics.push(m);
    sel = { t: "m", k: m.id };
    draw(true);
  };
  renderSel();
}
const opt = (v, cur, label) =>
  `<option value="${esc(v)}" ${String(v) === String(cur) ? "selected" : ""}>${esc(label ?? v)}</option>`;
function frontOf(gs) {
  const c = centroid(gs),
    dv = DIR.v - c.v,
    du = DIR.u - c.u,
    d = Math.hypot(dv, du) || 1,
    f = { v: dv / d, u: du / d };
  let mx = 0;
  for (const G of gs) {
    const k = scaleK(G);
    for (const [x, y] of shapeOf(G).out) {
      const q = toField(G, x * k, y * k),
        pr = (q.v - c.v) * f.v + (q.u - c.u) * f.u;
      if (pr > mx) mx = pr;
    }
  }
  return { v: c.v + f.v * (mx + 4), u: c.u + f.u * (mx + 4) };
}
function combine(aK, bK) {
  const A = gOf(aK),
    B = gOf(bK);
  const id = A.link || B.link || "L" + st.nextId++;
  const all = [...members(aK), ...members(bK)];
  all.forEach((G) => (G.link = id));
  const prim = all[0],
    keep = st.mics.filter((m) => all.some((G) => G.k === m.g));
  let mic = keep.find((m) => m.g === prim.k) || keep[0];
  st.mics = st.mics.filter((m) => !all.some((G) => G.k === m.g) || m === mic);
  if (mic) {
    mic.g = prim.k;
    const f = frontOf(all);
    mic.dv = f.v - prim.v;
    mic.du = f.u - prim.u;
    mic.aim = "auto";
  }
  return keep.length - (mic ? 1 : 0);
}
function ungroup(k) {
  const G = gOf(k),
    gs = members(k);
  if (gs.length < 2) return "";
  G.link = null;
  const rest = gs.filter((x) => x !== G);
  if (rest.length === 1) rest[0].link = null;
  let note = "";
  const shared = st.mics.find((m) => m.g === G.k);
  if (shared) {
    const to = rest[0];
    shared.g = to.k;
    const f = frontOf(members(to.k));
    shared.dv = f.v - to.v;
    shared.du = f.u - to.u;
  }
  const def = DEF_MICS.find((d) => d[0] === G.k),
    want =
      def && used(def[1]) < MODELS[def[1]].n
        ? def[1]
        : Object.keys(MODELS).find((x) => used(x) < avail(x) && MODELS[x].pat !== "xy");
  if (want) {
    st.mics.push({
      id: "m" + st.nextId++,
      g: G.k,
      model: want,
      aim: "auto",
      h: 7,
      route: "auto",
      pat: MODELS[want].pat,
      label: "",
      ...defaultMicOffset(G),
    });
    note = `${esc(G.l)} got its own ${want} back.`;
  } else note = `${esc(G.l)} is separate again, but there's no spare mic in the locker for it.`;
  return note;
}
function rotateGroup(G, newRot) {
  const d = (newRot - (G.rot || 0)) * DEG,
    c = Math.cos(d),
    s = Math.sin(d);
  G.rot = newRot;
  for (const m of st.mics)
    if (m.g === G.k) {
      const v = m.dv * c - m.du * s,
        u = m.dv * s + m.du * c;
      m.dv = v;
      m.du = u;
    }
}
function resizeGroup(G, a) {
  const k0 = scaleK(G);
  G.a = Math.max(4, Math.min(80, Math.round(a)));
  const r = scaleK(G) / k0;
  for (const m of st.mics)
    if (m.g === G.k) {
      const L = Math.hypot(m.dv, m.du) || 1,
        nl = Math.max(2, (L - 4) * r + 4);
      m.dv *= nl / L;
      m.du *= nl / L;
    }
}
function renderSel() {
  const b = $("selBody");
  if (!sel) {
    b.innerHTML = `<span class="m">Tap a section, mic, meter, snake box or the desk.</span>`;
    return;
  }
  if (sel.t === "g") {
    const G = gOf(sel.k);
    if (!G) {
      sel = null;
      return renderSel();
    }
    const mic = st.mics.filter((m) => m.g === G.k),
      near = soundAt({ v: G.v, u: G.u });
    b.innerHTML = `<div class="b6">${esc(G.l)}</div><div class="m">${where(G)}</div>
  <div class="row"><span>Players</span><input type="number" id="eN" min="1" step="1" value="${esc(G.n)}"></div>
  <div class="row"><span>Sq ft per player</span><input type="number" id="eA" min="4" max="80" step="1" value="${G.a}"></div>
  <div class="row"><span>Shape</span><select id="eS">${Object.keys(SHAPES)
    .map((s) => opt(s, G.shape, SHAPES[s].label))
    .join("")}</select>${G.shape === "custom" ? '<button id="eRedraw">Redraw</button>' : ""}</div>
  <div class="row"><span>Rotation</span><input type="range" id="eR" min="-180" max="180" step="5" value="${G.rot || 0}"><span class="m" id="eRv">${G.rot || 0}° from facing the director</span></div>
  <div class="m">Footprint ${Math.round(area(G))} sq ft · ${mic.length} mic${mic.length === 1 ? "" : "s"} · ~${dB(near.tot).toFixed(0)} dB in the middle of the group</div>
  <div class="m mt6">Instrument spectrum</div>${specHTML(KIND[G.kind].bp, 36)}
  <div class="mt8"><b>Mics on this section</b>${
    mic.length
      ? mic
          .map((m) => {
            const M = MODELS[m.model],
              ps = M.pats && M.pats.length > 1 ? M.pats : null;
            return `<div class="row"><span style="min-width:0;color:var(--ink)">${esc(m.model)}</span>${ps ? `<select data-gpat="${m.id}" aria-label="Pattern for ${esc(m.model)}">${ps.map((x) => opt(x, m.pat)).join("")}</select>` : `<span class="m">${m.pat}</span>`}<button class="hb" data-info="${esc(m.model)}" aria-label="Info about ${esc(m.model)}">ⓘ</button><button class="hb" data-gsel="${m.id}" title="Select this mic">→</button></div>`;
          })
          .join("")
      : '<div class="m">None yet.</div>'
  }</div>
  <div class="mt8"><b>Move together</b> ${
    G.lock
      ? `<div class="m">Locked with ${st.groups
          .filter((x) => x.lock === G.lock && x !== G)
          .map((x) => esc(x.l))
          .join(
            ", ",
          )}: dragging any of them moves all.</div><div class="row"><button id="eUnlock">Unlock this section</button></div>`
      : ""
  }
  <div class="row"><select id="eLockWith" aria-label="Section to lock with">${st.groups
    .filter((x) => !(G.lock && x.lock === G.lock) && x !== G)
    .map((x) => opt(x.k, "", x.l))
    .join("")}</select><button id="eLock">Lock together</button></div></div>
  <div class="mt8"><b>Shared mic</b> ${
    G.link
      ? `<div class="m">Combined with ${members(G.k)
          .filter((x) => x !== G)
          .map((x) => esc(x.l))
          .join(
            ", ",
          )}: one mic covers all of them.</div><div class="row"><button id="eUng">Ungroup this section</button><button id="eUngAll">Ungroup all of them</button></div>`
      : ""
  }
  <div class="row"><select id="eWith" aria-label="Section to combine with">${st.groups
    .filter((x) => !memberKeys(G.k).includes(x.k))
    .map((x) => opt(x.k, "", x.l))
    .join("")}</select><button id="eComb">Combine (share one mic)</button></div></div>
  <div id="eErr" class="err"></div><div class="row"><button id="eMic">Add a mic to this section</button><button id="eFace">Face the director</button><button id="eDelG">Delete section</button></div>`;
    $("eDelG").onclick = () => {
      if (!confirm(`Delete ${G.l}? Its mics go back to the locker.`)) return;
      const lk = G.lock,
        ln = G.link;
      st.mics = st.mics.filter((m) => m.g !== G.k);
      st.groups = st.groups.filter((x) => x !== G);
      for (const id of [lk, ln])
        if (id) {
          const rest = st.groups.filter((x) => x.lock === id || x.link === id);
          if (rest.length === 1) {
            if (rest[0].lock === id) rest[0].lock = null;
            if (rest[0].link === id) rest[0].link = null;
          }
        }
      sel = null;
      heatDirty = true;
      draw();
      status(`${G.l} deleted.`);
    };
    if ($("eRedraw")) $("eRedraw").onclick = () => openDraw(G);
    b.querySelectorAll("[data-gpat]").forEach(
      (x) =>
        (x.onchange = () => {
          const m = st.mics.find((q) => q.id === x.dataset.gpat);
          m.pat = x.value;
          draw(true);
        }),
    );
    b.querySelectorAll("[data-gsel]").forEach(
      (x) =>
        (x.onclick = () => {
          sel = { t: "m", k: x.dataset.gsel };
          draw(true);
        }),
    );
    $("eLock").onclick = () => {
      const O = gOf($("eLockWith").value);
      if (!O) return;
      const id = G.lock || O.lock || "K" + st.nextId++;
      const old = [G.lock, O.lock].filter((x) => x && x !== id);
      st.groups.forEach((x) => {
        if (x === G || x === O || old.includes(x.lock)) x.lock = id;
      });
      draw(true);
      status(
        `${st.groups
          .filter((x) => x.lock === id)
          .map((x) => x.l)
          .join(" + ")} now move together.`,
      );
    };
    if (G.lock)
      $("eUnlock").onclick = () => {
        const id = G.lock;
        G.lock = null;
        const rest = st.groups.filter((x) => x.lock === id);
        if (rest.length === 1) rest[0].lock = null;
        draw(true);
        status(`${G.l} moves on its own now.`);
      };
    $("eComb").onclick = () => {
      const other = $("eWith").value;
      if (!other) return;
      const freed = combine(G.k, other);
      heatDirty = true;
      draw();
      status(
        `${members(G.k)
          .map((x) => x.l)
          .join(
            " + ",
          )} now share one mic${freed ? `; ${freed} mic${freed === 1 ? "" : "s"} went back to the locker` : ""}.`,
      );
    };
    if (G.link) {
      $("eUng").onclick = () => {
        const n = ungroup(G.k);
        heatDirty = true;
        draw();
        status(n);
      };
      $("eUngAll").onclick = () => {
        const ks = memberKeys(G.k);
        const notes = [];
        for (const k of ks.slice(1)) {
          const n = ungroup(k);
          if (n) notes.push(n);
        }
        ks.forEach((k) => (gOf(k).link = null));
        heatDirty = true;
        draw();
        status(notes.join(" ") || "Ungrouped.");
      };
    }
    const upd = () => {
      const n = +$("eN").value,
        a = +$("eA").value;
      if (!(n >= 1 && Number.isInteger(n)) || !(a >= 4 && a <= 80)) {
        $("eErr").textContent = "Players: a whole number of at least 1. Sq ft: 4 to 80.";
        return;
      }
      $("eErr").textContent = "";
      G.n = n;
      resizeGroup(G, a);
      heatDirty = true;
      draw();
    };
    $("eN").onchange = upd;
    $("eA").onchange = upd;
    $("eS").onchange = () => {
      if ($("eS").value === "custom") {
        openDraw(G);
        $("eS").value = G.shape;
        return;
      }
      const k0 = shapeOf(G).xmax * scaleK(G);
      G.shape = $("eS").value;
      const k1 = shapeOf(G).xmax * scaleK(G);
      for (const m of st.mics)
        if (m.g === G.k) {
          const L = Math.hypot(m.dv, m.du) || 1,
            nl = Math.max(2, L - k0 + k1);
          m.dv *= nl / L;
          m.du *= nl / L;
        }
      heatDirty = true;
      draw();
    };
    $("eR").oninput = () => {
      rotateGroup(G, +$("eR").value);
      $("eRv").textContent = G.rot + "° from facing the director";
      heatDirty = true;
      draw(true);
    };
    $("eR").onchange = () => draw();
    $("eFace").onclick = () => {
      rotateGroup(G, 0);
      heatDirty = true;
      draw();
    };
    $("eMic").onclick = () => {
      const k = Object.keys(MODELS).find((k) => used(k) < avail(k) && MODELS[k].pat !== "xy");
      if (!k) {
        $("eErr").textContent = "No spare mics left in the locker.";
        return;
      }
      const m = {
        id: "m" + st.nextId++,
        g: G.k,
        model: k,
        aim: "auto",
        h: 7,
        route: "auto",
        pat: MODELS[k].pat,
        label: "",
        ...defaultMicOffset(G, mic.length % 2 ? 0.3 : -0.3),
      };
      st.mics.push(m);
      sel = { t: "m", k: m.id };
      draw(true);
    };
  } else if (sel.t === "m") {
    const m = st.mics.find((x) => x.id === sel.k);
    if (!m) {
      sel = null;
      return renderSel();
    }
    const M = MODELS[m.model],
      r = res.mic[m.id],
      p = micPos(m);
    const aim = micAim(m) * DEG,
      a = M.pat === "xy" ? 0.5 : (PATS[m.pat] ?? 0.5),
      sp = soundAt({ ...p, z: micZ(m) }, { mic: 1, aim, a, xy: M.pat === "xy" });
    const own = m.g ? ownSum(sp.by, m.g) : 0,
      others = sp.tot - own;
    const bleed = m.g && own > 0 ? dB(others) - dB(own) : null;
    const topO = Object.entries(sp.by)
      .filter(([k]) => !(m.g && memberKeys(m.g).includes(k)))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, x]) => `${esc(gOf(k).l.replace(" part", ""))} ${(dB(x) - dB(own || sp.tot)).toFixed(0)} dB`)
      .join(", ");
    const models = Object.keys(MODELS)
      .map((k) => {
        const spare = avail(k) - used(k) + (k === m.model ? 1 : 0);
        return `<option value="${esc(k)}" ${k === m.model ? "selected" : ""} ${spare <= 0 ? "disabled" : ""}>${esc(k)} (${spare} free)</option>`;
      })
      .join("");
    const pats = M.pats && M.pats.length > 1 ? M.pats : [M.pat === "xy" ? "cardioid" : M.pat];
    b.innerHTML = `<div class="b6">${esc(micName(m))}</div><div class="m">${where(p)}</div>
  <div class="row"><span>Mic</span><select id="mM">${models}</select><button data-info="${esc(m.model)}" title="Mic info">ⓘ Info</button></div>
  <div class="row"><span>Pattern</span><select id="mP" ${M.pats && M.pats.length > 1 ? "" : "disabled"}>${pats.map((x) => opt(x, m.pat)).join("")}</select>${M.pat === "xy" ? '<span class="m">XY: two cardioids at ±45°</span>' : ""}</div>
  <div class="row"><span>Aim</span><select id="mA">${opt("auto", m.aim === "auto" ? "auto" : "man", "At its section")}${opt("man", m.aim === "auto" ? "auto" : "man", "Manual")}</select><input type="range" id="mR" min="-180" max="180" step="5" value="${Math.round(micAim(m))}" ${m.aim === "auto" ? "disabled" : ""} aria-label="Aim angle"></div>
  <div class="row"><span>Stand height</span><input type="number" id="mH" min="1" max="24" step="1" value="${m.h}"> ft</div>
  <div class="row"><span>Pattern reach</span><input type="range" id="mReach" min="5" max="60" step="1" value="${m.reach || 20}" aria-label="Pattern reach in feet"><span class="m" id="mReachV">${m.reach || 20} ft</span></div>
  <div class="row"><span></span><label title="Draws the pattern larger for more sensitive mics. Sensitivity changes output level, not the ratio of wanted sound to bleed."><input type="checkbox" id="mSens" ${m.sscale === false ? "" : "checked"}> Scale by sensitivity (${sensOf(m.model)} mV/Pa → ${sensScale(m.model).toFixed(2)}×)</label></div>
  <div class="row"><span>Attached to</span><select id="mG" aria-label="Section this mic moves with">${opt("", m.g || "", "Nothing (free-standing)")}${st.groups.map((x) => opt(x.k, m.g || "", x.l)).join("")}</select></div>
  <div class="row"><span>Plug into</span><select id="mT">${m.wire ? "" : opt("auto", m.route, "Nearest that fits")}${opt("desk", m.wire ? m.wire.to : m.route, "Desk")}${[
    "b24",
    "b20",
    "eth",
  ]
    .filter((i) => st.boxes[i].on)
    .map((i) => opt(i, m.wire ? m.wire.to : m.route, st.boxes[i].name))
    .join("")}</select></div>
  ${wireRow(m.wire, "m")}
  <div class="m">Track ${res.track[m.id].join(", ")} (${pre(res.track[m.id][0])}) · ${r.t === "desk" ? "desk" : esc(st.boxes[r.t].name)}: ${r.cabs.map(cabTxt).join(" | ")} (${r.need} ft needed)</div>
  <div class="mt8"><b>What this mic hears</b> <span class="m">(~${dB(sp.tot).toFixed(0)} dB SPL after the pattern)</span></div>
  ${bleed != null ? `<div class="${bleed > -6 ? "warn" : bleed > -12 ? "" : "ok"}">Everything else is ${Math.abs(bleed).toFixed(0)} dB ${bleed > 0 ? "louder" : "quieter"} than its own section</div>` : ""}
  <div class="m">${topO ? "Biggest bleed: " + topO : ""}</div>${cmpHTML(m, sp)}
  <div class="row"><button id="mDel">Remove mic</button></div>`;
    $("mM").onchange = () => {
      m.model = $("mM").value;
      const N = MODELS[m.model];
      m.pat = N.pat === "xy" ? "cardioid" : N.pat;
      draw(true);
    };
    $("mP").onchange = () => {
      m.pat = $("mP").value;
      draw(true);
    };
    $("mA").onchange = () => {
      m.aim = $("mA").value === "auto" ? "auto" : Math.round(micAim(m));
      draw(true);
    };
    $("mR").oninput = () => {
      m.aim = +$("mR").value;
      draw(true);
    };
    $("mH").onchange = () => {
      const h = +$("mH").value;
      if (h >= 1 && h <= 24) {
        m.h = h;
        draw(true);
      } else $("mH").value = m.h;
    };
    $("mT").onchange = () => {
      if (m.wire) m.wire.to = $("mT").value; // keeps the bends; the far end moves to the new box
      else m.route = $("mT").value;
      draw(true);
    };
    wireButtons(m, "m", () => res.mic[m.id]);
    $("mReach").oninput = () => {
      m.reach = +$("mReach").value;
      $("mReachV").textContent = m.reach + " ft";
      if (!$("tPolar").checked) {
        $("tPolar").checked = true;
        $("tPolar").dispatchEvent(new Event("change"));
      }
      draw(true);
    };
    $("mSens").onchange = () => {
      m.sscale = $("mSens").checked;
      draw(true);
    };
    $("mG").onchange = () => {
      attachMic(m, $("mG").value || null);
      draw(true);
      status(m.g ? `Attached to ${esc(gOf(m.g).l)}.` : "This mic now stays put when sections move.");
    };
    $("mDel").onclick = () => {
      st.mics = st.mics.filter((x) => x !== m);
      sel = null;
      draw(true);
    };
  } else if (sel.t === "e") {
    const mt = st.meters.find((x) => x.id === sel.k);
    if (!mt) {
      sel = null;
      return renderSel();
    }
    const r = soundAt(mt, { direct: 1 }),
      rRoom = soundAt(mt);
    const rows = Object.entries(r.by)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, x]) => `<tr><td>${esc(gOf(k).l)}</td><td>${dB(x).toFixed(0)} dB</td></tr>`)
      .join("");
    b.innerHTML = `<div class="b6">Sound meter</div><div class="m">${where(mt)}</div>
  <div style="font-size:22px;font-weight:600;margin:4px 0">~${dB(r.tot).toFixed(0)} dB direct</div><div class="m">~${dB(rRoom.tot).toFixed(0)} dB including the room · ${VENUE[$("venue").value].label}, everyone at fortissimo</div>
  <div class="m mt4">The badge shows direct sound because that's what changes from spot to spot. ${$("venue").value === "horton" ? "In Horton the reverberant room level is nearly the same everywhere, so the total barely moves." : ""}</div>
  ${specHTML(r.bands, 46, "meter")}<table class="mt8"><tr><th>Loudest here</th><th></th></tr>${rows}</table><div class="row"><button id="eDel">Remove meter</button></div>`;
    $("eDel").onclick = () => {
      st.meters = st.meters.filter((x) => x !== mt);
      sel = null;
      draw(true);
    };
  } else if (sel.t === "r") {
    const r = (st.risers || []).find((x) => x.id === sel.k);
    if (!r) {
      sel = null;
      return renderSel();
    }
    b.innerHTML = `<div class="b6">Riser</div><div class="m">${where(r)}</div>
  <div class="row"><span>Width (ft)</span><input type="number" id="rW" min="2" max="80" step="1" value="${r.w}"></div><div class="row"><span>Depth (ft)</span><input type="number" id="rD" min="2" max="60" step="1" value="${r.d}"></div>
  <div class="row"><span>Height (ft)</span><input type="number" id="rH" min="0" max="12" step="0.5" value="${r.h}"></div><div id="rErr" class="err"></div><div class="row"><button id="rDel">Delete riser</button></div>
  <p class="m">Players standing on a riser are raised by its height for sound, sightlines and 3D. Mic stands on a riser start from its top.</p>`;
    const up = () => {
      const w = +$("rW").value,
        d = +$("rD").value,
        h = +$("rH").value;
      if (!(w >= 2 && w <= 80 && d >= 2 && d <= 60 && h >= 0 && h <= 12)) {
        $("rErr").textContent = "Width 2–80, depth 2–60, height 0–12 ft.";
        return;
      }
      $("rErr").textContent = "";
      Object.assign(r, { w, d, h });
      heatDirty = true;
      draw();
    };
    ["rW", "rD", "rH"].forEach((i) => ($(i).onchange = up));
    $("rDel").onclick = () => {
      st.risers = st.risers.filter((x) => x !== r);
      sel = null;
      heatDirty = true;
      draw();
    };
  } else if (sel.t === "x") {
    b.innerHTML = `<div class="b6">Director</div><div class="m">${where(DIR)}</div><p class="m">Drag the X to move the director. Sightlines use the director's eye height from the Layout window${elevAt(DIR.v, DIR.u) ? `, plus this ${elevAt(DIR.v, DIR.u)} ft riser` : ""}.</p>`;
  } else if (sel.t === "b") {
    const B = st.boxes[sel.k],
      u = res.boxUp[sel.k];
    b.innerHTML = `<div class="b6">${esc(B.name)}</div><div class="m">${where(B)}</div>
  <div class="row"><span>Trunk runs to</span><select id="bU">${B.wire ? "" : opt("auto", B.up, "Nearest that fits")}${B.ups
    .filter((x) => x === "desk" || st.boxes[x].on)
    .map((x) => opt(x, B.wire ? B.wire.to : B.up, x === "desk" ? "Desk" : st.boxes[x].name))
    .join("")}</select></div>
  ${wireRow(B.wire, "b")}
  <div class="m">${res.load[sel.k]}/${B.cap} channels · trunk ${u ? u.need : "–"} of ${B.trunk} ft</div>`;
    $("bU").onchange = () => {
      if (B.wire) B.wire.to = $("bU").value;
      else B.up = $("bU").value;
      draw(true);
    };
    wireButtons(B, "b", () => res.boxUp[sel.k] && { t: res.boxUp[sel.k].u, pts: res.boxUp[sel.k].pts });
  } else
    b.innerHTML = `<div class="b6">Recording desk</div><div class="m">${where(st.desk)}</div><div class="m">Drag it; every run and trunk re-routes live.</div>`;
}
/* Accessories the Mic techniques notes (data/guide-notes.js) suggest for the sections in this layout, counted from
   the mics on those sections: an item that only matters with a condenser counts only the condenser mics. */
const KIND_GUIDE = {
  cl: "Clarinet", fl: "Flute", pic: "Flute", sax: "Saxophone", tsx: "Saxophone", ssx: "Saxophone", bsx: "Saxophone",
  tpt: "Trumpet", mel: "Trumpet", tb: "Trombone", bar: "Marching baritone", bd: "Marching bass drum",
  drm: "Drum kit", kck: "Drum kit", tom: "Drum kit", hh: "Drum kit", cym: "Drum kit",
  pno: "Piano", bas: "Bass amp", gtr: "Electric guitar amp", vox: "Vocalist",
};
function guideAccessories(I) {
  if (typeof GUIDE_NOTES !== "object") return "";
  const want = new Map(), // item -> { level, why, mics, secs }
    outdoors = $("venue").value === "out";
  for (const G of st.groups) {
    const N = GUIDE_NOTES[KIND_GUIDE[G.kind]];
    if (!N) continue;
    const mics = st.mics.filter((m) => m.g === G.k);
    for (const a of N.acc) {
      const n = mics.filter((m) => !a.cond || /DC/.test((MODELS[m.model] || {}).type || "")).length;
      if (!n) continue;
      const w = want.get(a.item) || { level: "suggested", why: a.why, mics: 0, secs: [] };
      if (a.level === "needed" && (!a.out || outdoors)) w.level = "needed";
      w.mics += n;
      w.secs.push(G.l);
      want.set(a.item, w);
    }
  }
  if (!want.size) return "";
  let h = invHead("Suggested by Mic techniques", "For the sections in this layout and the mics on them (draft notes; Mic techniques shows why).");
  h += `<table class="accSug"><tr><th>Item</th><th></th><th>For</th><th>Count</th><th></th></tr>`;
  for (const [name, w] of [...want].sort((a, b) => (a[1].level === b[1].level ? 0 : a[1].level === "needed" ? -1 : 1))) {
    const have = I.acc.find((a) => a.name === name),
      onList = have ? (have.owned || 0) + (have.add || 0) : 0;
    h += `<tr><td title="${esc(w.why)}">${esc(name)}</td><td><span class="mgLvl ${w.level}">${w.level}</span></td><td class="m">${esc(w.secs.join(", "))}</td><td>${w.mics}</td><td>${
      onList >= w.mics ? `<span class="m">on the list (${onList})</span>` : `<button data-accsug="${esc(JSON.stringify([name, w.mics]))}">${have ? "Top up" : "Add"}</button>`
    }</td></tr>`;
  }
  return h + "</table>";
}
/* Inspector: a cable's path is smart-routed or hand-drawn (docs/CABLE_ROUTING_PLAN.md). Drawing comes in phase 2;
   for now "Lock this path" keeps the current route as a hand-drawn one. */
function wireRow(w, p) {
  if (w) {
    const n = w.via.length;
    return `<div class="row"><span>Cable path</span><span class="m">Hand-drawn${n ? `, ${n} bend${n === 1 ? "" : "s"}` : ", straight"}</span><button id="${p}WireOff" title="Let smart route choose this cable's path and box again">Back to smart route</button></div>`;
  }
  return `<div class="row"><span>Cable path</span><span class="m">Smart route</span><button id="${p}WireOn" title="Keep this cable where it runs now; smart route won't change it">Lock this path</button></div>`;
}
function wireButtons(o, p, now) {
  const on = $(p + "WireOn"),
    off = $(p + "WireOff");
  if (on)
    on.onclick = () => {
      const r = now();
      if (!r) return;
      o.wire = { to: r.t, via: (r.pts || []).slice(1, -1).map((z) => ({ v: +z.v.toFixed(2), u: +z.u.toFixed(2) })) };
      draw(true);
      status("Cable path locked: smart route leaves it alone. Moving the ends keeps the bends where they are.");
    };
  if (off)
    off.onclick = () => {
      delete o.wire;
      draw(true);
      status("Back to smart route for this cable.");
    };
}
function signText(G) {
  if (!G) return "Room";
  const one = (x) => x.l.replace(/ (1st|2nd|3rd) part$/, " – $1 part");
  return members(G.k).map(one).join(" + ");
}
function renderChan() {
  let h = `<tr><th>Track</th><th>Preamp</th><th>Mic</th><th>Section · stand</th><th>Runs to</th><th>XLR</th></tr>`;
  const rows = [];
  for (const m of st.mics) res.track[m.id].forEach((t, i) => rows.push([t, m, i]));
  rigInputs()
    .filter((x) => x.dead)
    .forEach((x) => rows.push([x.t, null, x]));
  rows.sort((a, b) => (a[0] || 99) - (b[0] || 99));
  for (const [t, m, i] of rows) {
    if (!m) {
      h += `<tr><td>${t}</td><td>${esc(i.short)} ch${i.input}</td><td colspan="4" class="m">Blank: ${esc(i.label)} channel ${i.input} is dead</td></tr>`;
      continue;
    }
    const r = res.mic[m.id],
      G = m.g && gOf(m.g);
    h += `<tr><td>${t ?? "–"}</td><td>${pre(t)}${MODELS[m.model].pre === "D8" ? ", pad on" : ""}</td><td>${esc(m.model)}${MODELS[m.model].ch ? (i ? " (R)" : " (L)") : ""}<br><span class="m">${m.pat}${m.model === "AKG C414 XLII" ? ", pad −18" : m.model === "AKG C414B-ULS" ? ", pad −10" : ""}</span></td>
  <td>${
    G
      ? members(G.k)
          .map((x) => esc(x.l))
          .join(" + ")
      : "Free-standing"
  }${m.label ? " · " + esc(m.label) : ""}<br><span class="m">${m.h} ft stand · sign: “${esc(signText(G))}”</span></td>
  <td>${r.t === "desk" ? "Desk" : esc(st.boxes[r.t].name)}</td><td class="${r.cabs[i] ? "" : "warn"}">${cabTxt(r.cabs[i])}<br><span class="m">${r.need} ft needed</span></td></tr>`;
  }
  $("chan").innerHTML = h;
}

/* ---------- tabs ---------- */
function renderStats() {
  const tot = st.groups.reduce((a, G) => a + G.n, 0),
    ch = st.mics.reduce((a, m) => a + (MODELS[m.model].ch || 1), 0),
    area_ = st.groups.reduce((a, G) => a + area(G), 0);
  let minU = 1e9,
    maxU = -1e9,
    minV = 1e9,
    maxV = -1e9;
  for (const G of st.groups) {
    const k = scaleK(G);
    for (const [x, y] of shapeOf(G).out) {
      const p = toField(G, x * k, y * k);
      minU = Math.min(minU, p.u);
      maxU = Math.max(maxU, p.u);
      minV = Math.min(minV, p.v);
      maxV = Math.max(maxV, p.v);
    }
  }
  let h = `<div class="cards"><div class="card"><span class="m">Players</span><b>${tot}</b></div><div class="card"><span class="m">Sections</span><b>${st.groups.length}</b></div>
 <div class="card"><span class="m">Mics / channels</span><b>${st.mics.length} / ${ch}</b><span class="m">of 31 usable inputs</span></div>
 <div class="card"><span class="m">Players per section mic</span><b>${(tot / Math.max(1, st.mics.filter((m) => m.g).length)).toFixed(0)}</b></div>
 <div class="card"><span class="m">Band footprint</span><b>${Math.round(area_).toLocaleString()} sq ft</b><span class="m">spread ${Math.round((maxU - minU) / 3)} yd × ${Math.round(maxV - minV)} ft</span></div>
 <div class="card"><span class="m">XLR run</span><b>${res.len} ft</b><span class="m">${res.pieces} pieces · ${res.cross} under players</span></div></div>`;
  h += `<div class="tw"><table><tr><th>Section</th><th>Players</th><th>Sq ft each</th><th>Footprint</th><th>Shape</th><th>Mics</th><th>Players per mic</th><th>Level in the group</th><th>Own vs bleed at its mic</th></tr>`;
  for (const G of st.groups) {
    const ms = st.mics.filter((m) => memberKeys(G.k).includes(m.g));
    const lvl = dB(soundAt({ v: G.v, u: G.u }).tot);
    const bl = ms
      .map((m) => {
        const p = { ...micPos(m), z: micZ(m) },
          M = MODELS[m.model],
          sp = soundAt(p, {
            mic: 1,
            aim: micAim(m) * DEG,
            a: M.pat === "xy" ? 0.5 : (PATS[m.pat] ?? 0.5),
            xy: M.pat === "xy",
          });
        const own = ownSum(sp.by, G.k);
        return own > 0 ? dB(own) - dB(sp.tot - own) : null;
      })
      .filter((x) => x != null);
    h += `<tr><td>${esc(G.l)}</td><td>${esc(G.n)}</td><td>${G.a}</td><td>${Math.round(area(G))} sq ft</td><td>${SHAPES[G.shape].label.split(" (")[0]}</td><td>${
      ms.length
        ? ms.map((m) => m.model).join(", ") +
          (G.link
            ? ` <span class="m">(shared with ${members(G.k)
                .filter((x) => x !== G)
                .map((x) => esc(x.l.replace(" part", "")))
                .join(", ")})</span>`
            : "")
        : G.kind === "cym"
          ? '<span class="m">drumline overhead</span>'
          : '<span class="warn">none</span>'
    }</td><td>${ms.length ? Math.round(members(G.k).reduce((a, x) => a + x.n, 0) / ms.length) : "–"}</td><td>~${lvl.toFixed(0)} dB</td><td class="${bl.length && Math.max(...bl) < -6 ? "warn" : ""}">${bl.length ? bl.map((x) => (x >= 0 ? "+" : "") + x.toFixed(0) + " dB").join(", ") : "–"}</td></tr>`;
  }
  h += `</table></div><p class="m">“Own vs bleed” is the section's level at its own mic minus everything else the mic hears: positive means the section is louder than the bleed.</p>`;
  const byModel = {};
  st.mics.forEach((m) => (byModel[m.model] = (byModel[m.model] || 0) + 1));
  h += `<h4>Mics by type</h4><div class="m">${Object.entries(byModel)
    .map(([k, n]) => `${k} × ${n}`)
    .join(" · ")}</div>`;
  $("tStats").innerHTML = h;
}
function renderInv() {
  const AS = addedSummary(),
    I = inv();
  const auto = LENS.filter((L) => res.bought[L]).map((L) => `${res.bought[L]} × ${L} ft XLR`);
  const owned = Object.values(MODELS).reduce((a, m) => a + m.n, 0),
    inUse = st.mics.length,
    overOwned = Object.keys(MODELS)
      .filter((k) => used(k) > MODELS[k].n)
      .map((k) => `${k} (${used(k)} used, ${MODELS[k].n} owned)`);
  const need = {
      boom: st.mics.filter((m) => m.h > 4 && m.h <= 7).length,
      tall: st.mics.filter((m) => m.h > 7).length,
      short: st.mics.filter((m) => m.h <= 4).length,
    },
    standsUnknown = Object.values(I.standOwned).some((v) => v == null);
  const cost = { 50: 30, 25: 18, 20: 16, 10: 11, 6: 9, 3: 8 };
  let h = `<div class="cards"><div class="card"><span class="m">Mics owned</span><b>${owned}</b><span class="m">${Object.keys(MODELS).length} models</span></div><div class="card"><span class="m">Mics in this setup</span><b>${inUse}</b></div>
 <div class="card"><span class="m">XLR used</span><b>${res.len} ft</b><span class="m">${res.pieces} pieces</span></div><div class="card"><span class="m">Stands needed</span><b>${need.boom + need.tall + need.short}</b><span class="m">${need.boom} boom · ${need.tall} tall · ${need.short} short</span></div></div>`;
  h += `<h4>Shopping list</h4>${AS.length ? `<div>${AS.map((x) => "• " + x).join("<br>")}</div><p class="m">Items you added in the Gear tabs.</p>` : `<p class="m">Nothing added yet. Use the + buttons in the Gear tabs to plan purchases.</p>`}`;
  if (auto.length)
    h += `<div class="${st.buy ? "" : "warn"}">${st.buy ? "The router also wants" : "Still short for this layout"}: ${auto.join(", ")} (about $${LENS.reduce((a, L) => a + res.bought[L] * cost[L], 0)} at budget-brand prices)${st.buy ? "" : ". Add them in the Cables inv. tab or turn off Stock only."}</div>`;
  if (!st.buy && res.fail) {
    const r2 = solve({ buy: true }),
      b2 = LENS.filter((L) => r2.bought[L]);
    h += `<div class="warn">${res.fail} mic${res.fail === 1 ? "" : "s"} can't be reached. To reach every mic you'd need: ${b2.map((L) => `${r2.bought[L]} × ${L} ft`).join(", ")}.</div>`;
  }
  if (overOwned.length)
    h += `<div class="warn mt6">Using more than you own (covered by added gear): ${overOwned.join("; ")}</div>`;
  if (standsUnknown) h += `<p class="m">Enter how many stands you own in Gear › Stands to check them too.</p>`;
  $("tInv").innerHTML = h;
}
/* ---------- interaction ---------- */
let VB = { x: 0, y: 0, w: W, h: H };
function applyVB() {
  sv.setAttribute("viewBox", `${VB.x.toFixed(1)} ${VB.y.toFixed(1)} ${VB.w.toFixed(1)} ${VB.h.toFixed(1)}`);
  window.dispatchEvent(new Event("resize"));
}
function zoomAt(px, py, f) {
  const nw = Math.max(viewW() / 10, Math.min(viewW() * 1.5, VB.w * f));
  f = nw / VB.w;
  VB.x = px - (px - VB.x) * f;
  VB.y = py - (py - VB.y) * f;
  VB.w *= f;
  VB.h *= f;
  applyVB();
}
function zoomBy(f) {
  zoomAt(VB.x + VB.w / 2, VB.y + VB.h / 2, f);
}
function zoomFit() {
  VB = { x: 0, y: 0, w: viewW(), h: viewH() };
  applyVB();
}
sv.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const p = svgPtRaw(e);
    zoomAt(p.x, p.y, Math.exp(e.deltaY * 0.0015));
  },
  { passive: false },
);
let panning = null;
sv.addEventListener("pointerdown", (e) => {
  if (e.target.closest("g[data-t]")) return;
  if (e.button !== 0 && e.button !== 1) return;
  panning = { x: e.clientX, y: e.clientY, vx: VB.x, vy: VB.y, sc: VB.w / sv.getBoundingClientRect().width };
  sv.setPointerCapture(e.pointerId);
  sv.style.cursor = "grabbing";
});
sv.addEventListener("pointermove", (e) => {
  if (!panning) return;
  VB.x = panning.vx - (e.clientX - panning.x) * panning.sc;
  VB.y = panning.vy - (e.clientY - panning.y) * panning.sc;
  applyVB();
});
function finishPan() {
  if (panning) {
    panning = null;
    sv.style.cursor = "";
  }
}
sv.addEventListener("pointerup", finishPan);
sv.addEventListener("pointercancel", finishPan);
sv.addEventListener("lostpointercapture", finishPan);
window.addEventListener("blur", finishPan);
document.addEventListener("keydown", (e) => {
  if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) || !$("v3").hidden) return;
  if (e.key === "+" || e.key === "=") zoomBy(1 / 1.4);
  else if (e.key === "-") zoomBy(1.4);
  else if (e.key === "0") zoomFit();
});
function svgPtRaw(e) {
  const p = sv.createSVGPoint();
  p.x = e.clientX;
  p.y = e.clientY;
  return p.matrixTransform(sv.getScreenCTM().inverse());
}
function svgPt(e) {
  const p = svgPtRaw(e),
    [x, y] = wtInv(p.x, p.y);
  return { x, y };
}
sv.addEventListener("contextmenu", (e) => {
  if (e.target.closest("g[data-t]")) e.preventDefault();
});
sv.addEventListener("pointerdown", (e) => {
  const g = e.target.closest("g[data-t]");
  if (!g) return;
  const t = g.dataset.t,
    k = g.dataset.k;
  sel = { t, k };
  focusInspector();
  const p = svgPt(e),
    fv = V(p.x),
    fu = U(p.y);
  let obj, base;
  if (t === "g") {
    obj = gOf(k);
    base = { v: obj.v, u: obj.u };
  } else if (t === "m") {
    obj = st.mics.find((x) => x.id === k);
    base = micPos(obj);
  } else if (t === "b") {
    obj = st.boxes[k];
    base = { v: obj.v, u: obj.u };
  } else if (t === "r") {
    obj = st.risers.find((x) => x.id === k);
    base = { v: obj.v, u: obj.u };
  } else if (t === "x") {
    obj = DIR;
    base = { v: DIR.v, u: DIR.u };
  } else if (t === "e") {
    obj = st.meters.find((x) => x.id === k);
    base = { v: obj.v, u: obj.u };
  } else {
    obj = st.desk;
    base = { v: obj.v, u: obj.u };
  }
  let kind = "move";
  if (t === "g" && (e.ctrlKey || e.metaKey)) kind = "rot";
  else if (t === "g" && e.button === 2) kind = "size";
  drag = {
    t,
    obj,
    kind,
    ov: fv - base.v,
    ou: fu - base.u,
    moved: false,
    a0: Math.atan2(fu - base.u, fv - base.v),
    rot0: obj.rot || 0,
    d0: Math.max(1, Math.hypot(fv - base.v, fu - base.u)),
    sz0: obj.a,
  };
  sv.setPointerCapture(e.pointerId);
  e.preventDefault();
  draw(true);
});
sv.addEventListener("pointermove", (e) => {
  if (drag && drag.t === "wire") return; // js/wiredraw.js is dragging a cable bend
  const p = svgPt(e),
    fv = V(p.x),
    fu = U(p.y);
  if (drag) {
    drag.moved = true;
    const o = drag.obj;
    if (drag.kind === "rot") {
      let r = drag.rot0 + (Math.atan2(fu - o.u, fv - o.v) - drag.a0) / DEG;
      r = ((r + 540) % 360) - 180;
      rotateGroup(o, Math.round(r));
      drawSoon();
      status(`${o.l}: rotated ${o.rot}° from facing the director`);
      return;
    }
    if (drag.kind === "size") {
      const d = Math.max(1, Math.hypot(fv - o.v, fu - o.u));
      resizeGroup(o, drag.sz0 * (d / drag.d0));
      drawSoon();
      status(`${o.l}: ${o.a} sq ft per player · ${Math.round(area(o))} sq ft total`);
      return;
    }
    const nv = Math.max(0, Math.min(VMAX, fv - drag.ov)),
      nu = Math.max(U0, Math.min(UMAX, fu - drag.ou));
    if (drag.t === "x") {
      DIR.v = nv;
      DIR.u = nu;
      st.dir = { v: nv, u: nu };
      drawDir();
      heatDirty = true;
      drawSoon();
      status(where({ v: nv, u: nu }));
      return;
    }
    if (drag.t === "m" && o.g) {
      const G = gOf(o.g);
      o.dv = nv - G.v;
      o.du = nu - G.u;
    } else if (drag.t === "g" && o.lock) {
      const dv = nv - o.v,
        du = nu - o.u;
      st.groups
        .filter((x) => x.lock === o.lock)
        .forEach((x) => {
          x.v += dv;
          x.u += du;
        });
    } else {
      o.v = nv;
      o.u = nu;
    }
    drawSoon();
    status(where({ v: nv, u: nu }));
    return;
  }
  const tg = e.target.closest("[data-tip]"),
    tip = $("tip");
  if (tg) {
    tip.innerHTML = tg.dataset.tip;
    tip.style.display = "block";
    const r = $("fb").getBoundingClientRect();
    tip.style.left = Math.min(e.clientX - r.left + 12, r.width - 280) + "px";
    tip.style.top = e.clientY - r.top + 12 + "px";
  } else tip.style.display = "none";
});
function finishSvgDrag(e) {
  if (!drag || drag.t === "wire") return;
  if (drag.moved && drag.t === "m") {
    const m = drag.obj,
      p = micPos(m),
      G = inGroup(p, 2);
    if (G && G.k !== m.g) {
      attachMic(m, G.k);
      status(`${m.model} is now attached to ${G.l}. It moves with that section; drag it out to where you want it.`);
    }
  }
  if (!drag.moved) {
    const tg = e && e.target && e.target.closest ? e.target.closest("[data-tip]") : null;
    if (tg) status(tg.dataset.tip.replace(/<br>/g, " · "));
  }
  if (drag.moved && drag.t === "g") heatDirty = true;
  drag = null;
  draw();
}
sv.addEventListener("pointerup", finishSvgDrag);
sv.addEventListener("pointercancel", finishSvgDrag);
sv.addEventListener("lostpointercapture", finishSvgDrag);
window.addEventListener("pointerup", finishSvgDrag, true);
window.addEventListener("blur", finishSvgDrag);
sv.addEventListener("pointerleave", () => {
  $("tip").style.display = "none";
});
function attachMic(m, k) {
  const p = micPos(m);
  if (k) {
    const G = gOf(k);
    m.g = k;
    m.dv = p.v - G.v;
    m.du = p.u - G.u;
    delete m.v;
    delete m.u;
  } else {
    m.g = null;
    m.v = p.v;
    m.u = p.u;
    delete m.dv;
    delete m.du;
  }
}
function status(t) {
  $("status").textContent = t;
}
// field is 160 ft (53 1/3 yd) sideline to sideline; v = 0 is the numbers sideline nearest the drums
const FIELDW = 160,
  HASHES = {
    college: { label: "College", at: [60, 100] },
    nfl: { label: "NFL", at: [70.75, 89.25] },
    hs: { label: "High school", at: [160 / 3, 320 / 3] },
    none: { label: "", at: [] },
  };
function setHash(h) {
  if (!HASHES[h]) return;
  st.hash = h;
  $("hashSel").value = h;
  drawGrid();
  syncMenus();
  save();
  status(
    h === "none"
      ? "Hash marks hidden."
      : `${HASHES[h].label} hashes: ${h === "college" ? "60 ft" : h === "nfl" ? "70 ft 9 in" : "53 ft 4 in"} from each sideline.`,
  );
}

/* ---------- spectrum compare ---------- */
function cmpHTML(m, sp) {
  if (!m.g) return specHTML(sp.bands, 40);
  const own = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const k of memberKeys(m.g)) sp.byB[k].forEach((x, i) => (own[i] += x));
  const mx = Math.max(...sp.bands.map(dB)),
    col = KIND[gOf(m.g).kind].c,
    h = (x) => Math.max(2, ((dB(x) - mx + 36) / 36) * 100);
  const omx = Math.max(...own.map(dB)),
    diff = sp.bands.map((x, i) => dB(x) - dB(own[i])),
    worst = diff
      .map((d, i) => [d, i])
      .filter(([d, i]) => dB(own[i]) > omx - 24)
      .sort((a, b) => b[0] - a[0])
      .slice(0, 2);
  if ($("cmpDiff") && $("cmpDiff").checked) {
    const tot = (a) => a.reduce((x, y) => x + y, 0),
      hT = dB(tot(sp.bands)),
      oT = dB(tot(own));
    const dd = sp.bands.map((x, i) => dB(x) - hT - (dB(own[i]) - oT)),
      live = own.map((x) => dB(x) > omx - 24);
    const mx_ = Math.max(6, Math.ceil(Math.max(...dd.filter((v, i) => live[i]).map(Math.abs)) / 3) * 3),
      W_ = 240,
      H_ = 80,
      lx = (f) => ((Math.log10(f) - Math.log10(20)) / (Math.log10(25000) - Math.log10(20))) * W_,
      yv = (v) => H_ / 2 - (Math.max(-mx_, Math.min(mx_, v)) / mx_) * (H_ / 2 - 4);
    let g = `<line x1="0" x2="${W_}" y1="${H_ / 2}" y2="${H_ / 2}" stroke="var(--ink)" stroke-width="0.8"/>`;
    for (const f of [100, 1000, 10000])
      g += `<line x1="${lx(f).toFixed(1)}" x2="${lx(f).toFixed(1)}" y1="0" y2="${H_}" stroke="var(--rule)" stroke-width="0.6"/>`;
    let path = "";
    BCF.forEach((f, i) => {
      path += (i ? "L" : "M") + lx(f).toFixed(1) + " " + yv(dd[i]).toFixed(1);
    });
    g += `<path d="${path}L${lx(8000).toFixed(1)} ${H_ / 2}L${lx(63).toFixed(1)} ${H_ / 2}Z" fill="var(--mic)" fill-opacity="0.15"/><path d="${path}" fill="none" stroke="var(--mic)" stroke-width="2"/>`;
    BCF.forEach(
      (f, i) =>
        (g += `<circle cx="${lx(f).toFixed(1)}" cy="${yv(dd[i]).toFixed(1)}" r="3" fill="${live[i] ? "var(--mic)" : "var(--card)"}" stroke="var(--mic)"><title>${BANDS[i]} Hz: ${dd[i] >= 0 ? "+" : ""}${dd[i].toFixed(1)} dB${live[i] ? "" : " (section barely plays here)"}</title></circle>`),
    );
    g += `<text x="2" y="10" font-size="9" fill="var(--mute)">+${mx_} dB</text><text x="2" y="${H_ - 3}" font-size="9" fill="var(--mute)">−${mx_} dB</text>`;
    const up = dd
        .map((v, i) => [v, i])
        .filter(([v, i]) => live[i])
        .sort((a, b) => b[0] - a[0]),
      dn = up.slice().reverse();
    return `<svg viewBox="0 0 ${W_} ${H_}" width="100%" height="${H_}" preserveAspectRatio="none" class="lblk">${g}</svg>${specAxis("diff")}
  <div class="m">How the bleed changes this section's tone, both scaled to the same overall level. 0 = the mic hears the section's own tone; above the line = bleed makes that band stronger, below = relatively weaker. Most boosted: ${up
    .slice(0, 2)
    .map(([v, i]) => `${BANDS[i]} Hz (${v >= 0 ? "+" : ""}${v.toFixed(0)} dB)`)
    .join(", ")}; most cut: ${dn
    .slice(0, 1)
    .map(([v, i]) => `${BANDS[i]} Hz (${v.toFixed(0)} dB)`)
    .join("")}. Hollow dots are bands where the section barely plays.</div>`;
  }
  const chart =
    spPref().style === "bars"
      ? `<div class="cmp">${sp.bands.map((x, i) => `<div title="${BANDS[i]} Hz: section alone ${dB(own[i]).toFixed(0)} dB, mic hears ${dB(x).toFixed(0)} dB"><i style="height:${h(own[i])}%;background:${col};opacity:.55"></i><i style="height:${h(x)}%;background:var(--mic)"></i></div>`).join("")}</div>`
      : `<svg viewBox="0 0 240 70" width="100%" height="70" preserveAspectRatio="none" class="lblk">${specSVG(sp.bands, 240, 70, "", { range: 36, ref: mx, stroke: "var(--mic)" })}${specSVG(own, 240, 70, "", { range: 36, ref: mx, grid: false, stroke: col, dash: "4 3" })}</svg>`;
  return `${chart}${specAxis()}
 <div class="m"><span style="color:${col}">■</span> its section alone · <span style="color:var(--mic)">■</span> everything the mic hears. Where the section actually plays, bleed adds the most at ${worst.map(([d, i]) => `${BANDS[i]} Hz (+${d.toFixed(0)} dB)`).join(" and ")}.</div>`;
}
function renderSpecCmp() {
  const b = $("specCmp");
  const m = sel && sel.t === "m" && st.mics.find((x) => x.id === sel.k);
  if (!m) {
    b.innerHTML = "Select a mic to compare what it hears with its own section alone.";
    return;
  }
  const p = micPos(m),
    M = MODELS[m.model],
    sp = soundAt(
      { ...p, z: micZ(m) },
      { mic: 1, aim: micAim(m) * DEG, a: M.pat === "xy" ? 0.5 : (PATS[m.pat] ?? 0.5), xy: M.pat === "xy" },
    );
  b.innerHTML = `<div style="color:var(--ink);font-weight:600">${esc(micName(m))}</div>` + cmpHTML(m, sp);
}

/* ---------- sightlines ---------- */
let sightRes = null;
function computeSight() {
  const eyeD = +$("dirEye").value || 8,
    all = [];
  for (const G of st.groups) {
    const K = KIND[G.kind];
    people(G).forEach((q, i) =>
      all.push({
        g: G.k,
        v: q.v,
        u: q.u,
        e: q.e || 0,
        r: G.kind === "sou" ? 1.4 : 0.75,
        top: (G.kind === "sou" ? 8.2 : 5.7) + (q.e || 0),
      }),
    );
  }
  const blocked = [],
    byG = {};
  for (const G of st.groups) byG[G.k] = { n: 0, b: 0 };
  for (const P of all) {
    byG[P.g].n++;
    const dv = DIR.v - P.v,
      du = DIR.u - P.u,
      L2 = dv * dv + du * du;
    let hit = false;
    for (const O of all) {
      if (O === P) continue;
      const t = ((O.v - P.v) * dv + (O.u - P.u) * du) / L2;
      if (t <= 0.02 || t >= 0.98) continue;
      const px = P.v + dv * t,
        pu = P.u + du * t;
      if (Math.hypot(O.v - px, O.u - pu) > O.r) continue;
      const eyeP = 5.3 + (P.e || 0),
        eyeDD = eyeD + elevAt(DIR.v, DIR.u);
      if (O.top > eyeP + t * (eyeDD - eyeP)) {
        hit = true;
        break;
      }
    }
    if (hit) {
      blocked.push(P);
      byG[P.g].b++;
    }
  }
  return { blocked, byG };
}
function drawSight() {
  const g = $("gSight");
  g.innerHTML = "";
  if (!$("tSight").checked) {
    $("sightSum").textContent = "";
    return;
  }
  sightRes = computeSight();
  for (const P of sightRes.blocked) {
    const c = el(
      "circle",
      { cx: X(P.v), cy: Y(P.u), r: 1.3 * S, fill: "none", stroke: "#c0392b", "stroke-width": 1.3 },
      g,
    );
  }
  const tot = sightRes.blocked.length,
    n = Object.values(sightRes.byG).reduce((a, x) => a + x.n, 0);
  const worst = Object.entries(sightRes.byG)
    .filter(([k, x]) => x.b)
    .sort((a, b) => b[1].b / b[1].n - a[1].b / a[1].n)
    .slice(0, 4)
    .map(([k, x]) => `${esc(gOf(k).l.replace(" part", ""))} ${x.b}/${x.n}`);
  $("sightSum").innerHTML =
    `<span class="${tot ? "warn" : "ok"}">${tot} of ${n} players can't see the director</span>${worst.length ? " · worst: " + worst.join(", ") : ""}. Red rings mark them.`;
}

/* ---------- phase-risk pairs ---------- */
let phaseList = [];
function computePhase() {
  const out = [],
    info = st.mics.map((m) => {
      const p = micPos(m),
        M = MODELS[m.model];
      return {
        m,
        p,
        sp: soundAt(
          { ...p, z: micZ(m) },
          {
            mic: 1,
            direct: 1,
            aim: micAim(m) * DEG,
            a: M.pat === "xy" ? 0.5 : (PATS[m.pat] ?? 0.5),
            xy: M.pat === "xy",
          },
        ),
      };
    });
  for (let i = 0; i < info.length; i++)
    for (let j = i + 1; j < info.length; j++) {
      const A = info[i],
        B = info[j];
      let best = null;
      const ownA = A.m.g ? ownSum(A.sp.by, A.m.g) : Math.max(...Object.values(A.sp.by)),
        ownB = B.m.g ? ownSum(B.sp.by, B.m.g) : Math.max(...Object.values(B.sp.by));
      const ownKeys = new Set([...(A.m.g ? memberKeys(A.m.g) : []), ...(B.m.g ? memberKeys(B.m.g) : [])]);
      for (const G of st.groups) {
        if (!ownKeys.has(G.k)) continue;
        const la = dB(A.sp.by[G.k]),
          lb = dB(B.sp.by[G.k]);
        const diff = Math.abs(la - lb);
        if (diff > 9.5) continue;
        const da = Math.hypot(A.p.v - G.v, A.p.u - G.u, A.m.h - KIND[G.kind].h),
          db = Math.hypot(B.p.v - G.v, B.p.u - G.u, B.m.h - KIND[G.kind].h),
          ms = Math.abs(da - db) / 1.125;
        if (ms < 0.5) continue;
        if (!best || diff < best.diff) best = { G, diff, ms };
      }
      if (best) out.push({ a: A.m, b: B.m, ...best, sev: best.diff < 6 ? "High" : "Moderate" });
    }
  return out.sort((a, b) => a.diff - b.diff);
}
function drawPhase() {
  const g = $("gPhase");
  g.innerHTML = "";
  phaseList = computePhase();
  const nm = (m) =>
    (m.g
      ? members(m.g)
          .map((x) => x.l.replace(" part", ""))
          .join(" + ")
      : "Room") + (m.label ? " " + m.label : "");
  $("phaseBody").innerHTML = phaseList.length
    ? `<table><tr><th>Mic</th><th>Mic</th><th>Both hear</th><th>Level gap</th><th>Delay</th><th>Risk</th></tr>${phaseList.map((r, i) => `<tr data-ph="${i}" class="ptr"><td>${esc(nm(r.a))}</td><td>${esc(nm(r.b))}</td><td>${esc(r.G.l)}</td><td>${r.diff.toFixed(1)} dB</td><td>${r.ms.toFixed(1)} ms</td><td class="${r.sev === "High" ? "warn" : ""}">${r.sev}</td></tr>`).join("")}</table>
 <p class="m">Two mics hearing the same section within about 9.5 dB of each other (the 3:1 rule) comb-filter when mixed. Fix by spreading the mics, turning one away, or using only one of them for that section. Click a row to select the first mic.</p>`
    : `<span class="ok">No mic pairs break the 3:1 rule.</span>`;
  $("phaseBody")
    .querySelectorAll("[data-ph]")
    .forEach(
      (r) =>
        (r.onclick = () => {
          sel = { t: "m", k: phaseList[+r.dataset.ph].a.id };
          draw(true);
        }),
    );
  if (!$("tPhase").checked) return;
  for (const r of phaseList) {
    const a = micPos(r.a),
      b = micPos(r.b);
    const ln = el(
      "line",
      {
        x1: X(a.v),
        y1: Y(a.u),
        x2: X(b.v),
        y2: Y(b.u),
        stroke: "#c0392b",
        "stroke-width": r.sev === "High" ? 2.2 : 1.2,
        "stroke-dasharray": "6 3",
        "stroke-opacity": 0.8,
      },
      g,
    );
    const hit = el(
      "line",
      { x1: X(a.v), y1: Y(a.u), x2: X(b.v), y2: Y(b.u), stroke: "transparent", "stroke-width": 9 },
      g,
    );
    hit.dataset.tip = `Phase risk (${r.sev.toLowerCase()}) · both mics hear ${esc(r.G.l)}<br>${r.diff.toFixed(1)} dB apart, ${r.ms.toFixed(1)} ms delay between them`;
  }
}

/* ---------- lists in windows ---------- */
function renderLists() {
  $("secList").innerHTML = st.groups
    .map(
      (G) =>
        `<div class="secrow ${sel && sel.t === "g" && sel.k === G.k ? "on" : ""}" data-sk="${G.k}"><span class="sw" style="background:${KIND[G.kind].c}"></span>${esc(G.l)}<span class="m mla">${esc(G.n)}${G.link ? " · shared mic" : ""}</span></div>`,
    )
    .join("");
  $("secList")
    .querySelectorAll("[data-sk]")
    .forEach(
      (r) =>
        (r.onclick = () => {
          sel = { t: "g", k: r.dataset.sk };
          showWin("inspector");
          draw(true);
        }),
    );
  $("meterList").innerHTML = st.meters.length
    ? st.meters
        .map(
          (mt, i) =>
            `<div class="secrow ${sel && sel.t === "e" && sel.k === mt.id ? "on" : ""}" data-mk="${mt.id}">Meter ${i + 1}<span class="m">~${dB(soundAt(mt, { direct: 1 }).tot).toFixed(0)} dB direct</span><button class="hb mla" data-mdel="${mt.id}" aria-label="Delete meter ${i + 1}">✕</button></div>`,
        )
        .join("")
    : `<span class="m">No meters yet.</span>`;
  $("meterList")
    .querySelectorAll("[data-mk]")
    .forEach(
      (r) =>
        (r.onclick = (e) => {
          if (e.target.dataset.mdel) return;
          sel = { t: "e", k: r.dataset.mk };
          draw(true);
        }),
    );
  $("meterList")
    .querySelectorAll("[data-mdel]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          st.meters = st.meters.filter((x) => x.id !== b.dataset.mdel);
          if (sel && sel.k === b.dataset.mdel) sel = null;
          draw(true);
          status("Meter deleted.");
        }),
    );
}
/* ---------- inventory tabs ---------- */
const qtyCtl = (path, val) =>
  `<span class="qty"><button data-inc="${path}" data-d="-1" aria-label="Fewer">−</button><b>${val || 0}</b><button data-inc="${path}" data-d="1" aria-label="More">+</button></span>`;
function invHead(t, sub) {
  return `<h4 style="margin-top:0">${t}</h4>${sub ? `<p class="m" style="margin:0 0 6px">${sub}</p>` : ""}`;
}
function renderInvTabs() {
  const I = inv();
  // mics
  const types = [...new Set(Object.values(MODELS).map((m) => m.type))];
  let h = invHead(
    "Mics",
    `Owned started from your inventory sheet (${Object.values(OWNED0).reduce((a, b) => a + b, 0)} mics); change it here.${typeof team === "object" && team.gearName() ? ` Shared with your team “${esc(team.gearName())}”.` : ""} “Added” is gear you're planning to buy; the planner can use it, and it shows up on the shopping list.`,
  );
  h += `<div class="tw"><table><tr><th>Mic</th><th>Type</th><th>Owned</th><th>Added</th><th>In use</th><th>Spare</th><th></th></tr>`;
  for (const k of Object.keys(MODELS).sort()) {
    const M = MODELS[k],
      u = used(k),
      a = avail(k);
    h += `<tr><td>${k}${M.custom ? ' <span class="badge">new model</span>' : ""}</td><td>${M.type}</td><td><input type="number" min="0" step="1" data-mown="${esc(k)}" value="${M.n || 0}" aria-label="${esc(k)} owned" class="w56"></td><td>${qtyCtl("micAdd|" + k, I.micAdd[k])}</td><td>${u}</td><td class="${u > a ? "warn" : u > M.n ? "warn" : ""}">${a - u}${u > M.n ? ' <span class="badge">uses added</span>' : ""}</td><td><button class="hb" data-info="${k}" aria-label="Info about ${k}">ⓘ</button></td></tr>`;
  }
  h += `</table></div>`;
  const nmForm = `<div class="row"><input id="nmBrand" placeholder="Brand" class="w110" aria-label="Custom mic brand"><input id="nmModel" placeholder="Model" class="w110" aria-label="Custom mic model">
 <select id="nmType" aria-label="Custom mic type">${["Dynamic", "SDC", "LDC", "Tube LDC", "Tube SDC", "Ribbon"].map((t) => `<option>${t}</option>`).join("")}</select>
 <select id="nmPat" aria-label="Custom mic pattern">${["cardioid", "supercardioid", "hypercardioid", "omni", "figure-8", "wide cardioid"].map((t) => `<option>${t}</option>`).join("")}</select>
 <input id="nmQty" type="number" min="1" value="1" aria-label="Quantity to buy" class="w56"><button id="nmAdd">Add</button></div><div id="nmErr" class="err"></div>`;
  $("ivMics").innerHTML = h;
  if (!$("nmBrand")) $("nmWrap").innerHTML = nmForm;
  $("nmAdd").onclick = () => {
    const b = $("nmBrand").value.trim(),
      mo = $("nmModel").value.trim(),
      q = +$("nmQty").value;
    if (!b || !mo) {
      $("nmErr").textContent = "Enter a brand and a model.";
      return;
    }
    if (!(q >= 1 && Number.isInteger(q))) {
      $("nmErr").textContent = "Quantity must be a whole number of at least 1.";
      return;
    }
    const k = b + " " + mo;
    if (MODELS[k] && !MODELS[k].custom) {
      I.micAdd[k] = (I.micAdd[k] || 0) + q;
    } else {
      const t = $("nmType").value,
        cond = !/Dynamic|Ribbon/.test(t);
      I.custom[k] = {
        brand: b,
        model: mo,
        type: t,
        n: 0,
        pat: $("nmPat").value,
        pre: cond ? "D8" : "ADA",
        custom: 1,
        fr: null,
        avoid: "",
        opts: "",
        pattern: $("nmPat").value,
        notes: "Added in the planner",
        ai: "",
        best: "",
        uses: "",
        url: "",
        img: "",
      };
      MODELS[k] = I.custom[k];
      I.micAdd[k] = (I.micAdd[k] || 0) + q;
    }
    draw(true);
    status(`${q} × ${k} added to the plan (to buy).`);
  };
  // cables
  const res_ = res;
  let c = invHead(
    "XLR cables",
    "Owned is editable here or in the Cables window. Added cables count as available to the router and go on the shopping list.",
  );
  c += `<table><tr><th>Length</th><th>Owned</th><th>Added</th><th>In use</th><th>Left</th></tr>`;
  for (const L of LENS)
    c += `<tr><td>${L} ft</td><td>${st.stock[L] || 0}</td><td>${qtyCtl("cableAdd|" + L, I.cableAdd[L])}</td><td>${res_.used[L]}</td><td class="${res_.left[L] < 0 ? "warn" : ""}">${res_.left[L]}</td></tr>`;
  c += `</table>${res_.fail ? `<p class="warn">${res_.fail} mic${res_.fail === 1 ? "" : "s"} still can't be reached with owned + added cables.</p>` : `<p class="ok">Every mic is reachable with owned + added cables.</p>`}`;
  $("ivCables").innerHTML = c;
  // stands
  const need = {
      boom: st.mics.filter((m) => m.h > 4 && m.h <= 7).length,
      tall: st.mics.filter((m) => m.h > 7).length,
      short: st.mics.filter((m) => m.h <= 4).length,
    },
    SN = { boom: "Boom stand (up to 7 ft)", tall: "Tall stand (over 7 ft)", short: "Short / kick stand" };
  let t = invHead("Mic stands", "Your sheet doesn't list stands yet; enter what you own.");
  t += `<table><tr><th>Stand</th><th>Owned</th><th>Added</th><th>Needed</th><th>Short</th></tr>`;
  for (const k in SN) {
    const own = I.standOwned[k],
      have = (own || 0) + (I.standAdd[k] || 0),
      sh = need[k] - have;
    t += `<tr><td>${SN[k]}</td><td><input type="number" min="0" data-sown="${k}" value="${own ?? ""}" placeholder="?" aria-label="${SN[k]} owned" class="w56"></td><td>${qtyCtl("standAdd|" + k, I.standAdd[k])}</td><td>${need[k]}</td><td class="${sh > 0 ? "warn" : ""}">${own == null ? "?" : Math.max(0, sh)}</td></tr>`;
  }
  $("ivStands").innerHTML = t + "</table>";
  // snakes
  const SNK = {
    b24: ["24-ch snake, 100 ft", "maybe borrowed"],
    b20: ["20-ch snake, 50 ft", ""],
    eth: ["4-ch Ethercon box, 30 ft", ""],
  };
  let k_ = invHead("Snakes and stage boxes", "");
  k_ += `<table><tr><th>Item</th><th>Owned</th><th>Added</th><th>In use</th></tr>`;
  for (const id in SNK)
    k_ += `<tr><td>${SNK[id][0]}${SNK[id][1] ? ` <span class="m">${SNK[id][1]}</span>` : ""}</td><td>1</td><td>${qtyCtl("snakeAdd|" + id, I.snakeAdd[id])}</td><td>${st.boxes[id].on ? `yes, ${res_.load[id]}/${st.boxes[id].cap} ch` : "no"}</td></tr>`;
  $("ivSnakes").innerHTML = k_ + "</table>";
  // interfaces
  const tr = Object.values(res_.track)
    .flat()
    .filter((x) => x);
  $("ivIface").innerHTML = ifaceSection(I, tr);
  bindIfaceSection();
  // accessories
  let ac = invHead("Accessories", "From the Attachments tab of your sheet, plus anything you add.");
  ac += `<table><tr><th>Item</th><th>Owned</th><th>Added</th><th></th></tr>`;
  I.acc.forEach(
    (x, i) =>
      (ac += `<tr><td>${esc(x.name)}</td><td><input type="number" min="0" data-aown="${i}" value="${x.owned ?? ""}" placeholder="?" aria-label="${esc(x.name)} owned" class="w56"></td><td>${qtyCtl("acc|" + i, x.add)}</td><td>${x.user ? `<button class="hb" data-adel="${i}" aria-label="Remove ${esc(x.name)}">✕</button>` : ""}</td></tr>`),
  );
  ac += `</table><div class="row"><input id="accName" placeholder="Shock mount, windscreen, gaffer tape…" style="width:220px" aria-label="New accessory name"><button id="accAdd">Add item</button></div><div id="accErr" class="err"></div>`;
  ac += guideAccessories(I);
  $("ivAcc").innerHTML = ac;
  document.querySelectorAll("[data-accsug]").forEach(
    (b) =>
      (b.onclick = () => {
        const [name, n] = JSON.parse(b.dataset.accsug);
        const have = I.acc.find((a) => a.name === name);
        if (have) have.add = Math.max(have.add || 0, n - (have.owned || 0));
        else I.acc.push({ name, owned: 0, add: n, user: 1 });
        draw(true);
        status(`${name}: ${n} on the list for this layout.`);
      }),
  );
  $("accAdd").onclick = () => {
    const n = $("accName").value.trim();
    if (!n) {
      $("accErr").textContent = "Enter an item name.";
      return;
    }
    I.acc.push({ name: n, owned: 0, add: 1, user: 1 });
    draw(true);
  };
  document.querySelectorAll("[data-mown]").forEach(
    (x) =>
      (x.onchange = () => {
        const v = +x.value;
        if (x.value === "" || !(v >= 0 && Number.isInteger(v))) {
          x.value = MODELS[x.dataset.mown].n || 0;
          return;
        }
        setMicOwned(x.dataset.mown, v);
        window.dispatchEvent(new Event("rt:inventorychange"));
        heatDirty = true;
        draw(true);
      }),
  );
  document.querySelectorAll("[data-sown]").forEach(
    (x) =>
      (x.onchange = () => {
        const v = x.value === "" ? null : +x.value;
        if (v != null && !(v >= 0 && Number.isInteger(v))) {
          x.value = I.standOwned[x.dataset.sown] ?? "";
          return;
        }
        I.standOwned[x.dataset.sown] = v;
        draw(true);
      }),
  );
  document.querySelectorAll("[data-aown]").forEach(
    (x) =>
      (x.onchange = () => {
        const v = x.value === "" ? null : +x.value;
        if (v != null && !(v >= 0 && Number.isInteger(v))) {
          x.value = I.acc[+x.dataset.aown].owned ?? "";
          return;
        }
        I.acc[+x.dataset.aown].owned = v;
        draw(true);
      }),
  );
  document.querySelectorAll("[data-adel]").forEach(
    (x) =>
      (x.onclick = () => {
        I.acc.splice(+x.dataset.adel, 1);
        draw(true);
      }),
  );
}
function addedSummary() {
  const I = inv(),
    L = [];
  for (const k in I.micAdd) if (I.micAdd[k]) L.push(`${I.micAdd[k]} × ${k}`);
  for (const k in I.cableAdd) if (I.cableAdd[k]) L.push(`${I.cableAdd[k]} × ${k} ft XLR`);
  const SN = { boom: "boom stand", tall: "tall stand", short: "short/kick stand" };
  for (const k in I.standAdd) if (I.standAdd[k]) L.push(`${I.standAdd[k]} × ${SN[k]}`);
  for (const k in I.snakeAdd)
    if (I.snakeAdd[k])
      L.push(`${I.snakeAdd[k]} × ${{ b24: "24-ch snake", b20: "20-ch snake", eth: "4-ch Ethercon box" }[k]}`);
  for (const k in I.ifaceAdd)
    if (I.ifaceAdd[k]) L.push(`${I.ifaceAdd[k]} × ${{ d8: "DigiMax D8", ada: "ADA8000", dig: "Digiface" }[k] || (ifaceDef(k) || { name: k }).name}`);
  I.acc.forEach((x) => {
    if (x.add) L.push(`${x.add} × ${esc(x.name)}`);
  });
  return L;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-inc]");
  if (b) {
    const [kind, key] = b.dataset.inc.split("|"),
      d = +b.dataset.d,
      I = inv();
    if (kind === "acc") {
      const x = I.acc[+key];
      x.add = Math.max(0, (x.add || 0) + d);
    } else {
      I[kind][key] = Math.max(0, (I[kind][key] || 0) + d);
      if (kind === "micAdd" && MODELS[key] && MODELS[key].custom && !I.micAdd[key]) {
        delete I.custom[key];
        delete MODELS[key];
        delete I.micAdd[key];
      }
    }
    draw(true);
    return;
  }
  const inf = e.target.closest("[data-info]");
  if (inf) {
    openMicInfo(inf.dataset.info);
    return;
  }
  if (e.target.id === "micModal" || e.target.closest("[data-mmclose]")) closeMicInfo();
});

/* ---------- mic info modal ---------- */
let mmPat = null,
  mmKey = null;
// photo order: one you added in the planner, then mic-photos/<Brand Model>.jpg next to the HTML file, then the sheet's web link, then a drawing
const photoName = (k) => k.replace(" (XY stereo)", "");
function micImg(k, M) {
  if (inv().photos[k]) return `<img src="${inv().photos[k]}" alt="${k}">`;
  return `<img class="micPhoto" src="mic-photos/${encodeURIComponent(photoName(k))}.jpg" alt="${k}" referrerpolicy="no-referrer" data-web="${esc(M.img || "")}" data-mtype="${esc(M.type || "")}">`;
}
// A missing local photo falls back to the web link, then to a drawing. (A listener, not an inline onerror, so the
// page's Content Security Policy can forbid inline scripts.)
document.addEventListener(
  "error",
  (e) => {
    const im = e.target;
    if (!(im instanceof HTMLImageElement) || !im.classList.contains("micPhoto")) return;
    if (im.dataset.web && im.dataset.t !== "1") {
      im.dataset.t = "1";
      im.src = im.dataset.web;
    } else im.outerHTML = micSil(im.dataset.mtype);
  },
  true,
);
function micSil(type) {
  const T = type || "",
    col = "var(--mute)";
  if (/Dynamic/.test(T))
    return `<svg viewBox="0 0 80 160" width="90" aria-hidden="true"><path d="M22 10h36l-6 54H28z" fill="none" stroke="${col}" stroke-width="2"/><path d="M24 22h32M23 34h34M26 46h28M27 58h26" stroke="${col}"/><rect x="30" y="64" width="20" height="86" rx="5" fill="none" stroke="${col}" stroke-width="2"/></svg>`;
  if (/LDC/.test(T))
    return `<svg viewBox="0 0 80 160" width="90" aria-hidden="true"><rect x="16" y="8" width="48" height="70" rx="22" fill="none" stroke="${col}" stroke-width="2"/><path d="M18 30h44M17 45h46M18 60h44" stroke="${col}"/><rect x="22" y="78" width="36" height="72" rx="6" fill="none" stroke="${col}" stroke-width="2"/>${/Tube/.test(T) ? `<text x="40" y="118" text-anchor="middle" font-size="11" fill="${col}">tube</text>` : ""}</svg>`;
  return `<svg viewBox="0 0 80 160" width="90" aria-hidden="true"><rect x="29" y="8" width="22" height="30" rx="4" fill="none" stroke="${col}" stroke-width="2"/><path d="M30 18h20M30 28h20" stroke="${col}"/><rect x="30" y="38" width="20" height="112" rx="4" fill="none" stroke="${col}" stroke-width="2"/>${/Tube/.test(T) ? `<text x="40" y="100" text-anchor="middle" font-size="10" fill="${col}">tube</text>` : ""}</svg>`;
}
function polarSVG(pat) {
  const R = 80,
    c = 100;
  let g = "";
  for (const r of [1, 0.75, 0.5, 0.25])
    g += `<circle cx="${c}" cy="${c}" r="${R * r}" fill="none" stroke="var(--rule)"/>`;
  g += `<line x1="${c}" y1="${c - R}" x2="${c}" y2="${c + R}" stroke="var(--rule)"/><line x1="${c - R}" y1="${c}" x2="${c + R}" y2="${c}" stroke="var(--rule)"/>`;
  const path = (a, rot) => {
    let d = "";
    for (let i = 0; i <= 180; i++) {
      const t = i * 2 * DEG,
        r = Math.abs(a + (1 - a) * Math.cos(t)) * R,
        x = c + Math.sin(t + rot) * r,
        y = c - Math.cos(t + rot) * r;
      d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d + "Z";
  };
  const lobes = pat === "xy" ? [path(0.5, -45 * DEG), path(0.5, 45 * DEG)] : [path(PATS[pat] ?? 0.5, 0)];
  return `<svg viewBox="0 0 200 210" width="100%" style="max-width:240px" role="img" aria-label="${pat} polar pattern">${g}${lobes.map((d) => `<path d="${d}" fill="var(--mic)" fill-opacity=".18" stroke="var(--mic)" stroke-width="1.6"/>`).join("")}<text x="${c}" y="14" text-anchor="middle" font-size="10" fill="var(--mute)">front 0°</text><text x="${c}" y="207" text-anchor="middle" font-size="10" fill="var(--mute)">rear 180°</text></svg>`;
}
function frSVG(fr) {
  if (!fr) return `<p class="m">No response data for this mic.</p>`;
  // ±15 dB, widened in 5 dB steps for strongly shaped mics (e.g. a scooped kick mic)
  const R = Math.max(15, Math.ceil(Math.max(...fr.map((p) => Math.abs(p[1]))) / 5) * 5),
    W = 300,
    H = 150,
    x = (f) => 30 + ((Math.log10(f) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20))) * (W - 40),
    y = (d) => 15 + ((R - d) / (2 * R)) * (H - 35);
  let g = "";
  for (const f of [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000])
    g += `<line x1="${x(f)}" y1="15" x2="${x(f)}" y2="${H - 20}" stroke="var(--rule)"/><text x="${x(f)}" y="${H - 6}" text-anchor="middle" font-size="9" fill="var(--mute)">${f >= 1000 ? f / 1000 + "k" : f}</text>`;
  for (const d of R > 15 ? [-R + 5, -10, 0, 10, R - 5].filter((v, i, a) => a.indexOf(v) === i) : [-10, 0, 10])
    g += `<line x1="30" x2="${W - 10}" y1="${y(d)}" y2="${y(d)}" stroke="var(--rule)" ${d ? "" : 'stroke-width="1.5"'}/><text x="26" y="${y(d) + 3}" text-anchor="end" font-size="9" fill="var(--mute)">${d > 0 ? "+" : ""}${d}</text>`;
  const pts = [[20, fr[0][1]], ...fr, [20000, fr[fr.length - 1][1]]].filter((p, i, a) => i === 0 || p[0] > a[i - 1][0]);
  let d = "";
  for (let f = 20; f <= 20000; f *= 1.04) {
    let i = pts.findIndex((p) => p[0] >= f);
    if (i <= 0) i = 1;
    const [f0, d0] = pts[i - 1],
      [f1, d1] = pts[i],
      t = (Math.log(f) - Math.log(f0)) / (Math.log(f1) - Math.log(f0) || 1),
      s_ = (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) / 2;
    d += (d ? "L" : "M") + x(f).toFixed(1) + " " + y(d0 + (d1 - d0) * s_).toFixed(1);
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Approximate frequency response">${g}<path d="${d}" fill="none" stroke="${spPref().color === "muted" ? "var(--mute)" : spPref().color === "single" ? "var(--mic)" : "var(--red)"}" stroke-width="2"/></svg><p class="m" style="margin:2px 0 0">Approximate shape from the published curve, not a measurement.</p>`;
}
function openMicInfo(k, row) {
  let M = MODELS[k];
  if (!M && row) M = modelFromDb(row);
  if (!M) return;
  mmKey = k;
  mmPat = mmPat && (M.pats || []).includes(mmPat) ? mmPat : M.pat;
  const u = used(k),
    I = inv();
  const pats = M.pat === "xy" ? ["xy"] : M.pats && M.pats.length ? M.pats : [M.pat];
  const assigned = st.mics
    .filter((m) => m.model === k)
    .map((m) => {
      const G = m.g && gOf(m.g);
      return G ? G.l : m.label || "free-standing";
    });
  $("mmBox").innerHTML =
    `<div class="mmHead"><div class="f1"><div class="m">${esc(M.brand)}</div><h2 id="mmTitle">${esc(M.model)}</h2>
  <div class="mt4"><span class="badge" style="background:var(--field);color:var(--ink)">${M.type}</span> <span class="m">Owned ${esc(M.n)}${I.micAdd[k] ? ` · +${I.micAdd[k]} to buy` : ""} · in use ${u}${assigned.length ? " (" + esc(assigned.join(", ")) + ")" : ""}</span></div></div>
  ${M.url ? `<a href="${M.url}" target="_blank" rel="noopener">Product page ↗</a>` : ""}<button data-mmclose aria-label="Close">✕</button></div>
  <div class="mmGrid"><div><div class="mmPic">${micImg(k, M)}</div>
   <div class="row"><label class="m ptr"><input type="file" id="mmPhoto" accept="image/*" style="display:none"><span class="chip">${inv().photos[k] ? "Replace photo" : "Add a photo"}</span></label>${inv().photos[k] ? '<button class="chip" id="mmPhotoDel">Remove</button>' : ""}</div>
   <div class="mmSec"><h4>Options and switches</h4><p>${M.opts || "None"}</p>${(() => {
     const r = dbFor(k) || row;
     if (!r) return "";
     // vf: checked against the maker's published specs on that date (src); ap: figures worked out, not published.
     const ap = r.ap || {},
       f = (v, u, k) => (v == null ? "—" : ap[k] ? `<span title="${esc(ap[k])}">≈${v}${u}</span>` : v + u),
       head = r.vf ? `Specs (checked against the maker's specs, ${r.vf})` : "Specs (approx.)";
     return `<h4>${head}</h4><p class="m">Sensitivity ${f(r.s, " mV/Pa", "s")} · max SPL ${f(r.x, " dB", "x")}${r.xp ? ` (${f(r.xp, " dB", "xp")} with pad)` : ""} · self-noise ${f(r.n, " dBA", "n")} · ${r.pw} · in production: ${r.prod}</p>${
       r.aka ? `<p class="m">Also listed as: ${esc(r.aka.join(", "))}</p>` : ""
     }${Object.keys(ap).length ? `<p class="m">≈ worked out from the maker's other figures (hover for how).</p>` : ""}${
       r.src ? `<p class="m">Sources: ${r.src.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener">${i + 1}</a>`).join(" · ")}</p>` : ""
     }`;
   })()}<h4>Preamp in this rig</h4><p>${M.pre === "D8" ? "DigiMax D8 (pad on)" : "ADA8000"}${M.ch ? " · 2 channels" : ""}</p></div></div>
   <div class="mmSec"><h4>Polar pattern</h4><div>${pats.map((p) => `<button class="chip ${p === mmPat || pats.length === 1 ? "on" : ""}" data-mmpat="${p}">${p === "xy" ? "XY pair" : p}</button>`).join("")}</div>
    <div id="mmPolar">${polarSVG(pats.length === 1 ? pats[0] : mmPat)}</div><p class="m">${M.pattern || ""}</p></div>
   <div class="mmSec"><h4>Frequency response</h4>${frSVG(M.fr || (dbFor(k) || row || {}).fr)}${(() => {
     const r = dbFor(k) || row;
     return r && r.fr && !(MODELS[k] && MODELS[k].fr)
       ? `<p class="m">Traced from the maker's published chart${r.frPat ? ` (${esc(r.frPat)})` : ""}, relative to 1 kHz; about ±1 dB. ${r.frSrc ? r.frSrc.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener">source${r.frSrc.length > 1 ? " " + (i + 1) : ""}</a>`).join(" · ") : ""}</p>`
       : "";
   })()}
    <h4>Good for</h4><p>${[M.best, M.uses && M.uses !== M.best ? "Your notes: " + M.uses : ""].filter(Boolean).join("<br>") || "—"}</p>
    <h4>Avoid</h4><p>${M.avoid || "—"}</p>
    <h4>About it</h4><p>${M.ai || "—"}${M.notes ? `<br><span class="m">Your notes: ${M.notes}</span>` : ""}</p></div></div>`;
  $("mmBox")
    .querySelectorAll("[data-mmpat]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          mmPat = b.dataset.mmpat;
          openMicInfo(k, row);
        }),
    );
  $("mmPhoto").onchange = () => {
    const f = $("mmPhoto").files[0];
    if (!f) return;
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas"),
        sc = Math.min(1, 320 / Math.max(im.width, im.height));
      c.width = Math.round(im.width * sc);
      c.height = Math.round(im.height * sc);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      inv().photos[k] = c.toDataURL("image/jpeg", 0.82);
      save();
      openMicInfo(k, row);
    };
    im.onerror = () => status("That image couldn't be read.");
    im.src = URL.createObjectURL(f);
  };
  if ($("mmPhotoDel"))
    $("mmPhotoDel").onclick = () => {
      delete inv().photos[k];
      save();
      openMicInfo(k, row);
    };
  $("micModal").hidden = false;
  $("mmBox").querySelector("[data-mmclose]").focus();
}
function closeMicInfo() {
  $("micModal").hidden = true;
  mmKey = null;
}
document.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Escape" && !$("micModal").hidden) {
      closeMicInfo();
      e.stopPropagation();
    }
  },
  true,
);
/* ---------- loudness reference chart ---------- */
const DBREF = [
  [0, "Threshold of hearing"],
  [10, "Breathing"],
  [20, "Rustling leaves, a ticking watch"],
  [30, "Whisper at 5 ft, quiet library"],
  [40, "After-hours office, refrigerator hum"],
  [50, "Quiet suburb, moderate rain"],
  [60, "Normal conversation at 3 ft"],
  [70, "Vacuum cleaner at 10 ft, busy street"],
  [80, "Garbage disposal, busy restaurant"],
  [85, "Sports bar on game night; hearing damage starts over 8 hours"],
  [90, "Lawn mower at the operator, subway train"],
  [100, "Motorcycle at 25 ft, snowmobile"],
  [105, "Inside a marching band at full volume"],
  [110, "Rock concert near the stage, car horn at 3 ft"],
  [115, "Inside a drumline"],
  [120, "Thunderclap, siren up close; threshold of pain"],
  [130, "Jackhammer at 3 ft"],
  [140, "Jet airplane taking off, 50 ft away"],
  [150, "Firecracker at arm's length"],
];
const safeTime = (L) => {
  if (L < 85) return "no limit";
  if (L >= 125) return "avoid without protection";
  const m = 480 / Math.pow(2, (L - 85) / 3);
  return m >= 60
    ? `${(m / 60).toFixed(m >= 120 ? 0 : 1)} h`
    : m >= 1
      ? `${Math.round(m)} min`
      : `${Math.max(1, Math.round(m * 60))} s`;
};
function renderDb() {
  const el_ = $("dbBody");
  if (!el_) return;
  const marks = [];
  st.meters.forEach((mt, i) => {
    const d = dB(soundAt(mt, { direct: 1 }).tot),
      r = dB(soundAt(mt).tot);
    marks.push([d, `Meter ${i + 1} (direct)`]);
    marks.push([r, `Meter ${i + 1} (with the room)`]);
  });
  for (const G of st.groups) {
    if (G.kind === "snr" || G.kind === "bd" || (G.kind === "tpt" && G.k === "t1") || (G.kind === "cl" && G.k === "cl1"))
      marks.push([dB(soundAt({ v: G.v, u: G.u }, { direct: 1 }).tot), `Inside ${G.l.replace(" part", "")} (estimate)`]);
  }
  const rows = [...DBREF.map(([L, t]) => ({ L, t, ref: 1 })), ...marks.map(([L, t]) => ({ L, t, ref: 0 }))].sort(
    (a, b) => b.L - a.L,
  );
  el_.innerHTML = `<table class="dbt"><tr><th>dB</th><th></th><th>How loud that is</th><th>Safe exposure</th></tr>${rows.map((r) => `<tr class="${r.ref ? "" : "mk"}"><td>${Math.round(r.L)}</td><td><span class="dbbar" style="width:${Math.max(4, (r.L / 150) * 120)}px;background:hsl(${Math.max(0, 120 - Math.max(0, r.L - 40) * 1.25)},65%,45%)"></span></td><td>${r.ref ? esc(r.t) : `<b>◀ ${esc(r.t)}</b>`}</td><td class="${r.L >= 85 ? "warn" : "m"}">${safeTime(r.L)}</td></tr>`).join("")}</table>
 <p class="m">Typical levels; real ones vary with distance. Safe exposure follows the NIOSH guideline (85 dBA for 8 hours, halving every 3 dB). Planner levels are rough estimates with everyone at fortissimo. Every +10 dB sounds about twice as loud.</p>`;
}
/* ---------- mic database grid ---------- */
function typeNorm(t) {
  return /Tube/.test(t)
    ? /SDC/.test(t)
      ? "Tube SDC"
      : "Tube LDC"
    : /Ribbon/.test(t)
      ? "Ribbon"
      : /Dynamic/.test(t)
        ? "Dynamic"
        : /LDC/.test(t)
          ? "LDC"
          : /XY/.test(t)
            ? "SDC"
            : /SDC|Miniature/.test(t)
              ? "SDC"
              : /Clip/.test(t)
                ? "Clip-on condenser"
                : /Boundary/.test(t)
                  ? "Boundary"
                  : /Shotgun/.test(t)
                    ? "Shotgun"
                    : "Condenser";
}
function patsFrom(p) {
  const L = ["omni", "wide cardioid", "cardioid", "supercardioid", "hypercardioid", "figure-8"];
  if (/XY/.test(p)) return { pat: "xy", pats: [] };
  const f = L.filter((x) => new RegExp("(^|[ ,(/])" + x.replace("-", "\\-") + "($|[ ,)/])", "i").test(p));
  const pat = f.includes("cardioid") ? "cardioid" : f[0] || "cardioid";
  return { pat, pats: f.length > 1 ? f : [] };
}
function modelFromDb(r) {
  const P = patsFrom(r.p),
    cond = !/Dynamic|Ribbon/.test(r.t);
  return {
    brand: r.b,
    model: String(r.m),
    type: r.t,
    n: 0,
    pat: P.pat,
    pats: P.pats.length ? P.pats : undefined,
    pre: cond && !r.pad ? "D8" : "ADA",
    ch: P.pat === "xy" ? 2 : undefined,
    custom: 1,
    fr: r.fr || null,
    avoid: "",
    opts: [r.pad ? "Pad" : "", r.hpf ? "HPF" : "", P.pats.length > 1 ? "Pattern switch" : ""]
      .filter(Boolean)
      .join(", "),
    pattern: r.p,
    notes: "",
    ai: "",
    best: r.u,
    uses: "",
    url: "",
    img: "",
    db: r,
  };
}
const dbF = { q: "", types: new Set(), txt: {}, min: {}, sel: {} };
// tags: attributes that don't need their own column; picked like store filters and still searchable
function tagsOf(r) {
  const T = [],
    t = r.t,
    p = r.p || "",
    u = (r.u || "").toLowerCase();
  if (/Clip/.test(t)) T.push("Clip-on");
  if (/Tube/.test(t) || /Power supply/.test(r.pw || "")) T.push("Needs tube power supply");
  if (/XY/.test(t + p)) T.push("Stereo XY");
  if (/capsule|interchangeable/i.test(p)) T.push("Interchangeable capsules");
  else if (/,/.test(p) && !/XY/.test(p)) T.push("Switchable pattern");
  if (r.pad) T.push("Pad");
  if (r.hpf) T.push("High-pass filter");
  if (/Battery/i.test(r.pw || "")) T.push("Battery option");
  if (/Phantom/.test(r.pw || "")) T.push("Needs phantom power");
  if (r.pw === "None") T.push("No power needed");
  if (/Ribbon/.test(t)) T.push("Ribbon");
  if (/Boundary/.test(t)) T.push("Boundary");
  if (/Shotgun/.test(t)) T.push("Shotgun");
  if (/handheld/i.test(t) || /live vocal/.test(u)) T.push("Handheld vocal");
  if (/kick/.test(u)) T.push("Good on kick");
  if (/brass|horn|sax|trumpet|tuba|woodwind/.test(u)) T.push("Good on brass/winds");
  if (/overhead|cymbal|hi-hat/.test(u)) T.push("Good as overhead");
  if (/snare|tom/.test(u)) T.push("Good on snare/toms");
  if ((r.x && r.x >= 150) || (r.xp && r.xp >= 150)) T.push("Very high SPL (150 dB+)");
  if (r.n != null && r.n <= 10) T.push("Very low noise (≤10 dBA)");
  if (r.prod === "No") T.push("Discontinued");
  return T;
}
const MICTAGS = new Map(MICDB.map((r) => [r, tagsOf(r)])),
  micTags = (r) => MICTAGS.get(r) || (MICTAGS.set(r, tagsOf(r)), MICTAGS.get(r)); // mics added later have no entry yet
function dbRows(skipTags) {
  const q = dbF.q.toLowerCase().replace(/\s+/g, "");
  return MICDB.filter((r) => {
    const tg = micTags(r);
    if (!skipTags && dbF.tags && dbF.tags.size && ![...dbF.tags].every((x) => tg.includes(x))) return false;
    if (dbF.tagTxt && !tg.join(" ").toLowerCase().includes(dbF.tagTxt.toLowerCase())) return false;
    const name = (r.b + " " + r.m + " " + (r.aka || []).join(" ") + " " + r.t + " " + r.u + " " + tg.join(" ")).toLowerCase();
    if (q && !name.replace(/\s+/g, "").includes(q)) return false;
    if (dbF.types.size && !dbF.types.has(typeNorm(r.t))) return false;
    for (const f in dbF.txt) {
      const v = dbF.txt[f];
      if (
        v &&
        !String(r[f] ?? "")
          .toLowerCase()
          .includes(v.toLowerCase())
      )
        return false;
    }
    for (const f in dbF.min) {
      const v = dbF.min[f];
      if (v !== "" && v != null && !(r[f] != null && r[f] >= +v)) return false;
    }
    for (const f in dbF.sel) {
      const v = dbF.sel[f];
      if (v && r[f] !== v) return false;
    }
    return true;
  }).sort((a, b) => (a.b + a.m).localeCompare(b.b + b.m));
}
function keyForDb(r) {
  const k = r.b + " " + r.m;
  if (MODELS[k]) return k;
  const own = Object.keys(MODELS).find((x) => dbFor(x) === r);
  return own || k;
}
function renderTagBar() {
  dbF.tags = dbF.tags || new Set();
  const base = dbRows(true),
    cnt = {};
  for (const r of base) for (const x of micTags(r)) cnt[x] = (cnt[x] || 0) + 1;
  const all = [...new Set(MICDB.flatMap(micTags))].sort();
  $("dbTagBar").innerHTML =
    `<span class="m">Tags:</span>` +
    all
      .map((x) => {
        const on = dbF.tags.has(x),
          n = cnt[x] || 0;
        return `<button class="tag ${on ? "on" : ""}" data-tagbtn="${x}" ${!n && !on ? "disabled" : ""} aria-pressed="${on}">${x} <span class="m">${n}</span></button>`;
      })
      .join("") +
    (dbF.tags.size ? `<button class="hb" id="dbTagClear">Clear tags</button>` : "");
  $("dbTagBar")
    .querySelectorAll("[data-tagbtn]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const x = b.dataset.tagbtn;
          dbF.tags.has(x) ? dbF.tags.delete(x) : dbF.tags.add(x);
          renderDbGrid();
        }),
    );
  if ($("dbTagClear"))
    $("dbTagClear").onclick = () => {
      dbF.tags.clear();
      renderDbGrid();
    };
}
function renderDbGrid() {
  renderTagBar();
  const rows = dbRows();
  $("dbCount").textContent = `${rows.length} of ${MICDB.length} mics`;
  $("dbBody").innerHTML =
    rows
      .map((r, i) => {
        const k = keyForDb(r),
          own = MODELS[k] ? MODELS[k].n : 0,
          add = inv().micAdd[k] || 0;
        return `<tr><td>${esc(r.b)}</td><td><b>${esc(r.m)}</b>${r.aka ? `<div class="m" title="Also listed as">aka ${esc(r.aka.join(", "))}</div>` : ""}</td><td style="white-space:normal;min-width:160px">${micTags(
          r,
        )
          .map((x) => `<span class="tag ${dbF.tags && dbF.tags.has(x) ? "on" : ""}" data-tagclick="${x}">${x}</span>`)
          .join(
            "",
          )}</td><td>${r.t}</td><td title="${r.p}">${r.p.length > 26 ? r.p.slice(0, 25) + "…" : r.p}</td><td>${r.s ?? "—"}</td><td>${r.x ?? "—"}${r.xp ? ` / ${r.xp}` : ""}</td><td>${r.pw}</td><td>${r.prod}</td><td title="${r.u}">${r.u.length > 30 ? r.u.slice(0, 29) + "…" : r.u}</td><td>${own}${add ? ` <span class="badge">+${add}</span>` : ""}</td><td><button data-dbadd="${MICDB.indexOf(r)}">${own || add ? "+1" : "Add"}</button><button class="hb" data-dbinfo="${MICDB.indexOf(r)}" aria-label="Info about ${esc(r.b)} ${esc(r.m)}">ⓘ</button></td></tr>`;
      })
      .join("") || `<tr><td colspan="12" class="m">No mics match. Clear a filter or try a shorter search.</td></tr>`;
  $("dbBody")
    .querySelectorAll("[data-dbadd]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const r = MICDB[+b.dataset.dbadd],
            k = keyForDb(r);
          if (!MODELS[k]) {
            const M = modelFromDb(r);
            inv().custom[k] = M;
            MODELS[k] = M;
          }
          inv().micAdd[k] = (inv().micAdd[k] || 0) + 1;
          draw(true);
          renderDbGrid();
          status(`1 × ${k} added to the plan (to buy).`);
        }),
    );
  $("dbBody")
    .querySelectorAll("[data-dbinfo]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const r = MICDB[+b.dataset.dbinfo];
          openMicInfo(keyForDb(r), r);
        }),
    );
}
$("umDet").addEventListener("toggle", () => $("umDet").open && userMicsUI.render()); // Add a mic with its specs (js/usermics.js)
(function initDbGrid() {
  const types = [...new Set(MICDB.map((r) => typeNorm(r.t)))].sort();
  $("dbTypes").innerHTML = types
    .map((t) => `<label style="display:block;white-space:nowrap"><input type="checkbox" value="${t}"> ${t}</label>`)
    .join("");
  $("dbTypes")
    .querySelectorAll("input")
    .forEach(
      (c) =>
        (c.onchange = () => {
          c.checked ? dbF.types.add(c.value) : dbF.types.delete(c.value);
          $("dbTypeSum").textContent = dbF.types.size ? [...dbF.types].join(", ") : "All types";
          renderDbGrid();
        }),
    );
  $("dbQ").oninput = () => {
    dbF.q = $("dbQ").value;
    renderDbGrid();
  };
  document.querySelector("[data-ftag]").oninput = (e) => {
    dbF.tagTxt = e.target.value;
    renderDbGrid();
  };
  $("dbBody").addEventListener("click", (e) => {
    const t = e.target.closest("[data-tagclick]");
    if (!t) return;
    dbF.tags = dbF.tags || new Set();
    const x = t.dataset.tagclick;
    dbF.tags.has(x) ? dbF.tags.delete(x) : dbF.tags.add(x);
    renderDbGrid();
  });
  document.querySelectorAll("[data-f]").forEach(
    (i) =>
      (i.oninput = () => {
        dbF.txt[i.dataset.f] = i.value;
        renderDbGrid();
      }),
  );
  document.querySelectorAll("[data-fmin]").forEach(
    (i) =>
      (i.oninput = () => {
        dbF.min[i.dataset.fmin] = i.value;
        renderDbGrid();
      }),
  );
  document.querySelectorAll("[data-fsel]").forEach(
    (i) =>
      (i.onchange = () => {
        dbF.sel[i.dataset.fsel] = i.value;
        renderDbGrid();
      }),
  );
  setTimeout(renderDbGrid, 0);
})();

/* ---------- heatmap explanations ---------- */
function openHeatInfo() {
  const cur = $("heat").value,
    H = [
      [
        "spl",
        "Direct sound",
        "How loud the band is at each spot from the instruments themselves, ignoring the room's echo. Red is loud, blue quiet. Use it to see which sections dominate an area and where it's quieter between groups.",
      ],
      [
        "tone",
        "Tone of the direct sound",
        "Where the sound is low-heavy (red) or bright (violet): whether a spot hears mostly sousas and bass drums, or mostly trumpets, piccolos and cymbals. Brightness, not loudness.",
      ],
      [
        "room",
        "Total loudness incl. room",
        "Direct sound plus the room's reverberation. In a hard space like Horton the echo is about as loud everywhere, so this map looks flat; that is the real effect, not a bug.",
      ],
      [
        "cover",
        "Mic coverage",
        "For each spot, which mic would pick it up best, based on distance and where each mic points (its pickup pattern). The colour is that mic's section colour. Strong colour means one mic clearly wins; pale means two or more mics hear that spot about equally. Pale areas between sections are where the same players end up in two mics and can cause comb filtering when mixed. Empty-looking areas far from every mic aren't covered well by any mic.",
      ],
      [
        "delay",
        "Timing smear",
        "The gap in milliseconds between the first and the last section's sound reaching each spot. Under about 20 ms the band sounds together; above about 50 ms you hear the far sections arrive late, like an echo. Useful for where the director and the main mics should be.",
      ],
    ];
  $("infoBox").innerHTML =
    `<div class="mmHead"><h2 class="f1">What the heatmaps show</h2><button data-infoclose aria-label="Close">✕</button></div>` +
    H.map(
      ([k, t, d]) =>
        `<div style="margin:10px 0;padding:8px 10px;border-radius:4px;${k === cur ? "background:var(--field);border-left:3px solid var(--red)" : ""}"><b>${t}</b>${k === cur ? ' <span class="badge">showing now</span>' : ""}<p class="m" style="margin:4px 0 0">${d}</p></div>`,
    ).join("") +
    `<p class="m">All levels are estimates with everyone at fortissimo, measured at the height set next to the heatmap.</p>`;
  $("infoModal").hidden = false;
  $("infoBox").querySelector("[data-infoclose]").focus();
}
document.addEventListener("click", (e) => {
  if (e.target.id === "infoModal" || e.target.closest("[data-infoclose]")) $("infoModal").hidden = true;
});

/* ---------- draw a custom section outline ---------- */
let drG = null,
  drPts = [],
  drShape = null;
function rdp(P, eps) {
  if (P.length < 3) return P;
  let dmax = 0,
    idx = 0;
  const [a, b] = [P[0], P[P.length - 1]];
  for (let i = 1; i < P.length - 1; i++) {
    const d =
      Math.abs((b[1] - a[1]) * P[i][0] - (b[0] - a[0]) * P[i][1] + b[0] * a[1] - b[1] * a[0]) /
      (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
    if (d > dmax) {
      dmax = d;
      idx = i;
    }
  }
  if (dmax > eps) {
    return rdp(P.slice(0, idx + 1), eps)
      .slice(0, -1)
      .concat(rdp(P.slice(idx), eps));
  }
  return [a, b];
}
function chaikin(P, n) {
  for (let k = 0; k < n; k++) {
    const Q = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[i],
        b = P[(i + 1) % P.length];
      Q.push(
        [a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25],
        [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75],
      );
    }
    P = Q;
  }
  return P;
}
function cleanPts(P) {
  if (!$("drClean").checked) {
    const out = [];
    for (const q of P)
      if (!out.length || Math.hypot(q[0] - out[out.length - 1][0], q[1] - out[out.length - 1][1]) > 3) out.push(q);
    return out;
  }
  const xs = P.map((q) => q[0]),
    ys = P.map((q) => q[1]),
    diag = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  let Q = rdp(P.concat([P[0]]), diag * 0.035).slice(0, -1);
  if (Q.length < 3) Q = P;
  return chaikin(Q, 3);
}
function drawCanvas() {
  const c = $("drCanvas"),
    x = c.getContext("2d"),
    css = getComputedStyle(document.documentElement);
  x.clearRect(0, 0, c.width, c.height);
  x.fillStyle = css.getPropertyValue("--mute");
  x.font = "13px sans-serif";
  x.textAlign = "center";
  x.fillText("▲ toward the director", c.width / 2, 18);
  const draw_ = (P, close, col, w) => {
    if (P.length < 2) return;
    x.beginPath();
    x.moveTo(P[0][0], P[0][1]);
    for (const q of P.slice(1)) x.lineTo(q[0], q[1]);
    if (close) x.closePath();
    x.strokeStyle = col;
    x.lineWidth = w;
    x.stroke();
  };
  draw_(drPts, false, css.getPropertyValue("--line2"), 2);
  if (drShape) {
    x.fillStyle = "rgba(75,63,176,.12)";
    x.beginPath();
    x.moveTo(drShape[0][0], drShape[0][1]);
    for (const q of drShape.slice(1)) x.lineTo(q[0], q[1]);
    x.closePath();
    x.fill();
    draw_(drShape, true, "#4b3fb0", 2);
  }
}
function openDraw(G) {
  drG = G;
  drPts = [];
  drShape = null;
  $("drErr").textContent = "";
  $("drawModal").hidden = false;
  drawCanvas();
}
(function () {
  const c = $("drCanvas");
  let down = false;
  const pt = (e) => {
    const r = c.getBoundingClientRect();
    return [((e.clientX - r.left) * c.width) / r.width, ((e.clientY - r.top) * c.height) / r.height];
  };
  c.onpointerdown = (e) => {
    down = true;
    c.setPointerCapture(e.pointerId);
    drPts = [pt(e)];
    drShape = null;
    drawCanvas();
  };
  c.onpointermove = (e) => {
    if (!down) return;
    drPts.push(pt(e));
    drawCanvas();
  };
  c.onpointerup = () => {
    down = false;
    if (drPts.length > 8) {
      drShape = cleanPts(drPts);
      drawCanvas();
    }
  };
  $("drClean").onchange = () => {
    if (drPts.length > 8) {
      drShape = cleanPts(drPts);
      drawCanvas();
    }
  };
  $("drClear").onclick = () => {
    drPts = [];
    drShape = null;
    drawCanvas();
  };
  document.querySelectorAll("[data-drclose]").forEach(
    (b) =>
      (b.onclick = () => {
        $("drawModal").hidden = true;
      }),
  );
  $("drUse").onclick = () => {
    if (!drShape || drShape.length < 3) {
      $("drErr").textContent = "Draw an outline first: press, trace all the way round, and let go.";
      return;
    }
    let a = 0,
      cx = 0,
      cy = 0;
    const P = drShape;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const f = P[j][0] * P[i][1] - P[i][0] * P[j][1];
      a += f;
      cx += (P[j][0] + P[i][0]) * f;
      cy += (P[j][1] + P[i][1]) * f;
    }
    a /= 2;
    if (Math.abs(a) < 200) {
      $("drErr").textContent = "That outline is too small or flat. Draw a bigger, closed shape.";
      return;
    }
    cx /= 6 * a;
    cy /= 6 * a;
    const sc = Math.sqrt(Math.PI / Math.abs(a));
    const poly = P.map(([x, y]) => [+(-(y - cy) * sc).toFixed(3), +((x - cx) * sc).toFixed(3)]);
    const G = drG,
      k0 = shapeOf(G).xmax * scaleK(G);
    G.shape = "custom";
    G.poly = poly;
    const k1 = shapeOf(G).xmax * scaleK(G);
    for (const m of st.mics)
      if (m.g === G.k) {
        const L = Math.hypot(m.dv, m.du) || 1,
          nl = Math.max(2, L - k0 + k1);
        m.dv *= nl / L;
        m.du *= nl / L;
      }
    $("drawModal").hidden = true;
    heatDirty = true;
    draw();
    status(`${G.l} now uses your drawn outline.`);
  };
})();

/* ---------- console: errors, warnings and info about the layout ---------- */
const CON_CATS = {
  overlap: "Overlapping sections",
  obstruct: "Gear in the way",
  cables: "Cables",
  routing: "Snakes and inputs",
  phase: "3:1 / phasing",
  overload: "Mic overload",
  inventory: "Inventory",
  sight: "Sightlines",
};
let conHide = new Set(store.getJSON("rt-fh-conhide", [], "console filters")),
  conMsgs = [];
function buildConsole() {
  const M = [],
    add = (cat, lv, text, sel_) => M.push({ cat, lv, text, sel: sel_ });
  const gs = st.groups;
  for (let i = 0; i < gs.length; i++)
    for (let j = 0; j < gs.length; j++) {
      if (i === j) continue;
      const A = gs[i],
        B = gs[j];
      if (dist(A, B) > 3.2 * (scaleK(A) + scaleK(B)) + 4) continue;
      const fr = frame(B),
        k = scaleK(B),
        f = shapeOf(B).f;
      let n = 0;
      for (const q of people(A)) {
        const x = (q.v - B.v) * fr.f.v + (q.u - B.u) * fr.f.u,
          y = (q.v - B.v) * fr.s.v + (q.u - B.u) * fr.s.u;
        if (f(x / k, y / k)) n++;
      }
      if (n)
        add("overlap", "Warning", `${n} player${n === 1 ? "" : "s"} of ${esc(A.l)} stand on top of ${esc(B.l)}.`, {
          t: "g",
          k: A.k,
        });
    }
  for (const G of gs) {
    const n = people(G).filter((q) => Math.hypot(q.v - DIR.v, q.u - DIR.u) < 4).length;
    if (n)
      add("overlap", "Warning", `${n} player${n === 1 ? "" : "s"} of ${esc(G.l)} stand where the director is.`, {
        t: "g",
        k: G.k,
      });
  }
  const hit = (p, label, sel_) => {
    const G = inGroup(p, 0);
    if (G) add("obstruct", "Warning", `${label} sits among the players of ${esc(G.l)}.`, sel_);
  };
  hit(st.desk, "The desk", { t: "d", k: "desk" });
  for (const id in st.boxes) if (st.boxes[id].on) hit(st.boxes[id], `The ${esc(st.boxes[id].name)}`, { t: "b", k: id });
  for (const m of st.mics) {
    const G = inGroup(micPos(m), 0);
    if (G && G.k !== m.g)
      add("obstruct", "Info", `${esc(micName(m))}: its stand is inside ${esc(G.l)}.`, { t: "m", k: m.id });
  }
  for (const w of res.warn) {
    const cat = /XLR|no XLR/.test(w) ? "cables" : "routing";
    add(cat, cat === "cables" ? "Error" : "Warning", w, null);
  }
  for (const r of phaseList)
    add(
      "phase",
      r.sev === "High" ? "Warning" : "Info",
      `${micName(r.a)} and ${micName(r.b)} both hear ${r.G.l} within ${r.diff.toFixed(1)} dB (${r.ms.toFixed(1)} ms apart): comb-filter risk when mixed.`,
      { t: "m", k: r.a.id },
    );
  for (const m of st.mics) {
    const r = dbFor(m.model);
    if (!r || !r.x) continue;
    const lim = r.xp || r.x,
      peak = dB(soundAt({ ...micPos(m), z: micZ(m) }).tot) + 12;
    if (peak > lim)
      add(
        "overload",
        "Error",
        `${esc(micName(m))}: peaks around ${peak.toFixed(0)} dB SPL, over its ${lim} dB limit${r.xp ? " even with the pad" : ""}. Move it back or use a dynamic.`,
        { t: "m", k: m.id },
      );
    else if (peak > lim - 6)
      add(
        "overload",
        "Info",
        `${esc(micName(m))}: peaks around ${peak.toFixed(0)} dB SPL, within 6 dB of its ${lim} dB limit${r.xp ? " (with pad)" : ""}.`,
        { t: "m", k: m.id },
      );
  }
  for (const k in MODELS) {
    const u = used(k);
    if (u > MODELS[k].n)
      add(
        "inventory",
        u > avail(k) ? "Error" : "Info",
        u > avail(k)
          ? `${k}: ${u} in use but only ${avail(k)} owned or added.`
          : `${k}: uses ${u - MODELS[k].n} you plan to buy.`,
        null,
      );
  }
  const I = inv(),
    need = {
      boom: st.mics.filter((m) => m.h > 4 && m.h <= 7).length,
      tall: st.mics.filter((m) => m.h > 7).length,
      short: st.mics.filter((m) => m.h <= 4).length,
    };
  for (const t in need) {
    const own = I.standOwned[t];
    if (own != null && need[t] > own + (I.standAdd[t] || 0))
      add(
        "inventory",
        "Warning",
        `Short ${need[t] - own - (I.standAdd[t] || 0)} ${t} stand${need[t] - own === 1 ? "" : "s"}.`,
        null,
      );
  }
  if ($("tSight").checked && sightRes && sightRes.blocked.length)
    add("sight", "Info", `${sightRes.blocked.length} players can't see the director.`, null);
  conMsgs = M;
  renderConsole();
}
/* One listener for the console filter chips, instead of re-attaching one per chip on every render. */
$("conBody").addEventListener("change", (e) => {
  const c = e.target.closest("[data-ccat]");
  if (!c) return;
  c.checked ? conHide.delete(c.dataset.ccat) : conHide.add(c.dataset.ccat);
  store.setJSON("rt-fh-conhide", [...conHide]);
  renderConsole();
});
function renderConsole() {
  const by = {};
  for (const m of conMsgs) by[m.cat] = (by[m.cat] || 0) + 1;
  const vis = conMsgs.filter((m) => !conHide.has(m.cat)),
    order = { Error: 0, Warning: 1, Info: 2 };
  vis.sort((a, b) => order[a.lv] - order[b.lv]);
  const errs = vis.filter((m) => m.lv !== "Info").length;
  $("conBadge").textContent = errs ? `⚠ ${errs}` : "✓";
  $("conBadge").style.color = errs ? "var(--warn)" : "var(--ok)";
  $("conBody").innerHTML =
    `<div class="row" style="flex-wrap:wrap">${Object.keys(CON_CATS)
      .map(
        (c) =>
          `<label class="chip" style="${conHide.has(c) ? "opacity:.5" : ""}"><input type="checkbox" data-ccat="${c}" ${conHide.has(c) ? "" : "checked"} style="margin:0 4px 0 0">${CON_CATS[c]} (${by[c] || 0})</label>`,
      )
      .join("")}</div>` +
    (vis.length
      ? vis
          .map(
            (m, i) =>
              `<div class="conRow" data-ci="${conMsgs.indexOf(m)}"><span class="lv ${m.lv === "Info" ? "info" : "warn"}">${m.lv}</span><span>${esc(m.text)}</span></div>`,
          )
          .join("")
      : `<p class="ok">Nothing to report${conHide.size ? " (some categories are hidden)" : ""}.</p>`);

  $("conBody")
    .querySelectorAll("[data-ci]")
    .forEach(
      (r) =>
        (r.onclick = () => {
          const m = conMsgs[+r.dataset.ci];
          if (m.sel) {
            sel = m.sel;
            draw(true);
          }
        }),
    );
}
["spStyle", "spColor", "mtStyle", "mtColor", "cmpDiff"].forEach((i) =>
  $(i).addEventListener("change", () => draw(true)),
);
/* ---------- backgrounds: field / stage / floor grid, each with its own scene ---------- */
const SCENE_KEYS = ["groups", "mics", "boxes", "desk", "meters", "risers", "dir"];
const NS_KIND = {
  cl: ["Clarinets", 10],
  fl: ["Flutes", 10],
  pic: ["Piccolos", 10],
  sax: ["Alto saxes", 11],
  tsx: ["Tenor saxes", 13],
  ssx: ["Soprano saxes", 10],
  bsx: ["Bari saxes", 16],
  tpt: ["Trumpets", 12],
  mel: ["Mellophones", 13],
  bar: ["Baritones", 16],
  tb: ["Trombones", 24],
  sou: ["Sousaphones / tubas", 26],
  pno: ["Piano", 24],
  bas: ["Bass", 16],
  gtr: ["Guitar amp", 12],
  vox: ["Vocalist", 8],
  kck: ["Kick drum", 12],
  snr: ["Snare", 12],
  tom: ["Toms", 16],
  hh: ["Hi-hat", 10],
  qd: ["Quads / toms", 24],
  bd: ["Bass drums", 26],
  cym: ["Cymbals", 20],
};
function stageGroup(k, l, kind, v, u, a = 12, shape = "block") {
  return { k, l, kind, n: 1, a, v, u, shape, rot: 0, lock: null };
}
function presetMic(G, model, h, label, lat = 0) {
  if (!G || !MODELS[model]) return;
  st.mics.push({
    id: "m" + st.nextId++,
    g: G.k,
    model,
    aim: "auto",
    h,
    route: "auto",
    pat: MODELS[model].pat === "xy" ? "cardioid" : MODELS[model].pat,
    label,
    ...defaultMicOffset(G, lat),
  });
}
function clearStagePreset() {
  if ((st.bg && st.bg.type) !== "stage") switchBg("stage");
  st.groups = [];
  st.mics = [];
  st.risers = [];
  st.meters = [];
  const B = bgDims();
  st.boxes = clone(BOXES0);
  st.boxes.b24.v = B.front + B.d * 0.35;
  st.boxes.b24.u = B.w / 2;
  st.boxes.b20.on = false;
  st.boxes.eth.on = false;
  st.desk = { v: 4, u: B.w / 2 + 8 };
  return B;
}
function addKit(B, style, at = { v: B.front + B.d * 0.62, u: B.w / 2 }) {
  const loud = style === "rock",
    v = at.v,
    u = at.u,
    gs = [];
  const add = (k, l, kind, dv, du, a) => {
    const G = stageGroup(k, l, kind, v + dv, u + du, a);
    st.groups.push(G);
    gs.push(G);
    return G;
  };
  const kick = add("kitKick", "Kick drum", "kck", -2, 0, 12),
    snare = add("kitSnare", "Snare", "snr", -3, -3, 12),
    toms = add("kitToms", "Toms", "tom", 1, -1, 16),
    hat = add("kitHat", "Hi-hat", "hh", -2, -6, 10),
    cym = add("kitCym", "Cymbals", "cym", 2, 4, 14);
  if (loud) {
    [kick, snare, toms, cym].forEach((G) => (G.a += 3));
    kick.l = "Kick drum (rock)";
    cym.l = "Cymbals (rock)";
  }
  presetMic(kick, "Behringer KM1200", 2.2, "inside/port");
  presetMic(snare, "Shure SM57", 3, "top");
  presetMic(toms, "Behringer TM1200", 3, "toms");
  presetMic(hat, "Behringer C2", 5, "hat");
  presetMic(cym, "Behringer C2", 7, "overhead", -0.35);
  presetMic(cym, "Behringer C2", 7, "overhead", 0.35);
  return gs;
}
function applyPreset(which) {
  const B = clearStagePreset(),
    mid = B.w / 2;
  if (which === "rock") {
    // Rock band: kit at the back centre, bass amp stage left, lead and rhythm guitar amps stage right, singer up front.
    addKit(B, "rock", { v: B.front + B.d * 0.66, u: mid });
    const f = B.front,
      d = B.d,
      g = (k, l, kind, v, u, a) => {
        const G = stageGroup(k, l, kind, v, u, a);
        st.groups.push(G);
        return G;
      },
      vocal = g("rVox", "Lead vocalist", "vox", f + 4, mid, 8),
      bass = g("rBass", "Bass guitar amp", "bas", f + d * 0.5, mid - 11, 16),
      lead = g("rLead", "Lead guitar amp", "gtr", f + d * 0.5, mid + 9, 12),
      rhythm = g("rRhy", "Rhythm guitar amp", "gtr", f + d * 0.5, mid + 15, 12);
    st.risers = [{ id: "r" + st.nextId++, v: f + d * 0.66, u: mid, w: 12, d: 10, h: 1.5 }];
    presetMic(vocal, "Shure Beta 58A", 5, "vocal");
    presetMic(bass, "Shure Beta 52A", 3, "cab");
    presetMic(lead, "Sennheiser e609", 3, "amp");
    presetMic(rhythm, "Shure SM57", 3, "amp");
    sel = { t: "g", k: "rVox" };
    heatDirty = true;
    draw(true);
    status("Rock band loaded on the stage: drum kit, bass, lead and rhythm guitar amps and a lead vocalist. Sound > Frequencies in this layout shows where each one sits.");
    return;
  }
  if (which === "kit-jazz" || which === "kit-rock") {
    addKit(B, which === "kit-rock" ? "rock" : "jazz");
    sel = { t: "g", k: "kitSnare" };
    heatDirty = true;
    draw(true);
    status(
      `${which === "kit-rock" ? "Rock" : "Jazz"} drum kit loaded on the stage with suggested close mics and overheads.`,
    );
    return;
  }
  const add = (k, l, kind, v, u, a = 12) => {
      const G = stageGroup(k, l, kind, v, u, a);
      st.groups.push(G);
      return G;
    },
    f = B.front,
    d = B.d;
  const vocal = add("jVox", "Vocalist", "vox", f + 4, mid, 8),
    piano = add("jPiano", "Piano", "pno", f + d * 0.48, 7, 24),
    bass = add("jBass", "Bass", "bas", f + d * 0.54, 14, 16),
    guitar = add("jGuitar", "Guitar amp", "gtr", f + d * 0.54, 32, 12);
  const sop = add("jSop", "Soprano sax", "ssx", f + d * 0.78, 7, 10),
    alto = add("jAlto", "Alto saxes", "sax", f + d * 0.78, 14, 14),
    tenor = add("jTen", "Tenor sax", "tsx", f + d * 0.78, 22, 14),
    bari = add("jBari", "Bari sax", "bsx", f + d * 0.78, 29, 16),
    trumpets = add("jTpt", "Trumpets", "tpt", f + d * 0.53, 22, 18),
    trombones = add("jTb", "Trombones", "tb", f + d * 0.53, 29, 20);
  addKit(B, "jazz", { v: f + d * 0.68, u: mid });
  st.risers = [{ id: "r" + st.nextId++, v: f + d * 0.76, u: 18, w: 28, d: 5, h: 1 }];
  presetMic(vocal, "Shure Beta 58A", 5, "vocal");
  presetMic(piano, "Rode NT4 (XY stereo)", 5, "inside lid");
  presetMic(bass, "Shure Beta 52A", 3, "cab/bridge");
  presetMic(guitar, "Sennheiser e609", 3, "amp");
  presetMic(sop, "Sennheiser e614", 5, "bell");
  presetMic(alto, "Sennheiser e614", 5, "section");
  presetMic(tenor, "Sennheiser e609", 4, "bell");
  presetMic(bari, "Sennheiser e906", 4, "bell");
  presetMic(trumpets, "Shure SM57", 6, "section");
  presetMic(trombones, "Shure SM57", 5, "section");
  sel = { t: "g", k: "jVox" };
  heatDirty = true;
  draw(true);
  status("Jazz ensemble loaded on the stage: rhythm section, split saxes, brass, vocalist and suggested mics.");
}
function applyFieldPreset(which) {
  if (which !== "hancock-lineup") return;
  // Preserve the full scene before changing a single position. A field preset only changes
  // where the existing sections and their existing microphones sit; it never changes counts.
  const before = saveLayoutSnapshot("Before Hancock photo lineup");
  if ((st.bg && st.bg.type) !== "field") switchBg("field");
  // The photograph is viewed from the home stands: director at the front on the 50,
  // a broad close woodwind line, brass spreading behind and to either side, center
  // percussion, and sousaphones as the rear arc. Outer player rows snap to 5-yard
  // lines (15 ft); the center compresses to 10 ft rows. Coordinates are field feet.
  const P = {
    cl2: [145, 30, "block", 15],
    cl1: [145, 60, "block", 10],
    pic: [137, 165, "block", 15],
    fl: [143, 135, "block", 15],
    alt: [132, 90, "block", 10],
    ten: [127, 75, "block", 10],
    t3: [115, 15, "block", 15],
    t2: [118, 45, "block", 15],
    t1: [116, 135, "block", 15],
    mel: [113, 165, "block", 15],
    tba: [94, 30, "block", 15],
    tbb: [95, 150, "block", 15],
    bar: [101, 120, "block", 10],
    cym: [86, 45, "bunch", 15],
    snr: [116, 90, "block", 10],
    qd: [105, 90, "block", 10],
    bd: [93, 90, "block", 10],
    sou: [72, 90, "arc", 10],
  };
  const missing = st.groups.filter((g) => !P[g.k]);
  if (missing.length)
    throw Error(
      "This preset does not know where to place: " + missing.map((g) => g.l).join(", ") + ". Nothing was changed.",
    );
  for (const g of st.groups) {
    const [v, u, shape, rowStep] = P[g.k];
    g.v = v;
    g.u = u;
    g.shape = shape;
    g.rowStep = rowStep;
    g.rot = 0;
  }
  // Leave the selected models, stand heights and settings intact, while placing each attached
  // microphone at an appropriate new front-of-section starting point.
  for (const m of st.mics)
    if (m.g) {
      const G = gOf(m.g);
      if (G) Object.assign(m, defaultMicOffset(G));
    }
  st.desk = { ...st.desk, v: 172, u: 88 };
  if (st.boxes.b24) Object.assign(st.boxes.b24, { v: 120, u: 88, on: true });
  if (st.boxes.b20) Object.assign(st.boxes.b20, { v: 120, u: 42, on: true });
  if (st.boxes.eth) Object.assign(st.boxes.eth, { v: 120, u: 134, on: true });
  sel = { t: "g", k: "snr" };
  heatDirty = true;
  applyBg();
  zoomFit();
  draw(true);
  refreshLayoutSnapshots(before.id);
  status("Hancock photo lineup loaded. Section counts and mic choices are unchanged; your previous layout was saved.");
}
function starterScene(type) {
  const B = (() => {
      const keep = st.bg;
      st.bg = { type };
      const d = bgDims();
      st.bg = keep;
      return d;
    })(),
    mid = B.type === "stage" ? { v: B.front + B.d / 2, u: B.w / 2 } : { v: B.d / 2, u: B.w / 2 };
  const boxes = clone(BOXES0);
  boxes.b24.v = mid.v + 3;
  boxes.b24.u = mid.u;
  boxes.b20.on = false;
  boxes.eth.on = false;
  boxes.b20.v = boxes.eth.v = mid.v;
  boxes.b20.u = mid.u - 6;
  boxes.eth.u = mid.u + 6;
  return {
    groups: [],
    mics: [],
    boxes,
    desk: B.type === "stage" ? { v: 4, u: B.w / 2 + 8 } : { v: 2, u: B.w - 6 },
    meters: [],
    risers: [],
    dir: { ...B.dir },
  };
}
function switchBg(type) {
  const cur = (st.bg && st.bg.type) || "field";
  if (cur === type) return;
  st.scenes = st.scenes || {};
  st.scenes[cur] = {};
  for (const k of SCENE_KEYS) st.scenes[cur][k] = st[k];
  const nx = st.scenes[type] || starterScene(type);
  st.bg = { type };
  for (const k of SCENE_KEYS) st[k] = nx[k] !== undefined ? nx[k] : starterScene(type)[k];
  st.risers = st.risers || [];
  sel = null;
  // A stage opens with the audience at the bottom (Tom, backlog: "consider defaulting stage to audience-at-bottom");
  // a rotation you already chose for this layout's stage is kept.
  if (type === "stage" && !(st.rots && st.rots.stage !== undefined)) (st.rots = st.rots || {}).stage = 90;
  applyBg();
  zoomFit();
  draw();
  status(
    type === "field"
      ? "Back on the football field."
      : `${type === "stage" ? "Stage" : "Floor grid"}: ${st.groups.length ? "your saved layout for it." : "empty. Add sections and risers from the Layout window."}`,
  );
}
function renderBgUI() {
  const t = (st.bg && st.bg.type) || "field";
  if ($("bgType").value !== t) $("bgType").value = t;
  $("hashSel").disabled = t !== "field";
  const B = bgDims(),
    box = $("bgSize");
  const want = t === "field" ? "" : `${t}:${B.w}:${B.d}:${B.step || ""}`;
  if (box.dataset.k === want) return;
  box.dataset.k = want;
  box.innerHTML =
    t === "field"
      ? '<span class="m">160 × 360 ft field with yard lines and hashes.</span>'
      : `<label class="m">Width <input id="bgW" type="number" min="10" max="300" value="${B.w}" class="w60"> ft</label><label class="m">Depth <input id="bgD" type="number" min="10" max="200" value="${B.d}" class="w60"> ft</label>${t === "grid" ? `<label class="m">Lines every <select id="bgStep">${[1, 2, 5, 10].map((x) => `<option ${x === B.step ? "selected" : ""}>${x}</option>`).join("")}</select> ft</label>` : ""}`;
  if (t !== "field") {
    const up = () => {
      const w = +$("bgW").value,
        d = +$("bgD").value;
      if (!(w >= 10 && w <= 300 && d >= 10 && d <= 200)) {
        $("bgErr").textContent = "Width 10–300 ft, depth 10–200 ft.";
        return;
      }
      $("bgErr").textContent = "";
      st.bgs = st.bgs || {};
      st.bgs[t] = Object.assign(st.bgs[t] || {}, { w, d }, t === "grid" ? { step: +$("bgStep").value } : {});
      box.dataset.k = "";
      applyBg();
      draw();
    };
    $("bgW").onchange = up;
    $("bgD").onchange = up;
    if ($("bgStep")) $("bgStep").onchange = up;
  }
}
$("bgType").onchange = () => switchBg($("bgType").value);
$("nsKind").innerHTML = Object.entries(NS_KIND)
  .map(([k, [l]]) => `<option value="${k}">${l}</option>`)
  .join("");
$("nsAdd").onclick = () => {
  const kind = $("nsKind").value,
    n = +$("nsN").value,
    name = $("nsName").value.trim() || NS_KIND[kind][0];
  if (!(n >= 1 && n <= 200 && Number.isInteger(n))) {
    $("nsErr").textContent = "Players: a whole number from 1 to 200.";
    return;
  }
  $("nsErr").textContent = "";
  const B = bgDims(),
    c =
      B.type === "field"
        ? { v: 110, u: 88 }
        : B.type === "stage"
          ? { v: B.front + B.d / 2, u: B.w / 2 }
          : { v: B.d / 2, u: B.w / 2 },
    G = {
      k: "s" + st.nextId++,
      l: name,
      kind,
      n,
      a: NS_KIND[kind][1],
      v: c.v,
      u: c.u,
      shape: n <= 8 ? "block" : "arc",
      rot: 0,
      lock: null,
    };
  st.groups.push(G);
  sel = { t: "g", k: G.k };
  heatDirty = true;
  draw();
  status(`${name} added in the middle. Drag it into place.`);
};
$("bAddRiser").onclick = () => {
  const B = bgDims(),
    c =
      B.type === "stage"
        ? { v: B.front + B.d * 0.7, u: B.w / 2 }
        : B.type === "grid"
          ? { v: B.d * 0.7, u: B.w / 2 }
          : { v: 100, u: 88 };
  st.risers = st.risers || [];
  const r = { id: "r" + st.nextId++, v: c.v, u: c.u, w: 16, d: 6, h: 1.5 };
  st.risers.push(r);
  sel = { t: "r", k: r.id };
  heatDirty = true;
  draw();
  status("Riser added. Drag it into place; set its size and height in the Selected item panel.");
};
document.querySelectorAll("[data-preset]").forEach(
  (b) =>
    (b.onclick = () => {
      closeMenus();
      applyPreset(b.dataset.preset);
    }),
);
document.querySelectorAll("[data-fieldpreset]").forEach(
  (b) =>
    (b.onclick = () => {
      closeMenus();
      try {
        applyFieldPreset(b.dataset.fieldpreset);
      } catch (e) {
        layoutSaveMessage("Could not load field preset: " + e.message, true);
      }
    }),
);
function renderExtras(light) {
  renderLists();
  renderInvTabs();
  renderDb();
  renderSpecCmp();
  renderBgUI();
  if (!light) {
    drawSight();
    drawPhase();
    drawContours();
    buildConsole();
  }
  syncMenus();
}
function deleteSelected() {
  if (!sel) {
    status("Nothing selected.");
    return;
  }
  if (sel.t === "e") {
    st.meters = st.meters.filter((x) => x.id !== sel.k);
    sel = null;
    draw(true);
    status("Meter deleted.");
    return;
  }
  if (sel.t === "m") {
    const m = st.mics.find((x) => x.id === sel.k);
    st.mics = st.mics.filter((x) => x.id !== sel.k);
    sel = null;
    draw(true);
    status(`${m ? m.model : "Mic"} removed and back in the locker.`);
    return;
  }
  status("Sections, snake boxes and the desk can't be deleted. Hide a snake box from the Cables window instead.");
}
document.addEventListener("keydown", (e) => {
  if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === "z" || e.key === "Z" || e.key === "y")) {
    e.preventDefault();
    e.key === "y" || e.shiftKey ? redo() : undo();
    return;
  }
  if (e.key === "Delete" || e.key === "Backspace") {
    if (!$("v3").hidden) return;
    e.preventDefault();
    deleteSelected();
  } else if (e.key === "Escape") {
    closeMenus();
    if (sel) {
      sel = null;
      draw(true);
    }
  }
});

/* ---------- docking windows ---------- */
const WINS = {
  view: "View",
  layout: "Layout",
  mics: "Mics",
  cables: "Cables",
  sound: "Sound",
  inspector: "Selected item",
  inventory: "Summary",
  gear: "Gear",
  micdb: "Mic database",
  guideView: "Guide view",
  stageplot: "Stage plot",
  phasecalc: "Phase calculator",
  room: "Room helper",
  freqchart: "Frequency chart",
  reports: "Reports",
  playback: "Playback",
  waterfall: "Waterfall",
  dbchart: "Loudness chart",
  console: "Console",
  roadmap: "Future improvements",
  guide: "Mic technique guide",
  file: "Layout file",
  help: "Help",
};
const DOCK0 = () => ({
  left: [["view", "layout", "mics", "cables", "sound"]],
  right: [["inspector", "inventory"]],
  bottom: [["playback", "waterfall", "console", "dbchart", "reports"]],
  center: [],
  floats: [],
  hidden: ["file", "help"],
  auto: { left: [], right: [], bottom: [] },
  active: { center: "canvas" },
  size: { left: 310, right: 330, bottom: 210 },
  last: {},
});
let DK;
const WC = {};
function saveDock() {
  store.setJSON(toolDockKey(), DK);
}
/* Drop windows that no longer exist (e.g. Preferences, now the Options dialog) from a saved layout. */
function dropRetiredWindows(o) {
  const ok = (id) => id in WINS;
  for (const sd of ["left", "right", "bottom"]) o[sd] = o[sd].map((g) => g.filter(ok)).filter((g) => g.length);
  o.center = o.center.filter(ok);
  o.floats = o.floats.filter((f) => ok(f.id));
  o.hidden = o.hidden.filter(ok);
  for (const sd in o.auto) o.auto[sd] = o.auto[sd].filter(ok);
  return o;
}
function loadDock() {
  if (TOOL !== "planner") return loadToolDock(TOOL); // js/tools.js
  try {
    const o = store.getJSON("rt-fh-dock-v1", null, "window layout");
    if (o && o.left && o.size) {
      o.center = o.center || [];
      dropRetiredWindows(o);
      o.active = o.active || {};
      o.active.center = o.active.center || "canvas";
      const seen = new Set([
        ...o.left.flat(),
        ...o.right.flat(),
        ...o.bottom.flat(),
        ...o.center,
        ...o.floats.map((f) => f.id),
        ...o.hidden,
        ...o.auto.left,
        ...o.auto.right,
        ...o.auto.bottom,
      ]);
      const grp = ["left", "right", "bottom"].map((sd) => o[sd].find((g) => g.includes("inventory"))).find(Boolean);
      if (!o.inspMerged2) {
        o.inspMerged2 = 1;
        for (const sd in o.auto) o.auto[sd] = o.auto[sd].filter((x) => x !== "inspector");
        const ig = ["left", "right", "bottom"].map((sd) => o[sd].find((g) => g.includes("inventory"))).find(Boolean);
        if (ig && !ig.includes("inspector") && !o.floats.some((f) => f.id === "inspector")) {
          for (const sd of ["left", "right", "bottom"])
            o[sd] = o[sd].map((g) => g.filter((x) => x !== "inspector")).filter((g) => g.length);
          o.hidden = o.hidden.filter((x) => x !== "inspector");
          ig.unshift("inspector");
        }
      }
      for (const k in WINS)
        if (!seen.has(k)) {
          if ((k === "console" || k === "waterfall") && o.bottom[0]) {
            o.bottom[0].splice(1, 0, k);
            continue;
          }
          if (k === "reports" && o.bottom[0]) {
            o.bottom[0].push(k); // replaces the separate Stats, Channel list and Phase risks windows
            continue;
          }
          if (k === "view" && o.left[0]) {
            o.left[0].unshift(k); // new in 2026-11: the View panel opens first in the left dock
            o.active.left0 = k;
            continue;
          }
          if (k.startsWith("inv") && grp) grp.push(k);
          else if ((k === "playback" || k === "dbchart") && o.bottom[0]) o.bottom[0].splice(1, 0, k);
          else if (k === "playback") o.bottom.push([k]);
          else o.hidden.push(k);
        }
      return o;
    }
  } catch (e) {
    console.warn("Saved window layout ignored", e);
  }
  return DOCK0();
}
function whereIs(id) {
  if (DK.center.includes(id)) return { side: "center", gi: 0 };
  for (const side of ["left", "right", "bottom"]) {
    const gi = DK[side].findIndex((g) => g.includes(id));
    if (gi >= 0) return { side, gi };
  }
  if (DK.floats.some((f) => f.id === id)) return { float: true };
  for (const side in DK.auto) if (DK.auto[side].includes(id)) return { auto: side };
  return { hidden: true };
}
function detach(id) {
  DK.center = DK.center.filter((x) => x !== id);
  for (const side of ["left", "right", "bottom"]) {
    DK[side] = DK[side].map((g) => g.filter((x) => x !== id)).filter((g) => g.length);
  }
  DK.floats = DK.floats.filter((f) => f.id !== id);
  for (const side in DK.auto) DK.auto[side] = DK.auto[side].filter((x) => x !== id);
  DK.hidden = DK.hidden.filter((x) => x !== id);
}
function showWin(id) {
  if (toolOf(id) !== TOOL) switchTool(toolOf(id)); // a window opens in the tool that owns it
  const w = whereIs(id);
  if (w.hidden) {
    const last = DK.last[id] || { side: "right" };
    if (last.float) DK.floats.push({ id, x: 120, y: 60, w: 360, h: 320 });
    else if (last.side === "center") {
      DK.center.push(id);
      DK.active.center = id;
    } else {
      DK[last.side].push([id]);
    }
  } else if (w.auto) {
    openFly(id);
    return;
  }
  if (w.side !== undefined || w.hidden) {
    const loc = whereIs(id);
    if (loc.side === "center") DK.active.center = id;
    else if (loc.side) DK.active[loc.side + loc.gi] = id;
  }
  renderDock();
}
function hideWin(id) {
  const w = whereIs(id);
  DK.last[id] = w.side ? { side: w.side } : w.float ? { float: true } : w.auto ? { side: w.auto } : { side: "right" };
  detach(id);
  DK.hidden.push(id);
  renderDock();
}
function initDock() {
  document.querySelectorAll("#wins .wc").forEach((n) => (WC[n.dataset.win] = n));
  DK = fitDockToTool(loadDock()); // js/tools.js
  initRail();
  renderDock();
  bindSplits();
  bindMenus();
}
function header(ids, side, gi) {
  const h = document.createElement("div");
  h.className = "dh";
  const act = DK.active[side + gi] && ids.includes(DK.active[side + gi]) ? DK.active[side + gi] : ids[0];
  for (const id of ids) {
    const t = document.createElement("div");
    t.className = "dt" + (id === act ? " on" : "");
    t.textContent = WINS[id];
    t.title = "Drag to dock or float";
    t.onpointerdown = (e) =>
      startDrag(e, id, () => {
        DK.active[side + gi] = id;
        renderDock();
      });
    h.appendChild(t);
  }
  const sp = document.createElement("div");
  sp.className = "sp";
  sp.onpointerdown = (e) => startDrag(e, act);
  h.appendChild(sp);
  if (side === "right") {
    const collapse = document.createElement("button");
    collapse.className = "hb";
    collapse.title = "Collapse right dock to the edge";
    collapse.setAttribute("aria-label", "Collapse right dock");
    collapse.textContent = "≫";
    collapse.onclick = () => {
      for (const group of [...DK.right])
        for (const id of [...group]) {
          detach(id);
          if (!DK.auto.right.includes(id)) DK.auto.right.push(id);
        }
      renderDock();
    };
    h.appendChild(collapse);
  }
  const pin = document.createElement("button");
  pin.className = "hb";
  pin.title = "Unpin: collapse to the edge";
  pin.textContent = "📌";
  pin.onclick = () => {
    ids.forEach((id) => {
      detach(id);
      DK.auto[side].push(id);
    });
    renderDock();
  };
  h.appendChild(pin);
  const x = document.createElement("button");
  x.className = "hb";
  x.title = "Hide window";
  x.setAttribute("aria-label", "Hide " + WINS[act]);
  x.textContent = "✕";
  x.onclick = () => hideWin(act);
  h.appendChild(x);
  return { h, act };
}
function renderCenter() {
  const ids = [...(TOOL === "planner" ? ["canvas"] : []), ...DK.center],
    head = $("centerHead"),
    body = $("centerBody");
  let act = DK.active.center;
  if (!ids.includes(act)) act = DK.active.center = ids[0] || "canvas";
  head.innerHTML = "";
  for (const id of ids) {
    const t = document.createElement("div");
    t.className = "dt" + (id === act ? " on" : "");
    t.textContent = id === "canvas" ? "Canvas" : WINS[id];
    t.title = id === "canvas" ? "The permanent field canvas" : "Drag to dock or float";
    if (id === "canvas")
      t.onclick = () => {
        DK.active.center = "canvas";
        renderDock();
      };
    else
      t.onpointerdown = (e) =>
        startDrag(e, id, () => {
          DK.active.center = id;
          renderDock();
        });
    head.appendChild(t);
  }
  const sp = document.createElement("div");
  sp.className = "sp";
  if (act !== "canvas") sp.onpointerdown = (e) => startDrag(e, act);
  head.appendChild(sp);
  if (act !== "canvas") {
    const x = document.createElement("button");
    x.className = "hb";
    x.title = "Hide window";
    x.textContent = "✕";
    x.onclick = () => hideWin(act);
    head.appendChild(x);
  }
  const canvas = $("docCanvas");
  canvas.hidden = act !== "canvas";
  body.dataset.document = act !== "canvas" ? "1" : "0";
  if (act !== "canvas" && WC[act]) body.appendChild(WC[act]);
}
function renderDock() {
  Object.values(WC).forEach((n) => $("wins").appendChild(n));
  renderCenter();
  for (const [side, el_] of [
    ["left", $("dockL")],
    ["right", $("dockR")],
    ["bottom", $("dockB")],
  ]) {
    el_.innerHTML = "";
    DK[side].forEach((ids, gi) => {
      const g = document.createElement("div");
      g.className = "dg";
      g.dataset.side = side;
      g.dataset.gi = gi;
      const { h, act } = header(ids, side, gi);
      g.appendChild(h);
      const b = document.createElement("div");
      b.className = "db";
      b.appendChild(WC[act]);
      g.appendChild(b);
      el_.appendChild(g);
    });
    if (side === "bottom") {
      el_.style.height = DK[side].length ? DK.size.bottom + "px" : "";
      el_.style.flex = "none";
    } else {
      el_.style.width = DK[side].length ? DK.size[side] + "px" : "";
      el_.style.flex = "none";
    }
  }
  document.querySelectorAll(".split").forEach((sp) => sp.classList.toggle("hide", !DK[sp.dataset.side].length));
  $("floats").innerHTML = "";
  for (const f of DK.floats) {
    const w = document.createElement("div");
    w.className = "fw";
    Object.assign(w.style, { left: f.x + "px", top: f.y + "px", width: f.w + "px", height: f.h + "px" });
    const h = document.createElement("div");
    h.className = "dh";
    const t = document.createElement("div");
    t.className = "dt on";
    t.textContent = WINS[f.id];
    h.appendChild(t);
    const sp = document.createElement("div");
    sp.className = "sp";
    h.appendChild(sp);
    [t, sp].forEach((n) => (n.onpointerdown = (e) => startDrag(e, f.id, null, w)));
    const x = document.createElement("button");
    x.className = "hb";
    x.textContent = "✕";
    x.title = "Hide window";
    x.onclick = () => hideWin(f.id);
    h.appendChild(x);
    const b = document.createElement("div");
    b.className = "db";
    b.appendChild(WC[f.id]);
    w.append(h, b);
    new ResizeObserver(() => {
      f.w = w.offsetWidth;
      f.h = w.offsetHeight;
      saveDock();
    }).observe(w);
    $("floats").appendChild(w);
  }
  for (const [side, el_] of [
    ["left", $("autoL")],
    ["right", $("autoR")],
    ["bottom", $("autoB")],
  ]) {
    el_.innerHTML = "";
    for (const id of DK.auto[side]) {
      const t = document.createElement("div");
      t.className = "st";
      t.textContent = WINS[id];
      t.onmouseenter = () => openFly(id);
      t.onclick = () => openFly(id);
      el_.appendChild(t);
    }
  }
  closeFly();
  buildWinMenu();
  saveDock();
  window.dispatchEvent(new Event("resize"));
}
let flyId = null;
function openFly(id) {
  const side = Object.keys(DK.auto).find((s) => DK.auto[s].includes(id));
  if (!side) return;
  flyId = id;
  const f = $("flyout");
  f.hidden = false;
  f.innerHTML = "";
  const h = document.createElement("div");
  h.className = "dh";
  const t = document.createElement("div");
  t.className = "dt on";
  t.textContent = WINS[id];
  h.appendChild(t);
  const sp = document.createElement("div");
  sp.className = "sp";
  h.appendChild(sp);
  const pin = document.createElement("button");
  pin.className = "hb";
  pin.title = "Pin: dock it";
  pin.textContent = "📌";
  pin.onclick = () => {
    detach(id);
    DK[side].push([id]);
    flyId = null;
    renderDock();
  };
  h.appendChild(pin);
  const x = document.createElement("button");
  x.className = "hb";
  x.textContent = "✕";
  x.onclick = () => closeFly();
  h.appendChild(x);
  const b = document.createElement("div");
  b.className = "db";
  b.appendChild(WC[id]);
  f.append(h, b);
  const M = $("main").getBoundingClientRect();
  Object.assign(
    f.style,
    side === "left"
      ? { left: "22px", top: "0", bottom: "0", right: "", width: DK.size.left + "px", height: "" }
      : side === "right"
        ? { right: "22px", top: "0", bottom: "0", left: "", width: DK.size.right + "px", height: "" }
        : { left: "0", right: "0", bottom: "22px", top: "", height: DK.size.bottom + "px", width: "" },
  );
}
function closeFly() {
  const f = $("flyout");
  if (flyId && WC[flyId] && f.contains(WC[flyId])) $("wins").appendChild(WC[flyId]);
  f.hidden = true;
  f.innerHTML = "";
  flyId = null;
}
document.addEventListener("pointerdown", (e) => {
  if (flyId && !$("flyout").contains(e.target) && !e.target.closest(".st")) closeFly();
});
function startDrag(e, id, onClick, floatEl) {
  if (e.button !== 0) return;
  e.preventDefault();
  const sx = e.clientX,
    sy = e.clientY;
  let moving = false,
    ghost = null,
    target = null;
  const M = $("main").getBoundingClientRect();
  const fr = floatEl ? { x: floatEl.offsetLeft, y: floatEl.offsetTop } : null;
  const mv = (ev) => {
    if (!moving && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
    if (!moving) {
      moving = true;
      $("guides").hidden = false;
      if (!floatEl) {
        ghost = document.createElement("div");
        ghost.className = "ghost";
        ghost.textContent = WINS[id];
        document.body.appendChild(ghost);
      }
    }
    if (ghost) {
      ghost.style.left = ev.clientX + 12 + "px";
      ghost.style.top = ev.clientY + 8 + "px";
    }
    if (floatEl) {
      floatEl.style.left = fr.x + ev.clientX - sx + "px";
      floatEl.style.top = fr.y + ev.clientY - sy + "px";
    }
    target = null;
    document.querySelectorAll(".gz").forEach((z) => z.classList.remove("hot"));
    $("ghi").style.display = "none";
    const x = ev.clientX - M.left,
      y = ev.clientY - M.top;
    if (x < 70) target = { side: "left" };
    else if (x > M.width - 70) target = { side: "right" };
    else if (y > M.height - 56) target = { side: "bottom" };
    else {
      const c = $("center").getBoundingClientRect();
      if (ev.clientX >= c.left && ev.clientX <= c.right && ev.clientY >= c.top && ev.clientY <= c.bottom)
        target = { side: "center" };
    }
    if (target) document.querySelector(`.gz[data-z=${target.side}]`).classList.add("hot");
    else {
      const under = document
        .elementsFromPoint(ev.clientX, ev.clientY)
        .find((n) => n.classList && n.classList.contains("dg"));
      if (under) {
        const r = under.getBoundingClientRect();
        target = { side: under.dataset.side, gi: +under.dataset.gi };
        Object.assign($("ghi").style, {
          display: "block",
          left: r.left - M.left + "px",
          top: r.top - M.top + "px",
          width: r.width + "px",
          height: r.height + "px",
        });
      }
    }
  };
  const up = (ev) => {
    window.removeEventListener("pointermove", mv);
    window.removeEventListener("pointerup", up);
    $("guides").hidden = true;
    if (ghost) ghost.remove();
    if (!moving) {
      if (onClick) onClick();
      return;
    }
    if (target) {
      detach(id);
      if (target.side === "center") {
        DK.center.push(id);
        DK.active.center = id;
      } else if (target.gi != null && DK[target.side][target.gi]) {
        DK[target.side][target.gi].push(id);
        DK.active[target.side + target.gi] = id;
      } else DK[target.side].push([id]);
    } else {
      const x = ev.clientX - M.left - 40,
        y = ev.clientY - M.top - 12;
      if (floatEl) {
        const f = DK.floats.find((f) => f.id === id);
        f.x = Math.max(0, floatEl.offsetLeft);
        f.y = Math.max(0, floatEl.offsetTop);
      } else {
        detach(id);
        DK.floats.push({ id, x: Math.max(0, x), y: Math.max(0, y), w: 360, h: 340 });
      }
    }
    renderDock();
  };
  window.addEventListener("pointermove", mv);
  window.addEventListener("pointerup", up);
}
function bindSplits() {
  document.querySelectorAll(".split").forEach(
    (sp) =>
      (sp.onpointerdown = (e) => {
        e.preventDefault();
        const side = sp.dataset.side,
          s0 = DK.size[side],
          x0 = e.clientX,
          y0 = e.clientY;
        const mv = (ev) => {
          const d = side === "left" ? ev.clientX - x0 : side === "right" ? x0 - ev.clientX : y0 - ev.clientY;
          DK.size[side] = Math.max(170, Math.min(side === "bottom" ? 600 : 700, s0 + d));
          const el_ = side === "left" ? $("dockL") : side === "right" ? $("dockR") : $("dockB");
          if (side === "bottom") el_.style.height = DK.size[side] + "px";
          else el_.style.width = DK.size[side] + "px";
          window.dispatchEvent(new Event("resize"));
        };
        const up = () => {
          window.removeEventListener("pointermove", mv);
          window.removeEventListener("pointerup", up);
          saveDock();
        };
        window.addEventListener("pointermove", mv);
        window.addEventListener("pointerup", up);
      }),
  );
}

/* ---------- menus ---------- */
function focusInspector() {
  const w = whereIs("inspector");
  if (w.hidden) {
    showWin("inspector");
    return;
  }
  if (w.side === "center" && DK.active.center !== "inspector") {
    DK.active.center = "inspector";
    renderDock();
  } else if (w.side && DK.active[w.side + w.gi] !== "inspector" && DK[w.side][w.gi].length > 1) {
    DK.active[w.side + w.gi] = "inspector";
    renderDock();
  }
}
function closeMenus() {
  document.querySelectorAll(".menu.open").forEach((m) => m.classList.remove("open"));
}
function buildWinMenu() {
  const open = new Set([...$("winMenu").querySelectorAll(".winCat[open]")].map((n) => n.dataset.cat));
  const cats = [
    ["Workspace", ["view", "layout", "mics", "cables", "sound", "inspector"]],
    ["Inventory", ["inventory", "gear", "micdb"]],
    ["Analysis", ["playback", "waterfall", "dbchart", "reports", "console"]],
    ["Tools", ["guide", "file", "help"]], // Future improvements is in the Help menu; preferences are in Edit > Options
  ];
  const own = new Set(TOOLS[TOOL].wins),
    listed = new Set(cats.flatMap((c) => c[1]));
  cats.push([TOOLS[TOOL].name, TOOLS[TOOL].wins.filter((k) => !listed.has(k))]);
  const groups = cats
    .map(([name, ids]) => [name, ids.filter((k) => own.has(k))])
    .filter(([, ids]) => ids.length)
    .map(([name, ids], i) => {
      const buttons = ids
        .map(
          (k) =>
            '<button data-act="toggle:' +
            k +
            '" class="' +
            (whereIs(k).hidden ? "" : "on") +
            '">' +
            WINS[k] +
            "</button>",
        )
        .join("");
      return (
        '<details class="winCat" data-cat="' +
        name +
        '" ' +
        (open.has(name) || (!open.size && !i) ? "open" : "") +
        "><summary>" +
        name +
        "</summary>" +
        buttons +
        "</details>"
      );
    })
    .join("");
  $("winMenu").innerHTML = groups + '<hr><button data-act="resetdock">Reset window layout</button>';
}
function syncMenus() {
  document.querySelectorAll("[data-check]").forEach((b) => b.classList.toggle("on", $(b.dataset.check).checked));
  $("heatQ").value = $("heat").value;
  document
    .querySelectorAll('[data-act^="heat:"]')
    .forEach((b) => b.classList.toggle("on", b.dataset.act === "heat:" + $("heat").value));
  document
    .querySelectorAll('[data-act^="hash:"]')
    .forEach((b) => b.classList.toggle("on", b.dataset.act === "hash:" + (st.hash || "college")));
  document.querySelectorAll('[data-act="view2d"]').forEach((b) => b.classList.toggle("on", $("v3").hidden));
  syncSmart();
  document.querySelectorAll('[data-act="view3d"]').forEach((b) => b.classList.toggle("on", !$("v3").hidden));
}
function act(a) {
  const [k, v] = a.split(":");
  if (k !== "toggle") closeMenus();
  if (k === "win") {
    showWin(v);
    if (v === "file") $("io").focus();
    return;
  }
  if (k === "toggle") {
    whereIs(v).hidden ? showWin(v) : hideWin(v);
    return;
  }
  if (a === "resetdock") {
    DK = fitDockToTool(TOOL === "planner" ? DOCK0() : toolDock0(TOOL));
    renderDock();
    return;
  }
  if (a === "export") {
    $("bExport").click();
    return;
  }
  if (a === "fileOpen" || a === "fileSave" || a === "fileSaveAs") {
    if (TOOL !== "planner") switchTool("planner");
    a === "fileOpen" ? files.openList() : a === "fileSave" ? files.save() : files.saveAs(); // js/files.js
    return;
  }
  if (a === "account") {
    account.open(); // js/account.js
    return;
  }
  if (a === "layoutfreqs") {
    openLayoutFreqs(); // js/freqchart.js
    return;
  }
  if (a === "options") {
    openOptions();
    return;
  }
  if (a === "addmic") {
    $("bFree").click();
    return;
  }
  if (a === "settingsExport") {
    const url = URL.createObjectURL(new Blob([JSON.stringify(settings.exportData(), null, 1)], { type: "application/json" })),
      link = Object.assign(document.createElement("a"), {
        href: url,
        download: `rec-toolbox-settings-${new Date().toISOString().slice(0, 10)}.json`,
      });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status("Settings exported: view options, smart route choice, tool rail and window layouts. Your layout itself is not included.");
    return;
  }
  if (a === "settingsImport") {
    $("settingsFile").value = "";
    $("settingsFile").click();
    return;
  }
  if (a === "reset") {
    $("bReset").click();
    return;
  }
  if (a === "heatinfo") {
    openHeatInfo();
    return;
  }
  if (a === "wiredraw") {
    if (!$("v3").hidden) $("b2d").click();
    wireDraw.setMode(!wireDraw.mode);
    return;
  }
  if (a === "unwireall") {
    const drawn = [...st.mics, ...Object.values(st.boxes)].filter((o) => o.wire);
    if (!drawn.length) return status("There are no hand-drawn cables.");
    drawn.forEach((o) => delete o.wire);
    draw(true);
    status(`${drawn.length} hand-drawn cable${drawn.length === 1 ? "" : "s"} removed: smart route chooses them again. Ctrl+Z brings them back.`);
    return;
  }
  if (a === "resetpat") {
    st.mics.forEach((m) => {
      m.reach = 20;
      m.sscale = true;
    });
    draw(true);
    status("Every mic now uses a 20 ft reach scaled by its sensitivity.");
    return;
  }
  if (a === "rotcw") {
    rotateCanvas(90);
    return;
  }
  if (a === "rotccw") {
    rotateCanvas(-90);
    return;
  }
  if (a === "zoomin") {
    zoomBy(1 / 1.4);
    return;
  }
  if (a === "zoomout") {
    zoomBy(1.4);
    return;
  }
  if (a === "zoomfit") {
    zoomFit();
    return;
  }
  if (a === "undo") {
    undo();
    return;
  }
  if (a === "redo") {
    redo();
    return;
  }
  if (a === "delete") {
    deleteSelected();
    return;
  }
  if (a === "deselect") {
    sel = null;
    draw(true);
    return;
  }
  if (a === "meter") {
    $("bMeter").click();
    return;
  }
  if (k === "hash") {
    setHash(v);
    return;
  }
  if (a === "view2d") {
    $("b2d").click();
    syncMenus();
    return;
  }
  if (a === "view3d") {
    $("b3d").click();
    syncMenus();
    return;
  }
  if (k === "tool") {
    switchTool(v);
    return;
  }
  if (k === "smart") {
    runSmart(v);
    return;
  }
  if (k === "heat") {
    $("heat").value = v;
    $("heat").dispatchEvent(new Event("change"));
    syncMenus();
    return;
  }
}
function bindMenus() {
  document.querySelectorAll(".menu").forEach((m) => {
    const t = m.querySelector(".mt");
    t.onclick = (e) => {
      const o = m.classList.contains("open");
      closeMenus();
      if (!o) m.classList.add("open");
      e.stopPropagation();
    };
    t.onmouseenter = () => {
      if (document.querySelector(".menu.open") && !m.classList.contains("open")) {
        closeMenus();
        m.classList.add("open");
      }
    };
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act],[data-check]");
    if (
      b &&
      (b.closest(".dd") ||
        b.closest("#toolbar") ||
        b.closest("#statusbar") ||
        b.closest("#canvasTools") ||
        b.closest("#optModal") ||
        b.closest(".wc"))
    ) {
      if (b.dataset.check) {
        $(b.dataset.check).click();
        syncMenus();
        closeMenus();
      } else act(b.dataset.act);
      return;
    }
    if (!e.target.closest(".menu")) closeMenus();
  });
  $("heatQ").onchange = () => {
    $("heat").value = $("heatQ").value;
    $("heat").dispatchEvent(new Event("change"));
  };
  ["tSight", "tPhase", "tCont"].forEach((i) =>
    $(i).addEventListener("change", () => {
      heatDirty = true;
      draw();
    }),
  );
  $("dirEye").onchange = () => {
    const v = +$("dirEye").value;
    if (!(v >= 4 && v <= 20)) $("dirEye").value = 8;
    draw();
  };
}

["tPeople", "tMics", "tPolar", "tCables", "tSpec", "tWeb"].forEach((i) => ($(i).onchange = () => draw(true)));
$("heat").onchange = () => {
  heatDirty = true;
  draw();
};
$("hz").onchange = () => {
  const z = +$("hz").value;
  if (!(z >= 0 && z <= 40)) {
    $("hz").value = 5;
  }
  heatDirty = true;
  draw();
};
$("venue").onchange = () => {
  heatDirty = true;
  draw();
};

/* Running a mode from anywhere (split button, Route menu, Cables window) makes it the default the split button runs. */
const SMART_NAMES = { clean: "Cleanest", short: "Shortest" };
function runSmart(mode) {
  if (!SMART_NAMES[mode]) mode = "clean";
  if (smartBusy) return;
  settings.set("smartRoute.mode", mode);
  syncSmart();
  smart(mode);
}
function syncSmart() {
  const mode = SMART_NAMES[setting("smartRoute.mode")] ? setting("smartRoute.mode") : "clean";
  $("smartRun").textContent = "Smart route: " + SMART_NAMES[mode];
  document
    .querySelectorAll('[data-act^="smart:"]')
    .forEach((b) => b.classList.toggle("on", b.dataset.act === "smart:" + mode));
}
document
  .querySelectorAll("[data-smart]")
  .forEach(
    (b) =>
      (b.onclick = () => {
        closeMenus();
        runSmart(b.dataset.smart || setting("smartRoute.mode"));
      }),
  );
syncSmart();
/* Tabs inside a window (Reports: Stats / Channel list / Phase risks; Gear: Mics / Cables / ...).
   Buttons carry data-tab, panels data-tabbody; both live in the same .wc window. */
function showTab(win, k) {
  const w = document.querySelector(`.wc[data-win="${win}"]`);
  w.querySelectorAll("[data-tab]").forEach((b) => {
    b.classList.toggle("on", b.dataset.tab === k);
    b.setAttribute("aria-selected", String(b.dataset.tab === k));
  });
  w.querySelectorAll("[data-tabbody]").forEach((d) => (d.hidden = d.dataset.tabbody !== k));
}
document
  .querySelectorAll(".wc [data-tab]")
  .forEach((b) => (b.onclick = () => showTab(b.closest(".wc").dataset.win, b.dataset.tab)));
$("settingsFile").onchange = async () => {
  const f = $("settingsFile").files[0];
  if (!f) return;
  try {
    settings.importData(JSON.parse(await f.text()));
    status("Settings imported. Reloading…");
    location.reload();
  } catch (e) {
    status("Settings not imported: " + (e instanceof SyntaxError ? "the file isn't valid JSON." : e.message));
  }
};
$("bMeter").onclick = () => {
  const m = { id: "e" + st.nextId++, v: 120, u: 88 };
  st.meters.push(m);
  sel = { t: "e", k: m.id };
  draw(true);
  status("Meter added near the 50. Drag it anywhere.");
};
$("bReset").onclick = () => {
  fresh();
  st.risers = [];
  sel = null;
  applyBg();
  heatDirty = true;
  draw();
  status("Reset to the default layout.");
};
$("bExport").onclick = () => {
  $("io").value = JSON.stringify(st);
  $("ioErr").textContent = "";
  try {
    navigator.clipboard &&
      navigator.clipboard.writeText($("io").value).then(
        () => status("Layout copied to the clipboard."),
        () => status("Copy failed. Select the text in the box and copy it by hand."),
      );
  } catch (e) {
    console.warn("Clipboard copy failed", e);
  }
};
$("bImport").onclick = () => {
  try {
    const o = JSON.parse($("io").value);
    if (!valid(o)) throw 0;
    st = upgrade(o);
    st.risers = st.risers || [];
    sel = null;
    applyBg();
    heatDirty = true;
    $("ioErr").textContent = "";
    draw();
    status("Layout imported.");
  } catch (e) {
    $("ioErr").textContent = "That isn't a layout from this planner. Export one first, then paste it here.";
  }
};
$("io").oninput = () => {
  $("ioErr").textContent = "";
};
st = load() || fresh();
checkpointOriginalLayout(st);
inv();
mergeCustom();
applyMicOwned();
$("oStock").checked = !st.buy;
$("oClear").checked = !!st.noCross;
$("hashSel").value = st.hash || "college";
$("hashSel").onchange = () => setHash($("hashSel").value);
function layoutSaveMessage(message, error = false) {
  $("layoutSaveStatus").textContent = message;
  $("layoutSaveStatus").className = error ? "err" : "m";
}
try {
  refreshLayoutSnapshots(ORIGINAL_LAYOUT_ID);
  if (window.layoutCheckpointError) throw Error(window.layoutCheckpointError);
  layoutSaveMessage("Original layout preserved. Download backup to keep a copy outside this browser.");
} catch (e) {
  layoutSaveMessage(e.message, true);
}
$("bSaveLayout").onclick = () => {
  try {
    const snap = saveLayoutSnapshot($("layoutName").value);
    refreshLayoutSnapshots(snap.id);
    layoutSaveMessage("Saved: " + snap.name);
  } catch (e) {
    layoutSaveMessage("Could not save: " + e.message, true);
  }
};
$("bRestoreLayout").onclick = () => {
  try {
    const snap = layoutSnapshots().find((s) => s.id === $("savedLayouts").value);
    if (!snap) throw Error("Choose a saved layout.");
    restoreLayoutBackup(snap);
  } catch (e) {
    layoutSaveMessage("Could not restore: " + e.message, true);
  }
};
$("bDownloadLayout").onclick = () => {
  try {
    const snap = layoutSnapshots().find((s) => s.id === $("savedLayouts").value);
    if (!snap) throw Error("Choose a saved layout.");
    const url = URL.createObjectURL(new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" })),
      a = document.createElement("a");
    a.href = url;
    a.download = (snap.name.replace(/[^a-z0-9 -]/gi, "").trim() || "recording-layout") + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    layoutSaveMessage("Backup download requested: " + snap.name);
  } catch (e) {
    layoutSaveMessage(e.message, true);
  }
};
$("layoutBackupFile").onchange = async (e) => {
  try {
    const f = e.target.files[0];
    if (f) restoreLayoutBackup(JSON.parse(await f.text()));
  } catch (err) {
    layoutSaveMessage("Could not open backup: " + err.message, true);
  } finally {
    e.target.value = "";
  }
};
$("bImport").onclick = () => {
  try {
    restoreLayoutBackup(JSON.parse($("io").value));
  } catch (e) {
    $("ioErr").textContent = "Could not import: " + e.message;
  }
};
const resetLayoutWithoutCheckpoint = $("bReset").onclick;
$("bReset").onclick = () => {
  try {
    saveLayoutSnapshot("Before reset to starting layout");
    refreshLayoutSnapshots();
    resetLayoutWithoutCheckpoint();
  } catch (e) {
    layoutSaveMessage("Reset cancelled because the current layout could not be saved: " + e.message, true);
  }
};
$("oStock").onchange = () => {
  st.buy = !$("oStock").checked;
  draw(true);
};
$("oClear").onchange = () => {
  st.noCross = $("oClear").checked;
  draw(true);
};
/* ---------- remember view settings (per browser) ---------- */
const UI_CHECKS = [
    "cmpDiff",
    "tPeople",
    "tSpec",
    "tSight",
    "tMics",
    "tPolar",
    "tWeb",
    "tPhase",
    "tCables",
    "tCont",
    "oDesk",
    "oRewire",
    "pbAnim",
    "s3mic",
    "s3vol",
    "s3pick",
    "s3aim",
  ],
  UI_VALS = [
    "wfColor",
    "wfSpeed",
    "wfRange",
    "spStyle",
    "spColor",
    "mtStyle",
    "mtColor",
    "heat",
    "hz",
    "venue",
    "dirEye",
    "pbSmooth",
    "pbRange",
    "s3h",
    "s3ax",
    "s3p",
  ];
function saveUI() {
  try {
    const o = { c: {}, v: {}, view: $("v3").hidden ? "2d" : "3d" };
    UI_CHECKS.forEach((i) => (o.c[i] = $(i).checked));
    UI_VALS.forEach((i) => (o.v[i] = $(i).value));
    settings.set("planner.view", o);
  } catch (e) {
    console.warn("View settings not saved", e);
  }
}
let uiView = "2d";
function restoreUI() {
  try {
    const o = setting("planner.view");
    if (!o) return;
    for (const i in o.c || {}) if ($(i)) $(i).checked = !!o.c[i];
    for (const i in o.v || {}) if ($(i) && o.v[i] != null) $(i).value = o.v[i];
    uiView = o.view || "2d";
    $("s3hv").textContent = $("s3h").value + " ft";
    heatDirty = true;
  } catch (e) {
    console.warn("Saved view settings partly ignored", e);
  }
}
[...UI_CHECKS, ...UI_VALS].forEach((i) => {
  $(i).addEventListener("change", saveUI);
  $(i).addEventListener("input", saveUI);
});
$("b2d").addEventListener("click", () => setTimeout(saveUI, 0));
$("b3d").addEventListener("click", () => setTimeout(saveUI, 0));
restoreUI();
st.risers = st.risers || [];
applyBg();
initDock();
draw();
if (uiView === "3d") window.addEventListener("load", () => $("b3d").click());

// Theme change (js/theme.js): the SVG follows the CSS colours by itself; redraw what paints its own colours.
window.addEventListener("rt:themechange", () => {
  heatDirty = true;
  draw();
});
