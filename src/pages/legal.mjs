import { SITE } from "../../site.config.mjs";
import { esc, phone, email } from "../lib/html.mjs";
import { PATHS } from "../lib/nav.mjs";
import { crumbTrail } from "../lib/layout.mjs";

// Who runs the site, as the Slovak e-commerce act asks (§ 4 zákona
// č. 22/2004 Z. z.), the supervisory body and the consumer's route to
// alternative dispute resolution (zákon č. 391/2015 Z. z.).
export default function legal() {
  const p = phone(), e = email();
  const page = {
    id: "legal",
    path: PATHS.legal,
    title: "Právne informácie | AquaShield",
    description: "Údaje o prevádzkovateľovi webu AquaShield: obchodné meno, sídlo, IČO, zápis v obchodnom registri, kontakt, orgán dozoru a riešenie sporov.",
    crumbs: [{ name: "Právne informácie", path: PATHS.legal }],
  };
  const rows = [
    ["Obchodné meno", esc(SITE.legalName)],
    ["Sídlo", `${esc(SITE.address.street)}, ${esc(SITE.address.postalCode)} ${esc(SITE.address.city)}, Slovenská republika`],
    ["IČO", esc(SITE.ico)],
    SITE.dic && ["DIČ", esc(SITE.dic)],
    SITE.icDph && ["IČ DPH", esc(SITE.icDph)],
    ["Zápis", esc(SITE.register)],
    ["Telefón", `<a href="${p.href}"${p.attr}>${esc(p.text)}</a>`],
    ["E-mail", `<a href="${e.href}"${e.attr}>${esc(e.text)}</a>`],
  ].filter(Boolean);

  page.body = `<article class="doc">
${crumbTrail(page)}
<h1>Právne informácie</h1>
<p class="svc-lead">Údaje o prevádzkovateľovi tohto webu a o tom, na koho sa môžete obrátiť.</p>

<h2>Prevádzkovateľ</h2>
<dl class="terms terms-row">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>

<h2>Orgán dozoru</h2>
<p>Slovenská obchodná inšpekcia, Inšpektorát SOI pre Banskobystrický kraj, Dolná 46, 974 00 Banská Bystrica, <a href="https://www.soi.sk" rel="noopener">www.soi.sk</a>.</p>

<h2>Riešenie sporov so spotrebiteľmi</h2>
<p>Ak ste spotrebiteľ a nie ste spokojní s tým, ako sme vybavili vašu reklamáciu, alebo si myslíte, že sme porušili vaše práva, obráťte sa na nás najprv so žiadosťou o nápravu, telefonicky alebo e-mailom.</p>
<p>Ak vašu žiadosť zamietneme alebo na ňu do 30 dní neodpovieme, môžete podať návrh na alternatívne riešenie sporu. Subjektom alternatívneho riešenia sporov je Slovenská obchodná inšpekcia alebo iná oprávnená právnická osoba zo zoznamu, ktorý vedie Ministerstvo hospodárstva Slovenskej republiky. Tým nie je dotknuté vaše právo obrátiť sa na súd.</p>

<h2>Autorské práva</h2>
<p>Texty, kresby a fotografie na tomto webe sú chránené autorským právom. Bez nášho súhlasu ich nekopírujte ani ďalej nešírte. Pri fotografiách od iných autorov je autor uvedený priamo pri fotografii.</p>
<p>Mapové podklady na stránke <a href="${PATHS.references}">Referencie</a> pochádzajú z projektu Natural Earth, ktorý je voľným dielom.</p>

<h2>Ďalšie dokumenty</h2>
<p><a href="${PATHS.privacy}">Ochrana osobných údajov</a> a <a href="${PATHS.accessibility}">vyhlásenie o prístupnosti</a>.</p>
</article>`;
  return page;
}
