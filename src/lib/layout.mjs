// The page shell: head, header, menu, footer and the mobile action bar.
// Every page is rendered through this, so the chrome exists exactly once.

import { SITE } from "../../site.config.mjs";
import { esc, phone, email, abs, MODE } from "./html.mjs";
import { SERVICES, PATHS, MAIN_NAV } from "./nav.mjs";
import { organization, website, webpage, breadcrumbs } from "./schema.mjs";

// The mark: a flat roof in section, parapets and slab in ink, the membrane in
// red lining it. On site it is called a "vaňa": a tub that holds water out.
export const MARK = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="mark-body" d="M2 5h6v18h16V5h6v24H2z"/><path class="mark-mem" d="M9.6 5v16.4h12.8V5"/></svg>`;

const YEAR = new Date().getFullYear();

function head(page, A) {
  const url = abs(page.path);
  const title = esc(page.title);
  const desc = esc(page.description);
  const graph = [organization(), ...(page.path === "/" ? [website()] : []), webpage(page)];
  if (page.crumbs) graph.push(breadcrumbs(page));
  if (page.schema) graph.push(...page.schema);
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  const scripts = ["site.js", ...(page.scripts ?? [])].map((s) => `<script src="${A[s]}" defer></script>`).join("\n");
  return `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
${MODE.pages ? '<meta name="robots" content="noindex, nofollow">' : page.noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${url}">`}
<meta property="og:type" content="website">
<meta property="og:locale" content="sk_SK">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(page.ogTitle ?? page.title)}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${abs("/og.png")}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Rez budovou s hydroizoláciou od strechy po základy">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ecf0f2">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="${A["mona-latin.woff2"]}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${A["mona-latin-ext.woff2"]}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${A["style.css"]}">
<script type="application/ld+json">${ld}</script>
${scripts}
</head>`;
}

function header(page) {
  const p = phone();
  // The bar leaves out the materials page (it is in the menu, the footer and on
  // every service page), so the row fits next to the contact button.
  const links = MAIN_NAV.filter((l) => l.path !== PATHS.materials).map((l) => `<li><a href="${l.path}"${l.path === page.path ? ' aria-current="page"' : ""}>${esc(l.label)}</a></li>`).join("");
  const menuLinks = MAIN_NAV.concat([{ path: PATHS.contact, label: "Kontakt" }])
    .map((l) => `<li><a href="${l.path}"${l.path === page.path ? ' aria-current="page"' : ""}>${esc(l.label)}</a></li>`).join("");
  return `<header class="bar">
<div class="bar-in">
<a class="brand" href="/" aria-label="${esc(SITE.name)}, úvodná stránka">${MARK}<span class="brand-word">AQUASHIELD</span></a>
<nav class="nav" aria-label="Hlavná navigácia"><ul>${links}</ul></nav>
<a class="btn btn-red bar-cta" href="${PATHS.contact}"${page.path === PATHS.contact ? ' aria-current="page"' : ""}>Kontakt</a>
<a class="menu-btn" href="#mapa-stranky" data-menu-toggle><span class="menu-ico" aria-hidden="true"></span><span class="menu-lbl">Menu</span></a>
</div>
<div class="menu" id="menu" hidden>
<nav aria-label="Menu"><ul class="menu-list">${menuLinks}</ul></nav>
<div class="menu-contact">
<a class="menu-phone" href="${p.href}"${p.attr}>${esc(p.text)}</a>
<a class="btn btn-red" href="${PATHS.contact}#dopyt">Objednať bezplatnú obhliadku</a>
</div>
</div>
</header>`;
}

function footer(page) {
  const p = phone(), e = email();
  // The invitation: a heading on the left, the ways to reach us on the right.
  const cta = page.footCta === false ? "" : `<div class="foot-cta">
