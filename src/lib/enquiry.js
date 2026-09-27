// The enquiry form's endpoint, POST /api/dopyt. Shared by the Worker (which
// passes its bindings as `env`) and the local preview server (env.preview,
// where nothing is stored or sent).
//
// Order of work, as on voidsolutions.eu: validate, store in KV first so a
// mail outage cannot lose a lead, then notify by e-mail. The answer is a 303
// to the thank-you page for a plain form post, or JSON for the page script.

export const WORK_TYPES = {
  "plocha-strecha": "Plochá strecha",
  "zateplenie": "Zateplenie strechy",
  "zelena-strecha": "Zelená strecha",
  "terasa-balkon": "Terasa alebo balkón",
  "spodna-stavba": "Spodná stavba",
  "subdodavka": "Subdodávka pre stavebnú firmu",
  "ine": "Iné",
};

const MAX_BODY = 8 * 1024;
const KEEP_SECONDS = 180 * 24 * 3600; // retention promised in the privacy policy
const RATE_LIMIT = 5; // enquiries per address per hour

// The site's _headers do not reach Worker responses, so the essentials are
// repeated here. The only HTML the Worker writes is the plain error page,
// which needs its inline styles and nothing else.
const BASE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Robots-Tag": "noindex",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  "X-Frame-Options": "DENY",
};

// Control characters out, whitespace tidied; newlines survive only in the message.
function clean(value, multiline = false) {
  const s = String(value ?? "").replace(multiline ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, " ");
  return multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim() : s.replace(/\s+/g, " ").trim();
}

export function validate(form) {
  const v = {
    meno: clean(form.get("meno")),
    telefon: clean(form.get("telefon")),
    email: clean(form.get("email")),
    obec: clean(form.get("obec")),
    praca: clean(form.get("praca")),
    plocha: clean(form.get("plocha")),
    sprava: clean(form.get("sprava"), true),
    zateka: form.get("zateka") === "ano",
  };
  const errors = {};
  if (v.meno.length < 2 || v.meno.length > 100) errors.meno = "Napíšte, prosím, svoje meno.";
  const digits = v.telefon.replace(/\D/g, "");
  if (!/^[+\d\s()/.-]+$/.test(v.telefon) || digits.length < 9 || digits.length > 15) errors.telefon = "Zadajte telefónne číslo, na ktorom vás zastihneme.";
  if (v.email && (v.email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))) errors.email = "Táto e-mailová adresa nevyzerá správne.";
  if (v.obec.length < 2 || v.obec.length > 80) errors.obec = "Napíšte obec alebo mesto, kde je stavba.";
  if (v.praca && !Object.hasOwn(WORK_TYPES, v.praca)) errors.praca = "Vyberte jednu z možností.";
  if (v.plocha && !/^\d{1,7}$/.test(v.plocha)) errors.plocha = "Plochu zadajte ako celé číslo v metroch štvorcových.";
  if (v.sprava.length > 3000) errors.sprava = "Správa je príliš dlhá, skráťte ju, prosím, na 3000 znakov.";
  return { values: v, errors };
}

async function readCapped(request, limit) {
  const declared = Number(request.headers.get("Content-Length"));
  if (declared > limit) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) { bytes.set(c, off); off += c.byteLength; }
  return new TextDecoder().decode(bytes);
}

const wantsJson = (request) => (request.headers.get("Accept") || "").includes("application/json");

function json(status, data, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...BASE_HEADERS, "Content-Type": "application/json; charset=utf-8", ...extra } });
}

function page(status, title, text) {
  const html = `<!doctype html><html lang="sk"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>`
    + `<body style="font:18px/1.6 system-ui,sans-serif;max-width:36em;margin:10vh auto;padding:0 20px;color:#14283b;background:#ecf0f2">`
    + `<h1 style="font-size:1.6em;line-height:1.2">${title}</h1>${text}<p><a href="/kontakt/#dopyt">Späť na formulár</a></p></body></html>`;
  return new Response(html, { status, headers: { ...BASE_HEADERS, "Content-Type": "text/html; charset=utf-8" } });
}

function failure(request, status, message, errors) {
  if (wantsJson(request)) return json(status, { ok: false, message, errors: errors || {} });
  const list = errors ? `<ul>${Object.values(errors).map((e) => `<li>${e}</li>`).join("")}</ul>` : "";
  return page(status, "Dopyt sa nepodarilo odoslať", `<p>${message}</p>${list}`);
}

