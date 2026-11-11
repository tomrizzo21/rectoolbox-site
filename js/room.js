/* Room helper tool: room size and the material of each wall, floor and ceiling (or no wall at all) → ring time (RT60,
   Sabine), low-frequency room modes (axial, tangential, oblique up to 300 Hz), the Schroeder frequency below which those
   modes rule, clusters that boom and gaps that leave notes thin. On a stage layout it also checks where the mics sit
   (walls, corners, the room's centre lines). Textbook estimates for a rectangular room. */

/* Absorption coefficients, roughly the 500 Hz–1 kHz average of published Sabine tables. "open" = no wall. */
const ROOM_MATERIALS = {
  open: { name: "No wall (open)", a: 1 },
  concrete: { name: "Concrete or block, painted", a: 0.02 },
  brick: { name: "Brick", a: 0.03 },
  drywall: { name: "Drywall", a: 0.05 },
  glass: { name: "Glass or windows", a: 0.04 },
  wood: { name: "Wood panelling or stage floor", a: 0.1 },
  tile: { name: "Tile or vinyl on concrete", a: 0.03 },
  carpet: { name: "Carpet", a: 0.3 },
  curtain: { name: "Heavy curtains", a: 0.5 },
  ceilingTile: { name: "Acoustic ceiling tile", a: 0.6 },
  panels: { name: "Acoustic panels (2 in)", a: 0.8 },
};
/* The six surfaces. Length runs front → back (on a stage layout, front = the audience edge); width runs left → right. */
const ROOM_SIDES = [
  ["front", "Front wall"],
  ["back", "Back wall"],
  ["left", "Left wall"],
  ["right", "Right wall"],
  ["floor", "Floor"],
  ["ceiling", "Ceiling"],
];
/* "Set all surfaces to…" presets. */
const ROOM_PRESETS = {
  hard: { name: "Hard (gym, fieldhouse)", all: "concrete", floor: "wood", ceiling: "concrete" },
  band: { name: "Typical band room", all: "drywall", back: "panels", floor: "tile", ceiling: "ceilingTile" },
  class: { name: "Classroom", all: "drywall", floor: "carpet", ceiling: "ceilingTile" },
  treated: { name: "Treated studio", all: "panels", floor: "wood", ceiling: "panels" },
  shell: { name: "Band shell, open front", all: "wood", front: "open", ceiling: "wood", floor: "wood" },
  outdoors: { name: "Outdoors (floor only)", all: "open", floor: "concrete", ceiling: "open" },
};
const C_FT = 1129; // speed of sound, ft/s at about 70 °F

