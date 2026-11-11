/* Frequency chart: every instrument's range on one log-frequency axis (20 Hz–20 kHz), with layers you can turn on and
   off: fundamentals, overtones and other sounds (pick noise, key clicks, body taps, sibilance...). Hover for the
   frequency and note under the pointer; click a bar to light that band across every instrument; click a row for details.
   Two places show it, built from one makeFreqView():
   - the Frequency chart tool (prefix "fc": all instruments, with family / search / only-my-layout filters)
   - the "Frequencies in this layout" window over the planner (prefix "fcm": one row per instrument in the layout).
   Data: js/freqdata.js. Levels are typical dB SPL at 1 m (quiet to loud). */
const FC_MIN = 20,
  FC_MAX = 20000,
  fcX = (f) =>
    ((Math.log10(Math.max(FC_MIN, Math.min(FC_MAX, f))) - Math.log10(FC_MIN)) / (Math.log10(FC_MAX) - Math.log10(FC_MIN))) * 100,
  fcF = (pct) => FC_MIN * Math.pow(FC_MAX / FC_MIN, pct / 100);
const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
function noteOf(f) {
  const n = Math.round(12 * Math.log2(f / 440) + 69);
  return NOTE_NAMES[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1);
}
const fcHz = (f) => (f >= 1000 ? (f / 1000).toFixed(f >= 10000 ? 0 : 1).replace(/\.0$/, "") + " kHz" : Math.round(f) + " Hz");
const fcRange = (a, b) => `${fcHz(a)}–${fcHz(b)}`;

/* Which chart row a planner section is. Guitar and voice depend on the section's name. */
function freqRowFor(G) {
  const l = (G.l || "").toLowerCase();
  if (G.kind === "gtr") return l.includes("acoustic") ? "agtr" : "egtr";
  if (G.kind === "vox") return /female|soprano|alto|women/.test(l) ? "vf" : /male|bass|tenor|baritone|men/.test(l) ? "vm" : ["vm", "vf"];
  const d = FREQ_DATA.find((x) => x.kinds.includes(G.kind));
  return d ? d.id : null;
}
/* One row per instrument in the layout, in chart order, listing the sections that use it. */
function freqLayoutRows() {
  const by = {};
  for (const G of st.groups) {
    const ids = [].concat(freqRowFor(G) || []);
    for (const id of ids) (by[id] = by[id] || []).push(G.l);
  }
  return FREQ_DATA.filter((d) => by[d.id]).map((d) => ({ ...d, sub: [...new Set(by[d.id])].join(", ") }));
}
function freqLayoutHas(d) {
  return freqLayoutRows().some((r) => r.id === d.id);
}

/* Put the other-sound bars in lanes so neither bars nor their labels overlap. */
function fcLanes(extras, trackPx) {
  const lanes = [];
  return extras.map((e) => {
    const x0 = fcX(e[1]),
      labelPct = ((e[0].length * 6.2 + 8) / Math.max(200, trackPx)) * 100,
      x1 = Math.max(fcX(e[2]), x0 + labelPct);
    let lane = lanes.findIndex((end) => end < x0 - 0.5);
    if (lane < 0) lane = lanes.push(0) - 1;
    lanes[lane] = x1;
    return { e, lane };
  });
}

