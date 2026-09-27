import { SITE } from "../../site.config.mjs";
import { esc, email } from "../lib/html.mjs";
import { PATHS } from "../lib/nav.mjs";
import { crumbTrail } from "../lib/layout.mjs";

export default function privacy() {
  const e = email();
  const mail = `<a href="${e.href}"${e.attr}>${esc(e.text)}</a>`;
  const page = {
    id: "privacy",
    path: PATHS.privacy,
    title: "Ochrana osobných údajov | AquaShield",
    description: "Aké osobné údaje zbiera web AquaShield, prečo, ako dlho ich uchováva, komu ich poskytuje a aké máte práva. Web nepoužíva cookies ani analytiku.",
    crumbs: [{ name: "Ochrana osobných údajov", path: PATHS.privacy }],
  };

  page.body = `<article class="doc">
${crumbTrail(page)}
<h1>Ochrana osobných údajov</h1>
<p class="svc-lead">Zbierame len to, čo potrebujeme na vybavenie vášho dopytu. Tu je vysvetlené čo, prečo, ako dlho a aké máte práva. Naposledy upravené 26. septembra 2026.</p>

<h2>Kto údaje spracúva</h2>
<p>Prevádzkovateľom je ${esc(SITE.legalName)}, ${esc(SITE.address.street)}, ${esc(SITE.address.postalCode)} ${esc(SITE.address.city)}, IČO ${esc(SITE.ico)}, zapísaná v Obchodnom registri Okresného súdu Banská Bystrica, oddiel Sro, vložka č. 38054/S. S akoukoľvek otázkou k svojim osobným údajom nám napíšte na ${mail}.</p>

<h2>Aké údaje zbierame</h2>
<p>Cez formulár na tomto webe nám posielate meno, telefón, voliteľne e-mail, obec, kde je stavba, druh práce, približnú plochu, text správy a informáciu, či momentálne zateká. Ak nám zavoláte alebo napíšete, spracúvame údaje, ktoré nám pritom sami poskytnete.</p>
<p>Nevytvárame účty, neposielame newsletter a nekupujeme ani nepredávame databázy kontaktov.</p>

<h2>Prečo ich spracúvame</h2>
<p>Aby sme s vami dohodli obhliadku, pripravili cenovú ponuku a komunikovali o zákazke. Právnym základom je čl. 6 ods. 1 písm. b) GDPR, teda opatrenia pred uzavretím zmluvy na vašu žiadosť, a čl. 6 ods. 1 písm. f) GDPR, náš oprávnený záujem odpovedať na obchodný dopyt. Údaje nepoužívame na profilovanie ani na automatizované rozhodovanie.</p>

<h2>Ako dlho ich uchovávame</h2>
<p>Záznam dopytu z formulára sa na serveri automaticky vymaže po 180 dňoch. Korešpondenciu k dopytu uchovávame, kým je potrebná na jeho vybavenie a na prípadnú zákazku, najviac 24 mesiacov od poslednej komunikácie. Ak uzavrieme zmluvu, doklady k nej uchovávame tak dlho, ako určuje zákon, napríklad predpisy o účtovníctve.</p>
<p>Aby formulár nebolo možné zneužiť na hromadné odosielanie, na jednu hodinu si ukladáme odtlačok vašej IP adresy. Samotnú adresu neukladáme.</p>

<h2>Komu sa údaje dostanú</h2>
<p>Údaje nikomu nepredávame. Na prevádzku webu a doručenie dopytu využívame dvoch sprostredkovateľov:</p>
<dl class="terms">
<div><dt>Cloudflare, Inc.</dt><dd>Server, z ktorého sa web načítava, a úložisko, kam sa zapíše odoslaný dopyt. Ako každý webový server spracúva pri návšteve IP adresu a údaje o prehliadači.</dd></div>
<div><dt>Resend, Inc.</dt><dd>Doručí nám e-mailom oznámenie o novom dopyte s jeho obsahom.</dd></div>
</dl>
<p>Obe spoločnosti sídlia v USA. Prenos údajov je zabezpečený štandardnými zmluvnými doložkami schválenými Európskou komisiou, prípadne rámcom na ochranu údajov medzi EÚ a USA.</p>

<h2>Cookies a sledovanie</h2>
<p>Tento web nenastavuje žiadne cookies a neukladá nič do vášho zariadenia. Nemáme analytiku, reklamné ani sledovacie skripty, a preto tu nenájdete ani lištu so súhlasom.</p>
<p>Písma sú uložené na našom serveri. Pri otvorení stránky tak váš prehliadač nekomunikuje so žiadnou treťou stranou.</p>

<h2>Vaše práva</h2>
<p>Máte právo na prístup k svojim údajom, na ich opravu, vymazanie, obmedzenie spracúvania a prenosnosť, a právo namietať proti spracúvaniu. Stačí nám napísať na ${mail} a vybavíme to bez zbytočného odkladu.</p>
<p>Ak si myslíte, že s vašimi údajmi nakladáme nesprávne, môžete podať sťažnosť na Úrad na ochranu osobných údajov Slovenskej republiky, Hraničná 12, 820 07 Bratislava.</p>

<h2>Zmeny tohto dokumentu</h2>
<p>Ak sa zmení to, ako web funguje, napríklad by pribudla analytika alebo ďalší nástroj, upravíme aj tento dokument a zmeníme dátum na jeho začiatku.</p>
</article>`;
  return page;
}
