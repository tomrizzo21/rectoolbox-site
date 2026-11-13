/* Interfaces and preamps (Gear › Interfaces; BACKLOG B-new).
   - Built-in units, plus interfaces imported from a file or pasted text made with the "add an interface" prompt
     (IFACE_PROMPT below; the same text is in docs/prompts/add-interface.md).
   - The patch order: which units, in which order, make up inputs 1…N. Track numbers, preamp names ("ADA #2 ch3"),
     the channel list and the stage plot all follow it. The default is the fieldhouse rig: D8 (ch 8 dead) + 3 × ADA8000.
   Everything lives in the layout's inventory (st.inv), like the rest of Gear: imported units travel with the layout file. */
const IFACE_FORMAT = "rectoolbox.interface/1";
const IFACE_KINDS = ["mic", "line", "instrument", "adat", "spdif", "aes", "madi", "dante", "avb", "usb", "other"];
const BUILTIN_IFACES = {
  d8: { name: "Behringer DigiMax D8", label: "DigiMax D8", short: "D8", preamps: 8, dead: [8], builtin: 1 },
  ada: { name: "Behringer ADA8000", label: "ADA8000", short: "ADA", preamps: 8, builtin: 1 },
};
const DEFAULT_RIG = ["d8", "ada", "ada", "ada"];

function ifaceDef(id) {
  return BUILTIN_IFACES[id] || (inv().ifaces || []).find((x) => x.id === id) || null;
}
function rigList() {
  const I = inv();
  return (Array.isArray(I.rig) ? I.rig : DEFAULT_RIG).filter(ifaceDef);
}
/* Every input in patch order: { t, idx (unit position, 1-based), input, id, label, short, dead }. */
function rigInputs() {
  const rig = rigList(),
    total = {},
    seen = {},
    out = [];
  rig.forEach((id) => (total[id] = (total[id] || 0) + 1));
  let t = 1;
  rig.forEach((id, idx) => {
    const d = ifaceDef(id);
    seen[id] = (seen[id] || 0) + 1;
    const num = total[id] > 1 ? ` #${seen[id]}` : "";
    for (let i = 1; i <= d.preamps; i++)
      out.push({ t: t++, idx: idx + 1, input: i, id, label: (d.label || d.name) + num, short: (d.short || d.model || d.name) + num, dead: (d.dead || []).includes(i) });
  });
  return out;
}

/* ---- import ---- */
const IFACE_PROMPT = `I want to add an audio interface or mic preamp to Rec Toolbox, a planner for recording live ensembles.
Brand and model: [TYPE THE BRAND AND MODEL NUMBER HERE]

Look up the manufacturer's published specifications (product page or manual) for that exact model and reply with one
JSON object in this format, then a short check list. Nothing else.

{
  "format": "rectoolbox.interface/1",
  "brand": "Behringer",
  "model": "ADA8000",
  "preamps": 8,
  "inputs": [{ "kind": "mic", "count": 8 }, { "kind": "adat", "count": 1 }],
  "phantom": "global",
  "pads": "none",
  "sampleRates": [44100, 48000],
  "expansion": "ADAT out to an interface's optical input",
  "deadInputs": [],
  "source": "https://www.behringer.com/..."
}

Fields:
- preamps: how many microphones it can take at once (XLR or combo inputs with a mic preamp).
- inputs: every physical input type and how many; kind is one of mic, line, instrument, adat, spdif, aes, madi, dante,
  avb, usb, other. Count an ADAT or S/PDIF port as 1.
- phantom: "per channel", "per group", "global" or "none". pads: "per channel", "some channels" or "none".
- sampleRates: the supported rates in Hz. expansion: how more inputs can be added, or "none".
- deadInputs: leave empty (the owner fills in broken channels).
- source: the page you used.

Rules: use only the manufacturer's numbers; if something isn't published, use null and say so in the check list.
Plain JSON (no comments, no trailing commas). After the JSON, write "Please check:" and up to five things the owner
should confirm on the unit itself.`;

