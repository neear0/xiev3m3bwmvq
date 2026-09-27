// Stavby na mape referencií. Poradie nehrá rolu, web ich zoradí od najnovšej.
//
// Každá stavba:
//   id        krátky názov do adresy: malé písmená bez diakritiky, slová oddelené spojovníkom
//             (napr. "bytovy-dom-ruzinov"); odkaz na ňu je /referencie/#ref-<id>
//   name      čo to je: "Bytový dom, Ružinov"
//   place     obec alebo mesto, country "SK" | "CZ" | "DE"
//   lat, lon  súradnice stavby (z Google Maps: pravý klik na miesto, prvé číslo je lat)
//   year      rok dokončenia
//   client    objednávateľ, voliteľné: "Kaufland Slovensko" (len so súhlasom
//             objednávateľa; pri subdodávke to býva upravené v zmluve)
//   services  čo sa robilo: "roof" | "insulation" | "green" | "terrace" | "base"
//   area      plocha, voliteľné: "1 250 m²"
//   system    materiál alebo systém, voliteľné: "Fatrafol 810, mechanicky kotvený"
//   text      jedna až tri vety o zákazke
//   photos    voliteľné: [{ src: "/referencie/nazov-1.jpg", alt: "Čo je na fotke", credit: "Meno autora" }]
//             súbory patria do static/referencie/ (JPG, šírka okolo 1600 px). Len vlastné
//             fotky alebo fotky so súhlasom autora; cudzia fotka musí mať `credit`
//             (zobrazí sa ako „Foto: …“). Obrázky z Google sa použiť nesmú.
//
// Položky so `sample: true` sú len ukážka rozloženia. Náhľad ich zobrazí,
// produkčný build s nimi odmietne prejsť, takže vymyslená stavba nemôže ísť von.

export const REFERENCES = [
  {
    id: "ukazka-bytovy-dom-bratislava", sample: true,
    name: "Bytový dom (ukážka)", place: "Bratislava", country: "SK", lat: 48.158, lon: 17.155, year: 2025,
    services: ["roof", "insulation"], area: "1 250 m²", system: "Fatrafol 810, mechanicky kotvený",
    text: "Rekonštrukcia zatekajúcej strechy bytového domu. Mokrú izoláciu sme odstránili, novú sme uložili v spáde k vpustiam a strechu prekryli PVC fóliou.",
  },
  {
    id: "ukazka-rodinny-dom-banska-bystrica", sample: true,
    name: "Rodinný dom (ukážka)", place: "Banská Bystrica", country: "SK", lat: 48.72, lon: 19.12, year: 2024,
    services: ["terrace"], area: "46 m²", system: "Fatrafol 818 pod dlažbou na terčoch",
    text: "Terasa nad obývačkou zatekala pri prahu dverí. Nová hydroizolácia je vytiahnutá pod prah a dlažba leží na rektifikačných terčoch.",
  },
  {
    id: "ukazka-hala-zilina", sample: true,
    name: "Logistická hala (ukážka)", place: "Žilina", country: "SK", lat: 49.19, lon: 18.7, year: 2025,
    services: ["roof", "insulation"], area: "8 400 m²", system: "Sikaplan, minerálna vlna",
    text: "Nová strecha haly ako subdodávka pre generálneho dodávateľa: parozábrana, minerálna vlna a mechanicky kotvená fólia.",
  },
  {
    id: "ukazka-obchodne-centrum-kosice", sample: true,
    name: "Obchodné centrum (ukážka)", place: "Košice", country: "SK", lat: 48.7, lon: 21.24, year: 2023,
    client: "Obchodný reťazec (ukážka)", services: ["roof"], area: "3 100 m²", system: "Bauder TPO",
    text: "Výmena hydroizolácie na prevádzke bez prerušenia predaja, po etapách a s dočasným odvodnením.",
  },
  {
    id: "ukazka-zelena-strecha-brno", sample: true,
    name: "Bytový dom so zelenou strechou (ukážka)", place: "Brno", country: "CZ", lat: 49.21, lon: 16.59, year: 2024,
    services: ["green", "roof"], area: "620 m²", system: "Fólia odolná proti koreňom, extenzívna zeleň",
    text: "Extenzívna zelená strecha na novostavbe. Fólia odolná proti koreňom, drenážna vrstva a substrát so suchomilnými rastlinami.",
  },
  {
    id: "ukazka-spodna-stavba-praha", sample: true,
    name: "Suterén novostavby (ukážka)", place: "Praha", country: "CZ", lat: 50.06, lon: 14.47, year: 2025,
    services: ["base"], area: "900 m²", system: "Fólia proti tlakovej vode a radónu",
    text: "Izolácia spodnej stavby proti tlakovej vode a radónu pod základovou doskou a na stenách suterénu.",
  },
  {
    id: "ukazka-hala-mnichov", sample: true,
    name: "Výrobná hala (ukážka)", place: "Mníchov", country: "DE", lat: 48.18, lon: 11.62, year: 2024,
    services: ["roof", "insulation"], area: "5 600 m²", system: "Bauder FPO, PIR izolácia",
    text: "Zateplenie a nová hydroizolácia strechy výrobnej haly pri plnej prevádzke.",
  },
  {
    id: "ukazka-rodinny-dom-norimberg", sample: true,
    name: "Rodinný dom (ukážka)", place: "Norimberg", country: "DE", lat: 49.43, lon: 11.05, year: 2023,
    services: ["roof", "terrace"], area: "180 m²", system: "Fatrafol 810",
    text: "Plochá strecha a strešná terasa rodinného domu, vrátane opracovania atík a prestupov.",
  },
];