/* open: which axes have a missing wall. A mode needs two facing surfaces, so none form along an open axis. */
function roomModes(L, W, H, open = {}, maxF = 300) {
  const out = [],
    n = (closed) => (closed ? 8 : 0);
  for (let p = 0; p <= n(!open.L); p++)
    for (let q = 0; q <= n(!open.W); q++)
      for (let r = 0; r <= n(!open.H); r++) {
        if (!p && !q && !r) continue;
        const f = (C_FT / 2) * Math.hypot(p / L, q / W, r / H);
        if (f > maxF) continue;
        const zeros = [p, q, r].filter((k) => !k).length;
        out.push({ f, p, q, r, kind: zeros === 2 ? "axial" : zeros === 1 ? "tangential" : "oblique" });
      }
  return out.sort((a, b) => a.f - b.f);
}
/* surf: { front: "drywall", ... } material keys, or one absorption number for every surface (used by the tests). */
function roomNumbers(L, W, H, surf, people) {
  const a = (side) => (typeof surf === "number" ? surf : (ROOM_MATERIALS[surf[side]] || ROOM_MATERIALS.drywall).a),
    isOpen = (side) => typeof surf !== "number" && surf[side] === "open",
    area = { front: W * H, back: W * H, left: L * H, right: L * H, floor: L * W, ceiling: L * W },
    V = L * W * H,
    S = Object.values(area).reduce((x, y) => x + y, 0),
    A = ROOM_SIDES.reduce((sum, [k]) => sum + area[k] * a(k), 0) + people * 5, // sabins (ft²); ~5 per person
    rt = (0.049 * V) / A,
    schroeder = 2000 * Math.sqrt(rt / (V * 0.0283168)),
    open = { L: isOpen("front") || isOpen("back"), W: isOpen("left") || isOpen("right"), H: isOpen("floor") || isOpen("ceiling") },
    openSides = ROOM_SIDES.filter(([k]) => isOpen(k)).map(([, name]) => name),
    modes = roomModes(L, W, H, open),
    // Below ~30 Hz there is little musical energy, so clusters and gaps are only looked for above it.
    axial = modes.filter((m) => m.kind === "axial" && m.f >= 30 && m.f <= Math.max(schroeder, 120)),
    clusters = [],
    gaps = [];
  for (let i = 1; i < axial.length; i++) {
    const x = axial[i - 1],
      y = axial[i];
    if (y.f / x.f < 1.05) clusters.push([x, y]);
    else if (y.f / x.f > 1.25 && x.f < schroeder) gaps.push([x, y]);
  }
  return { V, S, A, rt, schroeder, modes, clusters, gaps, open, openSides, openArea: ROOM_SIDES.filter(([k]) => isOpen(k)).reduce((s, [k]) => s + area[k], 0) };
}
const modeName = (m) => `${m.f.toFixed(0)} Hz (${m.p},${m.q},${m.r})`;

/* Chart up to twice the Schroeder frequency (120–300 Hz); oblique modes only below Schroeder, where they matter. */
function modeChart(n) {
  const top = Math.min(300, Math.max(120, 2 * n.schroeder)),
    W = 640,
    H = 120,
    x = (f) => ((Math.log10(f) - Math.log10(20)) / (Math.log10(top) - Math.log10(20))) * W;
  let g = "";
  for (const f of [20, 30, 50, 80, 100, 150, 200, 300].filter((f) => f <= top))
    g += `<line x1="${x(f)}" x2="${x(f)}" y1="0" y2="${H - 14}" class="pcGrid"/><text x="${x(f) + 2}" y="${H - 3}" class="pcAx">${f} Hz</text>`;
  const ht = { axial: 90, tangential: 60, oblique: 35 };
  for (const m of n.modes)
    if (m.f >= 20 && m.f <= top && (m.kind !== "oblique" || m.f <= n.schroeder))
      g += `<line x1="${x(m.f)}" x2="${x(m.f)}" y1="${H - 14}" y2="${H - 14 - ht[m.kind]}" class="rmMode rm-${m.kind}"/>`;
  if (n.schroeder <= top)
    g += `<line x1="${x(n.schroeder)}" x2="${x(n.schroeder)}" y1="0" y2="${H - 14}" class="rmSch"/><text x="${x(n.schroeder) + 3}" y="11" class="pcAx">Schroeder ${n.schroeder.toFixed(0)} Hz</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="pcGraph" role="img" aria-label="Room modes from 20 to ${top.toFixed(0)} Hz: tall lines axial, medium tangential, short oblique">${g}</svg>`;
}

