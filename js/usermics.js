/* Add a mic with its specs (Mic database › "Add a mic with its specs"; BACKLOG accounts phase 5, mics).
   Like Gear › Interfaces: an AI prompt (MIC_PROMPT below; the same text is in docs/prompts/add-mic.md) gets any AI
   assistant to reply with the mic's published specs in the format rectoolbox.mic/1; the reply is checked here, then
   the mic joins the Mic database as one of "your mics" (kept in the layout's inventory, like added interfaces) and can
   be added to the plan like any other. A mic with a source page can be shared in the shared catalog (js/catalog.js),
   where an admin checks it before anyone else sees it. */
const MIC_FORMAT = "rectoolbox.mic/1";
const MIC_TYPES = ["LDC", "SDC", "Dynamic", "Ribbon", "Clip-on condenser", "Miniature condenser", "Condenser (handheld)", "Tube LDC", "Tube SDC", "SDC (XY stereo)", "Shotgun", "Boundary condenser"];
const MIC_POWER = ["Phantom", "Phantom or battery", "None", "Power supply"];

/* Your added mics join the Mic database; called whenever the inventory is (re)loaded. */
function applyUserMics() {
  for (let i = MICDB.length - 1; i >= 0; i--) if (MICDB[i].user) MICDB.splice(i, 1);
  ((typeof inv === "function" && inv().userMics) || []).forEach((r) => MICDB.push({ ...r, user: 1 }));
}

const MIC_PROMPT = `I want to add a microphone to Rec Toolbox, a planner for recording live ensembles.
Brand and model: [TYPE THE BRAND AND MODEL NUMBER HERE]

Look up the manufacturer's published specifications (product page or manual) for that exact model and reply with one
JSON object in this format, then a short check list. Nothing else.

{
  "format": "rectoolbox.mic/1",
  "brand": "Shure",
  "model": "SM57",
  "type": "Dynamic",
  "patterns": "cardioid",
  "sensitivityMvPerPa": 1.6,
  "maxSplDb": null,
  "maxSplWithPadDb": null,
  "selfNoiseDbA": null,
  "pad": false,
  "highPassFilter": false,
  "power": "None",
  "inProduction": true,
  "goodFor": "Snare, guitar amps, brass, almost anything close",
  "source": "https://www.shure.com/..."
}

Fields:
- type: one of ${MIC_TYPES.join(", ")}.
- patterns: the polar pattern or patterns, in plain words (omni, wide cardioid, cardioid, supercardioid, hypercardioid, figure-8); for a switchable mic list them separated by commas.
- sensitivityMvPerPa: sensitivity in mV/Pa at 1 kHz (convert from dBV/Pa if needed: mV/Pa = 1000 × 10^(dBV/20)).
- maxSplDb: maximum SPL in dB for the standard distortion figure the maker states; maxSplWithPadDb: the same with the pad engaged; null if there is no pad.
- selfNoiseDbA: equivalent self-noise in dB(A); null for a dynamic or ribbon mic if not published.
- pad and highPassFilter: true if the mic itself has a pad switch or a high-pass filter.
- power: one of ${MIC_POWER.join(", ")}.
- inProduction: true if the maker still sells it.
- goodFor: a short phrase from the maker's applications list.
- source: the page you used.

Rules: use only the manufacturer's numbers; if something isn't published, use null and say so in the check list.
Plain JSON (no comments, no trailing commas). After the JSON, write "Please check:" and up to five things the owner
should confirm on the microphone itself.`;

