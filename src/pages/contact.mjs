import { esc, phone, email, MODE } from "../lib/html.mjs";
import { PATHS } from "../lib/nav.mjs";
import { crumbTrail } from "../lib/layout.mjs";
import { seq } from "../lib/svc.mjs";
import { WORK_TYPES } from "../lib/enquiry.js";

// One labelled field. Errors from the server are written into the empty <p>.
function field(id, name, label, input, { optional = false, wide = false } = {}) {
  return `<div class="fld${wide ? " fld-wide" : ""}">
<label for="${id}">${esc(label)}${optional ? ' <span class="opt">nepovinné</span>' : ""}</label>
${input.replace("<INPUT", `<input id="${id}" name="${name}" aria-describedby="${id}-err"`).replace("<TEXTAREA", `<textarea id="${id}" name="${name}" aria-describedby="${id}-err"`).replace("<SELECT", `<select id="${id}" name="${name}" aria-describedby="${id}-err"`)}
<p class="fld-err" id="${id}-err" hidden></p>
</div>`;
}

export default function contact() {
  const p = phone(), e = email();
  const page = {
    id: "contact",
    path: PATHS.contact,
    title: "Kontakt a bezplatná obhliadka | AquaShield",
    description: "Objednajte si bezplatnú obhliadku strechy, terasy alebo suterénu. Zavolajte alebo napíšte, kde je stavba a čo treba urobiť. Slovensko, Česko a Nemecko.",
    crumbs: [{ name: "Kontakt", path: PATHS.contact }],
    pageType: "ContactPage",
    scripts: ["form.js"],
    footCta: false,
    dock: false,
  };

  const options = [`<option value="">Vyberte</option>`]
    .concat(Object.entries(WORK_TYPES).map(([v, t]) => `<option value="${v}">${esc(t)}</option>`))
    .join("");

  page.body = `<section class="contact">
${crumbTrail(page)}
<div class="contact-grid">
<div class="contact-info">
<h1>Kontakt a bezplatná obhliadka</h1>
<p class="svc-lead">Zavolajte alebo vyplňte formulár. Napíšte, kde je stavba a čo treba urobiť, a dohodneme termín obhliadky. Obhliadka aj cenová ponuka sú zadarmo.</p>
<dl class="lines">
<div><dt>Telefón</dt><dd><a href="${p.href}"${p.attr}>${esc(p.text)}</a></dd></div>
<div><dt>E-mail</dt><dd><a href="${e.href}"${e.attr}>${esc(e.text)}</a></dd></div>
</dl>
<p class="note">Ak máte fotky strechy alebo miesta, kde zateká, pošlite nám ich e-mailom. Pomôžu nám pripraviť sa na obhliadku.</p>
<h2 class="blk-h blk-h-sm">Čo bude nasledovať</h2>
${seq([
  "Ozveme sa vám a dohodneme termín obhliadky.",
  "Na obhliadke zistíme stav, zameriame plochu a pri zatekaní hľadáme príčinu.",
  "Pošleme vám cenovú ponuku na mieru. Obhliadka ani ponuka vás k ničomu nezaväzujú.",
])}
</div>
<form class="form" id="dopyt" action="/api/dopyt" method="post" aria-labelledby="dopyt-h">
<h2 class="blk-h" id="dopyt-h">Objednať obhliadku</h2>
<div class="form-grid">
${field("f-meno", "meno", "Meno a priezvisko", `<INPUT autocomplete="name" required minlength="2" maxlength="100">`)}
${field("f-tel", "telefon", "Telefón", `<INPUT type="tel" autocomplete="tel" inputmode="tel" required minlength="9" maxlength="20">`)}
${field("f-email", "email", "E-mail", `<INPUT type="email" autocomplete="email" maxlength="160">`, { optional: true })}
${field("f-obec", "obec", "Kde je stavba", `<INPUT autocomplete="address-level2" required minlength="2" maxlength="80" placeholder="Obec alebo mesto">`)}
${field("f-praca", "praca", "Čo treba urobiť", `<SELECT>${options}</select>`, { optional: true })}
${field("f-plocha", "plocha", "Približná plocha v m²", `<INPUT inputmode="numeric" pattern="[0-9]{1,7}" maxlength="7">`, { optional: true })}
${field("f-sprava", "sprava", "Správa", `<TEXTAREA rows="5" maxlength="3000" placeholder="Čo sa deje, odkedy, aká je to strecha alebo terasa"></textarea>`, { optional: true, wide: true })}
<div class="fld fld-wide fld-check"><input type="checkbox" id="f-zateka" name="zateka" value="ano"><label for="f-zateka">Momentálne to zateká</label></div>
<div class="hp" aria-hidden="true"><label for="f-web">Toto pole nevypĺňajte</label><input id="f-web" name="web" tabindex="-1" autocomplete="off"></div>
</div>
<p class="form-note">Údaje použijeme len na vybavenie dopytu. Viac v <a href="${PATHS.privacy}">zásadách ochrany osobných údajov</a>.</p>
${MODE.pages ? '<p class="form-off">Toto je náhľad webu, formulár sa zatiaľ neodosiela.</p>' : ""}
<div class="form-send"><button class="btn btn-red" type="submit"${MODE.pages ? " disabled" : ""}>Odoslať dopyt</button><p class="form-status" role="status" aria-live="polite"></p></div>
</form>
</div>
</section>`;
  return page;
}