/* Mic positions against the room walls that exist. Assumes the stage background's edges are the room's walls. */
function roomMicChecks(L, W, n, surf) {
  const B = bgDims();
  if (B.type !== "stage" && B.type !== "grid")
    return `<p class="m">Mic placement checks work on a Stage or Floor grid background (the walls are taken as its edges). Switch the background in the Setup planner to use them.</p>`;
  const v0 = B.type === "stage" ? B.front : 0,
    wall = (k) => surf[k] !== "open",
    // The centre line between two walls is a null for that axis's odd-order modes; name the ones in musical range.
    odd = (axis) =>
      n.modes
        .filter((m) => m.kind === "axial" && m[axis] % 2 === 1 && m.f >= 30 && m.f <= 200)
        .slice(0, 3)
        .map((m) => m.f.toFixed(0) + " Hz"),
    oddL = odd("p"),
    oddW = odd("q"),
    rows = [];
  for (const m of st.mics) {
    const p = micPos(m),
      x = p.v - v0,
      y = p.u,
      notes = [];
    if (x < 0 || x > L || y < 0 || y > W) continue;
    const d = { front: x, back: L - x, left: y, right: W - y },
      near = Object.entries(d).filter(([k, v]) => wall(k) && v < 3),
      closest = Object.entries(d)
        .filter(([k]) => wall(k))
        .sort((a, b) => a[1] - b[1])[0];
    const corner = near.some(([k]) => k === "front" || k === "back") && near.some(([k]) => k === "left" || k === "right");
    if (corner) notes.push("in a corner: low end piles up (up to about +12 dB)");
    else if (closest && closest[1] < 2)
      notes.push(`against the ${closest[0]} wall (${closest[1].toFixed(1)} ft): bass boost and an early reflection`);
    if (!n.open.L && Math.abs(x - L / 2) < 1 && oddL.length) notes.push(`halfway along the length: ${oddL.join(", ")} cancel here, so those notes sound thin`);
    if (!n.open.W && Math.abs(y - W / 2) < 1 && oddW.length) notes.push(`halfway across the width: ${oddW.join(", ")} cancel here`);
    if (notes.length) rows.push(`<li><b>${esc(micName(m))}</b>: ${notes.join("; ")}</li>`);
  }
  return rows.length ? `<ul>${rows.join("")}</ul>` : `<p class="ok">No mic sits against a wall, in a corner or on a centre line.</p>`;
}

