// The building section the whole site is drawn from.
//
// Units are centimetres, y grows downward, and y = 0 is the ground-floor level
// (±0,000). Every layer is drawn at its real thickness, so the same drawing
// reads as an overall section when shown whole and as a construction detail
// when the camera zooms in on one part of it.
//
// Three blocks share walls: A (one storey, walkable terrace on its roof),
// B (two storeys, green roof) and C (three storeys, exposed membrane roof, a
// balcony on its right facade). B and C stand on a basement that sits partly
// below the groundwater table; A has a floor on the ground.

import { r, d, path, poly, line, rect, rectWithHoles, rng, circleD, ellipseD } from "./svg.mjs";

const TERRAIN = 25;
const GW = 200; // groundwater level
const BOTTOM = 470;
const LEFT = -300, RIGHT = 2900;
const EXT = 500; // how far ground and water continue beyond the overall view

// Walls, as [outer-left x, outer-right x].
const WA = [0, 30], WAB = [800, 830], WBC = [1700, 1730], WC = [2570, 2600];
const PAR_INS = 8; // insulation on the inner face of every parapet

// Structural slab tops.
const SLAB = 25;
const A_ROOF = -255;           // lowered, so the terrace ends up below B's floor
const F1 = -300, F2 = -600, C_ROOF = -900;
const BASE_TOP = 300, BASE_BOT = 335;

// Tapered insulation: thinnest at the drain, thicker towards the walls.
const taper = (xDrain, tMin, tMax, reach) => (x) => tMin + ((tMax - tMin) * Math.min(Math.abs(x - xDrain), reach)) / reach;
const tA = taper(415, 14, 20, 385);
const tB = taper(1265, 16, 23, 430);
const tC = taper(2150, 20, 28, 412);
const SEP = 1.5; // separation / protection fleece, drawn slightly thicker than life

const memA = (x) => A_ROOF - tA(x) - SEP;
const memB = (x) => F2 - tB(x) - SEP;
const memC = (x) => C_ROOF - tC(x) - SEP;
const insTopA = (x) => A_ROOF - tA(x);
const insTopB = (x) => F2 - tB(x);
const insTopC = (x) => C_ROOF - tC(x);

// Green roof build-up above the membrane.
const G_PROT = 1.5, G_DRAIN = 4, G_FILTER = 1, G_SUB = 10;
const subTopB = (x) => memB(x) - G_PROT - G_DRAIN - G_FILTER - G_SUB;

// Terrace: pavers on adjustable pedestals, level while the membrane slopes.
const fleeceTopA = (x) => memA(x) - SEP;
const PAVER_BOT = Math.min(fleeceTopA(WA[1] + PAR_INS), fleeceTopA(WAB[0])) - 3;
const PAVER_TOP = PAVER_BOT - 4;

// Parapet tops (the membrane runs over them, the coping sits above).
const A_PAR = PAVER_TOP - 20;
const B_PAR = -670;
const C_PAR = -979;

// Balcony slab on C's right facade, falling 3 cm towards its edge.
const BAL_EDGE = 2750;
const balTop = (x) => -588 + (3 * (x - WC[1])) / (BAL_EDGE - WC[1]);

// Openings: [x0, x1] of the wall, [yTop, yBottom].
const opening = (wall, yTop, yBot) => [wall[0], yTop, wall[1], yBot];
const OPENINGS = {
  a: [opening(WA, -230, -90)],
  ab: [opening(WAB, -520, F1)],                    // terrace door, B first floor
  bc: [opening(WBC, -830, -690)],                  // C second floor, above the green roof
  c: [opening(WC, -230, -90), opening(WC, -530, -390), opening(WC, -820, F2)], // two windows, balcony door
};

export const VIEW = { x: LEFT, y: -1090, w: RIGHT - LEFT, h: BOTTOM + 1090 };

// ------------------------------------------------------------------ patterns

