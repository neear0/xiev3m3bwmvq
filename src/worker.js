// The only dynamic part of the site: the enquiry form.
//
// Every page is a static asset that Cloudflare serves without running this
// Worker. A request reaches `fetch` only when no asset matches, which in
// practice means POST /api/dopyt or a 404.

import { handleEnquiry } from "./lib/enquiry.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/dopyt") return handleEnquiry(request, env);
    return env.ASSETS.fetch(request);
  },
};
