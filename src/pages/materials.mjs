import { service, PATHS } from "../lib/nav.mjs";
import { faqList, related } from "../lib/parts.mjs";
import { faqPage } from "../lib/schema.mjs";
import { svcHead, block, table, terms } from "../lib/svc.mjs";
import { seamDetail } from "../drawings/views.mjs";

const FAQ = [
  {
    q: "Ktorú fóliu odporúčate?",
    a: "<p>Závisí od podkladu, od toho, s čím bude fólia v styku, od zaťaženia a od požiadaviek projektu. Po obhliadke navrhneme konkrétny systém a uvedieme ho v cenovej ponuke.</p>",
  },
  {
    q: "Dá sa poškodená fólia opraviť?",
    a: "<p>Áno. Na poškodené miesto sa privarí záplata z rovnakého materiálu. Dôležité je poškodenie včas nájsť, preto sa oplatí strechu pravidelne kontrolovať, najmä po búrke a po zime.</p>",
  },
];

export default function materials() {
  const page = {
    id: "materials",
    path: PATHS.materials,
    title: "Hydroizolačné fólie PVC a TPO | AquaShield",
    description: "Fólie z mäkčeného PVC a z TPO a FPO, systémy Fatrafol, Sikaplan, Sarnafil a Bauder. Ako sa líšia, kde sa hodia a prečo záleží na celom systéme.",
    crumbs: [{ name: "Materiály", path: PATHS.materials }],
  };
  page.schema = [faqPage(page, FAQ)];

  page.body = `<article class="svc">
${svcHead(page, {
  h1: "Hydroizolačné fólie a systémy",
  lead: "Hydroizoláciu striech, terás aj spodnej stavby robíme z plastových fólií, ktorých spoje sa zvárajú horúcim vzduchom. Pracujeme s fóliami z mäkčeného PVC aj z TPO a FPO a s certifikovanými systémami overených výrobcov.",
  figure: seamDetail(),
  caption: "Detail: spoj dvoch pásov fólie v presahu, s kotvou a zvarom",
})}
<div class="svc-body">
${block("porovnanie", "PVC alebo TPO a FPO", table("Porovnanie hydroizolačných fólií", ["Mäkčené PVC", "TPO a FPO"], [
  ["Z čoho je", "PVC, ktoré je ohybné vďaka zmäkčovadlám", "Termoplastické polyolefíny, ohybné bez zmäkčovadiel"],
  ["Spoje", "Zvárané horúcim vzduchom", "Zvárané horúcim vzduchom"],
  ["Styk s asfaltom a polystyrénom", "Potrebuje oddeľovaciu vrstvu, inak z nej unikajú zmäkčovadlá a fólia starne", "Je s nimi znášanlivá"],
  ["Kde sa používa", "Ploché strechy, terasy, balkóny aj spodná stavba", "Ploché strechy, často pri rekonštrukcii na pôvodnom asfalte"],
]))}

${block("systemy", "Systémy, s ktorými pracujeme", terms([
  ["Fatrafol", "Fólie z mäkčeného PVC od českého výrobcu Fatra, na ploché strechy, terasy aj spodnú stavbu."],
  ["Sikaplan a Sarnafil", "Strešné fólie švajčiarskej skupiny Sika, z PVC aj z FPO."],
  ["Bauder", "Nemecký výrobca strešných systémov vrátane fólií TPO a FPO."],
  ["Ďalšie certifikované systémy", "Podľa požiadaviek projektu, investora alebo záručných podmienok."],
]))}

${block("system", "Prečo záleží na celom systéme", terms([
  ["Diely, ktoré k sebe patria", "Fólia, lepidlá, kotvy, tvarovky a lišty od jedného výrobcu sú navrhnuté a odskúšané spolu. Výrobca uvádza, s čím sa jeho fólia smie kombinovať."],
  ["Zvar namiesto lepenia", "Pri zváraní sa horný pás nataví na spodný a vznikne homogénny spoj z rovnakého materiálu ako fólia."],
  ["Kotva pod fóliou", "Pri mechanicky kotvenom systéme je kotva v presahu pásov. Horný pás ju prekryje a zvar ju utesní."],
]))}
</div>
${faqList(FAQ)}
${related([service("roof"), service("insulation"), service("base")])}
</article>`;
  return page;
}
