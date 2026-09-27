// Home page: rain on the building section, and the camera that walks down
// the building while the services scroll past.

// ------------------------------------------------------------------ rain
//
// Drops fall until they meet the top surface of the drawing (the "skyline",
// in drawing centimetres, mapped to canvas pixels on every resize) and splash
// there. The pointer leans the rain like wind; holding a button down over the
// sky turns it into a downpour. The building stays dry either way.
(() => {
  const hero = document.querySelector(".hero");
  const canvas = hero && hero.querySelector(".rain");
  const svg = hero && hero.querySelector(".dwg-hero");
  const toggle = hero && hero.querySelector(".rain-toggle");
  if (!canvas || !svg || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const skyline = JSON.parse(svg.dataset.skyline);
  const vb = svg.viewBox.baseVal;

  const MAX = 900, SMAX = 500;
  const dx = new Float32Array(MAX), dy = new Float32Array(MAX), dv = new Float32Array(MAX), dl = new Float32Array(MAX);
  const sx = new Float32Array(SMAX), sy = new Float32Array(SMAX), svx = new Float32Array(SMAX), svy = new Float32Array(SMAX), sl = new Float32Array(SMAX);
  let drops = 0, splashes = 0, target = 0;
  let W = 0, H = 0, dpr = 1, surf = new Float32Array(1);
  let wind = 0, windTo = 0, heavy = 0, heavyTo = 0;
  let inView = true, paused = false, started = false, raf = 0, last = 0;

  // Surface height (drawing cm) at drawing x, from the skyline polyline.
  function skyAt(x) {
    if (x < skyline[0][0] || x > skyline[skyline.length - 1][0]) return Infinity;
    for (let i = 1; i < skyline.length; i++) {
      const [x1, y1] = skyline[i];
      if (x <= x1) {
        const [x0, y0] = skyline[i - 1];
        return x1 === x0 ? Math.min(y0, y1) : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
      }
    }
    return Infinity;
  }

  function layout() {
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = svg.getBoundingClientRect();
    const k = s.width / vb.width;
    const ox = s.left - r.left, oy = s.top - r.top;
    surf = new Float32Array(Math.ceil(W) + 2);
    for (let i = 0; i < surf.length; i++) {
      const y = skyAt((i - ox) / k + vb.x);
      surf[i] = y === Infinity ? H + 40 : (y - vb.y) * k + oy;
    }
    target = Math.min(360, Math.round((W * H) / 4600));
  }

  function spawn(i, anywhere) {
    dv[i] = 760 + Math.random() * 460;
    dl[i] = 10 + Math.random() * 14;
    dy[i] = anywhere ? Math.random() * H : -dl[i] - Math.random() * 120;
    // Start upwind, so drops leaning in the wind still cover the whole width.
    dx[i] = Math.random() * (W + 240) - 120 - wind * (anywhere ? 0 : H * 0.6);
  }

  function splash(x, y) {
    const n = heavy > 0.5 ? 3 : 2;
    for (let k = 0; k < n && splashes < SMAX; k++, splashes++) {
      sx[splashes] = x;
      sy[splashes] = y - 1;
      svx[splashes] = (Math.random() - 0.5) * 130 + wind * 220;
      svy[splashes] = -70 - Math.random() * 120;
      sl[splashes] = 0.22 + Math.random() * 0.2;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(58, 118, 174, 0.46)";
    ctx.beginPath();
    for (let i = 0; i < drops; i++) {
      const lean = wind * dl[i];
      ctx.moveTo(dx[i], dy[i]);
      ctx.lineTo(dx[i] - lean, dy[i] - dl[i]);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(58, 118, 174, 0.6)";
    for (let i = 0; i < splashes; i++) ctx.fillRect(sx[i] - 0.6, sy[i] - 0.6, 1.3, 1.3);
  }

  function step(dt) {
    wind += (windTo - wind) * Math.min(1, dt * 2.2);
    heavy += (heavyTo - heavy) * Math.min(1, dt * (heavyTo > heavy ? 3 : 1.2));
    const want = Math.min(MAX, Math.round(target * (1 + heavy * 1.8)));
    // Let the shower build up (or ease off) instead of switching on at once.
    if (drops < want) {
      const add = Math.min(want - drops, Math.ceil(want * dt * 1.4));
      for (let k = 0; k < add; k++) spawn(drops++, false);
    }
    const speed = 1 + heavy * 0.35;
    for (let i = 0; i < drops; i++) {
      const v = dv[i] * speed;
      dy[i] += v * dt;
      dx[i] += wind * v * dt;
      const col = dx[i] | 0;
      if (col >= 0 && col < surf.length && dy[i] >= surf[col]) {
        splash(dx[i], surf[col]);
        if (drops > want) { drops--; dx[i] = dx[drops]; dy[i] = dy[drops]; dv[i] = dv[drops]; dl[i] = dl[drops]; i--; continue; }
        spawn(i, false);
      } else if (dy[i] > H + 30 || dx[i] < -160 || dx[i] > W + 160) {
        spawn(i, false);
      }
    }
    for (let i = 0; i < splashes; i++) {
      sl[i] -= dt;
      if (sl[i] <= 0) {
        splashes--;
        sx[i] = sx[splashes]; sy[i] = sy[splashes]; svx[i] = svx[splashes]; svy[i] = svy[splashes]; sl[i] = sl[splashes];
        i--;
        continue;
      }
      svy[i] += 900 * dt;
      sx[i] += svx[i] * dt;
      sy[i] += svy[i] * dt;
    }
  }

  function frame(now) {
    raf = 0;
    // A frame that arrives late (tab switch, slow device) must not jump the
    // simulation forward or, with a stale timestamp, backwards.
    const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 20);
    last = now;
    step(dt);
    draw();
    schedule();
  }

  function schedule() {
    const run = started && inView && !paused && !document.hidden && !reduce.matches;
    if (run && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  // With reduced motion there is no animation: one still picture of rain.
  function still() {
    drops = Math.round(target * 0.7);
    splashes = 0;
    wind = 0;
    for (let i = 0; i < drops; i++) {
      spawn(i, true);
      const col = dx[i] | 0;
      if (col >= 0 && col < surf.length && dy[i] > surf[col] - 4) dy[i] = Math.random() * Math.max(0, surf[col] - 30);
    }
    draw();
  }

  function refresh() {
    layout();
    if (reduce.matches) still();
    else if (!raf) draw();
  }

  new ResizeObserver(() => refresh()).observe(hero);
  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    schedule();
  }).observe(hero);
  document.addEventListener("visibilitychange", schedule);
  reduce.addEventListener("change", () => {
    toggle.hidden = reduce.matches;
    refresh();
    schedule();
  });

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    windTo = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
  });
  hero.addEventListener("pointerleave", () => {
    windTo = 0;
    heavyTo = 0;
  });
  hero.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button, input, select, textarea, label")) return;
    heavyTo = 1;
  });
  for (const t of ["pointerup", "pointercancel", "blur"]) window.addEventListener(t, () => (heavyTo = 0));

  if (toggle) {
    toggle.hidden = reduce.matches;
    toggle.addEventListener("click", () => {
      paused = !paused;
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.querySelector(".rain-lbl").textContent = paused ? "Spustiť dážď" : "Zastaviť dážď";
      schedule();
    });
  }

  layout();
  if (reduce.matches) still();
  // Let the waterproofing go on first; then it starts to rain.
  setTimeout(() => {
    started = true;
    schedule();
  }, 1100);
})();