export function buildingDefs(prefix = "b") {
  const id = (n) => `${prefix}-${n}`;
  return `<defs>
<pattern id="${id("cut")}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="pt-cut" width="7" height="7"/><path class="pt-ln" d="M0 3.5H7"/></pattern>
<pattern id="${id("ins")}" width="10" height="7" patternUnits="userSpaceOnUse"><rect class="pt-ins" width="10" height="7"/><path class="pt-ln-soft" d="M0 7L2.5 0L5 7L7.5 0L10 7"/></pattern>
<pattern id="${id("xps")}" width="10" height="7" patternUnits="userSpaceOnUse"><rect class="pt-xps" width="10" height="7"/><path class="pt-ln-soft" d="M0 7L2.5 0L5 7L7.5 0L10 7"/></pattern>
<pattern id="${id("soil")}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect class="pt-soil" width="14" height="14"/><path class="pt-soil-ln" d="M0 3.5H14"/><circle class="pt-soil-dot" cx="4" cy="10" r=".9"/><circle class="pt-soil-dot" cx="11" cy="9" r=".7"/></pattern>
<pattern id="${id("sub")}" width="9" height="9" patternUnits="userSpaceOnUse"><rect class="pt-sub" width="9" height="9"/><circle class="pt-sub-dot" cx="2" cy="2" r=".8"/><circle class="pt-sub-dot" cx="6.5" cy="4" r=".6"/><circle class="pt-sub-dot" cx="3.5" cy="7" r=".7"/></pattern>
<pattern id="${id("grv")}" width="8" height="6" patternUnits="userSpaceOnUse"><rect class="pt-grv" width="8" height="6"/><circle class="pt-grv-c" cx="2" cy="2" r="1.5"/><circle class="pt-grv-c" cx="6" cy="4.2" r="1.4"/></pattern>
</defs>`;
}

// ------------------------------------------------------------------ the art

function rooms() {
  const out = [];
  const room = (x0, y0, x1, y1) => out.push(rect("s-room", x0, y0, x1, y1));
  room(WA[1], A_ROOF + SLAB, WAB[0], 0);                       // A ground floor
  room(WAB[1], F1 + SLAB, WBC[0], 0);                          // B ground floor
  room(WAB[1], F2 + SLAB, WBC[0], F1);                         // B first floor
  room(WBC[1], F1 + SLAB, WC[0], 0);                           // C ground floor
  room(WBC[1], F2 + SLAB, WC[0], F1);                          // C first floor
  room(WBC[1], C_ROOF + SLAB, WC[0], F2);                      // C second floor
  room(WAB[1], SLAB, WBC[0], BASE_TOP);                        // basement, B
  room(WBC[1], SLAB, WC[0], BASE_TOP);                         // basement, C
  return out.join("");
}

function structure() {
  const out = [];
  // Below ground first: A's footing and floor build-up, the basement's base.
  out.push(rect("s-cut", -20, 26, 50, 106));                   // strip footing under A's outer wall
  out.push(rect("s-cut s-thin", WA[1], 16, WAB[0], 26));       // sub-base concrete under A's floor
  out.push(rect("s-grv", 760, 347.5, 2640, 362.5));            // gravel bed
  out.push(rect("s-cut s-thin", 770, 337.5, 2630, 347.5));     // sub-base concrete
  out.push(rect("s-cut", 780, BASE_TOP, 2620, BASE_BOT));      // base slab (the tank floor)

  // Walls, with their openings.
  out.push(rectWithHoles("s-cut", [WA[0], A_PAR, WA[1], 26], OPENINGS.a));
  out.push(rectWithHoles("s-cut", [WAB[0], B_PAR, WAB[1], BASE_TOP], OPENINGS.ab));
  out.push(rectWithHoles("s-cut", [WBC[0], C_PAR, WBC[1], BASE_TOP], OPENINGS.bc));
  out.push(rectWithHoles("s-cut", [WC[0], C_PAR, WC[1], BASE_TOP], OPENINGS.c));

  // Slabs.
  out.push(rect("s-cut", WA[1], A_ROOF, WAB[0], A_ROOF + SLAB));
  out.push(rect("s-cut", WA[1], 0, WAB[0], 15));               // A floor on the ground
  out.push(rect("s-cut", WAB[1], 0, WC[0], SLAB));             // ground floor over the basement
  out.push(rect("s-cut", WAB[1], F1, WBC[0], F1 + SLAB));
  out.push(rect("s-cut", WAB[1], F2, WBC[0], F2 + SLAB));      // B roof slab
  out.push(rect("s-cut", WBC[1], F1, WC[0], F1 + SLAB));
  out.push(rect("s-cut", WBC[1], F2, WC[0], F2 + SLAB));
  out.push(rect("s-cut", WBC[1], C_ROOF, WC[0], C_ROOF + SLAB)); // C roof slab
  out.push(poly("s-cut", [[WC[1], balTop(WC[1])], [BAL_EDGE, balTop(BAL_EDGE)], [BAL_EDGE, balTop(BAL_EDGE) + 18], [WC[1], balTop(WC[1]) + 18]]));
  return out.join("");
}

