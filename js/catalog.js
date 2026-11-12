/* Shared catalog of interfaces (accounts phase 5, docs/ACCOUNTS_PLAN.md; table `catalog_items` in supabase/schema.sql).
   Anyone can browse the approved interfaces and add one to their own gear. A signed-in user can share an interface they
   added: it goes in as "pending" and Tom approves or rejects it in the Supabase dashboard, so nothing appears for
   everyone until it has been checked. What is shared is only the unit's published specs in the "add an interface"
   format (brand, model, inputs, phantom, pads, sample rates, expansion, source page): never the layout, the dead
   channels or the owner's own notes. Server data is never trusted: an item is added to the gear only after the same
   checks as a pasted reply (parseIface). Works only online and signed in to share; browsing needs a connection only. */
const catalogUI = (() => {
  const signedIn = () => typeof account === "object" && !!account.user,
    cl = () => account.client();
  const e = (v) => (typeof esc === "function" ? esc(v) : String(v));
  /* The shareable record for an added unit (the AI reply's own format). */
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
  const key = (b, m) => `${b} ${m}`.trim().toLowerCase();
  async function approved() {
    const { data, error } = await (await cl()).from("catalog_items").select("id,brand,model,data,status,created_by").eq("kind", "interface").eq("status", "approved").order("brand");
    if (error) throw error;
    return data || [];
  }
  async function mine() {
    if (!signedIn()) return [];
    const { data, error } = await (await cl()).from("catalog_items").select("id,brand,model,status,created_at").eq("kind", "interface").eq("created_by", account.user.id).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async function share(unit) {
    if (!signedIn()) throw new Error("Sign in to share.");
    if (!unit.source) throw new Error("Only units with a source page can be shared: reviewers check the specs against it.");
    const d = toData(unit),
      all = [...(await approved()), ...(await mine())];
    if (all.some((x) => key(x.brand, x.model) === key(d.brand, d.model) && x.status !== "rejected")) throw new Error(`${unit.name} is already in the catalog or waiting for review.`);
    const { error } = await (await cl()).from("catalog_items").insert({ kind: "interface", brand: d.brand, model: d.model, data: d });
    if (error) throw error;
  }
  async function withdraw(id) {
    const { error } = await (await cl()).from("catalog_items").delete().eq("id", id);
    if (error) throw error;
  }
  /* Add a catalog item to this layout's gear, after the same checks as a pasted reply. */
  function take(item) {
    const r = parseIface(JSON.stringify(item.data));
    if (r.errors) throw new Error("That catalog entry doesn't pass the checks: " + r.errors[0]);
    addIface(r.unit);
    return r.unit;
  }
  /* The Gear › Interfaces block: browse, add, and my submissions. */
  let opened = false; // once opened, the list comes back after each redraw of the Gear tab
  async function render(box) {
    if (!box) return;
    opened = true;
    box.innerHTML = '<div class="m">Loading the shared catalog…</div>';
    let A, M;
    try {
      [A, M] = await Promise.all([approved(), mine()]);
    } catch (err) {
      box.innerHTML = `<div class="m">The shared catalog needs a connection: ${e(err.message || err)}</div>`;
      return;
    }
    const have = new Set((inv().ifaces || []).map((u) => key("", u.name)));
    box.innerHTML =
      (A.length
        ? A.map((x) => {
            const u = (parseIface(JSON.stringify(x.data)) || {}).unit;
            return `<div class="ifCard"><b>${e(x.brand)} ${e(x.model)}</b> ${u ? `· ${u.preamps} mic preamp${u.preamps === 1 ? "" : "s"} · ${u.inputs.map((i) => `${i.count} ${e(i.kind)}`).join(", ")}${u.source ? ` · <a href="${e(u.source)}" target="_blank" rel="noopener">source</a>` : ""}` : '<span class="m">(entry did not pass the checks)</span>'} ${
              u ? (have.has(key("", u.name)) ? '<span class="m">already in your gear</span>' : `<button data-catadd="${e(x.id)}">Add to my gear</button>`) : ""
            }</div>`;
          }).join("")
        : '<div class="m">Nothing has been approved yet. Be the first: add an interface above, then share it.</div>') +
      (M.length ? `<h4>Your submissions</h4>${M.map((x) => `<div class="ifCard"><b>${e(x.brand)} ${e(x.model)}</b> · <span class="catSt ${e(x.status)}">${{ pending: "waiting for review", approved: "approved", rejected: "not accepted" }[x.status] || e(x.status)}</span>${x.status === "pending" ? ` <button class="hb" data-catdel="${e(x.id)}" aria-label="Withdraw ${e(x.brand)} ${e(x.model)}">Withdraw</button>` : ""}</div>`).join("")}` : "");
    box.querySelectorAll("[data-catadd]").forEach(
      (b) =>
        (b.onclick = () => {
          try {
            const u = take(A.find((x) => x.id === b.dataset.catadd));
            draw(true);
            status(`${u.name} added to your gear from the shared catalog. Check the specs against the unit.`);
          } catch (err) {
            $("catMsg").textContent = err.message;
          }
        }),
    );
    box.querySelectorAll("[data-catdel]").forEach(
      (b) =>
        (b.onclick = async () => {
          try {
            await withdraw(b.dataset.catdel);
            render(box);
          } catch (err) {
            $("catMsg").textContent = "Couldn't withdraw it: " + (err.message || err);
          }
        }),
    );
  }
  return { toData, approved, mine, share, withdraw, take, render, signedIn, get opened() { return opened; } };
})();
