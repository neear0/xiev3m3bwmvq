// Building blocks for the service pages. Each page writes its own sections;
// these only keep the page head, tables and lists consistent.

import { esc } from "./html.mjs";
import { crumbTrail } from "./layout.mjs";
import { ctaPair, facts } from "./parts.mjs";

// Page head: breadcrumbs, the h1 with its lead and actions, and a drawing.
export function svcHead(page, { h1, lead, figure, caption }) {
  return `<header class="svc-head">
${crumbTrail(page)}
<div class="svc-head-grid">
<div class="svc-head-text">
<h1>${esc(h1)}</h1>
<p class="svc-lead">${lead}</p>
${ctaPair()}
</div>
<figure class="svc-fig">${figure}<figcaption>${esc(caption)}</figcaption></figure>
</div>
</header>
${facts({ cls: "facts-svc" })}`;
}

// A titled section of a document page.
export function block(id, h, body, { cls = "" } = {}) {
  return `<section class="blk${cls ? " " + cls : ""}" id="${id}" aria-labelledby="${id}-h">
<h2 class="blk-h" id="${id}-h">${esc(h)}</h2>
${body}
</section>`;
}

// A comparison table. `cols` are column heads, each row is [label, ...cells].
// On a phone the same data is shown one column at a time, stacked, because a
// table that scrolls sideways hides the options it is meant to compare.
export function table(caption, cols, rows) {
  const stacked = cols.map((c, i) => `<div class="tbl-col">
<p class="tbl-col-h">${esc(c)}</p>
<dl>${rows.map(([label, ...cells]) => `<div><dt>${esc(label)}</dt><dd>${esc(cells[i])}</dd></div>`).join("")}</dl>
</div>`).join("");
  return `<div class="tbl-wrap" role="region" aria-label="${esc(caption)}" tabindex="0"><table class="tbl">
<caption>${esc(caption)}</caption>
<thead><tr><td></td>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
<tbody>${rows.map(([label, ...cells]) => `<tr><th scope="row">${esc(label)}</th>${cells.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>
<div class="tbl-stack" role="region" aria-label="${esc(caption)}">${stacked}</div>`;
}

// Terms and their explanation.
export function terms(items) {
  return `<dl class="terms">${items.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${d}</dd></div>`).join("")}</dl>`;
}

export const ticks = (items) => `<ul class="ticks">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

// A real sequence (the layers of a build-up top to bottom, the steps of a job).
export const seq = (items) => `<ol class="seq">${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
