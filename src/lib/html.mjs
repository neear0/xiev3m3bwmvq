import { SITE, PLACEHOLDER } from "../../site.config.mjs";

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Set by the build: `preview` for `npm run preview` and the GitHub Pages
// preview, `pages` and `base` (the site's folder, "/repo") for the latter.
export const MODE = { preview: false, pages: false, base: "" };

// Missing contact details: flagged in a preview, fatal in production.
export const missing = new Set();

function contact(key) {
  if (SITE[key]) return { value: SITE[key], todo: false };
  missing.add(key);
  return { value: PLACEHOLDER[key], todo: true };
}

const todoAttr = (todo) => (todo ? ' data-todo="doplniť"' : "");

export function phone() {
  const { value, todo } = contact("phone");
  return { text: value, href: "tel:" + value.replace(/[^+\d]/g, ""), attr: todoAttr(todo) };
}

export function email() {
  const { value, todo } = contact("email");
  return { text: value, href: "mailto:" + value, attr: todoAttr(todo) };
}

export const abs = (path) => SITE.url.replace(/\/$/, "") + path;