// Window and door frames drawn inside the openings.
function frames() {
  const out = [];
  const glazed = ([x0, yT, x1, yB], door = false) => {
    const xm = (x0 + x1) / 2;
    out.push(rect("s-frame", xm - 3.5, yT, xm + 3.5, yB));
    out.push(line("s-glass", [[xm - 1, yT + 5], [xm - 1, yB - (door ? 8 : 5)]]));
    out.push(line("s-glass", [[xm + 1, yT + 5], [xm + 1, yB - (door ? 8 : 5)]]));
    if (!door) {
      out.push(line("s-metal", [[x0 - 5, yB + 2], [x0, yB]]));          // outer sill, falls outwards
      out.push(line("s-frame", [[x1, yB], [x1 + 5, yB]]));               // inner sill
    }
  };
  const flip = (o) => o; // openings are symmetric in the wall, nothing to flip
  OPENINGS.a.forEach((o) => glazed(flip(o)));
  OPENINGS.ab.forEach((o) => glazed(o, true));
  OPENINGS.bc.forEach((o) => glazed(o));
  glazed(OPENINGS.c[0]); glazed(OPENINGS.c[1]); glazed(OPENINGS.c[2], true);
  return out.join("");
}

// A layer between two profiles that are functions of x.
function band(cls, x0, x1, top, bottom, step = 20) {
  const xs = [];
  for (let x = x0; x < x1; x += step) xs.push(x);
  xs.push(x1);
  const pts = xs.map((x) => [x, top(x)]).concat(xs.slice().reverse().map((x) => [x, bottom(x)]));
  return poly(cls, pts);
}

// Keeps the kink of a taper exactly on the drain, where the slope changes.
function bandKinked(cls, x0, x1, xk, top, bottom) {
  const xs = [x0, xk, x1].filter((x, i, a) => a.indexOf(x) === i).sort((a, b) => a - b);
  const pts = xs.map((x) => [x, top(x)]).concat(xs.slice().reverse().map((x) => [x, bottom(x)]));
  return poly(cls, pts);
}

function parapetInsulation(xFace, side, yTop, yBottom) {
  // side = +1 when the roof is to the right of the wall face, -1 to the left
  const x0 = side > 0 ? xFace : xFace - PAR_INS, x1 = side > 0 ? xFace + PAR_INS : xFace;
  return rect("s-ins", x0, yTop, x1, yBottom);
}

// A telescopic fastener: plastic sleeve through the insulation, its head
// under the membrane, a screw into the slab below.
function fastener(x, top, slabTop) {
  return rect("s-sleeve", x - 1, top + 1, x + 1, top + 15)
    + rect("s-cap", x - 3.5, top, x + 3.5, top + 1.2)
    + line("s-anchor", [[x, top + 15], [x, slabTop + 5]]);
}

// A pipe that carries on below what is drawn: cut off with a break mark.
function pipeDown(x, yTop, slabBottom) {
  const y = slabBottom + 18;
  return rect("s-pipe", x - 5.5, yTop, x + 5.5, y)
    + line("s-break", [[x - 9, y + 2], [x - 3, y - 2], [x + 3, y + 2], [x + 9, y - 2]]);
}

