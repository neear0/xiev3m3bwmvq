import { service } from "../lib/nav.mjs";
import { faqList, related } from "../lib/parts.mjs";
import { faqPage, service as serviceSchema } from "../lib/schema.mjs";
import { svcHead, block, ticks, terms } from "../lib/svc.mjs";
import { closeUp } from "../drawings/views.mjs";

const FAQ = [
  {
    q: "Dá sa terasa opraviť bez búrania dlažby?",
    a: "<p>Ak dlažba leží na terčoch, dá sa zdvihnúť a potom znova položiť. Lepenú dlažbu treba pri výmene hydroizolácie spravidla odstrániť. Čo je pod ňou, zistíme sondou pri obhliadke.</p>",
  },
  {
    q: "Môže byť fólia na balkóne zároveň podlahou?",
    a: "<p>Áno. Na balkóny sa vyrábajú pochôdzne fólie s protišmykovým povrchom, ktoré sú hydroizoláciou aj nášľapnou vrstvou zároveň. Na terasy sa častejšie volí dlažba alebo drevo na terčoch.</p>",
  },
  {
    q: "Prečo terasa zateká pri dverách?",
    a: "<p>Prah dverí je najčastejšie slabé miesto terasy. Hydroizolácia musí prejsť pod prah a skončiť dostatočne vysoko nad pochôdznou vrstvou, inak sa voda pri daždi alebo topení snehu dostane pod dvere.</p>",
  },
];

export default function terrace() {
  const svc = service("terrace");
  const page = {
    id: "terrace",
    path: svc.path,
    title: "Hydroizolácia terasy a balkóna | AquaShield",
    description: "Hydroizolácia terás nad obytnými miestnosťami aj balkónov, s opracovaním atík, prestupov a napojení pod prah dverí. Obhliadka zdarma, Slovensko, Česko a Nemecko.",
    crumbs: [{ name: svc.nav, path: svc.path }],
  };
  page.schema = [
    serviceSchema(page, { name: svc.name, serviceType: "Hydroizolácia terás a balkónov", description: page.description }),
    faqPage(page, FAQ),
  ];

  page.body = `<article class="svc">
${svcHead(page, {
  h1: "Hydroizolácia terasy a balkóna",
  lead: "Terasa nad obytnou miestnosťou je plochá strecha, po ktorej sa chodí, a zateká najčastejšie v detailoch. Hydroizoláciu vedieme pod pochôdznou vrstvou a starostlivo ju napájame na prahy, atiky a prestupy.",
  figure: closeUp("terrace", { withDefs: true }),
  caption: "Detail: dlažba na terčoch a napojenie pod prah dverí",
})}
<div class="svc-body">
${block("priznaky", "Keď hydroizolácia terasy prestáva slúžiť", `<p>Tieto príznaky sa oplatí neodkladať, pretože voda pod dlažbou poškodzuje aj konštrukciu pod ňou:</p>
${ticks([
  "Mokré škvrny na strope miestnosti pod terasou.",
  "Dlažba sa uvoľňuje, praská alebo po mraze znie pod krokmi duto.",
  "Biele výkvety v škárach dlažby a na čele balkóna.",
  "Po daždi zostáva stáť voda pri dverách.",
  "Opadáva omietka pod okrajom balkóna.",
])}`)}

${block("povrch", "Čo môže byť na hydroizolácii", terms([
  ["Dlažba na terčoch", "Platne ležia na nastaviteľných podložkách a voda odteká pod nimi po fólii. Dlažba je rovná, aj keď má fólia pod ňou spád."],
  ["Drevo alebo kompozit na roštoch", "Rovnaký princíp: pod podlahou zostáva vetraná medzera a voda steká po hydroizolácii."],
  ["Pochôdzna fólia", "Na balkónoch môže byť fólia s protišmykovým povrchom zároveň podlahou."],
]))}

${block("detaily", "Detaily, v ktorých terasy zatekajú", terms([
  ["Prah dverí", "Hydroizolácia musí prejsť pod prah a skončiť dostatočne vysoko nad pochôdznou vrstvou."],
  ["Okraj a atika", "Fólia prechádza cez atiku alebo končí na okapovom plechu, ktorý odvedie vodu ďalej od fasády."],
  ["Prestupy", "Stĺpiky zábradlia, odtoky a kotvy tienenia. Zábradlie je najlepšie kotviť z boku, aby neprerážalo hydroizoláciu."],
  ["Odvodnenie", "Terasa potrebuje spád k vpusti alebo žľabu, inak voda zostáva pod dlažbou a v zime zamŕza."],
]))}
</div>
${faqList(FAQ)}
${related([service("roof"), service("green"), service("base")])}
</article>`;
  return page;
}
