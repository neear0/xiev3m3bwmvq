// Page addresses and names, used by the navigation, the footer, the sitemap
// and the internal-link check in the build. Services are listed in the order
// water meets a building: from the roof down to the foundations.

export const SERVICES = [
  { key: "roof", path: "/hydroizolacia-plochej-strechy/", nav: "Ploché strechy", name: "Hydroizolácia plochej strechy" },
  { key: "insulation", path: "/zateplenie-plochej-strechy/", nav: "Zateplenie", name: "Zateplenie plochej strechy" },
  { key: "green", path: "/zelene-strechy/", nav: "Zelené strechy", name: "Zelené strechy" },
  { key: "terrace", path: "/hydroizolacia-terasy-a-balkona/", nav: "Terasy a balkóny", name: "Hydroizolácia terasy a balkóna" },
  { key: "base", path: "/hydroizolacia-spodnej-stavby/", nav: "Spodná stavba", name: "Hydroizolácia spodnej stavby" },
];

export const PATHS = {
  home: "/",
  materials: "/hydroizolacne-folie/",
  b2b: "/pre-stavebne-firmy/",
  references: "/referencie/",
  contact: "/kontakt/",
  sent: "/kontakt/odoslane/",
  privacy: "/ochrana-osobnych-udajov/",
  legal: "/pravne-informacie/",
  accessibility: "/vyhlasenie-o-pristupnosti/",
};

export const service = (key) => SERVICES.find((s) => s.key === key);

export const MAIN_NAV = [
  ...SERVICES.map((s) => ({ path: s.path, label: s.nav })),
  { path: PATHS.materials, label: "Materiály" },
  { path: PATHS.b2b, label: "Pre firmy" },
  { path: PATHS.references, label: "Referencie" },
];
