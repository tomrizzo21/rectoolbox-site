/* Smooth 3D pickup field (BACKLOG B0), shared by Mic techniques (js/guide.js) and the planner's 3D view (js/view3d.js).
   A soft cloud of points around the capsule whose opacity is the mic's relative sensitivity there: the polar pattern
   (off-axis angle) times the 1/distance fall-off, in dB, mapped onto a fade. Strongest close and on-axis; weaker farther
   out or to the side; nothing behind a directional mic. No bands or shells. The aim line is drawn separately.
   pickupGain is the same cardioid family the 2D view uses. */
function pickupGain(type, c) {
  // c = cos(angle off the mic's axis)
  if (type === "omni") return 1;
  if (type === "figure-8") return Math.abs(c);
  if (type === "hypercardioid") return Math.max(0, 0.25 + 0.75 * c);
  if (type === "supercardioid") return Math.max(0, 0.37 + 0.63 * c);
  if (type === "xy") {
    // two cardioids 90° apart (±45°): take the louder; c here is only the on-axis component, so approximate
    return Math.max(0, 0.5 * (1 + Math.cos(Math.acos(Math.max(-1, Math.min(1, c))) - Math.PI / 4)));
  }
  return Math.max(0, 0.5 * (1 + c)); // cardioid and anything unknown
}
/* opts: p (capsule, Vector3), axis (Vector3), type, dref (ft: distance treated as 0 dB), range (dB shown, default 24),
   n (points), size (point size), accent (hex number), hot (hex number for the strongest region). */
function pickupField(T, opts) {
  const range = opts.range || 24,
    dref = opts.dref || 0.25,
    dmax = dref * Math.pow(10, range / 20),
    n = opts.n || 2000,
    ax = opts.axis.clone().normalize(),
    A = new T.Color(opts.accent == null ? 0x7653df : opts.accent),
    H = new T.Color(opts.hot == null ? 0xffa726 : opts.hot),
    pos = [],
    col = [],
    alp = [],
    dir = new T.Vector3(),
    c = new T.Color();
  // Deterministic pseudo-random points (same picture every redraw), biased toward the capsule.
  let seed = 12345;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let tries = 0; pos.length / 3 < n && tries < n * 6; tries++) {
    const z = 2 * rnd() - 1,
      t = 2 * Math.PI * rnd(),
      r = Math.sqrt(1 - z * z);
    dir.set(r * Math.cos(t), z, r * Math.sin(t));
    const d = dmax * Math.pow(rnd(), 1.6),
      g = pickupGain(opts.type, dir.dot(ax));
    if (g <= 0.001) continue;
    const L = 20 * Math.log10(g) - 20 * Math.log10(Math.max(d, dref) / dref),
      s = 1 + L / range; // 1 at the capsule on-axis, 0 at the edge of the shown range
    if (s <= 0.02) continue;
    pos.push(opts.p.x + dir.x * d, opts.p.y + dir.y * d, opts.p.z + dir.z * d);
    c.copy(A).lerp(H, Math.min(1, s * s * 1.2));
    col.push(c.r, c.g, c.b);
    alp.push(0.04 + 0.7 * Math.pow(s, 1.8));
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  geo.setAttribute("col", new T.Float32BufferAttribute(col, 3));
  geo.setAttribute("alp", new T.Float32BufferAttribute(alp, 1));
  const mat = new T.ShaderMaterial({
    uniforms: { size: { value: opts.size || 0.35 } },
    vertexShader:
      "attribute vec3 col; attribute float alp; uniform float size; varying vec3 vc; varying float va;" +
      "void main(){ vc = col; va = alp; vec4 mv = modelViewMatrix * vec4(position, 1.0);" +
      "gl_PointSize = size * 300.0 / max(0.1, -mv.z); gl_Position = projectionMatrix * mv; }",
    fragmentShader:
      "varying vec3 vc; varying float va;" +
      "void main(){ float r = length(gl_PointCoord - vec2(0.5)); float a = va * smoothstep(0.5, 0.0, r);" +
      "if (a < 0.01) discard; gl_FragColor = vec4(vc, a); }",
    transparent: true,
    depthWrite: false,
  });
  const pts = new T.Points(geo, mat);
  pts.name = "pickupField";
  pts.userData.dmax = dmax;
  return pts;
}
/* The aim line: from the capsule along its axis. */
function pickupAim(T, p, axis, len, color) {
  const g = new T.BufferGeometry().setFromPoints([p, p.clone().addScaledVector(axis.clone().normalize(), len)]),
    l = new T.Line(g, new T.LineBasicMaterial({ color: color == null ? 0x7653df : color }));
  l.name = "pickupAim";
  return l;
}
