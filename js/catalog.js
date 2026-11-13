/* Shared catalog of interfaces and mics (accounts phase 5, docs/ACCOUNTS_PLAN.md; table `catalog_items` in
   supabase/schema.sql, column `kind`). Anyone can browse the approved items and add one to their own gear. A signed-in
   user can share an interface or mic they added: it goes in as "pending" and an admin approves it, rejects it with a
   reason, or edits then approves it, so nothing appears for everyone until it has been checked. Admins are listed in
   the `admins` table, which only the Supabase dashboard can change (no key of any kind lives in this page: the
   database's own rules decide who may review, whatever this page asks for). What is shared is only the published specs
   in the "add an interface" / "add a mic" format: never the layout, the owner's channel notes or checks. Server data is
   never trusted: an item is added only after the same checks as a pasted reply (parseIface / parseMic). Works only
   online; signing in is needed to share or review. */
const catalogUI = (() => {
  const signedIn = () => typeof account === "object" && !!account.user,
    cl = () => account.client();
  const e = (v) => (typeof esc === "function" ? esc(v) : String(v));
  const SEL = "id,kind,brand,model,data,status,created_by,created_at,reject_reason";
  const link = (u) => (u ? ` · <a href="${e(u)}" target="_blank" rel="noopener">source</a>` : "");
  const key = (b, m) => `${b} ${m}`.trim().toLowerCase();
  /* The shareable record for an added interface (the AI reply's own format). */
  function toData(u) {
    const model = u.label || "",
      brand = u.name.endsWith(model) ? u.name.slice(0, u.name.length - model.length).trim() : u.name;
    return {
      format: IFACE_FORMAT,
      brand,
      model,
      preamps: u.preamps,
      inputs: u.inputs.map((x) => ({ kind: x.kind, count: x.count })),
      phantom: u.phantom || null,
      pads: u.pads || null,
      sampleRates: u.sampleRates || null,
      expansion: u.expansion || null,
      deadInputs: [],
      source: u.source,
    };
  }
  /* What differs between an interface and a mic. */
  const KINDS = {
    interface: {
      noun: "interface",
      parse: (text) => {
        const r = parseIface(text);
        return r.errors ? r : { errors: null, item: r.unit, source: r.unit.source };
      },
      toData,
      add: (r) => addIface(r.item),
      name: (r) => r.item.name,
      summary: (x) => {
        const u = parseIface(JSON.stringify(x.data)).unit;
        return u
          ? `${u.preamps} mic preamp${u.preamps === 1 ? "" : "s"} · ${u.inputs.map((i) => `${i.count} ${e(i.kind)}`).join(", ")}${u.phantom ? ` · phantom ${e(u.phantom)}` : ""}${u.sampleRates ? ` · ${u.sampleRates.map((r) => r / 1000).join("/")} kHz` : ""}${link(u.source)}`
          : null;
      },
      have: (x) => (inv().ifaces || []).some((u) => key("", u.name) === key(x.brand, x.model)),
      redraw: () => draw(true),
    },
    mic: {
      noun: "mic",
      parse: (text) => {
        const r = parseMic(text);
        return r.errors ? r : { errors: null, item: r.row, source: r.row.src && r.row.src[0] };
      },
      toData: micToData,
      add: (r) => addUserMic(r.item),
      name: (r) => `${r.item.b} ${r.item.m}`,
      summary: (x) => {
        const m = parseMic(JSON.stringify(x.data)).row;
        return m ? `${e(m.t)} · ${e(m.p)}${m.s != null ? ` · ${m.s} mV/Pa` : ""}${m.x != null ? ` · max ${m.x} dB` : ""}${m.n != null ? ` · ${m.n} dBA noise` : ""}${link(m.src && m.src[0])}` : null;
      },
      have: (x) => MICDB.some((r) => key(r.b, r.m) === key(x.brand, x.model)),
      redraw: () => {
        renderDbGrid();
        if (typeof userMicsUI === "object") userMicsUI.render();
      },
    },
  };
  async function approved(kind = "interface") {
    const { data, error } = await (await cl()).from("catalog_items").select(SEL).eq("kind", kind).eq("status", "approved").order("brand");
    if (error) throw error;
    return data || [];
  }
  async function mine(kind = "interface") {
    if (!signedIn()) return [];
    const { data, error } = await (await cl()).from("catalog_items").select(SEL).eq("kind", kind).eq("created_by", account.user.id).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  /* Admins only (the database refuses anyone else): everything waiting for review (one kind, or all). */
  async function queue(kind) {
    let q = (await cl()).from("catalog_items").select(SEL).eq("status", "pending");
    if (kind) q = q.eq("kind", kind);
    const { data, error } = await q.order("created_at");
    if (error) throw error;
    return data || [];
  }
  async function isAdmin() {
    if (!signedIn()) return false;
    const { data } = await (await cl()).from("admins").select("user_id").eq("user_id", account.user.id).maybeSingle();
    return !!data;
  }
  async function submit(kind, d) {
    if (!signedIn()) throw new Error("Sign in to share.");
    if (!d.source) throw new Error(`Only a ${KINDS[kind].noun} with a source page can be shared: reviewers check the specs against it.`);
    const all = [...(await approved(kind)), ...(await mine(kind))];
    if (all.some((x) => key(x.brand, x.model) === key(d.brand, d.model) && x.status !== "rejected")) throw new Error(`${d.brand} ${d.model} is already in the catalog or waiting for review.`);
    const { error } = await (await cl()).from("catalog_items").insert({ kind, brand: d.brand, model: String(d.model), data: d });
    if (error) throw error;
  }
  const share = (unit) => submit("interface", toData(unit)),
    shareMic = (data) => submit("mic", data);
  async function withdraw(id) {
    const { error } = await (await cl()).from("catalog_items").delete().eq("id", id);
    if (error) throw error;
  }
  /* Review steps (admin): the database applies them only for an admin, and stamps who did it and when. */
  async function approve(id) {
    const { error } = await (await cl()).from("catalog_items").update({ status: "approved" }).eq("id", id);
    if (error) throw error;
  }
  async function reject(id, reason) {
    if (!String(reason || "").trim()) throw new Error("Give the author a reason.");
    const { error } = await (await cl()).from("catalog_items").update({ status: "rejected", reject_reason: String(reason).trim().slice(0, 300) }).eq("id", id);
    if (error) throw error;
  }
  /* Save edited specs (the same JSON format and checks as a pasted reply). `approveIt`: an admin's edit-then-approve;
     otherwise the author's fix of a rejected or pending item, which goes back to pending. */
  async function saveEdit(id, text, approveIt, kind = "interface") {
    const K = KINDS[kind],
      r = K.parse(text);
    if (r.errors) throw new Error(r.errors[0]);
    if (!r.source) throw new Error('"source" is required: reviewers check the specs against it.');
    const d = K.toData(r.item),
      { error } = await (await cl()).from("catalog_items").update({ brand: d.brand, model: String(d.model), data: d, status: approveIt ? "approved" : "pending" }).eq("id", id);
    if (error) throw error;
  }
  /* Add a catalog item to this layout's gear / the mic database, after the same checks as a pasted reply. */
  function take(item, kind = "interface") {
    const K = KINDS[kind],
      r = K.parse(JSON.stringify(item.data));
    if (r.errors) throw new Error("That catalog entry doesn't pass the checks: " + r.errors[0]);
    K.add(r);
    return K.name(r);
  }
  /* A count on the account button for an admin with items waiting. */
  async function badge() {
    const b = document.getElementById("railAccount");
    if (!b) return;
    let n = 0;
    try {
      if (await isAdmin()) n = (await queue()).length;
    } catch (err) {
      n = 0;
    }
    let s = document.getElementById("railReview");
    if (!n) return s && s.remove();
    if (!s) {
      s = document.createElement("span");
      s.id = "railReview";
      s.className = "badge";
      b.appendChild(s);
    }
    s.textContent = n;
    s.title = `${n} shared item${n === 1 ? "" : "s"} waiting for your review (Gear › Interfaces, or Mic database › Add a mic with its specs)`;
  }
  if (typeof account === "object" && account.onChange) account.onChange(() => setTimeout(badge, 0));

  /* The block under Gear › Interfaces (kind "interface") and Mic database › Add a mic (kind "mic"): review queue
     (admins), browse and add, my submissions. */
  const openedKinds = new Set(); // once opened, the list comes back after each redraw
  async function render(box, kind = "interface") {
    if (!box) return;
    const K = KINDS[kind],
      msg = $(kind === "mic" ? "umCatMsg" : "catMsg");
    openedKinds.add(kind);
    box.innerHTML = '<div class="m">Loading the shared catalog…</div>';
    let A, M, Q, admin;
    try {
      [A, M, admin] = await Promise.all([approved(kind), mine(kind), isAdmin()]);
      Q = admin ? await queue(kind) : [];
    } catch (err) {
      box.innerHTML = `<div class="m">The shared catalog needs a connection: ${e(err.message || err)}</div>`;
      return;
    }
    badge();
    const say = (t) => msg && (msg.textContent = t || ""),
      sum = (x) => K.summary(x) || '<span class="m">(entry did not pass the checks)</span>',
      nm = (x) => `${e(x.brand)} ${e(x.model)}`,
      edId = `catEditBox-${kind}`;
    box.innerHTML =
      (admin
        ? `<h4>Review queue${Q.length ? ` (${Q.length})` : ""}</h4>` +
          (Q.length
            ? Q.map((x) => `<div class="ifCard" data-q="${e(x.id)}"><b>${nm(x)}</b> · ${sum(x)} <span class="m">submitted ${e(String(x.created_at || "").slice(0, 10))}</span><div class="row"><button data-catok="${e(x.id)}">Approve</button><button data-catno="${e(x.id)}">Reject…</button><button data-catedit="${e(x.id)}|approve">Edit then approve…</button></div></div>`).join("")
            : '<div class="m">Nothing is waiting for review.</div>')
        : "") +
      "<h4>Approved</h4>" +
      (A.length
        ? A.map(
            (x) =>
              `<div class="ifCard"><b>${nm(x)}</b> · ${sum(x)} ${!K.summary(x) ? "" : K.have(x) ? '<span class="m">already in your gear</span>' : `<button data-catadd="${e(x.id)}">Add to my ${kind === "mic" ? "mics" : "gear"}</button>`}${
                admin ? ` <button class="hb" data-catdel="${e(x.id)}" aria-label="Remove ${nm(x)} from the catalog">Remove</button>` : ""
              }</div>`,
          ).join("")
        : `<div class="m">Nothing has been approved yet. Be the first: add ${kind === "mic" ? "a mic" : "an interface"}, then share it.</div>`) +
      (M.length
        ? `<h4>Your submissions</h4>${M.map(
            (x) =>
              `<div class="ifCard"><b>${nm(x)}</b> · <span class="catSt ${e(x.status)}">${{ pending: "waiting for review", approved: "approved", rejected: "not accepted" }[x.status] || e(x.status)}</span>${
                x.status === "rejected" && x.reject_reason ? `<div class="m">Reason: ${e(x.reject_reason)}</div>` : ""
              }${x.status !== "approved" ? ` <button class="hb" data-catedit="${e(x.id)}|resubmit">${x.status === "rejected" ? "Edit and resubmit" : "Edit"}</button> <button class="hb" data-catdel="${e(x.id)}" aria-label="Withdraw ${nm(x)}">Withdraw</button>` : ""}</div>`,
          ).join("")}`
        : "") +
      `<div id="${edId}"></div>`;
    const redo = () => render(box, kind);
    const run = (fn) => async () => {
      try {
        say("");
        await fn();
        redo();
      } catch (err) {
        say(err.message || String(err));
      }
    };
    box.querySelectorAll("[data-catadd]").forEach(
      (b) =>
        (b.onclick = () => {
          try {
            const n = take(A.find((x) => x.id === b.dataset.catadd), kind);
            K.redraw();
            status(`${n} added from the shared catalog. Check the specs against the ${K.noun}.`);
            redo();
          } catch (err) {
            say(err.message);
          }
        }),
    );
    box.querySelectorAll("[data-catdel]").forEach((b) => (b.onclick = run(() => withdraw(b.dataset.catdel))));
    box.querySelectorAll("[data-catok]").forEach((b) => (b.onclick = run(() => approve(b.dataset.catok))));
    box.querySelectorAll("[data-catno]").forEach(
      (b) =>
        (b.onclick = run(async () => {
          const why = prompt("Why is this being rejected? The author sees this.", "");
          if (why === null) throw new Error("");
          await reject(b.dataset.catno, why);
        })),
    );
    box.querySelectorAll("[data-catedit]").forEach(
      (b) =>
        (b.onclick = () => {
          const [id, mode] = b.dataset.catedit.split("|"),
            x = [...Q, ...M].find((r) => r.id === id),
            ed = $(edId);
          ed.innerHTML = `<h4>${mode === "approve" ? "Edit, then approve" : "Edit and resubmit"}: ${nm(x)}</h4><textarea id="catJson-${kind}" rows="12" aria-label="Specs as JSON" style="width:100%">${e(JSON.stringify(x.data, null, 2))}</textarea><div class="row"><button id="catSave-${kind}">${mode === "approve" ? "Save and approve" : "Save and resubmit"}</button><button id="catCancel-${kind}">Cancel</button></div>`;
          $(`catCancel-${kind}`).onclick = () => (ed.innerHTML = "");
          $(`catSave-${kind}`).onclick = run(() => saveEdit(id, $(`catJson-${kind}`).value, mode === "approve", kind));
        }),
    );
  }
  return { toData, approved, mine, queue, isAdmin, share, shareMic, withdraw, approve, reject, saveEdit, take, render, badge, signedIn, opened: (k = "interface") => openedKinds.has(k) };
})();
