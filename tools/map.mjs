// Generates src/drawings/map-data.mjs: the outlines of Slovakia, Czechia and
// Germany (and their neighbours, clipped to the view) for the reference map.
// Run once, or again to change the view; the site itself never fetches maps.
//
//   node tools/map.mjs
//
// Sources (all Natural Earth, public domain): 1:50m admin-0 countries in the
// TopoJSON packaging of world-atlas, and 1:10m rivers and lakes from the
// natural-earth-vector repository, both through jsDelivr.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROJ, project } from "../src/drawings/map-proj.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json";
const NE = "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/";

const MAIN = { SK: "Slovakia", CZ: "Czechia", DE: "Germany" };

const topo = await (await fetch(SRC)).json();

// TopoJSON: quantised, delta-encoded arcs shared between neighbours.
const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; });
});
const ring = (ids) => {
  const out = [];
  for (const i of ids) {
    const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
    out.push(...(out.length ? a.slice(1) : a));
  }
  return out;
};
const polygons = (g) => (g.type === "Polygon" ? [g.arcs] : g.type === "MultiPolygon" ? g.arcs : []).map((p) => p.map(ring));

// Clip a projected ring to the view (plus a margin) so neighbours stay small.
const M = 40, [VX, VY, VW, VH] = PROJ.view;
const box = [VX - M, VY - M, VX + VW + M, VY + VH + M];
function clip(pts) {
  const edges = [
    [(p) => p[0] >= box[0], (a, b) => lerpX(a, b, box[0])],
    [(p) => p[0] <= box[2], (a, b) => lerpX(a, b, box[2])],
    [(p) => p[1] >= box[1], (a, b) => lerpY(a, b, box[1])],
    [(p) => p[1] <= box[3], (a, b) => lerpY(a, b, box[3])],
  ];
  let out = pts;
  for (const [inside, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const cur = inp[i], prev = inp[(i + inp.length - 1) % inp.length];
      if (inside(cur)) { if (!inside(prev)) out.push(cut(prev, cur)); out.push(cur); }
      else if (inside(prev)) out.push(cut(prev, cur));
    }
    if (!out.length) break;
  }
  return out;
}
const lerpX = (a, b, x) => [x, a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0])];
const lerpY = (a, b, y) => [a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]), y];

// Drop points closer than `tol` drawing units to the last kept one.
function thin(pts, tol) {
  const out = [pts[0]];
  for (const p of pts.slice(1)) {
    const q = out[out.length - 1];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= tol) out.push(p);
  }
  return out;
}
const r1 = (n) => Math.round(n * 10) / 10;
function pathOf(geom, tol) {
  let d = "";
  for (const poly of polygons(geom)) for (const rg of poly) {
    let pts = clip(rg.map(([lon, lat]) => project(lat, lon)));
    if (pts.length < 3) continue;
    pts = thin(pts, tol);
    if (pts.length < 3) continue;
    d += "M" + pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L") + "Z";
  }
  return d;
}

const geoms = topo.objects.countries.geometries;
const main = {};
for (const [code, name] of Object.entries(MAIN)) {
  const g = geoms.find((x) => x.properties.name === name);
  if (!g) throw new Error("country not found: " + name);
  main[code] = pathOf(g, 0.8);
}
let context = "";
for (const g of geoms) {
  if (Object.values(MAIN).includes(g.properties.name)) continue;
  context += pathOf(g, 1.2);
}

// Rivers: polylines cut where they leave the view box.
function linesOf(geom, tol) {
  const lines = geom.type === "LineString" ? [geom.coordinates] : geom.type === "MultiLineString" ? geom.coordinates : [];
  let d = "";
  const inBox = (p) => p[0] >= box[0] && p[0] <= box[2] && p[1] >= box[1] && p[1] <= box[3];
  for (const line of lines) {
    let run = [];
    const flush = () => { if (run.length > 1) { const t = thin(run, tol); if (t.length > 1) d += "M" + t.map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L"); } run = []; };
    for (const [lon, lat] of line) { const p = project(lat, lon); inBox(p) ? run.push(p) : flush(); }
    flush();
  }
  return d;
}
const geo = async (name) => (await (await fetch(NE + name + ".geojson")).json()).features;
let rivers = "";
for (const ft of await geo("ne_10m_rivers_lake_centerlines")) if (ft.geometry && ft.properties.scalerank <= 9) rivers += linesOf(ft.geometry, 3);
let lakes = "";
for (const ft of await geo("ne_10m_lakes")) {
  if (!ft.geometry || ft.properties.scalerank > 6) continue;
  const g = ft.geometry, polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
  for (const poly of polys) for (const rg of poly) {
    let pts = clip(rg.map(([lon, lat]) => project(lat, lon)));
    if (pts.length < 3) continue;
    pts = thin(pts, 0.8);
    if (pts.length >= 3) lakes += "M" + pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L") + "Z";
  }
}

// Bounding box of each country, for "zoom to this country".
const boxOf = (d) => {
  const n = d.match(/-?\d+(\.\d+)?/g).map(Number), xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)].map(Math.round);
};
const boxes = Object.fromEntries(Object.entries(main).map(([c, d]) => [c, boxOf(d)]));

const out = `// Generated by tools/map.mjs from Natural Earth (public domain). Do not edit.
export const COUNTRIES = ${JSON.stringify(main, null, 0)};
export const CONTEXT = ${JSON.stringify(context)};
export const RIVERS = ${JSON.stringify(rivers)};
export const LAKES = ${JSON.stringify(lakes)};
export const COUNTRY_BOX = ${JSON.stringify(boxes)};
`;
fs.writeFileSync(path.join(ROOT, "src", "drawings", "map-data.mjs"), out);
console.log(`wrote src/drawings/map-data.mjs (${(out.length / 1024).toFixed(1)} kB)`);