// Roof drain: flange under the membrane, a bowl in the insulation, the outlet
// through the slab, and a guard over the opening so leaves cannot block it.
function roofDrain(x, mem, slabBottom, guard) {
  let s = pipeDown(x, mem + 7, slabBottom);
  s += poly("s-bowl", [[x - 15, mem + 0.9], [x + 15, mem + 0.9], [x + 5.5, mem + 8], [x - 5.5, mem + 8]]);
  s += line("s-metal", [[x - 20, mem + 0.9], [x + 20, mem + 0.9]]);
  if (guard) s += path("s-guard", d([[x - 8, mem - 0.5], [x - 7, mem - 8], [x + 7, mem - 8], [x + 8, mem - 0.5]]) + d([[x - 3.5, mem - 8], [x - 3.5, mem - 0.5]]) + d([[x + 3.5, mem - 8], [x + 3.5, mem - 0.5]]));
  return s;
}

function roofC() {
  const x0 = WBC[1] + PAR_INS, x1 = WC[0] - PAR_INS;
  const out = [];
  out.push(bandKinked("s-ins", x0, x1, 2150, insTopC, () => C_ROOF));
  out.push(bandKinked("s-fleece", x0, x1, 2150, memC, insTopC));
  out.push(parapetInsulation(WBC[1], 1, C_PAR, C_ROOF));
  out.push(parapetInsulation(WC[0], -1, C_PAR, C_ROOF));
  out.push(line("s-vapor", [[WBC[1] + 0.4, insTopC(x0)], [WBC[1] + 0.4, C_ROOF - 0.4], [WC[0] - 0.4, C_ROOF - 0.4], [WC[0] - 0.4, insTopC(x1)]]));
  // Mechanical fasteners in the membrane overlaps: a washer on top, the shaft into the slab.
  for (const x of [1795, 1880, 2030, 2090, 2225, 2310, 2395, 2480]) out.push(fastener(x, insTopC(x), C_ROOF));
  // Roof drain and vent pipe.
  out.push(roofDrain(2150, memC(2150), C_ROOF + SLAB, true));
  out.push(pipeDown(1950, -996, C_ROOF + SLAB));
  out.push(rect("s-pipe", 1937, -1004, 1963, -996));
  out.push(line("s-metal", [[1941.5, -946], [1958.5, -946]]));
  return out.join("");
}

