/* Switch: passphrase protection of the demo recordings. OFF by default. The protect tool (tools/protect-demo.html) sets this to true in the copy it makes. */
const RT_CONFIG = { demoProtection: false };
/* ---------- playback visualizer (live, in the browser) ---------- */
(function () {
  const FAM = [
    ["snr", "Snares"],
    ["qd", "Quads"],
    ["bd", "Bass drums"],
    ["cym", "Cymbals"],
    ["sou", "Sousaphones"],
    ["tb", "Trombones"],
    ["bar", "Baritones"],
    ["mel", "Mellophones"],
    ["tpt", "Trumpets"],
    ["tsx", "Tenor saxes"],
    ["sax", "Alto saxes"],
    ["cl", "Clarinets"],
    ["fl", "Flutes"],
    ["pic", "Piccolos"],
  ];
  const PERC = ["snr", "qd", "bd", "cym"];
  let pre = null,
    ctx = null,
    an = null,
    src = null,
    media = null,
    raf = 0,
    micStream = null,
    basis = null,
    basisKey = "",
    act = {},
    peak = {},
    slow = null,
    prevFast = null,
    lastT = 0,
    hist = [],
    gpeak = 1e-12;
  FAM.forEach(([k]) => {
    act[k] = 0;
    peak[k] = 1e-12;
  });
  /* Analysis recorder (accounts phase 4, js/analyses.js): while a file or the microphone is analysed live, keep each
     family's activity (0–100, 10 per second) and the 8 band levels (dB, 2 per second). Numbers only, never audio. */
  const REC_FPS = 10,
    BAND_FPS = 2;
  let rec = null;
  const recReset = (source) => {
    rec = source ? { source, t: 0, a: Object.fromEntries(FAM.map(([k]) => [k, []])), bands: [] } : null;
    if (typeof analysesUI === "object") analysesUI.recChanged();
  };
  function recFrame(dt, band) {
    if (!rec) return;
    rec.t += dt;
    while (rec.a.snr.length < Math.floor(rec.t * REC_FPS + 1e-6)) for (const [k] of FAM) rec.a[k].push(Math.round(act[k] * 100));
    if (band && rec.bands.length < Math.floor(rec.t * BAND_FPS + 1e-6)) rec.bands.push(band.map((e) => Math.round(10 * Math.log10(e))));
    if (rec.a.snr.length % REC_FPS === 0 && typeof analysesUI === "object") analysesUI.recChanged();
  }
  /* A saved analysis plays back on a timer: no audio, the heatmap follows the stored activity. */
  class ReplayPlayer {
    constructor(duration) {
      this.duration = duration;
      this.paused = true;
      this.off = 0;
      this.t0 = 0;
      this.readyState = 4;
      this.tagName = "REPLAY";
      this.onended = null;
    }
    get currentTime() {
      if (this.paused) return this.off;
      const t = this.off + (performance.now() - this.t0) / 1000;
      if (t >= this.duration) {
        this.paused = true;
        this.off = 0;
        if (this.onended) this.onended();
        return this.duration;
      }
      return t;
    }
    set currentTime(t) {
      this.off = Math.max(0, Math.min(this.duration, t));
      this.t0 = performance.now();
    }
    play() {
      this.t0 = performance.now();
      this.paused = false;
      return Promise.resolve();
    }
    pause() {
      if (!this.paused) this.off = this.currentTime;
      this.paused = true;
    }
  }
  window.__pbRec = {
    // what Save analysis stores (null until there are at least 2 s)
    result: () =>
      rec && rec.a.snr.length >= 2 * REC_FPS
        ? { v: 1, source: rec.source, file: rec.file || null, duration: +(rec.a.snr.length / REC_FPS).toFixed(1), fps: REC_FPS, a: rec.a, bandFps: BAND_FPS, bandHz: [63, 125, 250, 500, 1000, 2000, 4000, 8000], bands: rec.bands }
        : null,
    seconds: () => (rec ? rec.a.snr.length / REC_FPS : 0),
    hash: fileHash,
    fileObj: () => (rec && rec.file ? rec.fobj : null),
    // play this file with a saved analysis (the caller checked the fingerprint)
    attach: (f, saved) => loadFile(f, saved),
    // for tests (no audio in a headless browser): record `seconds` of the current activity
    feed: (seconds, source = "Test recording") => {
      if (!rec) recReset(source);
      for (let i = 0; i < seconds * REC_FPS; i++) recFrame(1 / REC_FPS, new Array(8).fill(1e-3));
    },
    open: (r) => {
      stopMic();
      if (media) media.pause();
      $("pbVideo").style.display = "none";
      $("pbDemo").value = "";
      recReset(null);
      media = new ReplayPlayer(r.duration);
      media.onended = () => ($("pbPlay").textContent = "▶ Play");
      pre = { fps: r.fps, a: r.a, mx: Object.fromEntries(FAM.map(([k]) => [k, 100])) };
      $("pbMode").textContent = `Saved analysis: ${r.name || r.source} (replay without audio)`;
      $("pbPlay").textContent = "▶ Play";
      $("pbPlay").disabled = false;
      $("pbSeek").disabled = false;
      tick();
    },
  };
  $("pbBars").innerHTML = FAM.map(
    ([k, l]) =>
      `<div class="fam"><span>${l}</span><span class="tr"><i id="fb_${k}" style="width:0;background:${KIND[k].c}"></i></span><span class="m" id="fv_${k}">–</span></div>`,
  ).join("");
  const err = (t) => {
    $("pbErr").textContent = t || "";
  };
  function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      an = ctx.createAnalyser();
      an.fftSize = 4096;
      an.smoothingTimeConstant = 0;
    }
    if (ctx.state === "suspended") ctx.resume();
  }
  function stopMic() {
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
      $("pbMic").textContent = "Use microphone";
    }
  }

  const demoEl = {};
  // Demo tracks are decoded straight into Web Audio (the published page blocks data: URLs in <audio>)
  class BufPlayer {
    constructor(buf) {
      this.buf = buf;
      this.duration = buf.duration;
      this.paused = true;
      this.off = 0;
      this.t0 = 0;
      this.node = null;
      this.readyState = 4;
      this.tagName = "BUF";
      this.onended = null;
    }
    get currentTime() {
      return this.paused ? this.off : Math.min(this.duration, this.off + ctx.currentTime - this.t0);
    }
    set currentTime(t) {
      const was = !this.paused;
      if (was) this._stop();
      this.off = Math.max(0, Math.min(this.duration, t));
      if (was) this._start();
    }
    _start() {
      const n = ctx.createBufferSource();
      n.buffer = this.buf;
      n.connect(an);
      try {
        an.connect(ctx.destination);
      } catch (e) {
        /* already connected */
      }
      n.onended = () => {
        if (this.node === n && !this.paused && this.currentTime >= this.duration - 0.05) {
          this.paused = true;
          this.off = 0;
          this.node = null;
          if (this.onended) this.onended();
        }
      };
      this.node = n;
      this.t0 = ctx.currentTime;
      n.start(0, this.off);
      this.paused = false;
    }
    _stop() {
      if (this.node) {
        const n = this.node;
        this.node = null;
        try {
          n.stop();
        } catch (e) {
          /* already stopped */
        }
      }
    }
    play() {
      ensureCtx();
      if (this.paused) this._start();
      return Promise.resolve();
    }
    pause() {
      if (!this.paused) {
        this.off = this.currentTime;
        this._stop();
        this.paused = true;
      }
    }
  }
  // Protected copies carry window.DEMO_ENC (AES-GCM, key from a passphrase via PBKDF2) instead of window.DEMO_AUDIO; decryption happens here in the browser
  const demoProtected = () => RT_CONFIG.demoProtection && !window.DEMO_AUDIO && !!window.DEMO_ENC;
  let demoKey = null;
  const unb64 = (x) => Uint8Array.from(atob(x), (c) => c.charCodeAt(0));
  async function deriveDemoKey(pass) {
    const E = window.DEMO_ENC,
      base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: unb64(E.salt), iterations: E.iter, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
  }
  async function unlockDemo(pass) {
    const E = window.DEMO_ENC;
    const k = await deriveDemoKey(pass);
    try {
      await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(E.check.iv) }, k, unb64(E.check.ct));
    } catch (e) {
      return false;
    }
    demoKey = k;
    return true;
  }
  function lockUI() {
    const p = demoProtected();
    $("pbLock").hidden = !p || !!demoKey;
    $("pbDemo").disabled = p && !demoKey;
  }
  // The demo recordings load on first use (js/load-data.js); a protected copy needs them up front to show the lock.
  if (RT_CONFIG.demoProtection)
    loadData("demo").then(
      () => demoProtected() && restoreUnlock(),
      (e) => console.warn("[demo]", e),
    );
  function restoreUnlock() {
    lockUI();
    let sp = null;
    try {
      sp = sessionStorage.getItem("rt-demo-pass");
    } catch (e) {
      /* session storage blocked */
    }
    if (sp)
      unlockDemo(sp)
        .then((ok) => {
          if (!ok)
            try {
              sessionStorage.removeItem("rt-demo-pass");
            } catch (e) {
              /* session storage blocked */
            }
          lockUI();
        })
        .catch(() => {});
  }
  $("pbUnlock").onclick = async () => {
    const pw = $("pbPass").value;
    if (!pw) {
      $("pbLockMsg").textContent = "Enter the passphrase.";
      return;
    }
    if (!window.crypto || !crypto.subtle) {
      $("pbLockMsg").textContent = "Unlocking needs a secure (https) page.";
      return;
    }
    $("pbLockMsg").textContent = "Checking…";
    const ok = await unlockDemo(pw);
    if (!ok) {
      $("pbLockMsg").textContent = "That passphrase is not right.";
      return;
    }
    try {
      sessionStorage.setItem("rt-demo-pass", pw);
    } catch (e) {
      /* session storage blocked */
    }
    $("pbPass").value = "";
    lockUI();
    status("Demo unlocked. Pick a recording.");
  };
  $("pbPass").onkeydown = (e) => {
    if (e.key === "Enter") $("pbUnlock").click();
  };
  async function demoBytes(k) {
    if (window.DEMO_AUDIO) {
      const s = window.DEMO_AUDIO[k];
      return unb64(s.slice(s.indexOf(",") + 1)).buffer;
    }
    if (!RT_CONFIG.demoProtection) throw new Error("protection-off");
    if (!demoKey) throw new Error("locked");
    const E = window.DEMO_ENC[k];
    return await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(E.iv) }, demoKey, unb64(E.ct));
  }
  async function loadDemo(k) {
    if (demoEl[k]) return demoEl[k];
    const buf = await ctx.decodeAudioData(await demoBytes(k));
    demoEl[k] = new BufPlayer(buf);
    return demoEl[k];
  }
  $("pbDemo").onchange = async () => {
    const k = $("pbDemo").value;
    if (!k) return;
    err();
    stopMic();
    if (media) media.pause();
    $("pbVideo").style.display = "none";
    ensureCtx();
    if (src) {
      try {
        src.disconnect();
      } catch (e) {
        /* already disconnected */
      }
      src = null;
    }
    $("pbPlay").disabled = true;
    recReset(null);
    $("pbMode").textContent = "Decoding the demo…";
    let P;
    try {
      if (!window.DEMO_ACTS) {
        $("pbMode").textContent = "Loading the demo recordings…";
        await loadData("demo");
        $("pbMode").textContent = "Decoding the demo…";
      }
      P = await loadDemo(k);
    } catch (e) {
      err(
        e && e.message === "protection-off"
          ? "This copy holds encrypted demo recordings, but demo protection is switched off in the page (RT_CONFIG.demoProtection). Use the unprotected file, or switch it on."
          : "The demo couldn't be decoded in this browser.",
      );
      $("pbMode").textContent = "";
      return;
    }
    media = P;
    media.currentTime = 0;
    media.onended = () => {
      $("pbPlay").textContent = "▶ Play";
    };
    const A = window.DEMO_ACTS[k];
    pre = {
      fps: window.DEMO_ACTS.fps,
      a: A,
      mx: Object.fromEntries(Object.entries(A).map(([f, v]) => [f, Math.max(20, ...v)])),
    };
    $("pbMode").textContent = "Pre-analyzed: drum hits flash individually; winds follow register (low / mid / high)";
    $("pbPlay").textContent = "▶ Play";
    $("pbPlay").disabled = false;
    $("pbSeek").disabled = false;
    tick();
    status("Demo loaded. Press Play.");
  };
  /* A file's fingerprint (SHA-256 of its bytes): a saved analysis remembers it, so the same recording can be
     reattached later. The audio itself is never stored. */
  async function fileHash(f) {
    const d = await crypto.subtle.digest("SHA-256", await f.arrayBuffer());
    return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  $("pbFile").onchange = () => {
    const f = $("pbFile").files[0];
    if (f) loadFile(f);
  };
  /* Load a recording. Without `saved`: live analysis (and it can be saved). With `saved` (a saved analysis whose
     fingerprint matches this file): play the audio while the heatmap follows the saved analysis. */
  function loadFile(f, saved) {
    err();
    stopMic();
    ensureCtx();
    pre = saved ? { fps: saved.fps, a: saved.a, mx: Object.fromEntries(FAM.map(([k]) => [k, 100])) } : null;
    $("pbDemo").value = "";
    $("pbMode").textContent = saved ? `Saved analysis: ${saved.name} (with its recording)` : "Live analysis";
    recReset(saved ? null : f.name);
    if (!saved) {
      const r = rec;
      rec.fobj = f; // only kept in memory, for the opt-in "Keep the audio in this browser"
      fileHash(f)
        .then((h) => {
          if (rec !== r) return; // another file was loaded meanwhile
          rec.file = { name: f.name.slice(0, 200), size: f.size, sha256: h };
          if (typeof analysesUI === "object") analysesUI.fileLoaded(rec.file, f);
        })
        .catch(() => {
          /* no fingerprint (e.g. crypto unavailable on file://): the analysis can still be saved */
        });
    }
    const isV = f.type.startsWith("video");
    const v = $("pbVideo");
    if (src) {
      try {
        src.disconnect();
      } catch (e) {
        /* already disconnected */
      }
    }
    if (media && media !== v) {
      media.pause();
    }
    media = isV ? v : media && media.tagName === "AUDIO" ? media : new Audio();
    media.src = URL.createObjectURL(f);
    v.style.display = isV ? "block" : "none";
    if (!media._src) {
      media._src = ctx.createMediaElementSource(media);
    }
    src = media._src;
    src.connect(an);
    an.connect(ctx.destination);
    media.onloadedmetadata = () => {
      $("pbPlay").disabled = false;
      $("pbSeek").disabled = false;
      tick();
    };
    media.onended = () => {
      $("pbPlay").textContent = "▶ Play";
    };
    media.onerror = async () => {
      // the published page may block blob: media; decode the file's audio into Web Audio instead
      try {
        $("pbMode").textContent = "Decoding the file…";
        const buf = await ctx.decodeAudioData(await f.arrayBuffer());
        v.style.display = "none";
        media = new BufPlayer(buf);
        media.onended = () => {
          $("pbPlay").textContent = "▶ Play";
        };
        $("pbMode").textContent = saved ? `Saved analysis: ${saved.name} (with its recording)` : "Live analysis";
        $("pbPlay").disabled = false;
        $("pbSeek").disabled = false;
        tick();
      } catch (e) {
        $("pbMode").textContent = "";
        err("This file couldn't be played. Try an MP3, M4A, WAV or MP4.");
      }
    };
    $("pbPlay").textContent = "▶ Play";
    status(`Loaded ${f.name}. Press Play.`);
  }
  $("pbPlay").onclick = () => {
    if (!media) return;
    ensureCtx();
    if (media.paused) {
      if (media.tagName === "BUF" && src) {
        try {
          src.disconnect();
        } catch (e) {
          /* already disconnected */
        }
        src = null;
      }
      media
        .play()
        .then(() => {
          $("pbPlay").textContent = "❚❚ Pause";
          start();
        })
        .catch(() => err("Playback was blocked. Click Play again."));
    } else {
      media.pause();
      $("pbPlay").textContent = "▶ Play";
    }
  };
  $("pbSeek").oninput = () => {
    if (media && media.duration) media.currentTime = ($("pbSeek").value / 1000) * media.duration;
  };
  $("pbMic").onclick = async () => {
    if (micStream) {
      stopMic();
      return;
    }
    err();
    ensureCtx();
    pre = null;
    $("pbMode").textContent = "Live analysis (microphone)";
    recReset("Microphone, " + new Date().toLocaleString());
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (media) media.pause();
      if (src) {
        try {
          src.disconnect();
        } catch (e) {
          /* already disconnected */
        }
      }
      try {
        an.disconnect();
      } catch (e) {
        /* already disconnected */
      }
      src = ctx.createMediaStreamSource(micStream);
      src.connect(an);
      $("pbMic").textContent = "Stop microphone";
      start();
    } catch (e) {
      err("The microphone isn't available here. Open the downloaded file in your browser, or allow microphone access.");
    }
  };
  const fmt = (t) => (isFinite(t) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}` : "0:00");
  // per-group heat basis: direct-sound energy at 5 ft from that group alone
  function buildBasis() {
    const key = JSON.stringify([
        VMAX,
        UMAX,
        st.risers,
        st.groups.map((G) => [G.k, G.v, G.u, G.n, G.a, G.shape, G.rot]),
      ]),
      dc = 0;
    if (key === basisKey && basis) return;
    basisKey = key;
    const nv = Math.ceil(VMAX / HEATSTEP),
      nu = Math.ceil((UMAX - U0) / HEATSTEP);
    basis = { nv, nu, g: {} };
    for (const G of st.groups) {
      const K = KIND[G.kind],
        arr = new Float32Array(nv * nu),
        L10 = 10 ** (K.L / 10),
        pp = people(G);
      for (let i = 0; i < nv; i++)
        for (let j = 0; j < nu; j++) {
          const v = (i + 0.5) * HEATSTEP,
            u = U0 + (j + 0.5) * HEATSTEP;
          let e = 0;
          for (const q of pp) {
            const dv = v - q.v,
              du = u - q.u,
              dz = 5 - K.h,
              d3 = Math.hypot(dv, du, dz),
              dm = Math.max(0.6, d3 * 0.3048),
              cosb = d3 > 0.01 ? (dv * q.fv + du * q.fu) / d3 : 1;
            e += (L10 * (1 - K.d + K.d * Math.max(0.15, (1 + cosb) / 2) * 1.5)) / (dm * dm);
          }
          arr[i * nu + j] = e;
        }
      basis.g[G.k] = arr;
    }
    let mx = 0;
    const all = new Float32Array(nv * nu);
    for (const k in basis.g) {
      const a = basis.g[k];
      for (let x = 0; x < a.length; x++) all[x] += a[x];
    }
    for (const x of all) if (x > mx) mx = x;
    basis.max = mx;
  }
  const LUT = (() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 1;
    const x = c.getContext("2d");
    for (let i = 0; i < 256; i++) {
      const t = i / 255;
      x.fillStyle = `hsla(${Math.round(230 - 230 * t)},85%,50%,${(0.05 + 0.7 * t).toFixed(3)})`;
      x.fillRect(i, 0, 1, 1);
    }
    return x.getImageData(0, 0, 256, 1).data;
  })();
  function placeCanvas() {
    const cv = $("liveHeat"),
      fb = $("fb").getBoundingClientRect(),
      m = sv.getScreenCTM();
    if (!m) return;
    const sp = (x) => {
        const q = sv.createSVGPoint();
        q.x = x[0];
        q.y = x[1];
        const r = q.matrixTransform(m);
        return [r.x, r.y];
      },
      a = sp(wt(X(VMAX), Y(U0))),
      b = sp(wt(X(0), Y(UMAX))),
      w = (X(0) - X(VMAX)) * m.a,
      h = (Y(UMAX) - Y(U0)) * m.d,
      cx = (a[0] + b[0]) / 2 - fb.left,
      cy = (a[1] + b[1]) / 2 - fb.top;
    Object.assign(cv.style, {
      left: cx - w / 2 + "px",
      top: cy - h / 2 + "px",
      width: w + "px",
      height: h + "px",
      transformOrigin: "50% 50%",
      transform: ROT ? `rotate(${ROT}deg)` : "",
    });
  }
  function fromPre() {
    const i = Math.min(Math.floor(media.currentTime * pre.fps), pre.a.snr.length - 1);
    for (const [k] of FAM) {
      const v = (pre.a[k] || [])[i] || 0;
      act[k] = Math.min(1, v / pre.mx[k]);
    }
  }
  function analyse(dt) {
    if (pre && media && !micStream) {
      fromPre();
      return;
    }
    const bins = an.frequencyBinCount,
      fd = new Float32Array(bins);
    an.getFloatFrequencyData(fd);
    const hz = ctx.sampleRate / an.fftSize,
      cen = [63, 125, 250, 500, 1000, 2000, 4000, 8000];
    const band = cen.map((c) => {
      let e = 0;
      const lo = Math.max(1, Math.floor(c / 1.414 / hz)),
        hi = Math.min(bins - 1, Math.ceil((c * 1.414) / hz));
      for (let i = lo; i <= hi; i++) e += 10 ** (fd[i] / 10);
      return e + 1e-14;
    });
    if (!slow) {
      slow = band.slice();
      prevFast = band.slice();
      hist = [];
    }
    // sustained tone = the quietest each band got over the last ~0.4 s (drum hits come and go; held notes don't)
    hist.push({ t: performance.now(), b: band });
    while (hist.length && performance.now() - hist[0].t > 400) hist.shift();
    const sus = [],
      perc = [];
    for (let b = 0; b < 8; b++) {
      let mn = Infinity;
      for (const h of hist) if (h.b[b] < mn) mn = h.b[b];
      sus.push(mn);
      perc.push(Math.max(0, band[b] - mn * 2));
    }
    // fit sustained energy to wind families, transient energy to drums/cymbals (non-negative least squares, projected gradient)
    const fit = (y, keys) => {
      const A = keys.map((k) => KIND[k].bp),
        x = keys.map(() => 0),
        sc = Math.max(...y) || 1,
        yn = y.map((v) => v / sc);
      for (let it = 0; it < 60; it++)
        for (let j = 0; j < keys.length; j++) {
          let num = 0,
            den = 0;
          for (let b = 0; b < 8; b++) {
            let r = yn[b];
            for (let q = 0; q < keys.length; q++) if (q !== j) r -= A[q][b] * x[q];
            num += A[j][b] * r;
            den += A[j][b] * A[j][b];
          }
          x[j] = Math.max(0, num / (den || 1));
        }
      return Object.fromEntries(keys.map((k, j) => [k, x[j] * sc]));
    };
    const winds = FAM.map((f) => f[0]).filter((k) => !PERC.includes(k));
    const fw = fit(sus.map(Math.sqrt), winds),
      fp = fit(perc.map(Math.sqrt), PERC);
    const raw = { ...fw, ...fp };
    const tot = band.reduce((a, b) => a + b, 0);
    queueMicrotask(() => recFrame(dt, band));
    const sm = +$("pbSmooth").value / 100,
      att = Math.min(1, dt / (0.04 + 0.25 * sm * 0.4)),
      rel = Math.min(1, dt / (0.12 + 1.2 * sm));
    const gmax = Math.max(...FAM.map(([k]) => raw[k] * raw[k]));
    gpeak = Math.max(gmax, gpeak * Math.pow(0.5, dt / 10));
    for (const [k] of FAM) {
      const v = raw[k] * raw[k];
      peak[k] = Math.max(v, peak[k] * Math.pow(0.5, dt / 8));
      const target = tot < 1e-9 ? 0 : Math.min(1, Math.sqrt(v / Math.max(peak[k], gpeak * 0.25)));
      act[k] += (target - act[k]) * (target > act[k] ? att : rel);
    }
  }
  function paint() {
    if (!$("pbAnim").checked) {
      $("liveHeat").hidden = true;
      return;
    }
    buildBasis();
    const cv = $("liveHeat");
    cv.hidden = false;
    $("gHeat").style.display = "none";
    $("gCont").style.display = "none";
    placeCanvas();
    const { nv, nu } = basis;
    if (cv.width !== nv || cv.height !== nu) {
      cv.width = nv;
      cv.height = nu;
    }
    const x = cv.getContext("2d"),
      img = x.createImageData(nv, nu),
      E = new Float32Array(nv * nu);
    for (const G of st.groups) {
      const a = act[G.kind] || 0;
      if (a < 0.003) continue;
      const w = a * a,
        arr = basis.g[G.k];
      for (let i = 0; i < E.length; i++) E[i] += arr[i] * w;
    }
    const top = 10 * Math.log10(basis.max),
      rng = +$("pbRange").value;
    for (let i = 0; i < nv; i++)
      for (let j = 0; j < nu; j++) {
        const e = E[i * nu + j];
        if (e <= 0) continue;
        let t = (10 * Math.log10(e) - (top - rng)) / rng;
        if (t <= 0) continue;
        t = Math.min(1, t);
        const li = Math.round(t * 255) * 4,
          px = (j * nv + (nv - 1 - i)) * 4;
        img.data[px] = LUT[li];
        img.data[px + 1] = LUT[li + 1];
        img.data[px + 2] = LUT[li + 2];
        img.data[px + 3] = LUT[li + 3];
      }
    x.putImageData(img, 0, 0);
  }
  /* ---------- waterfall (real 1/3-octave levels from the analyser) ---------- */
  const ISO = [
    20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150,
    4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000,
  ];
  let wfTick = 0,
    wfMax = -30;
  (function () {
    const ax = $("wfAxis");
    ax.innerHTML =
      [31.5, 125, 500, 2000, 8000]
        .map(
          (f) =>
            `<span style="position:absolute;left:${((ISO.indexOf(f) / ISO.length) * 100 + 100 / ISO.length / 2).toFixed(1)}%;transform:translateX(-50%)">${f >= 1000 ? f / 1000 + "k" : f}</span>`,
        )
        .join("") + `<span style="position:absolute;right:0">Hz</span>`;
  })();
  $("wfClear").onclick = () => {
    const c = $("wfCan");
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
  };
  function wfColour(t, bi) {
    const m = $("wfColor").value;
    if (m === "grey") {
      const g = Math.round(20 + t * 235);
      return `rgb(${g},${g},${g})`;
    }
    if (m === "rainbow") return `hsla(${Math.round((bi / (ISO.length - 1)) * 270)},80%,${Math.round(10 + t * 50)}%,1)`;
    const h = 240 - 240 * t;
    return `hsl(${h},90%,${Math.round(12 + t * 45)}%)`;
  }
  function waterfall() {
    const host = $("wfCan");
    if (!host || !host.offsetParent) return;
    const sp = +$("wfSpeed").value;
    if (wfTick++ % sp) return;
    const bins = an.frequencyBinCount,
      fd = new Float32Array(bins);
    an.getFloatFrequencyData(fd);
    const hz = ctx.sampleRate / an.fftSize;
    const lv = ISO.map((f) => {
      const lo = Math.max(1, Math.floor(f / 1.1225 / hz)),
        hi = Math.min(bins - 1, Math.max(lo, Math.ceil((f * 1.1225) / hz)));
      let e = 0;
      for (let i = lo; i <= hi; i++) e += 10 ** (fd[i] / 10);
      return 10 * Math.log10(e + 1e-20);
    });
    const top = Math.max(...lv);
    wfMax = Math.max(top, wfMax - 0.05);
    const rng = +$("wfRange").value;
    for (const c of [host, $("wfNow")]) {
      const w = Math.round(c.clientWidth * (window.devicePixelRatio || 1));
      if (c.width !== w) c.width = w;
    }
    const W = host.width,
      H = host.height,
      x = host.getContext("2d"),
      bw = W / ISO.length;
    x.drawImage(host, 0, 0, W, H - 2, 0, 2, W, H - 2);
    lv.forEach((v, i) => {
      const t = Math.max(0, Math.min(1, (v - (wfMax - rng)) / rng));
      x.fillStyle = wfColour(t, i);
      x.fillRect(Math.floor(i * bw), 0, Math.ceil(bw), 2);
    });
    const n = $("wfNow"),
      y = n.getContext("2d"),
      NW = n.width,
      NH = n.height;
    y.clearRect(0, 0, NW, NH);
    lv.forEach((v, i) => {
      const t = Math.max(0, Math.min(1, (v - (wfMax - rng)) / rng));
      y.fillStyle = $("wfColor").value === "heat" ? wfColour(t, i) : wfColour(0.85, i);
      y.fillRect((i * NW) / ISO.length + 1, NH - t * NH, NW / ISO.length - 2, t * NH);
    });
  }
  function bars() {
    for (const [k] of FAM) {
      const a = act[k];
      $("fb_" + k).style.width = (a * 100).toFixed(0) + "%";
      $("fv_" + k).textContent = a < 0.02 ? "–" : Math.round(a * 100);
    }
  }
  function running() {
    return (media && !media.paused) || !!micStream;
  }
  function tick() {
    if (media && media.duration) {
      $("pbTime").textContent = `${fmt(media.currentTime)} / ${fmt(media.duration)}`;
      $("pbSeek").value = Math.round((media.currentTime / media.duration) * 1000);
    }
  }
  function loop(t) {
    const dt = Math.min(0.1, lastT ? (t - lastT) / 1000 : 0.016);
    lastT = t;
    if (running()) {
      analyse(dt);
      paint();
      bars();
      tick();
      waterfall();
      raf = requestAnimationFrame(loop);
    } else {
      raf = 0;
      lastT = 0;
      tick();
      // fade out, then hand the field back to the static heatmap
      $("liveHeat").hidden = true;
      $("gHeat").style.display = "";
      $("gCont").style.display = "";
    }
  }
  function start() {
    if (!raf) {
      lastT = 0;
      slow = null;
      raf = requestAnimationFrame(loop);
    }
  }
  $("pbAnim").onchange = () => {
    if (!$("pbAnim").checked) {
      $("liveHeat").hidden = true;
      $("gHeat").style.display = "";
      $("gCont").style.display = "";
    }
  };
  window.addEventListener("resize", () => {
    if (!$("liveHeat").hidden) placeCanvas();
  });
})();
