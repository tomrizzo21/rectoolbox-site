/* Phase calculator tool: two mics hearing one source. From the two distances it works out the time offset, the
   level difference, where the comb-filter notches fall and how deep they are, and the 3:1 rule; the graph shows the
   summed response. "Pair from my layout" fills the distances from a phase-risk pair in the Setup planner.
   Free-field estimate: real rooms, mic patterns and polarity change the result. */
const PH_RATES = [44100, 48000, 96000],
  ROOM_TEMP_F = 70; // used when the temperature box is left blank
function soundSpeedFtPerMs(tempF) {
  const c = (tempF - 32) / 1.8; // °C
  return ((331.3 + 0.606 * c) * 3.28084) / 1000;
}
function phaseNumbers(dA, dB_, tempF) {
  const near = Math.min(dA, dB_),
    far = Math.max(dA, dB_),
    v = soundSpeedFtPerMs(tempF),
    ms = (far - near) / v,
    levelDiff = 20 * Math.log10(far / near), // inverse-square: how much quieter the source is in the far mic
    g = Math.pow(10, -levelDiff / 20),
    depth = g >= 0.999 ? Infinity : 20 * Math.log10((1 + g) / (1 - g)),
    f1 = ms > 0 ? 1000 / (2 * ms) : Infinity,
    notches = [];
  for (let k = 0; ms > 0 && notches.length < 40; k++) {
    const f = ((2 * k + 1) * 1000) / (2 * ms);
    if (f > 20000) break;
    notches.push(f);
  }
  return { near, far, ms, levelDiff, g, depth, f1, notches, ratio: far / near };
}
const fmtHz = (f) => (f >= 1000 ? (f / 1000).toFixed(f >= 10000 ? 0 : 1) + " kHz" : Math.round(f) + " Hz");

function combSVG(n) {
  const W = 640,
    H = 200,
    x = (f) => ((Math.log10(f) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20))) * W,
    y = (db) => ((7 - Math.max(-30, Math.min(7, db))) / 37) * H;
  let d = "";
  // Enough points that close-spaced notches near 20 kHz still draw as notches, not aliasing.
  const N = 3000;
  for (let i = 0; i <= N; i++) {
    const f = 20 * Math.pow(1000, i / N),
      w = 2 * Math.PI * f * (n.ms / 1000),
      re = 1 + n.g * Math.cos(w),
      im = -n.g * Math.sin(w),
      db = 20 * Math.log10(Math.max(1e-4, Math.hypot(re, im)));
    d += (i ? "L" : "M") + x(f).toFixed(1) + "," + y(db).toFixed(1);
  }
  let grid = "";
  for (const f of [50, 100, 200, 500, 1000, 2000, 5000, 10000])
    grid += `<line x1="${x(f)}" x2="${x(f)}" y1="0" y2="${H}" class="pcGrid"/><text x="${x(f) + 2}" y="${H - 4}" class="pcAx">${fmtHz(f)}</text>`;
  for (const db of [6, 0, -10, -20])
    grid += `<line x1="0" x2="${W}" y1="${y(db)}" y2="${y(db)}" class="pcGrid${db === 0 ? " pcZero" : ""}"/><text x="2" y="${db > 0 ? y(db) + 11 : y(db) - 2}" class="pcAx">${db > 0 ? "+" : ""}${db} dB</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="pcGraph" role="img" aria-label="Summed frequency response of the two mics">${grid}<path d="${d}" class="pcLine"/></svg>`;
}

