// Menu for narrow screens. Without JavaScript the menu button is a plain link
// to the site map in the footer; with it, the button opens the menu panel.
(() => {
  const btn = document.querySelector("[data-menu-toggle]");
  const menu = document.getElementById("menu");
  if (!btn || !menu) return;

  const root = document.documentElement;
  const label = btn.querySelector(".menu-lbl");
  btn.setAttribute("role", "button");
  btn.setAttribute("aria-controls", "menu");
  btn.setAttribute("aria-expanded", "false");

  const focusables = () => [btn, ...menu.querySelectorAll("a[href], button:not([disabled])")];

  function open() {
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    if (label) label.textContent = "Zavrieť";
    // On a phone the scrolling box is <html>, so locking <body> alone does nothing.
    root.classList.add("menu-open");
    document.body.classList.add("menu-open");
  }

  function close(returnFocus) {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    if (label) label.textContent = "Menu";
    root.classList.remove("menu-open");
    document.body.classList.remove("menu-open");
    if (returnFocus) btn.focus();
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (menu.hidden) open();
    else close(false);
  });
  btn.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (menu.hidden) return;
    if (e.key === "Escape") return close(true);
    if (e.key !== "Tab") return;
    const f = focusables();
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && i === f.length - 1) {
      e.preventDefault();
      f[0].focus();
    }
  });
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) close(false);
  });
  const wide = matchMedia("(min-width: 1340px)");
  wide.addEventListener("change", () => {
    if (wide.matches && !menu.hidden) close(false);
  });
})();

// Labelled close-up drawings: keep the label text one size on screen,
// whatever the drawing's scale (the CSS divides by --k).
(() => {
  const svgs = [...document.querySelectorAll("svg.dwg-close:not(.cam-svg)")].filter((el) => el.querySelector(".lbls"));
  if (!svgs.length || !("ResizeObserver" in window)) return;
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const el = e.target, v = el.viewBox.baseVal, box = e.contentRect;
      if (!box.width || !v.width) continue;
      el.style.setProperty("--k", Math.min(box.width / v.width, box.height / v.height).toFixed(4));
      el.classList.add("k-ready");
    }
  });
  for (const el of svgs) ro.observe(el);
})();
