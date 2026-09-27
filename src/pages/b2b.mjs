import { service, PATHS } from "../lib/nav.mjs";
import { faqList, related } from "../lib/parts.mjs";
import { faqPage } from "../lib/schema.mjs";
import { crumbTrail } from "../lib/layout.mjs";
import { block, ticks, seq, terms } from "../lib/svc.mjs";
import { artDefs } from "../drawings/views.mjs";
import { VIEW } from "../drawings/building.mjs";

const FAQ = [
  { q: "Pracujete aj mimo svojho regiónu?", a: "<p>Áno. Pracujeme na celom Slovensku, v Česku aj v Nemecku.</p>" },
  { q: "Dávate záruku aj pri subdodávke?", a: "<p>Áno. Na vykonané práce dávame štandardne záruku 10 rokov. Podmienky uvedieme v zmluve.</p>" },
];

export default function b2b() {
  const page = {
    id: "b2b",
    path: PATHS.b2b,
    title: "Subdodávky hydroizolácií pre stavebné firmy | AquaShield",
    description: "Hydroizolácie a zateplenie striech ako subdodávka pre generálnych dodávateľov a developerov. Slovensko, Česko, Nemecko. Ponuka podľa projektu či výkazu výmer.",
    crumbs: [{ name: "Pre stavebné firmy", path: PATHS.b2b }],
  };
  page.schema = [faqPage(page, FAQ)];

  const V = VIEW;
  page.body = `<article class="svc">
<header class="svc-head">
${crumbTrail(page)}
<div class="svc-head-text svc-head-wide">
<h1>Subdodávky pre stavebné firmy</h1>
<p class="svc-lead">Pre generálnych dodávateľov a developerov prevezmeme hydroizolácie a zateplenie striech ako ucelenú časť stavby. Pracujeme na Slovensku, v Česku a v Nemecku, podľa projektovej dokumentácie a vášho harmonogramu.</p>
<div class="cta-row"><a class="btn btn-red" href="${PATHS.contact}?praca=subdodavka#dopyt">Poslať podklady na ponuku</a></div>
</div>
<figure class="svc-fig svc-fig-wide">
<svg class="dwg dwg-whole" viewBox="${V.x} ${V.y} ${V.w} ${V.h}" role="img" aria-label="Rez budovou. Červenou sú vyznačené hydroizolácie od strechy po základy, ktoré robíme ako subdodávku.">
${artDefs()}<use href="#bldg-art"/><use href="#bldg-mem"/>
</svg>
<figcaption>Všetko, čo je na reze červené, urobíme ako subdodávku.</figcaption>
</figure>
</header>
<div class="svc-body">
${block("co", "Čo prevezmeme", ticks([
  "Hydroizolácie plochých striech: mechanicky kotvené, lepené aj priťažené systémy",
  "Tepelné izolácie a zateplenie striech vrátane parozábrany a spádových dosiek",
  "Zelené strechy",
  "Hydroizolácie terás a balkónov vrátane detailov",
  "Izolácie spodnej stavby proti vlhkosti, tlakovej vode a radónu",
]))}

${block("podklady", "Čo potrebujeme na cenovú ponuku", seq([
  "Projektovú dokumentáciu, alebo aspoň výkresy strechy a skladieb",
  "Výkaz výmer, ak ho máte",
  "Predpokladaný termín a harmonogram stavby",
  "Požiadavky investora na systém alebo výrobcu, ak sú dané",
]))}

${block("spolupraca", "Ako spolupracujeme", terms([
  ["Ponuka", "Pripravíme ju podľa projektu alebo výkazu výmer. Keď niečo v podkladoch nie je jasné, spýtame sa, namiesto toho, aby sme hádali."],
  ["Termíny", "Zosúladíme ich s harmonogramom stavby a s ďalšími profesiami, napríklad s klampiarmi."],
  ["Zmluva a faktúra", `Zmluvu uzatvárate a faktúru dostávate od spoločnosti AQUASHIELD s. r. o. Na vykonané práce dávame štandardne záruku 10 rokov.`],
  ["Rozsah", "Slovensko, Česko a Nemecko."],
]))}
</div>
${faqList(FAQ)}
${related([service("roof"), service("insulation"), service("base")])}
</article>`;
  return page;
}