function roofB() {
  const x0 = WAB[1] + PAR_INS, x1 = WBC[0];
  const out = [];
  const prot = (x) => memB(x) - G_PROT;
  const drainTop = (x) => prot(x) - G_DRAIN;
  const filterTop = (x) => drainTop(x) - G_FILTER;
  out.push(bandKinked("s-ins", x0, x1, 1265, insTopB, () => F2));
  out.push(bandKinked("s-fleece", x0, x1, 1265, memB, insTopB));
  out.push(parapetInsulation(WAB[1], 1, B_PAR, F2));
  out.push(line("s-vapor", [[WAB[1] + 0.4, insTopB(x0)], [WAB[1] + 0.4, F2 - 0.4], [x1 - 0.4, F2 - 0.4], [x1 - 0.4, insTopB(x1)]]));
  out.push(bandKinked("s-fleece", x0, x1, 1265, prot, memB));
  // Drainage board: a row of cups that stores water and lets the rest run off.
  {
    const pts = [];
    for (let x = x0; x <= x1; x += 3) pts.push([x, (Math.round((x - x0) / 3) % 2 ? drainTop(x) : prot(x))]);
    out.push(line("s-nop", pts));
  }
  out.push(bandKinked("s-filter", x0, x1, 1265, filterTop, drainTop));
  // Substrate, except in the gravel strips along the parapet, the wall and the drain.
  const gravelStrips = [[x0, x0 + 50], [1240, 1290], [x1 - 50, x1]];
  const soilSpans = [[x0 + 50, 1240], [1290, x1 - 50]];
  for (const [a, b] of soilSpans) out.push(bandKinked("s-sub", a, b, 1265, subTopB, filterTop));
  const rand = rng(7);
  let pebbles = "";
  for (const [a, b] of gravelStrips) {
    for (let x = a + 2; x < b - 1.5; x += 3.6) {
      for (let k = 0; k < 3; k++) {
        const rad = 1.4 + rand() * 0.7;
        const cx = Math.min(b - rad, x + (rand() - 0.5) * 1.2);
        const cy = filterTop(cx) - rad - k * 3.2 - rand() * 0.5;
        pebbles += circleD(cx, cy, rad);
      }
    }
  }
  out.push(path("s-pebble", pebbles));
  // Drain with its inspection shaft through the gravel.
  out.push(roofDrain(1265, memB(1265), F2 + SLAB, false));
  out.push(rect("s-shaft", 1247, subTopB(1265) - 2, 1283, memB(1265) - G_PROT));
  out.push(line("s-metal", [[1245, subTopB(1265) - 2.5], [1285, subTopB(1265) - 2.5]]));
  // Sedum and a few grasses.
  let leaves = "", stems = "";
  for (const [a, b] of soilSpans) {
    for (let x = a + 4; x < b - 3; x += 6 + rand() * 7) {
      const base = subTopB(x);
      const n = 2 + Math.floor(rand() * 3);
      for (let k = 0; k < n; k++) {
        const rx = 2.2 + rand() * 2.2, ry = 1.6 + rand() * 1.4;
        leaves += ellipseD(x + (rand() - 0.5) * 6, base - ry * 0.6 - rand() * 3.2, rx, ry);
      }
      if (rand() < 0.18) {
        const h = 9 + rand() * 8;
        stems += d([[x + 1, base], [x + 1 + (rand() - 0.5) * 3, base - h]]);
        leaves += circleD(x + 1 + (rand() - 0.5) * 3, base - h - 1.2, 1.3);
      }
    }
  }
  out.push(path("s-stem", stems));
  out.push(path("s-leaf", leaves));
  // Termination of the upstand on C's wall: a fixing bar and a cover flashing.
  out.push(line("s-metal", [[x1 - 0.2, -663], [x1 - 3.5, -663]]));
  out.push(line("s-metal", [[x1, -670], [x1 - 6, -664.5], [x1 - 6, -660]]));
  return out.join("");
}

function roofA() {
  const x0 = WA[1] + PAR_INS, x1 = WAB[0];
  const out = [];
  out.push(bandKinked("s-ins", x0, x1, 415, insTopA, () => A_ROOF));
  out.push(bandKinked("s-fleece", x0, x1, 415, memA, insTopA));
  out.push(bandKinked("s-fleece", x0, x1, 415, fleeceTopA, memA));
  out.push(parapetInsulation(WA[1], 1, A_PAR, A_ROOF));
  out.push(line("s-vapor", [[WA[1] + 0.4, insTopA(x0)], [WA[1] + 0.4, A_ROOF - 0.4], [x1 - 0.4, A_ROOF - 0.4], [x1 - 0.4, insTopA(x1)]]));
  // Pavers on pedestals; a pedestal under every joint, taller where the membrane is lower.
  const joint = 0.6, size = 60;
  const joints = [x0 + 0.3];
  while (joints[joints.length - 1] + size + joint < x1 - 0.3) joints.push(joints[joints.length - 1] + size + joint);
  for (let i = 0; i < joints.length; i++) {
    const a = joints[i] + (i === 0 ? 0 : joint / 2);
    const b = i + 1 < joints.length ? joints[i + 1] - joint / 2 : x1 - 0.3;
    out.push(rect("s-paver", a, PAVER_TOP, b, PAVER_BOT));
  }
  for (const j of joints.slice(1).concat([x0 + 7, x1 - 7])) {
    const foot = fleeceTopA(j);
    out.push(poly("s-pedestal", [[j - 8, foot], [j + 8, foot], [j + 5, PAVER_BOT], [j - 5, PAVER_BOT]]));
  }
  out.push(roofDrain(415, memA(415), A_ROOF + SLAB, false));
  // Threshold of the terrace door.
  out.push(line("s-metal", [[WAB[0] - 4, F1 - 1], [WAB[1], F1 - 1]]));
  return out.join("");
}

