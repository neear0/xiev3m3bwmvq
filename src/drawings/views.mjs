// Views onto the building drawing: the whole section for the hero, and one
// close-up per service. A close-up is just another viewBox on the same art,
// the way a detail on a drawing set is an enlargement of the overall section.

import { VIEW, SKYLINE, ANCHORS, SKY_OVER_TEXT, GEOMETRY as G, buildingDefs, buildingArt, membraneGroup } from "./building.mjs";
import { esc } from "../lib/html.mjs";
import { r } from "./svg.mjs";

const C_ROOF = -900, F2 = -600, A_ROOF = -255;

// Close-up frames. vb = [x, y, width, height] in centimetres. Labels point
// from a spot on the drawing (a) to where the text sits (p); `end` right-aligns
// the text so it can sit to the left of its leader.
export const FRAMES = {
  roof: {
    vb: [1672, -1062, 390, 360],
    name: "Plochá strecha",
    caption: "Atika, prestup potrubia a kotvenie fólie",
    layers: [["mem", "Hydroizolačná fólia"], ["fleece", "Separačná vrstva"], ["ins", "Tepelná izolácia"], ["vapor", "Parozábrana"], ["cut", "Nosná konštrukcia"]],
    labels: [
      { t: "Atika s oplechovaním", a: [1716, -981], p: [1760, -1019] },
      { t: "Prestup potrubia", a: [1957, -966], p: [1978, -1025] },
      { t: "Hydroizolačná fólia", a: [2036, G.memC(2036)], p: [2055, -990], end: true },
      { t: "Tepelná izolácia", a: [1840, (G.insTopC(1840) + C_ROOF) / 2], p: [1760, -838] },
      { t: "Parozábrana", a: [1985, C_ROOF - 0.4], p: [1990, -838] },
      { t: "Kotva", a: [1880, G.insTopC(1880) + 9], p: [1880, -795] },
    ],
  },
  insulation: {
    vb: [2000, -1030, 370, 340],
    name: "Zateplenie strechy",
    caption: "Tepelná izolácia v spáde k strešnej vpusti",
    layers: [["mem", "Hydroizolačná fólia"], ["ins", "Tepelná izolácia v spáde"], ["vapor", "Parozábrana"], ["cut", "Nosná konštrukcia"]],
    labels: [
      { t: "Hydroizolačná fólia", a: [2050, G.memC(2050)], p: [2008, -975] },
      { t: "Strešná vpusť", a: [2152, G.memC(2150) - 8], p: [2170, -975] },
      { t: "Parozábrana", a: [2062, C_ROOF - 0.4], p: [2008, -835] },
      { t: "Izolácia v spáde k vpusti", a: [2330, (G.insTopC(2330) + C_ROOF) / 2], p: [2366, -835], end: true },
    ],
  },
  green: {
    vb: [1385, -800, 350, 330],
    name: "Zelená strecha",
    caption: "Zelená strecha pri stene vyššej budovy",
    layers: [["veg", "Vegetácia"], ["sub", "Substrát"], ["fleece", "Filtračná textília"], ["nop", "Drenážna vrstva"], ["mem", "Fólia odolná proti koreňom"], ["ins", "Tepelná izolácia"], ["vapor", "Parozábrana"], ["cut", "Nosná konštrukcia"]],
    labels: [
      { t: "Vegetácia", a: [1452, G.subTopB(1452) - 4], p: [1398, -735] },
      { t: "Fólia odolná proti koreňom", a: [1699, -652], p: [1728, -745], end: true },
      { t: "Kačírkový pás", a: [1668, G.subTopB(1668) + 3], p: [1662, -705], end: true },
      { t: "Substrát", a: [1480, G.subTopB(1480) + 5], p: [1398, -546] },
      { t: "Drenážna vrstva", a: [1560, G.memB(1560) - 3.6], p: [1500, -546] },
    ],
  },
  terrace: {
    vb: [535, -460, 350, 330],
    name: "Terasa",
    caption: "Terasa na terčoch a napojenie pod prah dverí",
    layers: [["paver", "Dlažba na terčoch"], ["fleece", "Ochranná textília"], ["mem", "Hydroizolačná fólia"], ["ins", "Tepelná izolácia"], ["vapor", "Parozábrana"], ["cut", "Nosná konštrukcia"]],
    labels: [
      { t: "Napojenie pod prah dverí", a: [799, -296], p: [785, -414], end: true },
      { t: "Dlažba na terčoch", a: [612, G.PAVER_TOP + 1], p: [546, -338] },
      { t: "Tepelná izolácia", a: [590, (G.insTopA(590) + A_ROOF) / 2], p: [546, -208] },
      { t: "Hydroizolačná fólia", a: [700, G.memA(700)], p: [680, -208] },
    ],
  },
  base: {
    vb: [2330, 20, 540, 470],
    name: "Suterén a základy",
    caption: "Suterén pod hladinou podzemnej vody",
    layers: [["soil", "Zemina"], ["water", "Podzemná voda"], ["xps", "Tepelná izolácia XPS"], ["mem", "Hydroizolačná fólia"], ["cut", "Základová doska a steny"], ["grv", "Štrkové lôžko"]],
    labels: [
      { t: "Podzemná voda", a: [2798, G.GW], p: [2862, 168], end: true },
      { t: "Fólia okolo celého suterénu", a: [2601, 150], p: [2640, 96] },
      { t: "Základová doska", a: [2450, 317], p: [2440, 268], end: true },
      { t: "Radón z podložia", a: [2560, 388], p: [2538, 396], end: true },
    ],
  },
};

