/* Command search (Ctrl+K, or the Search box in the menu bar): finds any command, window, tool or setting by name and
   runs or opens it. The list is built fresh each time it opens, from the page itself (menus, toolbar, windows, the
   Options dialog), so anything added to those shows up here without being registered.
   Each entry: { label, where, keys, run, state }. */
const cmdBox = $("cmdModal"),
  cmdInput = $("cmdQ"),
  cmdList = $("cmdList");
let cmdItems = [],
  cmdShown = [],
  cmdPick = 0;

const cleanText = (n) => {
  const c = n.cloneNode(true);
  c.querySelectorAll(".sc, select, option").forEach((x) => x.remove());
  return c.textContent.replace(/\s+/g, " ").trim();
};
/* The words a person would use for a form control: its label, else the row's label, else aria-label. */
function controlLabel(el) {
  const lab = el.closest("label");
  let t = lab ? cleanText(lab) : "";
  if (!t) t = el.closest(".optRow")?.querySelector(".optLbl")?.textContent || "";
  if (!t) t = el.getAttribute("aria-label") || el.title || "";
  if (!t && el.tagName === "BUTTON") t = cleanText(el);
  return t.replace(/\s+/g, " ").trim();
}
function inPlanner(fn) {
  return () => {
    if (TOOL !== "planner") switchTool("planner");
    fn();
  };
}
/* Open the window holding el and point at it. */
function revealControl(win, el) {
  showWin(win);
  requestAnimationFrame(() => {
    el.scrollIntoView({ block: "center" });
    el.focus();
    const row = el.closest(".row, .optRow, label") || el;
    row.classList.add("flash");
    setTimeout(() => row.classList.remove("flash"), 1500);
  });
}
function buildCommands() {
  const items = [],
    seen = new Set();
  const add = (label, where, run, extra = {}) => {
    const key = where + "|" + label;
    if (!label || seen.has(key)) return;
    seen.add(key);
    items.push({ label, where, run, keys: extra.keys || "", state: extra.state });
  };
  // Tools on the rail
  for (const [k, x] of Object.entries(TOOLS)) add(x.name, "Tool", () => switchTool(k), { keys: "go to switch " + x.tip });
  // Menu commands (window items are listed as windows below)
  document.querySelectorAll("#menubar .menu").forEach((m) => {
    const menu = m.querySelector(".mt").textContent.trim(),
      planner = m.hasAttribute("data-planner-only");
    m.querySelectorAll(".dd button").forEach((b) => {
      if (b.dataset.act && b.dataset.act.startsWith("toggle:")) return;
      const run = () => b.click(),
        state = b.dataset.check ? () => $(b.dataset.check).checked : null;
      add(cleanText(b), menu, planner ? inPlanner(run) : run, { state, keys: b.title });
    });
  });
  // Toolbar drop-downs (heatmap, background): one entry per choice, e.g. "Background: Stage"
  document.querySelectorAll("#toolbar select").forEach((sel) =>
    [...sel.options].forEach((o) =>
      add(
        controlLabel(sel) + ": " + o.text,
        "Toolbar",
        inPlanner(() => {
          sel.value = o.value;
          sel.dispatchEvent(new Event("change"));
        }),
        { keys: sel.id === "heatQ" ? "sound map" : "" },
      ),
    ),
  );
  document.querySelectorAll("#toolbar button").forEach((b) => {
    if (b.classList.contains("mt") || b.closest(".dd")) return;
    if (b.dataset.check && document.querySelector(`#menubar [data-check="${b.dataset.check}"]`)) return; // listed under its menu
    const label = b.id === "smartRun" ? "Run smart route (" + SMART_NAMES[setting("smartRoute.mode")] + ")" : cleanText(b);
    add(label, "Toolbar", inPlanner(() => b.click()), {
      keys: b.title,
      state: b.dataset.check ? () => $(b.dataset.check).checked : null,
    });
  });
  // Windows
  for (const [k, name] of Object.entries(WINS)) add(name, "Window", () => showWin(k), { keys: "open show window panel" });
  // Every labelled control inside a window
  document.querySelectorAll(".wc[data-win]").forEach((w) => {
    const win = w.dataset.win,
      wname = WINS[win];
    if (!wname) return;
    w.querySelectorAll("input, select, button").forEach((el) => {
      if (el.type === "hidden" || el.closest("[hidden]:not(#wins)") || el.closest("#dbBody, table")) return;
      const label = controlLabel(el);
      if (!label || label.length < 3 || /^[−+✕ⓘ⟲⟳▦◩]$/.test(label)) return;
      const toggle = el.type === "checkbox";
      // Checkboxes toggle in place; buttons open their window and run; other fields open their window and get focus.
      const run = toggle
        ? () => el.click()
        : el.tagName === "BUTTON"
          ? () => {
              showWin(win);
              el.click();
            }
          : () => revealControl(win, el);
      add(label, wname, run, {
        state: toggle ? () => el.checked : null,
        keys: win === "view" ? "show hide view" : "",
      });
    });
  });
  // Options dialog
  document.querySelectorAll("#optModal section").forEach((sec) =>
    sec.querySelectorAll(".optRow").forEach((r) => {
      const ctl = r.querySelector("input, select, button");
      add(r.querySelector(".optLbl").textContent, "Options › " + sec.dataset.title, () => openOptions(sec.dataset.page, ctl && ctl.id), {
        keys: "options settings preferences " + r.dataset.keys + " " + cleanText(r),
      });
    }),
  );
  add("Options", "Edit", () => openOptions(), { keys: "settings preferences" });
  // Mic techniques notes (js/guide.js): open the guide and unfold the section
  for (const [id, label, keys] of [
    ["src", "Where the sound comes from", "sound source radiation bell body instrument notes"],
    ["acc", "Accessories for this instrument", "pad windscreen pop filter clip shock mount notes"],
    ["proc", "Processing starting points", "eq compressor gate de-esser reverb plugin settings mix live notes"],
  ])
    add(
      label,
      "Mic techniques",
      () => {
        if (TOOL !== "guide") switchTool("guide");
        requestAnimationFrame(() => {
          const d = document.querySelector(`#mgNotes details[data-notes="${id}"]`);
          if (!d) return;
          d.open = true;
          d.scrollIntoView({ block: "start" });
        });
      },
      { keys },
    );
  return items;
}
function scoreCommand(it, words, q) {
  const label = it.label.toLowerCase(),
    all = (label + " " + it.where + " " + it.keys).toLowerCase();
  if (!words.every((w) => all.includes(w))) return -1;
  if (label.startsWith(q)) return 3;
  if (words.every((w) => label.includes(w))) return 2;
  return 1;
}
function renderCommands() {
  const q = cmdInput.value.trim().toLowerCase(),
    words = q.split(/\s+/).filter(Boolean);
  cmdShown = cmdItems
    .map((it, i) => ({ it, i, s: words.length ? scoreCommand(it, words, q) : 0 }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, 14)
    .map((x) => x.it);
  cmdPick = Math.min(cmdPick, Math.max(0, cmdShown.length - 1));
  cmdList.innerHTML = cmdShown.length
    ? cmdShown
        .map((it, i) => {
          const st_ = it.state ? (it.state() ? " · on" : " · off") : "";
          return `<li role="option" id="cmd${i}" data-i="${i}" aria-selected="${i === cmdPick}" class="${i === cmdPick ? "on" : ""}"><span>${esc(it.label)}</span><span class="m">${esc(it.where)}${st_}</span></li>`;
        })
        .join("")
    : `<li class="m">Nothing matches "${esc(cmdInput.value)}".</li>`;
  cmdInput.setAttribute("aria-activedescendant", cmdShown.length ? "cmd" + cmdPick : "");
}
function runCommand(i) {
  const it = cmdShown[i];
  if (!it) return;
  closeCommands();
  it.run();
  status(it.where + ": " + it.label);
}
function openCommands() {
  closeMenus();
  cmdItems = buildCommands();
  cmdInput.value = "";
  cmdPick = 0;
  renderCommands();
  cmdBox.hidden = false;
  cmdInput.focus();
}
function closeCommands() {
  cmdBox.hidden = true;
}
cmdInput.oninput = () => {
  cmdPick = 0;
  renderCommands();
};
cmdInput.onkeydown = (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const n = cmdShown.length;
    if (n) cmdPick = (cmdPick + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
    renderCommands();
    $("cmd" + cmdPick)?.scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    e.preventDefault();
    runCommand(cmdPick);
  } else if (e.key === "Escape") {
    e.stopPropagation();
    closeCommands();
  }
};
cmdList.onclick = (e) => {
  const li = e.target.closest("[data-i]");
  if (li) runCommand(+li.dataset.i);
};
cmdBox.addEventListener("click", (e) => {
  if (e.target === cmdBox) closeCommands();
});
$("cmdOpen").onclick = openCommands;
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    cmdBox.hidden ? openCommands() : closeCommands();
  }
});