function balcony() {
  const out = [];
  // Drip edge: the membrane is welded onto it, its nose throws water clear of the slab.
  out.push(line("s-metal", [[BAL_EDGE - 8, balTop(BAL_EDGE) - 0.6], [BAL_EDGE + 3.5, balTop(BAL_EDGE) - 0.6], [BAL_EDGE + 3.5, balTop(BAL_EDGE) + 15], [BAL_EDGE + 6, balTop(BAL_EDGE) + 17.5]]));
  out.push(line("s-metal", [[WC[0] - 4, F2 - 1], [WC[1], F2 - 1]]));
  return out.join("");
}

function railings() {
  const out = [];
  // The railing along the far edge, seen beyond the cut: handrail and posts only.
  const rail = (xa, xb, base, top, posts) => {
    out.push(line("s-rail", [[xa, top], [xb, top]]));
    for (const x of posts) out.push(line("s-rail-thin", [[x, top], [x, base(x)]]));
  };
  // Terrace: posts fixed to the outer face of the parapet, so nothing pierces the membrane.
  out.push(rect("s-post", -8, A_PAR + 45, -2, PAVER_TOP - 110));
  rail(-8, WAB[0], () => PAVER_TOP, PAVER_TOP - 110, [150, 300, 450, 600, 750]);
  // Balcony: posts fixed to the slab edge.
  out.push(rect("s-post", BAL_EDGE + 7, balTop(BAL_EDGE) + 16, BAL_EDGE + 12, -698));
  rail(WC[1], BAL_EDGE + 12, balTop, -698, [2680]);
  return out.join("");
}

function basementLayers() {
  const out = [];
  // Perimeter insulation outside the membrane, carried 30 cm above the terrain.
  out.push(rect("s-xps", WC[1] + 1, -5, WC[1] + 11, BASE_TOP - 1));
  out.push(line("s-fleece-ln", [[779, 335.4], [2621, 335.4]]));
  out.push(line("s-fleece-ln", [[779, 337.1], [2621, 337.1]]));
  return out.join("");
}

function copings() {
  const out = [];
  // Metal coping over each parapet: falls towards the roof, drips on both faces.
  const coping = (xo, xi, yTop, dir) => {
    // xo = outer wall face, xi = inner face of the parapet insulation, dir = +1 roof to the right.
    // The top falls towards the roof; both edges end in a drip bent away from the wall.
    const o = xo - 4 * dir, i = xi + 4 * dir, t = 0.8;
    out.push(poly("s-coping", [
      [o - 1.5 * dir, yTop + 9], [o, yTop + 7.5], [o, yTop - 3.2], [i, yTop - 1.6], [i, yTop + 6], [i + 1.5 * dir, yTop + 7.5],
      [i + 1.5 * dir - t * dir, yTop + 8.2], [i - t * dir, yTop + 6.6], [i - t * dir, yTop - 1.6 + t], [o + t * dir, yTop - 3.2 + t], [o + t * dir, yTop + 7.8], [o - 1.5 * dir + t * dir, yTop + 9.6],
    ]));
  };
  coping(WA[0], WA[1] + PAR_INS, A_PAR, 1);
  coping(WAB[0], WAB[1] + PAR_INS, B_PAR, 1);
  coping(WBC[0], WBC[1] + PAR_INS, C_PAR, 1);
  coping(WC[1], WC[0] - PAR_INS, C_PAR, -1);
  return out.join("");
}

function ground() {
  const out = [];
  out.push(rect("s-soil", LEFT - EXT, TERRAIN, RIGHT + EXT, BOTTOM + EXT));
  out.push(rect("s-water", LEFT - EXT, GW, RIGHT + EXT, BOTTOM + EXT));
  return out.join("");
}

