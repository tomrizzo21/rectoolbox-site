/* Links to one page of the app (Tom, 2026-11-13: "send a link to a direct page"). Form: #guide/<instrument>[/<setup>],
   e.g. rectoolbox.net/#guide/Kobayashi%20Maru. Opening such a link shows Mic techniques on that instrument and setup;
   the "Copy link" button in the guide makes one. Sign-in's own #access_token=… returns are left alone. */
(function () {
  const $ = (id) => document.getElementById(id);
  function guideLink() {
    const i = $("mgInstrument").value, t = $("mgTechnique").value;
    return location.origin + location.pathname + "#guide/" + encodeURIComponent(i) + (+t ? "/" + t : "");
  }
  async function open(hash) {
    const m = /^#guide\/([^/]+)(?:\/(\d+))?$/.exec(hash);
    if (!m) return;
    const name = decodeURIComponent(m[1]);
    showWin("guide");
    for (let n = 0; n < 200 && !$("mgInstrument").options.length; n++) await new Promise((r) => setTimeout(r, 100));
    const fam = $("mgFamily");
    if (fam && fam.value !== "all") { fam.value = "all"; fam.dispatchEvent(new Event("change", { bubbles: true })); }
    if (![...$("mgInstrument").options].some((o) => o.value === name)) return;
    $("mgInstrument").value = name;
    $("mgInstrument").dispatchEvent(new Event("change", { bubbles: true }));
    if (m[2] && $("mgTechnique").options[+m[2]]) { $("mgTechnique").value = m[2]; $("mgTechnique").dispatchEvent(new Event("change", { bubbles: true })); }
  }
  function addButton() {
    const sel = $("mgTechnique");
    if (!sel || $("mgCopyLink")) return;
    const b = document.createElement("button");
    b.id = "mgCopyLink"; b.type = "button"; b.textContent = "🔗 Copy link"; b.title = "Copy a link that opens this instrument and setup";
    b.onclick = async () => {
      const url = guideLink();
      try { await navigator.clipboard.writeText(url); b.textContent = "✓ Link copied"; } catch (e) { prompt("Copy this link:", url); }
      setTimeout(() => (b.textContent = "🔗 Copy link"), 1800);
    };
    sel.closest("label").after(b);
  }
  window.GUIDE_LINK_FOR_TEST = guideLink;
  addEventListener("hashchange", () => open(location.hash));
  addEventListener("load", () => { addButton(); open(location.hash); });
})();
