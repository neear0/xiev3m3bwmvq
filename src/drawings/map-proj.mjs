// Map projection for the reference map: Lambert conformal conic with standard
// parallels 48° and 54° N, the usual choice for central Europe. Drawing units:
// about 1 unit per 1.1 km (100 units per degree of latitude).

const RAD = Math.PI / 180;
const P1 = 48 * RAD, P2 = 54 * RAD, P0 = 51 * RAD, L0 = 14 * RAD;
const R = 100 / RAD;
const t = (p) => Math.tan(Math.PI / 4 + p / 2);
const N = Math.log(Math.cos(P1) / Math.cos(P2)) / Math.log(t(P2) / t(P1));
const F = (Math.cos(P1) * Math.pow(t(P1), N)) / N;
const RHO0 = (R * F) / Math.pow(t(P0), N);

export function project(lat, lon) {
  const rho = (R * F) / Math.pow(t(lat * RAD), N);
  const a = N * (lon * RAD - L0);
  return [rho * Math.sin(a), -(RHO0 - rho * Math.cos(a))];
}

// The view frames the three countries: their extreme points plus a margin.
const EXTREMES = [[51.0, 5.87], [49.1, 22.57], [48.4, 22.4], [55.06, 8.4], [54.9, 14.2], [47.27, 10.2], [47.73, 18.8], [47.6, 13.0]];
const pts = EXTREMES.map(([la, lo]) => project(la, lo));
const PAD = 34;
const x0 = Math.min(...pts.map((p) => p[0])) - PAD, x1 = Math.max(...pts.map((p) => p[0])) + PAD;
const y0 = Math.min(...pts.map((p) => p[1])) - PAD, y1 = Math.max(...pts.map((p) => p[1])) + PAD;

export const PROJ = {
  view: [Math.floor(x0), Math.floor(y0), Math.ceil(x1 - x0), Math.ceil(y1 - y0)],
  kmPerUnit: 111.2 / 100,
};