// A frame trimmed to the band its labels point at, for a drawing without
// labels shown small (the home page list on a phone): the full frame there is
// mostly empty room, the trimmed one is the build-up itself.
export function tightFrame(key, { pad = 48, ratio = 0.56 } = {}) {
  const [x, y, w, h] = FRAMES[key].vb;
  const ys = FRAMES[key].labels.map((l) => l.a[1]);
  const top = Math.min(...ys) - pad, bottom = Math.max(...ys) + pad;
  const th = Math.min(h, Math.max(w * ratio, bottom - top));
  const ty = Math.min(y + h - th, Math.max(y, (top + bottom) / 2 - th / 2));
  return [x, Math.round(ty), w, Math.round(th)];
}

// Fallback text size in drawing units: about 13 px when a frame fills a 640 px
// wide panel. With JavaScript the size is set in CSS from the real scale (--k).
const fontFor = (vb) => r(vb[2] * 0.021);

function labelGroup(key, frame, { fs = fontFor(frame.vb), cls = "" } = {}) {
  const halo = r(fs * 0.4);
  const dot = r(fs * 0.22);
  const nums = frame.labels.map((l, i) => `<g class="lbl-n"><circle class="lbl-n-c" cx="${r(l.a[0])}" cy="${r(l.a[1])}" r="${r(fs * 0.75)}"/><text class="lbl-n-t" x="${r(l.a[0])}" y="${r(l.a[1])}" font-size="${r(fs * 0.9)}">${i + 1}</text></g>`).join("");
  const items = frame.labels.map((l) => {
    const [ax, ay] = l.a, [px, py] = l.p;
    // Leader from the spot to just under the text, so the line never crosses it.
    const ly = py + (ay > py ? fs * 0.35 : -fs * 1.05);
    return `<path class="lbl-lead" d="M${r(ax)} ${r(ay)}L${r(px)} ${r(ly)}"/>`
      + `<circle class="lbl-dot" cx="${r(ax)}" cy="${r(ay)}" r="${dot}"/>`
      + `<text class="lbl-t" x="${r(px)}" y="${r(py)}" font-size="${fs}" stroke-width="${halo}"${l.end ? ' text-anchor="end"' : ""}>${esc(l.t)}</text>`;
  }).join("");
  return `<g class="lbls${cls}" data-zone="${key}">${items}${nums}</g>`;
}

// A small sample of each material, drawn with the same fills and hatches as
// the drawing itself, for the key under a close-up.
const SWATCH = {
  mem: '<rect class="sw-mem" x="0" y="5" width="28" height="6"/>',
  fleece: '<rect class="s-fleece" x=".5" y="5.5" width="27" height="5"/>',
  ins: '<rect class="s-ins" x=".5" y=".5" width="27" height="15"/>',
  xps: '<rect class="s-xps" x=".5" y=".5" width="27" height="15"/>',
  vapor: '<path class="s-vapor" d="M0 8H28"/>',
  cut: '<rect class="s-cut" x=".5" y=".5" width="27" height="15"/>',
  nop: '<path class="s-nop" d="M0 11L3.5 5L7 11L10.5 5L14 11L17.5 5L21 11L24.5 5L28 11"/>',
  sub: '<rect class="s-sub" x="0" y="0" width="28" height="16"/>',
  veg: '<rect class="s-sub" x="0" y="10" width="28" height="6"/><path class="s-leaf" d="M1 9a3.5 2.5 0 1 0 7 0a3.5 2.5 0 1 0-7 0M9 7.5a4 3 0 1 0 8 0a4 3 0 1 0-8 0M18 9a4.5 2.5 0 1 0 9 0a4.5 2.5 0 1 0-9 0"/>',
  grv: '<rect class="s-grv" x=".5" y=".5" width="27" height="15"/>',
  paver: '<rect class="s-paver" x=".5" y="2.5" width="12.5" height="6"/><rect class="s-paver" x="15" y="2.5" width="12.5" height="6"/><path class="s-pedestal" d="M9 15.5H19L17 8.5H11Z"/>',
  soil: '<rect class="s-soil" x="0" y="0" width="28" height="16"/>',
  water: '<rect class="s-soil" x="0" y="0" width="28" height="16"/><rect class="s-water" x="0" y="4" width="28" height="12"/><path class="s-gw" d="M0 4H28"/>',
};