// ------------------------------------------------------------------ camera
//
// On wide screens the services list scrolls past a drawing that stays put,
// and the camera moves across the building to the part each service is
// about. On narrow screens, or without JavaScript, every service shows its
// own still close-up instead.
(() => {
  const svg = document.querySelector(".cam-svg");
  const stops = [...document.querySelectorAll(".stop[data-zone]")];
  if (!svg || !stops.length || !("IntersectionObserver" in window)) return;

  const root = document.documentElement;
  const frames = JSON.parse(svg.dataset.frames);
  const labels = [...svg.querySelectorAll(".lbls")];
  const zones = [...document.querySelectorAll(".cam-zone")];
  const wide = matchMedia("(min-width: 1000px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let current = null, anim = 0;
  let vb = frames[stops[0].dataset.zone].slice();

  const setVB = (v) => svg.setAttribute("viewBox", v.map((n) => n.toFixed(1)).join(" "));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function fly(to) {
    cancelAnimationFrame(anim);
    if (reduce.matches || !root.classList.contains("js-cam")) {
      vb = to.slice();
      setVB(vb);
      return;
    }
    const from = vb.slice();
    const c0 = [from[0] + from[2] / 2, from[1] + from[3] / 2];
    const c1 = [to[0] + to[2] / 2, to[1] + to[3] / 2];
    const dist = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]);
    // Pull back a little on long moves, so you can see where you are going.
    const pull = Math.min(1.4, (dist / ((from[2] + to[2]) / 2)) * 0.5);
    const dur = 950 + Math.min(650, dist * 0.35);
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur), e = ease(t);
      const baseW = from[2] + (to[2] - from[2]) * e;
      const baseH = from[3] + (to[3] - from[3]) * e;
      const z = 1 + pull * Math.sin(Math.PI * t);
      const cx = c0[0] + (c1[0] - c0[0]) * e, cy = c0[1] + (c1[1] - c0[1]) * e;
      vb = [cx - (baseW * z) / 2, cy - (baseH * z) / 2, baseW * z, baseH * z];
      setVB(vb);
      if (t < 1) anim = requestAnimationFrame(tick);
      else { vb = to.slice(); setVB(vb); }
    };
    anim = requestAnimationFrame(tick);
  }

  // Labels keep one size on screen: CSS divides by the drawing's scale.
  function setScale() {
    const r = svg.getBoundingClientRect();
    const f = frames[current];
    if (!r.width || !f) return;
    svg.style.setProperty("--k", Math.min(r.width / f[2], r.height / f[3]).toFixed(4));
    svg.classList.add("k-ready");
  }

  function show(zone) {
    if (zone === current) return;
    current = zone;
    setScale();
    for (const g of labels) g.classList.toggle("on", g.dataset.zone === zone);
    for (const z of zones) z.classList.toggle("on", z.dataset.zone === zone);
    svg.dataset.zone = zone;
    fly(frames[zone]);
  }

  const enable = () => root.classList.toggle("js-cam", wide.matches);
  enable();
  wide.addEventListener("change", enable);
  new ResizeObserver(setScale).observe(svg);

  // The active service is the one crossing a thin band across the middle of the
  // screen. Two neighbours can sit in the band at once (a fast scroll lands on
  // their border), so keep every stop that is in it and pick the one under the
  // middle line; taking whichever entry came last left the camera one service
  // behind when scrolling up.
  const inBand = new Set();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? inBand.add(e.target) : inBand.delete(e.target);
    const mid = innerHeight / 2;
    let best = null, bestD = Infinity;
    for (const s of inBand) {
      const r = s.getBoundingClientRect();
      const d = mid < r.top ? r.top - mid : mid > r.bottom ? mid - r.bottom : 0;
      if (d < bestD) { best = s; bestD = d; }
    }
    if (best) show(best.dataset.zone);
  }, { rootMargin: "-46% 0px -46% 0px" });
  for (const s of stops) io.observe(s);
  show(stops[0].dataset.zone);
})();