/* Find the JSON object in a file or a pasted AI reply and check it. Returns { unit } or { errors }. */
function parseIface(text) {
  const errors = [],
    a = String(text || "").indexOf("{"),
    b = String(text || "").lastIndexOf("}");
  if (a < 0 || b < a) return { errors: ["No JSON object found. Paste the whole reply, or choose the .json file."] };
  let o;
  try {
    o = JSON.parse(text.slice(a, b + 1));
  } catch (e) {
    return { errors: ["The JSON can't be read: " + e.message + ". Ask the AI for plain JSON without comments."] };
  }
  const str = (v, max = 80) => typeof v === "string" && v.trim() && v.length <= max;
  const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  if (o.format !== IFACE_FORMAT) errors.push(`"format" must be "${IFACE_FORMAT}".`);
  if (!str(o.brand)) errors.push('"brand" is missing.');
  if (!str(o.model)) errors.push('"model" is missing.');
  if (!int(o.preamps, 0, 128)) errors.push('"preamps" must be a whole number from 0 to 128.');
  if (!Array.isArray(o.inputs) || !o.inputs.length) errors.push('"inputs" must list at least one input type.');
  else
    o.inputs.forEach((x, i) => {
      if (!x || !IFACE_KINDS.includes(x.kind)) errors.push(`inputs[${i}].kind must be one of ${IFACE_KINDS.join(", ")}.`);
      if (!x || !int(x.count, 1, 256)) errors.push(`inputs[${i}].count must be a whole number from 1 to 256.`);
    });
  const dead = o.deadInputs == null ? [] : o.deadInputs;
  if (!Array.isArray(dead) || dead.some((n) => !int(n, 1, o.preamps || 0))) errors.push('"deadInputs" must be input numbers within the preamps.');
  if (o.sampleRates != null && (!Array.isArray(o.sampleRates) || o.sampleRates.some((r) => !int(r, 8000, 768000)))) errors.push('"sampleRates" must be rates in Hz, e.g. [44100, 48000].');
  if (errors.length) return { errors };
  const opt = (v) => (v == null ? null : String(v).slice(0, 120)),
    src = typeof o.source === "string" && /^https?:\/\//.test(o.source) ? o.source.slice(0, 300) : null,
    name = `${o.brand.trim()} ${o.model.trim()}`;
  return {
    unit: {
      id: "u:" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      label: o.model.trim(),
      short: o.model.trim().slice(0, 14),
      preamps: o.preamps,
      dead: dead.slice(),
      inputs: o.inputs.map((x) => ({ kind: x.kind, count: x.count })),
      phantom: opt(o.phantom),
      pads: opt(o.pads),
      sampleRates: o.sampleRates || null,
      expansion: opt(o.expansion),
      source: src,
      checks: (String(text).split(/please check:?/i)[1] || "").trim().slice(0, 600),
    },
  };
}
function addIface(unit) {
  const I = inv();
  I.ifaces = I.ifaces || [];
  const at = I.ifaces.findIndex((x) => x.id === unit.id);
  if (at >= 0) I.ifaces[at] = unit;
  else I.ifaces.push(unit);
}