function renderPhaseCalc() {
  const dA = +$("pcA").value,
    dB_ = +$("pcB").value,
    tRaw = $("pcTemp").value.trim(),
    t = tRaw === "" ? ROOM_TEMP_F : +tRaw,
    out = $("pcOut");
  if (!(dA > 0) || !(dB_ > 0)) {
    out.innerHTML = `<p class="err">Enter both distances in feet (more than 0).</p>`;
    return;
  }
  const n = phaseNumbers(dA, dB_, isFinite(t) ? t : ROOM_TEMP_F),
    samples = PH_RATES.map((r) => `${Math.round((n.ms / 1000) * r)} at ${r / 1000} kHz`).join(" · "),
    pass = n.levelDiff >= 9.5,
    risk = n.ms === 0 ? "none" : n.levelDiff < 6 ? "high" : n.levelDiff < 9.5 ? "moderate" : "low";
  out.innerHTML = `<div class="cards">
     <div class="card"><span class="m">Time offset</span><b>${n.ms.toFixed(2)} ms</b><span class="m">${samples} samples</span></div>
     <div class="card"><span class="m">Level difference</span><b>${n.levelDiff.toFixed(1)} dB</b><span class="m">far mic is ${n.ratio.toFixed(1)}× the distance</span></div>
     <div class="card"><span class="m">First notch</span><b>${n.ms ? fmtHz(n.f1) : "–"}</b><span class="m">${n.ms ? "then every " + fmtHz(1000 / n.ms) : "same distance: in phase"}</span></div>
     <div class="card"><span class="m">Notch depth</span><b>${n.ms ? (isFinite(n.depth) ? n.depth.toFixed(1) + " dB" : "total") : "–"}</b><span class="m">comb-filter risk: ${risk}</span></div></div>
   ${n.ms ? combSVG(n) : ""}
   <p class="${pass ? "ok" : "warn"}">3:1 rule: the far mic is ${n.ratio.toFixed(1)}× as far from this source (${n.levelDiff.toFixed(1)} dB quieter). ${
     pass
       ? "That passes (9.5 dB or more apart), so mixing the two gives only mild ripple."
       : `Below 3:1. Move the far mic to at least ${(n.near * 3).toFixed(1)} ft from the source, move the near mic closer, or delay the near mic by ${n.ms.toFixed(2)} ms to line them up.`
   }</p>
   ${n.notches.length ? `<p class="m">Notches below 20 kHz: ${n.notches.slice(0, 12).map(fmtHz).join(", ")}${n.notches.length > 12 ? ", …" : ""}</p>` : ""}
   <p class="m">At ${tRaw === "" ? `room temperature (${ROOM_TEMP_F} °F)` : `${t} °F`}. Free-field estimate for one source and two mics. Mic patterns, reflections and polarity change the real result; trust your ears and check with the polarity button.</p>`;
}

/* The layout's phase-risk pairs, with the distances the planner used. */
function layoutPairs() {
  if (typeof computePhase !== "function") return [];
  return computePhase().map((r) => {
    const h = KIND[r.G.kind].h,
      pa = micPos(r.a),
      pb = micPos(r.b);
    return {
      label: `${micName(r.a)} + ${micName(r.b)} on ${r.G.l}`,
      a: Math.hypot(pa.v - r.G.v, pa.u - r.G.u, r.a.h - h),
      b: Math.hypot(pb.v - r.G.v, pb.u - r.G.u, r.b.h - h),
    };
  });
}
function fillPairs() {
  const sel = $("pcPair"),
    pairs = layoutPairs();
  sel.innerHTML =
    `<option value="">${pairs.length ? "Pick a pair from the Setup planner…" : "No phase-risk pairs in the current layout"}</option>` +
    pairs.map((p, i) => `<option value="${i}">${esc(p.label)}</option>`).join("");
  sel.onchange = () => {
    const p = pairs[+sel.value];
    if (!p || sel.value === "") return;
    $("pcA").value = p.a.toFixed(1);
    $("pcB").value = p.b.toFixed(1);
    renderPhaseCalc();
  };
}
function openPhaseCalc() {
  fillPairs();
  renderPhaseCalc();
}
["pcA", "pcB", "pcTemp"].forEach((id) => $(id).addEventListener("input", renderPhaseCalc));
