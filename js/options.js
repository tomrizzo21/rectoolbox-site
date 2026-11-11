/* Options dialog (Edit > Options…, Ctrl+,): set-once settings in a tree of pages with a search box, like Visual Studio's.
   The controls are the planner's own inputs moved here, so their existing handlers and saving keep working.
   openOptions(page, focusId) is also used by the command search (js/command.js). */
const optModal = $("optModal");
let optPage = "general";
function showOptPage(pid) {
  optPage = pid;
  $("optSearch").value = "";
  filterOptions();
}
function filterOptions() {
  const q = $("optSearch").value.trim().toLowerCase(),
    words = q.split(/\s+/).filter(Boolean);
  let any = false;
  optModal.querySelectorAll(".optPages section").forEach((sec) => {
    let hits = 0;
    sec.querySelectorAll(".optRow").forEach((r) => {
      const text = (r.textContent + " " + r.dataset.keys + " " + sec.dataset.title).toLowerCase(),
        ok = !words.length || words.every((w) => text.includes(w));
      r.hidden = !ok;
      if (ok) hits++;
    });
    // Without a search, show the chosen page; with one, every page that has a match.
    sec.hidden = words.length ? !hits : sec.dataset.page !== optPage;
    if (!sec.hidden) any = true;
  });
  $("optNone").hidden = any;
  optModal
    .querySelectorAll(".optTree [data-page]")
    .forEach((b) => b.classList.toggle("on", !words.length && b.dataset.page === optPage));
}
function openOptions(pid, focusId) {
  closeMenus();
  $("optRail").checked = !!railState.collapsed;
  showOptPage(pid || optPage);
  optModal.hidden = false;
  const f = focusId && $(focusId);
  (f || $("optSearch")).focus();
  if (f) f.closest(".optRow")?.classList.add("flash");
  setTimeout(() => optModal.querySelectorAll(".flash").forEach((n) => n.classList.remove("flash")), 1500);
}
function closeOptions() {
  optModal.hidden = true;
}
optModal.querySelectorAll(".optTree [data-page]").forEach((b) => (b.onclick = () => showOptPage(b.dataset.page)));
$("optSearch").oninput = filterOptions;
optModal.addEventListener("click", (e) => {
  if (e.target === optModal || e.target.closest("[data-optclose]")) closeOptions();
});
optModal.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.stopPropagation();
    closeOptions();
  }
});
$("optRail").onchange = () => {
  railState.collapsed = $("optRail").checked;
  saveRail();
  applyRailCollapsed();
};
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === ",") {
    e.preventDefault();
    optModal.hidden ? openOptions() : closeOptions();
  }
});
