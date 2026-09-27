// The reference map: the three countries drawn like a site plan, a pin for
// every finished job, and a card with the job next to the map. Data lives in
// referencie.mjs in the project root.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REFERENCES } from "../../referencie.mjs";
import { SITE } from "../../site.config.mjs";
import { esc } from "./html.mjs";
import { PATHS, service } from "./nav.mjs";
import { COUNTRIES, CONTEXT, RIVERS, LAKES, COUNTRY_BOX } from "../drawings/map-data.mjs";
import { PROJ, project } from "../drawings/map-proj.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const COUNTRY_NAME = { SK: "Slovensko", CZ: "Česko", DE: "Nemecko" };
const HQ = { name: SITE.address.city, lat: 48.484, lon: 18.719 };

// Newest first; same year keeps the file's order.
const REFS = REFERENCES.map((r, i) => ({ ...r, i })).sort((a, b) => b.year - a.year || a.i - b.i);

// Problems for the build: `errors` stop it, `samples` are fatal only in production.
export function refProblems() {
  const errors = [], ids = new Set();
  for (const r of REFS) {
    const at = `referencie.mjs: ${r.id || "(bez id)"}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id || "")) errors.push(`${at}: id must be lowercase letters, digits and hyphens`);
    if (ids.has(r.id)) errors.push(`${at}: duplicate id`);
    ids.add(r.id);
    for (const k of ["name", "place", "text"]) if (!r[k]) errors.push(`${at}: missing ${k}`);
    if (!COUNTRY_NAME[r.country]) errors.push(`${at}: country must be SK, CZ or DE`);
    if (!(r.lat > 45 && r.lat < 56 && r.lon > 5 && r.lon < 24)) errors.push(`${at}: lat/lon outside the map`);
    if (!Number.isInteger(r.year)) errors.push(`${at}: year must be a number`);
    if (!r.services?.length || r.services.some((s) => !service(s))) errors.push(`${at}: services must be roof, insulation, green, terrace or base`);
    for (const p of r.photos ?? []) {
      if (!p.alt) errors.push(`${at}: photo ${p.src} has no alt text`);
      if (!fs.existsSync(path.join(ROOT, "static", p.src))) errors.push(`${at}: photo static${p.src} not found`);
    }
  }
  return { errors, samples: REFS.filter((r) => r.sample).length };
}

const r1 = (n) => Math.round(n * 10) / 10;
const at = (lat, lon) => project(lat, lon).map(r1);
const where = (r) => `${esc(r.place)}, ${COUNTRY_NAME[r.country]}`;

// ------------------------------------------------------------------ card

function media(r) {
  if (!r.photos?.length) return "";
  const [first] = r.photos;
  const thumbs = r.photos.length > 1
    ? `<div class="ref-thumbs">${r.photos.map((p, i) => `<button type="button" class="ref-thumb"${i === 0 ? ' aria-current="true"' : ""} data-i="${i}"><img src="${esc(p.src)}" alt="" loading="lazy" decoding="async"><span class="vh">Fotka ${i + 1} z ${r.photos.length}</span></button>`).join("")}</div>`
    : "";
  const data = esc(JSON.stringify(r.photos.map((p) => ({ src: p.src, alt: p.alt, credit: p.credit ?? "" }))));
  return `<figure class="ref-photo" data-photos="${data}">
<button type="button" class="ref-zoom" aria-label="Zväčšiť fotku"><img src="${esc(first.src)}" alt="${esc(first.alt)}" loading="lazy" decoding="async"></button>
${first.credit ? `<figcaption class="ref-credit">Foto: ${esc(first.credit)}</figcaption>` : ""}
${thumbs}
</figure>`;
}

function refCard(r, { level = 3 } = {}) {
  const h = `h${level}`;
  const facts = [
    r.client && ["Objednávateľ", esc(r.client)],
    ["Práce", r.services.map((k) => { const s = service(k); return `<a href="${s.path}">${esc(s.name)}</a>`; }).join("<br>")],
    r.area && ["Plocha", esc(r.area)],
    r.system && ["Systém", esc(r.system)],
  ].filter(Boolean);
  return `<article class="ref-card">
<header class="ref-head"><span class="ref-where">${where(r)}</span><span class="ref-year">${r.year}</span></header>
${media(r)}
<div class="ref-body">
<${h} class="ref-name">${esc(r.name)}</${h}>
<p class="ref-text">${esc(r.text)}</p>
<dl class="ref-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
</div>
</article>`;
}

// ------------------------------------------------------------------ the register (reference page)

export function refTable() {
  const rows = REFS.map((r) => `<tr id="ref-${r.id}" data-ref-row="${r.id}">
<td class="rt-name"><a href="#ref-${r.id}" data-ref-link="${r.id}">${esc(r.name)}</a><span class="rt-text">${esc(r.text)}</span></td>
<td class="rt-place" data-k="Miesto">${where(r)}</td>
<td class="rt-work" data-k="Práce">${r.services.map((k) => esc(service(k).nav)).join(", ")}</td>
<td class="rt-area" data-k="Plocha">${r.area ? esc(r.area) : ""}</td>
<td class="rt-year" data-k="Rok">${r.year}</td>
</tr>`).join("\n");
  return `<div class="rt-wrap"><table class="ref-table">
<thead><tr><th scope="col">Stavba</th><th scope="col">Miesto</th><th scope="col">Práce</th><th scope="col" class="rt-area">Plocha</th><th scope="col" class="rt-year">Rok</th></tr></thead>
<tbody>
${rows}
</tbody>
</table></div>`;
}

// ------------------------------------------------------------------ map

const CITIES = [
  ["Berlín", 52.52, 13.405, 1], ["Hamburg", 53.55, 9.99, 1], ["Mníchov", 48.137, 11.575, 1], ["Frankfurt", 50.11, 8.68, 1],
  ["Kolín", 50.94, 6.96, 1], ["Praha", 50.075, 14.44, 1], ["Brno", 49.195, 16.61, 1], ["Bratislava", 48.145, 17.11, 1],
  ["Košice", 48.72, 21.26, 1], ["Drážďany", 51.05, 13.74, 0], ["Lipsko", 51.34, 12.37, 0],
  ["Hannover", 52.37, 9.73, 0], ["Stuttgart", 48.78, 9.18, 0], ["Norimberg", 49.45, 11.08, 0], ["Plzeň", 49.74, 13.37, 0],
  ["Ostrava", 49.82, 18.26, 0], ["Žilina", 49.22, 18.74, 0], ["Banská Bystrica", 48.735, 19.15, 0], ["Nitra", 48.31, 18.09, 0],
  ["Prešov", 49.0, 21.24, 0], ["Düsseldorf", 51.23, 6.78, 0], ["Brémy", 53.08, 8.8, 0], ["Olomouc", 49.59, 17.25, 0],
];
const COUNTRY_LABEL = [["NEMECKO", 51.25, 10.3], ["ČESKO", 49.72, 15.35], ["SLOVENSKO", 48.6, 20.3]];

function graticule() {
  let d = "";
  for (let lon = 4; lon <= 24; lon += 2) {
    const pts = []; for (let lat = 45; lat <= 56.01; lat += 0.5) pts.push(at(lat, lon));
    d += "M" + pts.map((p) => p.join(" ")).join("L");
  }
  for (let lat = 46; lat <= 56; lat += 1) {
    const pts = []; for (let lon = 3; lon <= 25.01; lon += 0.5) pts.push(at(lat, lon));
    d += "M" + pts.map((p) => p.join(" ")).join("L");
  }
  return d;
}

const fix = (x, y, body, cls = "") => `<g transform="translate(${x} ${y})"${cls ? ` class="${cls}"` : ""}><g class="rm-fix">${body}</g></g>`;

// A pin: the exact spot as a dot, a short needle and a round head; the ring
// shows around the chosen one.
const PIN = `<circle class="rm-hit" cy="-14" r="13"/><circle class="rm-ring" cy="-15" r="11"/><path class="rm-needle" d="M0 0V-8"/><circle class="rm-dot" r="2"/><circle class="rm-head" cy="-15" r="7"/>`;

// The CSS that depends on the generated view (built into style.css).
export const mapCss = () => `.rmap-view { aspect-ratio: ${PROJ.view[2]} / ${PROJ.view[3]}; }`;

// Without JavaScript a pin is a link to the job on the reference page.
export function refMap({ heading = 3 } = {}) {
  const V = PROJ.view.join(" ");
  const countries = Object.entries(COUNTRIES).map(([c, d]) => `<path class="rm-land" data-country="${c}" d="${d}"/>`).join("");
  const labels = COUNTRY_LABEL.map(([t, la, lo]) => { const [x, y] = at(la, lo); return fix(x, y, `<text class="rm-country">${t}</text>`); }).join("");
  const cities = CITIES.map(([n, la, lo, major]) => {
    const [x, y] = at(la, lo);
    return fix(x, y, `<circle class="rm-city-dot" r="2.2"/><text class="rm-city-t" x="6" y="4">${esc(n)}</text>`, major ? "rm-city" : "rm-city rm-minor");
  }).join("");
  const [hx, hy] = at(HQ.lat, HQ.lon);
  const hq = fix(hx, hy, `<rect class="rm-hq" x="-4.5" y="-4.5" width="9" height="9"/><text class="rm-hq-t" y="19">${esc(HQ.name)}, sídlo</text>`, "rm-hq-g");
  const pins = REFS.map((r, i) => {
    const [x, y] = at(r.lat, r.lon);
    return `<a class="rm-pin${i === 0 ? " is-on" : ""}" href="${PATHS.references}#ref-${r.id}" data-ref="${r.id}" data-tip="${esc(r.name)}" data-sub="${where(r)}, ${r.year}" aria-label="${esc(r.name)}, ${where(r)}">${fix(x, y, PIN)}</a>`;
  }).join("");
  const count = (c) => REFS.filter((r) => r.country === c).length;
  const templates = REFS.map((r) => `<template data-ref-card="${r.id}">${refCard(r, { level: heading })}</template>`).join("");

  return `<div class="rmap" data-view="${V}" data-km="${PROJ.kmPerUnit}">
<div class="rmap-map">
<div class="rmap-view">
<svg class="rmap-svg" viewBox="${V}" role="group" aria-label="Mapa stavieb. Kliknite na špendlík a zobrazí sa stavba.">
<path class="rm-grat" d="${graticule()}"/>
<path class="rm-ctx" d="${CONTEXT}"/>
${countries}
<clipPath id="rm-clip"><path d="${Object.values(COUNTRIES).join("")}"/></clipPath>
<path class="rm-lake" d="${LAKES}"/>
<path class="rm-river" clip-path="url(#rm-clip)" d="${RIVERS}"/>
${labels}
${cities}
${hq}
<g class="rm-clusters"></g>
${pins}
</svg>
<div class="rmap-ctl" hidden>
<button type="button" data-zoom="in" aria-label="Priblížiť"><span aria-hidden="true">+</span></button>
<button type="button" data-zoom="out" aria-label="Oddialiť"><span aria-hidden="true">&minus;</span></button>
</div>
<svg class="rmap-north" viewBox="0 0 20 30" aria-hidden="true"><path d="M10 2L16 22L10 18L4 22Z"/><text x="10" y="30">S</text></svg>
<div class="rmap-foot" aria-hidden="true">
<div class="rmap-scale" hidden><span class="rmap-scale-bar"></span><span class="rmap-scale-t"></span></div>
<div class="rmap-key"><span class="rmap-key-pin"></span>stavba<span class="rmap-key-hq"></span>sídlo firmy</div>
</div>
<div class="rmap-tip" hidden><b></b><span></span></div>
<p class="rmap-hint" hidden>Mapu priblížite kolieskom myši so stlačeným Ctrl, alebo tlačidlom +</p>
</div>
<div class="rmap-count" role="group" aria-label="Zobraziť na mape">
<button type="button" data-box="${V}" class="is-on" disabled><span class="rc-k">Všetky stavby</span><span class="rc-v">${REFS.length}</span></button>
${Object.keys(COUNTRY_NAME).map((c) => `<button type="button" data-box="${COUNTRY_BOX[c].join(" ")}" disabled><span class="rc-k">${COUNTRY_NAME[c]}</span><span class="rc-v">${count(c)}</span></button>`).join("")}
</div>
</div>
<div class="rmap-side">
<div class="rmap-card" aria-live="polite">${REFS.length ? refCard(REFS[0], { level: heading }) : ""}</div>
<div class="rmap-nav" hidden><button type="button" data-step="-1" aria-label="Predchádzajúca stavba"><span aria-hidden="true">&larr;</span><span class="rn-t" aria-hidden="true"> Predchádzajúca</span></button><span class="rmap-pos">1 / ${REFS.length}</span><button type="button" data-step="1" aria-label="Ďalšia stavba"><span class="rn-t" aria-hidden="true">Ďalšia </span><span aria-hidden="true">&rarr;</span></button></div>
</div>
${templates}
</div>`;
}
