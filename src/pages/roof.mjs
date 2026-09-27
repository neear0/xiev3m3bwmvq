import { service, PATHS } from "../lib/nav.mjs";
import { faqList, related } from "../lib/parts.mjs";
import { faqPage, service as serviceSchema } from "../lib/schema.mjs";
import { svcHead, block, table, ticks, seq } from "../lib/svc.mjs";
import { closeUp } from "../drawings/views.mjs";

const FAQ = [
  {
    q: "Treba pri rekonštrukcii strhnúť starú strechu?",
    a: "<p>Nie vždy. Ak sú pôvodné vrstvy suché a pevné, môžu zostať ako podklad pre novú fóliu. Mokrú tepelnú izoláciu treba odstrániť, pretože už neizoluje a vlhkosť by sa šírila ďalej. Rozhodne o tom sonda pri obhliadke.</p>",
  },
  {
    q: "Musí mať plochá strecha spád?",
    a: `<p>Áno. Voda má z plochej strechy odtekať k vpustiam alebo do žľabov. Ak na streche po daždi stojí voda, dá sa spád upraviť spádovou tepelnou izoláciou. Viac na stránke <a href="${service("insulation").path}">Zateplenie plochej strechy</a>.</p>`,
  },
  {
    q: "Ako dlho vydrží fóliová strecha?",
    a: "<p>Závisí od materiálu, od toho, či je fólia vystavená slnku alebo chránená štrkom či zeleňou, a od toho, či sa strecha kontroluje. Na vykonané práce dávame štandardne záruku 10 rokov a životnosť kvalitnej fólie býva výrazne dlhšia.</p>",
  },
  {
    q: "Čo je lepšie, fólia z PVC alebo z TPO?",
    a: `<p>Obe sa zvárajú horúcim vzduchom a pri správnej montáži spoľahlivo tesnia. Líšia sa zložením a tým, s čím sa smú stýkať. Porovnanie nájdete na stránke <a href="${PATHS.materials}">Hydroizolačné fólie a systémy</a>.</p>`,
  },
  {
    q: "Koľko stojí hydroizolácia plochej strechy?",
    a: "<p>Závisí od plochy, stavu podkladu, zvoleného systému a počtu detailov. Pri rekonštrukcii aj od toho, či sa dajú ponechať pôvodné vrstvy. Cenu vám preto povieme po obhliadke, ktorá je zadarmo.</p>",
  },
];

export default function roof() {
  const svc = service("roof");
  const page = {
    id: "roof",
    path: svc.path,
    title: "Hydroizolácia a oprava plochej strechy | AquaShield",
    description: "Hydroizolácia plochej strechy fóliou z PVC alebo TPO na novostavbe aj pri rekonštrukcii. Opravy zatekajúcich striech, obhliadka zdarma, záruka 10 rokov.",
    crumbs: [{ name: svc.nav, path: svc.path }],
  };
  page.schema = [
    serviceSchema(page, { name: svc.name, serviceType: "Hydroizolácia plochých striech", description: page.description }),
    faqPage(page, FAQ),
  ];

  page.body = `<article class="svc">
${svcHead(page, {
  h1: "Hydroizolácia plochej strechy",
  lead: "Novostavby, rekonštrukcie aj opravy zatekajúcich striech. Hydroizoláciu robíme z fólií z mäkčeného PVC a z TPO, ktorých spoje sa zvárajú horúcim vzduchom do jedného súvislého celku.",
  figure: closeUp("roof", { withDefs: true }),
  caption: "Detail: atika, prestup potrubia a mechanicky kotvená fólia",
})}
<div class="svc-body">
${block("kedy", "Kedy nás zavolať", `<p>Plochá strecha nezačne zatekať zo dňa na deň. Väčšinou sa to ohlási skôr, než voda prenikne do miestnosti:</p>
${ticks([
  "Na strope pod strechou sa objavili mapy alebo pleseň.",
  "Po daždi zostáva na streche dlho stáť voda.",
  "Stará asfaltová krytina praská, tvorí pľuzgiere alebo sa odlupuje.",
  "Fólia je zvlnená, pri atike odlepená alebo natrhnutá.",
  "Chystáte zateplenie alebo nadstavbu a strecha potrebuje novú hydroizoláciu.",
  "Staviate a hľadáte dodávateľa hydroizolácie strechy.",
])}`)}

${block("systemy", "Tri spôsoby, ako fóliu uchytiť", `<p>Fólia musí na streche držať aj pri silnom vetre. Podľa toho, na čom leží a čo strecha unesie, volíme jeden z troch systémov.</p>
${table("Porovnanie systémov uchytenia fólie", ["Mechanicky kotvený", "Lepený", "Priťažený"], [
  ["Ako fólia drží", "Kotvami do nosnej konštrukcie, v presahu pásov", "Lepidlom k podkladu", "Váhou priťaženia: štrku, dlažby alebo zelene"],
  ["Kedy sa hodí", "Veľké strechy a haly, podklad z betónu, trapézového plechu alebo dreva", "Kde sa kotviť nedá alebo nesmie a na strechy zložitých tvarov", "Kde konštrukcia unesie priťaženie a fólia má byť chránená pred slnkom"],
  ["Zaťaženie konštrukcie", "Takmer žiadne", "Takmer žiadne", "Výrazné, únosnosť musí potvrdiť statik"],
  ["Kontrola a opravy", "Fólia je na očiach, poškodenie sa ľahko nájde", "Fólia je na očiach", "Fólia je pod štrkom, pri oprave ho treba odhrnúť"],
])}
<p>Počet a rozmiestnenie kotiev sa určuje výpočtom zaťaženia vetrom. Na okrajoch a v rohoch strechy, kde vietor saje najviac, je kotiev viac.</p>`)}

${block("rekonstrukcia", "Rekonštrukcia zatekajúcej strechy", `<p>Pri starej streche nestačí položiť novú fóliu na to, čo tam je. Postupujeme v tomto poradí:</p>
${seq([
  "<strong>Nájdeme príčinu.</strong> Voda sa v streche dokáže presunúť ďaleko od miesta, kde vnikla, takže fľak na strope nemusí byť pod dierou.",
  "<strong>Zistíme stav vrstiev.</strong> Sondou overíme, či je tepelná izolácia pod krytinou suchá. Mokrá izolácia prestáva izolovať a treba ju vymeniť.",
  "<strong>Rozhodneme, čo ponechať.</strong> Suché a pevné pôvodné vrstvy často môžu zostať ako podklad. Fóliu z mäkčeného PVC od starého asfaltu oddelíme geotextíliou, pretože spolu nie sú znášanlivé.",
  "<strong>Opracujeme detaily.</strong> Atiky, vpuste, prestupy a napojenia na steny sú miesta, kde strechy zatekajú najčastejšie, a venujeme im najviac času.",
])}`)}
</div>
${faqList(FAQ)}
${related([service("insulation"), service("green"), { path: PATHS.materials, name: "Hydroizolačné fólie a systémy" }])}
</article>`;
  return page;
}
