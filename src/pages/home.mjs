import { esc } from "../lib/html.mjs";
import { service, PATHS } from "../lib/nav.mjs";
import { ctaPair, faqList, facts } from "../lib/parts.mjs";
import { faqPage } from "../lib/schema.mjs";
import { heroDrawing, cameraDrawing, closeUp, layerKey, seamDetail, tightFrame } from "../drawings/views.mjs";
import { BUILDING_TYPES } from "../drawings/types.mjs";

const ANCHOR = { roof: "ploche-strechy", insulation: "zateplenie", green: "zelene-strechy", terrace: "terasy-a-balkony", base: "spodna-stavba" };

// The five services, in the order the camera passes them: down the building.
const DESCENT = [
  {
    key: "roof",
    h: "Ploché strechy",
    p: "Hydroizolácie plochých striech na novostavbách aj pri rekonštrukciách. Keď strecha zateká, nájdeme príčinu a povieme vám, či stačí oprava, alebo sa oplatí nová skladba.",
    items: ["Novostavby, rekonštrukcie a opravy", "Mechanicky kotvené, lepené aj priťažené systémy so štrkom", "Komplexné rekonštrukcie starších a zatekajúcich striech", "Atiky, vpuste a prestupy potrubí"],
  },
  {
    key: "insulation",
    h: "Zateplenie striech",
    p: "Tepelná izolácia plochých striech pri novostavbe aj pri obnove budovy. Izolácia môže zároveň vytvoriť spád k vpustiam, aby voda na streche nestála.",
    items: ["Priemyselné a logistické haly", "Bytové domy", "Obchodné a nákupné centrá", "Expandovaný a extrudovaný polystyrén, minerálna vlna"],
  },
  {
    key: "green",
    h: "Zelené strechy",
    p: "Vegetačné strechy so skladbou, ktorá unesie zeleň, zadrží časť dažďovej vody a zvyšok odvedie. Hydroizolácia pod zeleňou musí odolať koreňom, preto na ňu používame systémy určené na vegetačné zaťaženie.",
    items: ["Realizácia zelených plochých striech", "Systémy vhodné pre vegetačné zaťaženie"],
  },
  {
    key: "terrace",
    h: "Terasy a balkóny",
    p: "Terasa nad obytnou miestnosťou je vlastne plochá strecha, po ktorej sa chodí. Hydroizoláciu vedieme pod dlažbou a najviac pozornosti venujeme miestam, kde terasy zatekajú najčastejšie: prahom dverí, atikám a prestupom.",
    items: ["Hydroizolácie terás", "Hydroizolácie balkónov", "Opracovanie detailov: atiky, prestupy a napojenia"],
  },
  {
    key: "base",
    h: "Základy a suterén",
    p: "Izolácie spodnej stavby proti zemnej vlhkosti, proti spodnej a tlakovej vode a proti radónu. Suterén, ktorý stojí v podzemnej vode, potrebuje súvislú vodotesnú vaňu bez jediného slabého miesta.",
    items: ["Hydroizolácie proti zemnej vlhkosti", "Hydroizolácie proti spodnej a tlakovej vode", "Hydroizolácie proti radónu"],
  },
];

const STEPS = [
  { h: "Obhliadka", p: "Prídeme sa pozrieť na strechu, terasu alebo suterén, zameriame plochu a pri zatekaní hľadáme príčinu. Obhliadka je bezplatná a nezáväzná." },
  { h: "Cenová ponuka", p: "Navrhneme vhodný systém a skladbu a pripravíme cenovú ponuku na mieru pre váš objekt." },
  { h: "Realizácia", p: "Pracujeme s certifikovanými systémami. Spoje fólií zvárame horúcim vzduchom, takže sa z pásov stane jeden súvislý celok." },
  { h: "Odovzdanie a záruka", p: "Hotové dielo s vami prejdeme a odovzdáme. Na vykonané práce dávame štandardne záruku 10 rokov." },
];

