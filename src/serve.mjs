// Local preview of dist/, served the way Cloudflare serves it: clean URLs with
// a trailing slash, the 404 page for unknown paths, and the headers from
// dist/_headers (so a Content-Security-Policy mistake shows up here first).
//
// POST /api/dopyt is answered by the same validation the Worker uses, but
// nothing is stored or sent. `npm run dev` runs the real Worker instead.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleEnquiry } from "./lib/enquiry.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = Number(process.env.PORT) || 8100;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".json": "application/json",
};

function headerRules() {
  const file = path.join(ROOT, "_headers");
  if (!fs.existsSync(file)) return [];
  const rules = [];
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) rules.push({ pattern: line.trim(), headers: {} });
    else {
      const i = line.indexOf(":");
      rules[rules.length - 1].headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return rules;
}

function matches(pattern, url) {
  const re = new RegExp("^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
  return re.test(url);
}

function send(res, status, body, type, url) {
  const headers = { "Content-Type": type };
  for (const r of headerRules()) if (matches(r.pattern, url)) Object.assign(headers, r.headers);
  delete headers["Strict-Transport-Security"]; // meaningless over http://localhost
  headers["Content-Security-Policy"] = (headers["Content-Security-Policy"] || "").replace("; upgrade-insecure-requests", "");
  res.writeHead(status, headers);
  res.end(body);
}

// Listens on this computer only: the preview is not meant for the rest of the network.
http.createServer((req, res) => {
  serve(req, res).catch((e) => {
    console.error(e);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("server error");
  });
}).listen(PORT, "127.0.0.1", () => console.log(`preview: http://localhost:${PORT}/`));

async function serve(req, res) {
  // The real host, so the form's same-site check sees what the browser sent.
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/api/dopyt") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(url, { method: req.method, headers: req.headers, body: req.method === "POST" ? Buffer.concat(chunks) : undefined });
    const r = await handleEnquiry(request, { preview: true });
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
    return;
  }
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, "bad path", "text/plain", "/"); }
  let file = path.join(ROOT, p);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return send(res, 400, "bad path", "text/plain", p);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!p.endsWith("/")) { res.writeHead(307, { Location: p + "/" + url.search }); return res.end(); }
    file = path.join(file, "index.html");
  } else if (!fs.existsSync(file) && fs.existsSync(file + ".html")) {
    file += ".html";
  }
  if (!fs.existsSync(file) || path.basename(file) === "_headers") {
    return send(res, 404, fs.readFileSync(path.join(ROOT, "404.html")), TYPES[".html"], p);
  }
  send(res, 200, fs.readFileSync(file), TYPES[path.extname(file)] || "application/octet-stream", p);
}