const roomSurf = () => Object.fromEntries(ROOM_SIDES.map(([k]) => [k, $("rm_" + k).value]));
function renderRoom() {
  const L = +$("rmL").value,
    W = +$("rmW").value,
    H = +$("rmH").value,
    surf = roomSurf(),
    people = Math.max(0, +$("rmPeople").value || 0),
    out = $("rmOut");
  if (!(L >= 6 && W >= 6 && H >= 6)) {
    out.innerHTML = `<p class="err">Enter length, width and height in feet (6 ft or more).</p>`;
    return;
  }
  settings.set("room.size", [L, W, H]);
  settings.set("room.surfaces", surf);
  settings.set("room.people", people);
  const n = roomNumbers(L, W, H, surf, people),
    mostlyOpen = n.openArea > n.S / 2,
    ring = n.rt < 0.6 ? "dry" : n.rt < 1.2 ? "lively" : n.rt < 2 ? "reverberant" : "very reverberant",
    axial = n.modes.filter((m) => m.kind === "axial").slice(0, 8),
    low = n.modes[0];
  out.innerHTML = `<div class="cards">
     <div class="card"><span class="m">Ring time (RT60)</span><b>${mostlyOpen ? "–" : n.rt.toFixed(2) + " s"}</b><span class="m">${mostlyOpen ? "mostly open: little room sound" : ring}</span></div>
     <div class="card"><span class="m">Modes rule below</span><b>${low ? n.schroeder.toFixed(0) + " Hz" : "–"}</b><span class="m">Schroeder frequency</span></div>
     <div class="card"><span class="m">Lowest resonance</span><b>${low ? low.f.toFixed(0) + " Hz" : "none"}</b><span class="m">${low ? `${low.kind}, along the ${low.p ? "length" : low.q ? "width" : "height"}` : "no pair of facing surfaces"}</span></div>
     <div class="card"><span class="m">Volume</span><b>${Math.round(n.V).toLocaleString()} ft³</b><span class="m">${Math.round(n.V * 0.0283168)} m³</span></div></div>
   ${low ? modeChart(n) : ""}
   ${low ? `<p class="m">Tall lines: axial modes (strongest, between two facing surfaces). Medium: tangential. Short: oblique.</p>` : ""}
   <h4>What to listen for</h4><ul>
   ${n.openSides.length ? `<li>Open: ${n.openSides.join(", ").toLowerCase()}. No resonances build up ${[n.open.L && "along the length", n.open.W && "across the width", n.open.H && "floor to ceiling"].filter(Boolean).join(" or ")}, and sound escapes there.</li>` : ""}
   ${axial.length ? `<li>Lowest axial modes: ${axial.map(modeName).join(", ")}.</li>` : ""}
   ${n.clusters.length ? `<li class="warn">Booms: modes bunch up at ${[...new Set(n.clusters.map(([a, b]) => (Math.round(a.f) === Math.round(b.f) ? `${a.f.toFixed(0)} Hz` : `${a.f.toFixed(0)}–${b.f.toFixed(0)} Hz`)))].join(", ")}; notes there ring longer and louder. Room dimensions that share a ratio cause this.</li>` : axial.length ? `<li class="ok">No two axial modes land on top of each other above 30 Hz.</li>` : ""}
   ${n.gaps.length ? `<li>Thin spots: few modes between ${n.gaps.map(([a, b]) => `${a.f.toFixed(0)} and ${b.f.toFixed(0)} Hz`).join(", ")}; notes in those gaps can sound weaker in the room.</li>` : ""}
   <li>${mostlyOpen ? "Mostly open: the room adds little, so mics can sit further back; wind and outside noise matter more." : n.rt > 1.5 ? "Long ring time: put mics closer to the sources, use more directional patterns and point their dead side at the room." : n.rt < 0.5 ? "Dry room: you can back mics off for a more natural blend." : "Moderate ring time: normal close and section mic distances work."}</li></ul>
   <h4>Mics in this room</h4>${roomMicChecks(L, W, n, surf)}
   <p class="m">Textbook estimate for a rectangular room (Sabine, materials averaged around 500 Hz–1 kHz). Openings, risers, curtains and an audience change it${n.openSides.length ? "; with open sides the ring time is only a rough guide" : ""}.</p>`;
}
function applyRoomPreset(key) {
  const p = ROOM_PRESETS[key];
  if (!p) return;
  for (const [k] of ROOM_SIDES) $("rm_" + k).value = p[k] || p.all;
  renderRoom();
}
function fillRoomFromStage() {
  const B = bgDims();
  if (B.type !== "stage" && B.type !== "grid") {
    status("Switch the Setup planner background to Stage or Floor grid first.");
    return;
  }
  $("rmL").value = B.d;
  $("rmW").value = B.w;
  renderRoom();
}
function openRoom() {
  const [L, W, H] = setting("room.size") || [40, 30, 16],
    saved = setting("room.surfaces"),
    old = setting("room.surface"); // before per-surface materials: one preset for the room
  $("rmL").value = L;
  $("rmW").value = W;
  $("rmH").value = H;
  $("rmPeople").value = setting("room.people") || 0;
  if (saved) for (const [k] of ROOM_SIDES) $("rm_" + k).value = ROOM_MATERIALS[saved[k]] ? saved[k] : "drywall";
  else applyRoomPreset(ROOM_PRESETS[old] ? old : "band");
  renderRoom();
}
/* Build the six material pickers and the preset picker. */
(() => {
  const opts = Object.entries(ROOM_MATERIALS)
    .map(([k, m]) => `<option value="${k}">${m.name}</option>`)
    .join("");
  $("rmSides").innerHTML = ROOM_SIDES.map(
    ([k, name]) =>
      `<label class="m rmSide">${name} <select id="rm_${k}" aria-label="${name} material">${opts}</select></label>`,
  ).join("");
  $("rmPreset").innerHTML =
    `<option value="">Set all surfaces to…</option>` +
    Object.entries(ROOM_PRESETS)
      .map(([k, p]) => `<option value="${k}">${p.name}</option>`)
      .join("");
  $("rmPreset").onchange = () => {
    applyRoomPreset($("rmPreset").value);
    $("rmPreset").value = "";
  };
  ["rmL", "rmW", "rmH", "rmPeople", ...ROOM_SIDES.map(([k]) => "rm_" + k)].forEach((id) =>
    $(id).addEventListener("input", renderRoom),
  );
  $("rmFromStage").onclick = fillRoomFromStage;
})();
