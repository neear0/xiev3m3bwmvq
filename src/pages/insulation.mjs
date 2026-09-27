import { service, PATHS } from "../lib/nav.mjs";
import { faqList, related } from "../lib/parts.mjs";
import { faqPage, service as serviceSchema } from "../lib/schema.mjs";
import { svcHead, block, table, terms } from "../lib/svc.mjs";
import { closeUp } from "../drawings/views.mjs";

const FAQ = [
  {
    q: "Oplatí sa zatepliť strechu pri výmene hydroizolácie?",
    a: "<p>Väčšinou áno, najmä keď sa strecha aj tak otvára. Práce na streche sa urobia naraz a budova potom menej stráca teplo v zime a menej sa prehrieva v lete. Či sa dá nová izolácia uložiť na pôvodné vrstvy, posúdime pri obhliadke.</p>",
  },
  {
    q: "Ktorý izolačný materiál je najlepší?",
    a: "<p>Žiadny nie je najlepší všade. Expandovaný polystyrén je najbežnejší pod fóliu, extrudovaný znesie vlhko a veľké zaťaženie a minerálna vlna je nehorľavá. Vyberáme podľa typu budovy, požiarnych požiadaviek a zaťaženia strechy.</p>",
  },
  {
    q: "Dá sa strecha haly zatepliť počas prevádzky?",
    a: "<p>Väčšinou áno, pretože sa pracuje zvonku na streche. Postup dohodneme tak, aby bola naraz odkrytá len taká časť strechy, ktorú v ten deň opäť uzavrieme.</p>",
  },
  {
    q: "Akú hrúbku izolácie potrebujem?",
    a: "<p>Hrúbka sa navrhuje podľa tepelnotechnického posúdenia a požiadaviek na budovu, nie odhadom. Ak projekt nemáte, pri obhliadke vám povieme, ako postupovať.</p>",
  },
];

export default function insulation() {
  const svc = service("insulation");
  const page = {
    id: "insulation",
    path: svc.path,
    title: "Zateplenie plochej strechy a hál | AquaShield",
    description: "Tepelná izolácia plochých striech bytových domov, priemyselných a logistických hál a obchodných centier. Polystyrén aj minerálna vlna, obhliadka zdarma.",
    crumbs: [{ name: svc.nav, path: svc.path }],
  };
  page.schema = [
    serviceSchema(page, { name: svc.name, serviceType: "Tepelná izolácia plochých striech", description: page.description }),
    faqPage(page, FAQ),
  ];

  page.body = `<article class="svc">
${svcHead(page, {
  h1: "Zateplenie plochej strechy",
  lead: "Tepelná izolácia plochých striech pri novostavbe aj pri obnove budovy. Zatepľujeme bytové domy, priemyselné a logistické haly aj obchodné centrá a novú hydroizoláciu urobíme v tom istom kroku.",
  figure: closeUp("insulation", { withDefs: true }),
  caption: "Detail: tepelná izolácia v spáde k strešnej vpusti",
})}
<div class="svc-body">
${block("kde", "Kde zatepľujeme", terms([
  ["Bytové domy", "Ploché strechy panelových aj murovaných domov pri obnove. Pôvodné vrstvy často môžu zostať a novú izoláciu s fóliou uložíme na ne."],
  ["Priemyselné a logistické haly", "Veľké strechy na trapézovom plechu. Na parozábranu ukladáme tepelnú izoláciu a mechanicky kotvenú fóliu, ktorá strechu takmer nezaťaží."],
  ["Obchodné a nákupné centrá", "Rozsiahle strechy s množstvom prestupov, svetlíkov a technológií. Postup plánujeme tak, aby prevádzka pod strechou mohla bežať ďalej."],
]))}

${block("materialy", "Z čoho izolujeme", `<p>Na ploché strechy používame tri druhy tepelnej izolácie. Každý sa hodí na niečo iné:</p>
${table("Porovnanie materiálov tepelnej izolácie", ["Expandovaný polystyrén", "Extrudovaný polystyrén", "Minerálna vlna"], [
  ["Čo to je", "Ľahké biele dosky z penového polystyrénu", "Hustejšie dosky s uzavretými pórmi", "Tvrdé dosky z kamennej vlny"],
  ["Kde sa hodí", "Najčastejšia izolácia plochých striech pod fóliu", "Kde hrozí vlhkosť alebo veľké zaťaženie: terasy, obrátené strechy, spodná stavba", "Kde záleží na požiarnej bezpečnosti a akustike: haly a obchodné centrá"],
  ["Oheň", "Horľavý, so samozhášavou úpravou", "Horľavý, so samozhášavou úpravou", "Nehorľavá"],
  ["Voda", "Musí zostať suchý pod hydroizoláciou", "Takmer nenasiakne, znesie vlhko", "Musí zostať suchá pod hydroizoláciou"],
  ["Pod fóliou z PVC", "Potrebuje oddeľovaciu vrstvu", "Potrebuje oddeľovaciu vrstvu", "Oddeľovaciu vrstvu nepotrebuje"],
])}`)}

${block("spad", "Spád, parozábrana a hrúbka", terms([
  ["Spádové dosky", "Izolácia narezaná do klinu vytvorí spád k vpustiam aj na úplne rovnej doske. Voda potom na streche nestojí a nevnikne do spojov."],
  ["Parozábrana", "Fólia pod izoláciou, ktorá nepustí vlhký vzduch z interiéru do tepelnej izolácie. Bez nej by sa v izolácii v zime zrážala voda."],
  ["Hrúbka", "Navrhuje sa podľa tepelnotechnického posúdenia a požiadaviek na budovu. Na mieste overíme, či sa na strechu zmestí, napríklad pod prahmi dverí a pri atikách."],
]))}
</div>
${faqList(FAQ)}
${related([service("roof"), service("green"), { path: PATHS.b2b, name: "Subdodávky pre stavebné firmy" }])}
</article>`;
  return page;
}