const FAQ = [
  {
    q: "Koľko stojí hydroizolácia plochej strechy?",
    a: "<p>Závisí od plochy, od stavu podkladu, od zvoleného systému a od počtu detailov, ako sú atiky, vpuste a prestupy. Pri rekonštrukcii aj od toho, či sa dajú ponechať pôvodné vrstvy. Presnú cenu vám preto povieme po obhliadke, ktorá je zadarmo.</p>",
  },
  {
    q: "Fólia, alebo asfaltové pásy?",
    a: `<p>Obe riešenia majú svoje miesto. Fólie z PVC a TPO sa spájajú horúcim vzduchom bez otvoreného ohňa, sú ľahké a na strechu sa kladú v jednej vrstve. Asfaltové pásy sa natavujú plameňom a kladú sa spravidla v dvoch vrstvách.</p><p>My robíme fóliové systémy. Ak má vaša strecha pôvodné asfaltové pásy, novú fóliu od nich oddelíme, alebo použijeme fóliu, ktorá je s asfaltom znášanlivá. Viac na stránke <a href="${PATHS.materials}">Hydroizolačné fólie a systémy</a>.</p>`,
  },
  { q: "Je obhliadka naozaj bezplatná?", a: "<p>Áno. Obhliadku ani cenovú ponuku neplatíte a nič vás nezaväzuje.</p>" },
  { q: "Kde pracujete?", a: "<p>Na celom Slovensku, v Česku a v Nemecku. V dopyte nám napíšte, kde je stavba, a podľa toho dohodneme termín obhliadky.</p>" },
  { q: "Akú záruku dávate?", a: "<p>Na vykonané práce dávame štandardne záruku 10 rokov. Presné podmienky uvedieme v zmluve o dielo.</p>" },
  {
    q: "Dá sa opraviť len časť strechy?",
    a: "<p>Často áno. Ak je však pod fóliou mokrá tepelná izolácia, oprava jedného miesta nestačí, pretože vlhkosť sa v streche šíri ďalej. Čo sa oplatí, povieme po obhliadke.</p>",
  },
];

// Who the work is for, each with a small elevation of that kind of building.
const WHO = [
  {
    pic: "house", h: "Rodinné domy",
    p: "Ploché strechy, terasy a balkóny aj izolácie základov a suterénov. Pri novostavbe aj pri oprave staršieho domu.",
    links: ["roof", "terrace"],
  },
  {
    pic: "flats", h: "Bytové domy",
    p: "Obnova a zateplenie plochých striech a opravy zatekajúcich balkónov. Ponuku pripravíme pre spoločenstvo vlastníkov aj pre správcu domu.",
    links: ["insulation", "terrace"],
  },
  {
    pic: "hall", h: "Priemyselné a logistické haly",
    p: "Veľké strechy na trapézovom plechu: parozábrana, tepelná izolácia a mechanicky kotvená fólia, ktorá strechu takmer nezaťaží.",
    links: ["insulation", "roof"],
  },
  {
    pic: "mall", h: "Obchodné a nákupné centrá",
    p: "Rozsiahle strechy s prestupmi, svetlíkmi a technológiami. Práce plánujeme po etapách, aby prevádzka pod strechou mohla bežať ďalej.",
    links: ["roof", "insulation"],
  },
  {
    pic: "build", h: "Stavebné firmy a developeri",
    p: "Hydroizolácie a zateplenie striech ako subdodávka, podľa projektovej dokumentácie a harmonogramu stavby.",
    links: ["b2b"],
  },
];

const linkFor = (key) => (key === "b2b" ? { path: PATHS.b2b, name: "Subdodávky pre stavebné firmy" } : { path: service(key).path, name: service(key).nav });

