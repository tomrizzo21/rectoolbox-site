/* File › Open… (Ctrl+O), Save (Ctrl+S), Save as… (Ctrl+Shift+S): named layouts.
   Signed in, they live in your account (Supabase table "layouts", docs/ACCOUNTS_PLAN.md phase 2); signed out, in this
   browser's saved-layout library (the same one as the Layout file window). The working layout keeps saving itself to
   the browser as before; "Save" puts a named copy where you can open it again, on any device when signed in.
   The window title shows the open layout's name, with • when it has changes not yet saved.
   A save carries the version the layout had when it was opened, so a stale browser can't overwrite a newer save.
   Shared with a team (js/team.js, phase 3), a layout shows in every member's Open list; they can open, save and
   rename it, and only its owner can delete it or stop sharing it. */
const files = (() => {
  const DOC_KEY = "rt-current-layout"; // { where: "account" | "browser", id, name, version, saved: JSON of st at save }
  let doc = store.getJSON(DOC_KEY, null, "current layout");
  const box = () => $("fileModal"),
    say = (t) => ($("fileMsg").textContent = t || ""),
    signedIn = () => !!account.user,
    setDoc = (d) => {
      doc = d;
      d ? store.setJSON(DOC_KEY, d) : store.remove(DOC_KEY);
      title();
    },
    dirty = () => !!doc && doc.saved !== JSON.stringify(st),
    when = (iso) => (iso ? new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "");

  /* ---------- title ---------- */
  function title() {
    const t = $("appTitle"),
      tool = TOOLS[TOOL].name;
    if (!t) return;
    const name = doc && TOOL === "planner" ? `${doc.name}${dirty() ? " •" : ""}` : "";
    t.textContent = name ? `${tool} · ${name}` : tool;
    t.title = doc ? `${doc.name} — saved ${doc.where === "account" ? "in your account" : "in this browser"}${dirty() ? "; has unsaved changes" : ""}` : "";
    document.title = doc ? `${doc.name}${dirty() ? " •" : ""} — Rec Toolbox` : "Rec Toolbox";
  }

  /* ---------- the browser's library (layoutSnapshots in app.js) ---------- */
  function browserSave(name, id) {
    const list = layoutSnapshots(),
      ex = id && list.find((x) => x.id === id);
    if (ex) {
      ex.state = clone(st);
      ex.name = name;
      ex.updatedAt = new Date().toISOString();
      localStorage.setItem(LAYOUT_SNAPSHOTS_KEY, JSON.stringify(list));
      return ex;
    }
    return saveLayoutSnapshot(name);
  }

  /* ---------- the account ---------- */
  // Note: Supabase query builders are "thenable", so never return one from an async function or await it before
  // calling .insert()/.update() on it: that would run it. Get the client, then build the query.
  const cl = () => account.client();
  async function accountList() {
    const { data, error } = await (await cl()).from("layouts").select("id,name,updated_at,version,owner,team_id").is("deleted_at", null).order("updated_at", { ascending: false });
    if (error) throw Error(error.message);
    return data || [];
  }
  /* mode: "update" (only if nobody saved since we opened it), "overwrite" (regardless), "new" (a new layout). */
  async function accountSave(name, mode, teamId = null) {
    const data = JSON.parse(JSON.stringify(st));
    if (mode !== "new") {
      let q = (await cl()).from("layouts").update({ name, data }).eq("id", doc.id);
      if (mode === "update") q = q.eq("version", doc.version);
      const r = await q.select("version");
      if (r.error) throw Error(r.error.message);
      if (!r.data || !r.data.length) return "conflict";
      return { id: doc.id, version: r.data[0].version };
    }
    const r = await (await cl()).from("layouts").insert({ name, data, team_id: teamId }).select("id,version").single();
    if (r.error) throw Error(r.error.message);
    return r.data;
  }

  /* ---------- Save / Save as ---------- */
  async function save(asName, opts = {}) {
    const name = (asName ?? doc?.name ?? "").trim();
    if (!name) return saveAs();
    try {
      // Signed in, a new layout or one opened from the account saves to the account; one opened from this
      // browser's library keeps saving there (Save as… moves it to the account).
      if (signedIn() && (!doc || doc.where === "account" || opts.asNew)) {
        const mode = opts.asNew || !doc || doc.where !== "account" ? "new" : opts.overwrite ? "overwrite" : "update";
        const r = await accountSave(name, mode, opts.team || null);
        if (r === "conflict") return conflict(name);
        setDoc({ where: "account", id: r.id, name, version: r.version, saved: JSON.stringify(st) });
        status(`Saved “${name}” to your account.`);
      } else {
        const snap = browserSave(name, !opts.asNew && doc?.where === "browser" ? doc.id : null);
        setDoc({ where: "browser", id: snap.id, name, version: 0, saved: JSON.stringify(st) });
        status(`Saved “${name}” in this browser.${signedIn() ? "" : " Sign in to keep layouts in your account."}`);
      }
      close();
    } catch (e) {
      open("Save");
      say("Not saved: " + e.message);
    }
  }
  function saveAs() {
    open("Save as");
    const where = signedIn() ? "your account" : "this browser";
    $("fileBody").innerHTML = `<div class="row"><label class="m" style="flex:1">Name <input id="fileName" maxlength="120" style="max-width:none;width:100%" aria-label="Layout name"></label></div>
      ${shareChoice()}
      <p class="m">Saves the current layout to ${where}.${signedIn() ? "" : " <button class='hb' data-file='signin'>Sign in</button> to keep layouts in your account and open them on other devices."}</p>
      <div class="row"><button data-file="doSaveAs">Save</button><button data-fileclose>Cancel</button></div>`;
    $("fileName").value = doc ? doc.name + (doc.where === "account" || doc.where === "browser" ? " (copy)" : "") : "";
    $("fileName").focus();
    $("fileName").select();
  }
  const myTeams = () => (signedIn() && typeof team === "object" ? team.teams() : []);
  function shareChoice() {
    const ts = myTeams();
    if (!ts.length) return "";
    return `<div class="row"><label class="m">Share with <select id="fileTeam" aria-label="Share with"><option value="">Just me</option>${ts.map((t) => `<option value="${esc(t.id)}">Team “${esc(t.name)}”</option>`).join("")}</select></label></div>`;
  }
  function conflict(name) {
    open("Save");
    $("fileBody").innerHTML = `<p class="warn">“${esc(name)}” was changed somewhere else (another browser or device) since you opened it.</p>
      <div class="row"><button data-file="saveCopy">Save mine as a copy</button><button data-file="overwrite">Replace theirs with mine</button><button data-fileclose>Cancel</button></div>`;
  }

  /* ---------- Open ---------- */
  async function openList() {
    open("Open");
    const body = $("fileBody");
    body.innerHTML = `<p class="m">Loading…</p>`;
    let html = "";
    if (signedIn()) {
      try {
        const rows = await accountList(),
          me = account.user.id,
          ts = myTeams(),
          tName = (id) => ts.find((t) => t.id === id)?.name || "a team",
          mine = rows.filter((r) => r.owner === me),
          theirs = rows.filter((r) => r.owner !== me),
          share = (r) =>
            ts.length
              ? `<select data-fileshare aria-label="Share ${esc(r.name)} with"><option value="">Just me</option>${ts.map((t) => `<option value="${esc(t.id)}" ${t.id === r.team_id ? "selected" : ""}>Team “${esc(t.name)}”</option>`).join("")}</select>`
              : r.team_id ? `<span class="badge">shared</span>` : "";
        html += `<h4>In your account</h4>` + (mine.length
          ? `<table class="fileList">${mine.map((r) => `<tr data-id="${esc(r.id)}"><td><b>${esc(r.name)}</b><br><span class="m">${when(r.updated_at)}</span></td><td class="fileBtns">${share(r)}<button data-file="openAccount">Open</button><button data-file="rename">Rename</button><button data-file="remove" class="danger">Delete</button></td></tr>`).join("")}</table>`
          : `<p class="m">Nothing saved to your account yet. Use File › Save.</p>`);
        if (theirs.length)
          html += `<h4>Shared with you</h4><table class="fileList">${theirs.map((r) => `<tr data-id="${esc(r.id)}"><td><b>${esc(r.name)}</b><br><span class="m">${esc(team.nameOf(r.owner) || "A teammate")} · team “${esc(tName(r.team_id))}” · ${when(r.updated_at)}</span></td><td class="fileBtns"><button data-file="openAccount">Open</button><button data-file="rename">Rename</button></td></tr>`).join("")}</table>`;
      } catch (e) {
        html += `<h4>In your account</h4><p class="warn">Couldn't load your layouts: ${esc(e.message)}</p>`;
      }
    } else html += `<p class="m"><button class="hb" data-file="signin">Sign in</button> to keep layouts in your account and open them on any device.</p>`;
    let snaps = [];
    try {
      snaps = layoutSnapshots();
    } catch (e) {
      /* unreadable library: shown as empty; the Layout file window explains */
    }
    html += `<h4>In this browser</h4>` + (snaps.length
      ? `<table class="fileList">${snaps.slice().reverse().map((s) => `<tr data-snap="${esc(s.id)}"><td><b>${esc(s.name)}</b><br><span class="m">${when(s.updatedAt || s.createdAt)}</span></td><td class="fileBtns"><button data-file="openBrowser">Open</button></td></tr>`).join("")}</table>`
      : `<p class="m">No layouts saved in this browser.</p>`);
    body.innerHTML = html;
  }
  /* If the current layout has unsaved changes, ask first. Resolves true to go ahead. */
  function okToLeave() {
    if (!dirty()) return Promise.resolve(true);
    return new Promise((done) => {
      const q = $("fileAsk");
      q.hidden = false;
      q.innerHTML = `<p>Save the changes to “${esc(doc.name)}” first?</p><div class="row"><button data-ans="save">Save</button><button data-ans="discard">Don't save</button><button data-ans="cancel">Cancel</button></div>`;
      q.onclick = async (e) => {
        const a = e.target.closest("[data-ans]")?.dataset.ans;
        if (!a) return;
        q.hidden = true;
        if (a === "save") await save();
        done(a !== "cancel");
      };
    });
  }
  function load(state, d) {
    applyLayout(JSON.stringify(state)); // replaces the working layout
    window.save(); // the planner's own autosave to this browser (app.js)
    setDoc({ ...d, saved: JSON.stringify(st) });
    close();
    status(`Opened “${d.name}”.`);
  }

  const actions = {
    doSaveAs: () => {
      const n = $("fileName").value.trim();
      if (!n) return say("Enter a name.");
      return save(n, { asNew: true, team: $("fileTeam")?.value || null });
    },
    saveCopy: () => save((doc?.name || "Layout") + " (copy)", { asNew: true }),
    overwrite: () => save(doc.name, { overwrite: true }),
    signin: () => {
      close();
      account.open();
    },
    openAccount: async (row) => {
      if (!(await okToLeave())) return;
      const r = await (await cl()).from("layouts").select("id,name,data,version").eq("id", row.dataset.id).single();
      if (r.error) return say("Couldn't open it: " + r.error.message);
      if (!valid(r.data.data)) return say("That layout can't be read.");
      load(r.data.data, { where: "account", id: r.data.id, name: r.data.name, version: r.data.version });
    },
    openBrowser: async (row) => {
      if (!(await okToLeave())) return;
      const s = layoutSnapshots().find((x) => x.id === row.dataset.snap);
      if (!s || !valid(s.state)) return say("That layout can't be read.");
      load(s.state, { where: "browser", id: s.id, name: s.name, version: 0 });
    },
    rename: async (row) => {
      const cur = row.querySelector("b").textContent,
        name = (prompt("New name", cur) || "").trim();
      if (!name || name === cur) return;
      const r = await (await cl()).from("layouts").update({ name }).eq("id", row.dataset.id).select("version");
      if (r.error) return say("Not renamed: " + r.error.message);
      if (doc && doc.id === row.dataset.id) setDoc({ ...doc, name, version: r.data[0].version });
      openList();
    },
    remove: async (row) => {
      const name = row.querySelector("b").textContent;
      if (!confirm(`Delete “${name}” from your account? This can't be undone.`)) return;
      const r = await (await cl()).from("layouts").delete().eq("id", row.dataset.id);
      if (r.error) return say("Not deleted: " + r.error.message);
      if (doc && doc.id === row.dataset.id) setDoc(null);
      openList();
    },
  };

  function open(heading) {
    closeMenus();
    account.close(); // one dialog at a time
    $("fileHead").textContent = heading;
    $("fileAsk").hidden = true;
    say("");
    box().hidden = false;
  }
  function close() {
    box().hidden = true;
  }

  function init() {
    box().addEventListener("click", (e) => {
      if (e.target.id === "fileModal" || e.target.closest("[data-fileclose]")) return close();
      const b = e.target.closest("[data-file]");
      if (b && actions[b.dataset.file]) Promise.resolve(actions[b.dataset.file](b.closest("tr"))).catch((err) => say(err.message || String(err)));
    });
    box().addEventListener("change", async (e) => {
      const sel = e.target.closest("[data-fileshare]");
      if (!sel) return;
      const row = sel.closest("tr"),
        r = await (await cl()).from("layouts").update({ team_id: sel.value || null }).eq("id", row.dataset.id).select("version");
      if (r.error) return say("Not changed: " + r.error.message);
      if (doc && doc.id === row.dataset.id) setDoc({ ...doc, version: r.data[0].version });
      say(sel.value ? `“${row.querySelector("b").textContent}” is shared with the team.` : `“${row.querySelector("b").textContent}” is yours only again.`);
    });
    box().addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
      if (e.key === "Enter" && e.target.id === "fileName") actions.doSaveAs();
    });
    document.addEventListener("keydown", (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault(); // never the browser's "save page"
        e.shiftKey ? saveAs() : save();
      } else if (k === "o" && !e.shiftKey) {
        e.preventDefault();
        openList();
      }
    });
    title();
  }
  return { init, save, saveAs, openList, title, get doc() { return doc; }, dirty };
})();
files.init();
