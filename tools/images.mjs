// Renders the site's raster images into static/ with headless Microsoft Edge:
// the Open Graph picture (1200 x 630), the favicons and the square logo used
// in structured data. Run after a build, because it borrows the built CSS:
//
//   npm run build -- --preview && node tools/images.mjs
//
// Needs Edge at the usual Windows path (EDGE env var overrides it).

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { artDefs } from "../src/drawings/views.mjs";
import { VIEW } from "../src/drawings/building.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "static");
const EDGE = process.env.EDGE || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The built stylesheet, with its font URLs pointed at the files on disk.
const assets = path.join(ROOT, "dist", "assets");
const cssFile = fs.readdirSync(assets).find((f) => /^style\..+\.css$/.test(f));
if (!cssFile) throw new Error("build the site first: no dist/assets/style.*.css");
const css = fs.readFileSync(path.join(assets, cssFile), "utf8").replace(/url\(\/assets\/([^)]+)\)/g, (_, f) => `url(${pathToFileURL(path.join(assets, f)).href})`);

const MARK = `<svg viewBox="0 0 32 32"><path d="M2 5h6v18h16V5h6v24H2z" fill="#14283b"/><path d="M9.6 5v16.4h12.8V5" fill="none" stroke="#cf3a2b" stroke-width="3.2"/></svg>`;

const page = (w, h, body, extra = "") => `<!doctype html><meta charset="utf-8"><style>${css}
html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:#ecf0f2}${extra}</style>${body}`;

const V = VIEW;
const og = page(1200, 630, `<div class="og">
<div class="og-brand">${MARK}<span>AQUASHIELD</span></div>
<p class="og-h">Hydroizolácie<br>od strechy<br>po základy</p>
<p class="og-sub">Ploché strechy, terasy, zelené strechy, zateplenie a spodná stavba. Obhliadka zdarma. Slovensko, Česko a Nemecko.</p>
<svg class="og-dwg" viewBox="${V.x + 700} ${V.y} ${V.w - 700} ${V.h}">${artDefs()}<use href="#bldg-art"/><use href="#bldg-mem"/></svg>
</div>`, `
.og{position:relative;width:1200px;height:630px}
.og-brand{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:14px;font:780 26px/1 "Mona Sans";font-stretch:116%;letter-spacing:.05em;color:#14283b}
.og-brand svg{width:40px;height:40px}
.og-h{position:absolute;left:62px;top:132px;margin:0;font:800 74px/.98 "Mona Sans";font-stretch:118%;letter-spacing:-.022em;color:#14283b}
.og-sub{position:absolute;left:64px;top:410px;width:470px;margin:0;font:400 22px/1.45 "Mona Sans";font-stretch:105%;color:#44586a}
.og-dwg{position:absolute;right:-10px;bottom:-60px;width:720px;height:auto}`);

const icon = (size, pad) => page(size, size, `<div class="ic">${MARK}</div>`, `
.ic{width:${size}px;height:${size}px;display:grid;place-items:center}
.ic svg{width:${size - pad * 2}px;height:${size - pad * 2}px}`);

const jobs = [
  ["og.png", 1200, 630, og],
  ["favicon-48.png", 48, 48, icon(48, 2)],
  ["apple-touch-icon.png", 180, 180, icon(180, 26)],
  ["logo-512.png", 512, 512, icon(512, 56)],
];

// ------------------------------------------------------------------ Edge over CDP

const port = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "aqua-edge-"));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--no-first-run", "--hide-scrollbars", "--force-color-profile=srgb", "about:blank"], { stdio: "ignore" });

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()).webSocketDebuggerUrl; } catch { await sleep(250); }
}
if (!wsUrl) { edge.kill(); throw new Error("Edge did not start"); }
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
});
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

try {
  for (const [name, w, h, html] of jobs) {
    const file = path.join(profile, name + ".html");
    fs.writeFileSync(file, html);
    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false }, sessionId);
    await send("Page.navigate", { url: pathToFileURL(file).href }, sessionId);
    await sleep(1200); // fonts from disk, no network: this is plenty
    const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: w, height: h, scale: 1 } }, sessionId);
    fs.writeFileSync(path.join(OUT, name), Buffer.from(shot.data, "base64"));
    await send("Target.closeTarget", { targetId });
    console.log("wrote static/" + name);
  }
} finally {
  ws.close();
  edge.kill();
  await sleep(300);
  fs.rmSync(profile, { recursive: true, force: true });
}