function success(request) {
  if (wantsJson(request)) return json(200, { ok: true });
  const to = new URL("/kontakt/odoslane/", request.url);
  return new Response(null, { status: 303, headers: { ...BASE_HEADERS, Location: to.toString() } });
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Browsers say where a form post comes from. One from another site (a hidden
// form posting here on its visitors' behalf) is refused; www and the bare
// domain count as the same site. No Origin at all means a script or an old
// browser, which the other checks handle; "null" means a sandboxed page.
function foreign(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  if (origin === "null") return true;
  const host = (h) => h.replace(/^www\./, "");
  try { return host(new URL(origin).hostname) !== host(new URL(request.url).hostname); } catch { return true; }
}

async function rateLimited(env, request) {
  if (!env.DOPYTY) return false;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  // The address itself is never stored, only a hash of it, and only for an hour.
  const key = `limit:${(await sha256(ip + ":aquashield")).slice(0, 32)}`;
  const count = Number(await env.DOPYTY.get(key)) || 0;
  if (count >= RATE_LIMIT) return true;
  await env.DOPYTY.put(key, String(count + 1), { expirationTtl: 3600 });
  return false;
}

function mailText(v, when) {
  return [
    `Nový dopyt z webu, ${when}`,
    "",
    `Meno: ${v.meno}`,
    `Telefón: ${v.telefon}`,
    `E-mail: ${v.email || "neuvedený"}`,
    `Stavba: ${v.obec}`,
    `Práca: ${v.praca ? WORK_TYPES[v.praca] : "neuvedená"}`,
    `Plocha: ${v.plocha ? v.plocha + " m²" : "neuvedená"}`,
    `Momentálne zateká: ${v.zateka ? "áno" : "nie"}`,
    "",
    v.sprava || "(bez správy)",
  ].join("\n");
}

async function notify(env, v, when) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_TO || !env.NOTIFY_FROM) return false;
  const subject = `Dopyt z webu: ${v.praca ? WORK_TYPES[v.praca].toLowerCase() : "hydroizolácia"}, ${v.obec}${v.zateka ? " (zateká)" : ""}`;
  const body = { from: env.NOTIFY_FROM, to: [env.NOTIFY_TO], subject, text: mailText(v, when) };
  if (v.email) body.reply_to = v.email;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.ok;
}

export async function handleEnquiry(request, env = {}) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { ...BASE_HEADERS, Allow: "POST" } });
  if (foreign(request)) return failure(request, 403, "Dopyt je možné poslať len z formulára na našom webe.");
  const type = (request.headers.get("Content-Type") || "").toLowerCase();
  if (!type.startsWith("application/x-www-form-urlencoded")) return failure(request, 415, "Formulár prišiel v nečakanom formáte.");

  const raw = await readCapped(request, MAX_BODY);
  if (raw === null) return failure(request, 413, "Správa je príliš dlhá.");
  const form = new URLSearchParams(raw);

  // A field people never see. Bots fill it in; they get a polite yes and nothing happens.
  if (clean(form.get("web"))) return success(request);

  const { values, errors } = validate(form);
  if (Object.keys(errors).length) return failure(request, 400, "Skontrolujte, prosím, vyznačené polia.", errors);
  if (env.preview) return success(request);

  // If the counter cannot be read, the enquiry still goes through: a lost
  // lead costs more than a few extra messages.
  let limited = false;
  try { limited = await rateLimited(env, request); } catch { /* counter unavailable */ }
  if (limited) return failure(request, 429, "Z tohto pripojenia prišlo v poslednej hodine veľa dopytov. Skúste to neskôr alebo nám zavolajte.");

  const when = new Date().toISOString();
  let stored = false, mailed = false;
  try {
    if (env.DOPYTY) {
      await env.DOPYTY.put(`dopyt:${when}:${crypto.randomUUID()}`, JSON.stringify({ ...values, received: when }), { expirationTtl: KEEP_SECONDS });
      stored = true;
    }
  } catch { /* fall through to e-mail */ }
  try {
    mailed = await notify(env, values, when);
  } catch { /* stored is enough */ }

  if (!stored && !mailed) return failure(request, 503, "Dopyt sa teraz nepodarilo uložiť. Zavolajte nám, prosím, alebo to skúste o chvíľu znova.");
  return success(request);
}
