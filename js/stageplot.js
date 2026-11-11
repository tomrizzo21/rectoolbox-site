/* Stage plot tool: a printable sheet built from the current layout, to send ahead to a venue or crew.
   Plot (sections, numbered mics, desk, snake boxes), input list (channel order) and a gear pull list.
   Reads the planner's state (st) and the last routing result (res); nothing here changes the layout. */
const standClass = (h) => (h <= 4 ? "Short / kick stand" : h <= 7 ? "Boom stand" : "Tall stand (over 7 ft)");

/* One row per input channel, in track order, like the Channel list. */
function inputRows() {
  const rows = [];
  for (const m of st.mics) (res.track[m.id] || []).forEach((t, i) => rows.push({ t, m, i }));
  return rows.sort((a, b) => (a.t || 99) - (b.t || 99));
}
/* Suggested DAW track name: the source without "part", plus L/R for a stereo mic. The planner's rule is
   DAW track = interface input number, so tracks line up with inputs when recording. */
function dawTrackName(m, i) {
  const base = sourceName(m).replace(/ part\b/g, "").replace(/^Free-standing · /, ""),
    stereo = MODELS[m.model].ch ? (i ? " R" : " L") : "";
  return base + stereo;
}
const slotTxt = (t) => {
  const s = inputSlot(t);
  return s ? `${s.iface} : ${s.input}` : "–";
};
function sourceName(m) {
  const G = m.g && gOf(m.g);
  return (G ? members(G.k).map((x) => x.l).join(" + ") : "Free-standing") + (m.label ? " · " + m.label : "");
}

function plotSVG() {
  // Same orientation as the planner's unrotated 2D view: x runs with -v, y with u.
  const pts = [],
    shapes = st.groups.map((G) => {
      const k = scaleK(G),
        P = shapeOf(G).out.map(([x, y]) => toField(G, x * k, y * k));
      pts.push(...P);
      return { G, P };
    }),
    mics = inputRows()
      .filter((r) => r.i === 0)
      .map((r) => ({ ...r, p: micPos(r.m) }));
  mics.forEach((r) => pts.push(r.p));
  pts.push(st.desk);
  const boxes = ["b24", "b20", "eth"].filter((id) => st.boxes[id] && st.boxes[id].on).map((id) => st.boxes[id]);
  pts.push(...boxes);
  const vs = pts.map((p) => p.v),
    us = pts.map((p) => p.u),
    v0 = Math.min(...vs) - 6,
    v1 = Math.max(...vs) + 6,
    u0 = Math.min(...us) - 6,
    u1 = Math.max(...us) + 6,
    s = Math.min(760 / (v1 - v0), 560 / (u1 - u0)),
    W = Math.round((v1 - v0) * s),
    H = Math.round((u1 - u0) * s),
    x = (p) => ((v1 - p.v) * s).toFixed(1),
    y = (p) => ((p.u - u0) * s).toFixed(1);
  let g = "";
  for (const { G, P } of shapes) {
    const c = P.reduce((a, p) => ({ v: a.v + p.v / P.length, u: a.u + p.u / P.length }), { v: 0, u: 0 });
    g += `<polygon points="${P.map((p) => x(p) + "," + y(p)).join(" ")}" class="spSec"/>`;
    g += `<text x="${x(c)}" y="${y(c)}" class="spLbl">${esc(G.l)}</text><text x="${x(c)}" y="${+y(c) + 12}" class="spSub">${G.n} players</text>`;
  }
  for (const b of boxes) g += `<rect x="${+x(b) - 9}" y="${+y(b) - 6}" width="18" height="12" class="spBox"/><text x="${x(b)}" y="${+y(b) + 18}" class="spSub">${esc(b.name)}</text>`;
  g += `<rect x="${+x(st.desk) - 16}" y="${+y(st.desk) - 8}" width="32" height="16" class="spDesk"/><text x="${x(st.desk)}" y="${+y(st.desk) + 4}" class="spDeskT">Desk</text>`;
  for (const r of mics) {
    const n = (res.track[r.m.id] || []).filter(Boolean).join("/") || "–";
    g += `<circle cx="${x(r.p)}" cy="${y(r.p)}" r="8" class="spMic"/><text x="${x(r.p)}" y="${+y(r.p) + 3.5}" class="spMicT">${n}</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" class="spPlot" role="img" aria-label="Stage plot: sections, numbered mics, desk and snake boxes">${g}</svg>`;
}

function pullList() {
  const byModel = {},
    stands = {},
    xlr = {};
  for (const m of st.mics) {
    byModel[m.model] = (byModel[m.model] || 0) + 1;
    stands[standClass(m.h)] = (stands[standClass(m.h)] || 0) + 1;
  }
  for (const L of LENS) if (res.used[L]) xlr[L] = res.used[L];
  const li = (o, f = (k) => k) =>
    Object.entries(o)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `<li>${n} × ${esc(f(k))}</li>`)
      .join("");
  const boxes = ["b24", "b20", "eth"].filter((id) => st.boxes[id].on).map((id) => `<li>${esc(st.boxes[id].name)} (${st.boxes[id].trunk} ft trunk)</li>`);
  const buy = LENS.filter((L) => res.bought[L]).map((L) => `${res.bought[L]} × ${L} ft`);
  return `<div class="spCols">
   <div><h4>Mics (${st.mics.length})</h4><ul>${li(byModel)}</ul></div>
   <div><h4>Stands</h4><ul>${li(stands)}</ul></div>
   <div><h4>XLR (${res.len} ft, ${res.pieces} pieces)</h4><ul>${li(xlr, (k) => k + " ft")}</ul>${buy.length ? `<p class="warn">To buy: ${buy.join(", ")}</p>` : ""}</div>
   <div><h4>Snake boxes</h4><ul>${boxes.join("") || "<li>None (all mics run to the desk)</li>"}</ul></div></div>`;
}

