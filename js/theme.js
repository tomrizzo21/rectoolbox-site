/* Colour themes (BACKLOG B-themes). Loaded in <head>, before the page draws, so it never flashes the wrong colours:
   it reads the saved choice straight from browser storage (settings.js isn't loaded yet). The palettes are in
   css/planner.css: :root (light), [data-theme="dark"], [data-theme="isu"], and "Match my computer" (no attribute),
   which follows the system's light/dark setting. Setting key "ui.theme": "auto" | "dark" | "light" | "isu". */
const theme = (() => {
  const NAMES = { auto: "Match my computer", dark: "Dark", light: "Light", isu: "Illinois State" };
  function saved() {
    try {
      const rec = JSON.parse(localStorage.getItem("rt-settings-v1") || "null");
      const t = rec && rec.user && rec.user["ui.theme"];
      return NAMES[t] ? t : "auto";
    } catch (e) {
      return "auto";
    }
  }
  function apply(t) {
    if (!NAMES[t]) t = "auto";
    if (t === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.dataset.theme = t;
  }
  apply(saved());
  /* Called from the Options dialog (and Ctrl+K): save, apply, and redraw what paints colours itself. */
  function set(t) {
    if (!NAMES[t]) return;
    settings.set("ui.theme", t);
    apply(t);
    const sel = document.getElementById("optTheme");
    if (sel) sel.value = t;
    window.dispatchEvent(new Event("rt:themechange"));
  }
  document.addEventListener("DOMContentLoaded", () => {
    const sel = document.getElementById("optTheme");
    if (!sel) return;
    sel.value = saved();
    sel.onchange = () => {
      set(sel.value);
      if (typeof status === "function") status(`Theme: ${NAMES[sel.value]}.`);
    };
  });
  return { set, apply, get current() { return saved(); }, NAMES };
})();