function groundLines() {
  const out = [];
  out.push(line("s-terrain", [[LEFT - EXT, TERRAIN], [WA[0], TERRAIN]]));
  out.push(line("s-terrain", [[WC[1] + 11, TERRAIN], [RIGHT + EXT, TERRAIN]]));
  out.push(line("s-gw", [[LEFT - EXT, GW], [779, GW]]));
  out.push(line("s-gw", [[2621, GW], [RIGHT + EXT, GW]]));
  // The usual level mark: a small open triangle standing on the water line.
  out.push(poly("s-gw-mark", [[2790, GW - 1], [2806, GW - 1], [2798, GW - 13]].map(([x, y]) => [x, y])));
  // Radon rising through the soil, stopped by the membrane under the slab.
  let shafts = "", heads = "";
  for (const x of [880, 1120, 1360, 1600, 1840, 2080, 2320, 2560]) {
    shafts += d([[x, 416], [x, 374]]);
    heads += d([[x - 4.5, 380], [x, 370], [x + 4.5, 380]], true);
  }
  out.push(path("s-radon", shafts));
  out.push(path("s-radon-head", heads));
  return out.join("");
}

export function buildingArt(id = "bldg-art") {
  return `<g id="${id}" class="bldg">`
    + ground()
    + `<g class="z z-base">${basementLayers()}</g>`
    + rooms()
    + structure()
    + frames()
    + `<g class="z z-roof">${roofC()}</g>`
    + `<g class="z z-green">${roofB()}</g>`
    + `<g class="z z-terrace">${roofA()}</g>`
    + `<g class="z z-balcony">${balcony()}</g>`
    + copings()
    + railings()
    + groundLines()
    + `</g>`;
}

// ------------------------------------------------------------------ membranes

function membraneC() {
  const xl = WBC[1] + PAR_INS + 0.6, xr = WC[0] - PAR_INS - 0.6;
  const pipeL = 1944.2, pipeR = 1955.8, drainL = 2144.5, drainR = 2155.5;
  const surf = (x) => memC(x) - 0.3;
  const left = [[WBC[0] - 0.6, C_PAR + 7], [WBC[0] - 0.6, C_PAR - 0.6], [xl, C_PAR - 0.6], [xl, surf(xl)], [pipeL, surf(pipeL)], [pipeL, -944]];
  const mid = [[pipeR, -944], [pipeR, surf(pipeR)], [drainL, surf(drainL)], [drainL, surf(drainL) + 6]];
  const right = [[drainR, surf(drainR) + 6], [drainR, surf(drainR)], [xr, surf(xr)], [xr, C_PAR - 0.6], [WC[1] + 0.6, C_PAR - 0.6], [WC[1] + 0.6, C_PAR + 7]];
  // The taper kinks at the drain, so both runs are straight lines.
  return [left, mid, right].map((p) => d(p)).join("");
}

function membraneB() {
  const xl = WAB[1] + PAR_INS + 0.6, xr = WBC[0] - 0.6;
  const surf = (x) => memB(x) - 0.3;
  const a = [[WAB[0] - 0.6, B_PAR + 7], [WAB[0] - 0.6, B_PAR - 0.6], [xl, B_PAR - 0.6], [xl, surf(xl)], [1259.5, surf(1259.5)], [1259.5, surf(1259.5) + 6]];
  const b = [[1270.5, surf(1270.5) + 6], [1270.5, surf(1270.5)], [xr, surf(xr)], [xr, -663]];
  return d(a) + d(b);
}

function membraneA() {
  const xl = WA[1] + PAR_INS + 0.6, xr = WAB[0] - 0.6;
  const surf = (x) => memA(x) - 0.3;
  const a = [[WA[0] - 0.6, A_PAR + 7], [WA[0] - 0.6, A_PAR - 0.6], [xl, A_PAR - 0.6], [xl, surf(xl)], [409.5, surf(409.5)], [409.5, surf(409.5) + 6]];
  const b = [[420.5, surf(420.5) + 6], [420.5, surf(420.5)], [xr, surf(xr)], [xr, F1 - 2.5], [WAB[0] + 14, F1 - 2.5]];
  return d(a) + d(b);
}