function makeFreqView(p, rowsFn, emptyMsg) {
  const el = (k) => $(p + k),
    view = { focus: null };
  view.render = () => {
    const box = el("Chart");
    if (!box) return;
    const showF = el("ShowF").checked,
      showO = el("ShowO").checked,
      showX = el("ShowX").checked,
      showL = el("ShowL").checked,
      trackPx = Math.max(300, box.clientWidth - 200),
      rows = rowsFn(),
      f = view.focus;
    let h = `<div class="fcAxis"><div></div><div class="fcTrack">`;
    for (const t of [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000])
      h += `<span class="fcTick${t === 20 ? " fcFirst" : t === 20000 ? " fcLast" : ""}" style="left:${fcX(t)}%">${fcHz(t)}</span>`;
    h += `</div></div><div class="fcAxis fcNotes"><div class="m">Notes</div><div class="fcTrack">`;
    for (let o = 1; o <= 8; o++) h += `<span class="fcTick" style="left:${fcX(32.703 * Math.pow(2, o - 1))}%">C${o}</span>`;
    h += `</div></div><div class="fcBody">`;
    let fam = "";
    for (const d of rows) {
      if (d.fam !== fam) {
        fam = d.fam;
        h += `<div class="fcFam">${esc(fam)}</div>`;
      }
      const placed = showX ? fcLanes(d.extra, trackPx) : [],
        lanes = placed.reduce((m, q) => Math.max(m, q.lane + 1), 0),
        level = `<span class="fcLvl" title="Typical level at 1 m: ${d.spl[0]}–${d.spl[1]} dB SPL"><i style="left:${((d.spl[0] - 50) / 80) * 100}%;width:${((d.spl[1] - d.spl[0]) / 80) * 100}%"></i></span>`;
      h += `<div class="fcRow" data-id="${d.id}" style="--lanes:${lanes}"><div class="fcName"><b>${esc(d.name)}</b>${d.sub ? `<span class="fcSub">${esc(d.sub)}</span>` : ""}${showL ? `<span class="m">${d.spl[0]}–${d.spl[1]} dB</span>${level}` : ""}</div><div class="fcTrack">`;
      if (showO)
        h += `<span class="fcBar fcOver" data-band="${d.fund[0]},${d.over},${esc(d.name)} with overtones" style="left:${fcX(d.fund[0])}%;width:${fcX(d.over) - fcX(d.fund[0])}%" title="${esc(d.name)}: overtones up to about ${fcHz(d.over)}"></span>`;
      if (showF)
        h += `<span class="fcBar fcFund" data-band="${d.fund[0]},${d.fund[1]},${esc(d.name)} fundamentals" style="left:${fcX(d.fund[0])}%;width:${Math.max(0.4, fcX(d.fund[1]) - fcX(d.fund[0]))}%" title="${esc(d.name)}: fundamentals ${fcRange(d.fund[0], d.fund[1])} (${noteOf(d.fund[0])}–${noteOf(d.fund[1])})"></span>`;
      for (const { e, lane } of placed)
        h += `<span class="fcBar fcExtra" data-band="${e[1]},${e[2]},${esc(d.name)}: ${esc(e[0])}" style="left:${fcX(e[1])}%;width:${Math.max(0.4, fcX(e[2]) - fcX(e[1]))}%;top:${18 + lane * 15}px" title="${esc(e[0])}: ${fcRange(e[1], e[2])}. ${esc(e[3])}"><em>${esc(e[0])}</em></span>`;
      h += `</div></div>`;
    }
    if (!rows.length) h += `<p class="m">${emptyMsg()}</p>`;
    if (f)
      h += `<div class="fcFocus" style="left:calc(200px + (100% - 200px) * ${fcX(f.lo) / 100});width:calc((100% - 200px) * ${(fcX(f.hi) - fcX(f.lo)) / 100})"></div>`;
    h += `<div class="fcCross" hidden></div></div>`;
    box.innerHTML = h;
    settings.set("freqChart.layers", { f: showF, o: showO, x: showX, l: showL });
  };
  view.info = (d) => {
    el("Info").innerHTML = `<h4>${esc(d.name)}${freqLayoutHas(d) ? ` <span class="tag">in your layout</span>` : ""}</h4>
     <div class="cards">
      <div class="card"><span class="m">Fundamentals</span><b>${fcRange(d.fund[0], d.fund[1])}</b><span class="m">${noteOf(d.fund[0])} to ${noteOf(d.fund[1])}</span></div>
      <div class="card"><span class="m">Overtones to about</span><b>${fcHz(d.over)}</b><span class="m">where the tone colour lives</span></div>
      <div class="card"><span class="m">Level at 1 m</span><b>${d.spl[0]}–${d.spl[1]} dB</b><span class="m">quiet to loud playing</span></div></div>
     <table class="fcExtras"><tr><th>Other sound</th><th>Range</th><th>What it is</th></tr>${d.extra
       .map((e) => `<tr><td>${esc(e[0])}</td><td>${fcRange(e[1], e[2])}</td><td class="m">${esc(e[3])}</td></tr>`)
       .join("")}</table>`;
  };
  view.loadLayers = () => {
    const L = setting("freqChart.layers") || {};
    el("ShowF").checked = L.f !== false;
    el("ShowO").checked = L.o !== false;
    el("ShowX").checked = L.x !== false;
    el("ShowL").checked = L.l !== false;
  };
  ["ShowF", "ShowO", "ShowX", "ShowL"].forEach((k) => el(k).addEventListener("input", view.render));
  const box = el("Chart");
  // Crosshair: frequency and note under the pointer.
  box.addEventListener("mousemove", (e) => {
    const body = box.querySelector(".fcBody"),
      cross = box.querySelector(".fcCross"),
      track = box.querySelector(".fcAxis .fcTrack");
    if (!body || !cross || !track) return;
    const r = track.getBoundingClientRect(),
      pct = ((e.clientX - r.left) / r.width) * 100;
    if (pct < 0 || pct > 100) {
      cross.hidden = true;
      el("Read").textContent = "";
      return;
    }
    const f = fcF(pct);
    cross.hidden = false;
    cross.style.left = e.clientX - body.getBoundingClientRect().left + "px";
    el("Read").textContent = `${fcHz(f)} · ${noteOf(f)}`;
  });
  box.addEventListener("mouseleave", () => {
    const cross = box.querySelector(".fcCross");
    if (cross) cross.hidden = true;
    el("Read").textContent = "";
  });
  // Click a bar: light its band across all instruments; click a row for details.
  box.addEventListener("click", (e) => {
    const bar = e.target.closest("[data-band]"),
      row = e.target.closest(".fcRow");
    if (row) view.info(FREQ_DATA.find((d) => d.id === row.dataset.id));
    if (bar) {
      const [lo, hi, ...label] = bar.dataset.band.split(",");
      view.focus = view.focus && view.focus.label === label.join(",") ? null : { lo: +lo, hi: +hi, label: label.join(",") };
      el("FocusTxt").textContent = view.focus
        ? `Highlighted: ${view.focus.label}, ${fcRange(view.focus.lo, view.focus.hi)} (click it again to clear)`
        : "";
      view.render();
    }
  });
  new ResizeObserver(() => box.offsetParent && view.render()).observe(box);
  return view;
}

