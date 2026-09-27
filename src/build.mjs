// Builds the site into dist/.
//
//   node src/build.mjs            production build (what `wrangler deploy` runs)
//   node src/build.mjs --preview  local preview: missing contact details are
//                                 filled with stand-ins
//
//   AQUA_PAGES_URL=https://owner.github.io/repo node src/build.mjs --preview
//                                 the same preview for GitHub Pages: every
//                                 root path gets the /repo prefix, pages are
//                                 noindex and the form is switched off
//
// A production build refuses to finish while a contact detail is missing or
// the domain is unconfirmed, so a placeholder can never go live.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { SITE } from "../site.config.mjs";
import { MODE, missing, abs, esc } from "./lib/html.mjs";
import { renderPage } from "./lib/layout.mjs";
import { SERVICES, PATHS } from "./lib/nav.mjs";
import { heroCalloutCss } from "./drawings/views.mjs";
import { MARK } from "./lib/layout.mjs";
import { mapCss, refProblems } from "./lib/refs.mjs";

import home from "./pages/home.mjs";
import roof from "./pages/roof.mjs";
import insulation from "./pages/insulation.mjs";
import green from "./pages/green.mjs";
import terrace from "./pages/terrace.mjs";
import base from "./pages/base.mjs";
import materials from "./pages/materials.mjs";
import b2b from "./pages/b2b.mjs";
import references from "./pages/references.mjs";
import contact from "./pages/contact.mjs";
import sent from "./pages/sent.mjs";
import privacy from "./pages/privacy.mjs";
import legal from "./pages/legal.mjs";
import accessibility from "./pages/accessibility.mjs";
import notFound from "./pages/not-found.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const CLIENT = path.join(ROOT, "src", "client");
const STATIC = path.join(ROOT, "static");
const LAST_MODIFIED = "2026-09-27";

MODE.preview = process.argv.includes("--preview") || process.env.AQUA_PREVIEW === "1";
if (process.env.AQUA_PAGES_URL) {
  const u = new URL(process.env.AQUA_PAGES_URL);
  MODE.preview = true;
  MODE.pages = true;
  MODE.base = u.pathname.replace(/\/$/, "");
  SITE.url = u.origin + MODE.base;
}

// On GitHub Pages the site lives in a folder: root paths in attributes, in the
// photo data of the reference cards and in the stylesheet get its prefix.
const based = (html) => !MODE.base ? html : html
  .replace(/(\s(?:href|src|action)=")\/(?!\/)/g, `$1${MODE.base}/`)
  .replace(/data-photos="([^"]*)"/g, (_, v) => `data-photos="${v.replace(/&quot;\//g, `&quot;${MODE.base}/`)}"`);

const warnings = [];
const errors = [];

// Empties dist/ but keeps the folder: on Windows, `wrangler dev` holds a
// handle on it and removing the folder itself fails with EPERM.
function emptyDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const e of fs.readdirSync(dir)) fs.rmSync(path.join(dir, e), { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

function write(rel, data) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

const hash = (buf) => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10);

// ------------------------------------------------------------------ assets

emptyDir(DIST);
const A = {}; // logical name -> public URL

function asset(name, buf) {
  const ext = path.extname(name);
  const url = `/assets/${path.basename(name, ext)}.${hash(buf)}${ext}`;
  write(url, buf);
  A[name] = url;
}

const FONT_DIR = path.join(ROOT, "node_modules", "@fontsource-variable", "mona-sans", "files");
asset("mona-latin.woff2", fs.readFileSync(path.join(FONT_DIR, "mona-sans-latin-standard-normal.woff2")));
asset("mona-latin-ext.woff2", fs.readFileSync(path.join(FONT_DIR, "mona-sans-latin-ext-standard-normal.woff2")));

{
  let css = fs.readFileSync(path.join(CLIENT, "style.css"), "utf8")
    + "\n" + fs.readFileSync(path.join(CLIENT, "drawing.css"), "utf8")
    + "\n/* generated: hero callout positions */\n" + heroCalloutCss() + "\n"
    + "\n/* generated: reference map proportions */\n" + mapCss() + "\n";
  css = css.replace(/__(mona-latin(?:-ext)?\.woff2)__/g, (_, n) => A[n]);
  if (!MODE.preview) css = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*\n/g, "\n");
  if (MODE.base) css = css.replace(/url\(\/assets\//g, `url(${MODE.base}/assets/`);
  asset("style.css", Buffer.from(css));
}
for (const js of ["site.js", "home.js", "form.js", "refs.js"]) asset(js, fs.readFileSync(path.join(CLIENT, js)));

// Static files are copied as they are, at the same path.
if (fs.existsSync(STATIC)) fs.cpSync(STATIC, DIST, { recursive: true });
write("favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ecf0f2"/><path d="M2 5h6v18h16V5h6v24H2z" fill="#14283b"/><path d="M9.6 5v16.4h12.8V5" fill="none" stroke="#cf3a2b" stroke-width="3.2"/></svg>`);

// ------------------------------------------------------------------ pages

const pages = [home, roof, insulation, green, terrace, base, materials, b2b, references, contact, sent, privacy, legal, accessibility, notFound].map((f) => f());
const known = new Set(pages.map((p) => p.path));

for (const page of pages) {
  const html = renderPage(page, A);
  const out = page.file ?? (page.path.endsWith("/") ? path.join(page.path, "index.html") : page.path);
  write(out, based(html));
  check(page, html);
}

function check(page, html) {
  const where = page.file ?? page.path;
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");

  // Owner's rule across all of the family's sites: no en or em dashes in copy.
  const dash = /[–—]/.exec(visible);
  if (dash) errors.push(`${where}: en/em dash in the copy near "${visible.slice(Math.max(0, dash.index - 40), dash.index + 40).replace(/\s+/g, " ")}"`);

  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${where}: ${h1} h1 elements`);

  for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    const target = m[1];
    if (target.startsWith("/assets/") || /\.(svg|png|ico|xml|txt)$/.test(target)) continue;
    if (!known.has(target)) errors.push(`${where}: link to unknown page ${target}`);
  }
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!html.includes(`id="${m[1]}"`)) errors.push(`${where}: link to missing anchor #${m[1]}`);
  }
  if (page.title.length > 65) warnings.push(`${where}: title is ${page.title.length} characters`);
  if (page.description.length > 165 || page.description.length < 70) warnings.push(`${where}: description is ${page.description.length} characters`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) errors.push(`${where}: duplicate ids ${[...new Set(dup)].join(", ")}`);
}

