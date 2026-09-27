import { service, PATHS } from "../lib/nav.mjs";
import { faqList, related } from "../lib/parts.mjs";
import { faqPage, service as serviceSchema } from "../lib/schema.mjs";
import { svcHead, block, table, seq, terms } from "../lib/svc.mjs";
import { closeUp } from "../drawings/views.mjs";

const FAQ = [
  {
    q: "Dá sa urobiť zelená strecha na existujúcej budove?",
    a: "<p>Často áno, ak konštrukcia unesie zaťaženie a hydroizolácia je v dobrom stave alebo sa robí nová. Únosnosť posúdi statik, stav strechy zistíme pri obhliadke.</p>",
  },
  {
    q: "Koľko údržby potrebuje zelená strecha?",
    a: "<p>Extenzívna strecha s rozchodníkmi veľmi málo. Zvyčajne stačí raz alebo dvakrát do roka odstrániť náletové dreviny, vyčistiť vpuste a podľa potreby prihnojiť. Intenzívna strecha sa udržiava ako bežná záhrada.</p>",
  },
  {
    q: "Zateká zelená strecha častejšie ako obyčajná?",
    a: "<p>Nie, ak má správnu skladbu. Zeleň hydroizoláciu naopak chráni pred slnkom, mrazom a mechanickým poškodením. Rozhoduje fólia odolná proti koreňom a dobre urobené detaily pri atikách, stenách a vpustiach.</p>",
  },
];

export default function green() {
  const svc = service("green");
  const page = {
    id: "green",
    path: svc.path,
    title: "Zelená strecha a vegetačné strechy | AquaShield",
    description: "Realizácia zelených plochých striech so skladbou, ktorá unesie zeleň, zadrží vodu a ochráni hydroizoláciu pred koreňmi. Obhliadka zdarma, Slovensko, Česko a Nemecko.",
    crumbs: [{ name: svc.nav, path: svc.path }],
  };
  page.schema = [
    serviceSchema(page, { name: svc.name, serviceType: "Zelené vegetačné strechy", description: page.description }),
    faqPage(page, FAQ),
  ];

  page.body = `<article class="svc">
${svcHead(page, {
  h1: "Zelené strechy",
  lead: "Vegetačná strecha zadrží časť dažďovej vody, v lete chladí budovu a chráni hydroizoláciu pred slnkom. Aby dlho fungovala, potrebuje správnu skladbu od fólie až po substrát.",
  figure: closeUp("green", { withDefs: true }),
  caption: "Detail: zelená strecha pri stene vyššej budovy",
})}
<div class="svc-body">
${block("druhy", "Extenzívna alebo intenzívna", table("Porovnanie druhov zelených striech", ["Extenzívna", "Intenzívna"], [
  ["Rastliny", "Rozchodníky, trávy a byliny, ktoré znesú sucho", "Trávnik, kríky aj záhony"],
  ["Vrstva substrátu", "Nízka", "Vysoká"],
  ["Údržba", "Minimálna, po streche sa bežne nechodí", "Ako záhrada, vrátane zavlažovania"],
  ["Zaťaženie strechy", "Menšie, zvládne ho väčšina plochých striech", "Veľké, konštrukcia s ním musí počítať"],
]))}

${block("skladba", "Z čoho sa skladá", `<p>Vrstvy zelenej strechy zhora nadol:</p>
${seq([
  "<strong>Vegetácia</strong>",
  "<strong>Substrát</strong>, ľahká pôda pre strešnú zeleň",
  "<strong>Filtračná textília</strong>, ktorá nepustí jemné častice do drenáže",
  "<strong>Drenážna vrstva</strong>, ktorá zadrží časť vody pre rastliny a zvyšok odvedie",
  "<strong>Ochranná textília</strong>",
  "<strong>Hydroizolácia odolná proti prerastaniu koreňov</strong>",
  "<strong>Tepelná izolácia a parozábrana</strong>, ak je pod strechou vykurovaný priestor",
  "<strong>Nosná konštrukcia</strong>",
])}`)}

${block("pozor", "Na čo si dať pozor", terms([
  ["Únosnosť", "Nasiaknutý substrát je ťažký. Či strecha unesie zelenú skladbu, musí posúdiť statik."],
  ["Korene", "Hydroizolácia pod zeleňou musí byť odolná proti prerastaniu koreňov, inak ju korene časom narušia."],
  ["Kačírkový pás", "Pri atikách, stenách a vpustiach sa necháva pás štrku bez rastlín. Chráni detaily, uľahčuje kontrolu a bráni šíreniu ohňa."],
  ["Vpuste", "Vpuste pod zeleňou majú kontrolnú šachtu s mriežkou, aby sa dali čistiť."],
]))}
</div>
${faqList(FAQ)}
${related([service("roof"), service("insulation"), { path: PATHS.materials, name: "Hydroizolačné fólie a systémy" }])}
</article>`;
  return page;
}