/* Find the JSON object in a file or a pasted AI reply and check it. Returns { row } (a Mic database row) or { errors }. */
function parseMic(text) {
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
  const str = (v, max = 120) => typeof v === "string" && v.trim() && v.length <= max;
  const num = (v, lo, hi) => v == null || (typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi);
  if (o.format !== MIC_FORMAT) errors.push(`"format" must be "${MIC_FORMAT}".`);
  if (!str(o.brand, 80)) errors.push('"brand" is missing.');
  if (!str(o.model, 80)) errors.push('"model" is missing.');
  if (!MIC_TYPES.includes(o.type)) errors.push(`"type" must be one of ${MIC_TYPES.join(", ")}.`);
  if (!str(o.patterns) || !/omni|cardioid|figure|shotgun|XY|bidirectional/i.test(o.patterns)) errors.push('"patterns" must name the polar pattern, e.g. "cardioid".');
  if (!num(o.sensitivityMvPerPa, 0.05, 1000)) errors.push('"sensitivityMvPerPa" must be a number from 0.05 to 1000, or null.');
  if (!num(o.maxSplDb, 80, 200)) errors.push('"maxSplDb" must be a number from 80 to 200, or null.');
  if (!num(o.maxSplWithPadDb, 80, 220)) errors.push('"maxSplWithPadDb" must be a number from 80 to 220, or null.');
  if (o.maxSplDb != null && o.maxSplWithPadDb != null && o.maxSplWithPadDb < o.maxSplDb) errors.push('"maxSplWithPadDb" can\'t be lower than "maxSplDb".');
  if (!num(o.selfNoiseDbA, -5, 60)) errors.push('"selfNoiseDbA" must be a number from -5 to 60, or null.');
  if (typeof o.pad !== "boolean") errors.push('"pad" must be true or false.');
  if (typeof o.highPassFilter !== "boolean") errors.push('"highPassFilter" must be true or false.');
  if (!MIC_POWER.includes(o.power)) errors.push(`"power" must be one of ${MIC_POWER.join(", ")}.`);
  if (typeof o.inProduction !== "boolean") errors.push('"inProduction" must be true or false.');
  if (o.goodFor != null && !str(o.goodFor, 160)) errors.push('"goodFor" must be a short phrase.');
  if (errors.length) return { errors };
  const src = typeof o.source === "string" && /^https?:\/\//.test(o.source) ? o.source.slice(0, 300) : null;
  return {
    row: {
      b: o.brand.trim(),
      m: o.model.trim(),
      t: o.type,
      p: o.patterns.trim(),
      s: o.sensitivityMvPerPa,
      x: o.maxSplDb,
      xp: o.maxSplWithPadDb,
      n: o.selfNoiseDbA,
      pad: o.pad ? 1 : 0,
      hpf: o.highPassFilter ? 1 : 0,
      pw: o.power,
      prod: o.inProduction ? "Yes" : "No",
      u: (o.goodFor || "").trim() || "Not stated",
      src: src ? [src] : undefined,
      checks: (String(text).split(/please check:?/i)[1] || "").trim().slice(0, 600) || undefined,
    },
  };
}
/* The record to share (the AI reply's own format) from a row. */
function micToData(r) {
  return {
    format: MIC_FORMAT,
    brand: r.b,
    model: String(r.m),
    type: r.t,
    patterns: r.p,
    sensitivityMvPerPa: r.s ?? null,
    maxSplDb: r.x ?? null,
    maxSplWithPadDb: r.xp ?? null,
    selfNoiseDbA: r.n ?? null,
    pad: !!r.pad,
    highPassFilter: !!r.hpf,
    power: r.pw,
    inProduction: r.prod === "Yes",
    goodFor: r.u,
    source: (r.src && r.src[0]) || null,
  };
}
function addUserMic(row) {
  const I = inv();
  I.userMics = I.userMics || [];
  const at = I.userMics.findIndex((x) => x.b === row.b && String(x.m) === String(row.m));
  if (at >= 0) I.userMics[at] = row;
  else I.userMics.push(row);
  applyUserMics();
}