export default function home() {
  const page = {
    id: "home",
    path: "/",
    title: "Hydroizolácie plochých striech, terás a základov | AquaShield",
    ogTitle: "AquaShield: hydroizolácie od strechy po základy",
    description: "Hydroizolácie plochých striech, terás, balkónov a spodnej stavby, zelené strechy a zateplenie. Bezplatná obhliadka, záruka 10 rokov. Slovensko, Česko a Nemecko.",
    scripts: ["home.js"],
  };
  page.schema = [faqPage(page, FAQ)];

  const hero = heroDrawing();
  const order = DESCENT.map((s) => s.key);

  const articles = DESCENT.map((s) => {
    const svc = service(s.key);
    return `<article class="stop" data-zone="${s.key}" id="${ANCHOR[s.key]}">
<h3 class="stop-h"><a href="${svc.path}">${esc(s.h)}</a></h3>
<div class="stop-fig">${closeUp(s.key, { labels: false, vb: tightFrame(s.key) })}${layerKey(s.key)}</div>
<div class="stop-text">
<p>${esc(s.p)}</p>
<ul class="ticks">${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
<a class="more" href="${svc.path}">${esc(svc.name)}</a>
</div>
</article>`;
  }).join("\n");

  const who = WHO.map((w) => `<li class="who-row">
<div class="who-pic">${BUILDING_TYPES[w.pic]}</div>
<h3 class="who-h">${esc(w.h)}</h3>
<p class="who-p">${esc(w.p)}</p>
<p class="who-links">${w.links.map((k) => { const l = linkFor(k); return `<a href="${l.path}">${esc(l.name)}</a>`; }).join("")}</p>
</li>`).join("\n");

  page.body = `<section class="hero" aria-labelledby="hero-h">
<div class="hero-text">
<h1 id="hero-h"><span class="ln"><span>Hydroizolácie</span></span> <span class="ln"><span>od strechy</span></span> <span class="ln"><span>po základy</span></span></h1>
<p class="hero-lead">Zateká vám strecha, terasa alebo suterén? Nájdeme príčinu a navrhneme riešenie. Robíme hydroizolácie plochých striech, terás a balkónov, zelené strechy, zateplenie aj izolácie spodnej stavby.</p>
${ctaPair()}
</div>
<div class="hero-art">
${hero.svg}
${hero.callouts}
</div>
<canvas class="rain" aria-hidden="true"></canvas>
<button class="rain-toggle" type="button" aria-pressed="false" hidden><span class="rain-ico" aria-hidden="true"></span><span class="rain-lbl">Zastaviť dážď</span></button>
</section>

${facts()}

<section class="descent" id="sluzby" aria-labelledby="descent-h">
<div class="descent-head">
<h2 class="sec-h" id="descent-h">Čo pre vás urobíme</h2>
<p class="sec-lead">Voda sa do stavby dostane zhora aj zdola. Preto sa staráme o celý jej obal: od strechy cez terasy a balkóny až po základy.</p>
</div>
<div class="descent-body">
<div class="descent-list">
${articles}
</div>
<div class="descent-cam">
${cameraDrawing(order)}
</div>
</div>
</section>

<section class="who" aria-labelledby="who-h">
<div class="who-head">
<h2 class="sec-h" id="who-h">Pre koho pracujeme</h2>
<p class="sec-lead">Od rodinného domu po logistickú halu. Postup je rovnaký, mení sa rozsah a systém.</p>
</div>
<ul class="who-list">
${who}
</ul>
</section>

<section class="steps" aria-labelledby="steps-h">
<h2 class="sec-h" id="steps-h">Ako prebieha zákazka</h2>
<ol class="steps-list">${STEPS.map((s) => `<li><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></li>`).join("")}</ol>
</section>

<section class="mat" aria-labelledby="mat-h">
<div class="mat-text">
<h2 class="sec-h" id="mat-h">Materiály a systémy</h2>
<p>Fólie z mäkčeného PVC a z TPO a FPO od overených výrobcov. Materiál vyberáme podľa typu strechy, podkladu a zaťaženia, spoje fólií zvárame horúcim vzduchom.</p>
<ul class="brands"><li>Fatrafol</li><li>Sikaplan a Sarnafil</li><li>Bauder TPO a FPO</li><li>ďalšie certifikované systémy</li></ul>
<a class="more" href="${PATHS.materials}">Hydroizolačné fólie a systémy</a>
</div>
<figure class="svc-fig mat-fig">${seamDetail()}<figcaption>Spoj dvoch pásov fólie: kotva v presahu a horný pás privarený horúcim vzduchom</figcaption></figure>
</section>

${faqList(FAQ)}`;
  return page;
}
