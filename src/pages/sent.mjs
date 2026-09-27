import { esc, phone } from "../lib/html.mjs";
import { PATHS } from "../lib/nav.mjs";

// Where a plain form post lands after the Worker stored the enquiry.
export default function sent() {
  const p = phone();
  return {
    id: "sent",
    path: PATHS.sent,
    noindex: true,
    title: "Dopyt sme dostali | AquaShield",
    description: "Ďakujeme za dopyt. Ozveme sa vám a dohodneme termín bezplatnej obhliadky. Ak je to naliehavé, zavolajte nám.",
    footCta: false,
    body: `<section class="notice">
<h1>Ďakujeme, dopyt sme dostali</h1>
<p class="svc-lead">Ozveme sa vám a dohodneme termín obhliadky. Ak práve zateká a je to naliehavé, zavolajte nám.</p>
<div class="cta-row">
<a class="call" href="${p.href}"${p.attr}><span class="call-k">Zavolať</span> <span class="call-v">${esc(p.text)}</span></a>
<a class="more" href="/">Späť na úvod</a>
</div>
</section>`,
  };
}