/* ---- Mic database › Add a mic with its specs ---- */
const userMicsUI = (() => {
  const e = (v) => (typeof esc === "function" ? esc(v) : String(v));
  function render() {
    const box = $("umWrap");
    if (!box) return;
    const mine = (inv().userMics || []).slice();
    box.innerHTML = `<p class="m">No code changes needed: ask any AI assistant for the mic's published specs in Rec Toolbox's format, then add the reply here. Your mic joins the database above and can be added to the plan like any other.</p>
<div class="row"><button id="umPromptCopy">Copy the AI prompt</button><span class="m">Paste it into any AI assistant and fill in the brand and model.</span></div>
<textarea id="umPaste" rows="4" placeholder="Paste the AI's reply here…" aria-label="AI reply with the mic JSON" style="width:100%"></textarea>
<div class="row"><button id="umPasteAdd">Add from pasted reply</button><label class="m">or <input type="file" id="umFile" accept=".json,application/json,text/plain" aria-label="Mic file"></label></div><div id="umErr" class="err" aria-live="polite"></div>
${
  mine.length
    ? `<h4>Your added mics</h4>${mine
        .map(
          (r, i) =>
            `<div class="ifCard"><b>${e(r.b)} ${e(r.m)}</b> · ${e(r.t)} · ${e(r.p)}${r.s != null ? ` · ${r.s} mV/Pa` : ""}${r.x != null ? ` · max ${r.x} dB` : ""}${r.src ? ` · <a href="${e(r.src[0])}" target="_blank" rel="noopener">source</a>` : ""} <button class="hb" data-umdel="${i}" aria-label="Remove ${e(r.b)} ${e(r.m)}">✕</button>${
              r.src ? ` <button class="hb" data-umshare="${i}" title="Share this mic's published specs in the shared catalog after review" aria-label="Share ${e(r.b)} ${e(r.m)} in the shared catalog">Share</button>` : ""
            }${r.checks ? `<div class="m">Please check: ${e(r.checks)}</div>` : ""}</div>`,
        )
        .join("")}`
    : ""
}
<h4>Shared catalog</h4><p class="m">Mics other people added and had checked. Add one to your mics, or share one of yours (Share, above): it appears for everyone only after it has been reviewed. Needs a connection.</p>
<div class="row"><button id="umCatOpen">Browse the shared catalog</button><span id="umCatMsg" class="err" aria-live="polite"></span></div><div id="umCat"></div>`;
    const take = (text) => {
      const r = parseMic(text);
      if (r.errors) {
        $("umErr").innerHTML = r.errors.map((x) => `<div>${e(x)}</div>`).join("");
        return;
      }
      addUserMic(r.row);
      renderDbGrid();
      status(`${r.row.b} ${r.row.m} added to the Mic database. Check the specs against the mic.`);
      render();
    };
    $("umPromptCopy").onclick = async () => {
      try {
        await navigator.clipboard.writeText(MIC_PROMPT);
        status("Prompt copied. Paste it into an AI assistant and fill in the brand and model.");
      } catch (err) {
        $("umPaste").value = MIC_PROMPT;
        $("umPaste").select();
        status("Copy blocked here: the prompt is in the box, select it and copy.");
      }
    };
    $("umPasteAdd").onclick = () => take($("umPaste").value);
    $("umFile").onchange = async () => {
      const f = $("umFile").files[0];
      if (f) take(await f.text());
    };
    box.querySelectorAll("[data-umdel]").forEach(
      (b) =>
        (b.onclick = () => {
          const I = inv(),
            r = I.userMics.splice(+b.dataset.umdel, 1)[0];
          applyUserMics();
          renderDbGrid();
          status(`${r.b} ${r.m} removed from your mics (any copy already in the plan stays there).`);
          render();
        }),
    );
    box.querySelectorAll("[data-umshare]").forEach(
      (b) =>
        (b.onclick = async () => {
          const r = inv().userMics[+b.dataset.umshare];
          if (typeof catalogUI !== "object" || !catalogUI.signedIn()) return ($("umCatMsg").textContent = "Sign in (Account, on the left) to share a mic.");
          if (!confirm(`Share ${r.b} ${r.m} in the shared catalog?\n\nIts published specs (brand, model, type, patterns, sensitivity, max SPL, self-noise, power, source page) are submitted for review and shown to everyone once approved. Your layout and notes are not shared.`)) return;
          try {
            await catalogUI.shareMic(micToData(r));
            $("umCatMsg").textContent = "";
            status(`${r.b} ${r.m} submitted: it appears for everyone once it has been reviewed.`);
            catalogUI.render($("umCat"), "mic");
          } catch (err) {
            $("umCatMsg").textContent = err.message || String(err);
          }
        }),
    );
    $("umCatOpen").onclick = () => catalogUI.render($("umCat"), "mic");
    if (typeof catalogUI === "object" && catalogUI.opened("mic")) catalogUI.render($("umCat"), "mic");
  }
  return { render };
})();
