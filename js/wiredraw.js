/* Drawing cables by hand on the 2D canvas (docs/CABLE_ROUTING_PLAN.md, phase 2). The result is a mic's or box's
   `wire` = { to, via }, which the solver in app.js already honours (phase 1).
   Starting a cable never gets in the way of selecting or moving things:
   - select a mic, snake box or the desk: a round plug handle appears beside it; drag (or click) it to draw;
   - Alt-drag on a mic, box or the desk;
   - Draw cable mode (the "Cable" canvas button or W): any press on a mic, box or the desk starts a cable.
   While drawing: the line follows the pointer; release or click on empty floor = a bend; click (or release) on a
   place it can plug in = done; Shift = keep the segment at 0/45/90°; Backspace = remove the last bend; Esc = cancel.
   A label by the pointer shows the length needed and the cable pieces that make it up.
   Mic → desk or box (either direction); box trunk → the desk or a box it may plug into (its "ups" list).
   Editing (phase 3): click a cable to select it (the mic or box it belongs to is selected too). A selected cable, or
   any hand-drawn cable of the selected mic or box, shows handles: squares on bends (drag to move, double-click to
   remove), small circles mid-segment (drag to add a bend there; on a smart-routed cable this locks its path) and a
   diamond near the plug end (drag onto another box or the desk to re-plug, or onto the floor to extend the cable and
   keep drawing). Delete with a cable selected removes its hand-drawn path. Each drag is one undo step. */
