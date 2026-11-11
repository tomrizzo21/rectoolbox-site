/* Tool rail: the icon column on the far left that switches between tools (docs/UI_PLAN.md, option B).
   Each tool is a workspace: its own saved window layout (which windows are open and where).
   The Setup planner keeps the original layout key, so existing window layouts carry over.
   The rail can be expanded (icons and names) or collapsed to icons only; both choices are remembered.
   Loaded before app.js; app.js's loadDock()/saveDock() use toolDockKey() and toolDock0(), and initDock() calls initRail(). */
const ICON = {
  planner:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="10" r="1.6"/><circle cx="15" cy="9" r="1.6"/><circle cx="11" cy="15" r="1.6"/><path d="M8 10l3 5 4-6"/>',
  guide:
    '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
  inventory: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  micdb:
    '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  stageplot:
    '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3M8 10h8M8 14h8M8 18h5"/>',
  phase: '<path d="M2 12c2.5-6 5-6 7.5 0s5 6 7.5 0 3.5-4 5-2"/><path d="M2 12c2.5 6 5 6 7.5 0" opacity=".45"/>',
  room: '<path d="M3 20V9l9-5 9 5v11z"/><path d="M8 20v-6h8v6M3 9h18"/>',
  freq: '<path d="M3 20h18M5 16v-3M8 16V8M11 16V5M14 16v-6M17 16v-4M20 16v-2"/>',
  account: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  collapse: '<path d="M15 6l-6 6 6 6"/>',
  expand: '<path d="M9 6l6 6-6 6"/>',
};
/* wins: the windows each tool owns (its Window menu). center: where they open the first time. */
const TOOLS = {
  planner: {
    name: "Setup planner",
    tip: "Lay out sections, mics, cables and sound",
    wins: ["view", "layout", "mics", "cables", "sound", "inspector", "inventory", "playback", "waterfall", "dbchart", "reports", "console", "file", "help"], // Future improvements opens from the Help menu
  },
  guide: {
    name: "Mic techniques",
    tip: "3D guide to placing mics on each instrument",
    center: ["guide"],
    left: ["guideView"],
    wins: ["guide", "guideView", "help"],
  },
  inventory: {
    name: "Inventory",
    tip: "The gear you own",
    center: ["inventory", "gear"],
    wins: ["inventory", "gear", "help"],
  },
  stageplot: {
    name: "Stage plot",
    tip: "Printable stage plot, input list and gear pull list from your layout",
    center: ["stageplot"],
    wins: ["stageplot", "help"],
  },
  phase: {
    name: "Phase calculator",
    tip: "Time offset, comb filtering and the 3:1 rule for two mics on one source",
    center: ["phasecalc"],
    wins: ["phasecalc", "help"],
  },
  room: {
    name: "Room helper",
    tip: "Ring time, room modes and mic spots for a rectangular room",
    center: ["room"],
    wins: ["room", "help"],
  },
  freq: {
    name: "Frequency chart",
    tip: "Where each instrument's notes, overtones and other sounds sit",
    center: ["freqchart"],
    wins: ["freqchart", "help"],
  },
  micdb: { name: "Mic database", tip: "Search mic specs and add mics to your gear", center: ["micdb"], wins: ["micdb", "help"] },
};
/* The tool a window belongs to: the current one if it owns it, else the first that does. */
function toolOf(id) {
  if (TOOLS[TOOL].wins.includes(id)) return TOOL;
  return Object.keys(TOOLS).find((t) => TOOLS[t].wins.includes(id)) || TOOL;
}
/* Hide windows a tool doesn't own (e.g. inventory windows in an older planner layout). */
function fitDockToTool(o, t = TOOL) {
  const own = new Set(TOOLS[t].wins),
    out = [];
  const keep = (id) => (own.has(id) ? true : (out.push(id), false));
  for (const sd of ["left", "right", "bottom"]) o[sd] = o[sd].map((g) => g.filter(keep)).filter((g) => g.length);
  o.center = o.center.filter(keep);
  o.floats = o.floats.filter((f) => keep(f.id));
  for (const sd in o.auto) o.auto[sd] = o.auto[sd].filter(keep);
  o.hidden = [...new Set([...o.hidden, ...out])];
  return o;
}
const svgIcon = (k) =>
  `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

const railState = { collapsed: !!setting("rail.collapsed") };
let TOOL = TOOLS[setting("rail.tool")] ? setting("rail.tool") : "planner";
const saveRail = () => {
  settings.set("rail.tool", TOOL);
  settings.set("rail.collapsed", railState.collapsed);
};

function toolDockKey(t = TOOL) {
  return t === "planner" ? "rt-fh-dock-v1" : `rt-fh-dock-${t}-v1`;
}
/* Starting layout for a tool other than the planner: its windows as document tabs, everything else hidden. */
function toolDock0(t) {
  const center = TOOLS[t].center.slice(),
    left = (TOOLS[t].left || []).slice();
  return {
    left: left.length ? [left] : [],
    right: [],
    bottom: [],
    center,
    floats: [],
    hidden: Object.keys(WINS).filter((k) => !center.includes(k) && !left.includes(k)),
    auto: { left: [], right: [], bottom: [] },
    active: { center: center[0] },
    size: { left: 260, right: 330, bottom: 210 },
    last: {},
  };
}
/* A saved non-planner layout, with any window it doesn't mention added as hidden. */
function loadToolDock(t) {
  const o = store.getJSON(toolDockKey(t), null, "window layout");
  if (!o || !o.size || !o.center) return toolDock0(t);
  dropRetiredWindows(o);
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
  // A window the saved layout doesn't know (new or renamed) opens where the tool starts it, else stays hidden.
  for (const k in WINS)
    if (seen.has(k)) continue;
    else if (TOOLS[t].center.includes(k)) o.center.push(k);
    else if ((TOOLS[t].left || []).includes(k)) o.left.length ? o.left[0].push(k) : o.left.push([k]);
    else o.hidden.push(k);
  return o;
}

function switchTool(t) {
  if (!TOOLS[t] || t === TOOL) return;
  saveDock();
  TOOL = t;
  saveRail();
  DK = fitDockToTool(loadDock());
  applyTool();
  renderDock();
  if (TOOL === "planner") draw();
  if (TOOL === "stageplot") renderStagePlot();
  if (TOOL === "phase") openPhaseCalc();
  if (TOOL === "room") openRoom();
  if (TOOL === "freq") openFreqChart();
  status(TOOLS[t].name);
}
/* Show the planner-only menus and toolbar only in the planner, and mark the active rail button. */
function applyTool() {
  document.body.dataset.tool = TOOL;
  document.querySelectorAll("#rail [data-tool]").forEach((b) => {
    const on = b.dataset.tool === TOOL;
    b.classList.toggle("on", on);
    b.setAttribute("aria-current", on ? "page" : "false");
  });
  $("appTitle").textContent = TOOLS[TOOL].name;
  if (typeof files === "object") files.title(); // adds the open layout's name in the planner
}
function applyRailCollapsed() {
  const c = !!railState.collapsed,
    t = $("railToggle");
  $("rail").classList.toggle("collapsed", c);
  t.innerHTML = svgIcon(c ? "expand" : "collapse") + `<span class="rl">Collapse</span>`;
  t.title = c ? "Expand the tool bar" : "Collapse to icons";
  t.setAttribute("aria-expanded", String(!c));
  // The canvas and docks size themselves from the window; tell them the space changed.
  window.dispatchEvent(new Event("resize"));
}
function initRail() {
  const rail = $("rail");
  rail.innerHTML =
    `<div class="rtools">` +
    Object.entries(TOOLS)
      .map(
        ([k, x]) =>
          `<button data-tool="${k}" title="${x.name}: ${x.tip}">${svgIcon(k)}<span class="rl">${x.name}</span></button>`,
      )
      .join("") +
    `</div><button id="railAccount" class="rfoot">${svgIcon("account")}<span class="rl">Sign in</span></button><button id="railToggle" class="rfoot"></button>`;
  rail.querySelectorAll("[data-tool]").forEach((b) => (b.onclick = () => switchTool(b.dataset.tool)));
  $("railAccount").onclick = () => account.open(); // js/account.js
  $("railToggle").onclick = () => {
    railState.collapsed = !railState.collapsed;
    saveRail();
    applyRailCollapsed();
  };
  applyRailCollapsed();
  applyTool();
  if (TOOL === "stageplot") setTimeout(renderStagePlot, 0); // after the planner has routed once
  if (TOOL === "phase") setTimeout(openPhaseCalc, 0);
  if (TOOL === "room") setTimeout(openRoom, 0);
  if (TOOL === "freq") setTimeout(openFreqChart, 0);
}
