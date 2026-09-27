import { SITE } from "../../site.config.mjs";
import { esc, phone, email } from "../lib/html.mjs";
import { PATHS } from "../lib/nav.mjs";
import { crumbTrail } from "../lib/layout.mjs";

// A voluntary accessibility statement. What it claims was checked by hand on
// the day below (code review, keyboard only, colour contrast, 390 px wide);
// change the date and the list whenever the site changes.
export default function accessibility() {
  const p = phone(), e = email();
  const host = new URL(SITE.url).host;
  const page = {
    id: "a11y",
    path: PATHS.accessibility,
    title: "Vyhlásenie o prístupnosti | AquaShield",
    description: "Ako je web AquaShield prístupný ľuďom so zdravotným postihnutím, čo zatiaľ nie je v súlade s WCAG 2.1 a ako nám nahlásiť prekážku na webe.",
    crumbs: [{ name: "Vyhlásenie o prístupnosti", path: PATHS.accessibility }],
  };

  page.body = `<article class="doc">
${crumbTrail(page)}
<h1>Vyhlásenie o prístupnosti</h1>
<p class="svc-lead">Chceme, aby tento web mohol pohodlne používať každý, aj ľudia so zrakovým, sluchovým, pohybovým alebo kognitívnym postihnutím. Naposledy upravené 27. septembra 2026.</p>

<h2>Na čo sa vyhlásenie vzťahuje</h2>
<p>Na web ${esc(host)}, ktorý prevádzkuje spoločnosť ${esc(SITE.legalName)}${SITE.legalName.endsWith(".") ? "" : "."}</p>

<h2>Stav súladu</h2>
<p>Web je čiastočne v súlade s pravidlami WCAG 2.1 na úrovni AA a s normou EN 301 549. Časti, ktoré zatiaľ v súlade nie sú, uvádzame nižšie spolu s tým, ako sa k rovnakým informáciám dostanete inak.</p>

<h2>Čo sme pre prístupnosť urobili</h2>
<ul class="ticks">
<li>Stránky majú jasnú štruktúru nadpisov a odkaz „Preskočiť na obsah“ na začiatku.</li>
<li>Všetko sa dá ovládať klávesnicou a prvok, na ktorom práve ste, je viditeľne zvýraznený.</li>
<li>Farba textu a pozadia má kontrast aspoň 4,5 : 1.</li>
<li>Obrázky a kresby majú textový popis, fotografie referencií majú alternatívny text.</li>
<li>Ak máte v zariadení zapnuté obmedzenie pohybu, animácie sa vypnú. Dážď na úvodnej stránke sa dá zastaviť tlačidlom.</li>
<li>Web funguje na mobile aj pri zväčšení textu na 200 %.</li>
<li>Polia formulára majú popisy a chyby sa zobrazia priamo pri poli, ktorého sa týkajú. Formulár nemá časový limit.</li>
<li>Web nenastavuje cookies a nezobrazuje vyskakovacie okná.</li>
</ul>

<h2>Čo zatiaľ nie je v súlade</h2>
<dl class="terms">
<div><dt>Interaktívna mapa referencií</dt><dd>Mapa sa posúva ťahaním a približuje gestom dvoch prstov. Rovnako ju ovládate tlačidlami + a &minus;, šípkami na klávesnici a tlačidlami krajín pod mapou. Všetky stavby z mapy sú aj v textovom zozname pod ňou.</dd></div>
<div><dt>Technické kresby</dt><dd>Rezy budovou a detaily vrstiev sú zložité obrázky. Ich obsah opisuje text stránky a zoznam vrstiev pri každej kresbe, podrobný popis každej čiary však kresby nemajú.</dd></div>
</dl>

<h2>Nahláste nám prekážku</h2>
<p>Ak sa na webe k niečomu neviete dostať alebo potrebujete informácie v inej podobe, napíšte nám na <a href="${e.href}"${e.attr}>${esc(e.text)}</a> alebo zavolajte na <a href="${p.href}"${p.attr}>${esc(p.text)}</a>. Ozveme sa bez zbytočného odkladu, najneskôr do 30 dní, a informácie vám medzitým poskytneme inak, napríklad telefonicky.</p>
<p>Ak s našou odpoveďou nebudete spokojní, môžete sa obrátiť na Slovenskú obchodnú inšpekciu, <a href="https://www.soi.sk" rel="noopener">www.soi.sk</a>.</p>

<h2>Ako vyhlásenie vzniklo</h2>
<p>Vyhlásenie sme pripravili 27. septembra 2026 na základe vlastného posúdenia: kontrola kódu, ovládanie iba klávesnicou, meranie kontrastu farieb a skúška na mobilnom telefóne. Posúdenie zopakujeme pri väčšej zmene webu.</p>
</article>`;
  return page;
}
