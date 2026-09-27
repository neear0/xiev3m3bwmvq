// Everything that identifies the company, in one place.
//
// A value left as null is not known yet. `npm run preview` shows a stand-in
// value (PLACEHOLDER below) and names the gap in its output; the production
// build (the one `wrangler deploy` runs) stops with an error instead, so a
// made-up phone number can never reach the live site.

export const SITE = {
  // Chosen by the owner on 2026-09-26. On that day the domain was already
  // registered through Romarg Srl (registrant not public in WHOIS): set
  // domainConfirmed once it is certain the domain is ours and points here.
  url: "https://aquashield.eu",
  domainConfirmed: false,

  name: "AquaShield",
  legalName: "AQUASHIELD s. r. o.",

  phone: null, // "+421 9xx xxx xxx", shown exactly as written
  email: null, // "info@aquashield.eu"

  address: {
    street: "Ul. Námestie SNP 703/2",
    postalCode: "966 81",
    city: "Žarnovica",
    country: "SK",
  },
  ico: "52 880 516",
  dic: null, // "2121234567", shown on the legal page once known
  icDph: null, // "SK2121234567", only if the company is a VAT payer
  register: "Obchodný register Okresného súdu Banská Bystrica, oddiel Sro, vložka č. 38054/S",
  registerShort: "Okresný súd Banská Bystrica, oddiel Sro, vložka č. 38054/S", // under the label "Obchodný register"

  // Where the company takes jobs (owner, 2026-09-27): Slovakia, Czechia and Germany.
  area: "Pracujeme na Slovensku, v Česku a v Nemecku",
  countries: ["Slovensko", "Česko", "Nemecko"],

  warrantyYears: 10, // "štandardne 10 rokov" from the company's own brief
};

export const PLACEHOLDER = {
  phone: "+421 000 000 000",
  email: "info@aquashield.eu",
};
