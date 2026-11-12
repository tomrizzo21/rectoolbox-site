/* Saved recording analyses (accounts phase 4, docs/ACCOUNTS_PLAN.md). Playback › Save analysis keeps what the live
   analysis found (each family's activity over time and the band levels; js/playback.js window.__pbRec), never the
   audio. Signed in: the `analyses` table (owner only, ≤ 256 KB per row; kind "recording", the name inside the result).
   Signed out: this browser (up to 20). Open replays the heatmap without the recording. */
const analysesUI = (() => {
  const LOCAL = "rt-analyses-v1",
    MAX_BYTES = 240000,
    signedIn = () => typeof account === "object" && !!account.user,
    cl = () => account.client();
  const local = () => {
    try {
      return store.getJSON(LOCAL, [], "saved analyses") || [];
    } catch (e) {
      return [];
    }
  };
  /* Halve the frame rate until it fits the server's size limit (long recordings). */
  function fit(r) {
    while (JSON.stringify(r).length > MAX_BYTES && r.fps > 1) {
      const every = (a) => a.filter((_, i) => i % 2 === 0);
      r = { ...r, fps: r.fps / 2, a: Object.fromEntries(Object.entries(r.a).map(([k, v]) => [k, every(v)])), bands: r.bands.length > 600 ? every(r.bands) : r.bands, bandFps: r.bands.length > 600 ? r.bandFps / 2 : r.bandFps };
    }
    return r;
  }
  async function list() {
    if (!signedIn()) return local().map((x) => ({ id: x.id, name: x.result.name, created: x.result.created, duration: x.result.duration, sha: x.result.file && x.result.file.sha256 }));
    const { data, error } = await (await cl()).from("analyses").select("id,result,created_at").eq("kind", "recording").order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((x) => ({ id: x.id, name: x.result.name, created: x.created_at, duration: x.result.duration, sha: x.result.file && x.result.file.sha256 }));
  }
  async function save(name) {
    let r = window.__pbRec.result();
    if (!r) throw new Error("Play at least 2 seconds of a recording or the microphone first.");
    r = fit({ ...r, name: name.slice(0, 120), created: new Date().toISOString() });
    if (!signedIn()) {
      const L = local();
      L.unshift({ id: "l" + Date.now(), result: r });
      store.setJSON(LOCAL, L.slice(0, 20));
      return "this browser";
    }
    const { error } = await (await cl()).from("analyses").insert({ kind: "recording", result: r });
    if (error) throw error;
    return "your account";
  }
  async function load(id) {
    if (!signedIn() || id.startsWith("l")) return (local().find((x) => x.id === id) || {}).result;
    const { data, error } = await (await cl()).from("analyses").select("result").eq("id", id).single();
    if (error) throw error;
    return data.result;
  }
  async function remove(id) {
    if (!signedIn() || id.startsWith("l")) return store.setJSON(LOCAL, local().filter((x) => x.id !== id));
    const { error } = await (await cl()).from("analyses").delete().eq("id", id);
    if (error) throw error;
  }
  /* Opt-in audio kept in this browser (PROJECT_RULES rule 2 exception, Tom 2026-11-12): IndexedDB, keyed by the
     recording's fingerprint, never sent anywhere. Shown with the space it uses; Clear kept audio removes all of it. */
  const AUDIO_DB = "rt-audio",
    AUDIO_ST = "files";
  function idb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(AUDIO_DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(AUDIO_ST, { keyPath: "sha256" });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function audioDo(mode, fn) {
    const db = await idb();
    return new Promise((res, rej) => {
      const t = db.transaction(AUDIO_ST, mode),
        q = fn(t.objectStore(AUDIO_ST));
      t.oncomplete = () => (db.close(), res(q && "result" in q ? q.result : undefined));
      t.onerror = t.onabort = () => (db.close(), rej(t.error || new Error("storage refused")));
    });
  }
  const audio = {
    put: (rec) => audioDo("readwrite", (s) => s.put(rec)),
    get: (sha) => audioDo("readonly", (s) => s.get(sha)),
    del: (sha) => audioDo("readwrite", (s) => s.delete(sha)),
    all: () => audioDo("readonly", (s) => s.getAll()),
    clear: () => audioDo("readwrite", (s) => s.clear()),
  };
  async function space() {
    try {
      const all = await audio.all(),
        bytes = all.reduce((a, x) => a + (x.size || 0), 0);
      $("anSpaceRow").hidden = !all.length;
      $("anSpace").textContent = `Audio kept in this browser: ${all.length} recording${all.length === 1 ? "" : "s"}, ${mb(bytes)}.`;
    } catch (e) {
      $("anSpaceRow").hidden = true;
    }
  }
  const msg = (t) => ($("anMsg").textContent = t || "");
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`,
    mb = (n) => (n < 1048576 ? Math.max(1, Math.round(n / 1024)) + " KB" : (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + " MB");
  async function refresh(select) {
    try {
      const L = await list();
      $("anList").innerHTML =
        `<option value="">${L.length ? `Saved analyses (${L.length})…` : "No saved analyses yet"}</option>` +
        L.map((x) => `<option value="${esc(x.id)}">${esc(x.name)} · ${fmt(x.duration)}</option>`).join("");
      if (select) $("anList").value = select;
    } catch (e) {
      msg("Couldn't list saved analyses: " + (e.message || e));
    }
    pick();
  }
  const pick = () => ($("anOpen").disabled = $("anDel").disabled = !$("anList").value);
  function recChanged() {
    const s = window.__pbRec ? window.__pbRec.seconds() : 0,
      f = window.__pbRec && window.__pbRec.fileObj();
    $("anKeep").disabled = !f || s < 2;
    $("anKeep").parentElement.title = f ? "Off by default. The recording stays only in this browser, never on the server." : "Only for a recording file you loaded (not the microphone or the demo).";
    if (!f) $("anKeep").checked = false;
    $("anSave").disabled = s < 2;
    $("anSave").title = s < 2 ? "Play at least 2 seconds of your own recording or the microphone first" : `Keep this analysis (${fmt(s)}; the numbers only, never the audio)`;
  }
  $("anSave").onclick = async () => {
    const r = window.__pbRec.result(),
      name = prompt("Name for this analysis", (r && r.source) || "Analysis");
    if (!name) return;
    try {
      const where = await save(name),
        f = window.__pbRec.fileObj();
      let kept = "";
      if ($("anKeep").checked && f && r && r.file) {
        try {
          await audio.put({ sha256: r.file.sha256, name: r.file.name, size: f.size, type: f.type, blob: f, saved: new Date().toISOString() });
          kept = ` The audio (${mb(f.size)}) is kept in this browser.`;
        } catch (e) {
          kept = " The audio couldn't be kept: this browser is out of space or blocks storage.";
        }
      }
      msg(`Saved to ${where}.${kept}`);
      $("anKeep").checked = false;
      await refresh();
      space();
    } catch (e) {
      msg("Not saved: " + (e.message || e));
    }
  };
  $("anList").onchange = pick;
  /* Open: replay without audio; if the analysis remembers its file, offer to attach the same file for sound. */
  async function openId(id, file) {
    try {
      const r = await load(id);
      if (!r) return msg("That analysis is gone.");
      if (file) return attach(file, r);
      if (r.file) {
        const k = await audio.get(r.file.sha256).catch(() => null);
        if (k && k.blob) {
          window.__pbRec.attach(new File([k.blob], k.name, { type: k.type }), r);
          return msg(`Playing with the audio kept in this browser.`);
        }
      }
      window.__pbRec.open(r);
      status(`Opened ${r.name}. Press Play to replay the heatmap.`);
      if (!r.file) return msg("");
      askAttach(r, "");
    } catch (e) {
      msg("Couldn't open it: " + (e.message || e));
    }
  }
  /* The attach box stays until the right file is chosen, with any message above it. */
  function askAttach(r, note) {
    $("anMsg").innerHTML = `${note ? esc(note) + " " : ""}To hear it, attach the same recording (${esc(r.file.name)}, ${mb(r.file.size)}): <input type="file" id="anAttach" accept="audio/*,video/*" aria-label="Attach the recording">`;
    $("anAttach").onchange = () => $("anAttach").files[0] && attach($("anAttach").files[0], r);
  }
  async function attach(f, r) {
    msg("Checking the file…");
    let h = "";
    try {
      h = await window.__pbRec.hash(f);
    } catch (e) {
      return msg("This browser can't check the file here (open the planner from rectoolbox.net or a local server).");
    }
    if (h !== r.file.sha256) return askAttach(r, `"${f.name}" is a different recording than the one analysed.`);
    window.__pbRec.attach(f, r);
    msg(`Same recording: playing it with the saved analysis "${r.name}".`);
  }
  $("anOpen").onclick = () => openId($("anList").value);
  /* A newly loaded file that was analysed before: offer the saved analysis. */
  async function fileLoaded(file, f) {
    try {
      const hit = (await list()).find((x) => x.sha && x.sha === file.sha256);
      if (!hit) return;
      $("anMsg").innerHTML = `You saved an analysis of this recording ("${esc(hit.name)}"). <button id="anUseSaved">Use it with this file</button>`;
      $("anUseSaved").onclick = () => openId(hit.id, f);
    } catch (e) {
      /* offline or signed out with nothing saved: nothing to offer */
    }
  }
  $("anDel").onclick = async () => {
    const o = $("anList").selectedOptions[0];
    if (!o || !confirm(`Delete the saved analysis "${o.textContent}"? This can't be undone.`)) return;
    try {
      const id = $("anList").value,
        gone = (await list()).find((x) => x.id === id);
      await remove(id);
      // drop its kept audio unless another saved analysis uses the same recording
      if (gone && gone.sha && !(await list()).some((x) => x.sha === gone.sha)) await audio.del(gone.sha).catch(() => {});
      msg("Deleted.");
      await refresh();
      space();
    } catch (e) {
      msg("Couldn't delete it: " + (e.message || e));
    }
  };
  if (typeof account === "object" && account.onChange) account.onChange(() => refresh());
  $("anClear").onclick = async () => {
    if (!confirm("Remove all recordings kept in this browser? Saved analyses stay; you can attach the files again.")) return;
    await audio.clear().catch(() => {});
    msg("Kept audio cleared.");
    space();
  };
  space();
  refresh();
  return { recChanged, refresh, save, list, load, remove, fileLoaded, audio, space };
})();
