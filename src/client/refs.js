// Reference map: drag to move, buttons, pinch or Ctrl + wheel to zoom, a pin
// shows its job in the card next to the map. Pins too close to tell apart
// merge into a count that zooms in. Without JavaScript every pin is a plain
// link to the job on the reference page.
(() => {
  const SVGNS = "http://www.w3.org/2000/svg";
  for (const root of document.querySelectorAll(".rmap")) init(root);

  function init(root) {
    const svg = root.querySelector(".rmap-svg");
    const view = root.querySelector(".rmap-view");
    const card = root.querySelector(".rmap-card");
    const nav = root.querySelector(".rmap-nav");
    const pos = root.querySelector(".rmap-pos");
    const ctl = root.querySelector(".rmap-ctl");
    const hint = root.querySelector(".rmap-hint");
    const tip = root.querySelector(".rmap-tip");
    const scale = root.querySelector(".rmap-scale");
    const bar = root.querySelector(".rmap-scale-bar");
    const barT = root.querySelector(".rmap-scale-t");
    const layer = root.querySelector(".rm-clusters");
    const areas = [...root.querySelectorAll(".rmap-count [data-box]")];
    const pins = [...svg.querySelectorAll(".rm-pin")];
    if (!pins.length) return;

    const FULL = root.dataset.view.split(" ").map(Number);
    const KM = Number(root.dataset.km);
    const MIN_W = FULL[2] / 18;
    const ASPECT = FULL[3] / FULL[2];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const ids = pins.map((p) => p.dataset.ref);
    const at = new Map(pins.map((p) => {
      const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(p.firstElementChild.getAttribute("transform"));
      return [p.dataset.ref, [Number(m[1]), Number(m[2])]];
    }));
    let vb = FULL.slice(), anim = 0, current = ids[0];

    root.classList.add("js-map");
    ctl.hidden = false;
    scale.hidden = false;
    nav.hidden = ids.length < 2;
    for (const b of areas) { b.disabled = false; b.setAttribute("aria-pressed", String(b.classList.contains("is-on"))); }

    // ---------------------------------------------------------------- view

    // px per drawing unit; the svg keeps the map's proportions, so width decides.
    const k = () => view.clientWidth / vb[2];

    // The view never leaves the drawn map: past its edge there is nothing.
    function clamp(v) {
      const w = Math.min(FULL[2], Math.max(MIN_W, v[2])), h = w * ASPECT;
      const cx = v[0] + v[2] / 2, cy = v[1] + v[3] / 2;
      return [
        Math.min(FULL[0] + FULL[2] - w, Math.max(FULL[0], cx - w / 2)),
        Math.min(FULL[1] + FULL[3] - h, Math.max(FULL[1], cy - h / 2)),
        w, h,
      ];
    }

    let lastK = 0;
    function apply(v) {
      vb = clamp(v);
      svg.setAttribute("viewBox", vb.map((n) => n.toFixed(2)).join(" "));
      const kk = k();
      if (!kk) return;
      svg.style.setProperty("--k", kk.toFixed(4));
      svg.classList.toggle("z2", vb[2] < FULL[2] * 0.6);
      // Scale bar: a round distance at least 60 px long.
      const pxPerKm = kk / KM;
      const km = [5, 10, 20, 25, 50, 100, 200, 250, 500].find((d) => d * pxPerKm >= 60) ?? 500;
      bar.style.width = Math.round(km * pxPerKm) + "px";
      barT.textContent = km + " km";
      // Panning keeps screen distances, so groups change only with the zoom.
      if (Math.abs(kk - lastK) > 1e-4) { lastK = kk; cluster(); }
      tip.hidden = true;
    }

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function fly(to) {
      cancelAnimationFrame(anim);
      to = clamp(to);
      if (reduce.matches) return apply(to);
      const from = vb.slice(), t0 = performance.now();
      const dur = 550 + Math.min(350, Math.abs(Math.log(to[2] / from[2])) * 220);
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur), e = ease(t);
        apply(from.map((f, i) => f + (to[i] - f) * e));
        if (t < 1) anim = requestAnimationFrame(tick);
      };
      anim = requestAnimationFrame(tick);
    }

    // A drawing box shown whole, with some air around it.
    function frame([x, y, w, h], pad = 1.25) {
      const W = Math.max(w * pad, (h * pad) / ASPECT, MIN_W * 1.5);
      return [x + w / 2 - W / 2, y + h / 2 - (W * ASPECT) / 2, W, W * ASPECT];
    }

    // Zoom by `f` (<1 closer) keeping the drawing point under (px, py) in place.
    function zoomAt(f, px, py, animate) {
      const r = view.getBoundingClientRect();
      const fx = (px - r.left) / r.width, fy = (py - r.top) / r.height;
      const ux = vb[0] + fx * vb[2], uy = vb[1] + fy * vb[3];
      const w = Math.min(FULL[2], Math.max(MIN_W, vb[2] * f)), h = w * ASPECT;
      const next = [ux - fx * w, uy - fy * h, w, h];
      animate ? fly(next) : (cancelAnimationFrame(anim), apply(next));
    }
    const zoomCenter = (f) => { const r = view.getBoundingClientRect(); zoomAt(f, r.left + r.width / 2, r.top + r.height / 2, true); };

    // A country button stays lit only until the map is moved some other way.
    const pressArea = (on) => { for (const a of areas) { a.classList.toggle("is-on", a === on); a.setAttribute("aria-pressed", String(a === on)); } };
    const clearArea = () => pressArea(null);

    // ---------------------------------------------------------------- groups of pins

    const GAP = 18; // px: heads closer than this would overlap
    function cluster() {
      const kk = k();
      const free = ids.filter((id) => id !== current);
      const groups = [];
      const used = new Set();
      for (const id of free) {
        if (used.has(id)) continue;
        const [x, y] = at.get(id);
        const g = [id];
        for (const other of free) {
          if (other === id || used.has(other)) continue;
          const [ox, oy] = at.get(other);
          if (Math.hypot((ox - x) * kk, (oy - y) * kk) < GAP) g.push(other);
        }
        if (g.length > 1) { g.forEach((m) => used.add(m)); groups.push(g); }
      }
      for (const p of pins) p.classList.toggle("is-clustered", used.has(p.dataset.ref));
      layer.replaceChildren(...groups.map(groupMark));
    }

    function groupMark(members) {
      const pts = members.map((m) => at.get(m));
      const x = pts.reduce((s, p) => s + p[0], 0) / pts.length, y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      const g = document.createElementNS(SVGNS, "g");
      g.setAttribute("class", "rm-cl");
      g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `${members.length} stavby blízko seba, priblížiť`);
      g.innerHTML = `<g class="rm-fix"><circle class="rm-cl-ring" r="19"/><circle class="rm-cl-head" r="13"/><text class="rm-cl-t" y="4.3">${members.length}</text></g>`;
      const open = () => {
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        const x0 = Math.min(...xs), y0 = Math.min(...ys);
        fly(frame([x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0], 3));
      };
      g.addEventListener("click", () => { if (!dragged) open(); });
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      g.dataset.members = members.join(" ");
      return g;
    }

    // ---------------------------------------------------------------- pins and the card

    function cardFor(id) {
      return root.querySelector(`template[data-ref-card="${id}"]`).content.firstElementChild.cloneNode(true);
    }

    function select(id, { move = true } = {}) {
      if (!ids.includes(id)) return;
      current = id;
      for (const p of pins) {
        const on = p.dataset.ref === id;
        p.classList.toggle("is-on", on);
        // Drawn last, so the chosen pin sits on top of its neighbours.
        if (on) p.parentNode.appendChild(p);
      }
      card.replaceChildren(cardFor(id));
      pos.textContent = `${ids.indexOf(id) + 1} / ${ids.length}`;
      for (const row of document.querySelectorAll("[data-ref-row]")) row.classList.toggle("is-on", row.dataset.refRow === id);
      cluster();
      if (!move) return;
      // Bring the pin into view; zoom in to a region, never out.
      const [x, y] = at.get(id);
      const w = Math.min(vb[2], FULL[2] * 0.42), h = w * ASPECT;
      const inside = x > vb[0] + vb[2] * 0.1 && x < vb[0] + vb[2] * 0.9 && y > vb[1] + vb[3] * 0.2 && y < vb[1] + vb[3] * 0.92;
      if (!inside || vb[2] > w) { clearArea(); fly([x - w / 2, y - h / 2, w, h]); }
    }

    // On a narrow screen the card is under the map: show its top after a choice.
    function revealCard() {
      if (innerWidth >= 1000) return;
      const r = card.getBoundingClientRect();
      if (r.top > innerHeight - 120) card.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "nearest" });
    }

    for (const p of pins) {
      p.addEventListener("click", (e) => {
        e.preventDefault();
        if (dragged) return;
        select(p.dataset.ref);
        revealCard();
      });
      p.addEventListener("pointerenter", () => showTip(p));
      p.addEventListener("pointerleave", () => (tip.hidden = true));
      p.addEventListener("focus", () => showTip(p));
      p.addEventListener("blur", () => (tip.hidden = true));
    }

    function showTip(p) {
      if (dragging) return;
      const head = p.querySelector(".rm-head").getBoundingClientRect(), r = view.getBoundingClientRect();
      tip.querySelector("b").textContent = p.dataset.tip;
      tip.querySelector("span").textContent = p.dataset.sub;
      tip.style.left = Math.min(r.width - 130, Math.max(130, head.left + head.width / 2 - r.left)) + "px";
      tip.style.top = head.top - r.top + "px";
      tip.hidden = false;
    }

    nav.addEventListener("click", (e) => {
      const b = e.target.closest("[data-step]");
      if (!b) return;
      select(ids[(ids.indexOf(current) + Number(b.dataset.step) + ids.length) % ids.length]);
    });

    ctl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-zoom]");
      if (!b) return;
      clearArea();
      zoomCenter(b.dataset.zoom === "in" ? 0.6 : 1 / 0.6);
    });

    // All jobs, or one country: show that part of the map.
    for (const b of areas) {
      b.addEventListener("click", () => {
        pressArea(b);
        const box = b.dataset.box.split(" ").map(Number);
        fly(box[2] >= FULL[2] ? FULL : frame(box, 1.12));
      });
    }

    // ---------------------------------------------------------------- photos

    let lb = null, lbPhotos = [], lbN = 0;
    function lbShow(d) {
      lbN = (lbN + d + lbPhotos.length) % lbPhotos.length;
      const p = lbPhotos[lbN];
      lb.querySelector(".lb-img").src = p.src;
      lb.querySelector(".lb-img").alt = p.alt;
      lb.querySelector(".lb-alt").textContent = p.alt;
      lb.querySelector(".lb-credit").textContent = p.credit ? "Foto: " + p.credit : "";
    }
    function viewer(photos, i) {
      if (!lb) {
        lb = document.createElement("dialog");
        lb.className = "lb";
        lb.setAttribute("aria-label", "Fotky stavby");
        lb.innerHTML = `<div class="lb-in"><img class="lb-img" alt=""><p class="lb-cap"><span class="lb-alt"></span><span class="lb-credit"></span></p></div><button type="button" class="lb-x">Zavrieť</button><button type="button" class="lb-prev" aria-label="Predchádzajúca fotka">&larr;</button><button type="button" class="lb-next" aria-label="Ďalšia fotka">&rarr;</button>`;
        document.body.appendChild(lb);
        lb.querySelector(".lb-x").addEventListener("click", () => lb.close());
        lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-in")) lb.close(); });
        lb.querySelector(".lb-prev").addEventListener("click", () => lbShow(-1));
        lb.querySelector(".lb-next").addEventListener("click", () => lbShow(1));
        lb.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") lbShow(-1); if (e.key === "ArrowRight") lbShow(1); });
      }
      lbPhotos = photos;
      lbN = i;
      lb.querySelector(".lb-prev").hidden = lb.querySelector(".lb-next").hidden = photos.length < 2;
      lbShow(0);
      lb.showModal();
    }

    card.addEventListener("click", (e) => {
      const fig = e.target.closest(".ref-photo");
      if (!fig) return;
      const photos = JSON.parse(fig.dataset.photos);
      const thumb = e.target.closest(".ref-thumb");
      const img = fig.querySelector(".ref-zoom img");
      if (thumb) {
        const p = photos[Number(thumb.dataset.i)];
        img.src = p.src;
        img.alt = p.alt;
        fig.dataset.i = thumb.dataset.i;
        const cap = fig.querySelector(".ref-credit");
        if (cap) cap.textContent = p.credit ? "Foto: " + p.credit : "";
        for (const t of fig.querySelectorAll(".ref-thumb")) t.setAttribute("aria-current", String(t === thumb));
      } else if (e.target.closest(".ref-zoom")) {
        viewer(photos, Number(fig.dataset.i || 0));
      }
    });

    // ---------------------------------------------------------------- drag, pinch, wheel

    const pts = new Map();
    let dragged = false, dragging = false, start = null, pinch = null;

    svg.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      dragged = false;
      start = { x: e.clientX, y: e.clientY, vb: vb.slice(), id: e.pointerId };
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2 };
      }
    });
    svg.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && pinch) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        zoomAt(pinch.d / d, mx, my, false);
        const u = vb[2] / view.clientWidth;
        apply([vb[0] - (mx - pinch.mx) * u, vb[1] - (my - pinch.my) * u, vb[2], vb[3]]);
        pinch = { d, mx, my };
        dragged = true;
        return;
      }
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      // A drag starts only after a few pixels, so a click on a pin stays a click.
      if (!dragged && Math.hypot(dx, dy) < 5) return;
      if (!dragged) {
        dragged = dragging = true;
        svg.setPointerCapture(e.pointerId);
        svg.classList.add("is-drag");
        cancelAnimationFrame(anim);
        tip.hidden = true;
        clearArea();
      }
      const u = start.vb[2] / view.clientWidth;
      apply([start.vb[0] - dx * u, start.vb[1] - dy * u, start.vb[2], start.vb[3]]);
    });
    const end = (e) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (!pts.size) { start = null; dragging = false; svg.classList.remove("is-drag"); setTimeout(() => (dragged = false), 0); }
    };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);

    // The wheel scrolls the page; with Ctrl (or a trackpad pinch, which the
    // browser reports as Ctrl + wheel) it zooms the map.
    let hintT = 0;
    svg.addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        hint.hidden = true;
        clearArea();
        zoomAt(Math.exp(e.deltaY * 0.0022), e.clientX, e.clientY, false);
        return;
      }
      hint.hidden = false;
      clearTimeout(hintT);
      hintT = setTimeout(() => (hint.hidden = true), 1400);
    }, { passive: false });

    svg.addEventListener("dblclick", (e) => { e.preventDefault(); clearArea(); zoomAt(0.5, e.clientX, e.clientY, true); });

    // Keyboard on the map: + and - zoom, arrows move it.
    view.addEventListener("keydown", (e) => {
      const step = vb[2] * 0.15;
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[e.key]) { e.preventDefault(); fly([vb[0] + moves[e.key][0], vb[1] + moves[e.key][1], vb[2], vb[3]]); }
      else if (e.key === "+" || e.key === "=") zoomCenter(0.6);
      else if (e.key === "-") zoomCenter(1 / 0.6);
    });

    new ResizeObserver(() => apply(vb)).observe(view);
    apply(vb);

    // ---------------------------------------------------------------- the register on the reference page

    const rows = [...document.querySelectorAll("[data-ref-row]")];
    for (const row of rows) {
      row.addEventListener("click", (e) => {
        if (e.target.closest("a") && !e.target.closest("[data-ref-link]")) return;
        e.preventDefault();
        history.replaceState(null, "", "#ref-" + row.dataset.refRow);
        root.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "center" });
        select(row.dataset.refRow);
      });
    }
    // #ref-<id> in the address: show that job.
    const fromHash = () => {
      const m = /^#ref-(.+)$/.exec(location.hash);
      if (m && ids.includes(m[1])) select(m[1]);
    };
    fromHash();
    addEventListener("hashchange", fromHash);
  }
})();