/* The Frequency chart tool: all instruments, with filters. */
const fcTool = makeFreqView(
  "fc",
  () => {
    const fam = $("fcFam").value,
      q = $("fcQ").value.trim().toLowerCase(),
      mine = $("fcMine").checked,
      ids = new Set(freqLayoutRows().map((r) => r.id));
    return FREQ_DATA.filter(
      (d) =>
        (fam === "all" || d.fam === fam) &&
        (!q || (d.name + " " + d.fam + " " + d.extra.map((e) => e[0]).join(" ")).toLowerCase().includes(q)) &&
        (!mine || ids.has(d.id)),
    );
  },
  () => "No instruments match." + ($("fcMine").checked ? " Only my layout is on: add sections in the Setup planner, or turn it off." : ""),
);
function renderFreqChart() {
  fcTool.render();
}
function openFreqChart() {
  fcTool.loadLayers();
  fcTool.render();
}
$("fcFam").innerHTML = `<option value="all">All families</option>` + FREQ_FAMILIES.map((f) => `<option>${esc(f)}</option>`).join("");
["fcFam", "fcQ", "fcMine"].forEach((id) => $(id).addEventListener("input", renderFreqChart));

/* "Frequencies in this layout": a window over the planner with one row per instrument in the current layout. */
const fcLayout = makeFreqView(
  "fcm",
  freqLayoutRows,
  () => "This layout has no sections the chart knows yet. Add sections in the Setup planner (or try File > New from preset > Stage: Rock band).",
);
function openLayoutFreqs() {
  closeMenus();
  fcLayout.loadLayers();
  fcLayout.focus = null;
  $("fcmFocusTxt").textContent = "";
  $("fcmInfo").innerHTML = `<p class="m">Click an instrument for its ranges, notes and other sounds.</p>`;
  const n = freqLayoutRows().length;
  $("fcmSub").textContent = `${n} instrument${n === 1 ? "" : "s"} from ${st.groups.length} section${st.groups.length === 1 ? "" : "s"} in the current layout.`;
  $("fcmModal").hidden = false;
  fcLayout.render();
}
$("fcmModal").addEventListener("click", (e) => {
  if (e.target.id === "fcmModal" || e.target.closest("[data-fcmclose]")) $("fcmModal").hidden = true;
});
$("fcmModal").addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.stopPropagation();
    $("fcmModal").hidden = true;
  }
});
$("fcmFull").onclick = () => {
  $("fcmModal").hidden = true;
  $("fcMine").checked = true;
  switchTool("freq");
};