export const layerKey = (key) => `<ul class="layers">${FRAMES[key].layers
  .map(([sw, t]) => `<li><svg class="sw" viewBox="0 0 28 16" aria-hidden="true">${SWATCH[sw]}</svg><span>${esc(t)}</span></li>`)
  .join("")}</ul>`;

// The key to the numbered markers, shown under a drawing on narrow screens.
export const legend = (frame) => `<ol class="dwg-legend" aria-hidden="true">${frame.labels.map((l) => `<li>${esc(l.t)}</li>`).join("")}</ol>`;

// The shared art: patterns, the building and its membranes, defined once per
// page inside the first drawing and reused everywhere else with <use>.
export function artDefs() {
  return buildingDefs("b") + `<defs>${buildingArt("bldg-art")}${membraneGroup("bldg-mem")}</defs>`;
}

// ------------------------------------------------------------------ hero

export const HERO_CALLOUTS = [
  { key: "roof", t: "Plochá strecha", href: "/hydroizolacia-plochej-strechy/", a: ANCHORS.roof, p: [ANCHORS.roof[0], -1060] },
  { key: "insulation", t: "Zateplenie strechy", href: "/zateplenie-plochej-strechy/", a: ANCHORS.insulation, p: [ANCHORS.insulation[0], -1060] },
  { key: "green", t: "Zelená strecha", href: "/zelene-strechy/", a: ANCHORS.green, p: [1480, -790] },
  { key: "balcony", t: "Balkón", href: "/hydroizolacia-terasy-a-balkona/", a: ANCHORS.balcony, p: [ANCHORS.balcony[0], -790] },
  { key: "terrace", t: "Terasa", href: "/hydroizolacia-terasy-a-balkona/", a: ANCHORS.terrace, p: [560, -460] },
  { key: "base", t: "Suterén a základy", href: "/hydroizolacia-spodnej-stavby/", a: ANCHORS.base, p: [470, 120], align: "center" },
];
export const HERO_NOTES = [
  { t: "podzemná voda", a: ANCHORS.groundwater, p: [2776, 150], align: "left" },
  { t: "radón", a: ANCHORS.radon, p: [1600, 452], align: "center" },
];

const pct = (v, o, s) => r(((v - o) / s) * 1000) / 10;

export function heroDrawing() {
  const V = VIEW;
  const leaders = HERO_CALLOUTS.concat(HERO_NOTES).map(({ a, p }) =>
    `<path class="co-lead" d="M${r(a[0])} ${r(a[1])}L${r(p[0])} ${r(p[1])}"/><circle class="co-dot" cx="${r(a[0])}" cy="${r(a[1])}" r="7"/>`).join("");
  // Callout text is HTML, not SVG text, so it keeps its size at every width
  // and can be a real link. Each label is positioned by a class in the CSS.
  const al = (x) => (x.align ? ` co-${x.align}` : "");
  const callouts = HERO_CALLOUTS.map((c) => `<li class="co co-${c.key}${al(c)}"><a href="${c.href}">${esc(c.t)}</a></li>`).join("")
    + HERO_NOTES.map((n, i) => `<li class="co co-note co-n${i}${al(n)}" aria-hidden="true">${esc(n.t)}</li>`).join("");
  const svg = `<svg class="dwg dwg-hero" viewBox="${V.x} ${V.y} ${V.w} ${V.h}" role="img" aria-labelledby="hero-dwg-t" data-skyline="${esc(JSON.stringify(SKYLINE))}">
<title id="hero-dwg-t">Rez budovou: plochá strecha, zelená strecha, terasa, balkón a suterén pod hladinou podzemnej vody. Červená čiara je hydroizolácia, ktorá budovu chráni od strechy po základy.</title>
${artDefs()}
<clipPath id="hero-reveal"><rect class="reveal" x="${V.x}" y="${V.y}" width="${V.w}" height="${V.h}"/></clipPath>
<linearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="fade-0"/><stop offset="1" class="fade-1"/></linearGradient>
<use href="#bldg-art"/>
<g clip-path="url(#hero-reveal)"><use href="#bldg-mem"/></g>
<g class="co-leads">${leaders}</g>
<rect x="${V.x}" y="${V.y + V.h - 70}" width="${V.w}" height="71" fill="url(#hero-fade)"/>
</svg>`;
  return { svg, callouts: `<ul class="callouts" aria-label="Časti stavby">${callouts}</ul>` };
}

