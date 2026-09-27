// Structured data. Contact details are included only when they are real:
// a placeholder must never end up in what search engines store.

import { SITE } from "../../site.config.mjs";
import { abs } from "./html.mjs";
import { SERVICES } from "./nav.mjs";

const ORG = abs("/#organization");
const AREA = SITE.countries.map((name) => ({ "@type": "Country", name }));

export const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export function organization() {
  const o = {
    "@type": "RoofingContractor",
    "@id": ORG,
    name: SITE.name,
    legalName: SITE.legalName,
    url: abs("/"),
    logo: abs("/logo-512.png"),
    image: abs("/og.png"),
    description: "Hydroizolácie plochých striech, terás a balkónov, zelené strechy, zateplenie striech a izolácie spodnej stavby proti vode a radónu na Slovensku, v Česku a v Nemecku.",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.city,
      addressCountry: SITE.address.country,
    },
    areaServed: AREA,
    identifier: { "@type": "PropertyValue", propertyID: "IČO", value: SITE.ico.replace(/\s/g, "") },
    knowsAbout: [
      "Hydroizolácia plochých striech", "Mechanicky kotvené strešné systémy", "Lepené strešné systémy",
      "Priťažené strešné systémy", "Zelené strechy", "Zateplenie plochých striech",
      "Hydroizolácia terás a balkónov", "Hydroizolácia spodnej stavby", "Ochrana proti radónu",
      "PVC-P fólie", "TPO a FPO fólie",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Služby",
      itemListElement: SERVICES.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, url: abs(s.path) } })),
    },
  };
  if (SITE.phone) o.telephone = SITE.phone;
  if (SITE.email) o.email = SITE.email;
  return o;
}

export function website() {
  return { "@type": "WebSite", "@id": abs("/#website"), url: abs("/"), name: SITE.name, inLanguage: "sk-SK", publisher: { "@id": ORG } };
}

export function webpage(page) {
  const url = abs(page.path);
  const w = {
    "@type": page.pageType ?? "WebPage",
    "@id": url + "#webpage",
    url,
    name: page.title,
    description: page.description,
    isPartOf: { "@id": abs("/#website") },
    about: { "@id": ORG },
    inLanguage: "sk-SK",
  };
  if (page.crumbs) w.breadcrumb = { "@id": url + "#breadcrumb" };
  return w;
}

export function breadcrumbs(page) {
  const items = [{ name: "Úvod", path: "/" }, ...page.crumbs];
  return {
    "@type": "BreadcrumbList",
    "@id": abs(page.path) + "#breadcrumb",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

export function service(page, { name, serviceType, description }) {
  return {
    "@type": "Service",
    "@id": abs(page.path) + "#service",
    name,
    serviceType,
    description,
    url: abs(page.path),
    provider: { "@id": ORG },
    areaServed: AREA,
  };
}

export function faqPage(page, items) {
  return {
    "@type": "FAQPage",
    "@id": abs(page.path) + "#faq",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: plain(it.a) } })),
  };
}