<div class="foot-cta-text">
<p class="foot-h">Objednajte si bezplatnú obhliadku</p>
<p class="foot-lead">Zavolajte alebo napíšte, kde je stavba a čo treba urobiť. Ozveme sa a dohodneme termín.</p>
</div>
<div class="foot-reach">
<dl class="foot-lines">
<div><dt>Telefón</dt><dd><a href="${p.href}"${p.attr}>${esc(p.text)}</a></dd></div>
<div><dt>E-mail</dt><dd><a href="${e.href}"${e.attr}>${esc(e.text)}</a></dd></div>
</dl>
<a class="btn btn-red" href="${PATHS.contact}#dopyt">Napísať dopyt</a>
</div>
</div>`;
  const svc = SERVICES.map((s) => `<li><a href="${s.path}">${esc(s.name)}</a></li>`).join("");
  // Laid out like the title block in the corner of a drawing sheet.
  return `<footer class="foot">
${cta ? `<div class="foot-band"><div class="foot-in">${cta}</div></div>` : ""}
<div class="foot-in">
<div class="sheet" id="mapa-stranky">
<div class="sheet-brand"><a class="sheet-logo" href="/" aria-label="${esc(SITE.name)}, úvodná stránka">${MARK}<span class="sheet-word">AQUASHIELD</span></a><p class="sheet-sub">Hydroizolácie od strechy po základy. ${esc(SITE.area)}.</p>
<dl class="sheet-facts">
<div><dt>Obchodné meno</dt><dd>${esc(SITE.legalName)}</dd></div>
<div><dt>IČO</dt><dd>${esc(SITE.ico)}</dd></div>
<div class="wide"><dt>Sídlo</dt><dd>${esc(SITE.address.street)}, ${esc(SITE.address.postalCode)} ${esc(SITE.address.city)}</dd></div>
<div class="wide"><dt>Obchodný register</dt><dd>${esc(SITE.registerShort)}</dd></div>
</dl></div>
<nav class="sheet-nav" aria-label="Služby"><p class="sheet-k">Služby</p><ul>${svc}</ul></nav>
<nav class="sheet-nav" aria-label="Firma"><p class="sheet-k">Firma</p><ul>
<li><a href="${PATHS.materials}">Hydroizolačné fólie a systémy</a></li>
<li><a href="${PATHS.b2b}">Pre stavebné firmy</a></li>
<li><a href="${PATHS.references}">Referencie</a></li>
<li><a href="${PATHS.contact}">Kontakt</a></li>
</ul></nav>
</div>
<div class="foot-base">
<p>&copy; ${YEAR} ${esc(SITE.legalName)}</p>
<nav class="foot-legal" aria-label="Právne dokumenty"><a href="${PATHS.privacy}">Ochrana osobných údajov</a><a href="${PATHS.legal}">Právne informácie</a><a href="${PATHS.accessibility}">Vyhlásenie o prístupnosti</a></nav>
<div class="lw-credit"><a class="lw-credit__brand" href="https://lumaweb.sk/" target="_blank" rel="noopener">Luma<span>Web</span></a><a class="lw-credit__vs" href="https://voidsolutions.eu" target="_blank" rel="noopener">powered by <span>void</span> solutions</a></div>
</div>
</div>
</footer>`;
}

function dock(page) {
  if (page.dock === false) return "";
  const p = phone();
  return `<div class="dock"><a class="dock-call" href="${p.href}"${p.attr}>Zavolať</a><a class="dock-cta" href="${PATHS.contact}">Kontakt</a></div>`;
}

export function renderPage(page, A) {
  return `${head(page, A)}
<body class="pg-${page.id}${page.dock === false ? "" : " has-dock"}">
<a class="skip" href="#obsah">Preskočiť na obsah</a>
${MODE.pages ? '<p class="preview-note">Náhľad webu pred spustením. Telefón, e-mail a referencie sú zatiaľ len ukážkové a formulár sa neodosiela.</p>' : ""}
${header(page)}
<main id="obsah">
${page.body}
</main>
${footer(page)}
${dock(page)}
</body>
</html>
`;
}

// Breadcrumb trail shown at the top of a subpage; the schema version is in schema.mjs.
export function crumbTrail(page) {
  const items = [{ name: "Úvod", path: "/" }, ...page.crumbs];
  return `<nav class="crumbs" aria-label="Omrvinková navigácia"><ol>${items
    .map((c, i) => (i === items.length - 1 ? `<li><span aria-current="page">${esc(c.name)}</span></li>` : `<li><a href="${c.path}">${esc(c.name)}</a></li>`))
    .join("")}</ol></nav>`;
}