/* ---- Gear › Interfaces ---- */
function ifaceSection(I, used) {
  const rig = rigList(),
    ins = rigInputs(),
    usedBy = (idx) => ins.filter((x) => x.idx === idx && used.includes(x.t)).length,
    live = (idx) => ins.filter((x) => x.idx === idx && !x.dead).length;
  let h = invHead("Patch order", "Which units make up inputs 1, 2, 3…: track numbers, preamp names, the channel list and the stage plot follow this order.");
  h += `<table class="ifRig"><tr><th>#</th><th>Unit</th><th>Inputs</th><th>In use</th><th></th></tr>`;
  rig.forEach((id, i) => {
    const r = ins.filter((x) => x.idx === i + 1),
      dead = r.filter((x) => x.dead).map((x) => x.input);
    h += `<tr><td>${i + 1}</td><td>${esc(r[0] ? r[0].label : ifaceDef(id).name)}${dead.length ? ` <span class="m">(ch ${dead.join(", ")} dead)</span>` : ""}</td><td>${r.length ? `${r[0].t}–${r[r.length - 1].t}` : "none"}</td><td>${usedBy(i + 1)}/${live(i + 1)}</td><td><button class="hb" data-rig="up|${i}" aria-label="Move up"${i ? "" : " disabled"}>↑</button><button class="hb" data-rig="down|${i}" aria-label="Move down"${i < rig.length - 1 ? "" : " disabled"}>↓</button><button class="hb" data-rig="del|${i}" aria-label="Remove from the patch order">✕</button></td></tr>`;
  });
  const opts = [...Object.entries(BUILTIN_IFACES).map(([id, d]) => [id, d.name]), ...(I.ifaces || []).map((u) => [u.id, u.name])];
  h += `</table><div class="row"><select id="rigPick" aria-label="Unit to add">${opts.map(([id, n]) => `<option value="${esc(id)}">${esc(n)}</option>`).join("")}</select><button id="rigAdd">Add to patch order</button><button id="rigReset" title="D8 (ch 8 dead) + 3 × ADA8000">Reset to default</button></div>`;
  // owned / added
  const tot = (id) => rig.filter((x) => x === id).length;
  const IF = [
    ["d8", "Behringer DigiMax D8 (ch 8 dead)", 1],
    ["ada", "Behringer ADA8000", 3],
    ["dig", "RME Digiface USB", 1, "4 optical ins"],
    ...(I.ifaces || []).map((u) => [u.id, u.name, 1]),
  ];
  h += invHead("Interfaces and preamps", "");
  h += `<table><tr><th>Unit</th><th>Owned</th><th>Added</th><th>In patch order</th></tr>${IF.map(
    ([id, n, o, u]) => `<tr><td>${esc(n)}</td><td>${o}</td><td>${qtyCtl("ifaceAdd|" + id, I.ifaceAdd[id])}</td><td>${u || tot(id) + " ×"}</td></tr>`,
  ).join("")}</table>`;
  // imported
  if ((I.ifaces || []).length) {
    h += invHead("Added from a file", "Specs as the AI found them; check them against the unit.");
    h += (I.ifaces || [])
      .map(
        (u, i) =>
          `<div class="ifCard"><b>${esc(u.name)}</b> · ${u.preamps} mic preamp${u.preamps === 1 ? "" : "s"} · ${u.inputs.map((x) => `${x.count} ${x.kind}`).join(", ")}${u.phantom ? ` · phantom ${esc(u.phantom)}` : ""}${u.sampleRates ? ` · ${u.sampleRates.map((r) => r / 1000).join("/")} kHz` : ""}${
            u.source ? ` · <a href="${esc(u.source)}" target="_blank" rel="noopener">source</a>` : ""
          } <button class="hb" data-ifdel="${i}" aria-label="Remove ${esc(u.name)}">✕</button>${u.source ? ` <button class="hb" data-ifshare="${i}" title="Share this unit's published specs in the shared catalog after review" aria-label="Share ${esc(u.name)} in the shared catalog">Share</button>` : ""}${u.checks ? `<div class="m">Please check: ${esc(u.checks)}</div>` : ""}</div>`,
      )
      .join("");
  }
  h += invHead("Add an interface", "No code changes needed: ask any AI assistant for the unit's specs in Rec Toolbox's format, then add the reply here.");
  h += `<div class="row"><button id="ifPromptCopy">Copy the AI prompt</button><span class="m">Paste it into any AI assistant and fill in the brand and model.</span></div>
<textarea id="ifPaste" rows="4" placeholder="Paste the AI's reply here…" aria-label="AI reply with the interface JSON"></textarea>
<div class="row"><button id="ifPasteAdd">Add from pasted reply</button><label class="m">or <input type="file" id="ifFile" accept=".json,application/json,text/plain" aria-label="Interface file"></label></div><div id="ifErr" class="err" aria-live="polite"></div>`;
  h += invHead("Shared catalog", "Interfaces other people added and had checked. Add one to your gear, or share one of yours (Share, above): it appears for everyone only after it has been reviewed. Needs a connection.");
  h += `<div class="row"><button id="catOpen">Browse the shared catalog</button><span id="catMsg" class="err" aria-live="polite"></span></div><div id="ifCat"></div>`;
  return h;
}
function bindIfaceSection() {
  const I = inv(),
    setRig = (r) => {
      I.rig = r;
      draw(true);
    };
  document.querySelectorAll("[data-rig]").forEach(
    (b) =>
      (b.onclick = () => {
        const [op, s] = b.dataset.rig.split("|"),
          i = +s,
          r = rigList().slice();
        if (op === "up" && i > 0) [r[i - 1], r[i]] = [r[i], r[i - 1]];
        if (op === "down" && i < r.length - 1) [r[i + 1], r[i]] = [r[i], r[i + 1]];
        if (op === "del") r.splice(i, 1);
        setRig(r);
      }),
  );
  const add = $("rigAdd");
  if (add) add.onclick = () => setRig([...rigList(), $("rigPick").value]);
  const reset = $("rigReset");
  if (reset) reset.onclick = () => setRig(DEFAULT_RIG.slice());
  document.querySelectorAll("[data-ifdel]").forEach(
    (b) =>
      (b.onclick = () => {
        const u = I.ifaces[+b.dataset.ifdel];
        I.ifaces.splice(+b.dataset.ifdel, 1);
        I.rig = rigList().filter((id) => id !== u.id);
        draw(true);
        status(`${u.name} removed.`);
      }),
  );
  document.querySelectorAll("[data-ifshare]").forEach(
    (b) =>
      (b.onclick = async () => {
        const u = I.ifaces[+b.dataset.ifshare];
        if (typeof catalogUI !== "object" || !catalogUI.signedIn()) return ($("catMsg").textContent = "Sign in (Account, on the left) to share an interface.");
        if (!confirm(`Share ${u.name} in the shared catalog?

Its published specs (brand, model, inputs, phantom, pads, sample rates, source page) are submitted for review and shown to everyone once approved. Your layout and notes are not shared.`)) return;
        try {
          await catalogUI.share(u);
          $("catMsg").textContent = "";
          status(`${u.name} submitted: it appears for everyone once it has been reviewed.`);
          catalogUI.render($("ifCat"));
        } catch (err) {
          $("catMsg").textContent = err.message || String(err);
        }
      }),
  );
  const catOpen = $("catOpen");
  if (catOpen) catOpen.onclick = () => (typeof catalogUI === "object" ? catalogUI.render($("ifCat")) : ($("catMsg").textContent = "The shared catalog isn't available here."));
  if (typeof catalogUI === "object" && catalogUI.opened("interface")) catalogUI.render($("ifCat"));
  const take = (text) => {
    const r = parseIface(text);
    if (r.errors) {
      $("ifErr").innerHTML = r.errors.map((e) => `<div>${esc(e)}</div>`).join("");
      return;
    }
    addIface(r.unit);
    draw(true);
    status(`${r.unit.name} added: ${r.unit.preamps} mic preamps. Add it to the patch order to use its inputs.`);
  };
  const copy = $("ifPromptCopy");
  if (copy)
    copy.onclick = () =>
      navigator.clipboard
        .writeText(IFACE_PROMPT)
        .then(() => status("AI prompt copied. Paste it into any AI assistant and fill in the brand and model."))
        .catch(() => {
          $("ifPaste").value = IFACE_PROMPT;
          status("Couldn't reach the clipboard; the prompt is in the box below to copy by hand.");
        });
  const paste = $("ifPasteAdd");
  if (paste) paste.onclick = () => take($("ifPaste").value);
  const file = $("ifFile");
  if (file)
    file.onchange = () => {
      const f = file.files && file.files[0];
      if (!f) return;
      if (f.size > 200000) {
        $("ifErr").textContent = "That file is too big for an interface description.";
        return;
      }
      f.text().then(take);
    };
}
