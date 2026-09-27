// Small elevations of the kinds of building AquaShield works on, in the
// site's drawing language: ink outlines, pale interiors, the ground line,
// and the waterproofing on the roof in red.

const wrap = (label, body) =>
  `<svg class="bt" viewBox="0 0 120 64" role="img" aria-label="${label}">${body}<path class="bt-ground" d="M2 58.5H118"/></svg>`;

const windows = (x0, y0, cols, rows, w, h, gx, gy) => {
  let d = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = x0 + c * (w + gx), y = y0 + r * (h + gy);
    d += `M${x} ${y}h${w}v${h}h${-w}Z`;
  }
  return `<path class="bt-win" d="${d}"/>`;
};

export const BUILDING_TYPES = {
  house: wrap("Rodinný dom s plochou strechou a terasou",
    `<path class="bt-body" d="M30 58V24H78V58Z"/>`
    + `<path class="bt-body" d="M78 58V40H104V58Z"/>`
    + windows(37, 30, 3, 2, 8, 9, 5, 6)
    + `<path class="bt-win" d="M84 44h7v14h-7Z"/>`
    + `<path class="bt-rail" d="M78 32.5H104M104 32.5V40M91 32.5V40"/>`
    + `<path class="bt-mem" d="M28.5 21.5V24H79.5V21.5M78 40H105.5V37.5"/>`),
  flats: wrap("Bytový dom",
    `<path class="bt-body" d="M34 58V8H86V58Z"/>`
    + windows(40, 14, 4, 5, 7, 5.5, 4.5, 3.6)
    + `<path class="bt-win" d="M55 50h10v8H55Z"/>`
    + `<path class="bt-mem" d="M32.5 5.5V8H87.5V5.5"/>`),
  hall: wrap("Priemyselná alebo logistická hala",
    `<path class="bt-body" d="M8 58V30H112V58Z"/>`
    + `<path class="bt-win" d="M14 35H106V39H14Z"/>`
    + `<path class="bt-win" d="M20 44h18v14H20ZM44 44h18v14H44ZM68 44h18v14H68Z"/>`
    + `<path class="bt-fine" d="M20 48.5H38M20 53H38M44 48.5H62M44 53H62M68 48.5H86M68 53H86"/>`
    + `<path class="bt-mem" d="M6.5 27.5V30H113.5V27.5"/>`),
  mall: wrap("Obchodné centrum",
    `<path class="bt-body" d="M6 58V26H114V58Z"/>`
    + `<path class="bt-win" d="M40 40H80V58H40Z"/>`
    + `<path class="bt-fine" d="M50 40V58M60 40V58M70 40V58"/>`
    + `<path class="bt-rail" d="M34 37H86"/>`
    + windows(12, 32, 2, 2, 9, 6, 4, 4)
    + windows(89, 32, 2, 2, 9, 6, 4, 4)
    + `<path class="bt-body" d="M22 26V20H34V26ZM86 26V21H98V26Z"/>`
    + `<path class="bt-fine" d="M54 26L58 21H66L70 26"/>`
    + `<path class="bt-mem" d="M4.5 23.5V26H115.5V23.5"/>`),
  build: wrap("Stavba vo výstavbe so žeriavom",
    `<path class="bt-frame" d="M16 58V28M44 58V28M72 58V28M16 48H72M16 38H72M14 28H74"/>`
    + `<path class="bt-mem" d="M14 26.3H46"/><path class="bt-todo" d="M46 26.3H74"/>`
    + `<path class="bt-frame" d="M96 58V6M100 58V6M96 12L100 8M96 20L100 16M96 28L100 24M96 36L100 32M96 44L100 40M96 52L100 48"/>`
    + `<path class="bt-frame" d="M58 6H116M58 10H116M58 6V10M96 6L90 2L84 6"/>`
    + `<path class="bt-fine" d="M66 10V20M63 20h6v3h-6Z"/>`),
};
