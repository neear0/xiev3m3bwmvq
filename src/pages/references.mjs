import { PATHS } from "../lib/nav.mjs";
import { ctaPair } from "../lib/parts.mjs";
import { crumbTrail } from "../lib/layout.mjs";
import { refMap, refTable } from "../lib/refs.mjs";

export default function references() {
  const page = {
    id: "refs",
    path: PATHS.references,
    title: "Referencie: kde sme robili hydroizolácie | AquaShield",
    description: "Mapa stavieb, na ktorých sme robili hydroizolácie striech, terás a spodnej stavby, zelené strechy a zateplenie. Slovensko, Česko a Nemecko.",
    crumbs: [{ name: "Referencie", path: PATHS.references }],
    scripts: ["refs.js"],
  };

  page.body = `<div class="refs">
<header class="svc-head">
${crumbTrail(page)}
<div class="svc-head-wide">
<h1>Referencie</h1>
<p class="svc-lead">Stavby, na ktorých sme pracovali, od rodinných domov po logistické haly. Kliknite na špendlík na mape a zobrazí sa, čo sme na stavbe robili.</p>
</div>
</header>
<section class="refs-map" aria-label="Mapa stavieb">
<div class="refs-map-in">
${refMap({ heading: 2 })}
</div>
</section>
<section class="refs-list" aria-labelledby="refs-list-h">
<div class="refs-list-head">
<h2 class="blk-h" id="refs-list-h">Zoznam stavieb</h2>
<p class="refs-list-note">Kliknutím na stavbu ju ukážeme na mape.</p>
</div>
${refTable()}
</section>
<section class="refs-cta" aria-labelledby="refs-cta-h">
<h2 class="sec-h sec-h-sm" id="refs-cta-h">Máte podobnú stavbu?</h2>
<p class="sec-lead">Prídeme sa pozrieť, obhliadka aj cenová ponuka sú zadarmo.</p>
${ctaPair()}
</section>
</div>`;
  return page;
}
