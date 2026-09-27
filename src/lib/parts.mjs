// Small pieces of markup shared by several pages.

import { esc, phone, email } from "./html.mjs";
import { PATHS } from "./nav.mjs";

// A telephone handset, drawn to sit on the text baseline.
export const PHONE_ICON = `<svg class="ico" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5.2 2.5l2.6 2.9c.4.5.4 1.1 0 1.6L6.6 8.3c.9 2 2.6 3.8 4.7 4.8l1.3-1.3c.5-.4 1.2-.4 1.6 0l2.9 2.6c.5.4.5 1.2 0 1.6l-1.5 1.5c-.8.8-2 1.1-3 .6C7.9 16.3 3.8 12.2 2 7.3c-.4-1.1-.1-2.2.6-3l1.5-1.5c.4-.5 1.2-.5 1.6 0z"/></svg>`;

// The two ways to start: ask for the free inspection, or call.
export function ctaPair({ call = true } = {}) {
  const p = phone();
  return `<div class="cta-row">
<a class="btn btn-red" href="${PATHS.contact}#dopyt">Objednať bezplatnú obhliadku</a>
${call ? `<a class="btn btn-line" href="${p.href}"${p.attr}>${PHONE_ICON}<span>${esc(p.text)}</span></a>` : ""}
</div>`;
}

// What holds for every job, set like a row of a drawing's title block.
export function facts({ cls = "" } = {}) {
  return `<section class="facts${cls ? " " + cls : ""}" aria-label="Čo u nás platí pri každej zákazke">
<dl class="facts-row">
<div><dt>Obhliadka a cenová ponuka</dt><dd>Zadarmo a nezáväzne</dd></div>
<div><dt>Záruka na vykonané práce</dt><dd>Štandardne 10 rokov</dd></div>
<div><dt>Kde pracujeme</dt><dd>Slovensko, Česko a Nemecko</dd></div>
<div><dt>Systémy</dt><dd>Fatrafol, Sika, Bauder</dd></div>
</dl>
</section>`;
}

// Questions and answers. Answers are trusted HTML written in the page files.
// A note next to the list tells people where to ask the rest (on every page, so
// the section looks the same everywhere; `aside: false` leaves it out).
export function faqList(items, { id = "otazky", heading = "Časté otázky", level = 2, aside = true } = {}) {
  const h = `h${level}`;
  const p = phone(), e = email();
  const note = aside ? `<aside class="faq-note" aria-label="Ďalšie otázky">
<p class="faq-note-h">Nenašli ste odpoveď?</p>
<p>Zavolajte alebo napíšte. Na otázky k streche, terase či suterénu radi odpovieme aj bez objednávky.</p>
<p class="faq-note-lines"><a href="${p.href}"${p.attr}>${PHONE_ICON}<span>${esc(p.text)}</span></a><a href="${e.href}"${e.attr}>${esc(e.text)}</a></p>
</aside>` : "";
  return `<section class="faq${aside ? " faq-has-note" : ""}" id="${id}" aria-labelledby="${id}-h">
<${h} class="sec-h" id="${id}-h">${esc(heading)}</${h}>
<div class="faq-body">
<div class="faq-list">${items
    .map((it) => `<details class="qa"><summary><span>${esc(it.q)}</span></summary><div class="qa-a">${it.a}</div></details>`)
    .join("")}</div>
${note}
</div>
</section>`;
}

// "Related" links at the bottom of a service page, to the neighbours in the building.
export function related(list) {
  return `<nav class="rel" aria-label="Súvisiace služby"><p class="rel-k">Súvisiace</p><ul>${list
    .map((s) => `<li><a href="${s.path}">${esc(s.name)}</a></li>`)
    .join("")}</ul></nav>`;
}
