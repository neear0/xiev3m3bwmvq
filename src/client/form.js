// Contact form. Without JavaScript it is an ordinary form post: the Worker
// stores the enquiry and redirects to the thank-you page. With it, the form
// is sent in the background and the answer, or what to fix, is shown in place.
(() => {
  const form = document.getElementById("dopyt");
  if (!form || !window.fetch || !window.URLSearchParams) return;

  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector(".form-status");
  const label = button.textContent;

  // "Pre stavebné firmy" links here with ?praca=subdodavka.
  const wanted = new URLSearchParams(location.search).get("praca");
  const select = form.elements.praca;
  if (wanted && select && [...select.options].some((o) => o.value === wanted)) select.value = wanted;

  function say(text, kind) {
    status.textContent = text;
    status.className = "form-status" + (kind ? " is-" + kind : "");
  }

  function clearErrors() {
    for (const el of form.querySelectorAll('[aria-invalid="true"]')) el.removeAttribute("aria-invalid");
    for (const p of form.querySelectorAll(".fld-err")) {
      p.textContent = "";
      p.hidden = true;
    }
  }

  function showErrors(errors) {
    let first = null;
    for (const [name, message] of Object.entries(errors || {})) {
      const input = form.elements[name];
      const box = input && document.getElementById(input.id + "-err");
      if (!input || !box) continue;
      input.setAttribute("aria-invalid", "true");
      box.textContent = message;
      box.hidden = false;
      first = first || input;
    }
    if (first) first.focus();
  }

  form.addEventListener("submit", async (e) => {
    // Let the browser point at missing required fields first.
    if (!form.checkValidity()) return;
    e.preventDefault();
    clearErrors();
    button.disabled = true;
    button.textContent = "Odosielam";
    say("");
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams(new FormData(form)),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok) {
        form.reset();
        say("Ďakujeme, dopyt sme dostali. Ozveme sa vám a dohodneme termín obhliadky.", "ok");
      } else {
        showErrors(data.errors);
        say(data.message || "Dopyt sa nepodarilo odoslať. Skúste to znova alebo nám zavolajte.", "err");
      }
    } catch {
      say("Dopyt sa nepodarilo odoslať. Skontrolujte pripojenie a skúste to znova, alebo nám zavolajte.", "err");
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
})();
