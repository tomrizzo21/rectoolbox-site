/* 3D mic model viewer for the Mic database's info card (BACKLOG A-mic3d): one model from models/mics/<key>.glb
   (data/mic-models.js says which mics have one), drag to orbit, wheel or pinch-free +/- to zoom, double-click to
   reset, and optional markers: green = capsule and the way it faces, red = live rear face, orange = mount and the
   direction the stand comes from, blue = clamp pivot.
   It draws only when something changes (load, drag, zoom, resize), never in a loop: these models are 150k faces and
   a continuous loop made a test machine crawl (2026-11-13). Loaded models are kept, so reopening a card is instant. */
const micModel3D = (() => {
  const cache = {};
  let live = null; // the open viewer, so a new card disposes the old one

  function load(key) {
    if (!cache[key])
      cache[key] = new Promise((ok, bad) =>
        new THREE.GLTFLoader().load("models/mics/" + encodeURIComponent(key) + ".glb", (g) => ok(g.scene), undefined, bad),
      );
    return cache[key];
  }

  function markers(meta, box, size, centre) {
    const g = new THREE.Group(),
      at = (f) => new THREE.Vector3(...f).multiply(size).add(box.min).sub(centre),
      L = size.length() * 0.45,
      top = (o) => (o.traverse((x) => { if (x.material) { x.material.depthTest = false; x.material.transparent = true; } x.renderOrder = 10; }), o),
      arrow = (p, d, c) => g.add(top(new THREE.ArrowHelper(new THREE.Vector3(...d).normalize(), p, L, c, L * 0.25, L * 0.12)));
    arrow(at(meta.capsule), meta.aim, 0x33dd55);
    if (meta.rear) arrow(at(meta.capsule), meta.aim.map((v) => -v), 0xdd4444);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(size.length() * 0.03, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff9922 }));
    ball.position.copy(at(meta.mount));
    g.add(top(ball));
    arrow(at(meta.mount), meta.mountDir, 0xff9922);
    if (meta.pivot) {
      arrow(at(meta.pivot.at), meta.pivot.axis, 0x3399ff);
      arrow(at(meta.pivot.at), meta.pivot.axis.map((v) => -v), 0x3399ff);
    }
    return g;
  }

  /* Open a viewer inside `host` for the mic named `name`. Returns false when that mic has no site model. */
  function open(host, name) {
    const meta = typeof micModelFor === "function" && micModelFor(name);
    if (!meta || meta.noSite || !window.THREE || !THREE.GLTFLoader) return false;
    close();
    host.innerHTML = `<div class="mm3d"><canvas aria-label="3D model of ${name}"></canvas><div class="mm3dMsg m">Loading the 3D model…</div>
      <div class="mm3dTools"><button class="chip" data-m3="out" title="Zoom out">−</button><button class="chip" data-m3="in" title="Zoom in">+</button>
      <label class="m"><input type="checkbox" data-m3="marks"> Capsule and mount</label></div></div>`;
    const cv = host.querySelector("canvas"),
      msg = host.querySelector(".mm3dMsg"),
      R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }),
      S = new THREE.Scene(),
      cam = new THREE.PerspectiveCamera(30, 1, 0.001, 50);
    R.setPixelRatio(Math.min(2, devicePixelRatio));
    R.outputEncoding = THREE.sRGBEncoding;
    R.physicallyCorrectLights = true;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    S.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(2, 3, 4);
    S.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 1.2);
    fill.position.set(-3, 1, -2);
    S.add(fill);
    const v = { az: 0.6, el: 0.15, dist: 1, home: 1, marks: null, queued: false, R };
    const draw = () => {
      v.queued = false;
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      if (cv.width !== Math.round(w * R.getPixelRatio())) R.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      cam.position.set(v.dist * Math.sin(v.az) * Math.cos(v.el), v.dist * Math.sin(v.el), v.dist * Math.cos(v.az) * Math.cos(v.el));
      cam.lookAt(0, 0, 0);
      R.render(S, cam);
    };
    const redraw = () => {
      if (v.queued) return;
      v.queued = true;
      requestAnimationFrame(draw);
      setTimeout(() => v.queued && draw(), 150); // a hidden page gets no animation frames
    };
    v.redraw = redraw;
    let drag = null;
    cv.addEventListener("pointerdown", (e) => ((drag = { x: e.clientX, y: e.clientY }), cv.setPointerCapture(e.pointerId)));
    cv.addEventListener("pointerup", () => (drag = null));
    cv.addEventListener("pointermove", (e) => {
      if (!drag) return;
      v.az -= (e.clientX - drag.x) * 0.01;
      v.el = Math.max(-1.4, Math.min(1.4, v.el + (e.clientY - drag.y) * 0.01));
      drag = { x: e.clientX, y: e.clientY };
      redraw();
    });
    cv.addEventListener("wheel", (e) => (e.preventDefault(), (v.dist *= Math.exp(e.deltaY * 0.001)), redraw()), { passive: false });
    cv.addEventListener("dblclick", () => ((v.az = 0.6), (v.el = 0.15), (v.dist = v.home), redraw()));
    host.querySelectorAll("[data-m3=in],[data-m3=out]").forEach((b) =>
      b.addEventListener("click", () => ((v.dist *= b.dataset.m3 === "in" ? 0.8 : 1.25), redraw())),
    );
    const ro = new ResizeObserver(redraw);
    ro.observe(cv);
    v.ro = ro;
    live = v;
    if (location.protocol === "file:") {
      // a page opened straight from disk may not read files next to it (the browser blocks it), so say why
      msg.textContent = "3D models load on rectoolbox.net or from a local web server, not from a page opened as a file.";
      return true;
    }
    load(meta.key).then(
      (scene) => {
        if (live !== v) return;
        const o = scene.clone(),
          box = new THREE.Box3().setFromObject(o),
          size = box.getSize(new THREE.Vector3()),
          centre = box.getCenter(new THREE.Vector3());
        o.position.sub(centre);
        S.add(o);
        v.dist = v.home = size.length() * 3.2;
        const mk = markers(meta, box, size, centre);
        mk.visible = false;
        S.add(mk);
        host.querySelector("[data-m3=marks]").addEventListener("change", (e) => ((mk.visible = e.target.checked), redraw()));
        msg.textContent = `${Math.round(size.y * 1000)} mm tall · ${meta.address}-address · drag to turn, wheel to zoom`;
        redraw();
      },
      () => (msg.textContent = "The 3D model could not be loaded."),
    );
    return true;
  }

  function close() {
    if (!live) return;
    live.ro.disconnect();
    live.R.dispose();
    live = null;
  }

  return { open, close, has: (name) => { const m = typeof micModelFor === "function" && micModelFor(name); return !!(m && !m.noSite); } };
})();
