// node --test src/lib/enquiry.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { handleEnquiry, validate } from "./enquiry.js";

const URL_ = "https://aquashield.eu/api/dopyt";
const good = { meno: "Ján Novák", telefon: "+421 900 123 456", email: "jan@example.sk", obec: "Banská Bystrica", praca: "plocha-strecha", plocha: "240", sprava: "Zateká pri atike.", zateka: "ano" };
const form = (fields) => new URLSearchParams(fields).toString();
const post = (body, { json = true, type = "application/x-www-form-urlencoded", ip = "203.0.113.7" } = {}) =>
  new Request(URL_, { method: "POST", headers: { "Content-Type": type, Accept: json ? "application/json" : "text/html", "CF-Connecting-IP": ip }, body });

function fakeKV() {
  const m = new Map();
  return { m, get: async (k) => (m.has(k) ? m.get(k).v : null), put: async (k, v, o) => { m.set(k, { v, o }); } };
}

test("only POST", async () => {
  const r = await handleEnquiry(new Request(URL_), {});
  assert.equal(r.status, 405);
});

test("rejects other content types", async () => {
  const r = await handleEnquiry(post(JSON.stringify(good), { type: "application/json" }), { preview: true });
  assert.equal(r.status, 415);
});

test("rejects an oversized body", async () => {
  const r = await handleEnquiry(post(form({ ...good, sprava: "x".repeat(9000) })), { preview: true });
  assert.equal(r.status, 413);
});

test("honeypot gets a quiet yes and nothing is stored", async () => {
  const kv = fakeKV();
  const r = await handleEnquiry(post(form({ ...good, web: "http://spam" })), { DOPYTY: kv });
  assert.equal(r.status, 200);
  assert.equal(kv.m.size, 0);
});

test("reports each invalid field", async () => {
  const r = await handleEnquiry(post(form({ meno: "J", telefon: "abc", email: "nope", obec: "", praca: "x", plocha: "12.5" })), { preview: true });
  assert.equal(r.status, 400);
  const data = await r.json();
  assert.deepEqual(Object.keys(data.errors).sort(), ["email", "meno", "obec", "plocha", "praca", "telefon"]);
});

test("plain form post is redirected to the thank-you page", async () => {
  const r = await handleEnquiry(post(form(good), { json: false }), { preview: true });
  assert.equal(r.status, 303);
  assert.equal(new URL(r.headers.get("Location")).pathname, "/kontakt/odoslane/");
});

test("stores the enquiry for 180 days and keeps only a hash of the address", async () => {
  const kv = fakeKV();
  const r = await handleEnquiry(post(form(good)), { DOPYTY: kv });
  assert.equal(r.status, 200);
  const keys = [...kv.m.keys()];
  const enquiry = keys.find((k) => k.startsWith("dopyt:"));
  assert.ok(enquiry);
  assert.equal(kv.m.get(enquiry).o.expirationTtl, 180 * 24 * 3600);
  const stored = JSON.parse(kv.m.get(enquiry).v);
  assert.equal(stored.obec, "Banská Bystrica");
  assert.equal(stored.zateka, true);
  assert.ok(!JSON.stringify([...kv.m]).includes("203.0.113.7"), "the IP address itself must not be stored");
});

test("limits enquiries from one address", async () => {
  const kv = fakeKV();
  for (let i = 0; i < 5; i++) assert.equal((await handleEnquiry(post(form(good)), { DOPYTY: kv })).status, 200);
  assert.equal((await handleEnquiry(post(form(good)), { DOPYTY: kv })).status, 429);
  assert.equal((await handleEnquiry(post(form(good), { ip: "198.51.100.1" }), { DOPYTY: kv })).status, 200);
});

test("says so when nothing could be stored or sent", async () => {
  const r = await handleEnquiry(post(form(good)), {});
  assert.equal(r.status, 503);
});

test("strips control characters and keeps line breaks only in the message", () => {
  const { values } = validate(new URLSearchParams({ ...good, meno: "Ján\u0000\nNovák", sprava: "riadok 1\nriadok 2\u0007" }));
  assert.equal(values.meno, "Ján Novák");
  assert.equal(values.sprava, "riadok 1\nriadok 2");
});

test("refuses a post sent from another site", async () => {
  const req = (origin) => new Request(URL_, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", Origin: origin }, body: form(good) });
  assert.equal((await handleEnquiry(req("https://evil.example"), { preview: true })).status, 403);
  assert.equal((await handleEnquiry(req("null"), { preview: true })).status, 403);
  assert.equal((await handleEnquiry(req("https://aquashield.eu"), { preview: true })).status, 200);
  assert.equal((await handleEnquiry(req("https://www.aquashield.eu"), { preview: true })).status, 200);
});

test("an unreadable rate counter does not lose the enquiry", async () => {
  const kv = fakeKV();
  const broken = { ...kv, get: async () => { throw new Error("KV down"); } };
  const r = await handleEnquiry(post(form(good)), { DOPYTY: broken });
  assert.equal(r.status, 200);
  assert.ok([...kv.m.keys()].some((k) => k.startsWith("dopyt:")));
});

test("Worker responses carry their own security headers", async () => {
  const r = await handleEnquiry(post(form({ ...good, meno: "" }), { json: false }), { preview: true });
  assert.match(r.headers.get("Content-Security-Policy"), /frame-ancestors 'none'/);
  assert.equal(r.headers.get("X-Frame-Options"), "DENY");
});
