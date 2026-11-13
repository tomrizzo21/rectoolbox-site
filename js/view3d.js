/* ---------- 3D view ---------- */
(function () {
  let R = null,
    scene,
    cam,
    dirty = true,
    built = false;
  const tgt = { x: VMAX / 2, y: 0, z: 90 };
  let sph = { r: 230, th: -0.9, ph: 0.95 };
  const cv = $("c3");
  const P3 = (v, u, y) => new THREE.Vector3(VMAX - v, y || 0, u);
  const CABLE_Y = 0.12; // cables lie on the floor in 3D, hand-drawn or not (docs/CABLE_ROUTING_PLAN.md)
  const cableLine = (pts, color, kind) => {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts.map((z) => P3(z.v, z.u, CABLE_Y))),
      new THREE.LineBasicMaterial({ color }),
    );
    line.userData.cable = kind;
    scene.add(line);
  };
  /* The 3D camera turns with the canvas (BACKLOG §C): rotating the 2D canvas clockwise by d degrees turns the scene
     clockwise by d degrees in the 3D view too. The camera orbits the other way for that (a point's direction on screen
     is the camera's azimuth minus 90°, so the azimuth falls by d), which is why app.js passes -d. */
  window.__view3dRotate = (rad) => {
    sph.th += rad;
    if (R && !$("v3").hidden) render();
  };
  window.__view3dAzimuth = () => sph.th; // for tests
  window.__pickup3d = () => (scene ? scene.children.filter((o) => o.name === "pickupField").length : 0); // for tests
  window.__spectra3d = () => (scene ? scene.children.filter((o) => o.name === "groupSpectrum").length : 0); // for tests
  // For tests: every cable line's point heights.
  window.__cable3d = () => (scene ? scene.children.filter((o) => o.userData.cable).map((o) => ({ kind: o.userData.cable, ys: [...o.geometry.attributes.position.array].filter((_, i) => i % 3 === 1) })) : []);
  function css(n) {
    return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888";
  }
  function init() {
    if (R) return true;
    if (!window.THREE) {
      $("status").textContent = "3D needs an internet connection to load its drawing library.";
      return false;
    }
    R = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    scene = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(50, 1, 0.5, 3000);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dl = new THREE.DirectionalLight(0xffffff, 0.55);
    dl.position.set(60, 200, 40);
    scene.add(dl);
    bindControls();
    return true;
  }
  function mat(c, o) {
    return new THREE.MeshLambertMaterial({
      color: c,
      transparent: o < 1,
      opacity: o,
      side: THREE.DoubleSide,
      depthWrite: o >= 1,
    });
  }
  function build(skipHeat = false) {
    if (!R) return;
    while (scene.children.length > 2) scene.remove(scene.children[2]);
    R.setClearColor(css("--bg"));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(VMAX, UMAX - U0), mat(css("--field"), 1));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(VMAX / 2, 0, (UMAX + U0) / 2);
    floor.name = "floor";
    scene.add(floor);
    for (const r of st.risers || []) {
      const bx = new THREE.Mesh(new THREE.BoxGeometry(r.d, Math.max(0.05, r.h), r.w), mat(0x9a9488, 1));
      bx.position.copy(P3(r.v, r.u, Math.max(0.05, r.h) / 2));
      scene.add(bx);
    }
    const lm = new THREE.LineBasicMaterial({ color: css("--line2") });
    if ((st.bg || {}).type !== "stage" && (st.bg || {}).type !== "grid")
      for (let yd = -5; yd <= 66; yd += 5) {
        const u = yd * 3;
        if (u < U0 || u > UMAX) continue;
        const g = new THREE.BufferGeometry().setFromPoints([P3(VMAX, u, 0.05), P3(0, u, 0.05)]);
        scene.add(new THREE.Line(g, lm));
      }
    const dir = new THREE.Mesh(new THREE.ConeGeometry(1.5, 6, 16), mat(0xb4322d, 1));
    dir.position.copy(P3(DIR.v, DIR.u, 3));
    scene.add(dir);
    for (const G of st.groups) {
      const K = KIND[G.kind],
        k = scaleK(G);
      const pts = shapeOf(G).out.map(([x, y]) => {
        const q = toField(G, x * k, y * k);
        return new THREE.Vector2(VMAX - q.v, -q.u);
      });
      const shp = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts)), mat(K.c, 0.35));
      shp.rotation.x = -Math.PI / 2;
      shp.position.y = 0.08;
      shp.userData.plannerGroup = G.k;
      scene.add(shp);
      if ($("tPeople").checked) {
        const pp = people(G),
          body = new THREE.CylinderGeometry(0.75, 0.75, K.h, 8);
        body.translate(0, K.h / 2, 0);
        const im = new THREE.InstancedMesh(body, mat(K.c, 1), pp.length);
        const M4 = new THREE.Matrix4();
        pp.forEach((q, i) => {
          M4.makeTranslation(VMAX - q.v, q.e || 0, q.u);
          im.setMatrixAt(i, M4);
        });
        im.userData.plannerGroup = G.k;
        scene.add(im);
        if (!K.drum && !K.cym) {
          const bell = new THREE.SphereGeometry(K.bell ? 1.3 : 0.45, 8, 6);
          const bm = new THREE.InstancedMesh(bell, mat(0xd9b44a, 1), pp.length);
          pp.forEach((q, i) => {
            const r = K.bell ? 0.6 : K.stub || 1;
            M4.makeTranslation(VMAX - (q.v + q.fv * r), K.h, q.u + q.fu * r);
            bm.setMatrixAt(i, M4);
          });
          bm.userData.plannerGroup = G.k;
          scene.add(bm);
        }
      }
    }
    // Group spectra (View › Group spectra): a small bar chart floating above each section, always facing the camera.
    if ($("tSpec").checked)
      for (const G of st.groups) {
        const K = KIND[G.kind],
          d = K.bp.map(dB),
          mx = Math.max(...d),
          c = document.createElement("canvas");
        c.width = 128;
        c.height = 48;
        const x = c.getContext("2d");
        x.fillStyle = "rgba(0,0,0,0.35)";
        x.fillRect(0, 0, 128, 48);
        d.forEach((v, i) => {
          const hgt = Math.max(2, Math.min(1, (v - mx + 40) / 40) * 40);
          x.fillStyle = bandColor(i);
          x.fillRect(4 + i * 15, 44 - hgt, 12, hgt);
        });
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
        sp.scale.set(16, 6, 1);
        sp.position.copy(P3(G.v, G.u, (K.h || 5) + 9));
        sp.name = "groupSpectrum";
        scene.add(sp);
      }
    if ($("s3mic").checked) {
      const res = solve();
      for (const m of st.mics) {
        const q = micPos(m);
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, m.h, 6), mat(0x444444, 1));
        stand.position.copy(P3(q.v, q.u, m.h / 2));
        scene.add(stand);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), mat(theme.hex("--mic", 0x4b3fb0), 1));
        head.position.copy(P3(q.v, q.u, m.h));
        scene.add(head);
        // Pickup field and aim line (BACKLOG B0, js/pickup3d.js): aimed along the mic's floor angle, tilted down to
        // the players (about 4 ft up) of its section.
        if ($("s3pick").checked || $("s3aim").checked) {
          const a = micAim(m) * DEG,
            t = m.g ? centroid(members(m.g)) : null,
            dist = t ? Math.max(4, Math.hypot(t.v - q.v, t.u - q.u)) : 15,
            axis = new THREE.Vector3(-Math.cos(a), (4 - m.h) / dist, Math.sin(a)).normalize(),
            cap = P3(q.v, q.u, m.h),
            type = m.pat === "xy" ? "xy" : m.pat || (MODELS[m.model] || {}).pat || "cardioid";
          if ($("s3pick").checked) scene.add(pickupField(THREE, { p: cap, axis, type, dref: 1.5, range: 20, n: 1600, size: 4, accent: theme.hex("--mic", 0x4b3fb0) }));
          if ($("s3aim").checked) scene.add(pickupAim(THREE, cap, axis, Math.min(dist, 30), theme.hex("--mic", 0x4b3fb0)));
        }
        const r = res.mic[m.id];
        cableLine(r.pts || [q, r.t === "desk" ? st.desk : st.boxes[r.t]], r.cabs.some((c) => !c) ? 0xc0392b : 0x333333, "mic");
      }
      for (const id in res.boxUp) {
        const u = res.boxUp[id];
        if (u && st.boxes[id].on) cableLine(u.pts || [st.boxes[id], u.u === "desk" ? st.desk : st.boxes[u.u]], u.fits ? 0xb03a2e : 0xc0392b, "trunk");
      }
      for (const b of [...Object.values(st.boxes).filter((b) => b.on), st.desk]) {
        const bx = new THREE.Mesh(
          new THREE.BoxGeometry(b === st.desk ? 6 : 2, b === st.desk ? 3 : 1, b === st.desk ? 3 : 1.4),
          mat(b === st.desk ? 0x222222 : 0xffffff, 1),
        );
        bx.position.copy(P3(b.v, b.u, b === st.desk ? 1.5 : 0.5));
        scene.add(bx);
      }
    }
    if (!skipHeat) slices();
    built = true;
    dirty = true;
    render();
  }
  let sliceObjs = [],
    sliceTimer = 0,
    sliceDirty = true,
    sliceCache = { key: "", F: null, tex: null },
    sliceThrottle = 0;
  function queueSlices(delay = 0) {
    clearTimeout(sliceThrottle);
    sliceThrottle = setTimeout(slices, delay);
  }
  function slices() {
    if (!scene) return;
    sliceObjs.forEach((o) => scene.remove(o));
    sliceObjs = [];
    const mode = $("heat").value,
      h = +$("s3h").value;
    if (mode === "off") {
      $("status").textContent = "Heatmap is off.";
      dirty = true;
      render();
      return;
    }
    const cacheKey = mode + ":" + h;
    if (sliceDirty || sliceCache.key !== cacheKey) {
      const F = heatField(mode, h, 4),
        c = heatCanvas(F, mode, true),
        tex = new THREE.CanvasTexture(c);
      tex.magFilter = THREE.LinearFilter;
      sliceCache = { key: cacheKey, F, tex };
      sliceDirty = false;
    }
    const addFloor = (height, opacity) => {
      const pl = new THREE.Mesh(
        new THREE.PlaneGeometry(VMAX, UMAX - U0),
        new THREE.MeshBasicMaterial({
          map: sliceCache.tex,
          transparent: true,
          opacity,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      pl.rotation.x = -Math.PI / 2;
      pl.position.set(VMAX / 2, height, (UMAX + U0) / 2);
      scene.add(pl);
      sliceObjs.push(pl);
    };
    const F = sliceCache.F;
    addFloor(0.035, 0.94);
    if ($("s3vol").checked) {
      [2.5, 5, 7.5].forEach((z) => addFloor(z, 0.11));
    }
    const ax = $("s3ax").value;
    if (ax !== "off") {
      const pos = +$("s3p").value / 100,
        ZT = 40,
        ZS = 2,
        n = Math.ceil((ax === "u" ? VMAX : UMAX - U0) / 3),
        nz = Math.ceil(ZT / ZS);
      const vals = new Float32Array(n * nz),
        hues = new Float32Array(n * nz);
      let mx = -1e9,
        mn = 1e9;
      const fixed = ax === "u" ? U0 + pos * (UMAX - U0) : pos * VMAX;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < nz; j++) {
          const a = (i + 0.5) * 2,
            z = ZT - (j + 0.5) * ZS,
            p = ax === "u" ? { v: VMAX - a, u: fixed, z } : { v: fixed, u: U0 + a, z };
          let L,
            hh = 0;
          if (mode === "delay") L = spreadAt(p);
          else if (mode === "cover") {
            const cc = coverAt(p);
            L = cc.margin;
            hh = cc.hue;
          } else {
            const r = soundAt(p, mode === "room" ? null : { direct: 1 });
            L = dB(r.tot);
            hh = centroidHue(r.bands);
          }
          vals[j * n + i] = L;
          hues[j * n + i] = hh;
          if (L > mx) mx = L;
          if (L < mn) mn = L;
        }
      const c2 = document.createElement("canvas");
      c2.width = n;
      c2.height = nz;
      const x = c2.getContext("2d");
      for (let i = 0; i < n; i++)
        for (let j = 0; j < nz; j++) {
          const t = (vals[j * n + i] - mn) / Math.max(1, mx - mn),
            [col, a] = heatColor(mode, t, hues[j * n + i]);
          x.globalAlpha = Math.min(1, a + 0.15);
          x.fillStyle = col;
          x.fillRect(i, j, 1, 1);
        }
      const t2 = new THREE.CanvasTexture(c2);
      t2.magFilter = THREE.LinearFilter;
      const w = ax === "u" ? VMAX : UMAX - U0,
        wall = new THREE.Mesh(
          new THREE.PlaneGeometry(w, ZT),
          new THREE.MeshBasicMaterial({ map: t2, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
        );
      if (ax === "u") wall.position.set(VMAX / 2, ZT / 2, fixed);
      else {
        wall.rotation.y = -Math.PI / 2;
        wall.position.set(VMAX - fixed, ZT / 2, (UMAX + U0) / 2);
      }
      scene.add(wall);
      sliceObjs.push(wall);
    }
    $("status").textContent =
      heatLegend(F, mode, h) +
      (ax !== "off" ? " · wall slice uses its own colour range" : "") +
      ($("s3vol").checked ? " · 3D heat volume shown as translucent height layers" : "");
    dirty = true;
    render();
  }
  function render() {
    if (!R || $("v3").hidden) return;
    const w = cv.clientWidth,
      h = cv.clientHeight;
    if (cv.width !== Math.round(w * R.getPixelRatio()) || cv.height !== Math.round(h * R.getPixelRatio())) {
      R.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }
    sph.ph = Math.max(0.04, Math.min(Math.PI / 2 - 0.03, sph.ph));
    sph.r = Math.max(3, Math.min(1200, sph.r));
    cam.position.set(
      tgt.x + sph.r * Math.sin(sph.ph) * Math.cos(sph.th),
      tgt.y + sph.r * Math.cos(sph.ph),
      tgt.z + sph.r * Math.sin(sph.ph) * Math.sin(sph.th),
    );
    if (cam.position.y < 0.5) {
      cam.position.y = 0.5;
    }
    cam.lookAt(tgt.x, tgt.y, tgt.z);
    R.render(scene, cam);
  }
  function setFromCam() {
    const d = cam.position.clone().sub(new THREE.Vector3(tgt.x, tgt.y, tgt.z));
    sph.r = d.length();
    sph.ph = Math.acos(Math.max(-1, Math.min(1, d.y / sph.r)));
    sph.th = Math.atan2(d.z, d.x);
  }
  function bindControls() {
    let dr = null,
      groupDrag = null,
      groupBuildTimer = 0,
      activePointer = null;
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const floorPoint = (e) => {
      const r = cv.getBoundingClientRect(),
        m = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, (-(e.clientY - r.top) / r.height) * 2 + 1),
        rc = new THREE.Raycaster(),
        p = new THREE.Vector3();
      rc.setFromCamera(m, cam);
      return rc.ray.intersectPlane(floorPlane, p) ? p : null;
    };
    cv.addEventListener("contextmenu", (e) => e.preventDefault());
    cv.addEventListener("pointerdown", (e) => {
      activePointer = e.pointerId;
      if (e.button === 0 && !e.shiftKey) {
        const r = cv.getBoundingClientRect(),
          m = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, (-(e.clientY - r.top) / r.height) * 2 + 1),
          rc = new THREE.Raycaster();
        rc.setFromCamera(m, cam);
        const hit = rc.intersectObjects(scene.children, false).find((h) => h.object.userData.plannerGroup);
        const p = floorPoint(e);
        if (hit && p) {
          const G = gOf(hit.object.userData.plannerGroup);
          if (G) {
            groupDrag = { G, offV: G.v - (VMAX - p.x), offU: G.u - p.z };
            cv.style.cursor = "grabbing";
            cv.setPointerCapture(e.pointerId);
            $("status").textContent = "Moving " + G.l + " — release to update coverage.";
            return;
          }
        }
      }
      dr = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey };
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener("pointermove", (e) => {
      if (groupDrag) {
        const p = floorPoint(e);
        if (!p) return;
        const G = groupDrag.G;
        G.v = Math.max(-40, Math.min(VMAX + 40, VMAX - p.x + groupDrag.offV));
        G.u = Math.max(U0 - 40, Math.min(UMAX + 40, p.z + groupDrag.offU));
        clearTimeout(groupBuildTimer);
        groupBuildTimer = setTimeout(() => build(true), 45);
        return;
      }
      if (!dr) return;
      const dx = e.clientX - dr.x,
        dy = e.clientY - dr.y;
      dr.x = e.clientX;
      dr.y = e.clientY;
      if (dr.pan) {
        const f = sph.r / 600,
          right = new THREE.Vector3(),
          up = new THREE.Vector3();
        cam.matrix.extractBasis(right, up, new THREE.Vector3());
        tgt.x -= (right.x * dx - up.x * dy) * f;
        tgt.z -= (right.z * dx - up.z * dy) * f;
        tgt.y = Math.max(0, tgt.y + up.y * dy * f);
      } else {
        sph.th += dx * 0.006;
        sph.ph = Math.max(0.04, Math.min(Math.PI / 2 - 0.03, sph.ph - dy * 0.006));
      }
      render();
    });
    const finishGesture = (e) => {
      if (activePointer !== null && e && e.pointerId !== undefined && e.pointerId !== activePointer) return;
      const moved = groupDrag;
      if (moved) {
        clearTimeout(groupBuildTimer);
        groupDrag = null;
        build(true);
        draw();
        $("status").textContent = "Section moved. Coverage is recalculating.";
      }
      dr = null;
      activePointer = null;
      cv.style.cursor = "grab";
    };
    cv.addEventListener("pointerup", finishGesture);
    cv.addEventListener("pointercancel", finishGesture);
    cv.addEventListener("lostpointercapture", finishGesture);
    window.addEventListener("pointerup", finishGesture, true);
    window.addEventListener("pointercancel", finishGesture, true);
    window.addEventListener("blur", () => finishGesture());
    cv.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        sph.r *= Math.exp(e.deltaY * 0.0012);
        render();
      },
      { passive: false },
    );
    cv.addEventListener("dblclick", (e) => {
      const r = cv.getBoundingClientRect(),
        m = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, (-(e.clientY - r.top) / r.height) * 2 + 1),
        rc = new THREE.Raycaster();
      rc.setFromCamera(m, cam);
      const hits = rc.intersectObjects(scene.children, false);
      const hit = hits.find((h) => h.point.y >= 0);
      if (!hit) return;
      const cp = cam.position.clone();
      tgt.x = hit.point.x;
      tgt.y = Math.max(0, hit.point.y);
      tgt.z = hit.point.z;
      cam.position.copy(cp);
      setFromCam();
      render();
      const fv = VMAX - hit.point.x,
        fu = hit.point.z;
      $("status").textContent = `Orbiting ${where({ v: fv, u: fu })}, ${hit.point.y.toFixed(1)} ft up`;
    });
    window.addEventListener("keydown", (e) => {
      if ($("v3").hidden || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
      const k = e.key.toLowerCase(),
        st_ = Math.max(1, sph.r / 40);
      const fwd = new THREE.Vector3(tgt.x - cam.position.x, 0, tgt.z - cam.position.z).normalize(),
        rt = new THREE.Vector3(-fwd.z, 0, fwd.x);
      let mv = null;
      if (k === "w" || k === "arrowup") mv = fwd.multiplyScalar(st_);
      else if (k === "s" || k === "arrowdown") mv = fwd.multiplyScalar(-st_);
      else if (k === "a" || k === "arrowleft") mv = rt.multiplyScalar(-st_);
      else if (k === "d" || k === "arrowright") mv = rt.multiplyScalar(st_);
      else if (k === "e") mv = new THREE.Vector3(0, st_, 0);
      else if (k === "q") mv = new THREE.Vector3(0, -st_, 0);
      if (!mv) return;
      e.preventDefault();
      tgt.x += mv.x;
      tgt.z += mv.z;
      tgt.y = Math.max(0, tgt.y + mv.y);
      render();
    });
  }
  window.addEventListener("resize", () => render());
  function show(three) {
    $("v3").hidden = !three;
    $("f").style.display = three ? "none" : "";
    $("b3d").setAttribute("aria-pressed", three);
    $("b2d").setAttribute("aria-pressed", !three);
    $("view3dOpts").hidden = !three; // the 3D options live in the View panel, shown while in 3D
    $("view3dNote").hidden = three;
    if (three) {
      if (!init()) {
        show(false);
        return;
      }
      build();
    }
  }
  $("b3d").onclick = () => show(true);
  $("b2d").onclick = () => show(false);
  $("s3h").oninput = () => {
    $("s3hv").textContent = $("s3h").value + " ft";
    queueSlices(75);
  };
  $("s3ax").onchange = () => queueSlices();
  $("s3p").oninput = () => queueSlices(80);
  $("tPeople").addEventListener("change", () => build()); // one People switch for 2D and 3D
  $("s3mic").onchange = () => build();
  $("s3pick").onchange = () => build();
  $("s3aim").onchange = () => build();
  $("tSpec").addEventListener("change", () => !$("v3").hidden && build());
  window.addEventListener("rt:themechange", () => !$("v3").hidden && build()); // background and floor colours
  $("s3help").onclick = () => {
    const h = $("s3hints"),
      open = h.hidden;
    h.hidden = !open;
    $("s3help").setAttribute("aria-expanded", String(open));
  };
  $("s3vol").onchange = () => queueSlices();
  $("heat").addEventListener("change", () => {
    sliceDirty = true;
    if (!$("v3").hidden) queueSlices();
  });
  $("venue").addEventListener("change", () => {
    sliceDirty = true;
    if (!$("v3").hidden) queueSlices();
  });
  window.addEventListener("planner:scenechange", () => {
    if ($("v3").hidden || !R) return;
    sliceDirty = true;
    clearTimeout(sliceTimer);
    sliceTimer = setTimeout(slices, 80);
  });
  $("s3reset").onclick = () => {
    tgt.x = VMAX / 2;
    tgt.y = 0;
    tgt.z = 90;
    sph = { r: 230, th: -0.9, ph: 0.95 };
    render();
  };
})();