const wireDraw = (() => {
  let mode = false,
    cur = null, // { src, via: [{v,u}], at: {v,u}, down, x0, y0, hover }
    picked = null, // the selected cable: { t: "m" | "b", k } of the mic or box it belongs to
    ed = null, // a handle being dragged: { it, kind: "pivot" | "mid", i, seg, x0, y0, moved }
    lastPivot = null; // { key, i, at } for double-clicking a bend
  const NSW = "http://www.w3.org/2000/svg";
  const is3D = () => !$("v3").hidden;
  const layer = () => {
    let g = $("gWireUI");
    if (!g) {
      g = document.createElementNS(NSW, "g");
      g.id = "gWireUI";
      $("world").appendChild(g);
    }
    return g;
  };
  const upp = () => {
    const m = $("world").getScreenCTM();
    return m ? 1 / Math.hypot(m.a, m.b) : 1; // world units per screen pixel
  };
  const fieldAt = (e) => {
    const p = svgPt(e);
    return { v: V(p.x), u: U(p.y) };
  };
  const posOf = (it) => (it.t === "m" ? micPos(st.mics.find((m) => m.id === it.k)) : it.t === "b" ? st.boxes[it.k] : st.desk);
  const nameOf = (it) => (it.t === "m" ? micName(st.mics.find((m) => m.id === it.k)) : it.t === "b" ? st.boxes[it.k].name : "the desk");
  const same = (a, b) => !!(a && b && a.t === b.t && a.k === b.k);
  const ownerObj = (it) => (it.t === "m" ? st.mics.find((m) => m.id === it.k) : it.t === "b" ? st.boxes[it.k] : null);
  const routeOf = (it) => (it.t === "m" ? res.mic[it.k] : res.boxUp[it.k]);
  const endOf = (to) => (to === "desk" ? st.desk : st.boxes[to]);
  /* The points a cable runs through, owner first: the drawn wire when the solver uses it, else the smart route. */
  function cablePts(it) {
    const o = ownerObj(it),
      r = o && routeOf(it);
    if (!r) return null;
    if (o.wire && r.wired) return [posOf(it), ...o.wire.via, endOf(o.wire.to)];
    const q = endOf(it.t === "m" ? r.t : r.u);
    return r.pts || (q ? [posOf(it), q] : null);
  }
  const round2 = (z) => ({ v: +z.v.toFixed(2), u: +z.u.toFixed(2) });
  /* Make the cable hand-drawn (keeping where it runs now) so it can be edited. */
  function ensureWire(it) {
    const o = ownerObj(it),
      r = routeOf(it);
    if (!o.wire || !r.wired) o.wire = { to: it.t === "m" ? r.t : r.u, via: cablePts(it).slice(1, -1).map(round2) };
    return o.wire;
  }
  function itemAt(x, y) {
    const g = document.elementFromPoint(x, y)?.closest("g[data-t]");
    if (!g || !"mbd".includes(g.dataset.t) || !sv.contains(g)) return null;
    if (g.dataset.t === "m" && !st.mics.some((m) => m.id === g.dataset.k)) return null;
    return { t: g.dataset.t, k: g.dataset.k };
  }

  /* What a cable between a and b would be: who owns it (whose `wire`), where it goes, and whether the drawn bends
     run backwards (drawn from the target towards the owner). */
  function link(a, b) {
    if (!a || !b || same(a, b)) return { why: "" };
    const pair = (x, y, rev) => {
      if (x.t === "m") {
        if (y.t === "m") return { why: "A mic can't plug into another mic." };
        const m = st.mics.find((q) => q.id === x.k),
          ch = MODELS[m.model].ch || 1;
        if (y.t === "b") {
          const B = st.boxes[y.k],
            mine = res.mic[m.id] && res.mic[m.id].t === y.k ? ch : 0,
            free = B.cap - (res.load[y.k] || 0) + mine;
          if (free < ch) return { why: `${B.name} is full (${res.load[y.k]}/${B.cap} channels).` };
        }
        return { owner: m, to: y.t === "d" ? "desk" : y.k, rev, mic: m };
      }
      if (x.t === "b") {
        const B = st.boxes[x.k],
          to = y.t === "d" ? "desk" : y.t === "b" ? y.k : null;
        if (to && B.ups.includes(to)) return { owner: B, to, rev, box: B };
      }
      return null;
    };
    const r = pair(a, b, false) || pair(b, a, true);
    if (r) return r;
    if (a.t === "d" || b.t === "d") return { why: a.t === "d" && b.t === "d" ? "" : "That box's trunk can't run to the desk from here." };
    const [x, y] = a.t === "b" && b.t === "b" ? [st.boxes[a.k], st.boxes[b.k]] : [null, null];
    return { why: x && y ? `${x.name} and ${y.name} don't plug into each other that way.` : "" };
  }

  /* ---------- drawing state ---------- */
  function start(src, e) {
    cur = { src, via: [], at: posOf(src), down: true, x0: e.clientX, y0: e.clientY, hover: null };
    document.body.classList.add("wireDrawing");
    status(`Drawing a cable from ${nameOf(src)}: click the floor for bends, then click where it plugs in. Shift = straight, Backspace = undo bend, Esc = cancel.`);
    render();
  }
  function stop(msg) {
    cur = null;
    document.body.classList.remove("wireDrawing");
    $("wireTip").hidden = true;
    if (msg) status(msg);
    render();
  }
  function snap(p, from) {
    if (!cur && !from) return p;
    const last = from || (cur.via.length ? cur.via[cur.via.length - 1] : posOf(cur.src)),
      dv = p.v - last.v,
      du = p.u - last.u,
      L = Math.hypot(dv, du),
      a = Math.round(Math.atan2(du, dv) / (Math.PI / 4)) * (Math.PI / 4);
    return { v: last.v + L * Math.cos(a), u: last.u + L * Math.sin(a) };
  }
  const keep = (p) => ({ v: +Math.max(0, Math.min(VMAX, p.v)).toFixed(2), u: +Math.max(U0, Math.min(UMAX, p.u)).toFixed(2) });
  function bend(p) {
    cur.via.push(keep(p));
    render();
  }
  function finish(dst) {
    const L = link(cur.src, dst);
    if (!L.owner) {
      status(L.why || "A cable can't end there.");
      return false;
    }
    const via = L.rev ? cur.via.slice().reverse() : cur.via.slice();
    L.owner.wire = { to: L.to, via };
    if (L.mic) sel = { t: "m", k: L.mic.id };
    else sel = { t: "b", k: Object.keys(st.boxes).find((k) => st.boxes[k] === L.box) };
    cur = null;
    document.body.classList.remove("wireDrawing");
    $("wireTip").hidden = true;
    draw(true); // one undo step
    const r = L.mic ? res.mic[L.mic.id] : res.boxUp[sel.k];
    status(
      L.mic
        ? `Cable drawn: ${micName(L.mic)} → ${L.to === "desk" ? "desk" : st.boxes[L.to].name}, ${r.need} ft needed (${r.cabs.map(cabTxt).join(" | ")}). Smart route leaves it alone.`
        : `Trunk drawn: ${L.box.name} → ${L.to === "desk" ? "desk" : st.boxes[L.to].name}, ${r.need} of ${L.box.trunk} ft.`,
    );
    return true;
  }

  /* Length needed and the pieces it takes, as the solver will work it out. */
  function measure() {
    const L = cur.hover ? link(cur.src, cur.hover) : null,
      dst = L && L.owner ? cur.hover : null,
      pts = [posOf(cur.src), ...cur.via, dst ? posOf(dst) : cur.at],
      len = polyLen(pts),
      bent = cur.via.length > 0,
      mic = L && L.mic ? L.mic : !dst && cur.src.t === "m" ? st.mics.find((q) => q.id === cur.src.k) : null,
      box = L && L.box ? L.box : !dst && cur.src.t === "b" ? st.boxes[cur.src.k] : null;
    if (mic) {
      const need = Math.round(len * (bent ? 1.08 : 1.12) + mic.h + 2),
        c = bestCombo(need, stockAvail(), 0, true, false);
      return `${need} ft needed → ${c ? c.c.slice().sort((a, b) => b - a).join(" + ") + " ft" : "longer than any combination"}`;
    }
    if (box) {
      const need = Math.round(len * (bent ? 1.05 : 1.1) + 2);
      return `${need} ft of ${box.trunk} ft trunk${need > box.trunk ? " (too short)" : ""}`;
    }
    return `${Math.round(len)} ft`;
  }

  /* ---------- drawing on the canvas ---------- */
  function render() {
    const g = layer(),
      u = upp();
    g.innerHTML = "";
    if (is3D()) return;
    if (cur) {
      const L = cur.hover ? link(cur.src, cur.hover) : null,
        end = cur.hover && L.owner ? posOf(cur.hover) : cur.at,
        pts = [posOf(cur.src), ...cur.via, end];
      el(
        "polyline",
        {
          points: pts.map((z) => X(z.v).toFixed(1) + "," + Y(z.u).toFixed(1)).join(" "),
          class: "wireDraft" + (cur.hover && !L.owner ? " bad" : ""),
          "stroke-width": 2.2 * u,
          "stroke-dasharray": `${6 * u} ${4 * u}`,
        },
        g,
      );
      cur.via.forEach((z) => el("rect", { x: X(z.v) - 3.5 * u, y: Y(z.u) - 3.5 * u, width: 7 * u, height: 7 * u, class: "wireBend" }, g));
      return;
    }
    if (picked && !(sel && same(picked, sel))) picked = null;
    // Edit handles on the selected cable, or on the selected mic's or box's hand-drawn cable.
    if (sel && "mb".includes(sel.t) && ownerObj(sel)) {
      const it = { t: sel.t, k: sel.k },
        o = ownerObj(it),
        r = routeOf(it),
        wired = !!(o.wire && r && r.wired),
        isPicked = same(picked, it),
        pts = (wired || isPicked) && cablePts(it);
      if (pts && pts.length > 1) {
        const P = pts.map((z) => [X(z.v), Y(z.u)]);
        if (isPicked)
          el("polyline", { points: P.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" "), class: "wirePicked", "stroke-width": 8 * u }, g);
        for (let s = 0; s < P.length - 1; s++) {
          const [ax, ay] = P[s],
            [bx, by] = P[s + 1];
          if (Math.hypot(bx - ax, by - ay) < 34 * u) continue;
          const c = el("circle", { cx: (ax + bx) / 2, cy: (ay + by) / 2, r: 4.2 * u, class: "wireMid", "stroke-width": 1.2 * u }, g);
          c.dataset.seg = s;
          c.dataset.tip = "Drag to bend the cable here";
        }
        if (wired)
          P.slice(1, -1).forEach(([x, y], i) => {
            const h = el("rect", { x: x - 4.5 * u, y: y - 4.5 * u, width: 9 * u, height: 9 * u, class: "wireHandle", "stroke-width": 1.2 * u }, g);
            h.dataset.i = i;
            h.dataset.tip = "Drag to move this bend · double-click to remove it";
          });
        // The plug end: a diamond a little way back along the cable, so it never covers the box or desk.
        const [qx, qy] = P[P.length - 1],
          [px, py] = P[P.length - 2],
          d = Math.hypot(px - qx, py - qy) || 1,
          back = Math.min(20 * u, d / 2),
          ex = qx + ((px - qx) / d) * back,
          ey = qy + ((py - qy) / d) * back,
          s = 5.5 * u;
        const h = el("polygon", { points: `${ex},${ey - s} ${ex + s},${ey} ${ex},${ey + s} ${ex - s},${ey}`, class: "wireEnd", "stroke-width": 1.2 * u }, g);
        h.dataset.tip = "Drag onto another box or the desk to re-plug · drag onto the floor (or click) to extend the cable";
      }
    }
    // The plug handle beside the selected mic, box or desk.
    if (!sel || !"mbd".includes(sel.t) || (sel.t === "m" && !st.mics.some((m) => m.id === sel.k))) return;
    const p = posOf(sel),
      x = X(p.v),
      y = Y(p.u),
      dx = 26 * u,
      dy = -22 * u;
    el("line", { x1: x, y1: y, x2: x + dx, y2: y + dy, class: "wirePlugLead", "stroke-width": 1.2 * u }, g);
    const h = el("circle", { cx: x + dx, cy: y + dy, r: 6.5 * u, class: "wirePlug", "stroke-width": 1.5 * u }, g);
    h.dataset.tip = "Drag to draw a cable by hand (or Alt-drag the item, or press W for Draw cable mode)";
    h.setAttribute("aria-label", "Draw a cable from here");
  }
  function showTip(e) {
    const t = $("wireTip"),
      r = $("fb").getBoundingClientRect(),
      L = cur.hover ? link(cur.src, cur.hover) : null;
    t.hidden = false;
    t.textContent = L && !L.owner ? L.why || "Can't plug in here" : measure() + (L && L.owner ? ` · click to plug into ${nameOf(cur.hover)}` : "");
    t.classList.toggle("bad", !!(L && !L.owner));
    t.style.left = Math.min(e.clientX - r.left + 14, r.width - 240) + "px";
    t.style.top = e.clientY - r.top + 16 + "px";
  }

  /* ---------- editing a cable ---------- */
  function editMove(e) {
    if (!ed.moved && Math.hypot(e.clientX - ed.x0, e.clientY - ed.y0) < 4) return;
    e.stopImmediatePropagation();
    const w = ensureWire(ed.it);
    if (!ed.moved) {
      ed.moved = true;
      drag = { t: "wire" }; // app.js: no undo step per frame, and its own drag code stays out of the way
      if (ed.kind === "mid") {
        w.via.splice(ed.seg, 0, { v: 0, u: 0 });
        ed.i = ed.seg;
      }
    }
    let p = fieldAt(e);
    if (e.shiftKey) p = snap(p, ed.i ? w.via[ed.i - 1] : posOf(ed.it));
    w.via[ed.i] = keep(p);
    drawSoon();
  }
  function removeBend(it, i) {
    const w = ensureWire(it);
    w.via.splice(i, 1);
    ed = null;
    draw(true);
    status(`Bend removed (${w.via.length} left).`);
  }
  /* Drag (or click) the plug end: keep drawing from the cable's last bend. Ending on a box or the desk re-plugs it;
     the floor adds bends. Esc leaves the cable as it was. */
  function extend(it, e) {
    const pts = cablePts(it);
    start(it, e);
    cur.via = pts.slice(1, -1).map(round2);
    cur.at = pts[pts.length - 1];
    status("Re-plugging or extending: drop on a box or the desk to plug in there, on the floor for another bend. Esc = keep it as it was.");
    render();
  }

  /* ---------- pointer and keys ---------- */
  function onDown(e) {
    if (is3D() || e.button !== 0) return;
    const hit = itemAt(e.clientX, e.clientY);
    if (cur) {
      e.stopImmediatePropagation();
      e.preventDefault();
      cur.down = true;
      cur.x0 = e.clientX;
      cur.y0 = e.clientY;
      if (hit && !same(hit, cur.src)) finish(hit) || render();
      else if (!hit) bend(e.shiftKey ? snap(fieldAt(e)) : fieldAt(e));
      return;
    }
    const h = e.target.closest && e.target.closest(".wireHandle, .wireMid, .wireEnd");
    if (h && sel && "mb".includes(sel.t)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      const it = { t: sel.t, k: sel.k };
      picked = it;
      if (h.classList.contains("wireEnd")) return extend(it, e);
      if (h.classList.contains("wireHandle")) {
        const i = +h.dataset.i,
          key = it.t + ":" + it.k,
          now = Date.now();
        if (lastPivot && lastPivot.key === key && lastPivot.i === i && now - lastPivot.at < 450) {
          lastPivot = null;
          return removeBend(it, i);
        }
        lastPivot = { key, i, at: now };
        ed = { it, kind: "pivot", i, x0: e.clientX, y0: e.clientY, moved: false };
      } else ed = { it, kind: "mid", seg: +h.dataset.seg, x0: e.clientX, y0: e.clientY, moved: false };
      return;
    }
    const cab = !mode && !e.altKey && e.target.closest && e.target.closest("[data-wire]");
    if (cab) {
      // Select the cable (and its mic or box). Panning from here still works: the event goes on.
      const [t, k] = cab.dataset.wire.split(":");
      picked = { t, k };
      sel = { t, k };
      if (typeof focusInspector === "function") focusInspector();
      draw(true);
      const o = ownerObj(picked);
      status(
        `Cable selected (${t === "m" ? micName(o) : o.name}). ` +
          (o.wire
            ? "Drag the squares to move bends, a circle to add one, the diamond to re-plug or extend; Delete removes the hand-drawn path."
            : "Smart-routed: drag a circle to bend it by hand, or the diamond to re-plug it."),
      );
      return;
    }
    const plug = e.target.closest && e.target.closest(".wirePlug");
    if (!plug) picked = null;
    let src = null;
    if (plug) src = sel;
    else if (hit && (mode || e.altKey)) src = hit;
    if (!src) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    start(src, e);
  }
  function onMove(e) {
    if (ed) return editMove(e);
    if (!cur) return;
    const p = fieldAt(e);
    cur.at = e.shiftKey ? snap(p) : p;
    const hit = itemAt(e.clientX, e.clientY);
    cur.hover = hit && !same(hit, cur.src) ? hit : null;
    sv.style.cursor = cur.hover && !link(cur.src, cur.hover).owner ? "not-allowed" : "crosshair";
    render();
    showTip(e);
  }
  function onUp(e) {
    if (ed) {
      const done = ed.moved,
        it = ed.it;
      ed = null;
      if (done) {
        drag = null;
        draw(true); // the whole drag is one undo step
        const r = routeOf(it);
        status(
          !r
            ? "Cable bent by hand."
            : it.t === "m"
              ? `Cable bent by hand: ${r.need} ft needed (${r.cabs.map(cabTxt).join(" | ")}). Smart route leaves it alone.`
              : `Trunk bent by hand: ${r.need} of ${st.boxes[it.k].trunk} ft${r.fits ? "" : " (too short)"}. Smart route leaves it alone.`,
        );
      }
      return;
    }
    if (!cur || !cur.down) return;
    cur.down = false;
    const moved = Math.hypot(e.clientX - cur.x0, e.clientY - cur.y0) > 6;
    if (!moved) return; // a click: wait for the next one
    const hit = itemAt(e.clientX, e.clientY);
    if (hit && !same(hit, cur.src)) finish(hit) || render();
    else if (!hit) bend(e.shiftKey ? snap(fieldAt(e)) : fieldAt(e));
  }
  function setMode(on) {
    mode = on && !is3D();
    $("bWire").setAttribute("aria-pressed", String(mode));
    document.body.classList.toggle("wireMode", mode);
    if (!mode && cur) stop();
    status(mode ? "Draw cable: press on a mic, snake box or the desk and drag to where it plugs in. W or Esc to stop." : "Draw cable off.");
  }
  function onKey(e) {
    if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) || e.ctrlKey || e.metaKey) return;
    if (cur && (e.key === "Escape" || e.key === "Backspace")) {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.key === "Escape") return stop("Cable cancelled.");
      if (cur.via.length) cur.via.pop();
      return render();
    }
    if (!cur && (e.key === "Delete" || e.key === "Backspace") && picked && sel && same(picked, sel) && !is3D()) {
      e.stopImmediatePropagation();
      e.preventDefault();
      const o = ownerObj(picked);
      if (o && o.wire) {
        delete o.wire;
        draw(true);
        status("Hand-drawn path removed: smart route chooses this cable again.");
      } else status("This cable is smart-routed, so there is nothing hand-drawn to delete. Click the mic itself and press Delete to remove the mic.");
      return;
    }
    if (mode && e.key === "Escape") {
      e.stopImmediatePropagation();
      return setMode(false);
    }
    if ((e.key === "w" || e.key === "W") && !e.altKey && !is3D() && TOOL === "planner") {
      e.preventDefault();
      setMode(!mode);
    }
  }

  function init() {
    sv.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onUp, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("planner:scenechange", render);
    window.addEventListener("resize", render);
    $("bWire").onclick = () => setMode(!mode);
    $("b3d").addEventListener("click", () => {
      if (cur) stop();
      if (mode) setMode(false);
      render();
    });
    render();
  }
  return {
    init,
    setMode,
    get mode() { return mode; },
    get drawing() { return !!cur; },
    get picked() { return picked; },
    // For tests: where a field point is on screen.
    client(v, u) {
      const m = $("world").getScreenCTM(),
        p = sv.createSVGPoint();
      p.x = X(v);
      p.y = Y(u);
      const q = p.matrixTransform(m);
      return { x: q.x, y: q.y };
    },
  };
})();
wireDraw.init();