function renderStagePlot() {
  const sheet = $("spSheet");
  if (!sheet || !res) return;
  const title = $("spTitle").value.trim() || "Stage plot",
    when = $("spDate").value;
  let rows = "";
  for (const { t, m, i } of inputRows()) {
    const r = res.mic[m.id],
      stereo = MODELS[m.model].ch ? (i ? " (R)" : " (L)") : "";
    const slot = inputSlot(t);
    rows += `<tr><td>${t ?? "–"}</td><td><b>${slotTxt(t)}</b>${slot ? `<br><span class="m">${esc(slot.name)}${MODELS[m.model].pre === "D8" ? ", pad on" : ""}</span>` : ""}</td><td>${t ?? "–"}<br><span class="m">${esc(dawTrackName(m, i))}</span></td><td>${esc(sourceName(m))}</td><td>${esc(m.model)}${stereo}</td><td>${esc(m.pat)}</td><td>${esc(standClass(m.h))}, ${m.h} ft</td><td>${r.t === "desk" ? "Desk" : esc(st.boxes[r.t].name)}</td><td>${cabTxt(r.cabs[i])}</td></tr>`;
  }
  sheet.innerHTML = `<header><h2>${esc(title)}</h2><span class="m">${esc(when)}${when ? " · " : ""}${st.mics.length} mics · ${inputRows().length} inputs · ${st.groups.reduce((a, G) => a + G.n, 0)} players</span></header>
   ${plotSVG()}
   <p class="m">Circles are mics, numbered by input channel. Same orientation as the Setup planner's 2D view.</p>
   <h3>Input list</h3>
   <p class="m">Interface : input tells you where to plug in: input 9 is interface 2, input 1. DAW track = input number, with a suggested track name.</p>
   <table class="spTable"><thead><tr><th>Input</th><th>Interface : input</th><th>DAW track</th><th>Source</th><th>Mic</th><th>Pattern</th><th>Stand</th><th>Runs to</th><th>XLR</th></tr></thead><tbody>${rows}</tbody></table>
   <h3>Gear pull list</h3>${pullList()}`;
}

/* CSV of the input list, downloaded (works from disk, unlike the clipboard). */
function downloadInputCSV() {
  const q = (v) => `"${String(v).replace(/"/g, '""')}"`,
    lines = [["Input", "Interface", "Interface input", "Interface model", "DAW track", "DAW track name", "Source", "Mic", "Pattern", "Stand", "Height ft", "Runs to", "XLR"].map(q).join(",")];
  for (const { t, m, i } of inputRows()) {
    const r = res.mic[m.id];
    lines.push(
      [t ?? "", inputSlot(t)?.iface ?? "", inputSlot(t)?.input ?? "", inputSlot(t)?.name ?? "", t ?? "", dawTrackName(m, i), sourceName(m), m.model, m.pat, standClass(m.h), m.h, r.t === "desk" ? "Desk" : st.boxes[r.t].name, cabTxt(r.cabs[i])]
        .map(q)
        .join(","),
    );
  }
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv" })),
    a = Object.assign(document.createElement("a"), { href: url, download: "input-list.csv" });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status("Input list downloaded as input-list.csv.");
}

$("spTitle").value = setting("stagePlot.title") || "";
$("spDate").value = setting("stagePlot.date") || "";
["spTitle", "spDate"].forEach((id) =>
  $(id).addEventListener("input", () => {
    settings.set(id === "spTitle" ? "stagePlot.title" : "stagePlot.date", $(id).value);
    renderStagePlot();
  }),
);
/* Printing: the sheet sits inside a scrolling window that would clip it, so a copy goes into a top-level
   #printArea for the print and is removed afterwards. Ctrl+P while on this tool prints the sheet too. */
function preparePrint() {
  if (TOOL !== "stageplot") return;
  renderStagePlot();
  let a = $("printArea");
  if (!a) {
    a = document.createElement("div");
    a.id = "printArea";
    document.body.appendChild(a);
  }
  a.innerHTML = `<div class="spPrintSheet">${$("spSheet").innerHTML}</div>`;
  document.body.classList.add("printing");
}
window.addEventListener("beforeprint", preparePrint);
window.addEventListener("afterprint", () => {
  document.body.classList.remove("printing");
  $("printArea")?.remove();
});
$("spPrint").onclick = () => {
  preparePrint();
  window.print();
};
$("spCSV").onclick = downloadInputCSV;
