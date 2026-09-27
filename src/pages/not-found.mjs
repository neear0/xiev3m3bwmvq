import { SERVICES, PATHS } from "../lib/nav.mjs";
import { esc } from "../lib/html.mjs";

// Served by Cloudflare for every unknown address, with status 404.
export default function notFound() {
  return {
    id: "404",
    path: "/404.html",
    file: "404.html",
    noindex: true,
    title: "Stránka sa nenašla | AquaShield",
    description: "Stránka na tejto adrese neexistuje alebo sa presunula. Pokračujte na úvod, na niektorú zo služieb alebo do kontaktu.",
    body: `<section class="notice">
<h1>Stránka sa nenašla</h1>
<p class="svc-lead">Adresa, ktorú ste otvorili, na tomto webe neexistuje alebo sa presunula. Skúste niektorú z týchto stránok:</p>
<ul class="ticks">
<li><a href="/">Úvod</a></li>
${SERVICES.map((s) => `<li><a href="${s.path}">${esc(s.name)}</a></li>`).join("\n")}
<li><a href="${PATHS.contact}">Kontakt a bezplatná obhliadka</a></li>
</ul>
</section>`,
  };
}
