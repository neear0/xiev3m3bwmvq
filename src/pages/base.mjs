import { service, PATHS } from "../lib/nav.mjs";
import { faqList, related } from "../lib/parts.mjs";
import { faqPage, service as serviceSchema } from "../lib/schema.mjs";
import { svcHead, block, terms, ticks } from "../lib/svc.mjs";
import { closeUp } from "../drawings/views.mjs";

const FAQ = [
  {
    q: "Dá sa dodatočne izolovať vlhký suterén?",
    a: "<p>Niekedy áno, ale je to náročnejšie a drahšie ako izolácia pri stavbe. Záleží od príčiny vlhkosti a od toho, či sú steny zvonka prístupné. Čo prichádza do úvahy, posúdime pri obhliadke.</p>",
  },
  {
    q: "Potrebujem ochranu proti radónu?",
    a: "<p>Závisí od radónového rizika pozemku a od toho, ako je dom postavený. Aké riziko je na pozemku, určí radónový prieskum a podľa neho sa navrhne ochrana.</p>",
  },
  {
    q: "Nahradí drenáž okolo domu hydroizoláciu?",
    a: "<p>Nie. Drenáž odvádza vodu, ktorá presakuje k stavbe, ale hydroizoláciu nenahradí. Pri tlakovej vode drenáž nestačí, tam rozhoduje súvislá vodotesná vaňa okolo celej spodnej stavby.</p>",
  },
];

export default function base() {
  const svc = service("base");
  const page = {
    id: "base",
    path: svc.path,
    title: "Hydroizolácia základov proti vode a radónu | AquaShield",
    description: "Hydroizolácia spodnej stavby proti zemnej vlhkosti, spodnej a tlakovej vode a proti radónu. Základy, suterény aj podlahy na teréne na Slovensku, v Česku a v Nemecku.",
    crumbs: [{ name: svc.nav, path: svc.path }],
  };
  page.schema = [
    serviceSchema(page, { name: svc.name, serviceType: "Hydroizolácia spodnej stavby", description: page.description }),
    faqPage(page, FAQ),
  ];

  page.body = `<article class="svc">
${svcHead(page, {
  h1: "Hydroizolácia spodnej stavby",
  lead: "Izolácie základov, suterénov a podláh na teréne proti zemnej vlhkosti, spodnej a tlakovej vode a proti radónu. Opravovať spodnú stavbu je drahé a náročné, preto sa oplatí urobiť ju dobre hneď pri stavbe.",
  figure: closeUp("base", { withDefs: true }),
  caption: "Detail: suterén pod hladinou podzemnej vody",
})}
<div class="svc-body">
${block("voda", "Voda pod zemou nie je všade rovnaká", `<p>Podľa toho, akej vode je stavba vystavená, sa navrhuje hydroizolácia:</p>
${terms([
  ["Zemná vlhkosť", "Voda viazaná v pôde, ktorá na stavbu netlačí. Stačí izolácia pod podlahou a na stenách, vytiahnutá nad terén na sokel."],
  ["Presakujúca voda", "Dažďová voda, ktorá presakuje pôdou k stavbe. V nepriepustnej zemine sa môže pri stene hromadiť a na chvíľu tlačiť."],
  ["Spodná a tlaková voda", "Keď hladina podzemnej vody siaha nad podlahu suterénu, voda tlačí na steny aj dno. Hydroizolácia musí vytvoriť súvislú vodotesnú vaňu okolo celej spodnej stavby."],
])}`)}

${block("radon", "Radón", `<p>Radón je prirodzený rádioaktívny plyn, ktorý uniká z podložia a cez netesnosti v spodnej stavbe sa dostáva do budovy. Nevidno ho ani necítiť.</p>
${ticks([
  "Ochranou je súvislá hydroizolácia s preukázanou odolnosťou proti prenikaniu radónu a starostlivo utesnené prestupy potrubí a káblov.",
  "Na pozemkoch s vyšším rizikom sa k nej pridáva odvetranie podložia.",
  "Aké riziko je na vašom pozemku, ukáže radónový prieskum. Podľa neho sa navrhuje ochrana.",
])}`)}

${block("postup", "Ako hydroizoláciu spodnej stavby robíme", terms([
  ["Pod doskou", "Fóliu pokladáme na podkladný betón pod základovú dosku a chránime ju textíliou, aby ju nepoškodila výstuž ani betonáž."],
  ["Na stenách", "Fóliu vytiahneme po stenách až nad terén. Pred zásypom ju chráni tepelná izolácia alebo ochranná vrstva."],
  ["Spoje a prestupy", "Spoje fólie zvárame horúcim vzduchom. Potrubia a káble, ktoré prechádzajú cez hydroizoláciu, tesníme systémovými manžetami."],
]))}
</div>
${faqList(FAQ)}
${related([service("terrace"), { path: PATHS.materials, name: "Hydroizolačné fólie a systémy" }, { path: PATHS.b2b, name: "Subdodávky pre stavebné firmy" }])}
</article>`;
  return page;
}
