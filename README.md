# AquaShield web

Web firmy AQUASHIELD s. r. o.: hydroizolácie plochých striech, terás a balkónov, zelené strechy, zateplenie striech a izolácie spodnej stavby.

Celý web je postavený na jednom stavebnom reze budovou (`src/drawings/building.mjs`, jednotky sú centimetre, každá vrstva má skutočnú hrúbku). Na úvode na rez prší. Pri skrolovaní služieb kamera schádza po tom istom reze od strechy po základy a každá služba má vlastný detail s popísanými vrstvami.

## Príkazy

| Príkaz | Čo robí |
|---|---|
| `npm install` | stiahne písmo a wrangler (raz) |
| `npm run preview` | náhľadový build + lokálny server na http://localhost:8100/ (chýbajúce kontakty nahradí zástupnými údajmi a vypíše, čo chýba) |
| `npm test` | testy formulára (validácia, antispam, limit dopytov) |
| `npm run images` | vyrenderuje `static/og.png`, favikony a logo cez headless Edge (spustiť po builde) |
| `npm run dev` | skutočný Cloudflare Worker lokálne, vrátane formulára |
| `npm run deploy` | produkčný build + nasadenie na Cloudflare |

## Pred prvým nasadením

Produkčný build **odmietne prejsť**, kým nie je doplnené toto. Je to zámer, aby sa na web nedostalo vymyslené číslo:

1. `site.config.mjs`: `phone`, `email`, a keď je doména kúpená a nasmerovaná, `domainConfirmed: true` (prípadne iná `url`).
2. `npm run images`: vytvorí OG obrázok a ikony v `static/`.
3. Cloudflare:
   - `npx wrangler kv namespace create DOPYTY`, id vložiť do `wrangler.jsonc`
   - v `wrangler.jsonc` vyplniť `NOTIFY_TO` (kam chodia dopyty) a `NOTIFY_FROM` (overená adresa v Resend)
   - `npx wrangler secret put RESEND_API_KEY`
   - odkomentovať `routes` s doménou
   - pravidlá presmerovania www → bez www a http → https (ako pri voidsolutions.eu)

## Referencie (mapa stavieb)

Stavby sú v `referencie.mjs` v koreni projektu, návod na polia je priamo v súbore. Fotky patria do `static/referencie/`. Mapa je na stránke /referencie/ a v sekcii „Kde sme pracovali“ na úvode.

Fotky môžu byť len vlastné alebo so súhlasom autora (cudzia fotka dostane `credit`, zobrazí sa ako „Foto: …“); obrázky z Google sa použiť nesmú. Meno objednávateľa (`client`) len s jeho súhlasom.

Zatiaľ sú tam len ukážkové stavby (`sample: true`). Náhľad ich zobrazí, produkčný build s nimi **neprejde**, kým ich nenahradia skutočné.

Obrysy krajín sú z Natural Earth (voľné dielo) a sú uložené v `src/drawings/map-data.mjs`. Web nič nesťahuje z cudzích serverov. Nové obrysy (napr. iný výrez mapy) vygeneruje `node tools/map.mjs`.

## Štruktúra

- `site.config.mjs`: údaje o firme na jednom mieste
- `src/pages/*.mjs`: obsah stránok, `src/lib/layout.mjs`: hlavička, menu a pätička (raz pre všetky stránky)
- `src/drawings/`: kresba budovy, detaily a výrezy pre kameru
- `src/client/`: CSS a JavaScript pre prehliadač
- `src/lib/enquiry.js`: formulár (uloží dopyt do KV na 180 dní, potom pošle e-mail cez Resend)
- `src/worker.js`: Worker, ktorý rieši len `/api/dopyt`, všetko ostatné sú statické súbory

## Pravidlá, ktoré build kontroluje

- žiadne pomlčky (– —) v texte
- práve jeden `h1` na stránke
- každý interný odkaz vedie na existujúcu stránku, žiadne duplicitné `id`
- v produkcii žiadne chýbajúce kontakty ani obrázky

Web nenastavuje cookies, nemá analytiku a písmo je na vlastnej doméne, preto nemá lištu so súhlasom. Ak by pribudla analytika alebo iný externý nástroj, treba upraviť aj stránku Ochrana osobných údajov a `_headers` (CSP).
