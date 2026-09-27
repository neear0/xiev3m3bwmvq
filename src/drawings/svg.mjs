// Small helpers for writing SVG by hand in code. Coordinates are rounded to
// one decimal: the drawings are in centimetres, a tenth of a millimetre on
// screen is far below anything a browser can show.

export const r = (n) => Math.round(n * 10) / 10;

export function d(points, close = false) {
  return "M" + points.map(([x, y]) => `${r(x)} ${r(y)}`).join("L") + (close ? "Z" : "");
}

export const path = (cls, dd) => `<path class="${cls}" d="${dd}"/>`;
export const poly = (cls, points) => path(cls, d(points, true));
export const line = (cls, points) => path(cls, d(points));

export function rect(cls, x0, y0, x1, y1) {
  const x = Math.min(x0, x1), y = Math.min(y0, y1);
  return `<rect class="${cls}" x="${r(x)}" y="${r(y)}" width="${r(Math.abs(x1 - x0))}" height="${r(Math.abs(y1 - y0))}"/>`;
}

// A rectangle with holes cut out of it, as one path (even-odd fill).
// Used for walls with window and door openings.
export function rectWithHoles(cls, [x0, y0, x1, y1], holes) {
  const box = ([a, b, c, e]) => d([[a, b], [c, b], [c, e], [a, e]], true);
  return `<path class="${cls}" fill-rule="evenodd" d="${[box([x0, y0, x1, y1]), ...holes.map(box)].join("")}"/>`;
}

// Deterministic pseudo-random numbers, so every build draws the same
// vegetation and gravel and the HTML does not change between builds.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A circle as a path fragment, so hundreds of pebbles can share one element.
export const circleD = (cx, cy, rad) =>
  `M${r(cx - rad)} ${r(cy)}a${r(rad)} ${r(rad)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-rad * 2)} 0`;

export const ellipseD = (cx, cy, rx, ry) =>
  `M${r(cx - rx)} ${r(cy)}a${r(rx)} ${r(ry)} 0 1 0 ${r(rx * 2)} 0a${r(rx)} ${r(ry)} 0 1 0 ${r(-rx * 2)} 0`;