// ------------------------------------------------------------------ crawl files

const indexable = pages.filter((p) => !p.noindex && !p.file);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `<url><loc>${abs(p.path)}</loc><lastmod>${LAST_MODIFIED}</lastmod></url>`).join("\n")}
</urlset>
`);

write("robots.txt", MODE.pages ? "# Preview of the site before launch: not for search engines.\nUser-agent: *\nDisallow: /\n" : `# Search engines and AI assistants are welcome to read and cite this site.
User-agent: *
Allow: /
Disallow: /api/

User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-User
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: Bingbot
User-agent: CCBot
Allow: /
Disallow: /api/

Sitemap: ${abs("/sitemap.xml")}
`);

write("llms.txt", `# ${SITE.name}

> ${SITE.legalName} robí hydroizolácie plochých striech, terás a balkónov, zelené strechy, zateplenie plochých striech a izolácie spodnej stavby proti zemnej vlhkosti, spodnej a tlakovej vode a radónu. Pracuje na Slovensku, v Česku a v Nemecku. Obhliadka objektu a cenová ponuka sú bezplatné. Na vykonané práce dáva štandardne záruku ${SITE.warrantyYears} rokov.

Firma pracuje s fóliami z mäkčeného PVC (PVC-P) a z TPO a FPO, so systémami Fatrafol, Sikaplan a Sarnafil, Bauder a ďalšími certifikovanými systémami. Robí aj subdodávky pre stavebné firmy.

## Služby
${SERVICES.map((s) => `- [${s.name}](${abs(s.path)})`).join("\n")}

## Ďalšie stránky
- [Hydroizolačné fólie a systémy](${abs(PATHS.materials)})
- [Subdodávky pre stavebné firmy](${abs(PATHS.b2b)})
- [Referencie: mapa stavieb](${abs(PATHS.references)})
- [Právne informácie](${abs(PATHS.legal)})
- [Vyhlásenie o prístupnosti](${abs(PATHS.accessibility)})
- [Kontakt a bezplatná obhliadka](${abs(PATHS.contact)})

## Údaje o firme
- Obchodné meno: ${SITE.legalName}
- Sídlo: ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}
- IČO: ${SITE.ico}
- Zápis: ${SITE.register}
`);

write("_headers", `/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  X-Frame-Options: DENY
  Cross-Origin-Opener-Policy: same-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`);

// Raster images come from tools/images.mjs (headless Edge), not from this build.
for (const img of ['og.png', 'favicon-48.png', 'apple-touch-icon.png', 'logo-512.png']) {
  if (fs.existsSync(path.join(STATIC, img))) continue;
  const msg = 'static/' + img + ' is missing: run node tools/images.mjs';
  if (MODE.preview) warnings.push(msg); else errors.push(msg);
}

// ------------------------------------------------------------------ verdict

{
  const refs = refProblems();
  errors.push(...refs.errors);
  if (refs.samples && !MODE.preview) errors.push(`referencie.mjs still has ${refs.samples} sample job(s) (sample: true): replace them with real ones`);
  if (refs.samples && MODE.preview) console.warn(`preview: ${refs.samples} sample job(s) on the reference map`);
}

if (!MODE.preview) {
  if (missing.size) errors.push(`missing contact details in site.config.mjs: ${[...missing].join(", ")}`);
  if (!SITE.domainConfirmed) errors.push("the domain is not confirmed: set SITE.domainConfirmed in site.config.mjs once it points here");
}

for (const w of warnings) console.warn("warning:", w);
if (MODE.preview && missing.size) console.warn(`preview: placeholders shown for ${[...missing].join(", ")}`);
if (errors.length) {
  for (const e of errors) console.error("error:", e);
  console.error(`\nbuild failed with ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`built ${pages.length} pages into dist/${MODE.preview ? " (preview)" : ""}`);