// Positions for the HTML callouts, as percentages of the drawing box.
export function heroCalloutCss() {
  const V = VIEW;
  return HERO_CALLOUTS.map((c) => `.co-${c.key}{left:${pct(c.p[0], V.x, V.w)}%;top:${pct(c.p[1], V.y, V.h)}%}`)
    .concat(HERO_NOTES.map((n, i) => `.co-n${i}{left:${pct(n.p[0], V.x, V.w)}%;top:${pct(n.p[1], V.y, V.h)}%}`))
    .join("\n") + `\n:root{--sky-frac:${r((SKY_OVER_TEXT / V.w) * 10000) / 10000}}`;
}

// ------------------------------------------------------------------ close-ups

// The moving camera on the home page: one svg, the viewBox animated between frames.
export function cameraDrawing(order) {
  const first = FRAMES[order[0]].vb;
  const frames = Object.fromEntries(order.map((k) => [k, FRAMES[k].vb]));
  const labels = order.map((k) => labelGroup(k, FRAMES[k])).join("");
  const zones = order.map((k, i) => `<div class="cam-zone${i ? "" : " on"}" data-zone="${k}">
<div class="cam-title"><p class="cam-name">${esc(FRAMES[k].name)}</p><p class="cam-cap">${esc(FRAMES[k].caption)}</p></div>
${layerKey(k)}
</div>`).join("");
  return `<figure class="cam" aria-hidden="true">
<div class="cam-view">
<svg class="dwg dwg-close cam-svg" viewBox="${first.join(" ")}" preserveAspectRatio="xMidYMid meet" data-frames="${esc(JSON.stringify(frames))}" data-zone="${order[0]}">
<use href="#bldg-art"/><use href="#bldg-mem"/>${labels}
</svg>
</div>
<figcaption class="cam-sheet">${zones}</figcaption>
</figure>`;
}

// A static close-up with labels, for a service page head or a narrow screen.
export function closeUp(key, { labels = true, withDefs = false, cls = "", title, key: withKey = labels, vb } = {}) {
  const f = FRAMES[key];
  const t = title ?? f.caption;
  return `<svg class="dwg dwg-close${cls ? " " + cls : ""}" viewBox="${(vb ?? f.vb).join(" ")}" role="img" aria-label="${esc(t)}">
${withDefs ? artDefs() : ""}<use href="#bldg-art"/><use href="#bldg-mem"/>${labels ? labelGroup(key, f) : ""}
</svg>${labels && withKey ? legend(f) : ""}`;
}

// ------------------------------------------------------------------ seam

// Cross-section through the overlap of two membrane strips, in millimetres:
// the lower strip is fastened along its edge, the upper strip covers the
// fastener and is welded to the lower one with hot air.
export function seamDetail() {
  const vb = [0, 18, 400, 150];
  const upper = [[140, 57], [209, 57], [212, 54], [228, 54], [231, 57], [259, 57], [263, 62], [400, 62], [400, 67], [264, 67], [260, 62], [230, 62], [228, 59], [212, 59], [210, 62], [140, 62]];
  const frame = {
    vb,
    labels: [
      { t: "Horný pás fólie", a: [335, 63], p: [398, 40], end: true },
      { t: "Zvar horúcim vzduchom", a: [165, 61.5], p: [100, 34] },
      { t: "Kotva v presahu", a: [220, 54], p: [238, 26] },
      { t: "Spodný pás fólie", a: [60, 64.5], p: [8, 48] },
      { t: "Tepelná izolácia", a: [110, 104], p: [8, 124] },
      { t: "Nosná konštrukcia", a: [330, 150], p: [398, 124], end: true },
    ],
  };
  const pts = (p) => p.map(([x, y]) => `${x} ${y}`).join(" ");
  return `<svg class="dwg dwg-close dwg-seam" viewBox="${vb.join(" ")}" role="img" aria-label="Rez spojom dvoch pásov fólie: spodný pás je v presahu prikotvený, horný pás kotvu prekrýva a je k spodnému privarený horúcim vzduchom.">
${buildingDefs("s")}
<g class="bldg">
<rect class="seam-deck" x="0" y="140" width="400" height="28"/>
<rect class="seam-ins" x="0" y="67" width="400" height="73"/>
<rect class="s-sleeve" x="218" y="67" width="4" height="42"/>
<path class="s-anchor" d="M220 109L220 152"/>
<polygon class="seam-lower" points="${pts([[0, 62], [260, 62], [260, 67], [0, 67]])}"/>
<rect class="s-cap" x="212" y="59" width="16" height="3"/>
<polygon class="seam-upper" points="${pts(upper)}"/>
<rect class="seam-weld" x="145" y="60.6" width="40" height="2.8"/>
</g>
${labelGroup("seam", frame)}
</svg>${legend(frame)}`;
}