function membraneBalcony() {
  const top = (x) => balTop(x) - 0.4;
  return d([[BAL_EDGE + 3.5, top(BAL_EDGE)], [WC[1] + 0.6, top(WC[1])], [WC[1] + 0.6, F2 - 2.5], [WC[1] - 14, F2 - 2.5]]);
}

function membraneBase() {
  // The tank: up A's side of the basement wall, around the slab, up C's outer wall.
  const tank = d([[799.4, 15.6], [799.4, BASE_TOP - 0.6], [779.4, BASE_TOP - 0.6], [779.4, 336.2], [2620.6, 336.2], [2620.6, BASE_TOP - 0.6], [WC[1] + 0.6, BASE_TOP - 0.6], [WC[1] + 0.6, -5]]);
  // A's floor on the ground: under the slab, through the wall, up to the plinth.
  const floor = d([[WA[0] - 0.6, -5], [WA[0] - 0.6, 15.6], [799.4, 15.6]]);
  return tank + floor;
}

export const MEMBRANES = [
  { zone: "roof", d: membraneC() },
  { zone: "green", d: membraneB() },
  { zone: "balcony", d: membraneBalcony() },
  { zone: "terrace", d: membraneA() },
  { zone: "base", d: membraneBase() },
];

export function membraneGroup(id = "bldg-mem", cls = "mem") {
  return `<g id="${id}" class="${cls}">` + MEMBRANES.map((m) => `<path class="s-mem m-${m.zone}" d="${m.d}"/>`).join("") + `</g>`;
}

// ------------------------------------------------------------------ rain

// The highest surface at each x, which is where a raindrop stops. Listed as
// [x, y] vertices of a polyline; two vertices with the same x make a step.
export const SKYLINE = (() => {
  const s = [];
  const push = (x, y) => s.push([r(x), r(y)]);
  const run = (x0, x1, f, step = 40) => { for (let x = x0; x < x1; x += step) push(x, f(x)); push(x1, f(x1)); };
  push(LEFT, TERRAIN); push(-12, TERRAIN);
  push(-12, A_PAR - 3); push(WA[1] + PAR_INS + 4, A_PAR - 1.5);
  push(WA[1] + PAR_INS + 4, PAVER_TOP); push(WAB[0] - 4, PAVER_TOP);
  push(WAB[0] - 4, B_PAR - 3); push(WAB[1] + PAR_INS + 4, B_PAR - 1.5);
  run(WAB[1] + PAR_INS + 4, WBC[0], (x) => subTopB(x) - 1);
  push(WBC[0] - 4, C_PAR - 3); push(WBC[1] + PAR_INS + 4, C_PAR - 1.5);
  run(WBC[1] + PAR_INS + 4, 1937, memC);
  push(1937, -1004); push(1963, -1004);
  run(1963, WC[0] - PAR_INS - 4, memC);
  push(WC[0] - PAR_INS - 4, C_PAR - 1.5); push(WC[1] + 4, C_PAR - 3);
  push(WC[1] + 4, balTop(WC[1]) - 0.5); push(BAL_EDGE + 12, balTop(BAL_EDGE) - 0.5);
  push(BAL_EDGE + 12, TERRAIN); push(RIGHT, TERRAIN);
  return s;
})();

// Where the hero's labels point, and where the drawing is highest under the
// text column (the text may overlap the sky above it, never the building).
export const ANCHORS = {
  roof: [1860, memC(1860)],
  insulation: [2420, (insTopC(2420) + C_ROOF) / 2],
  green: [1480, subTopB(1480) - 3],
  terrace: [560, PAVER_TOP],
  balcony: [2690, balTop(2690) - 1],
  base: [799, 150],
  groundwater: [2798, GW],
  radon: [1600, 395],
  floor: [520, 15.6],
};
export const SKY_OVER_TEXT = B_PAR - 3 - VIEW.y; // cm of free sky above the left blocks

export const GEOMETRY = { memA, memB, memC, insTopA, insTopB, insTopC, subTopB, balTop, PAVER_TOP, A_PAR, B_PAR, C_PAR, TERRAIN, GW };
